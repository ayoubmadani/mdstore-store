// node --test src/lib/hero-device.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heroForDevice, isPhoneUA } from './hero-device.ts';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36';

test('phones are detected, desktops are not', () => {
  assert.equal(isPhoneUA(IPHONE), true);
  assert.equal(isPhoneUA(ANDROID), true);
  assert.equal(isPhoneUA(MAC), false);
  assert.equal(isPhoneUA(null), false);
});

test('a phone gets the phone cover as hero.imageUrl', () => {
  const store = { name: 's', hero: { imageUrl: 'D', mobileImageUrl: 'M', title: 't' } };
  assert.deepEqual(heroForDevice(store, IPHONE).hero, { imageUrl: 'M', mobileImageUrl: 'M', title: 't' });
  assert.equal(store.hero.imageUrl, 'D'); // لا يعدّل الأصل
});

test('desktop, or no phone cover, keeps the desktop cover', () => {
  const store = { hero: { imageUrl: 'D', mobileImageUrl: 'M' } };
  assert.equal(heroForDevice(store, MAC).hero.imageUrl, 'D');
  assert.equal(heroForDevice({ hero: { imageUrl: 'D', mobileImageUrl: null } }, IPHONE).hero.imageUrl, 'D');
  assert.equal(heroForDevice({ name: 'x' }, IPHONE).hero, undefined);
});
