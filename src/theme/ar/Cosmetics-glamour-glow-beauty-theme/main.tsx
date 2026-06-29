'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  ShoppingBag, Search, X, ChevronDown, Heart, Star, Sparkles,
  CheckCircle2, Loader2, Trash2, ArrowLeft, Menu, Phone, Mail,
  MapPin, ToggleRight, ChevronLeft, ChevronRight, ZoomIn,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { showError } from '@/lib/showError';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ─── types ─────────────────────────────────────────────────── */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color'|'image'|'text'; value: string; }
interface VariantDetail { id: number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
interface Product {
  id: string; name: string; desc?: string;
  productImage?: string; imagesProduct?: { id: string; imageUrl: string }[];
  price: string | number; priceOriginal?: string | number;
  offers?: Offer[]; attributes?: any[]; variantDetails?: VariantDetail[];
  stock?: number; isActive?: boolean;
  store: any;
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}

/* ─── helpers ────────────────────────────────────────────────── */
const variantMatches = (d: VariantDetail, sel: Record<string, string>): boolean =>
  Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
async function fetchWilayas(userId: string): Promise<Wilaya[]> {
  try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`); return data || []; } catch { return []; }
}
async function fetchCommunes(wilayaId: string): Promise<Commune[]> {
  try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`); return data || []; } catch { return []; }
}
const INP = (err = false): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', border: `1.5px solid ${err ? '#FF1F8E' : 'var(--line-dk)'}`,
  borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
  background: 'var(--white)', color: 'var(--ink)', boxSizing: 'border-box', transition: 'border-color 0.2s',
  appearance: 'none' as const,
});
const FR = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 13 }}>
    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>{label}</p>
    {children}
    {error && <p style={{ color: '#FF1F8E', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>{error}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Nunito+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --pink:    #FF1F8E;
    --pink-lt: #FF6CB5;
    --pink-dk: #CC0070;
    --blush:   #FFF0F5;
    --blush-2: #FFE0EE;
    --gold:    #C9A96E;
    --gold-lt: #E8D5A8;
    --gold-dk: #A07840;
    --ink:     #1A0A12;
    --mid:     #4A2538;
    --dim:     #7A5068;
    --white:   #FFFFFF;
    --soft:    #FFF8FB;
    --line:    #F0D8E5;
    --line-dk: #DDB8CC;
  }

  .gg-serif { font-family: 'Cormorant Garamond', serif !important; }
  .gg-body  { font-family: 'Nunito Sans', sans-serif !important; }

  /* Ticker */
  @keyframes gg-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .gg-ticker-wrap { overflow: hidden; white-space: nowrap; background: var(--pink); color: #fff; height: 36px; display: flex; align-items: center; }
  .gg-ticker-track { display: inline-flex; animation: gg-scroll 30s linear infinite; }
  .gg-ticker-item  { padding: 0 48px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }

  /* Spin */
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Glimmer */
  @keyframes gg-glimmer { 0%,100% { opacity: 0.55; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }

  /* Shimmer skeleton */
  @keyframes gg-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .gg-skel {
    background: linear-gradient(90deg, #f7d9e8 25%, #ffe5f0 50%, #f7d9e8 75%);
    background-size: 800px 100%;
    animation: gg-shimmer 1.6s ease-in-out infinite;
    border-radius: 6px;
  }

  /* Nav */
  .gg-nav { position: sticky; top: 0; z-index: 100; background: var(--white); border-bottom: 1.5px solid var(--line); }
  .gg-nav-inner { max-width: 1360px; margin: 0 auto; padding: 0 24px; height: 68px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .gg-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.65rem; font-weight: 600; font-style: italic; color: var(--pink); text-decoration: none; white-space: nowrap; }
  .gg-nav-links { display: flex; gap: 28px; align-items: center; }
  .gg-nav-link { font-family: 'Nunito Sans', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--mid); text-decoration: none; transition: color 0.2s; }
  .gg-nav-link:hover { color: var(--pink); }
  .gg-icon-btn { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border: none; background: transparent; cursor: pointer; color: var(--mid); transition: color 0.2s; border-radius: 50%; }
  .gg-icon-btn:hover { color: var(--pink); background: var(--blush); }
  .gg-cart-badge { position: absolute; top: -4px; left: -4px; min-width: 17px; height: 17px; border-radius: 999px; background: var(--pink); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 3px; font-family: 'Nunito Sans', sans-serif; }

  /* Search overlay */
  .gg-srch-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(26,10,18,0.7); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 80px; }
  .gg-srch-box { width: 100%; max-width: 600px; margin: 0 20px; background: var(--white); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 60px rgba(255,31,142,0.18); }
  .gg-srch-inp { width: 100%; padding: 18px 56px 18px 20px; border: none; outline: none; font-size: 1.05rem; font-family: 'Nunito Sans', sans-serif; color: var(--ink); background: var(--white); box-sizing: border-box; }
  .gg-srch-results { border-top: 1px solid var(--line); max-height: 380px; overflow-y: auto; }
  .gg-srch-item { display: flex; align-items: center; gap: 14px; padding: 14px 20px; cursor: pointer; transition: background 0.15s; }
  .gg-srch-item:hover { background: var(--blush); }

  /* Mobile nav drawer */
  .gg-drawer { position: fixed; inset: 0; z-index: 300; }
  .gg-drawer-bg { position: absolute; inset: 0; background: rgba(26,10,18,0.6); }
  .gg-drawer-panel { position: absolute; top: 0; right: 0; width: min(320px,90vw); height: 100%; background: var(--white); overflow-y: auto; display: flex; flex-direction: column; }
  .gg-drawer-hd { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--line); }

  /* Btn */
  .gg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 28px; border-radius: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; border: none; transition: all 0.22s; text-decoration: none; }
  .gg-btn-pink { background: var(--pink); color: #fff; }
  .gg-btn-pink:hover { background: var(--pink-dk); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,31,142,0.35); }
  .gg-btn-outline { background: transparent; color: var(--pink); border: 1.5px solid var(--pink); }
  .gg-btn-outline:hover { background: var(--blush); }
  .gg-btn-gold { background: var(--gold); color: #fff; }
  .gg-btn-gold:hover { background: var(--gold-dk); transform: translateY(-1px); }

  /* Hero */
  .gg-hero { position: relative; background: linear-gradient(135deg, var(--blush) 0%, #ffe0ee 55%, var(--blush-2) 100%); min-height: 520px; display: flex; align-items: center; overflow: hidden; }
  .gg-hero-deco { position: absolute; border-radius: 50%; pointer-events: none; }
  .gg-hero-content { position: relative; z-index: 2; max-width: 1360px; margin: 0 auto; padding: 60px 24px; display: flex; align-items: center; gap: 48px; width: 100%; }
  .gg-hero-text { flex: 1; min-width: 0; }
  .gg-hero-eyebrow { font-family: 'Nunito Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
  .gg-hero-h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.4rem,5vw,4.2rem); font-weight: 600; font-style: italic; color: var(--ink); line-height: 1.15; margin-bottom: 16px; }
  .gg-hero-sub { font-family: 'Nunito Sans', sans-serif; font-size: 15px; color: var(--mid); line-height: 1.75; max-width: 440px; margin-bottom: 28px; }
  .gg-hero-img { flex: 0 0 400px; height: 420px; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 60px rgba(255,31,142,0.2); }
  .gg-hero-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Categories */
  .gg-cats { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
  .gg-cats::-webkit-scrollbar { display: none; }
  .gg-cat-chip { flex-shrink: 0; padding: 8px 18px; border-radius: 999px; border: 1.5px solid var(--line-dk); background: var(--white); color: var(--mid); font-family: 'Nunito Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .gg-cat-chip.active, .gg-cat-chip:hover { background: var(--pink); border-color: var(--pink); color: #fff; }

  /* Card */
  .gg-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 20px; }
  .gg-card { background: var(--white); border-radius: 12px; overflow: hidden; border: 1px solid var(--line); transition: box-shadow 0.25s, transform 0.25s; text-decoration: none; color: inherit; display: flex; flex-direction: column; }
  .gg-card:hover { box-shadow: 0 12px 40px rgba(255,31,142,0.15); transform: translateY(-4px); }
  .gg-card-img { aspect-ratio: 3/4; overflow: hidden; position: relative; background: var(--blush); }
  .gg-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
  .gg-card:hover .gg-card-img img { transform: scale(1.06); }
  .gg-card-badge { position: absolute; top: 10px; right: 10px; background: var(--pink); color: #fff; font-family: 'Nunito Sans', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; }
  .gg-card-body { padding: 14px; flex: 1; display: flex; flex-direction: column; }
  .gg-card-name { font-family: 'Nunito Sans', sans-serif; font-size: 13.5px; font-weight: 600; color: var(--ink); margin-bottom: 6px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .gg-card-price { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: var(--pink); }
  .gg-card-old { font-family: 'Nunito Sans', sans-serif; font-size: 12px; color: var(--dim); text-decoration: line-through; margin-right: 6px; }
  .gg-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }

  /* Trust bar */
  .gg-trust { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; padding: 40px 0; }
  .gg-trust-item { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px 16px; background: var(--white); border: 1px solid var(--line); border-radius: 12px; text-align: center; }
  .gg-trust-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--blush); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }

  /* Details */
  .gg-det-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; max-width: 1200px; margin: 0 auto; padding: 48px 24px 80px; }
  .gg-gallery-main { aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; background: var(--blush); border: 1px solid var(--line); position: relative; }
  .gg-gallery-main img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gg-gallery-thumbs { display: flex; gap: 10px; margin-top: 12px; overflow-x: auto; scrollbar-width: none; }
  .gg-gallery-thumbs::-webkit-scrollbar { display: none; }
  .gg-gallery-thumb { width: 72px; height: 90px; flex-shrink: 0; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; background: var(--blush); }
  .gg-gallery-thumb.active { border-color: var(--pink); }
  .gg-gallery-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Variant selector */
  .gg-var-btn { padding: 8px 16px; border: 1.5px solid var(--line-dk); border-radius: 8px; background: var(--white); font-family: 'Nunito Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--mid); cursor: pointer; transition: all 0.2s; }
  .gg-var-btn.active { border-color: var(--pink); color: var(--pink); background: var(--blush); }
  .gg-var-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Offer card */
  .gg-offer { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1.5px solid var(--line-dk); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
  .gg-offer.active { border-color: var(--pink); background: var(--blush); }
  .gg-offer-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--line-dk); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .gg-offer.active .gg-offer-radio { border-color: var(--pink); background: var(--pink); }
  .gg-offer.active .gg-offer-radio::after { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #fff; }

  /* Cart grid */
  .gg-cart-grid { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }

  /* Contact grid */
  .gg-contact-grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: 28px; }

  /* Section heading */
  .gg-sec-hd { text-align: center; margin-bottom: 32px; }
  .gg-sec-eyebrow { font-family: 'Nunito Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
  .gg-sec-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem,3.5vw,3rem); font-weight: 600; font-style: italic; color: var(--ink); }

  /* Footer */
  .gg-footer { background: var(--ink); color: var(--blush); }
  .gg-footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 32px; max-width: 1360px; margin: 0 auto; padding: 60px 24px 40px; }
  .gg-footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 600; font-style: italic; color: var(--pink); margin-bottom: 12px; }
  .gg-footer-desc { font-family: 'Nunito Sans', sans-serif; font-size: 13px; color: #a07080; line-height: 1.8; margin-bottom: 20px; }
  .gg-footer-title { font-family: 'Nunito Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 16px; }
  .gg-footer-link { display: block; font-family: 'Nunito Sans', sans-serif; font-size: 13px; color: #a07080; text-decoration: none; margin-bottom: 10px; transition: color 0.2s; }
  .gg-footer-link:hover { color: var(--pink-lt); }
  .gg-footer-bottom { border-top: 1px solid rgba(255,31,142,0.15); padding: 20px 24px; max-width: 1360px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
  .gg-footer-copy { font-family: 'Nunito Sans', sans-serif; font-size: 12px; color: #a07080; }

  @media (max-width: 1024px) {
    .gg-trust { grid-template-columns: repeat(2,1fr); }
    .gg-footer-grid { grid-template-columns: 1fr 1fr; }
    .gg-cart-grid { grid-template-columns: 1fr; }
    .gg-contact-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .gg-nav-links { display: none; }
    .gg-hero-img { display: none; }
    .gg-hero-content { padding: 48px 20px; }
    .gg-det-grid { grid-template-columns: 1fr; gap: 28px; }
    .gg-cards-grid { grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap: 14px; }
    .gg-footer-grid { grid-template-columns: 1fr; gap: 28px; padding: 40px 20px 28px; }
    .gg-footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
  }
  @media (max-width: 480px) {
    .gg-trust { grid-template-columns: 1fr 1fr; }
    .gg-cards-grid { grid-template-columns: 1fr; }
  }

  .gg-form-2c{display:grid;grid-template-columns:1fr;gap:10px;}
  @media(min-width:540px){.gg-form-2c{grid-template-columns:1fr 1fr;}}
`;

/* ══════════════════════════════════════════════════════════════
   MAIN (layout shell)
══════════════════════════════════════════════════════════════ */
export default function Main({ children, store, domain }: { children: React.ReactNode; store: any; domain: string }) {
  if (!store) return null;
  return (
    <div dir="rtl" style={{ fontFamily: "'Nunito Sans',sans-serif", background: 'var(--soft)', minHeight: '100vh', color: 'var(--ink)' }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(domain) || '[]');
    initCount(saved.length);
  }, [domain, initCount]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    try {
      const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: q } });
      setResults(data?.products || data || []);
    } catch { setResults([]); }
  }, [domain]);

  const openSearch = () => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 80); };
  const closeSearch = () => { setSearchOpen(false); setSearch(''); setResults([]); };

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="gg-ticker-wrap">
          <div className="gg-ticker-track">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="gg-ticker-item">✨ {store.topBar.text}</span>
            ))}
          </div>
        </div>
      )}

      <nav className="gg-nav">
        <div className="gg-nav-inner">
          {/* Mobile menu btn */}
          <button className="gg-icon-btn" style={{ display: 'none' }} id="gg-menu-btn"
            onClick={() => setMenuOpen(true)}
            onMouseEnter={() => { const b = document.getElementById('gg-menu-btn'); if (b) b.style.display = 'flex'; }}
          >
            <Menu size={20} />
          </button>
          <style>{`@media(max-width:768px){#gg-menu-btn{display:flex !important}}`}</style>

          {/* Logo */}
          <Link href="/" className="gg-logo">{store?.name || 'Glamour & Glow'}</Link>

          {/* Nav links */}
          <nav className="gg-nav-links">
            <Link href="/" className="gg-nav-link">الرئيسية</Link>
            <Link href="/products" className="gg-nav-link">المنتجات</Link>
            <Link href="/contact" className="gg-nav-link">تواصل</Link>
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="gg-icon-btn" onClick={openSearch}><Search size={18} /></button>
            <Link href="/cart" style={{ position: 'relative', display: 'inline-flex' }}>
              <button className="gg-icon-btn"><ShoppingBag size={18} /></button>
              {count > 0 && <span className="gg-cart-badge">{count}</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="gg-srch-overlay" onClick={closeSearch}>
          <div className="gg-srch-box" onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative' }}>
              <input
                ref={searchRef}
                className="gg-srch-inp"
                placeholder="ابحثي عن منتج..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  clearTimeout(timer.current);
                  timer.current = setTimeout(() => doSearch(e.target.value), 350);
                }}
              />
              <button onClick={closeSearch} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dim)' }}><X size={18} /></button>
            </div>
            {results.length > 0 && (
              <div className="gg-srch-results">
                {results.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} className="gg-srch-item" onClick={closeSearch} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', background: 'var(--blush)', flexShrink: 0 }}>
                      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--pink)', margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600 }}>{(typeof p.price === 'string' ? parseFloat(p.price) : p.price)?.toLocaleString()} دج</p>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={() => { closeSearch(); window.location.href = `/?search=${encodeURIComponent(search)}`; }}
                  style={{ width: '100%', padding: '12px', background: 'var(--blush-2)', border: 'none', borderTop: '1px solid var(--line)', color: 'var(--pink)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Nunito Sans',sans-serif" }}>
                  عرض جميع النتائج <ArrowLeft size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="gg-drawer">
          <div className="gg-drawer-bg" onClick={() => setMenuOpen(false)} />
          <div className="gg-drawer-panel">
            <div className="gg-drawer-hd">
              <span className="gg-logo" style={{ fontSize: '1.35rem' }}>{store?.name || 'Glamour & Glow'}</span>
              <button className="gg-icon-btn" onClick={() => setMenuOpen(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              {[['/', 'الرئيسية'], ['/products', 'المنتجات'], ['/contact', 'تواصل']].map(([href, label]) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '14px 0', borderBottom: '1px solid var(--line)', fontFamily: "'Nunito Sans',sans-serif", fontSize: '15px', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: { store: any }) {
  const socials = store?.socialMedia || {};
  return (
    <footer className="gg-footer">
      <div className="gg-footer-grid">
        {/* Brand */}
        <div>
          <div className="gg-footer-logo">{store?.name || 'Glamour & Glow'}</div>
          <p className="gg-footer-desc">{store?.description || 'منتجات تجميل فاخرة تُضيء جمالك الطبيعي. اكتشفي مجموعتنا الحصرية.'}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              ['instagram', socials.instagram, '📸'],
              ['facebook', socials.facebook, '📘'],
              ['tiktok', socials.tiktok, '🎵'],
            ].filter(([, url]) => url).map(([key, url, icon]) => (
              <a key={key as string} href={url as string} target="_blank" rel="noopener"
                style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,31,142,0.15)', border: '1px solid rgba(255,31,142,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', textDecoration: 'none', transition: 'background 0.2s' }}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <p className="gg-footer-title">الصفحات</p>
          {[['/', 'الرئيسية'], ['/products', 'المنتجات'], ['/cart', 'السلة'], ['/contact', 'تواصل معنا']].map(([href, label]) => (
            <Link key={href} href={href} className="gg-footer-link">{label}</Link>
          ))}
        </div>

        {/* Legal */}
        <div>
          <p className="gg-footer-title">قانوني</p>
          {[['/privacy', 'سياسة الخصوصية'], ['/terms', 'شروط الخدمة'], ['/cookies', 'ملفات الارتباط']].map(([href, label]) => (
            <Link key={href} href={href} className="gg-footer-link">{label}</Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <p className="gg-footer-title">تواصل</p>
          {store?.contact?.phone && (
            <a href={`tel:${store.contact.phone}`} className="gg-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />{store.contact.phone}
            </a>
          )}
          {store?.contact?.email && (
            <a href={`mailto:${store.contact.email}`} className="gg-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />{store.contact.email}
            </a>
          )}
          {store?.contact?.address && (
            <span className="gg-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}>
              <MapPin size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />{store.contact.address}
            </span>
          )}
        </div>
      </div>

      <div className="gg-footer-bottom" style={{ maxWidth: 1360, margin: '0 auto', padding: '20px 24px' }}>
        <p className="gg-footer-copy">© {new Date().getFullYear()} {store?.name || 'Glamour & Glow'} · جميع الحقوق محفوظة</p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {['💳', '💰', '🔒'].map((ic, i) => (
            <span key={i} style={{ width: 32, height: 22, borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{ic}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   CARD
══════════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  if (!product || !store) return null;
  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number) || 0;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;

  return (
    <Link href={`/product/${product.slug || product.id}`} className="gg-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="gg-card-img">
        {img ? <img src={img} alt={product.name} loading="lazy" /> : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blush)' }}>
            <Sparkles size={32} style={{ color: 'var(--pink)', opacity: 0.3 }} />
          </div>
        )}
        {discount > 0 && <span className="gg-card-badge">-{discount}%</span>}
        
      </div>
      <div className="gg-card-body">
        <p className="gg-card-name">{product.name}</p>
        <div className="gg-card-footer">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            {orig > price && <span className="gg-card-old">{orig.toLocaleString()} دج</span>}
            <span className="gg-card-price">{price.toLocaleString()} <span style={{ fontSize: '0.75rem', fontFamily: "'Nunito Sans',sans-serif", fontWeight: 600, color: 'var(--dim)' }}>دج</span></span>
          </div>
          
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
export function Home({ store, domain, page }: { store: any; domain: string; page?: number }) {
  if (!store) return null;
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  const countPage = Math.ceil((store.count || products.length) / 48);

  const [activeCat, setActiveCat] = useState<string | null>(null);

  const visible = useMemo(
    () => activeCat ? products.filter((p: any) => p.categoryId === activeCat) : products,
    [products, activeCat]
  );

  return (
    <>
      {/* Hero */}
      {store?.hero?.imageUrl ? (
        <section style={{ position: 'relative', minHeight: 480, overflow: 'hidden' }}>
          <img src={store.hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(26,10,18,0.7) 0%, rgba(26,10,18,0.35) 60%, transparent 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1360, margin: '0 auto', padding: '80px 24px', display: 'flex', alignItems: 'center', minHeight: 480 }}>
            <div style={{ maxWidth: 540 }}>
              <p className="gg-hero-eyebrow" style={{ color: 'var(--gold-lt)' }}>✨ كوليكشن جديد</p>
              <h1 className="gg-hero-h1" style={{ color: '#fff' }}>
                {store.hero.title?.replace(/<[^>]+>/g, '') || 'تألقي بجمالك الحقيقي'}
              </h1>
              <p className="gg-hero-sub" style={{ color: 'rgba(255,255,255,0.82)' }}>
                {store.hero.subtitle || 'اكتشفي أرقى منتجات التجميل والعناية بالبشرة.'}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#products" className="gg-btn gg-btn-pink">تسوقي الآن</a>
                <Link href="/contact" className="gg-btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }}>اعرفي المزيد</Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="gg-hero">
          <div className="gg-hero-deco" style={{ width: 380, height: 380, background: 'rgba(255,31,142,0.08)', top: -100, left: -80 }} />
          <div className="gg-hero-deco" style={{ width: 220, height: 220, background: 'rgba(201,169,110,0.12)', bottom: -60, right: 80 }} />
          <div className="gg-hero-content">
            <div className="gg-hero-text">
              <p className="gg-hero-eyebrow">✨ كوليكشن جديد</p>
              <h1 className="gg-hero-h1">
                {store?.hero?.title?.replace(/<[^>]+>/g, '') || 'تألقي بجمالك الحقيقي'}
              </h1>
              <p className="gg-hero-sub">
                {store?.hero?.subtitle || 'اكتشفي أرقى منتجات التجميل والعناية بالبشرة. تركيبات فاخرة تُعيد لبشرتك نضارتها وإشراقها.'}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#products" className="gg-btn gg-btn-pink">تسوقي الآن</a>
                <Link href="/contact" className="gg-btn gg-btn-outline">اعرفي المزيد</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust bar */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '0 24px' }}>
        <div className="gg-trust">
          {[
            { icon: '🚚', title: 'توصيل سريع', desc: 'لجميع ولايات الجزائر' },
            { icon: '💎', title: 'جودة أصيلة', desc: 'منتجات فاخرة 100%' },
            { icon: '💳', title: 'دفع آمن', desc: 'عند الاستلام' },
            { icon: '🔄', title: 'إرجاع سهل', desc: 'خلال 7 أيام' },
          ].map(item => (
            <div key={item.title} className="gg-trust-item">
              <div className="gg-trust-icon">{item.icon}</div>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: '13px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>{item.title}</p>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: '12px', color: 'var(--dim)', margin: 0, textAlign: 'center' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products section */}
      <section id="products" style={{ maxWidth: 1360, margin: '0 auto', padding: '20px 24px 80px' }}>
        <div className="gg-sec-hd">
          <p className="gg-sec-eyebrow">تشكيلتنا</p>
          <h2 className="gg-sec-title">منتجاتنا المميزة</h2>
        </div>

        {/* Category filter */}
        {cats.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div className="gg-cats">
              <button className={`gg-cat-chip${!activeCat ? ' active' : ''}`} onClick={() => setActiveCat(null)}>الكل</button>
              {cats.map((cat: any) => (
                <button key={cat.id} className={`gg-cat-chip${activeCat === cat.id ? ' active' : ''}`} onClick={() => setActiveCat(cat.id)}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--dim)' }}>
            <Sparkles size={36} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', fontStyle: 'italic' }}>لا توجد منتجات</p>
          </div>
        ) : (
          <div className="gg-cards-grid">
            {visible.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض التفاصيل" />;
            })}
          </div>
        )}

        {/* Pagination */}
        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            {[...Array(countPage)].map((_, i) => (
              <a key={i} href={`?page=${i + 1}`}
                style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${(page || 1) === i + 1 ? 'var(--pink)' : 'var(--line-dk)'}`, background: (page || 1) === i + 1 ? 'var(--pink)' : 'var(--white)', color: (page || 1) === i + 1 ? '#fff' : 'var(--mid)', fontFamily: "'Nunito Sans',sans-serif", fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                {i + 1}
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETAILS
══════════════════════════════════════════════════════════════ */
export function Details({ product, discount, allImages, domain, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection }: any) {
  const [sel, setSel] = useState(0);
  if (!product) return null;

  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number) || 0;

  return (
    <div dir="rtl" style={{ background: 'var(--soft)', minHeight: '100vh', padding: '20px 0 60px' }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--dim)', textDecoration: 'none' }}>الرئيسية</Link>
        <ChevronLeft size={12} style={{ color: 'var(--dim)' }} />
        <span style={{ fontSize: 13, color: 'var(--pink)', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div className="gg-det-grid">
        {/* Gallery */}
        <div>
          <div className="gg-gallery-main" style={{ position: 'relative' }}>
            {allImages?.length > 0
              ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blush)' }}>
                  <Sparkles size={40} style={{ color: 'var(--pink)', opacity: 0.3 }} />
                </div>
            }
            {discount > 0 && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--pink)', color: '#fff', fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 999 }}>
                -{discount}%
              </div>
            )}
            
            {allImages?.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <ChevronRight size={14} style={{ color: 'var(--ink)' }} />
                </button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <ChevronLeft size={14} style={{ color: 'var(--ink)' }} />
                </button>
              </>
            )}
          </div>
          {allImages?.length > 1 && (
            <div className="gg-gallery-thumbs">
              {allImages.map((src: string, i: number) => (
                <div key={i} className={`gg-gallery-thumb${i === sel ? ' active' : ''}`} onClick={() => setSel(i)}>
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ paddingTop: 8 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 12, lineHeight: 1.25 }}>
            {product.name}
          </h1>

          {/* Stars */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={13} style={{ color: 'var(--gold)', fill: i < 4 ? 'var(--gold)' : 'none' }} />)}
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 700, color: 'var(--pink)' }}>{(finalPrice || price).toLocaleString()}</span>
            <span style={{ fontSize: 14, color: 'var(--dim)' }}>دج</span>
            {product.priceOriginal && parseFloat(String(product.priceOriginal)) > (finalPrice || price) && (
              <span style={{ fontSize: 14, color: 'var(--dim)', textDecoration: 'line-through' }}>{parseFloat(String(product.priceOriginal)).toLocaleString()}</span>
            )}
          </div>

          {/* Stock badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 20, background: inStock || autoGen ? 'rgba(255,31,142,0.08)' : 'rgba(100,80,80,0.08)', color: inStock || autoGen ? 'var(--pink)' : 'var(--mid)', fontSize: 12, fontWeight: 600, border: `1px solid ${inStock || autoGen ? 'var(--pink-lt)' : 'var(--mid)'}`, marginBottom: 20, fontFamily: "'Nunito Sans',sans-serif" }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />
            
          </div>

          <div style={{ height: 1, background: 'var(--line)', marginBottom: 20 }} />

          {/* Attributes */}
          {allAttrs?.map((attr: any) => (
            <div key={attr.id} style={{ marginBottom: 18 }}>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>
                {attr.name}: <span style={{ color: 'var(--pink)' }}>{selectedVariants?.[attr.name] || '—'}</span>
              </p>
              {attr.displayMode === 'color' ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {attr.variants.map((v: any) => (
                    <button key={v.id} onClick={() => handleVariantSelection?.(attr.name, v.value)} title={v.name}
                      style={{ width: 28, height: 28, background: v.value, border: 'none', cursor: 'pointer', borderRadius: '50%', outline: selectedVariants?.[attr.name] === v.value ? '3px solid var(--pink)' : '3px solid transparent', outlineOffset: 3 }} />
                  ))}
                </div>
              ) : attr.displayMode === 'image' ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {attr.variants.map((v: any) => (
                    <button key={v.id} onClick={() => handleVariantSelection?.(attr.name, v.value)}
                      style={{ width: 52, height: 52, overflow: 'hidden', border: `2px solid ${selectedVariants?.[attr.name] === v.value ? 'var(--pink)' : 'var(--line-dk)'}`, cursor: 'pointer', padding: 0, borderRadius: 8 }}>
                      <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {attr.variants.map((v: any) => (
                    <button key={v.id} onClick={() => handleVariantSelection?.(attr.name, v.value)}
                      className={`gg-var-btn${selectedVariants?.[attr.name] === v.value ? ' active' : ''}`}>
                      {v.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Offers */}
          {product.offers?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>الباقات</p>
              {product.offers.map((offer: any) => (
                <label key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1.5px solid ${selectedOffer === offer.id ? 'var(--pink)' : 'var(--line-dk)'}`, cursor: 'pointer', marginBottom: 8, borderRadius: 8, transition: 'all 0.2s', background: selectedOffer === offer.id ? 'var(--blush)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${selectedOffer === offer.id ? 'var(--pink)' : 'var(--dim)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectedOffer === offer.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pink)' }} />}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: '0 0 2px' }}>{offer.name} × {offer.quantity}</p>
                      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--pink)', margin: 0 }}>{offer.price.toLocaleString()} دج</p>
                    </div>
                  </div>
                  <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer?.(offer.id)} style={{ display: 'none' }} />
                </label>
              ))}
            </div>
          )}

          <ProductForm product={product} userId={product.store?.userId || product.store?.user?.id} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants || {}} />

          {product.desc && (
            <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 14, lineHeight: 1.85, color: 'var(--mid)' }}>{product.desc}</p>
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
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0 }: ProductFormProps) {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, typeLivraison: 'home' as 'home' | 'office' });
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
  const getLiv = useCallback((): number => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);

  const getFP = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: any) => o.id === selectedOffer); if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);

  useEffect(() => { if (selW) setFd(f => ({ ...f, priceLoss: selW.livraisonReturn })); }, [selW]);

  const fp = getFP();
  const total = () => fp * fd.quantity + +getLiv();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = 'رقم هاتف غير صالح';
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
      if (fd.customerId && typeof window !== 'undefined') localStorage.setItem('customerId', fd.customerId);
      window.location.href = `/${domain}/successfully`;
    } catch { } finally { setSub(false); }
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Cart + Order buttons */}
        {product.store?.cart && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={addToCart} disabled={isAdded}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', border: `1.5px solid ${isAdded ? 'var(--pink)' : 'var(--line-dk)'}`, background: isAdded ? 'var(--blush)' : 'transparent', color: isAdded ? 'var(--pink)' : 'var(--mid)', fontFamily: "'Nunito Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer', borderRadius: 8, transition: 'all 0.2s' }}>
            {isAdded ? <><CheckCircle2 size={14} /> تمت الإضافة</> : <><ShoppingBag size={14} /> أضف للسلة</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} className="gg-btn gg-btn-pink" style={{ flex: 1, padding: '11px' }}>
            اطلبي الآن
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div>
          {product.store?.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--mid)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', border: '1px solid var(--line-dk)', background: 'transparent', color: 'var(--dim)', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', borderRadius: 6 }}>
                <X size={11} /> إلغاء
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <FR label="الكمية">
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line-dk)', borderRadius: 8, overflow: 'hidden' }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--soft)', cursor: 'pointer', color: 'var(--ink)', fontSize: 18 }}>-</button>
                <span style={{ width: 48, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: "'Nunito Sans',sans-serif" }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--soft)', cursor: 'pointer', color: 'var(--ink)', fontSize: 18 }}>+</button>
              </div>
            </FR>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FR label="الاسم" error={errors.customerName}>
                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" style={INP(!!errors.customerName)} />
              </FR>
              <FR label="الهاتف" error={errors.customerPhone}>
                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0X XX XX XX XX" style={INP(!!errors.customerPhone)} />
              </FR>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FR label="الولاية" error={errors.customerWelaya}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.customerWelaya), paddingRight: 32, fontFamily: 'inherit' }}>
                    <option value="">اختري</option>
                    {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR label="البلدية" error={errors.customerCommune}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.customerCommune), paddingRight: 32, opacity: !fd.customerWelaya ? 0.4 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'اختري'}</option>
                    {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <FR label="التوصيل">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['home', 'office'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))}
                    style={{ padding: '12px 10px', border: `1.5px solid ${fd.typeLivraison === type ? 'var(--pink)' : 'var(--line-dk)'}`, background: fd.typeLivraison === type ? 'var(--blush)' : 'transparent', cursor: 'pointer', textAlign: 'center', borderRadius: 8, transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 700, color: fd.typeLivraison === type ? 'var(--pink)' : 'var(--mid)', margin: '0 0 4px' }}>{type === 'home' ? 'للبيت' : 'للمكتب'}</p>
                    {selW && <p style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--pink)' : 'var(--dim)', margin: 0, fontFamily: "'Cormorant Garamond',serif" }}>{(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400 }}>دج</span></p>}
                  </button>
                ))}
              </div>
            </FR>

            {/* Summary */}
            <div style={{ border: '1px solid var(--line-dk)', borderRadius: 8, marginBottom: 14, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: 'var(--blush)', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--mid)', margin: 0 }}>ملخص الطلب</p>
              </div>
              {[
                { l: 'المنتج', v: product.name.slice(0, 22) },
                { l: 'السعر', v: `${fp.toLocaleString()} دج` },
                { l: 'الكمية', v: `× ${fd.quantity}` },
                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
              ].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--line)', background: 'var(--white)' }}>
                  <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--dim)' }}>{row.l}</span>
                  <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', background: 'var(--blush)' }}>
                <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--mid)' }}>المجموع</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--pink)' }}>{total().toLocaleString()} <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 400, color: 'var(--dim)' }}>دج</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="gg-btn gg-btn-pink" style={{ width: '100%', fontSize: 15, padding: 13, cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1, borderRadius: 8, marginBottom: 8 }}>
              {sub ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري...</> : '💳 تأكيدي الطلب'}
            </button>
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
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(domain) || '[]'));
    const uid = store?.user?.id || store?.userId;
    if (uid) fetchWilayas(uid).then(setWilayas);
  }, [domain, store]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLiv = () => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; };
  const cartTotal = items.reduce((a, i) => a + i.finalPrice * i.quantity, 0);
  const finalTotal = cartTotal + +getLiv();
  const update = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!fd.customerName.trim()) er.name = 'مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = 'رقم غير صالح';
    if (!fd.customerWelaya) er.w = 'مطلوب';
    if (!fd.customerCommune) er.c = 'مطلوب';
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({
        ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId,
        selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants,
        platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal,
        priceLivraison: +getLiv(), quantity: i.quantity, priceLoss: selW?.livraisonReturn ?? 0,
      })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  if (success) return (
    <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--soft)' }}>
      <div style={{ textAlign: 'center', background: 'var(--white)', padding: '4rem 2.5rem', border: '1px solid var(--line)', borderRadius: 16, maxWidth: 460, width: '100%', boxShadow: '0 8px 40px rgba(255,31,142,0.1)' }}>
        <CheckCircle2 size={48} style={{ color: 'var(--pink)', margin: '0 auto 20px', display: 'block' }} />
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontStyle: 'italic', color: 'var(--ink)', marginBottom: 8 }}>تم استلام طلبك! ✨</h2>
        <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 14, color: 'var(--dim)', marginBottom: 28, lineHeight: 1.7 }}>شكراً لاختيارك إيانا. سنتواصل معك قريباً.</p>
        <Link href="/" className="gg-btn gg-btn-pink">العودة للمتجر</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--soft)' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--line-dk)', borderRadius: 12, maxWidth: 400, width: '100%', background: 'var(--white)' }}>
        <ShoppingBag size={48} style={{ color: 'var(--pink)', opacity: 0.35, margin: '0 auto 16px', display: 'block' }} />
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontStyle: 'italic', color: 'var(--mid)', marginBottom: 20 }}>سلة التسوق فارغة</p>
        <Link href="/" className="gg-btn gg-btn-pink">تسوقي الآن</Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px', minHeight: '100vh', background: 'var(--soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottom: '1.5px solid var(--line)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', margin: 0 }}>سلة التسوق</h1>
          <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--dim)' }}>{items.length} منتج</span>
        </div>
        <Link href="/" className="gg-btn gg-btn-outline" style={{ fontSize: 13, padding: '9px 18px' }}>
          <ShoppingBag size={14} /> متابعة التسوق
        </Link>
      </div>

      <div className="gg-cart-grid">
        {/* Items */}
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ width: 88, height: 110, flexShrink: 0, overflow: 'hidden', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--blush)' }}>
                <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontFamily: "'Nunito Sans',sans-serif", fontWeight: 600, color: 'var(--ink)', fontSize: 14, lineHeight: 1.45, marginBottom: 6 }}>{item.product?.name}</h4>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--pink)', margin: 0 }}>{item.finalPrice?.toLocaleString()} دج</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line-dk)', borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => update(items.map((it, idx) => idx === i ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it))} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--soft)', border: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: 16, fontFamily: 'inherit' }}>-</button>
                    <span style={{ width: 38, textAlign: 'center', fontWeight: 700, fontSize: 13, lineHeight: '32px', fontFamily: "'Nunito Sans',sans-serif" }}>{item.quantity}</span>
                    <button onClick={() => update(items.map((it, idx) => idx === i ? { ...it, quantity: it.quantity + 1 } : it))} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--soft)', border: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: 16, fontFamily: 'inherit' }}>+</button>
                  </div>
                  <button onClick={() => update(items.filter((_, idx) => idx !== i))}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--line-dk)', borderRadius: 7, background: 'var(--white)', color: 'var(--dim)', fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'var(--pink)'; e.currentTarget.style.borderColor = 'var(--pink)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.borderColor = 'var(--line-dk)'; }}>
                    <Trash2 size={12} /> حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 28, alignSelf: 'start' }}>
          <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 20 }}>معلومات التوصيل</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <FR label="الاسم" error={errors.name}><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={INP(!!errors.name)} /></FR>
              <FR label="الهاتف" error={errors.phone}><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={INP(!!errors.phone)} /></FR>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <FR label="الولاية" error={errors.w}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.w), paddingRight: 32, fontFamily: 'inherit' }}>
                    <option value="">اختري</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR label="البلدية" error={errors.c}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.c), paddingRight: 32, opacity: !fd.customerWelaya ? 0.4 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'اختري'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <div style={{ margin: '20px 0' }}>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 12 }}>نوع التوصيل</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['home', 'office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))}
                    style={{ padding: '13px 8px', border: `1.5px solid ${fd.typeLivraison === t ? 'var(--pink)' : 'var(--line-dk)'}`, borderRadius: 8, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'rgba(255,31,142,0.06)' : 'var(--white)', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    <span style={{ display: 'block', fontSize: '1.3rem', marginBottom: 4 }}>{t === 'home' ? '🏠' : '🏢'}</span>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', margin: '0 0 2px' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                    {selW && <p style={{ fontWeight: 600, fontSize: 12, color: 'var(--pink)', margin: 0 }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />

            <div style={{ marginBottom: 16 }}>
              {[['المجموع الفرعي', `${cartTotal.toLocaleString()} دج`], ['التوصيل', getLiv() ? `${getLiv().toLocaleString()} دج` : '—']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--dim)' }}>{k}</span>
                  <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontWeight: 700, color: 'var(--ink)' }}>الإجمالي</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.7rem', fontWeight: 700, color: 'var(--pink)' }}>{finalTotal.toLocaleString()} <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 400, color: 'var(--dim)' }}>دج</span></span>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="gg-btn gg-btn-pink" style={{ width: '100%', fontSize: 15, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري...</> : '🛒 تأكيد الطلب'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATIC PAGES
══════════════════════════════════════════════════════════════ */
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

const Shell = ({ children, title, sub }: { children: React.ReactNode; title: string; sub?: string }) => (
  <div dir="rtl" style={{ backgroundColor: 'var(--soft)', minHeight: '100vh' }}>
    <div style={{ background: 'linear-gradient(135deg,var(--blush) 0%,var(--blush-2) 100%)', padding: '56px 24px 40px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {sub && <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{sub}</p>}
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', margin: 0 }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 80px' }}>
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 32 }}>{children}</div>
    </div>
  </div>
);

const InfoBlock = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom: 18, marginBottom: 18, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--ink)', margin: '0 0 7px' }}>{title}</h3>
      <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, lineHeight: 1.85, color: 'var(--mid)', fontWeight: 400, margin: 0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid var(--line-dk)', color: 'var(--pink)', borderRadius: 20, flexShrink: 0 }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="قانوني">
      <InfoBlock title="البيانات التي نجمعها" body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك." />
      <InfoBlock title="كيف نستخدمها" body="حصرياً لتنفيذ وتوصيل مشترياتك. لا استخدام تجاري." />
      <InfoBlock title="الأمان" body="بياناتك محمية بتشفير قياسي وبنية تحتية آمنة." />
      <InfoBlock title="مشاركة البيانات" body="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين." />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الخدمة" sub="قانوني">
      <InfoBlock title="حسابك" body="أنت مسؤولة عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك." />
      <InfoBlock title="المدفوعات" body="لا رسوم مخفية. السعر المعروض هو السعر النهائي." />
      <InfoBlock title="الاستخدام المحظور" body="المنتجات الأصيلة فقط. لا مجال للمنتجات المقلدة." tag="صارم" />
      <InfoBlock title="القانون الحاكم" body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات الارتباط" sub="قانوني">
      <InfoBlock title="الكوكيز الأساسية" body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب" />
      <InfoBlock title="كوكيز التفضيلات" body="تحفظ إعداداتك لتجربة أفضل." tag="اختياري" />
      <InfoBlock title="كوكيز التحليلات" body="بيانات مجمعة لتحسين المنصة." tag="اختياري" />
      <div style={{ marginTop: 16, padding: 14, border: '1px solid var(--line)', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--blush)' }}>
        <ToggleRight size={18} style={{ color: 'var(--pink)', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--mid)', lineHeight: 1.8, margin: 0 }}>يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح.</p>
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store?: any }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id });
      setSent(true);
    } catch { showError('حدث خطأ في الإرسال'); } finally { setLoading(false); }
  };

  const contactItems = [
    { icon: <Phone size={14} />, label: 'الهاتف', val: store?.contact?.phone || '+213 550 000 000' },
    { icon: <Mail size={14} />, label: 'البريد', val: store?.contact?.email || 'info@store.dz' },
    { icon: <MapPin size={14} />, label: 'الموقع', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || 'الجزائر' },
  ];

  return (
    <div dir="rtl" style={{ background: 'var(--soft)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--blush) 0%,var(--blush-2) 100%)', padding: '56px 24px 40px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>تواصل</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 8px' }}>نسعد بمساعدتك 💄</h1>
          <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 14, color: 'var(--dim)' }}>نرد خلال 24 ساعة</p>
        </div>
      </div>

      <div className="gg-contact-grid" style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Info */}
        <div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, marginBottom: 12 }}>
            <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 16 }}>طرق التواصل</p>
            {contactItems.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--blush)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pink)', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 14, border: '1px solid var(--line)', borderRadius: 8, background: 'var(--blush)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--pink)', display: 'inline-block', animation: 'gg-glimmer 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--mid)' }}>متاحون للرد الآن</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 28 }}>
          <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 20 }}>أرسلي رسالة</p>
          {sent ? (
            <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: 8, textAlign: 'center', background: 'var(--blush)', padding: 32 }}>
              <CheckCircle2 size={32} style={{ color: 'var(--pink)', marginBottom: 12 }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 6px' }}>تم إرسال رسالتك! ✨</h3>
              <p style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'var(--dim)' }}>سنرد عليك خلال 24 ساعة.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="gg-form-2c">
                <FR label="الاسم"><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكامل" required style={INP()} /></FR>
                <FR label="الهاتف"><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="05XXXXXXXX" required style={INP()} /></FR>
              </div>
              <FR label="البريد الإلكتروني"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="بريدك@الإلكتروني" required style={INP()} /></FR>
              <FR label="رسالتك"><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="كيف يمكننا مساعدتك؟" rows={4} required style={{ ...INP(), resize: 'none' }} /></FR>
              <button type="submit" disabled={loading} className="gg-btn gg-btn-pink" style={{ justifyContent: 'center', width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> جاري...</> : <>إرسال الرسالة <ArrowLeft size={14} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
