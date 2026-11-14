// صفحة المنتج: العرض ← الكمية ← بطاقة لكل عرض فيها قطعه ← خيارات وإضافات كل قطعة.
// عرض قطعتين × كمية 2 = بطاقتان، في كل بطاقة قطعتان. الطلب يصل سطوراً كطلبات السلة
// (القطع المتطابقة في سطر واحد بكميتها)، فلا تغيير في الخادم ولا في صفحة الطلبات.
export type Piece = { variants: Record<string, string>; addonIds: string[] };
export type Box = Piece[];
export type PieceLine = {
  variantDetailId?: string;
  selectedVariants: Record<string, string>;
  addonIds: string[];
  finalPrice: number;
  quantity: number;
};

type VariantDetailLike = { id: string; price?: number | string; isActive?: boolean; name?: { attrName: string; value: string }[] };
type OfferLike = { id: string; name?: string; quantity?: number | string; price: number | string };
type ProductLike = {
  price?: number | string;
  attributes?: { name: string }[] | null;
  variantDetails?: VariantDetailLike[] | null;
  offers?: OfferLike[] | null;
  addons?: { id: string; name: string; price: number | string; isActive?: boolean; maxQty?: number | string }[] | null;
};

/** سعر العرض مقسوماً على قطعه، والباقي على القطعة الأولى (المجموع = سعر العرض تماماً) */
export function splitPrice(total: number, n: number): number[] {
  const k = Math.max(1, Math.floor(n));
  const each = Math.floor(total / k);
  return Array.from({ length: k }, (_, i) => (i === 0 ? total - each * (k - 1) : each));
}

const offerOf = (product: ProductLike, offerId?: string | null) =>
  offerId ? product.offers?.find((o) => o.id === offerId) : undefined;

/** عدد القطع في البطاقة: قطع العرض المختار، وإلا 1 */
export function piecesPerBox(product: ProductLike, offerId?: string | null): number {
  return Math.max(1, Math.floor(Number(offerOf(product, offerId)?.quantity) || 1));
}

const clone = (p: Piece): Piece => ({ variants: { ...p.variants }, addonIds: [...p.addonIds] });

/** بطاقة لكل وحدة من الكمية (أقلها 1)، وكل بطاقة بعدد قطع العرض؛ الجديد ينسخ ما قبله */
export function fitBoxes(boxes: Box[], count: number, per: number, seed: Piece): Box[] {
  const n = Math.max(1, Math.floor(count) || 1);
  const out: Box[] = [];
  for (let b = 0; b < n; b++) {
    const src = boxes[b] ?? out[b - 1] ?? [];
    const box: Box = [];
    for (let i = 0; i < per; i++) {
      const p = src[i] ?? box[i - 1] ?? src[src.length - 1] ?? seed;
      box.push(clone(p));
    }
    out.push(box);
  }
  return out;
}

const matches = (d: VariantDetailLike, sel: Record<string, string>) =>
  Object.entries(sel).every(([n, v]) => (d.name ?? []).some((e) => e.attrName === n && e.value === v));

/** نسخة القطعة (كل الخصائص مختارة)، وإلا undefined */
export function pieceVariantId(product: ProductLike, variants: Record<string, string>): string | undefined {
  const attrs = product.attributes ?? [];
  if (!product.variantDetails?.length || !attrs.length || attrs.some((a) => !variants[a.name])) return undefined;
  return product.variantDetails.find((d) => d.isActive !== false && matches(d, variants))?.id;
}

/** هل يمكن اختيار هذه القيمة مع باقي اختيارات القطعة (توجد نسخة مفعّلة تطابقها) */
export function valueAvailable(product: ProductLike, variants: Record<string, string>, attrName: string, value: string): boolean {
  if (!product.variantDetails?.length) return true;
  const sel = { ...variants, [attrName]: value };
  return product.variantDetails.some((d) => d.isActive !== false && matches(d, sel));
}

const basePrice = (product: ProductLike, variants: Record<string, string>) => {
  const id = pieceVariantId(product, variants);
  const v = id ? product.variantDetails?.find((d) => d.id === id) : undefined;
  return v && Number(v.price) > 0 ? Number(v.price) : Number(product.price) || 0;
};

/** سطور الطلب من البطاقات: القطع المتطابقة (نسخة + إضافات + سعر) في سطر واحد بكميتها.
 *  addonsPrice(ids): سعر إضافات قطعة واحدة (addonsTotal من addonPicks) */
export function boxLines(product: ProductLike, offerId: string | null | undefined, boxes: Box[], addonsPrice: (ids: string[]) => number): PieceLine[] {
  const offer = offerOf(product, offerId);
  const lines = new Map<string, PieceLine>();
  for (const box of boxes) {
    const shares = offer ? splitPrice(Number(offer.price) || 0, box.length) : [];
    box.forEach((p, i) => {
      const addonIds = [...p.addonIds].sort();
      const finalPrice = (offer ? shares[i] : basePrice(product, p.variants)) + addonsPrice(addonIds);
      const variantDetailId = pieceVariantId(product, p.variants);
      const key = JSON.stringify([variantDetailId, Object.entries(p.variants).sort(), addonIds, finalPrice]);
      const line = lines.get(key);
      if (line) line.quantity += 1;
      else lines.set(key, { variantDetailId, selectedVariants: { ...p.variants }, addonIds, finalPrice, quantity: 1 });
    });
  }
  return [...lines.values()];
}

export const linesTotal = (lines: PieceLine[]) => lines.reduce((s, l) => s + l.finalPrice * l.quantity, 0);
