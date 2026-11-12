// node --test src/components/builderPages/themeBare.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cartOff, withPageAttribution } from './themeBare.ts';

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
