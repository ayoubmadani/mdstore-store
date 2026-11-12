// node --test src/components/builderPages/themeBare.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capMediaQueries, cartOff, withPageAttribution } from './themeBare.ts';

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
