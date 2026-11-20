// الأطقم (باندل): بيانات السلايدر في الرئيسية وصفحة طلب الطقم، ونصوصها بلغات المتجر

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

export interface BundleCardItem { productId: string; name: string; imageUrl: string | null; price: number }

/** طقم في سلايدر الرئيسية (يأتي مع بيانات المتجر) */
export interface BundleCard {
  id: string; name: string; subtitle: string | null; slug: string; discountPercent: number;
  imageUrl: string | null; mobileImageUrl: string | null; endsAt?: string | null;
  items: BundleCardItem[];
  original: number; price: number; saving: number;
}

export interface BundleVariantEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string }
export interface BundleVariantDetail { id: string; name: BundleVariantEntry[]; price: number; stock: number; isActive?: boolean }
export interface BundleAttribute { id: string; name: string; type: string; displayMode?: 'color' | 'image' | null; variants: { id: string; name: string; value: string }[] }
export interface BundleProduct {
  id: string; name: string; price: number | string; isDigital?: boolean;
  imagesProduct?: { id: string; imageUrl: string; order?: number }[];
  attributes?: BundleAttribute[]; variantDetails?: BundleVariantDetail[];
}

/** صفحة طلب الطقم */
export interface BundlePage {
  id: string; name: string; subtitle: string | null; slug: string; discountPercent: number;
  imageUrl: string | null; mobileImageUrl: string | null; endsAt: string | null;
  products: BundleProduct[];
  original: number; price: number; saving: number;
}

export async function getBundlePage(domain: string, slug: string): Promise<BundlePage | null> {
  try {
    const res = await fetch(`${API_URL}/bundles/public/${encodeURIComponent(domain)}/${encodeURIComponent(slug)}`, { next: { revalidate: 30 } });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

/** نفس قاعدة الطلب: سعر النسخة إن كان > 0 وإلا سعر المنتج — ثم خصم الطقم (الخادم يعيد الحساب ويُعتمد حسابه) */
export const unitPrice = (p: BundleProduct, variantId?: string) => {
  const v = variantId ? p.variantDetails?.find((x) => x.id === variantId) : undefined;
  return v && Number(v.price) > 0 ? Number(v.price) : Number(p.price);
};
export const discounted = (total: number, percent: number) => Math.round((total * (100 - percent)) / 100);

/** النسخة المطابقة لاختيارات الزبون (كل خاصية لها قيمة) */
export function matchVariant(p: BundleProduct, sel: Record<string, string>): BundleVariantDetail | undefined {
  const attrs = p.attributes?.filter((a) => a.variants?.length) ?? [];
  if (!p.variantDetails?.length || !attrs.length || attrs.some((a) => !sel[a.name])) return undefined;
  return p.variantDetails.find((v) => Object.entries(sel).every(([n, val]) => v.name.some((e) => e.attrName === n && e.value === val)));
}

export const formatDA = (n: number, lang: string) => `${Math.round(n).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')} ${lang === 'ar' ? 'دج' : 'DA'}`;

const STRINGS = {
  ar: {
    title: 'عروض الأطقم', swipe: 'اسحب للمزيد', save: 'وفّر', order: 'اطلب الطقم الآن', inBundle: 'ماذا يوجد في الطقم',
    original: 'المجموع الأصلي', bundlePrice: 'سعر الطقم', saved: 'وفّرت', choose: 'اختر', total: 'الإجمالي',
    delivery: 'التوصيل', cod: 'الدفع عند الاستلام', pickOptions: 'اختر الخيارات لكل منتج', ended: 'هذا العرض انتهى',
    backToStore: 'العودة إلى المتجر', bundleWord: 'الطقم', pieces: (n: number) => `${n} قطع`,
  },
  fr: {
    title: 'Nos packs', swipe: 'Glissez pour voir plus', save: 'Économisez', order: 'Commander le pack', inBundle: 'Dans ce pack',
    original: 'Prix total normal', bundlePrice: 'Prix du pack', saved: 'Vous économisez', choose: 'Choisir', total: 'Total',
    delivery: 'Livraison', cod: 'Paiement à la livraison', pickOptions: 'Choisissez les options de chaque produit', ended: 'Cette offre est terminée',
    backToStore: 'Retour à la boutique', bundleWord: 'Pack', pieces: (n: number) => `${n} articles`,
  },
  en: {
    title: 'Bundle deals', swipe: 'Swipe for more', save: 'Save', order: 'Order the bundle', inBundle: "What's in the bundle",
    original: 'Regular total', bundlePrice: 'Bundle price', saved: 'You save', choose: 'Choose', total: 'Total',
    delivery: 'Delivery', cod: 'Cash on delivery', pickOptions: 'Pick the options for each product', ended: 'This offer has ended',
    backToStore: 'Back to the store', bundleWord: 'Bundle', pieces: (n: number) => `${n} items`,
  },
};
export type BundleStrings = typeof STRINGS.ar;
export const bundleStrings = (lang?: string): BundleStrings => STRINGS[(lang as keyof typeof STRINGS)] ?? STRINGS.ar;
