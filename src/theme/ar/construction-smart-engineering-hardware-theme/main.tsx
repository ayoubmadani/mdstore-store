'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Phone,
  CheckCircle2, ArrowLeft, Ruler,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, MapPin, Shield, Truck, Settings, HardHat,
  Mail,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const A  = '#F59E0B';
const AD = '#D97706';
const AL = 'rgba(245,158,11,0.09)';
const AB = '#FEF3C7';
const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const SL = '#1E293B';
const BD = '#E2E8F0';

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'IBM Plex Sans Arabic', sans-serif;
    background: ${BG};
    color: ${SL};
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #F1F5F9; }
  ::-webkit-scrollbar-thumb { background: ${BD}; border-radius: 2px; }

  @keyframes slideDown  { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideFade  { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes checkPop   { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes glb-ov-in  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes glb-ov-panel { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin        { to { transform: rotate(360deg); } }

  .anim-slide-down { animation: slideDown 0.25s ease both; }
  .anim-slide-fade { animation: slideFade 0.35s ease both; }
  .anim-check      { animation: checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  .nav-desktop { display: none; align-items: center; gap: 1.75rem; }
  .nav-mobile  { display: flex; gap: 0.5rem; }
  @media (min-width: 1024px) { .nav-desktop { display: flex; } .nav-mobile { display: none; } }

  .trust-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: ${BD}; }
  @media (min-width: 1024px) { .trust-grid { grid-template-columns: repeat(4, 1fr); } }

  .cats-grid { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
  .cats-grid::-webkit-scrollbar { height: 0; }

  .products-grid { display: grid; grid-template-columns: 1fr; gap: 1.125rem; }
  @media (min-width: 500px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; } }
  @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

  .details-inner { display: grid; grid-template-columns: 1fr; gap: 1rem; padding: 0.5rem; }
  .gallery-container { position: relative; top: 0; width: 100%; }
  .info-container { background: ${CARD}; border-radius: 8px; padding: 1.25rem; border: 1px solid ${BD}; }
  @media (min-width: 768px) {
    .details-inner { grid-template-columns: 1fr 1fr; gap: 3rem; padding: 2rem; }
    .gallery-container { position: sticky; top: 100px; z-index: 10; }
    .info-container { padding: 1.75rem; }
  }

  .form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
  @media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

  .cart-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .cart-inner { grid-template-columns: 1.2fr 1fr; gap: 3rem; } }

  .contact-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .contact-inner { grid-template-columns: 1fr 2fr; } }

  .footer-inner { display: grid; grid-template-columns: 1fr; gap: 3rem; padding-bottom: 3rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
  @media (min-width: 768px) { .footer-inner { grid-template-columns: 2fr 1fr 1fr; } }

  .hero-actions { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .hero-actions { flex-direction: row; align-items: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .thumb-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; overflow-x: auto; padding-bottom: 4px; }
  .pagination { display: flex; justify-content: center; gap: 0.375rem; flex-wrap: wrap; margin-top: 3rem; }

  a { text-decoration: none; color: inherit; }
  .price-mono { font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }

  .eng-card { transition: all 0.22s ease; }
  .eng-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(245,158,11,0.12); border-color: ${A} !important; }

  .glb-search-ov {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(248,250,252,0.97); backdrop-filter: blur(16px);
    overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
    animation: glb-ov-in 0.2s ease;
  }
  .glb-search-panel { max-width: 680px; margin: 0 auto; padding: 5rem 1.5rem 4rem; animation: glb-ov-panel 0.3s ease; direction: rtl; }
  .glb-search-form { border-bottom: 2px solid ${A}; display: flex; align-items: center; margin-bottom: 2rem; }
  .glb-search-input { flex: 1; font-size: 1.5rem; border: none; background: transparent; color: ${SL}; outline: none; padding: 0.5rem 0.5rem 0.75rem; font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; }
  .glb-search-input::placeholder { color: #CBD5E1; }
  .glb-search-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; direction: rtl; }
  .glb-search-card { display: block; border: 1px solid ${BD}; background: ${CARD}; overflow: hidden; transition: all 0.2s; text-decoration: none; color: inherit; border-radius: 8px; }
  .glb-search-card:hover { border-color: ${A}; box-shadow: 0 4px 16px rgba(245,158,11,0.1); }
  .glb-search-card-info { padding: 0.75rem; direction: rtl; }
`;

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

const S = {
  input: {
    width: '100%', padding: '0.75rem 1rem',
    background: '#fff', border: `1px solid ${BD}`,
    borderRadius: 8, fontSize: '0.9rem', color: SL,
    outline: 'none', transition: 'border-color 0.18s', appearance: 'none'
  } as React.CSSProperties,
  inputErr: { borderColor: '#EF4444' } as React.CSSProperties,
  btnPrimary: {
    width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: A, color: SL, fontWeight: 700, fontSize: '0.9rem',
    padding: '0.875rem 1.5rem', borderRadius: 8, border: 'none', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: "'IBM Plex Sans Arabic', sans-serif",
  } as React.CSSProperties,
};

export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { const s = localStorage.getItem(domain); initCount(JSON.parse(s || '[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (showSearch) { setTimeout(() => searchInputRef.current?.focus(), 80); }
    else { setSearchQuery(''); setListSearch([]); }
  }, [showSearch]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); setListSearch(data.products || []); }
      catch { } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setListSearch([]); setShowSearch(false); }
  };

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: store.topBar.color, color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
          {store.topBar.text}
        </div>
      )}
      <nav dir="rtl" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#fff',
        borderBottom: `1px solid ${scrolled ? BD : '#F1F5F9'}`,
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.25s',
      }}>
        <div style={{ height: 3, background: A, position: 'absolute', bottom: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Link href="/" style={{ flexShrink: 0, textDecoration: 'none' }}>
            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
              <img src={store.design.logoUrl} style={{ height: 36, objectFit: 'contain', display: 'block' }} alt={store?.name || ''} onError={() => setImgError(true)} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, background: A, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ruler size={17} color={SL} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: SL, lineHeight: 1.1 }}>{store?.name || 'Engineering Tools'}</span>
                  <span style={{ display: 'block', fontSize: '0.62rem', color: '#94A3B8', fontWeight: 500 }}>Hardware & Safety</span>
                </div>
              </div>
            )}
          </Link>

          <div className="nav-desktop">
            {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل معنا' }].map(i => (
              <Link key={i.h} href={i.h} style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748B', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = AD)}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>{i.l}</Link>
            ))}
            <button onClick={() => setShowSearch(true)} style={{ height: 36, padding: '0 0.875rem', borderRadius: 8, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#94A3B8', fontSize: '0.82rem', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = A; (e.currentTarget as HTMLButtonElement).style.color = AD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BD; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; }}>
              <Search size={14} /> بحث سريع...
            </button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: SL, color: '#fff', height: 38, padding: '0 1rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, transition: 'background 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = A)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = SL)}>
                <ShoppingCart size={15} /> السلة
                {count > 0 && <span style={{ background: A, color: SL, fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
          </div>

          <div className="nav-mobile">
            <button onClick={() => setShowSearch(true)} style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
              <Search size={15} />
            </button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: SL, color: '#fff', width: 38, height: 38, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={16} />
                {count > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: A, color: SL, fontSize: 10, fontWeight: 800, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
            <button onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        <div style={{ overflow: 'hidden', maxHeight: open ? 220 : 0, transition: 'max-height 0.28s ease', background: '#fff', borderTop: open ? `1px solid ${BD}` : 'none' }}>
          <div style={{ padding: '0.375rem 1.5rem 1rem' }}>
            {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل معنا' }].map(i => (
              <Link key={i.h} href={i.h} onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: `1px solid ${BD}`, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                {i.l} <ArrowLeft size={14} style={{ color: A }} />
              </Link>
            ))}
            
          </div>
        </div>
      </nav>

      {showSearch && (
        <div className="glb-search-ov" onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div className="glb-search-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: AB, border: `1px solid rgba(245,158,11,0.3)`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={13} color={AD} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>البحث في المنتجات</span>
              </div>
              <button onClick={() => setShowSearch(false)} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${BD}`, background: CARD, color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>
            <form className="glb-search-form" onSubmit={handleSearch}>
              <Search size={20} style={{ color: A, flexShrink: 0, marginLeft: 12 }} />
              <input ref={searchInputRef} className="glb-search-input" type="text" placeholder="ابحث عن أداة أو معدة..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </form>
            {loading && <p style={{ textAlign: 'center', color: AD, fontSize: '0.85rem', fontWeight: 600, padding: '2rem' }}>جاري البحث...</p>}
            {!loading && listSearch.length > 0 && (
              <div className="glb-search-grid">
                {listSearch.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} className="glb-search-card" onClick={() => setShowSearch(false)}>
                    {(p.productImage || p.imagesProduct?.[0]?.imageUrl) && (
                      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                    )}
                    <div className="glb-search-card-info">
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: SL, marginBottom: 4, lineHeight: 1.35 }}>{p.name}</p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: AD }}>{Number(p.price).toLocaleString()} دج</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!loading && searchQuery.length >= 2 && listSearch.length === 0 && (
              <p style={{ textAlign: 'center', color: '#CBD5E1', fontSize: '0.9rem', padding: '3rem' }}>لا توجد نتائج</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Footer({ store }: any) {
  return (
    <footer dir="rtl" style={{ background: SL, color: 'rgba(255,255,255,0.5)', marginTop: 80, padding: '4rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ width: 30, height: 30, background: A, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ruler size={15} color={SL} />
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.8, maxWidth: 300 }}>
              {store?.hero?.subtitle?.substring(0, 100) || 'أدوات قياس وعدة احترافية ومعدات حماية شخصية بأعلى معايير الجودة.'}
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
              © {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: A, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1.25rem' }}>الصفحات</h4>
            {[{ h: '/', l: 'الرئيسية' }, { h: '/cart', l: 'السلة' }, { h: '/contact', l: 'تواصل معنا' }, { h: '/Privacy', l: 'الخصوصية' }, { h: '/Terms', l: 'الشروط' }].map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.625rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = A)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                {lnk.l}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: A, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1.25rem' }}>تواصل</h4>
            {[
              { icon: <Phone size={14} />, val: store?.contact?.phone },
              { icon: <Mail size={14} />, val: store?.contact?.email },
              { icon: <MapPin size={14} />, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: A, flexShrink: 0 }}>{r.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{r.val}</span>
              </div>
            ))}
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
    <div className="eng-card" style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#F8FAFC', overflow: 'hidden' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={40} color={BD} /></div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: A, color: SL, fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 4 }}>
            -{discount}%
          </div>
        )}
      </div>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${A}, ${AB})` }} />
      <div style={{ padding: '0.875rem 1rem 1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: SL, marginBottom: '0.375rem', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', gap: 2, marginBottom: '0.75rem' }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={10} style={{ fill: i < 4 ? A : 'none', color: A }} />)}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: AD }}>{price.toLocaleString()}</span>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{store.currency || 'دج'}</span>
            {orig > price && <span style={{ fontSize: '0.72rem', color: '#CBD5E1', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
          <Link href={`/product/${product.slug || product.id}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '0.6rem', borderRadius: 8, background: AB, color: AD, fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s', border: `1px solid rgba(245,158,11,0.25)` }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = A; el.style.color = SL; el.style.borderColor = A; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = AB; el.style.color = AD; el.style.borderColor = 'rgba(245,158,11,0.25)'; }}>
            {viewDetails} <ArrowLeft size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir="rtl">
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: SL, minHeight: 'clamp(460px, 60vh, 680px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {store.hero?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.25 }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(30,41,59,0.88) 0%, rgba(30,41,59,0.70) 50%, rgba(180,120,0,0.35) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 5, height: '100%', background: A }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', width: '100%', padding: 'clamp(5rem,10vw,8rem) 1.5rem clamp(3rem,6vw,5rem)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.15)', border: `1px solid rgba(245,158,11,0.4)`, borderRadius: 6, padding: '0.35rem 0.875rem', marginBottom: '1.25rem' }}>
            <Ruler size={11} color={A} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: A }}>أدوات هندسية متخصصة</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5.5vw,4rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '1rem', maxWidth: 640 }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || 'دقة في القياس،<br/>احترافية في <span style="color:#F59E0B">العمل</span>') }} />
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.75, marginBottom: '2.25rem', maxWidth: 480 }}>
            {store.hero?.subtitle || 'أدوات قياس، عدة يدوية وكهربائية، ومعدات حماية شخصية مختارة للمحترفين في قطاع البناء والهندسة.'}
          </p>
          <div className="hero-actions">
            <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: A, color: SL, fontWeight: 700, fontSize: '0.9rem', padding: '0.875rem 1.875rem', borderRadius: 8, transition: 'all 0.2s', boxShadow: `0 4px 24px rgba(245,158,11,0.4)` }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = AD; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = A; (e.currentTarget as HTMLAnchorElement).style.color = SL; }}>
              تصفح المنتجات <ArrowLeft size={16} />
            </a>
            {store?.cart !== false && (
              <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: '0.9rem', padding: '0.875rem 1.25rem', borderRadius: 8, border: `1px solid rgba(255,255,255,0.25)`, transition: 'all 0.2s', background: 'rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = A; (e.currentTarget as HTMLAnchorElement).style.color = A; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.8)'; }}>
                السلة
              </Link>
            )}
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            {[
              { icon: <Settings size={14} />, val: '+500', lbl: 'منتج' },
              { icon: <Truck size={14} />, val: '58', lbl: 'ولاية' },
              { icon: <HardHat size={14} />, val: '100%', lbl: 'معتمد' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: A }}>{s.icon}</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{s.val}</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BD}` }}>
        <div className="trust-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
          {[
            { icon: <HardHat size={18} />, t: 'معدات معتمدة', d: 'جودة ISO معيارية' },
            { icon: <Ruler size={18} />, t: 'دقة في القياس', d: 'أدوات متكالبة' },
            { icon: <Truck size={18} />, t: 'توصيل آمن', d: '58 ولاية جزائرية' },
            { icon: <Shield size={18} />, t: 'دفع عند الاستلام', d: 'بدون مخاطر' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1.125rem 1rem', textAlign: 'center', background: i % 2 === 0 ? '#fff' : BG }}>
              <div style={{ width: 40, height: 40, background: AB, border: `1px solid rgba(245,158,11,0.25)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.625rem', color: AD }}>{item.icon}</div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: SL, marginBottom: '0.15rem' }}>{item.t}</p>
              <p style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{item.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <section style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 20, height: 20, background: A, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={11} color={SL} />
            </div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>التصنيفات</p>
          </div>
          <div className="cats-grid">
                          <Link href="?" style={{ display:'inline-flex', alignItems:'center', padding:'0.5rem 1.25rem', borderRadius:999, border:`1.5px solid ${!activeCategory ? A : '#ccc'}`, background: !activeCategory ? A : 'transparent', color: !activeCategory ? '#fff' : 'inherit', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }}>
                الكل
              </Link>
              {cats.map((cat: any) => {
              const isActive = activeCategory === String(cat.id);
              return (
              <Link key={cat.id} href={`?category=${cat.id}`} style={{ flexShrink: 0, padding: '0.5rem 1rem', border: `1px solid ${isActive ? A : BD}`, borderRadius: 8, fontSize: '0.82rem', fontWeight: 500, color: isActive ? '#fff' : '#64748B', background: isActive ? A : CARD, whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background = AB; el.style.color = AD; el.style.borderColor = A; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background = isActive ? A : CARD; el.style.color = isActive ? '#fff' : '#64748B'; el.style.borderColor = isActive ? A : BD; }}>
                {cat.name}
              </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" style={{ padding: '0.5rem 1.5rem 5rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 4, height: 22, background: A, borderRadius: 2 }} />
          <h2 style={{ fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 700, color: SL }}>المنتجات</h2>
        </div>
        {products.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', border: `1px dashed ${BD}`, borderRadius: 10, background: CARD }}>
            <Settings size={40} color={BD} style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>لا توجد منتجات بعد</p>
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
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: CARD, color: '#64748B' }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, border: `1px solid ${isA ? A : BD}`, background: isA ? A : CARD, color: isA ? SL : '#64748B' }}>
                  {pn}
                </Link>
              );
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: CARD, color: '#64748B' }}>❯</Link>
          </div>
        )}
      </section>
    </div>
  );
}

export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  return (
    <div dir="rtl" style={{ background: BG, paddingBottom: '4rem' }}>
      <div className="details-inner" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="gallery-container">
          <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', background: '#F8FAFC', border: `1px solid ${BD}` }}>
            {allImages[sel]
              ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={56} color={BD} /></div>}
            {discount > 0 && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: A, color: SL, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>{discount}% خصم</div>
            )}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BD}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: SL }}><ChevronRight size={16} /></button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BD}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: SL }}><ChevronLeft size={16} /></button>
              </>
            )}
          </div>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${A}, ${AB})`, borderRadius: '0 0 6px 6px', marginTop: -1 }} />
          {allImages.length > 1 && (
            <div className="thumb-row">
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 58, height: 58, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${sel === idx ? A : BD}`, opacity: sel === idx ? 1 : 0.55, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.18s' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="info-container">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: AB, border: `1px solid rgba(245,158,11,0.3)`, borderRadius: 6, padding: '0.25rem 0.625rem', marginBottom: '0.875rem' }}>
              <Settings size={10} color={AD} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: AD }}>أداة هندسية احترافية</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.375rem,4vw,2rem)', fontWeight: 700, color: SL, marginBottom: '0.625rem', lineHeight: 1.25 }}>{product.name}</h1>
            <div style={{ display: 'flex', gap: 2, marginBottom: '1.25rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={13} style={{ fill: i < 4 ? A : 'none', color: A }} />)}
            </div>
            <div style={{ background: AB, border: `1px solid rgba(245,158,11,0.25)`, borderRadius: 8, padding: '0.875rem 1.125rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', color: AD, fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>السعر</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span className="price-mono" style={{ fontSize: '2.5rem', fontWeight: 800, color: AD }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#94A3B8' }}>دج</span>
              </div>
            </div>
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: `1px solid ${selectedOffer === o.id ? A : BD}`, borderRadius: 8, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? AB : CARD, transition: 'all 0.18s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? A : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedOffer === o.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: A }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontWeight: 600, color: SL, fontSize: '0.875rem' }}>{o.name}</p>
                        <p style={{ fontSize: '0.72rem', color: '#94A3B8' }}>الكمية: {o.quantity}</p>
                      </div>
                    </div>
                    <span className="price-mono" style={{ fontWeight: 800, color: AD, fontSize: '1.05rem' }}>{o.price.toLocaleString()} دج</span>
                  </label>
                ))}
              </div>
            )}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{attr.name}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {attr.variants.map((v: any) => {
                    const isSelected = selectedVariants[attr.name] === v.value;
                    return (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={
                        attr.displayMode === 'color' ? { width: 28, height: 28, borderRadius: '50%', background: v.value, border: `1px solid ${BD}`, cursor: 'pointer', outline: `2.5px solid ${isSelected ? A : 'transparent'}`, outlineOffset: 3 }
                        : attr.displayMode === 'image' ? { width: 42, height: 42, borderRadius: 6, backgroundImage: `url(${v.value})`, backgroundSize: 'cover', backgroundPosition: 'center', border: `2px solid ${isSelected ? A : BD}`, cursor: 'pointer', transition: 'all 0.18s' }
                        : { padding: '0.375rem 0.875rem', border: `1px solid ${isSelected ? A : BD}`, borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, background: isSelected ? AB : CARD, color: isSelected ? AD : '#64748B', cursor: 'pointer', transition: 'all 0.18s' }
                      }>
                        {attr.displayMode !== 'color' && attr.displayMode !== 'image' && v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <ProductForm product={product} userId={product.store.userId} domain={domain}
              selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
            {product.desc && (
              <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: `1px solid ${BD}` }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#64748B' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div>
    {label && <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
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
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = 'رقم هاتف غير صالح';
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
      router.push(`${window.location.origin}/successfully?productId=${product.id}`);
    } catch { } finally { setSub(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${BD}` }}>
      {product.store.cart && (
        <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
          <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.8rem 1rem', border: `1px solid ${isAdded ? '#22C55E' : BD}`, borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: isAdded ? 'rgba(34,197,94,0.06)' : CARD, color: isAdded ? '#22C55E' : '#64748B', transition: 'all 0.2s', fontFamily: 'inherit' }}>
            {isAdded ? <><CheckCircle2 size={14} className="anim-check" />تمت الإضافة</> : <><ShoppingCart size={14} />أضف للسلة</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} style={{ flex: 1, ...S.btnPrimary, width: 'auto', borderRadius: 8 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; (e.currentTarget as HTMLButtonElement).style.color = SL; }}>
            طلب الآن
          </button>
        </div>
      )}
      {(isOrderNow || !product.store.cart) && (
        <div className="anim-slide-fade">
          {product.store.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} style={{ fontSize: '0.8rem', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>إلغاء</button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.customerName} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" style={inp(!!errors.customerName)} /></FR>
              <FR error={errors.customerPhone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0XXXXXXXXX" style={inp(!!errors.customerPhone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.customerWelaya), paddingRight: 36, fontFamily: 'inherit' }}>
                    <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingRight: 36, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>التوصيل</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.75rem', border: `1px solid ${fd.typeLivraison === t ? A : BD}`, borderRadius: 8, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? AB : CARD, transition: 'all 0.18s', fontFamily: 'inherit' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 4, color: fd.typeLivraison === t ? AD : '#64748B' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                    {selW && <p className="price-mono" style={{ fontSize: '1rem', fontWeight: 800, color: fd.typeLivraison === t ? AD : '#94A3B8' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>الكمية</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BD}`, borderRadius: 8, overflow: 'hidden', background: CARD }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><Minus size={13} /></button>
                <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: SL }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: AD }}><Plus size={13} /></button>
              </div>
            </div>
            <div style={{ background: AB, border: `1px solid rgba(245,158,11,0.25)`, borderRadius: 8, padding: '0.875rem 1rem', marginBottom: '1rem' }}>
              {[
                { l: 'المنتج', v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid rgba(245,158,11,0.2)` }}>
                  <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>{r.l}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: SL }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: SL }}>المجموع</span>
                <span className="price-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: AD }}>{total().toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>دج</span></span>
              </div>
            </div>
            <button type="submit" disabled={sub} style={{ ...S.btnPrimary, opacity: sub ? 0.7 : 1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; (e.currentTarget as HTMLButtonElement).style.color = SL; }}>
              {sub ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />جاري المعالجة...</> : 'تأكيد الطلب'}
            </button>
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
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(domain) || '[]'));
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [domain, store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLiv = () => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; };
  const cartTotal = items.reduce((a, i) => a + (i.finalPrice * i.quantity), 0);
  const finalTotal = cartTotal + +getLiv();
  const update = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!fd.customerName.trim()) er.name = 'مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = 'رقم هاتف غير صالح';
    if (!fd.customerWelaya) er.w = 'مطلوب';
    if (!fd.customerCommune) er.c = 'مطلوب';
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({
        ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId,
        selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId,
        selectedVariants: i.selectedVariants, platform: i.platform || 'store',
        finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(),
        quantity: i.quantity, customerId: i.customerId || '',
        priceLoss: selW?.livraisonReturn ?? 0
      })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  if (success) return (
    <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', background: CARD, padding: '3.5rem 2rem', borderRadius: 12, border: `1px solid ${BD}`, borderTop: `3px solid ${A}`, maxWidth: 460, width: '100%' }}>
        <CheckCircle2 size={40} style={{ color: '#22C55E', display: 'block', margin: '0 auto 1.25rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: SL, marginBottom: '0.625rem' }}>تم استلام طلبك!</h2>
        <p style={{ color: '#64748B', lineHeight: 1.7, marginBottom: '2rem' }}>سنتواصل معك قريباً لتأكيد الطلب.</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: A, color: SL, padding: '0.8rem 2rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}>العودة للمتجر</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: `1px dashed ${BD}`, borderRadius: 12, maxWidth: 440, width: '100%', background: CARD }}>
        <ShoppingBag size={48} style={{ color: BD, display: 'block', margin: '0 auto 1.25rem' }} />
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '2rem' }}>السلة فارغة</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: A, color: SL, padding: '0.75rem 1.75rem', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>تسوق الآن</Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto', minHeight: '100vh', background: BG }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ width: 4, height: 26, background: A, borderRadius: 2 }} />
        <h1 style={{ fontSize: 'clamp(1.5rem,5vw,2.25rem)', fontWeight: 700, color: SL }}>السلة</h1>
      </div>
      <div className="cart-inner">
        <div style={{ background: CARD, borderRadius: 10, border: `1px solid ${BD}`, overflow: 'hidden', alignSelf: 'start' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${A}, ${AB})` }} />
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem', borderBottom: `1px solid ${BD}` }}>
              <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: `1px solid ${BD}` }} alt="" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, color: SL, marginBottom: '0.25rem', fontSize: '0.875rem', lineHeight: 1.4 }}>{item.product?.name}</h4>
                <p className="price-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: AD }}>{item.finalPrice?.toLocaleString()} دج</p>
                <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>الكمية: {item.quantity}</p>
              </div>
              <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ color: '#CBD5E1', padding: '0.375rem', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center', transition: 'color 0.18s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#EF4444')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#CBD5E1')}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <div style={{ padding: '0.875rem', background: AB, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#64748B', fontSize: '0.875rem' }}>المجموع الفرعي</span>
            <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: AD }}>{cartTotal.toLocaleString()} دج</span>
          </div>
        </div>
        <div style={{ background: CARD, borderRadius: 10, border: `1px solid ${BD}`, overflow: 'hidden', padding: '1.5rem', alignSelf: 'start' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${A}, ${AB})`, margin: '-1.5rem -1.5rem 1.25rem' }} />
          <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: SL, marginBottom: '1.25rem' }}>معلومات التوصيل</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={inp(!!errors.name)} /></FR>
              <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={inp(!!errors.phone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.w} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.w), paddingRight: 34, fontFamily: 'inherit' }}>
                    <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingRight: 34, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ margin: '1rem 0' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' as const, marginBottom: '0.5rem', letterSpacing: '0.06em' }}>نوع التوصيل</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.75rem', border: `1px solid ${fd.typeLivraison === t ? A : BD}`, borderRadius: 8, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? AB : CARD, fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    <span style={{ display: 'block', fontSize: '1.125rem', marginBottom: 3 }}>{t === 'home' ? '🏠' : '🏢'}</span>
                    <p style={{ fontWeight: 600, fontSize: '0.78rem', color: fd.typeLivraison === t ? AD : '#64748B' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                    {selW && <p style={{ fontWeight: 800, fontSize: '0.9rem', color: fd.typeLivraison === t ? AD : '#94A3B8', marginTop: 2 }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: AB, border: `1px solid rgba(245,158,11,0.25)`, borderRadius: 8, padding: '0.875rem 1rem', margin: '1rem 0' }}>
              {[
                { l: 'المجموع الفرعي', v: `${cartTotal.toLocaleString()} دج` },
                { l: 'التوصيل', v: getLiv() ? `${getLiv().toLocaleString()} دج` : '—' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid rgba(245,158,11,0.15)` }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{r.l}</span>
                  <span style={{ fontWeight: 600, color: SL, fontSize: '0.875rem' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, color: SL }}>الإجمالي</span>
                <span className="price-mono" style={{ fontSize: '2rem', fontWeight: 800, color: AD }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>دج</span></span>
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; (e.currentTarget as HTMLButtonElement).style.color = SL; }}>
              {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />جاري المعالجة...</> : 'تأكيد الطلب'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const Shell = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div dir="rtl" style={{ minHeight: '100vh', background: BG }}>
    <div style={{ background: SL, paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: AL, border: `1px solid rgba(245,158,11,0.3)`, borderRadius: 6, padding: '0.3rem 0.875rem', marginBottom: '1rem' }}>
          <Settings size={11} color={A} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: A }}>Smart Engineering</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>{children}</div>
  </div>
);

const InfoBlock = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding: '1.25rem 0', borderBottom: `1px solid ${BD}`, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
    <div style={{ width: 3, height: 16, background: A, borderRadius: 2, flexShrink: 0, marginTop: 4 }} />
    <div>
      <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: SL, marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#64748B' }}>{body}</p>
    </div>
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية">
      <div style={{ background: CARD, padding: '1.75rem', borderRadius: 10, border: `1px solid ${BD}` }}>
        <InfoBlock title="البيانات التي نجمعها" body="نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم، رقم الهاتف، وعنوان التوصيل." />
        <InfoBlock title="حماية البيانات" body="تُخزن جميع البيانات بشكل مشفر وآمن. نستخدم بروتوكولات حماية متطورة." />
        <InfoBlock title="مشاركة المعلومات" body="لا نقوم ببيع أو مشاركة بياناتكم مع أي جهات خارجية باستثناء شركاء التوصيل." />
      </div>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الاستخدام">
      <div style={{ background: CARD, padding: '1.75rem', borderRadius: 10, border: `1px solid ${BD}` }}>
        <InfoBlock title="الحساب والمسؤولية" body="المستخدم مسؤول عن دقة البيانات المدخلة وعن الحفاظ على سرية معلومات حسابه." />
        <InfoBlock title="الطلبات والمدفوعات" body="يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الأسعار المعلنة هي الأسعار النهائية المعتمدة." />
        <InfoBlock title="القانون الحاكم" body="تخضع كافة التعاملات للقوانين المعمول بها في جمهورية الجزائر الديمقراطية الشعبية." />
      </div>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات تعريف الارتباط">
      <div style={{ background: CARD, padding: '1.75rem', borderRadius: 10, border: `1px solid ${BD}` }}>
        <InfoBlock title="الملفات الأساسية" body="نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل سلة المشتريات وتأمين جلسة تسجيل الدخول." />
        <InfoBlock title="تحسين التجربة" body="نستخدم بعض الملفات لتحليل كيفية تفاعل المستخدمين مع المتجر لتطوير خدماتنا." />
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
    catch { showError('حدث خطأ في الإرسال'); } finally { setLoading(false); }
  };

  return (
    <div dir="rtl" style={{ background: BG, minHeight: '100vh' }}>
      <div style={{ background: SL, paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>تواصل معنا</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9375rem' }}>فريقنا التقني متاح للإجابة على استفساراتكم</p>
        </div>
      </div>
      <div className="contact-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div>
          <div style={{ background: CARD, borderRadius: 10, border: `1px solid ${BD}`, padding: '1.5rem', marginBottom: '1rem' }}>
            {[
              { icon: <Phone size={15} />, label: 'الهاتف', val: store?.contact?.phone || 'غير متوفر' },
              { icon: <MapPin size={15} />, label: 'الموقع', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || 'الجزائر' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: AB, border: `1px solid rgba(245,158,11,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: AD, flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <p style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '0.15rem' }}>{r.label}</p>
                  <p style={{ fontWeight: 600, color: SL, fontSize: '0.875rem' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: AB, borderRadius: 8, border: `1px solid rgba(245,158,11,0.25)`, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: AD }}>نرد في غضون ساعة</span>
          </div>
        </div>
        <div style={{ background: CARD, borderRadius: 10, border: `1px solid ${BD}`, padding: '2rem', overflow: 'hidden', position: 'relative' as const }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${A}, ${AB})`, position: 'absolute', top: 0, left: 0, right: 0 }} />
          {sent ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <CheckCircle2 size={40} style={{ color: '#22C55E', display: 'block', margin: '0 auto 1.25rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: SL, marginBottom: '0.5rem' }}>تم الإرسال!</h2>
              <p style={{ color: '#64748B', lineHeight: 1.7, marginBottom: '2rem' }}>سنرد عليك في أقرب وقت ممكن.</p>
              <button onClick={() => setSent(false)} style={{ padding: '0.75rem 1.75rem', borderRadius: 8, border: `1px solid ${A}`, background: AB, color: AD, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}>إرسال رسالة أخرى</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>الاسم</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={S.input} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>الهاتف</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={S.input} />
                </div>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={S.input} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>الرسالة</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...S.input, resize: 'none' }} />
              </div>
              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; (e.currentTarget as HTMLButtonElement).style.color = SL; }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />جاري الإرسال...</> : <>إرسال الرسالة <ArrowLeft size={16} /></>}
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
