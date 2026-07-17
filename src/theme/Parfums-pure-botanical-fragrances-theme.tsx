'use client';

// ============================================================================
// PURE BOTANICAL FRAGRANCES THEME
// NAVBAR ARCHETYPE : D — Full-width Logo Strip
// CARD ARCHETYPE   : 5 — Framed Label
// HERO LAYOUT      : marquee (moving ticker + clean image-free headline)
// TYPOGRAPHY PAIR  : Markazi Text + Cairo (ar) / Fraunces + Work Sans (fr/en)
// ============================================================================

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import {
  Search, X, ShoppingBag, Menu, Phone, Mail, MapPin, Star,
  ChevronLeft, ChevronRight, Trash2, Check, Minus, Plus, Leaf,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

/* ============================== TYPES ============================== */

interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; slug?: string;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

/* ============================== HELPERS ============================== */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const res = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const res = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
};

const getVarId = (selectedVariants: Record<string, string>, product?: Product | null): string | number | null => {
  if (!product?.variantDetails?.length) return null;
  const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
  return match ? match.id : null;
};

/* ============================== I18N ============================== */

type Lang = 'ar' | 'fr' | 'en';

const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};

const T = {
  ar: {
    dir: 'rtl' as const,
    home: 'الرئيسية', contact: 'تواصل معنا', cart: 'السلة',
    search: 'ابحث عن عطر طبيعي...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
    showAll: 'عرض كل النتائج →',
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'اكتشف المجموعة',
    trust: [
      { t: 'توصيل سريع', s: 'لكل الولايات' },
      { t: 'مكونات طبيعية', s: '100% عضوية' },
      { t: 'دفع آمن', s: 'حماية كاملة للبيانات' },
      { t: 'دعم 24/7', s: 'فريق متخصص للمساعدة' },
    ],
    quickLinks: 'روابط سريعة', contactUs: 'تواصل معنا',
    privacy: 'الخصوصية', terms: 'الشروط', cookies: 'الكوكيز',
    rightsReserved: 'جميع الحقوق محفوظة',
    fullName: 'الاسم الكامل', fullNamePlaceholder: 'أدخل اسمك الكامل',
    phone: 'رقم الهاتف', phonePlaceholder: '05xxxxxxxx',
    wilaya: 'الولاية', wilayaPlaceholder: 'اختر الولاية', wilayaUnavailable: 'التوصيل غير متاح حالياً',
    commune: 'البلدية', communePlaceholder: 'اختر البلدية', communeLoading: 'جاري التحميل...',
    deliveryHome: 'توصيل للمنزل', deliveryOffice: 'مكتب بريد',
    qty: 'الكمية', price: 'السعر', delivery: 'التوصيل', total: 'الإجمالي',
    orderNow: 'اطلب الآن', addToCart: 'أضف إلى السلة',
    confirmOrder: 'تأكيد الطلب', sending: 'جاري الإرسال...', cancel: 'إلغاء',
    successTitle: 'تم إرسال طلبك بنجاح!', successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل.',
    backToShop: 'العودة للتسوق',
    cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تتم إضافة أي عطور بعد.',
    myCart: 'سلتي', subtotal: 'المجموع الفرعي',
    errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
    errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'الوصف',
    searchResultsFor: 'نتائج البحث عن:',
  },
  fr: {
    dir: 'ltr' as const,
    home: 'Accueil', contact: 'Contact', cart: 'Panier',
    search: 'Rechercher un parfum naturel...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats →',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Découvrir la collection',
    trust: [
      { t: 'Livraison Rapide', s: 'Partout en Algérie' },
      { t: 'Ingrédients Naturels', s: '100% biologique' },
      { t: 'Paiement Sécurisé', s: 'Vos données protégées' },
      { t: 'Support 24/7', s: 'Toujours disponible' },
    ],
    quickLinks: 'Navigation', contactUs: 'Contact',
    privacy: 'Confidentialité', terms: 'Conditions', cookies: 'Cookies',
    rightsReserved: 'Tous droits réservés.',
    fullName: 'Nom complet', fullNamePlaceholder: 'Votre nom complet',
    phone: 'Téléphone', phonePlaceholder: '0555 12 34 56',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Choisir la wilaya', wilayaUnavailable: 'Livraison indisponible',
    commune: 'Commune', communePlaceholder: 'Choisir la commune', communeLoading: 'Chargement...',
    deliveryHome: 'À domicile', deliveryOffice: 'Point relais',
    qty: 'Quantité', price: 'Prix', delivery: 'Livraison', total: 'Total',
    orderNow: 'Commander', addToCart: 'Ajouter au panier',
    confirmOrder: 'Confirmer la commande', sending: 'Envoi en cours...', cancel: 'Annuler',
    successTitle: 'Commande confirmée !', successDesc: 'Notre équipe vous contactera bientôt.',
    backToShop: 'Retour à la boutique',
    cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre collection.',
    myCart: 'Mon Panier', subtotal: 'Sous-total',
    errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
    errName: 'Nom complet requis (3 caractères minimum)',
    errPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description',
    searchResultsFor: 'Résultats pour :',
  },
  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart',
    search: 'Search natural fragrances...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results →',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Discover the Collection',
    trust: [
      { t: 'Fast Delivery', s: 'Across all wilayas' },
      { t: 'Natural Ingredients', s: '100% organic' },
      { t: 'Secure Payment', s: 'Full data protection' },
      { t: '24/7 Support', s: 'Expert team always here' },
    ],
    quickLinks: 'Quick Links', contactUs: 'Contact Us',
    privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies',
    rightsReserved: 'All rights reserved.',
    fullName: 'Full Name', fullNamePlaceholder: 'Enter your full name',
    phone: 'Phone Number', phonePlaceholder: '0555 12 34 56',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Select wilaya', wilayaUnavailable: 'Delivery unavailable',
    commune: 'Commune', communePlaceholder: 'Select commune', communeLoading: 'Loading...',
    deliveryHome: 'Home Delivery', deliveryOffice: 'Pickup Point',
    qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total',
    orderNow: 'Order Now', addToCart: 'Add to Cart',
    confirmOrder: 'Confirm Order', sending: 'Sending...', cancel: 'Cancel',
    successTitle: 'Order placed successfully!', successDesc: 'We will contact you shortly to confirm the details.',
    backToShop: 'Back to Shop',
    cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Start exploring our collection.',
    myCart: 'My Cart', subtotal: 'Subtotal',
    errSubmit: 'An error occurred. Please try again.',
    errName: 'Full name is required (at least 3 characters)',
    errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Description',
    searchResultsFor: 'Results for:',
  },
} as const;

type TKeys = typeof T['ar'];

/* ============================== THEME DESIGN TOKENS ============================== */

const BG = '#faf7f1';
const BG_ALT = '#f1ece1';
const INK = '#2e2a22';
const SAGE = '#7c8a63';
const SAGE_DARK = '#5f6b4a';
const MUTED = 'rgba(46,42,34,0.6)';
const BORDER = 'rgba(46,42,34,0.14)';

const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Markazi+Text:wght@400;600;700&family=Cairo:wght@300;400;500;700&family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&family=Work+Sans:wght@300;400;500;600&display=swap');

.pbf-root { background:${BG}; color:${INK}; min-height:100vh; }
.pbf-root.lang-ar { font-family:'Cairo', sans-serif; }
.pbf-root.lang-ar h1, .pbf-root.lang-ar h2, .pbf-root.lang-ar h3, .pbf-root.lang-ar .pbf-display { font-family:'Markazi Text', serif; }
.pbf-root.lang-ltr { font-family:'Work Sans', sans-serif; }
.pbf-root.lang-ltr h1, .pbf-root.lang-ltr h2, .pbf-root.lang-ltr h3, .pbf-root.lang-ltr .pbf-display { font-family:'Fraunces', serif; }

.pbf-container { max-width:1280px; margin:0 auto; padding:0 1.5rem; }

/* Navbar — Full-width Logo Strip archetype */
.pbf-nav-top { display:flex; align-items:center; justify-content:center; padding:22px 0; border-bottom:1px solid ${BORDER}; }
.pbf-nav-bottom { position:sticky; top:0; z-index:200; background:${BG}; border-bottom:1px solid ${BORDER}; }
.pbf-nav-bottom-inner { display:flex; align-items:center; justify-content:space-between; padding:14px 0; }
.pbf-nav-links { display:flex; align-items:center; gap:26px; }
.pbf-nav-links a { color:${MUTED}; font-size:0.85rem; text-decoration:none; letter-spacing:0.02em; }
.pbf-nav-links a:hover, .pbf-nav-links a.active { color:${SAGE_DARK}; }
@media (max-width:760px) { .pbf-nav-links { display:none; } .pbf-nav-burger { display:flex !important; } }
.pbf-nav-burger { display:none; }

.pbf-desktop-search { position:relative; display:none; }
@media (min-width:760px) { .pbf-desktop-search { display:block; } .pbf-mobile-search-btn { display:none !important; } }
.pbf-search-dropdown {
  position:absolute; inset-inline-end:0; top:calc(100% + 10px); width:340px; max-height:380px; overflow-y:auto;
  background:#fff; border:1px solid ${BORDER}; border-radius:8px; box-shadow:0 20px 44px rgba(46,42,34,0.14); z-index:500;
}
@media (max-width:480px) { .pbf-search-dropdown { position:fixed; inset-inline-start:12px; inset-inline-end:12px; width:auto; top:76px; } }

.pbf-mobile-overlay { position:fixed; inset:0; z-index:300; background:${BG}; display:flex; flex-direction:column; }

/* Card — Framed Label archetype */
.pbf-card { border:1px solid ${BORDER}; border-radius:4px; overflow:hidden; background:#fff; animation:pbfFadeUp 0.5s ease both; transition:box-shadow 0.28s ease, transform 0.28s ease; }
.pbf-card:hover { transform:translateY(-4px); box-shadow:0 16px 32px rgba(46,42,34,0.1); }
.pbf-card-eyebrow { background:${BG_ALT}; padding:4px 12px; font-size:0.62rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:${SAGE_DARK}; }
.pbf-card-img-wrap { aspect-ratio:1/1; overflow:hidden; }
.pbf-card-img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease; }
.pbf-card:hover .pbf-card-img { transform:scale(1.06); }
.pbf-card-body { padding:0.9rem; }
.pbf-card-name { font-size:0.85rem; font-weight:600; margin:0 0 8px; color:${INK}; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.pbf-card-price-row { display:flex; justify-content:space-between; align-items:center; margin-top:4px; }
.pbf-card-price { font-weight:800; color:${SAGE_DARK}; font-size:0.95rem; white-space:nowrap; }
.pbf-card-price-old { color:${MUTED}; text-decoration:line-through; font-size:0.75rem; white-space:nowrap; }
.pbf-card-badge { background:${SAGE}; color:#fff; font-size:0.65rem; padding:2px 7px; border-radius:2px; font-weight:700; }
.pbf-card-stars { display:flex; gap:2px; margin-bottom:6px; }

.pbf-products-grid { display:grid; grid-template-columns:1fr; gap:1.1rem; }
@media (min-width:640px) { .pbf-products-grid { grid-template-columns:repeat(2,1fr); } }
@media (min-width:1024px) { .pbf-products-grid { grid-template-columns:repeat(3,1fr); } }
@media (min-width:1280px) { .pbf-products-grid { grid-template-columns:repeat(4,1fr); } }

/* Category chips — active indicator: underline */
.pbf-cats { display:flex; gap:26px; flex-wrap:wrap; overflow-x:auto; padding:4px 0; }
.pbf-cat-link { color:${MUTED}; font-size:0.85rem; text-decoration:none; padding-bottom:6px; border-bottom:2px solid transparent; white-space:nowrap; transition:color 0.2s ease, border-color 0.2s ease; }
.pbf-cat-link.active { color:${INK}; border-bottom-color:${SAGE}; font-weight:600; }

/* Hero — marquee (ticker + clean image-free headline) */
.pbf-marquee-wrap { overflow:hidden; border-top:1px solid ${BORDER}; border-bottom:1px solid ${BORDER}; padding:12px 0; background:${BG_ALT}; }
.pbf-marquee-track { display:flex; gap:3rem; width:max-content; animation:pbfMarquee 22s linear infinite; }
.pbf-marquee-track span { font-size:0.78rem; letter-spacing:0.14em; text-transform:uppercase; color:${SAGE_DARK}; white-space:nowrap; }
.pbf-hero { padding:5rem 0 4rem; text-align:center; }
.pbf-hero-title { font-size:clamp(2.2rem, 6vw, 4.4rem); line-height:1.1; margin:0 auto 1.25rem; max-width:820px; font-weight:600; animation:pbfFadeUp 0.7s ease 0.1s both; }
.pbf-hero-sub { font-size:clamp(1rem, 1.6vw, 1.15rem); color:${MUTED}; max-width:560px; margin:0 auto 2rem; animation:pbfFadeUp 0.7s ease 0.25s both; }
.pbf-hero-cta-row { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; animation:pbfFadeUp 0.7s ease 0.4s both; }

.pbf-btn-primary { background:${SAGE_DARK}; color:#fff; border:none; padding:14px 32px; font-weight:600; letter-spacing:0.02em; border-radius:2px; cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease; min-height:48px; }
.pbf-btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(95,107,74,0.25); background:${SAGE}; }
.pbf-btn-primary:active { transform:translateY(0) scale(0.97); }
.pbf-btn-primary:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
.pbf-btn-outline { background:transparent; color:${INK}; border:1px solid ${BORDER}; padding:14px 32px; font-weight:500; letter-spacing:0.02em; border-radius:2px; cursor:pointer; transition:all 0.2s ease; min-height:48px; }
.pbf-btn-outline:hover { border-color:${SAGE_DARK}; color:${SAGE_DARK}; }

.pbf-trust-bar { display:grid; grid-template-columns:1fr; gap:1.5rem; padding:2.5rem 0; border-top:1px solid ${BORDER}; border-bottom:1px solid ${BORDER}; }
@media (min-width:768px) { .pbf-trust-bar { grid-template-columns:repeat(4,1fr); } }
.pbf-trust-item { text-align:center; }
.pbf-trust-item strong { display:block; color:${SAGE_DARK}; font-size:0.95rem; margin-bottom:4px; }
.pbf-trust-item span { color:${MUTED}; font-size:0.8rem; }

.pbf-input-field { width:100%; background:#fff; border:1px solid ${BORDER}; color:${INK}; padding:12px 14px; border-radius:4px; font-size:0.9rem; min-height:44px; transition:border-color 0.2s, box-shadow 0.2s; }
.pbf-input-field:focus { border-color:${SAGE_DARK}; box-shadow:0 0 0 3px rgba(95,107,74,0.12); outline:none; }
.pbf-input-field:disabled { opacity:0.5; }
.pbf-label { display:block; font-size:0.78rem; color:${MUTED}; margin-bottom:6px; letter-spacing:0.02em; }

.pbf-skeleton { background:linear-gradient(90deg, #ece7db 25%, #f5f1e8 50%, #ece7db 75%); background-size:400px 100%; animation:pbfShimmer 1.4s infinite linear; border-radius:4px; }

@keyframes pbfFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes pbfShimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
@keyframes pbfMarquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }

.pbf-fade-page { transition:opacity 0.3s ease; }

@media (prefers-reduced-motion: reduce) {
  .pbf-root * { animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; }
}
`;

/* ============================== MAIN ============================== */

export default function Main({ store, children, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    setVisible(false);
    const tm = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(tm);
  }, [pathname]);

  return (
    <div className={`pbf-root ${t.dir === 'rtl' ? 'lang-ar' : 'lang-ltr'}`} dir={t.dir}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <main className="pbf-fade-page" style={{ opacity: visible ? 1 : 0 }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ============================== NAVBAR ============================== */
// NAVBAR ARCHETYPE: D — Full-width Logo Strip

export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const debounceRef = useRef<any>(null);

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      initCount(arr.length);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) { setListSearch([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setListSearch(Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : []);
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, domain]);

  const mobileLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const logoUrl = store?.design?.logoUrl;

  const SearchResultRow = ({ p }: { p: Product }) => (
    <Link href={`/product/${p.slug || p.id}`} onClick={() => { setShowSearch(false); setSearchFocused(false); }}
      style={{ display: 'flex', gap: 12, padding: '10px 14px', alignItems: 'center', textDecoration: 'none', borderBottom: `1px solid ${BORDER}` }}>
      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name}
        style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
        <p style={{ fontSize: '0.78rem', color: SAGE_DARK, margin: 0, fontWeight: 700 }}>
          {Number(p.price).toLocaleString()} {store?.currency}
        </p>
      </div>
    </Link>
  );

  return (
    <>
      {/* Top bar — large centered logo */}
      <div className="pbf-nav-top">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {logoUrl && !imgError ? (
            <img src={logoUrl} alt={store?.name} onError={() => setImgError(true)}
              style={{ height: 46, width: 'auto', objectFit: 'contain' }} />
          ) : (
            <span className="pbf-display" style={{ color: INK, fontSize: '1.8rem', fontWeight: 600, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Leaf size={22} color={SAGE_DARK} /> {store?.name || 'Pure Botanical'}
            </span>
          )}
        </Link>
      </div>

      {/* Bottom bar — links + search + cart, sticky */}
      <div className="pbf-nav-bottom">
        <div className="pbf-container pbf-nav-bottom-inner">
          <nav className="pbf-nav-links">
            <Link href="/" className={pathname === '/' ? 'active' : ''}>{t.home}</Link>
            <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>{t.contact}</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="pbf-desktop-search">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder={t.search}
                style={{ width: searchFocused ? 240 : 170, transition: 'width 0.3s ease', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 999, padding: '8px 14px', color: INK, fontSize: '0.8rem' }}
              />
              {listSearch.length > 0 && searchFocused && (
                <div className="pbf-search-dropdown">
                  {loading && <p style={{ padding: '1rem', textAlign: 'center', color: MUTED, fontSize: '0.8rem' }}>{t.searching}</p>}
                  {listSearch.map((p) => <SearchResultRow key={p.id} p={p} />)}
                  <Link href={`/?search=${searchQuery}`} onClick={() => setSearchFocused(false)}
                    style={{ display: 'block', padding: '10px 16px', fontSize: '0.8rem', textAlign: 'center', color: SAGE_DARK, textDecoration: 'none' }}>
                    {t.showAll}
                  </Link>
                </div>
              )}
            </div>
            <button onClick={() => setShowSearch(true)} aria-label={t.search} className="pbf-mobile-search-btn"
              style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer', display: 'flex' }}>
              <Search size={19} />
            </button>

            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', color: INK, display: 'flex' }}>
                <ShoppingBag size={19} />
                {count > 0 && (
                  <span style={{ position: 'absolute', top: -8, insetInlineEnd: -8, background: SAGE_DARK, color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '50%', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {count}
                  </span>
                )}
              </Link>
            )}

            <button className="pbf-nav-burger" onClick={() => setOpen(true)} aria-label="menu"
              style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer' }}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div className="pbf-mobile-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 18 }}>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer' }}>
              <X size={26} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, marginTop: 40 }}>
            {mobileLinks.map((lnk) => (
              <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)}
                style={{ color: INK, fontSize: '1.3rem', textDecoration: 'none' }}>
                {lnk.l}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile search full-screen overlay */}
      {showSearch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: BG, display: 'flex', flexDirection: 'column' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div style={{ background: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${BORDER}` }}>
            <Search size={20} color={MUTED} />
            <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: INK }} />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }}
              style={{ background: 'none', border: 'none', color: INK, cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: BG }}>
            {loading && <p style={{ padding: '1rem', textAlign: 'center', color: MUTED }}>{t.searching}</p>}
            {listSearch.map((p) => <SearchResultRow key={p.id} p={p} />)}
            {listSearch.length > 0 && (
              <Link href={`/?search=${searchQuery}`} onClick={() => setShowSearch(false)}
                style={{ display: 'block', padding: '14px', textAlign: 'center', background: '#fff', fontWeight: 600, color: SAGE_DARK, textDecoration: 'none' }}>
                {t.showAll}
              </Link>
            )}
            {searchQuery.length >= 2 && !loading && listSearch.length === 0 && (
              <p style={{ padding: '2rem', textAlign: 'center', color: MUTED }}>{t.noResults}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ============================== FOOTER ============================== */

export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const year = new Date().getFullYear();

  const links = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contactUs },
    { h: '/privacy', l: t.privacy },
    { h: '/terms', l: t.terms },
  ].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);

  return (
    <footer style={{ background: BG_ALT, borderTop: `1px solid ${BORDER}`, padding: '3.5rem 0 1.75rem' }}>
      <div className="pbf-container">
        <div className="pbf-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <div>
            <h3 className="pbf-display" style={{ color: INK, fontSize: '1.4rem', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Leaf size={18} color={SAGE_DARK} /> {store?.name || 'Pure Botanical'}
            </h3>
            <p style={{ color: MUTED, fontSize: '0.85rem', maxWidth: 320, lineHeight: 1.7 }}>{store?.hero?.subtitle}</p>
          </div>
          <div>
            <h4 style={{ color: INK, fontSize: '0.9rem', marginBottom: 14, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{t.quickLinks}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((lnk) => (
                <Link key={lnk.h} href={lnk.h} style={{ color: MUTED, fontSize: '0.85rem', textDecoration: 'none' }}>{lnk.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: INK, fontSize: '0.9rem', marginBottom: 14, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{t.contactUs}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {store?.contact?.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: MUTED, fontSize: '0.85rem' }}>
                  <Phone size={14} /> {store.contact.phone}
                </span>
              )}
              {store?.contact?.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: MUTED, fontSize: '0.85rem' }}>
                  <Mail size={14} /> {store.contact.email}
                </span>
              )}
              {store?.contact?.address && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: MUTED, fontSize: '0.85rem' }}>
                  <MapPin size={14} /> {store.contact.wilaya ? `${store.contact.wilaya}, ` : ''}{store.contact.address}
                </span>
              )}
            </div>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: MUTED, fontSize: '0.75rem', borderTop: `1px solid ${BORDER}`, paddingTop: 20, marginTop: 32 }}>
          © {year} {store?.name || 'Pure Botanical'} — {t.rightsReserved}
        </p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (min-width:768px){ .pbf-footer-grid{ grid-template-columns: 1.4fr 1fr 1fr; } }` }} />
    </footer>
  );
}

/* ============================== CARD ============================== */
// CARD ARCHETYPE: 5 — Framed Label

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const t = T[getLang(store)];
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product?.productImage || product?.imagesProduct?.[0]?.imageUrl;
  const price = Number(product?.price || 0).toLocaleString();
  const priceOriginal = product?.priceOriginal ? Number(product.priceOriginal).toLocaleString() : null;

  return (
    <Link href={`/product/${product.slug || product.id}`} className="pbf-card" style={{ textDecoration: 'none', display: 'block' }}
      onClick={() => viewDetails?.(product)}>
      <div className="pbf-card-eyebrow">{product?.store?.name || t.all}</div>
      <div className="pbf-card-img-wrap">
        {img && !imgErr ? (
          <img src={img} alt={product.name} onError={() => setImgErr(true)} className="pbf-card-img" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG_ALT }}>
            <Leaf size={36} color={BORDER} />
          </div>
        )}
      </div>
      <div className="pbf-card-body">
        <div className="pbf-card-stars">
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={11} fill={SAGE_DARK} color={SAGE_DARK} />)}
        </div>
        <p className="pbf-card-name">{product.name}</p>
        <div className="pbf-card-price-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pbf-card-price">{price} {store?.currency}</span>
            {priceOriginal && <span className="pbf-card-price-old">{priceOriginal} {store?.currency}</span>}
          </div>
          {discount > 0 && <span className="pbf-card-badge">-{discount}%</span>}
        </div>
      </div>
    </Link>
  );
}

/* ============================== HOME ============================== */

export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const searchQ = searchParams.get('search');
  const products: Product[] = store?.products || [];
  const cats = store?.categories || [];
  const [loading] = useState(false);

  const countPage = Math.max(1, Math.ceil((store?.count || products.length || 0) / 48));
  const currentPage = Number(page) || 1;

  const tickerItems = [t.trust[0].t, t.trust[1].t, t.trust[2].t, t.trust[3].t];

  return (
    <div>
      {/* Marquee strip */}
      <div className="pbf-marquee-wrap">
        <div className="pbf-marquee-track">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i}>✦ {item}</span>
          ))}
        </div>
      </div>

      {/* Hero — marquee layout: clean, image-free, centered typography */}
      <section className="pbf-hero">
        <div className="pbf-container">
          <h1 className="pbf-hero-title"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || store?.name || '') }} />
          <p className="pbf-hero-sub">{store?.hero?.subtitle}</p>
          <div className="pbf-hero-cta-row">
            <Link href="#products" className="pbf-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              {t.shopNow}
            </Link>
            {store?.cart !== false && (
              <Link href="/cart" className="pbf-btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                {t.cart}
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="pbf-container" style={{ padding: '1rem 1.5rem 3rem' }}>
        {/* Trust bar */}
        <div className="pbf-trust-bar">
          {t.trust.map((item: any, i: number) => (
            <div className="pbf-trust-item" key={i}>
              <strong>{item.t}</strong>
              <span>{item.s}</span>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="pbf-cats" style={{ margin: '2.5rem 0 2rem' }}>
          <Link href="/" className={`pbf-cat-link ${!activeCategory ? 'active' : ''}`}>{t.all}</Link>
          {cats.map((cat: any) => (
            <Link key={cat.id} href={`?category=${cat.id}`}
              className={`pbf-cat-link ${activeCategory === String(cat.id) ? 'active' : ''}`}>
              {cat.name}
            </Link>
          ))}
        </div>

        {searchQ && (
          <p style={{ color: MUTED, marginBottom: 20 }}>{t.searchResultsFor} <strong style={{ color: INK }}>{searchQ}</strong></p>
        )}

        {/* Products */}
        <div id="products" className="pbf-products-grid">
          {loading
            ? [...Array(8)].map((_, i) => <div key={i} className="pbf-skeleton" style={{ aspectRatio: '3/4' }} />)
            : products.length > 0
              ? products.map((p: Product, i: number) => {
                  const discount = p.priceOriginal
                    ? Math.round(((Number(p.priceOriginal) - Number(p.price)) / Number(p.priceOriginal)) * 100)
                    : 0;
                  return (
                    <div key={p.id} style={{ animationDelay: `${i * 0.06}s` }}>
                      <Card product={p} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={discount} store={store} />
                    </div>
                  );
                })
              : <p style={{ color: MUTED, gridColumn: '1/-1', textAlign: 'center', padding: '3rem 0' }}>{t.noProducts}</p>}
        </div>

        {/* Pagination */}
        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[...Array(countPage)].map((_, i) => (
              <Link key={i} href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), page: i + 1 } }} scroll={false}
                style={{
                  minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${currentPage === i + 1 ? SAGE_DARK : BORDER}`, color: currentPage === i + 1 ? SAGE_DARK : MUTED,
                  borderRadius: 4, textDecoration: 'none', fontSize: '0.85rem',
                }}>
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== DETAILS ============================== */

export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const t = T[getLang(store || product?.store)];
  const [sel, setSel] = useState(0);
  const images: string[] = allImages?.length ? allImages : (product?.imagesProduct?.map((i: ProductImage) => i.imageUrl) || [product?.productImage].filter(Boolean));

  return (
    <div className="pbf-container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="pbf-details-inner" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
        {/* Gallery */}
        <div>
          <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 6, overflow: 'hidden', background: BG_ALT, border: `1px solid ${BORDER}` }}>
            {images?.[sel] && <img src={images[sel]} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            {images?.length > 1 && (
              <>
                <button onClick={() => setSel((s) => (s - 1 + images.length) % images.length)}
                  style={{ position: 'absolute', top: '50%', insetInlineStart: 10, transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', color: INK, borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setSel((s) => (s + 1) % images.length)}
                  style={{ position: 'absolute', top: '50%', insetInlineEnd: 10, transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', color: INK, borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {images?.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }}>
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSel(i)}
                  style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: sel === i ? `2px solid ${SAGE_DARK}` : `1px solid ${BORDER}`, padding: 0, cursor: 'pointer', background: 'none' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="pbf-display" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', margin: '0 0 10px', color: INK }}>{product?.name}</h1>
          <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill={SAGE_DARK} color={SAGE_DARK} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: SAGE_DARK }}>{Number(finalPrice ?? product?.price).toLocaleString()} {product?.store?.currency}</span>
            {discount > 0 && product?.priceOriginal && (
              <span style={{ color: MUTED, textDecoration: 'line-through' }}>{Number(product.priceOriginal).toLocaleString()} {product?.store?.currency}</span>
            )}
          </div>

          {product?.offers?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 10, color: INK }}>{t.offersTitle}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o: Offer) => (
                  <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${selectedOffer === o.id ? SAGE_DARK : BORDER}`, borderRadius: 4, padding: '10px 12px', cursor: 'pointer' }}>
                    <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                    <span style={{ color: INK, fontSize: '0.85rem' }}>{o.name} — {o.quantity}x</span>
                    <span style={{ marginInlineStart: 'auto', color: SAGE_DARK, fontWeight: 700 }}>{Number(o.price).toLocaleString()} {product?.store?.currency}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {allAttrs?.length > 0 && allAttrs.map((attr: Attribute) => (
            <div key={attr.id} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '0.85rem', color: MUTED, marginBottom: 10 }}>{attr.name}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {attr.variants.map((v) => {
                  const isSel = selectedVariants?.[attr.name] === v.value;
                  if (attr.displayMode === 'color') {
                    return (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                        style={{ width: 34, height: 34, borderRadius: '50%', background: v.value, border: isSel ? `2px solid ${SAGE_DARK}` : `1px solid ${BORDER}`, cursor: 'pointer' }} />
                    );
                  }
                  if (attr.displayMode === 'image') {
                    return (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                        style={{ width: 48, height: 48, borderRadius: 4, overflow: 'hidden', border: isSel ? `2px solid ${SAGE_DARK}` : `1px solid ${BORDER}`, padding: 0, cursor: 'pointer' }}>
                        <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    );
                  }
                  return (
                    <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                      style={{ padding: '8px 16px', borderRadius: 4, border: isSel ? `2px solid ${SAGE_DARK}` : `1px solid ${BORDER}`, color: isSel ? SAGE_DARK : INK, background: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <ProductForm
            product={product}
            userId={product?.store?.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
            store={store}
          />

          {product?.desc && (
            <div style={{ marginTop: 32, borderTop: `1px solid ${BORDER}`, paddingTop: 24 }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 10, color: INK }}>{t.descTitle}</h4>
              <div style={{ color: MUTED, fontSize: '0.9rem', lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (min-width:768px){ .pbf-details-inner{ grid-template-columns: 1fr 1fr; } }` }} />
    </div>
  );
}

/* ============================== PRODUCT FORM ============================== */

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store: storeProp }: any) {
  const store = storeProp || product?.store;
  const t = T[getLang(store)];
  const router = useRouter();

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getFP = useCallback((): number => {
    if (selectedOffer && product?.offers?.length) {
      const o = product.offers.find((of: Offer) => of.id === selectedOffer);
      if (o) return Number(o.price);
    }
    if (product?.variantDetails?.length) {
      const match = product.variantDetails.find((d: VariantDetail) => variantMatches(d, selectedVariants || {}));
      if (match && match.price !== -1) return Number(match.price);
    }
    return Number(product?.price || 0);
  }, [selectedOffer, product, selectedVariants]);

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const fp = getFP();
  const total = () => fp * fd.quantity + getLiv();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) errs.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) errs.customerPhone = t.errPhone;
    if (!fd.customerWelaya) errs.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) errs.customerCommune = t.errCommune;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = () => ({
    ...fd,
    product,
    productId: product?.id,
    storeId: product?.store?.id,
    userId,
    variantDetailId: getVarId(selectedVariants || {}, product),
    selectedOffer,
    selectedVariants,
    platform,
    finalPrice: fp,
    totalPrice: total(),
    priceLivraison: getLiv(),
    addedAt: new Date().toISOString(),
  });

  const addToCart = () => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      arr.push(buildPayload());
      localStorage.setItem(domain, JSON.stringify(arr));
      initCount(arr.length);
    } catch { /* noop */ }
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      if (data?.customerId) localStorage.setItem('customerId', data.customerId);
      router.push(`/successfully?productId=${product?.id}`);
    } catch {
      setErrors({ submit: t.errSubmit });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 24, borderTop: `1px solid ${BORDER}`, paddingTop: 24 }}>
      {!isOrderNow ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <span className="pbf-label" style={{ margin: 0 }}>{t.qty}</span>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${BORDER}`, borderRadius: 4 }}>
              <button onClick={() => setFd((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                style={{ width: 40, height: 40, background: 'none', border: 'none', color: INK, cursor: 'pointer' }}><Minus size={14} /></button>
              <span style={{ width: 36, textAlign: 'center', color: INK }}>{fd.quantity}</span>
              <button onClick={() => setFd((f) => ({ ...f, quantity: f.quantity + 1 }))}
                style={{ width: 40, height: 40, background: 'none', border: 'none', color: INK, cursor: 'pointer' }}><Plus size={14} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="pbf-btn-primary" onClick={() => setIsOrderNow(true)}>{t.orderNow}</button>
            {store?.cart !== false && (
              <button className="pbf-btn-outline" onClick={addToCart}>{t.addToCart}</button>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="pbf-label">{t.fullName}</label>
            <input className="pbf-input-field" placeholder={t.fullNamePlaceholder} value={fd.customerName}
              onChange={(e) => setFd((f) => ({ ...f, customerName: e.target.value }))} />
            {errors.customerName && <span style={{ color: '#b3453a', fontSize: '0.75rem' }}>{errors.customerName}</span>}
          </div>
          <div>
            <label className="pbf-label">{t.phone}</label>
            <input className="pbf-input-field" placeholder={t.phonePlaceholder} value={fd.customerPhone}
              onChange={(e) => setFd((f) => ({ ...f, customerPhone: e.target.value }))} />
            {errors.customerPhone && <span style={{ color: '#b3453a', fontSize: '0.75rem' }}>{errors.customerPhone}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="pbf-label">{t.wilaya}</label>
              <select className="pbf-input-field" disabled={wilayas.length === 0} value={fd.customerWelaya}
                onChange={(e) => setFd((f) => ({ ...f, customerWelaya: e.target.value, customerCommune: '' }))}>
                <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                ))}
              </select>
              {errors.customerWelaya && <span style={{ color: '#b3453a', fontSize: '0.75rem' }}>{errors.customerWelaya}</span>}
            </div>
            <div>
              <label className="pbf-label">{t.commune}</label>
              <select className="pbf-input-field" disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune}
                onChange={(e) => setFd((f) => ({ ...f, customerCommune: e.target.value }))}>
                <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                {communes.map((c) => (
                  <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                ))}
              </select>
              {errors.customerCommune && <span style={{ color: '#b3453a', fontSize: '0.75rem' }}>{errors.customerCommune}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setFd((f) => ({ ...f, typeLivraison: 'home' }))}
              style={{ flex: 1, padding: '10px', borderRadius: 4, border: `1px solid ${fd.typeLivraison === 'home' ? SAGE_DARK : BORDER}`, background: 'none', color: fd.typeLivraison === 'home' ? SAGE_DARK : MUTED, cursor: 'pointer', minHeight: 44 }}>
              {t.deliveryHome}
            </button>
            <button onClick={() => setFd((f) => ({ ...f, typeLivraison: 'office' }))}
              style={{ flex: 1, padding: '10px', borderRadius: 4, border: `1px solid ${fd.typeLivraison === 'office' ? SAGE_DARK : BORDER}`, background: 'none', color: fd.typeLivraison === 'office' ? SAGE_DARK : MUTED, cursor: 'pointer', minHeight: 44 }}>
              {t.deliveryOffice}
            </button>
          </div>

          {/* Summary — placed above buttons, per §15.24 */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, background: '#fff' }}>
            {[
              { l: t.price, v: `${fp.toLocaleString()} ${product?.store?.currency || ''}` },
              { l: t.qty, v: `× ${fd.quantity}` },
              { l: t.delivery, v: selW ? `${getLiv().toLocaleString()} ${product?.store?.currency || ''}` : '—' },
              { l: t.total, v: `${total().toLocaleString()} ${product?.store?.currency || ''}`, strong: true },
            ].map((row) => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ color: MUTED, fontSize: '0.85rem' }}>{row.l}</span>
                <span style={{ color: (row as any).strong ? SAGE_DARK : INK, fontWeight: (row as any).strong ? 700 : 500, whiteSpace: 'nowrap', flexShrink: 0 }}>{row.v}</span>
              </div>
            ))}
          </div>

          {errors.submit && <span style={{ color: '#b3453a', fontSize: '0.8rem' }}>{errors.submit}</span>}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="pbf-btn-primary" onClick={submitOrder} disabled={submitting} style={{ flex: 1 }}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            <button className="pbf-btn-outline" onClick={() => setIsOrderNow(false)} disabled={submitting} style={{ flex: 1 }}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== CART ============================== */

export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fd, setFd] = useState({
    customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });

  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); } catch { setItems([]); }
  }, [domain]);

  useEffect(() => {
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));
  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const cartTotal = items.reduce((sum, it) => sum + Number(it.finalPrice || 0) * Number(it.quantity || 1), 0);
  const finalTotal = cartTotal + getLiv();

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    localStorage.setItem(domain, JSON.stringify(next));
    initCount(next.length);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) errs.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) errs.customerPhone = t.errPhone;
    if (!fd.customerWelaya) errs.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) errs.customerCommune = t.errCommune;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = items.map((it) => ({
        ...it, ...fd, priceLivraison: getLiv(), totalPrice: Number(it.finalPrice || 0) * Number(it.quantity || 1) + getLiv(),
      }));
      const res = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('failed');
      localStorage.removeItem(domain);
      initCount(0);
      setSuccess(true);
    } catch {
      setErrors({ submit: t.errSubmit });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="pbf-container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: SAGE_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={34} color="#fff" />
        </div>
        <h2 className="pbf-display" style={{ color: INK, fontSize: '1.6rem', marginBottom: 10 }}>{t.successTitle}</h2>
        <p style={{ color: MUTED, marginBottom: 24 }}>{t.successDesc}</p>
        <Link href="/" className="pbf-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>{t.backToShop}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pbf-container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <ShoppingBag size={48} color={BORDER} style={{ margin: '0 auto 16px' }} />
        <h2 style={{ color: INK, fontSize: '1.3rem', marginBottom: 8 }}>{t.cartEmpty}</h2>
        <p style={{ color: MUTED, marginBottom: 24 }}>{t.cartEmptyDesc}</p>
        <Link href="/" className="pbf-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>{t.shopNow}</Link>
      </div>
    );
  }

  return (
    <div className="pbf-container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 className="pbf-display" style={{ color: INK, marginBottom: 24 }}>{t.myCart}</h1>
      <div className="pbf-cart-inner" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 14, border: `1px solid ${BORDER}`, borderRadius: 6, padding: 14, alignItems: 'center', background: '#fff' }}>
              <img src={it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl} alt={it.product?.name}
                style={{ width: 66, height: 66, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: INK, fontWeight: 600, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.product?.name}</p>
                <p style={{ color: SAGE_DARK, fontWeight: 700, margin: 0 }}>{Number(it.finalPrice).toLocaleString()} {store?.currency} × {it.quantity}</p>
              </div>
              <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, background: '#fff' }}>
            <div>
              <label className="pbf-label">{t.fullName}</label>
              <input className="pbf-input-field" placeholder={t.fullNamePlaceholder} value={fd.customerName}
                onChange={(e) => setFd((f) => ({ ...f, customerName: e.target.value }))} />
              {errors.customerName && <span style={{ color: '#b3453a', fontSize: '0.75rem' }}>{errors.customerName}</span>}
            </div>
            <div>
              <label className="pbf-label">{t.phone}</label>
              <input className="pbf-input-field" placeholder={t.phonePlaceholder} value={fd.customerPhone}
                onChange={(e) => setFd((f) => ({ ...f, customerPhone: e.target.value }))} />
              {errors.customerPhone && <span style={{ color: '#b3453a', fontSize: '0.75rem' }}>{errors.customerPhone}</span>}
            </div>
            <div>
              <label className="pbf-label">{t.wilaya}</label>
              <select className="pbf-input-field" disabled={wilayas.length === 0} value={fd.customerWelaya}
                onChange={(e) => setFd((f) => ({ ...f, customerWelaya: e.target.value, customerCommune: '' }))}>
                <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                ))}
              </select>
              {errors.customerWelaya && <span style={{ color: '#b3453a', fontSize: '0.75rem' }}>{errors.customerWelaya}</span>}
            </div>
            <div>
              <label className="pbf-label">{t.commune}</label>
              <select className="pbf-input-field" disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune}
                onChange={(e) => setFd((f) => ({ ...f, customerCommune: e.target.value }))}>
                <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                {communes.map((c) => (
                  <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                ))}
              </select>
              {errors.customerCommune && <span style={{ color: '#b3453a', fontSize: '0.75rem' }}>{errors.customerCommune}</span>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setFd((f) => ({ ...f, typeLivraison: 'home' }))}
                style={{ flex: 1, padding: '10px', borderRadius: 4, border: `1px solid ${fd.typeLivraison === 'home' ? SAGE_DARK : BORDER}`, background: 'none', color: fd.typeLivraison === 'home' ? SAGE_DARK : MUTED, cursor: 'pointer', minHeight: 44 }}>
                {t.deliveryHome}
              </button>
              <button onClick={() => setFd((f) => ({ ...f, typeLivraison: 'office' }))}
                style={{ flex: 1, padding: '10px', borderRadius: 4, border: `1px solid ${fd.typeLivraison === 'office' ? SAGE_DARK : BORDER}`, background: 'none', color: fd.typeLivraison === 'office' ? SAGE_DARK : MUTED, cursor: 'pointer', minHeight: 44 }}>
                {t.deliveryOffice}
              </button>
            </div>

            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ color: MUTED, fontSize: '0.85rem' }}>{t.subtotal}</span>
                <span style={{ color: INK, whiteSpace: 'nowrap', flexShrink: 0 }}>{cartTotal.toLocaleString()} {store?.currency}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ color: MUTED, fontSize: '0.85rem' }}>{t.delivery}</span>
                <span style={{ color: INK, whiteSpace: 'nowrap', flexShrink: 0 }}>{selW ? `${getLiv().toLocaleString()} ${store?.currency}` : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ color: INK, fontWeight: 700 }}>{t.total}</span>
                <span style={{ color: SAGE_DARK, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{finalTotal.toLocaleString()} {store?.currency}</span>
              </div>
            </div>

            {errors.submit && <span style={{ color: '#b3453a', fontSize: '0.8rem' }}>{errors.submit}</span>}

            <button className="pbf-btn-primary" onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (min-width:1024px){ .pbf-cart-inner{ grid-template-columns: 1.2fr 1fr; } }` }} />
    </div>
  );
}

/* ============================== STATIC PAGES ============================== */

function StaticShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pbf-container" style={{ padding: '3.5rem 1.5rem', maxWidth: 860 }}>
      <h1 className="pbf-display" style={{ color: INK, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 24 }}>{title}</h1>
      <div style={{ color: MUTED, fontSize: '0.95rem', lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}

export function Privacy() {
  return (
    <StaticShell title="Privacy Policy">
      <p>This page outlines how customer data is collected, used, and protected across this storefront.</p>
    </StaticShell>
  );
}

export function Terms() {
  return (
    <StaticShell title="Terms & Conditions">
      <p>This page outlines the terms governing purchases made through this storefront.</p>
    </StaticShell>
  );
}

export function Cookies() {
  return (
    <StaticShell title="Cookie Policy">
      <p>This page explains how cookies are used to improve your shopping experience.</p>
    </StaticShell>
  );
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  return (
    <div className="pbf-container" style={{ padding: '3.5rem 1.5rem', maxWidth: 720 }}>
      <h1 className="pbf-display" style={{ color: INK, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 24 }}>{t.contactTitle}</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {store?.contact?.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: MUTED }}>
            <Phone size={18} color={SAGE_DARK} /> {store.contact.phone}
          </div>
        )}
        {store?.contact?.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: MUTED }}>
            <Mail size={18} color={SAGE_DARK} /> {store.contact.email}
          </div>
        )}
        {store?.contact?.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: MUTED }}>
            <MapPin size={18} color={SAGE_DARK} /> {store.contact.wilaya ? `${store.contact.wilaya}, ` : ''}{store.contact.address}
          </div>
        )}
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const t = T[getLang(store)];
  return (
    <StaticShell title={staticPage?.title || page || t.home}>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(staticPage?.content || '') }} />
    </StaticShell>
  );
}