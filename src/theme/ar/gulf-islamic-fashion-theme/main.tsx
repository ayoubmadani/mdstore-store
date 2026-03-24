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
  @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

  :root {
    --cream:   #FAF6EE;
    --sand:    #F0E8D5;
    --sand-dk: #E2D5BC;
    --gold:    #B8973A;
    --gold-lt: #D4B05A;
    --gold-dk: #8A6E28;
    --walnut:  #5C3D1E;
    --walnut-2:#7A5230;
    --ink:     #1A1208;
    --mid:     #6B5A42;
    --dim:     #9A8870;
    --line:    rgba(184,151,58,0.18);
    --line-dk: rgba(184,151,58,0.32);
  }

  body { background:var(--cream); color:var(--ink); font-family:'Cairo',sans-serif; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:var(--gold); }

  .amiri { font-family:'Amiri',serif; }

  /* Gold gradient text */
  .gold-text {
    background:linear-gradient(135deg,var(--gold-dk),var(--gold-lt),var(--gold-dk));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  /* Subtle Islamic geometric pattern */
  .geo-bg {
    background-color:var(--sand);
    background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B8973A' fill-opacity='0.06'%3E%3Cpath d='M30 0l8.66 5v10L30 20l-8.66-5V5L30 0zm0 40l8.66 5v10L30 60l-8.66-5V45L30 40zM0 20l8.66 5v10L0 40l-8.66-5V25L0 20zm60 0l8.66 5v10L60 40l-8.66-5V25L60 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  /* Calligraphy divider */
  .cal-line { display:flex; align-items:center; gap:14px; }
  .cal-line::before,.cal-line::after { content:''; flex:1; height:1px; background:linear-gradient(to right,transparent,var(--gold)); }
  .cal-line::after { background:linear-gradient(to left,transparent,var(--gold)); }

  /* Section label */
  .slabel {
    font-family:'Cairo',sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.18em; text-transform:uppercase; color:var(--gold);
    display:flex; align-items:center; gap:10px;
  }
  .slabel::before,.slabel::after { content:'◆'; font-size:6px; color:var(--gold); opacity:0.6; }

  /* Animations */
  @keyframes fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .fu   { animation:fade-up 0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay:0.1s; }
  .fu-2 { animation-delay:0.2s; }
  .fu-3 { animation-delay:0.32s; }

  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  /* Card */
  .t-card { transition:transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s; cursor:pointer; background:var(--cream); }
  .t-card:hover { transform:translateY(-5px); box-shadow:0 20px 56px rgba(26,18,8,0.12); }
  .t-card:hover .c-img img { transform:scale(1.04); }
  .c-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.5s cubic-bezier(0.22,1,0.36,1); }

  /* Buttons */
  .btn-gold {
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg,var(--gold-dk),var(--gold),var(--gold-dk));
    background-size:200% auto;
    color:var(--cream); font-family:'Cairo',sans-serif; font-size:14px; font-weight:600;
    letter-spacing:0.06em; padding:13px 30px;
    border:none; cursor:pointer; text-decoration:none; border-radius:0;
    transition:background-position 0.4s, transform 0.25s, box-shadow 0.25s;
    box-shadow:0 4px 16px rgba(184,151,58,0.3);
  }
  .btn-gold:hover { background-position:right center; transform:translateY(-2px); box-shadow:0 8px 28px rgba(184,151,58,0.45); }

  .btn-outline {
    display:inline-flex; align-items:center; gap:8px;
    background:transparent; color:var(--gold);
    border:1.5px solid var(--gold); font-family:'Cairo',sans-serif;
    font-size:13px; font-weight:600; letter-spacing:0.06em; padding:12px 26px;
    cursor:pointer; text-decoration:none; border-radius:0; transition:all 0.25s;
  }
  .btn-outline:hover { background:var(--gold); color:var(--cream); }

  /* Inputs */
  .inp {
    width:100%; padding:12px 14px;
    background:var(--cream); border:1.5px solid var(--line-dk);
    font-family:'Cairo',sans-serif; font-size:13px; color:var(--ink);
    outline:none; border-radius:0; transition:border-color 0.2s, box-shadow 0.2s;
  }
  .inp:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(184,151,58,0.1); }
  .inp::placeholder { color:var(--dim); }
  .inp-err { border-color:#C0392B !important; }
  select.inp { appearance:none; cursor:pointer; }

  /* Responsive */
  .nav-links   { display:flex; align-items:center; gap:28px; }
  .nav-toggle  { display:none; }
  .hero-split  { display:grid; grid-template-columns:1fr 1fr; min-height:90vh; }
  .prod-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--line); }
  .cat-grid    { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .trust-bar   { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g    { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:56px; }
  .details-g   { display:grid; grid-template-columns:1fr 1fr; }
  .details-L   { position:sticky; top:70px; height:calc(100vh - 70px); overflow:hidden; }
  .details-R   { padding:40px 36px 80px; }
  .contact-g   { display:grid; grid-template-columns:1fr 1fr; gap:56px; }
  .form-2c     { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c      { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

  @media (max-width:1100px) {
    .prod-grid { grid-template-columns:repeat(3,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:36px; }
  }
  @media (max-width:768px) {
    .nav-links  { display:none; }
    .nav-toggle { display:flex; }
    .hero-split { grid-template-columns:1fr; min-height:auto; }
    .prod-grid  { grid-template-columns:repeat(2,1fr); }
    .cat-grid   { grid-template-columns:repeat(2,1fr); }
    .trust-bar  { grid-template-columns:repeat(2,1fr); }
    .footer-g   { grid-template-columns:1fr 1fr; gap:28px; }
    .details-g  { grid-template-columns:1fr; }
    .details-L  { position: static; width: 100%; height:auto ;aspect-ratio: 1; margin-buttom: 200px ; display: flex ;flex-direction: column; gap:20px;}
    .details-R  { padding:24px 16px 48px; }
    .contact-g  { grid-template-columns:1fr; gap:28px; }
  }
  @media (max-width:480px) {
    .prod-grid { grid-template-columns:repeat(2,1fr); }
    .footer-g  { grid-template-columns:1fr; gap:24px; }
    .form-2c   { grid-template-columns:1fr; }
    .dlv-2c    { grid-template-columns:1fr; }
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

/* ── DECORATIVE ─────────────────────────────────────────────── */
function GoldDiamond({ size = 8 }: { size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none">
      <path d="M4 0L8 4L4 8L0 4Z" fill="var(--gold)" opacity="0.7"/>
    </svg>
  );
}

/* ── MAIN ───────────────────────────────────────────────────── */
export default function Main({ store, children }: any) {
  if (!store) return null;
  console.log(store);
  
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
    { href:`/${store.subdomain}`,         label:'المجموعة'  },
    { href:`/${store.subdomain}/contact`, label:'تواصل'     },
    { href:`/${store.subdomain}/Privacy`, label:'الخصوصية'  },
  ];

  return (
    <nav dir="rtl" style={{
      position:'sticky', top:0, zIndex:50,
      backgroundColor:scrolled?'rgba(250,246,238,0.96)':'var(--cream)',
      backdropFilter:scrolled?'blur(16px)':'none',
      borderBottom:`1px solid ${scrolled?'var(--line-dk)':'transparent'}`,
      transition:'all 0.35s',
    }}>
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ backgroundColor:'var(--walnut)', overflow:'hidden', whiteSpace:'nowrap', padding:'7px 0' }}>
          <div style={{ display:'inline-block', animation:'ticker 24s linear infinite' }}>
            {Array(12).fill(null).map((_,i)=>(
              <span key={i} style={{ fontFamily:"'Cairo',sans-serif", fontSize:'12px', fontWeight:500, letterSpacing:'0.1em', color:'rgba(250,246,238,0.8)', margin:'0 40px', display:'inline-flex', alignItems:'center', gap:'10px' }}>
                <GoldDiamond size={6}/> {store.topBar.text} <GoldDiamond size={6}/>
              </span>
            ))}
            {Array(12).fill(null).map((_,i)=>(
              <span key={`b${i}`} style={{ fontFamily:"'Cairo',sans-serif", fontSize:'12px', fontWeight:500, letterSpacing:'0.1em', color:'rgba(250,246,238,0.8)', margin:'0 40px', display:'inline-flex', alignItems:'center', gap:'10px' }}>
                <GoldDiamond size={6}/> {store.topBar.text} <GoldDiamond size={6}/>
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 28px', height:'70px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', position:'relative' }}>

        {/* Logo — left */}
        <Link href={`/${store.subdomain}`} style={{ textDecoration:'none', flexShrink:0 }}>
          {store.design?.logoUrl
            ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'40px', width:'auto', objectFit:'contain' }}/>
            : <div style={{ width:'40px', height:'40px', border:'1px solid var(--line-dk)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <GoldDiamond size={10}/>
              </div>
          }
        </Link>

        {/* Store name — center */}
        <Link href={`/${store.subdomain}`} style={{ textDecoration:'none', position:'absolute', left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
          <span className="amiri" style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--walnut)', display:'block', lineHeight:1, whiteSpace:'nowrap' }}>
            {store.name}
          </span>
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'6px', marginTop:'3px' }}>
            <span style={{ display:'block', height:'1px', width:'20px', background:'linear-gradient(to right,transparent,var(--gold))' }}/>
            <GoldDiamond size={6}/>
            <span style={{ display:'block', height:'1px', width:'20px', background:'linear-gradient(to left,transparent,var(--gold))' }}/>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map(l=>(
            <Link key={l.href} href={l.href}
              style={{ fontFamily:"'Cairo',sans-serif", fontSize:'14px', fontWeight:500, color:'var(--mid)', textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
              {l.label}
            </Link>
          ))}
          <a href="#collection" className="btn-gold" style={{ padding:'10px 22px', fontSize:'13px' }}>
            تسوق المجموعة
          </a>
        </div>

        <button className="nav-toggle" onClick={()=>setOpen(p=>!p)} style={{ background:'none', border:'1px solid var(--line-dk)', cursor:'pointer', color:'var(--walnut)', padding:'8px', borderRadius:'0', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {open ? <X style={{ width:'18px', height:'18px' }}/> : <Menu style={{ width:'18px', height:'18px' }}/>}
        </button>
      </div>

      <div style={{ maxHeight:open?'220px':'0', overflow:'hidden', transition:'max-height 0.3s ease', borderTop:open?'1px solid var(--line)':'none', backgroundColor:'var(--cream)' }}>
        <div style={{ padding:'8px 28px 18px' }}>
          {links.map(l=>(
            <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', fontFamily:"'Cairo',sans-serif", fontSize:'15px', fontWeight:500, color:'var(--mid)', textDecoration:'none', borderBottom:'1px solid var(--line)' }}>
              {l.label} <ArrowRight style={{ width:'14px', height:'14px', color:'var(--gold)' }}/>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ── FOOTER ─────────────────────────────────────────────────── */
export function Footer({ store }: { store: any }) {
  const yr = new Date().getFullYear();
  
  if (!store) return null;

  return (
    <footer 
      dir="rtl" 
      style={{ 
        backgroundColor: 'var(--walnut)', 
        fontFamily: "'Cairo', sans-serif", 
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
      {/* Geo pattern overlay - خلفية زخرفية */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          pointerEvents: 'none', 
          opacity: 0.06,
          backgroundImage: 'url("/path-to-your-pattern.svg")', // تأكد من وجود المسار أو الكلاس
        }} 
        className="geo-bg"
      />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1280px', margin: '0 auto', padding: '64px 28px 40px' }}>
        <div 
          className="footer-g" 
          style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            paddingBottom: '48px', 
            borderBottom: '1px solid rgba(250, 246, 238, 0.1)' 
          }}
        >
          {/* Brand Section */}
          <div>
            <span className="amiri" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cream)', display: 'block', marginBottom: '6px' }}>
              {store.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <span style={{ display: 'block', height: '1px', width: '28px', background: 'var(--gold)', opacity: 0.5 }} />
              <GoldDiamond size={6} />
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.9', color: 'rgba(250, 246, 238, 0.5)', maxWidth: '220px', fontWeight: 300 }}>
              أجود الأزياء الخليجية الإسلامية الرجالية، مختارة بعناية فائقة لتناسب ذوقكم الرفيع.
            </p>
          </div>

          {/* Dynamic Columns */}
          {[
            { 
              title: 'روابط هامة', 
              links: [
                [`/${store.subdomain}`, 'المجموعة الكاملة'],
                [`/${store.subdomain}/Privacy`, 'سياسة الخصوصية'],
                [`/${store.subdomain}/Terms`, 'الشروط والأحكام'],
                [`/${store.subdomain}/contact`, 'تواصل معنا'],
              ] 
            },
            { 
              title: 'معلومات التواصل', 
              links: [
                ['tel:+213550000000', '+213 550 000 000'],
                ['https://maps.google.com', 'أولاد فايت، الجزائر'],
                ['mailto:info@store.dz', 'info@store.dz'],
              ] 
            },
          ].map((col) => (
            <div key={col.title}>
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '20px' }}>
                {col.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {col.links.map(([href, label]) => (
                  <a 
                    key={label} 
                    href={href} 
                    style={{ 
                      fontSize: '13px', 
                      color: 'rgba(250, 246, 238, 0.6)', 
                      textDecoration: 'none', 
                      transition: 'all 0.3s ease' 
                    }}
                    onMouseEnter={e => { (e.currentTarget.style.color = 'var(--gold-lt)'); (e.currentTarget.style.paddingRight = '5px'); }}
                    onMouseLeave={e => { (e.currentTarget.style.color = 'rgba(250, 246, 238, 0.6)'); (e.currentTarget.style.paddingRight = '0'); }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{ paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(250, 246, 238, 0.3)', letterSpacing: '0.5px' }}>
            © {yr} {store.name}. جميع الحقوق محفوظة.
          </p>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
             <span style={{ fontSize: '11px', color: 'rgba(250, 246, 238, 0.3)' }}>Gulf Fashion Theme</span>
             <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)', opacity: 0.3 }} />
             <span style={{ fontSize: '11px', color: 'rgba(250, 246, 238, 0.3)' }}>صنع بإتقان</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── CARD ───────────────────────────────────────────────────── */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [hov, setHov] = useState(false);
  if (!product || !store) return null;

  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number) || 0;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  
  // اللون الموحد للهوية (الذهبي العميق)
  const brandGold = 'var(--gold-dk)';

  return (
    <div 
      className="t-card group" 
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        transition: 'all 0.4s ease',
        backgroundColor: 'var(--cream)' // أو أي لون خلفية فاتح مستخدم عندك
      }}
    >
      {/* منطقة الصورة */}
      <div className="c-img" style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: 'var(--sand)' }}>
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={product.name} 
            className="transition-transform duration-700 group-hover:scale-105"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="geo-bg">
            <span className="amiri" style={{ fontSize: '2.5rem', color: 'var(--gold)', opacity: 0.3 }}>﷽</span>
          </div>
        )}

        {/* خط ذهبي علوي يتفاعل مع التحويم */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px', 
          background: `linear-gradient(to right, transparent, ${brandGold}, transparent)`, 
          opacity: hov ? 1 : 0.4, transition: 'opacity 0.3s' 
        }}/>

        {/* ملصق الخصم */}
        {discount > 0 && (
          <div style={{ 
            position: 'absolute', top: '12px', right: '12px', 
            backgroundColor: brandGold, color: 'var(--cream)', 
            fontSize: '11px', fontWeight: 600, padding: '4px 12px', 
            letterSpacing: '0.08em', borderRadius: '2px' 
          }}>
            -{discount}%
          </div>
        )}
      </div>

      {/* المعلومات */}
      <div style={{ padding: '16px 14px', borderTop: '1px solid var(--line)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* التقييم */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} style={{ width: '11px', height: '11px', fill: i < 4 ? brandGold : 'none', color: brandGold }} />
          ))}
        </div>

        {/* اسم المنتج بخط أميري */}
        <h3 className="amiri" style={{ 
          fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', 
          marginBottom: '10px', lineHeight: 1.4, 
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, 
          overflow: 'hidden', minHeight: '3.2em'
        }}>
          {product.name}
        </h3>

        {/* قسم السعر والزر (ثابت في الأسفل) */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="amiri" style={{ fontSize: '1.3rem', fontWeight: 700, color: brandGold }}>
                {price.toLocaleString()}
                <span style={{ fontFamily: "'Cairo',sans-serif", fontWeight: 600, fontSize: '12px', color: 'var(--mid)', marginRight: '4px' }}>دج</span>
              </span>
              {orig > price && (
                <span style={{ fontSize: '12px', color: 'var(--dim)', textDecoration: 'line-through', opacity: 0.6 }}>
                  {orig.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* الزر الموحد والظاهر دوماً */}
          <Link href={`/${store.subdomain}/product/${product.slug || product.id}`}
            className="amiri"
            style={{ 
              textDecoration: 'none', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%', 
              fontSize: '1.1rem', 
              fontWeight: 700,
              padding: '10px', 
              backgroundColor: hov ? brandGold : 'transparent',
              color: hov ? 'var(--cream)' : brandGold,
              border: `1.5px solid ${brandGold}`,
              transition: 'all 0.3s ease',
              borderRadius: '2px'
            }}>
            {viewDetails}
          </Link>
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

  return (
    <div dir="rtl">

      {/* ── HERO ── */}
      <section className="hero-split" style={{ overflow:'hidden' }}>

        {/* Right: Text */}
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'8vw 6vw', position:'relative', backgroundColor:'var(--cream)', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, opacity:0.35 }} className="geo-bg"/>
          {/* Gold corner ornament */}
          <div style={{ position:'absolute', top:0, right:0, width:'80px', height:'80px', borderTop:'2px solid var(--gold)', borderRight:'2px solid var(--gold)', opacity:0.3 }}/>
          <div style={{ position:'absolute', bottom:0, left:0, width:'80px', height:'80px', borderBottom:'2px solid var(--gold)', borderLeft:'2px solid var(--gold)', opacity:0.3 }}/>

          <div style={{ position:'relative', zIndex:2 }}>
            <div className="fu slabel" style={{ marginBottom:'20px', justifyContent:'flex-start' }}>مجموعة حصرية</div>

            <h1 className="fu fu-1 amiri" style={{ fontSize:'clamp(2.8rem,6vw,5.5rem)', fontWeight:700, color:'var(--ink)', lineHeight:1, marginBottom:'18px', letterSpacing:'0.01em' }}>
              {store.hero?.title || <><span>أصالة</span><br/><span className="gold-text">الخليج</span></>}
            </h1>

            <div className="fu fu-2 cal-line" style={{ marginBottom:'18px' }}>
              <GoldDiamond size={7}/>
            </div>

            <p className="fu fu-2" style={{ fontFamily:"'Cairo',sans-serif", fontSize:'15px', lineHeight:'1.9', color:'var(--mid)', marginBottom:'36px', maxWidth:'400px', fontWeight:400 }}>
              {store.hero?.subtitle || 'أجود الأزياء الخليجية والإسلامية الرجالية — ثياب، جلابيات، وبشوت مُختارة بعناية فائقة.'}
            </p>

            <div className="fu fu-3" style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
              <a href="#collection" className="btn-gold" style={{ fontSize:'14px', padding:'14px 32px' }}>
                استعرض المجموعة <ArrowRight style={{ width:'14px', height:'14px' }}/>
              </a>
              {cats.length>0 && (
                <a href="#categories" className="btn-outline" style={{ fontSize:'14px', padding:'13px 28px' }}>
                  الفئات
                </a>
              )}
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:'36px', marginTop:'48px', paddingTop:'32px', borderTop:'1px solid var(--line-dk)', flexWrap:'wrap' }}>
              {[
                { n:`${products.length}+`, l:'قطعة', c:'var(--gold-dk)' },
                { n:'48H',   l:'توصيل', c:'var(--walnut)' },
                { n:'100%',  l:'أصيل',  c:'var(--walnut)' },
              ].map((s,i)=>(
                <div key={i} style={{ textAlign:'center' }}>
                  <p className="amiri" style={{ fontSize:'2rem', fontWeight:700, color:s.c, lineHeight:1, margin:0 }}>{s.n}</p>
                  <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--dim)', margin:'4px 0 0' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left: Image */}
        <div style={{ position:'relative', overflow:'hidden', minHeight:'560px', backgroundColor:'var(--sand)' }}>
          {store.hero?.imageUrl
            ? <img src={store.hero.imageUrl} alt={store.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            : (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }} className="geo-bg">
                <span className="amiri" style={{ fontSize:'8rem', color:'var(--gold)', opacity:0.12, userSelect:'none' }}>﷽</span>
              </div>
            )
          }
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(250,246,238,0.2) 0%, transparent 30%)', pointerEvents:'none' }}/>
          {/* Bottom tag */}
          <div style={{ position:'absolute', bottom:'20px', right:'20px', backgroundColor:'rgba(250,246,238,0.92)', backdropFilter:'blur(12px)', padding:'12px 18px', border:'1px solid var(--line-dk)' }}>
            <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'10px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--mid)', margin:0 }}>مجموعة {new Date().getFullYear()}</p>
            <p className="amiri" style={{ fontSize:'1rem', fontWeight:700, color:'var(--walnut)', margin:'3px 0 0' }}>أزياء خليجية راقية</p>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ borderTop:'1px solid var(--line-dk)', borderBottom:'1px solid var(--line-dk)', backgroundColor:'var(--sand)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div className="trust-bar">
            {[
              { icon:'🚚', title:'توصيل لكل الجزائر', desc:'48 ساعة لبابك' },
              { icon:'✅', title:'أزياء أصيلة 100%',  desc:'جودة مُختارة بعناية' },
              { icon:'🔄', title:'إرجاع مجاني',         desc:'30 يوم إرجاع مضمون' },
              { icon:'📞', title:'خدمة العملاء',         desc:'دعم سريع ومتواصل' },
            ].map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'18px 22px', borderLeft:i>0?'1px solid var(--line)':'none' }}>
                <span style={{ fontSize:'1.4rem' }}>{item.icon}</span>
                <div>
                  <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:600, color:'var(--ink)', margin:0 }}>{item.title}</p>
                  <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', color:'var(--dim)', margin:0, fontWeight:400 }}>{item.desc}</p>
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
            <div style={{ textAlign:'center', marginBottom:'44px' }}>
              <div className="slabel" style={{ justifyContent:'center', marginBottom:'12px' }}>الفئات</div>
              <h2 className="amiri" style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:700, color:'var(--ink)', margin:'0 0 14px' }}>
                استعرض التشكيلات
              </h2>
              <div className="cal-line"><GoldDiamond/></div>
            </div>
            <div className="cat-grid">
              {cats.slice(0,8).map((cat:any)=>(
                <Link key={cat.id} href={`/${store.subdomain}?category=${cat.id}`}
                  style={{ display:'block', textDecoration:'none', border:'1px solid var(--line-dk)', position:'relative', aspectRatio:'3/4', overflow:'hidden', backgroundColor:'var(--sand)', transition:'all 0.35s' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--gold)'; el.style.transform='translateY(-4px)'; el.style.boxShadow='0 12px 32px rgba(26,18,8,0.1)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--line-dk)'; el.style.transform='none'; el.style.boxShadow='none';}}>
                  {cat.imageUrl
                    ? <img src={cat.imageUrl} alt={cat.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', opacity:0.7 }}/>
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }} className="geo-bg">
                        <span className="amiri" style={{ fontSize:'3rem', color:'var(--gold)', opacity:0.2 }}>﷽</span>
                      </div>
                  }
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(92,61,30,0.85) 0%, transparent 60%)', display:'flex', alignItems:'flex-end', padding:'16px' }}>
                    <span className="amiri" style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--cream)' }}>{cat.name}</span>
                  </div>
                  {/* Gold top border accent */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(to right,transparent,var(--gold),transparent)' }}/>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── COLLECTION GRID ── */}
      <section id="collection" style={{ backgroundColor:'var(--sand)' }}>
        {/* Header */}
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'56px 28px 32px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div className="slabel" style={{ marginBottom:'10px' }}>المجموعة</div>
              <h2 className="amiri" style={{ fontSize:'clamp(1.8rem,3vw,2.8rem)', fontWeight:700, color:'var(--ink)', margin:0 }}>
                أحدث التشكيلات
              </h2>
            </div>
            <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', color:'var(--dim)', fontWeight:400 }}>{products.length} قطعة</p>
          </div>
          <div className="cal-line" style={{ marginTop:'16px' }}><GoldDiamond/></div>
        </div>

        {products.length===0 ? (
          <div style={{ padding:'80px 0', textAlign:'center', borderTop:'1px solid var(--line)' }}>
            <span className="amiri" style={{ fontSize:'3rem', color:'var(--gold)', opacity:0.2, display:'block', marginBottom:'16px' }}>﷽</span>
            <p className="amiri" style={{ fontSize:'1.5rem', color:'var(--dim)' }}>المجموعة قادمة قريباً</p>
          </div>
        ) : (
          <div className="prod-grid" style={{ maxWidth:'100%' }}>
            {products.map((p:any)=>{
              const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض القطعة"/>;
            })}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section style={{ position:'relative', padding:'96px 28px', textAlign:'center', overflow:'hidden', backgroundColor:'var(--walnut)' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.08 }} className="geo-bg"/>
        {store.hero?.imageUrl && <img src={store.hero.imageUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.07, display:'block' }}/>}
        <div style={{ position:'relative', zIndex:2, maxWidth:'620px', margin:'0 auto' }}>
          <div className="slabel" style={{ justifyContent:'center', marginBottom:'16px', color:'var(--gold-lt)' }}>أصالة وأناقة</div>
          <h2 className="amiri" style={{ fontSize:'clamp(2rem,5vw,4rem)', fontWeight:700, color:'var(--cream)', lineHeight:1.05, marginBottom:'16px' }}>
            {store.hero?.title ? 'مجموعة راقية تليق بك' : <>الأصالة<br/><span style={{ color:'var(--gold-lt)' }}>تُعرِّفك</span></>}
          </h2>
          <div className="cal-line" style={{ margin:'18px 0' }}><GoldDiamond/></div>
          <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'15px', lineHeight:'1.9', color:'rgba(250,246,238,0.65)', marginBottom:'32px', fontWeight:300 }}>
            اختر ما يعكس هويتك من أجود الأزياء الخليجية والإسلامية الرجالية.
          </p>
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="#collection" className="btn-gold" style={{ fontSize:'14px', padding:'14px 36px' }}>
              تسوق الآن <ArrowRight style={{ width:'14px', height:'14px' }}/>
            </a>
            <Link href={`/${store.subdomain}/contact`} className="btn-outline" style={{ textDecoration:'none', borderColor:'rgba(250,246,238,0.4)', color:'var(--cream)', padding:'13px 28px' }}>
              تواصل معنا
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
      <div style={{ borderBottom:'1px solid var(--line-dk)', padding:'11px 28px', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'var(--dim)', backgroundColor:'var(--sand)' }}>
        <Link href="/" style={{ textDecoration:'none', color:'var(--mid)', transition:'color 0.2s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
          الرئيسية
        </Link>
        <GoldDiamond size={5}/>
        <span style={{ color:'var(--walnut)', fontWeight:600 }}>{product.name.slice(0,40)}</span>
        <div style={{ marginRight:'auto', display:'flex', gap:'8px' }}>
          <button onClick={toggleWishlist} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isWishlisted?'var(--gold)':'var(--line-dk)'}`, background:isWishlisted?'rgba(184,151,58,0.1)':'transparent', cursor:'pointer', color:isWishlisted?'var(--gold)':'var(--mid)' }}>
            <Heart style={{ width:'13px', height:'13px', fill:isWishlisted?'currentColor':'none' }}/>
          </button>
          <button onClick={handleShare} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--mid)' }}>
            <Share2 style={{ width:'13px', height:'13px' }}/>
          </button>
        </div>
      </div>

      <div className="details-g" style={{ maxWidth:'1280px', margin:'0 auto', }}>
        {/* Gallery */}
        <div className="details-L">
          <div style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden', backgroundColor:'var(--sand)', border:'1px solid var(--line)' }}>
            {allImages.length>0
              ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }} className="geo-bg">
                  <span className="amiri" style={{ fontSize:'6rem', color:'var(--gold)', opacity:0.15 }}>﷽</span>
                </div>
            }
            {/* Gold trim */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(to right,transparent,var(--gold),transparent)' }}/>
            {discount>0 && <div style={{ position:'absolute', top:'12px', right:'12px', backgroundColor:'var(--gold)', color:'var(--cream)', fontSize:'11px', fontWeight:600, padding:'4px 12px', letterSpacing:'0.08em' }}>-{discount}%</div>}
            {allImages.length>1 && (
              <>
                <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', border:'1px solid var(--line-dk)', borderRadius:'50%', backgroundColor:'rgba(250,246,238,0.9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronRight style={{ width:'14px', height:'14px', color:'var(--walnut)' }}/>
                </button>
                <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', border:'1px solid var(--line-dk)', borderRadius:'50%', backgroundColor:'rgba(250,246,238,0.9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronLeft style={{ width:'14px', height:'14px', color:'var(--walnut)' }}/>
                </button>
              </>
            )}
            {!inStock&&!autoGen && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(250,246,238,0.85)', backdropFilter:'blur(4px)' }}>
                <span className="amiri" style={{ fontSize:'2rem', fontWeight:700, color:'var(--mid)' }}>نفد المخزون</span>
              </div>
            )}
          </div>
          {allImages.length>1 && (
            <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
              {allImages.slice(0,5).map((img:string,idx:number)=>(
                <button key={idx} onClick={()=>setSel(idx)} style={{ width:'54px', height:'54px', overflow:'hidden', border:`2px solid ${sel===idx?'var(--gold)':'var(--line-dk)'}`, cursor:'pointer', padding:0, background:'none', opacity:sel===idx?1:0.55 }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="details-R">
          <div className="slabel" style={{ marginBottom:'12px' }}>أزياء خليجية</div>
          <h1 className="amiri" style={{ fontSize:'clamp(1.8rem,3.5vw,3.2rem)', fontWeight:700, color:'var(--ink)', lineHeight:1, marginBottom:'14px' }}>
            {product.name}
          </h1>

          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line-dk)', flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:'2px' }}>
              {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'13px', height:'13px', fill:i<4?'var(--gold)':'none', color:'var(--gold)' }}/>)}
            </div>
            <span style={{ fontFamily:"'Cairo',sans-serif", fontSize:'12px', color:'var(--dim)' }}>4.8 (128 تقييم)</span>
            <span style={{ marginRight:'auto', padding:'5px 14px', border:`1px solid ${inStock||autoGen?'var(--gold)':'var(--dim)'}`, color:inStock||autoGen?'var(--gold-dk)':'var(--dim)', fontSize:'12px', fontWeight:600, letterSpacing:'0.08em' }}>
              {autoGen?'∞ متوفر':inStock?'متوفر':'نفد المخزون'}
            </span>
          </div>

          {/* Price */}
          <div style={{ marginBottom:'22px', padding:'18px', backgroundColor:'var(--sand)', border:'1px solid var(--line)' }}>
            <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--dim)', margin:'0 0 6px' }}>السعر</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:'12px', flexWrap:'wrap' }}>
              <span className="amiri" style={{ fontSize:'3rem', fontWeight:700, color:'var(--gold-dk)', lineHeight:1, letterSpacing:'-0.01em' }}>{finalPrice.toLocaleString()}</span>
              <span style={{ fontFamily:"'Cairo',sans-serif", fontSize:'15px', color:'var(--mid)' }}>دج</span>
              {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                <>
                  <span style={{ fontSize:'14px', textDecoration:'line-through', color:'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                  <span style={{ fontSize:'12px', color:'var(--gold)', fontWeight:600, padding:'2px 8px', border:'1px solid var(--line-dk)', letterSpacing:'0.06em' }}>
                    وفّر {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Offers */}
          {product.offers?.length>0 && (
            <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line)' }}>
              <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'12px' }}>الباقات</p>
              {product.offers.map((offer:any)=>(
                <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', border:`1.5px solid ${selectedOffer===offer.id?'var(--gold)':'var(--line-dk)'}`, cursor:'pointer', marginBottom:'8px', transition:'all 0.2s', backgroundColor:selectedOffer===offer.id?'rgba(184,151,58,0.05)':'transparent' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'16px', height:'16px', border:`2px solid ${selectedOffer===offer.id?'var(--gold)':'var(--dim)'}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {selectedOffer===offer.id&&<div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--gold)' }}/>}
                    </div>
                    <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                    <div>
                      <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:500, color:'var(--ink)', margin:0 }}>{offer.name}</p>
                      <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', color:'var(--dim)', margin:0 }}>الكمية: {offer.quantity}</p>
                    </div>
                  </div>
                  <span className="amiri" style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--gold-dk)' }}>
                    {offer.price.toLocaleString()} <span style={{ fontFamily:"'Cairo',sans-serif", fontWeight:300, fontSize:'12px', color:'var(--mid)' }}>دج</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--line)' }}>
              <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'10px' }}>{attr.name}</p>
              {attr.displayMode==='color' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'28px', height:'28px', backgroundColor:v.value, border:'none', cursor:'pointer', borderRadius:'50%', outline:s?'2.5px solid var(--gold)':'2.5px solid transparent', outlineOffset:'3px' }}/>;})}
                </div>
              ):attr.displayMode==='image' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`2px solid ${s?'var(--gold)':'var(--line-dk)'}`, cursor:'pointer', padding:0 }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                </div>
              ):(
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ padding:'8px 16px', border:`1.5px solid ${s?'var(--gold)':'var(--line-dk)'}`, backgroundColor:s?'var(--gold)':'transparent', color:s?'var(--cream)':'var(--mid)', fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:500, cursor:'pointer', transition:'all 0.18s' }}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--line)' }}>
              <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--dim)', marginBottom:'12px' }}>وصف القطعة</p>
              <div style={{ fontFamily:"'Cairo',sans-serif", fontSize:'14px', lineHeight:'1.9', color:'var(--mid)', fontWeight:400 }}
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
    {label && <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>{label}</p>}
    {children}
    {error && <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', color:'#C0392B', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
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
    if(!fd.customerName.trim())  e.customerName='الاسم مطلوب';
    if(!fd.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!fd.customerWelaya)       e.customerWelaya='الولاية مطلوبة';
    if(!fd.customerCommune)      e.customerCommune='البلدية مطلوبة';
    return e;
  };
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault(); const er=validate(); if(Object.keys(er).length){setErrors(er);return;} setErrors({}); setSub(true);
    try{
      await axios.post(`${API_URL}/orders`,{...fd,productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()});
      if(typeof window!=='undefined'&&fd.customerId) localStorage.setItem('customerId',fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    }catch(err){console.error(err);}finally{setSub(false);}
  };

  return (
    <div style={{ marginTop:'22px', paddingTop:'20px', borderTop:'2px solid var(--gold)', borderImage:'linear-gradient(to right,var(--gold),var(--gold-lt),var(--gold)) 1' }}>
      <form onSubmit={handleSubmit}>
        <div className="form-2c">
          <FR error={errors.customerName} label="الاسم">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="الاسم الكامل"
                className={`inp${errors.customerName?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor=errors.customerName?'#C0392B':'var(--line-dk)';}}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="الهاتف">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX"
                className={`inp${errors.customerPhone?' inp-err':''}`} style={{ paddingLeft:'36px' }}
                onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor=errors.customerPhone?'#C0392B':'var(--line-dk)';}}/>
            </div>
          </FR>
        </div>
        <div className="form-2c">
          <FR error={errors.customerWelaya} label="الولاية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                className={`inp${errors.customerWelaya?' inp-err':''}`} style={{ paddingRight:'34px' }}
                onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor=errors.customerWelaya?'#C0392B':'var(--line-dk)';}}>
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
                onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor=errors.customerCommune?'#C0392B':'var(--line-dk)';}}>
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
                style={{ padding:'13px 10px', border:`1.5px solid ${fd.typeLivraison===type?'var(--gold)':'var(--line-dk)'}`, backgroundColor:fd.typeLivraison===type?'rgba(184,151,58,0.06)':'transparent', cursor:'pointer', textAlign:'right', transition:'all 0.2s' }}>
                <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:500, color:fd.typeLivraison===type?'var(--gold-dk)':'var(--mid)', margin:'0 0 4px' }}>
                  {type==='home'?'توصيل للبيت':'توصيل للمكتب'}
                </p>
                {selW && <p className="amiri" style={{ fontSize:'1.1rem', fontWeight:700, color:fd.typeLivraison===type?'var(--gold-dk)':'var(--dim)', margin:0 }}>
                  {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()}
                  <span style={{ fontFamily:"'Cairo',sans-serif", fontWeight:300, fontSize:'11px', marginRight:'3px', color:'var(--mid)' }}>دج</span>
                </p>}
              </button>
            ))}
          </div>
        </FR>

        <FR label="الكمية">
          <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid var(--line-dk)', backgroundColor:'var(--cream)' }}>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--walnut)', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--sand-dk)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Minus style={{ width:'12px', height:'12px' }}/>
            </button>
            <span className="amiri" style={{ width:'44px', textAlign:'center', fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>{fd.quantity}</span>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--line-dk)', background:'transparent', cursor:'pointer', color:'var(--walnut)', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--sand-dk)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Plus style={{ width:'12px', height:'12px' }}/>
            </button>
          </div>
        </FR>

        {/* Summary */}
        <div style={{ border:'1px solid var(--line-dk)', marginBottom:'14px', overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', backgroundColor:'var(--sand)', borderBottom:'1px solid var(--line)' }}>
            <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--mid)', margin:0 }}>ملخص الطلب</p>
          </div>
          {[
            { l:'القطعة', v:product.name.slice(0,22) },
            { l:'السعر',  v:`${fp.toLocaleString()} دج` },
            { l:'الكمية', v:`× ${fd.quantity}` },
            { l:'التوصيل',v:selW?`${getLiv().toLocaleString()} دج`:'—' },
          ].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 14px', borderBottom:'1px solid var(--line)', backgroundColor:'var(--cream)' }}>
              <span style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', color:'var(--mid)' }}>{row.l}</span>
              <span style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:500, color:'var(--ink)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px', backgroundColor:'var(--sand-dk)' }}>
            <span style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', color:'var(--mid)' }}>المجموع</span>
            <span className="amiri" style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--gold-dk)', letterSpacing:'-0.01em' }}>
              {total().toLocaleString()}
              <span style={{ fontFamily:"'Cairo',sans-serif", fontWeight:300, fontSize:'13px', marginRight:'4px', color:'var(--mid)' }}>دج</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={sub} className="btn-gold"
          style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'15px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1 }}>
          {sub?'جاري المعالجة...':'تأكيد الطلب'}{!sub && <ArrowRight style={{ width:'15px', height:'15px' }}/>}
        </button>

        <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', color:'var(--dim)', textAlign:'center', marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', letterSpacing:'0.06em' }}>
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
  <div dir="rtl" style={{ backgroundColor:'var(--cream)', minHeight:'100vh' }}>
    <div style={{ position:'relative', overflow:'hidden', padding:'72px 28px 48px', backgroundColor:'var(--sand)' }} className="geo-bg">
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:'linear-gradient(to right,transparent,var(--gold),transparent)' }}/>
      <div style={{ maxWidth:'720px', margin:'0 auto', position:'relative', zIndex:2 }}>
        {sub && <div className="slabel" style={{ marginBottom:'14px', justifyContent:'flex-start' }}>{sub}</div>}
        <h1 className="amiri" style={{ fontSize:'clamp(2.2rem,5vw,4.5rem)', fontWeight:700, color:'var(--ink)', lineHeight:0.95, margin:'0 0 14px' }}>{title}</h1>
        <div className="cal-line"><GoldDiamond/></div>
      </div>
    </div>
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'40px 28px 80px' }}>
      <div style={{ backgroundColor:'var(--cream)', border:'1px solid var(--line-dk)', padding:'32px' }}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{ paddingBottom:'20px', marginBottom:'20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start' }}>
    <div style={{ flex:1 }}>
      <h3 className="amiri" style={{ fontSize:'1.15rem', fontWeight:700, color:'var(--ink)', margin:'0 0 8px', display:'flex', alignItems:'center', gap:'8px' }}>
        <GoldDiamond size={6}/> {title}
      </h3>
      <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', lineHeight:'1.85', color:'var(--mid)', fontWeight:400, margin:0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontFamily:"'Cairo',sans-serif", fontSize:'10px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', padding:'4px 10px', border:'1px solid var(--line-dk)', color:'var(--gold-dk)', flexShrink:0, marginTop:'2px' }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="قانوني">
      <IB title="البيانات التي نجمعها"  body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك."/>
      <IB title="كيف نستخدمها"          body="حصرياً لتنفيذ وتوصيل مشترياتك."/>
      <IB title="الأمان"                 body="بياناتك محمية بتشفير قياسي وبنية تحتية آمنة."/>
      <IB title="مشاركة البيانات"        body="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين."/>
      <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'12px', letterSpacing:'0.1em', color:'var(--dim)', marginTop:'20px' }}>آخر تحديث: فبراير 2026</p>
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
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="سياسة الكوكيز" sub="قانوني">
      <IB title="الكوكيز الأساسية"    body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب"/>
      <IB title="كوكيز التفضيلات"     body="تحفظ إعداداتك لتجربة أفضل." tag="اختياري"/>
      <IB title="كوكيز التحليلات"     body="بيانات مجمعة لتحسين المنصة." tag="اختياري"/>
      <div style={{ marginTop:'18px', padding:'14px', border:'1px solid var(--line-dk)', display:'flex', gap:'12px', alignItems:'flex-start', backgroundColor:'var(--sand)' }}>
        <ToggleRight style={{ width:'18px', height:'18px', color:'var(--gold)', flexShrink:0, marginTop:'1px' }}/>
        <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', color:'var(--mid)', lineHeight:'1.8', margin:0, fontWeight:400 }}>
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
      <div style={{ position:'relative', overflow:'hidden', padding:'72px 28px 48px', backgroundColor:'var(--sand)' }} className="geo-bg">
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:'linear-gradient(to right,transparent,var(--gold),transparent)' }}/>
        <div style={{ maxWidth:'960px', margin:'0 auto', position:'relative', zIndex:2 }}>
          <div className="slabel" style={{ marginBottom:'14px', justifyContent:'flex-start' }}>تواصل معنا</div>
          <h1 className="amiri" style={{ fontSize:'clamp(2.2rem,5vw,4.5rem)', fontWeight:700, color:'var(--ink)', lineHeight:0.95, margin:'0 0 14px' }}>
            نسعد بخدمتك
          </h1>
          <div className="cal-line"><GoldDiamond/></div>
          <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'14px', color:'var(--mid)', marginTop:'12px', fontWeight:400 }}>نرد خلال 24 ساعة</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth:'960px', margin:'0 auto', padding:'48px 28px 80px' }}>
        {/* Info */}
        <div>
          <div style={{ backgroundColor:'var(--cream)', border:'1px solid var(--line-dk)', padding:'24px', marginBottom:'12px' }}>
            <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'18px' }}>طرق التواصل</p>
            {[
              { icon:'📞', label:'الهاتف',          val:'+213 550 000 000', href:'tel:+213550000000' },
              { icon:'✉️',  label:'البريد الإلكتروني',val:'info@store.dz',    href:'mailto:info@store.dz' },
              { icon:'📍', label:'الموقع',           val:'أولاد فايت، الجزائر', href:undefined },
            ].map(item=>(
              <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 0', borderBottom:'1px solid var(--line)', textDecoration:'none', transition:'padding-right 0.2s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.paddingRight='6px';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.paddingRight='0';}}>
                <div style={{ width:'38px', height:'38px', backgroundColor:'var(--sand)', border:'1px solid var(--line-dk)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', margin:'0 0 2px' }}>{item.label}</p>
                  <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', fontWeight:500, color:'var(--ink)', margin:0 }}>{item.val}</p>
                </div>
                {item.href && <ArrowRight style={{ width:'13px', height:'13px', color:'var(--gold)', marginRight:'auto' }}/>}
              </a>
            ))}
          </div>
          {/* Quote */}
          <div style={{ backgroundColor:'var(--walnut)', padding:'22px 24px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, opacity:0.08 }} className="geo-bg"/>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(to right,transparent,var(--gold-lt),transparent)' }}/>
            <p className="amiri" style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--cream)', lineHeight:1.6, margin:'0 0 8px', position:'relative', zIndex:2 }}>
              "الأصالة في الزي تعكس الهوية."
            </p>
            <span style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold-lt)', position:'relative', zIndex:2 }}>
              أزياء خليجية راقية
            </span>
          </div>
        </div>

        {/* Form */}
        <div style={{ backgroundColor:'var(--cream)', border:'1px solid var(--line-dk)', padding:'28px' }}>
          <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'22px' }}>أرسل رسالة</p>
          {sent ? (
            <div style={{ minHeight:'240px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid var(--line-dk)', textAlign:'center', padding:'32px', backgroundColor:'var(--sand)' }}>
              <CheckCircle2 style={{ width:'32px', height:'32px', color:'var(--gold-dk)', marginBottom:'12px' }}/>
              <h3 className="amiri" style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--ink)', margin:'0 0 6px' }}>تم إرسال رسالتك!</h3>
              <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'13px', color:'var(--mid)', fontWeight:400 }}>سنرد عليك خلال 24 ساعة.</p>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[
                { label:'اسمك', type:'text',  key:'name',  ph:'الاسم الكامل' },
                { label:'البريد', type:'email', key:'email', ph:'بريدك@الإلكتروني' },
              ].map(f=>(
                <div key={f.key}>
                  <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required className="inp"
                    onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor='var(--line-dk)';}}/>
                </div>
              ))}
              <div>
                <p style={{ fontFamily:"'Cairo',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--mid)', marginBottom:'6px' }}>رسالتك</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp"
                  style={{ resize:'none' as any }}
                  onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor='var(--line-dk)';}}/>
              </div>
              <button type="submit" className="btn-gold" style={{ justifyContent:'center', width:'100%', padding:'13px', fontSize:'14px' }}>
                إرسال الرسالة <ArrowRight style={{ width:'14px', height:'14px' }}/>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}