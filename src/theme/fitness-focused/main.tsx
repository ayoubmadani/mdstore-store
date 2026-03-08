'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Flame, Zap, Trophy, Target, Dumbbell, Heart,
  ChevronDown, ChevronLeft, ChevronRight,
  MapPin, Phone, User, Truck, Shield, Package,
  Building2, AlertCircle, Check, X,
  Infinity, Link2, Share2, ShieldCheck,
  Eye, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Star, Play, ArrowRight, Mail, Instagram,
  Activity, Timer, Award,
} from 'lucide-react';
import { Store } from '@/types/store';

// ─────────────────────────────────────────────────────────────
// CONSTANTS & DESIGN TOKENS
// ─────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Barlow+Condensed:wght@400;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --fire: #FF4500;
    --fire-bright: #FF6B2B;
    --fire-glow: rgba(255,69,0,0.25);
    --gold: #FFB800;
    --gold-light: #FFD54F;
    --dark: #0A0A0A;
    --dark-2: #111111;
    --dark-3: #1A1A1A;
    --dark-4: #222222;
    --border: #2A2A2A;
    --text-dim: #666666;
    --text-mid: #999999;
    --text-bright: #EEEEEE;
    --white: #FFFFFF;
    --green: #39D353;
    --red: #FF3030;
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: var(--dark); }
  ::-webkit-scrollbar-thumb { background: var(--fire); }

  @keyframes burn   { 0%,100%{opacity:0.7;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.05)} }
  @keyframes pulse-fire { 0%,100%{box-shadow:0 0 15px rgba(255,69,0,0.3)} 50%{box-shadow:0 0 40px rgba(255,69,0,0.7),0 0 80px rgba(255,69,0,0.2)} }
  @keyframes slide-in  { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes count-up  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes marquee   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes shake     { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
  @keyframes glow-line { 0%,100%{opacity:0.4;width:30%} 50%{opacity:1;width:80%} }
  @keyframes swipe-up  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }

  .fire-text {
    background: linear-gradient(135deg, #FF4500 0%, #FF8C00 40%, #FFB800 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .slash-divider { position: relative; }
  .slash-divider::after { content:''; position:absolute; bottom:0; left:0; right:0; height:4px; background:linear-gradient(90deg, var(--fire), var(--gold), transparent); }
  .diagonal-bg { clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); }
  .card-hover { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
  .card-hover:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 20px 60px rgba(255,69,0,0.2); }
  .btn-fire { transition: all 0.25s ease; position: relative; overflow: hidden; }
  .btn-fire::after { content:''; position:absolute; top:-50%; left:-60%; width:30%; height:200%; background:rgba(255,255,255,0.15); transform:skewX(-20deg); transition:left 0.4s ease; }
  .btn-fire:hover::after { left:130%; }
  .marquee-wrap { overflow: hidden; white-space: nowrap; }
  .marquee-inner { display: inline-block; animation: marquee 20s linear infinite; }
  .diagonal-stripe {
    background-image: repeating-linear-gradient(
      -45deg,
      transparent, transparent 8px,
      rgba(255,69,0,0.04) 8px, rgba(255,69,0,0.04) 16px
    );
  }
  .noise-overlay::after {
    content:''; position:absolute; inset:0; pointer-events:none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.06;
  }
`;

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface Offer               { id: string; name: string; quantity: number; price: number; }
interface Variant             { id: string; name: string; value: string; }
interface Attribute           { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage        { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail       { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya              { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune             { id: string; name: string; ar_name: string; wilayaId: string; }

export interface Product {
  id: string; name: string; price: string | number;
  priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[];
  offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; };
}

export interface ProductFormProps {
  product:          Product;
  userId:           string;
  domain:           string;
  redirectPath?:    string;
  selectedOffer:    string | null;
  setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>;
  platform?:        string;
  priceLoss?:       number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some(e => e.attrName === attrName && e.value === val)
  );
}
const fetchWilayas  = async (userId: string): Promise<Wilaya[]>   => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wilayaId: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`); return data || []; } catch { return []; } };

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────

export default function Main({ store, children }: any) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--dark)', fontFamily: "'Barlow', sans-serif" }}>
      <style>{FONT_CSS}</style>

      {/* Top announcement bar */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="marquee-wrap py-2.5 text-center text-xs tracking-widest uppercase font-bold"
          style={{ backgroundColor: 'var(--fire)', color: 'white' }}>
          <div className="marquee-inner">
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="mx-8">
                <Flame className="inline w-3 h-3 mr-2" />
                {store.topBar.text}
              </span>
            ))}
            {Array(6).fill(null).map((_, i) => (
              <span key={`b${i}`} className="mx-8">
                <Flame className="inline w-3 h-3 mr-2" />
                {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <Navbar store={store} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────

export function Navbar({ store }: { store: Store }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const isRTL = store.language === 'ar';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { href: `/${store.subdomain}`,         label: isRTL ? 'الرئيسية' : 'HOME'    },
    { href: `/${store.subdomain}/contact`, label: isRTL ? 'اتصل بنا' : 'CONTACT' },
    { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'الخصوصية' : 'PRIVACY' },
  ];

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(10,10,10,0.97)' : 'var(--dark-2)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Fire accent line */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, var(--fire), var(--gold), var(--fire))' }} />

      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={`/${store.subdomain}`} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center"
              style={{ background: 'var(--fire)', clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}>
              {store.design.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} className="h-6 w-auto object-contain" />
                : <Dumbbell className="w-5 h-5 text-white" />
              }
            </div>
            <div>
              <span className="block font-black tracking-wider group-hover:text-orange-500 transition-colors text-white"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.08em' }}>
                {store.name}
              </span>
              <div className="flex items-center gap-1.5 -mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] tracking-widest font-bold" style={{ color: 'var(--green)' }}>STORE OPEN</span>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className="relative text-xs font-bold tracking-widest uppercase transition-colors group"
                style={{ color: 'var(--text-mid)' }}>
                <span className="group-hover:text-white transition-colors">{item.label}</span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                  style={{ background: 'var(--fire)' }} />
              </Link>
            ))}
            <Link href={`/${store.subdomain}`}
              className="btn-fire px-5 py-2.5 text-xs font-black tracking-widest uppercase text-white"
              style={{ background: 'var(--fire)', clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)' }}>
              {isRTL ? 'تسوق الآن' : 'SHOP NOW'}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsMenuOpen(p => !p)} className="md:hidden p-2 text-white">
            {isMenuOpen ? <X className="w-6 h-6" /> : <div className="space-y-1.5"><span className="block w-6 h-0.5 bg-orange-500" /><span className="block w-4 h-0.5 bg-orange-500" /><span className="block w-6 h-0.5 bg-orange-500" /></div>}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-56 pb-5' : 'max-h-0'}`}>
          <div className="pt-4 space-y-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white hover:text-orange-400 transition-colors">
                <ArrowRight className="w-3 h-3 text-orange-500" />{item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────

export function Footer({ store }: any) {
  const isRTL = store.language === 'ar';
  return (
    <footer style={{ backgroundColor: '#080808', borderTop: '2px solid var(--fire)', fontFamily: "'Barlow', sans-serif" }}>
      <div className="diagonal-stripe max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12" style={{ borderBottom: '1px solid var(--border)' }}>

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'var(--fire)', clipPath: 'polygon(10% 0,100% 0,90% 100%,0 100%)' }}>
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-2xl text-white tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{store.name}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {isRTL ? 'قوة. أداء. نتائج. نحن هنا لنساعدك على تحقيق أهدافك الرياضية.' : 'Power. Performance. Results. We\'re here to fuel your fitness journey.'}
            </p>
            <div className="flex items-center gap-2 mt-5">
              {[Flame, Zap, Trophy].map((Icon, i) => (
                <div key={i} className="w-9 h-9 flex items-center justify-center transition-all hover:scale-110" style={{ border: '1px solid var(--border)', borderRadius: 0 }}>
                  <Icon className="w-4 h-4" style={{ color: 'var(--fire)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-black text-white tracking-widest uppercase mb-5 text-sm" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {isRTL ? 'روابط سريعة' : 'QUICK ACCESS'}
            </h4>
            <div className="space-y-3">
              {[
                { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy' },
                { href: `/${store.subdomain}/Terms`,   label: isRTL ? 'شروط الخدمة'     : 'Terms of Service' },
                { href: `/${store.subdomain}/Cookies`, label: isRTL ? 'ملفات تعريف الارتباط' : 'Cookie Policy' },
                { href: `/${store.subdomain}/contact`, label: isRTL ? 'اتصل بنا'        : 'Contact Us' },
              ].map(link => (
                <a key={link.href} href={link.href} className="flex items-center gap-2 text-sm hover:text-orange-400 transition-colors" style={{ color: 'var(--text-dim)' }}>
                  <span style={{ color: 'var(--fire)' }}>›</span>{link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Motto */}
          <div className="flex flex-col justify-between">
            <div className="p-5 relative overflow-hidden" style={{ background: 'rgba(255,69,0,0.06)', border: '1px solid rgba(255,69,0,0.2)' }}>
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'var(--fire)' }} />
              <p className="font-black text-2xl text-white leading-tight pl-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
                {isRTL ? 'لا ألم، لا مكسب' : 'NO PAIN,\nNO GAIN'}
              </p>
              <p className="text-xs mt-2 pl-3" style={{ color: 'var(--fire)' }}>— {isRTL ? 'الفلسفة الأساسية' : 'The core philosophy'}</p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs tracking-wider" style={{ color: 'var(--text-dim)' }}>
            © {new Date().getFullYear()} {store.name.toUpperCase()} — ALL RIGHTS RESERVED
          </p>
          <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--fire)' }}>
            <Flame className="w-4 h-4" />
            <span>FITNESS FOCUSED THEME</span>
            <Flame className="w-4 h-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────

export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  return (
    <div className="card-hover group relative flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--dark-2)', border: '1px solid var(--border)' }}>

      {/* Image */}
      <div className="relative h-60 overflow-hidden" style={{ backgroundColor: 'var(--dark-3)' }}>
        {displayImage ? (
          <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-100" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Dumbbell className="w-12 h-12" style={{ color: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>No Image</span>
          </div>
        )}

        {/* Fire overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(255,69,0,0.3) 0%, transparent 60%)' }} />

        {discount > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 text-xs font-black text-white"
            style={{ background: 'var(--fire)', clipPath: 'polygon(0 0, 95% 0, 100% 100%, 5% 100%)' }}>
            -{discount}%
          </div>
        )}

        {/* Quick action */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Link href={`/${store.subdomain}/product/${product.slug || product.id}`}
            className="btn-fire px-6 py-2.5 text-xs font-black tracking-widest uppercase text-white flex items-center gap-2"
            style={{ background: 'var(--fire)' }}>
            <Zap className="w-3.5 h-3.5" /> {viewDetails}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold mb-1 line-clamp-1 group-hover:text-orange-400 transition-colors text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', letterSpacing: '0.03em' }}>
          {product.name}
        </h3>
        {product.desc && (
          <div className="text-xs mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-dim)' }}
            dangerouslySetInnerHTML={{ __html: product.desc }} />
        )}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-black" style={{ color: 'var(--fire)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem' }}>
                {product.price}
              </span>
              <span className="text-xs font-bold" style={{ color: 'var(--text-dim)' }}>{store.currency}</span>
            </div>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="text-xs line-through" style={{ color: 'var(--text-dim)' }}>{product.priceOriginal}</span>
            )}
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : ''}`} style={{ color: 'var(--gold)' }} />)}
          </div>
        </div>
      </div>

      {/* Bottom fire line */}
      <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500" style={{ background: 'linear-gradient(90deg, var(--fire), var(--gold))' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────

export function Home({ store }: any) {
  const isRTL = store.language === 'ar';
  const dir   = isRTL ? 'rtl' : 'ltr';
  const heroRef = useRef<HTMLDivElement>(null);

  const t = {
    categories:       isRTL ? 'التصنيفات'             : 'CATEGORIES',
    products:         isRTL ? 'المنتجات'              : 'ALL PRODUCTS',
    noProducts:       isRTL ? 'لا توجد منتجات'        : 'NO PRODUCTS YET',
    noProductsDesc:   isRTL ? 'لم تضف منتجات بعد'     : 'Add your first product to get started',
    viewDetails:      isRTL ? 'اشتر الآن'             : 'GET IT NOW',
    all:              isRTL ? 'الكل'                   : 'ALL',
    heroBtn:          isRTL ? 'تسوق الآن'              : 'SHOP NOW',
    heroBtnSub:       isRTL ? 'استكشف الكتالوج'        : 'EXPLORE CATALOG',
    tagline:          isRTL ? 'حقق حدودك'              : 'EXCEED YOUR LIMITS',
    subTagline:       isRTL ? 'معدات رياضية ومكملات غذائية عالية الجودة' : 'Premium sports equipment, supplements & gear for champions',
  };

  const stats = [
    { icon: <Trophy className="w-6 h-6" />,   val: '5K+',  label: isRTL ? 'عميل راضٍ'   : 'HAPPY ATHLETES' },
    { icon: <Package className="w-6 h-6" />,  val: store.products?.length || '100+', label: isRTL ? 'منتج' : 'PRODUCTS' },
    { icon: <Truck className="w-6 h-6" />,    val: '24H',  label: isRTL ? 'توصيل سريع'  : 'FAST DELIVERY' },
    { icon: <Shield className="w-6 h-6" />,   val: '100%', label: isRTL ? 'ضمان الجودة'  : 'QUALITY GUARANTEED' },
  ];

  return (
    <div className="min-h-screen" dir={dir} style={{ backgroundColor: 'var(--dark)', fontFamily: "'Barlow', sans-serif" }}>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative overflow-hidden noise-overlay" style={{ minHeight: '95vh', backgroundColor: '#080808' }}>
        {/* BG image */}
        {store.hero?.imageUrl && (
          <div className="absolute inset-0">
            <img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity: 0.2, filter: 'grayscale(30%) contrast(1.2)' }} />
          </div>
        )}

        {/* Diagonal stripe pattern */}
        <div className="absolute inset-0 diagonal-stripe opacity-50" />

        {/* Big diagonal accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block"
          style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,69,0,0.06) 100%)' }} />

        {/* Fire line left */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(180deg, transparent, var(--fire), transparent)' }} />

        {/* Geometric accents */}
        <div className="absolute top-20 right-20 w-32 h-32 hidden lg:block opacity-10"
          style={{ border: '2px solid var(--fire)', transform: 'rotate(45deg)' }} />
        <div className="absolute bottom-32 left-40 w-20 h-20 hidden lg:block opacity-10"
          style={{ border: '2px solid var(--gold)', transform: 'rotate(22deg)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-center" style={{ minHeight: '95vh', paddingTop: '8rem', paddingBottom: '4rem' }}>

          {/* Label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-0.5" style={{ background: 'var(--fire)' }} />
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: 'var(--fire)' }}>
              {isRTL ? '💪 متجر الرياضة' : '🔥 THE FITNESS STORE'}
            </span>
          </div>

          {/* Main headline */}
          <h1 className="leading-none font-black text-white mb-4 max-w-3xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3.5rem, 10vw, 9rem)', letterSpacing: '0.02em' }}>
            {store.hero?.title || t.tagline}
          </h1>

          {/* Fire underline */}
          <div className="w-32 h-1 mb-6" style={{ background: 'linear-gradient(90deg, var(--fire), var(--gold))' }} />

          <p className="text-base md:text-lg mb-10 max-w-xl leading-relaxed" style={{ color: 'var(--text-mid)', fontWeight: 500 }}>
            {store.hero?.subtitle || t.subTagline}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <a href="#products"
              className="btn-fire flex items-center gap-3 px-8 py-4 text-sm font-black tracking-widest uppercase text-white"
              style={{ background: 'var(--fire)', clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)', animation: 'pulse-fire 3s ease-in-out infinite' }}>
              <Flame className="w-4 h-4" /> {t.heroBtn}
            </a>
            <a href="#categories"
              className="flex items-center gap-3 px-8 py-4 text-sm font-black tracking-widest uppercase text-white transition-all hover:bg-white hover:text-black"
              style={{ border: '2px solid var(--text-dim)' }}>
              {t.heroBtnSub} <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, label: isRTL ? 'دفع آمن ومضمون' : 'Secure Payments' },
              { icon: <Truck className="w-4 h-4" />,       label: isRTL ? 'توصيل سريع'      : 'Fast Delivery' },
              { icon: <Award className="w-4 h-4" />,       label: isRTL ? 'منتجات أصلية'    : 'Authentic Products' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: 'var(--gold)' }}>{b.icon}</span>
                <span className="text-xs font-bold tracking-wider" style={{ color: 'var(--text-mid)' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Diagonal clip bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to bottom right, transparent 49%, var(--dark) 50%)' }} />
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ backgroundColor: 'var(--fire)', position: 'relative', zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4 py-5 px-6 group cursor-default transition-all hover:bg-black/10"
                style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
                <div className="text-white opacity-80 group-hover:opacity-100 transition-opacity">{stat.icon}</div>
                <div>
                  <p className="font-black text-white text-2xl leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>{stat.val}</p>
                  <p className="text-[10px] font-bold tracking-widest text-white opacity-70 uppercase">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: 'var(--fire)' }}>— {isRTL ? 'تسوق حسب' : 'BROWSE BY'}</p>
              <h2 className="font-black text-white leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.04em' }}>
                {t.categories}
              </h2>
            </div>
          </div>

          {store.categories && store.categories.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              <Link href={`/${store.domain}`}
                className="btn-fire px-6 py-3 text-xs font-black tracking-widest uppercase text-white transition-all"
                style={{ background: 'var(--fire)', clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)' }}>
                <Flame className="inline w-3 h-3 mr-1" /> {t.all}
              </Link>
              {store.categories.map((cat: any) => (
                <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                  className="px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all hover:text-white group"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-mid)', clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--fire)'; el.style.backgroundColor = 'rgba(255,69,0,0.08)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.backgroundColor = 'transparent'; }}>
                  {cat.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center" style={{ border: '1px dashed var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{isRTL ? 'لا توجد تصنيفات بعد' : 'No categories added yet'}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: 'var(--fire)' }}>— {isRTL ? 'الأفضل لديكم' : 'OUR COLLECTION'}</p>
              <h2 className="font-black text-white leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.04em' }}>
                {t.products}
              </h2>
            </div>
            <span className="text-sm font-bold hidden md:block" style={{ color: 'var(--text-dim)' }}>
              {store.products?.length || 0} {isRTL ? 'منتج' : 'items'}
            </span>
          </div>

          {store.products && store.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {store.products.map((product: any) => {
                const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
                const discount = product.priceOriginal ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails} />;
              })}
            </div>
          ) : (
            <div className="py-32 text-center" style={{ border: '1px dashed var(--border)' }}>
              <Dumbbell className="w-14 h-14 mx-auto mb-4 opacity-20 text-white" />
              <p className="font-black text-xl text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{t.noProducts}</p>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{t.noProductsDesc}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── MOTIVATIONAL BANNER ── */}
      <section className="py-20 relative overflow-hidden diagonal-stripe" style={{ backgroundColor: 'var(--dark-2)' }}>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, var(--fire), var(--gold), var(--fire))' }} />
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1 }}>
            {isRTL ? 'لا تتوقف' : "DON'T STOP"}
          </p>
          <p className="fire-text font-black" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1 }}>
            {isRTL ? 'حتى تصل' : 'WHEN IT BURNS'}
          </p>
          <p className="mt-6 text-sm font-medium" style={{ color: 'var(--text-mid)' }}>
            {isRTL ? 'ذلك يعني أن التمرين يعمل' : "That's when it starts working"}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, var(--fire), var(--gold), var(--fire))' }} />
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAILS PAGE
// ─────────────────────────────────────────────────────────────

export function Details({
  product, toggleWishlist, isWishlisted, handleShare, discount,
  allImages, allAttrs, finalPrice, inStock, autoGen,
  selectedVariants, setSelectedOffer, selectedOffer,
  resolvedParams, handleVariantSelection, domain, isRTL,
}: any) {
  const [selectedImage,  setSelectedImage]  = useState(0);
  const [submitSuccess,  setSubmitSuccess]  = useState(false);

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: 'var(--dark)', fontFamily: "'Barlow', sans-serif" }}>

      {submitSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4"
          style={{ backgroundColor: 'var(--dark-2)', border: '2px solid var(--green)', boxShadow: '0 0 30px rgba(57,211,83,0.2)' }}>
          <div className="w-6 h-6 flex items-center justify-center bg-green-500 rounded-full">
            <Check className="w-3.5 h-3.5 text-black" />
          </div>
          <p className="text-sm font-bold text-white tracking-widest">{isRTL ? 'تم تأكيد طلبك بنجاح!' : 'ORDER CONFIRMED!'}</p>
        </div>
      )}

      {/* Breadcrumb */}
      <header className="py-4 sticky top-0 z-40" style={{ backgroundColor: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
            <span className="hover:text-white cursor-pointer">{isRTL ? 'الرئيسية' : 'HOME'}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-white cursor-pointer">{isRTL ? 'المنتجات' : 'PRODUCTS'}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">{product.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className="w-8 h-8 flex items-center justify-center transition-colors" style={{ border: '1px solid var(--border)', color: isWishlisted ? '#FF3B30' : 'var(--text-dim)' }}>
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center" style={{ border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold tracking-widest"
              style={{ backgroundColor: inStock ? 'rgba(57,211,83,0.1)' : 'rgba(255,48,48,0.1)', border: `1px solid ${inStock ? 'var(--green)' : 'var(--red)'}`, color: inStock ? 'var(--green)' : 'var(--red)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
              {inStock ? (isRTL ? 'متوفر' : 'IN STOCK') : (isRTL ? 'غير متوفر' : 'OUT OF STOCK')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

          {/* ── Images ── */}
          <div className="space-y-3">
            <div className="relative overflow-hidden group" style={{ aspectRatio: '1', backgroundColor: 'var(--dark-3)' }}>
              {allImages.length > 0 ? (
                <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Dumbbell className="w-16 h-16" style={{ color: 'var(--border)' }} />
                </div>
              )}
              {/* Fire gradient overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(to top, rgba(255,69,0,0.15) 0%, transparent 60%)' }} />

              {discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1 text-sm font-black text-white"
                  style={{ background: 'var(--fire)', clipPath: 'polygon(0 0, 95% 0, 100% 100%, 5% 100%)' }}>
                  -{discount}%
                </div>
              )}
              <button onClick={toggleWishlist} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center transition-all"
                style={{ backgroundColor: isWishlisted ? 'var(--red)' : 'rgba(10,10,10,0.8)', border: '1px solid var(--border)', color: isWishlisted ? 'white' : 'var(--text-mid)' }}>
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage(p => p === 0 ? allImages.length - 1 : p - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid var(--border)', color: 'white' }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedImage(p => p === allImages.length - 1 ? 0 : p + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid var(--border)', color: 'white' }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {!inStock && !autoGen && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(4px)' }}>
                  <div className="px-6 py-3 text-sm font-black text-white tracking-widest" style={{ border: '2px solid var(--red)', color: 'var(--red)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem' }}>
                    {isRTL ? 'نفدت الكمية' : 'OUT OF STOCK'}
                  </div>
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className="shrink-0 w-16 h-16 overflow-hidden transition-all"
                    style={{ border: `2px solid ${selectedImage === idx ? 'var(--fire)' : 'var(--border)'}`, opacity: selectedImage === idx ? 1 : 0.5 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <ShieldCheck className="w-4 h-4" />, label: isRTL ? 'دفع آمن'      : 'SECURE PAY'  },
                { icon: <Truck className="w-4 h-4" />,       label: isRTL ? 'توصيل سريع'   : 'FAST SHIP'   },
                { icon: <Award className="w-4 h-4" />,       label: isRTL ? 'جودة مضمونة'  : 'AUTHENTIC'   },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 py-4" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--dark-2)' }}>
                  <span style={{ color: 'var(--gold)' }}>{b.icon}</span>
                  <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Info + Form ── */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-0.5" style={{ background: 'var(--fire)' }} />
                <span className="text-xs font-black tracking-widest uppercase" style={{ color: 'var(--fire)' }}>{isRTL ? 'المنتج' : 'PRODUCT'}</span>
              </div>
              <h1 className="font-black text-white leading-tight mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '0.04em' }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-current' : ''}`} style={{ color: 'var(--gold)' }} />)}
                </div>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>4.8 (128 {isRTL ? 'تقييم' : 'reviews'})</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-5 relative" style={{ border: '2px solid rgba(255,69,0,0.3)', backgroundColor: 'rgba(255,69,0,0.04)' }}>
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'var(--fire)' }} />
              <p className="text-[10px] font-black tracking-widest uppercase mb-2 pl-3" style={{ color: 'var(--text-dim)' }}>{isRTL ? 'السعر' : 'PRICE'}</p>
              <div className="flex items-baseline gap-3 pl-3">
                <span className="font-black" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.5rem', color: 'var(--fire)', lineHeight: 1 }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span className="font-bold text-sm" style={{ color: 'var(--text-mid)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <div>
                    <span className="text-sm line-through block" style={{ color: 'var(--text-dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()} دج</span>
                    <span className="text-xs font-black" style={{ color: 'var(--gold)' }}>SAVE {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString()} دج</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-3">
              {autoGen
                ? <div className="flex items-center gap-2 px-4 py-2 text-xs font-black tracking-widest" style={{ border: '1px solid rgba(255,184,0,0.4)', color: 'var(--gold)', backgroundColor: 'rgba(255,184,0,0.05)' }}><Infinity className="w-4 h-4" /> UNLIMITED STOCK</div>
                : inStock
                  ? <div className="flex items-center gap-2 px-4 py-2 text-xs font-black tracking-widest" style={{ border: '1px solid rgba(57,211,83,0.4)', color: 'var(--green)', backgroundColor: 'rgba(57,211,83,0.05)' }}><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> IN STOCK</div>
                  : <div className="flex items-center gap-2 px-4 py-2 text-xs font-black tracking-widest" style={{ border: '1px solid rgba(255,48,48,0.4)', color: 'var(--red)', backgroundColor: 'rgba(255,48,48,0.05)' }}><X className="w-4 h-4" /> SOLD OUT</div>
              }
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div>
                <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: 'var(--fire)' }}>
                  {isRTL ? '— اختر الباقة' : '— SELECT PACKAGE'}
                </p>
                <div className="space-y-2">
                  {product.offers.map((offer: any) => (
                    <label key={offer.id} className="flex items-center justify-between p-4 cursor-pointer transition-all"
                      style={{ border: `2px solid ${selectedOffer === offer.id ? 'var(--fire)' : 'var(--border)'}`, backgroundColor: selectedOffer === offer.id ? 'rgba(255,69,0,0.06)' : 'var(--dark-2)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center" style={{ border: `2px solid ${selectedOffer === offer.id ? 'var(--fire)' : 'var(--border)'}` }}>
                          {selectedOffer === offer.id && <div className="w-2 h-2" style={{ backgroundColor: 'var(--fire)' }} />}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                        <div>
                          <p className="text-sm font-bold text-white">{offer.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>QTY: {offer.quantity}</p>
                        </div>
                      </div>
                      <span className="font-black" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'var(--fire)' }}>
                        {offer.price.toLocaleString()} <span className="text-sm">دج</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id}>
                <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: 'var(--fire)' }}>— {attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} className="w-10 h-10 transition-transform hover:scale-110" style={{ backgroundColor: v.value, border: `3px solid ${isSel ? 'white' : 'transparent'}`, boxShadow: isSel ? '0 0 0 2px var(--fire)' : 'none' }} />;
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className="w-14 h-14 overflow-hidden transition-all" style={{ border: `2px solid ${isSel ? 'var(--fire)' : 'var(--border)'}` }}><img src={v.value} alt={v.name} className="w-full h-full object-cover" /></button>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className="px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-all" style={{ border: `2px solid ${isSel ? 'var(--fire)' : 'var(--border)'}`, backgroundColor: isSel ? 'rgba(255,69,0,0.1)' : 'var(--dark-2)', color: isSel ? 'var(--fire)' : 'var(--text-mid)' }}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
          </div>
        </div>

        {/* Description */}
        {product.desc && (
          <section className="mt-20 pt-12" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-6 h-0.5" style={{ background: 'var(--fire)' }} />
              <h2 className="font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '0.04em' }}>
                {isRTL ? 'تفاصيل المنتج' : 'PRODUCT DETAILS'}
              </h2>
            </div>
            <div className="p-6" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--dark-2)' }}>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCT FORM
// ─────────────────────────────────────────────────────────────

const inputStyle = (err?: boolean) => ({
  width: '100%', padding: '12px 16px', fontSize: '0.875rem',
  backgroundColor: 'var(--dark-3)', border: `1px solid ${err ? 'var(--red)' : 'var(--border)'}`,
  color: 'var(--text-bright)', outline: 'none', fontFamily: "'Barlow', sans-serif",
  transition: 'border-color 0.2s',
});

const FieldWrapper = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-[10px] font-black tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>{label}</label>}
    {children}
    {error && <p className="text-xs flex items-center gap-1" style={{ color: 'var(--red)' }}><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,         setWilayas]         = useState<Wilaya[]>([]);
  const [communes,        setCommunes]        = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('customerId');
      if (id) setFormData(p => ({ ...p, customerId: id }));
    }
  }, []);
  useEffect(() => {
    if (!formData.customerWelaya) { setCommunes([]); return; }
    setLoadingCommunes(true);
    fetchCommunes(formData.customerWelaya).then(data => { setCommunes(data); setLoadingCommunes(false); });
  }, [formData.customerWelaya]);

  const selectedWilayaData = useMemo(() => wilayas.find(w => String(w.id) === String(formData.customerWelaya)), [wilayas, formData.customerWelaya]);

  const getFinalPrice = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const offer = product.offers?.find(o => o.id === selectedOffer);
    if (offer) return offer.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find(v => variantMatches(v, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);

  const getPriceLivraison = useCallback((): number => {
    if (!selectedWilayaData) return 0;
    return formData.typeLivraison === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice;
  }, [selectedWilayaData, formData.typeLivraison]);

  useEffect(() => { if (selectedWilayaData) setFormData(f => ({ ...f, priceLoss: selectedWilayaData.livraisonReturn })); }, [selectedWilayaData]);

  const finalPrice    = getFinalPrice();
  const getTotalPrice = () => finalPrice * formData.quantity + +getPriceLivraison();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.customerName.trim())  e.customerName    = 'الاسم مطلوب';
    if (!formData.customerPhone.trim()) e.customerPhone   = 'رقم الهاتف مطلوب';
    if (!formData.customerWelaya)       e.customerWelaya  = 'الولاية مطلوبة';
    if (!formData.customerCommune)      e.customerCommune = 'البلدية مطلوبة';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({}); setSubmitting(true);
    try {
      const payload = { ...formData, customerWilayaId: +formData.customerWelaya,customerCommuneId: +formData.customerCommune, productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice, totalPrice: getTotalPrice(), priceShip : getPriceLivraison(), };
      await axios.post(`${API_URL}/orders`, payload);
      if (typeof window !== 'undefined' && formData.customerId) localStorage.setItem('customerId', formData.customerId);
      router.push(`/lp/${domain}/successfully`);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  return (
    <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1.5rem' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-0.5" style={{ background: 'var(--fire)' }} />
        <span className="text-xs font-black tracking-widest uppercase text-white">ORDER FORM</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerName} label="FULL NAME">
            <div className="relative">
              <User className="absolute right-3 top-3.5 w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
              <input type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} placeholder="اسمك الكامل" style={{ ...inputStyle(!!formErrors.customerName), paddingRight: '2.5rem' }} />
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerPhone} label="PHONE">
            <div className="relative">
              <Phone className="absolute right-3 top-3.5 w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
              <input type="tel" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} placeholder="0X XX XX XX XX" style={{ ...inputStyle(!!formErrors.customerPhone), paddingRight: '2.5rem' }} />
            </div>
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerWelaya} label="WILAYA">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
              <select value={formData.customerWelaya} onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inputStyle(!!formErrors.customerWelaya), paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' as any }}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerCommune} label="COMMUNE">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
              <select value={formData.customerCommune} disabled={!formData.customerWelaya || loadingCommunes} onChange={e => setFormData({ ...formData, customerCommune: e.target.value })} style={{ ...inputStyle(!!formErrors.customerCommune), paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' as any, opacity: !formData.customerWelaya ? 0.5 : 1 }}>
                <option value="">{loadingCommunes ? 'Loading...' : 'اختر البلدية'}</option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery type */}
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: 'var(--text-dim)' }}>DELIVERY MODE</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home', 'office'] as const).map(type => (
              <button key={type} type="button" onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))}
                className="flex flex-col items-center gap-2 py-5 transition-all"
                style={{ border: `2px solid ${formData.typeLivraison === type ? 'var(--fire)' : 'var(--border)'}`, backgroundColor: formData.typeLivraison === type ? 'rgba(255,69,0,0.08)' : 'var(--dark-2)' }}>
                {type === 'home'
                  ? <Heart className="w-5 h-5" style={{ color: formData.typeLivraison === type ? 'var(--fire)' : 'var(--text-dim)' }} />
                  : <Building2 className="w-5 h-5" style={{ color: formData.typeLivraison === type ? 'var(--fire)' : 'var(--text-dim)' }} />
                }
                <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: formData.typeLivraison === type ? 'var(--fire)' : 'var(--text-dim)' }}>
                  {type === 'home' ? 'HOME' : 'OFFICE'}
                </p>
                {selectedWilayaData && (
                  <p className="text-xs font-bold" style={{ color: 'var(--text-mid)' }}>
                    {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString()} دج
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <FieldWrapper label="QUANTITY">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
              className="w-10 h-10 flex items-center justify-center text-xl font-black text-white transition-all hover:bg-orange-500"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--dark-3)' }}>−</button>
            <span className="w-14 text-center font-black text-white text-2xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{formData.quantity}</span>
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
              className="w-10 h-10 flex items-center justify-center text-xl font-black text-white transition-all hover:bg-orange-500"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--dark-3)' }}>+</button>
          </div>
        </FieldWrapper>

        {/* Summary */}
        <div className="p-5 relative" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--dark-2)' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, var(--fire), var(--gold), transparent)' }} />
          <p className="text-[10px] font-black tracking-widest uppercase mb-4 text-white">ORDER SUMMARY</p>
          <div className="space-y-2.5">
            {[
              { label: 'PRODUCT',   value: product.name },
              { label: 'UNIT',      value: `${finalPrice.toLocaleString()} دج` },
              { label: 'QTY',       value: `× ${formData.quantity}` },
              { label: 'SHIPPING',  value: selectedWilayaData ? `${getPriceLivraison().toLocaleString()} دج` : 'TBD' },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--text-dim)' }}>{row.label}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-mid)' }}>{row.value}</span>
              </div>
            ))}
            <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-black tracking-widest" style={{ color: 'var(--fire)' }}>TOTAL</span>
                <span className="font-black" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: 'var(--fire)' }}>
                  {getTotalPrice().toLocaleString()}<span className="text-sm ml-1">دج</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting}
          className="btn-fire w-full py-5 flex items-center justify-center gap-3 text-sm font-black tracking-widest uppercase text-white transition-all"
          style={{ background: submitting ? '#555' : 'var(--fire)', clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0 100%)', animation: !submitting ? 'pulse-fire 3s ease-in-out infinite' : 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> PROCESSING...</>
            : <><Flame className="w-4 h-4" /> CONFIRM MY ORDER</>
          }
        </button>

        <p className="text-[10px] text-center font-bold tracking-wider flex items-center justify-center gap-2" style={{ color: 'var(--text-dim)' }}>
          <Shield className="w-3 h-3 text-green-500" /> SECURE CHECKOUT — 100% SAFE
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATIC PAGES
// ─────────────────────────────────────────────────────────────

interface StaticPageProps { page: string; }

export function StaticPage({ page }: StaticPageProps) {
  const p = page.toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy />}
      {p === 'terms'   && <Terms />}
      {p === 'cookies' && <Cookies />}
      {p === 'contact' && <Contact />}
    </>
  );
}

function PageWrapper({ children, icon, title, subtitle }: { children: React.ReactNode; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen py-20" style={{ backgroundColor: 'var(--dark)', fontFamily: "'Barlow', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-14 relative pb-8" style={{ borderBottom: '2px solid var(--fire)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'var(--fire)', clipPath: 'polygon(10% 0,100% 0,90% 100%,0 100%)', color: 'white' }}>
              {icon}
            </div>
            <div>
              <h1 className="font-black text-white leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '0.04em' }}>{title}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>{subtitle}</p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, status }: { icon: React.ReactNode; title: string; desc: string; status?: string }) {
  const isActive = status === 'دائماً نشطة' || status === 'Always Active';
  return (
    <div className="group flex gap-5 p-6 mb-3 transition-all duration-300"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--dark-2)' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,69,0,0.4)'; el.style.backgroundColor = 'rgba(255,69,0,0.04)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.backgroundColor = 'var(--dark-2)'; }}>
      <div className="w-2 self-stretch flex-shrink-0" style={{ background: 'linear-gradient(180deg, var(--fire), transparent)' }} />
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,69,0,0.1)', color: 'var(--fire)' }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="font-black text-white tracking-wide" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', letterSpacing: '0.05em' }}>{title}</h3>
          {status && (
            <span className="text-[9px] font-black tracking-widest uppercase px-3 py-1"
              style={{ backgroundColor: isActive ? 'rgba(57,211,83,0.1)' : 'rgba(255,69,0,0.08)', border: `1px solid ${isActive ? 'rgba(57,211,83,0.4)' : 'rgba(255,69,0,0.3)'}`, color: isActive ? 'var(--green)' : 'var(--fire)' }}>
              {status}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper icon={<ShieldCheck size={20} />} title="PRIVACY POLICY" subtitle="Your data is safe. Here's exactly how we protect it.">
      <InfoCard icon={<Database size={16} />} title="Data We Collect"     desc="We collect only what's necessary to run your store — name, email, and payment info to ensure a smooth selling experience." />
      <InfoCard icon={<Eye size={16} />}      title="How We Use It"       desc="Your data is used to improve our services, process orders, and provide smart reports for better business decisions." />
      <InfoCard icon={<Lock size={16} />}     title="Security"            desc="We use advanced encryption and world-class security standards to protect your data from unauthorized access." />
      <InfoCard icon={<Globe size={16} />}    title="Data Sharing"        desc="We never sell your data. We share it only with trusted service providers to complete your transactions." />
      <div className="mt-8 p-4 flex items-center gap-3" style={{ border: '1px solid rgba(57,211,83,0.2)', backgroundColor: 'rgba(57,211,83,0.04)' }}>
        <Bell size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>This policy is updated periodically to ensure we meet the latest security standards.</p>
        <span className="ml-auto text-[10px] font-bold whitespace-nowrap" style={{ color: 'var(--text-dim)' }}>Updated: 06.02.2026</span>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper icon={<Scale size={20} />} title="TERMS OF SERVICE" subtitle="The rules that keep our marketplace fair and safe for everyone.">
      <InfoCard icon={<CheckCircle2 size={16} />} title="Account Responsibility" desc="You are responsible for keeping your account credentials secure and for all activities under your account. Information provided must be accurate." />
      <InfoCard icon={<CreditCard size={16} />}   title="Fees & Subscriptions"   desc="Our services are subject to periodic subscription fees. All fees are transparent with no hidden charges, charged per your chosen plan." />
      <InfoCard icon={<Ban size={16} />}           title="Prohibited Content"      desc="The platform may not be used to sell illegal goods or infringe intellectual property rights. We reserve the right to close any violating store." />
      <InfoCard icon={<Scale size={16} />}         title="Governing Law"           desc="These terms are governed by local laws in Algeria. Any disputes arising fall under the jurisdiction of local courts." />
      <div className="mt-8 p-4 flex items-start gap-3" style={{ border: '1px solid rgba(255,184,0,0.2)', backgroundColor: 'rgba(255,184,0,0.04)' }}>
        <AlertCircle size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes your acceptance.</p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={20} />} title="COOKIE POLICY" subtitle="We use cookies to improve your experience. Here's the full breakdown.">
      <InfoCard icon={<ShieldCheck size={16} />}   title="Essential Cookies"    desc="Required for core site functions like login and shopping cart. These cannot be disabled." status="Always Active" />
      <InfoCard icon={<Settings size={16} />}      title="Preference Cookies"   desc="Allow the site to remember your choices like language and timezone preferences." status="Optional" />
      <InfoCard icon={<MousePointer2 size={16} />} title="Analytics Cookies"    desc="Help us understand how merchants interact with the platform so we can build better selling tools." status="Optional" />
      <div className="mt-8 p-5 relative" style={{ backgroundColor: 'rgba(255,69,0,0.04)', border: '1px solid rgba(255,69,0,0.2)' }}>
        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'var(--fire)' }} />
        <div className="flex gap-4 items-start pl-4">
          <ToggleRight size={18} style={{ color: 'var(--fire)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 className="font-black text-white mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', letterSpacing: '0.05em' }}>MANAGE YOUR PREFERENCES</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mid)' }}>
              You can manage or delete cookies through your browser settings at any time. Note that disabling some cookies may affect your platform experience.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export function Contact() {
  const isRTL = false;
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const contacts = [
    { icon: <Mail className="w-4 h-4" />,   label: 'EMAIL',    value: 'support@fitnessstore.dz', href: 'mailto:support@fitnessstore.dz' },
    { icon: <Phone className="w-4 h-4" />,  label: 'PHONE',    value: '+213 550 123 456',         href: 'tel:+213550123456' },
    { icon: <MapPin className="w-4 h-4" />, label: 'LOCATION', value: 'Alger, Algérie',           href: undefined },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--dark)', fontFamily: "'Barlow', sans-serif" }}>

      {/* Hero */}
      <div className="relative py-24 diagonal-stripe" style={{ backgroundColor: '#080808' }}>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'var(--fire)' }} />
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-0.5" style={{ background: 'var(--fire)' }} />
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: 'var(--fire)' }}>GET IN TOUCH</span>
            <div className="w-10 h-0.5" style={{ background: 'var(--fire)' }} />
          </div>
          <h1 className="font-black text-white leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 9vw, 8rem)', letterSpacing: '0.02em' }}>
            CONTACT US
          </h1>
          <p className="text-base mt-4" style={{ color: 'var(--text-mid)' }}>We're ready to help you crush your goals. Reach out anytime.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Contact info */}
          <div>
            <h2 className="font-black text-white mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '0.05em' }}>
              DIRECT CHANNELS
            </h2>
            <div className="space-y-3">
              {contacts.map(item => (
                <a key={item.label} href={item.href || '#'}
                  className="group flex items-center gap-4 p-5 transition-all"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--dark-2)', textDecoration: 'none' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--fire)'; el.style.backgroundColor = 'rgba(255,69,0,0.06)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.backgroundColor = 'var(--dark-2)'; }}>
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,69,0,0.1)', color: 'var(--fire)' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[9px] font-black tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>{item.label}</p>
                    <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{item.value}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--fire)' }} />
                </a>
              ))}
            </div>

            {/* Motivational card */}
            <div className="mt-8 p-6 relative overflow-hidden" style={{ background: 'var(--fire)', clipPath: 'polygon(0 0, 100% 0, 97% 100%, 3% 100%)' }}>
              <p className="font-black text-white text-2xl leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em' }}>
                YOUR NEXT<br />PR IS WAITING
              </p>
              <p className="text-white/80 text-xs mt-2">We'll help you get there.</p>
              <Flame className="absolute bottom-3 right-5 w-12 h-12 text-white/20" />
            </div>
          </div>

          {/* Message form */}
          <div>
            <h2 className="font-black text-white mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '0.05em' }}>
              SEND A MESSAGE
            </h2>

            {sent ? (
              <div className="p-8 text-center" style={{ border: '2px solid var(--green)', backgroundColor: 'rgba(57,211,83,0.05)' }}>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--green)' }} />
                <p className="font-black text-white text-xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>MESSAGE SENT!</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-dim)' }}>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <FieldWrapper label="YOUR NAME">
                  <input type="text" value={formState.name} onChange={e => setFormState({ ...formState, name: e.target.value })} placeholder="John Doe" style={inputStyle()} required />
                </FieldWrapper>
                <FieldWrapper label="EMAIL ADDRESS">
                  <input type="email" value={formState.email} onChange={e => setFormState({ ...formState, email: e.target.value })} placeholder="john@example.com" style={inputStyle()} required />
                </FieldWrapper>
                <FieldWrapper label="MESSAGE">
                  <textarea value={formState.message} onChange={e => setFormState({ ...formState, message: e.target.value })} placeholder="How can we help you?" rows={5} style={{ ...inputStyle(), resize: 'none' as any }} required />
                </FieldWrapper>
                <button type="submit"
                  className="btn-fire w-full py-4 text-sm font-black tracking-widest uppercase text-white flex items-center justify-center gap-2"
                  style={{ background: 'var(--fire)', clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0 100%)' }}>
                  <Flame className="w-4 h-4" /> SEND MESSAGE
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}