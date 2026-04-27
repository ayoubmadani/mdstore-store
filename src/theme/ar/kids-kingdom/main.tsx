'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ShoppingBag, Truck, ShieldCheck,
  ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, Check, X, Phone, MapPin,
  CheckCircle2, ArrowRight, Zap,
  Menu, Search, ShoppingCart, Minus, Plus,
  Trash2, Loader2, BadgeCheck, Lock, Package,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ═══════════════════════════════════════════════════════════
   KIDS THEME CSS — Pure CSS media queries, zero Tailwind responsive
═══════════════════════════════════════════════════════════ */
const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --coral:    #FF6B6B;
    --coral-dk: #E85555;
    --sun:      #FFD93D;
    --sun-dk:   #F4B942;
    --sky:      #4ECDC4;
    --sky-dk:   #38B2AA;
    --grape:    #A855F7;
    --mint:     #6EE7B7;
    --mint-dk:  #34D399;
    --orange:   #FF9A3C;
    --pink:     #F472B6;
    --blue:     #60A5FA;
    --bg:       #FFFBF0;
    --bg-card:  #FFFFFF;
    --text:     #2D2D2D;
    --text-mid: #666;
    --text-soft:#999;
    --border:   #FFE4B5;
    --shadow:   rgba(255,107,107,0.18);
  }

  body { font-family: 'Nunito', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
  a { text-decoration: none; color: inherit; }
  .font-display { font-family: 'Fredoka One', cursive; }

  ::-webkit-scrollbar { width: 7px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--coral), var(--grape)); border-radius: 99px; }

  /* ── Keyframes ── */
  @keyframes float-up   { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
  @keyframes bounce-in  { 0%{transform:scale(0) rotate(-10deg);opacity:0} 60%{transform:scale(1.15) rotate(3deg);opacity:1} 100%{transform:scale(1) rotate(0)} }
  @keyframes pop-in     { from{opacity:0;transform:scale(0.85) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes wiggle     { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
  @keyframes spin-slow  { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes rainbow-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes ticker-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes bounce-loop { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-18px)} 60%{transform:translateY(-10px)} }
  @keyframes star-twinkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
  @keyframes cartPop    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
  @keyframes checkIn    { from{transform:scale(0) rotate(-45deg);opacity:0} to{transform:scale(1) rotate(0);opacity:1} }
  @keyframes confetti   { 0%{transform:translateY(-20px) rotate(0) scale(0.8);opacity:0} 10%{opacity:1} 100%{transform:translateY(110vh) rotate(720deg) scale(1.2);opacity:0} }

  .anim-pop-in   { animation: pop-in 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-bounce-in{ animation: bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
  .anim-cart-pop { animation: cartPop 0.4s ease; }
  .anim-check-in { animation: checkIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both; }

  /* ── Patterns ── */
  .polka-dots {
    background-image:
      radial-gradient(circle, rgba(255,107,107,0.12) 2px, transparent 2px),
      radial-gradient(circle, rgba(255,217,61,0.1) 2px, transparent 2px);
    background-size: 30px 30px, 50px 50px;
    background-position: 0 0, 15px 15px;
  }
  .stars-bg {
    background-image:
      radial-gradient(circle, var(--sun) 1.5px, transparent 1.5px),
      radial-gradient(circle, var(--pink) 1.5px, transparent 1.5px),
      radial-gradient(circle, var(--sky) 1.5px, transparent 1.5px);
    background-size: 40px 40px, 70px 70px, 55px 55px;
  }

  /* ── Ticker / marquee ── */
  .ticker-wrap  { overflow: hidden; white-space: nowrap; }
  .ticker-inner { display: inline-block; animation: ticker-scroll 20s linear infinite; }

  /* ── Buttons ── */
  .btn-bouncy { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease; }
  .btn-bouncy:hover  { transform: translateY(-3px) scale(1.04); }
  .btn-bouncy:active { transform: translateY(1px)  scale(0.97); }

  /* ── Card ── */
  .product-card { transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s; }
  .product-card:hover { transform: translateY(-8px) rotate(1.5deg) scale(1.02); box-shadow: 0 20px 50px var(--shadow); }
  .product-card:nth-child(even):hover { transform: translateY(-8px) rotate(-1.5deg) scale(1.02); }

  /* ── Rainbow text ── */
  .rainbow-text {
    background: linear-gradient(90deg, var(--coral), var(--orange), var(--sun), var(--mint-dk), var(--sky), var(--grape), var(--pink));
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rainbow-shift 4s ease infinite;
  }

  /* ── Responsive: Navbar ── */
  .nav-desktop-links { display: none; align-items: center; gap: 1.25rem; }
  .nav-desktop-search { display: none; }
  .nav-mobile-btns { display: flex; align-items: center; gap: 0.625rem; }
  @media (min-width: 1024px) {
    .nav-desktop-links  { display: flex; }
    .nav-desktop-search { display: block; }
    .nav-mobile-btns    { display: none; }
  }

  /* ── Responsive: Products grid ── */
  .products-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (min-width: 768px)  { .products-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); gap: 1.25rem; } }

  /* ── Responsive: Features ── */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.875rem;
  }
  @media (min-width: 1024px) { .features-grid { grid-template-columns: repeat(4, 1fr); } }

  /* ── Responsive: Details layout ── */
  .details-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 768px) { .details-layout { grid-template-columns: 1fr 1fr; gap: 3rem; } }

  /* ── Responsive: Form rows ── */
  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }
  @media (min-width: 540px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

  /* ── Responsive: Cart layout ── */
  .cart-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) { .cart-layout { grid-template-columns: 1fr 1fr; gap: 3rem; } }

  /* ── Responsive: Footer ── */
  .footer-cols {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  @media (min-width: 768px) { .footer-cols { grid-template-columns: 1.6fr 1fr 1fr; } }

  /* ── Responsive: Hero actions ── */
  .hero-actions { display: flex; flex-direction: column; gap: 0.875rem; align-items: flex-start; }
  @media (min-width: 540px) { .hero-actions { flex-direction: row; align-items: center; } }

  /* ── Cart add buttons ── */
  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 540px) { .cart-add-btns { flex-direction: row; } }

  /* ── Delivery grid ── */
  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

  /* ── Thumb row ── */
  .thumb-row { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 4px; margin-top: 0.75rem; }

  /* ── Pagination ── */
  .pagination { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 3rem; }

  /* ── Contact layout ── */
  .contact-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .contact-layout { grid-template-columns: 1fr 1.5fr; } }

  /* ── Cart badge ── */
  .cart-badge {
    position: absolute; top: -5px; right: -5px;
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--coral); color: #fff;
    font-size: 10px; font-weight: 900;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 8px rgba(255,107,107,0.6);
    font-family: 'Nunito', sans-serif;
  }
`;

/* ─── CONFETTI ─── */
function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i, left: `${(i * 5.7) % 100}%`, delay: `${(i * 0.7) % 8}s`,
    dur: `${6 + (i * 0.9) % 7}s`, size: `${8 + (i * 1.2) % 11}px`,
    color: ['#FFD93D', '#FF6B6B', '#4ECDC4', '#A855F7', '#F472B6', '#FF9A3C', '#60A5FA'][i % 7],
    shape: i % 3,
  })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.left, top: -20,
          width: p.size, height: p.size, backgroundColor: p.color,
          borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? 3 : 0,
          transform: p.shape === 2 ? 'rotate(45deg)' : 'none',
          animation: `confetti ${p.dur} ${p.delay} ease-in infinite`, opacity: 0,
        }} />
      ))}
    </div>
  );
}

/* ─── STAR DECO ─── */
const Star5 = ({ color = '#FFD93D', size = 20, delay = '0s', style = {} as any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
    style={{ animation: `star-twinkle 2s ${delay} ease-in-out infinite`, ...style }}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

/* ─── WAVY DIVIDER ─── */
const WavyDivider = ({ top = '#fff', bottom = '#FFFBF0' }) => (
  <div style={{ position: 'relative', height: 60, overflow: 'hidden', background: bottom }}>
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }}>
      <path d="M0,30 C180,60 360,0 540,30 C720,60 900,0 1080,30 C1260,60 1380,15 1440,30 L1440,60 L0,60 Z" fill={top} />
    </svg>
  </div>
);

/* ─── TYPES ─── */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
export interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}

const variantMatches = (d: VariantDetail, sel: Record<string, string>) =>
  Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

/* ─── INPUT STYLE ─── */
const inp = (err?: boolean): React.CSSProperties => ({
  width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600,
  background: '#fff', border: `2px solid ${err ? 'var(--coral)' : 'var(--border)'}`,
  borderRadius: 14, color: 'var(--text)', outline: 'none',
  fontFamily: "'Nunito', sans-serif", transition: 'border-color 0.2s', appearance: 'none'
});

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-mid)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
    {children}
    {error && <p style={{ fontSize: '0.72rem', color: 'var(--coral)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}><AlertCircle size={11} />{error}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Nunito', sans-serif" }}>
      <style>{THEME_CSS}</style>
      {/* Ticker */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="ticker-wrap" style={{ background: 'linear-gradient(90deg,var(--coral),var(--orange),var(--sun),var(--mint-dk),var(--sky),var(--grape),var(--pink),var(--coral))', backgroundSize: '200%', animation: 'rainbow-shift 6s linear infinite', padding: '0.5rem 0' }}>
          <div className="ticker-inner">
            {Array(10).fill(null).map((_, i) => <span key={i} style={{ margin: '0 2rem', color: '#fff', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>⭐ {store.topBar.text}</span>)}
            {Array(10).fill(null).map((_, i) => <span key={`b${i}`} style={{ margin: '0 2rem', color: '#fff', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>⭐ {store.topBar.text}</span>)}
          </div>
        </div>
      )}
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // لحالة زر الإغلاق
  
  const router = useRouter();
  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { initCount(JSON.parse(localStorage.getItem(domain) || '[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { 
        const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); 
        setListSearch(data.products || []); 
      }
      catch { } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  const doSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { 
      router.push(`/?search=${encodeURIComponent(searchQuery)}`); 
      setSearchQuery(''); 
      setShowSearch(false); 
    }
  };

  const SearchDrop = () => (
    <div style={{maxHeight:"300px",overflow: 'auto', paddingTop: "25px", position: 'absolute', top: 'calc(100% + 8px)', right: 0, left: 0, background: '#fff', border: '3px solid var(--border)', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.1)', zIndex: 200,}}>
      
      {/* زر إغلاق البحث */}
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setSearchQuery('')}
        style={{ 
          position: 'absolute', top: 10, left: 10, cursor: 'pointer', 
          background: 'none', border: 'none', padding: '4px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: isHovered ? 'red' : 'var(--text-soft)', transition: 'color 0.2s' 
        }}>
        <X size={18} />
      </button>

      {loading ? (
        <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--coral)', fontWeight: 800, fontSize: '0.875rem' }}>🔍 جاري البحث...</div>
      ) : listSearch.length > 0 ? (
        <>
          {listSearch.map((p: any, i :number) => (
            <Link
              href={`/product/${p.id}`}
              key={p.id}
              onClick={() => setSearchQuery('')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '2px solid var(--bg)' }}
            >
              <img
                src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }}
                alt={p.name}
              />
              <div>
                <div className='line-clamp-1' style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--coral)', fontWeight: 900 }}>{p.price} دج</div>
              </div>
            </Link>
          ))}
          <button
            onClick={doSearch}
            type="button"
            style={{ width: '100%', padding: '0.85rem', border: 'none', background: 'var(--bg)', cursor: 'pointer', fontWeight: 800, color: 'var(--text-mid)', fontSize: '0.85rem' }}
          >
            عرض جميع النتائج 🚀
          </button>
        </>
      ) : searchQuery.length >= 2 && (
        <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.875rem', fontWeight: 600 }}>لا توجد نتائج 🧩</div>
      )}
    </div>
  );

  const initials = (store.name || 'K').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <nav dir="rtl" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,251,240,0.96)' : 'var(--bg)',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: '3px solid transparent',
      borderImage: 'linear-gradient(90deg, var(--coral), var(--sun), var(--mint), var(--sky), var(--grape)) 1',
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, var(--coral), var(--grape))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', transition: 'transform 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(8deg) scale(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}>
            {store?.design?.logoUrl
              ? <img src={store.design.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem', color: '#fff' }}>{initials}</span>}
          </div>
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.3rem', color: 'var(--text)' }}>{store?.name}</span>
        </Link>

        {/* Desktop search */}
        <div className="nav-desktop-search" style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
          <form onSubmit={doSearch}>
            <input type="text" placeholder="ابحث عن ألعابك... 🎮" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.75rem', borderRadius: 50, border: '2.5px solid var(--border)', background: '#fff', fontSize: '0.85rem', fontWeight: 700, outline: 'none', fontFamily: "'Nunito', sans-serif" }} />
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
          </form>
          {searchQuery.length >= 2 && <SearchDrop />}
        </div>

        {/* Desktop links */}
        <div className="nav-desktop-links">
          {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل' }].map(i => (
            <Link key={i.h} href={i.h} style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-mid)', padding: '0.375rem 0.75rem' }}>
              {i.l}
            </Link>
          ))}
          {/* شرط إخفاء السلة في نسخة الكمبيوتر */}
          {store?.cart && (
            <Link href="/cart" className="btn-bouncy" style={{ position: 'relative', width: 44, height: 44, borderRadius: 14, border: '2.5px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--coral)', flexShrink: 0 }}>
              <ShoppingCart size={19} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="nav-mobile-btns">
          <button onClick={() => setShowSearch(!showSearch)} style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--coral)' }}>
            <Search size={18} />
          </button>
          
          {/* شرط إخفاء السلة في نسخة الهاتف */}
          {store?.cart && (
            <Link href="/cart" style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, border: '2px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--coral)' }}>
              <ShoppingCart size={18} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          )}

          <button onClick={() => setOpen(!open)} style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--coral)' }}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile search input and Dropdown */}
      {showSearch && (
        <div style={{ padding: '0.75rem 1.25rem', background: '#fff', borderTop: '2px solid var(--border)', position: 'relative' }}>
          <form onSubmit={doSearch} style={{ position: 'relative' }}>
            <input autoFocus type="text" placeholder="ابحث هنا... 🎯" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 50, border: '2.5px solid var(--border)', outline: 'none' }} />
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--coral)' }} />
          </form>
          {searchQuery.length >= 2 && <SearchDrop />}
        </div>
      )}

      {/* Mobile menu with Conditional Cart Link */}
      <div style={{ overflow: 'hidden', maxHeight: open ? 250 : 0, transition: 'max-height 0.3s ease', background: '#fff', borderTop: open ? '2px dashed var(--border)' : 'none' }}>
        <div style={{ padding: '0.625rem 1.25rem 1rem' }}>
          <Link href="/" onClick={() => setOpen(false)} style={mobileLinkStyle}>🏠 الرئيسية <ArrowRight size={14} /></Link>
          <Link href="/contact" onClick={() => setOpen(false)} style={mobileLinkStyle}>📞 تواصل معنا <ArrowRight size={14} /></Link>
          {/* إخفاء السلة من القائمة المنسدلة في الموبايل */}
          {store?.cart && (
            <Link href="/cart" onClick={() => setOpen(false)} style={mobileLinkStyle}>🛒 السلة <ArrowRight size={14} /></Link>
          )}
        </div>
      </div>
    </nav>
  );
}

const mobileLinkStyle = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  padding: '0.75rem 0', borderBottom: '2px dashed var(--border)', 
  fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' 
};

/* ═══════════════════════════════════════════════════════════
   FOOTER — 3 أقسام
═══════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  return (
    <footer dir="rtl" style={{ background: '#1A1A2E', color: '#aaa', marginTop: 0, padding: '4rem 1.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
      <div className="stars-bg" style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none' }} />
      <div style={{ height: 4, background: 'linear-gradient(90deg, var(--coral), var(--orange), var(--sun), var(--mint-dk), var(--sky), var(--grape), var(--pink))', position: 'absolute', top: 0, left: 0, right: 0 }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="footer-cols">

          {/* قسم 1 — العلامة */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--coral), var(--grape))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: '#fff' }}>{(store?.name || 'K')[0]}</span>
              </div>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.375rem', color: '#fff' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 300 }}>
              🎁 {store?.hero?.subtitle?.substring(0, 90) || 'ألعاب وملابس أطفال بجودة عالية وأسعار مناسبة!'}
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem', fontSize: '1.5rem' }}>
              {['🚀', '⭐', '🎨', '🦄'].map((e, i) => (
                <span key={i} style={{ animation: `float-up ${2 + i * 0.3}s ${i * 0.3}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>
              ))}
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.</p>
          </div>

          {/* قسم 2 — الروابط */}
          <div>
            <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: 'var(--sun)', marginBottom: '1.25rem' }}>🗺️ روابط سريعة</h4>
            {[{ h: '/', l: 'الرئيسية', e: '🏠' }, { h: '/cart', l: 'سلة التسوق', e: '🛒' }, { h: '/contact', l: 'تواصل معنا', e: '📞' }, { h: '/Privacy', l: 'الخصوصية', e: '🔒' }, { h: '/Terms', l: 'الشروط', e: '📋' }].map((lnk, i) => (
              <a key={i} href={lnk.h} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.625rem', transition: 'all 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--sky)'; el.style.transform = 'translateX(-4px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(255,255,255,0.5)'; el.style.transform = ''; }}>
                <span>{lnk.e}</span>{lnk.l}
              </a>
            ))}
          </div>

          {/* قسم 3 — التواصل */}
          <div>
            <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: 'var(--sun)', marginBottom: '1.25rem' }}>📡 تواصل معنا</h4>
            {[
              { e: '📞', val: store?.contact?.phone },
              { e: '📍', val: store?.contact?.wilaya },
              { e: '📧', val: store?.contact?.email },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.625rem' }}>
                <span>{r.e}</span>{r.val}
              </div>
            ))}
            <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontFamily: "'Fredoka One', cursive", color: '#fff', fontSize: '0.95rem', marginBottom: '0.25rem' }}>لأن كل طفل يستحق الأفضل!</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>منتجات آمنة وممتعة ✅</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD
═══════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [hov, setHov] = useState(false);
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;

  return (
    <div className="product-card" style={{ background: '#fff', border: `3px solid ${hov ? 'var(--coral)' : 'var(--border)'}`, borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ height: 4, background: 'var(--coral)', width: '100%' }} />

      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1/1', background: 'rgba(255,107,107,0.07)', overflow: 'hidden' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s', transform: hov ? 'scale(1.1)' : 'scale(1)' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🧸</div>}
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, width: 48, height: 48, borderRadius: '50%', background: 'var(--coral)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka One', cursive", fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(255,107,107,0.5)', transform: 'rotate(12deg)' }}>
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: 2, marginBottom: '0.5rem' }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={12} style={{ fill: i < 4 ? 'var(--sun-dk)' : 'none', color: 'var(--sun-dk)' }} />)}
        </div>
        <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: 'var(--text)', marginBottom: '0.5rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.4rem', color: 'var(--coral)' }}>{price.toLocaleString()}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)' }}>{store?.currency || 'دج'}</span>
            {orig > price && <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
          <Link href={`/product/${product.slug || product.id}`} className="btn-bouncy" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '0.7rem', borderRadius: 16,
            background: hov ? 'linear-gradient(135deg, var(--coral), var(--grape))' : 'rgba(255,107,107,0.1)',
            color: hov ? '#fff' : 'var(--coral)', fontWeight: 800, fontSize: '0.85rem',
            transition: 'all 0.25s', boxShadow: hov ? '0 8px 20px rgba(255,107,107,0.35)' : 'none'
          }}>
            {viewDetails} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir="rtl">

      {/* ── HERO ── */}
      <section className="polka-dots" style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <Confetti />
        {store.hero?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08 }} />
          </div>
        )}
        {/* Floating emojis */}
        {['🚂', '🦄', '🎨', '🏆', '🎪'].map((e, i) => (
          <span key={e} style={{ position: 'absolute', top: `${15 + i * 15}%`, left: i % 2 === 0 ? `${3 + i * 2}%` : undefined, right: i % 2 !== 0 ? `${3 + i * 1.5}%` : undefined, fontSize: '2.5rem', animation: `float-up ${2.5 + i * 0.4}s ${i * 0.5}s ease-in-out infinite`, opacity: 0.6, pointerEvents: 'none' }}>{e}</span>
        ))}
        <Star5 color="var(--sun)" size={26} delay="0s" style={{ position: 'absolute', top: '12%', right: '10%' }} />
        <Star5 color="var(--coral)" size={18} delay="0.8s" style={{ position: 'absolute', top: '22%', left: '8%' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '7rem 1.5rem 4rem', position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="anim-pop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.5rem 1.25rem', borderRadius: 50, background: 'rgba(255,107,107,0.12)', border: '2px solid rgba(255,107,107,0.25)', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🎪 عالم الأطفال الساحر</span>
          </div>
          <h1 className="anim-pop-in" style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(3rem, 8vw, 6rem)', color: 'var(--text)', lineHeight: 1.1, marginBottom: '1.25rem' }}
            dangerouslySetInnerHTML={{ __html: store.hero?.title || 'كل شيء<br/>يحبه أطفالك! 🎉' }} />
          <p className="anim-pop-in" style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-mid)', maxWidth: 460, lineHeight: 1.7, marginBottom: '2.5rem' }}>
            {store.hero?.subtitle || 'ألعاب وملابس وأدوات ترفيه آمنة وممتعة لأطفالك السعداء 🌈'}
          </p>
          <div className="hero-actions">
            <a href="#products" className="btn-bouncy" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.9rem 2rem', borderRadius: 18, background: 'linear-gradient(135deg, var(--coral), var(--grape))', color: '#fff', fontWeight: 900, fontSize: '0.95rem', boxShadow: '0 8px 28px rgba(255,107,107,0.4)' }}>
              🛍️ تسوق الآن
            </a>
            <Link href="/cart" className="btn-bouncy" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.9rem 2rem', borderRadius: 18, border: '3px solid var(--sun)', background: '#fff', color: 'var(--text)', fontWeight: 900, fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(255,217,61,0.3)' }}>
              🎁 السلة
            </Link>
          </div>
        </div>
      </section>

      <WavyDivider top="var(--bg)" bottom="#fff" />

      {/* ── FEATURES ── */}
      <section style={{ background: '#fff', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="features-grid">
            {[
              { e: '🛡️', t: 'آمن للأطفال', d: 'جميع المنتجات تجتاز معايير السلامة' },
              { e: '🚀', t: 'توصيل سريع', d: 'يصل لبيتك في وقت قياسي' },
              { e: '⭐', t: 'جودة عالية', d: 'منتجات مختارة بعناية' },
              { e: '💝', t: 'ضمان الرضا', d: 'رضاك يهمنا دائماً' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.25rem', borderRadius: 20, border: '2px solid var(--border)', background: 'var(--bg)', transition: 'transform 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}>
                <span style={{ fontSize: '2.25rem', marginBottom: '0.625rem', animation: `float-up ${2 + i * 0.3}s ${i * 0.2}s ease-in-out infinite`, display: 'block' }}>{f.e}</span>
                <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{f.t}</p>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-soft)' }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WavyDivider top="white" bottom="var(--bg)" />

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (
        <section style={{ padding: '4rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', textAlign: 'center', color: 'var(--text)', marginBottom: '2rem' }}>
            🎡 تسوق حسب الفئة
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.625rem' }}>
            {cats.map((cat: any, idx: number) => {
              const colors = ['var(--sky)', 'var(--mint-dk)', 'var(--orange)', 'var(--grape)', 'var(--coral)'];
              const c = colors[idx % colors.length];
              return (
                <Link key={cat.id} href={`?category=${cat.id}`} className="btn-bouncy" style={{ padding: '0.625rem 1.5rem', borderRadius: 50, border: `2.5px solid ${c}`, color: c, background: `${c}12`, fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = c; el.style.color = '#fff'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = `${c}12`; el.style.color = c; }}>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding: '1rem 1.5rem 6rem', maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', textAlign: 'center', color: 'var(--text)', marginBottom: '0.5rem' }}>
          🎁 منتجاتنا المميزة
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2.5rem' }}>
          {products.length} منتج رائع 🌟
        </p>

        {products.length === 0 ? (
          <div className="polka-dots" style={{ padding: '5rem', textAlign: 'center', border: '3px dashed var(--border)', borderRadius: 24 }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'bounce-loop 2s ease-in-out infinite' }}>🧸</span>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.25rem', color: 'var(--text-mid)' }}>لا توجد منتجات بعد</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="اعرف المزيد" />;
            })}
          </div>
        )}

        {/* Pagination */}
        {countPage > 1 && (
          <div className="pagination" dir="rtl">
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
              style={{ width: 40, height: 40, borderRadius: 14, border: '2.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: 'var(--coral)', fontWeight: 900, opacity: page <= 1 ? 0.3 : 1 }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka One', cursive", fontSize: '1rem', border: `2.5px solid ${isA ? 'var(--coral)' : 'var(--border)'}`, background: isA ? 'var(--coral)' : '#fff', color: isA ? '#fff' : 'var(--text-mid)', boxShadow: isA ? '0 4px 16px rgba(255,107,107,0.35)' : 'none' }}>
                  {pn}
                </Link>
              );
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
              style={{ width: 40, height: 40, borderRadius: 14, border: '2.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: 'var(--coral)', fontWeight: 900, opacity: page >= countPage ? 0.3 : 1 }}>❯</Link>
          </div>
        )}
      </section>

      {/* ── BANNER ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '5rem 1.5rem', background: 'linear-gradient(135deg, #1A1A2E, #16213E, #0F3460)' }}>
        <div className="stars-bg" style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '2.5rem' }}>
            {['🚀', '⭐', '🎉', '✨'].map((e, i) => <span key={i} style={{ animation: `float-up ${2 + i * 0.3}s ${i * 0.2}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>)}
          </div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(2rem, 6vw, 4.5rem)', color: '#fff', marginBottom: '1rem' }}>الفرح لا يتوقف هنا!</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', fontWeight: 600, marginBottom: '2rem' }}>آلاف المنتجات الممتعة والآمنة في انتظار أطفالك</p>
          <a href="#products" className="btn-bouncy" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 2rem', borderRadius: 18, background: 'linear-gradient(135deg, var(--coral), var(--orange), var(--sun))', color: '#fff', fontWeight: 900, fontSize: '0.95rem', boxShadow: '0 8px 30px rgba(255,107,107,0.5)' }}>
            🎪 استكشف الآن!
          </a>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DETAILS
═══════════════════════════════════════════════════════════ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  const colors = ['var(--coral)', 'var(--sky)', 'var(--grape)', 'var(--orange)', 'var(--mint-dk)'];
  const accent = colors[parseInt(product.id || '0') % colors.length];

  return (
    <div dir="rtl" style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div className="details-layout">

          {/* Gallery */}
          <div style={{ position: 'sticky', top: 84 }}>
            <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 24, overflow: 'hidden', background: `${accent}12`, border: `3px solid ${accent}40` }}>
              {allImages[sel]
                ? <img src={allImages[sel]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🧸</div>}
              {discount > 0 && <div style={{ position: 'absolute', top: 14, right: 14, width: 52, height: 52, borderRadius: '50%', background: 'var(--coral)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka One', cursive", fontSize: '0.85rem', transform: 'rotate(12deg)', boxShadow: '0 4px 16px rgba(255,107,107,0.5)' }}>{discount}%</div>}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.9)', border: '2px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
                  <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.9)', border: '2px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
                </>
              )}
              {!inStock && !autoGen && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,251,240,0.88)', backdropFilter: 'blur(4px)' }}>
                  <div style={{ padding: '0.75rem 1.5rem', borderRadius: 16, border: '3px solid var(--coral)', color: 'var(--coral)', fontFamily: "'Fredoka One', cursive", fontSize: '1rem', background: '#fff' }}>😢 نفد المخزون</div>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="thumb-row">
                {allImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 62, height: 62, borderRadius: 14, overflow: 'hidden', border: `3px solid ${sel === idx ? accent : 'var(--border)'}`, opacity: sel === idx ? 1 : 0.55, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.2s' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ background: '#fff', borderRadius: 24, padding: '2rem', border: '3px solid var(--border)' }}>
              <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: 'var(--text)', marginBottom: '0.625rem', lineHeight: 1.2 }}>
                {product.name}
              </h1>
              <div style={{ display: 'flex', gap: 3, marginBottom: '1.25rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} style={{ fill: i < 4 ? 'var(--sun-dk)' : 'none', color: 'var(--sun-dk)' }} />)}
              </div>

              {/* Price */}
              <div style={{ background: `${accent}10`, border: `3px solid ${accent}30`, borderRadius: 18, padding: '1.125rem 1.25rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 5, background: accent, borderRadius: '0 0 0 4px' }} />
                <p style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>💰 السعر</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                  <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2.75rem', color: accent }}>{finalPrice.toLocaleString()}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-mid)', fontSize: '1rem' }}>دج</span>
                </div>
              </div>

              {/* Stock */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 1rem', borderRadius: 50, fontWeight: 800, fontSize: '0.8rem', marginBottom: '1.5rem', background: autoGen ? 'rgba(255,217,61,0.15)' : inStock ? 'rgba(110,231,183,0.15)' : 'rgba(255,107,107,0.1)', border: `2px solid ${autoGen ? 'var(--sun-dk)' : inStock ? 'var(--mint-dk)' : 'var(--coral)'}`, color: autoGen ? 'var(--sun-dk)' : inStock ? 'var(--mint-dk)' : 'var(--coral)' }}>
                {autoGen ? '♾️ مخزون غير محدود' : inStock ? '✅ متوفر' : '❌ نفد المخزون'}
              </div>

              {/* Offers */}
              {product.offers?.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 900, color: accent, textTransform: 'uppercase', marginBottom: '0.625rem' }}>🎁 اختر الباقة</p>
                  {product.offers.map((o: any) => (
                    <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: `3px solid ${selectedOffer === o.id ? accent : 'var(--border)'}`, borderRadius: 16, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? `${accent}08` : 'transparent', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2.5px solid ${selectedOffer === o.id ? accent : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedOffer === o.id ? accent : 'transparent' }}>
                          {selectedOffer === o.id && <Check size={10} color="#fff" />}
                        </div>
                        <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.name}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600 }}>الكمية: {o.quantity}</p>
                        </div>
                      </div>
                      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem', color: accent }}>{o.price.toLocaleString()} دج</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Attributes */}
              {allAttrs.map((attr: any) => (
                <div key={attr.id} style={{ marginBottom: '1.125rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 900, color: accent, textTransform: 'uppercase', marginBottom: '0.625rem' }}>🎨 {attr.name}</p>
                  {attr.displayMode === 'color' ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {attr.variants.map((v: any) => (
                        <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: 32, height: 32, borderRadius: '50%', background: v.value, border: 'none', cursor: 'pointer', outline: `3px solid ${selectedVariants[attr.name] === v.value ? accent : 'transparent'}`, outlineOffset: 3, transition: 'all 0.2s' }} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {attr.variants.map((v: any) => (
                        <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '0.4rem 1rem', border: `2.5px solid ${selectedVariants[attr.name] === v.value ? accent : 'var(--border)'}`, borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', background: selectedVariants[attr.name] === v.value ? `${accent}12` : '#fff', color: selectedVariants[attr.name] === v.value ? accent : 'var(--text-mid)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                          {v.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <ProductForm product={product} userId={product.store.userId} domain={domain}
                selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

              {product.desc && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '3px dashed var(--border)' }}>
                  <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.875rem' }}>📖 تفاصيل المنتج</p>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.8, color: 'var(--text-mid)' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT FORM
═══════════════════════════════════════════════════════════ */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId: id })); } }, []);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: any) => o.id === selectedOffer);
    if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  const getLiv = useCallback((): number => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
  const fp = getFP();
  const total = () => fp * fd.quantity + +getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!fd.customerPhone.trim()) e.customerPhone = 'الهاتف مطلوب';
    if (!fd.customerWelaya) e.customerWelaya = 'الولاية مطلوبة';
    if (!fd.customerCommune) e.customerCommune = 'البلدية مطلوبة';
    return e;
  };
  const getVarId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const addToCart = () => {
    setIsAdded(true);
    const cart = JSON.parse(localStorage.getItem(domain) || '[]');
    cart.push({ ...fd, product, variantDetailId: getVarId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now() });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate(); if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSub(true);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    } catch { } finally { setSub(false); }
  };

  return (
    <div style={{ paddingTop: '1.5rem', borderTop: '3px dashed var(--border)', marginTop: '1.5rem' }}>
      <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.15rem', color: 'var(--text)', marginBottom: '1rem' }}>📦 اطلب الآن</p>

      {product.store?.cart && (
        <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
          <button onClick={addToCart} disabled={isAdded} className={isAdded ? 'anim-cart-pop' : ''} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0.875rem', borderRadius: 16, cursor: isAdded ? 'default' : 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '0.875rem', transition: 'all 0.3s', border: isAdded ? '2.5px solid var(--mint-dk)' : '2.5px solid var(--sky)', background: isAdded ? 'rgba(110,231,183,0.12)' : '#fff', color: isAdded ? 'var(--mint-dk)' : 'var(--sky-dk)' }}>
            {isAdded ? <><CheckCircle2 size={16} className="anim-check-in" /> تمت الإضافة!</> : <><ShoppingCart size={16} /> أضف للسلة</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} className="btn-bouncy" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0.875rem', borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '0.875rem', background: 'linear-gradient(135deg, var(--coral), var(--grape))', color: '#fff', boxShadow: '0 4px 20px rgba(255,107,107,0.4)' }}>
            <Zap size={16} /> طلب الآن
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div style={{ animation: 'pop-in 0.3s ease' }}>
          {product.store?.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📦 بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.375rem 0.75rem', borderRadius: 10, border: '2px solid var(--border)', background: '#fff', color: 'var(--text-soft)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                <X size={12} /> إلغاء
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
              <FR error={errors.customerName} label="👤 الاسم">
                <div style={{ position: 'relative' }}>
                  <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" style={inp(!!errors.customerName)} />
                </div>
              </FR>
              <FR error={errors.customerPhone} label="📞 الهاتف">
                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0XXXXXXXXX" style={inp(!!errors.customerPhone)} />
              </FR>
            </div>
            <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
              <FR error={errors.customerWelaya} label="📍 الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.customerWelaya), paddingLeft: 32, fontFamily: 'inherit' }}>
                    <option value="">اختر الولاية</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="🏘️ البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingLeft: 32, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '⏳...' : 'اختر البلدية'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-mid)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🚚 نوع التوصيل</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.875rem', border: `3px solid ${fd.typeLivraison === t ? 'var(--sky)' : 'var(--border)'}`, borderRadius: 16, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'rgba(78,205,196,0.1)' : '#fff', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: 4 }}>{t === 'home' ? '🏠' : '🏢'}</span>
                    <p style={{ fontWeight: 800, fontSize: '0.8rem', color: fd.typeLivraison === t ? 'var(--sky-dk)' : 'var(--text-soft)' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                    {selW && <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: fd.typeLivraison === t ? 'var(--text)' : 'var(--text-soft)' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-mid)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🔢 الكمية</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '2.5px solid var(--border)', borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral)' }}><Minus size={16} /></button>
                <span style={{ width: 46, textAlign: 'center', fontFamily: "'Fredoka One', cursive", fontSize: '1.25rem', color: 'var(--text)' }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral)' }}><Plus size={16} /></button>
              </div>
            </div>

            {/* Summary */}
            <div className="polka-dots" style={{ background: '#fff', border: '2.5px solid var(--border)', borderRadius: 20, padding: '1.125rem', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--coral)', textTransform: 'uppercase', marginBottom: '0.875rem' }}>🧾 ملخص الطلب</p>
              {[
                { l: 'المنتج', v: product.name.slice(0, 24) + (product.name.length > 24 ? '...' : '') },
                { l: 'السعر', v: `${fp.toLocaleString()} دج` },
                { l: 'الكمية', v: `× ${fd.quantity}` },
                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '---' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase' }}>{r.l}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.5rem' }}>
                <span style={{ fontWeight: 900, fontSize: '0.875rem', color: 'var(--coral)' }}>💰 المجموع</span>
                <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2rem', color: 'var(--coral)' }}>{total().toLocaleString()} <span style={{ fontSize: '0.9rem', fontFamily: 'inherit' }}>دج</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-bouncy" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '1rem', borderRadius: 18, border: 'none', cursor: sub ? 'not-allowed' : 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1rem', color: '#fff', background: sub ? 'var(--text-soft)' : 'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow: sub ? 'none' : '0 8px 28px rgba(255,107,107,0.4)', opacity: sub ? 0.8 : 1 }}>
              {sub ? <><Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }} /> ⏳ جاري المعالجة...</> : '🎉 تأكيد الطلب'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Lock size={11} style={{ color: 'var(--sky)' }} /> دفع آمن ومشفر
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CART
═══════════════════════════════════════════════════════════ */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [domain, store]);
  useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLiv = () => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; };
  const cartTotal = items.reduce((a, i) => a + (i.finalPrice * i.quantity), 0);
  const finalTotal = cartTotal + +getLiv();
  const update = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };
  const changeQty = (i: number, d: number) => { const n = [...items]; n[i].quantity = Math.max(1, n[i].quantity + d); update(n); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!fd.customerName.trim()) er.name = 'الاسم مطلوب';
    if (!fd.customerPhone.trim()) er.phone = 'الهاتف مطلوب';
    if (!fd.customerWelaya) er.w = 'الولاية مطلوبة';
    if (!fd.customerCommune) er.c = 'البلدية مطلوبة';
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  if (success) return (
    <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
      <div className="anim-pop-in" style={{ textAlign: 'center', background: '#fff', padding: '4rem 2.5rem', borderRadius: 28, border: '3px solid var(--mint-dk)', maxWidth: 460, width: '100%', boxShadow: '0 12px 40px rgba(110,231,183,0.2)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(110,231,183,0.15)', border: '3px solid var(--mint-dk)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle2 size={36} style={{ color: 'var(--mint-dk)' }} />
        </div>
        <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.875rem', color: 'var(--text)', marginBottom: '0.625rem' }}>تم استلام طلبك! 🎉</h2>
        <p style={{ color: 'var(--text-mid)', fontWeight: 600, marginBottom: '2rem', lineHeight: 1.7 }}>شكراً لثقتك! سنتواصل معك قريباً لتأكيد الطلب.</p>
        <Link href="/" className="btn-bouncy" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 2rem', borderRadius: 18, background: 'linear-gradient(135deg, var(--coral), var(--grape))', color: '#fff', fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 8px 28px rgba(255,107,107,0.4)' }}>
          🛍️ العودة للمتجر
        </Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
      <div className="polka-dots" style={{ textAlign: 'center', padding: '4rem 2rem', border: '3px dashed var(--border)', borderRadius: 28, maxWidth: 400, width: '100%', background: '#fff' }}>
        <ShoppingBag size={52} style={{ color: 'var(--text-soft)', display: 'block', margin: '0 auto 1.25rem', opacity: 0.4 }} />
        <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.25rem', color: 'var(--text-mid)', marginBottom: '1.75rem' }}>السلة فارغة 🧸</p>
        <Link href="/" className="btn-bouncy" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 2rem', borderRadius: 18, background: 'linear-gradient(135deg, var(--coral), var(--grape))', color: '#fff', fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 8px 28px rgba(255,107,107,0.4)' }}>
          🛒 تسوق الآن
        </Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text)', marginBottom: '2rem' }}>🛒 سلة التسوق</h1>
        <div className="cart-layout">

          {/* Items */}
          <div style={{ background: '#fff', borderRadius: 24, border: '3px solid var(--border)', overflow: 'hidden', alignSelf: 'start' }}>
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '3px dashed var(--border)', background: 'rgba(255,107,107,0.04)' }}>
              <Package size={18} style={{ color: 'var(--coral)' }} />
              <span style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--coral)', fontSize: '0.95rem' }}>منتجاتك ({items.length})</span>
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '2px dashed var(--border)' }}>
                <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 78, height: 78, borderRadius: 16, objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} alt="" />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{item.product?.name}</h4>
                  <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem', color: 'var(--coral)', marginBottom: '0.5rem' }}>{item.finalPrice?.toLocaleString()} دج</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                      <button onClick={() => changeQty(i, -1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral)' }}><Minus size={12} /></button>
                      <span style={{ width: 36, textAlign: 'center', fontFamily: "'Fredoka One', cursive", fontSize: '1rem', background: 'var(--bg)' }}>{item.quantity}</span>
                      <button onClick={() => changeQty(i, 1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral)' }}><Plus size={12} /></button>
                    </div>
                    <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.375rem 0.75rem', borderRadius: 10, border: '2px solid rgba(255,107,107,0.3)', background: 'transparent', color: 'var(--coral)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Trash2 size={12} /> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ padding: '1rem', background: 'rgba(255,107,107,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-soft)' }}>المجموع الفرعي</span>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem', color: 'var(--coral)' }}>{cartTotal.toLocaleString()} دج</span>
            </div>
          </div>

          {/* Checkout */}
          <div style={{ background: '#fff', borderRadius: 24, border: '3px solid var(--border)', padding: '1.75rem', alignSelf: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
              <Truck size={18} style={{ color: 'var(--sky)' }} />
              <span style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--sky)', fontSize: '0.95rem' }}>معلومات التوصيل</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom: '0.75rem' }}>
                <FR error={errors.name} label="👤 الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={inp(!!errors.name)} /></FR>
                <FR error={errors.phone} label="📞 الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={inp(!!errors.phone)} /></FR>
              </div>
              <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                <FR error={errors.w} label="📍 الولاية">
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
                    <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.w), paddingLeft: 32, fontFamily: 'inherit' }}>
                      <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
                <FR error={errors.c} label="🏘️ البلدية">
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
                    <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingLeft: 32, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}>
                      <option value="">{loadingC ? '⏳...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-mid)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🚚 نوع التوصيل</p>
                <div className="delivery-grid">
                  {(['home', 'office'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.75rem', border: `3px solid ${fd.typeLivraison === t ? 'var(--sky)' : 'var(--border)'}`, borderRadius: 14, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'rgba(78,205,196,0.08)' : '#fff', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                      <span style={{ display: 'block', fontSize: '1.25rem', marginBottom: 3 }}>{t === 'home' ? '🏠' : '🏢'}</span>
                      <p style={{ fontWeight: 800, fontSize: '0.78rem', color: fd.typeLivraison === t ? 'var(--sky-dk)' : 'var(--text-soft)' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                      {selW && <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.9rem', color: fd.typeLivraison === t ? 'var(--text)' : 'var(--text-soft)' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="polka-dots" style={{ background: '#fff', border: '2.5px solid var(--border)', borderRadius: 18, padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--coral)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>🧾 الملخص</p>
                {[
                  { l: 'المجموع الفرعي', v: `${cartTotal.toLocaleString()} دج` },
                  { l: 'التوصيل', v: getLiv() ? `${getLiv().toLocaleString()} دج` : '---' },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px dashed var(--border)' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-soft)' }}>{r.l}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.375rem' }}>
                  <span style={{ fontWeight: 900, fontSize: '0.875rem', color: 'var(--coral)' }}>💰 الإجمالي</span>
                  <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2rem', color: 'var(--coral)' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.85rem', fontFamily: 'inherit' }}>دج</span></span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-bouncy" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '1rem', borderRadius: 18, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1rem', color: '#fff', background: submitting ? 'var(--text-soft)' : 'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow: submitting ? 'none' : '0 8px 28px rgba(255,107,107,0.4)' }}>
                {submitting ? <><Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }} /> ⏳ جاري...</> : '🎉 تأكيد الطلب'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATIC PAGES
═══════════════════════════════════════════════════════════ */
const PageShell = ({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) => (
  <div dir="rtl" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
    <div className="polka-dots" style={{ position: 'relative', overflow: 'hidden', padding: '5rem 1.5rem 3rem', textAlign: 'center', background: 'linear-gradient(135deg, #fff9e6, var(--bg))' }}>
      <Confetti />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'bounce-loop 2s ease-in-out infinite' }}>{emoji}</span>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text)' }}>{title}</h1>
      </div>
      <WavyDivider top="var(--bg)" bottom="#fff" />
    </div>
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>{children}</div>
  </div>
);

const InfoCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div style={{ display: 'flex', gap: '1.125rem', padding: '1.25rem', marginBottom: '0.75rem', borderRadius: 20, border: '2.5px solid var(--border)', background: '#fff', transition: 'all 0.3s', cursor: 'default' }}
    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--sky)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(78,205,196,0.15)'; }}
    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = ''; el.style.boxShadow = ''; }}>
    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--sky), var(--mint-dk))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
    <div>
      <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: 'var(--text)', marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.7, color: 'var(--text-mid)' }}>{desc}</p>
    </div>
  </div>
);

export function Privacy() {
  return (
    <PageShell emoji="🔒" title="سياسة الخصوصية">
      <InfoCard icon={<ShieldCheck size={18} />} title="البيانات التي نجمعها" desc="نجمع فقط المعلومات الضرورية لإتمام طلبك — الاسم، رقم الهاتف، والعنوان." />
      <InfoCard icon={<Lock size={18} />} title="كيف نحمي بياناتك" desc="نستخدم تشفيراً متطوراً لضمان أمان معلوماتك الشخصية." />
      <InfoCard icon={<BadgeCheck size={18} />} title="سياسة المشاركة" desc="لا نبيع أو نشارك بياناتك مع أطراف ثالثة لأغراض تسويقية أبداً." />
    </PageShell>
  );
}

export function Terms() {
  return (
    <PageShell emoji="📋" title="الشروط والأحكام">
      <InfoCard icon={<CheckCircle2 size={18} />} title="حسابك ومسؤوليتك" desc="أنت مسؤول عن دقة المعلومات المقدمة. احتفظ ببيانات حسابك بأمان." />
      <InfoCard icon={<Truck size={18} />} title="الطلبات والمدفوعات" desc="جميع الطلبات تُؤكد عبر الهاتف قبل الشحن. الدفع عند الاستلام." />
      <InfoCard icon={<ShieldCheck size={18} />} title="القانون المنظم" desc="تخضع كافة المعاملات للقوانين الجزائرية المعمول بها." />
    </PageShell>
  );
}

export function Cookies() {
  return (
    <PageShell emoji="🍪" title="ملفات تعريف الارتباط">
      <InfoCard icon={<ShieldCheck size={18} />} title="الملفات الأساسية" desc="ضرورية لعمل سلة التسوق وتتبع الجلسة. لا يمكن إيقافها." />
      <InfoCard icon={<BadgeCheck size={18} />} title="ملفات التحليل" desc="تساعدنا على فهم كيفية تفاعلك مع الموقع لتحسين تجربتك." />
    </PageShell>
  );
}

export function Contact({ store }: { store: any }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
    catch { alert('حدث خطأ في الإرسال'); } finally { setLoading(false); }
  };

  return (
    <div dir="rtl" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="polka-dots" style={{ position: 'relative', overflow: 'hidden', padding: '5rem 1.5rem 3rem', textAlign: 'center', background: 'linear-gradient(135deg, #fff9e6, var(--bg))' }}>
        <Confetti />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'bounce-loop 2s ease-in-out infinite' }}>💌</span>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text)', marginBottom: '0.5rem' }}>تواصل معنا</h1>
          <p style={{ color: 'var(--text-mid)', fontWeight: 600 }}>نحب أن نسمع منك! 🌟</p>
        </div>
        <WavyDivider top="var(--bg)" bottom="#fff" />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
        <div className="contact-layout">
          {/* Info */}
          <div>
            {[
              { e: '📞', l: 'الهاتف', v: store?.contact?.phone || 'غير متوفر' },
              { e: '📍', l: 'الموقع', v: store?.contact?.wilaya || 'الجزائر' },
              { e: '📧', l: 'البريد', v: store?.contact?.email || 'غير متوفر' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.125rem', borderRadius: 20, border: '2.5px solid var(--border)', background: '#fff', marginBottom: '0.75rem', transition: 'all 0.25s', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--coral)'; el.style.transform = 'translateX(-4px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = ''; }}>
                <span style={{ fontSize: '2rem' }}>{r.e}</span>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{r.l}</p>
                  <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{r.v}</p>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '1rem', padding: '1.25rem', borderRadius: 20, background: 'linear-gradient(135deg, var(--coral), var(--grape))', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -20, left: -20, fontSize: '6rem', opacity: 0.15 }}>🎪</div>
              <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem', marginBottom: '0.25rem' }}>نرد بسرعة! ⚡</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.82 }}>عادة خلال ساعات قليلة</p>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: '#fff', borderRadius: 24, border: '3px solid var(--border)', padding: '2rem' }}>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem', color: 'var(--text)', marginBottom: '1.5rem' }}>✉️ أرسل رسالة</h2>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }} className="anim-pop-in">
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'bounce-loop 1.5s ease-in-out infinite' }}>🎉</span>
                <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.5rem' }}>تم إرسال رسالتك!</p>
                <p style={{ color: 'var(--text-mid)', fontWeight: 600, lineHeight: 1.7 }}>سنرد عليك قريباً! 🌟</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div className="form-row-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-mid)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>👤 الاسم</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="اسمك الكامل" style={inp()} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-mid)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>📞 الهاتف</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="05XXXXXXXX" style={inp()} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-mid)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>📧 البريد</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" style={inp()} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-mid)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>💬 رسالتك</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} placeholder="كيف يمكننا مساعدتك؟ 😊" style={{ ...inp(), resize: 'none' }} />
                </div>
                <button type="submit" disabled={loading} className="btn-bouncy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '1rem', borderRadius: 18, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: '1rem', color: '#fff', background: 'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow: '0 8px 28px rgba(255,107,107,0.4)', opacity: loading ? 0.7 : 1 }}>
                  {loading ? <><Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }} /> جاري الإرسال...</> : <>🚀 إرسال الرسالة</>}
                </button>
              </form>
            )}
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
      {p === 'privacy' && <Privacy />}
      {p === 'terms' && <Terms />}
      {p === 'cookies' && <Cookies />}
      {p === 'contact' && <Contact store={store} />}
    </>
  );
}