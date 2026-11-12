import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createGoogleVerifier } from './googleIdToken.js';

const CLIENT_ID = 'bali-home.apps.googleusercontent.com';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const attacker = generateKeyPairSync('rsa', { modulusLength: 2048 });
const JWK = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' };

const PAYLOAD = { sub: '1234567890', email: 'Khach@Gmail.com', email_verified: true, name: ' Nguyễn Văn A ' };
const sign = (payload = PAYLOAD, { key = privateKey, kid = 'k1', audience = CLIENT_ID, issuer = 'https://accounts.google.com', expiresIn = '1h' } = {}) =>
  jwt.sign(payload, key, { algorithm: 'RS256', keyid: kid, audience, issuer, expiresIn });

function setup() {
  const calls = { count: 0 };
  const verify = createGoogleVerifier({
    clientId: CLIENT_ID,
    fetchCerts: async () => {
      calls.count += 1;
      return { keys: [JWK], ttlMs: 60 * 60 * 1000 };
    },
  });
  return { verify, calls };
}

const rejects = (promise) => assert.rejects(promise, (err) => err.status === 401 && err.code === 'GOOGLE_TOKEN_INVALID');

test('accepts a valid Google token and normalises email and name', async () => {
  const { verify } = setup();
  assert.deepEqual(await verify(sign()), { sub: '1234567890', email: 'khach@gmail.com', name: 'Nguyễn Văn A' });
});

test('rejects a token signed by another key', async () => {
  await rejects(setup().verify(sign(PAYLOAD, { key: attacker.privateKey })));
});

test('rejects a token issued for another app (aud)', async () => {
  await rejects(setup().verify(sign(PAYLOAD, { audience: 'someone-else.apps.googleusercontent.com' })));
});

test('rejects a token from another issuer', async () => {
  await rejects(setup().verify(sign(PAYLOAD, { issuer: 'https://evil.example' })));
});

test('rejects an expired token', async () => {
  await rejects(setup().verify(sign(PAYLOAD, { expiresIn: -10 })));
});

test('rejects an unverified Google email', async () => {
  await rejects(setup().verify(sign({ ...PAYLOAD, email_verified: false })));
});

test('rejects garbage and unsigned (alg none) tokens', async () => {
  const { verify } = setup();
  await rejects(verify('not-a-token'));
  const unsigned = jwt.sign(PAYLOAD, null, { algorithm: 'none', keyid: 'k1', audience: CLIENT_ID, issuer: 'accounts.google.com' });
  await rejects(verify(unsigned));
});

test('concurrent requests share one key download', async () => {
  const { verify, calls } = setup();
  await Promise.all([verify(sign()), verify(sign()), verify(sign())]);
  assert.equal(calls.count, 1);
});

test('Google unreachable: 503, and failures are throttled too', async () => {
  let clock = 0;
  let attempts = 0;
  const verify = createGoogleVerifier({
    clientId: CLIENT_ID,
    now: () => clock,
    fetchCerts: async () => { attempts += 1; throw new Error('timeout'); },
  });
  await assert.rejects(verify(sign()), (err) => err.status === 503 && err.code === 'GOOGLE_UNAVAILABLE');
  await assert.rejects(verify(sign()), (err) => err.status === 401);
  assert.equal(attempts, 1, 'no second download within a minute');
  clock += 61_000;
  await assert.rejects(verify(sign()), (err) => err.status === 503);
  assert.equal(attempts, 2);
});

test('keeps using the cached keys when a refresh fails, and skips malformed keys', async () => {
  let clock = 0;
  let fail = false;
  const verify = createGoogleVerifier({
    clientId: CLIENT_ID,
    now: () => clock,
    fetchCerts: async () => {
      if (fail) throw new Error('down');
      return { keys: [{ kty: 'RSA', kid: 'broken', n: 'x', e: 'y' }, { kty: 'EC', kid: 'ec' }, JWK], ttlMs: 1000 };
    },
  });
  await verify(sign());
  fail = true;
  clock += 120_000; // cache hết hạn, tải lại lỗi
  assert.equal((await verify(sign())).sub, '1234567890');
});

test('caches Google keys and does not refetch for unknown kids more than once a minute', async () => {
  const { verify, calls } = setup();
  await verify(sign());
  await verify(sign());
  await rejects(verify(sign(PAYLOAD, { kid: 'unknown-1' })));
  await rejects(verify(sign(PAYLOAD, { kid: 'unknown-2' })));
  assert.equal(calls.count, 1);
});
