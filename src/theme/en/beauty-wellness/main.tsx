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
  Menu, Sparkles, Package, Truck, RefreshCw, Search,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --plum:    #6B2D8B;
    --plum-2:  #7D3EA0;
    --plum-lt: #9B5BB8;
    --rose:    #E8628A;
    --rose-lt: #F07A9E;
    --gold:    #E8B84B;
    --white:   #FFFFFF;
    --off:     #FAFAFA;
    --soft:    #F7F2FB;
    --cream:   #FDF8F0;
    --ink:     #1A1228;
    --mid:     #5A4A6A;
    --dim:     #9A8AAA;
    --line:    rgba(107,45,139,0.1);
    --line-dk: rgba(107,45,139,0.2);
  }

  body { background: var(--white); color: var(--ink); font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--plum-lt); border-radius: 2px; }

  .serif { font-family: 'Playfair Display', Georgia, serif; }

  @keyframes fade-up { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  .fu   { animation: fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay: 0.08s; }
  .fu-2 { animation-delay: 0.18s; }
  .fu-3 { animation-delay: 0.3s; }
  @keyframes ticker { from { transform:translateX(0) } to { transform:translateX(-50%) } }

  /* Product card */
  .p-card { background: var(--white); border: 1px solid var(--line); transition: transform 0.28s, box-shadow 0.28s; cursor: pointer; }
  .p-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(107,45,139,0.1); }
  .p-card:hover .c-img img { transform: scale(1.04); }
  .c-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.4s cubic-bezier(0.22,1,0.36,1); }

  /* Thumbnail grid (detail page) */
  .thumb-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; }
  .thumb-btn { overflow: hidden; cursor: pointer; padding: 0; background: none; border: 2px solid transparent; transition: border-color 0.2s; }
  .thumb-btn.active { border-color: var(--plum); }
  .thumb-btn img { display: block; width: 100%; aspect-ratio: 1/1; object-fit: cover; }

  /* Buttons */
  .btn-plum {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--plum); color: var(--white);
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    padding: 12px 26px; border: none; cursor: pointer; text-decoration: none;
    border-radius: 4px; transition: background 0.2s, transform 0.2s;
  }
  .btn-plum:hover { background: var(--plum-2); transform: translateY(-1px); }

  .btn-outline {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: var(--plum); border: 1.5px solid var(--plum);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    padding: 11px 24px; cursor: pointer; text-decoration: none;
    border-radius: 4px; transition: all 0.2s;
  }
  .btn-outline:hover { background: var(--plum); color: var(--white); }

  /* Inputs */
  .inp {
    width: 100%; padding: 11px 13px;
    background: var(--white); border: 1.5px solid var(--line-dk);
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink);
    outline: none; border-radius: 4px; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .inp:focus { border-color: var(--plum); box-shadow: 0 0 0 3px rgba(107,45,139,0.1); }
  .inp::placeholder { color: var(--dim); }
  .inp-err { border-color: var(--rose) !important; }
  select.inp { appearance: none; cursor: pointer; }

  /* Category pill */
  .cat-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border: 1.5px solid var(--line-dk);
    border-radius: 24px; font-size: 13px; font-weight: 500;
    color: var(--mid); background: var(--white); cursor: pointer;
    text-decoration: none; transition: all 0.2s; white-space: nowrap;
  }
  .cat-pill:hover, .cat-pill.active { border-color: var(--plum); color: var(--plum); background: var(--soft); }

  /* Responsive */
  .nav-top    { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
  .nav-links  { display: flex; align-items: center; gap: 0; }
  .nav-toggle { display: none; }
  .prod-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  .trust-bar  { display: grid; grid-template-columns: repeat(4,1fr); }
  .footer-g   { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; }
  .details-g  { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .contact-g  { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; }
  .form-2c    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .dlv-2c     { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  @media (max-width:1100px) {
    .prod-grid { grid-template-columns: repeat(3,1fr); }
    .footer-g  { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width:768px) {
    .nav-links  { display: none; }
    .nav-toggle { display: flex; }
    .nav-top    { grid-template-columns: auto 1fr auto; }
    .prod-grid  { grid-template-columns: repeat(2,1fr); gap: 12px; }
    .trust-bar  { grid-template-columns: repeat(2,1fr); }
    .footer-g   { grid-template-columns: 1fr; gap: 28px; }
    .details-g  { grid-template-columns: 1fr; }
    .contact-g  { grid-template-columns: 1fr; gap: 28px; }
  }
  @media (max-width:480px) {
    .prod-grid { grid-template-columns: repeat(2,1fr); gap: 8px; }
    .form-2c   { grid-template-columns: 1fr; }
    .dlv-2c    { grid-template-columns: 1fr; }
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
    <div style={{ minHeight:'100vh', backgroundColor:'var(--white)' }}>
      <style>{CSS}</style>
      <Navbar store={store}/>
      <main>{children}</main>
      <Footer store={store}/>
    </div>
  );
}

/* ── NAVBAR ─────────────────────────────────────────────────── */
export function Navbar({ store }: { store: Store }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>4);
    window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h);
  },[]);
  if (!store) return null;

  const links = [
    { href:`/`,         label:'Home'  },
    { href:`/contact`, label:'Contact'     },
    { href:`/Privacy`, label:'Privacy'  },
  ];

  return (
    <header dir="ltr" style={{ fontFamily:"'DM Sans',sans-serif", position:'sticky', top:0, zIndex:100 }}>
      {/* Top bar */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ backgroundColor:'var(--plum)', overflow:'hidden', whiteSpace:'nowrap', padding:'7px 0' }}>
          <div style={{ display:'inline-block', animation:'ticker 24s linear infinite' }}>
            {Array(12).fill(null).map((_,i)=>(
              <span key={i} style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.88)', margin:'0 40px', display:'inline-flex', alignItems:'center', gap:'8px' }}>
                <Sparkles style={{ width:'11px', height:'11px' }}/> {store.topBar.text}
              </span>
            ))}
            {Array(12).fill(null).map((_,i)=>(
              <span key={`b${i}`} style={{ fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.88)', margin:'0 40px', display:'inline-flex', alignItems:'center', gap:'8px' }}>
                <Sparkles style={{ width:'11px', height:'11px' }}/> {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Logo row */}
      <div style={{ backgroundColor:'var(--white)', borderBottom:'1px solid var(--line)', boxShadow: scrolled ? '0 2px 12px rgba(107,45,139,0.08)' : 'none', transition:'box-shadow 0.3s' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px', height:'70px' , display:"flex" ,justifyContent : "space-between"}} className="nav-top">
          {/* Center: logo */}
          <div style={{ textAlign:'center', display:'flex', justifyContent:'center' }}>
            <Link href={`/`} style={{ textDecoration:'none', display:'inline-flex', flexDirection:'column', alignItems:'center' }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'40px', width:'auto', objectFit:'contain' }}/>
                : (
                  <>
                    <span className="serif" style={{ fontSize:'1.5rem', fontWeight:700, fontStyle:'italic', color:'var(--plum)', lineHeight:1, letterSpacing:'0.02em' }}>
                      {store.name}
                    </span>
                    <span style={{ fontSize:'9px', letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--dim)', marginTop:'2px' }}>
                      Beauty Supply
                    </span>
                  </>
                )
              }
            </Link>
          </div>

          {/* Right: search + shop */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'12px' }}>
            {/* Left: nav links */}
          <div className="nav-links">
            {links.map(l=>(
              <Link key={l.href} href={l.href}
                style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', fontWeight:500, color:'var(--mid)', textDecoration:'none', padding:'0 16px', height:'70px', display:'flex', alignItems:'center', borderBottom:'2px solid transparent', transition:'all 0.2s' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--plum)'; el.style.borderBottomColor='var(--plum)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--mid)'; el.style.borderBottomColor='transparent';}}>
                {l.label}
              </Link>
            ))}
            <a href="#products" className="btn-plum" style={{ padding:'9px 18px', fontSize:'13px' }}>
              Shop Now
            </a>
          </div>
            
            <button className="nav-toggle" onClick={()=>setOpen(p=>!p)} style={{ background:'none', border:'1.5px solid var(--line-dk)', cursor:'pointer', color:'var(--plum)', padding:'7px', borderRadius:'4px', alignItems:'center', justifyContent:'center' }}>
              {open ? <X style={{ width:'17px', height:'17px' }}/> : <Menu style={{ width:'17px', height:'17px' }}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div style={{ maxHeight:open?'220px':'0', overflow:'hidden', transition:'max-height 0.3s ease', backgroundColor:'var(--white)', borderBottom:open?'1px solid var(--line)':'none' }}>
        <div style={{ padding:'8px 24px 16px' }}>
          {links.map(l=>(
            <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', fontSize:'15px', fontWeight:500, color:'var(--mid)', textDecoration:'none', borderBottom:'1px solid var(--line)' }}>
              {l.label} <ArrowRight style={{ width:'14px', height:'14px', color:'var(--plum)' }}/>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ── FOOTER ─────────────────────────────────────────────────── */
export function Footer({ store }: any) {
  const yr = new Date().getFullYear();
  if (!store) return null;
  return (
    <footer dir="ltr" style={{ backgroundColor:'var(--ink)', fontFamily:"'DM Sans',sans-serif", marginTop:'0' }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'56px 24px 36px' }}>
        <div className="footer-g" style={{ paddingBottom:'40px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>

          {/* ① Logo + Name + Slug */}
          <div>
            <Link href={`/`} style={{ textDecoration:'none', display:'inline-flex', flexDirection:'column', marginBottom:'14px' }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'32px', width:'auto', filter:'brightness(0) invert(1)', opacity:0.8 }}/>
                : <span className="serif" style={{ fontSize:'1.4rem', fontWeight:700, fontStyle:'italic', color:'rgba(255,255,255,0.85)' }}>{store.name}</span>
              }
            </Link>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em', marginBottom:'12px' }}>{store.name}</p>
            <p style={{ fontSize:'13px', lineHeight:'1.8', color:'rgba(255,255,255,0.4)', maxWidth:'240px', fontWeight:300 }}>
              The finest beauty and wellness products for every age and skin type.
            </p>
          </div>

          {/* ② Links */}
          <div>
            <p style={{ fontSize:'13px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--plum-lt)', marginBottom:'18px' }}>Links</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                { href:`/Privacy`, label:'Privacy Policy' },
                { href:`/Terms`,   label:'Terms of Service'    },
                { href:`/Cookies`, label:'Cookies'  },
                { href:`/contact`, label:'Contact Us'        },
              ].map(l=>(
                <a key={l.href} href={l.href} style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', textDecoration:'none', transition:'color 0.2s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--plum-lt)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.4)';}}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* ③ Contact */}
          <div>
            <p style={{ fontSize:'13px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--plum-lt)', marginBottom:'18px' }}>Contact</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                { icon:'📞', val:'+213 550 000 000' },
                { icon:'✉️', val:'info@store.dz'    },
                { icon:'📍', val:'Algeria'           },
              ].map(item=>(
                <div key={item.val} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'13px' }}>{item.icon}</span>
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ paddingTop:'18px', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.2)' }}>© {yr} {store.name}. All Rights Reserved.</p>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.2)' }}>Beauty & Wellness Theme</p>
        </div>
      </div>
    </footer>
  );
}

/* ── CARD ───────────────────────────────────────────────────── */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  if (!product || !store) return null;

  // normalize numbers for correct display
  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number) || 0;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  
  // unified primary brand color
  const brandColor = 'var(--plum)'; 
  const brandSoft = 'var(--plum-lt)';

  return (
    <div className="p-card group" style={{ transition: 'transform 0.3s ease', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Image Area */}
      <div className="c-img" style={{ 
        position: 'relative', 
        aspectRatio: '1/1', 
        overflow: 'hidden', 
        backgroundColor: 'var(--soft)',
        borderRadius: '8px 8px 0 0' 
      }}>
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={product.name} 
            className="transition-transform duration-500 group-hover:scale-105"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--soft), var(--cream))' }}>
            <Sparkles style={{ width: '36px', height: '36px', color: brandSoft, opacity: 0.4 }} />
          </div>
        )}

        {/* Discount Badge — Unified Color */}
        {discount > 0 && (
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            backgroundColor: brandColor, 
            color: 'white', 
            fontSize: '11px', 
            fontWeight: 700, 
            padding: '4px 10px', 
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            -{discount}%
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        
        {/* Rating */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} style={{ 
              width: '12px', 
              height: '12px', 
              fill: i < 4 ? 'var(--gold)' : 'none', 
              color: 'var(--gold)' 
            }} />
          ))}
        </div>

        {/* Product Name */}
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: 600, 
          color: 'var(--ink)', 
          marginBottom: '10px', 
          lineHeight: 1.5, 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical' as any, 
          overflow: 'hidden',
          minHeight: '3em' // to unify heading heights
        }}>
          {product.name}
        </h3>

        {/* Price & Currency */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '15px', 
          marginTop: 'auto' // pushes Price and button to the bottom always
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: brandColor }}>
              {price.toLocaleString()}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dim)' }}>DZD</span>
          </div>
          
          {orig > price && (
            <span style={{ fontSize: '12px', color: 'var(--dim)', textDecoration: 'line-through', opacity: 0.6 }}>
              {orig.toLocaleString()}
            </span>
          )}
        </div>

        {/* [Arabic] */}
        <Link href={`/product/${product.slug || product.id}`}
          className="btn-plum" 
          style={{ 
            textDecoration: 'none', 
            width: '100%', 
            fontSize: '13px', 
            fontWeight: 600,
            padding: '12px', 
            borderRadius: '6px',
            textAlign: 'center',
            display: 'block',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 0 rgba(0,0,0,0.05)'
          }}>
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
  const [slide, setSlide] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string|null>(null);

  // Auto-advance hero slideshow
  useEffect(()=>{
    if (products.length < 2) return;
    const t = setInterval(()=>setSlide(p=>(p+1)%Math.min(products.length,3)), 4000);
    return ()=>clearInterval(t);
  },[products.length]);

  const filtered = useMemo(()=>activeFilter ? products.filter((p:any)=>p.categoryId===activeFilter) : products,[products,activeFilter]);

  return (
    <div dir="ltr">

      {/* ── HERO BANNER (slider) ── */}
      <section style={{ position:'relative', overflow:'hidden', borderBottom:'1px solid var(--line)' }}>
        <div style={{ position:'relative', aspectRatio:'16/5', minHeight:'220px', backgroundColor:'var(--soft)' }}>
          {store.hero?.imageUrl
            ? <img src={store.hero.imageUrl} alt={store.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            : (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', gap:'8vw', padding:'4vw 8vw', background:`linear-gradient(135deg, var(--soft) 0%, var(--cream) 50%, #FFF0F5 100%)` }}>
                {/* Text side */}
                <div style={{ flex:'0 0 auto' }}>
                  {store.design?.logoUrl && <img src={store.design.logoUrl} alt={store.name} style={{ height:'48px', marginBottom:'16px', display:'block' }}/>}
                  <h1 className="fu serif" style={{ fontSize:'clamp(1.6rem,4vw,3rem)', fontWeight:700, fontStyle:'italic', color:'var(--plum)', lineHeight:1.1, marginBottom:'10px' }}>
                    {store.hero?.title || 'Your Beauty, Our Priority.'}
                  </h1>
                  <p className="fu fu-1" style={{ fontSize:'14px', color:'var(--mid)', marginBottom:'20px', maxWidth:'340px', lineHeight:'1.7' }}>
                    {store.hero?.subtitle || 'The finest beauty and wellness products, carefully curated.'}
                  </p>
                  <a href="#products" className="btn-plum fu fu-2" style={{ fontSize:'14px', padding:'12px 28px' }}>
                    Browse Collection
                  </a>
                </div>
                {/* Decorative product image */}
                {products[0] && (products[0].productImage || products[0].imagesProduct?.[0]?.imageUrl) && (
                  <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', maxHeight:'240px' }}>
                    <img
                      src={products[0].productImage || products[0].imagesProduct?.[0]?.imageUrl}
                      alt=""
                      style={{ maxHeight:'220px', maxWidth:'100%', objectFit:'contain', display:'block' }}
                    />
                  </div>
                )}
              </div>
            )
          }
        </div>
        {/* Slide dots */}
        <div style={{ position:'absolute', bottom:'12px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'8px' }}>
          {[0,1,2].map(i=>(
            <button key={i} onClick={()=>setSlide(i)}
              style={{ width:'10px', height:'10px', borderRadius:'50%', border:'2px solid var(--plum)', backgroundColor:slide===i?'var(--plum)':'transparent', padding:0, cursor:'pointer', transition:'background 0.2s' }}/>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES (pills) ── */}
      {cats.length>0 && (
        <section style={{ padding:'32px 24px', borderBottom:'1px solid var(--line)', backgroundColor:'var(--off)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto', display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
            <button onClick={()=>setActiveFilter(null)} className={`cat-pill${!activeFilter?' active':''}`}>
              All ({products.length})
            </button>
            {cats.map((cat:any)=>(
              <button key={cat.id} onClick={()=>setActiveFilter(cat.id)} className={`cat-pill${activeFilter===cat.id?' active':''}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS section header (like screenshot) ── */}
      <section id="products" style={{ padding:'32px 0 64px', backgroundColor:'var(--white)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid var(--line)' }}>
            <h2 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'1.3rem', fontWeight:600, color:'var(--ink)', margin:0 }}>
              {activeFilter ? cats.find((c:any)=>c.id===activeFilter)?.name || 'Products' : 'New Arrivals'}
            </h2>
            <Link href={`/`} style={{ fontSize:'13px', color:'var(--plum)', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px', fontWeight:500 }}>
              View More <ArrowRight style={{ width:'13px', height:'13px' }}/>
            </Link>
          </div>

          {filtered.length===0 ? (
            <div style={{ padding:'64px 0', textAlign:'center' }}>
              <Sparkles style={{ width:'40px', height:'40px', color:'var(--dim)', opacity:0.4, margin:'0 auto 12px' }}/>
              <p style={{ fontSize:'1rem', color:'var(--dim)' }}>Products coming soon</p>
            </div>
          ) : (
            <div className="prod-grid">
              {filtered.map((p:any)=>{
                const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="View Details"/>;
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ backgroundColor:'var(--soft)', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div className="trust-bar">
            {[
              { icon:<Truck style={{ width:'20px', height:'20px' }}/>,    title:'Fast Delivery',   desc:'48 Hours to Your Door' },
              { icon:<RefreshCw style={{ width:'20px', height:'20px' }}/>, title:'Free Returns',  desc:'30-Day Returns'        },
              { icon:<Shield style={{ width:'20px', height:'20px' }}/>,    title:'Authentic Products', desc:'100% Guaranteed Quality'    },
              { icon:<Phone style={{ width:'20px', height:'20px' }}/>,     title:'Ongoing Support',   desc: "We're Here to Help"  },
            ].map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'20px', borderLeft:i>0?'1px solid var(--line)':'none' }}>
                <div style={{ color:'var(--plum)', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)', margin:0 }}>{item.title}</p>
                  <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DETAILS ────────────────────────────────────────────────── */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [sel, setSel] = useState(0);
  if (!product) return null;
  return (
    <div dir="ltr" style={{ backgroundColor:'var(--white)' }}>
      {/* Breadcrumb — like screenshot */}
      <div style={{ borderBottom:'1px solid var(--line)', padding:'10px 24px', fontSize:'13px', color:'var(--dim)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', display:'flex', alignItems:'center', gap:'6px' }}>
          <Link href="/" style={{ textDecoration:'none', color:'var(--mid)', transition:'color 0.2s' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--plum)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
            Home
          </Link>
          <span>›</span>
          <Link href="/" style={{ textDecoration:'none', color:'var(--mid)' }}>New Arrivals</Link>
          <span>›</span>
          <span style={{ color:'var(--ink)' }}>{product.name.slice(0,40)}</span>
          <div style={{ marginRight:'auto', display:'flex', gap:'8px' }}>
            <button onClick={toggleWishlist} style={{ width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isWishlisted?'var(--rose)':'var(--line-dk)'}`, background:isWishlisted?'rgba(232,98,138,0.08)':'transparent', cursor:'pointer', color:isWishlisted?'var(--rose)':'var(--dim)', borderRadius:'4px' }}>
              <Heart style={{ width:'13px', height:'13px', fill:isWishlisted?'currentColor':'none' }}/>
            </button>
            <button onClick={handleShare} style={{ width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--dim)', borderRadius:'4px' }}>
              <Share2 style={{ width:'13px', height:'13px' }}/>
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'32px 24px' }}>
        <div className="details-g">

          {/* LEFT: thumbnail grid + main image (like screenshot) */}
          <div>
            {/* Main image */}
            <div style={{ position:'relative', marginBottom:'10px', border:'1px solid var(--line)', overflow:'hidden', backgroundColor:'var(--soft)' }}>
              <div style={{ aspectRatio:'4/3', overflow:'hidden' }}>
                {allImages.length>0
                  ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Sparkles style={{ width:'56px', height:'56px', color:'var(--plum-lt)', opacity:0.3 }}/>
                    </div>
                }
              </div>
              {discount>0 && <div style={{ position:'absolute', top:'12px', right:'12px', backgroundColor:'var(--rose)', color:'white', fontSize:'12px', fontWeight:700, padding:'4px 10px', borderRadius:'3px' }}>-{discount}%</div>}
              {!inStock&&!autoGen && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.85)', backdropFilter:'blur(4px)' }}>
                  <span className="serif" style={{ fontSize:'1.5rem', fontStyle:'italic', color:'var(--mid)' }}>Out of Stock</span>
                </div>
              )}
              {/* Arrows */}
              {allImages.length>1 && (
                <>
                  <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', width:'32px', height:'32px', border:'1px solid var(--line)', backgroundColor:'rgba(255,255,255,0.9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}>
                    <ChevronRight style={{ width:'14px', height:'14px', color:'var(--ink)' }}/>
                  </button>
                  <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{ position:'absolute', left:'8px', top:'50%', transform:'translateY(-50%)', width:'32px', height:'32px', border:'1px solid var(--line)', backgroundColor:'rgba(255,255,255,0.9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}>
                    <ChevronLeft style={{ width:'14px', height:'14px', color:'var(--ink)' }}/>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail grid — exactly like screenshot */}
            {allImages.length>1 && (
              <div className="thumb-grid">
                {allImages.map((img:string,idx:number)=>(
                  <button key={idx} onClick={()=>setSel(idx)} className={`thumb-btn${sel===idx?' active':''}`}>
                    <img src={img} alt=""/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: product info */}
          <div style={{ paddingTop:'8px' }}>
            <h1 style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:'clamp(1.3rem,2.5vw,1.8rem)', color:'var(--ink)', lineHeight:1.25, marginBottom:'12px' }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ marginBottom:'14px' }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:'10px', flexWrap:'wrap' }}>
                <span style={{ fontSize:'2rem', fontWeight:700, color:'var(--ink)' }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize:'14px', color:'var(--dim)' }}>DZD</span>
                {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                  <span style={{ fontSize:'14px', textDecoration:'line-through', color:'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                )}
              </div>
              <p style={{ fontSize:'12px', color:'var(--dim)', marginTop:'4px' }}>
                Shipping calculated at checkout.
              </p>
            </div>

            <div style={{ display:'flex', gap:'2px', marginBottom:'16px' }}>
              {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'13px', height:'13px', fill:i<4?'var(--gold)':'none', color:'var(--gold)' }}/>)}
              <span style={{ fontSize:'12px', color:'var(--dim)', marginRight:'6px' }}>128 Rating</span>
            </div>

            <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'5px 14px', borderRadius:'20px', backgroundColor:inStock||autoGen?'rgba(107,45,139,0.08)':'rgba(107,85,64,0.08)', color:inStock||autoGen?'var(--plum)':'var(--mid)', fontSize:'12px', fontWeight:600, border:`1px solid ${inStock||autoGen?'var(--plum-lt)':'var(--mid)'}`, marginBottom:'22px' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:'currentColor' }}/>
              {autoGen?'∞ Available':inStock?'Available':'Out of Stock'}
            </div>

            <div style={{ height:'1px', backgroundColor:'var(--line)', marginBottom:'20px' }}/>

            {/* Offers */}
            {product.offers?.length>0 && (
              <div style={{ marginBottom:'20px' }}>
                <p style={{ fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'10px' }}>Packages</p>
                {product.offers.map((offer:any)=>(
                  <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', border:`1.5px solid ${selectedOffer===offer.id?'var(--plum)':'var(--line-dk)'}`, cursor:'pointer', marginBottom:'8px', borderRadius:'6px', transition:'all 0.2s', backgroundColor:selectedOffer===offer.id?'var(--soft)':'transparent' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{ width:'16px', height:'16px', borderRadius:'50%', border:`2px solid ${selectedOffer===offer.id?'var(--plum)':'var(--dim)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {selectedOffer===offer.id&&<div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--plum)' }}/>}
                      </div>
                      <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:500, color:'var(--ink)', margin:0 }}>{offer.name}</p>
                        <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>Quantity: {offer.quantity}</p>
                      </div>
                    </div>
                    <span style={{ fontSize:'1rem', fontWeight:700, color:'var(--plum)' }}>{offer.price.toLocaleString()} <span style={{ fontSize:'11px', fontWeight:400, color:'var(--dim)' }}>DZD</span></span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr:any)=>(
              <div key={attr.id} style={{ marginBottom:'18px' }}>
                <p style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)', marginBottom:'10px' }}>{attr.name}</p>
                {attr.displayMode==='color' ? (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'28px', height:'28px', backgroundColor:v.value, border:'none', cursor:'pointer', borderRadius:'50%', outline:s?'3px solid var(--plum)':'3px solid transparent', outlineOffset:'3px' }}/>;})}
                  </div>
                ):attr.displayMode==='image' ? (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'48px', height:'48px', overflow:'hidden', border:`2px solid ${s?'var(--plum)':'var(--line-dk)'}`, cursor:'pointer', padding:0, borderRadius:'4px' }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                  </div>
                ):(
                  <div>
                    {/* Dropdown style like screenshot */}
                    <select onChange={e=>handleVariantSelection(attr.name,e.target.value)} className="inp" style={{ maxWidth:'260px' }}>
                      {attr.variants.map((v:any)=><option key={v.id} value={v.value}>{v.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

            {product.desc && (
              <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--line)' }}>
                <div style={{ fontSize:'14px', lineHeight:'1.85', color:'var(--mid)', fontWeight:400 }}
                  dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc,{ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','span'],ALLOWED_ATTR:['class','style']})}}/>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PRODUCT FORM ────────────────────────────────────────────── */
const FR = ({ error, label, children }: { error?:string; label?:string; children:React.ReactNode }) => (
  <div style={{ marginBottom:'13px' }}>
    {label && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize:'11px', color:'var(--rose)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
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

  const fp=getFP(); const total=()=>fp*fd.quantity+ +getLiv();
  const validate=()=>{
    const e:Record<string,string>={};
    if(!fd.customerName.trim())  e.customerName='Name is required';
    if(!fd.customerPhone.trim()) e.customerPhone='Phone number is required';
    if(!fd.customerWelaya)       e.customerWelaya='Province is required';
    if(!fd.customerCommune)      e.customerCommune='Municipality is required';
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
    <div style={{ marginTop:'16px' }}>
      <form onSubmit={handleSubmit}>
        {/* Quantity — like screenshot */}
        <FR label="Quantity">
          <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid var(--line-dk)', borderRadius:'4px', overflow:'hidden' }}>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--line-dk)', background:'var(--off)', cursor:'pointer', color:'var(--ink)', fontSize:'18px' }}>
              -
            </button>
            <span style={{ width:'52px', textAlign:'center', fontSize:'14px', fontWeight:600, color:'var(--ink)' }}>{fd.quantity}</span>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--line-dk)', background:'var(--off)', cursor:'pointer', color:'var(--ink)', fontSize:'18px' }}>
              +
            </button>
          </div>
        </FR>

        <div className="form-2c">
          <FR error={errors.customerName} label="Name">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="Full Name"
                className={`inp${errors.customerName?' inp-err':''}`} style={{ paddingLeft:'34px' }}
                onFocus={e=>{e.target.style.borderColor='var(--plum)';}} onBlur={e=>{e.target.style.borderColor=errors.customerName?'var(--rose)':'var(--line-dk)';}}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="Phone">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX"
                className={`inp${errors.customerPhone?' inp-err':''}`} style={{ paddingLeft:'34px' }}
                onFocus={e=>{e.target.style.borderColor='var(--plum)';}} onBlur={e=>{e.target.style.borderColor=errors.customerPhone?'var(--rose)':'var(--line-dk)';}}/>
            </div>
          </FR>
        </div>
        <div className="form-2c">
          <FR error={errors.customerWelaya} label="Province">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                className={`inp${errors.customerWelaya?' inp-err':''}`} style={{ paddingRight:'32px' }}
                onFocus={e=>{e.target.style.borderColor='var(--plum)';}} onBlur={e=>{e.target.style.borderColor=errors.customerWelaya?'var(--rose)':'var(--line-dk)';}}>
                <option value="">Select Province</option>
                {wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FR>
          <FR error={errors.customerCommune} label="Municipality">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})}
                className={`inp${errors.customerCommune?' inp-err':''}`} style={{ paddingRight:'32px', opacity:!fd.customerWelaya?0.4:1 }}
                onFocus={e=>{e.target.style.borderColor='var(--plum)';}} onBlur={e=>{e.target.style.borderColor=errors.customerCommune?'var(--rose)':'var(--line-dk)';}}>
                <option value="">{loadingC?'...':'Select Municipality'}</option>
                {communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FR>
        </div>

        <FR label="Delivery">
          <div className="dlv-2c">
            {(['home','office'] as const).map(type=>(
              <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))}
                style={{ padding:'12px 10px', border:`1.5px solid ${fd.typeLivraison===type?'var(--plum)':'var(--line-dk)'}`, backgroundColor:fd.typeLivraison===type?'var(--soft)':'transparent', cursor:'pointer', textAlign:'right', borderRadius:'4px', transition:'all 0.2s' }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', fontWeight:600, color:fd.typeLivraison===type?'var(--plum)':'var(--mid)', margin:'0 0 4px' }}>
                  {type==='home'?'Home':'Office'}
                </p>
                {selW && <p style={{ fontSize:'1rem', fontWeight:700, color:fd.typeLivraison===type?'var(--plum)':'var(--dim)', margin:0 }}>
                  {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()}
                  <span style={{ fontSize:'11px', fontWeight:400, color:'var(--dim)', marginRight:'3px' }}>DZD</span>
                </p>}
              </button>
            ))}
          </div>
        </FR>

        {/* Summary */}
        <div style={{ border:'1px solid var(--line-dk)', borderRadius:'6px', marginBottom:'14px', overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', backgroundColor:'var(--soft)', borderBottom:'1px solid var(--line)' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'var(--mid)', margin:0 }}>Order Summary</p>
          </div>
          {[
            { l:'Product', v:product.name.slice(0,22) },
            { l:'Price',  v:`${fp.toLocaleString()} DZD` },
            { l:'Quantity', v:`× ${fd.quantity}` },
            { l:'Delivery',v:selW?`${getLiv().toLocaleString()} DZD`:'—' },
          ].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 14px', borderBottom:'1px solid var(--line)', backgroundColor:'var(--white)' }}>
              <span style={{ fontSize:'13px', color:'var(--dim)' }}>{row.l}</span>
              <span style={{ fontSize:'13px', fontWeight:500, color:'var(--ink)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px', backgroundColor:'var(--soft)' }}>
            <span style={{ fontSize:'13px', color:'var(--mid)' }}>Total</span>
            <span style={{ fontSize:'1.6rem', fontWeight:700, color:'var(--plum)' }}>
              {total().toLocaleString()} <span style={{ fontSize:'13px', fontWeight:400, color:'var(--dim)' }}>DZD</span>
            </span>
          </div>
        </div>

        {/* ADD TO CART — like screenshot */}
        <button type="submit" disabled={sub} className="btn-plum"
          style={{ width:'100%', fontSize:'15px', padding:'13px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1, borderRadius:'4px', marginBottom:'8px' }}>
          {sub ? 'Processing...' : '🛒 Place Order'}
        </button>
        <p style={{ fontSize:'11px', color:'var(--dim)', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          <Lock style={{ width:'10px', height:'10px', color:'var(--plum)' }}/> Secure & Encrypted Payment
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
  <div dir="ltr" style={{ backgroundColor:'var(--white)', minHeight:'100vh' }}>
    <div style={{ backgroundColor:'var(--soft)', padding:'56px 24px 40px', borderBottom:'1px solid var(--line)' }}>
      <div style={{ maxWidth:'720px', margin:'0 auto' }}>
        {sub && <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--plum)', marginBottom:'8px' }}>{sub}</p>}
        <h1 className="serif" style={{ fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:600, fontStyle:'italic', color:'var(--ink)', margin:0 }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'36px 24px 80px' }}>
      <div style={{ backgroundColor:'var(--white)', border:'1px solid var(--line)', borderRadius:'8px', padding:'32px' }}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{ paddingBottom:'18px', marginBottom:'18px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start' }}>
    <div style={{ flex:1 }}>
      <h3 style={{ fontSize:'14px', fontWeight:600, color:'var(--ink)', margin:'0 0 7px' }}>{title}</h3>
      <p style={{ fontSize:'13px', lineHeight:'1.85', color:'var(--mid)', fontWeight:400, margin:0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 10px', border:'1px solid var(--plum-lt)', color:'var(--plum)', borderRadius:'20px', flexShrink:0 }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="Privacy Policy" sub="Legal">
      <IB title="Data We Collect"  body="Only your name, phone number, and delivery address — the minimum needed to process your order."/>
      <IB title="How We Use It"          body="Exclusively to fulfill and deliver your purchases. No commercial use."/>
      <IB title="Security"                 body="Your data is protected with standard encryption and secure infrastructure."/>
      <IB title="Data Sharing"        body="We never sell your data. It's shared only with trusted delivery partners."/>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="Terms of Service" sub="Legal">
      <IB title="Your Account"             body="You are responsible for the security of your login credentials and all activity under your account."/>
      <IB title="Payments"          body="No hidden fees. The displayed price is the final price."/>
      <IB title="Prohibited Use"  body="Authentic products only. No counterfeit goods." tag="Strict"/>
      <IB title="Governing Law"    body="These terms are governed by the laws of the People's Democratic Republic of Algeria."/>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="Cookies" sub="Legal">
      <IB title="Essential Cookies"    body="Required for sessions, cart, and checkout. Cannot be disabled." tag="Required"/>
      <IB title="Preference Cookies"     body="Save your settings for a better experience." tag="Optional"/>
      <IB title="Analytics Cookies"     body="Aggregated data to improve the platform." tag="Optional"/>
      <div style={{ marginTop:'16px', padding:'14px', border:'1px solid var(--line)', borderRadius:'8px', display:'flex', gap:'12px', alignItems:'flex-start', backgroundColor:'var(--soft)' }}>
        <ToggleRight style={{ width:'18px', height:'18px', color:'var(--plum)', flexShrink:0, marginTop:'1px' }}/>
        <p style={{ fontSize:'13px', color:'var(--mid)', lineHeight:'1.8', margin:0 }}>
          You can manage cookie preferences in your browser settings.
        </p>
      </div>
    </Shell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [sent, setSent] = useState(false);
  return (
    <div dir="ltr" style={{ backgroundColor:'var(--white)', minHeight:'100vh' }}>
      <div style={{ backgroundColor:'var(--soft)', padding:'56px 24px 40px', borderBottom:'1px solid var(--line)' }}>
        <div style={{ maxWidth:'960px', margin:'0 auto' }}>
          <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--plum)', marginBottom:'8px' }}>Contact</p>
          <h1 className="serif" style={{ fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:600, fontStyle:'italic', color:'var(--ink)', margin:'0 0 8px' }}>We're Happy to Help</h1>
          <p style={{ fontSize:'14px', color:'var(--dim)' }}>We Reply within 24 Hours 💄</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth:'960px', margin:'0 auto', padding:'36px 24px 80px' }}>
        <div>
          <div style={{ backgroundColor:'var(--white)', border:'1px solid var(--line)', borderRadius:'8px', padding:'24px', marginBottom:'12px' }}>
            <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--plum)', marginBottom:'16px' }}>Contact Methods</p>
            {[
              { icon:'📞', label:'Phone', val:'+213 550 000 000', href:'tel:+213550000000' },
              { icon:'✉️',  label:'Email', val:'info@store.dz',    href:'mailto:info@store.dz' },
              { icon:'📍', label:'Location', val:'Algeria',           href:undefined },
            ].map(item=>(
              <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'13px 0', borderBottom:'1px solid var(--line)', textDecoration:'none' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'8px', backgroundColor:'var(--soft)', border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--plum)', margin:'0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize:'13px', fontWeight:500, color:'var(--ink)', margin:0 }}>{item.val}</p>
                </div>
                {item.href && <ArrowRight style={{ width:'13px', height:'13px', color:'var(--dim)', marginRight:'auto' }}/>}
              </a>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor:'var(--white)', border:'1px solid var(--line)', borderRadius:'8px', padding:'28px' }}>
          <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--plum)', marginBottom:'20px' }}>Send Message</p>
          {sent ? (
            <div style={{ minHeight:'200px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid var(--line)', borderRadius:'8px', textAlign:'center', backgroundColor:'var(--soft)', padding:'32px' }}>
              <CheckCircle2 style={{ width:'32px', height:'32px', color:'var(--plum)', marginBottom:'12px' }}/>
              <h3 className="serif" style={{ fontSize:'1.3rem', fontStyle:'italic', color:'var(--ink)', margin:'0 0 6px' }}>Your Message Was Sent!</h3>
              <p style={{ fontSize:'13px', color:'var(--dim)' }}>We'll get back to you within 24 hours 💄</p>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[
                { label:'Your Name', type:'text',  key:'name',  ph:'Full Name' },
                { label:'Email', type:'email', key:'email', ph:'your@email.com' },
              ].map(f=>(
                <div key={f.key}>
                  <p style={{ fontSize:'12px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'6px' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required className="inp"
                    onFocus={e=>{e.target.style.borderColor='var(--plum)';}} onBlur={e=>{e.target.style.borderColor='var(--line-dk)';}}/>
                </div>
              ))}
              <div>
                <p style={{ fontSize:'12px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'6px' }}>Your Message</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="How can we help you?" rows={4} required className="inp"
                  style={{ resize:'none' as any }}
                  onFocus={e=>{e.target.style.borderColor='var(--plum)';}} onBlur={e=>{e.target.style.borderColor='var(--line-dk)';}}/>
              </div>
              <button type="submit" className="btn-plum" style={{ justifyContent:'center', width:'100%', fontSize:'14px', padding:'12px' }}>
                Send Message <ArrowRight style={{ width:'14px', height:'14px' }}/>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}