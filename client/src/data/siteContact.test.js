import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapDirectionsUrl, mapEmbedUrl, sanitizeSiteContact, toTelHref } from './siteContact.js';

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
  assert.deepEqual(sanitizeSiteContact(EMPTY), { companyName: '', address: '', hotline: '', email: '', socialLinks: [], portfolioPath: '' });
});

test('company name, address and email: trimmed, invalid email hidden', () => {
  const result = sanitizeSiteContact({ ...EMPTY, companyName: '  CÔNG TY TNHH  BALI HOME ', address: ' 73 Đường 12,  Khu phố 5 ', email: ' Nhanhoadondt@Gmail.com ' });
  assert.equal(result.companyName, 'CÔNG TY TNHH BALI HOME');
  assert.equal(result.address, '73 Đường 12, Khu phố 5');
  assert.equal(result.email, 'nhanhoadondt@gmail.com');
  ['khong-phai-email', 'a@b', '   '].forEach((email) => assert.equal(sanitizeSiteContact({ ...EMPTY, email }).email, '', email));
});

test('Google Maps links encode the address', () => {
  const address = '73 Đường 12, Phường Hiệp Bình';
  assert.equal(mapEmbedUrl(address), `https://www.google.com/maps?q=${encodeURIComponent(address)}&hl=vi&z=16&output=embed`);
  assert.ok(mapDirectionsUrl(address).startsWith('https://www.google.com/maps/dir/?api=1&destination=73%20%C4%90'));
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

test('toTelHref strips formatting and uses the Vietnam country code', () => {
  assert.equal(toTelHref('0900 000 000'), 'tel:+84900000000');
  assert.equal(toTelHref('+84 (90) 000-0000'), 'tel:+84900000000');
  assert.equal(toTelHref('0084 900 000 000'), 'tel:+84900000000');
  assert.equal(toTelHref('+84 (0) 900 000 000'), 'tel:+84900000000');
});
