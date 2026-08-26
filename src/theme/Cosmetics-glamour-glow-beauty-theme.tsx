'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import axios from 'axios';
import {
  ShoppingBag, Search, X, ChevronDown, Heart, Star, Sparkles,
  CheckCircle2, Loader2, Trash2, ArrowLeft, Menu, Phone, Mail,
  MapPin, ToggleRight, ChevronLeft, ChevronRight, ZoomIn, Package, Truck,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { showError } from '@/lib/showError';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ─── types ─────────────────────────────────────────────────── */
interface Offer { id: string; name: string; quantity: number; price: number; subTitle?: string; shippingFree?: boolean; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color'|'image'|'text'; value: string; }
interface VariantDetail { id: number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
interface Product {
  id: string; name: string; desc?: string;
  productImage?: string; imagesProduct?: { id: string; imageUrl: string }[];
  price: string | number; priceOriginal?: string | number;
  offers?: Offer[]; attributes?: any[]; variantDetails?: VariantDetail[];
  stock?: number; isActive?: boolean; shippingFree?: boolean;
  store: any;
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
  store?: any;
}

/* ─── helpers ────────────────────────────────────────────────── */
const variantMatches = (d: VariantDetail, sel: Record<string, string>): boolean =>
  Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
async function fetchWilayas(userId: string): Promise<Wilaya[]> {
  try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`); return data || []; } catch { return []; }
}
async function fetchCommunes(wilayaId: string): Promise<Commune[]> {
  try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`); return data || []; } catch { return []; }
}
const INP = (err = false): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', border: `1.5px solid ${err ? '#FF1F8E' : 'var(--line-dk)'}`,
  borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
  background: 'var(--white)', color: 'var(--ink)', boxSizing: 'border-box', transition: 'border-color 0.2s',
  appearance: 'none' as const,
});
const FR = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 13 }}>
    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>{label}</p>
    {children}
    {error && <p style={{ color: '#FF1F8E', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>{error}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Nunito+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --pink:    #FF1F8E;
    --pink-lt: #FF6CB5;
    --pink-dk: #CC0070;
    --blush:   #FFF0F5;
    --blush-2: #FFE0EE;
    --gold:    #C9A96E;
    --gold-lt: #E8D5A8;
    --gold-dk: #A07840;
    --ink:     #1A0A12;
    --mid:     #4A2538;
    --dim:     #7A5068;
    --white:   #FFFFFF;
    --soft:    #FFF8FB;
    --line:    #F0D8E5;
    --line-dk: #DDB8CC;
  }

  .gg-serif { font-family: 'Cormorant Garamond', serif !important; }
  .gg-body  { font-family: 'Nunito Sans', sans-serif !important; }

  /* Ticker */
  @keyframes gg-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .gg-ticker-wrap { overflow: hidden; white-space: nowrap; background: var(--pink); color: #fff; height: 36px; display: flex; align-items: center; }
  .gg-ticker-track { display: inline-flex; animation: gg-scroll 30s linear infinite; }
  .gg-ticker-item  { padding: 0 48px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }

  /* Spin */
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Glimmer */
  @keyframes gg-glimmer { 0%,100% { opacity: 0.55; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }

  /* Shimmer skeleton */
  @keyframes gg-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .gg-skel {
    background: linear-gradient(90deg, #f7d9e8 25%, #ffe5f0 50%, #f7d9e8 75%);
    background-size: 800px 100%;
    animation: gg-shimmer 1.6s ease-in-out infinite;
    border-radius: 6px;
  }

  /* Nav */
  .gg-nav { position: sticky; top: 0; z-index: 100; background: var(--white); border-bottom: 1.5px solid var(--line); }
  .gg-nav-inner { max-width: 1360px; margin: 0 auto; padding: 0 24px; height: 68px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .gg-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.65rem; font-weight: 600; font-style: italic; color: var(--pink); text-decoration: none; white-space: nowrap; }
  .gg-nav-links { display: flex; gap: 28px; align-items: center; }
  .gg-nav-link { font-family: 'Nunito Sans', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--mid); text-decoration: none; transition: color 0.2s; }
  .gg-nav-link:hover { color: var(--pink); }
  .gg-icon-btn { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border: none; background: transparent; cursor: pointer; color: var(--mid); transition: color 0.2s; border-radius: 50%; }
  .gg-icon-btn:hover { color: var(--pink); background: var(--blush); }
  .gg-cart-badge { position: absolute; top: -4px; left: -4px; min-width: 17px; height: 17px; border-radius: 999px; background: var(--pink); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 3px; font-family: 'Nunito Sans', sans-serif; }

  /* Search overlay */
  .gg-srch-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(26,10,18,0.7); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 80px; }
  .gg-srch-box { width: 100%; max-width: 600px; margin: 0 20px; background: var(--white); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 60px rgba(255,31,142,0.18); }
  .gg-srch-inp { width: 100%; padding: 18px 56px 18px 20px; border: none; outline: none; font-size: 1.05rem; font-family: 'Nunito Sans', sans-serif; color: var(--ink); background: var(--white); box-sizing: border-box; }
  .gg-srch-results { border-top: 1px solid var(--line); max-height: 380px; overflow-y: auto; }
  .gg-srch-item { display: flex; align-items: center; gap: 14px; padding: 14px 20px; cursor: pointer; transition: background 0.15s; }
  .gg-srch-item:hover { background: var(--blush); }

  /* Mobile nav drawer */
  .gg-drawer { position: fixed; inset: 0; z-index: 300; }
  .gg-drawer-bg { position: absolute; inset: 0; background: rgba(26,10,18,0.6); }
  .gg-drawer-panel { position: absolute; top: 0; right: 0; width: min(320px,90vw); height: 100%; background: var(--white); overflow-y: auto; display: flex; flex-direction: column; }
  .gg-drawer-hd { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--line); }

  /* Btn */
  .gg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 28px; border-radius: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; border: none; transition: all 0.22s; text-decoration: none; }
  .gg-btn-pink { background: var(--pink); color: #fff; }
  .gg-btn-pink:hover { background: var(--pink-dk); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,31,142,0.35); }
  .gg-btn-outline { background: transparent; color: var(--pink); border: 1.5px solid var(--pink); }
  .gg-btn-outline:hover { background: var(--blush); }
  .gg-btn-gold { background: var(--gold); color: #fff; }
  .gg-btn-gold:hover { background: var(--gold-dk); transform: translateY(-1px); }

  /* Hero */
  .gg-hero { position: relative; background: linear-gradient(135deg, var(--blush) 0%, #ffe0ee 55%, var(--blush-2) 100%); min-height: 520px; display: flex; align-items: center; overflow: hidden; }
  .gg-hero-deco { position: absolute; border-radius: 50%; pointer-events: none; }
  .gg-hero-content { position: relative; z-index: 2; max-width: 1360px; margin: 0 auto; padding: 60px 24px; display: flex; align-items: center; gap: 48px; width: 100%; }
  .gg-hero-text { flex: 1; min-width: 0; }
  .gg-hero-eyebrow { font-family: 'Nunito Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
  .gg-hero-h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.4rem,5vw,4.2rem); font-weight: 600; font-style: italic; color: var(--ink); line-height: 1.15; margin-bottom: 16px; }
  .gg-hero-sub { font-family: 'Nunito Sans', sans-serif; font-size: 15px; color: var(--mid); line-height: 1.75; max-width: 440px; margin-bottom: 28px; }
  .gg-hero-img { flex: 0 0 400px; height: 420px; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 60px rgba(255,31,142,0.2); }
  .gg-hero-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Categories */
  .gg-cats { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
  .gg-cats::-webkit-scrollbar { display: none; }
  .gg-cat-chip { flex-shrink: 0; padding: 8px 18px; border-radius: 999px; border: 1.5px solid var(--line-dk); background: var(--white); color: var(--mid); font-family: 'Nunito Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; }
  .gg-cat-chip.active, .gg-cat-chip:hover { background: var(--pink); border-color: var(--pink); color: #fff; }

  /* Card */
  .gg-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 20px; }
  .gg-card { background: var(--white); border-radius: 12px; overflow: hidden; border: 1px solid var(--line); transition: box-shadow 0.25s, transform 0.25s; text-decoration: none; color: inherit; display: flex; flex-direction: column; }
  .gg-card:hover { box-shadow: 0 12px 40px rgba(255,31,142,0.15); transform: translateY(-4px); }
  .gg-card-img { aspect-ratio: 3/4; overflow: hidden; position: relative; background: var(--blush); }
  .gg-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
  .gg-card:hover .gg-card-img img { transform: scale(1.06); }
  .gg-card-badge { position: absolute; top: 10px; right: 10px; background: var(--pink); color: #fff; font-family: 'Nunito Sans', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; }
  .gg-card-body { padding: 14px; flex: 1; display: flex; flex-direction: column; }
  .gg-card-name { font-family: 'Nunito Sans', sans-serif; font-size: 13.5px; font-weight: 600; color: var(--ink); margin-bottom: 6px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .gg-card-price { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: var(--pink); }
  .gg-card-old { font-family: 'Nunito Sans', sans-serif; font-size: 12px; color: var(--dim); text-decoration: line-through; margin-right: 6px; }
  .gg-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }

  /* Trust bar */
  .gg-trust { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; padding: 40px 0; }
  .gg-trust-item { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px 16px; background: var(--white); border: 1px solid var(--line); border-radius: 12px; text-align: center; }
  .gg-trust-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--blush); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }

  /* Details */
  .gg-det-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; max-width: 1200px; margin: 0 auto; padding: 48px 24px 80px; }
  .gg-gallery-main { aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; background: var(--blush); border: 1px solid var(--line); position: relative; }
  .gg-gallery-main img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gg-gallery-thumbs { display: flex; gap: 10px; margin-top: 12px; overflow-x: auto; scrollbar-width: none; }
  .gg-gallery-thumbs::-webkit-scrollbar { display: none; }
  .gg-gallery-thumb { width: 72px; height: 90px; flex-shrink: 0; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; background: var(--blush); }
  .gg-gallery-thumb.active { border-color: var(--pink); }
  .gg-gallery-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Variant selector */
  .gg-var-btn { padding: 8px 16px; border: 1.5px solid var(--line-dk); border-radius: 8px; background: var(--white); font-family: 'Nunito Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--mid); cursor: pointer; transition: all 0.2s; }
  .gg-var-btn.active { border-color: var(--pink); color: var(--pink); background: var(--blush); }
  .gg-var-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Offer card */
  .gg-offer { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1.5px solid var(--line-dk); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
  .gg-offer.active { border-color: var(--pink); background: var(--blush); }
  .gg-offer-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--line-dk); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .gg-offer.active .gg-offer-radio { border-color: var(--pink); background: var(--pink); }
  .gg-offer.active .gg-offer-radio::after { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #fff; }

  /* Cart grid */
  .gg-cart-grid { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }

  /* Contact grid */
  .gg-contact-grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: 28px; }

  /* Section heading */
  .gg-sec-hd { text-align: center; margin-bottom: 32px; }
  .gg-sec-eyebrow { font-family: 'Nunito Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
  .gg-sec-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem,3.5vw,3rem); font-weight: 600; font-style: italic; color: var(--ink); }

  /* Footer */
  .gg-footer { background: var(--ink); color: var(--blush); }
  .gg-footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 32px; max-width: 1360px; margin: 0 auto; padding: 60px 24px 40px; }
  .gg-footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 600; font-style: italic; color: var(--pink); margin-bottom: 12px; }
  .gg-footer-desc { font-family: 'Nunito Sans', sans-serif; font-size: 13px; color: #a07080; line-height: 1.8; margin-bottom: 20px; }
  .gg-footer-title { font-family: 'Nunito Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 16px; }
  .gg-footer-link { display: block; font-family: 'Nunito Sans', sans-serif; font-size: 13px; color: #a07080; text-decoration: none; margin-bottom: 10px; transition: color 0.2s; }
  .gg-footer-link:hover { color: var(--pink-lt); }
  .gg-footer-bottom { border-top: 1px solid rgba(255,31,142,0.15); padding: 20px 24px; max-width: 1360px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
  .gg-footer-copy { font-family: 'Nunito Sans', sans-serif; font-size: 12px; color: #a07080; }

  @media (max-width: 1024px) {
    .gg-trust { grid-template-columns: repeat(2,1fr); }
    .gg-footer-grid { grid-template-columns: 1fr 1fr; }
    .gg-cart-grid { grid-template-columns: 1fr; }
    .gg-contact-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .gg-nav-links { display: none; }
    .gg-hero-img { display: none; }
    .gg-hero-content { padding: 48px 20px; }
    .gg-det-grid { grid-template-columns: 1fr; gap: 28px; }
    .gg-cards-grid { grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap: 14px; }
    .gg-footer-grid { grid-template-columns: 1fr; gap: 28px; padding: 40px 20px 28px; }
    .gg-footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
  }
  @media (max-width: 480px) {
    .gg-trust { grid-template-columns: 1fr 1fr; }
    .gg-cards-grid { grid-template-columns: 1fr; }
  }

  .gg-form-2c{display:grid;grid-template-columns:1fr;gap:10px;}
  @media(min-width:540px){.gg-form-2c{grid-template-columns:1fr 1fr;}}
`;

/* ══════════════════════════════════════════════════════════════
   MAIN (layout shell)
══════════════════════════════════════════════════════════════ */

// ─── Translations ─────────────────────────────────────────────────────────────
const jsonAr = {
  dir: 'rtl',
  home: 'الرئيسية', products: 'المنتجات', contact: 'اتصل بنا', cart: 'السلة',
  search: 'ابحث...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج', showAll: 'عرض كل النتائج →',
  heroEyebrow: '✨ كوليكشن جديد', heroTitle: 'تألقي بجمالك الحقيقي',
  heroSub: 'اكتشفي أرقى منتجات التجميل والعناية بالبشرة.', learnMore: 'اعرفي المزيد', shopNow: 'تسوق الآن',
  trust: [
    { icon: '🚚', title: 'توصيل سريع', desc: 'لجميع ولايات الجزائر' },
    { icon: '💎', title: 'جودة أصيلة', desc: 'منتجات فاخرة 100%' },
    { icon: '💳', title: 'دفع آمن', desc: 'عند الاستلام' },
    { icon: '🔄', title: 'إرجاع سهل', desc: 'خلال 7 أيام' },
  ],
  collectionLabel: 'تشكيلتنا', featuredTitle: 'منتجاتنا المميزة',
  all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', searchResultsFor: 'نتائج البحث عن:', itemUnit: 'منتج',
  fullName: 'الاسم الكامل', fullNamePh: 'أدخل اسمك', errName: 'الاسم مطلوب',
  phone: 'رقم الهاتف', phonePh: '05xxxxxxxx', errPhone: 'رقم الهاتف مطلوب', errPhoneInvalid: 'رقم هاتف غير صالح',
  wilaya: 'الولاية', errWilaya: 'الولاية مطلوبة', wilayaPh: 'اختر', wilayaNA: 'التوصيل غير متاح حالياً',
  commune: 'البلدية', errCommune: 'البلدية مطلوبة', communePh: 'اختر', communeLoading: 'جاري التحميل...',
  deliveryType: 'نوع التوصيل', deliveryHome: 'للبيت', deliveryOffice: 'للمكتب',
  qty: 'الكمية', price: 'السعر', delivery: 'التوصيل', total: 'الإجمالي', subtotal: 'المجموع الفرعي',
  orderInfo: 'معلومات الطلب', addToCart: 'أضف للسلة', orderNow: 'اطلب الآن',
  confirmOrder: 'تأكيد الطلب', sending: 'جاري...', back: 'رجوع',
  addedMsg: 'تمت الإضافة', errSubmit: 'حدث خطأ أثناء إرسال الطلب',
  cancel: 'إلغاء', deliveryInfoTitle: 'بيانات التوصيل', orderSummaryTitle: 'ملخص الطلب', productLabel: 'المنتج',
  myCart: 'السلة', cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تقم بإضافة أي منتجات بعد',
  successTitle: 'تم استلام طلبك! ✨', successDesc: 'شكراً لاختيارك إيانا. سنتواصل معك قريباً.',
  backToShop: 'العودة للمتجر', checkoutTitle: 'إتمام الطلب',
  successSteps: [
    { title: 'تم استلام طلبك', desc: 'تم تسجيل طلبك بنجاح في نظامنا' },
    { title: 'تأكيد الطلب', desc: 'سنتصل بك خلال 24 ساعة' },
    { title: 'التجهيز والتغليف', desc: 'يتم تجهيز طلبك بعناية' },
    { title: 'الشحن والتوصيل', desc: '2-5 أيام عمل' },
  ],
  deleteLabel: 'حذف', continueShopping: 'متابعة التسوق', checkoutInfoTitle: 'معلومات التوصيل',
  offersTitle: 'العروض المتاحة', descTitle: 'الوصف',
  freeShippingBadge: '🚚 توصيل مجاني',
  freeShippingThreshold: '🚚 توصيل مجاني للطلبات بـ {{amount}} دج أو أكثر',
  freeShippingRemaining: 'أضف {{amount}} دج أخرى للحصول على توصيل مجاني',
  freeShippingReached: '🎉 حصلت على توصيل مجاني!',
  pages: 'الصفحات', legal: 'قانوني', quickLinks: 'روابط سريعة', legalNav: 'قانوني', contactSect: 'تواصل معنا',
  privacy: 'سياسة الخصوصية', terms: 'شروط الخدمة', cookies: 'ملفات الارتباط', rightsReserved: 'جميع الحقوق محفوظة',
  contactTitle: 'نسعد بمساعدتك 💄', contactSub: 'تواصل', contactReplyTime: 'نرد خلال 24 ساعة',
  contactWays: 'طرق التواصل', contactAvailable: 'متاحون للرد الآن',
  sendMsg: 'أرسلي رسالة', sendLabel: 'إرسال الرسالة',
  messageSentTitle: 'تم إرسال رسالتك! ✨', messageSentDesc: 'سنرد عليك خلال 24 ساعة.',
  contactPhoneLabel: 'الهاتف', contactEmailLabel: 'البريد', contactLocationLabel: 'الموقع',
  emailLabel: 'البريد الإلكتروني', messageLabel: 'رسالتك',
  emailPh: 'بريدك@الإلكتروني', messagePh: 'كيف يمكننا مساعدتك؟', namePh: 'اسمك الكامل', errContact: 'حدث خطأ في الإرسال',
  legalSub: 'قانوني', privacyTitle: 'سياسة الخصوصية', termsTitle: 'شروط الخدمة', cookiesTitle: 'ملفات الارتباط',
  privDataTitle: 'البيانات التي نجمعها', privDataBody: 'فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك.',
  privUseTitle: 'كيف نستخدمها', privUseBody: 'حصرياً لتنفيذ وتوصيل مشترياتك. لا استخدام تجاري.',
  privSecTitle: 'الأمان', privSecBody: 'بياناتك محمية بتشفير قياسي وبنية تحتية آمنة.',
  privShareTitle: 'مشاركة البيانات', privShareBody: 'لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين.',
  termsAccTitle: 'حسابك', termsAccBody: 'أنت مسؤولة عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك.',
  termsPayTitle: 'المدفوعات', termsPayBody: 'لا رسوم مخفية. السعر المعروض هو السعر النهائي.',
  termsProhibTitle: 'الاستخدام المحظور', termsProhibBody: 'المنتجات الأصيلة فقط. لا مجال للمنتجات المقلدة.', termsStrictTag: 'صارم',
  termsLawTitle: 'القانون الحاكم', termsLawBody: 'تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية.',
  cookEssTitle: 'الكوكيز الأساسية', cookEssBody: 'ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها.', cookEssTag: 'مطلوب',
  cookPrefTitle: 'كوكيز التفضيلات', cookPrefBody: 'تحفظ إعداداتك لتجربة أفضل.', cookOptTag: 'اختياري',
  cookAnalTitle: 'كوكيز التحليلات', cookAnalBody: 'بيانات مجمعة لتحسين المنصة.',
  cookManageNote: 'يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح.',
};

const jsonFr = {
  dir: 'ltr',
  home: 'Accueil', products: 'Produits', contact: 'Contact', cart: 'Panier',
  search: 'Rechercher un produit...', searching: 'Recherche...', noResults: 'Aucun résultat', showAll: 'Voir tous les résultats',
  heroEyebrow: '✨ Nouvelle Collection', heroTitle: 'Révélez Votre Beauté Naturelle',
  heroSub: 'Découvrez notre sélection de produits de beauté et soins premium.', learnMore: 'En savoir plus', shopNow: 'Voir la boutique',
  trust: [
    { icon: '🚚', title: 'Livraison rapide', desc: 'Partout en Algérie' },
    { icon: '💎', title: 'Qualité garantie', desc: 'Produits 100% authentiques' },
    { icon: '💳', title: 'Paiement sécurisé', desc: 'À la livraison' },
    { icon: '🔄', title: 'Retour facile', desc: 'Sous 7 jours' },
  ],
  collectionLabel: 'Notre Collection', featuredTitle: 'Nos Produits Vedettes',
  all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', searchResultsFor: 'Résultats pour :', itemUnit: 'article(s)',
  fullName: 'Nom complet', fullNamePh: 'Votre nom', errName: 'Le nom est requis',
  phone: 'Téléphone', phonePh: '0555 12 34 56', errPhone: 'Le numéro est requis', errPhoneInvalid: 'Numéro de téléphone invalide',
  wilaya: 'Wilaya', errWilaya: 'Sélectionnez une wilaya', wilayaPh: 'Choisir', wilayaNA: 'Livraison indisponible',
  commune: 'Commune', errCommune: 'Sélectionnez une commune', communePh: 'Choisir', communeLoading: 'Chargement...',
  deliveryType: 'Type de livraison', deliveryHome: 'À domicile', deliveryOffice: 'Point relais',
  qty: 'Quantité', price: 'Prix', delivery: 'Livraison', total: 'Total', subtotal: 'Sous-total',
  orderInfo: 'Informations de commande', addToCart: 'Ajouter au panier', orderNow: 'Commander',
  confirmOrder: 'Confirmer la commande', sending: 'Envoi...', back: 'Annuler',
  addedMsg: 'Ajouté ✓', errSubmit: 'Une erreur est survenue, veuillez réessayer.',
  cancel: 'Annuler', deliveryInfoTitle: 'Infos de livraison', orderSummaryTitle: 'Résumé', productLabel: 'Produit',
  myCart: 'Mon Panier', cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre sélection.',
  successTitle: 'Commande confirmée ! ✨', successDesc: 'Merci, notre équipe vous contactera bientôt.',
  backToShop: 'Retour à la boutique', checkoutTitle: 'Finaliser la commande',
  successSteps: [
    { title: 'Commande reçue', desc: 'Votre commande a été enregistrée avec succès' },
    { title: 'Confirmation', desc: 'Nous vous appellerons sous 24h' },
    { title: 'Préparation', desc: 'Votre commande est préparée avec soin' },
    { title: 'Livraison', desc: '2-5 jours ouvrables' },
  ],
  deleteLabel: 'Supprimer', continueShopping: 'Continuer', checkoutInfoTitle: 'Infos de livraison',
  offersTitle: 'Offres groupées', descTitle: 'Description',
  freeShippingBadge: '🚚 Livraison gratuite',
  freeShippingThreshold: '🚚 Livraison gratuite dès {{amount}} DZD d\'achat',
  freeShippingRemaining: 'Ajoutez {{amount}} DZD de plus pour la livraison gratuite',
  freeShippingReached: '🎉 Livraison gratuite obtenue !',
  pages: 'Pages', legal: 'Légal', quickLinks: 'Navigation', legalNav: 'Légal', contactSect: 'Contact',
  privacy: 'Confidentialité', terms: 'Conditions', cookies: 'Cookies', rightsReserved: 'Tous droits réservés.',
  contactTitle: 'Nous sommes là pour vous 💄', contactSub: 'Contact', contactReplyTime: 'Réponse sous 24h',
  contactWays: 'Nos coordonnées', contactAvailable: 'Disponibles maintenant',
  sendMsg: 'Envoyer un message', sendLabel: 'Envoyer',
  messageSentTitle: 'Message envoyé ! ✨', messageSentDesc: 'Nous vous répondrons sous 24h.',
  contactPhoneLabel: 'Téléphone', contactEmailLabel: 'Email', contactLocationLabel: 'Adresse',
  emailLabel: 'Adresse e-mail', messageLabel: 'Votre message',
  emailPh: 'votre@email.com', messagePh: 'Comment puis-je vous aider ?', namePh: 'Votre nom complet', errContact: "Erreur lors de l'envoi",
  legalSub: 'Légal', privacyTitle: 'Confidentialité', termsTitle: "Conditions d'utilisation", cookiesTitle: 'Cookies',
  privDataTitle: 'Données collectées', privDataBody: 'Uniquement votre nom, numéro de téléphone et adresse — le strict nécessaire pour traiter votre commande.',
  privUseTitle: 'Utilisation', privUseBody: 'Exclusivement pour exécuter et livrer vos achats. Aucune utilisation commerciale.',
  privSecTitle: 'Sécurité', privSecBody: 'Vos données sont protégées par un chiffrement standard et une infrastructure sécurisée.',
  privShareTitle: 'Partage', privShareBody: 'Nous ne vendons pas vos données. Partagées uniquement avec nos partenaires de livraison de confiance.',
  termsAccTitle: 'Votre compte', termsAccBody: 'Vous êtes responsable de la sécurité de vos identifiants et de toute activité sous votre compte.',
  termsPayTitle: 'Paiements', termsPayBody: 'Aucun frais caché. Le prix affiché est le prix final.',
  termsProhibTitle: 'Utilisations interdites', termsProhibBody: 'Produits authentiques uniquement. Aucune contrefaçon tolérée.', termsStrictTag: 'Strict',
  termsLawTitle: 'Droit applicable', termsLawBody: "Ces conditions sont régies par les lois de la République Algérienne Démocratique et Populaire.",
  cookEssTitle: 'Cookies essentiels', cookEssBody: 'Nécessaires pour les sessions, le panier et le paiement. Impossibles à désactiver.', cookEssTag: 'Requis',
  cookPrefTitle: 'Cookies de préférences', cookPrefBody: 'Enregistrent vos paramètres pour une meilleure expérience.', cookOptTag: 'Optionnel',
  cookAnalTitle: 'Cookies analytiques', cookAnalBody: 'Données agrégées pour améliorer la plateforme.',
  cookManageNote: 'Vous pouvez gérer vos préférences de cookies depuis les paramètres de votre navigateur.',
};

const jsonEn = {
  dir: 'ltr',
  home: 'Home', products: 'Products', contact: 'Contact', cart: 'Cart',
  search: 'Search for a product...', searching: 'Searching...', noResults: 'No results found', showAll: 'View all results',
  heroEyebrow: '✨ New Collection', heroTitle: 'Reveal Your True Beauty',
  heroSub: 'Discover our premium beauty and skincare products.', learnMore: 'Learn more', shopNow: 'Shop now',
  trust: [
    { icon: '🚚', title: 'Fast Delivery', desc: 'Nationwide shipping' },
    { icon: '💎', title: 'Authentic Quality', desc: '100% genuine products' },
    { icon: '💳', title: 'Safe Payment', desc: 'Cash on delivery' },
    { icon: '🔄', title: 'Easy Returns', desc: 'Within 7 days' },
  ],
  collectionLabel: 'Our Collection', featuredTitle: 'Featured Products',
  all: 'All', noProducts: 'No products available at the moment.', searchResultsFor: 'Search results for:', itemUnit: 'item(s)',
  fullName: 'Full name', fullNamePh: 'Your full name', errName: 'Name is required',
  phone: 'Phone', phonePh: '05xxxxxxxx', errPhone: 'Phone number is required', errPhoneInvalid: 'Invalid phone number',
  wilaya: 'Wilaya', errWilaya: 'Please select a wilaya', wilayaPh: 'Choose', wilayaNA: 'Delivery currently unavailable',
  commune: 'Commune', errCommune: 'Please select a commune', communePh: 'Choose', communeLoading: 'Loading...',
  deliveryType: 'Delivery type', deliveryHome: 'Home delivery', deliveryOffice: 'Post office',
  qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total', subtotal: 'Subtotal',
  orderInfo: 'Order information', addToCart: 'Add to cart', orderNow: 'Order now',
  confirmOrder: 'Confirm order', sending: 'Sending...', back: 'Cancel',
  addedMsg: 'Added ✓', errSubmit: 'An error occurred, please try again.',
  cancel: 'Cancel', deliveryInfoTitle: 'Delivery info', orderSummaryTitle: 'Order summary', productLabel: 'Product',
  myCart: 'My Cart', cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Discover our selection.',
  successTitle: 'Order confirmed! ✨', successDesc: 'Thank you! Our team will contact you soon.',
  backToShop: 'Back to shop', checkoutTitle: 'Complete order',
  successSteps: [
    { title: 'Order received', desc: 'Your order has been registered successfully' },
    { title: 'Confirmation', desc: "We'll call you within 24 hours" },
    { title: 'Packaging', desc: 'Your order is being prepared with care' },
    { title: 'Shipping', desc: '2-5 business days' },
  ],
  deleteLabel: 'Remove', continueShopping: 'Continue', checkoutInfoTitle: 'Delivery information',
  offersTitle: 'Bundle offers', descTitle: 'Description',
  freeShippingBadge: '🚚 Free Delivery',
  freeShippingThreshold: '🚚 Free Delivery on orders over {{amount}} DZD',
  freeShippingRemaining: 'Add {{amount}} DZD more for free delivery',
  freeShippingReached: '🎉 You got free delivery!',
  pages: 'Pages', legal: 'Legal', quickLinks: 'Quick Links', legalNav: 'Legal', contactSect: 'Contact Us',
  privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy', rightsReserved: 'All rights reserved.',
  contactTitle: "We're here for you 💄", contactSub: 'Contact', contactReplyTime: 'Reply within 24h',
  contactWays: 'Get in touch', contactAvailable: 'Available now',
  sendMsg: 'Send a message', sendLabel: 'Send Message',
  messageSentTitle: 'Message sent! ✨', messageSentDesc: "We'll reply within 24 hours.",
  contactPhoneLabel: 'Phone', contactEmailLabel: 'Email', contactLocationLabel: 'Location',
  emailLabel: 'Email address', messageLabel: 'Your message',
  emailPh: 'your@email.com', messagePh: 'How can we help you?', namePh: 'Your full name', errContact: 'Error sending message',
  legalSub: 'Legal', privacyTitle: 'Privacy Policy', termsTitle: 'Terms of Service', cookiesTitle: 'Cookie Policy',
  privDataTitle: 'Data we collect', privDataBody: 'Only your name, phone number, and delivery address — what is necessary to process your order.',
  privUseTitle: 'How we use it', privUseBody: 'Exclusively to fulfill and deliver your purchases. No commercial use.',
  privSecTitle: 'Security', privSecBody: 'Your data is protected by standard encryption and a secure infrastructure.',
  privShareTitle: 'Data sharing', privShareBody: "We don't sell your data. Shared only with trusted delivery partners.",
  termsAccTitle: 'Your account', termsAccBody: 'You are responsible for the security of your credentials and all activity under your account.',
  termsPayTitle: 'Payments', termsPayBody: 'No hidden fees. The price shown is the final price.',
  termsProhibTitle: 'Prohibited use', termsProhibBody: 'Authentic products only. No counterfeits tolerated.', termsStrictTag: 'Strict',
  termsLawTitle: 'Governing law', termsLawBody: "These terms are governed by the laws of the People's Democratic Republic of Algeria.",
  cookEssTitle: 'Essential cookies', cookEssBody: 'Necessary for sessions, cart, and checkout. Cannot be disabled.', cookEssTag: 'Required',
  cookPrefTitle: 'Preference cookies', cookPrefBody: 'Save your settings for a better experience.', cookOptTag: 'Optional',
  cookAnalTitle: 'Analytics cookies', cookAnalBody: 'Aggregated data to improve the platform.',
  cookManageNote: 'You can manage your cookie preferences from your browser settings.',
};

type Lang = 'ar' | 'fr' | 'en';
const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr as any, en: jsonEn as any };

export default function Main({ children, store, domain }: { children: React.ReactNode; store: any; domain: string }) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  if (!store) return null;
  const t = T[getLang(store)];
  return (
    <div dir={t.dir} style={{ fontFamily: "'Nunito Sans',sans-serif", background: 'var(--soft)', minHeight: '100vh', color: 'var(--ink)' }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
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
  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(domain) || '[]');
    initCount(saved.length);
  }, [domain, initCount]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    try {
      const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: q } });
      setResults(data?.products || data || []);
    } catch { setResults([]); }
  }, [domain]);

  const openSearch = () => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 80); };
  const closeSearch = () => { setSearchOpen(false); setSearch(''); setResults([]); };

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="gg-ticker-wrap">
          <div className="gg-ticker-track">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="gg-ticker-item">✨ {store.topBar.text}</span>
            ))}
          </div>
        </div>
      )}

      <nav className="gg-nav">
        <div className="gg-nav-inner">
          {/* Mobile menu btn */}
          <button className="gg-icon-btn" style={{ display: 'none' }} id="gg-menu-btn"
            onClick={() => setMenuOpen(true)}
            onMouseEnter={() => { const b = document.getElementById('gg-menu-btn'); if (b) b.style.display = 'flex'; }}
          >
            <Menu size={20} />
          </button>
          <style>{`@media(max-width:768px){#gg-menu-btn{display:flex !important}}`}</style>

          {/* Logo */}
          <Link href="/" className="gg-logo">{store?.name || 'Glamour & Glow'}</Link>

          {/* Nav links */}
          <nav className="gg-nav-links">
            <Link href="/" className="gg-nav-link">{t.home}</Link>
            <Link href="/contact" className="gg-nav-link">{t.contact}</Link>
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="gg-icon-btn" onClick={openSearch}><Search size={18} /></button>
            {store?.cart !== false && (
            <Link href="/cart" style={{ position: 'relative', display: 'inline-flex' }}>
              <button className="gg-icon-btn"><ShoppingBag size={18} /></button>
              {count > 0 && <span className="gg-cart-badge">{count}</span>}
            </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="gg-srch-overlay" onClick={closeSearch}>
          <div className="gg-srch-box" onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative' }}>
              <input
                ref={searchRef}
                className="gg-srch-inp"
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder={t.search}
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  clearTimeout(timer.current);
                  timer.current = setTimeout(() => doSearch(e.target.value), 350);
                }}
              />
              <button onClick={closeSearch} style={{ position: 'absolute', ...(isRTL ? { left: '16px' } : { right: '16px' }), top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dim)' }}><X size={18} /></button>
            </div>
            {results.length > 0 && (
              <div className="gg-srch-results">
                {results.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} className="gg-srch-item" onClick={closeSearch} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', background: 'var(--blush)', flexShrink: 0 }}>
                      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--pink)', margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600 }}>{(typeof p.price === 'string' ? parseFloat(p.price) : p.price)?.toLocaleString()} {store?.currency || 'DZD'}</p>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={() => { closeSearch(); window.location.href = `/?search=${encodeURIComponent(search)}`; }}
                  style={{ width: '100%', padding: '12px', background: 'var(--blush-2)', border: 'none', borderTop: '1px solid var(--line)', color: 'var(--pink)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Nunito Sans',sans-serif" }}>
                  {t.showAll}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="gg-drawer">
          <div className="gg-drawer-bg" onClick={() => setMenuOpen(false)} />
          <div className="gg-drawer-panel">
            <div className="gg-drawer-hd">
              <span className="gg-logo" style={{ fontSize: '1.35rem' }}>{store?.name || 'Glamour & Glow'}</span>
              <button className="gg-icon-btn" onClick={() => setMenuOpen(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              {[['/', t.home], ['/contact', t.contact]].map(([href, label]) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '14px 0', borderBottom: '1px solid var(--line)', fontFamily: "'Nunito Sans',sans-serif", fontSize: '15px', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: { store: any }) {
  const t = T[getLang(store)];
  const socials = store?.socialMedia || {};
  return (
    <footer className="gg-footer">
      <div className="gg-footer-grid">
        {/* Brand */}
        <div>
          <div className="gg-footer-logo">{store?.name || 'Glamour & Glow'}</div>
          <p className="gg-footer-desc">{store?.description}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              ['instagram', socials.instagram, '📸'],
              ['facebook', socials.facebook, '📘'],
              ['tiktok', socials.tiktok, '🎵'],
            ].filter(([, url]) => url).map(([key, url, icon]) => (
              <a key={key as string} href={url as string} target="_blank" rel="noopener"
                style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,31,142,0.15)', border: '1px solid rgba(255,31,142,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', textDecoration: 'none', transition: 'background 0.2s' }}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <p className="gg-footer-title">{t.pages}</p>
          {[['/', t.home], ['/products', t.products], ['/cart', t.cart], ['/contact', t.contactSect]].map(([href, label]) => (
            <Link key={href} href={href} className="gg-footer-link">{label}</Link>
          ))}
        </div>

        {/* Legal */}
        <div>
          <p className="gg-footer-title">{t.legal}</p>
          {[['/privacy', t.privacy], ['/terms', t.terms], ['/cookies', t.cookies]].map(([href, label]) => (
            <Link key={href} href={href} className="gg-footer-link">{label}</Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <p className="gg-footer-title">{t.contactSect}</p>
          {store?.contact?.phone && (
            <a href={`tel:${store.contact.phone}`} className="gg-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />{store.contact.phone}
            </a>
          )}
          {store?.contact?.email && (
            <a href={`mailto:${store.contact.email}`} className="gg-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />{store.contact.email}
            </a>
          )}
          {store?.contact?.address && (
            <span className="gg-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}>
              <MapPin size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />{store.contact.address}
            </span>
          )}
        </div>
      </div>

      <div className="gg-footer-bottom" style={{ maxWidth: 1360, margin: '0 auto', padding: '20px 24px' }}>
        <p className="gg-footer-copy">© {new Date().getFullYear()} {store?.name || 'Glamour & Glow'} · {t.rightsReserved}</p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {['💳', '💰', '🔒'].map((ic, i) => (
            <span key={i} style={{ width: 32, height: 22, borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{ic}</span>
          ))}
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
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;

  return (
    <Link href={`/product/${product.slug || product.id}`} className="gg-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="gg-card-img">
        {img ? <img src={img} alt={product.name} loading="lazy" /> : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blush)' }}>
            <Sparkles size={32} style={{ color: 'var(--pink)', opacity: 0.3 }} />
          </div>
        )}
        {discount > 0 && <span className="gg-card-badge">-{discount}%</span>}
        {product.shippingFree && <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--ink)', color: '#fff', fontFamily: "'Nunito Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '4px 10px', borderRadius: 999 }}>🚚</span>}

      </div>
      <div className="gg-card-body">
        <p className="gg-card-name">{product.name}</p>
        <div className="gg-card-footer">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            {orig > price && <span className="gg-card-old">{orig.toLocaleString()} {store?.currency || 'DZD'}</span>}
            <span className="gg-card-price">{price.toLocaleString()} <span style={{ fontSize: '0.75rem', fontFamily: "'Nunito Sans',sans-serif", fontWeight: 600, color: 'var(--dim)' }}>{store?.currency || 'DZD'}</span></span>
          </div>
          
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
export function Home({ store, domain, page }: { store: any; domain: string; page?: number }) {
  if (!store) return null;
  const t = T[getLang(store)];
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  const countPage = Math.ceil((store.count || products.length) / 48);

  const searchParams = useSearchParams();
  const activeCat = searchParams.get('category');

  return (
    <>
      {/* Hero */}
      {store?.hero?.imageUrl ? (
        <section style={{ position: 'relative', minHeight: 480, overflow: 'hidden' }}>
          <img src={store.hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(26,10,18,0.7) 0%, rgba(26,10,18,0.35) 60%, transparent 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1360, margin: '0 auto', padding: '80px 24px', display: 'flex', alignItems: 'center', minHeight: 480 }}>
            <div style={{ maxWidth: 540 }}>
              <p className="gg-hero-eyebrow" style={{ color: 'var(--gold-lt)' }}>{t.heroEyebrow}</p>
              <h1 className="gg-hero-h1" style={{ color: '#fff' }}>
                {store.hero.title?.replace(/<[^>]+>/g, '') || t.heroTitle}
              </h1>
              <p className="gg-hero-sub" style={{ color: 'rgba(255,255,255,0.82)' }}>
                {store.hero.subtitle || t.heroSub}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#products" className="gg-btn gg-btn-pink">{t.shopNow}</a>
                <Link href="/contact" className="gg-btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }}>{t.learnMore}</Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="gg-hero">
          <div className="gg-hero-deco" style={{ width: 380, height: 380, background: 'rgba(255,31,142,0.08)', top: -100, left: -80 }} />
          <div className="gg-hero-deco" style={{ width: 220, height: 220, background: 'rgba(201,169,110,0.12)', bottom: -60, right: 80 }} />
          <div className="gg-hero-content">
            <div className="gg-hero-text">
              <p className="gg-hero-eyebrow">{t.heroEyebrow}</p>
              <h1 className="gg-hero-h1">
                {store?.hero?.title?.replace(/<[^>]+>/g, '') || t.heroTitle}
              </h1>
              <p className="gg-hero-sub">
                {store?.hero?.subtitle || t.heroSub}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#products" className="gg-btn gg-btn-pink">{t.shopNow}</a>
                <Link href="/contact" className="gg-btn gg-btn-outline">{t.learnMore}</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust bar */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '0 24px' }}>
        <div className="gg-trust">
          {t.trust.map(item => (
            <div key={item.title} className="gg-trust-item">
              <div className="gg-trust-icon">{item.icon}</div>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: '13px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>{item.title}</p>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: '12px', color: 'var(--dim)', margin: 0, textAlign: 'center' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products section */}
      <section id="products" style={{ maxWidth: 1360, margin: '0 auto', padding: '20px 24px 80px' }}>
        <div className="gg-sec-hd">
          <p className="gg-sec-eyebrow">{t.collectionLabel}</p>
          <h2 className="gg-sec-title">{t.featuredTitle}</h2>
        </div>

        {/* Category filter */}
        {cats.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div className="gg-cats">
              <Link href="?" className={`gg-cat-chip${!activeCat ? ' active' : ''}`}>{t.all}</Link>
              {cats.map((cat: any) => (
                <Link key={cat.id} href={`?category=${cat.id}`} className={`gg-cat-chip${activeCat === String(cat.id) ? ' active' : ''}`}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--dim)' }}>
            <Sparkles size={36} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', fontStyle: 'italic' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="gg-cards-grid">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} />;
            })}
          </div>
        )}

        {/* Pagination */}
        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            {[...Array(countPage)].map((_, i) => (
              <a key={i} href={`?page=${i + 1}`}
                style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${(page || 1) === i + 1 ? 'var(--pink)' : 'var(--line-dk)'}`, background: (page || 1) === i + 1 ? 'var(--pink)' : 'var(--white)', color: (page || 1) === i + 1 ? '#fff' : 'var(--mid)', fontFamily: "'Nunito Sans',sans-serif", fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                {i + 1}
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETAILS
══════════════════════════════════════════════════════════════ */
export function Details({ product, discount, allImages, domain, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, store }: any) {
  const [sel, setSel] = useState(0);
  if (!product) return null;
  const t = T[getLang(store || product?.store)];
  const isRTL = t.dir === 'rtl';
  const currency = store?.currency || product?.store?.currency || 'DZD';

  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number) || 0;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--soft)', minHeight: '100vh', padding: '20px 0 60px' }}>

      <div className="gg-det-grid">
        {/* Gallery */}
        <div>
          <div className="gg-gallery-main" style={{ position: 'relative' }}>
            {allImages?.length > 0
              ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blush)' }}>
                  <Sparkles size={40} style={{ color: 'var(--pink)', opacity: 0.3 }} />
                </div>
            }
            {discount > 0 && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--pink)', color: '#fff', fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 999 }}>
                -{discount}%
              </div>
            )}
            
            {allImages?.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <ChevronRight size={14} style={{ color: 'var(--ink)' }} />
                </button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <ChevronLeft size={14} style={{ color: 'var(--ink)' }} />
                </button>
              </>
            )}
          </div>
          {allImages?.length > 1 && (
            <div className="gg-gallery-thumbs">
              {allImages.map((src: string, i: number) => (
                <div key={i} className={`gg-gallery-thumb${i === sel ? ' active' : ''}`} onClick={() => setSel(i)}>
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ paddingTop: 8 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 12, lineHeight: 1.25 }}>
            {product.name}
          </h1>

          {/* Stars */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={13} style={{ color: 'var(--gold)', fill: i < 4 ? 'var(--gold)' : 'none' }} />)}
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 700, color: 'var(--pink)' }}>{(finalPrice || price).toLocaleString()}</span>
            <span style={{ fontSize: 14, color: 'var(--dim)' }}>{currency}</span>
            {product.priceOriginal && parseFloat(String(product.priceOriginal)) > (finalPrice || price) && (
              <span style={{ fontSize: 14, color: 'var(--dim)', textDecoration: 'line-through' }}>{parseFloat(String(product.priceOriginal)).toLocaleString()}</span>
            )}
          </div>

          {/* Stock badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 20, background: inStock || autoGen ? 'rgba(255,31,142,0.08)' : 'rgba(100,80,80,0.08)', color: inStock || autoGen ? 'var(--pink)' : 'var(--mid)', fontSize: 12, fontWeight: 600, border: `1px solid ${inStock || autoGen ? 'var(--pink-lt)' : 'var(--mid)'}`, marginBottom: 20, fontFamily: "'Nunito Sans',sans-serif" }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />
            
          </div>

          <div style={{ height: 1, background: 'var(--line)', marginBottom: 20 }} />

          {/* Attributes */}
          {allAttrs?.map((attr: any) => (
            <div key={attr.id} style={{ marginBottom: 18 }}>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>
                {attr.name}
              </p>
              {attr.displayMode === 'color' ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {attr.variants.map((v: any) => {
                    const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection?.(attr.name, v.value)} title={v.name}
                        style={{ width: 28, height: 28, background: v.value, border: 'none', cursor: available ? 'pointer' : 'not-allowed', borderRadius: '50%', outline: selectedVariants?.[attr.name] === v.value ? '3px solid var(--pink)' : '3px solid transparent', outlineOffset: 3, opacity: available ? 1 : 0.35 }} />
                    );
                  })}
                </div>
              ) : attr.displayMode === 'image' ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {attr.variants.map((v: any) => {
                    const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection?.(attr.name, v.value)}
                        style={{ width: 52, height: 52, overflow: 'hidden', border: `2px solid ${selectedVariants?.[attr.name] === v.value ? 'var(--pink)' : 'var(--line-dk)'}`, cursor: available ? 'pointer' : 'not-allowed', padding: 0, borderRadius: 8, opacity: available ? 1 : 0.35 }}>
                        <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {attr.variants.map((v: any) => {
                    const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) => Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)));
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection?.(attr.name, v.value)}
                        className={`gg-var-btn${selectedVariants?.[attr.name] === v.value ? ' active' : ''}`}
                        style={{ cursor: available ? 'pointer' : 'not-allowed', color: available ? undefined : '#bbb', textDecoration: available ? 'none' : 'line-through' }}>
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {(product.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pink)', marginBottom: 20 }}>
              {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', String(store.freeShippingMinAmount))}
            </p>
          )}

          {/* Offers */}
          {product.offers?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>{t.offersTitle}</p>
              {product.offers.map((offer: any) => (
                <label key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1.5px solid ${selectedOffer === offer.id ? 'var(--pink)' : 'var(--line-dk)'}`, cursor: 'pointer', marginBottom: 8, borderRadius: 8, transition: 'all 0.2s', background: selectedOffer === offer.id ? 'var(--blush)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${selectedOffer === offer.id ? 'var(--pink)' : 'var(--dim)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectedOffer === offer.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pink)' }} />}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: '0 0 2px' }}>{offer.name} × {offer.quantity}</p>
                      {offer.subTitle && <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, color: 'var(--dim)', margin: '0 0 2px' }}>{offer.subTitle}</p>}
                      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--pink)', margin: 0 }}>{offer.price.toLocaleString()} {currency}</p>
                      {offer.shippingFree && <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 10, fontWeight: 700, color: 'var(--pink)', margin: '2px 0 0' }}>{t.freeShippingBadge}</p>}
                    </div>
                  </div>
                  <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer?.(offer.id)} style={{ display: 'none' }} />
                </label>
              ))}
            </div>
          )}

          <ProductForm product={product} userId={product.store?.userId || product.store?.user?.id} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants || {}} store={store || product?.store} />

          {product.desc && (
            <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
              <div style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 14, lineHeight: 1.85, color: 'var(--mid)' }} dangerouslySetInnerHTML={{ __html: product.desc }} />
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
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0, store }: ProductFormProps) {
  const t = T[getLang(store || product?.store)];
  const isRTL = t.dir === 'rtl';
  const currency = store?.currency || product?.store?.currency || 'DZD';
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId: id })); } }, []);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

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
      if (fd.customerId && typeof window !== 'undefined') localStorage.setItem('customerId', fd.customerId);
      window.location.href = `/successfully?productId=${product?.id}`;
    } catch { } finally { setSub(false); }
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Cart + Order buttons */}
        {product.store?.cart && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={addToCart} disabled={isAdded}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', border: `1.5px solid ${isAdded ? 'var(--pink)' : 'var(--line-dk)'}`, background: isAdded ? 'var(--blush)' : 'transparent', color: isAdded ? 'var(--pink)' : 'var(--mid)', fontFamily: "'Nunito Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer', borderRadius: 8, transition: 'all 0.2s' }}>
            {isAdded ? <><CheckCircle2 size={14} /> {t.addedMsg}</> : <><ShoppingBag size={14} /> {t.addToCart}</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} className="gg-btn gg-btn-pink" style={{ flex: 1, padding: '11px' }}>
            {t.orderNow}
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div>
          {product.store?.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--mid)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.deliveryInfoTitle}</p>
              <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', border: '1px solid var(--line-dk)', background: 'transparent', color: 'var(--dim)', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', borderRadius: 6 }}>
                <X size={11} /> {t.cancel}
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {supportQty && (
              <FR label={t.qty}>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line-dk)', borderRadius: 8, overflow: 'hidden' }}>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--soft)', cursor: 'pointer', color: 'var(--ink)', fontSize: 18 }}>-</button>
                  <span style={{ width: 48, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: "'Nunito Sans',sans-serif" }}>{fd.quantity}</span>
                  <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--soft)', cursor: 'pointer', color: 'var(--ink)', fontSize: 18 }}>+</button>
                </div>
              </FR>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FR label={t.fullName} error={errors.customerName}>
                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} style={INP(!!errors.customerName)} />
              </FR>
              <FR label={t.phone} error={errors.customerPhone}>
                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} style={INP(!!errors.customerPhone)} />
              </FR>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FR label={t.wilaya} error={errors.customerWelaya}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', ...(isRTL ? { right: 11 } : { left: 11 }), top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.customerWelaya), paddingInlineEnd: 32, fontFamily: 'inherit' }}>
                    <option value="">{t.wilayaPh}</option>
                    {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR label={t.commune} error={errors.customerCommune}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', ...(isRTL ? { right: 11 } : { left: 11 }), top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.customerCommune), paddingInlineEnd: 32, opacity: !fd.customerWelaya ? 0.4 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? t.communeLoading : t.communePh}</option>
                    {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <FR label={t.deliveryType}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['home', 'office'] as const).map(dtype => (
                  <button key={dtype} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: dtype }))}
                    style={{ padding: '12px 10px', border: `1.5px solid ${fd.typeLivraison === dtype ? 'var(--pink)' : 'var(--line-dk)'}`, background: fd.typeLivraison === dtype ? 'var(--blush)' : 'transparent', cursor: 'pointer', textAlign: 'center', borderRadius: 8, transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 700, color: fd.typeLivraison === dtype ? 'var(--pink)' : 'var(--mid)', margin: '0 0 4px' }}>{dtype === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                    {selW && (orderFreeShipping ? (
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === dtype ? 'var(--pink)' : 'var(--dim)', margin: 0, fontFamily: "'Cormorant Garamond',serif" }}>{t.freeShippingBadge}</p>
                    ) : (
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === dtype ? 'var(--pink)' : 'var(--dim)', margin: 0, fontFamily: "'Cormorant Garamond',serif" }}>{(dtype === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400 }}>{currency}</span></p>
                    ))}
                  </button>
                ))}
              </div>
            </FR>

            {/* Summary */}
            <div style={{ border: '1px solid var(--line-dk)', borderRadius: 8, marginBottom: 14, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: 'var(--blush)', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--mid)', margin: 0 }}>{t.orderSummaryTitle}</p>
              </div>
              {[
                { l: t.productLabel, v: product.name.slice(0, 22) },
                { l: t.price, v: `${fp.toLocaleString()} ${currency}` },
                { l: t.qty, v: `× ${qty}` },
                { l: t.delivery, v: !selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${currency}` },
              ].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--line)', background: 'var(--white)' }}>
                  <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--dim)' }}>{row.l}</span>
                  <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', background: 'var(--blush)' }}>
                <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--mid)' }}>{t.total}</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--pink)' }}>{total().toLocaleString()} <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 400, color: 'var(--dim)' }}>{currency}</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="gg-btn gg-btn-pink" style={{ width: '100%', fontSize: 15, padding: 13, cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1, borderRadius: 8, marginBottom: 8 }}>
              {sub ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t.sending}</> : `💳 ${t.confirmOrder}`}
            </button>
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
  const isRTL = t.dir === 'rtl';
  const currency = store?.currency || 'DZD';
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(domain) || '[]'));
    const uid = store?.user?.id || store?.userId;
    if (uid) fetchWilayas(uid).then(setWilayas);
  }, [domain, store]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const cartTotal = items.reduce((a, i) => a + i.finalPrice * i.quantity, 0);
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
        ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId,
        selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants,
        platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal,
        priceLivraison: +getLiv(), quantity: i.quantity, priceLoss: selW?.livraisonReturn ?? 0,
      })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  if (success) return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--soft)' }}>
      <div style={{ textAlign: 'center', background: 'var(--white)', padding: '4rem 2.5rem', border: '1px solid var(--line)', borderRadius: 16, maxWidth: 460, width: '100%', boxShadow: '0 8px 40px rgba(255,31,142,0.1)' }}>
        <CheckCircle2 size={48} style={{ color: 'var(--pink)', margin: '0 auto 20px', display: 'block' }} />
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontStyle: 'italic', color: 'var(--ink)', marginBottom: 8 }}>{t.successTitle}</h2>
        <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 14, color: 'var(--dim)', marginBottom: 28, lineHeight: 1.7 }}>{t.successDesc}</p>
        <Link href="/" className="gg-btn gg-btn-pink">{t.backToShop}</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--soft)' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--line-dk)', borderRadius: 12, maxWidth: 400, width: '100%', background: 'var(--white)' }}>
        <ShoppingBag size={48} style={{ color: 'var(--pink)', opacity: 0.35, margin: '0 auto 16px', display: 'block' }} />
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontStyle: 'italic', color: 'var(--mid)', marginBottom: 20 }}>{t.cartEmpty}</p>
        <Link href="/" className="gg-btn gg-btn-pink">{t.shopNow}</Link>
      </div>
    </div>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px', minHeight: '100vh', background: 'var(--soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottom: '1.5px solid var(--line)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', margin: 0 }}>{t.myCart}</h1>
          <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--dim)' }}>{items.length} {t.itemUnit}</span>
        </div>
        <Link href="/" className="gg-btn gg-btn-outline" style={{ fontSize: 13, padding: '9px 18px' }}>
          <ShoppingBag size={14} /> {t.continueShopping}
        </Link>
      </div>
      {freeShippingMin != null && (
        <div style={{ background: freeShippingReached ? 'var(--blush)' : 'var(--white)', border: `1px solid ${freeShippingReached ? 'var(--pink-lt)' : 'var(--line)'}`, color: freeShippingReached ? 'var(--pink)' : 'var(--dim)', borderRadius: 8, padding: '12px 18px', marginBottom: 24, fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
          {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', String(freeShippingRemainingAmt))}
        </div>
      )}

      <div className="gg-cart-grid">
        {/* Items */}
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ width: 88, height: 110, flexShrink: 0, overflow: 'hidden', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--blush)' }}>
                <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontFamily: "'Nunito Sans',sans-serif", fontWeight: 600, color: 'var(--ink)', fontSize: 14, lineHeight: 1.45, marginBottom: 6 }}>{item.product?.name}</h4>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--pink)', margin: 0 }}>{item.finalPrice?.toLocaleString()} {currency}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dim)', fontFamily: "'Nunito Sans',sans-serif" }}>× {item.quantity}</span>
                  <button onClick={() => update(items.filter((_, idx) => idx !== i))}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--line-dk)', borderRadius: 7, background: 'var(--white)', color: 'var(--dim)', fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'var(--pink)'; e.currentTarget.style.borderColor = 'var(--pink)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.borderColor = 'var(--line-dk)'; }}>
                    <Trash2 size={12} /> {t.deleteLabel}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 28, alignSelf: 'start' }}>
          <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 20 }}>{t.checkoutInfoTitle}</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <FR label={t.fullName} error={errors.name}><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={INP(!!errors.name)} /></FR>
              <FR label={t.phone} error={errors.phone}><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={INP(!!errors.phone)} /></FR>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <FR label={t.wilaya} error={errors.w}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', ...(isRTL ? { right: 11 } : { left: 11 }), top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.w), paddingInlineEnd: 32, fontFamily: 'inherit' }}>
                    <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR label={t.commune} error={errors.c}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', ...(isRTL ? { right: 11 } : { left: 11 }), top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.c), paddingInlineEnd: 32, opacity: !fd.customerWelaya ? 0.4 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <div style={{ margin: '20px 0' }}>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 12 }}>{t.deliveryType}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['home', 'office'] as const).map(dtype => (
                  <button key={dtype} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: dtype }))}
                    style={{ padding: '13px 8px', border: `1.5px solid ${fd.typeLivraison === dtype ? 'var(--pink)' : 'var(--line-dk)'}`, borderRadius: 8, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === dtype ? 'rgba(255,31,142,0.06)' : 'var(--white)', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    <span style={{ display: 'block', fontSize: '1.3rem', marginBottom: 4 }}>{dtype === 'home' ? '🏠' : '🏢'}</span>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', margin: '0 0 2px' }}>{dtype === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                    {selW && <p style={{ fontWeight: 600, fontSize: 12, color: 'var(--pink)', margin: 0 }}>{freeShippingReached ? t.freeShippingBadge : `${(dtype === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} ${currency}`}</p>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />

            <div style={{ marginBottom: 16 }}>
              {[[t.subtotal, `${cartTotal.toLocaleString()} ${currency}`], [t.delivery, !selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${currency}`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--dim)' }}>{k}</span>
                  <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontWeight: 700, color: 'var(--ink)' }}>{t.total}</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.7rem', fontWeight: 700, color: 'var(--pink)' }}>{finalTotal.toLocaleString()} <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 400, color: 'var(--dim)' }}>{currency}</span></span>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="gg-btn gg-btn-pink" style={{ width: '100%', fontSize: 15, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t.sending}</> : `🛒 ${t.confirmOrder}`}
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
        <div style={{ textAlign: 'center', background: '#fff', padding: '3rem 2rem', borderRadius: 16, border: '1px solid rgba(255,31,142,0.15)', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={40} style={{ color: 'var(--pink)', display: 'block', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontStyle: 'italic', color: 'var(--ink)', marginBottom: 8 }}>{t.successTitle}</h2>
          <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 14, color: 'var(--dim)', lineHeight: 1.7 }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(255,31,142,0.15)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.75rem', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid rgba(255,31,142,0.12)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--dim)' }}>{t.total}</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--pink)' }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(255,31,142,0.15)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? CheckCircle2;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? '1px solid rgba(255,31,142,0.1)' : 'none', background: done ? 'rgba(255,31,142,0.05)' : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--pink)' : '#FBEAF2', color: done ? '#fff' : 'var(--dim)' }}>
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
          <Link href="/" className="gg-btn gg-btn-pink" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ShoppingBag size={17} /> {t.shopNow}
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', borderRadius: 999, border: '1px solid rgba(255,31,142,0.2)', color: 'var(--dim)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
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
  return (
  <div dir={t.dir} style={{ backgroundColor: 'var(--soft)', minHeight: '100vh' }}>
    <div style={{ background: 'linear-gradient(135deg,var(--blush) 0%,var(--blush-2) 100%)', padding: '56px 24px 40px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {sub && <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{sub}</p>}
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', margin: 0 }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 80px' }}>
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 32 }}>{children}</div>
    </div>
  </div>
  );
};

const InfoBlock = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom: 18, marginBottom: 18, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--ink)', margin: '0 0 7px' }}>{title}</h3>
      <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, lineHeight: 1.85, color: 'var(--mid)', fontWeight: 400, margin: 0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid var(--line-dk)', color: 'var(--pink)', borderRadius: 20, flexShrink: 0 }}>{tag}</span>}
  </div>
);

export function Privacy({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacyTitle} sub={t.legalSub} store={store}>
      <InfoBlock title={t.privDataTitle} body={t.privDataBody} />
      <InfoBlock title={t.privUseTitle} body={t.privUseBody} />
      <InfoBlock title={t.privSecTitle} body={t.privSecBody} />
      <InfoBlock title={t.privShareTitle} body={t.privShareBody} />
    </Shell>
  );
}

export function Terms({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.termsTitle} sub={t.legalSub} store={store}>
      <InfoBlock title={t.termsAccTitle} body={t.termsAccBody} />
      <InfoBlock title={t.termsPayTitle} body={t.termsPayBody} />
      <InfoBlock title={t.termsProhibTitle} body={t.termsProhibBody} tag={t.termsStrictTag} />
      <InfoBlock title={t.termsLawTitle} body={t.termsLawBody} />
    </Shell>
  );
}

export function Cookies({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookiesTitle} sub={t.legalSub} store={store}>
      <InfoBlock title={t.cookEssTitle} body={t.cookEssBody} tag={t.cookEssTag} />
      <InfoBlock title={t.cookPrefTitle} body={t.cookPrefBody} tag={t.cookOptTag} />
      <InfoBlock title={t.cookAnalTitle} body={t.cookAnalBody} tag={t.cookOptTag} />
      <div style={{ marginTop: 16, padding: 14, border: '1px solid var(--line)', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--blush)' }}>
        <ToggleRight size={18} style={{ color: 'var(--pink)', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--mid)', lineHeight: 1.8, margin: 0 }}>{t.cookManageNote}</p>
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store?: any }) {
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id });
      setSent(true);
    } catch { showError(t.errContact); } finally { setLoading(false); }
  };

  const contactItems = [
    { icon: <Phone size={14} />, label: t.contactPhoneLabel, val: store?.contact?.phone || '+213 550 000 000' },
    { icon: <Mail size={14} />, label: t.contactEmailLabel, val: store?.contact?.email || 'info@store.dz' },
    { icon: <MapPin size={14} />, label: t.contactLocationLabel, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || 'Algeria' },
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--soft)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--blush) 0%,var(--blush-2) 100%)', padding: '56px 24px 40px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{t.contactSub}</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 8px' }}>{t.contactTitle}</h1>
          <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 14, color: 'var(--dim)' }}>{t.contactReplyTime}</p>
        </div>
      </div>

      <div className="gg-contact-grid" style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Info */}
        <div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, marginBottom: 12 }}>
            <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 16 }}>{t.contactWays}</p>
            {contactItems.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--blush)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pink)', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 14, border: '1px solid var(--line)', borderRadius: 8, background: 'var(--blush)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--pink)', display: 'inline-block', animation: 'gg-glimmer 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--mid)' }}>{t.contactAvailable}</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 28 }}>
          <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 20 }}>{t.sendMsg}</p>
          {sent ? (
            <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: 8, textAlign: 'center', background: 'var(--blush)', padding: 32 }}>
              <CheckCircle2 size={32} style={{ color: 'var(--pink)', marginBottom: 12 }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 6px' }}>{t.messageSentTitle}</h3>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--dim)' }}>{t.messageSentDesc}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="gg-form-2c">
                <FR label={t.fullName}><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t.namePh} required style={INP()} /></FR>
                <FR label={t.phone}><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={t.phonePh} required style={INP()} /></FR>
              </div>
              <FR label={t.emailLabel}><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t.emailPh} required style={INP()} /></FR>
              <FR label={t.messageLabel}><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t.messagePh} rows={4} required style={{ ...INP(), resize: 'none' }} /></FR>
              <button type="submit" disabled={loading} className="gg-btn gg-btn-pink" style={{ justifyContent: 'center', width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t.sending}</> : <>{t.sendLabel}</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
