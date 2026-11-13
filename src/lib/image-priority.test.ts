import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firstImageBlock, imgLoading } from './image-priority.ts';

test('the first block that shows an image is the one loaded first', () => {
  const tree = [
    { type: 'spacer', props: { position: 'top' } },
    { type: 'image', props: { src: 'a.webp' } },
    { type: 'productImages', props: { images: ['b.webp'] } },
  ];
  assert.equal(firstImageBlock(tree), 1);
});

test('a product gallery counts when it opens the page', () => {
  assert.equal(firstImageBlock([{ type: 'productImages', props: { images: ['b.webp'] } }, { type: 'image', props: { src: 'a.webp' } }]), 0);
});

test('an empty image block or an empty gallery is skipped', () => {
  const tree = [{ type: 'image', props: {} }, { type: 'productImages', props: { images: [] } }, { type: 'image', props: { src: 'c.webp' } }];
  assert.equal(firstImageBlock(tree), 2);
});

test('no image at all, or a missing tree: nothing is loaded first', () => {
  assert.equal(firstImageBlock([{ type: 'productForm' }]), -1);
  assert.equal(firstImageBlock(undefined), -1);
});

test('a theme product section before any image keeps its own images first', () => {
  assert.equal(firstImageBlock([{ type: 'themeProduct', props: {} }, { type: 'image', props: { src: 'a.webp' } }]), -1);
});

test('the first image is fetched with high priority, every other one is lazy', () => {
  assert.deepEqual(imgLoading(true), { fetchPriority: 'high', decoding: 'async' });
  assert.deepEqual(imgLoading(false), { loading: 'lazy', decoding: 'async' });
});
