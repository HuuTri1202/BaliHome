import { test } from 'node:test';
import assert from 'node:assert/strict';

// config/env.js đọc biến môi trường lúc import → đặt giá trị test trước khi nạp module
process.env.DATABASE_URL ??= 'postgresql://test@localhost/test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-at-least-32-characters!!';
const { signPendingSignup, verifyPendingSignup } = await import('./pendingSignup.js');
const { signAccessToken, verifyAccessToken } = await import('../utils/tokens.js');
const jwt = (await import('jsonwebtoken')).default;

const PROFILE = { provider: 'facebook', sub: '1001', name: 'Trần An' };
const expired = (fn) => assert.throws(fn, (err) => err.status === 401 && err.code === 'SIGNUP_EXPIRED');

test('round-trips the verified provider profile', () => {
  assert.deepEqual(verifyPendingSignup(signPendingSignup(PROFILE)), PROFILE);
});

test('rejects tampered and expired tickets', () => {
  const token = signPendingSignup(PROFILE);
  expired(() => verifyPendingSignup(`${token.slice(0, -2)}xx`));
  const old = jwt.sign({ provider: 'facebook' }, process.env.JWT_ACCESS_SECRET, { subject: '1001', audience: 'bh:pending-signup', expiresIn: -1 });
  expired(() => verifyPendingSignup(old));
});

test('a pending ticket is not an access token, and an access token is not a pending ticket', () => {
  assert.throws(() => verifyAccessToken(signPendingSignup(PROFILE)));
  expired(() => verifyPendingSignup(signAccessToken({ id: '00000000-0000-0000-0000-000000000000', role: 'USER' })));
});
