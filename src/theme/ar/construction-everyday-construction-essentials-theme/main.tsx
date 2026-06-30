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
  CheckCircle2, ArrowLeft, Package,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, MapPin, Shield, Truck, Wrench, Layers,
  Mail,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const E  = '#10B981';
const ED = '#059669';
const EL = 'rgba(16,185,129,0.08)';
const EB = '#D1FAE5';
const BG = '#F9FAFB';
const CARD = '#FFFFFF';
const INK = '#111827';
const SUB = '#6B7280';
const BD = '#E5E7EB';

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Tajawal', sans-serif; background: ${BG}; color: ${INK}; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${BG}; }
  ::-webkit-scrollbar-thumb { background: ${BD}; border-radius: 2px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes checkPop { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes glb-ov-in { from { opacity:0; } to { opacity:1; } }
  @keyframes glb-ov-panel { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .anim-fade-up { animation: fadeUp 0.3s ease both; }
  .anim-check   { animation: checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  .nav-desktop { display: none; align-items: center; gap: 1.5rem; }
  .nav-mobile  { display: flex; gap: 0.375rem; }
  @media (min-width: 1024px) { .nav-desktop { display: flex; } .nav-mobile { display: none; } }

  .trust-strip { display: flex; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .trust-strip::-webkit-scrollbar { height: 0; }

  .cats-section-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  @media (min-width: 500px) { .cats-section-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 768px) { .cats-section-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (min-width: 1024px) { .cats-section-grid { grid-template-columns: repeat(6, 1fr); } }

  .products-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: ${BD}; }
  @media (min-width: 500px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

  .details-inner { display: grid; grid-template-columns: 1fr; gap: 1rem; padding: 0.5rem; }
  .gallery-container { position: relative; top: 0; width: 100%; }
  .info-container { background: ${CARD}; border-radius: 4px; padding: 1.25rem; border: 1px solid ${BD}; }
  @media (min-width: 768px) {
    .details-inner { grid-template-columns: 1fr 1fr; gap: 3rem; padding: 2rem; }
    .gallery-container { position: sticky; top: 100px; z-index: 10; }
    .info-container { padding: 2rem; }
  }

  .form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
  @media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

  .cart-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .cart-inner { grid-template-columns: 1.2fr 1fr; gap: 3rem; } }

  .contact-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .contact-inner { grid-template-columns: 1fr 2fr; } }

  .footer-inner { display: grid; grid-template-columns: 1fr; gap: 2.5rem; padding-bottom: 2.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
  @media (min-width: 768px) { .footer-inner { grid-template-columns: 2fr 1fr 1fr; } }

  .hero-actions { display: flex; flex-direction: column; gap: 0.625rem; }
  @media (min-width: 500px) { .hero-actions { flex-direction: row; align-items: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .thumb-row { display: flex; gap: 0.5rem; margin-top: 0.625rem; overflow-x: auto; padding-bottom: 4px; }
  .pagination { display: flex; justify-content: center; gap: 0.25rem; flex-wrap: wrap; margin-top: 2.5rem; }

  a { text-decoration: none; color: inherit; }
  .price-mono { font-variant-numeric: tabular-nums; }
  .util-card { transition: background 0.18s; }
  .util-card:hover { background: #FAFAFA !important; }
  .util-card:hover .card-name { color: ${E} !important; }

  .glb-search-ov {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(249,250,251,0.97); backdrop-filter: blur(16px);
    overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
    animation: glb-ov-in 0.2s ease;
  }
  .glb-search-panel { max-width: 640px; margin: 0 auto; padding: 5rem 1.5rem 4rem; animation: glb-ov-panel 0.28s ease; direction: rtl; }
  .glb-search-form { border-bottom: 1.5px solid ${E}; display: flex; align-items: center; margin-bottom: 2rem; }
  .glb-search-input { flex: 1; font-size: 1.375rem; border: none; background: transparent; color: ${INK}; outline: none; padding: 0.5rem 0.5rem 0.75rem; font-family: 'Tajawal', sans-serif; direction: rtl; }
  .glb-search-input::placeholder { color: #D1D5DB; }
  .glb-search-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1px; background: ${BD}; direction: rtl; }
  .glb-search-card { display: block; background: ${CARD}; overflow: hidden; transition: all 0.18s; text-decoration: none; color: inherit; }
  .glb-search-card:hover { background: ${EL}; }
  .glb-search-card-info { padding: 0.625rem 0.75rem; direction: rtl; }
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
  input: { width: '100%', padding: '0.7rem 0.875rem', background: '#fff', border: `1px solid ${BD}`, borderRadius: 4, fontSize: '0.9rem', color: INK, outline: 'none', transition: 'border-color 0.15s', appearance: 'none' } as React.CSSProperties,
  inputErr: { borderColor: '#EF4444' } as React.CSSProperties,
  btnPrimary: { width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: E, color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '0.875rem 1.5rem', borderRadius: 4, border: 'none', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Tajawal', sans-serif" } as React.CSSProperties,
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
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setListSearch([]); setShowSearch(false); }
  };

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: E, color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
          {store.topBar.text}
        </div>
      )}
      <nav dir="rtl" style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: `1px solid ${scrolled ? BD : '#F3F4F6'}`, boxShadow: scrolled ? '0 1px 6px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <Link href="/" style={{ flexShrink: 0 }}>
            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
              <img src={store.design.logoUrl} style={{ height: 32, objectFit: 'contain', display: 'block' }} alt={store?.name || ''} onError={() => setImgError(true)} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 28, background: E, borderRadius: 2 }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: INK }}>{store?.name || 'Hardware Store'}</span>
              </div>
            )}
          </Link>
          <div className="nav-desktop" style={{ flex: 1 }}>
            <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 440, margin: '0 auto', height: 36, border: `1px solid ${BD}`, borderRadius: 4, background: BG, display: 'flex', alignItems: 'center', gap: '0.375rem', paddingRight: '0.75rem', paddingLeft: '0.5rem', transition: 'border-color 0.15s' }}
              onFocus={e => (e.currentTarget.style.borderColor = E)}
              onBlur={e => (e.currentTarget.style.borderColor = BD)}>
              <Search size={13} color={SUB} style={{ flexShrink: 0 }} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ابحث في المنتجات..." style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.82rem', color: INK, outline: 'none', fontFamily: "'Tajawal', sans-serif", direction: 'rtl' as const }} />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: SUB, padding: 0, display: 'flex', alignItems: 'center' }}><X size={11} /></button>}
            </form>
          </div>
          <div className="nav-desktop" style={{ flexShrink: 0, gap: '1.25rem' }}>
            {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل' }].map(i => (
              <Link key={i.h} href={i.h} style={{ fontSize: '0.875rem', fontWeight: 500, color: SUB, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = ED)}
                onMouseLeave={e => (e.currentTarget.style.color = SUB)}>{i.l}</Link>
            ))}
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: E, color: '#fff', height: 36, padding: '0 0.875rem', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, transition: 'background 0.18s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = ED)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = E)}>
                <ShoppingCart size={14} /> السلة
                {count > 0 && <span style={{ background: '#fff', color: E, fontSize: 10, fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
          </div>
          <div className="nav-mobile">
            <button onClick={() => setShowSearch(true)} style={{ width: 36, height: 36, borderRadius: 4, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB }}><Search size={14} /></button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: E, color: '#fff', width: 36, height: 36, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={15} />
                {count > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#fff', color: E, fontSize: 9, fontWeight: 800, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
            <button onClick={() => setOpen(!open)} style={{ width: 36, height: 36, borderRadius: 4, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB }}>
              {open ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>
        <div style={{ overflow: 'hidden', maxHeight: open ? 200 : 0, transition: 'max-height 0.25s ease', background: '#fff', borderTop: open ? `1px solid ${BD}` : 'none' }}>
          <div style={{ padding: '0.25rem 1.5rem 0.875rem' }}>
            {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل معنا' }].map(i => (
              <Link key={i.h} href={i.h} onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: `1px solid ${BD}`, fontSize: '0.875rem', fontWeight: 500, color: INK }}>
                {i.l} <ArrowLeft size={13} style={{ color: E }} />
              </Link>
            ))}
            
          </div>
        </div>
      </nav>

      {showSearch && (
        <div className="glb-search-ov" onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div className="glb-search-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: SUB }}>البحث في المنتجات</span>
              <button onClick={() => setShowSearch(false)} style={{ width: 32, height: 32, borderRadius: 4, border: `1px solid ${BD}`, background: CARD, color: SUB, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
            </div>
            <form className="glb-search-form" onSubmit={handleSearch}>
              <Search size={18} style={{ color: E, flexShrink: 0, marginLeft: 10 }} />
              <input ref={searchInputRef} className="glb-search-input" type="text" placeholder="اكتب اسم المنتج..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </form>
            {loading && <p style={{ textAlign: 'center', color: ED, fontSize: '0.82rem', padding: '2rem' }}>جاري البحث...</p>}
            {!loading && listSearch.length > 0 && (
              <>
              <div className="glb-search-grid">
                {listSearch.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} className="glb-search-card" onClick={() => setShowSearch(false)}>
                    {(p.productImage || p.imagesProduct?.[0]?.imageUrl) && (
                      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                    )}
                    <div className="glb-search-card-info">
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: INK, marginBottom: 3, lineHeight: 1.35 }}>{p.name}</p>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: ED }}>{Number(p.price).toLocaleString()} دج</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button onClick={handleSearch} style={{ width: '100%', padding: '12px', background: EL, border: 'none', borderTop: `1px solid rgba(16,185,129,0.2)`, color: E, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                عرض جميع النتائج <ArrowLeft size={14} />
              </button>
              </>
            )}
            {!loading && searchQuery.length >= 2 && listSearch.length === 0 && (
              <p style={{ textAlign: 'center', color: '#D1D5DB', fontSize: '0.875rem', padding: '3rem' }}>لا توجد نتائج</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Footer({ store }: any) {
  return (
    <footer dir="rtl" style={{ background: INK, color: 'rgba(255,255,255,0.4)', marginTop: 80, padding: '3.5rem 1.5rem 1.25rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
              <div style={{ width: 6, height: 24, background: E, borderRadius: 2 }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.8, maxWidth: 280 }}>
              {store?.hero?.subtitle?.substring(0, 90) || 'مواد بناء ومثبتات وأدوات يومية للورشات والمقاولين.'}
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} {store?.name}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: E, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1rem' }}>الصفحات</h4>
            {[{ h: '/', l: 'الرئيسية' }, { h: '/cart', l: 'السلة' }, { h: '/contact', l: 'تواصل معنا' }, { h: '/Privacy', l: 'الخصوصية' }, { h: '/Terms', l: 'الشروط' }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = E)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                {lnk.l}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: E, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1rem' }}>تواصل</h4>
            {[
              { icon: <Phone size={13} />, val: store?.contact?.phone },
              { icon: <Mail size={13} />, val: store?.contact?.email },
              { icon: <MapPin size={13} />, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', fontSize: '0.875rem' }}>
                <span style={{ color: E, flexShrink: 0 }}>{r.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>{r.val}</span>
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
    <div className="util-card" style={{ background: CARD, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ position: 'relative', aspectRatio: '1/1', background: BG, overflow: 'hidden' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={36} color={BD} /></div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: E, color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 2 }}>-{discount}%</div>
        )}
      </div>
      <div style={{ padding: '0.75rem 0.875rem 0.625rem', display: 'flex', flexDirection: 'column', flex: 1, borderTop: `1px solid ${BD}` }}>
        <p style={{ fontSize: '0.62rem', color: E, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{store?.name}</p>
        <h3 className="card-name" style={{ fontSize: '0.875rem', fontWeight: 600, color: INK, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.18s', flex: 1, marginBottom: '0.625rem' }}>{product.name}</h3>
        <div style={{ marginBottom: '0.625rem' }}>
          <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: ED }}>{price.toLocaleString()}</span>
          <span style={{ fontSize: '0.7rem', color: SUB, marginRight: 4 }}>{store.currency || 'دج'}</span>
          {orig > price && <span style={{ fontSize: '0.7rem', color: '#D1D5DB', textDecoration: 'line-through', marginRight: 6 }}>{orig.toLocaleString()}</span>}
        </div>
      </div>
      <Link href={`/product/${product.slug || product.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: E, color: '#fff', fontWeight: 700, fontSize: '0.82rem', padding: '0.7rem', transition: 'background 0.18s' }}
        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = ED)}
        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = E)}>
        تصفح المنتج <ArrowLeft size={12} />
      </Link>
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
      <section style={{ position: 'relative', overflow: 'hidden', background: '#F0FDF4', minHeight: 'clamp(360px, 50vh, 540px)', display: 'flex', alignItems: 'center', borderBottom: `1px solid rgba(16,185,129,0.12)` }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', background: E }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `repeating-linear-gradient(90deg, ${E} 0, ${E} 20px, transparent 20px, transparent 30px)` }} />
        {store.hero?.imageUrl && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', overflow: 'hidden', opacity: 0.12 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', width: '100%', padding: 'clamp(3rem,6vw,5rem) 1.5rem' }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: EL, border: `1px solid rgba(16,185,129,0.25)`, padding: '0.3rem 0.875rem', marginBottom: '1.25rem' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: E, display: 'inline-block' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: ED, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>مواد البناء اليومية</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 800, color: INK, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1rem' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || 'كل ما تحتاجه<br/>في <span style="color:#059669">الورشة</span>') }} />
            <p style={{ fontSize: '1rem', color: SUB, lineHeight: 1.75, marginBottom: '2rem', maxWidth: 440 }}>
              {store.hero?.subtitle || 'مثبتات، مواد بناء، وأدوات يومية موثوقة للمقاولين والمحترفين.'}
            </p>
            <div className="hero-actions">
              <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: E, color: '#fff', fontWeight: 700, fontSize: '0.875rem', padding: '0.8rem 1.75rem', borderRadius: 4, transition: 'background 0.18s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = ED)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = E)}>
                تصفح المنتجات <ArrowLeft size={15} />
              </a>
              {store?.cart !== false && (
                <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: SUB, fontWeight: 500, fontSize: '0.875rem', padding: '0.8rem 1.25rem', borderRadius: 4, border: `1px solid ${BD}`, background: CARD, transition: 'all 0.18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = E; (e.currentTarget as HTMLAnchorElement).style.color = ED; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = BD; (e.currentTarget as HTMLAnchorElement).style.color = SUB; }}>
                  السلة
                </Link>
              )}
            </div>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: `1px solid ${BD}` }}>
              {[{ n: '+500', l: 'منتج' }, { n: '58', l: 'ولاية' }, { n: '100%', l: 'مضمون' }].map((s, i) => (
                <div key={i}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: ED, lineHeight: 1 }}>{s.n}</p>
                  <p style={{ fontSize: '0.68rem', color: SUB, marginTop: 3 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div style={{ background: EL, borderBottom: `1px solid rgba(16,185,129,0.15)` }}>
        <div className="trust-strip" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
          {[
            { icon: <Truck size={13} />, t: 'توصيل لـ 58 ولاية' },
            { icon: <Shield size={13} />, t: 'دفع عند الاستلام' },
            { icon: <Layers size={13} />, t: 'مخزون متجدد يومياً' },
            { icon: <Wrench size={13} />, t: 'أدوات معتمدة' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderLeft: i > 0 ? `1px solid rgba(16,185,129,0.2)` : 'none', whiteSpace: 'nowrap', color: ED, flexShrink: 0 }}>
              {item.icon}<span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{item.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <section style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <span style={{ width: 3, height: 16, background: E, borderRadius: 1, display: 'inline-block' }} />
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: INK }}>تصفح حسب الفئة</h2>
          </div>
          <div className="cats-section-grid">
            <Link href="?" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0.75rem', border: `1px solid ${!activeCategory ? E : BD}`, borderRadius: 4, background: !activeCategory ? EL : CARD, textAlign: 'center', transition: 'all 0.18s' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = E; el.style.background = EL; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = !activeCategory ? E : BD; el.style.background = !activeCategory ? EL : CARD; }}>
              <span style={{ fontSize: '1.375rem' }}>🏪</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: INK, lineHeight: 1.3 }}>الكل</span>
            </Link>
            {cats.map((cat: any, i: number) => {
              const isActive = activeCategory === String(cat.id);
              return (
              <Link key={cat.id} href={`?category=${cat.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0.75rem', border: `1px solid ${isActive ? E : BD}`, borderRadius: 4, background: isActive ? EL : CARD, textAlign: 'center', transition: 'all 0.18s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = E; el.style.background = EL; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = isActive ? E : BD; el.style.background = isActive ? EL : CARD; }}>
                <span style={{ fontSize: '1.375rem' }}>{['🔩', '🧱', '🪚', '🔨', '🪛', '⚙️'][i % 6]}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: INK, lineHeight: 1.3 }}>{cat.name}</span>
              </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" style={{ padding: cats.length ? '0 0 5rem' : '2rem 0 5rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', marginBottom: '1px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 0' }}>
            <span style={{ width: 3, height: 16, background: E, borderRadius: 1, display: 'inline-block' }} />
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: INK }}>جميع المنتجات</h2>
          </div>
          {store.count > 0 && <span style={{ fontSize: '0.72rem', color: SUB }}>{store.count} منتج</span>}
        </div>
        <div style={{ border: `1px solid ${BD}`, borderLeft: 'none', borderRight: 'none' }}>
          {products.length === 0 ? (
            <div style={{ padding: '5rem 1.5rem', textAlign: 'center', background: CARD }}>
              <Package size={36} color={BD} style={{ display: 'block', margin: '0 auto 1rem' }} />
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>لا توجد منتجات بعد</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((p: any) => {
                const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض" />;
              })}
            </div>
          )}
        </div>
        {countPage > 1 && (
          <div className="pagination" dir="rtl">
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false} style={{ height: 34, padding: '0 0.75rem', borderRadius: 4, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', background: CARD, color: SUB, fontSize: '0.8rem' }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ height: 34, padding: '0 0.75rem', borderRadius: 4, display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${isA ? E : BD}`, background: isA ? E : CARD, color: isA ? '#fff' : SUB }}>{pn}</Link>;
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false} style={{ height: 34, padding: '0 0.75rem', borderRadius: 4, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', background: CARD, color: SUB, fontSize: '0.8rem' }}>❯</Link>
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
          <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#F3F4F6', border: `1px solid ${BD}` }}>
            {allImages[sel] ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={48} color={BD} /></div>}
            {discount > 0 && <div style={{ position: 'absolute', top: 10, right: 10, background: E, color: '#fff', padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>{discount}% خصم</div>}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BD}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK }}><ChevronRight size={15} /></button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BD}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK }}><ChevronLeft size={15} /></button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="thumb-row">
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 54, height: 54, border: `1.5px solid ${sel === idx ? E : BD}`, overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'none', opacity: sel === idx ? 1 : 0.5, transition: 'all 0.15s' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="info-container">
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: E, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>مواد البناء الأساسية</p>
            <h1 style={{ fontSize: 'clamp(1.375rem,4vw,2rem)', fontWeight: 800, color: INK, marginBottom: '0.5rem', lineHeight: 1.2 }}>{product.name}</h1>
            <div style={{ display: 'flex', gap: 2, marginBottom: '1.25rem' }}>{[...Array(5)].map((_, i) => <Star key={i} size={12} style={{ fill: i < 4 ? E : 'none', color: E }} />)}</div>
            <div style={{ padding: '1rem', background: EL, border: `1px solid rgba(16,185,129,0.2)`, marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, color: SUB, marginBottom: '0.2rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>السعر</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                <span className="price-mono" style={{ fontSize: '2.25rem', fontWeight: 800, color: ED }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: SUB }}>دج</span>
              </div>
            </div>
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0.875rem', border: `1px solid ${selectedOffer === o.id ? E : BD}`, cursor: 'pointer', marginBottom: '0.375rem', background: selectedOffer === o.id ? EL : CARD, transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${selectedOffer === o.id ? E : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedOffer === o.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: E }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontWeight: 600, color: INK, fontSize: '0.875rem' }}>{o.name}</p>
                        <p style={{ fontSize: '0.7rem', color: SUB }}>الكمية: {o.quantity}</p>
                      </div>
                    </div>
                    <span className="price-mono" style={{ fontWeight: 800, color: ED }}>{o.price.toLocaleString()} دج</span>
                  </label>
                ))}
              </div>
            )}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{attr.name}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {attr.variants.map((v: any) => {
                    const isSelected = selectedVariants[attr.name] === v.value;
                    return (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={
                        attr.displayMode === 'color' ? { width: 26, height: 26, borderRadius: '50%', background: v.value, border: `1px solid ${BD}`, cursor: 'pointer', outline: `2px solid ${isSelected ? E : 'transparent'}`, outlineOffset: 2 }
                        : attr.displayMode === 'image' ? { width: 40, height: 40, backgroundImage: `url(${v.value})`, backgroundSize: 'cover', backgroundPosition: 'center', border: `2px solid ${isSelected ? E : BD}`, cursor: 'pointer', transition: 'all 0.15s' }
                        : { padding: '0.35rem 0.75rem', border: `1px solid ${isSelected ? E : BD}`, fontSize: '0.8rem', fontWeight: 600, background: isSelected ? EL : CARD, color: isSelected ? ED : SUB, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }
                      }>{attr.displayMode !== 'color' && attr.displayMode !== 'image' && v.name}</button>
                    );
                  })}
                </div>
              </div>
            ))}
            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
            {product.desc && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.125rem', borderTop: `1px solid ${BD}` }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: SUB }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
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
    {label && <p style={{ fontSize: '0.7rem', fontWeight: 700, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
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
          <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.75rem 1rem', border: `1px solid ${isAdded ? '#22C55E' : BD}`, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: isAdded ? 'rgba(34,197,94,0.05)' : CARD, color: isAdded ? '#22C55E' : SUB, transition: 'all 0.18s', fontFamily: 'inherit' }}>
            {isAdded ? <><CheckCircle2 size={14} className="anim-check" />تمت الإضافة</> : <><ShoppingCart size={14} />أضف للسلة</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} style={{ flex: 1, ...S.btnPrimary, width: 'auto' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = ED)}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = E)}>
            طلب الآن
          </button>
        </div>
      )}
      {(isOrderNow || !product.store.cart) && (
        <div className="anim-fade-up">
          {product.store.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 700, fontSize: '0.7rem', color: SUB, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} style={{ fontSize: '0.78rem', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>إلغاء</button>
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
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.customerWelaya), paddingRight: 32, fontFamily: 'inherit' }}>
                    <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingRight: 32, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>التوصيل</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.7rem', border: `1px solid ${fd.typeLivraison === t ? E : BD}`, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? EL : CARD, transition: 'all 0.15s', fontFamily: 'inherit' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 3, color: fd.typeLivraison === t ? ED : SUB }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                    {selW && <p className="price-mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: fd.typeLivraison === t ? ED : '#9CA3AF' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>الكمية</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BD}`, overflow: 'hidden', background: CARD }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: SUB, borderLeft: `1px solid ${BD}` }}><Minus size={12} /></button>
                <span style={{ width: 38, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: INK }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: E, borderRight: `1px solid ${BD}` }}><Plus size={12} /></button>
              </div>
            </div>
            <div style={{ background: EL, border: `1px solid rgba(16,185,129,0.2)`, padding: '0.875rem 1rem', marginBottom: '1rem' }}>
              {[
                { l: 'المنتج', v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', marginBottom: '0.4rem', borderBottom: `1px solid rgba(16,185,129,0.15)` }}>
                  <span style={{ fontSize: '0.8rem', color: SUB }}>{r.l}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: INK }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: INK }}>المجموع</span>
                <span className="price-mono" style={{ fontSize: '1.625rem', fontWeight: 800, color: ED }}>{total().toLocaleString()} <span style={{ fontSize: '0.75rem' }}>دج</span></span>
              </div>
            </div>
            <button type="submit" disabled={sub} style={{ ...S.btnPrimary, opacity: sub ? 0.7 : 1 }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = ED)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = E)}>
              {sub ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />جاري المعالجة...</> : 'تأكيد الطلب'}
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

  useEffect(() => { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [domain, store]);
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
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  if (success) return (
    <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', background: CARD, padding: '3rem 2rem', border: `1px solid ${BD}`, borderTop: `3px solid ${E}`, maxWidth: 440, width: '100%' }}>
        <CheckCircle2 size={40} style={{ color: E, display: 'block', margin: '0 auto 1.25rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: INK, marginBottom: '0.5rem' }}>تم استلام طلبك!</h2>
        <p style={{ color: SUB, lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9rem' }}>سنتواصل معك قريباً لتأكيد الطلب.</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: E, color: '#fff', padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.875rem', borderRadius: 4 }}>العودة للمتجر</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: `1px solid ${BD}`, maxWidth: 400, width: '100%', background: CARD }}>
        <ShoppingBag size={40} style={{ color: BD, display: 'block', margin: '0 auto 1.25rem' }} />
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '2rem' }}>السلة فارغة</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: E, color: '#fff', padding: '0.7rem 1.75rem', fontWeight: 700, fontSize: '0.875rem', borderRadius: 4 }}>تسوق الآن</Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ padding: '2rem 1.5rem', maxWidth: 1280, margin: '0 auto', minHeight: '100vh', background: BG }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <span style={{ width: 3, height: 20, background: E, borderRadius: 1, display: 'inline-block' }} />
        <h1 style={{ fontSize: 'clamp(1.375rem,5vw,2rem)', fontWeight: 800, color: INK }}>السلة</h1>
      </div>
      <div className="cart-inner">
        <div style={{ background: CARD, border: `1px solid ${BD}`, alignSelf: 'start', borderTop: `2px solid ${E}` }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.875rem', borderBottom: `1px solid ${BD}` }}>
              <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 68, height: 68, objectFit: 'cover', flexShrink: 0, border: `1px solid ${BD}` }} alt="" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, color: INK, marginBottom: '0.25rem', fontSize: '0.875rem', lineHeight: 1.35 }}>{item.product?.name}</h4>
                <p className="price-mono" style={{ fontSize: '1rem', fontWeight: 800, color: ED }}>{item.finalPrice?.toLocaleString()} دج</p>
                <p style={{ fontSize: '0.7rem', color: SUB, marginTop: '0.15rem' }}>الكمية: {item.quantity}</p>
              </div>
              <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ color: '#D1D5DB', padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', transition: 'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#EF4444')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#D1D5DB')}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <div style={{ padding: '0.875rem', background: EL, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: SUB, fontSize: '0.875rem' }}>المجموع الفرعي</span>
            <span className="price-mono" style={{ fontSize: '1.125rem', fontWeight: 800, color: ED }}>{cartTotal.toLocaleString()} دج</span>
          </div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '1.5rem', alignSelf: 'start', borderTop: `2px solid ${E}` }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: INK, marginBottom: '1.25rem' }}>معلومات التوصيل</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={inp(!!errors.name)} /></FR>
              <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={inp(!!errors.phone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.w} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.w), paddingRight: 30, fontFamily: 'inherit' }}>
                    <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingRight: 30, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ margin: '1rem 0' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: SUB, textTransform: 'uppercase' as const, marginBottom: '0.5rem', letterSpacing: '0.06em' }}>نوع التوصيل</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.7rem', border: `1px solid ${fd.typeLivraison === t ? E : BD}`, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? EL : CARD, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.78rem', color: fd.typeLivraison === t ? ED : SUB, marginBottom: 3 }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                    {selW && <p style={{ fontWeight: 800, fontSize: '0.9rem', color: fd.typeLivraison === t ? ED : '#9CA3AF' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: EL, border: `1px solid rgba(16,185,129,0.2)`, padding: '0.875rem 1rem', margin: '1rem 0' }}>
              {[{ l: 'المجموع الفرعي', v: `${cartTotal.toLocaleString()} دج` }, { l: 'التوصيل', v: getLiv() ? `${getLiv().toLocaleString()} دج` : '—' }].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', marginBottom: '0.4rem', borderBottom: `1px solid rgba(16,185,129,0.15)` }}>
                  <span style={{ fontSize: '0.78rem', color: SUB }}>{r.l}</span>
                  <span style={{ fontWeight: 600, color: INK, fontSize: '0.875rem' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, color: INK }}>الإجمالي</span>
                <span className="price-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: ED }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.75rem' }}>دج</span></span>
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = ED)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = E)}>
              {submitting ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />جاري المعالجة...</> : 'تأكيد الطلب'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const Shell = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div dir="rtl" style={{ minHeight: '100vh', background: BG }}>
    <div style={{ background: INK, paddingTop: 88, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, borderTop: `3px solid ${E}` }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: E, textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '0.625rem' }}>Everyday Hardware</p>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: '#fff' }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>{children}</div>
  </div>
);

const InfoBlock = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding: '1.125rem 0', borderBottom: `1px solid ${BD}`, display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
    <span style={{ width: 3, height: 14, background: E, borderRadius: 1, flexShrink: 0, marginTop: 5, display: 'inline-block' }} />
    <div>
      <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: INK, marginBottom: '0.3rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: SUB }}>{body}</p>
    </div>
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية">
      <div style={{ background: CARD, padding: '1.5rem', border: `1px solid ${BD}` }}>
        <InfoBlock title="البيانات التي نجمعها" body="نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم، رقم الهاتف، وعنوان التوصيل." />
        <InfoBlock title="حماية البيانات" body="تُخزن جميع البيانات بشكل مشفر. نستخدم بروتوكولات حماية معتمدة لضمان أمان معلوماتكم." />
        <InfoBlock title="مشاركة المعلومات" body="لا نقوم ببيع أو مشاركة بياناتكم مع أي جهات خارجية باستثناء شركاء التوصيل." />
      </div>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الاستخدام">
      <div style={{ background: CARD, padding: '1.5rem', border: `1px solid ${BD}` }}>
        <InfoBlock title="الحساب والمسؤولية" body="المستخدم مسؤول عن دقة البيانات المدخلة وعن الحفاظ على سرية حسابه." />
        <InfoBlock title="الطلبات والمدفوعات" body="يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الأسعار المعلنة هي الأسعار النهائية." />
        <InfoBlock title="القانون الحاكم" body="تخضع كافة التعاملات للقوانين المعمول بها في جمهورية الجزائر الديمقراطية الشعبية." />
      </div>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات تعريف الارتباط">
      <div style={{ background: CARD, padding: '1.5rem', border: `1px solid ${BD}` }}>
        <InfoBlock title="الملفات الأساسية" body="نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل سلة المشتريات وأمان جلسة الدخول." />
        <InfoBlock title="تحسين التجربة" body="نستخدم بعض الملفات لفهم كيفية استخدام الموقع وتطوير تجربة التصفح." />
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
      <div style={{ background: INK, paddingTop: 88, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, borderTop: `3px solid ${E}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: E, textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '0.625rem' }}>Everyday Hardware</p>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: '#fff' }}>تواصل معنا</h1>
        </div>
      </div>
      <div className="contact-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        <div>
          <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '1.25rem', marginBottom: '0.875rem', borderTop: `2px solid ${E}` }}>
            {[
              { icon: <Phone size={14} />, label: 'الهاتف', val: store?.contact?.phone || 'غير متوفر' },
              { icon: <MapPin size={14} />, label: 'الموقع', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || 'الجزائر' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: i === 0 ? '1rem' : 0 }}>
                <div style={{ width: 34, height: 34, background: EL, border: `1px solid rgba(16,185,129,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: E, flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <p style={{ fontSize: '0.65rem', color: SUB, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '0.1rem' }}>{r.label}</p>
                  <p style={{ fontWeight: 600, color: INK, fontSize: '0.875rem' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: EL, border: `1px solid rgba(16,185,129,0.2)`, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: ED }}>نرد في غضون ساعة</span>
          </div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '1.75rem', borderTop: `2px solid ${E}` }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <CheckCircle2 size={44} style={{ color: E, display: 'block', margin: '0 auto 1.25rem' }} />
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: INK, marginBottom: '0.5rem' }}>تم الإرسال!</h2>
              <p style={{ color: SUB, lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9rem' }}>سنرد عليك في أقرب وقت.</p>
              <button onClick={() => setSent(false)} style={{ padding: '0.7rem 1.75rem', border: `1px solid ${E}`, background: EL, color: ED, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}>إرسال رسالة أخرى</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>الاسم</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={S.input} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>الهاتف</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={S.input} />
                </div>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={S.input} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>الرسالة</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...S.input, resize: 'none' }} />
              </div>
              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = ED)}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = E)}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />جاري الإرسال...</> : <>إرسال الرسالة <ArrowLeft size={15} /></>}
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
