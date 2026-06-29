'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
    Star, Heart, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight,
    AlertCircle, Check, X, Phone, MapPin, CheckCircle2, ArrowLeft,
    Menu, Search, ShoppingCart, Minus, Plus, Trash2, Loader2, Package,
    Shield, Truck, Sparkles, Lock, Mail,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   PET LOVER'S PARADISE
   Palette: Amber · Warm Brown · Fresh Green · Sky Blue · Cream
   Font: Nunito + Playfair Display
══════════════════════════════════════════════════════════════ */
const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --amber:      #FBBF24;
    --amber-lt:   #FEF3C7;
    --amber-dk:   #D97706;
    --brown:      #92400E;
    --brown-lt:   #FEF9EE;
    --green:      #34D399;
    --green-lt:   #D1FAE5;
    --green-dk:   #059669;
    --sky:        #7DD3FC;
    --sky-lt:     #E0F2FE;
    --sky-dk:     #0284C7;
    --orange:     #FB923C;
    --orange-lt:  #FED7AA;
    --cream:      #FFFBEB;
    --bg:         #FAFAF8;
    --white:      #FFFFFF;
    --text:       #292524;
    --text-mid:   #78716C;
    --text-soft:  #A8A29E;
    --border:     #E7E5E4;
    --shadow:     rgba(251,191,36,0.22);
  }

  body {
    font-family: 'Nunito', sans-serif;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }
  a { text-decoration: none; color: inherit; }
  .font-serif { font-family: 'Playfair Display', serif; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--amber); border-radius: 99px; }

  /* ── Animations ── */
  @keyframes tail-wag    { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(12deg)} }
  @keyframes soft-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes soft-fade   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes paw-drift   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes pulse-warm  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  @keyframes spin-gentle { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in    { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

  .anim-bounce { animation: soft-bounce 3s ease-in-out infinite; }
  .anim-fade   { animation: soft-fade 0.6s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-pulse  { animation: pulse-warm 3s ease-in-out infinite; }
  .anim-check  { animation: check-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
  .anim-wag    { animation: tail-wag 0.6s ease-in-out infinite; display:inline-block; }

  /* ── Paw ticker ── */
  .paw-wrap  { overflow: hidden; white-space: nowrap; }
  .paw-inner { display: inline-block; animation: paw-drift 35s linear infinite; }

  /* ── Warm card hover ── */
  .warm-card {
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease, border-color 0.3s;
  }
  .warm-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 52px var(--shadow);
  }

  .btn-warm {
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease;
  }
  .btn-warm:hover  { transform: translateY(-2px); }
  .btn-warm:active { transform: translateY(1px); }

  /* ── Warm dots pattern ── */
  .warm-dots {
    background-image:
      radial-gradient(circle, rgba(251,191,36,0.18) 2px, transparent 2px),
      radial-gradient(circle, rgba(52,211,153,0.13) 2px, transparent 2px),
      radial-gradient(circle, rgba(125,211,252,0.11) 2px, transparent 2px);
    background-size: 30px 30px, 52px 52px, 42px 42px;
    background-position: 0 0, 13px 13px, 26px 26px;
  }

  /* ── Nav responsive ── */
  .nav-desktop-links  { display: none; align-items: center; gap: 1.5rem; }
  .nav-desktop-search { display: none; }
  .nav-mobile-btns    { display: flex; align-items: center; gap: 0.5rem; }
  @media (min-width: 1024px) {
    .nav-desktop-links  { display: flex; }
    .nav-desktop-search { display: block; }
    .nav-mobile-btns    { display: none; }
  }

  /* ── Grids ── */
  .products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); gap: 1.5rem; } }

  .trust-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  @media (min-width: 1024px) { .trust-grid { grid-template-columns: repeat(4, 1fr); } }

  .details-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 768px) { .details-layout { grid-template-columns: 1fr 1fr; gap: 3rem; } }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }
  @media (min-width: 540px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

  .cart-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) { .cart-layout { grid-template-columns: 1.1fr 1fr; gap: 3rem; } }

  .footer-cols {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.15);
  }
  @media (min-width: 768px) { .footer-cols { grid-template-columns: 1.8fr 1fr 1fr; } }

  .hero-actions { display: flex; flex-direction: column; gap: 0.875rem; }
  @media (min-width: 540px) { .hero-actions { flex-direction: row; align-items: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 540px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .thumb-row { display: flex; gap: 0.625rem; overflow-x: auto; padding-bottom: 4px; margin-top: 0.75rem; }
  .pagination { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 3rem; }
  .contact-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .contact-layout { grid-template-columns: 1fr 1.5fr; } }

  .cart-badge {
    position: absolute; top: -4px; right: -4px;
    width: 17px; height: 17px; border-radius: 50%;
    background: var(--amber-dk); color: #fff;
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--bg);
  }
`;

/* ─── Paw print deco ─── */
const PawDeco = ({ style = {} as any }) => (
    <svg viewBox="0 0 100 100" fill="currentColor" style={{ display: 'inline-block', ...style }}>
        <ellipse cx="50" cy="68" rx="28" ry="22" />
        <ellipse cx="24" cy="44" rx="11" ry="13" />
        <ellipse cx="50" cy="36" rx="11" ry="13" />
        <ellipse cx="76" cy="44" rx="11" ry="13" />
        <ellipse cx="36" cy="30" rx="8" ry="9" />
        <ellipse cx="64" cy="30" rx="8" ry="9" />
    </svg>
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
const INP = (err?: boolean): React.CSSProperties => ({
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600,
    background: '#fff', border: `2px solid ${err ? '#FB923C' : 'var(--border)'}`,
    borderRadius: 14, color: 'var(--text)', outline: 'none',
    fontFamily: "'Nunito', sans-serif", transition: 'border-color 0.2s', appearance: 'none'
});
const BTN_PRI: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '0.875rem 1.75rem', borderRadius: 50, border: 'none', cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '0.925rem',
    background: 'linear-gradient(135deg, #D97706, #92400E)',
    color: '#fff', boxShadow: '0 6px 24px rgba(217,119,6,0.3)', transition: 'all 0.25s'
};

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
    <div>
        {label && <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>{label}</label>}
        {children}
        {error && <p style={{ fontSize: '0.72rem', color: '#F43F5E', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
    </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Nunito', sans-serif" }}>
            <style>{THEME_CSS}</style>
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
    const [searchQuery, setSearchQuery] = useState('');
    const [listSearch, setListSearch] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const router = useRouter();
    const count = useCartStore(s => s.count);
    const initCount = useCartStore(s => s.initCount);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 15);
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
            try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); setListSearch(data.products || []); }
            catch { } finally { setLoading(false); }
        }, 380);
        return () => clearTimeout(t);
    }, [searchQuery, domain]);

    const doSearch = (e?: React.FormEvent) => { if (e) e.preventDefault(); if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setSearchQuery(''); setShowSearch(false); } };

    const Drop = () => (
        <div style={{
            paddingTop: 28,
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            left: 0,
            background: '#fff',
            border: '2px solid var(--amber-lt)',
            borderRadius: 18,
            boxShadow: '0 16px 48px rgba(251,191,36,0.2)',
            zIndex: 200
        }}>
            <button className='absolute cursor-pointer hover:text-red-400 top-3 left-3' onClick={() => setSearchQuery('')}>
                <X size={14} />
            </button>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--amber-dk)', fontSize: '0.875rem', fontWeight: 700 }}>🐾 جاري البحث...</div>
                ) : listSearch.length > 0 ? (
                    <>
                        {listSearch.map((p: any) => (
                            <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSearchQuery('')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--amber-lt)' }}>
                                <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                                    style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--amber-lt)', flexShrink: 0 }} alt="" />
                                <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--amber-dk)', fontWeight: 700 }}>{p.price} دج</div>
                                </div>
                            </Link>
                        ))}
                        <button onClick={doSearch} style={{ width: '100%', padding: '12px', background: 'var(--amber-lt)', border: 'none', borderTop: '1px solid var(--amber)', color: 'var(--amber-dk)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            عرض جميع النتائج <ArrowLeft size={14} />
                        </button>
                    </>
                ) : searchQuery.length >= 2 && (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.875rem' }}>لا توجد نتائج 🐾</div>
                )}
            </div>
        </div>
    );

    return (
        <>
        {store?.topBar?.enabled && store?.topBar?.text && (
            <div style={{ background: 'linear-gradient(90deg, #92400E 0%, #D97706 50%, #FBBF24 100%)', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700 }}>
                {store.topBar.text}
            </div>
        )}
        <nav dir="rtl" style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: scrolled ? 'rgba(250,250,248,0.96)' : 'var(--bg)',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: `1px solid ${scrolled ? 'var(--amber-lt)' : 'transparent'}`,
            boxShadow: scrolled ? '0 4px 24px rgba(251,191,36,0.12)' : 'none',
            transition: 'all 0.35s ease'
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #FBBF24 0%, #FB923C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {(store.design?.logoUrl && store.design.logoUrl !== '/default-logo.png')
                            ? <img src={store.design.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            : <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{(store?.name || 'P')[0]}</span>}
                    </div>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{store?.name}</span>
                </Link>

                {/* Desktop search */}
                <div className="nav-desktop-search" style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
                    <form onSubmit={doSearch}>
                        <input type="text" placeholder="ابحث هنا... 🐾" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.75rem', borderRadius: 50, border: '2px solid var(--amber-lt)', background: '#fff', fontSize: '0.875rem', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s', fontFamily: "'Nunito', sans-serif" }}
                            onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--amber-lt)')} />
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--amber)' }} />
                    </form>
                    {searchQuery.length >= 2 && <Drop />}
                </div>

                {/* Desktop links */}
                <div className="nav-desktop-links">
                    {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل معنا' }].map(i => (
                        <Link key={i.h} href={i.h} style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-mid)', transition: 'color 0.2s', padding: '0.375rem 0.875rem', borderRadius: 50 }}
                            onMouseEnter={e => { const el = e.currentTarget; el.style.color = 'var(--amber-dk)'; el.style.background = 'var(--amber-lt)'; }}
                            onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--text-mid)'; el.style.background = 'transparent'; }}>
                            {i.l}
                        </Link>
                    ))}
                    {store?.cart !== false && (
                        <Link href="/cart" className="btn-warm" style={{ position: 'relative', width: 44, height: 44, borderRadius: 14, border: '2px solid var(--amber-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-dk)' }}>
                            <ShoppingCart size={18} />
                            {count > 0 && <span className="cart-badge">{count}</span>}
                        </Link>
                    )}
                </div>

                {/* Mobile */}
                <div className="nav-mobile-btns">
                    <button onClick={() => setShowSearch(!showSearch)} style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--amber-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--amber-dk)' }}><Search size={17} /></button>

                    {store?.cart !== false && (
                        <Link href="/cart" style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, border: '2px solid var(--amber-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-dk)' }}>
                            <ShoppingCart size={17} />
                            {count > 0 && <span className="cart-badge">{count}</span>}
                        </Link>
                    )}

                    <button onClick={() => setOpen(!open)} style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--amber-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--amber-dk)' }}>
                        {open ? <X size={17} /> : <Menu size={17} />}
                    </button>
                </div>
            </div>

            {/* Mobile search */}
            {showSearch && (
                <div style={{ padding: '0.625rem 1.25rem', background: '#fff', borderTop: '1px solid var(--amber-lt)', position: 'relative' }}>
                    <form onSubmit={doSearch} style={{ position: 'relative' }}>
                        <input autoFocus type="text" placeholder="ابحث هنا..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ ...INP(), padding: '0.75rem 1rem 0.75rem 2.75rem' }} />
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--amber)' }} />
                    </form>
                    {searchQuery.length >= 2 && <Drop />}
                </div>
            )}

            {/* Mobile nav */}
            <div style={{ overflow: 'hidden', maxHeight: open ? 180 : 0, transition: 'max-height 0.3s ease', background: '#fff', borderTop: open ? '1px solid var(--amber-lt)' : 'none' }}>
                <div style={{ padding: '0.5rem 1.25rem 1rem' }}>
                    {[{ h: '/', l: '🏠 الرئيسية' }, { h: '/contact', l: '📞 تواصل معنا' }].map(i => (
                        <Link key={i.h} href={i.h} onClick={() => setOpen(false)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--amber-lt)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                            {i.l} <ArrowLeft size={14} style={{ color: 'var(--amber-dk)' }} />
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
    return (
        <footer dir="rtl" style={{ background: 'linear-gradient(135deg, #451A03 0%, #92400E 50%, #78350F 100%)', color: '#fff', padding: '4rem 1.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Paw deco */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.07, pointerEvents: 'none' }}>
                <div className="paw-wrap">
                    <div className="paw-inner" style={{ color: '#fff' }}>
                        {Array(8).fill(null).map((_, i) => <PawDeco key={i} style={{ width: 80, height: 80, margin: '0 1.5rem' }} />)}
                        {Array(8).fill(null).map((_, i) => <PawDeco key={`b${i}`} style={{ width: 80, height: 80, margin: '0 1.5rem' }} />)}
                    </div>
                </div>
            </div>
            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div className="footer-cols">
                    {/* قسم 1 */}
                    <div>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '0.875rem' }}>{store?.name}</h3>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 300 }}>
                            {store?.hero?.subtitle?.substring(0, 90) || '🐾 كل ما يحتاجه حيوانك الأليف بأمان وحب. منتجات مختارة بعناية لرفيق حياتك.'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', fontSize: '1.5rem' }}>
                            {['🐶', '🐱', '🐹', '🐰', '🦜'].map((e, i) => (
                                <span key={i} style={{ animation: `soft-bounce ${3 + i * 0.4}s ${i * 0.25}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>
                            ))}
                        </div>
                        <p style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.</p>
                    </div>
                    {/* قسم 2 */}
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>روابط سريعة</h4>
                        {[{ h: '/', l: 'الرئيسية' }, { h: '/cart', l: 'سلة التسوق' }, { h: '/contact', l: 'تواصل معنا' }, { h: '/Privacy', l: 'سياسة الخصوصية' }, { h: '/Terms', l: 'الشروط والأحكام' }].map((lnk, i) => (
                            <a key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.625rem', transition: 'all 0.2s' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#fff'; el.style.paddingRight = '8px'; }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(255,255,255,0.6)'; el.style.paddingRight = '0'; }}>
                                {lnk.l}
                            </a>
                        ))}
                    </div>
                    {/* قسم 3 */}
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>تواصل معنا</h4>
                        {[
                            { e: '📞', v: store?.contact?.phone },
                            { e: '📍', v: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
                            { e: '📧', v: store?.contact?.email },
                        ].filter(r => r.v).map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.625rem' }}>
                                <span>{r.e}</span>{r.v}
                            </div>
                        ))}
                        <div style={{ marginTop: '1.5rem', padding: '1.125rem', borderRadius: 18, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', display: 'inline-block' }} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>نرد بكل اهتمام 🐾</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>خلال 24 ساعة</p>
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
    const [hov, setHov] = useState(false);
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
    const palettes = [
        { bg: 'var(--amber-lt)', accent: 'var(--amber-dk)', tag: 'var(--amber)' },
        { bg: 'var(--green-lt)', accent: 'var(--green-dk)', tag: 'var(--green)' },
        { bg: 'var(--sky-lt)', accent: 'var(--sky-dk)', tag: 'var(--sky)' },
        { bg: 'var(--orange-lt)', accent: '#C2410C', tag: 'var(--orange)' },
        { bg: 'var(--brown-lt)', accent: 'var(--brown)', tag: 'var(--amber)' },
    ];
    const idValue = typeof product.id === 'string' ? product.id.length : (product.id || 0);
    const pal = palettes[idValue % palettes.length] || palettes[0];

    return (
        <div className="warm-card" style={{ background: '#fff', border: `2px solid ${hov ? pal.accent : 'var(--border)'}`, borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '1/1', background: pal.bg, overflow: 'hidden' }}>
                {displayImage
                    ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>🐾</div>}
                {discount > 0 && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: pal.accent, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>
                        -{discount}%
                    </div>
                )}
                <button style={{ position: 'absolute', top: 10, left: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)' }}>
                    <Heart size={14} />
                </button>
            </div>
            {/* Info */}
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: '0.5rem' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} style={{ fill: i < 4 ? '#FBBF24' : 'none', color: '#FBBF24' }} />)}
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                </h3>
                <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: pal.accent }}>{price.toLocaleString()}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)' }}>{store?.currency || 'دج'}</span>
                        {orig > price && <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
                    </div>
                    <Link href={`/product/${product.slug || product.id}`} className="btn-warm" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        width: '100%', padding: '0.65rem', borderRadius: 50, fontSize: '0.83rem', fontWeight: 700,
                        background: hov ? pal.accent : pal.bg,
                        color: hov ? '#fff' : pal.accent,
                        border: `2px solid ${pal.accent}30`,
                        transition: 'all 0.25s'
                    }}>
                        {viewDetails}
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
    const products: any[] = store.products || [];
    const cats: any[] = store.categories || [];
    if (!page) page = 1;
    const countPage = Math.ceil((store.count || products.length) / 48);

    return (
        <div dir="rtl">
            {/* ── HERO ── */}
            <section className="warm-dots" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Paw deco bg */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06, pointerEvents: 'none' }}>
                    <div className="paw-wrap">
                        <div className="paw-inner" style={{ color: 'var(--amber-dk)' }}>
                            {Array(10).fill(null).map((_, i) => <PawDeco key={i} style={{ width: 100, height: 100, margin: '1rem 2rem' }} />)}
                            {Array(10).fill(null).map((_, i) => <PawDeco key={`b${i}`} style={{ width: 100, height: 100, margin: '1rem 2rem' }} />)}
                        </div>
                    </div>
                </div>

                {/* Radial glows */}
                <div style={{ position: 'absolute', top: '10%', left: '65%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.2), transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '50%', right: '75%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.15), transparent 70%)', pointerEvents: 'none' }} />

                {store.hero?.imageUrl && (
                    <div style={{ position: 'absolute', inset: 0 }}>
                        <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1 }} />
                    </div>
                )}

                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '7rem 1.5rem 4rem', position: 'relative', zIndex: 1, width: '100%' }}>
                    <div className="anim-fade" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.5rem 1.25rem', borderRadius: 50, background: 'rgba(251,191,36,0.15)', border: '1.5px solid rgba(251,191,36,0.4)', marginBottom: '1.5rem' }}>
                        <PawDeco style={{ width: 18, height: 18, color: 'var(--amber-dk)' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--amber-dk)' }}>{store?.name} — جنة محبي الحيوانات</span>
                    </div>
                    <h1 className="anim-fade font-serif" style={{ fontSize: 'clamp(2.75rem, 7vw, 5.5rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || 'كل ما يحتاجه<br/>رفيقك الوفي') }} />
                    <div style={{ height: 3, width: 80, borderRadius: 99, background: 'linear-gradient(90deg, var(--amber), var(--green), var(--sky))', marginBottom: '1.5rem' }} />
                    <p className="anim-fade" style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-mid)', maxWidth: 480, lineHeight: 1.75, marginBottom: '2.5rem' }}>
                        {store.hero?.subtitle || '🐾 منتجات عالية الجودة ومأمونة تماماً لكل أفراد عائلتك — بمن فيهم ذوي الفراء.'}
                    </p>
                    <div className="hero-actions">
                        <a href="#products" className="btn-warm" style={{ ...BTN_PRI, textDecoration: 'none' }}>
                            اكتشف المنتجات 🐾
                        </a>
                        {store?.cart !== false && (
                            <Link href="/cart" className="btn-warm" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 1.75rem', borderRadius: 50, border: '2px solid var(--amber)', background: '#fff', color: 'var(--amber-dk)', fontWeight: 700, fontSize: '0.925rem' }}>
                                السلة
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ── TRUST ── */}
            <div style={{ background: '#fff', borderTop: '1px solid var(--amber-lt)', borderBottom: '1px solid var(--amber-lt)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
                    <div className="trust-grid" style={{ padding: '1.5rem 0' }}>
                        {[
                            { e: '🛡️', t: 'آمن 100%', d: 'مواد طبيعية معتمدة' },
                            { e: '🚀', t: 'توصيل سريع', d: 'لجميع الولايات' },
                            { e: '🐾', t: 'جودة عالية', d: 'موثوق من قِبل الخبراء' },
                            { e: '💝', t: 'بحب واهتمام', d: 'لأصدقائنا الصغار' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', borderLeft: i < 3 ? '1px solid var(--amber-lt)' : 'none' }}>
                                <span style={{ fontSize: '1.75rem' }}>{item.e}</span>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{item.t}</p>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-soft)' }}>{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CATEGORIES ── */}
            {cats.length > 0 && (
                <section style={{ padding: '4rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
                    <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, textAlign: 'center', color: 'var(--text)', marginBottom: '2rem' }}>
                        تسوق حسب الفئة
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.625rem' }}>
                        {cats.map((cat: any, idx: number) => {
                            const cs = ['var(--amber-dk)', 'var(--green-dk)', 'var(--sky-dk)', '#C2410C', 'var(--brown)'];
                            const lts = ['var(--amber-lt)', 'var(--green-lt)', 'var(--sky-lt)', 'var(--orange-lt)', 'var(--brown-lt)'];
                            const c = cs[idx % cs.length]; const lt = lts[idx % lts.length];
                            return (
                                <Link key={cat.id} href={`?category=${cat.id}`} className="btn-warm" style={{ padding: '0.625rem 1.5rem', borderRadius: 50, border: `2px solid ${c}30`, color: c, background: lt, fontSize: '0.875rem', fontWeight: 700, transition: 'all 0.25s' }}
                                    onMouseEnter={e => { const el = e.currentTarget; el.style.background = c; el.style.color = '#fff'; }}
                                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = lt; el.style.color = c; }}>
                                    {cat.name}
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── PRODUCTS ── */}
            <section id="products" style={{ padding: '1rem 1.5rem 6rem', maxWidth: 1280, margin: '0 auto' }}>
                <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, textAlign: 'center', color: 'var(--text)', marginBottom: '0.5rem' }}>
                    منتجاتنا المختارة
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2.5rem' }}>كل شيء يحتاجه رفيقك 🐾</p>

                {products.length === 0 ? (
                    <div className="warm-dots" style={{ padding: '5rem', textAlign: 'center', border: '2px dashed var(--amber)', borderRadius: 24, background: 'var(--amber-lt)' }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🐾</span>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: 'var(--amber-dk)' }}>لا توجد منتجات حالياً</p>
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
                        <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 12, border: '2px solid var(--amber-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: 'var(--amber-dk)', opacity: page <= 1 ? 0.3 : 1 }}>❮</Link>
                        {Array.from({ length: countPage }).map((_, i) => {
                            const pn = i + 1; const isA = Number(page) === pn;
                            return (
                                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, border: `2px solid ${isA ? 'var(--amber-dk)' : 'var(--amber-lt)'}`, background: isA ? 'var(--amber-dk)' : '#fff', color: isA ? '#fff' : 'var(--text-mid)' }}>
                                    {pn}
                                </Link>
                            );
                        })}
                        <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 12, border: '2px solid var(--amber-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: 'var(--amber-dk)', opacity: page >= countPage ? 0.3 : 1 }}>❯</Link>
                    </div>
                )}
            </section>

            {/* ── WARM BANNER ── */}
            <section style={{ background: 'linear-gradient(135deg, var(--amber-lt), var(--green-lt), var(--sky-lt))', padding: '5rem 1.5rem', textAlign: 'center' }}>
                <span className="anim-bounce" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.25rem' }}>🐶</span>
                <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--brown)', marginBottom: '1rem' }}>
                    لأنهم يستحقون الأفضل
                </h2>
                <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-mid)', maxWidth: 500, margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    منتجات مختارة بعناية فائقة لصحة وسعادة رفيقك الأليف في كل يوم
                </p>
                <a href="#products" className="btn-warm" style={{ ...BTN_PRI, textDecoration: 'none' }}>
                    تسوق الآن 🐾
                </a>
            </section>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   DETAILS
══════════════════════════════════════════════════════════════ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
    const [sel, setSel] = useState(0);

    return (
        <div dir="rtl" style={{ background: 'var(--bg)', paddingBottom: '4rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                <div className="details-layout">
                    {/* Gallery */}
                    <div style={{ top: 84 }}>
                        <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 24, overflow: 'hidden', background: 'var(--amber-lt)', border: '2px solid var(--amber-lt)' }}>
                            {allImages[sel] ? <img src={allImages[sel]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🐾</div>}
                            {discount > 0 && <div style={{ position: 'absolute', top: 14, right: 14, background: 'var(--amber-dk)', color: '#fff', padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700 }}>خصم {discount}%</div>}
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
                                    <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
                                </>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="thumb-row">
                                {allImages.map((img: string, idx: number) => (
                                    <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 62, height: 62, borderRadius: 14, overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--amber-dk)' : 'var(--border)'}`, opacity: sel === idx ? 1 : 0.55, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.2s' }}>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <div style={{ background: '#fff', borderRadius: 24, padding: '2rem', border: '2px solid var(--amber-lt)' }}>
                            <h1 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem', lineHeight: 1.2 }}>{product.name}</h1>
                            <div style={{ display: 'flex', gap: 3, marginBottom: '1.25rem' }}>
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} style={{ fill: i < 4 ? '#FBBF24' : 'none', color: '#FBBF24' }} />)}
                            </div>
                            <div style={{ background: 'var(--amber-lt)', borderRadius: 18, padding: '1.125rem', marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber-dk)', marginBottom: '0.375rem' }}>السعر</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                                    <span className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--amber-dk)' }}>{finalPrice.toLocaleString()}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-mid)' }}>دج</span>
                                </div>
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 1rem', borderRadius: 50, fontWeight: 700, fontSize: '0.82rem', marginBottom: '1.5rem', background: autoGen ? 'var(--amber-lt)' : inStock ? 'var(--green-lt)' : '#FFE4E6', color: autoGen ? 'var(--amber-dk)' : inStock ? 'var(--green-dk)' : '#E11D48' }}>
                                
                            </div>

                            {product.offers?.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    {product.offers.map((o: any) => (
                                        <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: `2px solid ${selectedOffer === o.id ? 'var(--amber-dk)' : 'var(--border)'}`, borderRadius: 16, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? 'var(--amber-lt)' : 'transparent', transition: 'all 0.2s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? 'var(--amber-dk)' : 'var(--border)'}`, background: selectedOffer === o.id ? 'var(--amber-dk)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {selectedOffer === o.id && <Check size={11} color="#fff" />}
                                                </div>
                                                <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.name}</p>
                                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600 }}>الكمية: {o.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--amber-dk)' }}>{o.price.toLocaleString()} دج</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {allAttrs.map((attr: any) => (
                                <div key={attr.id} style={{ marginBottom: '1.25rem' }}>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--amber-dk)', marginBottom: '0.625rem' }}>{attr.name}</p>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {attr.variants.map((v: any) => {
                                            const isSelected = selectedVariants[attr.name] === v.value;
                                            if (attr.displayMode === 'color') {
                                                return (
                                                    <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                                                        style={{ width: 32, height: 32, borderRadius: '50%', background: v.value, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', outline: `2px solid ${isSelected ? 'var(--amber-dk)' : 'transparent'}`, outlineOffset: 2, transition: '0.2s all' }}
                                                        title={v.name} />
                                                );
                                            }
                                            if (attr.displayMode === 'image') {
                                                return (
                                                    <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                                                        style={{ width: 40, height: 40, borderRadius: 10, backgroundImage: `url(${v.value})`, backgroundSize: 'cover', backgroundPosition: 'center', border: isSelected ? '2px solid var(--amber-dk)' : '2px solid var(--border)', cursor: 'pointer', transition: '0.2s all' }} />
                                                );
                                            }
                                            return (
                                                <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                                                    style={{ padding: '0.4rem 1.125rem', border: `2px solid ${isSelected ? 'var(--amber-dk)' : 'var(--border)'}`, borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', background: isSelected ? 'var(--amber-lt)' : '#fff', color: isSelected ? 'var(--amber-dk)' : 'var(--text-mid)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                                                    {v.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

                            {product.desc && (
                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--amber-lt)' }}>
                                    <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.875rem' }}>وصف المنتج</h3>
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

/* ══════════════════════════════════════════════════════════════
   PRODUCT FORM
══════════════════════════════════════════════════════════════ */
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
        if (!fd.customerName.trim()) e.customerName = 'مطلوب';
        if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = 'رقم هاتف غير صالح (مثال: 0550123456)';
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
            router.push(`/${domain}/successfully`);
        } catch { } finally { setSub(false); }
    };

    return (
        <div style={{ paddingTop: '1.5rem', borderTop: '2px solid var(--amber-lt)', marginTop: '1.5rem' }}>
        {product.store?.cart && (
                <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
                    <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0.875rem', borderRadius: 50, cursor: isAdded ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', border: `2px solid ${isAdded ? 'var(--green-dk)' : 'var(--amber)'}`, background: isAdded ? 'var(--green-lt)' : '#fff', color: isAdded ? 'var(--green-dk)' : 'var(--amber-dk)', transition: 'all 0.25s' }}>
                        {isAdded ? <><CheckCircle2 size={15} className="anim-check" /> تمت الإضافة 🐾</> : <><ShoppingCart size={15} /> أضف للسلة</>}
                    </button>
                    <button onClick={() => setIsOrderNow(true)} className="btn-warm" style={{ flex: 1, ...BTN_PRI, width: 'auto', borderRadius: 50 }}>
                        اطلب الآن 🐾
                    </button>
                </div>
            )}

            {(isOrderNow || !product.store?.cart) && (
                <div className="anim-fade">
                    {product.store?.cart && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--amber-dk)' }}>بيانات التوصيل</p>
                            <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.375rem 0.75rem', borderRadius: 50, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--text-soft)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                <X size={11} /> إلغاء
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                            <FR error={errors.customerName} label="الاسم الكامل">
                                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم" style={INP(!!errors.customerName)} />
                            </FR>
                            <FR error={errors.customerPhone} label="رقم الهاتف">
                                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0XXXXXXXXX" style={INP(!!errors.customerPhone)} />
                            </FR>
                        </div>
                        <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                            <FR error={errors.customerWelaya} label="الولاية">
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--amber)', pointerEvents: 'none' }} />
                                    <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.customerWelaya), paddingLeft: 32, fontFamily: 'inherit' }}>
                                        <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                            <FR error={errors.customerCommune} label="البلدية">
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--amber)', pointerEvents: 'none' }} />
                                    <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.customerCommune), paddingLeft: 32, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}>
                                        <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                        </div>

                        <div style={{ marginBottom: '0.875rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.5rem' }}>نوع التوصيل</p>
                            <div className="delivery-grid">
                                {(['home', 'office'] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.875rem', border: `2px solid ${fd.typeLivraison === t ? 'var(--amber-dk)' : 'var(--border)'}`, borderRadius: 16, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'var(--amber-lt)' : '#fff', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                                        <span style={{ display: 'block', fontSize: '1.375rem', marginBottom: 4 }}>{t === 'home' ? '🏠' : '🏢'}</span>
                                        <p style={{ fontWeight: 700, fontSize: '0.82rem', color: fd.typeLivraison === t ? 'var(--amber-dk)' : 'var(--text-soft)' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                                        {selW && <p className="font-serif" style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === t ? 'var(--amber-dk)' : 'var(--text-soft)' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '0.875rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.5rem' }}>الكمية</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '2px solid var(--amber-lt)', borderRadius: 50, overflow: 'hidden', background: '#fff' }}>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amber-dk)' }}><Minus size={14} /></button>
                                <span style={{ width: 44, textAlign: 'center', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700 }}>{fd.quantity}</span>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amber-dk)' }}><Plus size={14} /></button>
                            </div>
                        </div>

                        {/* Summary */}
                        <div style={{ background: 'var(--amber-lt)', borderRadius: 20, padding: '1.125rem', marginBottom: '1.25rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--amber-dk)', marginBottom: '0.75rem' }}>ملخص الطلب</p>
                            {[
                                { l: 'المنتج', v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
                                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
                            ].map(r => (
                                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(251,191,36,0.3)' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-mid)' }}>{r.l}</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>{r.v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.375rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--amber-dk)' }}>المجموع</span>
                                <span className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--amber-dk)' }}>{total().toLocaleString()} <span style={{ fontSize: '0.85rem', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>دج</span></span>
                            </div>
                        </div>

                        <button type="submit" disabled={sub} className="btn-warm" style={{ ...BTN_PRI, width: '100%', opacity: sub ? 0.7 : 1, cursor: sub ? 'not-allowed' : 'pointer' }}>
                            {sub ? <><Loader2 size={16} style={{ animation: 'spin-gentle 1s linear infinite' }} /> جاري المعالجة...</> : '🐾 تأكيد الطلب'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-soft)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <Lock size={11} style={{ color: 'var(--amber)' }} /> دفع آمن ومشفر
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
        if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = 'رقم هاتف غير صالح (مثال: 0550123456)';
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
        <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
            <div className="anim-fade" style={{ textAlign: 'center', background: '#fff', padding: '4rem 2.5rem', borderRadius: 28, border: '2px solid var(--amber-lt)', maxWidth: 460, width: '100%', boxShadow: '0 12px 40px var(--shadow)' }}>
                <span className="anim-bounce" style={{ fontSize: '4rem', display: 'block', marginBottom: '1.25rem' }}>🐾</span>
                <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--amber-dk)', marginBottom: '0.625rem' }}>تم استلام طلبك!</h2>
                <p style={{ color: 'var(--text-mid)', fontWeight: 600, marginBottom: '2rem', lineHeight: 1.7 }}>شكراً لثقتك بنا. سنتواصل معك قريباً لتأكيد الطلب 🐾</p>
                <Link href="/" className="btn-warm" style={{ ...BTN_PRI, textDecoration: 'none', display: 'inline-flex' }}>العودة للمتجر</Link>
            </div>
        </div>
    );

    if (!items.length) return (
        <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
            <div className="warm-dots" style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--amber)', borderRadius: 28, maxWidth: 400, width: '100%', background: 'var(--amber-lt)' }}>
                <ShoppingBag size={52} style={{ color: 'var(--amber)', display: 'block', margin: '0 auto 1.25rem', opacity: 0.5 }} />
                <p className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber-dk)', marginBottom: '1.75rem' }}>السلة فارغة 🐾</p>
                <Link href="/" className="btn-warm" style={{ ...BTN_PRI, textDecoration: 'none', display: 'inline-flex' }}>تسوق الآن</Link>
            </div>
        </div>
    );

    return (
        <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2.5rem 1.5rem 5rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '2rem' }}>🛒 سلة التسوق</h1>
                <div className="cart-layout">
                    {/* Items */}
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px solid var(--amber-lt)', overflow: 'hidden', alignSelf: 'start' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--amber-lt)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--amber-lt)' }}>
                            <Package size={17} style={{ color: 'var(--amber-dk)' }} />
                            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--amber-dk)', fontSize: '1rem' }}>منتجاتك ({items.length})</span>
                        </div>
                        {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--amber-lt)' }}>
                                <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 76, height: 76, borderRadius: 16, objectFit: 'cover', border: '2px solid var(--amber-lt)', flexShrink: 0 }} alt="" />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{item.product?.name}</h4>
                                    <p className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--amber-dk)' }}>{item.finalPrice?.toLocaleString()} دج</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 600, marginTop: '0.2rem' }}>الكمية: {item.quantity}</p>
                                </div>
                                <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--border)', cursor: 'pointer', alignSelf: 'center', display: 'flex', padding: '0.375rem', borderRadius: 8, transition: 'color 0.2s' }}
                                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#FB923C')}
                                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--border)')}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <div style={{ padding: '1rem 1.25rem', background: 'var(--amber-lt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--amber-dk)' }}>المجموع الفرعي</span>
                            <span className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber-dk)' }}>{cartTotal.toLocaleString()} دج</span>
                        </div>
                    </div>

                    {/* Checkout */}
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px solid var(--amber-lt)', padding: '1.75rem', alignSelf: 'start' }}>
                        <h3 className="font-serif" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--amber-dk)', marginBottom: '1.5rem' }}>معلومات التوصيل</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row-2" style={{ marginBottom: '0.75rem' }}>
                                <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={INP(!!errors.name)} /></FR>
                                <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={INP(!!errors.phone)} /></FR>
                            </div>
                            <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                                <FR error={errors.w} label="الولاية">
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--amber)', pointerEvents: 'none' }} />
                                        <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.w), paddingLeft: 32, fontFamily: 'inherit' }}>
                                            <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                        </select>
                                    </div>
                                </FR>
                                <FR error={errors.c} label="البلدية">
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--amber)', pointerEvents: 'none' }} />
                                        <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.c), paddingLeft: 32, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}>
                                            <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                        </select>
                                    </div>
                                </FR>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-dk)', textTransform: 'uppercase', marginBottom: '0.625rem', letterSpacing: '0.04em' }}>🚚 نوع التوصيل</p>
                                <div className="delivery-grid">
                                    {(['home', 'office'] as const).map(t => (
                                        <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))}
                                            style={{ padding: '0.875rem', border: `2px solid ${fd.typeLivraison === t ? 'var(--amber)' : 'var(--amber-lt)'}`, borderRadius: 16, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'var(--amber-lt)' : '#fff', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                                            <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: 4 }}>{t === 'home' ? '🏠' : '🏢'}</span>
                                            <p style={{ fontWeight: 700, fontSize: '0.8rem', color: fd.typeLivraison === t ? 'var(--amber-dk)' : 'var(--text-soft)' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                                            {selW && <p className="font-serif" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--amber-dk)', marginTop: 3 }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: 'var(--amber-lt)', borderRadius: 18, padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(251,191,36,0.35)' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-mid)' }}>المجموع الفرعي</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cartTotal.toLocaleString()} دج</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.625rem', marginBottom: '0.625rem', borderBottom: '1px solid rgba(251,191,36,0.35)' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-mid)' }}>التوصيل</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{getLiv() ? `${getLiv().toLocaleString()} دج` : '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--amber-dk)' }}>الإجمالي</span>
                                    <span className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--amber-dk)' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.85rem', fontFamily: "'Nunito', sans-serif" }}>دج</span></span>
                                </div>
                            </div>

                            <button type="submit" disabled={submitting} className="btn-warm" style={{ ...BTN_PRI, width: '100%', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                                {submitting ? <><Loader2 size={16} style={{ animation: 'spin-gentle 1s linear infinite' }} /> جاري...</> : '🐾 تأكيد الطلب'}
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
const Shell = ({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) => (
    <div dir="rtl" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="warm-dots" style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--amber-lt), var(--green-lt))' }}>
            <span className="anim-bounce" style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>{emoji}</span>
            <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--brown)' }}>{title}</h1>
        </div>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>{children}</div>
    </div>
);
const IB = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div style={{ display: 'flex', gap: '1.125rem', padding: '1.25rem', marginBottom: '0.75rem', borderRadius: 20, border: '2px solid var(--amber-lt)', background: '#fff', transition: 'all 0.3s', cursor: 'default' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--amber)'; el.style.boxShadow = '0 8px 28px var(--shadow)'; el.style.transform = 'translateY(-3px)'; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--amber-lt)'; el.style.boxShadow = ''; el.style.transform = ''; }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--amber), var(--orange))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
        <div><h3 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '0.375rem' }}>{title}</h3><p style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.7, color: 'var(--text-mid)' }}>{desc}</p></div>
    </div>
);

export function Privacy() {
    return <Shell emoji="🔒" title="سياسة الخصوصية"><IB icon={<Shield size={18} />} title="البيانات التي نجمعها" desc="نجمع فقط البيانات الضرورية لإتمام طلبك — الاسم، رقم الهاتف، والعنوان." /><IB icon={<Lock size={18} />} title="حماية بياناتك" desc="نستخدم أحدث بروتوكولات التشفير لضمان أمان معلوماتك الشخصية." /><IB icon={<Shield size={18} />} title="سياسة المشاركة" desc="لا نبيع أو نشارك بياناتك مع أطراف ثالثة. خصوصيتك أولويتنا." /></Shell>;
}
export function Terms() {
    return <Shell emoji="📋" title="الشروط والأحكام"><IB icon={<CheckCircle2 size={18} />} title="الطلبات والمدفوعات" desc="يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الدفع عند الاستلام." /><IB icon={<Truck size={18} />} title="التوصيل" desc="نوفر خدمة التوصيل لجميع ولايات الجزائر بأفضل الأسعار." /><IB icon={<Shield size={18} />} title="الضمانات" desc="نلتزم بأعلى معايير الجودة والسلامة في جميع منتجاتنا." /></Shell>;
}
export function Cookies() {
    return <Shell emoji="🍪" title="ملفات الارتباط"><IB icon={<Shield size={18} />} title="الملفات الأساسية" desc="ضرورية لعمل سلة التسوق وحفظ بيانات جلستك." /><IB icon={<Sparkles size={18} />} title="تحسين التجربة" desc="تساعدنا على تقديم تجربة تسوق مخصصة وأفضل لك." /></Shell>;
}

export function Contact({ store }: { store: any }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
        catch { showError('حدث خطأ'); } finally { setLoading(false); }
    };
    return (
        <div dir="rtl" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <div className="warm-dots" style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--amber-lt), var(--green-lt))' }}>
                <span className="anim-bounce" style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📞</span>
                <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--brown)' }}>تواصل معنا</h1>
                <p style={{ color: 'var(--text-mid)', fontWeight: 600, marginTop: '0.5rem' }}>نحن هنا دائماً لمساعدتك 🐾</p>
            </div>
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
                <div className="contact-layout">
                    <div>
                        {[{ e: '📞', l: 'الهاتف', v: store?.contact?.phone || 'غير متوفر' }, { e: '📍', l: 'الموقع', v: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || 'الجزائر' }, { e: '📧', l: 'البريد', v: store?.contact?.email || 'غير متوفر' }].map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem', borderRadius: 18, border: '2px solid var(--amber-lt)', background: '#fff', marginBottom: '0.75rem', transition: 'all 0.25s' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--amber)'; el.style.boxShadow = '0 8px 24px var(--shadow)'; }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--amber-lt)'; el.style.boxShadow = ''; }}>
                                <span style={{ fontSize: '2rem' }}>{r.e}</span>
                                <div><p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.2rem' }}>{r.l}</p><p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{r.v}</p></div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px solid var(--amber-lt)', padding: '2rem' }}>
                        {sent ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }} className="anim-fade">
                                <span className="anim-bounce" style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🐾</span>
                                <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--amber-dk)', marginBottom: '0.5rem' }}>تم الإرسال!</h2>
                                <p style={{ color: 'var(--text-mid)', fontWeight: 600, lineHeight: 1.7 }}>سنرد عليك في أقرب وقت.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-row-2">
                                    <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>الاسم</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={INP()} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>الهاتف</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={INP()} /></div>
                                </div>
                                <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>البريد الإلكتروني</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={INP()} /></div>
                                <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>رسالتك</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...INP(), resize: 'none' }} /></div>
                                <button type="submit" disabled={loading} className="btn-warm" style={{ ...BTN_PRI, opacity: loading ? 0.7 : 1 }}>
                                    {loading ? <><Loader2 size={16} style={{ animation: 'spin-gentle 1s linear infinite' }} /> جاري...</> : <>🐾 إرسال الرسالة</>}
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
