// node --experimental-strip-types --test src/lib/store-args.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storeArgs } from './store-args.ts';

test('the layout (domain only) and the home page (empty filters) ask for the same thing', () => {
  assert.deepEqual(storeArgs(), ['', '', '']);
  assert.deepEqual(storeArgs(undefined, undefined, undefined), storeArgs());
  assert.deepEqual(storeArgs('', '', ''), storeArgs());
});

test('page 1 is the home page', () => {
  assert.deepEqual(storeArgs(undefined, undefined, '1'), storeArgs());
});

test('a category, a search or a later page is its own request', () => {
  assert.deepEqual(storeArgs('c1', 'shoes', '2'), ['c1', 'shoes', '2']);
  assert.deepEqual(storeArgs('c1'), ['c1', '', '']);
});
