// node --test src/components/builderPages/themeBare.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buttonAccent, capMediaQueries, cartOff, landingContextFromOrder, withLandingContext, withPageAttribution } from './themeBare.ts';

test('cart is off on both the product store and the store, nothing else changes', () => {
  const { product, store } = cartOff({ id: 'p', store: { id: 's', cart: true } }, { id: 's', cart: true, name: 'x' });
  assert.deepEqual(product, { id: 'p', store: { id: 's', cart: false } });
  assert.deepEqual(store, { id: 's', cart: false, name: 'x' });
});

test('an order posted by the theme inside a builder page is attributed to that page', () => {
  assert.deepEqual(withPageAttribution('https://api/orders', 'post', { a: 1 }, 'B1', 'S1'), { a: 1, builderPageId: 'B1', splitTestId: 'S1' });
  assert.deepEqual(withPageAttribution('https://api/orders/create', 'POST', { a: 1 }, 'B1'), { a: 1, builderPageId: 'B1' });
});

test('other requests are untouched', () => {
  const d = { a: 1 };
  assert.equal(withPageAttribution('https://api/shipping/x', 'post', d, 'B1'), d);
  assert.equal(withPageAttribution('https://api/orders', 'get', d, 'B1'), d);
  assert.equal(withPageAttribution('https://api/orders/abandoned', 'post', d, 'B1'), d);
});

test('theme CSS inside a 720px landing page behaves as if the screen were at most 720px wide', () => {
  const css = '@media (min-width: 1024px){.a{x:1}}@media (min-width:768px){.b{x:1}}@media (min-width: 640px){.c{x:1}}'
    + '@media (max-width:480px){.d{x:1}}@media (max-width: 900px){.e{x:1}}@media (min-width: 768px) and (max-width: 1023px){.f{x:1}}';
  assert.equal(capMediaQueries(css, 720),
    '@media (min-width: 99999px){.a{x:1}}@media (min-width:99999px){.b{x:1}}@media (min-width: 640px){.c{x:1}}'
    + '@media (max-width:480px){.d{x:1}}@media (min-width: 0px){.e{x:1}}@media (min-width: 99999px) and (min-width: 0px){.f{x:1}}');
});

test('an order sent from the theme block keeps the landing page context (thank-you page of the landing)', () => {
  const ctx = landingContextFromOrder(
    { builderPageId: 'bp', productId: 'p', backUrl: '/', language: 'ar', pixels: [{ id: 'x' }], accent: '#f00', section: '#111' },
    { quantity: 2, customerName: 'ali', customerPhone: '0555', productImage: 'img' },
  );
  assert.deepEqual(ctx, {
    builderPageId: 'bp', productId: 'p', backUrl: '/', language: 'ar', pixels: [{ id: 'x' }],
    productImage: 'img', quantity: 2, customerName: 'ali', customerPhone: '0555',
    colors: { accent: '#f00', section: '#111' },
  });
});

test('the thank-you page uses a fresh landing context only when the order has none', () => {
  const landing = { builderPageId: 'bp', colors: {} };
  const now = 1_000_000;
  assert.deepEqual(withLandingContext({ id: 'o' }, { at: now - 60_000, landing }, now), { id: 'o', landing });
  assert.deepEqual(withLandingContext({ id: 'o' }, { at: now - 31 * 60_000, landing }, now), { id: 'o' });
  assert.deepEqual(withLandingContext({ id: 'o', landing: { colors: { accent: 'a' } } }, { at: now, landing }, now), { id: 'o', landing: { colors: { accent: 'a' } } });
  // الثيم لا يحفظ last_order: الطلب من السياق نفسه (رقمه ومبلغه)
  assert.deepEqual(withLandingContext(null, { at: now, landing, order: { id: 'o9', total: 300 } }, now), { id: 'o9', total: 300, landing });
  assert.deepEqual(withLandingContext(null, { at: now, landing }, now), { landing });
  assert.deepEqual(withLandingContext({ id: 'old', total: 1 }, { at: now, landing, order: { id: 'o9', total: 300 } }, now), { id: 'o9', total: 300, landing });
  assert.equal(withLandingContext(null, null, now), null);
  assert.deepEqual(withLandingContext({ id: 'o' }, null, now), { id: 'o' });
});

test('the thank-you page takes the colour of the theme order button (widest solid, non-white button)', () => {
  assert.deepEqual(buttonAccent([
    { bg: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)', width: 40 },
    { bg: 'rgba(0, 0, 0, 0)', color: 'rgb(0, 0, 0)', width: 900 },
    { bg: 'rgb(58, 134, 255)', color: 'rgb(255, 255, 255)', width: 688 },
    { bg: 'rgb(37, 211, 102)', color: 'rgb(255, 255, 255)', width: 688 },
    { bg: 'rgb(240, 240, 240)', color: 'x', width: 300 },
  ]), { accent: 'rgb(58, 134, 255)', accentText: 'rgb(255, 255, 255)' });
  assert.equal(buttonAccent([{ bg: 'rgba(0, 0, 0, 0)', color: 'x', width: 10 }, { bg: '#ffffff', color: 'x', width: 10 }]), null);
  assert.equal(buttonAccent([]), null);
});
