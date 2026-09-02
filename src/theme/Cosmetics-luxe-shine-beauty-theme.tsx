// Cosmetics-luxe-shine-beauty-theme.tsx
// NAVBAR ARCHETYPE: A — Centered Logo
// CARD ARCHETYPE: 2 — Overlay Reveal
// HERO LAYOUT: full-bleed
// TYPOGRAPHY PAIR: El Messiri + Tajawal

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Search, ShoppingCart, Menu, X, Phone, Mail, MapPin, ChevronDown,
  Star, Trash2, AlertCircle, Minus, Plus, Check, ArrowRight,
  Sparkles, Shield, Truck, Headphones, Instagram, Facebook, Send,
  Package, Clock, Heart, MessageCircle, Download
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ─────────── Types ─────────── */
interface Offer { id: string; name: string; quantity: number; price: number; subTitle?: string; shippingFree?: boolean; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
interface Product {
  id: string; slug?: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; shippingFree?: boolean;
  isDigital?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}
interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}

/* ─────────── Theme Tokens ─────────── */
const BG      = '#fdfbf7';
const SURFACE = '#f5f1ea';
const CARD    = '#ffffff';
const A       = '#b8860b'; // gold accent
const AL      = 'rgba(184,134,11,0.1)';
const AD      = '#8b6914';
const TXT     = '#1c1c2e';
const SUB     = '#6b6a7a';
const BD      = '#e8e2d6';
const ERR     = '#dc2626';
const SUC     = '#16a34a';

/* ─────────── Lang / Translation ─────────── */
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
      { t: 'دفع آمن',       s: 'دفع عند الاستلام' },
      { t: 'دعم 24/7',      s: 'فريق متخصص للمساعدة' },
    ],
    quickLinks: 'روابط سريعة', legalNav: 'قانوني', contactUs: 'تواصل معنا',
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
    orderEmail: 'البريد الإلكتروني',
    emailPh: 'example@email.com',
    errEmail: 'يرجى إدخال بريد إلكتروني صحيح',
    whatsapp: 'رقم واتساب',
    whatsappPh: '0550123456',
    errWhatsapp: 'رقم واتساب جزائري صحيح مطلوب (مثال: 0550123456)',
    contactQuestion: 'هل تملك بريداً إلكترونياً أم واتساب؟',
    contactViaEmail: 'البريد الإلكتروني',
    contactViaWhatsapp: 'واتساب',
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'الوصف',
    freeShippingBadge: '🚚 توصيل مجاني',
    freeShippingThreshold: '🚚 توصيل مجاني للطلبات بـ {{amount}} دج أو أكثر',
    freeShippingRemaining: 'أضف {{amount}} دج أخرى للحصول على توصيل مجاني',
    freeShippingReached: '🎉 حصلت على توصيل مجاني!',
    searchResultsFor: 'نتائج البحث عن:',
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
    search: 'Rechercher...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats →',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la boutique',
    trust: [
      { t: 'Livraison Rapide',   s: 'Partout en Algérie' },
      { t: 'Qualité Garantie',   s: 'Produits certifiés' },
      { t: 'Paiement Sécurisé',  s: 'Paiement à la livraison' },
      { t: 'Support 24/7',       s: 'Toujours disponible' },
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
    orderEmail: 'E-mail',
    emailPh: 'exemple@email.com',
    errEmail: 'Veuillez saisir une adresse e-mail valide',
    whatsapp: 'Numéro WhatsApp',
    whatsappPh: '0550123456',
    errWhatsapp: 'Numéro WhatsApp algérien valide requis (ex: 0550123456)',
    contactQuestion: 'Avez-vous un e-mail ou un numéro WhatsApp ?',
    contactViaEmail: 'E-mail',
    contactViaWhatsapp: 'WhatsApp',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description',
    freeShippingBadge: '🚚 Livraison gratuite',
    freeShippingThreshold: '🚚 Livraison gratuite dès {{amount}} DZD d\'achat',
    freeShippingRemaining: 'Ajoutez {{amount}} DZD de plus pour la livraison gratuite',
    freeShippingReached: '🎉 Livraison gratuite obtenue !',
    searchResultsFor: 'Résultats pour :',
    privacySections: [
      { h: 'Confidentialité et protection des données', p: 'Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. Cette politique explique comment nous collectons et utilisons vos informations lors de vos achats.' },
      { h: 'Données collectées', p: 'Nous collectons les informations que vous fournissez directement, telles que le nom complet, le numéro de téléphone et l\'adresse de livraison, uniquement pour traiter vos commandes.' },
      { h: 'Protection de vos données', p: 'Vos données sont stockées en toute sécurité et ne sont jamais partagées avec des tiers sans votre consentement explicite.' },
    ],
    termsSections: [
      { h: 'Acceptation des conditions', p: 'En utilisant cette boutique, vous acceptez ces conditions générales. Veuillez les lire attentivement avant de passer une commande.' },
      { h: 'Commandes et paiements', p: 'Toutes les commandes sont soumises à disponibilité et à confirmation du prix. Le paiement s\'effectue à la livraison sauf indication contraire.' },
      { h: 'Retours et échanges', p: 'Les produits peuvent être retournés dans les 7 jours suivant la livraison s\'ils sont inutilisés et dans leur emballage d\'origine.' },
    ],
    cookiesSections: [
      { h: 'Que sont les cookies ?', p: 'Nous utilisons des cookies pour améliorer votre expérience de navigation, analyser le trafic du site et personnaliser le contenu.' },
      { h: 'Types de cookies utilisés', p: 'Les cookies essentiels sont nécessaires au fonctionnement du site. Les cookies analytiques nous aident à comprendre comment les visiteurs interagissent avec notre boutique.' },
      { h: 'Gestion des cookies', p: 'Vous pouvez contrôler les cookies via les paramètres de votre navigateur. La désactivation des cookies essentiels peut affecter certaines fonctionnalités du site.' },
    ],
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
      { t: 'Secure Payment',       s: 'Cash on delivery' },
      { t: '24/7 Support',         s: 'Expert team always here' },
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
    successTitle: 'Order placed successfully!', successDesc: 'We will contact you shortly to confirm the details.',
    backToShop: 'Back to Shop',
    orderInfo: 'Order information',
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
    orderEmail: 'Email',
    emailPh: 'example@email.com',
    errEmail: 'Please enter a valid email address',
    whatsapp: 'WhatsApp number',
    whatsappPh: '0550123456',
    errWhatsapp: 'A valid Algerian WhatsApp number is required (e.g. 0550123456)',
    contactQuestion: 'Do you have an email or a WhatsApp number?',
    contactViaEmail: 'Email',
    contactViaWhatsapp: 'WhatsApp',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Description',
    freeShippingBadge: '🚚 Free Delivery',
    freeShippingThreshold: '🚚 Free Delivery on orders over {{amount}} DZD',
    freeShippingRemaining: 'Add {{amount}} DZD more for free delivery',
    freeShippingReached: '🎉 You got free delivery!',
    searchResultsFor: 'Results for:',
    privacySections: [
      { h: 'Privacy & Data Protection', p: 'We respect your privacy and are committed to protecting your personal data. This policy explains how we collect and use your information when you shop with us.' },
      { h: 'Data We Collect', p: 'We collect information you provide directly, such as your full name, phone number, and shipping address, solely for order fulfillment.' },
      { h: 'Data Protection', p: 'Your data is stored securely and never shared with third parties without your explicit consent.' },
    ],
    termsSections: [
      { h: 'Acceptance of Terms', p: 'By using this store, you agree to these terms and conditions. Please read them carefully before placing an order.' },
      { h: 'Orders & Payments', p: 'All orders are subject to availability and confirmation of the order price. Payment is cash on delivery unless otherwise stated.' },
      { h: 'Returns & Exchanges', p: 'Products may be returned within 7 days of delivery if they are unused and in their original packaging.' },
    ],
    cookiesSections: [
      { h: 'What Are Cookies?', p: 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.' },
      { h: 'Types of Cookies Used', p: 'Essential cookies are required for the site to function. Analytics cookies help us understand how visitors interact with our store.' },
      { h: 'Managing Cookies', p: 'You can control cookies through your browser settings. Disabling essential cookies may affect site functionality.' },
    ],
  },
} as const;

type TKeys = typeof T['ar'];

/* ─────────── Helpers ─────────── */
function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
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

/* ─────────── Global Styles ─────────── */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700;800&display=swap');

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
  0%, 100% { box-shadow: 0 0 0 0 rgba(184,134,11,0.4); }
  50%       { box-shadow: 0 0 0 12px rgba(184,134,11,0); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes badgeBounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.4); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: ${BG}; color: ${TXT}; font-family: 'Tajawal', sans-serif; }

.luxe-container { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }

/* Navbar */
.luxe-nav {
  position: sticky; top: 0; z-index: 200;
  background: rgba(253,251,247,0.85); backdrop-filter: blur(16px);
  border-bottom: 1px solid ${BD};
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
.luxe-nav.scrolled { background: rgba(253,251,247,0.97); box-shadow: 0 4px 30px rgba(0,0,0,0.08); }
.luxe-nav-inner { display: flex; align-items: center; justify-content: space-between; height: 72px; }
.luxe-nav-links { display: flex; align-items: center; gap: 32px; }
.luxe-nav-link { color: ${SUB}; text-decoration: none; font-weight: 500; font-size: 0.9rem; position: relative; transition: color 0.2s; }
.luxe-nav-link:hover, .luxe-nav-link.active { color: ${A}; }
.luxe-nav-link::after {
  content: ''; position: absolute; bottom: -6px; left: 0; right: 0; height: 2px; background: ${A};
  transform: scaleX(0); transform-origin: center; transition: transform 0.25s ease;
}
.luxe-nav-link:hover::after, .luxe-nav-link.active::after { transform: scaleX(1); }
.luxe-nav-logo { font-family: 'El Messiri', serif; font-size: 1.5rem; font-weight: 700; color: ${A}; text-decoration: none; letter-spacing: 0.04em; }
.luxe-nav-actions { display: flex; align-items: center; gap: 18px; }
.luxe-search-desk { position: relative; }
.luxe-search-desk input {
  background: ${SURFACE}; border: 1px solid ${BD}; border-radius: 999px;
  padding: 0.5rem 1rem 0.5rem 2.5rem; color: ${TXT}; font-family: inherit;
  font-size: 0.85rem; outline: none; transition: width 0.3s ease, border-color 0.2s;
  width: 180px;
}
.luxe-search-desk input:focus { width: 260px; border-color: ${A}; }
.luxe-search-desk .search-icon { position: absolute; top: 50%; transform: translateY(-50%); left: 14px; color: ${SUB}; pointer-events: none; }
.luxe-search-dropdown {
  position: absolute; top: calc(100% + 8px); inset-inline-end: 0; width: 340px;
  background: ${CARD}; border: 1px solid ${BD}; border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.12); z-index: 500; max-height: 380px; overflow-y: auto;
  animation: scaleIn 0.2s ease both;
}
.luxe-search-row {
  display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid ${BD};
  align-items: center; text-decoration: none; color: inherit; transition: background 0.15s;
}
.luxe-search-row:hover { background: ${SURFACE}; }
.luxe-search-row img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
.luxe-cart-btn { position: relative; color: ${TXT}; text-decoration: none; display: flex; align-items: center; }
.luxe-cart-badge {
  position: absolute; top: -8px; inset-inline-end: -10px;
  background: ${A}; color: ${BG}; font-size: 0.65rem; font-weight: 800;
  width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.luxe-burger { display: none; background: none; border: none; color: ${TXT}; cursor: pointer; }
.luxe-search-nav-mob { display: none; background: none; border: none; color: ${TXT}; cursor: pointer; align-items: center; }

/* Mobile nav overlay */
.luxe-mobile-nav {
  position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; flex-direction: column;
}
.luxe-mobile-nav-panel {
  background: ${CARD}; border-inline-start: 1px solid ${BD}; width: min(320px, 85vw); height: 100%; margin-inline-start: auto;
  padding: 24px; display: flex; flex-direction: column; gap: 8px; animation: fadeIn 0.2s ease;
}
.luxe-mobile-nav-link { color: ${TXT}; text-decoration: none; padding: 12px 0; border-bottom: 1px solid ${BD}; font-size: 1rem; }

/* Mobile search overlay */
.luxe-search-overlay { position: fixed; inset: 0; z-index: 600; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; flex-direction: column; }
.luxe-search-header { background: ${CARD}; padding: 14px 18px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid ${BD}; }
.luxe-search-header input { flex: 1; background: transparent; border: none; outline: none; color: ${TXT}; font-size: 1rem; font-family: inherit; }
.luxe-search-results { flex: 1; overflow-y: auto; background: ${CARD}; }
.luxe-search-mob-row { display: flex; gap: 14px; padding: 14px 18px; border-bottom: 1px solid ${BD}; align-items: center; text-decoration: none; color: inherit; }
.luxe-search-mob-row img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }

/* Hero */
.luxe-hero { position: relative; min-height: clamp(520px, 70vh, 800px); display: flex; align-items: center; overflow: hidden; }
.luxe-hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
.luxe-hero-scrim { position: absolute; inset: 0; background: linear-gradient(to top, ${BG} 0%, rgba(253,251,247,0.55) 50%, rgba(253,251,247,0.1) 100%); z-index: 1; }
.luxe-hero-content { position: relative; z-index: 2; width: 100%; }
.luxe-hero-title { font-family: 'El Messiri', serif; font-size: clamp(2rem, 5vw, 3.8rem); font-weight: 700; line-height: 1.2; margin: 0 0 1rem; color: ${TXT}; max-width: 720px; }
.luxe-hero-sub { font-size: clamp(1rem, 2vw, 1.25rem); color: ${SUB}; max-width: 560px; margin: 0 0 2rem; line-height: 1.6; }
.luxe-hero-cta { display: inline-flex; align-items: center; gap: 10px; background: ${A}; color: ${BG}; padding: 0.875rem 2rem; border-radius: 999px; font-weight: 700; text-decoration: none; transition: transform 0.15s, box-shadow 0.15s; border: none; cursor: pointer; font-family: inherit; font-size: 0.95rem; }
.luxe-hero-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(212,175,55,0.3); }
.luxe-hero-cta:active { transform: translateY(0) scale(0.97); }

/* Trust bar */
.luxe-trust { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; padding: 2.5rem 0; border-bottom: 1px solid ${BD}; }
.luxe-trust-item { display: flex; align-items: center; gap: 14px; padding: 1rem; background: ${SURFACE}; border-radius: 10px; border: 1px solid ${BD}; }
.luxe-trust-icon { width: 44px; height: 44px; border-radius: 10px; background: ${AL}; display: flex; align-items: center; justify-content: center; color: ${A}; flex-shrink: 0; }

/* Categories */
.luxe-cats { display: flex; flex-wrap: wrap; gap: 10px; padding: 1.5rem 0; }
.luxe-cat {
  padding: 8px 18px; border-radius: 999px; border: 1px solid ${BD}; background: transparent;
  color: ${SUB}; text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; cursor: pointer; font-family: inherit;
}
.luxe-cat:hover { border-color: ${A}; color: ${A}; }
.luxe-cat.active { background: ${A}; color: ${BG}; border-color: ${A}; font-weight: 700; }

/* Products grid */
.luxe-products-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; padding: 1rem 0 3rem; }

/* Card Archetype 2 — Overlay Reveal */
.luxe-card { position: relative; overflow: hidden; border-radius: 14px; aspect-ratio: 3/4; background: ${SURFACE}; cursor: pointer; text-decoration: none; color: inherit; display: block; animation: fadeUp 0.5s ease both; }
.luxe-card-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.luxe-card:hover .luxe-card-img { transform: scale(1.08); }
.luxe-card-body {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(10,10,20,0.92) 0%, rgba(10,10,20,0.6) 55%, transparent 100%);
  padding: 2rem 1.25rem 1rem;
}
.luxe-card-name { color: #fff; font-weight: 700; font-size: 1rem; margin: 0 0 0.5rem; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.luxe-card-price-row { display: flex; align-items: center; gap: 10px; }
.luxe-card-price { color: ${A}; font-weight: 800; font-size: 1.1rem; }
.luxe-card-original { color: rgba(255,255,255,0.5); text-decoration: line-through; font-size: 0.85rem; }
.luxe-card-discount { background: ${A}; color: ${BG}; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; }
.luxe-card-stars { display: flex; gap: 2px; margin-bottom: 0.5rem; }

/* Pagination */
.luxe-pag { display: flex; gap: 8px; justify-content: center; padding: 2rem 0; }
.luxe-pag-btn {
  min-width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; border: 1px solid ${BD}; background: ${SURFACE}; color: ${SUB};
  text-decoration: none; font-weight: 600; font-size: 0.85rem; transition: all 0.15s; font-family: inherit;
}
.luxe-pag-btn:hover { border-color: ${A}; color: ${A}; }
.luxe-pag-btn.active { background: ${A}; color: ${BG}; border-color: ${A}; }

/* Details */
.luxe-details { display: grid; grid-template-columns: 1fr; gap: 2rem; padding: 2rem 0; }
.luxe-gallery-main { position: relative; aspect-ratio: 1/1; border-radius: 16px; overflow: hidden; background: ${SURFACE}; border: 1px solid ${BD}; }
.luxe-gallery-main img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.luxe-gallery-nav {
  position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px;
  border-radius: 50%; background: rgba(12,12,20,0.7); border: 1px solid ${BD}; color: ${TXT};
  display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(4px);
}
.luxe-gallery-prev { inset-inline-start: 12px; }
.luxe-gallery-next { inset-inline-end: 12px; }
.luxe-gallery-thumbs { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.luxe-gallery-thumb { width: 72px; height: 72px; border-radius: 10px; overflow: hidden; border: 2px solid ${BD}; cursor: pointer; background: ${SURFACE}; }
.luxe-gallery-thumb.active { border-color: ${A}; }
.luxe-gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }
.luxe-details-title { font-family: 'El Messiri', serif; font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 700; margin: 0 0 0.75rem; }
.luxe-details-price { font-size: 1.75rem; font-weight: 800; color: ${A}; margin-bottom: 1rem; }
.luxe-details-offer { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1px solid ${BD}; border-radius: 10px; margin-bottom: 8px; cursor: pointer; background: ${SURFACE}; transition: border-color 0.2s; }
.luxe-details-offer:hover { border-color: ${A}; }
.luxe-details-offer input { accent-color: ${A}; }
.luxe-details-attr { margin-bottom: 1.25rem; }
.luxe-details-attr-label { font-size: 0.85rem; color: ${SUB}; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
.luxe-details-attr-vals { display: flex; flex-wrap: wrap; gap: 8px; }
.luxe-attr-chip {
  padding: 6px 14px; border-radius: 8px; border: 1px solid ${BD}; background: ${SURFACE}; color: ${TXT};
  cursor: pointer; font-size: 0.85rem; transition: all 0.15s; font-family: inherit;
}
.luxe-attr-chip:hover { border-color: ${A}; }
.luxe-attr-chip.active { background: ${AL}; border-color: ${A}; color: ${A}; font-weight: 700; }
.luxe-attr-color { width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${BD}; cursor: pointer; padding: 0; }
.luxe-attr-color.active { border-color: ${A}; box-shadow: 0 0 0 3px ${AL}; }
.luxe-attr-img { width: 44px; height: 44px; border-radius: 8px; border: 2px solid ${BD}; cursor: pointer; overflow: hidden; padding: 0; background: none; }
.luxe-attr-img.active { border-color: ${A}; }
.luxe-attr-img img { width: 100%; height: 100%; object-fit: cover; }

/* ProductForm / Cart form */
.luxe-form { background: ${SURFACE}; border: 1px solid ${BD}; border-radius: 16px; padding: 1.5rem; }
.luxe-form-title { font-family: 'El Messiri', serif; font-size: 1.25rem; font-weight: 700; margin: 0 0 1.25rem; color: ${A}; }
.luxe-input-wrap { margin-bottom: 1rem; }
.luxe-input-wrap label { display: block; font-size: 0.8rem; color: ${SUB}; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.luxe-input {
  width: 100%; padding: 0.75rem 1rem; font-size: 0.9rem; border: 1px solid ${BD}; border-radius: 10px;
  background: ${CARD}; color: ${TXT}; outline: none; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s;
}
.luxe-input:focus { border-color: ${A}; box-shadow: 0 0 0 3px ${AL}; }
.luxe-input.err { border-color: ${ERR}; }
.luxe-select-wrap { position: relative; }
.luxe-select-wrap .chevron { position: absolute; top: 50%; transform: translateY(-50%); right: 14px; color: ${SUB}; pointer-events: none; }
.luxe-select { width: 100%; padding: 0.75rem 2.5rem 0.75rem 1rem; font-size: 0.9rem; border: 1px solid ${BD}; border-radius: 10px; background: ${CARD}; color: ${TXT}; outline: none; font-family: inherit; appearance: none; cursor: pointer; }
.luxe-select:focus { border-color: ${A}; box-shadow: 0 0 0 3px ${AL}; }
.luxe-delivery-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1rem; }
.luxe-btn-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media (min-width: 640px) { .luxe-btn-grid { grid-template-columns: 1fr 1fr; } }
.luxe-delivery-btn {
  padding: 0.75rem; border-radius: 10px; border: 1px solid ${BD}; background: ${CARD}; color: ${SUB};
  cursor: pointer; font-family: inherit; font-size: 0.85rem; font-weight: 600; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.luxe-delivery-btn.active { background: ${AL}; border-color: ${A}; color: ${A}; }
.luxe-qty-row { display: flex; align-items: center; gap: 0; border: 1px solid ${BD}; border-radius: 10px; overflow: hidden; width: fit-content; margin-bottom: 1rem; }
.luxe-qty-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: ${CARD}; border: none; color: ${TXT}; cursor: pointer; font-size: 1rem; }
.luxe-qty-btn:hover { background: ${BD}; }
.luxe-qty-val { width: 48px; text-align: center; font-weight: 700; font-size: 0.95rem; }
.luxe-summary { background: ${CARD}; border: 1px solid ${BD}; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
.luxe-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid ${BD}; font-size: 0.9rem; }
.luxe-summary-row:last-child { border-bottom: none; font-weight: 800; font-size: 1rem; color: ${A}; }
.luxe-summary-label { color: ${SUB}; flex-shrink: 0; }
.luxe-summary-val { white-space: nowrap; font-weight: 600; }
.luxe-btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  padding: 0.875rem; min-height: 44px; background: ${A}; color: ${BG}; font-weight: 700;
  font-size: 0.9rem; border: none; border-radius: 10px; cursor: pointer; font-family: inherit;
  transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
}
.luxe-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(184,134,11,0.3); background: #c9950d; }
.luxe-btn-primary:active { transform: translateY(0) scale(0.97); }
.luxe-btn-primary:disabled { opacity: 0.6; cursor: default; transform: none; box-shadow: none; }
.luxe-btn-secondary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  padding: 0.875rem; min-height: 44px; background: transparent; color: ${A}; font-weight: 700;
  font-size: 0.9rem; border: 1px solid ${A}; border-radius: 10px; cursor: pointer; font-family: inherit;
  transition: all 0.15s; margin-top: 0.5rem;
}
.luxe-btn-secondary:hover { background: ${AL}; }
.luxe-btn-secondary:disabled { opacity: 0.5; cursor: default; }
.luxe-success-box { text-align: center; padding: 3rem 1rem; animation: scaleIn 0.4s ease; }
.luxe-success-icon { width: 64px; height: 64px; border-radius: 50%; background: ${AL}; color: ${A}; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }

/* Cart */
.luxe-cart-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; padding: 2rem 0; }
.luxe-cart-item { display: flex; gap: 14px; padding: 1rem; background: ${SURFACE}; border: 1px solid ${BD}; border-radius: 14px; margin-bottom: 1rem; }
.luxe-cart-item-img { width: 80px; height: 80px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: ${CARD}; }
.luxe-cart-item-info { flex: 1; }
.luxe-cart-item-name { font-weight: 700; margin: 0 0 4px; font-size: 0.95rem; }
.luxe-cart-item-price { color: ${A}; font-weight: 800; font-size: 1rem; }
.luxe-cart-item-qty { color: ${SUB}; font-size: 0.8rem; margin-top: 4px; }
.luxe-cart-item-del { background: none; border: none; color: ${ERR}; cursor: pointer; padding: 4px; align-self: flex-start; }
.luxe-cart-empty { text-align: center; padding: 4rem 1rem; }
.luxe-cart-empty-icon { width: 80px; height: 80px; border-radius: 50%; background: ${SURFACE}; border: 1px solid ${BD}; color: ${SUB}; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }

/* Footer */
.luxe-footer { border-top: 1px solid ${BD}; padding: 3rem 0 2rem; margin-top: 3rem; }
.luxe-footer-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
.luxe-footer-brand { font-family: 'El Messiri', serif; font-size: 1.4rem; font-weight: 700; color: ${A}; margin: 0 0 0.5rem; }
.luxe-footer-desc { color: ${SUB}; font-size: 0.9rem; line-height: 1.6; margin: 0 0 1rem; }
.luxe-footer-links-title { font-size: 0.85rem; font-weight: 700; color: ${TXT}; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 1rem; }
.luxe-footer-link { display: block; color: ${SUB}; text-decoration: none; padding: 6px 0; font-size: 0.9rem; transition: color 0.2s; }
.luxe-footer-link:hover { color: ${A}; }
.luxe-footer-contact { display: flex; align-items: center; gap: 10px; color: ${SUB}; font-size: 0.9rem; padding: 4px 0; }
.luxe-footer-bottom { border-top: 1px solid ${BD}; margin-top: 2.5rem; padding-top: 1.5rem; text-align: center; color: ${SUB}; font-size: 0.8rem; }

/* Static pages */
.luxe-static-header { background: ${SURFACE}; border-bottom: 1px solid ${BD}; padding: 3rem 0; text-align: center; margin-bottom: 2rem; }
.luxe-static-title { font-family: 'El Messiri', serif; font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 700; margin: 0; color: ${A}; }
.luxe-static-body { max-width: 800px; margin: 0 auto; padding: 0 1.5rem 3rem; line-height: 1.8; color: ${SUB}; }
.luxe-static-body h3 { color: ${TXT}; font-family: 'El Messiri', serif; margin-top: 2rem; }
.luxe-static-body p { margin: 0.75rem 0; }
.luxe-contact-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; padding: 2rem 0; }
.luxe-contact-info { background: ${SURFACE}; border: 1px solid ${BD}; border-radius: 16px; padding: 1.5rem; }
.luxe-contact-info h3 { font-family: 'El Messiri', serif; margin: 0 0 1rem; color: ${A}; }
.luxe-contact-row { display: flex; align-items: center; gap: 12px; color: ${SUB}; margin-bottom: 12px; font-size: 0.9rem; }

/* Skeleton */
.luxe-skeleton { background: linear-gradient(90deg, #ede8df 25%, #f8f4ee 50%, #ede8df 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; border-radius: 10px; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

/* Responsive */
@media (min-width: 640px) {
  .luxe-products-grid { grid-template-columns: repeat(2, 1fr); }
  .luxe-trust { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 768px) {
  .luxe-details { grid-template-columns: 1fr 1fr; }
  .luxe-footer-grid { grid-template-columns: 2fr 1fr 1fr 1.5fr; }
  .luxe-contact-grid { grid-template-columns: 1fr 1fr; }
  .luxe-cart-grid { grid-template-columns: 1.2fr 1fr; }
}
@media (min-width: 1024px) {
  .luxe-products-grid { grid-template-columns: repeat(3, 1fr); }
  .luxe-nav-links { display: flex; }
}
@media (min-width: 1280px) {
  .luxe-products-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 1023px) {
  .luxe-nav-links { display: none; }
  .luxe-burger { display: flex; }
  .luxe-search-desk { display: none; }
  .luxe-search-nav-mob { display: flex; }
}
@media (max-width: 480px) {
  .luxe-search-dropdown { position: fixed; left: 12px; right: 12px; width: auto; top: 72px; }
}
`;

/* ─────────── Main ─────────── */
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
    <div dir={t.dir} style={{ background: BG, minHeight: '100vh', color: TXT, fontFamily: "'Tajawal', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <main style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ─────────── Navbar ─────────── */
export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [imgError, setImgError] = useState(false);
  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try { const arr = JSON.parse(localStorage.getItem(domain) || '[]'); initCount(arr.length); } catch {}
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        if (r.ok) { const d = await r.json(); setListSearch(d.products || d || []); }
      } catch {}
      setLoading(false);
    }, 380);
  }, [searchQuery, domain]);

  const mobileLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  return (
    <>
      <header className={`luxe-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="luxe-container luxe-nav-inner">
          {/* Left: links */}
          <nav className="luxe-nav-links" style={{ flex: 1, justifyContent: 'flex-start' }}>
            <Link href="/" className={`luxe-nav-link ${pathname === '/' ? 'active' : ''}`}>{t.home}</Link>
            <Link href="/contact" className={`luxe-nav-link ${pathname === '/contact' ? 'active' : ''}`}>{t.contact}</Link>
          </nav>

          {/* Center: logo */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Link href="/" className="luxe-nav-logo">
              {!imgError && store?.design?.logoUrl ? (
                <img src={store.design.logoUrl} alt={store.name} onError={() => setImgError(true)} style={{ height: 40, width: 'auto', objectFit: 'contain', maxWidth: 160 }} />
              ) : (
                <span>{store?.name || 'Luxe'}</span>
              )}
            </Link>
          </div>

          {/* Right: search + cart */}
          <div className="luxe-nav-actions" style={{ flex: 1, justifyContent: 'flex-end' }}>
            {/* Desktop search */}
            <div className="luxe-search-desk">
              <Search size={16} className="search-icon" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.search}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {listSearch.length > 0 && searchFocused && (
                <div className="luxe-search-dropdown">
                  {listSearch.map(p => (
                    <Link key={p.id} href={`/product/${p.slug || p.id}`} className="luxe-search-row" onClick={() => { setSearchFocused(false); setSearchQuery(''); setListSearch([]); }}>
                      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</p>
                        <p style={{ margin: 0, color: A, fontWeight: 700, fontSize: '0.8rem' }}>{Number(p.price).toLocaleString()} {store?.currency}</p>
                      </div>
                    </Link>
                  ))}
                  <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => { setSearchFocused(false); setSearchQuery(''); setListSearch([]); }} style={{ display: 'block', padding: '12px 16px', borderTop: `1px solid ${BD}`, fontSize: '0.8rem', textAlign: 'center', color: A, fontWeight: 600, textDecoration: 'none' }}>
                    {t.showAll}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile search icon */}
            <button className="luxe-search-nav-mob" onClick={() => setShowSearch(true)} aria-label="Search">
              <Search size={22} />
            </button>

            {store?.cart !== false && (
              <Link href="/cart" className="luxe-cart-btn">
                <ShoppingCart size={22} />
                {count > 0 && <span className="luxe-cart-badge">{count}</span>}
              </Link>
            )}
            <button className="luxe-burger" onClick={() => setOpen(true)} aria-label="Menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {open && (
        <div className="luxe-mobile-nav" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="luxe-mobile-nav-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="luxe-nav-logo">{store?.name || 'Luxe'}</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: TXT, cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            {mobileLinks.map(lnk => (
              <Link key={lnk.h} href={lnk.h} className="luxe-mobile-nav-link" onClick={() => setOpen(false)}>{lnk.l}</Link>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${BD}` }}>
              {store?.contact?.phone && <div className="luxe-footer-contact"><Phone size={16} color={A} /> {store.contact.phone}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Mobile search overlay */}
      {showSearch && (
        <div className="luxe-search-overlay" onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div className="luxe-search-header">
            <Search size={20} color={SUB} />
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.search} />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }} style={{ background: 'none', border: 'none', color: TXT, cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
          <div className="luxe-search-results">
            {loading && <p style={{ padding: '1.5rem', textAlign: 'center', color: SUB }}>{t.searching}</p>}
            {listSearch.map(p => (
              <Link key={p.id} href={`/product/${p.slug || p.id}`} className="luxe-search-mob-row" onClick={() => setShowSearch(false)}>
                <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</p>
                  <p style={{ margin: '4px 0 0', color: A, fontWeight: 700 }}>{Number(p.price).toLocaleString()} {store?.currency}</p>
                </div>
              </Link>
            ))}
            {listSearch.length > 0 && (
              <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearch(false)} style={{ display: 'block', padding: '16px', textAlign: 'center', background: SURFACE, color: A, fontWeight: 700, textDecoration: 'none' }}>
                {t.showAll.replace('→', '')} "{searchQuery}"
              </Link>
            )}
            {searchQuery.length >= 2 && !loading && listSearch.length === 0 && (
              <p style={{ padding: '3rem 1rem', textAlign: 'center', color: SUB }}>{t.noResults} "{searchQuery}"</p>
            )}
          </div>
        </div>
      )}

    </>
  );
}

/* ─────────── Footer ─────────── */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const year = new Date().getFullYear();
  const links = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contact },
  ].filter(lnk => lnk.h !== '/cart' || store?.cart !== false);

  return (
    <footer className="luxe-footer">
      <div className="luxe-container luxe-footer-grid">
        <div>
          <p className="luxe-footer-brand">{store?.name || 'Luxe & Shine'}</p>
          <p className="luxe-footer-desc">{store?.hero?.subtitle || 'Premium beauty products curated for elegance.'}</p>
          <p style={{ color: SUB, fontSize: '0.8rem' }}>© {year} {store?.name}. {t.rightsReserved}</p>
        </div>
        <div>
          <p className="luxe-footer-links-title">{t.quickLinks}</p>
          {links.map(lnk => <Link key={lnk.h} href={lnk.h} className="luxe-footer-link">{lnk.l}</Link>)}
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
          <p className="luxe-footer-links-title">{t.contactUs}</p>
          {store?.contact?.phone && <div className="luxe-footer-contact"><Phone size={16} color={A} /> {store.contact.phone}</div>}
          {store?.contact?.email && <div className="luxe-footer-contact"><Mail size={16} color={A} /> {store.contact.email}</div>}
          {store?.contact?.wilaya && <div className="luxe-footer-contact"><MapPin size={16} color={A} /> {store.contact.wilaya}{store?.contact?.address ? `, ${store.contact.address}` : ''}</div>}
        </div>
      </div>
      <div className="luxe-container luxe-footer-bottom">
        Crafted with elegance for {store?.name || 'Luxe & Shine'}.
      </div>
    </footer>
  );
}

/* ─────────── Card ─────────── */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product?.productImage || product?.imagesProduct?.[0]?.imageUrl;

  return (
    <Link href={`/product/${product.slug || product.id}`} className="luxe-card" style={{ animationDelay: `${(product._index || 0) * 0.07}s` }}>
      {img && !imgErr ? (
        <img src={img} alt={product.name} className="luxe-card-img" onError={() => setImgErr(true)} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: SURFACE }}>
          <Sparkles size={40} color={BD} />
        </div>
      )}
      {product.isDigital ? (
        <span style={{ position: 'absolute', top: 10, left: 10, background: A, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, zIndex: 2, display: 'inline-flex', alignItems: 'center' }}>
          <Download size={12} />
        </span>
      ) : product.shippingFree && (
        <span style={{ position: 'absolute', top: 10, left: 10, background: TXT, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, zIndex: 2 }}>🚚</span>
      )}
      <div className="luxe-card-body">
        <div className="luxe-card-stars">
          {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= 4 ? A : 'transparent'} color={A} />)}
        </div>
        <p className="luxe-card-name">{product.name}</p>
        <div className="luxe-card-price-row">
          <span className="luxe-card-price">{Number(product.price).toLocaleString()} {store?.currency}</span>
          {discount > 0 && <span className="luxe-card-original">{Number(product.priceOriginal).toLocaleString()}</span>}
          {discount > 0 && <span className="luxe-card-discount">-{discount}%</span>}
        </div>
      </div>
    </Link>
  );
}

/* ─────────── Home ─────────── */
export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const products = store?.products || [];
  const cats = store?.categories || [];
  const countPage = Math.ceil((store?.count || products.length) / 48);
  const currentPage = Number(page || 1);

  const heroTitle = store?.hero?.title || 'Luxe & Shine Beauty';
  const heroSub = store?.hero?.subtitle || 'Discover premium serums, perfumes, and beauty essentials crafted for elegance.';

  return (
    <div>
      {/* Hero */}
      <section className="luxe-hero">
        {store?.hero?.imageUrl && <img src={store.hero.imageUrl} alt="hero" className="luxe-hero-bg" />}
        <div className="luxe-hero-scrim" />
        <div className="luxe-container luxe-hero-content">
          <div style={{ maxWidth: 720, marginInlineEnd: 'auto' }}>
            <h1 className="luxe-hero-title" style={{ animation: 'fadeUp 0.7s ease 0.1s both' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(heroTitle) }} />
            <p className="luxe-hero-sub" style={{ animation: 'fadeUp 0.7s ease 0.25s both' }}>{heroSub}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.7s ease 0.4s both' }}>
              <Link href="/#products" className="luxe-hero-cta">{t.shopNow}</Link>
              {store?.cart !== false && <Link href="/cart" className="luxe-hero-cta" style={{ background: 'transparent', color: A, border: `1px solid ${A}` }}>{t.cart}</Link>}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="luxe-container">
        <div className="luxe-trust">
          {t.trust.map((item, i) => (
            <div key={i} className="luxe-trust-item" style={{ animationDelay: `${0.5 + i * 0.1}s`, animation: 'fadeUp 0.5s ease both' }}>
              <div className="luxe-trust-icon">
                {i === 0 ? <Truck size={20} /> : i === 1 ? <Shield size={20} /> : i === 2 ? <Check size={20} /> : <Headphones size={20} />}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: TXT }}>{item.t}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: SUB }}>{item.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="luxe-container">
        <div className="luxe-cats">
          <Link href="/" className={`luxe-cat ${!activeCategory ? 'active' : ''}`}>{t.all}</Link>
          {cats.map((cat: any) => (
            <Link key={cat.id} href={`?category=${cat.id}`} className={`luxe-cat ${activeCategory === String(cat.id) ? 'active' : ''}`}>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Search results title */}
      {searchQuery && (
        <div className="luxe-container" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'El Messiri', serif", fontSize: '1.25rem', color: A }}>{t.searchResultsFor} "{searchQuery}"</h2>
        </div>
      )}

      {/* Products */}
      <div className="luxe-container">
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Package size={48} color={BD} style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: SUB, fontSize: '1.1rem' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="luxe-products-grid">
            {products.map((p: any, i: number) => {
              const discount = p.priceOriginal && Number(p.priceOriginal) > Number(p.price)
                ? Math.round(((Number(p.priceOriginal) - Number(p.price)) / Number(p.priceOriginal)) * 100)
                : 0;
              return <Card key={p.id} product={{...p, _index: i}} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={discount} store={store} viewDetails />;
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {countPage > 1 && (
        <div className="luxe-pag">
          {Array.from({ length: countPage }, (_, i) => i + 1).map(pg => (
            <Link
              key={pg}
              href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), ...(searchQuery ? { search: searchQuery } : {}), page: pg } }}
              scroll={false}
              className={`luxe-pag-btn ${currentPage === pg ? 'active' : ''}`}
            >
              {pg}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── Details ─────────── */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store: storeprop }: any) {
  const t = T[getLang(storeprop || product?.store)];
  const [sel, setSel] = useState(0);
  const [imgErr, setImgErr] = useState<Record<number, boolean>>({});

  const imgs: string[] = allImages?.length
    ? allImages
    : [product?.productImage, product?.imagesProduct?.[0]?.imageUrl].filter(Boolean) as string[];

  return (
    <div className="luxe-container">
      <div className="luxe-details">
        {/* Gallery */}
        <div>
          <div className="luxe-gallery-main">
            {imgs[sel] && !imgErr[sel] ? (
              <img src={imgs[sel]} alt={product.name} onError={() => setImgErr(p => ({...p, [sel]: true}))} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={48} color={BD} />
              </div>
            )}
            {imgs.length > 1 && (
              <>
                <button className="luxe-gallery-nav luxe-gallery-prev" onClick={() => setSel(s => (s - 1 + imgs.length) % imgs.length)}><ArrowRight size={20} style={{ transform: t.dir === 'rtl' ? 'none' : 'rotate(180deg)' }} /></button>
                <button className="luxe-gallery-nav luxe-gallery-next" onClick={() => setSel(s => (s + 1) % imgs.length)}><ArrowRight size={20} style={{ transform: t.dir === 'rtl' ? 'rotate(180deg)' : 'none' }} /></button>
              </>
            )}
          </div>
          <div className="luxe-gallery-thumbs">
            {imgs.map((im, i) => (
              <button key={i} className={`luxe-gallery-thumb ${sel === i ? 'active' : ''}`} onClick={() => setSel(i)}>
                <img src={im} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="luxe-details-title">{product.name}</h1>
          <div className="luxe-details-price">{Number(finalPrice).toLocaleString()} {"DZD"}</div>
          {discount > 0 && product.priceOriginal && (
            <p style={{ color: SUB, textDecoration: 'line-through', margin: '0 0 1rem' }}>{Number(product.priceOriginal).toLocaleString()} {"DZD"}</p>
          )}

          {(product.shippingFree || (storeprop?.supportFreeShipping && storeprop?.freeShippingMinAmount != null)) && (
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: A, marginBottom: '1rem' }}>
              {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', String(storeprop.freeShippingMinAmount))}
            </p>
          )}

          {/* Offers */}
          {product.offers && product.offers.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="luxe-details-attr-label">{t.offersTitle}</p>
              {product.offers.map((o: Offer) => (
                <label key={o.id} className="luxe-details-offer" style={{ borderColor: selectedOffer === o.id ? A : BD }}>
                  <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                  <span style={{ flex: 1 }}>
                    {o.name} — {Number(o.price).toLocaleString()} {"DZD"}
                    {o.subTitle && <><br /><span style={{ color: SUB, fontSize: '0.78rem' }}>{o.subTitle}</span></>}
                    {o.shippingFree && <><br /><span style={{ color: A, fontSize: '0.75rem', fontWeight: 700 }}>{t.freeShippingBadge}</span></>}
                  </span>
                  <span style={{ color: SUB, fontSize: '0.8rem' }}>x{o.quantity}</span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs?.map((attr: Attribute) => (
            <div key={attr.id} className="luxe-details-attr">
              <p className="luxe-details-attr-label">{attr.name}</p>
              <div className="luxe-details-attr-vals">
                {attr.variants.map((v: Variant) => {
                  const isSelected = selectedVariants[attr.name] === v.value;
                  const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                  if (attr.displayMode === 'color') {
                    return (
                      <button key={v.id} className={`luxe-attr-color ${isSelected ? 'active' : ''}`} style={{ background: v.value, opacity: available ? 1 : 0.35, cursor: available ? 'pointer' : 'not-allowed' }} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.name} />
                    );
                  }
                  if (attr.displayMode === 'image') {
                    return (
                      <button key={v.id} className={`luxe-attr-img ${isSelected ? 'active' : ''}`} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ opacity: available ? 1 : 0.35, cursor: available ? 'pointer' : 'not-allowed' }}>
                        <img src={v.value} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                      </button>
                    );
                  }
                  return (
                    <button key={v.id} className={`luxe-attr-chip ${isSelected ? 'active' : ''}`} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ cursor: available ? 'pointer' : 'not-allowed', color: available ? undefined : '#bbb', textDecoration: available ? 'none' : 'line-through' }}>
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ marginTop: '1.5rem' }}>
            <ProductForm
              product={product}
              userId={product.store?.userId}
              domain={domain}
              selectedOffer={selectedOffer}
              setSelectedOffer={setSelectedOffer}
              selectedVariants={selectedVariants}
              store={storeprop}
            />
          </div>

          {/* Description */}
          {product.desc && (
            <div style={{ marginTop: '1.5rem' }}>
              <p className="luxe-details-attr-label">{t.descTitle}</p>
              <div style={{ color: SUB, fontSize: '0.9rem', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────── ProductForm ─────────── */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, store: storeprop }: ProductFormProps & { store?: any }) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);

  const [fd, setFd] = useState({
    customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '',
    quantity: 1, typeLivraison: 'home' as 'home' | 'office', priceLoss: 0,
    customerEmail: '', customerWhatsapp: '',
  });
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

  const getFP = useCallback((): number => {
    if (selectedOffer) {
      const o = product.offers?.find(x => x.id === selectedOffer);
      if (o) return Number(o.price);
    }
    if (Object.keys(selectedVariants).length && product.variantDetails) {
      const vd = product.variantDetails.find(d => variantMatches(d, selectedVariants));
      if (vd && vd.price !== -1) return Number(vd.price);
    }
    return Number(product.price);
  }, [selectedOffer, selectedVariants, product]);

  const supportQty = (store?.supportQty ?? product.store?.supportQty) !== false;
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = product.offers?.find((o: any) => o.id === selectedOffer);
  const orderFreeShipping = !!(product.shippingFree || selOfferObj?.shippingFree ||
    (store?.supportFreeShipping && store?.freeShippingMinAmount != null && (getFP() * qty) >= Number(store.freeShippingMinAmount)));
  const getLiv = useCallback((): number => {
    if (product.isDigital) return 0;
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping, product.isDigital]);

  const total = useCallback(() => getFP() * qty + getLiv(), [getFP, qty, getLiv]);

  const getVarId = useCallback(() => {
    if (!Object.keys(selectedVariants).length || !product.variantDetails) return null;
    const vd = product.variantDetails.find(d => variantMatches(d, selectedVariants));
    return vd ? vd.id : null;
  }, [selectedVariants, product]);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.length < 3) e.name = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) e.phone = t.errPhone;
    if (product.isDigital) {
      if (contactMethod === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.customerEmail.trim())) e.email = t.errEmail;
      } else {
        if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerWhatsapp.trim())) e.whatsapp = t.errWhatsapp;
      }
    } else {
      if (!fd.customerWelaya) e.wilaya = t.errWilaya;
      if (!fd.customerCommune) e.commune = t.errCommune;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [fd, t, product.isDigital, contactMethod]);

  const addToCart = useCallback(() => {
    const payload = {
      ...fd, quantity: qty, product, productId: product.id, storeId: product.store?.id, userId,
      variantDetailId: getVarId(), selectedOffer, selectedVariants,
      finalPrice: getFP(), totalPrice: total(), priceLivraison: getLiv(),
      addedAt: new Date().toISOString(),
    };
    const arr = JSON.parse(localStorage.getItem(domain) || '[]');
    arr.push(payload);
    localStorage.setItem(domain, JSON.stringify(arr));
    const cs = useCartStore.getState();
    cs.initCount(arr.length);
  }, [fd, qty, product, userId, domain, getVarId, selectedOffer, selectedVariants, getFP, total, getLiv]);

  const submitOrder = useCallback(async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { customerWelaya, customerCommune, typeLivraison, priceLoss, customerEmail, customerWhatsapp, ...rest } = fd;
      const payload = product.isDigital
        ? { ...rest, ...(contactMethod === 'email' ? { customerEmail } : { customerWhatsapp }) }
        : { ...rest, customerWelaya, customerCommune, typeLivraison, priceLoss };
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload, quantity: qty, product, productId: product.id, storeId: product.store?.id, userId,
          variantDetailId: getVarId(), selectedOffer, selectedVariants,
          finalPrice: getFP(), totalPrice: total(), priceLivraison: getLiv(),
        }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.customerId) localStorage.setItem('customerId', d.customerId);
        setSuccess(true);
      } else { setErrors({ submit: t.errSubmit }); }
    } catch { setErrors({ submit: t.errSubmit }); }
    setSubmitting(false);
  }, [fd, qty, product, userId, getVarId, selectedOffer, selectedVariants, getFP, total, getLiv, validate, t, contactMethod]);

  if (success) {
    return (
      <div className="luxe-success-box">
        <div className="luxe-success-icon"><Check size={32} /></div>
        <h3 style={{ fontFamily: "'El Messiri', serif", color: A, margin: '0 0 0.5rem' }}>{t.successTitle}</h3>
        <p style={{ color: SUB, margin: '0 0 1.5rem' }}>{t.successDesc}</p>
        <Link href="/" className="luxe-btn-primary" style={{ maxWidth: 280, margin: '0 auto' }}>{t.backToShop}</Link>
      </div>
    );
  }

  return (
    <div className="luxe-form">
      {!isOrderNow && !product.isDigital ? (
        <div className="luxe-btn-grid">
          <button className="luxe-btn-primary" onClick={() => setIsOrderNow(true)}>
            {t.orderNow}
          </button>
          {store?.cart !== false && (
            <button className="luxe-btn-secondary" onClick={addToCart} style={{ marginTop: 0 }}>
              <ShoppingCart size={18} /> {t.addToCart}
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="luxe-form-title">{t.confirmOrder}</p>

          <div className="luxe-input-wrap">
            <label>{t.fullName}</label>
            <input className={`luxe-input ${errors.name ? 'err' : ''}`} placeholder={t.fullNamePlaceholder} value={fd.customerName} onChange={e => setFd(p => ({...p, customerName: e.target.value}))} />
            {errors.name && <p style={{ color: ERR, fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {errors.name}</p>}
          </div>

          <div className="luxe-input-wrap">
            <label>{t.phone}</label>
            <input className={`luxe-input ${errors.phone ? 'err' : ''}`} placeholder={t.phonePlaceholder} value={fd.customerPhone} onChange={e => setFd(p => ({...p, customerPhone: e.target.value}))} />
            {errors.phone && <p style={{ color: ERR, fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {errors.phone}</p>}
          </div>

          {product.isDigital ? (
            <div className="luxe-input-wrap">
              <label>{t.contactQuestion}</label>
              <div className="luxe-delivery-toggle">
                <button type="button" className={`luxe-delivery-btn ${contactMethod === 'email' ? 'active' : ''}`} onClick={() => { setContactMethod('email'); setFd(p => ({ ...p, customerWhatsapp: '' })); }}>
                  <Mail size={16} /> {t.contactViaEmail}
                </button>
                <button type="button" className={`luxe-delivery-btn ${contactMethod === 'whatsapp' ? 'active' : ''}`} onClick={() => { setContactMethod('whatsapp'); setFd(p => ({ ...p, customerEmail: '' })); }}>
                  <MessageCircle size={16} /> {t.contactViaWhatsapp}
                </button>
              </div>
              {contactMethod === 'email' ? (
                <div className="luxe-input-wrap" style={{ marginTop: '0.75rem' }}>
                  <label>{t.orderEmail}</label>
                  <input className={`luxe-input ${errors.email ? 'err' : ''}`} type="email" dir="ltr" placeholder={t.emailPh} value={fd.customerEmail} onChange={e => setFd(p => ({...p, customerEmail: e.target.value}))} />
                  {errors.email && <p style={{ color: ERR, fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {errors.email}</p>}
                </div>
              ) : (
                <div className="luxe-input-wrap" style={{ marginTop: '0.75rem' }}>
                  <label>{t.whatsapp}</label>
                  <input className={`luxe-input ${errors.whatsapp ? 'err' : ''}`} type="tel" dir="ltr" placeholder={t.whatsappPh} value={fd.customerWhatsapp} onChange={e => setFd(p => ({...p, customerWhatsapp: e.target.value}))} />
                  {errors.whatsapp && <p style={{ color: ERR, fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {errors.whatsapp}</p>}
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="luxe-input-wrap">
                  <label>{t.wilaya}</label>
                  <div className="luxe-select-wrap">
                    <select className={`luxe-select ${errors.wilaya ? 'err' : ''}`} value={fd.customerWelaya} onChange={e => setFd(p => ({...p, customerWelaya: e.target.value, customerCommune: ''}))} disabled={wilayas.length === 0}>
                      <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                      {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="chevron" />
                  </div>
                  {errors.wilaya && <p style={{ color: ERR, fontSize: '0.75rem', marginTop: 4 }}><AlertCircle size={11} /> {errors.wilaya}</p>}
                </div>
                <div className="luxe-input-wrap">
                  <label>{t.commune}</label>
                  <div className="luxe-select-wrap">
                    <select className={`luxe-select ${errors.commune ? 'err' : ''}`} value={fd.customerCommune} onChange={e => setFd(p => ({...p, customerCommune: e.target.value}))} disabled={!fd.customerWelaya || loadingC}>
                      <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                      {communes.map(c => <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="chevron" />
                  </div>
                  {errors.commune && <p style={{ color: ERR, fontSize: '0.75rem', marginTop: 4 }}><AlertCircle size={11} /> {errors.commune}</p>}
                </div>
              </div>

              <div className="luxe-delivery-toggle">
                <button className={`luxe-delivery-btn ${fd.typeLivraison === 'home' ? 'active' : ''}`} onClick={() => setFd(p => ({...p, typeLivraison: 'home'}))}>
                  <Truck size={16} /> {t.deliveryHome}
                </button>
                <button className={`luxe-delivery-btn ${fd.typeLivraison === 'office' ? 'active' : ''}`} onClick={() => setFd(p => ({...p, typeLivraison: 'office'}))}>
                  <Package size={16} /> {t.deliveryOffice}
                </button>
              </div>
            </>
          )}

          {supportQty && !product.isDigital && (
            <div className="luxe-qty-row">
              <button className="luxe-qty-btn" onClick={() => setFd(p => ({...p, quantity: Math.max(1, p.quantity - 1)}))}><Minus size={16} /></button>
              <span className="luxe-qty-val">{fd.quantity}</span>
              <button className="luxe-qty-btn" onClick={() => setFd(p => ({...p, quantity: p.quantity + 1}))}><Plus size={16} /></button>
            </div>
          )}

          {/* Summary */}
          <div className="luxe-summary">
            <div className="luxe-summary-row"><span className="luxe-summary-label">{t.price}</span><span className="luxe-summary-val">{getFP().toLocaleString()} {"DZD"}</span></div>
            <div className="luxe-summary-row"><span className="luxe-summary-label">{t.qty}</span><span className="luxe-summary-val">× {qty}</span></div>
            {!product.isDigital && (
              <div className="luxe-summary-row"><span className="luxe-summary-label">{t.delivery}</span><span className="luxe-summary-val">{!selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${getLiv().toLocaleString()} DZD`}</span></div>
            )}
            <div className="luxe-summary-row"><span className="luxe-summary-label">{t.total}</span><span className="luxe-summary-val">{total().toLocaleString()} {"DZD"}</span></div>
          </div>

          {errors.submit && <p style={{ color: ERR, fontSize: '0.85rem', marginBottom: 12, textAlign: 'center' }}>{errors.submit}</p>}

          <button className="luxe-btn-primary" onClick={submitOrder} disabled={submitting}>
            {submitting ? <><Clock size={18} /> {t.sending}</> : <><Check size={18} /> {t.confirmOrder}</>}
          </button>
          <button className="luxe-btn-secondary" onClick={() => setIsOrderNow(false)} disabled={submitting}>
            {t.cancel}
          </button>
        </>
      )}
    </div>
  );
}

/* ─────────── Cart ─────────── */
export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const [items, setItems] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const initCount = useCartStore((s) => s.initCount);

  const [fd, setFd] = useState({
    customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => {
    try { const arr = JSON.parse(localStorage.getItem(domain) || '[]'); setItems(arr); } catch {}
    setLoaded(true);
  }, [domain]);

  useEffect(() => { if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [store]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const cartTotal = useMemo(() => items.reduce((sum, it) => sum + (Number(it.finalPrice || it.product?.price) * (it.quantity || 1)), 0), [items]);
  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const hasFreeShippingItem = items.some(it => it.product?.shippingFree || it.product?.offers?.find((o: any) => o.id === it.selectedOffer)?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;
  const getLiv = useCallback(() => {
    if (freeShippingReached) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison, freeShippingReached]);
  const finalTotal = cartTotal + getLiv();

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.length < 3) e.name = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) e.phone = t.errPhone;
    if (!fd.customerWelaya) e.wilaya = t.errWilaya;
    if (!fd.customerCommune) e.commune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [fd, t]);

  const removeItem = useCallback((idx: number) => {
    const arr = [...items]; arr.splice(idx, 1);
    setItems(arr);
    localStorage.setItem(domain, JSON.stringify(arr));
    initCount(arr.length);
  }, [items, domain, initCount]);

  const submitCart = useCallback(async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const results = await Promise.all(items.map(it =>
        fetch(`${API_URL}/orders/create`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...fd, product: it.product, productId: it.productId, storeId: it.storeId, userId: it.userId,
            variantDetailId: it.variantDetailId, selectedOffer: it.selectedOffer, selectedVariants: it.selectedVariants,
            finalPrice: it.finalPrice, totalPrice: (Number(it.finalPrice) * (it.quantity || 1)) + getLiv(),
            priceLivraison: getLiv(), quantity: it.quantity || 1,
          }),
        })
      ));
      if (results.every(r => r.ok)) {
        localStorage.removeItem(domain);
        initCount(0);
        setItems([]);
        setSuccess(true);
      } else { setErrors({ submit: t.errSubmit }); }
    } catch { setErrors({ submit: t.errSubmit }); }
    setSubmitting(false);
  }, [items, fd, validate, getLiv, domain, initCount, t]);

  if (!loaded) {
    return (
      <div className="luxe-container" style={{ padding: '4rem 1rem' }}>
        <div className="luxe-skeleton" style={{ height: 40, width: 200, marginBottom: 24 }} />
        <div className="luxe-skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="luxe-container">
        <div className="luxe-success-box" style={{ padding: '5rem 1rem' }}>
          <div className="luxe-success-icon"><Check size={32} /></div>
          <h3 style={{ fontFamily: "'El Messiri', serif", color: A, margin: '0 0 0.5rem' }}>{t.successTitle}</h3>
          <p style={{ color: SUB, margin: '0 0 1.5rem' }}>{t.successDesc}</p>
          <Link href="/" className="luxe-btn-primary" style={{ maxWidth: 280, margin: '0 auto' }}>{t.backToShop}</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="luxe-container">
        <div className="luxe-cart-empty">
          <div className="luxe-cart-empty-icon"><ShoppingCart size={32} /></div>
          <h3 style={{ fontFamily: "'El Messiri', serif", margin: '0 0 0.5rem' }}>{t.cartEmpty}</h3>
          <p style={{ color: SUB, margin: '0 0 1.5rem' }}>{t.cartEmptyDesc}</p>
          <Link href="/" className="luxe-btn-primary" style={{ maxWidth: 220, margin: '0 auto' }}>{t.backToShop}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="luxe-container">
      <h2 style={{ fontFamily: "'El Messiri', serif", fontSize: '1.5rem', margin: '2rem 0 1rem', color: A }}>{t.myCart}</h2>
      {freeShippingMin != null && (
        <div style={{ background: freeShippingReached ? AL : SURFACE, border: `1px solid ${freeShippingReached ? A : BD}`, color: freeShippingReached ? A : SUB, borderRadius: 8, padding: '12px 18px', marginBottom: '1.5rem', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
          {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', String(freeShippingRemainingAmt))}
        </div>
      )}
      <div className="luxe-cart-grid">
        <div>
          {items.map((it, idx) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            return (
              <div key={idx} className="luxe-cart-item">
                {img ? <img src={img} alt={it.product?.name} className="luxe-cart-item-img" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} /> : <div className="luxe-cart-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={24} color={BD} /></div>}
                <div className="luxe-cart-item-info">
                  <p className="luxe-cart-item-name">{it.product?.name}</p>
                  <p className="luxe-cart-item-price">{Number(it.finalPrice).toLocaleString()} {store?.currency}</p>
                  <p className="luxe-cart-item-qty">{t.qty}: {it.quantity || 1}</p>
                </div>
                <button className="luxe-cart-item-del" onClick={() => removeItem(idx)}><Trash2 size={18} /></button>
              </div>
            );
          })}
          <div className="luxe-summary" style={{ marginTop: '1.5rem' }}>
            <div className="luxe-summary-row"><span className="luxe-summary-label">{t.subtotal}</span><span className="luxe-summary-val">{cartTotal.toLocaleString()} {store?.currency}</span></div>
            <div className="luxe-summary-row"><span className="luxe-summary-label">{t.delivery}</span><span className="luxe-summary-val">{!selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${store?.currency}`}</span></div>
            <div className="luxe-summary-row"><span className="luxe-summary-label">{t.total}</span><span className="luxe-summary-val">{finalTotal.toLocaleString()} {store?.currency}</span></div>
          </div>
        </div>

        <div className="luxe-form">
          <p className="luxe-form-title">{t.confirmOrder}</p>

          <div className="luxe-input-wrap">
            <label>{t.fullName}</label>
            <input className={`luxe-input ${errors.name ? 'err' : ''}`} placeholder={t.fullNamePlaceholder} value={fd.customerName} onChange={e => setFd(p => ({...p, customerName: e.target.value}))} />
            {errors.name && <p style={{ color: ERR, fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {errors.name}</p>}
          </div>

          <div className="luxe-input-wrap">
            <label>{t.phone}</label>
            <input className={`luxe-input ${errors.phone ? 'err' : ''}`} placeholder={t.phonePlaceholder} value={fd.customerPhone} onChange={e => setFd(p => ({...p, customerPhone: e.target.value}))} />
            {errors.phone && <p style={{ color: ERR, fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {errors.phone}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="luxe-input-wrap">
              <label>{t.wilaya}</label>
              <div className="luxe-select-wrap">
                <select className={`luxe-select ${errors.wilaya ? 'err' : ''}`} value={fd.customerWelaya} onChange={e => setFd(p => ({...p, customerWelaya: e.target.value, customerCommune: ''}))} disabled={wilayas.length === 0}>
                  <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                  {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
                </select>
                <ChevronDown size={14} className="chevron" />
              </div>
              {errors.wilaya && <p style={{ color: ERR, fontSize: '0.75rem', marginTop: 4 }}><AlertCircle size={11} /> {errors.wilaya}</p>}
            </div>
            <div className="luxe-input-wrap">
              <label>{t.commune}</label>
              <div className="luxe-select-wrap">
                <select className={`luxe-select ${errors.commune ? 'err' : ''}`} value={fd.customerCommune} onChange={e => setFd(p => ({...p, customerCommune: e.target.value}))} disabled={!fd.customerWelaya || loadingC}>
                  <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                  {communes.map(c => <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>)}
                </select>
                <ChevronDown size={14} className="chevron" />
              </div>
              {errors.commune && <p style={{ color: ERR, fontSize: '0.75rem', marginTop: 4 }}><AlertCircle size={11} /> {errors.commune}</p>}
            </div>
          </div>

          <div className="luxe-delivery-toggle">
            <button className={`luxe-delivery-btn ${fd.typeLivraison === 'home' ? 'active' : ''}`} onClick={() => setFd(p => ({...p, typeLivraison: 'home'}))}>
              <Truck size={16} /> {t.deliveryHome}
            </button>
            <button className={`luxe-delivery-btn ${fd.typeLivraison === 'office' ? 'active' : ''}`} onClick={() => setFd(p => ({...p, typeLivraison: 'office'}))}>
              <Package size={16} /> {t.deliveryOffice}
            </button>
          </div>

          {errors.submit && <p style={{ color: ERR, fontSize: '0.85rem', marginBottom: 12, textAlign: 'center' }}>{errors.submit}</p>}

          <button className="luxe-btn-primary" onClick={submitCart} disabled={submitting}>
            {submitting ? <><Clock size={18} /> {t.sending}</> : <><Check size={18} /> {t.confirmOrder}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const stepIcons = [Check, Phone, Package, Truck];

  return (
    <div dir={t.dir} style={{ minHeight: '100vh', background: BG, padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', background: CARD, padding: '3rem 2rem', borderRadius: 12, border: `1px solid ${BD}`, marginBottom: '1.5rem' }}>
          <div style={{ width: 64, height: 64, background: '#FBF6EA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Check size={32} style={{ color: A }} />
          </div>
          <h3 style={{ fontFamily: "'El Messiri', serif", color: A, fontSize: '1.6rem', margin: '0 0 0.5rem' }}>{t.successTitle}</h3>
          <p style={{ color: SUB, lineHeight: 1.7, margin: 0 }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.75rem', color: TXT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${BD}`, fontSize: 14, fontWeight: 700, color: TXT }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: SUB }}>{t.total}</span>
                <span style={{ fontFamily: "'El Messiri', serif", fontSize: '1.2rem', color: A }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BD}`, overflow: 'hidden', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? Check;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? `1px solid ${BD}` : 'none', background: done ? '#FBF6EA' : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? A : '#F3EFE4', color: done ? '#fff' : SUB }}>
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
          <Link href="/" className="luxe-btn-primary" style={{ margin: '0 auto', maxWidth: 320 }}>{t.shopNow}</Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', borderRadius: 8, border: `1px solid ${BD}`, color: SUB, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Static Pages ─────────── */
export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  return (
    <div>
      <div className="luxe-static-header"><h1 className="luxe-static-title">{t.privacyTitle}</h1></div>
      <div className="luxe-static-body">
        {t.privacySections.map((s, i) => (<React.Fragment key={i}><h3>{i + 1}. {s.h}</h3><p>{s.p}</p></React.Fragment>))}
      </div>
    </div>
  );
}

export function Terms({ store }: any) {
  const t = T[getLang(store)];
  return (
    <div>
      <div className="luxe-static-header"><h1 className="luxe-static-title">{t.termsTitle}</h1></div>
      <div className="luxe-static-body">
        {t.termsSections.map((s, i) => (<React.Fragment key={i}><h3>{i + 1}. {s.h}</h3><p>{s.p}</p></React.Fragment>))}
      </div>
    </div>
  );
}

export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  return (
    <div>
      <div className="luxe-static-header"><h1 className="luxe-static-title">{t.cookiesTitle}</h1></div>
      <div className="luxe-static-body">
        {t.cookiesSections.map((s, i) => (<React.Fragment key={i}><h3>{i + 1}. {s.h}</h3><p>{s.p}</p></React.Fragment>))}
      </div>
    </div>
  );
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      const r = await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      if (r.ok) setSent(true);
    } catch {}
    setSending(false);
  };

  return (
    <div className="luxe-container">
      <div className="luxe-static-header" style={{ margin: '0 -1.5rem', padding: '3rem 1.5rem' }}>
        <h1 className="luxe-static-title">{t.contactTitle}</h1>
      </div>
      <div className="luxe-contact-grid">
        <div className="luxe-contact-info">
          <h3>{t.contactUs}</h3>
          {store?.contact?.phone && <div className="luxe-contact-row"><Phone size={18} color={A} /> {store.contact.phone}</div>}
          {store?.contact?.email && <div className="luxe-contact-row"><Mail size={18} color={A} /> {store.contact.email}</div>}
          {store?.contact?.wilaya && <div className="luxe-contact-row"><MapPin size={18} color={A} /> {store.contact.wilaya}{store?.contact?.address ? `, ${store.contact.address}` : ''}</div>}
        </div>
        <div className="luxe-form" style={{ margin: 0 }}>
          {!sent ? (
            <>
              <div className="luxe-input-wrap">
                <label>{t.fullName}</label>
                <input className="luxe-input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div className="luxe-input-wrap">
                <label>Email</label>
                <input className="luxe-input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
              </div>
              <div className="luxe-input-wrap">
                <label>{t.phone}</label>
                <input className="luxe-input" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
              </div>
              <div className="luxe-input-wrap">
                <label>Message</label>
                <textarea className="luxe-input" rows={5} style={{ resize: 'none' }} value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} />
              </div>
              <button className="luxe-btn-primary" onClick={submit} disabled={sending}>
                {sending ? t.sending : <><Send size={16} /> Send Message</>}
              </button>
            </>
          ) : (
            <div className="luxe-success-box">
              <div className="luxe-success-icon"><Check size={32} /></div>
              <h3 style={{ fontFamily: "'El Messiri', serif", color: A }}>Message Sent!</h3>
              <p style={{ color: SUB }}>Thank you for reaching out. We will get back to you soon.</p>
              <button className="luxe-btn-secondary" onClick={() => setSent(false)} style={{ maxWidth: 220, margin: '1rem auto 0' }}>Send Another</button>
            </div>
          )}
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
