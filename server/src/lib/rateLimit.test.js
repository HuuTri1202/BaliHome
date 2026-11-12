import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { byUser, createLimiter } from './rateLimit.js';

/** App nhỏ: header x-test-user giả lập requireAuth đã gắn req.auth */
async function startApp(limiter) {
  const app = express();
  app.use((req, _res, next) => {
    const userId = req.get('x-test-user');
    if (userId) req.auth = { userId };
    next();
  });
  app.post('/send', limiter, (_req, res) => res.json({ ok: true }));
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const url = `http://127.0.0.1:${server.address().port}/send`;
  const send = (userId) => fetch(url, { method: 'POST', headers: userId ? { 'x-test-user': userId } : {} });
  return { send, close: () => new Promise((resolve) => server.close(resolve)) };
}

const quietWarn = (t) => t.mock.method(console, 'warn', () => {});

test('byUser keys by account when logged in, by IP otherwise', () => {
  assert.equal(byUser({ auth: { userId: 'u1' }, ip: '1.2.3.4' }), 'user:u1');
  assert.equal(byUser({ ip: '1.2.3.4' }), 'ip:1.2.3.4');
});

test('two accounts on the same IP get separate limits', async (t) => {
  quietWarn(t);
  const app = await startApp(createLimiter({ name: 't', windowMs: 60_000, limit: 2, message: 'chậm lại', keyGenerator: byUser }));
  try {
    assert.equal((await app.send('alice')).status, 200);
    assert.equal((await app.send('alice')).status, 200);
    const blocked = await app.send('alice');
    assert.equal(blocked.status, 429);
    assert.deepEqual(await blocked.json(), { error: { code: 'TOO_MANY_REQUESTS', message: 'chậm lại' } });
    assert.equal((await app.send('bob')).status, 200, 'bob must not share alice\'s counter');
  } finally {
    await app.close();
  }
});

test('without keyGenerator the limit is shared per IP and each block is logged', async (t) => {
  const warn = quietWarn(t);
  const app = await startApp(createLimiter({ name: 'ip-only', windowMs: 60_000, limit: 1, message: 'x' }));
  try {
    assert.equal((await app.send('alice')).status, 200);
    assert.equal((await app.send('bob')).status, 429);
    assert.equal(warn.mock.callCount(), 1);
    assert.match(warn.mock.calls[0].arguments[0], /^\[rate-limit\] ip-only user=bob POST \/send$/);
  } finally {
    await app.close();
  }
});
