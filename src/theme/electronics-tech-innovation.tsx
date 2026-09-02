'use client';

/* ============================================================================
   MdStore Theme — TECH INNOVATION (electronics-tech-innovation)
   Category : Electronics & Appliances
   ----------------------------------------------------------------------------
   NAVBAR ARCHETYPE : C — Floating Pill (squared tech variant, backdrop blur)
   CARD ARCHETYPE   : 5 — Framed Label (eyebrow strip + mono price + corner brackets)
   HERO LAYOUT      : full-bleed (absolute bg image + grid-line overlay + scrim)
   TYPOGRAPHY PAIR  : Cairo (display/body) + JetBrains Mono (prices/labels)
   CATEGORY ACTIVE  : bordered chip + mono uppercase (§16-E option 3)
   Differentiation  : distinct from smart-tech-phones (B+3) and sidou-box.
   ========================================================================== */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import { useCartStore } from '@/store/useCartStore';
import {
  ShoppingCart, Search, X, Menu, Phone, Mail, MapPin, ChevronDown,
  ChevronLeft, ChevronRight, Trash2, Cpu, Truck, ShieldCheck, Lock,
  Headphones, AlertCircle, CheckCircle2, Minus, Plus, Zap, Star, Send, Package, MessageCircle, Download,
} from 'lucide-react';

/* ========================= Types ========================= */

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
  isDigital?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}

/* ========================= Constants / Tokens ========================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const BG = '#060A12';        // page background — deep space navy
const BG2 = '#0B1220';       // section alt
const CARD = '#0E1626';      // card surface
const SRF = '#101B2E';       // inputs surface
const BD = '#1E2A3F';        // borders
const TXT = '#E6EDF7';       // primary text
const SUB = '#7C8DA6';       // secondary text
const A = '#00E5FF';         // accent — electric cyan
const AD = '#00B8D4';        // accent dark
const AL = 'rgba(0,229,255,0.08)';
const HOT = '#FF2E88';       // discount / error accent
const OK = '#34D399';

const FONT_BODY = "'Cairo', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Cairo', monospace";

/* ========================= Multilingual T (§3-A) ========================= */

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
    products: 'المنتجات', categories: 'الفئات', heroBadge: 'تقنية · ابتكار · جودة',
    trust: [
      { t: 'توصيل سريع', s: 'لكل الولايات' },
      { t: 'جودة مضمونة', s: 'منتجات أصلية 100%' },
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
    myCart: 'سلتي', subtotal: 'المجموع الفرعي', shippingInfo: 'معلومات الشحن',
    errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
    errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
    orderEmail: 'البريد الإلكتروني', emailPh: 'example@email.com', errEmail: 'يرجى إدخال بريد إلكتروني صحيح',
    whatsapp: 'رقم واتساب', whatsappPh: '0550123456', errWhatsapp: 'رقم واتساب جزائري صحيح مطلوب (مثال: 0550123456)',
    contactQuestion: 'هل تملك بريداً إلكترونياً أم واتساب؟', contactViaEmail: 'البريد الإلكتروني', contactViaWhatsapp: 'واتساب',
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'الوصف',
    freeShippingBadge: '🚚 توصيل مجاني',
    freeShippingThreshold: '🚚 توصيل مجاني للطلبات بـ {{amount}} دج أو أكثر',
    freeShippingRemaining: 'أضف {{amount}} دج أخرى للحصول على توصيل مجاني',
    freeShippingReached: '🎉 حصلت على توصيل مجاني!',
    searchResultsFor: 'نتائج البحث عن:',
    addedToCart: 'تمت الإضافة إلى السلة ✓',
    yourEmail: 'البريد الإلكتروني', yourMessage: 'رسالتك', sendMsg: 'إرسال الرسالة',
    msgSent: 'تم إرسال رسالتك بنجاح!', sendAnother: 'إرسال رسالة أخرى',
    location: 'الموقع', menu: 'القائمة',
    privacyBlocks: [
      { h: 'جمع البيانات', b: 'نجمع فقط المعلومات الضرورية لمعالجة طلبك: الاسم، رقم الهاتف، والعنوان. لا نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية.' },
      { h: 'استخدام البيانات', b: 'تُستخدم معلوماتك حصرياً لتأكيد الطلبات، تنظيم التوصيل، والتواصل معك بخصوص طلبك.' },
      { h: 'حماية البيانات', b: 'نطبق إجراءات أمنية صارمة لحماية معلوماتك الشخصية من الوصول غير المصرح به.' },
    ],
    termsBlocks: [
      { h: 'الطلبات', b: 'بتأكيد الطلب، أنت توافق على تزويدنا بمعلومات صحيحة. يتم تأكيد كل طلب هاتفياً قبل الشحن.' },
      { h: 'الأسعار والدفع', b: 'جميع الأسعار بالدينار الجزائري. الدفع عند الاستلام. سعر التوصيل يُحسب حسب الولاية ونوع التوصيل.' },
      { h: 'التوصيل', b: 'مدة التوصيل تتراوح بين 24 و72 ساعة حسب الولاية. يرجى التأكد من صحة العنوان ورقم الهاتف.' },
    ],
    cookiesBlocks: [
      { h: 'ما هي الكوكيز؟', b: 'ملفات صغيرة تُخزن في متصفحك لتحسين تجربة التسوق، مثل حفظ محتوى سلتك بين الزيارات.' },
      { h: 'كيف نستخدمها', b: 'نستخدم الكوكيز فقط لوظائف أساسية: حفظ السلة وتفضيلات التصفح. لا نستخدم كوكيز تتبع إعلانية.' },
    ],
  },
  fr: {
    dir: 'ltr' as const,
    home: 'Accueil', contact: 'Contact', cart: 'Panier',
    search: 'Rechercher...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats →',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la boutique',
    products: 'Produits', categories: 'Catégories', heroBadge: 'Tech · Innovation · Qualité',
    trust: [
      { t: 'Livraison Rapide', s: 'Partout en Algérie' },
      { t: 'Qualité Garantie', s: 'Produits certifiés' },
      { t: 'Paiement Sécurisé', s: 'Vos données protégées' },
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
    myCart: 'Mon Panier', subtotal: 'Sous-total', shippingInfo: 'Informations de livraison',
    errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
    errName: 'Nom complet requis (3 caractères minimum)',
    errPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
    orderEmail: 'E-mail', emailPh: 'exemple@email.com', errEmail: 'Veuillez saisir une adresse e-mail valide',
    whatsapp: 'Numéro WhatsApp', whatsappPh: '0550123456', errWhatsapp: 'Numéro WhatsApp algérien valide requis (ex: 0550123456)',
    contactQuestion: 'Avez-vous un e-mail ou un numéro WhatsApp ?', contactViaEmail: 'E-mail', contactViaWhatsapp: 'WhatsApp',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description',
    freeShippingBadge: '🚚 Livraison gratuite',
    freeShippingThreshold: '🚚 Livraison gratuite dès {{amount}} DZD d\'achat',
    freeShippingRemaining: 'Ajoutez {{amount}} DZD de plus pour la livraison gratuite',
    freeShippingReached: '🎉 Livraison gratuite obtenue !',
    searchResultsFor: 'Résultats pour :',
    addedToCart: 'Ajouté au panier ✓',
    yourEmail: 'Email', yourMessage: 'Votre message', sendMsg: 'Envoyer le message',
    msgSent: 'Message envoyé avec succès !', sendAnother: 'Envoyer un autre message',
    location: 'Localisation', menu: 'Menu',
    privacyBlocks: [
      { h: 'Collecte des données', b: "Nous collectons uniquement les informations nécessaires au traitement de votre commande : nom, téléphone et adresse. Vos données ne sont jamais partagées à des fins marketing." },
      { h: 'Utilisation des données', b: 'Vos informations servent exclusivement à confirmer les commandes, organiser la livraison et vous contacter à propos de votre commande.' },
      { h: 'Protection des données', b: "Nous appliquons des mesures de sécurité strictes pour protéger vos informations personnelles contre tout accès non autorisé." },
    ],
    termsBlocks: [
      { h: 'Commandes', b: 'En confirmant une commande, vous acceptez de fournir des informations exactes. Chaque commande est confirmée par téléphone avant expédition.' },
      { h: 'Prix et paiement', b: 'Tous les prix sont en dinars algériens. Paiement à la livraison. Les frais de livraison dépendent de la wilaya et du type de livraison.' },
      { h: 'Livraison', b: 'Le délai de livraison est de 24 à 72 heures selon la wilaya. Veuillez vérifier votre adresse et votre numéro de téléphone.' },
    ],
    cookiesBlocks: [
      { h: 'Que sont les cookies ?', b: 'De petits fichiers stockés dans votre navigateur pour améliorer votre expérience, comme la sauvegarde de votre panier entre les visites.' },
      { h: 'Notre utilisation', b: "Nous utilisons les cookies uniquement pour des fonctions essentielles : panier et préférences de navigation. Aucun cookie publicitaire." },
    ],
  },
  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart',
    search: 'Search products...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results →',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Shop Now',
    products: 'Products', categories: 'Categories', heroBadge: 'Tech · Innovation · Quality',
    trust: [
      { t: 'Fast Delivery', s: 'Across all wilayas' },
      { t: 'Quality Guaranteed', s: '100% authentic products' },
      { t: 'Secure Payment', s: 'Full data protection' },
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
    myCart: 'My Cart', subtotal: 'Subtotal', shippingInfo: 'Shipping Information',
    errSubmit: 'An error occurred. Please try again.',
    errName: 'Full name is required (at least 3 characters)',
    errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    orderEmail: 'Email', emailPh: 'example@email.com', errEmail: 'Please enter a valid email address',
    whatsapp: 'WhatsApp number', whatsappPh: '0550123456', errWhatsapp: 'A valid Algerian WhatsApp number is required (e.g. 0550123456)',
    contactQuestion: 'Do you have an email or a WhatsApp number?', contactViaEmail: 'Email', contactViaWhatsapp: 'WhatsApp',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Description',
    freeShippingBadge: '🚚 Free Delivery',
    freeShippingThreshold: '🚚 Free Delivery on orders over {{amount}} DZD',
    freeShippingRemaining: 'Add {{amount}} DZD more for free delivery',
    freeShippingReached: '🎉 You got free delivery!',
    searchResultsFor: 'Results for:',
    addedToCart: 'Added to cart ✓',
    yourEmail: 'Email', yourMessage: 'Your message', sendMsg: 'Send Message',
    msgSent: 'Your message was sent successfully!', sendAnother: 'Send another message',
    location: 'Location', menu: 'Menu',
    privacyBlocks: [
      { h: 'Data Collection', b: 'We only collect the information needed to process your order: name, phone number, and address. Your data is never shared with third parties for marketing purposes.' },
      { h: 'Data Usage', b: 'Your information is used exclusively to confirm orders, organize delivery, and contact you about your order.' },
      { h: 'Data Protection', b: 'We apply strict security measures to protect your personal information from unauthorized access.' },
    ],
    termsBlocks: [
      { h: 'Orders', b: 'By confirming an order you agree to provide accurate information. Every order is confirmed by phone before shipping.' },
      { h: 'Pricing & Payment', b: 'All prices are in Algerian dinars. Cash on delivery. Delivery fees depend on the wilaya and delivery type.' },
      { h: 'Delivery', b: 'Delivery takes 24 to 72 hours depending on the wilaya. Please double-check your address and phone number.' },
    ],
    cookiesBlocks: [
      { h: 'What are cookies?', b: 'Small files stored in your browser to improve your shopping experience, such as keeping your cart between visits.' },
      { h: 'How we use them', b: 'We use cookies only for essential functions: cart storage and browsing preferences. No advertising trackers.' },
    ],
  },
} as const;

/* ========================= Helpers ========================= */

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
};

const fmt = (n: any) => Number(n || 0).toLocaleString();
const cur = (store: any) => store?.currency || 'دج';

const getImg = (p: any) => p?.productImage || p?.imagesProduct?.[0]?.imageUrl || '';

/* ========================= Theme CSS (§18–§20) ========================= */

const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

.ti-root { background: ${BG}; color: ${TXT}; font-family: ${FONT_BODY}; min-height: 100vh; }
.ti-root * { box-sizing: border-box; }
.ti-root a { text-decoration: none; color: inherit; }
.ti-root img { max-width: 100%; }
.ti-container { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }
.ti-mono { font-family: ${FONT_MONO}; }

/* ---------- Keyframes (§20.1) ---------- */
@keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
@keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,229,255,0.35); } 50% { box-shadow: 0 0 0 10px rgba(0,229,255,0); } }
@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes scanline { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }

/* ---------- NAVBAR ARCHETYPE C — Floating squared pill ---------- */
.ti-nav {
  position: fixed; top: 14px; left: 50%; transform: translateX(-50%);
  width: min(94%, 1120px); z-index: 200;
  background: rgba(8, 13, 24, 0.72); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border: 1px solid ${BD}; border-radius: 6px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 18px; height: 60px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.ti-nav.scrolled { border-color: rgba(0,229,255,0.35); box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 24px rgba(0,229,255,0.08); }
.ti-nav-links { display: flex; align-items: center; gap: 26px; }
.ti-nav-burger { display: none; background: none; border: none; color: ${TXT}; cursor: pointer; padding: 10px; min-height: 44px; min-width: 44px; align-items: center; justify-content: center; }
.ti-nav-search-desktop { display: block; }
@media (max-width: 900px) {
  .ti-nav-links { display: none; }
  .ti-nav-burger { display: flex; }
  .ti-nav-search-desktop { display: none; }
}
.ti-nav-search-mobile-btn { display: none; }
@media (max-width: 900px) { .ti-nav-search-mobile-btn { display: flex; } }

.ti-nav-link { position: relative; font-size: 0.9rem; font-weight: 700; color: ${SUB}; transition: color 0.2s ease; padding: 6px 2px; }
.ti-nav-link:hover { color: ${TXT}; }
.ti-nav-link::after {
  content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px;
  background: ${A}; transform: scaleX(0); transform-origin: center; transition: transform 0.25s ease;
}
.ti-nav-link:hover::after { transform: scaleX(1); }

/* ---------- CARD ARCHETYPE 5 — Framed Label + corner brackets ---------- */
.ti-card {
  position: relative; background: ${CARD}; border: 1px solid ${BD}; border-radius: 4px;
  overflow: hidden; display: flex; flex-direction: column;
  transition: transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease, border-color 0.28s ease;
  animation: fadeUp 0.5s ease both;
  will-change: transform;
}
.ti-card:hover {
  transform: translateY(-6px);
  border-color: rgba(0,229,255,0.45);
  box-shadow: 0 20px 40px rgba(0,0,0,0.45), 0 0 20px rgba(0,229,255,0.07);
}
.ti-card::before, .ti-card::after {
  content: ''; position: absolute; width: 14px; height: 14px; z-index: 3;
  border-color: ${A}; border-style: solid; opacity: 0; transition: opacity 0.25s ease;
}
.ti-card::before { top: 6px; inset-inline-start: 6px; border-width: 2px 0 0 2px; }
.ti-card::after { bottom: 6px; inset-inline-end: 6px; border-width: 0 2px 2px 0; }
[dir='rtl'] .ti-card::before { border-width: 2px 2px 0 0; }
[dir='rtl'] .ti-card::after { border-width: 0 0 2px 2px; }
.ti-card:hover::before, .ti-card:hover::after { opacity: 1; }
.ti-card-imgwrap { aspect-ratio: 1/1; overflow: hidden; background: ${BG2}; position: relative; }
.ti-card-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
.ti-card:hover .ti-card-img { transform: scale(1.08); }

/* ---------- Buttons (§19, §20.3) ---------- */
.ti-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 0.875rem 1.5rem; min-height: 44px;
  background: ${A}; color: #04121A; font-weight: 800; font-size: 0.9rem;
  border: none; border-radius: 4px; cursor: pointer; width: 100%;
  font-family: inherit; letter-spacing: 0.02em;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
}
.ti-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,229,255,0.25); background: #4DEEFF; }
.ti-btn:active { transform: translateY(0) scale(0.97); }
.ti-btn:disabled { opacity: 0.65; cursor: default; transform: none; box-shadow: none; }
.ti-btn-outline { background: transparent; color: ${A}; border: 1px solid ${A}; }
.ti-btn-outline:hover { background: ${AL}; box-shadow: 0 8px 20px rgba(0,229,255,0.12); }
.ti-btn-ghost { background: transparent; color: ${SUB}; border: 1px solid ${BD}; }
.ti-btn-ghost:hover { color: ${TXT}; border-color: ${SUB}; background: transparent; box-shadow: none; }
.ti-btn-pulse { animation: pulseGlow 2.2s infinite; }
.ti-btn-icon { transition: transform 0.2s ease; }
.ti-btn:hover .ti-btn-icon { transform: translateX(3px); }
[dir='rtl'] .ti-btn:hover .ti-btn-icon { transform: translateX(-3px); }

/* ---------- Inputs (§19) ---------- */
.ti-input {
  width: 100%; padding: 0.75rem 1rem; font-size: 0.9rem;
  border: 1px solid ${BD}; border-radius: 4px; background: ${SRF}; color: ${TXT};
  outline: none; appearance: none; font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s; min-height: 44px;
}
.ti-input:focus { border-color: ${A}; box-shadow: 0 0 0 3px rgba(0,229,255,0.15); }
.ti-input.err { border-color: ${HOT}; }
.ti-input:disabled { opacity: 0.55; }
.ti-input option { background: ${SRF}; color: ${TXT}; }
.ti-label { display: block; font-size: 0.78rem; font-weight: 700; color: ${SUB}; margin-bottom: 0.35rem; font-family: ${FONT_MONO}; text-transform: uppercase; letter-spacing: 0.06em; }
.ti-form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
@media (min-width: 500px) { .ti-form-row-2 { grid-template-columns: 1fr 1fr; } }

/* ---------- Category chips (§16-E option 3: bordered chip) ---------- */
.ti-cat {
  display: inline-flex; align-items: center; padding: 8px 18px; min-height: 44px;
  border: 1px solid ${BD}; border-radius: 4px; color: ${SUB};
  font-family: ${FONT_MONO}; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
  white-space: nowrap; transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.ti-cat:hover { border-color: ${SUB}; color: ${TXT}; }
.ti-cat.active { border: 2px solid ${A}; color: ${A}; background: ${AL}; }

/* ---------- Products grid (§18) ---------- */
.ti-products-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 640px) { .ti-products-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .ti-products-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .ti-products-grid { grid-template-columns: repeat(4, 1fr); } }

/* ---------- Hero ---------- */
.ti-hero-title { animation: fadeUp 0.7s ease 0.1s both; }
.ti-hero-sub { animation: fadeUp 0.7s ease 0.25s both; }
.ti-hero-cta { animation: fadeUp 0.7s ease 0.4s both; }
.ti-hero-badge { animation: scaleIn 0.5s ease 0.55s both; }
.ti-hero-chip { animation: float 4s ease-in-out infinite; }
.ti-grid-overlay {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px);
  background-size: 56px 56px;
}

/* ---------- Layouts ---------- */
.ti-trust-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: ${BD}; border: 1px solid ${BD}; border-radius: 6px; overflow: hidden; }
@media (min-width: 768px) { .ti-trust-grid { grid-template-columns: repeat(4, 1fr); } }
.ti-details-inner { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
@media (min-width: 768px) { .ti-details-inner { grid-template-columns: 1fr 1fr; } }
.ti-cart-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 1024px) { .ti-cart-inner { grid-template-columns: 1.2fr 1fr; } }
.ti-footer-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .ti-footer-grid { grid-template-columns: 1.4fr 1fr 1fr 1fr; } }
.ti-contact-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 900px) { .ti-contact-grid { grid-template-columns: 1fr 1.4fr; } }

/* ---------- Search dropdown (desktop) — RTL-safe (§15.28) ---------- */
.ti-search-drop {
  position: absolute; top: calc(100% + 10px); inset-inline-end: 0; width: 340px;
  background: ${CARD}; border: 1px solid ${BD}; border-radius: 6px;
  box-shadow: 0 18px 50px rgba(0,0,0,0.6); z-index: 500;
  max-height: 380px; overflow-y: auto; animation: fadeIn 0.18s ease both;
}

/* ---------- Skeleton (§20.5) ---------- */
.ti-skeleton {
  background: linear-gradient(90deg, #101a2c 25%, #17233a 50%, #101a2c 75%);
  background-size: 400px 100%; animation: shimmer 1.4s infinite linear; border-radius: 4px;
}

/* ---------- Pagination ---------- */
.ti-page-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 44px; min-height: 44px; border: 1px solid ${BD}; border-radius: 4px;
  color: ${SUB}; font-family: ${FONT_MONO}; font-weight: 700; font-size: 0.85rem;
  transition: border-color 0.2s, color 0.2s;
}
.ti-page-btn:hover { border-color: ${A}; color: ${A}; }
.ti-page-btn.active { background: ${A}; color: #04121A; border-color: ${A}; }

@media (prefers-reduced-motion: reduce) {
  .ti-root *, .ti-root *::before, .ti-root *::after {
    animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important;
  }
}
`;

/* ========================= Small shared components ========================= */

function ProductImg({ src, alt, style }: { src?: string; alt: string; style?: React.CSSProperties }) {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [src]);
  if (src && !err) {
    return <img src={src} alt={alt} onError={() => setErr(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }} />;
  }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG2 }}>
      <Cpu size={40} color={BD} aria-hidden="true" />
    </div>
  );
}

function Stars() {
  return (
    <div style={{ display: 'flex', gap: 2 }} aria-hidden="true">
      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < 4 ? A : 'none'} color={i < 4 ? A : BD} />)}
    </div>
  );
}

function SummaryRow({ l, v, big }: { l: string; v: string; big?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '0.5rem 0' }}>
      <span style={{ flexShrink: 0, color: big ? TXT : SUB, fontWeight: big ? 800 : 600, fontSize: big ? '1rem' : '0.85rem' }}>{l}</span>
      <span className="ti-mono" style={{ whiteSpace: 'nowrap', fontWeight: big ? 800 : 600, color: big ? A : TXT, fontSize: big ? '1.15rem' : '0.9rem' }}>{v}</span>
    </div>
  );
}

/* ========================= Main (§4) ========================= */

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
    <div dir={t.dir} className="ti-root">
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <main style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease', paddingTop: 90, minHeight: '70vh' }}>
        {children}
      </main>
      <Footer store={store} />
    </div>
  );
}

/* ========================= Navbar (§5, ARCHETYPE C) ========================= */

export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const debounceRef = useRef<any>(null);

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) { setListSearch([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery.trim())}`);
        const d = await r.json();
        setListSearch(Array.isArray(d) ? d : (d?.products || []));
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, domain]);

  const submitSearch = () => {
    if (!searchQuery.trim()) return;
    setShowSearch(false); setSearchFocused(false);
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const closeMobileSearch = () => { setShowSearch(false); setSearchQuery(''); setListSearch([]); };

  const mobileLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const ResultRow = ({ p, onPick }: any) => (
    <Link href={`/product/${p.slug || p.id}`} onClick={onPick}
      style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${BD}`, alignItems: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
        <ProductImg src={getImg(p)} alt={p.name} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: TXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
        <p className="ti-mono" style={{ fontSize: '0.8rem', color: A, margin: 0, fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(p.price)} {cur(store)}</p>
      </div>
    </Link>
  );

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="ti-mono" style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 199,
          background: A, color: '#04121A', textAlign: 'center',
          padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
        }}>
          {store.topBar.text}
        </div>
      )}

      {/* NAVBAR ARCHETYPE: C — Floating squared pill */}
      <header className={`ti-nav ${scrolled ? 'scrolled' : ''}`} style={store?.topBar?.enabled && store?.topBar?.text ? { top: 38 } : undefined}>
        {/* Mobile: burger */}
        <button className="ti-nav-burger" onClick={() => setOpen(true)} aria-label={t.menu}>
          <Menu size={22} />
        </button>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44 }}>
          {store?.design?.logoUrl && !imgError ? (
            <img src={store.design.logoUrl} alt={store?.name || 'logo'} onError={() => setImgError(true)}
              style={{ height: 34, width: 'auto', display: 'block' }} />
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color={A} aria-hidden="true" />
              <span style={{ fontWeight: 900, fontSize: '1.05rem', color: TXT, letterSpacing: '0.02em' }}>{store?.name}</span>
            </span>
          )}
        </Link>

        {/* Desktop links */}
        <nav className="ti-nav-links" aria-label="main">
          <Link href="/" className="ti-nav-link">{t.home}</Link>
          <Link href="/contact" className="ti-nav-link">{t.contact}</Link>
        </nav>

        {/* Right cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Desktop search: expanding inline bar + dropdown */}
          <div className="ti-nav-search-desktop" style={{ position: 'relative' }}>
            <form onSubmit={(e) => { e.preventDefault(); submitSearch(); }} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                className="ti-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                aria-label={t.search}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                style={{ width: searchFocused ? 260 : 170, transition: 'width 0.3s ease', minHeight: 40, padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
              />
            </form>
            {searchFocused && searchQuery.trim().length >= 2 && (
              <div className="ti-search-drop">
                {loading && <p style={{ padding: '1rem', textAlign: 'center', color: SUB, fontSize: '0.85rem', margin: 0 }}>{t.searching}</p>}
                {!loading && listSearch.length === 0 && (
                  <p style={{ padding: '1rem', textAlign: 'center', color: SUB, fontSize: '0.85rem', margin: 0 }}>{t.noResults}</p>
                )}
                {listSearch.map((p) => <ResultRow key={p.id} p={p} onPick={() => setSearchFocused(false)} />)}
                {listSearch.length > 0 && (
                  <Link href={`/?search=${encodeURIComponent(searchQuery.trim())}`} onClick={() => setSearchFocused(false)}
                    className="ti-mono"
                    style={{ display: 'block', padding: '12px 16px', textAlign: 'center', fontSize: '0.78rem', color: A, fontWeight: 700 }}>
                    {t.showAll}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile search icon */}
          <button className="ti-nav-burger ti-nav-search-mobile-btn" onClick={() => setShowSearch(true)} aria-label={t.search}>
            <Search size={21} />
          </button>

          {/* Cart icon — gated (§15.1, §15.27) */}
          {store?.cart !== false && (
            <Link href="/cart" aria-label={t.cart}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44, color: TXT }}>
              <ShoppingCart size={21} />
              {count > 0 && (
                <span className="ti-mono" style={{
                  position: 'absolute', top: 4, insetInlineEnd: 2,
                  background: A, color: '#04121A', borderRadius: 3,
                  fontSize: '0.62rem', fontWeight: 700, minWidth: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
                }}>
                  {count}
                </span>
              )}
            </Link>
          )}
        </div>
      </header>

      {/* Mobile menu overlay — page links only, never cart (§15.9) */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(4,8,16,0.85)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease both' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{ maxWidth: 420, margin: '0 auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setOpen(false)} aria-label={t.cancel}
                style={{ background: 'none', border: `1px solid ${BD}`, borderRadius: 4, color: TXT, cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={22} />
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: '18vh', textAlign: 'center' }} aria-label="mobile">
              {mobileLinks.map((lnk, i) => (
                <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)}
                  style={{
                    fontSize: '1.5rem', fontWeight: 800, color: TXT, padding: '0.9rem',
                    border: `1px solid ${BD}`, borderRadius: 4, background: CARD,
                    animation: `fadeUp 0.4s ease ${0.08 + i * 0.08}s both`,
                  }}>
                  {lnk.l}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile search — full-screen overlay (§5) */}
      {showSearch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(4,8,16,0.7)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeMobileSearch(); }}>
          <div style={{ background: CARD, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${BD}` }}>
            <Search size={20} color={SUB} aria-hidden="true" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
              placeholder={t.search}
              aria-label={t.search}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: TXT, fontFamily: 'inherit', minHeight: 44 }}
            />
            <button onClick={closeMobileSearch} aria-label={t.cancel}
              style={{ background: 'none', border: 'none', color: TXT, cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={22} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: BG2 }}>
            {loading && <p style={{ padding: '1rem', textAlign: 'center', color: SUB, margin: 0 }}>{t.searching}</p>}
            {listSearch.map((p) => <ResultRow key={p.id} p={p} onPick={closeMobileSearch} />)}
            {listSearch.length > 0 && (
              <Link href={`/?search=${encodeURIComponent(searchQuery.trim())}`} onClick={closeMobileSearch}
                className="ti-mono"
                style={{ display: 'block', padding: '14px', textAlign: 'center', fontWeight: 700, color: A, fontSize: '0.85rem' }}>
                {t.showAll}
              </Link>
            )}
            {searchQuery.trim().length >= 2 && !loading && listSearch.length === 0 && (
              <p style={{ padding: '2rem', textAlign: 'center', color: SUB, margin: 0 }}>{t.noResults}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ========================= Footer (§6) ========================= */

export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const year = new Date().getFullYear();

  const links = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contact },
  ].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);

  return (
    <footer style={{ background: BG2, borderTop: `1px solid ${BD}`, marginTop: '4rem' }}>
      <div className="ti-container" style={{ padding: '3rem 1.5rem 2rem' }}>
        <div className="ti-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <Zap size={18} color={A} aria-hidden="true" />
              <span style={{ fontWeight: 900, fontSize: '1.15rem', color: TXT }}>{store?.name}</span>
            </div>
            {store?.hero?.subtitle && (
              <p style={{ color: SUB, fontSize: '0.88rem', lineHeight: 1.7, margin: 0, maxWidth: 340 }}>{store.hero.subtitle}</p>
            )}
          </div>
          <div>
            <h4 className="ti-mono" style={{ color: TXT, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>{t.quickLinks}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((lnk) => (
                <li key={lnk.h}>
                  <Link href={lnk.h} style={{ color: SUB, fontSize: '0.88rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = A)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = SUB)}>
                    {lnk.l}
                  </Link>
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
            <h4 className="ti-mono" style={{ color: TXT, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>{t.contactUs}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {store?.contact?.phone && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, color: SUB, fontSize: '0.88rem' }}>
                  <Phone size={15} color={A} aria-hidden="true" />
                  <a href={`tel:${store.contact.phone}`} className="ti-mono" dir="ltr">{store.contact.phone}</a>
                </li>
              )}
              {store?.contact?.email && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, color: SUB, fontSize: '0.88rem' }}>
                  <Mail size={15} color={A} aria-hidden="true" />
                  <a href={`mailto:${store.contact.email}`}>{store.contact.email}</a>
                </li>
              )}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, color: SUB, fontSize: '0.88rem' }}>
                  <MapPin size={15} color={A} aria-hidden="true" />
                  <span>{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' — ')}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${BD}`, marginTop: '2.5rem', paddingTop: '1.25rem', textAlign: 'center' }}>
          <p className="ti-mono" style={{ color: SUB, fontSize: '0.72rem', margin: 0, letterSpacing: '0.05em' }}>
            © {year} {store?.name} — {t.rightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ========================= Card (§7, ARCHETYPE 5) ========================= */

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  // CARD ARCHETYPE: 5 — Framed Label (eyebrow strip + mono price + corner brackets)
  const t = T[getLang(store)];
  const img = displayImage || getImg(product);

  return (
    <Link href={`/product/${product.slug || product.id}`} className="ti-card" onClick={viewDetails}>
      {/* Eyebrow label strip */}
      <div className="ti-mono" style={{
        background: BG2, padding: '4px 12px', fontSize: '0.62rem', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: SUB, borderBottom: `1px solid ${BD}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.store?.name || t.products}</span>
        <Zap size={10} color={A} aria-hidden="true" style={{ flexShrink: 0 }} />
      </div>

      <div className="ti-card-imgwrap">
        {img ? <ProductImg src={img} alt={product.name} style={{ transition: 'transform 0.5s ease' } as any} /> : <ProductImg alt={product.name} />}
        {discount > 0 && (
          <span className="ti-mono" style={{
            position: 'absolute', top: 10, insetInlineStart: 10, zIndex: 2,
            background: HOT, color: '#fff', fontSize: '0.68rem', fontWeight: 700,
            padding: '3px 8px', borderRadius: 3, letterSpacing: '0.04em',
          }}>
            -{discount}%
          </span>
        )}
        {product.isDigital ? (
          <span className="ti-mono" style={{
            position: 'absolute', top: 10, insetInlineEnd: 10, zIndex: 2,
            background: A, color: BG, fontSize: '0.62rem', fontWeight: 700,
            padding: '3px 8px', borderRadius: 3, display: 'flex', alignItems: 'center',
          }}>
            <Download size={12} />
          </span>
        ) : product.shippingFree && (
          <span className="ti-mono" style={{
            position: 'absolute', top: 10, insetInlineEnd: 10, zIndex: 2,
            background: TXT, color: BG, fontSize: '0.62rem', fontWeight: 700,
            padding: '3px 8px', borderRadius: 3,
          }}>
            🚚
          </span>
        )}
      </div>

      <div style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <p style={{
          fontSize: '0.9rem', fontWeight: 700, color: TXT, margin: 0, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.7em',
        }}>
          {product.name}
        </p>
        <Stars />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginTop: 'auto' }}>
          <span className="ti-mono" style={{ fontWeight: 800, color: A, fontSize: '1.02rem', whiteSpace: 'nowrap' }}>
            {fmt(product.price)} {cur(store)}
          </span>
          {product.priceOriginal && Number(product.priceOriginal) > Number(product.price) && (
            <span className="ti-mono" style={{ color: SUB, fontSize: '0.78rem', textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
              {fmt(product.priceOriginal)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ========================= Home (§8) ========================= */

export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const searchTerm = searchParams.get('search');
  const currentPage = Number(page || searchParams.get('page') || 1);

  const products: any[] = store?.products || [];
  const cats: any[] = store?.categories || [];
  const countPage = Math.ceil((store?.count || products.length) / 48);
  const trustIcons = [Truck, ShieldCheck, Lock, Headphones];

  const heroTitle = store?.hero?.title
    ? DOMPurify.sanitize(store.hero.title)
    : DOMPurify.sanitize(store?.name || '');

  return (
    <div>
      {/* HERO — full-bleed: absolute bg image + grid overlay + scrim */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: 'clamp(480px, 68vh, 760px)',
        display: 'flex', alignItems: 'center',
        background: `radial-gradient(1200px 600px at 80% -10%, rgba(0,229,255,0.12), transparent 60%), ${BG}`,
        borderBottom: `1px solid ${BD}`,
      }}>
        {store?.hero?.imageUrl && (
          <>
            <img src={store.hero.imageUrl} alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,10,18,0.96) 10%, rgba(6,10,18,0.55) 60%, rgba(6,10,18,0.75) 100%)' }} />
          </>
        )}
        <div className="ti-grid-overlay" />

        <div className="ti-container" style={{ position: 'relative', zIndex: 2, padding: '5rem 1.5rem', width: '100%' }}>
          <div style={{ maxWidth: 720, marginInlineEnd: 'auto', textAlign: t.dir === 'rtl' ? 'right' : 'left' }}>
            <span className="ti-hero-badge ti-mono" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: `1px solid ${A}`, color: A, background: AL,
              padding: '5px 14px', borderRadius: 3, fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.25rem',
            }}>
              <Cpu size={13} aria-hidden="true" /> {t.heroBadge}
            </span>

            <h1 className="ti-hero-title" dir={t.dir} style={{
              fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.2,
              margin: '0 0 1rem', color: TXT, textAlign: t.dir === 'rtl' ? 'right' : 'left',
            }}
              dangerouslySetInnerHTML={{ __html: heroTitle }} />

            {store?.hero?.subtitle && (
              <p className="ti-hero-sub" style={{ color: SUB, fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', lineHeight: 1.8, margin: '0 0 2rem', maxWidth: 560, textAlign: t.dir === 'rtl' ? 'right' : 'left' }}>
                {store.hero.subtitle}
              </p>
            )}

            <div className="ti-hero-cta" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#products" className="ti-btn ti-btn-pulse" style={{ width: 'auto', minWidth: 180 }}>
                {t.shopNow} <ChevronDown size={16} className="ti-btn-icon" aria-hidden="true" />
              </a>
              {store?.cart !== false && (
                <Link href="/cart" className="ti-btn ti-btn-outline" style={{ width: 'auto', minWidth: 150 }}>
                  <ShoppingCart size={16} aria-hidden="true" /> {t.cart}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* floating deco chip */}
        <div className="ti-hero-chip ti-mono" aria-hidden="true" style={{
          position: 'absolute', bottom: 36, left: '25%', zIndex: 2,
          border: `1px solid ${BD}`, background: 'rgba(14,22,38,0.8)', backdropFilter: 'blur(8px)',
          borderRadius: 4, padding: '10px 16px', fontSize: '0.7rem', color: SUB, letterSpacing: '0.1em',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: OK, display: 'inline-block' }} />
          ONLINE · 24/7
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="ti-container" style={{ padding: '2.5rem 1.5rem 0' }}>
        <div className="ti-trust-grid">
          {t.trust.map((item, i) => {
            const Icon = trustIcons[i];
            return (
              <div key={item.t} style={{ background: CARD, padding: '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: 12, animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}>
                <Icon size={22} color={A} aria-hidden="true" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.85rem', margin: 0, color: TXT }}>{item.t}</p>
                  <p style={{ color: SUB, fontSize: '0.74rem', margin: 0 }}>{item.s}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CATEGORIES — server-side filtering via URL only (§8) */}
      {cats.length > 0 && (
        <section className="ti-container" style={{ padding: '2.5rem 1.5rem 0' }}>
          <h2 className="ti-mono" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: SUB, marginBottom: '1rem' }}>
            // {t.categories}
          </h2>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            <Link href="/" className={`ti-cat ${!activeCategory ? 'active' : ''}`}>{t.all}</Link>
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`}
                className={`ti-cat ${activeCategory === String(cat.id) ? 'active' : ''}`}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" className="ti-container" style={{ padding: '2.5rem 1.5rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 900, margin: 0, color: TXT }}>
            {searchTerm ? `${t.searchResultsFor} "${searchTerm}"` : t.products}
          </h2>
          <span style={{ flex: 1, height: 1, background: BD }} aria-hidden="true" />
          <span className="ti-mono" style={{ color: SUB, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{products.length.toString().padStart(2, '0')}</span>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', border: `1px dashed ${BD}`, borderRadius: 6 }}>
            <Cpu size={44} color={BD} aria-hidden="true" />
            <p style={{ color: SUB, marginTop: '1rem' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="ti-products-grid">
            {products.map((p: any, i: number) => {
              const po = Number(p.priceOriginal || 0);
              const pr = Number(p.price || 0);
              const discount = po > pr && po > 0 ? Math.round(((po - pr) / po) * 100) : 0;
              return (
                <div key={p.id} style={{ animationDelay: `${(i % 8) * 0.07}s` }}>
                  <Card product={p} displayImage={getImg(p)} discount={discount} store={store} />
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[...Array(countPage)].map((_, i) => {
              const n = i + 1;
              return (
                <Link key={n} scroll={false}
                  href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), ...(searchTerm ? { search: searchTerm } : {}), page: n } }}
                  className={`ti-page-btn ${currentPage === n ? 'active' : ''}`}>
                  {n}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ========================= Details (§9) ========================= */

export function Details({ product, store: storeprop, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const store = storeprop || product?.store; // §15.25 — storeprop has language, product.store often doesn't
  const t = T[getLang(store)];
  const [sel, setSel] = useState(0);

  const images: string[] = (allImages && allImages.length > 0)
    ? allImages
    : [getImg(product)].filter(Boolean);

  const next = () => setSel((s) => (s + 1) % Math.max(images.length, 1));
  const prev = () => setSel((s) => (s - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));

  return (
    <div className="ti-container" style={{ padding: '2rem 1.5rem 3rem' }}>
      <div className="ti-details-inner">
        {/* Gallery */}
        <div>
          <div style={{ position: 'relative', border: `1px solid ${BD}`, borderRadius: 6, overflow: 'hidden', aspectRatio: '1/1', background: CARD, animation: 'scaleIn 0.4s ease both' }}>
            <ProductImg src={images[sel]} alt={product?.name} />
            {discount > 0 && (
              <span className="ti-mono" style={{ position: 'absolute', top: 12, insetInlineStart: 12, background: HOT, color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 3 }}>
                -{discount}%
              </span>
            )}
            {images.length > 1 && (
              <>
                <button onClick={prev} aria-label="previous image" style={{
                  position: 'absolute', top: '50%', insetInlineStart: 10, transform: 'translateY(-50%)',
                  background: 'rgba(8,13,24,0.75)', border: `1px solid ${BD}`, borderRadius: 4, color: TXT,
                  cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                <button onClick={next} aria-label="next image" style={{
                  position: 'absolute', top: '50%', insetInlineEnd: 10, transform: 'translateY(-50%)',
                  background: 'rgba(8,13,24,0.75)', border: `1px solid ${BD}`, borderRadius: 4, color: TXT,
                  cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.dir === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setSel(i)} aria-label={`image ${i + 1}`} style={{
                  width: 68, height: 68, flexShrink: 0, borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
                  border: sel === i ? `2px solid ${A}` : `1px solid ${BD}`, background: CARD, padding: 0,
                }}>
                  <ProductImg src={img} alt={`${product?.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info + Form */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
          <h1 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.9rem)', fontWeight: 900, margin: '0 0 0.5rem', color: TXT, lineHeight: 1.35 }}>
            {product?.name}
          </h1>
          <div style={{ marginBottom: '1rem' }}><Stars /></div>

          {/* Price box */}
          <div style={{ border: `1px solid ${BD}`, borderInlineStart: `3px solid ${A}`, background: CARD, borderRadius: 4, padding: '0.9rem 1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span className="ti-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: A, whiteSpace: 'nowrap' }}>
              {fmt(finalPrice)} {cur(store)}
            </span>
            {product?.priceOriginal && Number(product.priceOriginal) > Number(finalPrice) && (
              <span className="ti-mono" style={{ color: SUB, textDecoration: 'line-through', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                {fmt(product.priceOriginal)}
              </span>
            )}
          </div>

          {(product?.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: A, marginBottom: '1.25rem' }}>
              {product?.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', String(store.freeShippingMinAmount))}
            </p>
          )}

          {/* Offers */}
          {product?.offers && product.offers.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="ti-label">{t.offersTitle}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o: Offer) => {
                  const active = selectedOffer === o.id;
                  return (
                    <button key={o.id} onClick={() => setSelectedOffer(active ? null : o.id)} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                      padding: '0.75rem 1rem', minHeight: 44, cursor: 'pointer', width: '100%',
                      border: active ? `2px solid ${A}` : `1px solid ${BD}`,
                      background: active ? AL : SRF, borderRadius: 4, color: TXT, fontFamily: 'inherit',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                          border: active ? `5px solid ${A}` : `2px solid ${SUB}`, display: 'inline-block',
                        }} aria-hidden="true" />
                        <span>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block' }}>{o.name} × {o.quantity}</span>
                          {o.subTitle && <span style={{ fontSize: '0.76rem', color: SUB, display: 'block' }}>{o.subTitle}</span>}
                          {o.shippingFree && <span style={{ fontSize: '0.74rem', fontWeight: 700, color: A, display: 'block' }}>{t.freeShippingBadge}</span>}
                        </span>
                      </span>
                      <span className="ti-mono" style={{ fontWeight: 800, color: A, whiteSpace: 'nowrap' }}>{fmt(o.price)} {cur(store)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attributes */}
          {allAttrs && allAttrs.length > 0 && allAttrs.map((attr: Attribute) => (
            <div key={attr.id} style={{ marginBottom: '1.25rem' }}>
              <p className="ti-label">{attr.name}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {attr.variants.map((v: Variant) => {
                  const active = selectedVariants?.[attr.name] === v.value;
                  const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                    Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                      ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                    )
                  );
                  if (attr.displayMode === 'color') {
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} aria-label={v.value} title={v.value} style={{
                        width: 40, height: 40, borderRadius: '50%', cursor: available ? 'pointer' : 'not-allowed', background: v.value,
                        border: active ? `3px solid ${A}` : `2px solid ${BD}`,
                        outline: active ? `2px solid ${BG}` : 'none', outlineOffset: -6,
                        transition: 'border-color 0.2s, transform 0.15s',
                        transform: active ? 'scale(1.1)' : 'none', opacity: available ? 1 : 0.35,
                      }} />
                    );
                  }
                  if (attr.displayMode === 'image') {
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} aria-label={v.value} style={{
                        width: 56, height: 56, borderRadius: 4, overflow: 'hidden', cursor: available ? 'pointer' : 'not-allowed', padding: 0,
                        border: active ? `2px solid ${A}` : `1px solid ${BD}`, background: CARD, opacity: available ? 1 : 0.35,
                      }}>
                        <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </button>
                    );
                  }
                  return (
                    <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{
                      padding: '0.55rem 1rem', minHeight: 44, cursor: available ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                      border: active ? `2px solid ${A}` : `1px solid ${BD}`, borderRadius: 4,
                      background: active ? AL : SRF, color: active ? A : (available ? TXT : '#555'), fontWeight: 700, fontSize: '0.85rem',
                      transition: 'border-color 0.2s, color 0.2s, background 0.2s', textDecoration: available ? 'none' : 'line-through',
                    }}>
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Order form — domain forwarded as real prop (§15.26), store passed (§15.25) */}
          <ProductForm
            product={product}
            store={store}
            userId={product?.store?.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
          />
        </div>
      </div>

      {/* Description */}
      {product?.desc && (
        <div style={{ marginTop: '3rem', border: `1px solid ${BD}`, borderRadius: 6, background: CARD, padding: '1.5rem' }}>
          <h2 className="ti-mono" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: SUB, marginTop: 0, marginBottom: '1rem' }}>
            // {t.descTitle}
          </h2>
          <div style={{ color: TXT, lineHeight: 1.9, fontSize: '0.95rem' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
        </div>
      )}
    </div>
  );
}

/* ========================= ProductForm (§10) ========================= */

export function ProductForm({ product, store: storeprop, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: any) {
  const store = storeprop || product?.store; // §15.25
  const t = T[getLang(store)];
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  // §17 — String() coercion on both sides
  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getFP = (): number => {
    if (selectedOffer) {
      const o = product?.offers?.find((of: Offer) => of.id === selectedOffer);
      if (o) return Number(o.price);
    }
    if (selectedVariants && Object.keys(selectedVariants).length > 0 && product?.variantDetails?.length) {
      const d = product.variantDetails.find((vd: VariantDetail) => variantMatches(vd, selectedVariants));
      if (d && Number(d.price) !== -1) return Number(d.price);
    }
    return Number(product?.price || 0);
  };

  const getVarId = () => {
    if (!selectedVariants || Object.keys(selectedVariants).length === 0) return null;
    const d = product?.variantDetails?.find((vd: VariantDetail) => variantMatches(vd, selectedVariants));
    return d ? d.id : null;
  };

  const fp = getFP();
  const supportQty = (store?.supportQty ?? product?.store?.supportQty) !== false;
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = product?.offers?.find((o: Offer) => o.id === selectedOffer);
  const orderFreeShipping = !!(product?.shippingFree || selOfferObj?.shippingFree ||
    (store?.supportFreeShipping && store?.freeShippingMinAmount != null && (fp * qty) >= Number(store.freeShippingMinAmount)));
  // §10 — Number() coercion, per-wilaya per-type
  const getLiv = useCallback((): number => {
    if (product?.isDigital) return 0;
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping, product?.isDigital]);
  const total = () => fp * qty + getLiv();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhone;
    if (product?.isDigital) {
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
    const shipping = product?.isDigital
      ? { ...(contactMethod === 'email' ? { customerEmail } : { customerWhatsapp }) }
      : { customerWelaya, customerCommune, typeLivraison, priceLoss };
    return {
      ...rest,
      ...shipping,
      quantity: qty,
      product,
      productId: product?.id,
      storeId: product?.store?.id || store?.id,
      userId,
      selectedOffer,
      selectedVariants,
      platform,
      variantDetailId: getVarId(),
      finalPrice: fp,
      totalPrice: total(),
      priceLivraison: getLiv(), // §10.5 — always its own field
      addedAt: Date.now(),
    };
  };

  // §10 / §15.14 — addToCart never validates
  const addToCart = () => {
    if (!domain) return;
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      arr.push(buildPayload());
      localStorage.setItem(domain, JSON.stringify(arr));
      initCount(arr.length);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch { /* noop */ }
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!r.ok) throw new Error('order failed');
      const d = await r.json().catch(() => ({}));
      if (d?.customerId) localStorage.setItem('customerId', String(d.customerId));
      router.push(`/successfully?productId=${product?.id}`);
    } catch {
      setErrors((e) => ({ ...e, submit: t.errSubmit }));
      setSubmitting(false);
    }
  };

  const set = (k: string, v: any) => setFd((f) => ({ ...f, [k]: v }));

  const FieldErr = ({ k }: { k: string }) => errors[k] ? (
    <p style={{ fontSize: '0.75rem', color: HOT, marginTop: '0.3rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
      <AlertCircle size={11} aria-hidden="true" /> {errors[k]}
    </p>
  ) : null;

  return (
    <div style={{ border: `1px solid ${BD}`, borderRadius: 6, background: CARD, padding: '1.25rem', marginTop: '0.5rem' }}>
      {/* Quantity */}
      {supportQty && !product?.isDigital && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: '1rem' }}>
          <span className="ti-label" style={{ marginBottom: 0 }}>{t.qty}</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BD}`, borderRadius: 4, overflow: 'hidden' }}>
            <button onClick={() => set('quantity', Math.max(1, fd.quantity - 1))} aria-label="-" style={{
              width: 40, height: 40, background: SRF, border: 'none', color: TXT, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Minus size={15} />
            </button>
            <span className="ti-mono" style={{ minWidth: 44, textAlign: 'center', fontWeight: 800, color: TXT }}>{fd.quantity}</span>
            <button onClick={() => set('quantity', fd.quantity + 1)} aria-label="+" style={{
              width: 40, height: 40, background: SRF, border: 'none', color: TXT, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isOrderNow && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="ti-btn ti-btn-pulse" onClick={() => setIsOrderNow(true)}>
            <Zap size={16} aria-hidden="true" /> {t.orderNow}
          </button>
          {store?.cart !== false && !product?.isDigital && ( // §15.27 — never === true
            <button className="ti-btn ti-btn-outline" onClick={addToCart}>
              <ShoppingCart size={16} aria-hidden="true" /> {added ? t.addedToCart : t.addToCart}
            </button>
          )}
        </div>
      )}

      {/* Order form — fields → toggle → summary → buttons (§15.24) */}
      {isOrderNow && (
        <div style={{ animation: 'fadeUp 0.35s ease both' }}>
          <div style={{ marginBottom: '0.875rem' }}>
            <label className="ti-label" htmlFor="ti-name">{t.fullName}</label>
            <input id="ti-name" className={`ti-input ${errors.customerName ? 'err' : ''}`}
              value={fd.customerName} onChange={(e) => set('customerName', e.target.value)}
              placeholder={t.fullNamePlaceholder} />
            <FieldErr k="customerName" />
          </div>

          <div style={{ marginBottom: '0.875rem' }}>
            <label className="ti-label" htmlFor="ti-phone">{t.phone}</label>
            <input id="ti-phone" className={`ti-input ti-mono ${errors.customerPhone ? 'err' : ''}`} dir="ltr"
              inputMode="tel" value={fd.customerPhone} onChange={(e) => set('customerPhone', e.target.value)}
              placeholder={t.phonePlaceholder} />
            <FieldErr k="customerPhone" />
          </div>

          {product?.isDigital ? (
            <div style={{ marginBottom: '1rem' }}>
              <span className="ti-label" style={{ display: 'block', marginBottom: '0.5rem' }}>{t.contactQuestion}</span>
              <div style={{ display: 'flex', border: `1px solid ${BD}`, borderRadius: 4, overflow: 'hidden', marginBottom: '0.75rem' }}>
                <button type="button" onClick={() => { setContactMethod('email'); set('customerWhatsapp', ''); }} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.65rem 0',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700,
                  background: contactMethod === 'email' ? A : 'transparent', color: contactMethod === 'email' ? CARD : SUB,
                }}>
                  <Mail size={14} aria-hidden="true" />{t.contactViaEmail}
                </button>
                <button type="button" onClick={() => { setContactMethod('whatsapp'); set('customerEmail', ''); }} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.65rem 0',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700,
                  background: contactMethod === 'whatsapp' ? A : 'transparent', color: contactMethod === 'whatsapp' ? CARD : SUB,
                }}>
                  <MessageCircle size={14} aria-hidden="true" />{t.contactViaWhatsapp}
                </button>
              </div>
              {contactMethod === 'email' ? (
                <div>
                  <label className="ti-label" htmlFor="ti-email">{t.orderEmail}</label>
                  <input id="ti-email" className={`ti-input ${errors.customerEmail ? 'err' : ''}`} dir="ltr"
                    type="email" value={fd.customerEmail} onChange={(e) => set('customerEmail', e.target.value)}
                    placeholder={t.emailPh} />
                  <FieldErr k="customerEmail" />
                </div>
              ) : (
                <div>
                  <label className="ti-label" htmlFor="ti-whatsapp">{t.whatsapp}</label>
                  <input id="ti-whatsapp" className={`ti-input ti-mono ${errors.customerWhatsapp ? 'err' : ''}`} dir="ltr"
                    type="tel" inputMode="tel" value={fd.customerWhatsapp} onChange={(e) => set('customerWhatsapp', e.target.value)}
                    placeholder={t.whatsappPh} />
                  <FieldErr k="customerWhatsapp" />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="ti-form-row-2">
                <div>
                  <label className="ti-label" htmlFor="ti-wilaya">{t.wilaya}</label>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={13} aria-hidden="true" style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                    <select id="ti-wilaya" className={`ti-input ${errors.customerWelaya ? 'err' : ''}`}
                      disabled={wilayas.length === 0}
                      value={fd.customerWelaya}
                      onChange={(e) => setFd((f) => ({ ...f, customerWelaya: e.target.value, customerCommune: '' }))}
                      style={{ paddingInlineEnd: 36 }}>
                      <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                      {wilayas.map((w) => (
                        <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                      ))}
                    </select>
                  </div>
                  <FieldErr k="customerWelaya" />
                </div>
                <div>
                  <label className="ti-label" htmlFor="ti-commune">{t.commune}</label>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={13} aria-hidden="true" style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                    <select id="ti-commune" className={`ti-input ${errors.customerCommune ? 'err' : ''}`}
                      disabled={!fd.customerWelaya || loadingC}
                      value={fd.customerCommune}
                      onChange={(e) => set('customerCommune', e.target.value)}
                      style={{ paddingInlineEnd: 36 }}>
                      <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                      {communes.map((c) => (
                        <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                      ))}
                    </select>
                  </div>
                  <FieldErr k="customerCommune" />
                </div>
              </div>

              {/* Delivery type toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
                {(['home', 'office'] as const).map((type) => {
                  const active = fd.typeLivraison === type;
                  return (
                    <button key={type} onClick={() => set('typeLivraison', type)} style={{
                      padding: '0.7rem', minHeight: 44, cursor: 'pointer', fontFamily: 'inherit',
                      border: active ? `2px solid ${A}` : `1px solid ${BD}`, borderRadius: 4,
                      background: active ? AL : 'transparent', color: active ? A : SUB, fontWeight: 700, fontSize: '0.85rem',
                      transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                    }}>
                      {type === 'home' ? t.deliveryHome : t.deliveryOffice}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Order summary — delivery is its own labeled line (§10.4) */}
          <div style={{ border: `1px solid ${BD}`, borderRadius: 4, background: SRF, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <SummaryRow l={t.price} v={`${fmt(fp)} ${cur(store)}`} />
            <SummaryRow l={t.qty} v={`× ${qty}`} />
            {!product?.isDigital && (
              <SummaryRow l={t.delivery} v={!selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${fmt(getLiv())} ${cur(store)}`} />
            )}
            <div style={{ height: 1, background: BD, margin: '0.25rem 0' }} />
            <SummaryRow l={t.total} v={`${fmt(total())} ${cur(store)}`} big />
          </div>

          {errors.submit && (
            <p style={{ fontSize: '0.8rem', color: HOT, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={13} aria-hidden="true" /> {errors.submit}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="ti-btn" onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            {/* §15.15 — Cancel button, disabled while submitting */}
            <button className="ti-btn ti-btn-ghost" onClick={() => setIsOrderNow(false)} disabled={submitting}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================= Cart (§11) ========================= */

export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const initCount = useCartStore((s: any) => s.initCount);

  const [items, setItems] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [fd, setFd] = useState({
    customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      setItems(Array.isArray(arr) ? arr : []);
    } catch { setItems([]); }
    setLoaded(true);
  }, [domain]);

  // §17 — Cart reads userId from store.user.id
  useEffect(() => {
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya)); // §17

  const cartTotal = items.reduce((s, it) => s + Number(it.finalPrice || 0) * Number(it.quantity || 1), 0);

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

  const removeItem = (idx: number) => {
    const arr = items.filter((_, i) => i !== idx);
    setItems(arr);
    localStorage.setItem(domain, JSON.stringify(arr));
    initCount(arr.length);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = async () => {
    if (!validate() || items.length === 0) return;
    setSubmitting(true);
    try {
      const orders = items.map((it) => ({
        ...it,
        customerName: fd.customerName,
        customerPhone: fd.customerPhone,
        customerWelaya: fd.customerWelaya,
        customerCommune: fd.customerCommune,
        typeLivraison: fd.typeLivraison,
        priceLivraison: getLiv(), // §11 — each line carries it
        totalPrice: Number(it.finalPrice || 0) * Number(it.quantity || 1) + getLiv(),
      }));
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orders),
      });
      if (!r.ok) throw new Error('order failed');
      localStorage.removeItem(domain);
      initCount(0);
      setItems([]);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch {
      setErrors((e) => ({ ...e, submit: t.errSubmit }));
    }
    setSubmitting(false);
  };

  const set = (k: string, v: any) => setFd((f) => ({ ...f, [k]: v }));

  const FieldErr = ({ k }: { k: string }) => errors[k] ? (
    <p style={{ fontSize: '0.75rem', color: HOT, marginTop: '0.3rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
      <AlertCircle size={11} aria-hidden="true" /> {errors[k]}
    </p>
  ) : null;

  if (success) {
    return (
      <div className="ti-container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 460, margin: '0 auto', border: `1px solid ${BD}`, borderRadius: 6, background: CARD, padding: '2.5rem 1.5rem', animation: 'scaleIn 0.4s ease both' }}>
          <CheckCircle2 size={56} color={OK} aria-hidden="true" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: TXT, margin: '1rem 0 0.5rem' }}>{t.successTitle}</h1>
          <p style={{ color: SUB, margin: '0 0 1.75rem' }}>{t.successDesc}</p>
          <Link href="/" className="ti-btn" style={{ width: 'auto', minWidth: 200 }}>{t.backToShop}</Link>
        </div>
      </div>
    );
  }

  if (loaded && items.length === 0) {
    return (
      <div className="ti-container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 460, margin: '0 auto', border: `1px dashed ${BD}`, borderRadius: 6, padding: '3rem 1.5rem' }}>
          <ShoppingCart size={52} color={BD} aria-hidden="true" />
          <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: TXT, margin: '1rem 0 0.4rem' }}>{t.cartEmpty}</h1>
          <p style={{ color: SUB, margin: '0 0 1.75rem' }}>{t.cartEmptyDesc}</p>
          <Link href="/" className="ti-btn" style={{ width: 'auto', minWidth: 200 }}>{t.shopNow}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ti-container" style={{ padding: '2rem 1.5rem 3rem' }}>
      <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: TXT, marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShoppingCart size={24} color={A} aria-hidden="true" /> {t.myCart}
        <span className="ti-mono" style={{ fontSize: '0.85rem', color: SUB, fontWeight: 600 }}>({items.length})</span>
      </h1>

      {freeShippingMin != null && (
        <div style={{
          border: `1px solid ${freeShippingReached ? OK : BD}`, borderRadius: 6,
          background: freeShippingReached ? `${OK}14` : SRF, padding: '0.75rem 1rem', marginBottom: '1.25rem',
          color: freeShippingReached ? OK : SUB, fontSize: '0.85rem', fontWeight: 700,
        }}>
          {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', fmt(freeShippingRemainingAmt))}
        </div>
      )}

      <div className="ti-cart-inner">
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((it, idx) => {
            // §15.8 — check both image fields
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            return (
              <div key={idx} style={{
                display: 'flex', gap: 14, border: `1px solid ${BD}`, borderRadius: 6, background: CARD,
                padding: '0.9rem', alignItems: 'center', animation: `fadeUp 0.4s ease ${idx * 0.06}s both`,
              }}>
                <div style={{ width: 76, height: 76, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: `1px solid ${BD}` }}>
                  <ProductImg src={img} alt={it.product?.name || ''} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.92rem', color: TXT, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {it.product?.name}
                  </p>
                  <p className="ti-mono" style={{ color: SUB, fontSize: '0.78rem', margin: 0, whiteSpace: 'nowrap' }}>
                    {fmt(it.finalPrice)} {cur(store)} × {it.quantity}
                  </p>
                  <p className="ti-mono" style={{ color: A, fontWeight: 800, fontSize: '0.92rem', margin: '4px 0 0', whiteSpace: 'nowrap' }}>
                    {fmt(Number(it.finalPrice || 0) * Number(it.quantity || 1))} {cur(store)}
                  </p>
                </div>
                <button onClick={() => removeItem(idx)} aria-label={t.cancel} style={{
                  background: 'none', border: `1px solid ${BD}`, borderRadius: 4, color: HOT, cursor: 'pointer',
                  minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'border-color 0.2s',
                }}>
                  <Trash2 size={17} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Checkout */}
        <div style={{ border: `1px solid ${BD}`, borderRadius: 6, background: CARD, padding: '1.25rem', height: 'fit-content' }}>
          <h2 className="ti-mono" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: SUB, marginTop: 0, marginBottom: '1rem' }}>
            // {t.shippingInfo}
          </h2>

          <div style={{ marginBottom: '0.875rem' }}>
            <label className="ti-label" htmlFor="ti-c-name">{t.fullName}</label>
            <input id="ti-c-name" className={`ti-input ${errors.customerName ? 'err' : ''}`}
              value={fd.customerName} onChange={(e) => set('customerName', e.target.value)} placeholder={t.fullNamePlaceholder} />
            <FieldErr k="customerName" />
          </div>

          <div style={{ marginBottom: '0.875rem' }}>
            <label className="ti-label" htmlFor="ti-c-phone">{t.phone}</label>
            <input id="ti-c-phone" className={`ti-input ti-mono ${errors.customerPhone ? 'err' : ''}`} dir="ltr" inputMode="tel"
              value={fd.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} placeholder={t.phonePlaceholder} />
            <FieldErr k="customerPhone" />
          </div>

          <div className="ti-form-row-2">
            <div>
              <label className="ti-label" htmlFor="ti-c-wilaya">{t.wilaya}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={13} aria-hidden="true" style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                <select id="ti-c-wilaya" className={`ti-input ${errors.customerWelaya ? 'err' : ''}`}
                  disabled={wilayas.length === 0}
                  value={fd.customerWelaya}
                  onChange={(e) => setFd((f) => ({ ...f, customerWelaya: e.target.value, customerCommune: '' }))}
                  style={{ paddingInlineEnd: 36 }}>
                  <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                  {wilayas.map((w) => (
                    <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                  ))}
                </select>
              </div>
              <FieldErr k="customerWelaya" />
            </div>
            <div>
              <label className="ti-label" htmlFor="ti-c-commune">{t.commune}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={13} aria-hidden="true" style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                <select id="ti-c-commune" className={`ti-input ${errors.customerCommune ? 'err' : ''}`}
                  disabled={!fd.customerWelaya || loadingC}
                  value={fd.customerCommune}
                  onChange={(e) => set('customerCommune', e.target.value)}
                  style={{ paddingInlineEnd: 36 }}>
                  <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                  ))}
                </select>
              </div>
              <FieldErr k="customerCommune" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
            {(['home', 'office'] as const).map((type) => {
              const active = fd.typeLivraison === type;
              return (
                <button key={type} onClick={() => set('typeLivraison', type)} style={{
                  padding: '0.7rem', minHeight: 44, cursor: 'pointer', fontFamily: 'inherit',
                  border: active ? `2px solid ${A}` : `1px solid ${BD}`, borderRadius: 4,
                  background: active ? AL : 'transparent', color: active ? A : SUB, fontWeight: 700, fontSize: '0.85rem',
                  transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                }}>
                  {type === 'home' ? t.deliveryHome : t.deliveryOffice}
                </button>
              );
            })}
          </div>

          {/* Summary — delivery own line, nowrap prices (§11, §15.11) */}
          <div style={{ border: `1px solid ${BD}`, borderRadius: 4, background: SRF, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <SummaryRow l={t.subtotal} v={`${fmt(cartTotal)} ${cur(store)}`} />
            <SummaryRow l={t.delivery} v={!selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${fmt(getLiv())} ${cur(store)}`} />
            <div style={{ height: 1, background: BD, margin: '0.25rem 0' }} />
            <SummaryRow l={t.total} v={`${fmt(finalTotal)} ${cur(store)}`} big />
          </div>

          {errors.submit && (
            <p style={{ fontSize: '0.8rem', color: HOT, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={13} aria-hidden="true" /> {errors.submit}
            </p>
          )}

          <button className="ti-btn" onClick={submitOrder} disabled={submitting || items.length === 0}>
            {submitting ? t.sending : t.confirmOrder}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const stepIcons = [CheckCircle2, Phone, Package, Truck];

  return (
    <div dir={t.dir} style={{ minHeight: '100vh', background: BG, padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', background: CARD, padding: '3rem 2rem', borderRadius: 8, border: `1px solid ${BD}`, marginBottom: '1.5rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: BG2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CheckCircle2 size={30} style={{ color: A }} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: TXT, margin: '0 0 0.5rem' }}>{t.successTitle}</h1>
          <p style={{ color: SUB, margin: 0 }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: CARD, borderRadius: 8, border: `1px solid ${BD}`, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.75rem', color: TXT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${BD}`, fontSize: 14, fontWeight: 700, color: TXT }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: SUB }}>{t.total}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: A }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: CARD, borderRadius: 8, border: `1px solid ${BD}`, overflow: 'hidden', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? CheckCircle2;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? `1px solid ${BD}` : 'none', background: done ? BG2 : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? A : BG2, color: done ? BG : SUB }}>
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
          <Link href="/" className="ti-btn" style={{ textDecoration: 'none' }}>{t.shopNow}</Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', borderRadius: 8, border: `1px solid ${BD}`, color: SUB, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ========================= Static pages (§12) ========================= */

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ background: BG2, borderBottom: `1px solid ${BD}`, padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h1 className="ti-mono" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, color: TXT, margin: 0, letterSpacing: '0.04em' }}>
          {title}
        </h1>
      </div>
      <div className="ti-container" style={{ padding: '2.5rem 1.5rem 3rem', maxWidth: 860 }}>
        {children}
      </div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ border: `1px solid ${BD}`, borderInlineStart: `3px solid ${A}`, borderRadius: 4, background: CARD, padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 800, color: TXT, marginTop: 0, marginBottom: '0.6rem' }}>{title}</h2>
      <p style={{ color: SUB, lineHeight: 1.9, margin: 0, fontSize: '0.92rem' }}>{body}</p>
    </div>
  );
}

export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacyTitle}>
      {t.privacyBlocks.map((b) => <InfoBlock key={b.h} title={b.h} body={b.b} />)}
    </Shell>
  );
}

export function Terms({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.termsTitle}>
      {t.termsBlocks.map((b) => <InfoBlock key={b.h} title={b.h} body={b.b} />)}
    </Shell>
  );
}

export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookiesTitle}>
      {t.cookiesBlocks.map((b) => <InfoBlock key={b.h} title={b.h} body={b.b} />)}
    </Shell>
  );
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!form.name.trim() || !form.message.trim()) return;
    setSending(true); setErr('');
    try {
      const r = await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      if (!r.ok) throw new Error('failed');
      setSent(true);
    } catch { setErr(t.errSubmit); }
    setSending(false);
  };

  return (
    <Shell title={t.contactTitle}>
      {sent ? (
        <div style={{ textAlign: 'center', border: `1px solid ${BD}`, borderRadius: 6, background: CARD, padding: '2.5rem 1.5rem', animation: 'scaleIn 0.4s ease both' }}>
          <CheckCircle2 size={52} color={OK} aria-hidden="true" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: TXT, margin: '1rem 0 1.5rem' }}>{t.msgSent}</h2>
          <button className="ti-btn" style={{ width: 'auto', minWidth: 220 }}
            onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}>
            {t.sendAnother}
          </button>
        </div>
      ) : (
        <div className="ti-contact-grid">
          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {store?.contact?.phone && (
              <div style={{ border: `1px solid ${BD}`, borderRadius: 4, background: CARD, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Phone size={18} color={A} aria-hidden="true" />
                <div>
                  <p className="ti-label" style={{ marginBottom: 2 }}>{t.phone}</p>
                  <a href={`tel:${store.contact.phone}`} className="ti-mono" dir="ltr" style={{ color: TXT, fontWeight: 700, fontSize: '0.9rem' }}>{store.contact.phone}</a>
                </div>
              </div>
            )}
            {store?.contact?.email && (
              <div style={{ border: `1px solid ${BD}`, borderRadius: 4, background: CARD, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mail size={18} color={A} aria-hidden="true" />
                <div>
                  <p className="ti-label" style={{ marginBottom: 2 }}>{t.yourEmail}</p>
                  <a href={`mailto:${store.contact.email}`} style={{ color: TXT, fontWeight: 700, fontSize: '0.9rem' }}>{store.contact.email}</a>
                </div>
              </div>
            )}
            {(store?.contact?.wilaya || store?.contact?.address) && (
              <div style={{ border: `1px solid ${BD}`, borderRadius: 4, background: CARD, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <MapPin size={18} color={A} aria-hidden="true" />
                <div>
                  <p className="ti-label" style={{ marginBottom: 2 }}>{t.location}</p>
                  <span style={{ color: TXT, fontWeight: 700, fontSize: '0.9rem' }}>
                    {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' — ')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div style={{ border: `1px solid ${BD}`, borderRadius: 6, background: CARD, padding: '1.5rem' }}>
            <div className="ti-form-row-2">
              <div>
                <label className="ti-label" htmlFor="ti-ct-name">{t.fullName}</label>
                <input id="ti-ct-name" className="ti-input" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t.fullNamePlaceholder} />
              </div>
              <div>
                <label className="ti-label" htmlFor="ti-ct-phone">{t.phone}</label>
                <input id="ti-ct-phone" className="ti-input ti-mono" dir="ltr" inputMode="tel" value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder={t.phonePlaceholder} />
              </div>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <label className="ti-label" htmlFor="ti-ct-email">{t.yourEmail}</label>
              <input id="ti-ct-email" className="ti-input" type="email" dir="ltr" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="ti-label" htmlFor="ti-ct-msg">{t.yourMessage}</label>
              <textarea id="ti-ct-msg" className="ti-input" rows={5} value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                style={{ resize: 'none', minHeight: 120 }} />
            </div>
            {err && (
              <p style={{ fontSize: '0.8rem', color: HOT, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertCircle size={13} aria-hidden="true" /> {err}
              </p>
            )}
            <button className="ti-btn" onClick={submit} disabled={sending || !form.name.trim() || !form.message.trim()}>
              <Send size={15} aria-hidden="true" /> {sending ? t.sending : t.sendMsg}
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