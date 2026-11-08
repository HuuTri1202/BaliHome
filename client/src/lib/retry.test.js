// Chạy: npm test -w client
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TimeoutError, backoffDelay, isTransientError, withRetry } from './retry.js';

const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { status });

/** Tác vụ giả: ném lần lượt các lỗi trong `failures`, hết lỗi thì trả 'ok' */
function failingTask(failures) {
  const task = async () => {
    task.calls += 1;
    if (failures.length) throw failures.shift();
    return 'ok';
  };
  task.calls = 0;
  return task;
}

const recordingSleep = () => {
  const delays = [];
  const sleep = async (ms) => { delays.push(ms); };
  return { delays, sleep };
};

test('returns immediately without sleeping when the first attempt succeeds', async () => {
  const { delays, sleep } = recordingSleep();
  const task = failingTask([]);

  assert.equal(await withRetry(task, { sleep }), 'ok');
  assert.equal(task.calls, 1);
  assert.deepEqual(delays, []);
});

test('recovers when a retry succeeds after transient failures', async () => {
  const { sleep } = recordingSleep();
  const task = failingTask([httpError(503), httpError(0)]);

  assert.equal(await withRetry(task, { sleep }), 'ok');
  assert.equal(task.calls, 3);
});

test('makes 1 attempt plus 3 retries, with exponential delays, before throwing', async () => {
  const { delays, sleep } = recordingSleep();
  const lastError = httpError(503);
  const task = failingTask([httpError(503), httpError(503), httpError(503), lastError, httpError(503)]);

  await assert.rejects(withRetry(task, { sleep, baseDelayMs: 1000 }), (error) => error === lastError);
  assert.equal(task.calls, 4);
  assert.equal(delays.length, 3);
  delays.forEach((ms, i) => {
    const base = 1000 * 2 ** i;
    assert.ok(ms >= base && ms < base + 250, `delay ${i} = ${ms}`);
  });
});

test('does not retry a permanent error such as 404', async () => {
  const { delays, sleep } = recordingSleep();
  const task = failingTask([httpError(404)]);

  await assert.rejects(withRetry(task, { sleep }), { status: 404 });
  assert.equal(task.calls, 1);
  assert.deepEqual(delays, []);
});

test('aborts a hung attempt, reports TimeoutError and retries', async () => {
  const { sleep } = recordingSleep();
  let calls = 0;
  const task = (signal) => {
    calls += 1;
    if (calls > 1) return Promise.resolve('ok');
    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    });
  };

  assert.equal(await withRetry(task, { sleep, timeoutMs: 10 }), 'ok');
  assert.equal(calls, 2);
});

test('throws TimeoutError when every attempt hangs', async () => {
  const task = (signal) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  });

  await assert.rejects(withRetry(task, { retries: 1, sleep: async () => {}, timeoutMs: 5 }), TimeoutError);
});

test('classifies transient and permanent errors', () => {
  [0, 408, 429, 500, 502, 503].forEach((status) => assert.equal(isTransientError(httpError(status)), true, String(status)));
  [400, 401, 403, 404, 422].forEach((status) => assert.equal(isTransientError(httpError(status)), false, String(status)));
  assert.equal(isTransientError(new TimeoutError(1)), true);
  assert.equal(isTransientError(new TypeError('bug')), false);
});

test('backoffDelay doubles each retry and adds bounded jitter', () => {
  assert.equal(backoffDelay(0, 1000, () => 0), 1000);
  assert.equal(backoffDelay(2, 1000, () => 0), 4000);
  assert.equal(backoffDelay(1, 1000, () => 1), 2250);
});
