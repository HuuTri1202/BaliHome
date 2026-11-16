import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatVnd, groupDigits, parseVnd, validateDesiredPrice } from './money.js';

test('parseVnd accepts common ways of typing an amount', () => {
  assert.equal(parseVnd('15.000.000'), 15_000_000);
  assert.equal(parseVnd('15000000'), 15_000_000);
  assert.equal(parseVnd(' 15 000 000 đ '), 15_000_000);
  assert.equal(parseVnd('2,500,000'), 2_500_000);
  assert.equal(parseVnd(''), null);
  assert.ok(Number.isNaN(parseVnd('mười triệu')));
  assert.ok(Number.isNaN(parseVnd('-5000')));
});

test('formatting', () => {
  assert.equal(groupDigits(15_000_000), '15.000.000');
  assert.equal(groupDigits(null), '');
  assert.equal(formatVnd(2_500_000), '2.500.000 đ');
  assert.equal(formatVnd(null), '—');
});

test('validateDesiredPrice: optional, numbers only, capped', () => {
  assert.equal(validateDesiredPrice(''), undefined);
  assert.equal(validateDesiredPrice('20.000.000'), undefined);
  assert.match(validateDesiredPrice('abc'), /Chỉ nhập số/);
  assert.match(validateDesiredPrice('3.000.000.000'), /tối đa/);
});
