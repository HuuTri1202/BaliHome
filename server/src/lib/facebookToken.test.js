import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createFacebookVerifier } from './facebookToken.js';

const APP_ID = '3492875494225878';
const APP_SECRET = 'test-secret';
const TOKEN = 'EAAtoken';

const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });

/** Giá trị trả lời: hàm (ném lỗi mạng...), response dựng sẵn bằng json(), hoặc body JSON → 200 */
const respond = (value) => {
  if (typeof value === 'function') return value();
  return typeof value?.json === 'function' ? value : json(value);
};

/** fetch giả: trả lời theo đường dẫn, ghi lại URL đã gọi */
function fakeFetch({ debug, me }) {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(new URL(url));
    return respond(url.includes('/debug_token') ? debug : me);
  };
  return { fetchImpl, calls };
}

const VALID_DEBUG = { data: { is_valid: true, app_id: APP_ID, user_id: '1001' } };
const verifier = (fetchImpl) => createFacebookVerifier({ appId: APP_ID, appSecret: APP_SECRET, fetchImpl });
const rejectsWith = (promise, status, code) => assert.rejects(promise, (err) => err.status === status && err.code === code);

test('accepts a valid token for this app and normalises the profile', async () => {
  const { fetchImpl, calls } = fakeFetch({ debug: VALID_DEBUG, me: { id: '1001', name: ' Trần An ', email: 'An@Example.com' } });
  assert.deepEqual(await verifier(fetchImpl)(TOKEN), { sub: '1001', email: 'an@example.com', name: 'Trần An' });
  assert.equal(calls[0].searchParams.get('access_token'), `${APP_ID}|${APP_SECRET}`);
  assert.equal(calls[1].searchParams.get('appsecret_proof'), createHmac('sha256', APP_SECRET).update(TOKEN).digest('hex'));
});

test('missing email (phone-only Facebook account) → email null', async () => {
  const { fetchImpl } = fakeFetch({ debug: VALID_DEBUG, me: { id: '1001', name: 'An' } });
  assert.equal((await verifier(fetchImpl)(TOKEN)).email, null);
});

test('rejects a token issued to another app', async () => {
  const { fetchImpl } = fakeFetch({ debug: { data: { ...VALID_DEBUG.data, app_id: '999' } }, me: { id: '1001' } });
  await rejectsWith(verifier(fetchImpl)(TOKEN), 401, 'FACEBOOK_TOKEN_INVALID');
});

test('rejects an expired / revoked token', async () => {
  const { fetchImpl } = fakeFetch({ debug: { data: { ...VALID_DEBUG.data, is_valid: false } }, me: { id: '1001' } });
  await rejectsWith(verifier(fetchImpl)(TOKEN), 401, 'FACEBOOK_TOKEN_INVALID');
});

test('rejects when /me belongs to a different user than the token', async () => {
  const { fetchImpl } = fakeFetch({ debug: VALID_DEBUG, me: { id: '2002' } });
  await rejectsWith(verifier(fetchImpl)(TOKEN), 401, 'FACEBOOK_TOKEN_INVALID');
});

test('Graph API error body → 401', async () => {
  const { fetchImpl } = fakeFetch({ debug: json({ error: { message: 'Invalid OAuth access token' } }, 400), me: {} });
  await rejectsWith(verifier(fetchImpl)(TOKEN), 401, 'FACEBOOK_TOKEN_INVALID');
});

test('network failure or Facebook 5xx → 503', async () => {
  const down = fakeFetch({ debug: () => { throw new Error('timeout'); }, me: {} });
  await rejectsWith(verifier(down.fetchImpl)(TOKEN), 503, 'FACEBOOK_UNAVAILABLE');
  const broken = fakeFetch({ debug: json({}, 502), me: {} });
  await rejectsWith(verifier(broken.fetchImpl)(TOKEN), 503, 'FACEBOOK_UNAVAILABLE');
});
