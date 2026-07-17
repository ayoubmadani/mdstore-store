'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  ShoppingBag, Search, X, Menu, ChevronDown, ChevronLeft, ChevronRight,
  Trash2, Star, Phone, Mail, MapPin, AlertCircle, Check, Zap, Timer,
  Minus, Plus, ArrowRight, ArrowLeft, Activity,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { useCartStore } from '@/store/useCartStore';

/* ============================================================
   NAVBAR ARCHETYPE : E — Icon-heavy Minimal
   CARD ARCHETYPE   : 5 — Framed Label
   HERO LAYOUT      : asymmetric
   TYPOGRAPHY PAIR  : Reem Kufi (display) + Cairo (body)
   ============================================================ */

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */
const A    = '#C6FF33';                 // electric lime — accent
const AD   = '#A8DE1E';                 // accent, darker (hover)
const AL   = 'rgba(198,255,51,0.16)';   // accent tint
const DARK = '#0E0E10';                 // near-black — navbar/footer/hero
const TXT  = '#0E0E10';
const SUB  = '#6B7280';
const BG   = '#FAFAFA';
const CARD = '#FFFFFF';
const BD   = '#E4E4E7';
const ERR  = '#EF4444';

const FONT_DISPLAY = "'Reem Kufi', sans-serif";
const FONT_BODY    = "'Cairo', sans-serif";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Language                                                           */
/* ------------------------------------------------------------------ */
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
    search: 'ابحث عن منتج رياضي...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
    showAll: 'عرض كل النتائج →',
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تسوق الآن',
    heroTag: 'مجموعة الجري 2026', heroCta2: 'السلة',
    trust: [
      { t: 'توصيل سريع',   s: 'لكل الولايات' },
      { t: 'جودة مضمونة',  s: 'أداء رياضي حقيقي' },
      { t: 'دفع آمن',      s: 'حماية كاملة للبيانات' },
      { t: 'دعم 24/7',     s: 'فريق متخصص للمساعدة' },
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
    cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تتم إضافة أي منتجات بعد.',
    myCart: 'سلتي', subtotal: 'المجموع الفرعي',
    errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
    errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'الوصف',
    searchResultsFor: 'نتائج البحث عن:',
    name: 'الاسم', email: 'البريد الإلكتروني', message: 'الرسالة', send: 'إرسال الرسالة',
    sendAnother: 'إرسال رسالة أخرى', msgSuccessTitle: 'تم إرسال رسالتك!', msgSuccessDesc: 'سنرد عليك في أقرب وقت ممكن.',
    location: 'الموقع', deleteItem: 'حذف',
  },
  fr: {
    dir: 'ltr' as const,
    home: 'Accueil', contact: 'Contact', cart: 'Panier',
    search: 'Rechercher un article...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats →',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la boutique',
    heroTag: 'Collection Running 2026', heroCta2: 'Panier',
    trust: [
      { t: 'Livraison Rapide',  s: 'Partout en Algérie' },
      { t: 'Qualité Garantie',  s: 'Performance réelle' },
      { t: 'Paiement Sécurisé', s: 'Vos données protégées' },
      { t: 'Support 24/7',      s: 'Toujours disponible' },
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
    cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre sélection.',
    myCart: 'Mon Panier', subtotal: 'Sous-total',
    errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
    errName: 'Nom complet requis (3 caractères minimum)',
    errPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description',
    searchResultsFor: 'Résultats pour :',
    name: 'Nom', email: 'Email', message: 'Message', send: 'Envoyer le message',
    sendAnother: 'Envoyer un autre message', msgSuccessTitle: 'Message envoyé !', msgSuccessDesc: 'Nous vous répondrons rapidement.',
    location: 'Emplacement', deleteItem: 'Supprimer',
  },
  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart',
    search: 'Search gear...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results →',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Shop Now',
    heroTag: 'Running Collection 2026', heroCta2: 'Cart',
    trust: [
      { t: 'Fast Delivery',      s: 'Across all wilayas' },
      { t: 'Quality Guaranteed', s: 'Real athletic performance' },
      { t: 'Secure Payment',     s: 'Full data protection' },
      { t: '24/7 Support',       s: 'Expert team always here' },
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
    cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Start shopping now.',
    myCart: 'My Cart', subtotal: 'Subtotal',
    errSubmit: 'An error occurred. Please try again.',
    errName: 'Full name is required (at least 3 characters)',
    errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Description',
    searchResultsFor: 'Results for:',
    name: 'Name', email: 'Email', message: 'Message', send: 'Send Message',
    sendAnother: 'Send another message', msgSuccessTitle: 'Message sent!', msgSuccessDesc: 'We will get back to you shortly.',
    location: 'Location', deleteItem: 'Remove',
  },
} as const;

type TKeys = typeof T['ar'];
const Tt: Record<Lang, TKeys> = T as any;

/* ------------------------------------------------------------------ */
/*  Global CSS (keyframes, breakpoints, base)                          */
/* ------------------------------------------------------------------ */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400..700&family=Cairo:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; }
body { font-family: ${FONT_BODY}; color: ${TXT}; background: ${BG}; margin: 0; }
h1, h2, h3, .display-font { font-family: ${FONT_DISPLAY}; }
a { text-decoration: none; color: inherit; }
button { font-family: inherit; cursor: pointer; }
input, select, textarea { font-family: inherit; }

@keyframes fadeUp { from { opacity:0; transform: translateY(24px);} to { opacity:1; transform:translateY(0);} }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes scaleIn { from { opacity:0; transform: scale(.92);} to { opacity:1; transform: scale(1);} }
@keyframes float { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-8px);} }
@keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(198,255,51,.45);} 50% { box-shadow: 0 0 0 10px rgba(198,255,51,0);} }
@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes badgeBounce { 0% { transform: scale(1);} 40% { transform: scale(1.4);} 70% { transform: scale(.9);} 100% { transform: scale(1);} }
@keyframes dash { to { stroke-dashoffset: 0; } }

.container { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }

.products-grid { display:grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(2,1fr); } }
@media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3,1fr); } }
@media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4,1fr); } }

.form-row-2 { display:grid; grid-template-columns: 1fr; gap: .875rem; margin-bottom:.875rem; }
@media (min-width:500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

.details-inner { display:grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width:768px) { .details-inner { grid-template-columns: 1fr 1fr; } }

.cart-inner { display:grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width:1024px) { .cart-inner { grid-template-columns: 1.2fr 1fr; } }

.footer-grid { display:grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width:768px) { .footer-grid { grid-template-columns: repeat(3,1fr); } }

.card { animation: fadeUp .5s ease both; transition: transform .28s cubic-bezier(.22,.68,0,1.2), box-shadow .28s ease; }
.card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,.14); }
.card-img { transition: transform .5s ease; }
.card:hover .card-img { transform: scale(1.08); }

.btn-primary { transition: transform .15s ease, box-shadow .15s ease, background .2s ease; }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.18); }
.btn-primary:active:not(:disabled) { transform: translateY(0) scale(.97); }

.nav-icon-link { position: relative; transition: transform .2s ease, color .2s ease; }
.nav-icon-link:hover { transform: translateY(-2px); color: ${A}; }

.cat-chip { transition: letter-spacing .25s ease, color .25s ease, border-color .25s ease; letter-spacing: 0; }
.cat-chip.active { letter-spacing: .12em; color: ${DARK}; font-weight: 800; border-bottom-color: ${A} !important; }

.skeleton { background: linear-gradient(90deg,#e6e6e6 25%,#f2f2f2 50%,#e6e6e6 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; border-radius: 8px; }

.hero-title { animation: fadeUp .7s ease .1s both; }
.hero-sub   { animation: fadeUp .7s ease .25s both; }
.hero-cta   { animation: fadeUp .7s ease .4s both; }
.hero-badge { animation: scaleIn .5s ease .55s both; }
.hero-float { animation: float 4s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

async function fetchWilayas(uid: string): Promise<Wilaya[]> {
  try {
    const res = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!res.ok) return [];
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

async function fetchCommunes(wid: string): Promise<Commune[]> {
  try {
    const res = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!res.ok) return [];
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

function fmtPrice(n: number, currency: string) {
  return `${Math.round(n).toLocaleString()} ${currency}`;
}

function getVarId(product: Product, selectedVariants: Record<string, string>): string | number | null {
  if (!product?.variantDetails?.length) return null;
  const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
  return match ? match.id : null;
}

/* ------------------------------------------------------------------ */
/*  Shared UI atoms                                                     */
/* ------------------------------------------------------------------ */
function PlaceholderIcon({ size = 40, color = BD }: { size?: number; color?: string }) {
  return <Activity size={size} color={color} />;
}

function inputBase(err?: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem',
    border: `1px solid ${err ? ERR : BD}`, borderRadius: 2,
    background: '#fff', color: TXT, outline: 'none', appearance: 'none',
    transition: 'border-color .2s', fontFamily: 'inherit', minHeight: 44,
  };
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '0.875rem 1.5rem', minHeight: 44, background: A, color: DARK,
  fontWeight: 800, fontSize: '0.9rem', border: 'none', borderRadius: 2,
  fontFamily: 'inherit', width: '100%',
};

const btnOutline: React.CSSProperties = {
  ...btnPrimary, background: 'transparent', color: DARK, border: `2px solid ${DARK}`,
};

function ErrorMsg({ text }: { text: string }) {
  return (
    <p style={{ fontSize: '0.75rem', color: ERR, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}>
      <AlertCircle size={11} /> {text}
    </p>
  );
}

/* ==================================================================
   MAIN
   ================================================================== */
export default function Main({ store, children, domain }: any) {
  const t = Tt[getLang(store)];
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    setVisible(false);
    const tm = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(tm);
  }, [pathname]);

  return (
    <div dir={t.dir} style={{ fontFamily: FONT_BODY, background: BG, minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <main style={{ opacity: visible ? 1 : 0, transition: 'opacity .3s ease' }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ==================================================================
   NAVBAR — Archetype E: Icon-heavy Minimal
   ================================================================== */
export function Navbar({ store, domain }: any) {
  const t = Tt[getLang(store)];
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      initCount(arr.length);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setListSearch([]); return; }
    setLoading(true);
    const tm = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const d = await res.json();
        setListSearch(Array.isArray(d) ? d : d?.products || []);
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(tm);
  }, [searchQuery, domain]);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearch(false);
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  const mobileLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const logoUrl = store?.design?.logoUrl;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 200, background: DARK, color: '#fff' }}>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: A, color: DARK, textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, padding: '6px 0' }}>
          {store.topBar.text}
        </div>
      )}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo — small, left */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {logoUrl && !imgError ? (
            <img src={logoUrl} alt={store?.name} onError={() => setImgError(true)} style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
          ) : (
            <span className="display-font" style={{ fontSize: '1.15rem', fontWeight: 700, color: A }}>{store?.name || 'SPORT'}</span>
          )}
        </Link>

        {/* Icon-only links — right */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Link href="/" className="nav-icon-link" aria-label={t.home} style={{ display: window ? undefined : undefined }}>
            <span className="nav-links-desktop" style={{ display: 'none' }} />
          </Link>

          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Link href="/" className="nav-icon-link" title={t.home}>{t.home}</Link>
            <Link href="/contact" className="nav-icon-link" title={t.contact}>{t.contact}</Link>
          </div>

          {/* Desktop search — inline bar + dropdown */}
          <div className="nav-search-desktop" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '6px 12px' }}>
              <Search size={16} color="#aaa" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                placeholder={t.search}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', marginInlineStart: 8, width: searchFocused ? 220 : 140, transition: 'width .3s ease', fontSize: '0.85rem' }}
              />
            </div>
            {searchFocused && listSearch.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', insetInlineEnd: 0, width: 320, background: '#fff', color: TXT, boxShadow: '0 12px 30px rgba(0,0,0,.2)', borderRadius: 8, maxHeight: 380, overflowY: 'auto', zIndex: 250 }}>
                {listSearch.slice(0, 6).map((p) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${BD}`, alignItems: 'center' }}>
                    <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, flexShrink: 0, background: BD }} />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: AD, fontWeight: 700 }}>{Number(p.price).toLocaleString()} {store?.currency}</p>
                    </div>
                  </Link>
                ))}
                <Link href={`/?search=${searchQuery}`} style={{ display: 'block', padding: '10px 16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: AD }}>
                  {t.showAll}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile search icon */}
          <button className="nav-search-mobile" onClick={() => setShowSearch(true)} aria-label={t.search} style={{ background: 'none', border: 'none', color: '#fff', display: 'none' }}>
            <Search size={20} />
          </button>

          {store?.cart !== false && (
            <Link href="/cart" className="nav-icon-link" style={{ position: 'relative' }} aria-label={t.cart}>
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="cart-badge-animate" style={{ position: 'absolute', top: -8, insetInlineEnd: -10, background: A, color: DARK, borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {count}
                </span>
              )}
            </Link>
          )}

          <button className="nav-burger" onClick={() => setOpen(true)} aria-label="menu" style={{ background: 'none', border: 'none', color: '#fff', display: 'none' }}>
            <Menu size={22} />
          </button>
        </nav>
      </div>

      {/* Mobile full dropdown */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)' }} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{ background: DARK, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><X size={24} /></button>
            </div>
            {mobileLinks.map((l) => (
              <Link key={l.h} href={l.h} onClick={() => setOpen(false)} style={{ color: '#fff', padding: '14px 0', fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {l.l}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile search overlay */}
      {showSearch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column' }} onClick={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={20} color="#888" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
              placeholder={t.search}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', color: TXT }}
            />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }} style={{ background: 'none', border: 'none' }}>
              <X size={22} color={TXT} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
            {loading && <p style={{ padding: '1rem', textAlign: 'center', color: SUB }}>{t.searching}</p>}
            {listSearch.map((p) => (
              <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={() => setShowSearch(false)} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${BD}`, alignItems: 'center' }}>
                <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, flexShrink: 0, background: BD }} />
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: '0.8rem', color: AD, margin: 0, fontWeight: 700 }}>{Number(p.price).toLocaleString()} {store?.currency}</p>
                </div>
              </Link>
            ))}
            {listSearch.length > 0 && (
              <Link href={`/?search=${searchQuery}`} onClick={() => setShowSearch(false)} style={{ display: 'block', padding: '14px', textAlign: 'center', background: '#f9f9f9', fontWeight: 700, color: AD }}>
                {t.showAll}
              </Link>
            )}
            {searchQuery.length >= 2 && !loading && listSearch.length === 0 && (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>{t.noResults}</p>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width:700px) {
          .nav-links { display:none !important; }
          .nav-search-desktop { display:none !important; }
          .nav-burger { display:flex !important; align-items:center; }
          .nav-search-mobile { display:flex !important; align-items:center; }
        }
        `}} />
    </header>
  );
}

/* ==================================================================
   FOOTER
   ================================================================== */
export function Footer({ store }: any) {
  const t = Tt[getLang(store)];
  const year = new Date().getFullYear();

  const pageLinks = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contact },
    { h: '/privacy', l: t.privacy },
    { h: '/terms', l: t.terms },
  ].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);

  return (
    <footer style={{ background: DARK, color: '#fff', marginTop: 64 }}>
      <div className="container footer-grid" style={{ padding: '3rem 1.5rem 2rem' }}>
        <div>
          <span className="display-font" style={{ fontSize: '1.3rem', fontWeight: 700, color: A }}>{store?.name}</span>
          {store?.hero?.subtitle && <p style={{ color: '#a3a3a3', fontSize: '0.85rem', marginTop: 10, lineHeight: 1.7 }}>{store.hero.subtitle}</p>}
          <p style={{ color: '#666', fontSize: '0.75rem', marginTop: 16 }}>© {year} {store?.name}. {t.rightsReserved}</p>
        </div>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 14, color: A, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t.quickLinks}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pageLinks.map((l) => (
              <Link key={l.h} href={l.h} style={{ color: '#c9c9c9', fontSize: '0.85rem' }}>{l.l}</Link>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 14, color: A, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t.contactUs}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {store?.contact?.phone && (
              <a href={`tel:${store.contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c9c9c9', fontSize: '0.85rem' }}>
                <Phone size={14} /> {store.contact.phone}
              </a>
            )}
            {store?.contact?.email && (
              <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c9c9c9', fontSize: '0.85rem' }}>
                <Mail size={14} /> {store.contact.email}
              </a>
            )}
            {(store?.contact?.wilaya || store?.contact?.address) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c9c9c9', fontSize: '0.85rem' }}>
                <MapPin size={14} /> {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ==================================================================
   CARD — Archetype 5: Framed Label
   ================================================================== */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;
  const currency = store?.currency || 'DA';

  return (
    <Link href={`/product/${product.slug || product.id}`} className="card" style={{ display: 'block', border: `2px solid ${BD}`, borderRadius: 4, overflow: 'hidden', background: CARD }}>
      <div style={{ background: DARK, padding: '3px 10px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: A, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{product.store?.name || 'GEAR'}</span>
        {discount > 0 && <span style={{ color: '#fff' }}>-{discount}%</span>}
      </div>
      <div style={{ aspectRatio: '1/1', overflow: 'hidden', position: 'relative', background: '#f2f2f2' }}>
        {img && !imgErr ? (
          <img src={img} alt={product.name} onError={() => setImgErr(true)} className="card-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlaceholderIcon size={40} color={BD} />
          </div>
        )}
      </div>
      <div style={{ padding: '0.85rem' }}>
        <p style={{
          fontSize: '0.85rem', fontWeight: 700, margin: 0, marginBottom: 8,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: '2.4em',
        }}>{product.name}</p>
        <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={11} fill={A} color={A} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, color: DARK, fontSize: '1.05rem' }}>{Number(product.price).toLocaleString()} {currency}</span>
          {product.priceOriginal && Number(product.priceOriginal) > Number(product.price) && (
            <span style={{ fontSize: '0.75rem', color: SUB, textDecoration: 'line-through' }}>{Number(product.priceOriginal).toLocaleString()} {currency}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ==================================================================
   HOME — Hero Layout: Asymmetric
   ================================================================== */
export function Home({ store, page }: any) {
  const t = Tt[getLang(store)];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const searchQ = searchParams.get('search');

  const products: Product[] = store?.products || [];
  const cats = store?.categories || [];
  const countPage = Math.ceil((store?.count || products.length) / 48);
  const currentPage = Number(page) || 1;

  return (
    <div>
      {/* HERO — asymmetric: oversized headline overlapping a smaller image tile */}
      <section style={{ background: DARK, position: 'relative', overflow: 'hidden', minHeight: 'clamp(480px, 68vh, 760px)', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', width: '100%', position: 'relative', zIndex: 2, padding: '4rem 1.5rem' }}>
          <span className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: AL, color: A, fontSize: '0.75rem', fontWeight: 800, padding: '6px 14px', borderRadius: 999, width: 'fit-content', letterSpacing: '0.05em' }}>
            <Zap size={13} /> {t.heroTag}
          </span>
          <h1 className="hero-title display-font" style={{ fontSize: 'clamp(2.25rem, 7vw, 5rem)', color: '#fff', margin: '0.5rem 0', fontWeight: 700, maxWidth: 780, lineHeight: 1.05 }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || '') }} />
          <p className="hero-sub" style={{ color: '#c9c9c9', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', maxWidth: 560, margin: '0 0 1.75rem' }}>
            {store?.hero?.subtitle}
          </p>
          <div className="hero-cta" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="#products" className="btn-primary" style={{ ...btnPrimary, width: 'auto', paddingInline: 28 }}>
              {t.shopNow} <ArrowRight size={16} className="btn-icon" />
            </Link>
            {store?.cart !== false && (
              <Link href="/cart" style={{ ...btnOutline, width: 'auto', paddingInline: 28, color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }}>
                {t.heroCta2}
              </Link>
            )}
          </div>
        </div>

        {store?.hero?.imageUrl && (
          <div className="hero-float" style={{ position: 'absolute', insetInlineEnd: '6%', bottom: '8%', width: 'clamp(180px, 26vw, 340px)', aspectRatio: '3/4', borderRadius: 8, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: `3px solid ${A}`, zIndex: 1, display: 'none' }} id="hero-float-img">
            <img src={store.hero.imageUrl} alt={store?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <img
          src={store?.hero?.imageUrl}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: store?.hero?.imageUrl ? 0.18 : 0 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${DARK} 0%, rgba(14,14,16,0.55) 60%, ${DARK} 100%)` }} />
      </section>

      {/* TRUST BAR */}
      <section className="container" style={{ padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1.25rem' }}>
        {t.trust.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem', border: `1px solid ${BD}`, borderRadius: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Timer size={18} color={AD} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{item.t}</p>
              <p style={{ fontSize: '0.75rem', color: SUB, margin: 0 }}>{item.s}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <section className="container" style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: 22, overflowX: 'auto', borderBottom: `1px solid ${BD}` }}>
          <Link href="/" className={`cat-chip ${!activeCategory ? 'active' : ''}`} style={{ padding: '10px 2px', fontSize: '0.85rem', fontWeight: 600, borderBottom: '3px solid transparent', whiteSpace: 'nowrap' }}>
            {t.all}
          </Link>
          {cats.map((cat: any) => (
            <Link key={cat.id} href={`?category=${cat.id}`} className={`cat-chip ${activeCategory === String(cat.id) ? 'active' : ''}`}
              style={{ padding: '10px 2px', fontSize: '0.85rem', fontWeight: 600, borderBottom: '3px solid transparent', whiteSpace: 'nowrap' }}>
              {cat.name}
            </Link>
          ))}
        </section>
      )}

      {/* PRODUCTS GRID */}
      <section id="products" className="container" style={{ padding: '2rem 1.5rem 3rem' }}>
        {searchQ && (
          <p style={{ marginBottom: 16, color: SUB, fontSize: '0.9rem' }}>{t.searchResultsFor} <strong style={{ color: TXT }}>{searchQ}</strong></p>
        )}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: SUB }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p, i) => {
              const priceOriginal = Number(p.priceOriginal || 0);
              const price = Number(p.price);
              const discount = priceOriginal > price ? Math.round(((priceOriginal - price) / priceOriginal) * 100) : 0;
              return (
                <div key={p.id} style={{ animationDelay: `${i * 0.06}s` }}>
                  <Card product={p} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={discount} store={store} viewDetails />
                </div>
              );
            })}
          </div>
        )}

        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {Array.from({ length: countPage }, (_, i) => i + 1).map((pg) => (
              <Link key={pg} href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), page: pg } }} scroll={false}
                style={{
                  minWidth: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 4, border: `1px solid ${pg === currentPage ? A : BD}`,
                  background: pg === currentPage ? A : '#fff', color: pg === currentPage ? DARK : TXT, fontWeight: 700, fontSize: '0.85rem',
                }}>
                {pg}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ==================================================================
   DETAILS
   ================================================================== */
export function Details({ product, store: storeprop, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const t = Tt[getLang(storeprop || product?.store)];
  const [sel, setSel] = useState(0);
  const images: string[] = allImages?.length ? allImages : [product?.productImage].filter(Boolean);
  const currency = product?.store?.currency || 'DA';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      <div className="details-inner">
        {/* Gallery */}
        <div>
          <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 4, overflow: 'hidden', border: `1px solid ${BD}`, background: '#f2f2f2' }}>
            {images[sel] ? (
              <img src={images[sel]} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlaceholderIcon size={60} /></div>
            )}
            {discount > 0 && (
              <span style={{ position: 'absolute', top: 12, insetInlineStart: 12, background: A, color: DARK, fontWeight: 800, fontSize: '0.75rem', padding: '4px 10px', borderRadius: 4 }}>-{discount}%</span>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setSel((s) => (s - 1 + images.length) % images.length)} style={{ position: 'absolute', insetInlineStart: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 36, height: 36 }}><ChevronLeft size={18} /></button>
                <button onClick={() => setSel((s) => (s + 1) % images.length)} style={{ position: 'absolute', insetInlineEnd: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 36, height: 36 }}><ChevronRight size={18} /></button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setSel(i)} style={{ width: 60, height: 60, flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: `2px solid ${i === sel ? A : BD}`, padding: 0, background: 'none' }}>
                  <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="display-font" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', margin: '0 0 8px' }}>{product?.name}</h1>
          <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={A} color={A} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: DARK }}>{finalPrice?.toLocaleString()} {currency}</span>
            {product?.priceOriginal && Number(product.priceOriginal) > finalPrice && (
              <span style={{ fontSize: '1rem', color: SUB, textDecoration: 'line-through' }}>{Number(product.priceOriginal).toLocaleString()} {currency}</span>
            )}
          </div>

          {product?.offers?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>{t.offersTitle}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o: Offer) => (
                  <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${selectedOffer === o.id ? A : BD}`, borderRadius: 4, padding: '10px 12px', cursor: 'pointer' }}>
                    <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                    <span style={{ fontSize: '0.85rem', flex: 1 }}>{o.name}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{o.price.toLocaleString()} {currency}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {allAttrs?.map((attr: Attribute) => (
            <div key={attr.id} style={{ marginBottom: 18 }}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>{attr.name}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {attr.variants.map((v) => {
                  const active = selectedVariants?.[attr.name] === v.value;
                  if (attr.displayMode === 'color') {
                    return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: 32, height: 32, borderRadius: '50%', background: v.value, border: active ? `3px solid ${A}` : `1px solid ${BD}`, cursor: 'pointer' }} title={v.name} />;
                  }
                  if (attr.displayMode === 'image') {
                    return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: 48, height: 48, borderRadius: 4, overflow: 'hidden', border: active ? `2px solid ${A}` : `1px solid ${BD}`, padding: 0 }}><img src={v.value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></button>;
                  }
                  return (
                    <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '8px 16px', borderRadius: 4, border: active ? `2px solid ${A}` : `1px solid ${BD}`, background: active ? AL : '#fff', fontWeight: 600, fontSize: '0.8rem' }}>
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <ProductForm
            product={product}
            store={storeprop}
            userId={product?.store?.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
          />

          {product?.desc && (
            <div style={{ marginTop: 28, borderTop: `1px solid ${BD}`, paddingTop: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 10 }}>{t.descTitle}</p>
              <div style={{ fontSize: '0.85rem', color: SUB, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   PRODUCT FORM
   ================================================================== */
export function ProductForm({ product, store: storeprop, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: any) {
  const store = storeprop || product?.store;
  const t = Tt[getLang(store)];
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);
  const currency = store?.currency || 'DA';

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

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

  const getFP = useCallback((): number => {
    if (selectedOffer && product?.offers?.length) {
      const o = product.offers.find((x: Offer) => x.id === selectedOffer);
      if (o) return o.price;
    }
    if (product?.variantDetails?.length) {
      const match = product.variantDetails.find((d: VariantDetail) => variantMatches(d, selectedVariants || {}));
      if (match && match.price !== -1) return match.price;
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
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addToCart = () => {
    const key = domain || store?.subdomain;
    if (!key) return;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.push({
      ...fd, product, variantDetailId: getVarId(product, selectedVariants || {}),
      productId: product?.id, storeId: store?.id, userId,
      selectedOffer, selectedVariants, platform,
      finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(),
      addedAt: Date.now(),
    });
    localStorage.setItem(key, JSON.stringify(arr));
    initCount(arr.length);
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...fd, product, variantDetailId: getVarId(product, selectedVariants || {}),
        productId: product?.id, storeId: store?.id, userId,
        selectedOffer, selectedVariants, platform,
        finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(),
      };
      const res = await fetch(`${API_URL}/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (fd.customerId || d?.customerId) localStorage.setItem('customerId', d?.customerId || fd.customerId);
      router.push(`/successfully?productId=${product?.id}`);
    } catch {
      setErrors({ submit: t.errSubmit });
    }
    setSubmitting(false);
  };

  return (
    <div>
      {isOrderNow && (
        <div style={{ border: `1px solid ${BD}`, borderRadius: 4, padding: '1rem', marginBottom: 16 }}>
          <div className="form-row-2">
            <div>
              <input placeholder={t.fullNamePlaceholder} value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} style={inputBase(!!errors.customerName)} />
              {errors.customerName && <ErrorMsg text={errors.customerName} />}
            </div>
            <div>
              <input placeholder={t.phonePlaceholder} value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} style={inputBase(!!errors.customerPhone)} />
              {errors.customerPhone && <ErrorMsg text={errors.customerPhone} />}
            </div>
          </div>
          <div className="form-row-2">
            <div style={{ position: 'relative' }}>
              <ChevronDown size={12} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
              <select disabled={wilayas.length === 0} value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inputBase(!!errors.customerWelaya), paddingRight: 36 }}>
                <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
              </select>
              {errors.customerWelaya && <ErrorMsg text={errors.customerWelaya} />}
            </div>
            <div style={{ position: 'relative' }}>
              <ChevronDown size={12} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
              <select disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inputBase(!!errors.customerCommune), paddingRight: 36 }}>
                <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>)}
              </select>
              {errors.customerCommune && <ErrorMsg text={errors.customerCommune} />}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {(['home', 'office'] as const).map((type) => (
              <button key={type} onClick={() => setFd({ ...fd, typeLivraison: type })}
                style={{
                  padding: '10px', borderRadius: 4, fontWeight: 700, fontSize: '0.8rem',
                  background: fd.typeLivraison === type ? AL : 'transparent',
                  border: `1px solid ${fd.typeLivraison === type ? A : BD}`,
                  color: fd.typeLivraison === type ? DARK : SUB,
                }}>
                {type === 'home' ? t.deliveryHome : t.deliveryOffice}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${BD}`, borderRadius: 4, width: 'fit-content', marginBottom: 16 }}>
            <button onClick={() => setFd((s) => ({ ...s, quantity: Math.max(1, s.quantity - 1) }))} style={{ width: 36, height: 36, border: 'none', background: 'none' }}><Minus size={14} /></button>
            <span style={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{fd.quantity}</span>
            <button onClick={() => setFd((s) => ({ ...s, quantity: s.quantity + 1 }))} style={{ width: 36, height: 36, border: 'none', background: 'none' }}><Plus size={14} /></button>
          </div>

          <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 12, marginBottom: 16 }}>
            {[
              { l: t.price, v: `${fp.toLocaleString()} ${currency}` },
              { l: t.qty, v: `× ${fd.quantity}` },
              { l: t.delivery, v: selW ? fmtPrice(getLiv(), currency) : '—' },
            ].map((row) => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '4px 0', fontSize: '0.85rem', color: SUB }}>
                <span style={{ flexShrink: 0 }}>{row.l}</span>
                <span style={{ whiteSpace: 'nowrap', fontWeight: 600, color: TXT }}>{row.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 8, marginTop: 4, borderTop: `1px solid ${BD}` }}>
              <span style={{ fontWeight: 800 }}>{t.total}</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: '1.1rem', color: DARK }}>{fmtPrice(total(), currency)}</span>
            </div>
          </div>

          {errors.submit && <ErrorMsg text={errors.submit} />}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submitOrder} disabled={submitting} className="btn-primary" style={btnPrimary}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            <button onClick={() => setIsOrderNow(false)} disabled={submitting} style={btnOutline}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {!isOrderNow && (
        <div style={{ display: 'flex', gap: 10 }}>
          {store?.cart !== false && (
            <button onClick={addToCart} className="btn-primary" style={{ ...btnOutline, flex: 1 }}>
              {t.addToCart}
            </button>
          )}
          <button onClick={() => setIsOrderNow(true)} className="btn-primary" style={{ ...btnPrimary, flex: 1 }}>
            {t.orderNow}
          </button>
        </div>
      )}
    </div>
  );
}

/* ==================================================================
   CART
   ================================================================== */
export function Cart({ domain, store }: any) {
  const t = Tt[getLang(store)];
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);
  const currency = store?.currency || 'DA';

  const [items, setItems] = useState<any[]>([]);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
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
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = items.map((it) => ({
        ...fd, product: it.product, variantDetailId: it.variantDetailId,
        productId: it.productId, storeId: it.storeId, userId: it.userId,
        selectedOffer: it.selectedOffer, selectedVariants: it.selectedVariants, platform: it.platform,
        finalPrice: it.finalPrice, quantity: it.quantity,
        totalPrice: it.finalPrice * it.quantity + getLiv(), priceLivraison: getLiv(),
      }));
      await fetch(`${API_URL}/orders/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      localStorage.removeItem(domain);
      initCount(0);
      setSuccess(true);
    } catch {
      setErrors({ submit: t.errSubmit });
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={32} color={AD} />
        </div>
        <h2 className="display-font" style={{ fontSize: '1.5rem', marginBottom: 8 }}>{t.successTitle}</h2>
        <p style={{ color: SUB, marginBottom: 24 }}>{t.successDesc}</p>
        <Link href="/" style={{ ...btnPrimary, display: 'inline-flex', width: 'auto', paddingInline: 32 }}>{t.backToShop}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <ShoppingBag size={48} color={BD} style={{ marginBottom: 16 }} />
        <h2 className="display-font" style={{ fontSize: '1.4rem', marginBottom: 8 }}>{t.cartEmpty}</h2>
        <p style={{ color: SUB, marginBottom: 24 }}>{t.cartEmptyDesc}</p>
        <Link href="/" style={{ ...btnPrimary, display: 'inline-flex', width: 'auto', paddingInline: 32 }}>{t.shopNow}</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      <h1 className="display-font" style={{ fontSize: '1.6rem', marginBottom: 24 }}>{t.myCart}</h1>
      <div className="cart-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it, idx) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            return (
              <div key={idx} style={{ display: 'flex', gap: 12, border: `1px solid ${BD}`, borderRadius: 4, padding: 12, alignItems: 'center' }}>
                <div style={{ width: 68, height: 68, flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: '#f2f2f2' }}>
                  {img ? <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlaceholderIcon size={26} /></div>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{it.product?.name}</p>
                  <p style={{ fontSize: '0.8rem', color: SUB, margin: '4px 0 0' }}>{t.qty}: {it.quantity} · {Number(it.finalPrice).toLocaleString()} {currency}</p>
                </div>
                <button onClick={() => removeItem(idx)} aria-label={t.deleteItem} style={{ background: 'none', border: 'none', color: ERR }}><Trash2 size={18} /></button>
              </div>
            );
          })}
        </div>

        <div style={{ border: `1px solid ${BD}`, borderRadius: 4, padding: '1.25rem', height: 'fit-content' }}>
          <div className="form-row-2">
            <div>
              <input placeholder={t.fullNamePlaceholder} value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} style={inputBase(!!errors.customerName)} />
              {errors.customerName && <ErrorMsg text={errors.customerName} />}
            </div>
            <div>
              <input placeholder={t.phonePlaceholder} value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} style={inputBase(!!errors.customerPhone)} />
              {errors.customerPhone && <ErrorMsg text={errors.customerPhone} />}
            </div>
          </div>
          <div className="form-row-2">
            <div style={{ position: 'relative' }}>
              <ChevronDown size={12} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
              <select disabled={wilayas.length === 0} value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inputBase(!!errors.customerWelaya), paddingRight: 36 }}>
                <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
              </select>
              {errors.customerWelaya && <ErrorMsg text={errors.customerWelaya} />}
            </div>
            <div style={{ position: 'relative' }}>
              <ChevronDown size={12} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
              <select disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inputBase(!!errors.customerCommune), paddingRight: 36 }}>
                <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>)}
              </select>
              {errors.customerCommune && <ErrorMsg text={errors.customerCommune} />}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {(['home', 'office'] as const).map((type) => (
              <button key={type} onClick={() => setFd({ ...fd, typeLivraison: type })}
                style={{ padding: '10px', borderRadius: 4, fontWeight: 700, fontSize: '0.8rem', background: fd.typeLivraison === type ? AL : 'transparent', border: `1px solid ${fd.typeLivraison === type ? A : BD}`, color: fd.typeLivraison === type ? DARK : SUB }}>
                {type === 'home' ? t.deliveryHome : t.deliveryOffice}
              </button>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '4px 0', fontSize: '0.85rem', color: SUB }}>
              <span style={{ flexShrink: 0 }}>{t.subtotal}</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 600, color: TXT }}>{fmtPrice(cartTotal, currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '4px 0', fontSize: '0.85rem', color: SUB }}>
              <span style={{ flexShrink: 0 }}>{t.delivery}</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 600, color: TXT }}>{selW ? fmtPrice(getLiv(), currency) : '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 8, marginTop: 4, borderTop: `1px solid ${BD}` }}>
              <span style={{ fontWeight: 800 }}>{t.total}</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: '1.1rem', color: DARK }}>{fmtPrice(finalTotal, currency)}</span>
            </div>
          </div>

          {errors.submit && <ErrorMsg text={errors.submit} />}
          <button onClick={submitOrder} disabled={submitting} className="btn-primary" style={btnPrimary}>
            {submitting ? t.sending : t.confirmOrder}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   STATIC PAGES
   ================================================================== */
function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ background: DARK, padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h1 className="display-font" style={{ color: '#fff', fontSize: '1.8rem', margin: 0 }}>{title}</h1>
      </div>
      <div className="container" style={{ padding: '2.5rem 1.5rem 4rem', maxWidth: 860 }}>{children}</div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{title}</h3>
      <p style={{ color: SUB, fontSize: '0.9rem', lineHeight: 1.9 }}>{body}</p>
    </div>
  );
}

export function Privacy({ store }: any = {}) {
  const t = Tt[getLang(store)];
  const isAr = t.dir === 'rtl';
  return (
    <Shell title={t.privacyTitle}>
      <InfoBlock
        title={isAr ? 'جمع البيانات' : t.dir === 'ltr' && store?.language === 'fr' ? 'Collecte des données' : 'Data Collection'}
        body={isAr ? 'نقوم بجمع المعلومات الضرورية فقط لمعالجة طلبك وتوصيله، مثل الاسم، رقم الهاتف، والعنوان.' : store?.language === 'fr' ? 'Nous collectons uniquement les informations nécessaires au traitement et à la livraison de votre commande : nom, téléphone et adresse.' : 'We only collect the information necessary to process and deliver your order, such as name, phone number, and address.'}
      />
      <InfoBlock
        title={isAr ? 'استخدام البيانات' : store?.language === 'fr' ? 'Utilisation des données' : 'Use of Data'}
        body={isAr ? 'تُستخدم بياناتك فقط لغرض إتمام عملية الشراء والتواصل معك بخصوص طلبك.' : store?.language === 'fr' ? "Vos données sont utilisées uniquement pour finaliser votre achat et communiquer avec vous à ce sujet." : 'Your data is used solely to complete your purchase and communicate with you about your order.'}
      />
    </Shell>
  );
}

export function Terms({ store }: any = {}) {
  const t = Tt[getLang(store)];
  const isAr = t.dir === 'rtl';
  return (
    <Shell title={t.termsTitle}>
      <InfoBlock
        title={isAr ? 'الطلبات والدفع' : store?.language === 'fr' ? 'Commandes et paiement' : 'Orders & Payment'}
        body={isAr ? 'يتم تأكيد الطلبات عبر الهاتف، والدفع عند الاستلام في معظم الحالات.' : store?.language === 'fr' ? 'Les commandes sont confirmées par téléphone, avec paiement à la livraison dans la plupart des cas.' : 'Orders are confirmed by phone, with cash on delivery in most cases.'}
      />
      <InfoBlock
        title={isAr ? 'الإرجاع والاستبدال' : store?.language === 'fr' ? 'Retours et échanges' : 'Returns & Exchanges'}
        body={isAr ? 'يمكن إرجاع المنتج خلال فترة محددة في حال وجود عيب مصنعي.' : store?.language === 'fr' ? 'Le produit peut être retourné dans un délai déterminé en cas de défaut de fabrication.' : 'Products may be returned within a set period in case of a manufacturing defect.'}
      />
    </Shell>
  );
}

export function Cookies({ store }: any = {}) {
  const t = Tt[getLang(store)];
  const isAr = t.dir === 'rtl';
  return (
    <Shell title={t.cookiesTitle}>
      <InfoBlock
        title={isAr ? 'ملفات تعريف الارتباط' : store?.language === 'fr' ? 'Cookies' : 'Cookies'}
        body={isAr ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك أثناء التصفح وحفظ محتوى سلتك.' : store?.language === 'fr' ? 'Nous utilisons des cookies pour améliorer votre expérience de navigation et enregistrer le contenu de votre panier.' : 'We use cookies to improve your browsing experience and save your cart contents.'}
      />
    </Shell>
  );
}

export function Contact({ store }: any) {
  const t = Tt[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      setSuccess(true);
    } catch { /* noop */ }
    setSubmitting(false);
  };

  if (success) {
    return (
      <Shell title={t.contactTitle}>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Check size={28} color={AD} />
          </div>
          <h3 style={{ marginBottom: 6 }}>{t.msgSuccessTitle}</h3>
          <p style={{ color: SUB, marginBottom: 20 }}>{t.msgSuccessDesc}</p>
          <button onClick={() => { setSuccess(false); setForm({ name: '', email: '', phone: '', message: '' }); }} style={{ ...btnOutline, width: 'auto', paddingInline: 24 }}>
            {t.sendAnother}
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title={t.contactTitle}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="details-inner">
        <div>
          {store?.contact?.phone && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, fontSize: '0.9rem' }}><Phone size={16} color={AD} /> {store.contact.phone}</p>
          )}
          {store?.contact?.email && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, fontSize: '0.9rem' }}><Mail size={16} color={AD} /> {store.contact.email}</p>
          )}
          {(store?.contact?.wilaya || store?.contact?.address) && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}><MapPin size={16} color={AD} /> {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(', ')}</p>
          )}
        </div>
        <form onSubmit={submit}>
          <input required placeholder={t.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputBase(), marginBottom: 12 }} />
          <input required type="email" placeholder={t.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ ...inputBase(), marginBottom: 12 }} />
          <input placeholder={t.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ ...inputBase(), marginBottom: 12 }} />
          <textarea required rows={5} placeholder={t.message} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ ...inputBase(), resize: 'none', marginBottom: 14 }} />
          <button type="submit" disabled={submitting} className="btn-primary" style={btnPrimary}>{submitting ? t.sending : t.send}</button>
        </form>
      </div>
    </Shell>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  if (p === 'privacy') return <Privacy store={store} />;
  if (p === 'terms') return <Terms store={store} />;
  if (p === 'cookies') return <Cookies store={store} />;
  if (p === 'contact') return <Contact store={store} />;
  return <Privacy store={store} />;
}