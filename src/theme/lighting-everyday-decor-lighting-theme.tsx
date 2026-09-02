/**
 * DESIGN BRIEF — Everyday Decor & Lighting  (slug: lighting-everyday-decor-lighting-theme)
 * Niche: table lamps, night lights, everyday decorative fixtures — affordable, not luxury.
 * Audience: someone furnishing a modest home at dusk; wants a warm, cozy room, low budget.
 * Mood (3): warm, bright, homey.
 * Navbar decision:  Warm cream horizontal bar with a CENTERED, prominent expanding search —
 *                   in a high-SKU affordable store, "find the right lamp" is the primary job,
 *                   so search is the hero of the bar, not tucked in a corner. Soft amber
 *                   glow-line under the bar instead of a hard border → "lit from below".
 * Hero decision:    Bright, light, asymmetric. Warm cream→amber wash, a floating radial GLOW
 *                   orb (the signature "lamp light") opposite the offset headline. No dark
 *                   full-bleed — the desc explicitly says "bright/accessible".
 * Card decision:    At rest, soft warm shadow. On hover, an amber halo BLOOMS behind the card
 *                   + image zoom → the product literally "lights up". This hover embodies the
 *                   category (lighting) instead of a generic lift.
 * Product decision: Generous warm-framed gallery (lamp buyers are visual) + a sticky warm
 *                   "order card" on the side; offers/attributes as warm glow-chips; description
 *                   as its own inline warm panel. Gallery gets size because the whole product IS
 *                   how it looks lit.
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import DOMPurify from 'dompurify';
import {
  Search, X, ShoppingBag, Menu, Phone, Mail, MapPin, Send, MessageCircle,
  ChevronLeft, ChevronRight, ChevronDown, Trash2, Plus, Minus,
  Lightbulb, Star, Check, AlertCircle, Truck, ShieldCheck, CreditCard, Headphones, Package, Download,
} from 'lucide-react';

/* ============================================================================
   TYPES (preserved as-is)
   ========================================================================== */
interface Offer { id: string; name: string; quantity: number; price: number; subTitle?: string; shippingFree?: boolean; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

/* ============================================================================
   DESIGN TOKENS — warm / bright / homey  ("lamplight")
   ========================================================================== */
const BG    = '#FCF8F1'; // warm cream page
const SURF  = '#FFFFFF'; // cards / navbar
const SURF2 = '#FBF3E7'; // inset / inputs (slightly warmer, "type here")
const A     = '#D9822B'; // accent — honey/amber lamp glow
const AL    = '#FBEBD6'; // accent light tint
const AD    = '#B96A1C'; // accent dark (hover)
const TXT   = '#3A2E24'; // warm charcoal-brown (cozier than pure black)
const SUB   = '#8C7B6A'; // muted warm grey
const BD    = '#EADDCB'; // warm border
const DARK  = '#2A2019'; // warm near-black brown (footer / static headers)
const GLOW  = '240, 168, 74'; // rgb of the bright glow amber

/* ============================================================================
   MULTILINGUAL T PATTERN  (§3-A) — AR / FR / EN, single file
   ========================================================================== */
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
    search: 'ابحث عن مصباح أو ديكور...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
    showAll: 'عرض كل النتائج ←',
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تسوق الآن',
    trust: [
      { t: 'توصيل سريع', s: 'لكل الولايات' },
      { t: 'جودة مضمونة', s: 'إضاءة تدوم' },
      { t: 'دفع آمن', s: 'حماية كاملة للبيانات' },
      { t: 'دعم 24/7', s: 'فريق متخصص للمساعدة' },
    ],
    quickLinks: 'روابط سريعة', legalNav: 'قانوني', contactUs: 'تواصل معنا',
    privacy: 'الخصوصية', terms: 'الشروط', cookies: 'الكوكيز',
    rightsReserved: 'جميع الحقوق محفوظة',
    fullName: 'الاسم الكامل', fullNamePlaceholder: 'أدخل اسمك الكامل',
    phone: 'رقم الهاتف', phonePlaceholder: '05xxxxxxxx',
    wilaya: 'الولاية', wilayaPlaceholder: 'اختر الولاية', wilayaUnavailable: 'التوصيل غير متاح حالياً',
    commune: 'البلدية', communePlaceholder: 'اختر البلدية', communeLoading: 'جاري التحميل...',
    deliveryHome: 'توصيل للمنزل', deliveryOffice: 'مكتب بريد',
    orderEmail: 'البريد الإلكتروني', emailPh: 'example@email.com', errEmail: 'يرجى إدخال بريد إلكتروني صحيح',
    whatsapp: 'رقم واتساب', whatsappPh: '0550123456', errWhatsapp: 'رقم واتساب جزائري صحيح مطلوب (مثال: 0550123456)',
    contactQuestion: 'هل تملك بريداً إلكترونياً أم واتساب؟',
    contactViaEmail: 'البريد الإلكتروني', contactViaWhatsapp: 'واتساب',
    qty: 'الكمية', price: 'السعر', delivery: 'التوصيل', total: 'الإجمالي',
    orderNow: 'اطلب الآن', addToCart: 'أضف إلى السلة',
    confirmOrder: 'تأكيد الطلب', sending: 'جاري الإرسال...', cancel: 'إلغاء',
    successTitle: 'تم إرسال طلبك بنجاح!', successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل.',
    backToShop: 'العودة للتسوق',
    orderInfo: 'معلومات الطلب',
    successSteps: [
      { title: 'تم استلام طلبك', desc: 'تم تسجيل طلبك بنجاح في نظامنا' },
      { title: 'تأكيد الطلب', desc: 'سنتصل بك خلال 24 ساعة' },
      { title: 'التجهيز والتغليف', desc: 'يتم تجهيز طلبك بعناية' },
      { title: 'الشحن والتوصيل', desc: '2-5 أيام عمل' },
    ],
    cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تتم إضافة أي منتجات بعد.',
    myCart: 'سلتي', subtotal: 'المجموع الفرعي',
    errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
    errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'الوصف',
    freeShippingBadge: 'توصيل مجاني',
    freeShippingThreshold: 'توصيل مجاني عند الشراء بأكثر من {{amount}}',
    freeShippingRemaining: 'أضف {{amount}} لتحصل على توصيل مجاني',
    freeShippingReached: 'مبروك! لديك توصيل مجاني 🎉',
    searchResultsFor: 'نتائج البحث عن:',
    heroBadge: 'أضِئ منزلك',
    sendMessage: 'إرسال الرسالة', sendAnother: 'إرسال رسالة أخرى',
    messagePlaceholder: 'كيف يمكننا مساعدتك؟', emailLabel: 'البريد الإلكتروني',
    contactSuccess: 'تم إرسال رسالتك!', contactSuccessDesc: 'شكراً لتواصلك معنا، سنرد قريباً.',
    productsTitle: 'منتجاتنا', categoriesTitle: 'تصفّح حسب الفئة',
  },
  fr: {
    dir: 'ltr' as const,
    home: 'Accueil', contact: 'Contact', cart: 'Panier',
    search: 'Rechercher une lampe, un décor...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats →',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Découvrir',
    trust: [
      { t: 'Livraison Rapide', s: 'Partout en Algérie' },
      { t: 'Qualité Garantie', s: 'Un éclairage qui dure' },
      { t: 'Paiement Sécurisé', s: 'Vos données protégées' },
      { t: 'Support 24/7', s: 'Toujours à votre écoute' },
    ],
    quickLinks: 'Navigation', legalNav: 'Légal', contactUs: 'Contact',
    privacy: 'Confidentialité', terms: 'Conditions', cookies: 'Cookies',
    rightsReserved: 'Tous droits réservés.',
    fullName: 'Nom complet', fullNamePlaceholder: 'Votre nom complet',
    phone: 'Téléphone', phonePlaceholder: '0555 12 34 56',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Choisir la wilaya', wilayaUnavailable: 'Livraison indisponible',
    commune: 'Commune', communePlaceholder: 'Choisir la commune', communeLoading: 'Chargement...',
    deliveryHome: 'À domicile', deliveryOffice: 'Point relais',
    orderEmail: 'E-mail', emailPh: 'exemple@email.com', errEmail: 'Veuillez saisir une adresse e-mail valide',
    whatsapp: 'Numéro WhatsApp', whatsappPh: '0550123456', errWhatsapp: 'Numéro WhatsApp algérien valide requis (ex: 0550123456)',
    contactQuestion: 'Avez-vous un e-mail ou un numéro WhatsApp ?',
    contactViaEmail: 'E-mail', contactViaWhatsapp: 'WhatsApp',
    qty: 'Quantité', price: 'Prix', delivery: 'Livraison', total: 'Total',
    orderNow: 'Commander', addToCart: 'Ajouter au panier',
    confirmOrder: 'Confirmer la commande', sending: 'Envoi en cours...', cancel: 'Annuler',
    successTitle: 'Commande confirmée !', successDesc: 'Notre équipe vous contactera bientôt.',
    backToShop: 'Retour à la boutique',
    orderInfo: 'Informations de commande',
    successSteps: [
      { title: 'Commande reçue', desc: 'Votre commande a été enregistrée avec succès' },
      { title: 'Confirmation', desc: 'Nous vous appellerons sous 24h' },
      { title: 'Préparation', desc: 'Votre commande est préparée avec soin' },
      { title: 'Livraison', desc: '2-5 jours ouvrables' },
    ],
    cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre sélection.',
    myCart: 'Mon Panier', subtotal: 'Sous-total',
    errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
    errName: 'Nom complet requis (3 caractères minimum)',
    errPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description',
    freeShippingBadge: 'Livraison gratuite',
    freeShippingThreshold: 'Livraison gratuite à partir de {{amount}}',
    freeShippingRemaining: 'Ajoutez {{amount}} pour bénéficier de la livraison gratuite',
    freeShippingReached: 'Bravo ! Vous avez la livraison gratuite 🎉',
    searchResultsFor: 'Résultats pour :',
    heroBadge: 'Illuminez votre intérieur',
    sendMessage: 'Envoyer le message', sendAnother: 'Envoyer un autre message',
    messagePlaceholder: 'Comment pouvons-nous vous aider ?', emailLabel: 'E-mail',
    contactSuccess: 'Message envoyé !', contactSuccessDesc: 'Merci de nous avoir contactés, nous répondrons bientôt.',
    productsTitle: 'Nos produits', categoriesTitle: 'Parcourir par catégorie',
  },
  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart',
    search: 'Search lamps, decor...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results →',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Shop Now',
    trust: [
      { t: 'Fast Delivery', s: 'Across all wilayas' },
      { t: 'Quality Guaranteed', s: 'Lighting that lasts' },
      { t: 'Secure Payment', s: 'Full data protection' },
      { t: '24/7 Support', s: 'Always here to help' },
    ],
    quickLinks: 'Quick Links', legalNav: 'Legal', contactUs: 'Contact Us',
    privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies',
    rightsReserved: 'All rights reserved.',
    fullName: 'Full Name', fullNamePlaceholder: 'Enter your full name',
    phone: 'Phone Number', phonePlaceholder: '0555 12 34 56',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Select wilaya', wilayaUnavailable: 'Delivery unavailable',
    commune: 'Commune', communePlaceholder: 'Select commune', communeLoading: 'Loading...',
    deliveryHome: 'Home Delivery', deliveryOffice: 'Pickup Point',
    orderEmail: 'Email', emailPh: 'example@email.com', errEmail: 'Please enter a valid email address',
    whatsapp: 'WhatsApp number', whatsappPh: '0550123456', errWhatsapp: 'A valid Algerian WhatsApp number is required (e.g. 0550123456)',
    contactQuestion: 'Do you have an email or a WhatsApp number?',
    contactViaEmail: 'Email', contactViaWhatsapp: 'WhatsApp',
    qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total',
    orderNow: 'Order Now', addToCart: 'Add to Cart',
    confirmOrder: 'Confirm Order', sending: 'Sending...', cancel: 'Cancel',
    successTitle: 'Order placed successfully!', successDesc: 'We will contact you shortly to confirm the details.',
    backToShop: 'Back to Shop',
    orderInfo: 'Order Info',
    successSteps: [
      { title: 'Order received', desc: 'Your order has been registered successfully' },
      { title: 'Confirmation', desc: "We'll call you within 24 hours" },
      { title: 'Packaging', desc: 'Your order is being prepared with care' },
      { title: 'Shipping', desc: '2-5 business days' },
    ],
    cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Start shopping now.',
    myCart: 'My Cart', subtotal: 'Subtotal',
    errSubmit: 'An error occurred. Please try again.',
    errName: 'Full name is required (at least 3 characters)',
    errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Description',
    freeShippingBadge: 'Free Delivery',
    freeShippingThreshold: 'Free delivery on orders over {{amount}}',
    freeShippingRemaining: 'Add {{amount}} more to get free delivery',
    freeShippingReached: 'Congrats! You have free delivery 🎉',
    searchResultsFor: 'Results for:',
    heroBadge: 'Light up your home',
    sendMessage: 'Send Message', sendAnother: 'Send another message',
    messagePlaceholder: 'How can we help you?', emailLabel: 'Email',
    contactSuccess: 'Message sent!', contactSuccessDesc: 'Thank you for reaching out, we will reply soon.',
    productsTitle: 'Our Products', categoriesTitle: 'Browse by category',
  },
} as const;

type TKeys = typeof T['ar'];

/* ============================================================================
   HELPERS / FIXED API  (§3)
   ========================================================================== */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const res = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.wilayas || data?.data || []);
  } catch {
    return [];
  }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const res = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.communes || data?.data || []);
  } catch {
    return [];
  }
};

const fmt = (n: number) => Number(n || 0).toLocaleString('fr-FR');
const cur = (store: any) => store?.currency || 'دج';

/* ============================================================================
   SHARED STYLE PRIMITIVES  (§19)
   ========================================================================== */
const container: React.CSSProperties = { maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', width: '100%' };

const inputBase: React.CSSProperties = {
  width: '100%', padding: '0.8rem 1rem', fontSize: '0.92rem',
  border: `1.5px solid ${BD}`, borderRadius: 12, background: SURF2, color: TXT,
  outline: 'none', appearance: 'none', transition: 'border-color .2s, box-shadow .2s',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '0.95rem 1.6rem', minHeight: 48, background: A, color: '#fff',
  fontWeight: 800, fontSize: '0.95rem', border: 'none', borderRadius: 14,
  cursor: 'pointer', transition: 'transform .15s ease, box-shadow .2s, background .2s',
  fontFamily: 'inherit', width: '100%',
};

const btnGhost: React.CSSProperties = {
  ...btnPrimary, background: 'transparent', color: A, border: `1.5px solid ${A}`,
};

/* ============================================================================
   THEME CSS — keyframes, responsive grids, glow, skeleton
   ========================================================================== */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Nunito:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap');

.lm-root { font-family: 'Nunito','Tajawal',sans-serif; color: ${TXT}; background: ${BG}; }
.lm-root h1,.lm-root h2,.lm-root h3,.lm-display { font-family: 'Fraunces','Tajawal',serif; }

* { box-sizing: border-box; }

/* ---- Entry ---- */
@keyframes lmFadeUp { from { opacity:0; transform: translateY(24px);} to { opacity:1; transform: translateY(0);} }
@keyframes lmScaleIn { from { opacity:0; transform: scale(.92);} to { opacity:1; transform: scale(1);} }
@keyframes lmFadeIn { from { opacity:0;} to { opacity:1;} }

/* ---- Looping (the "lamplight") ---- */
@keyframes lmFloat { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-14px);} }
@keyframes lmGlowPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(${GLOW}, .0), 0 10px 30px rgba(217,130,43,.28); }
  50%     { box-shadow: 0 0 40px 6px rgba(${GLOW}, .35), 0 12px 34px rgba(217,130,43,.35); }
}
@keyframes lmShimmer { 0% { background-position:-420px 0;} 100% { background-position:420px 0;} }
@keyframes lmMarquee { from { transform: translateX(0);} to { transform: translateX(-50%);} }

/* ---- Nav underline glow ---- */
.lm-navlink { position: relative; }
.lm-navlink::after {
  content:''; position:absolute; bottom:-6px; inset-inline-start:0; inset-inline-end:0;
  height:2px; background:${A}; border-radius:2px; transform: scaleX(0); transform-origin:center;
  transition: transform .25s ease; box-shadow: 0 0 8px rgba(${GLOW}, .6);
}
.lm-navlink:hover::after, .lm-navlink.active::after { transform: scaleX(1); }

/* ---- Cards: the lamp "turns on" ---- */
.lm-card {
  animation: lmFadeUp .55s ease both;
  transition: transform .3s cubic-bezier(.22,.68,0,1.2), box-shadow .3s ease;
  will-change: transform;
}
.lm-card:hover { transform: translateY(-8px); box-shadow: 0 24px 50px -12px rgba(${GLOW}, .5), 0 8px 22px rgba(58,46,36,.10); }
.lm-card-imgwrap { overflow:hidden; }
.lm-card-img { transition: transform .5s ease; }
.lm-card:hover .lm-card-img { transform: scale(1.08); }

/* ---- Buttons ---- */
.lm-btn { transition: transform .15s ease, box-shadow .2s, background .2s; }
.lm-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(217,130,43,.32); background:${AD}; }
.lm-btn:active:not(:disabled) { transform: translateY(0) scale(.97); }
.lm-btn:disabled { opacity:.6; cursor:default; }
.lm-cta-glow { animation: lmGlowPulse 2.6s ease-in-out infinite; }

/* ---- Inputs focus ---- */
.lm-input:focus { border-color:${A} !important; box-shadow: 0 0 0 4px rgba(${GLOW}, .18); background:#fff; }

/* ---- Skeleton ---- */
.lm-skeleton {
  background: linear-gradient(90deg, ${SURF2} 25%, #FFF6E7 50%, ${SURF2} 75%);
  background-size: 420px 100%; animation: lmShimmer 1.4s infinite linear; border-radius:14px;
}

/* ---- Hero glow orb ---- */
.lm-glow-orb { animation: lmFloat 6s ease-in-out infinite; will-change: transform; }

/* ---- Responsive grids ---- */
.lm-products { display:grid; grid-template-columns:1fr; gap:1.1rem; }
@media (min-width:640px)  { .lm-products { grid-template-columns:repeat(2,1fr); } }
@media (min-width:1024px) { .lm-products { grid-template-columns:repeat(3,1fr); } }
@media (min-width:1280px) { .lm-products { grid-template-columns:repeat(4,1fr); } }

.lm-trust { display:grid; grid-template-columns:repeat(2,1fr); gap:.9rem; }
@media (min-width:768px)  { .lm-trust { grid-template-columns:repeat(4,1fr); } }

.lm-details { display:grid; grid-template-columns:1fr; gap:2rem; }
@media (min-width:960px)  { .lm-details { grid-template-columns:1.1fr .95fr; align-items:start; } }

.lm-cart { display:flex; flex-direction:column; gap:1.6rem; }
@media (min-width:1024px) {
  .lm-cart { flex-direction:row; align-items:flex-start; }
  .lm-cart > *:first-child { flex:1.3; min-width:0; }
  .lm-cart > *:last-child  { flex:1; min-width:320px; position:sticky; top:90px; }
}

.lm-foot { display:grid; grid-template-columns:1fr; gap:2rem; }
@media (min-width:768px)  { .lm-foot { grid-template-columns:1.4fr 1fr 1fr 1fr; } }

.lm-row2 { display:grid; grid-template-columns:1fr; gap:.85rem; }
@media (min-width:520px)  { .lm-row2 { grid-template-columns:1fr 1fr; } }

.lm-contact { display:grid; grid-template-columns:1fr; gap:2rem; }
@media (min-width:820px)  { .lm-contact { grid-template-columns:1fr 1.2fr; } }

.lm-hero-grid { display:grid; grid-template-columns:1fr; gap:1.5rem; align-items:center; }
@media (min-width:900px)  { .lm-hero-grid { grid-template-columns:1.15fr .85fr; } }

/* ---- Desktop / mobile nav visibility ---- */
.lm-nav-desktop { display:none; }
.lm-nav-burger  { display:inline-flex; }
@media (min-width:900px) {
  .lm-nav-desktop { display:flex; }
  .lm-nav-burger  { display:none !important; }
}

.lm-hide-mobile { display:none; }
@media (min-width:900px) { .lm-hide-mobile { display:block; } }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }
}
`;

/* ============================================================================
   SMALL SHARED PARTS
   ========================================================================== */
function Stars({ n = 5, size = 13 }: { n?: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < n ? A : 'none'} color={i < n ? A : BD} strokeWidth={1.5} />
      ))}
    </span>
  );
}

function ProductImg({ src, alt, style, className }: any) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img src={src} alt={alt} className={className} onError={() => setErr(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }} />
    );
  }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: SURF2, ...style }}>
      <Lightbulb size={40} color={BD} strokeWidth={1.5} />
    </div>
  );
}

/* ============================================================================
   MAIN  (§4) — scroll reset + page-fade
   ========================================================================== */
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
    <div className="lm-root" dir={t.dir} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <main style={{ flex: 1, opacity: visible ? 1 : 0, transition: 'opacity .3s ease' }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ============================================================================
   NAVBAR  (§5) — warm bar, centered search, cart guard, mobile overlay
   ========================================================================== */
export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const router = useRouter();
  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cartEnabled = store?.cart !== false;
  const logoUrl = store?.design?.logoUrl;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch { /* noop */ }
  }, [domain, initCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setListSearch([]); return; }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data?.products || data?.data || []);
        setListSearch(arr.slice(0, 8));
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(id);
  }, [searchQuery, domain]);

  const submitSearch = (e?: any) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
  };

  const mobileLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const resultRow = (p: any, onNav: () => void) => {
    const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
    return (
      <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={onNav}
        style={{ display: 'flex', gap: 12, padding: '11px 14px', borderBottom: `1px solid ${BD}`, alignItems: 'center', textDecoration: 'none', color: TXT }}>
        <div style={{ width: 50, height: 50, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: SURF2 }}>
          <ProductImg src={img} alt={p.name} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '.88rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
          <p style={{ fontSize: '.82rem', color: A, margin: 0, fontWeight: 800 }}>{fmt(Number(p.price))} {cur(store)}</p>
        </div>
      </Link>
    );
  };

  return (
    <>
      <div style={{ background: DARK, color: '#F5E9D6', fontSize: '.8rem', fontWeight: 600, overflow: 'hidden', height: 34, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', whiteSpace: 'nowrap', animation: 'lmMarquee 26s linear infinite' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} style={{ padding: '0 48px', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <Truck size={13} style={{ flexShrink: 0 }} />
              {store?.topBar?.text || 'توصيل لجميع ولايات الجزائر'}
            </span>
          ))}
        </div>
      </div>

      <header style={{
        position: 'sticky', top: 0, zIndex: 200, background: scrolled ? 'rgba(255,255,255,.92)' : SURF,
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        borderBottom: `1px solid ${BD}`, boxShadow: scrolled ? `0 6px 22px -12px rgba(${GLOW}, .55)` : `0 2px 0 0 rgba(${GLOW}, .25)`,
        transition: 'box-shadow .3s, background .3s',
      }}>
        <div style={{ ...container, display: 'flex', alignItems: 'center', gap: 18, height: 72 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: AL, display: 'grid', placeItems: 'center', boxShadow: `0 0 16px rgba(${GLOW}, .45)` }}>
              <Lightbulb size={20} color={A} fill={A} strokeWidth={1.5} />
            </span>
            {logoUrl && !imgError ? (
              <img src={logoUrl} alt={store?.name} onError={() => setImgError(true)} style={{ height: 34, objectFit: 'contain', maxWidth: 160 }} />
            ) : (
              <span className="lm-display" style={{ fontSize: '1.3rem', fontWeight: 700, color: TXT, letterSpacing: '-.01em' }}>{store?.name}</span>
            )}
          </Link>

          {/* Desktop centered search */}
          <form onSubmit={submitSearch} className="lm-nav-desktop" style={{ flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: searchFocused ? 520 : 420, transition: 'max-width .3s ease' }}>
              <Search size={17} color={SUB} style={{ position: 'absolute', insetInlineStart: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                className="lm-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search} onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                style={{ ...inputBase, paddingInlineStart: 40, paddingInlineEnd: searchQuery ? 40 : 14, borderRadius: 999, height: 46 }} />
              {searchQuery && (
                <button type="button"
                  onMouseDown={(e) => { e.preventDefault(); setSearchQuery(''); setListSearch([]); setSearchFocused(false); }}
                  style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', background: BD, border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'grid', placeItems: 'center', cursor: 'pointer', color: TXT, flexShrink: 0 }}>
                  <X size={13} />
                </button>
              )}
              {(listSearch.length > 0 || (loading && searchQuery.length >= 2)) && searchFocused && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', insetInlineStart: 0, insetInlineEnd: 0,
                  background: SURF, boxShadow: '0 18px 44px rgba(58,46,36,.16)', borderRadius: 16,
                  zIndex: 500, maxHeight: 380, overflowY: 'auto', border: `1px solid ${BD}`,
                }}>
                  {loading && <p style={{ padding: '1rem', textAlign: 'center', color: SUB, margin: 0 }}>{t.searching}</p>}
                  {listSearch.map((p) => resultRow(p, () => setSearchFocused(false)))}
                  {listSearch.length > 0 && (
                    <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onMouseDown={(e) => e.preventDefault()}
                      style={{ display: 'block', padding: '12px 14px', textAlign: 'center', fontSize: '.85rem', fontWeight: 800, color: A, textDecoration: 'none' }}>
                      {t.showAll}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </form>

          {/* Right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginInlineStart: 'auto' }}>
            <nav className="lm-nav-desktop" style={{ alignItems: 'center', gap: 26, marginInlineEnd: 8 }}>
              <Link href="/" className="lm-navlink" style={{ textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: '.95rem' }}>{t.home}</Link>
              <Link href="/contact" className="lm-navlink" style={{ textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: '.95rem' }}>{t.contact}</Link>
            </nav>

            {/* Mobile search trigger */}
            <button className="lm-nav-burger" onClick={() => setShowSearch(true)} aria-label={t.search}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: 44, height: 44, display: 'grid', placeItems: 'center', color: TXT }}>
              <Search size={22} />
            </button>

            {cartEnabled && (
              <Link href="/cart" aria-label={t.cart} style={{ position: 'relative', width: 44, height: 44, display: 'grid', placeItems: 'center', color: TXT }}>
                <ShoppingBag size={22} />
                {count > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, insetInlineEnd: 2, minWidth: 18, height: 18, padding: '0 4px',
                    background: A, color: '#fff', fontSize: '.68rem', fontWeight: 800, borderRadius: 999,
                    display: 'grid', placeItems: 'center', boxShadow: `0 0 10px rgba(${GLOW}, .7)`,
                  }}>{count}</span>
                )}
              </Link>
            )}

            {/* Hamburger */}
            <button className="lm-nav-burger" onClick={() => setOpen(true)} aria-label="menu"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: 44, height: 44, display: 'grid', placeItems: 'center', color: TXT }}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(42,32,25,.5)', backdropFilter: 'blur(3px)' }}>
          <div style={{
            position: 'absolute', top: 0, insetInlineEnd: 0, bottom: 0, width: 'min(320px,84vw)', background: SURF,
            padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 6, animation: 'lmFadeIn .2s ease',
            boxShadow: '-20px 0 50px rgba(42,32,25,.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="lm-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{store?.name}</span>
              <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: TXT }}><X size={24} /></button>
            </div>
            {mobileLinks.map((lnk) => (
              <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)}
                style={{ padding: '13px 14px', borderRadius: 12, textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: '1rem', background: SURF2 }}>
                {lnk.l}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile full-screen search overlay */}
      {showSearch && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(42,32,25,.55)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column' }}>
          <form onSubmit={submitSearch} style={{ background: SURF, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={20} color={SUB} />
            <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: TXT, fontFamily: 'inherit' }} />
            <button type="button" onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: TXT }}><X size={22} /></button>
          </form>
          <div style={{ flex: 1, overflowY: 'auto', background: SURF, marginTop: 1 }}>
            {loading && <p style={{ padding: '1rem', textAlign: 'center', color: SUB }}>{t.searching}</p>}
            {listSearch.map((p) => resultRow(p, () => setShowSearch(false)))}
            {listSearch.length > 0 && (
              <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearch(false)}
                style={{ display: 'block', padding: '15px', textAlign: 'center', background: SURF2, fontWeight: 800, color: A, textDecoration: 'none' }}>
                {t.showAll}
              </Link>
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

/* ============================================================================
   FOOTER  (§6)
   ========================================================================== */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const cartEnabled = store?.cart !== false;
  const year = new Date().getFullYear();

  const links = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contact },
  ].filter((lnk) => lnk.h !== '/cart' || cartEnabled);

  const contact = store?.contact || {};

  return (
    <footer style={{ background: DARK, color: '#EBDCC7', marginTop: 'auto', paddingTop: '3rem' }}>
      <div style={{ ...container, paddingBottom: '2.2rem' }}>
        <div className="lm-foot">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(240,168,74,.16)', display: 'grid', placeItems: 'center' }}>
                <Lightbulb size={19} color={A} fill={A} strokeWidth={1.5} />
              </span>
              <span className="lm-display" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFF7EA' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '.9rem', lineHeight: 1.7, color: '#C6B49C', maxWidth: 320, margin: 0 }}>
              {store?.hero?.subtitle || ''}
            </p>
            <p style={{ fontSize: '.8rem', color: '#8F7C63', marginTop: 18 }}>© {year} {store?.name} — {t.rightsReserved}</p>
          </div>

          <div>
            <h4 className="lm-display" style={{ fontSize: '1.05rem', margin: '0 0 14px', color: '#FFF7EA' }}>{t.quickLinks}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((lnk) => (
                <li key={lnk.h}>
                  <Link href={lnk.h} style={{ color: '#C6B49C', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>{lnk.l}</Link>
                </li>
              ))}
            </ul>
          </div>

          
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
            <h4 className="lm-display" style={{ fontSize: '1.05rem', margin: '0 0 14px', color: '#FFF7EA' }}>{t.contactUs}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {contact.phone && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.9rem', color: '#C6B49C' }}>
                  <Phone size={16} color={A} /> <span dir="ltr">{contact.phone}</span>
                </li>
              )}
              {contact.email && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.9rem', color: '#C6B49C' }}>
                  <Mail size={16} color={A} /> {contact.email}
                </li>
              )}
              {(contact.wilaya || contact.address) && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.9rem', color: '#C6B49C' }}>
                  <MapPin size={16} color={A} /> {[contact.wilaya, contact.address].filter(Boolean).join(' — ')}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '14px 0', textAlign: 'center', fontSize: '.78rem', color: '#8F7C63' }}>
        {store?.name} • {t.rightsReserved}
      </div>
    </footer>
  );
}

/* ============================================================================
   CARD  (§7) — the lamp "turns on" on hover
   ========================================================================== */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const t = T[getLang(store)];
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;
  const price = Number(product.price);
  const orig = Number(product.priceOriginal || 0);

  return (
    <Link href={`/product/${product.slug || product.id}`} onClick={viewDetails} className="lm-card"
      style={{ display: 'block', textDecoration: 'none', color: TXT, background: SURF, borderRadius: 20, overflow: 'hidden', border: `1px solid ${BD}`, boxShadow: '0 4px 14px rgba(58,46,36,.06)' }}>
      <div className="lm-card-imgwrap" style={{ position: 'relative', aspectRatio: '1 / 1', background: SURF2 }}>
        <div className="lm-card-img" style={{ width: '100%', height: '100%' }}>
          <ProductImg src={img} alt={product.name} />
        </div>
        {discount > 0 && (
          <span style={{
            position: 'absolute', top: 12, insetInlineStart: 12, background: A, color: '#fff',
            fontSize: '.72rem', fontWeight: 800, padding: '5px 10px', borderRadius: 999,
            boxShadow: `0 4px 12px rgba(${GLOW}, .55)`,
          }}>-{discount}%</span>
        )}
        {product.isDigital ? (
          <span style={{
            position: 'absolute', top: 12, insetInlineEnd: 12, background: A, color: '#fff',
            fontSize: '.72rem', fontWeight: 800, padding: '5px 8px', borderRadius: 999,
            boxShadow: `0 4px 12px rgba(${GLOW}, .55)`, display: 'flex', alignItems: 'center',
          }}><Download size={12} /></span>
        ) : product.shippingFree && (
          <span style={{
            position: 'absolute', top: 12, insetInlineEnd: 12, background: A, color: '#fff',
            fontSize: '.72rem', fontWeight: 800, padding: '5px 10px', borderRadius: 999,
            boxShadow: `0 4px 12px rgba(${GLOW}, .55)`,
          }}>🚚</span>
        )}
      </div>
      <div style={{ padding: '14px 16px 18px' }}>
        <Stars n={5} />
        <h3 style={{
          fontFamily: "'Nunito','Tajawal',sans-serif", fontSize: '.98rem', fontWeight: 700, margin: '8px 0 10px',
          lineHeight: 1.35, minHeight: '2.6em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{product.name}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: A }}>{fmt(price)} {cur(store)}</span>
          {orig > price && (
            <span style={{ fontSize: '.85rem', color: SUB, textDecoration: 'line-through' }}>{fmt(orig)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ============================================================================
   HOME  (§8)
   ========================================================================== */
export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const cartEnabled = store?.cart !== false;

  const products: any[] = store?.products || [];
  const cats: any[] = store?.categories || [];
  const hero = store?.hero || {};
  const trustIcons = [Truck, ShieldCheck, CreditCard, Headphones];

  const perPage = 48;
  const countPage = Math.ceil((store?.count || products.length) / perPage);
  const curPage = Number(page) || 1;

  const heroImg = hero?.imageUrl;

  return (
    <div>
      {/* ---------- HERO — bright, asymmetric, glow orb ---------- */}
      <section style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${BG} 0%, #FDEFD8 55%, ${AL} 100%)`, borderBottom: `1px solid ${BD}` }}>
        {heroImg && (
          <>
            <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(252,248,241,.94) 0%, rgba(252,248,241,.7) 45%, rgba(251,235,214,.35) 100%)' }} />
          </>
        )}
        <div style={{ ...container, position: 'relative', minHeight: 'clamp(460px, 62vh, 660px)', display: 'flex', alignItems: 'center', padding: '3rem 1.5rem' }}>
          <div className="lm-hero-grid" style={{ width: '100%' }}>
            <div style={{ maxWidth: 620, marginInlineEnd: 'auto' }}>
              <span className="hero-badge" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, background: SURF, color: AD,
                border: `1px solid ${BD}`, padding: '7px 15px', borderRadius: 999, fontSize: '.82rem', fontWeight: 800,
                animation: 'lmScaleIn .5s ease .1s both', boxShadow: `0 4px 16px rgba(${GLOW}, .28)`,
              }}>
                <Lightbulb size={15} color={A} fill={A} /> {t.heroBadge}
              </span>
              <h1 style={{
                fontSize: 'clamp(2.1rem, 5.5vw, 4rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-.02em',
                margin: '18px 0 0', color: TXT, animation: 'lmFadeUp .7s ease .15s both',
              }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(hero?.title || store?.name || '') }} />
              {hero?.subtitle && (
                <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: SUB, lineHeight: 1.65, margin: '18px 0 0', maxWidth: 520, animation: 'lmFadeUp .7s ease .3s both' }}>
                  {hero.subtitle}
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30, animation: 'lmFadeUp .7s ease .45s both' }}>
                <a href="#products" style={{ ...btnPrimary, width: 'auto' }} className="lm-btn lm-cta-glow">
                  {t.shopNow} <ChevronRight size={18} style={{ transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
                </a>
                {cartEnabled && (
                  <Link href="/cart" style={{ ...btnGhost, width: 'auto' }} className="lm-btn">
                    <ShoppingBag size={17} /> {t.cart}
                  </Link>
                )}
              </div>
            </div>

            {/* Signature glow orb — the "lamplight" */}
            <div className="lm-hide-mobile" style={{ position: 'relative', height: 360 }}>
              <div className="lm-glow-orb" style={{
                position: 'absolute', top: '50%', insetInlineEnd: 20, transform: 'translateY(-50%)',
                width: 300, height: 300, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, rgba(${GLOW}, .95), rgba(217,130,43,.55) 40%, rgba(217,130,43,0) 72%)`,
                filter: 'blur(2px)',
              }} />
              <div className="lm-glow-orb" style={{
                position: 'absolute', top: '50%', insetInlineEnd: 90, transform: 'translateY(-50%)',
                width: 150, height: 150, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: SURF, boxShadow: `0 20px 60px rgba(${GLOW}, .5)`, animationDelay: '.6s',
              }}>
                <Lightbulb size={62} color={A} fill={A} strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- TRUST BAR ---------- */}
      <section style={{ ...container, padding: '2.4rem 1.5rem' }}>
        <div className="lm-trust">
          {t.trust.map((it, i) => {
            const Icon = trustIcons[i] || Truck;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, background: SURF, border: `1px solid ${BD}`, borderRadius: 16, padding: '15px 16px' }}>
                <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: AL, display: 'grid', placeItems: 'center' }}>
                  <Icon size={21} color={A} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '.9rem' }}>{it.t}</p>
                  <p style={{ margin: 0, fontSize: '.78rem', color: SUB }}>{it.s}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- CATEGORIES (URL nav only, §8) ---------- */}
      {cats.length > 0 && (
        <section style={{ ...container, padding: '0 1.5rem 1rem' }}>
          <h2 className="lm-display" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', margin: '0 0 16px' }}>{t.categoriesTitle}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link href="/" style={catChip(!activeCategory)}>{t.all}</Link>
            {cats.map((c) => (
              <Link key={c.id} href={`?category=${c.id}`} style={catChip(activeCategory === String(c.id))}>{c.name}</Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- PRODUCTS ---------- */}
      <section id="products" style={{ ...container, padding: '1.5rem 1.5rem 3rem' }}>
        <h2 className="lm-display" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', margin: '0 0 20px' }}>{t.productsTitle}</h2>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: SUB }}>
            <Lightbulb size={48} color={BD} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '1.05rem' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="lm-products">
            {products.map((p, i) => {
              const orig = Number(p.priceOriginal || 0);
              const price = Number(p.price);
              const discount = orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
              return (
                <div key={p.id} style={{ animationDelay: `${(i % 8) * 0.06}s` }}>
                  <Card product={p} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={discount} store={store} />
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40, flexWrap: 'wrap' }}>
            {Array.from({ length: countPage }).map((_, i) => {
              const pnum = i + 1;
              const active = pnum === curPage;
              return (
                <Link key={pnum} href={{ query: { ...Object.fromEntries(searchParams.entries()), page: pnum } }} scroll={false}
                  style={{
                    minWidth: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12,
                    background: active ? A : SURF, color: active ? '#fff' : TXT, fontWeight: 800,
                    border: `1px solid ${active ? A : BD}`, textDecoration: 'none', fontSize: '.9rem',
                    boxShadow: active ? `0 6px 18px rgba(${GLOW}, .45)` : 'none',
                  }}>{pnum}</Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function catChip(active: boolean): React.CSSProperties {
  return {
    padding: '9px 18px', borderRadius: 999, textDecoration: 'none', fontSize: '.88rem', fontWeight: 700,
    background: active ? A : SURF, color: active ? '#fff' : TXT,
    border: `1.5px solid ${active ? A : BD}`, transition: 'all .2s',
    boxShadow: active ? `0 6px 16px rgba(${GLOW}, .4)` : 'none',
  };
}

/* ============================================================================
   PRODUCT FORM  (§10) — delivery contract, buttons, validation
   ========================================================================== */
export function ProductForm({ product, userId, domain, store: storeprop, selectedOffer, setSelectedOffer, selectedVariants, platform }: any) {
  const store = storeprop || product?.store;      // §25 — language from real store prop
  const t = T[getLang(store)];
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

  const cartEnabled = store?.cart !== false;
  const uid = userId || store?.user?.id || product?.store?.userId;

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerEmail: '', customerWhatsapp: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (uid) fetchWilayas(uid).then(setWilayas); }, [uid]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);


  const getVarId = (): string | number | undefined => {
    const vd = product.variantDetails?.find((d: VariantDetail) => variantMatches(d, selectedVariants || {}));
    return vd?.id;
  };

  const getSelectedOff = () =>
    selectedOffer ? product.offers?.find((o: Offer) => String(o.id) === String(selectedOffer)) : undefined;

  const getFP = (): number => {
    const off = getSelectedOff();
    if (off) return Number(off.price);
    const vd = product.variantDetails?.find((d: VariantDetail) => variantMatches(d, selectedVariants || {}));
    if (vd && Number(vd.price) !== -1) return Number(vd.price);
    return Number(product.price);
  };

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));  // §7/§17 String coercion

  const fp = getFP();
  const supportQty = (store?.supportQty ?? product?.store?.supportQty) !== false;
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = getSelectedOff();
  const orderFreeShipping = !!(product.shippingFree || selOfferObj?.shippingFree ||
    (store?.supportFreeShipping && store?.freeShippingMinAmount != null && (fp * qty) >= Number(store.freeShippingMinAmount)));

  const getLiv = useCallback((): number => {
    if (product.isDigital) return 0;
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);  // §10 Number coercion
  }, [selW, fd.typeLivraison, orderFreeShipping, product.isDigital]);

  const total = () => fp * qty + getLiv();

  const set = (k: string, v: any) => setFd((s) => ({ ...s, [k]: v }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.replace(/\s/g, ''))) e.customerPhone = t.errPhone;
    if (product.isDigital) {
      if (contactMethod === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.customerEmail.trim())) e.customerEmail = t.errEmail;
      } else {
        if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerWhatsapp.trim())) e.customerWhatsapp = t.errWhatsapp;
      }
    } else {
      if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
      if (!fd.customerCommune) e.customerCommune = t.errCommune;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => {
    const { customerWelaya, customerCommune, typeLivraison, priceLoss, customerEmail, customerWhatsapp, ...rest } = fd;
    const shippingOrContact = product.isDigital
      ? (contactMethod === 'email' ? { customerEmail } : { customerWhatsapp })
      : { customerWelaya, customerCommune, typeLivraison, priceLoss };
    return {
      ...rest,
      ...shippingOrContact,
      quantity: qty,
      product,
      productId: product.id,
      storeId: store?.id || product?.store?.id,
      userId: uid,
      variantDetailId: getVarId(),
      selectedOffer,
      selectedVariants,
      platform,
      finalPrice: fp,
      totalPrice: total(),
      priceLivraison: getLiv(),   // §10 — separate field, never folded into totalPrice
      addedAt: new Date().toISOString(),
    };
  };

  const addToCart = () => {           // §14 — NO validate() here
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error('failed');
      try { localStorage.setItem('customerId', fd.customerId || fd.customerPhone); } catch { /* noop */ }
      router.push(`/successfully?productId=${product.id}`);
    } catch {
      setErrors((e) => ({ ...e, submit: t.errSubmit }));
      setSubmitting(false);
    }
  };

  const chevStyle: React.CSSProperties = { position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB };

  const summaryRows = [
    { l: t.price, v: `${fmt(fp)} ${cur(store)}` },
    { l: t.qty, v: `× ${qty}` },
    ...(product.isDigital ? [] : [{ l: t.delivery, v: !selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${fmt(getLiv())} ${cur(store)}` }]),
  ];

  return (
    <div style={{ background: SURF, border: `1px solid ${BD}`, borderRadius: 20, padding: '1.4rem', boxShadow: `0 10px 34px -18px rgba(${GLOW}, .5)` }}>
      {/* Quantity */}
      {supportQty && !product.isDigital && (
        <>
          <label style={{ fontSize: '.8rem', fontWeight: 800, color: SUB, textTransform: 'uppercase', letterSpacing: '.04em' }}>{t.qty}</label>
          <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${BD}`, borderRadius: 12, overflow: 'hidden', width: 'fit-content', margin: '8px 0 18px', background: SURF2 }}>
            <button onClick={() => set('quantity', Math.max(1, fd.quantity - 1))} style={qtyBtn}><Minus size={16} /></button>
            <span style={{ minWidth: 46, textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>{fd.quantity}</span>
            <button onClick={() => set('quantity', fd.quantity + 1)} style={qtyBtn}><Plus size={16} /></button>
          </div>
        </>
      )}

      {/* Order-now fields */}
      {(isOrderNow || product.isDigital) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18, animation: 'lmFadeIn .25s ease' }}>
          <Field label={t.fullName} error={errors.customerName}>
            <input className="lm-input" style={{ ...inputBase, ...(errors.customerName ? { borderColor: '#EF4444' } : {}) }}
              placeholder={t.fullNamePlaceholder} value={fd.customerName} onChange={(e) => set('customerName', e.target.value)} />
          </Field>
          <Field label={t.phone} error={errors.customerPhone}>
            <input className="lm-input" dir="ltr" style={{ ...inputBase, ...(errors.customerPhone ? { borderColor: '#EF4444' } : {}) }}
              placeholder={t.phonePlaceholder} value={fd.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} />
          </Field>

          {product.isDigital ? (
            <div>
              <label style={{ fontSize: '.8rem', fontWeight: 800, color: SUB, textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6 }}>{t.contactQuestion}</label>
              <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${BD}`, marginBottom: 10 }}>
                <button type="button" onClick={() => { setContactMethod('email'); setFd(p => ({ ...p, customerWhatsapp: '' })); }}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.8rem', fontWeight: 800, background: contactMethod === 'email' ? A : 'transparent', color: contactMethod === 'email' ? '#fff' : SUB }}>
                  <Mail size={14} />{t.contactViaEmail}
                </button>
                <button type="button" onClick={() => { setContactMethod('whatsapp'); setFd(p => ({ ...p, customerEmail: '' })); }}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.8rem', fontWeight: 800, background: contactMethod === 'whatsapp' ? A : 'transparent', color: contactMethod === 'whatsapp' ? '#fff' : SUB }}>
                  <MessageCircle size={14} />{t.contactViaWhatsapp}
                </button>
              </div>
              {contactMethod === 'email' ? (
                <Field label={t.orderEmail} error={errors.customerEmail}>
                  <input className="lm-input" type="email" dir="ltr" style={{ ...inputBase, ...(errors.customerEmail ? { borderColor: '#EF4444' } : {}) }}
                    placeholder={t.emailPh} value={fd.customerEmail} onChange={(e) => set('customerEmail', e.target.value)} />
                </Field>
              ) : (
                <Field label={t.whatsapp} error={errors.customerWhatsapp}>
                  <input className="lm-input" type="tel" dir="ltr" style={{ ...inputBase, ...(errors.customerWhatsapp ? { borderColor: '#EF4444' } : {}) }}
                    placeholder={t.whatsappPh} value={fd.customerWhatsapp} onChange={(e) => set('customerWhatsapp', e.target.value)} />
                </Field>
              )}
            </div>
          ) : (
            <>
              <div className="lm-row2">
                <Field label={t.wilaya} error={errors.customerWelaya}>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={14} style={chevStyle} />
                    <select className="lm-input" disabled={wilayas.length === 0}
                      style={{ ...inputBase, paddingInlineEnd: 34, ...(errors.customerWelaya ? { borderColor: '#EF4444' } : {}) }}
                      value={fd.customerWelaya} onChange={(e) => { set('customerWelaya', e.target.value); set('customerCommune', ''); }}>
                      <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                      {wilayas.map((w) => (
                        <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                      ))}
                    </select>
                  </div>
                </Field>
                <Field label={t.commune} error={errors.customerCommune}>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={14} style={chevStyle} />
                    <select className="lm-input" disabled={!fd.customerWelaya || loadingC}
                      style={{ ...inputBase, paddingInlineEnd: 34, ...(errors.customerCommune ? { borderColor: '#EF4444' } : {}) }}
                      value={fd.customerCommune} onChange={(e) => set('customerCommune', e.target.value)}>
                      <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                      {communes.map((c) => (
                        <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                      ))}
                    </select>
                  </div>
                </Field>
              </div>

              {/* Delivery type toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['home', 'office'] as const).map((tp) => {
                  const on = fd.typeLivraison === tp;
                  return (
                    <button key={tp} onClick={() => set('typeLivraison', tp)}
                      style={{
                        padding: '12px', borderRadius: 12, fontWeight: 800, fontSize: '.85rem', cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all .2s',
                        background: on ? AL : 'transparent', color: on ? AD : SUB, border: `1.5px solid ${on ? A : BD}`,
                      }}>
                      {tp === 'home' ? t.deliveryHome : t.deliveryOffice}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* SUMMARY — §24: after fields+toggle, before buttons */}
      <div style={{ background: SURF2, borderRadius: 14, padding: '14px 16px', marginBottom: 16, border: `1px solid ${BD}` }}>
        {summaryRows.map((r) => (
          <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ flexShrink: 0, color: SUB, fontSize: '.88rem', fontWeight: 600 }}>{r.l}</span>
            <span style={{ whiteSpace: 'nowrap', fontWeight: 700, fontSize: '.9rem' }}>{r.v}</span>
          </div>
        ))}
        <div style={{ height: 1, background: BD, margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span style={{ flexShrink: 0, fontWeight: 800, fontSize: '.95rem' }}>{t.total}</span>
          <span style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: '1.25rem', color: A }}>{fmt(total())} {cur(store)}</span>
        </div>
      </div>

      {errors.submit && (
        <p style={{ fontSize: '.8rem', color: '#EF4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
          <AlertCircle size={13} /> {errors.submit}
        </p>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(!isOrderNow && !product.isDigital) ? (
          <>
            <button onClick={() => setIsOrderNow(true)} className="lm-btn lm-cta-glow" style={btnPrimary}>
              <Check size={18} /> {t.orderNow}
            </button>
            {cartEnabled && (
              <button onClick={addToCart} className="lm-btn" style={btnGhost}>
                <ShoppingBag size={17} /> {t.addToCart}
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={submitOrder} disabled={submitting} className="lm-btn" style={btnPrimary}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            {!product.isDigital && (
              <button onClick={() => setIsOrderNow(false)} disabled={submitting} className="lm-btn"
                style={{ ...btnGhost, borderColor: BD, color: SUB }}>
                {t.cancel}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const qtyBtn: React.CSSProperties = {
  width: 42, height: 42, display: 'grid', placeItems: 'center', background: 'transparent',
  border: 'none', cursor: 'pointer', color: TXT,
};

function Field({ label, error, children }: any) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 800, color: SUB, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</label>
      {children}
      {error && (
        <p style={{ fontSize: '.74rem', color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

/* ============================================================================
   DETAILS  (§9)
   ========================================================================== */
export function Details({ product, store: storeprop, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const store = storeprop || product?.store;             // §25
  const t = T[getLang(store)];
  const [sel, setSel] = useState(0);

  const images: any[] = (allImages && allImages.length ? allImages : product?.imagesProduct || [])
    .map((im: any) => (typeof im === 'string' ? im : im?.imageUrl))
    .filter(Boolean);
  const gallery = images.length ? images : (product?.productImage ? [product.productImage] : []);
  const mainImg = gallery[sel];

  const attrs: Attribute[] = allAttrs || product?.attributes || [];
  const price = Number(finalPrice ?? product?.price);
  const orig = Number(product?.priceOriginal || 0);

  const nav = (dir: number) => setSel((s) => (gallery.length ? (s + dir + gallery.length) % gallery.length : 0));

  return (
    <div style={{ ...container, padding: '2rem 1.5rem 3.5rem' }}>
      <div className="lm-details">
        {/* Gallery — warm-framed, generous */}
        <div>
          <div style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 22, overflow: 'hidden', background: SURF, border: `1px solid ${BD}`, boxShadow: `0 20px 50px -22px rgba(${GLOW}, .55)` }}>
            <ProductImg src={mainImg} alt={product?.name} />
            {discount > 0 && (
              <span style={{ position: 'absolute', top: 16, insetInlineStart: 16, background: A, color: '#fff', fontSize: '.8rem', fontWeight: 800, padding: '6px 12px', borderRadius: 999, boxShadow: `0 4px 14px rgba(${GLOW}, .55)` }}>-{discount}%</span>
            )}
            {gallery.length > 1 && (
              <>
                <button onClick={() => nav(-1)} style={galBtn('start')} aria-label="prev">{t.dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</button>
                <button onClick={() => nav(1)} style={galBtn('end')} aria-label="next">{t.dir === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}</button>
              </>
            )}
          </div>
          {gallery.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {gallery.map((im: string, i: number) => (
                <button key={i} onClick={() => setSel(i)}
                  style={{ width: 68, height: 68, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', padding: 0, background: SURF2, border: `2px solid ${i === sel ? A : BD}`, boxShadow: i === sel ? `0 0 14px rgba(${GLOW}, .5)` : 'none' }}>
                  <ProductImg src={im} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info + form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Stars n={5} size={16} />
            <h1 className="lm-display" style={{ fontSize: 'clamp(1.6rem, 3.4vw, 2.3rem)', fontWeight: 700, margin: '10px 0 0', lineHeight: 1.2 }}>{product?.name}</h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.9rem', fontWeight: 800, color: A }}>{fmt(price)} {cur(store)}</span>
              {orig > price && <span style={{ fontSize: '1.05rem', color: SUB, textDecoration: 'line-through' }}>{fmt(orig)} {cur(store)}</span>}
            </div>
          </div>

          {(product?.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
            <div style={{ padding: '12px 16px', borderRadius: 14, background: AL, border: `1.5px solid ${A}`, fontSize: '.85rem', fontWeight: 700, color: AD }}>
              🚚 {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', `${fmt(Number(store.freeShippingMinAmount))} ${cur(store)}`)}
            </div>
          )}

          {/* Offers as glow-chips */}
          {product?.offers?.length > 0 && (
            <div>
              <h3 style={{ fontSize: '.8rem', fontWeight: 800, color: SUB, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 10px' }}>{t.offersTitle}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o: Offer) => {
                  const on = String(selectedOffer) === String(o.id);
                  return (
                    <button key={o.id} onClick={() => setSelectedOffer && setSelectedOffer(on ? null : o.id)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '13px 16px',
                        borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'start', transition: 'all .2s',
                        background: on ? AL : SURF, border: `1.5px solid ${on ? A : BD}`, color: TXT,
                        boxShadow: on ? `0 6px 18px rgba(${GLOW}, .35)` : 'none',
                      }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${on ? A : BD}`, display: 'grid', placeItems: 'center' }}>
                          {on && <span style={{ width: 9, height: 9, borderRadius: '50%', background: A }} />}
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 700, fontSize: '.92rem' }}>{o.name}</span>
                          {o.subTitle && <span style={{ fontWeight: 500, fontSize: '.76rem', color: SUB }}>{o.subTitle}</span>}
                          {o.shippingFree && <span style={{ fontWeight: 700, fontSize: '.76rem', color: A }}>🚚 {t.freeShippingBadge}</span>}
                        </span>
                      </span>
                      <span style={{ fontWeight: 800, color: A, whiteSpace: 'nowrap' }}>{fmt(Number(o.price))} {cur(store)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attributes */}
          {attrs.map((attr) => (
            <div key={attr.id}>
              <h3 style={{ fontSize: '.8rem', fontWeight: 800, color: SUB, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 10px' }}>{attr.name}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {attr.variants?.map((v) => {
                  const on = selectedVariants?.[attr.name] === v.value;
                  const mode = attr.displayMode || 'text';
                  const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                    Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                      ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                    )
                  );
                  if (mode === 'color') {
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection && handleVariantSelection(attr.name, v.value)} title={v.name}
                        style={{ width: 40, height: 40, borderRadius: '50%', cursor: available ? 'pointer' : 'not-allowed', background: v.value, border: `2px solid ${on ? A : BD}`, boxShadow: on ? `0 0 0 3px ${AL}` : 'none', opacity: available ? 1 : 0.35 }} />
                    );
                  }
                  if (mode === 'image') {
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection && handleVariantSelection(attr.name, v.value)} title={v.name}
                        style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', padding: 0, cursor: available ? 'pointer' : 'not-allowed', background: SURF2, border: `2px solid ${on ? A : BD}`, opacity: available ? 1 : 0.35 }}>
                        <ProductImg src={v.value} alt={v.name} />
                      </button>
                    );
                  }
                  return (
                    <button key={v.id} onClick={() => available && handleVariantSelection && handleVariantSelection(attr.name, v.value)}
                      style={{ padding: '10px 16px', borderRadius: 12, cursor: available ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem', transition: 'all .2s', background: on ? AL : SURF, color: on ? AD : (available ? TXT : '#bbb'), border: `1.5px solid ${on ? A : BD}`, textDecoration: available ? 'none' : 'line-through' }}>
                      {v.name || v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Order form — §26 forward real domain */}
          <ProductForm
            product={product} store={store} userId={store?.user?.id || product?.store?.userId}
            domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants} platform="web" />
        </div>
      </div>

      {/* Description — its own warm panel */}
      {product?.desc && (
        <div style={{ marginTop: 40, background: SURF, border: `1px solid ${BD}`, borderRadius: 20, padding: '1.8rem' }}>
          <h2 className="lm-display" style={{ fontSize: '1.4rem', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 6, height: 24, borderRadius: 3, background: A, display: 'inline-block' }} />
            {t.descTitle}
          </h2>
          <div style={{ fontSize: '.95rem', lineHeight: 1.8, color: TXT }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
        </div>
      )}
    </div>
  );
}

function galBtn(side: 'start' | 'end'): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: 12,
    width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.9)', border: `1px solid ${BD}`,
    display: 'grid', placeItems: 'center', cursor: 'pointer', color: TXT, boxShadow: '0 4px 14px rgba(58,46,36,.14)',
  } as React.CSSProperties;
}

/* ============================================================================
   CART  (§11)
   ========================================================================== */
export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const initCount = useCartStore((s: any) => s.initCount);

  const [items, setItems] = useState<any[]>([]);
  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const uid = store?.user?.id;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      setItems(raw ? JSON.parse(raw) : []);
    } catch { setItems([]); }
  }, [domain]);

  useEffect(() => { if (uid) fetchWilayas(uid).then(setWilayas); }, [uid]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));   // §17
  const cartTotal = items.reduce((s, it) => s + Number(it.finalPrice ?? it.product?.price ?? 0) * Number(it.quantity || 1), 0);

  const hasFreeShippingItem = items.some((it) => it.product?.shippingFree || it.product?.offers?.find((o: Offer) => String(o.id) === String(it.selectedOffer))?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;

  const getLiv = (): number => {
    if (freeShippingReached) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);  // §10
  };

  const finalTotal = cartTotal + getLiv();

  const set = (k: string, v: any) => setFd((s) => ({ ...s, [k]: v }));

  const removeItem = (i: number) => {
    const next = items.filter((_, idx) => idx !== i);
    setItems(next);
    try { localStorage.setItem(domain, JSON.stringify(next)); } catch { /* noop */ }
    initCount(next.length);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.replace(/\s/g, ''))) e.customerPhone = t.errPhone;
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
        ...it, ...fd,
        priceLivraison: getLiv(),                                  // §10 per line
        totalPrice: Number(it.finalPrice ?? it.product?.price ?? 0) * Number(it.quantity || 1) + getLiv(),
      }));
      const res = await fetch(`${API_URL}/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders, ...fd, priceLivraison: getLiv() }),
      });
      if (!res.ok) throw new Error('failed');
      try { localStorage.removeItem(domain); } catch { /* noop */ }
      initCount(0);
      setSuccess(true);
    } catch {
      setErrors((e) => ({ ...e, submit: t.errSubmit }));
      setSubmitting(false);
    }
  };

  const chevStyle: React.CSSProperties = { position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB };

  if (success) {
    return (
      <div style={{ ...container, padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: AL, display: 'grid', placeItems: 'center', margin: '0 auto 22px', boxShadow: `0 0 40px rgba(${GLOW}, .45)` }}>
          <Check size={44} color={A} strokeWidth={2.5} />
        </div>
        <h1 className="lm-display" style={{ fontSize: '1.8rem', margin: '0 0 10px' }}>{t.successTitle}</h1>
        <p style={{ color: SUB, marginBottom: 28 }}>{t.successDesc}</p>
        <Link href="/" style={{ ...btnPrimary, width: 'auto', display: 'inline-flex' }} className="lm-btn">{t.backToShop}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ ...container, padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: SURF2, display: 'grid', placeItems: 'center', margin: '0 auto 22px' }}>
          <ShoppingBag size={40} color={BD} />
        </div>
        <h1 className="lm-display" style={{ fontSize: '1.7rem', margin: '0 0 8px' }}>{t.cartEmpty}</h1>
        <p style={{ color: SUB, marginBottom: 28 }}>{t.cartEmptyDesc}</p>
        <Link href="/" style={{ ...btnPrimary, width: 'auto', display: 'inline-flex' }} className="lm-btn">{t.shopNow}</Link>
      </div>
    );
  }

  return (
    <div style={{ ...container, padding: '2rem 1.5rem 3.5rem' }}>
      <h1 className="lm-display" style={{ fontSize: 'clamp(1.6rem,3vw,2.1rem)', margin: '0 0 24px' }}>{t.myCart}</h1>
      {freeShippingMin != null && (
        <div style={{
          border: `1.5px solid ${freeShippingReached ? A : BD}`, borderRadius: 14,
          background: freeShippingReached ? AL : SURF, padding: '12px 16px', marginBottom: 20,
          color: freeShippingReached ? AD : SUB, fontSize: '.85rem', fontWeight: 700,
        }}>
          {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', `${fmt(Number(freeShippingRemainingAmt))} ${cur(store)}`)}
        </div>
      )}
      <div className="lm-cart">
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it, i) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            const line = Number(it.finalPrice ?? it.product?.price ?? 0) * Number(it.quantity || 1);
            return (
              <div key={i} style={{ display: 'flex', gap: 14, background: SURF, border: `1px solid ${BD}`, borderRadius: 18, padding: 14, alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: SURF2 }}>
                  <ProductImg src={img} alt={it.product?.name} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.product?.name}</p>
                  <p style={{ margin: '4px 0 0', color: SUB, fontSize: '.82rem' }}>{t.qty}: {it.quantity}</p>
                  <p style={{ margin: '6px 0 0', color: A, fontWeight: 800, whiteSpace: 'nowrap' }}>{fmt(line)} {cur(store)}</p>
                </div>
                <button onClick={() => removeItem(i)} aria-label="delete"
                  style={{ width: 40, height: 40, borderRadius: 10, background: SURF2, border: `1px solid ${BD}`, cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#C0392B', flexShrink: 0 }}>
                  <Trash2 size={17} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Checkout */}
        <div style={{ background: SURF, border: `1px solid ${BD}`, borderRadius: 20, padding: '1.5rem', boxShadow: `0 12px 34px -20px rgba(${GLOW}, .5)` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label={t.fullName} error={errors.customerName}>
              <input className="lm-input" style={{ ...inputBase, ...(errors.customerName ? { borderColor: '#EF4444' } : {}) }}
                placeholder={t.fullNamePlaceholder} value={fd.customerName} onChange={(e) => set('customerName', e.target.value)} />
            </Field>
            <Field label={t.phone} error={errors.customerPhone}>
              <input className="lm-input" dir="ltr" style={{ ...inputBase, ...(errors.customerPhone ? { borderColor: '#EF4444' } : {}) }}
                placeholder={t.phonePlaceholder} value={fd.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} />
            </Field>
            <div className="lm-row2">
              <Field label={t.wilaya} error={errors.customerWelaya}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={14} style={chevStyle} />
                  <select className="lm-input" disabled={wilayas.length === 0}
                    style={{ ...inputBase, paddingInlineEnd: 34, ...(errors.customerWelaya ? { borderColor: '#EF4444' } : {}) }}
                    value={fd.customerWelaya} onChange={(e) => { set('customerWelaya', e.target.value); set('customerCommune', ''); }}>
                    <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                    {wilayas.map((w) => (
                      <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                    ))}
                  </select>
                </div>
              </Field>
              <Field label={t.commune} error={errors.customerCommune}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={14} style={chevStyle} />
                  <select className="lm-input" disabled={!fd.customerWelaya || loadingC}
                    style={{ ...inputBase, paddingInlineEnd: 34, ...(errors.customerCommune ? { borderColor: '#EF4444' } : {}) }}
                    value={fd.customerCommune} onChange={(e) => set('customerCommune', e.target.value)}>
                    <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                    {communes.map((c) => (
                      <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                    ))}
                  </select>
                </div>
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['home', 'office'] as const).map((tp) => {
                const on = fd.typeLivraison === tp;
                return (
                  <button key={tp} onClick={() => set('typeLivraison', tp)}
                    style={{ padding: '12px', borderRadius: 12, fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', background: on ? AL : 'transparent', color: on ? AD : SUB, border: `1.5px solid ${on ? A : BD}` }}>
                    {tp === 'home' ? t.deliveryHome : t.deliveryOffice}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: SURF2, borderRadius: 14, padding: '14px 16px', margin: '16px 0', border: `1px solid ${BD}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ flexShrink: 0, color: SUB, fontSize: '.88rem', fontWeight: 600 }}>{t.subtotal}</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 700, fontSize: '.9rem' }}>{fmt(cartTotal)} {cur(store)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ flexShrink: 0, color: SUB, fontSize: '.88rem', fontWeight: 600 }}>{t.delivery}</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 700, fontSize: '.9rem' }}>{!selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${fmt(getLiv())} ${cur(store)}`}</span>
            </div>
            <div style={{ height: 1, background: BD, margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ flexShrink: 0, fontWeight: 800 }}>{t.total}</span>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: '1.25rem', color: A }}>{fmt(finalTotal)} {cur(store)}</span>
            </div>
          </div>

          {errors.submit && (
            <p style={{ fontSize: '.8rem', color: '#EF4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={13} /> {errors.submit}
            </p>
          )}

          <button onClick={submit} disabled={submitting} className="lm-btn lm-cta-glow" style={btnPrimary}>
            {submitting ? t.sending : t.confirmOrder}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   SUCCESS
   ========================================================================== */
export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const stepIcons = [Check, Phone, Package, Truck];

  return (
    <div dir={t.dir} style={{ minHeight: '100vh', background: BG, padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', background: SURF, padding: '3rem 2rem', borderRadius: 16, border: `1px solid ${BD}`, marginBottom: '1.5rem' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: AL, display: 'grid', placeItems: 'center', margin: '0 auto 22px', boxShadow: `0 0 40px rgba(${GLOW}, .45)` }}>
            <Check size={44} color={A} strokeWidth={2.5} />
          </div>
          <h1 className="lm-display" style={{ fontSize: '1.8rem', margin: '0 0 10px' }}>{t.successTitle}</h1>
          <p style={{ color: SUB }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: SURF, borderRadius: 16, border: `1px solid ${BD}`, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', color: TXT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${BD}`, fontSize: 14, fontWeight: 700, color: TXT }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: SUB }}>{t.total}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: AD }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: SURF, borderRadius: 16, border: `1px solid ${BD}`, overflow: 'hidden', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? Check;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? `1px solid ${BD}` : 'none', background: done ? AL : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? A : BG, color: done ? '#fff' : SUB }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: done ? TXT : SUB, marginBottom: 2 }}>{step.title}</p>
                  <p style={{ fontSize: '0.76rem', color: SUB }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <Link href="/" style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }} className="lm-btn">{t.shopNow}</Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', borderRadius: 12, border: `1px solid ${BD}`, color: SUB, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   STATIC PAGES  (§12)
   ========================================================================== */
function Shell({ title, children }: any) {
  return (
    <div>
      <div style={{ background: DARK, color: '#FFF7EA', padding: '3rem 0' }}>
        <div style={{ ...container }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(240,168,74,.18)', display: 'grid', placeItems: 'center' }}>
              <Lightbulb size={22} color={A} fill={A} strokeWidth={1.5} />
            </span>
            <h1 className="lm-display" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', margin: 0 }}>{title}</h1>
          </div>
        </div>
      </div>
      <div style={{ ...container, padding: '2.5rem 1.5rem 3.5rem', maxWidth: 860 }}>{children}</div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ marginBottom: 24, background: SURF, border: `1px solid ${BD}`, borderRadius: 16, padding: '1.4rem 1.6rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px', color: TXT }}>{title}</h2>
      <p style={{ fontSize: '.94rem', lineHeight: 1.8, color: SUB, margin: 0 }}>{body}</p>
    </div>
  );
}

const STATIC_CONTENT = {
  ar: {
    privacy: [
      { title: 'جمع المعلومات', body: 'نجمع فقط المعلومات الضرورية لمعالجة طلبك: الاسم، رقم الهاتف، الولاية والبلدية. لا نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية.' },
      { title: 'استخدام البيانات', body: 'تُستخدم بياناتك حصراً لتأكيد الطلب وتنسيق التوصيل. يمكنك طلب حذف بياناتك في أي وقت عبر التواصل معنا.' },
      { title: 'الأمان', body: 'نتخذ إجراءات معقولة لحماية معلوماتك الشخصية من الوصول غير المصرّح به.' },
    ],
    terms: [
      { title: 'الطلبات', body: 'بتأكيدك للطلب فإنك توافق على الأسعار المعروضة وتكلفة التوصيل حسب ولايتك. الدفع يتم عند الاستلام.' },
      { title: 'التوصيل', body: 'يختلف وقت ومصاريف التوصيل حسب الولاية ونوع التوصيل (منزل أو مكتب). سنتواصل معك لتأكيد التفاصيل.' },
      { title: 'الإرجاع', body: 'يمكنك رفض الطلب عند الاستلام إذا كان المنتج تالفاً أو غير مطابق. للمزيد تواصل معنا.' },
    ],
    cookies: [
      { title: 'ما هي الكوكيز', body: 'الكوكيز ملفات صغيرة تساعدنا على تحسين تجربتك، مثل تذكّر محتويات سلتك أثناء التصفح.' },
      { title: 'التحكم', body: 'يمكنك تعطيل الكوكيز من إعدادات متصفحك، لكن بعض الميزات مثل السلة قد لا تعمل بشكل كامل.' },
    ],
  },
  fr: {
    privacy: [
      { title: 'Collecte des informations', body: 'Nous ne collectons que les informations nécessaires au traitement de votre commande : nom, téléphone, wilaya et commune. Vos données ne sont jamais partagées à des fins marketing.' },
      { title: 'Utilisation des données', body: 'Vos données servent uniquement à confirmer la commande et à organiser la livraison. Vous pouvez demander leur suppression à tout moment.' },
      { title: 'Sécurité', body: 'Nous prenons des mesures raisonnables pour protéger vos informations personnelles contre tout accès non autorisé.' },
    ],
    terms: [
      { title: 'Commandes', body: 'En confirmant votre commande, vous acceptez les prix affichés et les frais de livraison selon votre wilaya. Le paiement se fait à la livraison.' },
      { title: 'Livraison', body: 'Les délais et frais varient selon la wilaya et le type de livraison (domicile ou point relais). Nous vous contacterons pour confirmer.' },
      { title: 'Retours', body: 'Vous pouvez refuser la commande à la réception si le produit est endommagé ou non conforme. Contactez-nous pour plus de détails.' },
    ],
    cookies: [
      { title: 'Que sont les cookies', body: 'Les cookies sont de petits fichiers qui améliorent votre expérience, comme mémoriser le contenu de votre panier pendant la navigation.' },
      { title: 'Contrôle', body: 'Vous pouvez désactiver les cookies dans votre navigateur, mais certaines fonctions comme le panier pourraient ne pas fonctionner correctement.' },
    ],
  },
  en: {
    privacy: [
      { title: 'Information We Collect', body: 'We only collect what is needed to process your order: name, phone, wilaya and commune. Your data is never shared for marketing purposes.' },
      { title: 'How We Use Data', body: 'Your data is used solely to confirm the order and arrange delivery. You may request deletion of your data at any time by contacting us.' },
      { title: 'Security', body: 'We take reasonable measures to protect your personal information from unauthorized access.' },
    ],
    terms: [
      { title: 'Orders', body: 'By confirming your order you agree to the displayed prices and the delivery cost for your wilaya. Payment is made on delivery.' },
      { title: 'Delivery', body: 'Delivery time and cost vary by wilaya and delivery type (home or pickup). We will contact you to confirm the details.' },
      { title: 'Returns', body: 'You may refuse the order on delivery if the product is damaged or not as described. Contact us for more details.' },
    ],
    cookies: [
      { title: 'What Are Cookies', body: 'Cookies are small files that help improve your experience, such as remembering your cart contents while you browse.' },
      { title: 'Your Control', body: 'You can disable cookies in your browser settings, but some features like the cart may not work fully.' },
    ],
  },
};

export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  const blocks = STATIC_CONTENT[getLang(store)].privacy;
  return <Shell title={t.privacyTitle}>{blocks.map((b, i) => <InfoBlock key={i} {...b} />)}</Shell>;
}

export function Terms({ store }: any) {
  const t = T[getLang(store)];
  const blocks = STATIC_CONTENT[getLang(store)].terms;
  return <Shell title={t.termsTitle}>{blocks.map((b, i) => <InfoBlock key={i} {...b} />)}</Shell>;
}

export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  const blocks = STATIC_CONTENT[getLang(store)].cookies;
  return <Shell title={t.cookiesTitle}>{blocks.map((b, i) => <InfoBlock key={i} {...b} />)}</Shell>;
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const contact = store?.contact || {};

  const set = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    setBusy(true);
    try {
      await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      setSent(true);
    } catch { /* noop */ }
    setBusy(false);
  };

  return (
    <Shell title={t.contactTitle}>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: AL, display: 'grid', placeItems: 'center', margin: '0 auto 20px', boxShadow: `0 0 34px rgba(${GLOW}, .4)` }}>
            <Check size={38} color={A} strokeWidth={2.5} />
          </div>
          <h2 className="lm-display" style={{ fontSize: '1.5rem', margin: '0 0 8px' }}>{t.contactSuccess}</h2>
          <p style={{ color: SUB, marginBottom: 24 }}>{t.contactSuccessDesc}</p>
          <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }} className="lm-btn" style={{ ...btnGhost, width: 'auto', display: 'inline-flex' }}>{t.sendAnother}</button>
        </div>
      ) : (
        <div className="lm-contact">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {contact.phone && (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: SURF, border: `1px solid ${BD}`, borderRadius: 16, padding: '16px' }}>
                <span style={{ width: 46, height: 46, borderRadius: 12, background: AL, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Phone size={20} color={A} /></span>
                <div><p style={{ margin: 0, fontSize: '.78rem', color: SUB, fontWeight: 700 }}>{t.phone}</p><p style={{ margin: '2px 0 0', fontWeight: 700 }} dir="ltr">{contact.phone}</p></div>
              </div>
            )}
            {contact.email && (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: SURF, border: `1px solid ${BD}`, borderRadius: 16, padding: '16px' }}>
                <span style={{ width: 46, height: 46, borderRadius: 12, background: AL, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Mail size={20} color={A} /></span>
                <div><p style={{ margin: 0, fontSize: '.78rem', color: SUB, fontWeight: 700 }}>{t.emailLabel}</p><p style={{ margin: '2px 0 0', fontWeight: 700 }}>{contact.email}</p></div>
              </div>
            )}
            {(contact.wilaya || contact.address) && (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: SURF, border: `1px solid ${BD}`, borderRadius: 16, padding: '16px' }}>
                <span style={{ width: 46, height: 46, borderRadius: 12, background: AL, display: 'grid', placeItems: 'center', flexShrink: 0 }}><MapPin size={20} color={A} /></span>
                <div><p style={{ margin: 0, fontWeight: 700 }}>{[contact.wilaya, contact.address].filter(Boolean).join(' — ')}</p></div>
              </div>
            )}
          </div>

          <div style={{ background: SURF, border: `1px solid ${BD}`, borderRadius: 18, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="lm-row2">
              <Field label={t.fullName}>
                <input className="lm-input" style={inputBase} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t.fullNamePlaceholder} />
              </Field>
              <Field label={t.phone}>
                <input className="lm-input" dir="ltr" style={inputBase} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder={t.phonePlaceholder} />
              </Field>
            </div>
            <Field label={t.emailLabel}>
              <input className="lm-input" dir="ltr" style={inputBase} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label={t.contact}>
              <textarea className="lm-input" rows={5} style={{ ...inputBase, resize: 'none' }} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder={t.messagePlaceholder} />
            </Field>
            <button onClick={submit} disabled={busy} className="lm-btn" style={btnPrimary}>
              <Send size={17} /> {busy ? t.sending : t.sendMessage}
            </button>
          </div>
        </div>
      )}
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