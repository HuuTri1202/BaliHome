import { createPublicKey } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

/* =============================================================================
 * Xác minh "ID token" do Google Sign-In trả về trình duyệt.
 * Không tin bất cứ thứ gì trình duyệt gửi: kiểm tra chữ ký bằng khoá công khai của Google,
 * đúng người nhận (aud = Client ID của Bali Home), đúng nơi cấp (iss), còn hạn, email đã xác minh.
 * ========================================================================== */
const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];
const DEFAULT_CERTS_TTL_MS = 60 * 60 * 1000;
// Gặp "kid" lạ (Google vừa xoay khoá) thì tải lại, nhưng không quá 1 lần/phút → token rác không làm ta dội request sang Google
const MIN_REFETCH_INTERVAL_MS = 60 * 1000;
const CERTS_TIMEOUT_MS = 5000;

const invalidToken = () => new AppError(401, 'GOOGLE_TOKEN_INVALID', 'Không xác minh được tài khoản Google. Vui lòng thử lại.');
const googleUnavailable = () => new AppError(503, 'GOOGLE_UNAVAILABLE', 'Tạm thời chưa kết nối được Google. Vui lòng thử lại sau ít phút.');

/** Khoá hỏng / không phải RSA thì bỏ qua khoá đó, không làm hỏng cả bộ */
function toPublicKeys(jwks) {
  const entries = [];
  for (const jwk of jwks ?? []) {
    if (jwk?.kty !== 'RSA' || !jwk.kid) continue;
    try {
      entries.push([jwk.kid, createPublicKey({ key: jwk, format: 'jwk' })]);
    } catch { /* khoá lỗi: bỏ qua */ }
  }
  return new Map(entries);
}

/** Tải bộ khoá công khai của Google; thời gian cache theo header Cache-Control: max-age */
export async function fetchGoogleCerts() {
  const res = await fetch(GOOGLE_CERTS_URL, { signal: AbortSignal.timeout(CERTS_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Google certs HTTP ${res.status}`);
  const maxAge = /max-age=(\d+)/.exec(res.headers.get('cache-control') ?? '')?.[1];
  const { keys } = await res.json();
  return { keys, ttlMs: maxAge ? Number(maxAge) * 1000 : DEFAULT_CERTS_TTL_MS };
}

/**
 * @param {{ clientId: string, fetchCerts?: typeof fetchGoogleCerts, now?: () => number }} options
 * @returns {(idToken: string) => Promise<{ sub: string, email: string, name: string | null }>}
 */
export function createGoogleVerifier({ clientId, fetchCerts = fetchGoogleCerts, now = Date.now }) {
  let keys = new Map();
  let expiresAt = 0;
  let attemptedAt = -Infinity; // lần thử tải gần nhất, kể cả thất bại → lỗi cũng bị giới hạn 1 lần/phút
  let inflight = null; // nhiều request cùng lúc dùng chung 1 lần tải

  async function reloadKeys() {
    attemptedAt = now();
    const certs = await fetchCerts();
    const next = toPublicKeys(certs.keys);
    if (next.size === 0) throw new Error('Google certs: no usable keys');
    keys = next;
    expiresAt = now() + certs.ttlMs;
  }

  async function publicKeyFor(kid) {
    const isExpired = now() >= expiresAt;
    const mayRefetch = now() - attemptedAt >= MIN_REFETCH_INTERVAL_MS;
    if ((isExpired || !keys.has(kid)) && mayRefetch) {
      inflight ??= reloadKeys().finally(() => { inflight = null; });
      try {
        await inflight;
      } catch {
        // Tải lỗi: còn bộ khoá cũ thì dùng tạm; chưa từng có khoá thì báo Google tạm không kết nối được
        if (keys.size === 0) throw googleUnavailable();
      }
    } else if (inflight) {
      await inflight.catch(() => {});
    }
    return keys.get(kid);
  }

  return async function verifyGoogleIdToken(idToken) {
    const kid = jwt.decode(idToken, { complete: true })?.header?.kid;
    if (!kid) throw invalidToken();
    const key = await publicKeyFor(kid);
    if (!key) throw invalidToken();

    let payload;
    try {
      payload = jwt.verify(idToken, key, { algorithms: ['RS256'], audience: clientId, issuer: GOOGLE_ISSUERS });
    } catch {
      throw invalidToken();
    }
    // Chỉ chấp nhận email Google đã xác minh: email là thứ dùng để nối với tài khoản có sẵn
    if (!payload.sub || !payload.email || payload.email_verified !== true) throw invalidToken();
    return { sub: payload.sub, email: payload.email.trim().toLowerCase(), name: payload.name?.trim() || null };
  };
}
