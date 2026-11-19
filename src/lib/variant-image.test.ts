// node --test src/lib/variant-image.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imageIndexForSelection, variantForImage, withOptionImages } from './variant-image.ts';

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

// a picture option (its value is the picture) needs no link: choosing it shows its own picture
const pics = [{ name: 'Couleur', variants: [{ value: 'https://cdn/x1.jpg', imageUrl: null }, { value: 'https://cdn/x2.jpg', imageUrl: 'https://cdn/g2.jpg' }] }];

test('a picture option without a link shows its own picture (when it is in the gallery)', () => {
  assert.equal(imageIndexForSelection(pics, { Couleur: 'https://cdn/x1.jpg' }, ['https://cdn/g1.jpg', 'https://cdn/x1.jpg']), 1);
  // linked: its link wins
  assert.equal(imageIndexForSelection(pics, { Couleur: 'https://cdn/x2.jpg' }, ['https://cdn/g2.jpg', 'https://cdn/x2.jpg']), 0);
});

test('the gallery gets the pictures of unlinked picture options it does not have yet', () => {
  assert.deepEqual(withOptionImages(['https://cdn/g1.jpg', 'https://cdn/x1.jpg'], pics), ['https://cdn/g1.jpg', 'https://cdn/x1.jpg']);
  assert.deepEqual(withOptionImages(['https://cdn/g1.jpg'], pics), ['https://cdn/g1.jpg', 'https://cdn/x1.jpg']); // x2 is linked: not added
  assert.deepEqual(withOptionImages(['A'], attrs), ['A']); // colours / text: nothing added
});

test('tapping the picture of a picture option selects it', () => {
  assert.deepEqual(variantForImage(pics, 'https://cdn/x1.jpg'), { name: 'Couleur', value: 'https://cdn/x1.jpg' });
});
