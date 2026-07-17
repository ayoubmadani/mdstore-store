'use client';

// ============================================================================
// ROYAL SCENT & PERFUMES THEME
// NAVBAR ARCHETYPE : C — Floating Pill
// CARD ARCHETYPE   : 2 — Overlay Reveal
// HERO LAYOUT      : asymmetric (oversized headline overlapping image tile)
// TYPOGRAPHY PAIR  : Aref Ruqaa + Tajawal (ar) / Cormorant Garamond + Jost (fr/en)
// ============================================================================

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import {
  Search, X, ShoppingBag, Menu, Phone, Mail, MapPin, Star,
  ChevronLeft, ChevronRight, Trash2, Check, Minus, Plus,
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
    search: 'ابحث عن عطرك...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
    showAll: 'عرض كل النتائج →',
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'اكتشف المجموعة',
    trust: [
      { t: 'توصيل سريع', s: 'لكل الولايات' },
      { t: 'عطور أصلية', s: 'ضمان الجودة 100%' },
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
    nameLbl: 'الاسم الكامل', namePh: 'أدخل اسمك الكامل',
    emailLbl: 'البريد الإلكتروني', emailPh: 'email@example.com',
    phoneLbl: 'رقم الهاتف', phonePh: '0555 12 34 56',
    messageLbl: 'رسالتك', messagePh: 'كيف يمكننا مساعدتك؟',
    sendMsg: 'إرسال الرسالة',
    msgSentTitle: 'تم الإرسال بنجاح!', msgSentDesc: 'سنرد عليك في أقرب وقت ممكن.',
    sendAnother: 'إرسال رسالة أخرى',
    replyTime: 'نرد عادةً خلال ساعة',
    privacySections: [
      { h: 'الخصوصية وحماية البيانات', p: 'نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع معلوماتك واستخدامها عند تسوّقك في متجرنا.' },
      { h: 'البيانات التي نجمعها', p: 'نجمع المعلومات التي تقدّمها مباشرةً مثل الاسم الكامل ورقم الهاتف وعنوان التوصيل، وذلك حصراً لتنفيذ طلباتك.' },
      { h: 'حماية بياناتك', p: 'تُخزَّن بياناتك بشكل آمن ولا تُشارَك مع أي طرف ثالث دون موافقتك الصريحة.' },
    ],
    termsSections: [
      { h: 'القبول بالشروط', p: 'باستخدامك لهذا المتجر، فإنك توافق على هذه الشروط والأحكام. يُرجى قراءتها بعناية قبل إتمام أي طلب.' },
      { h: 'الطلبات والدفع', p: 'جميع الطلبات خاضعة للتوفر وتأكيد السعر. طريقة الدفع الافتراضية هي الدفع عند الاستلام ما لم يُذكر غير ذلك.' },
      { h: 'الإرجاع والاستبدال', p: 'يمكن إرجاع المنتجات خلال 7 أيام من تاريخ الاستلام، شريطة أن تكون غير مستعملة وفي تغليفها الأصلي.' },
    ],
    cookiesSections: [
      { h: 'ما هي ملفات تعريف الارتباط؟', p: 'نستخدم ملفات تعريف الارتباط (الكوكيز) لتحسين تجربة التصفح وتحليل حركة الموقع وتخصيص المحتوى.' },
      { h: 'أنواع الكوكيز المستخدمة', p: 'الكوكيز الأساسية ضرورية لعمل الموقع. الكوكيز التحليلية تساعدنا على فهم كيفية تفاعل الزوار مع المتجر.' },
      { h: 'إدارة الكوكيز', p: 'يمكنك التحكم في الكوكيز من خلال إعدادات متصفحك. تعطيل الكوكيز الأساسية قد يؤثر على بعض وظائف الموقع.' },
    ],
  },
  fr: {
    dir: 'ltr' as const,
    home: 'Accueil', contact: 'Contact', cart: 'Panier',
    search: 'Rechercher un parfum...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats →',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Découvrir la collection',
    trust: [
      { t: 'Livraison Rapide', s: 'Partout en Algérie' },
      { t: 'Parfums Authentiques', s: 'Qualité garantie 100%' },
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
    nameLbl: 'Nom complet', namePh: 'Votre nom complet',
    emailLbl: 'Email', emailPh: 'email@example.com',
    phoneLbl: 'Téléphone', phonePh: '0555 12 34 56',
    messageLbl: 'Message', messagePh: 'Comment pouvons-nous vous aider ?',
    sendMsg: 'Envoyer le message',
    msgSentTitle: 'Message envoyé !', msgSentDesc: 'Nous vous répondrons dans les plus brefs délais.',
    sendAnother: 'Envoyer un autre message',
    replyTime: 'Réponse sous une heure',
    privacySections: [
      { h: 'Confidentialité et protection des données', p: 'Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. Cette politique explique comment vos informations sont collectées et utilisées lorsque vous faites vos achats.' },
      { h: 'Données que nous collectons', p: 'Nous collectons les informations que vous fournissez directement, telles que votre nom complet, numéro de téléphone et adresse de livraison, uniquement pour traiter vos commandes.' },
      { h: 'Protection de vos données', p: 'Vos données sont stockées en toute sécurité et ne sont pas partagées avec des tiers sans votre consentement explicite.' },
    ],
    termsSections: [
      { h: 'Acceptation des conditions', p: 'En utilisant cette boutique, vous acceptez ces conditions générales. Veuillez les lire attentivement avant de passer une commande.' },
      { h: 'Commandes et paiement', p: 'Toutes les commandes sont soumises à disponibilité et confirmation du prix. Le paiement à la livraison est la méthode par défaut sauf indication contraire.' },
      { h: 'Retours et échanges', p: 'Les produits peuvent être retournés dans les 7 jours suivant la réception, à condition qu\'ils soient non utilisés et dans leur emballage d\'origine.' },
    ],
    cookiesSections: [
      { h: 'Que sont les cookies ?', p: 'Nous utilisons des cookies pour améliorer votre expérience de navigation, analyser le trafic du site et personnaliser le contenu.' },
      { h: 'Types de cookies utilisés', p: 'Les cookies essentiels sont nécessaires au fonctionnement du site. Les cookies analytiques nous aident à comprendre comment les visiteurs interagissent avec la boutique.' },
      { h: 'Gestion des cookies', p: 'Vous pouvez contrôler les cookies via les paramètres de votre navigateur. La désactivation des cookies essentiels peut affecter certaines fonctionnalités du site.' },
    ],
  },
  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart',
    search: 'Search fragrances...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results →',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Discover the Collection',
    trust: [
      { t: 'Fast Delivery', s: 'Across all wilayas' },
      { t: 'Authentic Fragrances', s: '100% quality guaranteed' },
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
    nameLbl: 'Full Name', namePh: 'Enter your full name',
    emailLbl: 'Email', emailPh: 'email@example.com',
    phoneLbl: 'Phone', phonePh: '0555 12 34 56',
    messageLbl: 'Message', messagePh: 'How can we help you?',
    sendMsg: 'Send Message',
    msgSentTitle: 'Message sent!', msgSentDesc: 'We will get back to you as soon as possible.',
    sendAnother: 'Send another message',
    replyTime: 'We usually reply within an hour',
    privacySections: [
      { h: 'Privacy & Data Protection', p: 'We respect your privacy and are committed to protecting your personal data. This policy explains how your information is collected and used when you shop with us.' },
      { h: 'Data We Collect', p: 'We collect information you provide directly, such as your full name, phone number, and delivery address, solely to process your orders.' },
      { h: 'Protecting Your Data', p: 'Your data is stored securely and is not shared with any third party without your explicit consent.' },
    ],
    termsSections: [
      { h: 'Acceptance of Terms', p: 'By using this store, you agree to these terms and conditions. Please read them carefully before placing any order.' },
      { h: 'Orders & Payment', p: 'All orders are subject to availability and price confirmation. Cash on delivery is the default payment method unless otherwise stated.' },
      { h: 'Returns & Exchanges', p: 'Products may be returned within 7 days of receipt, provided they are unused and in their original packaging.' },
    ],
    cookiesSections: [
      { h: 'What Are Cookies?', p: 'We use cookies to improve your browsing experience, analyze site traffic, and personalize content.' },
      { h: 'Types of Cookies Used', p: 'Essential cookies are required for the site to function. Analytics cookies help us understand how visitors interact with the store.' },
      { h: 'Managing Cookies', p: 'You can control cookies through your browser settings. Disabling essential cookies may affect some site functionality.' },
    ],
  },
} as const;

type TKeys = typeof T['ar'];

/* ============================== THEME DESIGN TOKENS ============================== */

const BG = '#0b0906';
const BG_ALT = '#161109';
const GOLD = '#c9a227';
const GOLD_LIGHT = '#e8c96a';
const CREAM = '#f4ead9';
const MUTED = 'rgba(244,234,217,0.62)';
const BORDER = 'rgba(201,162,39,0.28)';

const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');

.rsp-root { background:${BG}; color:${CREAM}; min-height:100vh; }
.rsp-root.lang-ar { font-family:'Tajawal', sans-serif; }
.rsp-root.lang-ar h1, .rsp-root.lang-ar h2, .rsp-root.lang-ar h3, .rsp-root.lang-ar .rsp-display { font-family:'Aref Ruqaa', serif; }
.rsp-root.lang-ltr { font-family:'Jost', sans-serif; }
.rsp-root.lang-ltr h1, .rsp-root.lang-ltr h2, .rsp-root.lang-ltr h3, .rsp-root.lang-ltr .rsp-display { font-family:'Cormorant Garamond', serif; }

.rsp-container { max-width:1280px; margin:0 auto; padding:0 1.5rem; }

/* Navbar — Floating Pill archetype */
.rsp-pill-wrap { position:sticky; top:0; z-index:200; display:flex; justify-content:center; padding:14px 12px; }
.rsp-pill {
  width:min(94%, 960px); background:rgba(15,11,7,0.72); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
  border:1px solid ${BORDER}; border-radius:999px; padding:8px 22px; display:flex; align-items:center; justify-content:space-between; gap:16px;
  box-shadow:0 8px 32px rgba(0,0,0,0.35); transition:background 0.3s ease, box-shadow 0.3s ease;
}
.rsp-pill.scrolled { background:rgba(11,9,6,0.92); box-shadow:0 10px 40px rgba(0,0,0,0.5); }
.rsp-pill-links { display:flex; align-items:center; gap:22px; }
.rsp-pill-links a { color:${MUTED}; font-size:0.85rem; letter-spacing:0.04em; text-decoration:none; position:relative; padding:4px 2px; }
.rsp-pill-links a:hover, .rsp-pill-links a.active { color:${GOLD_LIGHT}; }
@media (max-width:840px) { .rsp-pill-links { display:none; } .rsp-pill-burger { display:flex !important; } }
.rsp-pill-burger { display:none; }

.rsp-pill-search-wrap { position:relative; }
.rsp-desktop-search { position:relative; display:none; }
@media (min-width:840px) { .rsp-desktop-search { display:block; } .rsp-mobile-search-btn { display:none !important; } }
.rsp-pill-dropdown {
  position:absolute; inset-inline-end:0; top:calc(100% + 12px); width:340px; max-height:380px; overflow-y:auto;
  background:${BG_ALT}; border:1px solid ${BORDER}; border-radius:14px; box-shadow:0 20px 48px rgba(0,0,0,0.5); z-index:500;
}
@media (max-width:480px) { .rsp-pill-dropdown { position:fixed; inset-inline-start:12px; inset-inline-end:12px; width:auto; top:76px; } }
@media (max-width:480px) { .rsp-pill { padding:8px 12px; gap:10px; } }

.rsp-mobile-overlay { position:fixed; inset:0; z-index:300; background:rgba(4,3,2,0.92); backdrop-filter:blur(6px); display:flex; flex-direction:column; }

/* Card — Overlay Reveal archetype */
.rsp-card { position:relative; overflow:hidden; aspect-ratio:3/4; border-radius:4px; animation:rspFadeUp 0.5s ease both; }
.rsp-card-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform 0.6s ease; }
.rsp-card:hover .rsp-card-img { transform:scale(1.08); }
.rsp-card-badge { position:absolute; top:12px; inset-inline-start:12px; background:${GOLD}; color:${BG}; font-size:0.65rem; font-weight:700; padding:3px 10px; border-radius:2px; letter-spacing:0.06em; z-index:2; }
.rsp-card-body { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top, rgba(5,4,2,0.94) 0%, rgba(5,4,2,0.55) 55%, transparent 100%); padding:2rem 1.1rem 1.1rem; }
.rsp-card-name { color:#fff; font-weight:600; font-size:0.92rem; margin:0 0 6px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.rsp-card-price-row { display:flex; align-items:center; gap:10px; }
.rsp-card-price { color:${GOLD_LIGHT}; font-weight:700; font-size:1rem; white-space:nowrap; }
.rsp-card-price-old { color:rgba(255,255,255,0.45); text-decoration:line-through; font-size:0.8rem; white-space:nowrap; }
.rsp-card-stars { display:flex; gap:2px; margin-top:6px; }

.rsp-products-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0.75rem; }
@media (min-width:640px) { .rsp-products-grid { gap:1.1rem; } }
@media (min-width:1024px) { .rsp-products-grid { grid-template-columns:repeat(3,1fr); } }
@media (min-width:1280px) { .rsp-products-grid { grid-template-columns:repeat(4,1fr); } }

/* Category chips — active indicator: letter-spacing shift */
.rsp-cats { display:flex; gap:22px; flex-wrap:wrap; overflow-x:auto; padding:4px 0; }
.rsp-cat-link { color:${MUTED}; font-size:0.82rem; text-decoration:none; letter-spacing:0.04em; text-transform:uppercase; padding:6px 2px; white-space:nowrap; transition:letter-spacing 0.25s ease, color 0.25s ease; }
.rsp-cat-link.active { color:${GOLD_LIGHT}; letter-spacing:0.16em; font-weight:700; }

/* Hero — full-bleed background */
.rsp-hero { position:relative; min-height:clamp(480px, 80vh, 860px); display:flex; align-items:center; overflow:hidden; }
.rsp-hero-bg { position:absolute; inset:0; z-index:0; }
.rsp-hero-bg img { width:100%; height:100%; object-fit:cover; display:block; }
.rsp-hero-bg-overlay { position:absolute; inset:0; background:linear-gradient(160deg, rgba(11,9,6,0.85) 0%, rgba(11,9,6,0.5) 100%); }
.rsp-hero-grid { position:relative; z-index:2; width:100%; display:flex; flex-direction:column; justify-content:center; padding:3rem 0; }
.rsp-hero-title { font-size:clamp(2rem, 6vw, 5.5rem); line-height:1.1; margin:0 0 0.85rem; font-weight:700; animation:rspFadeUp 0.7s ease 0.1s both; max-width:750px; }
.rsp-hero-sub { font-size:clamp(1rem, 2vw, 1.2rem); color:${MUTED}; max-width:520px; margin-block:0 1.75rem; animation:rspFadeUp 0.7s ease 0.25s both; }
.rsp-hero-cta-row { display:flex; gap:14px; flex-wrap:wrap; animation:rspFadeUp 0.7s ease 0.4s both; }
@media (max-width:1023px) { .rsp-hero { min-height:clamp(400px,65vh,580px); } }

.rsp-btn-primary { background:${GOLD}; color:${BG}; border:none; padding:14px 32px; font-weight:700; letter-spacing:0.05em; border-radius:2px; cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease; min-height:48px; }
.rsp-btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 26px rgba(201,162,39,0.28); background:${GOLD_LIGHT}; }
.rsp-btn-primary:active { transform:translateY(0) scale(0.97); }
.rsp-btn-primary:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
.rsp-btn-outline { background:transparent; color:${CREAM}; border:1px solid ${BORDER}; padding:14px 32px; font-weight:600; letter-spacing:0.05em; border-radius:2px; cursor:pointer; transition:all 0.2s ease; min-height:48px; }
.rsp-btn-outline:hover { border-color:${GOLD}; color:${GOLD_LIGHT}; }

.rsp-trust-bar { display:grid; grid-template-columns:1fr; gap:1.5rem; padding:2.5rem 0; border-top:1px solid ${BORDER}; border-bottom:1px solid ${BORDER}; }
@media (min-width:480px) { .rsp-trust-bar { grid-template-columns:repeat(2,1fr); } }
@media (min-width:768px) { .rsp-trust-bar { grid-template-columns:repeat(4,1fr); } }
.rsp-trust-item { text-align:center; }
.rsp-trust-item strong { display:block; color:${GOLD_LIGHT}; font-size:0.95rem; margin-bottom:4px; }
.rsp-trust-item span { color:${MUTED}; font-size:0.8rem; }

.rsp-input-field { width:100%; background:${BG_ALT}; border:1px solid ${BORDER}; color:${CREAM}; padding:12px 14px; border-radius:4px; font-size:0.9rem; min-height:44px; transition:border-color 0.2s, box-shadow 0.2s; }
.rsp-input-field:focus { border-color:${GOLD}; box-shadow:0 0 0 3px rgba(201,162,39,0.15); outline:none; }
.rsp-input-field:disabled { opacity:0.5; }
.rsp-label { display:block; font-size:0.78rem; color:${MUTED}; margin-bottom:6px; letter-spacing:0.03em; }

.rsp-skeleton { background:linear-gradient(90deg, #1a1510 25%, #241d14 50%, #1a1510 75%); background-size:400px 100%; animation:rspShimmer 1.4s infinite linear; border-radius:4px; }

@keyframes rspFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes rspScaleIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
@keyframes rspShimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
@keyframes rspFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }

.rsp-fade-page { transition:opacity 0.3s ease; }

.rsp-addr-grid { display:grid; grid-template-columns:1fr; gap:12px; }
@media (min-width:480px) { .rsp-addr-grid { grid-template-columns:1fr 1fr; } }

.rsp-gallery-main { position:relative; aspect-ratio:1/1; border-radius:6px; overflow:hidden; }
@media (min-width:640px) { .rsp-gallery-main { aspect-ratio:4/5; } }

.rsp-details-pad { padding:1rem 1rem; }
@media (min-width:640px) { .rsp-details-pad { padding:2.5rem 1.5rem; } }
.rsp-details-inner { display:grid; grid-template-columns:1fr; gap:1.25rem; }
@media (min-width:768px) { .rsp-details-inner { grid-template-columns:1fr 1fr; gap:2.5rem; } }

.rsp-footer-deco { height:1px; background:linear-gradient(to right, transparent, ${GOLD}, transparent); }
.rsp-footer-grid { display:grid; grid-template-columns:1fr; gap:2rem; padding:3rem 0 2rem; }
@media (min-width:560px) { .rsp-footer-grid { grid-template-columns:1fr 1fr; } .rsp-footer-brand { grid-column:1/-1; } }
@media (min-width:768px) { .rsp-footer-grid { grid-template-columns:1.5fr 1fr 1fr; } .rsp-footer-brand { grid-column:auto; } }
.rsp-footer-link { color:${MUTED}; font-size:0.85rem; text-decoration:none; display:block; padding:4px 0; transition:color 0.2s; }
.rsp-footer-link:hover { color:${GOLD_LIGHT}; }
.rsp-footer-bottom { text-align:center; color:${MUTED}; font-size:0.75rem; border-top:1px solid ${BORDER}; padding-top:20px; padding-bottom:0.5rem; }

@media (prefers-reduced-motion: reduce) {
  .rsp-root * { animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; }
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
    <div className={`rsp-root ${t.dir === 'rtl' ? 'lang-ar' : 'lang-ltr'}`} dir={t.dir}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <main className="rsp-fade-page" style={{ opacity: visible ? 1 : 0 }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ============================== NAVBAR ============================== */
// NAVBAR ARCHETYPE: C — Floating Pill

export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
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
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: CREAM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
        <p style={{ fontSize: '0.78rem', color: GOLD_LIGHT, margin: 0, fontWeight: 700 }}>
          {Number(p.price).toLocaleString()} {store?.currency}
        </p>
      </div>
    </Link>
  );

  return (
    <div className="rsp-pill-wrap">
      <header className={`rsp-pill ${scrolled ? 'scrolled' : ''}`}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          {logoUrl && !imgError ? (
            <img src={logoUrl} alt={store?.name} onError={() => setImgError(true)}
              style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
          ) : (
            <span className="rsp-display" style={{ color: GOLD_LIGHT, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              {store?.name || 'Royal Scent'}
            </span>
          )}
        </Link>

        <nav className="rsp-pill-links">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>{t.home}</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>{t.contact}</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {/* Desktop search */}
          <div className="rsp-pill-search-wrap">
            <div className="rsp-desktop-search">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder={t.search}
                style={{ width: searchFocused ? 220 : 140, transition: 'width 0.3s ease', background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, borderRadius: 999, padding: '8px 14px', color: CREAM, fontSize: '0.8rem' }}
              />
              {listSearch.length > 0 && searchFocused && (
                <div className="rsp-pill-dropdown">
                  {loading && <p style={{ padding: '1rem', textAlign: 'center', color: MUTED, fontSize: '0.8rem' }}>{t.searching}</p>}
                  {listSearch.map((p) => <SearchResultRow key={p.id} p={p} />)}
                  <Link href={`/?search=${searchQuery}`} onClick={() => setSearchFocused(false)}
                    style={{ display: 'block', padding: '10px 16px', fontSize: '0.8rem', textAlign: 'center', color: GOLD_LIGHT, textDecoration: 'none' }}>
                    {t.showAll}
                  </Link>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setShowSearch(true)} aria-label={t.search} className="rsp-mobile-search-btn"
            style={{ background: 'none', border: 'none', color: CREAM, cursor: 'pointer', display: 'flex' }}>
            <Search size={19} />
          </button>

          {store?.cart !== false && (
            <Link href="/cart" style={{ position: 'relative', color: CREAM, display: 'flex' }}>
              <ShoppingBag size={19} />
              {count > 0 && (
                <span style={{ position: 'absolute', top: -8, insetInlineEnd: -8, background: GOLD, color: BG, fontSize: '0.65rem', fontWeight: 700, borderRadius: '50%', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {count}
                </span>
              )}
            </Link>
          )}

          <button className="rsp-pill-burger" onClick={() => setOpen(true)} aria-label="menu"
            style={{ background: 'none', border: 'none', color: CREAM, cursor: 'pointer' }}>
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div className="rsp-mobile-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 18 }}>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: CREAM, cursor: 'pointer' }}>
              <X size={26} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, marginTop: 40 }}>
            {mobileLinks.map((lnk) => (
              <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)}
                style={{ color: CREAM, fontSize: '1.3rem', textDecoration: 'none' }}>
                {lnk.l}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile search full-screen overlay */}
      {showSearch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(4,3,2,0.94)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div style={{ background: BG_ALT, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${BORDER}` }}>
            <Search size={20} color={MUTED} />
            <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: CREAM }} />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }}
              style={{ background: 'none', border: 'none', color: CREAM, cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: BG }}>
            {loading && <p style={{ padding: '1rem', textAlign: 'center', color: MUTED }}>{t.searching}</p>}
            {listSearch.map((p) => <SearchResultRow key={p.id} p={p} />)}
            {listSearch.length > 0 && (
              <Link href={`/?search=${searchQuery}`} onClick={() => setShowSearch(false)}
                style={{ display: 'block', padding: '14px', textAlign: 'center', background: BG_ALT, fontWeight: 600, color: GOLD_LIGHT, textDecoration: 'none' }}>
                {t.showAll}
              </Link>
            )}
            {searchQuery.length >= 2 && !loading && listSearch.length === 0 && (
              <p style={{ padding: '2rem', textAlign: 'center', color: MUTED }}>{t.noResults}</p>
            )}
          </div>
        </div>
      )}
    </div>
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
    <footer style={{ background: BG_ALT }}>
      <div className="rsp-footer-deco" />
      <div className="rsp-container">
        <div className="rsp-footer-grid">
          <div className="rsp-footer-brand">
            <h3 className="rsp-display" style={{ color: GOLD_LIGHT, fontSize: '1.5rem', margin: '0 0 12px' }}>
              {store?.name || 'Royal Scent'}
            </h3>
            {store?.hero?.subtitle && (
              <p style={{ color: MUTED, fontSize: '0.85rem', maxWidth: 300, lineHeight: 1.75, margin: 0 }}>
                {store.hero.subtitle}
              </p>
            )}
          </div>
          <div>
            <h4 style={{ color: CREAM, fontSize: '0.82rem', margin: '0 0 14px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t.quickLinks}
            </h4>
            {links.map((lnk) => (
              <Link key={lnk.h} href={lnk.h} className="rsp-footer-link">{lnk.l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: CREAM, fontSize: '0.82rem', margin: '0 0 14px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t.contactUs}
            </h4>
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
        <p className="rsp-footer-bottom">
          © {year} {store?.name || 'Royal Scent'} — {t.rightsReserved}
        </p>
      </div>
    </footer>
  );
}

/* ============================== CARD ============================== */
// CARD ARCHETYPE: 2 — Overlay Reveal

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const t = T[getLang(store)];
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product?.productImage || product?.imagesProduct?.[0]?.imageUrl;
  const price = Number(product?.price || 0).toLocaleString();
  const priceOriginal = product?.priceOriginal ? Number(product.priceOriginal).toLocaleString() : null;

  return (
    <Link href={`/product/${product.slug || product.id}`} className="rsp-card" style={{ textDecoration: 'none', display: 'block' }}
      onClick={() => viewDetails?.(product)}>
      {discount > 0 && <span className="rsp-card-badge">-{discount}%</span>}
      {img && !imgErr ? (
        <img src={img} alt={product.name} onError={() => setImgErr(true)} className="rsp-card-img" />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG_ALT }}>
          <ShoppingBag size={40} color={BORDER} />
        </div>
      )}
      <div className="rsp-card-body">
        <div className="rsp-card-stars">
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} fill={GOLD} color={GOLD} />)}
        </div>
        <p className="rsp-card-name">{product.name}</p>
        <div className="rsp-card-price-row">
          <span className="rsp-card-price">{price} {store?.currency}</span>
          {priceOriginal && <span className="rsp-card-price-old">{priceOriginal} {store?.currency}</span>}
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

  return (
    <div>
      {/* Hero — full-bleed background */}
      <section className="rsp-hero" style={{ background: `linear-gradient(160deg, ${BG} 0%, ${BG_ALT} 100%)` }}>
        {store?.hero?.imageUrl && (
          <div className="rsp-hero-bg">
            <img src={store.hero.imageUrl} alt="" aria-hidden="true" />
            <div className="rsp-hero-bg-overlay" />
          </div>
        )}
        <div className="rsp-container rsp-hero-grid">
          {store?.hero?.badge && (
            <span style={{ display: 'inline-block', border: `1px solid ${BORDER}`, color: GOLD_LIGHT, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 999, marginBottom: 20, alignSelf: 'flex-start' }}>
              {store.hero.badge}
            </span>
          )}
          <h1 className="rsp-hero-title"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || store?.name || '') }} />
          <p className="rsp-hero-sub">{store?.hero?.subtitle}</p>
          <div className="rsp-hero-cta-row">
            <Link href="#products" className="rsp-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              {t.shopNow}
            </Link>
            {store?.cart !== false && (
              <Link href="/cart" className="rsp-btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                {t.cart}
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="rsp-container" style={{ padding: '3rem 1.5rem' }}>
        {/* Trust bar */}
        <div className="rsp-trust-bar">
          {t.trust.map((item: any, i: number) => (
            <div className="rsp-trust-item" key={i}>
              <strong>{item.t}</strong>
              <span>{item.s}</span>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="rsp-cats" style={{ margin: '2.5rem 0 2rem' }}>
          <Link href="/" className={`rsp-cat-link ${!activeCategory ? 'active' : ''}`}>{t.all}</Link>
          {cats.map((cat: any) => (
            <Link key={cat.id} href={`?category=${cat.id}`}
              className={`rsp-cat-link ${activeCategory === String(cat.id) ? 'active' : ''}`}>
              {cat.name}
            </Link>
          ))}
        </div>

        {searchQ && (
          <p style={{ color: MUTED, marginBottom: 20 }}>{t.searchResultsFor} <strong style={{ color: CREAM }}>{searchQ}</strong></p>
        )}

        {/* Products */}
        <div id="products" className="rsp-products-grid">
          {loading
            ? [...Array(8)].map((_, i) => <div key={i} className="rsp-skeleton" style={{ aspectRatio: '3/4' }} />)
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
                  border: `1px solid ${currentPage === i + 1 ? GOLD : BORDER}`, color: currentPage === i + 1 ? GOLD_LIGHT : MUTED,
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
    <div className="rsp-container rsp-details-pad">
      <div className="rsp-details-inner">
        {/* Gallery */}
        <div>
          <div className="rsp-gallery-main" style={{ background: BG_ALT }}>
            {images?.[sel] && <img src={images[sel]} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            {images?.length > 1 && (
              <>
                <button onClick={() => setSel((s) => (s - 1 + images.length) % images.length)}
                  style={{ position: 'absolute', top: '50%', insetInlineStart: 10, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setSel((s) => (s + 1) % images.length)}
                  style={{ position: 'absolute', top: '50%', insetInlineEnd: 10, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {images?.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }}>
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSel(i)}
                  style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: sel === i ? `2px solid ${GOLD}` : `1px solid ${BORDER}`, padding: 0, cursor: 'pointer', background: 'none' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="rsp-display" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', margin: '0 0 10px', color: CREAM }}>{product?.name}</h1>
          <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill={GOLD} color={GOLD} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: GOLD_LIGHT }}>{Number(finalPrice ?? product?.price).toLocaleString()} {product?.store?.currency}</span>
            {discount > 0 && product?.priceOriginal && (
              <span style={{ color: MUTED, textDecoration: 'line-through' }}>{Number(product.priceOriginal).toLocaleString()} {product?.store?.currency}</span>
            )}
          </div>

          {product?.offers?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 10, color: CREAM }}>{t.offersTitle}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o: Offer) => (
                  <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${selectedOffer === o.id ? GOLD : BORDER}`, borderRadius: 4, padding: '10px 12px', cursor: 'pointer' }}>
                    <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                    <span style={{ color: CREAM, fontSize: '0.85rem' }}>{o.name} — {o.quantity}x</span>
                    <span style={{ marginInlineStart: 'auto', color: GOLD_LIGHT, fontWeight: 700 }}>{Number(o.price).toLocaleString()} {product?.store?.currency}</span>
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
                        style={{ width: 34, height: 34, borderRadius: '50%', background: v.value, border: isSel ? `2px solid ${GOLD}` : `1px solid ${BORDER}`, cursor: 'pointer' }} />
                    );
                  }
                  if (attr.displayMode === 'image') {
                    return (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                        style={{ width: 48, height: 48, borderRadius: 4, overflow: 'hidden', border: isSel ? `2px solid ${GOLD}` : `1px solid ${BORDER}`, padding: 0, cursor: 'pointer' }}>
                        <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    );
                  }
                  return (
                    <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                      style={{ padding: '8px 16px', borderRadius: 4, border: isSel ? `2px solid ${GOLD}` : `1px solid ${BORDER}`, color: isSel ? GOLD_LIGHT : CREAM, background: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>
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
              <h4 style={{ fontSize: '0.9rem', marginBottom: 10, color: CREAM }}>{t.descTitle}</h4>
              <div style={{ color: MUTED, fontSize: '0.9rem', lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
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
            <span className="rsp-label" style={{ margin: 0 }}>{t.qty}</span>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${BORDER}`, borderRadius: 4 }}>
              <button onClick={() => setFd((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                style={{ width: 40, height: 40, background: 'none', border: 'none', color: CREAM, cursor: 'pointer' }}><Minus size={14} /></button>
              <span style={{ width: 36, textAlign: 'center', color: CREAM }}>{fd.quantity}</span>
              <button onClick={() => setFd((f) => ({ ...f, quantity: f.quantity + 1 }))}
                style={{ width: 40, height: 40, background: 'none', border: 'none', color: CREAM, cursor: 'pointer' }}><Plus size={14} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="rsp-btn-primary" onClick={() => setIsOrderNow(true)} style={{ flex: 1 }}>{t.orderNow}</button>
            {store?.cart !== false && (
              <button className="rsp-btn-outline" onClick={addToCart} style={{ flex: 1 }}>{t.addToCart}</button>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="rsp-label">{t.fullName}</label>
            <input className="rsp-input-field" placeholder={t.fullNamePlaceholder} value={fd.customerName}
              onChange={(e) => setFd((f) => ({ ...f, customerName: e.target.value }))} />
            {errors.customerName && <span style={{ color: '#e0645a', fontSize: '0.75rem' }}>{errors.customerName}</span>}
          </div>
          <div>
            <label className="rsp-label">{t.phone}</label>
            <input className="rsp-input-field" placeholder={t.phonePlaceholder} value={fd.customerPhone}
              onChange={(e) => setFd((f) => ({ ...f, customerPhone: e.target.value }))} />
            {errors.customerPhone && <span style={{ color: '#e0645a', fontSize: '0.75rem' }}>{errors.customerPhone}</span>}
          </div>
          <div className="rsp-addr-grid">
            <div>
              <label className="rsp-label">{t.wilaya}</label>
              <select className="rsp-input-field" disabled={wilayas.length === 0} value={fd.customerWelaya}
                onChange={(e) => setFd((f) => ({ ...f, customerWelaya: e.target.value, customerCommune: '' }))}>
                <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                ))}
              </select>
              {errors.customerWelaya && <span style={{ color: '#e0645a', fontSize: '0.75rem' }}>{errors.customerWelaya}</span>}
            </div>
            <div>
              <label className="rsp-label">{t.commune}</label>
              <select className="rsp-input-field" disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune}
                onChange={(e) => setFd((f) => ({ ...f, customerCommune: e.target.value }))}>
                <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                {communes.map((c) => (
                  <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                ))}
              </select>
              {errors.customerCommune && <span style={{ color: '#e0645a', fontSize: '0.75rem' }}>{errors.customerCommune}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setFd((f) => ({ ...f, typeLivraison: 'home' }))}
              style={{ flex: 1, padding: '10px', borderRadius: 4, border: `1px solid ${fd.typeLivraison === 'home' ? GOLD : BORDER}`, background: 'none', color: fd.typeLivraison === 'home' ? GOLD_LIGHT : MUTED, cursor: 'pointer', minHeight: 44 }}>
              {t.deliveryHome}
            </button>
            <button onClick={() => setFd((f) => ({ ...f, typeLivraison: 'office' }))}
              style={{ flex: 1, padding: '10px', borderRadius: 4, border: `1px solid ${fd.typeLivraison === 'office' ? GOLD : BORDER}`, background: 'none', color: fd.typeLivraison === 'office' ? GOLD_LIGHT : MUTED, cursor: 'pointer', minHeight: 44 }}>
              {t.deliveryOffice}
            </button>
          </div>

          {/* Summary — placed above buttons, per §15.24 */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { l: t.price, v: `${fp.toLocaleString()} ${product?.store?.currency || ''}` },
              { l: t.qty, v: `× ${fd.quantity}` },
              { l: t.delivery, v: selW ? `${getLiv().toLocaleString()} ${product?.store?.currency || ''}` : '—' },
              { l: t.total, v: `${total().toLocaleString()} ${product?.store?.currency || ''}`, strong: true },
            ].map((row) => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ color: MUTED, fontSize: '0.85rem' }}>{row.l}</span>
                <span style={{ color: (row as any).strong ? GOLD_LIGHT : CREAM, fontWeight: (row as any).strong ? 700 : 500, whiteSpace: 'nowrap', flexShrink: 0 }}>{row.v}</span>
              </div>
            ))}
          </div>

          {errors.submit && <span style={{ color: '#e0645a', fontSize: '0.8rem' }}>{errors.submit}</span>}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="rsp-btn-primary" onClick={submitOrder} disabled={submitting} style={{ flex: 1 }}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            <button className="rsp-btn-outline" onClick={() => setIsOrderNow(false)} disabled={submitting} style={{ flex: 1 }}>
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
  const router = useRouter();
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
      <div className="rsp-container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={34} color={BG} />
        </div>
        <h2 className="rsp-display" style={{ color: CREAM, fontSize: '1.6rem', marginBottom: 10 }}>{t.successTitle}</h2>
        <p style={{ color: MUTED, marginBottom: 24 }}>{t.successDesc}</p>
        <Link href="/" className="rsp-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>{t.backToShop}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rsp-container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <ShoppingBag size={48} color={BORDER} style={{ margin: '0 auto 16px' }} />
        <h2 style={{ color: CREAM, fontSize: '1.3rem', marginBottom: 8 }}>{t.cartEmpty}</h2>
        <p style={{ color: MUTED, marginBottom: 24 }}>{t.cartEmptyDesc}</p>
        <Link href="/" className="rsp-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>{t.shopNow}</Link>
      </div>
    );
  }

  return (
    <div className="rsp-container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 className="rsp-display" style={{ color: CREAM, marginBottom: 24 }}>{t.myCart}</h1>
      <div className="rsp-cart-inner" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 14, border: `1px solid ${BORDER}`, borderRadius: 6, padding: 14, alignItems: 'center' }}>
              <img src={it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl} alt={it.product?.name}
                style={{ width: 66, height: 66, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: CREAM, fontWeight: 600, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.product?.name}</p>
                <p style={{ color: GOLD_LIGHT, fontWeight: 700, margin: 0 }}>{Number(it.finalPrice).toLocaleString()} {store?.currency} × {it.quantity}</p>
              </div>
              <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="rsp-label">{t.fullName}</label>
              <input className="rsp-input-field" placeholder={t.fullNamePlaceholder} value={fd.customerName}
                onChange={(e) => setFd((f) => ({ ...f, customerName: e.target.value }))} />
              {errors.customerName && <span style={{ color: '#e0645a', fontSize: '0.75rem' }}>{errors.customerName}</span>}
            </div>
            <div>
              <label className="rsp-label">{t.phone}</label>
              <input className="rsp-input-field" placeholder={t.phonePlaceholder} value={fd.customerPhone}
                onChange={(e) => setFd((f) => ({ ...f, customerPhone: e.target.value }))} />
              {errors.customerPhone && <span style={{ color: '#e0645a', fontSize: '0.75rem' }}>{errors.customerPhone}</span>}
            </div>
            <div>
              <label className="rsp-label">{t.wilaya}</label>
              <select className="rsp-input-field" disabled={wilayas.length === 0} value={fd.customerWelaya}
                onChange={(e) => setFd((f) => ({ ...f, customerWelaya: e.target.value, customerCommune: '' }))}>
                <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                ))}
              </select>
              {errors.customerWelaya && <span style={{ color: '#e0645a', fontSize: '0.75rem' }}>{errors.customerWelaya}</span>}
            </div>
            <div>
              <label className="rsp-label">{t.commune}</label>
              <select className="rsp-input-field" disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune}
                onChange={(e) => setFd((f) => ({ ...f, customerCommune: e.target.value }))}>
                <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                {communes.map((c) => (
                  <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                ))}
              </select>
              {errors.customerCommune && <span style={{ color: '#e0645a', fontSize: '0.75rem' }}>{errors.customerCommune}</span>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setFd((f) => ({ ...f, typeLivraison: 'home' }))}
                style={{ flex: 1, padding: '10px', borderRadius: 4, border: `1px solid ${fd.typeLivraison === 'home' ? GOLD : BORDER}`, background: 'none', color: fd.typeLivraison === 'home' ? GOLD_LIGHT : MUTED, cursor: 'pointer', minHeight: 44 }}>
                {t.deliveryHome}
              </button>
              <button onClick={() => setFd((f) => ({ ...f, typeLivraison: 'office' }))}
                style={{ flex: 1, padding: '10px', borderRadius: 4, border: `1px solid ${fd.typeLivraison === 'office' ? GOLD : BORDER}`, background: 'none', color: fd.typeLivraison === 'office' ? GOLD_LIGHT : MUTED, cursor: 'pointer', minHeight: 44 }}>
                {t.deliveryOffice}
              </button>
            </div>

            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ color: MUTED, fontSize: '0.85rem' }}>{t.subtotal}</span>
                <span style={{ color: CREAM, whiteSpace: 'nowrap', flexShrink: 0 }}>{cartTotal.toLocaleString()} {store?.currency}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ color: MUTED, fontSize: '0.85rem' }}>{t.delivery}</span>
                <span style={{ color: CREAM, whiteSpace: 'nowrap', flexShrink: 0 }}>{selW ? `${getLiv().toLocaleString()} ${store?.currency}` : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ color: CREAM, fontWeight: 700 }}>{t.total}</span>
                <span style={{ color: GOLD_LIGHT, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{finalTotal.toLocaleString()} {store?.currency}</span>
              </div>
            </div>

            {errors.submit && <span style={{ color: '#e0645a', fontSize: '0.8rem' }}>{errors.submit}</span>}

            <button className="rsp-btn-primary" onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (min-width:1024px){ .rsp-cart-inner{ grid-template-columns: 1.2fr 1fr; } }` }} />
    </div>
  );
}

/* ============================== STATIC PAGES ============================== */

function StaticShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rsp-container" style={{ padding: '3.5rem 1.5rem', maxWidth: 860 }}>
      <h1 className="rsp-display" style={{ color: CREAM, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 24 }}>{title}</h1>
      <div style={{ color: MUTED, fontSize: '0.95rem', lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}

export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  return (
    <StaticShell title={t.privacyTitle}>
      {(t.privacySections as unknown as { h: string; p: string }[]).map((s, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <h3 style={{ color: CREAM, fontSize: '1rem', margin: '0 0 8px', fontWeight: 600 }}>{s.h}</h3>
          <p style={{ margin: 0 }}>{s.p}</p>
        </div>
      ))}
    </StaticShell>
  );
}

export function Terms({ store }: any) {
  const t = T[getLang(store)];
  return (
    <StaticShell title={t.termsTitle}>
      {(t.termsSections as unknown as { h: string; p: string }[]).map((s, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <h3 style={{ color: CREAM, fontSize: '1rem', margin: '0 0 8px', fontWeight: 600 }}>{s.h}</h3>
          <p style={{ margin: 0 }}>{s.p}</p>
        </div>
      ))}
    </StaticShell>
  );
}

export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  return (
    <StaticShell title={t.cookiesTitle}>
      {(t.cookiesSections as unknown as { h: string; p: string }[]).map((s, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <h3 style={{ color: CREAM, fontSize: '1rem', margin: '0 0 8px', fontWeight: 600 }}>{s.h}</h3>
          <p style={{ margin: 0 }}>{s.p}</p>
        </div>
      ))}
    </StaticShell>
  );
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError(t.errSubmit);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: BG_ALT, border: `1px solid ${BORDER}`, borderRadius: 8,
    padding: '10px 14px', color: CREAM, fontSize: '0.9rem', fontFamily: 'inherit',
    outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', color: MUTED, fontSize: '0.78rem',
    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600,
  };

  return (
    <div className="rsp-container" style={{ padding: '3.5rem 1.5rem', maxWidth: 800 }}>
      <h1 className="rsp-display" style={{ color: CREAM, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 32 }}>{t.contactTitle}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>

        {/* Info column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: <Phone size={16} color={GOLD} />, val: store?.contact?.phone },
            { icon: <Mail size={16} color={GOLD} />, val: store?.contact?.email },
            { icon: <MapPin size={16} color={GOLD} />, val: store?.contact?.address ? `${store.contact.wilaya ? store.contact.wilaya + ', ' : ''}${store.contact.address}` : null },
          ].filter(r => r.val).map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: BG_ALT, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.icon}</div>
              <span style={{ color: MUTED, fontSize: '0.9rem' }}>{r.val}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0, boxShadow: '0 0 6px #22C55E' }} />
            <span style={{ color: MUTED, fontSize: '0.82rem' }}>{t.replyTime}</span>
          </div>
        </div>

        {/* Form column */}
        <div>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Check size={28} color="#22C55E" />
              </div>
              <h3 style={{ color: CREAM, fontSize: '1.1rem', marginBottom: 8 }}>{t.msgSentTitle}</h3>
              <p style={{ color: MUTED, fontSize: '0.88rem', marginBottom: 20 }}>{t.msgSentDesc}</p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
                style={{ background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                {t.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>{t.nameLbl}</label>
                <input type="text" required placeholder={t.namePh} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>{t.emailLbl}</label>
                  <input type="email" required placeholder={t.emailPh} value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t.phoneLbl}</label>
                  <input type="tel" placeholder={t.phonePh} value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t.messageLbl}</label>
                <textarea required rows={5} placeholder={t.messagePh} value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ ...inputStyle, resize: 'none' }} />
              </div>
              {error && <p style={{ color: '#f87171', fontSize: '0.83rem', margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading} className="rsp-btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? t.sending : t.sendMsg}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const t = T[getLang(store)];
  const p = (page || '').toLowerCase();
  if (p === 'privacy') return <Privacy store={store} />;
  if (p === 'terms') return <Terms store={store} />;
  if (p === 'cookies') return <Cookies store={store} />;
  if (p === 'contact') return <Contact store={store} />;
  return (
    <StaticShell title={staticPage?.title || page || t.home}>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(staticPage?.content || '') }} />
    </StaticShell>
  );
}