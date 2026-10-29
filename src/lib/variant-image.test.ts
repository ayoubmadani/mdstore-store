// node --test src/lib/variant-image.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imageIndexForSelection, variantForImage } from './variant-image.ts';

const attrs = [
  { name: 'اللون', variants: [{ value: '#f00', imageUrl: 'B' }, { value: '#00f', imageUrl: null }] },
  { name: 'المقاس', variants: [{ value: 'M' }] },
];
const images = ['A', 'B', 'C'];

test('choosing a linked colour points to its image', () => {
  assert.equal(imageIndexForSelection(attrs, { 'اللون': '#f00', 'المقاس': 'M' }, images), 1);
});

test('no link, unknown image or nothing selected → -1', () => {
  assert.equal(imageIndexForSelection(attrs, { 'اللون': '#00f' }, images), -1);
  assert.equal(imageIndexForSelection(attrs, { 'اللون': '#f00' }, ['A']), -1);
  assert.equal(imageIndexForSelection(attrs, {}, images), -1);
  assert.equal(imageIndexForSelection(undefined, { x: 'y' }, images), -1);
});

test('tapping an image finds the colour linked to it', () => {
  assert.deepEqual(variantForImage(attrs, 'B'), { name: 'اللون', value: '#f00' });
  assert.equal(variantForImage(attrs, 'C'), null);
});
