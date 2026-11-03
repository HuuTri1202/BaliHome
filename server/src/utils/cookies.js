import { env } from '../config/env.js';

export const ACCESS_COOKIE = 'bh_at';
export const REFRESH_COOKIE = 'bh_rt';
// Refresh cookie chỉ gửi kèm các request /api/auth/* → giảm bề mặt lộ token
const REFRESH_PATH = '/api/auth';

const base = {
  httpOnly: true,          // JavaScript phía trình duyệt không đọc được → chống XSS đánh cắp token
  secure: env.isProd,      // production bắt buộc HTTPS
  sameSite: 'lax',         // chặn phần lớn CSRF, vẫn cho phép điều hướng thông thường
};

/**
 * @param {object} p
 * @param {string} p.accessToken
 * @param {string} p.refreshToken
 * @param {Date}   p.expiresAt   hạn của refresh session
 * @param {boolean} p.persistent "Ghi nhớ đăng nhập": true → cookie lâu dài, false → mất khi đóng trình duyệt
 */
export function setAuthCookies(res, { accessToken, refreshToken, expiresAt, persistent }) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...base,
    path: '/',
    maxAge: env.ACCESS_TOKEN_TTL_MIN * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...base,
    path: REFRESH_PATH,
    ...(persistent ? { expires: expiresAt } : {}),
  });
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { ...base, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...base, path: REFRESH_PATH });
}
