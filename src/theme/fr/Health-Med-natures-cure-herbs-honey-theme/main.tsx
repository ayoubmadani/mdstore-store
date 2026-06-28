'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, ToggleRight, ArrowRight,
  Plus, Minus, CheckCircle2, Lock, Menu, Package,
  Truck, Shield, Search, ShoppingCart,
  Trash2, Loader2, Phone, MapPin, Mail, Activity, Zap, User,
  Leaf, Flower2, Droplets,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0; }
  html { scroll-behavior:smooth; }

  :root {
    --green:   #2D5A27;
    --green-2: #3D6B37;
    --green-lt:#F0F5EE;
    --gold:    #C9952C;
    --gold-2:  #B8860B;
    --gold-lt: #FDF8EE;
    --cream:   #FDFBF7;
    --beige:   #F5F0E8;
    --brown:   #2C1810;
    --warm:    #8B7355;
    --tan:     #E8DCC8;
    --white:   #FFFFFF;
    --mid:     #5C4A3A;
    --dim:     #A09280;
    --line:    #E8DCC8;
    --red:     #C0392B;
    --amber:   #C9952C;
    --emerald: #4A7C59;
  }

  body { background:var(--cream); color:var(--brown); font-family:'Inter',sans-serif; }
  a    { text-decoration:none; color:inherit; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:var(--gold); border-radius:2px; }

  .pd { font-family:'Playfair Display',serif; }

  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fi { animation:fadeIn 0.5s ease both; }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin   { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  .anim-check { animation:check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  .p-card {
    background:var(--white); border:1px solid var(--tan); border-radius:16px;
    overflow:hidden; transition:all 0.3s; cursor:pointer;
    display:flex; flex-direction:column;
  }
  .p-card:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(45,90,39,0.08); border-color:var(--gold); }

  .cat-card {
    position:relative; overflow:hidden; border-radius:16px;
    border:1px solid var(--tan); background:var(--white);
    cursor:pointer; display:block; transition:all 0.3s;
  }
  .cat-card:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(45,90,39,0.1); }
  .cat-card:hover img { transform:scale(1.04); }
  .cat-card img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.35s ease; }

  .btn-primary {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--green); color:white;
    font-family:'Playfair Display',serif; font-size:14px; font-weight:700;
    padding:12px 28px; border:none; cursor:pointer; border-radius:12px;
    transition:all 0.2s;
  }
  .btn-primary:hover { background:var(--green-2); transform:translateY(-1px); box-shadow:0 4px 20px rgba(45,90,39,0.25); }
  .btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

  .btn-outline {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:transparent; color:var(--green);
    font-family:'Playfair Display',serif; font-size:14px; font-weight:700;
    padding:12px 28px; border:1.5px solid var(--green); cursor:pointer; border-radius:12px;
    transition:all 0.2s;
  }
  .btn-outline:hover { background:var(--green-lt); }

  .inp {
    width:100%; padding:12px 14px;
    background:var(--white); border:1.5px solid var(--tan);
    font-family:'Inter',sans-serif; font-size:14px; color:var(--brown);
    outline:none; border-radius:10px; transition:border-color 0.2s,box-shadow 0.2s;
  }
  .inp:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,149,44,0.1); }
  .inp::placeholder { color:var(--dim); }
  select.inp { appearance:none; cursor:pointer; }

  .ticker-stripe { overflow:hidden; white-space:nowrap; }
  .ticker-inner  { display:inline-block; animation:ticker 28s linear infinite; }

  .prod-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  .cat-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .trust-row { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g  { display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; }
  .details-g { display:grid; grid-template-columns:1fr 1fr; gap:40px; }
  .contact-g { display:grid; grid-template-columns:1fr 1fr; gap:48px; }
  .form-2c   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c    { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cart-layout { display:grid; grid-template-columns:1.2fr 1fr; gap:40px; align-items:start; }
  .thumb-row { display:flex; gap:8px; flex-wrap:wrap; }
  .pagination { display:flex; justify-content:center; gap:6px; margin-top:40px; flex-wrap:wrap; }

  .nav-search-d { display:none; }

  .how-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }

  @media (min-width:1024px) { .nav-search-d { display:block; } }

  @media (max-width:1024px) {
    .prod-grid { grid-template-columns:repeat(3,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:32px; }
    .how-grid  { grid-template-columns:repeat(2,1fr); }
  }
  @media (max-width:768px) {
    .prod-grid { grid-template-columns:1fr; gap:12px; }
    .cat-grid  { grid-template-columns:repeat(2,1fr); }
    .trust-row { grid-template-columns:repeat(2,1fr); }
    .footer-g  { grid-template-columns:1fr; gap:28px; }
    .details-g { grid-template-columns:1fr; }
    .contact-g { grid-template-columns:1fr; gap:24px; }
    .cart-layout { grid-template-columns:1fr; }
    .how-grid  { grid-template-columns:1fr; }
  }
  @media (max-width:480px) {
    .form-2c { grid-template-columns:1fr; }
    .dlv-2c  { grid-template-columns:1fr; }
  }
`;

interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color'|'image'|'text'|null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color'|'image'|'text'; value: string; }
interface VariantDetail { id: string|number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
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

const fetchWilayas  = async (uid: string): Promise<Wilaya[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }
};
const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }
};

const INP_S = (err?: boolean): React.CSSProperties => ({
  width:'100%', padding:'12px 14px', background:'var(--white)',
  border:`1.5px solid ${err?'#ef4444':'var(--tan)'}`,
  fontFamily:"'Inter',sans-serif", fontSize:'14px', color:'var(--brown)',
  outline:'none', borderRadius:'10px', transition:'border-color 0.2s'
});

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom:'14px', direction:'rtl' }}>
    {label && <p className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--warm)', marginBottom:'6px', textAlign:'right' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize:'12px', color:'#ef4444', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px', justifyContent:'flex-end' }}>
      {error}<AlertCircle style={{ width:'12px', height:'12px' }} />
    </p>}
  </div>
);

function HerbLeaf({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style} // transmettre le style ici pour changer la couleur
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--cream)' }}>
      <style>{CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sq, setSq] = useState('');
  const [ls, setLs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { initCount(JSON.parse(localStorage.getItem(domain)||'[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (sq.length < 2) { setLs([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: sq } });
        setLs(data.products || []);
      } catch {} finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [sq, domain]);

  const doSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (sq.trim()) {
      router.push(`/?search=${encodeURIComponent(sq)}`);
      setSq('');
      setShowSearch(false);
    }
  };

  const SearchDrop = () => (
    <div style={{
      position:'absolute', top:'calc(100% + 4px)', right:0, left:0,
      background:'var(--white)', border:'1px solid var(--gold)', borderRadius:'12px',
      zIndex:200, overflow:'hidden', boxShadow:'0 12px 40px rgba(201,149,44,0.12)'
    }} className='fi'>
      <div style={{ display:'flex', justifyContent:'flex-end', padding:'8px 12px 2px' }}>
        <button onClick={() => setSq('')} style={{
          background:'var(--gold-lt)', border:'none', borderRadius:'50%',
          width:24, height:24, display:'flex', alignItems:'center',
          justifyContent:'center', cursor:'pointer', color:'var(--gold)'
        }}><X size={12} /></button>
      </div>
      {loading ? (
        <div style={{ padding:'1.5rem', textAlign:'center', color:'var(--green)', fontFamily:"'Inter',sans-serif", fontWeight:600 }}>Recherche en cours...</div>
      ) : ls.length > 0 ? (
        <div style={{ maxHeight:'320px', overflowY:'auto' }}>
          {ls.map((p: any) => (
            <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSq('')} style={{
              display:'flex', alignItems:'center', gap:'0.75rem', padding:'10px 14px',
              borderBottom:'1px solid var(--tan)', textDecoration:'none'
            }}>
              <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                style={{ width:40, height:40, objectFit:'cover', flexShrink:0, borderRadius:'8px' }} alt="" />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'13px', fontWeight:600, color:'var(--brown)' }}>{p.name}</div>
                <div style={{ fontSize:'13px', color:'var(--gold)', fontWeight:700 }}>{p.price} DA</div>
              </div>
            </Link>
          ))}
          <button onClick={() => doSearch()} style={{
            width:'100%', padding:'10px', background:'var(--green-lt)', border:'none',
            borderTop:'1px solid var(--tan)', color:'var(--green)', fontWeight:700,
            fontSize:'12px', cursor:'pointer', fontFamily:"'Inter',sans-serif",
            display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'
          }}>
            Voir tous les résultats <ArrowRight size={12} />
          </button>
        </div>
      ) : sq.length >= 2 && (
        <div style={{ padding:'1.25rem', textAlign:'center', color:'var(--dim)', fontSize:'13px' }}>Aucun résultat</div>
      )}
    </div>
  );

  return (
    <header dir="ltr" style={{ position:'sticky', top:0, zIndex:100, fontFamily:"'Inter',sans-serif" }}>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="ticker-stripe" style={{ background:'var(--green)', padding:'5px 0' }}>
          <div className="ticker-inner">
            {Array(10).fill(null).map((_, i) => (
              <span key={i} style={{ fontSize:'11px', fontWeight:500, letterSpacing:'0.06em', color:'var(--cream)', margin:'0 30px' }}>
                <Leaf size={12} style={{ display:'inline', marginLeft:4, verticalAlign:'middle' }} /> {store.topBar.text} <Leaf size={12} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: scrolled ? 'rgba(253,251,247,0.97)' : 'var(--cream)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--gold)' : 'var(--tan)'}`,
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth:'1280px', margin:'0 auto', padding:'0 20px',
          height:'64px', display:'flex', alignItems:'center',
          justifyContent:'space-between', gap:'16px'
        }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            {(store.design?.logoUrl && store.design.logoUrl !== '/default-logo.png')
              ? <img src={store.design.logoUrl} alt={store.name} style={{ height:'32px', width:'auto', objectFit:'contain' }} />
              : <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <HerbLeaf size={24} />
                  <span className="pd" style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--green)' }}>
                    {store?.name || 'Guérison'}
                  </span>
                </div>
            }
          </Link>

          <div className="nav-search-d" style={{ flex:1, maxWidth:350, position:'relative' }}>
            <form onSubmit={doSearch} style={{ position:'relative' }}>
              <input type="text" placeholder="Rechercher une herbe..." value={sq} onChange={e => setSq(e.target.value)}
                className="inp" style={{ padding:'9px 40px 9px 14px', fontSize:'13px' }} />
              <Search size={14} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--dim)' }} />
            </form>
            {sq.length >= 2 && <SearchDrop />}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
            <div className="hidden lg:flex" style={{ alignItems:'center', gap:'24px' }}>
              {[{ h:'/', l:'Accueil' }, { h:'/contact', l:'Appelez-nous' }].map(i => (
                <Link key={i.h} href={i.h} style={{
                  fontSize:'13px', fontWeight:600, color:'var(--warm)', transition:'color 0.2s'
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--warm)')}>
                  {i.l}
                </Link>
              ))}
            </div>

            <button onClick={() => setShowSearch(!showSearch)} className="lg:hidden"
              style={{ background:'none', border:'none', color:'var(--warm)', cursor:'pointer' }}>
              <Search size={20} />
            </button>

            {store?.cart === true && (
              <Link href="/cart" style={{ position:'relative', color:'var(--brown)', transition:'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--brown)')}>
                <ShoppingCart size={22} />
                {count > 0 && (
                  <span style={{
                    position:'absolute', top:-6, right:-8, background:'var(--gold)', color:'white',
                    fontSize:'10px', fontWeight:700, width:'17px', height:'17px',
                    borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    border:'2px solid var(--cream)'
                  }}>{count}</span>
                )}
              </Link>
            )}

            <button onClick={() => setOpen(!open)} className="lg:hidden"
              style={{
                background:'var(--green)', border:'none', color:'white', padding:'6px',
                borderRadius:'8px', cursor:'pointer'
              }}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {showSearch && (
        <div style={{ background:'var(--cream)', borderBottom:'1px solid var(--gold)', padding:'12px 20px', position:'relative' }} className="fi">
          <form onSubmit={doSearch} style={{ position:'relative' }}>
            <input autoFocus type="text" placeholder="Rechercher ici..." value={sq} onChange={e => setSq(e.target.value)}
              className="inp" style={{ padding:'12px 40px 12px 14px' }} />
            <Search size={16} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--gold)' }} />
          </form>
          {sq.length >= 2 && <SearchDrop />}
        </div>
      )}

      <div className="block lg:hidden" style={{
        maxHeight: open ? '300px' : '0', overflow:'hidden',
        transition:'all 0.4s ease', backgroundColor:'var(--cream)',
        borderBottom: open ? '1px solid var(--gold)' : 'none'
      }}>
        <div style={{ padding:'15px 25px 25px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <Link href="/" onClick={() => setOpen(false)} style={{
              display:'flex', justifyContent:'space-between', padding:'12px 0',
              fontSize:'14px', fontWeight:600, color:'var(--brown)',
              borderBottom:'1px solid var(--tan)'
            }}>
              Accueil <ArrowRight size={14} style={{ color:'var(--gold)' }} />
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} style={{
              display:'flex', justifyContent:'space-between', padding:'12px 0',
              fontSize:'14px', fontWeight:600, color:'var(--brown)',
              borderBottom:'1px solid var(--tan)'
            }}>
              Appelez-nous <ArrowRight size={14} style={{ color:'var(--gold)' }} />
            </Link>
            <button onClick={() => { router.push('/#products'); setOpen(false); }}
              className="btn-primary" style={{ marginTop:'12px', width:'100%' }}>
              <HerbLeaf size={16} /> Acheter maintenant
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer({ store }: any) {
  return (
    <footer dir="ltr" style={{ backgroundColor:'var(--brown)', color:'var(--cream)', fontFamily:"'Inter',sans-serif" }}>
      <div style={{
        background:'var(--green)', padding:'10px 0', textAlign:'center'
      }}>
        <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--cream)', letterSpacing:'0.04em' }}>
          🌿 Guérison Naturelle — Herbes médicinales, Miel Naturel, et compléments Bio 100%
        </p>
      </div>

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'48px 20px 32px' }}>
        <div className="footer-g" style={{ paddingBottom:'36px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <HerbLeaf size={22} />
              <span className="pd" style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--gold)' }}>
                {store?.name || 'Guérison'}
              </span>
            </div>
            <p style={{ fontSize:'13px', lineHeight:'1.7', color:'rgba(255,255,255,0.6)', maxWidth:'240px' }}>
              {store?.hero?.subtitle?.substring(0, 80) || 'Votre boutique de confiance pour les herbes médicinales, le miel naturel et les compléments bio. Produits authentiques de la nature.'}
            </p>
            <div style={{ marginTop:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
              <Truck size={14} style={{ color:'var(--gold)' }} />
              <span style={{ fontSize:'12px', fontWeight:600, color:'var(--gold)' }}>Livraison rapide et sécurisée dans toutes les wilayas</span>
            </div>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'24px' }}>
              &copy; {new Date().getFullYear()} {store?.name}. Tous droits réservés.
            </p>
          </div>

          <div>
            <p className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--gold)', marginBottom:'16px' }}>
              Liens Rapide
            </p>
            {[{ h:'/', l:'Accueil' }, { h:'/cart', l:'Panier' }, { h:'/contact', l:'Appelez-nous' }, { h:'/Privacy', l:'Politique de confidentialité' }, { h:'/Terms', l:"Conditions d'utilisation" }].map(lnk => (
              <a key={lnk.h} href={lnk.h} style={{
                display:'block', fontSize:'13px', color:'rgba(255,255,255,0.6)',
                marginBottom:'8px', transition:'color 0.2s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                {lnk.l}
              </a>
            ))}
          </div>

          <div>
            <p className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--gold)', marginBottom:'16px' }}>
              Informations de contact
            </p>
            {[
              { icon:'📞', val: store?.contact?.phone },
              { icon:'📍', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
              { icon:'✉️', val: store?.contact?.email },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'9px' }}>
                <span style={{ fontSize:'13px' }}>{r.icon}</span>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)' }}>{r.val}</span>
              </div>
            ))}
            <div style={{ marginTop:'14px', padding:'12px 14px', borderRadius:'10px', border:'1px solid var(--gold)', background:'rgba(201,149,44,0.08)' }}>
              <p className="pd" style={{ fontSize:'0.95rem', color:'var(--gold)', marginBottom:2 }}>Équipe de thérapeutes en herboristerie</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)' }}>Réponse sous 24h</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="p-card" dir="ltr">
      <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'var(--beige)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <HerbLeaf size={40} style={{ color:'var(--dim)' }} />
            </div>
        }
        {discount > 0 && (
          <span className="pd" style={{
            position:'absolute', top:10, right:10, background:'var(--red)', color:'white',
            fontSize:'11px', fontWeight:700, padding:'2px 10px', borderRadius:'6px'
          }}>-{discount}%</span>
        )}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'3px',
          background:'linear-gradient(90deg, var(--green), var(--gold))'
        }} />
      </div>
      <div style={{ padding:'14px', flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
        <h3 style={{
          fontSize:'14px', fontWeight:600, color:'var(--brown)', lineHeight:1.3,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'
        }}>
          {product.name}
        </h3>
        <div style={{ display:'flex', gap:'1px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} style={{ width:'11px', height:'11px', fill:i<4?'var(--amber)':'none', color:'var(--amber)' }} />
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:'6px', marginTop:'auto' }}>
          <span className="pd" style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--gold)' }}>{price.toLocaleString()}</span>
          <span style={{ fontSize:'11px', color:'var(--dim)' }}>DA</span>
          {orig > price && (
            <span style={{ fontSize:'11px', color:'var(--dim)', textDecoration:'line-through' }}>{orig.toLocaleString()}</span>
          )}
        </div>
        <Link href={`/product/${product.slug || product.id}`} className="btn-primary"
          style={{ width:'100%', fontSize:'12px', padding:'9px 14px', marginTop:'6px' }}>
          {viewDetails || 'Voir les détails'}
        </Link>
      </div>
    </div>
  );
}

export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir="ltr">
      <section style={{
        position:'relative', overflow:'hidden',
        background:"linear-gradient(180deg, var(--green-lt) 0%, var(--cream) 100%)",
        minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:30, paddingBottom:25
      }}>
        {store.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', opacity:0.06, zIndex:1
          }} />
        )}
        <div style={{
          position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
          background:'linear-gradient(to bottom, rgba(240,245,238,0.5) 0%, transparent 50%, rgba(253,251,247,0.8) 100%)'
        }} />
        <div style={{
          position:'absolute', inset:0, zIndex:3, pointerEvents:'none',
          backgroundImage:'radial-gradient(circle at 20% 50%, rgba(201,149,44,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(45,90,39,0.04) 0%, transparent 50%)'
        }} />
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'3px',
          background:'linear-gradient(90deg, transparent, var(--green), var(--gold), transparent)', zIndex:4
        }} />

        <div style={{
          position:'relative', zIndex:5, padding:'0 5vw', width:'100%',
          maxWidth:'1100px', margin:'0 auto', textAlign:'center',
          display:'flex', flexDirection:'column', alignItems:'center'
        }} className='fi'>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'6px',
            border:'1px solid var(--gold)', padding:'4px 14px', borderRadius:'20px',
            marginBottom:'16px', backgroundColor:'rgba(201,149,44,0.08)'
          }}>
            <Leaf size={12} style={{ color:'var(--green)' }} />
            <span className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)' }}>
              Boutique de Herbes médicinales #1 en Algérie
            </span>
          </div>

          <h1 className="pd" style={{
            fontSize:'clamp(2.5rem, 7vw, 5rem)', lineHeight:1.05,
            color:'var(--brown)', marginBottom:'14px'
          }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                store.hero?.title?.replace(/<[^>]+>/g, '').replace('La nature', '<span style="color:var(--green)">La nature</span>')
                || 'La puissance <span style="color:var(--green)">de la Nature</span><br/>dans Nos produits'
              )
            }}>
          </h1>

          <p style={{
            fontSize:'clamp(14px, 1.6vw, 16px)', lineHeight:'1.7',
            color:'var(--warm)', maxWidth:'540px', marginBottom:'28px'
          }}>
            {store.hero?.subtitle || "Les meilleurs types d'Herbes médicinales, Miel Naturel et compléments Bio. Produits authentiques de la Nature."}
          </p>

          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center', marginBottom:'36px' }}>
            <a href='#products' className="btn-primary" style={{ fontSize:'14px', padding:'12px 34px' }}>
              <HerbLeaf size={16} /> Acheter maintenant
            </a>
            {cats.length > 0 && (
              <a href="#categories" className="btn-outline" style={{ fontSize:'14px', padding:'12px 34px' }}>
                Sections <ChevronDown size={14} />
              </a>
            )}
          </div>

          <div style={{
            display:'flex', gap:'40px', paddingTop:'22px',
            borderTop:'1px solid var(--tan)', flexWrap:'wrap',
            justifyContent:'center', width:'100%', maxWidth:'700px'
          }} className="fi">
            {[
              { v:`${products.length}+`, l:'Produit Naturel', c:'var(--green)' },
              { v:'100%', l:'Bio', c:'var(--gold)' },
              { v:'De confiance', l:'de la Nature', c:'var(--green)' },
              { v:'48h', l:'Livraison rapide', c:'var(--emerald)' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <p className="pd" style={{ fontSize:'clamp(1.8rem, 4vw, 2.4rem)', color:s.c, lineHeight:1, margin:0 }}>
                  {s.v}
                </p>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--dim)', margin:'4px 0 0' }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--tan)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div className="trust-row">
            {[
              { icon:<Leaf size={20} />, color:'var(--green)', title:'Produits Bio', desc:'Naturelle 100%' },
              { icon:<Droplets size={20} />, color:'var(--gold)', title:'Miel pur', desc:'Non falsifié' },
              { icon:<Flower2 size={20} />, color:'var(--emerald)', title:'Herbes médicinales', desc:'Sélectionnés à la main' },
              { icon:<Truck size={20} />, color:'var(--green)', title:'Livraison rapide', desc:'48 heures' },
            ].map((item, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:'12px',
                padding:'16px 20px',
                borderRight:i>0?'1px solid var(--tan)':'none'
              }}>
                <div style={{ color:item.color, flexShrink:0 }}>{item.icon}</div>
                <div style={{ textAlign:'right' }}>
                  <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--brown)', margin:0 }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {cats.length > 0 && (
        <section id="categories" style={{ padding:'64px 0', background:'var(--cream)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 20px' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'32px' }}>
              <div>
                <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'8px', letterSpacing:'0.04em' }}>
                  Nos sections
                </p>
                <h2 className="pd" style={{ fontSize:'clamp(1.8rem, 4vw, 3rem)', color:'var(--brown)', lineHeight:1.1 }}>
                  Parcourir par <span style={{ color:'var(--green)' }}>Produit</span>
                </h2>
              </div>
            </div>
            <div className="cat-grid">
              {cats.slice(0, 4).map((cat: any) => (
                <Link key={cat.id} href={`?category=${cat.id}`}
                  className="cat-card" style={{ aspectRatio:'4/3' }}>
                  {cat.imageUrl
                    ? <img src={cat.imageUrl} alt={cat.name} />
                    : <div style={{
                        width:'100%', height:'100%', display:'flex', alignItems:'center',
                        justifyContent:'center', fontSize:'3rem',
                        background:'linear-gradient(135deg, var(--green-lt), var(--beige))'
                      }}>🌿🍯🌺🌾</div>
                  }
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(to top, rgba(44,24,16,0.8) 0%, transparent 50%)',
                    display:'flex', alignItems:'flex-end', padding:'14px'
                  }}>
                    <div>
                      <p className="pd" style={{ fontSize:'16px', fontWeight:600, color:'white', margin:0 }}>
                        {cat.name}
                      </p>
                      <div style={{ height:'2px', width:'24px', background:'var(--gold)', marginTop:'6px' }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="products" style={{ padding:'32px 0 72px', background:'var(--cream)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 20px' }}>
          <div style={{
            display:'flex', alignItems:'flex-end', justifyContent:'space-between',
            marginBottom:'28px', paddingBottom:'16px', borderBottom:'1px solid var(--tan)'
          }}>
            <div>
              <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'8px', letterSpacing:'0.04em' }}>
                Produits
              </p>
              <h2 className="pd" style={{ fontSize:'clamp(1.8rem, 4vw, 3rem)', color:'var(--brown)', lineHeight:1.1 }}>
                Tous <span style={{ color:'var(--green)' }}>Produits</span>
              </h2>
            </div>
            <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--dim)' }}>{products.length} Produit</p>
          </div>

          {products.length === 0 ? (
            <div style={{ padding:'80px 0', textAlign:'center', border:'1px dashed var(--tan)', borderRadius:'16px' }}>
              <HerbLeaf size={48} style={{ color:'var(--dim)', margin:'0 auto 16px', opacity:0.4, display:'block' }} />
              <p className="pd" style={{ fontSize:'1.8rem', color:'var(--dim)' }}>Bient't</p>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((p: any) => {
                const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="Voir les détails" />;
              })}
            </div>
          )}

          {countPage > 1 && (
            <div className="pagination" dir="ltr">
              <Link href={{ query:{ page:Math.max(1, page-1) } }} scroll={false}
                style={{ width:40, height:40, border:'1px solid var(--tan)', borderRadius:'8px', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--dim)', opacity:page<=1?0.3:1 }}>❮</Link>
              {Array.from({ length:countPage }).map((_, i) => {
                const pn = i + 1; const isA = Number(page) === pn;
                return (
                  <Link key={pn} href={{ query:{ page:pn } }} scroll={false}
                    style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:'14px', borderRadius:'8px', border:`1px solid ${isA?'var(--gold)':'var(--tan)'}`, background:isA?'var(--gold)':'transparent', color:isA?'white':'var(--warm)' }}>
                    {pn}
                  </Link>
                );
              })}
              <Link href={{ query:{ page:Math.min(countPage, Number(page)+1) } }} scroll={false}
                style={{ width:40, height:40, border:'1px solid var(--tan)', borderRadius:'8px', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--dim)', opacity:page>=countPage?0.3:1 }}>❯</Link>
            </div>
          )}
        </div>
      </section>

      <section style={{ padding:'64px 20px', background:'var(--white)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'8px', letterSpacing:'0.04em' }}>
              Pourquoi nous
            </p>
            <h2 className="pd" style={{ fontSize:'clamp(1.8rem, 4vw, 2.8rem)', color:'var(--brown)' }}>
              {' '}<span style={{ color:'var(--green)' }}>Nature</span> Pures, haute qualité
            </h2>
          </div>
          <div className="how-grid">
            {[
              { icon:<Flower2 size={28} />, title:'Produits Bio', desc:'Tous nos Produits Naturelle 100% sans additifs' },
              { icon:<Droplets size={28} />, title:'Miel pur', desc:'Miel Naturel Non falsifié des meilleures ruches' },
              { icon:<Shield size={28} />, title:'Qualité De confiance', desc:'Nous soumettons nos produits à des contrôles qualité périodiques' },
              { icon:<Truck size={28} />, title:'Livraison gratuite', desc:'pour les commandes supérieures à 3000 DA dans toutes les wilayas' },
            ].map((item, i) => (
              <div key={i} className="why-card" style={{
                display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
                padding:'28px 16px', background:'var(--cream)', border:'1px solid var(--tan)',
                borderRadius:'16px', transition:'box-shadow 0.25s'
              }}>
                <div style={{ color:'var(--green)', marginBottom:'12px' }}>{item.icon}</div>
                <h3 className="pd" style={{ fontSize:'15px', fontWeight:600, color:'var(--brown)', marginBottom:'6px' }}>{item.title}</h3>
                <p style={{ fontSize:'13px', color:'var(--warm)', lineHeight:'1.6', margin:0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        position:'relative', overflow:'hidden', padding:'72px 20px',
        background:'linear-gradient(135deg, var(--green) 0%, var(--green-2) 100%)'
      }}>
        <div style={{ position:'absolute', inset:0, opacity:0.05, backgroundImage:'radial-gradient(circle at 20% 30%, white 0%, transparent 30%), radial-gradient(circle at 80% 70%, white 0%, transparent 30%)' }} />
        <div style={{ position:'relative', zIndex:2, maxWidth:'640px', margin:'0 auto', textAlign:'center' }}>
          <HerbLeaf size={48} style={{ color:'var(--gold)', margin:'0 auto 16px', display:'block' }} />
          <h2 className="pd" style={{ fontSize:'clamp(2rem, 5vw, 3.8rem)', color:'white', lineHeight:1.05, marginBottom:'14px' }}>
            Commencez votre aventure avec <span style={{ color:'var(--gold)' }}>La nature</span>
          </h2>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.8)', lineHeight:'1.7', marginBottom:'28px' }}>
            Découvrez le pouvoir du traitement naturel. Herbes médicinales, Miel pur et compléments Bio.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href='#products' className="btn-primary" style={{ fontSize:'15px', padding:'14px 36px', background:'var(--gold)', color:'var(--brown)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#B8860B'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--gold)'}>
              <HerbLeaf size={16} /> Acheter maintenant
            </a>
            <Link href="/contact" style={{
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'8px',
              border:'1.5px solid var(--gold)', color:'var(--gold)',
              fontFamily:"'Inter',sans-serif", fontSize:'15px', fontWeight:700,
              padding:'14px 36px', borderRadius:'12px', cursor:'pointer', transition:'all 0.2s'
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,149,44,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              Consultez-nous <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  if (!product) return null;
  return (
    <div dir="ltr" style={{ background:'var(--cream)' }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'32px 20px' }}>
        <div className="details-g">
          <div>
            <div style={{
              position:'relative', overflow:'hidden',
              background:'var(--white)', border:'1px solid var(--tan)',
              borderRadius:'16px', marginBottom:'10px'
            }}>
              <div style={{ aspectRatio:'1/1' }}>
                {allImages.length > 0
                  ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <HerbLeaf size={64} style={{ color:'var(--dim)', opacity:0.3 }} />
                    </div>
                }
              </div>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg, var(--green), var(--gold))' }} />
              {discount > 0 && (
                <span className="pd" style={{ position:'absolute', top:14, right:14, background:'var(--red)', color:'white', fontSize:'12px', fontWeight:700, padding:'4px 14px', borderRadius:'6px' }}>
                  -{discount}%
                </span>
              )}
              {!inStock && !autoGen && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.85)', backdropFilter:'blur(4px)' }}>
                  <span className="pd" style={{ fontSize:'1.8rem', color:'var(--red)' }}>Non disponible</span>
                </div>
              )}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSel(p => p===0?allImages.length-1:p-1)} style={{
                    position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    width:'34px', height:'34px', border:'1px solid var(--tan)', borderRadius:'50%',
                    background:'rgba(255,255,255,0.9)', cursor:'pointer', display:'flex',
                    alignItems:'center', justifyContent:'center', color:'var(--green)'
                  }}><ChevronRight size={14} /></button>
                  <button onClick={() => setSel(p => p===allImages.length-1?0:p+1)} style={{
                    position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
                    width:'34px', height:'34px', border:'1px solid var(--tan)', borderRadius:'50%',
                    background:'rgba(255,255,255,0.9)', cursor:'pointer', display:'flex',
                    alignItems:'center', justifyContent:'center', color:'var(--green)'
                  }}><ChevronLeft size={14} /></button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="thumb-row">
                {allImages.slice(0,5).map((img:string, idx:number) => (
                  <button key={idx} onClick={() => setSel(idx)} style={{
                    width:'54px', height:'54px', overflow:'hidden', borderRadius:'10px',
                    border:`2px solid ${sel===idx?'var(--gold)':'var(--tan)'}`,
                    cursor:'pointer', padding:0, background:'none', opacity:sel===idx?1:0.6
                  }}>
                    <img src={img} alt='' style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'10px', letterSpacing:'0.04em' }}>Détails du Produit</p>
            <h1 className="pd" style={{ fontSize:'clamp(1.5rem, 3.5vw, 2.5rem)', color:'var(--brown)', lineHeight:1.05, marginBottom:'14px' }}>{product.name}</h1>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid var(--tan)', flexWrap:'wrap' }}>
              <div style={{ display:'flex', gap:'2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} style={{ width:'13px', height:'13px', fill:i<4?'var(--amber)':'none', color:'var(--amber)' }} />
                ))}
              </div>
              <span style={{
                marginRight:'auto', padding:'4px 14px', borderRadius:'6px',
                background:inStock||autoGen?'rgba(45,90,39,0.08)':'rgba(192,57,43,0.08)',
                color:inStock||autoGen?'var(--green)':'var(--red)',
                fontSize:'11px', fontWeight:600, fontFamily:"'Inter',sans-serif",
                border:`1px solid ${inStock||autoGen?'rgba(45,90,39,0.2)':'rgba(192,57,43,0.2)'}`
              }}>
                {autoGen?'Disponible':inStock?'Disponible':'Non disponible'}
              </span>
            </div>

            <div style={{
              padding:'16px', background:'var(--green-lt)', border:'1px solid rgba(45,90,39,0.15)',
              borderRadius:'12px', marginBottom:'22px'
            }}>
              <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'5px' }}>Prix</p>
              <div style={{ display:'flex', alignItems:'baseline', gap:'10px', flexWrap:'wrap' }}>
                <span className="pd" style={{ fontSize:'2.8rem', fontWeight:700, color:'var(--gold)', lineHeight:1 }}>
                  {finalPrice.toLocaleString()}
                </span>
                <span className="pd" style={{ fontSize:'13px', color:'var(--dim)', fontWeight:600 }}>DA</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <span style={{ fontSize:'14px', textDecoration:'line-through', color:'var(--dim)' }}>
                    {parseFloat(product.priceOriginal).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {product.offers?.length > 0 && (
              <div style={{ marginBottom:'22px', paddingBottom:'22px', borderBottom:'1px solid var(--tan)' }}>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'10px' }}>Offres</p>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 14px', border:`1.5px solid ${selectedOffer===o.id?'var(--gold)':'var(--tan)'}`,
                    borderRadius:'10px', cursor:'pointer', marginBottom:'8px',
                    background:selectedOffer===o.id?'var(--gold-lt)':'transparent',
                    transition:'all 0.2s'
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{
                        width:'16px', height:'16px', borderRadius:'50%',
                        border:`2px solid ${selectedOffer===o.id?'var(--gold)':'var(--dim)'}`,
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                      }}>
                        {selectedOffer===o.id && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--gold)' }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer===o.id} onChange={() => setSelectedOffer(o.id)} style={{ display:'none' }} />
                      <div>
                        <p style={{ fontSize:'14px', fontWeight:600, color:'var(--brown)', margin:0 }}>{o.name}</p>
                        <p style={{ fontSize:'11px', color:'var(--dim)', margin:0 }}>Quantité: {o.quantity}</p>
                      </div>
                    </div>
                    <span className="pd" style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--gold)' }}>
                      {o.price.toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'11px', color:'var(--dim)' }}>DA</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom:'18px', paddingBottom:'18px', borderBottom:'1px solid var(--tan)' }}>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'10px' }}>{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {attr.variants.map((v: any) => (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name}
                        style={{ width:'28px', height:'28px', borderRadius:'8px', backgroundColor:v.value, border:'none', cursor:'pointer', outline:`3px solid ${selectedVariants[attr.name]===v.value?'var(--gold)':'transparent'}`, outlineOffset:'3px' }} />
                    ))}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {attr.variants.map((v: any) => (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width:'52px', height:'52px', overflow:'hidden', borderRadius:'10px', border:`2px solid ${selectedVariants[attr.name]===v.value?'var(--gold)':'var(--tan)'}`, cursor:'pointer', padding:0 }}>
                        <img src={v.value} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      return (
                        <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                          className="pd" style={{
                            padding:'8px 16px', borderRadius:'8px',
                            border:`1.5px solid ${s?'var(--gold)':'var(--tan)'}`,
                            background:s?'var(--gold)':'transparent',
                            color:s?'white':'var(--warm)', fontSize:'13px', fontWeight:700,
                            cursor:'pointer', transition:'all 0.2s'
                          }}>
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {product.desc && (
              <div style={{ marginTop:'28px', paddingTop:'22px', borderTop:'1px solid var(--tan)' }}>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'12px' }}>Informations produit</p>
                <div style={{ fontSize:'14px', lineHeight:'1.85', color:'var(--warm)' }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','span'], ALLOWED_ATTR:['class','style'] })
                  }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss=0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore(s => s.initCount);

  useEffect(()=>{ if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(()=>{ if(typeof window!=='undefined'){const id=localStorage.getItem('customerId');if(id) setFd(p=>({...p,customerId:id}));} },[]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);

  const getFP = useCallback(():number=>{
    const base=typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const off=product.offers?.find((o:any)=>o.id===selectedOffer); if(off) return off.price;
    if(product.variantDetails?.length&&Object.keys(selectedVariants).length>0){
      const m=product.variantDetails.find((v:any)=>vm(v,selectedVariants));
      if(m&&m.price!==-1) return m.price;
    }
    return base;
  },[product,selectedOffer,selectedVariants]);

  const getLiv = useCallback(():number=>{ if(!selW) return 0; return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice; },[selW,fd.typeLivraison]);

  const fp = getFP();
  const total = ()=> fp*fd.quantity + getLiv();

  const validate = ()=>{
    const e:Record<string,string>={};
    if(!fd.customerName.trim()) e.customerName='Nom requis';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = "Numéro invalide (ex: 0550123456)";
    if(!fd.customerWelaya) e.customerWelaya='Wilaya requis';
    if(!fd.customerCommune) e.customerCommune="Commune requis";
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
    <div dir="ltr" style={{ marginTop:'22px', paddingTop:'20px', borderTop:'1px solid var(--tan)' }}>
      {product.store?.cart && (
        <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
          <button onClick={addToCart} disabled={isAdded} className="pd" style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            padding:'12px', borderRadius:'10px', cursor:isAdded?'default':'pointer',
            fontWeight:700, fontSize:'13px',
            border:`1.5px solid ${isAdded?'var(--emerald)':'var(--tan)'}`,
            background:isAdded?'rgba(74,124,89,0.1)':'transparent',
            color:isAdded?'var(--emerald)':'var(--warm)', transition:'all 0.25s', fontFamily:'inherit'
          }}>
            {isAdded?<><CheckCircle2 size={14} className="anim-check"/>Ajouté au panier</>:<><ShoppingCart size={14}/>Ajouter au panier</>}
          </button>
          <button onClick={()=>setIsOrderNow(true)} className="btn-primary" style={{ flex:1, padding:'12px' }}>
            <Zap size={14}/> Commander maintenant
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div>
          {product.store?.cart && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', margin:0 }}>Informations de livraison</p>
              <button onClick={()=>setIsOrderNow(false)} className="pd" style={{
                display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:'6px',
                border:'1px solid var(--tan)', background:'transparent', color:'var(--dim)',
                fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit'
              }}>
                <X size={11}/> Annuler
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.customerName} label="Nom complet">
                <input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} placeholder="Votre nom complet" style={INP_S(!!errors.customerName)}/>
              </FR>
              <FR error={errors.customerPhone} label="Numéro de Téléphone">
                <input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} placeholder="05 XX XX XX XX" style={INP_S(!!errors.customerPhone)}/>
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label="Wilaya">
                <div style={{ position:'relative' }}>
                  <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                  <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} className="inp" style={{ paddingLeft:'32px' }}>
                    <option value="">Choisir Wilaya</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="Commune">
                <div style={{ position:'relative' }}>
                  <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e=>setFd({...fd,customerCommune:e.target.value})} className="inp" style={{ paddingLeft:'32px', opacity:!fd.customerWelaya?0.4:1 }}>
                    <option value="">{loadingC?'Chargement en cours...':'Choisir Commune'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="Type de livraison">
              <div className="dlv-2c">
                {(['home','office'] as const).map(type=>(
                  <button key={type} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:type}))} style={{
                    padding:'12px 10px', borderRadius:'10px',
                    border:`1.5px solid ${fd.typeLivraison===type?'var(--gold)':'var(--tan)'}`,
                    backgroundColor:fd.typeLivraison===type?'var(--gold-lt)':'transparent',
                    cursor:'pointer', textAlign:'right', transition:'all 0.2s', fontFamily:'inherit'
                  }}>
                    <p className="pd" style={{
                      fontSize:'12px', fontWeight:600,
                      color:fd.typeLivraison===type?'var(--gold)':'var(--warm)',
                      margin:'0 0 4px'
                    }}>{type==='home'?'à la Maison':'Au bureau'}</p>
                    {selW && <p className="pd" style={{
                      fontSize:'1rem',
                      color:fd.typeLivraison===type?'var(--gold)':'var(--warm)',
                      margin:0
                    }}>{(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'11px', color:'var(--dim)' }}>DA</span></p>}
                  </button>
                ))}
              </div>
            </FR>

            <FR label="Quantité">
              <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid var(--tan)', borderRadius:'10px', overflow:'hidden', background:'var(--white)' }}>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderRight:'1px solid var(--tan)', background:'transparent', cursor:'pointer', color:'var(--gold)', fontSize:'18px', fontWeight:700 }}>-</button>
                <span className="pd" style={{ width:'44px', textAlign:'center', fontSize:'1.2rem', color:'var(--brown)' }}>{fd.quantity}</span>
                <button type="button" onClick={()=>setFd(p=>({...p,quantity:p.quantity+1}))} style={{ width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', borderLeft:'1px solid var(--tan)', background:'transparent', cursor:'pointer', color:'var(--gold)', fontSize:'18px', fontWeight:700 }}>+</button>
              </div>
            </FR>

            <div style={{ border:'1px solid var(--tan)', borderRadius:'12px', marginBottom:'14px', overflow:'hidden', background:'var(--white)' }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--tan)', display:'flex', alignItems:'center', gap:'8px', background:'var(--green-lt)' }}>
                <Package size={13} style={{ color:'var(--green)' }}/>
                <span className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)' }}>Résumé de la commande</span>
              </div>
              {[{l:'Produit',v:product.name.slice(0,22)+(product.name.length>22?'...':'')},{l:'Prix',v:`${fp.toLocaleString()} DA`},{l:'Quantité',v:`× ${fd.quantity}`},{l:'Livraison',v:selW?`${getLiv().toLocaleString()} DA`:'—'}].map(row=>(
                <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 14px', borderBottom:'1px solid var(--tan)' }}>
                  <span className="pd" style={{ fontSize:'12px', color:'var(--dim)' }}>{row.l}</span>
                  <span style={{ fontSize:'13px', fontWeight:600, color:'var(--warm)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px' }}>
                <span className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--dim)' }}>Total</span>
                <span className="pd" style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--gold)' }}>{total().toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'12px', color:'var(--dim)' }}>DA</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-primary" style={{ width:'100%', fontSize:'15px', padding:'14px', cursor:sub?'not-allowed':'pointer', opacity:sub?0.7:1 }}>
              {sub?<><Loader2 style={{ width:'15px', height:'15px', animation:'spin 1s linear infinite' }}/> Traitement en cours...</>:<><Zap size={15}/> Confirmer la commande</>}
            </button>
            <div style={{ display:'flex', justifyContent:'center', gap:'16px', marginTop:'10px' }}>
              {[{icon:<Lock size={11}/>,label:'Sécurisé'},{icon:<Truck size={11}/>,label:'Livraison rapide'},{icon:<Leaf size={11}/>,label:'Naturel'}].map((b,i)=>(
                <div key={i} className="pd" style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'var(--dim)', fontWeight:600 }}>
                  <span style={{ color:'var(--green)' }}>{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', typeLivraison:'home' as 'home'|'office' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const initCount = useCartStore(s => s.initCount);

  useEffect(()=>{ setItems(JSON.parse(localStorage.getItem(domain)||'[]')); if(store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); },[domain,store]);
  useEffect(()=>{ if(!fd.customerWelaya){setCommunes([]);return;} setLC(true); fetchCommunes(fd.customerWelaya).then(d=>{setCommunes(d);setLC(false);}); },[fd.customerWelaya]);

  const selW = useMemo(()=>wilayas.find(w=>String(w.id)===String(fd.customerWelaya)),[wilayas,fd.customerWelaya]);
  const getLiv = ()=>{ if(!selW) return 0; return fd.typeLivraison==='home'?selW.livraisonHome:selW.livraisonOfice; };
  const cartTotal = items.reduce((a,i)=>a+(i.finalPrice*i.quantity),0);
  const finalTotal = cartTotal + getLiv();
  const update = (n:any[])=>{ setItems(n); localStorage.setItem(domain,JSON.stringify(n)); initCount(n.length); };
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
      await axios.post(`${API_URL}/orders/create`,items.map(i=>({...fd,productId:i.productId,storeId:i.storeId,userId:i.userId,selectedOffer:i.selectedOffer,variantDetailId:i.variantDetailId,selectedVariants:i.selectedVariants,platform:i.platform||'store',finalPrice:i.finalPrice,totalPrice:finalTotal,priceLivraison:getLiv(),quantity:i.quantity,customerId:i.customerId||'',priceLoss:selW?.livraisonReturn??0})));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    }catch{}finally{setSubmitting(false);}
  };

  if(success) return (
    <div dir="ltr" style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--cream)' }}>
      <div style={{ textAlign:'center', background:'var(--white)', padding:'4rem 2.5rem', borderRadius:'16px', border:'1px solid var(--gold)', maxWidth:460, width:'100%', boxShadow:'0 8px 30px rgba(201,149,44,0.08)' }}>
        <CheckCircle2 size={48} style={{ color:'var(--emerald)', display:'block', margin:'0 auto 1.25rem' }}/>
        <h2 className="pd" style={{ fontSize:'2.5rem', color:'var(--brown)', marginBottom:'0.625rem' }}>Commande reçue !</h2>
        <p style={{ color:'var(--warm)', marginBottom:'2rem', lineHeight:1.7 }}>Merci de votre confiance. Nous vous contacterons bient't.</p>
        <Link href="/" className="btn-primary" style={{ display:'inline-flex', padding:'13px 28px' }}>Retour à la boutique</Link>
      </div>
    </div>
  );

  if(!items.length) return (
    <div dir="ltr" style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--cream)' }}>
      <div style={{ textAlign:'center', padding:'4rem 2rem', borderRadius:'16px', border:'1px dashed var(--tan)', maxWidth:400, width:'100%' }}>
        <HerbLeaf size={48} style={{ color:'var(--dim)', display:'block', margin:'0 auto 1.25rem', opacity:0.4 }}/>
        <p className="pd" style={{ fontSize:'2rem', color:'var(--dim)', marginBottom:'1.75rem' }}>Panier vide</p>
        <Link href="/" className="btn-primary" style={{ display:'inline-flex', padding:'13px 28px' }}>Acheter maintenant</Link>
      </div>
    </div>
  );

  return (
    <div dir="ltr" style={{ minHeight:'100vh', background:'var(--cream)', padding:'2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'2rem', paddingBottom:'1rem', borderBottom:'2px solid var(--gold)' }}>
          <h1 className="pd" style={{ fontSize:'clamp(2rem, 5vw, 3rem)', color:'var(--brown)' }}>Panier</h1>
          <p className="pd" style={{ fontSize:'13px', color:'var(--dim)', fontWeight:600 }}>{items.length} Produit</p>
        </div>
        <div className="cart-layout">
          <div style={{ background:'var(--white)', border:'1px solid var(--tan)', borderRadius:'16px', overflow:'hidden', alignSelf:'start' }}>
            {items.map((item,i)=>(
              <div key={i} style={{ display:'flex', gap:'1rem', padding:'14px', borderBottom:'1px solid var(--tan)' }}>
                <div style={{ width:80, height:80, flexShrink:0, overflow:'hidden', borderRadius:'10px', border:'1px solid var(--tan)', background:'var(--beige)' }}>
                  <img src={item.product?.imagesProduct?.[0]?.imageUrl||item.product?.productImage} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} alt=''/>
                </div>
                <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <div>
                    <h4 style={{ fontWeight:600, color:'var(--brown)', fontSize:'13px', marginBottom:'4px' }}>{item.product?.name}</h4>
                    <p className="pd" style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--gold)' }}>{item.finalPrice?.toLocaleString()} DA</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'8px' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', border:'1px solid var(--tan)', borderRadius:'8px', overflow:'hidden' }}>
                      <button onClick={()=>changeQty(i,-1)} style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--beige)', border:'none', cursor:'pointer', color:'var(--gold)', fontSize:'1.1rem', fontWeight:700 }}>-</button>
                      <span className="pd" style={{ width:32, textAlign:'center', fontSize:'1rem', color:'var(--brown)', lineHeight:'28px' }}>{item.quantity}</span>
                      <button onClick={()=>changeQty(i,1)} style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--beige)', border:'none', cursor:'pointer', color:'var(--gold)', fontSize:'1.1rem', fontWeight:700 }}>+</button>
                    </div>
                    <button onClick={()=>update(items.filter((_,idx)=>idx!==i))} className="pd" style={{
                      display:'flex', alignItems:'center', gap:4, padding:'4px 8px', border:'none',
                      background:'transparent', color:'var(--dim)', fontSize:'11px', fontWeight:600,
                      cursor:'pointer', transition:'color 0.15s', fontFamily:'inherit'
                    }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color='var(--red)';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color='var(--dim)';}}>
                      <Trash2 size={12}/> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'14px', background:'var(--beige)' }}>
              <span className="pd" style={{ fontWeight:600, fontSize:'13px', color:'var(--dim)' }}>Sous-total</span>
              <span className="pd" style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--brown)' }}>{cartTotal.toLocaleString()} DA</span>
            </div>
          </div>

          <div style={{ background:'var(--white)', border:'1px solid var(--tan)', borderRadius:'16px', padding:'22px', alignSelf:'start' }}>
            <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'16px' }}>Informations de livraison</p>
            <form onSubmit={handleSubmit}>
              <div className="form-2c">
                <FR error={errors.name} label="Nom"><input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} className="inp"/></FR>
                <FR error={errors.phone} label="Téléphone"><input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} className="inp"/></FR>
              </div>
              <div className="form-2c">
                <FR error={errors.w} label="Wilaya">
                  <div style={{ position:'relative' }}>
                    <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                    <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} className="inp" style={{ paddingLeft:'32px' }}>
                      <option value="">Choisir</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
                <FR error={errors.c} label="Commune">
                  <div style={{ position:'relative' }}>
                    <ChevronDown style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'13px', height:'13px', color:'var(--dim)', pointerEvents:'none' }}/>
                    <select value={fd.customerCommune} disabled={loadingC||!fd.customerWelaya} onChange={e=>setFd({...fd,customerCommune:e.target.value})} className="inp" style={{ paddingLeft:'32px', opacity:!fd.customerWelaya?0.4:1 }}>
                      <option value="">{loadingC?'...':'Choisir'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
              </div>

              <div style={{ marginBottom:'14px' }}>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'10px' }}>Type de livraison</p>
                <div className="dlv-2c">
                  {(['home','office'] as const).map(t=>(
                    <button key={t} type="button" onClick={()=>setFd(p=>({...p,typeLivraison:t}))} style={{
                      padding:'14px', borderRadius:'10px',
                      border:`1px solid ${fd.typeLivraison===t?'var(--gold)':'var(--tan)'}`,
                      borderTop:`2px solid ${fd.typeLivraison===t?'var(--gold)':'var(--tan)'}`,
                      background:fd.typeLivraison===t?'var(--gold-lt)':'var(--white)',
                      textAlign:'center', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s'
                    }}>
                      <span style={{ display:'block', fontSize:'1.5rem', marginBottom:'4px' }}>{t==='home'?'🏠':'🏢'}</span>
                      <p className="pd" style={{ fontSize:'12px', fontWeight:600, color:fd.typeLivraison===t?'var(--brown)':'var(--dim)' }}>{t==='home'?'À domicile':'Au bureau'}</p>
                      {selW && <p className="pd" style={{ fontSize:'1rem', color:'var(--gold)', marginTop:'3px' }}>{(t==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} DA</p>}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ border:'1px solid var(--tan)', borderRadius:'12px', marginBottom:'14px', overflow:'hidden', background:'var(--beige)' }}>
                {[{l:'Sous-total',v:`${cartTotal.toLocaleString()} DA`},{l:'Livraison',v:getLiv()?`${getLiv().toLocaleString()} DA`:'—'}].map(row=>(
                  <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 14px', borderBottom:'1px solid var(--tan)' }}>
                    <span className="pd" style={{ fontSize:'12px', color:'var(--dim)' }}>{row.l}</span>
                    <span style={{ fontSize:'13px', fontWeight:600, color:'var(--warm)' }}>{row.v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 14px' }}>
                  <span className="pd" style={{ fontSize:'12px', fontWeight:600, color:'var(--dim)' }}>Total</span>
                  <span className="pd" style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--gold)' }}>{finalTotal.toLocaleString()} <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'12px', color:'var(--dim)' }}>DA</span></span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary" style={{ width:'100%', fontSize:'15px', padding:'14px', cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.7:1 }}>
                {submitting?<><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> En cours...</>:<><Zap size={15}/> Confirmer la commande</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return (
    <>
      {p==='privacy' && <Privacy/>}
      {p==='terms' && <Terms/>}
      {p==='cookies' && <Cookies/>}
      {p==='contact' && <Contact store={store}/>}
    </>
  );
}

const Shell = ({ children, title, sub }: { children: React.ReactNode; title: string; sub?: string }) => (
  <div dir="ltr" style={{ background:'var(--cream)', minHeight:'100vh' }}>
    <div style={{
      background:'linear-gradient(135deg, var(--green-lt), var(--cream))', padding:'56px 20px 40px',
      borderBottom:'1px solid var(--gold)', position:'relative', overflow:'hidden'
    }}>
      <div style={{ maxWidth:'720px', margin:'0 auto', position:'relative', zIndex:2, textAlign:'right' }}>
        {sub && <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'10px', letterSpacing:'0.04em' }}>{sub}</p>}
        <h1 className="pd" style={{ fontSize:'clamp(2.2rem, 5vw, 4rem)', color:'var(--brown)', lineHeight:1.05 }}>
          {title}
        </h1>
      </div>
    </div>
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'36px 20px 80px' }}>
      <div style={{ background:'var(--white)', border:'1px solid var(--tan)', borderRadius:'16px', padding:'28px', textAlign:'right' }}>
        {children}
      </div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom:'18px', marginBottom:'18px', borderBottom:'1px solid var(--tan)', display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'flex-start' }}>
    <div style={{ flex:1, textAlign:'right' }}>
      <h3 className="pd" style={{ fontSize:'14px', fontWeight:600, color:'var(--brown)', margin:'0 0 7px' }}>
        {title}
      </h3>
      <p style={{ fontSize:'13px', lineHeight:'1.8', color:'var(--warm)', margin:0 }}>{body}</p>
    </div>
    {tag && <span className="pd" style={{ fontSize:'10px', fontWeight:600, padding:'4px 10px', borderRadius:'6px', border:'1px solid var(--gold)', color:'var(--gold)', flexShrink:0 }}>{tag}</span>}
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
      <IB title="Produits authentiques" body="Nous vendons uniquement des Produits Naturels authentiques ; les contrefaçons sont strictement interdites." tag="Strict"/>
      <IB title="Loi applicable" body="Ces Conditions sont soumises aux lois de la République Algérienne Démocratique et Populaire."/>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="Politique de cookies" sub="Affaires juridiques">
      <IB title="Cookies essentiels" body="Requis pour les sessions, le Panier et compléter l'achat. Non désactivables." tag="requis"/>
      <IB title="Cookies analytiques" body="Données agrégées pour améliorer la plateforme. Aucune donnée personnelle incluse." tag="Facultatif"/>
      <div style={{ marginTop:'16px', padding:'14px', borderRadius:'10px', border:'1px solid var(--gold)', display:'flex', gap:'10px', alignItems:'flex-start', background:'var(--gold-lt)' }}>
        <ToggleRight size={17} style={{ color:'var(--gold)', flexShrink:0, marginTop:'1px' }}/>
        <p style={{ fontSize:'13px', color:'var(--warm)', lineHeight:'1.75', margin:0, textAlign:'right' }}>
          Vous pouvez gérer ou supprimer les cookies depuis les paramètres de votre navigateur.
        </p>
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store?: any }) {
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`,{...form,storeId:store?.id}); setSent(true); }
    catch { showError('Une Erreur est survenue'); } finally { setLoading(false); }
  };

  return (
    <div dir="ltr" style={{ background:'var(--cream)', minHeight:'100vh' }}>
      <div style={{
        background:'linear-gradient(135deg, var(--green-lt), var(--cream))', padding:'56px 20px 40px',
        borderBottom:'1px solid var(--gold)', position:'relative', overflow:'hidden'
      }}>
        <div style={{ maxWidth:'960px', margin:'0 auto', position:'relative', zIndex:2, textAlign:'right' }}>
          <p className="pd" style={{ fontSize:'13px', fontWeight:600, color:'var(--gold)', marginBottom:'10px', letterSpacing:'0.04em' }}>Contactez-nous</p>
          <h1 className="pd" style={{ fontSize:'clamp(2.2rem, 5vw, 4rem)', color:'var(--brown)', lineHeight:1.05, marginBottom:'8px' }}>
            Contact <span style={{ color:'var(--green)' }}>avec nous</span>
          </h1>
          <p style={{ fontSize:'14px', color:'var(--warm)' }}>L'équipe support répond sous 24h</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth:'960px', margin:'0 auto', padding:'36px 20px 80px' }}>
        <div>
          <div style={{ background:'var(--white)', border:'1px solid var(--tan)', borderRadius:'16px', padding:'22px', marginBottom:'12px', textAlign:'right' }}>
            <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'16px' }}>Informations de contact</p>
            {[
              { icon:'📞', label:'Téléphone', val:store?.contact?.phone },
              { icon:'📍', label:'Adresse', val:[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
              { icon:'✉️', label:'Email', val:store?.contact?.email },
            ].filter(r=>r.val).map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 0', borderBottom:'1px solid var(--tan)' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'var(--green-lt)', border:'1px solid rgba(45,90,39,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>{item.icon}</div>
                <div style={{ textAlign:'right' }}>
                  <p className="pd" style={{ fontSize:'10px', fontWeight:600, color:'var(--green)', margin:'0 0 1px' }}>{item.label}</p>
                  <p style={{ fontSize:'13px', fontWeight:600, color:'var(--brown)', margin:0 }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'linear-gradient(135deg, var(--green), var(--green-2))', padding:'18px 20px', borderRadius:'16px', textAlign:'right' }}>
            <p className="pd" style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--gold)', margin:'0 0 4px' }}>Le pouvoir de la nature.</p>
            <p className="pd" style={{ fontSize:'1.6rem', fontWeight:700, color:'rgba(255,255,255,0.85)', margin:0, lineHeight:1 }}>dans chaque produit.</p>
          </div>
        </div>

        <div style={{ background:'var(--white)', border:'1px solid var(--tan)', borderRadius:'16px', padding:'24px', textAlign:'right' }}>
          <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--green)', marginBottom:'18px' }}>Envoyer un message</p>
          {sent ? (
            <div style={{ minHeight:'200px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:'12px', border:'1px solid var(--gold)', textAlign:'center', background:'var(--gold-lt)', padding:'28px' }}>
              <CheckCircle2 size={32} style={{ color:'var(--emerald)', marginBottom:'12px' }}/>
              <h3 className="pd" style={{ fontSize:'1.5rem', color:'var(--brown)', margin:'0 0 6px' }}>Message envoyé !</h3>
              <p style={{ fontSize:'13px', color:'var(--warm)' }}>Nous vous répondrons sous 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div className="form-2c">
                <div>
                  <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--warm)', marginBottom:'5px' }}>Nom</p>
                  <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="inp"/>
                </div>
                <div>
                  <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--warm)', marginBottom:'5px' }}>Téléphone</p>
                  <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required className="inp"/>
                </div>
              </div>
              <div>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--warm)', marginBottom:'5px' }}>Email</p>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required className="inp"/>
              </div>
              <div>
                <p className="pd" style={{ fontSize:'11px', fontWeight:600, color:'var(--warm)', marginBottom:'5px' }}>Votre message</p>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Comment pouvons-nous vous aider ?" rows={4} required className="inp" style={{ resize:'none' }}/>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent:'center', width:'100%', fontSize:'14px', padding:'13px', opacity:loading?0.7:1, cursor:loading?'not-allowed':'pointer' }}>
                {loading?<><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> En cours...</>:<>Envoyer le message <ArrowRight size={14}/></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
