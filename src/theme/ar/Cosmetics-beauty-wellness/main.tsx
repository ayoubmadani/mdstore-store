'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Share2, Phone, User, ToggleRight,
  Shield, ArrowLeft, Plus, Minus, CheckCircle2, Lock,
  Menu, Sparkles, Package, Truck, RefreshCw, Search,
  ShoppingCart, ShoppingBag, Trash2, Loader2, MapPin,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   BEAUTY & WELLNESS THEME
   Palette: Plum #6B2D8B · Rose #E8628A · Gold #E8B84B
   Fonts: Playfair Display (serif) + DM Sans (body)
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --plum:    #6B2D8B;
    --plum-2:  #7D3EA0;
    --plum-lt: #9B5BB8;
    --rose:    #E8628A;
    --rose-lt: #F07A9E;
    --gold:    #E8B84B;
    --white:   #FFFFFF;
    --off:     #FAFAFA;
    --soft:    #F7F2FB;
    --cream:   #FDF8F0;
    --ink:     #1A1228;
    --mid:     #5A4A6A;
    --dim:     #9A8AAA;
    --line:    rgba(107,45,139,0.1);
    --line-dk: rgba(107,45,139,0.2);
  }

  body { background: var(--white); color: var(--ink); font-family: 'DM Sans', sans-serif; }
  a    { text-decoration: none; color: inherit; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--plum-lt); border-radius: 2px; }

  .serif { font-family: 'Playfair Display', Georgia, serif; }

  /* ── Animations ── */
  @keyframes fade-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .fu   { animation: fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay: 0.08s; }
  .fu-2 { animation-delay: 0.18s; }
  .fu-3 { animation-delay: 0.3s; }

  @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin    { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in{ from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  .anim-check { animation: check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* ── Product card ── */
  .p-card { background:var(--white); border:1px solid var(--line); transition:transform 0.28s,box-shadow 0.28s; cursor:pointer; }
  .p-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(107,45,139,0.1); }
  .p-card:hover .c-img img { transform:scale(1.04); }
  .c-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.4s cubic-bezier(0.22,1,0.36,1); }

  /* ── Thumb grid ── */
  .thumb-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
  .thumb-btn { overflow:hidden; cursor:pointer; padding:0; background:none; border:2px solid transparent; transition:border-color 0.2s; }
  .thumb-btn.active { border-color:var(--plum); }
  .thumb-btn img { display:block; width:100%; aspect-ratio:1/1; object-fit:cover; }

  /* ── Buttons ── */
  .btn-plum {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--plum); color:var(--white);
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
    padding:12px 26px; border:none; cursor:pointer; text-decoration:none;
    border-radius:4px; transition:background 0.2s,transform 0.2s;
  }
  .btn-plum:hover { background:var(--plum-2); transform:translateY(-1px); }
  .btn-plum:disabled { opacity:0.7; cursor:not-allowed; transform:none; }

  .btn-outline {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:transparent; color:var(--plum); border:1.5px solid var(--plum);
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
    padding:11px 24px; cursor:pointer; text-decoration:none;
    border-radius:4px; transition:all 0.2s;
  }
  .btn-outline:hover { background:var(--plum); color:var(--white); }

  /* ── Inputs ── */
  .inp {
    width:100%; padding:11px 13px;
    background:var(--white); border:1.5px solid var(--line-dk);
    font-family:'DM Sans',sans-serif; font-size:13px; color:var(--ink);
    outline:none; border-radius:4px; transition:border-color 0.2s,box-shadow 0.2s;
  }
  .inp:focus { border-color:var(--plum); box-shadow:0 0 0 3px rgba(107,45,139,0.1); }
  .inp::placeholder { color:var(--dim); }
  .inp-err { border-color:var(--rose) !important; }
  select.inp { appearance:none; cursor:pointer; }

  /* ── Category pill ── */
  .cat-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 18px; border:1.5px solid var(--line-dk);
    border-radius:24px; font-size:13px; font-weight:500;
    color:var(--mid); background:var(--white); cursor:pointer;
    text-decoration:none; transition:all 0.2s; white-space:nowrap;
    font-family:'DM Sans',sans-serif;
  }
  .cat-pill:hover, .cat-pill.active { border-color:var(--plum); color:var(--plum); background:var(--soft); }

  /* ── Cart badge ── */
  .cart-badge {
    position:absolute; top:-5px; right:-5px;
    min-width:17px; height:17px; border-radius:9px;
    background:var(--rose); color:#fff;
    font-size:9px; font-weight:700; padding:0 4px;
    display:flex; align-items:center; justify-content:center;
    border:2px solid var(--white);
  }

  /* ── Responsive Layout ── */
  .nav-top   { display:flex; align-items:center; justify-content:space-between; }
  .nav-links { display:flex; align-items:center; gap:0; }
  .nav-mob   { display:none; }

  .prod-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  .trust-bar { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g  { display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; }
  .details-g { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
  .contact-g { display:grid; grid-template-columns:1fr 1fr; gap:56px; }
  .form-2c   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c    { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cart-g    { display:grid; grid-template-columns:1.2fr 1fr; gap:40px; align-items:start; }

  @media (max-width:1100px) {
    .prod-grid { grid-template-columns:repeat(3,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:32px; }
  }
  @media (max-width:768px) {
    .nav-links { display:none; }
    .nav-mob   { display:flex; }
    .prod-grid { grid-template-columns:repeat(2,1fr); gap:12px; }
    .trust-bar { grid-template-columns:repeat(2,1fr); }
    .footer-g  { grid-template-columns:1fr; gap:28px; }
    .details-g { grid-template-columns:1fr; }
    .contact-g { grid-template-columns:1fr; gap:28px; }
    .cart-g    { grid-template-columns:1fr; }
  }
  @media (max-width:480px) {
    .prod-grid { grid-template-columns:repeat(2,1fr); gap:8px; }
    .form-2c   { grid-template-columns:1fr; }
    .dlv-2c    { grid-template-columns:1fr; }
  }
`;

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

const variantMatches = (d: VariantDetail, sel: Record<string, string>): boolean =>
  Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

/* ── Shared input style ── */
const INP_ST = (err?: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 13px',
  background: 'var(--white)', border: `1.5px solid ${err ? 'var(--rose)' : 'var(--line-dk)'}`,
  fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'var(--ink)',
  outline: 'none', borderRadius: '4px', transition: 'border-color 0.2s', appearance: 'none'
});

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  if (!store) return null;
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--white)' }}>
      <style>{CSS}</style>
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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);

  /* ═══════ 1. تعريف الستايلات داخل المكون (مثل Navbar 2) ═══════ */
  const cartBtnStyle: React.CSSProperties = {
    position: 'relative',
    background: 'var(--plum)',
    color: '#fff',
    width: 40,
    height: 40,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    cursor: 'pointer',
    border: 'none',
    textDecoration: 'none'
  };

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 10,
    fontWeight: 700,
    width: 17,
    height: 17,
    background:'var(--plum)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--white)'
  };

  /* ═══════ 2. useEffects ═══════ */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { initCount(JSON.parse(localStorage.getItem(domain) || '[]').length); }
      catch { initCount(0); }
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
      catch { /* ignore */ }
      finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  /* ═══════ 3. دوال البحث ═══════ */
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  /* ═══════ 4. مكون نتائج البحث (DropResults) ═══════ */
  const DropResults = () => (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        left: 0,
        background: '#FFFFFF',
        border: '1px solid #EEEEEE',
        borderRadius: '12px',
        boxShadow: '0 15px 45px rgba(0,0,0,0.1)',
        zIndex: 210,
        overflow: 'hidden',
      }}
      className="anim-slide-down"
    >
      {/* رأس القائمة */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #F0F0F0',
        background: '#FAFAFA'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          نتائج البحث
        </span>
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          style={{
            background: '#F0F0F0',
            border: 'none',
            color: '#555',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--fire)', fontWeight: 700, fontSize: '13px' }}>
            جاري البحث...
          </div>
        ) : listSearch.length > 0 ? (
          <div>
            {listSearch.map((p: any) => (
              <Link
                href={`/product/${p.id}`}
                key={p.id}
                onClick={() => setSearchQuery('')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderBottom: '1px solid #F5F5F5',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9F9F9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                <img
                  src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                  style={{ width: 44, height: 44, borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid #EEE' }}
                  alt={p.name}
                />
                <div style={{ flex: 1 }}>
                  <div className="line-clamp-1" style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--fire)', fontWeight: 800 }}>
                    {p.price} دج
                  </div>
                </div>
                <ArrowLeft size={14} style={{ color: '#CCC' }} />
              </Link>
            ))}
            {/* زر عرض الكل */}
            <button
              onClick={() => handleSearch()}
              style={{
                width: '100%',
                padding: '15px',
                background: 'var(--fire)',
                border: 'none',
                color: 'var(--plum)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              عرض جميع النتائج <ArrowLeft size={14} />
            </button>
          </div>
        ) : searchQuery.length >= 2 && (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
            لا توجد نتائج لـ "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/contact', label: 'تواصل' },
  ];

  /* ═══════ 5. JSX Return ═══════ */
  return (
    <>
      {/* Ticker */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="ticker-wrap" style={{ backgroundColor: 'var(--plum)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '7px 0' }}>
          <div className="ticker-track" style={{ display: 'inline-block', animation: 'ticker 24s linear infinite' }}>
            {Array(12).fill(null).map((_, i) => (
              <span key={i} style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.88)', margin: '0 40px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '11px', height: '11px' }} /> {store.topBar.text}
              </span>
            ))}
            {Array(12).fill(null).map((_, i) => (
              <span key={`b${i}`} style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.88)', margin: '0 40px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '11px', height: '11px' }} /> {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main nav bar */}
      <nav
        dir="rtl"
        style={{
          fontFamily: "'DM Sans',sans-serif",
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(255,255,255,0.96)' : 'var(--white)',
          borderBottom: `2px solid ${scrolled ? 'var(--line)' : 'transparent'}`,
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 2px 12px rgba(107,45,139,0.08)' : 'none',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, textDecoration: 'none' }}>
            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
              <img
                src={store.design.logoUrl}
                style={{ height: 40, objectFit: 'contain', display: 'block' }}
                alt={store?.name || 'Store Logo'}
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '0 12px',
                  height: 40,
                  background: 'var(--plum)',
                  color: '#fff',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(107,45,139,0.25)',
                  whiteSpace: 'nowrap'
                }}>
                  {store?.name?.toUpperCase() || 'STORE'}
                </div>
              </div>
            )}
          </Link>

          {/* Desktop search */}
          <div className="nav-search-d lg:flex hidden" style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="بحث..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem 0.625rem 2.75rem',
                  borderRadius: 20,
                  border: '1.5px solid var(--line-dk)',
                  background: 'var(--white)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: "'DM Sans',sans-serif"
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--plum)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--line-dk)')}
              />
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
            </form>
            {searchQuery.length >= 2 && <DropResults />}
          </div>

          {/* Desktop nav */}
          <div className="nav-desktop lg:flex hidden" style={{ alignItems: 'center', gap: '4px' }}>
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--mid)',
                  textDecoration: 'none',
                  padding: '0 16px',
                  height: 70,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '2px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--plum)';
                  el.style.borderBottomColor = 'var(--plum)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--mid)';
                  el.style.borderBottomColor = 'transparent';
                }}
              >
                {l.label}
              </Link>
            ))}

            {/* Cart button (باستخدام الستايلات المعرفة مسبقاً) */}
            <Link
              href="/cart"
              style={cartBtnStyle}
              >
              <ShoppingBag size={17} />
              {count > 0 && <span style={badgeStyle}>{count}</span>}
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div className="nav-mobile flex lg:hidden" style={{ alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowSearch(!showSearch)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                border: '1.5px solid var(--line-dk)',
                background: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--plum)'
              }}
            >
              <Search size={16} />
            </button>

            <button
              onClick={() => setOpen(p => !p)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                border: '1.5px solid var(--line-dk)',
                background: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
            <Link
              href="/cart"
              style={{
                ...cartBtnStyle,
                transition: 'background 0.3s ease, color 0.3s ease',
              }}
            >
              <ShoppingBag size={17} />
              {count > 0 && <span style={badgeStyle}>{count}</span>}
            </Link>
          </div>
        </div>

        {/* Mobile Search Input */}
        {showSearch && (
          <div

            style={{
              padding: '0.625rem 1.25rem',
              background: 'var(--white)',
              borderTop: '1px solid var(--line)',
              position: 'relative'
            }}
            className="anim-slide-down lg:hidden"
          >
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input
                autoFocus
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  border: '1.5px solid var(--plum)',
                  borderRadius: 8,
                  background: 'var(--soft)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: "'DM Sans',sans-serif"
                }}
              />
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--plum)' }} />
            </form>
            {searchQuery.length >= 2 && <DropResults />}
          </div>
        )}

        {/* Mobile Nav Links */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: open ? 250 : 0,
            transition: 'max-height 0.28s ease',
            background: 'var(--white)',
            borderTop: open ? '1px solid var(--line)' : 'none'
          }}
        >
          <div style={{ padding: '0.375rem 1.25rem 0.875rem' }}>
            {[...navLinks, { href: '/cart', label: 'السلة' }].map(i => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => { setOpen(false); setShowSearch(false); }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--line)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--mid)',
                  textDecoration: 'none'
                }}
              >
                {i.label} <ArrowLeft size={14} style={{ color: 'var(--plum)' }} />
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
/* ══════════════════════════════════════════════════════════════
   FOOTER — 3 أقسام: العلامة · الروابط · التواصل
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  const yr = new Date().getFullYear();
  if (!store) return null;
  return (
    <footer dir="rtl" style={{ backgroundColor: 'var(--ink)', fontFamily: "'DM Sans',sans-serif", marginTop: '0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px 36px' }}>
        <div className="footer-g" style={{ paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          {/* قسم 1 — العلامة */}
          <div>
            <Link href="/" style={{ display: 'inline-flex', flexDirection: 'column', marginBottom: '14px' }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
                : <span className="serif" style={{ fontSize: '1.4rem', fontWeight: 700, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)' }}>{store.name}</span>
              }
            </Link>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: '12px' }}>Beauty & Wellness</p>
            <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'rgba(255,255,255,0.4)', maxWidth: '260px', fontWeight: 300 }}>
              {store.hero?.subtitle?.substring(0, 80) || 'أجود منتجات العناية والجمال لكل عصر ونوع بشرة.'}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '2rem' }}>© {yr} {store.name}. جميع الحقوق محفوظة.</p>
          </div>

          {/* قسم 2 — الروابط */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--plum-lt)', marginBottom: '18px' }}>روابط</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/', label: 'الرئيسية' },
                { href: '/cart', label: 'سلة التسوق' },
                { href: '/contact', label: 'تواصل معنا' },
                { href: '/Privacy', label: 'سياسة الخصوصية' },
                { href: '/Terms', label: 'شروط الخدمة' },
              ].map(l => (
                <a key={l.href} href={l.href} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--plum-lt)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* قسم 3 — التواصل */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--plum-lt)', marginBottom: '18px' }}>تواصل</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: <Phone size={13} />, val: store?.contact?.phone || '+213 550 000 000' },
                { icon: <MapPin size={13} />, val: store?.contact?.wilaya || 'الجزائر' },
                { icon: <span style={{ fontSize: '13px' }}>✉️</span>, val: store?.contact?.email || 'info@store.dz' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--plum-lt)', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{item.val}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--rose)', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>متاحون للرد الآن</span>
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
  if (!product || !store) return null;
  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number) || 0;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;

  return (
    <div className="p-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Image */}
      <div className="c-img" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--soft)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--soft),var(--cream))' }}>
            <Sparkles style={{ width: '36px', height: '36px', color: 'var(--plum-lt)', opacity: 0.4 }} />
          </div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--plum)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px' }}>
            -{discount}%
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
          {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '12px', height: '12px', fill: i < 4 ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />)}
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3em' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--plum)' }}>{price.toLocaleString()}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dim)' }}>دج</span>
          </div>
          {orig > price && <span style={{ fontSize: '12px', color: 'var(--dim)', textDecoration: 'line-through', opacity: 0.6 }}>{orig.toLocaleString()}</span>}
        </div>
        <Link href={`/product/${product.slug || product.id}`} className="btn-plum"
          style={{ textDecoration: 'none', width: '100%', fontSize: '13px', fontWeight: 600, padding: '12px', borderRadius: '6px', textAlign: 'center', display: 'block' }}>
          {viewDetails}
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  if (!store) return null;
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = useMemo(() => activeFilter ? products.filter((p: any) => p.categoryId === activeFilter) : products, [products, activeFilter]);

  return (
    <div dir="rtl">

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
        {store.hero?.imageUrl ? (
          <div style={{ position: 'relative', minHeight: '320px' }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: '400px' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(107,45,139,0.65), rgba(26,18,40,0.4))', display: 'flex', alignItems: 'center', padding: '0 8vw' }}>
              <div>
                <h1 className="fu serif" style={{ fontSize: 'clamp(1.6rem,4vw,3rem)', fontWeight: 700, fontStyle: 'italic', color: '#fff', lineHeight: 1.15, marginBottom: '10px' }}>
                  {store.hero.title?.replace(/<[^>]+>/g, '') || store.name}
                </h1>
                <p className="fu fu-1" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.82)', marginBottom: '20px', maxWidth: '380px', lineHeight: '1.7' }}>
                  {store.hero.subtitle || 'أجود منتجات العناية والجمال.'}
                </p>
                <a href="#products" className="btn-plum fu fu-2" style={{ fontSize: '14px', padding: '12px 28px' }}>
                  استعرض المجموعة
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8vw', padding: '4vw 8vw', background: 'linear-gradient(135deg,var(--soft) 0%,var(--cream) 50%,#FFF0F5 100%)', minHeight: '280px' }}>
            <div style={{ flex: '0 0 auto' }}>
              {store.design?.logoUrl && <img src={store.design.logoUrl} alt={store.name} style={{ height: '48px', marginBottom: '16px', display: 'block' }} />}
              <h1 className="fu serif" style={{ fontSize: 'clamp(1.6rem,4vw,3rem)', fontWeight: 700, fontStyle: 'italic', color: 'var(--plum)', lineHeight: 1.1, marginBottom: '10px' }}>
                {store.hero?.title?.replace(/<[^>]+>/g, '') || 'جمالك، أولويتنا.'}
              </h1>
              <p className="fu fu-1" style={{ fontSize: '14px', color: 'var(--mid)', marginBottom: '20px', maxWidth: '340px', lineHeight: '1.7' }}>
                {store.hero?.subtitle || 'أجود منتجات العناية والجمال المختارة بعناية.'}
              </p>
              <a href="#products" className="btn-plum fu fu-2" style={{ fontSize: '14px', padding: '12px 28px' }}>
                استعرض المجموعة
              </a>
            </div>
            {products[0] && (products[0].productImage || products[0].imagesProduct?.[0]?.imageUrl) && (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '240px' }}>
                <img src={products[0].productImage || products[0].imagesProduct?.[0]?.imageUrl} alt="" style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (
        <section style={{ padding: '24px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--off)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setActiveFilter(null)} className={`cat-pill${!activeFilter ? ' active' : ''}`}>
              الكل ({products.length})
            </button>
            {cats.map((cat: any) => (
              <button key={cat.id} onClick={() => setActiveFilter(cat.id)} className={`cat-pill${activeFilter === cat.id ? ' active' : ''}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding: '32px 0 64px', backgroundColor: 'var(--white)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
              {activeFilter ? cats.find((c: any) => c.id === activeFilter)?.name || 'المنتجات' : 'وصل جديد'}
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--dim)' }}>{filtered.length} منتج</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '64px 0', textAlign: 'center' }}>
              <Sparkles style={{ width: '40px', height: '40px', color: 'var(--dim)', opacity: 0.4, margin: '0 auto 12px' }} />
              <p style={{ fontSize: '1rem', color: 'var(--dim)' }}>لا توجد منتجات حالياً</p>
            </div>
          ) : (
            <div className="prod-grid">
              {filtered.map((p: any) => {
                const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض التفاصيل" />;
              })}
            </div>
          )}

          {/* Pagination */}
          {countPage > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '40px', flexWrap: 'wrap' }} dir="rtl">
              <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
                style={{ width: 36, height: 36, borderRadius: '4px', border: '1px solid var(--line-dk)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', color: 'var(--plum)', opacity: page <= 1 ? 0.3 : 1 }}>❮</Link>
              {Array.from({ length: countPage }).map((_, i) => {
                const pn = i + 1; const isA = Number(page) === pn;
                return (
                  <Link key={pn} href={{ query: { page: pn } }} scroll={false}
                    style={{ width: 36, height: 36, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, border: `1px solid ${isA ? 'var(--plum)' : 'var(--line-dk)'}`, background: isA ? 'var(--plum)' : 'var(--white)', color: isA ? '#fff' : 'var(--mid)' }}>
                    {pn}
                  </Link>
                );
              })}
              <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
                style={{ width: 36, height: 36, borderRadius: '4px', border: '1px solid var(--line-dk)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', color: 'var(--plum)', opacity: page >= countPage ? 0.3 : 1 }}>❯</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ backgroundColor: 'var(--soft)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="trust-bar">
            {[
              { icon: <Truck style={{ width: '20px', height: '20px' }} />, title: 'توصيل سريع', desc: '48 ساعة لباب منزلك' },
              { icon: <RefreshCw style={{ width: '20px', height: '20px' }} />, title: 'إرجاع مجاني', desc: '30 يوم إرجاع' },
              { icon: <Shield style={{ width: '20px', height: '20px' }} />, title: 'منتجات أصيلة', desc: '100% جودة مضمونة' },
              { icon: <Phone style={{ width: '20px', height: '20px' }} />, title: 'دعم متواصل', desc: 'نحن هنا لمساعدتك' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', borderLeft: i > 0 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ color: 'var(--plum)', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--dim)', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
    <div dir="rtl" style={{ backgroundColor: 'var(--white)' }}>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="details-g">
          {/* Gallery */}
          <div>
            <div style={{ position: 'relative', marginBottom: '10px', border: '1px solid var(--line)', overflow: 'hidden', backgroundColor: 'var(--soft)' }}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                {allImages.length > 0
                  ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles style={{ width: '56px', height: '56px', color: 'var(--plum-lt)', opacity: 0.3 }} />
                  </div>
                }
              </div>
              {discount > 0 && <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'var(--rose)', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '3px' }}>-{discount}%</div>}
              {!inStock && !autoGen && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}>
                  <span className="serif" style={{ fontSize: '1.5rem', fontStyle: 'italic', color: 'var(--mid)' }}>نفد المخزون</span>
                </div>
              )}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', border: '1px solid var(--line)', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--ink)' }} />
                  </button>
                  <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', border: '1px solid var(--line)', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <ChevronLeft style={{ width: '14px', height: '14px', color: 'var(--ink)' }} />
                  </button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="thumb-grid">
                {allImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSel(idx)} className={`thumb-btn${sel === idx ? ' active' : ''}`}>
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ paddingTop: '8px' }}>
            <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', color: 'var(--ink)', lineHeight: 1.25, marginBottom: '12px' }}>
              {product.name}
            </h1>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)' }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '14px', color: 'var(--dim)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '13px', height: '13px', fill: i < 4 ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />)}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', borderRadius: '20px', backgroundColor: inStock || autoGen ? 'rgba(107,45,139,0.08)' : 'rgba(100,80,80,0.08)', color: inStock || autoGen ? 'var(--plum)' : 'var(--mid)', fontSize: '12px', fontWeight: 600, border: `1px solid ${inStock || autoGen ? 'var(--plum-lt)' : 'var(--mid)'}`, marginBottom: '22px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
              {autoGen ? '∞ متوفر' : inStock ? 'متوفر' : 'نفد المخزون'}
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--line)', marginBottom: '20px' }} />

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '10px' }}>الباقات</p>
                {product.offers.map((offer: any) => (
                  <label key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1.5px solid ${selectedOffer === offer.id ? 'var(--plum)' : 'var(--line-dk)'}`, cursor: 'pointer', marginBottom: '8px', borderRadius: '6px', transition: 'all 0.2s', backgroundColor: selectedOffer === offer.id ? 'var(--soft)' : 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${selectedOffer === offer.id ? 'var(--plum)' : 'var(--dim)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {selectedOffer === offer.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--plum)' }} />}
                      </div>
                      <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{offer.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--dim)', margin: 0 }}>الكمية: {offer.quantity}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--plum)' }}>{offer.price.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--dim)' }}>دج</span></span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '18px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: '28px', height: '28px', backgroundColor: v.value, border: 'none', cursor: 'pointer', borderRadius: '50%', outline: s ? '3px solid var(--plum)' : '3px solid transparent', outlineOffset: '3px' }} />;
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: '48px', height: '48px', overflow: 'hidden', border: `2px solid ${s ? 'var(--plum)' : 'var(--line-dk)'}`, cursor: 'pointer', padding: 0, borderRadius: '4px' }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>;
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '6px 14px', border: `1.5px solid ${s ? 'var(--plum)' : 'var(--line-dk)'}`, borderRadius: '4px', fontFamily: "'DM Sans',sans-serif", fontSize: '13px', fontWeight: 500, background: s ? 'var(--soft)' : 'transparent', color: s ? 'var(--plum)' : 'var(--mid)', cursor: 'pointer', transition: 'all 0.2s' }}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {product.desc && (
              <div style={{ marginTop: '28px', paddingTop: '22px', borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: '14px', lineHeight: '1.85', color: 'var(--mid)', fontWeight: 400 }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
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
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '13px' }}>
    {label && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '6px' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '11px', color: 'var(--rose)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle style={{ width: '11px', height: '11px' }} />{error}
    </p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0 }: ProductFormProps) {
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
  useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: any) => o.id === selectedOffer); if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  const getLiv = useCallback((): number => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
  useEffect(() => { if (selW) setFd(f => ({ ...f, priceLoss: selW.livraisonReturn })); }, [selW]);

  const fp = getFP();
  const total = () => fp * fd.quantity + +getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!fd.customerPhone.trim()) e.customerPhone = 'رقم الهاتف مطلوب';
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
      if (typeof window !== 'undefined' && fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    } catch (err) { console.error(err); } finally { setSub(false); }
  };

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Cart + Order buttons */}
      {product.store?.cart && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', border: `1.5px solid ${isAdded ? 'var(--plum)' : 'var(--line-dk)'}`, background: isAdded ? 'var(--soft)' : 'transparent', color: isAdded ? 'var(--plum)' : 'var(--mid)', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '13px', cursor: 'pointer', borderRadius: '4px', transition: 'all 0.2s' }}>
            {isAdded ? <><CheckCircle2 style={{ width: '14px', height: '14px' }} className="anim-check" />تمت الإضافة</> : <><ShoppingCart style={{ width: '14px', height: '14px' }} />أضف للسلة</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} className="btn-plum" style={{ flex: 1, padding: '11px' }}>
            اطلب الآن
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div style={{ animation: 'fade-up 0.3s ease' }}>
          {product.store?.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mid)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: '1px solid var(--line-dk)', background: 'transparent', color: 'var(--dim)', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', borderRadius: '4px' }}>
                <X style={{ width: '11px', height: '11px' }} /> إلغاء
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Qty */}
            <FR label="الكمية">
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line-dk)', borderRadius: '4px', overflow: 'hidden' }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderLeft: '1px solid var(--line-dk)', background: 'var(--off)', cursor: 'pointer', color: 'var(--ink)', fontSize: '18px' }}>-</button>
                <span style={{ width: '52px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRight: '1px solid var(--line-dk)', background: 'var(--off)', cursor: 'pointer', color: 'var(--ink)', fontSize: '18px' }}>+</button>
              </div>
            </FR>

            <div className="form-2c">
              <FR error={errors.customerName} label="الاسم">
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل"
                    style={{ ...INP_ST(!!errors.customerName), paddingLeft: '34px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--plum)'; }} onBlur={e => { e.target.style.borderColor = errors.customerName ? 'var(--rose)' : 'var(--line-dk)'; }} />
                </div>
              </FR>
              <FR error={errors.customerPhone} label="الهاتف">
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0X XX XX XX XX"
                    style={{ ...INP_ST(!!errors.customerPhone), paddingLeft: '34px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--plum)'; }} onBlur={e => { e.target.style.borderColor = errors.customerPhone ? 'var(--rose)' : 'var(--line-dk)'; }} />
                </div>
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}
                    style={{ ...INP_ST(!!errors.customerWelaya), paddingRight: '32px', fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--plum)'; }} onBlur={e => { e.target.style.borderColor = errors.customerWelaya ? 'var(--rose)' : 'var(--line-dk)'; }}>
                    <option value="">اختر الولاية</option>
                    {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })}
                    style={{ ...INP_ST(!!errors.customerCommune), paddingRight: '32px', opacity: !fd.customerWelaya ? 0.4 : 1, fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--plum)'; }} onBlur={e => { e.target.style.borderColor = errors.customerCommune ? 'var(--rose)' : 'var(--line-dk)'; }}>
                    <option value="">{loadingC ? '...' : 'اختر البلدية'}</option>
                    {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="التوصيل">
              <div className="dlv-2c">
                {(['home', 'office'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))}
                    style={{ padding: '12px 10px', border: `1.5px solid ${fd.typeLivraison === type ? 'var(--plum)' : 'var(--line-dk)'}`, backgroundColor: fd.typeLivraison === type ? 'var(--soft)' : 'transparent', cursor: 'pointer', textAlign: 'right', borderRadius: '4px', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', fontWeight: 600, color: fd.typeLivraison === type ? 'var(--plum)' : 'var(--mid)', margin: '0 0 4px' }}>
                      {type === 'home' ? 'للبيت' : 'للمكتب'}
                    </p>
                    {selW && <p style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--plum)' : 'var(--dim)', margin: 0 }}>
                      {(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()}
                      <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--dim)', marginRight: '3px' }}>دج</span>
                    </p>}
                  </button>
                ))}
              </div>
            </FR>

            {/* Summary */}
            <div style={{ border: '1px solid var(--line-dk)', borderRadius: '6px', marginBottom: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--soft)', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mid)', margin: 0 }}>ملخص الطلب</p>
              </div>
              {[
                { l: 'المنتج', v: product.name.slice(0, 22) },
                { l: 'السعر', v: `${fp.toLocaleString()} دج` },
                { l: 'الكمية', v: `× ${fd.quantity}` },
                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
              ].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--white)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--dim)' }}>{row.l}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', backgroundColor: 'var(--soft)' }}>
                <span style={{ fontSize: '13px', color: 'var(--mid)' }}>المجموع</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--plum)' }}>{total().toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--dim)' }}>دج</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-plum" style={{ width: '100%', fontSize: '15px', padding: '13px', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1, borderRadius: '4px', marginBottom: '8px' }}>
              {sub ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> جاري...</> : '🛒 تأكيد الطلب'}
            </button>
            <p style={{ fontSize: '11px', color: 'var(--dim)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <Lock style={{ width: '10px', height: '10px', color: 'var(--plum)' }} /> دفع آمن ومشفر
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CART — مكتمل مع نموذج التوصيل
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

  useEffect(() => { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [domain, store]);
  useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLiv = () => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; };
  const cartTotal = items.reduce((a, i) => a + (i.finalPrice * i.quantity), 0);
  const finalTotal = cartTotal + +getLiv();
  const update = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!fd.customerName.trim()) er.name = 'مطلوب';
    if (!fd.customerPhone.trim()) er.phone = 'مطلوب';
    if (!fd.customerWelaya) er.w = 'مطلوب';
    if (!fd.customerCommune) er.c = 'مطلوب';
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  if (success) return (
    <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', background: 'var(--white)', padding: '4rem 2.5rem', border: '1px solid var(--line)', borderRadius: '8px', maxWidth: 460, width: '100%', boxShadow: '0 8px 32px rgba(107,45,139,0.1)' }}>
        <CheckCircle2 style={{ width: '48px', height: '48px', color: 'var(--plum)', margin: '0 auto 20px', display: 'block' }} />
        <h2 className="serif" style={{ fontSize: '1.8rem', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '8px' }}>تم استلام طلبك!</h2>
        <p style={{ fontSize: '14px', color: 'var(--dim)', marginBottom: '28px', lineHeight: 1.7 }}>شكراً لثقتك. سنتواصل معك قريباً لتأكيد الطلب.</p>
        <Link href="/" className="btn-plum" style={{ display: 'inline-flex', padding: '12px 28px' }}>العودة للمتجر</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--line-dk)', borderRadius: '8px', maxWidth: 400, width: '100%' }}>
        <ShoppingBag style={{ width: '48px', height: '48px', color: 'var(--dim)', opacity: 0.4, margin: '0 auto 16px', display: 'block' }} />
        <p className="serif" style={{ fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--mid)', marginBottom: '20px' }}>سلة التسوق فارغة</p>
        <Link href="/" className="btn-plum" style={{ display: 'inline-flex' }}>تسوق الآن</Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '1.6rem', fontWeight: 600, color: 'var(--ink)' }}>سلة التسوق</h1>
        <span style={{ fontSize: '13px', color: 'var(--dim)' }}>{items.length} منتج</span>
      </div>

      <div className="cart-g">
        {/* Items */}
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ width: 96, height: 96, flexShrink: 0, overflow: 'hidden', borderRadius: '4px', border: '1px solid var(--line)', background: 'var(--soft)' }}>
                <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '14px', lineHeight: 1.45, marginBottom: '6px' }}>{item.product?.name}</h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--plum)' }}>{item.finalPrice?.toLocaleString()} دج</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line-dk)', borderRadius: '4px', overflow: 'hidden' }}>
                    <button onClick={() => update(items.map((it, idx) => idx === i ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it))} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off)', border: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: '16px' }}>-</button>
                    <span style={{ width: '36px', textAlign: 'center', fontWeight: 600, fontSize: '13px', background: 'var(--white)', lineHeight: '30px' }}>{item.quantity}</span>
                    <button onClick={() => update(items.map((it, idx) => idx === i ? { ...it, quantity: it.quantity + 1 } : it))} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off)', border: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: '16px' }}>+</button>
                  </div>
                  <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: 'none', background: 'transparent', color: 'var(--dim)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--rose)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--dim)'; }}>
                    <Trash2 style={{ width: '13px', height: '13px' }} /> حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div style={{ background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: '8px', padding: '28px', alignSelf: 'start' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '20px' }}>معلومات التوصيل</p>
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.name} label="الاسم">
                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={INP_ST(!!errors.name)} />
              </FR>
              <FR error={errors.phone} label="الهاتف">
                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={INP_ST(!!errors.phone)} />
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.w} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP_ST(!!errors.w), paddingRight: '32px', fontFamily: 'inherit' }}>
                    <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP_ST(!!errors.c), paddingRight: '32px', opacity: !fd.customerWelaya ? 0.4 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            {/* نوع التوصيل — جديد */}
            <div style={{ margin: '20px 0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '12px' }}>نوع التوصيل</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(['home', 'office'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFd(p => ({ ...p, typeLivraison: t }))}
                    style={{
                      padding: '14px 8px',
                      border: `1.5px solid ${fd.typeLivraison === t ? 'var(--plum)' : 'var(--line-dk)'}`,
                      borderRadius: '6px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: fd.typeLivraison === t ? 'rgba(107,45,139,0.06)' : 'var(--white)',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '1.4rem', marginBottom: '4px' }}>{t === 'home' ? '🏠' : '🏢'}</span>
                    <p style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', marginBottom: '2px' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                    {selW && <p style={{ fontWeight: 600, fontSize: '12px', color: 'var(--plum)' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--line)', margin: '16px 0' }} />

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--dim)' }}>المجموع الفرعي</span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{cartTotal.toLocaleString()} دج</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontSize: '13px', color: 'var(--dim)' }}>التوصيل</span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{getLiv() ? `${getLiv().toLocaleString()} دج` : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>الإجمالي</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--plum)' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--dim)' }}>دج</span></span>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-plum" style={{ width: '100%', fontSize: '15px', padding: '13px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> جاري...</> : '🛒 تأكيد الطلب'}
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
  <div dir="rtl" style={{ backgroundColor: 'var(--white)', minHeight: '100vh' }}>
    <div style={{ backgroundColor: 'var(--soft)', padding: '56px 24px 40px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {sub && <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '8px' }}>{sub}</p>}
        <h1 className="serif" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', margin: 0 }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '36px 24px 80px' }}>
      <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '8px', padding: '32px' }}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom: '18px', marginBottom: '18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 7px' }}>{title}</h3>
      <p style={{ fontSize: '13px', lineHeight: '1.85', color: 'var(--mid)', fontWeight: 400, margin: 0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid var(--plum-lt)', color: 'var(--plum)', borderRadius: '20px', flexShrink: 0 }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="قانوني">
      <IB title="البيانات التي نجمعها" body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك." />
      <IB title="كيف نستخدمها" body="حصرياً لتنفيذ وتوصيل مشترياتك. لا استخدام تجاري." />
      <IB title="الأمان" body="بياناتك محمية بتشفير قياسي وبنية تحتية آمنة." />
      <IB title="مشاركة البيانات" body="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين." />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الخدمة" sub="قانوني">
      <IB title="حسابك" body="أنت مسؤول عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك." />
      <IB title="المدفوعات" body="لا رسوم مخفية. السعر المعروض هو السعر النهائي." />
      <IB title="الاستخدام المحظور" body="المنتجات الأصيلة فقط. لا مجال للمنتجات المقلدة." tag="صارم" />
      <IB title="القانون الحاكم" body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات الارتباط" sub="قانوني">
      <IB title="الكوكيز الأساسية" body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب" />
      <IB title="كوكيز التفضيلات" body="تحفظ إعداداتك لتجربة أفضل." tag="اختياري" />
      <IB title="كوكيز التحليلات" body="بيانات مجمعة لتحسين المنصة." tag="اختياري" />
      <div style={{ marginTop: '16px', padding: '14px', border: '1px solid var(--line)', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: 'var(--soft)' }}>
        <ToggleRight style={{ width: '18px', height: '18px', color: 'var(--plum)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.8', margin: 0 }}>يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح.</p>
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
    } catch { alert('حدث خطأ في الإرسال'); } finally { setLoading(false); }
  };

  const contactItems = [
    { icon: '📞', label: 'الهاتف', val: store?.contact?.phone || '+213 550 000 000' },
    { icon: '✉️', label: 'البريد', val: store?.contact?.email || 'info@store.dz' },
    { icon: '📍', label: 'الموقع', val: store?.contact?.wilaya || 'الجزائر' },
  ];

  return (
    <div dir="rtl" style={{ backgroundColor: 'var(--white)', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'var(--soft)', padding: '56px 24px 40px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '8px' }}>تواصل</p>
          <h1 className="serif" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 8px' }}>نسعد بمساعدتك</h1>
          <p style={{ fontSize: '14px', color: 'var(--dim)' }}>نرد خلال 24 ساعة 💄</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Info */}
        <div>
          <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '16px' }}>طرق التواصل</p>
            {contactItems.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--soft)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--plum)', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--soft)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--rose)', display: 'inline-block' }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--mid)' }}>متاحون للرد الآن</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '8px', padding: '28px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: '20px' }}>أرسل رسالة</p>
          {sent ? (
            <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: '8px', textAlign: 'center', backgroundColor: 'var(--soft)', padding: '32px' }}>
              <CheckCircle2 style={{ width: '32px', height: '32px', color: 'var(--plum)', marginBottom: '12px' }} />
              <h3 className="serif" style={{ fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 6px' }}>تم إرسال رسالتك!</h3>
              <p style={{ fontSize: '13px', color: 'var(--dim)' }}>سنرد عليك خلال 24 ساعة 💄</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>الاسم</p>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل" required style={INP_ST()}
                    onFocus={e => (e.target.style.borderColor = 'var(--plum)')} onBlur={e => (e.target.style.borderColor = 'var(--line-dk)')} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>الهاتف</p>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="05XXXXXXXX" required style={INP_ST()}
                    onFocus={e => (e.target.style.borderColor = 'var(--plum)')} onBlur={e => (e.target.style.borderColor = 'var(--line-dk)')} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>البريد الإلكتروني</p>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="بريدك@الإلكتروني" required style={INP_ST()}
                  onFocus={e => (e.target.style.borderColor = 'var(--plum)')} onBlur={e => (e.target.style.borderColor = 'var(--line-dk)')} />
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>رسالتك</p>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="كيف يمكننا مساعدتك؟" rows={4} required
                  style={{ ...INP_ST(), resize: 'none' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--plum)')} onBlur={e => (e.target.style.borderColor = 'var(--line-dk)')} />
              </div>
              <button type="submit" disabled={loading} className="btn-plum" style={{ justifyContent: 'center', width: '100%', fontSize: '14px', padding: '12px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> جاري...</> : <>إرسال الرسالة <ArrowLeft style={{ width: '14px', height: '14px' }} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}