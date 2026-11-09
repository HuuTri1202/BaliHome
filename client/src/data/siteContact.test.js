import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sanitizeSiteContact, toTelHref } from './siteContact.js';

const EMPTY = { hotline: '', social: [], portfolioPath: '' };

test('keeps valid values and trims surrounding spaces', () => {
  const result = sanitizeSiteContact({
    hotline: ' 0900 000 000 ',
    social: [{ label: 'Facebook', href: 'https://facebook.com/balihome' }],
    portfolioPath: '/du-an',
  });

  assert.equal(result.hotline, '0900 000 000');
  assert.equal(result.socialLinks.length, 1);
  assert.equal(result.portfolioPath, '/du-an');
});

test('hides everything when the config is empty', () => {
  assert.deepEqual(sanitizeSiteContact(EMPTY), { hotline: '', socialLinks: [], portfolioPath: '' });
});

test('rejects a hotline that is not a phone number', () => {
  ['Liên hệ', '   ', '123', '0900 000 000 máy lẻ 5'].forEach((hotline) => {
    assert.equal(sanitizeSiteContact({ ...EMPTY, hotline }).hotline, '', hotline);
  });
});

test('drops social links that are not full https URLs', () => {
  const social = ['', 'zalo.me/x', 'http://zalo.me/x', 'javascript:alert(1)'].map((href) => ({ label: 'X', href }));
  assert.deepEqual(sanitizeSiteContact({ ...EMPTY, social }).socialLinks, []);
});

test('accepts only internal paths for the portfolio page', () => {
  ['du-an', 'https://x.vn', '//x.vn', '/'].forEach((portfolioPath) => {
    assert.equal(sanitizeSiteContact({ ...EMPTY, portfolioPath }).portfolioPath, '', portfolioPath);
  });
});

test('toTelHref strips formatting but keeps the plus sign', () => {
  assert.equal(toTelHref('0900 000 000'), 'tel:0900000000');
  assert.equal(toTelHref('+84 (90) 000-0000'), 'tel:+84900000000');
});
