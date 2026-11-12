import { createHmac } from 'node:crypto';
import { AppError } from '../utils/AppError.js';

/* =============================================================================
 * Xác minh access token do Facebook Login (JS SDK) trả về trình duyệt.
 * 1. debug_token (bằng app access token APP_ID|APP_SECRET): token còn hiệu lực VÀ được cấp cho đúng app Bali Home
 *    — chặn kẻ gian lấy token từ app khác của họ rồi gửi sang đây.
 * 2. /me kèm appsecret_proof: lấy id, tên, email; id phải trùng user_id ở bước 1.
 * Không phiên bản trong URL → dùng phiên bản Graph API mặc định đã đặt cho app trên Meta.
 * ========================================================================== */
const GRAPH_URL = 'https://graph.facebook.com';
const REQUEST_TIMEOUT_MS = 5000;

const invalidToken = () => new AppError(401, 'FACEBOOK_TOKEN_INVALID', 'Không xác minh được tài khoản Facebook. Vui lòng thử lại.');
const facebookUnavailable = () => new AppError(503, 'FACEBOOK_UNAVAILABLE', 'Tạm thời chưa kết nối được Facebook. Vui lòng thử lại sau ít phút.');

/**
 * @param {{ appId: string, appSecret: string, fetchImpl?: typeof fetch }} options
 * @returns {(accessToken: string) => Promise<{ sub: string, email: string|null, name: string|null }>}
 */
export function createFacebookVerifier({ appId, appSecret, fetchImpl = fetch }) {
  const graph = async (path, params) => {
    let res;
    try {
      res = await fetchImpl(`${GRAPH_URL}${path}?${new URLSearchParams(params)}`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch {
      throw facebookUnavailable();
    }
    if (res.status >= 500) throw facebookUnavailable();
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || body.error) throw invalidToken();
    return body;
  };

  return async function verifyFacebookAccessToken(accessToken) {
    const { data } = await graph('/debug_token', { input_token: accessToken, access_token: `${appId}|${appSecret}` });
    if (!data?.is_valid || String(data.app_id) !== String(appId) || !data.user_id) throw invalidToken();

    const appsecretProof = createHmac('sha256', appSecret).update(accessToken).digest('hex');
    const me = await graph('/me', { fields: 'id,name,email', access_token: accessToken, appsecret_proof: appsecretProof });
    if (String(me.id) !== String(data.user_id)) throw invalidToken();

    return {
      sub: String(me.id),
      // Facebook chỉ trả email chính đã xác nhận của tài khoản; không có (đăng ký bằng SĐT / bỏ quyền email) → null
      email: typeof me.email === 'string' && me.email.includes('@') ? me.email.trim().toLowerCase() : null,
      name: me.name?.trim() || null,
    };
  };
}
