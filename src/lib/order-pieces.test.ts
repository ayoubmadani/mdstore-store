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

// السلة: بطاقة لكل عرض (كما في صفحة المنتج) — وتتحول لسطور عند إرسال الطلب
import { boxEntries, variantText } from '../components/theme/orderPieces.ts';

test('cart: one entry per card, with its own lines and the card total', () => {
  const entries = boxEntries(product, 'o2', [[M, L], [M, { ...M, addonIds: ['c'] }]], addons);
  assert.equal(entries.length, 2);
  assert.deepEqual(entries[0].lines.map((l) => [l.variantDetailId, l.quantity, l.finalPrice]), [['vM-r', 1, 1750], ['vL-b', 1, 1750]]);
  assert.equal(entries[0].total, 3500);
  assert.equal(entries[1].total, 3600);
});

test('options as text use the value names the merchant gave', () => {
  const p = { attributes: [{ name: 'اللون', variants: [{ value: '#f00', name: 'أحمر' }] }, { name: 'المقاس', variants: [{ value: 'M', name: 'M' }] }] };
  assert.equal(variantText(p, { 'اللون': '#f00', 'المقاس': 'M' }), 'أحمر · M');
  assert.equal(variantText(p, {}), '');
});

// السلة: تغيير خيارات القطع من صفحة السلة
import { cartPieces, applyCartPieces } from '../components/theme/orderPieces.ts';

test('cart: an offer card turns into its pieces, and back into lines with the offer price split', () => {
  const entry = { selectedOffer: 'o2', finalPrice: 3500, offerBox: { lines: [{ variantDetailId: 'vM-r', selectedVariants: M.variants, addonIds: [], finalPrice: 1750, quantity: 2 }] } };
  const pieces = cartPieces(entry);
  assert.equal(pieces.length, 2);
  pieces[1] = { ...L };
  const next = applyCartPieces(entry, product, pieces, addons);
  assert.deepEqual(next.offerBox.lines.map((l) => [l.variantDetailId, l.quantity, l.finalPrice]), [['vM-r', 1, 1750], ['vL-b', 1, 1750]]);
  assert.equal(next.finalPrice, 3500);
  assert.equal(next.totalPrice, 3500);
});

test('cart: a plain item has one piece for all its quantity; its variant, price and add-ons follow the choice', () => {
  const entry = { selectedOffer: null, quantity: 3, finalPrice: 1500, selectedVariants: M.variants, variantDetailId: 'vM-r', addonIds: [] };
  const pieces = cartPieces(entry);
  assert.equal(pieces.length, 1);
  const next = applyCartPieces(entry, product, [{ variants: L.variants, addonIds: ['c'] }], addons);
  assert.equal(next.variantDetailId, 'vL-b');
  assert.equal(next.finalPrice, 1700 + 100);
  assert.deepEqual(next.addonIds, ['c']);
  assert.equal(next.quantity, 3);
  assert.equal(next.totalPrice, (1700 + 100) * 3);
});

import { changeCartOffer } from '../components/theme/orderPieces.ts';

test('cart: switching a card\'s offer keeps the first pieces, copies the last for more, and reprices', () => {
  const two = { selectedOffer: 'o2', quantity: 1, finalPrice: 3500, offerBox: { lines: [
    { variantDetailId: 'vM-r', selectedVariants: M.variants, addonIds: [], finalPrice: 1750, quantity: 1 },
    { variantDetailId: 'vL-b', selectedVariants: L.variants, addonIds: [], finalPrice: 1750, quantity: 1 }] } };
  const three = changeCartOffer(two, product, 'o3', addons);
  assert.equal(three.selectedOffer, 'o3');
  assert.deepEqual(three.offerBox.lines.map((l) => [l.variantDetailId, l.quantity]), [['vM-r', 1], ['vL-b', 2]]);
  assert.equal(three.finalPrice, 1000);
  // بدون عرض: منتج عادي بكمية = عدد القطع، بخيارات القطعة الأولى
  const plain = changeCartOffer(two, product, null, addons);
  assert.equal(plain.selectedOffer, null);
  assert.equal(plain.offerBox, undefined);
  assert.equal(plain.quantity, 2);
  assert.equal(plain.variantDetailId, 'vM-r');
  assert.equal(plain.finalPrice, 1500);
  // منتج عادي ← عرض قطعتين
  const back = changeCartOffer(plain, product, 'o2', addons);
  assert.equal(back.offerBox.lines.reduce((s, l) => s + l.quantity, 0), 2);
  assert.equal(back.finalPrice, 3500);
});

test('cartOrderItems: an offer card becomes its piece lines, a plain item stays as it is', async () => {
  const { cartOrderItems } = await import('../components/theme/orderPieces.ts');
  const card = { productId: 'p', selectedOffer: 'o2', quantity: 1, finalPrice: 4500, offerBox: { lines: [
    { variantDetailId: 'vM', selectedVariants: { size: 'M' }, addonIds: [], finalPrice: 2250, quantity: 1 },
    { variantDetailId: 'vL', selectedVariants: { size: 'L' }, addonIds: ['a'], finalPrice: 2250, quantity: 1 },
  ] } };
  const plain = { productId: 'q', quantity: 2, finalPrice: 1000, addonIds: [] };
  const out = cartOrderItems([card, plain]);
  assert.equal(out.length, 3);
  assert.deepEqual(out.map((l: any) => [l.productId, l.variantDetailId, l.finalPrice, l.quantity, l.selectedOffer]),
    [['p', 'vM', 2250, 1, 'o2'], ['p', 'vL', 2250, 1, 'o2'], ['q', undefined, 1000, 2, undefined]]);
  assert.deepEqual(out[1].addonIds, ['a']);
});
