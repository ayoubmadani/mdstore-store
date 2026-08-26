'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Share2, Phone, User, ToggleRight,
  Shield, ArrowLeft, Plus, Minus, CheckCircle2, Lock,
  Menu, Sparkles, Package, Truck, RefreshCw, Search,
  ShoppingCart, ShoppingBag, Trash2, Loader2, MapPin,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   BEAUTY & WELLNESS THEME
   Palette: Plum #6B2D8B · Rose #E8628A · Gold #E8B84B
   Fonts: Playfair Display (serif) + DM Sans (body)
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --plum:    #6B2D8B;
    --plum-2:  #7D3EA0;
    --plum-lt: #9B5BB8;
    --rose:    #E8628A;
    --rose-lt: #F07A9E;
    --gold:    #E8B84B;
    --white:   #FFFFFF;
    --off:     #FAFAFA;
    --soft:    #F7F2FB;
    --cream:   #FDF8F0;
    --ink:     #1A1228;
    --mid:     #5A4A6A;
    --dim:     #9A8AAA;
    --line:    rgba(107,45,139,0.1);
    --line-dk: rgba(107,45,139,0.2);
  }

  body { background: var(--white); color: var(--ink); font-family: 'DM Sans', sans-serif; }
  a    { text-decoration: none; color: inherit; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--plum-lt); border-radius: 2px; }

  .serif { font-family: 'Playfair Display', Georgia, serif; }

  /* ── Animations ── */
  @keyframes fade-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .fu   { animation: fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay: 0.08s; }
  .fu-2 { animation-delay: 0.18s; }
  .fu-3 { animation-delay: 0.3s; }

  @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin    { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in{ from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  .anim-check { animation: check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* ── Product card ── */
  .p-card { background:var(--white); border:1px solid var(--line); transition:transform 0.28s,box-shadow 0.28s; cursor:pointer; }
  .p-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(107,45,139,0.1); }
  .p-card:hover .c-img img { transform:scale(1.04); }
  .c-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.4s cubic-bezier(0.22,1,0.36,1); }

  /* ── Thumb grid ── */
  .thumb-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
  .thumb-btn { overflow:hidden; cursor:pointer; padding:0; background:none; border:2px solid transparent; transition:border-color 0.2s; }
  .thumb-btn.active { border-color:var(--plum); }
  .thumb-btn img { display:block; width:100%; aspect-ratio:1/1; object-fit:cover; }

  /* ── Buttons ── */
  .btn-plum {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--plum); color:var(--white);
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
    padding:12px 26px; border:none; cursor:pointer; text-decoration:none;
    border-radius:4px; transition:background 0.2s,transform 0.2s;
  }
  .btn-plum:hover { background:var(--plum-2); transform:translateY(-1px); }
  .btn-plum:disabled { opacity:0.7; cursor:not-allowed; transform:none; }

  .btn-outline {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:transparent; color:var(--plum); border:1.5px solid var(--plum);
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
    padding:11px 24px; cursor:pointer; text-decoration:none;
    border-radius:4px; transition:all 0.2s;
  }
  .btn-outline:hover { background:var(--plum); color:var(--white); }

  /* ── Inputs ── */
  .inp {
    width:100%; padding:11px 13px;
    background:var(--white); border:1.5px solid var(--line-dk);
    font-family:'DM Sans',sans-serif; font-size:13px; color:var(--ink);
    outline:none; border-radius:4px; transition:border-color 0.2s,box-shadow 0.2s;
  }
  .inp:focus { border-color:var(--plum); box-shadow:0 0 0 3px rgba(107,45,139,0.1); }
  .inp::placeholder { color:var(--dim); }
  .inp-err { border-color:var(--rose) !important; }
  select.inp { appearance:none; cursor:pointer; }

  /* ── Category pill ── */
  .cat-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 18px; border:1.5px solid var(--line-dk);
    border-radius:24px; font-size:13px; font-weight:500;
    color:var(--mid); background:var(--white); cursor:pointer;
    text-decoration:none; transition:all 0.2s; white-space:nowrap;
    font-family:'DM Sans',sans-serif;
  }
  .cat-pill:hover, .cat-pill.active { border-color:var(--plum); color:var(--plum); background:var(--soft); }

  /* ── Cart badge ── */
  .cart-badge {
    position:absolute; top:-5px; right:-5px;
    min-width:17px; height:17px; border-radius:9px;
    background:var(--rose); color:#fff;
    font-size:9px; font-weight:700; padding:0 4px;
    display:flex; align-items:center; justify-content:center;
    border:2px solid var(--white);
  }

  /* ── Responsive Layout ── */
  .nav-top   { display:flex; align-items:center; justify-content:space-between; }
  .nav-links { display:flex; align-items:center; gap:0; }
  .nav-mob   { display:none; }

  .prod-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  .trust-bar { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g  { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; }
  .details-g { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
  .contact-g { display:grid; grid-template-columns:1fr 1fr; gap:56px; }
  .form-2c   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c    { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cart-g    { display:grid; grid-template-columns:1.2fr 1fr; gap:40px; align-items:start; }

  @media (max-width:1100px) {
    .prod-grid { grid-template-columns:repeat(3,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:32px; }
  }
  @media (max-width:768px) {
    .nav-links { display:none; }
    .nav-mob   { display:flex; }
    .prod-grid { grid-template-columns:1fr; gap:12px; }
    .trust-bar { grid-template-columns:repeat(2,1fr); }
    .footer-g  { grid-template-columns:1fr; gap:28px; }
    .details-g { grid-template-columns:1fr; }
    .contact-g { grid-template-columns:1fr; gap:28px; }
    .cart-g    { grid-template-columns:1fr; }
  }
  @media (max-width:480px) {
    .prod-grid { grid-template-columns:1fr; gap:8px; }
    .form-2c   { grid-template-columns:1fr; }
    .dlv-2c    { grid-template-columns:1fr; }
  }
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
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; currency?: string; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number; store?: any;
}

const variantMatches = (d: VariantDetail, sel: Record<string, string>): boolean =>
  Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

/* ── Shared input style ── */
const INP_ST = (err?: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 13px',
  background: 'var(--white)', border: `1.5px solid ${err ? 'var(--rose)' : 'var(--line-dk)'}`,
  fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'var(--ink)',
  outline: 'none', borderRadius: '4px', transition: 'border-color 0.2s', appearance: 'none'
});

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */

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
  // Extra
  trust: [
    { t: 'توصيل سريع', s: '48 ساعة لباب منزلك' },
    { t: 'إرجاع مجاني', s: '30 يوم إرجاع' },
    { t: 'منتجات أصيلة', s: '100% جودة مضمونة' },
    { t: 'دعم متواصل', s: 'نحن هنا لمساعدتك' },
  ],
  searchResultsTitle: 'نتائج البحث',
  newArrivals: 'وصل جديد',
  productSuffix: 'منتج',
  shopCta: 'استعرض المجموعة',
  delivDataTitle: 'بيانات التوصيل',
  orderSummary: 'ملخص الطلب',
  securePayment: 'دفع آمن ومشفر',
  productLabel: 'المنتج',
  offerQtyPrefix: 'الكمية:',
  deleteItem: 'حذف',
  available: 'متاحون للرد الآن',
  contactMethods: 'طرق التواصل',
  sendMsg: 'أرسل رسالة',
  contactSentTitle: 'تم إرسال رسالتك!',
  contactSentDesc: 'سنرد عليك خلال 24 ساعة 💄',
  nameLabel: 'الاسم',
  phoneLbl: 'الهاتف',
  emailLabel: 'البريد الإلكتروني',
  emailPh: 'بريدك@الإلكتروني',
  msgLabel: 'رسالتك',
  msgPh: 'كيف يمكننا مساعدتك؟',
  sendBtn: 'إرسال الرسالة',
  mailLbl: 'البريد',
  locLbl: 'الموقع',
  helpTitle: 'نسعد بمساعدتك',
  replyTime: 'نرد خلال 24 ساعة 💄',
  contactSub: 'تواصل',
  cartLinks: 'سلة التسوق',
  contactLink: 'تواصل معنا',
  privacyLink: 'سياسة الخصوصية',
  termsLink: 'شروط الخدمة',
  cookiesLink: 'الكوكيز',
  privacyTitle: 'سياسة الخصوصية', privacySub: 'قانوني',
  priv1Title: 'البيانات التي نجمعها', priv1Body: 'فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك.',
  priv2Title: 'كيف نستخدمها', priv2Body: 'حصرياً لتنفيذ وتوصيل مشترياتك. لا استخدام تجاري.',
  priv3Title: 'الأمان', priv3Body: 'بياناتك محمية بتشفير قياسي وبنية تحتية آمنة.',
  priv4Title: 'مشاركة البيانات', priv4Body: 'لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين.',
  termsTitle: 'شروط الخدمة', termsSub: 'قانوني',
  terms1Title: 'حسابك', terms1Body: 'أنت مسؤول عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك.',
  terms2Title: 'المدفوعات', terms2Body: 'لا رسوم مخفية. السعر المعروض هو السعر النهائي.',
  terms3Title: 'الاستخدام المحظور', terms3Body: 'المنتجات الأصيلة فقط. لا مجال للمنتجات المقلدة.', terms3Tag: 'صارم',
  terms4Title: 'القانون الحاكم', terms4Body: 'تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية.',
  cookiesTitle: 'ملفات الارتباط', cookiesSub: 'قانوني',
  cookies1Title: 'الكوكيز الأساسية', cookies1Body: 'ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها.', cookies1Tag: 'مطلوب',
  cookies2Title: 'كوكيز التفضيلات', cookies2Body: 'تحفظ إعداداتك لتجربة أفضل.', cookies2Tag: 'اختياري',
  cookies3Title: 'كوكيز التحليلات', cookies3Body: 'بيانات مجمعة لتحسين المنصة.', cookies3Tag: 'اختياري',
  cookiesNotice: 'يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح.',
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
  freeShippingBadge: '🚚 Livraison gratuite',
  freeShippingThreshold: '🚚 Livraison gratuite dès {{amount}} DZD d\'achat',
  freeShippingRemaining: 'Ajoutez {{amount}} DZD de plus pour la livraison gratuite',
  freeShippingReached: '🎉 Livraison gratuite obtenue !',
  // Footer
  quickLinks: 'Navigation', legalNav: 'Légal',
  contactSect: 'Contact',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  rightsReserved: 'Tous droits réservés.',
  // Extra
  trust: [
    { t: 'Livraison Rapide', s: 'En 48h à domicile' },
    { t: 'Retours Gratuits', s: '30 jours pour retourner' },
    { t: 'Produits Authentiques', s: 'Qualité 100% garantie' },
    { t: 'Support Continu', s: 'Nous sommes là pour vous' },
  ],
  searchResultsTitle: 'Résultats',
  newArrivals: 'Nouveautés',
  productSuffix: 'article(s)',
  shopCta: 'Explorer la collection',
  delivDataTitle: 'Informations de livraison',
  orderSummary: 'Récapitulatif',
  securePayment: 'Paiement sécurisé et crypté',
  productLabel: 'Produit',
  offerQtyPrefix: 'Quantité :',
  deleteItem: 'Supprimer',
  available: 'Disponibles maintenant',
  contactMethods: 'Nous contacter',
  sendMsg: 'Envoyer un message',
  contactSentTitle: 'Message envoyé !',
  contactSentDesc: 'Nous vous répondrons dans les 24h 💄',
  nameLabel: 'Nom',
  phoneLbl: 'Téléphone',
  emailLabel: 'Email',
  emailPh: 'votre@email.com',
  msgLabel: 'Message',
  msgPh: 'Comment pouvons-nous vous aider ?',
  sendBtn: 'Envoyer le message',
  mailLbl: 'Email',
  locLbl: 'Adresse',
  helpTitle: 'Nous serons ravis de vous aider',
  replyTime: 'Réponse sous 24h 💄',
  contactSub: 'Contact',
  cartLinks: 'Panier',
  contactLink: 'Nous contacter',
  privacyLink: 'Politique de confidentialité',
  termsLink: 'Conditions générales',
  cookiesLink: 'Cookies',
  privacyTitle: 'Politique de confidentialité', privacySub: 'Légal',
  priv1Title: 'Données collectées', priv1Body: 'Uniquement votre nom, numéro de téléphone et adresse de livraison — le strict nécessaire.',
  priv2Title: 'Utilisation des données', priv2Body: "Exclusivement pour l'exécution et la livraison de vos achats. Pas d'usage commercial.",
  priv3Title: 'Sécurité', priv3Body: 'Vos données sont protégées par un chiffrement standard et une infrastructure sécurisée.',
  priv4Title: 'Partage des données', priv4Body: 'Nous ne vendons jamais vos données. Elles sont partagées uniquement avec nos partenaires de livraison de confiance.',
  termsTitle: 'Conditions générales', termsSub: 'Légal',
  terms1Title: 'Votre compte', terms1Body: 'Vous êtes responsable de la sécurité de vos identifiants et de toute activité sur votre compte.',
  terms2Title: 'Paiements', terms2Body: 'Aucuns frais cachés. Le prix affiché est le prix final.',
  terms3Title: 'Utilisations interdites', terms3Body: 'Produits authentiques uniquement. Les contrefaçons sont strictement prohibées.', terms3Tag: 'Strict',
  terms4Title: 'Loi applicable', terms4Body: 'Ces conditions sont régies par les lois de la République Algérienne Démocratique et Populaire.',
  cookiesTitle: 'Politique des cookies', cookiesSub: 'Légal',
  cookies1Title: 'Cookies essentiels', cookies1Body: 'Indispensables pour les sessions, le panier et le paiement. Ne peuvent pas être désactivés.', cookies1Tag: 'Requis',
  cookies2Title: 'Cookies de préférences', cookies2Body: 'Sauvegardent vos paramètres pour une meilleure expérience.', cookies2Tag: 'Optionnel',
  cookies3Title: 'Cookies analytiques', cookies3Body: 'Données agrégées pour améliorer la plateforme.', cookies3Tag: 'Optionnel',
  cookiesNotice: 'Vous pouvez gérer vos préférences de cookies depuis les paramètres de votre navigateur.',
};

const jsonEn = {
  dir: 'ltr',
  home: 'Home', contact: 'Contact', cart: 'Cart',
  search: 'Search products...', searching: 'Searching...', noResults: 'No results found', showAll: 'View all results →',
  all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Shop Now', searchResultsFor: 'Results for:',
  fullName: 'Full Name', fullNamePh: 'Enter your name', errName: 'Name is required',
  phone: 'Phone Number', phonePh: '0555 12 34 56', errPhone: 'Phone number is required', errPhoneInvalid: 'Invalid phone number',
  wilaya: 'Wilaya', errWilaya: 'Please select a wilaya', wilayaPh: 'Select wilaya', wilayaNA: 'Delivery not available yet',
  commune: 'Commune', errCommune: 'Please select a commune', communePh: 'Select commune', communeLoading: 'Loading...',
  deliveryType: 'Delivery Type', deliveryHome: 'Home Delivery', deliveryOffice: 'Pickup Point',
  qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total', subtotal: 'Subtotal', orderInfo: 'Order Information',
  addToCart: 'Add to Cart', orderNow: 'Order Now', confirmOrder: 'Confirm Order', sending: 'Sending...', back: 'Cancel',
  addedMsg: 'Added to cart ✓', errSubmit: 'An error occurred, please try again.',
  myCart: 'My Cart', cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Discover our collection.',
  successTitle: 'Order Confirmed!', successDesc: 'Thank you! Our team will contact you shortly.',
  backToShop: 'Back to Shop', checkoutTitle: 'Checkout',
  successSteps: [
    { title: 'Order received', desc: 'Your order has been registered successfully' },
    { title: 'Confirmation', desc: "We'll call you within 24 hours" },
    { title: 'Packaging', desc: 'Your order is being prepared with care' },
    { title: 'Shipping', desc: '2-5 business days' },
  ],
  offersTitle: 'Available Offers', descTitle: 'Description',
  freeShippingBadge: '🚚 Free Delivery',
  freeShippingThreshold: '🚚 Free Delivery on orders over {{amount}} DZD',
  freeShippingRemaining: 'Add {{amount}} DZD more for free delivery',
  freeShippingReached: '🎉 You got free delivery!',
  quickLinks: 'Quick Links', legalNav: 'Legal', contactSect: 'Contact', privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies', rightsReserved: 'All rights reserved.',
  trust: [
    { t: 'Fast Delivery', s: '48h to your door' },
    { t: 'Free Returns', s: '30-day returns' },
    { t: 'Authentic Products', s: '100% quality guaranteed' },
    { t: 'Ongoing Support', s: 'We are here for you' },
  ],
  searchResultsTitle: 'Search Results',
  newArrivals: 'New Arrivals', productSuffix: 'item(s)', shopCta: 'Explore the Collection',
  delivDataTitle: 'Delivery Information', orderSummary: 'Order Summary', securePayment: 'Secure & encrypted payment',
  productLabel: 'Product', offerQtyPrefix: 'Qty:', deleteItem: 'Remove',
  available: 'Available now', contactMethods: 'Contact Methods', sendMsg: 'Send a Message',
  contactSentTitle: 'Message Sent!', contactSentDesc: 'We will reply within 24 hours 💄',
  nameLabel: 'Name', phoneLbl: 'Phone', emailLabel: 'Email', emailPh: 'your@email.com',
  msgLabel: 'Message', msgPh: 'How can we help you?', sendBtn: 'Send Message',
  mailLbl: 'Email', locLbl: 'Location',
  helpTitle: 'We are happy to help', replyTime: 'We reply within 24 hours 💄', contactSub: 'Get in Touch',
  cartLinks: 'Cart', contactLink: 'Contact Us', privacyLink: 'Privacy Policy', termsLink: 'Terms of Service', cookiesLink: 'Cookie Policy',
  privacyTitle: 'Privacy Policy', privacySub: 'Legal',
  priv1Title: 'Data We Collect', priv1Body: 'Only your name, phone number, and delivery address — the minimum needed to process your order.',
  priv2Title: 'How We Use It', priv2Body: 'Exclusively to fulfill and deliver your purchases. No commercial use.',
  priv3Title: 'Security', priv3Body: 'Your data is protected with standard encryption and secure infrastructure.',
  priv4Title: 'Data Sharing', priv4Body: 'We never sell your data. It is only shared with trusted delivery partners.',
  termsTitle: 'Terms of Service', termsSub: 'Legal',
  terms1Title: 'Your Account', terms1Body: 'You are responsible for the security of your login credentials and all activity under your account.',
  terms2Title: 'Payments', terms2Body: 'No hidden fees. The displayed price is the final price.',
  terms3Title: 'Prohibited Use', terms3Body: 'Authentic products only. Counterfeit goods are strictly prohibited.', terms3Tag: 'Strict',
  terms4Title: 'Governing Law', terms4Body: "These terms are governed by the laws of the People's Democratic Republic of Algeria.",
  cookiesTitle: 'Cookie Policy', cookiesSub: 'Legal',
  cookies1Title: 'Essential Cookies', cookies1Body: 'Required for sessions, cart, and checkout. Cannot be disabled.', cookies1Tag: 'Required',
  cookies2Title: 'Preference Cookies', cookies2Body: 'Save your settings for a better experience.', cookies2Tag: 'Optional',
  cookies3Title: 'Analytics Cookies', cookies3Body: 'Aggregated data to improve the platform.', cookies3Tag: 'Optional',
  cookiesNotice: 'You can manage your cookie preferences from your browser settings.',
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
  if (!store) return null;
  return (
    <div dir={t.dir} style={{ minHeight: '100vh', backgroundColor: 'var(--white)' }}>
      <style>{CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR 
══════════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);

  /* ═══════ 1. تعريف الستايلات داخل المكون (مثل Navbar 2) ═══════ */
  const cartBtnStyle: React.CSSProperties = {
    position: 'relative',
    background: 'var(--white)',
    color: 'var(--plum)',
    width: 38,
    height: 38,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    cursor: 'pointer',
    border: '1.5px solid var(--line-dk)',
    textDecoration: 'none'
  };

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: -5,
    insetInlineEnd: -5,
    fontSize: 10,
    fontWeight: 700,
    width: 17,
    height: 17,
    background: 'var(--plum)',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--white)'
  };

  /* ═══════ 2. useEffects ═══════ */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { initCount(JSON.parse(localStorage.getItem(domain) || '[]').length); }
      catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } });
        setListSearch(data.products || []);
      }
      catch { /* ignore */ }
      finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(timer);
  }, [searchQuery, domain]);

  /* ═══════ 3. دوال البحث ═══════ */
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  /* ═══════ 4. مكون نتائج البحث (DropResults) ═══════ */
  const DropResults = () => (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        left: 0,
        background: '#FFFFFF',
        border: '1px solid #EEEEEE',
        borderRadius: '12px',
        boxShadow: '0 15px 45px rgba(0,0,0,0.1)',
        zIndex: 210,
        overflow: 'hidden',
      }}
      className="anim-slide-down"
    >
      {/* رأس القائمة */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #F0F0F0',
        background: '#FAFAFA'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t.searchResultsTitle}
        </span>
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          style={{
            background: '#F0F0F0',
            border: 'none',
            color: '#555',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--plum)', fontWeight: 700, fontSize: '13px' }}>
            {t.searching}
          </div>
        ) : listSearch.length > 0 ? (
          <div>
            {listSearch.map((p: any) => (
              <Link
                href={`/product/${p.id}`}
                key={p.id}
                onClick={() => setSearchQuery('')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderBottom: '1px solid #F5F5F5',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9F9F9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                <img
                  src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                  style={{ width: 44, height: 44, borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid #EEE' }}
                  alt={p.name}
                />
                <div style={{ flex: 1 }}>
                  <div className="line-clamp-1" style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--plum)', fontWeight: 800 }}>
                    {p.price} {store?.currency || 'DZD'}
                  </div>
                </div>
                <ArrowLeft size={14} style={{ color: '#CCC' }} />
              </Link>
            ))}
            {/* زر عرض الكل */}
            <button
              onClick={() => handleSearch()}
              style={{
                width: '100%',
                padding: '15px',
                background: 'var(--plum)',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {t.showAll}
            </button>
          </div>
        ) : searchQuery.length >= 2 && (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
            {t.noResults} "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/contact', label: t.contact },
  ];

  /* ═══════ 5. JSX Return ═══════ */
  return (
    <>
      {/* Ticker */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="ticker-wrap" style={{ backgroundColor: 'var(--plum)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '7px 0' }}>
          <div className="ticker-track" style={{ display: 'inline-block', animation: 'ticker 24s linear infinite' }}>
            {Array(12).fill(null).map((_, i) => (
              <span key={i} style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.88)', margin: '0 40px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '11px', height: '11px' }} /> {store.topBar.text}
              </span>
            ))}
            {Array(12).fill(null).map((_, i) => (
              <span key={`b${i}`} style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.88)', margin: '0 40px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '11px', height: '11px' }} /> {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main nav bar */}
      <nav
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          fontFamily: "'DM Sans',sans-serif",
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(255,255,255,0.96)' : 'var(--white)',
          borderBottom: `2px solid ${scrolled ? 'var(--line)' : 'transparent'}`,
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 2px 12px rgba(107,45,139,0.08)' : 'none',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, textDecoration: 'none' }}>
            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
              <img
                src={store.design.logoUrl}
                style={{ height: 40, objectFit: 'contain', display: 'block' }}
                alt={store?.name || 'Store Logo'}
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  color: 'var(--plum)',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                }}>
                  {store?.name || 'Store'}
                </span>
              </div>
            )}
          </Link>

          {/* Nav links + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

            {/* Desktop nav links — hidden on mobile via .nav-links CSS */}
            <div className="nav-links">
              {navLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--mid)',
                    textDecoration: 'none',
                    padding: '0 14px',
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--plum)'; el.style.borderBottomColor = 'var(--plum)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--mid)'; el.style.borderBottomColor = 'transparent'; }}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Search icon */}
            <button
              onClick={() => { setShowSearch(p => !p); setOpen(false); }}
              style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid var(--line-dk)', background: showSearch ? 'var(--soft)' : 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--plum)', transition: 'background 0.2s' }}
            >
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </button>

            {/* Cart */}
            {store?.cart !== false && (
              <Link href="/cart" style={cartBtnStyle}>
                <ShoppingBag size={17} />
                {count > 0 && <span style={badgeStyle}>{count}</span>}
              </Link>
            )}

            {/* Hamburger — hidden on desktop via .nav-mob CSS */}
            <button
              className="nav-mob"
              onClick={() => { setOpen(p => !p); setShowSearch(false); }}
              style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid var(--line-dk)', background: 'var(--white)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Search panel — slides down on click, shared desktop/mobile */}
        {showSearch && (
          <div style={{ borderTop: '1px solid var(--line)', background: 'var(--white)', padding: '16px 24px', position: 'relative' }} className="anim-slide-down">
            <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
              <form onSubmit={handleSearch}>
                <input
                  autoFocus
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isRTL ? '0.75rem 2.75rem 0.75rem 1rem' : '0.75rem 1rem 0.75rem 2.75rem',
                    border: '1.5px solid var(--plum)',
                    borderRadius: 10,
                    background: 'var(--soft)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: "'DM Sans',sans-serif",
                    boxSizing: 'border-box',
                  }}
                />
                <Search size={15} style={{ position: 'absolute', ...(isRTL ? { right: 12 } : { left: 12 }), top: '50%', transform: 'translateY(-50%)', color: 'var(--plum)' }} />
              </form>
              {searchQuery.length >= 2 && <DropResults />}
            </div>
          </div>
        )}

        {/* Mobile Nav Links */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: open ? 250 : 0,
            transition: 'max-height 0.28s ease',
            background: 'var(--white)',
            borderTop: open ? '1px solid var(--line)' : 'none'
          }}
        >
          <div style={{ padding: '0.375rem 1.25rem 0.875rem' }}>
            {navLinks.map(i => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => { setOpen(false); setShowSearch(false); }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--line)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--mid)',
                  textDecoration: 'none'
                }}
              >
                {i.label} <ArrowLeft size={14} style={{ color: 'var(--plum)' }} />
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
/* ══════════════════════════════════════════════════════════════
   FOOTER — 3 أقسام: العلامة · الروابط · التواصل
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const yr = new Date().getFullYear();
  if (!store) return null;
  return (
    <footer dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: 'var(--ink)', fontFamily: "'DM Sans',sans-serif", marginTop: '0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px 36px' }}>
        <div className="footer-g" style={{ paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          <div>
            <Link href="/" style={{ display: 'inline-flex', flexDirection: 'column', marginBottom: '14px' }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
                : <span className="serif" style={{ fontSize: '1.4rem', fontWeight: 700, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)' }}>{store.name}</span>
              }
            </Link>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: '12px' }}>Beauty & Wellness</p>
            <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'rgba(255,255,255,0.4)', maxWidth: '260px', fontWeight: 300 }}>
              {store.hero?.subtitle?.substring(0, 80)}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '2rem' }}>© {yr} {store.name}. {t.rightsReserved}</p>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--plum-lt)', marginBottom: '18px' }}>{t.quickLinks}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/', label: t.home },
                { href: '/cart', label: t.cartLinks },
                { href: '/contact', label: t.contactLink },
              ].map(l => (
                <a key={l.href} href={l.href} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--plum-lt)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--plum-lt)', marginBottom: '18px' }}>{t.legalNav}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/privacy', label: t.privacyLink },
                { href: '/terms', label: t.termsLink },
                { href: '/cookies', label: t.cookiesLink },
              ].map(l => (
                <a key={l.href} href={l.href} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--plum-lt)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--plum-lt)', marginBottom: '18px' }}>{t.contactSect}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                store?.contact?.phone && { icon: <Phone size={13} />, val: store.contact.phone },
                (store?.contact?.wilaya || store?.contact?.address) && { icon: <MapPin size={13} />, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
                store?.contact?.email && { icon: <span style={{ fontSize: '13px' }}>✉️</span>, val: store.contact.email },
              ].filter(Boolean).map((item: any, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--plum-lt)', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{item.val}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--rose)', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{t.available}</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   CARD
══════════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  if (!product || !store) return null;
  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number) || 0;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;

  return (
    <div className="p-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Image */}
      <div className="c-img" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--soft)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--soft),var(--cream))' }}>
            <Sparkles style={{ width: '36px', height: '36px', color: 'var(--plum-lt)', opacity: 0.4 }} />
          </div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--plum)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px' }}>
            -{discount}%
          </div>
        )}
        {product.shippingFree && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'var(--ink)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>
            🚚
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
          {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '12px', height: '12px', fill: i < 4 ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />)}
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3em' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--plum)' }}>{price.toLocaleString()}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dim)' }}>{store?.currency || 'DZD'}</span>
          </div>
          {orig > price && <span style={{ fontSize: '12px', color: 'var(--dim)', textDecoration: 'line-through', opacity: 0.6 }}>{orig.toLocaleString()}</span>}
        </div>
        <Link href={`/product/${product.slug || product.id}`} className="btn-plum"
          style={{ textDecoration: 'none', width: '100%', fontSize: '13px', fontWeight: 600, padding: '12px', borderRadius: '6px', textAlign: 'center', display: 'block' }}>
          {viewDetails}
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  if (!store) return null;
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = useMemo(() => activeFilter ? products.filter((p: any) => p.categoryId === activeFilter) : products, [products, activeFilter]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
        {store.hero?.imageUrl ? (
          <div style={{ position: 'relative', minHeight: '320px' }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: '400px' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(107,45,139,0.65), rgba(26,18,40,0.4))', display: 'flex', alignItems: 'center', padding: '0 8vw' }}>
              <div>
                <h1 className="fu serif" style={{ fontSize: 'clamp(1.6rem,4vw,3rem)', fontWeight: 700, fontStyle: 'italic', color: '#fff', lineHeight: 1.15, marginBottom: '10px' }}>
                  {store.hero.title?.replace(/<[^>]+>/g, '') || store.name}
                </h1>
                <p className="fu fu-1" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.82)', marginBottom: '20px', maxWidth: '380px', lineHeight: '1.7' }}>
                  {store.hero.subtitle}
                </p>
                <a href="#products" className="btn-plum fu fu-2" style={{ fontSize: '14px', padding: '12px 28px' }}>
                  {t.shopCta}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8vw', padding: '4vw 8vw', background: 'linear-gradient(135deg,var(--soft) 0%,var(--cream) 50%,#FFF0F5 100%)', minHeight: '280px' }}>
            <div style={{ flex: '0 0 auto' }}>
              {store.design?.logoUrl && <img src={store.design.logoUrl} alt={store.name} style={{ height: '48px', marginBottom: '16px', display: 'block' }} />}
              <h1 className="fu serif" style={{ fontSize: 'clamp(1.6rem,4vw,3rem)', fontWeight: 700, fontStyle: 'italic', color: 'var(--plum)', lineHeight: 1.1, marginBottom: '10px' }}>
                {store.hero?.title?.replace(/<[^>]+>/g, '') || store.name}
              </h1>
              <p className="fu fu-1" style={{ fontSize: '14px', color: 'var(--mid)', marginBottom: '20px', maxWidth: '340px', lineHeight: '1.7' }}>
                {store.hero?.subtitle}
              </p>
              <a href="#products" className="btn-plum fu fu-2" style={{ fontSize: '14px', padding: '12px 28px' }}>
                {t.shopCta}
              </a>
            </div>
            {products[0] && (products[0].productImage || products[0].imagesProduct?.[0]?.imageUrl) && (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '240px' }}>
                <img src={products[0].productImage || products[0].imagesProduct?.[0]?.imageUrl} alt="" style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (
        <section style={{ padding: '24px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--off)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setActiveFilter(null)} className={`cat-pill${!activeFilter ? ' active' : ''}`}>
              {t.all} ({products.length})
            </button>
            {cats.map((cat: any) => (
              <button key={cat.id} onClick={() => setActiveFilter(cat.id)} className={`cat-pill${activeFilter === cat.id ? ' active' : ''}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding: '32px 0 64px', backgroundColor: 'var(--white)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
              {activeFilter ? cats.find((c: any) => c.id === activeFilter)?.name : t.newArrivals}
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--dim)' }}>{filtered.length} {t.productSuffix}</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '64px 0', textAlign: 'center' }}>
              <Sparkles style={{ width: '40px', height: '40px', color: 'var(--dim)', opacity: 0.4, margin: '0 auto 12px' }} />
              <p style={{ fontSize: '1rem', color: 'var(--dim)' }}>{t.noProducts}</p>
            </div>
          ) : (
            <div className="prod-grid">
              {filtered.map((p: any) => {
                const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails={t.shopNow} />;
              })}
            </div>
          )}

          {/* Pagination */}
          {countPage > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '40px', flexWrap: 'wrap' }}>
              <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
                style={{ width: 36, height: 36, borderRadius: '4px', border: '1px solid var(--line-dk)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', color: 'var(--plum)', opacity: page <= 1 ? 0.3 : 1 }}>❮</Link>
              {Array.from({ length: countPage }).map((_, i) => {
                const pn = i + 1; const isA = Number(page) === pn;
                return (
                  <Link key={pn} href={{ query: { page: pn } }} scroll={false}
                    style={{ width: 36, height: 36, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, border: `1px solid ${isA ? 'var(--plum)' : 'var(--line-dk)'}`, background: isA ? 'var(--plum)' : 'var(--white)', color: isA ? '#fff' : 'var(--mid)' }}>
                    {pn}
                  </Link>
                );
              })}
              <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
                style={{ width: 36, height: 36, borderRadius: '4px', border: '1px solid var(--line-dk)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', color: 'var(--plum)', opacity: page >= countPage ? 0.3 : 1 }}>❯</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ backgroundColor: 'var(--soft)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="trust-bar">
            {[
              { icon: <Truck style={{ width: '20px', height: '20px' }} /> },
              { icon: <RefreshCw style={{ width: '20px', height: '20px' }} /> },
              { icon: <Shield style={{ width: '20px', height: '20px' }} /> },
              { icon: <Phone style={{ width: '20px', height: '20px' }} /> },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', borderInlineStart: i > 0 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ color: 'var(--plum)', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{t.trust[i].t}</p>
                  <p style={{ fontSize: '11px', color: 'var(--dim)', margin: 0 }}>{t.trust[i].s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETAILS
══════════════════════════════════════════════════════════════ */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const [sel, setSel] = useState(0);
  if (!product) return null;
  const lang = getLang(store || product?.store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: 'var(--white)' }}>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="details-g">
          {/* Gallery */}
          <div>
            <div style={{ position: 'relative', marginBottom: '10px', border: '1px solid var(--line)', overflow: 'hidden', backgroundColor: 'var(--soft)' }}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                {allImages.length > 0
                  ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles style={{ width: '56px', height: '56px', color: 'var(--plum-lt)', opacity: 0.3 }} />
                  </div>
                }
              </div>
              {discount > 0 && <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'var(--rose)', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '3px' }}>-{discount}%</div>}
              
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', border: '1px solid var(--line)', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--ink)' }} />
                  </button>
                  <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', border: '1px solid var(--line)', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <ChevronLeft style={{ width: '14px', height: '14px', color: 'var(--ink)' }} />
                  </button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="thumb-grid">
                {allImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSel(idx)} className={`thumb-btn${sel === idx ? ' active' : ''}`}>
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ paddingTop: '8px' }}>
            <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', color: 'var(--ink)', lineHeight: 1.25, marginBottom: '12px' }}>
              {product.name}
            </h1>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '14px', color: 'var(--dim)' }}>{store?.currency || 'DZD'}</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '13px', height: '13px', fill: i < 4 ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />)}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', borderRadius: '20px', backgroundColor: inStock || autoGen ? 'rgba(107,45,139,0.08)' : 'rgba(100,80,80,0.08)', color: inStock || autoGen ? 'var(--plum)' : 'var(--mid)', fontSize: '12px', fontWeight: 600, border: `1px solid ${inStock || autoGen ? 'var(--plum-lt)' : 'var(--mid)'}`, marginBottom: '22px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
              
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--line)', marginBottom: '20px' }} />

            {(product.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--plum)', marginBottom: '20px' }}>
                {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', String(store.freeShippingMinAmount))}
              </p>
            )}

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '10px' }}>{t.offersTitle}</p>
                {product.offers.map((offer: any) => (
                  <label key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1.5px solid ${selectedOffer === offer.id ? 'var(--plum)' : 'var(--line-dk)'}`, cursor: 'pointer', marginBottom: '8px', borderRadius: '6px', transition: 'all 0.2s', backgroundColor: selectedOffer === offer.id ? 'var(--soft)' : 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${selectedOffer === offer.id ? 'var(--plum)' : 'var(--dim)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {selectedOffer === offer.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--plum)' }} />}
                      </div>
                      <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{offer.name}</p>
                        {offer.subTitle && <p style={{ fontSize: '11px', color: 'var(--dim)', margin: '2px 0 0' }}>{offer.subTitle}</p>}
                        <p style={{ fontSize: '11px', color: 'var(--dim)', margin: 0 }}>{t.offerQtyPrefix} {offer.quantity}</p>
                        {offer.shippingFree && <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--plum)', margin: '2px 0 0' }}>{t.freeShippingBadge}</p>}
                      </div>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--plum)' }}>{offer.price.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--dim)' }}>{store?.currency || 'DZD'}</span></span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '18px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                      return <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: '28px', height: '28px', backgroundColor: v.value, border: 'none', cursor: available ? 'pointer' : 'not-allowed', borderRadius: '50%', outline: s ? '3px solid var(--plum)' : '3px solid transparent', outlineOffset: '3px', opacity: available ? 1 : 0.35 }} />;
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                      return <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ width: '48px', height: '48px', overflow: 'hidden', border: `2px solid ${s ? 'var(--plum)' : 'var(--line-dk)'}`, cursor: available ? 'pointer' : 'not-allowed', padding: 0, borderRadius: '4px', opacity: available ? 1 : 0.35 }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>;
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                      return <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ padding: '6px 14px', border: `1.5px solid ${s ? 'var(--plum)' : 'var(--line-dk)'}`, borderRadius: '4px', fontFamily: "'DM Sans',sans-serif", fontSize: '13px', fontWeight: 500, background: s ? 'var(--soft)' : 'transparent', color: s ? 'var(--plum)' : (available ? 'var(--mid)' : '#bbb'), cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.2s', textDecoration: available ? 'none' : 'line-through' }}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} store={store} />

            {product.desc && (
              <div style={{ marginTop: '28px', paddingTop: '22px', borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: '14px', lineHeight: '1.85', color: 'var(--mid)', fontWeight: 400 }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT FORM
══════════════════════════════════════════════════════════════ */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '13px' }}>
    {label && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '6px' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '11px', color: 'var(--rose)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle style={{ width: '11px', height: '11px' }} />{error}
    </p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0, store }: ProductFormProps) {
  const router = useRouter();
  const lang = getLang(store || product?.store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const cur = store?.currency || product?.store?.currency || 'DZD';
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId: id })); } }, []);
  useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: any) => o.id === selectedOffer); if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  useEffect(() => { if (selW) setFd(f => ({ ...f, priceLoss: selW.livraisonReturn })); }, [selW]);

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
    setErrors({}); setSub(true);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, quantity: qty, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (typeof window !== 'undefined' && fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`/successfully?productId=${product?.id}`);
    } catch (err) { console.error(err); } finally { setSub(false); }
  };

  return (
    <div style={{ marginTop: '16px' }}>
      {product.store?.cart && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', border: `1.5px solid ${isAdded ? 'var(--plum)' : 'var(--line-dk)'}`, background: isAdded ? 'var(--soft)' : 'transparent', color: isAdded ? 'var(--plum)' : 'var(--mid)', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '13px', cursor: 'pointer', borderRadius: '4px', transition: 'all 0.2s' }}>
            {isAdded ? <><CheckCircle2 style={{ width: '14px', height: '14px' }} className="anim-check" />{t.addedMsg}</> : <><ShoppingCart style={{ width: '14px', height: '14px' }} />{t.addToCart}</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} className="btn-plum" style={{ flex: 1, padding: '11px' }}>
            {t.orderNow}
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div style={{ animation: 'fade-up 0.3s ease' }}>
          {product.store?.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mid)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.delivDataTitle}</p>
              <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: '1px solid var(--line-dk)', background: 'transparent', color: 'var(--dim)', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', borderRadius: '4px' }}>
                <X style={{ width: '11px', height: '11px' }} /> {t.back}
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {supportQty && (
              <FR label={t.qty}>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line-dk)', borderRadius: '4px', overflow: 'hidden' }}>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderInlineEnd: '1px solid var(--line-dk)', background: 'var(--off)', cursor: 'pointer', color: 'var(--ink)', fontSize: '18px' }}>-</button>
                  <span style={{ width: '52px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{fd.quantity}</span>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderInlineStart: '1px solid var(--line-dk)', background: 'var(--off)', cursor: 'pointer', color: 'var(--ink)', fontSize: '18px' }}>+</button>
                </div>
              </FR>
            )}

            <div className="form-2c">
              <FR error={errors.customerName} label={t.nameLabel}>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', ...(isRTL ? { right: '11px' } : { left: '11px' }), top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh}
                    style={{ ...INP_ST(!!errors.customerName), ...(isRTL ? { paddingRight: '34px' } : { paddingLeft: '34px' }) }}
                    onFocus={e => { e.target.style.borderColor = 'var(--plum)'; }} onBlur={e => { e.target.style.borderColor = errors.customerName ? 'var(--rose)' : 'var(--line-dk)'; }} />
                </div>
              </FR>
              <FR error={errors.customerPhone} label={t.phoneLbl}>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', ...(isRTL ? { right: '11px' } : { left: '11px' }), top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh}
                    style={{ ...INP_ST(!!errors.customerPhone), ...(isRTL ? { paddingRight: '34px' } : { paddingLeft: '34px' }) }}
                    onFocus={e => { e.target.style.borderColor = 'var(--plum)'; }} onBlur={e => { e.target.style.borderColor = errors.customerPhone ? 'var(--rose)' : 'var(--line-dk)'; }} />
                </div>
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label={t.wilaya}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', ...(isRTL ? { left: '11px' } : { right: '11px' }), top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}
                    style={{ ...INP_ST(!!errors.customerWelaya), paddingInlineEnd: '32px', fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--plum)'; }} onBlur={e => { e.target.style.borderColor = errors.customerWelaya ? 'var(--rose)' : 'var(--line-dk)'; }}>
                    <option value="">{t.wilayaPh}</option>
                    {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {isRTL ? w.ar_name : w.name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label={t.commune}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', ...(isRTL ? { left: '11px' } : { right: '11px' }), top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })}
                    style={{ ...INP_ST(!!errors.customerCommune), paddingInlineEnd: '32px', opacity: !fd.customerWelaya ? 0.4 : 1, fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--plum)'; }} onBlur={e => { e.target.style.borderColor = errors.customerCommune ? 'var(--rose)' : 'var(--line-dk)'; }}>
                    <option value="">{loadingC ? t.communeLoading : t.communePh}</option>
                    {communes.map(c => <option key={c.id} value={c.id}>{isRTL ? c.ar_name : c.name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label={t.deliveryType}>
              <div className="dlv-2c">
                {(['home', 'office'] as const).map(dtype => (
                  <button key={dtype} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: dtype }))}
                    style={{ padding: '12px 10px', border: `1.5px solid ${fd.typeLivraison === dtype ? 'var(--plum)' : 'var(--line-dk)'}`, backgroundColor: fd.typeLivraison === dtype ? 'var(--soft)' : 'transparent', cursor: 'pointer', textAlign: 'start', borderRadius: '4px', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', fontWeight: 600, color: fd.typeLivraison === dtype ? 'var(--plum)' : 'var(--mid)', margin: '0 0 4px' }}>
                      {dtype === 'home' ? t.deliveryHome : t.deliveryOffice}
                    </p>
                    {selW && (orderFreeShipping ? (
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === dtype ? 'var(--plum)' : 'var(--dim)', margin: 0 }}>{t.freeShippingBadge}</p>
                    ) : (
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === dtype ? 'var(--plum)' : 'var(--dim)', margin: 0 }}>
                        {(dtype === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()}
                        <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--dim)', marginInlineStart: '3px' }}>{cur}</span>
                      </p>
                    ))}
                  </button>
                ))}
              </div>
            </FR>

            <div style={{ border: '1px solid var(--line-dk)', borderRadius: '6px', marginBottom: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--soft)', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mid)', margin: 0 }}>{t.orderSummary}</p>
              </div>
              {[
                { l: t.productLabel, v: product.name.slice(0, 22) },
                { l: t.price, v: `${fp.toLocaleString()} ${cur}` },
                { l: t.qty, v: `× ${qty}` },
                { l: t.delivery, v: !selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${cur}` },
              ].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--white)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--dim)' }}>{row.l}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', backgroundColor: 'var(--soft)' }}>
                <span style={{ fontSize: '13px', color: 'var(--mid)' }}>{t.subtotal}</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--plum)' }}>{total().toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--dim)' }}>{cur}</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-plum" style={{ width: '100%', fontSize: '15px', padding: '13px', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1, borderRadius: '4px', marginBottom: '8px' }}>
              {sub ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> {t.sending}</> : `🛒 ${t.confirmOrder}`}
            </button>
            <p style={{ fontSize: '11px', color: 'var(--dim)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <Lock style={{ width: '10px', height: '10px', color: 'var(--plum)' }} /> {t.securePayment}
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CART — مكتمل مع نموذج التوصيل
══════════════════════════════════════════════════════════════ */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const cur = store?.currency || 'DZD';
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [domain, store]);
  useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

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
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  if (success) return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', background: 'var(--white)', padding: '4rem 2.5rem', border: '1px solid var(--line)', borderRadius: '8px', maxWidth: 460, width: '100%', boxShadow: '0 8px 32px rgba(107,45,139,0.1)' }}>
        <CheckCircle2 style={{ width: '48px', height: '48px', color: 'var(--plum)', margin: '0 auto 20px', display: 'block' }} />
        <h2 className="serif" style={{ fontSize: '1.8rem', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '8px' }}>{t.successTitle}</h2>
        <p style={{ fontSize: '14px', color: 'var(--dim)', marginBottom: '28px', lineHeight: 1.7 }}>{t.successDesc}</p>
        <Link href="/" className="btn-plum" style={{ display: 'inline-flex', padding: '12px 28px' }}>{t.backToShop}</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--line-dk)', borderRadius: '8px', maxWidth: 400, width: '100%' }}>
        <ShoppingBag style={{ width: '48px', height: '48px', color: 'var(--dim)', opacity: 0.4, margin: '0 auto 16px', display: 'block' }} />
        <p className="serif" style={{ fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--mid)', marginBottom: '20px' }}>{t.cartEmpty}</p>
        <Link href="/" className="btn-plum" style={{ display: 'inline-flex' }}>{t.shopNow}</Link>
      </div>
    </div>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '1.6rem', fontWeight: 600, color: 'var(--ink)' }}>{t.myCart}</h1>
        <span style={{ fontSize: '13px', color: 'var(--dim)' }}>{items.length} {t.productSuffix}</span>
      </div>
      {freeShippingMin != null && (
        <div style={{ background: freeShippingReached ? 'var(--soft)' : 'var(--off)', border: `1px solid ${freeShippingReached ? 'var(--plum-lt)' : 'var(--line)'}`, color: freeShippingReached ? 'var(--plum)' : 'var(--dim)', borderRadius: '6px', padding: '12px 18px', marginBottom: '24px', fontWeight: 700, fontSize: '13px', textAlign: 'center' }}>
          {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', String(freeShippingRemainingAmt))}
        </div>
      )}

      <div className="cart-g">
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ width: 96, height: 96, flexShrink: 0, overflow: 'hidden', borderRadius: '4px', border: '1px solid var(--line)', background: 'var(--soft)' }}>
                <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '14px', lineHeight: 1.45, marginBottom: '6px' }}>{item.product?.name}</h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--plum)' }}>{item.finalPrice?.toLocaleString()} {cur}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dim)' }}>× {item.quantity}</span>
                  <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: 'none', background: 'transparent', color: 'var(--dim)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--rose)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--dim)'; }}>
                    <Trash2 style={{ width: '13px', height: '13px' }} /> {t.deleteItem}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: '8px', padding: '28px', alignSelf: 'start' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '20px' }}>{t.delivDataTitle}</p>
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.name} label={t.nameLabel}>
                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={INP_ST(!!errors.name)} />
              </FR>
              <FR error={errors.phone} label={t.phoneLbl}>
                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={INP_ST(!!errors.phone)} />
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.w} label={t.wilaya}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', ...(isRTL ? { left: '11px' } : { right: '11px' }), top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP_ST(!!errors.w), paddingInlineEnd: '32px', fontFamily: 'inherit' }}>
                    <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {isRTL ? w.ar_name : w.name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label={t.commune}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', ...(isRTL ? { left: '11px' } : { right: '11px' }), top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP_ST(!!errors.c), paddingInlineEnd: '32px', opacity: !fd.customerWelaya ? 0.4 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{isRTL ? c.ar_name : c.name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <div style={{ margin: '20px 0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '12px' }}>{t.deliveryType}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(['home', 'office'] as const).map(dtype => (
                  <button
                    key={dtype}
                    type="button"
                    onClick={() => setFd(p => ({ ...p, typeLivraison: dtype }))}
                    style={{
                      padding: '14px 8px',
                      border: `1.5px solid ${fd.typeLivraison === dtype ? 'var(--plum)' : 'var(--line-dk)'}`,
                      borderRadius: '6px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: fd.typeLivraison === dtype ? 'rgba(107,45,139,0.06)' : 'var(--white)',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '1.4rem', marginBottom: '4px' }}>{dtype === 'home' ? '🏠' : '🏢'}</span>
                    <p style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', marginBottom: '2px' }}>{dtype === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                    {selW && <p style={{ fontWeight: 600, fontSize: '12px', color: 'var(--plum)' }}>{freeShippingReached ? t.freeShippingBadge : `${(dtype === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} ${cur}`}</p>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--line)', margin: '16px 0' }} />

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--dim)' }}>{t.subtotal}</span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{cartTotal.toLocaleString()} {cur}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontSize: '13px', color: 'var(--dim)' }}>{t.delivery}</span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{!selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${cur}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.total}</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--plum)' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--dim)' }}>{cur}</span></span>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-plum" style={{ width: '100%', fontSize: '15px', padding: '13px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> {t.sending}</> : `🛒 ${t.confirmOrder}`}
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
    <div dir={t.dir} style={{ minHeight: '100vh', background: 'var(--bg)', padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '3rem 2rem', borderRadius: 16, border: '1px solid rgba(107,45,139,0.15)', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={40} style={{ color: 'var(--plum)', display: 'block', margin: '0 auto 16px' }} />
          <h2 className="serif" style={{ fontSize: '1.8rem', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '8px' }}>{t.successTitle}</h2>
          <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.7 }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(107,45,139,0.15)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.75rem', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid rgba(107,45,139,0.12)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--dim)' }}>{t.total}</span>
                <span className="serif" style={{ fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--plum)' }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(107,45,139,0.15)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? CheckCircle2;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? '1px solid rgba(107,45,139,0.1)' : 'none', background: done ? 'rgba(107,45,139,0.05)' : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--plum)' : '#F3EEF6', color: done ? '#fff' : 'var(--dim)' }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: done ? 'var(--ink)' : 'var(--dim)', marginBottom: 2 }}>{step.title}</p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--dim)' }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <Link href="/" className="btn-plum" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 28px' }}>
            <ShoppingBag size={17} style={{ marginInlineEnd: 8 }} /> {t.shopNow}
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', borderRadius: 999, border: '1px solid rgba(107,45,139,0.2)', color: 'var(--dim)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATIC PAGES
══════════════════════════════════════════════════════════════ */
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

const Shell = ({ children, title, sub, store }: { children: React.ReactNode; title: string; sub?: string; store?: any }) => {
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: 'var(--white)', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'var(--soft)', padding: '56px 24px 40px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {sub && <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '8px' }}>{sub}</p>}
          <h1 className="serif" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', margin: 0 }}>{title}</h1>
        </div>
      </div>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '36px 24px 80px' }}>
        <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '8px', padding: '32px' }}>{children}</div>
      </div>
    </div>
  );
};

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom: '18px', marginBottom: '18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 7px' }}>{title}</h3>
      <p style={{ fontSize: '13px', lineHeight: '1.85', color: 'var(--mid)', fontWeight: 400, margin: 0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid var(--plum-lt)', color: 'var(--plum)', borderRadius: '20px', flexShrink: 0 }}>{tag}</span>}
  </div>
);

export function Privacy({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacyTitle} sub={t.privacySub} store={store}>
      <IB title={t.priv1Title} body={t.priv1Body} />
      <IB title={t.priv2Title} body={t.priv2Body} />
      <IB title={t.priv3Title} body={t.priv3Body} />
      <IB title={t.priv4Title} body={t.priv4Body} />
    </Shell>
  );
}

export function Terms({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.termsTitle} sub={t.termsSub} store={store}>
      <IB title={t.terms1Title} body={t.terms1Body} />
      <IB title={t.terms2Title} body={t.terms2Body} />
      <IB title={t.terms3Title} body={t.terms3Body} tag={t.terms3Tag} />
      <IB title={t.terms4Title} body={t.terms4Body} />
    </Shell>
  );
}

export function Cookies({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookiesTitle} sub={t.cookiesSub} store={store}>
      <IB title={t.cookies1Title} body={t.cookies1Body} tag={t.cookies1Tag} />
      <IB title={t.cookies2Title} body={t.cookies2Body} tag={t.cookies2Tag} />
      <IB title={t.cookies3Title} body={t.cookies3Body} tag={t.cookies3Tag} />
      <div style={{ marginTop: '16px', padding: '14px', border: '1px solid var(--line)', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: 'var(--soft)' }}>
        <ToggleRight style={{ width: '18px', height: '18px', color: 'var(--plum)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.8', margin: 0 }}>{t.cookiesNotice}</p>
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store?: any }) {
  const lang = getLang(store);
  const t = T[lang];
  const isRTL = lang === 'ar';
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id });
      setSent(true);
    } catch { showError(t.errSubmit); } finally { setLoading(false); }
  };

  const contactItems = [
    store?.contact?.phone && { icon: '📞', label: t.mailLbl, val: store.contact.phone },
    store?.contact?.email && { icon: '✉️', label: t.emailLabel, val: store.contact.email },
    (store?.contact?.wilaya || store?.contact?.address) && { icon: '📍', label: t.locLbl, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
  ].filter(Boolean) as { icon: string; label: string; val: string }[];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: 'var(--white)', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'var(--soft)', padding: '56px 24px 40px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '8px' }}>{t.contact}</p>
          <h1 className="serif" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 8px' }}>{t.helpTitle}</h1>
          <p style={{ fontSize: '14px', color: 'var(--dim)' }}>{t.replyTime}</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px 80px' }}>
        <div>
          <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '16px' }}>{t.contactMethods}</p>
            {contactItems.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--soft)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--plum)', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--soft)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--rose)', display: 'inline-block' }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--mid)' }}>{t.available}</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '8px', padding: '28px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '20px' }}>{t.sendMsg}</p>
          {sent ? (
            <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: '8px', textAlign: 'center', backgroundColor: 'var(--soft)', padding: '32px' }}>
              <CheckCircle2 style={{ width: '32px', height: '32px', color: 'var(--plum)', marginBottom: '12px' }} />
              <h3 className="serif" style={{ fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 6px' }}>{t.contactSentTitle}</h3>
              <p style={{ fontSize: '13px', color: 'var(--dim)' }}>{t.contactSentDesc}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>{t.nameLabel}</p>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t.fullNamePh} required style={INP_ST()}
                    onFocus={e => (e.target.style.borderColor = 'var(--plum)')} onBlur={e => (e.target.style.borderColor = 'var(--line-dk)')} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>{t.phoneLbl}</p>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={t.phonePh} required style={INP_ST()}
                    onFocus={e => (e.target.style.borderColor = 'var(--plum)')} onBlur={e => (e.target.style.borderColor = 'var(--line-dk)')} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>{t.emailLabel}</p>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t.emailPh} required style={INP_ST()}
                  onFocus={e => (e.target.style.borderColor = 'var(--plum)')} onBlur={e => (e.target.style.borderColor = 'var(--line-dk)')} />
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>{t.msgLabel}</p>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t.msgPh} rows={4} required
                  style={{ ...INP_ST(), resize: 'none' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--plum)')} onBlur={e => (e.target.style.borderColor = 'var(--line-dk)')} />
              </div>
              <button type="submit" disabled={loading} className="btn-plum" style={{ justifyContent: 'center', width: '100%', fontSize: '14px', padding: '12px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> {t.sending}</> : <>{t.sendBtn} <ArrowLeft style={{ width: '14px', height: '14px' }} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}