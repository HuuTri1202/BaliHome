import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/* =============================================================================
 * "Phiếu tạm" khi nhà cung cấp (Facebook) đã xác minh người dùng nhưng không trả email:
 * server ký lại thông tin đã xác minh (provider, id, tên) để bước "nhập email" sau đó tin được,
 * mà không phải gửi lại token Facebook. Hết hạn sau 5 phút, chỉ dùng cho đúng mục đích này.
 * ========================================================================== */
const AUDIENCE = 'bh:pending-signup';
const TTL = '5m';

const expired = () => new AppError(401, 'SIGNUP_EXPIRED', 'Phiên đăng ký đã hết hạn. Vui lòng bấm đăng nhập bằng Facebook lại.');

/** @param {{ provider: string, sub: string, name: string|null }} profile */
export const signPendingSignup = ({ provider, sub, name }) =>
  jwt.sign({ provider, name }, env.JWT_ACCESS_SECRET, { subject: sub, audience: AUDIENCE, expiresIn: TTL, algorithm: 'HS256' });

export function verifyPendingSignup(token) {
  try {
    const { provider, name, sub } = jwt.verify(token, env.JWT_ACCESS_SECRET, { audience: AUDIENCE, algorithms: ['HS256'] });
    if (!provider || !sub) throw new Error('incomplete');
    return { provider, sub, name: name ?? null };
  } catch {
    throw expired();
  }
}
