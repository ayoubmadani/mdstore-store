'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, AlertCircle, X, Share2,
  CheckCircle2, ToggleRight, Shield, ArrowLeft,
  Plus, Minus, ArrowUpRight, Search, ShoppingCart,
  Trash2, Loader2, Package, Heart, Phone, Truck,
  Mail, MessageCircle, Download,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   ZINE DROP — Streetwear / Fashion Arabic RTL Theme
   ─────────────────────────────────────────────────────────────
   Paper #F2EFE8 · Ink #0A0906 · Punch #FF2D00
   Fonts: Unbounded (display) + Space Mono (body)
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0; }
  html { scroll-behavior:smooth; }

  :root {
    --paper:    #F2EFE8;
    --paper-dk: #E8E4DB;
    --ink:      #0A0906;
    --ash:      #6B6560;
    --mist:     #B8B2A8;
    --punch:    #FF2D00;
  }

  body { background:var(--paper); color:var(--ink); font-family:'Space Mono',monospace; }
  a    { text-decoration:none; color:inherit; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:var(--paper); }
  ::-webkit-scrollbar-thumb { background:var(--ink); }

  .ub { font-family:'Unbounded',sans-serif; }
  .sm { font-family:'Space Mono',monospace; }

  /* Keyframes */
  @keyframes ticker-run { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes menu-in    { from{opacity:0;clip-path:inset(0 0 100% 0)} to{opacity:1;clip-path:inset(0 0 0% 0)} }
  @keyframes rise       { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin       { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in   { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

  .ticker-w { overflow:hidden; white-space:nowrap; }
  .ticker-i { display:inline-block; animation:ticker-run 22s linear infinite; }
  .rise   { animation:rise 0.8s cubic-bezier(0.22,1,0.36,1) both; }
  .rise-1 { animation-delay:0.08s; }
  .rise-2 { animation-delay:0.20s; }
  .rise-3 { animation-delay:0.34s; }
  .anim-check { animation:check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* Products grid */
  .products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1px;
    background: var(--ink);
  }
  @media (min-width: 768px)  { .products-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

  .zc { position:relative; overflow:hidden; background: var(--paper); }

  .issue-label {
    writing-mode:vertical-rl; text-orientation:mixed; transform:rotate(180deg);
    font-family:'Space Mono',monospace; font-size:8px; letter-spacing:0.24em;
    text-transform:uppercase; color:rgba(242,239,232,0.45); user-select:none;
  }

  /* Buttons */
  .btn-z {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--ink); color:var(--paper);
    font-family:'Space Mono',monospace; font-weight:700;
    font-size:10px; letter-spacing:0.18em; text-transform:uppercase;
    padding:14px 28px; border:none; cursor:pointer;
    clip-path:polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%);
    transition:background 0.22s, transform 0.22s;
  }
  .btn-z:hover { background:var(--punch); transform:translateY(-2px); }
  .btn-z:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

  .btn-punch {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--punch); color:var(--paper);
    font-family:'Space Mono',monospace; font-weight:700;
    font-size:10px; letter-spacing:0.18em; text-transform:uppercase;
    padding:14px 28px; border:none; cursor:pointer;
    clip-path:polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%);
    transition:background 0.22s, transform 0.22s;
  }
  .btn-punch:hover { background:#CC2000; transform:translateY(-2px); }
  .btn-punch:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

  /* Inputs */
  .inp {
    width:100%; padding:12px 14px;
    background:var(--paper); border:1px solid var(--ink);
    font-family:'Space Mono',monospace; font-size:11px; color:var(--ink);
    outline:none; transition:box-shadow 0.2s;
  }
  .inp:focus { box-shadow:3px 3px 0 var(--punch); }
  .inp::placeholder { color:var(--mist); }
  .inp-err { border-color:var(--punch)!important; box-shadow:2px 2px 0 var(--punch)!important; }
  select.inp { appearance:none; cursor:pointer; }

  /* Sec bar */
  .sec-bar {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 20px; background:var(--ink);
  }

  /* Noise overlay */
  .noise-ov::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:3;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    mix-blend-mode:multiply; opacity:0.06;
  }

  /* Layout grids */
  .nav-ticker      { flex:1; margin:0 32px; overflow:hidden; border-left:1px solid var(--ink); border-right:1px solid var(--ink); padding:0 16px; height:100%; display:flex; align-items:center; }
  .stats-grid      { display:grid; grid-template-columns:repeat(4,1fr); }
  .details-split   { display:grid; grid-template-columns:1fr 1fr; }
  .details-img     { border-right:1px solid var(--ink); position:sticky; top:52px; height:calc(100vh - 52px); overflow:hidden; }
  .details-info    { padding:28px 26px; }
  .form-2c         { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .dlv-2c          { display:grid; grid-template-columns:1fr 1fr; border:1px solid var(--ink); }
  .cart-layout     { display:grid; grid-template-columns:1.2fr 1fr; gap:40px; align-items:start; }
  .contact-grid    { display:grid; grid-template-columns:1fr 1fr; gap:36px; }
  .cart-add-btns   { display:flex; gap:8px; }
  .pagination      { display:flex; justify-content:center; gap:6px; margin-top:40px; flex-wrap:wrap; }

  @media (max-width:1024px) { .cart-layout { grid-template-columns:1fr; } }
  @media (max-width:900px) {
    .details-split { grid-template-columns:1fr; }
    .details-img   { position:static; aspect-ratio:3/4; height:auto; width:100%; border-right:none; border-bottom:1px solid var(--ink); }
    .details-info  { padding:20px 16px; }
    .contact-grid  { grid-template-columns:1fr; gap:24px; }
  }
  @media (max-width:768px) {
    .zs-third { grid-template-columns:1fr 1fr; }
    .zs-main, .zs-flip { grid-template-columns:1fr 1fr; }
    .stats-grid { grid-template-columns:repeat(2,1fr); }
    .nav-ticker { display:none; }
  }
  @media (max-width:480px) {
    .zs-half, .zs-third, .zs-main, .zs-flip { grid-template-columns:1fr; }
    .form-2c  { grid-template-columns:1fr; }
    .dlv-2c   { grid-template-columns:1fr; }
    .cart-add-btns { flex-direction:column; }
    .zc { min-height:240px; }
  }

  .footer-cols { display:grid; grid-template-columns:1fr; gap:2rem; }
  @media(min-width:768px){.footer-cols{grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;}}
`;

/* ─── TYPES ─── */
interface Offer { id: string; name: string; subTitle?: string; quantity: number; price: number; shippingFree?: boolean; }
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
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; shippingFree?: boolean; isDigital?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
  store?: any;
}

const vm = (d: VariantDetail, s: Record<string, string>) =>
  Object.entries(s).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

const IS = (err?: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 13px', fontFamily: "'Space Mono',monospace", fontSize: '11px',
  background: 'var(--paper)', border: `1px solid ${err ? 'var(--punch)' : 'var(--ink)'}`, color: 'var(--ink)',
  outline: 'none', transition: 'box-shadow 0.2s', boxShadow: err ? '2px 2px 0 var(--punch)' : 'none', appearance: 'none',
});
const onF = (e: React.FocusEvent<any>) => { e.target.style.boxShadow = '3px 3px 0 var(--punch)'; };
const onB = (e: React.FocusEvent<any>, err?: boolean) => { e.target.style.boxShadow = err ? '2px 2px 0 var(--punch)' : 'none'; };

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '12px' }}>
    {label && <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--ash)', marginBottom: '5px', textTransform: 'uppercase' }}>{label}</p>}
    {children}
    {error && <p className="sm" style={{ fontSize: '8px', color: 'var(--punch)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: 4 }}>
      <AlertCircle style={{ width: '9px', height: '9px' }} />{error}
    </p>}
  </div>
);

/* ─── Full-screen menu overlay ─── */
function MenuOverlay({ store, onClose }: { store: any; onClose: () => void }) {
  const t = T[getLang(store)];
  const yr = new Date().getFullYear();
  const links = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
    { h: '/Privacy', l: t.privacy },
    { h: '/Terms', l: t.terms },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--ink)', display: 'flex', flexDirection: 'column', animation: 'menu-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid rgba(242,239,232,0.1)' }}>
        <span className="ub" style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--punch)', letterSpacing: '0.04em' }}>{store?.name?.toUpperCase()}</span>
        <button onClick={onClose} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(242,239,232,0.2)', background: 'transparent', color: 'var(--paper)', cursor: 'pointer' }}>
          <X style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px' }}>
        {links.map(lnk => (
          <Link key={lnk.h} href={lnk.h} onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid rgba(242,239,232,0.07)', transition: 'padding-right 0.25s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.paddingRight = '16px'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.paddingRight = '0'; }}>
            <span className="ub" style={{ fontWeight: 900, fontSize: 'clamp(2rem,7vw,5.5rem)', color: 'var(--paper)', letterSpacing: '-0.02em', lineHeight: 1 }}>{lnk.l}</span>
            <ArrowUpRight style={{ width: '28px', height: '28px', color: 'var(--punch)', opacity: 0.7 }} />
          </Link>
        ))}
      </div>
      <div style={{ padding: '16px 32px', borderTop: '1px solid rgba(242,239,232,0.1)', display: 'flex', justifyContent: 'space-between' }}>
        <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'rgba(242,239,232,0.25)' }}>{t.menuBottomText} · {yr}</span>
        <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--punch)' }}>© {yr}</span>
      </div>
    </div>
  );
}

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
  freeShippingBadge: '🚚 توصيل مجاني',
  freeShippingThreshold: '🚚 توصيل مجاني للطلبات بـ {{amount}} دج أو أكثر',
  freeShippingRemaining: 'أضف {{amount}} دج أخرى للحصول على توصيل مجاني',
  freeShippingReached: '🎉 حصلت على توصيل مجاني!',
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
  // Footer
  quickLinks: 'روابط سريعة', legalNav: 'قانوني',
  contactSect: 'تواصل معنا',
  privacy: 'الخصوصية',
  terms: 'الشروط',
  cookies: 'الكوكيز',
  rightsReserved: 'جميع الحقوق محفوظة',
  // Extended
  currency: 'دج',
  heroSubFallback: 'مجموعة ملابس الشارع الأصيلة. كل قطعة بقصة. توصيل سريع لجميع الولايات.',
  shopCollection: '↓ شوف الكولكشن',
  categoriesLabel: 'تصفح حسب الستايل',
  productCountSuffix: 'قطعة',
  viewProduct: 'شوف القطعة',
  footerDesc: 'متجر الستايل الأصيل. كل قطعة بقصة. توصيل سريع لجميع الولايات.',
  footerLinksTitle: '// الروابط',
  footerContactTitle: '// تواصل',
  footerAvailable: 'متاحون الآن ↗',
  menuBottomText: 'ZINE DROP · الجزائر',
  offerQtyLabel: 'كمية:',
  addedToCartMsg: 'أُضيف للسلة',
  cancelLabel: 'إلغاء',
  secureText: 'آمن · مشفر',
  deleteLabel: 'حذف',
  contactTitle: 'تواصل معنا.',
  contactSubtitle: 'نرد خلال 24 ساعة',
  contactInfoLabel: '/ معلومات الاتصال',
  contactPhoneLabel: 'الهاتف',
  contactLocationLabel: 'الموقع',
  contactEmailLabel: 'البريد',
  contactFormLabel: '/ أرسل رسالة',
  contactNamePh: 'الاسم',
  contactPhonePh: 'الهاتف',
  contactEmailPh: 'البريد الإلكتروني',
  contactMessagePh: 'كيف يمكننا مساعدتك؟',
  contactSend: 'إرسال الرسالة',
  contactSentMsg: 'سنرد خلال 24 ساعة',
  contactSending: 'جاري...',
  contactErr: 'حدث خطأ',
  privacyTitle: 'الخصوصية',
  priv1t: 'البيانات التي نجمعها',
  priv1b: 'الاسم ورقم الهاتف وعنوان التوصيل فقط — الحد الأدنى اللازم لمعالجة طلبك.',
  priv2t: 'كيف نستخدمها',
  priv2b: 'حصرياً لمعالجة وتوصيل طلبك. لا تسويق، لا بيع بيانات.',
  priv3t: 'الأمان',
  priv3b: 'تشفير عالي المستوى. بياناتك محمية في جميع الأوقات.',
  priv4t: 'مشاركة البيانات',
  priv4b: 'لا نبيع بياناتك أبداً. تُشارك فقط مع شركاء التوصيل.',
  priv4tag: 'مضمون',
  termsTitle: 'الشروط',
  terms1t: 'الطلبات',
  terms1b: 'لا رسوم خفية. السعر المعروض هو السعر النهائي.',
  terms2t: 'المنتجات الأصيلة',
  terms2b: 'منتجات أصيلة فقط. السلع المقلدة ممنوعة.',
  terms2tag: 'صارم',
  terms3t: 'القانون المعمول به',
  terms3b: 'تخضع هذه الشروط لقوانين الجمهورية الجزائرية الديمقراطية الشعبية.',
  cookiesTitle: 'الكوكيز',
  cook1t: 'ضرورية',
  cook1b: 'مطلوبة للجلسات والسلة وإتمام الطلب. لا يمكن تعطيلها.',
  cook1tag: 'دائماً مفعلة',
  cook2t: 'التفضيلات',
  cook2b: 'تحفظ إعداداتك لتجربة أفضل.',
  cook2tag: 'اختياري',
  cook3t: 'التحليلات',
  cook3b: 'بيانات مجمعة لتحسين المنصة. لا بيانات شخصية.',
  cook3tag: 'اختياري',
  cookManage: 'MANAGE YOUR COOKIES',
  cookManageDesc: 'يمكنك إدارة أو حذف ملفات الارتباط من إعدادات المتصفح الخاص بك في أي وقت.',
  // Hero & Home extras
  heroTag: 'الإصدار الأول · ملابس الشارع',
  heroTitle1: 'ارتدِ',
  heroTitle2: 'هويتك',
  categoriesBtn: 'الأقسام',
  stat1: 'أصيل',
  stat2: 'قطعة',
  stat3: 'توصيل',
  stat4: 'محلي',
  manifestoLine1: 'ما تلبسه',
  manifestoLine2: 'يقول من أنت.',
  contactCulture: 'DROP CULTURE · الجزائر',
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
  freeShippingBadge: '🚚 Livraison gratuite',
  freeShippingThreshold: '🚚 Livraison gratuite dès {{amount}} DZD d\'achat',
  freeShippingRemaining: 'Ajoutez {{amount}} DZD de plus pour la livraison gratuite',
  freeShippingReached: '🎉 Livraison gratuite obtenue !',
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
  // Footer
  quickLinks: 'Navigation', legalNav: 'Légal',
  contactSect: 'Contact',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  cookies: 'Cookies',
  rightsReserved: 'Tous droits réservés.',
  // Extended
  currency: 'DZD',
  heroSubFallback: "La collection streetwear authentique. Chaque pièce raconte une histoire. Livraison rapide dans toutes les wilayas.",
  shopCollection: '↓ Voir la collection',
  categoriesLabel: 'Parcourir par style',
  productCountSuffix: 'pièce(s)',
  viewProduct: 'Voir la pièce',
  footerDesc: "Boutique de style authentique. Chaque pièce raconte une histoire. Livraison rapide dans toutes les wilayas.",
  footerLinksTitle: '// Navigation',
  footerContactTitle: '// Contact',
  footerAvailable: 'Disponibles maintenant ↗',
  menuBottomText: 'ZINE DROP · Algérie',
  offerQtyLabel: 'Qté:',
  addedToCartMsg: 'Ajouté ✓',
  cancelLabel: 'Annuler',
  secureText: 'Sécurisé · Chiffré',
  deleteLabel: 'Supprimer',
  contactTitle: 'Contactez-nous.',
  contactSubtitle: 'Réponse sous 24h',
  contactInfoLabel: '/ Informations de contact',
  contactPhoneLabel: 'Téléphone',
  contactLocationLabel: 'Adresse',
  contactEmailLabel: 'E-mail',
  contactFormLabel: '/ Envoyer un message',
  contactNamePh: 'Nom',
  contactPhonePh: 'Téléphone',
  contactEmailPh: 'Adresse e-mail',
  contactMessagePh: 'Comment pouvons-nous vous aider ?',
  contactSend: 'Envoyer le message',
  contactSentMsg: 'Nous vous répondrons sous 24h',
  contactSending: 'Envoi...',
  contactErr: 'Une erreur est survenue',
  privacyTitle: 'Confidentialité',
  priv1t: 'Données collectées',
  priv1b: "Nom, téléphone et adresse de livraison uniquement — le minimum requis pour traiter votre commande.",
  priv2t: 'Utilisation des données',
  priv2b: 'Uniquement pour traiter et livrer votre commande. Pas de marketing, pas de vente de données.',
  priv3t: 'Sécurité',
  priv3b: 'Chiffrement de haut niveau. Vos données sont protégées en permanence.',
  priv4t: 'Partage des données',
  priv4b: "Nous ne vendons jamais vos données. Partagées uniquement avec nos partenaires de livraison.",
  priv4tag: 'Garanti',
  termsTitle: 'Conditions',
  terms1t: 'Commandes',
  terms1b: 'Aucun frais caché. Le prix affiché est le prix final.',
  terms2t: 'Produits authentiques',
  terms2b: 'Produits authentiques uniquement. Les contrefaçons sont interdites.',
  terms2tag: 'Strict',
  terms3t: 'Droit applicable',
  terms3b: "Ces conditions sont régies par les lois de la République Algérienne Démocratique et Populaire.",
  cookiesTitle: 'Cookies',
  cook1t: 'Nécessaires',
  cook1b: 'Requis pour les sessions, le panier et la validation de commande. Ne peuvent pas être désactivés.',
  cook1tag: 'Toujours actifs',
  cook2t: 'Préférences',
  cook2b: 'Sauvegarde vos paramètres pour une meilleure expérience.',
  cook2tag: 'Optionnel',
  cook3t: 'Analytiques',
  cook3b: 'Données agrégées pour améliorer la plateforme. Aucune donnée personnelle.',
  cook3tag: 'Optionnel',
  cookManage: 'GÉRER VOS COOKIES',
  cookManageDesc: 'Vous pouvez gérer ou supprimer les cookies depuis les paramètres de votre navigateur à tout moment.',
  // Hero & Home extras
  heroTag: 'Édition 1 · Streetwear',
  heroTitle1: 'Exprime',
  heroTitle2: 'ton style',
  categoriesBtn: 'Catégories',
  stat1: 'Authentique',
  stat2: 'pièce(s)',
  stat3: 'Livraison',
  stat4: 'Local',
  manifestoLine1: 'Ce que tu portes',
  manifestoLine2: 'dit qui tu es.',
  contactCulture: 'DROP CULTURE · Algérie',
};

type Lang = 'ar' | 'fr' | 'en';
const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr as any, en: jsonFr as any };

export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', fontFamily: "'Space Mono',monospace", color: 'var(--ink)' }}>
      <style>{CSS}</style>
      {menuOpen && <MenuOverlay store={store} onClose={() => setMenuOpen(false)} />}
      <Navbar store={store} domain={domain} onMenuOpen={() => setMenuOpen(true)} />
      <main style={{ paddingTop: '52px' }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════ */
export function Navbar({ store, domain, onMenuOpen }: { store: any; domain: string; onMenuOpen?: () => void }) {
  const t = T[getLang(store)];
  const cur = store?.currency || t.currency;
  const [sq, setSq] = useState('');
  const [ls, setLs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { initCount(JSON.parse(localStorage.getItem(domain) || '[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (sq.length < 2) { setLs([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: sq } }); setLs(data.products || []); }
      catch { } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [sq, domain]);

  const doSearch = (e?: React.FormEvent) => { if (e) e.preventDefault(); if (sq.trim()) { router.push(`/?search=${encodeURIComponent(sq)}`); setSq(''); setShowSearch(false); } };

  const Drop = () => (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      left: 0,
      background: '#FFFFFF', // خلفية بيضاء صلبة كما طلبت
      border: '2px solid var(--ink)', // إطار سميك وواضح
      zIndex: 200,
      borderTop: '4px solid var(--punch)', // تمييز علوي بلون الـ Punch (الأحمر)
      boxShadow: '6px 6px 0 var(--ink)', // ظل حاد صلب غير شفاف
      overflow: 'hidden'
    }} className="anim-slide-down">

      {/* زر إغلاق علوي سريع - متماشٍ مع التصميم الحاد */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '8px',
        background: 'var(--paper-dk)',
        borderBottom: '1px solid var(--ink)'
      }}>
        <button
          onClick={() => setSq('')}
          style={{
            background: 'var(--punch)',
            border: '1px solid var(--ink)',
            color: 'white',
            padding: '2px',
            cursor: 'pointer',
            display: 'flex',
            boxShadow: '2px 2px 0 var(--ink)'
          }}
        >
          <X size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ash)', fontWeight: 700 }}>
          {t.searching}
        </div>
      ) : ls.length > 0 ? (
        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {ls.map((p: any) => (
            <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSq('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '12px 14px',
                borderBottom: '2px solid var(--paper-dk)',
                textDecoration: 'none',
                transition: 'transform 0.1s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fcfcfc'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
            >
              <img
                src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                style={{
                  width: 45,
                  height: 45,
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '2px solid var(--ink)'
                }}
                alt=""
              />
              <div style={{ flex: 1 }}>
                <div className="ub" style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  letterSpacing: '0.02em',
                  lineHeight: '1.2'
                }}>
                  {p.name.toUpperCase().slice(0, 30)}
                </div>
                <div className="ub" style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  color: 'var(--punch)',
                  marginTop: '2px'
                }}>
                  {p.price} {cur}
                </div>
              </div>
            </Link>
          ))}

          <button
            onClick={() => doSearch()}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--ink)',
              color: 'white',
              border: 'none',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {t.showAll} <ArrowLeft size={12} />
          </button>
        </div>
      ) : sq.length >= 2 && (
        <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '9px', letterSpacing: '0.15em', color: 'var(--mist)' }}>
          {t.noResults}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header dir={t.dir} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: '52px', backgroundColor: 'var(--paper)', borderBottom: '1px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontFamily: "'Space Mono',monospace" }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png'
          ? <img src={store.design.logoUrl} alt={store.name} style={{ height: '28px', width: 'auto', objectFit: 'contain', maxWidth: 160 }} />
          : <span className="ub" style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--ink)', letterSpacing: '0.02em' }}>{store?.name?.toUpperCase()}</span>
        }
      </Link>

      {/* TopBar text in center */}
      <div style={{ flex: 1, textAlign: 'center', overflow: 'hidden', padding: '0 16px' }}>
        {store?.topBar?.text && (
          <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.18em', color: 'var(--punch)', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {store.topBar.text}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowSearch(!showSearch)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid var(--ink)', cursor: 'pointer', color: 'var(--ink)' }}>
            <Search style={{ width: '13px', height: '13px' }} />
          </button>
          {showSearch && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', ...(t.dir === 'rtl' ? { left: 0 } : { right: 0 }), width: '260px', zIndex: 100 }}>
              <form onSubmit={doSearch} style={{ position: 'relative' }}>
                <input autoFocus dir={t.dir} type="text" placeholder={t.search} value={sq} onChange={e => setSq(e.target.value)}
                  style={{ ...IS(), ...(t.dir === 'rtl' ? { paddingLeft: '36px' } : { paddingRight: '36px' }) }} onFocus={onF} onBlur={e => onB(e)} />
                <Search size={12} style={{ position: 'absolute', ...(t.dir === 'rtl' ? { left: 10 } : { right: 10 }), top: '50%', transform: 'translateY(-50%)', color: 'var(--mist)' }} />
              </form>
              {sq.length >= 2 && <Drop />}
            </div>
          )}
        </div>
        {/* Cart */}
        {store?.cart !== false && (
        <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', border: '1px solid var(--ink)', background: 'none', color: 'var(--ink)', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink)'; (e.currentTarget as HTMLElement).style.color = 'var(--paper)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; }}>
          <ShoppingCart style={{ width: '13px', height: '13px' }} />
          {count > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--punch)', color: 'var(--paper)', fontSize: '8px', fontWeight: 700, minWidth: '16px', height: '16px', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{count}</span>}
        </Link>
        )}
        {/* Menu */}
        <button onClick={onMenuOpen} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '8px', letterSpacing: '0.22em', color: 'var(--ink)' }}>
          MENU
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ display: 'block', width: '20px', height: '1.5px', background: 'var(--ink)' }} />
            <span style={{ display: 'block', width: '14px', height: '1.5px', background: 'var(--ink)' }} />
          </div>
        </button>
      </div>
    </header>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — 3 أقسام
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const yr = new Date().getFullYear();
  return (
    <footer dir={t.dir} className="noise-ov" style={{ backgroundColor: 'var(--ink)', color: 'var(--paper)', position: 'relative', overflow: 'hidden', fontFamily: "'Space Mono',monospace" }}>
      {/* Ghost watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
        <span className="ub" style={{ fontWeight: 900, fontSize: 'clamp(6rem,22vw,20rem)', color: 'rgba(242,239,232,0.025)', letterSpacing: '-0.05em', whiteSpace: 'nowrap', lineHeight: 1 }}>
          {store?.name?.toUpperCase()}
        </span>
      </div>

      {/* Red punch bar */}
      <div style={{ position: 'relative', zIndex: 2, backgroundColor: 'var(--punch)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="ub" style={{ fontWeight: 900, fontSize: 'clamp(1.5rem,4vw,3.5rem)', letterSpacing: '-0.02em', color: 'var(--paper)', lineHeight: 1 }}>
          {store?.name?.toUpperCase()}
        </span>
        <span style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'rgba(242,239,232,0.65)' }}>EST. {yr}</span>
      </div>

      {/* 3 columns */}
      <div className="footer-cols" style={{ position: 'relative', zIndex: 2, padding: '40px 24px', borderBottom: '1px solid rgba(242,239,232,0.1)' }}>

        {/* قسم 1 — الهوية */}
        <div>
          <p style={{ fontSize: '13px', lineHeight: '1.8', letterSpacing: '0.05em', color: 'rgba(242,239,232,0.45)', maxWidth: '300px', marginBottom: '20px' }}>
            {store?.hero?.subtitle?.substring(0, 90) || t.footerDesc}
          </p>
          <p style={{ fontSize: '10px', letterSpacing: '0.08em', color: 'rgba(242,239,232,0.2)' }}>© {yr} {store?.name}. {t.rightsReserved}.</p>
        </div>

        {/* قسم 2 — روابط */}
        <div>
          <p style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--punch)', marginBottom: '14px', textTransform: 'uppercase' }}>{t.footerLinksTitle}</p>
          {[{ h: '/', l: t.home }, { h: '/cart', l: t.cart }, { h: '/contact', l: t.contact }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map(lnk => (
            <a key={lnk.h} href={lnk.h} style={{ display: 'block', fontSize: '10px', color: 'rgba(242,239,232,0.35)', marginBottom: '8px', transition: 'color 0.2s', letterSpacing: '0.08em' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--punch)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(242,239,232,0.35)'; }}>
              {lnk.l} ↗
            </a>
          ))}
        </div>

        {/* قسم — قانوني */}
        <div>
          <p style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--punch)', marginBottom: '14px', textTransform: 'uppercase' }}>{t.legalNav}</p>
          {[{ h: '/privacy', l: t.privacy }, { h: '/terms', l: t.terms }, { h: '/cookies', l: t.cookies }].map(lnk => (
            <a key={lnk.h} href={lnk.h} style={{ display: 'block', fontSize: '10px', color: 'rgba(242,239,232,0.35)', marginBottom: '8px', transition: 'color 0.2s', letterSpacing: '0.08em' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--punch)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(242,239,232,0.35)'; }}>
              {lnk.l} ↗
            </a>
          ))}
        </div>

        {/* قسم 3 — تواصل */}
        <div>
          <p style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--punch)', marginBottom: '14px', textTransform: 'uppercase' }}>{t.footerContactTitle}</p>
          {[
            { e: '📞', v: store?.contact?.phone },
            { e: '📍', v: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            { e: '✉️', v: store?.contact?.email },
          ].filter(r => r.v).map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '9px' }}>
              <span style={{ fontSize: '12px' }}>{r.e}</span>
              <span style={{ fontSize: '10px', color: 'rgba(242,239,232,0.4)', letterSpacing: '0.04em' }}>{r.v}</span>
            </div>
          ))}
          <div style={{ marginTop: '14px', padding: '12px 14px', border: '1px solid var(--punch)', background: 'rgba(255,45,0,0.08)' }}>
            <p className="ub" style={{ fontSize: '12px', fontWeight: 900, color: 'var(--punch)', marginBottom: 2 }}>{t.footerAvailable}</p>
            <p style={{ fontSize: '8px', color: 'rgba(242,239,232,0.3)', letterSpacing: '0.1em' }}>REPLY WITHIN 24H</p>
          </div>
        </div>

      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '12px 24px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '8px', letterSpacing: '0.16em', color: 'rgba(242,239,232,0.18)' }}>ZINE DROP THEME</span>
        <span style={{ fontSize: '8px', letterSpacing: '0.16em', color: 'rgba(242,239,232,0.18)' }}>v2.0 / {yr}</span>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   CARD — Zine Cell
══════════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const t = T[getLang(store)];
  const cur = store?.currency || t.currency;
  const [hov, setHov] = useState(false);
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.originalPrice ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice) : 0;
  return (
    <Link href={`/product/${product.slug || product.id}`} style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', background: 'var(--paper)', height: '100%' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {/* Image area */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--paper-dk)', flexShrink: 0 }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)', transform: hov ? 'scale(1.04)' : 'scale(1)' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="ub" style={{ fontWeight: 900, fontSize: '3rem', color: 'rgba(10,9,6,0.08)' }}>?</span>
            </div>
        }
        {discount > 0 && (
          <div className="sm" style={{ position: 'absolute', top: 10, right: 10, background: 'var(--punch)', color: 'var(--paper)', fontWeight: 700, fontSize: '10px', padding: '3px 8px', letterSpacing: '0.06em' }}>
            -{discount}%
          </div>
        )}
        {product.isDigital ? (
          <div className="sm" style={{ position: 'absolute', top: 10, left: 10, background: 'var(--punch)', color: 'var(--paper)', fontWeight: 700, fontSize: '10px', padding: '3px 8px', display: 'flex', alignItems: 'center' }}>
            <Download size={12} />
          </div>
        ) : product.shippingFree && (
          <div className="sm" style={{ position: 'absolute', top: 10, left: 10, background: 'var(--ink)', color: 'var(--paper)', fontWeight: 700, fontSize: '10px', padding: '3px 8px' }}>
            🚚
          </div>
        )}
        {/* Quick view on hover */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--ink)', color: 'var(--paper)', textAlign: 'center', padding: '10px', fontSize: '10px', letterSpacing: '0.2em', fontWeight: 700, fontFamily: 'inherit', transform: hov ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span className="sm">{viewDetails || t.viewProduct}</span>
          <ArrowUpRight size={11} />
        </div>
      </div>
      {/* Info area */}
      <div style={{ padding: '12px 12px 14px', borderTop: '1px solid rgba(10,9,6,0.07)', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h3 className="sm" style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--ink)', letterSpacing: '0.03em', lineHeight: 1.35, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
          <span className="ub" style={{ fontWeight: 900, fontSize: '1rem', color: hov ? 'var(--punch)' : 'var(--ink)', letterSpacing: '-0.02em', transition: 'color 0.2s' }}>
            {price.toLocaleString()}
            <span style={{ fontWeight: 400, fontSize: '0.6em', marginRight: 3, opacity: 0.6 }}>{cur}</span>
          </span>
          {orig > price && (
            <span className="sm" style={{ fontSize: '0.72rem', color: 'rgba(10,9,6,0.35)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
const COUNTS = [2, 3, 1, 2, 3, 1, 2];
const CLASSES = ['zs-half', 'zs-third', 'zs-wide', 'zs-half', 'zs-third', 'zs-wide', 'zs-flip'];

export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir={t.dir} style={{ backgroundColor: 'var(--paper)' }}>

      {/* ── POSTER HERO ── */}
      <section className="noise-ov" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--ink)', overflow: 'hidden' }}>
        {store.hero?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1, filter: 'grayscale(100%) contrast(1.5)' }} />
          </div>
        )}
        {/* Number watermark */}
        <div style={{ position: 'absolute', right: '-4%', top: '-6%', pointerEvents: 'none', userSelect: 'none', zIndex: 1 }}>
          <span className="ub" style={{ fontWeight: 900, fontSize: 'clamp(14rem,42vw,40rem)', color: 'rgba(242,239,232,0.022)', letterSpacing: '-0.06em', lineHeight: 1, display: 'block' }}>001</span>
        </div>
        {/* Left stripe */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'var(--punch)', zIndex: 3 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '8vw 6vw 0 7vw', position: 'relative', zIndex: 4 }}>
          {/* Issue tag */}
          <div className="rise" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
            <div style={{ width: '36px', height: '1.5px', background: 'var(--punch)' }} />
            <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.28em', color: 'var(--punch)' }}>{t.heroTag} · {new Date().getFullYear()}</span>
          </div>

          <h1 className="ub rise rise-1" style={{ fontWeight: 900, fontSize: 'clamp(4rem,15vw,14rem)', letterSpacing: '-0.04em', lineHeight: 0.86, color: 'var(--paper)', textTransform: 'uppercase', marginBottom: 0 }}>
            {store.hero?.title
              ? store.hero.title.toUpperCase()
              : <><span>{t.heroTitle1}</span><br /><span style={{ color: 'var(--punch)' }}>{t.heroTitle2}</span></>
            }
          </h1>

          <div className="rise rise-2" style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(242,239,232,0.14)', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
            <p className="sm" style={{ fontSize: '11px', lineHeight: '1.9', color: 'rgba(242,239,232,0.5)', maxWidth: '400px', letterSpacing: '0.05em' }}>
              {store.hero?.subtitle || t.heroSubFallback}
            </p>
            <div className="rise rise-3" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="#drops" className="btn-z">{t.shopCollection}</a>
              {cats.length > 0 && (
                <a href="#cats" className="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '9px', letterSpacing: '0.18em', color: 'rgba(242,239,232,0.35)', border: '1px solid rgba(242,239,232,0.14)', padding: '14px 22px', transition: 'all 0.22s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--paper)'; el.style.borderColor = 'rgba(242,239,232,0.4)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(242,239,232,0.35)'; el.style.borderColor = 'rgba(242,239,232,0.14)'; }}>
                  {t.categoriesBtn} <ArrowLeft style={{ width: '12px', height: '12px' }} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="stats-grid" style={{ position: 'relative', zIndex: 4, borderTop: '1px solid rgba(242,239,232,0.1)', marginTop: '40px' }}>
          {[{ n: '100%', l: t.stat1 }, { n: `${products.length || '∞'}`, l: t.stat2 }, { n: '48H', l: t.stat3 }, { n: 'DZ', l: t.stat4 }].map((s, i) => (
            <div key={i} style={{ padding: '16px 20px', borderRight: i < 3 ? '1px solid rgba(242,239,232,0.08)' : 'none' }}>
              <div className="ub" style={{ fontWeight: 900, fontSize: 'clamp(1.2rem,2.5vw,2.2rem)', color: i === 0 ? 'var(--punch)' : 'var(--paper)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.n}</div>
              <div className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'rgba(242,239,232,0.28)', marginTop: '4px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (
        <div id="cats" style={{ borderBottom: '1px solid var(--ink)', display: 'flex', alignItems: 'stretch', overflowX: 'auto' }}>
          <div style={{ flexShrink: 0, padding: '10px 18px', borderRight: '1px solid var(--ink)', display: 'flex', alignItems: 'center' }}>
            <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)', whiteSpace: 'nowrap' }}>{t.categoriesLabel}</span>
          </div>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', padding: '10px 22px', borderRight: '1px solid var(--ink)', fontSize: '8px', letterSpacing: '0.18em', backgroundColor: 'var(--ink)', color: 'var(--punch)', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase' }}>
            ★ {t.all}
          </Link>
              {cats.map((cat: any) => (
            <Link key={cat.id} href={`?category=${cat.id}`} style={{ display: 'flex', alignItems: 'center', padding: '10px 22px', borderRight: '1px solid var(--ink)', fontSize: '8px', letterSpacing: '0.18em', color: 'var(--ink)', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase', transition: 'background 0.2s,color 0.2s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--ink)'; el.style.color = 'var(--punch)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--ink)'; }}>
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* ── PRODUCTS — Zine strips ── */}
      <section id="drops">
        <div className="sec-bar">
          <span className="ub" style={{ fontWeight: 900, fontSize: 'clamp(0.7rem,1.4vw,0.95rem)', color: 'var(--paper)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t.all}</span>
          <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'rgba(242,239,232,0.4)' }}>{products.length} {t.productCountSuffix}</span>
        </div>

        {products.length === 0 ? (
          <div style={{ minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--ink)', margin: '1px' }}>
            <span className="ub" style={{ fontWeight: 900, fontSize: 'clamp(4rem,12vw,10rem)', color: 'rgba(10,9,6,0.05)', letterSpacing: '-0.04em' }}>SOON</span>
            <p className="sm" style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'var(--mist)', marginTop: '16px' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails={t.viewProduct} />;
            })}
          </div>
        )}

        {/* Pagination */}
        {countPage > 1 && (
          <div className="pagination" dir="rtl" style={{ padding: '0 0 40px' }}>
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
              style={{ width: 40, height: 40, border: '1px solid var(--ink)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', opacity: page <= 1 ? 0.3 : 1 }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false}
                  style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', letterSpacing: '0.1em', border: `1px solid ${isA ? 'var(--punch)' : 'var(--ink)'}`, background: isA ? 'var(--punch)' : 'transparent', color: isA ? 'var(--paper)' : 'var(--ink)' }}>
                  {pn}
                </Link>
              );
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
              style={{ width: 40, height: 40, border: '1px solid var(--ink)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', opacity: page >= countPage ? 0.3 : 1 }}>❯</Link>
          </div>
        )}
      </section>

      {/* ── MANIFESTO ── */}
      <section style={{ backgroundColor: 'var(--punch)', padding: '60px 6vw', position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--ink)' }}>
        <div style={{ position: 'absolute', right: '-2%', bottom: '-15%', pointerEvents: 'none', userSelect: 'none', opacity: 0.1 }}>
          <span className="ub" style={{ fontWeight: 900, fontSize: 'clamp(10rem,30vw,28rem)', color: 'var(--paper)', letterSpacing: '-0.05em', lineHeight: 1 }}>RAW</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p className="ub" style={{ fontWeight: 900, fontSize: 'clamp(2.2rem,6vw,5.5rem)', color: 'var(--paper)', letterSpacing: '-0.03em', lineHeight: 0.88, marginBottom: '28px', textTransform: 'uppercase' }}>
            <span>{t.manifestoLine1}</span><br /><span>{t.manifestoLine2}</span>
          </p>
          <a href="#drops" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--punch)', background: 'var(--paper)', padding: '14px 28px', textTransform: 'uppercase', clipPath: 'polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%)', transition: 'background 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink)'; (e.currentTarget as HTMLElement).style.color = 'var(--paper)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--paper)'; (e.currentTarget as HTMLElement).style.color = 'var(--punch)'; }}>
            {t.shopNow} <ArrowUpRight style={{ width: '14px', height: '14px' }} />
          </a>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETAILS
══════════════════════════════════════════════════════════════ */
export function Details({ product, store, toggleWishlist, isWishlisted, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const t = T[getLang(store)];
  const cur = store?.currency || t.currency;
  const [sel, setSel] = useState(0);
  if (!product) return null;
  return (
    <div dir={t.dir} style={{ backgroundColor: 'var(--paper)', fontFamily: "'Space Mono',monospace" }}>
      

      <div className="details-split">
        {/* Gallery */}
        <div className="details-img">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {allImages.length > 0
              ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper-dk)' }}>
                <span className="ub" style={{ fontWeight: 900, fontSize: '5rem', color: 'rgba(10,9,6,0.1)' }}>?</span>
              </div>
            }
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(10,9,6,0.88) 0%,transparent 50%)', padding: '24px 20px 20px', pointerEvents: 'none' }}>
              {discount > 0 && <div className="ub" style={{ display: 'inline-block', background: 'var(--punch)', color: 'var(--paper)', fontWeight: 900, fontSize: '11px', padding: '3px 12px', marginBottom: '10px', transform: 'rotate(-1.5deg)' }}>-{discount}% OFF</div>}
              <div className="ub" style={{ fontWeight: 900, fontSize: 'clamp(2rem,5vw,4rem)', color: 'var(--paper)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {finalPrice.toLocaleString()}
                <span className="sm" style={{ fontWeight: 400, fontSize: '1rem', marginLeft: '8px', opacity: 0.65 }}>{cur}</span>
              </div>
            </div>
            {allImages.length > 1 && (
              <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {allImages.slice(0, 5).map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSel(idx)} style={{ width: '40px', height: '40px', overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--punch)' : 'rgba(255,255,255,0.3)'}`, cursor: 'pointer', opacity: sel === idx ? 1 : 0.5, padding: 0, background: 'none' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}
            
          </div>
        </div>

        {/* Info */}
        <div className="details-info">
          <h1 className="ub" style={{ fontWeight: 900, fontSize: 'clamp(1.5rem,3.5vw,3rem)', color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '16px' }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px', paddingBottom: '22px', borderBottom: '1px solid var(--ink)' }}>
            {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '11px', height: '11px', fill: i < 4 ? 'var(--punch)' : 'none', color: 'var(--punch)' }} />)}
          </div>

          {/* Price */}
          <div style={{ marginBottom: '22px', paddingBottom: '22px', borderBottom: '1px solid var(--paper-dk)' }}>
            <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)', marginBottom: '4px' }}>RETAIL PRICE</p>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '10px' }}>
              <span className="ub" style={{ fontWeight: 900, fontSize: '3.2rem', color: 'var(--punch)', letterSpacing: '-0.03em', lineHeight: 1 }}>{finalPrice.toLocaleString()}</span>
              <span className="sm" style={{ fontSize: '1rem', color: 'var(--ash)' }}>{cur}</span>
              {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                <span className="sm" style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--mist)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
              )}
            </div>
          </div>

          {(product.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
            <p className="sm" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--punch)', marginBottom: '18px' }}>
              {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', String(store.freeShippingMinAmount))}
            </p>
          )}

          {/* Offers */}
          {product.offers?.length > 0 && (
            <div style={{ marginBottom: '22px', paddingBottom: '22px', borderBottom: '1px solid var(--paper-dk)' }}>
              <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)', marginBottom: '10px' }}>SELECT BUNDLE</p>
              {product.offers.map((o: any) => (
                <label key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', border: `1px solid ${selectedOffer === o.id ? 'var(--ink)' : 'var(--paper-dk)'}`, backgroundColor: selectedOffer === o.id ? 'var(--ink)' : 'transparent', cursor: 'pointer', marginBottom: '5px', transition: 'all 0.18s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '13px', height: '13px', border: `1px solid ${selectedOffer === o.id ? 'var(--paper)' : 'var(--ink)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectedOffer === o.id && <div style={{ width: '7px', height: '7px', background: 'var(--punch)' }} />}
                    </div>
                    <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                    <div>
                      <p className="sm" style={{ fontSize: '10px', fontWeight: 700, color: selectedOffer === o.id ? 'var(--paper)' : 'var(--ink)', letterSpacing: '0.08em' }}>{o.name}</p>
                      {o.subTitle && <p className="sm" style={{ fontSize: '8px', color: selectedOffer === o.id ? 'rgba(242,239,232,0.5)' : 'var(--ash)', letterSpacing: '0.1em', marginTop: '2px' }}>{o.subTitle}</p>}
                      <p className="sm" style={{ fontSize: '8px', color: selectedOffer === o.id ? 'rgba(242,239,232,0.5)' : 'var(--ash)', letterSpacing: '0.12em' }}>{t.offerQtyLabel} {o.quantity}</p>
                      {o.shippingFree && <p className="sm" style={{ fontSize: '8px', fontWeight: 700, color: 'var(--punch)', letterSpacing: '0.1em', marginTop: '2px' }}>{t.freeShippingBadge}</p>}
                    </div>
                  </div>
                  <span className="ub" style={{ fontWeight: 900, fontSize: '1.1rem', color: selectedOffer === o.id ? 'var(--punch)' : 'var(--ink)', letterSpacing: '-0.02em' }}>{o.price.toLocaleString()}<span className="sm" style={{ fontWeight: 400, fontSize: '9px', marginLeft: '3px' }}>{cur}</span></span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map((attr: any) => (
            <div key={attr.id} style={{ marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid var(--paper-dk)' }}>
              <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)', marginBottom: '9px' }}>/ {attr.name.toUpperCase()}</p>
              {attr.displayMode === 'color' ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val))); return <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: '30px', height: '30px', backgroundColor: v.value, border: `3px solid ${s ? 'var(--ink)' : 'transparent'}`, cursor: available ? 'pointer' : 'not-allowed', outline: s ? '2px solid var(--punch)' : 'none', outlineOffset: '2px', opacity: available ? 1 : 0.35 }} />; })}
                </div>
              ) : attr.displayMode === 'image' ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val))); return <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ width: '48px', height: '48px', overflow: 'hidden', border: `2px solid ${s ? 'var(--punch)' : 'var(--paper-dk)'}`, cursor: available ? 'pointer' : 'not-allowed', padding: 0, opacity: available ? 1 : 0.35 }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>; })}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val))); return <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} className="sm" style={{ padding: '7px 14px', border: `1px solid ${s ? 'var(--ink)' : 'var(--paper-dk)'}`, backgroundColor: s ? 'var(--ink)' : 'transparent', color: s ? 'var(--paper)' : (available ? 'var(--ink)' : '#bbb'), fontSize: '10px', letterSpacing: '0.12em', cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.18s', textDecoration: available ? 'none' : 'line-through' }}>{v.name}</button>; })}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} store={store} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

          {product.desc && (
            <div style={{ marginTop: '28px', paddingTop: '22px', borderTop: '1px solid var(--ink)' }}>
              <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)', marginBottom: '10px' }}>/ PIECE INFO</p>
              <div className="sm" style={{ fontSize: '11px', lineHeight: '1.9', color: 'var(--ash)' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT FORM
══════════════════════════════════════════════════════════════ */
export function ProductForm({ product, store, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0 }: ProductFormProps) {
  const t = T[getLang(store)];
  const cur = store?.currency || t.currency;
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerEmail: '', customerWhatsapp: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
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
      const m = product.variantDetails.find((v: any) => vm(v, selectedVariants)); if (m && m.price !== -1) return m.price;
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
    return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice;
  }, [selW, fd.typeLivraison, orderFreeShipping, product.isDigital]);
  const total = () => fp * qty + +getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = t.errName;
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhoneInvalid;
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
    return e;
  };
  const getVarId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => vm(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const addToCart = () => {
    setIsAdded(true);
    const cart = JSON.parse(localStorage.getItem(domain) || '[]');
    cart.push({ ...fd, quantity: qty, product, variantDetailId: getVarId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now() });
    localStorage.setItem(domain, JSON.stringify(cart)); initCount(cart.length);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const er = validate(); if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSub(true);
    try {
      const { customerWelaya, customerCommune, typeLivraison, priceLoss, customerEmail, customerWhatsapp, ...rest } = fd;
      const payload = product.isDigital
        ? { ...rest, ...(contactMethod === 'email' ? { customerEmail } : { customerWhatsapp }) }
        : { ...rest, customerWelaya, customerCommune, typeLivraison, priceLoss };
      await axios.post(`${API_URL}/orders/create`, { ...payload, quantity: qty, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`/successfully?productId=${product?.id}`);
    } catch { } finally { setSub(false); }
  };

  return (
    <div dir={t.dir} style={{ marginTop: '22px', paddingTop: '22px', borderTop: '2px solid var(--ink)' }}>
        {product.store?.cart !== false && !product.isDigital && (
        <div className="cart-add-btns" style={{ marginBottom: '14px' }}>
          <button onClick={addToCart} disabled={isAdded} className="sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', cursor: isAdded ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', border: `1px solid ${isAdded ? '#22c55e' : 'var(--ink)'}`, background: isAdded ? 'rgba(34,197,94,0.08)' : 'transparent', color: isAdded ? '#22c55e' : 'var(--ink)', transition: 'all 0.25s' }}>
            {isAdded ? <><CheckCircle2 size={12} className="anim-check" />{t.addedToCartMsg}</> : <><ShoppingCart size={12} />{t.addToCart}</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} className="btn-punch" style={{ flex: 1, clipPath: 'none', padding: '12px' }}>
            {t.orderNow} ↗
          </button>
        </div>
      )}

      {(isOrderNow || product.store?.cart === false || product.isDigital) && (
        <div>
          {product.store?.cart !== false && !product.isDigital && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--punch)', textTransform: 'uppercase', margin: 0 }}>/ ORDER FORM</p>
              <button onClick={() => setIsOrderNow(false)} className="sm" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--ink)', background: 'transparent', color: 'var(--ash)', fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
                <X style={{ width: '9px', height: '9px' }} /> {t.cancelLabel}
              </button>
            </div>
          )}
          {(product.store?.cart === false || product.isDigital) && <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)', marginBottom: '14px' }}>/ ORDER FORM</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.customerName} label="NAME">
                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} style={IS(!!errors.customerName)} onFocus={onF} onBlur={e => onB(e, !!errors.customerName)} />
              </FR>
              <FR error={errors.customerPhone} label="PHONE">
                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0X XX XX XX XX" style={IS(!!errors.customerPhone)} onFocus={onF} onBlur={e => onB(e, !!errors.customerPhone)} />
              </FR>
            </div>
            {product.isDigital ? (
              <div style={{ marginBottom: '12px' }}>
                <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--ash)', marginBottom: '5px', textTransform: 'uppercase' }}>{t.contactQuestion}</p>
                <div style={{ display: 'flex', border: '1px solid var(--ink)', marginBottom: '10px' }}>
                  <button type="button" onClick={() => { setContactMethod('email'); setFd(p => ({ ...p, customerWhatsapp: '' })); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', border: 'none', borderRight: '1px solid var(--ink)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', backgroundColor: contactMethod === 'email' ? 'var(--ink)' : 'transparent', color: contactMethod === 'email' ? 'var(--paper)' : 'var(--ash)', borderTop: `3px solid ${contactMethod === 'email' ? 'var(--punch)' : 'transparent'}`, transition: 'all 0.18s' }}>
                    <Mail style={{ width: '11px', height: '11px' }} />{t.contactViaEmail}
                  </button>
                  <button type="button" onClick={() => { setContactMethod('whatsapp'); setFd(p => ({ ...p, customerEmail: '' })); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', backgroundColor: contactMethod === 'whatsapp' ? 'var(--ink)' : 'transparent', color: contactMethod === 'whatsapp' ? 'var(--paper)' : 'var(--ash)', borderTop: `3px solid ${contactMethod === 'whatsapp' ? 'var(--punch)' : 'transparent'}`, transition: 'all 0.18s' }}>
                    <MessageCircle style={{ width: '11px', height: '11px' }} />{t.contactViaWhatsapp}
                  </button>
                </div>
                {contactMethod === 'email' ? (
                  <FR error={errors.customerEmail} label="EMAIL">
                    <input type="email" dir="ltr" value={fd.customerEmail} onChange={e => setFd({ ...fd, customerEmail: e.target.value })} placeholder={t.emailPh} style={IS(!!errors.customerEmail)} onFocus={onF} onBlur={e => onB(e, !!errors.customerEmail)} />
                  </FR>
                ) : (
                  <FR error={errors.customerWhatsapp} label="WHATSAPP">
                    <input type="tel" dir="ltr" value={fd.customerWhatsapp} onChange={e => setFd({ ...fd, customerWhatsapp: e.target.value })} placeholder={t.whatsappPh} style={IS(!!errors.customerWhatsapp)} onFocus={onF} onBlur={e => onB(e, !!errors.customerWhatsapp)} />
                  </FR>
                )}
              </div>
            ) : (
            <>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label="WILAYA">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '11px', height: '11px', color: 'var(--mist)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...IS(!!errors.customerWelaya), paddingLeft: '28px' }} onFocus={onF} onBlur={e => onB(e, !!errors.customerWelaya)}>
                    <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="COMMUNE">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '11px', height: '11px', color: 'var(--mist)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...IS(!!errors.customerCommune), paddingLeft: '28px', opacity: !fd.customerWelaya ? 0.4 : 1 }} onFocus={onF} onBlur={e => onB(e, !!errors.customerCommune)}>
                    <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="DELIVERY">
              <div className="dlv-2c">
                {(['home', 'office'] as const).map((type, i) => (
                  <button key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))}
                    style={{ padding: '13px 10px', border: 'none', borderRight: i === 0 ? '1px solid var(--ink)' : 'none', backgroundColor: fd.typeLivraison === type ? 'var(--ink)' : 'transparent', cursor: 'pointer', textAlign: 'right', borderTop: `3px solid ${fd.typeLivraison === type ? 'var(--punch)' : 'transparent'}`, transition: 'all 0.18s', fontFamily: 'inherit' }}>
                    <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.16em', color: fd.typeLivraison === type ? 'var(--paper)' : 'var(--ash)', marginBottom: '3px' }}>{type === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                    {selW && <p className="ub" style={{ fontSize: '1rem', fontWeight: 900, color: fd.typeLivraison === type ? 'var(--punch)' : 'var(--mist)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()}<span className="sm" style={{ fontWeight: 400, fontSize: '8px', marginLeft: '3px' }}>{cur}</span>
                    </p>}
                  </button>
                ))}
              </div>
            </FR>
            </>
            )}

            {supportQty && !product.isDigital && (
              <FR label="QUANTITY">
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--ink)' }}>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRight: '1px solid var(--ink)', background: 'transparent', cursor: 'pointer', color: 'var(--ink)', transition: 'all 0.18s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--punch)'; el.style.color = 'var(--paper)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--ink)'; }}>
                    <Minus style={{ width: '11px', height: '11px' }} />
                  </button>
                  <span className="ub" style={{ width: '44px', textAlign: 'center', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em', lineHeight: '38px', display: 'inline-block' }}>{fd.quantity}</span>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderLeft: '1px solid var(--ink)', background: 'transparent', cursor: 'pointer', color: 'var(--ink)', transition: 'all 0.18s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--punch)'; el.style.color = 'var(--paper)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--ink)'; }}>
                    <Plus style={{ width: '11px', height: '11px' }} />
                  </button>
                </div>
              </FR>
            )}

            {/* Summary */}
            <div style={{ border: '1px solid var(--ink)', marginBottom: '12px' }}>
              <div style={{ padding: '8px 13px', background: 'var(--ink)' }}>
                <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'rgba(242,239,232,0.55)' }}>ORDER MANIFEST</span>
              </div>
              {[{ l: 'ITEM', v: product.name.slice(0, 20) + (product.name.length > 20 ? '...' : '') }, { l: 'UNIT', v: `${fp.toLocaleString()} ${cur}` }, { l: '× QTY', v: qty }, ...(product.isDigital ? [] : [{ l: 'SHIP', v: !selW ? 'TBD' : orderFreeShipping ? 'FREE' : `${getLiv().toLocaleString()} ${cur}` }])].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 13px', borderTop: '1px solid var(--paper-dk)' }}>
                  <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.18em', color: 'var(--ash)' }}>{row.l}</span>
                  <span className="sm" style={{ fontSize: '9px', fontWeight: 700, color: 'var(--ink)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 13px', borderTop: '2px solid var(--ink)', background: 'var(--paper-dk)' }}>
                <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)' }}>TOTAL</span>
                <span className="ub" style={{ fontWeight: 900, fontSize: '1.7rem', color: 'var(--punch)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {total().toLocaleString()}<span className="sm" style={{ fontWeight: 400, fontSize: '10px', marginLeft: '4px' }}>{cur}</span>
                </span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-z" style={{ width: '100%', justifyContent: 'center', fontSize: '10px', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1, clipPath: 'none' }}>
              {sub ? <><Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> {t.sending}</> : <>{t.confirmOrder} <ArrowUpRight style={{ width: '13px', height: '13px' }} /></>}
            </button>
            <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.16em', color: 'var(--mist)', textAlign: 'center', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <Shield style={{ width: '9px', height: '9px', color: 'var(--ink)' }} /> {t.secureText}
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CART
══════════════════════════════════════════════════════════════ */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const t = T[getLang(store)];
  const cur = store?.currency || t.currency;
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
  const getLiv = () => { if (freeShippingReached) return 0; if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; };
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
    <div dir={t.dir} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--paper)', fontFamily: "'Space Mono',monospace" }}>
      <div style={{ textAlign: 'center', padding: '4rem 2.5rem', border: '2px solid var(--ink)', borderTop: '4px solid var(--punch)', maxWidth: 460, width: '100%' }}>
        <CheckCircle2 style={{ width: '40px', height: '40px', color: 'var(--punch)', display: 'block', margin: '0 auto 1.25rem' }} />
        <h2 className="ub" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--ink)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>CONFIRMED.</h2>
        <p style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ash)', marginBottom: '2rem', lineHeight: 1.8 }}>{t.successDesc}</p>
        <Link href="/" className="btn-z" style={{ display: 'inline-flex', clipPath: 'none', padding: '13px 28px' }}>{t.backToShop}</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir={t.dir} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--paper)', fontFamily: "'Space Mono',monospace" }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px solid var(--ink)', maxWidth: 400, width: '100%' }}>
        <span className="ub" style={{ fontWeight: 900, fontSize: '4rem', color: 'rgba(10,9,6,0.08)', letterSpacing: '-0.04em', display: 'block', marginBottom: '1rem' }}>EMPTY.</span>
        <p style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'var(--mist)', marginBottom: '1.75rem' }}>{t.cartEmpty}</p>
        <Link href="/" className="btn-z" style={{ display: 'inline-flex', clipPath: 'none', padding: '13px 28px' }}>{t.shopNow}</Link>
      </div>
    </div>
  );

  return (
    <div dir={t.dir} style={{ minHeight: '100vh', background: 'var(--paper)', padding: '2.5rem 1.5rem 5rem', fontFamily: "'Space Mono',monospace" }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid var(--ink)' }}>
          <h1 className="ub" style={{ fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--ink)' }}>CART.</h1>
          <p style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)' }}>{items.length} PIECE{items.length !== 1 ? 'S' : ''}</p>
        </div>
        {freeShippingMin != null && (
          <div style={{ border: '1px solid var(--ink)', background: freeShippingReached ? 'var(--ink)' : 'var(--paper-dk)', color: freeShippingReached ? 'var(--paper)' : 'var(--ink)', padding: '10px 16px', marginBottom: '1.5rem', fontWeight: 700, fontSize: '10px', letterSpacing: '0.08em', textAlign: 'center' }}>
            {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', String(freeShippingRemainingAmt))}
          </div>
        )}
        <div className="cart-layout">
          {/* Items */}
          <div style={{ border: '1px solid var(--ink)', borderTop: '3px solid var(--punch)', alignSelf: 'start' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '14px', borderBottom: '1px solid var(--paper-dk)' }}>
                <div style={{ width: 80, height: 80, flexShrink: 0, overflow: 'hidden', border: '1px solid var(--paper-dk)', background: 'var(--paper-dk)' }}>
                  <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 className="ub" style={{ fontWeight: 700, fontSize: '10px', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.product?.name?.slice(0, 30)}</h4>
                    <p className="ub" style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--punch)', letterSpacing: '-0.02em' }}>{item.finalPrice?.toLocaleString()} {cur}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span className="ub" style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--ash)' }}>× {item.quantity}</span>
                    <button onClick={() => update(items.filter((_, idx) => idx !== i))} className="sm" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', border: 'none', background: 'transparent', color: 'var(--mist)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--punch)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mist)'; }}>
                      <Trash2 size={11} /> {t.deleteLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'var(--paper-dk)' }}>
              <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)' }}>SUBTOTAL</span>
              <span className="ub" style={{ fontSize: '1.375rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{cartTotal.toLocaleString()} {cur}</span>
            </div>
          </div>

          {/* Checkout */}
          <div style={{ border: '1px solid var(--ink)', borderTop: '3px solid var(--punch)', padding: '22px', alignSelf: 'start' }}>
            <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--punch)', marginBottom: '16px', textTransform: 'uppercase' }}>/ CHECKOUT</p>
            <form onSubmit={handleSubmit}>
              <div className="form-2c">
                <FR error={errors.name} label="NAME">
                  <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={IS(!!errors.name)} onFocus={onF} onBlur={e => onB(e, !!errors.name)} />
                </FR>
                <FR error={errors.phone} label="PHONE">
                  <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={IS(!!errors.phone)} onFocus={onF} onBlur={e => onB(e, !!errors.phone)} />
                </FR>
              </div>
              <div className="form-2c">
                <FR error={errors.w} label="WILAYA">
                  <div style={{ position: 'relative' }}>
                    <ChevronDown style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '11px', height: '11px', color: 'var(--mist)', pointerEvents: 'none' }} />
                    <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...IS(!!errors.w), paddingLeft: '28px' }} onFocus={onF} onBlur={e => onB(e, !!errors.w)}>
                      <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
                <FR error={errors.c} label="COMMUNE">
                  <div style={{ position: 'relative' }}>
                    <ChevronDown style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '11px', height: '11px', color: 'var(--mist)', pointerEvents: 'none' }} />
                    <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...IS(!!errors.c), paddingLeft: '28px', opacity: !fd.customerWelaya ? 0.4 : 1 }} onFocus={onF} onBlur={e => onB(e, !!errors.c)}>
                      <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
              </div>
              {/* Summary */}
              <div style={{ border: '1px solid var(--ink)', marginBottom: '12px' }}>
                {[{ l: 'SUBTOTAL', v: `${cartTotal.toLocaleString()} ${cur}` }, { l: 'SHIP', v: !selW ? 'TBD' : freeShippingReached ? 'FREE' : `${getLiv().toLocaleString()} ${cur}` }].map(row => (
                  <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 13px', borderBottom: '1px solid var(--paper-dk)' }}>
                    <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.18em', color: 'var(--ash)' }}>{row.l}</span>
                    <span className="sm" style={{ fontSize: '9px', fontWeight: 700 }}>{row.v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 13px', borderTop: '2px solid var(--ink)', background: 'var(--paper-dk)' }}>
                  <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)' }}>TOTAL</span>
                  <span className="ub" style={{ fontWeight: 900, fontSize: '1.7rem', color: 'var(--punch)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {finalTotal.toLocaleString()}<span className="sm" style={{ fontWeight: 400, fontSize: '10px', marginLeft: '4px' }}>{cur}</span>
                  </span>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn-z" style={{ width: '100%', justifyContent: 'center', fontSize: '10px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, clipPath: 'none' }}>
                {submitting ? <><Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> {t.sending}</> : <>{t.confirmOrder} <ArrowUpRight style={{ width: '13px', height: '13px' }} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUCCESS
══════════════════════════════════════════════════════════════ */
export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const stepIcons = [CheckCircle2, Phone, Package, Truck];

  return (
    <div dir={t.dir} style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: "'Space Mono',monospace", padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '3rem 2rem', border: '2px solid var(--ink)', borderTop: '4px solid var(--punch)', marginBottom: '1.5rem' }}>
          <CheckCircle2 style={{ width: 40, height: 40, color: 'var(--punch)', display: 'block', margin: '0 auto 1.25rem' }} />
          <h2 className="ub" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--ink)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>CONFIRMED.</h2>
          <p style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ash)', lineHeight: 1.8 }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ border: '2px solid var(--ink)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ash)', marginBottom: 10 }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--ash)', fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--ash)' }}>{t.total}</span>
                <span className="ub" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--punch)' }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ border: '2px solid var(--ink)', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? CheckCircle2;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0.9rem 1.1rem', borderBottom: i < t.successSteps.length - 1 ? '1px solid var(--ink)' : 'none', background: done ? 'var(--punch)' : 'transparent' }}>
                <div style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--ink)' : 'transparent', border: done ? 'none' : '1.5px solid var(--ash)', color: done ? 'var(--punch)' : 'var(--ash)' }}>
                  <Icon size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: done ? '#fff' : 'var(--ink)', marginBottom: 2 }}>{step.title}</p>
                  <p style={{ fontSize: 10, color: done ? 'rgba(255,255,255,0.85)' : 'var(--ash)' }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/" className="btn-z" style={{ display: 'inline-flex', justifyContent: 'center', clipPath: 'none', padding: '13px 28px' }}>{t.shopNow}</Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', border: '1.5px solid var(--ink)', color: 'var(--ink)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>{t.backToShop}</Link>
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

const PageShell = ({ children, title, code, dir }: { children: React.ReactNode; title: string; code: string; dir?: string }) => (
  <div dir={dir || 'rtl'} style={{ backgroundColor: 'var(--paper)', fontFamily: "'Space Mono',monospace", minHeight: '100vh' }}>
    <div style={{ backgroundColor: 'var(--ink)', padding: '80px 6vw 40px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: '-3%', bottom: '-20%', pointerEvents: 'none', userSelect: 'none', opacity: 0.04 }}>
        <span className="ub" style={{ fontWeight: 900, fontSize: 'clamp(10rem,28vw,26rem)', color: 'var(--paper)', letterSpacing: '-0.05em', lineHeight: 1, whiteSpace: 'nowrap' }}>{title.toUpperCase()}</span>
      </div>
      <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'rgba(242,239,232,0.28)', marginBottom: '12px' }}>REF: {code}</p>
      <h1 className="ub" style={{ fontWeight: 900, fontSize: 'clamp(2.5rem,7vw,7rem)', color: 'var(--paper)', letterSpacing: '-0.03em', lineHeight: 0.9, textTransform: 'uppercase' }}>{title}</h1>
      <div style={{ width: '56px', height: '4px', background: 'var(--punch)', marginTop: '14px' }} />
    </div>
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '44px 24px 80px' }}>{children}</div>
  </div>
);

const IB = ({ title, body, tag, tagColor = 'var(--punch)' }: { title: string; body: string; tag?: string; tagColor?: string }) => (
  <div style={{ borderBottom: '1px solid var(--paper-dk)', padding: '18px 0', display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
        <h3 className="ub" style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--ink)', letterSpacing: '0.02em' }}>{title.toUpperCase()}</h3>
        {tag && <span className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', padding: '3px 8px', border: `1px solid ${tagColor}`, color: tagColor }}>{tag}</span>}
      </div>
      <p className="sm" style={{ fontSize: '10px', lineHeight: '1.9', letterSpacing: '0.05em', color: 'var(--ash)' }}>{body}</p>
    </div>
  </div>
);

export function Privacy({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <PageShell title={t.privacyTitle} code="DOC-001" dir={t.dir}>
      <IB title={t.priv1t} body={t.priv1b} />
      <IB title={t.priv2t} body={t.priv2b} />
      <IB title={t.priv3t} body={t.priv3b} />
      <IB title={t.priv4t} body={t.priv4b} tag={t.priv4tag} />
    </PageShell>
  );
}

export function Terms({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <PageShell title={t.termsTitle} code="DOC-002" dir={t.dir}>
      <IB title={t.terms1t} body={t.terms1b} />
      <IB title={t.terms2t} body={t.terms2b} tag={t.terms2tag} />
      <IB title={t.terms3t} body={t.terms3b} />
    </PageShell>
  );
}

export function Cookies({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <PageShell title={t.cookiesTitle} code="DOC-003" dir={t.dir}>
      <IB title={t.cook1t} body={t.cook1b} tag={t.cook1tag} tagColor="var(--ink)" />
      <IB title={t.cook2t} body={t.cook2b} tag={t.cook2tag} />
      <IB title={t.cook3t} body={t.cook3b} tag={t.cook3tag} />
      <div style={{ marginTop: '20px', padding: '14px', border: '1px solid var(--ink)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <ToggleRight style={{ width: '16px', height: '16px', color: 'var(--punch)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p className="sm" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--ink)', marginBottom: '5px' }}>{t.cookManage}</p>
          <p className="sm" style={{ fontSize: '10px', lineHeight: '1.8', color: 'var(--ash)' }}>{t.cookManageDesc}</p>
        </div>
      </div>
    </PageShell>
  );
}

export function Contact({ store }: { store?: any }) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id }); setSent(true); }
    catch { showError(t.contactErr); } finally { setLoading(false); }
  };

  return (
    <div dir={t.dir} style={{ backgroundColor: 'var(--paper)', fontFamily: "'Space Mono',monospace", minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'var(--punch)', padding: '80px 6vw 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-3%', bottom: '-15%', pointerEvents: 'none', userSelect: 'none', opacity: 0.1 }}>
          <span className="ub" style={{ fontWeight: 900, fontSize: 'clamp(10rem,28vw,26rem)', color: 'var(--paper)', letterSpacing: '-0.05em', lineHeight: 1 }}>HIT</span>
        </div>
        <h1 className="ub" style={{ fontWeight: 900, fontSize: 'clamp(3rem,9vw,9rem)', color: 'var(--paper)', letterSpacing: '-0.04em', lineHeight: 0.88, position: 'relative', zIndex: 2 }}>{t.contactTitle}</h1>
        <p className="sm" style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(242,239,232,0.55)', marginTop: '14px', position: 'relative', zIndex: 2 }}>{t.contactSubtitle}</p>
      </div>

      <div className="contact-grid" style={{ maxWidth: '860px', margin: '0 auto', padding: '44px 24px 80px' }}>
        {/* Info */}
        <div>
          <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--ash)', marginBottom: '14px' }}>{t.contactInfoLabel}</p>
          {[
            { emoji: '📞', label: t.contactPhoneLabel, val: store?.contact?.phone },
            { emoji: '📍', label: t.contactLocationLabel, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            { emoji: '✉️', label: t.contactEmailLabel, val: store?.contact?.email },
          ].filter(r => r.val).map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderBottom: '1px solid var(--paper-dk)', transition: 'background 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--paper-dk)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
              <div>
                <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)', marginBottom: '2px' }}>{item.label}</p>
                <p className="sm" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.08em' }}>{item.val}</p>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '20px', padding: '18px', background: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
            <p className="ub" style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--punch)', letterSpacing: '-0.01em', lineHeight: 1.1, position: 'relative', zIndex: 2 }}>STAY FRESH.<br />STAY REAL.</p>
            <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.18em', color: 'rgba(242,239,232,0.35)', marginTop: '8px', position: 'relative', zIndex: 2 }}>{t.contactCulture}</p>
          </div>
        </div>

        {/* Form */}
        <div>
          <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--ash)', marginBottom: '14px' }}>{t.contactFormLabel}</p>
          {sent ? (
            <div style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--ink)', textAlign: 'center' }}>
              <CheckCircle2 style={{ width: '32px', height: '32px', color: 'var(--punch)', marginBottom: '10px' }} />
              <p className="ub" style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--ink)', letterSpacing: '-0.01em', marginBottom: '4px' }}>SENT.</p>
              <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--ash)' }}>{t.contactSentMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-2c">
                <div>
                  <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--ash)', marginBottom: '5px' }}>{t.contactNamePh}</p>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ ...IS() }} onFocus={onF} onBlur={e => onB(e)} />
                </div>
                <div>
                  <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--ash)', marginBottom: '5px' }}>{t.contactPhonePh}</p>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={{ ...IS() }} onFocus={onF} onBlur={e => onB(e)} />
                </div>
              </div>
              <div>
                <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--ash)', marginBottom: '5px' }}>{t.contactEmailPh}</p>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={{ ...IS() }} onFocus={onF} onBlur={e => onB(e)} />
              </div>
              <div>
                <p className="sm" style={{ fontSize: '8px', letterSpacing: '0.22em', color: 'var(--ash)', marginBottom: '5px' }}>{t.contactMessagePh}</p>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t.contactMessagePh} rows={4} required style={{ ...IS(), resize: 'none' }} onFocus={onF} onBlur={e => onB(e)} />
              </div>
              <button type="submit" disabled={loading} className="btn-z" style={{ justifyContent: 'center', width: '100%', clipPath: 'none', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <><Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> {t.contactSending}</> : <>{t.contactSend} <ArrowUpRight style={{ width: '13px', height: '13px' }} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}