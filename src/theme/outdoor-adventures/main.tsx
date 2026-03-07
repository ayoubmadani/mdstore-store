'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, Tent, Compass, Mountain, Trees, Wind,
  ChevronDown, ChevronLeft, ChevronRight, Building2,
  AlertCircle, X, Infinity, Share2, MapPin, Phone,
  User, ShieldCheck, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Truck, Shield, Package, Map, Flame, Binoculars,
  ArrowRight, Mail, Backpack, Navigation, CloudSun,
} from 'lucide-react';
import { Store } from '@/types/store';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rye&family=Cabin:ital ,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --forest:      #2D4A2D;
    --forest-lt:   #3D6B3D;
    --forest-dk:   #1A2D1A;
    --clay:        #8B4513;
    --clay-lt:     #A05828;
    --amber:       #D4813A;
    --amber-lt:    #E8A55A;
    --stone:       #9E8C7A;
    --stone-lt:    #BDB0A3;
    --stone-dk:    #7A6A5A;
    --parchment:   #F5EDD8;
    --parchment-dk:#EDE0C4;
    --cream:       #FAF6EE;
    --bark:        #3C2415;
    --bark-lt:     #5C3A20;
    --charcoal:    #1E2020;
    --charcoal-lt: #2E3030;
    --smoke:       #4A4A40;
    --fog:         #8A8A7A;
    --text-light:  #D8CDB8;
    --border-dark: #3A3A2A;
    --border-lt:   #D8CCBA;
    --shadow-forest: rgba(45,74,45,0.25);
    --shadow-bark:   rgba(60,36,21,0.2);
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--charcoal); }
  ::-webkit-scrollbar-thumb { background: var(--forest-lt); border-radius: 2px; }

  /* ── Animations ── */
  @keyframes compass-spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes needle-settle {
    0%   { transform: rotate(-30deg); }
    25%  { transform: rotate(25deg); }
    50%  { transform: rotate(-15deg); }
    75%  { transform: rotate(10deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes trail-reveal {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes map-unfurl {
    from { opacity: 0; transform: translateY(30px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes ember-flicker {
    0%,100% { opacity: 0.8; transform: scaleY(1); }
    33%     { opacity: 1;   transform: scaleY(1.08) translateY(-2px); }
    66%     { opacity: 0.7; transform: scaleY(0.94) translateY(1px); }
  }
  @keyframes pine-sway {
    0%,100% { transform: rotate(-1.5deg) translateX(0); }
    50%     { transform: rotate(1.5deg) translateX(2px); }
  }
  @keyframes topo-scroll {
    0%   { background-position: 0 0; }
    100% { background-position: 60px 60px; }
  }
  @keyframes badge-stamp {
    0%   { transform: scale(1.4) rotate(-8deg); opacity: 0; }
    70%  { transform: scale(0.95) rotate(2deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes marquee-trail {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes smoke-rise {
    0%   { opacity: 0; transform: translateY(0) scale(0.8); }
    30%  { opacity: 0.5; }
    100% { opacity: 0; transform: translateY(-40px) scale(1.3); }
  }

  .trail-reveal   { animation: trail-reveal 0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .map-unfurl     { animation: map-unfurl 0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .trail-d1       { animation-delay: 0.12s; }
  .trail-d2       { animation-delay: 0.24s; }
  .trail-d3       { animation-delay: 0.38s; }
  .trail-d4       { animation-delay: 0.52s; }

  /* Topographic contour lines background */
  .topo-bg {
    background-color: var(--forest-dk);
    background-image:
      repeating-radial-gradient(
        ellipse 120% 60% at 40% 50%,
        transparent 0px,
        transparent 18px,
        rgba(61,107,61,0.18) 18px,
        rgba(61,107,61,0.18) 19px,
        transparent 19px,
        transparent 38px,
        rgba(61,107,61,0.14) 38px,
        rgba(61,107,61,0.14) 39px
      );
  }

  .topo-light {
    background-color: var(--parchment);
    background-image:
      repeating-radial-gradient(
        ellipse 140% 70% at 55% 45%,
        transparent 0px,
        transparent 22px,
        rgba(139,69,19,0.07) 22px,
        rgba(139,69,19,0.07) 23px,
        transparent 23px,
        transparent 46px,
        rgba(139,69,19,0.05) 46px,
        rgba(139,69,19,0.05) 47px
      );
  }

  /* Cross-hatch border pattern */
  .hatch-border {
    border: 3px solid var(--amber);
    position: relative;
  }
  .hatch-border::before {
    content: '';
    position: absolute;
    inset: 3px;
    border: 1px solid rgba(212,129,58,0.3);
    pointer-events: none;
  }

  /* Stamp / badge shape */
  .hex-badge {
    clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
  }
  .trail-marker {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }

  /* Wood grain overlay */
  .wood-texture::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background-image: repeating-linear-gradient(
      92deg,
      transparent 0px,
      transparent 4px,
      rgba(60,36,21,0.03) 4px,
      rgba(60,36,21,0.03) 5px
    );
    opacity: 0.8;
  }

  /* Worn edge effect */
  .worn-edge {
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.05),
      inset 0 2px 8px rgba(0,0,0,0.3),
      0 4px 20px rgba(0,0,0,0.4);
  }

  .card-rugged {
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease;
  }
  .card-rugged:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px var(--amber);
  }

  .btn-trail {
    position: relative; overflow: hidden;
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .btn-trail::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: skewX(-20deg);
    transition: left 0.5s ease;
  }
  .btn-trail:hover::after { left: 150%; }
  .btn-trail:hover { transform: translateY(-2px); }
  .btn-trail:active { transform: translateY(0px) scale(0.98); }

  .marquee-wrap { overflow: hidden; white-space: nowrap; }
  .marquee-inner { display: inline-block; animation: marquee-trail 22s linear infinite; }

  /* Stitched border */
  .stitched {
    border: 2px dashed rgba(212,129,58,0.5);
    outline: 3px solid var(--forest);
    outline-offset: -6px;
  }

  /* Ember particles */
  .ember {
    position: absolute;
    border-radius: 50%;
    animation: smoke-rise 3s ease-out infinite;
  }
`;

// ─────────────────────────────────────────────────────────────
// SVG DECORATIONS
// ─────────────────────────────────────────────────────────────

function CompassRose({ size = 60, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      style={{ animation: animate ? 'compass-spin 20s linear infinite' : 'none' }}>
      <circle cx="50" cy="50" r="46" stroke="rgba(212,129,58,0.4)" strokeWidth="1.5" fill="none"/>
      <circle cx="50" cy="50" r="38" stroke="rgba(212,129,58,0.2)" strokeWidth="1" fill="none"/>
      {/* N arrow */}
      <polygon points="50,8 54,42 50,46 46,42" fill="#D4813A"/>
      {/* S arrow */}
      <polygon points="50,92 54,58 50,54 46,58" fill="rgba(212,129,58,0.4)"/>
      {/* E arrow */}
      <polygon points="92,50 58,54 54,50 58,46" fill="rgba(212,129,58,0.4)"/>
      {/* W arrow */}
      <polygon points="8,50 42,54 46,50 42,46" fill="rgba(212,129,58,0.4)"/>
      <circle cx="50" cy="50" r="5" fill="#D4813A"/>
      <circle cx="50" cy="50" r="2" fill="#1A2D1A"/>
      {/* Cardinal labels */}
      <text x="50" y="6" textAnchor="middle" fill="#D4813A" fontSize="8" fontFamily="'Rye',serif" fontWeight="bold">N</text>
      <text x="50" y="99" textAnchor="middle" fill="rgba(212,129,58,0.5)" fontSize="7" fontFamily="'Rye',serif">S</text>
      <text x="97" y="53" textAnchor="middle" fill="rgba(212,129,58,0.5)" fontSize="7" fontFamily="'Rye',serif">E</text>
      <text x="3" y="53" textAnchor="middle" fill="rgba(212,129,58,0.5)" fontSize="7" fontFamily="'Rye',serif">W</text>
    </svg>
  );
}

function PineTree({ height = 48, color = '#3D6B3D', sway = false }: any) {
  return (
    <svg width={height * 0.6} height={height} viewBox="0 0 30 50" fill="none"
      style={{ animation: sway ? `pine-sway ${2.5 + Math.random()}s ease-in-out infinite` : 'none' }}>
      <polygon points="15,2 28,20 22,20 27,33 19,33 21,48 9,48 11,33 3,33 8,20 2,20" fill={color}/>
    </svg>
  );
}

function MountainSilhouette({ width = 300, color = 'rgba(45,74,45,0.5)' }: any) {
  return (
    <svg width={width} height={80} viewBox="0 0 300 80" fill="none" preserveAspectRatio="none">
      <polygon points="0,80 60,20 90,45 140,5 180,40 220,15 260,50 300,25 300,80" fill={color}/>
    </svg>
  );
}

function TrailDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--amber), transparent)' }}/>
      <div className="trail-marker w-8 h-8 flex items-center justify-center" style={{ backgroundColor: 'var(--amber)', color: 'var(--bark)' }}>
        <Navigation className="w-3.5 h-3.5"/>
      </div>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--amber), transparent)' }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Offer     { id: string; name: string; quantity: number; price: number; }
interface Variant   { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color'|'image'|'text'|null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color'|'image'|'text'; value: string; }
interface VariantDetail { id: string|number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
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
function variantMatches(d: VariantDetail, sel: Record<string,string>): boolean {
  return Object.entries(sel).every(([n,v]) => d.name.some(e => e.attrName===n && e.value===v));
}
const fetchWilayas  = async (uid: string): Promise<Wilaya[]>  => { try { const {data} = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }};
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const {data} = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }};

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────
export default function Main({ store, children }: any) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--charcoal)', fontFamily: "'Cabin', sans-serif", color: 'var(--text-light)' }}>
      <style>{FONT_CSS}</style>

      {/* Announcement banner */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="marquee-wrap py-2" style={{ backgroundColor: 'var(--forest-dk)', borderBottom: '1px solid rgba(212,129,58,0.3)' }}>
          <div className="marquee-inner">
            {Array(8).fill(null).map((_,i) => (
              <span key={i} className="mx-10 text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--amber)' }}>
                <Compass className="inline w-3 h-3 mr-2 mb-0.5"/>
                {store.topBar.text}
              </span>
            ))}
            {Array(8).fill(null).map((_,i) => (
              <span key={`b${i}`} className="mx-10 text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--amber)' }}>
                <Compass className="inline w-3 h-3 mr-2 mb-0.5"/>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRTL = store.language === 'ar';

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const nav = [
    { href: `/${store.subdomain}`,         label: isRTL ? 'الرئيسية' : 'Base Camp' },
    { href: `/${store.subdomain}/contact`, label: isRTL ? 'اتصل بنا' : 'Contact'   },
    { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'الخصوصية' : 'Privacy'   },
  ];

  return (
    <nav className="sticky top-0 z-50 transition-all duration-400" dir={isRTL?'rtl':'ltr'}
      style={{
        backgroundColor: scrolled ? 'rgba(28,32,32,0.97)' : 'var(--charcoal)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(212,129,58,0.3)' : 'transparent'}`,
      }}>

      {/* Amber top accent */}
      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, var(--forest), var(--amber), var(--clay), var(--amber), var(--forest))' }}/>

      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between h-17 py-3.5">

          {/* Logo */}
          <Link href={`/${store.subdomain}`} className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105"
              style={{ backgroundColor: 'var(--forest)', border: '2px solid var(--amber)', clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)' }}>
              {store.design.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} className="w-8 h-8 object-contain"/>
                : <Tent className="w-5 h-5" style={{ color: 'var(--amber)' }}/>
              }
            </div>
            <div>
              <span className="block text-white group-hover:text-amber-400 transition-colors"
                style={{ fontFamily: "'Rye', serif", fontSize: '1.3rem', letterSpacing: '0.05em' }}>
                {store.name}
              </span>
              <span className="block text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: 'var(--fog)' }}>
                {isRTL ? 'معدات المغامرات' : 'Outdoor Gear & Adventures'}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {nav.map(item => (
              <Link key={item.href} href={item.href}
                className="relative text-xs font-bold tracking-widest uppercase transition-colors group"
                style={{ color: 'var(--stone)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--amber)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--stone)'; }}>
                {item.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300" style={{ background: 'var(--amber)' }}/>
              </Link>
            ))}
            <Link href={`/${store.subdomain}`}
              className="btn-trail flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-widest uppercase text-white"
              style={{ backgroundColor: 'var(--forest)', border: '1px solid var(--amber)', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
              <Backpack className="w-3.5 h-3.5" style={{ color: 'var(--amber)' }}/>
              {isRTL ? 'تسوق الآن' : 'Gear Up'}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(p=>!p)} className="md:hidden p-2 transition-colors" style={{ color: 'var(--stone)' }}>
            <div className="space-y-1.5 w-6">
              <span className="block h-0.5 transition-all" style={{ backgroundColor: 'var(--amber)', width: menuOpen ? '24px' : '24px', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }}/>
              <span className="block h-0.5 w-4 transition-all" style={{ backgroundColor: 'var(--amber)', opacity: menuOpen ? 0 : 1 }}/>
              <span className="block h-0.5 transition-all" style={{ backgroundColor: 'var(--amber)', width: menuOpen ? '24px' : '16px', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }}/>
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-56 pb-5' : 'max-h-0'}`}>
          <div className="pt-4 space-y-4" style={{ borderTop: '1px solid rgba(212,129,58,0.2)' }}>
            {nav.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--stone)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='var(--amber)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='var(--stone)'; }}>
                <span style={{ color: 'var(--amber)', fontSize: '8px' }}>▶</span>{item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,129,58,0.2), transparent)' }}/>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
export function Footer({ store }: any) {
  const isRTL = store.language === 'ar';
  return (
    <footer className="relative topo-bg wood-texture" style={{ overflow: 'hidden', fontFamily: "'Cabin', sans-serif" }}>
      {/* Mountain silhouette */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <MountainSilhouette width="100%" color="rgba(26,45,26,0.7)"/>
      </div>

      {/* Pine trees row */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around pointer-events-none px-8 opacity-30">
        {[48,38,55,42,50,36,52].map((h,i) => (
          <PineTree key={i} height={h} color="var(--forest-lt)" sway={true}/>
        ))}
      </div>

      {/* Amber top bar */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--forest), var(--amber), var(--clay), var(--amber), var(--forest))' }}/>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12" style={{ borderBottom: '1px solid rgba(212,129,58,0.2)' }}>

          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: 'var(--forest)', border: '2px solid var(--amber)', clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)' }}>
                <Tent className="w-6 h-6" style={{ color: 'var(--amber)' }}/>
              </div>
              <span style={{ fontFamily: "'Rye', serif", fontSize: '1.3rem', color: 'var(--parchment)', letterSpacing: '0.05em' }}>{store.name}</span>
            </div>
            <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--stone)', maxWidth: '260px' }}>
              {isRTL
                ? 'معدات المغامرات والتخييم لكل من يحب استكشاف الطبيعة.'
                : 'Gear built for the wild. Every product tested on the trail, so you can trust it in the field.'}
            </p>
            <CompassRose size={56} animate={false}/>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-6 text-xs font-bold tracking-[0.25em] uppercase flex items-center gap-2"
              style={{ fontFamily: "'Rye', serif", color: 'var(--amber)', fontSize: '0.8rem' }}>
              <Map className="w-3.5 h-3.5"/> {isRTL ? 'خريطة الموقع' : 'Trail Map'}
            </h4>
            <div className="space-y-3">
              {[
                { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'   },
                { href: `/${store.subdomain}/Terms`,   label: isRTL ? 'شروط الخدمة'     : 'Terms of Service' },
                { href: `/${store.subdomain}/Cookies`, label: isRTL ? 'ملفات الارتباط'   : 'Cookie Policy'   },
                { href: `/${store.subdomain}/contact`, label: isRTL ? 'اتصل بنا'         : 'Contact Us'      },
              ].map(l => (
                <a key={l.href} href={l.href} className="flex items-center gap-2 text-sm font-medium transition-all"
                  style={{ color: 'var(--stone)' }}
                  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.color='var(--amber)'; el.style.paddingLeft='8px'; }}
                  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.color='var(--stone)'; el.style.paddingLeft='0'; }}>
                  <span style={{ color: 'var(--amber)', fontSize: '8px' }}>▶</span>{l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Gear up card */}
          <div>
            <div className="p-5 relative overflow-hidden" style={{ backgroundColor: 'rgba(45,74,45,0.3)', border: '1px solid rgba(212,129,58,0.25)' }}>
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'linear-gradient(180deg, var(--amber), transparent)' }}/>
              <Flame className="w-6 h-6 mb-3" style={{ color: 'var(--amber)', animation: 'ember-flicker 2s ease-in-out infinite' }}/>
              <p className="font-bold leading-snug mb-2" style={{ fontFamily: "'Rye', serif", fontSize: '1.1rem', color: 'var(--parchment)', letterSpacing: '0.04em' }}>
                {isRTL ? 'المغامرة تبدأ هنا' : 'The Wild Awaits You'}
              </p>
              <p className="text-xs font-medium" style={{ color: 'var(--stone)' }}>
                {isRTL ? 'معدات موثوقة لكل رحلة' : 'Trusted gear for every expedition.'}
              </p>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { icon: <Shield className="w-3 h-3"/>,  l: isRTL ? 'موثوق' : 'Battle-Tested' },
                { icon: <Truck className="w-3 h-3"/>,   l: isRTL ? 'توصيل' : 'Fast Delivery' },
                { icon: <Mountain className="w-3 h-3"/>,l: isRTL ? 'متين'  : 'Trail-Ready'   },
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase"
                  style={{ border: '1px solid rgba(212,129,58,0.3)', color: 'var(--stone)', backgroundColor: 'rgba(45,74,45,0.2)' }}>
                  <span style={{ color: 'var(--amber)' }}>{b.icon}</span>{b.l}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium" style={{ color: 'var(--stone-dk)' }}>
            © {new Date().getFullYear()} {store.name.toUpperCase()} — ALL RIGHTS RESERVED
          </p>
          <p className="text-xs font-bold tracking-widest uppercase flex items-center gap-2" style={{ color: 'var(--stone-dk)' }}>
            <Compass className="w-3.5 h-3.5" style={{ color: 'var(--amber)' }}/>
            Outdoor Adventures Theme
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

  return (
    <div className="card-rugged group flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--charcoal-lt)', border: '1px solid var(--border-dark)', position: 'relative' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

      {/* Amber top edge */}
      <div className="h-0.5" style={{ background: hovered ? 'linear-gradient(90deg, var(--amber), var(--clay))' : 'var(--border-dark)', transition: 'background 0.3s' }}/>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', backgroundColor: 'var(--forest-dk)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-600"
              style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)', filter: 'brightness(0.88) contrast(1.05) saturate(0.9)', transition: 'transform 0.6s ease, filter 0.4s' }}/>
          : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 topo-bg">
              <Mountain className="w-12 h-12" style={{ color: 'var(--forest-lt)' }}/>
              <span className="text-xs font-bold tracking-wider" style={{ color: 'var(--fog)' }}>NO PHOTO</span>
            </div>
          )
        }

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(28,32,32,0.6) 100%)', opacity: hovered ? 1 : 0.5, transition: 'opacity 0.4s' }}/>

        {/* Discount stamp */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 w-14 h-14 hex-badge flex items-center justify-center"
            style={{ backgroundColor: 'var(--clay)', animation: 'badge-stamp 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <span className="text-center leading-none" style={{ fontFamily: "'Rye',serif", fontSize: '0.7rem', color: 'var(--parchment)' }}>-{discount}%</span>
          </div>
        )}

        {/* Trail marker overlay on hover */}
        <div className="absolute inset-0 flex items-end justify-center p-4 transition-all duration-400"
          style={{ transform: hovered ? 'translateY(0)' : 'translateY(100%)', opacity: hovered ? 1 : 0 }}>
          <Link href={`/${store.subdomain}/product/${product.slug||product.id}`}
            className="btn-trail flex items-center justify-center gap-2 w-full py-3 text-xs font-bold tracking-widest uppercase"
            style={{ backgroundColor: 'var(--forest)', border: '1px solid var(--amber)', color: 'var(--amber)', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}>
            <Binoculars className="w-3.5 h-3.5"/> {viewDetails}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Stars */}
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_,i) => <Star key={i} className={`w-3 h-3 ${i<4?'fill-current':''}`} style={{ color: 'var(--amber)' }}/>)}
          <span className="ml-1.5 text-[10px] font-medium" style={{ color: 'var(--fog)' }}>4.8</span>
        </div>

        <h3 className="font-bold leading-snug mb-1 line-clamp-2 transition-colors group-hover:text-amber-400"
          style={{ fontFamily: "'Rye', serif", fontSize: '0.95rem', color: 'var(--parchment)', letterSpacing: '0.04em' }}>
          {product.name}
        </h3>

        {product.desc && (
          <div className="text-xs font-medium mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--fog)' }}
            dangerouslySetInnerHTML={{ __html: product.desc }}/>
        )}

        <div className="mt-auto flex items-end justify-between pt-3" style={{ borderTop: '1px solid var(--border-dark)' }}>
          <div>
            <span className="font-bold" style={{ fontFamily: "'Rye',serif", fontSize: '1.4rem', color: 'var(--amber)' }}>
              {product.price}
            </span>
            <span className="ml-1 text-[11px] font-medium" style={{ color: 'var(--fog)' }}>{store.currency}</span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="ml-2 text-xs line-through" style={{ color: 'var(--stone-dk)' }}>{product.priceOriginal}</span>
            )}
          </div>
          <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" style={{ color: 'var(--amber)' }}/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────
export function Home({ store }: any) {
  const isRTL  = store.language === 'ar';
  const dir    = isRTL ? 'rtl' : 'ltr';

  const t = {
    badge:       isRTL ? 'مجهز للمغامرة'                : 'EXPEDITION READY',
    heroTitle:   isRTL ? 'اكتشف\nالبرية'                : 'INTO THE\nWILD',
    heroSub:     isRTL ? 'معدات تخييم وطبيعة مختارة للمغامرين الحقيقيين' : 'Field-tested gear for serious explorers. From base camp to summit.',
    heroBtn:     isRTL ? 'استكشف المعدات'               : 'Explore Gear',
    heroBtn2:    isRTL ? 'عروض خاصة'                    : 'Field Deals',
    categories:  isRTL ? 'تصنيفات المعدات'              : 'Gear Categories',
    products:    isRTL ? 'ترسانة المغامرين'             : 'The Arsenal',
    noProducts:  isRTL ? 'لا توجد منتجات بعد'           : 'No gear loaded yet',
    viewDetails: isRTL ? 'استكشف'                        : 'Inspect Gear',
    all:         isRTL ? 'الكل'                          : 'All Gear',
  };

  const stats = [
    { icon: <Mountain className="w-5 h-5"/>,  val: '2000+', label: isRTL ? 'رحلة ناجحة'  : 'Expeditions Equipped' },
    { icon: <Package className="w-5 h-5"/>,   val: store.products?.length||'100+', label: isRTL ? 'منتج متوفر' : 'Products In Stock' },
    { icon: <Truck className="w-5 h-5"/>,     val: '48H',   label: isRTL ? 'توصيل سريع'  : 'Delivery'            },
    { icon: <ShieldCheck className="w-5 h-5"/>,val:'100%',  label: isRTL ? 'مضمون'        : 'Trail Guarantee'     },
  ];

  const features = [
    { icon: <Flame className="w-5 h-5"/>,     label: isRTL ? 'معدات اختُبرت ميدانياً' : 'Field-Tested Gear'    },
    { icon: <CloudSun className="w-5 h-5"/>,  label: isRTL ? 'مقاومة للطقس'          : 'All-Weather Ready'    },
    { icon: <Backpack className="w-5 h-5"/>,  label: isRTL ? 'خفيف الوزن'            : 'Ultralight Options'   },
    { icon: <Navigation className="w-5 h-5"/>,label: isRTL ? 'دليل الخبراء'          : 'Expert Guide Included' },
  ];

  return (
    <div dir={dir} style={{ backgroundColor: 'var(--charcoal)', fontFamily: "'Cabin',sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden topo-bg"
        style={{ minHeight: '96vh', display: 'flex', alignItems: 'center' }}>

        {/* Pine silhouette row – left */}
        <div className="absolute bottom-0 left-0 flex items-end gap-2 pointer-events-none pl-4 opacity-40 hidden lg:flex">
          {[60,80,55,70,48,75].map((h,i) => <PineTree key={i} height={h} color="var(--forest-lt)" sway={true}/>)}
        </div>
        {/* Pine silhouette row – right */}
        <div className="absolute bottom-0 right-0 flex items-end gap-2 pointer-events-none pr-4 opacity-35 hidden lg:flex">
          {[52,68,45,72,58,65].map((h,i) => <PineTree key={i} height={h} color="var(--forest)" sway={true}/>)}
        </div>

        {/* Mountain horizon */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <MountainSilhouette width="100%" color="rgba(26,45,26,0.6)"/>
        </div>

        {/* Amber light glow */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-10 hidden lg:block"
          style={{ background: 'radial-gradient(circle, var(--amber), transparent 70%)' }}/>

        {/* Hero image overlay */}
        {store.hero?.imageUrl && (
          <div className="absolute inset-0 pointer-events-none">
            <img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover"
              style={{ opacity: 0.15, filter: 'grayscale(30%) contrast(1.2)' }}/>
          </div>
        )}

        {/* Vertical amber rule */}
        <div className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none hidden lg:block"
          style={{ background: 'linear-gradient(180deg, transparent, var(--amber) 30%, var(--amber) 70%, transparent)' }}/>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="trail-reveal inline-flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-[0.28em] uppercase"
                style={{ border: '1px solid var(--amber)', color: 'var(--amber)', backgroundColor: 'rgba(212,129,58,0.08)' }}>
                <Compass className="w-3.5 h-3.5"/>
                {t.badge}
              </div>
            </div>

            {/* Main title */}
            <h1 className="trail-reveal trail-d1 whitespace-pre-line leading-none mb-6"
              style={{ fontFamily: "'Rye', serif", fontSize: 'clamp(3.5rem,9vw,8.5rem)', color: 'var(--parchment)', letterSpacing: '0.04em', lineHeight: 0.95 }}>
              {store.hero?.title || t.heroTitle}
            </h1>

            {/* Amber rule */}
            <div className="trail-reveal trail-d1 flex items-center gap-4 mb-7">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, var(--amber), transparent)' }}/>
              <CompassRose size={36}/>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--amber))' }}/>
            </div>

            <p className="trail-reveal trail-d2 text-base font-medium leading-relaxed mb-10" style={{ color: 'var(--stone)', maxWidth: '440px' }}>
              {store.hero?.subtitle || t.heroSub}
            </p>

            {/* CTAs */}
            <div className="trail-reveal trail-d3 flex flex-wrap gap-4">
              <a href="#products"
                className="btn-trail flex items-center gap-3 px-8 py-4 text-sm font-bold tracking-widest uppercase"
                style={{ backgroundColor: 'var(--forest)', border: '2px solid var(--amber)', color: 'var(--amber)', clipPath: 'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)' }}>
                <Tent className="w-4 h-4"/> {t.heroBtn}
              </a>
              <a href="#categories"
                className="btn-trail flex items-center gap-3 px-8 py-4 text-sm font-bold tracking-widest uppercase"
                style={{ backgroundColor: 'rgba(212,129,58,0.1)', border: '2px solid rgba(212,129,58,0.35)', color: 'var(--stone)', clipPath: 'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)' }}>
                {t.heroBtn2} <ArrowRight className="w-4 h-4"/>
              </a>
            </div>

            {/* Trust row */}
            <div className="trail-reveal trail-d4 flex flex-wrap gap-6 mt-12 pt-8" style={{ borderTop: '1px solid rgba(212,129,58,0.2)' }}>
              {[
                { icon:<Shield className="w-3.5 h-3.5"/>,  label: isRTL?'مضمون':'Guaranteed' },
                { icon:<Truck className="w-3.5 h-3.5"/>,   label: isRTL?'توصيل سريع':'Fast Dispatch' },
                { icon:<Mountain className="w-3.5 h-3.5"/>,label: isRTL?'معدات متينة':'Trail Proven' },
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-2">
                  <span style={{ color: 'var(--amber)' }}>{b.icon}</span>
                  <span className="text-xs font-medium tracking-wider" style={{ color: 'var(--stone)' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom terrain cut */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '40px', overflow: 'hidden', zIndex: 2 }}>
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ width:'100%',height:'100%',display:'block' }}>
            <path d="M0,40 L0,15 L120,28 L240,10 L360,25 L480,8 L600,22 L720,5 L840,20 L960,3 L1080,18 L1200,8 L1320,22 L1440,12 L1440,40 Z"
              fill="var(--charcoal)"/>
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ backgroundColor: 'var(--forest)', borderBottom: '1px solid rgba(212,129,58,0.2)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s,i) => (
              <div key={i} className="flex items-center gap-3 py-5 px-6 group transition-colors hover:bg-black/10"
                style={{ borderRight: i<3 ? '1px solid rgba(212,129,58,0.2)' : 'none' }}>
                <span style={{ color: 'var(--amber)' }}>{s.icon}</span>
                <div>
                  <p className="font-bold text-2xl leading-none" style={{ fontFamily:"'Rye',serif", color:'var(--parchment)', letterSpacing:'0.04em' }}>{s.val}</p>
                  <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5" style={{ color:'rgba(255,255,255,0.45)' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-14" style={{ backgroundColor: 'var(--charcoal-lt)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {features.map((f,i) => (
              <div key={i} className="flex items-center gap-3 p-4 group transition-all hover:bg-green-900/10"
                style={{ border: '1px solid var(--border-dark)' }}>
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(45,74,45,0.4)', color: 'var(--amber)' }}>
                  {f.icon}
                </div>
                <span className="text-xs font-bold tracking-wide" style={{ color: 'var(--stone)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-16 topo-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-1 h-10" style={{ background: 'var(--amber)' }}/>
            <div>
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-1" style={{ color: 'var(--amber)' }}>
                — {isRTL?'تصفح حسب':'BROWSE BY'}
              </p>
              <h2 style={{ fontFamily:"'Rye',serif", fontSize:'clamp(1.6rem,4vw,2.8rem)', color:'var(--parchment)', letterSpacing:'0.04em' }}>
                {t.categories}
              </h2>
            </div>
          </div>

          {store.categories?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              <Link href={`/${store.domain}`}
                className="btn-trail flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-widest uppercase"
                style={{ backgroundColor:'var(--forest)', border:'1px solid var(--amber)', color:'var(--amber)', clipPath:'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}>
                <Compass className="w-3.5 h-3.5"/> {t.all}
              </Link>
              {store.categories.map((cat:any) => (
                <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                  className="btn-trail px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all"
                  style={{ border:'1px solid var(--border-dark)', color:'var(--stone)', backgroundColor:'rgba(255,255,255,0.03)', clipPath:'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}
                  onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--amber)'; el.style.color='var(--amber)'; el.style.backgroundColor='rgba(212,129,58,0.08)'; }}
                  onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border-dark)'; el.style.color='var(--stone)'; el.style.backgroundColor='rgba(255,255,255,0.03)'; }}>
                  {cat.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center topo-bg" style={{ border:'1px solid var(--border-dark)' }}>
              <Mountain className="w-10 h-10 mx-auto mb-3" style={{ color:'var(--forest-lt)' }}/>
              <p className="text-sm font-medium" style={{ color:'var(--fog)' }}>{isRTL?'لا توجد تصنيفات بعد':'No categories yet'}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="w-1 h-10" style={{ background: 'var(--amber)' }}/>
              <div>
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-1" style={{ color: 'var(--amber)' }}>
                  — {isRTL?'المجموعة':'COLLECTION'}
                </p>
                <h2 style={{ fontFamily:"'Rye',serif", fontSize:'clamp(1.6rem,4vw,2.8rem)', color:'var(--parchment)', letterSpacing:'0.04em' }}>
                  {t.products}
                </h2>
              </div>
            </div>
            <span className="text-sm font-medium hidden md:block" style={{ color:'var(--fog)' }}>
              {store.products?.length||0} {isRTL?'منتج':'items'}
            </span>
          </div>

          {store.products?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {store.products.map((product:any) => {
                const displayImage = product.productImage||product.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                const discount = product.priceOriginal?Math.round(((product.priceOriginal-product.price)/product.priceOriginal)*100):0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails}/>;
              })}
            </div>
          ) : (
            <div className="py-32 text-center topo-bg" style={{ border:'1px solid var(--border-dark)' }}>
              <Mountain className="w-14 h-14 mx-auto mb-4" style={{ color:'var(--forest-lt)' }}/>
              <p className="font-bold text-xl mb-2" style={{ fontFamily:"'Rye',serif", color:'var(--stone)', letterSpacing:'0.04em' }}>{t.noProducts}</p>
              <p className="text-sm" style={{ color:'var(--fog)' }}>{isRTL?'أضف منتجاتك للبدء':'Add your first product to start selling'}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CALLOUT BANNER ── */}
      <section className="relative overflow-hidden py-24 topo-bg">
        <div className="absolute inset-0 pointer-events-none">
          <MountainSilhouette width="100%" color="rgba(45,74,45,0.35)"/>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around pointer-events-none px-12 opacity-25">
          {[55,70,48,65,58].map((h,i) => <PineTree key={i} height={h} color="var(--forest-lt)" sway/>)}
        </div>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background:'linear-gradient(90deg, var(--forest), var(--amber), var(--clay), var(--amber), var(--forest))' }}/>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background:'linear-gradient(90deg, var(--forest), var(--amber), var(--clay), var(--amber), var(--forest))' }}/>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <CompassRose size={64} animate={true}/>
          <h2 className="mt-6 font-bold leading-none" style={{ fontFamily:"'Rye',serif", fontSize:'clamp(2.5rem,7vw,6rem)', color:'var(--parchment)', letterSpacing:'0.04em' }}>
            {isRTL ? 'الطبيعة تنتظرك' : 'NATURE IS\nCALLING'}
          </h2>
          <div className="flex items-center gap-3 justify-center my-5">
            <div className="h-px w-16" style={{ background:'var(--amber)' }}/>
            <Flame className="w-5 h-5" style={{ color:'var(--amber)', animation:'ember-flicker 1.5s ease-in-out infinite' }}/>
            <div className="h-px w-16" style={{ background:'var(--amber)' }}/>
          </div>
          <p className="text-sm font-medium" style={{ color:'var(--stone)', maxWidth:'400px', margin:'0 auto' }}>
            {isRTL?'معدات احترافية لكل مغامرة. لا تتردد في الخروج.':'Professional gear for every adventure. Don\'t let the wild wait.'}
          </p>
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

  return (
    <div className="min-h-screen" dir={isRTL?'rtl':'ltr'} style={{ backgroundColor:'var(--charcoal)', fontFamily:"'Cabin',sans-serif" }}>
      {/* Breadcrumb */}
      <header className="py-4 sticky top-0 z-40"
        style={{ backgroundColor:'rgba(28,32,32,0.97)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(212,129,58,0.2)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-medium" style={{ color:'var(--fog)' }}>
            <span className="hover:text-amber-400 cursor-pointer transition-colors">{isRTL?'الرئيسية':'Base Camp'}</span>
            <span style={{ color:'var(--amber)' }}>›</span>
            <span className="hover:text-amber-400 cursor-pointer transition-colors">{isRTL?'المعدات':'Gear'}</span>
            <span style={{ color:'var(--amber)' }}>›</span>
            <span style={{ color:'var(--parchment)' }}>{product.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className="w-8 h-8 flex items-center justify-center transition-all hover:scale-110"
              style={{ border:'1px solid var(--border-dark)', backgroundColor:isWishlisted?'var(--clay)':'transparent', color:isWishlisted?'white':'var(--stone)' }}>
              <Heart className={`w-3.5 h-3.5 ${isWishlisted?'fill-current':''}`}/>
            </button>
            <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center"
              style={{ border:'1px solid var(--border-dark)', color:'var(--stone)' }}>
              <Share2 className="w-3.5 h-3.5"/>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase"
              style={{ border:`1px solid ${inStock?'var(--forest-lt)':'var(--clay)'}`, color:inStock?'var(--mint-dk, #34D399)':'var(--amber)', backgroundColor:inStock?'rgba(45,74,45,0.15)':'rgba(139,69,19,0.1)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock?'bg-green-400 animate-pulse':'bg-amber-500'}`}/>
              {inStock?(isRTL?'متوفر':'In Stock'):(isRTL?'نفد':'Sold Out')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative overflow-hidden group" style={{ aspectRatio:'1', backgroundColor:'var(--charcoal-lt)', border:'1px solid var(--border-dark)' }}>
              {allImages.length > 0
                ? <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105" style={{ filter:'brightness(0.9) contrast(1.05) saturate(0.9)' }}/>
                : <div className="w-full h-full flex items-center justify-center topo-bg"><Mountain className="w-20 h-20" style={{ color:'var(--forest-lt)' }}/></div>
              }
              <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(to bottom, transparent 50%, rgba(28,32,32,0.5) 100%)', opacity: 0.7 }}/>
              {discount>0 && (
                <div className="absolute top-4 left-4 w-14 h-14 hex-badge flex items-center justify-center"
                  style={{ backgroundColor:'var(--clay)', boxShadow:'0 4px 16px rgba(139,69,19,0.5)' }}>
                  <span style={{ fontFamily:"'Rye',serif", fontSize:'0.7rem', color:'var(--parchment)', textAlign:'center', lineHeight:1.1 }}>-{discount}%</span>
                </div>
              )}
              <button onClick={toggleWishlist} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor:'rgba(28,32,32,0.9)', border:`1px solid ${isWishlisted?'var(--clay)':'var(--border-dark)'}`, color:isWishlisted?'var(--amber)':'var(--stone)' }}>
                <Heart className={`w-4 h-4 ${isWishlisted?'fill-current':''}`}/>
              </button>
              {allImages.length>1 && (
                <>
                  <button onClick={() => setSelectedImage(p=>p===0?allImages.length-1:p-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ backgroundColor:'rgba(28,32,32,0.9)', border:'1px solid var(--border-dark)', color:'var(--stone)' }}>
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                  <button onClick={() => setSelectedImage(p=>p===allImages.length-1?0:p+1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ backgroundColor:'rgba(28,32,32,0.9)', border:'1px solid var(--border-dark)', color:'var(--stone)' }}>
                    <ChevronRight className="w-4 h-4"/>
                  </button>
                </>
              )}
              {!inStock&&!autoGen&&(
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor:'rgba(28,32,32,0.8)', backdropFilter:'blur(4px)' }}>
                  <div className="px-6 py-3 text-sm font-bold tracking-widest uppercase" style={{ border:'2px solid var(--clay)', color:'var(--amber)', fontFamily:"'Rye',serif" }}>
                    {isRTL?'نفد المخزون':'SOLD OUT'}
                  </div>
                </div>
              )}
            </div>

            {allImages.length>1&&(
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img:string,idx:number)=>(
                  <button key={idx} onClick={()=>setSelectedImage(idx)} className="shrink-0 w-16 h-16 overflow-hidden transition-all"
                    style={{ border:`2px solid ${selectedImage===idx?'var(--amber)':'var(--border-dark)'}`, opacity:selectedImage===idx?1:0.5 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" style={{ filter:'brightness(0.85)' }}/>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon:<ShieldCheck className="w-4 h-4"/>, l:isRTL?'مضمون':'Trail Tested'   },
                { icon:<Truck className="w-4 h-4"/>,       l:isRTL?'توصيل سريع':'Fast Ship' },
                { icon:<Mountain className="w-4 h-4"/>,    l:isRTL?'متين':'Rugged Built'    },
              ].map((b,i)=>(
                <div key={i} className="flex flex-col items-center gap-1.5 py-4 transition-colors hover:bg-green-900/10"
                  style={{ border:'1px solid var(--border-dark)', backgroundColor:'var(--charcoal-lt)' }}>
                  <span style={{ color:'var(--amber)' }}>{b.icon}</span>
                  <span className="text-[9px] font-bold tracking-wider text-center uppercase" style={{ color:'var(--fog)' }}>{b.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info + Form */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-0.5" style={{ background:'var(--amber)' }}/>
                <span className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color:'var(--amber)' }}>
                  {isRTL?'المنتج':'FIELD GEAR'}
                </span>
              </div>
              <h1 className="leading-tight mb-3" style={{ fontFamily:"'Rye',serif", fontSize:'clamp(1.8rem,3.5vw,2.8rem)', color:'var(--parchment)', letterSpacing:'0.04em' }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{[...Array(5)].map((_,i)=><Star key={i} className={`w-3.5 h-3.5 ${i<4?'fill-current':''}`} style={{ color:'var(--amber)' }}/>)}</div>
                <span className="text-xs font-medium" style={{ color:'var(--fog)' }}>4.8 (128 {isRTL?'تقييم':'reviews'})</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-5 relative" style={{ border:'1px solid rgba(212,129,58,0.3)', backgroundColor:'rgba(45,74,45,0.1)' }}>
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background:'var(--amber)' }}/>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2 pl-4" style={{ color:'var(--fog)' }}>{isRTL?'السعر':'PRICE'}</p>
              <div className="flex items-baseline gap-3 pl-4">
                <span className="font-bold" style={{ fontFamily:"'Rye',serif", fontSize:'3.2rem', color:'var(--amber)', lineHeight:1 }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span className="text-sm font-medium" style={{ color:'var(--fog)' }}>دج</span>
                {product.priceOriginal&&parseFloat(product.priceOriginal)>finalPrice&&(
                  <div>
                    <span className="text-sm line-through block" style={{ color:'var(--stone-dk)' }}>{parseFloat(product.priceOriginal).toLocaleString()} دج</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:'var(--clay-lt)' }}>Save {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase"
              style={{ border:`1px solid ${autoGen?'rgba(212,129,58,0.4)':inStock?'rgba(61,107,61,0.5)':'var(--clay)'}`, color:autoGen?'var(--amber)':inStock?'#6EE7B7':'var(--amber)', backgroundColor:autoGen?'rgba(212,129,58,0.06)':inStock?'rgba(45,74,45,0.15)':'rgba(139,69,19,0.1)' }}>
              {autoGen?<Infinity className="w-3.5 h-3.5"/>:inStock?<span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>:<X className="w-3.5 h-3.5"/>}
              {autoGen?(isRTL?'مخزون غير محدود':'Unlimited Stock'):inStock?(isRTL?'متوفر':'In Stock'):(isRTL?'نفد':'Sold Out')}
            </div>

            {/* Offers */}
            {product.offers?.length>0&&(
              <div>
                <TrailDivider/>
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color:'var(--amber)' }}>
                  {isRTL?'▶ اختر الباقة':'▶ SELECT PACKAGE'}
                </p>
                <div className="space-y-2">
                  {product.offers.map((offer:any)=>(
                    <label key={offer.id} className="flex items-center justify-between p-4 cursor-pointer transition-all"
                      style={{ border:`1px solid ${selectedOffer===offer.id?'var(--amber)':'var(--border-dark)'}`, backgroundColor:selectedOffer===offer.id?'rgba(212,129,58,0.06)':'var(--charcoal-lt)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center" style={{ border:`1px solid ${selectedOffer===offer.id?'var(--amber)':'var(--border-dark)'}` }}>
                          {selectedOffer===offer.id&&<div className="w-2 h-2" style={{ backgroundColor:'var(--amber)' }}/>}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} className="sr-only"/>
                        <div>
                          <p className="text-sm font-medium" style={{ color:'var(--parchment)' }}>{offer.name}</p>
                          <p className="text-[10px] font-medium" style={{ color:'var(--fog)' }}>Qty: {offer.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold" style={{ fontFamily:"'Rye',serif", fontSize:'1.3rem', color:'var(--amber)' }}>{offer.price.toLocaleString()} <span className="text-xs">دج</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr:any)=>(
              <div key={attr.id}>
                <TrailDivider/>
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color:'var(--amber)' }}>▶ {attr.name}</p>
                {attr.displayMode==='color'?(
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any)=>{
                      const s=selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} className="w-9 h-9 transition-all hover:scale-110"
                        style={{ backgroundColor:v.value, boxShadow:s?`0 0 0 2px var(--charcoal),0 0 0 4px var(--amber)`:'none', transform:s?'scale(1.1)':'scale(1)' }}/>;
                    })}
                  </div>
                ):attr.displayMode==='image'?(
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any)=>{
                      const s=selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} className="w-14 h-14 overflow-hidden transition-all"
                        style={{ border:`2px solid ${s?'var(--amber)':'var(--border-dark)'}`, opacity:s?1:0.55 }}><img src={v.value} alt={v.name} className="w-full h-full object-cover"/></button>;
                    })}
                  </div>
                ):(
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v:any)=>{
                      const s=selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} className="px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-all"
                        style={{ border:`1px solid ${s?'var(--amber)':'var(--border-dark)'}`, backgroundColor:s?'rgba(212,129,58,0.1)':'transparent', color:s?'var(--amber)':'var(--stone)' }}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>
          </div>
        </div>

        {product.desc&&(
          <section className="mt-20 pt-12" style={{ borderTop:'1px solid var(--border-dark)' }}>
            <TrailDivider/>
            <h2 className="flex items-center gap-3 mb-8" style={{ fontFamily:"'Rye',serif", fontSize:'1.8rem', color:'var(--parchment)', letterSpacing:'0.04em' }}>
              <Map className="w-6 h-6" style={{ color:'var(--amber)' }}/> {isRTL?'تفاصيل المعدات':'Gear Specifications'}
            </h2>
            <div className="p-8 topo-bg" style={{ border:'1px solid var(--border-dark)' }}>
              <div className="text-sm font-medium leading-relaxed" style={{ color:'var(--stone)' }}
                dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc,{ ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','span'],ALLOWED_ATTR:['class','style'] })}}/>
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
  width:'100%', padding:'11px 16px', fontSize:'0.875rem', fontWeight:500,
  backgroundColor:'var(--charcoal)', border:`1px solid ${err?'var(--clay)':'var(--border-dark)'}`,
  color:'var(--parchment)', outline:'none', fontFamily:"'Cabin',sans-serif",
  transition:'border-color 0.25s, box-shadow 0.25s',
});
const FieldWrapper = ({ error, label, children }: { error?:string; label?:string; children:React.ReactNode }) => (
  <div className="space-y-1.5">
    {label&&<label className="block text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color:'var(--fog)' }}>{label}</label>}
    {children}
    {error&&<p className="text-xs font-medium flex items-center gap-1" style={{ color:'var(--amber)' }}><AlertCircle className="w-3 h-3"/>{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,setWilayas] = useState<Wilaya[]>([]);
  const [communes,setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes,setLoadingCommunes] = useState(false);
  const [formData,setFormData] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [formErrors,setFormErrors] = useState<Record<string,string>>({});
  const [submitting,setSubmitting] = useState(false);

  useEffect(()=>{ if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(()=>{ if(typeof window!=='undefined'){ const id=localStorage.getItem('customerId'); if(id) setFormData(p=>({...p,customerId:id})); } },[]);
  useEffect(()=>{ if(!formData.customerWelaya){setCommunes([]);return;} setLoadingCommunes(true); fetchCommunes(formData.customerWelaya).then(d=>{setCommunes(d);setLoadingCommunes(false);}); },[formData.customerWelaya]);

  const selectedWilayaData=useMemo(()=>wilayas.find(w=>String(w.id)===String(formData.customerWelaya)),[wilayas,formData.customerWelaya]);
  const getFinalPrice=useCallback(():number=>{
    const base=typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const offer=product.offers?.find(o=>o.id===selectedOffer);
    if(offer) return offer.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){ const m=product.variantDetails.find(v=>variantMatches(v,selectedVariants)); if(m&&m.price!==-1) return m.price; }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getPriceLivraison=useCallback(():number=>{ if(!selectedWilayaData) return 0; return formData.typeLivraison==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice; },[selectedWilayaData,formData.typeLivraison]);
  useEffect(()=>{ if(selectedWilayaData) setFormData(f=>({...f,priceLoss:selectedWilayaData.livraisonReturn})); },[selectedWilayaData]);

  const finalPrice=getFinalPrice();
  const getTotalPrice=()=>finalPrice*formData.quantity+getPriceLivraison();
  const validate=()=>{
    const e:Record<string,string>={};
    if(!formData.customerName.trim())  e.customerName='الاسم مطلوب';
    if(!formData.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!formData.customerWelaya)       e.customerWelaya='الولاية مطلوبة';
    if(!formData.customerCommune)      e.customerCommune='البلدية مطلوبة';
    return e;
  };
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault(); const errs=validate(); if(Object.keys(errs).length){setFormErrors(errs);return;} setFormErrors({}); setSubmitting(true);
    try { await axios.post(`${API_URL}/orders/create`,{ ...formData, productId:product.id, storeId:product.store.id, userId, selectedOffer, selectedVariants, platform:platform||'store', finalPrice, totalPrice:getTotalPrice(), priceLivraison:getPriceLivraison() }); if(typeof window!=='undefined'&&formData.customerId) localStorage.setItem('customerId',formData.customerId); router.push(`/lp/${domain}/successfully`); } catch(err){console.error(err);} finally{setSubmitting(false);}
  };
  const onFocus=(e:React.FocusEvent<any>)=>{ e.target.style.borderColor='var(--amber)'; e.target.style.boxShadow='0 0 0 3px rgba(212,129,58,0.12)'; };
  const onBlur=(e:React.FocusEvent<any>,err?:boolean)=>{ e.target.style.borderColor=err?'var(--clay)':'var(--border-dark)'; e.target.style.boxShadow='none'; };

  return (
    <div style={{ borderTop:'1px solid var(--border-dark)', paddingTop:'1.5rem' }}>
      <TrailDivider/>
      <h3 className="flex items-center gap-2 mb-6 font-bold" style={{ fontFamily:"'Rye',serif", fontSize:'1.1rem', color:'var(--parchment)', letterSpacing:'0.04em' }}>
        <Package className="w-4 h-4" style={{ color:'var(--amber)' }}/> Deploy Order
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerName} label="Field Name">
            <div className="relative">
              <User className="absolute right-3 top-3 w-3.5 h-3.5" style={{ color:'var(--fog)' }}/>
              <input type="text" value={formData.customerName} onChange={e=>setFormData({...formData,customerName:e.target.value})} placeholder="اسمك الكامل" style={{ ...inputSt(!!formErrors.customerName), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerName)}/>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerPhone} label="Radio Freq.">
            <div className="relative">
              <Phone className="absolute right-3 top-3 w-3.5 h-3.5" style={{ color:'var(--fog)' }}/>
              <input type="tel" value={formData.customerPhone} onChange={e=>setFormData({...formData,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" style={{ ...inputSt(!!formErrors.customerPhone), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerPhone)}/>
            </div>
          </FieldWrapper>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerWelaya} label="Province">
            <div className="relative">
              <MapPin className="absolute right-3 top-3 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--fog)' }}/>
              <ChevronDown className="absolute left-3 top-3 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--fog)' }}/>
              <select value={formData.customerWelaya} onChange={e=>setFormData({...formData,customerWelaya:e.target.value,customerCommune:''})} style={{ ...inputSt(!!formErrors.customerWelaya), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer' }}>
                <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerCommune} label="Camp Zone">
            <div className="relative">
              <MapPin className="absolute right-3 top-3 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--fog)' }}/>
              <ChevronDown className="absolute left-3 top-3 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--fog)' }}/>
              <select value={formData.customerCommune} disabled={!formData.customerWelaya||loadingCommunes} onChange={e=>setFormData({...formData,customerCommune:e.target.value})} style={{ ...inputSt(!!formErrors.customerCommune), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer', opacity:!formData.customerWelaya?0.45:1 }}>
                <option value="">{loadingCommunes?'Locating…':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color:'var(--fog)' }}>Supply Route</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home','office'] as const).map(type=>(
              <button key={type} type="button" onClick={()=>setFormData(p=>({...p,typeLivraison:type}))} className="flex flex-col items-center gap-2 py-5 transition-all btn-trail"
                style={{ border:`1px solid ${formData.typeLivraison===type?'var(--amber)':'var(--border-dark)'}`, backgroundColor:formData.typeLivraison===type?'rgba(212,129,58,0.06)':'var(--charcoal)' }}>
                {type==='home'
                  ? <Tent className="w-5 h-5" style={{ color:formData.typeLivraison===type?'var(--amber)':'var(--fog)' }}/>
                  : <Building2 className="w-5 h-5" style={{ color:formData.typeLivraison===type?'var(--amber)':'var(--fog)' }}/>
                }
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color:formData.typeLivraison===type?'var(--amber)':'var(--fog)' }}>
                  {type==='home'?'Home Drop':'Office Point'}
                </p>
                {selectedWilayaData&&<p className="text-xs font-medium" style={{ color:'var(--stone)' }}>{(type==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice).toLocaleString()} دج</p>}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <FieldWrapper label="Unit Count">
          <div className="flex items-center gap-4">
            <button type="button" onClick={()=>setFormData(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} className="w-10 h-10 flex items-center justify-center text-xl font-bold transition-all hover:border-amber-500" style={{ border:'1px solid var(--border-dark)', color:'var(--amber)', backgroundColor:'var(--charcoal)' }}>−</button>
            <span className="w-12 text-center font-bold text-2xl" style={{ fontFamily:"'Rye',serif", color:'var(--parchment)' }}>{formData.quantity}</span>
            <button type="button" onClick={()=>setFormData(p=>({...p,quantity:p.quantity+1}))} className="w-10 h-10 flex items-center justify-center text-xl font-bold transition-all hover:border-amber-500" style={{ border:'1px solid var(--border-dark)', color:'var(--amber)', backgroundColor:'var(--charcoal)' }}>+</button>
          </div>
        </FieldWrapper>

        {/* Summary */}
        <div className="p-5 relative topo-bg" style={{ border:'1px solid rgba(212,129,58,0.25)' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg, var(--amber), transparent)' }}/>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color:'var(--amber)' }}>▶ Mission Summary</p>
          <div className="space-y-2.5">
            {[{l:'Gear Item',v:product.name},{l:'Unit Price',v:`${finalPrice.toLocaleString()} دج`},{l:'Qty',v:`× ${formData.quantity}`},{l:'Logistics',v:selectedWilayaData?`${getPriceLivraison().toLocaleString()} دج`:'TBD'}].map(row=>(
              <div key={row.l} className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color:'var(--fog)' }}>{row.l}</span>
                <span className="text-xs font-medium" style={{ color:'var(--stone)' }}>{row.v}</span>
              </div>
            ))}
            <div className="pt-3" style={{ borderTop:'1px solid var(--border-dark)' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color:'var(--amber)' }}>TOTAL COST</span>
                <span className="font-bold" style={{ fontFamily:"'Rye',serif", fontSize:'2rem', color:'var(--amber)' }}>
                  {getTotalPrice().toLocaleString()}<span className="text-sm ml-1">دج</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-trail w-full py-4 flex items-center justify-center gap-3 text-sm font-bold tracking-widest uppercase text-white transition-all"
          style={{ backgroundColor:submitting?'var(--smoke)':'var(--forest)', border:`1px solid ${submitting?'var(--border-dark)':'var(--amber)'}`, color:submitting?'var(--fog)':'var(--amber)', clipPath:'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)', cursor:submitting?'not-allowed':'pointer' }}>
          {submitting
            ?<><div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"/> Deploying…</>
            :<><Compass className="w-4 h-4"/> Confirm & Deploy</>
          }
        </button>

        <p className="text-[10px] text-center font-medium flex items-center justify-center gap-1.5" style={{ color:'var(--fog)' }}>
          <ShieldCheck className="w-3 h-3" style={{ color:'var(--forest-lt)' }}/> Secure & encrypted checkout
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

function PageWrapper({ children, icon, title, subtitle }: { children:React.ReactNode; icon:React.ReactNode; title:string; subtitle:string }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--charcoal)', fontFamily:"'Cabin',sans-serif" }}>
      <div className="relative overflow-hidden topo-bg py-20">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around pointer-events-none px-8 opacity-25">
          {[50,65,42,58,48].map((h,i) => <PineTree key={i} height={h} color="var(--forest-lt)" sway/>)}
        </div>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg, var(--forest), var(--amber), var(--clay), var(--amber), var(--forest))' }}/>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-5" style={{ backgroundColor:'var(--forest)', border:'2px solid var(--amber)', clipPath:'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)', color:'var(--amber)' }}>{icon}</div>
          <h1 className="font-bold mb-3" style={{ fontFamily:"'Rye',serif", fontSize:'clamp(2rem,5vw,4rem)', color:'var(--parchment)', letterSpacing:'0.05em' }}>{title}</h1>
          <p className="text-sm font-medium mx-auto" style={{ color:'var(--stone)', maxWidth:'420px' }}>{subtitle}</p>
        </div>
        {/* Terrain cut */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 30" preserveAspectRatio="none" style={{ width:'100%',height:'30px',display:'block' }}>
            <path d="M0,30 L0,10 L120,20 L240,5 L360,18 L480,3 L600,16 L720,2 L840,15 L960,1 L1080,14 L1200,4 L1320,17 L1440,8 L1440,30 Z" fill="var(--charcoal)"/>
          </svg>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">{children}</div>
    </div>
  );
}

function InfoCard({ icon, title, desc, status }: { icon:React.ReactNode; title:string; desc:string; status?:string }) {
  const isActive = status==='دائماً نشطة'||status==='Always Active';
  return (
    <div className="group flex gap-5 p-6 mb-3 transition-all duration-300"
      style={{ border:'1px solid var(--border-dark)', backgroundColor:'var(--charcoal-lt)' }}
      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--amber)';el.style.backgroundColor='rgba(212,129,58,0.05)';el.style.transform='translateX(4px)';}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border-dark)';el.style.backgroundColor='var(--charcoal-lt)';el.style.transform='none';}}>
      <div className="w-2 self-stretch flex-shrink-0" style={{ background:'linear-gradient(180deg, var(--amber), transparent)' }}/>
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor:'rgba(45,74,45,0.4)', color:'var(--amber)' }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="font-bold tracking-wide" style={{ fontFamily:"'Rye',serif", fontSize:'1rem', color:'var(--parchment)', letterSpacing:'0.04em' }}>{title}</h3>
          {status&&<span className="text-[9px] font-bold tracking-widest uppercase px-3 py-1" style={{ backgroundColor:isActive?'rgba(45,74,45,0.3)':'rgba(212,129,58,0.1)', border:`1px solid ${isActive?'var(--forest-lt)':'rgba(212,129,58,0.4)'}`, color:isActive?'#6EE7B7':'var(--amber)' }}>{status}</span>}
        </div>
        <p className="text-sm font-medium leading-relaxed" style={{ color:'var(--stone)' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper icon={<ShieldCheck size={22}/>} title="Privacy Policy" subtitle="Your data stays in your hands. Here's our full transparency report.">
      <InfoCard icon={<Database size={16}/>} title="Data Collected"   desc="We collect only what's needed — name, contact, and order details — to get your gear delivered safely."/>
      <InfoCard icon={<Lock size={16}/>}     title="Security"         desc="Military-grade encryption protects your personal data from unauthorized access at all times."/>
      <InfoCard icon={<Globe size={16}/>}    title="Data Sharing"     desc="We never sell your data. Sharing is limited to trusted logistics partners for order fulfillment only."/>
      <InfoCard icon={<Bell size={16}/>}     title="Policy Updates"   desc="We'll notify you of any significant changes to how we handle your data."/>
      <div className="mt-8 p-5 flex items-center gap-3" style={{ border:'1px solid rgba(45,74,45,0.4)', backgroundColor:'rgba(45,74,45,0.08)' }}>
        <CheckCircle2 size={14} style={{ color:'#6EE7B7', flexShrink:0 }}/>
        <p className="text-xs font-medium" style={{ color:'var(--stone)' }}>Last reviewed: February 2026. We audit our privacy practices regularly.</p>
        <span className="ml-auto text-[10px] font-medium whitespace-nowrap" style={{ color:'var(--fog)' }}>Ver. 2.1</span>
      </div>
    </PageWrapper>
  );
}
export function Terms() {
  return (
    <PageWrapper icon={<Scale size={22}/>} title="Terms of Service" subtitle="Clear, fair rules for a great expedition together.">
      <InfoCard icon={<CheckCircle2 size={16}/>} title="Account Rules"         desc="Keep your credentials secure. You're responsible for all activity under your account."/>
      <InfoCard icon={<CreditCard size={16}/>}   title="Pricing & Payments"    desc="All prices are displayed transparently. No surprise charges — what you see is what you pay."/>
      <InfoCard icon={<Ban size={16}/>}           title="Prohibited Activity"   desc="Counterfeit or unsafe goods are strictly prohibited. Violations result in immediate account suspension."/>
      <InfoCard icon={<Scale size={16}/>}         title="Legal Jurisdiction"    desc="These terms are governed by Algerian law. Any disputes fall under local court jurisdiction."/>
      <div className="mt-8 p-5 flex items-start gap-3" style={{ border:'1px solid rgba(212,129,58,0.25)', backgroundColor:'rgba(212,129,58,0.05)' }}>
        <AlertCircle size={14} style={{ color:'var(--amber)', flexShrink:0, marginTop:2 }}/>
        <p className="text-xs font-medium leading-relaxed" style={{ color:'var(--stone)' }}>We reserve the right to update these terms. Continued use means acceptance of any changes.</p>
      </div>
    </PageWrapper>
  );
}
export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={22}/>} title="Cookie Policy" subtitle="Small trackers, big transparency. Here's exactly what we deploy.">
      <InfoCard icon={<ShieldCheck size={16}/>}   title="Essential Cookies"  desc="Required for login, cart, and core functionality. These cannot be disabled without breaking the site." status="Always Active"/>
      <InfoCard icon={<Settings size={16}/>}      title="Preference Cookies" desc="Remember your language, region, and display settings across sessions." status="Optional"/>
      <InfoCard icon={<MousePointer2 size={16}/>} title="Analytics Cookies"  desc="Help us understand how customers navigate the store so we can improve the experience." status="Optional"/>
      <div className="mt-8 p-6 relative overflow-hidden" style={{ background:'rgba(45,74,45,0.15)', border:'1px solid rgba(45,74,45,0.35)' }}>
        <div className="absolute top-0 left-0 w-1 h-full" style={{ background:'var(--amber)' }}/>
        <div className="flex gap-4 items-start pl-4">
          <ToggleRight size={18} style={{ color:'var(--amber)', flexShrink:0, marginTop:2 }}/>
          <div>
            <h3 className="font-bold mb-2" style={{ fontFamily:"'Rye',serif", fontSize:'1rem', color:'var(--parchment)', letterSpacing:'0.04em' }}>Control Your Tracking</h3>
            <p className="text-xs font-medium leading-relaxed" style={{ color:'var(--stone)' }}>Adjust cookie settings through your browser at any time. Some optional cookies can be disabled without affecting core functionality.</p>
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
    { icon:<Mail className="w-4 h-4"/>,   label:'Signal',   value:'gear@outdooradv.dz',  href:'mailto:gear@outdooradv.dz' },
    { icon:<Phone className="w-4 h-4"/>,  label:'Radio',    value:'+213 550 123 456',     href:'tel:+213550123456'         },
    { icon:<MapPin className="w-4 h-4"/>, label:'Base Camp',value:'Alger, Algérie',       href:undefined                   },
  ];
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--charcoal)', fontFamily:"'Cabin',sans-serif" }}>
      <div className="relative overflow-hidden topo-bg py-24">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around pointer-events-none px-8 opacity-20">
          {[52,68,44,60,50].map((h,i)=><PineTree key={i} height={h} color="var(--forest-lt)" sway/>)}
        </div>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg, var(--forest), var(--amber), var(--clay), var(--amber), var(--forest))' }}/>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <CompassRose size={64} animate={true}/>
          <h1 className="mt-5 font-bold mb-3" style={{ fontFamily:"'Rye',serif", fontSize:'clamp(2.5rem,6vw,5rem)', color:'var(--parchment)', letterSpacing:'0.05em' }}>
            SEND A SIGNAL
          </h1>
          <TrailDivider/>
          <p className="text-sm font-medium" style={{ color:'var(--stone)' }}>We're out in the field — but we always respond.</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 30" preserveAspectRatio="none" style={{ width:'100%',height:'30px',display:'block' }}>
            <path d="M0,30 L0,10 L120,20 L240,5 L360,18 L480,3 L600,16 L720,2 L840,15 L960,1 L1080,14 L1200,4 L1320,17 L1440,8 L1440,30 Z" fill="var(--charcoal)"/>
          </svg>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-bold mb-8 flex items-center gap-3" style={{ fontFamily:"'Rye',serif", fontSize:'1.6rem', color:'var(--parchment)', letterSpacing:'0.04em' }}>
              <Navigation className="w-5 h-5" style={{ color:'var(--amber)' }}/> Reach HQ
            </h2>
            <div className="space-y-3">
              {contacts.map(item=>(
                <a key={item.label} href={item.href||'#'} className="group flex items-center gap-4 p-5 transition-all"
                  style={{ border:'1px solid var(--border-dark)', backgroundColor:'var(--charcoal-lt)', textDecoration:'none' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--amber)';el.style.backgroundColor='rgba(212,129,58,0.05)';el.style.transform='translateX(4px)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border-dark)';el.style.backgroundColor='var(--charcoal-lt)';el.style.transform='none';}}>
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor:'rgba(45,74,45,0.4)', color:'var(--amber)' }}>{item.icon}</div>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color:'var(--fog)' }}>{item.label}</p>
                    <p className="text-sm font-medium" style={{ color:'var(--parchment)' }}>{item.value}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:'var(--amber)' }}/>
                </a>
              ))}
            </div>
            <div className="mt-8 p-6 relative overflow-hidden" style={{ backgroundColor:'var(--forest-dk)', border:'1px solid rgba(212,129,58,0.25)' }}>
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background:'linear-gradient(180deg, var(--amber), transparent)' }}/>
              <Flame className="w-6 h-6 mb-3 pl-4" style={{ color:'var(--amber)', animation:'ember-flicker 2s ease-in-out infinite' }}/>
              <p className="font-bold pl-4" style={{ fontFamily:"'Rye',serif", fontSize:'1rem', color:'var(--parchment)', letterSpacing:'0.04em' }}>
                Response time: 24 hours
              </p>
              <p className="text-xs font-medium mt-1 pl-4" style={{ color:'var(--stone)' }}>We respond to all field requests within one business day.</p>
            </div>
          </div>

          <div>
            <h2 className="font-bold mb-8 flex items-center gap-3" style={{ fontFamily:"'Rye',serif", fontSize:'1.6rem', color:'var(--parchment)', letterSpacing:'0.04em' }}>
              <Map className="w-5 h-5" style={{ color:'var(--amber)' }}/> Field Report
            </h2>
            {sent?(
              <div className="p-10 text-center topo-bg" style={{ border:'1px solid rgba(45,74,45,0.5)' }}>
                <Compass className="w-12 h-12 mx-auto mb-4" style={{ color:'var(--amber)', animation:'compass-spin 3s linear infinite' }}/>
                <p className="font-bold text-xl mb-1" style={{ fontFamily:"'Rye',serif", color:'var(--parchment)', letterSpacing:'0.04em' }}>Signal Received</p>
                <p className="text-sm font-medium" style={{ color:'var(--stone)' }}>We'll respond within 24 hours.</p>
              </div>
            ):(
              <form onSubmit={e=>{e.preventDefault();setSent(true);}} className="space-y-4">
                {[{label:'Operator Name',type:'text',val:formState.name,ph:'Your name',key:'name'},{label:'Frequency / Email',type:'email',val:formState.email,ph:'your@email.com',key:'email'}].map(f=>(
                  <FieldWrapper key={f.key} label={f.label}>
                    <input type={f.type} value={f.val} onChange={e=>setFormState({...formState,[f.key]:e.target.value})} placeholder={f.ph} style={inputSt()} required onFocus={e=>{e.target.style.borderColor='var(--amber)';e.target.style.boxShadow='0 0 0 3px rgba(212,129,58,0.12)';}} onBlur={e=>{e.target.style.borderColor='var(--border-dark)';e.target.style.boxShadow='none';}}/>
                  </FieldWrapper>
                ))}
                <FieldWrapper label="Message">
                  <textarea value={formState.message} onChange={e=>setFormState({...formState,message:e.target.value})} placeholder="What's your mission?" rows={5} style={{ ...inputSt(), resize:'none' as any }} required onFocus={e=>{e.target.style.borderColor='var(--amber)';e.target.style.boxShadow='0 0 0 3px rgba(212,129,58,0.12)';}} onBlur={e=>{e.target.style.borderColor='var(--border-dark)';e.target.style.boxShadow='none';}}/>
                </FieldWrapper>
                <button type="submit" className="btn-trail w-full py-4 flex items-center justify-center gap-2 text-sm font-bold tracking-widest uppercase"
                  style={{ backgroundColor:'var(--forest)', border:'1px solid var(--amber)', color:'var(--amber)', clipPath:'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)' }}>
                  <Compass className="w-4 h-4"/> Transmit Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}//عدل تقسيم الصفحة .moderne