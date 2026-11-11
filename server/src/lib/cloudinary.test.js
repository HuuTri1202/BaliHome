// Chạy: npm test -w server
import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.DATABASE_URL ??= 'postgresql://test@localhost/test';
process.env.JWT_ACCESS_SECRET ??= 'x'.repeat(32);
process.env.CLOUDINARY_URL = 'cloudinary://key:secret@balicloud';
const { isOwnUpload } = await import('./cloudinary.js');

const OWN = { url: 'https://res.cloudinary.com/balicloud/image/upload/v1/balihome/requests/abc.png', publicId: 'balihome/requests/abc' };

test('accepts a file in our cloud and folder', () => {
  assert.equal(isOwnUpload(OWN), true);
});

test('rejects dot segments that escape to another cloud', () => {
  assert.equal(isOwnUpload({ ...OWN, url: 'https://res.cloudinary.com/balicloud/../evilcloud/image/upload/balihome/requests/abc.png' }), false);
});

test('rejects a url that does not contain the publicId', () => {
  assert.equal(isOwnUpload({ ...OWN, url: 'https://res.cloudinary.com/balicloud/image/upload/v1/other/abc.png' }), false);
});

test('rejects other hosts, plain http and malformed urls', () => {
  ['https://res.cloudinary.com.evil.io/balicloud/balihome/requests/abc.png', 'http://res.cloudinary.com/balicloud/balihome/requests/abc.png', 'not a url'].forEach((url) => {
    assert.equal(isOwnUpload({ ...OWN, url }), false, url);
  });
});

test('rejects a publicId outside our folder', () => {
  assert.equal(isOwnUpload({ url: 'https://res.cloudinary.com/balicloud/image/upload/x/abc.png', publicId: 'x/abc' }), false);
  assert.equal(isOwnUpload({ ...OWN, publicId: 'balihome/requests/../x' }), false);
});
