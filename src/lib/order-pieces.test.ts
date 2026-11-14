import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitPrice, piecesPerBox, fitBoxes, pieceVariantId, valueAvailable, boxLines, linesTotal } from '../components/theme/orderPieces.ts';
import { addonsTotal } from '../components/theme/addonPicks.ts';

// صفحة المنتج: العرض ← الكمية ← بطاقة لكل عرض فيها قطعه ← خيارات وإضافات كل قطعة.
// عرض قطعتين × كمية 2 = بطاقتان، في كل بطاقة قطعتان. الطلب يصل سطوراً (كطلبات السلة).
const product = {
  price: 1500,
  attributes: [{ name: 'المقاس' }, { name: 'اللون' }],
  variantDetails: [
    { id: 'vM-r', price: -1, name: [{ attrName: 'المقاس', value: 'M' }, { attrName: 'اللون', value: 'red' }], isActive: true },
    { id: 'vL-b', price: 1700, name: [{ attrName: 'المقاس', value: 'L' }, { attrName: 'اللون', value: 'blue' }], isActive: true },
    { id: 'vS-r', price: 0, name: [{ attrName: 'المقاس', value: 'S' }, { attrName: 'اللون', value: 'red' }], isActive: false },
  ],
  offers: [{ id: 'o2', name: 'قطعتين', quantity: 2, price: 3500 }, { id: 'o3', name: '3 قطع', quantity: 3, price: 1000 }],
  addons: [{ id: 'c', name: 'جبن', price: 100, maxQty: 3 }],
};
const addons = (ids: string[]) => addonsTotal(product, ids);
const M = { variants: { 'المقاس': 'M', 'اللون': 'red' }, addonIds: [] as string[] };
const L = { variants: { 'المقاس': 'L', 'اللون': 'blue' }, addonIds: [] as string[] };

test('the offer price is split over its pieces, the remainder on the first piece', () => {
  assert.deepEqual(splitPrice(3500, 2), [1750, 1750]);
  assert.deepEqual(splitPrice(1000, 3), [334, 333, 333]);
  assert.deepEqual(splitPrice(999, 1), [999]);
});

test('pieces per card = the offer pieces, else 1', () => {
  assert.equal(piecesPerBox(product, 'o2'), 2);
  assert.equal(piecesPerBox(product, null), 1);
  assert.equal(piecesPerBox(product, 'missing'), 1);
});

test('cards follow the quantity; a new card or piece copies the one before it', () => {
  let boxes = fitBoxes([], 1, 2, M);
  assert.deepEqual(boxes, [[M, M]]);
  boxes = [[M, L]];
  boxes = fitBoxes(boxes, 2, 2, M);
  assert.deepEqual(boxes, [[M, L], [M, L]]);
  assert.notEqual(boxes[1][0], boxes[0][0]); // نسخة، لا نفس الكائن
  assert.deepEqual(fitBoxes(boxes, 1, 3, M), [[M, L, L]]);
  assert.deepEqual(fitBoxes(boxes, 0, 2, M), [[M, L]]); // كمية أقلها 1
});

test('the variant of a piece, and which values can still be chosen', () => {
  assert.equal(pieceVariantId(product, M.variants), 'vM-r');
  assert.equal(pieceVariantId(product, { 'المقاس': 'M' }), undefined); // ناقص = لا نسخة
  assert.equal(valueAvailable(product, M.variants, 'المقاس', 'L'), false); // L متاح بالأزرق فقط
  assert.equal(valueAvailable(product, { 'المقاس': 'L' }, 'اللون', 'blue'), true);
  assert.equal(valueAvailable(product, {}, 'المقاس', 'S'), false); // نسخة معطّلة
});

test('lines: identical pieces grouped, offer price split, variant price used without offer, add-ons per piece', () => {
  const withCheese = { ...M, addonIds: ['c', 'c'] };
  const lines = boxLines(product, 'o2', [[M, L], [M, withCheese]], addons);
  assert.deepEqual(lines.map((l) => [l.variantDetailId, l.quantity, l.finalPrice, l.addonIds]), [
    ['vM-r', 2, 1750, []],
    ['vL-b', 1, 1750, []],
    ['vM-r', 1, 1950, ['c', 'c']],
  ]);
  assert.equal(linesTotal(lines), 3500 * 2 + 200);
  // بلا عرض: سعر النسخة (‎-1 = سعر المنتج)
  const plain = boxLines(product, null, [[M], [L], [M]], addons);
  assert.deepEqual(plain.map((l) => [l.variantDetailId, l.quantity, l.finalPrice]), [['vM-r', 2, 1500], ['vL-b', 1, 1700]]);
  assert.deepEqual(plain[0].selectedVariants, M.variants);
});

test('an offer that does not split evenly keeps its exact price per card', () => {
  const lines = boxLines(product, 'o3', [[M, M, M]], addons);
  assert.equal(linesTotal(lines), 1000);
});
