'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ShoppingBag, Truck, Shield, Package,
  ChevronDown, ChevronLeft, ChevronRight, Building2,
  AlertCircle, Check, X, Infinity, Share2, MapPin, Phone,
  User, ShieldCheck, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Smile, Gift, Zap, Sparkles, Rainbow, Mail,
  ArrowRight, Music, Rocket,
} from 'lucide-react';
import { Store } from '@/types/store';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --sun:       #FFD93D;
    --sun-dark:  #F4B942;
    --coral:     #FF6B6B;
    --coral-dk:  #E85555;
    --sky:       #4ECDC4;
    --sky-dk:    #38B2AA;
    --grape:     #A855F7;
    --grape-lt:  #C084FC;
    --mint:      #6EE7B7;
    --mint-dk:   #34D399;
    --orange:    #FF9A3C;
    --blue:      #60A5FA;
    --pink:      #F472B6;
    --bg:        #FFFBF0;
    --card-bg:   #FFFFFF;
    --text:      #2D2D2D;
    --text-mid:  #666666;
    --text-soft: #999999;
    --border:    #FFE4B5;
    --shadow:    rgba(255,107,107,0.15);
  }

  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--coral), var(--grape)); border-radius: 99px; }

  /* ── Animations ── */
  @keyframes confetti-fall {
    0%   { transform: translateY(-20px) rotate(0deg) scale(0.8); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.8; }
    100% { transform: translateY(110vh) rotate(720deg) scale(1.2) translateX(50px); opacity: 0; }
  }
  @keyframes bounce-in {
    0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
    80%  { transform: scale(0.95) rotate(-1deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes wiggle {
    0%,100% { transform: rotate(-3deg); }
    50%     { transform: rotate(3deg); }
  }
  @keyframes float-up {
    0%,100% { transform: translateY(0px) rotate(-2deg); }
    50%     { transform: translateY(-12px) rotate(2deg); }
  }
  @keyframes spin-slow  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pop-in {
    from { opacity: 0; transform: scale(0.85) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes rainbow-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes marquee-kids {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes star-twinkle {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.4; transform: scale(0.7); }
  }
  @keyframes bounce-loop {
    0%,100% { transform: translateY(0); }
    40%     { transform: translateY(-18px); }
    60%     { transform: translateY(-10px); }
  }
  @keyframes jelly {
    0%,100% { transform: scaleX(1) scaleY(1); }
    25%     { transform: scaleX(1.06) scaleY(0.94); }
    50%     { transform: scaleX(0.94) scaleY(1.06); }
    75%     { transform: scaleX(1.03) scaleY(0.97); }
  }

  .rainbow-text {
    background: linear-gradient(90deg, var(--coral), var(--orange), var(--sun), var(--mint), var(--sky), var(--grape), var(--pink));
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rainbow-shift 4s ease infinite;
  }
  .bounce-in  { animation: bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
  .pop-in     { animation: pop-in 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .pop-in-d1  { animation-delay: 0.1s; }
  .pop-in-d2  { animation-delay: 0.2s; }
  .pop-in-d3  { animation-delay: 0.3s; }
  .pop-in-d4  { animation-delay: 0.4s; }
  .pop-in-d5  { animation-delay: 0.5s; }

  .card-tilt {
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
  }
  .card-tilt:hover {
    transform: translateY(-10px) rotate(1.5deg) scale(1.02);
    box-shadow: 0 20px 50px var(--shadow);
  }
  .card-tilt:nth-child(even):hover { transform: translateY(-10px) rotate(-1.5deg) scale(1.02); }

  .btn-bouncy {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
  }
  .btn-bouncy:hover  { transform: translateY(-3px) scale(1.04); }
  .btn-bouncy:active { transform: translateY(1px) scale(0.97); }

  .polka-dots {
    background-image: radial-gradient(circle, rgba(255,107,107,0.12) 2px, transparent 2px),
                      radial-gradient(circle, rgba(255,217,61,0.1) 2px, transparent 2px);
    background-size: 30px 30px, 50px 50px;
    background-position: 0 0, 15px 15px;
  }
  .stars-bg {
    background-image:
      radial-gradient(circle, var(--sun) 1.5px, transparent 1.5px),
      radial-gradient(circle, var(--pink) 1.5px, transparent 1.5px),
      radial-gradient(circle, var(--sky) 1.5px, transparent 1.5px);
    background-size: 40px 40px, 70px 70px, 55px 55px;
    background-position: 10px 10px, 25px 30px, 5px 50px;
  }
  .zigzag-border-top {
    border-top: none;
    position: relative;
  }
  .zigzag-border-top::before {
    content: '';
    position: absolute;
    top: -12px; left: 0; right: 0; height: 14px;
    background:
      linear-gradient(135deg, var(--bg) 33.33%, transparent 33.33%) 0 0,
      linear-gradient(-135deg, var(--bg) 33.33%, transparent 33.33%) 0 0;
    background-size: 24px 14px;
    background-repeat: repeat-x;
  }
  .marquee-wrap { overflow: hidden; white-space: nowrap; }
  .marquee-inner { display: inline-block; animation: marquee-kids 18s linear infinite; }

  /* Sticker / badge wobble on hover */
  .sticker:hover { animation: wiggle 0.4s ease-in-out; }
`;

// ─────────────────────────────────────────────────────────────
// CONFETTI COMPONENT
// ─────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left:     `${(i * 4.7) % 100}%`,
    delay:    `${(i * 0.6) % 10}s`,
    duration: `${6 + (i * 0.8) % 8}s`,
    size:     `${8 + (i * 1.3) % 12}px`,
    color:    ['#FFD93D','#FF6B6B','#4ECDC4','#A855F7','#F472B6','#FF9A3C','#60A5FA','#6EE7B7'][i % 8],
    shape:    i % 3,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.left, top: '-20px',
          width: p.size, height: p.size,
          backgroundColor: p.color,
          borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '2px' : '0',
          transform: p.shape === 2 ? 'rotate(45deg)' : 'none',
          animation: `confetti-fall ${p.duration} ${p.delay} ease-in infinite`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STAR DECORATION
// ─────────────────────────────────────────────────────────────
function StarDeco({ color = '#FFD93D', size = 20, delay = '0s', style = {} }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
      style={{ animation: `star-twinkle 2s ${delay} ease-in-out infinite`, ...style }}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// WAVY SVG DIVIDER
// ─────────────────────────────────────────────────────────────
function WavyDivider({ topColor = '#fff', bottomColor = '#FFFBF0', flip = false }: any) {
  return (
    <div style={{ position: 'relative', height: '70px', overflow: 'hidden', backgroundColor: flip ? topColor : bottomColor }}>
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%', display: 'block' }}>
        <path
          d="M0,35 C180,70 360,0 540,35 C720,70 900,0 1080,35 C1260,70 1380,20 1440,35 L1440,70 L0,70 Z"
          fill={flip ? bottomColor : topColor}
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Offer     { id: string; name: string; quantity: number; price: number; }
interface Variant   { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color'|'image'|'text'|null; variants: Variant[]; }
interface ProductImage        { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color'|'image'|'text'; value: string; }
interface VariantDetail       { id: string|number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya  { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
export interface Product {
  id: string; name: string; price: string|number; priceOriginal?: string|number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string|null; setSelectedOffer: (id: string|null) => void;
  selectedVariants: Record<string,string>; platform?: string; priceLoss?: number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function variantMatches(detail: VariantDetail, sel: Record<string,string>): boolean {
  return Object.entries(sel).every(([n,v]) => detail.name.some(e => e.attrName===n && e.value===v));
}
const fetchWilayas  = async (uid: string): Promise<Wilaya[]>  => { try { const {data} = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }};
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const {data} = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }};

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────
export default function Main({ store, children }: any) {
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', fontFamily: "'Nunito', sans-serif", color: 'var(--text)' }}>
      <style>{FONT_CSS}</style>

      {/* Announcement ribbon */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="marquee-wrap py-2.5"
          style={{ background: 'linear-gradient(90deg, var(--coral), var(--orange), var(--sun), var(--mint), var(--sky), var(--grape), var(--pink), var(--coral))', backgroundSize: '200% 100%', animation: 'rainbow-shift 6s linear infinite' }}>
          <div className="marquee-inner">
            {Array(8).fill(null).map((_,i) => (
              <span key={i} className="mx-8 text-white font-bold text-xs tracking-widest uppercase">
                ⭐ {store.topBar.text}
              </span>
            ))}
            {Array(8).fill(null).map((_,i) => (
              <span key={`b${i}`} className="mx-8 text-white font-bold text-xs tracking-widest uppercase">
                ⭐ {store.topBar.text}
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRTL = store.language === 'ar';

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const nav = [
    { href: `/${store.subdomain}`,         label: isRTL ? 'الرئيسية' : 'Home',    emoji: '🏠' },
    { href: `/${store.subdomain}/contact`, label: isRTL ? 'اتصل بنا' : 'Contact', emoji: '📞' },
    { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'الخصوصية' : 'Privacy', emoji: '🔒' },
  ];

  const initials = store.name.split(' ').filter(Boolean).map((w:string)=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300" dir={isRTL?'rtl':'ltr'}
      style={{
        backgroundColor: scrolled ? 'rgba(255,251,240,0.95)' : 'var(--bg)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: `3px solid transparent`,
        borderImage: 'linear-gradient(90deg, var(--coral), var(--sun), var(--mint), var(--sky), var(--grape)) 1',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between h-18 py-3">

          {/* Logo */}
          <Link href={`/${store.subdomain}`} className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:rotate-6 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, var(--coral) 0%, var(--grape) 100%)', boxShadow: '0 4px 16px rgba(168,85,247,0.3)' }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                : <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem', color: 'white' }}>{initials}</span>
              }
              {/* sparkle */}
              <span className="absolute -top-1 -right-1 text-xs" style={{ animation: 'star-twinkle 1.5s ease-in-out infinite' }}>✨</span>
            </div>
            <div>
              <span className="block font-black transition-colors" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '0.02em' }}>
                {store.name}
              </span>
              <span className="block text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--coral)' }}>
                {isRTL ? '🎮 متجر الأطفال' : '🎮 Kids\' Store'}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {nav.map(item => (
              <Link key={item.href} href={item.href}
                className="btn-bouncy flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all"
                style={{ color: 'var(--text-mid)' }}
                onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.backgroundColor='rgba(255,107,107,0.08)'; el.style.color='var(--coral)'; }}
                onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.backgroundColor='transparent'; el.style.color='var(--text-mid)'; }}>
                <span>{item.emoji}</span>{item.label}
              </Link>
            ))}
            <Link href={`/${store.subdomain}`}
              className="btn-bouncy flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow: '0 4px 20px rgba(255,107,107,0.4)', letterSpacing: '0.04em' }}>
              <ShoppingBag className="w-4 h-4" />
              {isRTL ? 'تسوق الآن' : 'Shop Now!'}
            </Link>
          </div>

          {/* Mobile */}
          <button onClick={() => setMenuOpen(p=>!p)} className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all" style={{ backgroundColor: 'rgba(255,107,107,0.1)', color: 'var(--coral)' }}>
            {menuOpen ? <X className="w-5 h-5" /> : <span style={{ fontSize: '1.25rem' }}>🎯</span>}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-64 pb-5' : 'max-h-0'}`}>
          <div className="pt-4 space-y-2" style={{ borderTop: '2px dashed var(--border)' }}>
            {nav.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-orange-50" style={{ color: 'var(--text)' }}>
                <span className="text-lg">{item.emoji}</span>{item.label}
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
    <footer className="relative" style={{ backgroundColor: '#1A1A2E', fontFamily: "'Nunito', sans-serif", overflow: 'hidden' }}>
      {/* Stars background */}
      <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none" />

      {/* Colorful top edge */}
      <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, var(--coral), var(--orange), var(--sun), var(--mint-dk), var(--sky), var(--grape), var(--pink))' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--coral), var(--grape))' }}>
                <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem', color: 'white' }}>
                  {store.name.charAt(0)}
                </span>
              </div>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.4rem', color: 'white' }}>{store.name}</span>
            </div>
            <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {isRTL ? '🎁 ألعاب وملابس أطفال بجودة عالية وأسعار مناسبة!' : '🎁 Quality toys & kids clothing for every little adventurer!'}
            </p>
            {/* Fun emoji row */}
            <div className="flex gap-2 mt-5 text-2xl" style={{ animation: 'none' }}>
              {['🚀','⭐','🎨','🦄','🎮'].map((e,i) => (
                <span key={i} className="transition-transform hover:scale-125 cursor-default"
                  style={{ display: 'inline-block', animation: `float-up ${2+i*0.3}s ease-in-out infinite`, animationDelay: `${i*0.3}s` }}>
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-5 font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--sun)', fontFamily: "'Fredoka One', cursive", fontSize: '1rem' }}>
              🗺️ {isRTL ? 'روابط مهمة' : 'Quick Links'}
            </h4>
            <div className="space-y-3">
              {[
                { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy',   emoji: '🔒' },
                { href: `/${store.subdomain}/Terms`,   label: isRTL ? 'شروط الخدمة'     : 'Terms of Service', emoji: '📋' },
                { href: `/${store.subdomain}/Cookies`, label: isRTL ? 'ملفات الارتباط'   : 'Cookie Policy',   emoji: '🍪' },
                { href: `/${store.subdomain}/contact`, label: isRTL ? 'اتصل بنا'         : 'Contact Us',      emoji: '💌' },
              ].map(l => (
                <a key={l.href} href={l.href}
                  className="flex items-center gap-2 text-sm font-medium transition-all hover:translate-x-1"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='var(--sky)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.55)'; }}>
                  <span>{l.emoji}</span>{l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Fun fact card */}
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-3xl mb-2"></p>
              <p className="font-bold text-base text-white leading-snug" style={{ fontFamily: "'Fredoka One', cursive" }}>
                {isRTL ? 'لأن كل طفل يستحق الأفضل!' : "Because every kid deserves the best!"}
              </p>
              <p className="text-xs font-medium mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {isRTL ? 'منتجات آمنة وممتعة لأطفالك' : 'Safe, fun & approved for little ones'}
              </p>
            </div>
            {/* Safety badges */}
            <div className="flex gap-2 flex-wrap">
              {[
                { e: '✅', label: isRTL ? 'آمن للأطفال' : 'Child Safe' },
                { e: '🏅', label: isRTL ? 'جودة عالية' : 'Top Quality' },
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                  <span>{b.e}</span>{b.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} {store.name} · {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'} 🎉
          </p>
          <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Kids' Kingdom Theme 👑
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────
export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const [hovered, setHovered] = useState(false);
  
  // لون موحد للعلامة التجارية - يمكنك استبداله بأي لون تريده
  const brandColor = 'var(--coral)'; 
  const brandLight = `${brandColor}15`; // لون خلفية خفيف (شفافية 15%)

  return (
    <div
      className="card-tilt group flex flex-col overflow-hidden rounded-3xl bg-white h-full"
      style={{ 
        border: `3px solid ${hovered ? brandColor : 'var(--border)'}`, 
        position: 'relative', 
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* خط علوي موحد */}
      <div className="h-1.5 w-full" style={{ backgroundColor: brandColor }} />

      {/* منطقة الصورة */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1', backgroundColor: brandLight }}>
        {displayImage
          ? <img 
              src={displayImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700" 
              style={{ transform: hovered ? 'scale(1.1)' : 'scale(1)' }} 
            />
          : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <span className="text-5xl opacity-50">🧸</span>
              <span className="text-xs font-bold" style={{ color: brandColor }}>لا توجد صورة</span>
            </div>
          )
        }

        {/* ملصق الخصم */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center sticker"
            style={{ 
              backgroundColor: brandColor, 
              color: 'white', 
              fontFamily: "'Fredoka One', cursive", 
              fontSize: '0.85rem', 
              boxShadow: `0 4px 12px ${brandColor}60`, 
              transform: 'rotate(12deg)' 
            }}>
            -{discount}%
          </div>
        )}
      </div>

      {/* محتوى البطاقة */}
      <div className="p-4 flex flex-col flex-1">
        {/* التقييم */}
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : 'opacity-30'}`} style={{ color: brandColor }} />
          ))}
          <span className="ml-1 text-[10px] font-bold opacity-60">4.8</span>
        </div>

        <h3 className="font-bold leading-snug mb-2 line-clamp-2"
          style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: 'var(--text)' }}>
          {product.name}
        </h3>

        {product.desc && (
          <div className="text-xs font-medium mb-4 line-clamp-2 opacity-70 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.desc }} />
        )}

        {/* قسم السعر والزر في الأسفل دائماً */}
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid var(--border)` }}>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase opacity-50">السعر</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.3rem', color: brandColor }}>
                    {product.price}
                  </span>
                  <span className="text-[10px] font-bold opacity-60">{store.currency}</span>
                </div>
             </div>
             
             {product.priceOriginal && product.priceOriginal > product.price && (
                <span className="text-xs line-through opacity-40 font-medium">{product.priceOriginal}</span>
             )}
          </div>

          {/* الزر الأساسي - ظاهر دوماً */}
          <Link href={`/product/${product.slug || product.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ 
              backgroundColor: brandColor,
              boxShadow: hovered ? `0 8px 20px ${brandColor}40` : 'none',
              transform: hovered ? 'translateY(-2px)' : 'translateY(0)'
            }}>
            {viewDetails} 
            <ArrowRight className={`w-4 h-4 transition-transform ${hovered ? 'translate-x-1' : ''}`} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────
export function Home({ store }: any) {
  const isRTL = store.language === 'ar';
  const dir   = isRTL ? 'rtl' : 'ltr';

  const t = {
    heroLabel:   isRTL ? '🎪 عالم الأطفال الساحر'        : '🎪 The Magical Kids World',
    heroTitle:   isRTL ? 'كل شيء\nيحبه أطفالك!'          : 'Everything\nKids Love!',
    heroSub:     isRTL ? 'ألعاب وملابس وأدوات ترفيه آمنة وممتعة لأطفالك السعداء' : 'Safe, fun toys, clothing & accessories for your little adventurers!',
    heroBtn:     isRTL ? '🛍️ تسوق الآن'                  : '🛍️ Start Shopping!',
    heroBtn2:    isRTL ? '🎁 العروض الخاصة'               : '🎁 Special Offers',
    categories:  isRTL ? 'تسوق حسب الفئة'                : 'Shop by Category',
    all:         isRTL ? 'الكل'                            : 'All',
    products:    isRTL ? 'منتجاتنا المميزة'               : 'Our Awesome Products',
    noProducts:  isRTL ? 'لا توجد منتجات بعد 🧸'          : 'No products yet 🧸',
    viewDetails: isRTL ? 'اعرف المزيد'                    : 'Get It!',
  };

  const features = [
    { emoji: '🛡️', title: isRTL ? 'آمن للأطفال' : 'Child Safe',    sub: isRTL ? 'جميع المنتجات تجتاز معايير السلامة' : 'All products pass safety standards' },
    { emoji: '🚀', title: isRTL ? 'توصيل سريع'  : 'Fast Delivery', sub: isRTL ? 'يصل لبيتك في وقت قياسي'           : 'Delivered right to your door'       },
    { emoji: '⭐', title: isRTL ? 'جودة عالية'  : 'Top Quality',   sub: isRTL ? 'منتجات مختارة بعناية'             : 'Handpicked for durability & fun'    },
    { emoji: '💝', title: isRTL ? 'ضمان الرضا'  : 'Happy Guarantee', sub: isRTL ? 'رضاك يهمنا دائماً'             : 'We ensure every child smiles'       },
  ];

  return (
    <div dir={dir} style={{ backgroundColor: 'var(--bg)', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden polka-dots"
        style={{ minHeight: '95vh', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg)' }}>
        <Confetti />

        {/* Big color blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, var(--grape), transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full pointer-events-none opacity-15"
          style={{ background: 'radial-gradient(circle, var(--sky), transparent 70%)' }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, var(--coral), transparent 70%)' }} />

        {/* Floating star decorations */}
        <StarDeco color="var(--sun)"   size={28} delay="0s"    style={{ position:'absolute', top:'12%', left:'8%',  animation: `float-up 3s ease-in-out infinite` }} />
        <StarDeco color="var(--coral)" size={20} delay="0.8s"  style={{ position:'absolute', top:'20%', right:'12%',animation: `float-up 2.5s ease-in-out infinite` }} />
        <StarDeco color="var(--grape)" size={24} delay="1.2s"  style={{ position:'absolute', bottom:'25%', left:'15%', animation: `float-up 3.5s ease-in-out infinite` }} />
        <StarDeco color="var(--mint-dk)" size={18} delay="0.4s" style={{ position:'absolute', bottom:'20%', right:'10%', animation: `float-up 2.8s ease-in-out infinite` }} />

        {/* Floating emojis */}
        {['🚂','🦄','🎨','🏆','🎪'].map((e,i) => (
          <span key={e} className="absolute text-4xl pointer-events-none hidden lg:block"
            style={{
              top: `${15 + i * 15}%`,
              left: i % 2 === 0 ? `${2 + i * 2}%` : undefined,
              right: i % 2 !== 0 ? `${2 + i * 1.5}%` : undefined,
              animation: `float-up ${2.5 + i * 0.4}s ${i * 0.5}s ease-in-out infinite`,
              opacity: 0.7,
            }}>
            {e}
          </span>
        ))}

        {store.hero?.imageUrl && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity: 0.1 }} />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl">

            {/* Pill label */}
            <div className="pop-in inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-7 font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.12), rgba(168,85,247,0.12))', border: '2px solid rgba(255,107,107,0.25)', color: 'var(--coral)' }}>
              🎠 {t.heroLabel}
            </div>

            {/* Main title */}
            <h1 className="pop-in pop-in-d1 whitespace-pre-line leading-tight mb-5"
              style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(3rem,8vw,6.5rem)', color: 'var(--text)', letterSpacing: '0.01em', lineHeight: 1.1 }}>
              {store.hero?.title || t.heroTitle}
            </h1>

            {/* Rainbow underline */}
            <div className="pop-in pop-in-d1 h-2 w-40 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, var(--coral), var(--sun), var(--mint), var(--sky), var(--grape))' }} />

            <p className="pop-in pop-in-d2 text-base font-semibold leading-relaxed mb-10" style={{ color: 'var(--text-mid)', maxWidth: '420px' }}>
              {store.hero?.subtitle || t.heroSub}
            </p>

            {/* CTAs */}
            <div className="pop-in pop-in-d3 flex flex-wrap gap-4">
              <a href="#products"
                className="btn-bouncy flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-black text-white"
                style={{ background: 'linear-gradient(135deg, var(--coral) 0%, var(--grape) 100%)', boxShadow: '0 8px 28px rgba(255,107,107,0.4)' }}>
                {t.heroBtn}
              </a>
              <a href="#categories"
                className="btn-bouncy flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-black"
                style={{ border: '3px solid var(--sun)', color: 'var(--text)', backgroundColor: 'white', boxShadow: '0 4px 16px rgba(255,217,61,0.3)' }}>
                {t.heroBtn2}
              </a>
            </div>

            {/* Trust line */}
            <div className="pop-in pop-in-d4 flex flex-wrap gap-6 mt-12 pt-8" style={{ borderTop: '2px dashed var(--border)' }}>
              {[
                { e: '🛡️', t: isRTL ? 'آمن' : 'Safe'     },
                { e: '🚀', t: isRTL ? 'سريع' : 'Fast'    },
                { e: '⭐', t: isRTL ? 'مميز' : 'Quality' },
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xl">{b.e}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-mid)' }}>{b.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wavy transition */}
      <WavyDivider topColor="var(--bg)" bottomColor="white" />

      {/* ── FEATURES ── */}
      <section style={{ backgroundColor: 'white', paddingBottom: '3rem' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f,i) => (
              <div key={i} className="flex flex-col items-center text-center p-5 rounded-3xl transition-all hover:-translate-y-2 group"
                style={{ border: '2px solid var(--border)', backgroundColor: 'var(--bg)' }}>
                <span className="text-3xl mb-3" style={{ display: 'block', animation: `float-up ${2+i*0.3}s ${i*0.2}s ease-in-out infinite` }}>{f.emoji}</span>
                <p className="font-black text-sm mb-1" style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--text)', fontSize: '0.95rem' }}>{f.title}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--text-soft)' }}>{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WavyDivider topColor="white" bottomColor="var(--bg)" />

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-16" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-3xl" style={{ animation: 'spin-slow 6s linear infinite', display: 'inline-block' }}>🎡</span>
              <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text)' }}>
                {t.categories}
              </h2>
              <span className="text-3xl" style={{ animation: 'spin-slow 6s linear infinite reverse', display: 'inline-block' }}>🎡</span>
            </div>
          </div>

          {store.categories?.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/${store.domain}`}
                className="btn-bouncy flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow: '0 4px 16px rgba(255,107,107,0.35)' }}>
                ✨ {t.all}
              </Link>
              {store.categories.map((cat: any, idx: number) => {
                const colors = ['var(--sky)', 'var(--mint-dk)', 'var(--orange)', 'var(--grape)', 'var(--coral)'];
                const c = colors[idx % colors.length];
                return (
                  <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                    className="btn-bouncy px-6 py-3 rounded-2xl text-sm font-bold transition-all"
                    style={{ border: `2px solid ${c}`, color: c, backgroundColor: `${c}10` }}
                    onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.backgroundColor=c; el.style.color='white'; }}
                    onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.backgroundColor=`${c}10`; el.style.color=c; }}>
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center rounded-3xl polka-dots" style={{ border: '3px dashed var(--border)' }}>
              <span className="text-4xl block mb-3">🎪</span>
              <p className="font-bold" style={{ color: 'var(--text-soft)' }}>{isRTL ? 'لا توجد تصنيفات بعد' : 'No categories yet'}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text)' }}>
              🎁 {t.products}
            </h2>
            <p className="mt-2 font-medium text-sm" style={{ color: 'var(--text-soft)' }}>
              {store.products?.length || 0} {isRTL ? 'منتج رائع' : 'awesome items'} 🌟
            </p>
          </div>

          {store.products?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {store.products.map((product: any) => {
                const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
                const discount = product.priceOriginal ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails} />;
              })}
            </div>
          ) : (
            <div className="py-32 text-center rounded-3xl polka-dots" style={{ border: '3px dashed var(--border)' }}>
              <span className="text-6xl block mb-4" style={{ animation: 'bounce-loop 2s ease-in-out infinite' }}>🧸</span>
              <p className="font-black text-xl" style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--text-mid)' }}>{t.noProducts}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── FUN BANNER ── */}
      <section className="relative overflow-hidden py-20" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}>
        <div className="absolute inset-0 stars-bg opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-4 mb-6 text-4xl">
            {['🚀','⭐','','🎉','✨'].map((e,i) => (
              <span key={i} style={{ animation: `float-up ${2+i*0.3}s ${i*0.2}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>
            ))}
          </div>
          <h2 className="font-black text-white leading-tight"
            style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(2rem,6vw,5rem)', lineHeight: 1.15 }}>
            {isRTL ? 'الفرح لا يتوقف هنا!' : 'The Fun Never Stops!'}
          </h2>
          <p className="mt-4 text-base font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {isRTL ? 'آلاف المنتجات الممتعة والآمنة في انتظار أطفالك' : 'Thousands of fun & safe products waiting for your kids'}
          </p>
          <a href="#products"
            className="btn-bouncy inline-flex items-center gap-3 mt-8 px-10 py-4 rounded-2xl text-base font-black text-white"
            style={{ background: 'linear-gradient(135deg, var(--coral), var(--orange), var(--sun))', boxShadow: '0 8px 30px rgba(255,107,107,0.5)' }}>
            🎪 {isRTL ? 'استكشف الآن!' : 'Explore Now!'}
          </a>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAILS
// ─────────────────────────────────────────────────────────────
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [selectedImage, setSelectedImage] = useState(0);
  const accentColor = ['var(--coral)', 'var(--sky)', 'var(--grape)', 'var(--orange)', 'var(--mint-dk)'][parseInt(product.id) % 5];

  return (
    <div className="min-h-screen" dir={isRTL?'rtl':'ltr'} style={{ backgroundColor: 'var(--bg)', fontFamily: "'Nunito', sans-serif" }}>

      {/* Breadcrumb */}
      <header className="py-3 sticky top-0 z-40"
        style={{ backgroundColor: 'rgba(255,251,240,0.95)', backdropFilter: 'blur(12px)', borderBottom: '2px dashed var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
            <span className="hover:text-coral-500 cursor-pointer">🏠 {isRTL?'الرئيسية':'Home'}</span>
            <span>›</span>
            <span className="hover:text-coral-500 cursor-pointer">🎁 {isRTL?'المنتجات':'Products'}</span>
            <span>›</span>
            <span style={{ color: 'var(--text)' }}>{product.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className="btn-bouncy w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ border: '2px solid var(--border)', backgroundColor: isWishlisted ? 'var(--coral)' : 'white', color: isWishlisted ? 'white' : 'var(--coral)' }}>
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="btn-bouncy w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ border: '2px solid var(--border)', backgroundColor: 'white', color: 'var(--sky-dk)' }}>
              <Share2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ backgroundColor: inStock ? 'rgba(110,231,183,0.15)' : 'rgba(255,107,107,0.1)', border: `2px solid ${inStock ? 'var(--mint-dk)' : 'var(--coral)'}`, color: inStock ? 'var(--mint-dk)' : 'var(--coral)' }}>
              {inStock ? '✅' : '❌'} {inStock ? (isRTL?'متوفر':'In Stock') : (isRTL?'نفد':'Out of Stock')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-3xl group"
              style={{ aspectRatio: '1', backgroundColor: `${accentColor}15`, border: `3px solid ${accentColor}40` }}>
              {allImages.length > 0
                ? <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                : <div className="w-full h-full flex items-center justify-center polka-dots"><span className="text-8xl" style={{ animation: 'float-up 3s ease-in-out infinite' }}>🧸</span></div>
              }
              {discount > 0 && (
                <div className="absolute top-4 right-4 w-14 h-14 rounded-full flex items-center justify-center font-black text-white sticker"
                  style={{ backgroundColor: 'var(--coral)', fontFamily: "'Fredoka One', cursive", fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(255,107,107,0.5)', transform: 'rotate(12deg)' }}>
                  -{discount}%
                </div>
              )}
              <button onClick={toggleWishlist} className="absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center btn-bouncy"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: isWishlisted ? 'var(--coral)' : 'var(--text-soft)' }}>
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage(p=>p===0?allImages.length-1:p-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all btn-bouncy"
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '2px solid var(--border)', color: 'var(--text)' }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedImage(p=>p===allImages.length-1?0:p+1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all btn-bouncy"
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '2px solid var(--border)', color: 'var(--text)' }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {!inStock && !autoGen && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl" style={{ backgroundColor: 'rgba(255,251,240,0.85)', backdropFilter: 'blur(4px)' }}>
                  <div className="px-6 py-4 rounded-2xl text-base font-black" style={{ border: '3px solid var(--coral)', color: 'var(--coral)', backgroundColor: 'white' }}>
                    😢 {isRTL?'نفد المخزون':'Out of Stock'}
                  </div>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img:string,idx:number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className="shrink-0 w-16 h-16 overflow-hidden rounded-2xl transition-all btn-bouncy"
                    style={{ border: `3px solid ${selectedImage===idx ? accentColor : 'var(--border)'}`, opacity: selectedImage===idx ? 1 : 0.55 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { e:'🛡️', l:isRTL?'دفع آمن':'Secure Pay'   },
                { e:'🚀', l:isRTL?'توصيل سريع':'Fast Ship' },
                { e:'⭐', l:isRTL?'جودة عالية':'Quality'   },
              ].map((b,i) => (
                <div key={i} className="flex flex-col items-center gap-1 py-3 rounded-2xl" style={{ border: '2px solid var(--border)', backgroundColor: 'white' }}>
                  <span className="text-xl">{b.e}</span>
                  <span className="text-[9px] font-bold text-center" style={{ color: 'var(--text-soft)' }}>{b.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-8 rounded-full" style={{ background: accentColor }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: accentColor }}>🎁 {isRTL?'المنتج':'Product'}</span>
              </div>
              <h1 className="leading-tight mb-3" style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(1.6rem,3.5vw,2.5rem)', color: 'var(--text)', letterSpacing: '0.01em' }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{[...Array(5)].map((_,i)=><Star key={i} className={`w-4 h-4 ${i<4?'fill-current':''}`} style={{ color:'var(--sun-dark)' }}/>)}</div>
                <span className="text-xs font-bold" style={{ color:'var(--text-soft)' }}>4.8 (128 {isRTL?'تقييم':'reviews'}) 🌟</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-5 rounded-3xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`, border: `3px solid ${accentColor}30` }}>
              <div className="absolute top-0 left-0 w-1.5 h-full rounded-full" style={{ background: accentColor }} />
              <p className="text-[10px] font-black uppercase tracking-wider mb-2 pl-4" style={{ color: 'var(--text-soft)' }}>{isRTL?'💰 السعر':'💰 Price'}</p>
              <div className="flex items-baseline gap-3 pl-4">
                <span className="font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '3rem', color: accentColor, lineHeight: 1 }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span className="text-base font-bold" style={{ color: 'var(--text-mid)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <div>
                    <span className="text-sm line-through font-bold block" style={{ color: 'var(--text-soft)' }}>{parseFloat(product.priceOriginal).toLocaleString()} دج</span>
                    <span className="text-xs font-black" style={{ color: 'var(--coral)' }}>🎉 توفر {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-black"
              style={{ backgroundColor: autoGen?'rgba(255,217,61,0.15)':inStock?'rgba(110,231,183,0.15)':'rgba(255,107,107,0.1)', border: `2px solid ${autoGen?'var(--sun-dark)':inStock?'var(--mint-dk)':'var(--coral)'}`, color: autoGen?'var(--sun-dark)':inStock?'var(--mint-dk)':'var(--coral)' }}>
              {autoGen?'♾️ ':inStock?'✅ ':'❌ '}
              {autoGen?(isRTL?'مخزون غير محدود':'Unlimited Stock'):inStock?(isRTL?'متوفر في المخزون':'In Stock'):(isRTL?'نفد المخزون':'Out of Stock')}
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: accentColor }}>🎁 {isRTL?'اختر الباقة':'Select Package'}</p>
                <div className="space-y-2">
                  {product.offers.map((offer:any) => (
                    <label key={offer.id} className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all btn-bouncy"
                      style={{ border: `3px solid ${selectedOffer===offer.id?accentColor:'var(--border)'}`, backgroundColor: selectedOffer===offer.id?`${accentColor}08`:'white' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ border: `2px solid ${selectedOffer===offer.id?accentColor:'var(--border)'}`, backgroundColor: selectedOffer===offer.id?accentColor:'transparent' }}>
                          {selectedOffer===offer.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                        <div>
                          <p className="text-sm font-bold" style={{ color:'var(--text)' }}>{offer.name}</p>
                          <p className="text-[10px] font-medium" style={{ color:'var(--text-soft)' }}>Qty: {offer.quantity}</p>
                        </div>
                      </div>
                      <span className="font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.3rem', color: accentColor }}>{offer.price.toLocaleString()} <span className="text-xs">دج</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr:any) => (
              <div key={attr.id}>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: accentColor }}>🎨 {attr.name}</p>
                {attr.displayMode==='color' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any) => {
                      const s = selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name,v.value)} title={v.name} className="w-10 h-10 rounded-xl transition-all btn-bouncy"
                        style={{ backgroundColor:v.value, boxShadow:s?`0 0 0 3px white,0 0 0 5px ${accentColor}`:'0 2px 8px rgba(0,0,0,0.15)', transform:s?'scale(1.15)':'scale(1)' }} />;
                    })}
                  </div>
                ) : attr.displayMode==='image' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any) => {
                      const s = selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name,v.value)} className="w-14 h-14 overflow-hidden rounded-2xl transition-all btn-bouncy"
                        style={{ border:`3px solid ${s?accentColor:'var(--border)'}`, opacity:s?1:0.6 }}><img src={v.value} alt={v.name} className="w-full h-full object-cover" /></button>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v:any) => {
                      const s = selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name,v.value)} className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all btn-bouncy"
                        style={{ border:`2px solid ${s?accentColor:'var(--border)'}`, backgroundColor:s?`${accentColor}15`:'white', color:s?accentColor:'var(--text-mid)' }}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
          </div>
        </div>

        {product.desc && (
          <section className="mt-16 pt-10" style={{ borderTop: '3px dashed var(--border)' }}>
            <h2 className="flex items-center gap-3 mb-8" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.8rem', color: 'var(--text)' }}>
              <span className="text-3xl">📖</span> {isRTL?'تفاصيل المنتج':'Product Details'}
            </h2>
            <div className="p-8 rounded-3xl polka-dots" style={{ border: '2px solid var(--border)', backgroundColor: 'white' }}>
              <div className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-mid)' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','span'],ALLOWED_ATTR:['class','style'] }) }} />
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
const inputSt = (err?: boolean): React.CSSProperties => ({
  width: '100%', padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600,
  backgroundColor: 'white', border: `2px solid ${err ? 'var(--coral)' : 'var(--border)'}`,
  borderRadius: '0.875rem', color: 'var(--text)', outline: 'none',
  fontFamily: "'Nunito', sans-serif", transition: 'border-color 0.2s, box-shadow 0.2s',
});

const FieldWrapper = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-mid)' }}>{label}</label>}
    {children}
    {error && <p className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--coral)' }}><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,setWilayas] = useState<Wilaya[]>([]);
  const [communes,setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes,setLoadingCommunes] = useState(false);
  const [formData,setFormData] = useState({ customerId:localStorage.getItem("customerId"), customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [formErrors,setFormErrors] = useState<Record<string,string>>({});
  const [submitting,setSubmitting] = useState(false);

  useEffect(() => { if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(() => { if(typeof window!=='undefined'){ const id=localStorage.getItem('customerId'); if(id) setFormData(p=>({...p,customerId:id})); } },[]);
  useEffect(() => { if(!formData.customerWelaya){setCommunes([]);return;} setLoadingCommunes(true); fetchCommunes(formData.customerWelaya).then(d=>{setCommunes(d);setLoadingCommunes(false);}); },[formData.customerWelaya]);

  const selectedWilayaData = useMemo(() => wilayas.find(w=>String(w.id)===String(formData.customerWelaya)),[wilayas,formData.customerWelaya]);
  const getFinalPrice = useCallback(():number => {
    const base = typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const offer = product.offers?.find(o=>o.id===selectedOffer);
    if(offer) return offer.price;
    if(product.variantDetails?.length && Object.keys(selectedVariants).length>0){ const m=product.variantDetails.find(v=>variantMatches(v,selectedVariants)); if(m&&m.price!==-1) return m.price; }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getPriceLivraison = useCallback(():number => { if(!selectedWilayaData) return 0; return formData.typeLivraison==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice; },[selectedWilayaData,formData.typeLivraison]);
  useEffect(() => { if(selectedWilayaData) setFormData(f=>({...f,priceLoss:selectedWilayaData.livraisonReturn})); },[selectedWilayaData]);

  const finalPrice = getFinalPrice();
  const getTotalPrice = () => finalPrice*formData.quantity+ +getPriceLivraison();

  const validate = () => {
    const e:Record<string,string>={};
    if(!formData.customerName.trim())  e.customerName='الاسم مطلوب';
    if(!formData.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!formData.customerWelaya)       e.customerWelaya='الولاية مطلوبة';
    if(!formData.customerCommune)      e.customerCommune='البلدية مطلوبة';
    return e;
  };

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); const errs=validate(); if(Object.keys(errs).length){setFormErrors(errs);return;} setFormErrors({}); setSubmitting(true);
    try { await axios.post(`${API_URL}/orders`,{ ...formData, customerWilayaId: +formData.customerWelaya,customerCommuneId: +formData.customerCommune, productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice, totalPrice: getTotalPrice(), priceShip : getPriceLivraison(), }); if(typeof window!=='undefined'&&formData.customerId) localStorage.setItem('customerId',formData.customerId); router.push(`/lp/${domain}/successfully`); } catch(err){console.error(err);} finally{setSubmitting(false);}
  };

  const onFocus = (e:React.FocusEvent<any>) => { e.target.style.borderColor='var(--sky)'; e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)'; };
  const onBlur  = (e:React.FocusEvent<any>, err?:boolean) => { e.target.style.borderColor=err?'var(--coral)':'var(--border)'; e.target.style.boxShadow='none'; };

  return (
    <div style={{ borderTop: '3px dashed var(--border)', paddingTop: '1.5rem' }}>
      <h3 className="flex items-center gap-2 mb-6 font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.25rem', color: 'var(--text)' }}>
        📦 {' '}Order Form
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerName} label="👤 Your Name">
            <div className="relative">
              <User className="absolute right-3 top-3.5 w-3.5 h-3.5" style={{ color:'var(--text-soft)' }} />
              <input type="text" value={formData.customerName} onChange={e=>setFormData({...formData,customerName:e.target.value})} placeholder="اسمك الكامل" style={{ ...inputSt(!!formErrors.customerName), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerName)} />
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerPhone} label="📞 Phone">
            <div className="relative">
              <Phone className="absolute right-3 top-3.5 w-3.5 h-3.5" style={{ color:'var(--text-soft)' }} />
              <input type="tel" value={formData.customerPhone} onChange={e=>setFormData({...formData,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" style={{ ...inputSt(!!formErrors.customerPhone), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerPhone)} />
            </div>
          </FieldWrapper>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerWelaya} label="📍 Wilaya">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-soft)' }} />
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-soft)' }} />
              <select value={formData.customerWelaya} onChange={e=>setFormData({...formData,customerWelaya:e.target.value,customerCommune:''})} style={{ ...inputSt(!!formErrors.customerWelaya), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer' }}>
                <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerCommune} label="🏘️ Commune">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-soft)' }} />
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-soft)' }} />
              <select value={formData.customerCommune} disabled={!formData.customerWelaya||loadingCommunes} onChange={e=>setFormData({...formData,customerCommune:e.target.value})} style={{ ...inputSt(!!formErrors.customerCommune), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer', opacity:!formData.customerWelaya?0.5:1 }}>
                <option value="">{loadingCommunes?'⏳ Loading…':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery */}
        <div>
          <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color:'var(--text-mid)' }}>🚚 Delivery Mode</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home','office'] as const).map(type => (
              <button key={type} type="button" onClick={() => setFormData(p=>({...p,typeLivraison:type}))} className="btn-bouncy flex flex-col items-center gap-2 py-5 rounded-2xl transition-all"
                style={{ border:`3px solid ${formData.typeLivraison===type?'var(--sky)':'var(--border)'}`, backgroundColor:formData.typeLivraison===type?'rgba(78,205,196,0.08)':'white' }}>
                <span className="text-2xl">{type==='home'?'🏠':'🏢'}</span>
                <p className="text-xs font-black uppercase" style={{ color:formData.typeLivraison===type?'var(--sky-dk)':'var(--text-soft)' }}>{type==='home'?'Home':'Office'}</p>
                {selectedWilayaData && <p className="text-xs font-bold" style={{ color:'var(--text-mid)' }}>{(type==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice).toLocaleString()} دج</p>}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <FieldWrapper label="🔢 Quantity">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setFormData(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black btn-bouncy" style={{ border:'2px solid var(--border)', color:'var(--coral)', backgroundColor:'white' }}>−</button>
            <span className="w-12 text-center font-black text-2xl" style={{ fontFamily:"'Fredoka One',cursive", color:'var(--text)' }}>{formData.quantity}</span>
            <button type="button" onClick={() => setFormData(p=>({...p,quantity:p.quantity+1}))} className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black btn-bouncy" style={{ border:'2px solid var(--border)', color:'var(--coral)', backgroundColor:'white' }}>+</button>
          </div>
        </FieldWrapper>

        {/* Summary */}
        <div className="p-5 rounded-3xl relative overflow-hidden polka-dots" style={{ border:'2px solid var(--border)', backgroundColor:'white' }}>
          <p className="text-xs font-black uppercase tracking-wider mb-4" style={{ color:'var(--coral)' }}>🧾 Order Summary</p>
          <div className="space-y-2.5">
            {[{l:'Product',v:product.name},{l:'Unit',v:`${finalPrice.toLocaleString()} دج`},{l:'Qty',v:`× ${formData.quantity}`},{l:'Shipping',v:selectedWilayaData?`${getPriceLivraison().toLocaleString()} دج`:'TBD'}].map(row=>(
              <div key={row.l} className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color:'var(--text-soft)' }}>{row.l}</span>
                <span className="text-sm font-bold" style={{ color:'var(--text)' }}>{row.v}</span>
              </div>
            ))}
            <div className="pt-3" style={{ borderTop:'2px dashed var(--border)' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-black uppercase" style={{ color:'var(--coral)' }}>💰 TOTAL</span>
                <span className="font-black" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'2rem', color:'var(--coral)' }}>{getTotalPrice().toLocaleString()}<span className="text-sm ml-1">دج</span></span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-bouncy w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-black text-white transition-all"
          style={{ background:submitting?'var(--text-soft)':'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow:submitting?'none':'0 8px 28px rgba(255,107,107,0.4)', cursor:submitting?'not-allowed':'pointer' }}>
          {submitting?<><div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"/>⏳ Processing…</>:<>🎉 Confirm My Order!</>}
        </button>

        <p className="text-[10px] text-center font-bold flex items-center justify-center gap-1.5" style={{ color:'var(--text-soft)' }}>
          🔒 Secure & encrypted checkout
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATIC PAGES
// ─────────────────────────────────────────────────────────────
export function StaticPage({ page }: { page: string }) {
  const p = page.toLowerCase();
  return <>{p==='privacy'&&<Privacy/>}{p==='terms'&&<Terms/>}{p==='cookies'&&<Cookies/>}{p==='contact'&&<Contact/>}</>;
}

function PageWrapper({ children, emoji, title, subtitle }: { children:React.ReactNode; emoji:string; title:string; subtitle:string }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--bg)', fontFamily:"'Nunito',sans-serif" }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-20 polka-dots" style={{ background:'linear-gradient(135deg, #fff9e6 0%, var(--bg) 100%)' }}>
        <Confetti/>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="text-6xl mb-5 block" style={{ animation:'bounce-loop 2s ease-in-out infinite' }}>{emoji}</div>
          <h1 className="font-black mb-3" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(2rem,5vw,4rem)', color:'var(--text)' }}>{title}</h1>
          <p className="text-sm font-semibold mx-auto" style={{ color:'var(--text-mid)', maxWidth:'400px' }}>{subtitle}</p>
        </div>
        <WavyDivider topColor="var(--bg)" bottomColor="white" />
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">{children}</div>
    </div>
  );
}

function InfoCard({ icon, title, desc, status }: { icon:React.ReactNode; title:string; desc:string; status?:string }) {
  const isActive = status==='دائماً نشطة'||status==='Always Active';
  return (
    <div className="group flex gap-5 p-6 mb-3 rounded-3xl transition-all duration-300 cursor-default"
      style={{ border:'2px solid var(--border)', backgroundColor:'white' }}
      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--sky)';el.style.transform='translateY(-4px) rotate(0.5deg)';el.style.boxShadow='0 12px 32px rgba(78,205,196,0.15)';}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border)';el.style.transform='none';el.style.boxShadow='none';}}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background:'linear-gradient(135deg,var(--sky),var(--mint-dk))', color:'white' }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="font-black" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.1rem', color:'var(--text)' }}>{title}</h3>
          {status && <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor:isActive?'rgba(110,231,183,0.15)':'rgba(255,217,61,0.2)', border:`2px solid ${isActive?'var(--mint-dk)':'var(--sun-dark)'}`, color:isActive?'var(--mint-dk)':'var(--sun-dark)' }}>{status}</span>}
        </div>
        <p className="text-sm font-semibold leading-relaxed" style={{ color:'var(--text-mid)' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper emoji="🔒" title="Privacy Policy" subtitle="We keep your info safe — promise! Your privacy matters to us.">
      <InfoCard icon={<Database size={18}/>} title="Data We Collect"   desc="We only collect what we need — your name, contact info, and order details to deliver your goodies safely!" />
      <InfoCard icon={<Lock size={18}/>}     title="How We Protect It" desc="We use top-notch encryption to keep your data safe from anyone who shouldn't see it." />
      <InfoCard icon={<Globe size={18}/>}    title="Sharing Policy"    desc="We never sell your info. We only share with delivery partners to get your orders to you on time!" />
      <InfoCard icon={<Bell size={18}/>}     title="Updates"           desc="We'll let you know if anything important changes. We always keep things transparent!" />
      <div className="mt-8 p-5 rounded-3xl flex items-center gap-3" style={{ backgroundColor:'rgba(110,231,183,0.1)', border:'2px solid rgba(110,231,183,0.4)' }}>
        <span className="text-2xl">✅</span>
        <p className="text-sm font-semibold" style={{ color:'var(--text-mid)' }}>Last updated: February 2026. We review our policy regularly to keep you protected!</p>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper emoji="📋" title="Terms of Service" subtitle="Simple, fair rules so everyone has a great experience!">
      <InfoCard icon={<CheckCircle2 size={18}/>} title="Your Account"         desc="Keep your login details safe! You're responsible for what happens in your account, so choose a strong password." />
      <InfoCard icon={<CreditCard size={18}/>}   title="Payments & Pricing"   desc="All prices are shown clearly — no hidden fees or surprise charges. What you see is what you pay!" />
      <InfoCard icon={<Ban size={18}/>}           title="What's Not Allowed"   desc="Please don't sell dangerous items or copy other people's work. Let's keep the marketplace fun and safe for kids!" />
      <InfoCard icon={<Scale size={18}/>}         title="Governing Rules"      desc="These terms follow the laws of Algeria. Any disagreements will be settled fairly through local courts." />
      <div className="mt-8 p-5 rounded-3xl flex items-start gap-3" style={{ backgroundColor:'rgba(255,217,61,0.1)', border:'2px solid rgba(255,217,61,0.4)' }}>
        <span className="text-2xl mt-0.5">⚠️</span>
        <p className="text-sm font-semibold" style={{ color:'var(--text-mid)' }}>We may update these terms occasionally. Keep using our store and you're agreeing to the latest version!</p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper emoji="🍪" title="Cookie Policy" subtitle="Cookies aren't just for eating — they help make our site better for you!">
      <InfoCard icon={<ShieldCheck size={18}/>}   title="Essential Cookies"  desc="These keep the store running smoothly — things like your cart and login. We can't turn these off." status="Always Active" />
      <InfoCard icon={<Settings size={18}/>}      title="Preference Cookies" desc="These remember what you like — your language and favorite settings — so you don't have to set them every time!" status="Optional" />
      <InfoCard icon={<MousePointer2 size={18}/>} title="Analytics Cookies"  desc="These help us understand what kids and parents enjoy most so we can make the store even better!" status="Optional" />
      <div className="mt-8 p-6 rounded-3xl relative overflow-hidden" style={{ background:'linear-gradient(135deg,rgba(255,107,107,0.06),rgba(168,85,247,0.06))', border:'2px solid var(--border)' }}>
        <div className="flex gap-4 items-start">
          <span className="text-2xl mt-0.5">⚙️</span>
          <div>
            <h3 className="font-black mb-2" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.1rem', color:'var(--text)' }}>Control Your Cookies!</h3>
            <p className="text-sm font-semibold leading-relaxed" style={{ color:'var(--text-mid)' }}>You can change your cookie settings in your browser anytime. Turning some off might make the store less fun though!</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export function Contact() {
  const [formState,setFormState] = useState({ name:'', email:'', message:'' });
  const [sent,setSent] = useState(false);

  const contacts = [
    { emoji:'📧', label:'Email',    value:'hello@kidskingdom.dz', href:'mailto:hello@kidskingdom.dz' },
    { emoji:'📞', label:'Phone',    value:'+213 550 123 456',     href:'tel:+213550123456' },
    { emoji:'📍', label:'Location', value:'Alger, Algérie',       href:undefined },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--bg)', fontFamily:"'Nunito',sans-serif" }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-24 polka-dots" style={{ background:'linear-gradient(135deg, #fff9e6, var(--bg))' }}>
        <Confetti/>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="text-6xl mb-5" style={{ animation:'bounce-loop 2s ease-in-out infinite', display:'inline-block' }}>💌</div>
          <h1 className="font-black mb-4" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(2.5rem,6vw,5rem)', color:'var(--text)' }}>Say Hello!</h1>
          <p className="text-base font-semibold" style={{ color:'var(--text-mid)' }}>We love hearing from you! 🌟 Reach out anytime.</p>
        </div>
        <WavyDivider topColor="var(--bg)" bottomColor="white" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <h2 className="font-black mb-8" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.8rem', color:'var(--text)' }}> Get in Touch</h2>
            <div className="space-y-3">
              {contacts.map(item => (
                <a key={item.label} href={item.href||'#'} className="group flex items-center gap-4 p-5 rounded-3xl transition-all btn-bouncy"
                  style={{ border:'2px solid var(--border)', backgroundColor:'white', textDecoration:'none' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--coral)';el.style.backgroundColor='rgba(255,107,107,0.04)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border)';el.style.backgroundColor='white';}}>
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color:'var(--text-soft)' }}>{item.label}</p>
                    <p className="text-sm font-bold" style={{ color:'var(--text)' }}>{item.value}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:'var(--coral)' }} />
                </a>
              ))}
            </div>
            {/* Fun card */}
            <div className="mt-8 p-6 rounded-3xl text-white relative overflow-hidden" style={{ background:'linear-gradient(135deg, var(--coral), var(--grape))' }}>
              <div className="absolute -right-6 -bottom-6 text-8xl opacity-20">🎪</div>
              <p className="font-black text-xl leading-tight mb-2" style={{ fontFamily:"'Fredoka One',cursive" }}>We reply super fast! ⚡</p>
              <p className="text-sm font-semibold opacity-80">Usually within a few hours during business days.</p>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="font-black mb-8" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.8rem', color:'var(--text)' }}>✉️ Send a Message</h2>
            {sent ? (
              <div className="p-10 rounded-3xl text-center polka-dots" style={{ border:'3px dashed var(--border)', backgroundColor:'white' }}>
                <span className="text-6xl block mb-4" style={{ animation:'bounce-loop 1s ease-in-out infinite' }}>🎉</span>
                <p className="font-black text-xl mb-1" style={{ fontFamily:"'Fredoka One',cursive", color:'var(--text)' }}>Message Sent!</p>
                <p className="text-sm font-semibold" style={{ color:'var(--text-mid)' }}>We'll get back to you really soon! 🌟</p>
              </div>
            ) : (
              <form onSubmit={e=>{e.preventDefault();setSent(true);}} className="space-y-4">
                <FieldWrapper label="👤 Your Name">
                  <input type="text" value={formState.name} onChange={e=>setFormState({...formState,name:e.target.value})} placeholder="Your name" style={inputSt()} required onFocus={e=>{e.target.style.borderColor='var(--sky)';e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)';}} onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}} />
                </FieldWrapper>
                <FieldWrapper label="📧 Email Address">
                  <input type="email" value={formState.email} onChange={e=>setFormState({...formState,email:e.target.value})} placeholder="your@email.com" style={inputSt()} required onFocus={e=>{e.target.style.borderColor='var(--sky)';e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)';}} onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}} />
                </FieldWrapper>
                <FieldWrapper label="💬 Your Message">
                  <textarea value={formState.message} onChange={e=>setFormState({...formState,message:e.target.value})} placeholder="What's on your mind? 😊" rows={5} style={{ ...inputSt(), resize:'none' as any }} required onFocus={e=>{e.target.style.borderColor='var(--sky)';e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)';}} onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}} />
                </FieldWrapper>
                <button type="submit" className="btn-bouncy w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-black text-white"
                  style={{ background:'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow:'0 8px 28px rgba(255,107,107,0.4)' }}>
                  🚀 Send Message!
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}