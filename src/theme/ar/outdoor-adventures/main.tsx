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
  Menu, Mountain, Flame, Compass, MapPin, Tent,
  Truck, Wind, Thermometer, Package,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

  :root {
    --forest:   #1C2B1A;
    --forest-2: #253322;
    --forest-3: #2E3D2C;
    --bark:     #3D2B1A;
    --bark-2:   #4A3422;
    --khaki:    #7B7355;
    --khaki-lt: #9A9168;
    --ember:    #D4622A;
    --ember-lt: #E8824A;
    --amber:    #C4882A;
    --stone:    #8A8070;
    --parch:    #EDE5D0;
    --parch-dk: #DFD5BC;
    --cream:    #F5EFE0;
    --mid:      #9A8E78;
    --dim:      #6A6050;
    --line:     rgba(61,43,26,0.18);
    --line-lt:  rgba(237,229,208,0.15);
  }

  body { background:var(--parch); color:var(--bark); font-family:'Barlow',sans-serif; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:var(--bark); }

  /* Bebas display font */
  .bb { font-family:'Bebas Neue',Impact,sans-serif; }

  /* Section tag */
  .tag {
    display:inline-flex; align-items:center; gap:8px;
    font-family:'Barlow',sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.22em; text-transform:uppercase; color:var(--ember);
  }
  .tag::before { content:''; display:block; width:20px; height:2px; background:var(--ember); }

  /* Stamp badge */
  .stamp {
    display:inline-flex; align-items:center; justify-content:center;
    border:2px solid currentColor; font-family:'Barlow',sans-serif;
    font-size:10px; font-weight:700; letter-spacing:0.2em;
    text-transform:uppercase; padding:4px 12px; border-radius:2px;
    transform:rotate(-2deg);
  }

  /* Terrain BG — subtle topographic lines */
  .terrain {
    background-image:
      repeating-radial-gradient(ellipse at 25% 60%, transparent 0, transparent 55px, rgba(61,43,26,0.04) 56px, transparent 57px),
      repeating-radial-gradient(ellipse at 75% 40%, transparent 0, transparent 80px, rgba(61,43,26,0.03) 81px, transparent 82px),
      repeating-radial-gradient(ellipse at 50% 80%, transparent 0, transparent 110px, rgba(61,43,26,0.025) 111px, transparent 112px);
  }

  /* Worn canvas texture */
  .canvas-tex::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:1; border-radius:inherit;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23c)' opacity='0.05'/%3E%3C/svg%3E");
    background-size:300px 300px; mix-blend-mode:multiply; opacity:0.7;
  }

  /* Animations */
  @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .fu   { animation:fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay:0.1s; }
  .fu-2 { animation-delay:0.22s; }
  .fu-3 { animation-delay:0.36s; }

  @keyframes flicker {
    0%,100%{opacity:1;transform:scale(1)} 25%{opacity:0.85;transform:scale(0.97)}
    50%{opacity:0.95;transform:scale(1.02)} 75%{opacity:0.9;transform:scale(0.98)}
  }
  .flicker { animation:flicker 3s ease-in-out infinite; }

  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  /* Card */
  .g-card { transition:transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s; cursor:pointer; }
  .g-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(28,43,26,0.2); }
  .g-card:hover .c-img img { transform:scale(1.05); }
  .c-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.5s cubic-bezier(0.22,1,0.36,1); }

  /* Buttons */
  .btn-ember {
    display:inline-flex; align-items:center; gap:9px;
    background:var(--ember); color:var(--cream);
    font-family:'Barlow',sans-serif; font-size:13px; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase; padding:13px 28px;
    border:none; cursor:pointer; text-decoration:none; border-radius:2px;
    transition:all 0.25s; box-shadow:0 4px 16px rgba(212,98,42,0.3);
    clip-path:polygon(0 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%);
  }
  .btn-ember:hover { background:var(--ember-lt); transform:translateY(-2px); box-shadow:0 8px 28px rgba(212,98,42,0.4); }

  .btn-forest {
    display:inline-flex; align-items:center; gap:9px;
    background:var(--forest); color:var(--cream);
    font-family:'Barlow',sans-serif; font-size:13px; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase; padding:13px 28px;
    border:none; cursor:pointer; text-decoration:none; border-radius:2px;
    transition:all 0.25s;
    clip-path:polygon(8px 0,100% 0,100% 100%,0 100%,0 8px);
  }
  .btn-forest:hover { background:var(--forest-3); transform:translateY(-2px); }

  .btn-ghost {
    display:inline-flex; align-items:center; gap:9px;
    background:transparent; color:var(--cream);
    border:1.5px solid rgba(237,229,208,0.5); font-family:'Barlow',sans-serif;
    font-size:13px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase;
    padding:12px 26px; cursor:pointer; text-decoration:none; border-radius:2px;
    transition:all 0.25s;
  }
  .btn-ghost:hover { border-color:var(--cream); background:rgba(237,229,208,0.1); }

  /* Inputs */
  .inp {
    width:100%; padding:12px 14px;
    background:var(--cream); border:1.5px solid var(--line);
    font-family:'Barlow',sans-serif; font-size:13px; color:var(--bark);
    outline:none; border-radius:2px; transition:border-color 0.2s, box-shadow 0.2s;
    letter-spacing:0.02em;
  }
  .inp:focus { border-color:var(--forest); box-shadow:0 0 0 3px rgba(28,43,26,0.1); }
  .inp::placeholder { color:var(--mid); }
  .inp-err { border-color:var(--ember) !important; }
  select.inp { appearance:none; cursor:pointer; }

  /* Divider */
  .rugged-div { display:flex; align-items:center; gap:12px; margin:8px 0; }
  .rugged-div::before, .rugged-div::after { content:''; flex:1; height:1px; background:linear-gradient(to right,transparent,var(--khaki)); }
  .rugged-div::after { background:linear-gradient(to left,transparent,var(--khaki)); }

  /* Responsive */
  .nav-links   { display:flex; align-items:center; gap:28px; }
  .nav-toggle  { display:none; }
  .hero-full   { position:relative; height:100vh; min-height:600px; overflow:hidden; }
  .prod-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; }
  .cat-grid    { display:grid; grid-template-columns:repeat(3,1fr); gap:3px; }
  .trust-bar   { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g    { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:56px; }
  .details-g   { display:grid; grid-template-columns:1fr 1fr; }
  .details-L   { position:sticky; top:68px; height:calc(100vh - 68px); overflow:hidden; }
  .details-R   { padding:40px 36px 80px; }
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
    .prod-grid  { grid-template-columns:repeat(2,1fr); }
    .cat-grid   { grid-template-columns:repeat(2,1fr); }
    .trust-bar  { grid-template-columns:repeat(2,1fr); }
    .footer-g   { grid-template-columns:1fr 1fr; gap:28px; }
    .details-g  { grid-template-columns:1fr; }
    .details-L  { position:static; height:70vw; min-height:280px; }
    .details-R  { padding:24px 16px 48px; }
    .contact-g  { grid-template-columns:1fr; gap:28px; }
  }
  @media (max-width:480px) {
    .prod-grid  { grid-template-columns:repeat(2,1fr); gap:1px; }
    .footer-g   { grid-template-columns:1fr; gap:28px; }
    .form-2c    { grid-template-columns:1fr; }
    .dlv-2c     { grid-template-columns:1fr; }
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

/* ── SVG ELEMENTS ───────────────────────────────────────────── */
function FireIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none" className="flicker">
      <path d="M9 22C9 22 1 17 1 10C1 6 4 3 6 2C5 5 7 7 9 6C7 9 10 11 10 14C11 12 13 10 12 7C15 8 17 12 17 15C17 19 13 22 9 22Z" fill="var(--ember)" opacity="0.9"/>
      <path d="M9 22C9 22 5 19 5 15C5 13 7 11 8 10C8 12 9.5 13 10 15C10.5 13.5 11 12 10.5 10.5C12 11.5 13 14 13 16C13 19.5 11 22 9 22Z" fill="var(--amber)"/>
    </svg>
  );
}

function MountainSvg() {
  return (
    <svg viewBox="0 0 400 80" style={{ display:'block', width:'100%', height:'80px' }} fill="var(--forest)">
      <path d="M0,80 L0,55 L40,25 L80,45 L120,15 L160,35 L200,5 L240,30 L280,10 L320,38 L360,18 L400,40 L400,80 Z"/>
    </svg>
  );
}

/* ── MAIN ───────────────────────────────────────────────────── */
export default function Main({ store, children }: any) {
  if (!store) return null;
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--parch)' }}>
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
    const h=()=>setScrolled(window.scrollY>60);
    window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h);
  },[]);

  if (!store) return null;

  const links = [
    { href:`/${store.subdomain}`,         label:'المعدات'   },
    { href:`/${store.subdomain}/contact`, label:'تواصل'     },
    { href:`/${store.subdomain}/Privacy`, label:'الخصوصية'  },
  ];

  return (
    <nav dir="rtl" style={{
      position:'fixed', top:0, left:0, right:0, zIndex:50,
      backgroundColor:scrolled?'rgba(28,43,26,0.97)':'transparent',
      backdropFilter:scrolled?'blur(20px)':'none',
      borderBottom:scrolled?'1px solid rgba(237,229,208,0.1)':'none',
      transition:'all 0.4s',
    }}>
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ backgroundColor:'var(--bark)', overflow:'hidden', whiteSpace:'nowrap', padding:'6px 0' }}>
          <div style={{ display:'inline-block', animation:'ticker 22s linear infinite' }}>
            {Array(10).fill(null).map((_,i)=>(
              <span key={i} style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', color:'rgba(237,229,208,0.8)', margin:'0 40px', display:'inline-flex', alignItems:'center', gap:'8px', textTransform:'uppercase' }}>
                <Flame style={{ width:'11px', height:'11px', color:'var(--ember)' }}/> {store.topBar.text}
              </span>
            ))}
            {Array(10).fill(null).map((_,i)=>(
              <span key={`b${i}`} style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', color:'rgba(237,229,208,0.8)', margin:'0 40px', display:'inline-flex', alignItems:'center', gap:'8px', textTransform:'uppercase' }}>
                <Flame style={{ width:'11px', height:'11px', color:'var(--ember)' }}/> {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 28px', height:'68px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        {/* Logo */}
        <Link href={`/${store.subdomain}`} style={{ textDecoration:'none', flexShrink:0, display:'flex', alignItems:'center', gap:'12px' }}>
          {store.design?.logoUrl
            ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'36px', width:'auto' }}/>
            : (
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'36px', height:'36px', border:'2px solid rgba(237,229,208,0.5)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <Mountain style={{ width:'18px', height:'18px', color:'var(--parch)' }}/>
                  <div style={{ position:'absolute', top:'-8px', left:'50%', transform:'translateX(-50%)' }}><FireIcon/></div>
                </div>
                <div>
                  <span className="bb" style={{ fontSize:'1.4rem', letterSpacing:'0.08em', color:'var(--parch)', display:'block', lineHeight:1 }}>
                    {store.name.toUpperCase()}
                  </span>
                  <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'9px', letterSpacing:'0.24em', color:'rgba(237,229,208,0.5)', textTransform:'uppercase', display:'block', marginTop:'1px' }}>
                    Wilderness Supply
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
              style={{ fontFamily:"'Barlow',sans-serif", fontSize:'14px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(237,229,208,0.65)', textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--parch)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(237,229,208,0.65)';}}>
              {l.label}
            </Link>
          ))}
          <a href="#gear" className="btn-ember" style={{ padding:'10px 22px', fontSize:'12px' }}>
            <Tent style={{ width:'14px', height:'14px' }}/> تسوق المعدات
          </a>
        </div>

        <button className="nav-toggle" onClick={()=>setOpen(p=>!p)} style={{ background:'none', border:'1.5px solid rgba(237,229,208,0.3)', cursor:'pointer', color:'var(--parch)', padding:'8px', borderRadius:'2px', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {open ? <X style={{ width:'18px', height:'18px' }}/> : <Menu style={{ width:'18px', height:'18px' }}/>}
        </button>
      </div>

      {/* Mobile menu */}
      <div style={{ maxHeight:open?'240px':'0', overflow:'hidden', transition:'max-height 0.3s ease', borderTop:open?'1px solid rgba(237,229,208,0.1)':'none', backgroundColor:'rgba(28,43,26,0.97)' }}>
        <div style={{ padding:'10px 28px 18px' }}>
          {links.map(l=>(
            <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', fontFamily:"'Barlow',sans-serif", fontSize:'14px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(237,229,208,0.65)', textDecoration:'none', borderBottom:'1px solid rgba(237,229,208,0.1)' }}>
              {l.label} <ArrowRight style={{ width:'14px', height:'14px', color:'var(--ember)' }}/>
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
    <footer dir="rtl" style={{ backgroundColor:'var(--forest)', fontFamily:"'Barlow',sans-serif", position:'relative', overflow:'hidden' }}>
      {/* Mountain silhouette top */}
      <div style={{ marginBottom:'-4px', lineHeight:0 }}><MountainSvg/></div>

      {/* Background terrain lines */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.04 }} className="terrain"/>

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'48px 28px 36px', position:'relative', zIndex:2 }}>
        <div className="footer-g" style={{ paddingBottom:'48px', borderBottom:'1px solid rgba(237,229,208,0.1)' }}>

          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <Mountain style={{ width:'20px', height:'20px', color:'var(--ember)' }}/>
              <span className="bb" style={{ fontSize:'1.3rem', letterSpacing:'0.08em', color:'var(--parch)' }}>{store.name.toUpperCase()}</span>
            </div>
            <p style={{ fontSize:'13px', lineHeight:'1.8', color:'rgba(237,229,208,0.5)', maxWidth:'220px', fontWeight:400, letterSpacing:'0.03em' }}>
              معدات المغامرة الأصيلة. صُنعت للبرية، مُختبَرة في الميدان.
            </p>
            <div style={{ display:'flex', gap:'8px', marginTop:'18px' }}>
              {['⛺','🪵','🔥','🏔️'].map((e,i)=>(
                <div key={i} style={{ width:'32px', height:'32px', border:'1px solid rgba(237,229,208,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>{e}</div>
              ))}
            </div>
          </div>

          {[
            { title:'المعدات', links:[
              [`/${store.subdomain}`, 'كل المنتجات'],
              [`/${store.subdomain}`, 'خيام وملاجئ'],
              [`/${store.subdomain}`, 'معدات الطبخ'],
              [`/${store.subdomain}`, 'الملابس'],
            ]},
            { title:'معلومات', links:[
              [`/${store.subdomain}/Privacy`, 'الخصوصية'],
              [`/${store.subdomain}/Terms`,   'الشروط'],
              [`/${store.subdomain}/Cookies`, 'الكوكيز'],
              [`/${store.subdomain}/contact`, 'تواصل معنا'],
            ]},
            { title:'تواصل', links:[
              ['#', '+213 550 000 000'],
              ['#', 'الجزائر، الجزائر'],
              ['#', 'info@store.dz'],
            ]},
          ].map(col=>(
            <div key={col.title}>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ember)', marginBottom:'16px' }}>{col.title}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {col.links.map(([href,label])=>(
                  <a key={label} href={href} style={{ fontSize:'13px', color:'rgba(237,229,208,0.45)', textDecoration:'none', letterSpacing:'0.04em', fontWeight:400, transition:'color 0.2s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--parch)';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(237,229,208,0.45)';}}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop:'20px', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
          <p style={{ fontSize:'12px', color:'rgba(237,229,208,0.25)', letterSpacing:'0.08em' }}>© {yr} {store.name.toUpperCase()}. جميع الحقوق محفوظة.</p>
          <p style={{ fontSize:'12px', color:'rgba(237,229,208,0.25)', letterSpacing:'0.08em' }}>Wilderness Supply Theme</p>
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
    <div className="g-card" style={{ backgroundColor:'var(--forest-2)', position:'relative', overflow:'hidden' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>

      <div className="c-img" style={{ position:'relative', aspectRatio:'4/5', overflow:'hidden', backgroundColor:'var(--forest-3)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,var(--forest-3),var(--forest-2))' }}>
              <Mountain style={{ width:'44px', height:'44px', color:'var(--khaki)', opacity:0.4 }}/>
            </div>
        }
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(28,43,26,0.9) 0%, rgba(28,43,26,0.2) 55%, transparent 75%)', pointerEvents:'none' }}/>

        {/* Hover overlay */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', opacity:hov?1:0, transition:'opacity 0.35s', background:'rgba(28,43,26,0.55)', backdropFilter:hov?'blur(2px)':'none' }}>
          <Link href={`/${store.subdomain}/product/${product.slug||product.id}`}
            className="btn-ember" style={{ textDecoration:'none', padding:'10px 22px', fontSize:'12px' }}>
            {viewDetails} <ArrowRight style={{ width:'12px', height:'12px' }}/>
          </Link>
        </div>

        {/* Discount badge */}
        {discount>0 && (
          <div style={{ position:'absolute', top:'12px', right:'12px' }}>
            <div className="stamp" style={{ color:'var(--ember)', borderColor:'var(--ember)', backgroundColor:'rgba(28,43,26,0.85)', fontSize:'10px' }}>
              -{discount}%
            </div>
          </div>
        )}

        {/* Bottom price */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
            <span className="bb" style={{ fontSize:'1.8rem', color:'var(--parch)', letterSpacing:'0.02em', lineHeight:1 }}>
              {price.toLocaleString()}
            </span>
            <span style={{ fontSize:'12px', color:'rgba(237,229,208,0.6)', fontWeight:400 }}>دج</span>
            {orig>price && <span style={{ fontSize:'12px', color:'rgba(237,229,208,0.35)', textDecoration:'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
        </div>
      </div>

      {/* Name */}
      <div style={{ padding:'12px 14px', borderTop:'1px solid rgba(237,229,208,0.07)' }}>
        <h3 style={{ fontFamily:"'Barlow',sans-serif", fontSize:'14px', fontWeight:600, color:'var(--parch)', marginBottom:'5px', lineHeight:1.35, letterSpacing:'0.03em', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display:'flex', gap:'2px' }}>
          {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'10px', height:'10px', fill:i<4?'var(--amber)':'none', color:'var(--amber)' }}/>)}
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
    { icon:<Truck style={{ width:'20px', height:'20px' }}/>,       color:'var(--ember)',  title:'توصيل لكل الجزائر',   desc:'48 ساعة لبابك' },
    { icon:<Shield style={{ width:'20px', height:'20px' }}/>,      color:'var(--amber)',  title:'معدات أصيلة 100%',    desc:'جودة مُختبَرة في الميدان' },
    { icon:<Mountain style={{ width:'20px', height:'20px' }}/>,    color:'var(--ember)',  title:'مُصنَّعة للبرية',      desc:'تتحمل أقسى الظروف' },
    { icon:<Compass style={{ width:'20px', height:'20px' }}/>,     color:'var(--amber)',  title:'خبرة المغامرين',        desc:'توصيات متخصصة' },
  ];

  return (
    <div dir="rtl">

      {/* ── HERO — full cinematic ── */}
      <section className="hero-full" style={{ backgroundColor:'var(--forest)' }}>
        {store.hero?.imageUrl
          ? <img src={store.hero.imageUrl} alt={store.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
          : (
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,var(--forest) 0%,var(--bark) 40%,var(--forest-2) 100%)' }} className="terrain"/>
          )
        }
        {/* Dark overlay gradient */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to left, rgba(28,43,26,0.15) 0%, rgba(28,43,26,0.65) 50%, rgba(28,43,26,0.88) 100%)', pointerEvents:'none' }}/>
        {/* Bottom mountain mask */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, lineHeight:0, zIndex:2 }}>
          <MountainSvg/>
        </div>

        {/* Fire glow accent */}
        <div style={{ position:'absolute', bottom:'10%', right:'15%', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle,rgba(212,98,42,0.18) 0%,transparent 70%)', pointerEvents:'none', zIndex:1 }}/>

        {/* Content */}
        <div style={{ position:'relative', zIndex:3, height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 8vw', paddingTop:'68px', maxWidth:'720px' }}>

          <div className="fu" style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
            <FireIcon/>
            <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'12px', fontWeight:700, letterSpacing:'0.26em', textTransform:'uppercase', color:'var(--ember)' }}>
              معدات المغامرة الأصيلة
            </span>
          </div>

          <h1 className="fu fu-1 bb" style={{ fontSize:'clamp(3.5rem,10vw,9rem)', letterSpacing:'0.04em', color:'var(--parch)', lineHeight:0.88, marginBottom:'20px', textTransform:'uppercase' }}>
            {store.hero?.title
              ? store.hero.title.toUpperCase()
              : <><span>في قلب</span><br/><span style={{ color:'var(--ember)', WebkitTextStroke:'1px var(--ember-lt)' }}>البرية</span></>
            }
          </h1>

          <div className="fu fu-2" style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px' }}>
            <div style={{ height:'2px', width:'48px', background:'linear-gradient(to right,var(--ember),transparent)' }}/>
          </div>

          <p className="fu fu-2" style={{ fontFamily:"'Barlow',sans-serif", fontSize:'clamp(14px,2vw,17px)', lineHeight:'1.8', color:'rgba(237,229,208,0.7)', marginBottom:'36px', maxWidth:'460px', fontWeight:400, letterSpacing:'0.03em' }}>
            {store.hero?.subtitle || 'كل ما تحتاجه للرحلات الخارجية والتخييم. معدات مُختبَرة في أقسى الظروف.'}
          </p>

          <div className="fu fu-3" style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
            <a href="#gear" className="btn-ember" style={{ fontSize:'14px', padding:'14px 32px' }}>
              <Tent style={{ width:'16px', height:'16px' }}/> تسوق المعدات
            </a>
            <a href="#categories" className="btn-ghost" style={{ fontSize:'14px', padding:'13px 28px' }}>
              استعرض الفئات <ArrowRight style={{ width:'14px', height:'14px' }}/>
            </a>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:'36px', marginTop:'48px', paddingTop:'28px', borderTop:'1px solid rgba(237,229,208,0.12)', flexWrap:'wrap' }}>
            {[
              { n:`${products.length}+`, l:'منتج معدات', c:'var(--ember)' },
              { n:'48H',                 l:'توصيل سريع', c:'var(--parch)' },
              { n:'100%',                l:'معدات أصيلة', c:'var(--parch)' },
            ].map((s,i)=>(
              <div key={i}>
                <p className="bb" style={{ fontSize:'2.2rem', letterSpacing:'0.04em', color:s.c, lineHeight:1, margin:0 }}>{s.n}</p>
                <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'10px', fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(237,229,208,0.4)', margin:'5px 0 0' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ backgroundColor:'var(--bark)', borderTop:'2px solid var(--ember)', borderBottom:'1px solid rgba(237,229,208,0.1)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div className="trust-bar">
            {trust.map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'18px 22px', borderLeft:i>0?'1px solid rgba(237,229,208,0.08)':'none' }}>
                <div style={{ color:item.color, flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', fontWeight:700, color:'var(--parch)', margin:0, letterSpacing:'0.04em' }}>{item.title}</p>
                  <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', color:'rgba(237,229,208,0.45)', margin:0, fontWeight:400 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length>0 && (
        <section id="categories" style={{ padding:'80px 0', backgroundColor:'var(--parch)' }} className="terrain">
          <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 28px' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'40px' }}>
              <div>
                <div className="tag" style={{ marginBottom:'12px' }}>الفئات</div>
                <h2 className="bb" style={{ fontSize:'clamp(2rem,4vw,3.5rem)', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--bark)', margin:0 }}>
                  استعرض التجهيزات
                </h2>
              </div>
              <Link href={`/${store.subdomain}`} style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ember)', textDecoration:'none', display:'flex', alignItems:'center', gap:'5px' }}>
                الكل <ArrowRight style={{ width:'13px', height:'13px' }}/>
              </Link>
            </div>
            <div className="cat-grid">
              {cats.slice(0,6).map((cat:any,i:number)=>(
                <Link key={cat.id} href={`/${store.subdomain}?category=${cat.id}`}
                  style={{ display:'block', textDecoration:'none', position:'relative', aspectRatio:'4/3', overflow:'hidden', backgroundColor:'var(--forest-3)', border:'2px solid transparent', transition:'all 0.3s' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--ember)'; el.style.transform='scale(1.02)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='transparent'; el.style.transform='scale(1)';}}>
                  {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', opacity:0.6 }}/>}
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(28,43,26,0.9) 0%,transparent 60%)', display:'flex', alignItems:'flex-end', padding:'16px' }}>
                    <span className="bb" style={{ fontSize:'1.4rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--parch)' }}>{cat.name}</span>
                  </div>
                  {!cat.imageUrl && (
                    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px', background:'var(--forest-3)' }}>
                      <Mountain style={{ width:'32px', height:'32px', color:'var(--khaki)', opacity:0.5 }}/>
                      <span className="bb" style={{ fontSize:'1.1rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--parch-dk)', opacity:0.7 }}>{cat.name}</span>
                    </div>
                  )}
                  {/* Corner accent */}
                  <div style={{ position:'absolute', top:0, right:0, width:'28px', height:'28px', borderTop:'2px solid var(--ember)', borderRight:'2px solid var(--ember)', opacity:0.5 }}/>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GEAR GRID ── */}
      <section id="gear" style={{ backgroundColor:'var(--forest)', paddingTop:0 }}>
        {/* Section header */}
        <div style={{ backgroundColor:'var(--bark-2)', padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <FireIcon/>
            <div>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ember)', margin:0 }}>// معدات الميدان</p>
              <h2 className="bb" style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--parch)', margin:0, lineHeight:1 }}>
                كل المعدات
              </h2>
            </div>
          </div>
          <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', fontWeight:600, letterSpacing:'0.1em', color:'rgba(237,229,208,0.4)', textTransform:'uppercase' }}>
            {products.length} منتج
          </span>
        </div>

        {products.length===0 ? (
          <div style={{ padding:'80px 0', textAlign:'center', borderBottom:'1px solid rgba(237,229,208,0.07)' }}>
            <Mountain style={{ width:'56px', height:'56px', color:'var(--khaki)', opacity:0.3, margin:'0 auto 16px' }}/>
            <p className="bb" style={{ fontSize:'1.5rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(237,229,208,0.3)' }}>المعدات قادمة قريباً</p>
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
      </section>

      {/* ── WILDERNESS MANIFESTO ── */}
      <section style={{ position:'relative', padding:'96px 28px', textAlign:'center', overflow:'hidden', backgroundColor:'var(--bark)' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.06 }} className="terrain"/>
        {store.hero?.imageUrl && <img src={store.hero.imageUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.08, display:'block' }}/>}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(61,43,26,0.6),rgba(61,43,26,0.85))' }}/>

        {/* Fire glow */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 80%,rgba(212,98,42,0.2) 0%,transparent 60%)', pointerEvents:'none' }}/>

        <div style={{ position:'relative', zIndex:2, maxWidth:'680px', margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'24px' }}><FireIcon/></div>
          <div className="tag" style={{ justifyContent:'center', marginBottom:'16px' }}>البرية تنتظرك</div>
          <h2 className="bb" style={{ fontSize:'clamp(2.5rem,7vw,6rem)', letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--parch)', lineHeight:0.88, marginBottom:'20px' }}>
            {store.hero?.title ? 'المغامرة تبدأ هنا' : <>كن جاهزاً<br/><span style={{ color:'var(--ember)' }}>دائماً</span></>}
          </h2>
          <div style={{ display:'flex', alignItems:'center', gap:'16px', justifyContent:'center', margin:'16px 0' }}>
            <div style={{ height:'1px', width:'56px', background:'linear-gradient(to right,transparent,var(--ember))' }}/>
            <Mountain style={{ width:'16px', height:'16px', color:'var(--ember)' }}/>
            <div style={{ height:'1px', width:'56px', background:'linear-gradient(to left,transparent,var(--ember))' }}/>
          </div>
          <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'16px', lineHeight:'1.8', color:'rgba(237,229,208,0.65)', marginBottom:'36px', fontWeight:400 }}>
            المعدة الصحيحة تصنع الفرق بين مغامرة لا تُنسى وموقف لا تريده. جهّز نفسك بالأفضل.
          </p>
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="#gear" className="btn-ember" style={{ fontSize:'14px', padding:'14px 36px' }}>
              <Tent style={{ width:'15px', height:'15px' }}/> ابدأ التجهيز
            </a>
            <Link href={`/${store.subdomain}/contact`} className="btn-ghost" style={{ fontSize:'14px', padding:'13px 30px', textDecoration:'none' }}>
              <Compass style={{ width:'15px', height:'15px' }}/> تواصل معنا
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
    <div dir="rtl" style={{ backgroundColor:'var(--parch)' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor:'var(--forest)', borderBottom:'1px solid rgba(237,229,208,0.1)', padding:'12px 28px', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(237,229,208,0.45)' }}>
        <Link href="/" style={{ textDecoration:'none', color:'rgba(237,229,208,0.45)', transition:'color 0.2s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--ember)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(237,229,208,0.45)';}}>
          الرئيسية
        </Link>
        <span style={{ color:'var(--ember)' }}>/</span>
        <span style={{ color:'var(--parch)' }}>{product.name.slice(0,40)}</span>
        <div style={{ marginRight:'auto', display:'flex', gap:'8px' }}>
          <button onClick={toggleWishlist} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isWishlisted?'var(--ember)':'rgba(237,229,208,0.2)'}`, background:isWishlisted?'rgba(212,98,42,0.15)':'transparent', cursor:'pointer', color:isWishlisted?'var(--ember)':'rgba(237,229,208,0.45)' }}>
            <Heart style={{ width:'13px', height:'13px', fill:isWishlisted?'currentColor':'none' }}/>
          </button>
          <button onClick={handleShare} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(237,229,208,0.2)', background:'transparent', cursor:'pointer', color:'rgba(237,229,208,0.45)' }}>
            <Share2 style={{ width:'13px', height:'13px' }}/>
          </button>
        </div>
      </div>

      <div className="details-g" style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 28px' }}>
        {/* Gallery */}
        <div className="details-L" style={{ paddingTop:'28px' }}>
          <div style={{ position:'relative', aspectRatio:'4/5', overflow:'hidden', backgroundColor:'var(--forest-3)' }}>
            {allImages.length>0
              ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--forest-3)' }}>
                  <Mountain style={{ width:'64px', height:'64px', color:'var(--khaki)', opacity:0.3 }}/>
                </div>
            }
            {/* Dark gradient */}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(28,43,26,0.7) 0%,transparent 45%)', pointerEvents:'none' }}/>
            {/* Ember trim */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'3px', background:'linear-gradient(to right,transparent,var(--ember),transparent)' }}/>

            {discount>0 && (
              <div style={{ position:'absolute', top:'14px', right:'14px' }}>
                <div className="stamp" style={{ color:'var(--ember)', borderColor:'var(--ember)', backgroundColor:'rgba(28,43,26,0.9)', fontSize:'11px' }}>
                  -{discount}%
                </div>
              </div>
            )}

            {/* Corner ornaments */}
            <span style={{ position:'absolute', top:'10px', left:'10px', width:'14px', height:'14px', borderTop:'2px solid var(--ember)', borderLeft:'2px solid var(--ember)' }}/>
            <span style={{ position:'absolute', bottom:'16px', right:'10px', width:'14px', height:'14px', borderBottom:'2px solid rgba(237,229,208,0.3)', borderRight:'2px solid rgba(237,229,208,0.3)' }}/>

            {allImages.length>1 && (
              <>
                <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', border:'1px solid rgba(237,229,208,0.3)', backgroundColor:'rgba(28,43,26,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--parch)' }}>
                  <ChevronRight style={{ width:'15px', height:'15px' }}/>
                </button>
                <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', border:'1px solid rgba(237,229,208,0.3)', backgroundColor:'rgba(28,43,26,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--parch)' }}>
                  <ChevronLeft style={{ width:'15px', height:'15px' }}/>
                </button>
              </>
            )}
            {!inStock&&!autoGen && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(28,43,26,0.82)', backdropFilter:'blur(4px)' }}>
                <div className="stamp" style={{ color:'var(--parch-dk)', borderColor:'var(--parch-dk)', fontSize:'1rem', padding:'8px 20px' }}>نفد المخزون</div>
              </div>
            )}
            {/* Price overlay */}
            <div style={{ position:'absolute', bottom:'20px', left:'14px' }}>
              <span className="bb" style={{ fontSize:'2.5rem', color:'var(--parch)', letterSpacing:'0.02em', lineHeight:1 }}>
                {finalPrice.toLocaleString()}
                <span style={{ fontFamily:"'Barlow',sans-serif", fontWeight:400, fontSize:'13px', marginRight:'5px', opacity:0.7 }}>دج</span>
              </span>
            </div>
          </div>

          {allImages.length>1 && (
            <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
              {allImages.slice(0,5).map((img:string,idx:number)=>(
                <button key={idx} onClick={()=>setSel(idx)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`2px solid ${sel===idx?'var(--ember)':'var(--line)'}`, cursor:'pointer', padding:0, background:'none', opacity:sel===idx?1:0.55 }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="details-R">
          <div className="tag" style={{ marginBottom:'14px' }}>معدات الميدان</div>
          <h1 className="bb" style={{ fontSize:'clamp(2rem,4vw,3.5rem)', letterSpacing:'0.04em', textTransform:'uppercase', color:'var(--bark)', lineHeight:0.9, marginBottom:'16px' }}>
            {product.name.toUpperCase()}
          </h1>

          {/* Stars + stock */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line)', flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:'2px' }}>
              {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'13px', height:'13px', fill:i<4?'var(--amber)':'none', color:'var(--amber)' }}/>)}
            </div>
            <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'12px', color:'var(--mid)' }}>4.8 (128 تقييم)</span>
            <div className="stamp" style={{ marginRight:'auto', color:inStock||autoGen?'var(--forest)':'var(--ember)', borderColor:inStock||autoGen?'var(--forest)':'var(--ember)', fontSize:'10px', padding:'3px 10px', transform:'rotate(-1deg)' }}>
              {autoGen?'∞ متوفر':inStock?'متوفر':'نفد'}
            </div>
          </div>

          {/* Price */}
          <div style={{ marginBottom:'22px', padding:'16px', backgroundColor:'var(--bark)', borderRadius:'2px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 80% 50%,rgba(212,98,42,0.12) 0%,transparent 70%)', pointerEvents:'none' }}/>
            <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(237,229,208,0.4)', margin:'0 0 6px' }}>سعر الميدان</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:'12px', flexWrap:'wrap', position:'relative', zIndex:2 }}>
              <span className="bb" style={{ fontSize:'3rem', letterSpacing:'0.02em', color:'var(--ember)', lineHeight:1 }}>{finalPrice.toLocaleString()}</span>
              <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'15px', color:'rgba(237,229,208,0.5)' }}>دج</span>
              {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                <>
                  <span style={{ fontSize:'15px', textDecoration:'line-through', color:'rgba(237,229,208,0.25)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                  <div className="stamp" style={{ color:'var(--ember)', borderColor:'var(--ember)', fontSize:'10px', padding:'2px 8px' }}>
                    وفّر {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Offers */}
          {product.offers?.length>0 && (
            <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line)' }}>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'12px' }}>// الباقات</p>
              {product.offers.map((offer:any)=>(
                <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 14px', border:`1.5px solid ${selectedOffer===offer.id?'var(--ember)':'var(--line)'}`, cursor:'pointer', marginBottom:'8px', transition:'all 0.2s', backgroundColor:selectedOffer===offer.id?'rgba(212,98,42,0.06)':'transparent' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'16px', height:'16px', border:`2px solid ${selectedOffer===offer.id?'var(--ember)':'var(--mid)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {selectedOffer===offer.id&&<div style={{ width:'8px', height:'8px', background:'var(--ember)' }}/>}
                    </div>
                    <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                    <div>
                      <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', fontWeight:600, color:'var(--bark)', margin:0, letterSpacing:'0.04em' }}>{offer.name}</p>
                      <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', color:'var(--mid)', margin:0 }}>الكمية: {offer.quantity}</p>
                    </div>
                  </div>
                  <span className="bb" style={{ fontSize:'1.3rem', letterSpacing:'0.04em', color:'var(--ember)' }}>
                    {offer.price.toLocaleString()} <span style={{ fontFamily:"'Barlow',sans-serif", fontWeight:400, fontSize:'12px', color:'var(--mid)' }}>دج</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--line)' }}>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'10px' }}>// {attr.name}</p>
              {attr.displayMode==='color' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'28px', height:'28px', backgroundColor:v.value, border:'none', cursor:'pointer', outline:s?'2.5px solid var(--ember)':'2.5px solid transparent', outlineOffset:'3px' }}/>;})}
                </div>
              ):attr.displayMode==='image' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`2px solid ${s?'var(--ember)':'var(--line)'}`, cursor:'pointer', padding:0 }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                </div>
              ):(
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ padding:'8px 16px', border:`1.5px solid ${s?'var(--ember)':'var(--line)'}`, backgroundColor:s?'var(--ember)':'transparent', color:s?'var(--cream)':'var(--mid)', fontFamily:"'Barlow',sans-serif", fontSize:'13px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s' }}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--line)' }}>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'12px' }}>// مواصفات المعدة</p>
              <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:'14px', lineHeight:'1.85', color:'var(--mid)', fontWeight:400 }}
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
  <div style={{ marginBottom:'12px' }}>
    {label && <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'10px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>{label}</p>}
    {children}
    {error && <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', color:'var(--ember)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
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
    <div style={{ marginTop:'22px', paddingTop:'20px', borderTop:'2px solid var(--bark)' }}>
      <form onSubmit={handleSubmit}>
        <div className="form-2c">
          <FR error={errors.customerName} label="الاسم">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--mid)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="الاسم الكامل"
                className={`inp${errors.customerName?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor=errors.customerName?'var(--ember)':'var(--line)';}}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="الهاتف">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--mid)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX"
                className={`inp${errors.customerPhone?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor=errors.customerPhone?'var(--ember)':'var(--line)';}}/>
            </div>
          </FR>
        </div>
        <div className="form-2c">
          <FR error={errors.customerWelaya} label="الولاية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--mid)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                className={`inp${errors.customerWelaya?' inp-err':''}`} style={{ paddingRight:'34px' }}
                onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor=errors.customerWelaya?'var(--ember)':'var(--line)';}}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FR>
          <FR error={errors.customerCommune} label="البلدية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--mid)', pointerEvents:'none' }}/>
              <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})}
                className={`inp${errors.customerCommune?' inp-err':''}`} style={{ paddingRight:'34px', opacity:!fd.customerWelaya?0.4:1 }}
                onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor=errors.customerCommune?'var(--ember)':'var(--line)';}}>
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
                style={{ padding:'13px 10px', border:`1.5px solid ${fd.typeLivraison===type?'var(--ember)':'var(--line)'}`, backgroundColor:fd.typeLivraison===type?'rgba(212,98,42,0.06)':'transparent', cursor:'pointer', textAlign:'right', transition:'all 0.2s', clipPath:fd.typeLivraison===type?'polygon(0 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%)':'none' }}>
                <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'12px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:fd.typeLivraison===type?'var(--ember)':'var(--mid)', margin:'0 0 4px' }}>
                  {type==='home'?'للبيت':'للمكتب'}
                </p>
                {selW && <p className="bb" style={{ fontSize:'1.1rem', letterSpacing:'0.04em', color:fd.typeLivraison===type?'var(--ember)':'var(--dim)', margin:0 }}>
                  {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()}
                  <span style={{ fontFamily:"'Barlow',sans-serif", fontWeight:400, fontSize:'11px', marginRight:'3px', color:'var(--mid)' }}>دج</span>
                </p>}
              </button>
            ))}
          </div>
        </FR>

        <FR label="الكمية">
          <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid var(--line)', backgroundColor:'var(--cream)' }}>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--bark)', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--parch-dk)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Minus style={{ width:'12px', height:'12px' }}/>
            </button>
            <span className="bb" style={{ width:'46px', textAlign:'center', fontSize:'1.3rem', letterSpacing:'0.04em', color:'var(--bark)' }}>{fd.quantity}</span>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--bark)', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--parch-dk)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Plus style={{ width:'12px', height:'12px' }}/>
            </button>
          </div>
        </FR>

        {/* Summary */}
        <div style={{ border:'1.5px solid var(--line)', marginBottom:'14px', overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', backgroundColor:'var(--bark)', display:'flex', alignItems:'center', gap:'10px' }}>
            <Package style={{ width:'13px', height:'13px', color:'var(--ember)' }}/>
            <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'10px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(237,229,208,0.6)' }}>بيان الطلب</span>
          </div>
          {[
            { l:'المنتج', v:product.name.slice(0,22) },
            { l:'السعر',  v:`${fp.toLocaleString()} دج` },
            { l:'الكمية', v:`× ${fd.quantity}` },
            { l:'التوصيل',v:selW?`${getLiv().toLocaleString()} دج`:'—' },
          ].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 14px', borderBottom:'1px solid var(--line)', backgroundColor:'var(--cream)' }}>
              <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'12px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--mid)' }}>{row.l}</span>
              <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', fontWeight:600, color:'var(--bark)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px', backgroundColor:'var(--bark)' }}>
            <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(237,229,208,0.4)' }}>المجموع</span>
            <span className="bb" style={{ fontSize:'2rem', letterSpacing:'0.02em', color:'var(--ember)' }}>
              {total().toLocaleString()} <span style={{ fontFamily:"'Barlow',sans-serif", fontWeight:400, fontSize:'13px', color:'rgba(237,229,208,0.4)' }}>دج</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={sub} className="btn-ember"
          style={{ width:'100%', justifyContent:'center', fontSize:'14px', padding:'14px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1, clipPath:'none' }}>
          {sub?'⚡ جاري المعالجة...':'✅ تأكيد الطلب'}{!sub && <ArrowRight style={{ width:'14px', height:'14px' }}/>}
        </button>

        <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--mid)', textAlign:'center', marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
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
  <div dir="rtl" style={{ backgroundColor:'var(--parch)', minHeight:'100vh' }}>
    <div style={{ backgroundColor:'var(--forest)', padding:'72px 28px 0', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, opacity:0.05 }} className="terrain"/>
      <div style={{ maxWidth:'760px', margin:'0 auto', position:'relative', zIndex:2 }}>
        {sub && <div className="tag" style={{ marginBottom:'14px' }}>{sub}</div>}
        <h1 className="bb" style={{ fontSize:'clamp(2.5rem,7vw,6rem)', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--parch)', lineHeight:0.88, margin:'0 0 0' }}>{title}</h1>
      </div>
      <div style={{ marginTop:'0', lineHeight:0 }}><MountainSvg/></div>
    </div>
    <div style={{ maxWidth:'760px', margin:'0 auto', padding:'40px 28px 80px' }}>
      <div style={{ backgroundColor:'var(--cream)', border:'1px solid var(--line)', padding:'32px' }}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{ paddingBottom:'20px', marginBottom:'20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', gap:'20px', alignItems:'flex-start' }}>
    <div style={{ flex:1 }}>
      <h3 style={{ fontFamily:"'Barlow',sans-serif", fontSize:'15px', fontWeight:700, color:'var(--bark)', margin:'0 0 7px', letterSpacing:'0.04em', display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ color:'var(--ember)', fontSize:'12px' }}>//</span> {title}
      </h3>
      <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', lineHeight:'1.85', color:'var(--mid)', fontWeight:400, margin:0 }}>{body}</p>
    </div>
    {tag && <div className="stamp" style={{ color:'var(--ember)', borderColor:'var(--ember)', fontSize:'9px', padding:'3px 8px', flexShrink:0, marginTop:'2px' }}>{tag}</div>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="الخصوصية" sub="قانوني">
      <IB title="البيانات التي نجمعها"  body="فقط اسمك ورقم هاتفك وعنوان التوصيل — لا شيء أكثر مما يلزم لتنفيذ طلبك."/>
      <IB title="كيف نستخدمها"          body="حصرياً لمعالجة طلبك وتوصيله. لا استخدام تجاري لبياناتك."/>
      <IB title="الأمان"                 body="بياناتك محمية بتشفير على مستوى المؤسسات وبنية تحتية آمنة."/>
      <IB title="مشاركة البيانات"        body="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين."/>
      <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--dim)', marginTop:'20px' }}>آخر تحديث: فبراير 2026</p>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="الشروط" sub="قانوني">
      <IB title="حسابك"             body="أنت مسؤول عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك."/>
      <IB title="المدفوعات"          body="لا رسوم مخفية. السعر المعروض هو السعر النهائي الكامل."/>
      <IB title="الاستخدام المحظور"  body="المنتجات الأصيلة فقط. لا مجال للمنتجات المقلدة أو غير القانونية." tag="صارم"/>
      <IB title="القانون الحاكم"    body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية."/>
      <div style={{ padding:'14px 16px', backgroundColor:'var(--parch-dk)', border:'1px solid var(--line)', fontFamily:"'Barlow',sans-serif", fontSize:'13px', color:'var(--mid)', lineHeight:'1.8', fontWeight:400 }}>
        قد تُحدَّث هذه الشروط دورياً. استمرارك في الاستخدام يعني قبولك للتحديثات.
      </div>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="الكوكيز" sub="قانوني">
      <IB title="الكوكيز الأساسية"    body="ضرورية للجلسات والسلة وعملية الدفع. لا يمكن تعطيلها." tag="مطلوب"/>
      <IB title="كوكيز التفضيلات"     body="تحفظ لغتك ومنطقتك لتجربة أفضل." tag="اختياري"/>
      <IB title="كوكيز التحليلات"     body="بيانات مجمعة ومجهولة لتحسين المنصة فقط." tag="اختياري"/>
      <div style={{ padding:'14px', border:'1px solid var(--line)', display:'flex', gap:'12px', alignItems:'flex-start', backgroundColor:'var(--cream)' }}>
        <ToggleRight style={{ width:'18px', height:'18px', color:'var(--ember)', flexShrink:0, marginTop:'1px' }}/>
        <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', color:'var(--mid)', lineHeight:'1.8', margin:0, fontWeight:400 }}>
          يمكنك إدارة تفضيلات الكوكيز من إعدادات متصفحك. تعطيل الكوكيز الأساسية يؤثر على الوظائف الأساسية للموقع.
        </p>
      </div>
    </Shell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [sent, setSent] = useState(false);
  return (
    <div dir="rtl" style={{ backgroundColor:'var(--parch)', minHeight:'100vh' }}>
      <div style={{ backgroundColor:'var(--forest)', padding:'72px 28px 0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.05 }} className="terrain"/>
        {/* Fire glow */}
        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:'400px', height:'200px', background:'radial-gradient(ellipse at 50% 100%,rgba(212,98,42,0.25) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:'960px', margin:'0 auto', position:'relative', zIndex:2 }}>
          <div className="tag" style={{ marginBottom:'14px' }}>تواصل</div>
          <h1 className="bb" style={{ fontSize:'clamp(2.5rem,7vw,6rem)', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--parch)', lineHeight:0.88, margin:'0 0 14px' }}>
            تواصل معنا
          </h1>
          <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'14px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(237,229,208,0.45)' }}>
            نرد خلال 24 ساعة 🏕️
          </p>
        </div>
        <div style={{ marginTop:'0', lineHeight:0 }}><MountainSvg/></div>
      </div>

      <div className="contact-g" style={{ maxWidth:'960px', margin:'0 auto', padding:'40px 28px 80px' }}>
        {/* Info */}
        <div>
          <div style={{ backgroundColor:'var(--cream)', border:'1px solid var(--line)', padding:'24px', marginBottom:'12px' }}>
            <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'10px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ember)', marginBottom:'18px' }}>// طرق التواصل</p>
            {[
              { icon:'📞', label:'الهاتف',          val:'+213 550 000 000', href:'tel:+213550000000' },
              { icon:'✉️',  label:'البريد',           val:'info@store.dz',    href:'mailto:info@store.dz' },
              { icon:'📍', label:'الموقع',           val:'الجزائر، الجزائر', href:undefined },
            ].map(item=>(
              <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'13px 0', borderBottom:'1px solid var(--line)', textDecoration:'none', transition:'padding-right 0.2s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.paddingRight='8px';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.paddingRight='0';}}>
                <div style={{ width:'38px', height:'38px', backgroundColor:'var(--parch-dk)', border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'10px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--ember)', margin:'0 0 2px' }}>{item.label}</p>
                  <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', fontWeight:600, color:'var(--bark)', margin:0 }}>{item.val}</p>
                </div>
                {item.href && <ArrowRight style={{ width:'13px', height:'13px', color:'var(--mid)', marginRight:'auto' }}/>}
              </a>
            ))}
          </div>

          {/* Campfire quote */}
          <div style={{ backgroundColor:'var(--forest)', padding:'22px 24px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, opacity:0.08 }} className="terrain"/>
            <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:'200px', height:'100px', background:'radial-gradient(ellipse,rgba(212,98,42,0.3) 0%,transparent 70%)' }}/>
            <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'flex-start', gap:'12px' }}>
              <FireIcon/>
              <div>
                <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'14px', fontWeight:400, fontStyle:'italic', color:'rgba(237,229,208,0.75)', lineHeight:1.6, margin:'0 0 8px' }}>
                  "المغامر الحقيقي يحمل معداته بعناية."
                </p>
                <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:'10px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--ember)' }}>
                  Wilderness Supply Co.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ backgroundColor:'var(--cream)', border:'1px solid var(--line)', padding:'28px' }}>
          <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'10px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ember)', marginBottom:'22px' }}>// أرسل رسالة</p>
          {sent ? (
            <div style={{ minHeight:'240px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid var(--line)', textAlign:'center', padding:'32px', backgroundColor:'var(--parch-dk)' }}>
              <CheckCircle2 style={{ width:'36px', height:'36px', color:'var(--forest)', marginBottom:'14px' }}/>
              <h3 className="bb" style={{ fontSize:'1.8rem', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--bark)', margin:'0 0 8px' }}>تم الإرسال!</h3>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', color:'var(--mid)', fontWeight:400 }}>سنرد عليك خلال 24 ساعة 🏕️</p>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[
                { label:'اسمك', type:'text',  key:'name',  ph:'الاسم الكامل' },
                { label:'البريد', type:'email', key:'email', ph:'بريدك@الإلكتروني' },
              ].map(f=>(
                <div key={f.key}>
                  <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'10px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required className="inp"
                    onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor='var(--line)';}}/>
                </div>
              ))}
              <div>
                <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'10px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>رسالتك</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp"
                  style={{ resize:'none' as any }}
                  onFocus={e=>{e.target.style.borderColor='var(--forest)';}} onBlur={e=>{e.target.style.borderColor='var(--line)';}}/>
              </div>
              <button type="submit" className="btn-ember" style={{ justifyContent:'center', width:'100%', fontSize:'14px', padding:'13px', clipPath:'none' }}>
                إرسال الرسالة <ArrowRight style={{ width:'14px', height:'14px' }}/>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}