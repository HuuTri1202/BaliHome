import assert from 'node:assert/strict';
import { test } from 'node:test';
import { passwordChecks, rules } from './validators.js';

const metFlags = (password) => passwordChecks(password).map((check) => check.isMet);

test('no rule is met for an empty password', () => {
  assert.deepEqual(metFlags(''), [false, false, false]);
});

test('each rule turns on independently as the user types', () => {
  assert.deepEqual(metFlags('abc'), [false, true, false]);
  assert.deepEqual(metFlags('123'), [false, false, true]);
  assert.deepEqual(metFlags('abcdefgh'), [true, true, false]);
  assert.deepEqual(metFlags('12345678'), [true, false, true]);
  assert.deepEqual(metFlags('abc12345'), [true, true, true]);
});

test('Vietnamese letters count as letters', () => {
  assert.deepEqual(metFlags('đ'), [false, true, false]);
});

test('checklist and submit validation agree on when a password is acceptable', () => {
  ['', 'abc', 'abcdefgh', '12345678', 'abc1234'].forEach((password) => {
    assert.ok(metFlags(password).includes(false), password);
    assert.notEqual(rules.newPassword(password), undefined, password);
  });
  assert.ok(metFlags('abc12345').every(Boolean));
  assert.equal(rules.newPassword('abc12345'), undefined);
});
