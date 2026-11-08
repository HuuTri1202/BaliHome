import { timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

/**
 * Khi web chạy trên Cloudflare, mọi request /api đi qua Worker → Render chỉ thấy IP của Cloudflare.
 * Worker gửi kèm IP thật (x-bh-client-ip) + khoá bí mật chung (x-bh-proxy-secret).
 * Chỉ khi khoá khớp mới dùng IP đó → giới hạn số lần đăng nhập tính đúng theo từng người,
 * và người gọi thẳng vào Render không thể giả IP để né giới hạn.
 */
export function trustEdgeClientIp(secret) {
  const expected = secret ? Buffer.from(secret) : null;
  return (req, _res, next) => {
    if (!expected) return next();
    const given = req.get('x-bh-proxy-secret');
    const clientIp = req.get('x-bh-client-ip');
    if (given && clientIp && isIP(clientIp)) {
      const provided = Buffer.from(given);
      if (provided.length === expected.length && timingSafeEqual(provided, expected)) {
        Object.defineProperty(req, 'ip', { value: clientIp, configurable: true, enumerable: true });
      }
    }
    next();
  };
}
