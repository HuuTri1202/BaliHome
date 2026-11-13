import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sanitizeProjects } from './projects.js';

const VALID = {
  slug: 'web-abc',
  title: ' Website ABC ',
  summary: 'Tóm tắt.',
  cover: { src: '/projects/abc/cover.jpg', alt: 'Trang chủ ABC' },
};

test('keeps a project with the required fields and fills safe defaults', () => {
  assert.deepEqual(sanitizeProjects([VALID]), [{
    slug: 'web-abc', title: 'Website ABC', client: '', year: null, services: [], summary: 'Tóm tắt.',
    cover: VALID.cover, challenge: '', solution: '', results: [], gallery: [], link: '',
  }]);
});

test('drops entries missing required fields or with an unsafe slug', () => {
  const broken = [
    { ...VALID, slug: 'Có Dấu' },
    { ...VALID, slug: '../admin' },
    { ...VALID, title: '  ' },
    { ...VALID, summary: undefined },
    { ...VALID, cover: { src: '/a.jpg' } }, // thiếu alt → ảnh không có mô tả cho trình đọc màn hình
    null,
  ];
  assert.deepEqual(sanitizeProjects(broken), []);
});

test('keeps only the first of duplicate slugs', () => {
  const result = sanitizeProjects([VALID, { ...VALID, title: 'Bản trùng' }]);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'Website ABC');
});

test('cleans optional fields: non-https link, bad gallery images, non-integer year', () => {
  const [project] = sanitizeProjects([{
    ...VALID,
    year: '2026',
    link: 'javascript:alert(1)',
    gallery: [{ src: '/ok.jpg', alt: 'OK' }, { src: '/no-alt.jpg' }],
    results: ['Ra mắt đúng hạn', '', 3],
  }]);
  assert.equal(project.year, null);
  assert.equal(project.link, '');
  assert.deepEqual(project.gallery, [{ src: '/ok.jpg', alt: 'OK' }]);
  assert.deepEqual(project.results, ['Ra mắt đúng hạn']);
});
