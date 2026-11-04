// node --test src/components/builderPages/marquee.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marqueeOf, marqueeRepeat, marqueeLayout, MARQUEE_DIRECTIONS } from './marquee.ts';

test('scrolling text is off unless a direction is chosen', () => {
  assert.equal(marqueeOf({}), null);
  assert.equal(marqueeOf({ marquee: 'none' }), null);
  assert.equal(marqueeOf({ marquee: 'weird' }), null);
  assert.deepEqual(MARQUEE_DIRECTIONS, ['none', 'rtl', 'ltr']);
});

test('direction and speed (seconds to cross the band once, 3..60, default 12)', () => {
  assert.deepEqual(marqueeOf({ marquee: 'rtl' }), { dir: 'rtl', seconds: 12 });
  assert.deepEqual(marqueeOf({ marquee: 'ltr', marqueeSpeed: 1 }), { dir: 'ltr', seconds: 3 });
  assert.deepEqual(marqueeOf({ marquee: 'rtl', marqueeSpeed: 500 }), { dir: 'rtl', seconds: 60 });
});


test('copies across the band: 1..10, default 1', () => {
  assert.equal(marqueeRepeat({}), 1);
  assert.equal(marqueeRepeat({ marqueeRepeat: 0 }), 1);
  assert.equal(marqueeRepeat({ marqueeRepeat: 50 }), 10);
});

test('layout: copies spaced band/N — one exits as the next enters (N=1), exit/middle/enter (N=2)', () => {
  // band 500px, text 100px, min gap 40px
  assert.deepEqual(marqueeLayout({ band: 500, text: 100, gap: 40, repeat: 1, seconds: 10 }), { spacing: 500, count: 2, duration: 10 });
  assert.deepEqual(marqueeLayout({ band: 500, text: 100, gap: 40, repeat: 2, seconds: 10 }), { spacing: 250, count: 3, duration: 5 });
});

test('layout takes the text length into account: long text never overlaps the next copy', () => {
  // text 400px + gap 40 > band/2 → spacing 440, still enough copies to fill the band
  assert.deepEqual(marqueeLayout({ band: 500, text: 400, gap: 40, repeat: 2, seconds: 10 }), { spacing: 440, count: 3, duration: 8.8 });
  // text longer than the band
  assert.deepEqual(marqueeLayout({ band: 300, text: 700, gap: 30, repeat: 1, seconds: 6 }), { spacing: 730, count: 2, duration: 14.6 });
});

test('layout before measuring (band 0) stays safe', () => {
  assert.equal(marqueeLayout({ band: 0, text: 0, gap: 0, repeat: 1, seconds: 12 }), null);
});
