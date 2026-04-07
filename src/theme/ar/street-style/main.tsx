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
  Shield, ArrowRight, Plus, Minus, ArrowUpRight,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

  :root {
    --paper:    #F2EFE8;
    --paper-dk: #E8E4DB;
    --ink:      #0A0906;
    --ink-2:    #1A1714;
    --ash:      #6B6560;
    --mist:     #B8B2A8;
    --punch:    #FF2D00;
  }

  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:var(--paper); }
  ::-webkit-scrollbar-thumb { background:var(--ink); }

  /* ZINE GRID */
  .zs { display:grid; }
  .zs-half  { grid-template-columns:1fr 1fr; }
  .zs-main  { grid-template-columns:58% 42%; }
  .zs-flip  { grid-template-columns:42% 58%; }
  .zs-third { grid-template-columns:1fr 1fr 1fr; }
  .zs-wide  { grid-template-columns:1fr; }

  @media (max-width:768px) {
    .zs-main, .zs-flip, .zs-third { grid-template-columns:1fr 1fr; }
  }
  @media (max-width:480px) {
    .zs-main, .zs-flip, .zs-third { grid-template-columns:1fr; }
  }

  .zc {
    position:relative; overflow:hidden;
    border:1px solid var(--ink); margin:-1px 0 0 -1px;
    min-height:340px;
  }
  .zc-tall { min-height:520px; }
  .zc img  { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.6s cubic-bezier(0.22,1,0.36,1); }
  .zc:hover img { transform:scale(1.05); }

  .issue-label {
    writing-mode:vertical-rl; text-orientation:mixed; transform:rotate(180deg);
    font-family:'Space Mono',monospace; font-size:8px; letter-spacing:0.24em;
    text-transform:uppercase; color:rgba(242,239,232,0.45); user-select:none;
  }

  @keyframes ticker-run { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .ticker-w { overflow:hidden; white-space:nowrap; }
  .ticker-i { display:inline-block; animation:ticker-run 22s linear infinite; }

  @keyframes menu-in  { from{opacity:0; clip-path:inset(0 0 100% 0)} to{opacity:1; clip-path:inset(0 0 0% 0)} }

  @keyframes rise { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
  .rise   { animation:rise 0.8s cubic-bezier(0.22,1,0.36,1) both; }
  .rise-1 { animation-delay:0.08s; }
  .rise-2 { animation-delay:0.20s; }
  .rise-3 { animation-delay:0.34s; }

  .btn-z {
    display:inline-flex; align-items:center; gap:8px;
    background:var(--ink); color:var(--paper);
    font-family:'Space Mono',monospace; font-weight:700;
    font-size:10px; letter-spacing:0.18em; text-transform:uppercase;
    padding:14px 28px; border:none; cursor:pointer; text-decoration:none;
    clip-path:polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%);
    transition:background 0.22s, transform 0.22s;
  }
  .btn-z:hover { background:var(--punch); transform:translateY(-2px); }

  .sec-bar {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 20px; background:var(--ink);
  }

  .inp {
    width:100%; padding:12px 14px;
    background:var(--paper); border:1px solid var(--ink);
    font-family:'Space Mono',monospace; font-size:11px; color:var(--ink);
    outline:none; transition:box-shadow 0.2s;
  }
  .inp:focus { box-shadow:3px 3px 0 var(--punch); }
  .inp::placeholder { color:var(--mist); }
  .inp-err { border-color:var(--punch) !important; box-shadow:2px 2px 0 var(--punch) !important; }

  .noise-ov::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:3;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    mix-blend-mode:multiply; opacity:0.06;
  }

  /* ── RESPONSIVE LAYOUT CLASSES ── */
  .nav-ticker  { flex:1; margin:0 32px; overflow:hidden; border-left:1px solid var(--ink); border-right:1px solid var(--ink); padding:0 16px; height:100%; display:flex; align-items:center; }
  .stats-4     { display:grid; grid-template-columns:repeat(4,1fr); }
  .details-split { display:grid; grid-template-columns:1fr 1fr; }
  .details-img   { border-right:1px solid var(--ink); position:sticky; top:52px; height:calc(100vh - 52px); overflow:hidden; }
  .details-info  { padding:28px 26px; overflow-y:auto; }
  .contact-grid-z { display:grid; grid-template-columns:1fr 1fr; gap:36px; }
  .form-2col-z    { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .delivery-cols  { display:grid; grid-template-columns:1fr 1fr; border:1px solid var(--ink); }

  @media (max-width: 900px) {
    .details-split  { grid-template-columns:1fr; }
    .details-img    { position:static; height:60vw; min-height:280px; border-right:none; border-bottom:1px solid var(--ink); }
    .details-info   { padding:20px 16px; }
    .contact-grid-z { grid-template-columns:1fr; gap:28px; }
  }

  @media (max-width: 640px) {
    .nav-ticker  { display:none; }
    .stats-4     { grid-template-columns:repeat(2,1fr); }
    .zc          { min-height:240px; }
    .zs-half     { grid-template-columns:1fr; }
    .form-2col-z { grid-template-columns:1fr; }
    .delivery-cols { grid-template-columns:1fr; }
    .delivery-cols button:first-child { border-right:none; border-bottom:1px solid var(--ink); }
  }
`;

/* ── TYPES ─────────────────────────────────────────────────── */
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

/* ── FULL-SCREEN MENU ─────────────────────────────────────── */
function MenuOverlay({ store, onClose }: { store:any; onClose:()=>void }) {
  const isRTL = store.language === 'ar';
  const links = [
    { href:`/`,         ar:'الرئيسية', en:'HOME'    },
    { href:`/contact`, ar:'اتصل بنا', en:'CONTACT' },
    { href:`/Privacy`, ar:'الخصوصية', en:'PRIVACY' },
    { href:`/Terms`,   ar:'الشروط',   en:'TERMS'   },
  ];
  return (
    <div className="fixed inset-0 z-[200] flex flex-col"
      style={{ background:'var(--ink)', animation:'menu-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 32px', borderBottom:'1px solid rgba(242,239,232,0.1)' }}>
        <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'1rem', color:'var(--punch)', letterSpacing:'0.04em' }}>
          {store.name.toUpperCase()}
        </span>
        <button onClick={onClose} style={{ width:'44px', height:'44px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(242,239,232,0.2)', background:'transparent', color:'var(--paper)', cursor:'pointer' }}>
          <X style={{ width:'18px', height:'18px' }}/>
        </button>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 32px' }}>
        {links.map((l, i) => (
          <Link key={l.href} href={l.href} onClick={onClose}
            style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 0', borderBottom:'1px solid rgba(242,239,232,0.07)', textDecoration:'none', transition:'padding-left 0.25s' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.paddingLeft='16px';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.paddingLeft='0';}}>
            <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(2rem,7vw,5.5rem)', color:'var(--paper)', letterSpacing:'-0.02em', lineHeight:1 }}>
              {isRTL ? l.ar : l.en}
            </span>
            <ArrowUpRight style={{ width:'28px', height:'28px', color:'var(--punch)', opacity:0.7 }}/>
          </Link>
        ))}
      </div>
      <div style={{ padding:'16px 32px', borderTop:'1px solid rgba(242,239,232,0.1)', display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'rgba(242,239,232,0.25)' }}>
          ZINE DROP · SS{new Date().getFullYear()} · ALGIERS
        </span>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'var(--punch)' }}>
          © {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
}

/* ── MAIN ─────────────────────────────────────────────────── */
export default function Main({ store, children }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--paper)', fontFamily:"'Space Mono',monospace", color:'var(--ink)' }}>
      <style>{FONT_CSS}</style>
      {menuOpen && <MenuOverlay store={store} onClose={() => setMenuOpen(false)}/>}

      {/* Header — fixed minimal bar */}
      <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:'52px', backgroundColor:'var(--paper)', borderBottom:'1px solid var(--ink)', fontFamily:"'Space Mono',monospace" }}>
        <Link href={`/`} style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'1rem', color:'var(--ink)', letterSpacing:'0.02em', textDecoration:'none' }}>
          {store.name.toUpperCase()}
        </Link>

        {/* Ticker strip */}
        <div className="nav-ticker" style={{ height:'100%' }}>
          {store.topBar?.enabled && store.topBar?.text ? (
            <div className="ticker-w" style={{ width:'100%' }}>
              <div className="ticker-i" style={{ fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'var(--punch)' }}>
                {Array(8).fill(null).map((_,i)=><span key={i} style={{ margin:'0 32px' }}>★ {store.topBar.text.toUpperCase()}</span>)}
                {Array(8).fill(null).map((_,i)=><span key={`b${i}`} style={{ margin:'0 32px' }}>★ {store.topBar.text.toUpperCase()}</span>)}
              </div>
            </div>
          ) : (
            <div className="ticker-w" style={{ width:'100%' }}>
              <div className="ticker-i" style={{ fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.18em', color:'var(--ash)' }}>
                {['NEW DROP','STREETWEAR','AUTHENTIC','LOCAL BRAND','FREE SHIP','ALGIERS','SS25','LIMITED'].map((t,i)=><span key={i} style={{ margin:'0 28px' }}>/ {t}</span>)}
                {['NEW DROP','STREETWEAR','AUTHENTIC','LOCAL BRAND','FREE SHIP','ALGIERS','SS25','LIMITED'].map((t,i)=><span key={`b${i}`} style={{ margin:'0 28px' }}>/ {t}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Menu trigger */}
        <button onClick={() => setMenuOpen(true)} style={{ display:'flex', alignItems:'center', gap:'10px', background:'none', border:'none', cursor:'pointer', fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.22em', color:'var(--ink)' }}>
          MENU
          <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
            <span style={{ display:'block', width:'20px', height:'1.5px', background:'var(--ink)' }}/>
            <span style={{ display:'block', width:'14px', height:'1.5px', background:'var(--ink)' }}/>
          </div>
        </button>
      </header>

      <main style={{ paddingTop:'52px' }}>{children}</main>
      <Footer store={store}/>
    </div>
  );
}

/* ── NAVBAR (compatibility export) ───────────────────────── */
export function Navbar({ store }: { store: Store }) { return null; }

/* ── FOOTER — ZINE COLOPHON ───────────────────────────────── */
export function Footer({ store }: any) {
  const year = new Date().getFullYear();
  const isRTL = store.language === 'ar';
  return (
    <footer className="noise-ov" style={{ backgroundColor:'var(--ink)', color:'var(--paper)', position:'relative', overflow:'hidden', fontFamily:"'Space Mono',monospace" }}>
      {/* Ghost watermark */}
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none', overflow:'hidden' }}>
        <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(6rem,22vw,20rem)', color:'rgba(242,239,232,0.025)', letterSpacing:'-0.05em', whiteSpace:'nowrap', lineHeight:1 }}>
          {store.name.toUpperCase()}
        </span>
      </div>
      {/* Red punch bar */}
      <div style={{ position:'relative', zIndex:2, backgroundColor:'var(--punch)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(1.5rem,4vw,3.5rem)', letterSpacing:'-0.02em', color:'var(--paper)', lineHeight:1 }}>
          {store.name.toUpperCase()}
        </span>
        <span style={{ fontSize:'8px', letterSpacing:'0.22em', color:'rgba(242,239,232,0.65)' }}>EST. {year}</span>
      </div>
      {/* Dense colophon */}
      <div style={{ position:'relative', zIndex:2, padding:'32px 24px', borderBottom:'1px solid rgba(242,239,232,0.1)' }}>
        <p style={{ fontSize:'10px', lineHeight:'2.2', letterSpacing:'0.08em', color:'rgba(242,239,232,0.4)', maxWidth:'880px' }}>
          {isRTL
            ? `${store.name.toUpperCase()} · متجر الستايل الأصيل · الجزائر · SS${year} · جميع المنتجات أصيلة · PRIVACY — Privacy · TERMS — Terms · COOKIES — Cookies · CONTACT — contact · © ${year}`
            : `${store.name.toUpperCase()} · AUTHENTIC STREETWEAR · ALGIERS, DZ · SS${year} COLLECTION · ALL PRODUCTS VERIFIED · FAST NATIONWIDE DELIVERY · PRIVACY — Privacy · TERMS — Terms · COOKIES — Cookies · CONTACT — contact · ALL RIGHTS RESERVED © ${year} ${store.name.toUpperCase()} · ZINE DROP THEME`
          }
        </p>
      </div>
      {/* Links row */}
      <div style={{ position:'relative', zIndex:2, padding:'14px 24px', display:'flex', flexWrap:'wrap', gap:'20px', borderBottom:'1px solid rgba(242,239,232,0.1)' }}>
        {[['PRIVACY',`/Privacy`],['TERMS',`/Terms`],['COOKIES',`/Cookies`],['CONTACT',`/contact`]].map(([lbl,href])=>(
          <a key={lbl} href={href} style={{ fontSize:'8px', letterSpacing:'0.2em', color:'rgba(242,239,232,0.35)', textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--punch)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(242,239,232,0.35)';}}>
            {lbl} ↗
          </a>
        ))}
      </div>
      <div style={{ position:'relative', zIndex:2, padding:'12px 24px', display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:'8px', letterSpacing:'0.16em', color:'rgba(242,239,232,0.18)' }}>ZINE DROP THEME</span>
        <span style={{ fontSize:'8px', letterSpacing:'0.16em', color:'rgba(242,239,232,0.18)' }}>v2.0 / {year}</span>
      </div>
    </footer>
  );
}

/* ── CARD (zine cell) ─────────────────────────────────────── */
export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const [hov, setHov] = useState(false);
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
  return (
    <div className="zc" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <Link href={`/product/${product.slug || product.id}`} style={{ display:'block', width:'100%', height:'100%', textDecoration:'none' }}>
        <div style={{ position:'relative', width:'100%', height:'100%', minHeight:'inherit', backgroundColor:'var(--paper-dk)' }}>
          {displayImage
            ? <img src={displayImage} alt={product.name} style={{ width:'100%', height:'100%', minHeight:'inherit', objectFit:'cover', display:'block', transition:'transform 0.6s cubic-bezier(0.22,1,0.36,1)', transform:hov?'scale(1.05)':'scale(1)' }}/>
            : <div style={{ width:'100%', minHeight:'inherit', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--paper-dk)' }}>
                <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'3rem', color:'rgba(10,9,6,0.15)' }}>?</span>
              </div>
          }
          {/* Gradient overlay */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(10,9,6,0.88) 0%, rgba(10,9,6,0.2) 45%, transparent 70%)', pointerEvents:'none' }}/>
          {/* Discount sticker */}
          {discount > 0 && (
            <div style={{ position:'absolute', top:10, right:10, background:'var(--punch)', color:'var(--paper)', fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'11px', padding:'3px 10px', transform:'rotate(2.5deg)' }}>
              -{discount}%
            </div>
          )}
          {/* Left sidebar issue label */}
          <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'26px', display:'flex', alignItems:'center', justifyContent:'center', borderRight:'1px solid rgba(242,239,232,0.12)' }}>
            <span className="issue-label">{product.name.slice(0,14)}</span>
          </div>
          {/* Bottom info */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 14px 14px 34px' }}>
            <h3 style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:700, fontSize:'clamp(0.7rem,1.4vw,1rem)', color:'var(--paper)', letterSpacing:'-0.01em', lineHeight:1.2, marginBottom:'8px', textTransform:'uppercase' }}>
              {product.name}
            </h3>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ background:'var(--punch)', color:'var(--paper)', fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(1.2rem,2.5vw,1.8rem)', letterSpacing:'-0.03em', padding:'5px 12px', clipPath:'polygon(0 0,100% 0,calc(100% - 7px) 100%,0 100%)' }}>
                {price.toLocaleString()}
                <span style={{ fontFamily:"'Space Mono',monospace", fontWeight:400, fontSize:'0.5em', marginLeft:'4px', opacity:0.8 }}>دج</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'5px', fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.14em', color:'var(--paper)', opacity:hov ? 1 : 0.4, transition:'opacity 0.3s' }}>
                <span style={{ textDecoration:'underline', textDecorationColor:'var(--punch)' }}>{viewDetails}</span>
                <ArrowUpRight style={{ width:'11px', height:'11px', color:'var(--punch)' }}/>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── HOME ─────────────────────────────────────────────────── */
export function Home({ store }: any) {
  const isRTL = store.language === 'ar';
  const products: any[] = store.products || [];
  const t = {
    issue:       isRTL ? 'الإصدار الأول'    : 'ISSUE 001',
    viewDetails: isRTL ? 'شوف القطعة'       : 'VIEW PIECE',
    noItems:     isRTL ? 'قريباً...'          : 'DROPS INCOMING...',
    browse:      isRTL ? 'تصفح حسب الستايل' : 'BROWSE BY STYLE',
    allFits:     isRTL ? 'الكل'              : 'ALL FITS',
    dropLabel:   isRTL ? 'الكولكشن الكاملة' : 'THE FULL DROP',
  };

  /* Build irregular zine layout */
  const COUNTS = [2, 3, 1, 2, 3, 1, 2]; // products per strip row
  const CLASSES = ['zs-half','zs-third','zs-wide','zs-half','zs-third','zs-wide','zs-flip'];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor:'var(--paper)' }}>

      {/* ── POSTER / HERO ── */}
      <section className="noise-ov" style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', backgroundColor:'var(--ink)', overflow:'hidden' }}>
        {/* Hero image — very faint */}
        {store.hero?.imageUrl && (
          <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
            <img src={store.hero.imageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.1, filter:'grayscale(100%) contrast(1.5)' }}/>
          </div>
        )}
        {/* Issue number watermark */}
        <div style={{ position:'absolute', right:'-4%', top:'-6%', pointerEvents:'none', userSelect:'none', zIndex:1 }}>
          <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(14rem,42vw,40rem)', color:'rgba(242,239,232,0.022)', letterSpacing:'-0.06em', lineHeight:1, display:'block' }}>001</span>
        </div>
        {/* Punch left stripe */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'5px', background:'var(--punch)', zIndex:3 }}/>

        {/* Main content */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'8vw 6vw 0 7vw', position:'relative', zIndex:4 }}>
          {/* Issue tag */}
          <div className="rise" style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'28px' }}>
            <div style={{ width:'36px', height:'1.5px', background:'var(--punch)' }}/>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.28em', color:'var(--punch)' }}>
              {t.issue} · {isRTL ? 'ملابس الشارع' : 'STREETWEAR'} · {new Date().getFullYear()}
            </span>
          </div>

          {/* Main headline */}
          <h1 className="rise rise-1" style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(4rem,15vw,14rem)', letterSpacing:'-0.04em', lineHeight:0.86, color:'var(--paper)', margin:'0 0 0 0', textTransform:'uppercase' }}>
            {store.hero?.title
              ? store.hero.title.toUpperCase()
              : (isRTL
                  ? <><span>ارتدِ</span><br/><span style={{ color:'var(--punch)' }}>هويتك</span></>
                  : <><span>WEAR</span><br/><span style={{ color:'var(--punch)' }}>CULTURE</span></>
                )
            }
          </h1>

          {/* Bottom row */}
          <div className="rise rise-2" style={{ marginTop:'40px', paddingTop:'24px', paddingBottom:'0', borderTop:'1px solid rgba(242,239,232,0.14)', display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:'20px' }}>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:'11px', lineHeight:'1.9', color:'rgba(242,239,232,0.5)', maxWidth:'400px', letterSpacing:'0.05em' }}>
              {store.hero?.subtitle || (isRTL ? 'مجموعة ملابس الشارع الأصيلة. كل قطعة بقصة.' : 'Authentic streetwear. Every piece tells a story.')}
            </p>
            <div className="rise rise-3" style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <a href="#drops" className="btn-z" style={{ textDecoration:'none' }}>
                {isRTL ? '↓ شوف الكولكشن' : '↓ VIEW THE DROP'}
              </a>
              <a href="#style-filter" style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:"'Space Mono',monospace", fontSize:'9px', letterSpacing:'0.18em', color:'rgba(242,239,232,0.35)', textDecoration:'none', border:'1px solid rgba(242,239,232,0.14)', padding:'14px 22px', transition:'all 0.22s' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--paper)'; el.style.borderColor='rgba(242,239,232,0.4)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color='rgba(242,239,232,0.35)'; el.style.borderColor='rgba(242,239,232,0.14)';}}>
                {isRTL ? 'الفئات' : 'BROWSE FITS'} <ArrowRight style={{ width:'12px', height:'12px' }}/>
              </a>
            </div>
          </div>
        </div>

        {/* Stats strip at bottom of hero */}
        <div className="stats-4" style={{ position:'relative', zIndex:4, borderTop:'1px solid rgba(242,239,232,0.1)', marginTop:'40px' }}>
          {[
            { n:'100%', l:isRTL?'أصيل':'AUTHENTIC' },
            { n:`${products.length||'∞'}`, l:isRTL?'قطعة':'PIECES' },
            { n:'48H',  l:isRTL?'توصيل':'DELIVERY' },
            { n:'DZ',   l:isRTL?'محلي':'LOCAL' },
          ].map((s,i) => (
            <div key={i} style={{ padding:'16px 20px', borderRight:i<3?'1px solid rgba(242,239,232,0.08)':'none' }}>
              <div style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(1.2rem,2.5vw,2.2rem)', color:i===0?'var(--punch)':'var(--paper)', letterSpacing:'-0.02em', lineHeight:1 }}>{s.n}</div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.22em', color:'rgba(242,239,232,0.28)', marginTop:'4px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STYLE FILTER BAR ── */}
      {store.categories?.length > 0 && (
        <div id="style-filter" style={{ borderBottom:'1px solid var(--ink)', display:'flex', alignItems:'stretch', overflowX:'auto' }}>
          <div style={{ flexShrink:0, padding:'10px 18px', borderRight:'1px solid var(--ink)', display:'flex', alignItems:'center' }}>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'var(--ash)', whiteSpace:'nowrap' }}>{t.browse}</span>
          </div>
          <Link href={`/${store.domain}`} style={{ display:'flex', alignItems:'center', padding:'10px 22px', borderRight:'1px solid var(--ink)', fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.18em', textDecoration:'none', backgroundColor:'var(--ink)', color:'var(--punch)', whiteSpace:'nowrap', flexShrink:0, textTransform:'uppercase' }}>
            ★ {t.allFits}
          </Link>
          {store.categories.map((cat:any) => (
            <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`} style={{ display:'flex', alignItems:'center', padding:'10px 22px', borderRight:'1px solid var(--ink)', fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.18em', textDecoration:'none', color:'var(--ink)', whiteSpace:'nowrap', flexShrink:0, textTransform:'uppercase', transition:'background 0.2s, color 0.2s' }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background='var(--ink)'; el.style.color='var(--punch)';}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.color='var(--ink)';}}>
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* ── ZINE PRODUCT STRIPS ── */}
      <section id="drops">
        <div className="sec-bar">
          <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(0.7rem,1.4vw,0.95rem)', color:'var(--paper)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
            {t.dropLabel}
          </span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'rgba(242,239,232,0.4)' }}>
            {products.length} {isRTL ? 'قطعة' : 'PIECES'}
          </span>
        </div>

        {products.length === 0 ? (
          <div style={{ minHeight:'420px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid var(--ink)', margin:'1px' }}>
            <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(4rem,12vw,10rem)', color:'rgba(10,9,6,0.05)', letterSpacing:'-0.04em' }}>SOON</span>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:'9px', letterSpacing:'0.2em', color:'var(--mist)', marginTop:'16px' }}>{t.noItems}</p>
          </div>
        ) : (
          (() => {
            const groups: any[][] = [];
            let i = 0;
            while (i < products.length) {
              const count = COUNTS[groups.length % COUNTS.length];
              groups.push(products.slice(i, i + count));
              i += count;
            }
            return groups.map((group, gi) => {
              const cls = CLASSES[gi % CLASSES.length];
              const featured = group.length === 1;
              return (
                <div key={gi} className={`zs ${cls}`} style={{ minHeight: featured ? '500px' : '340px' }}>
                  {group.map((product: any) => {
                    const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
                    const discount = product.priceOriginal ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;
                    return (
                      <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails}/>
                    );
                  })}
                </div>
              );
            });
          })()
        )}
      </section>

      {/* ── MANIFESTO STRIP ── */}
      <section style={{ backgroundColor:'var(--punch)', padding:'60px 6vw', position:'relative', overflow:'hidden', borderTop:'1px solid var(--ink)' }}>
        <div style={{ position:'absolute', right:'-2%', bottom:'-15%', pointerEvents:'none', userSelect:'none', opacity:0.1 }}>
          <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(10rem,30vw,28rem)', color:'var(--paper)', letterSpacing:'-0.05em', lineHeight:1 }}>RAW</span>
        </div>
        <div style={{ position:'relative', zIndex:2 }}>
          <p style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(2.2rem,6vw,5.5rem)', color:'var(--paper)', letterSpacing:'-0.03em', lineHeight:0.88, marginBottom:'28px', textTransform:'uppercase' }}>
            {isRTL ? <><span>ما تلبسه</span><br/><span>يقول من أنت.</span></> : <><span>WHAT YOU WEAR</span><br/><span>SAYS WHO YOU ARE.</span></>}
          </p>
          <a href="#drops" style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:"'Space Mono',monospace", fontSize:'10px', letterSpacing:'0.18em', color:'var(--punch)', background:'var(--paper)', padding:'14px 28px', textDecoration:'none', textTransform:'uppercase', clipPath:'polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%)', transition:'background 0.2s' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--ink)'; (e.currentTarget as HTMLElement).style.color='var(--paper)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='var(--paper)'; (e.currentTarget as HTMLElement).style.color='var(--punch)';}}>
            {isRTL ? 'تسوق الآن' : 'SHOP NOW'} <ArrowUpRight style={{ width:'14px', height:'14px' }}/>
          </a>
        </div>
      </section>
    </div>
  );
}

/* ── DETAILS ─────────────────────────────────────────────── */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div style={{ backgroundColor:'var(--paper)', fontFamily:"'Space Mono',monospace" }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Breadcrumb bar */}
      <div style={{ borderBottom:'1px solid var(--ink)', padding:'10px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'8px', letterSpacing:'0.18em', color:'var(--ash)' }}>
          <span>{isRTL ? 'الرئيسية' : 'HOME'}</span>
          <span style={{ color:'var(--punch)' }}>/</span>
          <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:700, fontSize:'8px', color:'var(--ink)' }}>{product.name.toUpperCase().slice(0,28)}</span>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <button onClick={toggleWishlist} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isWishlisted?'var(--punch)':'var(--ink)'}`, background:isWishlisted?'var(--punch)':'transparent', cursor:'pointer', color:isWishlisted?'var(--paper)':'var(--ink)' }}>
            <Heart style={{ width:'12px', height:'12px', fill:isWishlisted?'currentColor':'none' }}/>
          </button>
          <button onClick={handleShare} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--ink)', background:'transparent', cursor:'pointer', color:'var(--ink)' }}>
            <Share2 style={{ width:'12px', height:'12px' }}/>
          </button>
          <div style={{ padding:'6px 12px', background:inStock||autoGen?'var(--ink)':'var(--punch)', color:'var(--paper)', fontSize:'8px', letterSpacing:'0.18em' }}>
            {autoGen ? '∞ STOCK' : inStock ? 'IN STOCK' : 'SOLD OUT'}
          </div>
        </div>
      </div>

      {/* Split layout: image left, info right */}
      <div className="details-split">

        {/* LEFT — sticky image */}
        <div className="details-img">
          <div style={{ position:'relative', width:'100%', height:'100%' }}>
            {allImages.length > 0
              ? <img src={allImages[selectedImage]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--paper-dk)' }}>
                  <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'5rem', color:'rgba(10,9,6,0.1)' }}>?</span>
                </div>
            }
            {/* Bottom gradient */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(to top, rgba(10,9,6,0.88) 0%, transparent 50%)', padding:'24px 20px 20px', pointerEvents:'none' }}>
              {discount > 0 && <div style={{ display:'inline-block', background:'var(--punch)', color:'var(--paper)', fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'11px', padding:'3px 12px', marginBottom:'10px', transform:'rotate(-1.5deg)' }}>-{discount}% OFF</div>}
              <div style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(2rem,5vw,4rem)', color:'var(--paper)', letterSpacing:'-0.03em', lineHeight:1 }}>
                {finalPrice.toLocaleString()}
                <span style={{ fontFamily:"'Space Mono',monospace", fontWeight:400, fontSize:'1rem', marginLeft:'8px', opacity:0.65 }}>دج</span>
              </div>
            </div>
            {/* Thumbnail sidebar */}
            {allImages.length > 1 && (
              <div style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:'5px' }}>
                {allImages.slice(0,5).map((img:string, idx:number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} style={{ width:'40px', height:'40px', overflow:'hidden', border:`2px solid ${selectedImage===idx?'var(--punch)':'rgba(255,255,255,0.3)'}`, cursor:'pointer', opacity:selectedImage===idx?1:0.5, padding:0, background:'none' }}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                  </button>
                ))}
              </div>
            )}
            {/* Sold out overlay */}
            {!inStock && !autoGen && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(242,239,232,0.88)', backdropFilter:'blur(4px)' }}>
                <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'3rem', color:'var(--punch)', letterSpacing:'-0.02em', transform:'rotate(-5deg)', display:'inline-block' }}>SOLD OUT</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — scrollable info */}
        <div className="details-info">
          <h1 style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(1.5rem,3.5vw,3rem)', color:'var(--ink)', letterSpacing:'-0.02em', lineHeight:0.9, textTransform:'uppercase', marginBottom:'16px' }}>
            {product.name}
          </h1>
          {/* Stars */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--ink)' }}>
            {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'11px', height:'11px', fill:i<4?'var(--punch)':'none', color:'var(--punch)' }}/>)}
            <span style={{ fontSize:'8px', letterSpacing:'0.16em', color:'var(--ash)' }}>4.8 · 128 REVIEWS</span>
          </div>
          {/* Price block */}
          <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--paper-dk)' }}>
            <p style={{ fontSize:'8px', letterSpacing:'0.2em', color:'var(--ash)', marginBottom:'4px' }}>RETAIL PRICE</p>
            <div style={{ display:'flex', alignItems:'baseline', flexWrap:'wrap', gap:'10px' }}>
              <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'3.2rem', color:'var(--punch)', letterSpacing:'-0.03em', lineHeight:1 }}>{finalPrice.toLocaleString()}</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:'1rem', color:'var(--ash)' }}>دج</span>
              {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                <div>
                  <span style={{ fontSize:'11px', textDecoration:'line-through', color:'var(--mist)', display:'block' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                  <span style={{ fontSize:'8px', color:'var(--punch)', letterSpacing:'0.12em' }}>↓ SAVE {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج</span>
                </div>
              )}
            </div>
          </div>
          {/* Stock */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'7px 14px', marginBottom:'22px', border:`1px solid ${inStock||autoGen?'var(--ink)':'var(--punch)'}`, fontSize:'8px', letterSpacing:'0.2em', color:inStock||autoGen?'var(--ink)':'var(--punch)' }}>
            {autoGen ? <Infinity style={{ width:'11px', height:'11px' }}/> : inStock ? <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'var(--ink)', display:'inline-block' }}/> : <X style={{ width:'11px', height:'11px' }}/>}
            {autoGen ? 'UNLIMITED STOCK' : inStock ? 'IN STOCK' : 'SOLD OUT'}
          </div>
          {/* Offers */}
          {product.offers?.length > 0 && (
            <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--paper-dk)' }}>
              <p style={{ fontSize:'8px', letterSpacing:'0.2em', color:'var(--ash)', marginBottom:'10px' }}>SELECT BUNDLE</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                {product.offers.map((offer:any)=>(
                  <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', border:`1px solid ${selectedOffer===offer.id?'var(--ink)':'var(--paper-dk)'}`, backgroundColor:selectedOffer===offer.id?'var(--ink)':'transparent', cursor:'pointer', transition:'all 0.18s' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'13px', height:'13px', border:`1px solid ${selectedOffer===offer.id?'var(--paper)':'var(--ink)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {selectedOffer===offer.id && <div style={{ width:'7px', height:'7px', background:'var(--punch)' }}/>}
                      </div>
                      <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                      <div>
                        <p style={{ fontSize:'10px', fontWeight:700, color:selectedOffer===offer.id?'var(--paper)':'var(--ink)', letterSpacing:'0.08em' }}>{offer.name}</p>
                        <p style={{ fontSize:'8px', color:selectedOffer===offer.id?'rgba(242,239,232,0.5)':'var(--ash)', letterSpacing:'0.12em' }}>QTY: {offer.quantity}</p>
                      </div>
                    </div>
                    <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'1.1rem', color:selectedOffer===offer.id?'var(--punch)':'var(--ink)', letterSpacing:'-0.02em' }}>
                      {offer.price.toLocaleString()}<span style={{ fontFamily:"'Space Mono',monospace", fontWeight:400, fontSize:'9px', marginLeft:'3px' }}>دج</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Attributes */}
          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--paper-dk)' }}>
              <p style={{ fontSize:'8px', letterSpacing:'0.2em', color:'var(--ash)', marginBottom:'9px' }}>/ {attr.name.toUpperCase()}</p>
              {attr.displayMode==='color' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'30px', height:'30px', backgroundColor:v.value, border:`3px solid ${s?'var(--ink)':'transparent'}`, cursor:'pointer', outline:s?'2px solid var(--punch)':'none', outlineOffset:'2px' }}/>;})}
                </div>
              ) : attr.displayMode==='image' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'48px', height:'48px', overflow:'hidden', border:`2px solid ${s?'var(--punch)':'var(--paper-dk)'}`, cursor:'pointer', padding:0 }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                </div>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ padding:'7px 14px', border:`1px solid ${s?'var(--ink)':'var(--paper-dk)'}`, backgroundColor:s?'var(--ink)':'transparent', color:s?'var(--paper)':'var(--ink)', fontSize:'10px', letterSpacing:'0.12em', cursor:'pointer', fontFamily:"'Space Mono',monospace", transition:'all 0.18s' }}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--ink)' }}>
              <p style={{ fontSize:'8px', letterSpacing:'0.2em', color:'var(--ash)', marginBottom:'10px' }}>/ PIECE INFO</p>
              <div style={{ fontSize:'11px', lineHeight:'1.9', color:'var(--ash)', fontFamily:"'Space Mono',monospace" }}
                dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc, { ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','span'],ALLOWED_ATTR:['class','style'] })}}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── PRODUCT FORM ─────────────────────────────────────────── */
const FR = ({ error, label, children }: { error?:string; label?:string; children:React.ReactNode }) => (
  <div style={{ marginBottom:'12px' }}>
    {label && <p style={{ fontSize:'8px', letterSpacing:'0.22em', color:'var(--ash)', marginBottom:'5px', textTransform:'uppercase', fontFamily:"'Space Mono',monospace" }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize:'8px', letterSpacing:'0.12em', color:'var(--punch)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}><AlertCircle style={{ width:'9px', height:'9px' }}/>{error}</p>}
  </div>
);

const ist = (err?: boolean): React.CSSProperties => ({
  width:'100%', padding:'11px 13px', fontFamily:"'Space Mono',monospace", fontSize:'11px',
  background:'var(--paper)', border:`1px solid ${err?'var(--punch)':'var(--ink)'}`, color:'var(--ink)',
  outline:'none', transition:'box-shadow 0.2s', boxShadow:err?'2px 2px 0 var(--punch)':'none',
});

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,setWilayas]   = useState<Wilaya[]>([]);
  const [communes,setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes,setLC] = useState(false);
  const [fd,setFd] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [errors,setErrors] = useState<Record<string,string>>({});
  const [submitting,setSub] = useState(false);

  useEffect(()=>{ if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(()=>{ if(typeof window!=='undefined'){ const id=localStorage.getItem('customerId'); if(id) setFd(p=>({...p,customerId:id})); } },[]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const getFP = useCallback(():number=>{
    const base=typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const off=product.offers?.find((o:any)=>o.id===selectedOffer); if(off) return off.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){ const m=product.variantDetails.find((v:any)=>variantMatches(v,selectedVariants)); if(m&&m.price!==-1) return m.price; }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getLiv = useCallback(():number=>{ if(!selW) return 0; return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice; },[selW,fd.typeLivraison]);
  useEffect(()=>{ if(selW) setFd(f=>({...f,priceLoss:selW.livraisonReturn})); },[selW]);

  const fp=getFP();
  const total=()=>fp*fd.quantity+ +getLiv();
  const validate=()=>{
    const e:Record<string,string>={};
    if(!fd.customerName.trim())  e.customerName='الاسم مطلوب';
    if(!fd.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!fd.customerWelaya)       e.customerWelaya='الولاية مطلوبة';
    if(!fd.customerCommune)      e.customerCommune='البلدية مطلوبة';
    return e;
  };
  
  const getVariantDetailId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault(); const er=validate(); if(Object.keys(er).length){setErrors(er);return;} setErrors({}); setSub(true);
    try{ await axios.post(`${API_URL}/orders/create`,{...fd,productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()}); if(typeof window!=='undefined'&&fd.customerId) localStorage.setItem('customerId',fd.customerId); router.push(`/lp/${domain}/successfully`); }catch(err){console.error(err);}finally{setSub(false);}
  };
  const onF=(e:React.FocusEvent<any>)=>{e.target.style.boxShadow='3px 3px 0 var(--punch)';};
  const onB=(e:React.FocusEvent<any>,err?:boolean)=>{e.target.style.boxShadow=err?'2px 2px 0 var(--punch)':'none';};

  return (
    <div style={{ marginTop:'22px', paddingTop:'22px', borderTop:'2px solid var(--ink)' }}>
      <p style={{ fontSize:'8px', letterSpacing:'0.2em', color:'var(--ash)', marginBottom:'14px', fontFamily:"'Space Mono',monospace" }}>/ ORDER FORM</p>
      <form onSubmit={handleSubmit}>
        <div className="form-2col-z" style={{ marginBottom:'0' }}>
          <FR error={errors.customerName} label="NAME">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'11px', height:'11px', color:'var(--mist)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="الاسم الكامل" style={{ ...ist(!!errors.customerName), paddingRight:'32px' }} onFocus={onF} onBlur={e=>onB(e,!!errors.customerName)}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="PHONE">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'11px', height:'11px', color:'var(--mist)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" style={{ ...ist(!!errors.customerPhone), paddingRight:'32px' }} onFocus={onF} onBlur={e=>onB(e,!!errors.customerPhone)}/>
            </div>
          </FR>
        </div>
        <div className="form-2col-z" style={{ marginBottom:'0', marginTop:'8px' }}>
          <FR error={errors.customerWelaya} label="WILAYA">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', width:'11px', height:'11px', color:'var(--mist)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} style={{ ...ist(!!errors.customerWelaya), paddingLeft:'28px', appearance:'none' as any, cursor:'pointer' }} onFocus={onF} onBlur={e=>onB(e,!!errors.customerWelaya)}>
                <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FR>
          <FR error={errors.customerCommune} label="COMMUNE">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', width:'11px', height:'11px', color:'var(--mist)', pointerEvents:'none' }}/>
              <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingCommunes} onChange={e=>setFd({...fd,customerCommune:e.target.value})} style={{ ...ist(!!errors.customerCommune), paddingLeft:'28px', appearance:'none' as any, cursor:'pointer', opacity:!fd.customerWelaya?0.4:1 }} onFocus={onF} onBlur={e=>onB(e,!!errors.customerCommune)}>
                <option value="">{loadingCommunes?'...':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FR>
        </div>

        {/* Delivery toggle */}
        <FR label="DELIVERY">
          <div className="delivery-cols">
            {(['home','office'] as const).map((type, i) => (
              <button key={type} type="button" onClick={() => setFd(p=>({...p,typeLivraison:type}))}
                style={{ padding:'13px 10px', border:'none', borderRight:i===0?'1px solid var(--ink)':'none', backgroundColor:fd.typeLivraison===type?'var(--ink)':'transparent', cursor:'pointer', textAlign:'left', borderTop:`3px solid ${fd.typeLivraison===type?'var(--punch)':'transparent'}`, transition:'all 0.18s' }}>
                <p style={{ fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.16em', color:fd.typeLivraison===type?'var(--paper)':'var(--ash)', marginBottom:'3px' }}>
                  {type==='home'?'HOME DROP':'OFFICE PICK'}
                </p>
                {selW && (
                  <p style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'1rem', color:fd.typeLivraison===type?'var(--punch)':'var(--mist)', letterSpacing:'-0.02em', lineHeight:1 }}>
                    {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()}<span style={{ fontFamily:"'Space Mono',monospace", fontWeight:400, fontSize:'8px', marginLeft:'3px' }}>دج</span>
                  </p>
                )}
              </button>
            ))}
          </div>
        </FR>

        {/* Quantity */}
        <FR label="QUANTITY">
          <div style={{ display:'inline-flex', alignItems:'center', border:'1px solid var(--ink)' }}>
            {[
              { icon:<Minus style={{ width:'11px', height:'11px' }}/>, action:()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)})) },
              { icon:<Plus  style={{ width:'11px', height:'11px' }}/>, action:()=>setFd(p=>({...p,quantity:p.quantity+1})) },
            ].map((btn, i) => (
              <button key={i} type="button" onClick={btn.action} style={{ width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:i===0?'1px solid var(--ink)':'none', background:'transparent', cursor:'pointer', color:'var(--ink)', transition:'all 0.18s', ...(i===1?{borderLeft:'1px solid var(--ink)'}:{}) }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background='var(--punch)'; el.style.color='var(--paper)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.color='var(--ink)';}}>
                {btn.icon}
              </button>
            )).reduce((acc, btn, i, arr) => i===0 ? [...acc, btn, <span key="qty" style={{ width:'44px', textAlign:'center', fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'1.1rem', color:'var(--ink)', letterSpacing:'-0.02em', lineHeight:'38px', display:'inline-block' }}>{fd.quantity}</span>] : [...acc, btn], [] as React.ReactNode[])}
          </div>
        </FR>

        {/* Summary */}
        <div style={{ border:'1px solid var(--ink)', marginBottom:'12px' }}>
          <div style={{ padding:'8px 13px', background:'var(--ink)' }}>
            <span style={{ fontSize:'8px', letterSpacing:'0.2em', color:'rgba(242,239,232,0.55)', fontFamily:"'Space Mono',monospace" }}>ORDER MANIFEST</span>
          </div>
          {[{l:'ITEM',v:product.name.slice(0,20)},{l:'UNIT',v:`${fp.toLocaleString()} دج`},{l:'× QTY',v:fd.quantity},{l:'SHIP',v:selW?`${getLiv().toLocaleString()} دج`:'TBD'}].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 13px', borderTop:'1px solid var(--paper-dk)' }}>
              <span style={{ fontSize:'8px', letterSpacing:'0.18em', color:'var(--ash)', fontFamily:"'Space Mono',monospace" }}>{row.l}</span>
              <span style={{ fontSize:'9px', fontWeight:700, color:'var(--ink)', fontFamily:"'Space Mono',monospace" }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'10px 13px', borderTop:'2px solid var(--ink)', background:'var(--paper-dk)' }}>
            <span style={{ fontSize:'8px', letterSpacing:'0.2em', color:'var(--ash)', fontFamily:"'Space Mono',monospace" }}>TOTAL</span>
            <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'1.7rem', color:'var(--punch)', letterSpacing:'-0.03em', lineHeight:1 }}>
              {total().toLocaleString()}<span style={{ fontFamily:"'Space Mono',monospace", fontWeight:400, fontSize:'10px', marginLeft:'4px' }}>دج</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-z" style={{ width:'100%', justifyContent:'center', fontSize:'10px', background:submitting?'var(--ash)':'var(--ink)', cursor:submitting?'not-allowed':'pointer', clipPath:'polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%)' }}>
          {submitting ? 'PROCESSING...' : <>LOCK IN ORDER <ArrowUpRight style={{ width:'13px', height:'13px' }}/></>}
        </button>
        <p style={{ fontSize:'8px', letterSpacing:'0.16em', color:'var(--mist)', textAlign:'center', marginTop:'8px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', fontFamily:"'Space Mono',monospace" }}>
          <Shield style={{ width:'9px', height:'9px', color:'var(--ink)' }}/> SECURE · ENCRYPTED CHECKOUT
        </p>
      </form>
    </div>
  );
}

/* ── STATIC PAGES ─────────────────────────────────────────── */
export function StaticPage({ page }: { page:string }) {
  const p = page.toLowerCase();
  return <>{p==='privacy'&&<Privacy/>}{p==='terms'&&<Terms/>}{p==='cookies'&&<Cookies/>}{p==='contact'&&<Contact/>}</>;
}

const PageShell = ({ children, title, code }: { children:React.ReactNode; title:string; code:string }) => (
  <div style={{ backgroundColor:'var(--paper)', fontFamily:"'Space Mono',monospace", minHeight:'100vh' }}>
    <div style={{ backgroundColor:'var(--ink)', padding:'80px 6vw 40px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', right:'-3%', bottom:'-20%', pointerEvents:'none', userSelect:'none', opacity:0.04 }}>
        <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(10rem,28vw,26rem)', color:'var(--paper)', letterSpacing:'-0.05em', lineHeight:1, whiteSpace:'nowrap' }}>{title.toUpperCase()}</span>
      </div>
      <p style={{ fontSize:'8px', letterSpacing:'0.22em', color:'rgba(242,239,232,0.28)', marginBottom:'12px' }}>REF: {code}</p>
      <h1 style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(2.5rem,7vw,7rem)', color:'var(--paper)', letterSpacing:'-0.03em', lineHeight:0.9, textTransform:'uppercase' }}>{title}</h1>
      <div style={{ width:'56px', height:'4px', background:'var(--punch)', marginTop:'14px' }}/>
    </div>
    <div style={{ maxWidth:'700px', margin:'0 auto', padding:'44px 24px 80px' }}>{children}</div>
  </div>
);

const IB = ({ title, body, tag, tagColor='var(--punch)' }: { title:string; body:string; tag?:string; tagColor?:string }) => (
  <div style={{ borderBottom:'1px solid var(--paper-dk)', padding:'18px 0', display:'flex', gap:'18px', alignItems:'flex-start' }}>
    <div style={{ flex:1 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'7px' }}>
        <h3 style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:700, fontSize:'0.82rem', color:'var(--ink)', letterSpacing:'0.02em' }}>{title.toUpperCase()}</h3>
        {tag && <span style={{ fontSize:'8px', letterSpacing:'0.2em', padding:'3px 8px', border:`1px solid ${tagColor}`, color:tagColor, fontFamily:"'Space Mono',monospace" }}>{tag}</span>}
      </div>
      <p style={{ fontSize:'10px', lineHeight:'1.9', letterSpacing:'0.05em', color:'var(--ash)' }}>{body}</p>
    </div>
  </div>
);

export function Privacy() {
  return (
    <PageShell title="PRIVACY" code="DOC-001">
      <IB title="Data Collected" body="Only name, phone, and delivery info. Nothing more. We keep it minimal."/>
      <IB title="How We Use It"  body="Exclusively to process and deliver your order. That is it."/>
      <IB title="Security"       body="Industry-standard encryption. Your data is locked tight."/>
      <IB title="Data Sharing"   body="Never sold. Only shared with delivery partners — and only what is needed."/>
      <div style={{ marginTop:'20px', padding:'12px 14px', border:'1px solid var(--paper-dk)', background:'var(--paper-dk)', fontSize:'8px', letterSpacing:'0.16em', color:'var(--ash)', fontFamily:"'Space Mono',monospace" }}>
        LAST UPDATED: FEB 2026 · REVIEWED QUARTERLY
      </div>
    </PageShell>
  );
}

export function Terms() {
  return (
    <PageShell title="TERMS" code="DOC-002">
      <IB title="Your Account"   body="You own the account, you own the responsibility. Keep credentials secure."/>
      <IB title="Payments"       body="Zero hidden charges. The price shown is exactly what you pay. Final."/>
      <IB title="Prohibited Use" body="No counterfeit or illegal items. We run clean operations only." tag="STRICT"/>
      <IB title="Governing Law"  body="Governed by Algerian law. Disputes through official legal channels."/>
      <div style={{ marginTop:'20px', padding:'12px 14px', borderLeft:'4px solid var(--punch)', background:'rgba(255,45,0,0.04)', fontSize:'8px', letterSpacing:'0.14em', lineHeight:'1.9', color:'var(--ash)', fontFamily:"'Space Mono',monospace" }}>
        TERMS MAY UPDATE. CONTINUED USE = ACCEPTANCE OF CURRENT VERSION.
      </div>
    </PageShell>
  );
}

export function Cookies() {
  return (
    <PageShell title="COOKIES" code="DOC-003">
      <IB title="Essential Cookies"  body="Core functions — login, cart, checkout. Cannot be disabled." tag="ALWAYS ON" tagColor="var(--ink)"/>
      <IB title="Preference Cookies" body="Saves your settings so you do not have to repeat yourself." tag="OPTIONAL"/>
      <IB title="Analytics Cookies"  body="Anonymous data to improve the experience. Nothing personal stored." tag="OPTIONAL"/>
      <div style={{ marginTop:'20px', padding:'14px', border:'1px solid var(--ink)', display:'flex', gap:'10px', alignItems:'flex-start' }}>
        <ToggleRight style={{ width:'16px', height:'16px', color:'var(--punch)', flexShrink:0, marginTop:'2px' }}/>
        <div>
          <p style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.14em', color:'var(--ink)', marginBottom:'5px', fontFamily:"'Space Mono',monospace" }}>MANAGE YOUR COOKIES</p>
          <p style={{ fontSize:'10px', lineHeight:'1.8', color:'var(--ash)' }}>Adjust through browser settings. Disabling essential cookies breaks core functionality.</p>
        </div>
      </div>
    </PageShell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [sent, setSent] = useState(false);
  return (
    <div style={{ backgroundColor:'var(--paper)', fontFamily:"'Space Mono',monospace", minHeight:'100vh' }}>
      {/* Punch header */}
      <div style={{ backgroundColor:'var(--punch)', padding:'80px 6vw 40px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:'-3%', bottom:'-15%', pointerEvents:'none', userSelect:'none', opacity:0.1 }}>
          <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(10rem,28vw,26rem)', color:'var(--paper)', letterSpacing:'-0.05em', lineHeight:1 }}>HIT</span>
        </div>
        <h1 style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'clamp(3rem,9vw,9rem)', color:'var(--paper)', letterSpacing:'-0.04em', lineHeight:0.88, position:'relative', zIndex:2 }}>HIT US.</h1>
        <p style={{ fontSize:'9px', letterSpacing:'0.2em', color:'rgba(242,239,232,0.55)', marginTop:'14px', position:'relative', zIndex:2 }}>WE REPLY WITHIN 24H · NO CAP</p>
      </div>
      <div className="contact-grid-z" style={{ maxWidth:'860px', margin:'0 auto', padding:'44px 24px 80px' }}>
        {/* Channels */}
        <div>
          <p style={{ fontSize:'8px', letterSpacing:'0.22em', color:'var(--ash)', marginBottom:'14px' }}>/ CONTACT CHANNELS</p>
          {[{emoji:'📡',label:'EMAIL',val:'hello@zinedrop.dz',href:'mailto:hello@zinedrop.dz'},{emoji:'📞',label:'PHONE',val:'+213 550 123 456',href:'tel:+213550123456'},{emoji:'📍',label:'BASE',val:'Alger, DZ',href:undefined}].map(item=>(
            <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', borderBottom:'1px solid var(--paper-dk)', textDecoration:'none', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--paper-dk)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <span style={{ fontSize:'1.3rem' }}>{item.emoji}</span>
              <div>
                <p style={{ fontSize:'8px', letterSpacing:'0.2em', color:'var(--ash)', marginBottom:'2px' }}>{item.label}</p>
                <p style={{ fontSize:'10px', fontWeight:700, color:'var(--ink)', letterSpacing:'0.08em' }}>{item.val}</p>
              </div>
              <ArrowUpRight style={{ width:'13px', height:'13px', color:'var(--punch)', marginLeft:'auto' }}/>
            </a>
          ))}
          <div style={{ marginTop:'20px', padding:'18px', background:'var(--ink)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', right:'-5%', bottom:'-10%', opacity:0.07, pointerEvents:'none' }}>
              <span style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'6rem', color:'var(--paper)', letterSpacing:'-0.04em' }}>RAW</span>
            </div>
            <p style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'1.2rem', color:'var(--punch)', letterSpacing:'-0.01em', lineHeight:1.1, position:'relative', zIndex:2 }}>STAY FRESH.<br/>STAY REAL.</p>
            <p style={{ fontSize:'8px', letterSpacing:'0.18em', color:'rgba(242,239,232,0.35)', marginTop:'8px', position:'relative', zIndex:2 }}>DROP CULTURE · ALGIERS</p>
          </div>
        </div>
        {/* Form */}
        <div>
          <p style={{ fontSize:'8px', letterSpacing:'0.22em', color:'var(--ash)', marginBottom:'14px' }}>/ SEND A MESSAGE</p>
          {sent ? (
            <div style={{ minHeight:'260px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid var(--ink)', textAlign:'center' }}>
              <CheckCircle2 style={{ width:'32px', height:'32px', color:'var(--punch)', marginBottom:'10px' }}/>
              <p style={{ fontFamily:"'Unbounded',sans-serif", fontWeight:900, fontSize:'1.1rem', color:'var(--ink)', letterSpacing:'-0.01em', marginBottom:'4px' }}>SENT.</p>
              <p style={{ fontSize:'8px', letterSpacing:'0.2em', color:'var(--ash)' }}>BACK IN 24H · NO CAP</p>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[{label:'YOUR NAME',type:'text',key:'name',ph:'Full name'},{label:'EMAIL',type:'email',key:'email',ph:'your@email.com'}].map(f=>(
                <div key={f.key}>
                  <p style={{ fontSize:'8px', letterSpacing:'0.22em', color:'var(--ash)', marginBottom:'5px' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required style={{ width:'100%', padding:'11px 13px', fontFamily:"'Space Mono',monospace", fontSize:'11px', background:'var(--paper)', border:'1px solid var(--ink)', color:'var(--ink)', outline:'none' }} onFocus={e=>{e.target.style.boxShadow='3px 3px 0 var(--punch)';}} onBlur={e=>{e.target.style.boxShadow='none';}}/>
                </div>
              ))}
              <div>
                <p style={{ fontSize:'8px', letterSpacing:'0.22em', color:'var(--ash)', marginBottom:'5px' }}>YOUR MESSAGE</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="What's good?" rows={5} required style={{ width:'100%', padding:'11px 13px', fontFamily:"'Space Mono',monospace", fontSize:'11px', background:'var(--paper)', border:'1px solid var(--ink)', color:'var(--ink)', outline:'none', resize:'none' as any }} onFocus={e=>{e.target.style.boxShadow='3px 3px 0 var(--punch)';}} onBlur={e=>{e.target.style.boxShadow='none';}}/>
              </div>
              <button type="submit" className="btn-z" style={{ justifyContent:'center', width:'100%', clipPath:'polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%)' }}>
                SEND IT <ArrowUpRight style={{ width:'13px', height:'13px' }}/>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}