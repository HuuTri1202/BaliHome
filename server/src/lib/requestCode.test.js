// Chạy: npm test -w server
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRequestCode, createWithUniqueCode } from './requestCode.js';

const collision = () => Object.assign(new Error('Unique'), { code: 'P2002', meta: { target: ['code'] } });

test('builds a code with the year and four digits', () => {
  assert.match(buildRequestCode(new Date('2026-06-15T00:00:00Z')), /^BLH-2026-[1-9]\d{3}$/);
});

test('uses the Vietnam year around New Year', () => {
  assert.match(buildRequestCode(new Date('2026-12-31T18:00:00Z')), /^BLH-2027-/);
});

test('retries with a new code when the code is already taken', async () => {
  let calls = 0;
  const result = await createWithUniqueCode(async (code) => {
    calls += 1;
    if (calls < 3) throw collision();
    return code;
  });
  assert.equal(calls, 3);
  assert.match(result, /^BLH-\d{4}-\d{4}$/);
});

test('switches to six digits after repeated collisions', async () => {
  const seen = [];
  await createWithUniqueCode(async (code) => {
    seen.push(code);
    if (seen.length < 9) throw collision();
    return code;
  });
  assert.match(seen[7], /^BLH-\d{4}-\d{4}$/);
  assert.match(seen[8], /^BLH-\d{4}-\d{6}$/);
});

test('gives up after the maximum attempts', async () => {
  let calls = 0;
  await assert.rejects(createWithUniqueCode(async () => { calls += 1; throw collision(); }), { code: 'P2002' });
  assert.equal(calls, 12);
});

test('does not retry unrelated errors', async () => {
  let calls = 0;
  const unrelated = Object.assign(new Error('Unique email'), { code: 'P2002', meta: { target: ['email'] } });
  await assert.rejects(createWithUniqueCode(async () => { calls += 1; throw unrelated; }), unrelated);
  assert.equal(calls, 1);
});
