import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countByGroup, filterRequests, foldText } from './requestFilters.js';

const REQUESTS = [
  { code: 'BLH-2026-0001', status: 'NEW', needLabel: 'Thiết kế', company: 'Cà phê Đà Lạt', message: 'Logo mới' },
  { code: 'BLH-2026-0002', status: 'IN_PROGRESS', needLabel: 'Website', company: '', message: 'Trang bán hàng' },
  { code: 'BLH-2026-0003', status: 'DONE', needLabel: 'In ấn', message: 'Danh thiếp' },
  { code: 'BLH-2026-0004', status: 'CANCELLED', needLabel: 'Marketing' },
];
const codes = (list) => list.map((r) => r.code.slice(-1));

test('foldText removes Vietnamese diacritics and lowercases', () => {
  assert.equal(foldText('  Thiết Kế Đà Lạt '), 'thiet ke da lat');
  assert.equal(foldText(undefined), '');
});

test('groups: đang xử lý = NEW + CONTACTED + IN_PROGRESS; unknown group falls back to all', () => {
  assert.deepEqual(codes(filterRequests(REQUESTS, { group: 'dang-xu-ly' })), ['1', '2']);
  assert.deepEqual(codes(filterRequests(REQUESTS, { group: 'hoan-thanh' })), ['3']);
  assert.deepEqual(codes(filterRequests(REQUESTS, { group: 'da-huy' })), ['4']);
  assert.deepEqual(codes(filterRequests(REQUESTS, { group: 'khong-co' })), ['1', '2', '3', '4']);
});

test('search matches code, service, company and message, with or without diacritics', () => {
  assert.deepEqual(codes(filterRequests(REQUESTS, { query: 'thiet ke' })), ['1']);
  assert.deepEqual(codes(filterRequests(REQUESTS, { query: 'da lat' })), ['1']);
  assert.deepEqual(codes(filterRequests(REQUESTS, { query: '0003' })), ['3']);
  assert.deepEqual(codes(filterRequests(REQUESTS, { query: 'bán hàng' })), ['2']);
  assert.deepEqual(codes(filterRequests(REQUESTS, { query: 'website ban' })), ['2']); // mọi từ đều phải khớp
  assert.deepEqual(codes(filterRequests(REQUESTS, { query: 'không có' })), []);
});

test('group and search combine', () => {
  assert.deepEqual(codes(filterRequests(REQUESTS, { group: 'hoan-thanh', query: 'logo' })), []);
});

test('countByGroup', () => {
  assert.deepEqual(countByGroup(REQUESTS), { 'tat-ca': 4, 'dang-xu-ly': 2, 'hoan-thanh': 1, 'da-huy': 1 });
});
