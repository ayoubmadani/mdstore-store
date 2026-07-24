'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useCartStore } from '@/store/useCartStore';

// =============================================================================
// Whitecap Marine Essentials Theme
// NAVBAR ARCHETYPE: B — Double Bar
// CARD ARCHETYPE: 5 — Framed Label
// HERO LAYOUT: full-bleed
// TYPOGRAPHY PAIR: Cairo (display) + Tajawal (body)
// =============================================================================

/* ─── Types (must be preserved as-is) ─── */
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
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}

/* ─── API ─── */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ─── Multilingual T Pattern ─── */
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
    search: 'ابحث عن منتج...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
    showAll: 'عرض كل النتائج →',
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تسوق الآن',
    trust: [
      { t: 'توصيل سريع',    s: 'لكل الولايات' },
      { t: 'جودة مضمونة',   s: 'منتجات أصلية 100%' },
      { t: 'دفع آمن',       s: 'حماية كاملة للبيانات' },
      { t: 'دعم 24/7',       s: 'فريق متخصص للمساعدة' },
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
  },
  fr: {
    dir: 'ltr' as const,
    home: 'Accueil', contact: 'Contact', cart: 'Panier',
    search: 'Rechercher...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats →',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la boutique',
    trust: [
      { t: 'Livraison Rapide',   s: 'Partout en Algérie' },
      { t: 'Qualité Garantie',   s: 'Produits certifiés' },
      { t: 'Paiement Sécurisé',  s: 'Vos données protégées' },
      { t: 'Support 24/7',       s: 'Toujours disponible' },
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
  },
  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart',
    search: 'Search products...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results →',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Shop Now',
    trust: [
      { t: 'Fast Delivery',        s: 'Across all wilayas' },
      { t: 'Quality Guaranteed',   s: '100% authentic products' },
      { t: 'Secure Payment',       s: 'Full data protection' },
      { t: '24/7 Support',         s: 'Expert team always here' },
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
  },
} as const;

type TKeys = typeof T['ar'];

/* ─── Helpers ─── */
function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`);
    return data || [];
  } catch { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`);
    return data || [];
  } catch { return []; }
};

/* ─── Icons (inline SVGs for reliability) ─── */
const IconSearch = ({ size = 20, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const IconX = ({ size = 20, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const IconCart = ({ size = 20, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);
const IconMenu = ({ size = 20, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
);
const IconPhone = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const IconMail = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const IconMapPin = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const IconChevronDown = ({ size = 14, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
const IconTrash = ({ size = 18, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const IconPlus = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const IconMinus = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
);
const IconStar = ({ size = 14, color = 'currentColor', fill = 'none' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const IconAlert = ({ size = 12, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);
const IconAnchor = ({ size = 40, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></svg>
);
const IconArrowRight = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const IconArrowLeft = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
);

/* ─── Design Tokens ─── */
const A   = '#1e5a8e';   // accent — deep ocean
const AD  = '#164570';   // accent dark
const AL  = '#e8f4f8';   // accent light — seafoam
const BG  = '#f0f4f8';   // background
const CARD= '#ffffff';   // card bg
const TXT = '#0f172a';   // text
const SUB = '#64748b';   // muted text
const BD  = '#cbd5e1';   // border
const ERR = '#dc2626';   // error

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN                                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div dir={t.dir} style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: BG, color: TXT, minHeight: '100vh' }}>
      <Navbar store={store} domain={domain} />
      <main style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.35s ease' }}>{children}</main>
      <Footer store={store} />
      <ThemeCSS />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  NAVBAR  —  ARCHETYPE B: Double Bar                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [imgError, setImgError] = useState(false);
  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      if (raw) initCount(JSON.parse(raw).length);
    } catch { /* noop */ }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        setListSearch(data?.products || []);
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, domain]);

  const mobileLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const desktopLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const logo = store?.design?.logoUrl;
  const topBarText = store?.topBar?.enabled && store?.topBar?.text ? store.topBar.text : null;

  return (
    <header className="wc-nav">
      {/* Top bar */}
      <div className="wc-nav-top" style={{
        background: AD, color: '#fff', fontSize: '0.8rem',
        padding: '8px 0', display: topBarText || store?.contact?.phone ? 'block' : 'none'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ opacity: 0.9 }}>{topBarText}</span>
          {store?.contact?.phone && (
            <a href={`tel:${store.contact.phone}`} style={{ color: '#fff', opacity: 0.9, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <IconPhone size={14} color="#fff" /> {store.contact.phone}
            </a>
          )}
        </div>
      </div>

      {/* Main sticky bar */}
      <nav className="wc-nav-main" style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : '0 1px 0 rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        borderBottom: `1px solid ${BD}`
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 24 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: TXT, flexShrink: 0 }}>
            {logo && !imgError ? (
              <img src={logo} alt={store?.name} onError={() => setImgError(true)} style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconAnchor size={28} color={A} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{store?.name || 'Whitecap'}</span>
              </div>
            )}
          </Link>

          {/* Desktop links */}
          <div className="wc-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {desktopLinks.map(lnk => (
              <Link key={lnk.h} href={lnk.h} className="wc-nav-link" style={{ textDecoration: 'none', color: TXT, fontWeight: 600, fontSize: '0.9rem', position: 'relative' }}>
                {lnk.l}
              </Link>
            ))}
          </div>

          {/* Search + Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Desktop search */}
            <div ref={searchRef} className="wc-search-desktop" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: BG, borderRadius: 999, padding: '6px 14px', border: `1px solid ${searchFocused ? A : BD}`, transition: 'border-color 0.2s', width: searchFocused ? 260 : 180, transitionProperty: 'width, border-color', transitionDuration: '0.3s' }}>
                <IconSearch size={16} color={SUB} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', marginInlineStart: 8, fontSize: '0.85rem', width: '100%', color: TXT }}
                />
              </div>
              {listSearch.length > 0 && searchFocused && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', insetInlineEnd: 0, width: 340, background: '#fff', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', borderRadius: 10, zIndex: 500, maxHeight: 380, overflowY: 'auto', border: `1px solid ${BD}` }}>
                  {listSearch.map((p: any) => (
                    <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={() => { setSearchFocused(false); setSearchQuery(''); setListSearch([]); }}
                      style={{ display: 'flex', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${BD}`, alignItems: 'center', textDecoration: 'none' }}>
                      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: TXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                        <p style={{ fontSize: '0.75rem', color: A, margin: 0, fontWeight: 700 }}>{Number(p.price).toLocaleString()} {store?.currency}</p>
                      </div>
                    </Link>
                  ))}
                  <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => { setSearchFocused(false); }}
                    style={{ display: 'block', padding: '10px 14px', borderTop: `1px solid ${BD}`, fontSize: '0.8rem', textAlign: 'center', color: A, fontWeight: 700, textDecoration: 'none' }}>
                    {t.showAll}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile search toggle */}
            <button className="wc-search-mobile-btn" onClick={() => setShowSearch(true)} aria-label={t.search} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
              <IconSearch size={22} color={TXT} />
            </button>

            {/* Cart */}
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', textDecoration: 'none', color: TXT, display: 'flex', alignItems: 'center' }}>
                <IconCart size={22} color={TXT} />
                {count > 0 && (
                  <span className="wc-badge" style={{ position: 'absolute', top: -6, insetInlineEnd: -8, background: A, color: '#fff', fontSize: '0.65rem', fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {count}
                  </span>
                )}
              </Link>
            )}

            {/* Hamburger */}
            <button className="wc-burger" onClick={() => setOpen(!open)} aria-label="Menu" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
              {open ? <IconX size={24} color={TXT} /> : <IconMenu size={24} color={TXT} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="wc-mobile-menu" style={{ background: '#fff', borderTop: `1px solid ${BD}`, padding: '16px 1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mobileLinks.map(lnk => (
              <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)} style={{ textDecoration: 'none', color: TXT, fontWeight: 600, fontSize: '1rem' }}>
                {lnk.l}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile search overlay */}
      {showSearch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column' }}
          onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconSearch size={20} color={SUB} />
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.search}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', color: TXT }} />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <IconX size={22} color={TXT} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: '#fff', marginTop: 1 }}>
            {loading && <p style={{ padding: '1rem', textAlign: 'center', color: SUB }}>{t.searching}</p>}
            {listSearch.map((p: any) => (
              <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={() => setShowSearch(false)}
                style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${BD}`, alignItems: 'center', textDecoration: 'none' }}>
                <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: TXT }}>{p.name}</p>
                  <p style={{ fontSize: '0.8rem', color: A, margin: 0, fontWeight: 700 }}>{Number(p.price).toLocaleString()} {store?.currency}</p>
                </div>
              </Link>
            ))}
            {listSearch.length > 0 && (
              <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearch(false)}
                style={{ display: 'block', padding: '14px', textAlign: 'center', background: BG, fontWeight: 700, color: A, textDecoration: 'none' }}>
                {t.showAll.replace('→', '')} &quot;{searchQuery}&quot;
              </Link>
            )}
            {searchQuery.length >= 2 && !loading && listSearch.length === 0 && (
              <p style={{ padding: '2rem', textAlign: 'center', color: SUB }}>{t.noResults} &quot;{searchQuery}&quot;</p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  FOOTER                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const year = new Date().getFullYear();

  const links = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
    { h: '/cart', l: t.cart },
    { h: '/privacy', l: t.privacy },
    { h: '/terms', l: t.terms },
    { h: '/cookies', l: t.cookies },
  ].filter(lnk => lnk.h !== '/cart' || store?.cart !== false);

  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem 2rem' }}>
        <div className="wc-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <IconAnchor size={24} color={A} />
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{store?.name || 'Whitecap'}</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, margin: 0, maxWidth: 320 }}>{store?.hero?.subtitle || ''}</p>
            <p style={{ fontSize: '0.8rem', marginTop: 16, opacity: 0.7 }}>© {year} {store?.name || 'Whitecap'}. {t.rightsReserved}</p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.quickLinks}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map(lnk => (
                <Link key={lnk.h} href={lnk.h} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                  {lnk.l}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.contactUs}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {store?.contact?.phone && (
                <a href={`tel:${store.contact.phone}`} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconPhone size={14} color="#94a3b8" /> {store.contact.phone}
                </a>
              )}
              {store?.contact?.email && (
                <a href={`mailto:${store.contact.email}`} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconMail size={14} color="#94a3b8" /> {store.contact.email}
                </a>
              )}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconMapPin size={14} color="#94a3b8" /> {store.contact.wilaya} {store.contact.address}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CARD  —  ARCHETYPE 5: Framed Label                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, store: storeProp, viewDetails }: any) {
  const t = T[getLang(storeProp)];
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product?.productImage || product?.imagesProduct?.[0]?.imageUrl;

  return (
    <div className="wc-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: `1px solid ${BD}`, borderRadius: 8, overflow: 'hidden', background: CARD, transition: 'transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
      {/* Eyebrow */}
      <div style={{ background: AL, padding: '3px 12px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: AD }}>
        {product?.store?.name || (t.dir === 'rtl' ? 'منتج' : 'Product')}
      </div>
      {/* Image */}
      <div style={{ aspectRatio: '1/1', overflow: 'hidden', position: 'relative' }}>
        {img && !imgErr ? (
          <img src={img} alt={product?.name} onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
            <IconAnchor size={40} color={BD} />
          </div>
        )}
        {discount > 0 && (
          <span style={{ position: 'absolute', top: 8, insetInlineEnd: 8, background: A, color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
            -{discount}%
          </span>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 8px', color: TXT, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product?.name}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 800, color: A, fontSize: '1rem', whiteSpace: 'nowrap' }}>
            {Number(product?.price).toLocaleString()} {storeProp?.currency}
          </span>
          {product?.priceOriginal && Number(product.priceOriginal) > Number(product.price) && (
            <span style={{ fontSize: '0.75rem', color: SUB, textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
              {Number(product.priceOriginal).toLocaleString()} {storeProp?.currency}
            </span>
          )}
        </div>
        {viewDetails !== false && (
          <Link href={`/product/${product?.slug || product?.id}`} style={{ display: 'block', marginTop: 'auto', background: A, color: '#fff', textAlign: 'center', padding: '8px 0', borderRadius: 4, fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = AD; }}
            onMouseLeave={e => { e.currentTarget.style.background = A; }}>
            {t.dir === 'rtl' ? 'عرض التفاصيل' : getLang(storeProp) === 'fr' ? 'Voir détails' : 'View Details'}
          </Link>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  HOME                                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const currentPage = Number(searchParams.get('page')) || 1;
  const products = store?.products || [];
  const cats = store?.categories || [];
  const countPage = Math.ceil((store?.count || products.length) / 48);

  const heroImage = store?.hero?.imageUrl;

  return (
    <div>
      {/* Hero */}
      <section style={{ position: 'relative', minHeight: 'clamp(480px, 68vh, 760px)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {heroImage && (
          <img src={heroImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 60%, rgba(15,23,42,0.2) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
          <div style={{ maxWidth: 640, marginInlineEnd: 'auto' }}>
            <h1 className="wc-hero-title" style={{ color: '#fff', fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem', animation: 'fadeUp 0.7s ease 0.1s both' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || '') }} />
            <p className="wc-hero-sub" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: 1.6, margin: '0 0 1.75rem', maxWidth: 520, animation: 'fadeUp 0.7s ease 0.25s both' }}>
              {store?.hero?.subtitle || ''}
            </p>
            <div className="wc-hero-cta" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.7s ease 0.4s both' }}>
              <Link href="/?page=1" style={{ background: A, color: '#fff', padding: '0.875rem 1.75rem', fontWeight: 700, fontSize: '0.9rem', borderRadius: 4, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = AD; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = A; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {t.shopNow}
              </Link>
              {store?.cart !== false && (
                <Link href="/cart" style={{ background: 'transparent', color: '#fff', padding: '0.875rem 1.75rem', fontWeight: 700, fontSize: '0.9rem', borderRadius: 4, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  {t.cart}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ background: '#fff', borderBottom: `1px solid ${BD}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem' }}>
          <div className="wc-trust-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {t.trust.map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: TXT, margin: '0 0 4px' }}>{item.t}</p>
                <p style={{ fontSize: '0.8rem', color: SUB, margin: 0 }}>{item.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {cats.length > 0 && (
        <section style={{ padding: '2rem 0', background: BG }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/" className={!activeCategory && !searchQuery ? 'wc-cat-active' : 'wc-cat'}
                style={{ padding: '6px 16px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', border: `1px solid ${BD}`, background: !activeCategory && !searchQuery ? A : '#fff', color: !activeCategory && !searchQuery ? '#fff' : TXT, transition: 'all 0.2s' }}>
                {t.all}
              </Link>
              {cats.map((cat: any) => (
                <Link key={cat.id} href={`?category=${cat.id}`} className={activeCategory === String(cat.id) ? 'wc-cat-active' : 'wc-cat'}
                  style={{ padding: '6px 16px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', border: `1px solid ${BD}`, background: activeCategory === String(cat.id) ? A : '#fff', color: activeCategory === String(cat.id) ? '#fff' : TXT, transition: 'all 0.2s' }}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search results heading */}
      {searchQuery && (
        <section style={{ padding: '1.5rem 0 0', background: BG }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: TXT, margin: 0 }}>{t.searchResultsFor} &quot;{searchQuery}&quot;</h2>
          </div>
        </section>
      )}

      {/* Products */}
      <section style={{ padding: '2.5rem 0', background: BG }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <IconAnchor size={48} color={BD} />
              <p style={{ color: SUB, fontSize: '1rem', marginTop: 16 }}>{t.noProducts}</p>
              <Link href="/" style={{ color: A, fontWeight: 700, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>{t.backToShop}</Link>
            </div>
          ) : (
            <>
              <div className="wc-products-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {products.map((p: any, i: number) => {
                  const price = Number(p.price);
                  const priceOriginal = p.priceOriginal ? Number(p.priceOriginal) : 0;
                  const discount = priceOriginal > price ? Math.round(((priceOriginal - price) / priceOriginal) * 100) : 0;
                  return (
                    <div key={p.id} style={{ animation: 'fadeUp 0.5s ease both', animationDelay: `${Math.min(i * 0.07, 0.5)}s` }}>
                      <Card product={p} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={discount} store={store} viewDetails={true} />
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {countPage > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '2.5rem', flexWrap: 'wrap' }}>
                  {Array.from({ length: countPage }, (_, i) => i + 1).map(pg => (
                    <Link key={pg} href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), ...(searchQuery ? { search: searchQuery } : {}), page: pg } }} scroll={false}
                      style={{
                        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
                        background: currentPage === pg ? A : '#fff', color: currentPage === pg ? '#fff' : TXT,
                        border: `1px solid ${currentPage === pg ? A : BD}`, transition: 'all 0.2s'
                      }}>
                      {pg}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  DETAILS                                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store: storeprop }: any) {
  const t = T[getLang(storeprop || product?.store)];
  const [sel, setSel] = useState(0);
  const [imgErr, setImgErr] = useState<Record<number, boolean>>({});

  const images = allImages || [];

  return (
    <div style={{ background: BG, padding: '2rem 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="wc-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
          {/* Gallery */}
          <div>
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${BD}`, background: '#fff', aspectRatio: '1/1' }}>
              {images[sel] && !imgErr[sel] ? (
                <img src={images[sel]} alt={product?.name} onError={() => setImgErr(p => ({ ...p, [sel]: true }))}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
                  <IconAnchor size={64} color={BD} />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setSel(s => (s - 1 + images.length) % images.length)} style={{ position: 'absolute', insetInlineStart: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {t.dir === 'rtl' ? <IconArrowRight size={16} color={TXT} /> : <IconArrowLeft size={16} color={TXT} />}
                  </button>
                  <button onClick={() => setSel(s => (s + 1) % images.length)} style={{ position: 'absolute', insetInlineEnd: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {t.dir === 'rtl' ? <IconArrowLeft size={16} color={TXT} /> : <IconArrowRight size={16} color={TXT} />}
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSel(i)} style={{ width: 64, height: 64, borderRadius: 6, overflow: 'hidden', border: `2px solid ${sel === i ? A : BD}`, padding: 0, cursor: 'pointer', background: '#fff' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, color: TXT, margin: '0 0 0.5rem', lineHeight: 1.3 }}>{product?.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
              {[...Array(5)].map((_, i) => (
                <IconStar key={i} size={14} color={i < 4 ? '#f59e0b' : BD} fill={i < 4 ? '#f59e0b' : 'none'} />
              ))}
            </div>

            <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, padding: '1rem 1.25rem', marginBottom: 20, display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: A }}>{Number(finalPrice).toLocaleString()} {product?.store?.currency}</span>
              {product?.priceOriginal && Number(product.priceOriginal) > Number(finalPrice) && (
                <span style={{ fontSize: '1rem', color: SUB, textDecoration: 'line-through' }}>{Number(product.priceOriginal).toLocaleString()} {product?.store?.currency}</span>
              )}
              {discount > 0 && (
                <span style={{ background: A, color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>-{discount}%</span>
              )}
            </div>

            {/* Offers */}
            {product?.offers && product.offers.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: TXT, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.offersTitle}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {product.offers.map((o: Offer) => (
                    <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${selectedOffer === o.id ? A : BD}`, borderRadius: 6, background: selectedOffer === o.id ? AL : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ accentColor: A }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: TXT }}>{o.name}</span>
                        <span style={{ fontSize: '0.8rem', color: SUB, marginInlineStart: 8 }}>×{o.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 800, color: A, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{Number(o.price).toLocaleString()} {product?.store?.currency}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs && allAttrs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                {allAttrs.map((attr: Attribute) => (
                  <div key={attr.id} style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: TXT, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{attr.name}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {attr.variants.map((v: Variant) => {
                        const isSelected = selectedVariants[attr.name] === v.value;
                        if (attr.displayMode === 'color') {
                          return (
                            <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.value}
                              style={{ width: 32, height: 32, borderRadius: '50%', background: v.value, border: `2px solid ${isSelected ? A : BD}`, cursor: 'pointer', boxShadow: isSelected ? `0 0 0 2px ${A}` : 'none' }} />
                          );
                        }
                        if (attr.displayMode === 'image') {
                          return (
                            <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                              style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', border: `2px solid ${isSelected ? A : BD}`, padding: 0, cursor: 'pointer' }}>
                              <img src={v.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                          );
                        }
                        return (
                          <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                            style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${isSelected ? A : BD}`, background: isSelected ? A : '#fff', color: isSelected ? '#fff' : TXT, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                            {v.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ProductForm */}
            <ProductForm product={product} userId={product?.store?.userId} domain={domain} store={storeprop}
              selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {/* Description */}
            {product?.desc && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: TXT, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.descTitle}</h3>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: SUB }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PRODUCT FORM                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function ProductForm({ product, userId, domain, store: storeprop, selectedOffer, setSelectedOffer, selectedVariants, platform }: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const router = useRouter();

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office'
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  /* Fetch wilayas */
  useEffect(() => {
    if (userId) fetchWilayas(userId).then(setWilayas);
  }, [userId]);

  /* Fetch communes */
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  /* Resolve selected wilaya — ALWAYS use String() */
  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  /* getLiv — ALWAYS wrap in Number() */
  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  /* getFP */
  const getFP = useCallback((): number => {
    if (selectedOffer) {
      const offer = product?.offers?.find((o: Offer) => o.id === selectedOffer);
      if (offer) return Number(offer.price);
    }
    if (product?.variantDetails && selectedVariants && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find((d: VariantDetail) => variantMatches(d, selectedVariants));
      if (match && match.price !== -1) return Number(match.price);
    }
    return Number(product?.price || 0);
  }, [selectedOffer, product, selectedVariants]);

  const getVarId = useCallback((): string | number | null => {
    if (!product?.variantDetails || !selectedVariants) return null;
    const match = product.variantDetails.find((d: VariantDetail) => variantMatches(d, selectedVariants));
    return match ? match.id : null;
  }, [product, selectedVariants]);

  const total = () => getFP() * fd.quantity + getLiv();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) errs.name = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone || '')) errs.phone = t.errPhone;
    if (!fd.customerWelaya) errs.wilaya = t.errWilaya;
    if (!fd.customerCommune) errs.commune = t.errCommune;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addToCart = () => {
    const fp = getFP();
    const payload = {
      ...fd,
      product,
      variantDetailId: getVarId(),
      productId: product?.id,
      storeId: product?.store?.id,
      userId,
      selectedOffer,
      selectedVariants,
      platform,
      finalPrice: fp,
      totalPrice: fp * fd.quantity,
      priceLivraison: 0,
      addedAt: new Date().toISOString(),
    };
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(payload);
      localStorage.setItem(domain, JSON.stringify(arr));
      const cartStore = useCartStore.getState();
      if (cartStore?.initCount) cartStore.initCount(arr.length);
    } catch { /* noop */ }
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fp = getFP();
      const payload = {
        ...fd,
        product,
        variantDetailId: getVarId(),
        productId: product?.id,
        storeId: product?.store?.id,
        userId,
        selectedOffer,
        selectedVariants,
        platform,
        finalPrice: fp,
        totalPrice: total(),
        priceLivraison: getLiv(),
      };
      await axios.post(`${API_URL}/orders/create`, payload);
      setSuccess(true);
      try { localStorage.setItem('customerId', fd.customerId || ''); } catch { /* noop */ }
    } catch {
      setErrors({ submit: t.errSubmit });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: AL, border: `1px solid ${A}`, borderRadius: 10, padding: '2rem', textAlign: 'center', animation: 'scaleIn 0.4s ease' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: A, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem' }}>✓</div>
        <h3 style={{ margin: '0 0 0.5rem', color: TXT }}>{t.successTitle}</h3>
        <p style={{ color: SUB, margin: '0 0 1.5rem' }}>{t.successDesc}</p>
        <Link href="/" style={{ background: A, color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 4, textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>{t.backToShop}</Link>
      </div>
    );
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', border: `1px solid ${BD}`,
    borderRadius: 6, background: '#fff', color: TXT, outline: 'none', appearance: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit',
  };

  return (
    <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 10, padding: '1.25rem' }}>
      {/* Quantity */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BD}` }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.qty}</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BD}`, borderRadius: 6, overflow: 'hidden' }}>
          <button onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, border: 'none', cursor: 'pointer' }}>
            <IconMinus size={14} color={TXT} />
          </button>
          <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{fd.quantity}</span>
          <button onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, border: 'none', cursor: 'pointer' }}>
            <IconPlus size={14} color={TXT} />
          </button>
        </div>
      </div>

      {/* Buttons */}
      {!isOrderNow ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {store?.cart !== false && (
            <button onClick={addToCart} style={{ flex: 1, minHeight: 44, background: '#fff', color: A, border: `1px solid ${A}`, borderRadius: 6, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = AL; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
              {t.addToCart}
            </button>
          )}
          <button onClick={() => setIsOrderNow(true)} style={{ flex: 1, minHeight: 44, background: A, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = AD; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = A; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {t.orderNow}
          </button>
        </div>
      ) : (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          {/* Name + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: TXT }}>{t.fullName}</label>
              <input value={fd.customerName} onChange={e => setFd(p => ({ ...p, customerName: e.target.value }))} placeholder={t.fullNamePlaceholder}
                style={{ ...inputBase, borderColor: errors.name ? ERR : BD }} />
              {errors.name && <p style={{ fontSize: '0.75rem', color: ERR, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><IconAlert size={11} color={ERR} /> {errors.name}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: TXT }}>{t.phone}</label>
              <input value={fd.customerPhone} onChange={e => setFd(p => ({ ...p, customerPhone: e.target.value }))} placeholder={t.phonePlaceholder}
                style={{ ...inputBase, borderColor: errors.phone ? ERR : BD }} />
              {errors.phone && <p style={{ fontSize: '0.75rem', color: ERR, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><IconAlert size={11} color={ERR} /> {errors.phone}</p>}
            </div>
          </div>

          {/* Wilaya + Commune */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: TXT }}>{t.wilaya}</label>
              <div style={{ position: 'relative' }}>
                <select value={fd.customerWelaya} onChange={e => setFd(p => ({ ...p, customerWelaya: e.target.value, customerCommune: '' }))}
                  disabled={wilayas.length === 0}
                  style={{ ...inputBase, paddingInlineEnd: 36, borderColor: errors.wilaya ? ERR : BD }}>
                  <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                  {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
                </select>
                <IconChevronDown size={12} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
              </div>
              {errors.wilaya && <p style={{ fontSize: '0.75rem', color: ERR, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><IconAlert size={11} color={ERR} /> {errors.wilaya}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: TXT }}>{t.commune}</label>
              <div style={{ position: 'relative' }}>
                <select value={fd.customerCommune} onChange={e => setFd(p => ({ ...p, customerCommune: e.target.value }))}
                  disabled={!fd.customerWelaya || loadingC}
                  style={{ ...inputBase, paddingInlineEnd: 36, borderColor: errors.commune ? ERR : BD }}>
                  <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                  {communes.map(c => <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>)}
                </select>
                <IconChevronDown size={12} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
              </div>
              {errors.commune && <p style={{ fontSize: '0.75rem', color: ERR, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><IconAlert size={11} color={ERR} /> {errors.commune}</p>}
            </div>
          </div>

          {/* Delivery type */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: TXT }}>{t.delivery}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => setFd(p => ({ ...p, typeLivraison: 'home' }))}
                style={{ padding: '10px', borderRadius: 6, border: `1px solid ${fd.typeLivraison === 'home' ? A : BD}`, background: fd.typeLivraison === 'home' ? AL : '#fff', color: fd.typeLivraison === 'home' ? A : TXT, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {t.deliveryHome}
              </button>
              <button onClick={() => setFd(p => ({ ...p, typeLivraison: 'office' }))}
                style={{ padding: '10px', borderRadius: 6, border: `1px solid ${fd.typeLivraison === 'office' ? A : BD}`, background: fd.typeLivraison === 'office' ? AL : '#fff', color: fd.typeLivraison === 'office' ? A : TXT, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {t.deliveryOffice}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: BG, borderRadius: 8, padding: '1rem', marginBottom: 16 }}>
            {[
              { l: t.price, v: `${getFP().toLocaleString()} ${store?.currency}` },
              { l: t.qty, v: `× ${fd.quantity}` },
              { l: t.delivery, v: selW ? `${getLiv().toLocaleString()} ${store?.currency}` : '—' },
            ].map(row => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${BD}` }}>
                <span style={{ fontSize: '0.85rem', color: SUB, flexShrink: 0 }}>{row.l}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: TXT, whiteSpace: 'nowrap' }}>{row.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: TXT }}>{t.total}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: A, whiteSpace: 'nowrap' }}>{total().toLocaleString()} {store?.currency}</span>
            </div>
          </div>

          {errors.submit && <p style={{ fontSize: '0.8rem', color: ERR, marginBottom: 10, textAlign: 'center' }}>{errors.submit}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submitOrder} disabled={submitting} style={{ flex: 1, minHeight: 44, background: A, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: submitting ? 0.65 : 1, transition: 'all 0.2s' }}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            <button onClick={() => setIsOrderNow(false)} disabled={submitting} style={{ flex: 1, minHeight: 44, background: '#fff', color: SUB, border: `1px solid ${BD}`, borderRadius: 6, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: submitting ? 0.65 : 1, transition: 'all 0.2s' }}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CART                                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const [items, setItems] = useState<any[]>([]);
  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office'
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      if (raw) setItems(JSON.parse(raw));
    } catch { setItems([]); }
  }, [domain]);

  useEffect(() => {
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const cartTotal = items.reduce((sum, it) => sum + (Number(it.finalPrice || it.product?.price || 0) * (it.quantity || 1)), 0);
  const finalTotal = cartTotal + getLiv();

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    try { localStorage.setItem(domain, JSON.stringify(next)); initCount(next.length); } catch { /* noop */ }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) errs.name = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone || '')) errs.phone = t.errPhone;
    if (!fd.customerWelaya) errs.wilaya = t.errWilaya;
    if (!fd.customerCommune) errs.commune = t.errCommune;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const liv = getLiv();
      const payloads = items.map(it => ({
        ...fd,
        product: it.product,
        variantDetailId: it.variantDetailId,
        productId: it.product?.id,
        storeId: it.product?.store?.id,
        userId: it.product?.store?.userId,
        selectedOffer: it.selectedOffer,
        selectedVariants: it.selectedVariants,
        platform: it.platform,
        finalPrice: it.finalPrice,
        quantity: it.quantity,
        totalPrice: (Number(it.finalPrice || it.product?.price || 0) * (it.quantity || 1)) + liv,
        priceLivraison: liv,
      }));
      await Promise.all(payloads.map(p => axios.post(`${API_URL}/orders/create`, p)));
      setSuccess(true);
      try { localStorage.removeItem(domain); initCount(0); } catch { /* noop */ }
    } catch {
      setErrors({ submit: t.errSubmit });
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', border: `1px solid ${BD}`,
    borderRadius: 6, background: '#fff', color: TXT, outline: 'none', appearance: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit',
  };

  if (success) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 480, width: '100%', background: AL, border: `1px solid ${A}`, borderRadius: 10, padding: '2.5rem', textAlign: 'center', animation: 'scaleIn 0.4s ease' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: A, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.75rem' }}>✓</div>
          <h2 style={{ margin: '0 0 0.5rem', color: TXT }}>{t.successTitle}</h2>
          <p style={{ color: SUB, margin: '0 0 1.5rem' }}>{t.successDesc}</p>
          <Link href="/" style={{ background: A, color: '#fff', padding: '0.875rem 2rem', borderRadius: 6, textDecoration: 'none', fontWeight: 700, display: 'inline-block', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = AD; }}
            onMouseLeave={e => { e.currentTarget.style.background = A; }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <IconCart size={56} color={BD} />
          <h2 style={{ color: TXT, margin: '1rem 0 0.5rem' }}>{t.cartEmpty}</h2>
          <p style={{ color: SUB, margin: '0 0 1.5rem' }}>{t.cartEmptyDesc}</p>
          <Link href="/" style={{ background: A, color: '#fff', padding: '0.875rem 2rem', borderRadius: 6, textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>{t.backToShop}</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, padding: '2.5rem 0', minHeight: '60vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: TXT, margin: '0 0 1.5rem' }}>{t.myCart}</h1>
        <div className="wc-cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Items */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((it, idx) => {
                const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
                return (
                  <div key={idx} style={{ display: 'flex', gap: 14, background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, padding: '0.875rem', alignItems: 'center' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: BG }}>
                      {img ? <img src={img} alt={it.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconAnchor size={28} color={BD} /></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px', color: TXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.product?.name}</p>
                      <p style={{ fontSize: '0.8rem', color: SUB, margin: 0 }}>{t.qty}: {it.quantity || 1}</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: A, margin: '4px 0 0', whiteSpace: 'nowrap' }}>
                        {(Number(it.finalPrice || it.product?.price || 0) * (it.quantity || 1)).toLocaleString()} {store?.currency}
                      </p>
                    </div>
                    <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: SUB, transition: 'color 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = ERR; }}
                      onMouseLeave={e => { e.currentTarget.style.color = SUB; }}>
                      <IconTrash size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form + Summary */}
          <div style={{ minWidth: 0 }}>
            <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 10, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: TXT, margin: '0 0 1rem' }}>{t.confirmOrder}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: TXT }}>{t.fullName}</label>
                  <input value={fd.customerName} onChange={e => setFd(p => ({ ...p, customerName: e.target.value }))} placeholder={t.fullNamePlaceholder}
                    style={{ ...inputBase, borderColor: errors.name ? ERR : BD }} />
                  {errors.name && <p style={{ fontSize: '0.75rem', color: ERR, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><IconAlert size={11} color={ERR} /> {errors.name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: TXT }}>{t.phone}</label>
                  <input value={fd.customerPhone} onChange={e => setFd(p => ({ ...p, customerPhone: e.target.value }))} placeholder={t.phonePlaceholder}
                    style={{ ...inputBase, borderColor: errors.phone ? ERR : BD }} />
                  {errors.phone && <p style={{ fontSize: '0.75rem', color: ERR, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><IconAlert size={11} color={ERR} /> {errors.phone}</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: TXT }}>{t.wilaya}</label>
                  <div style={{ position: 'relative' }}>
                    <select value={fd.customerWelaya} onChange={e => setFd(p => ({ ...p, customerWelaya: e.target.value, customerCommune: '' }))}
                      disabled={wilayas.length === 0} style={{ ...inputBase, paddingInlineEnd: 36, borderColor: errors.wilaya ? ERR : BD }}>
                      <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                      {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
                    </select>
                    <IconChevronDown size={12} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                  </div>
                  {errors.wilaya && <p style={{ fontSize: '0.75rem', color: ERR, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><IconAlert size={11} color={ERR} /> {errors.wilaya}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: TXT }}>{t.commune}</label>
                  <div style={{ position: 'relative' }}>
                    <select value={fd.customerCommune} onChange={e => setFd(p => ({ ...p, customerCommune: e.target.value }))}
                      disabled={!fd.customerWelaya || loadingC} style={{ ...inputBase, paddingInlineEnd: 36, borderColor: errors.commune ? ERR : BD }}>
                      <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                      {communes.map(c => <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>)}
                    </select>
                    <IconChevronDown size={12} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                  </div>
                  {errors.commune && <p style={{ fontSize: '0.75rem', color: ERR, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><IconAlert size={11} color={ERR} /> {errors.commune}</p>}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: TXT }}>{t.delivery}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button onClick={() => setFd(p => ({ ...p, typeLivraison: 'home' }))}
                    style={{ padding: '10px', borderRadius: 6, border: `1px solid ${fd.typeLivraison === 'home' ? A : BD}`, background: fd.typeLivraison === 'home' ? AL : '#fff', color: fd.typeLivraison === 'home' ? A : TXT, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    {t.deliveryHome}
                  </button>
                  <button onClick={() => setFd(p => ({ ...p, typeLivraison: 'office' }))}
                    style={{ padding: '10px', borderRadius: 6, border: `1px solid ${fd.typeLivraison === 'office' ? A : BD}`, background: fd.typeLivraison === 'office' ? AL : '#fff', color: fd.typeLivraison === 'office' ? A : TXT, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    {t.deliveryOffice}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div style={{ background: BG, borderRadius: 8, padding: '1rem', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${BD}` }}>
                  <span style={{ fontSize: '0.85rem', color: SUB, flexShrink: 0 }}>{t.subtotal}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: TXT, whiteSpace: 'nowrap' }}>{cartTotal.toLocaleString()} {store?.currency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${BD}` }}>
                  <span style={{ fontSize: '0.85rem', color: SUB, flexShrink: 0 }}>{t.delivery}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: TXT, whiteSpace: 'nowrap' }}>{selW ? `${getLiv().toLocaleString()} ${store?.currency}` : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 4 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: TXT }}>{t.total}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: A, whiteSpace: 'nowrap' }}>{finalTotal.toLocaleString()} {store?.currency}</span>
                </div>
              </div>

              {errors.submit && <p style={{ fontSize: '0.8rem', color: ERR, marginBottom: 10, textAlign: 'center' }}>{errors.submit}</p>}

              <button onClick={submitOrder} disabled={submitting} style={{ width: '100%', minHeight: 44, background: A, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: submitting ? 0.65 : 1, transition: 'all 0.2s' }}>
                {submitting ? t.sending : t.confirmOrder}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  STATIC PAGES                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */
function Shell({ title, children, store }: any) {
  const t = T[getLang(store)];
  return (
    <div style={{ background: BG, minHeight: '60vh', padding: '3rem 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ background: '#0f172a', borderRadius: 10, padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, margin: 0 }}>{title}</h1>
        </div>
        <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 10, padding: '2rem', lineHeight: 1.8, color: TXT, fontSize: '0.9rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, body }: any) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: TXT, margin: '0 0 0.5rem' }}>{title}</h3>
      <p style={{ margin: 0, color: SUB }}>{body}</p>
    </div>
  );
}

export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacyTitle} store={store}>
      <InfoBlock title={t.privacyTitle} body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." />
      <InfoBlock title="1. Data Collection" body="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." />
      <InfoBlock title="2. Data Usage" body="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo." />
      <InfoBlock title="3. Your Rights" body="Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt." />
    </Shell>
  );
}

export function Terms({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.termsTitle} store={store}>
      <InfoBlock title={t.termsTitle} body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
      <InfoBlock title="1. Acceptance of Terms" body="By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement." />
      <InfoBlock title="2. Use License" body="Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only." />
      <InfoBlock title="3. Disclaimer" body="The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties." />
    </Shell>
  );
}

export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookiesTitle} store={store}>
      <InfoBlock title={t.cookiesTitle} body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
      <InfoBlock title="1. What Are Cookies" body="Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the service or a third-party to recognize you." />
      <InfoBlock title="2. How We Use Cookies" body="We use cookies for the following purposes: to enable certain functions of the service, to provide analytics, to store your preferences." />
      <InfoBlock title="3. Your Choices" body="If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser." />
    </Shell>
  );
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id });
      setSent(true);
    } catch { /* noop */ }
    setSending(false);
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', border: `1px solid ${BD}`,
    borderRadius: 6, background: '#fff', color: TXT, outline: 'none', fontFamily: 'inherit',
  };

  if (sent) {
    return (
      <div style={{ background: BG, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 480, width: '100%', background: AL, border: `1px solid ${A}`, borderRadius: 10, padding: '2.5rem', textAlign: 'center', animation: 'scaleIn 0.4s ease' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: A, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem' }}>✓</div>
          <h3 style={{ margin: '0 0 0.5rem', color: TXT }}>{t.successTitle}</h3>
          <p style={{ color: SUB, margin: '0 0 1.5rem' }}>{t.successDesc}</p>
          <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }} style={{ background: A, color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 6, border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
            {t.dir === 'rtl' ? 'إرسال رسالة أخرى' : getLang(store) === 'fr' ? 'Envoyer un autre message' : 'Send another message'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: '60vh', padding: '3rem 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="wc-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
          {/* Info */}
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, color: TXT, margin: '0 0 1rem' }}>{t.contactTitle}</h1>
            <p style={{ color: SUB, lineHeight: 1.7, margin: '0 0 1.5rem' }}>{t.dir === 'rtl' ? 'نحن هنا لمساعدتك. تواصل معنا عبر أي من القنوات التالية.' : getLang(store) === 'fr' ? "Nous sommes là pour vous aider. Contactez-nous via l'un des canaux suivants." : 'We are here to help. Reach out to us through any of the channels below.'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {store?.contact?.phone && (
                <a href={`tel:${store.contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 12, color: TXT, textDecoration: 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconPhone size={18} color={A} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: SUB, margin: 0 }}>{t.phone}</p>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{store.contact.phone}</p>
                  </div>
                </a>
              )}
              {store?.contact?.email && (
                <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 12, color: TXT, textDecoration: 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconMail size={18} color={A} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: SUB, margin: 0 }}>Email</p>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{store.contact.email}</p>
                  </div>
                </a>
              )}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: TXT }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconMapPin size={18} color={A} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: SUB, margin: 0 }}>{t.dir === 'rtl' ? 'العنوان' : 'Address'}</p>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{store.contact.wilaya} {store.contact.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 10, padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t.fullName} required style={inputBase} />
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" type="email" required style={inputBase} />
            </div>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder={t.phone} style={{ ...inputBase, marginBottom: '0.875rem' }} />
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder={t.dir === 'rtl' ? 'رسالتك...' : getLang(store) === 'fr' ? 'Votre message...' : 'Your message...'} required rows={5} style={{ ...inputBase, resize: 'none', marginBottom: '1rem' }} />
            <button type="submit" disabled={sending} style={{ width: '100%', minHeight: 44, background: A, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: sending ? 0.65 : 1 }}>
              {sending ? t.sending : (t.dir === 'rtl' ? 'إرسال الرسالة' : getLang(store) === 'fr' ? 'Envoyer' : 'Send Message')}
            </button>
          </form>
        </div>
      </div>
    </div>
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

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  THEME CSS                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
function ThemeCSS() {
  return (
    <style>{`
      /* ─── Keyframes ─── */
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.92); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-8px); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(30,90,142,0.4); }
        50%       { box-shadow: 0 0 0 10px rgba(30,90,142,0); }
      }
      @keyframes shimmer {
        0%   { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      @keyframes badgeBounce {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.4); }
        70%  { transform: scale(0.9); }
        100% { transform: scale(1); }
      }

      /* ─── Skeleton ─── */
      .skeleton {
        background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
        background-size: 400px 100%;
        animation: shimmer 1.4s infinite linear;
        border-radius: 6px;
      }

      /* ─── Reduced motion ─── */
      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
      }

      /* ─── Responsive: Navbar ─── */
      @media (max-width: 767px) {
        .wc-nav-links { display: none !important; }
        .wc-search-desktop { display: none !important; }
      }
      @media (min-width: 768px) {
        .wc-search-mobile-btn { display: none !important; }
        .wc-burger { display: none !important; }
        .wc-mobile-menu { display: none !important; }
      }

      /* ─── Responsive: Footer ─── */
      @media (min-width: 768px) {
        .wc-footer-grid { grid-template-columns: 1.2fr 1fr 1fr !important; }
      }

      /* ─── Responsive: Products ─── */
      @media (min-width: 640px) {
        .wc-products-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (min-width: 1024px) {
        .wc-products-grid { grid-template-columns: repeat(3, 1fr) !important; }
      }
      @media (min-width: 1280px) {
        .wc-products-grid { grid-template-columns: repeat(4, 1fr) !important; }
      }

      /* ─── Responsive: Trust ─── */
      @media (min-width: 640px) {
        .wc-trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (min-width: 1024px) {
        .wc-trust-grid { grid-template-columns: repeat(4, 1fr) !important; }
      }

      /* ─── Responsive: Details ─── */
      @media (min-width: 768px) {
        .wc-details-grid { grid-template-columns: 1fr 1fr !important; }
      }

      /* ─── Responsive: Cart ─── */
      @media (min-width: 1024px) {
        .wc-cart-grid { grid-template-columns: 1.2fr 1fr !important; }
      }

      /* ─── Responsive: Contact ─── */
      @media (min-width: 768px) {
        .wc-contact-grid { grid-template-columns: 1fr 1fr !important; }
      }

      /* ─── Nav link underline ─── */
      .wc-nav-link { position: relative; }
      .wc-nav-link::after {
        content: '';
        position: absolute; bottom: -4px; left: 0; right: 0;
        height: 2px; background: ${A};
        transform: scaleX(0); transform-origin: center;
        transition: transform 0.25s ease;
      }
      .wc-nav-link:hover::after { transform: scaleX(1); }

      /* ─── Form focus ─── */
      input:focus, select:focus, textarea:focus {
        border-color: ${A} !important;
        box-shadow: 0 0 0 3px rgba(30,90,142,0.12) !important;
      }
    `}</style>
  );
}
