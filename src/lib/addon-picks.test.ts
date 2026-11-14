import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addonCount, addonMax, setAddonCount, addonsTotal, addonsLabel } from '../components/theme/addonPicks.ts';

// إضافات الثيمات المشتركة: القائمة addonIds، وتكرار المعرّف = الكمية لكل قطعة (جبن، جبن = جبن ×2).
// السعر داخل سعر القطعة؛ الحد = «أقصى كمية لكل قطعة» عند التاجر (الافتراضي 1). الخادم يقرأ نفس الشكل.
const product = { addons: [
  { id: 'c', name: 'جبن', price: 100, maxQty: 3 },
  { id: 's', name: 'صلصة', price: 50 },
  { id: 'x', name: 'مخفي', price: 9, isActive: false },
] };

test('count and max: repeats are the quantity; max defaults to 1', () => {
  assert.equal(addonCount(['c', 'c', 's'], 'c'), 2);
  assert.equal(addonCount([], 'c'), 0);
  assert.equal(addonMax(product.addons[0]), 3);
  assert.equal(addonMax(product.addons[1]), 1);
});

test('setAddonCount writes the id n times, keeps the others, caps at the max, 0 removes', () => {
  assert.deepEqual(setAddonCount(['s'], product.addons[0], 2), ['s', 'c', 'c']);
  assert.deepEqual(setAddonCount(['s', 'c', 'c'], product.addons[0], 9), ['s', 'c', 'c', 'c']);
  assert.deepEqual(setAddonCount(['s', 'c', 'c'], product.addons[0], 0), ['s']);
  assert.deepEqual(setAddonCount([], product.addons[1], 5), ['s']);
});

test('total counts each add-on × its quantity (capped), ignores hidden ones', () => {
  assert.equal(addonsTotal(product, ['c', 'c', 's']), 250);
  assert.equal(addonsTotal(product, ['c', 'c', 'c', 'c']), 300);
  assert.equal(addonsTotal(product, ['s', 's']), 50);
  assert.equal(addonsTotal(product, ['x']), 0);
});

test('label shows ×n above 1', () => {
  assert.equal(addonsLabel(product, ['c', 'c', 's']), 'جبن ×2، صلصة');
  assert.equal(addonsLabel(product, []), '');
});
