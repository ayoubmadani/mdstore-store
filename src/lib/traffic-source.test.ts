// node --experimental-strip-types --test src/lib/traffic-source.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectSource, withSource } from './traffic-source.ts';

const d = (url: string, referrer = '', host = 'shop.mdstore.top') => detectSource(new URL(url, 'https://shop.mdstore.top').search, referrer, host);

test('ad click ids win: Facebook, TikTok, Google, Bing, Snapchat', () => {
  assert.equal(d('/?fbclid=abc').channel, 'facebook');
  assert.equal(d('/?ttclid=x').channel, 'tiktok');
  assert.equal(d('/?gclid=x').channel, 'google');
  assert.equal(d('/?wbraid=x').channel, 'google');
  assert.equal(d('/?msclkid=x').channel, 'bing');
  assert.equal(d('/?ScCid=x').channel, 'snapchat');
});

test('utm source and campaign are kept', () => {
  const s = d('/?utm_source=ig&utm_medium=paid&utm_campaign=Promo%20Hiver&utm_content=Video%201');
  assert.deepEqual(s, { channel: 'instagram', source: 'ig', medium: 'paid', campaign: 'Promo Hiver', content: 'Video 1' });
  assert.equal(d('/?utm_source=newsletter').channel, 'other');
});

test('referrer when there is no tag; own site and none = direct', () => {
  assert.equal(d('/', 'https://l.facebook.com/l.php?u=x').channel, 'facebook');
  assert.equal(d('/', 'https://www.instagram.com/').channel, 'instagram');
  assert.equal(d('/', 'https://www.tiktok.com/@x').channel, 'tiktok');
  assert.equal(d('/', 'https://www.google.dz/').channel, 'google');
  assert.equal(d('/', 'https://m.youtube.com/').channel, 'youtube');
  assert.equal(d('/', 'https://wa.me/').channel, 'whatsapp');
  assert.deepEqual(d('/', 'https://blog.example.com/post'), { channel: 'other', ref: 'blog.example.com' });
  assert.equal(d('/', 'https://shop.mdstore.top/product/1').channel, 'direct');
  assert.equal(d('/', '').channel, 'direct');
});

test('the source is added to an order body (object or array), nothing else is touched', () => {
  const src = { channel: 'tiktok' };
  assert.deepEqual(withSource({ a: 1 }, src), { a: 1, trafficSource: src });
  assert.deepEqual(withSource([{ a: 1 }, { a: 2 }], src), [{ a: 1, trafficSource: src }, { a: 2 }]);
  assert.deepEqual(withSource({ a: 1 }, null), { a: 1 });
});
