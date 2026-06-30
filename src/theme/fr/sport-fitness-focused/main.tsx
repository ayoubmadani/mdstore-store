'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Share2, Phone, User, ToggleRight,
  ArrowRight, CheckCircle2, Lock,
  Menu, Zap, Flame, Dumbbell, Trophy, Shield, Truck,
  Package, Target, TrendingUp, Search,
  ShoppingCart, Trash2, Loader2, Minus, Plus, MapPin,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   FITNESS FIRE — Dark Sports Theme
   ─────────────────────────────────────────────────────────────
   Black #0A0A0A · Fire #FF4500 · Gold #FFB800 · Green #39FF14
   Fonts: Bebas Neue (display) + Barlow Condensed + Barlow
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;900&family=Barlow+Condensed:wght@600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; margin:0; padding:0; }

  :root {
    --black:   #0A0A0A;
    --dark:    #111111;
    --panel:   #1A1A1A;
    --panel-2: #222222;
    --fire:    #FF4500;
    --fire-2:  #E03800;
    --gold:    #FFB800;
    --gold-2:  #E6A000;
    --white:   #F5F5F5;
    --mid:     #888888;
    --dim:     #444444;
    --line:    #2A2A2A;
    --green:   #39FF14;
  }

  body { background: var(--black); color: var(--white); font-family: 'Barlow', sans-serif; }
  a    { text-decoration: none; color: inherit; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: var(--fire); }

  .bb { font-family: 'Bebas Neue', cursive; letter-spacing: 0.04em; }
  .bc { font-family: 'Barlow Condensed', sans-serif; }

  /* Keyframes */
  @keyframes flicker {
    0%,100%{ opacity:1; transform:scaleY(1) skewX(-2deg); }
    25%     { opacity:.9; transform:scaleY(1.04) skewX(1deg); }
    50%     { opacity:.95; transform:scaleY(.97) skewX(-3deg); }
    75%     { opacity:.88; transform:scaleY(1.02) skewX(2deg); }
  }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin   { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in{ from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

  .fu-1 { animation: fadeUp 0.6s ease both 0.1s; }
  .fu-2 { animation: fadeUp 0.6s ease both 0.25s; }
  .fu-3 { animation: fadeUp 0.6s ease both 0.4s; }
  .anim-check { animation: check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* Section label */
  .s-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 0.3em;
    text-transform: uppercase; color: var(--fire);
    display: flex; align-items: center; gap: 8px;
  }
  .s-label::before { content: '//'; color: var(--gold); }

  /* Fire card */
  .fire-card {
    background: var(--panel); border: 1px solid var(--line);
    position: relative; overflow: hidden; transition: transform 0.3s, border-color 0.3s;
  }
  .fire-card::before {
    content:''; position: absolute; top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--fire), var(--gold), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .fire-card:hover { transform: translateY(-4px); border-color: var(--fire); }
  .fire-card:hover::before { opacity: 1; }

  /* Product card */
  .p-card {
    background: var(--panel); border: 1px solid var(--line);
    overflow: hidden; transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer; display: flex; flex-direction: column;
  }
  .p-card:hover { transform: translateY(-5px) rotate(-0.3deg); box-shadow: 0 12px 40px rgba(255,69,0,0.2); border-color: var(--fire); }
  .p-card:hover .p-img img { transform: scale(1.06); }
  .p-img img { display:block; width:100%; height:100%; object-fit:cover; transition: transform 0.4s ease; }

  /* Buttons */
  .btn-fire {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--fire); color: white;
    font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 800;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 13px 32px; border: none; cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    transition: all 0.2s;
  }
  .btn-fire:hover { background: var(--fire-2); box-shadow: 0 0 30px rgba(255,69,0,0.5); transform: translateY(-2px); }
  .btn-fire:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  .btn-gold {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--gold); color: var(--black);
    font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 800;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 13px 32px; border: none; cursor: pointer;
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    transition: all 0.2s;
  }
  .btn-gold:hover { background: var(--gold-2); transform: translateY(-2px); }

  /* Inputs */
  .inp {
    width: 100%; padding: 12px 14px;
    background: var(--panel-2); border: 1.5px solid var(--dim);
    font-family: 'Barlow', sans-serif; font-size: 14px; color: var(--white);
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .inp:focus { border-color: var(--fire); box-shadow: 0 0 0 3px rgba(255,69,0,0.15); }
  .inp::placeholder { color: var(--dim); }
  .inp-err { border-color: #ef4444 !important; }
  select.inp { appearance: none; cursor: pointer; }

  /* Ticker stripe */
  .ticker-stripe { overflow: hidden; white-space: nowrap; }
  .ticker-inner  { display: inline-block; animation: ticker 22s linear infinite; }

  /* Motivational stripe */
  .moto-inner { display: inline-block; animation: ticker 18s linear infinite; }

  /* Grid responsive */
  .prod-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .cat-row    { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  .trust-row  { display: grid; grid-template-columns: repeat(4,1fr); }
  .footer-g   { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; }
  .details-g  { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .contact-g  { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
  .form-2c    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .dlv-2c     { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .cart-layout{ display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: start; }
  .thumb-row  { display: flex; gap: 8px; flex-wrap: wrap; }
  .pagination { display: flex; justify-content: center; gap: 6px; margin-top: 40px; flex-wrap: wrap; }

  .nav-search-d { display: none; }
  @media (min-width: 1024px) { .nav-search-d { display: block; } }

  @media (max-width: 1024px) {
    .prod-grid  { grid-template-columns: repeat(3,1fr); }
    .footer-g   { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width: 768px) {
    .prod-grid  { grid-template-columns: 1fr; gap: 10px; }
    .cat-row    { grid-template-columns: repeat(2,1fr); }
    .trust-row  { grid-template-columns: repeat(2,1fr); }
    .footer-g   { grid-template-columns: 1fr; gap: 28px; }
    .details-g  { grid-template-columns: 1fr; }
    .contact-g  { grid-template-columns: 1fr; gap: 24px; }
    .cart-layout{ grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .form-2c    { grid-template-columns: 1fr; }
    .dlv-2c     { grid-template-columns: 1fr; }
  }
`;

/* ─── Fire SVG ─── */
function FireIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 32 42" fill="none" style={{ animation: 'flicker 1.8s ease-in-out infinite' }}>
      <path d='M16 2C16 2 22 10 20 18C24 14 26 8 24 2C30 8 32 18 28 26C32 22 34 14 30 6C36 14 36 28 28 36C24 40 20 42 16 42C12 42 8 40 4 36C-4 28 -4 14 2 6C0 14 2 22 6 26C2 18 4 8 10 2C8 8 10 14 14 18C12 10 16 2 16 2Z' fill="url(#fg)" opacity="0.95"/>
      <path d="M16 18C16 18 19 22 18 26C20 24 21 20 20 16C22 20 22 26 20 30C21 28 22 24 21 20C24 24 24 32 20 36C18 38 17 39 16 39C15 39 14 38 12 36C8 32 8 24 11 20C10 24 11 28 12 30C10 26 10 20 12 16C11 20 12 24 14 26C13 22 16 18 16 18Z" fill="url(#fg2)" opacity="0.9"/>
      <defs>
        <linearGradient id="fg" x1="16" y1="2" x2="16" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD700"/><stop offset="0.4" stopColor="#FF6500"/><stop offset="1" stopColor="#CC2000"/>
        </linearGradient>
        <linearGradient id="fg2" x1="16" y1="16" x2="16" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFDE7"/><stop offset="0.5" stopColor="#FFD700"/><stop offset="1" stopColor="#FF4500"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── TYPES ─── */
interface Offer     { id: string; name: string; quantity: number; price: number; }
interface Variant   { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color'|'image'|'text'|null; variants: Variant[]; }
interface ProductImage          { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color'|'image'|'text'; value: string; }
interface VariantDetail         { id: string|number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya  { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
export interface Product {
  id: string; name: string; price: string|number; priceOriginal?: string|number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string|null; setSelectedOffer: (id: string|null) => void;
  selectedVariants: Record<string,string>; platform?: string; priceLoss?: number;
}

const vm = (d: VariantDetail, s: Record<string,string>) =>
  Object.entries(s).every(([n,v]) => d.name.some(e => e.attrName===n && e.value===v));
const fetchWilayas  = async (uid: string): Promise<Wilaya[]>  => { try { const {data} = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }};
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const {data} = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }};

const INP_S = (err?: boolean): React.CSSProperties => ({
  width:'100%', padding:'12px 14px', background:'var(--panel-2)',
  border:`1.5px solid ${err?'#ef4444':'var(--dim)'}`,
  fontFamily:"'Barlow',sans-serif", fontSize:'14px', color:'var(--white)',
  outline:'none', transition:'border-color 0.2s', appearance:'none'
});

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{marginBottom:'14px',direction:'rtl'}}>
    {label && <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--mid)',marginBottom:'6px',textAlign:'right'}}>{label}</p>}
    {children}
    {error && <p style={{fontSize:'11px',color:'#ef4444',marginTop:'4px',display:'flex',alignItems:'center',gap:'4px',justifyContent:'flex-end'}}>
      {error}<AlertCircle style={{width:'11px',height:'11px'}}/>
    </p>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div style={{minHeight:'100vh',backgroundColor:'var(--black)'}}>
      <style>{CSS}</style>
      <Navbar store={store} domain={domain}/>
      <main>{children}</main>
      <Footer store={store}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR - FIRE GYM EDITION (PRO)
═══════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sq, setSq]             = useState('');
  const [ls, setLs]             = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  
  const count    = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);
  

  // 1. Observer le défilement pour changer l'arrière-plan du header
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  // 2. Récupérer le nombre d'éléments du panier depuis le stockage local
  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { initCount(JSON.parse(localStorage.getItem(domain)||'[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  // 3. Logique de recherche directe (recherche avec délai)
  useEffect(() => {
    if (sq.length < 2) { setLs([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const {data} = await axios.get(`${API_URL}/products/public/${domain}`, {params:{search:sq}}); setLs(data.products||[]); }
      catch {} finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [sq, domain]);

  const doSearch = (e?: React.FormEvent) => { 
    if(e) e.preventDefault(); 
    if(sq.trim()) { 
      router.push(`/?search=${encodeURIComponent(sq)}`); 
      setSq(''); 
      setShowSearch(false); 
    }
  };

  // 4. Liste des résultats de recherche fiable
  const SearchDrop = () => (
  <div style={{
    position: 'absolute', 
    top: 'calc(100% + 6px)', 
    right: 0, 
    left: 0, 
    background: 'var(--panel)', 
    border: '1px solid var(--fire)', 
    zIndex: 200, 
    overflow: 'hidden', 
    boxShadow: '0 12px 40px rgba(255,69,0,0.2)',
    borderRadius: '4px'
  }} className="anim-slide-down">
    
    {/* Bouton fermer la liste */}
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 14px 2px' }}>
      <button 
        onClick={() => setSq('')}
        style={{ 
          background: 'rgba(255, 69, 0, 0.1)', 
          border: 'none', 
          borderRadius: '50%', 
          width: 26, 
          height: 26, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer',
          color: 'var(--fire)',
          transition: 'all 0.2s'
        }}
      >
        <X size={12} />
      </button>
    </div>

    {loading ? (
      <div style={{padding:'1.5rem', textAlign:'center', color:'var(--fire)', fontFamily:"'Barlow',sans-serif", fontWeight:700, letterSpacing:'0.1em'}}>Recherche en cours...</div>
    ) : ls.length > 0 ? (
      <div style={{maxHeight:'320px', overflowY:'auto'}}>
        {ls.map((p:any) => (
          <Link href={`/product/${p.id}`} key={p.id} onClick={()=>setSq('')}
            style={{display:'flex', alignItems:'center', gap:'0.75rem', padding:'12px 14px', borderBottom:'1px solid var(--line)', textDecoration:'none'}}>
            <img src={p.productImage||p.imagesProduct?.[0]?.imageUrl} style={{width:40, height:40, objectFit:'cover', flexShrink:0, borderRadius:'4px'}} alt=""/>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px', fontWeight:700, color:'var(--white)', fontFamily:"'Barlow',sans-serif", textTransform:'uppercase'}}>{p.name}</div>
              <div style={{fontSize:'14px', color:'var(--fire)', fontWeight:700}}>{p.price} DA</div>
            </div>
          </Link>
        ))}
        {/* Bouton Voir plus dans la liste */}
        <button onClick={() => doSearch()} style={{
          width:'100%', padding:'12px', background:'rgba(255,69,0,0.05)', border:'none', 
          borderTop:'1px solid var(--line)', color:'var(--fire)', fontWeight:800, 
          fontSize:'12px', cursor:'pointer', fontFamily:"'Barlow',sans-serif", letterSpacing:'0.1em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }}>
          Voir tous les résultats <ArrowRight size={12} />
        </button>
      </div>
    ) : sq.length >= 2 && (
      <div style={{padding:'1.5rem', textAlign:'center', color:'var(--mid)', fontSize:'13px'}}>Aucun résultat correspondant</div>
    )}
  </div>
);

  return (
    <header dir="ltr" style={{position:'sticky', top:0, zIndex:100, fontFamily:"'Barlow',sans-serif"}}>
      
      {/* Ticker - barre d'annonces défilante */}
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="ticker-stripe" style={{background:'var(--fire)', padding:'6px 0'}}>
          <div className="ticker-inner">
            {Array(10).fill(null).map((_,i) => (
              <span key={i} style={{fontSize:'11px', fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'white', margin:'0 30px'}}>
                ⚡ {store.topBar.text} ⚡
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div style={{
        backgroundColor: scrolled ? 'rgba(10,10,10,0.98)' : 'var(--black)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--fire)' : 'var(--line)'}`,
        transition: 'all 0.3s ease'
      }}>
        <div style={{maxWidth:'1280px', margin:'0 auto', padding:'0 20px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px'}}>

          {/* Logo */}
          <Link href="/" style={{display:'flex', alignItems:'center', gap:'10px', flexShrink:0, textDecoration:'none'}}>
            {(store.design.logoUrl && store.design.logoUrl !== '/default-logo.png')
              ? <img src={store.design.logoUrl} alt={store.name} style={{height:'32px', width:'auto', objectFit:'contain'}}/>
              : <span style={{fontSize:'1.4rem', fontWeight:900, color:'var(--white)', letterSpacing:'-0.02em', fontFamily:"'Barlow',sans-serif" , textTransform : 'uppercase'}}>
                  {(store?.name||'').split(' ')[0]}<span style={{color:'var(--fire)'}}>{' '}{(store?.name||'').split(' ').slice(1).join(' ')}</span>
                </span>
            }
          </Link>

          {/* Desktop Search */}
          <div  className="nav-search-d" style={{flex:1, maxWidth:350, position:'relative'}}>
            <form onSubmit={doSearch} style={{position:'relative'}}>
              <input type="text" placeholder="Rechercher des équipements..." value={sq} onChange={e=>setSq(e.target.value)}
                className="inp" style={{padding:'10px 40px 10px 14px', fontSize:'13px', background:'rgba(255,255,255,0.04)', borderRadius:'4px'}}/>
              <Search size={14} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--mid)'}}/>
            </form>
            {sq.length >= 2 && <SearchDrop/>}
          </div>

          {/* Nav Icons & Links */}
          <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
            
            {/* Desktop Links */}
            <div  style={{ alignItems:'center', gap:'24px'}} className='hidden lg:flex'>
              {[{h:'/',l:'Accueil'}, {h:'/contact',l:'Contactez-nous'}].map(i=>(
                <Link key={i.h} href={i.h} style={{fontSize:'13px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--mid)', textDecoration:'none', transition:'0.2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='var(--fire)')}
                  onMouseLeave={e=>(e.currentTarget.style.color='var(--mid)')}>
                  {i.l}
                </Link>
              ))}
            </div>

            {/* Mobile Search Button */}
            <button onClick={()=>setShowSearch(!showSearch)} className="lg:hidden" style={{background:'none', border:'none', color:'var(--mid)', cursor:'pointer'}}>
              <Search size={20}/>
            </button>

            {/* Cart Logic (Conditional) */}
            {store?.cart === true && (
              <Link href="/cart" style={{position:'relative', color:'var(--white)', transition:'0.2s', textDecoration:'none'}}
                onMouseEnter={e=>(e.currentTarget.style.color='var(--fire)')}
                onMouseLeave={e=>(e.currentTarget.style.color='var(--white)')}>
                <ShoppingCart size={22}/>
                {count > 0 && (
                  <span style={{
                    position:'absolute', top:-6, right:-8, background:'var(--fire)', color:'white', 
                    fontSize:'10px', fontWeight:800, width:'17px', height:'17px', 
                    borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    border:'2px solid var(--black)'
                  }}>{count}</span>
                )}
              </Link>
            )}

            {/* Menu Toggle */}
            <button  onClick={()=>setOpen(!open)} className="lg:hidden" style={{background:'var(--fire)', border:'none', color:'white', padding:'6px', borderRadius:'4px', cursor:'pointer'}}>
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Live Search Bar */}
      {showSearch && (
        <div style={{background:'var(--dark)', borderBottom:'1px solid var(--fire)', padding:'12px 20px', position:'relative'}} className="anim-slide-down">
          <form onSubmit={doSearch} style={{position:'relative'}}>
            <input autoFocus type="text" placeholder="Rechercher ici..." value={sq} onChange={e=>setSq(e.target.value)}
              className="inp" style={{padding:'12px 40px 12px 14px'}}/>
            <Search size={16} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--fire)'}}/>
          </form>
          {sq.length >= 2 && <SearchDrop/>}
        </div>
      )}

      {/* Mobile Menu Content */}
      <div className="block lg:hidden" style={{
        maxHeight: open ? '300px' : '0', 
        overflow:'hidden', transition:'all 0.4s ease', 
        backgroundColor:'var(--dark)', borderBottom: open ? '2px solid var(--fire)' : 'none'
      }}>
        <div style={{padding:'15px 25px 25px'}}>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <Link href="/" onClick={()=>setOpen(false)} style={{display:'flex', justifyContent:'space-between', padding:'12px 0', fontSize:'14px', fontWeight:800, color:'var(--white)', textDecoration:'none', borderBottom:'1px solid var(--line)', textTransform:'uppercase'}}>
              Accueil <ArrowRight size={14} style={{color:'var(--fire)'}}/>
            </Link>
            <Link href="/contact" onClick={()=>setOpen(false)} style={{display:'flex', justifyContent:'space-between', padding:'12px 0', fontSize:'14px', fontWeight:800, color:'var(--white)', textDecoration:'none', borderBottom:'1px solid var(--line)', textTransform:'uppercase'}}>
              Contactez-nous <ArrowRight size={14} style={{color:'var(--fire)'}}/>
            </Link>

            <button onClick={()=>{router.push('/#products'); setOpen(false);}} className="btn-fire" style={{marginTop:'15px', width:'100%', clipPath:'none', borderRadius:'4px', fontWeight:800}}>
              <Dumbbell size={16} style={{marginLeft:8}}/> Acheter les équipements maintenant
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — 3 sections
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  return (
    <footer dir="ltr" style={{backgroundColor:'var(--dark)',borderTop:'2px solid var(--fire)',fontFamily:"'Barlow',sans-serif"}}>
      {/* Moto stripe */}
      <div style={{overflow:'hidden',whiteSpace:'nowrap',background:'var(--fire)',padding:'10px 0'}}>
        <div className="moto-inner">
          {Array(8).fill(null).map((_,i) => <span key={i} className="bc" style={{fontSize:'12px',fontWeight:800,letterSpacing:'0.25em',textTransform:'uppercase',color:'white',margin:'0 40px'}}>Zéro jour de repos // Entraînez-vous avec force // Soyez plus fort // Dépassez vos limites //</span>)}
          {Array(8).fill(null).map((_,i) => <span key={`b${i}`} className="bc" style={{fontSize:'12px',fontWeight:800,letterSpacing:'0.25em',textTransform:'uppercase',color:'white',margin:'0 40px'}}>Zéro jour de repos // Entraînez-vous avec force // Soyez plus fort // Dépassez vos limites //</span>)}
        </div>
      </div>

      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'48px 20px 32px'}}>
        <div className="footer-g" style={{paddingBottom:'36px',borderBottom:'1px solid var(--line)'}}>

          {/* Section 1 */}
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
              <FireIcon size={22}/>
              {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png'
                ? <img src={store.design.logoUrl} alt={store?.name} style={{height:'26px',filter:'grayscale(1) brightness(2)',opacity:0.8}}/>
                : <span className="bb" style={{fontSize:'1.4rem',color:'var(--white)'}}>{store?.name}</span>
              }
            </div>
            <p style={{fontSize:'13px',lineHeight:'1.7',color:'var(--mid)',maxWidth:'240px',fontWeight:400}}>
              {store?.hero?.subtitle?.substring(0,80) || 'Boostez vos performances. Équipements Fitness premium pour sportifs sérieux.'}
            </p>
            <div style={{marginTop:'14px',display:'flex',alignItems:'center',gap:'8px'}}>
              <Truck style={{width:'14px',height:'14px',color:'var(--fire)'}}/>
              <span style={{fontSize:'12px',fontWeight:600,color:'var(--gold)'}}>Livraison gratuite pour les commandes +5000 DA</span>
            </div>
            <p style={{fontSize:'11px',color:'var(--dim)',marginTop:'24px'}}>© {new Date().getFullYear()} {store?.name}. Tous droits réservés.</p>
          </div>

          {/* Section 2 — Liens */}
          <div>
            <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--fire)',marginBottom:'16px'}}>// Liens</p>
            {[{h:'/',l:'Accueil'},{h:'/cart',l:'Panier'},{h:'/contact',l:'Contactez-nous'},{h:'/Privacy',l:'Politique de confidentialité'},{h:'/Terms',l:"Conditions d'utilisation"}].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map(lnk=>(
              <a key={lnk.h} href={lnk.h} style={{display:'block',fontSize:'13px',color:'var(--mid)',marginBottom:'8px',transition:'color 0.2s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--fire)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--mid)';}}>
                {lnk.l}
              </a>
            ))}
          </div>

          {/* Section 3 — Contact */}
          <div>
            <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--fire)',marginBottom:'16px'}}>// Contactez-nous</p>
            {[
              {icon:'📞', val:store?.contact?.phone},
              {icon:'📍', val:[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ')},
              {icon:'✉️', val:store?.contact?.email},
            ].filter(r=>r.val).map((r,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'9px'}}>
                <span style={{fontSize:'13px'}}>{r.icon}</span>
                <span style={{fontSize:'13px',color:'var(--mid)'}}>{r.val}</span>
              </div>
            ))}
            <div style={{marginTop:'14px',padding:'12px 14px',border:'1px solid var(--fire)',background:'rgba(255,69,0,0.07)'}}>
              <p className="bb" style={{fontSize:'1rem',color:'var(--gold)',marginBottom:2}}>Disponibles maintenant ⚡</p>
              <p style={{fontSize:'11px',color:'var(--dim)'}}>Réponse en quelques heures</p>
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
    <div className="p-card" dir="ltr">
      <div className="p-img" style={{position:'relative',aspectRatio:'1/1',overflow:'hidden',backgroundColor:'var(--panel-2)'}}>
        {displayImage
          ? <img src={displayImage} alt={product.name}/>
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Dumbbell style={{width:'40px',height:'40px',color:'var(--dim)'}}/>
            </div>}
        {discount > 0 && <span className="bc" style={{position:'absolute',top:10,right:10,backgroundColor:'var(--fire)',color:'white',fontSize:'10px',fontWeight:900,padding:'3px 10px',letterSpacing:'0.06em',clipPath:'polygon(0 0,100% 0,94% 100%,0 100%)'}}>-{discount}%</span>}
        <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,var(--fire),var(--gold))'}}/>
      </div>
      <div style={{padding:'14px',flex:1,display:'flex',flexDirection:'column',gap:'8px'}}>
        <h3 className="bc" style={{fontSize:'15px',fontWeight:700,letterSpacing:'0.04em',textTransform:'uppercase',color:'var(--white)',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
          {product.name}
        </h3>
        <div style={{display:'flex',gap:'2px'}}>
          {[...Array(5)].map((_,i)=><Star key={i} style={{width:'11px',height:'11px',fill:i<4?'var(--gold)':'none',color:'var(--gold)'}}/>)}
        </div>
        <div style={{display:'flex',alignItems:'baseline',gap:'6px',marginTop:'auto'}}>
          <span className="bb" style={{fontSize:'1.4rem',color:'var(--fire)'}}>{price.toLocaleString()}</span>
          <span style={{fontSize:'11px',color:'var(--mid)'}}>DA</span>
          {orig>price && <span style={{fontSize:'11px',color:'var(--dim)',textDecoration:'line-through'}}>{orig.toLocaleString()}</span>}
        </div>
        <Link href={`/product/${product.slug||product.id}`} className="btn-fire" style={{width:'100%',fontSize:'13px',padding:'10px 14px',clipPath:'none',marginTop:'4px'}}>
          {viewDetails||'Voir les détails'}
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[]     = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count||products.length)/48);

  const mottos = ["No pain, no gain",'Dépassez vos limites','Entraînez-vous à fond','Restez concentré','Mode bête activé'];
  const [mIdx, setMIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setMIdx(p=>(p+1)%mottos.length), 2500); return () => clearInterval(t); }, []);

  return (
    <div dir="ltr">

      {/* ── HERO ── */}
      <section style={{position:'relative',overflow:'hidden',backgroundColor:'var(--black)',minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',paddingTop:30 , paddingBottom: 25}}>
        {store.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.2,zIndex:1}}/>
        )}
        {!store.hero?.imageUrl && (
          <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,var(--dark) 0%,var(--panel) 100%)',zIndex:1}}/>
        )}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,10,10,0.97) 0%,rgba(10,10,10,0.65) 50%,rgba(10,10,10,0.8) 100%)',zIndex:2,pointerEvents:'none'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,69,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,0.05) 1px,transparent 1px)',backgroundSize:'35px 35px',zIndex:3,opacity:0.4,pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'3px',background:'linear-gradient(90deg,transparent,var(--fire),var(--gold),transparent)',zIndex:4}}/>

        <div style={{position:'relative',zIndex:5,padding:'0 5vw',width:'100%',maxWidth:'1100px',margin:'0 auto',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center'}} className='fu-1'>
          {/* Badge */}
          <div style={{display:'inline-flex',alignItems:'center',gap:'6px',border:'1px solid var(--fire)',padding:'4px 12px',marginBottom:'16px',backgroundColor:'rgba(255,69,0,0.12)'}}>
            <Flame style={{width:'12px',height:'12px',color:'var(--fire)',animation:'flicker 1.2s ease-in-out infinite'}}/>
            <span className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--fire)'}}>Boutique Fitness #1 en Algérie</span>
          </div>

          {/* Animated motto */}
          <p className="bb" style={{fontSize:'clamp(1rem,3vw,1.8rem)',color:'var(--white)',marginBottom:'6px',opacity:0.8}}>{mottos[mIdx]}</p>

          {/* H1 */}
          <h1 className="bb" style={{fontSize:'clamp(3rem,8vw,6.5rem)',lineHeight:0.95,color:'var(--white)',letterSpacing:'-0.01em',marginBottom:'18px',textShadow:'0 3px 12px rgba(0,0,0,0.6)'}}
            dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(store.hero?.title?.replace(/<[^>]+>/g,'').replace('votre corps','<span style="color:var(--fire)">votre corps</span>')||'Nourrissez <span style="color:var(--fire)">votre corps</span><br/>avec de la force.')}}>
          </h1>

          <p style={{fontSize:'clamp(14px,1.8vw,17px)',lineHeight:'1.6',color:'rgba(255,255,255,0.7)',maxWidth:'520px',marginBottom:'28px',textShadow:'0 1px 3px rgba(0,0,0,0.5)'}}>
            {store.hero?.subtitle||'Équipements Fitness premium, compléments alimentaires et vêtements sportifs. Livraison rapide dans toutes les 58 wilayas.'}
          </p>

          <div style={{display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center',marginBottom:'36px'}}>
            <a href='#products' className="btn-fire" style={{fontSize:'14px',padding:'12px 34px'}}>
              <Dumbbell style={{width:'16px',height:'16px'}}/> Acheter maintenant
            </a>
            {cats.length > 0 && (
              <a href="#categories" style={{fontSize:'14px',padding:'12px 34px',border:'1px solid #fff',color:'#fff',display:'flex',alignItems:'center',gap:'6px'}}>
                Sections <ChevronDown style={{width:'14px',height:'14px'}}/>
              </a>
            )}
          </div>

          {/* Stats */}
          <div className='fu-3' style={{display:'flex',gap:'32px',paddingTop:'22px',borderTop:'1px solid rgba(255,255,255,0.08)',flexWrap:'wrap',justifyContent:'center',width:'100%',maxWidth:'700px'}}>
            {[{v:`${products.length}+`,l:'Produit',c:'var(--gold)'},{v:'48h',l:'Livraison',c:'var(--fire)'},{v:'100%',l:'authentique',c:'var(--green)'},{v:'#1',l:'en Algérie',c:'var(--gold)'}].map((s,i)=>(
              <div key={i} style={{textAlign:'center'}}>
                <p className="bb" style={{fontSize:'clamp(1.8rem,4vw,2.6rem)',color:s.c,lineHeight:1,margin:0}}>{s.v}</p>
                <p className="bc" style={{fontSize:'10px',fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(255,255,255,0.45)',margin:'4px 0 0'}}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{backgroundColor:'var(--dark)',borderBottom:'1px solid var(--line)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto'}}>
          <div className="trust-row">
            {[
              {icon:<Truck style={{width:'20px',height:'20px'}}/>,color:'var(--fire)',title:'Livraison rapide',desc:"48h à travers l'Algérie"},
              {icon:<Shield style={{width:'20px',height:'20px'}}/>,color:'var(--gold)',title:'Équipements authentique',desc:'Produits authentiques 100%'},
              {icon:<Trophy style={{width:'20px',height:'20px'}}/>,color:'var(--fire)',title:'Meilleurs prix',desc:'Valeur inégalée'},
              {icon:<TrendingUp style={{width:'20px',height:'20px'}}/>,color:'var(--green)',title:'Performance professionnelle',desc:'Équipements professionnelle'},
            ].map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 20px',borderRight:i>0?'1px solid var(--line)':'none'}}>
                <div style={{color:item.color,flexShrink:0}}>{item.icon}</div>
                <div style={{textAlign:'right'}}>
                  <p className="bc" style={{fontSize:'13px',fontWeight:700,color:item.color,margin:0,letterSpacing:'0.06em',textTransform:'uppercase'}}>{item.title}</p>
                  <p style={{fontSize:'11px',color:'var(--dim)',margin:0}}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (
        <section id="categories" style={{padding:'64px 0',backgroundColor:'var(--black)'}}>
          <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px'}}>
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'32px'}}>
              <div>
                <p className="s-label" style={{marginBottom:'8px'}}>Sections</p>
                <h2 className="bb" style={{fontSize:'clamp(2rem,5vw,3.5rem)',color:'var(--white)',lineHeight:0.95,letterSpacing:'0.02em'}}>
                  Entraînement par<br/><span style={{color:'var(--fire)'}}>Section</span>
                </h2>
              </div>
            </div>
            <div className="cat-row">
              {cats.slice(0,4).map((cat:any)=>(
                <Link key={cat.id} href={`?category=${cat.id}`}
                  style={{display:'block',position:'relative',aspectRatio:'4/3',overflow:'hidden',backgroundColor:'var(--panel)',border:'1px solid var(--line)',transition:'border-color 0.3s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--fire)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--line)';}}>
                  {cat.imageUrl
                    ? <img src={cat.imageUrl} alt={cat.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'transform 0.4s ease'}}
                        onMouseEnter={e=>{(e.target as HTMLImageElement).style.transform='scale(1.06)';}}
                        onMouseLeave={e=>{(e.target as HTMLImageElement).style.transform='scale(1)';}}/>
                    : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem',background:'linear-gradient(135deg,var(--panel),var(--panel-2))'}}>⚽🏀🎾🏋️</div>
                  }
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,10,10,0.85) 0%,transparent 50%)',display:'flex',alignItems:'flex-end',padding:'14px'}}>
                    <div>
                      <p className="bc" style={{fontSize:'16px',fontWeight:700,color:'white',letterSpacing:'0.06em',textTransform:'uppercase',margin:0}}>{cat.name}</p>
                      <div style={{height:'2px',width:'24px',backgroundColor:'var(--fire)',marginTop:'6px'}}/>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{padding:'32px 0 72px',backgroundColor:'var(--black)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px'}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'28px',paddingBottom:'16px',borderBottom:'1px solid var(--line)'}}>
            <div>
              <p className="s-label" style={{marginBottom:'8px'}}>Produits</p>
              <h2 className="bb" style={{fontSize:'clamp(2rem,5vw,3.5rem)',color:'var(--white)',lineHeight:0.95,letterSpacing:'0.02em'}}>
                Tous les <span style={{color:'var(--fire)'}}>équipements</span>
              </h2>
            </div>
            <p className="bc" style={{fontSize:'13px',fontWeight:600,color:'var(--dim)',letterSpacing:'0.1em',textTransform:'uppercase'}}>{products.length} article</p>
          </div>

          {products.length === 0 ? (
            <div style={{padding:'80px 0',textAlign:'center',border:'1px dashed var(--dim)'}}>
              <Dumbbell style={{width:'48px',height:'48px',color:'var(--dim)',margin:'0 auto 16px',opacity:0.4,display:'block'}}/>
              <p className="bb" style={{fontSize:'1.8rem',color:'var(--dim)'}}>Bient't</p>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((p:any)=>{
                const img  = p.productImage||p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal-p.price)/p.priceOriginal)*100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="Voir les détails"/>;
              })}
            </div>
          )}

          {/* Pagination */}
          {countPage > 1 && (
            <div className="pagination" dir="ltr">
              <Link href={{query:{page:Math.max(1,page-1)}}} scroll={false}
                style={{width:40,height:40,border:'1px solid var(--dim)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--mid)',opacity:page<=1?0.3:1}}>❮</Link>
              {Array.from({length:countPage}).map((_,i)=>{
                const pn=i+1; const isA=Number(page)===pn;
                return (
                  <Link key={pn} href={{query:{page:pn}}} scroll={false}
                    style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:'14px',border:`1px solid ${isA?'var(--fire)':'var(--dim)'}`,background:isA?'var(--fire)':'transparent',color:isA?'white':'var(--mid)'}}>
                    {pn}
                  </Link>
                );
              })}
              <Link href={{query:{page:Math.min(countPage,Number(page)+1)}}} scroll={false}
                style={{width:40,height:40,border:'1px solid var(--dim)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--mid)',opacity:page>=countPage?0.3:1}}>❯</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FIRE CTA ── */}
      <section style={{position:'relative',overflow:'hidden',padding:'80px 20px',background:'linear-gradient(135deg,var(--dark) 0%,var(--panel) 100%)'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,69,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,0.04) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:2,maxWidth:'640px',margin:'0 auto',textAlign:'center'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}><FireIcon size={48}/></div>
          <h2 className="bb" style={{fontSize:'clamp(2.5rem,7vw,5rem)',color:'var(--white)',lineHeight:0.9,marginBottom:'14px'}}>
            Êtes-vous prêt <span style={{color:'var(--fire)'}}>Pour la transformation</span> ?
          </h2>
          <p style={{fontSize:'15px',color:'var(--mid)',lineHeight:'1.7',marginBottom:'32px'}}>
            Rejoignez des milliers de sportifs dans toute l'Algérie. Obtenez les équipements dont vous avez besoin pour atteindre le sommet de vos performances.
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <a href='#products' className="btn-fire" style={{fontSize:'15px',padding:'14px 36px'}}>
              <Dumbbell style={{width:'16px',height:'16px'}}/> Acheter tous les équipements
            </a>
            <Link href="/contact" className="btn-gold" style={{fontSize:'15px',padding:'14px 36px'}}>
              Contactez-nous <ArrowRight style={{width:'14px',height:'14px'}}/>
            </Link>
          </div>
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
  if (!product) return null;
  return (
    <div dir="ltr" style={{backgroundColor:'var(--black)'}}>
      

      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'32px 20px'}}>
        <div className="details-g">
          {/* Gallery */}
          <div>
            <div style={{position:'relative',overflow:'hidden',backgroundColor:'var(--panel)',border:'1px solid var(--line)',marginBottom:'10px'}}>
              <div style={{aspectRatio:'1/1'}}>
                {allImages.length > 0
                  ? <img src={allImages[sel]} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                  : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <Dumbbell style={{width:'64px',height:'64px',color:'var(--dim)',opacity:0.3}}/>
                    </div>}
              </div>
              <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:'linear-gradient(90deg,var(--fire),var(--gold))'}}/>
              {discount > 0 && <div className="bc" style={{position:'absolute',top:14,right:14,backgroundColor:'var(--fire)',color:'white',fontSize:'12px',fontWeight:900,padding:'4px 14px',letterSpacing:'0.06em',clipPath:'polygon(0 0,100% 0,94% 100%,0 100%)'}}>-{discount}%</div>}
              {!inStock && !autoGen && (
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(10,10,10,0.85)',backdropFilter:'blur(4px)'}}>
                  <span className="bb" style={{fontSize:'2rem',color:'var(--fire)'}}>Non disponible</span>
                </div>
              )}
              {allImages.length > 1 && (
                <>
                  <button onClick={()=>setSel(p=>p===0?allImages.length-1:p-1)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',width:'34px',height:'34px',border:'1px solid var(--dim)',backgroundColor:'rgba(10,10,10,0.8)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--fire)'}}>
                    <ChevronRight style={{width:'14px',height:'14px'}}/>
                  </button>
                  <button onClick={()=>setSel(p=>p===allImages.length-1?0:p+1)} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:'34px',height:'34px',border:'1px solid var(--dim)',backgroundColor:'rgba(10,10,10,0.8)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--fire)'}}>
                    <ChevronLeft style={{width:'14px',height:'14px'}}/>
                  </button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="thumb-row">
                {allImages.slice(0,5).map((img:string,idx:number)=>(
                  <button key={idx} onClick={()=>setSel(idx)} style={{width:'54px',height:'54px',overflow:'hidden',border:`2px solid ${sel===idx?'var(--fire)':'var(--line)'}`,cursor:'pointer',padding:0,background:'none',opacity:sel===idx?1:0.55}}>
                    <img src={img} alt='' style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="s-label" style={{marginBottom:'10px'}}>Détails du Produit</p>
            <h1 className="bb" style={{fontSize:'clamp(1.8rem,4vw,3rem)',color:'var(--white)',lineHeight:0.95,marginBottom:'14px',letterSpacing:'0.02em'}}>{product.name}</h1>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid var(--line)',flexWrap:'wrap'}}>
              <div style={{display:'flex',gap:'2px'}}>
                {[...Array(5)].map((_,i)=><Star key={i} style={{width:'13px',height:'13px',fill:i<4?'var(--gold)':'none',color:'var(--gold)'}}/>)}
              </div>
              <span style={{marginRight:'auto',padding:'4px 14px',backgroundColor:inStock||autoGen?'rgba(57,255,20,0.1)':'rgba(255,69,0,0.1)',color:inStock||autoGen?'var(--green)':'var(--fire)',fontSize:'11px',fontWeight:700,fontFamily:"'Barlow',sans-serif",letterSpacing:'0.12em',textTransform:'uppercase',border:`1px solid ${inStock||autoGen?'rgba(57,255,20,0.3)':'var(--fire)'}`}}>
                {autoGen?'∞ Disponible':inStock?'Disponible':'Non disponible'}
              </span>
            </div>

            {/* Price */}
            <div style={{padding:'16px',backgroundColor:'var(--panel)',border:'1px solid var(--line)',borderRight:'3px solid var(--fire)',borderLeft:'none',marginBottom:'22px'}}>
              <p className="bc" style={{fontSize:'11px',fontWeight:600,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--mid)',marginBottom:'5px'}}>Prix</p>
              <div style={{display:'flex',alignItems:'baseline',gap:'10px',flexWrap:'wrap'}}>
                <span className="bb" style={{fontSize:'3rem',color:'var(--fire)',lineHeight:1}}>{finalPrice.toLocaleString()}</span>
                <span className="bc" style={{fontSize:'14px',color:'var(--mid)',fontWeight:600}}>DA</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <span style={{fontSize:'14px',textDecoration:'line-through',color:'var(--dim)'}}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{marginBottom:'22px',paddingBottom:'22px',borderBottom:'1px solid var(--line)'}}>
                <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--fire)',marginBottom:'10px'}}>Offres</p>
                {product.offers.map((o:any)=>(
                  <label key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',border:`1.5px solid ${selectedOffer===o.id?'var(--fire)':'var(--line)'}`,cursor:'pointer',marginBottom:'8px',backgroundColor:selectedOffer===o.id?'rgba(255,69,0,0.08)':'transparent',transition:'all 0.2s'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                      <div style={{width:'16px',height:'16px',border:`2px solid ${selectedOffer===o.id?'var(--fire)':'var(--dim)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {selectedOffer===o.id && <div style={{width:'8px',height:'8px',background:'var(--fire)'}}/>}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer===o.id} onChange={()=>setSelectedOffer(o.id)} style={{display:'none'}}/>
                      <div>
                        <p className="bc" style={{fontSize:'14px',fontWeight:700,color:'var(--white)',margin:0,letterSpacing:'0.04em',textTransform:'uppercase'}}>{o.name}</p>
                        <p style={{fontSize:'11px',color:'var(--dim)',margin:0}}>Quantité: {o.quantity}</p>
                      </div>
                    </div>
                    <span className="bb" style={{fontSize:'1.3rem',color:'var(--fire)'}}>{o.price.toLocaleString()} <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:400,fontSize:'11px',color:'var(--dim)'}}>DA</span></span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr:any)=>(
              <div key={attr.id} style={{marginBottom:'18px',paddingBottom:'18px',borderBottom:'1px solid var(--line)'}}>
                <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--fire)',marginBottom:'10px'}}>{attr.name}</p>
                {attr.displayMode==='color' ? (
                  <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                    {attr.variants.map((v:any)=>(
                      <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} title={v.name} style={{width:'28px',height:'28px',backgroundColor:v.value,border:'none',cursor:'pointer',outline:`3px solid ${selectedVariants[attr.name]===v.value?'var(--fire)':'transparent'}`,outlineOffset:'3px'}}/>
                    ))}
                  </div>
                ) : attr.displayMode==='image' ? (
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                    {attr.variants.map((v:any)=>(
                      <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} style={{width:'52px',height:'52px',overflow:'hidden',border:`2px solid ${selectedVariants[attr.name]===v.value?'var(--fire)':'var(--line)'}`,cursor:'pointer',padding:0}}>
                        <img src={v.value} alt={v.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                    {attr.variants.map((v:any)=>{
                      const s=selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={()=>handleVariantSelection(attr.name,v.value)} className="bc" style={{padding:'8px 16px',border:`1.5px solid ${s?'var(--fire)':'var(--dim)'}`,backgroundColor:s?'var(--fire)':'transparent',color:s?'white':'var(--mid)',fontSize:'13px',fontWeight:700,cursor:'pointer',letterSpacing:'0.08em',textTransform:'uppercase',transition:'all 0.2s'}}>
                        {v.name}
                      </button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants}/>

            {product.desc && (
              <div style={{marginTop:'28px',paddingTop:'22px',borderTop:'1px solid var(--line)'}}>
                <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--fire)',marginBottom:'12px'}}>Informations produit</p>
                <div style={{fontSize:'14px',lineHeight:'1.85',color:'var(--mid)',fontWeight:400}}
                  dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(product.desc,{ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','span'],ALLOWED_ATTR:['class','style']})}}/>
              </div>
            )}
          </div>
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
  const initCount = useCartStore(s => s.initCount);

  useEffect(()=>{ if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(()=>{ if(typeof window!=='undefined'){const id=localStorage.getItem('customerId');if(id) setFd(p=>({...p,customerId:id}));} },[]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);
  useEffect(()=>{ if(selW) setFd(f=>({...f,priceLoss:selW.livraisonReturn})); },[]);

  const selW   = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const getFP  = useCallback(():number=>{
    const base=typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const off=product.offers?.find((o:any)=>o.id===selectedOffer); if(off) return off.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){
      const m=product.variantDetails.find((v:any)=>vm(v,selectedVariants));
      if(m&&m.price!==-1) return m.price;
    }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getLiv = useCallback(():number=>{ if(!selW) return 0; return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice; },[selW,fd.typeLivraison]);
  const fp    = getFP();
  const total = ()=> fp*fd.quantity + +getLiv();
  const validate = ()=>{
    const e:Record<string,string>={};
    if(!fd.customerName.trim())  e.customerName='Nom requis';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = "Numéro invalide (ex: 0550123456)";
    if(!fd.customerWelaya)       e.customerWelaya='Wilaya requis';
    if(!fd.customerCommune)      e.customerCommune="Commune requis";
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
    localStorage.setItem(domain,JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(()=>setIsAdded(false),2000);
  };

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();
    const er=validate(); if(Object.keys(er).length){setErrors(er);return;}
    setErrors({}); setSub(true);
    try{
      await axios.post(`${API_URL}/orders/create`,{...fd,productId:product.id,storeId:product.store.id,userId,selectedOffer,variantDetailId:getVarId(),platform:platform||'store',finalPrice:fp,totalPrice:total(),priceLivraison:getLiv()});
      if(fd.customerId) localStorage.setItem('customerId',fd.customerId);
      router.push(`/${domain}/successfully`);
    }catch{}finally{setSub(false);}
  };

  return (
    <div dir="ltr" style={{marginTop:'22px',paddingTop:'20px',borderTop:'1px solid var(--line)'}}>
      {/* Cart + Order buttons */}
        {product.store?.cart && (
        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          <button onClick={addToCart} disabled={isAdded} className="bc" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'12px',cursor:isAdded?'default':'pointer',fontFamily:'inherit',fontWeight:800,fontSize:'13px',letterSpacing:'0.08em',textTransform:'uppercase',border:`1.5px solid ${isAdded?'var(--green)':'var(--dim)'}`,background:isAdded?'rgba(57,255,20,0.1)':'transparent',color:isAdded?'var(--green)':'var(--mid)',transition:'all 0.25s'}}>
            {isAdded?<><CheckCircle2 size={14} className="anim-check"/>Ajouté au panier</>:<><ShoppingCart size={14}/>Ajouter au panier</>}
          </button>
          <button onClick={()=>setIsOrderNow(true)} className="btn-fire" style={{flex:1,clipPath:'none',padding:'12px'}}>
            <Zap style={{width:'14px',height:'14px'}}/> Commander maintenant
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div>
          {product.store?.cart && (
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
              <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--fire)',margin:0}}>Informations de livraison</p>
              <button onClick={()=>setIsOrderNow(false)} className="bc" style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',border:'1px solid var(--dim)',background:'transparent',color:'var(--mid)',fontSize:'11px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.1em',textTransform:'uppercase'}}>
                <X style={{width:'11px',height:'11px'}}/> Annuler
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.customerName} label="Nom complet">
                <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="Votre nom complet"
                  style={INP_S(!!errors.customerName)} className={`inp${errors.customerName?' inp-err':''}`}
                  onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor=errors.customerName?'#ef4444':'var(--dim)';}}/>
              </FR>
              <FR error={errors.customerPhone} label="Numéro de Téléphone">
                <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="0X XX XX XX XX"
                  style={INP_S(!!errors.customerPhone)} className={`inp${errors.customerPhone?' inp-err':''}`}
                  onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor=errors.customerPhone?'#ef4444':'var(--dim)';}}/>
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label="Wilaya">
                <div style={{position:'relative'}}>
                  <ChevronDown style={{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                  <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})}
                    className={`inp${errors.customerWelaya?' inp-err':''}`} style={{paddingLeft:'32px'}}
                    onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor=errors.customerWelaya?'#ef4444':'var(--dim)';}}>
                    <option value="">Choisir Wilaya</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="Commune">
                <div style={{position:'relative'}}>
                  <ChevronDown style={{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})}
                    className={`inp${errors.customerCommune?' inp-err':''}`} style={{paddingLeft:'32px',opacity:!fd.customerWelaya?0.4:1}}
                    onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor=errors.customerCommune?'#ef4444':'var(--dim)';}}>
                    <option value="">{loadingC?'Chargement en cours...':'Choisir Commune'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="Type de livraison">
              <div className="dlv-2c">
                {(['home','office'] as const).map(type=>(
                  <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))}
                    style={{padding:'12px 10px',border:`1.5px solid ${fd.typeLivraison===type?'var(--fire)':'var(--dim)'}`,backgroundColor:fd.typeLivraison===type?'rgba(255,69,0,0.1)':'transparent',cursor:'pointer',textAlign:'right',transition:'all 0.2s',fontFamily:'inherit'}}>
                    <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:fd.typeLivraison===type?'var(--fire)':'var(--mid)',margin:'0 0 4px'}}>{type==='home'?'à la Maison':'Au bureau'}</p>
                    {selW && <p className="bb" style={{fontSize:'1rem',color:fd.typeLivraison===type?'var(--fire)':'var(--dim)',margin:0}}>{(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:400,fontSize:'11px',color:'var(--dim)'}}>DA</span></p>}
                  </button>
                ))}
              </div>
            </FR>

            <FR label="Quantité">
              <div style={{display:'inline-flex',alignItems:'center',border:'1.5px solid var(--dim)',overflow:'hidden',backgroundColor:'var(--panel)'}}>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} style={{width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',border:'none',borderRight:'1px solid var(--dim)',background:'transparent',cursor:'pointer',color:'var(--fire)',fontSize:'18px',fontWeight:700}}>-</button>
                <span className="bb" style={{width:'44px',textAlign:'center',fontSize:'1.2rem',color:'var(--white)'}}>{fd.quantity}</span>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))} style={{width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',border:'none',borderLeft:'1px solid var(--dim)',background:'transparent',cursor:'pointer',color:'var(--fire)',fontSize:'18px',fontWeight:700}}>+</button>
              </div>
            </FR>

            {/* Summary */}
            <div style={{border:'1px solid var(--line)',borderRight:'3px solid var(--fire)',borderLeft:'none',marginBottom:'14px',overflow:'hidden',backgroundColor:'var(--panel)'}}>
              <div style={{padding:'10px 14px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:'8px',backgroundColor:'var(--panel-2)'}}>
                <Package style={{width:'13px',height:'13px',color:'var(--fire)'}}/>
                <span className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--fire)'}}>Résumé de la commande</span>
              </div>
              {[{l:'Produit',v:product.name.slice(0,22)+(product.name.length>22?'...':'')},{l:'Prix',v:`${fp.toLocaleString()} DA`},{l:'Quantité',v:`× ${fd.quantity}`},{l:'Livraison',v:selW?`${getLiv().toLocaleString()} DA`:'—'}].map(row=>(
                <div key={row.l} style={{display:'flex',justifyContent:'space-between',padding:'7px 14px',borderBottom:'1px solid var(--line)'}}>
                  <span className="bc" style={{fontSize:'12px',color:'var(--dim)',letterSpacing:'0.06em',textTransform:'uppercase'}}>{row.l}</span>
                  <span style={{fontSize:'13px',fontWeight:600,color:'var(--mid)'}}>{row.v}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'12px 14px'}}>
                <span className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--mid)'}}>Total</span>
                <span className="bb" style={{fontSize:'1.8rem',color:'var(--fire)'}}>{total().toLocaleString()} <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:400,fontSize:'12px',color:'var(--dim)'}}>DA</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-fire" style={{width:'100%',fontSize:'15px',padding:'14px',cursor:sub?'not-allowed':'pointer',opacity:sub?0.7:1,clipPath:'none',marginBottom:'10px'}}>
              {sub?<><Loader2 style={{width:'15px',height:'15px',animation:'spin 1s linear infinite'}}/> Traitement en cours...</>:<><Zap style={{width:'15px',height:'15px'}}/> Confirmer la commande</>}
            </button>
            <div style={{display:'flex',justifyContent:'center',gap:'16px'}}>
              {[{icon:<Lock style={{width:'11px',height:'11px'}}/>,label:'Sécurisé'},{icon:<Truck style={{width:'11px',height:'11px'}}/>,label:'Livraison rapide'},{icon:<Shield style={{width:'11px',height:'11px'}}/>,label:'authentique'}].map((b,i)=>(
                <div key={i} className='bc' style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'11px',color:'var(--dim)',fontWeight:600,letterSpacing:'0.06em'}}>
                  <span style={{color:'var(--fire)'}}>{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CART
══════════════════════════════════════════════════════════════ */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems]       = useState<any[]>([]);
  const [wilayas, setWilayas]   = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [fd, setFd] = useState({customerName:'',customerPhone:'',customerWelaya:'',customerCommune:'',typeLivraison:'home' as 'home'|'office'});
  const [errors, setErrors]     = useState<Record<string,string>>({});
  const initCount = useCartStore(s => s.initCount);

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
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = "Numéro invalide (ex: 0550123456)";
    if(!fd.customerWelaya) er.w='requis';
    if(!fd.customerCommune) er.c='requis';
    if(Object.keys(er).length){setErrors(er);return;}
    setErrors({}); setSubmitting(true);
    try{
      await axios.post(`${API_URL}/orders/create`,items.map(i=>({...fd,productId:i.productId,storeId:i.storeId,userId:i.userId,selectedOffer:i.selectedOffer,variantDetailId:i.variantDetailId,selectedVariants:i.selectedVariants,platform:i.platform||'store',finalPrice:i.finalPrice,totalPrice:finalTotal,priceLivraison:+getLiv(),quantity:i.quantity,customerId:i.customerId||'',priceLoss:selW?.livraisonReturn??0})));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    }catch{}finally{setSubmitting(false);}
  };

  if(success) return (
    <div dir="ltr" style={{minHeight:'70vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',background:'var(--black)'}}>
      <div style={{textAlign:'center',background:'var(--panel)',padding:'4rem 2.5rem',border:'2px solid var(--fire)',maxWidth:460,width:'100%'}}>
        <CheckCircle2 style={{width:'48px',height:'48px',color:'var(--green)',display:'block',margin:'0 auto 1.25rem'}}/>
        <h2 className="bb" style={{fontSize:'2.5rem',color:'var(--white)',marginBottom:'0.625rem'}}>Commande reçue !</h2>
        <p style={{color:'var(--mid)',marginBottom:'2rem',lineHeight:1.7}}>Merci de votre confiance. Nous vous contacterons bient't. 💪</p>
        <Link href="/" className="btn-fire" style={{display:'inline-flex',clipPath:'none',padding:'13px 28px'}}>Retour à la boutique</Link>
      </div>
    </div>
  );

  if(!items.length) return (
    <div dir="ltr" style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',background:'var(--black)'}}>
      <div style={{textAlign:'center',padding:'4rem 2rem',border:'1px dashed var(--dim)',maxWidth:400,width:'100%'}}>
        <Dumbbell style={{width:'48px',height:'48px',color:'var(--dim)',display:'block',margin:'0 auto 1.25rem',opacity:0.4}}/>
        <p className="bb" style={{fontSize:'2rem',color:'var(--dim)',marginBottom:'1.75rem'}}>Panier vide</p>
        <Link href="/" className="btn-fire" style={{display:'inline-flex',clipPath:'none',padding:'13px 28px'}}>Acheter maintenant</Link>
      </div>
    </div>
  );

  return (
    <div dir="ltr" style={{minHeight:'100vh',background:'var(--black)',padding:'2.5rem 1.5rem 5rem'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:'2rem',paddingBottom:'1rem',borderBottom:'2px solid var(--fire)'}}>
          <h1 className="bb" style={{fontSize:'clamp(2rem,5vw,3rem)',color:'var(--white)'}}>Panier</h1>
          <p className="bc" style={{fontSize:'13px',color:'var(--dim)',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase'}}>{items.length} Produit</p>
        </div>
        <div className="cart-layout">
          {/* Items */}
          <div style={{background:'var(--panel)',border:'1px solid var(--line)',borderTop:'2px solid var(--fire)',alignSelf:'start'}}>
            {items.map((item,i)=>(
              <div key={i} style={{display:'flex',gap:'1rem',padding:'14px',borderBottom:'1px solid var(--line)'}}>
                <div style={{width:80,height:80,flexShrink:0,overflow:'hidden',border:'1px solid var(--line)',background:'var(--panel-2)'}}>
                  <img src={item.product?.imagesProduct?.[0]?.imageUrl||item.product?.productImage} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt=''/>
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                  <div>
                    <h4 className="bc" style={{fontWeight:700,color:'var(--white)',fontSize:'13px',letterSpacing:'0.04em',textTransform:'uppercase',marginBottom:'4px'}}>{item.product?.name}</h4>
                    <p className="bb" style={{fontSize:'1.2rem',color:'var(--fire)'}}>{item.finalPrice?.toLocaleString()} DA</p>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'8px'}}>
                    <div style={{display:'inline-flex',alignItems:'center',border:'1px solid var(--dim)',overflow:'hidden'}}>
                      <button onClick={()=>changeQty(i,-1)} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--panel-2)',border:'none',cursor:'pointer',color:'var(--fire)',fontSize:'1.1rem'}}>-</button>
                      <span className="bb" style={{width:32,textAlign:'center',fontSize:'1rem',color:'var(--white)',lineHeight:'28px'}}>{item.quantity}</span>
                      <button onClick={()=>changeQty(i,1)} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--panel-2)',border:'none',cursor:'pointer',color:'var(--fire)',fontSize:'1.1rem'}}>+</button>
                    </div>
                    <button onClick={()=>update(items.filter((_,idx)=>idx!==i))} className="bc" style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',border:'none',background:'transparent',color:'var(--dim)',fontSize:'11px',fontWeight:700,cursor:'pointer',letterSpacing:'0.1em',textTransform:'uppercase',transition:'color 0.15s',fontFamily:'inherit'}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color='var(--fire)';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color='var(--dim)';}}>
                      <Trash2 size={12}/> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:'14px',background:'var(--panel-2)'}}>
              <span className="bc" style={{fontWeight:700,fontSize:'13px',color:'var(--mid)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Sous-total</span>
              <span className="bb" style={{fontSize:'1.5rem',color:'var(--white)'}}>{cartTotal.toLocaleString()} DA</span>
            </div>
          </div>

          {/* Checkout */}
          <div style={{background:'var(--panel)',border:'1px solid var(--line)',borderTop:'2px solid var(--fire)',padding:'22px',alignSelf:'start'}}>
            <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--fire)',marginBottom:'16px'}}>// Informations de livraison</p>
            <form onSubmit={handleSubmit}>
              <div className="form-2c">
                <FR error={errors.name} label="Nom">
                  <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} className={`inp${errors.name?' inp-err':''}`}
                    onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor=errors.name?'#ef4444':'var(--dim)';}}/>
                </FR>
                <FR error={errors.phone} label="Téléphone">
                  <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} className={`inp${errors.phone?' inp-err':''}`}
                    onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor=errors.phone?'#ef4444':'var(--dim)';}}/>
                </FR>
              </div>
              <div className="form-2c">
                <FR error={errors.w} label="Wilaya">
                  <div style={{position:'relative'}}>
                    <ChevronDown style={{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                    <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} className={`inp${errors.w?' inp-err':''}`} style={{paddingLeft:'32px'}}
                      onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor=errors.w?'#ef4444':'var(--dim)';}}>
                      <option value="">Choisir</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
                <FR error={errors.c} label="Commune">
                  <div style={{position:'relative'}}>
                    <ChevronDown style={{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--dim)',pointerEvents:'none'}}/>
                    <select value={fd.customerCommune} disabled={loadingC||!fd.customerWelaya} onChange={e=>setFd({...fd,customerCommune:e.target.value})} className={`inp${errors.c?' inp-err':''}`} style={{paddingLeft:'32px',opacity:!fd.customerWelaya?0.4:1}}
                      onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor=errors.c?'#ef4444':'var(--dim)';}}>
                      <option value="">{loadingC?'...':'Choisir'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
              </div>

              {/* Type de livraison — Nouveau */}
              <div style={{marginBottom:'14px'}}>
                <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--fire)',marginBottom:'10px'}}>// Type de livraison</p>
                <div className="delivery-grid">
                  {(['home','office'] as const).map(t=>(
                    <button
                      key={t}
                      type="button"
                      onClick={()=>setFd(p=>({...p,typeLivraison:t}))}
                      style={{
                        padding:'14px',
                        border:`1px solid ${fd.typeLivraison===t?'var(--fire)':'var(--line)'}`,
                        borderTop:`2px solid ${fd.typeLivraison===t?'var(--fire)':'var(--line)'}`,
                        background:fd.typeLivraison===t?'var(--panel-2)':'var(--panel)',
                        textAlign:'center',
                        cursor:'pointer',
                        fontFamily:'inherit',
                        transition:'all 0.2s'
                      }}
                    >
                      <span style={{display:'block',fontSize:'1.5rem',marginBottom:'4px'}}>{t==='home'?'🏠':'🏢'}</span>
                      <p className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:fd.typeLivraison===t?'var(--white)':'var(--dim)'}}>{t==='home'?'À domicile':'Au bureau'}</p>
                      {selW && <p className="bb" style={{fontSize:'1rem',color:'var(--fire)',marginTop:'3px'}}>{(t==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} DA</p>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{border:'1px solid var(--line)',borderRight:'3px solid var(--fire)',borderLeft:'none',marginBottom:'14px',overflow:'hidden',background:'var(--panel-2)'}}>
                {[{l:'Sous-total',v:`${cartTotal.toLocaleString()} DA`},{l:'Livraison',v:getLiv()?`${getLiv().toLocaleString()} DA`:'—'}].map(row=>(
                  <div key={row.l} style={{display:'flex',justifyContent:'space-between',padding:'7px 14px',borderBottom:'1px solid var(--line)'}}>
                    <span className="bc" style={{fontSize:'12px',color:'var(--dim)',letterSpacing:'0.06em',textTransform:'uppercase'}}>{row.l}</span>
                    <span style={{fontSize:'13px',fontWeight:600,color:'var(--mid)'}}>{row.v}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'12px 14px'}}>
                  <span className="bc" style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--mid)'}}>Total</span>
                  <span className="bb" style={{fontSize:'1.8rem',color:'var(--fire)'}}>{finalTotal.toLocaleString()} <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:400,fontSize:'12px',color:'var(--dim)'}}>DA</span></span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-fire" style={{width:'100%',fontSize:'15px',padding:'14px',cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.7:1,clipPath:'none'}}>
                {submitting?<><Loader2 style={{width:'15px',height:'15px',animation:'spin 1s linear infinite'}}/> En cours...</>:<><Zap style={{width:'15px',height:'15px'}}/> Confirmer la commande</>}
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

const Shell = ({ children, title, sub }: { children: React.ReactNode; title: string; sub?: string }) => (
  <div dir="ltr" style={{backgroundColor:'var(--black)',minHeight:'100vh'}}>
    <div style={{backgroundColor:'var(--dark)',padding:'56px 20px 40px',borderBottom:`2px solid var(--fire)`,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,69,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,0.04) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}}/>
      <div style={{maxWidth:'720px',margin:'0 auto',position:'relative',zIndex:2,textAlign:'right'}}>
        {sub && <p className="s-label" style={{marginBottom:'10px'}}>{sub}</p>}
        <h1 className="bb" style={{fontSize:'clamp(2.5rem,6vw,5rem)',color:'var(--white)',lineHeight:0.95,letterSpacing:'0.02em'}}>
          {title}
        </h1>
      </div>
    </div>
    <div style={{maxWidth:'720px',margin:'0 auto',padding:'36px 20px 80px'}}>
      <div style={{backgroundColor:'var(--panel)',border:'1px solid var(--line)',borderRight:'3px solid var(--fire)',borderLeft:'none',padding:'28px',textAlign:'right'}}>
        {children}
      </div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{paddingBottom:'18px',marginBottom:'18px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between',gap:'16px',alignItems:'flex-start'}}>
    <div style={{flex:1,textAlign:'right'}}>
      <h3 className="bc" style={{fontSize:'14px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--white)',margin:'0 0 7px'}}>
        {title} <span style={{color:'var(--fire)'}}>{'//'}</span>
      </h3>
      <p style={{fontSize:'13px',lineHeight:'1.8',color:'var(--mid)',margin:0}}>{body}</p>
    </div>
    {tag && <span className="bc" style={{fontSize:'10px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',padding:'4px 10px',border:'1px solid var(--fire)',color:'var(--fire)',flexShrink:0}}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="Politique de confidentialité" sub="Affaires juridiques">
      <IB title="Les données que nous collectons" body="Uniquement votre nom, numéro de téléphone et adresse de livraison — le minimum nécessaire pour traiter votre commande."/>
      <IB title="Comment nous les utilisons" body="Exclusivement pour traiter et expédier votre commande. Aucun usage marketing ou vente de données."/>
      <IB title="Sécurité" body="Vos données sont protégées par un chiffrement haute sécurité et sécurisées en tout temps."/>
      <IB title="Partage des données" body="Nous ne vendons jamais vos données. Partagées avec les partenaires de livraison de confiance." tag="Garanti"/>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="Conditions de service" sub="Affaires juridiques">
      <IB title="Commandes" body="Aucuns frais cachés. Le prix affiché est le prix final."/>
      <IB title="Produits authentiques" body="Nous vendons uniquement des produits authentiques ; les contrefaçons sont strictement interdites." tag="Strict"/>
      <IB title="Loi applicable" body="Ces Conditions sont soumises aux lois de la République Algérienne Démocratique et Populaire."/>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="Politique de cookies" sub="Affaires juridiques">
      <IB title="Cookies essentiels" body="Requis pour les sessions, le Panier et compléter l'achat. Non désactivables." tag="requis"/>
      <IB title="Cookies analytiques" body="Données agrégées pour améliorer la plateforme. Aucune donnée personnelle incluse." tag="Facultatif"/>
      <div style={{marginTop:'16px',padding:'14px',border:'1px solid var(--fire)',display:'flex',gap:'10px',alignItems:'flex-start',backgroundColor:'rgba(255,69,0,0.05)'}}>
        <ToggleRight style={{width:'17px',height:'17px',color:'var(--fire)',flexShrink:0,marginTop:'1px'}}/>
        <p style={{fontSize:'13px',color:'var(--mid)',lineHeight:'1.75',margin:0,textAlign:'right'}}>
          Vous pouvez gérer ou supprimer les cookies depuis les paramètres de votre navigateur.
        </p>
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store?: any }) {
  const [form, setForm] = useState({name:'',email:'',phone:'',message:''});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`,{...form,storeId:store?.id}); setSent(true); }
    catch { showError('Une Erreur est survenue'); } finally { setLoading(false); }
  };

  return (
    <div dir="ltr" style={{backgroundColor:'var(--black)',minHeight:'100vh'}}>
      <div style={{backgroundColor:'var(--dark)',padding:'56px 20px 40px',borderBottom:`2px solid var(--fire)`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,69,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,0.04) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}}/>
        <div style={{maxWidth:'960px',margin:'0 auto',position:'relative',zIndex:2,textAlign:'right'}}>
          <p className="s-label" style={{marginBottom:'10px'}}>Contactez-nous</p>
          <h1 className="bb" style={{fontSize:'clamp(2.5rem,6vw,5rem)',color:'var(--white)',lineHeight:0.95,marginBottom:'8px'}}>
            Contact <span style={{color:'var(--fire)'}}>avec nous</span>
          </h1>
          <p style={{fontSize:'14px',color:'var(--mid)'}}>Notre équipe répond sous 24h 💪</p>
        </div>
      </div>

      <div className="contact-g" style={{maxWidth:'960px',margin:'0 auto',padding:'36px 20px 80px'}}>
        {/* Info */}
        <div>
          <div style={{backgroundColor:'var(--panel)',border:'1px solid var(--line)',borderRight:'3px solid var(--fire)',borderLeft:'none',padding:'22px',marginBottom:'12px',textAlign:'right'}}>
            <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--fire)',marginBottom:'16px'}}>// Informations de contact</p>
            {[
              {icon:'📞',label:'Téléphone',val:store?.contact?.phone},
              {icon:'📍',label:'Adresse',val:[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ')},
              {icon:'✉️',label:'Email',val:store?.contact?.email},
            ].filter(r=>r.val).map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'11px 0',borderBottom:'1px solid var(--line)'}}>
                <div style={{width:'34px',height:'34px',backgroundColor:'rgba(255,69,0,0.1)',border:'1px solid var(--fire)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}>{item.icon}</div>
                <div style={{textAlign:'right'}}>
                  <p className="bc" style={{fontSize:'10px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--fire)',margin:'0 0 1px'}}>{item.label}</p>
                  <p style={{fontSize:'13px',fontWeight:600,color:'var(--white)',margin:0}}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{backgroundColor:'var(--fire)',padding:'18px 20px',position:'relative',overflow:'hidden',textAlign:'right'}}>
            <p className="bb" style={{fontSize:'1.4rem',color:'white',margin:'0 0 4px'}}>Entraînez-vous. Mangez. Dormez.</p>
            <p className="bb" style={{fontSize:'1.8rem',color:'var(--gold)',margin:0,lineHeight:1}}>Réessayez.</p>
          </div>
        </div>

        {/* Form */}
        <div style={{backgroundColor:'var(--panel)',border:'1px solid var(--line)',borderRight:'3px solid var(--fire)',borderLeft:'none',padding:'24px',textAlign:'right'}}>
          <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--fire)',marginBottom:'18px'}}>// Envoyer un message</p>
          {sent ? (
            <div style={{minHeight:'200px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:'1px solid var(--fire)',textAlign:'center',backgroundColor:'rgba(255,69,0,0.05)',padding:'28px'}}>
              <CheckCircle2 style={{width:'32px',height:'32px',color:'var(--green)',marginBottom:'12px'}}/>
              <h3 className="bb" style={{fontSize:'1.5rem',color:'var(--white)',margin:'0 0 6px'}}>Message envoyé !</h3>
              <p style={{fontSize:'13px',color:'var(--mid)'}}>Nous vous répondrons sous 24h. 💪</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div className="form-2c">
                <div>
                  <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--mid)',marginBottom:'5px'}}>Nom</p>
                  <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="inp"
                    onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor='var(--dim)';}}/>
                </div>
                <div>
                  <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--mid)',marginBottom:'5px'}}>Téléphone</p>
                  <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required className="inp"
                    onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor='var(--dim)';}}/>
                </div>
              </div>
              <div>
                <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--mid)',marginBottom:'5px'}}>Email</p>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required className="inp"
                  onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor='var(--dim)';}}/>
              </div>
              <div>
                <p className="bc" style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--mid)',marginBottom:'5px'}}>Votre message</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Comment pouvons-nous vous aider ?" rows={4} required className="inp"
                  style={{resize:'none'}}
                  onFocus={e=>{e.target.style.borderColor='var(--fire)';}} onBlur={e=>{e.target.style.borderColor='var(--dim)';}}/>
              </div>
              <button type="submit" disabled={loading} className="btn-fire" style={{justifyContent:'center',width:'100%',fontSize:'14px',padding:'13px',clipPath:'none',opacity:loading?0.7:1,cursor:loading?'not-allowed':'pointer'}}>
                {loading?<><Loader2 style={{width:'15px',height:'15px',animation:'spin 1s linear infinite'}}/> En cours...</>:<>Envoyer le message <ArrowRight style={{width:'14px',height:'14px'}}/></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}