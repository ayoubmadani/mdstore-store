'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Infinity, Share2, MapPin, Phone,
  User, ShieldCheck, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Shield, ArrowRight, Mountain, Wind, Thermometer, Compass,
  Target, Zap, Award,
} from 'lucide-react';
import { Store } from '@/types/store';
import { customLengthName } from '@/hallper/theme-hallper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

// ─── DESIGN SYSTEM ────────────────────────────────────────────
const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --slate:     #0F1923;
    --slate-lt:  #1A2836;
    --slate-md:  #253547;
    --rust:      #C4421A;
    --rust-lt:   #E05A2E;
    --rust-dk:   #9E3214;
    --ice:       #78C4D0;
    --ice-lt:    #A8DCE6;
    --ice-dk:    #4E9EAA;
    --moss:      #3D5A3E;
    --moss-lt:   #5A7D5B;
    --sand:      #C8A97E;
    --sand-lt:   #DEC49A;
    --stone:     #8A9BA8;
    --stone-lt:  #B2C0CA;
    --cream:     #F0EAE0;
    --cream-dk:  #DDD5C8;
    --text-h:    #F0EAE0;
    --text-b:    #C8D4DC;
    --text-dim:  #7A8E9A;
    --border:    rgba(120,196,208,0.18);
    --border-lt: rgba(120,196,208,0.30);
    --glow-rust: rgba(196,66,26,0.35);
    --glow-ice:  rgba(120,196,208,0.25);
  }

  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background: var(--slate); }
  ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,var(--rust),var(--ice)); border-radius:0; }

  @keyframes snow-fall {
    0%   { opacity:0; transform: translateY(-15px) rotate(0deg); }
    12%  { opacity:0.8; }
    88%  { opacity:0.3; }
    100% { opacity:0; transform: translateY(105vh) rotate(720deg) translateX(20px); }
  }
  @keyframes crosshair-spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  @keyframes pulse-rust {
    0%,100% { box-shadow: 0 0 0 0 var(--glow-rust); }
    50%     { box-shadow: 0 0 0 8px transparent; }
  }
  @keyframes slide-up   { from{opacity:0;transform:translateY(32px);} to{opacity:1;transform:translateY(0);} }
  @keyframes slide-in-l { from{opacity:0;transform:translateX(-32px);} to{opacity:1;transform:translateX(0);} }
  @keyframes scan-line  { 0%{top:-100%;} 100%{top:200%;} }
  @keyframes altitude-fill { from{stroke-dashoffset:220;} to{stroke-dashoffset:0;} }
  @keyframes marquee-gear { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
  @keyframes blink-dot { 0%,100%{opacity:1;} 50%{opacity:0.2;} }
  @keyframes compass-needle { 0%,100%{transform:rotate(-8deg);} 50%{transform:rotate(8deg);} }

  .slide-up    { animation: slide-up   0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .slide-in-l  { animation: slide-in-l 0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .slide-up-d1 { animation-delay:0.1s; }
  .slide-up-d2 { animation-delay:0.25s; }
  .slide-up-d3 { animation-delay:0.42s; }
  .slide-up-d4 { animation-delay:0.6s; }

  /* Topographic line bg */
  .topo-bg {
    background-image: repeating-radial-gradient(
      ellipse 80% 60% at 60% 45%,
      transparent 0px, transparent 18px,
      rgba(120,196,208,0.055) 18px, rgba(120,196,208,0.055) 19px,
      transparent 19px, transparent 38px,
      rgba(120,196,208,0.04) 38px, rgba(120,196,208,0.04) 39px
    );
  }

  /* Grid crosshair pattern */
  .crosshair-grid {
    background-image:
      linear-gradient(rgba(120,196,208,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(120,196,208,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* Diagonal slash cut */
  .slash-bottom {
    clip-path: polygon(0 0, 100% 0, 100% 82%, 0 100%);
  }
  .slash-top {
    clip-path: polygon(0 10%, 100% 0, 100% 100%, 0 100%);
  }

  /* Card accent border */
  .card-alpine {
    position: relative;
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease;
  }
  .card-alpine::before {
    content:''; position:absolute; left:0; top:0; width:4px; height:100%;
    background: linear-gradient(180deg, var(--rust), var(--ice));
    transition: width 0.3s ease;
  }
  .card-alpine:hover { transform: translateX(4px) translateY(-4px); box-shadow: -4px 12px 40px rgba(196,66,26,0.25); }
  .card-alpine:hover::before { width:6px; }

  /* Technical button */
  .btn-alpine {
    position:relative; overflow:hidden; clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%);
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
    letter-spacing: 0.12em;
  }
  .btn-alpine:hover { transform: translateY(-2px); filter: brightness(1.1); }
  .btn-alpine:active { transform: scale(0.97); }

  /* Spec label */
  .spec-label {
    font-family: 'DM Sans', sans-serif; font-size:9px; font-weight:700;
    letter-spacing:0.22em; text-transform:uppercase; color:var(--text-dim);
  }

  /* Scan line effect on hero */
  .scan-overlay::after {
    content:''; position:absolute; left:0; width:100%; height:2px;
    background: linear-gradient(transparent, rgba(120,196,208,0.15), transparent);
    animation: scan-line 4s linear infinite;
    pointer-events:none;
  }

  .marquee-wrap  { overflow:hidden; white-space:nowrap; }
  .marquee-inner { display:inline-block; animation: marquee-gear 22s linear infinite; }

  .tag-alpine {
    display:inline-flex; align-items:center; gap:5px;
    padding: 3px 10px; font-size:9px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;
    font-family:'DM Sans',sans-serif;
    background: rgba(196,66,26,0.15); border: 1px solid rgba(196,66,26,0.4); color:var(--rust-lt);
  }

  .noise-overlay::before {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity:0.05; mix-blend-mode:screen;
  }
`;

// ─── SVG COMPONENTS ───────────────────────────────────────────

function MountainRange({ width=800, height=160, color='rgba(120,196,208,0.12)', accent='rgba(196,66,26,0.25)' }: any) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" preserveAspectRatio="none" style={{ display:'block' }}>
      {/* Back range */}
      <polygon points={`0,${height} 80,60 160,100 260,30 380,80 480,20 600,70 700,35 ${width},90 ${width},${height}`} fill={color}/>
      {/* Front range */}
      <polygon points={`0,${height} 100,90 200,120 320,55 440,100 540,45 660,95 760,60 ${width},110 ${width},${height}`} fill={accent}/>
      {/* Snow caps */}
      <polygon points="260,30 240,50 280,50"   fill="rgba(240,234,224,0.5)"/>
      <polygon points="480,20 462,42 498,42"   fill="rgba(240,234,224,0.55)"/>
      <polygon points="700,35 682,56 718,56"   fill="rgba(240,234,224,0.45)"/>
    </svg>
  );
}

function Crosshair({ size=80, color='rgba(120,196,208,0.5)', spin=false }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none"
      style={{ animation: spin ? 'crosshair-spin 12s linear infinite' : 'none' }}>
      <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="1" strokeDasharray="4 6"/>
      <circle cx="40" cy="40" r="20" stroke={color} strokeWidth="1"/>
      <circle cx="40" cy="40" r="3"  fill={color}/>
      <line x1="40" y1="4"  x2="40" y2="18" stroke={color} strokeWidth="1.5"/>
      <line x1="40" y1="62" x2="40" y2="76" stroke={color} strokeWidth="1.5"/>
      <line x1="4"  y1="40" x2="18" y2="40" stroke={color} strokeWidth="1.5"/>
      <line x1="62" y1="40" x2="76" y2="40" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function DiamondDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ background:'linear-gradient(90deg, transparent, var(--rust))' }}/>
      <div className="w-3 h-3 rotate-45" style={{ backgroundColor:'var(--rust)', boxShadow:'0 0 10px var(--glow-rust)' }}/>
      <div className="flex-1 h-px" style={{ background:'linear-gradient(90deg, var(--rust), transparent)' }}/>
    </div>
  );
}

function FallingSnow() {
  const flakes = useMemo(() => Array.from({ length:20 }, (_,i) => ({
    id: i,
    left:     `${(i * 5.1) % 100}%`,
    delay:    `${(i * 0.55) % 12}s`,
    duration: `${10 + (i * 0.8) % 10}s`,
    size:     3 + (i * 0.7) % 6,
    shape:    i % 3, // 0=circle, 1=star, 2=diamond
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
      {flakes.map(f => (
        <div key={f.id} style={{ position:'absolute', left:f.left, top:'-15px', opacity:0,
          animation:`snow-fall ${f.duration} ${f.delay} ease-in infinite` }}>
          {f.shape === 0 && <div style={{ width:f.size, height:f.size, borderRadius:'50%', backgroundColor:'rgba(240,234,224,0.7)' }}/>}
          {f.shape === 1 && (
            <svg width={f.size+4} height={f.size+4} viewBox="0 0 12 12" fill="none">
              <line x1="6" y1="0" x2="6" y2="12" stroke="rgba(168,220,230,0.7)" strokeWidth="1.5"/>
              <line x1="0" y1="6" x2="12" y2="6" stroke="rgba(168,220,230,0.7)" strokeWidth="1.5"/>
              <line x1="1.8" y1="1.8" x2="10.2" y2="10.2" stroke="rgba(168,220,230,0.5)" strokeWidth="1"/>
              <line x1="10.2" y1="1.8" x2="1.8" y2="10.2" stroke="rgba(168,220,230,0.5)" strokeWidth="1"/>
            </svg>
          )}
          {f.shape === 2 && <div style={{ width:f.size, height:f.size, transform:'rotate(45deg)', backgroundColor:'rgba(200,169,126,0.6)' }}/>}
        </div>
      ))}
    </div>
  );
}

// ─── TYPES ────────────────────────────────────────────────────
interface Offer     { id:string; name:string; quantity:number; price:number; }
interface Variant   { id:string; name:string; value:string; }
interface Attribute { id:string; type:string; name:string; displayMode?:'color'|'image'|'text'|null; variants:Variant[]; }
interface ProductImage { id:string; imageUrl:string; }
interface VariantAttributeEntry { attrId:string; attrName:string; displayMode:'color'|'image'|'text'; value:string; }
interface VariantDetail { id:string|number; name:VariantAttributeEntry[]; price:number; stock:number; autoGenerate:boolean; }
interface Wilaya  { id:string; name:string; ar_name:string; livraisonHome:number; livraisonOfice:number; livraisonReturn:number; }
interface Commune { id:string; name:string; ar_name:string; wilayaId:string; }

export interface Product {
  id:string; name:string; price:string|number; priceOriginal?:string|number; desc?:string;
  productImage?:string; imagesProduct?:ProductImage[]; offers?:Offer[]; attributes?:Attribute[];
  variantDetails?:VariantDetail[]; stock?:number; isActive?:boolean;
  store:{ id:string; name:string; subdomain:string; userId:string; };
}
export interface ProductFormProps {
  product:Product; userId:string; domain:string; redirectPath?:string;
  selectedOffer:string|null; setSelectedOffer:(id:string|null)=>void;
  selectedVariants:Record<string,string>; platform?:string; priceLoss?:number;
}

function variantMatches(d:VariantDetail, sel:Record<string,string>): boolean {
  return Object.entries(sel).every(([n,v]) => d.name.some(e => e.attrName===n && e.value===v));
}
const fetchWilayas  = async (uid:string): Promise<Wilaya[]>  => { try { const {data} = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }};
const fetchCommunes = async (wid:string): Promise<Commune[]> => { try { const {data} = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }};


// ─── MAIN ─────────────────────────────────────────────────────
export default function Main({ store, children }: any) {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--slate)', fontFamily:"'DM Sans',sans-serif", color:'var(--text-b)' }}>
      <style>{FONT_CSS}</style>
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="marquee-wrap py-2" style={{ backgroundColor:'var(--rust)', borderBottom:'1px solid var(--rust-dk)' }}>
          <div className="marquee-inner">
            {Array(10).fill(null).map((_,i) => (
              <span key={i} className="mx-8 text-white font-bold text-xs tracking-[0.2em] uppercase inline-flex items-center gap-3">
                <Mountain className="w-3 h-3 opacity-70"/> {store.topBar.text}
              </span>
            ))}
            {Array(10).fill(null).map((_,i) => (
              <span key={`b${i}`} className="mx-8 text-white font-bold text-xs tracking-[0.2em] uppercase inline-flex items-center gap-3">
                <Mountain className="w-3 h-3 opacity-70"/> {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}
      <Navbar store={store}/>
      <main>{children}</main>
      <Footer store={store}/>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────
export function Navbar({ store }: { store: Store }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRTL = store.language === 'ar';
  useEffect(()=>{ const h=()=>setScrolled(window.scrollY>20); window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h); },[]);

  const nav = [
    { href:`/${store.subdomain}`,         label:isRTL?'الرئيسية':'BASE CAMP', icon:<Mountain className="w-3.5 h-3.5"/> },
    { href:`/${store.subdomain}/contact`, label:isRTL?'اتصل بنا':'CONTACT',   icon:<Compass  className="w-3.5 h-3.5"/> },
    { href:`/${store.subdomain}/Privacy`, label:isRTL?'الخصوصية':'POLICY',    icon:<Shield   className="w-3.5 h-3.5"/> },
  ];
  const initials = store.name.split(' ').filter(Boolean).map((w:string)=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300" dir={isRTL?'rtl':'ltr'}
      style={{ backgroundColor:scrolled?'rgba(15,25,35,0.97)':'rgba(15,25,35,0.85)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${scrolled?'rgba(196,66,26,0.4)':'transparent'}`, boxShadow:scrolled?'0 4px 32px rgba(0,0,0,0.6)':'none' }}>
      {/* Top accent line */}
      <div className="h-0.5" style={{ background:'linear-gradient(90deg, var(--rust), var(--ice), var(--rust))' }}/>
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href={`/${store.subdomain}`} className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105"
              style={{ backgroundColor:'var(--rust)', clipPath:'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)', boxShadow:'0 0 20px var(--glow-rust)' }}>
              {store.design.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} className="w-full h-full object-cover"/>
                : <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.3rem', color:'white', letterSpacing:'0.05em' }}>{initials}</span>
              }
            </div>
            <div>
              <span className="block" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.5rem', color:'var(--cream)', letterSpacing:'0.1em', lineHeight:1 }}>
                {store.name}
              </span>
              <span className="block text-[8px] font-bold tracking-[0.28em] uppercase" style={{ color:'var(--rust-lt)' }}>
                {isRTL?'⛰ مغامرات الهواء الطلق':'⛰ OUTDOOR ADVENTURES'}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {nav.map(item => (
              <Link key={item.href} href={item.href}
                className="relative flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] transition-colors group"
                style={{ color:'var(--stone-lt)' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--ice)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--stone-lt)';}}>
                {item.icon}{item.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300" style={{ background:'var(--ice)' }}/>
              </Link>
            ))}
            <Link href={`/${store.subdomain}`}
              className="btn-alpine flex items-center gap-2 px-7 py-3 text-xs font-bold tracking-[0.15em] text-white"
              style={{ background:'linear-gradient(135deg, var(--rust), var(--rust-dk))', boxShadow:'0 4px 20px var(--glow-rust)' }}>
              <Target className="w-3.5 h-3.5"/> {isRTL?'تسوق الآن':'GEAR UP'}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={()=>setMenuOpen(p=>!p)} className="md:hidden w-10 h-10 flex items-center justify-center"
            style={{ border:'1px solid var(--border-lt)', color:'var(--ice)', backgroundColor:'rgba(120,196,208,0.08)' }}>
            {menuOpen?<X className="w-5 h-5"/>:<Mountain className="w-5 h-5"/>}
          </button>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen?'max-h-52 pb-5':'max-h-0'}`}>
          <div className="pt-4 space-y-1" style={{ borderTop:'1px solid var(--border)' }}>
            {nav.map(item => (
              <Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-xs font-bold tracking-[0.18em] transition-all"
                style={{ color:'var(--stone-lt)', borderLeft:'2px solid transparent' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--ice)'; el.style.borderLeftColor='var(--rust)'; el.style.paddingLeft='1rem';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--stone-lt)'; el.style.borderLeftColor='transparent'; el.style.paddingLeft='0.75rem';}}>
                {item.icon}{item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────
export function Footer({ store }: any) {
  const isRTL = store.language === 'ar';
  return (
    <footer className="relative overflow-hidden noise-overlay" style={{ backgroundColor:'var(--slate)', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Mountain silhouette */}
      <div className="absolute bottom-0 left-0 right-0 opacity-8 pointer-events-none">
        <MountainRange width={1440} height={200} color="rgba(26,40,54,0.8)" accent="rgba(37,53,71,0.9)"/>
      </div>
      <div className="h-0.5" style={{ background:'linear-gradient(90deg, var(--rust), var(--ice), var(--moss-lt), var(--rust))' }}/>
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12" style={{ borderBottom:'1px solid var(--border)' }}>
          {/* Brand */}
          <div className="space-y-5">
            <div>
              <p className="font-bold mb-1" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', color:'var(--cream)', letterSpacing:'0.1em', lineHeight:1 }}>{store.name}</p>
              <p className="text-[9px] font-bold tracking-[0.28em] uppercase" style={{ color:'var(--rust-lt)' }}>⛰ OUTDOOR ADVENTURES</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color:'var(--text-dim)' }}>
              {isRTL?'معدات متخصصة للمغامرات والرياضات الخارجية. جودة احترافية لكل المغامرين.':'Professional-grade gear for explorers who refuse to stay indoors. Built to survive anything.'}
            </p>
            <div className="flex gap-3">
              {['SUMMIT READY','FIELD TESTED','GEAR CERTIFIED'].map(b=>(
                <span key={b} className="tag-alpine text-[8px]">{b}</span>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div>
            <p className="spec-label mb-5">// NAVIGATE</p>
            <div className="space-y-2">
              {[
                { href:`/${store.subdomain}/Privacy`, label:isRTL?'سياسة الخصوصية':'PRIVACY POLICY' },
                { href:`/${store.subdomain}/Terms`,   label:isRTL?'شروط الخدمة'    :'TERMS OF SERVICE' },
                { href:`/${store.subdomain}/Cookies`, label:isRTL?'ملفات الارتباط' :'COOKIE POLICY' },
                { href:`/${store.subdomain}/contact`, label:isRTL?'اتصل بنا'        :'CONTACT BASE' },
              ].map(l=>(
                <a key={l.href} href={l.href} className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] transition-all"
                  style={{ color:'var(--text-dim)', borderLeft:'2px solid transparent', paddingLeft:'0', display:'flex' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--ice)'; el.style.borderLeftColor='var(--rust)'; el.style.paddingLeft='8px';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--text-dim)'; el.style.borderLeftColor='transparent'; el.style.paddingLeft='0';}}>
                  <ArrowRight className="w-3 h-3 opacity-50"/> {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Coordinates card */}
          <div>
            <p className="spec-label mb-4">// FIELD REPORT</p>
            <div className="p-5 relative overflow-hidden" style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(120,196,208,0.04)' }}>
              <div className="absolute top-3 right-3 opacity-30"><Crosshair size={50} color="var(--ice)"/></div>
              <div className="space-y-3">
                {[
                  { l:'LATITUDE',  v:'36.7538° N' },
                  { l:'LONGITUDE', v:'3.0588° E'  },
                  { l:'ALTITUDE',  v:'2,308 m'    },
                  { l:'STATUS',    v:'OPERATIONAL' },
                ].map(r=>(
                  <div key={r.l} className="flex justify-between items-center">
                    <span className="spec-label">{r.l}</span>
                    <span className="text-xs font-bold" style={{ fontFamily:"'Bebas Neue',cursive", letterSpacing:'0.1em', color: r.l==='STATUS'?'var(--moss-lt)':'var(--ice)' }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3" style={{ borderTop:'1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor:'var(--moss-lt)', animation:'blink-dot 1.5s ease-in-out infinite' }}/>
                  <span className="spec-label">STORE ONLINE · READY FOR ORDERS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="spec-label">© {new Date().getFullYear()} {store.name} · {isRTL?'جميع الحقوق محفوظة':'ALL RIGHTS RESERVED'}</p>
          <p className="spec-label">OUTDOOR ADVENTURES THEME · ALPINE SERIES</p>
        </div>
      </div>
    </footer>
  );
}


// ─── CARD ─────────────────────────────────────────────────────
export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const [hovered, setHovered] = useState(false);
  const accents=['var(--rust)','var(--ice-dk)','var(--moss-lt)','var(--sand)','var(--rust-lt)'];
  const accent=accents[parseInt(product.id)%accents.length];
  return (
    <div className="card-alpine flex flex-col overflow-hidden"
      style={{ backgroundColor:'var(--slate-lt)', border:'1px solid var(--border)' }}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio:'1', backgroundColor:'var(--slate-md)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500" style={{ transform:hovered?'scale(1.07)':'scale(1)' }}/>
          : <div className="w-full h-full flex flex-col items-center justify-center crosshair-grid">
              <Mountain className="w-12 h-12" style={{ color:'var(--slate-md)' }}/>
              <span className="spec-label mt-2">NO IMAGE</span>
            </div>
        }
        {/* Top overlay gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(to bottom, rgba(15,25,35,0.3) 0%, transparent 40%, rgba(15,25,35,0.6) 100%)' }}/>

        {/* Discount badge — diagonal cut */}
        {discount>0&&(
          <div className="absolute top-3 left-0 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white"
            style={{ backgroundColor:'var(--rust)', clipPath:'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)', boxShadow:'4px 4px 16px var(--glow-rust)' }}>
            -{discount}% OFF
          </div>
        )}

        {/* Wishlist */}
        <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-300"
          style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(15,25,35,0.75)', color:'var(--sand)', opacity:hovered?1:0, transform:hovered?'scale(1)':'scale(0.7)' }}>
          <Heart className="w-3.5 h-3.5"/>
        </button>

        {/* Hover CTA */}
        <div className="absolute hidden bottom-0 left-0 right-0 p-3 transition-all duration-400"
          style={{ transform:hovered?'translateY(0)':'translateY(110%)', opacity:hovered?1:0 }}>
          <Link href={`/${store.subdomain}/product/${product.slug||product.id}`}
            className="btn-alpine flex items-center justify-center gap-2 w-full py-3 text-xs font-bold tracking-[0.15em] text-white"
            style={{ background:`linear-gradient(135deg, var(--rust), var(--rust-dk))`, boxShadow:'0 4px 16px var(--glow-rust)' }}>
            <Target className="w-3.5 h-3.5"/> {viewDetails}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 relative">
        {/* Accent accent-color left border highlight on hover */}
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_,i)=><Star key={i} className={`w-2.5 h-2.5 ${i<4?'fill-current':''}`} style={{ color:'var(--sand)' }}/>)}
          <span className="ml-1 text-[9px] font-bold" style={{ color:'var(--text-dim)' }}>4.8</span>
        </div>
        <h3 className="font-bold mb-2 leading-tight line-clamp-2"
          style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.15rem', color:'var(--cream)', letterSpacing:'0.06em' }}>
          {product.name}
        </h3>
        {product.desc&&(
          <div className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color:'var(--text-dim)' }}
            dangerouslySetInnerHTML={{ __html:product.desc }}/>
        )}
        <div className="mt-auto pt-3 flex items-end justify-between" style={{ borderTop:'1px solid var(--border)' }}>
          <div>
            <p className="spec-label mb-0.5">FIELD PRICE</p>
            <span className="font-bold" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.6rem', color:accent, letterSpacing:'0.06em', lineHeight:1 }}>
              {product.price}
            </span>
            <span className="ml-1 text-xs font-bold" style={{ color:'var(--text-dim)' }}>{store.currency}</span>
            {product.priceOriginal&&product.priceOriginal>product.price&&(
              <span className="ml-2 text-xs line-through" style={{ color:'var(--text-dim)' }}>{product.priceOriginal}</span>
            )}
          </div>
          <Link href={`/${store.subdomain}/product/${product.slug||product.id}`} className="w-8 h-8 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ border:'1px solid var(--border-lt)', color:'var(--ice)', backgroundColor:'rgba(120,196,208,0.08)' }}>
            <ArrowRight className="w-3.5 h-3.5"/>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────
export function Home({ store }: any) {
  const isRTL = store.language === 'ar';
  const dir   = isRTL ? 'rtl' : 'ltr';
  const t = {
    badge:      isRTL?'⛰ معدات احترافية'         :'⛰ PROFESSIONAL GRADE GEAR',
    heroTitle:  isRTL?'الطبيعة\nتنتظرك'            :'CONQUER\nEVERY SUMMIT',
    heroSub:    isRTL?'معدات ومستلزمات خارجية احترافية للمغامرين الحقيقيين.':"Field-tested gear for extreme conditions. From base camp to summit — we've got you covered.",
    heroBtn:    isRTL?'⛺ تسوق المعدات'            :'⛺ GEAR UP NOW',
    heroBtn2:   isRTL?'📋 العروض'                 :'📋 VIEW DEALS',
    categories: isRTL?'تصفح الفئات'                :'BROWSE CATEGORIES',
    all:        isRTL?'الكل'                         :'ALL GEAR',
    products:   isRTL?'معداتنا الميدانية'            :'FIELD EQUIPMENT',
    noProducts: isRTL?'لا توجد منتجات بعد'           :'NO GEAR LOADED YET',
    viewDetails:isRTL?'عرض التفاصيل'                 :'INSPECT GEAR',
  };

  const specs = [
    { icon:<Thermometer className="w-5 h-5"/>, label:'TEMP RANGE', val:'-40°C / +50°C', color:'var(--ice)' },
    { icon:<Wind className="w-5 h-5"/>,        label:'WIND RATING', val:'FORCE 10',      color:'var(--sand)' },
    { icon:<Mountain className="w-5 h-5"/>,    label:'ALTITUDE',    val:'8,849 M',        color:'var(--moss-lt)' },
    { icon:<Zap className="w-5 h-5"/>,         label:'DURABILITY',  val:'MILITARY GR.',  color:'var(--rust-lt)' },
  ];

  return (
    <div dir={dir} style={{ backgroundColor:'var(--slate)', fontFamily:"'DM Sans',sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden scan-overlay" style={{ minHeight:'100vh', display:'flex', alignItems:'center' }}>
        <FallingSnow/>
        {/* Topo background */}
        <div className="absolute inset-0 topo-bg pointer-events-none"/>
        {/* Crosshair grid */}
        <div className="absolute inset-0 crosshair-grid pointer-events-none opacity-40"/>
        {/* Dark gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(135deg, rgba(15,25,35,0.97) 0%, rgba(15,25,35,0.7) 60%, rgba(15,25,35,0.4) 100%)' }}/>
        {/* Mountain silhouette bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex:1 }}>
          <MountainRange width={1440} height={220} color="rgba(26,40,54,0.9)" accent="rgba(37,53,71,0.8)"/>
        </div>
        {/* Rust glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-5"
          style={{ background:'radial-gradient(circle, var(--rust), transparent 70%)' }}/>
        {/* Decorative crosshairs */}
        <div className="absolute top-16 right-16 hidden lg:block pointer-events-none"><Crosshair size={120} color="rgba(120,196,208,0.2)" spin/></div>
        <div className="absolute bottom-40 left-8 hidden xl:block pointer-events-none"><Crosshair size={60} color="rgba(196,66,26,0.2)"/></div>

        {store.hero?.imageUrl&&(
          <div className="absolute inset-0 pointer-events-none"><img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity:0.1 }}/></div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-16">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="slide-up inline-flex items-center gap-2 mb-6 px-4 py-2 text-xs font-bold tracking-[0.2em]"
              style={{ border:'1px solid rgba(196,66,26,0.5)', backgroundColor:'rgba(196,66,26,0.1)', color:'var(--rust-lt)' }}>
              <Target className="w-3 h-3"/> {t.badge}
            </div>

            {/* Title */}
            <h1 className="slide-up slide-up-d1 whitespace-pre-line mb-2"
              style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(4.5rem,13vw,11rem)', color:'var(--cream)', letterSpacing:'0.06em', lineHeight:0.9 }}>
              {store.hero?.title||t.heroTitle}
            </h1>

            {/* Accent line */}
            <div className="slide-up slide-up-d1 flex items-center gap-4 mb-6">
              <div className="h-1 w-16" style={{ background:'linear-gradient(90deg, var(--rust), transparent)' }}/>
              <DiamondDivider/>
              <div className="h-1 w-16" style={{ background:'linear-gradient(90deg, transparent, var(--ice))' }}/>
            </div>

            <p className="slide-up slide-up-d2 text-base leading-relaxed mb-10 max-w-lg" style={{ color:'var(--text-b)', fontWeight:400 }}>
              {store.hero?.subtitle||t.heroSub}
            </p>

            {/* CTAs */}
            <div className="slide-up slide-up-d3 flex flex-wrap gap-4 mb-12">
              <a href="#products" className="btn-alpine flex items-center gap-2.5 px-10 py-4 text-sm font-bold tracking-[0.15em] text-white"
                style={{ background:'linear-gradient(135deg, var(--rust), var(--rust-dk))', boxShadow:'0 8px 32px var(--glow-rust)' }}>
                <Mountain className="w-4 h-4"/> {t.heroBtn}
              </a>
              <a href="#categories" className="btn-alpine flex items-center gap-2.5 px-10 py-4 text-sm font-bold tracking-[0.15em]"
                style={{ border:'1px solid var(--border-lt)', color:'var(--ice)', backgroundColor:'rgba(120,196,208,0.07)' }}>
                {t.heroBtn2} <ArrowRight className="w-4 h-4"/>
              </a>
            </div>

            {/* Spec bar */}
            <div className="slide-up slide-up-d4 grid grid-cols-2 sm:grid-cols-4 gap-px"
              style={{ border:'1px solid var(--border)', backgroundColor:'var(--border)' }}>
              {specs.map((s,i)=>(
                <div key={i} className="flex flex-col gap-2 p-4" style={{ backgroundColor:'rgba(15,25,35,0.95)' }}>
                  <div style={{ color:s.color }}>{s.icon}</div>
                  <p className="spec-label">{s.label}</p>
                  <p className="font-bold text-xs" style={{ fontFamily:"'Bebas Neue',cursive", color:'var(--cream)', letterSpacing:'0.08em', fontSize:'1rem' }}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom slash cut */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ zIndex:2, background:'linear-gradient(180deg, transparent, var(--slate-lt))' }}/>
      </section>

      {/* ── GEAR BADGES ── */}
      <section style={{ backgroundColor:'var(--slate-lt)', borderBottom:'1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ border:'1px solid var(--border)', backgroundColor:'var(--border)' }}>
            {[
              { icon:<Award className="w-5 h-5"/>,       col:'var(--rust-lt)',  label:'FIELD TESTED',  desc:isRTL?'اختبر في أقسى الظروف':'Proven in extreme conditions' },
              { icon:<Shield className="w-5 h-5"/>,      col:'var(--ice)',      label:'BATTLE READY',  desc:isRTL?'تصميم عسكري':'Military-grade durability' },
              { icon:<Zap className="w-5 h-5"/>,         col:'var(--sand)',     label:'LIGHTWEIGHT',   desc:isRTL?'خفيف وقوي':'Light enough to carry far' },
            ].map((b,i)=>(
              <div key={i} className="flex items-center gap-4 px-6 py-6 transition-all" style={{ backgroundColor:'var(--slate-lt)' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='var(--slate-md)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='var(--slate-lt)';}}>
                <div className="w-10 h-10 flex items-center justify-center" style={{ border:`1px solid ${b.col}`, color:b.col, backgroundColor:`${b.col}12` }}>{b.icon}</div>
                <div>
                  <p className="font-bold text-xs tracking-[0.15em]" style={{ fontFamily:"'Bebas Neue',cursive", color:'var(--cream)', fontSize:'1rem' }}>{b.label}</p>
                  <p className="spec-label mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-20" style={{ backgroundColor:'var(--slate)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="spec-label mb-2">// FILTER BY TERRAIN</p>
              <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(2rem,5vw,4rem)', color:'var(--cream)', letterSpacing:'0.08em', lineHeight:1 }}>{t.categories}</h2>
            </div>
            <DiamondDivider/>
          </div>
          {store.categories?.length>0?(
            <div className="flex flex-wrap gap-3">
              <Link href={`/${store.domain}`}
                className="btn-alpine flex items-center gap-2 px-7 py-3 text-xs font-bold tracking-[0.15em] text-white"
                style={{ background:'linear-gradient(135deg, var(--rust), var(--rust-dk))', boxShadow:'0 4px 16px var(--glow-rust)' }}>
                <Target className="w-3.5 h-3.5"/> {t.all}
              </Link>
              {store.categories.map((cat:any,idx:number)=>{
                const cols=['var(--ice)','var(--moss-lt)','var(--sand)','var(--rust-lt)','var(--stone-lt)'];
                const col=cols[idx%cols.length];
                return (
                  <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                    className="btn-alpine flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-[0.15em] transition-all"
                    style={{ border:`1px solid ${col}`, color:col, backgroundColor:`${col}10` }}
                    onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.backgroundColor=col; el.style.color='var(--slate)';}}
                    onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.backgroundColor=`${col}10`; el.style.color=col;}}>
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          ):(
            <div className="py-20 text-center crosshair-grid" style={{ border:'1px dashed var(--border-lt)' }}>
              <Mountain className="w-12 h-12 mx-auto mb-3" style={{ color:'var(--slate-md)' }}/>
              <p className="spec-label">NO CATEGORIES DEPLOYED</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="py-20" style={{ backgroundColor:'var(--slate-lt)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="spec-label mb-2">// EQUIPMENT MANIFEST</p>
              <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(2rem,5vw,4rem)', color:'var(--cream)', letterSpacing:'0.08em', lineHeight:1 }}>{t.products}</h2>
              <p className="spec-label mt-1">{store.products?.length||0} {isRTL?'عنصر متوفر':'ITEMS IN STOCK'}</p>
            </div>
            <div className="hidden md:block"><Crosshair size={70} color="rgba(196,66,26,0.3)" spin/></div>
          </div>
          {store.products?.length>0?(
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px" style={{ border:'1px solid var(--border)', backgroundColor:'var(--border)' }}>
              {store.products.map((product:any)=>{
                const displayImage=product.productImage||product.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                const discount=product.priceOriginal?Math.round(((product.priceOriginal-product.price)/product.priceOriginal)*100):0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails}/>;
              })}
            </div>
          ):(
            <div className="py-40 text-center crosshair-grid" style={{ border:'1px dashed var(--border-lt)' }}>
              <Mountain className="w-16 h-16 mx-auto mb-4" style={{ color:'var(--slate-md)' }}/>
              <p className="font-bold" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', color:'var(--stone)', letterSpacing:'0.1em' }}>{t.noProducts}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── SUMMIT BANNER ── */}
      <section className="relative overflow-hidden py-28 noise-overlay" style={{ backgroundColor:'var(--slate)' }}>
        <div className="absolute inset-0 topo-bg pointer-events-none opacity-60"/>
        <div className="absolute inset-0 crosshair-grid pointer-events-none opacity-30"/>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <MountainRange width={1440} height={160} color="rgba(26,40,54,0.7)" accent="rgba(37,53,71,0.6)"/>
        </div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 pointer-events-none hidden lg:block">
          <Crosshair size={200} color="rgba(120,196,208,0.08)" spin/>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-xs font-bold tracking-[0.2em]"
            style={{ border:'1px solid rgba(196,66,26,0.4)', backgroundColor:'rgba(196,66,26,0.08)', color:'var(--rust-lt)' }}>
            <Target className="w-3 h-3"/> SUMMIT READY
          </div>
          <h2 className="font-bold mb-4" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(3.5rem,10vw,9rem)', color:'var(--cream)', letterSpacing:'0.06em', lineHeight:0.9 }}>
            {isRTL?'جهّز نفسك\nللقمة':'BUILT FOR\nTHE EXTREME'}
          </h2>
          <div className="flex justify-center my-6"><DiamondDivider/></div>
          <p className="text-base leading-relaxed mb-10 max-w-lg mx-auto" style={{ color:'var(--text-b)' }}>
            {isRTL?'معدات احترافية لكل من يحب الطبيعة والمغامرة. لأن الجبل لا يرحم المهمل.':'Every piece of gear is field-tested by professionals who know that the mountain has no mercy for poor equipment.'}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="#products" className="btn-alpine flex items-center gap-2 px-10 py-4 text-sm font-bold tracking-[0.15em] text-white"
              style={{ background:'linear-gradient(135deg, var(--rust), var(--rust-dk))', boxShadow:'0 8px 32px var(--glow-rust)' }}>
              <Mountain className="w-4 h-4"/> {isRTL?'تسوق الآن':'SHOP THE RANGE'}
            </a>
            <a href="#categories" className="btn-alpine flex items-center gap-2 px-10 py-4 text-sm font-bold tracking-[0.15em]"
              style={{ border:'1px solid var(--ice)', color:'var(--ice)', backgroundColor:'rgba(120,196,208,0.06)' }}>
              <Compass className="w-4 h-4"/> {isRTL?'استكشف':'EXPLORE'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}


// ─── DETAILS ──────────────────────────────────────────────────
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [selectedImage, setSelectedImage] = useState(0);
  const accents=['var(--rust)','var(--ice-dk)','var(--moss-lt)','var(--sand)','var(--rust-lt)'];
  const accent=accents[parseInt(product.id)%accents.length];
  return (
    <div className="min-h-screen" dir={isRTL?'rtl':'ltr'} style={{ backgroundColor:'var(--slate)', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Breadcrumb header */}
      <header className="py-4 sticky top-0 z-40" style={{ backgroundColor:'rgba(15,25,35,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-[0.15em]" style={{ color:'var(--text-dim)' }}>
            <span>⛰ {isRTL?'الرئيسية':'BASE CAMP'}</span>
            <span style={{ color:'var(--rust)' }}>›</span>
            <span style={{ color:'var(--cream)', fontFamily:"'Bebas Neue',cursive", letterSpacing:'0.08em', fontSize:'0.95rem' }}>{customLengthName(product.name, 20)}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className="w-9 h-9 flex items-center justify-center transition-all"
              style={{ border:'1px solid var(--border-lt)', backgroundColor:isWishlisted?'var(--rust)':'transparent', color:isWishlisted?'white':'var(--sand)' }}>
              <Heart className={`w-3.5 h-3.5 ${isWishlisted?'fill-current':''}`}/>
            </button>
            <button onClick={handleShare} className="w-9 h-9 flex items-center justify-center" style={{ border:'1px solid var(--border)', color:'var(--text-dim)' }}>
              <Share2 className="w-3.5 h-3.5"/>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-bold tracking-[0.18em]"
              style={{ border:`1px solid ${inStock?'var(--moss-lt)':'var(--rust)'}`, color:inStock?'var(--moss-lt)':'var(--rust)', backgroundColor:'transparent' }}>
              <span className={`w-1.5 h-1.5 ${inStock?'bg-green-400 animate-pulse':'bg-red-500'}`}/>
              {inStock?(isRTL?'متوفر':'IN STOCK'):(isRTL?'نفد':'OUT OF STOCK')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative overflow-hidden group" style={{ aspectRatio:'1', border:`2px solid ${accent}40`, backgroundColor:'var(--slate-lt)' }}>
              {allImages.length>0
                ? <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                : <div className="w-full h-full flex items-center justify-center crosshair-grid">
                    <Mountain className="w-16 h-16" style={{ color:'var(--slate-md)' }}/>
                  </div>
              }
              <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(to bottom, rgba(15,25,35,0.2) 0%, transparent 40%, rgba(15,25,35,0.5) 100%)' }}/>
              {discount>0&&(
                <div className="absolute top-4 left-0 px-4 py-2 text-xs font-bold tracking-wider text-white"
                  style={{ backgroundColor:'var(--rust)', clipPath:'polygon(0 0, 100% 0, calc(100%-10px) 100%, 0 100%)', boxShadow:'4px 4px 20px var(--glow-rust)' }}>
                  -{discount}% OFF
                </div>
              )}
              <div className="absolute top-4 right-4 opacity-30 group-hover:opacity-60 transition-opacity"><Crosshair size={50} color="var(--ice)" spin/></div>
              {allImages.length>1&&(
                <>
                  <button onClick={()=>setSelectedImage(p=>p===0?allImages.length-1:p-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(15,25,35,0.85)', color:'var(--ice)' }}>
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                  <button onClick={()=>setSelectedImage(p=>p===allImages.length-1?0:p+1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(15,25,35,0.85)', color:'var(--ice)' }}>
                    <ChevronRight className="w-4 h-4"/>
                  </button>
                </>
              )}
              {!inStock&&!autoGen&&(
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor:'rgba(15,25,35,0.85)' }}>
                  <div className="px-6 py-3 text-xs font-bold tracking-[0.2em]" style={{ border:'1px solid var(--rust)', color:'var(--rust-lt)' }}>
                    OUT OF STOCK
                  </div>
                </div>
              )}
            </div>
            {allImages.length>1&&(
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img:string,idx:number)=>(
                  <button key={idx} onClick={()=>setSelectedImage(idx)} className="shrink-0 w-16 h-16 overflow-hidden transition-all"
                    style={{ border:`2px solid ${selectedImage===idx?accent:'var(--border)'}`, opacity:selectedImage===idx?1:0.5 }}>
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
            {/* Spec bar */}
            <div className="grid grid-cols-3 gap-px" style={{ border:'1px solid var(--border)', backgroundColor:'var(--border)' }}>
              {[{e:'🛡️',l:isRTL?'متين':'DURABLE'},{e:'🚀',l:isRTL?'سريع':'FAST SHIP'},{e:'⛰',l:isRTL?'معتمد':'CERTIFIED'}].map((b,i)=>(
                <div key={i} className="flex flex-col items-center gap-1.5 py-4" style={{ backgroundColor:'var(--slate-lt)' }}>
                  <span className="text-lg">{b.e}</span>
                  <span className="spec-label text-center">{b.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info panel */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5" style={{ background:`linear-gradient(180deg, ${accent}, transparent)` }}/>
                <span className="spec-label">PRODUCT / GEAR ITEM</span>
              </div>
              <h1 className="mb-3" style={{ fontFamily:"'Bebas Neue',cursive", fontWeight:400, fontSize:'clamp(2rem,4vw,3.5rem)', color:'var(--cream)', letterSpacing:'0.06em', lineHeight:1 }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{[...Array(5)].map((_,i)=><Star key={i} className={`w-3.5 h-3.5 ${i<4?'fill-current':''}`} style={{ color:'var(--sand)' }}/>)}</div>
                <span className="spec-label">4.8 / 5.0 · 128 {isRTL?'تقييم':'FIELD REVIEWS'}</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-5 relative overflow-hidden" style={{ border:`1px solid ${accent}40`, backgroundColor:'rgba(15,25,35,0.5)' }}>
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background:`linear-gradient(180deg, ${accent}, transparent)` }}/>
              <div className="absolute top-3 right-3 opacity-20"><Crosshair size={60} color={accent}/></div>
              <p className="spec-label mb-2">// FIELD PRICE</p>
              <div className="flex items-baseline gap-3">
                <span className="font-bold" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'4rem', color:accent, lineHeight:1, letterSpacing:'0.04em' }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span className="text-sm font-bold" style={{ color:'var(--text-b)' }}>دج</span>
                {product.priceOriginal&&parseFloat(product.priceOriginal)>finalPrice&&(
                  <div>
                    <span className="text-sm line-through block" style={{ color:'var(--text-dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()} دج</span>
                    <span className="text-xs font-bold" style={{ color:'var(--rust-lt)' }}>SAVE {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-[0.18em]"
              style={{ border:`1px solid ${autoGen?'var(--sand)':inStock?'var(--moss-lt)':'var(--rust)'}`, color:autoGen?'var(--sand)':inStock?'var(--moss-lt)':'var(--rust)', backgroundColor:'transparent' }}>
              {autoGen?<Infinity className="w-3.5 h-3.5"/>:inStock?<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>:<X className="w-3.5 h-3.5"/>}
              {autoGen?'UNLIMITED STOCK':inStock?'IN STOCK — READY TO SHIP':'OUT OF STOCK'}
            </div>

            {/* Offers */}
            {product.offers?.length>0&&(
              <div>
                <DiamondDivider/>
                <p className="spec-label mb-3">// SELECT PACKAGE</p>
                <div className="space-y-2">
                  {product.offers.map((offer:any)=>(
                    <label key={offer.id} className="flex items-center justify-between p-4 cursor-pointer transition-all"
                      style={{ border:`1px solid ${selectedOffer===offer.id?accent:'var(--border)'}`, backgroundColor:selectedOffer===offer.id?`${accent}08`:'transparent' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center" style={{ border:`1px solid ${selectedOffer===offer.id?accent:'var(--border)'}` }}>
                          {selectedOffer===offer.id&&<div className="w-2 h-2" style={{ backgroundColor:accent }}/>}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} className="sr-only"/>
                        <div>
                          <p className="text-sm font-bold" style={{ color:'var(--cream)' }}>{offer.name}</p>
                          <p className="spec-label">QTY: {offer.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.4rem', color:accent, letterSpacing:'0.06em' }}>
                        {offer.price.toLocaleString()} <span className="text-xs">دج</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr:any)=>(
              <div key={attr.id}>
                <DiamondDivider/>
                <p className="spec-label mb-3">// SELECT {attr.name.toUpperCase()}</p>
                {attr.displayMode==='color'?(
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} className="w-9 h-9 transition-all" style={{ backgroundColor:v.value, boxShadow:s?`0 0 0 2px var(--slate),0 0 0 4px ${accent}`:'0 2px 8px rgba(0,0,0,0.3)', transform:s?'scale(1.15)':'scale(1)' }}/>;
                    })}
                  </div>
                ):attr.displayMode==='image'?(
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} className="w-14 h-14 overflow-hidden transition-all" style={{ border:`2px solid ${s?accent:'var(--border)'}`, opacity:s?1:0.5 }}><img src={v.value} alt={v.name} className="w-full h-full object-cover"/></button>; })}
                  </div>
                ):(
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} className="btn-alpine px-5 py-2.5 text-xs font-bold tracking-[0.12em] transition-all" style={{ border:`1px solid ${s?accent:'var(--border)'}`, backgroundColor:s?`${accent}15`:'transparent', color:s?accent:'var(--text-b)' }}>{v.name}</button>; })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>
          </div>
        </div>

        {product.desc&&(
          <section className="mt-20 pt-12" style={{ borderTop:'1px solid var(--border)' }}>
            <DiamondDivider/>
            <h2 className="mb-8" style={{ fontFamily:"'Bebas Neue',cursive", fontWeight:400, fontSize:'2.5rem', color:'var(--cream)', letterSpacing:'0.1em' }}>
              // GEAR SPECIFICATIONS
            </h2>
            <div className="p-8 relative overflow-hidden crosshair-grid" style={{ border:'1px solid var(--border)', backgroundColor:'var(--slate-lt)' }}>
              <div className="absolute top-4 right-4 opacity-10"><Crosshair size={80} color="var(--ice)" spin/></div>
              <div className="relative z-10 text-sm leading-relaxed" style={{ color:'var(--text-b)' }}
                dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc,{ ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','span'],ALLOWED_ATTR:['class','style'] })}}/>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}


// ─── PRODUCT FORM ─────────────────────────────────────────────
const inputSt = (err?:boolean): React.CSSProperties => ({
  width:'100%', padding:'12px 16px', fontSize:'0.875rem', fontWeight:500,
  backgroundColor:'rgba(15,25,35,0.6)', border:`1px solid ${err?'var(--rust)':'var(--border-lt)'}`,
  borderRadius:0, color:'var(--cream)', outline:'none',
  fontFamily:"'DM Sans',sans-serif", transition:'border-color 0.25s, box-shadow 0.25s',
});
const FieldWrapper = ({ error, label, children }: { error?:string; label?:string; children:React.ReactNode }) => (
  <div className="space-y-1.5">
    {label&&<label className="block spec-label">{label}</label>}
    {children}
    {error&&<p className="text-xs font-bold flex items-center gap-1" style={{ color:'var(--rust-lt)' }}><AlertCircle className="w-3 h-3"/>{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,setWilayas]   = useState<Wilaya[]>([]);
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
    const offer=product.offers?.find(o=>o.id===selectedOffer); if(offer) return offer.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){ const m=product.variantDetails.find(v=>variantMatches(v,selectedVariants)); if(m&&m.price!==-1) return m.price; }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getPriceLivraison=useCallback(():number=>{ if(!selectedWilayaData) return 0; return formData.typeLivraison==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice; },[selectedWilayaData,formData.typeLivraison]);
  useEffect(()=>{ if(selectedWilayaData) setFormData(f=>({...f,priceLoss:selectedWilayaData.livraisonReturn})); },[selectedWilayaData]);

  const finalPrice=getFinalPrice();
  const getTotalPrice=()=>finalPrice*formData.quantity+ +getPriceLivraison();
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
    try { await axios.post(`${API_URL}/orders`,{ ...formData, customerWilayaId: +formData.customerWelaya,customerCommuneId: +formData.customerCommune, productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice, totalPrice: getTotalPrice(), priceShip : getPriceLivraison(), }); if(typeof window!=='undefined'&&formData.customerId) localStorage.setItem('customerId',formData.customerId); router.push(`/lp/${domain}/successfully`); } catch(err){console.error(err);} finally{setSubmitting(false);}
  };
  const onFocus=(e:React.FocusEvent<any>)=>{ e.target.style.borderColor='var(--ice)'; e.target.style.boxShadow='0 0 0 3px rgba(120,196,208,0.12)'; };
  const onBlur=(e:React.FocusEvent<any>,err?:boolean)=>{ e.target.style.borderColor=err?'var(--rust)':'var(--border-lt)'; e.target.style.boxShadow='none'; };

  return (
    <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.5rem' }}>
      <DiamondDivider/>
      <h3 className="flex items-center gap-2 mb-6" style={{ fontFamily:"'Bebas Neue',cursive", fontWeight:400, fontSize:'1.8rem', color:'var(--cream)', letterSpacing:'0.1em' }}>
        <Target className="w-5 h-5" style={{ color:'var(--rust)' }}/> DEPLOY ORDER
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerName} label="// OPERATOR NAME">
            <div className="relative">
              <User className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <input type="text" value={formData.customerName} onChange={e=>setFormData({...formData,customerName:e.target.value})} placeholder="الاسم الكامل" style={{ ...inputSt(!!formErrors.customerName), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerName)}/>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerPhone} label="// RADIO FREQ.">
            <div className="relative">
              <Phone className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <input type="tel" value={formData.customerPhone} onChange={e=>setFormData({...formData,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" style={{ ...inputSt(!!formErrors.customerPhone), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerPhone)}/>
            </div>
          </FieldWrapper>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerWelaya} label="// WILAYA SECTOR">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <select value={formData.customerWelaya} onChange={e=>setFormData({...formData,customerWelaya:e.target.value,customerCommune:''})} style={{ ...inputSt(!!formErrors.customerWelaya), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer' }}>
                <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerCommune} label="// COMMUNE GRID">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <select value={formData.customerCommune} disabled={!formData.customerWelaya||loadingCommunes} onChange={e=>setFormData({...formData,customerCommune:e.target.value})} style={{ ...inputSt(!!formErrors.customerCommune), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer', opacity:!formData.customerWelaya?0.4:1 }}>
                <option value="">{loadingCommunes?'SCANNING...':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery mode */}
        <div>
          <p className="spec-label mb-3">// EXTRACTION METHOD</p>
          <div className="grid grid-cols-2 gap-px" style={{ border:'1px solid var(--border)', backgroundColor:'var(--border)' }}>
            {(['home','office'] as const).map(type=>(
              <button key={type} type="button" onClick={()=>setFormData(p=>({...p,typeLivraison:type}))} className="flex flex-col items-center gap-2 py-5 transition-all"
                style={{ backgroundColor: formData.typeLivraison===type?'rgba(196,66,26,0.12)':'var(--slate-lt)', borderTop:`3px solid ${formData.typeLivraison===type?'var(--rust)':'transparent'}` }}>
                <span className="text-2xl">{type==='home'?'🏕️':'🏢'}</span>
                <p className="spec-label" style={{ color:formData.typeLivraison===type?'var(--rust-lt)':'var(--text-dim)' }}>
                  {type==='home'?'HOME DROP':'OFFICE PICK'}
                </p>
                {selectedWilayaData&&<p className="text-xs font-bold" style={{ fontFamily:"'Bebas Neue',cursive", color:'var(--cream)', letterSpacing:'0.08em' }}>{(type==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice).toLocaleString()} دج</p>}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <FieldWrapper label="// UNIT COUNT">
          <div className="flex items-center gap-4">
            <button type="button" onClick={()=>setFormData(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} className="w-10 h-10 flex items-center justify-center text-xl font-bold transition-all"
              style={{ border:'1px solid var(--border-lt)', color:'var(--ice)', backgroundColor:'transparent' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='rgba(120,196,208,0.1)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='transparent';}}>−</button>
            <span className="w-12 text-center font-bold" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', color:'var(--cream)', letterSpacing:'0.1em' }}>{formData.quantity}</span>
            <button type="button" onClick={()=>setFormData(p=>({...p,quantity:p.quantity+1}))} className="w-10 h-10 flex items-center justify-center text-xl font-bold transition-all"
              style={{ border:'1px solid var(--border-lt)', color:'var(--ice)', backgroundColor:'transparent' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='rgba(120,196,208,0.1)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='transparent';}}>+</button>
          </div>
        </FieldWrapper>

        {/* Order manifest */}
        <div className="p-5 relative crosshair-grid" style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(15,25,35,0.5)' }}>
          <div className="absolute top-3 right-3 opacity-15"><Crosshair size={55} color="var(--rust)"/></div>
          <p className="spec-label mb-4">// MISSION MANIFEST</p>
          <div className="space-y-2.5 relative z-10">
            {[{l:'ITEM',v:product.name},{l:'UNIT PRICE',v:`${finalPrice.toLocaleString()} دج`},{l:'QUANTITY',v:`× ${formData.quantity}`},{l:'LOGISTICS',v:selectedWilayaData?`${getPriceLivraison().toLocaleString()} دج`:'TBD'}].map(row=>(
              <div key={row.l} className="flex justify-between items-center">
                <span className="spec-label">{row.l}</span>
                <span className="text-xs font-bold" style={{ color:'var(--cream)' }}>{customLengthName(row.v , 20)}</span>
              </div>
            ))}
            <div className="pt-3" style={{ borderTop:'1px solid var(--border)' }}>
              <div className="flex justify-between items-baseline">
                <span className="spec-label">TOTAL COST</span>
                <span className="font-bold" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2.2rem', color:'var(--rust-lt)', letterSpacing:'0.06em' }}>
                  {getTotalPrice().toLocaleString()}<span className="text-sm ml-1">دج</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-alpine w-full py-4 flex items-center justify-center gap-3 text-sm font-bold tracking-[0.18em] text-white"
          style={{ background:submitting?'var(--slate-md)':'linear-gradient(135deg, var(--rust), var(--rust-dk))', boxShadow:submitting?'none':'0 8px 32px var(--glow-rust)', cursor:submitting?'not-allowed':'pointer' }}>
          {submitting
            ?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> PROCESSING…</>
            :<><Target className="w-4 h-4"/> CONFIRM ORDER &amp; DEPLOY</>
          }
        </button>
        <p className="text-[9px] text-center font-bold flex items-center justify-center gap-2 tracking-[0.18em]" style={{ color:'var(--text-dim)' }}>
          <Shield className="w-3 h-3"/> ENCRYPTED · SECURE TRANSMISSION
        </p>
      </form>
    </div>
  );
}


// ─── STATIC PAGES ─────────────────────────────────────────────
export function StaticPage({ page }: { page:string }) {
  const p = page.toLowerCase();
  return <>{p==='privacy'&&<Privacy/>}{p==='terms'&&<Terms/>}{p==='cookies'&&<Cookies/>}{p==='contact'&&<Contact/>}</>;
}

function PageWrapper({ children, icon, title, subtitle, code }: { children:React.ReactNode; icon:React.ReactNode; title:string; subtitle:string; code:string }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--slate)', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Header */}
      <div className="relative overflow-hidden py-24 noise-overlay" style={{ backgroundColor:'var(--slate-lt)' }}>
        <div className="absolute inset-0 topo-bg pointer-events-none"/>
        <div className="absolute inset-0 crosshair-grid pointer-events-none opacity-40"/>
        <div className="absolute top-6 right-12 hidden lg:block pointer-events-none opacity-20"><Crosshair size={120} color="var(--ice)" spin/></div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <MountainRange width={1440} height={100} color="rgba(15,25,35,0.9)" accent="rgba(26,40,54,0.8)"/>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 flex items-center justify-center" style={{ border:'1px solid var(--rust)', backgroundColor:'rgba(196,66,26,0.12)', color:'var(--rust-lt)' }}>
              {icon}
            </div>
            <span className="spec-label text-[10px]">REF: {code}</span>
          </div>
          <h1 className="mb-3" style={{ fontFamily:"'Bebas Neue',cursive", fontWeight:400, fontSize:'clamp(3rem,8vw,7rem)', color:'var(--cream)', letterSpacing:'0.08em', lineHeight:0.9 }}>
            {title}
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="h-0.5 w-12" style={{ background:'linear-gradient(90deg, var(--rust), transparent)' }}/>
            <p className="text-sm" style={{ color:'var(--text-b)' }}>{subtitle}</p>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-12 pb-24">{children}</div>
    </div>
  );
}

function InfoCard({ icon, title, desc, badge, badgeColor='var(--ice)' }: { icon:React.ReactNode; title:string; desc:string; badge?:string; badgeColor?:string }) {
  return (
    <div className="flex gap-5 p-5 mb-3 transition-all duration-300 card-alpine cursor-default"
      style={{ border:'1px solid var(--border)', backgroundColor:'var(--slate-lt)' }}>
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ border:`1px solid ${badgeColor}`, color:badgeColor, backgroundColor:`${badgeColor}10` }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="font-bold" style={{ fontFamily:"'Bebas Neue',cursive", fontWeight:400, fontSize:'1.15rem', color:'var(--cream)', letterSpacing:'0.08em' }}>{title}</h3>
          {badge&&<span className="text-[8px] font-bold tracking-[0.2em] px-2 py-1" style={{ border:`1px solid ${badgeColor}40`, color:badgeColor, backgroundColor:`${badgeColor}10` }}>{badge}</span>}
        </div>
        <p className="text-sm leading-relaxed" style={{ color:'var(--text-b)' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper icon={<Lock size={20}/>} title="PRIVACY PROTOCOL" subtitle="How we protect your operational data." code="DOC-PRV-001">
      <DiamondDivider/>
      <InfoCard icon={<Database size={16}/>}    title="DATA COLLECTED"    desc="Only mission-critical info: your name, contact, and delivery details. Nothing more, nothing less." badgeColor="var(--ice)"/>
      <InfoCard icon={<Shield size={16}/>}      title="PROTECTION LEVEL"  desc="Military-grade encryption on all personal data. Your info is locked tighter than a mountain safe." badgeColor="var(--rust-lt)"/>
      <InfoCard icon={<Globe size={16}/>}       title="DATA SHARING"      desc="We never sell your data. Shared only with our trusted logistics partners — and only what's needed." badgeColor="var(--moss-lt)"/>
      <InfoCard icon={<Bell size={16}/>}        title="POLICY UPDATES"    desc="You'll be notified of changes. Full transparency is part of our code of conduct." badgeColor="var(--sand)"/>
      <div className="mt-8 p-4 flex items-center gap-3" style={{ border:'1px solid rgba(120,196,208,0.3)', backgroundColor:'rgba(120,196,208,0.05)' }}>
        <CheckCircle2 size={16} style={{ color:'var(--ice)', flexShrink:0 }}/>
        <p className="spec-label">LAST UPDATED: FEBRUARY 2026 · REVIEWED QUARTERLY</p>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper icon={<Scale size={20}/>} title="TERMS OF ENGAGEMENT" subtitle="The rules of the field — clear and fair for all operators." code="DOC-TRM-002">
      <DiamondDivider/>
      <InfoCard icon={<User size={16}/>}        title="YOUR ACCOUNT"      desc="Keep your credentials secured. You're fully responsible for all activity under your login." badgeColor="var(--ice)"/>
      <InfoCard icon={<CreditCard size={16}/>}  title="PAYMENTS"          desc="All prices displayed are final with zero hidden charges. What you see in the field, you pay." badgeColor="var(--sand)"/>
      <InfoCard icon={<Ban size={16}/>}         title="PROHIBITED ITEMS"  desc="No counterfeit, dangerous, or prohibited goods. We maintain a safe and honest marketplace." badgeColor="var(--rust-lt)"/>
      <InfoCard icon={<Scale size={16}/>}       title="GOVERNING LAW"     desc="All disputes governed by Algerian law. Resolved fairly through established legal procedures." badgeColor="var(--moss-lt)"/>
      <div className="mt-8 p-4 flex items-start gap-3" style={{ border:'1px solid rgba(196,66,26,0.3)', backgroundColor:'rgba(196,66,26,0.05)' }}>
        <AlertCircle size={16} style={{ color:'var(--rust-lt)', flexShrink:0, marginTop:2 }}/>
        <p className="spec-label">TERMS MAY BE UPDATED. CONTINUED USE CONSTITUTES ACCEPTANCE OF CURRENT VERSION.</p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={20}/>} title="COOKIE DEPLOYMENT" subtitle="Small files that make your mission smoother." code="DOC-CKI-003">
      <DiamondDivider/>
      <InfoCard icon={<ShieldCheck size={16}/>}   title="ESSENTIAL COOKIES"   desc="Core operations — keeps your session active, cart live, and store functional. Cannot be disabled." badge="ALWAYS ACTIVE" badgeColor="var(--moss-lt)"/>
      <InfoCard icon={<Settings size={16}/>}      title="PREFERENCE COOKIES"  desc="Remembers your terrain settings: language, region, and display preferences." badge="OPTIONAL" badgeColor="var(--ice)"/>
      <InfoCard icon={<MousePointer2 size={16}/>} title="ANALYTICS COOKIES"   desc="Helps us improve your route through the store. Fully anonymized navigation data." badge="OPTIONAL" badgeColor="var(--sand)"/>
      <div className="mt-8 p-5" style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(15,25,35,0.5)' }}>
        <div className="flex gap-4 items-start">
          <ToggleRight size={18} style={{ color:'var(--rust-lt)', flexShrink:0, marginTop:2 }}/>
          <div>
            <p className="font-bold mb-1" style={{ fontFamily:"'Bebas Neue',cursive", fontWeight:400, fontSize:'1.2rem', color:'var(--cream)', letterSpacing:'0.08em' }}>YOUR COOKIE CONTROL</p>
            <p className="text-sm leading-relaxed" style={{ color:'var(--text-b)' }}>Adjust cookie preferences via browser settings anytime. Optional cookies can be disabled without breaking core functionality.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export function Contact() {
  const [formState,setFormState] = useState({ name:'', email:'', message:'' });
  const [sent,setSent] = useState(false);
  const channels = [
    { emoji:'📡', label:'FREQUENCY', val:'hello@outdoor.dz', href:'mailto:hello@outdoor.dz' },
    { emoji:'📞', label:'RADIO',     val:'+213 550 123 456', href:'tel:+213550123456'        },
    { emoji:'📍', label:'BASE CAMP', val:'Alger, Algérie',   href:undefined                 },
  ];
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--slate)', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-28 noise-overlay" style={{ backgroundColor:'var(--slate-lt)' }}>
        <div className="absolute inset-0 topo-bg pointer-events-none"/>
        <div className="absolute inset-0 crosshair-grid pointer-events-none opacity-40"/>
        <div className="absolute top-8 right-12 hidden lg:block pointer-events-none opacity-20"><Crosshair size={150} color="var(--ice)" spin/></div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <MountainRange width={1440} height={120} color="rgba(15,25,35,0.9)" accent="rgba(26,40,54,0.8)"/>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-xs font-bold tracking-[0.2em]"
            style={{ border:'1px solid rgba(196,66,26,0.4)', backgroundColor:'rgba(196,66,26,0.1)', color:'var(--rust-lt)' }}>
            <Compass className="w-3 h-3"/> OPEN CHANNEL
          </div>
          <h1 className="mb-4" style={{ fontFamily:"'Bebas Neue',cursive", fontWeight:400, fontSize:'clamp(4rem,12vw,10rem)', color:'var(--cream)', letterSpacing:'0.06em', lineHeight:0.9 }}>
            TRANSMIT
          </h1>
          <p className="text-base" style={{ color:'var(--text-b)' }}>We respond within 24 hours. No matter the altitude.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Channels */}
          <div>
            <p className="spec-label mb-6">// CONTACT CHANNELS</p>
            <div className="space-y-2">
              {channels.map(item=>(
                <a key={item.label} href={item.href||'#'} className="card-alpine flex items-center gap-4 p-5 transition-all" style={{ border:'1px solid var(--border)', backgroundColor:'var(--slate-lt)', textDecoration:'none' }}>
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="spec-label">{item.label}</p>
                    <p className="text-sm font-bold" style={{ color:'var(--cream)' }}>{item.val}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" style={{ color:'var(--ice)' }}/>
                </a>
              ))}
            </div>
            {/* Status panel */}
            <div className="mt-6 p-5 crosshair-grid" style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(15,25,35,0.5)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2" style={{ backgroundColor:'var(--moss-lt)', animation:'blink-dot 1.5s ease-in-out infinite' }}/>
                <p className="spec-label">COMMAND CENTER STATUS</p>
              </div>
              {[{l:'RESPONSE TIME',v:'< 24 HOURS'},{l:'CURRENT STATUS',v:'OPERATIONAL'},{l:'TEAM ONLINE',v:'YES'}].map(r=>(
                <div key={r.l} className="flex justify-between items-center py-1.5" style={{ borderBottom:'1px solid var(--border)' }}>
                  <span className="spec-label">{r.l}</span>
                  <span className="text-xs font-bold" style={{ fontFamily:"'Bebas Neue',cursive", color:'var(--ice)', letterSpacing:'0.08em' }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            <p className="spec-label mb-6">// TRANSMIT MESSAGE</p>
            {sent?(
              <div className="py-20 text-center crosshair-grid" style={{ border:'1px dashed var(--border-lt)' }}>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color:'var(--moss-lt)' }}/>
                <p className="font-bold" style={{ fontFamily:"'Bebas Neue',cursive", fontWeight:400, fontSize:'2rem', color:'var(--cream)', letterSpacing:'0.1em' }}>MESSAGE TRANSMITTED</p>
                <p className="spec-label mt-2">WE'LL RESPOND WITHIN 24 HOURS</p>
              </div>
            ):(
              <form onSubmit={e=>{e.preventDefault();setSent(true);}} className="space-y-4">
                {[{label:'// OPERATOR NAME',type:'text',val:formState.name,ph:'Your name',key:'name'},{label:'// EMAIL FREQ.',type:'email',val:formState.email,ph:'your@email.com',key:'email'}].map(f=>(
                  <FieldWrapper key={f.key} label={f.label}>
                    <input type={f.type} value={f.val} onChange={e=>setFormState({...formState,[f.key]:e.target.value})} placeholder={f.ph} style={inputSt()} required
                      onFocus={e=>{e.target.style.borderColor='var(--ice)';e.target.style.boxShadow='0 0 0 3px rgba(120,196,208,0.12)';}}
                      onBlur={e=>{e.target.style.borderColor='var(--border-lt)';e.target.style.boxShadow='none';}}/>
                  </FieldWrapper>
                ))}
                <FieldWrapper label="// MESSAGE CONTENT">
                  <textarea value={formState.message} onChange={e=>setFormState({...formState,message:e.target.value})} placeholder="Your message..." rows={5}
                    style={{ ...inputSt(), resize:'none' as any }} required
                    onFocus={e=>{e.target.style.borderColor='var(--ice)';e.target.style.boxShadow='0 0 0 3px rgba(120,196,208,0.12)';}}
                    onBlur={e=>{e.target.style.borderColor='var(--border-lt)';e.target.style.boxShadow='none';}}/>
                </FieldWrapper>
                <button type="submit" className="btn-alpine w-full py-4 flex items-center justify-center gap-2 text-sm font-bold tracking-[0.18em] text-white"
                  style={{ background:'linear-gradient(135deg, var(--rust), var(--rust-dk))', boxShadow:'0 8px 32px var(--glow-rust)' }}>
                  <Target className="w-4 h-4"/> TRANSMIT MESSAGE
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}