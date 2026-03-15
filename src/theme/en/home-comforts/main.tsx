'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Infinity, Share2, MapPin, Phone,
  User, ShieldCheck, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Shield, ArrowRight, Sofa, Leaf, Sparkles, Package, Truck,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

// ─── DESIGN TOKENS ────────────────────────────────────────────
const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

  :root {
    --linen:      #F7F3ED;
    --linen-dk:   #EDE7DC;
    --linen-dkk:  #E0D8CC;
    --warm-white: #FDFAF6;
    --walnut:     #6B4F3A;
    --walnut-lt:  #8B6B52;
    --walnut-dk:  #4E3929;
    --clay:       #C4795A;
    --clay-lt:    #D9957A;
    --clay-dk:    #A55E42;
    --sage:       #7A9270;
    --sage-lt:    #9DB391;
    --sage-dk:    #5C7252;
    --rose:       #C9A09A;
    --rose-lt:    #DDB9B4;
    --dusty:      #B8A89E;
    --text-h:     #2C1F17;
    --text-b:     #4A3728;
    --text-mid:   #7A6255;
    --text-dim:   #A89080;
    --border:     #E0D4CA;
    --border-lt:  #EDE4DC;
    --shadow:     rgba(107,79,58,0.10);
    --shadow-md:  rgba(107,79,58,0.18);
  }

  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:var(--linen); }
  ::-webkit-scrollbar-thumb { background:linear-gradient(180deg,var(--clay),var(--rose)); border-radius:99px; }

  @keyframes dust-float { 0%{opacity:0;transform:translateY(0) scale(0.6);} 30%{opacity:0.5;} 100%{opacity:0;transform:translateY(-90px) translateX(20px) scale(1.1);} }
  @keyframes fade-up    { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:translateY(0);} }
  @keyframes sway       { 0%,100%{transform:rotate(-2deg);} 50%{transform:rotate(2deg);} }
  @keyframes shimmer    { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
  @keyframes marquee-hc { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
  @keyframes float-soft { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }

  .fade-up    { animation: fade-up 0.75s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-d1 { animation-delay:0.12s; }
  .fade-up-d2 { animation-delay:0.26s; }
  .fade-up-d3 { animation-delay:0.44s; }
  .fade-up-d4 { animation-delay:0.62s; }

  .grain::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.04'/%3E%3C/svg%3E");
    opacity:0.06; mix-blend-mode:multiply;
  }

  .linen-tex {
    background-image:
      repeating-linear-gradient(0deg, rgba(107,79,58,0.03) 0px, rgba(107,79,58,0.03) 1px, transparent 1px, transparent 8px),
      repeating-linear-gradient(90deg, rgba(107,79,58,0.03) 0px, rgba(107,79,58,0.03) 1px, transparent 1px, transparent 8px);
  }

  .card-home {
    transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease;
  }
  .card-home:hover { transform:translateY(-8px); box-shadow:0 24px 64px var(--shadow-md); }

  .btn-cozy {
    position:relative; overflow:hidden;
    transition: all 0.4s cubic-bezier(0.22,1,0.36,1);
  }
  .btn-cozy::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 70%);
    background-size:200% auto; opacity:0; transition:opacity 0.4s;
  }
  .btn-cozy:hover { transform:translateY(-2px); box-shadow:0 10px 32px var(--shadow-md); }
  .btn-cozy:hover::before { opacity:1; animation:shimmer 0.8s ease forwards; }
  .btn-cozy:active { transform:scale(0.98); }

  .serif { font-family:'Cormorant Garamond',serif; }

  .marquee-wrap  { overflow:hidden; white-space:nowrap; }
  .marquee-inner { display:inline-block; animation:marquee-hc 24s linear infinite; }
`;

// ─── SVG DECORATIONS ──────────────────────────────────────────
function LeafSprig({ size=60, color='var(--sage)', style={} }: any) {
  return (
    <svg width={size} height={size*1.3} viewBox="0 0 60 78" fill="none" style={style}>
      <path d="M30 75 Q30 40 30 10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 55 Q20 44 10 46 Q14 34 30 38" fill={color} opacity="0.7"/>
      <path d="M30 55 Q40 44 50 46 Q46 34 30 38" fill={color} opacity="0.7"/>
      <path d="M30 38 Q22 28 14 30 Q17 18 30 22" fill={color} opacity="0.5"/>
      <path d="M30 38 Q38 28 46 30 Q43 18 30 22" fill={color} opacity="0.5"/>
      <path d="M30 22 Q24 14 19 16 Q21 7 30 10" fill={color} opacity="0.35"/>
      <path d="M30 22 Q36 14 41 16 Q39 7 30 10" fill={color} opacity="0.35"/>
    </svg>
  );
}

function OrnamentDiamond({ color='var(--clay)', size=10 }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="10" height="10" transform="rotate(45 6 6)" fill={color} opacity="0.55"/>
      <rect x="3" y="3" width="6" height="6" transform="rotate(45 6 6)" fill="none" stroke={color} strokeWidth="0.8" opacity="0.35"/>
    </svg>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-3">
      <div className="flex-1 h-px" style={{ background:'linear-gradient(90deg, transparent, var(--border))' }}/>
      <OrnamentDiamond size={8}/>
      <LeafSprig size={16} color="var(--sage)" style={{ transform:'rotate(90deg)' }}/>
      <OrnamentDiamond size={8}/>
      <div className="flex-1 h-px" style={{ background:'linear-gradient(90deg, var(--border), transparent)' }}/>
    </div>
  );
}

function FloatingDust() {
  const motes = useMemo(() => Array.from({ length:14 }, (_,i) => ({
    id:i, left:`${(i*7.1)%100}%`, bottom:`${10+(i*5.3)%60}%`,
    delay:`${(i*0.9)%10}s`, dur:`${6+(i*0.65)%6}s`, size:2+(i*0.5)%4,
    color:['rgba(196,121,90,0.4)','rgba(122,146,112,0.35)','rgba(201,160,154,0.45)','rgba(184,168,158,0.4)'][i%4],
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
      {motes.map(m=>(
        <div key={m.id} style={{ position:'absolute', left:m.left, bottom:m.bottom, opacity:0,
          animation:`dust-float ${m.dur} ${m.delay} ease-in-out infinite` }}>
          <div style={{ width:m.size, height:m.size, borderRadius:'50%', backgroundColor:m.color }}/>
        </div>
      ))}
    </div>
  );
}

// ─── TYPES ────────────────────────────────────────────────────
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

// ─── MAIN ─────────────────────────────────────────────────────
export default function Main({ store, children }: any) {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--warm-white)', fontFamily:"'Jost',sans-serif", color:'var(--text-b)' }}>
      <style>{FONT_CSS}</style>
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="marquee-wrap py-2.5" style={{ backgroundColor:'var(--walnut)', color:'var(--linen)' }}>
          <div className="marquee-inner">
            {Array(12).fill(null).map((_,i)=>(
              <span key={i} className="mx-10 text-xs tracking-[0.22em] font-light inline-flex items-center gap-3">
                <OrnamentDiamond color="var(--clay-lt)" size={7}/>{store.topBar.text}
              </span>
            ))}
            {Array(12).fill(null).map((_,i)=>(
              <span key={`b${i}`} className="mx-10 text-xs tracking-[0.22em] font-light inline-flex items-center gap-3">
                <OrnamentDiamond color="var(--clay-lt)" size={7}/>{store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}
      <Navbar store={store}/>
      <main>{children}</main>
      <Footer store={store}/>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────
export function Navbar({ store }: { store: Store }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRTL = store.language === 'ar';
  useEffect(()=>{ const h=()=>setScrolled(window.scrollY>30); window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h); },[]);
  const nav = [
    { href:`/${store.subdomain}`,         label:isRTL?'الرئيسية':'Home'    },
    { href:`/${store.subdomain}/contact`, label:isRTL?'اتصل بنا':'Contact' },
    { href:`/${store.subdomain}/Privacy`, label:isRTL?'الخصوصية':'Privacy' },
  ];
  const initials = store.name.split(' ').filter(Boolean).map((w:string)=>w[0]).join('').slice(0,2).toUpperCase();
  return (
    <nav className="sticky top-0 z-50 transition-all duration-500" dir={isRTL?'rtl':'ltr'}
      style={{ backgroundColor:scrolled?'rgba(253,250,246,0.96)':'var(--warm-white)', backdropFilter:scrolled?'blur(20px)':'none', borderBottom:`1px solid ${scrolled?'var(--border)':'transparent'}`, boxShadow:scrolled?'0 4px 40px var(--shadow)':'none' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between py-5">
          <Link href={`/${store.subdomain}`} className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-full flex items-center justify-center overflow-hidden transition-all duration-400 group-hover:scale-105"
              style={{ background:'linear-gradient(135deg, var(--walnut), var(--clay))', boxShadow:'0 4px 16px var(--shadow)' }}>
              {store.design.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} className="w-full h-full object-cover"/>
                : <span className="serif font-semibold text-white" style={{ fontSize:'1.1rem' }}>{initials}</span>
              }
            </div>
            <div>
              <span className="block serif font-medium transition-colors" style={{ fontSize:'1.35rem', color:'var(--text-h)', letterSpacing:'0.02em', lineHeight:1.1 }}>{store.name}</span>
              <span className="block text-[9px] font-light tracking-[0.24em] uppercase" style={{ color:'var(--clay)', marginTop:'2px' }}>{isRTL?'🏡 ديكور المنزل':'🏡 Home & Living'}</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {nav.map(item=>(
              <Link key={item.href} href={item.href}
                className="relative text-xs font-medium tracking-[0.14em] uppercase transition-colors group"
                style={{ color:'var(--text-mid)' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--walnut)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--text-mid)';}}>
                {item.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-400 rounded-full" style={{ background:'var(--clay)' }}/>
              </Link>
            ))}
            <Link href={`/${store.subdomain}`}
              className="btn-cozy flex items-center gap-2 px-7 py-3 rounded-full text-xs font-medium tracking-[0.12em] uppercase text-white"
              style={{ background:'linear-gradient(135deg, var(--walnut), var(--clay))', boxShadow:'0 4px 20px var(--shadow)' }}>
              <Sofa className="w-3.5 h-3.5"/> {isRTL?'تسوق':'Shop Now'}
            </Link>
          </div>

          <button onClick={()=>setMenuOpen(p=>!p)} className="md:hidden w-10 h-10 rounded-full flex items-center justify-center"
            style={{ border:'1px solid var(--border)', color:'var(--walnut)', backgroundColor:'var(--linen)' }}>
            {menuOpen?<X className="w-4 h-4"/>:<Sofa className="w-4 h-4"/>}
          </button>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-400 ${menuOpen?'max-h-52 pb-6':'max-h-0'}`}>
          <div className="pt-4 space-y-1" style={{ borderTop:'1px solid var(--border-lt)' }}>
            {nav.map(item=>(
              <Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-xl text-xs font-medium tracking-[0.14em] uppercase transition-all"
                style={{ color:'var(--text-mid)' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.backgroundColor='var(--linen)'; el.style.color='var(--walnut)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.backgroundColor='transparent'; el.style.color='var(--text-mid)';}}>
                {item.label}<ArrowRight className="w-3 h-3 opacity-40"/>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="h-px w-full" style={{ background:'linear-gradient(90deg, transparent, var(--clay-lt) 30%, var(--rose-lt) 50%, var(--clay-lt) 70%, transparent)', opacity:0.5 }}/>
    </nav>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────
export function Footer({ store }: any) {
  const isRTL = store.language === 'ar';
  return (
    <footer className="relative grain linen-tex" style={{ backgroundColor:'var(--walnut-dk)', overflow:'hidden', fontFamily:"'Jost',sans-serif" }}>
      <div className="absolute top-0 right-4 opacity-15 pointer-events-none" style={{ animation:'sway 8s ease-in-out infinite' }}>
        <LeafSprig size={120} color="var(--sage-lt)"/>
      </div>
      <div className="absolute bottom-0 left-4 opacity-10 pointer-events-none" style={{ transform:'rotate(180deg)', animation:'sway 10s ease-in-out infinite', animationDelay:'2s' }}>
        <LeafSprig size={90} color="var(--clay-lt)"/>
      </div>
      <div className="h-px" style={{ background:'linear-gradient(90deg, var(--walnut), var(--clay), var(--rose), var(--sage), var(--walnut))' }}/>
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12" style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="space-y-5">
            <div>
              <p className="serif font-medium mb-0.5" style={{ fontSize:'1.6rem', color:'var(--linen)', letterSpacing:'0.02em', lineHeight:1 }}>{store.name}</p>
              <p className="text-[9px] font-light tracking-[0.24em] uppercase" style={{ color:'var(--clay-lt)' }}>🏡 Home & Living</p>
            </div>
            <p className="text-sm font-light leading-relaxed" style={{ color:'rgba(240,234,224,0.55)' }}>
              {isRTL?'نحوّل منزلك إلى ملاذ دافئ. أثاث وديكور مختار بعناية لكل زاوية في بيتك.':'Turning houses into homes — curated furniture and décor for every corner of your sanctuary.'}
            </p>
            <div className="flex items-end gap-3">
              <LeafSprig size={40} color="rgba(240,234,224,0.12)"/>
              <LeafSprig size={28} color="rgba(196,121,90,0.18)"/>
              <LeafSprig size={50} color="rgba(122,146,112,0.16)"/>
            </div>
          </div>

          <div>
            <p className="serif italic text-xs mb-5" style={{ color:'var(--clay-lt)', letterSpacing:'0.1em' }}>— Quick Links</p>
            <div className="space-y-3">
              {[
                { href:`/${store.subdomain}/Privacy`, label:isRTL?'سياسة الخصوصية':'Privacy Policy'   },
                { href:`/${store.subdomain}/Terms`,   label:isRTL?'شروط الخدمة'    :'Terms of Service' },
                { href:`/${store.subdomain}/Cookies`, label:isRTL?'ملفات الارتباط' :'Cookie Policy'    },
                { href:`/${store.subdomain}/contact`, label:isRTL?'اتصل بنا'        :'Contact Us'       },
              ].map(l=>(
                <a key={l.href} href={l.href}
                  className="flex items-center gap-2 text-xs font-light transition-all"
                  style={{ color:'rgba(240,234,224,0.45)', letterSpacing:'0.08em' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.color='var(--clay-lt)'; el.style.paddingLeft='8px';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.color='rgba(240,234,224,0.45)'; el.style.paddingLeft='0';}}>
                  <OrnamentDiamond color="var(--clay)" size={6}/>{l.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="p-6 rounded-2xl relative overflow-hidden" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <div className="serif italic mb-2" style={{ fontSize:'3rem', color:'rgba(196,121,90,0.35)', lineHeight:0.8 }}>"</div>
              <p className="serif italic font-light leading-relaxed" style={{ fontSize:'1.05rem', color:'rgba(240,234,224,0.72)', letterSpacing:'0.02em' }}>
                {isRTL ? '"المنزل حيث تبدأ قصتك."' : '"Home is where your story begins."'}
              </p>
              <p className="text-xs font-light mt-3" style={{ color:'rgba(240,234,224,0.28)', letterSpacing:'0.12em' }}>— Anonymous</p>
              <div className="absolute -bottom-4 -right-4 opacity-10"><LeafSprig size={70} color="var(--sage-lt)"/></div>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-light tracking-[0.12em]" style={{ color:'rgba(240,234,224,0.22)' }}>© {new Date().getFullYear()} {store.name} · {isRTL?'جميع الحقوق محفوظة':'All rights reserved'}</p>
          <p className="text-xs font-light flex items-center gap-2 tracking-[0.1em]" style={{ color:'rgba(240,234,224,0.22)' }}>
            <OrnamentDiamond color="var(--clay-lt)" size={7}/> Home Comforts Theme <OrnamentDiamond color="var(--clay-lt)" size={7}/>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── CARD ─────────────────────────────────────────────────────
export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const [hovered, setHovered] = useState(false);
  const accents = ['var(--clay)','var(--sage)','var(--rose)','var(--dusty)','var(--walnut-lt)'];
  const accent  = accents[parseInt(product.id, 10) % accents.length] || accents[0];
  return (
    <div className="card-home group flex flex-col overflow-hidden rounded-2xl"
      style={{ backgroundColor:'var(--warm-white)', border:'1px solid var(--border-lt)', boxShadow:'0 4px 24px var(--shadow)' }}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio:'4/3', backgroundColor:'var(--linen)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700" style={{ transform:hovered?'scale(1.08)':'scale(1)' }}/>
          : <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Sofa className="w-14 h-14" style={{ color:'var(--linen-dkk)' }}/>
              <span className="text-xs font-light tracking-widest uppercase" style={{ color:'var(--text-dim)' }}>No Image</span>
            </div>
        }
        <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(to bottom, rgba(253,250,246,0.1) 0%, transparent 40%, rgba(253,250,246,0.4) 100%)' }}/>
        {discount > 0 && (
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-medium tracking-widest text-white"
            style={{ backgroundColor:'var(--clay)', boxShadow:'0 4px 12px rgba(196,121,90,0.35)' }}>
            -{discount}%
          </div>
        )}
        <button className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
          style={{ backgroundColor:'var(--warm-white)', boxShadow:'0 2px 10px var(--shadow)', color:'var(--rose)', transform:hovered?'scale(1)':'scale(0.75)', opacity:hovered?1:0 }}>
          <Heart className="w-4 h-4"/>
        </button>
        {/* CTA hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-400"
          style={{ transform:hovered?'translateY(0)':'translateY(110%)', opacity:hovered?1:0 }}>
          <Link href={`/${store.subdomain}/product/${product.slug||product.id}`}
            className="btn-cozy flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-medium tracking-[0.12em] uppercase text-white"
            style={{ background:`linear-gradient(135deg, var(--walnut), ${accent})`, boxShadow:'0 8px 24px var(--shadow-md)' }}>
            {viewDetails} <ArrowRight className="w-3.5 h-3.5"/>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_,i)=><Star key={i} className={`w-3 h-3 ${i<4?'fill-current':''}`} style={{ color:'var(--clay-lt)' }}/>)}
        </div>
        <h3 className="serif font-medium mb-2 line-clamp-2 leading-snug"
          style={{ fontSize:'1.1rem', color:'var(--text-h)', letterSpacing:'0.01em' }}>
          {product.name}
        </h3>
        {product.desc && (
          <div className="text-xs mb-3 line-clamp-2 leading-relaxed font-light" style={{ color:'var(--text-dim)' }}
            dangerouslySetInnerHTML={{ __html:product.desc }}/>
        )}
        <div className="mt-auto pt-3 flex items-end justify-between" style={{ borderTop:'1px solid var(--border-lt)' }}>
          <div>
            <p className="text-[9px] font-medium tracking-[0.14em] uppercase mb-0.5" style={{ color:'var(--text-dim)' }}>Price</p>
            <span className="serif font-semibold" style={{ fontSize:'1.5rem', color:accent, letterSpacing:'0.01em', lineHeight:1 }}>
              {product.price}
            </span>
            <span className="ml-1 text-xs font-light" style={{ color:'var(--text-dim)' }}>{store.currency}</span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="ml-2 text-xs line-through font-light" style={{ color:'var(--text-dim)' }}>{product.priceOriginal}</span>
            )}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ backgroundColor:'var(--linen)', border:'1px solid var(--border)', color:accent }}>
            <ArrowRight className="w-3.5 h-3.5"/>
          </div>
        </div>
      </div>
      {/* Color accent bottom line */}
      <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl" style={{ background:`linear-gradient(90deg, var(--walnut), ${accent})` }}/>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────
export function Home({ store }: any) {
  const isRTL = store.language === 'ar';
  const dir   = isRTL ? 'rtl' : 'ltr';
  const t = {
    badge:        isRTL ? '🏡 أثاث وديكور فاخر'         : '🏡 Curated Home Décor',
    heroTitle:    isRTL ? 'أضفِ الدفء\nلمنزلك'           : 'Bring Warmth\nHome',
    heroSub:      isRTL ? 'مجموعة مختارة من الأثاث والديكور الذي يجعل منزلك ملاذاً حقيقياً.' : 'A carefully curated collection of furniture and décor that transforms any house into a sanctuary.',
    heroBtn:      isRTL ? 'تصفح المجموعة'                : 'Explore Collection',
    heroBtn2:     isRTL ? 'اكتشف التصنيفات'              : 'Browse Rooms',
    viewDetails:  isRTL ? 'عرض التفاصيل'                  : 'View Details',
    categories:   isRTL ? 'غرفة لكل مزاج'                : 'A Room for Every Mood',
    all:          isRTL ? 'الكل'                           : 'All Rooms',
    products:     isRTL ? 'مجموعتنا المختارة'              : 'Our Curated Selection',
    noProducts:   isRTL ? 'لا توجد منتجات حالياً'          : 'Collection Coming Soon',
  };

  const pillars = [
    { icon:'🛋️', label:isRTL?'أثاث الصالون':'Living Room',  desc:isRTL?'راحة واسترخاء':'Comfort & relaxation', color:'var(--clay)' },
    { icon:'🛏️', label:isRTL?'غرفة النوم':'Bedroom',        desc:isRTL?'هدوء وسكينة':'Calm & serenity',       color:'var(--sage)' },
    { icon:'🍽️', label:isRTL?'غرفة الطعام':'Dining',        desc:isRTL?'تجمّع ودفء':'Gather & warm',          color:'var(--rose)' },
    { icon:'🌿', label:isRTL?'ديكور طبيعي':'Natural Décor',  desc:isRTL?'طبيعة وحياة':'Nature & life',         color:'var(--walnut-lt)' },
  ];

  return (
    <div dir={dir} style={{ backgroundColor:'var(--warm-white)', fontFamily:"'Jost',sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden grain" style={{ minHeight:'100vh', display:'flex', alignItems:'center', backgroundColor:'var(--linen)' }}>
        <FloatingDust/>
        <div className="absolute inset-0 linen-tex pointer-events-none opacity-60"/>
        {/* Soft warm gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 80% 70% at 60% 50%, rgba(196,121,90,0.07) 0%, transparent 70%)' }}/>
        {/* Decorative leaves */}
        <div className="absolute top-16 right-8 opacity-30 pointer-events-none" style={{ animation:'sway 9s ease-in-out infinite' }}>
          <LeafSprig size={160} color="var(--sage)"/>
        </div>
        <div className="absolute bottom-0 right-32 opacity-20 pointer-events-none" style={{ transform:'rotate(20deg)', animation:'sway 7s ease-in-out infinite', animationDelay:'1.5s' }}>
          <LeafSprig size={100} color="var(--clay-lt)"/>
        </div>
        <div className="absolute top-1/3 left-4 opacity-15 pointer-events-none" style={{ transform:'rotate(-15deg) scaleX(-1)', animation:'sway 11s ease-in-out infinite' }}>
          <LeafSprig size={80} color="var(--walnut-lt)"/>
        </div>

        {store.hero?.imageUrl && (
          <div className="absolute inset-0 pointer-events-none">
            <img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity:0.12 }}/>
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 w-full pt-12">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="fade-up inline-flex items-center gap-2 mb-7 px-5 py-2.5 rounded-full text-xs font-medium tracking-[0.16em] uppercase"
              style={{ backgroundColor:'var(--warm-white)', border:'1px solid var(--border)', color:'var(--walnut)', boxShadow:'0 4px 16px var(--shadow)' }}>
              <Sparkles className="w-3 h-3" style={{ color:'var(--clay)' }}/> {t.badge}
            </div>

            {/* Title */}
            <h1 className="fade-up fade-up-d1 serif whitespace-pre-line mb-6"
              style={{ fontWeight:400, fontSize:'clamp(3.5rem,9vw,8rem)', color:'var(--text-h)', letterSpacing:'-0.01em', lineHeight:0.95 }}>
              {store.hero?.title || t.heroTitle}
            </h1>

            {/* Ornament */}
            <div className="fade-up fade-up-d1 flex items-center gap-4 mb-7">
              <div className="h-px w-12" style={{ background:'linear-gradient(90deg, var(--clay), transparent)' }}/>
              <OrnamentDiamond size={9}/>
              <div className="h-px w-12" style={{ background:'linear-gradient(90deg, transparent, var(--sage))' }}/>
            </div>

            <p className="fade-up fade-up-d2 text-base leading-relaxed mb-10 font-light" style={{ color:'var(--text-mid)', maxWidth:'30rem' }}>
              {store.hero?.subtitle || t.heroSub}
            </p>

            {/* CTAs */}
            <div className="fade-up fade-up-d3 flex flex-wrap gap-4 mb-14">
              <a href="#products"
                className="btn-cozy flex items-center gap-2.5 px-9 py-4 rounded-full text-sm font-medium tracking-[0.10em] uppercase text-white"
                style={{ background:'linear-gradient(135deg, var(--walnut), var(--clay))', boxShadow:'0 8px 32px var(--shadow-md)' }}>
                <Sofa className="w-4 h-4"/> {t.heroBtn}
              </a>
              <a href="#categories"
                className="btn-cozy flex items-center gap-2.5 px-9 py-4 rounded-full text-sm font-medium tracking-[0.10em] uppercase"
                style={{ border:'1.5px solid var(--border)', color:'var(--walnut)', backgroundColor:'var(--warm-white)', boxShadow:'0 4px 16px var(--shadow)' }}>
                {t.heroBtn2} <ArrowRight className="w-4 h-4"/>
              </a>
            </div>

            {/* Trust row */}
            <div className="fade-up fade-up-d4 flex flex-wrap gap-6 pt-8" style={{ borderTop:'1px solid var(--border)' }}>
              {[
                { icon:<ShieldCheck className="w-4 h-4"/>, label:isRTL?'دفع آمن':'Secure Payment' },
                { icon:<Truck className="w-4 h-4"/>,      label:isRTL?'توصيل سريع':'Fast Delivery' },
                { icon:<Leaf className="w-4 h-4"/>,       label:isRTL?'جودة طبيعية':'Natural Quality' },
              ].map((b,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor:'var(--linen-dk)', color:'var(--clay)' }}>{b.icon}</div>
                  <span className="text-xs font-light tracking-[0.1em]" style={{ color:'var(--text-mid)' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom soft fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background:'linear-gradient(to bottom, transparent, var(--warm-white))' }}/>
      </section>

      {/* ── PILLARS ── */}
      <section id="categories" className="py-20" style={{ backgroundColor:'var(--warm-white)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <p className="serif italic text-sm mb-3" style={{ color:'var(--clay)', letterSpacing:'0.12em' }}>— {isRTL?'حسب الغرفة':'Shop by Room'}</p>
            <h2 className="serif font-light" style={{ fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--text-h)', letterSpacing:'-0.01em' }}>
              {t.categories}
            </h2>
            <SectionDivider/>
          </div>
          {store.categories?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href={`/${store.domain}`}
                className="btn-cozy flex flex-col items-center gap-3 py-8 px-4 rounded-2xl text-center transition-all"
                style={{ backgroundColor:'var(--linen)', border:'1.5px solid var(--border)', color:'var(--walnut)' }}>
                <span className="text-2xl">🏠</span>
                <span className="text-xs font-medium tracking-[0.1em] uppercase">{t.all}</span>
              </Link>
              {store.categories.map((cat:any, idx:number) => {
                const emojis = ['🛋️','🛏️','🍽️','🌿','🪴','🕯️','🖼️','🪞'];
                return (
                  <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                    className="btn-cozy flex flex-col items-center gap-3 py-8 px-4 rounded-2xl text-center transition-all"
                    style={{ backgroundColor:'var(--linen)', border:'1.5px solid var(--border)', color:'var(--walnut)' }}
                    onMouseEnter={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--clay)'; el.style.backgroundColor='var(--linen-dk)';}}
                    onMouseLeave={e=>{const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.backgroundColor='var(--linen)';}}>
                    <span className="text-2xl">{emojis[idx%emojis.length]}</span>
                    <span className="text-xs font-medium tracking-[0.1em] uppercase">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {pillars.map((p,i)=>(
                <div key={i} className="flex flex-col items-center gap-3 py-10 px-4 rounded-2xl text-center"
                  style={{ backgroundColor:'var(--linen)', border:'1px solid var(--border-lt)' }}>
                  <span className="text-3xl">{p.icon}</span>
                  <div>
                    <p className="text-xs font-medium tracking-[0.1em] uppercase mb-1" style={{ color:'var(--text-h)' }}>{p.label}</p>
                    <p className="text-[10px] font-light" style={{ color:'var(--text-dim)' }}>{p.desc}</p>
                  </div>
                  <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor:p.color }}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="py-20 linen-tex" style={{ backgroundColor:'var(--linen)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <p className="serif italic text-sm mb-3" style={{ color:'var(--clay)', letterSpacing:'0.12em' }}>— {isRTL?'اكتشف':'Discover'}</p>
            <h2 className="serif font-light" style={{ fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--text-h)', letterSpacing:'-0.01em' }}>
              {t.products}
            </h2>
            <p className="text-xs font-light mt-2 tracking-[0.1em]" style={{ color:'var(--text-dim)' }}>
              {store.products?.length || 0} {isRTL?'قطعة':'pieces in collection'}
            </p>
            <SectionDivider/>
          </div>

          {store.products?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {store.products.map((product:any) => {
                const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
                const discount = product.priceOriginal ? Math.round(((product.priceOriginal-product.price)/product.priceOriginal)*100) : 0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails}/>;
              })}
            </div>
          ) : (
            <div className="py-40 text-center rounded-3xl" style={{ backgroundColor:'var(--warm-white)', border:'1px solid var(--border-lt)' }}>
              <div style={{ animation:'float-soft 4s ease-in-out infinite' }}>
                <Sofa className="w-16 h-16 mx-auto mb-5" style={{ color:'var(--linen-dkk)' }}/>
              </div>
              <h3 className="serif font-light mb-2" style={{ fontSize:'1.8rem', color:'var(--text-mid)' }}>{t.noProducts}</h3>
              <p className="text-sm font-light" style={{ color:'var(--text-dim)' }}>{isRTL?'المنتجات قادمة قريباً.':'Your beautiful pieces are on their way.'}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── COZY BANNER ── */}
      <section className="relative overflow-hidden py-28 grain" style={{ backgroundColor:'var(--walnut-dk)' }}>
        <div className="absolute inset-0 linen-tex pointer-events-none opacity-30"/>
        <div className="absolute top-0 right-0 opacity-20 pointer-events-none" style={{ animation:'sway 10s ease-in-out infinite' }}>
          <LeafSprig size={200} color="var(--sage-lt)"/>
        </div>
        <div className="absolute bottom-0 left-8 opacity-15 pointer-events-none" style={{ transform:'rotate(180deg) scaleX(-1)', animation:'sway 8s ease-in-out infinite', animationDelay:'3s' }}>
          <LeafSprig size={140} color="var(--clay-lt)"/>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <OrnamentDiamond color="var(--clay-lt)" size={12}/>
          <h2 className="serif font-light my-6" style={{ fontSize:'clamp(2.5rem,7vw,6rem)', color:'var(--linen)', letterSpacing:'-0.01em', lineHeight:1.05 }}>
            {isRTL?'منزلك يستحق\nالأفضل':'Your Home\nDeserves the Best'}
          </h2>
          <SectionDivider/>
          <p className="text-base font-light leading-relaxed mb-10" style={{ color:'rgba(240,234,224,0.65)' }}>
            {isRTL?'كل قطعة في مجموعتنا مختارة بعناية لتضيف دفئاً وجمالاً لمنزلك.':'Every piece in our collection is handpicked to bring warmth, character, and beauty into your home.'}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="#products"
              className="btn-cozy flex items-center gap-2.5 px-10 py-4 rounded-full text-sm font-medium tracking-[0.10em] uppercase text-white"
              style={{ background:'linear-gradient(135deg, var(--clay), var(--clay-dk))', boxShadow:'0 8px 32px rgba(196,121,90,0.4)' }}>
              <Sofa className="w-4 h-4"/> {isRTL?'تسوق الآن':'Shop Collection'}
            </a>
            <a href="#categories"
              className="btn-cozy flex items-center gap-2.5 px-10 py-4 rounded-full text-sm font-medium tracking-[0.10em] uppercase"
              style={{ border:'1.5px solid rgba(240,234,224,0.25)', color:'var(--linen)', backgroundColor:'rgba(253,250,246,0.07)' }}>
              <Leaf className="w-4 h-4"/> {isRTL?'استكشف':'Explore Rooms'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── DETAILS ──────────────────────────────────────────────────
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [selectedImage, setSelectedImage] = useState(0);
  const accents = ['var(--clay)','var(--sage)','var(--rose)','var(--dusty)','var(--walnut-lt)'];
  const accent  = accents[parseInt(product.id, 10) % accents.length] || accents[0];
  return (
    <div className="min-h-screen" dir={isRTL?'rtl':'ltr'} style={{ backgroundColor:'var(--warm-white)', fontFamily:"'Jost',sans-serif" }}>
      {/* Breadcrumb */}
      <header className="py-4 sticky top-0 z-40" style={{ backgroundColor:'rgba(253,250,246,0.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-light tracking-[0.12em]" style={{ color:'var(--text-dim)' }}>
            <span className="hover:text-walnut cursor-pointer">{isRTL?'الرئيسية':'Home'}</span>
            <OrnamentDiamond size={5}/>
            <span style={{ color:'var(--text-h)' }}>{product.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ border:'1px solid var(--border)', backgroundColor:isWishlisted?'var(--rose-lt)':'transparent', color:isWishlisted?'var(--walnut)':'var(--rose)' }}>
              <Heart className={`w-4 h-4 ${isWishlisted?'fill-current':''}`}/>
            </button>
            <button onClick={handleShare} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ border:'1px solid var(--border)', color:'var(--text-dim)' }}>
              <Share2 className="w-4 h-4"/>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase"
              style={{ backgroundColor:inStock?'rgba(122,146,112,0.1)':'rgba(196,121,90,0.1)', border:`1px solid ${inStock?'var(--sage)':'var(--clay)'}`, color:inStock?'var(--sage-dk)':'var(--clay-dk)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock?'bg-green-400 animate-pulse':'bg-orange-400'}`}/>
              {inStock ? (isRTL?'متوفر':'In Stock') : (isRTL?'غير متوفر':'Out of Stock')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-3xl group" style={{ aspectRatio:'1', backgroundColor:'var(--linen)', border:'1px solid var(--border-lt)' }}>
              {allImages.length > 0
                ? <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                : <div className="w-full h-full flex items-center justify-center"><Sofa className="w-20 h-20" style={{ color:'var(--linen-dkk)' }}/></div>
              }
              {discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-medium text-white"
                  style={{ backgroundColor:'var(--clay)', boxShadow:'0 4px 16px rgba(196,121,90,0.35)' }}>
                  -{discount}% off
                </div>
              )}
              <button onClick={toggleWishlist} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{ backgroundColor:'var(--warm-white)', boxShadow:'0 4px 16px var(--shadow)', color:isWishlisted?'var(--rose)':'var(--dusty)' }}>
                <Heart className={`w-4 h-4 ${isWishlisted?'fill-current':''}`}/>
              </button>
              {allImages.length > 1 && (
                <>
                  <button onClick={()=>setSelectedImage(p=>p===0?allImages.length-1:p-1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ backgroundColor:'var(--warm-white)', boxShadow:'0 4px 16px var(--shadow)', color:'var(--walnut)' }}>
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                  <button onClick={()=>setSelectedImage(p=>p===allImages.length-1?0:p+1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ backgroundColor:'var(--warm-white)', boxShadow:'0 4px 16px var(--shadow)', color:'var(--walnut)' }}>
                    <ChevronRight className="w-4 h-4"/>
                  </button>
                </>
              )}
              {!inStock && !autoGen && (
                <div className="absolute inset-0 rounded-3xl flex items-center justify-center" style={{ backgroundColor:'rgba(253,250,246,0.85)', backdropFilter:'blur(6px)' }}>
                  <div className="px-8 py-4 rounded-full serif italic" style={{ backgroundColor:'var(--warm-white)', border:'1px solid var(--border)', color:'var(--text-mid)', fontSize:'1.1rem' }}>
                    {isRTL?'نفدت الكمية':'Out of Stock'}
                  </div>
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img:string,idx:number)=>(
                  <button key={idx} onClick={()=>setSelectedImage(idx)} className="shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
                    style={{ border:`2px solid ${selectedImage===idx?accent:'transparent'}`, opacity:selectedImage===idx?1:0.55 }}>
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[{e:'🛡️',l:isRTL?'جودة مضمونة':'Quality Assured'},{e:'🚚',l:isRTL?'توصيل سريع':'Fast Delivery'},{e:'🌿',l:isRTL?'مواد طبيعية':'Natural Materials'}].map((b,i)=>(
                <div key={i} className="flex flex-col items-center gap-2 py-4 rounded-2xl" style={{ backgroundColor:'var(--linen)', border:'1px solid var(--border-lt)' }}>
                  <span className="text-xl">{b.e}</span>
                  <span className="text-[9px] font-light tracking-[0.1em] uppercase text-center" style={{ color:'var(--text-dim)' }}>{b.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="serif italic text-xs mb-3" style={{ color:'var(--clay)', letterSpacing:'0.12em' }}>— {isRTL?'منتج':'Piece'}</p>
              <h1 className="serif font-light mb-3 leading-tight"
                style={{ fontSize:'clamp(1.8rem,4vw,3rem)', color:'var(--text-h)', letterSpacing:'-0.01em' }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{[...Array(5)].map((_,i)=><Star key={i} className={`w-3.5 h-3.5 ${i<4?'fill-current':''}`} style={{ color:'var(--clay-lt)' }}/>)}</div>
                <span className="text-xs font-light" style={{ color:'var(--text-dim)' }}>4.8 · 128 {isRTL?'تقييم':'reviews'}</span>
              </div>
            </div>

            {/* Price card */}
            <div className="p-5 rounded-2xl" style={{ backgroundColor:'var(--linen)', border:'1px solid var(--border-lt)' }}>
              <p className="text-[9px] font-medium tracking-[0.18em] uppercase mb-2" style={{ color:'var(--text-dim)' }}>{isRTL?'السعر':'Price'}</p>
              <div className="flex items-baseline gap-3">
                <span className="serif font-medium" style={{ fontSize:'3.5rem', color:accent, lineHeight:1, letterSpacing:'-0.02em' }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span className="text-sm font-light" style={{ color:'var(--text-mid)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <div>
                    <span className="text-sm line-through block font-light" style={{ color:'var(--text-dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()} دج</span>
                    <span className="text-xs font-medium" style={{ color:'var(--clay)' }}>Save {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-light tracking-[0.1em]"
              style={{ backgroundColor:autoGen?'rgba(184,168,158,0.12)':inStock?'rgba(122,146,112,0.1)':'rgba(196,121,90,0.1)', border:`1px solid ${autoGen?'var(--dusty)':inStock?'var(--sage)':'var(--clay)'}`, color:autoGen?'var(--dusty)':inStock?'var(--sage-dk)':'var(--clay-dk)' }}>
              {autoGen?<Infinity className="w-3.5 h-3.5"/>:inStock?<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>:<X className="w-3.5 h-3.5"/>}
              {autoGen?'Unlimited Stock':inStock?'In Stock — Ready to ship':'Out of Stock'}
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div>
                <SectionDivider/>
                <p className="text-[9px] font-medium tracking-[0.18em] uppercase mb-3" style={{ color:'var(--text-dim)' }}>{isRTL?'اختر الباقة':'Select Package'}</p>
                <div className="space-y-2">
                  {product.offers.map((offer:any)=>(
                    <label key={offer.id} className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                      style={{ border:`1.5px solid ${selectedOffer===offer.id?accent:'var(--border)'}`, backgroundColor:selectedOffer===offer.id?'var(--linen)':'transparent' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ border:`1.5px solid ${selectedOffer===offer.id?accent:'var(--border)'}` }}>
                          {selectedOffer===offer.id&&<div className="w-2 h-2 rounded-full" style={{ backgroundColor:accent }}/>}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={()=>setSelectedOffer(offer.id)} className="sr-only"/>
                        <div>
                          <p className="text-sm font-medium" style={{ color:'var(--text-h)' }}>{offer.name}</p>
                          <p className="text-xs font-light" style={{ color:'var(--text-dim)' }}>Qty: {offer.quantity}</p>
                        </div>
                      </div>
                      <span className="serif font-medium" style={{ fontSize:'1.3rem', color:accent }}>
                        {offer.price.toLocaleString()} <span className="text-xs font-light">دج</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr:any)=>(
              <div key={attr.id}>
                <SectionDivider/>
                <p className="text-[9px] font-medium tracking-[0.18em] uppercase mb-3" style={{ color:'var(--text-dim)' }}>{attr.name}</p>
                {attr.displayMode==='color'?(
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any)=>{ const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} className="w-9 h-9 rounded-full transition-all" style={{ backgroundColor:v.value, boxShadow:s?`0 0 0 2px var(--warm-white), 0 0 0 4px ${accent}`:'0 2px 8px var(--shadow)', transform:s?'scale(1.15)':'scale(1)' }}/>; })}
                  </div>
                ):attr.displayMode==='image'?(
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any)=>{ const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} className="w-14 h-14 rounded-xl overflow-hidden transition-all" style={{ border:`2px solid ${s?accent:'var(--border)'}`, opacity:s?1:0.6 }}><img src={v.value} alt={v.name} className="w-full h-full object-cover"/></button>; })}
                  </div>
                ):(
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v:any)=>{ const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} className="px-5 py-2.5 rounded-full text-xs font-medium tracking-[0.1em] transition-all" style={{ border:`1.5px solid ${s?accent:'var(--border)'}`, backgroundColor:s?'var(--linen)':'transparent', color:s?accent:'var(--text-mid)' }}>{v.name}</button>; })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>
          </div>
        </div>

        {product.desc && (
          <section className="mt-20 pt-12" style={{ borderTop:'1px solid var(--border-lt)' }}>
            <SectionDivider/>
            <h2 className="serif font-light mb-8 text-center" style={{ fontSize:'2rem', color:'var(--text-h)' }}>
              {isRTL?'تفاصيل القطعة':'Piece Details'}
            </h2>
            <div className="p-8 rounded-3xl linen-tex" style={{ backgroundColor:'var(--linen)', border:'1px solid var(--border-lt)' }}>
              <div className="text-sm font-light leading-relaxed" style={{ color:'var(--text-mid)' }}
                dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.desc, { ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','span'],ALLOWED_ATTR:['class','style'] }) }}/>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── PRODUCT FORM ─────────────────────────────────────────────
const inputSt = (err?:boolean): React.CSSProperties => ({
  width:'100%', padding:'12px 16px', fontSize:'0.875rem', fontWeight:300,
  backgroundColor:'var(--warm-white)', border:`1.5px solid ${err?'var(--clay)':'var(--border)'}`,
  borderRadius:'12px', color:'var(--text-h)', outline:'none',
  fontFamily:"'Jost',sans-serif", transition:'border-color 0.3s, box-shadow 0.3s',
});

const FieldWrapper = ({ error, label, children }: { error?:string; label?:string; children:React.ReactNode }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-[9px] font-medium tracking-[0.18em] uppercase" style={{ color:'var(--text-dim)' }}>{label}</label>}
    {children}
    {error && <p className="text-xs font-light flex items-center gap-1" style={{ color:'var(--clay)' }}><AlertCircle className="w-3 h-3"/>{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,setWilayas]   = useState<Wilaya[]>([]);
  const [communes,setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes,setLoadingCommunes] = useState(false);
  const [formData,setFormData] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [formErrors,setFormErrors] = useState<Record<string,string>>({});
  const [submitting,setSubmitting] = useState(false);

  useEffect(()=>{ if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(()=>{ if(typeof window!=='undefined'){ const id=localStorage.getItem('customerId'); if(id) setFormData(p=>({...p,customerId:id})); } },[]);
  useEffect(()=>{ if(!formData.customerWelaya){setCommunes([]);return;} setLoadingCommunes(true); fetchCommunes(formData.customerWelaya).then(d=>{setCommunes(d);setLoadingCommunes(false);}); },[formData.customerWelaya]);

  const selectedWilayaData = useMemo(()=>wilayas.find(w=>String(w.id)===String(formData.customerWelaya)),[wilayas,formData.customerWelaya]);
  const getFinalPrice = useCallback(():number=>{
    const base = typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const offer = product.offers?.find(o=>o.id===selectedOffer); if(offer) return offer.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){ const m=product.variantDetails.find(v=>variantMatches(v,selectedVariants)); if(m&&m.price!==-1) return m.price; }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getPriceLivraison = useCallback(():number=>{ if(!selectedWilayaData) return 0; return formData.typeLivraison==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice; },[selectedWilayaData,formData.typeLivraison]);
  useEffect(()=>{ if(selectedWilayaData) setFormData(f=>({...f,priceLoss:selectedWilayaData.livraisonReturn})); },[selectedWilayaData]);

  const finalPrice    = getFinalPrice();
  const getTotalPrice = ()=>finalPrice*formData.quantity+getPriceLivraison();
  const validate = ()=>{
    const e:Record<string,string>={};
    if(!formData.customerName.trim())  e.customerName='الاسم مطلوب';
    if(!formData.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!formData.customerWelaya)       e.customerWelaya='الولاية مطلوبة';
    if(!formData.customerCommune)      e.customerCommune='البلدية مطلوبة';
    return e;
  };
  const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault(); const errs=validate(); if(Object.keys(errs).length){setFormErrors(errs);return;} setFormErrors({}); setSubmitting(true);
    try { await axios.post(`${API_URL}/orders/create`,{ ...formData, productId:product.id, storeId:product.store.id, userId, selectedOffer, selectedVariants, platform:platform||'store', finalPrice, totalPrice:getTotalPrice(), priceLivraison:getPriceLivraison() }); if(typeof window!=='undefined'&&formData.customerId) localStorage.setItem('customerId',formData.customerId); router.push(`/lp/${domain}/successfully`); } catch(err){console.error(err);} finally{setSubmitting(false);}
  };
  const onFocus = (e:React.FocusEvent<any>)=>{ e.target.style.borderColor='var(--walnut)'; e.target.style.boxShadow='0 0 0 3px rgba(107,79,58,0.10)'; };
  const onBlur  = (e:React.FocusEvent<any>,err?:boolean)=>{ e.target.style.borderColor=err?'var(--clay)':'var(--border)'; e.target.style.boxShadow='none'; };

  return (
    <div style={{ borderTop:'1px solid var(--border-lt)', paddingTop:'1.5rem' }}>
      <SectionDivider/>
      <h3 className="serif font-light mb-6" style={{ fontSize:'1.6rem', color:'var(--text-h)', letterSpacing:'-0.01em' }}>
        {' '}{' '}{' '}{' '} Complete Your Order
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerName} label="Full Name">
            <div className="relative">
              <User className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <input type="text" value={formData.customerName} onChange={e=>setFormData({...formData,customerName:e.target.value})} placeholder="اسمك الكامل" style={{ ...inputSt(!!formErrors.customerName), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerName)}/>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerPhone} label="Phone">
            <div className="relative">
              <Phone className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <input type="tel" value={formData.customerPhone} onChange={e=>setFormData({...formData,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" style={{ ...inputSt(!!formErrors.customerPhone), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerPhone)}/>
            </div>
          </FieldWrapper>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerWelaya} label="Wilaya">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <select value={formData.customerWelaya} onChange={e=>setFormData({...formData,customerWelaya:e.target.value,customerCommune:''})} style={{ ...inputSt(!!formErrors.customerWelaya), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerWelaya)}>
                <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerCommune} label="Commune">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-dim)' }}/>
              <select value={formData.customerCommune} disabled={!formData.customerWelaya||loadingCommunes} onChange={e=>setFormData({...formData,customerCommune:e.target.value})} style={{ ...inputSt(!!formErrors.customerCommune), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer', opacity:!formData.customerWelaya?0.45:1 }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerCommune)}>
                <option value="">{loadingCommunes?'Loading...':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery */}
        <div>
          <p className="text-[9px] font-medium tracking-[0.18em] uppercase mb-3" style={{ color:'var(--text-dim)' }}>Delivery Method</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home','office'] as const).map(type=>(
              <button key={type} type="button" onClick={()=>setFormData(p=>({...p,typeLivraison:type}))}
                className="flex flex-col items-center gap-2 py-6 rounded-2xl transition-all"
                style={{ border:`1.5px solid ${formData.typeLivraison===type?'var(--walnut)':'var(--border)'}`, backgroundColor:formData.typeLivraison===type?'var(--linen)':'transparent' }}>
                <span className="text-2xl">{type==='home'?'🏡':'🏢'}</span>
                <p className="text-xs font-medium tracking-[0.1em] uppercase" style={{ color:formData.typeLivraison===type?'var(--walnut)':'var(--text-dim)' }}>
                  {type==='home'?'Home Delivery':'Office Pickup'}
                </p>
                {selectedWilayaData && (
                  <p className="serif text-lg" style={{ color:'var(--clay)', lineHeight:1 }}>
                    {(type==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice).toLocaleString()} <span className="text-xs font-light">دج</span>
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <FieldWrapper label="Quantity">
          <div className="flex items-center gap-4">
            <button type="button" onClick={()=>setFormData(p=>({...p,quantity:Math.max(1,p.quantity-1)}))}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-light transition-all"
              style={{ border:'1.5px solid var(--border)', color:'var(--walnut)', backgroundColor:'var(--linen)' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='var(--linen-dk)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='var(--linen)';}}>−</button>
            <span className="w-10 text-center serif font-medium" style={{ fontSize:'1.8rem', color:'var(--text-h)', lineHeight:1 }}>{formData.quantity}</span>
            <button type="button" onClick={()=>setFormData(p=>({...p,quantity:p.quantity+1}))}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-light transition-all"
              style={{ border:'1.5px solid var(--border)', color:'var(--walnut)', backgroundColor:'var(--linen)' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='var(--linen-dk)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='var(--linen)';}}>+</button>
          </div>
        </FieldWrapper>

        {/* Summary */}
        <div className="p-6 rounded-2xl linen-tex" style={{ backgroundColor:'var(--linen)', border:'1px solid var(--border-lt)' }}>
          <p className="text-[9px] font-medium tracking-[0.18em] uppercase mb-4" style={{ color:'var(--text-dim)' }}>Order Summary</p>
          <div className="space-y-2.5">
            {[{l:'Item',v:product.name},{l:'Unit price',v:`${finalPrice.toLocaleString()} دج`},{l:'Quantity',v:`× ${formData.quantity}`},{l:'Shipping',v:selectedWilayaData?`${getPriceLivraison().toLocaleString()} دج`:'TBD'}].map(row=>(
              <div key={row.l} className="flex justify-between items-center">
                <span className="text-[9px] font-light tracking-[0.12em] uppercase" style={{ color:'var(--text-dim)' }}>{row.l}</span>
                <span className="text-xs font-light" style={{ color:'var(--text-mid)' }}>{row.v}</span>
              </div>
            ))}
            <div className="pt-3" style={{ borderTop:'1px solid var(--border)' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium tracking-[0.1em] uppercase" style={{ color:'var(--text-mid)' }}>Total</span>
                <span className="serif font-medium" style={{ fontSize:'2rem', color:'var(--walnut)', letterSpacing:'-0.01em', lineHeight:1 }}>
                  {getTotalPrice().toLocaleString()} <span className="text-sm font-light">دج</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="btn-cozy w-full py-4 rounded-full flex items-center justify-center gap-3 text-sm font-medium tracking-[0.10em] uppercase text-white"
          style={{ background:submitting?'var(--dusty)':'linear-gradient(135deg, var(--walnut), var(--clay))', boxShadow:submitting?'none':'0 8px 32px var(--shadow-md)', cursor:submitting?'not-allowed':'pointer' }}>
          {submitting
            ?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing…</>
            :<><Sparkles className="w-4 h-4"/> Place My Order</>
          }
        </button>
        <p className="text-[9px] text-center font-light flex items-center justify-center gap-2 tracking-[0.14em]" style={{ color:'var(--text-dim)' }}>
          <Shield className="w-3 h-3" style={{ color:'var(--sage)' }}/> Secure &amp; encrypted checkout
        </p>
      </form>
    </div>
  );
}

// ─── STATIC PAGES ─────────────────────────────────────────────
export function StaticPage({ page }: { page:string }) {
  const p = page.toLowerCase();
  return <>{p==='privacy'&&<Privacy/>}{p==='terms'&&<Terms/>}{p==='cookies'&&<Cookies/>}{p==='contact'&&<Contact/>}</>;
}

function PageWrapper({ children, icon, title, subtitle }: { children:React.ReactNode; icon:React.ReactNode; title:string; subtitle:string }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--warm-white)', fontFamily:"'Jost',sans-serif" }}>
      <div className="relative grain linen-tex overflow-hidden py-24" style={{ backgroundColor:'var(--linen)' }}>
        <div className="absolute top-4 right-8 opacity-20 pointer-events-none" style={{ animation:'sway 9s ease-in-out infinite' }}>
          <LeafSprig size={130} color="var(--sage)"/>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background:'linear-gradient(to bottom, transparent, var(--warm-white))' }}/>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor:'var(--warm-white)', border:'1px solid var(--border)', color:'var(--clay)', boxShadow:'0 4px 16px var(--shadow)' }}>
            {icon}
          </div>
          <h1 className="serif font-light mb-3" style={{ fontSize:'clamp(2.5rem,7vw,5.5rem)', color:'var(--text-h)', letterSpacing:'-0.02em', lineHeight:0.95 }}>{title}</h1>
          <SectionDivider/>
          <p className="text-sm font-light" style={{ color:'var(--text-mid)' }}>{subtitle}</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">{children}</div>
    </div>
  );
}

function InfoCard({ icon, title, desc, badge, badgeColor='var(--clay)' }: { icon:React.ReactNode; title:string; desc:string; badge?:string; badgeColor?:string }) {
  return (
    <div className="card-home flex gap-5 p-6 mb-3 rounded-2xl cursor-default"
      style={{ border:'1px solid var(--border-lt)', backgroundColor:'var(--warm-white)', boxShadow:'0 4px 16px var(--shadow)' }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor:`${badgeColor}14`, color:badgeColor, border:`1px solid ${badgeColor}30` }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="serif font-medium" style={{ fontSize:'1.1rem', color:'var(--text-h)', letterSpacing:'0.01em' }}>{title}</h3>
          {badge && <span className="text-[8px] font-medium tracking-[0.18em] uppercase px-2.5 py-1 rounded-full" style={{ backgroundColor:`${badgeColor}12`, border:`1px solid ${badgeColor}30`, color:badgeColor }}>{badge}</span>}
        </div>
        <p className="text-sm font-light leading-relaxed" style={{ color:'var(--text-mid)' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper icon={<Lock size={20}/>} title="Privacy Policy" subtitle="How we handle and protect your personal information.">
      <InfoCard icon={<Database size={16}/>}    title="Information We Collect"  desc="We collect only what we need: your name, contact details, and delivery information to fulfill your order beautifully." badgeColor="var(--clay)"/>
      <InfoCard icon={<Shield size={16}/>}      title="How We Use It"           desc="Your data helps us deliver your furniture, communicate updates, and improve your shopping experience." badgeColor="var(--sage)"/>
      <InfoCard icon={<Lock size={16}/>}        title="Data Security"           desc="We use industry-standard encryption to keep your personal information safe and secure at all times." badgeColor="var(--rose)"/>
      <InfoCard icon={<Globe size={16}/>}       title="Data Sharing"            desc="We never sell your data. We only share necessary delivery information with our trusted logistics partners." badgeColor="var(--walnut-lt)"/>
      <div className="mt-8 p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor:'rgba(122,146,112,0.08)', border:'1px solid rgba(122,146,112,0.2)' }}>
        <Bell size={14} style={{ color:'var(--sage)', flexShrink:0 }}/>
        <p className="text-xs font-light" style={{ color:'var(--text-mid)' }}>This policy is reviewed periodically to ensure your privacy is always protected. Last updated: February 2026.</p>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper icon={<Scale size={20}/>} title="Terms of Service" subtitle="The guidelines that make our home community fair and trustworthy.">
      <InfoCard icon={<User size={16}/>}        title="Account Responsibility"  desc="You are responsible for maintaining the security of your account credentials and all activity that occurs under your account." badgeColor="var(--clay)"/>
      <InfoCard icon={<CreditCard size={16}/>}  title="Payments & Fees"         desc="All prices are clearly displayed with no hidden fees. What you see is exactly what you pay — full transparency." badgeColor="var(--sage)"/>
      <InfoCard icon={<Ban size={16}/>}         title="Prohibited Use"          desc="Our platform may not be used for unlawful purposes or to infringe on intellectual property rights." badgeColor="var(--rose)"/>
      <InfoCard icon={<Scale size={16}/>}       title="Governing Law"           desc="These terms are governed by Algerian law. Any disputes will be resolved through established legal channels." badgeColor="var(--walnut-lt)"/>
      <div className="mt-8 p-4 rounded-2xl flex items-start gap-3" style={{ backgroundColor:'rgba(196,121,90,0.06)', border:'1px solid rgba(196,121,90,0.2)' }}>
        <AlertCircle size={14} style={{ color:'var(--clay)', flexShrink:0, marginTop:2 }}/>
        <p className="text-xs font-light leading-relaxed" style={{ color:'var(--text-mid)' }}>We reserve the right to update these terms. Continued use of our platform constitutes acceptance of any changes made.</p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={20}/>} title="Cookie Policy" subtitle="Small files that help create a smoother, more personal experience.">
      <InfoCard icon={<ShieldCheck size={16}/>}   title="Essential Cookies"    desc="Required for core functionality such as keeping you signed in and maintaining your shopping session." badge="Always Active" badgeColor="var(--sage)"/>
      <InfoCard icon={<Settings size={16}/>}      title="Preference Cookies"   desc="Remember your settings like language preference and region so we can tailor your experience." badge="Optional" badgeColor="var(--clay)"/>
      <InfoCard icon={<MousePointer2 size={16}/>} title="Analytics Cookies"    desc="Help us understand how you browse so we can continuously improve our product selection and service." badge="Optional" badgeColor="var(--walnut-lt)"/>
      <div className="mt-8 p-5 rounded-2xl" style={{ backgroundColor:'var(--linen)', border:'1px solid var(--border-lt)' }}>
        <div className="flex gap-4 items-start">
          <ToggleRight size={18} style={{ color:'var(--clay)', flexShrink:0, marginTop:2 }}/>
          <div>
            <p className="serif font-medium mb-1.5" style={{ fontSize:'1.05rem', color:'var(--text-h)' }}>Manage Your Preferences</p>
            <p className="text-sm font-light leading-relaxed" style={{ color:'var(--text-mid)' }}>You can adjust or disable optional cookies through your browser settings at any time. Disabling essential cookies may affect core functionality.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export function Contact() {
  const [formState, setFormState] = useState({ name:'', email:'', message:'' });
  const [sent, setSent] = useState(false);
  const channels = [
    { emoji:'✉️', label:'Email Us',    val:'hello@homecomforts.dz',  href:'mailto:hello@homecomforts.dz' },
    { emoji:'📞', label:'Call Us',     val:'+213 550 123 456',        href:'tel:+213550123456'             },
    { emoji:'📍', label:'Visit Us',    val:'Alger, Algérie',          href:undefined                       },
  ];
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--warm-white)', fontFamily:"'Jost',sans-serif" }}>
      {/* Hero */}
      <div className="relative grain linen-tex overflow-hidden py-28" style={{ backgroundColor:'var(--linen)' }}>
        <FloatingDust/>
        <div className="absolute top-4 right-8 opacity-25 pointer-events-none" style={{ animation:'sway 9s ease-in-out infinite' }}>
          <LeafSprig size={150} color="var(--sage)"/>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{ background:'linear-gradient(to bottom, transparent, var(--warm-white))' }}/>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="serif italic text-sm mb-4" style={{ color:'var(--clay)', letterSpacing:'0.12em' }}>— Say Hello</p>
          <h1 className="serif font-light mb-4" style={{ fontSize:'clamp(3.5rem,10vw,9rem)', color:'var(--text-h)', letterSpacing:'-0.02em', lineHeight:0.9 }}>
            Let's Talk
          </h1>
          <SectionDivider/>
          <p className="text-base font-light" style={{ color:'var(--text-mid)' }}>We love hearing from our community. Reach out and we will get back to you within 24 hours.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Channels */}
          <div>
            <p className="serif italic text-xs mb-6" style={{ color:'var(--clay)', letterSpacing:'0.12em' }}>— Contact Channels</p>
            <div className="space-y-3">
              {channels.map(item=>(
                <a key={item.label} href={item.href||'#'}
                  className="card-home flex items-center gap-4 p-5 rounded-2xl"
                  style={{ border:'1px solid var(--border-lt)', backgroundColor:'var(--warm-white)', boxShadow:'0 4px 16px var(--shadow)', textDecoration:'none' }}>
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="text-[9px] font-medium tracking-[0.18em] uppercase mb-0.5" style={{ color:'var(--text-dim)' }}>{item.label}</p>
                    <p className="text-sm font-light" style={{ color:'var(--text-h)' }}>{item.val}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" style={{ color:'var(--clay)' }}/>
                </a>
              ))}
            </div>
            {/* Quote card */}
            <div className="mt-6 p-6 rounded-2xl relative overflow-hidden" style={{ background:'linear-gradient(135deg, var(--walnut), var(--clay))', boxShadow:'0 8px 32px var(--shadow-md)' }}>
              <div className="absolute -top-3 -right-3 opacity-15"><LeafSprig size={80} color="white"/></div>
              <p className="serif italic font-light leading-relaxed mb-3" style={{ fontSize:'1.05rem', color:'rgba(253,250,246,0.85)' }}>
                "Good design is making something beautiful that also works."
              </p>
              <p className="text-xs font-light" style={{ color:'rgba(253,250,246,0.45)', letterSpacing:'0.12em' }}>— Saul Bass</p>
            </div>
          </div>

          {/* Form */}
          <div>
            <p className="serif italic text-xs mb-6" style={{ color:'var(--clay)', letterSpacing:'0.12em' }}>— Send a Message</p>
            {sent ? (
              <div className="py-24 text-center rounded-3xl" style={{ backgroundColor:'var(--linen)', border:'1px solid var(--border-lt)' }}>
                <div style={{ animation:'float-soft 3s ease-in-out infinite' }}>
                  <CheckCircle2 className="w-14 h-14 mx-auto mb-5" style={{ color:'var(--sage)' }}/>
                </div>
                <p className="serif font-light mb-2" style={{ fontSize:'1.8rem', color:'var(--text-h)' }}>Message Sent!</p>
                <p className="text-sm font-light" style={{ color:'var(--text-dim)' }}>We will reply within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={e=>{e.preventDefault();setSent(true);}} className="space-y-4">
                {[{label:'Your Name',type:'text',val:formState.name,ph:'Full name',key:'name'},{label:'Email Address',type:'email',val:formState.email,ph:'your@email.com',key:'email'}].map(f=>(
                  <FieldWrapper key={f.key} label={f.label}>
                    <input type={f.type} value={f.val} onChange={e=>setFormState({...formState,[f.key]:e.target.value})} placeholder={f.ph} style={inputSt()} required
                      onFocus={e=>{e.target.style.borderColor='var(--walnut)'; e.target.style.boxShadow='0 0 0 3px rgba(107,79,58,0.10)';}}
                      onBlur={e=>{e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none';}}/>
                  </FieldWrapper>
                ))}
                <FieldWrapper label="Your Message">
                  <textarea value={formState.message} onChange={e=>setFormState({...formState,message:e.target.value})} placeholder="How can we help you?" rows={5}
                    style={{ ...inputSt(), resize:'none' as any }} required
                    onFocus={e=>{e.target.style.borderColor='var(--walnut)'; e.target.style.boxShadow='0 0 0 3px rgba(107,79,58,0.10)';}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none';}}/>
                </FieldWrapper>
                <button type="submit" className="btn-cozy w-full py-4 rounded-full flex items-center justify-center gap-2.5 text-sm font-medium tracking-[0.10em] uppercase text-white"
                  style={{ background:'linear-gradient(135deg, var(--walnut), var(--clay))', boxShadow:'0 8px 32px var(--shadow-md)' }}>
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