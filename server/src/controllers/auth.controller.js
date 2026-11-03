import { AppError } from '../utils/AppError.js';
import { signAccessToken } from '../utils/tokens.js';
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from '../utils/cookies.js';
import {
  registerUser,
  verifyCredentials,
  createSession,
  rotateSession,
  revokeSession,
  getUserById,
  toPublicUser,
} from '../services/auth.service.js';

const requestMeta = (req) => ({
  userAgent: req.get('user-agent')?.slice(0, 255) ?? null,
  ip: req.ip ?? null,
});

/** Cấp access token + refresh session, ghi cookie, trả user */
async function issueTokens(req, res, user, persistent) {
  const session = await createSession(user.id, { ...requestMeta(req), persistent });
  setAuthCookies(res, { accessToken: signAccessToken(user), ...session });
}

// POST /api/auth/register
export async function register(req, res) {
  const user = await registerUser(req.body);
  await issueTokens(req, res, user, false); // đăng ký xong đăng nhập luôn
  res.status(201).json({ user: toPublicUser(user) });
}

// POST /api/auth/login
export async function login(req, res) {
  const user = await verifyCredentials(req.body);
  await issueTokens(req, res, user, req.body.remember);
  res.json({ user: toPublicUser(user) });
}

// POST /api/auth/refresh
export async function refresh(req, res) {
  try {
    const { user, ...session } = await rotateSession(req.cookies?.[REFRESH_COOKIE], requestMeta(req));
    setAuthCookies(res, { accessToken: signAccessToken(user), ...session });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    clearAuthCookies(res); // refresh hỏng → xoá cookie để client về trạng thái khách
    throw err;
  }
}

// POST /api/auth/logout
export async function logout(req, res) {
  await revokeSession(req.cookies?.[REFRESH_COOKIE]);
  clearAuthCookies(res);
  res.status(204).end();
}

// GET /api/auth/me
export async function me(req, res) {
  const user = await getUserById(req.auth.userId);
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Tài khoản không tồn tại.');
  res.json({ user: toPublicUser(user) });
}
