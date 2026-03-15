'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Share2, Phone, User, ToggleRight,
  Shield, ArrowRight, Plus, Minus, Mountain, CheckCircle2,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --white: #FAFAF8;
    --stone: #F2EFE9;
    --ink:   #1C1C1A;
    --mid:   #6B6B68;
    --dim:   #AEADA9;
    --line:  rgba(28,28,26,0.12);
    --green: #2C4A2E;
    --amber: #C26B2A;
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: var(--ink); }

  @keyframes fade-in { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .fi   { animation: fade-in 0.6s cubic-bezier(0.22,1,0.36,1) both; }
  .fi-1 { animation-delay: 0.1s; }
  .fi-2 { animation-delay: 0.2s; }
  .fi-3 { animation-delay: 0.32s; }

  @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  .card-img img { transition: transform 0.5s cubic-bezier(0.22,1,0.36,1); }
  .gear-card:hover .card-img img { transform: scale(1.04); }
  .gear-card { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1); }
  .gear-card:hover { transform: translateY(-4px); }

  .btn { display:inline-flex; align-items:center; gap:8px; padding:12px 24px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; letter-spacing:0.03em; cursor:pointer; transition:all 0.22s; border:none; text-decoration:none; border-radius:2px; }
  .btn-dark  { background:var(--ink); color:var(--white); }
  .btn-dark:hover  { background:var(--green); }
  .btn-ghost { background:transparent; color:var(--ink); border:1px solid var(--line); }
  .btn-ghost:hover { border-color:var(--ink); }

  .inp { width:100%; padding:11px 13px; font-family:'DM Sans',sans-serif; font-size:13px; background:var(--white); border:1px solid var(--line); color:var(--ink); outline:none; transition:border-color 0.2s; border-radius:2px; }
  .inp:focus { border-color:var(--ink); }
  .inp::placeholder { color:var(--dim); }
  .inp-err { border-color:var(--amber) !important; }
  select.inp { appearance:none; cursor:pointer; }

  .lbl { font-family:'DM Sans',sans-serif; font-size:11px; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:var(--mid); }

  /* ── RESPONSIVE ── */
  .nav-links { display:flex; align-items:center; gap:32px; }
  .nav-toggle { display:none; }

  .footer-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:40px; }
  .details-grid { display:grid; grid-template-columns:1fr 1fr; }
  .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:56px; }
  .stats-strip  { display:grid; grid-template-columns:repeat(3,1fr); }
  .form-2col    { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .delivery-2col{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }

  .details-left { padding-right:40px; padding-top:36px; position:sticky; top:72px; height:fit-content; }
  .details-right { padding-top:36px; padding-bottom:60px; padding-left:40px; border-left:1px solid var(--line); }

  @media (max-width: 900px) {
    .footer-grid { grid-template-columns:1fr 1fr; }
    .details-grid { grid-template-columns:1fr; }
    .details-left { position:static; padding-right:0; padding-top:24px; border-right:none; }
    .details-right { padding-left:0; padding-top:24px; border-left:none; border-top:1px solid var(--line); }
    .contact-grid { grid-template-columns:1fr; gap:36px; }
  }

  @media (max-width: 640px) {
    .nav-links { display:none; }
    .nav-toggle { display:flex; }
    .footer-grid { grid-template-columns:1fr; gap:28px; }
    .stats-strip { grid-template-columns:repeat(3,1fr); }
    .form-2col   { grid-template-columns:1fr; }
    .delivery-2col { grid-template-columns:1fr 1fr; }
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

/* ── MAIN ───────────────────────────────────────────────────── */
export default function Main({ store, children }: any) {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--white)', fontFamily:"'DM Sans',sans-serif", color:'var(--ink)' }}>
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
  const isRTL = store.language === 'ar';
  useEffect(()=>{ const h=()=>setScrolled(window.scrollY>10); window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h); },[]);

  const links = [
    { href:`/${store.subdomain}`,         label:isRTL?'الرئيسية':'Shop'    },
    { href:`/${store.subdomain}/contact`, label:isRTL?'اتصل بنا':'Contact' },
  ];

  return (
    <nav dir={isRTL?'rtl':'ltr'} style={{ position:'sticky', top:0, zIndex:50, backgroundColor:scrolled?'rgba(250,250,248,0.94)':'var(--white)', backdropFilter:scrolled?'blur(14px)':'none', borderBottom:'1px solid var(--line)', transition:'all 0.3s' }}>

      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ backgroundColor:'var(--green)', padding:'7px 0', overflow:'hidden', whiteSpace:'nowrap' }}>
          <div style={{ display:'inline-block', animation:'ticker 22s linear infinite' }}>
            {Array(12).fill(null).map((_,i)=>(
              <span key={i} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', letterSpacing:'0.08em', color:'rgba(250,250,248,0.8)', margin:'0 36px' }}>
                {store.topBar.text}
              </span>
            ))}
            {Array(12).fill(null).map((_,i)=>(
              <span key={`b${i}`} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', letterSpacing:'0.08em', color:'rgba(250,250,248,0.8)', margin:'0 36px' }}>
                {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'60px' }}>
        <Link href={`/${store.subdomain}`} style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <div style={{ width:'32px', height:'32px', backgroundColor:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'2px', flexShrink:0, overflow:'hidden' }}>
            {store.design?.logoUrl
              ? <img src={store.design.logoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : <Mountain style={{ width:'16px', height:'16px', color:'var(--white)' }}/>
            }
          </div>
          <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.15rem', color:'var(--ink)' }}>{store.name}</span>
        </Link>

        <div className="nav-links">
          {links.map(l=>(
            <Link key={l.href} href={l.href} style={{ fontSize:'14px', color:'var(--mid)', textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--ink)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
              {l.label}
            </Link>
          ))}
          <a href="#gear" className="btn btn-dark" style={{ padding:'9px 20px' }}>
            {isRTL?'تسوق الآن':'Shop Now'}
          </a>
        </div>

        <button onClick={()=>setOpen(p=>!p)} className="nav-toggle" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink)', padding:'4px', alignItems:'center', justifyContent:'center' }}>
          {open ? <X style={{ width:'20px', height:'20px' }}/> : <Mountain style={{ width:'20px', height:'20px' }}/>}
        </button>
      </div>

      <div style={{ maxHeight:open?'160px':'0', overflow:'hidden', transition:'max-height 0.3s ease', borderTop:open?'1px solid var(--line)':'none' }}>
        <div style={{ padding:'8px 24px 16px' }}>
          {links.map(l=>(
            <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', fontSize:'14px', color:'var(--mid)', textDecoration:'none', borderBottom:'1px solid var(--line)' }}>
              {l.label} <ArrowRight style={{ width:'13px', height:'13px' }}/>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ── FOOTER ─────────────────────────────────────────────────── */
export function Footer({ store }: any) {
  const year = new Date().getFullYear();
  const isRTL = store.language === 'ar';
  return (
    <footer dir={isRTL?'rtl':'ltr'} style={{ backgroundColor:'var(--green)', color:'rgba(250,250,248,0.8)', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'56px 24px 36px' }}>
        <div className="footer-grid" style={{ paddingBottom:'40px', borderBottom:'1px solid rgba(250,250,248,0.1)' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <div style={{ width:'30px', height:'30px', border:'1px solid rgba(250,250,248,0.25)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'2px' }}>
                <Mountain style={{ width:'14px', height:'14px', color:'var(--white)' }}/>
              </div>
              <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.05rem', color:'var(--white)' }}>{store.name}</span>
            </div>
            <p style={{ fontSize:'13px', lineHeight:'1.8', color:'rgba(250,250,248,0.5)', maxWidth:'220px', fontWeight:300 }}>
              {isRTL?'معدات المغامرة الأصيلة.':'Authentic outdoor gear for the Algerian wild.'}
            </p>
          </div>

          <div>
            <p className="lbl" style={{ color:'rgba(250,250,248,0.35)', marginBottom:'16px' }}>{isRTL?'روابط':'Links'}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                [`/${store.subdomain}/Privacy`, isRTL?'الخصوصية':'Privacy'],
                [`/${store.subdomain}/Terms`,   isRTL?'الشروط':'Terms'],
                [`/${store.subdomain}/Cookies`, isRTL?'الكوكيز':'Cookies'],
                [`/${store.subdomain}/contact`, isRTL?'اتصل بنا':'Contact'],
              ].map(([href,label])=>(
                <a key={href} href={href} style={{ fontSize:'13px', color:'rgba(250,250,248,0.45)', textDecoration:'none', transition:'color 0.2s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--white)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(250,250,248,0.45)';}}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="lbl" style={{ color:'rgba(250,250,248,0.35)', marginBottom:'16px' }}>{isRTL?'تواصل':'Contact'}</p>
            <p style={{ fontSize:'13px', color:'rgba(250,250,248,0.5)', display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
              <Phone style={{ width:'12px', height:'12px', flexShrink:0 }}/> +213 550 000 000
            </p>
            <p style={{ fontSize:'13px', color:'rgba(250,250,248,0.5)', fontWeight:300 }}>Algiers, Algeria</p>
          </div>
        </div>
        <div style={{ paddingTop:'20px', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
          <p style={{ fontSize:'12px', color:'rgba(250,250,248,0.25)' }}>© {year} {store.name}</p>
          <p style={{ fontSize:'12px', color:'rgba(250,250,248,0.25)' }}>Outdoor Theme</p>
        </div>
      </div>
    </footer>
  );
}

/* ── CARD ───────────────────────────────────────────────────── */
export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const [hov, setHov] = useState(false);
  const price = typeof product.price==='string' ? parseFloat(product.price) : product.price as number;
  return (
    <div className="gear-card" onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div className="card-img" style={{ position:'relative', aspectRatio:'4/5', overflow:'hidden', backgroundColor:'var(--stone)', borderRadius:'2px' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Mountain style={{ width:'36px', height:'36px', color:'var(--dim)' }}/>
            </div>
        }
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(28,28,26,0.55) 0%, transparent 55%)', pointerEvents:'none', opacity:hov?1:0, transition:'opacity 0.3s' }}/>
        {discount>0 && (
          <div style={{ position:'absolute', top:'10px', left:'10px', backgroundColor:'var(--amber)', color:'white', fontSize:'11px', fontWeight:500, padding:'3px 8px', borderRadius:'2px' }}>
            -{discount}%
          </div>
        )}
        <div style={{ position:'absolute', bottom:'12px', left:'12px', right:'12px', opacity:hov?1:0, transform:hov?'translateY(0)':'translateY(6px)', transition:'all 0.3s' }}>
          <Link href={`/${store.subdomain}/product/${product.slug||product.id}`}
            className="btn btn-dark" style={{ width:'100%', justifyContent:'center', fontSize:'12px', padding:'10px' }}>
            {viewDetails} <ArrowRight style={{ width:'12px', height:'12px' }}/>
          </Link>
        </div>
      </div>
      <div style={{ padding:'12px 2px' }}>
        <div style={{ display:'flex', gap:'2px', marginBottom:'5px' }}>
          {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'10px', height:'10px', fill:i<4?'var(--amber)':'none', color:'var(--amber)' }}/>)}
        </div>
        <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1rem', color:'var(--ink)', marginBottom:'5px', lineHeight:1.3 }}>{product.name}</h3>
        <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
          <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.15rem', color:'var(--ink)' }}>{price.toLocaleString()}</span>
          <span style={{ fontSize:'12px', color:'var(--mid)' }}>دج</span>
          {product.priceOriginal && parseFloat(String(product.priceOriginal))>price && (
            <span style={{ fontSize:'12px', color:'var(--dim)', textDecoration:'line-through' }}>{parseFloat(String(product.priceOriginal)).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── HOME ───────────────────────────────────────────────────── */
export function Home({ store }: any) {
  const isRTL = store.language === 'ar';
  const products: any[] = store.products || [];
  const t = {
    badge:       isRTL?'مجموعة جديدة':'New Collection',
    shopNow:     isRTL?'تسوق الآن':'Shop Now',
    browse:      isRTL?'الفئات':'Browse',
    gearTitle:   isRTL?'المنتجات':'Our Gear',
    viewDetails: isRTL?'عرض التفاصيل':'View Details',
    noItems:     isRTL?'لا توجد منتجات':'No products yet',
    allGear:     isRTL?'الكل':'All',
    whyTitle:    isRTL?'لماذا نحن':'Why Choose Us',
  };

  const features = [
    { icon:'🏔️', title:isRTL?'جودة عالية':'Quality Gear',  desc:isRTL?'كل قطعة مختبرة.':'Field-tested quality.' },
    { icon:'📦', title:isRTL?'توصيل سريع':'Fast Delivery',  desc:isRTL?'48 ساعة لبابك.':'48h to your door.'    },
    { icon:'🔄', title:isRTL?'إرجاع مجاني':'Free Returns',  desc:isRTL?'30 يوم إرجاع.':'30-day free returns.'  },
    { icon:'✅', title:isRTL?'100% أصيل':'100% Authentic',  desc:isRTL?'منتجات أصلية فقط.':'Original products.'  },
  ];

  return (
    <div dir={isRTL?'rtl':'ltr'}>

      {/* HERO */}
      <section style={{ position:'relative', height:'92vh', minHeight:'540px', overflow:'hidden', backgroundColor:'var(--green)' }}>
        {store.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.6, display:'block' }}/>
        )}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(28,28,26,0.72) 0%, rgba(28,28,26,0.18) 65%, transparent 100%)' }}/>

        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 8vw', maxWidth:'680px' }}>
          <p className="fi lbl" style={{ color:'rgba(250,250,248,0.65)', marginBottom:'14px' }}>{t.badge}</p>
          <h1 className="fi fi-1" style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'clamp(3rem,7vw,6rem)', color:'var(--white)', lineHeight:1.02, marginBottom:'18px', letterSpacing:'-0.01em' }}>
            {store.hero?.title || (isRTL?<>اكتشف<br/>الطبيعة</>:<>Explore<br/>the Wild</>)}
          </h1>
          <p className="fi fi-2" style={{ fontSize:'16px', lineHeight:1.7, color:'rgba(250,250,248,0.65)', marginBottom:'30px', maxWidth:'360px', fontWeight:300 }}>
            {store.hero?.subtitle || (isRTL?'معدات المغامرة الأصيلة للجزائر.':'Authentic outdoor gear for Algeria.')}
          </p>
          <div className="fi fi-3" style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            <a href="#gear" className="btn btn-dark" style={{ padding:'13px 28px' }}>
              {t.shopNow} <ArrowRight style={{ width:'14px', height:'14px' }}/>
            </a>
            {store.categories?.length>0 && (
              <a href="#cats" className="btn btn-ghost" style={{ padding:'13px 28px', border:'1px solid rgba(250,250,248,0.3)', color:'var(--white)' }}>
                {t.browse}
              </a>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="stats-strip" style={{ position:'absolute', bottom:0, left:0, right:0, borderTop:'1px solid rgba(250,250,248,0.1)' }}>
          {[
            { n:`${products.length||'∞'}`, l:isRTL?'منتج':'Products' },
            { n:'48H',                     l:isRTL?'توصيل':'Delivery' },
            { n:'100%',                    l:isRTL?'أصيل':'Authentic' },
          ].map((s,i)=>(
            <div key={i} style={{ padding:'16px 24px', backgroundColor:'rgba(28,28,26,0.5)', backdropFilter:'blur(8px)', borderRight:i<2?'1px solid rgba(250,250,248,0.1)':'none' }}>
              <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.5rem', color:'var(--white)', lineHeight:1, margin:0 }}>{s.n}</p>
              <p style={{ fontSize:'11px', color:'rgba(250,250,248,0.45)', margin:'4px 0 0', fontWeight:300 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {store.categories?.length>0 && (
        <section id="cats" style={{ padding:'40px 0', borderBottom:'1px solid var(--line)' }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>
            <p className="lbl" style={{ marginBottom:'16px' }}>{t.browse}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              <Link href={`/${store.domain}`}
                style={{ padding:'9px 20px', fontSize:'13px', fontWeight:500, backgroundColor:'var(--ink)', color:'var(--white)', textDecoration:'none', borderRadius:'2px' }}>
                {t.allGear}
              </Link>
              {store.categories.map((cat:any)=>(
                <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                  style={{ padding:'9px 20px', fontSize:'13px', fontWeight:400, border:'1px solid var(--line)', color:'var(--mid)', textDecoration:'none', borderRadius:'2px', transition:'all 0.18s' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--ink)'; el.style.color='var(--ink)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--line)'; el.style.color='var(--mid)';}}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCT GRID */}
      <section id="gear" style={{ padding:'72px 0' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'36px' }}>
            <div>
              <p className="lbl" style={{ marginBottom:'8px' }}>{isRTL?'استعرض الكل':'Browse all'}</p>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'clamp(1.8rem,3vw,2.8rem)', color:'var(--ink)', margin:0 }}>{t.gearTitle}</h2>
            </div>
            <p style={{ fontSize:'13px', color:'var(--dim)', fontWeight:300 }}>{products.length} {isRTL?'منتج':'items'}</p>
          </div>

          {products.length===0 ? (
            <div style={{ padding:'96px 0', textAlign:'center' }}>
              <Mountain style={{ width:'48px', height:'48px', color:'var(--dim)', margin:'0 auto 16px' }}/>
              <p style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'1.4rem', color:'var(--dim)' }}>{t.noItems}</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'32px 20px' }}>
              {products.map((p:any)=>{
                const img = p.productImage||p.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} isRTL={isRTL} store={store} viewDetails={t.viewDetails}/>;
              })}
            </div>
          )}
        </div>
      </section>

      {/* WHY US */}
      <section style={{ padding:'72px 0', backgroundColor:'var(--stone)' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <p className="lbl" style={{ marginBottom:'10px' }}>{isRTL?'مميزاتنا':'Our Promise'}</p>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'clamp(1.8rem,3vw,2.8rem)', color:'var(--ink)', margin:0 }}>
              {t.whyTitle}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'28px' }}>
            {features.map((f,i)=>(
              <div key={i} style={{ textAlign:'center', padding:'28px 16px' }}>
                <div style={{ fontSize:'2.4rem', marginBottom:'14px' }}>{f.icon}</div>
                <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.05rem', color:'var(--ink)', marginBottom:'8px' }}>{f.title}</h3>
                <p style={{ fontSize:'13px', color:'var(--mid)', lineHeight:1.7, fontWeight:300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor:'var(--green)', padding:'80px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        {store.hero?.imageUrl && <img src={store.hero.imageUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.1, display:'block' }}/>}
        <div style={{ position:'relative', zIndex:2 }}>
          <p className="lbl" style={{ color:'rgba(250,250,248,0.45)', marginBottom:'12px' }}>{isRTL?'جاهز؟':'Ready to gear up?'}</p>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'clamp(2rem,5vw,4rem)', color:'var(--white)', lineHeight:1.05, marginBottom:'24px' }}>
            {isRTL?'الطبيعة تنتظرك':'The Wild Awaits'}
          </h2>
          <a href="#gear" className="btn" style={{ backgroundColor:'var(--white)', color:'var(--green)', padding:'14px 32px', display:'inline-flex' }}>
            {isRTL?'تسوق الآن':'Shop the Collection'} <ArrowRight style={{ width:'14px', height:'14px' }}/>
          </a>
        </div>
      </section>
    </div>
  );
}

/* ── DETAILS ────────────────────────────────────────────────── */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [sel, setSel] = useState(0);
  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ backgroundColor:'var(--white)' }}>
      <div style={{ padding:'11px 24px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'var(--dim)' }}>
        <span>{isRTL?'الرئيسية':'Home'}</span><span>/</span>
        <span style={{ color:'var(--ink)' }}>{product.name.slice(0,36)}</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
          <button onClick={toggleWishlist} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${isWishlisted?'var(--amber)':'var(--line)'}`, background:isWishlisted?'rgba(194,107,42,0.1)':'transparent', cursor:'pointer', color:isWishlisted?'var(--amber)':'var(--mid)', borderRadius:'2px' }}>
            <Heart style={{ width:'13px', height:'13px', fill:isWishlisted?'currentColor':'none' }}/>
          </button>
          <button onClick={handleShare} style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--mid)', borderRadius:'2px' }}>
            <Share2 style={{ width:'13px', height:'13px' }}/>
          </button>
        </div>
      </div>

      <div className="details-grid" style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>
        {/* Gallery */}
        <div className="details-left">
          <div style={{ position:'relative', aspectRatio:'4/5', overflow:'hidden', backgroundColor:'var(--stone)', borderRadius:'2px', marginBottom:'10px' }}>
            {allImages.length>0
              ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Mountain style={{ width:'56px', height:'56px', color:'var(--dim)' }}/></div>
            }
            {discount>0 && <div style={{ position:'absolute', top:'10px', left:'10px', backgroundColor:'var(--amber)', color:'white', fontSize:'11px', fontWeight:500, padding:'3px 8px', borderRadius:'2px' }}>-{discount}%</div>}
            {allImages.length>1 && (
              <>
                <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', width:'32px', height:'32px', border:'none', borderRadius:'50%', backgroundColor:'rgba(250,250,248,0.92)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronLeft style={{ width:'14px', height:'14px' }}/>
                </button>
                <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'32px', height:'32px', border:'none', borderRadius:'50%', backgroundColor:'rgba(250,250,248,0.92)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ChevronRight style={{ width:'14px', height:'14px' }}/>
                </button>
              </>
            )}
            {!inStock&&!autoGen && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(250,250,248,0.85)', backdropFilter:'blur(4px)' }}>
                <span style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'2rem', color:'var(--mid)' }}>Sold Out</span>
              </div>
            )}
          </div>
          {allImages.length>1 && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {allImages.slice(0,5).map((img:string,idx:number)=>(
                <button key={idx} onClick={()=>setSel(idx)} style={{ width:'54px', height:'54px', overflow:'hidden', border:`2px solid ${sel===idx?'var(--ink)':'var(--line)'}`, cursor:'pointer', padding:0, background:'none', borderRadius:'2px', opacity:sel===idx?1:0.55 }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="details-right">
          <p className="lbl" style={{ marginBottom:'10px' }}>{isRTL?'معدات خارجية':'Outdoor Gear'}</p>
          <h1 style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'clamp(1.8rem,3.5vw,3rem)', color:'var(--ink)', lineHeight:0.95, marginBottom:'14px' }}>
            {product.name}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line)' }}>
            {[...Array(5)].map((_,i)=><Star key={i} style={{ width:'12px', height:'12px', fill:i<4?'var(--amber)':'none', color:'var(--amber)' }}/>)}
            <span style={{ fontSize:'12px', color:'var(--mid)' }}>4.8 (128)</span>
            <span style={{ marginLeft:'auto', padding:'4px 10px', backgroundColor:inStock||autoGen?'rgba(44,74,46,0.1)':'rgba(194,107,42,0.1)', color:inStock||autoGen?'var(--green)':'var(--amber)', fontSize:'11px', fontWeight:500, borderRadius:'2px' }}>
              {autoGen?'∞ In Stock':inStock?'In Stock':'Sold Out'}
            </span>
          </div>

          <div style={{ marginBottom:'22px' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'10px' }}>
              <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:'2.8rem', color:'var(--ink)', lineHeight:1, letterSpacing:'-0.02em' }}>{finalPrice.toLocaleString()}</span>
              <span style={{ fontSize:'14px', color:'var(--mid)' }}>دج</span>
              {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                <span style={{ fontSize:'13px', textDecoration:'line-through', color:'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
              )}
            </div>
          </div>

          {product.offers?.length>0 && (
            <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--line)' }}>
              <p className="lbl" style={{ marginBottom:'10px' }}>{isRTL?'اختر الباقة':'Bundle'}</p>
              {product.offers.map((offer:any)=>(
                <label key={offer.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', border:`1px solid ${selectedOffer===offer.id?'var(--ink)':'var(--line)'}`, cursor:'pointer', borderRadius:'2px', marginBottom:'6px', transition:'all 0.18s', backgroundColor:selectedOffer===offer.id?'var(--stone)':'transparent' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'16px', height:'16px', borderRadius:'50%', border:`2px solid ${selectedOffer===offer.id?'var(--ink)':'var(--line)'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {selectedOffer===offer.id&&<div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--ink)' }}/>}
                    </div>
                    <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} style={{ display:'none' }}/>
                    <div>
                      <p style={{ fontSize:'13px', fontWeight:500, color:'var(--ink)', margin:0 }}>{offer.name}</p>
                      <p style={{ fontSize:'11px', color:'var(--mid)', margin:0 }}>Qty: {offer.quantity}</p>
                    </div>
                  </div>
                  <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.15rem', color:'var(--ink)' }}>{offer.price.toLocaleString()} <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:'12px', color:'var(--mid)' }}>دج</span></span>
                </label>
              ))}
            </div>
          )}

          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--line)' }}>
              <p className="lbl" style={{ marginBottom:'10px' }}>{attr.name}</p>
              {attr.displayMode==='color' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{ width:'28px', height:'28px', backgroundColor:v.value, border:'3px solid transparent', cursor:'pointer', borderRadius:'50%', outline:s?'2px solid var(--ink)':'none', outlineOffset:'2px' }}/>;})}
                </div>
              ):attr.displayMode==='image' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', border:`2px solid ${s?'var(--ink)':'var(--line)'}`, cursor:'pointer', padding:0, borderRadius:'2px' }}><img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>;})}
                </div>
              ):(
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{ padding:'8px 16px', border:`1px solid ${s?'var(--ink)':'var(--line)'}`, backgroundColor:s?'var(--ink)':'transparent', color:s?'var(--white)':'var(--mid)', fontSize:'13px', cursor:'pointer', borderRadius:'2px', transition:'all 0.18s' }}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--line)' }}>
              <p className="lbl" style={{ marginBottom:'12px' }}>{isRTL?'التفاصيل':'Description'}</p>
              <div style={{ fontSize:'14px', lineHeight:'1.8', color:'var(--mid)', fontWeight:300 }}
                dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc,{ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','span'],ALLOWED_ATTR:['class','style']})}}/>
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
    {label && <p className="lbl" style={{ marginBottom:'6px' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize:'11px', color:'var(--amber)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}><AlertCircle style={{ width:'10px', height:'10px' }}/>{error}</p>}
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

  return (
    <div style={{ marginTop:'22px', paddingTop:'20px', borderTop:'1px solid var(--line)' }}>
      <form onSubmit={handleSubmit}>
        <div className="form-2col">
          <FR error={errors.customerName} label="الاسم">
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', right:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="الاسم الكامل" className={`inp${errors.customerName?' inp-err':''}`} style={{ paddingRight:'34px' }} onFocus={e=>{e.target.style.borderColor='var(--ink)';}} onBlur={e=>{e.target.style.borderColor=errors.customerName?'var(--amber)':'var(--line)';}}/>
            </div>
          </FR>
          <FR error={errors.customerPhone} label="الهاتف">
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', right:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" className={`inp${errors.customerPhone?' inp-err':''}`} style={{ paddingRight:'34px' }} onFocus={e=>{e.target.style.borderColor='var(--ink)';}} onBlur={e=>{e.target.style.borderColor=errors.customerPhone?'var(--amber)':'var(--line)';}}/>
            </div>
          </FR>
        </div>
        <div className="form-2col" style={{ marginTop:'10px' }}>
          <FR error={errors.customerWelaya} label="الولاية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} className={`inp${errors.customerWelaya?' inp-err':''}`} style={{ paddingLeft:'30px' }} onFocus={e=>{e.target.style.borderColor='var(--ink)';}} onBlur={e=>{e.target.style.borderColor=errors.customerWelaya?'var(--amber)':'var(--line)';}}>
                <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FR>
          <FR error={errors.customerCommune} label="البلدية">
            <div style={{ position:'relative' }}>
              <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
              <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})} className={`inp${errors.customerCommune?' inp-err':''}`} style={{ paddingLeft:'30px', opacity:!fd.customerWelaya?0.4:1 }} onFocus={e=>{e.target.style.borderColor='var(--ink)';}} onBlur={e=>{e.target.style.borderColor=errors.customerCommune?'var(--amber)':'var(--line)';}}>
                <option value="">{loadingC?'...':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FR>
        </div>

        <FR label="طريقة التوصيل">
          <div className="delivery-2col" style={{ marginTop:'2px' }}>
            {(['home','office'] as const).map(type=>(
              <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))}
                style={{ padding:'12px', border:`1px solid ${fd.typeLivraison===type?'var(--ink)':'var(--line)'}`, backgroundColor:fd.typeLivraison===type?'var(--stone)':'transparent', cursor:'pointer', textAlign:'left', borderRadius:'2px', transition:'all 0.18s' }}>
                <p style={{ fontSize:'12px', fontWeight:500, color:fd.typeLivraison===type?'var(--ink)':'var(--mid)', margin:'0 0 4px' }}>
                  {type==='home'?'توصيل للبيت':'توصيل للمكتب'}
                </p>
                {selW && <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.1rem', color:fd.typeLivraison===type?'var(--amber)':'var(--dim)', margin:0 }}>
                  {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:'11px' }}>دج</span>
                </p>}
              </button>
            ))}
          </div>
        </FR>

        <FR label="الكمية">
          <div style={{ display:'inline-flex', alignItems:'center', border:'1px solid var(--line)', borderRadius:'2px' }}>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--ink)', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--stone)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Minus style={{ width:'12px', height:'12px' }}/>
            </button>
            <span style={{ width:'44px', textAlign:'center', fontFamily:"'DM Serif Display',serif", fontSize:'1.2rem', color:'var(--ink)' }}>{fd.quantity}</span>
            <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))}
              style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--line)', background:'transparent', cursor:'pointer', color:'var(--ink)', transition:'background 0.18s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--stone)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
              <Plus style={{ width:'12px', height:'12px' }}/>
            </button>
          </div>
        </FR>

        <div style={{ border:'1px solid var(--line)', borderRadius:'2px', marginBottom:'14px', overflow:'hidden' }}>
          <div style={{ padding:'9px 14px', backgroundColor:'var(--stone)', borderBottom:'1px solid var(--line)' }}>
            <p className="lbl">ملخص الطلب</p>
          </div>
          {[{l:'المنتج',v:product.name.slice(0,22)},{l:'السعر',v:`${fp.toLocaleString()} دج`},{l:'الكمية',v:`× ${fd.quantity}`},{l:'التوصيل',v:selW?`${getLiv().toLocaleString()} دج`:'—'}].map(row=>(
            <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 14px', borderBottom:'1px solid var(--line)' }}>
              <span style={{ fontSize:'12px', color:'var(--mid)' }}>{row.l}</span>
              <span style={{ fontSize:'13px', fontWeight:500, color:'var(--ink)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'11px 14px', backgroundColor:'var(--stone)' }}>
            <span style={{ fontSize:'12px', color:'var(--mid)' }}>المجموع</span>
            <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.6rem', color:'var(--ink)' }}>
              {total().toLocaleString()} <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:'12px', color:'var(--mid)' }}>دج</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={sub} className="btn btn-dark"
          style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'14px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1 }}>
          {sub?'جاري المعالجة...':'تأكيد الطلب'}{!sub && <ArrowRight style={{ width:'14px', height:'14px' }}/>}
        </button>
        <p style={{ fontSize:'11px', color:'var(--dim)', textAlign:'center', marginTop:'8px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          <Shield style={{ width:'10px', height:'10px' }}/> دفع آمن ومشفر
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

const Shell = ({ children, title }: { children:React.ReactNode; title:string }) => (
  <div style={{ backgroundColor:'var(--white)', minHeight:'100vh' }}>
    <div style={{ backgroundColor:'var(--green)', padding:'72px 24px 48px' }}>
      <div style={{ maxWidth:'720px', margin:'0 auto' }}>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'clamp(2.5rem,6vw,5rem)', color:'var(--white)', lineHeight:0.95, margin:0 }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'48px 24px 80px' }}>{children}</div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{ paddingBottom:'18px', marginBottom:'18px', borderBottom:'1px solid var(--line)' }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'7px' }}>
      <h3 style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'1.05rem', color:'var(--ink)', margin:0 }}>{title}</h3>
      {tag && <span className="lbl" style={{ padding:'3px 8px', border:'1px solid var(--line)', borderRadius:'2px' }}>{tag}</span>}
    </div>
    <p style={{ fontSize:'13px', lineHeight:'1.8', color:'var(--mid)', fontWeight:300, margin:0 }}>{body}</p>
  </div>
);

export function Privacy() {
  return (
    <Shell title="Privacy Policy">
      <IB title="Data We Collect" body="Only name, phone, and delivery address. Nothing more."/>
      <IB title="How We Use It"   body="Exclusively to process and ship your order."/>
      <IB title="Security"        body="Industry-standard encryption protects all your data."/>
      <IB title="Sharing"         body="We never sell your data. Shared only with delivery partners."/>
      <p style={{ fontSize:'11px', color:'var(--dim)', marginTop:'20px' }}>Last updated: February 2026</p>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="Terms of Service">
      <IB title="Your Account"   body="You are responsible for keeping your credentials secure."/>
      <IB title="Payments"       body="No hidden fees. The displayed price is exactly what you pay."/>
      <IB title="Prohibited Use" body="Authentic products only. No counterfeit goods." tag="Strict"/>
      <IB title="Governing Law"  body="Governed by Algerian law. Disputes via official channels."/>
      <p style={{ fontSize:'12px', color:'var(--dim)', marginTop:'20px', padding:'12px 14px', border:'1px solid var(--line)', borderRadius:'2px' }}>
        These terms may update. Continued use means acceptance.
      </p>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="Cookie Policy">
      <IB title="Essential"   body="Required for login, cart, and checkout. Always active." tag="Required"/>
      <IB title="Preferences" body="Saves your language and region settings." tag="Optional"/>
      <IB title="Analytics"   body="Anonymous usage data to improve your experience." tag="Optional"/>
      <div style={{ marginTop:'20px', padding:'14px 16px', border:'1px solid var(--line)', borderRadius:'2px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
        <ToggleRight style={{ width:'18px', height:'18px', color:'var(--green)', flexShrink:0, marginTop:'1px' }}/>
        <p style={{ fontSize:'13px', color:'var(--mid)', lineHeight:'1.8', fontWeight:300, margin:0 }}>
          Manage cookies through your browser settings. Disabling essential cookies may affect functionality.
        </p>
      </div>
    </Shell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [sent, setSent] = useState(false);
  return (
    <div style={{ backgroundColor:'var(--white)', minHeight:'100vh' }}>
      <div style={{ backgroundColor:'var(--green)', padding:'72px 24px 48px' }}>
        <div style={{ maxWidth:'720px', margin:'0 auto' }}>
          <h1 style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'clamp(2.5rem,6vw,5rem)', color:'var(--white)', lineHeight:0.95, margin:0 }}>Get in Touch.</h1>
          <p style={{ fontSize:'14px', color:'rgba(250,250,248,0.55)', marginTop:'12px', fontWeight:300 }}>We reply within 24 hours.</p>
        </div>
      </div>

      <div className="contact-grid" style={{ maxWidth:'900px', margin:'0 auto', padding:'56px 24px 80px' }}>
        <div>
          <p className="lbl" style={{ marginBottom:'20px' }}>Contact info</p>
          {[{icon:'📧',label:'Email',val:'hello@outdoors.dz',href:'mailto:hello@outdoors.dz'},{icon:'📞',label:'Phone',val:'+213 550 123 456',href:'tel:+213550123456'},{icon:'📍',label:'Location',val:'Algiers, Algeria',href:undefined}].map(item=>(
            <a key={item.label} href={item.href||'#'} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 0', borderBottom:'1px solid var(--line)', textDecoration:'none' }}>
              <span style={{ fontSize:'1.2rem' }}>{item.icon}</span>
              <div>
                <p className="lbl" style={{ marginBottom:'2px' }}>{item.label}</p>
                <p style={{ fontSize:'13px', color:'var(--ink)', margin:0 }}>{item.val}</p>
              </div>
              {item.href && <ArrowRight style={{ width:'13px', height:'13px', color:'var(--dim)', marginLeft:'auto' }}/>}
            </a>
          ))}
        </div>

        <div>
          <p className="lbl" style={{ marginBottom:'20px' }}>Send a message</p>
          {sent ? (
            <div style={{ minHeight:'220px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid var(--line)', borderRadius:'2px', textAlign:'center', backgroundColor:'var(--stone)' }}>
              <CheckCircle2 style={{ width:'30px', height:'30px', color:'var(--green)', marginBottom:'12px' }}/>
              <p style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:'1.3rem', color:'var(--ink)', margin:0 }}>Message sent!</p>
              <p style={{ fontSize:'13px', color:'var(--mid)', marginTop:'4px', fontWeight:300 }}>We will be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[{label:'Your name',type:'text',key:'name',ph:'Full name'},{label:'Email',type:'email',key:'email',ph:'your@email.com'}].map(f=>(
                <div key={f.key}>
                  <p className="lbl" style={{ marginBottom:'6px' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} required className="inp"
                    onFocus={e=>{e.target.style.borderColor='var(--ink)';}} onBlur={e=>{e.target.style.borderColor='var(--line)';}}/>
                </div>
              ))}
              <div>
                <p className="lbl" style={{ marginBottom:'6px' }}>Message</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="How can we help?" rows={4} required className="inp"
                  style={{ resize:'none' as any }}
                  onFocus={e=>{e.target.style.borderColor='var(--ink)';}} onBlur={e=>{e.target.style.borderColor='var(--line)';}}/>
              </div>
              <button type="submit" className="btn btn-dark" style={{ justifyContent:'center', width:'100%', padding:'13px' }}>
                Send Message <ArrowRight style={{ width:'13px', height:'13px' }}/>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}