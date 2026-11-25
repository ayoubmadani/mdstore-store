'use client';
// دوال المتجر وقت التشغيل (@mdstore/theme-kit) — مع بديل إن كان المتجر المنشور أقدم
import * as __kit from '@mdstore/theme-kit';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ProductAddons, addonsTotal, addonsLabel } from '@/components/theme/ProductAddons';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Phone,
  CheckCircle2, ArrowLeft, Package,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, MapPin, Shield, Truck, Leaf, Heart,
  Mail, MessageCircle, Download,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import * as __bk from '@/components/bundles/useBundleOrder'; // منطق الأطقم مدمج داخل الثيم (مستقل عن المتجر)
import { WhatsAppOrderButton, WhatsAppGlyph, comingSoon, storeWhatsappHref, LogoWithName, imageIndexForSelection, variantForImage } from '@/components/theme/storeContact';


// اسم اللون المختار (أحمر) بجانب اسم الخاصية — إن كتبه التاجر للون أو الصورة
const __colorName = (attr: any, sel: any) => {
  const v = attr?.variants?.find((x: any) => x.value === sel?.[attr?.name]);
  return (attr?.displayMode === 'color' || attr?.displayMode === 'image') && v?.name && v.name !== v.value
    ? <span style={{ fontWeight: 500, opacity: 0.75, textTransform: 'none' }}> : {v.name}</span> : null;
};

const isValidDzPhone = (v?: string | null) => (__kit.isValidDzPhone ? __kit.isValidDzPhone(v as string) : /^(0|\+213)[5-7]\d{8}$/.test(String(v ?? '').trim()));
const __k: any = __bk;
const withLocationLabels = <D extends Record<string, any>>(d: D): D => (__kit.withLocationLabels ? __kit.withLocationLabels(d) : d);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const G  = '#2D6A4F';
const GA = '#52B788';
const GL = 'rgba(45,106,79,0.08)';
const GB = '#B7DBC8';
const GD = '#1B4332';
const BG = '#F6F8F5';
const CARD = '#FFFFFF';
const INK = '#1A2E1F';
const SUB = '#5F7562';
const BD = '#D8E8DC';

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${BG}; color: ${INK}; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${BG}; }
  ::-webkit-scrollbar-thumb { background: ${GB}; border-radius: 10px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes checkPop { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes glb-ov-in { from { opacity:0; } to { opacity:1; } }
  @keyframes glb-ov-panel { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }

  .anim-fade-up { animation: fadeUp 0.35s ease both; }
  .anim-check   { animation: checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  .nav-desktop { display: none; align-items: center; gap: 1.5rem; }
  .nav-mobile  { display: flex; gap: 0.5rem; }
  @media (min-width: 1024px) { .nav-desktop { display: flex; } .nav-mobile { display: none; } }

  .hero-inner { display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; gap: 2rem; }
  @media (min-width: 900px) { .hero-inner { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 4rem; } }

  .cats-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
  @media (min-width: 500px) { .cats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (min-width: 768px) { .cats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  @media (min-width: 1024px) { .cats-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); } }

  .products-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.5rem; }
  @media (min-width: 500px) { .products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

  .nat-card { background: ${CARD}; border-radius: 16px; overflow: hidden; border: 1px solid ${BD}; transition: all 0.25s; display: flex; flex-direction: column; }
  .nat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 40px rgba(45,106,79,0.13); border-color: ${GA}; }
  .nat-card:hover .nat-card-name { color: ${G}; }

  .trust-row { display: flex; overflow-x: auto; gap: 1px; background: ${BD}; border-radius: 12px; overflow: hidden; -webkit-overflow-scrolling: touch; }
  .trust-row::-webkit-scrollbar { height: 0; }

  .details-inner { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.5rem; padding: 1rem; }
  .gallery-container { position: relative; top: 0; width: 100%; }
  .info-container { background: ${CARD}; border-radius: 16px; border: 1px solid ${BD}; padding: 1.5rem; }
  @media (min-width: 768px) {
    .details-inner { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 3.5rem; padding: 2.5rem; }
    .gallery-container { position: sticky; top: 100px; z-index: 10; }
    .info-container { padding: 2rem; }
  }

  .form-row-2 { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.875rem; margin-bottom: 0.875rem; }
  @media (min-width: 500px) { .form-row-2 { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }

  .cart-inner { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2rem; }
  @media (min-width: 1024px) { .cart-inner { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 3rem; } }

  .contact-inner { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2rem; }
  @media (min-width: 1024px) { .contact-inner { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); } }

  .footer-inner { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2.5rem; padding-bottom: 2.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(178,210,195,0.2); }
  @media (min-width: 768px) { .footer-inner { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr); } }

  .hero-actions { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .hero-actions { flex-direction: row; align-items: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0.75rem; }
  .thumb-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; padding-bottom: 4px; }
  .pagination { display: flex; justify-content: center; gap: 0.375rem; flex-wrap: wrap; margin-top: 3rem; }

  a { text-decoration: none; color: inherit; }
  .price-mono { font-variant-numeric: tabular-nums; }

  .glb-search-ov {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(246,248,245,0.97); backdrop-filter: blur(20px);
    overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
    animation: glb-ov-in 0.2s ease;
  }
  .glb-search-panel { max-width: 640px; margin: 0 auto; padding: 5rem 1.5rem 4rem; animation: glb-ov-panel 0.28s ease; }
  .glb-search-form { border-bottom: 2px solid ${G}; display: flex; align-items: center; margin-bottom: 2rem; }
  .glb-search-input { flex: 1; font-size: 1.375rem; border: none; background: transparent; color: ${INK}; outline: none; padding: 0.5rem 0.5rem 0.75rem; font-family: 'DM Sans', sans-serif; }
  .glb-search-input::placeholder { color: ${GB}; }
  .glb-search-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
  .glb-search-card { display: block; background: ${CARD}; border-radius: 12px; border: 1px solid ${BD}; overflow: hidden; transition: all 0.2s; text-decoration: none; color: inherit; }
  .glb-search-card:hover { border-color: ${GA}; box-shadow: 0 4px 16px rgba(45,106,79,0.1); }
  .glb-search-card-info { padding: 0.625rem 0.75rem; }
`;

interface Offer { id: string; name: string; quantity: number; price: number; subTitle?: string; shippingFree?: boolean; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; code?: number; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
export interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; shippingFree?: boolean; isDigital?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
  store?: any;
}


// نوع التوصيل المتاح في الولاية المختارة (منزل / مكتب) حسب حساب الشحن — قبل اختيار الولاية يظهر الاثنان
const deliveryAllowed = (list: any[], wilayaId: any, type: 'home' | 'office', communes?: any[], communeId?: any) => {
  const w = (list || []).find((x: any) => String(x.id) === String(wilayaId));
  // البلدية المختارة قد تكون مقيّدة (التوصيل للمنزل أو للمكتب فقط) من صفحة أسعار التوصيل
  const c = communeId ? (communes || []).find((x: any) => String(x.id) === String(communeId)) : null;
  const okC = !c || (type === 'home' ? c.homeEnabled !== false : c.officeEnabled !== false);
  return okC && (!w || (type === 'home' ? w.homeEnabled !== false : w.officeEnabled !== false));
};
// خيار نوع التوصيل يظهر فقط بعد اختيار الولاية، وحسب ما هو متاح فيها
const deliveryShown = (list: any[], wilayaId: any, type: 'home' | 'office', communes?: any[], communeId?: any) => !!wilayaId && deliveryAllowed(list, wilayaId, type, communes, communeId);

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string, sid?: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}${sid ? `?storeId=${sid}` : ''}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

const S = {
  input: { width: '100%', padding: '0.7rem 0.875rem', background: '#fff', border: `1px solid ${BD}`, borderRadius: 10, fontSize: '0.9rem', color: INK, outline: 'none', transition: 'border-color 0.15s', appearance: 'none' } as React.CSSProperties,
  inputErr: { borderColor: '#DC2626' } as React.CSSProperties,
  btnPrimary: { width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: G, color: '#fff', fontWeight: 600, fontSize: '0.9rem', padding: '0.875rem 1.5rem', borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
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
  orderEmail: 'البريد الإلكتروني',
  emailPh: 'example@email.com',
  errEmail: 'يرجى إدخال بريد إلكتروني صحيح',
  whatsapp: 'رقم واتساب',
  whatsappPh: '0550123456',
  errWhatsapp: 'رقم واتساب جزائري صحيح مطلوب (مثال: 0550123456)',
  contactQuestion: 'هل تملك بريداً إلكترونياً أم واتساب؟',
  contactViaEmail: 'البريد الإلكتروني',
  contactViaWhatsapp: 'واتساب',
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
  freeShippingBadge: 'توصيل مجاني',
  freeShippingThreshold: 'توصيل مجاني عند الشراء بأكثر من {{amount}}',
  freeShippingRemaining: 'أضف {{amount}} لتحصل على توصيل مجاني',
  freeShippingReached: 'مبروك! لديك توصيل مجاني 🎉',
  // Footer
  quickLinks: 'روابط سريعة', legalNav: 'قانوني',
  contactSect: 'تواصل معنا',
  privacy: 'الخصوصية',
  terms: 'الشروط',
  cookies: 'الكوكيز',
  rightsReserved: 'جميع الحقوق محفوظة',
  // Theme-specific
  logoSubtitle: 'أعشاب وصحة',
  heroBadge: 'منتجات طبيعية 100%',
  heroTitleDef: 'الطبيعة في<br/><span style="color:#2D6A4F">أفضل حالاتها</span>',
  heroSubtitleDef: 'منتجات عشبية وصحية طبيعية 100% — مختارة بعناية لصحتك ورفاهيتك.',
  heroBrowse: 'تصفح المنتجات',
  heroBadges: ['🌿 أعشاب طازجة', '✅ معتمد', '🚚 توصيل سريع', '💯 مضمون'],
  trust: [
    { t: 'توصيل 58 ولاية', s: 'على الأبواب' },
    { t: 'دفع عند الاستلام', s: '100% آمن' },
    { t: 'طبيعي بالكامل', s: 'بدون كيميائيات' },
    { t: 'معتمد صحياً', s: 'لصحة أفضل' },
  ],
  catTitle: 'تصفح الفئات',
  prodTitle: 'جميع المنتجات',
  prodUnit: 'منتج',
  prodNone: 'لا توجد منتجات بعد',
  cardBadge1: 'طبيعي',
  cardBadge2: 'معتمد',
  viewProduct: 'عرض المنتج',
  natural100: 'طبيعي 100%',
  discountBadge: 'خصم',
  priceLabel: 'السعر',
  qtyOfferLabel: 'الكمية:',
  footerSubDef: 'منتجات طبيعية، أعشاب وعناية صحية بجودة عالية ومضمونة.',
  footerPages: 'الصفحات',
  footerContactTitle: 'تواصل',
  homeBtn: 'للبيت',
  officeBtn: 'للمكتب',
  productLabel: 'المنتج',
  totalMaj: 'المجموع',
  delivInfoTitle: 'معلومات التوصيل',
  cartTitle: 'سلة التسوق',
  qtyInCart: 'الكمية:',
  finalTotalLabel: 'الإجمالي',
  cartSuccessTitle: 'تم استلام طلبك!',
  cartSuccessDesc: 'سنتواصل معك قريباً لتأكيد الطلب.',
  backToStore: 'العودة للمتجر',
  errRequired: 'مطلوب',
  processing: 'جاري المعالجة...',
  addedShort: 'تمت الإضافة',
  addBtn: 'أضف للسلة',
  delivDataTitle: 'بيانات التوصيل',
  cancelLabel: 'إلغاء',
  nameLabel: 'الاسم',
  phoneLabel: 'الهاتف',
  emailLabel: 'البريد الإلكتروني',
  msgLabel: 'الرسالة',
  sendBtn: 'إرسال الرسالة',
  contactErrMsg: 'حدث خطأ في الإرسال',
  contactLocLabel: 'الموقع',
  contactReply: 'نرد في غضون ساعة',
  contactSentTitle: 'تم الإرسال بنجاح!',
  contactSentDesc: 'سنرد عليك في أقرب وقت.',
  contactAnotherBtn: 'إرسال رسالة أخرى',
  searchTitle: 'البحث عن منتج',
  searchPh: 'ابحث في المنتجات...',
  privacyTitle: 'سياسة الخصوصية',
  privacyData: 'البيانات التي نجمعها',
  privacyDataBody: 'نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم، رقم الهاتف، وعنوان التوصيل.',
  privacyProtect: 'حماية البيانات',
  privacyProtectBody: 'تُخزن جميع البيانات بشكل مشفر. نستخدم بروتوكولات حماية معتمدة لضمان أمان معلوماتكم.',
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
  orderEmail: 'E-mail',
  emailPh: 'exemple@email.com',
  errEmail: 'Veuillez saisir une adresse e-mail valide',
  whatsapp: 'Numéro WhatsApp',
  whatsappPh: '0550123456',
  errWhatsapp: 'Numéro WhatsApp algérien valide requis (ex: 0550123456)',
  contactQuestion: 'Avez-vous un e-mail ou un numéro WhatsApp ?',
  contactViaEmail: 'E-mail',
  contactViaWhatsapp: 'WhatsApp',
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
  freeShippingBadge: 'Livraison gratuite',
  freeShippingThreshold: 'Livraison gratuite à partir de {{amount}}',
  freeShippingRemaining: 'Ajoutez {{amount}} pour bénéficier de la livraison gratuite',
  freeShippingReached: 'Bravo ! Vous avez la livraison gratuite 🎉',
  // Footer
  quickLinks: 'Navigation', legalNav: 'Légal',
  contactSect: 'Contact',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  cookies: 'Cookies',
  rightsReserved: 'Tous droits réservés.',
  // Theme-specific
  logoSubtitle: 'Herbes & Santé',
  heroBadge: 'Produits 100% naturels',
  heroTitleDef: 'La nature dans<br/><span style="color:#2D6A4F">toute sa splendeur</span>',
  heroSubtitleDef: 'Produits à base de plantes et soins de santé 100% naturels — sélectionnés avec soin pour votre bien-être.',
  heroBrowse: 'Découvrir les produits',
  heroBadges: ['🌿 Herbes fraîches', '✅ Certifié', '🚚 Livraison rapide', '💯 Garanti'],
  trust: [
    { t: 'Livraison 58 wilayas', s: 'Partout en Algérie' },
    { t: 'Paiement à la livraison', s: '100% sécurisé' },
    { t: '100% Naturel', s: 'Sans produits chimiques' },
    { t: 'Certifié santé', s: 'Pour une meilleure santé' },
  ],
  catTitle: 'Parcourir les catégories',
  prodTitle: 'Tous les produits',
  prodUnit: 'produit',
  prodNone: 'Aucun produit disponible.',
  cardBadge1: 'Naturel',
  cardBadge2: 'Certifié',
  viewProduct: 'Voir le produit',
  natural100: '100% Naturel',
  discountBadge: 'Remise',
  priceLabel: 'Prix',
  qtyOfferLabel: 'Quantité :',
  footerSubDef: 'Produits naturels, herbes et soins de santé de haute qualité.',
  footerPages: 'Pages',
  footerContactTitle: 'Contact',
  homeBtn: 'À domicile',
  officeBtn: 'Point relais',
  productLabel: 'Produit',
  totalMaj: 'Total',
  delivInfoTitle: 'Informations de livraison',
  cartTitle: 'Panier',
  qtyInCart: 'Quantité :',
  finalTotalLabel: 'Total général',
  cartSuccessTitle: 'Commande reçue !',
  cartSuccessDesc: 'Nous vous contacterons bientôt pour confirmer votre commande.',
  backToStore: 'Retour à la boutique',
  errRequired: 'Requis',
  processing: 'Traitement en cours...',
  addedShort: 'Ajouté',
  addBtn: 'Ajouter au panier',
  delivDataTitle: 'Informations de livraison',
  cancelLabel: 'Annuler',
  nameLabel: 'Nom',
  phoneLabel: 'Téléphone',
  emailLabel: 'Email',
  msgLabel: 'Message',
  sendBtn: 'Envoyer le message',
  contactErrMsg: "Une erreur est survenue lors de l'envoi.",
  contactLocLabel: 'Localisation',
  contactReply: "Réponse en moins d'une heure",
  contactSentTitle: 'Message envoyé !',
  contactSentDesc: 'Nous vous répondrons dans les plus brefs délais.',
  contactAnotherBtn: 'Envoyer un autre message',
  searchTitle: 'Rechercher un produit',
  searchPh: 'Rechercher dans les produits...',
  privacyTitle: 'Politique de confidentialité',
  privacyData: 'Données collectées',
  privacyDataBody: "Nous collectons uniquement les informations nécessaires pour traiter vos commandes, comme le nom, le numéro de téléphone et l'adresse de livraison.",
  privacyProtect: 'Protection des données',
  privacyProtectBody: "Toutes les données sont stockées de manière chiffrée. Nous utilisons des protocoles de protection certifiés pour garantir la sécurité de vos informations.",
  privacyShare: "Partage d'informations",
  privacyShareBody: "Nous ne vendons pas vos données et ne les partageons pas avec des tiers, sauf avec nos partenaires de livraison.",
  termsTitle: "Conditions d'utilisation",
  termsAccount: 'Compte et responsabilité',
  termsAccountBody: "L'utilisateur est responsable de l'exactitude des données saisies et de la confidentialité de son compte.",
  termsOrders: 'Commandes et paiements',
  termsOrdersBody: "Les commandes sont confirmées par téléphone avant l'expédition. Les prix affichés sont les prix finaux.",
  termsLaw: 'Loi applicable',
  termsLawBody: "Toutes les transactions sont soumises aux lois en vigueur en République Algérienne Démocratique et Populaire.",
  cookiesTitle: 'Fichiers témoins',
  cookiesEssential: 'Fichiers essentiels',
  cookiesEssentialBody: "Nous utilisons des cookies essentiels pour assurer le bon fonctionnement du panier et la sécurité de la session.",
  cookiesExp: "Amélioration de l'expérience",
  cookiesExpBody: "Nous utilisons certains fichiers pour comprendre l'utilisation du site et améliorer l'expérience de navigation.",
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
  noProducts: 'No products available yet.',
  shopNow: 'Shop Now',
  searchResultsFor: 'Search results for:',
  fullName: 'Full name',
  fullNamePh: 'Enter your name',
  errName: 'Name is required',
  phone: 'Phone number',
  phonePh: '05xxxxxxxx',
  errPhone: 'Phone number is required',
  errPhoneInvalid: 'Invalid phone number',
  orderEmail: 'Email',
  emailPh: 'example@email.com',
  errEmail: 'Please enter a valid email address',
  whatsapp: 'WhatsApp number',
  whatsappPh: '0550123456',
  errWhatsapp: 'A valid Algerian WhatsApp number is required (e.g. 0550123456)',
  contactQuestion: 'Do you have an email or a WhatsApp number?',
  contactViaEmail: 'Email',
  contactViaWhatsapp: 'WhatsApp',
  wilaya: 'Wilaya',
  errWilaya: 'Wilaya is required',
  wilayaPh: 'Select a wilaya',
  wilayaNA: 'Delivery not available at the moment',
  commune: 'Commune',
  errCommune: 'Commune is required',
  communePh: 'Select a commune',
  communeLoading: 'Loading...',
  deliveryType: 'Delivery type',
  deliveryHome: 'Home delivery',
  deliveryOffice: 'Post office',
  qty: 'Quantity',
  price: 'Price',
  delivery: 'Delivery',
  total: 'Total',
  subtotal: 'Subtotal',
  orderInfo: 'Order information',
  addToCart: 'Add to cart',
  orderNow: 'Order now',
  confirmOrder: 'Confirm order',
  sending: 'Sending...',
  back: 'Back',
  addedMsg: 'Added to cart ✓',
  errSubmit: 'An error occurred while submitting.',
  myCart: 'My Cart',
  cartEmpty: 'Your cart is empty',
  cartEmptyDesc: 'You have not added any products yet.',
  successTitle: 'Order placed successfully!',
  successDesc: 'We will contact you soon to confirm the details.',
  backToShop: 'Back to shopping',
  successSteps: [
    { title: 'Order received', desc: 'Your order has been registered successfully' },
    { title: 'Confirmation', desc: "We'll call you within 24 hours" },
    { title: 'Packaging', desc: 'Your order is being prepared with care' },
    { title: 'Shipping', desc: '2-5 business days' },
  ],
  checkoutTitle: 'Checkout',
  offersTitle: 'Available offers',
  descTitle: 'Description',
  freeShippingBadge: 'Free Delivery',
  freeShippingThreshold: 'Free delivery on orders over {{amount}}',
  freeShippingRemaining: 'Add {{amount}} more to get free delivery',
  freeShippingReached: 'Congrats! You have free delivery 🎉',
  quickLinks: 'Quick links', legalNav: 'Legal',
  contactSect: 'Contact us',
  privacy: 'Privacy',
  terms: 'Terms',
  cookies: 'Cookies',
  rightsReserved: 'All rights reserved.',
  logoSubtitle: 'Herbs & Health',
  heroBadge: '100% Natural Products',
  heroTitleDef: 'Nature at its<br/><span style="color:#2D6A4F">finest</span>',
  heroSubtitleDef: '100% natural herbal and health products — carefully selected for your health and wellness.',
  heroBrowse: 'Browse Products',
  heroBadges: ['🌿 Fresh herbs', '✅ Certified', '🚚 Fast delivery', '💯 Guaranteed'],
  trust: [
    { t: 'Delivery 58 wilayas', s: 'Nationwide' },
    { t: 'Cash on delivery', s: '100% secure' },
    { t: '100% Natural', s: 'No chemicals' },
    { t: 'Health certified', s: 'For better health' },
  ],
  catTitle: 'Browse categories',
  prodTitle: 'All products',
  prodUnit: 'product',
  prodNone: 'No products yet.',
  cardBadge1: 'Natural',
  cardBadge2: 'Certified',
  viewProduct: 'View product',
  natural100: '100% Natural',
  discountBadge: 'Off',
  priceLabel: 'Price',
  qtyOfferLabel: 'Qty:',
  footerSubDef: 'Natural products, herbs and health care of the highest quality.',
  footerPages: 'Pages',
  footerContactTitle: 'Contact',
  homeBtn: 'Home delivery',
  officeBtn: 'Post office',
  productLabel: 'Product',
  totalMaj: 'Total',
  delivInfoTitle: 'Delivery information',
  cartTitle: 'Shopping cart',
  qtyInCart: 'Qty:',
  finalTotalLabel: 'Grand total',
  cartSuccessTitle: 'Order received!',
  cartSuccessDesc: 'We will contact you soon to confirm your order.',
  backToStore: 'Back to store',
  errRequired: 'Required',
  processing: 'Processing...',
  addedShort: 'Added',
  addBtn: 'Add to cart',
  delivDataTitle: 'Delivery information',
  cancelLabel: 'Cancel',
  nameLabel: 'Name',
  phoneLabel: 'Phone',
  emailLabel: 'Email',
  msgLabel: 'Message',
  sendBtn: 'Send message',
  contactErrMsg: 'An error occurred while sending.',
  contactLocLabel: 'Location',
  contactReply: 'Response within one hour',
  contactSentTitle: 'Message sent!',
  contactSentDesc: 'We will reply as soon as possible.',
  contactAnotherBtn: 'Send another message',
  searchTitle: 'Search for a product',
  searchPh: 'Search products...',
  privacyTitle: 'Privacy Policy',
  privacyData: 'Data we collect',
  privacyDataBody: 'We only collect the information necessary to process your orders, such as name, phone number, and delivery address.',
  privacyProtect: 'Data protection',
  privacyProtectBody: 'All data is stored in encrypted form. We use certified protection protocols to ensure the security of your information.',
  privacyShare: 'Information sharing',
  privacyShareBody: 'We do not sell or share your data with any third parties except delivery partners.',
  termsTitle: 'Terms of use',
  termsAccount: 'Account & responsibility',
  termsAccountBody: 'The user is responsible for the accuracy of the data entered and for maintaining the confidentiality of their account.',
  termsOrders: 'Orders & payments',
  termsOrdersBody: 'Orders are confirmed by phone before shipping. The displayed prices are the final prices.',
  termsLaw: 'Governing law',
  termsLawBody: "All transactions are subject to the laws in force in the People's Democratic Republic of Algeria.",
  cookiesTitle: 'Cookies',
  cookiesEssential: 'Essential files',
  cookiesEssentialBody: 'We use essential cookies to ensure the shopping cart works and the login session is secure.',
  cookiesExp: 'Experience improvement',
  cookiesExpBody: 'We use some files to understand how the site is used and to improve the browsing experience.',
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
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

export function Navbar({ store, domain }: { store: any; domain: string }) {
  const lang = getLang(store); const t = withLocationLabels(T)[lang]; const isRTL = lang === 'ar';
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
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setListSearch([]); setShowSearch(false); }
  };

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: G, padding: '0.375rem 1.5rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' as const }}>
            <Leaf size={10} style={{ flexShrink: 0 }} />
            {store.topBar.text}
            <Leaf size={10} style={{ flexShrink: 0 }} />
          </p>
        </div>
      )}
      <nav dir={isRTL ? 'rtl' : 'ltr'} style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(246,248,245,0.95)' : '#fff', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${scrolled ? BD : '#EDF2EE'}`, boxShadow: scrolled ? '0 2px 20px rgba(45,106,79,0.08)' : 'none', transition: 'all 0.25s' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <Link href="/" style={{ flexShrink: 0 }}>
            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
              <LogoWithName store={store} nameStyle={{ fontSize: '0.9rem', fontWeight: 700, color: INK, display: 'block', lineHeight: 1.15 }}><img src={store.design.logoUrl} style={{ height: 36, objectFit: 'contain', maxWidth: 160, display: 'block' }} alt={store?.name || ''} onError={() => setImgError(true)} /></LogoWithName>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${G} 0%, ${GA} 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={16} color="#fff" />
                </div>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: INK, display: 'block', lineHeight: 1.15 }}>{store?.name || 'Nature Wellness'}</span>
                  <span style={{ fontSize: '0.58rem', color: SUB, display: 'block' }}>{t.logoSubtitle}</span>
                </div>
              </div>
            )}
          </Link>

          <div className="nav-desktop" style={{ flex: 1, justifyContent: 'center' }}>
            {[{ h: '/', l: t.home }, { h: '/contact', l: t.contactSect }].map(i => (
              <Link key={i.h} href={i.h} style={{ fontSize: '0.875rem', fontWeight: 500, color: SUB, transition: 'color 0.15s', padding: '0.3rem 0.75rem', borderRadius: 8 }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = G; (e.currentTarget as HTMLAnchorElement).style.background = GL; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = SUB; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
                {i.l}
              </Link>
            ))}
          </div>

          <div className="nav-desktop" style={{ flexShrink: 0, gap: '0.75rem' }}>
            <button onClick={() => setShowSearch(true)} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB, transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = GA; (e.currentTarget as HTMLButtonElement).style.color = G; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BD; (e.currentTarget as HTMLButtonElement).style.color = SUB; }}>
              <Search size={15} />
            </button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: `linear-gradient(135deg, ${G} 0%, ${GA} 100%)`, color: '#fff', height: 38, padding: '0 1rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, transition: 'opacity 0.18s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.88')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}>
                <ShoppingCart size={14} /> {t.cart}
                {count > 0 && <span style={{ background: '#fff', color: G, fontSize: 10, fontWeight: 800, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
          </div>

          <div className="nav-mobile">
            <button onClick={() => setShowSearch(true)} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB }}><Search size={15} /></button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: `linear-gradient(135deg, ${G} 0%, ${GA} 100%)`, color: '#fff', width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={15} />
                {count > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#fff', color: G, fontSize: 9, fontWeight: 800, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
            <button onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB }}>
              {open ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>
        <div style={{ overflow: 'hidden', maxHeight: open ? 200 : 0, transition: 'max-height 0.25s ease', background: '#fff', borderTop: open ? `1px solid ${BD}` : 'none' }}>
          <div style={{ padding: '0.5rem 1.5rem 1rem' }}>
            {[{ h: '/', l: t.home }, { h: '/contact', l: t.contactSect }].map(i => (
              <Link key={i.h} href={i.h} onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: `1px solid ${BD}`, fontSize: '0.9rem', fontWeight: 500, color: INK }}>
                {i.l} <ArrowLeft size={14} style={{ color: G }} />
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {showSearch && (
        <div className="glb-search-ov" onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div className="glb-search-panel" dir={isRTL ? 'rtl' : 'ltr'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: SUB }}>{t.searchTitle}</span>
              <button onClick={() => setShowSearch(false)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BD}`, background: CARD, color: SUB, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
            </div>
            <form className="glb-search-form" onSubmit={handleSearch}>
              <Search size={18} style={{ color: G, flexShrink: 0, margin: '0 10px' }} />
              <input ref={searchInputRef} className="glb-search-input" type="text" placeholder={t.searchPh} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </form>
            {loading && <p style={{ textAlign: 'center', color: G, fontSize: '0.82rem', padding: '2rem' }}>{t.searching}</p>}
            {!loading && listSearch.length > 0 && (
              <>
              <div className="glb-search-grid" dir={isRTL ? 'rtl' : 'ltr'}>
                {listSearch.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} className="glb-search-card" onClick={() => setShowSearch(false)}>
                    {(p.productImage || p.imagesProduct?.[0]?.imageUrl) && (
                      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                    )}
                    <div className="glb-search-card-info">
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: INK, marginBottom: 3, lineHeight: 1.35 }}>{p.name}</p>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: G }}>{Number(p.price).toLocaleString()} {store?.currency || 'DZD'}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button onClick={handleSearch} style={{ width: '100%', padding: '12px', background: GL, border: 'none', borderTop: `1px solid rgba(45,106,79,0.2)`, color: G, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {t.showAll} <ArrowLeft size={14} />
              </button>
              </>
            )}
            {!loading && searchQuery.length >= 2 && listSearch.length === 0 && (
              <p style={{ textAlign: 'center', color: GB, fontSize: '0.875rem', padding: '3rem' }}>{t.noResults}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Footer({ store }: any) {
  const lang = getLang(store); const t = withLocationLabels(T)[lang]; const isRTL = lang === 'ar';
  return (
    <footer dir={isRTL ? 'rtl' : 'ltr'} style={{ background: GD, color: 'rgba(255,255,255,0.4)', marginTop: 80, padding: '3.5rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ width: 30, height: 30, background: 'rgba(82,183,136,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={14} color={GA} />
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.85, maxWidth: 280, color: 'rgba(255,255,255,0.45)' }}>
              {store?.hero?.subtitle?.substring(0, 90) || t.footerSubDef}
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)' }}>© {new Date().getFullYear()} {store?.name}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: GA, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1.125rem' }}>{t.footerPages}</h4>
            {[{ h: '/', l: t.home }, { h: '/cart', l: t.cart }, { h: '/contact', l: t.contactSect }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.6rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = GA)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                {lnk.l}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: GA, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1.125rem' }}>{t.legalNav}</h4>
            {[{ h: '/Privacy', l: t.privacy }, { h: '/Terms', l: t.terms }, { h: '/cookies', l: t.cookies }].map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.6rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = GA)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                {lnk.l}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: GA, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1.125rem' }}>{t.footerContactTitle}</h4>
            {[
              { icon: <Phone size={13} />, val: store?.contact?.phone || comingSoon(store) },
              { icon: <WhatsAppGlyph size={13} />, val: store?.contact?.whatsapp || comingSoon(store) },
              { icon: <Mail size={13} />, val: store?.contact?.email || comingSoon(store) },
              { icon: <MapPin size={13} />, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: GA, flexShrink: 0 }}>{r.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Card({ product, displayImage, discount, store }: any) {
  const cardLang = getLang(store); const cardT = T[cardLang];
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="nat-card">
      <div style={{ position: 'relative', aspectRatio: '4/5', background: '#EBF4EE', overflow: 'hidden' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={36} color={GB} /></div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: `linear-gradient(135deg, ${G}, ${GA})`, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>-{discount}%</div>
        )}
        {product.isDigital ? (
          <div style={{ position: 'absolute', top: 10, left: 10, background: `linear-gradient(135deg, ${G}, ${GA})`, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, display: 'flex', alignItems: 'center' }}><Download size={12} /></div>
        ) : product.shippingFree && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: `linear-gradient(135deg, ${G}, ${GA})`, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>🚚</div>
        )}
      </div>
      <div style={{ padding: '0.875rem 1rem 1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.58rem', fontWeight: 600, color: G, background: GL, borderRadius: 20, padding: '2px 7px', display: 'inline-flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' as const }}><Leaf size={8} />{cardT.cardBadge1}</span>
          <span style={{ fontSize: '0.58rem', fontWeight: 600, color: '#059669', background: '#D1FAE5', borderRadius: 20, padding: '2px 7px', whiteSpace: 'nowrap' as const }}>✅ {cardT.cardBadge2}</span>
        </div>
        <h3 className="nat-card-name" style={{ fontSize: '0.875rem', fontWeight: 600, color: INK, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.18s', flex: 1, marginBottom: '0.5rem' }}>{product.name}</h3>
        <div style={{ marginBottom: '0.75rem' }}>
          <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: G }}>{price.toLocaleString()}</span>
          <span style={{ fontSize: '0.68rem', color: SUB, margin: '0 3px' }}>{store?.currency || 'DZD'}</span>
          {orig > price && <span style={{ fontSize: '0.68rem', color: GB, textDecoration: 'line-through', margin: '0 5px' }}>{orig.toLocaleString()}</span>}
        </div>
        <Link href={`/product/${product.slug || product.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: `linear-gradient(135deg, ${G}, ${GA})`, color: '#fff', fontSize: '0.82rem', fontWeight: 600, padding: '0.6rem', borderRadius: 24, transition: 'opacity 0.18s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.85')}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}>
          {cardT.viewProduct} <ArrowLeft size={12} />
        </Link>
      </div>
    </div>
  );
}

const __BCSS = `
.mdb-track { max-width: 1280px; margin: 0 auto; display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: 1.5rem; padding: 0 1.5rem 0.5rem; scrollbar-width: none; }
.mdb-track::-webkit-scrollbar { display: none; }
.mdb-track > article { scroll-snap-align: start; flex: 0 0 min(88%, 380px); }
.mdb-track.one > article { flex-basis: min(100%, 560px); }
.mdb-items { list-style: none; display: flex; align-items: flex-start; gap: 4px; margin: 0; padding: 10px 6px; background: #F6F8F5; border: 1.5px solid #D8E8DC; border-radius: 12px; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x proximity; }
.mdb-items::-webkit-scrollbar { display: none; }
.mdb-items li { display: contents; }
.mdb-split { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.75rem; padding: 1.5rem 1.5rem 4rem; }
.mdb-row2 { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.85rem; }
.mdb-ship { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
@media (min-width: 560px) { .mdb-row2 { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
@media (min-width: 900px) {
  .mdb-split { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 2.5rem; padding-top: 2rem; padding-bottom: 5rem; }
  .mdb-side { position: sticky; top: 84px; align-self: start; }
}
`;

/* ------------------------------------------------ Bundles — عروض الأطقم --- */
const __bfmt = (n: number, c: string) => `${Number(n || 0).toLocaleString()} ${c}`;

function BundlesStrip({ store }: any) {
  const sc = __k.useBundleScroll ? __k.useBundleScroll() : null; // أسهم التمرير
  const list: any[] = store?.bundles || [];
  if (!list.length) return null;
  const currency = store?.currency || 'DZD';
  const bt = __k.bundleStrings(getLang(store));
  const title = store?.design?.bundlesTitle;
  const heading = title === null || title === undefined ? bt.title : String(title).trim();
  const arrow = (d: boolean): React.CSSProperties => ({ width: 38, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1.5px solid ${d ? '#D8E8DC' : '#2D6A4F'}`, background: d ? '#fff' : '#2D6A4F', color: d ? '#566B59' : '#fff', cursor: d ? 'default' : 'pointer', padding: 0, opacity: d ? 0.5 : 1, transition: 'all 0.18s' });
  return (
    <section data-mds-bundles="" aria-label={heading || bt.title} style={{ padding: '3rem 0 0' }}>
      <style>{__BCSS}</style>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 4, height: 28, background: '#2D6A4F', borderRadius: 2 }} />
        {heading && <h2 style={{ fontSize: 'clamp(1.375rem,3.5vw,2rem)', fontWeight: 800, color: '#1A2E1F', margin: 0 }}>{heading}</h2>}
        <div style={{ flex: 1 }} />
        {sc?.show && (
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ d: sc.atStart, on: sc.prev, label: sc.labels.prev, left: sc.prevLeft }, { d: sc.atEnd, on: sc.next, label: sc.labels.next, left: !sc.prevLeft }].map((a, i) => (
              <button key={i} type="button" aria-label={a.label} disabled={a.d} onClick={a.on} style={arrow(a.d)}>
                {a.left ? <ChevronLeft size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>
      <div ref={sc?.ref} data-bundle-track="" className={`mdb-track ${list.length === 1 ? 'one' : ''}`}>
        {list.map((b) => (
          <article key={b.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1.5px solid #D8E8DC', borderRadius: 12, overflow: 'hidden' }}>
            <a {...__k.bundleLink(b.slug)} aria-label={b.name} style={{ position: 'relative', display: 'block', aspectRatio: '16 / 8', overflow: 'hidden', background: '#F6F8F5' }}>
              {(b.imageUrl || b.mobileImageUrl) && (
                <picture>
                  {b.mobileImageUrl && <source media="(max-width: 640px)" srcSet={b.mobileImageUrl} />}
                  <img loading="lazy" decoding="async" src={b.imageUrl || b.mobileImageUrl} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                </picture>
              )}
              <span style={{ position: 'absolute', top: 10, insetInlineStart: 10, background: '#2D6A4F', color: '#fff', fontWeight: 800, fontSize: '0.78rem', padding: '3px 9px', borderRadius: 6 }}><bdi dir="ltr">-{b.discountPercent}%</bdi></span>
              <span style={{ position: 'absolute', top: 10, insetInlineEnd: 10, background: 'rgba(0,0,0,0.65)', color: '#fff', fontWeight: 700, fontSize: '0.74rem', padding: '3px 9px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Package size={12} aria-hidden="true" /><bdi dir="ltr">×{b.items.length}</bdi></span>
            </a>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, lineHeight: 1.45, color: '#1A2E1F' }}>{b.name}</p>
                {b.subtitle && <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#566B59' }}>{b.subtitle}</p>}
              </div>
              <ul className="mdb-items">
                {b.items.map((it: any, i: number) => (
                  <li key={it.productId}>
                    {i > 0 && <span aria-hidden="true" style={{ color: '#2D6A4F', fontWeight: 900, paddingTop: 14 }}>+</span>}
                    <span style={{ flex: '1 0 76px', minWidth: 76, scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
                      {it.imageUrl ? <img loading="lazy" decoding="async" src={it.imageUrl} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, background: '#fff', border: '1.5px solid #D8E8DC', display: 'block' }} /> : <span style={{ width: 50, height: 50, borderRadius: 8, background: '#fff', border: '1.5px solid #D8E8DC', display: 'block' }} />}
                      <span style={{ fontSize: '0.68rem', color: '#566B59', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{it.name}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span  style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A2E1F', whiteSpace: 'nowrap' }}>{__bfmt(b.price, currency)}</span>
                <span  style={{ fontSize: '0.78rem', color: '#566B59', textDecoration: 'line-through', whiteSpace: 'nowrap' }}>{__bfmt(b.original, currency)}</span>
                <span style={{ marginInlineStart: 'auto', fontSize: '0.74rem', fontWeight: 700, color: '#2D6A4F' }}>{bt.save} {__bfmt(b.saving, currency)}</span>
              </div>
              <a {...__k.bundleLink(b.slug)} style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#2D6A4F', color: '#fff', fontWeight: 700, fontSize: '0.92rem', padding: '0.8rem 1.25rem', borderRadius: 12, textDecoration: 'none' }}>{bt.order}</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BundlePage({ store, bundle, domain }: any) {
  const t = withLocationLabels(T)[getLang(store)];
  const currency = store?.currency || 'DZD';
  const o = __k.useBundleOrder({ bundle, store, domain, validPhone: isValidDzPhone });
  const bt = o.t;
  const L = (...ks: string[]) => { for (const k of ks) if ((t as any)[k]) return (t as any)[k] as string; return ''; };
  const banner = bundle.imageUrl || bundle.mobileImageUrl;
  const inp = (err?: boolean): React.CSSProperties => ({ width: '100%', padding: '0.8rem 1rem', background: '#fff', border: `1.5px solid ${err ? '#DC2626' : '#D8E8DC'}`, borderRadius: 12, fontSize: '0.9rem', color: '#1A2E1F', outline: 'none', appearance: 'none' as any, fontFamily: 'inherit' });
  const label = (txt: string, id: string) => <label htmlFor={id} style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: '#566B59' }}>{txt}</label>;
  const errLine = (msg?: string) => (msg ? <p style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '6px 0 0', fontSize: '0.74rem', color: '#E63946' }}><AlertCircle size={12} aria-hidden="true" /> {msg}</p> : null);
  const cap: React.CSSProperties = { margin: '0 0 12px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1A2E1F' };
  const row = (l: string, v: React.ReactNode, strong?: boolean) => <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '0.35rem 0', fontSize: strong ? '1rem' : '0.85rem', fontWeight: strong ? 800 : 500, color: strong ? '#1A2E1F' : '#566B59' }}><span>{l}</span><span >{v}</span></div>;
  return (
    <div dir={t.dir}>
      <style>{__BCSS}</style>
      {banner && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12, background: '#F6F8F5' }}>
            <picture>
              {bundle.mobileImageUrl && <source media="(max-width: 640px)" srcSet={bundle.mobileImageUrl} />}
              <img fetchPriority="high" decoding="async" src={banner} alt={bundle.name} style={{ display: 'block', width: '100%', height: 'clamp(200px, 40vw, 460px)', objectFit: 'cover' }} />
            </picture>
            <span style={{ position: 'absolute', top: 14, insetInlineStart: 14, background: '#2D6A4F', color: '#fff', fontWeight: 800, fontSize: '0.85rem', padding: '5px 11px', borderRadius: 8 }}><bdi dir="ltr">-{bundle.discountPercent}%</bdi></span>
          </div>
        </div>
      )}

      <div className="mdb-split">
        <div style={{ minWidth: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: '0.78rem', fontWeight: 700, color: '#2D6A4F' }}><Package size={13} aria-hidden="true" /> {bt.inBundle} · <bdi dir="ltr">×{o.products.length}</bdi></span>
          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', fontWeight: 800, lineHeight: 1.3, color: '#1A2E1F' }}>{bundle.name}</h1>
          {bundle.subtitle && <p style={{ margin: '0 0 14px', color: '#566B59' }}>{bundle.subtitle}</p>}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', background: '#F6F8F5', border: '1.5px solid #D8E8DC', borderRadius: 12, padding: '0.9rem 1rem', margin: '0 0 1.5rem' }}>
            <span  style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2D6A4F' }}>{__bfmt(o.price, currency)}</span>
            <span  style={{ color: '#566B59', textDecoration: 'line-through' }}>{__bfmt(o.original, currency)}</span>
            <span style={{ marginInlineStart: 'auto', fontSize: '0.82rem', fontWeight: 700, color: '#2D6A4F' }}>{bt.saved} {__bfmt(o.saving, currency)}</span>
          </div>

          <p style={cap}>{bt.inBundle}</p>
          <div id="bundle-items" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {o.products.map((p: any) => {
              const img = __k.bundleProductImage(p);
              return (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr)', gap: 14, background: '#fff', border: '1.5px solid #D8E8DC', borderRadius: 12, padding: 14 }}>
                  {img ? <img loading="lazy" decoding="async" src={img} alt="" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 8, background: '#F6F8F5', display: 'block' }} /> : <span style={{ width: 84, height: 84, borderRadius: 8, background: '#F6F8F5', display: 'block' }} />}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.5, color: '#1A2E1F' }}>{p.name}</p>
                    <span  style={{ display: 'inline-block', marginTop: 4, fontWeight: 800, color: '#2D6A4F' }}>{__bfmt(o.priceOf(p), currency)}</span>
                    {o.attrsOf(p).map((a: any) => (
                      <div key={a.id} style={{ marginTop: 12 }}>
                        <p style={{ margin: '0 0 6px', fontSize: '0.74rem', fontWeight: 700, color: '#566B59' }}>{a.name}</p>
                        <div role="group" aria-label={`${a.name} — ${p.name}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {a.variants.map((v: any, i: number) => {
                            const sel = o.chosen(p, a.name) === v.value;
                            const kind = __k.optionKind(a, v.value);
                            if (kind === 'image') return <button key={v.id} type="button" aria-pressed={sel} aria-label={`${a.name} ${i + 1}`} onClick={() => o.pick(p.id, a.name, v.value)} style={{ width: 52, height: 52, padding: 0, overflow: 'hidden', borderRadius: 8, border: `2px solid ${sel ? '#2D6A4F' : '#D8E8DC'}`, background: '#F6F8F5', cursor: 'pointer' }}><img src={__k.optionImage(v)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>;
                            if (kind === 'color') return <button key={v.id} type="button" aria-pressed={sel} aria-label={v.name || v.value} title={v.name} onClick={() => o.pick(p.id, a.name, v.value)} style={{ width: 32, height: 32, borderRadius: '50%', background: v.value, border: `2px solid ${sel ? '#2D6A4F' : '#D8E8DC'}`, outline: sel ? '2px solid #2D6A4F' : 'none', outlineOffset: 1, cursor: 'pointer' }} />;
                            return <button key={v.id} type="button" aria-pressed={sel} onClick={() => o.pick(p.id, a.name, v.value)} style={{ minHeight: 40, padding: '0.45rem 0.9rem', borderRadius: 8, fontFamily: 'inherit', border: `1.5px solid ${sel ? '#2D6A4F' : '#D8E8DC'}`, background: sel ? '#2D6A4F' : '#fff', color: sel ? '#fff' : '#1A2E1F', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.18s' }}>{v.name || v.value}</button>;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {o.errors.options && errLine(o.errors.options)}
        </div>

        <div className="mdb-side" style={{ minWidth: 0 }}>
          <form id="bundle-form" onSubmit={o.submit} noValidate style={{ background: '#fff', border: '1.5px solid #D8E8DC', borderTop: '3px solid #2D6A4F', borderRadius: 12, padding: '1.1rem' }}>
            <p style={cap}>{L('checkoutTitle')}</p>
            <div className="mdb-row2" style={{ marginBottom: '0.85rem' }}>
              <div>
                {label(L('fullName'), 'crb-name')}
                <input id="crb-name" type="text" value={o.form.name} onChange={(e) => o.setName(e.target.value)} placeholder={L('fullNamePh','fullNamePlaceholder')} autoComplete="name" style={inp(!!o.errors.name)} />
                {errLine(o.errors.name)}
              </div>
              <div>
                {label(L('phone'), 'crb-phone')}
                <input id="crb-phone" type="tel" inputMode="tel" dir="ltr" value={o.form.phone} onChange={(e) => o.setPhone(e.target.value)} placeholder={L('phonePh','phonePlaceholder')} autoComplete="tel" style={inp(!!o.errors.phone)} />
                {errLine(o.errors.phone)}
              </div>
            </div>
            {!o.digital && (
              <>
                <div className="mdb-row2" style={{ marginBottom: '0.85rem' }}>
                  <div>
                    {label(L('wilaya'), 'crb-wilaya')}
                    <div style={{ position: 'relative' }}>
                      <ChevronDown size={12} aria-hidden="true" style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', color: '#566B59', pointerEvents: 'none' }} />
                      <select id="crb-wilaya" value={o.form.wilaya} onChange={(e) => o.chooseWilaya(e.target.value)} style={{ ...inp(!!o.errors.wilaya), paddingInlineEnd: 36, fontFamily: 'inherit' }}>
                        <option value="">{L('wilayaPh','wilayaPlaceholder')}</option>
                        {o.wilayas.map((w: any) => <option key={w.id} value={w.id}>{w.code ?? w.id} - {o.placeName(w)}</option>)}
                      </select>
                    </div>
                    {errLine(o.errors.wilaya)}
                  </div>
                  <div>
                    {label(L('commune'), 'crb-commune')}
                    <div style={{ position: 'relative' }}>
                      <ChevronDown size={12} aria-hidden="true" style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', color: '#566B59', pointerEvents: 'none' }} />
                      <select id="crb-commune" disabled={!o.form.wilaya || o.loadingCommunes} value={o.form.commune} onChange={(e) => o.setCommune(e.target.value)} style={{ ...inp(!!o.errors.commune), paddingInlineEnd: 36, fontFamily: 'inherit', opacity: (!o.form.wilaya || o.loadingCommunes) ? 0.55 : 1 }}>
                        <option value="">{o.loadingCommunes ? t.communeLoading : t.communePh}</option>
                        {o.communes.map((c: any) => <option key={c.id} value={c.id}>{o.placeName(c)}</option>)}
                      </select>
                    </div>
                    {errLine(o.errors.commune)}
                  </div>
                </div>
                {o.form.wilaya && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ ...cap, margin: '0 0 6px', fontSize: '0.75rem' }}>{L('delivery')}</p>
                    <div className="mdb-ship">
                      {(['home', 'office'] as const).map((type) => {
                        const active = o.form.ship === type;
                        const cost = o.shipCost(type);
                        return (
                          <button data-delivery-option key={type} type="button" onClick={() => o.setShip(type)} style={{ padding: '0.8rem', border: `1.5px solid ${active ? '#2D6A4F' : '#D8E8DC'}`, borderRadius: 12, background: active ? '#F6F8F5' : '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.18s' }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: active ? '#2D6A4F' : '#566B59' }}>{type === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                            {cost !== null && <p  style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: 800, color: active ? '#1A2E1F' : '#566B59' }}>{__bfmt(cost, currency)}</p>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
            <div style={{ background: '#F6F8F5', border: '1.5px solid #D8E8DC', borderRadius: 12, padding: '0.9rem 1rem', marginBottom: '1rem' }}>
              <p style={{ ...cap, margin: '0 0 6px' }}>{L('orderInfo','orderSummary')}</p>
              {row(bt.original, __bfmt(o.original, currency))}
              {row(bt.bundlePrice, __bfmt(o.price, currency))}
              {row(bt.saved, __bfmt(o.saving, currency))}
              {!o.digital && row(t.delivery, o.wilaya ? __bfmt(o.ship, currency) : '—')}
              {row(t.total, __bfmt(o.total, currency), true)}
            </div>
            <button type="submit" disabled={o.submitting} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#2D6A4F', color: '#fff', fontWeight: 700, fontSize: '0.95rem', padding: '0.9rem 1.5rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: o.submitting ? 0.7 : 1 }}>{o.submitting ? L('sending') : bt.order}</button>
            <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: '0.74rem', color: '#566B59' }}>{bt.cod}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
// صفحة الطقم للمتجر
export const Bundle = BundlePage;
export function Home({ store, page }: any) {
  const lang = getLang(store); const t = withLocationLabels(T)[lang]; const isRTL = lang === 'ar';
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);
  const trustIcons = [<Truck size={16} key={0} />, <Shield size={16} key={1} />, <Leaf size={16} key={2} />, <Heart size={16} key={3} />];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#E8F5EE', minHeight: 'clamp(380px, 52vh, 600px)', display: 'flex', alignItems: 'center', borderBottom: `1px solid rgba(45,106,79,0.12)` }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, background: 'rgba(82,183,136,0.18)', borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 240, height: 240, background: 'rgba(45,106,79,0.1)', borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%' }} />
        {store.hero?.imageUrl && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '38%', overflow: 'hidden' }}>
            <img onError={(e) => { e.currentTarget.style.display = 'none'; }} src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', width: '100%', padding: 'clamp(3.5rem,7vw,6rem) 1.5rem' }}>
          <div className="hero-inner">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(45,106,79,0.1)', border: `1px solid rgba(45,106,79,0.22)`, borderRadius: 20, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
                <Leaf size={12} style={{ color: G }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: G }}>{t.heroBadge}</span>
              </div>
              <h1 style={{ fontSize: 'clamp(2.25rem,5.5vw,4.5rem)', fontWeight: 700, color: GD, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1rem' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || t.heroTitleDef) }} />
              <p style={{ fontSize: '1rem', color: SUB, lineHeight: 1.8, marginBottom: '2rem', maxWidth: 440 }}>
                {store.hero?.subtitle || t.heroSubtitleDef}
              </p>
              <div className="hero-actions">
                <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `linear-gradient(135deg, ${G} 0%, ${GA} 100%)`, color: '#fff', fontWeight: 600, fontSize: '0.9rem', padding: '0.875rem 1.875rem', borderRadius: 12, transition: 'opacity 0.18s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.88')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}>
                  {t.heroBrowse} <ArrowLeft size={15} />
                </a>
                {store?.cart !== false && (
                  <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: SUB, fontWeight: 500, fontSize: '0.9rem', padding: '0.875rem 1.5rem', borderRadius: 12, border: `1px solid ${BD}`, background: CARD, transition: 'all 0.18s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = G; (e.currentTarget as HTMLAnchorElement).style.color = G; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = BD; (e.currentTarget as HTMLAnchorElement).style.color = SUB; }}>
                    {t.cart}
                  </Link>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '2rem' }}>
                {t.heroBadges.map((b: string, i: number) => (
                  <span key={i} style={{ fontSize: '0.72rem', color: G, background: 'rgba(45,106,79,0.09)', border: `1px solid rgba(45,106,79,0.2)`, borderRadius: 20, padding: '0.3rem 0.75rem' }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST ROW */}
      <section style={{ padding: '1.5rem', maxWidth: 1280, margin: '0 auto' }}>
        <div className="trust-row">
          {t.trust.map((item: any, i: number) => (
            <div key={i} style={{ flex: 1, minWidth: 160, padding: '1rem 1.25rem', background: CARD, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 38, height: 38, background: GL, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G, flexShrink: 0 }}>{trustIcons[i]}</div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: INK }}>{item.t}</p>
                <p style={{ fontSize: '0.68rem', color: SUB }}>{item.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BundlesStrip store={store} />

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <section style={{ padding: '1rem 1.5rem 2rem', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 28, height: 28, background: GL, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={13} color={G} />
            </div>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: INK }}>{t.catTitle}</h2>
          </div>
          <div className="cats-grid">
            <Link href="?" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0.75rem', border: `1px solid ${!activeCategory ? G : BD}`, borderRadius: 14, background: !activeCategory ? GL : CARD, textAlign: 'center', transition: 'all 0.2s' }}>
              <div style={{ width: 38, height: 38, background: GL, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={17} color={G} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: !activeCategory ? GD : INK, lineHeight: 1.3 }}>{t.all}</span>
            </Link>
              {cats.map((cat: any) => {
              const isActive = activeCategory === String(cat.id);
              return (
              <Link key={cat.id} href={`?category=${cat.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0.75rem', border: `1px solid ${isActive ? G : BD}`, borderRadius: 14, background: isActive ? GL : CARD, textAlign: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = GA; el.style.background = GL; el.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = isActive ? G : BD; el.style.background = isActive ? GL : CARD; el.style.transform = ''; }}>
                <div style={{ width: 38, height: 38, background: GL, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={17} color={G} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isActive ? GD : INK, lineHeight: 1.3 }}>{cat.name}</span>
              </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" style={{ padding: '0 1.5rem 5rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 28, height: 28, background: GL, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={13} color={G} />
            </div>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: INK }}>{t.prodTitle}</h2>
          </div>
          {store.count > 0 && <span style={{ fontSize: '0.72rem', color: SUB, background: GL, padding: '0.25rem 0.75rem', borderRadius: 20 }}>{store.count} {t.prodUnit}</span>}
        </div>
        {products.length === 0 ? (
          <div style={{ padding: '5rem 1.5rem', textAlign: 'center', border: `1px dashed ${BD}`, borderRadius: 16, background: CARD }}>
            <Package size={36} color={GB} style={{ display: 'block', margin: '0 auto 1rem' }} />
            <p style={{ color: SUB, fontSize: '0.875rem' }}>{t.prodNone}</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} />;
            })}
          </div>
        )}
        {countPage > 1 && (
          <div className="pagination" dir={isRTL ? 'rtl' : 'ltr'}>
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false} style={{ height: 36, padding: '0 0.875rem', borderRadius: 20, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', background: CARD, color: SUB, fontSize: '0.8rem' }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ height: 36, padding: '0 0.875rem', borderRadius: 20, display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${isA ? G : BD}`, background: isA ? G : CARD, color: isA ? '#fff' : SUB }}>{pn}</Link>;
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false} style={{ height: 36, padding: '0 0.875rem', borderRadius: 20, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', background: CARD, color: SUB, fontSize: '0.8rem' }}>❯</Link>
          </div>
        )}
      </section>
    </div>
  );
}

export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const lang = getLang(store); const t = withLocationLabels(T)[lang]; const isRTL = lang === 'ar';
  const [sel, setSel] = useState(0);
  // اللون المربوط بصورة: اختياره يعرض صورته، والضغط على الصورة (أو الأسهم) يختار لونها
  useEffect(() => {
    const idx = imageIndexForSelection(product?.attributes, selectedVariants || {}, allImages);
    if (idx >= 0) setSel(idx);
  }, [selectedVariants]); // eslint-disable-line react-hooks/exhaustive-deps
  const showImage = (next: number | ((p: number) => number)) => {
    const idx = typeof next === 'function' ? next(sel) : next;
    setSel(idx);
    const v = variantForImage(product?.attributes, allImages[idx]);
    if (v && selectedVariants?.[v.name] !== v.value) handleVariantSelection(v.name, v.value);
  };
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: BG, paddingBottom: '4rem' }}>
      <div className="details-inner" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="gallery-container">
          <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#EBF4EE', borderRadius: 20, border: `1px solid ${BD}` }}>
            {allImages[sel] ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={48} color={GB} /></div>}
            {discount > 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: `linear-gradient(135deg, ${G}, ${GA})`, color: '#fff', padding: '3px 10px', fontSize: 11, fontWeight: 700, borderRadius: 20 }}>{discount}% {t.discountBadge}</div>}
            {allImages.length > 1 && (
              <>
                <button onClick={() => showImage(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BD}`, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK }}><ChevronRight size={15} /></button>
                <button onClick={() => showImage(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BD}`, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK }}><ChevronLeft size={15} /></button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="thumb-row">
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => showImage(idx)} style={{ flexShrink: 0, width: 56, height: 56, border: `2px solid ${sel === idx ? G : BD}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'none', opacity: sel === idx ? 1 : 0.55, transition: 'all 0.15s' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="info-container">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: GL, borderRadius: 20, padding: '0.3rem 0.875rem', marginBottom: '0.75rem' }}>
              <Leaf size={11} color={G} /><span style={{ fontSize: '0.65rem', fontWeight: 600, color: G }}>{t.natural100}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 700, color: INK, marginBottom: '0.5rem', lineHeight: 1.2 }}>{product.name}</h1>
            <div style={{ display: 'flex', gap: 2, marginBottom: '1.25rem' }}>{[...Array(5)].map((_, i) => <Star key={i} size={13} style={{ fill: i < 4 ? GA : 'none', color: GA }} />)}</div>
            <div style={{ padding: '1.25rem', background: GL, borderRadius: 14, border: `1px solid rgba(45,106,79,0.15)`, marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, color: SUB, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.priceLabel}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                <span className="price-mono" style={{ fontSize: '2.5rem', fontWeight: 700, color: G }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: SUB }}>{store?.currency || 'DZD'}</span>
              </div>
            </div>
            {(product.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', border: `1px solid ${G}`, borderRadius: 12, background: GL, fontSize: '0.8rem', fontWeight: 600, color: G }}>
                🚚 {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', `${Number(store.freeShippingMinAmount).toLocaleString()} ${store?.currency || 'DZD'}`)}
              </div>
            )}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', border: `1.5px solid ${selectedOffer === o.id ? G : BD}`, borderRadius: 12, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? GL : CARD, transition: 'all 0.18s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? G : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedOffer === o.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: G }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontWeight: 600, color: INK, fontSize: '0.875rem' }}>{o.name}</p>
                        {o.subTitle && <p style={{ fontSize: '0.7rem', color: SUB }}>{o.subTitle}</p>}
                        <p style={{ fontSize: '0.7rem', color: SUB }}>{t.qtyOfferLabel} {o.quantity}</p>
                        {o.shippingFree && <p style={{ fontSize: '0.7rem', color: G, fontWeight: 600 }}>🚚 {t.freeShippingBadge}</p>}
                      </div>
                    </div>
                    <span className="price-mono" style={{ fontWeight: 700, color: G }}>{o.price.toLocaleString()} {store?.currency || 'DZD'}</span>
                  </label>
                ))}
              </div>
            )}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '1.125rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{attr.name}{__colorName(attr, selectedVariants)}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {attr.variants.map((v: any) => {
                    const isSel = selectedVariants[attr.name] === v.value;
                    const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={
                        attr.displayMode === 'color' ? { width: 28, height: 28, borderRadius: '50%', background: v.value, border: `2px solid ${BD}`, cursor: available ? 'pointer' : 'not-allowed', outline: `2.5px solid ${isSel ? G : 'transparent'}`, outlineOffset: 2, opacity: available ? 1 : 0.35 }
                        : attr.displayMode === 'image' ? { width: 64, height: 64, backgroundImage: `url(${v.value})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 8, border: `3px solid ${isSel ? G : BD}`, boxShadow: isSel ? `0 0 0 2px #fff, 0 0 0 4px ${G}` : 'none', cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35 }
                        : { padding: '0.4rem 0.875rem', border: `1.5px solid ${isSel ? G : BD}`, borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, background: isSel ? GL : CARD, color: isSel ? G : (available ? SUB : '#bbb'), cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.15s', fontFamily: 'inherit', textDecoration: available ? 'none' : 'line-through' }
                      }>{attr.displayMode !== 'color' && attr.displayMode !== 'image' && v.name}</button>
                    );
                  })}
                </div>
              </div>
            ))}
            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} store={store} />
            {product.desc && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${BD}` }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.85, color: SUB }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
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
    {label && <p style={{ fontSize: '0.7rem', fontWeight: 600, color: SUB, marginBottom: '0.35rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store }: ProductFormProps) {
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const lang = getLang(store); const t = withLocationLabels(T)[lang];
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office', customerEmail: '', customerWhatsapp: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [orderNowState, setIsOrderNow] = useState(false);
  // بدون سلة: نموذج الطلب يظهر مباشرة (لا حاجة لزر «اطلب الآن»)
  const isOrderNow = orderNowState || (store ?? product?.store)?.cart === false;
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId, product?.store?.id).then(setWilayas); }, [userId]);
  // ولاية واحدة فقط في حساب الشحن: تُختار تلقائياً (والحقل مقفل)
  useEffect(() => { if (wilayas.length === 1) setFd((p: any) => (String(p.customerWelaya) === String(wilayas[0].id) ? p : { ...p, customerWelaya: String(wilayas[0].id), customerCommune: '' })); }, [wilayas]); // onlyOneWilaya
  // نوع التوصيل غير متاح في الولاية المختارة ← ينتقل للنوع المتاح
  useEffect(() => { if (!deliveryAllowed(wilayas, fd.customerWelaya, fd.typeLivraison === 'office' ? 'office' : 'home', communes, fd.customerCommune)) setFd((p: any) => ({ ...p, typeLivraison: p.typeLivraison === 'office' ? 'home' : 'office' })); }, [wilayas, fd.customerWelaya, fd.typeLivraison, communes, fd.customerCommune]); // deliveryTypeGuard
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
  const fp = getFP() + addonsTotal(product, addonIds);
  const supportQty = (store?.supportQty ?? product?.store?.supportQty) !== false;
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = product.offers?.find((o: any) => o.id === selectedOffer);
  const orderFreeShipping = !!(product.shippingFree || selOfferObj?.shippingFree ||
    (store?.supportFreeShipping && store?.freeShippingMinAmount != null && (fp * qty) >= Number(store.freeShippingMinAmount)));
  const getLiv = useCallback((): number => {
    if (product.isDigital) return 0;
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return Number(fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping, product.isDigital]);
  const total = () => fp * qty + getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = t.errRequired;
    if (!fd.customerPhone.trim() || !isValidDzPhone(fd.customerPhone.trim())) e.customerPhone = t.errPhoneInvalid;
    if (product.isDigital) {
      if (String(fd.customerEmail ?? '').trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.customerEmail.trim())) e.customerEmail = t.errEmail;
      } if (String(fd.customerWhatsapp ?? '').trim()) {
        if (!isValidDzPhone(fd.customerWhatsapp.trim())) e.customerWhatsapp = t.errWhatsapp;
      }
    } else {
      if (!fd.customerWelaya) e.customerWelaya = t.errRequired;
      if (!fd.customerCommune) e.customerCommune = t.errRequired;
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
    cart.push({ addonIds, ...fd, quantity: qty, product, variantDetailId: getVarId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now() });
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
        ? { ...rest, ...({ ...(String(customerEmail ?? '').trim() ? { customerEmail } : {}), ...(String(customerWhatsapp ?? '').trim() ? { customerWhatsapp } : {}) }) }
        : { ...rest, customerWelaya, customerCommune, typeLivraison, priceLoss };
      await axios.post(`${API_URL}/orders/create`, { addonIds, ...payload, quantity: qty, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`${window.location.origin}/successfully?productId=${product.id}`);
    } catch { } finally { setSub(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${BD}` }}>
  <ProductAddons product={product} store={store || product.store} selected={addonIds} onChange={setAddonIds} accent="#2D6A4F" />
        {product.store.cart && !product.isDigital && (
        <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
          <button data-add-to-cart onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.8rem 1rem', border: `1.5px solid ${isAdded ? '#22C55E' : BD}`, borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: isAdded ? 'rgba(34,197,94,0.05)' : CARD, color: isAdded ? '#22C55E' : SUB, transition: 'all 0.18s', fontFamily: 'inherit' }}>
            {isAdded ? <><CheckCircle2 size={14} className="anim-check" />{t.addedShort}</> : <><ShoppingCart size={14} />{t.addBtn}</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} style={{ flex: 1, ...S.btnPrimary, width: 'auto', borderRadius: 12 }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = GD)}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = G)}>
            {t.orderNow}
          </button>
        </div>
      )}
      {(isOrderNow || !product.store.cart || product.isDigital) && (
        <div className="anim-fade-up">
          {product.store.cart && !product.isDigital && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.7rem', color: SUB, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.delivDataTitle}</p>
              {orderNowState && (<button onClick={() => setIsOrderNow(false)} style={{ fontSize: '0.78rem', color: SUB, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t.cancelLabel}</button>)}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.customerName} label={t.nameLabel}><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullName} style={inp(!!errors.customerName)} /></FR>
              <FR error={errors.customerPhone} label={t.phoneLabel}><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} style={inp(!!errors.customerPhone)} /></FR>
            </div>
            {product.isDigital ? (
              <div style={{ marginBottom: '0.875rem' }}>
                <>
                  <FR error={errors.customerEmail} label={t.orderEmail}>
                    <input type="email" dir="ltr" value={fd.customerEmail} onChange={e => setFd({ ...fd, customerEmail: e.target.value })} placeholder={t.emailPh} style={inp(!!errors.customerEmail)} />
                  </FR>
                  <FR error={errors.customerWhatsapp} label={t.whatsapp}>
                    <input type="tel" dir="ltr" value={fd.customerWhatsapp} onChange={e => setFd({ ...fd, customerWhatsapp: e.target.value })} placeholder={t.whatsappPh} style={inp(!!errors.customerWhatsapp)} />
                  </FR>
                </>
              </div>
            ) : (
              <>
                <div className="form-row-2">
                  <FR error={errors.customerWelaya} label={t.wilaya}>
                    <div style={{ position: 'relative' }}>
                      <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                      <select value={fd.customerWelaya} disabled={wilayas.length === 1} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.customerWelaya), paddingRight: 32, fontFamily: 'inherit' }}>
                        <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.code ?? w.id} - {w.ar_name}</option>)}
                      </select>
                    </div>
                  </FR>
                  <FR error={errors.customerCommune} label={t.commune}>
                    <div style={{ position: 'relative' }}>
                      <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                      <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingRight: 32, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                        <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                      </select>
                    </div>
                  </FR>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.deliveryType}</p>
                  <div className="delivery-grid">
                    {(['home', 'office'] as const).filter((dt) => deliveryShown(wilayas, fd.customerWelaya, dt, communes, fd.customerCommune)).map(type => (
                      <button data-delivery-option key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))} style={{ padding: '0.75rem', border: `1.5px solid ${fd.typeLivraison === type ? G : BD}`, borderRadius: 12, textAlign: 'start', cursor: 'pointer', background: fd.typeLivraison === type ? GL : CARD, transition: 'all 0.18s', fontFamily: 'inherit' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 3, color: fd.typeLivraison === type ? G : SUB }}>{type === 'home' ? t.homeBtn : t.officeBtn}</p>
                        {selW && <p className="price-mono" style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === type ? G : SUB }}>{orderFreeShipping ? t.freeShippingBadge : `${Number(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} ${store?.currency || 'DZD'}`}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {supportQty && !product.isDigital && (
              <div style={{ marginBottom: '0.875rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.qty}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: `1.5px solid ${BD}`, borderRadius: 12, overflow: 'hidden', background: CARD }}>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: SUB, borderLeft: `1px solid ${BD}` }}><Minus size={12} /></button>
                  <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: INK }}>{fd.quantity}</span>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: G, borderRight: `1px solid ${BD}` }}><Plus size={12} /></button>
                </div>
              </div>
            )}
            <div style={{ background: GL, borderRadius: 14, border: `1px solid rgba(45,106,79,0.15)`, padding: '1rem 1.125rem', marginBottom: '1rem' }}>
              {[
                { l: t.productLabel, v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
                { l: t.qty, v: `× ${qty}` },
                ...(product.isDigital ? [] : [{ l: t.delivery, v: !selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${store?.currency || 'DZD'}` }]),
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid rgba(45,106,79,0.12)` }}>
                  <span style={{ fontSize: '0.78rem', color: SUB }}>{r.l}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: INK }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: INK }}>{t.totalMaj}</span>
                <span className="price-mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: G }}>{total().toLocaleString()} <span style={{ fontSize: '0.75rem' }}>{store?.currency || 'DZD'}</span></span>
              </div>
            </div>
            <button type="submit" disabled={sub} style={{ ...S.btnPrimary, opacity: sub ? 0.7 : 1 }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = GD)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = G)}>
              {sub ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />{t.processing}</> : t.confirmOrder}
            </button>
          </form>
        </div>
      )}
      <WhatsAppOrderButton product={product} store={store} />
    </div>
  );
}

export function Cart({ domain, store }: { domain: string; store: any }) {
  const lang = getLang(store); const t = withLocationLabels(T)[lang]; const isRTL = lang === 'ar';
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); if (store?.user?.id) fetchWilayas(store.user.id, store?.id).then(setWilayas); }, [domain, store]);
  // ولاية واحدة فقط في حساب الشحن: تُختار تلقائياً (والحقل مقفل)
  useEffect(() => { if (wilayas.length === 1) setFd((p: any) => (String(p.customerWelaya) === String(wilayas[0].id) ? p : { ...p, customerWelaya: String(wilayas[0].id), customerCommune: '' })); }, [wilayas]); // onlyOneWilaya
  // نوع التوصيل غير متاح في الولاية المختارة ← ينتقل للنوع المتاح
  useEffect(() => { if (!deliveryAllowed(wilayas, fd.customerWelaya, fd.typeLivraison === 'office' ? 'office' : 'home', communes, fd.customerCommune)) setFd((p: any) => ({ ...p, typeLivraison: p.typeLivraison === 'office' ? 'home' : 'office' })); }, [wilayas, fd.customerWelaya, fd.typeLivraison, communes, fd.customerCommune]); // deliveryTypeGuard
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const cartTotal = items.reduce((a, i) => a + (i.finalPrice * i.quantity), 0);

  const hasFreeShippingItem = items.some((it) => it.product?.shippingFree || it.product?.offers?.find((o: any) => o.id === it.selectedOffer)?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;

  const getLiv = () => {
    if (freeShippingReached) return 0;
    if (!selW) return 0;
    return Number(fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice);
  };
  const finalTotal = cartTotal + getLiv();
  const update = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!fd.customerName.trim()) er.name = t.errRequired;
    if (!fd.customerPhone.trim() || !isValidDzPhone(fd.customerPhone.trim())) er.phone = t.errPhoneInvalid;
    if (!fd.customerWelaya) er.w = t.errRequired;
    if (!fd.customerCommune) er.c = t.errRequired;
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({ addonIds: i.addonIds, ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  if (success) return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', background: CARD, padding: '3rem 2rem', borderRadius: 20, border: `1px solid ${BD}`, maxWidth: 440, width: '100%' }}>
        <CheckCircle2 size={48} style={{ color: G, display: 'block', margin: '0 auto 1.25rem' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: INK, marginBottom: '0.5rem' }}>{t.cartSuccessTitle}</h2>
        <p style={{ color: SUB, lineHeight: 1.75, marginBottom: '2rem', fontSize: '0.9rem' }}>{t.cartSuccessDesc}</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg, ${G}, ${GA})`, color: '#fff', padding: '0.75rem 2rem', fontWeight: 600, fontSize: '0.875rem', borderRadius: 12 }}>{t.backToStore}</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: `1px solid ${BD}`, borderRadius: 20, maxWidth: 400, width: '100%', background: CARD }}>
        <ShoppingBag size={44} style={{ color: GB, display: 'block', margin: '0 auto 1.25rem' }} />
        <p style={{ color: SUB, fontSize: '0.9rem', marginBottom: '2rem' }}>{t.cartEmpty}</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg, ${G}, ${GA})`, color: '#fff', padding: '0.75rem 1.875rem', fontWeight: 600, fontSize: '0.875rem', borderRadius: 12 }}>{t.shopNow}</Link>
      </div>
    </div>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto', minHeight: '100vh', background: BG }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ width: 32, height: 32, background: GL, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingCart size={15} color={G} />
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem,5vw,2.25rem)', fontWeight: 700, color: INK }}>{t.cartTitle}</h1>
      </div>
      {freeShippingMin != null && (
        <div style={{
          border: `1px solid ${freeShippingReached ? G : BD}`, borderRadius: 14,
          background: freeShippingReached ? GL : CARD, padding: '0.875rem 1.125rem', marginBottom: '1.5rem',
          color: freeShippingReached ? G : SUB, fontSize: '0.85rem', fontWeight: 600,
        }}>
          {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', `${Number(freeShippingRemainingAmt).toLocaleString()} ${store?.currency || 'DZD'}`)}
        </div>
      )}
      <div className="cart-inner">
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, alignSelf: 'start', overflow: 'hidden' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem 1rem', borderBottom: `1px solid ${BD}` }}>
              <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 68, height: 68, objectFit: 'cover', flexShrink: 0, borderRadius: 10, border: `1px solid ${BD}` }} alt="" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, color: INK, marginBottom: '0.3rem', fontSize: '0.875rem', lineHeight: 1.4 }}>{item.product?.name}</h4>
                <p className="price-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: G }}>{item.finalPrice?.toLocaleString()} {store?.currency || 'DZD'}</p>
                <p style={{ fontSize: '0.68rem', color: SUB, marginTop: '0.15rem' }}>{t.qtyInCart} {item.quantity}</p>
              </div>
              <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ color: GB, padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', transition: 'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#DC2626')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = GB)}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <div style={{ padding: '1rem', background: GL, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: SUB, fontSize: '0.875rem' }}>{t.subtotal}</span>
            <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: G }}>{cartTotal.toLocaleString()} {store?.currency || 'DZD'}</span>
          </div>
        </div>
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: '1.75rem', alignSelf: 'start' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: INK, marginBottom: '1.5rem' }}>{t.delivInfoTitle}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.name} label={t.nameLabel}><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={inp(!!errors.name)} /></FR>
              <FR error={errors.phone} label={t.phoneLabel}><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={inp(!!errors.phone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.w} label={t.wilaya}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} disabled={wilayas.length === 1} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.w), paddingRight: 30, fontFamily: 'inherit' }}>
                    <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.code ?? w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label={t.commune}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingRight: 30, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ margin: '1rem 0' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: SUB, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{t.deliveryType}</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).filter((dt) => deliveryShown(wilayas, fd.customerWelaya, dt, communes, fd.customerCommune)).map(type => (
                  <button data-delivery-option key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))} style={{ padding: '0.75rem', border: `1.5px solid ${fd.typeLivraison === type ? G : BD}`, borderRadius: 12, textAlign: 'start', cursor: 'pointer', background: fd.typeLivraison === type ? GL : CARD, fontFamily: 'inherit', transition: 'all 0.18s' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.8rem', color: fd.typeLivraison === type ? G : SUB, marginBottom: 3 }}>{type === 'home' ? t.homeBtn : t.officeBtn}</p>
                    {selW && <p style={{ fontWeight: 700, fontSize: '0.95rem', color: fd.typeLivraison === type ? G : SUB }}>{freeShippingReached ? t.freeShippingBadge : `${Number(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} ${store?.currency || 'DZD'}`}</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: GL, borderRadius: 14, border: `1px solid rgba(45,106,79,0.15)`, padding: '1rem', margin: '1rem 0' }}>
              {[{ l: t.subtotal, v: `${cartTotal.toLocaleString()} ${store?.currency || 'DZD'}` }, { l: t.delivery, v: !selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${store?.currency || 'DZD'}` }].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid rgba(45,106,79,0.12)` }}>
                  <span style={{ fontSize: '0.78rem', color: SUB }}>{r.l}</span>
                  <span style={{ fontWeight: 600, color: INK }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, color: INK }}>{t.finalTotalLabel}</span>
                <span className="price-mono" style={{ fontSize: '1.875rem', fontWeight: 700, color: G }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.75rem' }}>{store?.currency || 'DZD'}</span></span>
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = GD)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = G)}>
              {submitting ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />{t.processing}</> : t.confirmOrder}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const t = withLocationLabels(T)[getLang(store)];
  const currency = store?.currency || 'DZD';
  const stepIcons = [CheckCircle2, Phone, Package, Truck];

  return (
    <div dir={t.dir} style={{ minHeight: '100vh', background: BG, padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', background: CARD, padding: '3rem 2rem', borderRadius: 16, border: `1px solid ${BD}`, marginBottom: '1.5rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: GB, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle2 size={30} style={{ color: GD }} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: INK, marginBottom: '0.5rem' }}>{t.successTitle}</h2>
          <p style={{ color: SUB, lineHeight: 1.7 }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.75rem', color: INK, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${BD}`, fontSize: 14, fontWeight: 700, color: INK }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: SUB }}>{t.total}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: GD }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, overflow: 'hidden', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? CheckCircle2;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? `1px solid ${BD}` : 'none', background: done ? BG : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? G : BG, color: done ? '#fff' : SUB }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: done ? INK : SUB, marginBottom: 2 }}>{step.title}</p>
                  <p style={{ fontSize: '0.76rem', color: SUB }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: G, color: '#fff', padding: '0.875rem 2rem', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
            <ShoppingBag size={17} /> {t.shopNow}
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', borderRadius: 12, border: `1px solid ${BD}`, color: SUB, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

const Shell = ({ children, title, store }: { children: React.ReactNode; title: string; store?: any }) => {
  const isRTL = getLang(store) === 'ar';
  return (
  <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: BG }}>
    <div style={{ background: GD, paddingTop: 88, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(82,183,136,0.15)', border: '1px solid rgba(82,183,136,0.3)', borderRadius: 20, padding: '0.3rem 0.875rem', marginBottom: '1rem' }}>
          <Leaf size={12} style={{ color: GA }} /><span style={{ fontSize: '0.68rem', fontWeight: 600, color: GA }}>Nature Wellness</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2.25rem,6vw,3.5rem)', fontWeight: 700, color: '#fff' }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>{children}</div>
  </div>
  );
};

const InfoBlock = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding: '1.125rem 0', borderBottom: `1px solid ${BD}`, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
    <div style={{ width: 28, height: 28, background: GL, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
      <Leaf size={13} color={G} />
    </div>
    <div>
      <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: INK, marginBottom: '0.35rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: SUB }}>{body}</p>
    </div>
  </div>
);

export function Privacy({ store }: { store?: any }) {
  const t = withLocationLabels(T)[getLang(store)];
  return (
    <Shell title={t.privacyTitle} store={store}>
      <div style={{ background: CARD, padding: '1.5rem', borderRadius: 16, border: `1px solid ${BD}` }}>
        <InfoBlock title={t.privacyData} body={t.privacyDataBody} />
        <InfoBlock title={t.privacyProtect} body={t.privacyProtectBody} />
        <InfoBlock title={t.privacyShare} body={t.privacyShareBody} />
      </div>
    </Shell>
  );
}

export function Terms({ store }: { store?: any }) {
  const t = withLocationLabels(T)[getLang(store)];
  return (
    <Shell title={t.termsTitle} store={store}>
      <div style={{ background: CARD, padding: '1.5rem', borderRadius: 16, border: `1px solid ${BD}` }}>
        <InfoBlock title={t.termsAccount} body={t.termsAccountBody} />
        <InfoBlock title={t.termsOrders} body={t.termsOrdersBody} />
        <InfoBlock title={t.termsLaw} body={t.termsLawBody} />
      </div>
    </Shell>
  );
}

export function Cookies({ store }: { store?: any }) {
  const t = withLocationLabels(T)[getLang(store)];
  return (
    <Shell title={t.cookiesTitle} store={store}>
      <div style={{ background: CARD, padding: '1.5rem', borderRadius: 16, border: `1px solid ${BD}` }}>
        <InfoBlock title={t.cookiesEssential} body={t.cookiesEssentialBody} />
        <InfoBlock title={t.cookiesExp} body={t.cookiesExpBody} />
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const lang = getLang(store); const t = withLocationLabels(T)[lang]; const isRTL = lang === 'ar';
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
    catch { showError(t.contactErrMsg); } finally { setLoading(false); }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: BG, minHeight: '100vh' }}>
      <div style={{ background: GD, paddingTop: 88, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
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
<div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(82,183,136,0.15)', border: '1px solid rgba(82,183,136,0.3)', borderRadius: 20, padding: '0.3rem 0.875rem', marginBottom: '1rem' }}>
            <Leaf size={12} style={{ color: GA }} /><span style={{ fontSize: '0.68rem', fontWeight: 600, color: GA }}>Nature Wellness</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem,6vw,3.5rem)', fontWeight: 700, color: '#fff' }}>{t.contactSect}</h1>
        </div>
      </div>
      <div className="contact-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        <div>
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: '1.25rem', marginBottom: '1rem' }}>
            {[
              { icon: <Phone size={14} />, label: t.phoneLabel, val: store?.contact?.phone || '—' },
              { icon: <MapPin size={14} />, label: t.contactLocLabel, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || '—' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: i === 0 ? '1rem' : 0 }}>
                <div style={{ width: 36, height: 36, background: GL, border: `1px solid rgba(45,106,79,0.15)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G, flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <p style={{ fontSize: '0.62rem', color: SUB, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.1rem' }}>{r.label}</p>
                  <p style={{ fontWeight: 600, color: INK, fontSize: '0.875rem' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: GL, borderRadius: 12, border: `1px solid rgba(45,106,79,0.15)`, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: GA, display: 'inline-block' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: G }}>{t.contactReply}</span>
          </div>
        </div>
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <CheckCircle2 size={48} style={{ color: G, display: 'block', margin: '0 auto 1.25rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: INK, marginBottom: '0.5rem' }}>{t.contactSentTitle}</h2>
              <p style={{ color: SUB, lineHeight: 1.75, marginBottom: '2rem', fontSize: '0.9rem' }}>{t.contactSentDesc}</p>
              <button onClick={() => setSent(false)} style={{ padding: '0.7rem 1.875rem', border: `1px solid ${G}`, borderRadius: 12, background: GL, color: G, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}>{t.contactAnotherBtn}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                <FR label={t.nameLabel}><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={S.input} /></FR>
                <FR label={t.phoneLabel}><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={S.input} /></FR>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <FR label={t.emailLabel}><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={S.input} /></FR>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <FR label={t.msgLabel}><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...S.input, resize: 'none' }} /></FR>
              </div>
              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = GD)}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = G)}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />{t.sending}</> : <>{t.sendBtn} <ArrowLeft size={15} /></>}
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
