// node --test src/lib/image-size.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { imageSize, withImageSizes } from './image-size.ts';

const fx: Record<string, string> = JSON.parse(readFileSync(new URL('./image-size.fixtures.json', import.meta.url), 'utf8'));
const buf = (k: string) => new Uint8Array(Buffer.from(fx[k], 'base64'));

test('reads width/height from the header of every format we serve', () => {
  for (const k of ['png', 'jpeg', 'webpLossy', 'webpLossless', 'webpAlpha', 'gif']) assert.deepEqual(imageSize(buf(k)), { width: 300, height: 200 }, k);
});

test('unknown or truncated data gives null instead of throwing', () => {
  assert.equal(imageSize(new Uint8Array([1, 2, 3])), null);
  assert.equal(imageSize(buf('jpeg').slice(0, 20)), null);
});

test('withImageSizes adds natural sizes to image blocks without a fixed height, once per url', async () => {
  let calls = 0;
  const fetchHead = async () => { calls++; return buf('webpLossy'); };
  const page = { tree: [
    { type: 'image', props: { src: 'https://cdn/x.webp' } },
    { type: 'image', props: { src: 'https://cdn/x.webp' } },
    { type: 'image', props: { src: 'https://cdn/y.webp', height: 400 } },
    { type: 'spacer', props: { height: 20 } },
  ] };
  const out = await withImageSizes(page, fetchHead);
  assert.deepEqual(out.tree[0].props, { src: 'https://cdn/x.webp', naturalWidth: 300, naturalHeight: 200 });
  assert.equal(out.tree[2].props.naturalWidth, undefined);
  assert.equal(calls, 1);
});

test('a failing image fetch leaves the page as it was', async () => {
  const page = { tree: [{ type: 'image', props: { src: 'https://cdn/broken.webp' } }] };
  const out = await withImageSizes(page, async () => { throw new Error('timeout'); });
  assert.deepEqual(out.tree[0].props, { src: 'https://cdn/broken.webp' });
});
