// حسابات إضافات المنتج في الثيمات المشتركة (تُدمج في bundle كل ثيم عبر ProductAddons).
// القائمة addonIds، وتكرار المعرّف = الكمية لكل قطعة (جبن، جبن = جبن ×2 لكل قطعة).
// السعر داخل سعر القطعة؛ الحد = maxQty («أقصى كمية لكل قطعة» عند التاجر، الافتراضي 1) — الخادم يتحقق بنفس القاعدة.

export type ProductAddon = { id: string; name: string; price: number | string; isActive?: boolean; maxQty?: number | string };
export type ProductLike = { id?: string | number; addons?: ProductAddon[] | null };

/** الإضافات المفعّلة فقط */
export const activeAddons = (product?: ProductLike | null): ProductAddon[] =>
  (product?.addons ?? []).filter((a) => a && a.isActive !== false && a.name);

/** أقصى كمية لكل قطعة (الافتراضي 1) */
export const addonMax = (a: Pick<ProductAddon, 'maxQty'>) => Math.max(1, Math.floor(Number(a.maxQty) || 1));

/** كم مرة اختيرت الإضافة */
export const addonCount = (ids: string[] = [], id: string) => ids.reduce((n, x) => n + (x === id ? 1 : 0), 0);

/** يضع الإضافة n مرة (حتى حدها)، والباقي كما هو؛ 0 = حذفها */
export const setAddonCount = (ids: string[] = [], a: ProductAddon, n: number) => {
  const k = Math.max(0, Math.min(addonMax(a), Math.floor(n) || 0));
  return [...ids.filter((x) => x !== a.id), ...Array(k).fill(a.id)];
};

/** مجموع أسعار الإضافات المختارة لقطعة واحدة (السعر × الكمية، بحد التاجر) */
export const addonsTotal = (product: ProductLike | null | undefined, ids: string[] = []) =>
  activeAddons(product).reduce((sum, a) => sum + (Number(a.price) || 0) * Math.min(addonCount(ids, a.id), addonMax(a)), 0);

/** أسماء الإضافات المختارة (للسلة): «جبن ×2، صلصة» */
export const addonsLabel = (product: ProductLike | null | undefined, ids: string[] = []) =>
  activeAddons(product)
    .map((a) => ({ a, n: Math.min(addonCount(ids, a.id), addonMax(a)) }))
    .filter(({ n }) => n > 0)
    .map(({ a, n }) => (n > 1 ? `${a.name} ×${n}` : a.name))
    .join('، ');
