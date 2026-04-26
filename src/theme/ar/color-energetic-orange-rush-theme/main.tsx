'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Phone,
  CheckCircle2, ArrowRight, Zap,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, MapPin, Shield, Truck,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/*
  ██████╗  ██████╗ ██╗     ██████╗     ██╗   ██╗██████╗ ██████╗  █████╗ ███╗  ██╗
  ██╔══██╗██╔═══██╗██║     ██╔══██╗    ██║   ██║██╔══██╗██╔══██╗██╔══██╗████╗ ██║
  ██████╦╝██║   ██║██║     ██║  ██║    ██║   ██║██████╔╝██████╦╝███████║██╔██╗██║
  ██╔══██╗██║   ██║██║     ██║  ██║    ██║   ██║██╔══██╗██╔══██╗██╔══██║██║╚████║
  ██████╦╝╚██████╔╝███████╗██████╔╝    ╚██████╔╝██║  ██║██████╔╝██║  ██║██║ ╚███║
  ═══════ THEME: BOLD / COLOR: #F97316 + #1D1D1D + #F8F8F6
*/

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Readex Pro', sans-serif;
    background: #F8F8F6;
    color: #111;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── تم التعديل للبرتقالي */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #F8F8F6; }
  ::-webkit-scrollbar-thumb { background: #F97316; border-radius: 2px; }

  /* ── Keyframes ── */
  @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideFade { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes ticker     { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes checkPop   { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0} }

  .anim-slide-down { animation: slideDown 0.25s ease both; }
  .anim-slide-fade { animation: slideFade 0.35s ease both; }
  .anim-check      { animation: checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* ── Ticker ── تم تحديث الخلفية للبرتقالي والنص للأبيض */
  .ticker-wrap { overflow: hidden; background: #F97316; color: #fff; height: 36px; display: flex; align-items: center; }
  .ticker-track { display: flex; white-space: nowrap; animation: ticker 28s linear infinite; }
  .ticker-item  { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; padding: 0 2.5rem; }

  /* ── Responsive Layout ── */
  .nav-desktop  { display: none; align-items: center; gap: 2rem; }
  .nav-search-d { display: none; flex: 1; max-width: 400px; margin: 0 1.5rem; }
  .nav-mobile   { display: flex; gap: 0.625rem; }

  @media (min-width: 1024px) {
    .nav-desktop  { display: flex; }
    .nav-search-d { display: block; }
    .nav-mobile   { display: none; }
  }

  .trust-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0;
  }
  @media (min-width: 1024px) {
    .trust-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .cats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.625rem;
  }
  @media (min-width: 640px) {
    .cats-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1024px) {
    .cats-grid { grid-template-columns: repeat(6, 1fr); }
  }

  .products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 500px) {
    .products-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1024px) {
    .products-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
  }
  @media (min-width: 1280px) {
    .products-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .hero-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: center;
    min-height: 88vh;
    padding: 7rem 1.5rem 4rem;
  }
  @media (min-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr 1fr; min-height: 100vh; padding: 0 4rem; }
  }

  .details-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  @media (min-width: 768px) {
    .details-inner { grid-template-columns: 1fr 1fr; gap: 3rem; padding: 2rem; }
  }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.875rem;
    margin-bottom: 0.875rem;
  }
  @media (min-width: 500px) {
    .form-row-2 { grid-template-columns: 1fr 1fr; }
  }

  .cart-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) {
    .cart-inner { grid-template-columns: 1.2fr 1fr; gap: 3rem; }
  }

  .contact-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) {
    .contact-inner { grid-template-columns: 1fr 2fr; }
  }

  .footer-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    padding-bottom: 3rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  @media (min-width: 768px) {
    .footer-inner { grid-template-columns: 2fr 1fr 1fr; }
  }

  .hero-actions { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .hero-actions { flex-direction: row; align-items: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

  .thumb-row { display: flex; gap: 0.625rem; margin-top: 0.875rem; overflow-x: auto; padding-bottom: 4px; }

  .pagination { display: flex; justify-content: center; gap: 0.375rem; flex-wrap: wrap; margin-top: 3rem; }

  /* ── Utility ── */
  a { text-decoration: none; color: inherit; }

  /* ── Price mono ── */
  .price-mono {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
    letter-spacing: -0.02em;
  }

  /* ── Card stripe ── تم التعديل للبرتقالي */
  .card-stripe::before {
    content: '';
    position: absolute;
    inset: 0;
    bottom: auto;
    height: 3px;
    background: #F97316;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
  }
  .card-wrap:hover .card-stripe::before { transform: scaleX(1); }
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

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

/* ─── SHARED STYLES ─── */
const S = {
  input: {
    width: '100%', padding: '0.8rem 1rem',
    background: '#fff', border: '1.5px solid #E0E0E0',
    borderRadius: 8, fontSize: '0.9rem', color: '#111',
    outline: 'none', transition: 'border-color 0.18s', appearance: 'none'
  } as React.CSSProperties,
  inputErr: { borderColor: '#F97316' } as React.CSSProperties,
  btnPrimary: {
    width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: '#F97316', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
    padding: '0.9rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: 'inherit'
  } as React.CSSProperties,
};

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F8F6' }}>
      <style>{THEME_CSS}</style>
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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { const s = localStorage.getItem(domain); initCount(JSON.parse(s || '[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); setListSearch(data.products || []); }
      catch { /* ignore */ } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setListSearch([]); setShowSearch(false); }
  };

  const DropResults = () => (
    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, left: 0, background: '#fff', border: '1.5px solid #E0E0E0', borderRadius: 10, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 60, overflow: 'hidden' }} className="anim-slide-down">
      {loading ? <div style={{ padding: '1rem', textAlign: 'center', color: '#F97316', fontSize: '0.85rem' }}>جاري البحث...</div>
        : listSearch.length > 0 ? listSearch.map((p: any) => (
          <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSearchQuery('')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0' }}>
            <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} alt="" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>{p.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#F97316', fontWeight: 700 }}>{p.price} دج</div>
            </div>
          </Link>
        )) : searchQuery.length >= 2 && <div style={{ padding: '1rem', textAlign: 'center', color: '#aaa', fontSize: '0.85rem' }}>لا توجد نتائج</div>}
    </div>
  );

  return (
    <>
      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="ticker-item">⚡ توصيل لجميع ولايات الجزائر · منتجات أصلية · دفع عند الاستلام</span>
          ))}
        </div>
      </div>

      <nav dir="rtl" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(248,248,246,0.96)' : '#F8F8F6',
        borderBottom: `2px solid ${scrolled ? '#E8E8E8' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0 }}>
            {store?.design?.logoUrl
              ? <img src={store.design.logoUrl} style={{ height: 32 }} alt="" />
              : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 28, height: 28, background: '#F97316', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={16} color="#fff" fill="#fff" />
                  </div>
                  <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111', letterSpacing: '-0.03em' }}>{store?.name}</span>
                </div>
              )
            }
          </Link>

          {/* Desktop search */}
          <div className="nav-search-d" style={{ position: 'relative' }}>
            <form onSubmit={handleSearch}>
              <input type="text" placeholder="ابحث هنا..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: 8, border: '1.5px solid #E0E0E0', background: '#fff', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = '#F97316')}
                onBlur={e => (e.target.style.borderColor = '#E0E0E0')} />
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            </form>
            {searchQuery.length >= 2 && <DropResults />}
          </div>

          {/* Desktop nav */}
          <div className="nav-desktop">
            {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل' }].map(i => (
              <Link key={i.h} href={i.h} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#444', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F97316')}
                onMouseLeave={e => (e.currentTarget.style.color = '#444')}>{i.l}</Link>
            ))}
            <Link href="/cart" style={{ position: 'relative', background: '#111', color: '#fff', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#F97316')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#111')}>
              <ShoppingCart size={17} />
              {count > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#F97316', color: '#fff', fontSize: 10, fontWeight: 700, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #F8F8F6' }}>{count}</span>}
            </Link>
          </div>

          {/* Mobile */}
          <div className="nav-mobile">
            <button onClick={() => setShowSearch(!showSearch)} style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid #E0E0E0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Search size={16} />
            </button>
            <button onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid #E0E0E0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {showSearch && (
          <div style={{ padding: '0.625rem 1.25rem', background: '#fff', borderTop: '1px solid #E8E8E8', position: 'relative' }} className="anim-slide-down">
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input autoFocus type="text" placeholder="ابحث عن منتج..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #F97316', borderRadius: 8, background: '#F8F8F6', fontSize: '0.9rem', outline: 'none' }} />
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#F97316' }} />
            </form>
            {searchQuery.length >= 2 && <DropResults />}
          </div>
        )}

        {/* Mobile nav */}
        <div style={{ overflow: 'hidden', maxHeight: open ? 180 : 0, transition: 'max-height 0.28s ease', background: '#fff', borderTop: open ? '1px solid #E8E8E8' : 'none' }}>
          <div style={{ padding: '0.375rem 1.25rem 0.875rem' }}>
            {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل معنا' }, { h: '/cart', l: 'السلة' }].map(i => (
              <Link key={i.h} href={i.h} onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #F0F0F0', fontSize: '0.9rem', fontWeight: 600, color: '#111' }}>
                {i.l} <ArrowRight size={14} style={{ color: '#F97316' }} />
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER — 3 أقسام
═══════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  return (
    <footer dir="rtl" style={{ background: '#111', color: '#aaa', marginTop: 80, padding: '4rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-inner">

          {/* قسم 1 — العلامة */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{ width: 32, height: 32, background: '#F97316', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: '#666', maxWidth: 320 }}>
              {store?.hero?.subtitle?.substring(0, 100) || 'تجربة تسوق عصرية وسريعة. توصيل لجميع الولايات الجزائرية.'}
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#333' }}>
              © {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.
            </p>
          </div>

          {/* قسم 2 — الروابط */}
          <div>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>الصفحات</h4>
            {[{ h: '/', l: 'الرئيسية' }, { h: '/cart', l: 'سلة التسوق' }, { h: '/contact', l: 'تواصل معنا' }, { h: '/Privacy', l: 'الخصوصية' }, { h: '/Terms', l: 'الشروط' }].map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '0.625rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F97316')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666')}>
                {lnk.l}
              </Link>
            ))}
          </div>

          {/* قسم 3 — التواصل */}
          <div>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>تواصل</h4>
            {[
              { icon: <Phone size={14} />, val: store?.contact?.phone },
              { icon: <MapPin size={14} />, val: store?.contact?.wilaya },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', color: '#666', fontSize: '0.875rem' }}>
                <span style={{ color: '#F97316' }}>{r.icon}</span>{r.val}
              </div>
            ))}
            <div style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1A1A1A', padding: '0.5rem 0.875rem', borderRadius: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              <span style={{ fontSize: '0.78rem', color: '#aaa' }}>نرد الآن</span>
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
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;

  return (
    <div className="card-wrap" style={{ background: '#fff', border: '1.5px solid #EBEBEB', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', transition: 'all 0.28s ease' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#F97316'; el.style.boxShadow = '0 8px 32px rgba(230,57,70,0.1)'; el.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#EBEBEB'; el.style.boxShadow = 'none'; el.style.transform = ''; }}>

      <div className="card-stripe" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }} />

      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#F4F4F2', overflow: 'hidden' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={36} color="#ddd" /></div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: '#F97316', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 4 }}>
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', gap: 2, marginBottom: '0.875rem' }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={11} style={{ fill: i < 4 ? '#F59E0B' : 'none', color: '#F59E0B' }} />)}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <span className="price-mono" style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111' }}>{price.toLocaleString()}</span>
            <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>{store.currency || 'دج'}</span>
            {orig > price && <span style={{ fontSize: '0.75rem', color: '#ccc', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
          <Link href={`/product/${product.slug || product.id}`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '0.625rem', borderRadius: 8,
            background: '#111', color: '#fff', fontSize: '0.825rem', fontWeight: 700,
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#F97316')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#111')}>
            {viewDetails} <ArrowRight size={13} />
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
      <section style={{ position: 'relative', background: '#111', overflow: 'hidden' }}>
        {store.hero?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
          </div>
        )}

        {/* Geometric accent - تدرج برتقالي */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(135deg, #F97316 0%, transparent 60%)', opacity: 0.12, pointerEvents: 'none' }} />

        {/* Circle accent - تم تحديث لون الدائرة للبرتقالي الشفاف */}
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 300, height: 300, border: '60px solid rgba(249, 115, 22, 0.07)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="hero-inner" style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Text */}
          <div>
            {/* Badge - خلفية وحدود برتقالية ناعمة */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: 6, padding: '0.375rem 0.875rem', marginBottom: '1.5rem' }}>
              <Zap size={13} color="#F97316" fill="#F97316" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{store.name}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.25rem,6vw,4.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}
              dangerouslySetInnerHTML={{ __html: store.hero?.title || 'تسوق<br/><span style="color:#F97316">بثقة</span> واحصل<br/>على الأفضل' }} />

            <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              {store.hero?.subtitle || 'منتجات أصلية بأسعار مناسبة. توصيل لجميع الولايات في أسرع وقت.'}
            </p>

            <div className="hero-actions">
              {/* زر "تسوق الآن" بظل برتقالي وتأثير تحويم غامق */}
              <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F97316', color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '0.875rem 1.75rem', borderRadius: 10, transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(249, 115, 22, 0.35)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#EA580C')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#F97316')}>
                تسوق الآن <ArrowRight size={16} />
              </a>

              <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', padding: '0.875rem 1.75rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', transition: 'background 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.14)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)')}>
                السلة
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB' }}>
        <div className="trust-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
          {[
            { icon: <Truck size={18} />, t: 'توصيل لكل الولايات', d: 'الـ 58 ولاية جزائرية' },
            { icon: <Shield size={18} />, t: 'ضمان الجودة', d: 'منتجات 100% أصلية' },
            { icon: <CheckCircle2 size={18} />, t: 'دفع آمن', d: 'عند الاستلام' },
            { icon: <Phone size={18} />, t: 'دعم 24/7', d: 'نحن دائماً هنا' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1.125rem 1rem', textAlign: 'center', borderLeft: i < 3 ? '1px solid #EBEBEB' : 'none' }}>
              <div style={{ color: '#F97316', marginBottom: '0.375rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>{item.t}</p>
              <p style={{ fontSize: '0.72rem', color: '#999' }}>{item.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (
        <section style={{ padding: '4rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ width: 4, height: 28, background: '#F97316', borderRadius: 2 }} />
            <h2 style={{ fontSize: 'clamp(1.375rem,3.5vw,2rem)', fontWeight: 800, color: '#111' }}>الفئات</h2>
          </div>
          <div className="cats-grid">
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} style={{
                padding: '0.75rem 0.875rem', border: '1.5px solid #EBEBEB', borderRadius: 8,
                textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#333',
                background: '#fff', transition: 'all 0.18s'
              }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#F97316'; el.style.color = '#F97316'; el.style.background = 'rgba(230,57,70,0.04)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#EBEBEB'; el.style.color = '#333'; el.style.background = '#fff'; }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding: '1rem 1.5rem 5rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: 4, height: 28, background: '#F97316', borderRadius: 2 }} />
          <h2 style={{ fontSize: 'clamp(1.375rem,3.5vw,2rem)', fontWeight: 800, color: '#111' }}>المنتجات</h2>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', border: '2px dashed #EBEBEB', borderRadius: 16 }}>
            <p style={{ color: '#ccc', fontSize: '1rem' }}>لا توجد منتجات بعد</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض المنتج" />;
            })}
          </div>
        )}

        {countPage > 1 && (
          <div className="pagination" dir="rtl">
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#111' }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, border: `1.5px solid ${isA ? '#F97316' : '#EBEBEB'}`, background: isA ? '#F97316' : '#fff', color: isA ? '#fff' : '#111' }}>
                  {pn}
                </Link>
              );
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#111' }}>❯</Link>
          </div>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DETAILS
═══════════════════════════════════════════════════════════ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);

  return (
    <div dir="rtl" style={{ background: '#F8F8F6', paddingBottom: '4rem' }}>
      <div className="details-inner" style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Gallery */}
        <div style={{ position: 'sticky', top: 100 }}>
          <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 14, overflow: 'hidden', background: '#F0F0EE', border: '1.5px solid #E8E8E8' }}>
            {allImages[sel]
              ? <img src={allImages[sel]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={48} color="#ccc" /></div>}
            {discount > 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: '#F97316', color: '#fff', padding: '3px 12px', borderRadius: 5, fontSize: 12, fontWeight: 800 }}>{discount}% خصم</div>}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 8, background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}><ChevronRight size={18} /></button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 8, background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}><ChevronLeft size={18} /></button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="thumb-row">
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: `2px solid ${sel === idx ? '#F97316' : '#E8E8E8'}`, opacity: sel === idx ? 1 : 0.55, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.18s' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ background: '#fff', borderRadius: 14, padding: '1.75rem', border: '1.5px solid #E8E8E8' }}>

            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 800, color: '#111', marginBottom: '0.75rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', gap: 3, marginBottom: '1.25rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={15} style={{ fill: i < 4 ? '#F59E0B' : 'none', color: '#F59E0B' }} />)}
            </div>

            {/* Price box */}
            <div style={{ background: '#FFF7ED', border: '1.5px solid #FFEDD5', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#F97316', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>السعر</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                <span className="price-mono" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111' }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontWeight: 700, color: '#F97316' }}>دج</span>
              </div>
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: `1.5px solid ${selectedOffer === o.id ? '#F97316' : '#E8E8E8'}`, borderRadius: 10, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? 'rgba(230,57,70,0.04)' : 'transparent', transition: 'all 0.18s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? '#F97316' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedOffer === o.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#F97316' }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontWeight: 600, color: '#111', fontSize: '0.875rem' }}>{o.name}</p>
                        <p style={{ fontSize: '0.72rem', color: '#999' }}>الكمية: {o.quantity}</p>
                      </div>
                    </div>
                    <span className="price-mono" style={{ fontWeight: 800, color: '#F97316', fontSize: '1.1rem' }}>{o.price.toLocaleString()} دج</span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '1.125rem' }}>
                <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#111', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {attr.variants.map((v: any) => (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                        style={{ width: 30, height: 30, borderRadius: '50%', background: v.value, border: 'none', cursor: 'pointer', outline: `2.5px solid ${selectedVariants[attr.name] === v.value ? '#F97316' : 'transparent'}`, outlineOffset: 3, transition: 'outline 0.18s' }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {attr.variants.map((v: any) => (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{
                        padding: '0.4rem 1rem', border: `1.5px solid ${selectedVariants[attr.name] === v.value ? '#F97316' : '#E8E8E8'}`, borderRadius: 6,
                        fontSize: '0.85rem', fontWeight: 600,
                        color: selectedVariants[attr.name] === v.value ? '#F97316' : '#555',
                        background: selectedVariants[attr.name] === v.value ? 'rgba(230,57,70,0.05)' : '#fff',
                        cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit'
                      }}>{v.name}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain}
              selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {product.desc && (
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #EBEBEB' }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#555' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT FORM
═══════════════════════════════════════════════════════════ */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div>
    {label && <p style={{ fontSize: '0.775rem', fontWeight: 700, color: '#555', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '0.75rem', color: '#F97316', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
  </div>
);

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
  const initCount = useCartStore((s) => s.initCount);

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
    if (!fd.customerName.trim()) e.customerName = 'مطلوب';
    if (!fd.customerPhone.trim()) e.customerPhone = 'مطلوب';
    if (!fd.customerWelaya) e.customerWelaya = 'مطلوب';
    if (!fd.customerCommune) e.customerCommune = 'مطلوب';
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
    } catch { /* handle */ } finally { setSub(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1.5px solid #EBEBEB' }}>
      {product.store.cart && (
        <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
          <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.8rem 1rem', border: `1.5px solid ${isAdded ? '#22C55E' : '#E8E8E8'}`, borderRadius: 10, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', background: isAdded ? 'rgba(34,197,94,0.07)' : '#fff', color: isAdded ? '#22C55E' : '#111', transition: 'all 0.2s', fontFamily: 'inherit' }}>
            {isAdded ? <><CheckCircle2 size={14} className="anim-check" />تمت الإضافة</> : <><ShoppingCart size={14} />أضف للسلة</>}
          </button>
          <button
            onClick={() => setIsOrderNow(true)}
            style={{
              flex: 1,
              ...S.btnPrimary,
              background: '#F97316', // اللون البرتقالي الأساسي
              width: 'auto',
              borderRadius: 10
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#EA580C')} // درجة برتقالي أغمق عند التحويم
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F97316')}
          >
            طلب الآن
          </button>
        </div>
      )}

      {(isOrderNow || !product.store.cart) && (
        <div className="anim-slide-fade">
          {product.store.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.06em' }}>بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} style={{ fontSize: '0.8rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>إلغاء</button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.customerName} label="الاسم">
                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" style={inp(!!errors.customerName)} />
              </FR>
              <FR error={errors.customerPhone} label="الهاتف">
                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0XXXXXXXXX" style={inp(!!errors.customerPhone)} />
              </FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.customerWelaya), paddingRight: 36, fontFamily: 'inherit' }}>
                    <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingRight: 36, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.775rem', fontWeight: 700, color: '#555', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>التوصيل</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.875rem', border: `1.5px solid ${fd.typeLivraison === t ? '#F97316' : '#E8E8E8'}`, borderRadius: 10, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'rgba(230,57,70,0.05)' : '#fff', transition: 'all 0.18s', fontFamily: 'inherit' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, color: fd.typeLivraison === t ? '#F97316' : '#555' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                    {selW && <p className="price-mono" style={{ fontSize: '1.125rem', fontWeight: 800, color: fd.typeLivraison === t ? '#111' : '#ccc' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.775rem', fontWeight: 700, color: '#555', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>الكمية</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #E8E8E8', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#111' }}><Minus size={14} /></button>
                <span style={{ width: 40, textAlign: 'center', fontWeight: 800, fontSize: '0.9rem' }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#111' }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: '#F8F8F6', border: '1.5px solid #EBEBEB', borderRadius: 10, padding: '1rem 1.125rem', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.75rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ملخص الطلب</p>
              {[
                { l: 'المنتج', v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #E8E8E8' }}>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>{r.l}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.375rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#111' }}>المجموع</span>
                <span className="price-mono" style={{ fontSize: '1.625rem', fontWeight: 800, color: '#F97316' }}>{total().toLocaleString()} <span style={{ fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 700, color: '#F97316' }}>دج</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} style={{ ...S.btnPrimary, opacity: sub ? 0.7 : 1 }}
              onMouseEnter={e => !sub && ((e.currentTarget as HTMLButtonElement).style.background = '#C0303C')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F97316')}>
              {sub ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري المعالجة...</> : 'تأكيد الطلب'}
            </button>
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
  const initCount = useCartStore((s) => s.initCount);

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
    } catch { /* handle */ } finally { setSubmitting(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  if (success) return (
    <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#F8F8F6' }}>
      <div style={{ textAlign: 'center', background: '#fff', padding: '3.5rem 2rem', borderRadius: 16, border: '1.5px solid #E8E8E8', maxWidth: 460, width: '100%' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <CheckCircle2 size={32} style={{ color: '#22C55E' }} />
        </div>
        <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111', marginBottom: '0.625rem' }}>تم استلام طلبك!</h2>
        <p style={{ color: '#888', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9375rem' }}>شكراً لثقتك. سنتواصل معك قريباً لتأكيد الطلب.</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F97316', color: '#fff', padding: '0.8rem 2rem', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem' }}>العودة للمتجر</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#F8F8F6' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed #E8E8E8', borderRadius: 16, maxWidth: 440, width: '100%', background: '#fff' }}>
        <ShoppingBag size={52} style={{ color: '#E0E0E0', display: 'block', margin: '0 auto 1.25rem' }} />
        <p style={{ color: '#bbb', fontSize: '1rem', marginBottom: '2rem' }}>السلة فارغة</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F97316', color: '#fff', padding: '0.8rem 2rem', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem' }}>تسوق الآن</Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 'clamp(1.75rem,5vw,2.75rem)', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: '2rem' }}>السلة</h1>
      <div className="cart-inner">
        {/* Products */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E8E8E8', overflow: 'hidden', alignSelf: 'start' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #F0F0F0' }}>
              <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} alt="" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, color: '#111', marginBottom: '0.25rem', fontSize: '0.875rem', lineHeight: 1.4 }}>{item.product?.name}</h4>
                <p className="price-mono" style={{ fontSize: '1.125rem', fontWeight: 800, color: '#F97316' }}>{item.finalPrice?.toLocaleString()} دج</p>
                <p style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '0.25rem' }}>الكمية: {item.quantity}</p>
              </div>
              <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ color: '#ccc', padding: '0.375rem', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center', transition: 'color 0.18s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#F97316')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#ccc')}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          <div style={{ padding: '1rem', background: '#F8F8F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#111', fontSize: '0.875rem' }}>المجموع الفرعي</span>
            <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>{cartTotal.toLocaleString()} دج</span>
          </div>
        </div>

        {/* Checkout */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E8E8E8', padding: '1.625rem', alignSelf: 'start' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#111', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>معلومات التوصيل</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={inp(!!errors.name)} /></FR>
              <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={inp(!!errors.phone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.w} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.w), paddingRight: 34, fontFamily: 'inherit' }}>
                    <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingRight: 34, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <div style={{ background: '#F8F8F6', border: '1.5px solid #EBEBEB', borderRadius: 10, padding: '1rem 1.125rem', margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #E8E8E8' }}>
                <span style={{ fontSize: '0.85rem', color: '#888' }}>المجموع الفرعي</span>
                <span style={{ fontWeight: 700, color: '#111', fontSize: '0.875rem' }}>{cartTotal.toLocaleString()} دج</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.625rem', marginBottom: '0.625rem', borderBottom: '1px solid #E8E8E8' }}>
                <span style={{ fontSize: '0.85rem', color: '#888' }}>التوصيل</span>
                <span style={{ fontWeight: 700, color: '#111', fontSize: '0.875rem' }}>{getLiv() ? `${getLiv().toLocaleString()} دج` : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 800, color: '#111' }}>الإجمالي</span>
                <span className="price-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F97316' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F97316' }}>دج</span></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...S.btnPrimary,
                background: '#F97316', // اللون البرتقالي الأساسي
                opacity: submitting ? 0.7 : 1
              }}
              onMouseEnter={e => !submitting && ((e.currentTarget as HTMLButtonElement).style.background = '#EA580C')} // برتقالي داكن عند التحويم
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F97316')}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري المعالجة...
                </>
              ) : (
                'تأكيد الطلب'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATIC PAGES
═══════════════════════════════════════════════════════════ */
const Shell = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div dir="rtl" style={{ minHeight: '100vh', background: '#F8F8F6' }}>
    <div style={{ background: '#111', paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, textAlign: 'center' }}>
      <div style={{ display: 'inline-block', background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)', padding: '0.375rem 1rem', borderRadius: 6, marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F97316', letterSpacing: '0.1em', textTransform: 'uppercase' }}>MdStore</span>
      </div>
      <h1 style={{ fontSize: 'clamp(1.75rem,5vw,3rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{title}</h1>
    </div>
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>{children}</div>
  </div>
);

const InfoBlock = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding: '1.375rem 0', borderBottom: '1px solid #EBEBEB', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
    <div style={{ width: 4, height: 20, background: '#F97316', borderRadius: 2, flexShrink: 0, marginTop: 4 }} />
    <div>
      <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#111', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: '#666' }}>{body}</p>
    </div>
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية">
      <div style={{ background: '#fff', padding: '2rem', borderRadius: 14, border: '1.5px solid #E8E8E8' }}>
        <InfoBlock title="البيانات التي نجمعها" body="نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم، رقم الهاتف، وعنوان السكن لضمان وصول شحنتكم بدقة." />
        <InfoBlock title="حماية البيانات" body="تُخزن جميع البيانات بشكل مشفر وآمن. نستخدم بروتوكولات حماية متطورة لمنع أي وصول غير مصرح به لمعلوماتكم." />
        <InfoBlock title="مشاركة المعلومات" body="نلتزم بخصوصيتكم؛ لا نقوم ببيع أو مشاركة بياناتكم مع أي جهات خارجية باستثناء شركات التوصيل المعتمدة." />
      </div>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الاستخدام">
      <div style={{ background: '#fff', padding: '2rem', borderRadius: 14, border: '1.5px solid #E8E8E8' }}>
        <InfoBlock title="الحساب والمسؤولية" body="المستخدم مسؤول عن دقة البيانات المدخلة وعن الحفاظ على سرية معلومات حسابه والأنشطة التي تتم من خلاله." />
        <InfoBlock title="الطلبات والمدفوعات" body="يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الأسعار المعلنة هي الأسعار النهائية المعتمدة للمنتجات." />
        <InfoBlock title="القانون الحاكم" body="تخضع كافة التعاملات والنزاعات للقوانين والتشريعات المعمول بها في جمهورية الجزائر الديمقراطية الشعبية." />
      </div>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات تعريف الارتباط">
      <div style={{ background: '#fff', padding: '2rem', borderRadius: 14, border: '1.5px solid #E8E8E8' }}>
        <InfoBlock title="الملفات الأساسية" body="نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل سلة المشتريات بشكل صحيح وتأمين جلسة تسجيل الدخول الخاصة بك." />
        <InfoBlock title="تحسين التجربة" body="نستخدم بعض الملفات لتحليل كيفية تفاعل المستخدمين مع المتجر، مما يساعدنا على تطوير خدماتنا وتقديم محتوى مخصص." />
      </div>
    </Shell>
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
    <div dir="rtl" style={{ background: '#F8F8F6', minHeight: '100vh' }}>
      <div style={{ background: '#111', paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.625rem' }}>تواصل معنا</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem' }}>نحن هنا للإجابة على استفساراتكم</p>
      </div>
      <div className="contact-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        {/* Info */}
        <div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E8E8E8', padding: '1.75rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>معلومات الاتصال</p>
            {[
              { icon: <Phone size={16} />, label: 'الهاتف', val: store?.contact?.phone || 'غير متوفر' },
              { icon: <MapPin size={16} />, label: 'الموقع', val: store?.contact?.wilaya || 'الجزائر' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.125rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316', flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{r.label}</p>
                  <p style={{ fontWeight: 700, color: '#111', fontSize: '0.875rem' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#111', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 8px #22C55E' }} />
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fff' }}>نرد في غضون ساعة</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E8E8E8', padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{ width: 72, height: 72, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle2 size={36} style={{ color: '#22C55E' }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>تم الإرسال!</h2>
              <p style={{ color: '#888', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9375rem' }}>سنرد عليك في أقرب وقت ممكن.</p>
              <button onClick={() => setSent(false)} style={{ padding: '0.75rem 1.75rem', borderRadius: 10, border: '1.5px solid #F97316', background: 'transparent', color: '#F97316', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}>إرسال رسالة أخرى</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#555', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>الاسم</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="اسمك الكامل" style={S.input} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#555', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>الهاتف</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="05XXXXXXXX" style={S.input} />
                </div>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#555', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" style={S.input} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#555', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>رسالتك</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} placeholder="كيف يمكننا مساعدتك؟" style={{ ...S.input, resize: 'none' }} />
              </div>
              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = '#C0303C')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F97316')}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري الإرسال...</> : <>إرسال الرسالة <ArrowRight size={16} /></>}
              </button>
            </form>
          )}
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