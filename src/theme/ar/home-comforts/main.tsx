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
  Menu, Package, Truck, RefreshCw, Leaf,
  HomeIcon,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,700&family=Jost:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

  :root {
    --cream:    #FDFBF7;
    --linen:    #F5F0E8;
    --linen-dk: #EDE5D8;
    --sand:     #D4B896;
    --sand-dk:  #C4A47E;
    --walnut:   #6B4F35;
    --walnut-lt:#8B6B4A;
    --terra:    #B8714E;
    --stone:    #8A7A6E;
    --ink:      #2C2420;
    --mid:      #6E5E54;
    --dim:      #A09288;
    --line:     rgba(107,79,53,0.12);
    --line-dk:  rgba(107,79,53,0.22);
  }

  body { background:var(--cream); color:var(--ink); font-family:'Jost',sans-serif; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:var(--sand); border-radius:2px; }

  /* Woven linen texture */
  .linen-tex {
    background-color:var(--linen);
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(107,79,53,0.025) 2px, rgba(107,79,53,0.025) 4px),
      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(107,79,53,0.018) 2px, rgba(107,79,53,0.018) 4px);
  }

  /* Grain texture overlay */
  .grain::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:1; border-radius:inherit;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.03'/%3E%3C/svg%3E");
    background-size:200px 200px; opacity:0.6; mix-blend-mode:multiply;
  }

  /* Animations */
  @keyframes fade-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  .fu   { animation:fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay:0.1s; }
  .fu-2 { animation-delay:0.22s; }
  .fu-3 { animation-delay:0.36s; }

  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes sway   { 0%,100%{transform:rotate(-1.5deg)} 50%{transform:rotate(1.5deg)} }

  /* Card */
  .h-card { background:var(--cream); transition:transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s; cursor:pointer; }
  .h-card:hover { transform:translateY(-5px); box-shadow:0 16px 48px rgba(44,36,32,0.1); }
  .h-card:hover .c-img img { transform:scale(1.04); }
  .c-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.6s cubic-bezier(0.22,1,0.36,1); }

  /* Serif heading */
  .serif { font-family:'Playfair Display',Georgia,serif; }

  /* Section label */
  .slabel { font-family:'Jost',sans-serif; font-size:11px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:var(--terra); display:flex; align-items:center; gap:10px; }
  .slabel::before { content:''; display:block; width:24px; height:1px; background:var(--terra); opacity:0.6; }

  /* Buttons */
  .btn-warm {
    display:inline-flex; align-items:center; gap:8px;
    background:var(--walnut); color:var(--cream);
    font-family:'Jost',sans-serif; font-size:13px; font-weight:500;
    letter-spacing:0.08em; padding:13px 28px;
    border:none; cursor:pointer; text-decoration:none;
    transition:background 0.25s, transform 0.25s, box-shadow 0.25s;
    border-radius:2px;
  }
  .btn-warm:hover { background:var(--terra); transform:translateY(-2px); box-shadow:0 8px 24px rgba(107,79,53,0.25); }

  .btn-outline-w {
    display:inline-flex; align-items:center; gap:8px;
    background:transparent; color:var(--walnut);
    border:1.5px solid var(--walnut); font-family:'Jost',sans-serif;
    font-size:13px; font-weight:500; letter-spacing:0.08em; padding:12px 26px;
    cursor:pointer; text-decoration:none; border-radius:2px; transition:all 0.25s;
  }
  .btn-outline-w:hover { background:var(--walnut); color:var(--cream); }

  /* Inputs */
  .inp {
    width:100%; padding:12px 14px;
    background:var(--cream); border:1.5px solid var(--line-dk);
    font-family:'Jost',sans-serif; font-size:13px; color:var(--ink);
    outline:none; border-radius:2px; transition:border-color 0.2s, box-shadow 0.2s;
    letter-spacing:0.02em;
  }
  .inp:focus { border-color:var(--walnut); box-shadow:0 0 0 3px rgba(107,79,53,0.1); }
  .inp::placeholder { color:var(--dim); }
  .inp-err { border-color:var(--terra) !important; }
  select.inp { appearance:none; cursor:pointer; }

  /* Ornamental divider */
  .orn-div { display:flex; align-items:center; gap:16px; }
  .orn-div::before, .orn-div::after { content:''; flex:1; height:1px; background:linear-gradient(to right,transparent,var(--sand)); }
  .orn-div::after { background:linear-gradient(to left,transparent,var(--sand)); }

  /* Responsive */
  .nav-links   { display:flex; align-items:center; gap:32px; }
  .nav-toggle  { display:none; }
  .hero-grid   { display:grid; grid-template-columns:1fr 1fr; min-height:92vh; }
  .prod-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
  .cat-grid    { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .trust-bar   { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g    { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:56px; }
  .details-g   { display:grid; grid-template-columns:1fr 1fr; }
  .details-L   { position:sticky; top:72px; height:calc(100vh - 72px); overflow:hidden; }
  .details-R   { padding:48px 40px 80px; }
  .contact-g   { display:grid; grid-template-columns:1fr 1fr; gap:56px; }
  .form-2c     { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c      { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

  @media (max-width:1100px) {
    .prod-grid  { grid-template-columns:repeat(3,1fr); }
    .footer-g   { grid-template-columns:1fr 1fr; gap:36px; }
  }
  @media (max-width:768px) {
    .nav-links  { display:none; }
    .nav-toggle { display:flex; }
    .hero-grid  { grid-template-columns:1fr; min-height:auto; }
    .prod-grid  { grid-template-columns:repeat(2,1fr); gap:14px; }
    .cat-grid   { grid-template-columns:repeat(2,1fr); }
    .trust-bar  { grid-template-columns:repeat(2,1fr); }
    .footer-g   { grid-template-columns:1fr 1fr; gap:28px; }
    .details-g  { grid-template-columns:1fr; }
    .details-L  { position:static; height:70vw; min-height:280px; }
    .details-R  { padding:24px 16px 48px; }
    .contact-g  { grid-template-columns:1fr; gap:28px; }
  }
  @media (max-width:480px) {
    .prod-grid  { grid-template-columns:repeat(2,1fr); gap:10px; }
    .footer-g   { grid-template-columns:1fr; gap:24px; }
    .form-2c    { grid-template-columns:1fr; }
    .dlv-2c     { grid-template-columns:1fr; }
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

/* ── DECORATIVE ─────────────────────────────────────────────── */
function LeafSprig({ style }: { style?:React.CSSProperties }) {
  return (
    <svg width="28" height="40" viewBox="0 0 28 40" fill="none" style={{ ...style, animation:'sway 5s ease-in-out infinite' }}>
      <path d="M14 38 C14 38 14 20 14 4" stroke="var(--walnut-lt)" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <path d="M14 22 C14 22 6 18 4 10 C6 10 14 14 14 22Z" fill="var(--walnut-lt)" opacity="0.3"/>
      <path d="M14 28 C14 28 22 24 24 16 C22 16 14 20 14 28Z" fill="var(--walnut-lt)" opacity="0.25"/>
      <path d="M14 16 C14 16 8 10 10 4 C12 5 14 10 14 16Z" fill="var(--walnut-lt)" opacity="0.2"/>
    </svg>
  );
}

function WarmDivider() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'16px', margin:'6px 0' }}>
      <div style={{ flex:1, height:'1px', background:'linear-gradient(to right,transparent,var(--sand-dk))' }}/>
      <LeafSprig style={{ width:'16px', height:'22px', opacity:0.6 }}/>
      <div style={{ flex:1, height:'1px', background:'linear-gradient(to left,transparent,var(--sand-dk))' }}/>
    </div>
  );
}

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
  const [open, setOpen]         = useState(false);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>8);
    window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h);
  },[]);

  if (!store) return null;

  const links = [
    { href:`/${store.subdomain}`,         label:'المتجر'   },
    { href:`/${store.subdomain}/contact`, label:'تواصل'    },
    { href:`/${store.subdomain}/Privacy`, label:'الخصوصية' },
  ];

  return (
    <nav dir="rtl" style={{
      position:'sticky', top:0, zIndex:50,
      backgroundColor:scrolled?'rgba(253,251,247,0.96)':'var(--cream)',
      backdropFilter:scrolled?'blur(16px)':'none',
      borderBottom:scrolled?'1px solid var(--line)':'1px solid transparent',
      transition:'all 0.4s',
    }}>
      {/* Topbar ticker */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ backgroundColor:'var(--walnut)', overflow:'hidden', whiteSpace:'nowrap', padding:'7px 0' }}>
          <div style={{ display:'inline-block', animation:'ticker 24s linear infinite' }}>
            {Array(10).fill(null).map((_,i)=>(
              <span key={i} style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:400, letterSpacing:'0.14em', color:'rgba(253,251,247,0.8)', margin:'0 40px', display:'inline-flex', alignItems:'center', gap:'10px' }}>
                <Leaf style={{ width:'10px', height:'10px', opacity:0.7 }}/> {store.topBar.text}
              </span>
            ))}
            {Array(10).fill(null).map((_,i)=>(
              <span key={`b${i}`} style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:400, letterSpacing:'0.14em', color:'rgba(253,251,247,0.8)', margin:'0 40px', display:'inline-flex', alignItems:'center', gap:'10px' }}>
                <Leaf style={{ width:'10px', height:'10px', opacity:0.7 }}/> {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 28px', height:'70px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        {/* Logo */}
        <Link href={`/${store.subdomain}`} style={{ textDecoration:'none', flexShrink:0, display:'flex', alignItems:'center', gap:'10px' }}>
          {store.design?.logoUrl
            ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'32px', width:'auto', objectFit:'contain' }}/>
            : (
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <LeafSprig style={{ width:'18px', height:'26px' }}/>
                <div>
                  <span className="serif" style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--ink)', letterSpacing:'0.02em', display:'block', lineHeight:1 }}>
                    {store.name}
                  </span>
                  <span style={{ fontFamily:"'Jost',sans-serif", fontSize:'9px', letterSpacing:'0.22em', color:'var(--dim)', textTransform:'uppercase', display:'block', marginTop:'2px' }}>
                    Home & Living
                  </span>
                </div>
              </div>
            )
          }
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map(l=>(
            <Link key={l.href} href={l.href}
              style={{ fontFamily:"'Jost',sans-serif", fontSize:'14px', fontWeight:400, letterSpacing:'0.06em', color:'var(--mid)', textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--walnut)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
              {l.label}
            </Link>
          ))}
          <a href="#products" className="btn-warm" style={{ padding:'10px 22px', fontSize:'13px' }}>
            <HomeIcon style={{ width:'14px', height:'14px' }}/> تسوق الآن
          </a>
        </div>

        <button className="nav-toggle" onClick={()=>setOpen(p=>!p)} style={{ background:'none', border:'1px solid var(--line-dk)', cursor:'pointer', color:'var(--walnut)', padding:'8px', borderRadius:'2px', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {open ? <X style={{ width:'18px', height:'18px' }}/> : <Menu style={{ width:'18px', height:'18px' }}/>}
        </button>
      </div>

      {/* Mobile menu */}
      <div style={{ maxHeight:open?'240px':'0', overflow:'hidden', transition:'max-height 0.35s ease', borderTop:open?'1px solid var(--line)':'none', backgroundColor:'var(--cream)' }}>
        <div style={{ padding:'10px 28px 20px' }}>
          {links.map(l=>(
            <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', fontSize:'15px', fontWeight:400, letterSpacing:'0.06em', color:'var(--mid)', textDecoration:'none', borderBottom:'1px solid var(--line)' }}>
              {l.label} <ArrowRight style={{ width:'14px', height:'14px', color:'var(--sand-dk)' }}/>
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
    <footer dir="rtl" style={{ position:'relative', overflow:'hidden', fontFamily:"'Jost',sans-serif" }} className="linen-tex grain">
      {/* Decorative leaf sprigs */}
      <div style={{ position:'absolute', left:'5%', top:'20px', opacity:0.15, pointerEvents:'none' }}>
        <LeafSprig style={{ width:'40px', height:'60px' }}/>
      </div>
      <div style={{ position:'absolute', right:'8%', bottom:'20px', opacity:0.12, pointerEvents:'none', transform:'rotate(180deg)' }}>
        <LeafSprig style={{ width:'32px', height:'48px' }}/>
      </div>

      <div style={{ position:'relative', zIndex:2, maxWidth:'1280px', margin:'0 auto', padding:'64px 28px 40px' }}>
        <div className="footer-g" style={{ paddingBottom:'48px', borderBottom:'1px solid var(--line-dk)' }}>

          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
              <LeafSprig style={{ width:'18px', height:'26px' }}/>
              <span className="serif" style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--ink)', letterSpacing:'0.02em' }}>{store.name}</span>
            </div>
            <p style={{ fontSize:'13px', lineHeight:'1.9', color:'var(--mid)', maxWidth:'220px', fontWeight:300, letterSpacing:'0.03em' }}>
              أجمل قطع الأثاث والديكور لمنزل دافئ ومريح.
            </p>
            <WarmDivider/>
            <div style={{ display:'flex', gap:'8px', marginTop:'4px', flexWrap:'wrap' }}>
              {['🛋️','🪴','🕯️','🏺'].map((e,i)=>(
                <div key={i} style={{ width:'32px', height:'32px', border:'1px solid var(--line-dk)', borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', backgroundColor:'var(--cream)' }}>{e}</div>
              ))}
            </div>
          </div>

          {[
            { title:'روابط', links:[
              [`/${store.subdomain}`,          'كل المنتجات'],
              [`/${store.subdomain}/Privacy`,  'الخصوصية'],
              [`/${store.subdomain}/Terms`,    'الشروط'],
              [`/${store.subdomain}/Cookies`,  'الكوكيز'],
            ]},
            { title:'الفئات', links:[
              ['#','أثاث الصالون'],['#','غرفة النوم'],['#','المطبخ'],['#','الديكور'],
            ]},
            { title:'تواصل', links:[
              ['#','+213 550 000 000'],['#','الجزائر، الجزائر'],['#','info@store.dz'],
            ]},
          ].map(col=>(
            <div key={col.title}>
              <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--terra)', marginBottom:'18px' }}>{col.title}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'11px' }}>
                {col.links.map(([href,label])=>(
                  <a key={label} href={href} style={{ fontSize:'13px', color:'var(--mid)', textDecoration:'none', letterSpacing:'0.04em', fontWeight:300, transition:'color 0.2s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--walnut)';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop:'20px', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
          <p style={{ fontSize:'12px', color:'var(--dim)', letterSpacing:'0.06em' }}>© {yr} {store.name}. جميع الحقوق محفوظة.</p>
          <p style={{ fontSize:'12px', color:'var(--dim)', letterSpacing:'0.06em' }}>Warm Home Theme</p>
        </div>
      </div>
    </footer>
  );
}

/* ── CARD ───────────────────────────────────────────────────── */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [hov, setHov] = useState(false);
  if (!product || !store) return null;
  const price = typeof product.price==='string' ? parseFloat(product.price) : product.price as number;
  const orig  = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="h-card" style={{ border:'1px solid var(--line)', borderRadius:'2px', overflow:'hidden' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>

      <div className="c-img" style={{ position:'relative', aspectRatio:'4/5', overflow:'hidden', backgroundColor:'var(--linen)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }} className="linen-tex">
              <Home style={{ width:'40px', height:'40px', color:'var(--sand)' }}/>
            </div>
        }
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(44,36,32,0.45) 0%, transparent 55%)', pointerEvents:'none', opacity:hov?1:0, transition:'opacity 0.35s' }}/>

        {/* Hover CTA */}
        <div style={{ position:'absolute', bottom:'14px', left:'14px', right:'14px', opacity:hov?1:0, transform:hov?'translateY(0)':'translateY(6px)', transition:'all 0.35s' }}>
          <Link href={`/${store.subdomain}/product/${product.slug||product.id}`}
            className="btn-warm" style={{ width:'100%', justifyContent:'center', fontSize:'12px', padding:'10px', textDecoration:'none', borderRadius:'2px' }}>
            {viewDetails} <ArrowRight style={{ width:'12px', height:'12px' }}/>
          </Link>
        </div>

        {/* Discount */}
        {discount>0 && (
          <div style={{ position:'absolute', top:'12px', right:'12px', backgroundColor:'var(--terra)', color:'var(--cream)', fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'2px', letterSpacing:'0.06em' }}>
            -{discount}%
          </div>
        )}

        {/* Wishlist */}
        <button style={{ position:'absolute', top:'12px', left:'12px', width:'32px', height:'32px', borderRadius:'50%', backgroundColor:'rgba(253,251,247,0.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:hov?1:0, transition:'opacity 0.3s', color:'var(--mid)' }}>
          <Heart style={{ width:'13px', height:'13px' }}/>
        </button>
      </div>

      {/* Info */}
      <div style={{ padding:'14px 12px', backgroundColor:'var(--cream)' }}>
        <div style={{ display:'flex', gap:'2px', marginBottom:'6px' }}>
          {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'10px', height:'10px', fill:i<4?'var(--sand-dk)':'none', color:'var(--sand-dk)' }}/>)}
        </div>
        <h3 className="serif" style={{ fontSize:'1rem', fontWeight:400, fontStyle:'italic', color:'var(--ink)', marginBottom:'6px', lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display:'flex', alignItems:'baseline', gap:'8px', flexWrap:'wrap' }}>
          <span className="serif" style={{ fontSize:'1.2rem', fontWeight:500, color:'var(--walnut)', letterSpacing:'-0.01em' }}>
            {price.toLocaleString()}
            <span style={{ fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'11px', color:'var(--mid)', marginRight:'3px' }}>دج</span>
          </span>
          {orig>price && <span style={{ fontSize:'12px', color:'var(--dim)', textDecoration:'line-through' }}>{orig.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── HOME ───────────────────────────────────────────────────── */
export function Home({ store }: any) {
  if (!store) return null;
  const products: any[] = store.products || [];
  const cats: any[]     = store.categories || [];

  const trust = [
    { icon:<Truck style={{ width:'20px', height:'20px' }}/>,     color:'var(--walnut)', title:'توصيل آمن', desc:'توصيل لجميع ولايات الجزائر' },
    { icon:<RefreshCw style={{ width:'20px', height:'20px' }}/>,  color:'var(--terra)',  title:'إرجاع مجاني', desc:'30 يوم لإرجاع أي منتج' },
    { icon:<Shield style={{ width:'20px', height:'20px' }}/>,     color:'var(--walnut)', title:'جودة مضمونة', desc:'منتجات مختارة بعناية' },
    { icon:<Phone style={{ width:'20px', height:'20px' }}/>,      color:'var(--terra)',  title:'دعم العملاء', desc:'نحن هنا دائماً لمساعدتك' },
  ];

  return (
    <div dir="rtl">

      {/* ── HERO ── */}
      <section className="hero-grid" style={{ overflow:'hidden' }}>

        {/* RIGHT: text */}
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'8vw 6vw', backgroundColor:'var(--cream)', position:'relative', overflow:'hidden' }}>
          {/* Background grain */}
          <div style={{ position:'absolute', inset:0, opacity:0.4 }} className="linen-tex"/>
          {/* Leaf decoration */}
          <div style={{ position:'absolute', left:'16px', top:'40px', opacity:0.2 }}>
            <LeafSprig style={{ width:'32px', height:'48px' }}/>
          </div>
          <div style={{ position:'absolute', right:'16px', bottom:'40px', opacity:0.15, transform:'rotate(180deg)' }}>
            <LeafSprig style={{ width:'24px', height:'36px' }}/>
          </div>

          <div style={{ position:'relative', zIndex:2 }}>
            <div className="fu slabel" style={{ marginBottom:'20px' }}>
              {store.hero?.title ? 'مجموعة جديدة' : 'أثاث وديكور'}
            </div>

            <h1 className="fu fu-1 serif" style={{ fontSize:'clamp(2.4rem,5.5vw,4.8rem)', fontWeight:700, fontStyle:'italic', color:'var(--ink)', lineHeight:0.92, letterSpacing:'-0.01em', marginBottom:'20px' }}>
              {store.hero?.title
                ? store.hero.title
                : <><span>منزلك</span><br/><span style={{ color:'var(--walnut)' }}>أجمل مكان</span></>
              }
            </h1>

            <WarmDivider/>

            <p className="fu fu-2" style={{ fontSize:'15px', lineHeight:'1.85', color:'var(--mid)', margin:'16px 0 36px', maxWidth:'400px', fontWeight:300, letterSpacing:'0.03em' }}>
              {store.hero?.subtitle || 'اكتشف مجموعتنا من قطع الأثاث والديكور المختارة بعناية لتمنح منزلك الدفء والأناقة.'}
            </p>

            <div className="fu fu-3" style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
              <a href="#products" className="btn-warm" style={{ fontSize:'14px', padding:'14px 32px' }}>
                <Home style={{ width:'15px', height:'15px' }}/> استكشف المجموعة
              </a>
              {cats.length>0 && (
                <a href="#categories" className="btn-outline-w" style={{ fontSize:'14px', padding:'13px 28px' }}>
                  تصفح الفئات <ArrowRight style={{ width:'14px', height:'14px' }}/>
                </a>
              )}
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:'32px', marginTop:'48px', paddingTop:'32px', borderTop:'1px solid var(--line-dk)', flexWrap:'wrap' }}>
              {[
                { n:`${products.length}+`, l:'قطعة ديكور', c:'var(--walnut)' },
                { n:'48H',   l:'توصيل سريع', c:'var(--terra)' },
                { n:'100%',  l:'جودة مضمونة', c:'var(--walnut)' },
              ].map((s,i)=>(
                <div key={i}>
                  <p className="serif" style={{ fontSize:'2rem', fontWeight:700, color:s.c, lineHeight:1, margin:0, letterSpacing:'-0.01em' }}>{s.n}</p>
                  <p style={{ fontSize:'11px', color:'var(--dim)', margin:'4px 0 0', fontWeight:400, letterSpacing:'0.1em', textTransform:'uppercase' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LEFT: full-bleed image */}
        <div style={{ position:'relative', overflow:'hidden', minHeight:'560px', backgroundColor:'var(--linen)' }}>
          {store.hero?.imageUrl
            ? <img src={store.hero.imageUrl} alt={store.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            : (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }} className="linen-tex">
                <div style={{ textAlign:'center', opacity:0.3 }}>
                  <Home style={{ width:'72px', height:'72px', color:'var(--walnut)', margin:'0 auto 12px' }}/>
                  <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', letterSpacing:'0.2em', color:'var(--walnut)', textTransform:'uppercase' }}>صورة المتجر</p>
                </div>
              </div>
            )
          }
          {/* Warm overlay at edges */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to left, rgba(253,251,247,0.25) 0%, transparent 30%)', pointerEvents:'none' }}/>
          {/* Bottom info tag */}
          <div style={{ position:'absolute', bottom:'20px', left:'20px', backgroundColor:'rgba(253,251,247,0.92)', backdropFilter:'blur(12px)', padding:'12px 18px', borderRadius:'2px', boxShadow:'0 4px 20px rgba(44,36,32,0.12)', border:'1px solid var(--line)' }}>
            <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'10px', letterSpacing:'0.18em', color:'var(--mid)', textTransform:'uppercase', margin:0 }}>مجموعة {new Date().getFullYear()}</p>
            <p className="serif" style={{ fontSize:'1rem', fontWeight:500, fontStyle:'italic', color:'var(--ink)', margin:'2px 0 0' }}>Warm & Cozy Living</p>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ borderTop:'1px solid var(--line-dk)', borderBottom:'1px solid var(--line-dk)', backgroundColor:'var(--linen-dk)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div className="trust-bar">
            {trust.map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'18px 24px', borderLeft:i>0?'1px solid var(--line)':'none' }}>
                <div style={{ color:item.color, flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', fontWeight:600, color:'var(--ink)', margin:0 }}>{item.title}</p>
                  <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', color:'var(--dim)', margin:0, fontWeight:300 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length>0 && (
        <section id="categories" style={{ padding:'80px 0', backgroundColor:'var(--cream)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 28px' }}>
            <div style={{ textAlign:'center', marginBottom:'48px' }}>
              <div className="slabel" style={{ justifyContent:'center', marginBottom:'12px' }}>تسوق حسب الفئة</div>
              <h2 className="serif" style={{ fontSize:'clamp(1.8rem,3.5vw,2.8rem)', fontWeight:700, fontStyle:'italic', color:'var(--ink)', margin:'0 0 16px', letterSpacing:'-0.01em' }}>
                اكتشف مجموعاتنا
              </h2>
              <WarmDivider/>
            </div>
            <div className="cat-grid">
              {cats.slice(0,6).map((cat:any,i:number)=>(
                <Link key={cat.id} href={`/${store.subdomain}?category=${cat.id}`}
                  style={{ display:'block', textDecoration:'none', borderRadius:'2px', overflow:'hidden', border:'1px solid var(--line)', aspectRatio:'4/3', backgroundColor:'var(--linen)', position:'relative', transition:'all 0.35s' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 12px 36px rgba(44,36,32,0.12)'; el.style.transform='translateY(-4px)'; el.style.borderColor='var(--sand-dk)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.boxShadow='none'; el.style.transform='translateY(0)'; el.style.borderColor='var(--line)';}}>
                  {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', opacity:0.7 }}/>}
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(44,36,32,0.75) 0%, rgba(44,36,32,0.2) 60%, transparent 100%)', display:'flex', alignItems:'flex-end', padding:'16px' }}>
                    <span className="serif" style={{ fontSize:'1.1rem', fontWeight:400, fontStyle:'italic', color:'var(--cream)' }}>{cat.name}</span>
                  </div>
                  {!cat.imageUrl && (
                    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px' }} className="linen-tex">
                      <Home style={{ width:'28px', height:'28px', color:'var(--sand-dk)', opacity:0.6 }}/>
                      <span className="serif" style={{ fontSize:'1rem', fontStyle:'italic', color:'var(--mid)' }}>{cat.name}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding:'80px 0', backgroundColor:'var(--linen)' }} className="linen-tex">
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 28px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'44px' }}>
            <div>
              <div className="slabel" style={{ marginBottom:'10px' }}>مجموعتنا</div>
              <h2 className="serif" style={{ fontSize:'clamp(1.8rem,3vw,2.6rem)', fontWeight:700, fontStyle:'italic', color:'var(--ink)', margin:0, letterSpacing:'-0.01em' }}>
                اكتشف المزيد
              </h2>
            </div>
            <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', color:'var(--dim)', fontWeight:300 }}>{products.length} قطعة</p>
          </div>

          {products.length===0 ? (
            <div style={{ padding:'80px 0', textAlign:'center', border:'1px solid var(--line-dk)', borderRadius:'2px', backgroundColor:'var(--cream)' }}>
              <LeafSprig style={{ width:'32px', height:'48px', margin:'0 auto 16px' }}/>
              <p className="serif" style={{ fontSize:'1.4rem', fontStyle:'italic', color:'var(--dim)' }}>المجموعة قادمة قريباً</p>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((p:any)=>{
                const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض المنتج"/>;
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ position:'relative', padding:'96px 28px', overflow:'hidden', backgroundColor:'var(--walnut)', textAlign:'center' }}>
        {/* Background image faint */}
        {store.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.08, display:'block' }}/>
        )}
        {/* Texture */}
        <div style={{ position:'absolute', inset:0, opacity:0.3 }} className="linen-tex"/>
        {/* Leaf decorations */}
        <div style={{ position:'absolute', right:'5%', top:'20px', opacity:0.15, pointerEvents:'none' }}>
          <LeafSprig style={{ width:'40px', height:'60px' }}/>
        </div>
        <div style={{ position:'absolute', left:'8%', bottom:'20px', opacity:0.12, pointerEvents:'none', transform:'rotate(180deg)' }}>
          <LeafSprig style={{ width:'32px', height:'48px' }}/>
        </div>

        <div style={{ position:'relative', zIndex:2, maxWidth:'600px', margin:'0 auto' }}>
          <div className="slabel" style={{ justifyContent:'center', marginBottom:'16px', color:'var(--sand)' }}>
            أجمل منزل يبدأ من هنا
          </div>
          <h2 className="serif" style={{ fontSize:'clamp(2rem,5vw,4rem)', fontWeight:700, fontStyle:'italic', color:'var(--cream)', lineHeight:1.05, marginBottom:'18px', letterSpacing:'-0.01em' }}>
            اصنع بيتك<br/>بيدك
          </h2>
          <WarmDivider/>
          <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'15px', lineHeight:'1.8', color:'rgba(253,251,247,0.7)', margin:'16px 0 32px', fontWeight:300, letterSpacing:'0.03em' }}>
            كل قطعة في مجموعتنا مختارة بعناية لتضيف الدفء والأناقة لكل ركن في منزلك.
          </p>
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="#products" style={{ display:'inline-flex', alignItems:'center', gap:'8px', backgroundColor:'var(--cream)', color:'var(--walnut)', fontFamily:"'Jost',sans-serif", fontWeight:600, fontSize:'14px', letterSpacing:'0.06em', padding:'14px 32px', textDecoration:'none', borderRadius:'2px', transition:'all 0.25s', boxShadow:'0 4px 20px rgba(44,36,32,0.2)' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='var(--linen)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='var(--cream)';}}>
              <Home style={{ width:'15px', height:'15px' }}/> تسوق الآن
            </a>
            <Link href={`/${store.subdomain}/contact`} className="btn-outline-w" style={{ borderColor:'rgba(253,251,247,0.5)', color:'var(--cream)', textDecoration:'none', padding:'13px 28px' }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.background='rgba(253,251,247,0.15)'; el.style.borderColor='var(--cream)';}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.borderColor='rgba(253,251,247,0.5)';}}>
              <Phone style={{ width:'15px', height:'15px' }}/> تواصل معنا
            </Link>
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
      <div style={{ borderBottom:'1px solid var(--line)', padding:'12px 28px', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'var(--dim)', letterSpacing:'0.08em', backgroundColor:'var(--linen)' }}>
        <Link href="/" style={{ textDecoration:'none', color:'var(--mid)', transition:'color 0.2s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--walnut)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
          الرئيسية
        </Link>
        <span style={{ color:'var(--sand-dk)' }}>›</span>
        <span style={{ color:'var(--walnut)', fontWeight:500 }}>{product.name.slice(0,40)}</span>
        <div style={{ marginRight:'auto', display:'flex', gap:'8px' }}>
          <button onClick={toggleWishlist} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isWishlisted?'var(--terra)':'var(--line-dk)'}`, background:isWishlisted?'rgba(184,113,78,0.1)':'transparent', cursor:'pointer', color:isWishlisted?'var(--terra)':'var(--mid)', borderRadius:'2px' }}>
            <Heart style={{ width:'13px', height:'13px', fill:isWishlisted?'currentColor':'none' }}/>
          </button>
          <button onClick={handleShare} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--mid)', borderRadius:'2px' }}>
            <Share2 style={{ width:'13px', height:'13px' }}/>
          </button>
        </div>
      </div>

      <div className="details-g" style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 28px' }}>
        {/* Gallery */}
        <div className="details-L" style={{ paddingTop:'32px' }}>
          <div style={{ position:'relative', aspectRatio:'4/5', overflow:'hidden', backgroundColor:'var(--linen)', borderRadius:'2px' }}>
            {allImages.length>0
              ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }} className="linen-tex">
                  <Home style={{ width:'64px', height:'64px', color:'var(--sand)' }}/>
                </div>
            }
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(44,36,32,0.5) 0%, transparent 45%)', pointerEvents:'none' }}/>
            {discount>0 && <div style={{ position:'absolute', top:'14px', right:'14px', backgroundColor:'var(--terra)', color:'var(--cream)', fontSize:'11px', fontWeight:600, padding:'4px 12px', borderRadius:'2px', letterSpacing:'0.08em' }}>-{discount}%</div>}

            {allImages.length>1 && (
              <>
                <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', border:'1px solid rgba(253,251,247,0.5)', borderRadius:'50%', backgroundColor:'rgba(253,251,247,0.85)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronRight style={{ width:'15px', height:'15px', color:'var(--walnut)' }}/>
                </button>
                <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', border:'1px solid rgba(253,251,247,0.5)', borderRadius:'50%', backgroundColor:'rgba(253,251,247,0.85)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronLeft style={{ width:'15px', height:'15px', color:'var(--walnut)' }}/>
                </button>
              </>
            )}
            {!inStock&&!autoGen && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(253,251,247,0.85)', backdropFilter:'blur(4px)' }}>
                <span className="serif" style={{ fontSize:'1.8rem', fontStyle:'italic', color:'var(--mid)' }}>نفد المخزون</span>
              </div>
            )}

            {/* Price tag at bottom */}
            <div style={{ position:'absolute', bottom:'14px', left:'14px' }}>
              <span className="serif" style={{ fontSize:'2rem', fontWeight:500, color:'var(--cream)', letterSpacing:'-0.01em' }}>
                {finalPrice.toLocaleString()}
                <span style={{ fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'13px', marginRight:'5px', opacity:0.8 }}>دج</span>
              </span>
            </div>
          </div>

          {allImages.length>1 && (
            <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
              {allImages.slice(0,5).map((img:string,idx:number)=>(
                <button key={idx} onClick={()=>setSel(idx)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`2px solid ${sel===idx?'var(--walnut)':'var(--line-dk)'}`, cursor:'pointer', padding:0, background:'none', borderRadius:'2px', opacity:sel===idx?1:0.55 }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="details-R">
          <div className="slabel" style={{ marginBottom:'14px' }}>أثاث وديكور</div>
          <h1 className="serif" style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:700, fontStyle:'italic', color:'var(--ink)', lineHeight:0.95, marginBottom:'16px', letterSpacing:'-0.01em' }}>
            {product.name}
          </h1>

          {/* Stars + stock */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line-dk)', flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:'2px' }}>
              {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'13px', height:'13px', fill:i<4?'var(--sand-dk)':'none', color:'var(--sand-dk)' }}/>)}
            </div>
            <span style={{ fontFamily:"'Jost',sans-serif", fontSize:'12px', color:'var(--dim)' }}>4.8 (128 تقييم)</span>
            <span style={{ marginRight:'auto', padding:'5px 14px', borderRadius:'20px', backgroundColor:inStock||autoGen?'rgba(107,79,53,0.08)':'rgba(184,113,78,0.08)', color:inStock||autoGen?'var(--walnut)':'var(--terra)', fontSize:'12px', fontWeight:500, border:`1px solid ${inStock||autoGen?'var(--walnut)':'var(--terra)'}` }}>
              {autoGen?'∞ متوفر':inStock?'متوفر':'نفد المخزون'}
            </span>
          </div>

          {/* Price */}
          <div style={{ marginBottom:'24px', padding:'18px', backgroundColor:'var(--linen)', borderRadius:'2px', border:'1px solid var(--line)' }}>
            <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--mid)', margin:'0 0 6px' }}>السعر</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:'12px', flexWrap:'wrap' }}>
              <span className="serif" style={{ fontSize:'2.8rem', fontWeight:500, color:'var(--walnut)', lineHeight:1, letterSpacing:'-0.02em' }}>{finalPrice.toLocaleString()}</span>
              <span style={{ fontFamily:"'Jost',sans-serif", fontSize:'15px', color:'var(--mid)' }}>دج</span>
              {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                <>
                  <span style={{ fontSize:'15px', textDecoration:'line-through', color:'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                  <span style={{ fontSize:'12px', color:'var(--terra)', fontWeight:500, padding:'2px 8px', backgroundColor:'rgba(184,113,78,0.1)', borderRadius:'2px' }}>
                    وفّر {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Offers */}
          {product.offers?.length>0 && (
            <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line)' }}>
              <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'12px' }}>الباقات</p>
              {product.offers.map((offer:any)=>(
                <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', border:`1.5px solid ${selectedOffer===offer.id?'var(--walnut)':'var(--line-dk)'}`, cursor:'pointer', marginBottom:'8px', borderRadius:'2px', transition:'all 0.2s', backgroundColor:selectedOffer===offer.id?'rgba(107,79,53,0.04)':'transparent' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'17px', height:'17px', borderRadius:'50%', border:`2px solid ${selectedOffer===offer.id?'var(--walnut)':'var(--dim)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {selectedOffer===offer.id&&<div style={{ width:'9px', height:'9px', borderRadius:'50%', background:'var(--walnut)' }}/>}
                    </div>
                    <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                    <div>
                      <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', fontWeight:500, color:'var(--ink)', margin:0 }}>{offer.name}</p>
                      <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', color:'var(--dim)', margin:0 }}>الكمية: {offer.quantity}</p>
                    </div>
                  </div>
                  <span className="serif" style={{ fontSize:'1.2rem', fontWeight:500, color:'var(--walnut)' }}>
                    {offer.price.toLocaleString()} <span style={{ fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'12px', color:'var(--mid)' }}>دج</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--line)' }}>
              <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'10px' }}>{attr.name}</p>
              {attr.displayMode==='color' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'28px', height:'28px', backgroundColor:v.value, border:'none', cursor:'pointer', borderRadius:'50%', outline:s?'2.5px solid var(--walnut)':'2.5px solid transparent', outlineOffset:'3px' }}/>;})}
                </div>
              ):attr.displayMode==='image' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`2px solid ${s?'var(--walnut)':'var(--line-dk)'}`, cursor:'pointer', padding:0, borderRadius:'2px' }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                </div>
              ):(
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ padding:'8px 16px', border:`1.5px solid ${s?'var(--walnut)':'var(--line-dk)'}`, backgroundColor:s?'var(--walnut)':'transparent', color:s?'var(--cream)':'var(--mid)', fontFamily:"'Jost',sans-serif", fontSize:'13px', fontWeight:500, cursor:'pointer', borderRadius:'2px', transition:'all 0.2s' }}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{ marginTop:'28px', paddingTop:'24px', borderTop:'1px solid var(--line)' }}>
              <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'12px' }}>وصف المنتج</p>
              <div style={{ fontFamily:"'Jost',sans-serif", fontSize:'14px', lineHeight:'1.85', color:'var(--mid)', fontWeight:300 }}
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
    {label && <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', color:'var(--mid)', marginBottom:'6px', textTransform:'uppercase' }}>{label}</p>}
    {children}
    {error && <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', color:'var(--terra)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
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
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault(); const er=validate(); if(Object.keys(er).length){setErrors(er);return;} setErrors({}); setSub(true);
    try{
      await axios.post(`${API_URL}/orders/create`,{...fd,productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()});
      if(typeof window!=='undefined'&&fd.customerId) localStorage.setItem('customerId',fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    }catch(err){console.error(err);}finally{setSub(false);}
  };

  return (
    <div style={{ marginTop:'24px', paddingTop:'22px', borderTop:'1px solid var(--line-dk)' }}>
      <form onSubmit={handleSubmit}>
        <div className="form-2c">
          <FR error={errors.customerName} label="الاسم">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="الاسم الكامل"
                className={`inp${errors.customerName?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--walnut)';}} onBlur={e=>{e.target.style.borderColor=errors.customerName?'var(--terra)':'var(--line-dk)';}}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="الهاتف">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX"
                className={`inp${errors.customerPhone?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--walnut)';}} onBlur={e=>{e.target.style.borderColor=errors.customerPhone?'var(--terra)':'var(--line-dk)';}}/>
            </div>
          </FR>
        </div>
        <div className="form-2c">
          <FR error={errors.customerWelaya} label="الولاية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                className={`inp${errors.customerWelaya?' inp-err':''}`} style={{ paddingRight:'34px' }}
                onFocus={e=>{e.target.style.borderColor='var(--walnut)';}} onBlur={e=>{e.target.style.borderColor=errors.customerWelaya?'var(--terra)':'var(--line-dk)';}}>
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
                onFocus={e=>{e.target.style.borderColor='var(--walnut)';}} onBlur={e=>{e.target.style.borderColor=errors.customerCommune?'var(--terra)':'var(--line-dk)';}}>
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
                style={{ padding:'13px 10px', border:`1.5px solid ${fd.typeLivraison===type?'var(--walnut)':'var(--line-dk)'}`, backgroundColor:fd.typeLivraison===type?'rgba(107,79,53,0.05)':'transparent', cursor:'pointer', textAlign:'right', borderRadius:'2px', transition:'all 0.2s' }}>
                <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'12px', fontWeight:600, color:fd.typeLivraison===type?'var(--walnut)':'var(--mid)', margin:'0 0 4px', letterSpacing:'0.04em' }}>
                  {type==='home'?'توصيل للبيت':'توصيل للمكتب'}
                </p>
                {selW && <p className="serif" style={{ fontSize:'1.1rem', fontWeight:500, color:fd.typeLivraison===type?'var(--terra)':'var(--dim)', margin:0 }}>
                  {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()}
                  <span style={{ fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'11px', marginRight:'3px', color:'var(--mid)' }}>دج</span>
                </p>}
              </button>
            ))}
          </div>
        </FR>

        <FR label="الكمية">
          <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid var(--line-dk)', borderRadius:'2px', overflow:'hidden', backgroundColor:'var(--cream)' }}>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--walnut)', transition:'background 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--linen-dk)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Minus style={{ width:'12px', height:'12px' }}/>
            </button>
            <span className="serif" style={{ width:'44px', textAlign:'center', fontSize:'1.2rem', fontWeight:500, color:'var(--ink)' }}>{fd.quantity}</span>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--walnut)', transition:'background 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--linen-dk)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Plus style={{ width:'12px', height:'12px' }}/>
            </button>
          </div>
        </FR>

        {/* Summary */}
        <div style={{ border:'1px solid var(--line-dk)', borderRadius:'2px', marginBottom:'14px', overflow:'hidden' }}>
          <div style={{ padding:'10px 15px', backgroundColor:'var(--linen)', borderBottom:'1px solid var(--line)' }}>
            <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--mid)', margin:0 }}>ملخص الطلب</p>
          </div>
          {[
            { l:'المنتج', v:product.name.slice(0,22) },
            { l:'السعر',  v:`${fp.toLocaleString()} دج` },
            { l:'الكمية', v:`× ${fd.quantity}` },
            { l:'التوصيل',v:selW?`${getLiv().toLocaleString()} دج`:'—' },
          ].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 15px', borderBottom:'1px solid var(--line)' }}>
              <span style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', color:'var(--mid)' }}>{row.l}</span>
              <span style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', fontWeight:500, color:'var(--ink)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 15px', backgroundColor:'var(--linen-dk)' }}>
            <span style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', color:'var(--mid)' }}>المجموع</span>
            <span className="serif" style={{ fontSize:'1.7rem', fontWeight:500, color:'var(--walnut)', letterSpacing:'-0.01em' }}>
              {total().toLocaleString()}
              <span style={{ fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'13px', marginRight:'4px', color:'var(--mid)' }}>دج</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={sub} className="btn-warm"
          style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'15px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1, borderRadius:'2px' }}>
          {sub?'جاري المعالجة...':'تأكيد الطلب'}{!sub && <ArrowRight style={{ width:'15px', height:'15px' }}/>}
        </button>

        <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', letterSpacing:'0.08em', color:'var(--dim)', textAlign:'center', marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          <Lock style={{ width:'10px', height:'10px', color:'var(--walnut)' }}/> دفع آمن ومشفر
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
    <div style={{ position:'relative', overflow:'hidden', padding:'72px 28px 48px' }} className="linen-tex grain">
      <div style={{ position:'absolute', left:'5%', top:'16px', opacity:0.15 }}><LeafSprig style={{ width:'32px', height:'48px' }}/></div>
      <div style={{ maxWidth:'720px', margin:'0 auto', position:'relative', zIndex:2 }}>
        {sub && <div className="slabel" style={{ marginBottom:'14px' }}>{sub}</div>}
        <h1 className="serif" style={{ fontSize:'clamp(2.2rem,5vw,4.5rem)', fontWeight:700, fontStyle:'italic', color:'var(--ink)', lineHeight:0.95, margin:'0 0 14px' }}>{title}</h1>
        <WarmDivider/>
      </div>
    </div>
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'40px 28px 80px' }}>
      <div style={{ backgroundColor:'var(--cream)', border:'1px solid var(--line-dk)', borderRadius:'2px', padding:'32px' }}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{ paddingBottom:'20px', marginBottom:'20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start' }}>
    <div style={{ flex:1 }}>
      <h3 className="serif" style={{ fontSize:'1.1rem', fontWeight:400, fontStyle:'italic', color:'var(--ink)', margin:'0 0 8px' }}>{title}</h3>
      <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', lineHeight:'1.85', color:'var(--mid)', fontWeight:300, margin:0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontFamily:"'Jost',sans-serif", fontSize:'10px', fontWeight:600, letterSpacing:'0.14em', padding:'4px 10px', border:'1px solid var(--line-dk)', color:'var(--terra)', borderRadius:'2px', flexShrink:0, textTransform:'uppercase', marginTop:'2px' }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="قانوني">
      <IB title="البيانات التي نجمعها"  body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك."/>
      <IB title="كيف نستخدمها"          body="حصرياً لتنفيذ وتوصيل مشترياتك. لا نستخدم بياناتك لأي غرض آخر."/>
      <IB title="الأمان"                 body="بياناتك محمية بتشفير قياسي وبنية تحتية آمنة."/>
      <IB title="مشاركة البيانات"        body="لا نبيع بياناتك أبداً. تُشارك فقط مع شركاء التوصيل الموثوقين."/>
      <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'12px', letterSpacing:'0.1em', color:'var(--dim)', marginTop:'20px' }}>آخر تحديث: فبراير 2026</p>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الاستخدام" sub="قانوني">
      <IB title="حسابك"             body="أنت مسؤول عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك."/>
      <IB title="المدفوعات"          body="لا رسوم مخفية. السعر المعروض هو السعر النهائي."/>
      <IB title="الاستخدام المحظور"  body="المنتجات الأصيلة فقط. لا مجال للمنتجات المقلدة." tag="صارم"/>
      <IB title="القانون الحاكم"    body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية."/>
      <div style={{ marginTop:'18px', padding:'14px', backgroundColor:'var(--linen)', borderRadius:'2px', fontFamily:"'Jost',sans-serif", fontSize:'13px', color:'var(--mid)', lineHeight:'1.8', fontWeight:300 }}>
        قد تُحدَّث هذه الشروط. الاستمرار في استخدام الخدمة يعني موافقتك على التحديثات.
      </div>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="سياسة الكوكيز" sub="قانوني">
      <IB title="الكوكيز الأساسية"    body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب"/>
      <IB title="كوكيز التفضيلات"     body="تحفظ لغتك ومنطقتك لتجربة أفضل." tag="اختياري"/>
      <IB title="كوكيز التحليلات"     body="بيانات مجمعة لتحسين المنصة. لا بيانات شخصية." tag="اختياري"/>
      <div style={{ marginTop:'18px', padding:'14px', border:'1px solid var(--line-dk)', borderRadius:'2px', display:'flex', gap:'12px', alignItems:'flex-start', backgroundColor:'var(--linen)' }}>
        <ToggleRight style={{ width:'18px', height:'18px', color:'var(--terra)', flexShrink:0, marginTop:'1px' }}/>
        <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', color:'var(--mid)', lineHeight:'1.8', fontWeight:300, margin:0 }}>
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
      <div style={{ position:'relative', overflow:'hidden', padding:'72px 28px 48px' }} className="linen-tex grain">
        <div style={{ position:'absolute', left:'5%', top:'16px', opacity:0.15 }}><LeafSprig style={{ width:'32px', height:'48px' }}/></div>
        <div style={{ position:'absolute', right:'8%', bottom:'0', opacity:0.12, transform:'rotate(180deg)' }}><LeafSprig style={{ width:'24px', height:'36px' }}/></div>
        <div style={{ maxWidth:'960px', margin:'0 auto', position:'relative', zIndex:2 }}>
          <div className="slabel" style={{ marginBottom:'14px' }}>تواصل معنا</div>
          <h1 className="serif" style={{ fontSize:'clamp(2.2rem,5vw,4.5rem)', fontWeight:700, fontStyle:'italic', color:'var(--ink)', lineHeight:0.95, margin:'0 0 14px' }}>
            نسعد بمساعدتك
          </h1>
          <WarmDivider/>
          <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'14px', color:'var(--mid)', marginTop:'12px', fontWeight:300 }}>نرد خلال 24 ساعة 🏡</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth:'960px', margin:'0 auto', padding:'48px 28px 80px' }}>
        {/* Info */}
        <div>
          <div style={{ backgroundColor:'var(--cream)', border:'1px solid var(--line-dk)', borderRadius:'2px', padding:'24px', marginBottom:'12px' }}>
            <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'18px' }}>طرق التواصل</p>
            {[
              { icon:'📞', label:'الهاتف',    val:'+213 550 000 000', href:'tel:+213550000000' },
              { icon:'✉️',  label:'البريد',    val:'info@store.dz',    href:'mailto:info@store.dz' },
              { icon:'📍', label:'الموقع',    val:'الجزائر، الجزائر', href:undefined },
            ].map(item=>(
              <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 0', borderBottom:'1px solid var(--line)', textDecoration:'none', transition:'padding-right 0.2s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.paddingRight='6px';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.paddingRight='0';}}>
                <div style={{ width:'38px', height:'38px', borderRadius:'2px', backgroundColor:'var(--linen)', border:'1px solid var(--line-dk)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--mid)', margin:'0 0 2px' }}>{item.label}</p>
                  <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', fontWeight:400, color:'var(--ink)', margin:0 }}>{item.val}</p>
                </div>
                {item.href && <ArrowRight style={{ width:'13px', height:'13px', color:'var(--sand-dk)', marginRight:'auto' }}/>}
              </a>
            ))}
          </div>

          {/* Quote card */}
          <div style={{ backgroundColor:'var(--walnut)', borderRadius:'2px', padding:'24px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, opacity:0.2 }} className="linen-tex"/>
            <div style={{ position:'absolute', left:'10px', top:'10px', opacity:0.15 }}><LeafSprig style={{ width:'20px', height:'30px' }}/></div>
            <p className="serif" style={{ fontSize:'1.2rem', fontWeight:400, fontStyle:'italic', color:'var(--cream)', lineHeight:1.5, margin:'0 0 8px', position:'relative', zIndex:2 }}>
              "منزلك يعكس شخصيتك."
            </p>
            <span style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', letterSpacing:'0.14em', color:'var(--sand)', textTransform:'uppercase', position:'relative', zIndex:2 }}>Home & Living</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ backgroundColor:'var(--cream)', border:'1px solid var(--line-dk)', borderRadius:'2px', padding:'28px' }}>
          <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'22px' }}>أرسل رسالة</p>
          {sent ? (
            <div style={{ minHeight:'240px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid var(--line-dk)', borderRadius:'2px', textAlign:'center', padding:'32px', backgroundColor:'var(--linen)' }}>
              <CheckCircle2 style={{ width:'32px', height:'32px', color:'var(--walnut)', marginBottom:'14px' }}/>
              <h3 className="serif" style={{ fontSize:'1.4rem', fontWeight:400, fontStyle:'italic', color:'var(--ink)', margin:'0 0 6px' }}>تم إرسال رسالتك!</h3>
              <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'13px', color:'var(--mid)', fontWeight:300 }}>سنرد عليك خلال 24 ساعة. 🏡</p>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[
                { label:'اسمك', type:'text',  key:'name',  ph:'الاسم الكامل' },
                { label:'البريد الإلكتروني', type:'email', key:'email', ph:'بريدك@الإلكتروني' },
              ].map(f=>(
                <div key={f.key}>
                  <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required className="inp"
                    onFocus={e=>{e.target.style.borderColor='var(--walnut)';}} onBlur={e=>{e.target.style.borderColor='var(--line-dk)';}}/>
                </div>
              ))}
              <div>
                <p style={{ fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>رسالتك</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp"
                  style={{ resize:'none' as any }}
                  onFocus={e=>{e.target.style.borderColor='var(--walnut)';}} onBlur={e=>{e.target.style.borderColor='var(--line-dk)';}}/>
              </div>
              <button type="submit" className="btn-warm" style={{ justifyContent:'center', width:'100%', padding:'13px', fontSize:'14px', borderRadius:'2px' }}>
                إرسال الرسالة <ArrowRight style={{ width:'14px', height:'14px' }}/>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}