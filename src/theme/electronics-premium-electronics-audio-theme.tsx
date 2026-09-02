'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Phone,
  CheckCircle2, ArrowLeft, Disc3, Package,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, MapPin, Truck, Crown,
  Headphones, Volume2, Mail, Sparkles, ShieldCheck, MessageCircle, Download,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const A    = '#7C6B5E';
const AD   = '#5E4E42';
const AL   = 'rgba(124,107,94,0.10)';
const A2   = '#5E4E42';
const BG   = '#F5F3EF';
const CARD = '#FFFFFF';
const TXT  = '#1C1A18';
const SUB  = '#6B6660';
const BD   = 'rgba(28,26,24,0.10)';

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Tajawal', sans-serif;
    background: ${BG};
    color: ${TXT};
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${BG}; }
  ::-webkit-scrollbar-thumb { background: ${BD}; border-radius: 2px; }

  @keyframes slideDown  { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideFade  { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes checkPop   { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes glb-ov-in  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes glb-ov-panel { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin        { to { transform: rotate(360deg); } }
  @keyframes marquee     { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  .anim-slide-down { animation: slideDown 0.3s ease both; }
  .anim-slide-fade { animation: slideFade 0.4s ease both; }
  .anim-check      { animation: checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  .nav-desktop { display: none; align-items: center; gap: 1.75rem; }
  .nav-mobile  { display: flex; gap: 0.5rem; }
  @media (min-width: 1024px) { .nav-desktop { display: flex; } .nav-mobile { display: none; } }

  .lux-marquee { overflow: hidden; white-space: nowrap; border-top: 1px solid ${BD}; border-bottom: 1px solid ${BD}; }
  .lux-marquee-track { display: inline-flex; gap: 2.5rem; animation: marquee 32s linear infinite; padding: 0.75rem 0; }

  .cat-link { padding-bottom: 0.5rem; border-bottom: 2px solid transparent; transition: color 0.3s ease, border-color 0.3s ease; white-space: nowrap; }

  .lux-card { position: relative; overflow: hidden; }
  .lux-card-img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); }
  .lux-card:hover .lux-card-img { transform: scale(1.07); }
  .lux-card-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(245,243,239,0.6); opacity: 0; transition: opacity 0.45s ease; }
  .lux-card:hover .lux-card-overlay { opacity: 1; }
  .lux-card-cta { transform: translateY(8px); opacity: 0; transition: all 0.4s ease 0.05s; }
  .lux-card:hover .lux-card-cta { transform: translateY(0); opacity: 1; }

  .trust-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: ${BD}; }
  @media (min-width: 1024px) { .trust-grid { grid-template-columns: repeat(4, 1fr); } }

  .cats-grid { display: flex; gap: 1.5rem; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
  .cats-grid::-webkit-scrollbar { height: 0; }

  .products-grid { display: grid; grid-template-columns: 1fr; gap: 1.125rem; }
  @media (min-width: 500px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; } }
  @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

  .details-inner { display: grid; grid-template-columns: 1fr; gap: 1rem; padding: 0.5rem; }
  .gallery-container { position: relative; top: 0; width: 100%; }
  .info-container { background: ${CARD}; border-radius: 0; padding: 1.25rem; border: 1px solid ${BD}; }
  @media (min-width: 768px) {
    .details-inner { grid-template-columns: 1fr 1fr; gap: 3rem; padding: 2rem; }
    .gallery-container { position: sticky; top: 100px; z-index: 10; }
    .info-container { padding: 1.75rem; }
  }

  .form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
  @media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

  .cart-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .cart-inner { grid-template-columns: 1.2fr 1fr; gap: 3rem; } }

  .contact-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .contact-inner { grid-template-columns: 1fr 2fr; } }

  .footer-inner { display: grid; grid-template-columns: 1fr; gap: 3rem; padding-bottom: 3rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
  @media (min-width: 768px) { .footer-inner { grid-template-columns: 2fr 1fr 1fr 1fr; } }

  .hero-actions { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .hero-actions { flex-direction: row; align-items: center; justify-content: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .thumb-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; overflow-x: auto; padding-bottom: 4px; }
  .pagination { display: flex; justify-content: center; gap: 0.375rem; flex-wrap: wrap; margin-top: 3rem; }

  a { text-decoration: none; color: inherit; }
  .price-mono { font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
  .eyebrow { letter-spacing: 0.14em; }
  .font-display { font-family: 'El Messiri', serif; }

  .glb-search-ov {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(245,243,239,0.97); backdrop-filter: blur(16px);
    overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
    animation: glb-ov-in 0.2s ease;
  }
  .glb-search-panel { max-width: 680px; margin: 0 auto; padding: 5rem 1.5rem 4rem; animation: glb-ov-panel 0.3s ease; }
  .glb-search-form { border-bottom: 2px solid ${A}; display: flex; align-items: center; margin-bottom: 2rem; }
  .glb-search-input { flex: 1; font-size: 1.5rem; border: none; background: transparent; color: ${TXT}; outline: none; padding: 0.5rem 0.5rem 0.75rem; font-family: 'Tajawal', sans-serif; }
  .glb-search-input::placeholder { color: #4B4940; }
  .glb-search-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
  .glb-search-card { display: block; border: 1px solid ${BD}; background: ${CARD}; overflow: hidden; transition: all 0.3s; text-decoration: none; color: inherit; }
  .glb-search-card:hover { border-color: ${A}; }
  .glb-search-card-info { padding: 0.75rem; }
`;

interface Offer { id: string; name: string; quantity: number; price: number; subTitle?: string; shippingFree?: boolean; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
export interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; shippingFree?: boolean;
  isDigital?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number; store?: any;
}

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

const S = {
  input: {
    width: '100%', padding: '0.75rem 1rem',
    background: '#FAFAF8', border: `1px solid ${BD}`,
    borderRadius: 0, fontSize: '0.9rem', color: TXT,
    outline: 'none', transition: 'border-color 0.3s', appearance: 'none'
  } as React.CSSProperties,
  inputErr: { borderColor: '#EF4444' } as React.CSSProperties,
  btnPrimary: {
    width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: A, color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem',
    padding: '0.875rem 1.5rem', borderRadius: 0, border: 'none', cursor: 'pointer',
    transition: 'all 0.3s', fontFamily: "'Tajawal', sans-serif",
  } as React.CSSProperties,
};


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
  orderEmail: 'البريد الإلكتروني',
  emailPh: 'example@email.com',
  errEmail: 'يرجى إدخال بريد إلكتروني صحيح',
  whatsapp: 'رقم واتساب',
  whatsappPh: '0550123456',
  errWhatsapp: 'رقم واتساب جزائري صحيح مطلوب (مثال: 0550123456)',
  contactQuestion: 'هل تملك بريداً إلكترونياً أم واتساب؟',
  contactViaEmail: 'البريد الإلكتروني',
  contactViaWhatsapp: 'واتساب',
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
  successSteps: [
    { title: 'تم استلام طلبك', desc: 'تم تسجيل طلبك بنجاح في نظامنا' },
    { title: 'تأكيد الطلب', desc: 'سنتصل بك خلال 24 ساعة' },
    { title: 'التجهيز والتغليف', desc: 'يتم تجهيز طلبك بعناية' },
    { title: 'الشحن والتوصيل', desc: '2-5 أيام عمل' },
  ],
  checkoutTitle: 'إتمام الطلب',
  // Product
  offersTitle: 'العروض المتاحة',
  descTitle: 'الوصف',
  freeShippingBadge: '🚚 توصيل مجاني',
  freeShippingThreshold: '🚚 توصيل مجاني للطلبات بـ {{amount}} دج أو أكثر',
  freeShippingRemaining: 'أضف {{amount}} دج أخرى للحصول على توصيل مجاني',
  freeShippingReached: '🎉 حصلت على توصيل مجاني!',
  // Footer
  quickLinks: 'روابط سريعة', legalNav: 'قانوني',
  contactSect: 'تواصل معنا',
  privacy: 'الخصوصية',
  terms: 'الشروط',
  cookies: 'الكوكيز',
  rightsReserved: 'جميع الحقوق محفوظة',
  footerDesc: 'أنظمة صوت ومسارح منزلية فاخرة، مصممة لعشاق الجودة الصوتية النقية.',
  viewDetails: 'عرض المنتج',
  searchPh: 'ابحث عن جهاز صوت...',
  sendBtn: 'إرسال الرسالة',
  // Privacy
  privacyData: 'البيانات التي نجمعها',
  privacyDataBody: 'نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم، رقم الهاتف، وعنوان التوصيل.',
  privacyProtect: 'حماية البيانات',
  privacyProtectBody: 'تُخزن جميع البيانات بشكل مشفر وآمن. نستخدم بروتوكولات حماية متطورة.',
  privacyShare: 'مشاركة المعلومات',
  privacyShareBody: 'لا نقوم ببيع أو مشاركة بياناتكم مع أي جهات خارجية باستثناء شركاء التوصيل.',
  // Terms
  termsAccount: 'الحساب والمسؤولية',
  termsAccountBody: 'المستخدم مسؤول عن دقة البيانات المدخلة وعن الحفاظ على سرية معلومات حسابه.',
  termsOrders: 'الطلبات والمدفوعات',
  termsOrdersBody: 'يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الأسعار المعلنة هي الأسعار النهائية المعتمدة.',
  termsLaw: 'القانون الحاكم',
  termsLawBody: 'تخضع كافة التعاملات للقوانين المعمول بها في جمهورية الجزائر الديمقراطية الشعبية.',
  // Cookies
  cookiesEssential: 'الملفات الأساسية',
  cookiesEssentialBody: 'نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل سلة المشتريات وتأمين جلسة تسجيل الدخول.',
  cookiesExp: 'تحسين التجربة',
  cookiesExpBody: 'نستخدم بعض الملفات لتحليل كيفية تفاعل المستخدمين مع المتجر لتطوير خدماتنا.',
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
  orderEmail: 'E-mail',
  emailPh: 'exemple@email.com',
  errEmail: 'Veuillez saisir une adresse e-mail valide',
  whatsapp: 'Numéro WhatsApp',
  whatsappPh: '0550123456',
  errWhatsapp: 'Numéro WhatsApp algérien valide requis (ex: 0550123456)',
  contactQuestion: 'Avez-vous un e-mail ou un numéro WhatsApp ?',
  contactViaEmail: 'E-mail',
  contactViaWhatsapp: 'WhatsApp',
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
  successSteps: [
    { title: 'Commande reçue', desc: 'Votre commande a été enregistrée avec succès' },
    { title: 'Confirmation', desc: 'Nous vous appellerons sous 24h' },
    { title: 'Préparation', desc: 'Votre commande est préparée avec soin' },
    { title: 'Livraison', desc: '2-5 jours ouvrables' },
  ],
  checkoutTitle: 'Finaliser la commande',
  // Product
  offersTitle: 'Offres groupées',
  descTitle: 'Description',
  freeShippingBadge: '🚚 Livraison gratuite',
  freeShippingThreshold: '🚚 Livraison gratuite dès {{amount}} DZD d\'achat',
  freeShippingRemaining: 'Ajoutez {{amount}} DZD de plus pour la livraison gratuite',
  freeShippingReached: '🎉 Livraison gratuite obtenue !',
  // Footer
  quickLinks: 'Navigation', legalNav: 'Légal',
  contactSect: 'Contact',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  cookies: 'Cookies',
  rightsReserved: 'Tous droits réservés.',
  footerDesc: 'Systèmes audio et home cinéma haut de gamme, conçus pour les amateurs de qualité sonore pure.',
  viewDetails: 'Voir le produit',
  searchPh: 'Rechercher un appareil audio...',
  sendBtn: 'Envoyer le message',
  // Privacy
  privacyData: 'Données collectées',
  privacyDataBody: 'Nous collectons uniquement les informations nécessaires au traitement de vos commandes : nom, téléphone et adresse de livraison.',
  privacyProtect: 'Protection des données',
  privacyProtectBody: 'Toutes les données sont stockées de manière chiffrée et sécurisée. Nous utilisons des protocoles de protection avancés.',
  privacyShare: 'Partage des informations',
  privacyShareBody: 'Nous ne vendons ni ne partageons vos données avec des tiers, à l\'exception de nos partenaires de livraison.',
  // Terms
  termsAccount: 'Compte et responsabilité',
  termsAccountBody: 'L\'utilisateur est responsable de l\'exactitude des données saisies et de la confidentialité des informations de son compte.',
  termsOrders: 'Commandes et paiements',
  termsOrdersBody: 'Les commandes sont confirmées par téléphone avant expédition. Les prix affichés sont les prix finaux.',
  termsLaw: 'Droit applicable',
  termsLawBody: 'Toutes les transactions sont soumises aux lois en vigueur en République Algérienne Démocratique et Populaire.',
  // Cookies
  cookiesEssential: 'Cookies essentiels',
  cookiesEssentialBody: 'Nous utilisons des cookies nécessaires au bon fonctionnement du panier et à la sécurisation de la session.',
  cookiesExp: 'Amélioration de l\'expérience',
  cookiesExpBody: 'Certains cookies nous permettent d\'analyser l\'interaction des utilisateurs avec la boutique afin d\'améliorer nos services.',
};

const jsonEn = {
  dir: 'ltr',
  home: 'Home',
  contact: 'Contact',
  cart: 'Cart',
  search: 'Search...',
  searching: 'Searching...',
  noResults: 'No results found',
  showAll: 'View all results',
  all: 'All',
  noProducts: 'No products available yet',
  shopNow: 'Shop Now',
  searchResultsFor: 'Results for:',
  fullName: 'Full Name',
  fullNamePh: 'Enter your name',
  errName: 'Name is required',
  phone: 'Phone',
  phonePh: '05xxxxxxxx',
  errPhone: 'Phone number is required',
  errPhoneInvalid: 'Invalid phone number',
  wilaya: 'Wilaya',
  errWilaya: 'Please select a wilaya',
  wilayaPh: 'Choose wilaya',
  wilayaNA: 'Delivery not available',
  commune: 'Commune',
  errCommune: 'Please select a commune',
  orderEmail: 'Email',
  emailPh: 'example@email.com',
  errEmail: 'Please enter a valid email address',
  whatsapp: 'WhatsApp number',
  whatsappPh: '0550123456',
  errWhatsapp: 'A valid Algerian WhatsApp number is required (e.g. 0550123456)',
  contactQuestion: 'Do you have an email or a WhatsApp number?',
  contactViaEmail: 'Email',
  contactViaWhatsapp: 'WhatsApp',
  communePh: 'Choose commune',
  communeLoading: 'Loading...',
  deliveryType: 'Delivery Type',
  deliveryHome: 'Home delivery',
  deliveryOffice: 'Post office',
  qty: 'Quantity',
  price: 'Price',
  delivery: 'Delivery',
  total: 'Total',
  subtotal: 'Subtotal',
  orderInfo: 'Order Info',
  addToCart: 'Add to Cart',
  orderNow: 'Order Now',
  confirmOrder: 'Confirm Order',
  sending: 'Sending...',
  back: 'Cancel',
  addedMsg: 'Added to cart ✓',
  errSubmit: 'An error occurred, please try again.',
  myCart: 'My Cart',
  cartEmpty: 'Your cart is empty',
  cartEmptyDesc: 'Browse our selection.',
  successTitle: 'Order Confirmed',
  successDesc: 'Thank you for your order, our team will contact you soon.',
  backToShop: 'Back to shop',
  successSteps: [
    { title: 'Order received', desc: 'Your order has been registered successfully' },
    { title: 'Confirmation', desc: "We'll call you within 24 hours" },
    { title: 'Packaging', desc: 'Your order is being prepared with care' },
    { title: 'Shipping', desc: '2-5 business days' },
  ],
  checkoutTitle: 'Checkout',
  offersTitle: 'Available Offers',
  descTitle: 'Description',
  freeShippingBadge: '🚚 Free Delivery',
  freeShippingThreshold: '🚚 Free Delivery on orders over {{amount}} DZD',
  freeShippingRemaining: 'Add {{amount}} DZD more for free delivery',
  freeShippingReached: '🎉 You got free delivery!',
  quickLinks: 'Navigation', legalNav: 'Legal',
  contactSect: 'Contact',
  privacy: 'Privacy',
  terms: 'Terms',
  cookies: 'Cookies',
  rightsReserved: 'All rights reserved.',
  footerDesc: 'Premium audio systems and home theaters, designed for lovers of pure sound quality.',
  viewDetails: 'View Product',
  searchPh: 'Search for audio equipment...',
  sendBtn: 'Send Message',
  // Privacy
  privacyData: 'Data We Collect',
  privacyDataBody: 'We collect only the information necessary to process your orders: name, phone number, and delivery address.',
  privacyProtect: 'Data Protection',
  privacyProtectBody: 'All data is stored in an encrypted and secure manner. We use advanced protection protocols.',
  privacyShare: 'Information Sharing',
  privacyShareBody: 'We do not sell or share your data with any third parties except our delivery partners.',
  // Terms
  termsAccount: 'Account & Responsibility',
  termsAccountBody: 'The user is responsible for the accuracy of data entered and for maintaining the confidentiality of their account information.',
  termsOrders: 'Orders & Payments',
  termsOrdersBody: 'Orders are confirmed by phone before shipping. Listed prices are the final approved prices.',
  termsLaw: 'Governing Law',
  termsLawBody: 'All transactions are subject to the laws in force in the People\'s Democratic Republic of Algeria.',
  // Cookies
  cookiesEssential: 'Essential Cookies',
  cookiesEssentialBody: 'We use cookies necessary for the shopping cart to function and to secure the login session.',
  cookiesExp: 'Experience Improvement',
  cookiesExpBody: 'Some cookies allow us to analyze how users interact with the store to improve our services.',
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
  const t = T[getLang(store)];
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div dir={t.dir} style={{ minHeight: '100vh', background: BG }}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { const s = localStorage.getItem(domain); initCount(JSON.parse(s || '[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (showSearch) { setTimeout(() => searchInputRef.current?.focus(), 80); }
    else { setSearchQuery(''); setListSearch([]); }
  }, [showSearch]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); setListSearch(data.products || []); }
      catch { } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(timer);
  }, [searchQuery, domain]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setListSearch([]); setShowSearch(false); }
  };

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: A, color: '#FFFFFF', textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
          {store.topBar.text}
        </div>
      )}
      <nav dir={t.dir} style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(245,243,239,0.92)' : BG,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${scrolled ? BD : 'rgba(28,26,24,0.08)'}`,
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Link href="/" style={{ flexShrink: 0, textDecoration: 'none' }}>
            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
              <img src={store.design.logoUrl} style={{ height: 36, objectFit: 'contain', maxWidth: 160, display: 'block' }} alt={store?.name || ''} onError={() => setImgError(true)} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, border: `1px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Disc3 size={16} color={A} />
                </div>
                <div>
                  <span className="font-display" style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: TXT, lineHeight: 1.1 }}>{store?.name || 'Premium Audio'}</span>
                  <span className="eyebrow" style={{ display: 'block', fontSize: '0.58rem', color: A, fontWeight: 500 }}>PREMIUM AUDIO</span>
                </div>
              </div>
            )}
          </Link>

          <div className="nav-desktop">
            {[{ h: '/', l: t.home }, { h: '/contact', l: t.contact }].map(i => (
              <Link key={i.h} href={i.h} style={{ fontSize: '0.85rem', fontWeight: 500, color: SUB, transition: 'color 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.color = A)}
                onMouseLeave={e => (e.currentTarget.style.color = SUB)}>{i.l}</Link>
            ))}
            <button onClick={() => setShowSearch(true)} style={{ height: 36, padding: '0 0.875rem', borderRadius: 0, border: `1px solid ${BD}`, background: 'transparent', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: SUB, fontSize: '0.82rem', transition: 'all 0.3s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = A; (e.currentTarget as HTMLButtonElement).style.color = A; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BD; (e.currentTarget as HTMLButtonElement).style.color = SUB; }}>
              <Search size={14} /> {t.search}
            </button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', border: `1px solid ${A}`, color: A, height: 38, padding: '0 1.125rem', borderRadius: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.3s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = A; (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = A; }}>
                <ShoppingCart size={15} /> {t.cart}
                {count > 0 && <span style={{ background: A, color: '#FFFFFF', fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
          </div>

          <div className="nav-mobile">
            <button onClick={() => setShowSearch(true)} style={{ width: 38, height: 38, borderRadius: 0, border: `1px solid ${BD}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB }}>
              <Search size={15} />
            </button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', border: `1px solid ${A}`, color: A, width: 38, height: 38, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={16} />
                {count > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: A, color: '#FFFFFF', fontSize: 10, fontWeight: 800, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
            <button onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: 0, border: `1px solid ${BD}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        <div style={{ overflow: 'hidden', maxHeight: open ? 220 : 0, transition: 'max-height 0.3s ease', background: BG, borderTop: open ? `1px solid ${BD}` : 'none' }}>
          <div style={{ padding: '0.375rem 1.5rem 1rem' }}>
            {[{ h: '/', l: t.home }, { h: '/contact', l: t.contact }].map(i => (
              <Link key={i.h} href={i.h} onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: `1px solid ${BD}`, fontSize: '0.875rem', fontWeight: 500, color: TXT }}>
                {i.l} <ArrowLeft size={14} style={{ color: A, transform: isRTL ? 'none' : 'scaleX(-1)' }} />
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {showSearch && (
        <div className="glb-search-ov" onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div className="glb-search-panel" dir={t.dir}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: AL, border: `1px solid rgba(140,123,110,0.35)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={13} color={A} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: SUB }}>{t.search}</span>
              </div>
              <button onClick={() => setShowSearch(false)} style={{ width: 34, height: 34, borderRadius: 0, border: `1px solid ${BD}`, background: CARD, color: SUB, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>
            <form className="glb-search-form" onSubmit={handleSearch}>
              <Search size={20} style={{ color: A, flexShrink: 0, ...(isRTL ? { marginLeft: 12 } : { marginRight: 12 }) }} />
              <input ref={searchInputRef} className="glb-search-input" type="text" placeholder={t.searchPh} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: SUB, padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}><X size={14} /></button>}
            </form>
            {loading && <p style={{ textAlign: 'center', color: A, fontSize: '0.85rem', fontWeight: 600, padding: '2rem' }}>{t.searching}</p>}
            {!loading && listSearch.length > 0 && (
              <>
              <div className="glb-search-grid">
                {listSearch.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} className="glb-search-card" onClick={() => setShowSearch(false)}>
                    {(p.productImage || p.imagesProduct?.[0]?.imageUrl) && (
                      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                    )}
                    <div className="glb-search-card-info">
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: TXT, marginBottom: 4, lineHeight: 1.35 }}>{p.name}</p>
                      <p className="price-mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: A }}>{Number(p.price).toLocaleString()} {store?.currency || 'دج'}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button onClick={handleSearch} style={{ width: '100%', padding: '12px', background: AL, border: 'none', borderTop: `1px solid rgba(140,123,110,0.25)`, color: A, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {t.showAll} <ArrowLeft size={14} style={{ transform: isRTL ? 'none' : 'scaleX(-1)' }} />
              </button>
              </>
            )}
            {!loading && searchQuery.length >= 2 && listSearch.length === 0 && (
              <p style={{ textAlign: 'center', color: '#B0AAA4', fontSize: '0.9rem', padding: '3rem' }}>{t.noResults}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Footer({ store }: any) {
  const t = T[getLang(store)];
  return (
    <footer dir={t.dir} style={{ background: '#141418', color: 'rgba(255,255,255,0.5)', marginTop: 80, padding: '4rem 1.5rem 1.5rem', borderTop: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ width: 30, height: 30, border: `1px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Disc3 size={15} color={A} />
              </div>
              <span className="font-display" style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.8, maxWidth: 300 }}>
              {store?.hero?.subtitle?.substring(0, 100) || t.footerDesc}
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)' }}>
              © {new Date().getFullYear()} {store?.name}. {t.rightsReserved}
            </p>
          </div>
          <div>
            <h4 className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 700, color: A, textTransform: 'uppercase' as const, marginBottom: '1.25rem' }}>{t.quickLinks}</h4>
            {[{ h: '/', l: t.home }, { h: '/cart', l: t.cart }, { h: '/contact', l: t.contact }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.625rem', transition: 'color 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.color = A)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                {lnk.l}
              </Link>
            ))}
          </div>
          <div>
            <h4 className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 700, color: A, textTransform: 'uppercase' as const, marginBottom: '1.25rem' }}>{t.legalNav}</h4>
            {[{ h: '/privacy', l: t.privacy }, { h: '/terms', l: t.terms }, { h: '/cookies', l: t.cookies }].map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.625rem', transition: 'color 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.color = A)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                {lnk.l}
              </Link>
            ))}
          </div>
          <div>
            <h4 className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 700, color: A, textTransform: 'uppercase' as const, marginBottom: '1.25rem' }}>{t.contactSect}</h4>
            {[
              { icon: <Phone size={14} />, val: store?.contact?.phone },
              { icon: <Mail size={14} />, val: store?.contact?.email },
              { icon: <MapPin size={14} />, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: A, flexShrink: 0 }}>{r.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div>
      <Link href={`/product/${product.slug || product.id}`} className="lux-card" style={{ display: 'block', aspectRatio: '1/1', background: '#FAFAF8' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} className="lux-card-img" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Disc3 size={40} color={SUB} /></div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: A, color: '#FFFFFF', fontSize: 11, fontWeight: 800, padding: '2px 9px' }}>
            -{discount}%
          </div>
        )}
        {product.isDigital ? (
          <div style={{ position: 'absolute', top: 10, left: 10, background: A, color: '#FFFFFF', fontSize: 10, fontWeight: 800, padding: '2px 8px', display: 'flex', alignItems: 'center' }}>
            <Download size={12} />
          </div>
        ) : product.shippingFree && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: TXT, color: '#FFFFFF', fontSize: 10, fontWeight: 800, padding: '2px 8px' }}>
            🚚
          </div>
        )}
        <div className="lux-card-overlay">
          <span className="lux-card-cta eyebrow" style={{ border: `1px solid ${A2}`, color: A2, fontSize: '0.72rem', fontWeight: 700, padding: '0.5rem 1.125rem', textTransform: 'uppercase' as const }}>
            {viewDetails}
          </span>
        </div>
      </Link>
      <div style={{ padding: '0.875rem 0 0' }}>
        <h3 className="font-display" style={{ fontSize: '0.95rem', fontWeight: 500, color: TXT, marginBottom: '0.375rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', gap: 2, marginBottom: '0.5rem' }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={10} style={{ fill: i < 4 ? A : 'none', color: A }} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
          <span className="price-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: A }}>{price.toLocaleString()}</span>
          <span style={{ fontSize: '0.72rem', color: SUB }}>{store.currency || 'دج'}</span>
          {orig > price && <span className="price-mono" style={{ fontSize: '0.72rem', color: '#B0AAA4', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}

export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);
  const marqueeWords = ['صوت نقي', 'جودة استثنائية', 'تجربة فاخرة', 'مسارح منزلية', 'هاي فاي'];

  return (
    <div dir={t.dir}>
      {/* HERO — marquee + centered headline */}
      <section style={{ position: 'relative', overflow: 'hidden', background: BG }}>
        {store.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.16 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(140,123,110,0.08) 0%, rgba(245,243,239,0.7) 60%, rgba(245,243,239,0.98) 100%)' }} />
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 760, margin: '0 auto', padding: 'clamp(4.5rem,9vw,7rem) 1.5rem 3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${BD}`, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
            <Sparkles size={11} color={A} />
            <span className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, color: A, textTransform: 'uppercase' as const }}>نخبة الصوت الفاخر</span>
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(2.1rem,6vw,4rem)', fontWeight: 600, color: TXT, lineHeight: 1.25, marginBottom: '1.25rem' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || 'تجربة صوتية<br/><span style="color:#7C6B5E">استثنائية</span>') }} />
          <p style={{ fontSize: '1rem', color: SUB, lineHeight: 1.8, marginBottom: '2.25rem', maxWidth: 520, margin: '0 auto 2.25rem' }}>
            {store.hero?.subtitle || 'أنظمة صوت ومسارح منزلية فاخرة، مصممة لعشاق الجودة الصوتية النقية.'}
          </p>
          <div className="hero-actions">
            <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: A, color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem', padding: '0.875rem 2rem', borderRadius: 0, transition: 'all 0.3s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = AD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = A; }}>
              {t.shopNow}
            </a>
            {store?.cart !== false && (
              <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: SUB, fontWeight: 500, fontSize: '0.85rem', padding: '0.875rem 1.25rem', borderRadius: 0, border: `1px solid ${BD}`, transition: 'all 0.3s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = A; (e.currentTarget as HTMLAnchorElement).style.color = A; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = BD; (e.currentTarget as HTMLAnchorElement).style.color = SUB; }}>
                {t.cart}
              </Link>
            )}
          </div>
        </div>
        <div className="lux-marquee" style={{ position: 'relative' }}>
          <div className="lux-marquee-track">
            {[...marqueeWords, ...marqueeWords, ...marqueeWords].map((w, i) => (
              <span key={i} className="font-display" style={{ fontSize: '1.1rem', color: i % 2 === 0 ? A : SUB, display: 'inline-flex', alignItems: 'center', gap: '2.5rem' }}>
                {w} <Disc3 size={12} color={A} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BD}` }}>
        <div className="trust-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
          {[
            { icon: <ShieldCheck size={18} />, t: 'ضمان ممتد', d: 'حماية الجودة' },
            { icon: <Volume2 size={18} />, t: 'صوت نقي', d: 'تقنية متطورة' },
            { icon: <Truck size={18} />, t: 'توصيل فاخر', d: '58 ولاية جزائرية' },
            { icon: <Headphones size={18} />, t: 'دعم متخصص', d: 'خبراء الصوت' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1.25rem 1rem', textAlign: 'center', background: CARD }}>
              <div style={{ width: 40, height: 40, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.625rem', color: A }}>{item.icon}</div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: TXT, marginBottom: '0.15rem' }}>{item.t}</p>
              <p style={{ fontSize: '0.7rem', color: SUB }}>{item.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES — underline active state */}
      {cats.length > 0 && (
        <section style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Crown size={14} color={A} />
            <p className="eyebrow" style={{ fontSize: '0.75rem', fontWeight: 600, color: SUB, textTransform: 'uppercase' as const }}>المجموعات</p>
          </div>
          <div className="cats-grid">
            <Link href="?" className="cat-link" style={{ borderBottomColor: !activeCategory ? A : 'transparent', color: !activeCategory ? TXT : SUB, fontSize: '0.85rem', fontWeight: 600 }}>
              {t.all}
            </Link>
            {cats.map((cat: any) => {
              const isActive = activeCategory === String(cat.id);
              return (
                <Link key={cat.id} href={`?category=${cat.id}`} className="cat-link" style={{ borderBottomColor: isActive ? A : 'transparent', color: isActive ? TXT : SUB, fontSize: '0.85rem', fontWeight: 600 }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = A; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = SUB; }}>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" style={{ padding: '0.5rem 1.5rem 5rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 600, color: TXT }}>المجموعة الفاخرة</h2>
        </div>
        {products.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', border: `1px dashed ${BD}`, background: CARD }}>
            <Disc3 size={40} color={SUB} style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: SUB, fontSize: '0.9rem' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails={t.viewDetails} />;
            })}
          </div>
        )}
        {countPage > 1 && (
          <div className="pagination" dir={t.dir}>
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 0, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: CARD, color: SUB }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, border: `1px solid ${isA ? A : BD}`, background: isA ? A : CARD, color: isA ? '#1A1A1F' : SUB }}>
                  {pn}
                </Link>
              );
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 0, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: CARD, color: SUB }}>❯</Link>
          </div>
        )}
      </section>
    </div>
  );
}

export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const t = T[getLang(store || product?.store)];
  const currency = store?.currency || product?.store?.currency || 'دج';
  const [sel, setSel] = useState(0);
  return (
    <div dir={t.dir} style={{ background: BG, paddingBottom: '4rem' }}>
      <div className="details-inner" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="gallery-container">
          <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#FAFAF8' }}>
            {allImages[sel]
              ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Disc3 size={56} color={SUB} /></div>}
            {discount > 0 && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: A, color: '#FFFFFF', padding: '3px 10px', fontSize: 12, fontWeight: 800 }}>{discount}% خصم</div>
            )}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 0, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BD}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TXT }}><ChevronRight size={16} /></button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 0, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BD}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TXT }}><ChevronLeft size={16} /></button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="thumb-row">
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 58, height: 58, overflow: 'hidden', border: `1.5px solid ${sel === idx ? A : BD}`, opacity: sel === idx ? 1 : 0.55, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.3s' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="info-container">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${BD}`, padding: '0.25rem 0.75rem', marginBottom: '0.875rem' }}>
              <Sparkles size={10} color={A} />
              <span className="eyebrow" style={{ fontSize: '0.65rem', fontWeight: 700, color: A, textTransform: 'uppercase' as const }}>إصدار فاخر معتمد</span>
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 600, color: TXT, marginBottom: '0.625rem', lineHeight: 1.3 }}>{product.name}</h1>
            <div style={{ display: 'flex', gap: 2, marginBottom: '1.25rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={13} style={{ fill: i < 4 ? A : 'none', color: A }} />)}
            </div>
            <div style={{ borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, padding: '1.125rem 0', marginBottom: '1.5rem' }}>
              <p className="eyebrow" style={{ fontSize: '0.65rem', color: A, fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' as const }}>السعر</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span className="price-mono" style={{ fontSize: '2.25rem', fontWeight: 700, color: A }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: SUB }}>{currency}</span>
              </div>
            </div>
            {(product.shippingFree || ((store || product?.store)?.supportFreeShipping && (store || product?.store)?.freeShippingMinAmount != null)) && (
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: A, marginBottom: '1.25rem' }}>
                {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', String((store || product?.store).freeShippingMinAmount))}
              </p>
            )}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: `1px solid ${selectedOffer === o.id ? A : BD}`, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? AL : 'transparent', transition: 'all 0.3s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? A : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedOffer === o.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: A }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontWeight: 600, color: TXT, fontSize: '0.875rem' }}>{o.name}</p>
                        {o.subTitle && <p style={{ fontSize: '0.7rem', color: SUB, marginTop: 2 }}>{o.subTitle}</p>}
                        <p style={{ fontSize: '0.72rem', color: SUB }}>الكمية: {o.quantity}</p>
                        {o.shippingFree && <p style={{ fontSize: '0.68rem', fontWeight: 700, color: A, marginTop: 2 }}>{t.freeShippingBadge}</p>}
                      </div>
                    </div>
                    <span className="price-mono" style={{ fontWeight: 800, color: A, fontSize: '1.05rem' }}>{o.price.toLocaleString()} {currency}</span>
                  </label>
                ))}
              </div>
            )}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '1rem' }}>
                <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const }}>{attr.name}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {attr.variants.map((v: any) => {
                    const isSelected = selectedVariants[attr.name] === v.value;
                    const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                      Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                        ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                      )
                    );
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={
                        attr.displayMode === 'color' ? { width: 28, height: 28, borderRadius: '50%', background: v.value, border: `1px solid ${BD}`, cursor: available ? 'pointer' : 'not-allowed', outline: `2.5px solid ${isSelected ? A : 'transparent'}`, outlineOffset: 3, opacity: available ? 1 : 0.35 }
                        : attr.displayMode === 'image' ? { width: 42, height: 42, backgroundImage: `url(${v.value})`, backgroundSize: 'cover', backgroundPosition: 'center', border: `2px solid ${isSelected ? A : BD}`, cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.3s', opacity: available ? 1 : 0.35 }
                        : { padding: '0.375rem 0.875rem', border: `1px solid ${isSelected ? A : BD}`, borderRadius: 0, fontSize: '0.8rem', fontWeight: 600, background: isSelected ? AL : 'transparent', color: isSelected ? A : (available ? SUB : '#bbb'), cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.3s', textDecoration: available ? 'none' : 'line-through' }
                      }>
                        {attr.displayMode !== 'color' && attr.displayMode !== 'image' && v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <ProductForm product={product} userId={product.store.userId} domain={domain} store={store}
              selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
            {product.desc && (
              <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: `1px solid ${BD}` }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: SUB }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div>
    {label && <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store }: ProductFormProps) {
  const router = useRouter();
  const t = T[getLang(store || product?.store)];
  const currency = store?.currency || product?.store?.currency || 'دج';
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerEmail: '', customerWhatsapp: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId: id })); } }, []);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: any) => o.id === selectedOffer);
    if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  const supportQty = (store?.supportQty ?? product.store?.supportQty) !== false;
  const fp = getFP();
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = product.offers?.find((o: any) => o.id === selectedOffer);
  const storeInfo = store || product.store;
  const orderFreeShipping = !!(product.shippingFree || selOfferObj?.shippingFree ||
    (storeInfo?.supportFreeShipping && storeInfo?.freeShippingMinAmount != null && (fp * qty) >= Number(storeInfo.freeShippingMinAmount)));
  const getLiv = useCallback((): number => {
    if (product.isDigital) return 0;
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return Number(fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping, product.isDigital]);
  const total = () => fp * qty + +getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = 'رقم هاتف غير صالح';
    if (product.isDigital) {
      if (contactMethod === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.customerEmail.trim())) e.customerEmail = t.errEmail;
      } else {
        if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerWhatsapp.trim())) e.customerWhatsapp = t.errWhatsapp;
      }
    } else {
      if (!fd.customerWelaya) e.customerWelaya = 'مطلوب';
      if (!fd.customerCommune) e.customerCommune = 'مطلوب';
    }
    return e;
  };
  const getVarId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const addToCart = () => {
    setIsAdded(true);
    const cart = JSON.parse(localStorage.getItem(domain) || '[]');
    cart.push({ ...fd, quantity: qty, product, variantDetailId: getVarId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now() });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate(); if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSub(true);
    try {
      const { customerWelaya, customerCommune, typeLivraison, priceLoss, customerEmail, customerWhatsapp, ...rest } = fd;
      const payload = product.isDigital
        ? { ...rest, ...(contactMethod === 'email' ? { customerEmail } : { customerWhatsapp }) }
        : { ...rest, customerWelaya, customerCommune, typeLivraison, priceLoss };
      await axios.post(`${API_URL}/orders/create`, { ...payload, quantity: qty, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`${window.location.origin}/successfully?productId=${product.id}`);
    } catch { } finally { setSub(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${BD}` }}>
        {product.store.cart && !product.isDigital && (
        <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
          <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.8rem 1rem', border: `1px solid ${isAdded ? '#22C55E' : BD}`, borderRadius: 0, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: isAdded ? 'rgba(34,197,94,0.08)' : 'transparent', color: isAdded ? '#22C55E' : SUB, transition: 'all 0.3s', fontFamily: 'inherit' }}>
            {isAdded ? <><CheckCircle2 size={14} className="anim-check" />{t.addedMsg}</> : <><ShoppingCart size={14} />{t.addToCart}</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} style={{ flex: 1, ...S.btnPrimary, width: 'auto' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; }}>
            {t.orderNow}
          </button>
        </div>
      )}
      {(isOrderNow || !product.store.cart || product.isDigital) && (
        <div className="anim-slide-fade">
          {product.store.cart && !product.isDigital && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p className="eyebrow" style={{ fontWeight: 600, fontSize: '0.72rem', color: SUB, textTransform: 'uppercase' as const }}>{t.deliveryType}</p>
              <button onClick={() => setIsOrderNow(false)} style={{ fontSize: '0.8rem', color: SUB, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t.back}</button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.customerName} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" style={inp(!!errors.customerName)} /></FR>
              <FR error={errors.customerPhone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0XXXXXXXXX" style={inp(!!errors.customerPhone)} /></FR>
            </div>
            {product.isDigital ? (
              <div style={{ marginBottom: '0.875rem' }}>
                <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const }}>{t.contactQuestion}</p>
                <div style={{ display: 'flex', border: `1px solid ${BD}`, overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <button type="button" onClick={() => { setContactMethod('email'); setFd(p => ({ ...p, customerWhatsapp: '' })); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.7rem 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, background: contactMethod === 'email' ? A : 'transparent', color: contactMethod === 'email' ? '#fff' : SUB }}>
                    <Mail size={14} />{t.contactViaEmail}
                  </button>
                  <button type="button" onClick={() => { setContactMethod('whatsapp'); setFd(p => ({ ...p, customerEmail: '' })); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.7rem 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, background: contactMethod === 'whatsapp' ? A : 'transparent', color: contactMethod === 'whatsapp' ? '#fff' : SUB }}>
                    <MessageCircle size={14} />{t.contactViaWhatsapp}
                  </button>
                </div>
                {contactMethod === 'email' ? (
                  <FR error={errors.customerEmail} label={t.orderEmail}>
                    <input type="email" dir="ltr" value={fd.customerEmail} onChange={e => setFd({ ...fd, customerEmail: e.target.value })} placeholder={t.emailPh} style={inp(!!errors.customerEmail)} />
                  </FR>
                ) : (
                  <FR error={errors.customerWhatsapp} label={t.whatsapp}>
                    <input type="tel" dir="ltr" value={fd.customerWhatsapp} onChange={e => setFd({ ...fd, customerWhatsapp: e.target.value })} placeholder={t.whatsappPh} style={inp(!!errors.customerWhatsapp)} />
                  </FR>
                )}
              </div>
            ) : (
              <>
                <div className="form-row-2">
                  <FR error={errors.customerWelaya} label="الولاية">
                    <div style={{ position: 'relative' }}>
                      <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                      <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.customerWelaya), paddingRight: 36, fontFamily: 'inherit' }}>
                        <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                      </select>
                    </div>
                  </FR>
                  <FR error={errors.customerCommune} label="البلدية">
                    <div style={{ position: 'relative' }}>
                      <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                      <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingRight: 36, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                        <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                      </select>
                    </div>
                  </FR>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const }}>التوصيل</p>
                  <div className="delivery-grid">
                    {(['home', 'office'] as const).map(typ => (
                      <button key={typ} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: typ }))} style={{ padding: '0.75rem', border: `1px solid ${fd.typeLivraison === typ ? A : BD}`, borderRadius: 0, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === typ ? AL : 'transparent', transition: 'all 0.3s', fontFamily: 'inherit' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 4, color: fd.typeLivraison === typ ? A : SUB }}>{typ === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                        {selW && <p className="price-mono" style={{ fontSize: '1rem', fontWeight: 800, color: fd.typeLivraison === typ ? A : SUB }}>{orderFreeShipping ? t.freeShippingBadge : `${(typ === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} ${currency}`}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {supportQty && !product.isDigital && (
              <div style={{ marginBottom: '0.875rem' }}>
                <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const }}>الكمية</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BD}`, overflow: 'hidden' }}>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: SUB }}><Minus size={13} /></button>
                  <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: TXT }}>{fd.quantity}</span>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: A }}><Plus size={13} /></button>
                </div>
              </div>
            )}
            <div style={{ border: `1px solid ${BD}`, padding: '0.875rem 1rem', marginBottom: '1rem' }}>
              {[
                { l: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : ''), v: '' },
                ...(product.isDigital ? [] : [{ l: t.delivery, v: !selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${currency}` }]),
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid ${BD}` }}>
                  <span style={{ fontSize: '0.82rem', color: SUB }}>{r.l}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: TXT }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: TXT }}>{t.total}</span>
                <span className="price-mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: A }}>{total().toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{currency}</span></span>
              </div>
            </div>
            <button type="submit" disabled={sub} style={{ ...S.btnPrimary, opacity: sub ? 0.7 : 1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; }}>
              {sub ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />{t.sending}</> : t.confirmOrder}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function Cart({ domain, store }: { domain: string; store: any }) {
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const currency = store?.currency || 'دج';
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(domain) || '[]'));
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [domain, store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const cartTotal = items.reduce((a, i) => a + (i.finalPrice * i.quantity), 0);
  const hasFreeShippingItem = items.some(i => i.product?.shippingFree || i.product?.offers?.find((o: any) => o.id === i.selectedOffer)?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;
  const getLiv = () => {
    if (freeShippingReached) return 0;
    if (!selW) return 0;
    return Number(fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice);
  };
  const finalTotal = cartTotal + +getLiv();
  const update = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!fd.customerName.trim()) er.name = 'مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = 'رقم هاتف غير صالح';
    if (!fd.customerWelaya) er.w = 'مطلوب';
    if (!fd.customerCommune) er.c = 'مطلوب';
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({
        ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId,
        selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId,
        selectedVariants: i.selectedVariants, platform: i.platform || 'store',
        finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(),
        quantity: i.quantity, customerId: i.customerId || '',
        priceLoss: selW?.livraisonReturn ?? 0
      })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  if (success) return (
    <div dir={t.dir} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', background: CARD, padding: '3.5rem 2rem', border: `1px solid ${BD}`, borderTop: `3px solid ${A}`, maxWidth: 460, width: '100%' }}>
        <CheckCircle2 size={40} style={{ color: '#22C55E', display: 'block', margin: '0 auto 1.25rem' }} />
        <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 600, color: TXT, marginBottom: '0.625rem' }}>{t.successTitle}</h2>
        <p style={{ color: SUB, lineHeight: 1.7, marginBottom: '2rem' }}>{t.successDesc}</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: A, color: '#FFFFFF', padding: '0.8rem 2rem', fontWeight: 700, fontSize: '0.9rem' }}>{t.backToShop}</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir={t.dir} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: `1px dashed ${BD}`, maxWidth: 440, width: '100%', background: CARD }}>
        <ShoppingBag size={48} style={{ color: BD, display: 'block', margin: '0 auto 1.25rem' }} />
        <p style={{ color: SUB, fontSize: '0.95rem', marginBottom: '2rem' }}>{t.cartEmpty}</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: A, color: '#FFFFFF', padding: '0.75rem 1.75rem', fontWeight: 700, fontSize: '0.875rem' }}>{t.shopNow}</Link>
      </div>
    </div>
  );

  return (
    <div dir={t.dir} style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto', minHeight: '100vh', background: BG }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem,5vw,2.4rem)', fontWeight: 600, color: TXT }}>{t.myCart}</h1>
        {freeShippingMin != null && (
          <div style={{ background: freeShippingReached ? AL : BG, border: `1px solid ${freeShippingReached ? A : BD}`, color: freeShippingReached ? A : SUB, padding: '0.75rem 1.125rem', marginTop: '1rem', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
            {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', String(freeShippingRemainingAmt))}
          </div>
        )}
      </div>
      <div className="cart-inner">
        <div style={{ background: CARD, border: `1px solid ${BD}`, overflow: 'hidden', alignSelf: 'start' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem', borderBottom: `1px solid ${BD}` }}>
              <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 72, height: 72, objectFit: 'cover', flexShrink: 0 }} alt="" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, color: TXT, marginBottom: '0.25rem', fontSize: '0.875rem', lineHeight: 1.4 }}>{item.product?.name}</h4>
                <p className="price-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: A }}>{item.finalPrice?.toLocaleString()} {currency}</p>
                <p style={{ fontSize: '0.72rem', color: SUB, marginTop: '0.2rem' }}>{t.qty}: {item.quantity}</p>
              </div>
              <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ color: '#B0AAA4', padding: '0.375rem', borderRadius: 0, background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center', transition: 'color 0.3s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#EF4444')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#B0AAA4')}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <div style={{ padding: '0.875rem', borderTop: `1px solid ${BD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: SUB, fontSize: '0.875rem' }}>{t.subtotal}</span>
            <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: A }}>{cartTotal.toLocaleString()} {currency}</span>
          </div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BD}`, overflow: 'hidden', padding: '1.5rem', alignSelf: 'start' }}>
          <h3 className="font-display" style={{ fontWeight: 600, fontSize: '1rem', color: TXT, marginBottom: '1.25rem' }}>{t.checkoutTitle}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={inp(!!errors.name)} /></FR>
              <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={inp(!!errors.phone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.w} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.w), paddingRight: 34, fontFamily: 'inherit' }}>
                    <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingRight: 34, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ margin: '1rem 0' }}>
              <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, textTransform: 'uppercase' as const, marginBottom: '0.5rem' }}>{t.deliveryType}</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(typ => (
                  <button key={typ} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: typ }))} style={{ padding: '0.75rem', border: `1px solid ${fd.typeLivraison === typ ? A : BD}`, borderRadius: 0, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === typ ? AL : 'transparent', fontFamily: 'inherit', transition: 'all 0.3s' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.78rem', color: fd.typeLivraison === typ ? A : SUB }}>{typ === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                    {selW && <p className="price-mono" style={{ fontWeight: 800, fontSize: '0.9rem', color: fd.typeLivraison === typ ? A : SUB, marginTop: 2 }}>{freeShippingReached ? t.freeShippingBadge : `${(typ === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} ${currency}`}</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ border: `1px solid ${BD}`, padding: '0.875rem 1rem', margin: '1rem 0' }}>
              {[
                { l: t.subtotal, v: `${cartTotal.toLocaleString()} ${currency}` },
                { l: t.delivery, v: !selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${currency}` },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid ${BD}` }}>
                  <span style={{ fontSize: '0.78rem', color: SUB }}>{r.l}</span>
                  <span style={{ fontWeight: 600, color: TXT, fontSize: '0.875rem' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, color: TXT }}>{t.total}</span>
                <span className="price-mono" style={{ fontSize: '1.9rem', fontWeight: 700, color: A }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>{currency}</span></span>
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; }}>
              {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />{t.sending}</> : t.confirmOrder}
            </button>
          </form>
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
        <div style={{ textAlign: 'center', background: CARD, padding: '3rem 2rem', border: `1px solid ${BD}`, marginBottom: '1.5rem' }}>
          <div style={{ width: 60, height: 60, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle2 size={30} style={{ color: A }} />
          </div>
          <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 600, color: TXT, marginBottom: '0.625rem' }}>{t.successTitle}</h2>
          <p style={{ color: SUB, lineHeight: 1.7 }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.75rem', color: TXT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${BD}`, fontSize: 14, fontWeight: 700, color: TXT }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: SUB }}>{t.total}</span>
                <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 600, color: A }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: CARD, border: `1px solid ${BD}`, overflow: 'hidden', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? CheckCircle2;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? `1px solid ${BD}` : 'none', background: done ? AL : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? A : BG, color: done ? '#fff' : SUB }}>
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: A, color: '#FFFFFF', padding: '0.875rem 2rem', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
            <ShoppingBag size={17} /> {t.shopNow}
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', border: `1px solid ${BD}`, color: SUB, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

const Shell = ({ children, title, dir }: { children: React.ReactNode; title: string; dir?: string }) => (
  <div dir={dir || 'rtl'} style={{ minHeight: '100vh', background: BG }}>
    <div style={{ background: CARD, paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, borderBottom: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${BD}`, padding: '0.3rem 1rem', marginBottom: '1.25rem' }}>
          <Disc3 size={11} color={A} />
          <span className="eyebrow" style={{ fontSize: '0.65rem', fontWeight: 600, color: A, textTransform: 'uppercase' as const }}>Premium Audio</span>
        </div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 600, color: TXT }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>{children}</div>
  </div>
);

const InfoBlock = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding: '1.25rem 0', borderBottom: `1px solid ${BD}`, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
    <div style={{ width: 3, height: 16, background: A, flexShrink: 0, marginTop: 4 }} />
    <div>
      <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: TXT, marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: SUB }}>{body}</p>
    </div>
  </div>
);

export function Privacy({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacy} dir={t.dir}>
      <div style={{ background: CARD, padding: '1.75rem', border: `1px solid ${BD}` }}>
        <InfoBlock title={t.privacyData} body={t.privacyDataBody} />
        <InfoBlock title={t.privacyProtect} body={t.privacyProtectBody} />
        <InfoBlock title={t.privacyShare} body={t.privacyShareBody} />
      </div>
    </Shell>
  );
}

export function Terms({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.terms} dir={t.dir}>
      <div style={{ background: CARD, padding: '1.75rem', border: `1px solid ${BD}` }}>
        <InfoBlock title={t.termsAccount} body={t.termsAccountBody} />
        <InfoBlock title={t.termsOrders} body={t.termsOrdersBody} />
        <InfoBlock title={t.termsLaw} body={t.termsLawBody} />
      </div>
    </Shell>
  );
}

export function Cookies({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookies} dir={t.dir}>
      <div style={{ background: CARD, padding: '1.75rem', border: `1px solid ${BD}` }}>
        <InfoBlock title={t.cookiesEssential} body={t.cookiesEssentialBody} />
        <InfoBlock title={t.cookiesExp} body={t.cookiesExpBody} />
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
    catch { showError(t.errSubmit); } finally { setLoading(false); }
  };

  return (
    <div dir={t.dir} style={{ background: BG, minHeight: '100vh' }}>
      <div style={{ background: CARD, paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, borderBottom: `1px solid ${BD}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 600, color: TXT, marginBottom: '0.5rem' }}>{t.contact}</h1>
          <p style={{ color: SUB, fontSize: '0.9375rem' }}>{t.contactSect}</p>
        </div>
      </div>
      <div className="contact-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div>
          <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '1.5rem', marginBottom: '1rem' }}>
            {[
              { icon: <Phone size={15} />, label: 'الهاتف', val: store?.contact?.phone || 'غير متوفر' },
              { icon: <MapPin size={15} />, label: 'الموقع', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || 'الجزائر' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                <div style={{ width: 38, height: 38, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A, flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <p className="eyebrow" style={{ fontSize: '0.65rem', color: SUB, fontWeight: 600, textTransform: 'uppercase' as const, marginBottom: '0.15rem' }}>{r.label}</p>
                  <p style={{ fontWeight: 600, color: TXT, fontSize: '0.875rem' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ border: `1px solid ${BD}`, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: A }}>نرد في غضون ساعة</span>
          </div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <CheckCircle2 size={40} style={{ color: '#22C55E', display: 'block', margin: '0 auto 1.25rem' }} />
              <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 600, color: TXT, marginBottom: '0.5rem' }}>{t.successTitle}</h2>
              <p style={{ color: SUB, lineHeight: 1.7, marginBottom: '2rem' }}>{t.successDesc}</p>
              <button onClick={() => setSent(false)} style={{ padding: '0.75rem 1.75rem', borderRadius: 0, border: `1px solid ${A}`, background: AL, color: A, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}>{t.backToShop}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                <div>
                  <label className="eyebrow" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const }}>{t.fullName}</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={S.input} />
                </div>
                <div>
                  <label className="eyebrow" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const }}>{t.phone}</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={S.input} />
                </div>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <label className="eyebrow" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const }}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={S.input} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="eyebrow" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const }}>{isRTL ? 'الرسالة' : 'Message'}</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...S.input, resize: 'none' }} />
              </div>
              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />{t.sending}</> : <>{t.sendBtn} <ArrowLeft size={16} style={{ transform: isRTL ? 'none' : 'scaleX(-1)' }} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy store={store} />}
      {p === 'terms' && <Terms store={store} />}
      {p === 'cookies' && <Cookies store={store} />}
      {p === 'contact' && <Contact store={store} />}
    </>
  );
}

