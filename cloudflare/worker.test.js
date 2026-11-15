// Chạy: node --test cloudflare/worker.test.js
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

const ENV = { API_ORIGIN: 'https://api.example.com', PROXY_SECRET: 's'.repeat(40), ASSETS: { fetch: async () => new Response('asset') } };
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

/** fetch giả: trả lần lượt các kết quả (Response hoặc Error để ném), ghi lại URL đã gọi */
function stubFetch(results) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    const next = results.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  return calls;
}

const apiRequest = (method = 'GET', path = '/api/auth/providers') =>
  new Request(`https://balihome.example${path}`, { method, headers: { 'cf-connecting-ip': '1.2.3.4' }, ...(method !== 'GET' && { body: '{}' }) });
const renderWakeError = () => new Response('<html>waking</html>', { status: 502, headers: { 'content-type': 'text/html' } });
const json = (body, status = 200) => Response.json(body, { status });

test('GET while Render wakes up: waits and retries until the API answers', async () => {
  const calls = stubFetch([new Error('connection closed'), renderWakeError(), json({ google: null })]);
  const res = await worker.fetch(apiRequest(), ENV);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { google: null });
  assert.equal(calls.length, 3);
  assert.equal(calls[0].url, 'https://api.example.com/api/auth/providers');
  assert.equal(calls[0].init.headers.get('x-bh-client-ip'), '1.2.3.4');
});

test('JSON errors from the API itself are passed through, not retried', async () => {
  const calls = stubFetch([json({ error: { code: 'PROVIDER_DISABLED' } }, 503)]);
  const res = await worker.fetch(apiRequest(), ENV);
  assert.equal(res.status, 503);
  assert.equal(calls.length, 1);
});

test('POST is never re-sent (no duplicate contact requests); network failure → 503 JSON', async () => {
  const calls = stubFetch([new Error('connection closed')]);
  const res = await worker.fetch(apiRequest('POST', '/api/contact'), ENV);
  assert.equal(res.status, 503);
  assert.equal((await res.json()).error.code, 'UPSTREAM_UNAVAILABLE');
  assert.equal(calls.length, 1);
});

test('visitors cannot forge the internal client-ip / proxy-secret headers', async () => {
  const calls = stubFetch([json({ ok: true })]);
  const forged = new Request('https://balihome.example/api/ping', { headers: { 'x-bh-client-ip': '9.9.9.9', 'x-bh-proxy-secret': 'fake' } });
  await worker.fetch(forged, { ...ENV, PROXY_SECRET: undefined });
  assert.equal(calls[0].init.headers.get('x-bh-client-ip'), null);
  assert.equal(calls[0].init.headers.get('x-bh-proxy-secret'), null);
});

test('non-API paths are served from static assets', async () => {
  const calls = stubFetch([]);
  const res = await worker.fetch(new Request('https://balihome.example/dang-nhap'), ENV);
  assert.equal(await res.text(), 'asset');
  assert.equal(calls.length, 0);
});

test('cron keep-alive pings /api/ping on the API origin', async () => {
  const calls = stubFetch([json({ ok: true })]);
  const pending = [];
  await worker.scheduled({}, ENV, { waitUntil: (p) => pending.push(p) });
  await Promise.all(pending);
  assert.equal(calls[0].url, 'https://api.example.com/api/ping');
});
