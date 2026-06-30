'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Phone, CheckCircle2, ArrowLeft,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, MapPin, Leaf, Sparkles, Droplets, Heart, Flower2,
  Mail,
} from 'lucide-react';
import { useCartStore } from '../../../store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

function showError(msg: string) {
  if (typeof document === 'undefined') return;
  const d = document.createElement('div');
  d.dir = 'rtl';
  d.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:12px 28px;border-radius:10px;z-index:99999;font-size:15px;font-family:inherit;box-shadow:0 4px 20px rgba(0,0,0,.25);pointer-events:none';
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 3000);
}

/* ─── Palette ─── */
const RO  = '#C17B8E';   // rose
const ROD = '#8B4F63';   // deep rose
const ROL = 'rgba(193,123,142,0.1)';
const ROB = 'rgba(193,123,142,0.18)';
const GD  = '#C4956A';   // gold
const BG  = '#FAF6F3';   // warm cream bg
const CR  = '#F5EEE8';   // ivory
const CARD= '#FFFFFF';
const INK = '#1A1215';
const SUB = '#7A6268';
const BD  = '#EDE0D8';
const SAGE= '#89A88A';

/* ─── CSS ─── */
const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Tajawal:wght@300;400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Tajawal', sans-serif; background: ${BG}; color: ${INK}; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${BG}; }
  ::-webkit-scrollbar-thumb { background: ${BD}; border-radius: 10px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes checkPop { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes ticker   { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
  @keyframes shimmer  { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
  @keyframes glb-ov-in    { from { opacity:0; } to { opacity:1; } }
  @keyframes glb-ov-panel { from { opacity:0; transform:translateY(-14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes petals { 0%,100% { transform:translateY(0) rotate(-8deg) scale(1); } 50% { transform:translateY(-10px) rotate(4deg) scale(1.05); } }

  .anim-fade-up { animation: fadeUp 0.45s ease both; }
  .anim-check   { animation: checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
  .anim-petals  { animation: petals 5s ease-in-out infinite; }

  /* NAV */
  .nav-desktop { display: none; align-items: center; gap: 2rem; }
  .nav-mobile  { display: flex; gap: 0.5rem; }
  @media (min-width: 1024px) { .nav-desktop { display: flex; } .nav-mobile { display: none; } }

  /* TICKER */
  .ann-wrap  { overflow: hidden; direction: ltr; }
  .ann-track { display: flex; width: max-content; animation: ticker 32s linear infinite; }
  .ann-track span { padding: 0 3rem; white-space: nowrap; direction: rtl; unicode-bidi: embed; font-size: 0.65rem; letter-spacing: 0.12em; font-weight: 500; }

  /* GRID */
  .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
  @media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 1.75rem; } }
  @media (min-width: 900px)  { .products-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

  /* CARD */
  .co-card { background: ${CARD}; border-radius: 18px; overflow: hidden; border: 1px solid ${BD}; transition: all 0.38s cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column; cursor: pointer; }
  .co-card:hover { box-shadow: 0 24px 64px rgba(193,123,142,0.18); transform: translateY(-6px); border-color: rgba(193,123,142,0.35); }
  .co-img  { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.65s cubic-bezier(0.4,0,0.2,1); }
  .co-card:hover .co-img { transform: scale(1.06); }
  .co-cta  { display: flex; align-items: center; justify-content: center; gap: 7px; width: 100%; background: ${INK}; color: #fff; font-size: 0.75rem; font-weight: 500; padding: 0.85rem 1rem; border: none; cursor: pointer; transition: background 0.25s; font-family: 'Tajawal', sans-serif; text-decoration: none; letter-spacing: 0.1em; }
  .co-cta:hover { background: ${ROD}; }

  /* TRUST STRIP */
  .trust-strip { display: grid; grid-template-columns: repeat(2,1fr); }
  @media (min-width: 768px) { .trust-strip { grid-template-columns: repeat(4,1fr); } }

  /* CATS */
  .cats-scroll { display: flex; gap: 0.625rem; flex-wrap: wrap; }

  /* FEATURES */
  .features-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1.5rem; }
  @media (min-width: 900px) { .features-grid { grid-template-columns: repeat(4,1fr); } }

  /* DETAILS */
  .details-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; padding: 1.25rem; }
  .gallery-container { position: relative; top: 0; }
  .info-panel { background: ${CARD}; border-radius: 18px; border: 1px solid ${BD}; padding: 1.75rem; }
  @media (min-width: 768px) {
    .details-inner { grid-template-columns: 1fr 1fr; gap: 4rem; padding: 3rem; }
    .gallery-container { position: sticky; top: 88px; }
    .info-panel { padding: 2.5rem; }
  }

  /* FORM */
  .form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
  @media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }
  .cart-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .cart-inner { grid-template-columns: 1.25fr 1fr; gap: 3.5rem; } }
  .contact-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .contact-inner { grid-template-columns: 1fr 1.8fr; } }
  .footer-cols { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
  @media (min-width: 768px) { .footer-cols { grid-template-columns: 2fr 1fr 1fr; } }
  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .cart-add-btns { flex-direction: row; } }
  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .thumb-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; overflow-x: auto; padding-bottom: 4px; }

  /* PAGINATION */
  .pagination { display: flex; justify-content: center; gap: 0.375rem; flex-wrap: wrap; margin-top: 3.5rem; }

  /* SEARCH OVERLAY */
  .glb-search-ov { position: fixed; inset: 0; z-index: 9999; background: rgba(250,246,243,0.97); backdrop-filter: blur(28px); overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; animation: glb-ov-in 0.2s ease; }
  .glb-search-panel { max-width: 580px; margin: 0 auto; padding: 5rem 1.5rem 4rem; animation: glb-ov-panel 0.28s ease; direction: rtl; }
  .glb-search-form  { border-bottom: 1.5px solid ${RO}; display: flex; align-items: center; margin-bottom: 2rem; }
  .glb-search-input { flex: 1; font-size: 1.2rem; border: none; background: transparent; color: ${INK}; outline: none; padding: 0.5rem 0.5rem 0.75rem; font-family: 'Tajawal', sans-serif; direction: rtl; font-weight: 300; }
  .glb-search-input::placeholder { color: ${BD}; }
  .glb-search-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px,1fr)); gap: 1rem; direction: rtl; }
  .glb-search-card  { display: block; background: ${CARD}; border-radius: 14px; border: 1px solid ${BD}; overflow: hidden; transition: all 0.2s; color: inherit; text-decoration: none; }
  .glb-search-card:hover { border-color: ${RO}; box-shadow: 0 6px 24px rgba(193,123,142,0.14); }
  .glb-search-card-info { padding: 0.625rem 0.75rem; direction: rtl; }

  a { text-decoration: none; color: inherit; }
  .price-mono { font-variant-numeric: tabular-nums; }
`;

/* ─── Types ─── */
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

/* ─── Helpers ─── */
function variantMatches(d: VariantDetail, sel: Record<string,string>) {
  return Object.entries(sel).every(([n,v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas  = async (uid: string): Promise<Wilaya[]>  => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; } };

/* ─── Shared styles ─── */
const S = {
  input: { width:'100%', padding:'0.75rem 1rem', background: CR, border:`1px solid ${BD}`, borderRadius:10, fontSize:'0.875rem', color: INK, outline:'none', transition:'border-color 0.2s', fontFamily:"'Tajawal',sans-serif" } as React.CSSProperties,
  inputErr: { borderColor:'#DC2626' } as React.CSSProperties,
  btnPrimary: { width:'100%', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, background: INK, color:'#fff', fontWeight:500, fontSize:'0.875rem', padding:'0.95rem 1.5rem', borderRadius:12, border:'none', cursor:'pointer', transition:'background 0.25s', fontFamily:"'Tajawal',sans-serif", letterSpacing:'0.04em' } as React.CSSProperties,
};

/* ══════════════════════════════════════════
   MAIN (Layout shell)
══════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div style={{ minHeight:'100vh', background: BG }}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ══════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch]   = useState<any[]>([]);
  const [loading, setLoading]         = useState(false);
  const [imgError, setImgError]       = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const count     = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { const s = localStorage.getItem(domain); initCount(JSON.parse(s||'[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 80);
    else { setSearchQuery(''); setListSearch([]); }
  }, [showSearch]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params:{ search: searchQuery } }); setListSearch(data.products||[]); }
      catch {} finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setShowSearch(false); }
  };

  return (
    <>
      {/* ── Announcement ticker ── */}
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="ann-wrap" style={{ height:32, display:'flex', alignItems:'center', background: INK, color:'rgba(255,255,255,0.82)' }}>
          <div className="ann-track">
            {Array.from({ length:8 }).map((_,i) => (
              <span key={i}>✨ {store.topBar.text}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Nav bar ── */}
      <nav dir="rtl" style={{
        position:'sticky', top:0, zIndex:50,
        background: scrolled ? 'rgba(250,246,243,0.96)' : '#fff',
        backdropFilter:'blur(16px)',
        borderBottom:`1px solid ${scrolled ? BD : 'rgba(237,224,216,0.5)'}`,
        transition:'box-shadow 0.3s, background 0.3s',
        boxShadow: scrolled ? '0 2px 24px rgba(193,123,142,0.08)' : 'none',
      }}>
        <div style={{ maxWidth:1320, margin:'0 auto', padding:'0 1.5rem', height:66, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1.5rem' }}>

          {/* Logo */}
          <Link href="/" style={{ flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
              <img src={store.design.logoUrl} style={{ height:36, objectFit:'contain' }} alt={store?.name||''} onError={() => setImgError(true)} />
            ) : (
              <>
                <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${RO},${ROD})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Flower2 size={15} color="#fff" />
                </div>
                <div>
                  <span style={{ fontSize:'1rem', fontWeight:700, color: INK, display:'block', lineHeight:1.1, letterSpacing:'-0.01em', fontFamily:"'Cormorant Garamond',serif" }}>{store?.name||'Pure Organics'}</span>
                  <span style={{ fontSize:'0.5rem', color: RO, letterSpacing:'0.16em', textTransform:'uppercase', fontWeight:500 }}>Organic Beauty</span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop" style={{ flex:1, justifyContent:'center' }}>
            {[{ h:'/', l:'الرئيسية' }, { h:'/contact', l:'تواصل معنا' }].map(lnk => (
              <Link key={lnk.h} href={lnk.h} style={{ fontSize:'0.875rem', fontWeight:500, color: SUB, transition:'color 0.15s', letterSpacing:'0.02em' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = ROD)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = SUB)}>
                {lnk.l}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="nav-desktop" style={{ flexShrink:0, gap:'0.625rem' }}>
            <button onClick={() => setShowSearch(true)} style={{ width:38, height:38, borderRadius:'50%', border:`1px solid ${BD}`, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: SUB, transition:'all 0.18s' }}
              onMouseEnter={e => { const el=e.currentTarget as HTMLButtonElement; el.style.borderColor=RO; el.style.color=RO; el.style.background=ROL; }}
              onMouseLeave={e => { const el=e.currentTarget as HTMLButtonElement; el.style.borderColor=BD; el.style.color=SUB; el.style.background='transparent'; }}>
              <Search size={14} />
            </button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position:'relative', display:'flex', alignItems:'center', gap:7, background:`linear-gradient(135deg,${RO},${ROD})`, color:'#fff', height:38, padding:'0 1.25rem', borderRadius:12, fontSize:'0.8rem', fontWeight:600, letterSpacing:'0.04em', transition:'opacity 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.88')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}>
                <ShoppingCart size={13} /> السلة
                {count > 0 && <span style={{ background:'#fff', color: ROD, fontSize:9, fontWeight:800, width:17, height:17, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{count}</span>}
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="nav-mobile">
            <button onClick={() => setShowSearch(true)} style={{ width:36, height:36, borderRadius:'50%', border:`1px solid ${BD}`, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: SUB }}><Search size={14} /></button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position:'relative', background:`linear-gradient(135deg,${RO},${ROD})`, color:'#fff', width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ShoppingCart size={14} />
                {count > 0 && <span style={{ position:'absolute', top:-3, right:-3, background: INK, color:'#fff', fontSize:8, fontWeight:800, width:14, height:14, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{count}</span>}
              </Link>
            )}
            <button onClick={() => setOpen(!open)} style={{ width:36, height:36, borderRadius:'50%', border:`1px solid ${BD}`, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: SUB }}>
              {open ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div style={{ overflow:'hidden', maxHeight: open ? 180 : 0, transition:'max-height 0.28s ease', background: CR, borderTop: open ? `1px solid ${BD}` : 'none' }}>
          <div style={{ padding:'0.875rem 1.5rem 1.5rem' }}>
            {[{ h:'/', l:'الرئيسية' }, { h:'/contact', l:'تواصل معنا' }].map(lnk => (
              <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.8rem 0', borderBottom:`1px solid ${BD}`, fontSize:'0.9rem', fontWeight:500, color: INK }}>
                {lnk.l} <ArrowLeft size={13} style={{ color: RO }} />
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Search overlay ── */}
      {showSearch && (
        <div className="glb-search-ov" onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div className="glb-search-panel">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Flower2 size={14} color={RO} />
                <span style={{ fontSize:'0.65rem', fontWeight:600, color: SUB, letterSpacing:'0.12em', textTransform:'uppercase' }}>البحث</span>
              </div>
              <button onClick={() => setShowSearch(false)} style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${BD}`, background: CARD, color: SUB, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={13}/></button>
            </div>
            <form className="glb-search-form" onSubmit={handleSearch}>
              <Search size={16} style={{ color: RO, flexShrink:0, marginLeft:10 }} />
              <input ref={searchInputRef} className="glb-search-input" type="text" placeholder="ابحثي عن منتج..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </form>
            {loading && <p style={{ textAlign:'center', color: RO, fontSize:'0.82rem', padding:'2rem' }}>جاري البحث...</p>}
            {!loading && listSearch.length > 0 && (
              <>
              <div className="glb-search-grid">
                {listSearch.map((p:any) => (
                  <Link key={p.id} href={`/product/${p.slug||p.id}`} className="glb-search-card" onClick={() => setShowSearch(false)}>
                    {(p.productImage||p.imagesProduct?.[0]?.imageUrl) && (
                      <img src={p.productImage||p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width:'100%', aspectRatio:'1/1', objectFit:'cover', display:'block' }} />
                    )}
                    <div className="glb-search-card-info">
                      <p style={{ fontSize:'0.78rem', fontWeight:500, color: INK, marginBottom:3, lineHeight:1.35 }}>{p.name}</p>
                      <p style={{ fontSize:'0.74rem', fontWeight:700, color: RO }}>{Number(p.price).toLocaleString()} دج</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button onClick={handleSearch} style={{ width: '100%', padding: '12px', background: ROL, border: 'none', borderTop: `1px solid rgba(193,123,142,0.2)`, color: RO, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                عرض جميع النتائج <ArrowLeft size={14} />
              </button>
              </>
            )}
            {!loading && searchQuery.length >= 2 && listSearch.length === 0 && (
              <p style={{ textAlign:'center', color: BD, fontSize:'0.875rem', padding:'3rem' }}>لا توجد نتائج</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   FOOTER
══════════════════════════════════════════ */
export function Footer({ store }: any) {
  return (
    <footer dir="rtl" style={{ background: INK, color:'rgba(255,255,255,0.38)', marginTop:80 }}>
      <div style={{ maxWidth:1320, margin:'0 auto', padding:'4.5rem 2rem 2rem' }}>
        <div className="footer-cols" style={{ paddingBottom:'3rem', marginBottom:'2rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.5rem' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:`linear-gradient(135deg,${RO},${ROD})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Flower2 size={13} color="#fff" /></div>
              <span style={{ fontSize:'1.1rem', fontWeight:700, color:'#fff', fontFamily:"'Cormorant Garamond',serif", letterSpacing:'-0.01em' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize:'0.875rem', lineHeight:1.95, maxWidth:260, fontWeight:300 }}>
              {store?.hero?.subtitle?.substring(0,110) || 'مستحضرات تجميل عضوية نقية مستوحاة من جمال الطبيعة.'}
            </p>
            <div style={{ display:'flex', gap:6, marginTop:'1.75rem', flexWrap:'wrap' }}>
              {['🌿 عضوي', '🐇 Cruelty-Free', '🌱 Vegan'].map(b => (
                <span key={b} style={{ fontSize:'0.58rem', fontWeight:600, color:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'3px 9px', letterSpacing:'0.08em' }}>{b}</span>
              ))}
            </div>
            <p style={{ marginTop:'2.5rem', fontSize:'0.6rem', color:'rgba(255,255,255,0.14)' }}>© {new Date().getFullYear()} {store?.name}</p>
          </div>
          <div>
            <h4 style={{ fontSize:'0.58rem', fontWeight:700, color: RO, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:'1.5rem' }}>الصفحات</h4>
            {[{ h:'/', l:'الرئيسية' }, { h:'/cart', l:'السلة' }, { h:'/contact', l:'تواصلي معنا' }, { h:'/Privacy', l:'الخصوصية' }, { h:'/Terms', l:'الشروط' }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map((lnk,i) => (
              <Link key={i} href={lnk.h} style={{ display:'block', fontSize:'0.875rem', color:'rgba(255,255,255,0.38)', marginBottom:'0.65rem', fontWeight:300, transition:'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = RO)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.38)')}>
                {lnk.l}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize:'0.58rem', fontWeight:700, color: RO, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:'1.5rem' }}>تواصل</h4>
            {[
              { icon:<Phone size={12}/>, val: store?.contact?.phone },
              { icon:<Mail size={12}/>, val: store?.contact?.email },
              { icon:<MapPin size={12}/>, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map((r,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.875rem' }}>
                <span style={{ color: RO, flexShrink:0 }}>{r.icon}</span>
                <span style={{ fontSize:'0.875rem', fontWeight:300 }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════
   CARD
══════════════════════════════════════════ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig  = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="co-card">
      {/* Image */}
      <div style={{ position:'relative', aspectRatio:'3/4', background: CR, overflow:'hidden' }}>
        {displayImage
          ? <img className="co-img" src={displayImage} alt={product.name} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Flower2 size={44} color={BD} /></div>}
        {discount > 0 && (
          <div style={{ position:'absolute', top:12, right:12, background:`linear-gradient(135deg,${RO},${ROD})`, color:'#fff', fontSize:'0.65rem', fontWeight:700, padding:'5px 11px', borderRadius:20, letterSpacing:'0.04em' }}>
            -{discount}%
          </div>
        )}
        {/* Heart */}
        <button style={{ position:'absolute', top:12, left:12, width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', backdropFilter:'blur(4px)', transition:'all 0.2s' }}
          onMouseEnter={e => { const el=e.currentTarget as HTMLButtonElement; el.style.background=`rgba(193,123,142,0.15)`; }}
          onMouseLeave={e => { const el=e.currentTarget as HTMLButtonElement; el.style.background=`rgba(255,255,255,0.9)`; }}>
          <Heart size={13} color={RO} />
        </button>
      </div>
      {/* Info */}
      <div style={{ padding:'0.875rem 1rem 0.75rem', flex:1 }}>
        <p style={{ fontSize:'0.55rem', fontWeight:700, color: RO, marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.14em' }}>{store?.name}</p>
        <h3 style={{ fontSize:'0.875rem', fontWeight:500, color: INK, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden', marginBottom:'0.625rem' }}>{product.name}</h3>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span className="price-mono" style={{ fontSize:'1.05rem', fontWeight:700, color: INK }}>{price.toLocaleString()}</span>
          <span style={{ fontSize:'0.62rem', color: SUB }}>{store.currency||'دج'}</span>
          {orig > price && <span className="price-mono" style={{ fontSize:'0.7rem', color: BD, textDecoration:'line-through' }}>{orig.toLocaleString()}</span>}
        </div>
        {/* Stars */}
        <div style={{ display:'flex', gap:2, marginTop:'0.375rem' }}>
          {[...Array(5)].map((_,i) => <Star key={i} size={10} style={{ fill: i < 4 ? GD : 'none', color: GD }} />)}
        </div>
      </div>
      <Link href={`/product/${product.slug||product.id}`} className="co-cta">
        {viewDetails} <ArrowLeft size={11} />
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════════
   HOME
══════════════════════════════════════════ */
export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats:     any[] = store.categories || [];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir="rtl">

      {/* ══ HERO — صورة خلفية كاملة ══ */}
      <section style={{ position:'relative', minHeight:'clamp(580px,88vh,820px)', overflow:'hidden' }}>
        {/* Background image */}
        {store.hero?.imageUrl
          ? <img src={store.hero.imageUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block' }} />
          : <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${CR} 0%,rgba(193,123,142,0.3) 100%)` }} />
        }
        {/* Gradient overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to left, rgba(26,18,21,0.06) 0%, rgba(26,18,21,0.5) 40%, rgba(26,18,21,0.88) 100%)' }} />

        {/* Decorative petal */}
        <div className="anim-petals" style={{ position:'absolute', bottom:'-40px', left:'-40px', zIndex:1, opacity:0.08, pointerEvents:'none' }}>
          <Flower2 size={220} color="#fff" />
        </div>

        {/* Content */}
        <div style={{ position:'relative', zIndex:2, width:'100%', minHeight:'clamp(580px,88vh,820px)', display:'flex', alignItems:'center' }}>
          <div style={{ maxWidth:1320, margin:'0 auto', width:'100%', padding:'clamp(3rem,8vw,6rem) clamp(1.25rem,4vw,3rem)', display:'flex', justifyContent:'flex-start' }}>
            <div className="anim-fade-up" style={{ maxWidth:540, width:'100%' }}>
              {/* Eyebrow */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:'1.75rem', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:50, padding:'6px 16px' }}>
                <Flower2 size={11} color={RO} />
                <span style={{ fontSize:'0.6rem', fontWeight:600, color:'rgba(255,255,255,0.9)', letterSpacing:'0.2em', textTransform:'uppercase' }}>نقي · طبيعي · عضوي</span>
              </div>

              {/* Heading */}
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(3rem,7vw,5.5rem)', fontWeight:600, color:'#fff', lineHeight:1.05, letterSpacing:'-0.02em', marginBottom:'1.25rem' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || 'جمالكِ<br/><em style="color:' + RO + ';font-style:italic">من الطبيعة</em>') }} />

              {/* Divider */}
              <div style={{ width:56, height:2, background:`linear-gradient(to left,${RO},transparent)`, marginBottom:'1.5rem' }} />

              {/* Subtitle */}
              <p style={{ fontSize:'clamp(0.9rem,2vw,1.05rem)', color:'rgba(255,255,255,0.75)', lineHeight:1.9, marginBottom:'2.5rem', fontWeight:300, maxWidth:380 }}>
                {store.hero?.subtitle || 'مستحضرات تجميل عضوية نقية مصنوعة من أفضل المكونات الطبيعية، لبشرة مشرقة وصحية.'}
              </p>

              {/* CTAs */}
              <div style={{ display:'flex', gap:'0.875rem', flexWrap:'wrap', marginBottom:'3rem' }}>
                <a href="#products" style={{ display:'inline-flex', alignItems:'center', gap:8, background:`linear-gradient(135deg,${RO},${ROD})`, color:'#fff', fontWeight:600, fontSize:'0.875rem', padding:'0.95rem 2rem', borderRadius:12, letterSpacing:'0.06em', boxShadow:`0 8px 28px rgba(193,123,142,0.45)`, transition:'opacity 0.2s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity='0.88')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity='1')}>
                  اكتشفي المنتجات <ArrowLeft size={15} />
                </a>
                {store?.cart !== false && (
                  <Link href="/cart" style={{ display:'inline-flex', alignItems:'center', gap:8, color:'#fff', fontWeight:500, fontSize:'0.875rem', padding:'0.95rem 1.75rem', borderRadius:12, border:'1.5px solid rgba(255,255,255,0.35)', backdropFilter:'blur(8px)', background:'rgba(255,255,255,0.08)', letterSpacing:'0.04em', transition:'all 0.2s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.18)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.08)')}>
                    <ShoppingCart size={14} /> السلة
                  </Link>
                )}
              </div>

              {/* Mini stats */}
              <div style={{ display:'flex', gap:'2rem', paddingTop:'2rem', borderTop:'1px solid rgba(255,255,255,0.15)' }}>
                {[{ n:'+500', l:'منتج طبيعي' }, { n:'58', l:'ولاية' }, { n:'100%', l:'عضوي' }].map((s:{n:string;l:string},i:number) => (
                  <div key={i}>
                    <p style={{ fontSize:'1.5rem', fontWeight:700, color:'#fff', lineHeight:1, fontFamily:"'Cormorant Garamond',serif" }}>{s.n}</p>
                    <p style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.55)', marginTop:4, letterSpacing:'0.1em', textTransform:'uppercase' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TRUST STRIP ══ */}
      <section className="trust-strip" style={{ borderBottom:`1px solid ${BD}` }}>
        {[
          { icon:<Leaf size={16}/>,      t:'مكونات عضوية',    s:'100% طبيعية معتمدة' },
          { icon:<Droplets size={16}/>,  t:'زيوت نقية',       s:'بدون إضافات كيماوية' },
          { icon:<Heart size={16}/>,     t:'Cruelty-Free',    s:'غير مُختبر على الحيوانات' },
          { icon:<Sparkles size={16}/>,  t:'نباتية 100%',     s:'Vegan Certified' },
        ].map((item,i) => (
          <div key={i} style={{ padding:'1.25rem 1.375rem', display:'flex', alignItems:'center', gap:'0.875rem', background: i%2===0 ? CR : CARD, borderLeft: i>0 ? `1px solid ${BD}` : 'none', borderTop: i>=2 ? `1px solid ${BD}` : 'none', transition:'background 0.2s' }}>
            <div style={{ width:40, height:40, borderRadius:12, background: ROL, border:`1px solid ${ROB}`, display:'flex', alignItems:'center', justifyContent:'center', color: RO, flexShrink:0 }}>{item.icon}</div>
            <div>
              <p style={{ fontSize:'0.8rem', fontWeight:600, color: INK }}>{item.t}</p>
              <p style={{ fontSize:'0.62rem', color: SUB, marginTop:2 }}>{item.s}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ══ CATEGORIES ══ */}
      {cats.length > 0 && (
        <section style={{ padding:'2.75rem 1.5rem', maxWidth:1320, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem' }}>
            <h2 style={{ fontSize:'1rem', fontWeight:600, color: INK, letterSpacing:'-0.01em', whiteSpace:'nowrap' as const }}>تصفحي الفئات</h2>
            <div style={{ flex:1, height:1, background: BD }} />
          </div>
          <div className="cats-scroll">
            <Link href="?" style={{ display:'inline-flex', alignItems:'center', padding:'0.5rem 1.25rem', borderRadius:999, border:`1.5px solid ${!activeCategory ? RO : '#ccc'}`, background: !activeCategory ? RO : 'transparent', color: !activeCategory ? '#fff' : 'inherit', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }}>
                الكل
              </Link>
            {cats.map((cat:any) => {
              const isActive = activeCategory === String(cat.id);
              return (
              <Link key={cat.id} href={`?category=${cat.id}`}
                style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'0.5rem 1.25rem', borderRadius:50, border:`1px solid ${isActive ? RO : BD}`, background: isActive ? RO : CARD, fontSize:'0.8rem', fontWeight:500, color: isActive ? '#fff' : INK, transition:'all 0.2s', whiteSpace:'nowrap' as const }}
                onMouseEnter={e => { const el=e.currentTarget as HTMLAnchorElement; el.style.background=ROL; el.style.borderColor=RO; el.style.color=ROD; }}
                onMouseLeave={e => { const el=e.currentTarget as HTMLAnchorElement; el.style.background=isActive ? RO : CARD; el.style.borderColor=isActive ? RO : BD; el.style.color=isActive ? '#fff' : INK; }}>
                <Flower2 size={11} color={isActive ? '#fff' : RO} />{cat.name}
              </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ══ PRODUCTS ══ */}
      <section id="products" style={{ padding:'0 1.5rem 6rem', maxWidth:1320, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'2.25rem', paddingBottom:'1.25rem', borderBottom:`1px solid ${BD}` }}>
          <div>
            <p style={{ fontSize:'0.58rem', fontWeight:700, color: RO, textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:6 }}>Pure Organics</p>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:600, color: INK, lineHeight:1, letterSpacing:'-0.02em' }}>منتجاتنا</h2>
            {store.count > 0 && <p style={{ fontSize:'0.68rem', color: SUB, marginTop:5 }}>{store.count} منتج</p>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            <Flower2 size={13} color={RO} className="anim-petals" />
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ padding:'7rem 1.5rem', textAlign:'center', border:`1.5px dashed ${BD}`, borderRadius:16, background: CR }}>
            <Flower2 size={44} color={BD} style={{ display:'block', margin:'0 auto 1.25rem' }} />
            <p style={{ color: SUB, fontSize:'0.9rem', fontWeight:300 }}>لا توجد منتجات بعد</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p:any) => {
              const img  = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="اكتشفي" />;
            })}
          </div>
        )}

        {countPage > 1 && (
          <div className="pagination" dir="rtl">
            <Link href={{ query:{ page: Math.max(1,page-1) } }} scroll={false} style={{ height:38, padding:'0 1rem', border:`1px solid ${BD}`, display:'flex', alignItems:'center', background: CARD, color: SUB, fontSize:'0.8rem', borderRadius:10 }}>❮</Link>
            {Array.from({ length: countPage }).map((_,i) => {
              const pn = i+1; const isA = Number(page)===pn;
              return <Link key={pn} href={{ query:{ page:pn } }} scroll={false} style={{ height:38, padding:'0 1rem', display:'flex', alignItems:'center', fontSize:'0.8rem', fontWeight:700, border:`1px solid ${isA ? RO : BD}`, borderRadius:10, background: isA ? `linear-gradient(135deg,${RO},${ROD})` : CARD, color: isA ? '#fff' : SUB }}>{pn}</Link>;
            })}
            <Link href={{ query:{ page: Math.min(countPage,Number(page)+1) } }} scroll={false} style={{ height:38, padding:'0 1rem', border:`1px solid ${BD}`, display:'flex', alignItems:'center', background: CARD, color: SUB, fontSize:'0.8rem', borderRadius:10 }}>❯</Link>
          </div>
        )}
      </section>

      {/* ══ INGREDIENTS / WHY US ══ */}
      <section style={{ background: INK, padding:'5rem 1.5rem', marginTop:'-2rem' }}>
        <div style={{ maxWidth:1320, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
            <p style={{ fontSize:'0.58rem', fontWeight:700, color: RO, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:12 }}>لماذا نحن</p>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2rem,5vw,3rem)', fontWeight:600, color:'#fff', letterSpacing:'-0.02em' }}>الطبيعة في كل قطرة</h2>
          </div>
          <div className="features-grid">
            {[
              { icon:<Leaf size={20}/>,     t:'100% عضوي',     d:'مكونات معتمدة عضوياً من أجود المصادر الطبيعية حول العالم.' },
              { icon:<Droplets size={20}/>, t:'بدون كيماويات', d:'خالية تماماً من البارابين، السيليكون، والأصباغ الصناعية.' },
              { icon:<Heart size={20}/>,    t:'آمن للبشرة',    d:'مختبر ومعتمد من خبراء التجميل والجلدية لجميع أنواع البشرة.' },
              { icon:<Sparkles size={20}/>, t:'Vegan',         d:'لا مكونات حيوانية ولا اختبارات على الحيوانات — أخلاقي 100%.' },
            ].map((f,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'2rem 1.5rem', transition:'all 0.3s' }}
                onMouseEnter={e => { const el=e.currentTarget as HTMLDivElement; el.style.background='rgba(193,123,142,0.08)'; el.style.borderColor='rgba(193,123,142,0.25)'; }}
                onMouseLeave={e => { const el=e.currentTarget as HTMLDivElement; el.style.background='rgba(255,255,255,0.04)'; el.style.borderColor='rgba(255,255,255,0.08)'; }}>
                <div style={{ width:44, height:44, borderRadius:12, background: ROL, display:'flex', alignItems:'center', justifyContent:'center', color: RO, marginBottom:'1.25rem' }}>{f.icon}</div>
                <h3 style={{ fontSize:'1.05rem', fontWeight:600, color:'#fff', marginBottom:'0.625rem', fontFamily:"'Cormorant Garamond',serif" }}>{f.t}</h3>
                <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.42)', lineHeight:1.85, fontWeight:300 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════
   DETAILS
══════════════════════════════════════════ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  return (
    <div dir="rtl" style={{ background: BG, paddingBottom:'4rem' }}>
      <div className="details-inner" style={{ maxWidth:1320, margin:'0 auto' }}>
        {/* Gallery */}
        <div className="gallery-container">
          <div style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden', borderRadius:20, background: CR, border:`1px solid ${BD}` }}>
            {allImages[sel]
              ? <img src={allImages[sel]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Flower2 size={52} color={BD} /></div>}
            {discount > 0 && <div style={{ position:'absolute', top:14, right:14, background:`linear-gradient(135deg,${RO},${ROD})`, color:'#fff', padding:'5px 13px', fontSize:11, fontWeight:700, borderRadius:20 }}>{discount}% خصم</div>}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setSel(p => p===0 ? allImages.length-1 : p-1)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:34, height:34, background:'rgba(255,255,255,0.9)', border:`1px solid ${BD}`, borderRadius:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: INK }}><ChevronRight size={14}/></button>
                <button onClick={() => setSel(p => p===allImages.length-1 ? 0 : p+1)} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:34, height:34, background:'rgba(255,255,255,0.9)', border:`1px solid ${BD}`, borderRadius:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: INK }}><ChevronLeft size={14}/></button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="thumb-row">
              {allImages.map((img:string, idx:number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink:0, width:58, height:74, border:`2px solid ${sel===idx ? RO : BD}`, borderRadius:10, overflow:'hidden', cursor:'pointer', padding:0, background:'none', opacity: sel===idx ? 1 : 0.55, transition:'all 0.15s' }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="info-panel">
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, background: ROL, border:`1px solid ${ROB}`, borderRadius:50, padding:'5px 14px', marginBottom:'1.25rem' }}>
              <Leaf size={11} color={RO}/><span style={{ fontSize:'0.58rem', fontWeight:700, color: ROD, letterSpacing:'0.12em', textTransform:'uppercase' }}>عضوي طبيعي</span>
            </div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:600, color: INK, marginBottom:'0.5rem', lineHeight:1.15, letterSpacing:'-0.02em' }}>{product.name}</h1>
            <div style={{ display:'flex', gap:2, marginBottom:'1.5rem' }}>{[...Array(5)].map((_,i) => <Star key={i} size={13} style={{ fill:i<4?GD:'none', color:GD }} />)}</div>

            <div style={{ padding:'1.25rem 1.5rem', background: CR, borderRadius:14, border:`1px solid ${BD}`, marginBottom:'1.75rem' }}>
              <p style={{ fontSize:'0.58rem', fontWeight:700, color: SUB, marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>السعر</p>
              <div style={{ display:'flex', alignItems:'baseline', gap:'0.4rem' }}>
                <span className="price-mono" style={{ fontSize:'2.5rem', fontWeight:700, color: INK, fontFamily:"'Cormorant Garamond',serif" }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize:'1rem', color: SUB, fontWeight:300 }}>دج</span>
              </div>
            </div>

            {product.offers?.length > 0 && (
              <div style={{ marginBottom:'1.25rem' }}>
                {product.offers.map((o:any) => (
                  <label key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.9rem 1rem', border:`1.5px solid ${selectedOffer===o.id ? RO : BD}`, borderRadius:12, cursor:'pointer', marginBottom:'0.5rem', background: selectedOffer===o.id ? ROL : CARD, transition:'all 0.18s' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                      <div style={{ width:16, height:16, borderRadius:'50%', border:`1.5px solid ${selectedOffer===o.id ? RO : BD}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {selectedOffer===o.id && <div style={{ width:7, height:7, borderRadius:'50%', background: RO }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer===o.id} onChange={() => setSelectedOffer(o.id)} style={{ display:'none' }} />
                      <div>
                        <p style={{ fontWeight:500, color: INK, fontSize:'0.875rem' }}>{o.name}</p>
                        <p style={{ fontSize:'0.68rem', color: SUB }}>الكمية: {o.quantity}</p>
                      </div>
                    </div>
                    <span className="price-mono" style={{ fontWeight:700, color: INK }}>{o.price.toLocaleString()} دج</span>
                  </label>
                ))}
              </div>
            )}

            {allAttrs.map((attr:any) => (
              <div key={attr.id} style={{ marginBottom:'1.125rem' }}>
                <p style={{ fontSize:'0.62rem', fontWeight:700, color: SUB, marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>{attr.name}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {attr.variants.map((v:any) => {
                    const isSel = selectedVariants[attr.name] === v.value;
                    return (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={
                        attr.displayMode==='color' ? { width:26, height:26, borderRadius:'50%', background:v.value, border:`2px solid ${BD}`, cursor:'pointer', outline:`2.5px solid ${isSel ? RO : 'transparent'}`, outlineOffset:2, transition:'outline 0.15s' }
                        : attr.displayMode==='image' ? { width:46, height:46, backgroundImage:`url(${v.value})`, backgroundSize:'cover', backgroundPosition:'center', border:`2px solid ${isSel ? RO : BD}`, borderRadius:8, cursor:'pointer', transition:'all 0.15s' }
                        : { padding:'0.4rem 0.925rem', border:`1.5px solid ${isSel ? RO : BD}`, borderRadius:50, fontSize:'0.8rem', fontWeight:500, background: isSel ? ROL : CARD, color: isSel ? ROD : SUB, cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit' }
                      }>{attr.displayMode!=='color' && attr.displayMode!=='image' && v.name}</button>
                    );
                  })}
                </div>
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {product.desc && (
              <div style={{ marginTop:'1.5rem', paddingTop:'1.25rem', borderTop:`1px solid ${BD}` }}>
                <div style={{ fontSize:'0.9rem', lineHeight:1.95, color: SUB, fontWeight:300 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PRODUCT FORM
══════════════════════════════════════════ */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div>
    {label && <p style={{ fontSize:'0.62rem', fontWeight:700, color: SUB, marginBottom:'0.4rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize:'0.72rem', color:'#DC2626', marginTop:'0.25rem', display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={11}/>{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas]   = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC]       = useState(false);
  const [fd, setFd] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [sub, setSub]         = useState(false);
  const [isOrderNow, setON]   = useState(false);
  const [isAdded, setAdded]   = useState(false);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId: id })); } }, []);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o:any) => o.id === selectedOffer);
    if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v:any) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  const getLiv = useCallback((): number => { if (!selW) return 0; return fd.typeLivraison==='home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
  const fp    = getFP();
  const total = () => fp * fd.quantity + +getLiv();
  const validate = () => {
    const e: Record<string,string> = {};
    if (!fd.customerName.trim()) e.customerName='مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone='رقم غير صالح';
    if (!fd.customerWelaya) e.customerWelaya='مطلوب';
    if (!fd.customerCommune) e.customerCommune='مطلوب';
    return e;
  };
  const getVarId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v:any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const addToCart = () => {
    setAdded(true);
    const cart = JSON.parse(localStorage.getItem(domain)||'[]');
    cart.push({ ...fd, product, variantDetailId: getVarId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform||'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now() });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate(); if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSub(true);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform||'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`${window.location.origin}/successfully?productId=${product.id}`);
    } catch {} finally { setSub(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  return (
    <div style={{ marginTop:'1.25rem', paddingTop:'1rem', borderTop:`1px solid ${BD}` }}>
        {product.store.cart && (
        <div className="cart-add-btns" style={{ marginBottom:'1.25rem' }}>
          <button onClick={addToCart} disabled={isAdded} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'0.85rem 1rem', border:`1.5px solid ${isAdded ? '#22C55E' : BD}`, borderRadius:12, fontSize:'0.875rem', fontWeight:500, cursor:'pointer', background: isAdded ? 'rgba(34,197,94,0.06)' : CARD, color: isAdded ? '#22C55E' : SUB, transition:'all 0.2s', fontFamily:'inherit' }}>
            {isAdded ? <><CheckCircle2 size={14} className="anim-check"/>تمت الإضافة</> : <><ShoppingCart size={14}/>أضف للسلة</>}
          </button>
          <button onClick={() => setON(true)} style={{ flex:1, ...S.btnPrimary, width:'auto', background:`linear-gradient(135deg,${RO},${ROD})`, borderRadius:12 }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity='0.88')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity='1')}>
            اطلبي الآن
          </button>
        </div>
      )}
      {(isOrderNow || !product.store.cart) && (
        <div className="anim-fade-up">
          {product.store.cart && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <p style={{ fontWeight:700, fontSize:'0.62rem', color: SUB, textTransform:'uppercase', letterSpacing:'0.1em' }}>بيانات التوصيل</p>
              <button onClick={() => setON(false)} style={{ fontSize:'0.78rem', color: SUB, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>إلغاء ✕</button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.customerName} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" style={inp(!!errors.customerName)} /></FR>
              <FR error={errors.customerPhone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0XXXXXXXXX" style={inp(!!errors.customerPhone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{ position:'relative' }}>
                  <ChevronDown size={12} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color: SUB, pointerEvents:'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune:'' })} style={{ ...inp(!!errors.customerWelaya), paddingRight:32, fontFamily:'inherit' }}>
                    <option value="">اختري</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{ position:'relative' }}>
                  <ChevronDown size={12} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color: SUB, pointerEvents:'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingRight:32, opacity:(!fd.customerWelaya||loadingC)?0.5:1, fontFamily:'inherit' }}>
                    <option value="">{loadingC?'...':'اختري'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ marginBottom:'0.875rem' }}>
              <p style={{ fontSize:'0.62rem', fontWeight:700, color: SUB, marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>التوصيل</p>
              <div className="delivery-grid">
                {(['home','office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding:'0.8rem', border:`1.5px solid ${fd.typeLivraison===t ? RO : BD}`, borderRadius:12, textAlign:'center', cursor:'pointer', background: fd.typeLivraison===t ? ROL : CARD, transition:'all 0.18s', fontFamily:'inherit' }}>
                    <p style={{ fontWeight:600, fontSize:'0.78rem', marginBottom:3, color: fd.typeLivraison===t ? ROD : SUB }}>{t==='home'?'للبيت':'للمكتب'}</p>
                    {selW && <p className="price-mono" style={{ fontSize:'1rem', fontWeight:700, color: fd.typeLivraison===t ? ROD : SUB }}>{(t==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:'0.875rem' }}>
              <p style={{ fontSize:'0.62rem', fontWeight:700, color: SUB, marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>الكمية</p>
              <div style={{ display:'inline-flex', alignItems:'center', border:`1px solid ${BD}`, borderRadius:12, overflow:'hidden', background: CR }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1,p.quantity-1) }))} style={{ width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', color: SUB, borderLeft:`1px solid ${BD}` }}><Minus size={13}/></button>
                <span style={{ width:44, textAlign:'center', fontWeight:700, fontSize:'0.95rem', color: INK }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity+1 }))} style={{ width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', color: RO, borderRight:`1px solid ${BD}` }}><Plus size={13}/></button>
              </div>
            </div>
            <div style={{ background: CR, borderRadius:14, border:`1px solid ${BD}`, padding:'1.125rem 1.25rem', marginBottom:'1rem' }}>
              {[
                { l:'المنتج', v: product.name.slice(0,30)+(product.name.length>30?'...':'') },
                { l:'التوصيل', v: selW?`${getLiv().toLocaleString()} دج`:'—' },
              ].map(r => (
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', paddingBottom:'0.5rem', marginBottom:'0.5rem', borderBottom:`1px solid ${BD}` }}>
                  <span style={{ fontSize:'0.78rem', color: SUB, fontWeight:300 }}>{r.l}</span>
                  <span style={{ fontSize:'0.875rem', fontWeight:500, color: INK }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontWeight:700, fontSize:'0.875rem', color: INK }}>المجموع</span>
                <span className="price-mono" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'2rem', fontWeight:700, color: INK }}>{total().toLocaleString()} <span style={{ fontSize:'0.75rem', fontWeight:300 }}>دج</span></span>
              </div>
            </div>
            <button type="submit" disabled={sub} style={{ ...S.btnPrimary, opacity: sub?0.7:1, background:`linear-gradient(135deg,${RO},${ROD})`, boxShadow:`0 8px 24px rgba(193,123,142,0.35)` }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity='0.88')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity='1')}>
              {sub ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>جاري المعالجة...</> : 'تأكيد الطلب'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   CART
══════════════════════════════════════════ */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems]       = useState<any[]>([]);
  const [wilayas, setWilayas]   = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [fd, setFd] = useState({ customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', typeLivraison:'home' as 'home'|'office' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => { setItems(JSON.parse(localStorage.getItem(domain)||'[]')); if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [domain, store]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW       = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLiv     = () => { if (!selW) return 0; return fd.typeLivraison==='home' ? selW.livraisonHome : selW.livraisonOfice; };
  const cartTotal  = items.reduce((a,i) => a + (i.finalPrice * i.quantity), 0);
  const finalTotal = cartTotal + +getLiv();
  const update     = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string,string> = {};
    if (!fd.customerName.trim()) er.name='مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone='رقم غير صالح';
    if (!fd.customerWelaya) er.w='مطلوب';
    if (!fd.customerCommune) er.c='مطلوب';
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform||'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId||'', priceLoss: selW?.livraisonReturn??0 })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch {} finally { setSubmitting(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  if (success) return (
    <div dir="rtl" style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', background: BG }}>
      <div style={{ textAlign:'center', background: CARD, padding:'4rem 2.5rem', borderRadius:24, border:`1px solid ${BD}`, maxWidth:440, width:'100%', boxShadow:'0 24px 64px rgba(193,123,142,0.1)' }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:`linear-gradient(135deg,${RO},${ROD})`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.75rem', boxShadow:`0 8px 24px rgba(193,123,142,0.4)` }}>
          <CheckCircle2 size={28} color="#fff" />
        </div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'2rem', fontWeight:600, color: INK, marginBottom:'0.625rem', letterSpacing:'-0.02em' }}>تم استلام طلبك!</h2>
        <p style={{ color: SUB, lineHeight:1.9, marginBottom:'2.25rem', fontSize:'0.9rem', fontWeight:300 }}>سنتواصل معك قريباً لتأكيد الطلب.</p>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, background:`linear-gradient(135deg,${RO},${ROD})`, color:'#fff', padding:'0.9rem 2.25rem', borderRadius:12, fontWeight:600, fontSize:'0.875rem' }}>
          العودة للمتجر
        </Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir="rtl" style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', background: BG }}>
      <div style={{ textAlign:'center', padding:'4.5rem 2.5rem', border:`1.5px dashed ${BD}`, borderRadius:24, maxWidth:400, width:'100%', background: CARD }}>
        <ShoppingBag size={44} style={{ color: BD, display:'block', margin:'0 auto 1.5rem' }} />
        <p style={{ color: SUB, fontSize:'0.9rem', marginBottom:'2.25rem', fontWeight:300 }}>سلتكِ فارغة</p>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, background:`linear-gradient(135deg,${RO},${ROD})`, color:'#fff', padding:'0.85rem 2rem', borderRadius:12, fontWeight:600, fontSize:'0.875rem' }}>
          اكتشفي المنتجات
        </Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ padding:'2.5rem 1.5rem', maxWidth:1320, margin:'0 auto', minHeight:'100vh', background: BG }}>
      <div style={{ marginBottom:'2.25rem', paddingBottom:'1.25rem', borderBottom:`1px solid ${BD}` }}>
        <p style={{ fontSize:'0.58rem', fontWeight:700, color: RO, textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:8 }}>Pure Organics</p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:600, color: INK, letterSpacing:'-0.02em' }}>السلة</h1>
        <p style={{ fontSize:'0.72rem', color: SUB, marginTop:4, fontWeight:300 }}>{items.length} منتجات</p>
      </div>
      <div className="cart-inner">
        {/* Items */}
        <div style={{ background: CARD, borderRadius:18, border:`1px solid ${BD}`, overflow:'hidden' }}>
          {items.map((item,i) => (
            <div key={i} style={{ display:'flex', gap:'1rem', padding:'1.125rem', borderBottom:`1px solid ${BD}` }}>
              <img src={item.product?.imagesProduct?.[0]?.imageUrl||item.product?.productImage} style={{ width:76, height:96, objectFit:'cover', flexShrink:0, borderRadius:12, border:`1px solid ${BD}` }} alt="" />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'0.55rem', color: RO, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 }}>{item.product?.store?.name}</p>
                <h4 style={{ fontWeight:500, color: INK, marginBottom:'0.4rem', fontSize:'0.875rem', lineHeight:1.45 }}>{item.product?.name}</h4>
                <p className="price-mono" style={{ fontSize:'1.1rem', fontWeight:700, color: INK }}>{item.finalPrice?.toLocaleString()} دج</p>
              </div>
              <button onClick={() => update(items.filter((_,idx) => idx!==i))} style={{ color: BD, padding:'0.25rem', background:'none', border:'none', cursor:'pointer', alignSelf:'flex-start', transition:'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color='#DC2626')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color=BD)}>
                <Trash2 size={14}/>
              </button>
            </div>
          ))}
          <div style={{ padding:'1.125rem 1.25rem', background: CR, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:500, color: SUB, fontSize:'0.8rem' }}>المجموع الفرعي</span>
            <span className="price-mono" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.5rem', fontWeight:700, color: INK }}>{cartTotal.toLocaleString()} دج</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: CARD, borderRadius:18, border:`1px solid ${BD}`, padding:'2rem' }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:'1.25rem', color: INK, marginBottom:'1.75rem', letterSpacing:'-0.01em' }}>معلومات التوصيل</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={inp(!!errors.name)} /></FR>
              <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={inp(!!errors.phone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.w} label="الولاية">
                <div style={{ position:'relative' }}>
                  <ChevronDown size={12} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color: SUB, pointerEvents:'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune:'' })} style={{ ...inp(!!errors.w), paddingRight:30, fontFamily:'inherit' }}>
                    <option value="">اختري</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label="البلدية">
                <div style={{ position:'relative' }}>
                  <ChevronDown size={12} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color: SUB, pointerEvents:'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC||!fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingRight:30, opacity:(!fd.customerWelaya||loadingC)?0.5:1, fontFamily:'inherit' }}>
                    <option value="">{loadingC?'...':'اختري'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ margin:'0.875rem 0' }}>
              <p style={{ fontSize:'0.62rem', fontWeight:700, color: SUB, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>نوع التوصيل</p>
              <div className="delivery-grid">
                {(['home','office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding:'0.85rem', border:`1.5px solid ${fd.typeLivraison===t ? RO : BD}`, borderRadius:12, textAlign:'center', cursor:'pointer', background: fd.typeLivraison===t ? ROL : CARD, fontFamily:'inherit', transition:'all 0.18s' }}>
                    <p style={{ fontWeight:600, fontSize:'0.78rem', color: fd.typeLivraison===t ? ROD : SUB, marginBottom:3 }}>{t==='home'?'للبيت':'للمكتب'}</p>
                    {selW && <p style={{ fontWeight:700, fontSize:'0.95rem', color: fd.typeLivraison===t ? ROD : SUB }}>{(t==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: CR, borderRadius:14, border:`1px solid ${BD}`, padding:'1.125rem', margin:'1rem 0' }}>
              {[{ l:'المجموع الفرعي', v:`${cartTotal.toLocaleString()} دج` }, { l:'التوصيل', v: getLiv()?`${getLiv().toLocaleString()} دج`:'—' }].map(r => (
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', paddingBottom:'0.5rem', marginBottom:'0.5rem', borderBottom:`1px solid ${BD}` }}>
                  <span style={{ fontSize:'0.78rem', color: SUB, fontWeight:300 }}>{r.l}</span>
                  <span style={{ fontWeight:600, color: INK }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontWeight:700, color: INK }}>الإجمالي</span>
                <span className="price-mono" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'2.25rem', fontWeight:700, color: INK }}>{finalTotal.toLocaleString()} <span style={{ fontSize:'0.75rem', fontWeight:300 }}>دج</span></span>
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting?0.7:1, background:`linear-gradient(135deg,${RO},${ROD})`, boxShadow:`0 8px 24px rgba(193,123,142,0.35)`, borderRadius:12 }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity='0.88')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity='1')}>
              {submitting ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>جاري المعالجة...</> : 'تأكيد الطلب'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   STATIC PAGES
══════════════════════════════════════════ */
const Shell = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div dir="rtl" style={{ minHeight:'100vh', background: BG }}>
    <div style={{ background:`linear-gradient(135deg,${CR} 0%,rgba(193,123,142,0.08) 100%)`, borderBottom:`1px solid ${BD}`, paddingTop:72, paddingBottom:52, paddingLeft:24, paddingRight:24 }}>
      <div style={{ maxWidth:860, margin:'0 auto' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
          <Flower2 size={12} color={RO} />
          <span style={{ fontSize:'0.58rem', fontWeight:700, color: RO, letterSpacing:'0.18em', textTransform:'uppercase' }}>Pure Organics</span>
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2rem,5vw,3.25rem)', fontWeight:600, color: INK, letterSpacing:'-0.03em' }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth:860, margin:'0 auto', padding:'3rem 1.5rem 6rem' }}>{children}</div>
  </div>
);

const IB = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding:'1.25rem 0', borderBottom:`1px solid ${BD}`, display:'flex', gap:'1rem', alignItems:'flex-start' }}>
    <div style={{ width:26, height:26, borderRadius:'50%', background: ROL, border:`1px solid ${ROB}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}><Leaf size={12} color={RO}/></div>
    <div>
      <h3 style={{ fontWeight:600, fontSize:'0.95rem', color: INK, marginBottom:'0.375rem' }}>{title}</h3>
      <p style={{ fontSize:'0.875rem', lineHeight:1.9, color: SUB, fontWeight:300 }}>{body}</p>
    </div>
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية">
      <div style={{ background: CARD, padding:'1.5rem 2rem', borderRadius:18, border:`1px solid ${BD}` }}>
        <IB title="البيانات التي نجمعها" body="نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم، رقم الهاتف، وعنوان التوصيل." />
        <IB title="حماية البيانات" body="تُخزن جميع البيانات بشكل مشفر. نستخدم بروتوكولات حماية معتمدة لضمان أمان معلوماتكم." />
        <IB title="مشاركة المعلومات" body="لا نقوم ببيع أو مشاركة بياناتكم مع أي جهات خارجية باستثناء شركاء التوصيل." />
      </div>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الاستخدام">
      <div style={{ background: CARD, padding:'1.5rem 2rem', borderRadius:18, border:`1px solid ${BD}` }}>
        <IB title="الحساب والمسؤولية" body="المستخدمة مسؤولة عن دقة البيانات المدخلة والحفاظ على سرية حسابها." />
        <IB title="الطلبات والمدفوعات" body="يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الأسعار المعلنة هي الأسعار النهائية." />
        <IB title="القانون الحاكم" body="تخضع كافة التعاملات للقوانين المعمول بها في جمهورية الجزائر الديمقراطية الشعبية." />
      </div>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات الارتباط">
      <div style={{ background: CARD, padding:'1.5rem 2rem', borderRadius:18, border:`1px solid ${BD}` }}>
        <IB title="الملفات الأساسية" body="نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل سلة المشتريات وأمان جلسة الدخول." />
        <IB title="تحسين التجربة" body="نستخدم بعض الملفات لفهم كيفية استخدام الموقع وتطوير تجربة التصفح." />
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const [form, setForm]   = useState({ name:'', email:'', phone:'', message:'' });
  const [sent, setSent]   = useState(false);
  const [loading, setL]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setL(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
    catch { showError('حدث خطأ في الإرسال'); } finally { setL(false); }
  };

  return (
    <div dir="rtl" style={{ background: BG, minHeight:'100vh' }}>
      <div style={{ background:`linear-gradient(135deg,${CR} 0%,rgba(193,123,142,0.08) 100%)`, borderBottom:`1px solid ${BD}`, paddingTop:72, paddingBottom:52, paddingLeft:24, paddingRight:24 }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
            <Flower2 size={12} color={RO}/><span style={{ fontSize:'0.58rem', fontWeight:700, color: RO, letterSpacing:'0.18em', textTransform:'uppercase' }}>Pure Organics</span>
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2rem,5vw,3.25rem)', fontWeight:600, color: INK, letterSpacing:'-0.03em' }}>تواصلي معنا</h1>
        </div>
      </div>
      <div className="contact-inner" style={{ maxWidth:1100, margin:'0 auto', padding:'3rem 1.5rem 6rem' }}>
        <div>
          <div style={{ background: CARD, borderRadius:18, border:`1px solid ${BD}`, padding:'1.5rem', marginBottom:'1rem' }}>
            {[
              { icon:<Phone size={13}/>, l:'الهاتف', val: store?.contact?.phone||'غير متوفر' },
              { icon:<MapPin size={13}/>, l:'الموقع', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ')||'الجزائر' },
            ].map((r,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.875rem', marginBottom: i===0 ? '1.25rem' : 0 }}>
                <div style={{ width:36, height:36, borderRadius:12, background: ROL, border:`1px solid ${ROB}`, display:'flex', alignItems:'center', justifyContent:'center', color: RO, flexShrink:0 }}>{r.icon}</div>
                <div>
                  <p style={{ fontSize:'0.56rem', color: SUB, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:2 }}>{r.l}</p>
                  <p style={{ fontWeight:500, color: INK, fontSize:'0.875rem' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: ROL, border:`1px solid ${ROB}`, borderRadius:12, padding:'0.875rem 1rem', display:'flex', alignItems:'center', gap:'0.625rem' }}>
            <Flower2 size={12} color={RO}/>
            <span style={{ fontSize:'0.75rem', fontWeight:500, color: ROD }}>نرد في غضون ساعة واحدة</span>
          </div>
        </div>
        <div style={{ background: CARD, borderRadius:20, border:`1px solid ${BD}`, padding:'2.5rem', boxShadow:'0 8px 32px rgba(193,123,142,0.06)' }}>
          {sent ? (
            <div style={{ textAlign:'center', padding:'3.5rem 1rem' }}>
              <div style={{ width:60, height:60, borderRadius:'50%', background:`linear-gradient(135deg,${RO},${ROD})`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.75rem', boxShadow:`0 8px 24px rgba(193,123,142,0.4)` }}><CheckCircle2 size={28} color="#fff"/></div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.75rem', fontWeight:600, color: INK, marginBottom:'0.5rem', letterSpacing:'-0.02em' }}>تم الإرسال!</h2>
              <p style={{ color: SUB, lineHeight:1.9, marginBottom:'2.25rem', fontSize:'0.9rem', fontWeight:300 }}>سنرد عليكِ في أقرب وقت.</p>
              <button onClick={() => setSent(false)} style={{ padding:'0.75rem 2.25rem', borderRadius:12, border:`1.5px solid ${RO}`, background: ROL, color: ROD, fontWeight:600, cursor:'pointer', fontSize:'0.875rem', fontFamily:'inherit' }}>إرسال رسالة أخرى</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom:'0.875rem' }}>
                <FR label="الاسم"><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={S.input} /></FR>
                <FR label="الهاتف"><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={S.input} /></FR>
              </div>
              <div style={{ marginBottom:'0.875rem' }}>
                <FR label="البريد الإلكتروني"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={S.input} /></FR>
              </div>
              <div style={{ marginBottom:'1.5rem' }}>
                <FR label="الرسالة"><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...S.input, resize:'none' }} /></FR>
              </div>
              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading?0.7:1, background:`linear-gradient(135deg,${RO},${ROD})`, boxShadow:`0 8px 24px rgba(193,123,142,0.35)`, borderRadius:12 }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity='0.88')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity='1')}>
                {loading ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>جاري الإرسال...</> : <>إرسال الرسالة <ArrowLeft size={15}/></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage||page||'').toLowerCase();
  return (
    <>
      {p==='privacy'  && <Privacy />}
      {p==='terms'    && <Terms />}
      {p==='cookies'  && <Cookies />}
      {p==='contact'  && <Contact store={store} />}
    </>
  );
}
