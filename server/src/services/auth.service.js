import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { generateRefreshToken, hashToken } from '../utils/tokens.js';

const BCRYPT_ROUNDS = 12;
// Hash giả: khi email không tồn tại vẫn chạy bcrypt.compare → thời gian phản hồi như nhau,
// kẻ tấn công không đo được email nào đã đăng ký.
const DUMMY_HASH = bcrypt.hashSync('bali-home-timing-safe-dummy', BCRYPT_ROUNDS);
// 2 tab cùng refresh 1 lúc → request thứ 2 thấy token vừa bị thu hồi. Trong khoảng này
// coi là "đua" bình thường, không phải bị đánh cắp.
const REUSE_GRACE_MS = 30_000;
const DAY = 24 * 60 * 60 * 1000;

const invalidSession = () => new AppError(401, 'INVALID_SESSION', 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.');

/** Chỉ trả ra các trường an toàn (không bao giờ lộ passwordHash) */
export const toPublicUser = (u) => ({
  id: u.id,
  email: u.email,
  fullName: u.fullName,
  phone: u.phone,
  role: u.role,
  hasPassword: Boolean(u.passwordHash), // false: tài khoản Google chưa đặt mật khẩu → trang Bảo mật cho đặt mới
  hasGoogle: Boolean(u.googleId),
  lastLoginAt: u.lastLoginAt,
  createdAt: u.createdAt,
});

const PRISMA_UNIQUE_VIOLATION = 'P2002';
const MIN_NAME_LENGTH = 2;

/** Họ tên cho tài khoản mới từ Google: tên Google, không có thì lấy phần trước @ của email */
const nameFromGoogle = ({ name, email }) => {
  const candidate = (name || email.split('@')[0]).slice(0, 100);
  return candidate.length >= MIN_NAME_LENGTH ? candidate : email.slice(0, 100);
};

/**
 * Đăng nhập bằng Google (thông tin đã được lib/googleIdToken.js xác minh).
 * 1. Đã liên kết (googleId) → đăng nhập.
 * 2. Chưa liên kết nhưng trùng email → liên kết vào tài khoản đó. Google đã chứng minh người này
 *    sở hữu email, còn lúc đăng ký bằng mật khẩu thì email chưa từng được xác minh: có thể ai đó đã
 *    đăng ký trước bằng email của họ. Vì vậy xoá mật khẩu cũ + thu hồi mọi phiên → kẻ đăng ký trước
 *    (nếu có) mất quyền vào. Chủ email đặt lại mật khẩu trong trang Bảo mật nếu muốn.
 * 3. Chưa có → tạo tài khoản mới, chưa có mật khẩu.
 */
export async function signInWithGoogle({ sub, email, name }) {
  const lastLoginAt = new Date();
  const linked = await prisma.user.findUnique({ where: { googleId: sub } });
  if (linked) return prisma.user.update({ where: { id: linked.id }, data: { lastLoginAt } });

  const sameEmail = await prisma.user.findUnique({ where: { email } });
  if (sameEmail) {
    const mismatch = () => new AppError(409, 'GOOGLE_ACCOUNT_MISMATCH', 'Email này đã liên kết với một tài khoản Google khác.');
    if (sameEmail.googleId) throw mismatch();
    // Điều kiện googleId: null → nếu request khác vừa liên kết xong thì không ghi đè
    const [{ count }] = await prisma.$transaction(async (tx) => {
      const linked = await tx.user.updateMany({ where: { id: sameEmail.id, googleId: null }, data: { googleId: sub, passwordHash: null, lastLoginAt } });
      if (linked.count === 1) await tx.session.updateMany({ where: { userId: sameEmail.id, revokedAt: null }, data: { revokedAt: lastLoginAt } });
      return [linked];
    });
    const user = await prisma.user.findUnique({ where: { id: sameEmail.id } });
    if (count === 0 && user?.googleId !== sub) throw mismatch();
    return user;
  }

  try {
    return await prisma.user.create({ data: { email, googleId: sub, fullName: nameFromGoogle({ name, email }), lastLoginAt } });
  } catch (err) {
    // Bấm đúp / 2 tab cùng lúc: request kia vừa tạo xong → dùng lại tài khoản đó
    if (err.code !== PRISMA_UNIQUE_VIOLATION) throw err;
    const created = await prisma.user.findUnique({ where: { googleId: sub } });
    if (!created) throw err;
    return created;
  }
}

export async function registerUser({ fullName, email, phone, password }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    select: { email: true, phone: true },
  });
  if (existing) {
    const fields = {};
    if (existing.email === email) fields.email = 'Email này đã được đăng ký';
    if (phone && existing.phone === phone) fields.phone = 'Số điện thoại này đã được đăng ký';
    throw new AppError(409, 'ACCOUNT_EXISTS', 'Tài khoản đã tồn tại.', fields);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return prisma.user.create({
    data: { fullName, email, phone, passwordHash, lastLoginAt: new Date() },
  });
}

export async function verifyCredentials({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    // Không nói rõ sai email hay sai mật khẩu
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.');
  }
  return prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
}

/** Tạo session mới, trả về refresh token dạng gốc (chỉ xuất hiện 1 lần, trong cookie) */
export async function createSession(userId, { persistent, userAgent, ip }) {
  const refreshToken = generateRefreshToken();
  const days = persistent ? env.REFRESH_TOKEN_REMEMBER_DAYS : env.REFRESH_TOKEN_TTL_DAYS;
  const expiresAt = new Date(Date.now() + days * DAY);
  await prisma.session.create({
    data: { userId, tokenHash: hashToken(refreshToken), persistent, userAgent, ip, expiresAt },
  });
  return { refreshToken, expiresAt, persistent };
}

/**
 * Xoay vòng refresh token: thu hồi token cũ, cấp token mới.
 * Nếu token ĐÃ bị thu hồi mà vẫn được dùng lại → nghi bị đánh cắp → thu hồi mọi session của user.
 */
export async function rotateSession(refreshToken, meta) {
  if (!refreshToken) throw invalidSession();

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: { user: true },
  });
  if (!session) throw invalidSession();

  if (session.revokedAt) {
    if (Date.now() - session.revokedAt.getTime() > REUSE_GRACE_MS) {
      await prisma.session.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    throw invalidSession();
  }
  if (session.expiresAt < new Date()) throw invalidSession();

  // Thu hồi có điều kiện (revokedAt: null) → nếu 2 request đua nhau, chỉ 1 cái thắng
  const { count } = await prisma.session.updateMany({
    where: { id: session.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (count === 0) throw invalidSession();

  const next = await createSession(session.userId, { ...meta, persistent: session.persistent });
  return { user: session.user, ...next };
}

export async function revokeSession(refreshToken) {
  if (!refreshToken) return;
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

/** Cập nhật họ tên / số điện thoại. Số điện thoại phải chưa thuộc tài khoản khác. */
export async function updateProfile(userId, { fullName, phone }) {
  if (phone) {
    const taken = await prisma.user.findFirst({ where: { phone, NOT: { id: userId } }, select: { id: true } });
    if (taken) throw new AppError(409, 'PHONE_TAKEN', 'Số điện thoại đã được dùng.', { phone: 'Số điện thoại này đã thuộc tài khoản khác' });
  }
  return prisma.user.update({
    where: { id: userId },
    data: { fullName, ...(phone !== undefined && { phone }) },
  });
}

/**
 * Đổi mật khẩu: kiểm tra mật khẩu hiện tại, lưu hash mới, THU HỒI MỌI phiên (kể cả thiết bị khác).
 * Tài khoản Google chưa có mật khẩu thì đặt mới, không cần mật khẩu hiện tại.
 * Controller cấp lại phiên mới cho thiết bị đang dùng.
 */
export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập.');
  if (user.passwordHash) {
    const ok = currentPassword ? await bcrypt.compare(currentPassword, user.passwordHash) : false;
    if (!ok) throw new AppError(422, 'VALIDATION_ERROR', 'Mật khẩu hiện tại không đúng.', { currentPassword: 'Mật khẩu hiện tại không đúng' });
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const [updated] = await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
  return updated;
}
