'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingCart, MapPin, Phone, User, Home as HomeIcon, ChevronDown, Truck, Shield, Package,
  Building2, AlertCircle, Tag, Check, ChevronLeft, ChevronRight, FileText, Heart,
  Infinity, Link2, RefreshCw, Share2, Star, X, ShieldCheck, Eye, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban, Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
} from 'lucide-react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────
// MOCK DATA - بيانات تجريبية ثابتة للثيم البوهو
// ─────────────────────────────────────────────────────────────

const MOCK_STORE = {
  name: 'رُقيّ',
  subdomain: 'ruqay',
  domain: 'ruqay.store',
  language: 'ar',
  currency: 'د.ج',
  topBar: {
    enabled: true,
    text: 'شحن مجاني للطلبات فوق 5000 د.ج',
    color: '#3D2314',
  },
  design: {
    primaryColor: '#C4714A',
    secondaryColor: '#7A9068',
    logoUrl: null,
  },
  hero: {
    title: 'أناقة طبيعية لحياة أجمل',
    subtitle: 'اكتشفي تشكيلتنا المختارة من المنتجات اليدوية والطبيعية بعناية فائقة',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
  },
  categories: [
    { id: '1', name: 'ديكور', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
    { id: '2', name: 'أزياء', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' },
    { id: '3', name: 'مجوهرات', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' },
    { id: '4', name: 'عطور', imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400' },
    { id: '5', name: 'مفارش', imageUrl: 'https://images.unsplash.com/photo-1522771753035-a0a1f66cd459?w=400' },
  ],
  products: [
    {
      id: '1',
      name: 'فازة سيراميك يدوية',
      slug: 'handmade-ceramic-vase',
      price: 4500,
      priceOriginal: 5800,
      desc: '<p>فازة فنية مصنوعة يدوياً من الطين النقي، مزخرفة بنقوش بوهو أصيلة.</p>',
      productImage: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600',
      imagesProduct: [
        { id: '1', imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600' },
        { id: '2', imageUrl: 'https://images.unsplash.com/photo-1612196808214-b7e239e5bbae?w=600' },
      ],
      stock: 12,
      isActive: true,
      offers: [
        { id: '1', name: 'عرض الزوج', quantity: 2, price: 8000 },
      ],
      attributes: [
        {
          id: '1',
          type: 'color',
          name: 'اللون',
          displayMode: 'color' as const,
          variants: [
            { id: '1', name: 'تراكوتا', value: '#C4714A' },
            { id: '2', name: 'كريمي', value: '#F5F5DC' },
            { id: '3', name: 'زيتي', value: '#7A9068' },
          ],
        },
      ],
      variantDetails: [
        { id: 'v1', name: [{ attrName: 'اللون', value: '#C4714A', attrId: '1', displayMode: 'color' }], price: 4500, stock: 5, autoGenerate: false },
        { id: 'v2', name: [{ attrName: 'اللون', value: '#F5F5DC', attrId: '1', displayMode: 'color' }], price: 4800, stock: 4, autoGenerate: false },
      ],
      store: { id: 's1', name: 'رُقيّ', subdomain: 'ruqay', userId: 'u1' },
    },
    {
      id: '2',
      name: 'حقيبة جلد طبيعي',
      slug: 'leather-bag',
      price: 8900,
      priceOriginal: 12000,
      desc: '<p>حقيبة يد مصنوعة من الجلد الطبيعي 100%، تصميم عصري بروح بوهو.</p>',
      productImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
      stock: 8,
      isActive: true,
      offers: [],
      attributes: [],
      variantDetails: [],
      store: { id: 's1', name: 'رُقيّ', subdomain: 'ruqay', userId: 'u1' },
    },
    {
      id: '3',
      name: 'شمعة عطرية طبيعية',
      slug: 'scented-candle',
      price: 2200,
      priceOriginal: null,
      desc: '<p>شمعة مصنوعة يدوياً من شمع الصويا الطبيعي مع زيوت عطرية نقية.</p>',
      productImage: 'https://images.unsplash.com/photo-1602825269685-874f940f7b2b?w=600',
      stock: 25,
      isActive: true,
      offers: [
        { id: '2', name: 'مجموعة 3 قطع', quantity: 3, price: 5500 },
      ],
      attributes: [
        {
          id: '2',
          type: 'scent',
          name: 'الرائحة',
          displayMode: 'text' as const,
          variants: [
            { id: '4', name: 'لافندر', value: 'lavender' },
            { id: '5', name: 'فانيليا', value: 'vanilla' },
            { id: '6', name: 'ورد', value: 'rose' },
          ],
        },
      ],
      variantDetails: [],
      store: { id: 's1', name: 'رُقيّ', subdomain: 'ruqay', userId: 'u1' },
    },
    {
      id: '4',
      name: 'سجادة يدوية النسج',
      slug: 'handwoven-rug',
      price: 15900,
      priceOriginal: 19500,
      desc: '<p>سجادة صوفية 100% منسوجة يدوياً بتقنيات تقليدية.</p>',
      productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
      stock: 3,
      isActive: true,
      offers: [],
      attributes: [],
      variantDetails: [],
      store: { id: 's1', name: 'رُقيّ', subdomain: 'ruqay', userId: 'u1' },
    },
  ],
  contact: {
    email: 'hello@ruqay.store',
    phone: '+213550123456',
    wilaya: 'الجزائر العاصمة',
    facebook: 'https://facebook.com',
    whatsapp: '213550123456',
    tiktok: 'https://tiktok.com',
  },
};

const MOCK_WILAYAS = [
  { id: '16', name: 'Alger', ar_name: 'الجزائر', livraisonHome: 600, livraisonOfice: 400, livraisonReturn: 0 },
  { id: '31', name: 'Oran', ar_name: 'وهران', livraisonHome: 800, livraisonOfice: 500, livraisonReturn: 100 },
  { id: '09', name: 'Blida', ar_name: 'البليدة', livraisonHome: 700, livraisonOfice: 450, livraisonReturn: 50 },
  { id: '25', name: 'Constantine', ar_name: 'قسنطينة', livraisonHome: 900, livraisonOfice: 600, livraisonReturn: 150 },
];

const MOCK_COMMUNES = {
  '16': [
    { id: '1601', name: 'Alger Centre', ar_name: 'الجزائر الوسطى', wilayaId: '16' },
    { id: '1602', name: 'Bab El Oued', ar_name: 'باب الزوار', wilayaId: '16' },
    { id: '1603', name: 'Hydra', ar_name: 'حيدرة', wilayaId: '16' },
  ],
  '31': [
    { id: '3101', name: 'Oran Centre', ar_name: 'وهران', wilayaId: '31' },
    { id: '3102', name: 'Es Senia', ar_name: 'السانية', wilayaId: '31' },
  ],
  '09': [
    { id: '0901', name: 'Blida', ar_name: 'البليدة', wilayaId: '09' },
    { id: '0902', name: 'Boufarik', ar_name: 'بوفاريك', wilayaId: '09' },
  ],
  '25': [
    { id: '2501', name: 'Constantine', ar_name: 'قسنطينة', wilayaId: '25' },
  ],
};

// ─────────────────────────────────────────────────────────────
// STYLES & ANIMATIONS
// ─────────────────────────────────────────────────────────────

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Karla:wght@300;400;500;600&display=swap');

    * { -webkit-font-smoothing: antialiased; }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.028;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-size: 200px 200px;
    }

    @keyframes sway { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
    @keyframes drift { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
    @keyframes boho-in { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

    .boho-in { animation: boho-in 0.7s ease forwards; }
    .boho-in-1 { animation: boho-in 0.7s 0.1s ease both; }
    .boho-in-2 { animation: boho-in 0.7s 0.2s ease both; }
    .boho-in-3 { animation: boho-in 0.7s 0.35s ease both; }

    .leaf-sway { animation: sway 4s ease-in-out infinite; transform-origin: bottom center; }
    .feather-drift { animation: drift 5s ease-in-out infinite; }

    .boho-card { transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease; }
    .boho-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(61,35,20,0.12); }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #EDE4D4; }
    ::-webkit-scrollbar-thumb { background: #C4714A; border-radius: 10px; }

    .boho-nav-link { position: relative; padding-bottom: 2px; }
    .boho-nav-link::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0;
      height: 1px; width: 0;
      background: #C4714A;
      transition: width 0.3s ease;
    }
    .boho-nav-link:hover::after { width: 100%; }
    .boho-nav-link:hover { color: #3D2314 !important; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────────────────────

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
  </svg>
);

const FeatherSvg = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="60" height="120" viewBox="0 0 60 120" fill="none" style={{ ...style, opacity: 0.15 }}>
    <path d="M30 110 Q28 85 30 10" stroke="#7A9068" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M30 90 Q10 75 8 55" stroke="#7A9068" strokeWidth="1" strokeLinecap="round"/>
    <path d="M30 70 Q50 55 52 38" stroke="#C4714A" strokeWidth="1" strokeLinecap="round"/>
    <path d="M30 50 Q12 38 14 22" stroke="#7A9068" strokeWidth="1" strokeLinecap="round"/>
    <path d="M30 30 Q46 20 45 8" stroke="#C4714A" strokeWidth="1" strokeLinecap="round"/>
    <ellipse cx="8" cy="53" rx="6" ry="10" fill="#7A9068" opacity="0.4" transform="rotate(-30 8 53)"/>
    <ellipse cx="52" cy="36" rx="6" ry="10" fill="#C4714A" opacity="0.3" transform="rotate(25 52 36)"/>
    <ellipse cx="14" cy="20" rx="5" ry="9" fill="#7A9068" opacity="0.35" transform="rotate(-20 14 20)"/>
    <ellipse cx="45" cy="7" rx="5" ry="8" fill="#D4A28C" opacity="0.4" transform="rotate(15 45 7)"/>
  </svg>
);

const BotanicalLeft = () => (
  <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.18 }}>
    <path d="M40 90 Q20 70 25 45 Q30 20 40 10" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M40 65 Q18 55 15 38" stroke="#7A9068" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <path d="M40 50 Q55 40 58 25" stroke="#7A9068" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <path d="M40 78 Q28 72 22 60" stroke="#C4714A" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <ellipse cx="15" cy="36" rx="7" ry="11" fill="#7A9068" opacity="0.4" transform="rotate(-30 15 36)"/>
    <ellipse cx="58" cy="23" rx="7" ry="10" fill="#7A9068" opacity="0.4" transform="rotate(20 58 23)"/>
    <ellipse cx="22" cy="58" rx="5" ry="8" fill="#C4714A" opacity="0.3" transform="rotate(-15 22 58)"/>
    <circle cx="40" cy="10" r="3" fill="#C4714A" opacity="0.5"/>
  </svg>
);

const MoonSvg = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.3 }}>
    <path d="M22 16a10 10 0 1 1-10-10 7 7 0 0 0 10 10z" fill="#C4714A"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────

function Navbar({ store, scrolled }: { store: any; scrolled: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isRTL = store.language === 'ar';

  const navItems = [
    { href: '#home', label: isRTL ? 'الرئيسية' : 'Home' },
    { href: '#products', label: isRTL ? 'المنتجات' : 'Products' },
    { href: '#contact', label: isRTL ? 'اتصل بنا' : 'Contact' },
  ];

  return (
    <nav
      dir={isRTL ? 'rtl' : 'ltr'}
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(247,240,230,0.96)' : '#F7F0E6',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid #E8D9C5' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 20px rgba(61,35,20,0.06)' : 'none',
        fontFamily: "'Karla', sans-serif",
      }}
    >
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #C4714A, #D4A28C, #7A9068, #D4A28C, #C4714A)' }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          <a href="#home" className="flex items-center gap-2.5 group">
            <div className="feather-drift opacity-80 group-hover:opacity-100 transition-opacity">
              <SunIcon />
            </div>
            <span
              className="group-hover:text-[#C4714A] transition-colors duration-300"
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '1.35rem',
                color: '#3D2314',
                letterSpacing: '-0.01em',
              }}
            >
              {store.name}
            </span>
          </a>

          <div className="hidden md:flex items-center gap-9">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="boho-nav-link text-sm font-medium transition-colors duration-200"
                style={{ color: '#8E7860', letterSpacing: '0.04em' }}
              >
                {item.label}
              </a>
            ))}
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C4714A', opacity: 0.5 }} />
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
          >
            <span className="block h-px transition-all duration-300" style={{ width: '22px', backgroundColor: '#3D2314', transform: isMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span className="block h-px transition-all duration-300" style={{ width: '14px', backgroundColor: '#3D2314', opacity: isMenuOpen ? 0 : 1 }} />
            <span className="block h-px transition-all duration-300" style={{ width: '22px', backgroundColor: '#3D2314', transform: isMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>
        </div>

        <div
          className="md:hidden overflow-hidden transition-all duration-400"
          style={{ maxHeight: isMenuOpen ? '240px' : '0', paddingBottom: isMenuOpen ? '1.25rem' : '0' }}
        >
          <div className="flex flex-col gap-5 pt-4" style={{ borderTop: '1px solid #E8D9C5' }}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: '#8E7860' }}
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#C4714A' }} />
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero({ store }: { store: any }) {
  const isRTL = store.language === 'ar';

  return (
    <section
      id="home"
      className="relative flex items-center overflow-hidden"
      style={{ minHeight: '88vh' }}
    >
      {store.hero.imageUrl ? (
        <>
          <img src={store.hero.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(105deg, rgba(61,35,20,0.6) 0%, rgba(61,35,20,0.1) 60%, transparent 100%)' }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #EDE0CE 0%, #F7F0E6 50%, #EAE2D4 100%)' }}
        />
      )}

      <div className="absolute top-12 right-12 pointer-events-none hidden lg:block">
        <FeatherSvg style={{ transform: 'rotate(10deg)' }} />
      </div>
      <div className="absolute bottom-16 left-8 pointer-events-none hidden lg:block">
        <FeatherSvg style={{ transform: 'rotate(-15deg) scaleX(-1)' }} />
      </div>
      <div className="absolute top-8 left-1/2 pointer-events-none">
        <MoonSvg />
      </div>

      <div className="relative z-10 px-10 lg:px-20 max-w-2xl boho-in">
        {store.hero.title && (
          <h1
            className="leading-tight mb-5"
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              color: store.hero.imageUrl ? '#FDF8F2' : '#3D2314',
              letterSpacing: '-0.02em',
            }}
          >
            {store.hero.title}
          </h1>
        )}
        {store.hero.subtitle && (
          <p
            className="mb-9 max-w-md leading-relaxed boho-in-1"
            style={{
              color: store.hero.imageUrl ? 'rgba(253,248,242,0.8)' : '#8E7860',
              fontSize: '1rem',
              letterSpacing: '0.03em',
            }}
          >
            {store.hero.subtitle}
          </p>
        )}
        <div className="flex flex-wrap gap-4 boho-in-2">
          <a
            href="#products"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              backgroundColor: '#C4714A',
              color: '#FDF8F2',
              borderRadius: '30px',
              letterSpacing: '0.06em',
            }}
          >
            {isRTL ? 'اكتشف المجموعة' : 'Explore Collection'}
          </a>
          <a
            href="#categories"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 hover:bg-[#EDE0CE]"
            style={{
              backgroundColor: store.hero.imageUrl ? 'rgba(253,248,242,0.15)' : '#EDE0CE',
              color: store.hero.imageUrl ? '#FDF8F2' : '#3D2314',
              borderRadius: '30px',
              border: '1px solid',
              borderColor: store.hero.imageUrl ? 'rgba(253,248,242,0.3)' : '#D8C8B0',
            }}
          >
            {isRTL ? 'تصفّح التصنيفات' : 'Browse Categories'}
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span
          className="text-[10px] tracking-widest"
          style={{ color: store.hero.imageUrl ? 'rgba(253,248,242,0.5)' : '#C8B09A', letterSpacing: '0.2em' }}
        >
          {isRTL ? 'تمرير للأسفل' : 'Scroll'}
        </span>
        <div
          className="w-px h-10 animate-pulse"
          style={{ backgroundColor: store.hero.imageUrl ? 'rgba(253,248,242,0.3)' : '#D4A28C' }}
        />
      </div>
    </section>
  );
}

function Categories({ store }: { store: any }) {
  const isRTL = store.language === 'ar';

  return (
    <section id="categories" className="py-20" style={{ backgroundColor: '#F7F0E6' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12 boho-in">
          <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: '#C4714A', letterSpacing: '0.22em' }}>
            ✦ &nbsp; {isRTL ? 'تصفّح' : 'Browse'} &nbsp; ✦
          </p>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: '#3D2314',
              letterSpacing: '-0.01em',
            }}
          >
            {isRTL ? 'تصنيفاتنا' : 'Our Collections'}
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            className="px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            style={{
              backgroundColor: '#C4714A',
              color: '#FDF8F2',
              borderRadius: '30px',
              letterSpacing: '0.05em',
            }}
          >
            ✦ {isRTL ? 'الكل' : 'All'}
          </button>

          {store.categories.map((cat: any) => (
            <button
              key={cat.id}
              className="px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[#C4714A] hover:text-[#3D2314]"
              style={{
                backgroundColor: '#FDF8F2',
                color: '#8E7860',
                borderRadius: '30px',
                border: '1px solid #E0CEBC',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ product, store }: { product: any; store: any }) {
  const isRTL = store.language === 'ar';
  const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl;
  const discount = product.priceOriginal ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;

  return (
    <div
      className="boho-card group flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#FDF8F2',
        borderRadius: '20px',
        border: '1px solid #EDE0CE',
        fontFamily: "'Karla', sans-serif",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '3/4', backgroundColor: '#EDE0CE', borderRadius: '20px 20px 0 0' }}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#C4714A" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
              <circle cx="24" cy="24" r="10" stroke="#7A9068" strokeWidth="1" opacity="0.3" />
              <circle cx="24" cy="24" r="3" fill="#C4714A" opacity="0.3" />
            </svg>
            <span className="text-xs tracking-wider" style={{ color: '#B89A7A' }}>
              {isRTL ? 'لا توجد صورة' : 'No Image'}
            </span>
          </div>
        )}

        <div
          className="absolute bottom-0 left-0 right-0 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(61,35,20,0.35), transparent)' }}
        />

        {discount > 0 && (
          <div
            className="absolute top-3 right-3 text-[10px] font-semibold tracking-wider px-2.5 py-1"
            style={{
              backgroundColor: '#C4714A',
              color: '#FDF8F2',
              borderRadius: '20px',
              letterSpacing: '0.08em',
            }}
          >
            -{discount}%
          </div>
        )}

        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[11px] tracking-widest font-semibold px-5 py-2 transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: '#FDF8F2',
              color: '#3D2314',
              borderRadius: '30px',
              letterSpacing: '0.1em',
            }}
          >
            {isRTL ? 'اكتشف المنتج' : 'Discover'}
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3
          className="mb-1 line-clamp-1 group-hover:text-[#C4714A] transition-colors duration-300"
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            fontSize: '1rem',
            fontWeight: 400,
            color: '#3D2314',
            letterSpacing: '-0.01em',
          }}
        >
          {product.name}
        </h3>

        {product.desc && (
          <div
            className="text-xs mb-3 line-clamp-2 leading-relaxed"
            style={{ color: '#9E8060' }}
            dangerouslySetInnerHTML={{ __html: product.desc }}
          />
        )}

        <div className="my-3 flex items-center gap-2">
          <div className="flex-1 h-px" style={{ backgroundColor: '#EDE0CE' }} />
          <span style={{ color: '#D4A28C', fontSize: '8px' }}>✦</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#EDE0CE' }} />
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '1.25rem',
                fontWeight: 400,
                color: '#C4714A',
              }}
            >
              {product.price.toLocaleString()}
            </span>
            <span className="text-xs ml-1" style={{ color: '#B89A7A' }}>{store.currency}</span>
            {product.priceOriginal && (
              <p className="text-xs line-through mt-0.5" style={{ color: '#C8B09A' }}>
                {product.priceOriginal.toLocaleString()}
              </p>
            )}
          </div>

          <button
            onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-center w-9 h-9 transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: '#F0E6D8',
              borderRadius: '50%',
              border: '1px solid #E0CEBC',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8E7860' }}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductGrid({ store }: { store: any }) {
  const isRTL = store.language === 'ar';

  return (
    <section id="products" className="py-20" style={{ backgroundColor: '#F0E6D8' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: '#C4714A', letterSpacing: '0.22em' }}>
            ✦ &nbsp; {isRTL ? 'جديد' : 'New In'} &nbsp; ✦
          </p>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: '#3D2314',
              letterSpacing: '-0.01em',
            }}
          >
            {isRTL ? 'أحدث المنتجات' : 'Latest Arrivals'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {store.products.map((product: any) => (
            <Card key={product.id} product={product} store={store} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductDetails({ product, store }: { product: any; store: any }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerWelaya: '',
    customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });

  const allImages = product.imagesProduct?.map((img: any) => img.imageUrl) || [product.productImage].filter(Boolean);
  const discount = product.priceOriginal ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;

  const finalPrice = selectedOffer
    ? product.offers.find((o: any) => o.id === selectedOffer)?.price || product.price
    : product.price;

  const inStock = product.stock > 0;
  const selectedWilayaData = MOCK_WILAYAS.find(w => w.id === formData.customerWelaya);
  const communes = formData.customerWelaya ? MOCK_COMMUNES[formData.customerWelaya as keyof typeof MOCK_COMMUNES] || [] : [];

  const handleVariantSelection = (attrName: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [attrName]: value }));
  };

  const getTotalPrice = () => {
    const shipping = selectedWilayaData
      ? formData.typeLivraison === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice
      : 0;
    return finalPrice * quantity + shipping;
  };

  return (
    <div id="details" className="min-h-screen bg-white py-12" dir="rtl" style={{ backgroundColor: '#F7F0E6' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Images */}
          <div className="space-y-3">
            <div
              className="relative overflow-hidden group"
              style={{ aspectRatio: '4/5', backgroundColor: '#EDE0CE', borderRadius: '24px' }}
            >
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16" style={{ color: '#D4A28C' }} />
                </div>
              )}

              {discount > 0 && (
                <div
                  className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5"
                  style={{ backgroundColor: '#C4714A', color: '#FDF8F2', borderRadius: '20px' }}
                >
                  خصم {discount}%
                </div>
              )}

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 shadow-sm"
                style={{
                  backgroundColor: isWishlisted ? '#C4714A' : 'rgba(253,248,242,0.9)',
                  color: isWishlisted ? '#FDF8F2' : '#8E7860',
                }}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(p => (p === 0 ? allImages.length - 1 : p - 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(253,248,242,0.9)', color: '#3D2314' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(p => (p === allImages.length - 1 ? 0 : p + 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(253,248,242,0.9)', color: '#3D2314' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className="shrink-0 w-16 h-20 overflow-hidden transition-all duration-200"
                    style={{
                      borderRadius: '12px',
                      border: `2px solid ${selectedImage === idx ? '#C4714A' : 'transparent'}`,
                      opacity: selectedImage === idx ? 1 : 0.55,
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info + Form */}
          <div className="space-y-7">
            <div>
              <h1
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                  color: '#3D2314',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < 4 ? '#C4714A' : 'none'} stroke="#C4714A" strokeWidth="1.5">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs" style={{ color: '#B89A7A' }}>٤.٨ · ١٢٨ تقييم</span>
              </div>
            </div>

            <div
              className="p-5"
              style={{ backgroundColor: '#F0E6D8', borderRadius: '16px' }}
            >
              <div className="flex items-baseline gap-4">
                <span
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: '2.2rem',
                    fontWeight: 400,
                    color: '#C4714A',
                  }}
                >
                  {finalPrice.toLocaleString('ar-DZ')}
                </span>
                <span className="text-sm" style={{ color: '#B89A7A' }}>دج</span>
                {product.priceOriginal && product.priceOriginal > finalPrice && (
                  <div>
                    <span className="text-sm line-through" style={{ color: '#C8B09A' }}>
                      {product.priceOriginal.toLocaleString('ar-DZ')} دج
                    </span>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: '#7A9068' }}>
                      وفّر {(product.priceOriginal - finalPrice).toLocaleString('ar-DZ')} دج
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: inStock ? 'rgba(122,144,104,0.1)' : 'rgba(196,113,74,0.1)',
                color: inStock ? '#7A9068' : '#C4714A',
                borderRadius: '30px',
              }}
            >
              {inStock ? <span className="w-2 h-2 rounded-full bg-current" /> : <X className="w-3.5 h-3.5" />}
              {inStock ? 'متوفر في المخزون' : 'غير متوفر حالياً'}
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#B89A7A', letterSpacing: '0.12em' }}>العروض المتاحة</p>
                <div className="space-y-2">
                  {product.offers.map((offer: any) => (
                    <label
                      key={offer.id}
                      className="flex items-center justify-between p-4 cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: selectedOffer === offer.id ? '#FDF8F2' : '#F7F0E6',
                        borderRadius: '14px',
                        border: `1.5px solid ${selectedOffer === offer.id ? '#C4714A' : '#E0CEBC'}`,
                        boxShadow: selectedOffer === offer.id ? '0 4px 12px rgba(196,113,74,0.12)' : 'none',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{
                            border: `1.5px solid ${selectedOffer === offer.id ? '#C4714A' : '#D4A28C'}`,
                            backgroundColor: selectedOffer === offer.id ? '#C4714A' : 'transparent',
                          }}
                        >
                          {selectedOffer === offer.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input
                          type="radio"
                          name="offer"
                          checked={selectedOffer === offer.id}
                          onChange={() => setSelectedOffer(offer.id)}
                          className="sr-only"
                        />
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#3D2314' }}>{offer.name}</p>
                          <p className="text-xs" style={{ color: '#9E8060' }}>{offer.quantity} قطع</p>
                        </div>
                      </div>
                      <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.2rem', color: '#C4714A' }}>
                        {offer.price.toLocaleString('ar-DZ')} <span className="text-xs">دج</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {product.attributes?.map((attr: any) => (
              <div key={attr.id}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#B89A7A', letterSpacing: '0.12em' }}>
                  {attr.name}
                </p>
                {attr.displayMode === 'color' ? (
                  <div className="flex gap-2.5 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          title={v.name}
                          className="w-9 h-9 rounded-full transition-all duration-200"
                          style={{
                            backgroundColor: v.value,
                            border: `2px solid ${isSel ? '#C4714A' : 'transparent'}`,
                            boxShadow: isSel ? '0 0 0 3px rgba(196,113,74,0.2)' : '0 0 0 1px rgba(0,0,0,0.1)',
                            transform: isSel ? 'scale(1.15)' : 'scale(1)',
                          }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          className="px-5 py-2 text-sm font-medium transition-all duration-200"
                          style={{
                            backgroundColor: isSel ? '#C4714A' : '#FDF8F2',
                            color: isSel ? '#FDF8F2' : '#8E7860',
                            borderRadius: '30px',
                            border: `1px solid ${isSel ? '#C4714A' : '#E0CEBC'}`,
                            boxShadow: isSel ? '0 4px 12px rgba(196,113,74,0.25)' : 'none',
                          }}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Order Form */}
            <div style={{ borderTop: '1px solid #E8D9C5', paddingTop: '1.75rem' }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: '#B89A7A', letterSpacing: '0.15em' }}>
                ✦ تأكيد الطلب
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#B89A7A', letterSpacing: '0.1em' }}>الاسم الكامل</label>
                    <div className="relative">
                      <User className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="أدخل اسمك"
                        className="w-full px-4 py-3 pr-10 text-sm outline-none border rounded-xl placeholder-[#C8B09A] border-[#E0CEBC] bg-[#FDF8F2] focus:border-[#C4714A]"
                        style={{ color: '#3D2314' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#B89A7A', letterSpacing: '0.1em' }}>رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="0X XX XX XX XX"
                        className="w-full px-4 py-3 pr-10 text-sm outline-none border rounded-xl placeholder-[#C8B09A] border-[#E0CEBC] bg-[#FDF8F2] focus:border-[#C4714A]"
                        style={{ color: '#3D2314' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#B89A7A', letterSpacing: '0.1em' }}>الولاية</label>
                    <div className="relative">
                      <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
                      <select
                        value={formData.customerWelaya}
                        onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })}
                        className="w-full px-4 py-3 pr-10 text-sm outline-none border rounded-xl border-[#E0CEBC] bg-[#FDF8F2] focus:border-[#C4714A] appearance-none cursor-pointer"
                        style={{ color: '#3D2314' }}
                      >
                        <option value="">اختر الولاية</option>
                        {MOCK_WILAYAS.map(w => (
                          <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: '#C8B09A' }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#B89A7A', letterSpacing: '0.1em' }}>البلدية</label>
                    <div className="relative">
                      <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
                      <select
                        value={formData.customerCommune}
                        disabled={!formData.customerWelaya}
                        onChange={e => setFormData({ ...formData, customerCommune: e.target.value })}
                        className="w-full px-4 py-3 pr-10 text-sm outline-none border rounded-xl border-[#E0CEBC] bg-[#FDF8F2] focus:border-[#C4714A] appearance-none cursor-pointer disabled:opacity-40"
                        style={{ color: '#3D2314' }}
                      >
                        <option value="">{formData.customerWelaya ? 'اختر البلدية' : 'اختر الولاية أولاً'}</option>
                        {communes.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.ar_name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: '#C8B09A' }} />
                    </div>
                  </div>
                </div>

                {/* Delivery type */}
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: '#B89A7A', letterSpacing: '0.1em' }}>نوع التوصيل</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['home', 'office'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))}
                        className="flex flex-col items-center gap-2 py-5 transition-all duration-300"
                        style={{
                          backgroundColor: formData.typeLivraison === type ? '#FDF8F2' : '#F7F0E6',
                          borderRadius: '16px',
                          border: `1.5px solid ${formData.typeLivraison === type ? '#C4714A' : '#E0CEBC'}`,
                          boxShadow: formData.typeLivraison === type ? '0 4px 16px rgba(196,113,74,0.15)' : 'none',
                        }}
                      >
                        {type === 'home' ? (
                          <HomeIcon className="w-5 h-5" style={{ color: formData.typeLivraison === type ? '#C4714A' : '#C8B09A' }} />
                        ) : (
                          <Building2 className="w-5 h-5" style={{ color: formData.typeLivraison === type ? '#C4714A' : '#C8B09A' }} />
                        )}
                        <p className="text-xs font-medium" style={{ color: formData.typeLivraison === type ? '#3D2314' : '#9E8060' }}>
                          {type === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}
                        </p>
                        {selectedWilayaData && (
                          <p className="text-xs font-semibold" style={{ color: formData.typeLivraison === type ? '#C4714A' : '#B89A7A' }}>
                            {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} دج
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#B89A7A', letterSpacing: '0.1em' }}>الكمية</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-light transition-all hover:scale-110"
                      style={{ border: '1px solid #E0CEBC', backgroundColor: '#FDF8F2', color: '#8E7860' }}
                    >
                      −
                    </button>
                    <span
                      className="w-14 text-center text-2xl"
                      style={{ fontFamily: "'Fraunces', serif", color: '#3D2314', fontWeight: 400 }}
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-light transition-all hover:scale-110"
                      style={{ border: '1px solid #E0CEBC', backgroundColor: '#FDF8F2', color: '#8E7860' }}
                    >
                      +
                    </button>
                    <span className="text-sm" style={{ color: '#C8B09A' }}>قطعة</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-5 space-y-3" style={{ backgroundColor: '#F0E6D8', borderRadius: '16px' }}>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: '#9E8060' }}>سعر القطعة</span>
                    <span style={{ color: '#3D2314' }}>{finalPrice.toLocaleString('ar-DZ')} دج</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: '#9E8060' }}>الكمية</span>
                    <span style={{ color: '#3D2314' }}>× {quantity}</span>
                  </div>
                  {selectedWilayaData && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: '#9E8060' }}>التوصيل</span>
                      <span style={{ color: '#3D2314' }}>
                        {formData.typeLivraison === 'home' ? 'المنزل' : 'المكتب'} ({(formData.typeLivraison === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} دج)
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-3" style={{ borderTop: '1px dashed #D4A28C' }}>
                    <span className="text-sm font-semibold" style={{ color: '#3D2314' }}>الإجمالي</span>
                    <span
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: '1.8rem',
                        color: '#C4714A',
                        fontWeight: 400,
                      }}
                    >
                      {getTotalPrice().toLocaleString('ar-DZ')}
                      <span className="text-sm mr-1" style={{ color: '#B89A7A' }}>دج</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-4 flex items-center justify-center gap-3 text-sm font-semibold tracking-wide transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: '#C4714A',
                    color: '#FDF8F2',
                    borderRadius: '30px',
                    letterSpacing: '0.06em',
                    boxShadow: '0 6px 20px rgba(196,113,74,0.3)',
                  }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  تأكيد الطلب ✦
                </button>

                <p className="text-xs text-center flex items-center justify-center gap-1.5" style={{ color: '#C8B09A' }}>
                  <Shield className="w-3.5 h-3.5" style={{ color: '#7A9068' }} />
                  بياناتك آمنة ومحمية بالكامل
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaticPages() {
  const InfoCard = ({ icon, title, desc, status }: { icon: React.ReactNode; title: string; desc: string; status?: string }) => {
    const isActive = status === 'دائماً نشطة';
    return (
      <div
        className="flex gap-5 p-6 mb-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        style={{
          backgroundColor: '#FDF8F2',
          borderRadius: '20px',
          border: '1px solid #EDE0CE',
        }}
      >
        <div
          className="w-1 self-stretch flex-shrink-0 rounded-full"
          style={{ backgroundColor: isActive ? '#7A9068' : '#D4A28C' }}
        />
        <div
          className="w-11 h-11 flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: '#F0E4D4', borderRadius: '50%', color: '#C4714A' }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h3
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '1.05rem',
                color: '#3D2314',
              }}
            >
              {title}
            </h3>
            {status && (
              <span
                className="text-[10px] font-semibold tracking-widest px-3 py-1"
                style={{
                  backgroundColor: isActive ? 'rgba(122,144,104,0.12)' : 'rgba(196,113,74,0.1)',
                  color: isActive ? '#7A9068' : '#C4714A',
                  borderRadius: '20px',
                  letterSpacing: '0.1em',
                }}
              >
                {status}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#9E8060' }}>{desc}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="py-20" style={{ backgroundColor: '#F7F0E6' }} dir="rtl">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: '#C4714A', letterSpacing: '0.22em' }}>
            ✦ &nbsp; معلومات قانونية &nbsp; ✦
          </p>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: '#3D2314',
            }}
          >
            سياسة الخصوصية
          </h2>
        </div>

        <InfoCard icon={<Database size={18} />} title="البيانات التي نجمعها" desc="نجمع فقط البيانات الضرورية لتشغيل متجرك، مثل الاسم والبريد الإلكتروني ومعلومات الدفع لضمان تجربة بيع سلسة." />
        <InfoCard icon={<Eye size={18} />} title="كيفية استخدام البيانات" desc="تُستخدم بياناتك لتحسين خدماتنا ومعالجة الطلبات وتوفير تقارير ذكية تساعدك في اتخاذ قرارات تجارية أفضل." />
        <InfoCard icon={<Lock size={18} />} title="حماية المعلومات" desc="نستخدم تقنيات تشفير متطورة ومعايير أمان عالمية لحماية بياناتك من أي وصول غير مصرح به." />
        <InfoCard icon={<Globe size={18} />} title="مشاركة البيانات" desc="نحن لا نبيع بياناتك أبداً. نشاركها فقط مع مزودي الخدمات الموثوقين لإتمام عملياتك التجارية." />

        <div className="mt-8 p-5 flex items-center justify-between" style={{ backgroundColor: '#FDF8F2', borderRadius: '16px', border: '1px solid #EDE0CE' }}>
          <div className="flex items-center gap-3">
            <Bell size={15} style={{ color: '#C4714A' }} />
            <p className="text-xs leading-relaxed" style={{ color: '#9E8060' }}>
              نقوم بتحديث هذه السياسة دورياً لضمان مواكبة أحدث معايير الأمان.
            </p>
          </div>
          <span className="text-xs flex-shrink-0 mr-4 font-medium" style={{ color: '#C4714A' }}>
            06/02/2026
          </span>
        </div>
      </div>
    </div>
  );
}

function ContactSection({ store }: { store: any }) {
  const isRTL = store.language === 'ar';

  return (
    <section id="contact" className="py-24" style={{ backgroundColor: '#F7F0E6' }} dir="rtl">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-16" style={{ backgroundColor: '#E0CEBC' }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
              <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
              <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
            </svg>
            <div className="h-px w-16" style={{ backgroundColor: '#E0CEBC' }} />
          </div>

          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              color: '#3D2314',
              letterSpacing: '-0.02em',
            }}
          >
            تواصل معنا
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#9E8060' }}>
            يسعدنا سماع أفكارك واستفساراتك
          </p>
        </div>

        <div className="space-y-4 mb-14">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              ),
              label: 'البريد الإلكتروني',
              value: store.contact.email,
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.81 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.02-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              ),
              label: 'الهاتف',
              value: store.contact.phone,
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A9068" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              label: 'الموقع',
              value: store.contact.wilaya,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-5 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                backgroundColor: '#FDF8F2',
                borderRadius: '16px',
                border: '1px solid #EDE0CE',
              }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#F7F0E6', borderRadius: '50%' }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs tracking-widest uppercase mb-0.5 font-medium" style={{ color: '#B89A7A', letterSpacing: '0.12em' }}>
                  {item.label}
                </p>
                <p className="text-sm font-medium" style={{ color: '#3D2314' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px" style={{ backgroundColor: '#E8D9C5' }} />
          <p className="text-xs tracking-widest uppercase" style={{ color: '#C4714A', letterSpacing: '0.2em' }}>
            ✦ تابعنا على ✦
          </p>
          <div className="flex-1 h-px" style={{ backgroundColor: '#E8D9C5' }} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {['Facebook', 'WhatsApp', 'TikTok'].map(social => (
            <a
              key={social}
              href="#"
              className="flex flex-col items-center gap-3 py-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{
                backgroundColor: '#FDF8F2',
                borderRadius: '16px',
                border: '1px solid #EDE0CE',
                color: '#8E7860',
              }}
            >
              <span className="text-xs font-medium tracking-wider" style={{ letterSpacing: '0.08em' }}>{social}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ store }: { store: any }) {
  const isRTL = store.language === 'ar';

  return (
    <footer
      style={{ backgroundColor: '#3D2314', fontFamily: "'Karla', sans-serif", position: 'relative', overflow: 'hidden' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="wavy-divider w-full" style={{ marginTop: '-1px' }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
          <path d="M0,60 C240,20 480,60 720,30 C960,0 1200,50 1440,20 L1440,60 Z" fill="#F7F0E6" />
        </svg>
      </div>

      <div className="absolute top-8 left-6 pointer-events-none select-none hidden lg:block">
        <BotanicalLeft />
      </div>
      <div className="absolute top-8 right-6 pointer-events-none select-none hidden lg:block" style={{ transform: 'scaleX(-1)' }}>
        <BotanicalLeft />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 pb-12 pt-6 relative z-10">
        <div className="text-center mb-10">
          <p
            className="mb-3"
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontSize: '1.8rem',
              color: '#E8D9C5',
              letterSpacing: '-0.01em',
              fontWeight: 300,
            }}
          >
            {store.name}
          </p>
          <p className="text-xs tracking-widest" style={{ color: '#7A5840', letterSpacing: '0.18em' }}>
            ✦ &nbsp; MADE WITH LOVE &nbsp; ✦
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px" style={{ backgroundColor: '#5A3322' }} />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
            <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
          </svg>
          <div className="flex-1 h-px" style={{ backgroundColor: '#5A3322' }} />
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {[
            { href: '#', label: isRTL ? 'سياسة الخصوصية' : 'Privacy' },
            { href: '#', label: isRTL ? 'الشروط' : 'Terms' },
            { href: '#', label: isRTL ? 'ملفات الارتباط' : 'Cookies' },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs tracking-wider transition-colors duration-200 hover:text-[#D4A28C]"
              style={{ color: '#7A5840', letterSpacing: '0.1em' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-center text-xs" style={{ color: '#5A3322', letterSpacing: '0.08em' }}>
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

export default function BohoThemePreview() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('all');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const store = MOCK_STORE;
  const featuredProduct = store.products[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F0E6' }}>
      <GlobalStyles />

      {/* Top Bar */}
      {store.topBar?.enabled && (
        <div
          className="py-2.5 px-4 text-center text-xs font-medium tracking-widest"
          style={{
            backgroundColor: store.topBar.color,
            color: '#F7F0E6',
            fontFamily: "'Karla', sans-serif",
            letterSpacing: '0.12em',
          }}
        >
          ✦ {store.topBar.text} ✦
        </div>
      )}

      <Navbar store={store} scrolled={scrolled} />

      {/* Section Navigation */}
      <div
        className="sticky top-16 z-40 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(247,240,230,0.98)' : '#F7F0E6',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          borderBottom: '1px solid #E8D9C5',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'home', label: 'الرئيسية' },
            { id: 'products', label: 'المنتجات' },
            { id: 'details', label: 'تفاصيل المنتج' },
            { id: 'static', label: 'الصفحات الثابتة' },
            { id: 'contact', label: 'اتصل بنا' },
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap"
              style={{
                backgroundColor: activeSection === sec.id ? '#C4714A' : '#FDF8F2',
                color: activeSection === sec.id ? '#FDF8F2' : '#8E7860',
                border: '1px solid',
                borderColor: activeSection === sec.id ? '#C4714A' : '#E0CEBC',
                letterSpacing: '0.05em',
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      <main>
        {(activeSection === 'all' || activeSection === 'home') && (
          <>
            <Hero store={store} />
            <Categories store={store} />
          </>
        )}

        {(activeSection === 'all' || activeSection === 'products') && (
          <ProductGrid store={store} />
        )}

        {(activeSection === 'all' || activeSection === 'details') && (
          <>
            <div className="wavy-divider w-full" style={{ lineHeight: 0 }}>
              <svg viewBox="0 0 1440 50" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '50px' }}>
                <path d="M0,50 C360,0 1080,50 1440,10 L1440,50 Z" fill="#F0E6D8" />
              </svg>
            </div>
            <ProductDetails product={featuredProduct} store={store} />
          </>
        )}

        {(activeSection === 'all' || activeSection === 'static') && <StaticPages />}

        {(activeSection === 'all' || activeSection === 'contact') && <ContactSection store={store} />}
      </main>

      <Footer store={store} />

      {/* Floating Badge */}
      <div
        className="fixed bottom-6 left-6 px-4 py-2 rounded-full text-xs font-bold shadow-lg z-50"
        style={{ backgroundColor: '#3D2314', color: '#F7F0E6', letterSpacing: '0.05em' }}
      >
        🌿 Boho Theme Preview
      </div>
    </div>
  );
}