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
  Shield, ArrowRight, Plus, Minus, Mountain, Compass,
  Wind, Thermometer, Droplets, Navigation,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ─── DESIGN TOKENS ────────────────────────────────────────── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');
`;

const CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

  :root {
    --parch:   #EDE8DC;
    --parch-dk:#E0D9C8;
    --bone:    #F7F3EB;
    --forest:  #1D3020;
    --forest-2:#2A4430;
    --forest-3:#3A5640;
    --rust:    #B5432A;
    --rust-lt: #D4604A;
    --slate:   #5C6B5A;
    --ink:     #0E1A0F;
    --mid:     #7A8C78;
    --dim:     #9CAA9A;
    --border:  rgba(29,48,32,0.18);
    --border-2:rgba(29,48,32,0.30);
  }

  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:var(--parch); }
  ::-webkit-scrollbar-thumb { background:var(--forest); }

  /* ── TYPOGRAPHY ── */
  .pf   { font-family:'Playfair Display',Georgia,serif; }
  .mono { font-family:'IBM Plex Mono',monospace; }

  /* ── AGED PAPER TEXTURE ── */
  .paper-tex {
    background-color: var(--parch);
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23p)' opacity='0.04'/%3E%3C/svg%3E");
  }

  /* ── CONTOUR LINES BG ── */
  .contour-bg {
    background-image:
      repeating-radial-gradient(ellipse at 30% 50%, transparent 0px, transparent 38px, rgba(29,48,32,0.05) 39px, transparent 40px),
      repeating-radial-gradient(ellipse at 70% 50%, transparent 0px, transparent 58px, rgba(29,48,32,0.04) 59px, transparent 60px),
      repeating-radial-gradient(ellipse at 50% 40%, transparent 0px, transparent 80px, rgba(29,48,32,0.035) 81px, transparent 82px);
  }

  /* ── HORIZONTAL RULE ── */
  .rule { border:none; border-top:1px solid var(--border); margin:0; }
  .rule-2 { border:none; border-top:1px solid var(--border-2); margin:0; }

  /* ── RULER TICK MARKS ── */
  .ruler {
    display:flex; align-items:flex-end; gap:0;
    border-bottom:1px solid var(--border-2);
    overflow:hidden;
  }
  .ruler-tick { display:flex; flex-direction:column; align-items:center; flex:1; }
  .ruler-tick span { display:block; background:var(--forest-3); }
  .ruler-tick .label { font-family:'IBM Plex Mono',monospace; font-size:7px; letter-spacing:0.1em; color:var(--mid); margin-bottom:2px; }

  /* ── LOG ENTRY (product card) ── */
  .log-entry {
    display:grid;
    grid-template-columns:64px 1fr 260px;
    min-height:200px;
    border-bottom:1px solid var(--border);
    transition:background 0.3s;
    cursor:pointer;
  }
  .log-entry:hover { background:rgba(29,48,32,0.03); }
  .log-entry:hover .entry-img img { transform:scale(1.04); }
  .log-entry-alt { grid-template-columns:260px 1fr 64px; }

  @media (max-width:768px) {
    .log-entry,
    .log-entry-alt { grid-template-columns:48px 1fr; min-height:auto; }
    .entry-img      { display:none; }
  }

  /* ── ENTRY IMAGE ── */
  .entry-img {
    overflow:hidden; position:relative;
    background:var(--parch-dk);
  }
  .entry-img img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.5s cubic-bezier(0.22,1,0.36,1); }

  /* ── REF NUMBER ── */
  .ref-col {
    display:flex; flex-direction:column; align-items:center; justify-content:flex-start;
    padding:20px 0; border-right:1px solid var(--border);
    gap:4px;
  }
  .ref-num {
    writing-mode:vertical-rl; text-orientation:mixed; transform:rotate(180deg);
    font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:0.24em;
    color:var(--mid); user-select:none;
  }
  .ref-dot { width:5px; height:5px; border-radius:50%; background:var(--rust); margin-top:6px; }

  /* ── ENTRY BODY ── */
  .entry-body {
    padding:24px 28px;
    display:flex; flex-direction:column; justify-content:space-between;
    border-right:1px solid var(--border);
  }

  /* ── ANIMATIONS ── */
  @keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  .fade-up   { animation:fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .fd1       { animation-delay:0.06s; }
  .fd2       { animation-delay:0.14s; }
  .fd3       { animation-delay:0.26s; }
  .fd4       { animation-delay:0.40s; }

  @keyframes compass-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .spin-slow { animation:compass-spin 12s linear infinite; }

  /* ── STAMP ── */
  .stamp {
    display:inline-flex; align-items:center; justify-content:center;
    border:2px solid var(--rust); color:var(--rust);
    font-family:'IBM Plex Mono',monospace; font-size:8px; font-weight:600;
    letter-spacing:0.18em; text-transform:uppercase; padding:4px 10px;
    transform:rotate(-2deg); background:transparent;
  }

  /* ── BTN ── */
  .btn-exp {
    display:inline-flex; align-items:center; gap:8px;
    font-family:'IBM Plex Mono',monospace; font-size:9px; font-weight:500;
    letter-spacing:0.18em; text-transform:uppercase; text-decoration:none;
    padding:12px 24px; border:1px solid var(--forest); background:var(--forest); color:var(--bone);
    cursor:pointer; transition:all 0.24s;
  }
  .btn-exp:hover { background:var(--rust); border-color:var(--rust); }
  .btn-exp-ghost {
    background:transparent; color:var(--forest); border:1px solid var(--border-2);
  }
  .btn-exp-ghost:hover { background:var(--forest); color:var(--bone); border-color:var(--forest); }

  /* ── FORM INPUT ── */
  .inp-exp {
    width:100%; padding:11px 14px;
    background:var(--bone); border:1px solid var(--border-2);
    font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--ink);
    outline:none; transition:border-color 0.2s, box-shadow 0.2s;
  }
  .inp-exp:focus { border-color:var(--forest); box-shadow:0 0 0 3px rgba(29,48,32,0.1); }
  .inp-exp::placeholder { color:var(--dim); }
  .inp-exp-err { border-color:var(--rust) !important; box-shadow:0 0 0 3px rgba(181,67,42,0.1) !important; }

  /* ── SECTION LABEL ── */
  .sec-label {
    display:flex; align-items:center; gap:10px;
    font-family:'IBM Plex Mono',monospace; font-size:8px; letter-spacing:0.24em;
    text-transform:uppercase; color:var(--mid);
  }
  .sec-label::before { content:''; display:block; width:20px; height:1px; background:var(--rust); }

  /* ── CONTOUR LINE DIVIDER ── */
  .cdiv {
    height:40px; overflow:hidden;
    background:var(--forest);
  }
`;

/* ── SVG ELEMENTS ─────────────────────────────────────────── */
function ContourDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div style={{ overflow:'hidden', lineHeight:0, transform:flip?'scaleY(-1)':'none' }}>
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:'60px' }} fill="var(--forest)">
        <path d="M0,60 L0,30 Q60,10 120,25 Q180,40 240,20 Q300,0 360,15 Q420,30 480,10 Q540,-5 600,20 Q660,40 720,15 Q780,-5 840,22 Q900,45 960,18 Q1020,-8 1080,20 Q1140,45 1200,25 L1200,60 Z"/>
      </svg>
    </div>
  );
}

function CompassRose({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2"/>
      <circle cx="20" cy="20" r="2.5" fill="currentColor"/>
      <path d="M20 4 L22 18 L20 20 L18 18 Z" fill="currentColor" opacity="0.9"/>
      <path d="M20 36 L22 22 L20 20 L18 22 Z" fill="currentColor" opacity="0.4"/>
      <path d="M4 20 L18 18 L20 20 L18 22 Z" fill="currentColor" opacity="0.4"/>
      <path d="M36 20 L22 18 L20 20 L22 22 Z" fill="currentColor" opacity="0.7"/>
      <text x="20" y="3" textAnchor="middle" fontSize="4" fill="currentColor" fontFamily="IBM Plex Mono" letterSpacing="0.1em" fontWeight="600">N</text>
    </svg>
  );
}

function ElevationProfile() {
  return (
    <svg viewBox="0 0 300 50" preserveAspectRatio="none" style={{ width:'100%', height:'50px', display:'block', opacity:0.35 }}>
      <polyline points="0,50 20,42 45,35 70,28 95,18 120,24 145,12 170,20 195,8 220,16 245,22 270,30 300,38" fill="none" stroke="var(--rust)" strokeWidth="1.5"/>
      <polyline points="0,50 20,42 45,35 70,28 95,18 120,24 145,12 170,20 195,8 220,16 245,22 270,30 300,38 300,50" fill="var(--rust)" opacity="0.15"/>
    </svg>
  );
}

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

/* ── MAIN ─────────────────────────────────────────────────── */
export default function Main({ store, children }: any) {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--parch)', fontFamily:"'IBM Plex Mono',monospace", color:'var(--ink)' }}>
      <style>{CSS}</style>
      <Navbar store={store}/>
      <main>{children}</main>
      <Footer store={store}/>
    </div>
  );
}

/* ── NAVBAR ───────────────────────────────────────────────── */
export function Navbar({ store }: { store: Store }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isRTL = store.language === 'ar';
  const [coords, setCoords] = useState('36°42\'N  3°13\'E');

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const nav = [
    { href:`/${store.subdomain}`,         label:isRTL?'الرئيسية':'FIELD BASE'  },
    { href:`/${store.subdomain}/contact`, label:isRTL?'اتصل بنا':'DISPATCH'   },
    { href:`/${store.subdomain}/Privacy`, label:isRTL?'الخصوصية':'LOG / PRIV' },
  ];

  const initials = store.name.split(' ').filter(Boolean).map((w:string)=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <nav dir={isRTL?'rtl':'ltr'} style={{ position:'sticky', top:0, zIndex:50, backgroundColor:'var(--forest)', transition:'box-shadow 0.3s', boxShadow:scrolled?'0 2px 20px rgba(14,26,15,0.3)':'none' }}>

      {/* Top announcement ticker */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ backgroundColor:'var(--rust)', padding:'5px 0', overflow:'hidden', whiteSpace:'nowrap' }}>
          <div style={{ display:'inline-block', animation:'ticker-run 20s linear infinite' }}>
            {Array(10).fill(null).map((_,i)=>(
              <span key={i} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'var(--bone)', margin:'0 32px' }}>
                ◆ {store.topBar.text.toUpperCase()}
              </span>
            ))}
            {Array(10).fill(null).map((_,i)=>(
              <span key={`b${i}`} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'var(--bone)', margin:'0 32px' }}>
                ◆ {store.topBar.text.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ruler tick strip */}
      <div style={{ display:'flex', alignItems:'flex-end', height:'20px', borderBottom:'1px solid rgba(247,243,235,0.1)', padding:'0 0 0 0', overflow:'hidden' }}>
        {Array(60).fill(null).map((_,i)=>(
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', paddingBottom:'2px' }}>
            <span style={{ display:'block', width:'1px', height:i%10===0?'10px':i%5===0?'6px':'3px', backgroundColor:i%10===0?'rgba(247,243,235,0.5)':i%5===0?'rgba(247,243,235,0.3)':'rgba(247,243,235,0.12)' }}/>
          </div>
        ))}
      </div>

      {/* Main nav row */}
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:'56px' }}>

          {/* Logo */}
          <Link href={`/${store.subdomain}`} style={{ display:'flex', alignItems:'center', gap:'12px', textDecoration:'none' }}>
            <div style={{ width:'36px', height:'36px', border:'1px solid rgba(247,243,235,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--bone)', flexShrink:0 }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:'13px', color:'var(--bone)' }}>{initials}</span>
              }
            </div>
            <div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1rem', color:'var(--bone)', letterSpacing:'0.04em', lineHeight:1, margin:0 }}>
                {store.name}
              </p>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.22em', color:'rgba(247,243,235,0.4)', marginTop:'2px' }}>
                {coords}
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div style={{ display:'flex', alignItems:'center', gap:'28px' }} className="hidden md:flex">
            {nav.map(item => (
              <Link key={item.href} href={item.href} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'9px', letterSpacing:'0.2em', color:'rgba(247,243,235,0.55)', textDecoration:'none', transition:'color 0.2s', textTransform:'uppercase' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--bone)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(247,243,235,0.55)';}}>
                {item.label}
              </Link>
            ))}
            <a href="#gear" className="btn-exp" style={{ padding:'9px 20px', fontSize:'9px', border:'1px solid rgba(247,243,235,0.3)', background:'transparent', color:'var(--parch)' }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background='var(--rust)'; el.style.borderColor='var(--rust)';}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.borderColor='rgba(247,243,235,0.3)';}}>
              <Mountain style={{ width:'12px', height:'12px' }}/> {isRTL?'تجهيز':'GEAR UP'}
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={()=>setMenuOpen(p=>!p)} style={{ display:'flex', background:'none', border:'none', cursor:'pointer', color:'var(--bone)', padding:'4px' }} className="md:hidden">
            {menuOpen ? <X style={{ width:'18px', height:'18px' }}/> : <Compass style={{ width:'18px', height:'18px' }}/>}
          </button>
        </div>

        {/* Mobile menu */}
        <div style={{ maxHeight:menuOpen?'220px':'0', overflow:'hidden', transition:'max-height 0.35s ease' }}>
          <div style={{ borderTop:'1px solid rgba(247,243,235,0.1)', paddingBottom:'12px', paddingTop:'8px' }}>
            {nav.map(item=>(
              <Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', letterSpacing:'0.18em', color:'rgba(247,243,235,0.6)', textDecoration:'none', textTransform:'uppercase', borderBottom:'1px solid rgba(247,243,235,0.07)' }}>
                {item.label} <ArrowRight style={{ width:'12px', height:'12px', color:'var(--rust)' }}/>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ── FOOTER ───────────────────────────────────────────────── */
export function Footer({ store }: any) {
  const year = new Date().getFullYear();
  const isRTL = store.language === 'ar';

  return (
    <footer style={{ position:'relative', overflow:'hidden' }}>
      <ContourDivider/>
      <div style={{ backgroundColor:'var(--forest)', position:'relative' }}>
        {/* Background contour watermark */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(6rem,18vw,16rem)', color:'rgba(247,243,235,0.03)', whiteSpace:'nowrap', letterSpacing:'-0.02em' }}>
            Expedition
          </span>
        </div>

        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'60px 24px 40px', position:'relative', zIndex:2 }}>
          {/* Top section */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'40px', paddingBottom:'40px', borderBottom:'1px solid rgba(247,243,235,0.1)' }}>

            {/* Brand */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                <div style={{ color:'rgba(247,243,235,0.7)' }} className="spin-slow"><CompassRose size={32}/></div>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1.1rem', color:'var(--bone)', lineHeight:1, margin:0 }}>{store.name}</p>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.22em', color:'rgba(247,243,235,0.35)', marginTop:'3px' }}>FIELD GEAR · ALGIERS</p>
                </div>
              </div>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', lineHeight:'1.8', color:'rgba(247,243,235,0.45)', letterSpacing:'0.05em' }}>
                {isRTL ? 'معدات المغامرة الأصيلة. مصنوعة للبرية.' : 'Authentic field gear. Built for the wild, tested in the field.'}
              </p>
              <div style={{ marginTop:'16px' }}>
                <ElevationProfile/>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.2em', color:'rgba(247,243,235,0.25)', marginTop:'4px' }}>ELEVATION PROFILE · ALGERIAN HIGHLANDS</p>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.24em', color:'var(--rust)', marginBottom:'16px', textTransform:'uppercase' }}>// WAYPOINTS</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {[
                  [`/${store.subdomain}/Privacy`, 'PRIVACY LOG'],
                  [`/${store.subdomain}/Terms`,   'FIELD TERMS'],
                  [`/${store.subdomain}/Cookies`, 'COOKIE DATA'],
                  [`/${store.subdomain}/contact`, 'DISPATCH'],
                ].map(([href, label]) => (
                  <a key={href} href={href} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', letterSpacing:'0.14em', color:'rgba(247,243,235,0.4)', textDecoration:'none', display:'flex', alignItems:'center', gap:'8px', transition:'color 0.2s, paddingLeft 0.2s', paddingLeft:'0' }}
                    onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--bone)'; el.style.paddingLeft='8px';}}
                    onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color='rgba(247,243,235,0.4)'; el.style.paddingLeft='0';}}>
                    <span style={{ color:'var(--rust)', fontSize:'8px' }}>→</span> {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Field data */}
            <div>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.24em', color:'var(--rust)', marginBottom:'16px', textTransform:'uppercase' }}>// FIELD DATA</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1px', border:'1px solid rgba(247,243,235,0.1)', backgroundColor:'rgba(247,243,235,0.1)' }}>
                {[
                  { icon:<Wind style={{ width:'12px', height:'12px' }}/>,        label:'WIND',  val:'12 km/h' },
                  { icon:<Thermometer style={{ width:'12px', height:'12px' }}/>, label:'TEMP',  val:'18°C'    },
                  { icon:<Droplets style={{ width:'12px', height:'12px' }}/>,    label:'HUMID', val:'55%'     },
                  { icon:<Mountain style={{ width:'12px', height:'12px' }}/>,    label:'ELEV',  val:'800 m'   },
                ].map(d => (
                  <div key={d.label} style={{ padding:'12px', backgroundColor:'var(--forest-2)', display:'flex', flexDirection:'column', gap:'5px' }}>
                    <div style={{ color:'rgba(247,243,235,0.35)' }}>{d.icon}</div>
                    <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.2em', color:'rgba(247,243,235,0.3)', margin:0 }}>{d.label}</p>
                    <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'12px', fontWeight:600, color:'var(--bone)', margin:0 }}>{d.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div style={{ paddingTop:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.16em', color:'rgba(247,243,235,0.25)' }}>
              © {year} {store.name.toUpperCase()} · ALL RIGHTS RESERVED · FIELD JOURNAL THEME
            </p>
            <div style={{ display:'flex', gap:'16px' }}>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.14em', color:'rgba(247,243,235,0.2)' }}>36°42'N 3°13'E</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.14em', color:'rgba(247,243,235,0.2)' }}>ALT: 800m</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── CARD (log entry) ─────────────────────────────────────── */
export function Card({ product, displayImage, discount, isRTL, store, viewDetails, index = 0 }: any) {
  const [hov, setHov] = useState(false);
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
  const refCode = `EXP-${String((index + 1)).padStart(3, '0')}`;
  const isAlt = index % 2 === 1;

  return (
    <div className={`log-entry ${isAlt ? 'log-entry-alt' : ''}`}
      style={{ backgroundColor: hov ? 'rgba(29,48,32,0.025)' : 'transparent' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

      {/* Column A: ref number OR image (alternating) */}
      {!isAlt ? (
        <div className="ref-col">
          <span className="ref-num">{refCode}</span>
          <div className="ref-dot"/>
        </div>
      ) : (
        <div className="entry-img">
          {displayImage
            ? <img src={displayImage} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s cubic-bezier(0.22,1,0.36,1)', transform:hov?'scale(1.04)':'scale(1)' }}/>
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--parch-dk)' }}>
                <Mountain style={{ width:'32px', height:'32px', color:'var(--dim)' }}/>
              </div>
          }
        </div>
      )}

      {/* Column B: info body */}
      <div className="entry-body">
        <div>
          {/* Meta row */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
            <span className="sec-label" style={{ fontSize:'7px' }}>{isRTL?'معدات':'FIELD GEAR'}</span>
            {discount > 0 && <span className="stamp" style={{ fontSize:'7px', padding:'2px 8px', transform:'rotate(-1.5deg)' }}>-{discount}%</span>}
          </div>

          {/* Name */}
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontStyle:'italic', fontSize:'clamp(1.3rem,2.5vw,2rem)', color:'var(--ink)', letterSpacing:'-0.01em', lineHeight:1.15, marginBottom:'10px' }}>
            {product.name}
          </h3>

          {/* Stars */}
          <div style={{ display:'flex', gap:'3px', alignItems:'center', marginBottom:'14px' }}>
            {[...Array(5)].map((_,i) => <Star key={i} style={{ width:'10px', height:'10px', fill:i<4?'var(--rust)':'none', color:'var(--rust)' }}/>)}
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.12em', color:'var(--mid)', marginLeft:'4px' }}>4.8</span>
          </div>

          {/* Description snippet */}
          {product.desc && (
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', lineHeight:'1.7', color:'var(--slate)', letterSpacing:'0.04em', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {product.desc.replace(/<[^>]*>/g, '').slice(0, 120)}...
            </p>
          )}
        </div>

        {/* Bottom row */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:'16px', paddingTop:'14px', borderTop:'1px solid var(--border)' }}>
          <div>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.2em', color:'var(--dim)', marginBottom:'2px', textTransform:'uppercase' }}>Field Price</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:'2rem', color:'var(--rust)', letterSpacing:'-0.02em', lineHeight:1 }}>{price.toLocaleString()}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', color:'var(--mid)' }}>دج</span>
              {product.priceOriginal && parseFloat(String(product.priceOriginal)) > price && (
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'9px', color:'var(--dim)', textDecoration:'line-through' }}>
                  {parseFloat(String(product.priceOriginal)).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <Link href={`/${store.subdomain}/product/${product.slug||product.id}`}
            className="btn-exp" style={{ padding:'10px 18px', fontSize:'8px', textDecoration:'none' }}>
            {viewDetails} <ArrowRight style={{ width:'11px', height:'11px' }}/>
          </Link>
        </div>
      </div>

      {/* Column C: image OR ref number (alternating) */}
      {!isAlt ? (
        <div className="entry-img">
          {displayImage
            ? <img src={displayImage} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s cubic-bezier(0.22,1,0.36,1)', transform:hov?'scale(1.04)':'scale(1)' }}/>
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--parch-dk)' }}>
                <Mountain style={{ width:'32px', height:'32px', color:'var(--dim)' }}/>
              </div>
          }
        </div>
      ) : (
        <div className="ref-col">
          <span className="ref-num">{refCode}</span>
          <div className="ref-dot"/>
        </div>
      )}
    </div>
  );
}

/* ── HOME ─────────────────────────────────────────────────── */
export function Home({ store }: any) {
  const isRTL = store.language === 'ar';
  const products: any[] = store.products || [];
  const t = {
    brief:       isRTL ? 'ملخص المهمة'              : 'MISSION BRIEF',
    departure:   isRTL ? 'نقطة الانطلاق'            : 'DEPARTURE POINT',
    heroSub:     isRTL ? 'معدات أصيلة للمغامرة الجزائرية.' : 'Authentic gear for the Algerian wild.',
    viewGear:    isRTL ? 'استعرض المعدات'            : 'VIEW FIELD GEAR',
    browse:      isRTL ? 'استعرض الفئات'             : 'BROWSE CATEGORIES',
    gearLog:     isRTL ? 'دفتر المعدات'              : 'FIELD GEAR LOG',
    gearSub:     isRTL ? 'كل قطعة مُختبَرة في الميدان' : 'Every piece field-tested and approved.',
    viewDetails: isRTL ? 'عرض التفاصيل'              : 'VIEW DETAILS',
    noItems:     isRTL ? 'لا توجد معدات بعد'          : 'NO GEAR LOGGED YET',
    allGear:     isRTL ? 'كل المعدات'                : 'ALL GEAR',
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── HERO: Document split layout ── */}
      <section style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'calc(100vh - 76px)', backgroundColor:'var(--parch)' }} className="contour-bg">

        {/* LEFT: Expedition Brief document */}
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'8vh 6vw', borderRight:'1px solid var(--border-2)', position:'relative', backgroundColor:'var(--bone)', overflow:'hidden' }}>
          {/* Paper texture overlay */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.5 }}
            className="paper-tex"/>

          {/* Document header */}
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', paddingBottom:'16px', borderBottom:'1px solid var(--border-2)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ color:'var(--forest)' }}><CompassRose size={28}/></div>
                <div>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.24em', color:'var(--mid)', textTransform:'uppercase', margin:0 }}>{t.brief}</p>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.16em', color:'var(--dim)', margin:0, marginTop:'2px' }}>
                    DOC-{new Date().getFullYear()}-001
                  </p>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', color:'var(--dim)', letterSpacing:'0.12em', margin:0 }}>
                  {new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase()}
                </p>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', color:'var(--dim)', letterSpacing:'0.12em', margin:0, marginTop:'2px' }}>
                  36°42'N · 3°13'E
                </p>
              </div>
            </div>

            {/* Main headline */}
            <div className="fade-up">
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.24em', color:'var(--rust)', textTransform:'uppercase', marginBottom:'10px' }}>
                {t.departure} ↓
              </p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(2.8rem,6vw,5rem)', color:'var(--forest)', letterSpacing:'-0.02em', lineHeight:0.9, marginBottom:'20px' }}>
                {store.hero?.title || (isRTL ? <>المغامرة<br/>تبدأ هنا</> : <>Into the<br/>Unknown</>)}
              </h1>
            </div>

            <p className="fade-up fd1" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'11px', lineHeight:'1.8', color:'var(--slate)', letterSpacing:'0.05em', maxWidth:'360px', borderLeft:'2px solid var(--rust)', paddingLeft:'14px', marginBottom:'28px' }}>
              {store.hero?.subtitle || t.heroSub}
            </p>

            {/* CTAs */}
            <div className="fade-up fd2" style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <a href="#gear" className="btn-exp" style={{ textDecoration:'none' }}>
                <Mountain style={{ width:'13px', height:'13px' }}/> {t.viewGear}
              </a>
              <a href="#categories" className="btn-exp btn-exp-ghost" style={{ textDecoration:'none' }}>
                {t.browse} <ArrowRight style={{ width:'12px', height:'12px' }}/>
              </a>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="fade-up fd3" style={{ position:'relative', zIndex:2, paddingTop:'24px', borderTop:'1px solid var(--border)', marginTop:'32px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', backgroundColor:'var(--border)' }}>
              {[
                { n:`${products.length||'—'}`, l:isRTL?'قطعة معدات':'GEAR ITEMS' },
                { n:'48H', l:isRTL?'توصيل':'DELIVERY' },
                { n:'100%', l:isRTL?'أصيل':'AUTHENTIC' },
              ].map((s,i) => (
                <div key={i} style={{ padding:'14px 12px', backgroundColor:'var(--bone)' }}>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:'1.8rem', color:'var(--forest)', letterSpacing:'-0.02em', lineHeight:1, margin:0 }}>{s.n}</p>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.2em', color:'var(--mid)', marginTop:'4px', margin:0, marginTop:'4px', textTransform:'uppercase' }}>{s.l}</p>
                </div>
              ))}
            </div>
            {/* Elevation profile strip */}
            <div style={{ marginTop:'12px', paddingTop:'8px', borderTop:'1px solid var(--border)' }}>
              <ElevationProfile/>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.18em', color:'var(--dim)', marginTop:'3px' }}>
                TERRAIN PROFILE · ATLAS MOUNTAINS
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Full-bleed image */}
        <div style={{ position:'relative', minHeight:'500px', overflow:'hidden', backgroundColor:'var(--forest-2)' }} className="fade-up fd1">
          {store.hero?.imageUrl
            ? <img src={store.hero.imageUrl} alt={store.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter:'contrast(1.05) saturate(0.85)' }}/>
            : (
                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }} className="contour-bg">
                  <div style={{ textAlign:'center', color:'rgba(247,243,235,0.3)' }}>
                    <Mountain style={{ width:'64px', height:'64px', margin:'0 auto 12px' }}/>
                    <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'9px', letterSpacing:'0.2em' }}>TERRAIN UNKNOWN</p>
                  </div>
                </div>
              )
          }
          {/* Forest overlay gradient */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(29,48,32,0.35) 0%, transparent 60%)', pointerEvents:'none' }}/>
          {/* Corner tag */}
          <div style={{ position:'absolute', top:'20px', right:'20px', backgroundColor:'rgba(14,26,15,0.85)', padding:'8px 14px', backdropFilter:'blur(8px)' }}>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.2em', color:'rgba(247,243,235,0.6)', margin:0 }}>FIELD READY</p>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', fontWeight:600, color:'var(--bone)', margin:0, marginTop:'2px' }}>SS {new Date().getFullYear()}</p>
          </div>
          {/* Bottom coordinate tag */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'16px 20px', background:'linear-gradient(to top, rgba(14,26,15,0.8) 0%, transparent 100%)' }}>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'rgba(247,243,235,0.55)', margin:0 }}>
              36°42'47"N · 3°13'22"E · ALT 800m
            </p>
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER ── */}
      {store.categories?.length > 0 && (
        <section id="categories" style={{ backgroundColor:'var(--parch-dk)', borderTop:'1px solid var(--border-2)', borderBottom:'1px solid var(--border-2)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px' }}>
            <div style={{ display:'flex', alignItems:'stretch', overflowX:'auto', borderLeft:'1px solid var(--border)', borderRight:'1px solid var(--border)' }}>
              <div style={{ flexShrink:0, padding:'12px 18px', borderRight:'1px solid var(--border)', display:'flex', alignItems:'center' }}>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.22em', color:'var(--mid)', whiteSpace:'nowrap', textTransform:'uppercase' }}>
                  {isRTL ? 'صنف المعدات' : 'GEAR CLASS'}
                </span>
              </div>
              <Link href={`/${store.domain}`} style={{ display:'flex', alignItems:'center', padding:'12px 22px', borderRight:'1px solid var(--border)', fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.16em', textDecoration:'none', backgroundColor:'var(--forest)', color:'var(--bone)', whiteSpace:'nowrap', flexShrink:0, textTransform:'uppercase', transition:'background 0.2s' }}>
                ◆ {t.allGear}
              </Link>
              {store.categories.map((cat:any) => (
                <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                  style={{ display:'flex', alignItems:'center', padding:'12px 22px', borderRight:'1px solid var(--border)', fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.16em', textDecoration:'none', color:'var(--slate)', whiteSpace:'nowrap', flexShrink:0, textTransform:'uppercase', transition:'all 0.2s' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background='var(--forest)'; el.style.color='var(--bone)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.color='var(--slate)';}}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GEAR LOG ── */}
      <section id="gear" style={{ backgroundColor:'var(--parch)' }}>
        {/* Section header */}
        <div style={{ backgroundColor:'var(--forest)', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'100%' }}>
          <div>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.24em', color:'var(--rust)', textTransform:'uppercase', margin:0 }}>// EXPEDITION MANIFEST</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontStyle:'italic', fontSize:'clamp(1.2rem,2.5vw,2rem)', color:'var(--bone)', letterSpacing:'-0.01em', margin:'4px 0 0', lineHeight:1 }}>
              {t.gearLog}
            </h2>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'rgba(247,243,235,0.35)' }}>
              {products.length} {isRTL ? 'عنصر' : 'ITEMS LOGGED'}
            </span>
            <div style={{ color:'rgba(247,243,235,0.4)' }}><CompassRose size={24}/></div>
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display:'grid', gridTemplateColumns:'64px 1fr 260px', borderBottom:'1px solid var(--border-2)', backgroundColor:'var(--parch-dk)' }}>
          {[
            { label:'REF', style:{ borderRight:'1px solid var(--border)', padding:'8px 0', textAlign:'center' as const } },
            { label:'GEAR ENTRY', style:{ borderRight:'1px solid var(--border)', padding:'8px 20px' } },
            { label:'FIELD PHOTO', style:{ padding:'8px 16px' } },
          ].map(col => (
            <div key={col.label} style={{ ...col.style }}>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.24em', color:'var(--mid)', textTransform:'uppercase' }}>{col.label}</span>
            </div>
          ))}
        </div>

        {products.length === 0 ? (
          <div style={{ minHeight:'400px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderBottom:'1px solid var(--border)' }}>
            <Mountain style={{ width:'48px', height:'48px', color:'var(--dim)', marginBottom:'16px' }}/>
            <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'1.5rem', color:'var(--dim)' }}>{t.noItems}</p>
          </div>
        ) : (
          <div>
            {products.map((product: any, index: number) => {
              const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
              const discount = product.priceOriginal ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;
              return (
                <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails} index={index}/>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FIELD CALL TO ACTION ── */}
      <section style={{ position:'relative', overflow:'hidden' }}>
        <ContourDivider/>
        <div style={{ backgroundColor:'var(--forest)', padding:'72px 6vw', position:'relative' }} className="contour-bg">
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(181,67,42,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ maxWidth:'640px', margin:'0 auto', textAlign:'center', position:'relative', zIndex:2 }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'24px', color:'rgba(247,243,235,0.5)' }}>
              <div className="spin-slow"><CompassRose size={52}/></div>
            </div>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.28em', color:'var(--rust)', textTransform:'uppercase', marginBottom:'12px' }}>
              {isRTL ? 'جاهز للمغامرة؟' : 'READY FOR THE FIELD?'}
            </p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(2.5rem,6vw,5rem)', color:'var(--bone)', letterSpacing:'-0.02em', lineHeight:0.9, marginBottom:'20px' }}>
              {isRTL ? <>المغامرة<br/>تنتظرك</> : <>The Wild<br/>Awaits You</>}
            </h2>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', lineHeight:'1.8', color:'rgba(247,243,235,0.5)', letterSpacing:'0.06em', marginBottom:'28px' }}>
              {isRTL ? 'معدات مُختارة للبيئة الجزائرية الوعرة.' : 'Curated field gear for the Algerian terrain.'}
            </p>
            <a href="#gear" className="btn-exp" style={{ textDecoration:'none', padding:'14px 32px' }}>
              <Navigation style={{ width:'14px', height:'14px' }}/> {isRTL ? 'ابدأ التجهيز' : 'BEGIN OUTFITTING'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── DETAILS ─────────────────────────────────────────────── */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ backgroundColor:'var(--parch)' }}>

      {/* Breadcrumb */}
      <div style={{ backgroundColor:'var(--forest)', padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.18em', color:'rgba(247,243,235,0.45)' }}>
          <span>{isRTL?'الرئيسية':'FIELD BASE'}</span>
          <span style={{ color:'var(--rust)' }}>→</span>
          <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, color:'var(--bone)', fontSize:'9px' }}>{product.name.slice(0,32)}</span>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <button onClick={toggleWishlist} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isWishlisted?'var(--rust)':'rgba(247,243,235,0.2)'}`, background:isWishlisted?'var(--rust)':'transparent', cursor:'pointer', color:isWishlisted?'var(--bone)':'rgba(247,243,235,0.5)' }}>
            <Heart style={{ width:'12px', height:'12px', fill:isWishlisted?'currentColor':'none' }}/>
          </button>
          <button onClick={handleShare} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(247,243,235,0.2)', background:'transparent', cursor:'pointer', color:'rgba(247,243,235,0.5)' }}>
            <Share2 style={{ width:'12px', height:'12px' }}/>
          </button>
          <div style={{ padding:'6px 12px', background:inStock||autoGen?'rgba(247,243,235,0.15)':'var(--rust)', color:'var(--bone)', fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.2em' }}>
            {autoGen?'∞ STOCK':inStock?'IN STOCK':'OUT OF STOCK'}
          </div>
        </div>
      </div>

      {/* Main split layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>

        {/* LEFT: Image */}
        <div style={{ position:'sticky', top:'56px', height:'calc(100vh - 56px)', overflow:'hidden', borderRight:'1px solid var(--border-2)' }}>
          <div style={{ position:'relative', width:'100%', height:'100%' }}>
            {allImages.length > 0
              ? <img src={allImages[selectedImage]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'var(--parch-dk)' }} className="contour-bg">
                  <Mountain style={{ width:'64px', height:'64px', color:'var(--dim)' }}/>
                </div>
            }
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(14,26,15,0.85) 0%, rgba(14,26,15,0.15) 40%, transparent 65%)', pointerEvents:'none' }}/>

            {/* Price overlay */}
            <div style={{ position:'absolute', bottom:'20px', left:'20px', right:'20px' }}>
              {discount>0 && <div className="stamp" style={{ marginBottom:'10px', display:'inline-flex' }}>-{discount}% OFF</div>}
              <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(2.5rem,5vw,4rem)', color:'var(--bone)', letterSpacing:'-0.02em', lineHeight:1 }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'1rem', color:'rgba(247,243,235,0.65)' }}>دج</span>
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length>1 && (
              <div style={{ position:'absolute', right:'12px', top:'20px', display:'flex', flexDirection:'column', gap:'6px' }}>
                {allImages.slice(0,5).map((img:string,idx:number) => (
                  <button key={idx} onClick={()=>setSelectedImage(idx)} style={{ width:'44px', height:'44px', overflow:'hidden', border:`2px solid ${selectedImage===idx?'var(--rust)':'rgba(247,243,235,0.25)'}`, cursor:'pointer', padding:0, background:'none', opacity:selectedImage===idx?1:0.6 }}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                  </button>
                ))}
              </div>
            )}

            {/* Sold out */}
            {!inStock && !autoGen && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(247,243,235,0.85)', backdropFilter:'blur(4px)' }}>
                <div className="stamp" style={{ transform:'rotate(-6deg)', fontSize:'1.4rem', padding:'8px 24px', borderWidth:'3px' }}>OUT OF STOCK</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Details */}
        <div style={{ overflowY:'auto', padding:'32px 28px', backgroundColor:'var(--bone)' }} className="paper-tex">

          {/* Doc header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', paddingBottom:'18px', borderBottom:'1px solid var(--border)' }}>
            <div>
              <p className="sec-label" style={{ marginBottom:'4px' }}>{isRTL?'معدات الميدان':'FIELD GEAR'}</p>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.2em', color:'var(--dim)', margin:0 }}>
                EXP-{product.id.slice(0,6).toUpperCase()} · SS{new Date().getFullYear()}
              </p>
            </div>
            <div style={{ color:'var(--forest)', opacity:0.4 }}><CompassRose size={28}/></div>
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(1.8rem,4vw,3.2rem)', color:'var(--forest)', letterSpacing:'-0.02em', lineHeight:0.9, marginBottom:'16px' }}>
            {product.name}
          </h1>

          {/* Stars */}
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--border)' }}>
            {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'12px', height:'12px', fill:i<4?'var(--rust)':'none', color:'var(--rust)' }}/>)}
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.14em', color:'var(--mid)' }}>4.8 · 128 {isRTL?'تقييم':'FIELD REPORTS'}</span>
          </div>

          {/* Price block */}
          <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--border)' }}>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'var(--mid)', marginBottom:'6px', textTransform:'uppercase' }}>
              {isRTL?'سعر الميدان':'FIELD PRICE'}
            </p>
            <div style={{ display:'flex', alignItems:'baseline', gap:'10px', flexWrap:'wrap' }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:'3.5rem', color:'var(--rust)', letterSpacing:'-0.02em', lineHeight:1 }}>
                {finalPrice.toLocaleString()}
              </span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'1rem', color:'var(--mid)' }}>دج</span>
              {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                <div>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'11px', textDecoration:'line-through', color:'var(--dim)', display:'block' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'9px', color:'var(--rust)', letterSpacing:'0.1em' }}>SAVE {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج</span>
                </div>
              )}
            </div>
          </div>

          {/* Stock */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'7px 14px', marginBottom:'22px', border:`1px solid ${inStock||autoGen?'var(--forest)':'var(--rust)'}`, fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.18em', color:inStock||autoGen?'var(--forest)':'var(--rust)' }}>
            {autoGen?<Infinity style={{ width:'11px', height:'11px' }}/>:inStock?<span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'var(--forest)', display:'inline-block' }}/>:<X style={{ width:'11px', height:'11px' }}/>}
            {autoGen?'UNLIMITED':inStock?'IN STOCK':'OUT OF STOCK'}
          </div>

          {/* Offers */}
          {product.offers?.length>0 && (
            <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--border)' }}>
              <p className="sec-label" style={{ marginBottom:'10px' }}>{isRTL?'اختر الباقة':'BUNDLE OPTIONS'}</p>
              {product.offers.map((offer:any)=>(
                <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', border:`1px solid ${selectedOffer===offer.id?'var(--forest)':'var(--border)'}`, backgroundColor:selectedOffer===offer.id?'rgba(29,48,32,0.05)':'transparent', cursor:'pointer', marginBottom:'6px', transition:'all 0.18s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'13px', height:'13px', border:`1px solid ${selectedOffer===offer.id?'var(--forest)':'var(--border-2)'}`, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', flexShrink:0 }}>
                      {selectedOffer===offer.id&&<div style={{ width:'7px', height:'7px', background:'var(--rust)', borderRadius:'50%' }}/>}
                    </div>
                    <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                    <div>
                      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', fontWeight:600, color:'var(--ink)', letterSpacing:'0.08em' }}>{offer.name}</p>
                      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', color:'var(--mid)', letterSpacing:'0.1em' }}>QTY: {offer.quantity}</p>
                    </div>
                  </div>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:'1.2rem', color:'var(--rust)', letterSpacing:'-0.01em' }}>
                    {offer.price.toLocaleString()}<span style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:300, fontSize:'9px', marginLeft:'3px', color:'var(--mid)' }}>دج</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--border)' }}>
              <p className="sec-label" style={{ marginBottom:'10px', fontSize:'7px' }}>/ {attr.name.toUpperCase()}</p>
              {attr.displayMode==='color' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'30px', height:'30px', backgroundColor:v.value, border:`3px solid ${s?'var(--forest)':'transparent'}`, cursor:'pointer', outline:s?'2px solid var(--rust)':'none', outlineOffset:'2px' }}/>;})}
                </div>
              ):attr.displayMode==='image' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'50px', height:'50px', overflow:'hidden', border:`2px solid ${s?'var(--rust)':'var(--border)'}`, cursor:'pointer', padding:0 }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                </div>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ padding:'8px 14px', border:`1px solid ${s?'var(--forest)':'var(--border)'}`, backgroundColor:s?'var(--forest)':'transparent', color:s?'var(--bone)':'var(--slate)', fontFamily:"'IBM Plex Mono',monospace", fontSize:'9px', letterSpacing:'0.12em', cursor:'pointer', transition:'all 0.18s' }}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--border)' }}>
              <p className="sec-label" style={{ marginBottom:'12px', fontSize:'7px' }}>{isRTL?'مواصفات المعدات':'GEAR SPECS'}</p>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'11px', lineHeight:'1.9', color:'var(--slate)', letterSpacing:'0.04em' }}
                dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc,{ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','span'],ALLOWED_ATTR:['class','style']})}}/>
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
    {label && <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.24em', color:'var(--mid)', marginBottom:'5px', textTransform:'uppercase' }}>{label}</p>}
    {children}
    {error && <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', color:'var(--rust)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}><AlertCircle style={{ width:'9px', height:'9px' }}/>{error}</p>}
  </div>
);

const ist = (err?:boolean): React.CSSProperties => ({
  width:'100%', padding:'11px 13px', fontFamily:"'IBM Plex Mono',monospace", fontSize:'11px',
  background:'var(--bone)', border:`1px solid ${err?'var(--rust)':'var(--border-2)'}`, color:'var(--ink)',
  outline:'none', transition:'border-color 0.2s, box-shadow 0.2s',
  boxShadow:err?'0 0 0 3px rgba(181,67,42,0.1)':'none',
});

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,setWilayas]   = useState<Wilaya[]>([]);
  const [communes,setCommunes] = useState<Commune[]>([]);
  const [loadingC,setLC]       = useState(false);
  const [fd,setFd] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [errors,setErrors] = useState<Record<string,string>>({});
  const [submitting,setSub] = useState(false);

  useEffect(()=>{ if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(()=>{ if(typeof window!=='undefined'){ const id=localStorage.getItem('customerId'); if(id) setFd(p=>({...p,customerId:id})); } },[]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW  = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const getFP = useCallback(():number=>{
    const base=typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const off=product.offers?.find((o:any)=>o.id===selectedOffer); if(off) return off.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){ const m=product.variantDetails.find((v:any)=>variantMatches(v,selectedVariants)); if(m&&m.price!==-1) return m.price; }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getLiv = useCallback(():number=>{ if(!selW) return 0; return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice; },[selW,fd.typeLivraison]);
  useEffect(()=>{ if(selW) setFd(f=>({...f,priceLoss:selW.livraisonReturn})); },[selW]);

  const fp=getFP(); const total=()=>fp*fd.quantity+getLiv();
  const validate=()=>{
    const e:Record<string,string>={};
    if(!fd.customerName.trim())  e.customerName='الاسم مطلوب';
    if(!fd.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!fd.customerWelaya)       e.customerWelaya='الولاية مطلوبة';
    if(!fd.customerCommune)      e.customerCommune='البلدية مطلوبة';
    return e;
  };
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault(); const er=validate(); if(Object.keys(er).length){setErrors(er);return;} setErrors({}); setSub(true);
    try{ await axios.post(`${API_URL}/orders/create`,{...fd,productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()}); if(typeof window!=='undefined'&&fd.customerId) localStorage.setItem('customerId',fd.customerId); router.push(`/lp/${domain}/successfully`); }catch(err){console.error(err);}finally{setSub(false);}
  };
  const onF=(e:React.FocusEvent<any>)=>{e.target.style.borderColor='var(--forest)'; e.target.style.boxShadow='0 0 0 3px rgba(29,48,32,0.1)';};
  const onB=(e:React.FocusEvent<any>,err?:boolean)=>{e.target.style.borderColor=err?'var(--rust)':'var(--border-2)'; e.target.style.boxShadow=err?'0 0 0 3px rgba(181,67,42,0.1)':'none';};

  return (
    <div style={{ marginTop:'24px', paddingTop:'22px', borderTop:'2px solid var(--forest)' }}>
      <p className="sec-label" style={{ marginBottom:'16px', fontSize:'7px' }}>DEPLOYMENT FORM</p>
      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <FR error={errors.customerName} label="NAME">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'11px', height:'11px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="الاسم الكامل" style={{ ...ist(!!errors.customerName), paddingRight:'30px' }} onFocus={onF} onBlur={e=>onB(e,!!errors.customerName)}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="PHONE">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'11px', height:'11px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" style={{ ...ist(!!errors.customerPhone), paddingRight:'30px' }} onFocus={onF} onBlur={e=>onB(e,!!errors.customerPhone)}/>
            </div>
          </FR>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'8px' }}>
          <FR error={errors.customerWelaya} label="WILAYA">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', width:'11px', height:'11px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} style={{ ...ist(!!errors.customerWelaya), paddingLeft:'28px', appearance:'none' as any, cursor:'pointer' }} onFocus={onF} onBlur={e=>onB(e,!!errors.customerWelaya)}>
                <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FR>
          <FR error={errors.customerCommune} label="COMMUNE">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', width:'11px', height:'11px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})} style={{ ...ist(!!errors.customerCommune), paddingLeft:'28px', appearance:'none' as any, cursor:'pointer', opacity:!fd.customerWelaya?0.4:1 }} onFocus={onF} onBlur={e=>onB(e,!!errors.customerCommune)}>
                <option value="">{loadingC?'...':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FR>
        </div>

        {/* Delivery */}
        <FR label="DROP POINT">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', border:'1px solid var(--border-2)' }}>
            {(['home','office'] as const).map((type,i)=>(
              <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))}
                style={{ padding:'13px 10px', border:'none', borderRight:i===0?'1px solid var(--border)':'none', backgroundColor:fd.typeLivraison===type?'rgba(29,48,32,0.06)':'transparent', cursor:'pointer', textAlign:'left', borderTop:`3px solid ${fd.typeLivraison===type?'var(--rust)':'transparent'}`, transition:'all 0.18s' }}>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.16em', color:fd.typeLivraison===type?'var(--forest)':'var(--mid)', marginBottom:'4px', textTransform:'uppercase' }}>
                  {type==='home'?'HOME DROP':'OFFICE PICK'}
                </p>
                {selW && <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1.1rem', color:fd.typeLivraison===type?'var(--rust)':'var(--dim)', letterSpacing:'-0.01em', lineHeight:1, margin:0 }}>{(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:400, fontSize:'9px' }}>دج</span></p>}
              </button>
            ))}
          </div>
        </FR>

        {/* Quantity */}
        <FR label="UNITS">
          <div style={{ display:'inline-flex', alignItems:'center', border:'1px solid var(--border-2)' }}>
            {[{ icon:<Minus style={{ width:'11px', height:'11px' }}/>, act:()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)})) },
              { icon:<Plus  style={{ width:'11px', height:'11px' }}/>, act:()=>setFd(p=>({...p,quantity:p.quantity+1})) }
            ].reduce((acc,btn,i) =>
              i===0
                ? [...acc, <button key="m" type="button" onClick={btn.act} style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--border)', background:'transparent', cursor:'pointer', color:'var(--ink)', transition:'all 0.18s' }} onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background='var(--rust)'; el.style.color='var(--bone)';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.color='var(--ink)';}}>
                    {btn.icon}
                  </button>,
                  <span key="q" style={{ width:'44px', textAlign:'center', fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1.3rem', color:'var(--forest)', lineHeight:'36px', display:'inline-block' }}>{fd.quantity}</span>]
                : [...acc, <button key="p" type="button" onClick={btn.act} style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--border)', background:'transparent', cursor:'pointer', color:'var(--ink)', transition:'all 0.18s' }} onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background='var(--rust)'; el.style.color='var(--bone)';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.color='var(--ink)';}}>
                    {btn.icon}
                  </button>]
            , [] as React.ReactNode[])}
          </div>
        </FR>

        {/* Summary */}
        <div style={{ border:'1px solid var(--border-2)', marginBottom:'12px' }}>
          <div style={{ padding:'8px 13px', background:'var(--forest)', display:'flex', alignItems:'center', gap:'8px' }}>
            <Navigation style={{ width:'11px', height:'11px', color:'var(--rust)' }}/>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.24em', color:'rgba(247,243,235,0.55)', textTransform:'uppercase' }}>DEPLOYMENT MANIFEST</span>
          </div>
          {[{l:'ITEM',v:product.name.slice(0,20)},{l:'UNIT',v:`${fp.toLocaleString()} دج`},{l:'× QTY',v:fd.quantity},{l:'DELIVERY',v:selW?`${getLiv().toLocaleString()} دج`:'TBD'}].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 13px', borderTop:'1px solid var(--border)' }}>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.18em', color:'var(--mid)', textTransform:'uppercase' }}>{row.l}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'9px', fontWeight:600, color:'var(--ink)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'10px 13px', borderTop:'2px solid var(--forest)', background:'var(--parch)' }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'var(--mid)', textTransform:'uppercase' }}>TOTAL</span>
            <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'1.8rem', color:'var(--rust)', letterSpacing:'-0.02em', lineHeight:1 }}>
              {total().toLocaleString()}<span style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:300, fontSize:'10px', marginLeft:'4px' }}>دج</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-exp" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'9px', cursor:submitting?'not-allowed':'pointer', background:submitting?'var(--slate)':'var(--forest)', borderColor:submitting?'var(--slate)':'var(--forest)' }}>
          {submitting ? 'PROCESSING...' : <><Navigation style={{ width:'13px', height:'13px' }}/> {`CONFIRM DEPLOYMENT`}</>}
        </button>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.16em', color:'var(--dim)', textAlign:'center', marginTop:'8px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
          <Shield style={{ width:'9px', height:'9px' }}/> SECURE · ENCRYPTED TRANSMISSION
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
  <div style={{ backgroundColor:'var(--parch)', fontFamily:"'IBM Plex Mono',monospace", minHeight:'100vh' }}>
    <div style={{ backgroundColor:'var(--forest)', padding:'80px 6vw 40px', position:'relative', overflow:'hidden' }} className="contour-bg">
      <div style={{ position:'absolute', right:'-3%', bottom:'-20%', pointerEvents:'none', userSelect:'none', opacity:0.06 }}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(10rem,28vw,26rem)', color:'var(--bone)', letterSpacing:'-0.02em', lineHeight:1, whiteSpace:'nowrap' }}>{title}</span>
      </div>
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.22em', color:'rgba(247,243,235,0.28)', marginBottom:'12px' }}>REF: {code}</p>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(2.5rem,7vw,7rem)', color:'var(--bone)', letterSpacing:'-0.02em', lineHeight:0.9 }}>{title}</h1>
      <div style={{ width:'56px', height:'3px', background:'var(--rust)', marginTop:'14px' }}/>
    </div>
    <div style={{ maxWidth:'700px', margin:'0 auto', padding:'44px 24px 80px' }} className="paper-tex">{children}</div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{ borderBottom:'1px solid var(--border)', padding:'18px 0', display:'flex', gap:'16px' }}>
    <div style={{ flex:1 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'7px' }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'1.05rem', color:'var(--forest)', letterSpacing:'0.01em' }}>{title}</h3>
        {tag && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.2em', padding:'3px 8px', border:'1px solid var(--border-2)', color:'var(--mid)' }}>{tag}</span>}
      </div>
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', lineHeight:'1.9', letterSpacing:'0.05em', color:'var(--slate)' }}>{body}</p>
    </div>
  </div>
);

export function Privacy() {
  return (
    <PageShell title="Field Log: Privacy" code="DOC-PRV-001">
      <IB title="Data Collected"  body="Only name, phone, and delivery coordinates. Nothing more — we keep the pack light."/>
      <IB title="How We Use It"   body="Exclusively to process and dispatch your order to the field."/>
      <IB title="Security"        body="Industry-standard encryption. Your data locked in basecamp."/>
      <IB title="Data Sharing"    body="Never sold. Shared only with our trusted delivery scouts — and only what is needed."/>
      <div style={{ marginTop:'20px', padding:'12px 14px', borderLeft:'3px solid var(--rust)', background:'rgba(181,67,42,0.04)', fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.16em', color:'var(--mid)' }}>
        LAST REVIEWED: FEB 2026 · REVIEWED EACH SEASON
      </div>
    </PageShell>
  );
}

export function Terms() {
  return (
    <PageShell title="Field Log: Terms" code="DOC-TRM-002">
      <IB title="Your Account"   body="You hold the account, you carry the responsibility. Secure your credentials like your gear."/>
      <IB title="Payments"       body="No hidden charges — the price on the manifest is the price you pay."/>
      <IB title="Prohibited Use" body="Counterfeit goods are prohibited. We run an honest expedition only." tag="STRICT"/>
      <IB title="Governing Law"  body="Governed by Algerian law. Disputes resolved through official channels."/>
      <div style={{ marginTop:'20px', padding:'12px 14px', border:'1px solid var(--border)', fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.14em', lineHeight:'1.9', color:'var(--mid)' }}>
        TERMS MAY UPDATE EACH SEASON. CONTINUED USE = ACCEPTANCE OF CURRENT VERSION.
      </div>
    </PageShell>
  );
}

export function Cookies() {
  return (
    <PageShell title="Field Log: Cookies" code="DOC-CKI-003">
      <IB title="Essential Trackers"  body="Core navigation tools — sessions, cart, checkout. Cannot be disabled." tag="ALWAYS ON"/>
      <IB title="Preference Data"     body="Stores your language and region settings between expeditions." tag="OPTIONAL"/>
      <IB title="Terrain Analytics"   body="Anonymous usage patterns to improve the route. No personal coordinates stored." tag="OPTIONAL"/>
      <div style={{ marginTop:'20px', padding:'14px', border:'1px solid var(--border)', display:'flex', gap:'10px' }}>
        <ToggleRight style={{ width:'16px', height:'16px', color:'var(--rust)', flexShrink:0, marginTop:'2px' }}/>
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.16em', color:'var(--forest)', marginBottom:'5px' }}>MANAGE TRACKERS</p>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', lineHeight:'1.8', color:'var(--slate)', letterSpacing:'0.04em' }}>Adjust via browser settings. Disabling essential cookies disrupts navigation.</p>
        </div>
      </div>
    </PageShell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [sent, setSent] = useState(false);
  return (
    <div style={{ backgroundColor:'var(--parch)', fontFamily:"'IBM Plex Mono',monospace", minHeight:'100vh' }}>
      {/* Forest header */}
      <div style={{ backgroundColor:'var(--forest)', padding:'80px 6vw 40px', position:'relative', overflow:'hidden' }} className="contour-bg">
        <div style={{ position:'absolute', right:'-3%', bottom:'-15%', pointerEvents:'none', opacity:0.06 }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(10rem,28vw,26rem)', color:'var(--bone)', letterSpacing:'-0.02em', lineHeight:1 }}>Dispatch</span>
        </div>
        <div style={{ position:'absolute', top:'24px', right:'40px', color:'rgba(247,243,235,0.25)' }} className="spin-slow"><CompassRose size={60}/></div>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.24em', color:'var(--rust)', marginBottom:'10px' }}>DISPATCH CENTRE</p>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:'italic', fontSize:'clamp(3rem,9vw,9rem)', color:'var(--bone)', letterSpacing:'-0.03em', lineHeight:0.88, position:'relative', zIndex:2 }}>
          Send Word.
        </h1>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'9px', letterSpacing:'0.2em', color:'rgba(247,243,235,0.45)', marginTop:'14px', position:'relative', zIndex:2 }}>WE RESPOND WITHIN 24H · ALL WEATHER</p>
      </div>

      <div style={{ maxWidth:'860px', margin:'0 auto', padding:'44px 24px 80px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'36px' }}>
        {/* Channels */}
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.22em', color:'var(--mid)', marginBottom:'14px' }}>// CONTACT ROUTES</p>
          {[{emoji:'📡',label:'RADIO',val:'hello@expedition.dz',href:'mailto:hello@expedition.dz'},{emoji:'📞',label:'VOICE',val:'+213 550 123 456',href:'tel:+213550123456'},{emoji:'📍',label:'BASECAMP',val:'Algiers, DZ · 36°42\'N',href:undefined}].map(item=>(
            <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderBottom:'1px solid var(--border)', textDecoration:'none', transition:'paddingLeft 0.2s', paddingLeft:'0' }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.paddingLeft='8px';}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.paddingLeft='0';}}>
              <span style={{ fontSize:'1.3rem' }}>{item.emoji}</span>
              <div>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.22em', color:'var(--mid)', margin:0, textTransform:'uppercase' }}>{item.label}</p>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'10px', fontWeight:600, color:'var(--forest)', margin:0, marginTop:'2px', letterSpacing:'0.06em' }}>{item.val}</p>
              </div>
              <ArrowRight style={{ width:'12px', height:'12px', color:'var(--rust)', marginLeft:'auto' }}/>
            </a>
          ))}
          {/* Field note card */}
          <div style={{ marginTop:'20px', padding:'18px', backgroundColor:'var(--forest)', position:'relative', overflow:'hidden' }} className="contour-bg">
            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontStyle:'italic', fontSize:'1.3rem', color:'var(--bone)', lineHeight:1.2, margin:0, position:'relative', zIndex:2 }}>
              Into the wild,<br/>with the right gear.
            </p>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.18em', color:'rgba(247,243,235,0.35)', marginTop:'10px', position:'relative', zIndex:2 }}>ALGERIAN HIGHLANDS · SS{new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Form */}
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.22em', color:'var(--mid)', marginBottom:'14px' }}>// SEND DISPATCH</p>
          {sent ? (
            <div style={{ minHeight:'260px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)', textAlign:'center', backgroundColor:'var(--bone)' }} className="paper-tex">
              <CheckCircle2 style={{ width:'32px', height:'32px', color:'var(--forest)', marginBottom:'10px' }}/>
              <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'1.3rem', color:'var(--forest)', marginBottom:'4px' }}>Message Sent.</p>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'8px', letterSpacing:'0.2em', color:'var(--mid)' }}>RESPONSE INCOMING · 24H</p>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[{label:'YOUR NAME',type:'text',key:'name',ph:'Full name'},{label:'EMAIL',type:'email',key:'email',ph:'your@email.com'}].map(f=>(
                <div key={f.key}>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.24em', color:'var(--mid)', marginBottom:'5px', textTransform:'uppercase' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required
                    style={{ width:'100%', padding:'11px 13px', fontFamily:"'IBM Plex Mono',monospace", fontSize:'11px', background:'var(--bone)', border:'1px solid var(--border-2)', color:'var(--ink)', outline:'none' }}
                    onFocus={e=>{e.target.style.borderColor='var(--forest)'; e.target.style.boxShadow='0 0 0 3px rgba(29,48,32,0.1)';}}
                    onBlur={e=>{e.target.style.borderColor='var(--border-2)'; e.target.style.boxShadow='none';}}/>
                </div>
              ))}
              <div>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'7px', letterSpacing:'0.24em', color:'var(--mid)', marginBottom:'5px', textTransform:'uppercase' }}>YOUR MESSAGE</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="What do you need in the field?" rows={5} required
                  style={{ width:'100%', padding:'11px 13px', fontFamily:"'IBM Plex Mono',monospace", fontSize:'11px', background:'var(--bone)', border:'1px solid var(--border-2)', color:'var(--ink)', outline:'none', resize:'none' as any }}
                  onFocus={e=>{e.target.style.borderColor='var(--forest)'; e.target.style.boxShadow='0 0 0 3px rgba(29,48,32,0.1)';}}
                  onBlur={e=>{e.target.style.borderColor='var(--border-2)'; e.target.style.boxShadow='none';}}/>
              </div>
              <button type="submit" className="btn-exp" style={{ justifyContent:'center', width:'100%', padding:'14px' }}>
                <Navigation style={{ width:'13px', height:'13px' }}/> SEND DISPATCH
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}