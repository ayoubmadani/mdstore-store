// node --test src/lib/stray-file.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isStrayFile } from './stray-file.ts';

test('a dotted top-level path that is not a real file is stray (e.g. facebook crawler /meta.json)', () => {
  assert.equal(isStrayFile('/meta.json'), true);
  assert.equal(isStrayFile('/apple-app-site-association.json'), true);
  assert.equal(isStrayFile('/ads.txt'), true);
});

test('real files stay reachable', () => {
  for (const p of ['/robots.txt', '/llms.txt', '/sitemap.xml', '/icon.png', '/favicon.ico', '/favicon.png']) assert.equal(isStrayFile(p), false, p);
});

test('store pages, deeper paths and the domain segment in local dev are not touched', () => {
  for (const p of ['/', '/cart', '/product/iphone-13.5', '/sidobox.top', '/sbox.mdstore.top/product/x', '/_next/static/a.js', '/api/x.json', '/.well-known/assetlinks.json']) {
    assert.equal(isStrayFile(p), false, p);
  }
});
