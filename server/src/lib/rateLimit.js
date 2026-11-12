import rateLimit from 'express-rate-limit';

/**
 * Khoá đếm theo tài khoản. Chỉ dùng SAU requireAuth: người đã đăng nhập được đếm riêng,
 * không phụ thuộc IP (dùng chung wifi, hay mọi request đi qua Cloudflare đều cùng một IP).
 */
export const byUser = (req) => (req.auth?.userId ? `user:${req.auth.userId}` : `ip:${req.ip}`);

/** Ai đang bị chặn: tài khoản nếu đã đăng nhập, ngược lại là IP */
const whoIs = (req) => (req.auth?.userId ? `user=${req.auth.userId}` : `ip=${req.ip}`);

/**
 * Bộ giới hạn số lần gọi, trả lỗi 429 cùng định dạng với các lỗi khác và ghi log mỗi lần chặn
 * (xem trong log Render: tìm "[rate-limit]" để biết khách nào bị chặn, ở đâu).
 * @param {{ name: string, windowMs: number, limit: number, message: string, keyGenerator?: (req: import('express').Request) => string }} options
 */
export function createLimiter({ name, windowMs, limit, message, keyGenerator }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    ...(keyGenerator && { keyGenerator }),
    handler: (req, res) => {
      console.warn(`[rate-limit] ${name} ${whoIs(req)} ${req.method} ${req.originalUrl}`);
      res.status(429).json({ error: { code: 'TOO_MANY_REQUESTS', message } });
    },
  });
}
