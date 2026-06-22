'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, AlertCircle, X, ToggleRight,
  Shield, ArrowLeft, Plus, Minus, CheckCircle2, Lock,
  Menu, Zap, Package, Truck, RefreshCw, Phone, User,
  Search, ShoppingCart, Trash2, Loader2,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   OMNI-FLEX UNIVERSAL — Multi-Category Arabic RTL Theme
   ─────────────────────────────────────────────────────────────
   Navy #0D1B2A · Blue #3A86FF · Off-white #F4F6F8
   Fonts: Barlow Condensed (display) + Inter (body)
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0; }
  html { scroll-behavior:smooth; }

  :root {
    --navy:    #0D1B2A;
    --navy-2:  #162436;
    --navy-3:  #1E3048;
    --blue:    #3A86FF;
    --blue-2:  #0056D2;
    --blue-3:  #7EB1FF;
    --white:   #FFFFFF;
    --off:     #F4F6F8;
    --light:   #E8ECF0;
    --ink:     #0D1B2A;
    --mid:     #4A5A6A;
    --dim:     #8A9BAB;
    --line:    rgba(13,27,42,0.12);
    --line-lt: rgba(255,255,255,0.12);
  }

  body { background:var(--off); color:var(--ink); font-family:'Inter',sans-serif; }
  a    { text-decoration:none; color:inherit; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:var(--blue); border-radius:2px; }

  .bc { font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; }

  .dot-bg {
    background-image: radial-gradient(circle,rgba(13,27,42,0.07) 1px,transparent 1px);
    background-size: 24px 24px;
  }

  @keyframes fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .fu   { animation:fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay:0.08s; }
  .fu-2 { animation-delay:0.18s; }
  .fu-3 { animation-delay:0.3s; }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

  .anim-check { animation:check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* Card */
  .p-card {
    background:var(--white); border:1px solid var(--line);
    transition:transform 0.28s, box-shadow 0.28s; cursor:pointer;
  }
  .p-card:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(13,27,42,0.12); }
  .p-card:hover .c-img img { transform:scale(1.04); }
  .c-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.4s cubic-bezier(0.22,1,0.36,1); }

  /* Buttons */
  .btn-blue {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--blue); color:var(--white);
    font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase;
    padding:12px 26px; border:none; cursor:pointer;
    transition:background 0.2s, transform 0.2s;
  }
  .btn-blue:hover { background:var(--blue-2); transform:translateY(-1px); }
  .btn-blue:disabled { opacity:0.7; cursor:not-allowed; transform:none; }

  .btn-navy {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--navy); color:var(--white);
    font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase;
    padding:12px 26px; border:none; cursor:pointer;
    transition:background 0.2s, transform 0.2s;
  }
  .btn-navy:hover { background:var(--navy-2); transform:translateY(-1px); }
  .btn-navy:disabled { opacity:0.7; cursor:not-allowed; transform:none; }

  /* Inputs */
  .inp {
    width:100%; padding:11px 13px;
    background:var(--white); border:1.5px solid var(--line);
    font-family:'Inter',sans-serif; font-size:13px; color:var(--ink);
    outline:none; transition:border-color 0.2s, box-shadow 0.2s; appearance:none;
  }
  .inp:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(58,134,255,0.12); }
  .inp::placeholder { color:var(--dim); }
  .inp-err { border-color:#C0392B !important; }
  select.inp { cursor:pointer; }

  /* Grids */
  .prod-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
  .trust-bar  { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g   { display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; }
  .details-g  { display:grid; grid-template-columns:1fr 1fr; }
  .details-L  { position:sticky; top:64px; height:calc(100vh - 64px); overflow:hidden; }
  .details-R  { padding:40px 36px 80px; }
  .form-2c    { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c     { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cart-layout{ display:grid; grid-template-columns:1.2fr 1fr; gap:40px; align-items:start; }
  .contact-g  { display:grid; grid-template-columns:1fr 1fr; gap:56px; }
  .cats-grid  { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:20px; }
  .pagination { display:flex; justify-content:center; gap:6px; margin-top:48px; flex-wrap:wrap; }
  .cart-add-btns { display:flex; gap:8px; }

  @media (max-width:1100px) {
    .prod-grid { grid-template-columns:repeat(3,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:32px; }
  }
  @media (max-width:768px) {
    .prod-grid  { grid-template-columns:repeat(2,1fr); }
    .trust-bar  { grid-template-columns:repeat(2,1fr); }
    .footer-g   { grid-template-columns:1fr 1fr; gap:24px; }
    .details-g  { grid-template-columns:1fr; }
    .details-L  { position:static; height:auto; aspect-ratio:1; }
    .details-R  { padding:24px 16px 48px; }
    .contact-g  { grid-template-columns:1fr; gap:28px; }
    .cart-layout{ grid-template-columns:1fr; }
  }
  @media (max-width:480px) {
    .prod-grid { grid-template-columns:repeat(2,1fr); }
    .footer-g  { grid-template-columns:1fr; }
    .form-2c   { grid-template-columns:1fr; }
    .dlv-2c    { grid-template-columns:1fr; }
    .cart-add-btns { flex-direction:column; }
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
  width:'100%', padding:'11px 13px', background:'var(--white)',
  border:`1.5px solid ${err?'#C0392B':'var(--line)'}`,
  fontFamily:"'Inter',sans-serif", fontSize:'13px', color:'var(--ink)',
  outline:'none', transition:'border-color 0.2s', appearance:'none',
});

const FR = ({ error, label, children }: { error?:string; label?:string; children:React.ReactNode }) => (
  <div style={{marginBottom:'13px'}}>
    {label && <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.16em',color:'var(--mid)',marginBottom:'6px'}}>{label}</p>}
    {children}
    {error && <p style={{fontSize:'11px',color:'#C0392B',marginTop:'4px',display:'flex',alignItems:'center',gap:4}}>
      <AlertCircle style={{width:'11px',height:'11px'}}/>{error}
    </p>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  return (
    <div style={{minHeight:'100vh',backgroundColor:'var(--off)'}}>
      <style>{CSS}</style>
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
  const [open, setOpen]           = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [sq, setSq]               = useState('');
  const [ls, setLs]               = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const count    = useCartStore(s=>s.count);
  const initCount = useCartStore(s=>s.initCount);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>4);
    window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h);
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
    },380);
    return ()=>clearTimeout(t);
  },[sq,domain]);

  const doSearch=(e?:React.FormEvent)=>{ if(e) e.preventDefault(); if(sq.trim()){ router.push(`/?search=${encodeURIComponent(sq)}`); setSq(''); setShowSearch(false); }};

  const Drop=()=>(
    <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,left:0,background:'var(--white)',border:'1px solid var(--line)',boxShadow:'0 12px 36px rgba(13,27,42,0.12)',zIndex:200,overflow:'hidden',borderTop:'2px solid var(--blue)'}}>
      {loading ? <div style={{padding:'1rem',textAlign:'center',fontSize:'12px',color:'var(--blue)'}}>Recherche en cours...</div>
      : ls.length>0 ? ls.map((p:any)=>(
        <Link href={`/product/${p.id}`} key={p.id} onClick={()=>setSq('')}
          style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'10px 14px',borderBottom:'1px solid var(--line)'}}>
          <img src={p.productImage||p.imagesProduct?.[0]?.imageUrl} style={{width:40,height:40,objectFit:'cover',flexShrink:0,border:'1px solid var(--line)'}} alt=""/>
          <div>
            <div style={{fontSize:'13px',fontWeight:600,color:'var(--ink)'}}>{p.name}</div>
            <div style={{fontSize:'13px',fontWeight:700,color:'var(--blue)'}}>{p.price} DA</div>
          </div>
        </Link>
      )) : sq.length>=2 && <div style={{padding:'1rem',textAlign:'center',fontSize:'12px',color:'var(--dim)'}}>Aucun résultat</div>}
    </div>
  );

  return (
    <nav dir="rtl" style={{
      position:'sticky',top:0,zIndex:100,
      backgroundColor:'var(--navy)',
      borderBottom:scrolled?'2px solid var(--blue)':'2px solid transparent',
      boxShadow:scrolled?'0 4px 20px rgba(13,27,42,0.4)':'none',
      transition:'all 0.3s',
    }}>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{backgroundColor:'var(--blue)',overflow:'hidden',whiteSpace:'nowrap',padding:'6px 0'}}>
          <div style={{display:'inline-block',animation:'ticker 22s linear infinite'}}>
            {Array(12).fill(null).map((_,i)=><span key={i} className="bc" style={{fontSize:'13px',fontWeight:700,letterSpacing:'0.2em',color:'white',margin:'0 40px'}}>⚡ {store.topBar.text}</span>)}
            {Array(12).fill(null).map((_,i)=><span key={`b${i}`} className="bc" style={{fontSize:'13px',fontWeight:700,letterSpacing:'0.2em',color:'white',margin:'0 40px'}}>⚡ {store.topBar.text}</span>)}
          </div>
        </div>
      )}

      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px',height:'62px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'20px'}}>
        {/* Logo */}
        <Link href="/" style={{flexShrink:0,display:'flex',alignItems:'center',gap:'12px'}}>
          {store?.design?.logoUrl
            ? <img src={store.design.logoUrl} alt={store.name} style={{height:'36px',width:'auto'}}/>
            : <>
                <div style={{width:'38px',height:'38px',borderRadius:'10px',backgroundColor:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Zap style={{width:'20px',height:'20px',color:'white'}}/>
                </div>
                <div style={{display:'flex',flexDirection:'column'}}>
                  <span className="bc" style={{fontSize:'1.3rem',fontWeight:900,color:'white',letterSpacing:'0.04em',lineHeight:1}}>{store?.name}</span>
                  <span style={{fontSize:'9px',fontWeight:700,color:'var(--blue)',letterSpacing:'0.15em',marginTop:'3px',opacity:0.8}}>OFFICIAL STORE</span>
                </div>
              </>
          }
        </Link>

        {/* Desktop search */}
        <div style={{flex:1,maxWidth:320,position:'relative',display:'none'}} className="nav-search-desk">
          <form onSubmit={doSearch} style={{position:'relative'}}>
            <input type="text" placeholder="Rechercher des Produits..." value={sq} onChange={e=>setSq(e.target.value)}
              style={{...INP(),padding:'9px 36px 9px 12px',background:'rgba(255,255,255,0.08)',borderColor:'rgba(255,255,255,0.15)',color:'white',fontSize:'13px'}}
              onFocus={e=>{e.target.style.borderColor='var(--blue)';e.target.style.background='rgba(255,255,255,0.12)';}}
              onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.15)';e.target.style.background='rgba(255,255,255,0.08)';}}/>
            <Search size={14} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)'}}/>
          </form>
          {sq.length>=2 && <Drop/>}
        </div>

        {/* Links + actions */}
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          

          {/* Search btn */}
          <button onClick={()=>setShowSearch(!showSearch)} style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',cursor:'pointer',color:'rgba(255,255,255,0.7)',transition:'all 0.2s'}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--blue)';(e.currentTarget as HTMLElement).style.color='var(--blue)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.15)';(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.7)';}}>
            <Search style={{width:'15px',height:'15px'}}/>
          </button>

          {/* Cart */}
          <Link href="/cart" style={{position:'relative',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.7)',transition:'all 0.2s'}}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--blue)';el.style.color='var(--blue)';}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.15)';el.style.color='rgba(255,255,255,0.7)';}}>
            <ShoppingCart style={{width:'15px',height:'15px'}}/>
            {count>0 && <span style={{position:'absolute',top:-4,right:-4,background:'var(--blue)',color:'white',fontSize:'9px',fontWeight:700,minWidth:'16px',height:'16px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>{count}</span>}
          </Link>

          {/* Burger */}
          <button onClick={()=>setOpen(p=>!p)} style={{background:'none',border:'1px solid rgba(255,255,255,0.2)',cursor:'pointer',color:'white',padding:'7px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {open?<X style={{width:'18px',height:'18px'}}/>:<Menu style={{width:'18px',height:'18px'}}/>}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div style={{background:'var(--navy-2)',borderTop:'1px solid rgba(255,255,255,0.07)',padding:'10px 24px',position:'relative'}}>
          <div style={{maxWidth:600,margin:'0 auto',position:'relative'}}>
            <form onSubmit={doSearch}>
              <input autoFocus type="text" placeholder="Rechercher des Produits..." value={sq} onChange={e=>setSq(e.target.value)}
                style={{...INP(),background:'rgba(255,255,255,0.08)',borderColor:'rgba(255,255,255,0.15)',color:'white',padding:'10px 36px 10px 12px'}}
                onFocus={e=>{e.target.style.borderColor='var(--blue)';}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.15)';}}/>
              <Search size={14} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)'}}/>
            </form>
            {sq.length>=2 && <Drop/>}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      <div style={{maxHeight:open?'220px':'0',overflow:'hidden',transition:'max-height 0.3s ease',backgroundColor:'var(--navy-2)'}}>
        <div style={{padding:'8px 24px 16px'}}>
          {[{h:'/',l:'Accueil'},{h:'/contact',l:'Contactez-nous'}].map(lnk=>(
            <Link key={lnk.h} href={lnk.h} onClick={()=>setOpen(false)} className="bc"
              style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',fontSize:'16px',fontWeight:600,letterSpacing:'0.1em',color:'rgba(255,255,255,0.6)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              {lnk.l} <ArrowLeft style={{width:'14px',height:'14px',color:'var(--blue)'}}/>
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
    <footer dir="rtl" style={{backgroundColor:'var(--navy)',fontFamily:"'Inter',sans-serif",borderTop:'1px solid var(--line-lt)'}}>
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'64px 24px 32px'}}>
        <div className="footer-g" style={{paddingBottom:'48px',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>

          {/* قسم 1 */}
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:'12px'}}>
              {store?.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store?.name} style={{height:'32px',filter:'brightness(0) invert(1)'}}/>
                : <div style={{width:'36px',height:'36px',borderRadius:'8px',backgroundColor:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Zap style={{width:'18px',height:'18px',color:'white'}}/>
                  </div>
              }
              <span className="bc" style={{fontSize:'1.4rem',fontWeight:800,color:'white',letterSpacing:'0.05em'}}>{store?.name}</span>
            </Link>
            <p style={{fontSize:'13px',lineHeight:'1.8',color:'rgba(255,255,255,0.4)',maxWidth:'280px',fontWeight:300}}>
              {store?.hero?.subtitle?.substring(0,90)||'ثيم polyvalent haute performance offrant Expérience shopping complète pour tous les types de Produits.'}
            </p>
            <p style={{fontSize:'11px',color:'var(--blue)',letterSpacing:'0.1em',fontWeight:600}}>© {yr} {store?.name}. Tous droits réservés.</p>
          </div>

          {/* قسم 2 — Liens */}
          <div>
            <p className="bc" style={{fontSize:'14px',fontWeight:700,letterSpacing:'0.1em',color:'var(--blue)',marginBottom:'24px'}}>Liens Rapide</p>
            {[{h:'/',l:'Accueil'},{h:'/cart',l:'Panier'},{h:'/contact',l:'Appelez-nous'},{h:'/Privacy',l:'Politique de confidentialité'},{h:'/Terms',l:'Conditions de service'}].map(lnk=>(
              <a key={lnk.h} href={lnk.h} style={{display:'block',fontSize:'13px',color:'rgba(255,255,255,0.5)',marginBottom:'12px',transition:'all 0.2s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color='var(--white)';el.style.paddingRight='5px';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color='rgba(255,255,255,0.5)';el.style.paddingRight='0';}}>
                {lnk.l}
              </a>
            ))}
          </div>

          {/* قسم 3 — Contact */}
          <div>
            <p className="bc" style={{fontSize:'14px',fontWeight:700,letterSpacing:'0.1em',color:'var(--blue)',marginBottom:'24px'}}>Contactez-nous</p>
            {[
              {icon:'📞',val:store?.contact?.phone},
              {icon:'✉️',val:store?.contact?.email},
              {icon:'📍',val:[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ')},
            ].filter(r=>r.val).map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px'}}>
                <span style={{fontSize:'14px',opacity:0.8}}>{item.icon}</span>
                <span style={{fontSize:'13px',color:'rgba(255,255,255,0.5)'}}>{item.val}</span>
              </div>
            ))}
            <div style={{marginTop:'14px',padding:'14px 16px',background:'rgba(58,134,255,0.1)',border:'1px solid rgba(58,134,255,0.25)'}}>
              <p className="bc" style={{fontSize:'13px',fontWeight:700,color:'var(--blue)',margin:'0 0 3px',letterSpacing:'0.08em'}}>Performance sans limites.</p>
              <p style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em',margin:0}}>OMNI-FLEX UNIVERSAL v2</p>
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
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const price = typeof product.price==='string' ? parseFloat(product.price) : product.price;
  const orig  = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="p-card">
      <div className="c-img" style={{position:'relative',aspectRatio:'1/1',overflow:'hidden',backgroundColor:'var(--light)'}}>
        {displayImage
          ? <img src={displayImage} alt={product.name}/>
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}} className="dot-bg">
              <Package style={{width:'40px',height:'40px',color:'var(--dim)',opacity:0.5}}/>
            </div>}
        {discount>0 && <div style={{position:'absolute',top:'10px',right:'10px',backgroundColor:'var(--blue)',color:'white',fontSize:'11px',fontWeight:700,padding:'3px 9px'}}>-{discount}%</div>}
        <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:'linear-gradient(to right,var(--blue),var(--blue-3))'}}/>
      </div>
      <div style={{padding:'14px'}}>
        <h3 style={{fontSize:'14px',fontWeight:600,color:'var(--ink)',marginBottom:'5px',lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
          {product.name}
        </h3>
        <div style={{display:'flex',gap:'2px',marginBottom:'8px'}}>
          {[...Array(5)].map((_,i)=><Star key={i} style={{width:'11px',height:'11px',fill:i<4?'var(--blue)':'none',color:'var(--blue)'}}/>)}
        </div>
        <div style={{display:'flex',alignItems:'baseline',gap:'6px',marginBottom:'10px'}}>
          <span style={{fontSize:'1.1rem',fontWeight:700,color:'var(--ink)'}}>{price.toLocaleString()}</span>
          <span style={{fontSize:'11px',color:'var(--dim)'}}>DA</span>
          {orig>price && <span style={{fontSize:'11px',color:'var(--dim)',textDecoration:'line-through'}}>{orig.toLocaleString()}</span>}
        </div>
        <Link href={`/product/${product.slug||product.id}`} className="btn-blue"
          style={{width:'100%',fontSize:'13px',padding:'9px 16px',letterSpacing:'0.08em'}}>
          {viewDetails||'Voir le produit'}
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  const products: any[] = store.products||[];
  const cats: any[]     = store.categories||[];
  if(!page) page=1;
  const countPage = Math.ceil((store.count||products.length)/48);

  return (
    <div dir="rtl">

      {/* ── HERO ── */}
      <section style={{position:'relative',minHeight:'85vh',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',backgroundColor:'var(--navy)'}}>
        {store.hero?.imageUrl && (
          <>
            <img src={store.hero.imageUrl} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to left,rgba(13,27,42,0.95) 20%,rgba(13,27,42,0.6) 50%,rgba(13,27,42,0.2) 100%)'}}/>
          </>
        )}
        {!store.hero?.imageUrl && <div style={{position:'absolute',inset:0,backgroundColor:'var(--navy-2)',opacity:0.5}} className="dot-bg"/>}

        <div style={{position:'relative',zIndex:2,width:'100%',maxWidth:'1280px',padding:'80px 6vw',display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
          <div className="fu" style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
            <span style={{width:'30px',height:'2px',backgroundColor:'var(--blue)'}}/>
            <span className="bc" style={{fontSize:'14px',fontWeight:800,color:'var(--white)',letterSpacing:'0.15em'}}>{store?.name}</span>
          </div>

          <p className="fu fu-1 bc" style={{fontSize:'13px',fontWeight:700,letterSpacing:'0.2em',color:'var(--blue)',marginBottom:'12px'}}>
            ✦ Expérience shopping complète
          </p>

          <h1 className="fu fu-2 bc" style={{fontSize:'clamp(2.5rem,6vw,4.8rem)',fontWeight:900,color:'var(--white)',lineHeight:1.05,marginBottom:'24px',maxWidth:'800px',letterSpacing:'0.02em'}}
            dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(store.hero?.title||'Conçu pour se démarquer.<br/>Performance complète.')}}>
          </h1>

          <p className="fu fu-3" style={{fontSize:'17px',lineHeight:'1.7',color:'rgba(255,255,255,0.7)',marginBottom:'40px',maxWidth:'520px',fontWeight:300}}>
            {store.hero?.subtitle||'Découvrir notre collection الSélectionnés من Derniers Produits المصممة soigneusement pour toute vos besoins.'}
          </p>

          <div className="fu fu-3" style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
            <a href="#products" className="btn-blue" style={{padding:'16px 40px',borderRadius:'4px',fontSize:'15px'}}>Acheter maintenant</a>
            <a href="#categories" style={{border:'1px solid rgba(255,255,255,0.2)',color:'var(--white)',padding:'16px 40px',fontWeight:600,transition:'0.3s',fontSize:'15px',fontFamily:"'Inter',sans-serif"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='rgba(255,255,255,0.1)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='transparent';}}>
              Catégories
            </a>
          </div>

          <div className="fu fu-3" style={{marginTop:'60px',display:'flex',gap:'48px',paddingTop:'28px',borderTop:'1px solid rgba(255,255,255,0.1)',flexWrap:'wrap'}}>
            {[{n:`${products.length}+`,l:'Produit Disponible'},{n:'48H',l:'Livraison rapide'},{n:'100%',l:'Produits authentique'}].map((s,i)=>(
              <div key={i}>
                <p className="bc" style={{fontSize:'1.6rem',fontWeight:800,color:'var(--white)',margin:0,letterSpacing:'-0.02em'}}>{s.n}</p>
                <p style={{fontSize:'10px',color:'var(--dim)',textTransform:'uppercase',letterSpacing:'0.15em',marginTop:'4px'}}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{backgroundColor:'var(--navy)',borderBottom:'3px solid var(--blue)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto'}}>
          <div className="trust-bar">
            {[
              {icon:<Truck style={{width:'20px',height:'20px'}}/>,title:'Livraison rapide',desc:'48h pour toute l’Algérie'},
              {icon:<Shield style={{width:'20px',height:'20px'}}/>,title:'Produits authentique',desc:'100% qualité garantie'},
              {icon:<RefreshCw style={{width:'20px',height:'20px'}}/>,title:'Retour gratuit',desc:'30 jours de retour'},
              {icon:<Zap style={{width:'20px',height:'20px'}}/>,title:'Support rapide',desc:'Réponse sous 24h'},
            ].map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'18px 20px',borderLeft:i>0?'1px solid rgba(255,255,255,0.06)':'none'}}>
                <div style={{color:'var(--blue)',flexShrink:0}}>{item.icon}</div>
                <div>
                  <p className="bc" style={{fontSize:'14px',fontWeight:700,letterSpacing:'0.08em',color:'white',margin:0}}>{item.title}</p>
                  <p style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',margin:0}}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length>0 && (
        <section id="categories" style={{backgroundColor:'var(--white)',borderBottom:'1px solid var(--line)',padding:'60px 0'}}>
          <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>
            <div style={{marginBottom:'40px',textAlign:'center'}}>
              <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.22em',color:'var(--blue)',marginBottom:'12px'}}>✦ Parcourir par Catégorie</p>
              <h2 className="bc" style={{fontSize:'clamp(1.8rem,4vw,2.5rem)',fontWeight:800,color:'var(--navy)',margin:0}}>
                Catégories <span style={{color:'var(--blue)'}}>Sélectionnés</span>
              </h2>
            </div>
            <div className="cats-grid">
              {cats.slice(0,8).map((cat:any)=>(
                <Link key={cat.id} href={`?category=${cat.id}`}
                  style={{display:'block',height:'240px',position:'relative',overflow:'hidden',border:'1px solid var(--line)',transition:'box-shadow 0.3s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 12px 36px rgba(13,27,42,0.15)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow='none';}}>
                  {cat.imageUrl
                    ? <img src={cat.imageUrl} alt={cat.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s ease'}}
                        onMouseEnter={e=>{(e.target as HTMLImageElement).style.transform='scale(1.06)';}}
                        onMouseLeave={e=>{(e.target as HTMLImageElement).style.transform='scale(1)';;}}/>
                    : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}} className="dot-bg">
                        <Package style={{width:'40px',height:'40px',color:'var(--dim)',opacity:0.3}}/>
                      </div>
                  }
                  <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:'linear-gradient(to right,var(--blue),var(--blue-3))'}}/>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'20px',background:'linear-gradient(transparent,rgba(13,27,42,0.8))',display:'flex',alignItems:'center',justifyContent:'space-between',color:'white'}}>
                    <span style={{fontWeight:700,fontSize:'16px',letterSpacing:'0.05em'}}>{cat.name}</span>
                    <ArrowLeft style={{width:'18px',height:'18px',color:'var(--blue)'}}/>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{backgroundColor:'var(--off)',padding:'60px 0'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px',marginBottom:'36px'}}>
            <div>
              <h2 className="bc" style={{fontSize:'clamp(1.8rem,4vw,2.2rem)',fontWeight:900,color:'var(--navy)',margin:0,letterSpacing:'-0.02em'}}>
                Produits <span style={{color:'var(--blue)'}}>Disponibles</span>
              </h2>
              <div style={{width:'40px',height:'3px',backgroundColor:'var(--blue)',marginTop:'8px'}}/>
            </div>
            <div style={{fontSize:'13px',fontWeight:600,color:'var(--mid)',padding:'8px 16px',border:'1px solid var(--line)',background:'var(--white)'}}>
              {products.length} Produit
            </div>
          </div>

          {products.length===0 ? (
            <div style={{padding:'100px 0',textAlign:'center',border:'2px dashed var(--line)'}}>
              <Package style={{width:'48px',height:'48px',color:'var(--dim)',opacity:0.2,margin:'0 auto 16px',display:'block'}}/>
              <p className="bc" style={{fontSize:'1.2rem',color:'var(--dim)'}}>Nous travaillons à ajouter de nouveaux produits...</p>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((p:any)=>{
                const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal?Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100):0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="Voir le produit"/>;
              })}
            </div>
          )}

          {countPage>1 && (
            <div className="pagination" dir="rtl">
              <Link href={{query:{page:Math.max(1,page-1)}}} scroll={false}
                style={{width:44,height:44,border:'1px solid var(--line)',background:'var(--white)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,opacity:page<=1?0.4:1}}>❮</Link>
              {Array.from({length:countPage}).map((_,i)=>{
                const pn=i+1; const isA=Number(page)===pn;
                return (
                  <Link key={pn} href={{query:{page:pn}}} scroll={false}
                    style={{width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:'13px',border:`1px solid ${isA?'var(--blue)':'var(--line)'}`,background:isA?'var(--blue)':'var(--white)',color:isA?'white':'var(--mid)'}}>
                    {pn}
                  </Link>
                );
              })}
              <Link href={{query:{page:Math.min(countPage,Number(page)+1)}}} scroll={false}
                style={{width:44,height:44,border:'1px solid var(--line)',background:'var(--white)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,opacity:page>=countPage?0.4:1}}>❯</Link>
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
export function Details({ product, toggleWishlist, isWishlisted, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  if(!product) return null;
  return (
    <div dir="rtl" style={{backgroundColor:'var(--off)'}}>
      <div style={{backgroundColor:'var(--navy)',borderBottom:'2px solid var(--blue)',padding:'10px 24px',display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)'}}>
        <Link href="/" className="bc" style={{color:'rgba(255,255,255,0.4)',transition:'color 0.2s'}}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--blue)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.4)';}}>
          Accueil
        </Link>
        <span style={{color:'var(--blue)'}}>/</span>
        <span style={{color:'white',fontFamily:"'Barlow Condensed',sans-serif"}}>{product.name.slice(0,40)}</span>
        <span style={{marginRight:'auto',padding:'5px 14px',backgroundColor:inStock||autoGen?'rgba(58,134,255,0.15)':'rgba(107,90,74,0.1)',color:inStock||autoGen?'var(--blue)':'var(--mid)',fontSize:'11px',fontWeight:700,border:`1.5px solid ${inStock||autoGen?'var(--blue)':'var(--mid)'}`}}>
          {autoGen?'∞ Disponible':inStock?'Disponible':'Épuisé'}
        </span>
      </div>

      <div className="details-g" style={{maxWidth:'1280px',margin:'0 auto'}}>
        {/* Gallery */}
        <div className="details-L">
          <div style={{position:'relative',aspectRatio:'1/1',overflow:'hidden',backgroundColor:'var(--white)',border:'1px solid var(--line)'}}>
            {allImages.length>0
              ? <img src={allImages[sel]} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
              : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}} className="dot-bg">
                  <Package style={{width:'64px',height:'64px',color:'var(--dim)',opacity:0.3}}/>
                </div>
            }
            <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:'linear-gradient(to right,var(--blue),var(--blue-3))'}}/>
            {discount>0 && <div style={{position:'absolute',top:'12px',right:'12px',backgroundColor:'var(--blue)',color:'white',fontSize:'12px',fontWeight:700,padding:'4px 12px'}}>-{discount}%</div>}
            {allImages.length>1 && (
              <>
                <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',width:'36px',height:'36px',border:'1px solid var(--line)',backgroundColor:'rgba(255,255,255,0.9)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  ›
                </button>
                <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',width:'36px',height:'36px',border:'1px solid var(--line)',backgroundColor:'rgba(255,255,255,0.9)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  ‹
                </button>
              </>
            )}
            {!inStock && !autoGen && (
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(248,250,252,0.88)',backdropFilter:'blur(4px)'}}>
                <span className="bc" style={{fontSize:'1.5rem',fontWeight:800,letterSpacing:'0.08em',color:'var(--mid)'}}>Rupture de stock</span>
              </div>
            )}
          </div>
          {allImages.length>1 && (
            <div style={{display:'flex',gap:'8px',marginTop:'10px',flexWrap:'wrap'}}>
              {allImages.slice(0,5).map((img:string,idx:number)=>(
                <button key={idx} onClick={()=>setSel(idx)} style={{width:'54px',height:'54px',overflow:'hidden',border:`2px solid ${sel===idx?'var(--blue)':'var(--line)'}`,cursor:'pointer',padding:0,background:'none',opacity:sel===idx?1:0.55}}>
                  <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="details-R">
          <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.22em',color:'var(--blue)',marginBottom:'10px'}}>// Détails du Produit</p>
          <h1 className="bc" style={{fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:800,letterSpacing:'0.04em',color:'var(--navy)',lineHeight:0.95,marginBottom:'14px'}}>{product.name.toUpperCase()}</h1>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'22px',paddingBottom:'22px',borderBottom:'1px solid var(--line)',flexWrap:'wrap'}}>
            <div style={{display:'flex',gap:'2px'}}>
              {[...Array(5)].map((_,i)=><Star key={i} style={{width:'13px',height:'13px',fill:i<4?'var(--blue)':'none',color:'var(--blue)'}}/>)}
            </div>
          </div>

          {/* Price */}
          <div style={{marginBottom:'22px',padding:'16px 18px',backgroundColor:'var(--off)',border:'1px solid var(--line)'}}>
            <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.2em',color:'var(--mid)',margin:'0 0 6px'}}>Prix</p>
            <div style={{display:'flex',alignItems:'baseline',gap:'12px',flexWrap:'wrap'}}>
              <span style={{fontSize:'2.6rem',fontWeight:700,color:'var(--navy)',lineHeight:1,letterSpacing:'-0.01em'}}>{finalPrice.toLocaleString()}</span>
              <span style={{fontSize:'15px',color:'var(--dim)'}}>DA</span>
              {product.priceOriginal && parseFloat(product.priceOriginal)>finalPrice && (
                <>
                  <span style={{fontSize:'14px',textDecoration:'line-through',color:'var(--dim)'}}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                  <span style={{fontSize:'12px',color:'var(--blue)',fontWeight:700,padding:'2px 8px',border:'1px solid var(--blue)'}}>
                    Économisez {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} DA
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Offers */}
          {product.offers?.length>0 && (
            <div style={{marginBottom:'22px',paddingBottom:'22px',borderBottom:'1px solid var(--line)'}}>
              <p className="bc" style={{fontSize:'13px',fontWeight:700,letterSpacing:'0.14em',color:'var(--mid)',marginBottom:'10px'}}>// Forfaits</p>
              {product.offers.map((o:any)=>(
                <label key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',border:`1.5px solid ${selectedOffer===o.id?'var(--blue)':'var(--line)'}`,cursor:'pointer',marginBottom:'8px',transition:'all 0.2s',backgroundColor:selectedOffer===o.id?'rgba(58,134,255,0.05)':'var(--white)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'16px',height:'16px',border:`2px solid ${selectedOffer===o.id?'var(--blue)':'var(--dim)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {selectedOffer===o.id && <div style={{width:'8px',height:'8px',background:'var(--blue)'}}/>}
                    </div>
                    <input type="radio" name="offer" checked={selectedOffer===o.id} onChange={()=>setSelectedOffer(o.id)} style={{display:'none'}}/>
                    <div>
                      <p style={{fontSize:'13px',fontWeight:600,color:'var(--ink)',margin:0}}>{o.name}</p>
                      <p style={{fontSize:'11px',color:'var(--dim)',margin:0}}>Quantité: {o.quantity}</p>
                    </div>
                  </div>
                  <span style={{fontSize:'1.1rem',fontWeight:700,color:'var(--blue)'}}>{o.price.toLocaleString()} <span style={{fontSize:'11px',fontWeight:400,color:'var(--dim)'}}>DA</span></span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map((attr:any)=>(
            <div key={attr.id} style={{marginBottom:'18px',paddingBottom:'18px',borderBottom:'1px solid var(--line)'}}>
              <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.16em',color:'var(--mid)',marginBottom:'10px'}}>// {attr.name}</p>
              {attr.displayMode==='color' ? (
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{width:'28px',height:'28px',backgroundColor:v.value,border:'none',cursor:'pointer',outline:`3px solid ${s?'var(--blue)':'transparent'}`,outlineOffset:'3px'}}/>;})}
                </div>
              ) : attr.displayMode==='image' ? (
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{width:'52px',height:'52px',overflow:'hidden',border:`2px solid ${s?'var(--blue)':'var(--line)'}`,cursor:'pointer',padding:0}}><img src={v.value} alt={v.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/></button>;})}
                </div>
              ) : (
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                  {attr.variants.map((v:any)=>{const s=selectedVariants[attr.name]===v.value; return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} className="bc" style={{padding:'8px 16px',border:`1.5px solid ${s?'var(--blue)':'var(--line)'}`,backgroundColor:s?'var(--blue)':'transparent',color:s?'white':'var(--mid)',fontSize:'13px',fontWeight:700,letterSpacing:'0.1em',cursor:'pointer',transition:'all 0.2s'}}>{v.name}</button>;})}
                </div>
              )}
            </div>
          ))}

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

          {product.desc && (
            <div style={{marginTop:'28px',paddingTop:'22px',borderTop:'1px solid var(--line)'}}>
              <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.16em',color:'var(--mid)',marginBottom:'12px'}}>// Description du produit</p>
              <div style={{fontSize:'14px',lineHeight:'1.85',color:'var(--mid)',fontWeight:400}}
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
  const [wilayas, setWilayas]   = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC]       = useState(false);
  const [fd, setFd] = useState({customerId:'',customerName:'',customerPhone:'',customerWelaya:'',customerCommune:'',quantity:1,priceLoss:0,typeLivraison:'home' as 'home'|'office'});
  const [errors, setErrors]   = useState<Record<string,string>>({});
  const [sub, setSub]         = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded]       = useState(false);
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
    if(!fd.customerName.trim())  e.customerName='Nom requis';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = 'Numéro invalide (ex: 0550123456)';
    if(!fd.customerWelaya)       e.customerWelaya='Wilaya requis';
    if(!fd.customerCommune)      e.customerCommune='Commune requis';
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
    setTimeout(()=>setIsAdded(false),2000);
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

  const onFocus = (e:React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => { e.target.style.borderColor='var(--blue)'; };
  const onBlur  = (e:React.FocusEvent<HTMLInputElement|HTMLSelectElement>, err?:boolean) => { e.target.style.borderColor=err?'#C0392B':'var(--line)'; };

  return (
    <div dir="rtl" style={{marginTop:'22px',paddingTop:'20px',borderTop:'2px solid var(--blue)'}}>
      {product.store?.cart && (
        <div className="cart-add-btns" style={{marginBottom:'14px'}}>
          <button onClick={addToCart} disabled={isAdded} className="bc"
            style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'12px',cursor:isAdded?'default':'pointer',fontFamily:'inherit',fontWeight:700,fontSize:'13px',letterSpacing:'0.1em',border:`1.5px solid ${isAdded?'#22c55e':'var(--line)'}`,background:isAdded?'rgba(34,197,94,0.08)':'var(--white)',color:isAdded?'#22c55e':'var(--mid)',transition:'all 0.25s'}}>
            {isAdded?<><CheckCircle2 size={14} className="anim-check"/>Ajouté au panier</>:<><ShoppingCart size={14}/>Ajouter au panier</>}
          </button>
          <button onClick={()=>setIsOrderNow(true)} className="btn-blue" style={{flex:1,padding:'12px'}}>
            Commander maintenant <ArrowLeft style={{width:'14px',height:'14px'}}/>
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div>
          {product.store?.cart && (
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.16em',color:'var(--blue)',margin:0}}>// Informations de livraison</p>
              <button onClick={()=>setIsOrderNow(false)} className="bc" style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',border:'1px solid var(--line)',background:'transparent',color:'var(--dim)',fontSize:'11px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.1em'}}>
                <X style={{width:'10px',height:'10px'}}/> Annuler
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.customerName} label="Nom">
                <div style={{position:'relative'}}>
                  <User style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                  <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="Nom complet"
                    style={{...INP(!!errors.customerName),paddingLeft:'36px'}}
                    onFocus={onFocus} onBlur={e=>onBlur(e,!!errors.customerName)}/>
                </div>
              </FR>
              <FR error={errors.customerPhone} label="Téléphone">
                <div style={{position:'relative'}}>
                  <Phone style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                  <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX"
                    style={{...INP(!!errors.customerPhone),paddingLeft:'36px'}}
                    onFocus={onFocus} onBlur={e=>onBlur(e,!!errors.customerPhone)}/>
                </div>
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label="Wilaya">
                <div style={{position:'relative'}}>
                  <ChevronDown style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                  <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                    style={{...INP(!!errors.customerWelaya),paddingRight:'34px'}}
                    onFocus={onFocus} onBlur={e=>onBlur(e,!!errors.customerWelaya)}>
                    <option value="">Choisir Wilaya</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="Commune">
                <div style={{position:'relative'}}>
                  <ChevronDown style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})}
                    style={{...INP(!!errors.customerCommune),paddingRight:'34px',opacity:!fd.customerWelaya?0.4:1}}
                    onFocus={onFocus} onBlur={e=>onBlur(e,!!errors.customerCommune)}>
                    <option value="">{loadingC?'...':'Choisir Commune'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="Livraison">
              <div className="dlv-2c">
                {(['home','office'] as const).map(type=>(
                  <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))}
                    style={{padding:'12px 10px',border:`1.5px solid ${fd.typeLivraison===type?'var(--blue)':'var(--line)'}`,backgroundColor:fd.typeLivraison===type?'rgba(58,134,255,0.06)':'var(--white)',cursor:'pointer',textAlign:'right',transition:'all 0.2s',fontFamily:'inherit'}}>
                    <p className="bc" style={{fontSize:'13px',fontWeight:700,letterSpacing:'0.1em',color:fd.typeLivraison===type?'var(--blue)':'var(--mid)',margin:'0 0 4px'}}>{type==='home'?'À domicile':'Au bureau'}</p>
                    {selW && <p style={{fontSize:'1rem',fontWeight:700,color:fd.typeLivraison===type?'var(--blue)':'var(--dim)',margin:0}}>
                      {(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()}
                      <span style={{fontSize:'11px',fontWeight:400,color:'var(--dim)',marginRight:'3px'}}>DA</span>
                    </p>}
                  </button>
                ))}
              </div>
            </FR>

            <FR label="Quantité">
              <div style={{display:'inline-flex',alignItems:'center',border:'1.5px solid var(--line)',backgroundColor:'var(--white)'}}>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} style={{width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',border:'none',borderLeft:'1px solid var(--line)',background:'transparent',cursor:'pointer',color:'var(--navy)',transition:'background 0.18s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--off)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
                  <Minus style={{width:'12px',height:'12px'}}/>
                </button>
                <span style={{width:'44px',textAlign:'center',fontSize:'1.1rem',fontWeight:700,color:'var(--ink)'}}>{fd.quantity}</span>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))} style={{width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',border:'none',borderRight:'1px solid var(--line)',background:'transparent',cursor:'pointer',color:'var(--navy)',transition:'background 0.18s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--off)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
                  <Plus style={{width:'12px',height:'12px'}}/>
                </button>
              </div>
            </FR>

            {/* Summary */}
            <div style={{border:'1px solid var(--line)',marginBottom:'14px',overflow:'hidden'}}>
              <div style={{padding:'10px 14px',backgroundColor:'var(--navy)',display:'flex',alignItems:'center',gap:'8px'}}>
                <Package style={{width:'13px',height:'13px',color:'var(--blue)'}}/>
                <span className="bc" style={{fontSize:'13px',fontWeight:700,letterSpacing:'0.14em',color:'rgba(255,255,255,0.7)'}}>Résumé de la commande</span>
              </div>
              {[{l:'Produit',v:product.name.slice(0,22)+(product.name.length>22?'...':'')},{l:'Prix',v:`${fp.toLocaleString()} DA`},{l:'Quantité',v:`× ${fd.quantity}`},{l:'Livraison',v:selW?`${getLiv().toLocaleString()} DA`:'—'}].map(row=>(
                <div key={row.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',borderBottom:'1px solid var(--line)',backgroundColor:'var(--white)'}}>
                  <span style={{fontSize:'13px',color:'var(--dim)'}}>{row.l}</span>
                  <span style={{fontSize:'13px',fontWeight:600,color:'var(--ink)'}}>{row.v}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'12px 14px',backgroundColor:'var(--off)'}}>
                <span style={{fontSize:'13px',color:'var(--mid)'}}>Total</span>
                <span style={{fontSize:'1.7rem',fontWeight:700,color:'var(--blue)',letterSpacing:'-0.01em'}}>
                  {total().toLocaleString()} <span style={{fontSize:'13px',fontWeight:400,color:'var(--dim)'}}>DA</span>
                </span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-blue" style={{width:'100%',fontSize:'16px',padding:'13px',letterSpacing:'0.12em',cursor:sub?'not-allowed':'pointer',opacity:sub?0.7:1}}>
              {sub?<><Loader2 style={{width:'15px',height:'15px',animation:'spin 1s linear infinite'}}/> En cours...</>:<>Confirmer la commande <ArrowLeft style={{width:'15px',height:'15px'}}/></>}
            </button>
            <p style={{fontSize:'11px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--dim)',textAlign:'center',marginTop:'10px',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px'}}>
              <Lock style={{width:'10px',height:'10px',color:'var(--blue)'}}/> Paiement Sécurisé et chiffré
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
  const [items, setItems]       = useState<any[]>([]);
  const [wilayas, setWilayas]   = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [fd, setFd] = useState({customerName:'',customerPhone:'',customerWelaya:'',customerCommune:'',typeLivraison:'home' as 'home'|'office'});
  const [errors, setErrors]     = useState<Record<string,string>>({});
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
    if(!fd.customerName.trim()) er.name='requis';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = 'Numéro invalide (ex: 0550123456)';
    if(!fd.customerWelaya) er.w='requis';
    if(!fd.customerCommune) er.c='requis';
    if(Object.keys(er).length){setErrors(er);return;}
    setErrors({}); setSubmitting(true);
    try{
      await axios.post(`${API_URL}/orders/create`,items.map(i=>({...fd,productId:i.productId,storeId:i.storeId,userId:i.userId,selectedOffer:i.selectedOffer,variantDetailId:i.variantDetailId,selectedVariants:i.selectedVariants,platform:i.platform||'store',finalPrice:i.finalPrice,totalPrice:finalTotal,priceLivraison:+getLiv(),quantity:i.quantity,customerId:i.customerId||'',priceLoss:selW?.livraisonReturn??0})));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    }catch{}finally{setSubmitting(false);}
  };

  const onFocus = (e:React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => { e.target.style.borderColor='var(--blue)'; };
  const onBlur  = (e:React.FocusEvent<HTMLInputElement|HTMLSelectElement>, err?:boolean) => { e.target.style.borderColor=err?'#C0392B':'var(--line)'; };

  if(success) return (
    <div dir="rtl" style={{minHeight:'70vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',background:'var(--off)'}}>
      <div style={{textAlign:'center',background:'var(--white)',padding:'4rem 2.5rem',border:'1px solid var(--line)',borderTop:'3px solid var(--blue)',maxWidth:460,width:'100%'}}>
        <CheckCircle2 style={{width:'48px',height:'48px',color:'var(--blue)',display:'block',margin:'0 auto 1.25rem'}}/>
        <h2 className="bc" style={{fontSize:'2rem',fontWeight:800,color:'var(--navy)',marginBottom:'0.5rem',letterSpacing:'0.04em'}}>Commande reçue !</h2>
        <p style={{color:'var(--mid)',marginBottom:'2rem',lineHeight:1.7,fontSize:'14px'}}>Merci de votre confiance. Nous vous contacterons bient’t pour confirmer votre commande.</p>
        <Link href="/" className="btn-blue" style={{display:'inline-flex',padding:'12px 32px'}}>Retour à la boutique</Link>
      </div>
    </div>
  );

  if(!items.length) return (
    <div dir="rtl" style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',background:'var(--off)'}}>
      <div style={{textAlign:'center',padding:'4rem 2rem',border:'2px dashed var(--line)',maxWidth:400,width:'100%'}}>
        <Package style={{width:'48px',height:'48px',color:'var(--dim)',opacity:0.3,display:'block',margin:'0 auto 1.25rem'}}/>
        <p className="bc" style={{fontSize:'1.375rem',fontWeight:800,color:'var(--dim)',marginBottom:'0.5rem',letterSpacing:'0.04em'}}>Panier vide</p>
        <p style={{fontSize:'13px',color:'var(--mist)',marginBottom:'1.75rem'}}>Ajoutez quelques Produits et commencez vos achats</p>
        <Link href="/" className="btn-blue" style={{display:'inline-flex',padding:'12px 32px'}}>Acheter maintenant</Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{minHeight:'100vh',background:'var(--off)',padding:'2.5rem 1.5rem 5rem'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:'2rem',paddingBottom:'1rem',borderBottom:'3px solid var(--blue)'}}>
          <h1 className="bc" style={{fontSize:'clamp(1.75rem,4vw,2.5rem)',fontWeight:900,color:'var(--navy)',letterSpacing:'0.04em'}}>Panier</h1>
          <span style={{fontSize:'13px',color:'var(--dim)',fontWeight:500}}>{items.length} Produit</span>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div style={{background:'var(--white)',border:'1px solid var(--line)',borderTop:'3px solid var(--blue)',alignSelf:'start'}}>
            {items.map((item,i)=>(
              <div key={i} style={{display:'flex',gap:'1rem',padding:'14px',borderBottom:'1px solid var(--line)'}}>
                <div style={{width:80,height:80,flexShrink:0,overflow:'hidden',border:'1px solid var(--line)',background:'var(--light)'}}>
                  <img src={item.product?.imagesProduct?.[0]?.imageUrl||item.product?.productImage} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt=""/>
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                  <div>
                    <h4 style={{fontWeight:600,color:'var(--ink)',fontSize:'13px',lineHeight:1.4,marginBottom:'4px'}}>{item.product?.name}</h4>
                    <p style={{fontSize:'1.1rem',fontWeight:700,color:'var(--blue)'}}>{item.finalPrice?.toLocaleString()} DA</p>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'8px'}}>
                    <div style={{display:'inline-flex',alignItems:'center',border:'1px solid var(--line)'}}>
                      <button onClick={()=>changeQty(i,-1)} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',borderLeft:'1px solid var(--line)',transition:'background 0.15s'}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--off)';}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>-</button>
                      <span style={{width:32,textAlign:'center',fontWeight:700,fontSize:'0.9rem',lineHeight:'28px'}}>{item.quantity}</span>
                      <button onClick={()=>changeQty(i,1)} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',borderRight:'1px solid var(--line)',transition:'background 0.15s'}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--off)';}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>+</button>
                    </div>
                    <button onClick={()=>update(items.filter((_,idx)=>idx!==i))} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',border:'none',background:'transparent',color:'var(--dim)',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'color 0.15s'}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#C0392B';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--dim)';}}>
                      <Trash2 size={13}/> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:'14px',background:'var(--off)'}}>
              <span style={{fontWeight:600,fontSize:'13px',color:'var(--mid)'}}>Sous-total</span>
              <span style={{fontSize:'1.375rem',fontWeight:700,color:'var(--navy)'}}>{cartTotal.toLocaleString()} DA</span>
            </div>
          </div>

          {/* Checkout */}
          <div style={{background:'var(--white)',border:'1px solid var(--line)',borderTop:'3px solid var(--blue)',padding:'22px',alignSelf:'start'}}>
            <p className="bc" style={{fontSize:'13px',fontWeight:700,letterSpacing:'0.14em',color:'var(--blue)',marginBottom:'18px'}}>// Finaliser la commande</p>
            <form onSubmit={handleSubmit}>
              <div className="form-2c">
                <FR error={errors.name} label="Nom">
                  <div style={{position:'relative'}}>
                    <User style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                    <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} style={{...INP(!!errors.name),paddingLeft:'36px'}} onFocus={onFocus} onBlur={e=>onBlur(e,!!errors.name)}/>
                  </div>
                </FR>
                <FR error={errors.phone} label="Téléphone">
                  <div style={{position:'relative'}}>
                    <Phone style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                    <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} style={{...INP(!!errors.phone),paddingLeft:'36px'}} onFocus={onFocus} onBlur={e=>onBlur(e,!!errors.phone)}/>
                  </div>
                </FR>
              </div>
              <div className="form-2c">
                <FR error={errors.w} label="Wilaya">
                  <div style={{position:'relative'}}>
                    <ChevronDown style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                    <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} style={{...INP(!!errors.w),paddingRight:'34px'}} onFocus={onFocus} onBlur={e=>onBlur(e,!!errors.w)}>
                      <option value="">Choisir</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
                <FR error={errors.c} label="Commune">
                  <div style={{position:'relative'}}>
                    <ChevronDown style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                    <select value={fd.customerCommune} disabled={loadingC||!fd.customerWelaya} onChange={e=>setFd({...fd,customerCommune:e.target.value})} style={{...INP(!!errors.c),paddingRight:'34px',opacity:!fd.customerWelaya?0.4:1}} onFocus={onFocus} onBlur={e=>onBlur(e,!!errors.c)}>
                      <option value="">{loadingC?'...':'Choisir'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
              </div>

              {/* Summary */}
              <div style={{border:'1px solid var(--line)',marginBottom:'14px',overflow:'hidden'}}>
                {[{l:'Sous-total',v:`${cartTotal.toLocaleString()} DA`},{l:'Livraison',v:getLiv()?`${getLiv().toLocaleString()} DA`:'—'}].map(row=>(
                  <div key={row.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',borderBottom:'1px solid var(--line)',background:'var(--white)'}}>
                    <span style={{fontSize:'13px',color:'var(--dim)'}}>{row.l}</span>
                    <span style={{fontSize:'13px',fontWeight:600,color:'var(--ink)'}}>{row.v}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'12px 14px',background:'var(--off)'}}>
                  <span style={{fontSize:'13px',color:'var(--mid)'}}>Total</span>
                  <span style={{fontSize:'1.7rem',fontWeight:700,color:'var(--blue)',letterSpacing:'-0.01em'}}>
                    {finalTotal.toLocaleString()} <span style={{fontSize:'13px',fontWeight:400,color:'var(--dim)'}}>DA</span>
                  </span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-blue" style={{width:'100%',fontSize:'16px',padding:'13px',cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.7:1}}>
                {submitting?<><Loader2 style={{width:'15px',height:'15px',animation:'spin 1s linear infinite'}}/> En cours...</>:<>Confirmer la commande <ArrowLeft style={{width:'15px',height:'15px'}}/></>}
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
      {p==='privacy'  && <Privacy/>}
      {p==='terms'    && <Terms/>}
      {p==='cookies'  && <Cookies/>}
      {p==='contact'  && <Contact store={store}/>}
    </>
  );
}

const Shell = ({ children, title, sub }: { children:React.ReactNode; title:string; sub?:string }) => (
  <div dir="rtl" style={{backgroundColor:'var(--off)',minHeight:'100vh'}}>
    <div style={{backgroundColor:'var(--navy)',padding:'64px 24px 48px',borderBottom:'3px solid var(--blue)',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,opacity:0.04}} className="dot-bg"/>
      <div style={{maxWidth:'720px',margin:'0 auto',position:'relative',zIndex:2}}>
        {sub && <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.24em',color:'var(--blue)',marginBottom:'10px'}}>{sub}</p>}
        <h1 className="bc" style={{fontSize:'clamp(2.5rem,7vw,6rem)',fontWeight:800,letterSpacing:'0.04em',color:'white',lineHeight:0.88,margin:'0 0 12px'}}>{title.toUpperCase()}</h1>
        <div style={{width:'48px',height:'3px',background:'var(--blue)'}}/>
      </div>
    </div>
    <div style={{maxWidth:'720px',margin:'0 auto',padding:'40px 24px 80px'}}>
      <div style={{backgroundColor:'var(--white)',border:'1px solid var(--line)',padding:'32px'}}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title:string; body:string; tag?:string }) => (
  <div style={{paddingBottom:'20px',marginBottom:'20px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between',gap:'16px',alignItems:'flex-start'}}>
    <div style={{flex:1}}>
      <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--ink)',margin:'0 0 7px',display:'flex',alignItems:'center',gap:'8px'}}>
        <span style={{color:'var(--blue)',fontSize:'12px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,textTransform:'uppercase'}}>//</span>{title}
      </h3>
      <p style={{fontSize:'13px',lineHeight:'1.85',color:'var(--mid)',fontWeight:400,margin:0}}>{body}</p>
    </div>
    {tag && <span className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.14em',padding:'4px 10px',border:'1px solid var(--blue)',color:'var(--blue)',flexShrink:0,marginTop:'2px'}}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="Confidentialité" sub="// Légal">
      <IB title="Les données que nous collectons" body="uniquement Votre nom et numéro de هاتفك et adresse de Livraison — le minimum nécessaire pour traiter votre commande."/>
      <IB title="Comment nous les utilisons"        body="Exclusivement pour traiter et livrer vos achats. Aucun usage commercial de vos données."/>
      <IB title="Sécurité"               body="Vos données sont protégées par un chiffrement standard et une infrastructure sécurisée en tout temps."/>
      <IB title="Partage des données"      body="Nous ne vendons pas vos données. Partagées avec les partenaires de livraison de confiance." tag="Garanti"/>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="Conditions" sub="// Légal">
      <IB title="Commandes et paiements"  body="Aucuns frais cachés. Le prix affiché est le prix final."/>
      <IB title="Produits authentiques"    body="Produits authentiques uniquement. Les contrefaçons sont strictement interdites." tag="Strict"/>
      <IB title="Loi applicable"      body="Ces Conditions sont soumises aux lois de la République Algérienne Démocratique et Populaire."/>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="Cookies" sub="// Légal">
      <IB title="Cookies essentiels"    body="Essentiels pour les sessions et Panier et le paiement. Non désactivables." tag="requis"/>
      <IB title="Cookies de préférences"    body="Mémorise votre langue et région pour une meilleure expérience Shopping." tag="Facultatif"/>
      <IB title="Cookies analytiques"    body="Données agrégées pour améliorer les performances de la plateforme. Aucune donnée personnelle." tag="Facultatif"/>
      <div style={{marginTop:'16px',padding:'14px',border:'1px solid var(--line)',display:'flex',gap:'12px',alignItems:'flex-start',backgroundColor:'var(--off)'}}>
        <ToggleRight style={{width:'18px',height:'18px',color:'var(--blue)',flexShrink:0,marginTop:'1px'}}/>
        <p style={{fontSize:'13px',color:'var(--mid)',lineHeight:'1.8',margin:0}}>Vous pouvez gérer vos préférences de cookies depuis les paramètres de votre navigateur.</p>
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store?:any }) {
  const [form, setForm] = useState({name:'',email:'',phone:'',message:''});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`,{...form,storeId:store?.id}); setSent(true); }
    catch { showError('Une Erreur est survenue'); } finally { setLoading(false); }
  };
  const onF=(e:React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>)=>{e.target.style.borderColor='var(--blue)';};
  const onB=(e:React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>)=>{e.target.style.borderColor='var(--line)';};

  return (
    <div dir="rtl" style={{backgroundColor:'var(--off)',minHeight:'100vh'}}>
      <div style={{backgroundColor:'var(--navy)',padding:'64px 24px 48px',borderBottom:'3px solid var(--blue)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04}} className="dot-bg"/>
        <div style={{maxWidth:'960px',margin:'0 auto',position:'relative',zIndex:2}}>
          <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.24em',color:'var(--blue)',marginBottom:'10px'}}>// Contact</p>
          <h1 className="bc" style={{fontSize:'clamp(2.5rem,7vw,6rem)',fontWeight:800,letterSpacing:'0.04em',color:'white',lineHeight:0.88,margin:'0 0 12px'}}>Contactez-nous</h1>
          <p className="bc" style={{fontSize:'14px',fontWeight:600,letterSpacing:'0.14em',color:'rgba(255,255,255,0.4)'}}>نRéponse sous 24h</p>
        </div>
      </div>

      <div className="contact-g" style={{maxWidth:'960px',margin:'0 auto',padding:'40px 24px 80px'}}>
        {/* Info */}
        <div>
          <div style={{backgroundColor:'var(--white)',border:'1px solid var(--line)',padding:'24px',marginBottom:'12px'}}>
            <p className="bc" style={{fontSize:'13px',fontWeight:700,letterSpacing:'0.16em',color:'var(--blue)',marginBottom:'18px'}}>// Moyens de contact</p>
            {[
              {icon:'📞',label:'Téléphone',val:store?.contact?.phone},
              {icon:'✉️',label:'Email',val:store?.contact?.email},
              {icon:'📍',label:'Adresse',val:[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ')},
            ].filter(r=>r.val).map(item=>(
              <div key={item.label} style={{display:'flex',alignItems:'center',gap:'14px',padding:'13px 0',borderBottom:'1px solid var(--line)',transition:'padding-right 0.2s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.paddingRight='8px';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.paddingRight='0';}}>
                <div style={{width:'38px',height:'38px',backgroundColor:'var(--off)',border:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>{item.icon}</div>
                <div>
                  <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.16em',color:'var(--blue)',margin:'0 0 2px'}}>{item.label}</p>
                  <p style={{fontSize:'13px',fontWeight:600,color:'var(--ink)',margin:0}}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{backgroundColor:'var(--navy)',padding:'20px 22px'}}>
            <p className="bc" style={{fontSize:'14px',fontWeight:800,letterSpacing:'0.08em',color:'white',lineHeight:1.4,margin:'0 0 6px'}}>
              Performance sans limites.<br/><span style={{color:'var(--blue)'}}>Préparez-vous.</span>
            </p>
            <span className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.2em',color:'rgba(255,255,255,0.35)'}}>OMNI-FLEX UNIVERSAL v2</span>
          </div>
        </div>

        {/* Form */}
        <div style={{backgroundColor:'var(--white)',border:'1px solid var(--line)',padding:'28px'}}>
          <p className="bc" style={{fontSize:'13px',fontWeight:700,letterSpacing:'0.16em',color:'var(--blue)',marginBottom:'22px'}}>// Envoyer un message</p>
          {sent ? (
            <div style={{minHeight:'220px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:'1px solid var(--line)',textAlign:'center',backgroundColor:'var(--off)',padding:'32px'}}>
              <CheckCircle2 style={{width:'32px',height:'32px',color:'var(--blue)',marginBottom:'14px'}}/>
              <h3 className="bc" style={{fontSize:'1.6rem',fontWeight:800,letterSpacing:'0.08em',color:'var(--navy)',margin:'0 0 8px'}}>Envoyé !</h3>
              <p style={{fontSize:'13px',color:'var(--mid)'}}>Nous vous répondrons sous 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div className="form-2c">
                <div>
                  <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.16em',color:'var(--mid)',marginBottom:'6px'}}>Nom</p>
                  <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required style={INP()} onFocus={onF} onBlur={onB}/>
                </div>
                <div>
                  <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.16em',color:'var(--mid)',marginBottom:'6px'}}>Téléphone</p>
                  <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required style={INP()} onFocus={onF} onBlur={onB}/>
                </div>
              </div>
              <div>
                <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.16em',color:'var(--mid)',marginBottom:'6px'}}>Email</p>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required style={INP()} onFocus={onF} onBlur={onB}/>
              </div>
              <div>
                <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.16em',color:'var(--mid)',marginBottom:'6px'}}>Votre message</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Comment pouvons-nous vous aider ?" rows={4} required
                  style={{...INP(),resize:'none'}} onFocus={onF} onBlur={onB}/>
              </div>
              <button type="submit" disabled={loading} className="btn-blue" style={{justifyContent:'center',width:'100%',fontSize:'15px',padding:'13px',opacity:loading?0.7:1,cursor:loading?'not-allowed':'pointer'}}>
                {loading?<><Loader2 style={{width:'15px',height:'15px',animation:'spin 1s linear infinite'}}/> En cours...</>:<>Envoyer <ArrowLeft style={{width:'14px',height:'14px'}}/></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}