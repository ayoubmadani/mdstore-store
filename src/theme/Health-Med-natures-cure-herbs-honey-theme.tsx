'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, ToggleRight, ArrowLeft,
  Plus, Minus, CheckCircle2, Lock, Menu, Package,
  Truck, Shield, Search, ShoppingCart,
  Trash2, Loader2, Phone, MapPin, Mail, Activity, Zap, User,
  Leaf, Flower2, Droplets, MessageCircle, Download,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0; }
  html { scroll-behavior:smooth; }

  :root {
    --green:   #2D5A27;
    --green-2: #3D6B37;
    --green-lt:#F0F5EE;
    --gold:    #C9952C;
    --gold-2:  #B8860B;
    --gold-lt: #FDF8EE;
    --cream:   #FDFBF7;
    --beige:   #F5F0E8;
    --brown:   #2C1810;
    --warm:    #8B7355;
    --tan:     #E8DCC8;
    --white:   #FFFFFF;
    --mid:     #5C4A3A;
    --dim:     #A09280;
    --line:    #E8DCC8;
    --red:     #C0392B;
    --amber:   #C9952C;
    --emerald: #4A7C59;
  }

  body { background:var(--cream); color:var(--brown); font-family:'Inter',sans-serif; }
  a    { text-decoration:none; color:inherit; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:var(--gold); border-radius:2px; }

  .pd { font-family:'Playfair Display',serif; }

  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fi { animation:fadeIn 0.5s ease both; }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin   { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  .anim-check { animation:check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  .p-card {
    background:var(--white); border:1px solid var(--tan); border-radius:16px;
    overflow:hidden; transition:all 0.3s; cursor:pointer;
    display:flex; flex-direction:column;
  }
  .p-card:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(45,90,39,0.08); border-color:var(--gold); }

  .cat-card {
    position:relative; overflow:hidden; border-radius:16px;
    border:1px solid var(--tan); background:var(--white);
    cursor:pointer; display:block; transition:all 0.3s;
  }
  .cat-card:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(45,90,39,0.1); }
  .cat-card:hover img { transform:scale(1.04); }
  .cat-card img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.35s ease; }

  .btn-primary {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--green); color:white;
    font-family:'Playfair Display',serif; font-size:14px; font-weight:700;
    padding:12px 28px; border:none; cursor:pointer; border-radius:12px;
    transition:all 0.2s;
  }
  .btn-primary:hover { background:var(--green-2); transform:translateY(-1px); box-shadow:0 4px 20px rgba(45,90,39,0.25); }
  .btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

  .btn-outline {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:transparent; color:var(--green);
    font-family:'Playfair Display',serif; font-size:14px; font-weight:700;
    padding:12px 28px; border:1.5px solid var(--green); cursor:pointer; border-radius:12px;
    transition:all 0.2s;
  }
  .btn-outline:hover { background:var(--green-lt); }

  .inp {
    width:100%; padding:12px 14px;
    background:var(--white); border:1.5px solid var(--tan);
    font-family:'Inter',sans-serif; font-size:14px; color:var(--brown);
    outline:none; border-radius:10px; transition:border-color 0.2s,box-shadow 0.2s;
  }
  .inp:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,149,44,0.1); }
  .inp::placeholder { color:var(--dim); }
  select.inp { appearance:none; cursor:pointer; }

  .ticker-stripe { overflow:hidden; white-space:nowrap; }
  .ticker-inner  { display:inline-block; animation:ticker 28s linear infinite; }

  .prod-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  .cat-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .trust-row { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g  { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; }
  .details-g { display:grid; grid-template-columns:1fr 1fr; gap:40px; }
  .contact-g { display:grid; grid-template-columns:1fr 1fr; gap:48px; }
  .form-2c   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c    { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cart-layout { display:grid; grid-template-columns:1.2fr 1fr; gap:40px; align-items:start; }
  .thumb-row { display:flex; gap:8px; flex-wrap:wrap; }
  .pagination { display:flex; justify-content:center; gap:6px; margin-top:40px; flex-wrap:wrap; }

  .nav-search-d { display:none; }

  .how-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }

  @media (min-width:1024px) { .nav-search-d { display:block; } }

  @media (max-width:1024px) {
    .prod-grid { grid-template-columns:repeat(3,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:32px; }
    .how-grid  { grid-template-columns:repeat(2,1fr); }
  }
  @media (max-width:768px) {
    .prod-grid { grid-template-columns:1fr; gap:12px; }
    .cat-grid  { grid-template-columns:repeat(2,1fr); }
    .trust-row { grid-template-columns:repeat(2,1fr); }
    .footer-g  { grid-template-columns:1fr; gap:28px; }
    .details-g { grid-template-columns:1fr; }
    .contact-g { grid-template-columns:1fr; gap:24px; }
    .cart-layout { grid-template-columns:1fr; }
    .how-grid  { grid-template-columns:1fr; }
  }
  @media (max-width:480px) {
    .form-2c { grid-template-columns:1fr; }
    .dlv-2c  { grid-template-columns:1fr; }
  }
`;

interface Offer { id: string; name: string; quantity: number; price: number; subTitle?: string; shippingFree?: boolean; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color'|'image'|'text'|null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color'|'image'|'text'; value: string; }
interface VariantDetail { id: string|number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
export interface Product {
  id: string; name: string; price: string|number; priceOriginal?: string|number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; shippingFree?: boolean; isDigital?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string|null; setSelectedOffer: (id: string|null) => void;
  selectedVariants: Record<string,string>; platform?: string; priceLoss?: number;
  store?: any;
}

const vm = (d: VariantDetail, s: Record<string,string>) =>
  Object.entries(s).every(([n,v]) => d.name.some(e => e.attrName===n && e.value===v));

const fetchWilayas  = async (uid: string): Promise<Wilaya[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }
};
const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }
};

const INP_S = (err?: boolean): React.CSSProperties => ({
  width:'100%', padding:'12px 14px', background:'var(--white)',
  border:`1.5px solid ${err?'#ef4444':'var(--tan)'}`,
  fontFamily:"'Inter',sans-serif", fontSize:'14px', color:'var(--brown)',
  outline:'none', borderRadius:'10px', transition:'border-color 0.2s'
});

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom:'14px' }}>
    {label && <p className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--warm)', marginBottom:'6px', textAlign:'start' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize:'12px', color:'#ef4444', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px', justifyContent:'flex-start' }}>
      <AlertCircle style={{ width:'12px', height:'12px' }} />{error}
    </p>}
  </div>
);

function HerbLeaf({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style} // تمرير الـ style هنا هو ما سيجعل اللون يتغير
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}


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
  orderEmail: 'البريد الإلكتروني',
  emailPh: 'example@email.com',
  errEmail: 'يرجى إدخال بريد إلكتروني صحيح',
  whatsapp: 'رقم واتساب',
  whatsappPh: '0550123456',
  errWhatsapp: 'رقم واتساب جزائري صحيح مطلوب (مثال: 0550123456)',
  contactQuestion: 'هل تملك بريداً إلكترونياً أم واتساب؟',
  contactViaEmail: 'البريد الإلكتروني',
  contactViaWhatsapp: 'واتساب',
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
  stat3V: 'موثوق',
  heroBadge: 'متجر الأعشاب الطبية #1 في الجزائر',
  heroTitle: 'قوة <span style="color:var(--green)">الطبيعة</span><br/>في منتجاتنا',
  heroSubtitle: 'أجود أنواع الأعشاب الطبية، العسل الطبيعي، والمكملات العضوية. منتجات أصلية من أحضان الطبيعة.',
  shopNowBtn: 'تسوق الآن', catsBtn: 'الأقسام',
  stat1L: 'منتج طبيعي', stat2L: 'عضوي', stat3L: 'من الطبيعة', stat4L: 'توصيل سريع',
  trust1T: 'منتجات عضوية', trust1D: 'طبيعية 100%',
  trust2T: 'عسل نقي', trust2D: 'غير مغشوش',
  trust3T: 'أعشاب طبية', trust3D: 'منتقات يدوياً',
  trust4T: 'توصيل سريع', trust4D: '48 ساعة',
  catsSub: 'أقسامنا', catsTitle: 'تصفح حسب <span style="color:var(--green)">المنتج</span>',
  productsSub: 'المنتجات', productsTitle: 'جميع <span style="color:var(--green)">المنتجات</span>',
  productUnit: 'منتج', viewDetails: 'عرض التفاصيل',
  whySub: 'لماذا نحن', whyTitle: '<span style="color:var(--green)">طبيعة</span> نقية، جودة عالية',
  why1T: 'منتجات عضوية', why1D: 'جميع منتجاتنا طبيعية 100% بدون إضافات',
  why2T: 'عسل نقي', why2D: 'عسل طبيعي غير مغشوش من أفضل المناحل',
  why3T: 'جودة موثوقة', why3D: 'نخضع منتجاتنا لفحوصات الجودة الدورية',
  why4T: 'توصيل مجاني', why4D: 'للطلبات فوق 3000 دج إلى جميع الولايات',
  ctaTitle: 'ابدأ رحلتك مع <span style="color:var(--gold)">الطبيعة</span>',
  ctaDesc: 'اكتشف قوة العلاج الطبيعي. أعشاب طبية، عسل نقي، ومكملات عضوية.',
  ctaBtn: 'تسوق الآن', ctaContact: 'استشرنا',
  footerTagline: '🌿 شفاء طبيعي — أعشاب طبية، عسل طبيعي، ومكملات عضوية 100%',
  footerDelivery: 'توصيل سريع وآمن إلى جميع الولايات',
  footerLinks: 'روابط سريعة', footerContact: 'معلومات الاتصال',
  footerTeam: 'فريق من المعالجين بالأعشاب', footerReply: 'نرد خلال 24 ساعة',
  contactSub: 'تواصل معنا', contactHeading: 'تواصل <span style="color:var(--green)">معنا</span>',
  contactReply: 'فريق الدعم يجيب خلال 24 ساعة',
  contactInfoTitle: 'معلومات الاتصال',
  contactPhone: 'الهاتف', contactLocation: 'الموقع', contactMail: 'البريد',
  contactPower: 'قوة الطبيعة.', contactIn: 'في كل منتج.',
  contactSendTitle: 'أرسل رسالة',
  contactSentTitle: 'تم إرسال الرسالة!', contactSentDesc: 'سنرد عليك خلال 24 ساعة.',
  contactNameLabel: 'الاسم', contactPhoneLabel: 'الهاتف', contactEmailLabel: 'البريد الإلكتروني', contactMsgLabel: 'رسالتك',
  contactMsgPh: 'كيف يمكننا مساعدتك؟', contactSending: 'جاري...', contactSendBtn: 'إرسال الرسالة',
  privacyTitle: 'سياسة الخصوصية', privacySub: 'الشؤون القانونية',
  privacy1T: 'البيانات التي نجمعها', privacy1D: 'فقط اسمك ورقم هاتفك وعنوان التوصيل — الحد الأدنى المطلوب لمعالجة طلبك.',
  privacy2T: 'كيف نستخدمها', privacy2D: 'حصرياً لتنفيذ وشحن طلبك. لا نستخدمها للتسويق أو بيع البيانات.',
  privacy3T: 'الأمان', privacy3D: 'بياناتك محمية بتشفير عالي المستوى ومؤمنة في جميع الأوقات.',
  privacy4T: 'مشاركة البيانات', privacy4D: 'لا نبيع بياناتك أبداً. تُشارك فقط مع شركاء التوصيل الموثوقين.', privacy4Tag: 'مضمون',
  termsTitle: 'شروط الخدمة', termsSub: 'الشؤون القانونية',
  terms1T: 'الطلبات', terms1D: 'لا توجد رسوم خفية. السعر المعروض هو السعر النهائي.',
  terms2T: 'المنتجات الأصيلة', terms2D: 'نبيع المنتجات الطبيعية الأصيلة فقط؛ المنتجات المغشوشة ممنوعة منعاً باتاً.', terms2Tag: 'صارم',
  terms3T: 'القانون المعمول به', terms3D: 'تخضع هذه الشروط لقوانين الجمهورية الجزائرية الديمقراطية الشعبية.',
  cookiesTitle: 'سياسة ملفات الارتباط', cookiesSub: 'الشؤون القانونية',
  cookies1T: 'ملفات الارتباط الأساسية', cookies1D: 'مطلوبة للجلسات والسلة وإتمام الشراء. لا يمكن تعطيلها.', cookies1Tag: 'مطلوب',
  cookies2T: 'ملفات ارتباط التحليلات', cookies2D: 'بيانات مجمعة لتحسين المنصة. لا تتضمن بيانات شخصية.', cookies2Tag: 'اختياري',
  cookiesNote: 'يمكنك إدارة أو حذف ملفات الارتباط من إعدادات المتصفح الخاص بك في أي وقت.',
  deliveryInfo: 'بيانات التوصيل', cancel: 'إلغاء',
  homeLabel: '🏠 للبيت', officeLabel: '🏢 للمكتب',
  orderSummary: 'ملخص الطلب', productLabel: 'المنتج',
  processingOrder: 'جاري المعالجة...', deleteBtn: 'حذف',
  addedText: 'أُضيف للسلة', namePh: 'اسمك الكامل', cartTitle: 'سلة التسوق',
  securePay: 'آمن', fastDelivery: 'توصيل سريع', natural: 'طبيعي',
  productInfo: 'معلومات المنتج',
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
  orderEmail: 'E-mail',
  emailPh: 'exemple@email.com',
  errEmail: 'Veuillez saisir une adresse e-mail valide',
  whatsapp: 'Numéro WhatsApp',
  whatsappPh: '0550123456',
  errWhatsapp: 'Numéro WhatsApp algérien valide requis (ex: 0550123456)',
  contactQuestion: 'Avez-vous un e-mail ou un numéro WhatsApp ?',
  contactViaEmail: 'E-mail',
  contactViaWhatsapp: 'WhatsApp',
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
  stat3V: 'Certifié',
  heroBadge: 'La boutique n°1 d\'herbes médicinales en Algérie',
  heroTitle: 'La puissance de <span style="color:var(--green)">la nature</span><br/>dans nos produits',
  heroSubtitle: 'Les meilleures herbes médicinales, miel naturel et compléments biologiques. Produits authentiques de la nature.',
  shopNowBtn: 'Acheter maintenant', catsBtn: 'Catégories',
  stat1L: 'produits naturels', stat2L: 'biologique', stat3L: 'de la nature', stat4L: 'livraison rapide',
  trust1T: 'Produits biologiques', trust1D: '100% naturels',
  trust2T: 'Miel pur', trust2D: 'Non altéré',
  trust3T: 'Herbes médicinales', trust3D: 'Cueillies à la main',
  trust4T: 'Livraison rapide', trust4D: '48 heures',
  catsSub: 'Nos catégories', catsTitle: 'Parcourir par <span style="color:var(--green)">produit</span>',
  productsSub: 'Produits', productsTitle: 'Tous les <span style="color:var(--green)">produits</span>',
  productUnit: 'produit', viewDetails: 'Voir les détails',
  whySub: 'Pourquoi nous', whyTitle: 'Nature <span style="color:var(--green)">pure</span>, haute qualité',
  why1T: 'Produits biologiques', why1D: 'Tous nos produits sont 100% naturels sans additifs',
  why2T: 'Miel pur', why2D: 'Miel naturel non altéré des meilleures ruches',
  why3T: 'Qualité certifiée', why3D: 'Nos produits subissent des contrôles qualité réguliers',
  why4T: 'Livraison gratuite', why4D: 'Pour les commandes supérieures à 3000 DZD dans toutes les wilayas',
  ctaTitle: 'Commencez votre voyage avec <span style="color:var(--gold)">la Nature</span>',
  ctaDesc: 'Découvrez le pouvoir de la guérison naturelle. Herbes médicinales, miel pur et compléments biologiques.',
  ctaBtn: 'Acheter maintenant', ctaContact: 'Nous consulter',
  footerTagline: '🌿 Guérison naturelle — Herbes médicinales, miel naturel et compléments 100% biologiques',
  footerDelivery: 'Livraison rapide et sécurisée dans toutes les wilayas',
  footerLinks: 'Liens rapides', footerContact: 'Informations de contact',
  footerTeam: 'Équipe de thérapeutes en herbes', footerReply: 'Réponse sous 24 heures',
  contactSub: 'Contactez-nous', contactHeading: 'Contactez <span style="color:var(--green)">nous</span>',
  contactReply: "L'équipe d'assistance répond sous 24 heures",
  contactInfoTitle: 'Informations de contact',
  contactPhone: 'Téléphone', contactLocation: 'Localisation', contactMail: 'E-mail',
  contactPower: 'Le pouvoir de la Nature.', contactIn: 'Dans chaque produit.',
  contactSendTitle: 'Envoyer un message',
  contactSentTitle: 'Message envoyé !', contactSentDesc: 'Nous vous répondrons sous 24 heures.',
  contactNameLabel: 'Nom', contactPhoneLabel: 'Téléphone', contactEmailLabel: 'E-mail', contactMsgLabel: 'Votre message',
  contactMsgPh: 'Comment pouvons-nous vous aider ?', contactSending: 'Envoi...', contactSendBtn: 'Envoyer le message',
  privacyTitle: 'Politique de confidentialité', privacySub: 'Affaires juridiques',
  privacy1T: 'Données collectées', privacy1D: 'Uniquement votre nom, numéro de téléphone et adresse de livraison — le minimum requis pour traiter votre commande.',
  privacy2T: 'Comment nous les utilisons', privacy2D: 'Exclusivement pour traiter et expédier votre commande. Pas utilisé pour le marketing ou la vente de données.',
  privacy3T: 'Sécurité', privacy3D: 'Vos données sont protégées par un chiffrement de haut niveau et sécurisées à tout moment.',
  privacy4T: 'Partage des données', privacy4D: 'Nous ne vendons jamais vos données. Partagées uniquement avec des partenaires de livraison de confiance.', privacy4Tag: 'Garanti',
  termsTitle: 'Conditions de service', termsSub: 'Affaires juridiques',
  terms1T: 'Commandes', terms1D: 'Pas de frais cachés. Le prix affiché est le prix final.',
  terms2T: 'Produits authentiques', terms2D: 'Nous vendons uniquement des produits naturels authentiques ; les contrefaçons sont strictement interdites.', terms2Tag: 'Strict',
  terms3T: 'Loi applicable', terms3D: 'Ces conditions sont régies par les lois de la République Algérienne Démocratique et Populaire.',
  cookiesTitle: 'Politique de cookies', cookiesSub: 'Affaires juridiques',
  cookies1T: 'Cookies essentiels', cookies1D: 'Requis pour les sessions, le panier et le paiement. Ne peuvent pas être désactivés.', cookies1Tag: 'Requis',
  cookies2T: 'Cookies analytiques', cookies2D: "Données agrégées pour améliorer la plateforme. N'inclut pas de données personnelles.", cookies2Tag: 'Optionnel',
  cookiesNote: 'Vous pouvez gérer ou supprimer les cookies depuis les paramètres de votre navigateur à tout moment.',
  deliveryInfo: 'Informations de livraison', cancel: 'Annuler',
  homeLabel: '🏠 À domicile', officeLabel: '🏢 Point relais',
  orderSummary: 'Récapitulatif', productLabel: 'Produit',
  processingOrder: 'Traitement en cours...', deleteBtn: 'Supprimer',
  addedText: 'Ajouté !', namePh: 'Votre nom complet', cartTitle: 'Mon Panier',
  securePay: 'Sécurisé', fastDelivery: 'Livraison rapide', natural: 'Naturel',
  productInfo: 'Informations produit',
};

const jsonEn = {
  dir: 'ltr',
  home: 'Home', contact: 'Contact', cart: 'Cart',
  search: 'Search...', searching: 'Searching...', noResults: 'No results', showAll: 'View all results →',
  all: 'All', noProducts: 'Coming soon', shopNow: 'Shop Now', searchResultsFor: 'Search results for:',
  fullName: 'Full Name', fullNamePh: 'Enter your name', errName: 'Name is required',
  phone: 'Phone Number', phonePh: '05xxxxxxxx', errPhone: 'Phone number is required', errPhoneInvalid: 'Invalid phone number',
  wilaya: 'Wilaya', errWilaya: 'Wilaya is required', wilayaPh: 'Choose Wilaya', wilayaNA: 'Delivery not available',
  commune: 'Commune', errCommune: 'Commune is required', communePh: 'Choose Commune', communeLoading: 'Loading...',
  deliveryType: 'Delivery Type', deliveryHome: 'Home Delivery', deliveryOffice: 'Post Office',
  qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total',
  subtotal: 'Subtotal', orderInfo: 'Order Info',
  addToCart: 'Add to Cart', orderNow: 'Order Now', confirmOrder: 'Confirm Order',
  sending: 'Sending...', back: 'Back', addedMsg: 'Added to cart!', errSubmit: 'An error occurred',
  orderEmail: 'Email', emailPh: 'example@email.com', errEmail: 'Please enter a valid email address',
  whatsapp: 'WhatsApp number', whatsappPh: '0550123456', errWhatsapp: 'A valid Algerian WhatsApp number is required (e.g. 0550123456)',
  contactQuestion: 'Do you have an email or a WhatsApp number?', contactViaEmail: 'Email', contactViaWhatsapp: 'WhatsApp',
  myCart: 'My Cart', cartEmpty: 'Cart is empty', cartEmptyDesc: 'You have not added any products yet',
  successTitle: 'Order sent!', successDesc: 'We will contact you soon',
  backToShop: 'Back to Shopping', checkoutTitle: 'Complete Order',
  successSteps: [
    { title: 'Order received', desc: 'Your order has been registered successfully' },
    { title: 'Confirmation', desc: "We'll call you within 24 hours" },
    { title: 'Packaging', desc: 'Your order is being prepared with care' },
    { title: 'Shipping', desc: '2-5 business days' },
  ],
  offersTitle: 'Available Offers', descTitle: 'Description',
  freeShippingBadge: 'Free Delivery',
  freeShippingThreshold: 'Free delivery on orders over {{amount}}',
  freeShippingRemaining: 'Add {{amount}} more to get free delivery',
  freeShippingReached: 'Congrats! You have free delivery 🎉',
  quickLinks: 'Quick Links', legalNav: 'Legal', contactSect: 'Contact Us', privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies', rightsReserved: 'All rights reserved',
  stat3V: 'Trusted',
  heroBadge: 'Algeria\'s #1 Herbal Medicine Store',
  heroTitle: 'The Power of <span style="color:var(--green)">Nature</span><br/>in Our Products',
  heroSubtitle: 'The finest medicinal herbs, natural honey, and organic supplements. Authentic products straight from nature.',
  shopNowBtn: 'Shop Now', catsBtn: 'Categories',
  stat1L: 'natural products', stat2L: 'organic', stat3L: 'from nature', stat4L: 'fast delivery',
  trust1T: 'Organic Products', trust1D: '100% natural',
  trust2T: 'Pure Honey', trust2D: 'Unadulterated',
  trust3T: 'Medicinal Herbs', trust3D: 'Hand-picked',
  trust4T: 'Fast Delivery', trust4D: '48 hours',
  catsSub: 'Our Categories', catsTitle: 'Browse by <span style="color:var(--green)">Product</span>',
  productsSub: 'Products', productsTitle: 'All <span style="color:var(--green)">Products</span>',
  productUnit: 'product', viewDetails: 'View Details',
  whySub: 'Why Us', whyTitle: 'Pure <span style="color:var(--green)">Nature</span>, High Quality',
  why1T: 'Organic Products', why1D: 'All our products are 100% natural without additives',
  why2T: 'Pure Honey', why2D: 'Unadulterated natural honey from the best apiaries',
  why3T: 'Trusted Quality', why3D: 'Our products undergo regular quality checks',
  why4T: 'Free Delivery', why4D: 'For orders above 3000 DZD to all wilayas',
  ctaTitle: 'Start your journey with <span style="color:var(--gold)">Nature</span>',
  ctaDesc: 'Discover the power of natural healing. Medicinal herbs, pure honey, and organic supplements.',
  ctaBtn: 'Shop Now', ctaContact: 'Consult Us',
  footerTagline: 'Natural Healing — Medicinal herbs, natural honey, and 100% organic supplements',
  footerDelivery: 'Fast and safe delivery to all wilayas',
  footerLinks: 'Quick Links', footerContact: 'Contact Information',
  footerTeam: 'Team of Herbal Practitioners', footerReply: 'We reply within 24 hours',
  contactSub: 'Contact Us', contactHeading: 'Contact <span style="color:var(--green)">Us</span>',
  contactReply: 'Support team responds within 24 hours',
  contactInfoTitle: 'Contact Information',
  contactPhone: 'Phone', contactLocation: 'Location', contactMail: 'Email',
  contactPower: 'The Power of Nature.', contactIn: 'In every product.',
  contactSendTitle: 'Send a message',
  contactSentTitle: 'Message sent!', contactSentDesc: 'We will reply within 24 hours.',
  contactNameLabel: 'Name', contactPhoneLabel: 'Phone', contactEmailLabel: 'Email', contactMsgLabel: 'Your message',
  contactMsgPh: 'How can we help you?', contactSending: 'Sending...', contactSendBtn: 'Send Message',
  privacyTitle: 'Privacy Policy', privacySub: 'Legal Affairs',
  privacy1T: 'Data We Collect', privacy1D: 'Only your name, phone number, and delivery address — the minimum required to process your order.',
  privacy2T: 'How We Use It', privacy2D: 'Exclusively for processing and shipping your order. Not used for marketing or data sales.',
  privacy3T: 'Security', privacy3D: 'Your data is protected by high-level encryption and secured at all times.',
  privacy4T: 'Data Sharing', privacy4D: 'We never sell your data. Shared only with trusted delivery partners.', privacy4Tag: 'Guaranteed',
  termsTitle: 'Terms of Service', termsSub: 'Legal Affairs',
  terms1T: 'Orders', terms1D: 'No hidden fees. The displayed price is the final price.',
  terms2T: 'Authentic Products', terms2D: 'We sell only authentic natural products; counterfeit products are strictly prohibited.', terms2Tag: 'Strict',
  terms3T: 'Applicable Law', terms3D: 'These terms are governed by the laws of the People\'s Democratic Republic of Algeria.',
  cookiesTitle: 'Cookie Policy', cookiesSub: 'Legal Affairs',
  cookies1T: 'Essential Cookies', cookies1D: 'Required for sessions, cart, and checkout. Cannot be disabled.', cookies1Tag: 'Required',
  cookies2T: 'Analytics Cookies', cookies2D: 'Aggregated data to improve the platform. Does not include personal data.', cookies2Tag: 'Optional',
  cookiesNote: 'You can manage or delete cookies from your browser settings at any time.',
  deliveryInfo: 'Delivery Info', cancel: 'Cancel',
  homeLabel: '🏠 Home', officeLabel: '🏢 Office',
  orderSummary: 'Order Summary', productLabel: 'Product',
  processingOrder: 'Processing...', deleteBtn: 'Delete',
  addedText: 'Added!', namePh: 'Your full name', cartTitle: 'My Cart',
  securePay: 'Secure', fastDelivery: 'Fast delivery', natural: 'Natural',
  productInfo: 'Product Information',
};

type Lang = 'ar' | 'fr' | 'en';
const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr, en: jsonEn };

export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--cream)' }}>
      <style>{CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

export function Navbar({ store, domain }: { store: any; domain: string }) {
  const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sq, setSq] = useState('');
  const [ls, setLs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { initCount(JSON.parse(localStorage.getItem(domain)||'[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (sq.length < 2) { setLs([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: sq } });
        setLs(data.products || []);
      } catch {} finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(timer);
  }, [sq, domain]);

  const doSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (sq.trim()) {
      router.push(`/?search=${encodeURIComponent(sq)}`);
      setSq('');
      setShowSearch(false);
    }
  };

  const SearchDrop = () => (
    <div style={{
      position:'absolute', top:'calc(100% + 4px)', right:0, left:0,
      background:'var(--white)', border:'1px solid var(--gold)', borderRadius:'12px',
      zIndex:200, overflow:'hidden', boxShadow:'0 12px 40px rgba(201,149,44,0.12)'
    }} className="fi">
      <div style={{ display:'flex', justifyContent:'flex-end', padding:'8px 12px 2px' }}>
        <button onClick={() => setSq('')} style={{
          background:'var(--gold-lt)', border:'none', borderRadius:'50%',
          width:24, height:24, display:'flex', alignItems:'center',
          justifyContent:'center', cursor:'pointer', color:'var(--gold)'
        }}><X size={12} /></button>
      </div>
      {loading ? (
        <div style={{ padding:'1.5rem', textAlign:'center', color:'var(--green)', fontFamily:"'Playfair Display',serif", fontWeight:600 }}>{t.searching}</div>
      ) : ls.length > 0 ? (
        <div style={{ maxHeight:'320px', overflowY:'auto' }}>
          {ls.map((p: any) => (
            <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSq('')} style={{
              display:'flex', alignItems:'center', gap:'0.75rem', padding:'10px 14px',
              borderBottom:'1px solid var(--tan)', textDecoration:'none'
            }}>
              <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                style={{ width:40, height:40, objectFit:'cover', flexShrink:0, borderRadius:'8px' }} alt="" />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'13px', fontWeight:600, color:'var(--brown)' }}>{p.name}</div>
                <div style={{ fontSize:'13px', color:'var(--gold)', fontWeight:700 }}>{p.price} دج</div>
              </div>
            </Link>
          ))}
          <button onClick={() => doSearch()} style={{
            width:'100%', padding:'10px', background:'var(--green-lt)', border:'none',
            borderTop:'1px solid var(--tan)', color:'var(--green)', fontWeight:700,
            fontSize:'12px', cursor:'pointer', fontFamily:"'Playfair Display',serif",
            display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'
          }}>
            {t.showAll}
          </button>
        </div>
      ) : sq.length >= 2 && (
        <div style={{ padding:'1.25rem', textAlign:'center', color:'var(--dim)', fontSize:'13px' }}>{t.noResults}</div>
      )}
    </div>
  );

  return (
    <header dir={isRTL ? 'rtl' : 'ltr'} style={{ position:'sticky', top:0, zIndex:100, fontFamily:"'Inter',sans-serif" }}>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="ticker-stripe" style={{ background:'var(--green)', padding:'5px 0' }}>
          <div className="ticker-inner">
            {Array(10).fill(null).map((_, i) => (
              <span key={i} style={{ fontSize:'11px', fontWeight:500, letterSpacing:'0.06em', color:'var(--cream)', margin:'0 30px' }}>
                <Leaf size={12} style={{ display:'inline', marginLeft:4, verticalAlign:'middle' }} /> {store.topBar.text} <Leaf size={12} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: scrolled ? 'rgba(253,251,247,0.97)' : 'var(--cream)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--gold)' : 'var(--tan)'}`,
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth:'1280px', margin:'0 auto', padding:'0 20px',
          height:'64px', display:'flex', alignItems:'center',
          justifyContent:'space-between', gap:'16px'
        }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            {(store.design?.logoUrl && store.design.logoUrl !== '/default-logo.png')
              ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'32px', width:'auto', objectFit:'contain', maxWidth: 160 }} />
              : <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <HerbLeaf size={24} />
                  <span className="pd" style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--green)' }}>
                    {store?.name || 'شفاء'}
                  </span>
                </div>
            }
          </Link>

          <div className="nav-search-d" style={{ flex:1, maxWidth:350, position:'relative' }}>
            <form onSubmit={doSearch}>
              <input type="text" placeholder={t.search} value={sq} onChange={e => setSq(e.target.value)}
                className="inp" style={{ padding:'9px 14px', fontSize:'13px' }} />
            </form>
            {sq.length >= 2 && <SearchDrop />}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
            <div className="hidden lg:flex" style={{ alignItems:'center', gap:'24px' }}>
              {[{ h:'/', l: t.home }, { h:'/contact', l: t.contact }].map(i => (
                <Link key={i.h} href={i.h} style={{
                  fontSize:'13px', fontWeight:600, color:'var(--warm)', transition:'color 0.2s'
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--warm)')}>
                  {i.l}
                </Link>
              ))}
            </div>

            <button onClick={() => setShowSearch(!showSearch)} className="lg:hidden"
              style={{ background:'none', border:'none', color:'var(--warm)', cursor:'pointer' }}>
              <Search size={20} />
            </button>

            {store?.cart === true && (
              <Link href="/cart" style={{ position:'relative', color:'var(--brown)', transition:'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--brown)')}>
                <ShoppingCart size={22} />
                {count > 0 && (
                  <span style={{
                    position:'absolute', top:-6, right:-8, background:'var(--gold)', color:'white',
                    fontSize:'10px', fontWeight:700, width:'17px', height:'17px',
                    borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    border:'2px solid var(--cream)'
                  }}>{count}</span>
                )}
              </Link>
            )}

            <button onClick={() => setOpen(!open)} className="lg:hidden"
              style={{
                background:'var(--green)', border:'none', color:'white', padding:'6px',
                borderRadius:'8px', cursor:'pointer'
              }}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {showSearch && (
        <div style={{ background:'var(--cream)', borderBottom:'1px solid var(--gold)', padding:'12px 20px', position:'relative', direction: isRTL ? 'rtl' : 'ltr' }} className="fi">
          <form onSubmit={doSearch}>
            <input autoFocus type="text" placeholder={t.search} value={sq} onChange={e => setSq(e.target.value)}
              className="inp" style={{ padding:'12px 14px' }} />
          </form>
          {sq.length >= 2 && <SearchDrop />}
        </div>
      )}

      <div className="block lg:hidden" style={{
        maxHeight: open ? '300px' : '0', overflow:'hidden',
        transition:'all 0.4s ease', backgroundColor:'var(--cream)',
        borderBottom: open ? '1px solid var(--gold)' : 'none'
      }}>
        <div style={{ padding:'15px 25px 25px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <Link href="/" onClick={() => setOpen(false)} style={{
              display:'flex', justifyContent:'space-between', padding:'12px 0',
              fontSize:'14px', fontWeight:600, color:'var(--brown)',
              borderBottom:'1px solid var(--tan)'
            }}>
              {t.home} <ArrowLeft size={14} style={{ color:'var(--gold)' }} />
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} style={{
              display:'flex', justifyContent:'space-between', padding:'12px 0',
              fontSize:'14px', fontWeight:600, color:'var(--brown)',
              borderBottom:'1px solid var(--tan)'
            }}>
              {t.contact} <ArrowLeft size={14} style={{ color:'var(--gold)' }} />
            </Link>
            <button onClick={() => { router.push('/#products'); setOpen(false); }}
              className="btn-primary" style={{ marginTop:'12px', width:'100%' }}>
              <HerbLeaf size={16} /> {t.shopNow}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer({ store }: any) {
  const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
  return (
    <footer dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor:'var(--brown)', color:'var(--cream)', fontFamily:"'Inter',sans-serif" }}>
      <div style={{
        background:'var(--green)', padding:'10px 0', textAlign:'center'
      }}>
        <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--cream)', letterSpacing:'0.04em' }}>
          {t.footerTagline}
        </p>
      </div>

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'48px 20px 32px' }}>
        <div className="footer-g" style={{ paddingBottom:'36px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <HerbLeaf size={22} />
              <span className="pd" style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--gold)' }}>
                {store?.name || 'شفاء'}
              </span>
            </div>
            <p style={{ fontSize:'13px', lineHeight:'1.7', color:'rgba(255,255,255,0.6)', maxWidth:'240px' }}>
              {store?.hero?.subtitle?.substring(0, 80) || t.heroSubtitle}
            </p>
            <div style={{ marginTop:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
              <Truck size={14} style={{ color:'var(--gold)' }} />
              <span style={{ fontSize:'12px', fontWeight:600, color:'var(--gold)' }}>{t.footerDelivery}</span>
            </div>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'24px' }}>
              &copy; {new Date().getFullYear()} {store?.name}. {t.rightsReserved}.
            </p>
          </div>

          <div>
            <p className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--gold)', marginBottom:'16px' }}>
              {t.footerLinks}
            </p>
            {[{ h:'/', l: t.home }, { h:'/cart', l: t.cart }, { h:'/contact', l: t.contact }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map(lnk => (
              <a key={lnk.h} href={lnk.h} style={{
                display:'block', fontSize:'13px', color:'rgba(255,255,255,0.6)',
                marginBottom:'8px', transition:'color 0.2s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                {lnk.l}
              </a>
            ))}
          </div>

          <div>
            <p className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--gold)', marginBottom:'16px' }}>
              {t.legalNav}
            </p>
            {[{ h:'/Privacy', l: t.privacy }, { h:'/Terms', l: t.terms }, { h:'/cookies', l: t.cookies }].map(lnk => (
              <a key={lnk.h} href={lnk.h} style={{
                display:'block', fontSize:'13px', color:'rgba(255,255,255,0.6)',
                marginBottom:'8px', transition:'color 0.2s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                {lnk.l}
              </a>
            ))}
          </div>

          <div>
            <p className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--gold)', marginBottom:'16px' }}>
              {t.footerContact}
            </p>
            {[
              { icon:'📞', val: store?.contact?.phone },
              { icon:'📍', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
              { icon:'✉️', val: store?.contact?.email },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'9px' }}>
                <span style={{ fontSize:'13px' }}>{r.icon}</span>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)' }}>{r.val}</span>
              </div>
            ))}
            <div style={{ marginTop:'14px', padding:'12px 14px', borderRadius:'10px', border:'1px solid var(--gold)', background:'rgba(201,149,44,0.08)' }}>
              <p className="pd" style={{ fontSize:'0.95rem', color:'var(--gold)', marginBottom:2 }}>{t.footerTeam}</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)' }}>{t.footerReply}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const cardLang = getLang(store); const cardRTL = cardLang === 'ar';
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="p-card" dir={cardRTL ? 'rtl' : 'ltr'}>
      <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'var(--beige)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <HerbLeaf size={40} style={{ color:'var(--dim)' }} />
            </div>
        }
        {discount > 0 && (
          <span className="pd" style={{
            position:'absolute', top:10, right:10, background:'var(--red)', color:'white',
            fontSize:'11px', fontWeight:700, padding:'2px 10px', borderRadius:'6px'
          }}>-{discount}%</span>
        )}
        {product.isDigital ? (
          <span className="pd" style={{
            position:'absolute', top:10, left:10, background:'var(--gold)', color:'white',
            fontSize:'11px', fontWeight:700, padding:'2px 10px', borderRadius:'6px',
            display:'flex', alignItems:'center'
          }}><Download size={12}/></span>
        ) : product.shippingFree && (
          <span className="pd" style={{
            position:'absolute', top:10, left:10, background:'var(--green)', color:'white',
            fontSize:'11px', fontWeight:700, padding:'2px 10px', borderRadius:'6px'
          }}>🚚</span>
        )}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'3px',
          background:'linear-gradient(90deg, var(--green), var(--gold))'
        }} />
      </div>
      <div style={{ padding:'14px', flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
        <h3 style={{
          fontSize:'14px', fontWeight:600, color:'var(--brown)', lineHeight:1.3,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'
        }}>
          {product.name}
        </h3>
        <div style={{ display:'flex', gap:'1px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} style={{ width:'11px', height:'11px', fill:i<4?'var(--amber)':'none', color:'var(--amber)' }} />
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:'6px', marginTop:'auto' }}>
          <span className="pd" style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--gold)' }}>{price.toLocaleString()}</span>
          <span style={{ fontSize:'11px', color:'var(--dim)' }}>دج</span>
          {orig > price && (
            <span style={{ fontSize:'11px', color:'var(--dim)', textDecoration:'line-through' }}>{orig.toLocaleString()}</span>
          )}
        </div>
        <Link href={`/product/${product.slug || product.id}`} className="btn-primary"
          style={{ width:'100%', fontSize:'12px', padding:'9px 14px', marginTop:'6px' }}>
          {viewDetails || 'عرض التفاصيل'}
        </Link>
      </div>
    </div>
  );
}

export function Home({ store, page }: any) {
  const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <section style={{
        position:'relative', overflow:'hidden',
        background:'linear-gradient(180deg, var(--green-lt) 0%, var(--cream) 100%)',
        minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:30, paddingBottom:25
      }}>
        {store.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', opacity:0.06, zIndex:1
          }} />
        )}
        <div style={{
          position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
          background:'linear-gradient(to bottom, rgba(240,245,238,0.5) 0%, transparent 50%, rgba(253,251,247,0.8) 100%)'
        }} />
        <div style={{
          position:'absolute', inset:0, zIndex:3, pointerEvents:'none',
          backgroundImage:'radial-gradient(circle at 20% 50%, rgba(201,149,44,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(45,90,39,0.04) 0%, transparent 50%)'
        }} />
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'3px',
          background:'linear-gradient(90deg, transparent, var(--green), var(--gold), transparent)', zIndex:4
        }} />

        <div style={{
          position:'relative', zIndex:5, padding:'0 5vw', width:'100%',
          maxWidth:'1100px', margin:'0 auto', textAlign:'center',
          display:'flex', flexDirection:'column', alignItems:'center'
        }} className="fi">
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'6px',
            border:'1px solid var(--gold)', padding:'4px 14px', borderRadius:'20px',
            marginBottom:'16px', backgroundColor:'rgba(201,149,44,0.08)'
          }}>
            <Leaf size={12} style={{ color:'var(--green)' }} />
            <span className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)' }}>
              {t.heroBadge}
            </span>
          </div>

          <h1 className="pd" style={{
            fontSize:'clamp(2.5rem, 7vw, 5rem)', lineHeight:1.05,
            color:'var(--brown)', marginBottom:'14px'
          }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                store.hero?.title?.replace(/<[^>]+>/g, '').replace('الطبيعة', '<span style="color:var(--green)">الطبيعة</span>')
                || t.heroTitle
              )
            }}>
          </h1>

          <p style={{
            fontSize:'clamp(14px, 1.6vw, 16px)', lineHeight:'1.7',
            color:'var(--warm)', maxWidth:'540px', marginBottom:'28px'
          }}>
            {store.hero?.subtitle || t.heroSubtitle}
          </p>

          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center', marginBottom:'36px' }}>
            <a href="#products" className="btn-primary" style={{ fontSize:'14px', padding:'12px 34px' }}>
              <HerbLeaf size={16} /> {t.shopNowBtn}
            </a>
            {cats.length > 0 && (
              <a href="#categories" className="btn-outline" style={{ fontSize:'14px', padding:'12px 34px' }}>
                {t.catsBtn} <ChevronDown size={14} />
              </a>
            )}
          </div>

          <div style={{
            display:'flex', gap:'40px', paddingTop:'22px',
            borderTop:'1px solid var(--tan)', flexWrap:'wrap',
            justifyContent:'center', width:'100%', maxWidth:'700px'
          }} className="fi">
            {[
              { v:`${products.length}+`, l: t.stat1L, c:'var(--green)' },
              { v:'100%', l: t.stat2L, c:'var(--gold)' },
              { v: t.stat3V, l: t.stat3L, c:'var(--green)' },
              { v:'48h', l: t.stat4L, c:'var(--emerald)' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <p className="pd" style={{ fontSize:'clamp(1.8rem, 4vw, 2.4rem)', color:s.c, lineHeight:1, margin:0 }}>
                  {s.v}
                </p>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--dim)', margin:'4px 0 0' }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--tan)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div className="trust-row">
            {[
              { icon:<Leaf size={20} />, color:'var(--green)', title: t.trust1T, desc: t.trust1D },
              { icon:<Droplets size={20} />, color:'var(--gold)', title: t.trust2T, desc: t.trust2D },
              { icon:<Flower2 size={20} />, color:'var(--emerald)', title: t.trust3T, desc: t.trust3D },
              { icon:<Truck size={20} />, color:'var(--green)', title: t.trust4T, desc: t.trust4D },
            ].map((item, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:'12px',
                padding:'16px 20px',
                borderRight:i>0?'1px solid var(--tan)':'none'
              }}>
                <div style={{ color:item.color, flexShrink:0 }}>{item.icon}</div>
                <div style={{ textAlign:isRTL?'right':'left' }}>
                  <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--brown)', margin:0 }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {cats.length > 0 && (
        <section id="categories" style={{ padding:'64px 0', background:'var(--cream)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 20px' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'32px' }}>
              <div>
                <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'8px', letterSpacing:'0.04em' }}>
                  {t.catsSub}
                </p>
                <h2 className="pd" style={{ fontSize:'clamp(1.8rem, 4vw, 3rem)', color:'var(--brown)', lineHeight:1.1 }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.catsTitle) }} />
              </div>
            </div>
            <div className="cat-grid">
              {cats.slice(0, 4).map((cat: any) => (
                <Link key={cat.id} href={`?category=${cat.id}`}
                  className="cat-card" style={{ aspectRatio:'4/3' }}>
                  {cat.imageUrl
                    ? <img src={cat.imageUrl} alt={cat.name} />
                    : <div style={{
                        width:'100%', height:'100%', display:'flex', alignItems:'center',
                        justifyContent:'center', fontSize:'3rem',
                        background:'linear-gradient(135deg, var(--green-lt), var(--beige))'
                      }}>🌿🍯🌺🌾</div>
                  }
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(to top, rgba(44,24,16,0.8) 0%, transparent 50%)',
                    display:'flex', alignItems:'flex-end', padding:'14px'
                  }}>
                    <div>
                      <p className="pd" style={{ fontSize:'16px', fontWeight:600, color:'white', margin:0 }}>
                        {cat.name}
                      </p>
                      <div style={{ height:'2px', width:'24px', background:'var(--gold)', marginTop:'6px' }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="products" style={{ padding:'32px 0 72px', background:'var(--cream)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 20px' }}>
          <div style={{
            display:'flex', alignItems:'flex-end', justifyContent:'space-between',
            marginBottom:'28px', paddingBottom:'16px', borderBottom:'1px solid var(--tan)'
          }}>
            <div>
              <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'8px', letterSpacing:'0.04em' }}>
                {t.productsSub}
              </p>
              <h2 className="pd" style={{ fontSize:'clamp(1.8rem, 4vw, 3rem)', color:'var(--brown)', lineHeight:1.1 }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.productsTitle) }} />
            </div>
            <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--dim)' }}>{products.length} {t.productUnit}</p>
          </div>

          {products.length === 0 ? (
            <div style={{ padding:'80px 0', textAlign:'center', border:'1px dashed var(--tan)', borderRadius:'16px' }}>
              <HerbLeaf size={48} style={{ color:'var(--dim)', margin:'0 auto 16px', opacity:0.4, display:'block' }} />
              <p className="pd" style={{ fontSize:'1.8rem', color:'var(--dim)' }}>{t.noProducts}</p>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((p: any) => {
                const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails={t.viewDetails} />;
              })}
            </div>
          )}

          {countPage > 1 && (
            <div className="pagination" dir={isRTL ? 'rtl' : 'ltr'}>
              <Link href={{ query:{ page:Math.max(1, page-1) } }} scroll={false}
                style={{ width:40, height:40, border:'1px solid var(--tan)', borderRadius:'8px', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--dim)', opacity:page<=1?0.3:1 }}>❮</Link>
              {Array.from({ length:countPage }).map((_, i) => {
                const pn = i + 1; const isA = Number(page) === pn;
                return (
                  <Link key={pn} href={{ query:{ page:pn } }} scroll={false}
                    style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'14px', borderRadius:'8px', border:`1px solid ${isA?'var(--gold)':'var(--tan)'}`, background:isA?'var(--gold)':'transparent', color:isA?'white':'var(--warm)' }}>
                    {pn}
                  </Link>
                );
              })}
              <Link href={{ query:{ page:Math.min(countPage, Number(page)+1) } }} scroll={false}
                style={{ width:40, height:40, border:'1px solid var(--tan)', borderRadius:'8px', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--dim)', opacity:page>=countPage?0.3:1 }}>❯</Link>
            </div>
          )}
        </div>
      </section>

      <section style={{ padding:'64px 20px', background:'var(--white)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'8px', letterSpacing:'0.04em' }}>
              {t.whySub}
            </p>
            <h2 className="pd" style={{ fontSize:'clamp(1.8rem, 4vw, 2.8rem)', color:'var(--brown)' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.whyTitle) }} />
          </div>
          <div className="how-grid">
            {[
              { icon:<Flower2 size={28} />, title: t.why1T, desc: t.why1D },
              { icon:<Droplets size={28} />, title: t.why2T, desc: t.why2D },
              { icon:<Shield size={28} />, title: t.why3T, desc: t.why3D },
              { icon:<Truck size={28} />, title: t.why4T, desc: t.why4D },
            ].map((item, i) => (
              <div key={i} className="why-card" style={{
                display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
                padding:'28px 16px', background:'var(--cream)', border:'1px solid var(--tan)',
                borderRadius:'16px', transition:'box-shadow 0.25s'
              }}>
                <div style={{ color:'var(--green)', marginBottom:'12px' }}>{item.icon}</div>
                <h3 className="pd" style={{ fontSize:'15px', fontWeight:600, color:'var(--brown)', marginBottom:'6px' }}>{item.title}</h3>
                <p style={{ fontSize:'13px', color:'var(--warm)', lineHeight:'1.6', margin:0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        position:'relative', overflow:'hidden', padding:'72px 20px',
        background:'linear-gradient(135deg, var(--green) 0%, var(--green-2) 100%)'
      }}>
        <div style={{ position:'absolute', inset:0, opacity:0.05, backgroundImage:'radial-gradient(circle at 20% 30%, white 0%, transparent 30%), radial-gradient(circle at 80% 70%, white 0%, transparent 30%)' }} />
        <div style={{ position:'relative', zIndex:2, maxWidth:'640px', margin:'0 auto', textAlign:'center' }}>
          <HerbLeaf size={48} style={{ color:'var(--gold)', margin:'0 auto 16px', display:'block' }} />
          <h2 className="pd" style={{ fontSize:'clamp(2rem, 5vw, 3.8rem)', color:'white', lineHeight:1.05, marginBottom:'14px' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.ctaTitle) }} />
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.8)', lineHeight:'1.7', marginBottom:'28px' }}>
            {t.ctaDesc}
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="#products" className="btn-primary" style={{ fontSize:'15px', padding:'14px 36px', background:'var(--gold)', color:'var(--brown)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#B8860B'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--gold)'}>
              <HerbLeaf size={16} /> {t.ctaBtn}
            </a>
            <Link href="/contact" style={{
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'8px',
              border:'1.5px solid var(--gold)', color:'var(--gold)',
              fontFamily:"'Playfair Display',serif", fontSize:'15px', fontWeight:700,
              padding:'14px 36px', borderRadius:'12px', cursor:'pointer', transition:'all 0.2s'
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,149,44,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              {t.ctaContact} <ArrowLeft size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
  const [sel, setSel] = useState(0);
  if (!product) return null;
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background:'var(--cream)' }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'32px 20px' }}>
        <div className="details-g">
          <div>
            <div style={{
              position:'relative', overflow:'hidden',
              background:'var(--white)', border:'1px solid var(--tan)',
              borderRadius:'16px', marginBottom:'10px'
            }}>
              <div style={{ aspectRatio:'1/1' }}>
                {allImages.length > 0
                  ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <HerbLeaf size={64} style={{ color:'var(--dim)', opacity:0.3 }} />
                    </div>
                }
              </div>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg, var(--green), var(--gold))' }} />
              {discount > 0 && (
                <span className="pd" style={{ position:'absolute', top:14, right:14, background:'var(--red)', color:'white', fontSize:'12px', fontWeight:700, padding:'4px 14px', borderRadius:'6px' }}>
                  -{discount}%
                </span>
              )}
              {!inStock && !autoGen && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.85)', backdropFilter:'blur(4px)' }}>
                  <span className="pd" style={{ fontSize:'1.8rem', color:'var(--red)' }}>غير متوفر</span>
                </div>
              )}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSel(p => p===0?allImages.length-1:p-1)} style={{
                    position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    width:'34px', height:'34px', border:'1px solid var(--tan)', borderRadius:'50%',
                    background:'rgba(255,255,255,0.9)', cursor:'pointer', display:'flex',
                    alignItems:'center', justifyContent:'center', color:'var(--green)'
                  }}><ChevronRight size={14} /></button>
                  <button onClick={() => setSel(p => p===allImages.length-1?0:p+1)} style={{
                    position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
                    width:'34px', height:'34px', border:'1px solid var(--tan)', borderRadius:'50%',
                    background:'rgba(255,255,255,0.9)', cursor:'pointer', display:'flex',
                    alignItems:'center', justifyContent:'center', color:'var(--green)'
                  }}><ChevronLeft size={14} /></button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="thumb-row">
                {allImages.slice(0,5).map((img:string, idx:number) => (
                  <button key={idx} onClick={() => setSel(idx)} style={{
                    width:'54px', height:'54px', overflow:'hidden', borderRadius:'10px',
                    border:`2px solid ${sel===idx?'var(--gold)':'var(--tan)'}`,
                    cursor:'pointer', padding:0, background:'none', opacity:sel===idx?1:0.6
                  }}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'10px', letterSpacing:'0.04em' }}>تفاصيل المنتج</p>
            <h1 className="pd" style={{ fontSize:'clamp(1.5rem, 3.5vw, 2.5rem)', color:'var(--brown)', lineHeight:1.05, marginBottom:'14px' }}>{product.name}</h1>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid var(--tan)', flexWrap:'wrap' }}>
              <div style={{ display:'flex', gap:'2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} style={{ width:'13px', height:'13px', fill:i<4?'var(--amber)':'none', color:'var(--amber)' }} />
                ))}
              </div>
              <span style={{
                marginRight:'auto', padding:'4px 14px', borderRadius:'6px',
                background:inStock||autoGen?'rgba(45,90,39,0.08)':'rgba(192,57,43,0.08)',
                color:inStock||autoGen?'var(--green)':'var(--red)',
                fontSize:'11px', fontWeight:600, fontFamily:"'Playfair Display',serif",
                border:`1px solid ${inStock||autoGen?'rgba(45,90,39,0.2)':'rgba(192,57,43,0.2)'}`
              }}>
                {autoGen?'متوفر':inStock?'متوفر':'غير متوفر'}
              </span>
            </div>

            <div style={{
              padding:'16px', background:'var(--green-lt)', border:'1px solid rgba(45,90,39,0.15)',
              borderRadius:'12px', marginBottom:'22px'
            }}>
              <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'5px' }}>السعر</p>
              <div style={{ display:'flex', alignItems:'baseline', gap:'10px', flexWrap:'wrap' }}>
                <span className="pd" style={{ fontSize:'2.8rem', fontWeight:700, color:'var(--gold)', lineHeight:1 }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span className="pd" style={{ fontSize:'13px', color:'var(--dim)', fontWeight:600 }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <span style={{ fontSize:'14px', textDecoration:'line-through', color:'var(--dim)' }}>
                    {parseFloat(product.priceOriginal).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {(product.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
              <div style={{ marginBottom:'22px', padding:'10px 14px', border:'1px solid var(--green)', borderRadius:'10px', background:'var(--green-lt)', fontSize:'12px', fontWeight:600, color:'var(--green)' }}>
                🚚 {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', `${Number(store.freeShippingMinAmount).toLocaleString()} دج`)}
              </div>
            )}

            {product.offers?.length > 0 && (
              <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--tan)' }}>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'10px' }}>العروض</p>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 14px', border:`1.5px solid ${selectedOffer===o.id?'var(--gold)':'var(--tan)'}`,
                    borderRadius:'10px', cursor:'pointer', marginBottom:'8px',
                    background:selectedOffer===o.id?'var(--gold-lt)':'transparent',
                    transition:'all 0.2s'
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{
                        width:'16px', height:'16px', borderRadius:'50%',
                        border:`2px solid ${selectedOffer===o.id?'var(--gold)':'var(--dim)'}`,
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                      }}>
                        {selectedOffer===o.id && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--gold)' }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer===o.id} onChange={() => setSelectedOffer(o.id)} style={{ display:'none' }} />
                      <div>
                        <p style={{ fontSize:'14px', fontWeight:600, color:'var(--brown)', margin:0 }}>{o.name}</p>
                        {o.subTitle && <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>{o.subTitle}</p>}
                        <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>الكمية: {o.quantity}</p>
                        {o.shippingFree && <p style={{ fontSize:'11px', color:'var(--green)', fontWeight:600, margin:0 }}>🚚 {t.freeShippingBadge}</p>}
                      </div>
                    </div>
                    <span className="pd" style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--gold)' }}>
                      {o.price.toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'11px', color:'var(--dim)' }}>دج</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--tan)' }}>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'10px' }}>{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {attr.variants.map((v: any) => {
                      const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                      return (
                        <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.name}
                          style={{ width:'28px', height:'28px', borderRadius:'8px', backgroundColor:v.value, border:'none', cursor: available ? 'pointer' : 'not-allowed', outline:`3px solid ${selectedVariants[attr.name]===v.value?'var(--gold)':'transparent'}`, outlineOffset:'3px', opacity: available ? 1 : 0.35 }} />
                      );
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {attr.variants.map((v: any) => {
                      const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                      return (
                        <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', borderRadius:'10px', border:`2px solid ${selectedVariants[attr.name]===v.value?'var(--gold)':'var(--tan)'}`, cursor: available ? 'pointer' : 'not-allowed', padding:0, opacity: available ? 1 : 0.35 }}>
                          <img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                      return (
                        <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)}
                          className="pd" style={{
                            padding:'8px 16px', borderRadius:'8px',
                            border:`1.5px solid ${s?'var(--gold)':'var(--tan)'}`,
                            background:s?'var(--gold)':'transparent',
                            color:s?'white':(available ? 'var(--warm)' : '#bbb'), fontSize:'13px', fontWeight:700,
                            cursor: available ? 'pointer' : 'not-allowed', transition:'all 0.2s',
                            textDecoration: available ? 'none' : 'line-through'
                          }}>
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} store={store} />

            {product.desc && (
              <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--tan)' }}>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'12px' }}>{t.productInfo}</p>
                <div style={{ fontSize:'14px', lineHeight:'1.85', color:'var(--warm)' }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','span'], ALLOWED_ATTR:['class','style'] })
                  }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0, store }: ProductFormProps) {
  const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office', customerEmail:'', customerWhatsapp:'' });
  const [contactMethod, setContactMethod] = useState<'email'|'whatsapp'>('email');
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore(s => s.initCount);

  useEffect(()=>{ if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(()=>{ if(typeof window!=='undefined'){const id=localStorage.getItem('customerId');if(id) setFd(p=>({...p,customerId:id}));} },[]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);

  const getFP = useCallback(():number=>{
    const base=typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const off=product.offers?.find((o:any)=>o.id===selectedOffer); if(off) return off.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){
      const m=product.variantDetails.find((v:any)=>vm(v,selectedVariants));
      if(m&&m.price!==-1) return m.price;
    }
    return base;
  },[product,selectedOffer,selectedVariants]);

  const fp = getFP();
  const supportQty = (store?.supportQty ?? product?.store?.supportQty) !== false;
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = product.offers?.find((o: any) => o.id === selectedOffer);
  const orderFreeShipping = !!(product.shippingFree || selOfferObj?.shippingFree ||
    (store?.supportFreeShipping && store?.freeShippingMinAmount != null && (fp * qty) >= Number(store.freeShippingMinAmount)));
  const getLiv = useCallback(():number=>{
    if (product.isDigital) return 0;
    if (orderFreeShipping) return 0;
    if(!selW) return 0;
    return Number(fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice);
  },[selW,fd.typeLivraison,orderFreeShipping,product.isDigital]);
  const total = ()=> fp*qty + getLiv();

  const validate = ()=>{
    const e:Record<string,string>={};
    if(!fd.customerName.trim()) e.customerName=t.errName;
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhoneInvalid;
    if (product.isDigital) {
      if (contactMethod === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.customerEmail.trim())) e.customerEmail = t.errEmail;
      } else {
        if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerWhatsapp.trim())) e.customerWhatsapp = t.errWhatsapp;
      }
    } else {
      if(!fd.customerWelaya) e.customerWelaya=t.errWilaya;
      if(!fd.customerCommune) e.customerCommune=t.errCommune;
    }
    return e;
  };

  const getVarId = useCallback(()=>{
    if(!product.variantDetails?.length||!Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v:any)=>vm(v,selectedVariants))?.id;
  },[product.variantDetails,selectedVariants]);

  const addToCart = ()=>{
    setIsAdded(true);
    const cart=JSON.parse(localStorage.getItem(domain)||'[]');
    cart.push({...fd,quantity:qty,product,variantDetailId:getVarId(),productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv(),addedAt:Date.now()});
    localStorage.setItem(domain,JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(()=>setIsAdded(false),2000);
  };

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();
    const er=validate(); if(Object.keys(er).length){setErrors(er);return;}
    setErrors({}); setSub(true);
    try{
      const { customerWelaya, customerCommune, typeLivraison, priceLoss, customerEmail, customerWhatsapp, ...rest } = fd;
      const payload = product.isDigital
        ? { ...rest, ...(contactMethod === 'email' ? { customerEmail } : { customerWhatsapp }) }
        : { ...rest, customerWelaya, customerCommune, typeLivraison, priceLoss };
      await axios.post(`${API_URL}/orders/create`,{...payload,quantity:qty,productId:product.id,storeId:product.store.id,userId,selectedOffer,variantDetailId:getVarId(),platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()});
      if(fd.customerId) localStorage.setItem('customerId',fd.customerId);
      router.push(`/successfully?productId=${product?.id}`);
    }catch{}finally{setSub(false);}
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ marginTop:'22px', paddingTop:'20px', borderTop:'1px solid var(--tan)' }}>
        {product.store?.cart && !product.isDigital && (
        <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
          <button onClick={addToCart} disabled={isAdded} className="pd" style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            padding:'12px', borderRadius:'10px', cursor:isAdded?'default':'pointer',
            fontWeight:700, fontSize:'13px',
            border:`1.5px solid ${isAdded?'var(--emerald)':'var(--tan)'}`,
            background:isAdded?'rgba(74,124,89,0.1)':'transparent',
            color:isAdded?'var(--emerald)':'var(--warm)', transition:'all 0.25s', fontFamily:'inherit'
          }}>
            {isAdded?<><CheckCircle2 size={14} className="anim-check"/>{t.addedText}</>:<><ShoppingCart size={14}/>{t.addToCart}</>}
          </button>
          <button onClick={()=>setIsOrderNow(true)} className="btn-primary" style={{ flex:1, padding:'12px' }}>
            <Zap size={14}/> {t.orderNow}
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart || product.isDigital) && (
        <div>
          {product.store?.cart && !product.isDigital && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', margin:0 }}>{t.deliveryInfo}</p>
              <button onClick={()=>setIsOrderNow(false)} className="pd" style={{
                display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:'6px',
                border:'1px solid var(--tan)', background:'transparent', color:'var(--dim)',
                fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit'
              }}>
                <X size={11}/> {t.cancel}
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.customerName} label={t.fullName}>
                <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder={t.namePh} style={INP_S(!!errors.customerName)}/>
              </FR>
              <FR error={errors.customerPhone} label={t.phone}>
                <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder={t.phonePh} style={INP_S(!!errors.customerPhone)}/>
              </FR>
            </div>
            {product.isDigital ? (
              <div style={{ marginBottom:'14px' }}>
                <p className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--dim)', margin:'0 0 8px' }}>{t.contactQuestion}</p>
                <div style={{ display:'flex', borderRadius:'10px', overflow:'hidden', border:'1.5px solid var(--tan)', marginBottom:'12px' }}>
                  <button type="button" onClick={()=>{setContactMethod('email'); setFd(p=>({...p, customerWhatsapp: ''}));}} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'11px 0', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'13px', fontWeight:700, background:contactMethod==='email'?'var(--gold)':'transparent', color:contactMethod==='email'?'#fff':'var(--warm)' }}>
                    <Mail size={14}/>{t.contactViaEmail}
                  </button>
                  <button type="button" onClick={()=>{setContactMethod('whatsapp'); setFd(p=>({...p, customerEmail: ''}));}} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'11px 0', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'13px', fontWeight:700, background:contactMethod==='whatsapp'?'var(--gold)':'transparent', color:contactMethod==='whatsapp'?'#fff':'var(--warm)' }}>
                    <MessageCircle size={14}/>{t.contactViaWhatsapp}
                  </button>
                </div>
                {contactMethod === 'email' ? (
                  <FR error={errors.customerEmail} label={t.orderEmail}>
                    <input type="email" dir="ltr" value={fd.customerEmail} onChange={e=>setFd({...fd,customerEmail:e.target.value})} placeholder={t.emailPh} style={INP_S(!!errors.customerEmail)}/>
                  </FR>
                ) : (
                  <FR error={errors.customerWhatsapp} label={t.whatsapp}>
                    <input type="tel" dir="ltr" value={fd.customerWhatsapp} onChange={e=>setFd({...fd,customerWhatsapp:e.target.value})} placeholder={t.whatsappPh} style={INP_S(!!errors.customerWhatsapp)}/>
                  </FR>
                )}
              </div>
            ) : (
              <>
                <div className="form-2c">
                  <FR error={errors.customerWelaya} label={t.wilaya}>
                    <div style={{ position:'relative' }}>
                      <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                      <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} className="inp" style={{ paddingLeft:'32px' }}>
                        <option value="">{t.wilayaPh}</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                      </select>
                    </div>
                  </FR>
                  <FR error={errors.customerCommune} label={t.commune}>
                    <div style={{ position:'relative' }}>
                      <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                      <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})} className="inp" style={{ paddingLeft:'32px', opacity:!fd.customerWelaya?0.4:1 }}>
                        <option value="">{loadingC?t.communeLoading:t.communePh}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                      </select>
                    </div>
                  </FR>
                </div>

                <FR label={t.deliveryType}>
                  <div className="dlv-2c">
                    {(['home','office'] as const).map(type=>(
                      <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))} style={{
                        padding:'12px 10px', borderRadius:'10px',
                        border:`1.5px solid ${fd.typeLivraison===type?'var(--gold)':'var(--tan)'}`,
                        backgroundColor:fd.typeLivraison===type?'var(--gold-lt)':'transparent',
                        cursor:'pointer', textAlign:isRTL?'right':'left', transition:'all 0.2s', fontFamily:'inherit'
                      }}>
                        <p className="pd" style={{
                          fontSize:'12px', fontWeight:600,
                          color:fd.typeLivraison===type?'var(--gold)':'var(--warm)',
                          margin:'0 0 4px'
                        }}>{type==='home'?t.homeLabel:t.officeLabel}</p>
                        {selW && <p className="pd" style={{
                          fontSize:'1rem',
                          color:fd.typeLivraison===type?'var(--gold)':'var(--warm)',
                          margin:0
                        }}>{orderFreeShipping ? t.freeShippingBadge : <>{Number(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'11px', color:'var(--dim)' }}>{store?.currency||'DZD'}</span></>}</p>}
                      </button>
                    ))}
                  </div>
                </FR>
              </>
            )}

            {supportQty && !product.isDigital && (
              <FR label={t.qty}>
                <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid var(--tan)', borderRadius:'10px', overflow:'hidden', background:'var(--white)' }}>
                  <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--tan)', background:'transparent', cursor:'pointer', color:'var(--gold)', fontSize:'18px', fontWeight:700 }}>-</button>
                  <span className="pd" style={{ width:'44px', textAlign:'center', fontSize:'1.2rem', color:'var(--brown)' }}>{fd.quantity}</span>
                  <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))} style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--tan)', background:'transparent', cursor:'pointer', color:'var(--gold)', fontSize:'18px', fontWeight:700 }}>+</button>
                </div>
              </FR>
            )}

            <div style={{ border:'1px solid var(--tan)', borderRadius:'12px', marginBottom:'14px', overflow:'hidden', background:'var(--white)' }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--tan)', display:'flex', alignItems:'center', gap:'8px', background:'var(--green-lt)' }}>
                <Package size={13} style={{ color:'var(--green)' }}/>
                <span className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)' }}>{t.orderSummary}</span>
              </div>
              {[{l:t.productLabel,v:product.name.slice(0,22)+(product.name.length>22?'...':'')},{l:t.price,v:`${fp.toLocaleString()} ${store?.currency||'DZD'}`},{l:t.qty,v:`× ${qty}`},...(product.isDigital?[]:[{l:t.delivery,v:!selW?'—':orderFreeShipping?t.freeShippingBadge:`${getLiv().toLocaleString()} ${store?.currency||'DZD'}`}])].map(row=>(
                <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 14px', borderBottom:'1px solid var(--tan)' }}>
                  <span className="pd" style={{ fontSize:'12px', color:'var(--dim)' }}>{row.l}</span>
                  <span style={{ fontSize:'13px', fontWeight:600, color:'var(--warm)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px' }}>
                <span className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--dim)' }}>{t.total}</span>
                <span className="pd" style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--gold)' }}>{total().toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'12px', color:'var(--dim)' }}>{store?.currency||'DZD'}</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-primary" style={{ width:'100%', fontSize:'15px', padding:'14px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1 }}>
              {sub?<><Loader2 style={{ width:'15px', height:'15px', animation:'spin 1s linear infinite' }}/> {t.processingOrder}</>:<><Zap size={15}/> {t.confirmOrder}</>}
            </button>
            <div style={{ display:'flex', justifyContent:'center', gap:'16px', marginTop:'10px' }}>
              {[{icon:<Lock size={11}/>,label:t.securePay},{icon:<Truck size={11}/>,label:t.fastDelivery},{icon:<Leaf size={11}/>,label:t.natural}].map((b,i)=>(
                <div key={i} className="pd" style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'var(--dim)', fontWeight:600 }}>
                  <span style={{ color:'var(--green)' }}>{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function Cart({ domain, store }: { domain: string; store: any }) {
  const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', typeLivraison:'home' as 'home'|'office' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const initCount = useCartStore(s => s.initCount);

  useEffect(()=>{ setItems(JSON.parse(localStorage.getItem(domain)||'[]')); if(store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); },[domain,store]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const cartTotal = items.reduce((a,i)=>a+(i.finalPrice*i.quantity),0);

  const hasFreeShippingItem = items.some((it) => it.product?.shippingFree || it.product?.offers?.find((o: any) => o.id === it.selectedOffer)?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;

  const getLiv = ()=>{
    if (freeShippingReached) return 0;
    if(!selW) return 0;
    return Number(fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice);
  };
  const finalTotal = cartTotal + getLiv();
  const update = (n:any[])=>{ setItems(n); localStorage.setItem(domain,JSON.stringify(n)); initCount(n.length); };

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();
    const er:Record<string,string>={};
    if(!fd.customerName.trim()) er.name=t.errName;
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = t.errPhoneInvalid;
    if(!fd.customerWelaya) er.w=t.errWilaya;
    if(!fd.customerCommune) er.c=t.errCommune;
    if(Object.keys(er).length){setErrors(er);return;}
    setErrors({}); setSubmitting(true);
    try{
      await axios.post(`${API_URL}/orders/create`,items.map(i=>({...fd,productId:i.productId,storeId:i.storeId,userId:i.userId,selectedOffer:i.selectedOffer,variantDetailId:i.variantDetailId,selectedVariants:i.selectedVariants,platform:i.platform||'store',finalPrice:i.finalPrice,totalPrice:finalTotal,priceLivraison:getLiv(),quantity:i.quantity,customerId:i.customerId||'',priceLoss:selW?.livraisonReturn??0})));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    }catch{}finally{setSubmitting(false);}
  };

  if(success) return (
    <div dir={isRTL?'rtl':'ltr'} style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--cream)' }}>
      <div style={{ textAlign:'center', background:'var(--white)', padding:'4rem 2.5rem', borderRadius:'16px', border:'1px solid var(--gold)', maxWidth:460, width:'100%', boxShadow:'0 8px 30px rgba(201,149,44,0.08)' }}>
        <CheckCircle2 size={48} style={{ color:'var(--emerald)', display:'block', margin:'0 auto 1.25rem' }}/>
        <h2 className="pd" style={{ fontSize:'2.5rem', color:'var(--brown)', marginBottom:'0.625rem' }}>{t.successTitle}</h2>
        <p style={{ color:'var(--warm)', marginBottom:'2rem', lineHeight:1.7 }}>{t.successDesc}</p>
        <Link href="/" className="btn-primary" style={{ display:'inline-flex', padding:'13px 28px' }}>{t.backToShop}</Link>
      </div>
    </div>
  );

  if(!items.length) return (
    <div dir={isRTL?'rtl':'ltr'} style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--cream)' }}>
      <div style={{ textAlign:'center', padding:'4rem 2rem', borderRadius:'16px', border:'1px dashed var(--tan)', maxWidth:400, width:'100%' }}>
        <HerbLeaf size={48} style={{ color:'var(--dim)', display:'block', margin:'0 auto 1.25rem', opacity:0.4 }}/>
        <p className="pd" style={{ fontSize:'2rem', color:'var(--dim)', marginBottom:'1.75rem' }}>{t.cartEmpty}</p>
        <Link href="/" className="btn-primary" style={{ display:'inline-flex', padding:'13px 28px' }}>{t.shopNow}</Link>
      </div>
    </div>
  );

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ minHeight:'100vh', background:'var(--cream)', padding:'2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'2rem', paddingBottom:'1rem', borderBottom:'2px solid var(--gold)' }}>
          <h1 className="pd" style={{ fontSize:'clamp(2rem, 5vw, 3rem)', color:'var(--brown)' }}>{t.cartTitle}</h1>
          <p className="pd" style={{ fontSize:'13px', color:'var(--dim)', fontWeight:600 }}>{items.length} {t.productUnit}</p>
        </div>
        {freeShippingMin != null && (
          <div style={{
            border: `1px solid ${freeShippingReached ? 'var(--green)' : 'var(--tan)'}`, borderRadius: 12,
            background: freeShippingReached ? 'var(--green-lt)' : 'var(--white)', padding: '12px 16px', marginBottom: '1.5rem',
            color: freeShippingReached ? 'var(--green)' : 'var(--dim)', fontSize: '13px', fontWeight: 600,
          }}>
            {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', `${Number(freeShippingRemainingAmt).toLocaleString()} ${store?.currency||'DZD'}`)}
          </div>
        )}
        <div className="cart-layout">
          <div style={{ background:'var(--white)', border:'1px solid var(--tan)', borderRadius:'16px', overflow:'hidden', alignSelf:'start' }}>
            {items.map((item,i)=>(
              <div key={i} style={{ display:'flex', gap:'1rem', padding:'14px', borderBottom:'1px solid var(--tan)' }}>
                <div style={{ width:80, height:80, flexShrink:0, overflow:'hidden', borderRadius:'10px', border:'1px solid var(--tan)', background:'var(--beige)' }}>
                  <img src={item.product?.imagesProduct?.[0]?.imageUrl||item.product?.productImage} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} alt=""/>
                </div>
                <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <div>
                    <h4 style={{ fontWeight:600, color:'var(--brown)', fontSize:'13px', marginBottom:'4px' }}>{item.product?.name}</h4>
                    <p className="pd" style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--gold)' }}>{item.finalPrice?.toLocaleString()} {store?.currency||'DZD'}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'8px' }}>
                    <span className="pd" style={{ fontSize:'1rem', fontWeight:700, color:'var(--brown)' }}>× {item.quantity}</span>
                    <button onClick={()=>update(items.filter((_,idx)=>idx!==i))} className="pd" style={{
                      display:'flex', alignItems:'center', gap:4, padding:'4px 8px', border:'none',
                      background:'transparent', color:'var(--dim)', fontSize:'11px', fontWeight:600,
                      cursor:'pointer', transition:'color 0.15s', fontFamily:'inherit'
                    }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color='var(--red)';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color='var(--dim)';}}>
                      <Trash2 size={12}/> {t.deleteBtn}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'14px', background:'var(--beige)' }}>
              <span className="pd" style={{ fontWeight:600, fontSize:'13px', color:'var(--dim)' }}>{t.subtotal}</span>
              <span className="pd" style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--brown)' }}>{cartTotal.toLocaleString()} {store?.currency||'DZD'}</span>
            </div>
          </div>

          <div style={{ background:'var(--white)', border:'1px solid var(--tan)', borderRadius:'16px', padding:'22px', alignSelf:'start' }}>
            <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'16px' }}>{t.deliveryInfo}</p>
            <form onSubmit={handleSubmit}>
              <div className="form-2c">
                <FR error={errors.name} label={t.fullName}><input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} className="inp"/></FR>
                <FR error={errors.phone} label={t.phone}><input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} className="inp"/></FR>
              </div>
              <div className="form-2c">
                <FR error={errors.w} label={t.wilaya}>
                  <div style={{ position:'relative' }}>
                    <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                    <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} className="inp" style={{ paddingLeft:'32px' }}>
                      <option value="">{t.wilayaPh}</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
                <FR error={errors.c} label={t.commune}>
                  <div style={{ position:'relative' }}>
                    <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                    <select value={fd.customerCommune} disabled={loadingC||!fd.customerWelaya} onChange={e=>setFd({...fd,customerCommune:e.target.value})} className="inp" style={{ paddingLeft:'32px', opacity:!fd.customerWelaya?0.4:1 }}>
                      <option value="">{loadingC?t.communeLoading:t.communePh}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
              </div>

              <div style={{ marginBottom:'14px' }}>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'10px' }}>{t.deliveryType}</p>
                <div className="dlv-2c">
                  {(['home','office'] as const).map(type=>(
                    <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))} style={{
                      padding:'14px', borderRadius:'10px',
                      border:`1px solid ${fd.typeLivraison===type?'var(--gold)':'var(--tan)'}`,
                      borderTop:`2px solid ${fd.typeLivraison===type?'var(--gold)':'var(--tan)'}`,
                      background:fd.typeLivraison===type?'var(--gold-lt)':'var(--white)',
                      textAlign:'center', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s'
                    }}>
                      <span style={{ display:'block', fontSize:'1.5rem', marginBottom:'4px' }}>{type==='home'?'🏠':'🏢'}</span>
                      <p className="pd" style={{ fontSize:'12px', fontWeight:600, color:fd.typeLivraison===type?'var(--brown)':'var(--dim)' }}>{type==='home'?t.homeLabel:t.officeLabel}</p>
                      {selW && <p className="pd" style={{ fontSize:'1rem', color:'var(--gold)', marginTop:'3px' }}>{freeShippingReached ? t.freeShippingBadge : `${Number(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} ${store?.currency||'DZD'}`}</p>}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ border:'1px solid var(--tan)', borderRadius:'12px', marginBottom:'14px', overflow:'hidden', background:'var(--beige)' }}>
                {[{l:t.subtotal,v:`${cartTotal.toLocaleString()} ${store?.currency||'DZD'}`},{l:t.delivery,v:!selW?'—':freeShippingReached?t.freeShippingBadge:`${getLiv().toLocaleString()} ${store?.currency||'DZD'}`}].map(row=>(
                  <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 14px', borderBottom:'1px solid var(--tan)' }}>
                    <span className="pd" style={{ fontSize:'12px', color:'var(--dim)' }}>{row.l}</span>
                    <span style={{ fontSize:'13px', fontWeight:600, color:'var(--warm)' }}>{row.v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px' }}>
                  <span className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--dim)' }}>{t.total}</span>
                  <span className="pd" style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--gold)' }}>{finalTotal.toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'12px', color:'var(--dim)' }}>{store?.currency||'DZD'}</span></span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary" style={{ width:'100%', fontSize:'15px', padding:'14px', cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.7:1 }}>
                {submitting?<><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> {t.processingOrder}</>:<><Zap size={15}/> {t.confirmOrder}</>}
              </button>
            </form>
          </div>
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
    <div dir={t.dir} style={{ minHeight: '100vh', background: 'var(--cream)', padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '3rem 2rem', borderRadius: 16, border: '1px solid var(--line)', marginBottom: '1.5rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle2 size={30} style={{ color: 'var(--warm)' }} />
          </div>
          <h2 className="pd" style={{ fontSize: '2rem', color: 'var(--brown)', marginBottom: '0.625rem' }}>{t.successTitle}</h2>
          <p style={{ color: 'var(--warm)', lineHeight: 1.7 }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.75rem', color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--line)', fontSize: 14, fontWeight: 700, color: 'var(--brown)' }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--warm)' }}>{t.total}</span>
                <span className="pd" style={{ fontSize: '1.2rem', color: 'var(--brown)' }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? CheckCircle2;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? '1px solid var(--line)' : 'none', background: done ? 'var(--cream)' : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--warm)' : 'var(--cream)', color: done ? '#fff' : 'var(--warm)' }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: done ? 'var(--brown)' : 'var(--warm)', marginBottom: 2 }}>{step.title}</p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--warm)' }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <Link href="/" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px 28px', textDecoration: 'none' }}>{t.shopNow}</Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', borderRadius: 12, border: '1px solid var(--line)', color: 'var(--warm)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return (
    <>
      {p==='privacy' && <Privacy store={store}/>}
      {p==='terms' && <Terms store={store}/>}
      {p==='cookies' && <Cookies store={store}/>}
      {p==='contact' && <Contact store={store}/>}
    </>
  );
}

const Shell = ({ children, title, sub, dir }: { children: React.ReactNode; title: string; sub?: string; dir?: string }) => (
  <div dir={dir || 'rtl'} style={{ background:'var(--cream)', minHeight:'100vh' }}>
    <div style={{
      background:'linear-gradient(135deg, var(--green-lt), var(--cream))', padding:'56px 20px 40px',
      borderBottom:'1px solid var(--gold)', position:'relative', overflow:'hidden'
    }}>
      <div style={{ maxWidth:'720px', margin:'0 auto', position:'relative', zIndex:2, textAlign:'start' }}>
        {sub && <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'10px', letterSpacing:'0.04em' }}>{sub}</p>}
        <h1 className="pd" style={{ fontSize:'clamp(2.2rem, 5vw, 4rem)', color:'var(--brown)', lineHeight:1.05 }}>
          {title}
        </h1>
      </div>
    </div>
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'36px 20px 80px' }}>
      <div style={{ background:'var(--white)', border:'1px solid var(--tan)', borderRadius:'16px', padding:'28px', textAlign:'start' }}>
        {children}
      </div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom:'18px', marginBottom:'18px', borderBottom:'1px solid var(--tan)', display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start' }}>
    <div style={{ flex:1, textAlign:'start' }}>
      <h3 className="pd" style={{ fontSize:'14px', fontWeight:600, color:'var(--brown)', margin:'0 0 7px' }}>
        {title}
      </h3>
      <p style={{ fontSize:'13px', lineHeight:'1.8', color:'var(--warm)', margin:0 }}>{body}</p>
    </div>
    {tag && <span className="pd" style={{ fontSize:'10px', fontWeight:600, padding:'4px 10px', borderRadius:'6px', border:'1px solid var(--gold)', color:'var(--gold)', flexShrink:0 }}>{tag}</span>}
  </div>
);

export function Privacy({ store }: { store?: any }) {
  const lang = getLang(store); const t = T[lang];
  return (
    <Shell title={t.privacyTitle} sub={t.privacySub} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <IB title={t.privacy1T} body={t.privacy1D}/>
      <IB title={t.privacy2T} body={t.privacy2D}/>
      <IB title={t.privacy3T} body={t.privacy3D}/>
      <IB title={t.privacy4T} body={t.privacy4D} tag={t.privacy4Tag}/>
    </Shell>
  );
}

export function Terms({ store }: { store?: any }) {
  const lang = getLang(store); const t = T[lang];
  return (
    <Shell title={t.termsTitle} sub={t.termsSub} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <IB title={t.terms1T} body={t.terms1D}/>
      <IB title={t.terms2T} body={t.terms2D} tag={t.terms2Tag}/>
      <IB title={t.terms3T} body={t.terms3D}/>
    </Shell>
  );
}

export function Cookies({ store }: { store?: any }) {
  const lang = getLang(store); const t = T[lang];
  return (
    <Shell title={t.cookiesTitle} sub={t.cookiesSub} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <IB title={t.cookies1T} body={t.cookies1D} tag={t.cookies1Tag}/>
      <IB title={t.cookies2T} body={t.cookies2D} tag={t.cookies2Tag}/>
      <div style={{ marginTop:'16px', padding:'14px', borderRadius:'10px', border:'1px solid var(--gold)', display:'flex', gap:'10px', alignItems:'flex-start', background:'var(--gold-lt)' }}>
        <ToggleRight size={17} style={{ color:'var(--gold)', flexShrink:0, marginTop:'1px' }}/>
        <p style={{ fontSize:'13px', color:'var(--warm)', lineHeight:'1.75', margin:0, textAlign:'start' }}>
          {t.cookiesNote}
        </p>
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store?: any }) {
  const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`,{...form,storeId:store?.id}); setSent(true); }
    catch { showError(t.errSubmit); } finally { setLoading(false); }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background:'var(--cream)', minHeight:'100vh' }}>
      <div style={{
        background:'linear-gradient(135deg, var(--green-lt), var(--cream))', padding:'56px 20px 40px',
        borderBottom:'1px solid var(--gold)', position:'relative', overflow:'hidden'
      }}>
        <div style={{ maxWidth:'960px', margin:'0 auto', position:'relative', zIndex:2, textAlign:isRTL?'right':'left' }}>
          <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'10px', letterSpacing:'0.04em' }}>{t.contactSub}</p>
          <h1 className="pd" style={{ fontSize:'clamp(2.2rem, 5vw, 4rem)', color:'var(--brown)', lineHeight:1.05, marginBottom:'8px' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.contactHeading) }} />
          <p style={{ fontSize:'14px', color:'var(--warm)' }}>{t.contactReply}</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth:'960px', margin:'0 auto', padding:'36px 20px 80px' }}>
        <div>
          <div style={{ background:'var(--white)', border:'1px solid var(--tan)', borderRadius:'16px', padding:'22px', marginBottom:'12px', textAlign:isRTL?'right':'left' }}>
            <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'16px' }}>{t.contactInfoTitle}</p>
            {[
              { icon:'📞', label: t.contactPhone, val:store?.contact?.phone },
              { icon:'📍', label: t.contactLocation, val:[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
              { icon:'✉️', label: t.contactMail, val:store?.contact?.email },
            ].filter(r=>r.val).map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 0', borderBottom:'1px solid var(--tan)' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'var(--green-lt)', border:'1px solid rgba(45,90,39,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>{item.icon}</div>
                <div style={{ textAlign:isRTL?'right':'left' }}>
                  <p className="pd" style={{ fontSize:'10px', fontWeight:600, color:'var(--green)', margin:'0 0 1px' }}>{item.label}</p>
                  <p style={{ fontSize:'13px', fontWeight:600, color:'var(--brown)', margin:0 }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'linear-gradient(135deg, var(--green), var(--green-2))', padding:'18px 20px', borderRadius:'16px', textAlign:isRTL?'right':'left' }}>
            <p className="pd" style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--gold)', margin:'0 0 4px' }}>{t.contactPower}</p>
            <p className="pd" style={{ fontSize:'1.6rem', fontWeight:700, color:'rgba(255,255,255,0.85)', margin:0, lineHeight:1 }}>{t.contactIn}</p>
          </div>
        </div>

        <div style={{ background:'var(--white)', border:'1px solid var(--tan)', borderRadius:'16px', padding:'24px', textAlign:isRTL?'right':'left' }}>
          <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'18px' }}>{t.contactSendTitle}</p>
          {sent ? (
            <div style={{ minHeight:'200px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:'12px', border:'1px solid var(--gold)', textAlign:'center', background:'var(--gold-lt)', padding:'28px' }}>
              <CheckCircle2 size={32} style={{ color:'var(--emerald)', marginBottom:'12px' }}/>
              <h3 className="pd" style={{ fontSize:'1.5rem', color:'var(--brown)', margin:'0 0 6px' }}>{t.contactSentTitle}</h3>
              <p style={{ fontSize:'13px', color:'var(--warm)' }}>{t.contactSentDesc}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div className="form-2c">
                <div>
                  <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--warm)', marginBottom:'5px' }}>{t.contactNameLabel}</p>
                  <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="inp"/>
                </div>
                <div>
                  <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--warm)', marginBottom:'5px' }}>{t.contactPhoneLabel}</p>
                  <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required className="inp"/>
                </div>
              </div>
              <div>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--warm)', marginBottom:'5px' }}>{t.contactEmailLabel}</p>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required className="inp"/>
              </div>
              <div>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--warm)', marginBottom:'5px' }}>{t.contactMsgLabel}</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder={t.contactMsgPh} rows={4} required className="inp" style={{ resize:'none' }}/>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent:'center', width:'100%', fontSize:'14px', padding:'13px', opacity:loading?0.7:1, cursor:loading?'not-allowed':'pointer' }}>
                {loading?<><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> {t.contactSending}</>:<>{t.contactSendBtn} <ArrowLeft size={14}/></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
