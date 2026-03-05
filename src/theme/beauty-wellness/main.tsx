'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Heart, Star, ChevronDown, ChevronLeft, ChevronRight,
  MapPin, Phone, User, Truck, Shield, Package,
  Building2, AlertCircle, Check, X, Infinity,
  Share2, ShieldCheck, Lock, Database,
  Globe, Bell, CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Sparkles, Flower2, Leaf, Droplets, Mail, Instagram,
  ArrowRight, Quote,
} from 'lucide-react';
import { Store } from '@/types/store';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
  :root {
    --blush:        #F2C4CE;
    --blush-deep:   #E8A0AD;
    --blush-pale:   #FAF0F2;
    --rose:         #C17E8A;
    --rose-dark:    #9A5F6A;
    --cream:        #FAF6F0;
    --ivory:        #FFFDF8;
    --champagne:    #C9A96E;
    --champagne-lt: #E8D5B0;
    --sage:         #B5C4B1;
    --sage-dark:    #8FA88A;
    --sage-pale:    #EFF4EE;
    --text-dark:    #2C1F20;
    --text-mid:     #7A5C60;
    --text-soft:    #B39498;
    --text-ghost:   #D4B8BC;
    --border:       #EDD8DC;
    --border-soft:  #F5E8EB;
    --shadow-rose:  rgba(193,126,138,0.15);
    --shadow-soft:  rgba(44,31,32,0.06);
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--cream); }
  ::-webkit-scrollbar-thumb { background: var(--blush-deep); border-radius: 99px; }

  @keyframes petal-fall {
    0%   { opacity:0; transform:translateY(-20px) rotate(0deg) scale(0.8); }
    20%  { opacity:0.6; }
    80%  { opacity:0.4; }
    100% { opacity:0; transform:translateY(110vh) rotate(480deg) scale(1.1) translateX(40px); }
  }
  @keyframes float-gentle {
    0%,100% { transform:translateY(0) rotate(0deg); }
    33%     { transform:translateY(-10px) rotate(2deg); }
    66%     { transform:translateY(-5px) rotate(-1deg); }
  }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse-soft {
    0%,100% { box-shadow:0 0 0 0 rgba(193,126,138,0.3); }
    50%     { box-shadow:0 0 0 10px rgba(193,126,138,0); }
  }
  @keyframes marquee-scroll {
    0%   { transform:translateX(0); }
    100% { transform:translateX(-50%); }
  }

  .fade-up    { animation: fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-d1 { animation-delay:0.10s; }
  .fade-up-d2 { animation-delay:0.22s; }
  .fade-up-d3 { animation-delay:0.36s; }
  .fade-up-d4 { animation-delay:0.50s; }

  .grain::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.04'/%3E%3C/svg%3E");
    opacity:0.045; mix-blend-mode:multiply;
  }
  .petal-pattern {
    background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='30' cy='18' rx='5' ry='10' fill='%23F2C4CE' opacity='0.18' transform='rotate(0 30 30)'/%3E%3Cellipse cx='30' cy='18' rx='5' ry='10' fill='%23F2C4CE' opacity='0.18' transform='rotate(72 30 30)'/%3E%3Cellipse cx='30' cy='18' rx='5' ry='10' fill='%23F2C4CE' opacity='0.18' transform='rotate(144 30 30)'/%3E%3Cellipse cx='30' cy='18' rx='5' ry='10' fill='%23F2C4CE' opacity='0.18' transform='rotate(216 30 30)'/%3E%3Cellipse cx='30' cy='18' rx='5' ry='10' fill='%23F2C4CE' opacity='0.18' transform='rotate(288 30 30)'/%3E%3C/svg%3E");
    background-size:60px 60px;
  }
  .card-lift { transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease; }
  .card-lift:hover { transform:translateY(-8px); box-shadow:0 24px 60px var(--shadow-rose); }
  .btn-petal { position:relative; overflow:hidden; transition:all 0.35s ease; }
  .btn-petal::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.25) 0%,transparent 100%); opacity:0; transition:opacity 0.3s; }
  .btn-petal:hover::before { opacity:1; }
  .divider-rose { display:flex; align-items:center; gap:1rem; }
  .divider-rose::before, .divider-rose::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,transparent,var(--border),transparent); }
  .link-hover { position:relative; transition:color 0.25s; }
  .link-hover::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:1px; background:var(--rose); transition:width 0.3s ease; }
  .link-hover:hover::after { width:100%; }
  .marquee-outer { overflow:hidden; white-space:nowrap; }
  .marquee-inner { display:inline-block; animation:marquee-scroll 28s linear infinite; }
`;

// ─────────────────────────────────────────────────────────────
// FLOATING PETALS
// ─────────────────────────────────────────────────────────────
function FloatingPetals() {
  const petals = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left:     `${5 + (i * 7) % 90}%`,
    delay:    `${(i * 1.3) % 12}s`,
    duration: `${10 + (i * 1.7) % 14}s`,
    size:     `${10 + (i * 2.3) % 16}px`,
    rotate:   `${(i * 37) % 360}deg`,
    color:    ['#F2C4CE','#E8D5B0','#B5C4B1','#F7D6DB','#DDD0F5'][i % 5],
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
      {petals.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:p.left, top:'-30px',
          width:p.size, height:p.size,
          borderRadius:'50% 0 50% 0',
          backgroundColor:p.color,
          animation:`petal-fall ${p.duration} ${p.delay} ease-in infinite`,
          transform:`rotate(${p.rotate})`,
          opacity:0,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Offer     { id:string; name:string; quantity:number; price:number; }
interface Variant   { id:string; name:string; value:string; }
interface Attribute { id:string; type:string; name:string; displayMode?:'color'|'image'|'text'|null; variants:Variant[]; }
interface ProductImage        { id:string; imageUrl:string; }
interface VariantAttributeEntry { attrId:string; attrName:string; displayMode:'color'|'image'|'text'; value:string; }
interface VariantDetail       { id:string|number; name:VariantAttributeEntry[]; price:number; stock:number; autoGenerate:boolean; }
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

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function variantMatches(detail:VariantDetail, sel:Record<string,string>):boolean {
  return Object.entries(sel).every(([n,v]) => detail.name.some(e=>e.attrName===n&&e.value===v));
}
const fetchWilayas  = async (uid:string):Promise<Wilaya[]>   => { try { const {data}=await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }};
const fetchCommunes = async (wid:string):Promise<Commune[]>  => { try { const {data}=await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }};

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────
export default function Main({ store, children }:any) {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--ivory)', fontFamily:"'DM Sans',sans-serif", color:'var(--text-dark)' }}>
      <style>{FONT_CSS}</style>
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="marquee-outer py-2.5"
          style={{ backgroundColor:'var(--blush)', color:'var(--rose-dark)', fontSize:'0.72rem', letterSpacing:'0.18em', textAlign:'center' }}>
          <div className="marquee-inner">
            {Array(8).fill(null).map((_,i) => <span key={i} className="mx-10"><Sparkles className="inline w-3 h-3 mr-2 opacity-60"/>{store.topBar.text}</span>)}
            {Array(8).fill(null).map((_,i) => <span key={`b${i}`} className="mx-10"><Sparkles className="inline w-3 h-3 mr-2 opacity-60"/>{store.topBar.text}</span>)}
          </div>
        </div>
      )}
      <Navbar store={store} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────
export function Navbar({ store }:{ store:Store }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRTL = store.language === 'ar';
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  const nav = [
    { href:`/${store.subdomain}`,         label: isRTL ? 'الرئيسية' : 'Home'    },
    { href:`/${store.subdomain}/contact`, label: isRTL ? 'اتصل بنا' : 'Contact' },
    { href:`/${store.subdomain}/Privacy`, label: isRTL ? 'الخصوصية' : 'Privacy' },
  ];
  const initials = store.name.split(' ').filter(Boolean).map((w:string)=>w[0]).join('').slice(0,2).toUpperCase();
  return (
    <nav className="sticky top-0 z-50 transition-all duration-500" dir={isRTL?'rtl':'ltr'}
      style={{ backgroundColor:scrolled?'rgba(255,253,248,0.93)':'var(--ivory)', backdropFilter:scrolled?'blur(20px)':'none', borderBottom:`1px solid ${scrolled?'var(--border-soft)':'transparent'}`, boxShadow:scrolled?'0 2px 32px var(--shadow-soft)':'none' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between py-4">
          <Link href={`/${store.subdomain}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105"
              style={{ background:'linear-gradient(135deg,var(--blush),var(--blush-deep))', boxShadow:'0 4px 16px var(--shadow-rose)' }}>
              {store.design.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} className="w-full h-full object-cover"/>
                : <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:'1.1rem', color:'var(--rose-dark)' }}>{initials}</span>
              }
            </div>
            <div>
              <span className="block transition-colors group-hover:text-rose-500" style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:'1.35rem', color:'var(--text-dark)', letterSpacing:'0.04em' }}>{store.name}</span>
              <span className="block text-[9px] tracking-[0.25em] uppercase" style={{ color:'var(--text-soft)', marginTop:'-1px' }}>{isRTL?'جمال وعناية':'Beauty & Wellness'}</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            {nav.map(item => (
              <Link key={item.href} href={item.href} className="link-hover text-sm font-light tracking-wide" style={{ color:'var(--text-mid)' }}>{item.label}</Link>
            ))}
            <Link href={`/${store.subdomain}`} className="btn-petal px-6 py-2.5 rounded-full text-xs font-medium tracking-widest uppercase"
              style={{ background:'linear-gradient(135deg,var(--blush),var(--blush-deep))', color:'var(--rose-dark)', boxShadow:'0 4px 20px var(--shadow-rose)', letterSpacing:'0.12em' }}>
              {isRTL?'تسوقي الآن':'Shop Now'}
            </Link>
          </div>
          <button onClick={() => setMenuOpen(p=>!p)} className="md:hidden p-2" aria-label="Menu">
            <div className="space-y-1.5">
              <span className="block transition-all duration-300" style={{ width:menuOpen?'20px':'24px', height:'1.5px', backgroundColor:'var(--rose)', transform:menuOpen?'rotate(45deg) translate(5px,5px)':'none' }}/>
              <span className="block transition-all duration-300" style={{ width:'20px', height:'1.5px', backgroundColor:'var(--rose)', opacity:menuOpen?0:1 }}/>
              <span className="block transition-all duration-300" style={{ width:menuOpen?'20px':'16px', height:'1.5px', backgroundColor:'var(--rose)', transform:menuOpen?'rotate(-45deg) translate(5px,-5px)':'none' }}/>
            </div>
          </button>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen?'max-h-60 pb-6':'max-h-0'}`}>
          <div className="pt-4 space-y-5" style={{ borderTop:'1px solid var(--border-soft)' }}>
            {nav.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-sm font-light" style={{ color:'var(--text-mid)' }}>
                <Flower2 className="w-3 h-3" style={{ color:'var(--blush-deep)' }}/>{item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="h-px w-full" style={{ background:'linear-gradient(90deg,transparent,var(--blush) 30%,var(--champagne-lt) 50%,var(--blush) 70%,transparent)' }}/>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
export function Footer({ store }:any) {
  const isRTL = store.language === 'ar';
  return (
    <footer className="relative grain" style={{ backgroundColor:'var(--blush-pale)', borderTop:'1px solid var(--border-soft)', fontFamily:"'DM Sans',sans-serif", overflow:'hidden' }}>
      <div className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none" style={{ background:'radial-gradient(circle,var(--blush),transparent 70%)', transform:'translate(30%,-30%)' }}/>
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-15 pointer-events-none" style={{ background:'radial-gradient(circle,var(--sage),transparent 70%)', transform:'translate(-20%,20%)' }}/>
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12" style={{ borderBottom:'1px solid var(--border)' }}>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:'linear-gradient(135deg,var(--blush),var(--blush-deep))', boxShadow:'0 4px 14px var(--shadow-rose)' }}>
                <Flower2 className="w-5 h-5" style={{ color:'var(--rose-dark)' }}/>
              </div>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:'1.25rem', color:'var(--text-dark)' }}>{store.name}</span>
            </div>
            <p className="text-sm leading-relaxed font-light" style={{ color:'var(--text-mid)', maxWidth:'260px' }}>
              {isRTL?'جمالك الطبيعي يستحق العناية الأفضل. منتجات مختارة بعناية لأجل إشراقتك.':'Your natural beauty deserves the finest care. Curated products for radiant skin & soul.'}
            </p>
            <div className="flex gap-3">
              {[Instagram, Mail].map((Icon,i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ border:'1px solid var(--border)', color:'var(--text-soft)', backgroundColor:'var(--white)' }}
                  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--rose)'; el.style.color='var(--rose)'; }}
                  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.color='var(--text-soft)'; }}>
                  <Icon className="w-3.5 h-3.5"/>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-5 text-xs tracking-[0.2em] uppercase" style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, color:'var(--rose-dark)', fontSize:'0.8rem' }}>
              {isRTL?'روابط':'Navigate'}
            </h4>
            <div className="space-y-3">
              {[
                { href:`/${store.subdomain}/Privacy`, label:isRTL?'سياسة الخصوصية':'Privacy Policy' },
                { href:`/${store.subdomain}/Terms`,   label:isRTL?'شروط الخدمة':'Terms of Service'  },
                { href:`/${store.subdomain}/Cookies`, label:isRTL?'ملفات الارتباط':'Cookie Policy'   },
                { href:`/${store.subdomain}/contact`, label:isRTL?'اتصل بنا':'Contact Us'            },
              ].map(l => (
                <a key={l.href} href={l.href} className="link-hover flex items-center gap-2 text-sm font-light" style={{ color:'var(--text-mid)' }}>
                  <span style={{ color:'var(--blush-deep)', fontSize:'10px' }}>✦</span>{l.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="p-6 rounded-2xl relative overflow-hidden" style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream))', border:'1px solid var(--border)' }}>
              <Quote className="w-8 h-8 mb-3 opacity-25" style={{ color:'var(--rose)' }}/>
              <p className="text-base leading-relaxed italic" style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:400, color:'var(--text-dark)', fontSize:'1.05rem' }}>
                {isRTL?'"التجميل ليس في الوجه، بل في الضوء الذي يشع من القلب."':'"Beauty is not in the face; beauty is a light in the heart."'}
              </p>
              <p className="mt-3 text-xs tracking-wider" style={{ color:'var(--text-soft)' }}>— Kahlil Gibran</p>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-light" style={{ color:'var(--text-ghost)' }}>© {new Date().getFullYear()} {store.name} · {isRTL?'جميع الحقوق محفوظة':'All rights reserved'}</p>
          <div className="flex items-center gap-2 text-xs font-light" style={{ color:'var(--text-ghost)' }}>
            <Sparkles className="w-3 h-3" style={{ color:'var(--blush-deep)' }}/>
            <span>Beauty & Wellness Theme</span>
            <Sparkles className="w-3 h-3" style={{ color:'var(--blush-deep)' }}/>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────
export function Card({ product, displayImage, discount, isRTL, store, viewDetails }:any) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="card-lift group flex flex-col overflow-hidden rounded-2xl bg-white"
      style={{ border:'1px solid var(--border-soft)' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative overflow-hidden" style={{ aspectRatio:'3/4', backgroundColor:'var(--blush-pale)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700" style={{ transform:hovered?'scale(1.06)':'scale(1)' }}/>
          : <div className="w-full h-full flex flex-col items-center justify-center gap-3 petal-pattern"><Flower2 className="w-10 h-10" style={{ color:'var(--blush-deep)' }}/></div>
        }
        <div className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{ background:'linear-gradient(to bottom,transparent 50%,rgba(193,126,138,0.18) 100%)', opacity:hovered?1:0 }}/>
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider" style={{ backgroundColor:'var(--rose)', color:'white' }}>
            -{discount}%
          </div>
        )}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
          style={{ backgroundColor:'rgba(255,255,255,0.85)', backdropFilter:'blur(6px)', color:'var(--text-soft)', opacity:hovered?1:0, transform:hovered?'scale(1)':'scale(0.8)' }}>
          <Heart className="w-3.5 h-3.5"/>
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-400"
          style={{ transform:hovered?'translateY(0)':'translateY(100%)', opacity:hovered?1:0 }}>
          <Link href={`/${store.subdomain}/product/${product.slug||product.id}`}
            className="btn-petal flex items-center justify-center gap-2 w-full py-3 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{ background:'linear-gradient(135deg,var(--rose),var(--rose-dark))', color:'white', letterSpacing:'0.12em' }}>
            <Sparkles className="w-3 h-3"/> {viewDetails}
          </Link>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_,i) => <Star key={i} className={`w-2.5 h-2.5 ${i<4?'fill-current':''}`} style={{ color:'var(--champagne)' }}/>)}
          <span className="ml-1.5 text-[10px] font-light" style={{ color:'var(--text-soft)' }}>4.8</span>
        </div>
        <h3 className="font-light leading-snug mb-1 transition-colors duration-200 group-hover:text-rose-400"
          style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.05rem', color:'var(--text-dark)' }}>
          {product.name}
        </h3>
        {product.desc && (
          <div className="text-xs font-light mb-3 line-clamp-2 leading-relaxed" style={{ color:'var(--text-soft)' }}
            dangerouslySetInnerHTML={{ __html:product.desc }}/>
        )}
        <div className="mt-auto flex items-end justify-between pt-3" style={{ borderTop:'1px solid var(--border-soft)' }}>
          <div>
            <span className="font-medium" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.3rem', color:'var(--rose-dark)' }}>{product.price}</span>
            <span className="ml-1 text-xs font-light" style={{ color:'var(--text-soft)' }}>{store.currency}</span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="ml-2 text-xs line-through font-light" style={{ color:'var(--text-ghost)' }}>{product.priceOriginal}</span>
            )}
          </div>
          <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" style={{ color:'var(--blush-deep)' }}/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────
export function Home({ store }:any) {
  const isRTL = store.language === 'ar';
  const dir   = isRTL ? 'rtl' : 'ltr';
  const t = {
    heroLabel:  isRTL?'عناية فائقة بجمالك':'Radiance. Ritual. Results.',
    heroTitle:  isRTL?'جمال يأتي من الداخل':'Your Skin Deserves\nthe Finest',
    heroSub:    isRTL?'اكتشفي مجموعتنا من أجود منتجات العناية':'Discover our hand-picked collection of premium skincare, makeup & wellness essentials.',
    heroBtn:    isRTL?'تسوقي الآن':'Shop the Collection',
    heroBtnSub: isRTL?'عروضنا الخاصة':'View Offers',
    categories: isRTL?'التصنيفات':'Collections',
    all:        isRTL?'الكل':'All',
    products:   isRTL?'منتجاتنا':'Our Curated Edit',
    noProducts: isRTL?'لا توجد منتجات بعد':'No products yet',
    viewDetails:isRTL?'اكتشفي المنتج':'Discover',
  };
  const rituals = [
    { icon:<Droplets className="w-5 h-5"/>, label:isRTL?'ترطيب':'Hydration', desc:isRTL?'بشرة ناضرة':'Plump & dewy' },
    { icon:<Sparkles className="w-5 h-5"/>, label:isRTL?'إشراقة':'Radiance',  desc:isRTL?'توهج طبيعي':'Natural glow'  },
    { icon:<Leaf className="w-5 h-5"/>,     label:isRTL?'طبيعي':'Natural',    desc:isRTL?'مكونات نقية':'Pure ingredients' },
    { icon:<Heart className="w-5 h-5"/>,    label:isRTL?'رفاهية':'Self-care', desc:isRTL?'دلليها يومياً':'Daily ritual'   },
  ];
  return (
    <div dir={dir} style={{ backgroundColor:'var(--ivory)', fontFamily:"'DM Sans',sans-serif" }}>

      {/* HERO */}
      <section className="relative overflow-hidden grain" style={{ minHeight:'96vh', backgroundColor:'var(--cream)', display:'flex', alignItems:'center' }}>
        <FloatingPetals/>
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 70% 80% at 60% 40%,rgba(242,196,206,0.35) 0%,transparent 65%)' }}/>
        {store.hero?.imageUrl && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex:0 }}>
            <img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity:0.18, filter:'saturate(1.3)' }}/>
          </div>
        )}
        <div className="absolute -right-32 -top-32 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 hidden lg:block" style={{ background:'radial-gradient(circle,var(--blush),transparent 70%)' }}/>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl">
            <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7"
              style={{ backgroundColor:'rgba(242,196,206,0.4)', border:'1px solid var(--blush)', backdropFilter:'blur(8px)' }}>
              <Sparkles className="w-3 h-3" style={{ color:'var(--rose)' }}/>
              <span className="text-[11px] font-medium tracking-[0.22em] uppercase" style={{ color:'var(--rose-dark)' }}>{t.heroLabel}</span>
            </div>
            <h1 className="fade-up fade-up-d1 whitespace-pre-line leading-[1.05] mb-6"
              style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:300, fontSize:'clamp(3rem,7.5vw,6.5rem)', color:'var(--text-dark)', letterSpacing:'-0.01em' }}>
              {store.hero?.title || t.heroTitle}
            </h1>
            <div className="fade-up fade-up-d2 flex items-center gap-4 mb-7">
              <div className="h-px w-16" style={{ background:'linear-gradient(90deg,var(--rose),transparent)' }}/>
              <Flower2 className="w-4 h-4" style={{ color:'var(--blush-deep)', animation:'float-gentle 4s ease-in-out infinite' }}/>
              <div className="h-px flex-1" style={{ background:'linear-gradient(90deg,transparent,var(--blush))' }}/>
            </div>
            <p className="fade-up fade-up-d2 text-base font-light leading-relaxed mb-10" style={{ color:'var(--text-mid)', maxWidth:'440px' }}>
              {store.hero?.subtitle || t.heroSub}
            </p>
            <div className="fade-up fade-up-d3 flex flex-wrap gap-4">
              <a href="#products" className="btn-petal flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-medium tracking-wider"
                style={{ background:'linear-gradient(135deg,var(--rose),var(--rose-dark))', color:'white', boxShadow:'0 8px 30px rgba(193,126,138,0.35)' }}>
                <Sparkles className="w-4 h-4"/> {t.heroBtn}
              </a>
              <a href="#categories" className="btn-petal flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-light tracking-wider"
                style={{ border:'1.5px solid var(--border)', color:'var(--text-mid)', backgroundColor:'rgba(255,255,255,0.7)', backdropFilter:'blur(8px)' }}>
                {t.heroBtnSub} <ArrowRight className="w-3.5 h-3.5"/>
              </a>
            </div>
            <div className="fade-up fade-up-d4 flex flex-wrap gap-6 mt-12 pt-8" style={{ borderTop:'1px solid var(--border-soft)' }}>
              {[
                { icon:<Leaf className="w-3.5 h-3.5"/>,   label:isRTL?'طبيعي 100%':'100% Natural'   },
                { icon:<Shield className="w-3.5 h-3.5"/>, label:isRTL?'ضمان الجودة':'Quality Assured' },
                { icon:<Truck className="w-3.5 h-3.5"/>,  label:isRTL?'توصيل سريع':'Fast Delivery'   },
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-2">
                  <span style={{ color:'var(--champagne)' }}>{b.icon}</span>
                  <span className="text-xs font-light tracking-wider" style={{ color:'var(--text-mid)' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex:1 }}>
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:'80px' }}>
            <path d="M0 80L1440 80L1440 30C1200 70 900 10 600 40C300 70 100 20 0 50Z" fill="var(--ivory)"/>
          </svg>
        </div>
      </section>

      {/* RITUAL PILLARS */}
      <section style={{ backgroundColor:'var(--ivory)', paddingTop:'3rem', paddingBottom:'4rem' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rituals.map((r,i) => (
              <div key={i} className="flex flex-col items-center text-center p-5 rounded-2xl transition-all hover:shadow-md group"
                style={{ backgroundColor:'var(--white)', border:'1px solid var(--border-soft)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all group-hover:scale-110"
                  style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream))', color:'var(--rose)' }}>
                  {r.icon}
                </div>
                <p className="text-sm font-medium mb-1" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1rem', color:'var(--text-dark)' }}>{r.label}</p>
                <p className="text-xs font-light" style={{ color:'var(--text-soft)' }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-10">
            <div className="divider-rose mb-4">
              <span className="text-[10px] tracking-[0.28em] uppercase font-medium" style={{ color:'var(--rose)', whiteSpace:'nowrap' }}>
                <Flower2 className="inline w-3 h-3 mr-1.5 mb-0.5" style={{ color:'var(--blush-deep)' }}/> {isRTL?'تسوقي حسب':'Browse by'}
              </span>
            </div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:300, fontSize:'clamp(1.8rem,4vw,3.2rem)', color:'var(--text-dark)' }}>{t.categories}</h2>
          </div>
          {store.categories?.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/${store.domain}`} className="btn-petal px-6 py-2.5 rounded-full text-xs font-medium tracking-wider"
                style={{ background:'linear-gradient(135deg,var(--blush),var(--blush-deep))', color:'var(--rose-dark)', boxShadow:'0 4px 16px var(--shadow-rose)', letterSpacing:'0.1em' }}>
                ✦ {t.all}
              </Link>
              {store.categories.map((cat:any) => (
                <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                  className="btn-petal px-6 py-2.5 rounded-full text-xs font-light tracking-wider"
                  style={{ border:'1.5px solid var(--border)', color:'var(--text-mid)', backgroundColor:'var(--white)' }}
                  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--blush-deep)'; el.style.color='var(--rose)'; el.style.backgroundColor='var(--blush-pale)'; }}
                  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.color='var(--text-mid)'; el.style.backgroundColor='var(--white)'; }}>
                  {cat.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center rounded-2xl" style={{ border:'1px dashed var(--border)', backgroundColor:'var(--blush-pale)' }}>
              <p className="text-sm font-light" style={{ color:'var(--text-soft)' }}>{isRTL?'لا توجد تصنيفات بعد':'No collections yet'}</p>
            </div>
          )}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <div className="divider-rose mb-4">
              <span className="text-[10px] tracking-[0.28em] uppercase font-medium" style={{ color:'var(--rose)', whiteSpace:'nowrap' }}>{isRTL?'اختيار مميز':'Handpicked for you'}</span>
            </div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:300, fontSize:'clamp(1.8rem,4vw,3.2rem)', color:'var(--text-dark)' }}>{t.products}</h2>
          </div>
          {store.products?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {store.products.map((product:any) => {
                const displayImage = product.productImage||product.imagesProduct?.[0]?.imageUrl||store.design?.logoUrl;
                const discount = product.priceOriginal?Math.round(((product.priceOriginal-product.price)/product.priceOriginal)*100):0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails}/>;
              })}
            </div>
          ) : (
            <div className="py-32 text-center rounded-3xl petal-pattern" style={{ border:'1px dashed var(--border)', backgroundColor:'var(--blush-pale)' }}>
              <Flower2 className="w-12 h-12 mx-auto mb-4" style={{ color:'var(--blush)', animation:'float-gentle 4s ease-in-out infinite' }}/>
              <p className="font-light text-lg" style={{ fontFamily:"'Cormorant Garamond',serif", color:'var(--text-mid)' }}>{t.noProducts}</p>
            </div>
          )}
        </div>
      </section>

      {/* ELEGANCE BANNER */}
      <section className="py-24 relative overflow-hidden grain" style={{ background:'linear-gradient(135deg,var(--blush-pale) 0%,var(--cream) 50%,var(--sage-pale) 100%)' }}>
        <div className="absolute inset-0 petal-pattern opacity-40 pointer-events-none"/>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <Flower2 className="w-8 h-8 mx-auto mb-6" style={{ color:'var(--blush-deep)', animation:'float-gentle 5s ease-in-out infinite' }}/>
          <blockquote style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:300, fontSize:'clamp(1.6rem,4vw,3rem)', color:'var(--text-dark)', lineHeight:1.35, fontStyle:'italic' }}>
            {isRTL?'"اعتني بنفسك. أنتِ تستحقين ذلك."':'"Take care of yourself. You are worth it."'}
          </blockquote>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-12" style={{ background:'var(--blush-deep)' }}/>
            <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color:'var(--rose)' }}>{isRTL?'فلسفتنا':'Our Philosophy'}</span>
            <div className="h-px w-12" style={{ background:'var(--blush-deep)' }}/>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAILS
// ─────────────────────────────────────────────────────────────
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }:any) {
  const [selectedImage, setSelectedImage] = useState(0);
  return (
    <div className="min-h-screen" dir={isRTL?'rtl':'ltr'} style={{ backgroundColor:'var(--ivory)', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Breadcrumb */}
      <header className="py-4 sticky top-0 z-40" style={{ backgroundColor:'rgba(255,253,248,0.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--border-soft)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-light" style={{ color:'var(--text-soft)' }}>
            <span className="hover:text-rose-400 cursor-pointer">{isRTL?'الرئيسية':'Home'}</span>
            <ChevronRight className="w-3 h-3"/>
            <span style={{ color:'var(--text-dark)' }}>{product.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ border:'1px solid var(--border)', backgroundColor:isWishlisted?'var(--blush)':'white', color:isWishlisted?'var(--rose)':'var(--text-soft)' }}>
              <Heart className={`w-3.5 h-3.5 ${isWishlisted?'fill-current':''}`}/>
            </button>
            <button onClick={handleShare} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border:'1px solid var(--border)', color:'var(--text-soft)' }}>
              <Share2 className="w-3.5 h-3.5"/>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor:inStock?'rgba(181,196,177,0.25)':'rgba(242,196,206,0.35)', border:`1px solid ${inStock?'var(--sage)':'var(--blush)'}`, color:inStock?'var(--sage-dark)':'var(--rose)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock?'bg-green-400 animate-pulse':'bg-rose-400'}`}/>
              {inStock?(isRTL?'متوفر':'In Stock'):(isRTL?'غير متوفر':'Out of Stock')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-3xl group" style={{ aspectRatio:'4/5', backgroundColor:'var(--blush-pale)', border:'1px solid var(--border-soft)' }}>
              {allImages.length > 0
                ? <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                : <div className="w-full h-full flex items-center justify-center petal-pattern"><Flower2 className="w-16 h-16" style={{ color:'var(--blush)', animation:'float-gentle 4s ease-in-out infinite' }}/></div>
              }
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background:'linear-gradient(to bottom,transparent 60%,rgba(193,126,138,0.1) 100%)' }}/>
              {discount > 0 && <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor:'var(--rose)', color:'white' }}>-{discount}%</div>}
              <button onClick={toggleWishlist} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', color:isWishlisted?'var(--rose)':'var(--text-soft)', border:'1px solid var(--border-soft)' }}>
                <Heart className={`w-4 h-4 ${isWishlisted?'fill-current':''}`}/>
              </button>
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage(p=>p===0?allImages.length-1:p-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ backgroundColor:'rgba(255,255,255,0.85)', backdropFilter:'blur(6px)', border:'1px solid var(--border-soft)', color:'var(--text-mid)' }}>
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                  <button onClick={() => setSelectedImage(p=>p===allImages.length-1?0:p+1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ backgroundColor:'rgba(255,255,255,0.85)', backdropFilter:'blur(6px)', border:'1px solid var(--border-soft)', color:'var(--text-mid)' }}>
                    <ChevronRight className="w-4 h-4"/>
                  </button>
                </>
              )}
              {!inStock && !autoGen && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl" style={{ backgroundColor:'rgba(255,253,248,0.75)', backdropFilter:'blur(4px)' }}>
                  <div className="px-6 py-3 rounded-full text-sm font-medium" style={{ border:'1.5px solid var(--rose)', color:'var(--rose)', backgroundColor:'rgba(255,255,255,0.9)' }}>{isRTL?'نفد المخزون':'Out of Stock'}</div>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img:string,idx:number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className="shrink-0 w-16 h-16 overflow-hidden rounded-xl transition-all"
                    style={{ border:`2px solid ${selectedImage===idx?'var(--rose)':'var(--border-soft)'}`, opacity:selectedImage===idx?1:0.55 }}>
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { icon:<ShieldCheck className="w-4 h-4"/>, label:isRTL?'دفع آمن':'Secure Pay'    },
                { icon:<Truck className="w-4 h-4"/>,       label:isRTL?'توصيل سريع':'Fast Delivery' },
                { icon:<Leaf className="w-4 h-4"/>,        label:isRTL?'طبيعي':'Authentic'       },
              ].map((b,i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 py-4 rounded-xl" style={{ border:'1px solid var(--border-soft)', backgroundColor:'var(--white)' }}>
                  <span style={{ color:'var(--champagne)' }}>{b.icon}</span>
                  <span className="text-[9px] font-light tracking-wider text-center" style={{ color:'var(--text-soft)' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-6" style={{ background:'var(--blush-deep)' }}/>
                <span className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color:'var(--rose)' }}>{isRTL?'المنتج':'Product'}</span>
              </div>
              <h1 className="leading-tight mb-3" style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:400, fontSize:'clamp(1.8rem,3.5vw,3rem)', color:'var(--text-dark)' }}>{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{[...Array(5)].map((_,i) => <Star key={i} className={`w-3.5 h-3.5 ${i<4?'fill-current':''}`} style={{ color:'var(--champagne)' }}/>)}</div>
                <span className="text-xs font-light" style={{ color:'var(--text-soft)' }}>4.8 (128 {isRTL?'تقييم':'reviews'})</span>
              </div>
            </div>
            {/* Price */}
            <div className="p-5 rounded-2xl relative overflow-hidden" style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream))', border:'1px solid var(--border)' }}>
              <div className="absolute top-0 left-0 w-1 h-full rounded-full" style={{ background:'linear-gradient(180deg,var(--blush-deep),var(--rose))' }}/>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium mb-2 pl-4" style={{ color:'var(--text-soft)' }}>{isRTL?'السعر':'Price'}</p>
              <div className="flex items-baseline gap-3 pl-4">
                <span className="font-light" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'3rem', color:'var(--rose-dark)', lineHeight:1 }}>{finalPrice.toLocaleString()}</span>
                <span className="text-sm font-light" style={{ color:'var(--text-mid)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <div>
                    <span className="text-sm line-through font-light block" style={{ color:'var(--text-ghost)' }}>{parseFloat(product.priceOriginal).toLocaleString()} دج</span>
                    <span className="text-[10px] font-medium" style={{ color:'var(--champagne)' }}>✦ Save {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج</span>
                  </div>
                )}
              </div>
            </div>
            {/* Stock */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
              style={{ backgroundColor:autoGen?'rgba(201,169,110,0.1)':inStock?'rgba(181,196,177,0.2)':'rgba(242,196,206,0.3)', border:`1px solid ${autoGen?'var(--champagne-lt)':inStock?'var(--sage)':'var(--blush)'}`, color:autoGen?'var(--champagne)':inStock?'var(--sage-dark)':'var(--rose)' }}>
              {autoGen?<Infinity className="w-3.5 h-3.5"/>:inStock?<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>:<X className="w-3.5 h-3.5"/>}
              {autoGen?(isRTL?'مخزون غير محدود':'Unlimited'):inStock?(isRTL?'متوفر':'In Stock'):(isRTL?'نفد':'Out of Stock')}
            </div>
            {/* Offers */}
            {product.offers?.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase font-medium mb-3" style={{ color:'var(--rose)' }}>{isRTL?'✦ اختاري الباقة':'✦ Select Package'}</p>
                <div className="space-y-2">
                  {product.offers.map((offer:any) => (
                    <label key={offer.id} className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                      style={{ border:`1.5px solid ${selectedOffer===offer.id?'var(--rose)':'var(--border)'}`, backgroundColor:selectedOffer===offer.id?'rgba(193,126,138,0.06)':'var(--white)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ border:`1.5px solid ${selectedOffer===offer.id?'var(--rose)':'var(--border)'}` }}>
                          {selectedOffer===offer.id && <div className="w-2 h-2 rounded-full" style={{ backgroundColor:'var(--rose)' }}/>}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only"/>
                        <div>
                          <p className="text-sm font-light" style={{ color:'var(--text-dark)' }}>{offer.name}</p>
                          <p className="text-[10px] font-light" style={{ color:'var(--text-soft)' }}>Qty: {offer.quantity}</p>
                        </div>
                      </div>
                      <span className="font-light" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.3rem', color:'var(--rose-dark)' }}>{offer.price.toLocaleString()} <span className="text-xs">دج</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {/* Attributes */}
            {allAttrs.map((attr:any) => (
              <div key={attr.id}>
                <p className="text-xs tracking-[0.2em] uppercase font-medium mb-3" style={{ color:'var(--rose)' }}>✦ {attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any) => {
                      const s = selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name,v.value)} title={v.name} className="w-9 h-9 rounded-full transition-all hover:scale-110"
                        style={{ backgroundColor:v.value, boxShadow:s?`0 0 0 3px white,0 0 0 5px var(--rose)`:'0 2px 8px rgba(0,0,0,0.12)', transform:s?'scale(1.1)':'scale(1)' }}/>;
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any) => {
                      const s = selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name,v.value)} className="w-14 h-14 overflow-hidden rounded-xl transition-all"
                        style={{ border:`2px solid ${s?'var(--rose)':'var(--border-soft)'}`, opacity:s?1:0.6 }}><img src={v.value} alt={v.name} className="w-full h-full object-cover"/></button>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v:any) => {
                      const s = selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name,v.value)} className="px-5 py-2 rounded-full text-xs font-light tracking-wide transition-all"
                        style={{ border:`1.5px solid ${s?'var(--rose)':'var(--border)'}`, backgroundColor:s?'rgba(193,126,138,0.1)':'var(--white)', color:s?'var(--rose-dark)':'var(--text-mid)' }}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}
            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>
          </div>
        </div>
        {product.desc && (
          <section className="mt-20 pt-12" style={{ borderTop:'1px solid var(--border-soft)' }}>
            <div className="text-center mb-10">
              <div className="divider-rose">
                <span className="text-[10px] tracking-[0.25em] uppercase font-medium" style={{ color:'var(--rose)', whiteSpace:'nowrap' }}>{isRTL?'تفاصيل المنتج':'Product Details'}</span>
              </div>
            </div>
            <div className="max-w-3xl mx-auto p-8 rounded-3xl" style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream))', border:'1px solid var(--border-soft)' }}>
              <div className="text-sm font-light leading-relaxed" style={{ color:'var(--text-mid)' }}
                dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc,{ ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','span'],ALLOWED_ATTR:['class','style'] })}}/>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCT FORM
// ─────────────────────────────────────────────────────────────
const inputSt = (err?:boolean):React.CSSProperties => ({
  width:'100%', padding:'12px 16px', fontSize:'0.875rem', fontWeight:300,
  backgroundColor:'var(--white)', border:`1px solid ${err?'var(--rose)':'var(--border)'}`,
  borderRadius:'0.75rem', color:'var(--text-dark)', outline:'none',
  fontFamily:"'DM Sans',sans-serif", transition:'border-color 0.25s,box-shadow 0.25s',
});
const FieldWrapper = ({ error, label, children }:{ error?:string; label?:string; children:React.ReactNode }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color:'var(--text-soft)' }}>{label}</label>}
    {children}
    {error && <p className="text-xs font-light flex items-center gap-1" style={{ color:'var(--rose)' }}><AlertCircle className="w-3 h-3"/>{error}</p>}
  </div>
);
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0 }:ProductFormProps) {
  const router = useRouter();
  const [wilayas,setWilayas] = useState<Wilaya[]>([]);
  const [communes,setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes,setLoadingCommunes] = useState(false);
  const [formData,setFormData] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [formErrors,setFormErrors] = useState<Record<string,string>>({});
  const [submitting,setSubmitting] = useState(false);
  useEffect(() => { if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(() => { if(typeof window!=='undefined'){ const id=localStorage.getItem('customerId'); if(id) setFormData(p=>({...p,customerId:id})); } },[]);
  useEffect(() => { if(!formData.customerWelaya){setCommunes([]);return;} setLoadingCommunes(true); fetchCommunes(formData.customerWelaya).then(d=>{setCommunes(d);setLoadingCommunes(false);}); },[formData.customerWelaya]);
  const selectedWilayaData = useMemo(() => wilayas.find(w=>String(w.id)===String(formData.customerWelaya)),[wilayas,formData.customerWelaya]);
  const getFinalPrice = useCallback(():number => {
    const base = typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const offer = product.offers?.find(o=>o.id===selectedOffer);
    if(offer) return offer.price;
    if(product.variantDetails?.length && Object.keys(selectedVariants).length>0){ const m=product.variantDetails.find(v=>variantMatches(v,selectedVariants)); if(m&&m.price!==-1) return m.price; }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getPriceLivraison = useCallback(():number => { if(!selectedWilayaData) return 0; return formData.typeLivraison==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice; },[selectedWilayaData,formData.typeLivraison]);
  useEffect(() => { if(selectedWilayaData) setFormData(f=>({...f,priceLoss:selectedWilayaData.livraisonReturn})); },[selectedWilayaData]);
  const finalPrice = getFinalPrice();
  const getTotalPrice = () => finalPrice*formData.quantity+getPriceLivraison();
  const validate = () => {
    const e:Record<string,string>={};
    if(!formData.customerName.trim())  e.customerName='الاسم مطلوب';
    if(!formData.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!formData.customerWelaya)       e.customerWelaya='الولاية مطلوبة';
    if(!formData.customerCommune)      e.customerCommune='البلدية مطلوبة';
    return e;
  };
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); const errs=validate(); if(Object.keys(errs).length){setFormErrors(errs);return;} setFormErrors({}); setSubmitting(true);
    try { const payload={...formData,productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice,totalPrice:getTotalPrice(),priceLivraison:getPriceLivraison()}; await axios.post(`${API_URL}/orders/create`,payload); if(typeof window!=='undefined'&&formData.customerId) localStorage.setItem('customerId',formData.customerId); router.push(`/lp/${domain}/successfully`); } catch(err){console.error(err);} finally{setSubmitting(false);}
  };
  const focusStyle = (e:React.FocusEvent<any>) => { e.target.style.borderColor='var(--blush-deep)'; e.target.style.boxShadow='0 0 0 3px rgba(242,196,206,0.25)'; };
  const blurStyle  = (e:React.FocusEvent<any>, hasErr?:boolean) => { e.target.style.borderColor=hasErr?'var(--rose)':'var(--border)'; e.target.style.boxShadow='none'; };
  return (
    <div style={{ borderTop:'1px solid var(--border-soft)', paddingTop:'1.75rem' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-6" style={{ background:'var(--blush-deep)' }}/>
        <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color:'var(--rose)' }}>Order Details</span>
        <div className="h-px flex-1" style={{ background:'linear-gradient(90deg,var(--border),transparent)' }}/>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerName} label="Full Name">
            <div className="relative">
              <User className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color:'var(--text-ghost)' }}/>
              <input type="text" value={formData.customerName} onChange={e=>setFormData({...formData,customerName:e.target.value})} placeholder="اسمك الكامل" style={{ ...inputSt(!!formErrors.customerName), paddingRight:'2.5rem' }} onFocus={focusStyle} onBlur={e=>blurStyle(e,!!formErrors.customerName)}/>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerPhone} label="Phone">
            <div className="relative">
              <Phone className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color:'var(--text-ghost)' }}/>
              <input type="tel" value={formData.customerPhone} onChange={e=>setFormData({...formData,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" style={{ ...inputSt(!!formErrors.customerPhone), paddingRight:'2.5rem' }} onFocus={focusStyle} onBlur={e=>blurStyle(e,!!formErrors.customerPhone)}/>
            </div>
          </FieldWrapper>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerWelaya} label="Wilaya">
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-ghost)' }}/><ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-ghost)' }}/>
              <select value={formData.customerWelaya} onChange={e=>setFormData({...formData,customerWelaya:e.target.value,customerCommune:''})} style={{ ...inputSt(!!formErrors.customerWelaya), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer' }}>
                <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerCommune} label="Commune">
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-ghost)' }}/><ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-ghost)' }}/>
              <select value={formData.customerCommune} disabled={!formData.customerWelaya||loadingCommunes} onChange={e=>setFormData({...formData,customerCommune:e.target.value})} style={{ ...inputSt(!!formErrors.customerCommune), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer', opacity:!formData.customerWelaya?0.5:1 }}>
                <option value="">{loadingCommunes?'Loading…':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase font-medium mb-3" style={{ color:'var(--text-soft)' }}>Delivery Mode</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home','office'] as const).map(type => (
              <button key={type} type="button" onClick={() => setFormData(p=>({...p,typeLivraison:type}))} className="flex flex-col items-center gap-2 py-5 rounded-xl transition-all"
                style={{ border:`1.5px solid ${formData.typeLivraison===type?'var(--rose)':'var(--border)'}`, backgroundColor:formData.typeLivraison===type?'rgba(193,126,138,0.07)':'var(--white)' }}>
                {type==='home'
                  ? <Heart className="w-5 h-5" style={{ color:formData.typeLivraison===type?'var(--rose)':'var(--text-ghost)' }}/>
                  : <Building2 className="w-5 h-5" style={{ color:formData.typeLivraison===type?'var(--rose)':'var(--text-ghost)' }}/>
                }
                <p className="text-[10px] tracking-widest uppercase font-medium" style={{ color:formData.typeLivraison===type?'var(--rose)':'var(--text-soft)' }}>{type==='home'?'Home':'Office'}</p>
                {selectedWilayaData && <p className="text-xs font-light" style={{ color:'var(--text-mid)' }}>{(type==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice).toLocaleString()} دج</p>}
              </button>
            ))}
          </div>
        </div>
        <FieldWrapper label="Quantity">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setFormData(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-light transition-all hover:scale-110" style={{ border:'1.5px solid var(--border)', color:'var(--rose)' }}>−</button>
            <span className="w-10 text-center font-light text-xl" style={{ fontFamily:"'Cormorant Garamond',serif", color:'var(--text-dark)' }}>{formData.quantity}</span>
            <button type="button" onClick={() => setFormData(p=>({...p,quantity:p.quantity+1}))} className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-light transition-all hover:scale-110" style={{ border:'1.5px solid var(--border)', color:'var(--rose)' }}>+</button>
          </div>
        </FieldWrapper>
        <div className="p-5 rounded-2xl relative overflow-hidden" style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream))', border:'1px solid var(--border)' }}>
          <p className="text-[10px] tracking-[0.2em] uppercase font-medium mb-4" style={{ color:'var(--rose)' }}>✦ Order Summary</p>
          <div className="space-y-2.5">
            {[{label:'Product',value:product.name},{label:'Unit',value:`${finalPrice.toLocaleString()} دج`},{label:'Qty',value:`× ${formData.quantity}`},{label:'Shipping',value:selectedWilayaData?`${getPriceLivraison().toLocaleString()} دج`:'TBD'}].map(row=>(
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color:'var(--text-soft)' }}>{row.label}</span>
                <span className="text-xs font-light" style={{ color:'var(--text-mid)' }}>{row.value}</span>
              </div>
            ))}
            <div className="pt-3" style={{ borderTop:'1px solid var(--border)' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium tracking-wider" style={{ color:'var(--rose-dark)' }}>TOTAL</span>
                <span className="font-light" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'2rem', color:'var(--rose-dark)' }}>{getTotalPrice().toLocaleString()}<span className="text-sm ml-1">دج</span></span>
              </div>
            </div>
          </div>
        </div>
        <button type="submit" disabled={submitting} className="btn-petal w-full py-4 rounded-full flex items-center justify-center gap-3 text-sm font-medium tracking-wider transition-all"
          style={{ background:submitting?'var(--border)':'linear-gradient(135deg,var(--rose),var(--rose-dark))', color:submitting?'var(--text-soft)':'white', boxShadow:submitting?'none':'0 8px 28px rgba(193,126,138,0.35)', cursor:submitting?'not-allowed':'pointer', animation:!submitting?'pulse-soft 3s ease-in-out infinite':'none' }}>
          {submitting?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Processing…</>:<><Sparkles className="w-4 h-4"/>Confirm Order</>}
        </button>
        <p className="text-[10px] text-center font-light flex items-center justify-center gap-1.5" style={{ color:'var(--text-ghost)' }}>
          <ShieldCheck className="w-3 h-3" style={{ color:'var(--sage-dark)' }}/> Secure & encrypted checkout
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATIC PAGES
// ─────────────────────────────────────────────────────────────
export function StaticPage({ page }:{ page:string }) {
  const p = page.toLowerCase();
  return <>{p==='privacy'&&<Privacy/>}{p==='terms'&&<Terms/>}{p==='cookies'&&<Cookies/>}{p==='contact'&&<Contact/>}</>;
}
function PageWrapper({ children, icon, title, subtitle }:{ children:React.ReactNode; icon:React.ReactNode; title:string; subtitle:string }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--ivory)', fontFamily:"'DM Sans',sans-serif" }}>
      <div className="relative overflow-hidden grain py-20" style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream) 60%,var(--sage-pale) 100%)' }}>
        <FloatingPetals/>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5" style={{ background:'linear-gradient(135deg,var(--blush),var(--blush-deep))', boxShadow:'0 8px 24px var(--shadow-rose)', color:'var(--rose-dark)' }}>{icon}</div>
          <h1 className="font-light mb-3" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2rem,5vw,4rem)', color:'var(--text-dark)' }}>{title}</h1>
          <p className="text-sm font-light mx-auto" style={{ color:'var(--text-mid)', maxWidth:'420px' }}>{subtitle}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0"><svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:'60px' }}><path d="M0 60L1440 60L1440 20C1200 55 900 5 600 30C300 55 100 15 0 40Z" fill="var(--ivory)"/></svg></div>
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">{children}</div>
    </div>
  );
}
function InfoCard({ icon, title, desc, status }:{ icon:React.ReactNode; title:string; desc:string; status?:string }) {
  const isActive = status==='دائماً نشطة'||status==='Always Active';
  return (
    <div className="group flex gap-5 p-6 mb-3 rounded-2xl transition-all duration-300"
      style={{ border:'1px solid var(--border-soft)', backgroundColor:'var(--white)' }}
      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--blush)';el.style.boxShadow='0 8px 30px var(--shadow-rose)';el.style.transform='translateY(-2px)';}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border-soft)';el.style.boxShadow='none';el.style.transform='none';}}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream))', color:'var(--rose)' }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="font-light" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.15rem', color:'var(--text-dark)' }}>{title}</h3>
          {status && <span className="text-[9px] font-medium tracking-widest uppercase px-3 py-1 rounded-full" style={{ backgroundColor:isActive?'rgba(181,196,177,0.2)':'rgba(242,196,206,0.25)', border:`1px solid ${isActive?'var(--sage)':'var(--blush)'}`, color:isActive?'var(--sage-dark)':'var(--rose)' }}>{status}</span>}
        </div>
        <p className="text-sm font-light leading-relaxed" style={{ color:'var(--text-mid)' }}>{desc}</p>
      </div>
    </div>
  );
}
export function Privacy() {
  return (
    <PageWrapper icon={<ShieldCheck size={22}/>} title="Privacy Policy" subtitle="Your personal data is treated with the utmost care and discretion.">
      <InfoCard icon={<Database size={16}/>} title="Data We Collect"   desc="We collect only what's essential — your name, email and order details — to deliver a seamless and personalised experience."/>
      <InfoCard icon={<Lock size={16}/>}     title="Security"          desc="Advanced encryption and security protocols protect your information from any unauthorised access at all times."/>
      <InfoCard icon={<Globe size={16}/>}    title="Data Sharing"      desc="We never sell your data. It is shared only with trusted partners necessary to fulfil your orders."/>
      <div className="mt-8 p-5 rounded-2xl flex items-center gap-3" style={{ border:'1px solid rgba(181,196,177,0.4)', backgroundColor:'rgba(181,196,177,0.08)' }}>
        <Bell size={14} style={{ color:'var(--sage-dark)', flexShrink:0 }}/>
        <p className="text-xs font-light" style={{ color:'var(--text-mid)' }}>This policy is updated periodically to reflect the latest security and privacy standards.</p>
        <span className="ml-auto text-[10px] font-light whitespace-nowrap" style={{ color:'var(--text-ghost)' }}>Updated 06.02.2026</span>
      </div>
    </PageWrapper>
  );
}
export function Terms() {
  return (
    <PageWrapper icon={<Scale size={22}/>} title="Terms of Service" subtitle="Transparent, fair terms for a trusted shopping experience.">
      <InfoCard icon={<CheckCircle2 size={16}/>} title="Account Responsibility" desc="You are responsible for maintaining the confidentiality of your account and for all activities conducted under it."/>
      <InfoCard icon={<CreditCard size={16}/>}   title="Fees & Billing"         desc="Subscription fees are transparent with no hidden charges. You will be notified of any changes in advance."/>
      <InfoCard icon={<Ban size={16}/>}           title="Prohibited Content"     desc="The sale of counterfeit, illegal, or harmful goods is strictly prohibited. Violations may result in account suspension."/>
      <InfoCard icon={<Scale size={16}/>}         title="Governing Law"          desc="These terms are governed by the applicable laws of Algeria. Disputes are subject to the jurisdiction of local courts."/>
      <div className="mt-8 p-5 rounded-2xl flex items-start gap-3" style={{ border:'1px solid rgba(201,169,110,0.3)', backgroundColor:'rgba(201,169,110,0.06)' }}>
        <AlertCircle size={14} style={{ color:'var(--champagne)', flexShrink:0, marginTop:2 }}/>
        <p className="text-xs font-light leading-relaxed" style={{ color:'var(--text-mid)' }}>We reserve the right to modify these terms. Continued use after changes constitutes acceptance.</p>
      </div>
    </PageWrapper>
  );
}
export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={22}/>} title="Cookie Policy" subtitle="Small files, big transparency — here's exactly what we use and why.">
      <InfoCard icon={<ShieldCheck size={16}/>}   title="Essential Cookies"  desc="Necessary for core functionality like login, cart, and session management. These cannot be disabled." status="Always Active"/>
      <InfoCard icon={<Settings size={16}/>}      title="Preference Cookies" desc="Remember your language, currency, and display settings for a smoother, more personal experience." status="Optional"/>
      <InfoCard icon={<MousePointer2 size={16}/>} title="Analytics Cookies"  desc="Help us understand how you interact with our store so we can improve your browsing experience." status="Optional"/>
      <div className="mt-8 p-6 rounded-2xl relative overflow-hidden" style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream))', border:'1px solid var(--border)' }}>
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ background:'linear-gradient(90deg,var(--blush-deep),var(--champagne-lt))' }}/>
        <div className="flex gap-4 items-start pt-2">
          <ToggleRight size={18} style={{ color:'var(--rose)', flexShrink:0, marginTop:2 }}/>
          <div>
            <h3 className="font-light mb-2" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', color:'var(--text-dark)' }}>Managing Your Preferences</h3>
            <p className="text-xs font-light leading-relaxed" style={{ color:'var(--text-mid)' }}>You can manage or delete cookies through your browser settings at any time. Disabling some cookies may affect certain features of the store.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
export function Contact() {
  const [formState,setFormState] = useState({ name:'', email:'', message:'' });
  const [sent,setSent] = useState(false);
  const contacts = [
    { icon:<Mail className="w-4 h-4"/>,   label:'Email',    value:'hello@beautystore.dz', href:'mailto:hello@beautystore.dz' },
    { icon:<Phone className="w-4 h-4"/>,  label:'Phone',    value:'+213 550 123 456',     href:'tel:+213550123456' },
    { icon:<MapPin className="w-4 h-4"/>, label:'Location', value:'Alger, Algérie',       href:undefined },
  ];
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--ivory)', fontFamily:"'DM Sans',sans-serif" }}>
      <div className="relative overflow-hidden grain py-24" style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream) 50%,var(--sage-pale) 100%)' }}>
        <FloatingPetals/>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <Flower2 className="w-10 h-10 mx-auto mb-5" style={{ color:'var(--blush-deep)', animation:'float-gentle 4s ease-in-out infinite' }}/>
          <h1 className="font-light mb-4" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2.5rem,6vw,5rem)', color:'var(--text-dark)' }}>Get in Touch</h1>
          <div className="divider-rose mx-auto" style={{ maxWidth:'280px' }}>
            <span className="text-[10px] tracking-[0.25em] uppercase font-medium" style={{ color:'var(--rose)', whiteSpace:'nowrap' }}>We'd love to hear from you</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0"><svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:'60px' }}><path d="M0 60L1440 60L1440 20C1200 55 900 5 600 30C300 55 100 15 0 40Z" fill="var(--ivory)"/></svg></div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-light mb-8" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.8rem', color:'var(--text-dark)' }}>Reach Out</h2>
            <div className="space-y-3">
              {contacts.map(item => (
                <a key={item.label} href={item.href||'#'} className="group flex items-center gap-4 p-5 rounded-2xl transition-all" style={{ border:'1px solid var(--border-soft)', backgroundColor:'var(--white)', textDecoration:'none' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--blush)';el.style.boxShadow='0 8px 24px var(--shadow-rose)';el.style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border-soft)';el.style.boxShadow='none';el.style.transform='none';}}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream))', color:'var(--rose)' }}>{item.icon}</div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase font-medium" style={{ color:'var(--text-soft)' }}>{item.label}</p>
                    <p className="text-sm font-light" style={{ color:'var(--text-dark)' }}>{item.value}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:'var(--rose)' }}/>
                </a>
              ))}
            </div>
            <div className="mt-8 p-7 rounded-2xl relative overflow-hidden" style={{ background:'linear-gradient(135deg,var(--blush-pale),var(--cream))', border:'1px solid var(--border)' }}>
              <Quote className="w-8 h-8 mb-3 opacity-40" style={{ color:'var(--rose)' }}/>
              <p className="font-light leading-relaxed italic" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.05rem', color:'var(--text-dark)' }}>"To care for yourself is the most beautiful act of love."</p>
              <p className="mt-3 text-xs font-light" style={{ color:'var(--text-soft)' }}>— Our Promise to You</p>
              <Flower2 className="absolute bottom-4 right-4 w-10 h-10 opacity-15" style={{ color:'var(--rose)' }}/>
            </div>
          </div>
          <div>
            <h2 className="font-light mb-8" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.8rem', color:'var(--text-dark)' }}>Send a Message</h2>
            {sent ? (
              <div className="p-10 rounded-2xl text-center" style={{ border:'1px solid var(--blush)', background:'linear-gradient(135deg,var(--blush-pale),var(--cream))' }}>
                <Flower2 className="w-12 h-12 mx-auto mb-4" style={{ color:'var(--blush-deep)', animation:'float-gentle 4s ease-in-out infinite' }}/>
                <p className="font-light text-lg mb-1" style={{ fontFamily:"'Cormorant Garamond',serif", color:'var(--text-dark)' }}>Message Sent ✦</p>
                <p className="text-sm font-light" style={{ color:'var(--text-mid)' }}>We'll be in touch within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={e=>{e.preventDefault();setSent(true);}} className="space-y-4">
                {[{label:'Your Name',type:'text',val:formState.name,ph:'Jane Doe',key:'name'},{label:'Email Address',type:'email',val:formState.email,ph:'jane@example.com',key:'email'}].map(f => (
                  <FieldWrapper key={f.key} label={f.label}>
                    <input type={f.type} value={f.val} onChange={e=>setFormState({...formState,[f.key]:e.target.value})} placeholder={f.ph} style={inputSt()} required
                      onFocus={e=>{e.target.style.borderColor='var(--blush-deep)';e.target.style.boxShadow='0 0 0 3px rgba(242,196,206,0.25)';}}
                      onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}}/>
                  </FieldWrapper>
                ))}
                <FieldWrapper label="Your Message">
                  <textarea value={formState.message} onChange={e=>setFormState({...formState,message:e.target.value})} placeholder="How can we help you?" rows={5} style={{ ...inputSt(), resize:'none' as any }} required
                    onFocus={e=>{e.target.style.borderColor='var(--blush-deep)';e.target.style.boxShadow='0 0 0 3px rgba(242,196,206,0.25)';}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}}/>
                </FieldWrapper>
                <button type="submit" className="btn-petal w-full py-4 rounded-full flex items-center justify-center gap-2 text-sm font-medium tracking-wider"
                  style={{ background:'linear-gradient(135deg,var(--rose),var(--rose-dark))', color:'white', boxShadow:'0 8px 28px var(--shadow-rose)' }}>
                  <Sparkles className="w-4 h-4"/> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}