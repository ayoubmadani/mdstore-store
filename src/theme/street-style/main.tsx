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
  Shield, ArrowRight, Zap, Tag, Truck, Package,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

// ─── DESIGN SYSTEM ─────────────────────────────────────────────
const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

  :root {
    --ink:       #0B0B0B;
    --ink-2:     #161616;
    --ink-3:     #222222;
    --volt:      #DFFF00;
    --volt-dk:   #B8D400;
    --acid:      #FF3CAC;
    --acid-dk:   #CC2080;
    --sky:       #00C8FF;
    --sky-dk:    #009AC4;
    --chalk:     #F5F5F0;
    --chalk-dk:  #E0E0D8;
    --mid:       #888880;
    --dim:       #555550;
    --border:    rgba(245,245,240,0.12);
    --border-lt: rgba(245,245,240,0.22);
    --glow-volt: rgba(223,255,0,0.30);
    --glow-acid: rgba(255,60,172,0.30);
    --glow-sky:  rgba(0,200,255,0.25);
  }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:var(--ink); }
  ::-webkit-scrollbar-thumb { background:var(--volt); }

  @keyframes glitch-h {
    0%,94%,100% { transform:translateX(0); clip-path:none; }
    95% { transform:translateX(-4px); clip-path:inset(30% 0 50% 0); }
    97% { transform:translateX(4px);  clip-path:inset(60% 0 10% 0); }
    99% { transform:translateX(-2px); clip-path:inset(10% 0 80% 0); }
  }
  @keyframes marquee-st { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
  @keyframes scan       { 0%{top:-20%;} 100%{top:120%;} }
  @keyframes blink      { 0%,100%{opacity:1;} 49%{opacity:1;} 50%{opacity:0;} }
  @keyframes slide-up   { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }
  @keyframes pop-in     { 0%{opacity:0;transform:scale(0.85) rotate(-3deg);} 60%{transform:scale(1.04) rotate(1deg);} 100%{opacity:1;transform:scale(1) rotate(0deg);} }
  @keyframes spin-slow  { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  @keyframes flicker    { 0%,100%{opacity:1;} 92%{opacity:1;} 93%{opacity:0.4;} 95%{opacity:1;} 97%{opacity:0.6;} 98%{opacity:1;} }

  .slide-up    { animation: slide-up 0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .slide-up-d1 { animation-delay:0.10s; }
  .slide-up-d2 { animation-delay:0.22s; }
  .slide-up-d3 { animation-delay:0.36s; }
  .slide-up-d4 { animation-delay:0.52s; }

  /* Halftone dot pattern */
  .halftone {
    background-image: radial-gradient(circle, rgba(245,245,240,0.08) 1px, transparent 1px);
    background-size: 18px 18px;
  }

  /* Spray paint noise */
  .spray::before {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='sp'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23sp)' opacity='0.05'/%3E%3C/svg%3E");
    opacity:0.07; mix-blend-mode:screen;
  }

  /* Scan line overlay */
  .scanlines::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:2;
    background: repeating-linear-gradient(
      0deg, transparent 0px, transparent 3px,
      rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px
    );
  }

  .card-street {
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease;
  }
  .card-street:hover { transform:translateY(-6px) rotate(-0.5deg); }

  .btn-street {
    position:relative; overflow:hidden;
    transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 100%, 14px 100%);
  }
  .btn-street:hover { transform:translateY(-2px); filter:brightness(1.08); }
  .btn-street::after {
    content:''; position:absolute; top:0; left:-80%; width:50%; height:100%;
    background:rgba(255,255,255,0.18); transform:skewX(-20deg);
    transition: left 0.5s ease;
  }
  .btn-street:hover::after { left:130%; }

  .tag-volt  { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;font-size:9px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;font-family:'DM Mono',monospace;background:var(--volt);color:var(--ink); }
  .tag-acid  { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;font-size:9px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;font-family:'DM Mono',monospace;background:var(--acid);color:white; }
  .tag-sky   { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;font-size:9px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;font-family:'DM Mono',monospace;background:var(--sky);color:var(--ink); }
  .tag-ghost { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;font-size:9px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;font-family:'DM Mono',monospace;border:1px solid var(--border-lt);color:var(--mid); }

  .glitch { animation: glitch-h 6s ease-in-out infinite; display:inline-block; }
  .mono { font-family:'DM Mono',monospace; }
  .syne { font-family:'Syne',sans-serif; }

  .marquee-wrap  { overflow:hidden; white-space:nowrap; }
  .marquee-inner { display:inline-block; animation:marquee-st 18s linear infinite; }

  /* Sticker badge */
  .sticker {
    display:inline-flex; align-items:center; justify-content:center;
    padding:6px 14px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em;
    clip-path:polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    font-family:'Syne',sans-serif;
  }

  /* Live indicator */
  .live-dot::before {
    content:''; display:inline-block; width:6px; height:6px; border-radius:50%;
    background:var(--volt); margin-right:6px; animation:blink 1.2s step-end infinite;
    box-shadow:0 0 8px var(--glow-volt);
  }
`;

// ─── SVG ELEMENTS ──────────────────────────────────────────────
function SprayCircle({ size=200, color='var(--volt)', opacity=0.15 }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={{ position:'absolute', pointerEvents:'none' }}>
      <defs>
        <radialGradient id={`sg${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={opacity * 2}/>
          <stop offset="50%" stopColor={color} stopOpacity={opacity}/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
        <filter id={`sf${size}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/><feDisplacementMap in="SourceGraphic" scale="20"/></filter>
      </defs>
      <circle cx="100" cy="100" r="95" fill={`url(#sg${size})`} filter={`url(#sf${size})`}/>
    </svg>
  );
}

function GridLines() {
  return (
    <svg width="100%" height="100%" style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.06 }}>
      <defs>
        <pattern id="gp" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(245,245,240,1)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gp)"/>
    </svg>
  );
}

function TagSVG({ size=32, color='var(--volt)' }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 4h11l13 13-11 11L4 15V4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="9" cy="9" r="2" fill={color}/>
    </svg>
  );
}

// ─── TYPES ─────────────────────────────────────────────────────
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
  return Object.entries(sel).every(([n,v])=>d.name.some(e=>e.attrName===n&&e.value===v));
}
const fetchWilayas  = async (uid:string): Promise<Wilaya[]>  => { try { const {data}=await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }};
const fetchCommunes = async (wid:string): Promise<Commune[]> => { try { const {data}=await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }};

// ─── MAIN ──────────────────────────────────────────────────────
export default function Main({ store, children }: any) {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--ink)', fontFamily:"'DM Mono',monospace", color:'var(--chalk)' }}>
      <style>{FONT_CSS}</style>
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="marquee-wrap py-2" style={{ backgroundColor:'var(--volt)' }}>
          <div className="marquee-inner">
            {Array(12).fill(null).map((_,i)=>(
              <span key={i} className="mx-8 text-[10px] font-bold tracking-[0.2em] uppercase inline-flex items-center gap-3" style={{ color:'var(--ink)', fontFamily:"'DM Mono',monospace" }}>
                ★ {store.topBar.text}
              </span>
            ))}
            {Array(12).fill(null).map((_,i)=>(
              <span key={`b${i}`} className="mx-8 text-[10px] font-bold tracking-[0.2em] uppercase inline-flex items-center gap-3" style={{ color:'var(--ink)', fontFamily:"'DM Mono',monospace" }}>
                ★ {store.topBar.text}
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

// ─── NAVBAR ────────────────────────────────────────────────────
export function Navbar({ store }: { store: Store }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRTL = store.language === 'ar';
  useEffect(()=>{ const h=()=>setScrolled(window.scrollY>20); window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h); },[]);
  const nav = [
    { href:`/${store.subdomain}`,         label:isRTL?'الرئيسية':'DROP'    },
    { href:`/${store.subdomain}/contact`, label:isRTL?'اتصل بنا':'HIT US'  },
    { href:`/${store.subdomain}/Privacy`, label:isRTL?'الخصوصية':'POLICY'  },
  ];
  const initials = store.name.split(' ').filter(Boolean).map((w:string)=>w[0]).join('').slice(0,2).toUpperCase();
  return (
    <nav className="sticky top-0 z-50 transition-all duration-300" dir={isRTL?'rtl':'ltr'}
      style={{ backgroundColor:scrolled?'rgba(11,11,11,0.97)':'var(--ink)', backdropFilter:scrolled?'blur(20px)':'none', borderBottom:`1px solid ${scrolled?'rgba(223,255,0,0.3)':'transparent'}` }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href={`/${store.subdomain}`} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden transition-all group-hover:scale-105"
              style={{ background:'var(--volt)', clipPath:'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}>
              {store.design.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} className="w-full h-full object-cover"/>
                : <span className="syne font-bold text-sm" style={{ color:'var(--ink)' }}>{initials}</span>
              }
            </div>
            <div>
              <span className="syne font-bold block" style={{ fontSize:'1.2rem', color:'var(--chalk)', letterSpacing:'0.06em', lineHeight:1 }}>
                {store.name.toUpperCase()}
              </span>
              <span className="mono text-[8px] tracking-[0.2em]" style={{ color:'var(--volt)' }}>
                <span className="live-dot"/>{isRTL?'متجر الملابس':'STREETWEAR'}
              </span>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-7">
            {nav.map(item=>(
              <Link key={item.href} href={item.href}
                className="relative mono text-[10px] font-medium tracking-[0.2em] transition-all group"
                style={{ color:'var(--mid)' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--volt)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full transition-all duration-300" style={{ background:'var(--volt)' }}/>
              </Link>
            ))}
            <Link href={`/${store.subdomain}`}
              className="btn-street flex items-center gap-2 px-7 py-2.5 mono text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ background:'var(--volt)', color:'var(--ink)' }}>
              <Zap className="w-3.5 h-3.5"/> {isRTL?'تسوق':'SHOP'}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={()=>setMenuOpen(p=>!p)} className="md:hidden w-9 h-9 flex items-center justify-center"
            style={{ border:'1px solid var(--border-lt)', color:'var(--volt)', backgroundColor:'transparent' }}>
            {menuOpen?<X className="w-4 h-4"/>:<Tag className="w-4 h-4"/>}
          </button>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen?'max-h-48 pb-5':'max-h-0'}`}>
          <div className="space-y-1 pt-3" style={{ borderTop:'1px solid var(--border)' }}>
            {nav.map(item=>(
              <Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)}
                className="flex items-center justify-between px-2 py-3 mono text-[10px] tracking-[0.2em] transition-all"
                style={{ color:'var(--mid)' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--volt)'; el.style.paddingLeft='12px';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--mid)'; el.style.paddingLeft='8px';}}>
                {item.label} <ArrowRight className="w-3 h-3"/>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="h-px" style={{ background:'linear-gradient(90deg, transparent, var(--volt) 30%, var(--acid) 70%, transparent)', opacity:0.5 }}/>
    </nav>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────
export function Footer({ store }: any) {
  const isRTL = store.language === 'ar';
  const tags = isRTL
    ? ['#ستايل','#موضة','#شارع','#أصيل','#لوكل']
    : ['#STREETWEAR','#LOCALDRIP','#FRESHFIT','#NOCAP','#AUTHENTIC'];
  return (
    <footer className="relative spray scanlines overflow-hidden" style={{ backgroundColor:'#080808', fontFamily:"'DM Mono',monospace" }}>
      <GridLines/>
      <div className="h-1" style={{ background:'linear-gradient(90deg, var(--acid), var(--volt), var(--sky), var(--acid))' }}/>
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12" style={{ borderBottom:'1px solid var(--border)' }}>
          {/* Brand */}
          <div className="space-y-6">
            <div>
              <p className="syne font-bold mb-1" style={{ fontSize:'2rem', color:'var(--chalk)', letterSpacing:'0.06em', lineHeight:1 }}>
                {store.name.toUpperCase()}
              </p>
              <p className="mono text-[8px] tracking-[0.22em]" style={{ color:'var(--volt)' }}>
                <span className="live-dot"/>EST. {new Date().getFullYear()} · STREETWEAR
              </p>
            </div>
            <p className="mono text-xs font-light leading-relaxed" style={{ color:'var(--dim)' }}>
              {isRTL?'ملابس الشارع الأصيلة. نصنع الهوية، ليس فقط الملابس.':'Authentic streetwear. We make identity, not just clothes.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0,3).map(t=>(
                <span key={t} className="mono text-[8px] tracking-[0.12em]" style={{ border:'1px solid var(--border)', color:'var(--dim)', padding:'3px 8px' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="mono text-[8px] tracking-[0.22em] mb-5" style={{ color:'var(--volt)' }}>// NAVIGATE</p>
            <div className="space-y-2.5">
              {[
                { href:`/${store.subdomain}/Privacy`, label:'PRIVACY.EXE'  },
                { href:`/${store.subdomain}/Terms`,   label:'TERMS.EXE'    },
                { href:`/${store.subdomain}/Cookies`, label:'COOKIES.EXE'  },
                { href:`/${store.subdomain}/contact`, label:'CONTACT.EXE'  },
              ].map(l=>(
                <a key={l.href} href={l.href}
                  className="flex items-center gap-2 mono text-[10px] tracking-[0.15em] transition-all"
                  style={{ color:'var(--dim)', borderLeft:'2px solid transparent', paddingLeft:'0', display:'flex' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--volt)'; el.style.borderLeftColor='var(--volt)'; el.style.paddingLeft='8px';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--dim)'; el.style.borderLeftColor='transparent'; el.style.paddingLeft='0';}}>
                  <ArrowRight className="w-3 h-3 opacity-40"/> {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Tags cloud */}
          <div>
            <p className="mono text-[8px] tracking-[0.22em] mb-5" style={{ color:'var(--acid)' }}>// TAGGED</p>
            <div className="flex flex-wrap gap-2">
              {(isRTL
                ? ['#ستايل','#موضة','#شارع','#أصيل','#لوكل','#دروب','#هيبهوب','#سويت']
                : ['#STREETWEAR','#FRESHFIT','#LOCALDRIP','#NOCAP','#DRIP','#HYPE','#AUTHENTIC','#LOWKEY']
              ).map((t,i)=>{
                const cols=['var(--volt)','var(--acid)','var(--sky)','var(--chalk)'];
                return <span key={t} className="mono text-[8px] tracking-[0.1em] px-2 py-1.5" style={{ border:`1px solid ${cols[i%4]}30`, color:cols[i%4], opacity:0.6+i*0.05 }}>{t}</span>;
              })}
            </div>
            <div className="mt-6 p-4" style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(223,255,0,0.04)' }}>
              <p className="syne font-bold mb-1" style={{ color:'var(--volt)', fontSize:'1.1rem', letterSpacing:'0.06em' }}>STAY FRESH.</p>
              <p className="mono text-[9px]" style={{ color:'var(--dim)' }}>NEW DROPS EVERY WEEK.</p>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="mono text-[8px] tracking-[0.16em]" style={{ color:'var(--dim)' }}>© {new Date().getFullYear()} {store.name.toUpperCase()} · ALL RIGHTS RESERVED</p>
          <p className="mono text-[8px] tracking-[0.14em]" style={{ color:'var(--dim)' }}>STREET STYLE THEME · V2.0</p>
        </div>
      </div>
    </footer>
  );
}

// ─── CARD ──────────────────────────────────────────────────────
export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const [hovered, setHovered] = useState(false);
  const accents = ['var(--volt)','var(--acid)','var(--sky)','var(--chalk)','var(--volt)'];
  const accent  = accents[parseInt(product.id,10) % accents.length] || accents[0];
  return (
    <div className="card-street flex flex-col overflow-hidden"
      style={{ backgroundColor:'var(--ink-2)', border:'1px solid var(--border)' }}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio:'3/4', backgroundColor:'var(--ink-3)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500" style={{ transform:hovered?'scale(1.06)':'scale(1)' }}/>
          : <div className="w-full h-full flex flex-col items-center justify-center halftone gap-3">
              <Tag className="w-12 h-12" style={{ color:'var(--ink-3)' }}/>
              <span className="mono text-[9px] tracking-[0.2em]" style={{ color:'var(--dim)' }}>NO IMAGE</span>
            </div>
        }
        {/* Overlay gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(to bottom, transparent 50%, rgba(11,11,11,0.85) 100%)' }}/>

        {/* Tags */}
        <div className="absolute top-3 left-0 flex flex-col gap-1.5">
          {discount > 0 && <span className="sticker mono text-[9px]" style={{ background:'var(--acid)', color:'white', fontSize:'9px' }}>-{discount}%</span>}
          <span className="sticker mono text-[9px]" style={{ background:accent, color:accent==='var(--chalk)'?'var(--ink)':accent==='var(--volt)'?'var(--ink)':'white', fontSize:'9px' }}>NEW</span>
        </div>

        {/* Wishlist */}
        <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-300"
          style={{ border:`1px solid ${accent}`, backgroundColor:'rgba(11,11,11,0.7)', color:accent, opacity:hovered?1:0, transform:hovered?'scale(1)':'scale(0.7)' }}>
          <Heart className="w-3.5 h-3.5"/>
        </button>

        {/* CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-3 transition-all duration-350"
          style={{ transform:hovered?'translateY(0)':'translateY(110%)', opacity:hovered?1:0 }}>
          <Link href={`/${store.subdomain}/product/${product.slug||product.id}`}
            className="btn-street flex items-center justify-center gap-2 w-full py-3 mono text-[10px] font-bold tracking-[0.18em] uppercase"
            style={{ background:accent, color:accent==='var(--chalk)'?'var(--ink)':accent==='var(--volt)'?'var(--ink)':'white' }}>
            <Zap className="w-3.5 h-3.5"/> {viewDetails}
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_,i)=><Star key={i} className={`w-2.5 h-2.5 ${i<4?'fill-current':''}`} style={{ color:'var(--volt)' }}/>)}
        </div>
        <h3 className="syne font-bold mb-2 leading-tight line-clamp-2"
          style={{ fontSize:'1rem', color:'var(--chalk)', letterSpacing:'0.04em' }}>
          {product.name}
        </h3>
        <div className="mt-auto pt-3 flex items-end justify-between" style={{ borderTop:'1px solid var(--border)' }}>
          <div>
            <p className="mono text-[8px] tracking-[0.16em] mb-0.5" style={{ color:'var(--dim)' }}>PRICE</p>
            <span className="syne font-bold" style={{ fontSize:'1.4rem', color:accent, letterSpacing:'0.02em', lineHeight:1 }}>
              {product.price}
            </span>
            <span className="mono ml-1 text-[9px]" style={{ color:'var(--dim)' }}>{store.currency}</span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="mono ml-2 text-[9px] line-through" style={{ color:'var(--dim)' }}>{product.priceOriginal}</span>
            )}
          </div>
          <div className="w-8 h-8 flex items-center justify-center transition-all" style={{ border:`1px solid ${accent}`, color:accent, backgroundColor:`${accent}10` }}>
            <ArrowRight className="w-3.5 h-3.5"/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HOME ──────────────────────────────────────────────────────
export function Home({ store }: any) {
  const isRTL = store.language === 'ar';
  const dir   = isRTL ? 'rtl' : 'ltr';
  const t = {
    badge:       isRTL?'🔥 أحدث الإصدارات':'🔥 LATEST DROP',
    heroLine1:   isRTL?'ارتدِ':'WEAR YOUR',
    heroLine2:   isRTL?'هويتك':'IDENTITY',
    heroBadge:   isRTL?'مجموعة جديدة — متوفرة الآن':'NEW COLLECTION — AVAILABLE NOW',
    heroSub:     isRTL?'ملابس الشارع الأصيلة لمن يصنعون الثقافة.':'Authentic streetwear for those who make the culture.',
    heroBtn:     isRTL?'شوف الكولكشن':'SHOP THE DROP',
    heroBtn2:    isRTL?'استكشف الفئات':'BROWSE FITS',
    categories:  isRTL?'تصفح حسب الستايل':'BROWSE BY STYLE',
    all:         isRTL?'الكل':'ALL FITS',
    products:    isRTL?'الكولكشن الكاملة':'THE FULL DROP',
    noProducts:  isRTL?'لا توجد منتجات بعد':'NO DROPS YET',
    viewDetails: isRTL?'شوف التفاصيل':'VIEW PIECE',
  };

  const stats = [
    { val:'100%', label:isRTL?'أصيل':'AUTHENTIC' },
    { val:'48H',  label:isRTL?'توصيل':'DELIVERY'  },
    { val:'5K+',  label:isRTL?'زبون':'CUSTOMERS' },
    { val:'FREE', label:isRTL?'إرجاع سهل':'RETURNS' },
  ];

  return (
    <div dir={dir} style={{ backgroundColor:'var(--ink)', fontFamily:"'DM Mono',monospace" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden spray scanlines" style={{ minHeight:'100vh', display:'flex', alignItems:'center', backgroundColor:'var(--ink)' }}>
        <GridLines/>
        {/* Spray blobs */}
        <div className="absolute -top-20 -left-20 pointer-events-none" style={{ zIndex:0 }}>
          <SprayCircle size={500} color="var(--volt)" opacity={0.06}/>
        </div>
        <div className="absolute -bottom-20 -right-20 pointer-events-none" style={{ zIndex:0 }}>
          <SprayCircle size={400} color="var(--acid)" opacity={0.07}/>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex:0 }}>
          <SprayCircle size={700} color="var(--sky)" opacity={0.03}/>
        </div>

        {/* Hero image */}
        {store.hero?.imageUrl && (
          <div className="absolute inset-0 pointer-events-none">
            <img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity:0.08, filter:'grayscale(100%) contrast(1.3)' }}/>
          </div>
        )}

        {/* Halftone dots right side */}
        <div className="absolute top-0 right-0 bottom-0 w-1/2 halftone pointer-events-none opacity-30"/>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="slide-up inline-flex items-center gap-3 mb-6">
              <span className="sticker mono text-[9px]" style={{ background:'var(--acid)', color:'white' }}>
                {t.badge}
              </span>
              <span className="mono text-[8px] tracking-[0.18em]" style={{ color:'var(--dim)' }}>
                SS25 / ALGIERS
              </span>
            </div>

            {/* Main headline */}
            <div className="mb-4">
              <p className="slide-up slide-up-d1 syne font-bold leading-none" style={{ fontSize:'clamp(1rem,4vw,1.6rem)', color:'var(--volt)', letterSpacing:'0.14em' }}>
                {t.heroLine1}
              </p>
              <h1 className="slide-up slide-up-d1 glitch syne font-bold leading-none" style={{ fontSize:'clamp(5rem,16vw,14rem)', color:'var(--chalk)', letterSpacing:'-0.01em', lineHeight:0.88 }}>
                {store.hero?.title || t.heroLine2}
              </h1>
            </div>

            {/* Ticker */}
            <div className="slide-up slide-up-d2 inline-flex items-center gap-3 mb-6 py-2 px-4" style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(245,245,240,0.04)' }}>
              <TagSVG size={14} color="var(--acid)"/>
              <span className="mono text-[9px] tracking-[0.2em]" style={{ color:'var(--mid)' }}>{t.heroBadge}</span>
            </div>

            <p className="slide-up slide-up-d2 mono text-sm font-light leading-relaxed mb-10 max-w-md" style={{ color:'var(--mid)' }}>
              {store.hero?.subtitle || t.heroSub}
            </p>

            {/* CTAs */}
            <div className="slide-up slide-up-d3 flex flex-wrap gap-4 mb-12">
              <a href="#products"
                className="btn-street flex items-center gap-2.5 px-10 py-4 mono text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ background:'var(--volt)', color:'var(--ink)', boxShadow:`0 8px 32px var(--glow-volt)` }}>
                <Zap className="w-4 h-4"/> {t.heroBtn}
              </a>
              <a href="#categories"
                className="btn-street flex items-center gap-2.5 px-10 py-4 mono text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ border:'1px solid var(--border-lt)', color:'var(--chalk)', backgroundColor:'transparent' }}>
                {t.heroBtn2} <ArrowRight className="w-4 h-4"/>
              </a>
            </div>

            {/* Stats */}
            <div className="slide-up slide-up-d4 grid grid-cols-4 gap-px" style={{ border:'1px solid var(--border)', backgroundColor:'var(--border)' }}>
              {stats.map((s,i)=>(
                <div key={i} className="flex flex-col gap-1 py-4 px-3" style={{ backgroundColor:'var(--ink-2)' }}>
                  <span className="syne font-bold" style={{ fontSize:'1.4rem', color:['var(--volt)','var(--acid)','var(--sky)','var(--chalk)'][i], letterSpacing:'0.04em', lineHeight:1 }}>{s.val}</span>
                  <span className="mono text-[8px] tracking-[0.18em]" style={{ color:'var(--dim)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background:'linear-gradient(90deg, var(--volt), var(--acid), var(--sky), var(--volt))' }}/>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-20" style={{ backgroundColor:'var(--ink-2)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="mono text-[8px] tracking-[0.22em] mb-2" style={{ color:'var(--volt)' }}>// STYLE FILTER</p>
              <h2 className="syne font-bold" style={{ fontSize:'clamp(1.8rem,4vw,3rem)', color:'var(--chalk)', letterSpacing:'0.04em', lineHeight:1 }}>{t.categories}</h2>
            </div>
            <TagSVG size={36} color="rgba(223,255,0,0.3)"/>
          </div>
          {store.categories?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              <Link href={`/${store.domain}`}
                className="btn-street flex items-center gap-2 px-7 py-3 mono text-[10px] font-bold tracking-[0.18em] uppercase"
                style={{ background:'var(--volt)', color:'var(--ink)' }}>
                <Zap className="w-3 h-3"/> {t.all}
              </Link>
              {store.categories.map((cat:any, idx:number)=>{
                const cols=['var(--acid)','var(--sky)','var(--chalk)','var(--volt)'];
                const col = cols[idx % cols.length];
                return (
                  <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                    className="btn-street flex items-center gap-2 px-7 py-3 mono text-[10px] font-bold tracking-[0.18em] uppercase transition-all"
                    style={{ border:`1px solid ${col}`, color:col, backgroundColor:'transparent' }}
                    onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background=col; el.style.color=col==='var(--chalk)'||col==='var(--volt)'?'var(--ink)':'white';}}
                    onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.color=col;}}>
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center halftone" style={{ border:'1px dashed var(--border-lt)' }}>
              <Tag className="w-12 h-12 mx-auto mb-3" style={{ color:'var(--ink-3)' }}/>
              <p className="mono text-[9px] tracking-[0.2em]" style={{ color:'var(--dim)' }}>NO CATEGORIES YET</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="py-20" style={{ backgroundColor:'var(--ink)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="mono text-[8px] tracking-[0.22em] mb-2" style={{ color:'var(--acid)' }}>// GEAR UP</p>
              <h2 className="syne font-bold" style={{ fontSize:'clamp(1.8rem,4vw,3rem)', color:'var(--chalk)', letterSpacing:'0.04em', lineHeight:1 }}>{t.products}</h2>
              <p className="mono text-[8px] mt-1 tracking-[0.16em]" style={{ color:'var(--dim)' }}>{store.products?.length||0} PIECES AVAILABLE</p>
            </div>
            <div style={{ animation:'spin-slow 20s linear infinite' }}>
              <SprayCircle size={80} color="var(--acid)" opacity={0.3}/>
            </div>
          </div>
          {store.products?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px" style={{ border:'1px solid var(--border)', backgroundColor:'var(--border)' }}>
              {store.products.map((product:any)=>{
                const displayImage = product.productImage||product.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                const discount = product.priceOriginal ? Math.round(((product.priceOriginal-product.price)/product.priceOriginal)*100) : 0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails}/>;
              })}
            </div>
          ) : (
            <div className="py-44 text-center halftone" style={{ border:'1px dashed var(--border-lt)' }}>
              <Tag className="w-16 h-16 mx-auto mb-4" style={{ color:'var(--ink-3)' }}/>
              <p className="syne font-bold" style={{ fontSize:'2rem', color:'var(--dim)', letterSpacing:'0.06em' }}>{t.noProducts}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── MANIFESTO BANNER ── */}
      <section className="relative overflow-hidden spray" style={{ backgroundColor:'var(--ink-2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <GridLines/>
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(223,255,0,0.05) 0%, transparent 70%)' }}/>
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-28 text-center">
          <span className="sticker mono text-[9px] mb-8 inline-block" style={{ background:'var(--acid)', color:'white' }}>
            {isRTL?'تعبير حر':'FREE EXPRESSION'}
          </span>
          <h2 className="syne font-bold mt-6" style={{ fontSize:'clamp(3rem,10vw,9rem)', color:'var(--chalk)', letterSpacing:'-0.01em', lineHeight:0.88 }}>
            {isRTL?'كن\nأصيلاً':'BE\nREAL.'}
          </h2>
          <p className="mono text-xs font-light mt-6 mb-10 max-w-sm mx-auto leading-relaxed" style={{ color:'var(--mid)' }}>
            {isRTL?'الستايل مش كلام — هو هوية، هو موقف، هو من إنت.':'Style is not a statement — it\'s identity, attitude, and authenticity.'}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="#products"
              className="btn-street flex items-center gap-2 px-10 py-4 mono text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ background:'var(--volt)', color:'var(--ink)', boxShadow:`0 8px 32px var(--glow-volt)` }}>
              <Zap className="w-4 h-4"/> {isRTL?'تسوق الآن':'SHOP NOW'}
            </a>
            <a href="#categories"
              className="btn-street flex items-center gap-2 px-10 py-4 mono text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ border:'1px solid var(--acid)', color:'var(--acid)', backgroundColor:'transparent' }}>
              <Tag className="w-4 h-4"/> {isRTL?'الفئات':'FITS'}
            </a>
          </div>
        </div>
        <div className="h-1" style={{ background:'linear-gradient(90deg, var(--sky), var(--volt), var(--acid), var(--sky))' }}/>
      </section>
    </div>
  );
}

// ─── DETAILS ───────────────────────────────────────────────────
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [selectedImage, setSelectedImage] = useState(0);
  const accents = ['var(--volt)','var(--acid)','var(--sky)','var(--chalk)','var(--volt)'];
  const accent  = accents[parseInt(product.id,10) % accents.length] || accents[0];
  const textCol = accent==='var(--chalk)'||accent==='var(--volt)' ? 'var(--ink)' : 'white';

  return (
    <div className="min-h-screen" dir={isRTL?'rtl':'ltr'} style={{ backgroundColor:'var(--ink)', fontFamily:"'DM Mono',monospace" }}>
      {/* Breadcrumb */}
      <header className="py-4 sticky top-0 z-40" style={{ backgroundColor:'rgba(11,11,11,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 mono text-[9px] tracking-[0.16em]" style={{ color:'var(--dim)' }}>
            <span className="hover:text-volt cursor-pointer">{isRTL?'الرئيسية':'HOME'}</span>
            <span style={{ color:'var(--volt)' }}>/</span>
            <span style={{ color:'var(--chalk)' }}>{product.name.toUpperCase()}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className="w-9 h-9 flex items-center justify-center transition-all"
              style={{ border:`1px solid ${isWishlisted?'var(--acid)':'var(--border-lt)'}`, backgroundColor:isWishlisted?'rgba(255,60,172,0.1)':'transparent', color:isWishlisted?'var(--acid)':'var(--mid)' }}>
              <Heart className={`w-3.5 h-3.5 ${isWishlisted?'fill-current':''}`}/>
            </button>
            <button onClick={handleShare} className="w-9 h-9 flex items-center justify-center" style={{ border:'1px solid var(--border)', color:'var(--mid)' }}>
              <Share2 className="w-3.5 h-3.5"/>
            </button>
            <span className={`mono text-[8px] tracking-[0.2em] px-3 py-1.5 ${inStock?'tag-volt':'tag-acid'}`}>
              {inStock?(isRTL?'متوفر':'IN STOCK'):(isRTL?'نفد':'SOLD OUT')}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative overflow-hidden group" style={{ aspectRatio:'3/4', backgroundColor:'var(--ink-3)', border:'1px solid var(--border)' }}>
              {allImages.length>0
                ? <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                : <div className="w-full h-full flex items-center justify-center halftone"><Tag className="w-20 h-20" style={{ color:'var(--ink-2)' }}/></div>
              }
              <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(to bottom, transparent 60%, rgba(11,11,11,0.7) 100%)' }}/>
              {discount>0 && <span className="absolute top-3 left-0 sticker mono text-[9px]" style={{ background:'var(--acid)', color:'white' }}>-{discount}%</span>}
              <button onClick={toggleWishlist} className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center transition-all"
                style={{ border:`1px solid ${accent}`, backgroundColor:'rgba(11,11,11,0.8)', color:accent }}>
                <Heart className={`w-4 h-4 ${isWishlisted?'fill-current':''}`}/>
              </button>
              {allImages.length>1 && (
                <>
                  <button onClick={()=>setSelectedImage(p=>p===0?allImages.length-1:p-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(11,11,11,0.8)', color:'var(--chalk)' }}>
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                  <button onClick={()=>setSelectedImage(p=>p===allImages.length-1?0:p+1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ border:'1px solid var(--border-lt)', backgroundColor:'rgba(11,11,11,0.8)', color:'var(--chalk)' }}>
                    <ChevronRight className="w-4 h-4"/>
                  </button>
                </>
              )}
              {!inStock&&!autoGen && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor:'rgba(11,11,11,0.8)', backdropFilter:'blur(4px)' }}>
                  <span className="sticker syne font-bold" style={{ background:'var(--acid)', color:'white', fontSize:'1.1rem', padding:'8px 24px' }}>SOLD OUT</span>
                </div>
              )}
            </div>

            {allImages.length>1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img:string,idx:number)=>(
                  <button key={idx} onClick={()=>setSelectedImage(idx)} className="shrink-0 w-16 h-20 overflow-hidden transition-all"
                    style={{ border:`2px solid ${selectedImage===idx?accent:'var(--border)'}`, opacity:selectedImage===idx?1:0.45 }}>
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-px" style={{ border:'1px solid var(--border)', backgroundColor:'var(--border)' }}>
              {[{e:'🔒',l:'AUTHENTIC'},{e:'⚡',l:'FAST SHIP'},{e:'🔄',l:'EASY RETURNS'}].map((b,i)=>(
                <div key={i} className="flex flex-col items-center gap-2 py-4" style={{ backgroundColor:'var(--ink-2)' }}>
                  <span className="text-xl">{b.e}</span>
                  <span className="mono text-[8px] tracking-[0.16em] text-center" style={{ color:'var(--dim)' }}>{b.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info panel */}
          <div className="space-y-6">
            <div>
              <p className="mono text-[8px] tracking-[0.22em] mb-3" style={{ color:accent }}>// PIECE DETAILS</p>
              <h1 className="syne font-bold mb-3 leading-tight" style={{ fontSize:'clamp(1.8rem,4vw,3rem)', color:'var(--chalk)', letterSpacing:'0.02em' }}>
                {product.name.toUpperCase()}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{[...Array(5)].map((_,i)=><Star key={i} className={`w-3.5 h-3.5 ${i<4?'fill-current':''}`} style={{ color:'var(--volt)' }}/>)}</div>
                <span className="mono text-[8px] tracking-[0.14em]" style={{ color:'var(--dim)' }}>4.8 / 128 REVIEWS</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-5 relative overflow-hidden" style={{ border:`1px solid ${accent}40`, backgroundColor:'rgba(255,255,255,0.03)' }}>
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background:accent }}/>
              <p className="mono text-[8px] tracking-[0.2em] mb-2 pl-4" style={{ color:'var(--dim)' }}>RETAIL PRICE</p>
              <div className="flex items-baseline gap-3 pl-4">
                <span className="syne font-bold" style={{ fontSize:'4rem', color:accent, lineHeight:1, letterSpacing:'0.02em' }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span className="mono text-sm" style={{ color:'var(--mid)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                  <div>
                    <span className="mono text-xs line-through block" style={{ color:'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                    <span className="mono text-[9px] font-bold" style={{ color:'var(--acid)' }}>SAVE {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 mono text-[8px] tracking-[0.2em] font-bold ${inStock||autoGen?'tag-volt':'tag-acid'}`}>
              {autoGen?<Infinity className="w-3.5 h-3.5"/>:inStock?<span className="w-1.5 h-1.5 bg-ink rounded-full animate-pulse"/>:<X className="w-3.5 h-3.5"/>}
              {autoGen?'UNLIMITED':inStock?'IN STOCK — READY':'SOLD OUT'}
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div>
                <p className="mono text-[8px] tracking-[0.22em] mb-3" style={{ color:accent }}>// SELECT BUNDLE</p>
                <div className="space-y-2">
                  {product.offers.map((offer:any)=>(
                    <label key={offer.id} className="flex items-center justify-between p-4 cursor-pointer transition-all"
                      style={{ border:`1px solid ${selectedOffer===offer.id?accent:'var(--border)'}`, backgroundColor:selectedOffer===offer.id?`${accent}08`:'transparent' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center" style={{ border:`1px solid ${selectedOffer===offer.id?accent:'var(--border)'}` }}>
                          {selectedOffer===offer.id && <div className="w-2 h-2" style={{ background:accent }}/>}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} className="sr-only"/>
                        <div>
                          <p className="mono text-xs font-bold" style={{ color:'var(--chalk)' }}>{offer.name}</p>
                          <p className="mono text-[8px]" style={{ color:'var(--dim)' }}>QTY: {offer.quantity}</p>
                        </div>
                      </div>
                      <span className="syne font-bold" style={{ fontSize:'1.3rem', color:accent }}>{offer.price.toLocaleString()} <span className="mono text-[9px]">دج</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr:any)=>(
              <div key={attr.id}>
                <p className="mono text-[8px] tracking-[0.22em] mb-3" style={{ color:accent }}>// {attr.name.toUpperCase()}</p>
                {attr.displayMode==='color'?(
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any)=>{ const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} className="w-9 h-9 transition-all" style={{ backgroundColor:v.value, boxShadow:s?`0 0 0 2px var(--ink),0 0 0 4px ${accent}`:'0 2px 8px rgba(0,0,0,0.5)', transform:s?'scale(1.15)':'scale(1)' }}/>; })}
                  </div>
                ):attr.displayMode==='image'?(
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any)=>{ const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} className="w-14 h-14 overflow-hidden transition-all" style={{ border:`2px solid ${s?accent:'var(--border)'}`, opacity:s?1:0.5 }}><img src={v.value} alt={v.name} className="w-full h-full object-cover"/></button>; })}
                  </div>
                ):(
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v:any)=>{ const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} className="btn-street px-5 py-2.5 mono text-[9px] font-bold tracking-[0.15em] uppercase transition-all" style={{ border:`1px solid ${s?accent:'var(--border)'}`, backgroundColor:s?`${accent}15`:'transparent', color:s?accent:'var(--mid)' }}>{v.name}</button>; })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>
          </div>
        </div>

        {product.desc && (
          <section className="mt-20 pt-12" style={{ borderTop:'1px solid var(--border)' }}>
            <p className="mono text-[8px] tracking-[0.22em] mb-6" style={{ color:'var(--volt)' }}>// PIECE INFO</p>
            <div className="p-8 halftone" style={{ border:'1px solid var(--border)', backgroundColor:'var(--ink-2)' }}>
              <div className="mono text-sm font-light leading-relaxed" style={{ color:'var(--mid)' }}
                dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc, { ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','span'],ALLOWED_ATTR:['class','style'] })}}/>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── PRODUCT FORM ──────────────────────────────────────────────
const inputSt = (err?:boolean): React.CSSProperties => ({
  width:'100%', padding:'12px 16px', fontSize:'0.8rem', fontWeight:400,
  backgroundColor:'var(--ink-3)', border:`1px solid ${err?'var(--acid)':'var(--border-lt)'}`,
  borderRadius:0, color:'var(--chalk)', outline:'none',
  fontFamily:"'DM Mono',monospace", letterSpacing:'0.08em',
  transition:'border-color 0.25s, box-shadow 0.25s',
});

const FieldWrapper = ({ error, label, children }: { error?:string; label?:string; children:React.ReactNode }) => (
  <div className="space-y-1.5">
    {label && <label className="block mono text-[8px] tracking-[0.22em] uppercase" style={{ color:'var(--dim)' }}>{label}</label>}
    {children}
    {error && <p className="mono text-[9px] flex items-center gap-1" style={{ color:'var(--acid)' }}><AlertCircle className="w-3 h-3"/>{error}</p>}
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

  const selectedWilayaData = useMemo(()=>wilayas.find(w=>String(w.id)===String(formData.customerWelaya)),[wilayas,formData.customerWelaya]);
  const getFinalPrice = useCallback(():number=>{
    const base = typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const offer = product.offers?.find(o=>o.id===selectedOffer); if(offer) return offer.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){ const m=product.variantDetails.find(v=>variantMatches(v,selectedVariants)); if(m&&m.price!==-1) return m.price; }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getPriceLivraison = useCallback(():number=>{ if(!selectedWilayaData) return 0; return formData.typeLivraison==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice; },[selectedWilayaData,formData.typeLivraison]);
  useEffect(()=>{ if(selectedWilayaData) setFormData(f=>({...f,priceLoss:selectedWilayaData.livraisonReturn})); },[selectedWilayaData]);

  const finalPrice    = getFinalPrice();
  const getTotalPrice = ()=>finalPrice*formData.quantity+getPriceLivraison();
  const validate = ()=>{
    const e:Record<string,string>={};
    if(!formData.customerName.trim())  e.customerName='الاسم مطلوب';
    if(!formData.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!formData.customerWelaya)       e.customerWelaya='الولاية مطلوبة';
    if(!formData.customerCommune)      e.customerCommune='البلدية مطلوبة';
    return e;
  };
  const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault(); const errs=validate(); if(Object.keys(errs).length){setFormErrors(errs);return;} setFormErrors({}); setSubmitting(true);
    try { await axios.post(`${API_URL}/orders/create`,{ ...formData, productId:product.id, storeId:product.store.id, userId, selectedOffer, selectedVariants, platform:platform||'store', finalPrice, totalPrice:getTotalPrice(), priceLivraison:getPriceLivraison() }); if(typeof window!=='undefined'&&formData.customerId) localStorage.setItem('customerId',formData.customerId); router.push(`/lp/${domain}/successfully`); } catch(err){console.error(err);} finally{setSubmitting(false);}
  };
  const onFocus = (e:React.FocusEvent<any>)=>{ e.target.style.borderColor='var(--volt)'; e.target.style.boxShadow='0 0 0 2px rgba(223,255,0,0.12)'; };
  const onBlur  = (e:React.FocusEvent<any>,err?:boolean)=>{ e.target.style.borderColor=err?'var(--acid)':'var(--border-lt)'; e.target.style.boxShadow='none'; };

  return (
    <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.5rem' }}>
      <p className="mono text-[8px] tracking-[0.22em] mb-6" style={{ color:'var(--volt)' }}>// CHECKOUT FORM</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerName} label="// YOUR NAME">
            <div className="relative">
              <User className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--dim)' }}/>
              <input type="text" value={formData.customerName} onChange={e=>setFormData({...formData,customerName:e.target.value})} placeholder="اسمك الكامل" style={{ ...inputSt(!!formErrors.customerName), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerName)}/>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerPhone} label="// PHONE">
            <div className="relative">
              <Phone className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--dim)' }}/>
              <input type="tel" value={formData.customerPhone} onChange={e=>setFormData({...formData,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" style={{ ...inputSt(!!formErrors.customerPhone), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerPhone)}/>
            </div>
          </FieldWrapper>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerWelaya} label="// WILAYA">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--dim)' }}/>
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--dim)' }}/>
              <select value={formData.customerWelaya} onChange={e=>setFormData({...formData,customerWelaya:e.target.value,customerCommune:''})} style={{ ...inputSt(!!formErrors.customerWelaya), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerWelaya)}>
                <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerCommune} label="// COMMUNE">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--dim)' }}/>
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--dim)' }}/>
              <select value={formData.customerCommune} disabled={!formData.customerWelaya||loadingCommunes} onChange={e=>setFormData({...formData,customerCommune:e.target.value})} style={{ ...inputSt(!!formErrors.customerCommune), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer', opacity:!formData.customerWelaya?0.4:1 }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerCommune)}>
                <option value="">{loadingCommunes?'LOADING...':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery */}
        <div>
          <p className="mono text-[8px] tracking-[0.22em] mb-3" style={{ color:'var(--dim)' }}>// DROP POINT</p>
          <div className="grid grid-cols-2 gap-px" style={{ border:'1px solid var(--border)', backgroundColor:'var(--border)' }}>
            {(['home','office'] as const).map(type=>(
              <button key={type} type="button" onClick={()=>setFormData(p=>({...p,typeLivraison:type}))}
                className="flex flex-col items-center gap-2 py-5 transition-all"
                style={{ backgroundColor: formData.typeLivraison===type?'rgba(223,255,0,0.08)':'var(--ink-2)', borderTop:`2px solid ${formData.typeLivraison===type?'var(--volt)':'transparent'}` }}>
                <span className="text-2xl">{type==='home'?'🏠':'🏢'}</span>
                <p className="mono text-[8px] tracking-[0.18em] uppercase" style={{ color:formData.typeLivraison===type?'var(--volt)':'var(--dim)' }}>
                  {type==='home'?'HOME DROP':'OFFICE PICK'}
                </p>
                {selectedWilayaData && <p className="syne font-bold" style={{ color:'var(--chalk)', fontSize:'1rem', letterSpacing:'0.04em' }}>{(type==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice).toLocaleString()} <span className="mono text-[8px]">دج</span></p>}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <FieldWrapper label="// UNITS">
          <div className="flex items-center gap-4">
            <button type="button" onClick={()=>setFormData(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              className="w-10 h-10 flex items-center justify-center text-xl font-bold transition-all"
              style={{ border:'1px solid var(--border-lt)', color:'var(--volt)', backgroundColor:'transparent' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='rgba(223,255,0,0.08)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='transparent';}}>−</button>
            <span className="w-10 text-center syne font-bold" style={{ fontSize:'2rem', color:'var(--chalk)', letterSpacing:'0.04em', lineHeight:1 }}>{formData.quantity}</span>
            <button type="button" onClick={()=>setFormData(p=>({...p,quantity:p.quantity+1}))}
              className="w-10 h-10 flex items-center justify-center text-xl font-bold transition-all"
              style={{ border:'1px solid var(--border-lt)', color:'var(--volt)', backgroundColor:'transparent' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='rgba(223,255,0,0.08)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='transparent';}}>+</button>
          </div>
        </FieldWrapper>

        {/* Summary */}
        <div className="p-5 halftone" style={{ border:'1px solid var(--border-lt)', backgroundColor:'var(--ink-2)' }}>
          <p className="mono text-[8px] tracking-[0.22em] mb-4" style={{ color:'var(--volt)' }}>// ORDER SUMMARY</p>
          <div className="space-y-2.5">
            {[{l:'ITEM',v:product.name},{l:'UNIT',v:`${finalPrice.toLocaleString()} دج`},{l:'QTY',v:`× ${formData.quantity}`},{l:'SHIPPING',v:selectedWilayaData?`${getPriceLivraison().toLocaleString()} دج`:'TBD'}].map(row=>(
              <div key={row.l} className="flex justify-between">
                <span className="mono text-[8px] tracking-[0.16em]" style={{ color:'var(--dim)' }}>{row.l}</span>
                <span className="mono text-[10px] font-bold" style={{ color:'var(--mid)' }}>{row.v}</span>
              </div>
            ))}
            <div className="pt-3" style={{ borderTop:'1px solid var(--border)' }}>
              <div className="flex justify-between items-baseline">
                <span className="mono text-[9px] tracking-[0.18em]" style={{ color:'var(--volt)' }}>TOTAL</span>
                <span className="syne font-bold" style={{ fontSize:'2rem', color:'var(--volt)', letterSpacing:'0.04em', lineHeight:1 }}>
                  {getTotalPrice().toLocaleString()}<span className="mono text-[10px] ml-1">دج</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="btn-street w-full py-4 flex items-center justify-center gap-3 mono text-[10px] font-bold tracking-[0.22em] uppercase transition-all"
          style={{ background:submitting?'var(--dim)':'var(--volt)', color:submitting?'var(--ink-2)':'var(--ink)', boxShadow:submitting?'none':`0 8px 32px var(--glow-volt)`, cursor:submitting?'not-allowed':'pointer' }}>
          {submitting
            ?<><div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin"/> PROCESSING...</>
            :<><Zap className="w-4 h-4"/> LOCK IN MY ORDER</>
          }
        </button>
        <p className="mono text-[8px] text-center flex items-center justify-center gap-2 tracking-[0.18em]" style={{ color:'var(--dim)' }}>
          <Shield className="w-3 h-3" style={{ color:'var(--sky)' }}/> ENCRYPTED · SECURE CHECKOUT
        </p>
      </form>
    </div>
  );
}

// ─── STATIC PAGES ──────────────────────────────────────────────
export function StaticPage({ page }: { page:string }) {
  const p = page.toLowerCase();
  return <>{p==='privacy'&&<Privacy/>}{p==='terms'&&<Terms/>}{p==='cookies'&&<Cookies/>}{p==='contact'&&<Contact/>}</>;
}

function PageWrapper({ children, icon, title, code }: { children:React.ReactNode; icon:React.ReactNode; title:string; code:string }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--ink)', fontFamily:"'DM Mono',monospace" }}>
      <div className="relative spray scanlines overflow-hidden py-24" style={{ backgroundColor:'var(--ink-2)' }}>
        <GridLines/>
        <div className="absolute -top-20 -right-20 pointer-events-none opacity-60"><SprayCircle size={400} color="var(--volt)" opacity={0.04}/></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background:'linear-gradient(to bottom, transparent, var(--ink))' }}/>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ border:'1px solid var(--volt)', backgroundColor:'rgba(223,255,0,0.08)', color:'var(--volt)' }}>{icon}</div>
            <span className="mono text-[8px] tracking-[0.22em]" style={{ color:'var(--dim)' }}>REF: {code}</span>
          </div>
          <h1 className="syne font-bold" style={{ fontSize:'clamp(3rem,8vw,7rem)', color:'var(--chalk)', letterSpacing:'0.04em', lineHeight:0.9 }}>{title.toUpperCase()}</h1>
          <div className="h-1 w-24 mt-4" style={{ background:'linear-gradient(90deg, var(--volt), transparent)' }}/>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">{children}</div>
    </div>
  );
}

function InfoCard({ icon, title, desc, badge, badgeColor='var(--volt)' }: { icon:React.ReactNode; title:string; desc:string; badge?:string; badgeColor?:string }) {
  return (
    <div className="flex gap-5 p-5 mb-3 transition-all duration-300"
      style={{ border:'1px solid var(--border)', backgroundColor:'var(--ink-2)', cursor:'default' }}
      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor=badgeColor; el.style.backgroundColor='rgba(245,245,240,0.02)';}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.backgroundColor='var(--ink-2)';}}>
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ border:`1px solid ${badgeColor}40`, color:badgeColor, backgroundColor:`${badgeColor}0A` }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="syne font-bold" style={{ fontSize:'1rem', color:'var(--chalk)', letterSpacing:'0.06em' }}>{title.toUpperCase()}</h3>
          {badge && <span className="mono text-[8px] tracking-[0.18em] px-2 py-1" style={{ border:`1px solid ${badgeColor}50`, color:badgeColor, backgroundColor:`${badgeColor}0A` }}>{badge}</span>}
        </div>
        <p className="mono text-xs font-light leading-relaxed" style={{ color:'var(--dim)' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper icon={<Lock size={18}/>} title="Privacy Policy" code="DOC-PRV-001">
      <InfoCard icon={<Database size={16}/>}    title="Data Collected"    desc="Only the essentials — name, contact, and delivery details. Nothing more. We keep it minimal." badgeColor="var(--volt)"/>
      <InfoCard icon={<Shield size={16}/>}      title="How We Use It"     desc="Your data is used exclusively to process and deliver your order. Period." badgeColor="var(--sky)"/>
      <InfoCard icon={<Lock size={16}/>}        title="Security"          desc="Industry-standard encryption keeps your data locked tight from unauthorized access." badgeColor="var(--acid)"/>
      <InfoCard icon={<Globe size={16}/>}       title="Data Sharing"      desc="We never sell your data. We share only what's needed with our trusted delivery partners." badgeColor="var(--volt)"/>
      <div className="mt-8 p-4 flex items-center gap-3" style={{ border:'1px solid rgba(0,200,255,0.2)', backgroundColor:'rgba(0,200,255,0.04)' }}>
        <Bell size={14} style={{ color:'var(--sky)', flexShrink:0 }}/>
        <p className="mono text-[9px] tracking-[0.14em]" style={{ color:'var(--dim)' }}>POLICY REVIEWED QUARTERLY · LAST UPDATED FEB 2026</p>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper icon={<Scale size={18}/>} title="Terms of Service" code="DOC-TRM-002">
      <InfoCard icon={<User size={16}/>}        title="Your Account"      desc="You own your account, you own the responsibility. Keep credentials secure." badgeColor="var(--volt)"/>
      <InfoCard icon={<CreditCard size={16}/>}  title="Payments"          desc="Zero hidden charges. The price you see is exactly what you pay at checkout." badgeColor="var(--sky)"/>
      <InfoCard icon={<Ban size={16}/>}         title="Prohibited Use"    desc="No counterfeit or illegal items. We run a clean operation, only authentic goods." badgeColor="var(--acid)"/>
      <InfoCard icon={<Scale size={16}/>}       title="Governing Law"     desc="Governed by Algerian law. Any disputes handled through official legal channels." badgeColor="var(--volt)"/>
      <div className="mt-8 p-4 flex items-start gap-3" style={{ border:'1px solid rgba(255,60,172,0.2)', backgroundColor:'rgba(255,60,172,0.04)' }}>
        <AlertCircle size={14} style={{ color:'var(--acid)', flexShrink:0, marginTop:2 }}/>
        <p className="mono text-[9px] tracking-[0.14em] leading-relaxed" style={{ color:'var(--dim)' }}>TERMS MAY UPDATE. CONTINUED USE = ACCEPTANCE OF CURRENT VERSION.</p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={18}/>} title="Cookie Policy" code="DOC-CKI-003">
      <InfoCard icon={<ShieldCheck size={16}/>}   title="Essential Cookies"   desc="Core site functions — login sessions, cart, checkout. Cannot be disabled." badge="ALWAYS ON" badgeColor="var(--volt)"/>
      <InfoCard icon={<Settings size={16}/>}      title="Preference Cookies"  desc="Saves your language and region settings so you don't have to set them again." badge="OPTIONAL" badgeColor="var(--sky)"/>
      <InfoCard icon={<MousePointer2 size={16}/>} title="Analytics Cookies"   desc="Anonymous data that helps us improve the drop. No personal info stored." badge="OPTIONAL" badgeColor="var(--acid)"/>
      <div className="mt-8 p-5" style={{ border:'1px solid var(--border-lt)', backgroundColor:'var(--ink-2)' }}>
        <div className="flex gap-4 items-start">
          <ToggleRight size={18} style={{ color:'var(--volt)', flexShrink:0, marginTop:2 }}/>
          <div>
            <p className="syne font-bold mb-1.5" style={{ color:'var(--chalk)', fontSize:'0.95rem', letterSpacing:'0.06em' }}>MANAGE YOUR COOKIES</p>
            <p className="mono text-xs font-light leading-relaxed" style={{ color:'var(--dim)' }}>Adjust preferences through your browser settings. Disabling essential cookies will break core functionality.</p>
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
    { emoji:'📡', label:'EMAIL', val:'hello@streetstore.dz', href:'mailto:hello@streetstore.dz' },
    { emoji:'📞', label:'PHONE', val:'+213 550 123 456',     href:'tel:+213550123456'            },
    { emoji:'📍', label:'BASE',  val:'Alger, DZ',            href:undefined                      },
  ];
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--ink)', fontFamily:"'DM Mono',monospace" }}>
      {/* Hero */}
      <div className="relative spray scanlines overflow-hidden py-28" style={{ backgroundColor:'var(--ink-2)' }}>
        <GridLines/>
        <div className="absolute -top-20 -left-20 pointer-events-none"><SprayCircle size={500} color="var(--volt)" opacity={0.05}/></div>
        <div className="absolute -bottom-20 -right-20 pointer-events-none"><SprayCircle size={400} color="var(--acid)" opacity={0.06}/></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background:'linear-gradient(to bottom, transparent, var(--ink))' }}/>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="sticker mono text-[9px] mb-6 inline-block" style={{ background:'var(--volt)', color:'var(--ink)' }}>OPEN CHANNEL</span>
          <h1 className="syne font-bold mt-4 mb-4" style={{ fontSize:'clamp(4rem,12vw,11rem)', color:'var(--chalk)', letterSpacing:'0.02em', lineHeight:0.88 }}>
            HIT US.
          </h1>
          <p className="mono text-xs font-light" style={{ color:'var(--dim)' }}>We reply within 24 hours. No cap.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Channels */}
          <div>
            <p className="mono text-[8px] tracking-[0.22em] mb-6" style={{ color:'var(--volt)' }}>// CONTACT CHANNELS</p>
            <div className="space-y-2">
              {channels.map(item=>(
                <a key={item.label} href={item.href||'#'}
                  className="flex items-center gap-4 p-5 transition-all"
                  style={{ border:'1px solid var(--border)', backgroundColor:'var(--ink-2)', textDecoration:'none' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--volt)'; el.style.backgroundColor='rgba(223,255,0,0.04)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.backgroundColor='var(--ink-2)';}}>
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="mono text-[8px] tracking-[0.2em] mb-0.5" style={{ color:'var(--dim)' }}>{item.label}</p>
                    <p className="mono text-xs font-bold" style={{ color:'var(--chalk)' }}>{item.val}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" style={{ color:'var(--volt)' }}/>
                </a>
              ))}
            </div>
            {/* Manifesto card */}
            <div className="mt-6 p-5 relative overflow-hidden" style={{ background:'var(--volt)' }}>
              <div className="absolute top-0 right-0 bottom-0 w-1/2 halftone pointer-events-none opacity-40"/>
              <p className="syne font-bold" style={{ color:'var(--ink)', fontSize:'1.3rem', letterSpacing:'0.06em', lineHeight:1.1 }}>
                STAY FRESH.<br/>STAY REAL.
              </p>
              <p className="mono text-[9px] mt-2" style={{ color:'rgba(11,11,11,0.6)' }}>DROP CULTURE · ALGIERS</p>
            </div>
          </div>

          {/* Form */}
          <div>
            <p className="mono text-[8px] tracking-[0.22em] mb-6" style={{ color:'var(--acid)' }}>// SEND A MESSAGE</p>
            {sent ? (
              <div className="py-24 text-center halftone" style={{ border:'1px dashed var(--border-lt)' }}>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color:'var(--volt)' }}/>
                <p className="syne font-bold mb-1" style={{ color:'var(--chalk)', fontSize:'1.5rem', letterSpacing:'0.06em' }}>MESSAGE SENT.</p>
                <p className="mono text-[9px]" style={{ color:'var(--dim)' }}>WE GOT YOU — BACK IN 24H.</p>
              </div>
            ) : (
              <form onSubmit={e=>{e.preventDefault();setSent(true);}} className="space-y-4">
                {[{label:'// YOUR NAME',type:'text',val:formState.name,ph:'Full name',key:'name'},{label:'// EMAIL',type:'email',val:formState.email,ph:'your@email.com',key:'email'}].map(f=>(
                  <FieldWrapper key={f.key} label={f.label}>
                    <input type={f.type} value={f.val} onChange={e=>setFormState({...formState,[f.key]:e.target.value})} placeholder={f.ph} style={inputSt()} required
                      onFocus={e=>{e.target.style.borderColor='var(--volt)'; e.target.style.boxShadow='0 0 0 2px rgba(223,255,0,0.12)';}}
                      onBlur={e=>{e.target.style.borderColor='var(--border-lt)'; e.target.style.boxShadow='none';}}/>
                  </FieldWrapper>
                ))}
                <FieldWrapper label="// YOUR MESSAGE">
                  <textarea value={formState.message} onChange={e=>setFormState({...formState,message:e.target.value})} placeholder="What's good?" rows={5}
                    style={{ ...inputSt(), resize:'none' as any }} required
                    onFocus={e=>{e.target.style.borderColor='var(--volt)'; e.target.style.boxShadow='0 0 0 2px rgba(223,255,0,0.12)';}}
                    onBlur={e=>{e.target.style.borderColor='var(--border-lt)'; e.target.style.boxShadow='none';}}/>
                </FieldWrapper>
                <button type="submit"
                  className="btn-street w-full py-4 flex items-center justify-center gap-2.5 mono text-[10px] font-bold tracking-[0.22em] uppercase"
                  style={{ background:'var(--volt)', color:'var(--ink)', boxShadow:`0 8px 32px var(--glow-volt)` }}>
                  <Zap className="w-4 h-4"/> SEND IT
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}