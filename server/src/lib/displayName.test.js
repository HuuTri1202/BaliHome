import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanName, pickDisplayName } from './displayName.js';

const USER_ID = '3f2a9c1e-77b4-4c2d-9e10-aa55bb66cc77';

test('1. uses the provider name when it is usable', () => {
  assert.equal(pickDisplayName({ name: 'Trần Thị Bình', givenName: 'Bình', familyName: 'Trần', email: 'b@x.vn', userId: USER_ID }), 'Trần Thị Bình');
});

test('2. falls back to family + given name (Vietnamese order)', () => {
  assert.equal(pickDisplayName({ name: null, givenName: 'Văn An', familyName: 'Nguyễn', email: 'an@x.vn', userId: USER_ID }), 'Nguyễn Văn An');
  // Chỉ có tên (không có họ) vẫn ghép được
  assert.equal(pickDisplayName({ name: '  ', givenName: 'An', familyName: null, email: null, userId: USER_ID }), 'An');
});

test('3. falls back to the part of the email before @', () => {
  assert.equal(pickDisplayName({ name: '', givenName: null, familyName: null, email: 'ngthaihien12@gmail.com', userId: USER_ID }), 'ngthaihien12');
});

test('4. last resort: "Khách hàng #<first 8 chars of id>"', () => {
  assert.equal(pickDisplayName({ name: '🐧', givenName: null, familyName: null, email: null, userId: USER_ID }), 'Khách hàng #3F2A9C1E');
  assert.equal(pickDisplayName({ name: 'A', email: '1@x.vn', userId: USER_ID }), 'Khách hàng #3F2A9C1E'); // quá ngắn, email không có chữ
});

test('cleanName: NFC, removes invisible characters, collapses spaces, caps length', () => {
  const decomposed = 'Nguyễn'; // "Nguyễn" dạng tổ hợp
  assert.equal(cleanName(decomposed), 'Nguyễn');
  assert.equal(cleanName(decomposed).length, 'Nguyễn'.normalize('NFC').length);
  assert.equal(cleanName('  Lê​   Văn\tTám\n '), 'Lê Văn Tám');
  assert.equal(cleanName('x'.repeat(150)).length, 100);
  assert.equal(cleanName(undefined), '');
});
