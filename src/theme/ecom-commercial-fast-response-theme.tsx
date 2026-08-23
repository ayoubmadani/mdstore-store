'use client';

/*
 * MdStore Theme — "Hanouti COD Store"
 * A general-purpose cash-on-delivery storefront inspired by the Hanout/Hanouti WordPress theme.
 *
 * SIGNATURE FEATURE: the order form lives directly on the product page and is ALWAYS visible
 * (no "Order Now" toggle) — the whole point of a Hanouti-style store is ordering in the same page.
 * Because the form is never in a hidden/opened state, there is no orphaned form to dismiss,
 * so the isOrderNow Cancel-button rule (§15.15) does not apply here. `addToCart` never validates.
 *
 * ARCHETYPES:
 *   NAVBAR : B — Double Bar
 *   CARD   : 5 — Framed Label
 *   HERO   : full-bleed
 *   TYPO   : Cairo (display) + Almarai (body)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import { useCartStore } from '@/store/useCartStore';
import {
  Search, X, ShoppingCart, Menu, Phone, Mail, MapPin, ChevronDown,
  ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, Lock, Headphones,
  Trash2, Plus, Minus, CheckCircle, AlertCircle, Package, ArrowLeft, ArrowRight,
} from 'lucide-react';

/* ============================================================
 * 0. Design tokens
 * ========================================================== */
const A    = '#1F7A5E';   // accent (trust teal-green)
const AD   = '#155A44';   // accent dark (hover)
const AL   = '#E6F2ED';   // accent light tint
const TXT  = '#16211C';   // text
const SUB  = '#68786F';   // muted
const BD   = '#DCE6E0';   // border
const BG   = '#F6F9F7';   // page bg
const CARD = '#FFFFFF';   // surface
const SALE = '#E4572E';   // discount / urgency
const INK  = '#0F1A15';   // dark chrome

/* ============================================================
 * 1. Types
 * ========================================================== */
interface Offer { id: string; name: string; quantity: number; price: number; subTitle?: string; shippingFree?: boolean; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

interface Product {
  id: string; name: string; slug?: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; shippingFree?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}

/* ============================================================
 * 2. Helpers / fixed API
 * ========================================================== */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
};

const fmt = (n: number) => Number(n || 0).toLocaleString('fr-DZ');

/* ============================================================
 * 3-A. Trilingual T pattern
 * ========================================================== */
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
    showAll: 'عرض كل النتائج ←',
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تسوق الآن',
    codBadge: 'الدفع عند الاستلام',
    trust: [
      { t: 'توصيل سريع', s: 'لكل 58 ولاية' },
      { t: 'الدفع عند الاستلام', s: 'ادفع بعد ما تستلم' },
      { t: 'جودة مضمونة', s: 'منتجات أصلية 100%' },
      { t: 'دعم 24/7', s: 'فريق متخصص للمساعدة' },
    ],
    quickLinks: 'روابط سريعة', legalNav: 'قانوني', contactUs: 'تواصل معنا',
    privacy: 'الخصوصية', terms: 'الشروط', cookies: 'الكوكيز',
    rightsReserved: 'جميع الحقوق محفوظة',
    fullName: 'الاسم الكامل', fullNamePlaceholder: 'أدخل اسمك الكامل',
    phone: 'رقم الهاتف', phonePlaceholder: '05xxxxxxxx',
    wilaya: 'الولاية', wilayaPlaceholder: 'اختر الولاية', wilayaUnavailable: 'التوصيل غير متاح حالياً',
    commune: 'البلدية', communePlaceholder: 'اختر البلدية', communeLoading: 'جاري التحميل...',
    deliveryHome: 'توصيل للمنزل', deliveryOffice: 'مكتب التوصيل',
    qty: 'الكمية', price: 'السعر', delivery: 'التوصيل', total: 'الإجمالي',
    orderNow: 'اطلب الآن', addToCart: 'أضف إلى السلة',
    confirmOrder: 'تأكيد الطلب', sending: 'جاري الإرسال...', cancel: 'إلغاء',
    orderHere: 'اطلب مباشرة من هنا',
    successTitle: 'تم إرسال طلبك بنجاح!', successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل.',
    backToShop: 'العودة للتسوق',
    cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تتم إضافة أي منتجات بعد.',
    myCart: 'سلتي', subtotal: 'المجموع الفرعي', remove: 'حذف',
    errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
    errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'وصف المنتج',
    freeShippingBadge: '🚚 توصيل مجاني',
    freeShippingThreshold: '🚚 توصيل مجاني للطلبات بـ {{amount}} دج أو أكثر',
    freeShippingRemaining: 'أضف {{amount}} دج أخرى للحصول على توصيل مجاني',
    freeShippingReached: '🎉 حصلت على توصيل مجاني!',
    searchResultsFor: 'نتائج البحث عن:',
    inStock: 'متوفر', outStock: 'نفدت الكمية',
    sendMessage: 'إرسال الرسالة', yourMessage: 'رسالتك', anotherMsg: 'إرسال رسالة أخرى',
    msgSent: 'تم إرسال رسالتك!', msgSentDesc: 'سنرد عليك في أقرب وقت.',
    heroDefaultTitle: 'تسوّق بثقة، وادفع عند الاستلام',
    heroDefaultSub: 'منتجات مختارة بعناية، توصيل لكل الولايات، وخدمة تهتم بك.',
  },
  fr: {
    dir: 'ltr' as const,
    home: 'Accueil', contact: 'Contact', cart: 'Panier',
    search: 'Rechercher...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats →',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la boutique',
    codBadge: 'Paiement à la livraison',
    trust: [
      { t: 'Livraison Rapide', s: 'Vers 58 wilayas' },
      { t: 'Paiement à la livraison', s: 'Payez à la réception' },
      { t: 'Qualité Garantie', s: 'Produits 100% authentiques' },
      { t: 'Support 24/7', s: 'Toujours disponible' },
    ],
    quickLinks: 'Navigation', legalNav: 'Légal', contactUs: 'Contact',
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
    orderHere: 'Commandez directement ici',
    successTitle: 'Commande confirmée !', successDesc: 'Notre équipe vous contactera bientôt.',
    backToShop: 'Retour à la boutique',
    cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre sélection.',
    myCart: 'Mon Panier', subtotal: 'Sous-total', remove: 'Retirer',
    errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
    errName: 'Nom complet requis (3 caractères minimum)',
    errPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description du produit',
    freeShippingBadge: '🚚 Livraison gratuite',
    freeShippingThreshold: '🚚 Livraison gratuite dès {{amount}} DZD d\'achat',
    freeShippingRemaining: 'Ajoutez {{amount}} DZD de plus pour la livraison gratuite',
    freeShippingReached: '🎉 Livraison gratuite obtenue !',
    searchResultsFor: 'Résultats pour :',
    inStock: 'En stock', outStock: 'Rupture de stock',
    sendMessage: 'Envoyer le message', yourMessage: 'Votre message', anotherMsg: 'Envoyer un autre message',
    msgSent: 'Message envoyé !', msgSentDesc: 'Nous vous répondrons bientôt.',
    heroDefaultTitle: 'Achetez en confiance, payez à la livraison',
    heroDefaultSub: 'Des produits soigneusement sélectionnés, livrés partout en Algérie.',
  },
  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart',
    search: 'Search products...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results →',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Shop Now',
    codBadge: 'Cash on Delivery',
    trust: [
      { t: 'Fast Delivery', s: 'To all 58 wilayas' },
      { t: 'Cash on Delivery', s: 'Pay when you receive' },
      { t: 'Quality Guaranteed', s: '100% authentic products' },
      { t: '24/7 Support', s: 'Expert team always here' },
    ],
    quickLinks: 'Quick Links', legalNav: 'Legal', contactUs: 'Contact Us',
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
    orderHere: 'Order directly here',
    successTitle: 'Order placed successfully!', successDesc: 'We will contact you shortly to confirm the details.',
    backToShop: 'Back to Shop',
    cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Start shopping now.',
    myCart: 'My Cart', subtotal: 'Subtotal', remove: 'Remove',
    errSubmit: 'An error occurred. Please try again.',
    errName: 'Full name is required (at least 3 characters)',
    errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Product Description',
    freeShippingBadge: '🚚 Free Delivery',
    freeShippingThreshold: '🚚 Free Delivery on orders over {{amount}} DZD',
    freeShippingRemaining: 'Add {{amount}} DZD more for free delivery',
    freeShippingReached: '🎉 You got free delivery!',
    searchResultsFor: 'Results for:',
    inStock: 'In stock', outStock: 'Out of stock',
    sendMessage: 'Send Message', yourMessage: 'Your message', anotherMsg: 'Send another message',
    msgSent: 'Message sent!', msgSentDesc: 'We will get back to you soon.',
    heroDefaultTitle: 'Shop with confidence, pay on delivery',
    heroDefaultSub: 'Carefully selected products, delivered across all of Algeria.',
  },
} as const;

/* ============================================================
 * THEME CSS (fonts, keyframes, media queries, responsive grids)
 * ========================================================== */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Almarai:wght@400;700;800&display=swap');

:root {
  --hn-a: ${A}; --hn-ad: ${AD}; --hn-al: ${AL}; --hn-txt: ${TXT};
  --hn-sub: ${SUB}; --hn-bd: ${BD}; --hn-bg: ${BG}; --hn-card: ${CARD};
  --hn-sale: ${SALE}; --hn-ink: ${INK};
}

.hn-root, .hn-root * { box-sizing: border-box; }
.hn-root { font-family: 'Almarai', system-ui, sans-serif; color: var(--hn-txt); background: var(--hn-bg); }
.hn-display { font-family: 'Cairo', system-ui, sans-serif; }

/* Layout */
.hn-container { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }

.hn-products-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 640px)  { .hn-products-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .hn-products-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .hn-products-grid { grid-template-columns: repeat(4, 1fr); gap: 1.25rem; } }

.hn-trust-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
@media (min-width: 768px) { .hn-trust-grid { grid-template-columns: repeat(4, 1fr); gap: 1rem; } }

.hn-details-grid { display: grid; grid-template-columns: 1fr; gap: 1.75rem; }
@media (min-width: 1024px) { .hn-details-grid { grid-template-columns: 1.5fr 1fr; gap: 2.5rem; align-items: start; } }

.hn-cart-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
@media (min-width: 1024px) { .hn-cart-grid { grid-template-columns: 1.3fr 1fr; gap: 2rem; align-items: start; } }

.hn-footer-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .hn-footer-grid { grid-template-columns: 1.4fr 1fr 1fr 1fr; } }

.hn-buybox-sticky { }
@media (min-width: 1024px) { .hn-buybox-sticky { position: sticky; top: 92px; } }

/* Nav responsive */
.hn-nav-links  { display: flex; align-items: center; gap: 26px; }
.hn-nav-burger { display: none; }
.hn-search-desktop { display: block; }
.hn-search-mobile-btn { display: none; }
@media (max-width: 860px) {
  .hn-nav-links { display: none; }
  .hn-nav-burger { display: inline-flex; }
  .hn-search-desktop { display: none; }
  .hn-search-mobile-btn { display: inline-flex; }
}

.hn-topstrip-tag { display: inline; }
@media (max-width: 560px) { .hn-topstrip-tag { display: none; } }

/* Keyframes */
@keyframes hnFadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
@keyframes hnFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes hnScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
@keyframes hnFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes hnPulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(31,122,94,0.45); } 50% { box-shadow: 0 0 0 12px rgba(31,122,94,0); } }
@keyframes hnShimmer { 0% { background-position: -420px 0; } 100% { background-position: 420px 0; } }
@keyframes hnMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes hnBadgeBounce { 0% { transform: scale(1); } 40% { transform: scale(1.4); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }

/* Cards */
.hn-card { animation: hnFadeUp 0.5s ease both; transition: transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease; will-change: transform; }
.hn-card:hover { transform: translateY(-5px); box-shadow: 0 18px 38px rgba(15,26,21,0.12); }
.hn-card-imgwrap { overflow: hidden; }
.hn-card-img { transition: transform 0.55s ease; }
.hn-card:hover .hn-card-img { transform: scale(1.07); }

/* Buttons */
.hn-btn { transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease; }
.hn-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(21,90,68,0.28); }
.hn-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
.hn-btn:disabled { opacity: 0.6; cursor: default; }
.hn-btn-icon { transition: transform 0.2s ease; }
.hn-btn:hover .hn-btn-icon { transform: translateX(3px); }
.hn-pulse { animation: hnPulseGlow 2.2s infinite; }

/* Nav link underline */
.hn-navlink { position: relative; }
.hn-navlink::after { content: ''; position: absolute; bottom: -6px; left: 0; right: 0; height: 2px; background: var(--hn-a); transform: scaleX(0); transform-origin: center; transition: transform 0.25s ease; }
.hn-navlink:hover::after, .hn-navlink.hn-active::after { transform: scaleX(1); }

/* Cat pill */
.hn-cat { transition: all 0.2s ease; }

/* Skeleton */
.hn-skel { background: linear-gradient(90deg, #e7ede9 25%, #f3f7f4 50%, #e7ede9 75%); background-size: 420px 100%; animation: hnShimmer 1.4s infinite linear; border-radius: 8px; }

/* Inputs */
.hn-input { width: 100%; padding: 0.8rem 1rem; font-size: 0.92rem; border: 1px solid var(--hn-bd); border-radius: 8px; background: #fff; color: var(--hn-txt); outline: none; -webkit-appearance: none; appearance: none; transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit; }
.hn-input:focus { border-color: var(--hn-a); box-shadow: 0 0 0 3px rgba(31,122,94,0.14); }

.hn-marquee-track { display: inline-flex; white-space: nowrap; animation: hnMarquee 28s linear infinite; }
.hn-desc-desktop { display: none; }
.hn-desc-mobile  { display: block; }
@media (min-width: 1024px) { .hn-desc-desktop { display: block; } .hn-desc-mobile { display: none; } }

.hn-entry-1 { animation: hnFadeUp 0.7s ease 0.05s both; }
.hn-entry-2 { animation: hnFadeUp 0.7s ease 0.2s both; }
.hn-entry-3 { animation: hnFadeUp 0.7s ease 0.35s both; }
.hn-float { animation: hnFloat 4s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .hn-root *, .hn-root *::before, .hn-root *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`;

/* Shared style objects */
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '0.9rem 1.4rem', minHeight: 48, background: A, color: '#fff', fontWeight: 800,
  fontSize: '0.95rem', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', width: '100%',
};
const btnOutline: React.CSSProperties = {
  ...btnPrimary, background: 'transparent', color: A, border: `1.5px solid ${A}`,
};

/* ============================================================
 * Small shared pieces
 * ========================================================== */
function Stars({ n = 5, size = 13 }: { n?: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < n ? '#F5B301' : 'none'} color={i < n ? '#F5B301' : BD} />
      ))}
    </span>
  );
}

function ProductThumb({ src, name, size = 52 }: { src?: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  return src && !err ? (
    <img src={src} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, flexShrink: 0, display: 'block', background: AL }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: 8, flexShrink: 0, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Package size={Math.round(size * 0.45)} color={A} />
    </div>
  );
}

/* ============================================================
 * 4. Main — wrapper
 * ========================================================== */
export default function Main({ store, children, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    setVisible(false);
    const id = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div className="hn-root" dir={t.dir} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <main style={{ flex: 1, opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        {children}
      </main>
      <Footer store={store} />
    </div>
  );
}

/* ============================================================
 * 5. Navbar — ARCHETYPE B (Double Bar)
 * ========================================================== */
export function Navbar({ store, domain }: any) {
  // NAVBAR ARCHETYPE: B — Double Bar
  const t = T[getLang(store)];
  const router = useRouter();
  const cartEnabled = store?.cart !== false;

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [logoErr, setLogoErr] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (count > 0) { setBump(true); const id = setTimeout(() => setBump(false), 400); return () => clearTimeout(id); }
  }, [count]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setListSearch([]); return; }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery.trim())}`);
        const data = await r.json();
        setListSearch(Array.isArray(data) ? data.slice(0, 6) : (data?.products || []).slice(0, 6));
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(id);
  }, [searchQuery, domain]);

  const goSearch = (e?: any) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearch(false); setSearchFocused(false);
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const logoUrl = store?.design?.logoUrl;
  const mobileLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const Logo = () => (
    logoUrl && !logoErr ? (
      <img src={logoUrl} alt={store?.name} onError={() => setLogoErr(true)}
        style={{ height: 40, width: 'auto', objectFit: 'contain', display: 'block' }} />
    ) : (
      <span className="hn-display" style={{ fontWeight: 900, fontSize: '1.35rem', color: INK, letterSpacing: '-0.01em' }}>
        {store?.name || 'Store'}
      </span>
    )
  );

  const SearchRow = ({ p, onClick }: { p: Product; onClick: () => void }) => (
    <Link href={`/product/${p.slug || p.id}`} onClick={onClick}
      style={{ display: 'flex', gap: 12, padding: '11px 14px', borderBottom: `1px solid ${BG}`, alignItems: 'center', textDecoration: 'none', color: TXT }}>
      <ProductThumb src={p.productImage || p.imagesProduct?.[0]?.imageUrl} name={p.name} size={46} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
        <p style={{ fontSize: '0.85rem', color: A, margin: 0, fontWeight: 800 }}>{fmt(Number(p.price))} {store?.currency || 'دج'}</p>
      </div>
    </Link>
  );

  return (
    <>
      {/* ===== Green ticker (always visible) ===== */}
      <div style={{ background: A, color: '#fff', overflow: 'hidden', height: 36, display: 'flex', alignItems: 'center' }}>
        <div className="hn-marquee-track" style={{ fontSize: '0.84rem', fontWeight: 800, letterSpacing: '0.01em' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} style={{ padding: '0 48px', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <Truck size={14} style={{ flexShrink: 0 }} />
              {store?.topBar?.text || 'توصيل لجميع ولايات الجزائر'}
            </span>
          ))}
        </div>
      </div>

      {/* ===== Main bar (sticky) ===== */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 200, background: '#fff',
        borderBottom: `1px solid ${BD}`,
        boxShadow: scrolled ? '0 6px 20px rgba(15,26,21,0.08)' : 'none', transition: 'box-shadow 0.25s ease',
      }}>
        <div className="hn-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, gap: 16 }}>
          {/* burger + logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hn-nav-burger" onClick={() => setOpen(true)} aria-label="menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: INK, alignItems: 'center' }}>
              <Menu size={24} />
            </button>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}><Logo /></Link>
          </div>

          {/* desktop links */}
          <nav className="hn-nav-links">
            <Link href="/" className="hn-navlink" style={{ textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: '0.95rem' }}>{t.home}</Link>
            <Link href="/contact" className="hn-navlink" style={{ textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: '0.95rem' }}>{t.contact}</Link>
          </nav>

          {/* right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* desktop search */}
            <form onSubmit={goSearch} className="hn-search-desktop" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG, border: `1px solid ${BD}`, borderRadius: 999, padding: '0 12px' }}>
                <Search size={17} color={SUB} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder={t.search}
                  style={{ width: searchFocused ? 240 : 180, transition: 'width 0.3s ease', border: 'none', outline: 'none', background: 'transparent', padding: '9px 0', fontSize: '0.88rem', fontFamily: 'inherit', color: TXT }}
                />
              </div>
              {searchFocused && searchQuery.trim().length >= 2 && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', insetInlineEnd: 0, width: 340, background: '#fff', boxShadow: '0 14px 40px rgba(15,26,21,0.16)', borderRadius: 12, zIndex: 500, maxHeight: 380, overflowY: 'auto', border: `1px solid ${BD}` }}>
                  {loading && <p style={{ padding: '1rem', textAlign: 'center', color: SUB, fontSize: '0.85rem' }}>{t.searching}</p>}
                  {!loading && listSearch.length === 0 && <p style={{ padding: '1rem', textAlign: 'center', color: SUB, fontSize: '0.85rem' }}>{t.noResults}</p>}
                  {listSearch.map((p) => <SearchRow key={p.id} p={p} onClick={() => { setSearchFocused(false); setSearchQuery(''); }} />)}
                  {listSearch.length > 0 && (
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); goSearch(); }}
                      style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 800, color: A, background: BG, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {t.showAll}
                    </button>
                  )}
                </div>
              )}
            </form>

            {/* mobile search icon */}
            <button className="hn-search-mobile-btn" onClick={() => setShowSearch(true)} aria-label={t.search}
              style={{ background: BG, border: `1px solid ${BD}`, borderRadius: 999, width: 42, height: 42, cursor: 'pointer', color: INK, alignItems: 'center', justifyContent: 'center' }}>
              <Search size={19} />
            </button>

            {/* cart */}
            {cartEnabled && (
              <Link href="/cart" aria-label={t.cart}
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: AL, borderRadius: 999, color: A, textDecoration: 'none' }}>
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span style={{ position: 'absolute', top: -4, insetInlineEnd: -4, minWidth: 20, height: 20, padding: '0 5px', background: SALE, color: '#fff', borderRadius: 999, fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: bump ? 'hnBadgeBounce 0.4s ease' : 'none' }}>
                    {count}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ===== Mobile drawer (page links only, NO cart) ===== */}
      {open && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,26,21,0.5)', backdropFilter: 'blur(3px)' }}>
          <div style={{ position: 'absolute', top: 0, insetInlineStart: 0, height: '100%', width: 'min(80%, 320px)', background: '#fff', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 6, boxShadow: '0 0 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="close" style={{ background: BG, border: 'none', borderRadius: 8, width: 38, height: 38, cursor: 'pointer', color: INK }}><X size={20} /></button>
            </div>
            {mobileLinks.map((lnk) => (
              <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)}
                style={{ padding: '13px 12px', borderRadius: 10, textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: '1rem', background: BG }}>
                {lnk.l}
              </Link>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${BD}`, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: SUB }}>
              {store?.contact?.phone && <a href={`tel:${store.contact.phone}`} style={{ color: SUB, textDecoration: 'none', display: 'flex', gap: 8, alignItems: 'center' }}><Phone size={14} color={A} /> {store.contact.phone}</a>}
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><ShieldCheck size={14} color={A} /> {t.codBadge}</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== Mobile search overlay ===== */}
      {showSearch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(15,26,21,0.6)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={20} color={SUB} />
            <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') goSearch(); }}
              placeholder={t.search}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', fontFamily: 'inherit', color: TXT, background: 'transparent' }} />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK }}><X size={22} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: '#fff', marginTop: 1 }}>
            {loading && <p style={{ padding: '1rem', textAlign: 'center', color: SUB }}>{t.searching}</p>}
            {listSearch.map((p) => <SearchRow key={p.id} p={p} onClick={() => setShowSearch(false)} />)}
            {listSearch.length > 0 && (
              <button onClick={() => goSearch()}
                style={{ display: 'block', width: '100%', padding: '15px', textAlign: 'center', background: BG, fontWeight: 800, color: A, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t.showAll}
              </button>
            )}
            {searchQuery.trim().length >= 2 && !loading && listSearch.length === 0 && (
              <p style={{ padding: '2rem', textAlign: 'center', color: SUB }}>{t.noResults}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
 * 6. Footer
 * ========================================================== */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const cartEnabled = store?.cart !== false;
  const year = new Date().getFullYear();

  const links = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contact },
  ].filter((lnk) => lnk.h !== '/cart' || cartEnabled);

  return (
    <footer style={{ background: INK, color: '#fff', marginTop: 48 }}>
      <div className="hn-container" style={{ padding: '3rem 1.5rem 1.5rem' }}>
        <div className="hn-footer-grid">
          {/* brand */}
          <div>
            <p className="hn-display" style={{ fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>{store?.name || 'Store'}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.7, margin: '0.75rem 0 0', maxWidth: 360 }}>
              {store?.hero?.subtitle || t.heroDefaultSub}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, background: 'rgba(127,227,192,0.12)', color: '#7FE3C0', padding: '7px 14px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 800 }}>
              <ShieldCheck size={15} /> {t.codBadge}
            </div>
          </div>

          {/* quick links */}
          <div>
            <h4 className="hn-display" style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem' }}>{t.quickLinks}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((lnk) => (
                <Link key={lnk.h} href={lnk.h} style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontSize: '0.9rem' }}>{lnk.l}</Link>
              ))}
            </div>
          </div>

          {/* contact */}
          
          {/* قانوني */}
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>{t.legalNav}</p>
            {[{ h: '/Privacy', l: t.privacy }, { h: '/Terms', l: t.terms }, { h: '/cookies', l: t.cookies }].map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: 'inherit', marginBottom: '0.5rem', opacity: 0.6, transition: 'opacity 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.6')}>
              {lnk.l}
            </Link>
            ))}
          </div>
<div>
            <h4 className="hn-display" style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem' }}>{t.contactUs}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem', color: 'rgba(255,255,255,0.72)' }}>
              {store?.contact?.phone && <a href={`tel:${store.contact.phone}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}><Phone size={16} color="#7FE3C0" /> {store.contact.phone}</a>}
              {store?.contact?.email && <a href={`mailto:${store.contact.email}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}><Mail size={16} color="#7FE3C0" /> {store.contact.email}</a>}
              {(store?.contact?.wilaya || store?.contact?.address) && <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><MapPin size={16} color="#7FE3C0" /> {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' — ')}</span>}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: 32, paddingTop: 20, textAlign: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
          © {year} {store?.name || 'Store'}. {t.rightsReserved}
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
 * 7. Card — ARCHETYPE 5 (Framed Label)
 * ========================================================== */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  // CARD ARCHETYPE: 5 — Framed Label
  const t = T[getLang(store)];
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;
  const price = Number(product.price);
  const original = Number(product.priceOriginal || 0);
  const currency = store?.currency || 'دج';
  const eyebrow = product.category?.name || product.store?.name || store?.name || '';

  return (
    <Link href={`/product/${product.slug || product.id}`} className="hn-card"
      style={{ textDecoration: 'none', color: TXT, background: CARD, border: `1.5px solid ${BD}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* eyebrow */}
      <div style={{ background: AL, color: A, padding: '5px 12px', fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eyebrow}</span>
        {discount > 0 && <span style={{ background: SALE, color: '#fff', padding: '1px 7px', borderRadius: 4 }}>-{discount}%</span>}
      </div>

      {/* image */}
      <div className="hn-card-imgwrap" style={{ aspectRatio: '1/1', background: BG, position: 'relative' }}>
        {img && !imgErr ? (
          <img src={img} alt={product.name} onError={() => setImgErr(true)} className="hn-card-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={44} color={BD} />
          </div>
        )}
        {product.shippingFree && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: INK, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
            🚚
          </span>
        )}
      </div>

      {/* body */}
      <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <p style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.5em' }}>
          {product.name}
        </p>
        <Stars n={5} size={12} />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginTop: 'auto' }}>
          <span className="hn-display" style={{ fontWeight: 900, color: A, fontSize: '1.05rem', whiteSpace: 'nowrap' }}>{fmt(price)} {currency}</span>
          {original > price && <span style={{ fontSize: '0.8rem', color: SUB, textDecoration: 'line-through', whiteSpace: 'nowrap' }}>{fmt(original)}</span>}
        </div>
        <span className="hn-btn" style={{ ...btnPrimary, minHeight: 40, fontSize: '0.85rem', padding: '0.55rem', borderRadius: 8 }}>
          {t.orderNow} <ArrowLeft className="hn-btn-icon" size={16} style={{ transform: t.dir === 'ltr' ? 'scaleX(-1)' : 'none' }} />
        </span>
      </div>
    </Link>
  );
}

/* ============================================================
 * 8. Home
 * ========================================================== */
export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const searchTerm = searchParams.get('search');
  const cartEnabled = store?.cart !== false;

  const products: Product[] = store?.products || [];
  const cats = store?.categories || [];
  const currency = store?.currency || 'دج';
  const PER = 48;
  const currentPage = Number(page) || 1;
  const countPage = Math.ceil((store?.count || products.length) / PER) || 1;

  const heroImg = store?.hero?.imageUrl;
  const heroTitle = store?.hero?.title;
  const heroSub = store?.hero?.subtitle;

  const trustIcons = [Truck, ShieldCheck, CheckIcon, Headphones];

  return (
    <div>
      {/* ===== HERO (full-bleed) ===== */}
      <section style={{ position: 'relative', minHeight: 'clamp(420px, 62vh, 640px)', display: 'flex', alignItems: 'center', overflow: 'hidden', background: INK }}>
        {heroImg && (
          <>
            <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${t.dir === 'rtl' ? '270deg' : '90deg'}, rgba(15,26,21,0.92) 0%, rgba(15,26,21,0.72) 45%, rgba(15,26,21,0.35) 100%)` }} />
          </>
        )}
        {!heroImg && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${INK} 0%, ${AD} 100%)` }} className="hn-float" />}

        <div className="hn-container" dir={t.dir} style={{ position: 'relative', zIndex: 2, padding: '3rem 1.5rem', width: '100%' }}>
          <span className="hn-entry-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(127,227,192,0.16)', color: '#7FE3C0', padding: '7px 16px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 800, marginBottom: 20 }}>
            <ShieldCheck size={15} /> {t.codBadge}
          </span>
          {heroTitle ? (
            <h1 dir={t.dir} className="hn-display hn-entry-2" style={{ color: '#fff', fontSize: 'clamp(1.9rem, 5vw, 3.4rem)', fontWeight: 900, lineHeight: 1.15, margin: 0, textAlign: 'start' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(heroTitle) }} />
          ) : (
            <h1 dir={t.dir} className="hn-display hn-entry-2" style={{ color: '#fff', fontSize: 'clamp(1.9rem, 5vw, 3.4rem)', fontWeight: 900, lineHeight: 1.15, margin: 0, textAlign: 'start' }}>
              {t.heroDefaultTitle}
            </h1>
          )}
          <p dir={t.dir} className="hn-entry-2" style={{ color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(0.98rem, 2vw, 1.2rem)', lineHeight: 1.7, margin: '1.1rem 0 0', textAlign: 'start' }}>
            {heroSub || t.heroDefaultSub}
          </p>
          <div className="hn-entry-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
            <a href="#products" className="hn-btn hn-pulse" style={{ ...btnPrimary, width: 'auto', padding: '0.95rem 2rem' }}>
              {t.shopNow} <ArrowLeft className="hn-btn-icon" size={18} style={{ transform: t.dir === 'ltr' ? 'scaleX(-1)' : 'none' }} />
            </a>
            {cartEnabled && (
              <Link href="/cart" className="hn-btn" style={{ ...btnOutline, width: 'auto', padding: '0.95rem 2rem', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
                <ShoppingCart size={18} /> {t.cart}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section style={{ background: '#fff', borderBottom: `1px solid ${BD}` }}>
        <div className="hn-container" style={{ padding: '1.5rem' }}>
          <div className="hn-trust-grid">
            {t.trust.map((item, i) => {
              const Ico = trustIcons[i] || ShieldCheck;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: AL, color: A, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ico size={22} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem' }}>{item.t}</p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: SUB }}>{item.s}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="hn-container" id="products" style={{ padding: '2.5rem 1.5rem' }}>
        {/* search results banner */}
        {searchTerm && (
          <p style={{ fontSize: '0.95rem', color: SUB, marginBottom: 18 }}>{t.searchResultsFor} <b style={{ color: TXT }}>{searchTerm}</b></p>
        )}

        {/* ===== CATEGORIES (URL links only) ===== */}
        {cats.length > 0 && (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 24 }}>
            <Link href="/" className="hn-cat"
              style={{ padding: '9px 20px', borderRadius: 999, whiteSpace: 'nowrap', textDecoration: 'none', fontWeight: 800, fontSize: '0.88rem',
                background: !activeCategory ? A : '#fff', color: !activeCategory ? '#fff' : TXT, border: `1.5px solid ${!activeCategory ? A : BD}` }}>
              {t.all}
            </Link>
            {cats.map((cat: any) => {
              const on = activeCategory === String(cat.id);
              return (
                <Link key={cat.id} href={`?category=${cat.id}`} className="hn-cat"
                  style={{ padding: '9px 20px', borderRadius: 999, whiteSpace: 'nowrap', textDecoration: 'none', fontWeight: 800, fontSize: '0.88rem',
                    background: on ? A : '#fff', color: on ? '#fff' : TXT, border: `1.5px solid ${on ? A : BD}` }}>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* ===== PRODUCTS GRID ===== */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: SUB }}>
            <Package size={48} color={BD} style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1rem' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="hn-products-grid">
            {products.map((p, i) => {
              const price = Number(p.price);
              const original = Number(p.priceOriginal || 0);
              const discount = original > price ? Math.round(((original - price) / original) * 100) : 0;
              return (
                <div key={p.id} style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}>
                  <Card product={p} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={discount} store={store} />
                </div>
              );
            })}
          </div>
        )}

        {/* ===== PAGINATION ===== */}
        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40, flexWrap: 'wrap' }}>
            {Array.from({ length: countPage }).map((_, i) => {
              const pg = i + 1;
              const on = pg === currentPage;
              return (
                <Link key={pg} href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), ...(searchTerm ? { search: searchTerm } : {}), page: pg } }} scroll={false}
                  style={{ minWidth: 42, height: 42, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem',
                    background: on ? A : '#fff', color: on ? '#fff' : TXT, border: `1.5px solid ${on ? A : BD}` }}>
                  {pg}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// local icon alias (CheckCircle used in trust bar slot 3)
function CheckIcon(props: any) { return <CheckCircle {...props} />; }

/* ============================================================
 * 9. Details — Hanouti buy box (order form always visible)
 * ========================================================== */
export function Details({ product, store: storeprop, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const currency = store?.currency || 'دج';

  const images: string[] = (allImages && allImages.length ? allImages : [])
    .concat(product?.productImage ? [product.productImage] : [])
    .concat((product?.imagesProduct || []).map((im: any) => im.imageUrl))
    .filter(Boolean);
  const uniqueImages = Array.from(new Set(images));
  const [sel, setSel] = useState(0);
  const [mainErr, setMainErr] = useState(false);

  const price = Number(finalPrice ?? product?.price ?? 0);
  const original = Number(product?.priceOriginal || 0);
  const mainImg = uniqueImages[sel];

  return (
    <div className="hn-container" style={{ padding: '2rem 1.5rem 3rem' }}>
      {/* breadcrumb */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: SUB, textDecoration: 'none', fontSize: '0.85rem', marginBottom: 20, fontWeight: 700 }}>
        {t.dir === 'rtl' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {t.backToShop}
      </Link>

      <div className="hn-details-grid">
        {/* ===== LEFT: gallery + description ===== */}
        <div>
          <div style={{ background: '#fff', border: `1.5px solid ${BD}`, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
            <div style={{ aspectRatio: '1/1', background: BG, position: 'relative' }}>
              {mainImg && !mainErr ? (
                <img src={mainImg} alt={product?.name} onError={() => setMainErr(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={64} color={BD} /></div>
              )}
              {discount > 0 && (
                <span style={{ position: 'absolute', top: 14, insetInlineStart: 14, background: SALE, color: '#fff', padding: '5px 12px', borderRadius: 8, fontWeight: 900, fontSize: '0.85rem' }}>-{discount}%</span>
              )}
              {uniqueImages.length > 1 && (
                <>
                  <button onClick={() => { setSel((s) => (s - 1 + uniqueImages.length) % uniqueImages.length); setMainErr(false); }}
                    style={navArrow('start')}>{t.dir === 'rtl' ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}</button>
                  <button onClick={() => { setSel((s) => (s + 1) % uniqueImages.length); setMainErr(false); }}
                    style={navArrow('end')}>{t.dir === 'rtl' ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}</button>
                </>
              )}
            </div>
          </div>

          {/* thumbnails */}
          {uniqueImages.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {uniqueImages.map((im, i) => (
                <button key={i} onClick={() => { setSel(i); setMainErr(false); }}
                  style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', padding: 0, background: BG, border: `2px solid ${i === sel ? A : BD}` }}>
                  <img src={im} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}

          {/* description (desktop only) */}
          {product?.desc && (
            <div className="hn-desc-desktop" style={{ marginTop: 28, background: '#fff', border: `1.5px solid ${BD}`, borderRadius: 16, padding: '1.5rem' }}>
              <h3 className="hn-display" style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1rem', paddingBottom: 10, borderBottom: `2px solid ${AL}` }}>{t.descTitle}</h3>
              <div style={{ color: '#3a463f', lineHeight: 1.85, fontSize: '0.95rem' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>

        {/* ===== RIGHT: buy box ===== */}
        <div className="hn-buybox-sticky">
          <div style={{ background: '#fff', border: `1.5px solid ${BD}`, borderRadius: 16, padding: '1.5rem', boxShadow: '0 10px 30px rgba(15,26,21,0.06)' }}>
            <h1 className="hn-display" style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, lineHeight: 1.3 }}>{product?.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <Stars n={5} size={15} />
              <span style={{ fontSize: '0.82rem', color: (product?.stock ?? 1) > 0 ? A : SALE, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={14} /> {(product?.stock ?? 1) > 0 ? t.inStock : t.outStock}
              </span>
            </div>

            {/* price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '16px 0', padding: '14px 0', borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}` }}>
              <span className="hn-display" style={{ fontSize: '2rem', fontWeight: 900, color: A }}>{fmt(price)} {currency}</span>
              {original > price && <span style={{ fontSize: '1.05rem', color: SUB, textDecoration: 'line-through' }}>{fmt(original)}</span>}
            </div>

            {(product?.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: A, margin: '0 0 16px' }}>
                {product?.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', String(store.freeShippingMinAmount))}
              </p>
            )}

            {/* offers */}
            {product?.offers && product.offers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 8px', color: SUB }}>{t.offersTitle}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {product.offers.map((offer: Offer) => {
                    const on = selectedOffer === offer.id;
                    return (
                      <button key={offer.id} onClick={() => setSelectedOffer(on ? null : offer.id)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'start', fontFamily: 'inherit',
                          background: on ? AL : '#fff', border: `1.5px solid ${on ? A : BD}` }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${on ? A : BD}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {on && <span style={{ width: 9, height: 9, borderRadius: 999, background: A }} />}
                          </span>
                          <span>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block' }}>{offer.name}</span>
                            {offer.subTitle && <span style={{ fontSize: '0.78rem', color: SUB, display: 'block' }}>{offer.subTitle}</span>}
                            {offer.shippingFree && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: A, display: 'block' }}>{t.freeShippingBadge}</span>}
                          </span>
                        </span>
                        <span className="hn-display" style={{ fontWeight: 900, color: A }}>{fmt(offer.price)} {currency}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* attributes */}
            {allAttrs && allAttrs.length > 0 && (
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {allAttrs.map((attr: Attribute) => (
                  <div key={attr.id}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 8px', color: SUB }}>{attr.name}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {attr.variants.map((v) => {
                        const on = selectedVariants?.[attr.name] === v.value;
                        const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                          Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                            ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                          )
                        );
                        if (attr.displayMode === 'color') {
                          return (
                            <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.name}
                              style={{ width: 34, height: 34, borderRadius: 999, cursor: available ? 'pointer' : 'not-allowed', background: v.value, border: `2px solid ${on ? A : BD}`, boxShadow: on ? `0 0 0 2px #fff, 0 0 0 4px ${A}` : 'none', opacity: available ? 1 : 0.35 }} />
                          );
                        }
                        if (attr.displayMode === 'image') {
                          return (
                            <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.name}
                              style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', cursor: available ? 'pointer' : 'not-allowed', padding: 0, background: BG, border: `2px solid ${on ? A : BD}`, opacity: available ? 1 : 0.35 }}>
                              <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                          );
                        }
                        return (
                          <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)}
                            style={{ padding: '8px 16px', borderRadius: 8, cursor: available ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.85rem',
                              background: on ? A : '#fff', color: on ? '#fff' : (available ? TXT : '#bbb'), border: `1.5px solid ${on ? A : BD}`,
                              textDecoration: available ? 'none' : 'line-through' }}>
                            {v.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== ORDER FORM (always visible — Hanouti signature) ===== */}
            <div style={{ background: AL, borderRadius: 12, padding: '14px 14px 4px', marginTop: 4 }}>
              <p className="hn-display" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: '1rem', margin: '0 0 12px', color: AD }}>
                <Truck size={18} /> {t.orderHere}
              </p>
              <ProductForm
                product={product}
                store={store}
                userId={store?.user?.id || product?.store?.userId}
                domain={domain}
                selectedOffer={selectedOffer}
                setSelectedOffer={setSelectedOffer}
                selectedVariants={selectedVariants}
                platform="web"
              />
            </div>
          </div>

          {/* description (mobile only — below form) */}
          {product?.desc && (
            <div className="hn-desc-mobile" style={{ marginTop: 20, background: '#fff', border: `1.5px solid ${BD}`, borderRadius: 16, padding: '1.5rem' }}>
              <h3 className="hn-display" style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1rem', paddingBottom: 10, borderBottom: `2px solid ${AL}` }}>{t.descTitle}</h3>
              <div style={{ color: '#3a463f', lineHeight: 1.85, fontSize: '0.95rem' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function navArrow(side: 'start' | 'end'): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: 10,
    width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.92)',
    border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: TXT, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  } as React.CSSProperties;
}

/* ============================================================
 * 10. ProductForm — order + add-to-cart
 * ========================================================== */
export function ProductForm({ product, store: storeprop, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const router = useRouter();
  const currency = store?.currency || 'دج';
  const cartEnabled = store?.cart !== false;

  const initCount = useCartStore((s: any) => s.initCount);

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState('');

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getFP = (): number => {
    if (selectedOffer) {
      const o = product?.offers?.find((of: Offer) => of.id === selectedOffer);
      if (o) return Number(o.price);
    }
    if (selectedVariants && Object.keys(selectedVariants).length && product?.variantDetails?.length) {
      const d = product.variantDetails.find((vd: VariantDetail) => variantMatches(vd, selectedVariants));
      if (d && Number(d.price) !== -1) return Number(d.price);
    }
    return Number(product?.price || 0);
  };

  const getVarId = (): string | number | null => {
    if (!selectedVariants || !product?.variantDetails?.length) return null;
    const d = product.variantDetails.find((vd: VariantDetail) => variantMatches(vd, selectedVariants));
    return d?.id ?? null;
  };

  const supportQty = (store?.supportQty ?? product?.store?.supportQty) !== false;
  const fp = getFP();
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = product?.offers?.find((o: Offer) => o.id === selectedOffer);
  const orderFreeShipping = !!(product?.shippingFree || selOfferObj?.shippingFree ||
    (store?.supportFreeShipping && store?.freeShippingMinAmount != null && (fp * qty) >= Number(store.freeShippingMinAmount)));
  const getLiv = useCallback((): number => {
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping]);

  const total = () => fp * qty + getLiv();

  const set = (k: string, v: any) => setFd((p) => ({ ...p, [k]: v }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    ...fd,
    quantity: qty,
    product,
    productId: product?.id,
    storeId: store?.id,
    userId,
    selectedOffer,
    selectedVariants,
    variantDetailId: getVarId(),
    platform: platform || 'web',
    finalPrice: fp,
    totalPrice: total(),
    priceLivraison: getLiv(),
  });

  const addToCart = () => {
    // No validate() here — shipping fields are collected at checkout (§15.14).
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      arr.push({ ...buildPayload(), addedAt: Date.now() });
      localStorage.setItem(domain, JSON.stringify(arr));
      initCount(arr.length);
      setFlash(t.addToCart + ' ✓');
      setTimeout(() => setFlash(''), 2000);
    } catch { /* ignore */ }
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
      const data = await res.json().catch(() => ({}));
      if (data?.customerId) { try { localStorage.setItem('customerId', data.customerId); } catch {} }
      setSuccess(true);
      setTimeout(() => router.push(`/successfully?productId=${product?.id}`), 900);
    } catch {
      setErrors({ submit: t.errSubmit });
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem 1rem 2rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: AL, color: A, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle size={36} />
        </div>
        <p className="hn-display" style={{ fontWeight: 900, fontSize: '1.1rem', margin: 0 }}>{t.successTitle}</p>
        <p style={{ color: SUB, fontSize: '0.9rem', margin: '6px 0 0' }}>{t.successDesc}</p>
      </div>
    );
  }

  const wilayaEmpty = wilayas.length === 0;

  return (
    <div style={{ paddingBottom: 12 }}>
      {/* qty */}
      {supportQty && (
        <>
          <label style={fieldLabel}>{t.qty}</label>
          <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BD}`, borderRadius: 8, overflow: 'hidden', background: '#fff', marginBottom: 12 }}>
            <button onClick={() => set('quantity', Math.max(1, fd.quantity - 1))} style={qtyBtn}><Minus size={16} /></button>
            <span style={{ width: 46, textAlign: 'center', fontWeight: 800 }}>{fd.quantity}</span>
            <button onClick={() => set('quantity', fd.quantity + 1)} style={qtyBtn}><Plus size={16} /></button>
          </div>
        </>
      )}

      {/* name */}
      <label style={fieldLabel}>{t.fullName}</label>
      <input className="hn-input" value={fd.customerName} onChange={(e) => set('customerName', e.target.value)}
        placeholder={t.fullNamePlaceholder} style={errors.customerName ? inputErr : undefined} />
      <FieldErr msg={errors.customerName} />

      {/* phone */}
      <label style={fieldLabel}>{t.phone}</label>
      <input className="hn-input" value={fd.customerPhone} onChange={(e) => set('customerPhone', e.target.value)}
        placeholder={t.phonePlaceholder} inputMode="tel" style={errors.customerPhone ? inputErr : undefined} />
      <FieldErr msg={errors.customerPhone} />

      {/* wilaya */}
      <label style={fieldLabel}>{t.wilaya}</label>
      <div style={{ position: 'relative', marginBottom: errors.customerWelaya ? 0 : 12 }}>
        <ChevronDown size={14} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
        <select className="hn-input" disabled={wilayaEmpty} value={fd.customerWelaya}
          onChange={(e) => { set('customerWelaya', e.target.value); set('customerCommune', ''); }}
          style={{ paddingInlineEnd: 34, ...(errors.customerWelaya ? inputErr : {}) }}>
          <option value="">{wilayaEmpty ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
          {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
        </select>
      </div>
      <FieldErr msg={errors.customerWelaya} />

      {/* commune */}
      <label style={fieldLabel}>{t.commune}</label>
      <div style={{ position: 'relative', marginBottom: errors.customerCommune ? 0 : 12 }}>
        <ChevronDown size={14} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
        <select className="hn-input" disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune}
          onChange={(e) => set('customerCommune', e.target.value)}
          style={{ paddingInlineEnd: 34, ...(errors.customerCommune ? inputErr : {}) }}>
          <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
          {communes.map((c) => <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>)}
        </select>
      </div>
      <FieldErr msg={errors.customerCommune} />

      {/* delivery type */}
      <label style={fieldLabel}>{t.delivery}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {(['home', 'office'] as const).map((typ) => {
          const on = fd.typeLivraison === typ;
          return (
            <button key={typ} onClick={() => set('typeLivraison', typ)}
              style={{ padding: '11px 8px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.85rem',
                background: on ? AL : '#fff', color: on ? AD : TXT, border: `1.5px solid ${on ? A : BD}` }}>
              {typ === 'home' ? t.deliveryHome : t.deliveryOffice}
            </button>
          );
        })}
      </div>

      {/* summary */}
      <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
        {[
          { l: t.price, v: `${fmt(fp)} ${currency}` },
          { l: t.qty, v: `× ${qty}` },
          { l: t.delivery, v: !selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${fmt(getLiv())} ${currency}` },
        ].map((row) => (
          <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '4px 0', fontSize: '0.88rem' }}>
            <span style={{ flexShrink: 0, color: SUB }}>{row.l}</span>
            <span style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{row.v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 10, marginTop: 6, borderTop: `1px solid ${BD}` }}>
          <span style={{ flexShrink: 0, fontWeight: 900 }}>{t.total}</span>
          <span className="hn-display" style={{ whiteSpace: 'nowrap', fontWeight: 900, color: A, fontSize: '1.15rem' }}>{fmt(total())} {currency}</span>
        </div>
      </div>

      {errors.submit && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: SALE, fontSize: '0.82rem', marginBottom: 10 }}><AlertCircle size={14} /> {errors.submit}</p>
      )}
      {flash && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: A, fontSize: '0.85rem', fontWeight: 800, marginBottom: 10 }}><CheckCircle size={14} /> {flash}</p>
      )}

      {/* actions */}
      <button className="hn-btn hn-pulse" onClick={submitOrder} disabled={submitting} style={btnPrimary}>
        {submitting ? t.sending : t.orderNow}
        {!submitting && <ArrowLeft className="hn-btn-icon" size={18} style={{ transform: t.dir === 'ltr' ? 'scaleX(-1)' : 'none' }} />}
      </button>

      {cartEnabled && (
        <button className="hn-btn" onClick={addToCart} disabled={submitting} style={{ ...btnOutline, marginTop: 10 }}>
          <ShoppingCart size={18} /> {t.addToCart}
        </button>
      )}
    </div>
  );
}

const fieldLabel: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 800, color: SUB, marginBottom: 6 };
const inputErr: React.CSSProperties = { borderColor: SALE };
const qtyBtn: React.CSSProperties = { width: 40, height: 40, background: BG, border: 'none', cursor: 'pointer', color: TXT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: '0.75rem', color: SALE, margin: '4px 0 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

/* ============================================================
 * 11. Cart
 * ========================================================== */
export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const router = useRouter();
  const currency = store?.currency || 'دج';
  const cartEnabled = store?.cart !== false;

  const initCount = useCartStore((s: any) => s.initCount);

  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fd, setFd] = useState({
    customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => {
    try { const arr = JSON.parse(localStorage.getItem(domain) || '[]'); setItems(Array.isArray(arr) ? arr : []); }
    catch { setItems([]); }
  }, [domain]);

  useEffect(() => { if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));
  const cartTotal = items.reduce((sum, it) => sum + Number(it.finalPrice || it.product?.price || 0) * Number(it.quantity || 1), 0);
  const hasFreeShippingItem = items.some((it) => it.product?.shippingFree || it.product?.offers?.find((o: Offer) => o.id === it.selectedOffer)?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;
  const getLiv = useCallback((): number => {
    if (freeShippingReached) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison, freeShippingReached]);

  const finalTotal = cartTotal + getLiv();

  const set = (k: string, v: any) => setFd((p) => ({ ...p, [k]: v }));

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    try { localStorage.setItem(domain, JSON.stringify(next)); } catch {}
    initCount(next.length);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orders = items.map((it) => ({
        ...it,
        ...fd,
        variantDetailId: it.variantDetailId ?? null,
        priceLivraison: getLiv(),
        totalPrice: Number(it.finalPrice || it.product?.price || 0) * Number(it.quantity || 1) + getLiv(),
        storeId: store?.id,
        userId: store?.user?.id,
      }));
      const res = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orders),
      });
      if (!res.ok) throw new Error('failed');
      try { localStorage.removeItem(domain); } catch {}
      initCount(0);
      setItems([]);
      setSuccess(true);
    } catch {
      setErrors({ submit: t.errSubmit });
    }
    setSubmitting(false);
  };

  if (!cartEnabled) {
    return (
      <div className="hn-container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: SUB }}>
        <Link href="/" style={{ ...btnPrimary, width: 'auto', display: 'inline-flex', textDecoration: 'none' }}>{t.backToShop}</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="hn-container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 999, background: AL, color: A, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={44} />
        </div>
        <h2 className="hn-display" style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>{t.successTitle}</h2>
        <p style={{ color: SUB, margin: '10px 0 24px' }}>{t.successDesc}</p>
        <Link href="/" style={{ ...btnPrimary, width: 'auto', display: 'inline-flex', textDecoration: 'none' }}>{t.backToShop}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="hn-container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 999, background: BG, color: SUB, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShoppingCart size={40} />
        </div>
        <h2 className="hn-display" style={{ fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>{t.cartEmpty}</h2>
        <p style={{ color: SUB, margin: '10px 0 24px' }}>{t.cartEmptyDesc}</p>
        <Link href="/" style={{ ...btnPrimary, width: 'auto', display: 'inline-flex', textDecoration: 'none' }}>{t.shopNow}</Link>
      </div>
    );
  }

  return (
    <div className="hn-container" style={{ padding: '2rem 1.5rem 3rem' }}>
      <h1 className="hn-display" style={{ fontWeight: 900, fontSize: '1.6rem', margin: '0 0 1.5rem' }}>{t.myCart}</h1>
      {freeShippingMin != null && (
        <div style={{ background: freeShippingReached ? AL : BG, border: `1px solid ${freeShippingReached ? A : BD}`, color: freeShippingReached ? AD : SUB, borderRadius: 10, padding: '12px 16px', marginBottom: '1.25rem', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center' }}>
          {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', String(freeShippingRemainingAmt))}
        </div>
      )}

      <div className="hn-cart-grid">
        {/* items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((it, idx) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            const line = Number(it.finalPrice || it.product?.price || 0) * Number(it.quantity || 1);
            return (
              <div key={idx} style={{ display: 'flex', gap: 14, background: '#fff', border: `1.5px solid ${BD}`, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                <ProductThumb src={img} name={it.product?.name} size={72} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.4 }}>{it.product?.name}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: SUB }}>{t.qty}: {it.quantity}</p>
                  <p className="hn-display" style={{ margin: '4px 0 0', fontWeight: 900, color: A }}>{fmt(line)} {currency}</p>
                </div>
                <button onClick={() => removeItem(idx)} aria-label={t.remove}
                  style={{ background: '#FEECE7', color: SALE, border: 'none', borderRadius: 8, width: 40, height: 40, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Trash2 size={17} />
                </button>
              </div>
            );
          })}
        </div>

        {/* checkout form */}
        <div style={{ background: '#fff', border: `1.5px solid ${BD}`, borderRadius: 16, padding: '1.5rem', boxShadow: '0 10px 30px rgba(15,26,21,0.06)' }}>
          <p className="hn-display" style={{ fontWeight: 900, fontSize: '1.05rem', margin: '0 0 14px' }}>{t.confirmOrder}</p>

          <label style={fieldLabel}>{t.fullName}</label>
          <input className="hn-input" value={fd.customerName} onChange={(e) => set('customerName', e.target.value)} placeholder={t.fullNamePlaceholder} style={errors.customerName ? inputErr : undefined} />
          <FieldErr msg={errors.customerName} />

          <label style={fieldLabel}>{t.phone}</label>
          <input className="hn-input" value={fd.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} placeholder={t.phonePlaceholder} inputMode="tel" style={errors.customerPhone ? inputErr : undefined} />
          <FieldErr msg={errors.customerPhone} />

          <label style={fieldLabel}>{t.wilaya}</label>
          <div style={{ position: 'relative', marginBottom: errors.customerWelaya ? 0 : 12 }}>
            <ChevronDown size={14} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
            <select className="hn-input" disabled={wilayas.length === 0} value={fd.customerWelaya}
              onChange={(e) => { set('customerWelaya', e.target.value); set('customerCommune', ''); }}
              style={{ paddingInlineEnd: 34, ...(errors.customerWelaya ? inputErr : {}) }}>
              <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
              {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
            </select>
          </div>
          <FieldErr msg={errors.customerWelaya} />

          <label style={fieldLabel}>{t.commune}</label>
          <div style={{ position: 'relative', marginBottom: errors.customerCommune ? 0 : 12 }}>
            <ChevronDown size={14} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
            <select className="hn-input" disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune}
              onChange={(e) => set('customerCommune', e.target.value)}
              style={{ paddingInlineEnd: 34, ...(errors.customerCommune ? inputErr : {}) }}>
              <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
              {communes.map((c) => <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>)}
            </select>
          </div>
          <FieldErr msg={errors.customerCommune} />

          <label style={fieldLabel}>{t.delivery}</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {(['home', 'office'] as const).map((typ) => {
              const on = fd.typeLivraison === typ;
              return (
                <button key={typ} onClick={() => set('typeLivraison', typ)}
                  style={{ padding: '11px 8px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.85rem',
                    background: on ? AL : '#fff', color: on ? AD : TXT, border: `1.5px solid ${on ? A : BD}` }}>
                  {typ === 'home' ? t.deliveryHome : t.deliveryOffice}
                </button>
              );
            })}
          </div>

          {/* summary */}
          <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ flexShrink: 0, color: SUB, fontSize: '0.9rem' }}>{t.subtotal}</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{fmt(cartTotal)} {currency}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ flexShrink: 0, color: SUB, fontSize: '0.9rem' }}>{t.delivery}</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{!selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${fmt(getLiv())} ${currency}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 10, borderTop: `1px solid ${BD}` }}>
              <span style={{ flexShrink: 0, fontWeight: 900 }}>{t.total}</span>
              <span className="hn-display" style={{ whiteSpace: 'nowrap', fontWeight: 900, color: A, fontSize: '1.2rem' }}>{fmt(finalTotal)} {currency}</span>
            </div>
          </div>

          {errors.submit && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: SALE, fontSize: '0.82rem', margin: '12px 0 0' }}><AlertCircle size={14} /> {errors.submit}</p>
          )}

          <button className="hn-btn hn-pulse" onClick={submit} disabled={submitting} style={{ ...btnPrimary, marginTop: 16 }}>
            {submitting ? t.sending : t.confirmOrder}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * 12. Static pages
 * ========================================================== */
function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ background: INK, color: '#fff', padding: '3rem 1.5rem' }}>
        <div className="hn-container">
          <h1 className="hn-display" style={{ fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', margin: 0 }}>{title}</h1>
        </div>
      </div>
      <div className="hn-container" style={{ padding: '2.5rem 1.5rem 3rem', maxWidth: 860 }}>{children}</div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 className="hn-display" style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px', color: AD }}>{title}</h3>
      <p style={{ color: '#3a463f', lineHeight: 1.85, fontSize: '0.95rem', margin: 0 }}>{body}</p>
    </div>
  );
}

export function Privacy({ store }: any = {}) {
  const t = T[getLang(store)];
  const blocks: Record<Lang, { title: string; body: string }[]> = {
    ar: [
      { title: 'جمع البيانات', body: 'نجمع فقط المعلومات الضرورية لمعالجة طلبك: الاسم، رقم الهاتف، الولاية والبلدية. لا نطلب أي بيانات بنكية لأن الدفع يتم عند الاستلام.' },
      { title: 'استخدام البيانات', body: 'تُستخدم بياناتك حصراً لتوصيل طلبك والتواصل معك بخصوصه. لا نبيع أو نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية.' },
      { title: 'حماية البيانات', body: 'نتخذ إجراءات معقولة لحماية معلوماتك الشخصية من الوصول غير المصرح به.' },
    ],
    fr: [
      { title: 'Collecte des données', body: 'Nous ne collectons que les informations nécessaires au traitement de votre commande : nom, téléphone, wilaya et commune. Aucune donnée bancaire n\'est demandée car le paiement se fait à la livraison.' },
      { title: 'Utilisation des données', body: 'Vos données servent uniquement à livrer votre commande et à vous contacter à son sujet. Nous ne vendons ni ne partageons vos données à des fins marketing.' },
      { title: 'Protection des données', body: 'Nous prenons des mesures raisonnables pour protéger vos informations personnelles contre tout accès non autorisé.' },
    ],
    en: [
      { title: 'Data Collection', body: 'We only collect information needed to process your order: name, phone, wilaya and commune. No banking data is requested since payment is made on delivery.' },
      { title: 'Use of Data', body: 'Your data is used solely to deliver your order and contact you about it. We never sell or share your data for marketing purposes.' },
      { title: 'Data Protection', body: 'We take reasonable measures to protect your personal information against unauthorized access.' },
    ],
  };
  return <Shell title={t.privacyTitle}>{blocks[getLang(store)].map((b, i) => <InfoBlock key={i} {...b} />)}</Shell>;
}

export function Terms({ store }: any = {}) {
  const t = T[getLang(store)];
  const blocks: Record<Lang, { title: string; body: string }[]> = {
    ar: [
      { title: 'الطلبات', body: 'بتأكيد الطلب فإنك توافق على استلام المنتج ودفع ثمنه عند التوصيل. يُرجى التأكد من صحة رقم الهاتف والعنوان.' },
      { title: 'الأسعار والتوصيل', body: 'الأسعار المعروضة بالدينار الجزائري. تُضاف تكلفة التوصيل حسب الولاية ونوع التوصيل المختار.' },
      { title: 'الإلغاء', body: 'يمكنك إلغاء طلبك قبل شحنه بالتواصل معنا عبر الهاتف.' },
    ],
    fr: [
      { title: 'Commandes', body: 'En confirmant votre commande, vous acceptez de recevoir le produit et de le payer à la livraison. Veuillez vérifier votre numéro et votre adresse.' },
      { title: 'Prix et livraison', body: 'Les prix sont affichés en dinar algérien. Les frais de livraison sont ajoutés selon la wilaya et le mode de livraison choisi.' },
      { title: 'Annulation', body: 'Vous pouvez annuler votre commande avant son expédition en nous contactant par téléphone.' },
    ],
    en: [
      { title: 'Orders', body: 'By confirming your order, you agree to receive the product and pay for it on delivery. Please verify your phone number and address.' },
      { title: 'Pricing & Delivery', body: 'Prices are shown in Algerian dinar. Delivery fees are added based on wilaya and the chosen delivery type.' },
      { title: 'Cancellation', body: 'You may cancel your order before it ships by contacting us by phone.' },
    ],
  };
  return <Shell title={t.termsTitle}>{blocks[getLang(store)].map((b, i) => <InfoBlock key={i} {...b} />)}</Shell>;
}

export function Cookies({ store }: any = {}) {
  const t = T[getLang(store)];
  const blocks: Record<Lang, { title: string; body: string }[]> = {
    ar: [
      { title: 'ما هي الكوكيز', body: 'ملفات صغيرة تُحفظ في متصفحك لتحسين تجربتك، مثل تذكّر محتويات سلتك.' },
      { title: 'كيف نستخدمها', body: 'نستخدم الكوكيز لحفظ سلة التسوق وتحليل أداء المتجر. لا نستخدمها لتتبعك عبر مواقع أخرى.' },
    ],
    fr: [
      { title: 'Que sont les cookies', body: 'De petits fichiers enregistrés dans votre navigateur pour améliorer votre expérience, comme mémoriser votre panier.' },
      { title: 'Comment nous les utilisons', body: 'Nous utilisons les cookies pour sauvegarder le panier et analyser les performances. Nous ne vous suivons pas sur d\'autres sites.' },
    ],
    en: [
      { title: 'What are cookies', body: 'Small files stored in your browser to improve your experience, such as remembering your cart contents.' },
      { title: 'How we use them', body: 'We use cookies to save your cart and analyze store performance. We do not use them to track you across other sites.' },
    ],
  };
  return <Shell title={t.cookiesTitle}>{blocks[getLang(store)].map((b, i) => <InfoBlock key={i} {...b} />)}</Shell>;
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      setSent(true);
    } catch { setSent(true); }
    setSending(false);
  };

  return (
    <Shell title={t.contactTitle}>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: AL, color: A, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CheckCircle size={40} /></div>
          <h3 className="hn-display" style={{ fontWeight: 900, margin: 0 }}>{t.msgSent}</h3>
          <p style={{ color: SUB, margin: '8px 0 20px' }}>{t.msgSentDesc}</p>
          <button className="hn-btn" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }} style={{ ...btnOutline, width: 'auto', display: 'inline-flex' }}>{t.anotherMsg}</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          {/* contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {store?.contact?.phone && <div style={contactRow}><span style={contactIco}><Phone size={18} /></span><div><p style={{ margin: 0, fontSize: '0.78rem', color: SUB }}>{t.phone}</p><a href={`tel:${store.contact.phone}`} style={{ color: TXT, textDecoration: 'none', fontWeight: 700 }}>{store.contact.phone}</a></div></div>}
            {store?.contact?.email && <div style={contactRow}><span style={contactIco}><Mail size={18} /></span><div><p style={{ margin: 0, fontSize: '0.78rem', color: SUB }}>Email</p><a href={`mailto:${store.contact.email}`} style={{ color: TXT, textDecoration: 'none', fontWeight: 700 }}>{store.contact.email}</a></div></div>}
            {(store?.contact?.wilaya || store?.contact?.address) && <div style={contactRow}><span style={contactIco}><MapPin size={18} /></span><div><p style={{ margin: 0, fontSize: '0.78rem', color: SUB }}>{t.wilaya}</p><p style={{ margin: 0, fontWeight: 700 }}>{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' — ')}</p></div></div>}
          </div>

          {/* message form */}
          <div style={{ background: '#fff', border: `1.5px solid ${BD}`, borderRadius: 16, padding: '1.5rem' }}>
            <label style={fieldLabel}>{t.fullName}</label>
            <input className="hn-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.fullNamePlaceholder} />
            <div style={{ height: 12 }} />
            <label style={fieldLabel}>Email</label>
            <input className="hn-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" inputMode="email" />
            <div style={{ height: 12 }} />
            <label style={fieldLabel}>{t.phone}</label>
            <input className="hn-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t.phonePlaceholder} inputMode="tel" />
            <div style={{ height: 12 }} />
            <label style={fieldLabel}>{t.yourMessage}</label>
            <textarea className="hn-input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} style={{ resize: 'none' }} />
            <button className="hn-btn" onClick={submit} disabled={sending} style={{ ...btnPrimary, marginTop: 16 }}>{sending ? t.sending : t.sendMessage}</button>
          </div>
        </div>
      )}
    </Shell>
  );
}

const contactRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 14 };
const contactIco: React.CSSProperties = { width: 46, height: 46, borderRadius: 12, background: AL, color: A, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  if (p === 'privacy') return <Privacy store={store} />;
  if (p === 'terms') return <Terms store={store} />;
  if (p === 'cookies') return <Cookies store={store} />;
  if (p === 'contact') return <Contact store={store} />;
  return <Privacy store={store} />;
}