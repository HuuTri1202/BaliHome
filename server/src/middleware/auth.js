import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { ACCESS_COOKIE } from '../utils/cookies.js';

/**
 * Bắt buộc đăng nhập. Gắn req.auth = { userId, role }.
 * Token hết hạn → 401 TOKEN_EXPIRED: frontend tự gọi /api/auth/refresh rồi thử lại.
 */
export function requireAuth(req, _res, next) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập.');
  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'TOKEN_EXPIRED', 'Phiên đăng nhập đã hết hạn.');
    }
    throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập.');
  }
}

/** Giới hạn theo vai trò, dùng sau requireAuth: requireRole('ADMIN') */
export const requireRole = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.auth?.role)) throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
  next();
};
