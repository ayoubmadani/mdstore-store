'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, AlertCircle, X, ToggleRight,
  ArrowLeft, Plus, Minus, CheckCircle2, Lock, Shield,
  Menu, Package, Truck, ShieldCheck, Phone, User,
  Search, ShoppingCart, ShoppingBag, Trash2, Loader2,
  ChevronLeft, ChevronRight, Heart, Share2,
  Home as HomeIcon, Building2, MapPin,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   LUXE FORMA DARK — Formal Footwear Arabic RTL Theme
   ─────────────────────────────────────────────────────────────
   Black #0A0A0A · Charcoal #141414 · Gold #C9A96E · Cream #F5F0E8
   Fonts: Cormorant Garamond (display) + Inter (body)
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Inter:wght@200;300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0; }
  html { scroll-behavior:smooth; }

  :root {
    --black:    #0A0A0A;
    --char:     #141414;
    --char-2:   #1C1C1C;
    --char-3:   #282828;
    --gold:     #C9A96E;
    --gold-2:   #D4B87A;
    --gold-dk:  #A88B55;
    --cream:    #F5F0E8;
    --taupe:    #8A8279;
    --warm:     #E8E0D4;
    --line:     rgba(201,169,110,0.12);
    --line-2:   rgba(201,169,110,0.25);
    --line-cr:  rgba(245,240,232,0.1);
  }

  body { background:var(--black); color:var(--cream); font-family:'Inter',sans-serif; overflow-x:hidden; }
  a    { text-decoration:none; color:inherit; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:var(--black); }
  ::-webkit-scrollbar-thumb { background:var(--gold); border-radius:2px; }

  .cg { font-family:'Cormorant Garamond',serif; }

  /* Gold gradient text */
  .gold-txt {
    background:linear-gradient(135deg,var(--gold) 0%,var(--gold-2) 50%,var(--gold-dk) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  /* Film grain */
  .grain {
    position:fixed; inset:0; pointer-events:none; z-index:9999; opacity:0.025;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin     { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes revealUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }

  .fu   { animation:fadeUp 1s ease-out both; }
  .fu1  { animation-delay:0.2s; }
  .fu2  { animation-delay:0.4s; }
  .fu3  { animation-delay:0.6s; }
  .fi   { animation:fadeIn 1.2s ease-out both; }
  .anim-check { animation:check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* SCROLL REVEAL */
  .sr { opacity:0; transform:translateY(30px); transition:opacity 0.8s ease-out,transform 0.8s ease-out; }
  .sr.vis { opacity:1; transform:translateY(0); }

  /* CARD */
  .p-card {
    cursor:pointer; overflow:hidden; position:relative; background:var(--char-2);
    transition:transform 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  .p-card:hover { transform:translateY(-8px); }
  .p-card:hover .c-img img { transform:scale(1.06); }
  .c-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.7s cubic-bezier(0.4,0,0.2,1); }
  .p-card:hover .card-cta { opacity:1; transform:translateY(0); }
  .card-cta { opacity:0; transform:translateY(12px); transition:all 0.5s ease; }

  /* Collection card */
  .col-card { position:relative; overflow:hidden; cursor:pointer; }
  .col-card::before { content:''; position:absolute; inset:0; background:linear-gradient(to top,rgba(10,10,10,0.9) 0%,rgba(10,10,10,0.35) 50%,transparent 100%); z-index:1; }
  .col-card:hover img { transform:scale(1.06); }
  .col-card img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.7s cubic-bezier(0.4,0,0.2,1); }

  /* BUTTONS */
  .btn-gold {
    position:relative; overflow:hidden;
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--gold); color:var(--black);
    font-family:'Inter',sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.2em; text-transform:uppercase;
    padding:14px 32px; border:none; cursor:pointer;
    transition:background 0.3s;
  }
  .btn-gold:hover { background:var(--gold-2); }
  .btn-gold::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent); transition:left 0.6s ease; }
  .btn-gold:hover::before { left:100%; }
  .btn-gold:disabled { opacity:0.5; cursor:not-allowed; }

  .btn-ghost {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:transparent; color:var(--cream);
    border:1px solid rgba(245,240,232,0.25);
    font-family:'Inter',sans-serif; font-size:11px; font-weight:500;
    letter-spacing:0.2em; text-transform:uppercase;
    padding:14px 32px; cursor:pointer; transition:all 0.3s;
  }
  .btn-ghost:hover { border-color:var(--gold); color:var(--gold); }

  .btn-cream {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--cream); color:var(--black);
    font-family:'Inter',sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.2em; text-transform:uppercase;
    padding:14px 32px; border:none; cursor:pointer; transition:all 0.3s;
  }
  .btn-cream:hover { background:var(--gold); }
  .btn-cream:disabled { opacity:0.5; cursor:not-allowed; }

  /* INPUTS */
  .inp {
    width:100%; padding:12px 14px;
    background:var(--char-3); border:1px solid var(--line-2);
    font-family:'Inter',sans-serif; font-size:13px; color:var(--cream);
    outline:none; transition:border-color 0.25s;
  }
  .inp:focus { border-color:var(--gold); }
  .inp::placeholder { color:var(--taupe); }
  .inp-err { border-color:#9B2335!important; }
  select.inp { appearance:none; cursor:pointer; }
  option { background:var(--char-3); color:var(--cream); }

  /* GRIDS */
  .col-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .prod-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .footer-g   { display:grid; grid-template-columns:1.6fr 1fr 1fr; gap:56px; }
  .details-g  { display:grid; grid-template-columns:1fr 1fr; gap:0; }
  .details-L  { position:sticky; top:0; height:100vh; overflow:hidden; }
  .details-R  { padding:56px 52px 80px; }
  .form-2c    { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .dlv-2c     { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .cart-g     { display:grid; grid-template-columns:1.3fr 1fr; gap:28px; align-items:start; }
  .contact-g  { display:grid; grid-template-columns:1fr 1fr; gap:56px; }
  .pagination { display:flex; justify-content:center; gap:4px; margin-top:56px; flex-wrap:wrap; }
  .cart-btns  { display:flex; gap:8px; }

  @media (max-width:1100px) {
    .col-grid   { grid-template-columns:repeat(2,1fr); }
    .prod-grid  { grid-template-columns:repeat(3,1fr); }
    .footer-g   { grid-template-columns:1fr 1fr; gap:36px; }
    .details-g  { grid-template-columns:1fr; }
    .details-L  { position:static; height:auto; aspect-ratio:3/4; }
    .details-R  { padding:32px 24px 56px; }
  }
  @media (max-width:768px) {
    .col-grid   { grid-template-columns:1fr; }
    .prod-grid  { grid-template-columns:repeat(2,1fr); gap:10px; }
    .footer-g   { grid-template-columns:1fr 1fr; gap:28px; }
    .cart-g     { grid-template-columns:1fr; }
    .contact-g  { grid-template-columns:1fr; }
    .cart-btns  { flex-direction:column; }
  }
  @media (max-width:480px) {
    .prod-grid { grid-template-columns:repeat(2,1fr); }
    .footer-g  { grid-template-columns:1fr; }
    .form-2c   { grid-template-columns:1fr; }
    .dlv-2c    { grid-template-columns:1fr; }
  }
`;

/* ─── TYPES ─── */
interface Offer     { id:string; name:string; quantity:number; price:number; }
interface Variant   { id:string; name:string; value:string; }
interface Attribute { id:string; type:string; name:string; displayMode?:'color'|'image'|'text'|null; variants:Variant[]; }
interface ProductImage          { id:string; imageUrl:string; }
interface VariantAttributeEntry { attrId:string; attrName:string; displayMode:'color'|'image'|'text'; value:string; }
interface VariantDetail         { id:string|number; name:VariantAttributeEntry[]; price:number; stock:number; autoGenerate:boolean; }
interface Wilaya  { id:string; name:string; ar_name:string; livraisonHome:number; livraisonOfice:number; livraisonReturn:number; }
interface Commune { id:string; name:string; ar_name:string; wilayaId:string; }
export interface Product {
  id:string; name:string; price:string|number; priceOriginal?:string|number; desc?:string;
  productImage?:string; imagesProduct?:ProductImage[]; offers?:Offer[]; attributes?:Attribute[];
  variantDetails?:VariantDetail[]; stock?:number; isActive?:boolean;
  store:{ id:string; name:string; subdomain:string; userId:string; cart?:boolean; };
}
export interface ProductFormProps {
  product:Product; userId:string; domain:string; redirectPath?:string;
  selectedOffer:string|null; setSelectedOffer:(id:string|null)=>void;
  selectedVariants:Record<string,string>; platform?:string; priceLoss?:number;
}

const vm = (d:VariantDetail, s:Record<string,string>) =>
  Object.entries(s).every(([n,v])=>d.name.some(e=>e.attrName===n&&e.value===v));
const fetchWilayas  = async (uid:string): Promise<Wilaya[]>  => { try { const {data}=await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }};
const fetchCommunes = async (wid:string): Promise<Commune[]> => { try { const {data}=await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }};

const INP = (err?:boolean): React.CSSProperties => ({
  width:'100%', padding:'12px 14px', background:'var(--char-3)',
  border:`1px solid ${err?'#9B2335':'var(--line-2)'}`,
  fontFamily:"'Inter',sans-serif", fontSize:'13px', color:'var(--cream)',
  outline:'none', transition:'border-color 0.25s', appearance:'none',
});

const FR = ({ error, label, children }: { error?:string; label?:string; children:React.ReactNode }) => (
  <div style={{marginBottom:'14px'}}>
    {label && <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--taupe)',marginBottom:'7px'}}>{label}</p>}
    {children}
    {error && <p style={{fontSize:'11px',color:'#EF4444',marginTop:'5px',display:'flex',alignItems:'center',gap:4}}>
      <AlertCircle style={{width:'11px',height:'11px'}}/>{error}
    </p>}
  </div>
);

/* Scroll reveal hook */
function useScrollReveal() {
  useEffect(()=>{
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('vis'); });
    },{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
    document.querySelectorAll('.sr').forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  },[]);
}

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  return (
    <div style={{minHeight:'100vh',backgroundColor:'var(--black)',fontFamily:"'Inter',sans-serif"}}>
      <style>{CSS}</style>
      <div className="grain"/>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{background:'var(--char-2)',borderBottom:'1px solid var(--line)',textAlign:'center',padding:'8px 16px',fontSize:'10px',fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--taupe)'}}>
          {store.topBar.text}
        </div>
      )}
      <Navbar store={store} domain={domain}/>
      <main>{children}</main>
      <Footer store={store}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store:any; domain:string }) {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sq, setSq]             = useState('');
  const [ls, setLs]             = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [showS, setShowS]       = useState(false);
  const router    = useRouter();
  const count     = useCartStore(s=>s.count);
  const initCount = useCartStore(s=>s.initCount);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>50);
    window.addEventListener('scroll',h,{passive:true}); return ()=>window.removeEventListener('scroll',h);
  },[]);
  useEffect(()=>{
    if(typeof window!=='undefined'&&domain){
      try { initCount(JSON.parse(localStorage.getItem(domain)||'[]').length); } catch { initCount(0); }
    }
  },[domain,initCount]);
  useEffect(()=>{
    if(sq.length<2){setLs([]);return;}
    const t=setTimeout(async()=>{
      setLoading(true);
      try { const {data}=await axios.get(`${API_URL}/products/public/${domain}`,{params:{search:sq}}); setLs(data.products||[]); }
      catch {} finally { setLoading(false); }
    },400);
    return ()=>clearTimeout(t);
  },[sq,domain]);
  const doSearch=(e?:React.FormEvent)=>{ if(e) e.preventDefault(); if(sq.trim()){ router.push(`/?search=${encodeURIComponent(sq)}`); setSq(''); setShowS(false); }};

  const Drop=()=>(
    <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,left:0,background:'var(--char-2)',border:'1px solid var(--line-2)',borderTop:'2px solid var(--gold)',boxShadow:'0 16px 48px rgba(0,0,0,0.6)',zIndex:200,overflow:'hidden'}}>
      {loading ? <div style={{padding:'1rem',textAlign:'center',fontSize:'11px',letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--gold)'}}>جاري البحث...</div>
      : ls.length>0 ? ls.map((p:any)=>(
        <Link href={`/product/${p.id}`} key={p.id} onClick={()=>setSq('')}
          style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderBottom:'1px solid var(--line)',transition:'background 0.2s'}}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--char-3)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
          <div style={{width:44,height:56,flexShrink:0,overflow:'hidden',background:'var(--char-3)'}}>
            <img src={p.productImage||p.imagesProduct?.[0]?.imageUrl} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt=""/>
          </div>
          <div>
            <div className="cg" style={{fontSize:'1rem',fontWeight:400,color:'var(--cream)'}}>{p.name}</div>
            <div style={{fontSize:'11px',color:'var(--gold)',letterSpacing:'0.08em'}}>{p.price} دج</div>
          </div>
        </Link>
      )) : sq.length>=2 && <div style={{padding:'1rem',textAlign:'center',fontSize:'11px',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--taupe)'}}>لا توجد نتائج</div>}
    </div>
  );

  return (
    <nav dir="rtl" style={{
      position:'fixed',top:0,left:0,right:0,zIndex:100,
      background:scrolled?'rgba(10,10,10,0.9)':'transparent',
      backdropFilter:scrolled?'blur(16px)':'none',
      borderBottom:scrolled?'1px solid var(--line)':'none',
      transition:'all 0.5s',
    }}>
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 32px'}}>
        <div style={{height:'80px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'24px'}}>

          {/* Logo */}
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
            {store?.design?.logoUrl
              ? <img src={store.design.logoUrl} alt={store?.name} style={{height:'36px',width:'auto',objectFit:'contain'}}/>
              : <>
                  <div style={{width:38,height:38,border:'1px solid rgba(201,169,110,0.4)',display:'flex',alignItems:'center',justifyContent:'center',transition:'border-color 0.3s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--gold)';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(201,169,110,0.4)';}}>
                    <span className="cg" style={{fontSize:'1.2rem',fontWeight:600,color:'var(--gold)'}}>L</span>
                  </div>
                  <span className="cg" style={{fontSize:'1.2rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--cream)'}}>{store?.name}</span>
                </>
            }
          </Link>

          {/* Links */}
          <div style={{display:'flex',alignItems:'center',gap:'40px'}}>
            {[{h:'/',l:'الرئيسية'},{h:'/contact',l:'تواصل'},{h:'/Privacy',l:'الخصوصية'}].map(lnk=>(
              <Link key={lnk.h} href={lnk.h} style={{fontSize:'11px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'rgba(245,240,232,0.65)',transition:'color 0.3s',position:'relative'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--cream)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(245,240,232,0.65)';}}>
                {lnk.l}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
            <button onClick={()=>setShowS(!showS)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(245,240,232,0.55)',padding:'5px',display:'flex',transition:'color 0.3s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(245,240,232,0.55)';}}>
              <Search style={{width:'17px',height:'17px'}}/>
            </button>

            <Link href="/cart" style={{position:'relative',color:'rgba(245,240,232,0.55)',display:'flex',padding:'5px',transition:'color 0.3s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(245,240,232,0.55)';}}>
              <ShoppingBag style={{width:'17px',height:'17px'}}/>
              {count>0 && <span style={{position:'absolute',top:-2,right:-2,width:'14px',height:'14px',background:'var(--gold)',color:'var(--black)',fontSize:'8px',fontWeight:700,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>{count}</span>}
            </Link>

            <button onClick={()=>setOpen(p=>!p)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',gap:'5px',padding:'5px',color:'var(--cream)'}}>
              <span style={{display:'block',width:'22px',height:'1px',background:'currentColor',transition:'all 0.35s',transform:open?'rotate(45deg) translate(4px,4px)':'none'}}/>
              <span style={{display:'block',width:'22px',height:'1px',background:'currentColor',transition:'all 0.35s',opacity:open?0:1}}/>
              <span style={{display:'block',width:'22px',height:'1px',background:'currentColor',transition:'all 0.35s',transform:open?'rotate(-45deg) translate(4px,-4px)':'none'}}/>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      {showS && (
        <div style={{background:'rgba(20,20,20,0.97)',backdropFilter:'blur(16px)',borderTop:'1px solid var(--line)',padding:'14px 32px',position:'relative'}}>
          <div style={{maxWidth:520,margin:'0 auto',position:'relative'}}>
            <form onSubmit={doSearch}>
              <Search style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',width:'14px',height:'14px',color:'var(--taupe)'}}/>
              <input autoFocus type="text" placeholder="ابحث عن حذاء..." value={sq} onChange={e=>setSq(e.target.value)}
                style={{...INP(),paddingRight:'36px'}}
                onFocus={e=>{e.target.style.borderColor='var(--gold)';}} onBlur={e=>{e.target.style.borderColor='var(--line-2)';}}/>
            </form>
            {sq.length>=2 && <Drop/>}
          </div>
        </div>
      )}

      {/* Mobile */}
      <div style={{maxHeight:open?'260px':'0',overflow:'hidden',transition:'max-height 0.4s ease',background:'rgba(20,20,20,0.97)',backdropFilter:'blur(16px)',borderTop:open?'1px solid var(--line)':'none'}}>
        <div style={{padding:'16px 32px 24px',display:'flex',flexDirection:'column',gap:'20px'}}>
          {[{h:'/',l:'الرئيسية'},{h:'/contact',l:'تواصل'},{h:'/Privacy',l:'الخصوصية'},{h:'/cart',l:'السلة'}].map(lnk=>(
            <Link key={lnk.h} href={lnk.h} onClick={()=>setOpen(false)}
              style={{fontSize:'12px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'rgba(245,240,232,0.55)',transition:'color 0.3s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(245,240,232,0.55)';}}>
              {lnk.l}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — 3 أقسام
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  const yr = new Date().getFullYear();
  return (
    <footer dir="rtl" style={{background:'var(--char)',borderTop:'1px solid var(--line)',fontFamily:"'Inter',sans-serif"}}>
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'64px 32px 36px'}}>
        <div className="footer-g" style={{paddingBottom:'48px',borderBottom:'1px solid var(--line)'}}>

          {/* قسم 1 */}
          <div>
            <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
              {store?.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store?.name} style={{height:'28px',opacity:0.55}}/>
                : <>
                    <div style={{width:32,height:32,border:'1px solid rgba(201,169,110,0.35)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span className="cg" style={{fontSize:'1rem',fontWeight:600,color:'var(--gold)'}}>L</span>
                    </div>
                    <span className="cg" style={{fontSize:'1.1rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'rgba(245,240,232,0.55)'}}>{store?.name}</span>
                  </>
              }
            </Link>
            <p style={{fontSize:'13px',lineHeight:'1.85',color:'rgba(245,240,232,0.3)',maxWidth:'260px',marginBottom:'24px',fontWeight:300}}>
              {store?.hero?.subtitle?.substring(0,90)||'أحذية جلدية فاخرة مصنوعة يدوياً. جودة لا تُضاهى لكل مناسبة رسمية.'}
            </p>
            {/* Gold line */}
            <div style={{width:32,height:'1px',background:'var(--gold)',marginBottom:'20px'}}/>
            <p style={{fontSize:'10px',letterSpacing:'0.14em',color:'rgba(245,240,232,0.18)'}}>© {yr} {store?.name}. جميع الحقوق محفوظة.</p>
          </div>

          {/* قسم 2 — روابط */}
          <div>
            <p style={{fontSize:'9px',fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:'24px'}}>روابط</p>
            {[{h:'/',l:'الرئيسية'},{h:'/cart',l:'السلة'},{h:'/contact',l:'تواصل'},{h:'/Privacy',l:'الخصوصية'},{h:'/Terms',l:'الشروط'},{h:'/Cookies',l:'الكوكيز'}].map(lnk=>(
              <a key={lnk.h} href={lnk.h} style={{display:'block',fontSize:'12px',letterSpacing:'0.08em',color:'rgba(245,240,232,0.3)',marginBottom:'10px',transition:'all 0.3s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color='var(--gold)';el.style.paddingRight='6px';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color='rgba(245,240,232,0.3)';el.style.paddingRight='0';}}>
                {lnk.l}
              </a>
            ))}
          </div>

          {/* قسم 3 — تواصل */}
          <div>
            <p style={{fontSize:'9px',fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:'24px'}}>تواصل</p>
            {[
              {icon:'📞',val:store?.contact?.phone},
              {icon:'✉️',val:store?.contact?.email},
              {icon:'📍',val:store?.contact?.wilaya},
            ].filter(r=>r.val).map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                <span style={{fontSize:'12px',opacity:0.45}}>{item.icon}</span>
                <span style={{fontSize:'12px',color:'rgba(245,240,232,0.3)',letterSpacing:'0.04em'}}>{item.val}</span>
              </div>
            ))}
            <div style={{marginTop:'20px',paddingTop:'20px',borderTop:'1px solid var(--line)'}}>
              <p style={{fontSize:'9px',letterSpacing:'0.22em',textTransform:'uppercase',color:'rgba(245,240,232,0.12)'}}>Luxe Forma Dark Theme</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   CARD
══════════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, viewDetails }: any) {
  const price = typeof product.price==='string' ? parseFloat(product.price) : product.price;
  const orig  = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="p-card">
      <div className="c-img" style={{position:'relative',aspectRatio:'3/4',overflow:'hidden',background:'var(--char-2)'}}>
        {displayImage
          ? <img src={displayImage} alt={product.name}/>
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Package style={{width:'40px',height:'40px',color:'var(--taupe)',opacity:0.3}}/>
            </div>
        }
        {discount>0 && (
          <div style={{position:'absolute',top:12,right:12,background:'var(--gold)',color:'var(--black)',fontSize:'10px',fontWeight:600,letterSpacing:'0.1em',padding:'4px 10px',textTransform:'uppercase'}}>
            −{discount}%
          </div>
        )}
        {/* Hover overlay */}
        <div style={{position:'absolute',inset:0,background:'rgba(10,10,10,0)',transition:'background 0.5s',display:'flex',alignItems:'center',justifyContent:'center'}}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(10,10,10,0.45)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(10,10,10,0)';}}>
          <div className="card-cta" style={{position:'absolute'}}>
            <Link href={`/product/${product.slug||product.id}`}
              style={{display:'block',padding:'11px 24px',background:'var(--cream)',color:'var(--black)',fontSize:'10px',fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',transition:'background 0.3s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--gold)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='var(--cream)';}}>
              {viewDetails||'عرض'}
            </Link>
          </div>
        </div>
      </div>
      <div style={{padding:'16px 4px 4px'}}>
        <h3 className="cg" style={{fontSize:'1.1rem',fontWeight:400,color:'var(--cream)',marginBottom:'4px',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical' as any,overflow:'hidden'}}>
          {product.name}
        </h3>
        <p style={{fontSize:'11px',color:'var(--taupe)',marginBottom:'8px',letterSpacing:'0.04em',fontWeight:300}}>جلد طبيعي</p>
        <div style={{display:'flex',alignItems:'baseline',gap:'10px'}}>
          <span className="cg gold-txt" style={{fontSize:'1.2rem',fontWeight:300}}>{price.toLocaleString()} دج</span>
          {orig>price && <span style={{fontSize:'11px',color:'var(--taupe)',textDecoration:'line-through'}}>{orig.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  useScrollReveal();
  const products: any[] = store.products||[];
  const cats: any[]     = store.categories||[];
  if(!page) page=1;
  const countPage = Math.ceil((store.count||products.length)/48);

  /* Marquee items */
  const marqueeItems = ['أحذية مصنوعة يدوياً','جلد طبيعي أصيل','خياطة بليك','تشطيب يدوي','تصميم خالد'];

  return (
    <div dir="rtl">

      {/* ── HERO ── */}
      <section style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',background:'var(--black)'}}>
        {store.hero?.imageUrl && (
          <>
            <img src={store.hero.imageUrl} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block',transform:'scale(1.05)',animation:'scaleIn 1.5s ease-out both'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(10,10,10,0.3) 0%,rgba(10,10,10,0.65) 60%,rgba(10,10,10,1) 100%)'}}/>
          </>
        )}
        {!store.hero?.imageUrl && (
          <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 60% 40%,rgba(201,169,110,0.06) 0%,transparent 65%)'}}/>
        )}

        {/* Decorative vertical lines */}
        <div style={{position:'absolute',top:'25%',right:40,width:'1px',height:'120px',background:'linear-gradient(to bottom,transparent,rgba(201,169,110,0.35),transparent)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'25%',left:40,width:'1px',height:'120px',background:'linear-gradient(to bottom,transparent,rgba(201,169,110,0.35),transparent)',pointerEvents:'none'}}/>

        <div style={{position:'relative',zIndex:2,textAlign:'center',maxWidth:'860px',padding:'0 24px'}}>
          <p className="fu" style={{fontSize:'11px',fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:'24px'}}>
            أحذية رسمية فاخرة
          </p>

          <h1 className="fu fu1 cg" style={{fontSize:'clamp(3rem,7vw,7rem)',fontWeight:300,lineHeight:0.95,marginBottom:'28px',letterSpacing:'-0.01em'}}>
            <span style={{display:'block',color:'var(--cream)'}}
              dangerouslySetInnerHTML={{__html:store.hero?.title||'حيث الأناقة<br/>تلتقي الدقة'}}>
            </span>
          </h1>

          <p className="fu fu2" style={{fontSize:'15px',color:'rgba(245,240,232,0.5)',fontWeight:200,maxWidth:'420px',margin:'0 auto 44px',lineHeight:'1.8',letterSpacing:'0.04em'}}>
            {store.hero?.subtitle||'أحذية جلدية مصنوعة يدوياً للرجل المميز. كل زوج يحمل قصة تقليد وفن وجودة لا تُجارى.'}
          </p>

          <div className="fu fu3" style={{display:'flex',gap:'14px',justifyContent:'center',flexWrap:'wrap'}}>
            <a href="#products" className="btn-gold" style={{padding:'15px 44px'}}>اكتشف المجموعة</a>
            <a href="#categories" className="btn-ghost" style={{padding:'15px 36px'}}>حرفتنا</a>
          </div>
        </div>

        {/* Scroll */}
        <div className="fi" style={{position:'absolute',bottom:36,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:8,animation:'fadeIn 1.5s 1.2s both'}}>
          <span style={{fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'rgba(245,240,232,0.35)'}}>scroll</span>
          <div style={{width:'1px',height:'40px',background:'linear-gradient(to bottom,rgba(201,169,110,0.5),transparent)'}}/>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{borderTop:'1px solid var(--line)',borderBottom:'1px solid var(--line)',padding:'14px 0',overflow:'hidden',background:'var(--char)'}}>
        <div style={{display:'inline-flex',whiteSpace:'nowrap',animation:'marquee 28s linear infinite'}}>
          {[...marqueeItems,...marqueeItems].map((item,i)=>(
            <React.Fragment key={i}>
              <span style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.35em',textTransform:'uppercase',color:'rgba(138,130,121,0.45)',margin:'0 24px'}}>{item}</span>
              <span style={{color:'rgba(201,169,110,0.35)',margin:'0 8px'}}>◆</span>
            </React.Fragment>
          ))}
          {[...marqueeItems,...marqueeItems].map((item,i)=>(
            <React.Fragment key={`b${i}`}>
              <span style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.35em',textTransform:'uppercase',color:'rgba(138,130,121,0.45)',margin:'0 24px'}}>{item}</span>
              <span style={{color:'rgba(201,169,110,0.35)',margin:'0 8px'}}>◆</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length>0 && (
        <section id="categories" style={{padding:'96px 0',background:'var(--black)'}}>
          <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 32px'}}>
            <div className="sr" style={{textAlign:'center',marginBottom:'64px'}}>
              <p style={{fontSize:'11px',fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:'14px'}}>مجموعاتنا</p>
              <h2 className="cg" style={{fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:300,color:'var(--cream)',lineHeight:1.05}}>
                التصنيفات <em style={{color:'var(--gold)'}}>المختارة</em>
              </h2>
            </div>
            <div className="col-grid">
              {cats.slice(0,3).map((cat:any,i:number)=>(
                <Link key={cat.id} href={`?category=${cat.id}`} className="col-card sr"
                  style={{height:'520px',display:'block',transitionDelay:`${i*0.1}s`}}>
                  {cat.imageUrl
                    ? <img src={cat.imageUrl} alt={cat.name}/>
                    : <div style={{width:'100%',height:'100%',background:'var(--char-2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <Package style={{width:'48px',height:'48px',color:'var(--taupe)',opacity:0.3}}/>
                      </div>
                  }
                  <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'32px',zIndex:2}}>
                    <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.28em',textTransform:'uppercase',color:'var(--gold)',marginBottom:'8px'}}>المجموعة</p>
                    <h3 className="cg" style={{fontSize:'1.8rem',fontWeight:300,color:'var(--cream)',marginBottom:'16px'}}>{cat.name}</h3>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'11px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--gold)',transition:'gap 0.3s'}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.gap='14px';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.gap='8px';}}>
                      <span>اكتشف</span>
                      <ArrowLeft style={{width:'14px',height:'14px'}}/>
                    </div>
                    {/* Gold line */}
                    <div style={{height:'1px',background:'rgba(201,169,110,0.5)',marginTop:'16px',width:0,transition:'width 0.6s ease'}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.width='100%';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.width='0';}}/>
                  </div>
                </Link>
              ))}
              {/* Extra category chips for 4+ */}
              {cats.length>3 && (
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'8px',gridColumn:'1/-1'}}>
                  {cats.slice(3,8).map((cat:any)=>(
                    <Link key={cat.id} href={`?category=${cat.id}`}
                      style={{padding:'10px 22px',border:'1px solid var(--line-2)',fontSize:'11px',fontWeight:500,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--taupe)',transition:'all 0.3s'}}
                      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--gold)';el.style.color='var(--gold)';}}
                      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--line-2)';el.style.color='var(--taupe)';}}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── CRAFTSMANSHIP BAND ── */}
      <div style={{background:'var(--char)',borderTop:'1px solid var(--line)',borderBottom:'1px solid var(--line)',padding:'72px 32px'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',display:'flex',gap:'64px',justifyContent:'center',flexWrap:'wrap',textAlign:'center'}}>
          {[{n:'37',l:'حرفياً متخصصاً'},{n:'200+',l:'خطوة لكل زوج'},{n:'48H',l:'تلميع يدوي'}].map((s,i)=>(
            <div key={i} className="sr" style={{transitionDelay:`${i*0.12}s`}}>
              <p className="cg gold-txt" style={{fontSize:'2.8rem',fontWeight:300,lineHeight:1,marginBottom:8}}>{s.n}</p>
              <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.22em',textTransform:'uppercase',color:'rgba(245,240,232,0.3)'}}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <section id="products" style={{padding:'96px 0',background:'var(--black)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 32px'}}>
          <div className="sr" style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'56px',flexWrap:'wrap',gap:16}}>
            <div>
              <p style={{fontSize:'11px',fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:'14px'}}>هذا الموسم</p>
              <h2 className="cg" style={{fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:300,color:'var(--cream)',lineHeight:1.05}}>
                القطع <em style={{color:'var(--gold)'}}>المميزة</em>
              </h2>
            </div>
            <span style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--taupe)',padding:'8px 18px',border:'1px solid var(--line)'}}>{products.length} قطعة</span>
          </div>

          {products.length===0 ? (
            <div style={{padding:'100px 0',textAlign:'center',border:'1px solid var(--line)'}}>
              <p className="cg" style={{fontSize:'2rem',fontWeight:300,color:'var(--taupe)',marginBottom:8}}>المجموعة قادمة قريباً</p>
              <p style={{fontSize:'10px',letterSpacing:'0.2em',textTransform:'uppercase',color:'rgba(138,130,121,0.5)'}}>نحن نعمل على ذلك</p>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((p:any,i:number)=>{
                const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal?Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100):0;
                return (
                  <div key={p.id} className="sr" style={{transitionDelay:`${(i%4)*0.08}s`}}>
                    <Card product={p} displayImage={img} discount={disc} viewDetails="عرض التفاصيل"/>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {countPage>1 && (
            <div className="pagination" dir="rtl">
              <Link href={{query:{page:Math.max(1,page-1)}}} scroll={false}
                style={{width:42,height:42,border:'1px solid var(--line-2)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--taupe)',opacity:page<=1?0.3:1,transition:'all 0.3s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--gold)';(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--line-2)';(e.currentTarget as HTMLElement).style.color='var(--taupe)';}}>‹</Link>
              {Array.from({length:countPage}).map((_,i)=>{
                const pn=i+1; const isA=Number(page)===pn;
                return (
                  <Link key={pn} href={{query:{page:pn}}} scroll={false}
                    style={{width:42,height:42,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:isA?500:400,letterSpacing:'0.08em',border:`1px solid ${isA?'var(--gold)':'var(--line-2)'}`,background:isA?'var(--gold)':'transparent',color:isA?'var(--black)':'var(--taupe)',transition:'all 0.3s'}}>
                    {pn}
                  </Link>
                );
              })}
              <Link href={{query:{page:Math.min(countPage,Number(page)+1)}}} scroll={false}
                style={{width:42,height:42,border:'1px solid var(--line-2)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--taupe)',opacity:page>=countPage?0.3:1,transition:'all 0.3s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--gold)';(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--line-2)';(e.currentTarget as HTMLElement).style.color='var(--taupe)';}}>›</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETAILS
══════════════════════════════════════════════════════════════ */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  if(!product) return null;
  return (
    <div dir="rtl" style={{background:'var(--black)',minHeight:'100vh'}}>
      {/* Breadcrumb */}
      <div style={{background:'var(--char)',borderBottom:'1px solid var(--line)',padding:'12px 32px',marginTop:'80px'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',display:'flex',alignItems:'center',gap:'8px',fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--taupe)'}}>
          <Link href="/" style={{color:'var(--gold)',transition:'opacity 0.2s'}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.opacity='0.7';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.opacity='1';}}>الرئيسية</Link>
          <span style={{color:'var(--line-2)'}}>/</span>
          <span style={{color:'var(--cream)',maxWidth:'220px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{product.name}</span>
          <span style={{marginRight:'auto',padding:'4px 14px',background:inStock||autoGen?'var(--gold)':'transparent',color:inStock||autoGen?'var(--black)':'var(--taupe)',border:inStock||autoGen?'none':'1px solid var(--line-2)',fontSize:'9px',fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase'}}>
            {autoGen?'متوفر دائماً':inStock?'متوفر':'نفد'}
          </span>
        </div>
      </div>

      <div className="details-g" style={{maxWidth:'1280px',margin:'0 auto'}}>
        {/* Gallery */}
        <div className="details-L" style={{background:'var(--char-2)'}}>
          <div style={{position:'relative',aspectRatio:'3/4',overflow:'hidden',height:'100%'}}>
            {allImages.length>0
              ? <img src={allImages[sel]} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'transform 0.7s ease'}}/>
              : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Package style={{width:'56px',height:'56px',color:'var(--taupe)',opacity:0.2}}/>
                </div>
            }
            {/* Gold top bar */}
            <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(to right,var(--gold),var(--gold-dk))'}}/>
            {discount>0 && <div style={{position:'absolute',top:16,right:16,background:'var(--gold)',color:'var(--black)',fontSize:'10px',fontWeight:600,letterSpacing:'0.1em',padding:'5px 12px',textTransform:'uppercase'}}>−{discount}%</div>}
            <button onClick={toggleWishlist} style={{position:'absolute',top:16,left:16,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',background:isWishlisted?'var(--gold)':'rgba(10,10,10,0.6)',border:'none',cursor:'pointer',color:isWishlisted?'var(--black)':'var(--cream)',transition:'all 0.3s'}}>
              <Heart style={{width:'14px',height:'14px',fill:isWishlisted?'currentColor':'none'}}/>
            </button>
            {allImages.length>1 && (
              <>
                <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',width:36,height:36,background:'rgba(10,10,10,0.7)',border:'1px solid var(--line)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--cream)',opacity:0,transition:'opacity 0.3s'}}
                  onMouseEnter={e=>{(e.currentTarget.parentElement as HTMLElement).querySelector('.gal-btn-r')?.classList.add('show');}}
                  className="gal-btn-r">
                  <ChevronRight style={{width:'14px',height:'14px'}}/>
                </button>
                <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:36,height:36,background:'rgba(10,10,10,0.7)',border:'1px solid var(--line)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--cream)',opacity:0,transition:'opacity 0.3s'}}
                  className="gal-btn-l">
                  <ChevronLeft style={{width:'14px',height:'14px'}}/>
                </button>
              </>
            )}
            {!inStock&&!autoGen && (
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(10,10,10,0.8)',backdropFilter:'blur(6px)'}}>
                <div style={{background:'var(--char-2)',border:'1px solid var(--line-2)',padding:'12px 28px',fontSize:'11px',fontWeight:500,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--taupe)'}}>
                  نفذت الكمية
                </div>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {allImages.length>1 && (
            <div style={{display:'flex',gap:'6px',padding:'8px',flexWrap:'wrap',background:'var(--char)'}}>
              {allImages.slice(0,5).map((img:string,idx:number)=>(
                <button key={idx} onClick={()=>setSel(idx)} style={{width:'54px',height:'68px',overflow:'hidden',border:`1.5px solid ${sel===idx?'var(--gold)':'transparent'}`,cursor:'pointer',padding:0,background:'none',opacity:sel===idx?1:0.45,transition:'all 0.3s'}}>
                  <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="details-R" style={{background:'var(--black)'}}>
          {/* Label */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <div style={{width:20,height:'1px',background:'var(--gold)'}}/>
            <span style={{fontSize:'9px',fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--gold)'}}>أحذية جلدية فاخرة</span>
          </div>

          <h1 className="cg" style={{fontSize:'clamp(1.8rem,3.5vw,3rem)',fontWeight:300,color:'var(--cream)',letterSpacing:'-0.01em',lineHeight:1.1,marginBottom:16}}>
            {product.name}
          </h1>

          <div style={{display:'flex',gap:'2px',marginBottom:28}}>
            {[...Array(5)].map((_,i)=><Star key={i} style={{width:'13px',height:'13px',fill:i<4?'var(--gold)':'none',color:'var(--gold)'}}/>)}
          </div>

          {/* Price */}
          <div style={{borderTop:'1px solid var(--line)',borderBottom:'1px solid var(--line)',padding:'20px 0',marginBottom:28}}>
            <div style={{display:'flex',alignItems:'baseline',gap:14,flexWrap:'wrap'}}>
              <span className="cg gold-txt" style={{fontSize:'2.8rem',fontWeight:300,lineHeight:1}}>{finalPrice.toLocaleString()}</span>
              <span style={{fontSize:'14px',color:'var(--taupe)',letterSpacing:'0.08em'}}>دج</span>
              {product.priceOriginal&&parseFloat(product.priceOriginal)>finalPrice && (
                <div>
                  <span style={{fontSize:'13px',color:'var(--taupe)',textDecoration:'line-through'}}>{parseFloat(product.priceOriginal).toLocaleString()} دج</span>
                  <p style={{fontSize:'11px',color:'rgba(201,169,110,0.7)',marginTop:2,letterSpacing:'0.04em'}}>وفّر {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج</p>
                </div>
              )}
            </div>
          </div>

          {/* Offers */}
          {product.offers?.length>0 && (
            <div style={{marginBottom:24,paddingBottom:24,borderBottom:'1px solid var(--line)'}}>
              <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--taupe)',marginBottom:12}}>الباقات المتاحة</p>
              {product.offers.map((o:any)=>(
                <label key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',border:`1px solid ${selectedOffer===o.id?'var(--gold)':'var(--line-2)'}`,cursor:'pointer',marginBottom:8,background:selectedOffer===o.id?'rgba(201,169,110,0.06)':'transparent',transition:'all 0.3s'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:14,height:14,border:`1px solid ${selectedOffer===o.id?'var(--gold)':'var(--taupe)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {selectedOffer===o.id && <div style={{width:6,height:6,background:'var(--gold)'}}/>}
                    </div>
                    <input type="radio" name="offer" checked={selectedOffer===o.id} onChange={()=>setSelectedOffer(o.id)} style={{display:'none'}}/>
                    <div>
                      <p style={{fontSize:'13px',fontWeight:400,color:'var(--cream)',margin:0}}>{o.name}</p>
                      <p style={{fontSize:'11px',color:'var(--taupe)',margin:0}}>{o.quantity} قطع</p>
                    </div>
                  </div>
                  <span className="cg gold-txt" style={{fontSize:'1.2rem',fontWeight:300}}>{o.price.toLocaleString()} دج</span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{marginBottom:20,paddingBottom:20,borderBottom:'1px solid var(--line)'}}>
              <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--taupe)',marginBottom:12}}>{attr.name}</p>
              {attr.displayMode==='color' ? (
                <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{width:28,height:28,backgroundColor:v.value,border:'none',cursor:'pointer',outline:`2px solid ${s?'var(--gold)':'transparent'}`,outlineOffset:3,transition:'outline 0.2s'}}/>;})}
                </div>
              ) : attr.displayMode==='image' ? (
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{width:54,height:70,overflow:'hidden',border:`1.5px solid ${s?'var(--gold)':'transparent'}`,cursor:'pointer',padding:0,opacity:s?1:0.5,transition:'all 0.3s'}}><img src={v.value} alt={v.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/></button>;})}
                </div>
              ) : (
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{padding:'9px 18px',border:`1px solid ${s?'var(--gold)':'var(--line-2)'}`,background:s?'var(--gold)':'transparent',color:s?'var(--black)':'var(--taupe)',fontSize:'11px',fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',cursor:'pointer',transition:'all 0.3s',fontFamily:'inherit'}}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{marginTop:36,paddingTop:28,borderTop:'1px solid var(--line)'}}>
              <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--taupe)',marginBottom:16}}>وصف المنتج</p>
              <div style={{fontSize:'14px',lineHeight:'1.9',color:'rgba(245,240,232,0.5)',fontWeight:300}}
                dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(product.desc,{ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','span'],ALLOWED_ATTR:['class','style']})}}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT FORM
══════════════════════════════════════════════════════════════ */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,setWilayas]   = useState<Wilaya[]>([]);
  const [communes,setCommunes] = useState<Commune[]>([]);
  const [loadingC,setLC]       = useState(false);
  const [fd,setFd] = useState({customerId:'',customerName:'',customerPhone:'',customerWelaya:'',customerCommune:'',quantity:1,priceLoss:0,typeLivraison:'home' as 'home'|'office'});
  const [errors,setErrors]   = useState<Record<string,string>>({});
  const [sub,setSub]         = useState(false);
  const [isOrderNow,setIsOrderNow] = useState(false);
  const [isAdded,setIsAdded]       = useState(false);
  const initCount = useCartStore(s=>s.initCount);

  useEffect(()=>{ if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(()=>{ if(typeof window!=='undefined'){const id=localStorage.getItem('customerId');if(id) setFd(p=>({...p,customerId:id}));} },[]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW  = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const getFP = useCallback(():number=>{
    const base=typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const off=product.offers?.find((o:any)=>o.id===selectedOffer); if(off) return off.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){
      const m=product.variantDetails.find((v:any)=>vm(v,selectedVariants)); if(m&&m.price!==-1) return m.price;
    }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getLiv = useCallback(():number=>{ if(!selW) return 0; return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice; },[selW,fd.typeLivraison]);
  const fp    = getFP();
  const total = ()=>fp*fd.quantity+ +getLiv();
  const validate = ()=>{
    const e:Record<string,string>={};
    if(!fd.customerName.trim()||fd.customerName.length<3) e.customerName='الاسم مطلوب (3 أحرف)';
    if(!fd.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!fd.customerWelaya) e.customerWelaya='اختر الولاية';
    if(!fd.customerCommune) e.customerCommune='اختر البلدية';
    return e;
  };
  const getVarId = useCallback(()=>{
    if(!product.variantDetails?.length||!Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v:any)=>vm(v,selectedVariants))?.id;
  },[product.variantDetails,selectedVariants]);

  const addToCart = ()=>{
    setIsAdded(true);
    const cart=JSON.parse(localStorage.getItem(domain)||'[]');
    cart.push({...fd,product,variantDetailId:getVarId(),productId:product.id,storeId:product.store.id,userId,selectedOffer,selectedVariants,platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv(),addedAt:Date.now()});
    localStorage.setItem(domain,JSON.stringify(cart)); initCount(cart.length);
    setTimeout(()=>setIsAdded(false),2200);
  };

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault(); const er=validate(); if(Object.keys(er).length){setErrors(er);return;}
    setErrors({}); setSub(true);
    try{
      await axios.post(`${API_URL}/orders/create`,{...fd,productId:product.id,storeId:product.store.id,userId,selectedOffer,variantDetailId:getVarId(),platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()});
      if(fd.customerId) localStorage.setItem('customerId',fd.customerId);
      router.push(`/${domain}/successfully`);
    }catch{}finally{setSub(false);}
  };

  const onF=(e:React.FocusEvent<HTMLInputElement|HTMLSelectElement>)=>{e.target.style.borderColor='var(--gold)';};
  const onB=(e:React.FocusEvent<HTMLInputElement|HTMLSelectElement>,err?:boolean)=>{e.target.style.borderColor=err?'#9B2335':'var(--line-2)';};

  return (
    <div dir="rtl">
      {/* Cart/Order buttons */}
      {product.store?.cart && (
        <div className="cart-btns" style={{marginBottom:16}}>
          <button onClick={addToCart} disabled={isAdded}
            style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'13px',cursor:isAdded?'default':'pointer',fontSize:'11px',fontWeight:500,letterSpacing:'0.16em',textTransform:'uppercase',border:`1px solid ${isAdded?'rgba(16,185,129,0.4)':'var(--line-2)'}`,background:isAdded?'rgba(16,185,129,0.05)':'transparent',color:isAdded?'#6EE7B7':'var(--taupe)',transition:'all 0.3s',fontFamily:'inherit'}}>
            {isAdded?<><CheckCircle2 size={13} className="anim-check"/>أُضيف</>:<><ShoppingBag size={13}/>السلة</>}
          </button>
          <button onClick={()=>setIsOrderNow(true)} className="btn-gold" style={{flex:2,padding:'13px',fontSize:'11px',letterSpacing:'0.16em'}}>
            اطلب الآن
          </button>
        </div>
      )}

      {(isOrderNow||!product.store?.cart) && (
        <div style={{border:'1px solid var(--line-2)',overflow:'hidden'}}>
          <div style={{padding:'13px 18px',background:'var(--char-2)',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:14,height:'1px',background:'var(--gold)'}}/>
              <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--gold)',margin:0}}>تأكيد الطلب</p>
            </div>
            {product.store?.cart && (
              <button onClick={()=>setIsOrderNow(false)} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',border:'1px solid var(--line-2)',background:'transparent',color:'var(--taupe)',fontSize:'10px',fontWeight:500,cursor:'pointer',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'inherit',transition:'all 0.3s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--gold)';el.style.color='var(--gold)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--line-2)';el.style.color='var(--taupe)';}}>
                <X style={{width:'9px',height:'9px'}}/> إلغاء
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{padding:'20px',background:'var(--char)'}}>
            <div className="form-2c">
              <FR error={errors.customerName} label="الاسم الكامل">
                <div style={{position:'relative'}}>
                  <User style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'12px',height:'12px',color:'var(--taupe)',pointerEvents:'none'}}/>
                  <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="محمد أحمد"
                    style={{...INP(!!errors.customerName),paddingLeft:'32px'}} onFocus={onF} onBlur={e=>onB(e,!!errors.customerName)}/>
                </div>
              </FR>
              <FR error={errors.customerPhone} label="رقم الهاتف">
                <div style={{position:'relative'}}>
                  <Phone style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'12px',height:'12px',color:'var(--taupe)',pointerEvents:'none'}}/>
                  <input type="tel" dir="ltr" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0550 123 456"
                    style={{...INP(!!errors.customerPhone),paddingLeft:'32px'}} onFocus={onF} onBlur={e=>onB(e,!!errors.customerPhone)}/>
                </div>
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{position:'relative'}}>
                  <MapPin style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',width:'12px',height:'12px',color:'var(--taupe)',pointerEvents:'none'}}/>
                  <ChevronDown style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'12px',height:'12px',color:'var(--taupe)',pointerEvents:'none'}}/>
                  <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                    style={{...INP(!!errors.customerWelaya),paddingRight:'32px',paddingLeft:'28px'}} onFocus={onF} onBlur={e=>onB(e,!!errors.customerWelaya)}>
                    <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{position:'relative'}}>
                  <ChevronDown style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'12px',height:'12px',color:'var(--taupe)',pointerEvents:'none'}}/>
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})}
                    style={{...INP(!!errors.customerCommune),paddingLeft:'28px',opacity:!fd.customerWelaya?0.4:1}} onFocus={onF} onBlur={e=>onB(e,!!errors.customerCommune)}>
                    <option value="">{loadingC?'جاري...':fd.customerWelaya?'اختر البلدية':'اختر الولاية أولاً'}</option>
                    {communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="نوع التوصيل">
              <div className="dlv-2c">
                {(['home','office'] as const).map(type=>(
                  <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',padding:'16px',border:`1px solid ${fd.typeLivraison===type?'var(--gold)':'var(--line-2)'}`,background:fd.typeLivraison===type?'rgba(201,169,110,0.08)':'transparent',cursor:'pointer',transition:'all 0.3s',fontFamily:'inherit'}}>
                    {type==='home' ? <HomeIcon style={{width:'18px',height:'18px',color:fd.typeLivraison===type?'var(--gold)':'var(--taupe)'}}/> : <Building2 style={{width:'18px',height:'18px',color:fd.typeLivraison===type?'var(--gold)':'var(--taupe)'}}/>}
                    <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.14em',textTransform:'uppercase',margin:0,color:fd.typeLivraison===type?'var(--gold)':'var(--taupe)'}}>{type==='home'?'للمنزل':'للمكتب'}</p>
                    {selW && <p className="cg" style={{fontSize:'1.1rem',fontWeight:300,margin:0,color:fd.typeLivraison===type?'var(--gold)':'rgba(138,130,121,0.5)'}}>
                      {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} دج
                    </p>}
                  </button>
                ))}
              </div>
            </FR>

            <FR label="الكمية">
              <div style={{display:'inline-flex',alignItems:'center',border:'1px solid var(--line-2)'}}>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} style={{width:38,height:38,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'transparent',cursor:'pointer',color:'var(--taupe)',borderLeft:'1px solid var(--line-2)',fontSize:'18px',fontWeight:200,transition:'color 0.2s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--taupe)';}}>−</button>
                <span className="cg" style={{width:48,textAlign:'center',fontSize:'1.3rem',fontWeight:300,color:'var(--cream)'}}>{fd.quantity}</span>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))} style={{width:38,height:38,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'transparent',cursor:'pointer',color:'var(--taupe)',borderRight:'1px solid var(--line-2)',fontSize:'18px',fontWeight:200,transition:'color 0.2s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--taupe)';}}>+</button>
                <span style={{padding:'0 14px',fontSize:'10px',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--taupe)'}}>قطعة</span>
              </div>
            </FR>

            {/* Summary */}
            <div style={{background:'var(--char-2)',border:'1px solid var(--line)',marginBottom:'16px',overflow:'hidden'}}>
              <div style={{padding:'10px 16px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:12,height:'1px',background:'var(--gold)'}}/>
                <span style={{fontSize:'9px',fontWeight:500,letterSpacing:'0.26em',textTransform:'uppercase',color:'var(--gold)'}}>ملخص الطلب</span>
              </div>
              {[{l:'المنتج',v:product.name.slice(0,22)+(product.name.length>22?'...':'')},{l:'السعر',v:`${fp.toLocaleString()} دج`},{l:'الكمية',v:`× ${fd.quantity}`},{l:'التوصيل',v:selW?`${getLiv().toLocaleString()} دج`:'—'}].map(row=>(
                <div key={row.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 16px',borderBottom:'1px solid var(--line)'}}>
                  <span style={{fontSize:'12px',color:'var(--taupe)',letterSpacing:'0.06em'}}>{row.l}</span>
                  <span style={{fontSize:'12px',fontWeight:400,color:'var(--cream)'}}>{row.v}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'14px 16px',background:'rgba(201,169,110,0.04)'}}>
                <span style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--taupe)'}}>الإجمالي</span>
                <span className="cg gold-txt" style={{fontSize:'2rem',fontWeight:300,lineHeight:1}}>
                  {total().toLocaleString()} <span style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:'12px'}}>دج</span>
                </span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-gold" style={{width:'100%',padding:'14px',fontSize:'11px',letterSpacing:'0.2em',cursor:sub?'not-allowed':'pointer',opacity:sub?0.55:1,marginBottom:'10px'}}>
              {sub?<><Loader2 style={{width:'14px',height:'14px',animation:'spin 1s linear infinite'}}/> جاري الإرسال...</>:<><ShoppingCart style={{width:'13px',height:'13px'}}/> تأكيد الطلب</>}
            </button>
            <p style={{fontSize:'10px',textAlign:'center',color:'var(--taupe)',display:'flex',alignItems:'center',justifyContent:'center',gap:6,letterSpacing:'0.16em',textTransform:'uppercase'}}>
              <Shield style={{width:'11px',height:'11px',color:'var(--gold)'}}/> بياناتك آمنة ومشفرة
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CART
══════════════════════════════════════════════════════════════ */
export function Cart({ domain, store }: { domain:string; store:any }) {
  const [items,setItems]       = useState<any[]>([]);
  const [wilayas,setWilayas]   = useState<Wilaya[]>([]);
  const [communes,setCommunes] = useState<Commune[]>([]);
  const [loadingC,setLC]       = useState(false);
  const [submitting,setSubmitting] = useState(false);
  const [success,setSuccess]   = useState(false);
  const [fd,setFd] = useState({customerName:'',customerPhone:'',customerWelaya:'',customerCommune:'',typeLivraison:'home' as 'home'|'office'});
  const [errors,setErrors]     = useState<Record<string,string>>({});
  const initCount = useCartStore(s=>s.initCount);

  useEffect(()=>{ setItems(JSON.parse(localStorage.getItem(domain)||'[]')); if(store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); },[domain,store]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW      = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const getLiv    = ()=>{ if(!selW) return 0; return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice; };
  const cartTotal = items.reduce((a,i)=>a+(i.finalPrice*i.quantity),0);
  const finalTotal = cartTotal + +getLiv();
  const update    = (n:any[])=>{ setItems(n); localStorage.setItem(domain,JSON.stringify(n)); initCount(n.length); };
  const changeQty = (i:number,d:number)=>{ const n=[...items]; n[i].quantity=Math.max(1,n[i].quantity+d); update(n); };

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();
    const er:Record<string,string>={};
    if(!fd.customerName.trim()||fd.customerName.length<3) er.n='الاسم مطلوب';
    if(!fd.customerPhone.trim()) er.p='الهاتف مطلوب';
    if(!fd.customerWelaya) er.w='الولاية مطلوبة';
    if(!fd.customerCommune) er.c='البلدية مطلوبة';
    if(Object.keys(er).length){setErrors(er);return;}
    setErrors({}); setSubmitting(true);
    try{
      await axios.post(`${API_URL}/orders/create`,items.map(i=>({...fd,productId:i.productId,storeId:i.storeId,userId:i.userId,selectedOffer:i.selectedOffer,variantDetailId:i.variantDetailId,selectedVariants:i.selectedVariants,platform:i.platform||'store',finalPrice:i.finalPrice,totalPrice:finalTotal,priceLivraison:+getLiv(),quantity:i.quantity,customerId:i.customerId||'',priceLoss:selW?.livraisonReturn??0})));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    }catch{}finally{setSubmitting(false);}
  };

  const onF=(e:React.FocusEvent<HTMLInputElement|HTMLSelectElement>)=>{e.target.style.borderColor='var(--gold)';};
  const onB=(e:React.FocusEvent<HTMLInputElement|HTMLSelectElement>,err?:boolean)=>{e.target.style.borderColor=err?'#9B2335':'var(--line-2)';};

  if(success) return (
    <div dir="rtl" style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',background:'var(--black)',fontFamily:"'Inter',sans-serif"}}>
      <div style={{textAlign:'center',padding:'4rem 3rem',border:'1px solid var(--line)',borderTop:'2px solid var(--gold)',maxWidth:460,width:'100%',background:'var(--char)'}}>
        <div style={{width:56,height:56,margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(201,169,110,0.3)',background:'rgba(201,169,110,0.06)'}}>
          <CheckCircle2 size={24} style={{color:'var(--gold)'}}/>
        </div>
        <h2 className="cg" style={{fontSize:'2rem',fontWeight:300,color:'var(--cream)',marginBottom:10,letterSpacing:'-0.01em'}}>تم استلام طلبك</h2>
        <p style={{fontSize:'12px',color:'var(--taupe)',marginBottom:28,lineHeight:1.8,fontWeight:300}}>شكراً. سنتواصل معك خلال 24 ساعة لتأكيد الطلب والتوصيل.</p>
        <Link href="/" className="btn-gold" style={{display:'inline-flex',padding:'13px 36px',fontSize:'11px',letterSpacing:'0.2em'}}>العودة للمتجر</Link>
      </div>
    </div>
  );

  if(!items.length) return (
    <div dir="rtl" style={{minHeight:'55vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',background:'var(--black)',fontFamily:"'Inter',sans-serif"}}>
      <div style={{textAlign:'center',padding:'4rem 2.5rem',border:'1px solid var(--line)',maxWidth:360,width:'100%'}}>
        <ShoppingBag size={36} style={{color:'var(--taupe)',opacity:0.3,display:'block',margin:'0 auto 16px'}}/>
        <p className="cg" style={{fontSize:'1.6rem',fontWeight:300,color:'var(--taupe)',marginBottom:8}}>السلة فارغة</p>
        <p style={{fontSize:'10px',letterSpacing:'0.18em',textTransform:'uppercase',color:'rgba(138,130,121,0.5)',marginBottom:24}}>اكتشف مجموعتنا الفاخرة</p>
        <Link href="/" className="btn-gold" style={{display:'inline-flex',padding:'13px 32px',fontSize:'11px',letterSpacing:'0.2em'}}>تسوق الآن</Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{minHeight:'100vh',background:'var(--black)',padding:'7rem 2rem 5rem',fontFamily:"'Inter',sans-serif"}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{marginBottom:'2.5rem',paddingBottom:'1.2rem',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
          <div>
            <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:10}}>مشترياتك</p>
            <h1 className="cg" style={{fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:300,color:'var(--cream)',letterSpacing:'-0.01em'}}>سلة التسوق</h1>
          </div>
          <span style={{fontSize:'11px',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--taupe)',padding:'7px 16px',border:'1px solid var(--line)'}}>{items.length} قطعة</span>
        </div>

        <div className="cart-g">
          {/* Items */}
          <div style={{border:'1px solid var(--line)',background:'var(--char)'}}>
            {items.map((item,i)=>(
              <div key={i} style={{display:'flex',gap:'16px',padding:'18px 20px',borderBottom:'1px solid var(--line)',transition:'background 0.25s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--char-2)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
                <div style={{width:80,height:104,flexShrink:0,overflow:'hidden',background:'var(--char-2)'}}>
                  <img src={item.product?.imagesProduct?.[0]?.imageUrl||item.product?.productImage} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt=""/>
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                  <div>
                    <h4 className="cg" style={{fontWeight:400,color:'var(--cream)',fontSize:'1.1rem',lineHeight:1.3,marginBottom:4}}>{item.product?.name}</h4>
                    <p className="cg gold-txt" style={{fontSize:'1.1rem',fontWeight:300}}>{item.finalPrice?.toLocaleString()} دج</p>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'inline-flex',alignItems:'center',border:'1px solid var(--line-2)'}}>
                      <button onClick={()=>changeQty(i,-1)} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',borderLeft:'1px solid var(--line-2)',color:'var(--taupe)',fontSize:'16px',fontWeight:200,transition:'color 0.2s'}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--taupe)';}}>-</button>
                      <span className="cg" style={{width:32,textAlign:'center',fontWeight:300,fontSize:'1.1rem',color:'var(--cream)'}}>{item.quantity}</span>
                      <button onClick={()=>changeQty(i,1)} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',borderRight:'1px solid var(--line-2)',color:'var(--taupe)',fontSize:'16px',fontWeight:200,transition:'color 0.2s'}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--gold)';}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--taupe)';}}>+</button>
                    </div>
                    <button onClick={()=>update(items.filter((_,idx)=>idx!==i))} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',border:'none',background:'transparent',color:'var(--taupe)',fontSize:'11px',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.1em',transition:'color 0.2s'}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#EF4444';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--taupe)';}}>
                      <Trash2 size={12}/> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:'16px 20px',background:'var(--char-2)'}}>
              <span style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--taupe)'}}>المجموع الفرعي</span>
              <span className="cg gold-txt" style={{fontSize:'1.5rem',fontWeight:300}}>{cartTotal.toLocaleString()} دج</span>
            </div>
          </div>

          {/* Checkout */}
          <div style={{border:'1px solid var(--line)',background:'var(--char)'}}>
            <div style={{padding:'14px 20px',background:'var(--char-2)',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:12,height:'1px',background:'var(--gold)'}}/>
              <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--gold)',margin:0}}>إتمام الطلب</p>
            </div>
            <form onSubmit={handleSubmit} style={{padding:'20px'}}>
              <div className="form-2c">
                <FR error={errors.n} label="الاسم">
                  <div style={{position:'relative'}}>
                    <User style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'12px',height:'12px',color:'var(--taupe)',pointerEvents:'none'}}/>
                    <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} style={{...INP(!!errors.n),paddingLeft:'32px'}} onFocus={onF} onBlur={e=>onB(e,!!errors.n)}/>
                  </div>
                </FR>
                <FR error={errors.p} label="الهاتف">
                  <div style={{position:'relative'}}>
                    <Phone style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'12px',height:'12px',color:'var(--taupe)',pointerEvents:'none'}}/>
                    <input type="tel" dir="ltr" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} style={{...INP(!!errors.p),paddingLeft:'32px'}} onFocus={onF} onBlur={e=>onB(e,!!errors.p)}/>
                  </div>
                </FR>
              </div>
              <div className="form-2c">
                <FR error={errors.w} label="الولاية">
                  <div style={{position:'relative'}}>
                    <ChevronDown style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'12px',height:'12px',color:'var(--taupe)',pointerEvents:'none'}}/>
                    <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} style={{...INP(!!errors.w),paddingLeft:'28px'}} onFocus={onF} onBlur={e=>onB(e,!!errors.w)}>
                      <option value="">اختر</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
                <FR error={errors.c} label="البلدية">
                  <div style={{position:'relative'}}>
                    <ChevronDown style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'12px',height:'12px',color:'var(--taupe)',pointerEvents:'none'}}/>
                    <select value={fd.customerCommune} disabled={loadingC||!fd.customerWelaya} onChange={e=>setFd({...fd,customerCommune:e.target.value})} style={{...INP(!!errors.c),paddingLeft:'28px',opacity:!fd.customerWelaya?0.4:1}} onFocus={onF} onBlur={e=>onB(e,!!errors.c)}>
                      <option value="">{loadingC?'...':'اختر'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
              </div>
              {/* Summary */}
              <div style={{background:'var(--char-2)',border:'1px solid var(--line)',marginBottom:'16px',overflow:'hidden'}}>
                {[{l:'المجموع الفرعي',v:`${cartTotal.toLocaleString()} دج`},{l:'التوصيل',v:getLiv()?`${getLiv().toLocaleString()} دج`:'—'}].map(r=>(
                  <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',borderBottom:'1px solid var(--line)'}}>
                    <span style={{fontSize:'12px',color:'var(--taupe)',letterSpacing:'0.06em'}}>{r.l}</span>
                    <span style={{fontSize:'12px',fontWeight:400,color:'var(--cream)'}}>{r.v}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'12px 14px',background:'rgba(201,169,110,0.04)'}}>
                  <span style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--taupe)'}}>الإجمالي</span>
                  <span className="cg gold-txt" style={{fontSize:'1.8rem',fontWeight:300}}>
                    {finalTotal.toLocaleString()} <span style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:'12px'}}>دج</span>
                  </span>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn-gold" style={{width:'100%',padding:'14px',fontSize:'11px',letterSpacing:'0.2em',cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.55:1}}>
                {submitting?<><Loader2 style={{width:'14px',height:'14px',animation:'spin 1s linear infinite'}}/> جاري...</>:<><ShoppingCart style={{width:'13px',height:'13px'}}/> تأكيد الطلب</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATIC PAGES
══════════════════════════════════════════════════════════════ */
export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage||page||'').toLowerCase();
  return (
    <>
      {p==='privacy' && <Privacy/>}
      {p==='terms'   && <Terms/>}
      {p==='cookies' && <Cookies/>}
      {p==='contact' && <Contact store={store}/>}
    </>
  );
}

const Shell = ({ children, title, tag }: { children:React.ReactNode; title:string; tag?:string }) => (
  <div dir="rtl" style={{background:'var(--black)',minHeight:'100vh',fontFamily:"'Inter',sans-serif",paddingTop:'80px',paddingBottom:'80px'}}>
    <div style={{maxWidth:'720px',margin:'0 auto',padding:'56px 32px 0'}}>
      <div style={{marginBottom:'56px'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:'22px'}}>
          <div style={{width:20,height:'1px',background:'var(--gold)'}}/>
          <span style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--gold)'}}>{tag||'Legal'}</span>
        </div>
        <h1 className="cg" style={{fontSize:'clamp(2.2rem,5vw,4rem)',fontWeight:300,color:'var(--cream)',letterSpacing:'-0.01em',lineHeight:1.05,marginBottom:16}}>{title}</h1>
        <div style={{width:32,height:'1px',background:'var(--gold)'}}/>
      </div>
      <div style={{background:'var(--char)',border:'1px solid var(--line)',padding:'32px'}}>{children}</div>
    </div>
  </div>
);

const IB = ({ icon, title, desc, status }: { icon:React.ReactNode; title:string; desc:string; status?:string }) => (
  <div style={{borderTop:'1px solid var(--line)',padding:'22px 4px',display:'flex',gap:'18px',transition:'background 0.25s'}}
    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--char-2)';}}
    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
    <div style={{color:'var(--taupe)',marginTop:2,flexShrink:0,transition:'color 0.3s'}}>{icon}</div>
    <div style={{flex:1}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',marginBottom:'6px'}}>
        <h3 className="cg" style={{fontSize:'1.05rem',fontWeight:400,color:'var(--cream)'}}>{title}</h3>
        {status && <span style={{fontSize:'9px',fontWeight:500,letterSpacing:'0.18em',textTransform:'uppercase',padding:'3px 10px',background:status==='دائماً نشطة'?'var(--gold)':'transparent',color:status==='دائماً نشطة'?'var(--black)':'var(--taupe)',border:status==='دائماً نشطة'?'none':'1px solid var(--line-2)',flexShrink:0}}>{status}</span>}
      </div>
      <p style={{fontSize:'13px',lineHeight:'1.85',color:'rgba(245,240,232,0.45)',fontWeight:300}}>{desc}</p>
    </div>
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" tag="Privacy">
      <IB icon={<Shield size={15} style={{color:'var(--gold)'}}/>} title="البيانات التي نجمعها" desc="نجمع فقط الاسم ورقم الهاتف وعنوان التوصيل — الحد الأدنى لمعالجة طلبك."/>
      <IB icon={<ShieldCheck size={15} style={{color:'var(--gold)'}}/>} title="كيفية استخدامها" desc="حصرياً لتنفيذ وتوصيل مشترياتك. لا استخدام تجاري لبياناتك."/>
      <IB icon={<Lock size={15} style={{color:'var(--gold)'}}/>} title="حماية المعلومات" desc="تشفير متطور ومعايير أمان عالمية دولية لحماية بياناتك."/>
      <IB icon={<Package size={15} style={{color:'var(--gold)'}}/>} title="مشاركة البيانات" desc="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين لإتمام طلبك." status="مضمون"/>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الاستخدام" tag="Terms">
      <IB icon={<CheckCircle2 size={15} style={{color:'var(--gold)'}}/>} title="الطلبات والمدفوعات" desc="لا رسوم مخفية. السعر المعروض هو السعر النهائي الكامل."/>
      <IB icon={<Shield size={15} style={{color:'var(--gold)'}}/>} title="جودة المنتجات" desc="جميع منتجاتنا أصيلة من جلد طبيعي. جودة مضمونة لكل قطعة." status="مضمون"/>
      <IB icon={<ArrowLeft size={15} style={{color:'var(--gold)'}}/>} title="الإرجاع والاستبدال" desc="يحق لك إرجاع المنتج خلال 7 أيام من الاستلام في حالة عيب مصنعي."/>
      <IB icon={<Package size={15} style={{color:'var(--gold)'}}/>} title="القانون الحاكم" desc="تخضع هذه الشروط لقوانين الجمهورية الجزائرية الديمقراطية الشعبية."/>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات الارتباط" tag="Cookies">
      <IB icon={<ShieldCheck size={15} style={{color:'var(--gold)'}}/>} title="الكوكيز الأساسية" desc="ضرورية لتشغيل الموقع والسلة وحفظ الجلسة. لا يمكن تعطيلها." status="دائماً نشطة"/>
      <IB icon={<Shield size={15} style={{color:'var(--gold)'}}/>} title="كوكيز التفضيلات" desc="تحفظ إعداداتك ومنطقتك لتجربة تسوق مخصصة." status="اختياري"/>
      <IB icon={<Package size={15} style={{color:'var(--gold)'}}/>} title="كوكيز التحليلات" desc="بيانات مجهولة الهوية لتحسين تجربة المتجر." status="اختياري"/>
      <div style={{marginTop:'18px',background:'rgba(201,169,110,0.06)',border:'1px solid var(--line-2)',padding:'18px 20px',display:'flex',gap:'14px',alignItems:'flex-start'}}>
        <ToggleRight size={16} style={{color:'var(--gold)',flexShrink:0,marginTop:1}}/>
        <div>
          <h3 className="cg" style={{fontSize:'1rem',fontWeight:300,color:'var(--cream)',marginBottom:'6px'}}>كيف تتحكم في خياراتك؟</h3>
          <p style={{fontSize:'12px',color:'rgba(245,240,232,0.4)',lineHeight:1.8,fontWeight:300}}>يمكنك إدارة أو مسح ملفات الارتباط من إعدادات متصفحك في أي وقت.</p>
        </div>
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store?:any }) {
  const [form,setForm]   = useState({name:'',email:'',message:''});
  const [sent,setSent]   = useState(false);
  const [loading,setLoading] = useState(false);
  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`,{...form,storeId:store?.id}); setSent(true); }
    catch { alert('حدث خطأ'); } finally { setLoading(false); }
  };
  const onF=(e:React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>)=>{e.target.style.borderColor='var(--gold)';};
  const onB=(e:React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>)=>{e.target.style.borderColor='var(--line-2)';};

  return (
    <div dir="rtl" style={{background:'var(--black)',minHeight:'100vh',fontFamily:"'Inter',sans-serif",paddingTop:'80px'}}>
      <div style={{background:'var(--char)',padding:'72px 32px 56px',borderBottom:'1px solid var(--line)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(to right,var(--gold),var(--gold-dk))'}}/>
        <div style={{maxWidth:'960px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
            <div style={{width:20,height:'1px',background:'var(--gold)'}}/>
            <span style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--gold)'}}>تواصل</span>
          </div>
          <h1 className="cg" style={{fontSize:'clamp(2.5rem,6vw,5rem)',fontWeight:300,color:'var(--cream)',letterSpacing:'-0.01em',marginBottom:8}}>تواصل معنا</h1>
          <p style={{fontSize:'12px',color:'var(--taupe)',letterSpacing:'0.08em',fontWeight:300}}>نرد خلال 24 ساعة</p>
        </div>
      </div>

      <div className="contact-g" style={{maxWidth:'960px',margin:'0 auto',padding:'48px 32px 80px'}}>
        {/* Info */}
        <div>
          <div style={{background:'var(--char)',border:'1px solid var(--line)',padding:'24px',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{width:14,height:'1px',background:'var(--gold)'}}/>
              <p style={{fontSize:'9px',fontWeight:500,letterSpacing:'0.28em',textTransform:'uppercase',color:'var(--gold)',margin:0}}>طرق التواصل</p>
            </div>
            {[
              {icon:'📞',label:'الهاتف',val:store?.contact?.phone},
              {icon:'✉️',label:'البريد',val:store?.contact?.email},
              {icon:'📍',label:'الموقع',val:store?.contact?.wilaya},
            ].filter(r=>r.val).map(item=>(
              <div key={item.label} style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 0',borderBottom:'1px solid var(--line)',transition:'padding-right 0.25s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.paddingRight='8px';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.paddingRight='0';}}>
                <div style={{width:36,height:36,background:'rgba(201,169,110,0.08)',border:'1px solid var(--line-2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.95rem',flexShrink:0}}>{item.icon}</div>
                <div>
                  <p style={{fontSize:'9px',fontWeight:500,letterSpacing:'0.24em',textTransform:'uppercase',color:'var(--gold)',margin:'0 0 2px'}}>{item.label}</p>
                  <p style={{fontSize:'13px',color:'var(--cream)',margin:0,fontWeight:300}}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:'var(--char)',border:'1px solid var(--line)',padding:'20px 22px',borderTop:'2px solid var(--gold)'}}>
            <p className="cg" style={{fontSize:'1.1rem',fontWeight:300,color:'var(--cream)',lineHeight:1.5,margin:'0 0 6px'}}>
              فاخر ومتطور.<br/><em className="gold-txt" style={{fontStyle:'italic'}}>خطوة بالجمال.</em>
            </p>
            <span style={{fontSize:'9px',letterSpacing:'0.22em',textTransform:'uppercase',color:'rgba(245,240,232,0.2)'}}>Luxe Forma Dark Theme</span>
          </div>
        </div>

        {/* Form */}
        <div style={{background:'var(--char)',border:'1px solid var(--line)',padding:'28px'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}}>
            <div style={{width:14,height:'1px',background:'var(--gold)'}}/>
            <p style={{fontSize:'9px',fontWeight:500,letterSpacing:'0.28em',textTransform:'uppercase',color:'var(--gold)',margin:0}}>أرسل رسالة</p>
          </div>
          {sent ? (
            <div style={{minHeight:'200px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:'1px solid var(--line)',textAlign:'center',padding:'32px'}}>
              <CheckCircle2 style={{width:'28px',height:'28px',color:'var(--gold)',marginBottom:14}}/>
              <h3 className="cg" style={{fontSize:'1.5rem',fontWeight:300,color:'var(--cream)',margin:'0 0 6px'}}>تم الإرسال</h3>
              <p style={{fontSize:'12px',color:'var(--taupe)',letterSpacing:'0.06em'}}>سنرد عليك خلال 24 ساعة.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div className="form-2c">
                <div>
                  <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--taupe)',marginBottom:7}}>الاسم</p>
                  <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required style={INP()} onFocus={onF} onBlur={onB}/>
                </div>
                <div>
                  <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--taupe)',marginBottom:7}}>البريد</p>
                  <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required style={INP()} onFocus={onF} onBlur={onB}/>
                </div>
              </div>
              <div>
                <p style={{fontSize:'10px',fontWeight:500,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--taupe)',marginBottom:7}}>رسالتك</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="كيف يمكننا مساعدتك؟" rows={5} required
                  style={{...INP(),resize:'none'}} onFocus={onF} onBlur={onB}/>
              </div>
              <button type="submit" disabled={loading} className="btn-gold" style={{width:'100%',padding:'14px',fontSize:'11px',letterSpacing:'0.22em',cursor:loading?'not-allowed':'pointer',opacity:loading?0.55:1}}>
                {loading?<><Loader2 style={{width:'13px',height:'13px',animation:'spin 1s linear infinite'}}/> جاري...</>:'إرسال الرسالة'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}