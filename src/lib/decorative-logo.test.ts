import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h, Fragment, isValidElement } from 'react';
import { decorativeImages } from './decorative-logo.ts';

const alts = (node: unknown): string[] => {
  const out: string[] = [];
  const walk = (n: any) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!isValidElement(n)) return;
    const p = n.props as any;
    if (n.type === 'img') out.push(p.alt);
    walk(p.children);
  };
  walk(node);
  return out;
};

test('a logo shown next to the store name repeats nothing to a screen reader', () => {
  assert.deepEqual(alts(decorativeImages(h('img', { src: 'l.png', alt: 'Baby Shop' }))), ['']);
});

test('a logo wrapped in other elements or a fragment is reached too', () => {
  const tree = h(Fragment, null, h('div', { className: 'box' }, h('img', { src: 'l.png', alt: 'Baby Shop' })), h('span', null, 'x'));
  assert.deepEqual(alts(decorativeImages(tree)), ['']);
});

test('everything else on the image is kept', () => {
  const out: any = decorativeImages(h('img', { src: 'l.png', alt: 'Baby Shop', style: { height: 34 }, className: 'logo' }));
  assert.equal(out.props.src, 'l.png');
  assert.deepEqual(out.props.style, { height: 34 });
  assert.equal(out.props.className, 'logo');
});

test('text and empty children pass through', () => {
  assert.equal(decorativeImages('Shop'), 'Shop');
  assert.equal(decorativeImages(null), null);
});
