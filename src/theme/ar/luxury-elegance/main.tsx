'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Share2, Phone, User, ToggleRight,
  Shield, ArrowRight, Plus, Minus, CheckCircle2, Lock, Menu,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

  :root {
    --black:   #0A0A08;
    --black-2: #111110;
    --black-3: #1A1A18;
    --white:   #FAF8F3;
    --cream:   #F0EBE0;
    --gold:    #C9A84C;
    --gold-lt: #E2C47A;
    --gold-dk: #A8863A;
    --mid:     #888880;
    --dim:     #555550;
    --line:    rgba(201,168,76,0.2);
    --line-w:  rgba(250,248,243,0.1);
  }

  body { background:var(--black); color:var(--white); font-family:'Montserrat',sans-serif; }
  ::-webkit-scrollbar { width:2px; }
  ::-webkit-scrollbar-thumb { background:var(--gold); }

  .gold-line { display:block; width:40px; height:1px; background:linear-gradient(to right,transparent,var(--gold),transparent); }
  .serif { font-family:'Cormorant Garamond',serif; }
  .slabel { font-size:10px; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:var(--gold); font-family:'Montserrat',sans-serif; }

  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  .gold-shimmer {
    background:linear-gradient(90deg,var(--gold-dk) 0%,var(--gold-lt) 40%,var(--gold-dk) 60%,var(--gold) 100%);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    animation:shimmer 4s linear infinite;
  }

  @keyframes fade-up { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  .fu   { animation:fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay:0.1s; }
  .fu-2 { animation-delay:0.22s; }
  .fu-3 { animation-delay:0.38s; }

  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  .lux-card { transition:transform 0.5s cubic-bezier(0.22,1,0.36,1); }
  .lux-card:hover { transform:translateY(-6px); }
  .lux-card:hover .card-img img { transform:scale(1.06); }
  .card-img img { transition:transform 0.7s cubic-bezier(0.22,1,0.36,1); display:block; width:100%; height:100%; object-fit:cover; }

  .btn-gold {
    display:inline-flex; align-items:center; gap:9px;
    background:linear-gradient(135deg,var(--gold-dk) 0%,var(--gold) 50%,var(--gold-dk) 100%);
    background-size:200% auto;
    color:var(--black); font-family:'Montserrat',sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.18em; text-transform:uppercase; padding:14px 32px;
    border:none; cursor:pointer; text-decoration:none;
    transition:background-position 0.5s, transform 0.3s, box-shadow 0.3s;
  }
  .btn-gold:hover { background-position:right center; transform:translateY(-2px); box-shadow:0 8px 32px rgba(201,168,76,0.35); }

  .btn-ghost-gold {
    display:inline-flex; align-items:center; gap:9px;
    background:transparent; color:var(--gold);
    font-family:'Montserrat',sans-serif; font-size:11px; font-weight:500;
    letter-spacing:0.18em; text-transform:uppercase; padding:13px 30px;
    border:1px solid var(--gold); cursor:pointer; text-decoration:none; transition:all 0.3s;
  }
  .btn-ghost-gold:hover { background:rgba(201,168,76,0.08); transform:translateY(-1px); }

  .inp {
    width:100%; padding:13px 16px;
    background:var(--black-3); border:1px solid var(--line);
    font-family:'Montserrat',sans-serif; font-size:12px; color:var(--white);
    outline:none; transition:border-color 0.3s, box-shadow 0.3s; letter-spacing:0.04em;
  }
  .inp:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,168,76,0.08); }
  .inp::placeholder { color:var(--dim); }
  .inp-err { border-color:#C0392B !important; }
  select.inp { appearance:none; cursor:pointer; }

  .ornament { color:var(--gold); opacity:0.4; font-family:'Cormorant Garamond',serif; font-size:1.4rem; line-height:1; }

  /* Responsive */
  .nav-links   { display:flex; align-items:center; gap:36px; }
  .nav-toggle  { display:none; }
  .hero-grid   { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
  .featured-g  { display:grid; grid-template-columns:1fr 1fr; min-height:70vh; }
  .prod-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; }
  .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:60px; }
  .details-grid{ display:grid; grid-template-columns:1fr 1fr; }
  .details-L   { position:sticky; top:70px; height:calc(100vh - 70px); overflow:hidden; }
  .details-R   { padding:48px 48px 80px; overflow-y:auto; background:var(--black-2); }
  .contact-g   { display:grid; grid-template-columns:1fr 1fr; gap:56px; }
  .form-2c     { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .dlv-2c      { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

  @media (max-width:1024px) {
    .prod-grid   { grid-template-columns:repeat(2,1fr); }
    .footer-grid { grid-template-columns:1fr 1fr; gap:40px; }
  }
  @media (max-width:768px) {
    .nav-links   { display:none; }
    .nav-toggle  { display:flex; }
    .hero-grid   { grid-template-columns:1fr; min-height:auto; }
    .featured-g  { grid-template-columns:1fr; min-height:auto; }
    .prod-grid   { grid-template-columns:repeat(2,1fr); }
    .footer-grid { grid-template-columns:1fr 1fr; gap:32px; }
    .details-grid{ grid-template-columns:1fr; }
    .details-L   { position:static; height:70vw; min-height:280px; }
    .details-R   { padding:28px 20px 48px; }
    .contact-g   { grid-template-columns:1fr; gap:36px; }
  }
  @media (max-width:480px) {
    .prod-grid   { grid-template-columns:repeat(2,1fr); }
    .footer-grid { grid-template-columns:1fr; }
    .form-2c     { grid-template-columns:1fr; }
    .dlv-2c      { grid-template-columns:1fr; }
  }
`;

/* ── TYPES ──────────────────────────────────────────────────── */
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

/* ── SVG ────────────────────────────────────────────────────── */
function GoldDiamond() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L13 7L7 13L1 7Z" stroke="var(--gold)" strokeWidth="1" fill="none"/>
      <path d="M7 4L10 7L7 10L4 7Z" fill="var(--gold)" opacity="0.5"/>
    </svg>
  );
}

function GoldBorderCorners({ children, style }: { children:React.ReactNode; style?:React.CSSProperties }) {
  const s:React.CSSProperties = { position:'absolute', width:'16px', height:'16px' };
  const b = '1px solid var(--gold)';
  return (
    <div style={{ position:'relative', ...style }}>
      <span style={{ ...s, top:0, left:0, borderTop:b, borderLeft:b }}/>
      <span style={{ ...s, top:0, right:0, borderTop:b, borderRight:b }}/>
      <span style={{ ...s, bottom:0, left:0, borderBottom:b, borderLeft:b }}/>
      <span style={{ ...s, bottom:0, right:0, borderBottom:b, borderRight:b }}/>
      {children}
    </div>
  );
}

/* ── MAIN ───────────────────────────────────────────────────── */
export default function Main({ store, children }: any) {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--black)' }}>
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
    const h=()=>setScrolled(window.scrollY>60);
    window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h);
  },[]);

  const links = [
    { href:`/`,         label:'المجموعة'  },
    { href:`/contact`, label:'تواصل'     },
    { href:`/Privacy`, label:'الخصوصية'  },
  ];

  return (
    <nav dir="rtl" style={{
      position:'fixed', top:0, left:0, right:0, zIndex:50,
      backgroundColor:scrolled?'rgba(10,10,8,0.97)':'transparent',
      backdropFilter:scrolled?'blur(20px)':'none',
      borderBottom:scrolled?'1px solid var(--line)':'none',
      transition:'all 0.4s ease',
    }}>
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ backgroundColor:'var(--gold)', overflow:'hidden', whiteSpace:'nowrap', padding:'7px 0' }}>
          <div style={{ display:'inline-block', animation:'ticker 26s linear infinite' }}>
            {Array(12).fill(null).map((_,i)=>(
              <span key={i} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'10px', fontWeight:600, letterSpacing:'0.22em', color:'var(--black)', margin:'0 40px', textTransform:'uppercase' }}>
                ✦ {store.topBar.text}
              </span>
            ))}
            {Array(12).fill(null).map((_,i)=>(
              <span key={`b${i}`} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'10px', fontWeight:600, letterSpacing:'0.22em', color:'var(--black)', margin:'0 40px', textTransform:'uppercase' }}>
                ✦ {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 32px', height:'70px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href={`/`} style={{ textDecoration:'none', flexShrink:0 }}>
          {store.design?.logoUrl
            ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'28px', width:'auto', objectFit:'contain' }}/>
            : (
              <div style={{ textAlign:'center' }}>
                <span className="serif gold-shimmer" style={{ fontSize:'1.5rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', display:'block' }}>
                  {store.name}
                </span>
                <span style={{ display:'flex', justifyContent:'center', gap:'6px', alignItems:'center', marginTop:'2px' }}>
                  <span style={{ display:'block', height:'1px', width:'24px', background:'linear-gradient(to right,transparent,var(--gold))' }}/>
                  <GoldDiamond/>
                  <span style={{ display:'block', height:'1px', width:'24px', background:'linear-gradient(to left,transparent,var(--gold))' }}/>
                </span>
              </div>
            )
          }
        </Link>

        <div className="nav-links">
          {links.map(l=>(
            <Link key={l.href} href={l.href}
              style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'10px', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(250,248,243,0.55)', textDecoration:'none', transition:'color 0.3s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(250,248,243,0.55)';}}>
              {l.label}
            </Link>
          ))}
          <a href="#collection" className="btn-ghost-gold" style={{ padding:'10px 24px' }}>اكتشف</a>
        </div>

        <button className="nav-toggle" onClick={()=>setOpen(p=>!p)} style={{ background:'none', border:'1px solid var(--line)', cursor:'pointer', color:'var(--gold)', padding:'8px', alignItems:'center', justifyContent:'center' }}>
          {open ? <X style={{ width:'18px', height:'18px' }}/> : <Menu style={{ width:'18px', height:'18px' }}/>}
        </button>
      </div>

      <div style={{ maxHeight:open?'240px':'0', overflow:'hidden', transition:'max-height 0.35s ease', borderTop:open?'1px solid var(--line)':'none', backgroundColor:'rgba(10,10,8,0.98)' }}>
        <div style={{ padding:'12px 32px 20px' }}>
          {links.map(l=>(
            <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', fontSize:'10px', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(250,248,243,0.55)', textDecoration:'none', borderBottom:'1px solid var(--line)' }}>
              {l.label} <ArrowRight style={{ width:'13px', height:'13px', color:'var(--gold)' }}/>
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
  return (
    <footer dir="rtl" style={{ backgroundColor:'var(--black)', borderTop:'1px solid var(--line)', fontFamily:"'Montserrat',sans-serif" }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'72px 32px 48px' }}>
        <div className="footer-grid" style={{ paddingBottom:'48px', borderBottom:'1px solid var(--line)' }}>
          <div>
            <div style={{ marginBottom:'24px' }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'24px', filter:'brightness(0) saturate(100%) invert(73%) sepia(55%) saturate(400%) hue-rotate(10deg)', opacity:0.9 }}/>
                : <span className="serif gold-shimmer" style={{ fontSize:'1.5rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>{store.name}</span>
              }
            </div>
            <p style={{ fontSize:'12px', lineHeight:'2', color:'var(--dim)', maxWidth:'240px', fontWeight:300, letterSpacing:'0.04em' }}>
              منتجات فاخرة مختارة بعناية فائقة لأرقى الأذواق.
            </p>
            <div style={{ marginTop:'24px', display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ display:'block', width:'24px', height:'1px', background:'var(--gold)', opacity:0.4 }}/>
              <GoldDiamond/>
              <span style={{ display:'block', width:'24px', height:'1px', background:'var(--gold)', opacity:0.4 }}/>
            </div>
          </div>

          {[
            { title:'روابط', links:[
              [`/Privacy`, 'الخصوصية'],
              [`/Terms`,   'الشروط'],
              [`/Cookies`, 'الكوكيز'],
              [`/contact`, 'تواصل'],
            ]},
            { title:'الأتيليه', links:[
              ['#', '+213 550 000 000'],
              ['#', 'الجزائر، الجزائر'],
              ['#', 'luxury@store.dz'],
            ]},
          ].map(col=>(
            <div key={col.title}>
              <p className="slabel" style={{ marginBottom:'20px' }}>{col.title}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {col.links.map(([href,label])=>(
                  <a key={label} href={href} style={{ fontSize:'12px', color:'var(--dim)', textDecoration:'none', letterSpacing:'0.06em', fontWeight:300, transition:'color 0.3s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--dim)';}}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop:'24px', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
          <p style={{ fontSize:'11px', color:'var(--dim)', letterSpacing:'0.08em' }}>© {yr} {store.name.toUpperCase()}. جميع الحقوق محفوظة.</p>
          <p style={{ fontSize:'11px', color:'var(--dim)', letterSpacing:'0.08em' }}>ثيم الأناقة الفاخرة</p>
        </div>
      </div>
    </footer>
  );
}

/* ── CARD ───────────────────────────────────────────────────── */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [hov, setHov] = useState(false);
  const price = typeof product.price==='string' ? parseFloat(product.price) : product.price as number;
  return (
    <div className="lux-card" style={{ position:'relative', backgroundColor:'var(--black-2)', overflow:'hidden' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>

      <div className="card-img" style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden', backgroundColor:'var(--black-3)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,var(--black-3),var(--black-2))' }}>
              <span className="ornament" style={{ fontSize:'3rem', opacity:0.2 }}>✦</span>
            </div>
        }
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(10,10,8,0.95) 0%, rgba(10,10,8,0.3) 50%, transparent 75%)', pointerEvents:'none' }}/>

        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', opacity:hov?1:0, transition:'opacity 0.4s', background:'rgba(10,10,8,0.55)', backdropFilter:hov?'blur(2px)':'none' }}>
          <Link href={`/product/${product.slug||product.id}`}
            className="btn-ghost-gold" style={{ padding:'11px 26px', fontSize:'10px', textDecoration:'none' }}>
            {viewDetails} <ArrowRight style={{ width:'12px', height:'12px' }}/>
          </Link>
        </div>

        {discount>0 && (
          <div style={{ position:'absolute', top:'14px', right:'14px', backgroundColor:'var(--gold)', color:'var(--black)', fontSize:'10px', fontWeight:700, padding:'4px 10px', letterSpacing:'0.1em' }}>
            -{discount}%
          </div>
        )}

        {hov && (
          <>
            <span style={{ position:'absolute', top:'10px', left:'10px', width:'14px', height:'14px', borderTop:'1px solid var(--gold)', borderLeft:'1px solid var(--gold)', pointerEvents:'none' }}/>
            <span style={{ position:'absolute', top:'10px', right:'10px', width:'14px', height:'14px', borderTop:'1px solid var(--gold)', borderRight:'1px solid var(--gold)', pointerEvents:'none' }}/>
            <span style={{ position:'absolute', bottom:'10px', left:'10px', width:'14px', height:'14px', borderBottom:'1px solid var(--gold)', borderLeft:'1px solid var(--gold)', pointerEvents:'none' }}/>
            <span style={{ position:'absolute', bottom:'10px', right:'10px', width:'14px', height:'14px', borderBottom:'1px solid var(--gold)', borderRight:'1px solid var(--gold)', pointerEvents:'none' }}/>
          </>
        )}

        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'16px' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
            <span className="serif" style={{ fontSize:'1.6rem', fontWeight:600, color:'var(--gold)', letterSpacing:'-0.01em', lineHeight:1 }}>
              {price.toLocaleString()}
            </span>
            <span style={{ fontSize:'11px', color:'var(--gold)', opacity:0.7, fontWeight:300 }}>دج</span>
            {product.priceOriginal && parseFloat(String(product.priceOriginal))>price && (
              <span style={{ fontSize:'11px', color:'var(--dim)', textDecoration:'line-through' }}>
                {parseFloat(String(product.priceOriginal)).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 16px', borderTop:'1px solid var(--line)' }}>
        <h3 className="serif" style={{ fontSize:'1.1rem', fontWeight:400, fontStyle:'italic', color:'var(--white)', lineHeight:1.3, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display:'flex', gap:'2px', marginTop:'8px' }}>
          {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'10px', height:'10px', fill:i<4?'var(--gold)':'none', color:'var(--gold)' }}/>)}
        </div>
      </div>
    </div>
  );
}

/* ── HOME ───────────────────────────────────────────────────── */
export function Home({ store }: any) {
  const products: any[] = store.products || [];
  const featured = products[0];

  return (
    <div dir="rtl" style={{ paddingTop:'70px' }}>

      {/* HERO */}
      <section className="hero-grid" style={{ backgroundColor:'var(--black)', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'relative', overflow:'hidden', minHeight:'600px', backgroundColor:'var(--black-3)' }}>
          {store.hero?.imageUrl
            ? <img src={store.hero.imageUrl} alt={store.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter:'brightness(0.7) contrast(1.1)' }}/>
            : (
              <div style={{ width:'100%', height:'100%', minHeight:'600px', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#1A1814 0%,#0F0E0B 100%)', position:'relative' }}>
                <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'repeating-linear-gradient(45deg, var(--gold) 0px, var(--gold) 1px, transparent 0px, transparent 60px), repeating-linear-gradient(-45deg, var(--gold) 0px, var(--gold) 1px, transparent 0px, transparent 60px)' }}/>
                <span className="serif" style={{ fontSize:'clamp(6rem,20vw,18rem)', color:'var(--gold)', opacity:0.06, fontStyle:'italic', userSelect:'none', lineHeight:1 }}>✦</span>
              </div>
            )
          }
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to left, transparent 55%, var(--black) 100%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'3px', background:'linear-gradient(to right, transparent, var(--gold), transparent)' }}/>
        </div>

        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'8vw 6vw', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, opacity:0.03, backgroundImage:'repeating-linear-gradient(0deg,var(--gold) 0px,var(--gold) 1px,transparent 0px,transparent 40px)', pointerEvents:'none' }}/>
          <div style={{ position:'relative', zIndex:2 }}>
            <div className="fu" style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
              <GoldDiamond/>
              <span className="slabel">المجموعة الحصرية</span>
              <GoldDiamond/>
            </div>

            <h1 className="fu fu-1 serif" style={{ fontSize:'clamp(2.8rem,7vw,6.5rem)', fontWeight:300, fontStyle:'italic', color:'var(--white)', lineHeight:0.9, letterSpacing:'-0.02em', marginBottom:'24px' }}>
              {store.hero?.title || <><span>فخامة</span><br/><span style={{ color:'var(--gold)' }}>لا مثيل لها</span></>}
            </h1>

            <div className="fu fu-2" style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px' }}>
              <span style={{ display:'block', flex:1, height:'1px', maxWidth:'60px', background:'linear-gradient(to right,var(--gold),transparent)' }}/>
            </div>

            <p className="fu fu-2" style={{ fontSize:'14px', lineHeight:'1.9', color:'var(--dim)', marginBottom:'40px', maxWidth:'380px', fontWeight:300, letterSpacing:'0.05em' }}>
              {store.hero?.subtitle || 'أرقى المنتجات الفاخرة، مختارة لك بعناية فائقة.'}
            </p>

            <div className="fu fu-3" style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
              <a href="#collection" className="btn-gold">اكتشف المجموعة <ArrowRight style={{ width:'14px', height:'14px' }}/></a>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', marginTop:'56px', border:'1px solid var(--line)', backgroundColor:'var(--line)' }}>
              {[
                { n:`${products.length||'∞'}`, l:'قطعة' },
                { n:'100%', l:'فاخر' },
                { n:'48H',  l:'توصيل' },
              ].map((s,i)=>(
                <div key={i} style={{ padding:'18px 12px', backgroundColor:'var(--black)', textAlign:'center' }}>
                  <p className="serif" style={{ fontSize:'2rem', fontWeight:600, color:'var(--gold)', lineHeight:1, margin:0, letterSpacing:'-0.01em' }}>{s.n}</p>
                  <p style={{ fontSize:'10px', letterSpacing:'0.18em', color:'var(--dim)', margin:'6px 0 0', textTransform:'uppercase', fontWeight:300 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROMISE STRIP */}
      <div style={{ borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)', backgroundColor:'var(--black-2)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 32px' }}>
          <div style={{ display:'flex', justifyContent:'center', gap:'0', flexWrap:'wrap' }}>
            {[
              { icon:'◆', text:'جودة استثنائية' },
              { icon:'◆', text:'توصيل موثوق' },
              { icon:'◆', text:'أصالة مضمونة' },
            ].map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'20px 40px', borderLeft:i>0?'1px solid var(--line)':'none', flexWrap:'wrap', justifyContent:'center' }}>
                <span style={{ color:'var(--gold)', fontSize:'8px' }}>{item.icon}</span>
                <span style={{ fontSize:'11px', fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--dim)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURED */}
      {featured && (
        <section style={{ backgroundColor:'var(--black)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'80px 32px' }}>
            <div style={{ textAlign:'center', marginBottom:'48px' }}>
              <span className="slabel">القطعة المميزة</span>
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'16px', marginTop:'10px' }}>
                <span style={{ display:'block', height:'1px', width:'48px', background:'linear-gradient(to right,transparent,var(--gold))' }}/>
                <GoldDiamond/>
                <span style={{ display:'block', height:'1px', width:'48px', background:'linear-gradient(to left,transparent,var(--gold))' }}/>
              </div>
            </div>

            <div className="featured-g" style={{ border:'1px solid var(--line)', overflow:'hidden' }}>
              <div style={{ position:'relative', overflow:'hidden', minHeight:'500px', backgroundColor:'var(--black-3)' }}>
                {(featured.productImage||featured.imagesProduct?.[0]?.imageUrl)
                  ? <img src={featured.productImage||featured.imagesProduct?.[0]?.imageUrl} alt={featured.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                  : <div style={{ width:'100%', height:'100%', minHeight:'500px', display:'flex', alignItems:'center', justifyContent:'center' }}><span className="ornament" style={{ fontSize:'4rem' }}>✦</span></div>
                }
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to left, transparent 60%, var(--black) 100%)', pointerEvents:'none' }}/>
              </div>
              <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'56px 48px', backgroundColor:'var(--black)' }}>
                <span className="slabel" style={{ marginBottom:'16px' }}>قطعة مختارة</span>
                <h2 className="serif" style={{ fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:300, fontStyle:'italic', color:'var(--white)', lineHeight:0.95, marginBottom:'16px', letterSpacing:'-0.01em' }}>
                  {featured.name}
                </h2>
                <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'28px' }}>
                  <span style={{ display:'block', width:'40px', height:'1px', background:'linear-gradient(to right,var(--gold),transparent)' }}/>
                  <span className="serif" style={{ fontSize:'2rem', fontWeight:600, color:'var(--gold)', letterSpacing:'-0.01em' }}>
                    {(typeof featured.price==='string'?parseFloat(featured.price):featured.price as number).toLocaleString()}
                    <span style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:'13px', marginRight:'5px', opacity:0.7 }}>دج</span>
                  </span>
                </div>
                {featured.desc && (
                  <p style={{ fontSize:'13px', lineHeight:'1.9', color:'var(--dim)', fontWeight:300, marginBottom:'32px', letterSpacing:'0.04em', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
                    {featured.desc.replace(/<[^>]*>/g, '')}
                  </p>
                )}
                <Link href={`/product/${featured.slug||featured.id}`} className="btn-gold" style={{ textDecoration:'none', alignSelf:'flex-start' }}>
                  اكتشف القطعة <ArrowRight style={{ width:'13px', height:'13px' }}/>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* COLLECTION GRID */}
      <section id="collection" style={{ backgroundColor:'var(--black-2)', padding:'80px 0' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 32px' }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <span className="slabel">المجموعة</span>
            <h2 className="serif" style={{ fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:300, fontStyle:'italic', color:'var(--white)', margin:'10px 0 0', letterSpacing:'-0.01em' }}>
              المجموعة الكاملة
            </h2>
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'16px', marginTop:'16px' }}>
              <span style={{ display:'block', height:'1px', width:'48px', background:'linear-gradient(to right,transparent,var(--gold))' }}/>
              <GoldDiamond/>
              <span style={{ display:'block', height:'1px', width:'48px', background:'linear-gradient(to left,transparent,var(--gold))' }}/>
            </div>
          </div>

          {products.length===0 ? (
            <GoldBorderCorners style={{ maxWidth:'480px', margin:'0 auto', padding:'80px 40px', textAlign:'center' }}>
              <span className="serif" style={{ fontSize:'1.6rem', fontStyle:'italic', color:'var(--dim)' }}>المجموعة قادمة قريباً</span>
            </GoldBorderCorners>
          ) : (
            <div className="prod-grid">
              {products.map((p:any)=>{
                const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="اكتشف"/>;
              })}
            </div>
          )}
        </div>
      </section>

      {/* CRAFTSMANSHIP BANNER */}
      <section style={{ backgroundColor:'var(--black)', padding:'96px 32px', position:'relative', overflow:'hidden', textAlign:'center' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:'repeating-linear-gradient(45deg,var(--gold) 0,var(--gold) 1px,transparent 0,transparent 60px),repeating-linear-gradient(-45deg,var(--gold) 0,var(--gold) 1px,transparent 0,transparent 60px)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:2, maxWidth:'640px', margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'16px', marginBottom:'24px' }}>
            <span style={{ display:'block', height:'1px', width:'56px', background:'linear-gradient(to right,transparent,var(--gold))' }}/>
            <GoldDiamond/>
            <span style={{ display:'block', height:'1px', width:'56px', background:'linear-gradient(to left,transparent,var(--gold))' }}/>
          </div>
          <h2 className="serif" style={{ fontSize:'clamp(2rem,5vw,4rem)', fontWeight:300, fontStyle:'italic', color:'var(--white)', lineHeight:1.05, marginBottom:'20px' }}>
            صُنع بإتقان
          </h2>
          <p style={{ fontSize:'13px', lineHeight:'2', color:'var(--dim)', fontWeight:300, letterSpacing:'0.06em', marginBottom:'36px' }}>
            كل قطعة مختارة بعناية فائقة لتعكس معايير الجودة والفخامة التي تستحقها.
          </p>
          <a href="#collection" className="btn-ghost-gold">استكشف المجموعة</a>
        </div>
      </section>
    </div>
  );
}

/* ── DETAILS ────────────────────────────────────────────────── */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [sel, setSel] = useState(0);

  return (
    <div dir="rtl" style={{ backgroundColor:'var(--black)', paddingTop:'70px' }}>
      <div style={{ borderBottom:'1px solid var(--line)', padding:'13px 32px', display:'flex', alignItems:'center', gap:'10px', fontSize:'10px', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--dim)' }}>
        <Link href="/" style={{ textDecoration:'none', color:'var(--dim)', transition:'color 0.3s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--dim)';}}>
          الرئيسية
        </Link>
        <GoldDiamond/>
        <span style={{ color:'var(--gold)' }}>{product.name.slice(0,40)}</span>
        <div style={{ marginRight:'auto', display:'flex', gap:'8px' }}>
          <button onClick={toggleWishlist} style={{ width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isWishlisted?'var(--gold)':'var(--line)'}`, background:isWishlisted?'rgba(201,168,76,0.1)':'transparent', cursor:'pointer', color:isWishlisted?'var(--gold)':'var(--dim)', transition:'all 0.3s' }}>
            <Heart style={{ width:'13px', height:'13px', fill:isWishlisted?'currentColor':'none' }}/>
          </button>
          <button onClick={handleShare} style={{ width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--dim)', transition:'all 0.3s' }}>
            <Share2 style={{ width:'13px', height:'13px' }}/>
          </button>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-L" style={{ backgroundColor:'var(--black-3)' }}>
          <div style={{ position:'relative', width:'100%', height:'100%' }}>
            {allImages.length>0
              ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span className="ornament" style={{ fontSize:'5rem' }}>✦</span>
                </div>
            }
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(10,10,8,0.7) 0%, transparent 40%)', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:'linear-gradient(to right,transparent,var(--gold),transparent)' }}/>
            {discount>0 && <div style={{ position:'absolute', top:'16px', right:'16px', backgroundColor:'var(--gold)', color:'var(--black)', fontSize:'10px', fontWeight:700, padding:'5px 12px', letterSpacing:'0.12em' }}>-{discount}%</div>}
            {allImages.length>1 && (
              <>
                <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', border:'1px solid var(--line)', backgroundColor:'rgba(10,10,8,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)' }}>
                  <ChevronLeft style={{ width:'15px', height:'15px' }}/>
                </button>
                <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', border:'1px solid var(--line)', backgroundColor:'rgba(10,10,8,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)' }}>
                  <ChevronRight style={{ width:'15px', height:'15px' }}/>
                </button>
              </>
            )}
            {!inStock&&!autoGen && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(10,10,8,0.75)', backdropFilter:'blur(4px)' }}>
                <GoldBorderCorners style={{ padding:'24px 40px' }}>
                  <span className="serif" style={{ fontSize:'2rem', fontStyle:'italic', color:'var(--gold)' }}>نفد المخزون</span>
                </GoldBorderCorners>
              </div>
            )}
            {allImages.length>1 && (
              <div style={{ position:'absolute', bottom:'16px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'6px' }}>
                {allImages.slice(0,5).map((_:string,idx:number)=>(
                  <button key={idx} onClick={()=>setSel(idx)} style={{ width:'32px', height:'4px', border:'none', cursor:'pointer', backgroundColor:sel===idx?'var(--gold)':'rgba(250,248,243,0.25)', transition:'all 0.3s', padding:0 }}/>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="details-R">
          <span className="slabel" style={{ display:'block', marginBottom:'14px' }}>قطعة فاخرة</span>
          <h1 className="serif" style={{ fontSize:'clamp(1.8rem,4vw,3.2rem)', fontWeight:300, fontStyle:'italic', color:'var(--white)', lineHeight:0.95, marginBottom:'16px', letterSpacing:'-0.01em' }}>
            {product.name}
          </h1>

          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px', paddingBottom:'24px', borderBottom:'1px solid var(--line)' }}>
            <span style={{ display:'block', width:'32px', height:'1px', background:'linear-gradient(to right,var(--gold),transparent)' }}/>
            <div style={{ display:'flex', gap:'2px' }}>
              {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'11px', height:'11px', fill:i<4?'var(--gold)':'none', color:'var(--gold)' }}/>)}
            </div>
            <span style={{ fontSize:'11px', color:'var(--dim)', letterSpacing:'0.08em' }}>4.8</span>
            <span style={{ marginRight:'auto', padding:'5px 14px', border:`1px solid ${inStock||autoGen?'var(--gold)':'var(--dim)'}`, color:inStock||autoGen?'var(--gold)':'var(--dim)', fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase' }}>
              {autoGen?'∞':inStock?'متوفر':'نفد'}
            </span>
          </div>

          <div style={{ marginBottom:'28px' }}>
            <span style={{ fontSize:'10px', letterSpacing:'0.18em', color:'var(--dim)', textTransform:'uppercase', display:'block', marginBottom:'8px' }}>السعر</span>
            <div style={{ display:'flex', alignItems:'baseline', gap:'12px', flexWrap:'wrap' }}>
              <span className="serif gold-shimmer" style={{ fontSize:'3rem', fontWeight:600, lineHeight:1, letterSpacing:'-0.02em' }}>
                {finalPrice.toLocaleString()}
              </span>
              <span style={{ fontSize:'14px', color:'var(--gold)', opacity:0.7 }}>دج</span>
              {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                <span style={{ fontSize:'14px', textDecoration:'line-through', color:'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
              )}
            </div>
          </div>

          {product.offers?.length>0 && (
            <div style={{ marginBottom:'24px', paddingBottom:'24px', borderBottom:'1px solid var(--line)' }}>
              <span className="slabel" style={{ display:'block', marginBottom:'12px' }}>الباقات</span>
              {product.offers.map((offer:any)=>(
                <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', border:`1px solid ${selectedOffer===offer.id?'var(--gold)':'var(--line)'}`, cursor:'pointer', marginBottom:'8px', transition:'all 0.3s', backgroundColor:selectedOffer===offer.id?'rgba(201,168,76,0.05)':'transparent' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'16px', height:'16px', border:`1px solid ${selectedOffer===offer.id?'var(--gold)':'var(--dim)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {selectedOffer===offer.id&&<div style={{ width:'8px', height:'8px', background:'var(--gold)' }}/>}
                    </div>
                    <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                    <div>
                      <p style={{ fontSize:'12px', fontWeight:500, color:'var(--white)', margin:0 }}>{offer.name}</p>
                      <p style={{ fontSize:'10px', color:'var(--dim)', margin:0, letterSpacing:'0.1em' }}>الكمية: {offer.quantity}</p>
                    </div>
                  </div>
                  <span className="serif" style={{ fontSize:'1.3rem', fontWeight:600, color:'var(--gold)' }}>
                    {offer.price.toLocaleString()}
                    <span style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:'11px', marginRight:'4px', opacity:0.7 }}>دج</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{ marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid var(--line)' }}>
              <span className="slabel" style={{ display:'block', marginBottom:'10px' }}>{attr.name}</span>
              {attr.displayMode==='color' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'28px', height:'28px', backgroundColor:v.value, border:'none', cursor:'pointer', outline:s?'2px solid var(--gold)':'2px solid transparent', outlineOffset:'3px' }}/>;})}
                </div>
              ):attr.displayMode==='image' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`1px solid ${s?'var(--gold)':'var(--line)'}`, cursor:'pointer', padding:0 }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                </div>
              ):(
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ padding:'8px 16px', border:`1px solid ${s?'var(--gold)':'var(--line)'}`, backgroundColor:s?'rgba(201,168,76,0.1)':'transparent', color:s?'var(--gold)':'var(--dim)', fontSize:'11px', letterSpacing:'0.12em', cursor:'pointer', fontFamily:"'Montserrat',sans-serif", textTransform:'uppercase', transition:'all 0.2s' }}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{ marginTop:'32px', paddingTop:'28px', borderTop:'1px solid var(--line)' }}>
              <span className="slabel" style={{ display:'block', marginBottom:'14px' }}>تفاصيل القطعة</span>
              <div style={{ fontSize:'13px', lineHeight:'2', color:'var(--dim)', fontWeight:300, letterSpacing:'0.04em' }}
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
  <div style={{ marginBottom:'14px' }}>
    {label && <span style={{ display:'block', fontSize:'10px', fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--gold)', fontFamily:"'Montserrat',sans-serif", marginBottom:'7px' }}>{label}</span>}
    {children}
    {error && <p style={{ fontSize:'11px', color:'#C0392B', marginTop:'5px', display:'flex', alignItems:'center', gap:'4px', fontFamily:"'Montserrat',sans-serif" }}>
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
      await axios.post(`${API_URL}/orders/create`,{...fd,variantDetailId:   getVariantDetailId() ,productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()});
      if(typeof window!=='undefined'&&fd.customerId) localStorage.setItem('customerId',fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    }catch(err){console.error(err);}finally{setSub(false);}
  };

  return (
    <div style={{ marginTop:'28px', paddingTop:'24px', borderTop:'1px solid var(--line)' }}>
      <form onSubmit={handleSubmit}>
        <div className="form-2c">
          <FR error={errors.customerName} label="الاسم">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="الاسم الكامل"
                className={`inp${errors.customerName?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor=errors.customerName?'#C0392B':'var(--line)';}}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="الهاتف">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX"
                className={`inp${errors.customerPhone?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor=errors.customerPhone?'#C0392B':'var(--line)';}}/>
            </div>
          </FR>
        </div>
        <div className="form-2c">
          <FR error={errors.customerWelaya} label="الولاية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'13px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                className={`inp${errors.customerWelaya?' inp-err':''}`} style={{ paddingRight:'34px' }}
                onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor=errors.customerWelaya?'#C0392B':'var(--line)';}}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FR>
          <FR error={errors.customerCommune} label="البلدية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'13px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})}
                className={`inp${errors.customerCommune?' inp-err':''}`} style={{ paddingRight:'34px', opacity:!fd.customerWelaya?0.4:1 }}
                onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor=errors.customerCommune?'#C0392B':'var(--line)';}}>
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
                style={{ padding:'14px 12px', border:`1px solid ${fd.typeLivraison===type?'var(--gold)':'var(--line)'}`, backgroundColor:fd.typeLivraison===type?'rgba(201,168,76,0.05)':'transparent', cursor:'pointer', textAlign:'right', transition:'all 0.3s' }}>
                <p style={{ fontSize:'10px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:fd.typeLivraison===type?'var(--gold)':'var(--dim)', margin:'0 0 5px' }}>
                  {type==='home'?'توصيل للبيت':'توصيل للمكتب'}
                </p>
                {selW && <p className="serif" style={{ fontSize:'1.15rem', fontWeight:600, color:fd.typeLivraison===type?'var(--gold)':'var(--dim)', margin:0 }}>
                  {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()}
                  <span style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:'11px', marginRight:'4px', opacity:0.7 }}>دج</span>
                </p>}
              </button>
            ))}
          </div>
        </FR>

        <FR label="الكمية">
          <div style={{ display:'inline-flex', alignItems:'center', border:'1px solid var(--line)' }}>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              style={{ width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--gold)', transition:'background 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(201,168,76,0.06)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Minus style={{ width:'12px', height:'12px' }}/>
            </button>
            <span className="serif" style={{ width:'48px', textAlign:'center', fontSize:'1.2rem', fontWeight:600, color:'var(--white)', lineHeight:'38px', display:'inline-block' }}>{fd.quantity}</span>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))}
              style={{ width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--gold)', transition:'background 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(201,168,76,0.06)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Plus style={{ width:'12px', height:'12px' }}/>
            </button>
          </div>
        </FR>

        <div style={{ border:'1px solid var(--line)', marginBottom:'16px' }}>
          <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:'10px' }}>
            <GoldDiamond/>
            <span style={{ fontSize:'9px', fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--gold)', fontFamily:"'Montserrat',sans-serif" }}>ملخص الطلب</span>
          </div>
          {[
            { l:'المنتج', v:product.name.slice(0,22) },
            { l:'السعر',  v:`${fp.toLocaleString()} دج` },
            { l:'الكمية', v:`× ${fd.quantity}` },
            { l:'التوصيل',v:selW?`${getLiv().toLocaleString()} دج`:'—' },
          ].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 16px', borderBottom:'1px solid var(--line)' }}>
              <span style={{ fontSize:'11px', letterSpacing:'0.1em', color:'var(--dim)', textTransform:'uppercase' }}>{row.l}</span>
              <span style={{ fontSize:'12px', fontWeight:500, color:'var(--white)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'14px 16px', background:'rgba(201,168,76,0.04)' }}>
            <span style={{ fontSize:'11px', letterSpacing:'0.1em', color:'var(--dim)', textTransform:'uppercase' }}>المجموع</span>
            <span className="serif gold-shimmer" style={{ fontSize:'1.8rem', fontWeight:600, letterSpacing:'-0.01em' }}>
              {total().toLocaleString()} <span style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:'12px' }}>دج</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={sub} className="btn-gold"
          style={{ width:'100%', justifyContent:'center', fontSize:'11px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1 }}>
          {sub?'جاري المعالجة...':'تأكيد الطلب'} {!sub && <ArrowRight style={{ width:'13px', height:'13px' }}/>}
        </button>

        <p style={{ fontSize:'10px', letterSpacing:'0.12em', color:'var(--dim)', textAlign:'center', marginTop:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', textTransform:'uppercase' }}>
          <Lock style={{ width:'10px', height:'10px', color:'var(--gold)' }}/> دفع آمن ومشفر
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
  <div dir="rtl" style={{ backgroundColor:'var(--black)', minHeight:'100vh', paddingTop:'70px' }}>
    <div style={{ padding:'72px 32px 56px', borderBottom:'1px solid var(--line)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, opacity:0.03, backgroundImage:'repeating-linear-gradient(45deg,var(--gold) 0,var(--gold) 1px,transparent 0,transparent 60px),repeating-linear-gradient(-45deg,var(--gold) 0,var(--gold) 1px,transparent 0,transparent 60px)', pointerEvents:'none' }}/>
      <div style={{ maxWidth:'720px', margin:'0 auto', position:'relative', zIndex:2 }}>
        {sub && <span className="slabel" style={{ display:'block', marginBottom:'14px' }}>{sub}</span>}
        <h1 className="serif" style={{ fontSize:'clamp(2.4rem,6vw,5rem)', fontWeight:300, fontStyle:'italic', color:'var(--white)', lineHeight:0.95, margin:'0 0 16px' }}>{title}</h1>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ display:'block', height:'1px', width:'40px', background:'linear-gradient(to right,var(--gold),transparent)' }}/>
          <GoldDiamond/>
        </div>
      </div>
    </div>
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'48px 32px 96px' }}>{children}</div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{ paddingBottom:'22px', marginBottom:'22px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', gap:'20px', alignItems:'flex-start' }}>
    <div style={{ flex:1 }}>
      <h3 className="serif" style={{ fontSize:'1.15rem', fontWeight:400, fontStyle:'italic', color:'var(--white)', margin:'0 0 8px' }}>{title}</h3>
      <p style={{ fontSize:'13px', lineHeight:'1.9', color:'var(--dim)', fontWeight:300, letterSpacing:'0.04em', margin:0 }}>{body}</p>
    </div>
    {tag && <span className="slabel" style={{ fontSize:'9px', padding:'4px 10px', border:'1px solid var(--line)', color:'var(--gold)', flexShrink:0, marginTop:'2px' }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="قانوني">
      <IB title="البيانات التي نجمعها"  body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري فقط لمعالجة طلبك."/>
      <IB title="كيف نستخدمها"          body="حصرياً لتنفيذ وتوصيل مشترياتك. لا نستخدم بياناتك للتواصل غير المرغوب فيه."/>
      <IB title="الأمان"                 body="بياناتك محمية بتشفير على مستوى المؤسسات وبنية تحتية آمنة."/>
      <IB title="مشاركة البيانات"        body="لا نبيع البيانات الشخصية أبداً. تُشارك فقط مع شركاء التوصيل الموثوقين عند الحاجة."/>
      <p style={{ fontSize:'11px', letterSpacing:'0.1em', color:'var(--dim)', marginTop:'28px', textTransform:'uppercase' }}>آخر تحديث — فبراير 2026</p>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الاستخدام" sub="قانوني">
      <IB title="حسابك"            body="أنت مسؤول كلياً عن أمان بيانات تسجيل الدخول وكل النشاط الجاري تحت حسابك."/>
      <IB title="المدفوعات"        body="لا رسوم مخفية. السعر المعروض عند الدفع هو السعر الإجمالي النهائي."/>
      <IB title="الاستخدام المحظور" body="يُسمح فقط بالمنتجات الأصيلة والقانونية. المنتجات المقلدة محظورة تماماً." tag="صارم"/>
      <IB title="القانون الحاكم"   body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية."/>
      <div style={{ marginTop:'24px', padding:'16px 20px', border:'1px solid var(--line)', background:'rgba(201,168,76,0.03)', fontSize:'12px', color:'var(--dim)', lineHeight:'1.9', fontWeight:300, letterSpacing:'0.04em' }}>
        قد تُحدَّث هذه الشروط بصفة دورية. استمرارك في استخدام الخدمة يعني موافقتك على الشروط المحدَّثة.
      </div>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="سياسة الكوكيز" sub="قانوني">
      <IB title="الكوكيز الأساسية"    body="ضرورية لجلسات تسجيل الدخول والسلة وعملية الدفع. لا يمكن تعطيلها." tag="مطلوب"/>
      <IB title="كوكيز التفضيلات"     body="تحفظ إعدادات اللغة والمنطقة لتخصيص تجربتك." tag="اختياري"/>
      <IB title="كوكيز التحليلات"     body="بيانات مجمعة ومجهولة الهوية لمساعدتنا في تحسين المنصة." tag="اختياري"/>
      <div style={{ marginTop:'24px', padding:'16px 20px', border:'1px solid var(--line)', display:'flex', gap:'14px', alignItems:'flex-start' }}>
        <ToggleRight style={{ width:'18px', height:'18px', color:'var(--gold)', flexShrink:0, marginTop:'2px' }}/>
        <p style={{ fontSize:'13px', color:'var(--dim)', lineHeight:'1.9', fontWeight:300, letterSpacing:'0.04em', margin:0 }}>
          يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح. يُرجى العلم أن تعطيل الكوكيز الأساسية قد يؤثر على وظائف الموقع الأساسية.
        </p>
      </div>
    </Shell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [sent, setSent] = useState(false);
  return (
    <div dir="rtl" style={{ backgroundColor:'var(--black)', minHeight:'100vh', paddingTop:'70px' }}>
      <div style={{ padding:'72px 32px 56px', borderBottom:'1px solid var(--line)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.03, backgroundImage:'repeating-linear-gradient(45deg,var(--gold) 0,var(--gold) 1px,transparent 0,transparent 60px),repeating-linear-gradient(-45deg,var(--gold) 0,var(--gold) 1px,transparent 0,transparent 60px)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:'960px', margin:'0 auto', position:'relative', zIndex:2 }}>
          <span className="slabel" style={{ display:'block', marginBottom:'14px' }}>الأتيليه</span>
          <h1 className="serif" style={{ fontSize:'clamp(2.4rem,6vw,5rem)', fontWeight:300, fontStyle:'italic', color:'var(--white)', lineHeight:0.95, margin:'0 0 14px' }}>
            تواصل معنا.
          </h1>
          <p style={{ fontSize:'13px', letterSpacing:'0.1em', color:'var(--dim)', fontWeight:300, textTransform:'uppercase' }}>
            نرد خلال 24 ساعة.
          </p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth:'960px', margin:'0 auto', padding:'56px 32px 96px' }}>
        <div>
          <span className="slabel" style={{ display:'block', marginBottom:'24px' }}>طرق التواصل</span>
          {[
            { icon:'◈', label:'البريد الإلكتروني', val:'luxury@store.dz',  href:'mailto:luxury@store.dz' },
            { icon:'◈', label:'الهاتف',            val:'+213 550 000 000', href:'tel:+213550000000'      },
            { icon:'◈', label:'الأتيليه',          val:'الجزائر، الجزائر', href:undefined                },
          ].map(item=>(
            <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'16px', padding:'18px 0', borderBottom:'1px solid var(--line)', textDecoration:'none', transition:'padding-right 0.3s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.paddingRight='8px';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.paddingRight='0';}}>
              <span style={{ color:'var(--gold)', fontFamily:"'Cormorant Garamond',serif", fontSize:'1.4rem', lineHeight:1, flexShrink:0 }}>{item.icon}</span>
              <div>
                <span className="slabel" style={{ display:'block', fontSize:'9px', marginBottom:'3px' }}>{item.label}</span>
                <p style={{ fontSize:'13px', color:'var(--white)', fontWeight:400, margin:0, letterSpacing:'0.04em' }}>{item.val}</p>
              </div>
              {item.href && <ArrowRight style={{ width:'13px', height:'13px', color:'var(--gold)', marginRight:'auto', opacity:0.5 }}/>}
            </a>
          ))}

          <div style={{ marginTop:'32px', padding:'28px', border:'1px solid var(--line)', position:'relative', overflow:'hidden' }}>
            <span style={{ position:'absolute', top:0, right:0, width:'16px', height:'16px', borderTop:'1px solid var(--gold)', borderRight:'1px solid var(--gold)' }}/>
            <span style={{ position:'absolute', bottom:0, left:0, width:'16px', height:'16px', borderBottom:'1px solid var(--gold)', borderLeft:'1px solid var(--gold)' }}/>
            <p className="serif" style={{ fontSize:'1.3rem', fontWeight:300, fontStyle:'italic', color:'var(--white)', lineHeight:1.5, margin:'0 0 8px' }}>
              الفخامة في كل تفصيل.
            </p>
            <span className="slabel" style={{ fontSize:'9px', color:'var(--gold)' }}>الأتيليه الفاخر · الجزائر</span>
          </div>
        </div>

        <div>
          <span className="slabel" style={{ display:'block', marginBottom:'24px' }}>أرسل رسالة</span>
          {sent ? (
            <div style={{ minHeight:'280px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid var(--line)', textAlign:'center', padding:'40px', position:'relative' }}>
              <span style={{ position:'absolute', top:'12px', right:'12px', width:'14px', height:'14px', borderTop:'1px solid var(--gold)', borderRight:'1px solid var(--gold)' }}/>
              <span style={{ position:'absolute', bottom:'12px', left:'12px', width:'14px', height:'14px', borderBottom:'1px solid var(--gold)', borderLeft:'1px solid var(--gold)' }}/>
              <GoldDiamond/>
              <h3 className="serif" style={{ fontSize:'1.6rem', fontStyle:'italic', fontWeight:300, color:'var(--white)', margin:'16px 0 8px' }}>تم إرسال رسالتك.</h3>
              <p style={{ fontSize:'12px', letterSpacing:'0.1em', color:'var(--dim)', textTransform:'uppercase', fontWeight:300 }}>سنرد عليك خلال 24 ساعة.</p>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[
                { label:'اسمك', type:'text',  key:'name',  ph:'الاسم الكامل' },
                { label:'البريد الإلكتروني', type:'email', key:'email', ph:'بريدك@الإلكتروني.com' },
              ].map(f=>(
                <div key={f.key}>
                  <span className="slabel" style={{ display:'block', fontSize:'9px', marginBottom:'7px' }}>{f.label}</span>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required className="inp"
                    onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor='var(--line)';}}/>
                </div>
              ))}
              <div>
                <span className="slabel" style={{ display:'block', fontSize:'9px', marginBottom:'7px' }}>رسالتك</span>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="كيف يمكننا مساعدتك؟" rows={5} required className="inp"
                  style={{ resize:'none' as any }}
                  onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor='var(--line)';}}/>
              </div>
              <button type="submit" className="btn-gold" style={{ justifyContent:'center', width:'100%' }}>
                إرسال الرسالة <ArrowRight style={{ width:'13px', height:'13px' }}/>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}  