'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import {
  ShoppingBag, Search, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  Star, Trash2, Plus, Minus, Phone, Mail, MapPin, AlertCircle, Sparkles,
  Gift, Truck, ShieldCheck, Headphones, Check,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

/* ============================================================
   Signature Scents — Modern Perfume Theme (AR / RTL)
   Design: bright coral + gold, asymmetric hero, floating rounded
   cards, filled-pill category chips, El Messiri + IBM Plex Sans Arabic.
   ============================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const BG = '#FFF8F3';
const CARD = '#FFFFFF';
const TXT = '#241220';
const SUB = '#8A7A85';
const BD = '#F3E1E6';
const A = '#FF4D6D';
const AD = '#E63958';
const AL = '#FFE6EC';
const GOLD = '#D4A542';
const GOLD_L = '#FBF0DC';

const FONT_HEAD = "'El Messiri', 'Tahoma', sans-serif";
const FONT_BODY = "'IBM Plex Sans Arabic', 'Tahoma', sans-serif";

/* ---------------- Types ---------------- */
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

/* ---------------- Helpers ---------------- */
const fmt = (n: number) => Math.round(n).toLocaleString('ar-DZ');

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

function getVarId(product: Product, selectedVariants: Record<string, string>): string | number | null {
  if (!product.variantDetails?.length) return null;
  const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
  return match ? match.id : null;
}

async function fetchWilayas(uid: string): Promise<Wilaya[]> {
  if (!uid) return [];
  try {
    const r = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

async function fetchCommunes(wid: string): Promise<Commune[]> {
  if (!wid) return [];
  try {
    const r = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

const PHONE_RE = /^(0|\+213)[5-7]\d{8}$/;

/* ---------------- Shared CSS ---------------- */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
body { font-family: ${FONT_BODY}; background: ${BG}; color: ${TXT}; margin: 0; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(50%); } }
@keyframes badgeBounce { 0% { transform: scale(1); } 40% { transform: scale(1.4); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }

.container { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }

.card { transition: transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease; animation: fadeUp 0.5s ease both; }
.card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 40px rgba(255,77,109,0.18); }
.card-img { transition: transform 0.5s ease; overflow: hidden; }
.card:hover .card-img { transform: scale(1.08); }

.btn-primary { transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,77,109,0.28); background: ${AD}; }
.btn-primary:active { transform: translateY(0) scale(0.97); }

.nav-link { position: relative; }
.nav-link::after { content: ''; position: absolute; bottom: -4px; right: 0; left: 0; height: 2px; background: ${A}; transform: scaleX(0); transition: transform 0.25s ease; }
.nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); }

.cat-chip { transition: all 0.2s ease; }
.cat-chip.active { background: ${A}; color: #fff; border-color: ${A}; }
.cat-chip:not(.active):hover { border-color: ${A}; color: ${A}; }

.hero-float { animation: float 4s ease-in-out infinite; }
.hero-title { animation: fadeUp 0.7s ease 0.1s both; }
.hero-sub { animation: fadeUp 0.7s ease 0.25s both; }
.hero-cta { animation: fadeUp 0.7s ease 0.4s both; }
.hero-badge { animation: scaleIn 0.5s ease 0.55s both; }

.skeleton { background: linear-gradient(90deg, #f3e1e6 25%, #fbeef1 50%, #f3e1e6 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; border-radius: 16px; }

.cart-badge-animate { animation: badgeBounce 0.4s ease; }

.input-field { transition: border-color 0.2s, box-shadow 0.2s; }
.input-field:focus { border-color: ${A}; box-shadow: 0 0 0 3px ${AL}; outline: none; }

.nav-links { display: flex; align-items: center; gap: 28px; }
.nav-burger { display: none; }
@media (max-width: 860px) { .nav-links { display: none; } .nav-burger { display: flex; } }

.products-grid { display: grid; grid-template-columns: 1fr; gap: 1.1rem; }
@media (min-width: 640px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

.form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
@media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

.cart-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 1024px) { .cart-inner { grid-template-columns: 1.2fr 1fr; } }
.details-inner { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
@media (min-width: 768px) { .details-inner { grid-template-columns: 1fr 1fr; } }

.hero-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: center; }
@media (min-width: 900px) { .hero-grid { grid-template-columns: 1.2fr 0.8fr; } }

.footer-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .footer-grid { grid-template-columns: 1.5fr 1fr 1fr 1fr; } }

.search-dropdown { position: absolute; top: calc(100% + 10px); left: 0; width: 340px; }
@media (max-width: 480px) { .search-dropdown { position: fixed; left: 12px; right: 12px; width: auto; top: 70px; } }

@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
`;

function GlobalStyle() {
  return <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />;
}

/* ---------------- Logo ---------------- */
function StoreLogo({ store, size = 40 }: any) {
  const [err, setErr] = useState(false);
  const url = store?.design?.logoUrl;
  if (url && !err) {
    return <img src={url} alt={store?.name} onError={() => setErr(true)} style={{ height: 48, width: 'auto', maxWidth: 160, objectFit: 'contain' }} />;
  }
  const initials = (store?.name || 'S').trim().slice(0, 2);
  return (
    <div style={{ height: size, width: size, borderRadius: 10, background: `linear-gradient(135deg, ${A}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontFamily: FONT_HEAD, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
}

/* ============================================================
   Main
   ============================================================ */

// ─── Translations ─────────────────────────────────────────────────────────────
const jsonAr = {
  dir: 'rtl',
  // Navbar
  home: 'الرئيسية',
  contact: 'اتصل بنا',
  cart: 'السلة',
  search: 'ابحث...',
  searching: 'جاري البحث...',
  noResults: 'لا توجد نتائج',
  showAll: 'عرض كل النتائج →',
  // Home
  all: 'الكل',
  noProducts: 'لا توجد منتجات متاحة حالياً',
  shopNow: 'تسوق الآن',
  searchResultsFor: 'نتائج البحث عن:',
  // Form
  fullName: 'الاسم الكامل',
  fullNamePh: 'أدخل اسمك',
  errName: 'الاسم مطلوب',
  phone: 'رقم الهاتف',
  phonePh: '05xxxxxxxx',
  errPhone: 'رقم الهاتف مطلوب',
  errPhoneInvalid: 'رقم هاتف غير صالح',
  wilaya: 'الولاية',
  errWilaya: 'الولاية مطلوبة',
  wilayaPh: 'اختر الولاية',
  wilayaNA: 'التوصيل غير متاح حالياً',
  commune: 'البلدية',
  errCommune: 'البلدية مطلوبة',
  communePh: 'اختر البلدية',
  communeLoading: 'جاري التحميل...',
  deliveryType: 'نوع التوصيل',
  deliveryHome: 'توصيل للمنزل',
  deliveryOffice: 'مكتب بريد',
  qty: 'الكمية',
  price: 'السعر',
  delivery: 'التوصيل',
  total: 'الإجمالي',
  subtotal: 'المجموع الفرعي',
  orderInfo: 'معلومات الطلب',
  addToCart: 'أضف إلى السلة',
  orderNow: 'اطلب الآن',
  confirmOrder: 'تأكيد الطلب',
  sending: 'جاري الإرسال...',
  back: 'رجوع',
  addedMsg: 'تمت الإضافة إلى السلة بنجاح!',
  errSubmit: 'حدث خطأ أثناء إرسال الطلب',
  // Cart & Success
  myCart: 'السلة',
  cartEmpty: 'السلة فارغة',
  cartEmptyDesc: 'لم تقم بإضافة أي منتجات بعد',
  successTitle: 'تم إرسال طلبك بنجاح!',
  successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل',
  backToShop: 'العودة للتسوق',
  checkoutTitle: 'إتمام الطلب',
  // Product
  offersTitle: 'العروض المتاحة',
  descTitle: 'الوصف',
  // Footer
  quickLinks: 'روابط سريعة', legalNav: 'قانوني',
  contactSect: 'تواصل معنا',
  privacy: 'الخصوصية',
  terms: 'الشروط',
  cookies: 'الكوكيز',
  rightsReserved: 'جميع الحقوق محفوظة',
  // Hero fallbacks
  heroTitle: 'عطورك المُوقّعة، كل يوم',
  heroSub: 'مجموعة مختارة من العطور اليومية ومجموعات الهدايا المميزة، بجودة عالية وأسعار مناسبة.',
  heroBadgeItems: ['الأكثر مبيعاً', 'مجموعات هدايا', 'عطور يومية', 'إصدار جديد', 'عروض محدودة'],
  trustItems: ['توصيل سريع لكل الولايات', 'جودة أصلية مضمونة', 'تغليف هدايا فاخر', 'دعم متواصل'],
  // Extra UI
  discountPre: 'خصم',
  offerLabel: 'اختر العرض',
  addBtn: 'أضف للسلة',
  addedBtn: 'أُضيف للسلة',
  cancelBtn: 'إلغاء',
  cartTitle: 'سلة المشتريات',
  subtotalLbl: 'المجموع',
  deliveryInfoTitle: 'معلومات التوصيل',
  continueShop: 'متابعة التسوق',
  qtyShort: 'الكمية',
  emailPh: 'البريد الإلكتروني',
  messagePh: 'رسالتك',
  sendBtn: 'إرسال',
  sentMsg: 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً.',
  sendAnother: 'إرسال رسالة أخرى',
  // Static pages
  privacyTitle: 'سياسة الخصوصية',
  privacyData: 'البيانات التي نجمعها',
  privacyDataBody: 'نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم، رقم الهاتف، وعنوان التوصيل.',
  privacyProtect: 'حماية البيانات',
  privacyProtectBody: 'تُخزن جميع البيانات بشكل مشفر ونستخدم بروتوكولات حماية معتمدة.',
  privacyShare: 'مشاركة المعلومات',
  privacyShareBody: 'لا نقوم ببيع أو مشاركة بياناتكم مع أي جهات خارجية باستثناء شركاء التوصيل.',
  termsTitle: 'شروط الاستخدام',
  termsAccount: 'الحساب والمسؤولية',
  termsAccountBody: 'المستخدم مسؤول عن دقة البيانات المدخلة وعن الحفاظ على سرية حسابه.',
  termsOrders: 'الطلبات والمدفوعات',
  termsOrdersBody: 'يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الأسعار المعلنة هي الأسعار النهائية.',
  termsLaw: 'القانون الحاكم',
  termsLawBody: 'تخضع كافة التعاملات للقوانين المعمول بها في جمهورية الجزائر الديمقراطية الشعبية.',
  cookiesTitle: 'ملفات الارتباط',
  cookiesEssential: 'الملفات الأساسية',
  cookiesEssentialBody: 'نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل سلة المشتريات وأمان جلسة الدخول.',
  cookiesExp: 'تحسين التجربة',
  cookiesExpBody: 'نستخدم بعض الملفات لفهم كيفية استخدام الموقع وتطوير تجربة التصفح.',
};

const jsonFr = {
  dir: 'ltr',
  // Navbar
  home: 'Accueil',
  contact: 'Contact',
  cart: 'Panier',
  search: 'Rechercher un produit...',
  searching: 'Recherche...',
  noResults: 'Aucun résultat',
  showAll: 'Voir tous les résultats',
  // Home
  all: 'Tout',
  noProducts: 'Aucun produit disponible pour le moment.',
  shopNow: 'Voir la boutique',
  searchResultsFor: 'Résultats pour :',
  // Form
  fullName: 'Nom complet',
  fullNamePh: 'Votre nom',
  errName: 'Le nom est requis',
  phone: 'Téléphone',
  phonePh: '0555 12 34 56',
  errPhone: 'Le numéro de téléphone est requis',
  errPhoneInvalid: 'Numéro de téléphone invalide',
  wilaya: 'Wilaya',
  errWilaya: 'Sélectionnez une wilaya',
  wilayaPh: 'Choisir la wilaya',
  wilayaNA: 'Livraison indisponible pour le moment',
  commune: 'Commune',
  errCommune: 'Sélectionnez une commune',
  communePh: 'Choisir la commune',
  communeLoading: 'Chargement...',
  deliveryType: 'Type de livraison',
  deliveryHome: 'À domicile',
  deliveryOffice: 'Point relais',
  qty: 'Quantité',
  price: 'Prix',
  delivery: 'Livraison',
  total: 'Total',
  subtotal: 'Sous-total',
  orderInfo: 'Informations de commande',
  addToCart: 'Ajouter au panier',
  orderNow: 'Commander maintenant',
  confirmOrder: 'Confirmer la commande',
  sending: 'Envoi en cours...',
  back: 'Annuler',
  addedMsg: 'Ajouté au panier ✓',
  errSubmit: 'Une erreur est survenue, veuillez réessayer.',
  // Cart & Success
  myCart: 'Mon Panier',
  cartEmpty: 'Votre panier est vide',
  cartEmptyDesc: 'Découvrez notre sélection.',
  successTitle: 'Commande confirmée',
  successDesc: 'Merci pour votre commande, notre équipe vous contactera bientôt.',
  backToShop: 'Retour à la boutique',
  checkoutTitle: 'Finaliser la commande',
  // Product
  offersTitle: 'Offres groupées',
  descTitle: 'Description',
  // Footer
  quickLinks: 'Navigation', legalNav: 'Légal',
  contactSect: 'Contact',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  cookies: 'Cookies',
  rightsReserved: 'Tous droits réservés.',
  // Hero fallbacks
  heroTitle: 'Vos Parfums Signature, Chaque Jour',
  heroSub: 'Une sélection de parfums quotidiens et de coffrets cadeaux, de haute qualité à des prix accessibles.',
  heroBadgeItems: ['Best-sellers', 'Coffrets cadeaux', 'Parfums du quotidien', 'Nouvelle sortie', 'Offres limitées'],
  trustItems: ['Livraison rapide dans toutes les wilayas', 'Qualité authentique garantie', 'Emballage cadeau luxueux', 'Support disponible'],
  // Extra UI
  discountPre: 'Réd.',
  offerLabel: 'Choisir une offre',
  addBtn: 'Ajouter au panier',
  addedBtn: 'Ajouté ✓',
  cancelBtn: 'Annuler',
  cartTitle: 'Mon Panier',
  subtotalLbl: 'Sous-total',
  deliveryInfoTitle: 'Informations de livraison',
  continueShop: 'Continuer mes achats',
  qtyShort: 'Qté',
  emailPh: 'Votre e-mail',
  messagePh: 'Votre message',
  sendBtn: 'Envoyer',
  sentMsg: 'Message envoyé avec succès, nous vous contacterons bientôt.',
  sendAnother: 'Envoyer un autre message',
  // Static pages
  privacyTitle: 'Politique de confidentialité',
  privacyData: 'Données collectées',
  privacyDataBody: "Nous collectons uniquement les informations nécessaires pour traiter vos commandes.",
  privacyProtect: 'Protection des données',
  privacyProtectBody: "Toutes les données sont stockées de manière chiffrée avec des protocoles de sécurité certifiés.",
  privacyShare: "Partage d'informations",
  privacyShareBody: "Nous ne vendons pas vos données et ne les partageons pas avec des tiers, sauf avec nos partenaires de livraison.",
  termsTitle: "Conditions d'utilisation",
  termsAccount: 'Compte et responsabilité',
  termsAccountBody: "L'utilisateur est responsable de l'exactitude des données saisies et de la confidentialité de son compte.",
  termsOrders: 'Commandes et paiements',
  termsOrdersBody: 'Les commandes sont confirmées par téléphone avant expédition. Les prix affichés sont les prix finaux.',
  termsLaw: 'Droit applicable',
  termsLawBody: 'Toutes les transactions sont soumises aux lois en vigueur en Algérie.',
  cookiesTitle: 'Politique de cookies',
  cookiesEssential: 'Cookies essentiels',
  cookiesEssentialBody: 'Nous utilisons des cookies nécessaires pour le panier et la sécurité de votre session.',
  cookiesExp: "Amélioration de l'expérience",
  cookiesExpBody: 'Nous utilisons certains cookies pour analyser la navigation et améliorer nos services.',
};

const jsonEn = {
  dir: 'ltr',
  home: 'Home', contact: 'Contact', cart: 'Cart',
  search: 'Search...', searching: 'Searching...', noResults: 'No results', showAll: 'Show all results',
  all: 'All', noProducts: 'No products available.', shopNow: 'Shop Now', searchResultsFor: 'Results for:',
  fullName: 'Full Name', fullNamePh: 'Your name', errName: 'Name is required',
  phone: 'Phone', phonePh: '0555 12 34 56', errPhone: 'Phone is required', errPhoneInvalid: 'Invalid phone number',
  wilaya: 'Wilaya', errWilaya: 'Select a wilaya', wilayaPh: 'Choose wilaya', wilayaNA: 'Delivery unavailable',
  commune: 'Commune', errCommune: 'Select a commune', communePh: 'Choose commune', communeLoading: 'Loading...',
  deliveryType: 'Delivery type', deliveryHome: 'Home delivery', deliveryOffice: 'Pickup point',
  qty: 'Qty', price: 'Price', delivery: 'Delivery', total: 'Total', subtotal: 'Subtotal',
  orderInfo: 'Order info', addToCart: 'Add to cart', orderNow: 'Order now',
  confirmOrder: 'Confirm order', sending: 'Sending...', back: 'Cancel',
  addedMsg: 'Added to cart ✓', errSubmit: 'An error occurred, please try again.',
  myCart: 'My Cart', cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Discover our collection.',
  successTitle: 'Order confirmed', successDesc: 'Thank you! Our team will contact you soon.',
  backToShop: 'Back to shop', checkoutTitle: 'Checkout',
  offersTitle: 'Available offers', descTitle: 'Description',
  quickLinks: 'Navigation', legalNav: 'Legal',
  contactSect: 'Contact',
  privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies',
  rightsReserved: 'All rights reserved.',
  heroTitle: 'Your Signature Scents, Every Day',
  heroSub: 'A curated selection of everyday fragrances and gift sets, premium quality at great prices.',
  heroBadgeItems: ['Best Sellers', 'Gift Sets', 'Everyday Scents', 'New Release', 'Limited Offers'],
  trustItems: ['Fast delivery to all wilayas', 'Authentic quality guaranteed', 'Luxurious gift wrapping', 'Continuous support'],
  discountPre: 'Off',
  offerLabel: 'Choose an offer',
  addBtn: 'Add to cart',
  addedBtn: 'Added ✓',
  cancelBtn: 'Cancel',
  cartTitle: 'My Cart',
  subtotalLbl: 'Subtotal',
  deliveryInfoTitle: 'Delivery information',
  continueShop: 'Continue shopping',
  qtyShort: 'Qty',
  emailPh: 'Your e-mail',
  messagePh: 'Your message',
  sendBtn: 'Send',
  sentMsg: 'Message sent successfully, we will contact you soon.',
  sendAnother: 'Send another message',
  // Static pages
  privacyTitle: 'Privacy Policy',
  privacyData: 'Data we collect',
  privacyDataBody: 'We collect only the information necessary to process your orders, such as name, phone, and delivery address.',
  privacyProtect: 'Data Protection',
  privacyProtectBody: 'All data is stored encrypted using certified security protocols to ensure your information is safe.',
  privacyShare: 'Information Sharing',
  privacyShareBody: 'We do not sell or share your data with third parties, except with delivery partners.',
  termsTitle: 'Terms of Use',
  termsAccount: 'Account & Responsibility',
  termsAccountBody: 'Users are responsible for the accuracy of data entered and the security of their account.',
  termsOrders: 'Orders & Payments',
  termsOrdersBody: 'Orders are confirmed by phone before shipping. Listed prices are final.',
  termsLaw: 'Governing Law',
  termsLawBody: 'All transactions are subject to the laws in force in Algeria.',
  cookiesTitle: 'Cookie Policy',
  cookiesEssential: 'Essential Cookies',
  cookiesEssentialBody: 'We use essential cookies to ensure cart functionality and session security.',
  cookiesExp: 'Experience Improvement',
  cookiesExpBody: 'We use some cookies to understand how the site is used and improve the browsing experience.',
};

type Lang = 'ar' | 'fr' | 'en';
const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr as any, en: jsonEn as any };

export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const t = T[getLang(store)];

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div dir={t.dir} style={{ fontFamily: FONT_BODY, background: BG, color: TXT, minHeight: '100vh' }}>
      <GlobalStyle />
      <Navbar store={store} domain={domain} />
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        <main>{children}</main>
      </div>
      <Footer store={store} />
    </div>
  );
}

/* ============================================================
   Navbar
   ============================================================ */
export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const d = await r.json();
        setListSearch(Array.isArray(d) ? d : d?.products || []);
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(timer);
  }, [searchQuery, domain]);

  const showCart = store?.cart !== false;

  const mobileLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
  };

  return (
  <>
    <header dir={t.dir} style={{
      position: 'sticky', top: 0, zIndex: 200, background: scrolled ? 'rgba(255,248,243,0.92)' : BG,
      backdropFilter: scrolled ? 'blur(10px)' : 'none', borderBottom: `1px solid ${BD}`,
      transition: 'background 0.3s ease',
    }}>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: `linear-gradient(90deg, ${A}, ${AD})`, color: '#fff', textAlign: 'center', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>
          {store.topBar.text}
        </div>
      )}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 74 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <StoreLogo store={store} />
          {!store?.design?.logoUrl && <span style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 20, color: TXT }}>{store?.name}</span>}
        </Link>

        <nav className="nav-links">
          <Link href="/" className="nav-link" style={{ textDecoration: 'none', color: TXT, fontWeight: 600, fontSize: 15 }}>{t.home}</Link>
          <Link href="/contact" className="nav-link" style={{ textDecoration: 'none', color: TXT, fontWeight: 600, fontSize: 15 }}>{t.contact}</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <button onClick={() => setShowSearch((s) => !s)} aria-label={t.search} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TXT, display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Search size={20} />
          </button>

          {showSearch && (
            <div className="search-dropdown" style={{ background: CARD, borderRadius: 16, boxShadow: '0 20px 50px rgba(36,18,32,0.18)', border: `1px solid ${BD}`, padding: 14, zIndex: 250, ...(isRTL ? { left: 0 } : { right: 0, left: 'auto' }) }}>
              <form onSubmit={submitSearch} style={{ display: 'flex', gap: 8 }}>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  className="input-field"
                  style={{ flex: 1, padding: '10px 14px', border: `1px solid ${BD}`, borderRadius: 10, fontFamily: 'inherit', fontSize: 14, background: BG, color: TXT }}
                />
                <button type="submit" className="btn-primary" style={{ background: A, color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', cursor: 'pointer' }}>
                  <Search size={16} />
                </button>
              </form>
              {loading && <div style={{ padding: 10, fontSize: 13, color: SUB }}>{t.searching}</div>}
              {!loading && listSearch.length > 0 && (
                <div style={{ marginTop: 10, maxHeight: 320, overflowY: 'auto' }}>
                  {listSearch.slice(0, 5).map((p) => (
                    <Link key={p.id} href={`/product/${p.id}`} onClick={() => setShowSearch(false)} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 6px', textDecoration: 'none', color: TXT, borderRadius: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: AL, flexShrink: 0 }}>
                        {(p.productImage || p.imagesProduct?.[0]?.imageUrl) && (
                          <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                    </Link>
                  ))}
                  <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearch(false)} style={{ display: 'block', textAlign: 'center', padding: 10, color: A, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    {t.showAll}
                  </Link>
                </div>
              )}
            </div>
          )}

          {showCart && (
            <Link href="/cart" aria-label={t.cart} style={{ position: 'relative', color: TXT, display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="cart-badge-animate" style={{ position: 'absolute', top: 2, right: 2, background: A, color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {count}
                </span>
              )}
            </Link>
          )}

          <button className="nav-burger" onClick={() => setOpen(true)} aria-label="القائمة" style={{ background: 'none', border: 'none', cursor: 'pointer', color: TXT, minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Menu size={22} />
          </button>
        </div>
      </div>

    </header>
    {open && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(36,18,32,0.4)' }} onClick={() => setOpen(false)}>
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, [isRTL ? 'right' : 'left']: 0, height: '100%', width: 280, background: CARD, padding: 24, boxShadow: isRTL ? '-10px 0 40px rgba(0,0,0,0.2)' : '10px 0 40px rgba(0,0,0,0.2)', animation: 'fadeIn 0.25s ease', zIndex: 10000 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <StoreLogo store={store} size={36} />
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TXT }}><X size={22} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {mobileLinks.map((l) => (
              <Link key={l.h} href={l.h} onClick={() => setOpen(false)} style={{ padding: '14px 10px', textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: 16, borderBottom: `1px solid ${BD}` }}>
                {l.l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    )}
  </>
  );
}

/* ============================================================
   Footer
   ============================================================ */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const year = new Date().getFullYear();
  const navLinks = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contactSect },
  ].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);
  const legalLinks = [
    { h: '/Privacy', l: t.privacy },
    { h: '/Terms', l: t.terms },
    { h: '/cookies', l: t.cookies },
  ];

  return (
    <footer dir={t.dir} style={{ background: TXT, color: '#fff', marginTop: 60 }}>
      <div className="container" style={{ padding: '3.5rem 1.5rem 2rem' }}>
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <StoreLogo store={store} size={38} />
              {!store?.design?.logoUrl && <span style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 19 }}>{store?.name}</span>}
            </div>
            <p style={{ color: '#C9B8C4', fontSize: 14, lineHeight: 1.8, maxWidth: 280 }}>{store?.hero?.subtitle}</p>
            <p style={{ color: '#8A7A85', fontSize: 12, marginTop: 18 }}>© {year} {store?.name}. {t.rightsReserved}</p>
          </div>
          <div>
            <h4 style={{ fontFamily: FONT_HEAD, fontSize: 16, marginBottom: 16, color: GOLD }}>{t.quickLinks}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {navLinks.map((l) => (
                <Link key={l.h} href={l.h} style={{ color: '#C9B8C4', textDecoration: 'none', fontSize: 14 }}>{l.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: FONT_HEAD, fontSize: 16, marginBottom: 16, color: GOLD }}>{t.legalNav}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {legalLinks.map((l) => (
                <Link key={l.h} href={l.h} style={{ color: '#C9B8C4', textDecoration: 'none', fontSize: 14 }}>{l.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: FONT_HEAD, fontSize: 16, marginBottom: 16, color: GOLD }}>{t.contactSect}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {store?.contact?.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C9B8C4', fontSize: 14 }}><Phone size={15} /> {store.contact.phone}</span>
              )}
              {store?.contact?.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C9B8C4', fontSize: 14 }}><Mail size={15} /> {store.contact.email}</span>
              )}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C9B8C4', fontSize: 14 }}>
                  <MapPin size={15} /> {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   Card
   ============================================================ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;
  const price = Number(product.price);
  const priceOriginal = product.priceOriginal ? Number(product.priceOriginal) : null;

  return (
    <Link href={`/product/${(product as any).slug || product.id}`} className="card" style={{ textDecoration: 'none', color: TXT, display: 'block' }}>
      <div style={{ background: CARD, borderRadius: 22, overflow: 'hidden', boxShadow: '0 6px 20px rgba(36,18,32,0.06)', border: `1px solid ${BD}` }}>
        <div className="card-img" style={{ position: 'relative', aspectRatio: '1/1', background: AL }}>
          {discount > 0 && (
            <span style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, background: A, color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 999 }}>
              -{discount}%
            </span>
          )}
          {img && !imgErr ? (
            <img src={img} alt={product.name} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={40} color={GOLD} />
            </div>
          )}
        </div>
        <div style={{ padding: '14px 16px 18px' }}>
          <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={GOLD} color={GOLD} />)}
          </div>
          <h3 style={{
            fontFamily: FONT_HEAD, fontSize: 15.5, fontWeight: 700, margin: '0 0 8px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40,
          }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 17, color: A }}>{fmt(price)} {store?.currency || 'DZD'}</span>
            {priceOriginal && priceOriginal > price && (
              <span style={{ fontSize: 13, color: SUB, textDecoration: 'line-through' }}>{fmt(priceOriginal)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   Home
   ============================================================ */
export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const products: Product[] = store?.products || [];
  const cats = store?.categories || [];
  const currentPage = Number(page) || 1;
  const countPage = Math.max(1, Math.ceil((store?.count || products.length) / 48));

  return (
    <div>
      {/* Hero */}
      <section dir={t.dir} style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${AL} 0%, ${GOLD_L} 100%)`, minHeight: 'clamp(480px, 68vh, 760px)', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ width: '100%', padding: '3rem 1.5rem' }}>
          {/* Marquee ticker */}
          <div className="hero-badge" style={{ overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: 24, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, padding: '8px 0' }}>
            <div style={{ display: 'inline-flex', gap: 40, animation: 'marquee 18s linear infinite', width: 'max-content' }}>
              {[...Array(2)].map((_, i) => (
                <React.Fragment key={i}>
                  {(t.heroBadgeItems as string[]).map((item) => (
                    <span key={item} style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 13, letterSpacing: 1, color: AD, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={13} color={GOLD} /> {item}
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="hero-grid">
            <div>
              <h1
                className="hero-title"
                style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 'clamp(2rem, 6vw, 3.6rem)', lineHeight: 1.15, margin: '0 0 18px', color: TXT, textAlign: isRTL ? 'right' : 'left' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || t.heroTitle) }}
              />
              <p className="hero-sub" style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: SUB, lineHeight: 1.8, margin: '0 0 30px', maxWidth: 460, textAlign: isRTL ? 'right' : 'left' }}>
                {store?.hero?.subtitle || t.heroSub}
              </p>
              <div className="hero-cta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: isRTL ? 'flex-start' : 'flex-start' }}>
                <a href="#products" className="btn-primary" style={{ background: A, color: '#fff', fontWeight: 700, padding: '15px 30px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
                  {t.shopNow} {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </a>
                {store?.cart !== false && (
                  <Link href="/cart" style={{ border: `1.5px solid ${TXT}`, color: TXT, fontWeight: 700, padding: '15px 30px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
                    <ShoppingBag size={16} /> {t.cart}
                  </Link>
                )}
              </div>
            </div>
            <div className="hero-float" style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(255,77,109,0.25)' }}>
              {store?.hero?.imageUrl ? (
                <img src={store.hero.imageUrl} alt={store?.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${A}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={70} color="#fff" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ borderBottom: `1px solid ${BD}`, background: CARD }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, padding: '2rem 1.5rem' }}>
          {[Truck, ShieldCheck, Gift, Headphones].map((Icon, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={20} color={A} /></div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{(t.trustItems as string[])[i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {cats.length > 0 && (
        <section className="container" style={{ padding: '2.5rem 1.5rem 0' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/" className={`cat-chip ${!activeCategory ? 'active' : ''}`} style={{ padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${BD}`, textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: 13.5 }}>
              {t.all}
            </Link>
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} className={`cat-chip ${activeCategory === String(cat.id) ? 'active' : ''}`} style={{ padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${BD}`, textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: 13.5 }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section id="products" className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
        <div className="products-grid">
          {products.map((p, i) => {
            const price = Number(p.price);
            const priceOriginal = p.priceOriginal ? Number(p.priceOriginal) : null;
            const discount = priceOriginal && priceOriginal > price ? Math.round(((priceOriginal - price) / priceOriginal) * 100) : 0;
            return (
              <div key={p.id} style={{ animationDelay: `${i * 0.06}s` }}>
                <Card product={p} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={discount} store={store} viewDetails />
              </div>
            );
          })}
        </div>
        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: SUB }}>{t.noProducts}</div>
        )}

        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40, flexWrap: 'wrap' }}>
            {[...Array(countPage)].map((_, i) => (
              <Link key={i} href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), page: i + 1 } }} scroll={false}
                style={{
                  minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12,
                  background: currentPage === i + 1 ? A : CARD, color: currentPage === i + 1 ? '#fff' : TXT,
                  border: `1.5px solid ${currentPage === i + 1 ? A : BD}`, textDecoration: 'none', fontWeight: 700, fontSize: 14,
                }}>
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   Details
   ============================================================ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const t = T[getLang(store || product?.store)];
  const [sel, setSel] = useState(0);
  const images: string[] = allImages?.length ? allImages : (product.imagesProduct?.map((i: ProductImage) => i.imageUrl) || (product.productImage ? [product.productImage] : []));

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      <div className="details-inner">
        {/* Gallery */}
        <div>
          <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 24, overflow: 'hidden', background: AL, marginBottom: 14 }}>
            {images.length > 0 ? (
              <img src={images[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={60} color={GOLD} /></div>
            )}
            {discount > 0 && (
              <span style={{ position: 'absolute', top: 14, right: 14, background: A, color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 12px', borderRadius: 999 }}>{t.discountPre} {discount}%</span>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setSel((s) => (s === 0 ? images.length - 1 : s - 1))} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}><ChevronRight size={18} /></button>
                <button onClick={() => setSel((s) => (s === images.length - 1 ? 0 : s + 1))} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}><ChevronLeft size={18} /></button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
              {images.map((im, i) => (
                <button key={i} onClick={() => setSel(i)} style={{ width: 66, height: 66, borderRadius: 12, overflow: 'hidden', border: `2px solid ${sel === i ? A : BD}`, padding: 0, cursor: 'pointer', flexShrink: 0 }}>
                  <img src={im} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>{[...Array(5)].map((_, i) => <Star key={i} size={15} fill={GOLD} color={GOLD} />)}</div>
          <h1 style={{ fontFamily: FONT_HEAD, fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 700, margin: '0 0 14px' }}>{product.name}</h1>
          <div style={{ fontSize: 26, fontWeight: 800, color: A, marginBottom: 20 }}>{fmt(finalPrice)} {store?.currency || product?.store?.currency || 'DZD'}</div>

          {product.offers && product.offers.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>{t.offerLabel}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o: Offer) => (
                  <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1.5px solid ${selectedOffer === o.id ? A : BD}`, borderRadius: 14, padding: '12px 16px', cursor: 'pointer', background: selectedOffer === o.id ? AL : CARD }}>
                    <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                    <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{o.name} ({o.quantity})</span>
                    <span style={{ fontWeight: 800, color: A }}>{fmt(o.price)} {store?.currency || 'DZD'}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {allAttrs?.map((attr: Attribute) => (
            <div key={attr.id} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>{attr.name}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {attr.variants.map((v) => {
                  const active = selectedVariants[attr.name] === v.value;
                  const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                    Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                      ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                    )
                  );
                  if (attr.displayMode === 'color') {
                    return <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: 34, height: 34, borderRadius: '50%', background: v.value, border: `2px solid ${active ? A : BD}`, cursor: available ? 'pointer' : 'not-allowed', boxShadow: active ? `0 0 0 3px ${AL}` : 'none', opacity: available ? 1 : 0.35 }} />;
                  }
                  if (attr.displayMode === 'image') {
                    return <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ width: 54, height: 54, borderRadius: 10, overflow: 'hidden', border: `2px solid ${active ? A : BD}`, padding: 0, cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35 }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></button>;
                  }
                  return <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ padding: '9px 18px', borderRadius: 999, border: `1.5px solid ${active ? A : BD}`, background: active ? AL : CARD, color: active ? A : (available ? TXT : '#bbb'), fontWeight: 700, fontSize: 13, cursor: available ? 'pointer' : 'not-allowed', textDecoration: available ? 'none' : 'line-through' }}>{v.name}</button>;
                })}
              </div>
            </div>
          ))}

          <ProductForm product={product} userId={product.store?.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} store={store} />

          {product.desc && (
            <div style={{ marginTop: 30, paddingTop: 26, borderTop: `1px solid ${BD}` }}>
              <h3 style={{ fontFamily: FONT_HEAD, fontSize: 17, marginBottom: 12 }}>{t.descTitle}</h3>
              <div style={{ fontSize: 14, lineHeight: 1.9, color: SUB }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ProductForm
   ============================================================ */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store }: any) {
  const t = T[getLang(store || product?.store)];
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

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
  const [added, setAdded] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

  const getFP = useCallback((): number => {
    if (selectedOffer && product.offers) {
      const o = product.offers.find((x: Offer) => x.id === selectedOffer);
      if (o) return o.price;
    }
    if (product.variantDetails?.length) {
      const match = product.variantDetails.find((d: VariantDetail) => variantMatches(d, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return Number(product.price);
  }, [selectedOffer, product, selectedVariants]);

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const fp = getFP();
  const total = () => fp * fd.quantity + getLiv();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = t.errName;
    if (!PHONE_RE.test(fd.customerPhone)) e.customerPhone = t.errPhoneInvalid;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    ...fd, product, productId: product.id, storeId: product.store?.id, userId,
    variantDetailId: getVarId(product, selectedVariants), selectedOffer, selectedVariants, platform,
    finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now(),
  });

  const addToCart = () => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      arr.push(buildPayload());
      localStorage.setItem(domain, JSON.stringify(arr));
      initCount(arr.length);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch { /* noop */ }
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()),
      });
      const d = await r.json();
      if (fd.customerId || d?.customerId) localStorage.setItem('customerId', d?.customerId || fd.customerId);
      router.push(`/successfully?productId=${product.id}`);
    } catch { setSubmitting(false); }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.8rem 1rem', fontSize: '0.9rem', border: `1px solid ${BD}`,
    borderRadius: 12, background: BG, color: TXT, outline: 'none', appearance: 'none',
    transition: 'border-color 0.2s', fontFamily: 'inherit', minHeight: 44,
  };
  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '0.9rem 1.5rem', minHeight: 44, background: A, color: '#fff', fontWeight: 700,
    fontSize: '0.92rem', border: 'none', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: 'inherit', width: '100%',
  };

  const canCart = product.store?.cart === true;

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', border: `1.5px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
          <button onClick={() => setFd((s) => ({ ...s, quantity: Math.max(1, s.quantity - 1) }))} style={{ width: 40, height: 40, border: 'none', background: CARD, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={15} /></button>
          <span style={{ width: 44, textAlign: 'center', fontWeight: 700 }}>{fd.quantity}</span>
          <button onClick={() => setFd((s) => ({ ...s, quantity: s.quantity + 1 }))} style={{ width: 40, height: 40, border: 'none', background: CARD, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={15} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {canCart && (
          <button onClick={addToCart} className="btn-primary" style={{ ...btnPrimary, background: 'transparent', color: A, border: `1.5px solid ${A}`, flex: 1 }}>
            {added ? <><Check size={17} /> {t.addedBtn}</> : <><ShoppingBag size={17} /> {t.addBtn}</>}
          </button>
        )}
        <button onClick={() => setIsOrderNow(true)} className="btn-primary" style={{ ...btnPrimary, flex: 1 }}>{t.orderNow}</button>
      </div>

      {isOrderNow && (
        <div style={{ marginTop: 24, padding: 22, borderRadius: 18, background: CARD, border: `1px solid ${BD}` }}>
          <div className="form-row-2">
            <div>
              <input placeholder={t.fullName} value={fd.customerName} onChange={(e) => setFd((s) => ({ ...s, customerName: e.target.value }))} className="input-field" style={{ ...inputBase, ...(errors.customerName ? { borderColor: '#EF4444' } : {}) }} />
              {errors.customerName && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {errors.customerName}</p>}
            </div>
            <div>
              <input placeholder={t.phonePh} value={fd.customerPhone} onChange={(e) => setFd((s) => ({ ...s, customerPhone: e.target.value }))} className="input-field" style={{ ...inputBase, ...(errors.customerPhone ? { borderColor: '#EF4444' } : {}) }} />
              {errors.customerPhone && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {errors.customerPhone}</p>}
            </div>
          </div>

          <div className="form-row-2">
            <div style={{ position: 'relative' }}>
              <ChevronDown size={12} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
              <select disabled={wilayas.length === 0} value={fd.customerWelaya} onChange={(e) => setFd((s) => ({ ...s, customerWelaya: e.target.value, customerCommune: '' }))} className="input-field" style={{ ...inputBase, paddingLeft: 36, ...(errors.customerWelaya ? { borderColor: '#EF4444' } : {}) }}>
                <option value="">{wilayas.length === 0 ? t.wilayaNA : t.wilayaPh}</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <ChevronDown size={12} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
              <select disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune} onChange={(e) => setFd((s) => ({ ...s, customerCommune: e.target.value }))} className="input-field" style={{ ...inputBase, paddingLeft: 36, ...(errors.customerCommune ? { borderColor: '#EF4444' } : {}) }}>
                <option value="">{loadingC ? t.communeLoading : t.communePh}</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {(['home', 'office'] as const).map((typ) => (
              <button key={typ} onClick={() => setFd((s) => ({ ...s, typeLivraison: typ }))} style={{
                padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', minHeight: 44,
                background: fd.typeLivraison === typ ? AL : 'transparent', border: `1.5px solid ${fd.typeLivraison === typ ? A : BD}`, color: fd.typeLivraison === typ ? A : TXT,
              }}>
                {typ === 'home' ? t.deliveryHome : t.deliveryOffice}
              </button>
            ))}
          </div>

          <div style={{ background: BG, borderRadius: 14, padding: 16, marginBottom: 18 }}>
            {[
              { l: t.price, v: `${fmt(fp)} ${store?.currency || 'DZD'}` },
              { l: t.qty, v: `× ${fd.quantity}` },
              { l: t.delivery, v: selW ? `${fmt(getLiv())} ${store?.currency || 'DZD'}` : '—' },
              { l: t.total, v: `${fmt(total())} ${store?.currency || 'DZD'}`, bold: true },
            ].map((row) => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ flexShrink: 0, fontSize: row.bold ? 15 : 13.5, fontWeight: row.bold ? 800 : 500, color: row.bold ? TXT : SUB }}>{row.l}</span>
                <span style={{ whiteSpace: 'nowrap', fontWeight: row.bold ? 800 : 600, fontSize: row.bold ? 16 : 13.5, color: row.bold ? A : TXT }}>{row.v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submitOrder} disabled={submitting} className="btn-primary" style={{ ...btnPrimary, flex: 1, opacity: submitting ? 0.65 : 1, cursor: submitting ? 'default' : 'pointer' }}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            <button onClick={() => setIsOrderNow(false)} disabled={submitting} style={{ padding: '0.9rem 1.5rem', minHeight: 44, background: 'transparent', color: TXT, border: `1.5px solid ${BD}`, borderRadius: 14, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.65 : 1, fontFamily: 'inherit' }}>
              {t.cancelBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Cart
   ============================================================ */
export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);
  const [items, setItems] = useState<any[]>([]);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); } catch { setItems([]); }
  }, [domain]);

  useEffect(() => { if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [store]);
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

  const cartTotal = items.reduce((s, it) => s + Number(it.finalPrice || 0) * Number(it.quantity || 1), 0);
  const finalTotal = cartTotal + getLiv();

  const removeItem = (idx: number) => {
    const arr = [...items];
    arr.splice(idx, 1);
    setItems(arr);
    localStorage.setItem(domain, JSON.stringify(arr));
    initCount(arr.length);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = t.errName;
    if (!PHONE_RE.test(fd.customerPhone)) e.customerPhone = t.errPhoneInvalid;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || items.length === 0) return;
    setSubmitting(true);
    try {
      const payload = items.map((it) => ({
        ...fd, product: it.product, productId: it.productId, storeId: it.storeId, userId: it.userId,
        variantDetailId: it.variantDetailId, selectedOffer: it.selectedOffer, selectedVariants: it.selectedVariants,
        quantity: it.quantity, finalPrice: it.finalPrice, totalPrice: it.finalPrice * it.quantity + getLiv(), priceLivraison: getLiv(),
      }));
      await fetch(`${API_URL}/orders/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      localStorage.removeItem(domain);
      initCount(0);
      setItems([]);
      setSuccess(true);
    } catch { /* noop */ } finally { setSubmitting(false); }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.8rem 1rem', fontSize: '0.9rem', border: `1px solid ${BD}`,
    borderRadius: 12, background: BG, color: TXT, outline: 'none', appearance: 'none',
    transition: 'border-color 0.2s', fontFamily: 'inherit', minHeight: 44,
  };

  if (success) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={36} color={A} />
        </div>
        <h2 style={{ fontFamily: FONT_HEAD, fontSize: 24, marginBottom: 10 }}>{t.successTitle}</h2>
        <p style={{ color: SUB, marginBottom: 26 }}>{t.successDesc}</p>
        <Link href="/" style={{ background: A, color: '#fff', padding: '14px 30px', borderRadius: 999, textDecoration: 'none', fontWeight: 700 }}>{t.continueShop}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <ShoppingBag size={48} color={BD} style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, marginBottom: 10 }}>{t.cartEmpty}</h2>
        <p style={{ color: SUB, marginBottom: 26 }}>{t.cartEmptyDesc}</p>
        <Link href="/" style={{ background: A, color: '#fff', padding: '14px 30px', borderRadius: 999, textDecoration: 'none', fontWeight: 700 }}>{t.shopNow}</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      <h1 style={{ fontFamily: FONT_HEAD, fontSize: 26, marginBottom: 26 }}>{t.cartTitle}</h1>
      <div className="cart-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it, idx) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            return (
              <div key={idx} style={{ display: 'flex', gap: 14, background: CARD, borderRadius: 16, padding: 14, border: `1px solid ${BD}` }}>
                <div style={{ width: 74, height: 74, borderRadius: 12, overflow: 'hidden', background: AL, flexShrink: 0 }}>
                  {img ? <img src={img} alt={it.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={22} color={GOLD} /></div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{it.product?.name}</div>
                  <div style={{ fontSize: 13, color: SUB }}>{t.qtyShort}: {it.quantity}</div>
                  <div style={{ fontWeight: 800, color: A, marginTop: 4 }}>{fmt(Number(it.finalPrice) * Number(it.quantity))} {store?.currency || 'DZD'}</div>
                </div>
                <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', alignSelf: 'flex-start', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={18} /></button>
              </div>
            );
          })}
        </div>

        <div>
          <div style={{ background: CARD, borderRadius: 18, padding: 22, border: `1px solid ${BD}` }}>
            <h3 style={{ fontFamily: FONT_HEAD, fontSize: 17, marginBottom: 16 }}>{t.deliveryInfoTitle}</h3>
            <div className="form-row-2">
              <div>
                <input placeholder={t.fullName} value={fd.customerName} onChange={(e) => setFd((s) => ({ ...s, customerName: e.target.value }))} className="input-field" style={{ ...inputBase, ...(errors.customerName ? { borderColor: '#EF4444' } : {}) }} />
                {errors.customerName && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>{errors.customerName}</p>}
              </div>
              <div>
                <input placeholder={t.phonePh} value={fd.customerPhone} onChange={(e) => setFd((s) => ({ ...s, customerPhone: e.target.value }))} className="input-field" style={{ ...inputBase, ...(errors.customerPhone ? { borderColor: '#EF4444' } : {}) }} />
                {errors.customerPhone && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>{errors.customerPhone}</p>}
              </div>
            </div>
            <div className="form-row-2">
              <select disabled={wilayas.length === 0} value={fd.customerWelaya} onChange={(e) => setFd((s) => ({ ...s, customerWelaya: e.target.value, customerCommune: '' }))} className="input-field" style={inputBase}>
                <option value="">{wilayas.length === 0 ? t.wilayaNA : t.wilayaPh}</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
              <select disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune} onChange={(e) => setFd((s) => ({ ...s, customerCommune: e.target.value }))} className="input-field" style={inputBase}>
                <option value="">{loadingC ? t.communeLoading : t.communePh}</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {(['home', 'office'] as const).map((typ) => (
                <button key={typ} onClick={() => setFd((s) => ({ ...s, typeLivraison: typ }))} style={{ padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', minHeight: 44, background: fd.typeLivraison === typ ? AL : 'transparent', border: `1.5px solid ${fd.typeLivraison === typ ? A : BD}`, color: fd.typeLivraison === typ ? A : TXT }}>
                  {typ === 'home' ? t.deliveryHome : t.deliveryOffice}
                </button>
              ))}
            </div>

            <div style={{ background: BG, borderRadius: 14, padding: 16, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ flexShrink: 0, fontSize: 13.5, color: SUB }}>{t.subtotalLbl}</span>
                <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{fmt(cartTotal)} {store?.currency || 'DZD'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ flexShrink: 0, fontSize: 13.5, color: SUB }}>{t.delivery}</span>
                <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{selW ? `${fmt(getLiv())} ${store?.currency || 'DZD'}` : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0 0', borderTop: `1px solid ${BD}`, marginTop: 6 }}>
                <span style={{ flexShrink: 0, fontSize: 15, fontWeight: 800 }}>{t.total}</span>
                <span style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: 16, color: A }}>{fmt(finalTotal)} {store?.currency || 'DZD'}</span>
              </div>
            </div>

            <button onClick={submit} disabled={submitting} style={{ width: '100%', minHeight: 44, background: A, color: '#fff', fontWeight: 700, border: 'none', borderRadius: 14, padding: '14px', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.65 : 1, fontFamily: 'inherit' }}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Static Pages
   ============================================================ */
function Shell({ title, children, store }: any) {
  const t = T[getLang(store)];
  return (
    <div dir={t.dir}>
      <div style={{ background: `linear-gradient(135deg, ${TXT}, #3a1f33)`, color: '#fff', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: FONT_HEAD, fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>{title}</h1>
      </div>
      <div className="container" style={{ padding: '3rem 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: 26 }}>{children}</div>
    </div>
  );
}
function InfoBlock({ title, body }: any) {
  return (
    <div>
      <h3 style={{ fontFamily: FONT_HEAD, fontSize: 18, marginBottom: 10, color: A }}>{title}</h3>
      <p style={{ color: SUB, lineHeight: 1.9, fontSize: 14.5 }}>{body}</p>
    </div>
  );
}

export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacyTitle} store={store}>
      <InfoBlock title={t.privacyData} body={t.privacyDataBody} />
      <InfoBlock title={t.privacyProtect} body={t.privacyProtectBody} />
      <InfoBlock title={t.privacyShare} body={t.privacyShareBody} />
    </Shell>
  );
}
export function Terms({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.termsTitle} store={store}>
      <InfoBlock title={t.termsAccount} body={t.termsAccountBody} />
      <InfoBlock title={t.termsOrders} body={t.termsOrdersBody} />
      <InfoBlock title={t.termsLaw} body={t.termsLawBody} />
    </Shell>
  );
}
export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookiesTitle} store={store}>
      <InfoBlock title={t.cookiesEssential} body={t.cookiesEssentialBody} />
      <InfoBlock title={t.cookiesExp} body={t.cookiesExpBody} />
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
      await fetch(`${API_URL}/user/contact-user/message`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, storeId: store?.id }) });
      setSent(true);
    } catch { /* noop */ } finally { setSending(false); }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.8rem 1rem', fontSize: '0.9rem', border: `1px solid ${BD}`,
    borderRadius: 12, background: BG, color: TXT, outline: 'none', fontFamily: 'inherit', minHeight: 44,
  };

  return (
    <Shell title={t.contactSect} store={store}>
      <div className="details-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {store?.contact?.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} color={A} /></div><span>{store.contact.phone}</span></div>}
          {store?.contact?.email && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} color={A} /></div><span>{store.contact.email}</span></div>}
          {(store?.contact?.wilaya || store?.contact?.address) && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={18} color={A} /></div><span>{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(', ')}</span></div>}
        </div>

        {sent ? (
          <div style={{ background: CARD, borderRadius: 18, padding: 30, border: `1px solid ${BD}`, textAlign: 'center' }}>
            <Check size={36} color={A} style={{ marginBottom: 12 }} />
            <p style={{ marginBottom: 18 }}>{t.sentMsg}</p>
            <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }} style={{ background: A, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 22px', fontWeight: 700, cursor: 'pointer' }}>{t.sendAnother}</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: CARD, borderRadius: 18, padding: 24, border: `1px solid ${BD}` }}>
            <input required placeholder={t.fullName} value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="input-field" style={inputBase} />
            <input required type="email" placeholder={t.emailPh} value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} className="input-field" style={inputBase} />
            <input placeholder={t.phone} value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} className="input-field" style={inputBase} />
            <textarea required rows={5} placeholder={t.messagePh} value={form.message} onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} className="input-field" style={{ ...inputBase, resize: 'none' }} />
            <button type="submit" disabled={sending} style={{ background: A, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontWeight: 700, cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.65 : 1, minHeight: 44 }}>
              {sending ? t.sending : t.sendBtn}
            </button>
          </form>
        )}
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
  return null;
}