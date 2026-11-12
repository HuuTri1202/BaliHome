import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';

/* =============================================================================
 * Đăng nhập bằng tài khoản bên ngoài (Google, Facebook). Thông tin đầu vào đã được lib/*Token.js
 * xác minh với nhà cung cấp. Quy tắc an toàn khi nối vào tài khoản có sẵn:
 *  - Chỉ tự nối khi nhà cung cấp XÁC NHẬN RÕ email đã xác minh (Google: email_verified). Facebook không có cờ này
 *    → email Facebook chỉ dùng để tạo tài khoản MỚI, không bao giờ nối vào tài khoản có sẵn, và không được tính
 *    là "đã chứng minh email" (liên kết lưu email NULL). Email khách tự gõ cũng vậy.
 *  - Người chứng minh được email là chủ tài khoản: lúc nối, mọi "chìa khoá" chưa từng chứng minh email này
 *    đều bị thu hồi — mật khẩu cũ (đăng ký không xác minh email), liên kết mạng xã hội không kèm email này,
 *    và mọi phiên đăng nhập. Kẻ đăng ký trước bằng email của người khác (nếu có) mất quyền vào.
 * ========================================================================== */
export const PROVIDER_LABELS = { google: 'Google', facebook: 'Facebook' };

const PRISMA_UNIQUE_VIOLATION = 'P2002';
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;

const isUniqueViolation = (err) => err?.code === PRISMA_UNIQUE_VIOLATION;

/** Họ tên cho tài khoản mới: tên từ nhà cung cấp, không có thì lấy phần trước @ của email */
export function displayName({ name, email }) {
  const candidate = (name?.trim() || email?.split('@')[0] || '').slice(0, MAX_NAME_LENGTH);
  return candidate.length >= MIN_NAME_LENGTH ? candidate : 'Khách Bali Home';
}

const mismatch = (provider) =>
  new AppError(409, 'IDENTITY_MISMATCH', `Tài khoản này đã liên kết với một tài khoản ${PROVIDER_LABELS[provider]} khác.`);

const findIdentity = (provider, sub) =>
  prisma.authIdentity.findUnique({ where: { provider_providerUserId: { provider, providerUserId: sub } }, include: { user: true } });

/**
 * Nối nhà cung cấp vào tài khoản có cùng email (email do nhà cung cấp xác nhận).
 * Lần ĐẦU email được chứng minh: thu hồi mọi "chìa khoá" cũ. Từ lần sau (đã có liên kết chứng minh email này),
 * mật khẩu / phiên hiện có là của chính chủ → giữ nguyên, chỉ thêm liên kết.
 */
async function linkByVerifiedEmail(user, { provider, sub, email }, now) {
  try {
    await prisma.$transaction(async (tx) => {
      // Khoá dòng tài khoản: phiên đăng nhập mật khẩu tạo song song (khoá ngoại → KEY SHARE) phải chờ,
      // không lọt qua bước thu hồi phiên; các liên kết được đọc lại trong cùng giao dịch
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${user.id}::uuid FOR UPDATE`;
      const existing = await tx.authIdentity.findMany({ where: { userId: user.id }, select: { provider: true, email: true } });
      // Mỗi nhà cung cấp 1 liên kết / tài khoản → tài khoản Google khác cùng email bị chặn
      if (existing.some((identity) => identity.provider === provider)) throw mismatch(provider);
      const isEmailAlreadyProven = existing.some((identity) => identity.email === email);
      await tx.authIdentity.create({ data: { userId: user.id, provider, providerUserId: sub, email } });
      if (isEmailAlreadyProven) {
        await tx.user.update({ where: { id: user.id }, data: { lastLoginAt: now } });
        return;
      }
      // Liên kết không chứng minh email này (email NULL hoặc khác) bị gỡ. Phải ghi rõ NULL: SQL NOT(email = x) bỏ sót NULL
      await tx.authIdentity.deleteMany({ where: { userId: user.id, OR: [{ email: null }, { NOT: { email } }] } });
      await tx.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: now } });
      await tx.user.update({ where: { id: user.id }, data: { passwordHash: null, lastLoginAt: now } });
    });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    // 2 request cùng lúc: request kia vừa nối đúng tài khoản này → coi như thành công
    const existing = await findIdentity(provider, sub);
    if (existing?.userId === user.id) return existing.user;
    throw mismatch(provider);
  }
  return prisma.user.findUnique({ where: { id: user.id } });
}

/** Tạo tài khoản mới kèm liên kết. emailFromProvider = null khi email do khách tự nhập. */
async function createWithIdentity({ provider, sub, name, email, emailFromProvider }, now) {
  try {
    return await prisma.user.create({
      data: {
        email,
        fullName: displayName({ name, email }),
        lastLoginAt: now,
        identities: { create: { provider, providerUserId: sub, email: emailFromProvider } },
      },
    });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    const existing = await findIdentity(provider, sub); // bấm đúp / 2 tab: request kia vừa tạo xong
    if (existing) return existing.user;
    throw new AppError(409, 'ACCOUNT_EXISTS', 'Email này đã có tài khoản.', { email: 'Email này đã có tài khoản' });
  }
}

const emailTaken = (provider) =>
  new AppError(
    409,
    'ACCOUNT_EXISTS',
    `Email ${PROVIDER_LABELS[provider]} của bạn đã có tài khoản Bali Home. Hãy đăng nhập bằng mật khẩu hoặc Google với email đó.`,
    { email: 'Email này đã có tài khoản' }
  );

/**
 * @param {{ provider: 'google'|'facebook', sub: string, email: string|null, emailVerified: boolean, name: string|null }} profile
 *   email: email nhà cung cấp trả về (null khi không có); emailVerified: nhà cung cấp xác nhận rõ email đã xác minh.
 * @returns {Promise<object|null>} user, hoặc null khi cần khách bổ sung email (xem completeSignup)
 */
export async function signInWithProvider({ provider, sub, email, emailVerified, name }) {
  const now = new Date();
  const identity = await findIdentity(provider, sub);
  if (identity) return prisma.user.update({ where: { id: identity.userId }, data: { lastLoginAt: now } });
  if (!email) return null;

  const sameEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (sameEmail) {
    if (!emailVerified) throw emailTaken(provider);
    return linkByVerifiedEmail(sameEmail, { provider, sub, email }, now);
  }
  return createWithIdentity({ provider, sub, name, email, emailFromProvider: emailVerified ? email : null }, now);
}

/**
 * Nhà cung cấp không trả email (vd. Facebook đăng ký bằng số điện thoại) → khách tự nhập email.
 * Email này CHƯA được xác minh nên chỉ dùng cho tài khoản MỚI, không bao giờ nối vào tài khoản có sẵn.
 */
export async function completeSignup({ provider, sub, name, email }) {
  const now = new Date();
  const identity = await findIdentity(provider, sub);
  if (identity) return prisma.user.update({ where: { id: identity.userId }, data: { lastLoginAt: now } });

  const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (taken) {
    throw new AppError(409, 'ACCOUNT_EXISTS', 'Email này đã có tài khoản. Hãy đăng nhập bằng email đó (mật khẩu hoặc Google).', {
      email: 'Email này đã có tài khoản',
    });
  }
  return createWithIdentity({ provider, sub, name, email, emailFromProvider: null }, now);
}

/** Danh sách nhà cung cấp đã liên kết (cho trang Bảo mật) */
export async function listIdentities(userId) {
  const rows = await prisma.authIdentity.findMany({ where: { userId }, select: { provider: true, createdAt: true }, orderBy: { createdAt: 'asc' } });
  return rows.map(({ provider, createdAt }) => ({ provider, label: PROVIDER_LABELS[provider] ?? provider, linkedAt: createdAt }));
}
