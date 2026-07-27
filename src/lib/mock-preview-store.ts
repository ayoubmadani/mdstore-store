import type { Store } from '@/types/store'

// بيانات وهمية تُستخدم فقط في صفحة معاينة الثيمات /show/[theme] — لا تلامس أي API حقيقي.

type PreviewLang = 'ar' | 'fr' | 'en'

const CATEGORY_1 = 'preview-cat-1'
const CATEGORY_2 = 'preview-cat-2'

export const PREVIEW_STORE_ID = 'preview-demo-store'
export const PREVIEW_DOMAIN = 'preview'

const CATEGORY_NAMES: Record<PreviewLang, [string, string]> = {
  ar: ['الأكثر مبيعاً', 'وصل حديثاً'],
  fr: ['Meilleures ventes', 'Nouveautés'],
  en: ['Best Sellers', 'New Arrivals'],
}

const IMAGES = {
  p1: ['https://pub-4e93f8cd6d974b8c946ea7201337df2f.r2.dev/admin/e49f532e-856c-4530-a0f9-782ea1a67c72.webp'],
  p2: ['https://pub-4e93f8cd6d974b8c946ea7201337df2f.r2.dev/admin/4346a7ce-dde8-4070-800b-ce873d291a7a.jpg'],
  p3: ['https://pub-4e93f8cd6d974b8c946ea7201337df2f.r2.dev/admin/7c0519a7-ee5a-40ed-8182-515d7d8f0337.webp'],
  p4: ['https://pub-4e93f8cd6d974b8c946ea7201337df2f.r2.dev/admin/109adafa-1cb1-42e0-b41e-dcdf83f0d03c.jpeg'],
}

// أسماء/أوصاف عامة غير دالة على نوع منتج معيّن — الصور عامة ولا ترتبط بمنتج محدد
const PRODUCT_TEXT: Record<PreviewLang, { name: string; desc: string }[]> = {
  ar: [
    { name: 'منتج 1', desc: '<p>وصف تجريبي للمنتج — بيانات عرض غير حقيقية.</p>' },
    { name: 'منتج 2', desc: '<p>وصف تجريبي للمنتج — بيانات عرض غير حقيقية.</p>' },
    { name: 'منتج 3', desc: '<p>وصف تجريبي للمنتج — بيانات عرض غير حقيقية.</p>' },
    { name: 'منتج 4', desc: '<p>وصف تجريبي للمنتج — بيانات عرض غير حقيقية.</p>' },
  ],
  fr: [
    { name: 'Produit 1', desc: '<p>Description d’exemple — données de démonstration.</p>' },
    { name: 'Produit 2', desc: '<p>Description d’exemple — données de démonstration.</p>' },
    { name: 'Produit 3', desc: '<p>Description d’exemple — données de démonstration.</p>' },
    { name: 'Produit 4', desc: '<p>Description d’exemple — données de démonstration.</p>' },
  ],
  en: [
    { name: 'Product 1', desc: '<p>Sample description — demo preview data.</p>' },
    { name: 'Product 2', desc: '<p>Sample description — demo preview data.</p>' },
    { name: 'Product 3', desc: '<p>Sample description — demo preview data.</p>' },
    { name: 'Product 4', desc: '<p>Sample description — demo preview data.</p>' },
  ],
}

function buildPreviewProducts(lang: PreviewLang) {
  const t = PRODUCT_TEXT[lang]
  const store = {
    id: PREVIEW_STORE_ID,
    name: 'Preview Store',
    subdomain: PREVIEW_DOMAIN,
    userId: 'preview-user',
    cart: true,
    currency: 'DZD',
  }
  return [
    {
      id: 'preview-p1', slug: 'preview-product-1', name: t[0].name, desc: t[0].desc,
      price: 8990, priceOriginal: 12990,
      productImage: IMAGES.p1[0],
      imagesProduct: IMAGES.p1.map((imageUrl, i) => ({ id: `preview-p1-img${i + 1}`, imageUrl })),
      categoryId: CATEGORY_1, stock: 15, isActive: true,
      offers: [{ id: 'preview-p1-off1', name: lang === 'ar' ? 'عرض الزوج' : lang === 'fr' ? 'Offre duo' : 'Duo deal', quantity: 2, price: 15990 }],
      store,
    },
    {
      id: 'preview-p2', slug: 'preview-product-2', name: t[1].name, desc: t[1].desc,
      price: 11990, priceOriginal: 15990,
      productImage: IMAGES.p2[0],
      imagesProduct: IMAGES.p2.map((imageUrl, i) => ({ id: `preview-p2-img${i + 1}`, imageUrl })),
      categoryId: CATEGORY_1, stock: 8, isActive: true, offers: [],
      store,
    },
    {
      id: 'preview-p3', slug: 'preview-product-3', name: t[2].name, desc: t[2].desc,
      price: 5490,
      productImage: IMAGES.p3[0],
      imagesProduct: IMAGES.p3.map((imageUrl, i) => ({ id: `preview-p3-img${i + 1}`, imageUrl })),
      categoryId: CATEGORY_2, stock: 20, isActive: true, offers: [],
      store,
    },
    {
      id: 'preview-p4', slug: 'preview-product-4', name: t[3].name, desc: t[3].desc,
      price: 6990, priceOriginal: 8990,
      productImage: IMAGES.p4[0],
      imagesProduct: IMAGES.p4.map((imageUrl, i) => ({ id: `preview-p4-img${i + 1}`, imageUrl })),
      categoryId: CATEGORY_2, stock: 12, isActive: true, offers: [],
      store,
    },
  ]
}

function buildPreviewCategories(lang: PreviewLang) {
  const [n1, n2] = CATEGORY_NAMES[lang]
  return [
    { id: CATEGORY_1, name: n1, imageUrl: IMAGES.p1[0] },
    { id: CATEGORY_2, name: n2, imageUrl: IMAGES.p3[0] },
  ]
}

const STORE_TEXT: Record<PreviewLang, { name: string; topBar: string; heroTitle: string; heroSub: string; wilaya: string; address: string }> = {
  ar: {
    name: 'متجر المعاينة',
    topBar: '🎉 هذه معاينة تجريبية للثيم — البيانات وهمية',
    heroTitle: 'أفضل المنتجات بأسعار مميزة',
    heroSub: 'اكتشف تشكيلتنا الجديدة من المنتجات المتميزة',
    wilaya: 'الجزائر العاصمة',
    address: 'الجزائر العاصمة، الجزائر',
  },
  fr: {
    name: 'Boutique Aperçu',
    topBar: '🎉 Aperçu de démonstration du thème — données fictives',
    heroTitle: 'Les meilleurs produits au meilleur prix',
    heroSub: 'Découvrez notre nouvelle collection de produits premium',
    wilaya: 'Alger',
    address: 'Alger, Algérie',
  },
  en: {
    name: 'Preview Store',
    topBar: '🎉 This is a theme demo preview — sample data',
    heroTitle: 'Best products at great prices',
    heroSub: 'Discover our new collection of premium products',
    wilaya: 'Algiers',
    address: 'Algiers, Algeria',
  },
}

export const PREVIEW_WILAYAS = [
  { id: '16', name: 'Alger', ar_name: 'الجزائر العاصمة', livraisonHome: 400, livraisonOfice: 250 },
  { id: '31', name: 'Oran', ar_name: 'وهران', livraisonHome: 600, livraisonOfice: 400 },
]

export const PREVIEW_COMMUNES = [
  { id: 'c1', name: 'Bab Ezzouar', ar_name: 'باب الزوار', wilayaId: '16' },
  { id: 'c2', name: 'Hydra', ar_name: 'حيدرة', wilayaId: '16' },
]

// نسخة افتراضية (عربي) — تُستخدم من preview-mock-api.ts لطلبات البحث بدون سياق لغة
export const PREVIEW_PRODUCTS = buildPreviewProducts('ar')

export function buildPreviewStore(themeSlug: string, lang: PreviewLang = 'ar'): Store & Record<string, any> {
  const t = STORE_TEXT[lang]
  return {
    id: PREVIEW_STORE_ID,
    name: t.name,
    subdomain: PREVIEW_DOMAIN,
    currency: 'DZD',
    language: lang,
    isActive: true,
    cart: true,
    theme: { slug: themeSlug },
    pixels: [],
    design: {
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981',
      logoUrl: null,
      faviconUrl: null,
    },
    topBar: {
      enabled: true,
      text: t.topBar,
      color: '#4F46E5',
    },
    contact: {
      email: 'demo@mdstore.top',
      phone: '+213550123456',
      wilaya: t.wilaya,
      address: t.address,
    },
    hero: {
      imageUrl: 'https://t4.ftcdn.net/jpg/19/45/43/41/360_F_1945434194_5MizTuqCTgYdnbzpshNchmmxoYK1cy6U.jpg',
      title: t.heroTitle,
      subtitle: t.heroSub,
    },
    products: buildPreviewProducts(lang),
    categories: buildPreviewCategories(lang),
    count: 4,
  }
}
