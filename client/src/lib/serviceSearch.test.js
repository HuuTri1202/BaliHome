import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchServiceSlug, normalizeQuery, serviceSearchPath } from './serviceSearch.js';

test('normalizes Vietnamese diacritics, đ and punctuation', () => {
  assert.equal(normalizeQuery('  Đăng   QUẢNG cáo!! '), 'dang quang cao');
});

test('matches services with or without diacritics', () => {
  assert.equal(matchServiceSlug('In ấn danh thiếp'), 'in-an');
  assert.equal(matchServiceSlug('thiet ke logo'), 'design');
  assert.equal(matchServiceSlug('Làm website bán hàng'), 'web');
  assert.equal(matchServiceSlug('chạy quảng cáo Facebook'), 'marketing');
});

test('earliest phrase wins, then the longer one at the same position', () => {
  assert.equal(matchServiceSlug('website ban hang'), 'web');
  assert.equal(matchServiceSlug('ban hang qua website'), 'sales');
  assert.equal(matchServiceSlug('profile card'), 'profile-card');
});

test('does not match keywords inside other words', () => {
  assert.equal(matchServiceSlug('tin tức'), null);
});

test('returns null for empty or unknown queries', () => {
  assert.equal(matchServiceSlug(''), null);
  assert.equal(matchServiceSlug('   '), null);
  assert.equal(matchServiceSlug(undefined), null);
  assert.equal(matchServiceSlug('xyz'), null);
});

test('builds the target path', () => {
  assert.equal(serviceSearchPath('logo'), '/dich-vu/design');
  assert.equal(serviceSearchPath('không rõ'), '/dich-vu');
});
