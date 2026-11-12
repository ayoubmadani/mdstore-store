// node --experimental-strip-types --test src/lib/pixel-scope.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pixelInScope } from './pixel-scope.ts';

const store = { scope: 'store' };
const page = { scope: 'landing_page', builderPageId: 'B1' };
const mine = { scope: 'product', productId: 'P1' };
const other = { scope: 'product', productId: 'P2' };

test('a product pixel fires on every landing page of that product', () => {
  const ctx = { pageType: 'landing_page' as const, landingPageId: 'B1', productId: 'P1' };
  assert.deepEqual([store, page, mine, other].map((p) => pixelInScope(p, ctx)), [false, true, true, false]);
});

test('without a product the landing page keeps only its own pixels', () => {
  assert.equal(pixelInScope(mine, { pageType: 'landing_page', landingPageId: 'B1' }), false);
});

test('store and product pages are unchanged', () => {
  assert.deepEqual([store, page, mine].map((p) => pixelInScope(p, { pageType: 'store' })), [true, false, false]);
  assert.deepEqual([store, mine, other].map((p) => pixelInScope(p, { pageType: 'product', productId: 'P1' })), [false, true, false]);
});
