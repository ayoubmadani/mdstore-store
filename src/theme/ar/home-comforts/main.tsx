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
  Menu, Home as HomeIcon, Package, Truck, RefreshCw, Leaf,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Playfair+Display:ital,wght@1,600&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --bg:      #E8D5B7;
    --bg-lt:   #F2E6D0;
    --bg-dk:   #D4BC9A;
    --card:    #F7EFE0;
    --card-2:  #EDE0C8;
    --rust:    #B85C2A;
    --rust-lt: #CC6E38;
    --rust-dk: #9A4A20;
    --ink:     #2A1F14;
    --mid:     #6B5540;
    --dim:     #9A8068;
    --line:    rgba(107,85,64,0.18);
    --line-dk: rgba(107,85,64,0.3);
    --white:   #FFFFFF;
  }

  body { background: var(--bg); color: var(--ink); font-family: 'Tajawal', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--rust); border-radius: 2px; }

  /* Subtle paper grain */
  .grain-bg {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
  }

  @keyframes fade-up { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  .fu   { animation: fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay: 0.08s; }
  .fu-2 { animation-delay: 0.2s; }
  .fu-3 { animation-delay: 0.32s; }
  @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }

  /* Card */
  .h-card { background: var(--card); border-radius: 12px; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; cursor: pointer; }
  .h-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(42,31,20,0.14); }
  .h-card:hover .c-img img { transform: scale(1.04); }
  .c-img img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.22,1,0.36,1); }

  /* Buttons */
  .btn-rust {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    background: var(--rust); color: var(--white);
    font-family: 'Tajawal', sans-serif; font-size: 14px; font-weight: 700;
    padding: 10px 22px; border: none; cursor: pointer; text-decoration: none;
    border-radius: 8px; transition: background 0.22s, transform 0.22s;
  }
  .btn-rust:hover { background: var(--rust-lt); transform: translateY(-1px); }

  .btn-outline {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    background: transparent; color: var(--rust);
    border: 1.5px solid var(--rust); font-family: 'Tajawal', sans-serif;
    font-size: 13px; font-weight: 600; padding: 9px 20px;
    cursor: pointer; text-decoration: none; border-radius: 8px; transition: all 0.22s;
  }
  .btn-outline:hover { background: var(--rust); color: var(--white); }

  /* Inputs */
  .inp {
    width: 100%; padding: 11px 13px;
    background: var(--bg-lt); border: 1.5px solid var(--line-dk);
    font-family: 'Tajawal', sans-serif; font-size: 14px; color: var(--ink);
    outline: none; border-radius: 8px; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .inp:focus { border-color: var(--rust); box-shadow: 0 0 0 3px rgba(184,92,42,0.12); }
  .inp::placeholder { color: var(--dim); }
  .inp-err { border-color: #C0392B !important; }
  select.inp { appearance: none; cursor: pointer; }

  /* Responsive */
  .nav-links  { display: flex; align-items: center; gap: 28px; }
  .nav-toggle { display: none; }
  .hero-g     { display: grid; grid-template-columns: 1fr 1fr; min-height: 86vh; }
  .side-grid  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .prod-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .trust-bar  { display: grid; grid-template-columns: repeat(4,1fr); }
  .footer-g   { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; }
  .details-g  { display: grid; grid-template-columns: 1fr 1fr; }
  .details-L  { position: sticky; top: 70px; height: calc(100vh - 70px); overflow: hidden; }
  .details-R  { padding: 40px 36px 80px; }
  .contact-g  { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; }
  .form-2c    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .dlv-2c     { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  @media (max-width:1100px) {
    .hero-g    { grid-template-columns: 1fr; min-height: auto; }
    .side-grid { display: none; }
    .prod-grid { grid-template-columns: repeat(2,1fr); }
    .footer-g  { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width:768px) {
    .nav-links  { display: none; }
    .nav-toggle { display: flex; }
    .prod-grid  { grid-template-columns: repeat(2,1fr); gap: 12px; }
    .trust-bar  { grid-template-columns: repeat(2,1fr); }
    .footer-g   { grid-template-columns: 1fr; gap: 28px; }
    .details-g  { grid-template-columns: 1fr; }
    .details-L  { position: static; height: 72vw; min-height: 280px; }
    .details-R  { padding: 24px 16px 48px; }
    .contact-g  { grid-template-columns: 1fr; gap: 28px; }
  }
  @media (max-width:480px) {
    .form-2c { grid-template-columns: 1fr; }
    .dlv-2c  { grid-template-columns: 1fr; }
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
    <div style={{ minHeight:'100vh', backgroundColor:'var(--bg)' }}>
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
  const [open, setOpen]         = useState(false);
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
      backgroundColor: scrolled ? 'rgba(232,213,183,0.97)' : 'var(--bg)',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'var(--line-dk)' : 'transparent'}`,
      transition: 'all 0.3s',
    }}>
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ backgroundColor:'var(--rust)', overflow:'hidden', whiteSpace:'nowrap', padding:'7px 0' }}>
          <div style={{ display:'inline-block', animation:'ticker 22s linear infinite' }}>
            {Array(12).fill(null).map((_,i)=>(
              <span key={i} style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'13px', fontWeight:500, color:'rgba(255,255,255,0.9)', margin:'0 40px' }}>
                🌿 {store.topBar.text}
              </span>
            ))}
            {Array(12).fill(null).map((_,i)=>(
              <span key={`b${i}`} style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'13px', fontWeight:500, color:'rgba(255,255,255,0.9)', margin:'0 40px' }}>
                🌿 {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px', height:'68px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        {/* Logo */}
        <Link href={`/`} style={{ textDecoration:'none', flexShrink:0, display:'flex', alignItems:'center', gap:'10px' }}>
          {store.design?.logoUrl
            ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'36px', width:'auto', objectFit:'contain' }}/>
            : (
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'8px', backgroundColor:'var(--rust)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <HomeIcon style={{ width:'17px', height:'17px', color:'white' }}/>
                </div>
                <span style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'1.2rem', fontWeight:800, color:'var(--ink)' }}>{store.name}</span>
              </div>
            )
          }
        </Link>

        {/* Store name always center */}
        <span style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'1.1rem', fontWeight:700, color:'var(--ink)', position:'absolute', left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', display: store.design?.logoUrl ? 'block' : 'none' }}>
          {store.name}
        </span>

        {/* Links */}
        <div className="nav-links">
          {links.map(l=>(
            <Link key={l.href} href={l.href}
              style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'15px', fontWeight:500, color:'var(--mid)', textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--rust)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
              {l.label}
            </Link>
          ))}
          <a href="#products" className="btn-rust" style={{ padding:'9px 20px', fontSize:'13px' }}>تسوق الآن</a>
        </div>

        <button className="nav-toggle" onClick={()=>setOpen(p=>!p)} style={{ background:'none', border:'1.5px solid var(--line-dk)', cursor:'pointer', color:'var(--ink)', padding:'7px', borderRadius:'8px', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {open ? <X style={{ width:'18px', height:'18px' }}/> : <Menu style={{ width:'18px', height:'18px' }}/>}
        </button>
      </div>

      <div style={{ maxHeight:open?'200px':'0', overflow:'hidden', transition:'max-height 0.3s ease', borderTop:open?'1px solid var(--line)':'none', backgroundColor:'var(--bg-lt)' }}>
        <div style={{ padding:'8px 24px 16px' }}>
          {links.map(l=>(
            <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', fontSize:'15px', fontWeight:500, color:'var(--mid)', textDecoration:'none', borderBottom:'1px solid var(--line)' }}>
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
    <footer dir="rtl" style={{ backgroundColor:'var(--ink)', fontFamily:"'Tajawal',sans-serif", marginTop:'48px' }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'56px 24px 36px' }}>
        <div className="footer-g" style={{ paddingBottom:'40px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>

          {/* ① Logo + Name + Slug */}
          <div>
            <Link href={`/`} style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'32px', width:'auto', filter:'brightness(0) invert(1)', opacity:0.8 }}/>
                : <div style={{ width:'32px', height:'32px', borderRadius:'8px', backgroundColor:'var(--rust)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <HomeIcon style={{ width:'15px', height:'15px', color:'white' }}/>
                  </div>
              }
              <span style={{ fontSize:'1.15rem', fontWeight:800, color:'rgba(255,255,255,0.85)' }}>{store.name}</span>
            </Link>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', letterSpacing:'0.06em', marginBottom:'12px' }}>{store.name}</p>
            <p style={{ fontSize:'13px', lineHeight:'1.8', color:'rgba(255,255,255,0.4)', maxWidth:'240px', fontWeight:300 }}>
              أثاث وديكور منزلي مختار بعناية لإضافة الدفء لمنزلك.
            </p>
          </div>

          {/* ② روابط */}
          <div>
            <p style={{ fontSize:'13px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--rust)', marginBottom:'18px' }}>روابط</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                { href:`/Privacy`, label:'سياسة الخصوصية' },
                { href:`/Terms`,   label:'شروط الخدمة'    },
                { href:`/Cookies`, label:'ملفات الارتباط'  },
                { href:`/contact`, label:'اتصل بنا'        },
              ].map(l=>(
                <a key={l.href} href={l.href} style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', textDecoration:'none', transition:'color 0.2s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.8)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.4)';}}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* ③ على حسب الثيم — تواصل */}
          <div>
            <p style={{ fontSize:'13px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--rust)', marginBottom:'18px' }}>تواصل</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                { icon:'📞', val:'+213 550 000 000' },
                { icon:'✉️',  val:'info@store.dz'    },
                { icon:'📍', val:'الجزائر'           },
              ].map(item=>(
                <div key={item.val} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'14px' }}>{item.icon}</span>
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ paddingTop:'18px', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.2)' }}>© {yr} {store.name}. جميع الحقوق محفوظة.</p>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.2)' }}>Home Comforts Theme</p>
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
    <div className="h-card">
      <div className="c-img" style={{ position:'relative', aspectRatio:'4/3', overflow:'hidden', backgroundColor:'var(--bg-dk)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'var(--card-2)' }}>
              <HomeIcon style={{ width:'40px', height:'40px', color:'var(--dim)', opacity:0.5 }}/>
            </div>
        }
        {discount>0 && (
          <div style={{ position:'absolute', top:'10px', right:'10px', backgroundColor:'var(--rust)', color:'white', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'6px' }}>
            -{discount}%
          </div>
        )}
      </div>

      <div style={{ padding:'14px' }}>
        <h3 style={{ fontSize:'15px', fontWeight:600, color:'var(--ink)', marginBottom:'6px', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', flexWrap:'wrap', gap:'4px' }}>
          <div style={{ display:'flex', gap:'2px' }}>
            {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'12px', height:'12px', fill:i<4?'var(--rust)':'none', color:'var(--rust)' }}/>)}
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
            <span style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--ink)' }}>{price.toLocaleString()}</span>
            <span style={{ fontSize:'11px', color:'var(--dim)' }}>دج</span>
            {orig>price && <span style={{ fontSize:'11px', color:'var(--dim)', textDecoration:'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
        </div>
        <Link href={`/product/${product.slug||product.id}`}
          className="btn-rust" style={{ textDecoration:'none', width:'100%', fontSize:'13px', padding:'9px 16px', borderRadius:'8px' }}>
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

      {/* ── HERO — full width ── */}
      <section style={{ maxWidth:'1400px', margin:'0 auto', padding:'20px' }}>
        <div style={{ position:'relative', borderRadius:'16px', overflow:'hidden', minHeight:'500px', backgroundColor:'var(--bg-dk)' }} className="grain-bg">
          {store.hero?.imageUrl
            ? <img src={store.hero.imageUrl} alt={store.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            : <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,var(--bg-dk),var(--card-2))' }} className="grain-bg"/>
          }
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(42,31,20,0.75) 0%, rgba(42,31,20,0.2) 55%, transparent 100%)', pointerEvents:'none' }}/>

          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'40px', zIndex:2 }}>
            <h1 className="fu" style={{ fontFamily:"'Tajawal',sans-serif", fontWeight:800, fontSize:'clamp(2rem,5vw,3.5rem)', color:'white', lineHeight:1.1, marginBottom:'12px' }}>
              {store.hero?.title || 'اجعل منزلك واحتك.'}
            </h1>
            <p className="fu fu-1" style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'15px', color:'rgba(255,255,255,0.8)', marginBottom:'24px', maxWidth:'460px', lineHeight:'1.7' }}>
              {store.hero?.subtitle || 'استكشف مجموعتنا المصنوع يدوياً لتجربة حياة أكثر راحة.'}
            </p>
            <a href="#products" className="btn-rust fu fu-2" style={{ fontSize:'15px', padding:'13px 32px', borderRadius:'10px', textDecoration:'none' }}>
              استكشف المجموعات
            </a>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ backgroundColor:'var(--card)', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)', margin:'0' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div className="trust-bar">
            {[
              { icon:<Truck style={{ width:'20px', height:'20px' }}/>,    title:'توصيل سريع',   desc:'48 ساعة لباب منزلك' },
              { icon:<RefreshCw style={{ width:'20px', height:'20px' }}/>, title:'إرجاع مجاني',  desc:'30 يوم إرجاع مضمون' },
              { icon:<Shield style={{ width:'20px', height:'20px' }}/>,    title:'جودة مضمونة',  desc:'منتجات مختارة بعناية' },
              { icon:<Phone style={{ width:'20px', height:'20px' }}/>,     title:'دعم متواصل',   desc:'نحن هنا لمساعدتك'    },
            ].map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'18px 20px', borderLeft:i>0?'1px solid var(--line)':'none' }}>
                <div style={{ color:'var(--rust)', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize:'13px', fontWeight:700, color:'var(--ink)', margin:0 }}>{item.title}</p>
                  <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length>0 && (
        <section style={{ maxWidth:'1280px', margin:'0 auto', padding:'56px 24px' }}>
          <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--ink)', textAlign:'center', marginBottom:'24px' }}>تسوق حسب الفئة</h2>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center' }}>
            {cats.map((cat:any)=>(
              <Link key={cat.id} href={`/?category=${cat.id}`}
                style={{ padding:'10px 22px', backgroundColor:'var(--card)', border:'1.5px solid var(--line-dk)', borderRadius:'24px', fontSize:'14px', fontWeight:600, color:'var(--ink)', textDecoration:'none', transition:'all 0.22s' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.backgroundColor='var(--rust)'; el.style.color='white'; el.style.borderColor='var(--rust)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.backgroundColor='var(--card)'; el.style.color='var(--ink)'; el.style.borderColor='var(--line-dk)';}}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding:'12px 0 64px' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px' }}>
          <div style={{ width:'48px', height:'3px', backgroundColor:'var(--rust)', borderRadius:'2px', margin:'0 auto 28px' }}/>

          {products.length===0 ? (
            <div style={{ padding:'64px 0', textAlign:'center', background:'var(--card)', borderRadius:'16px' }}>
              <HomeIcon style={{ width:'48px', height:'48px', color:'var(--dim)', opacity:0.4, margin:'0 auto 12px' }}/>
              <p style={{ fontSize:'1.1rem', color:'var(--dim)' }}>المجموعة قادمة قريباً</p>
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

      {/* ── CTA ── */}
      <section style={{ backgroundColor:'var(--rust)', padding:'64px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.07 }} className="grain-bg"/>
        <div style={{ position:'relative', zIndex:2, maxWidth:'560px', margin:'0 auto' }}>
          <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontWeight:800, fontSize:'clamp(1.6rem,4vw,2.8rem)', color:'white', marginBottom:'14px', lineHeight:1.15 }}>
            أثث منزلك بذوق راقٍ
          </h2>
          <p style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'15px', color:'rgba(255,255,255,0.75)', marginBottom:'28px', lineHeight:'1.8' }}>
            كل قطعة في مجموعتنا مختارة لتضيف الدفء والجمال لمنزلك.
          </p>
          <a href="#products"
            style={{ display:'inline-flex', alignItems:'center', gap:'8px', backgroundColor:'white', color:'var(--rust)', fontFamily:"'Tajawal',sans-serif", fontSize:'15px', fontWeight:700, padding:'13px 32px', borderRadius:'10px', textDecoration:'none', transition:'transform 0.22s' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='none';}}>
            تسوق الآن <ArrowRight style={{ width:'16px', height:'16px' }}/>
          </a>
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
    <div dir="rtl" style={{ backgroundColor:'var(--bg)' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor:'var(--card)', borderBottom:'1px solid var(--line)', padding:'10px 24px', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'var(--dim)' }}>
        <Link href="/" style={{ textDecoration:'none', color:'var(--mid)', transition:'color 0.2s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--rust)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
          الرئيسية
        </Link>
        <span>›</span>
        <span style={{ color:'var(--rust)', fontWeight:600 }}>{product.name.slice(0,40)}</span>
        <div style={{ marginRight:'auto', display:'flex', gap:'8px' }}>
          <button onClick={toggleWishlist} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:`1.5px solid ${isWishlisted?'var(--rust)':'var(--line-dk)'}`, background:isWishlisted?'rgba(184,92,42,0.1)':'transparent', cursor:'pointer', color:isWishlisted?'var(--rust)':'var(--dim)', borderRadius:'8px' }}>
            <Heart style={{ width:'13px', height:'13px', fill:isWishlisted?'currentColor':'none' }}/>
          </button>
          <button onClick={handleShare} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--dim)', borderRadius:'8px' }}>
            <Share2 style={{ width:'13px', height:'13px' }}/>
          </button>
        </div>
      </div>

      <div className="details-g" style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px' }}>
        {/* Gallery */}
        <div className="details-L" style={{ paddingTop:'24px' }}>
          <div style={{ position:'relative', aspectRatio:'4/3', overflow:'hidden', backgroundColor:'var(--card-2)', borderRadius:'16px' }}>
            {allImages.length>0
              ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <HomeIcon style={{ width:'64px', height:'64px', color:'var(--dim)', opacity:0.4 }}/>
                </div>
            }
            {discount>0 && <div style={{ position:'absolute', top:'12px', right:'12px', backgroundColor:'var(--rust)', color:'white', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'8px' }}>-{discount}%</div>}
            {allImages.length>1 && (
              <>
                <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', borderRadius:'50%', border:'1px solid var(--line)', backgroundColor:'rgba(232,213,183,0.9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronRight style={{ width:'15px', height:'15px', color:'var(--ink)' }}/>
                </button>
                <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', borderRadius:'50%', border:'1px solid var(--line)', backgroundColor:'rgba(232,213,183,0.9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronLeft style={{ width:'15px', height:'15px', color:'var(--ink)' }}/>
                </button>
              </>
            )}
            {!inStock&&!autoGen && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(232,213,183,0.85)', backdropFilter:'blur(4px)', borderRadius:'16px' }}>
                <span style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--mid)' }}>نفد المخزون</span>
              </div>
            )}
          </div>
          {allImages.length>1 && (
            <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
              {allImages.slice(0,5).map((img:string,idx:number)=>(
                <button key={idx} onClick={()=>setSel(idx)} style={{ width:'56px', height:'56px', overflow:'hidden', border:`2px solid ${sel===idx?'var(--rust)':'var(--line-dk)'}`, cursor:'pointer', padding:0, background:'none', borderRadius:'8px', opacity:sel===idx?1:0.55 }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="details-R">
          <p style={{ fontSize:'12px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--rust)', marginBottom:'10px' }}>أثاث وديكور</p>
          <h1 style={{ fontFamily:"'Tajawal',sans-serif", fontWeight:800, fontSize:'clamp(1.6rem,3.5vw,2.6rem)', color:'var(--ink)', lineHeight:1.1, marginBottom:'14px' }}>
            {product.name}
          </h1>

          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line)', flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:'2px' }}>
              {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'13px', height:'13px', fill:i<4?'var(--rust)':'none', color:'var(--rust)' }}/>)}
            </div>
            <span style={{ fontSize:'12px', color:'var(--dim)' }}>128 تقييم</span>
            <span style={{ marginRight:'auto', padding:'5px 14px', borderRadius:'20px', backgroundColor:inStock||autoGen?'rgba(184,92,42,0.1)':'rgba(107,85,64,0.1)', color:inStock||autoGen?'var(--rust)':'var(--mid)', fontSize:'12px', fontWeight:600, border:`1px solid ${inStock||autoGen?'var(--rust)':'var(--mid)'}` }}>
              {autoGen?'∞ متوفر':inStock?'متوفر':'نفد المخزون'}
            </span>
          </div>

          {/* Price */}
          <div style={{ marginBottom:'22px', padding:'18px', backgroundColor:'var(--card)', borderRadius:'12px', border:'1px solid var(--line)' }}>
            <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--dim)', margin:'0 0 6px' }}>السعر</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:'12px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'2.6rem', fontWeight:800, color:'var(--ink)', lineHeight:1, letterSpacing:'-0.01em' }}>{finalPrice.toLocaleString()}</span>
              <span style={{ fontSize:'15px', color:'var(--dim)' }}>دج</span>
              {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                <>
                  <span style={{ fontSize:'15px', textDecoration:'line-through', color:'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                  <span style={{ fontSize:'12px', color:'var(--rust)', fontWeight:600, padding:'2px 8px', backgroundColor:'rgba(184,92,42,0.1)', borderRadius:'6px' }}>
                    وفّر {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Offers */}
          {product.offers?.length>0 && (
            <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line)' }}>
              <p style={{ fontSize:'13px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'10px' }}>الباقات</p>
              {product.offers.map((offer:any)=>(
                <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', border:`1.5px solid ${selectedOffer===offer.id?'var(--rust)':'var(--line-dk)'}`, cursor:'pointer', marginBottom:'8px', borderRadius:'10px', transition:'all 0.2s', backgroundColor:selectedOffer===offer.id?'rgba(184,92,42,0.05)':'transparent' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'17px', height:'17px', borderRadius:'50%', border:`2px solid ${selectedOffer===offer.id?'var(--rust)':'var(--dim)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {selectedOffer===offer.id&&<div style={{ width:'9px', height:'9px', borderRadius:'50%', background:'var(--rust)' }}/>}
                    </div>
                    <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                    <div>
                      <p style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)', margin:0 }}>{offer.name}</p>
                      <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>الكمية: {offer.quantity}</p>
                    </div>
                  </div>
                  <span style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--rust)' }}>{offer.price.toLocaleString()} <span style={{ fontSize:'11px', fontWeight:400, color:'var(--dim)' }}>دج</span></span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--line)' }}>
              <p style={{ fontSize:'13px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'10px' }}>{attr.name}</p>
              {attr.displayMode==='color' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'28px', height:'28px', backgroundColor:v.value, border:'none', cursor:'pointer', borderRadius:'50%', outline:s?'3px solid var(--rust)':'3px solid transparent', outlineOffset:'3px' }}/>;})}
                </div>
              ):attr.displayMode==='image' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`2px solid ${s?'var(--rust)':'var(--line-dk)'}`, cursor:'pointer', padding:0, borderRadius:'8px' }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                </div>
              ):(
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ padding:'8px 16px', border:`1.5px solid ${s?'var(--rust)':'var(--line-dk)'}`, backgroundColor:s?'var(--rust)':'transparent', color:s?'white':'var(--mid)', fontFamily:"'Tajawal',sans-serif", fontSize:'13px', fontWeight:600, cursor:'pointer', borderRadius:'8px', transition:'all 0.2s' }}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--line)' }}>
              <p style={{ fontSize:'13px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'12px' }}>وصف المنتج</p>
              <div style={{ fontSize:'14px', lineHeight:'1.85', color:'var(--mid)', fontWeight:400 }}
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
    {label && <p style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'6px' }}>{label}</p>}
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
    <div style={{ marginTop:'22px', paddingTop:'20px', borderTop:'1px solid var(--line)' }}>
      <form onSubmit={handleSubmit}>
        <div className="form-2c">
          <FR error={errors.customerName} label="الاسم">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="الاسم الكامل"
                className={`inp${errors.customerName?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--rust)';}} onBlur={e=>{e.target.style.borderColor=errors.customerName?'#C0392B':'var(--line-dk)';}}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="الهاتف">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX"
                className={`inp${errors.customerPhone?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--rust)';}} onBlur={e=>{e.target.style.borderColor=errors.customerPhone?'#C0392B':'var(--line-dk)';}}/>
            </div>
          </FR>
        </div>
        <div className="form-2c">
          <FR error={errors.customerWelaya} label="الولاية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                className={`inp${errors.customerWelaya?' inp-err':''}`} style={{ paddingRight:'34px' }}
                onFocus={e=>{e.target.style.borderColor='var(--rust)';}} onBlur={e=>{e.target.style.borderColor=errors.customerWelaya?'#C0392B':'var(--line-dk)';}}>
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
                onFocus={e=>{e.target.style.borderColor='var(--rust)';}} onBlur={e=>{e.target.style.borderColor=errors.customerCommune?'#C0392B':'var(--line-dk)';}}>
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
                style={{ padding:'12px 10px', border:`1.5px solid ${fd.typeLivraison===type?'var(--rust)':'var(--line-dk)'}`, backgroundColor:fd.typeLivraison===type?'rgba(184,92,42,0.07)':'transparent', cursor:'pointer', textAlign:'right', borderRadius:'10px', transition:'all 0.2s' }}>
                <p style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'13px', fontWeight:600, color:fd.typeLivraison===type?'var(--rust)':'var(--mid)', margin:'0 0 4px' }}>
                  {type==='home'?'توصيل للبيت':'توصيل للمكتب'}
                </p>
                {selW && <p style={{ fontSize:'1rem', fontWeight:800, color:fd.typeLivraison===type?'var(--rust)':'var(--dim)', margin:0 }}>
                  {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()}
                  <span style={{ fontSize:'11px', fontWeight:400, color:'var(--dim)', marginRight:'3px' }}>دج</span>
                </p>}
              </button>
            ))}
          </div>
        </FR>

        <FR label="الكمية">
          <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid var(--line-dk)', borderRadius:'10px', overflow:'hidden', backgroundColor:'var(--bg-lt)' }}>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--ink)' }}>
              <Minus style={{ width:'12px', height:'12px' }}/>
            </button>
            <span style={{ width:'44px', textAlign:'center', fontSize:'1.1rem', fontWeight:700, color:'var(--ink)' }}>{fd.quantity}</span>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--ink)' }}>
              <Plus style={{ width:'12px', height:'12px' }}/>
            </button>
          </div>
        </FR>

        {/* Summary */}
        <div style={{ border:'1px solid var(--line-dk)', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', backgroundColor:'var(--card)', borderBottom:'1px solid var(--line)' }}>
            <p style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'13px', fontWeight:700, color:'var(--mid)', margin:0 }}>ملخص الطلب</p>
          </div>
          {[
            { l:'المنتج', v:product.name.slice(0,22) },
            { l:'السعر',  v:`${fp.toLocaleString()} دج` },
            { l:'الكمية', v:`× ${fd.quantity}` },
            { l:'التوصيل',v:selW?`${getLiv().toLocaleString()} دج`:'—' },
          ].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 14px', borderBottom:'1px solid var(--line)', backgroundColor:'var(--bg-lt)' }}>
              <span style={{ fontSize:'13px', color:'var(--dim)' }}>{row.l}</span>
              <span style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px', backgroundColor:'var(--card)' }}>
            <span style={{ fontSize:'13px', color:'var(--mid)' }}>المجموع</span>
            <span style={{ fontSize:'1.7rem', fontWeight:800, color:'var(--rust)' }}>
              {total().toLocaleString()} <span style={{ fontSize:'13px', fontWeight:400, color:'var(--dim)' }}>دج</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={sub} className="btn-rust"
          style={{ width:'100%', fontSize:'16px', padding:'13px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1, borderRadius:'10px' }}>
          {sub?'جاري المعالجة...':'تأكيد الطلب'}{!sub && <ArrowRight style={{ width:'15px', height:'15px' }}/>}
        </button>

        <p style={{ fontSize:'11px', color:'var(--dim)', textAlign:'center', marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          <Lock style={{ width:'10px', height:'10px', color:'var(--rust)' }}/> دفع آمن ومشفر
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
  <div dir="rtl" style={{ backgroundColor:'var(--bg)', minHeight:'100vh' }}>
    <div style={{ backgroundColor:'var(--card)', padding:'64px 24px 48px', borderBottom:'1px solid var(--line)' }}>
      <div style={{ maxWidth:'720px', margin:'0 auto' }}>
        {sub && <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--rust)', marginBottom:'10px' }}>{sub}</p>}
        <h1 style={{ fontFamily:"'Tajawal',sans-serif", fontWeight:800, fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--ink)', lineHeight:1, margin:0 }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'40px 24px 80px' }}>
      <div style={{ backgroundColor:'var(--card)', borderRadius:'16px', border:'1px solid var(--line)', padding:'32px' }}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{ paddingBottom:'20px', marginBottom:'20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start' }}>
    <div style={{ flex:1 }}>
      <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--ink)', margin:'0 0 7px' }}>{title}</h3>
      <p style={{ fontSize:'13px', lineHeight:'1.85', color:'var(--mid)', fontWeight:400, margin:0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 10px', border:'1px solid var(--line-dk)', color:'var(--rust)', borderRadius:'6px', flexShrink:0 }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="قانوني">
      <IB title="البيانات التي نجمعها"  body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك."/>
      <IB title="كيف نستخدمها"          body="حصرياً لتنفيذ وتوصيل مشترياتك. لا استخدام تجاري لبياناتك."/>
      <IB title="الأمان"                 body="بياناتك محمية بتشفير على مستوى المؤسسات."/>
      <IB title="مشاركة البيانات"        body="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل."/>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الخدمة" sub="قانوني">
      <IB title="حسابك"             body="أنت مسؤول عن أمان بيانات تسجيل الدخول."/>
      <IB title="المدفوعات"          body="لا رسوم مخفية. السعر المعروض هو السعر النهائي."/>
      <IB title="الاستخدام المحظور"  body="المنتجات الأصيلة فقط. لا مجال للمنتجات المقلدة." tag="صارم"/>
      <IB title="القانون الحاكم"    body="تخضع هذه الشروط لقوانين الجمهورية الجزائرية الديمقراطية الشعبية."/>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات الارتباط" sub="قانوني">
      <IB title="الكوكيز الأساسية"    body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب"/>
      <IB title="كوكيز التفضيلات"     body="تحفظ إعداداتك لتجربة أفضل." tag="اختياري"/>
      <IB title="كوكيز التحليلات"     body="بيانات مجمعة لتحسين المنصة." tag="اختياري"/>
      <div style={{ marginTop:'16px', padding:'14px', border:'1px solid var(--line)', borderRadius:'10px', display:'flex', gap:'12px', alignItems:'flex-start', backgroundColor:'var(--bg-lt)' }}>
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
    <div dir="rtl" style={{ backgroundColor:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ backgroundColor:'var(--card)', padding:'64px 24px 48px', borderBottom:'1px solid var(--line)' }}>
        <div style={{ maxWidth:'960px', margin:'0 auto' }}>
          <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--rust)', marginBottom:'10px' }}>تواصل</p>
          <h1 style={{ fontFamily:"'Tajawal',sans-serif", fontWeight:800, fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--ink)', lineHeight:1, margin:'0 0 10px' }}>
            نسعد بمساعدتك
          </h1>
          <p style={{ fontSize:'14px', color:'var(--dim)' }}>نرد خلال 24 ساعة 🏡</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth:'960px', margin:'0 auto', padding:'40px 24px 80px' }}>
        <div>
          <div style={{ backgroundColor:'var(--card)', borderRadius:'16px', border:'1px solid var(--line)', padding:'24px', marginBottom:'12px' }}>
            <p style={{ fontSize:'12px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--rust)', marginBottom:'18px' }}>طرق التواصل</p>
            {[
              { icon:'📞', label:'الهاتف', val:'+213 550 000 000', href:'tel:+213550000000' },
              { icon:'✉️',  label:'البريد', val:'info@store.dz',    href:'mailto:info@store.dz' },
              { icon:'📍', label:'الموقع', val:'الجزائر',           href:undefined },
            ].map(item=>(
              <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'13px 0', borderBottom:'1px solid var(--line)', textDecoration:'none' }}>
                <div style={{ width:'38px', height:'38px', borderRadius:'10px', backgroundColor:'var(--bg)', border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--rust)', margin:'0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)', margin:0 }}>{item.val}</p>
                </div>
                {item.href && <ArrowRight style={{ width:'13px', height:'13px', color:'var(--dim)', marginRight:'auto' }}/>}
              </a>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor:'var(--card)', borderRadius:'16px', border:'1px solid var(--line)', padding:'28px' }}>
          <p style={{ fontSize:'12px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--rust)', marginBottom:'22px' }}>أرسل رسالة</p>
          {sent ? (
            <div style={{ minHeight:'220px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1.5px dashed var(--line-dk)', borderRadius:'12px', textAlign:'center', backgroundColor:'var(--bg-lt)', padding:'32px' }}>
              <CheckCircle2 style={{ width:'32px', height:'32px', color:'var(--rust)', marginBottom:'12px' }}/>
              <h3 style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--ink)', margin:'0 0 6px' }}>تم الإرسال!</h3>
              <p style={{ fontSize:'13px', color:'var(--dim)' }}>سنرد عليك خلال 24 ساعة 🏡</p>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[
                { label:'اسمك', type:'text',  key:'name',  ph:'الاسم الكامل' },
                { label:'البريد', type:'email', key:'email', ph:'بريدك@الإلكتروني' },
              ].map(f=>(
                <div key={f.key}>
                  <p style={{ fontSize:'12px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'6px' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required className="inp"
                    onFocus={e=>{e.target.style.borderColor='var(--rust)';}} onBlur={e=>{e.target.style.borderColor='var(--line-dk)';}}/>
                </div>
              ))}
              <div>
                <p style={{ fontSize:'12px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'6px' }}>رسالتك</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp"
                  style={{ resize:'none' as any }}
                  onFocus={e=>{e.target.style.borderColor='var(--rust)';}} onBlur={e=>{e.target.style.borderColor='var(--line-dk)';}}/>
              </div>
              <button type="submit" className="btn-rust" style={{ justifyContent:'center', width:'100%', fontSize:'15px', padding:'13px', borderRadius:'10px' }}>
                إرسال الرسالة <ArrowRight style={{ width:'14px', height:'14px' }}/>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}