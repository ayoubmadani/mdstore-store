'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Phone,
  CheckCircle2, ArrowLeft, ArrowRight, Zap,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, MapPin, Shield, Truck, Package,
  Mail,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/*
  ██████╗  ██████╗ ██╗     ██████╗     ██╗   ██╗██████╗ ██████╗  █████╗ ███╗  ██╗
  ██╔══██╗██╔═══██╗██║     ██╔══██╗    ██║   ██║██╔══██╗██╔══██╗██╔══██╗████╗ ██║
  ██████╦╝██║   ██║██║     ██║  ██║    ██║   ██║██████╔╝██████╦╝███████║██╔██╗██║
  ██╔══██╗██║   ██║██║     ██║  ██║    ██║   ██║██╔══██╗██╔══██╗██╔══██║██║╚████║
  ██████╦╝╚██████╔╝███████╗██████╔╝    ╚██████╔╝██║  ██║██████╔╝██║  ██║██║ ╚███║
  ═══════ THEME: BOLD / COLOR: #D4AF37 + #1D1D1D + #0D0D0D
*/

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Readex Pro', sans-serif;
    background: #0D0D0D;
    color: #F0F0F0;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #111111; }
  ::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 2px; }

  /* ── Keyframes ── */
  @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideFade { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes ticker     { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes checkPop   { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0} }

  .anim-slide-down { animation: slideDown 0.25s ease both; }
  .anim-slide-fade { animation: slideFade 0.35s ease both; }
  .anim-check      { animation: checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* ── Ticker ── */
  .ticker-wrap { overflow: hidden; background: #D4AF37; color: #fff; height: 36px; display: flex; align-items: center; }
  .ticker-track { display: flex; white-space: nowrap; animation: ticker 28s linear infinite; }
  .ticker-item  { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; padding: 0 2.5rem; }

  /* ── Responsive Layout ── */
  .nav-desktop  { display: none; align-items: center; gap: 2rem; }
  .nav-search-d { display: none; flex: 1; max-width: 400px; margin: 0 1.5rem; }
  .nav-mobile   { display: flex; gap: 0.625rem; }

  @media (min-width: 1024px) {
    .nav-desktop  { display: flex; }
    .nav-search-d { display: block; }
    .nav-mobile   { display: none; }
  }

  .trust-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0;
  }
  @media (min-width: 1024px) {
    .trust-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .cats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.625rem;
  }
  @media (min-width: 640px) {
    .cats-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1024px) {
    .cats-grid { grid-template-columns: repeat(6, 1fr); }
  }

  .products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 1024px) {
    .products-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
  }
  @media (min-width: 1280px) {
    .products-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .hero-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: center;
    min-height: 88vh;
    padding: 7rem 1.5rem 4rem;
  }
  @media (min-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr 1fr; min-height: 100vh; padding: 0 4rem; }
  }

  /* ── Details Section ── */
  .details-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem; /* تقليل البادينج الجانبي جداً للجوال */
  }

  /* حاوية المعرض */
  .gallery-container {
    position: relative; /* عادٍ (Static/Relative) في الجوال */
    top: 0;
    width: 100%;
  }

  /* حاوية المعلومات */
  .info-container {
    background: #1C1C1C;
    color: #F0F0F0;
    border-radius: 14px;
    padding: 1.25rem; /* بادينج مريح للجوال */
    border: 1.5px solid #2E2E2E;
  }

  @media (min-width: 768px) {
    .details-inner { 
      grid-template-columns: 1fr 1fr; 
      gap: 3rem; 
      padding: 2rem; 
    }

    .gallery-container {
      position: sticky; /* ثابت فقط في الشاشات الكبيرة */
      top: 100px;
      z-index: 10;
    }

    .info-container {
      padding: 1.75rem;
    }
  }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.875rem;
    margin-bottom: 0.875rem;
  }
  @media (min-width: 500px) {
    .form-row-2 { grid-template-columns: 1fr 1fr; }
  }

  .cart-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) {
    .cart-inner { grid-template-columns: 1.2fr 1fr; gap: 3rem; }
  }

  .contact-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) {
    .contact-inner { grid-template-columns: 1fr 2fr; }
  }

  .footer-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    padding-bottom: 3rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  @media (min-width: 768px) {
    .footer-inner { grid-template-columns: 2fr 1fr 1fr 1fr; }
  }

  .hero-actions { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .hero-actions { flex-direction: row; align-items: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

  .thumb-row { display: flex; gap: 0.625rem; margin-top: 0.875rem; overflow-x: auto; padding-bottom: 4px; }

  .pagination { display: flex; justify-content: center; gap: 0.375rem; flex-wrap: wrap; margin-top: 3rem; }

  /* ── Utility ── */
  a { text-decoration: none; color: inherit; }

  /* ── Price mono ── */
  .price-mono {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
    letter-spacing: -0.02em;
  }

  /* ── Card stripe ── */
  .card-stripe::before {
    content: '';
    position: absolute;
    inset: 0;
    bottom: auto;
    height: 3px;
    background: #D4AF37;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
  }
  .card-wrap:hover .card-stripe::before { transform: scaleX(1); }
`;

/* ─── TYPES ─── */
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
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
  store?: any;
}

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

/* ─── SHARED STYLES ─── */
const S = {
  input: {
    width: '100%', padding: '0.8rem 1rem',
    background: '#1C1C1C', border: '1.5px solid #2E2E2E',
    borderRadius: 8, fontSize: '0.9rem', color: '#F0F0F0',
    outline: 'none', transition: 'border-color 0.18s', appearance: 'none'
  } as React.CSSProperties,
  inputErr: { borderColor: '#D4AF37' } as React.CSSProperties,
  btnPrimary: {
    width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: '#D4AF37', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
    padding: '0.9rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: 'inherit'
  } as React.CSSProperties,
};

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */

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
  // Contact page
  contactTagline: 'نحن هنا للإجابة على استفساراتكم',
  contactInfoTitle: 'معلومات الاتصال',
  contactPhone: 'الهاتف',
  contactLocation: 'الموقع',
  contactNA: 'غير متوفر',
  contactDefaultLocation: 'الجزائر',
  replyTime: 'نرد في غضون ساعة',
  sendAnother: 'إرسال رسالة أخرى',
  email: 'البريد الإلكتروني',
  message: 'رسالتك',
  messagePh: 'كيف يمكننا مساعدتك؟',
  sendMsg: 'إرسال الرسالة',
  // Product extra
  totalPrice: 'السعر الإجمالي',
  discountLabel: 'خصم',
  freeShippingBadge: '🚚 توصيل مجاني',
  freeShippingThreshold: '🚚 توصيل مجاني للطلبات بـ {{amount}} دج أو أكثر',
  freeShippingRemaining: 'أضف {{amount}} دج أخرى للحصول على توصيل مجاني',
  freeShippingReached: '🎉 حصلت على توصيل مجاني!',
  // Home sections
  categories: 'الفئات',
  products: 'المنتجات',
  // Trust bar
  trust: [
    { t: 'توصيل لكل الولايات', d: 'الـ 58 ولاية جزائرية' },
    { t: 'ضمان الجودة', d: 'منتجات 100% أصلية' },
    { t: 'دفع آمن', d: 'عند الاستلام' },
    { t: 'دعم 24/7', d: 'نحن دائماً هنا' },
  ],
  // Hero defaults
  heroTitle: 'تسوق بثقة واحصل على الأفضل',
  heroSubtitle: 'منتجات أصلية بأسعار مناسبة. توصيل لجميع الولايات في أسرع وقت.',
  // Footer
  replyNow: 'نرد الآن',
  footerDesc: 'تجربة تسوق عصرية وسريعة. توصيل لجميع الولايات الجزائرية.',
  quickLinks: 'روابط سريعة', legalNav: 'قانوني',
  contactSect: 'تواصل معنا',
  privacy: 'الخصوصية',
  terms: 'الشروط',
  cookies: 'الكوكيز',
  rightsReserved: 'جميع الحقوق محفوظة',
  // Static pages
  pages: {
    privacy: {
      title: 'سياسة الخصوصية',
      blocks: [
        { title: 'البيانات التي نجمعها', body: 'نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم، رقم الهاتف، وعنوان السكن لضمان وصول شحنتكم بدقة.' },
        { title: 'حماية البيانات', body: 'تُخزن جميع البيانات بشكل مشفر وآمن. نستخدم بروتوكولات حماية متطورة لمنع أي وصول غير مصرح به لمعلوماتكم.' },
        { title: 'مشاركة المعلومات', body: 'نلتزم بخصوصيتكم؛ لا نقوم ببيع أو مشاركة بياناتكم مع أي جهات خارجية باستثناء شركات التوصيل المعتمدة.' },
      ],
    },
    terms: {
      title: 'شروط الاستخدام',
      blocks: [
        { title: 'الحساب والمسؤولية', body: 'المستخدم مسؤول عن دقة البيانات المدخلة وعن الحفاظ على سرية معلومات حسابه والأنشطة التي تتم من خلاله.' },
        { title: 'الطلبات والمدفوعات', body: 'يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الأسعار المعلنة هي الأسعار النهائية المعتمدة للمنتجات.' },
        { title: 'القانون الحاكم', body: 'تخضع كافة التعاملات والنزاعات للقوانين والتشريعات المعمول بها في جمهورية الجزائر الديمقراطية الشعبية.' },
      ],
    },
    cookies: {
      title: 'ملفات تعريف الارتباط',
      blocks: [
        { title: 'الملفات الأساسية', body: 'نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل سلة المشتريات بشكل صحيح وتأمين جلسة تسجيل الدخول الخاصة بك.' },
        { title: 'تحسين التجربة', body: 'نستخدم بعض الملفات لتحليل كيفية تفاعل المستخدمين مع المتجر، مما يساعدنا على تطوير خدماتنا وتقديم محتوى مخصص.' },
      ],
    },
  },
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
  // Contact page
  contactTagline: 'Nous sommes là pour répondre à vos questions',
  contactInfoTitle: 'Informations de contact',
  contactPhone: 'Téléphone',
  contactLocation: 'Localisation',
  contactNA: 'Non disponible',
  contactDefaultLocation: 'Algérie',
  replyTime: "Réponse en moins d'une heure",
  sendAnother: 'Envoyer un autre message',
  email: 'Email',
  message: 'Message',
  messagePh: 'Comment pouvons-nous vous aider?',
  sendMsg: 'Envoyer',
  // Product extra
  totalPrice: 'Prix Total',
  discountLabel: 'OFF',
  freeShippingBadge: '🚚 Livraison gratuite',
  freeShippingThreshold: '🚚 Livraison gratuite dès {{amount}} DZD d\'achat',
  freeShippingRemaining: 'Ajoutez {{amount}} DZD de plus pour la livraison gratuite',
  freeShippingReached: '🎉 Livraison gratuite obtenue !',
  // Home sections
  categories: 'Catégories',
  products: 'Produits',
  // Trust bar
  trust: [
    { t: 'Livraison partout', d: 'Les 58 wilayas' },
    { t: 'Qualité garantie', d: '100% authentiques' },
    { t: 'Paiement sécurisé', d: 'À la livraison' },
    { t: 'Support 24/7', d: 'Toujours disponible' },
  ],
  // Hero defaults
  heroTitle: 'Achetez avec confiance, obtenez le meilleur',
  heroSubtitle: 'Produits authentiques à prix abordables. Livraison rapide partout en Algérie.',
  // Footer
  replyNow: 'Disponible',
  footerDesc: 'Shopping moderne et rapide. Livraison dans toutes les wilayas algériennes.',
  quickLinks: 'Navigation', legalNav: 'Légal',
  contactSect: 'Contact',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  rightsReserved: 'Tous droits réservés.',
  // Static pages
  pages: {
    privacy: {
      title: 'Politique de confidentialité',
      blocks: [
        { title: 'Données collectées', body: 'Nous ne collectons que les informations nécessaires au traitement de vos commandes : nom, téléphone et adresse de livraison.' },
        { title: 'Protection des données', body: 'Toutes les données sont stockées de manière chiffrée et sécurisée. Nous utilisons des protocoles avancés pour prévenir tout accès non autorisé.' },
        { title: 'Partage des informations', body: 'Nous respectons votre vie privée et ne partageons vos données avec aucun tiers, à l\'exception des transporteurs agréés.' },
      ],
    },
    terms: {
      title: 'Conditions d\'utilisation',
      blocks: [
        { title: 'Compte et responsabilité', body: 'L\'utilisateur est responsable de l\'exactitude des données saisies et de la confidentialité de ses informations de compte.' },
        { title: 'Commandes et paiements', body: 'Les commandes sont confirmées par téléphone avant expédition. Les prix affichés sont les prix finaux des produits.' },
        { title: 'Loi applicable', body: 'Toutes les transactions et litiges sont soumis aux lois en vigueur en République Algérienne Démocratique et Populaire.' },
      ],
    },
    cookies: {
      title: 'Cookies',
      blocks: [
        { title: 'Cookies essentiels', body: 'Nous utilisons des cookies essentiels pour assurer le bon fonctionnement du panier et sécuriser votre session.' },
        { title: 'Amélioration de l\'expérience', body: 'Certains cookies nous aident à analyser l\'interaction des utilisateurs avec la boutique afin d\'améliorer nos services.' },
      ],
    },
  },
};

const jsonEn = {
  dir: 'ltr',
  home: 'Home', contact: 'Contact', cart: 'Cart',
  search: 'Search...', searching: 'Searching...', noResults: 'No results found',
  showAll: 'View all results →',
  all: 'All', noProducts: 'No products available at the moment.',
  shopNow: 'Shop Now', searchResultsFor: 'Search results for:',
  fullName: 'Full Name', fullNamePh: 'Enter your name', errName: 'Name is required',
  phone: 'Phone Number', phonePh: '05xxxxxxxx',
  errPhone: 'Phone number is required', errPhoneInvalid: 'Invalid phone number',
  wilaya: 'Wilaya', errWilaya: 'Please select a wilaya',
  wilayaPh: 'Choose wilaya', wilayaNA: 'Delivery not available',
  commune: 'Commune', errCommune: 'Please select a commune',
  communePh: 'Choose commune', communeLoading: 'Loading...',
  deliveryType: 'Delivery Type', deliveryHome: 'Home Delivery', deliveryOffice: 'Post Office',
  qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total',
  subtotal: 'Subtotal', orderInfo: 'Order Summary',
  addToCart: 'Add to Cart', orderNow: 'Order Now',
  confirmOrder: 'Confirm Order', sending: 'Sending...', back: 'Cancel',
  addedMsg: 'Added to cart successfully!',
  errSubmit: 'An error occurred. Please try again.',
  myCart: 'My Cart', cartEmpty: 'Your cart is empty',
  cartEmptyDesc: 'You have not added any products yet.',
  successTitle: 'Order placed successfully!',
  successDesc: 'We will contact you shortly to confirm the details.',
  backToShop: 'Back to Shop', checkoutTitle: 'Checkout',
  successSteps: [
    { title: 'Order received', desc: 'Your order has been registered successfully' },
    { title: 'Confirmation', desc: "We'll call you within 24 hours" },
    { title: 'Packaging', desc: 'Your order is being prepared with care' },
    { title: 'Shipping', desc: '2-5 business days' },
  ],
  offersTitle: 'Available Offers', descTitle: 'Description',
  contactTagline: 'We are here to answer your questions',
  contactInfoTitle: 'Contact Information',
  contactPhone: 'Phone', contactLocation: 'Location',
  contactNA: 'Not available', contactDefaultLocation: 'Algeria',
  replyTime: 'Reply within one hour', sendAnother: 'Send another message',
  email: 'Email', message: 'Your message',
  messagePh: 'How can we help you?', sendMsg: 'Send Message',
  totalPrice: 'Total Price', discountLabel: 'OFF',
  freeShippingBadge: '🚚 Free Delivery',
  freeShippingThreshold: '🚚 Free Delivery on orders over {{amount}} DZD',
  freeShippingRemaining: 'Add {{amount}} DZD more for free delivery',
  freeShippingReached: '🎉 You got free delivery!',
  categories: 'Categories', products: 'Products',
  trust: [
    { t: 'Nationwide Delivery', d: 'All 58 wilayas' },
    { t: 'Quality Guaranteed', d: '100% authentic products' },
    { t: 'Secure Payment', d: 'Cash on delivery' },
    { t: '24/7 Support', d: 'Always here for you' },
  ],
  heroTitle: 'Shop with confidence, get the best',
  heroSubtitle: 'Authentic products at great prices. Fast delivery across Algeria.',
  replyNow: 'Online now',
  footerDesc: 'Modern and fast shopping experience. Delivery across all Algerian wilayas.',
  quickLinks: 'Quick Links', legalNav: 'Legal', contactSect: 'Contact Us',
  privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies', rightsReserved: 'All rights reserved.',
  pages: {
    privacy: {
      title: 'Privacy Policy',
      blocks: [
        { title: 'Data We Collect', body: 'We only collect information necessary to process your orders: name, phone number, and delivery address.' },
        { title: 'Data Protection', body: 'All data is stored in an encrypted and secure manner. We use advanced protocols to prevent any unauthorized access.' },
        { title: 'Information Sharing', body: 'We respect your privacy and do not sell or share your data with third parties, except for authorized delivery partners.' },
      ],
    },
    terms: {
      title: 'Terms of Use',
      blocks: [
        { title: 'Account & Responsibility', body: 'Users are responsible for the accuracy of submitted information and the confidentiality of their account details.' },
        { title: 'Orders & Payments', body: 'Orders are confirmed by phone before shipping. Displayed prices are the final prices for all products.' },
        { title: 'Governing Law', body: 'All transactions and disputes are subject to the laws and regulations of the People\'s Democratic Republic of Algeria.' },
      ],
    },
    cookies: {
      title: 'Cookies',
      blocks: [
        { title: 'Essential Cookies', body: 'We use essential cookies to ensure the shopping cart works correctly and to secure your login session.' },
        { title: 'Experience Improvement', body: 'Some cookies help us analyze how users interact with the store, enabling us to improve our services.' },
      ],
    },
  },
};

type Lang = 'ar' | 'fr' | 'en';
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr, en: jsonEn };
const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};

export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#1C1C1C' }}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { const s = localStorage.getItem(domain); initCount(JSON.parse(s || '[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); setListSearch(data.products || []); }
      catch { /* ignore */ } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setListSearch([]); setShowSearch(false); }
  };

  const DropResults = () => (
    <div style={{ paddingTop: 25, position: 'absolute', top: 'calc(100% + 6px)', right: 0, left: 0, background: '#1C1C1C', border: '1.5px solid #2E2E2E', borderRadius: 10, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 60, maxHeight: '300px', overflowY: 'auto' }} className="anim-slide-down">
      <button onClick={() => setSearchQuery('')} className='fixed top-3 left-3 cursor-pointer hover:text-red-400'>
        <X size={14} />
      </button>
      {loading ? <div style={{ padding: '1.5rem', textAlign: 'center', color: '#D4AF37', fontSize: '0.85rem', fontWeight: 600 }}>{t.searching}</div>
        : listSearch.length > 0 ? (
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {listSearch.map((p: any) => (
              <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSearchQuery('')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0', textDecoration: 'none' }}>
                <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} alt="" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F0F0F0' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 700 }}>{p.price} {store?.currency || 'DZD'}</div>
                </div>
              </Link>
            ))}
            <button
              onClick={handleSearch}
              style={{
                width: '100%', padding: '12px', background: '#FEF2F2', border: 'none',
                borderTop: '1px solid #FEE2E2', color: '#D4AF37', fontWeight: 800,
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
              {t.showAll} {isRTL ? <ArrowLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        ) : searchQuery.length >= 2 && <div style={{ padding: '1.5rem', textAlign: 'center', color: '#777', fontSize: '0.85rem' }}>{t.noResults}</div>}
    </div>
  );

  return (
    <>
      {/* Ticker */}
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="ticker-item">⚡ {store.topBar.text}</span>
            ))}
          </div>
        </div>
      )}

      <nav dir={isRTL ? 'rtl' : 'ltr'} style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(10,10,10,0.96)' : '#0D0D0D',
        borderBottom: `2px solid ${scrolled ? '#2E2E2E' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

          <Link href="/" style={{ flexShrink: 0, textDecoration: 'none' }}>
            {/* إذا كان هناك رابط مخصص للصورة، نعرض الشعار */}
            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
              <img
                src={store.design.logoUrl}
                style={{ height: 34, objectFit: 'contain', display: 'block' }}
                alt={store?.name || 'Store Logo'}
                onError={() => setImgError(true)}
              />
            ) : (
              // وإذا لم يكن هناك رابط أو حدث خطأ، نعرض اللوجو المستطيل بالتصميم الجديد
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '0 12px',
                  height: 36,
                  background: 'rgb(212, 175, 55)',
                  color: '#fff',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                  whiteSpace: 'nowrap' // لضمان عدم انقسام الاسم
                }}>
                  {store?.name?.toUpperCase() || 'SHAMSOU GAME'}
                </div>
              </div>
            )}
          </Link>

          {/* Desktop search */}
          <div className="nav-search-d" style={{ position: 'relative' }}>
            <form onSubmit={handleSearch}>
              <input type="text" placeholder={t.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: isRTL ? '0.625rem 1rem 0.625rem 2.75rem' : '0.625rem 2.75rem 0.625rem 1rem', borderRadius: 8, border: '1.5px solid #2E2E2E', background: '#1C1C1C', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = '#D4AF37')}
                onBlur={e => (e.target.style.borderColor = '#2E2E2E')} />
              <Search size={15} style={{ position: 'absolute', ...(isRTL ? { left: 12 } : { right: 12 }), top: '50%', transform: 'translateY(-50%)', color: '#777' }} />
            </form>
            {searchQuery.length >= 2 && <DropResults />}
          </div>

          {/* Desktop nav */}
          <div className="nav-desktop">
            {[{ h: '/', l: t.home }, { h: '/contact', l: t.contact }].map(i => (
              <Link key={i.h} href={i.h} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#BBBBBB', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
                onMouseLeave={e => (e.currentTarget.style.color = '#BBBBBB')}>{i.l}</Link>
            ))}
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: '#111', color: '#fff', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#D4AF37')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#111')}>
                <ShoppingCart size={17} />
                {count > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#D4AF37', color: '#fff', fontSize: 10, fontWeight: 700, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0D0D0D' }}>{count}</span>}
              </Link>
            )}

          </div>

          {/* Mobile */}
          <div className="nav-mobile">
            <button onClick={() => setShowSearch(!showSearch)} style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid #2E2E2E', background: '#1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Search size={16} />
            </button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', width: 38, height: 38, borderRadius: 8, border: '1.5px solid #2E2E2E', background: '#1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4D4D4' }}>
                <ShoppingCart size={16} />
                {count > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#D4AF37', color: '#fff', fontSize: 9, fontWeight: 800, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}

            <button onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid #2E2E2E', background: '#1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {showSearch && (
          <div style={{ padding: '0.625rem 1.25rem', background: '#1C1C1C', borderTop: '1px solid #2E2E2E', position: 'relative' }} className="anim-slide-down">
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input autoFocus type="text" placeholder={t.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: isRTL ? '0.75rem 1rem 0.75rem 2.75rem' : '0.75rem 2.75rem 0.75rem 1rem', border: '1.5px solid #D4AF37', borderRadius: 8, background: '#1C1C1C', fontSize: '0.9rem', outline: 'none' }} />
              <Search size={15} style={{ position: 'absolute', ...(isRTL ? { left: 12 } : { right: 12 }), top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
            </form>
            {searchQuery.length >= 2 && <DropResults />}
          </div>
        )}

        {/* Mobile nav */}
        <div style={{ overflow: 'hidden', maxHeight: open ? 180 : 0, transition: 'max-height 0.28s ease', background: '#1C1C1C', borderTop: open ? '1px solid #2E2E2E' : 'none' }}>
          <div style={{ padding: '0.375rem 1.25rem 0.875rem' }}>
            {[{ h: '/', l: t.home }, { h: '/contact', l: t.contact }].map(i => (
              <Link key={i.h} href={i.h} onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #F0F0F0', fontSize: '0.9rem', fontWeight: 600, color: '#F0F0F0' }}>
                {i.l} {isRTL ? <ArrowLeft size={14} style={{ color: '#D4AF37' }} /> : <ChevronRight size={14} style={{ color: '#D4AF37' }} />}
              </Link>
            ))}
            
          </div>
        </div>
      </nav>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER — 3 أقسام
═══════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  return (
    <footer dir={isRTL ? 'rtl' : 'ltr'} style={{ background: '#111', color: '#777', marginTop: 80, padding: '4rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-inner">

          {/* قسم 1 — العلامة */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{ width: 32, height: 32, background: '#D4AF37', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: '#999999', maxWidth: 320 }}>
              {store?.hero?.subtitle?.substring(0, 100) || t.footerDesc}
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#D4D4D4' }}>
              © {new Date().getFullYear()} {store?.name}. {t.rightsReserved}
            </p>
          </div>

          {/* قسم 2 — الروابط */}
          <div>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>{t.quickLinks}</h4>
            {[{ h: '/', l: t.home }, { h: '/cart', l: t.cart }, { h: '/contact', l: t.contact }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: '#999999', marginBottom: '0.625rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
                onMouseLeave={e => (e.currentTarget.style.color = '#999999')}>
                {lnk.l}
              </Link>
            ))}
          </div>

          {/* قانوني */}
          <div>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>{t.legalNav}</h4>
            {[{ h: '/Privacy', l: t.privacy }, { h: '/Terms', l: t.terms }, { h: '/cookies', l: t.cookies }].map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '0.625rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666')}>
                {lnk.l}
              </Link>
            ))}
          </div>

          {/* قسم 3 — التواصل */}
          <div>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>{t.contactSect}</h4>
            {[
              { icon: <Phone size={14} />, val: store?.contact?.phone },
              { icon: <Mail size={14} />, val: store?.contact?.email },
              { icon: <MapPin size={14} />, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', color: '#999999', fontSize: '0.875rem' }}>
                <span style={{ color: '#D4AF37' }}>{r.icon}</span>{r.val}
              </div>
            ))}
            <div style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1A1A1A', padding: '0.5rem 0.875rem', borderRadius: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              <span style={{ fontSize: '0.78rem', color: '#777' }}>{t.replyNow}</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD
═══════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  const cardLang = getLang(store);
  const cardRTL = cardLang === 'ar';

  return (
    <div className="card-wrap" style={{ background: '#1C1C1C', border: '1.5px solid #2E2E2E', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', transition: 'all 0.28s ease' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#D4AF37'; el.style.boxShadow = '0 8px 32px rgba(212,175,55,0.1)'; el.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#2E2E2E'; el.style.boxShadow = 'none'; el.style.transform = ''; }}>

      <div className="card-stripe" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }} />

      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#111111', overflow: 'hidden' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={36} color="#2E2E2E" /></div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: '#D4AF37', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 4 }}>
            -{discount}%
          </div>
        )}
        {product.shippingFree && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#111', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
            🚚
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F0F0F0', marginBottom: '0.5rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', gap: 2, marginBottom: '0.875rem' }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={11} style={{ fill: i < 4 ? '#F59E0B' : 'none', color: '#F59E0B' }} />)}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <span className="price-mono" style={{ fontSize: '1.375rem', fontWeight: 800, color: '#F0F0F0' }}>{price.toLocaleString()}</span>
            <span style={{ fontSize: '0.75rem', color: '#777777', fontWeight: 500 }}>{store.currency || 'DZD'}</span>
            {orig > price && <span style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
          <Link
            href={`/product/${product.slug || product.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              padding: '0.625rem',
              borderRadius: 8,
              background: 'transparent',
              border: '1.5px solid #D4AF37',
              color: '#D4AF37',
              fontSize: '0.825rem',
              fontWeight: 700,
              transition: 'background 0.2s, border-color 0.2s, color 0.2s'
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = '#D4AF37';
              el.style.borderColor = '#D4AF37';
              el.style.color = '#fff';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = 'transparent';
              el.style.borderColor = '#D4AF37';
              el.style.color = '#D4AF37';
            }}
          >
            {viewDetails} {cardRTL ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', background: '#111', overflow: 'hidden' }}>
        {store.hero?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
          </div>
        )}
        {/* Geometric accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(135deg, #D4AF37 0%, transparent 60%)', opacity: 0.12, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 300, height: 300, border: '60px solid rgba(212,175,55,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="hero-inner" style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 6, padding: '0.375rem 0.875rem', marginBottom: '1.5rem' }}>
              <Zap size={13} color="#D4AF37" fill="#D4AF37" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D4AF37', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{store.name}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.25rem,6vw,4.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || t.heroTitle) }} />
            <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              {store.hero?.subtitle || t.heroSubtitle}
            </p>
            <div className="hero-actions">
              <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D4AF37', color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '0.875rem 1.75rem', borderRadius: 10, transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(212,175,55,0.35)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#B8962E')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#D4AF37')}>
                {t.shopNow} {isRTL ? <ArrowLeft size={16} /> : <ChevronRight size={16} />}
              </a>
              {store?.cart !== false && (
                <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', padding: '0.875rem 1.75rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', transition: 'background 0.2s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.14)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)')}>
                  {t.cart}
                </Link>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: '#1C1C1C', borderBottom: '1px solid #2E2E2E' }}>
        <div className="trust-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
          {([<Truck size={18} />, <Shield size={18} />, <CheckCircle2 size={18} />, <Phone size={18} />] as const).map((icon, i) => {
            const item = t.trust[i];
            return (
            <div key={i} style={{ padding: '1.125rem 1rem', textAlign: 'center', borderLeft: i < 3 ? '1px solid #2E2E2E' : 'none' }}>
              <div style={{ color: '#D4AF37', marginBottom: '0.375rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F0F0F0', marginBottom: '0.2rem' }}>{item.t}</p>
              <p style={{ fontSize: '0.72rem', color: '#777777' }}>{item.d}</p>
            </div>
            );
          })}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (
        <section style={{ padding: '4rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ width: 4, height: 28, background: '#D4AF37', borderRadius: 2 }} />
            <h2 style={{ fontSize: 'clamp(1.375rem,3.5vw,2rem)', fontWeight: 800, color: '#F0F0F0' }}>{t.categories}</h2>
          </div>
          <div className="cats-grid">
            <Link href="?" style={{ display:'inline-flex', alignItems:'center', padding:'0.5rem 1.25rem', borderRadius:999, border:`1.5px solid ${!activeCategory ? '#D4AF37' : '#ccc'}`, background: !activeCategory ? '#D4AF37' : 'transparent', color: !activeCategory ? '#fff' : 'inherit', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }}>
                {t.all}
              </Link>
              {cats.map((cat: any) => {
              const isActive = activeCategory === String(cat.id);
              return (
              <Link key={cat.id} href={`?category=${cat.id}`} style={{
                padding: '0.75rem 0.875rem', border: `1.5px solid ${isActive ? '#D4AF37' : '#2E2E2E'}`, borderRadius: 8,
                textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: isActive ? '#fff' : '#333',
                background: isActive ? '#D4AF37' : '#fff', transition: 'all 0.18s'
              }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#D4AF37'; el.style.color = '#D4AF37'; el.style.background = 'rgba(212,175,55,0.04)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = isActive ? '#D4AF37' : '#2E2E2E'; el.style.color = isActive ? '#fff' : '#333'; el.style.background = isActive ? '#D4AF37' : '#1C1C1C'; }}>
                {cat.name}
              </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding: '1rem 1.5rem 5rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: 4, height: 28, background: '#D4AF37', borderRadius: 2 }} />
          <h2 style={{ fontSize: 'clamp(1.375rem,3.5vw,2rem)', fontWeight: 800, color: '#F0F0F0' }}>{t.products}</h2>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', border: '2px dashed #2E2E2E', borderRadius: 16 }}>
            <p style={{ color: '#555', fontSize: '1rem' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails={t.shopNow} />;
            })}
          </div>
        )}

        {countPage > 1 && (
          <div className="pagination" dir={isRTL ? 'rtl' : 'ltr'}>
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid #2E2E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1C1C1C', color: '#F0F0F0' }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, border: `1.5px solid ${isA ? '#D4AF37' : '#2E2E2E'}`, background: isA ? '#D4AF37' : '#fff', color: isA ? '#fff' : '#111' }}>
                  {pn}
                </Link>
              );
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid #2E2E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1C1C1C', color: '#F0F0F0' }}>❯</Link>
          </div>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DETAILS
═══════════════════════════════════════════════════════════ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const lang = getLang(store || product?.store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const [sel, setSel] = useState(0);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: '#1C1C1C', paddingBottom: '4rem' }}>
      <div className="details-inner" style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* 1. قسم المعرض (Gallery) */}
        <div className="gallery-container">
          <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 14, overflow: 'hidden', background: '#1A1A1A', border: '1.5px solid #2E2E2E' }}>
            {allImages[sel]
              ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={48} color="#ccc" /></div>}

            {discount > 0 && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: '#D4AF37', color: '#fff', padding: '3px 12px', borderRadius: 5, fontSize: 12, fontWeight: 800 }}>
                {discount}% {t.discountLabel}
              </div>
            )}

            {allImages.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 8, background: '#1C1C1C', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}><ChevronRight size={18} /></button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 8, background: '#1C1C1C', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}><ChevronLeft size={18} /></button>
              </>
            )}
          </div>

          {/* الصور المصغرة - Thumbnails */}
          {allImages.length > 1 && (
            <div className="thumb-row">
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: `2px solid ${sel === idx ? '#D4AF37' : '#2E2E2E'}`, opacity: sel === idx ? 1 : 0.55, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.18s' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. قسم المعلومات (Info) */}
        <div>
          <div className="info-container">
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: '#F0F0F0', marginBottom: '0.75rem', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', gap: 3, marginBottom: '1.25rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={15} style={{ fill: i < 4 ? '#F59E0B' : 'none', color: '#F59E0B' }} />)}
            </div>

            {/* Price box - Power Red Version */}
            <div style={{
              background: '#141414', // dark luxury bg
              border: '1.5px solid #D4AF37', // إطار أحمر صريح
              borderRadius: 12,
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.1)'
            }}>
              <p style={{
                fontSize: '0.75rem',
                color: '#D4AF37',
                fontWeight: 700,
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>{t.totalPrice}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span className="price-mono" style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: '#F0F0F0' // السعر بالأسود ليكون التباين مع الأحمر قوياً
                }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#D4AF37' // العملة بالأحمر
                }}>
                  { 'DZD'}
                </span>
              </div>
            </div>

            {(product.shippingFree || ((store || product?.store)?.supportFreeShipping && (store || product?.store)?.freeShippingMinAmount != null)) && (
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#D4AF37', marginBottom: '1.25rem' }}>
                {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', String((store || product?.store).freeShippingMinAmount))}
              </p>
            )}

            {/* Offers - تم تغيير اللون للأحمر المتناسق */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: `1.5px solid ${selectedOffer === o.id ? '#D4AF37' : '#2E2E2E'}`, borderRadius: 10, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? 'rgba(212, 175, 55, 0.04)' : 'transparent', transition: 'all 0.18s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? '#D4AF37' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedOffer === o.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#D4AF37' }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontWeight: 600, color: '#F0F0F0', fontSize: '0.875rem' }}>{o.name}</p>
                        {o.subTitle && <p style={{ fontSize: '0.75rem', color: '#999', marginTop: 2 }}>{o.subTitle}</p>}
                        <p style={{ fontSize: '0.72rem', color: '#777777' }}>{t.qty}: {o.quantity}</p>
                        {o.shippingFree && <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D4AF37', marginTop: 2 }}>{t.freeShippingBadge}</p>}
                      </div>
                    </div>
                    <span className="price-mono" style={{ fontWeight: 800, color: '#D4AF37', fontSize: '1.1rem' }}>{o.price.toLocaleString()} { 'DZD'}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes - تم تغيير اللون للأحمر المتناسق */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '1.125rem' }}>
                <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#F0F0F0', marginBottom: '0.625rem', textTransform: 'uppercase' }}>{attr.name}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {attr.variants.map((v: any) => {
                    const isSelected = selectedVariants[attr.name] === v.value;
                    const isImgUrl = /^https?:\/\/|^\//.test(v.value);
                    const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                      Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) =>
                        vd.name.some((e: any) => e.attrName === n && e.value === val)
                      )
                    );

                    return (
                      <button
                        key={v.id}
                        onClick={() => available && handleVariantSelection(attr.name, v.value)}
                        style={
                          attr.displayMode === 'color' ? {
                            width: 32, height: 32, borderRadius: '50%', background: isImgUrl ? `url(${v.value}) center/cover` : v.value, border: '1px solid #eee', cursor: available ? 'pointer' : 'not-allowed', overflow: 'hidden', opacity: available ? 1 : 0.35,
                            outline: `2.5px solid ${isSelected ? '#D4AF37' : 'transparent'}`, outlineOffset: 3
                          } : attr.displayMode === 'image' ? {
                            width: 44, height: 44, borderRadius: 10, backgroundImage: `url(${v.value})`, backgroundSize: 'cover',
                            backgroundPosition: 'center', opacity: available ? 1 : 0.35, border: `2px solid ${isSelected ? '#D4AF37' : '#2E2E2E'}`,
                            cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.18s'
                          } : {
                            padding: '0.45rem 1.1rem', border: `1.5px solid ${isSelected ? '#D4AF37' : '#2E2E2E'}`, borderRadius: 8,
                            fontSize: '0.85rem', fontWeight: 600, background: isSelected ? 'rgba(212, 175, 55, 0.05)' : '#fff',
                            color: isSelected ? '#D4AF37' : (available ? '#555' : '#bbb'), cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.18s',
                            textDecoration: available ? 'none' : 'line-through'
                          }
                        }
                      >
                        {/* إظهار النص فقط إذا لم يكن النوع لوناً أو صورة */}
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
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #2E2E2E' }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#AAAAAA' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT FORM
═══════════════════════════════════════════════════════════ */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div>
    {label && <p style={{ fontSize: '0.775rem', fontWeight: 700, color: '#AAAAAA', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '0.75rem', color: '#D4AF37', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store }: ProductFormProps) {
  const lang = getLang(store || product?.store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return Number(fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping]);
  const total = () => fp * qty + +getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = t.errName;
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhoneInvalid;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
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
    setErrors({}); setSub(true); setSubmitError(null);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, quantity: qty, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`${window.location.origin}/successfully?productId=${product.id}`);
    } catch { setSubmitError(t.errSubmit); } finally { setSub(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1.5px solid #2E2E2E' }}>
        {product.store.cart && (
        <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
          <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.8rem 1rem', border: `1.5px solid ${isAdded ? '#22C55E' : '#2E2E2E'}`, borderRadius: 10, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', background: isAdded ? 'rgba(34,197,94,0.07)' : '#fff', color: isAdded ? '#22C55E' : '#111', transition: 'all 0.2s', fontFamily: 'inherit' }}>
            {isAdded ? <><CheckCircle2 size={14} className="anim-check" />{t.addedMsg}</> : <><ShoppingCart size={14} />{t.addToCart}</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} style={{ flex: 1, ...S.btnPrimary, width: 'auto', borderRadius: 10 }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#B8962E')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#D4AF37')}>
            {t.orderNow}
          </button>
        </div>
      )}

      {(isOrderNow || !product.store.cart) && (
        <div className="anim-slide-fade">
          {product.store.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F0F0F0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.deliveryType}</p>
              <button onClick={() => setIsOrderNow(false)} style={{ fontSize: '0.8rem', color: '#777', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t.back}</button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.customerName} label={t.fullName}>
                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} style={inp(!!errors.customerName)} />
              </FR>
              <FR error={errors.customerPhone} label={t.phone}>
                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} style={inp(!!errors.customerPhone)} />
              </FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.customerWelaya} label={t.wilaya}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#777', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.customerWelaya), paddingRight: 36, fontFamily: 'inherit' }}>
                    <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label={t.commune}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#777', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingRight: 36, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.775rem', fontWeight: 700, color: '#AAAAAA', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.delivery}</p>
              <div className="delivery-grid" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                {(['home', 'office'] as const).map(dt => (
                  <button key={dt} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: dt }))} style={{ padding: '0.875rem', border: `1.5px solid ${fd.typeLivraison === dt ? '#D4AF37' : '#2E2E2E'}`, borderRadius: 10, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === dt ? 'rgba(212,175,55,0.12)' : '#1C1C1C', transition: 'all 0.18s', fontFamily: 'inherit' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, color: fd.typeLivraison === dt ? '#D4AF37' : '#888' }}>{dt === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                    {selW && <p className="price-mono" style={{ fontSize: '1.125rem', fontWeight: 800, color: fd.typeLivraison === dt ? '#F0F0F0' : '#666' }}>{orderFreeShipping ? t.freeShippingBadge : `${(dt === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} DZD`}</p>}
                  </button>
                ))}
              </div>
            </div>

            {supportQty && (
              <div style={{ marginBottom: '0.875rem' }}>
                <p style={{ fontSize: '0.775rem', fontWeight: 700, color: '#AAAAAA', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.qty}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #2E2E2E', borderRadius: 8, overflow: 'hidden', background: '#1C1C1C' }}>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#F0F0F0' }}><Minus size={14} /></button>
                  <span style={{ width: 40, textAlign: 'center', fontWeight: 800, fontSize: '0.9rem' }}>{fd.quantity}</span>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#F0F0F0' }}><Plus size={14} /></button>
                </div>
              </div>
            )}

            {/* Summary */}
            <div style={{ background: '#1C1C1C', border: '1.5px solid #2E2E2E', borderRadius: 10, padding: '1rem 1.125rem', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.75rem', color: '#F0F0F0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.orderInfo}</p>
              {[
                { l: t.price, v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
                { l: t.delivery, v: !selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${getLiv().toLocaleString()} DZD` },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #2E2E2E' }}>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>{r.l}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F0F0F0' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.375rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#F0F0F0' }}>{t.total}</span>
                <span className="price-mono" style={{ fontSize: '1.625rem', fontWeight: 800, color: '#D4AF37' }}>{total().toLocaleString()} <span style={{ fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 700, color: '#D4AF37' }}>{ 'DZD'}</span></span>
              </div>
            </div>

            {submitError && <p style={{ color: '#D4AF37', fontSize: '0.85rem', textAlign: 'center', marginTop: 8, fontWeight: 600 }}>{submitError}</p>}
            <button type="submit" disabled={sub} style={{ ...S.btnPrimary, opacity: sub ? 0.7 : 1 }}
              onMouseEnter={e => !sub && ((e.currentTarget as HTMLButtonElement).style.background = '#B8962E')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#D4AF37')}>
              {sub ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t.sending}</> : t.confirmOrder}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CART
═══════════════════════════════════════════════════════════ */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({
    customerName: '',
    customerPhone: '',
    customerWelaya: '',
    customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(domain) || '[]'));
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [domain, store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true);
    fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
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
    if (!fd.customerName.trim()) er.name = t.errName;
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = t.errPhoneInvalid;
    if (!fd.customerWelaya) er.w = t.errWilaya;
    if (!fd.customerCommune) er.c = t.errCommune;
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({
        ...fd,
        productId: i.productId,
        storeId: i.storeId,
        userId: i.userId,
        selectedOffer: i.selectedOffer,
        variantDetailId: i.variantDetailId,
        selectedVariants: i.selectedVariants,
        platform: i.platform || 'store',
        finalPrice: i.finalPrice,
        totalPrice: finalTotal,
        priceLivraison: +getLiv(),
        quantity: i.quantity,
        customerId: i.customerId || '',
        priceLoss: selW?.livraisonReturn ?? 0
      })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { /* handle */ } finally { setSubmitting(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  if (success) return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#1C1C1C' }}>
      <div style={{ textAlign: 'center', background: '#1C1C1C', padding: '3.5rem 2rem', borderRadius: 16, border: '1.5px solid #2E2E2E', maxWidth: 460, width: '100%' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <CheckCircle2 size={32} style={{ color: '#22C55E' }} />
        </div>
        <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#F0F0F0', marginBottom: '0.625rem' }}>{t.successTitle}</h2>
        <p style={{ color: '#888', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9375rem' }}>{t.successDesc}</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D4AF37', color: '#fff', padding: '0.8rem 2rem', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem' }}>{t.backToShop}</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#1C1C1C' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed #2E2E2E', borderRadius: 16, maxWidth: 440, width: '100%', background: '#1C1C1C' }}>
        <ShoppingBag size={52} style={{ color: '#2E2E2E', display: 'block', margin: '0 auto 1.25rem' }} />
        <p style={{ color: '#555', fontSize: '1rem', marginBottom: '2rem' }}>{t.cartEmpty}</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D4AF37', color: '#fff', padding: '0.8rem 2rem', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem' }}>{t.shopNow}</Link>
      </div>
    </div>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 'clamp(1.75rem,5vw,2.75rem)', fontWeight: 800, color: '#F0F0F0', letterSpacing: '-0.03em', marginBottom: '2rem' }}>{t.myCart}</h1>
      {freeShippingMin != null && (
        <div style={{ background: freeShippingReached ? 'rgba(212,175,55,0.08)' : '#1C1C1C', border: `1.5px solid ${freeShippingReached ? '#D4AF37' : '#2E2E2E'}`, color: freeShippingReached ? '#D4AF37' : '#999', borderRadius: 10, padding: '0.75rem 1.125rem', marginBottom: '1.5rem', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
          {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', String(freeShippingRemainingAmt))}
        </div>
      )}
      <div className="cart-inner">
        {/* Products */}
        <div style={{ background: '#1C1C1C', borderRadius: 14, border: '1.5px solid #2E2E2E', overflow: 'hidden', alignSelf: 'start' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #F0F0F0' }}>
              <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} alt="" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, color: '#F0F0F0', marginBottom: '0.25rem', fontSize: '0.875rem', lineHeight: 1.4 }}>{item.product?.name}</h4>
                <p className="price-mono" style={{ fontSize: '1.125rem', fontWeight: 800, color: '#D4AF37' }}>{item.finalPrice?.toLocaleString()} {store.currency || 'DZD'}</p>
                <p style={{ fontSize: '0.72rem', color: '#777', marginTop: '0.25rem' }}>{t.qty}: {item.quantity}</p>
              </div>
              <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ color: '#555', padding: '0.375rem', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center', transition: 'color 0.18s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#D4AF37')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#ccc')}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          <div style={{ padding: '1rem', background: '#1C1C1C', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#F0F0F0', fontSize: '0.875rem' }}>{t.subtotal}</span>
            <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F0F0F0' }}>{cartTotal.toLocaleString()} {store.currency || 'DZD'}</span>
          </div>
        </div>

        {/* Checkout */}
        <div style={{ background: '#1C1C1C', borderRadius: 14, border: '1.5px solid #2E2E2E', padding: '1.625rem', alignSelf: 'start' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#F0F0F0', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.checkoutTitle}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.name} label={t.fullName}><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} style={inp(!!errors.name)} /></FR>
              <FR error={errors.phone} label={t.phone}><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} style={inp(!!errors.phone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.w} label={t.wilaya}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#777', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.w), paddingRight: 34, fontFamily: 'inherit' }}>
                    <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label={t.commune}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#777', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingRight: 34, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            {/* نوع التوصيل */}
            <div style={{ margin: '1rem 0' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>{t.deliveryType}</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(dt => (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => setFd(p => ({ ...p, typeLivraison: dt }))}
                    style={{
                      padding: '0.75rem',
                      border: `2px solid ${fd.typeLivraison === dt ? '#D4AF37' : '#2E2E2E'}`,
                      borderRadius: 10,
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: fd.typeLivraison === dt ? 'rgba(212,175,55,0.04)' : '#fff',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '1.25rem', marginBottom: 3 }}>{dt === 'home' ? '🏠' : '🏢'}</span>
                    <p style={{ fontWeight: 700, fontSize: '0.78rem', color: fd.typeLivraison === dt ? '#D4AF37' : '#888' }}>{dt === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                    {selW && <p style={{ fontWeight: 800, fontSize: '0.875rem', color: '#F0F0F0', marginTop: 2 }}>{freeShippingReached ? t.freeShippingBadge : `${(dt === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} ${store.currency || 'DZD'}`}</p>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#1C1C1C', border: '1.5px solid #2E2E2E', borderRadius: 10, padding: '1rem 1.125rem', margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #2E2E2E' }}>
                <span style={{ fontSize: '0.85rem', color: '#888' }}>{t.subtotal}</span>
                <span style={{ fontWeight: 700, color: '#F0F0F0', fontSize: '0.875rem' }}>{cartTotal.toLocaleString()} {store.currency || 'DZD'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.625rem', marginBottom: '0.625rem', borderBottom: '1px solid #2E2E2E' }}>
                <span style={{ fontSize: '0.85rem', color: '#888' }}>{t.delivery}</span>
                <span style={{ fontWeight: 700, color: '#F0F0F0', fontSize: '0.875rem' }}>{!selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${store.currency || 'DZD'}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 800, color: '#F0F0F0' }}>{t.total}</span>
                <span className="price-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D4AF37' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#D4AF37' }}>{store.currency || 'DZD'}</span></span>
              </div>
            </div>

            <button type="submit" disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}
              onMouseEnter={e => !submitting && ((e.currentTarget as HTMLButtonElement).style.background = '#B8962E')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#D4AF37')}>
              {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t.sending}</> : t.confirmOrder}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
  const currency = store?.currency || 'DZD';
  const ACCENT = '#D4AF37';
  const stepIcons = [CheckCircle2, Phone, Package, Truck];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#0D0D0D', padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', background: '#1C1C1C', padding: '3rem 2rem', borderRadius: 16, border: '1.5px solid #2E2E2E', marginBottom: '1.5rem' }}>
          <div style={{ width: 64, height: 64, background: '#141414', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle2 size={32} style={{ color: ACCENT }} />
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#F0F0F0', marginBottom: '0.625rem' }}>{t.successTitle}</h2>
          <p style={{ color: '#999999', lineHeight: 1.7, fontSize: '0.9375rem' }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: '#1C1C1C', borderRadius: 16, border: '1.5px solid #2E2E2E', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.75rem', color: '#F0F0F0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #2E2E2E', fontSize: 14, fontWeight: 700, color: '#F0F0F0' }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#999999' }}>{t.total}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: ACCENT }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: '#1C1C1C', borderRadius: 16, border: '1.5px solid #2E2E2E', overflow: 'hidden', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? CheckCircle2;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? '1px solid #2E2E2E' : 'none', background: done ? '#141414' : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? ACCENT : '#262626', color: done ? '#0D0D0D' : '#777' }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: done ? '#F0F0F0' : '#777', marginBottom: 2 }}>{step.title}</p>
                  <p style={{ fontSize: '0.76rem', color: '#999999' }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: ACCENT, color: '#0D0D0D', padding: '0.875rem 2rem', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
            <ShoppingBag size={17} /> {t.shopNow}
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', borderRadius: 10, border: '1.5px solid #2E2E2E', color: '#999999', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATIC PAGES
═══════════════════════════════════════════════════════════ */
const Shell = ({ children, title, dir }: { children: React.ReactNode; title: string; dir?: string }) => (
  <div dir={dir} style={{ minHeight: '100vh', background: '#1C1C1C' }}>
    <div style={{ background: '#111', paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, textAlign: 'center' }}>
      <div style={{ display: 'inline-block', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.375rem 1rem', borderRadius: 6, marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D4AF37', letterSpacing: '0.1em', textTransform: 'uppercase' }}>MdStore</span>
      </div>
      <h1 style={{ fontSize: 'clamp(1.75rem,5vw,3rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{title}</h1>
    </div>
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>{children}</div>
  </div>
);

const InfoBlock = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding: '1.375rem 0', borderBottom: '1px solid #2E2E2E', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
    <div style={{ width: 4, height: 20, background: '#D4AF37', borderRadius: 2, flexShrink: 0, marginTop: 4 }} />
    <div>
      <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#F0F0F0', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: '#999999' }}>{body}</p>
    </div>
  </div>
);

export function Privacy({ store }: { store?: any }) {
  const lang = getLang(store); const t = T[lang]; const pg = t.pages.privacy;
  return (
    <Shell title={pg.title} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div style={{ background: '#1C1C1C', padding: '2rem', borderRadius: 14, border: '1.5px solid #2E2E2E' }}>
        {pg.blocks.map((b, i) => <InfoBlock key={i} title={b.title} body={b.body} />)}
      </div>
    </Shell>
  );
}

export function Terms({ store }: { store?: any }) {
  const lang = getLang(store); const t = T[lang]; const pg = t.pages.terms;
  return (
    <Shell title={pg.title} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div style={{ background: '#1C1C1C', padding: '2rem', borderRadius: 14, border: '1.5px solid #2E2E2E' }}>
        {pg.blocks.map((b, i) => <InfoBlock key={i} title={b.title} body={b.body} />)}
      </div>
    </Shell>
  );
}

export function Cookies({ store }: { store?: any }) {
  const lang = getLang(store); const t = T[lang]; const pg = t.pages.cookies;
  return (
    <Shell title={pg.title} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div style={{ background: '#1C1C1C', padding: '2rem', borderRadius: 14, border: '1.5px solid #2E2E2E' }}>
        {pg.blocks.map((b, i) => <InfoBlock key={i} title={b.title} body={b.body} />)}
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setSubmitError(null);
    try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
    catch { setSubmitError(t.errSubmit); } finally { setLoading(false); }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: '#1C1C1C', minHeight: '100vh' }}>
      <div style={{ background: '#111', paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.625rem' }}>{t.contactSect}</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem' }}>{t.contactTagline}</p>
      </div>
      <div className="contact-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        {/* Info */}
        <div>
          <div style={{ background: '#1C1C1C', borderRadius: 14, border: '1.5px solid #2E2E2E', padding: '1.75rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>{t.contactInfoTitle}</p>
            {[
              { icon: <Phone size={16} />, label: t.contactPhone, val: store?.contact?.phone || t.contactNA },
              { icon: <MapPin size={16} />, label: t.contactLocation, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || t.contactDefaultLocation },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.125rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: '#777', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{r.label}</p>
                  <p style={{ fontWeight: 700, color: '#F0F0F0', fontSize: '0.875rem' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#111', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 8px #22C55E' }} />
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fff' }}>{t.replyTime}</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: '#1C1C1C', borderRadius: 14, border: '1.5px solid #2E2E2E', padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{ width: 72, height: 72, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle2 size={36} style={{ color: '#22C55E' }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F0F0F0', marginBottom: '0.5rem' }}>{t.successTitle}</h2>
              <p style={{ color: '#888', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9375rem' }}>{t.successDesc}</p>
              <button onClick={() => setSent(false)} style={{ padding: '0.75rem 1.75rem', borderRadius: 10, border: '1.5px solid #D4AF37', background: 'transparent', color: '#D4AF37', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}>{t.sendAnother}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#AAAAAA', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.fullName}</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder={t.fullNamePh} style={S.input} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#AAAAAA', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.phone}</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder={t.phonePh} style={S.input} />
                </div>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#AAAAAA', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.email}</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" style={S.input} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#AAAAAA', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.message}</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} placeholder={t.messagePh} style={{ ...S.input, resize: 'none' }} />
              </div>
              {submitError && <p style={{ color: '#D4AF37', fontSize: '0.85rem', textAlign: 'center', marginTop: 8, fontWeight: 600 }}>{submitError}</p>}
              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = '#B8962E')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#D4AF37')}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t.sending}</> : <>{t.sendMsg} {isRTL ? <ArrowLeft size={16} /> : <ChevronRight size={16} />}</>}
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