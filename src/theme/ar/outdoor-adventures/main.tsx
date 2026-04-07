'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Share2, Phone, User, ToggleRight,
  Shield, ArrowRight, Plus, Minus, CheckCircle2, Lock,
  Menu, Search, ShoppingCart, Tent, Package,
  Backpack, Mountain, Trees, Wind, Truck, RefreshCw,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --forest:    #1E3A1E;
    --forest-2:  #2B4A2B;
    --tan:       #B8996A;
    --tan-lt:    #D4B882;
    --tan-bg:    #E8D5B0;
    --cream:     #F5EDD8;
    --rust:      #C4520A;
    --rust-lt:   #D4651A;
    --rust-dk:   #A3430A;
    --khaki:     #8B7355;
    --ink:       #1A1208;
    --mid:       #5A4A32;
    --dim:       #8A7A5A;
    --line:      rgba(184,153,106,0.3);
    --line-dk:   rgba(90,74,50,0.25);
    --white:     #FFFFFF;
  }

  body { background: var(--cream); color: var(--ink); font-family: 'Open Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--tan); border-radius: 2px; }

  /* Rough canvas texture bg */
  .canvas-bg {
    background-color: var(--tan-bg);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
  }

  /* Torn paper edge effect */
  .torn-top {
    position: relative;
  }
  .torn-top::before {
    content: '';
    position: absolute; top: -20px; left: 0; right: 0; height: 22px;
    background: var(--tan-bg);
    clip-path: polygon(0% 100%, 2% 30%, 5% 80%, 8% 20%, 11% 70%, 14% 15%, 17% 65%, 20% 25%, 23% 75%, 26% 10%, 29% 60%, 32% 30%, 35% 80%, 38% 20%, 41% 70%, 44% 15%, 47% 65%, 50% 25%, 53% 75%, 56% 10%, 59% 60%, 62% 30%, 65% 85%, 68% 20%, 71% 70%, 74% 15%, 77% 65%, 80% 25%, 83% 75%, 86% 10%, 89% 60%, 92% 30%, 95% 80%, 98% 20%, 100% 55%, 100% 100%);
  }

  /* Bebas Neue headings */
  .bb { font-family: 'Bebas Neue', Impact, sans-serif; }

  /* Tag label */
  .tag {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 11px; letter-spacing: 0.22em; color: var(--rust);
    text-transform: uppercase; display: flex; align-items: center; gap: 6px;
  }

  /* Animations */
  @keyframes fade-up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  .fu   { animation: fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay: 0.08s; }
  .fu-2 { animation-delay: 0.2s; }
  .fu-3 { animation-delay: 0.34s; }

  @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }

  /* Product card */
  .p-card { background: var(--white); border: 1px solid var(--line-dk); transition: transform 0.3s, box-shadow 0.3s; cursor: pointer; }
  .p-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,18,8,0.12); }
  .p-card:hover .c-img img { transform: scale(1.04); }
  .c-img img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); }

  /* Buttons */
  .btn-rust {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--rust); color: var(--white);
    font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 0.1em;
    padding: 12px 24px; border: none; cursor: pointer; text-decoration: none;
    transition: background 0.22s, transform 0.22s;
  }
  .btn-rust:hover { background: var(--rust-lt); transform: translateY(-1px); }

  .btn-forest {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--forest); color: var(--cream);
    font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 0.1em;
    padding: 12px 28px; border: none; cursor: pointer; text-decoration: none;
    transition: background 0.22s, transform 0.22s;
  }
  .btn-forest:hover { background: var(--forest-2); transform: translateY(-1px); }

  .btn-outline-r {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: var(--rust);
    border: 2px solid var(--rust); font-family: 'Bebas Neue', sans-serif;
    font-size: 14px; letter-spacing: 0.1em; padding: 8px 18px;
    cursor: pointer; text-decoration: none; transition: all 0.22s;
  }
  .btn-outline-r:hover { background: var(--rust); color: var(--white); }

  /* Inputs */
  .inp {
    width: 100%; padding: 11px 13px;
    background: var(--white); border: 1.5px solid var(--line-dk);
    font-family: 'Open Sans', sans-serif; font-size: 13px; color: var(--ink);
    outline: none; transition: border-color 0.2s;
  }
  .inp:focus { border-color: var(--forest); }
  .inp::placeholder { color: var(--dim); }
  .inp-err { border-color: var(--rust) !important; }
  select.inp { appearance: none; cursor: pointer; }

  /* Section title style */
  .sec-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    letter-spacing: 0.12em; color: var(--ink);
    text-align: center; margin: 0;
  }

  /* Category icon card */
  .cat-icon-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; padding: 24px 16px;
    background: var(--tan-bg); border: 2px solid var(--tan);
    transition: all 0.25s; cursor: pointer; text-decoration: none;
  }
  .cat-icon-card:hover { background: var(--forest); border-color: var(--forest); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(26,18,8,0.18); }
  .cat-icon-card:hover .cat-icon { color: var(--cream); }
  .cat-icon-card:hover .cat-name { color: var(--cream); }
  .cat-icon-card:hover .cat-sub  { color: rgba(232,213,176,0.7); }
  .cat-icon { color: var(--forest); transition: color 0.25s; }
  .cat-name { font-family:'Bebas Neue',sans-serif; font-size:1.1rem; letter-spacing:0.14em; text-transform:uppercase; color: var(--ink); transition:color 0.25s; }
  .cat-sub  { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--rust); text-decoration: underline; transition: color 0.25s; }

  /* Responsive */
  .nav-links   { display: flex; align-items: center; gap: 24px; }
  .nav-toggle  { display: none; }
  .cat-grid    { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .prod-grid   { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  .trust-bar   { display: grid; grid-template-columns: repeat(4,1fr); }
  .footer-g    { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
  .details-g   { display: grid; grid-template-columns: 1fr 1fr; }
  .details-L   { position: sticky; top: 70px; height: calc(100vh - 70px); overflow: hidden; }
  .details-R   { padding: 40px 36px 80px; }
  .contact-g   { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; }
  .form-2c     { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .dlv-2c      { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  @media (max-width:1100px) {
    .prod-grid  { grid-template-columns: repeat(3,1fr); }
    .footer-g   { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width:768px) {
    .nav-links  { display: none; }
    .nav-toggle { display: flex; }
    .cat-grid   { grid-template-columns: repeat(2,1fr); }
    .prod-grid  { grid-template-columns: repeat(2,1fr); gap: 12px; }
    .trust-bar  { grid-template-columns: repeat(2,1fr); }
    .footer-g   { grid-template-columns: 1fr 1fr; gap: 28px; }
    .details-g  { grid-template-columns: 1fr; }
    .details-L  { position: static; width: 100%; height:auto; margin-buttom: 200px ; display: flex ;flex-direction: column; gap:20px;}
    .details-R  { padding: 24px 16px 48px; }
    .contact-g  { grid-template-columns: 1fr; gap: 28px; }
  }
  @media (max-width:480px) {
    .prod-grid  { grid-template-columns: repeat(1,1fr); gap: 8px; }
    .footer-g   { grid-template-columns: 1fr; gap: 24px; }
    .form-2c    { grid-template-columns: 1fr; }
    .dlv-2c     { grid-template-columns: 1fr; }
  }

  .text-clamp {
    display: -webkit-box;
    -webkit-line-clamp: 1;    /* عدد الأسطر التي تريدها */
    -webkit-box-orient: vertical;  
    overflow: hidden;
  }
`;

/* ── TYPES ──────────────────────────────────────────────────── */
interface Offer { id:string; name:string; quantity:number; price:number; }
interface Variant { id:string; name:string; value:string; }
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

/* ── MAIN ───────────────────────────────────────────────────── */
export default function Main({ store, children }: any) {
  if (!store) return null;
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--cream)' }}>
      <style>{CSS}</style>
      <Navbar store={store}/>
      <main>{children}</main>
      <Footer store={store}/>
    </div>
  );
}

/* ── NAVBAR ─────────────────────────────────────────────────── */
export function Navbar({ store }: { store: Store }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>4);
    window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h);
  },[]);

  if (!store) return null;

  const links = [
    { href:`/`,         label:'الرئيسية'  },
    { href:`/contact`, label:'تواصل'     },
    { href:`/Privacy`, label:'الخصوصية'  },
  ];

  return (
    <nav dir="rtl" style={{
      position:'sticky', top:0, zIndex:100,
      backgroundColor:'var(--forest)',
      borderBottom:`2px solid var(--tan)`,
      boxShadow: scrolled ? '0 4px 20px rgba(26,18,8,0.3)' : 'none',
      transition:'box-shadow 0.3s',
    }}>
      {/* Ticker */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ backgroundColor:'var(--rust)', overflow:'hidden', whiteSpace:'nowrap', padding:'6px 0' }}>
          <div style={{ display:'inline-block', animation:'ticker 22s linear infinite' }}>
            {Array(12).fill(null).map((_,i)=>(
              <span key={i} style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'13px', letterSpacing:'0.2em', color:'var(--white)', margin:'0 36px' }}>
                ✦ {store.topBar.text!.toUpperCase()}
              </span>
            ))}
            {Array(12).fill(null).map((_,i)=>(
              <span key={`b${i}`} style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'13px', letterSpacing:'0.2em', color:'var(--white)', margin:'0 36px' }}>
                ✦ {store.topBar.text!.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px', height:'66px', display:'flex', alignItems:'center', gap:'24px' , justifyContent: "space-between" }}>

        {/* Logo + Name */}
        <Link href={`/`} style={{ textDecoration:'none', flexShrink:0, display:'flex', alignItems:'center', gap:'12px' }}>
          {store.design?.logoUrl
            ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'40px', width:'auto', objectFit:'contain' }}/>
            : (
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <Trees style={{ width:'28px', height:'28px', color:'var(--tan-lt)' }}/>
                <span className="bb" style={{ fontSize:'1.4rem', letterSpacing:'0.08em', color:'var(--cream)', lineHeight:1, textTransform:'uppercase' }}>
                  {store.name}
                </span>
              </div>
            )
          }
        </Link>

        <div>
          {/* Desktop nav links */}
        <div className="nav-links" style={{ flex:1, justifyContent:'center' }}>
          {links.map(l=>(
            <Link key={`${l.href}${l.label}`} href={l.href}
              style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'15px', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(232,213,176,0.7)', textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--cream)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(232,213,176,0.7)';}}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <div style={{ flexShrink:0 }}>
          <button className="nav-toggle" onClick={()=>setOpen(p=>!p)} style={{ background:'none', border:'1px solid rgba(232,213,176,0.3)', cursor:'pointer', color:'var(--tan-lt)', padding:'7px', alignItems:'center', justifyContent:'space-between' }}>
            {open ? <X style={{ width:'18px', height:'18px' }}/> : <Menu style={{ width:'18px', height:'18px' }}/>}
          </button>
        </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div style={{ maxHeight:open?'280px':'0', overflow:'hidden', transition:'max-height 0.3s ease', backgroundColor:'var(--forest-2)' , }}>
        <div style={{ padding:'8px 24px 16px' }}>
          {links.map(l=>(
            <Link key={`m${l.href}${l.label}`} href={l.href} onClick={()=>setOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', fontFamily:"'Bebas Neue',sans-serif", fontSize:'16px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(232,213,176,0.7)', textDecoration:'none', borderBottom:'1px solid rgba(184,153,106,0.15)' }}>
              {l.label} <ArrowRight style={{ width:'14px', height:'14px', color:'var(--rust)' }}/>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ── FOOTER ─────────────────────────────────────────────────── */
export function Footer({ store }: any) {
  const yr = new Date().getFullYear();
  if (!store) return null;
  return (
    <footer dir="rtl" style={{ backgroundColor:'var(--forest)', fontFamily:"'Open Sans',sans-serif", position:'relative', overflow:'hidden' }} className="canvas-bg">
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'56px 24px 36px', position:'relative', zIndex:2 }}>
        {/* 3 sections */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'48px', paddingBottom:'40px', borderBottom:'1px solid rgba(184,153,106,0.2)' }}>

          {/* ① Logo + Name + Slug */}
          <div>
            <Link href={`/`} style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'34px', width:'auto', objectFit:'contain' }}/>
                : <Trees style={{ width:'22px', height:'22px', color:'var(--tan-lt)' }}/>
              }
              <span className="bb" style={{ fontSize:'1.25rem', letterSpacing:'0.1em', color:'var(--cream)', textTransform:'uppercase' }}>
                {store.name}
              </span>
            </Link>
            <p style={{ fontSize:'11px', color:'rgba(184,153,106,0.5)', letterSpacing:'0.1em', marginBottom:'14px' }}>
              {store.name}
            </p>
            <p style={{ fontSize:'13px', lineHeight:'1.8', color:'rgba(232,213,176,0.4)', maxWidth:'240px', fontWeight:400 }}>
              معدات التخييم والرحلات الخارجية. مُختبَرة في الميدان.
            </p>
          </div>

          {/* ② روابط ثابتة */}
          <div>
            <p className="bb" style={{ fontSize:'14px', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--tan-lt)', marginBottom:'16px' }}>روابط</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                { href:`/Privacy`, label:'سياسة الخصوصية' },
                { href:`/Terms`,   label:'شروط الخدمة'    },
                { href:`/Cookies`, label:'ملفات الارتباط'  },
                { href:`/contact`, label:'اتصل بنا'        },
              ].map(l=>(
                <a key={l.href} href={l.href} style={{ fontSize:'13px', color:'rgba(232,213,176,0.45)', textDecoration:'none', transition:'color 0.2s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--tan-lt)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(232,213,176,0.45)';}}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* ③ على حسب الثيم — تواصل */}
          <div>
            <p className="bb" style={{ fontSize:'14px', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--tan-lt)', marginBottom:'16px' }}>تواصل</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                { icon:'📞', val:'+213 550 000 000' },
                { icon:'✉️',  val:'info@store.dz'    },
                { icon:'📍', val:'الجزائر'           },
              ].map(item=>(
                <div key={item.val} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'14px' }}>{item.icon}</span>
                  <span style={{ fontSize:'13px', color:'rgba(232,213,176,0.45)' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ paddingTop:'18px', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
          <p style={{ fontSize:'12px', color:'rgba(232,213,176,0.25)' }}>© {yr} {store.name}. جميع الحقوق محفوظة.</p>
          <p style={{ fontSize:'12px', color:'rgba(232,213,176,0.25)' }}>Outdoor Adventures Theme</p>
        </div>
      </div>
    </footer>
  );
}

/* ── CARD ───────────────────────────────────────────────────── */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  if (!product || !store) return null;
  const price = typeof product.price==='string' ? parseFloat(product.price) : product.price as number;
  const orig  = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="p-card">
      <div className="c-img" style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'var(--tan-bg)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }} className="canvas-bg">
              <Mountain style={{ width:'40px', height:'40px', color:'var(--tan)', opacity:0.5 }}/>
            </div>
        }
        {discount>0 && (
          <div style={{ position:'absolute', top:'10px', right:'10px', backgroundColor:'var(--rust)', color:'var(--white)', fontSize:'11px', fontWeight:700, padding:'3px 8px' }}>
            -{discount}%
          </div>
        )}
      </div>

      <div style={{ padding:'14px' }}>
        <h3 className="bb" style={{ fontSize:'1.05rem', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--ink)', marginBottom:'6px', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display:'flex', gap:'2px', marginBottom:'8px' }}>
          {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'11px', height:'11px', fill:i<4?'var(--rust)':'none', color:'var(--rust)' }}/>)}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--ink)' }}>
            {price.toLocaleString()}
            <span style={{ fontSize:'11px', fontWeight:400, color:'var(--dim)', marginRight:'2px' }}>دج</span>
          </span>
          {orig>price && <span style={{ fontSize:'12px', color:'var(--dim)', textDecoration:'line-through' }}>{orig.toLocaleString()}</span>}
        </div>
        <Link href={`/product/${product.slug||product.id}`}
          className="btn-rust" style={{ textDecoration:'none', width:'100%', fontSize:'14px', letterSpacing:'0.1em', padding:'10px 16px' }}>
          {viewDetails}
        </Link>
      </div>
    </div>
  );
}

/* ── HOME ───────────────────────────────────────────────────── */
export function Home({ store }: any) {
  if (!store) return null;
  const products: any[] = store.products || [];
  const cats: any[]     = store.categories || [];

  return (
    <div dir="rtl">

      {/* ── HERO ── */}
      <section style={{ position:'relative', height:'88vh', minHeight:'520px', overflow:'hidden', backgroundColor:'var(--forest)' }}>
        {store.hero?.imageUrl
          ? <img src={store.hero.imageUrl} alt={store.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
          : <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,var(--forest) 0%,var(--khaki) 100%)' }} className="canvas-bg"/>
        }
        {/* Dark overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(30,58,30,0.82) 0%, rgba(30,58,30,0.45) 60%, transparent 100%)', pointerEvents:'none' }}/>

        {/* Content */}
        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 8vw', maxWidth:'680px' }}>
          <p className="fu tag" style={{ marginBottom:'14px', color:'var(--tan-lt)' }}>
            ✦ معدات المغامرة الأصيلة
          </p>
          <h1 className="fu fu-1 bb" style={{ fontSize:'clamp(3rem,8vw,7rem)', letterSpacing:'0.04em', textTransform:'uppercase', color:'var(--white)', lineHeight:0.88, marginBottom:'20px' }}>
            {store.hero?.title
              ? store.hero.title.toUpperCase()
              : <><span>جهّز</span><br/><span>مغامرتك</span><br/><span style={{ color:'var(--tan-lt)' }}>القادمة.</span></>
            }
          </h1>
          <p className="fu fu-2" style={{ fontSize:'15px', lineHeight:'1.8', color:'rgba(232,213,176,0.8)', marginBottom:'32px', maxWidth:'420px', fontWeight:400 }}>
            {store.hero?.subtitle || 'استكشف مجموعتنا الكاملة من المعدات المتينة للخيام والحقائب ومعدات كل رحلة برية.'}
          </p>
          <div className="fu fu-3" style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
            <a href="#products" className="btn-rust" style={{ fontSize:'18px', padding:'14px 32px', letterSpacing:'0.12em' }}>
              تسوق الوصل الجديد
            </a>
          </div>
        </div>

        {/* Torn bottom edge */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, lineHeight:0 }}>
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:'40px' }} fill="var(--cream)">
            <path d="M0,40 L0,20 Q60,8 120,22 Q180,36 240,14 Q300,-2 360,18 Q420,36 480,12 Q540,-4 600,20 Q660,40 720,16 Q780,-6 840,22 Q900,44 960,18 Q1020,-8 1080,20 Q1140,44 1200,22 Q1260,2 1320,24 Q1380,40 1440,20 L1440,40 Z"/>
          </svg>
        </div>
      </section>

      {/* ── FEATURED CATEGORIES ── */}
      <section style={{ padding:'60px 0 40px', backgroundColor:'var(--cream)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px' }}>
          <h2 className="sec-title" style={{ marginBottom:'8px' }}>الفئات المميزة</h2>
          <div style={{ width:'60px', height:'3px', background:'var(--rust)', margin:'0 auto 32px' }}/>
          <div className="cat-grid">
            {cats.length>0
              ? cats.slice(0,8).map((cat:any)=>(
                <Link key={cat.id} href={`/?category=${cat.id}`}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'18px 12px', backgroundColor:'var(--tan-bg)', border:'2px solid var(--tan)', textDecoration:'none', transition:'all 0.25s', textAlign:'center' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.backgroundColor='var(--forest)'; el.style.borderColor='var(--forest)'; el.style.transform='translateY(-3px)'; el.style.boxShadow='0 8px 24px rgba(26,18,8,0.18)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.backgroundColor='var(--tan-bg)'; el.style.borderColor='var(--tan)'; el.style.transform='none'; el.style.boxShadow='none';}}>
                  <span className="bb" style={{ fontSize:'1rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink)', transition:'color 0.25s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--cream)';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--ink)';}}>
                    {cat.name}
                  </span>
                </Link>
              ))
              : ['خيام التخييم','أكياس النوم','أحذية المشي','عصا المشي'].map((name,i)=>(
                <a key={i} href="#products"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'18px 12px', backgroundColor:'var(--tan-bg)', border:'2px solid var(--tan)', textDecoration:'none', transition:'all 0.25s', textAlign:'center' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.backgroundColor='var(--forest)'; el.style.borderColor='var(--forest)'; el.style.transform='translateY(-3px)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.backgroundColor='var(--tan-bg)'; el.style.borderColor='var(--tan)'; el.style.transform='none';}}>
                  <span className="bb" style={{ fontSize:'1rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink)' }}>{name}</span>
                </a>
              ))
            }
          </div>
        </div>
      </section>

      {/* ── POPULAR GEAR ── */}
      <section id="products" style={{ padding:'20px 0 64px', backgroundColor:'var(--cream)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px' }}>
          <h2 className="sec-title" style={{ marginBottom:'8px' }}>المعدات الشائعة</h2>
          <div style={{ width:'60px', height:'3px', background:'var(--rust)', margin:'0 auto 32px' }}/>

          {products.length===0 ? (
            <div style={{ padding:'80px 0', textAlign:'center', border:'2px dashed var(--line)' }}>
              <Mountain style={{ width:'48px', height:'48px', color:'var(--tan)', margin:'0 auto 14px' }}/>
              <p className="bb" style={{ fontSize:'1.4rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--dim)' }}>المعدات قادمة قريباً</p>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((p:any)=>{
                const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض التفاصيل"/>;
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section style={{ backgroundColor:'var(--tan-bg)', borderTop:'2px solid var(--tan)', borderBottom:'2px solid var(--tan)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div className="trust-bar">
            {[
              { icon:<Truck style={{ width:'22px', height:'22px' }}/>,      title:'توصيل سريع',     desc:'لجميع ولايات الجزائر' },
              { icon:<Shield style={{ width:'22px', height:'22px' }}/>,     title:'منتجات أصيلة',   desc:'100% جودة مضمونة'    },
              { icon:<RefreshCw style={{ width:'22px', height:'22px' }}/>,  title:'إرجاع مجاني',    desc:'30 يوم إرجاع'         },
              { icon:<Phone style={{ width:'22px', height:'22px' }}/>,      title:'دعم العملاء',    desc:'نحن هنا دائماً'       },
            ].map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'20px 22px', borderLeft:i>0?'1px solid var(--line)':'none' }}>
                <div style={{ color:'var(--rust)', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p className="bb" style={{ fontSize:'15px', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--forest)', margin:0 }}>{item.title}</p>
                  <p style={{ fontSize:'11px', color:'var(--dim)', margin:0, fontWeight:400 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position:'relative', padding:'80px 24px', textAlign:'center', overflow:'hidden' }} className="canvas-bg">
        <div style={{ position:'absolute', inset:0, background:'rgba(30,58,30,0.88)', pointerEvents:'none' }}/>
        {store.hero?.imageUrl && <img src={store.hero.imageUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.12, display:'block' }}/>}
        <div style={{ position:'relative', zIndex:2, maxWidth:'600px', margin:'0 auto' }}>
          <p className="tag" style={{ justifyContent:'center', marginBottom:'14px', color:'var(--tan-lt)' }}>✦ جهّز نفسك للبرية</p>
          <h2 className="bb" style={{ fontSize:'clamp(2.5rem,6vw,5rem)', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--white)', lineHeight:0.9, marginBottom:'18px' }}>
            المغامرة<br/><span style={{ color:'var(--tan-lt)' }}>تبدأ هنا</span>
          </h2>
          <p style={{ fontSize:'15px', color:'rgba(232,213,176,0.65)', lineHeight:'1.8', marginBottom:'32px' }}>
            كل ما تحتاجه لرحلة لا تُنسى في قلب الطبيعة الجزائرية.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="#products" className="btn-rust" style={{ fontSize:'17px', padding:'14px 36px' }}>تسوق الآن</a>
            <Link href={`/contact`} className="btn-forest" style={{ fontSize:'17px', padding:'14px 32px', textDecoration:'none', border:'2px solid var(--tan)' }}>تواصل معنا</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── DETAILS ────────────────────────────────────────────────── */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [sel, setSel] = useState(0);
  if (!product) return null;
  return (
    <div dir="rtl" style={{ backgroundColor:'var(--cream)' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor:'var(--forest)', borderBottom:'2px solid var(--tan)', padding:'10px 24px', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(232,213,176,0.5)' }}>
        <Link href="/" style={{ textDecoration:'none', color:'rgba(232,213,176,0.5)', transition:'color 0.2s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--tan-lt)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(232,213,176,0.5)';}}>
          الرئيسية
        </Link>
        <span style={{ color:'var(--rust)' }}>/</span>
        <span className='text-clamp' style={{ color:'var(--tan-lt)' }}>{product.name.slice(0,40)}</span>
        <div style={{ marginRight:'auto', display:'flex', gap:'8px' }}>
          <button onClick={toggleWishlist} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isWishlisted?'var(--rust)':'rgba(184,153,106,0.3)'}`, background:isWishlisted?'rgba(196,82,10,0.15)':'transparent', cursor:'pointer', color:isWishlisted?'var(--rust)':'rgba(232,213,176,0.5)' }}>
            <Heart style={{ width:'13px', height:'13px', fill:isWishlisted?'currentColor':'none' }}/>
          </button>
          <button onClick={handleShare} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(184,153,106,0.3)', background:'transparent', cursor:'pointer', color:'rgba(232,213,176,0.5)' }}>
            <Share2 style={{ width:'13px', height:'13px' }}/>
          </button>
        </div>
      </div>

      <div className="details-g" style={{ maxWidth:'1280px', margin:'0 auto'}}>
        {/* Gallery */}
        <div className="details-L" >
          <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'var(--tan-bg)', border:'2px solid var(--line)' }}>
            {allImages.length>0
              ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }} className="canvas-bg">
                  <Mountain style={{ width:'64px', height:'64px', color:'var(--tan)', opacity:0.4 }}/>
                </div>
            }
            {discount>0 && <div style={{ position:'absolute', top:'12px', right:'12px', backgroundColor:'var(--rust)', color:'var(--white)', fontSize:'12px', fontWeight:700, padding:'4px 12px' }}>-{discount}%</div>}
            {allImages.length>1 && (
              <>
                <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', border:'2px solid var(--tan)', backgroundColor:'rgba(232,213,176,0.9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronRight style={{ width:'15px', height:'15px', color:'var(--forest)' }}/>
                </button>
                <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', border:'2px solid var(--tan)', backgroundColor:'rgba(232,213,176,0.9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronLeft style={{ width:'15px', height:'15px', color:'var(--forest)' }}/>
                </button>
              </>
            )}
            {!inStock&&!autoGen && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(232,213,176,0.85)', backdropFilter:'blur(4px)' }}>
                <span className="bb" style={{ fontSize:'1.8rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--dim)' }}>نفد المخزون</span>
              </div>
            )}
          </div>
          {allImages.length>1 && (
            <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
              {allImages.slice(0,5).map((img:string,idx:number)=>(
                <button key={idx} onClick={()=>setSel(idx)} style={{ width:'56px', height:'56px', overflow:'hidden', border:`2px solid ${sel===idx?'var(--rust)':'var(--line-dk)'}`, cursor:'pointer', padding:0, background:'none', opacity:sel===idx?1:0.55 }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="details-R">
          <p className="tag" style={{ marginBottom:'10px' }}>✦ معدات ميدانية</p>
          <h1 className="bb" style={{ fontSize:'clamp(2rem,4vw,3rem)', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--ink)', lineHeight:0.95, marginBottom:'14px' }}>
            {product.name.toUpperCase()}
          </h1>

          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'22px', paddingBottom:'22px', borderBottom:'2px solid var(--line)', flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:'2px' }}>
              {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'13px', height:'13px', fill:i<4?'var(--rust)':'none', color:'var(--rust)' }}/>)}
            </div>
            <span style={{ fontSize:'12px', color:'var(--dim)' }}>4.8 (128 تقييم)</span>
            <span style={{ marginRight:'auto', padding:'5px 14px', backgroundColor:inStock||autoGen?'rgba(30,58,30,0.1)':'rgba(196,82,10,0.1)', color:inStock||autoGen?'var(--forest)':'var(--rust)', fontSize:'12px', fontWeight:700, border:`1px solid ${inStock||autoGen?'var(--forest)':'var(--rust)'}` }}>
              {autoGen?'∞ متوفر':inStock?'متوفر':'نفد'}
            </span>
          </div>

          {/* Price */}
          <div style={{ marginBottom:'22px', padding:'18px', backgroundColor:'var(--tan-bg)', border:'2px solid var(--tan)' }}>
            <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--dim)', margin:'0 0 6px' }}>السعر</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:'12px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'2.8rem', fontWeight:700, color:'var(--ink)', lineHeight:1, letterSpacing:'-0.01em' }}>{finalPrice.toLocaleString()}</span>
              <span style={{ fontSize:'15px', color:'var(--dim)' }}>دج</span>
              {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                <>
                  <span style={{ fontSize:'15px', textDecoration:'line-through', color:'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                  <span style={{ fontSize:'12px', color:'var(--rust)', fontWeight:700, padding:'2px 8px', backgroundColor:'rgba(196,82,10,0.1)', border:'1px solid var(--rust)' }}>
                    وفّر {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Offers */}
          {product.offers?.length>0 && (
            <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line)' }}>
              <p className="bb" style={{ fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'10px' }}>الباقات</p>
              {product.offers.map((offer:any)=>(
                <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', border:`2px solid ${selectedOffer===offer.id?'var(--rust)':'var(--line-dk)'}`, cursor:'pointer', marginBottom:'8px', transition:'all 0.2s', backgroundColor:selectedOffer===offer.id?'rgba(196,82,10,0.05)':'transparent' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'16px', height:'16px', border:`2px solid ${selectedOffer===offer.id?'var(--rust)':'var(--dim)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {selectedOffer===offer.id&&<div style={{ width:'8px', height:'8px', background:'var(--rust)' }}/>}
                    </div>
                    <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                    <div>
                      <p style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)', margin:0 }}>{offer.name}</p>
                      <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>الكمية: {offer.quantity}</p>
                    </div>
                  </div>
                  <span style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--rust)' }}>{offer.price.toLocaleString()} <span style={{ fontSize:'11px', fontWeight:400, color:'var(--dim)' }}>دج</span></span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--line)' }}>
              <p className="bb" style={{ fontSize:'13px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'10px' }}>{attr.name}</p>
              {attr.displayMode==='color' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'28px', height:'28px', backgroundColor:v.value, border:'none', cursor:'pointer', outline:s?'3px solid var(--forest)':'3px solid transparent', outlineOffset:'3px' }}/>;})}
                </div>
              ):attr.displayMode==='image' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`2px solid ${s?'var(--rust)':'var(--line-dk)'}`, cursor:'pointer', padding:0 }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                </div>
              ):(
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ padding:'8px 16px', border:`2px solid ${s?'var(--forest)':'var(--line-dk)'}`, backgroundColor:s?'var(--forest)':'transparent', color:s?'var(--cream)':'var(--mid)', fontFamily:"'Open Sans',sans-serif", fontSize:'13px', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--line)' }}>
              <p className="bb" style={{ fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'12px' }}>وصف المنتج</p>
              <div style={{ fontSize:'14px', lineHeight:'1.8', color:'var(--mid)', fontWeight:400 }}
                dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc,{ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','span'],ALLOWED_ATTR:['class','style']})}}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── PRODUCT FORM ────────────────────────────────────────────── */
const FR = ({ error, label, children }: { error?:string; label?:string; children:React.ReactNode }) => (
  <div style={{ marginBottom:'13px' }}>
    {label && <p className="bb" style={{ fontSize:'13px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize:'11px', color:'var(--rust)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
      <AlertCircle style={{ width:'11px', height:'11px' }}/>{error}
    </p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,setWilayas]   = useState<Wilaya[]>([]);
  const [communes,setCommunes] = useState<Commune[]>([]);
  const [loadingC,setLC]       = useState(false);
  const [fd,setFd] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [errors,setErrors] = useState<Record<string,string>>({});
  const [sub,setSub] = useState(false);

  useEffect(()=>{ if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(()=>{ if(typeof window!=='undefined'){ const id=localStorage.getItem('customerId'); if(id) setFd(p=>({...p,customerId:id})); } },[]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW  = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const getFP = useCallback(():number=>{
    const base=typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const off=product.offers?.find((o:any)=>o.id===selectedOffer); if(off) return off.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){
      const m=product.variantDetails.find((v:any)=>variantMatches(v,selectedVariants));
      if(m&&m.price!==-1) return m.price;
    }
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
  
  const getVariantDetailId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault(); const er=validate(); if(Object.keys(er).length){setErrors(er);return;} setErrors({}); setSub(true);
    try{
      await axios.post(`${API_URL}/orders/create`,{...fd,productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()});
      if(typeof window!=='undefined'&&fd.customerId) localStorage.setItem('customerId',fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    }catch(err){console.error(err);}finally{setSub(false);}
  };

  return (
    <div style={{ marginTop:'22px', paddingTop:'20px', borderTop:'2px solid var(--line)' }}>
      <form onSubmit={handleSubmit}>
        <div className="form-2c">
          <FR error={errors.customerName} label="الاسم">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="الاسم الكامل"
                className={`inp${errors.customerName?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor=errors.customerName?'var(--rust)':'var(--line-dk)';}}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="الهاتف">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX"
                className={`inp${errors.customerPhone?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor=errors.customerPhone?'var(--rust)':'var(--line-dk)';}}/>
            </div>
          </FR>
        </div>
        <div className="form-2c">
          <FR error={errors.customerWelaya} label="الولاية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                className={`inp${errors.customerWelaya?' inp-err':''}`} style={{ paddingRight:'34px' }}
                onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor=errors.customerWelaya?'var(--rust)':'var(--line-dk)';}}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FR>
          <FR error={errors.customerCommune} label="البلدية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})}
                className={`inp${errors.customerCommune?' inp-err':''}`} style={{ paddingRight:'34px', opacity:!fd.customerWelaya?0.4:1 }}
                onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor=errors.customerCommune?'var(--rust)':'var(--line-dk)';}}>
                <option value="">{loadingC?'...':'اختر البلدية'}</option>
                {communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FR>
        </div>

        <FR label="التوصيل">
          <div className="dlv-2c">
            {(['home','office'] as const).map(type=>(
              <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))}
                style={{ padding:'12px 10px', border:`2px solid ${fd.typeLivraison===type?'var(--rust)':'var(--line-dk)'}`, backgroundColor:fd.typeLivraison===type?'rgba(196,82,10,0.06)':'transparent', cursor:'pointer', textAlign:'right', transition:'all 0.2s' }}>
                <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'14px', letterSpacing:'0.1em', textTransform:'uppercase', color:fd.typeLivraison===type?'var(--rust)':'var(--mid)', margin:'0 0 4px' }}>
                  {type==='home'?'للبيت':'للمكتب'}
                </p>
                {selW && <p style={{ fontSize:'1rem', fontWeight:700, color:fd.typeLivraison===type?'var(--rust)':'var(--dim)', margin:0 }}>
                  {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()}
                  <span style={{ fontSize:'11px', fontWeight:400, color:'var(--dim)', marginRight:'3px' }}>دج</span>
                </p>}
              </button>
            ))}
          </div>
        </FR>

        <FR label="الكمية">
          <div style={{ display:'inline-flex', alignItems:'center', border:'2px solid var(--line-dk)', backgroundColor:'var(--white)' }}>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--forest)', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--tan-bg)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Minus style={{ width:'12px', height:'12px' }}/>
            </button>
            <span style={{ width:'44px', textAlign:'center', fontSize:'1.1rem', fontWeight:700, color:'var(--ink)' }}>{fd.quantity}</span>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--forest)', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--tan-bg)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Plus style={{ width:'12px', height:'12px' }}/>
            </button>
          </div>
        </FR>

        {/* Summary */}
        <div style={{ border:'2px solid var(--line-dk)', marginBottom:'14px', overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', backgroundColor:'var(--forest)', borderBottom:'1px solid rgba(184,153,106,0.3)' }}>
            <p className="bb" style={{ fontSize:'14px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(232,213,176,0.7)', margin:0 }}>ملخص الطلب</p>
          </div>
          {[
            { l:'المنتج', v:product.name.slice(0,22) },
            { l:'السعر',  v:`${fp.toLocaleString()} دج` },
            { l:'الكمية', v:`× ${fd.quantity}` },
            { l:'التوصيل',v:selW?`${getLiv().toLocaleString()} دج`:'—' },
          ].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 14px', borderBottom:'1px solid var(--line)', backgroundColor:'var(--white)' }}>
              <span style={{ fontSize:'13px', color:'var(--mid)' }}>{row.l}</span>
              <span style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px', backgroundColor:'var(--tan-bg)' }}>
            <span style={{ fontSize:'13px', color:'var(--mid)' }}>المجموع</span>
            <span style={{ fontSize:'1.7rem', fontWeight:700, color:'var(--rust)', letterSpacing:'-0.01em' }}>
              {total().toLocaleString()} <span style={{ fontSize:'13px', fontWeight:400, color:'var(--dim)' }}>دج</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={sub} className="btn-rust"
          style={{ width:'100%', fontSize:'18px', padding:'14px', letterSpacing:'0.12em', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1 }}>
          {sub?'جاري المعالجة...':'تأكيد الطلب'}
        </button>

        <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--dim)', textAlign:'center', marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          <Lock style={{ width:'10px', height:'10px', color:'var(--forest)' }}/> دفع آمن ومشفر
        </p>
      </form>
    </div>
  );
}

/* ── STATIC PAGES ────────────────────────────────────────────── */
export function StaticPage({ page }: { page:string }) {
  const p = page.toLowerCase();
  return <>{p==='privacy'&&<Privacy/>}{p==='terms'&&<Terms/>}{p==='cookies'&&<Cookies/>}{p==='contact'&&<Contact/>}</>;
}

const Shell = ({ children, title, sub }: { children:React.ReactNode; title:string; sub?:string }) => (
  <div dir="rtl" style={{ backgroundColor:'var(--cream)', minHeight:'100vh' }}>
    <div style={{ backgroundColor:'var(--forest)', padding:'72px 24px 48px', position:'relative', overflow:'hidden' }} className="canvas-bg">
      <div style={{ maxWidth:'720px', margin:'0 auto', position:'relative', zIndex:2 }}>
        {sub && <p className="tag" style={{ marginBottom:'12px' }}>{sub}</p>}
        <h1 className="bb" style={{ fontSize:'clamp(2.5rem,7vw,6rem)', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--cream)', lineHeight:0.88, margin:'0 0 14px' }}>{title}</h1>
        <div style={{ width:'60px', height:'3px', background:'var(--rust)' }}/>
      </div>
      {/* Torn bottom */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, lineHeight:0 }}>
        <svg viewBox="0 0 1440 30" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:'30px' }} fill="var(--cream)">
          <path d="M0,30 L0,15 Q80,2 160,18 Q240,30 320,10 Q400,-5 480,16 Q560,30 640,12 Q720,-4 800,18 Q880,30 960,14 Q1040,-2 1120,18 Q1200,30 1280,12 Q1360,-4 1440,16 L1440,30 Z"/>
        </svg>
      </div>
    </div>
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'40px 24px 80px' }}>
      <div style={{ backgroundColor:'var(--white)', border:'2px solid var(--line)', padding:'32px' }}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{ paddingBottom:'20px', marginBottom:'20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start' }}>
    <div style={{ flex:1 }}>
      <h3 style={{ fontSize:'14px', fontWeight:700, color:'var(--ink)', margin:'0 0 7px', display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ color:'var(--rust)', fontSize:'12px' }}>//</span> {title}
      </h3>
      <p style={{ fontSize:'13px', lineHeight:'1.8', color:'var(--mid)', fontWeight:400, margin:0 }}>{body}</p>
    </div>
    {tag && <span className="bb" style={{ fontSize:'11px', letterSpacing:'0.14em', textTransform:'uppercase', padding:'4px 10px', border:'1px solid var(--rust)', color:'var(--rust)', flexShrink:0, marginTop:'2px' }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="الخصوصية" sub="✦ قانوني">
      <IB title="البيانات التي نجمعها"  body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لتنفيذ طلبك."/>
      <IB title="كيف نستخدمها"          body="حصرياً لمعالجة طلبك وتوصيله. لا استخدام تجاري."/>
      <IB title="الأمان"                 body="بياناتك محمية بتشفير قياسي وبنية تحتية آمنة."/>
      <IB title="مشاركة البيانات"        body="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين."/>
      <p className="bb" style={{ fontSize:'11px', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--dim)', marginTop:'20px' }}>آخر تحديث: فبراير 2026</p>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="الشروط" sub="✦ قانوني">
      <IB title="حسابك"             body="أنت مسؤول عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك."/>
      <IB title="المدفوعات"          body="لا رسوم مخفية. السعر المعروض هو السعر النهائي."/>
      <IB title="الاستخدام المحظور"  body="المنتجات الأصيلة فقط. لا مجال للمنتجات المقلدة أو غير القانونية." tag="صارم"/>
      <IB title="القانون الحاكم"    body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية."/>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="الكوكيز" sub="✦ قانوني">
      <IB title="الكوكيز الأساسية"    body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب"/>
      <IB title="كوكيز التفضيلات"     body="تحفظ لغتك ومنطقتك لتجربة أفضل." tag="اختياري"/>
      <IB title="كوكيز التحليلات"     body="بيانات مجمعة ومجهولة لتحسين المنصة." tag="اختياري"/>
      <div style={{ marginTop:'16px', padding:'14px', border:'1px solid var(--line)', display:'flex', gap:'12px', alignItems:'flex-start', backgroundColor:'var(--tan-bg)' }}>
        <ToggleRight style={{ width:'18px', height:'18px', color:'var(--rust)', flexShrink:0, marginTop:'1px' }}/>
        <p style={{ fontSize:'13px', color:'var(--mid)', lineHeight:'1.8', margin:0 }}>
          يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح.
        </p>
      </div>
    </Shell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [sent, setSent] = useState(false);
  return (
    <div dir="rtl" style={{ backgroundColor:'var(--cream)', minHeight:'100vh' }}>
      <div style={{ backgroundColor:'var(--forest)', padding:'72px 24px 48px', position:'relative', overflow:'hidden' }} className="canvas-bg">
        <div style={{ maxWidth:'960px', margin:'0 auto', position:'relative', zIndex:2 }}>
          <p className="tag" style={{ marginBottom:'12px' }}>✦ تواصل</p>
          <h1 className="bb" style={{ fontSize:'clamp(2.5rem,7vw,6rem)', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--cream)', lineHeight:0.88, margin:'0 0 14px' }}>
            تواصل معنا
          </h1>
          <p className="bb" style={{ fontSize:'16px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(232,213,176,0.5)' }}>
            نرد خلال 24 ساعة ⛺
          </p>
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, lineHeight:0 }}>
          <svg viewBox="0 0 1440 30" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:'30px' }} fill="var(--cream)">
            <path d="M0,30 L0,15 Q80,2 160,18 Q240,30 320,10 Q400,-5 480,16 Q560,30 640,12 Q720,-4 800,18 Q880,30 960,14 Q1040,-2 1120,18 Q1200,30 1280,12 Q1360,-4 1440,16 L1440,30 Z"/>
          </svg>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth:'960px', margin:'0 auto', padding:'40px 24px 80px' }}>
        {/* Info */}
        <div>
          <div style={{ backgroundColor:'var(--white)', border:'2px solid var(--line)', padding:'24px', marginBottom:'12px' }}>
            <p className="bb" style={{ fontSize:'14px', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--rust)', marginBottom:'18px' }}>// طرق التواصل</p>
            {[
              { icon:'📞', label:'الهاتف',  val:'+213 550 000 000', href:'tel:+213550000000' },
              { icon:'✉️',  label:'البريد',  val:'info@store.dz',    href:'mailto:info@store.dz' },
              { icon:'📍', label:'الموقع',  val:'الجزائر، الجزائر', href:undefined },
            ].map(item=>(
              <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 0', borderBottom:'1px solid var(--line)', textDecoration:'none' }}>
                <div style={{ width:'38px', height:'38px', backgroundColor:'var(--tan-bg)', border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p className="bb" style={{ fontSize:'12px', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--rust)', margin:'0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)', margin:0 }}>{item.val}</p>
                </div>
                {item.href && <ArrowRight style={{ width:'13px', height:'13px', color:'var(--tan)', marginRight:'auto' }}/>}
              </a>
            ))}
          </div>

          <div style={{ backgroundColor:'var(--forest)', padding:'20px 22px', position:'relative', overflow:'hidden' }} className="canvas-bg">
            <Trees style={{ position:'absolute', left:'12px', top:'12px', width:'48px', height:'48px', color:'rgba(232,213,176,0.08)' }}/>
            <p className="bb" style={{ fontSize:'15px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tan-lt)', lineHeight:1.5, margin:'0 0 6px', position:'relative', zIndex:2 }}>
              "المغامرة تبدأ بالتجهيز الصحيح."
            </p>
            <span className="bb" style={{ fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--rust)', position:'relative', zIndex:2 }}>
              Wilderness Gear Co.
            </span>
          </div>
        </div>

        {/* Form */}
        <div style={{ backgroundColor:'var(--white)', border:'2px solid var(--line)', padding:'28px' }}>
          <p className="bb" style={{ fontSize:'14px', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--rust)', marginBottom:'22px' }}>// أرسل رسالة</p>
          {sent ? (
            <div style={{ minHeight:'240px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'2px dashed var(--line)', textAlign:'center', backgroundColor:'var(--tan-bg)', padding:'32px' }}>
              <CheckCircle2 style={{ width:'36px', height:'36px', color:'var(--forest)', marginBottom:'14px' }}/>
              <h3 className="bb" style={{ fontSize:'1.8rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink)', margin:'0 0 8px' }}>تم الإرسال!</h3>
              <p style={{ fontSize:'13px', color:'var(--mid)' }}>سنرد عليك خلال 24 ساعة ⛺</p>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[
                { label:'اسمك', type:'text',  key:'name',  ph:'الاسم الكامل' },
                { label:'البريد', type:'email', key:'email', ph:'بريدك@الإلكتروني' },
              ].map(f=>(
                <div key={f.key}>
                  <p className="bb" style={{ fontSize:'12px', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required className="inp"
                    onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor='var(--line-dk)';}}/>
                </div>
              ))}
              <div>
                <p className="bb" style={{ fontSize:'12px', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>رسالتك</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp"
                  style={{ resize:'none' as any }}
                  onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor='var(--line-dk)';}}/>
              </div>
              <button type="submit" className="btn-rust" style={{ width:'100%', fontSize:'17px', letterSpacing:'0.12em', padding:'13px' }}>
                إرسال الرسالة <ArrowRight style={{ width:'14px', height:'14px' }}/>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}