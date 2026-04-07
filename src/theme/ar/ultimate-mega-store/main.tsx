'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Share2, Phone, User, ToggleRight,
  Shield, ArrowRight, Plus, Minus, CheckCircle2, Lock,
  Menu, Search, ShoppingCart, Truck, RefreshCw,
  SlidersHorizontal, Grid, List, ChevronRight as Cr,
  Tag, Zap, Award, TrendingUp, Package,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

  :root {
    --navy:    #0F1B2D;
    --navy-2:  #162236;
    --navy-3:  #1E2F47;
    --blue:    #1E6FFF;
    --blue-lt: #4D8FFF;
    --blue-dk: #1555CC;
    --red:     #E83A3A;
    --green:   #16A34A;
    --white:   #FFFFFF;
    --off:     #F5F7FA;
    --stone:   #EEF0F5;
    --ink:     #111827;
    --mid:     #6B7280;
    --dim:     #9CA3AF;
    --line:    #E5E7EB;
    --line-dk: #D1D5DB;
  }

  body { background:var(--off); font-family:'Plus Jakarta Sans',sans-serif; color:var(--ink); }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:var(--blue); border-radius:2px; }

  /* Animations */
  @keyframes fade-down { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fade-up   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ticker    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .fu   { animation:fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay:0.08s; }
  .fu-2 { animation-delay:0.18s; }
  .fu-3 { animation-delay:0.30s; }

  /* Mega menu */
  .mega-wrap { position:relative; }
  .mega-panel {
    display:none; position:absolute; top:calc(100% + 8px);
    left:50%; transform:translateX(-50%);
    background:var(--white); border:1px solid var(--line);
    box-shadow:0 16px 48px rgba(15,27,45,0.14);
    border-radius:12px; padding:24px; min-width:640px;
    animation:fade-down 0.22s ease both; z-index:200;
  }
  .mega-wrap:hover .mega-panel { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }

  /* Cards */
  .p-card { background:var(--white); border:1px solid var(--line); border-radius:10px; overflow:hidden; transition:box-shadow 0.25s, transform 0.25s; cursor:pointer; }
  .p-card:hover { box-shadow:0 8px 28px rgba(15,27,45,0.12); transform:translateY(-3px); }
  .p-card:hover .p-img img { transform:scale(1.05); }
  .p-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.4s cubic-bezier(0.22,1,0.36,1); }

  /* Buttons */
  .btn { display:inline-flex; align-items:center; gap:7px; font-family:'Plus Jakarta Sans',sans-serif; font-weight:600; cursor:pointer; border:none; text-decoration:none; transition:all 0.2s; }
  .btn-blue  { background:var(--blue); color:var(--white); }
  .btn-blue:hover  { background:var(--blue-dk); }
  .btn-navy  { background:var(--navy); color:var(--white); }
  .btn-navy:hover  { background:var(--navy-2); }
  .btn-outline { background:transparent; color:var(--blue); border:1.5px solid var(--blue); }
  .btn-outline:hover { background:var(--blue); color:var(--white); }
  .btn-ghost { background:transparent; color:var(--mid); border:1px solid var(--line); }
  .btn-ghost:hover { border-color:var(--ink); color:var(--ink); }

  /* Inp */
  .inp { width:100%; padding:10px 13px; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; background:var(--white); border:1.5px solid var(--line); color:var(--ink); outline:none; border-radius:8px; transition:border-color 0.2s; }
  .inp:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(30,111,255,0.1); }
  .inp::placeholder { color:var(--dim); }
  .inp-err { border-color:var(--red) !important; }
  select.inp { appearance:none; cursor:pointer; }

  /* Badge */
  .badge { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; padding:3px 8px; border-radius:4px; }
  .badge-blue  { background:rgba(30,111,255,0.1); color:var(--blue); }
  .badge-red   { background:var(--red); color:var(--white); }
  .badge-green { background:rgba(22,163,74,0.1); color:var(--green); }
  .badge-navy  { background:var(--navy); color:var(--white); }

  /* Category pill */
  .cat-pill { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:500; border:1.5px solid var(--line); background:var(--white); color:var(--mid); cursor:pointer; transition:all 0.18s; text-decoration:none; white-space:nowrap; }
  .cat-pill:hover, .cat-pill.active { border-color:var(--blue); color:var(--blue); background:rgba(30,111,255,0.05); }
  .cat-pill.active { background:var(--blue); color:var(--white); border-color:var(--blue); }

  /* Filter sidebar */
  .filter-sidebar { width:240px; flex-shrink:0; }
  .filter-group { border-bottom:1px solid var(--line); padding-bottom:16px; margin-bottom:16px; }
  .filter-label { font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--mid); margin-bottom:10px; }
  .filter-check { display:flex; align-items:center; gap:8px; padding:4px 0; cursor:pointer; font-size:13px; color:var(--mid); transition:color 0.18s; }
  .filter-check:hover { color:var(--ink); }

  /* Section label */
  .slabel { font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--mid); }

  /* Responsive */
  .nav-main     { display:flex; align-items:center; gap:4px; }
  .nav-toggle   { display:none; }
  .search-bar   { display:flex; flex:1; max-width:560px; }
  .hero-grid    { display:grid; grid-template-columns:1fr 380px; gap:12px; }
  .hero-side    { display:flex; flex-direction:column; gap:12px; }
  .shop-layout  { display:flex; gap:24px; align-items:flex-start; }
  .prod-grid    { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .prod-grid-3  { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .cat-scroll   { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; flex-wrap:nowrap; }
  .flash-grid   { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; }
  .trust-bar    { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-grid  { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; }
  .details-grid { display:grid; grid-template-columns:1fr 1fr; }
  .details-L    { position:sticky; top:120px; height:fit-content; }
  .details-R    { }
  .contact-g    { display:grid; grid-template-columns:1fr 1fr; gap:48px; }
  .form-2c      { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c       { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

  @media (max-width:1100px) {
    .prod-grid   { grid-template-columns:repeat(3,1fr); }
    .flash-grid  { grid-template-columns:repeat(4,1fr); }
    .hero-grid   { grid-template-columns:1fr; }
    .hero-side   { display:none; }
    .filter-sidebar { display:none; }
  }

  @media (max-width:768px) {
    .nav-main    { display:none; }
    .nav-toggle  { display:flex; }
    .search-bar  { max-width:100%; }
    .prod-grid   { grid-template-columns:repeat(2,1fr); gap:10px; }
    .prod-grid-3 { grid-template-columns:repeat(2,1fr); gap:10px; }
    .flash-grid  { grid-template-columns:repeat(2,1fr); }
    .trust-bar   { grid-template-columns:repeat(2,1fr); }
    .footer-grid { grid-template-columns:1fr 1fr; gap:28px; }
    .details-grid{ grid-template-columns:1fr; }
    .details-L   { position:static; }
    .contact-g   { grid-template-columns:1fr; gap:28px; }
    .slabel-hide { display:none; }
  }

  @media (max-width:480px) {
    .flash-grid  { grid-template-columns:repeat(2,1fr); }
    .trust-bar   { grid-template-columns:1fr 1fr; }
    .footer-grid { grid-template-columns:1fr; }
    .form-2c     { grid-template-columns:1fr; }
    .dlv-2c      { grid-template-columns:1fr; }
  }
`;

/* ── TYPES ───────────────────────────────────────────────────── */
interface Offer { id:string; name:string; quantity:number; price:number; }
interface Variant { id:string; name:string; value:string; }
interface Attribute { id:string; type:string; name:string; displayMode?:'color'|'image'|'text'|null; variants:Variant[]; }
interface ProductImage { id:string; imageUrl:string; }
interface VariantAttributeEntry { attrId:string; attrName:string; displayMode:'color'|'image'|'text'; value:string; }
interface VariantDetail { id:string|number; name:VariantAttributeEntry[]; price:number; stock:number; autoGenerate:boolean; }
interface Wilaya { id:string; name:string; ar_name:string; livraisonHome:number; livraisonOfice:number; livraisonReturn:number; }
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

/* ── MAIN ────────────────────────────────────────────────────── */
export default function Main({ store, children }: any) {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--off)' }}>
      <style>{CSS}</style>
      <Navbar store={store}/>
      <main>{children}</main>
      <Footer store={store}/>
    </div>
  );
}

/* ── NAVBAR — 3-tier ─────────────────────────────────────────── */
export function Navbar({ store }: { store: Store }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRTL = store.language === 'ar';
  const cats: any[] = store.categories || [];

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>4);
    window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h);
  },[]);

  return (
    <header dir={'rtl'} style={{ position:'sticky', top:0, zIndex:100, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* Tier 1: Announcement ticker */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ backgroundColor:'var(--navy)', overflow:'hidden', whiteSpace:'nowrap', padding:'6px 0' }}>
          <div style={{ display:'inline-block', animation:'ticker 22s linear infinite' }}>
            {Array(10).fill(null).map((_,i)=>(
              <span key={i} style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)', letterSpacing:'0.06em', margin:'0 40px', display:'inline-flex', alignItems:'center', gap:'8px' }}>
                <Truck style={{ width:'12px', height:'12px' }}/> {store.topBar.text}
              </span>
            ))}
            {Array(10).fill(null).map((_,i)=>(
              <span key={`b${i}`} style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)', letterSpacing:'0.06em', margin:'0 40px', display:'inline-flex', alignItems:'center', gap:'8px' }}>
                <Truck style={{ width:'12px', height:'12px' }}/> {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tier 2: Main nav — logo + search + actions */}
      <div style={{ backgroundColor:'var(--white)', borderBottom:'1px solid var(--line)', boxShadow:scrolled?'0 2px 8px rgba(15,27,45,0.08)':'none', transition:'box-shadow 0.3s' }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 20px', height:'64px', display:'flex', alignItems:'center', gap:'16px' }}>

          {/* Logo */}
          <Link href={`/`} style={{ textDecoration:'none', flexShrink:0, display:'flex', alignItems:'center', gap:'10px' }}>
            {store.design?.logoUrl
              ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'32px', width:'auto', objectFit:'contain' }}/>
              : (
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'linear-gradient(135deg,var(--blue) 0%,var(--navy) 100%)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Package style={{ width:'16px', height:'16px', color:'var(--white)' }}/>
                  </div>
                  <span style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--navy)', letterSpacing:'-0.01em' }}>{store.name}</span>
                </div>
              )
            }
          </Link>

          {/* Search bar */}
          <div className="search-bar" style={{ position:'relative' }}>
            <div style={{ display:'flex', width:'100%', border:'2px solid var(--blue)', borderRadius:'10px', overflow:'hidden', background:'var(--white)' }}>
              <input type="text" placeholder={'ابحث عن أي منتج...'}
                style={{ flex:1, padding:'9px 14px', border:'none', outline:'none', fontSize:'14px', fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--ink)', background:'transparent' }}/>
              <button style={{ padding:'9px 18px', background:'var(--blue)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', color:'var(--white)', fontSize:'13px', fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                <Search style={{ width:'15px', height:'15px' }}/> {'بحث'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
            <a href="#products" className="btn btn-blue" style={{ padding:'9px 20px', fontSize:'13px', borderRadius:'8px', flexShrink:0 }}>
              <ShoppingCart style={{ width:'14px', height:'14px' }}/> {'تسوق'}
            </a>
            <button className="nav-toggle" onClick={()=>setOpen(p=>!p)} style={{ background:'none', border:'1.5px solid var(--line)', cursor:'pointer', color:'var(--ink)', padding:'8px', borderRadius:'8px', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {open ? <X style={{ width:'18px', height:'18px' }}/> : <Menu style={{ width:'18px', height:'18px' }}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Tier 3: Mega category nav */}
      <div style={{ backgroundColor:'var(--navy)', borderBottom:'2px solid var(--blue)' }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 20px' }}>
          <div className="nav-main" style={{ height:'42px', overflowX:'auto' }}>
            {/* All categories mega button */}
            <div className="mega-wrap">
              <button style={{ display:'flex', alignItems:'center', gap:'6px', padding:'0 16px', height:'42px', background:'var(--blue)', border:'none', color:'var(--white)', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'13px', fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
                <Menu style={{ width:'14px', height:'14px' }}/> {'كل الفئات'} <ChevronDown style={{ width:'13px', height:'13px' }}/>
              </button>
              {/* Mega panel */}
              {cats.length>0 && (
                <div className="mega-panel">
                  {cats.slice(0,8).map((cat:any)=>(
                    <Link key={cat.id} href={`/?category=${cat.id}`}
                      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', padding:'12px 8px', borderRadius:'8px', textDecoration:'none', transition:'background 0.18s', textAlign:'center' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--off)';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
                      <div style={{ width:'48px', height:'48px', borderRadius:'10px', backgroundColor:'var(--stone)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {cat.imageUrl
                          ? <img src={cat.imageUrl} alt={cat.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          : <Package style={{ width:'20px', height:'20px', color:'var(--blue)' }}/>
                        }
                      </div>
                      <span style={{ fontSize:'12px', fontWeight:600, color:'var(--ink)', lineHeight:1.3 }}>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            {[
              { label:'العروض', icon:<Zap style={{ width:'13px', height:'13px' }}/>, color:'#FFB800' },
              { label:'الأكثر مبيعاً', icon:<TrendingUp style={{ width:'13px', height:'13px' }}/>, color:'#FF6B35' },
              { label:'وصل جديد', icon:<Award style={{ width:'13px', height:'13px' }}/>, color:'#22C55E' },
            ].map(item=>(
              <a key={item.label} href="#products"
                style={{ display:'flex', alignItems:'center', gap:'5px', padding:'0 14px', height:'42px', color:item.color, fontSize:'13px', fontWeight:600, textDecoration:'none', whiteSpace:'nowrap', transition:'background 0.18s', flexShrink:0 }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.08)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
                {item.icon} {item.label}
              </a>
            ))}

            {/* Category quick links */}
            {cats.slice(0,6).map((cat:any)=>(
              <Link key={cat.id} href={`/?category=${cat.id}`}
                style={{ display:'flex', alignItems:'center', padding:'0 14px', height:'42px', color:'rgba(255,255,255,0.7)', fontSize:'13px', fontWeight:500, textDecoration:'none', whiteSpace:'nowrap', transition:'all 0.18s', flexShrink:0 }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--white)'; el.style.background='rgba(255,255,255,0.08)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color='rgba(255,255,255,0.7)'; el.style.background='transparent';}}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div style={{ maxHeight:open?'320px':'0', overflow:'hidden', transition:'max-height 0.3s ease', backgroundColor:'var(--white)', borderBottom:open?'1px solid var(--line)':'none' }}>
        <div style={{ padding:'12px 20px 20px' }}>
          {[
            { href:`/`,         label:'المتجر' },
            { href:`/contact`, label:'تواصل' },
            { href:`/Privacy`, label:'الخصوصية' },
          ].map(l=>(
            <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', fontSize:'14px', fontWeight:600, color:'var(--mid)', textDecoration:'none', borderBottom:'1px solid var(--line)' }}>
              {l.label} <ArrowRight style={{ width:'14px', height:'14px' }}/>
            </Link>
          ))}
          {cats.slice(0,5).map((cat:any)=>(
            <Link key={cat.id} href={`/?category=${cat.id}`} onClick={()=>setOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', fontSize:'14px', fontWeight:500, color:'var(--mid)', textDecoration:'none', borderBottom:'1px solid var(--line)' }}>
              {cat.name} <Cr style={{ width:'13px', height:'13px', color:'var(--blue)' }}/>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ── FOOTER ──────────────────────────────────────────────────── */
export function Footer({ store }: any) {
  const yr = new Date().getFullYear();
  const isRTL = store.language === 'ar';
  return (
    <footer dir={'rtl'} style={{ backgroundColor:'var(--navy)', color:'rgba(255,255,255,0.7)', fontFamily:"'Plus Jakarta Sans',sans-serif", marginTop:'48px' }}>
      <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'56px 20px 32px' }}>
        <div className="footer-grid" style={{ paddingBottom:'40px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>

          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'linear-gradient(135deg,var(--blue) 0%,var(--blue-dk) 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Package style={{ width:'16px', height:'16px', color:'var(--white)' }}/>
              </div>
              <span style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--white)', letterSpacing:'-0.01em' }}>{store.name}</span>
            </div>
            <p style={{ fontSize:'13px', lineHeight:'1.8', color:'rgba(255,255,255,0.45)', maxWidth:'220px', fontWeight:400 }}>
              {'منصتك الشاملة للتسوق الإلكتروني.'}
            </p>
            <div style={{ display:'flex', gap:'8px', marginTop:'20px', flexWrap:'wrap' }}>
              {['🚚','💳','🔒','🔄'].map((icon,i)=>(
                <div key={i} style={{ width:'36px', height:'36px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>{icon}</div>
              ))}
            </div>
          </div>

          {[
            { title:'التسوق', links:[
              [`/`, 'كل المنتجات'],
              [`/`, 'العروض'],
              [`/`, 'وصل جديد'],
              [`/`, 'الأكثر مبيعاً'],
            ]},
            { title:'الدعم', links:[
              [`/contact`, 'اتصل بنا'],
              [`/Privacy`, 'الخصوصية'],
              [`/Terms`,   'الشروط'],
              [`/Cookies`, 'الكوكيز'],
            ]},
            { title:'تواصل', links:[
              ['#', '+213 550 000 000'],
              ['#', 'support@store.dz'],
              ['#', 'الجزائر، الجزائر'],
            ]},
          ].map(col=>(
            <div key={col.title}>
              <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:'16px' }}>{col.title}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {col.links.map(([href,label])=>(
                  <a key={label} href={href} style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none', transition:'color 0.2s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--white)';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.5)';}}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop:'20px', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)' }}>© {yr} {store.name}. All rights reserved.</p>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)' }}>Ultimate Mega Store Theme</p>
        </div>
      </div>
    </footer>
  );
}

/* ── CARD ────────────────────────────────────────────────────── */
export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const [hov, setHov] = useState(false);
  const price = typeof product.price==='string' ? parseFloat(product.price) : product.price as number;
  const orig  = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="p-card" onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div className="p-img" style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'var(--stone)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Package style={{ width:'40px', height:'40px', color:'var(--dim)' }}/>
            </div>
        }
        {/* Badges */}
        <div style={{ position:'absolute', top:'8px', left:'8px', display:'flex', flexDirection:'column', gap:'4px' }}>
          {discount>0 && <span className="badge badge-red">-{discount}%</span>}
          {(product.stock===0 && !product.variantDetails?.some((v:any)=>v.autoGenerate)) && (
            <span className="badge badge-navy">{'نفد'}</span>
          )}
        </div>
        {/* Wishlist */}
        <button style={{ position:'absolute', top:'8px', right:'8px', width:'30px', height:'30px', borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:hov?1:0, transition:'opacity 0.25s' }}>
          <Heart style={{ width:'13px', height:'13px', color:'var(--mid)' }}/>
        </button>
        {/* Quick view */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'8px', opacity:hov?1:0, transform:hov?'translateY(0)':'translateY(6px)', transition:'all 0.25s' }}>
          <Link href={`/product/${product.slug||product.id}`}
            className="btn btn-blue" style={{ width:'100%', justifyContent:'center', fontSize:'12px', padding:'9px', borderRadius:'6px', textDecoration:'none' }}>
            {viewDetails} <ArrowRight style={{ width:'12px', height:'12px' }}/>
          </Link>
        </div>
      </div>

      <div style={{ padding:'12px' }}>
        <div style={{ display:'flex', gap:'2px', marginBottom:'4px' }}>
          {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'10px', height:'10px', fill:i<4?'#F59E0B':'none', color:'#F59E0B' }}/>)}
          <span style={{ fontSize:'11px', color:'var(--dim)', marginLeft:'4px' }}>(128)</span>
        </div>
        <h3 style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)', marginBottom:'6px', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'1.05rem', fontWeight:800, color:'var(--blue)', letterSpacing:'-0.01em' }}>
            {price.toLocaleString()}
            <span style={{ fontSize:'11px', fontWeight:500, color:'var(--mid)', marginLeft:'2px' }}>دج</span>
          </span>
          {orig>price && (
            <span style={{ fontSize:'12px', color:'var(--dim)', textDecoration:'line-through' }}>{orig.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── HOME ────────────────────────────────────────────────────── */
export function Home({ store }: any) {
  const isRTL  = store.language === 'ar';
  const products: any[] = store.products || [];
  const cats: any[]     = store.categories || [];
  const [activeCat, setActiveCat] = useState<string|null>(null);
  const [sort, setSort] = useState('default');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');

  const filtered = useMemo(()=>{
    let list = activeCat ? products.filter((p:any)=>p.categoryId===activeCat) : products;
    if(sort==='price-asc')  list = [...list].sort((a,b)=>parseFloat(a.price)-parseFloat(b.price));
    if(sort==='price-desc') list = [...list].sort((a,b)=>parseFloat(b.price)-parseFloat(a.price));
    return list;
  },[products, activeCat, sort]);

  const t = {
    viewDetails: 'عرض المنتج',
    allCats:     'الكل',
    noItems:     'لا توجد منتجات',
    sortBy:      'ترتيب حسب',
    sortDef:     'الافتراضي',
    sortPA:      'السعر: من الأقل',
    sortPD:      'السعر: من الأعلى',
    results:     'نتيجة',
  };

  const trust = [
    { icon:<Truck style={{ width:'20px', height:'20px' }}/>,      title:'شحن سريع',   desc:'48 ساعة لبابك' },
    { icon:<RefreshCw style={{ width:'20px', height:'20px' }}/>,  title:'إرجاع مجاني',  desc:'30 يوم إرجاع'     },
    { icon:<Lock style={{ width:'20px', height:'20px' }}/>,       title:'دفع آمن',    desc:'مشفر وآمن'    },
    { icon:<Award style={{ width:'20px', height:'20px' }}/>,      title:'منتجات أصيلة',    desc:'100% أصلي'         },
  ];

  return (
    <div dir={'rtl'}>

      {/* ── HERO ── */}
      <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'16px 20px 0' }}>
        <div className="hero-grid">
          {/* Main hero banner */}
          <div style={{ position:'relative', borderRadius:'12px', overflow:'hidden', minHeight:'360px', backgroundColor:'var(--navy)', background:'linear-gradient(135deg,var(--navy) 0%,var(--navy-3) 60%,#1a3a6b 100%)' }}>
            {store.hero?.imageUrl && (
              <img src={store.hero.imageUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.35, display:'block' }}/>
            )}
            {/* Grid overlay */}
            <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>
            <div style={{ position:'relative', zIndex:2, padding:'40px 40px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <div className="fu" style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginBottom:'16px' }}>
                <Zap style={{ width:'14px', height:'14px', color:'#FFB800' }}/>
                <span style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#FFB800' }}>
                  {'العروض المميزة'}
                </span>
              </div>
              <h1 className="fu fu-1" style={{ fontWeight:800, fontSize:'clamp(1.8rem,4vw,3.2rem)', color:'var(--white)', lineHeight:1.05, letterSpacing:'-0.02em', marginBottom:'16px', maxWidth:'480px' }}>
                {store.hero?.title || (<>ملايين المنتجات<br/>في متناول يدك</>)}
              </h1>
              <p className="fu fu-2" style={{ fontSize:'15px', color:'rgba(255,255,255,0.65)', marginBottom:'28px', maxWidth:'380px', fontWeight:400, lineHeight:1.7 }}>
                {store.hero?.subtitle || ('أفضل الأسعار والأسرع توصيل.')}
              </p>
              <div className="fu fu-3" style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                <a href="#products" className="btn btn-blue" style={{ padding:'12px 28px', fontSize:'14px', borderRadius:'8px' }}>
                  <ShoppingCart style={{ width:'15px', height:'15px' }}/> {'تسوق الآن'}
                </a>
                <a href="#products" className="btn" style={{ padding:'12px 24px', fontSize:'14px', borderRadius:'8px', background:'rgba(255,255,255,0.12)', color:'var(--white)', border:'1px solid rgba(255,255,255,0.2)' }}>
                  {'عرض العروض'} <ArrowRight style={{ width:'14px', height:'14px' }}/>
                </a>
              </div>
              {/* Stats row */}
              <div style={{ display:'flex', gap:'24px', marginTop:'32px', paddingTop:'24px', borderTop:'1px solid rgba(255,255,255,0.1)', flexWrap:'wrap' }}>
                {[
                  { n:`${products.length}+`, l:'منتج' },
                  { n:'48H',                 l:'توصيل' },
                  { n:'100%',                l:'أصيل' },
                ].map((s,i)=>(
                  <div key={i}>
                    <p style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--white)', lineHeight:1, margin:0 }}>{s.n}</p>
                    <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', margin:'3px 0 0', fontWeight:500, letterSpacing:'0.06em' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side panels */}
          <div className="hero-side">
            {/* Flash deal panel */}
            <div style={{ borderRadius:'12px', overflow:'hidden', background:'linear-gradient(135deg,#FF6B35 0%,#E83A3A 100%)', padding:'20px', color:'var(--white)', position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
                <Zap style={{ width:'14px', height:'14px' }}/> <span style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>Flash Deal</span>
              </div>
              <p style={{ fontSize:'1.1rem', fontWeight:700, lineHeight:1.3, marginBottom:'8px' }}>
                {products[0]?.name || ('عروض محدودة الوقت')}
              </p>
              {products[0] && (
                <p style={{ fontSize:'1.4rem', fontWeight:800, letterSpacing:'-0.01em' }}>
                  {parseFloat(String(products[0].price)).toLocaleString()} <span style={{ fontSize:'12px', fontWeight:400, opacity:0.8 }}>دج</span>
                </p>
              )}
              <a href="#products" style={{ display:'inline-flex', alignItems:'center', gap:'5px', marginTop:'10px', fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.9)', textDecoration:'none' }}>
                {'اكتشف الآن'} <ArrowRight style={{ width:'12px', height:'12px' }}/>
              </a>
            </div>

            {/* Free shipping panel */}
            <div style={{ borderRadius:'12px', background:'linear-gradient(135deg,var(--blue) 0%,var(--blue-dk) 100%)', padding:'20px', color:'var(--white)', position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
                <Truck style={{ width:'14px', height:'14px' }}/> <span style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>{'توصيل مجاني'}</span>
              </div>
              <p style={{ fontSize:'1rem', fontWeight:600, lineHeight:1.4, marginBottom:'4px' }}>
                {'توصيل سريع لجميع ولايات الجزائر'}
              </p>
              <p style={{ fontSize:'12px', opacity:0.75, fontWeight:400 }}>مضمون خلال 48 ساعة</p>
            </div>

            {/* New arrivals panel */}
            <div style={{ borderRadius:'12px', border:'1.5px solid var(--line)', background:'var(--white)', padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
                <Award style={{ width:'14px', height:'14px', color:'#22C55E' }}/> <span style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#22C55E' }}>{'وصل جديد'}</span>
              </div>
              <p style={{ fontSize:'14px', fontWeight:600, color:'var(--ink)', marginBottom:'10px' }}>
                {products.length>0 ? `${products.length} ${'منتج جديد'}` : ('منتجات جديدة قريباً')}
              </p>
              <a href="#products" className="btn btn-outline" style={{ fontSize:'12px', padding:'8px 16px', borderRadius:'6px', textDecoration:'none' }}>
                {'عرض الكل'} <ArrowRight style={{ width:'12px', height:'12px' }}/>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div style={{ maxWidth:'1400px', margin:'16px auto 0', padding:'0 20px' }}>
        <div className="trust-bar" style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'10px', overflow:'hidden' }}>
          {trust.map((item,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'16px 20px', borderRight:i<3?'1px solid var(--line)':'none' }}>
              <div style={{ color:'var(--blue)', flexShrink:0 }}>{item.icon}</div>
              <div>
                <p style={{ fontSize:'13px', fontWeight:700, color:'var(--ink)', margin:0 }}>{item.title}</p>
                <p style={{ fontSize:'11px', color:'var(--mid)', margin:0, fontWeight:400 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      {cats.length>0 && (
        <div style={{ maxWidth:'1400px', margin:'24px auto 0', padding:'0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
            <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', margin:0 }}>{'تسوق حسب الفئة'}</h2>
          </div>
          <div className="cat-scroll">
            <button onClick={()=>setActiveCat(null)} className={`cat-pill${!activeCat?' active':''}`}>
              {t.allCats} <span style={{ fontSize:'11px', opacity:0.7 }}>({products.length})</span>
            </button>
            {cats.map((cat:any)=>{
              const count = products.filter((p:any)=>p.categoryId===cat.id).length;
              return (
                <button key={cat.id} onClick={()=>setActiveCat(cat.id)} className={`cat-pill${activeCat===cat.id?' active':''}`}>
                  {cat.name} {count>0 && <span style={{ fontSize:'11px', opacity:0.7 }}>({count})</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FLASH DEALS STRIP ── */}
      {products.length>0 && (
        <div style={{ maxWidth:'1400px', margin:'24px auto 0', padding:'0 20px' }}>
          <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'10px', padding:'16px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ background:'var(--red)', borderRadius:'6px', padding:'4px 10px', display:'flex', alignItems:'center', gap:'5px' }}>
                  <Zap style={{ width:'13px', height:'13px', color:'var(--white)' }}/>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'var(--white)', letterSpacing:'0.06em', textTransform:'uppercase' }}>عروض فلاش</span>
                </div>
                <span style={{ fontSize:'12px', color:'var(--mid)' }}>{'عروض محدودة الوقت'}</span>
              </div>
              <a href="#products" style={{ fontSize:'12px', fontWeight:600, color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px' }}>
                {'عرض الكل'} <ArrowRight style={{ width:'12px', height:'12px' }}/>
              </a>
            </div>
            <div className="flash-grid">
              {products.slice(0,5).map((p:any)=>{
                const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl;
                const pr   = parseFloat(String(p.price));
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100) : 0;
                return (
                  <Link key={p.id} href={`/product/${p.slug||p.id}`}
                    style={{ display:'block', textDecoration:'none', borderRadius:'8px', border:'1px solid var(--line)', overflow:'hidden', transition:'box-shadow 0.2s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(15,27,45,0.1)';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow='none';}}>
                    <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'var(--stone)' }}>
                      {img ? <img src={img} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/> : <Package style={{ width:'32px', height:'32px', color:'var(--dim)', margin:'auto' }}/>}
                      {disc>0 && <span className="badge badge-red" style={{ position:'absolute', top:'6px', left:'6px' }}>-{disc}%</span>}
                    </div>
                    <div style={{ padding:'8px 10px' }}>
                      <p style={{ fontSize:'12px', fontWeight:600, color:'var(--ink)', margin:'0 0 4px', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>{p.name}</p>
                      <p style={{ fontSize:'13px', fontWeight:800, color:'var(--blue)', margin:0 }}>{pr.toLocaleString()} <span style={{ fontSize:'10px', fontWeight:400 }}>دج</span></p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN SHOP LAYOUT ── */}
      <div id="products" style={{ maxWidth:'1400px', margin:'24px auto 0', padding:'0 20px 48px' }}>
        <div className="shop-layout">

          {/* Filter Sidebar */}
          <aside className="filter-sidebar">
            <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'10px', padding:'20px', position:'sticky', top:'120px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid var(--line)' }}>
                <SlidersHorizontal style={{ width:'15px', height:'15px', color:'var(--blue)' }}/>
                <span style={{ fontSize:'14px', fontWeight:700, color:'var(--ink)' }}>{'تصفية النتائج'}</span>
              </div>

              {/* Category filter */}
              <div className="filter-group">
                <p className="filter-label">{'الفئة'}</p>
                <label className="filter-check" onClick={()=>setActiveCat(null)} style={{ color:!activeCat?'var(--blue)':'var(--mid)', fontWeight:!activeCat?600:400 }}>
                  <div style={{ width:'15px', height:'15px', borderRadius:'50%', border:`2px solid ${!activeCat?'var(--blue)':'var(--line)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {!activeCat && <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'var(--blue)' }}/>}
                  </div>
                  {t.allCats} ({products.length})
                </label>
                {cats.map((cat:any)=>{
                  const count = products.filter((p:any)=>p.categoryId===cat.id).length;
                  const active = activeCat===cat.id;
                  return (
                    <label key={cat.id} className="filter-check" onClick={()=>setActiveCat(cat.id)} style={{ color:active?'var(--blue)':'var(--mid)', fontWeight:active?600:400 }}>
                      <div style={{ width:'15px', height:'15px', borderRadius:'50%', border:`2px solid ${active?'var(--blue)':'var(--line)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {active && <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'var(--blue)' }}/>}
                      </div>
                      {cat.name} ({count})
                    </label>
                  );
                })}
              </div>

              {/* Sort filter */}
              <div className="filter-group">
                <p className="filter-label">{t.sortBy}</p>
                {[
                  { val:'default',    label:t.sortDef },
                  { val:'price-asc',  label:t.sortPA  },
                  { val:'price-desc', label:t.sortPD  },
                ].map(opt=>(
                  <label key={opt.val} className="filter-check" onClick={()=>setSort(opt.val)} style={{ color:sort===opt.val?'var(--blue)':'var(--mid)', fontWeight:sort===opt.val?600:400 }}>
                    <div style={{ width:'15px', height:'15px', borderRadius:'50%', border:`2px solid ${sort===opt.val?'var(--blue)':'var(--line)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {sort===opt.val && <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'var(--blue)' }}/>}
                    </div>
                    {opt.label}
                  </label>
                ))}
              </div>

              {/* Quick stats */}
              <div style={{ background:'var(--off)', borderRadius:'8px', padding:'14px', marginTop:'8px' }}>
                <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'10px' }}>{'إحصائيات'}</p>
                <p style={{ fontSize:'13px', color:'var(--ink)', margin:'0 0 4px', fontWeight:600 }}>{filtered.length} {t.results}</p>
                <p style={{ fontSize:'12px', color:'var(--mid)', margin:0 }}>{cats.length} {'فئة'}</p>
              </div>
            </div>
          </aside>

          {/* Product grid area */}
          <div style={{ flex:1, minWidth:0 }}>
            {/* Toolbar */}
            <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
              <p style={{ fontSize:'14px', fontWeight:600, color:'var(--ink)', margin:0 }}>
                {filtered.length} <span style={{ fontWeight:400, color:'var(--mid)' }}>{t.results}</span>
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                {/* Sort dropdown (mobile) */}
                <select value={sort} onChange={e=>setSort(e.target.value)}
                  style={{ padding:'7px 28px 7px 10px', border:'1.5px solid var(--line)', borderRadius:'6px', fontSize:'12px', fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--ink)', outline:'none', cursor:'pointer', appearance:'none', backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}>
                  <option value="default">{t.sortDef}</option>
                  <option value="price-asc">{t.sortPA}</option>
                  <option value="price-desc">{t.sortPD}</option>
                </select>
                {/* View toggle */}
                <div style={{ display:'flex', border:'1.5px solid var(--line)', borderRadius:'6px', overflow:'hidden' }}>
                  {([['grid',<Grid style={{ width:'14px', height:'14px' }}/>],['list',<List style={{ width:'14px', height:'14px' }}/>]] as const).map(([mode,icon])=>(
                    <button key={mode} onClick={()=>setViewMode(mode as any)}
                      style={{ width:'34px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer', backgroundColor:viewMode===mode?'var(--blue)':'transparent', color:viewMode===mode?'var(--white)':'var(--mid)', transition:'all 0.18s' }}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products */}
            {filtered.length===0 ? (
              <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'10px', padding:'64px 24px', textAlign:'center' }}>
                <Package style={{ width:'48px', height:'48px', color:'var(--dim)', margin:'0 auto 14px' }}/>
                <p style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--ink)', margin:'0 0 6px' }}>{t.noItems}</p>
                <p style={{ fontSize:'13px', color:'var(--mid)', margin:0 }}>{'حاول تغيير الفلاتر'}</p>
              </div>
            ) : viewMode==='grid' ? (
              <div className="prod-grid">
                {filtered.map((p:any)=>{
                  const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                  const disc = p.priceOriginal ? Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100) : 0;
                  return <Card key={p.id} product={p} displayImage={img} discount={disc} isRTL={isRTL} store={store} viewDetails={t.viewDetails}/>;
                })}
              </div>
            ) : (
              /* List view */
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {filtered.map((p:any)=>{
                  const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                  const pr   = parseFloat(String(p.price));
                  const disc = p.priceOriginal ? Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100) : 0;
                  return (
                    <Link key={p.id} href={`/product/${p.slug||p.id}`}
                      style={{ display:'flex', gap:'16px', background:'var(--white)', border:'1px solid var(--line)', borderRadius:'10px', overflow:'hidden', textDecoration:'none', transition:'box-shadow 0.2s', alignItems:'center' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(15,27,45,0.1)';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow='none';}}>
                      <div style={{ width:'100px', height:'100px', flexShrink:0, overflow:'hidden', backgroundColor:'var(--stone)' }}>
                        {img ? <img src={img} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/> : <Package style={{ width:'32px', height:'32px', color:'var(--dim)', margin:'auto', display:'block', marginTop:'34px' }}/>}
                      </div>
                      <div style={{ flex:1, padding:'14px 16px 14px 0', minWidth:0 }}>
                        <h3 style={{ fontSize:'14px', fontWeight:600, color:'var(--ink)', margin:'0 0 4px', lineHeight:1.4 }}>{p.name}</h3>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                          {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'10px', height:'10px', fill:i<4?'#F59E0B':'none', color:'#F59E0B' }}/>)}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <span style={{ fontSize:'1rem', fontWeight:800, color:'var(--blue)' }}>{pr.toLocaleString()} دج</span>
                          {disc>0 && <span className="badge badge-red">-{disc}%</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DETAILS ─────────────────────────────────────────────────── */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [sel, setSel] = useState(0);
  return (
    <div dir={'rtl'} style={{ backgroundColor:'var(--off)' }}>

      {/* Breadcrumb */}
      <div style={{ backgroundColor:'var(--white)', borderBottom:'1px solid var(--line)' }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'10px 20px', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'var(--dim)' }}>
          <Link href="/" style={{ textDecoration:'none', color:'var(--mid)', transition:'color 0.2s' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--blue)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
            {'الرئيسية'}
          </Link>
          <Cr style={{ width:'12px', height:'12px' }}/>
          <span style={{ color:'var(--ink)', fontWeight:600 }}>{product.name.slice(0,50)}</span>
          <div style={{ marginLeft:'auto', display:'flex', gap:'6px' }}>
            <button onClick={toggleWishlist} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:`1.5px solid ${isWishlisted?'var(--blue)':'var(--line)'}`, background:isWishlisted?'rgba(30,111,255,0.08)':'transparent', cursor:'pointer', color:isWishlisted?'var(--blue)':'var(--mid)', borderRadius:'6px' }}>
              <Heart style={{ width:'13px', height:'13px', fill:isWishlisted?'currentColor':'none' }}/>
            </button>
            <button onClick={handleShare} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--mid)', borderRadius:'6px' }}>
              <Share2 style={{ width:'13px', height:'13px' }}/>
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'24px 20px 48px' }}>
        <div className="details-grid" style={{ gap:'24px', alignItems:'flex-start' }}>

          {/* Gallery */}
          <div className="details-L">
            <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', overflow:'hidden' }}>
              <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'var(--stone)' }}>
                {allImages.length>0
                  ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package style={{ width:'64px', height:'64px', color:'var(--dim)' }}/></div>
                }
                {discount>0 && <span className="badge badge-red" style={{ position:'absolute', top:'12px', left:'12px', fontSize:'12px', padding:'4px 10px' }}>-{discount}%</span>}
                {allImages.length>1 && (
                  <>
                    <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', width:'34px', height:'34px', border:'none', borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.9)', boxShadow:'0 2px 8px rgba(0,0,0,0.12)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <ChevronLeft style={{ width:'14px', height:'14px' }}/>
                    </button>
                    <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'34px', height:'34px', border:'none', borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.9)', boxShadow:'0 2px 8px rgba(0,0,0,0.12)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <ChevronRight style={{ width:'14px', height:'14px' }}/>
                    </button>
                  </>
                )}
                {!inStock&&!autoGen && (
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.85)', backdropFilter:'blur(4px)' }}>
                    <span style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--mid)' }}>{'نفد المخزون'}</span>
                  </div>
                )}
              </div>
              {allImages.length>1 && (
                <div style={{ display:'flex', gap:'8px', padding:'12px', flexWrap:'wrap' }}>
                  {allImages.slice(0,6).map((img:string,idx:number)=>(
                    <button key={idx} onClick={()=>setSel(idx)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`2px solid ${sel===idx?'var(--blue)':'var(--line)'}`, cursor:'pointer', padding:0, background:'none', borderRadius:'6px', opacity:sel===idx?1:0.6 }}>
                      <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div style={{ marginTop:'12px', background:'var(--white)', border:'1px solid var(--line)', borderRadius:'10px', padding:'14px 16px' }}>
              {[
                { icon:<Truck style={{ width:'14px', height:'14px', color:'var(--green)' }}/>, text:'توصيل سريع خلال 48 ساعة' },
                { icon:<Lock style={{ width:'14px', height:'14px', color:'var(--blue)' }}/>,  text:'دفع آمن ومشفر' },
                { icon:<RefreshCw style={{ width:'14px', height:'14px', color:'#F59E0B' }}/>, text:'إرجاع مجاني خلال 30 يوم' },
              ].map((item,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'6px 0', borderBottom:i<2?'1px solid var(--line)':'none' }}>
                  {item.icon}
                  <span style={{ fontSize:'12px', color:'var(--mid)', fontWeight:400 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="details-R">
            <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', padding:'28px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', marginBottom:'12px' }}>
                <span className="badge badge-blue">{'منتج متاح'}</span>
                <div style={{ display:'flex', gap:'2px' }}>
                  {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'13px', height:'13px', fill:i<4?'#F59E0B':'none', color:'#F59E0B' }}/>)}
                  <span style={{ fontSize:'12px', color:'var(--mid)', marginLeft:'5px' }}>4.8 (128)</span>
                </div>
              </div>

              <h1 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:800, color:'var(--ink)', lineHeight:1.15, marginBottom:'16px', letterSpacing:'-0.01em' }}>
                {product.name}
              </h1>

              {/* Price */}
              <div style={{ background:'var(--off)', borderRadius:'8px', padding:'16px', marginBottom:'20px' }}>
                <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', margin:'0 0 6px' }}>{'السعر'}</p>
                <div style={{ display:'flex', alignItems:'baseline', gap:'10px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'2.2rem', fontWeight:800, color:'var(--blue)', letterSpacing:'-0.02em', lineHeight:1 }}>{finalPrice.toLocaleString()}</span>
                  <span style={{ fontSize:'15px', color:'var(--mid)' }}>دج</span>
                  {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                    <>
                      <span style={{ fontSize:'15px', textDecoration:'line-through', color:'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                      <span className="badge badge-red">{'وفّر'} {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج</span>
                    </>
                  )}
                </div>
              </div>

              {/* Stock */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'6px 14px', marginBottom:'20px', borderRadius:'20px', backgroundColor:inStock||autoGen?'rgba(22,163,74,0.1)':'rgba(232,58,58,0.1)', color:inStock||autoGen?'var(--green)':'var(--red)' }}>
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:'currentColor' }}/>
                <span style={{ fontSize:'12px', fontWeight:600 }}>{autoGen?'∞ In Stock':inStock?('متوفر'):('نفد')}</span>
              </div>

              {/* Offers */}
              {product.offers?.length>0 && (
                <div style={{ marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid var(--line)' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'10px' }}>{'الباقات'}</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {product.offers.map((offer:any)=>(
                      <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', border:`1.5px solid ${selectedOffer===offer.id?'var(--blue)':'var(--line)'}`, cursor:'pointer', borderRadius:'8px', transition:'all 0.18s', backgroundColor:selectedOffer===offer.id?'rgba(30,111,255,0.04)':'transparent' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'17px', height:'17px', borderRadius:'50%', border:`2px solid ${selectedOffer===offer.id?'var(--blue)':'var(--dim)'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {selectedOffer===offer.id&&<div style={{ width:'9px', height:'9px', borderRadius:'50%', background:'var(--blue)' }}/>}
                          </div>
                          <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                          <div>
                            <p style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)', margin:0 }}>{offer.name}</p>
                            <p style={{ fontSize:'11px', color:'var(--mid)', margin:0 }}>×{offer.quantity}</p>
                          </div>
                        </div>
                        <span style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--blue)' }}>{offer.price.toLocaleString()} <span style={{ fontSize:'11px', fontWeight:400, color:'var(--mid)' }}>دج</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Attributes */}
              {allAttrs.map((attr:any)=>(
                <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--line)' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'10px' }}>{attr.name}</p>
                  {attr.displayMode==='color' ? (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'28px', height:'28px', backgroundColor:v.value, border:'none', cursor:'pointer', borderRadius:'50%', outline:s?'3px solid var(--blue)':'3px solid transparent', outlineOffset:'3px' }}/>;})}
                    </div>
                  ):attr.displayMode==='image' ? (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`2px solid ${s?'var(--blue)':'var(--line)'}`, cursor:'pointer', padding:0, borderRadius:'6px' }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                    </div>
                  ):(
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ padding:'8px 16px', border:`1.5px solid ${s?'var(--blue)':'var(--line)'}`, backgroundColor:s?'var(--blue)':'transparent', color:s?'var(--white)':'var(--mid)', fontSize:'12px', fontWeight:600, cursor:'pointer', borderRadius:'6px', transition:'all 0.18s' }}>{v.name}</button>;})}
                    </div>
                  )}
                </div>
              ))}

              <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

              {product.desc && (
                <div style={{ marginTop:'24px', paddingTop:'20px', borderTop:'1px solid var(--line)' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'10px' }}>{'وصف المنتج'}</p>
                  <div style={{ fontSize:'13px', lineHeight:'1.8', color:'var(--mid)', fontWeight:400 }}
                    dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc,{ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','span'],ALLOWED_ATTR:['class','style']})}}/>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PRODUCT FORM ─────────────────────────────────────────────── */
const FR = ({ error, label, children }: { error?:string; label?:string; children:React.ReactNode }) => (
  <div style={{ marginBottom:'12px' }}>
    {label && <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize:'11px', color:'var(--red)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
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
      await axios.post(`${API_URL}/orders/create`,{...fd,productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv() , variantDetailId:   getVariantDetailId()});
      if(typeof window!=='undefined'&&fd.customerId) localStorage.setItem('customerId',fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    }catch(err){console.error(err);}finally{setSub(false);}
  };

  return (
    <div style={{ marginTop:'20px', paddingTop:'20px', borderTop:'1px solid var(--line)' }}>
      <form onSubmit={handleSubmit}>
        <div className="form-2c">
          <FR error={errors.customerName} label="الاسم">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', right:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="الاسم الكامل"
                className={`inp${errors.customerName?' inp-err':''}`} style={{ paddingRight:'34px' }}
                onFocus={e=>{e.target.style.borderColor='var(--blue)';}} onBlur={e=>{e.target.style.borderColor=errors.customerName?'var(--red)':'var(--line)';}}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="الهاتف">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', right:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX"
                className={`inp${errors.customerPhone?' inp-err':''}`} style={{ paddingRight:'34px' }}
                onFocus={e=>{e.target.style.borderColor='var(--blue)';}} onBlur={e=>{e.target.style.borderColor=errors.customerPhone?'var(--red)':'var(--line)';}}/>
            </div>
          </FR>
        </div>
        <div className="form-2c">
          <FR error={errors.customerWelaya} label="الولاية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                className={`inp${errors.customerWelaya?' inp-err':''}`} style={{ paddingLeft:'30px' }}
                onFocus={e=>{e.target.style.borderColor='var(--blue)';}} onBlur={e=>{e.target.style.borderColor=errors.customerWelaya?'var(--red)':'var(--line)';}}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FR>
          <FR error={errors.customerCommune} label="البلدية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})}
                className={`inp${errors.customerCommune?' inp-err':''}`} style={{ paddingLeft:'30px', opacity:!fd.customerWelaya?0.4:1 }}
                onFocus={e=>{e.target.style.borderColor='var(--blue)';}} onBlur={e=>{e.target.style.borderColor=errors.customerCommune?'var(--red)':'var(--line)';}}>
                <option value="">{loadingC?'...':'اختر البلدية'}</option>
                {communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FR>
        </div>

        <FR label="طريقة التوصيل">
          <div className="dlv-2c">
            {(['home','office'] as const).map(type=>(
              <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))}
                style={{ padding:'12px', border:`1.5px solid ${fd.typeLivraison===type?'var(--blue)':'var(--line)'}`, backgroundColor:fd.typeLivraison===type?'rgba(30,111,255,0.04)':'transparent', cursor:'pointer', textAlign:'left', borderRadius:'8px', transition:'all 0.18s' }}>
                <p style={{ fontSize:'12px', fontWeight:700, color:fd.typeLivraison===type?'var(--blue)':'var(--mid)', margin:'0 0 4px' }}>
                  {type==='home'?'توصيل للبيت':'توصيل للمكتب'}
                </p>
                {selW && <p style={{ fontSize:'1rem', fontWeight:800, color:fd.typeLivraison===type?'var(--blue)':'var(--dim)', margin:0 }}>
                  {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()}
                  <span style={{ fontSize:'11px', fontWeight:400, color:'var(--mid)', marginLeft:'3px' }}>دج</span>
                </p>}
              </button>
            ))}
          </div>
        </FR>

        <FR label="الكمية">
          <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid var(--line)', borderRadius:'8px', overflow:'hidden' }}>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--ink)', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--off)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Minus style={{ width:'13px', height:'13px' }}/>
            </button>
            <span style={{ width:'44px', textAlign:'center', fontSize:'1.1rem', fontWeight:800, color:'var(--ink)' }}>{fd.quantity}</span>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--ink)', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--off)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Plus style={{ width:'13px', height:'13px' }}/>
            </button>
          </div>
        </FR>

        {/* Summary */}
        <div style={{ border:'1.5px solid var(--line)', borderRadius:'10px', marginBottom:'14px', overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', backgroundColor:'var(--off)', borderBottom:'1px solid var(--line)' }}>
            <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', margin:0 }}>ملخص الطلب</p>
          </div>
          {[
            { l:'المنتج', v:product.name.slice(0,22) },
            { l:'السعر',  v:`${fp.toLocaleString()} دج` },
            { l:'الكمية', v:`× ${fd.quantity}` },
            { l:'التوصيل',v:selW?`${getLiv().toLocaleString()} دج`:'—' },
          ].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 14px', borderBottom:'1px solid var(--line)' }}>
              <span style={{ fontSize:'12px', color:'var(--mid)' }}>{row.l}</span>
              <span style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px', backgroundColor:'rgba(30,111,255,0.04)' }}>
            <span style={{ fontSize:'12px', fontWeight:600, color:'var(--mid)' }}>المجموع</span>
            <span style={{ fontSize:'1.6rem', fontWeight:800, color:'var(--blue)', letterSpacing:'-0.01em' }}>
              {total().toLocaleString()} <span style={{ fontSize:'12px', fontWeight:400, color:'var(--mid)' }}>دج</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={sub} className="btn btn-blue"
          style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'14px', borderRadius:'8px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1 }}>
          {sub?'جاري المعالجة...':'تأكيد الطلب'}{!sub && <ArrowRight style={{ width:'14px', height:'14px' }}/>}
        </button>

        <p style={{ fontSize:'11px', color:'var(--dim)', textAlign:'center', marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          <Lock style={{ width:'10px', height:'10px', color:'var(--blue)' }}/> دفع آمن ومشفر
        </p>
      </form>
    </div>
  );
}

/* ── STATIC PAGES ─────────────────────────────────────────────── */
export function StaticPage({ page }: { page:string }) {
  const p = page.toLowerCase();
  return <>{p==='privacy'&&<Privacy/>}{p==='terms'&&<Terms/>}{p==='cookies'&&<Cookies/>}{p==='contact'&&<Contact/>}</>;
}

const Shell = ({ children, title, sub }: { children:React.ReactNode; title:string; sub?:string }) => (
  <div style={{ backgroundColor:'var(--off)', minHeight:'100vh' }}>
    <div style={{ backgroundColor:'var(--navy)', padding:'64px 20px 40px' }}>
      <div style={{ maxWidth:'760px', margin:'0 auto' }}>
        {sub && <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:'10px' }}>{sub}</p>}
        <h1 style={{ fontWeight:800, fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--white)', lineHeight:1, margin:0, letterSpacing:'-0.02em' }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth:'760px', margin:'0 auto', padding:'40px 20px 80px' }}>
      <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', padding:'32px' }}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{ paddingBottom:'18px', marginBottom:'18px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start' }}>
    <div style={{ flex:1 }}>
      <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--ink)', margin:'0 0 6px' }}>{title}</h3>
      <p style={{ fontSize:'13px', lineHeight:'1.8', color:'var(--mid)', margin:0, fontWeight:400 }}>{body}</p>
    </div>
    {tag && <span className="badge badge-blue" style={{ flexShrink:0, marginTop:'2px' }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="قانوني">
      <IB title="البيانات التي نجمعها"  body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري فقط لمعالجة طلبك."/>
      <IB title="كيف نستخدمها"    body="حصرياً لتنفيذ وتوصيل مشترياتك. لا تسويق لطرف ثالث دون موافقتك."/>
      <IB title="الأمان"         body="بياناتك محمية بتشفير على مستوى المؤسسات وبنية تحتية آمنة."/>
      <IB title="مشاركة البيانات"     body="لا نبيع البيانات الشخصية أبداً. تُشارك فقط مع شركاء التوصيل الموثوقين عند الحاجة."/>
      <p style={{ fontSize:'12px', color:'var(--dim)', marginTop:'16px' }}>Last updated: February 2026</p>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الاستخدام" sub="قانوني">
      <IB title="حسابك"   body="أنت مسؤول كلياً عن أمان بيانات تسجيل الدخول وكل النشاط الجاري تحت حسابك."/>
      <IB title="التسعير"        body="لا رسوم مخفية. السعر المعروض عند الدفع هو السعر الإجمالي النهائي شاملاً كل الرسوم."/>
      <IB title="الاستخدام المحظور" body="يُسمح فقط بالمنتجات الأصيلة والقانونية. المنتجات المقلدة محظورة تماماً." tag="صارم"/>
      <IB title="القانون الحاكم"  body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية."/>
      <div style={{ marginTop:'16px', padding:'14px 16px', backgroundColor:'var(--off)', borderRadius:'8px', fontSize:'13px', color:'var(--mid)', lineHeight:'1.8' }}>
        We reserve the right to update these terms. Continued use of the platform implies acceptance.
      </div>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="سياسة الكوكيز" sub="قانوني">
      <IB title="الكوكيز الأساسية"  body="مطلوبة للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب"/>
      <IB title="كوكيز التفضيلات" body="تتذكر لغتك ومنطقتك لتجربة أفضل." tag="اختياري"/>
      <IB title="كوكيز التحليلات"  body="بيانات مجمعة ومجهولة الهوية لمساعدتنا في تحسين المنصة." tag="اختياري"/>
      <div style={{ marginTop:'16px', padding:'14px 16px', border:'1px solid var(--line)', borderRadius:'8px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
        <ToggleRight style={{ width:'18px', height:'18px', color:'var(--blue)', flexShrink:0, marginTop:'1px' }}/>
        <p style={{ fontSize:'13px', color:'var(--mid)', lineHeight:'1.8', margin:0 }}>
          Manage cookie preferences through your browser settings. Essential cookies cannot be disabled without affecting core functionality.
        </p>
      </div>
    </Shell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [sent, setSent] = useState(false);
  return (
    <div style={{ backgroundColor:'var(--off)', minHeight:'100vh' }}>
      <div style={{ backgroundColor:'var(--navy)', padding:'64px 20px 40px' }}>
        <div style={{ maxWidth:'960px', margin:'0 auto' }}>
          <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:'10px' }}>مركز الدعم</p>
          <h1 style={{ fontWeight:800, fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--white)', lineHeight:1, margin:'0 0 12px', letterSpacing:'-0.02em' }}>تواصل معنا</h1>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.55)', fontWeight:400 }}>متوسط وقت الرد: أقل من ساعتين</p>
        </div>
      </div>

      <div style={{ maxWidth:'960px', margin:'0 auto', padding:'32px 20px 80px' }}>
        <div className="contact-g">
          {/* Info */}
          <div>
            <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', padding:'24px', marginBottom:'12px' }}>
              <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'16px' }}>طرق التواصل</p>
              {[
                { icon:'📧', label:'البريد الإلكتروني', val:'support@store.dz', href:'mailto:support@store.dz' },
                { icon:'📞', label:'الهاتف', val:'+213 550 000 000', href:'tel:+213550000000' },
                { icon:'📍', label:'المكتب', val:'Algiers, Algeria', href:undefined },
              ].map(item=>(
                <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'13px 0', borderBottom:'1px solid var(--line)', textDecoration:'none' }}>
                  <div style={{ width:'38px', height:'38px', borderRadius:'8px', backgroundColor:'var(--off)', border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', margin:'0 0 2px' }}>{item.label}</p>
                    <p style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)', margin:0 }}>{item.val}</p>
                  </div>
                  {item.href && <ArrowRight style={{ width:'13px', height:'13px', color:'var(--dim)', marginLeft:'auto' }}/>}
                </a>
              ))}
            </div>

            {/* وقت الرد widget */}
            <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', padding:'18px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor:'#22C55E' }}/>
                <span style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)' }}>الدعم متاح</span>
              </div>
              {[
                { label:'وقت الرد', val:'&lt; 2 hours' },
                { label:'معدل الرضا', val:'98.7%' },
              ].map(s=>(
                <div key={s.label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderTop:'1px solid var(--line)' }}>
                  <span style={{ fontSize:'12px', color:'var(--mid)' }}>{s.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:600, color:'var(--ink)' }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ background:'var(--white)', border:'1px solid var(--line)', borderRadius:'12px', padding:'24px' }}>
            <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'20px' }}>أرسل رسالة</p>
            {sent ? (
              <div style={{ minHeight:'240px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backgroundColor:'var(--off)', borderRadius:'10px', textAlign:'center', padding:'32px' }}>
                <CheckCircle2 style={{ width:'36px', height:'36px', color:'#22C55E', marginBottom:'12px' }}/>
                <h3 style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--ink)', margin:'0 0 6px' }}>تم الإرسال!</h3>
                <p style={{ fontSize:'13px', color:'var(--mid)', fontWeight:400 }}>We will get back to you within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[
                  { label:'اسمك', type:'text',  key:'name',  ph:'الاسم الكامل' },
                  { label:'البريد الإلكتروني',     type:'email', key:'email', ph:'your@email.com' },
                ].map(f=>(
                  <div key={f.key}>
                    <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>{f.label}</p>
                    <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required className="inp"
                      onFocus={e=>{e.target.style.borderColor='var(--blue)';}} onBlur={e=>{e.target.style.borderColor='var(--line)';}}/>
                  </div>
                ))}
                <div>
                  <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>Message</p>
                  <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp"
                    style={{ resize:'none' as any }}
                    onFocus={e=>{e.target.style.borderColor='var(--blue)';}} onBlur={e=>{e.target.style.borderColor='var(--line)';}}/>
                </div>
                <button type="submit" className="btn btn-blue" style={{ justifyContent:'center', width:'100%', padding:'12px', fontSize:'14px', borderRadius:'8px' }}>
                  Send Message <ArrowRight style={{ width:'14px', height:'14px' }}/>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}