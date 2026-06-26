'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
    Star, Heart, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight,
    AlertCircle, Check, X, Phone, MapPin, CheckCircle2, ArrowRight,
    Menu, Search, ShoppingCart, Minus, Plus, Trash2, Loader2, Package,
    Shield, Truck, Sparkles, Lock, Mail,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   PASTEL DREAM — Baby & Newborn Theme
   Palette: Lavender · Peach · Mint · Sky blue · Cream
   Font: Quicksand + Cormorant Garamond
══════════════════════════════════════════════════════════════ */
const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --lavender:   #C4B5FD;
    --lavender-lt:#EDE9FE;
    --lavender-dk:#7C3AED;
    --peach:      #FDBA74;
    --peach-lt:   #FEF3C7;
    --peach-dk:   #EA580C;
    --mint:       #6EE7B7;
    --mint-lt:    #D1FAE5;
    --mint-dk:    #059669;
    --sky:        #BAE6FD;
    --sky-lt:     #E0F2FE;
    --sky-dk:     #0284C7;
    --rose:       #FDA4AF;
    --rose-lt:    #FFE4E6;
    --cream:      #FFFBF0;
    --bg:         #FAF9F7;
    --white:      #FFFFFF;
    --text:       #374151;
    --text-mid:   #6B7280;
    --text-soft:  #9CA3AF;
    --border:     #E5E7EB;
    --shadow:     rgba(196,181,253,0.25);
  }

  body {
    font-family: 'Quicksand', sans-serif;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }
  a { text-decoration: none; color: inherit; }
  .font-serif { font-family: 'Cormorant Garamond', serif; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--lavender); border-radius: 99px; }

  /* ── Animations ── */
  @keyframes gentle-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes soft-fade    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cloud-drift  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes pulse-soft   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes spin-gentle  { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in     { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

  .anim-float  { animation: gentle-float 4s ease-in-out infinite; }
  .anim-fade   { animation: soft-fade 0.6s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-pulse  { animation: pulse-soft 3s ease-in-out infinite; }
  .anim-check  { animation: check-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* ── Clouds ticker ── */
  .cloud-wrap  { overflow: hidden; white-space: nowrap; }
  .cloud-inner { display: inline-block; animation: cloud-drift 30s linear infinite; }

  /* ── Soft card hover ── */
  .soft-card {
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease, border-color 0.3s;
  }
  .soft-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 48px var(--shadow);
  }

  .btn-soft {
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease;
  }
  .btn-soft:hover  { transform: translateY(-2px); }
  .btn-soft:active { transform: translateY(1px); }

  /* ── Pastel pattern ── */
  .pastel-dots {
    background-image:
      radial-gradient(circle, rgba(196,181,253,0.2) 2px, transparent 2px),
      radial-gradient(circle, rgba(253,186,116,0.15) 2px, transparent 2px),
      radial-gradient(circle, rgba(110,231,183,0.12) 2px, transparent 2px);
    background-size: 32px 32px, 56px 56px, 44px 44px;
    background-position: 0 0, 14px 14px, 28px 28px;
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
    background: var(--lavender-dk); color: #fff;
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--bg);
  }
`;

/* ─── Floating cloud deco ─── */
const CloudDeco = ({ style = {} as any }) => (
    <svg viewBox="0 0 120 60" fill="currentColor" style={{ display: 'inline-block', ...style }}>
        <ellipse cx='60' cy="50" rx="55" ry="18" />
        <ellipse cx="35" cy="38" rx="28" ry="20" />
        <ellipse cx="70" cy="32" rx="32" ry="22" />
        <ellipse cx="95" cy="42" rx="22" ry="16" />
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
    background: '#fff', border: `2px solid ${err ? '#FDA4AF' : 'var(--border)'}`,
    borderRadius: 14, color: 'var(--text)', outline: 'none',
    fontFamily: "'Cormorant Garamond', serif", transition: 'border-color 0.2s', appearance: 'none'
});
const BTN_PRI: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '0.875rem 1.75rem', borderRadius: 50, border: 'none', cursor: 'pointer',
    fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '0.925rem',
    background: 'linear-gradient(135deg, var(--lavender-dk), #6D28D9)',
    color: '#fff', boxShadow: '0 6px 24px rgba(124,58,237,0.3)', transition: 'all 0.25s'
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
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Cormorant Garamond', serif" }}>
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
            maxHeight: '300px',
            overflowY: 'auto',
            paddingTop: 25,
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            left: 0,
            background: '#fff',
            border: '2px solid var(--lavender-lt)',
            borderRadius: 18,
            boxShadow: '0 16px 48px rgba(196,181,253,0.25)',
            zIndex: 200
        }}>
            <button
                className='absolute cursor-pointer hover:text-red-400 top-3 left-3'
                onClick={() => setSearchQuery('')}
            >
                <X size={14} />
            </button>

            <div style={{ maxHeight: 300, overflowY: 'auto', }}>
                {loading ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--lavender-dk)', fontSize: '0.875rem', fontWeight: 700 }}>🌸 Recherche en cours...</div>
                ) : listSearch.length > 0 ? (
                    <>
                        {listSearch.map((p: any) => (
                            <Link
                                href={`/product/${p.id}`}
                                key={p.id}
                                onClick={() => setSearchQuery('')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--lavender-lt)' }}
                            >
                                <img
                                    src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                                    style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--lavender-lt)', flexShrink: 0 }}
                                    alt=""
                                />
                                <div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 700,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {p.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--lavender-dk)', fontWeight: 700 }}>{p.price} DA</div>
                                </div>
                            </Link>
                        ))}

                        <button onClick={doSearch} style={{ width: '100%', padding: '12px', background: 'var(--lavender-lt)', border: 'none', borderTop: '1px solid var(--lavender)', color: 'var(--lavender-dk)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Voir tous les résultats <ArrowRight size={14} />
                        </button>
                    </>
                ) : searchQuery.length >= 2 && (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.875rem' }}>Aucun résultat 🌷</div>
                )}
            </div>
        </div>
    );

    return (
        <>
        {store?.topBar?.enabled && store?.topBar?.text && (
          <div style={{ background: 'linear-gradient(90deg, #7C3AED 0%, #C4B5FD 50%, #FDBA74 100%)', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
            {store.topBar.text}
          </div>
        )}
        <nav dir="ltr" style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: scrolled ? 'rgba(250,249,247,0.95)' : 'var(--bg)',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: `1px solid ${scrolled ? 'var(--lavender-lt)' : 'transparent'}`,
            boxShadow: scrolled ? '0 4px 24px rgba(196,181,253,0.15)' : 'none',
            transition: 'all 0.35s ease'
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--lavender) 0%, var(--rose) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {(store.design.logoUrl && store.design.logoUrl !== '/default-logo.png') ? <img src={store.design.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{(store?.name || 'P')[0]}</span>}
                    </div>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{store?.name}</span>
                </Link>

                {/* Desktop search */}
                <div className="nav-desktop-search" style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
                    <form onSubmit={doSearch}>
                        <input type="text" placeholder="Rechercher ici... 🌸" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.75rem', borderRadius: 50, border: '2px solid var(--lavender-lt)', background: '#fff', fontSize: '0.875rem', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s', fontFamily: "'Cormorant Garamond', serif" }}
                            onFocus={e => (e.target.style.borderColor = 'var(--lavender)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--lavender-lt)')} />
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)' }} />
                    </form>
                    {searchQuery.length >= 2 && <Drop />}
                </div>

                {/* Desktop links */}
                <div className="nav-desktop-links">
                    {[{ h: '/', l: 'Accueil' }, { h: '/contact', l: 'Contactez-nous' }].map(i => (
                        <Link key={i.h} href={i.h} style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-mid)', transition: 'color 0.2s', padding: '0.375rem 0.875rem', borderRadius: 50 }}
                            onMouseEnter={e => { const el = e.currentTarget; el.style.color = 'var(--lavender-dk)'; el.style.background = 'var(--lavender-lt)'; }}
                            onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--text-mid)'; el.style.background = 'transparent'; }}>
                            {i.l}
                        </Link>
                    ))}
                    {store?.cart !== false && (
                        <Link href="/cart" className="btn-soft" style={{ position: 'relative', width: 44, height: 44, borderRadius: 14, border: '2px solid var(--lavender-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lavender-dk)' }}>
                            <ShoppingCart size={18} />
                            {count > 0 && <span className="cart-badge">{count}</span>}
                        </Link>
                    )}
                </div>

                {/* Mobile */}
                <div className="nav-mobile-btns">
                    <button onClick={() => setShowSearch(!showSearch)} style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--lavender-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--lavender-dk)' }}><Search size={17} /></button>

                    {store?.cart !== false && (
                        <Link href="/cart" style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, border: '2px solid var(--lavender-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lavender-dk)' }}>
                            <ShoppingCart size={17} />
                            {count > 0 && <span className="cart-badge">{count}</span>}
                        </Link>
                    )}

                    <button onClick={() => setOpen(!open)} style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--lavender-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--lavender-dk)' }}>
                        {open ? <X size={17} /> : <Menu size={17} />}
                    </button>
                </div>
            </div>

            {/* Mobile search */}
            {showSearch && (
                <div style={{ padding: '0.625rem 1.25rem', background: '#fff', borderTop: '1px solid var(--lavender-lt)', position: 'relative' }}>
                    <form onSubmit={doSearch} style={{ position: 'relative' }}>
                        <input autoFocus type="text" placeholder="Rechercher ici..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ ...INP(), padding: '0.75rem 1rem 0.75rem 2.75rem' }} />
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)' }} />
                    </form>
                    {searchQuery.length >= 2 && <Drop />}
                </div>
            )}

            {/* Mobile nav */}
            <div style={{ overflow: 'hidden', maxHeight: open ? 180 : 0, transition: 'max-height 0.3s ease', background: '#fff', borderTop: open ? '1px solid var(--lavender-lt)' : 'none' }}>
                <div style={{ padding: '0.5rem 1.25rem 1rem' }}>
                    {[{ h: '/', l: '🏠 Accueil' }, { h: '/contact', l: '💌 Contactez-nous' }].map(i => (
                        <Link key={i.h} href={i.h} onClick={() => setOpen(false)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--lavender-lt)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                            {i.l} <ArrowRight size={14} style={{ color: 'var(--lavender-dk)' }} />
                        </Link>
                    ))}

                </div>
            </div>
        </nav>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — 3 sections
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
    return (
        <footer dir="ltr" style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #5B21B6 100%)', color: '#fff', padding: '4rem 1.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Cloud deco */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.08, pointerEvents: 'none' }}>
                <div className="cloud-wrap">
                    <div className="cloud-inner" style={{ color: '#fff' }}>
                        {Array(6).fill(null).map((_, i) => <CloudDeco key={i} style={{ width: 120, height: 60, margin: '0 2rem' }} />)}
                        {Array(6).fill(null).map((_, i) => <CloudDeco key={`b${i}`} style={{ width: 120, height: 60, margin: '0 2rem' }} />)}
                    </div>
                </div>
            </div>
            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div className="footer-cols">
                    {/* Section 1 */}
                    <div>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '0.875rem' }}>{store?.name}</h3>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 300 }}>
                            {store?.hero?.subtitle?.substring(0, 90) || '🌸 Tout ce dont votre enfant a besoin avec sécurité et amour. Produits Douces pour un début de vie serein.'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', fontSize: '1.5rem' }}>
                            {['👶', '🌸', '🧸', '🌙', '⭐'].map((e, i) => (
                                <span key={i} style={{ animation: `gentle-float ${3 + i * 0.5}s ${i * 0.3}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>
                            ))}
                        </div>
                        <p style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} {store?.name}. Tous droits réservés.</p>
                    </div>
                    {/* Section 2 */}
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--peach)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Liens Rapide</h4>
                        {[{ h: '/', l: 'Accueil' }, { h: '/cart', l: 'Panier' }, { h: '/contact', l: 'Contactez-nous' }, { h: '/Privacy', l: 'Politique de confidentialité' }, { h: '/Terms', l: 'Conditions et clauses' }].map((lnk, i) => (
                            <a key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.625rem', transition: 'all 0.2s' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#fff'; el.style.paddingRight = '8px'; }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(255,255,255,0.6)'; el.style.paddingRight = '0'; }}>
                                {lnk.l}
                            </a>
                        ))}
                    </div>
                    {/* Section 3 */}
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--peach)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Contactez-nous</h4>
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
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mint)', boxShadow: '0 0 8px var(--mint)', display: 'inline-block' }} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Avec plaisir 🌸</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>sous 24h</p>
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
        { bg: 'var(--lavender-lt)', accent: 'var(--lavender-dk)', tag: 'var(--lavender)' },
        { bg: 'var(--peach-lt)', accent: '#D97706', tag: 'var(--peach)' },
        { bg: 'var(--mint-lt)', accent: 'var(--mint-dk)', tag: 'var(--mint)' },
        { bg: 'var(--rose-lt)', accent: '#E11D48', tag: 'var(--rose)' },
        { bg: 'var(--sky-lt)', accent: 'var(--sky-dk)', tag: 'var(--sky)' },
    ];
    const idValue = typeof product.id === 'string' ? product.id.length : (product.id || 0);
    const pal = palettes[idValue % palettes.length] || palettes[0];

    return (
        <div className="soft-card" style={{ background: '#fff', border: `2px solid ${hov ? pal.accent : 'var(--border)'}`, borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '1/1', background: pal.bg, overflow: 'hidden' }}>
                {displayImage
                    ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🧸</div>}
                {discount > 0 && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: pal.accent, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>
                        -{discount}%
                    </div>
                )}
                <button style={{ position: 'absolute', top: 10, left: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)' }}>
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
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: pal.accent }}>{price.toLocaleString()}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)' }}>{store?.currency || 'DA'}</span>
                        {orig > price && <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
                    </div>
                    <Link href={`/product/${product.slug || product.id}`} className="btn-soft" style={{
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
        <div dir="ltr">
            {/* ── HERO ── */}
            <section className="pastel-dots" style={{ position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                {/* Cloud decoration */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.35, pointerEvents: 'none' }}>
                    <div className="cloud-wrap">
                        <div className="cloud-inner" style={{ color: 'var(--lavender)' }}>
                            {Array(6).fill(null).map((_, i) => <CloudDeco key={i} style={{ width: 160, height: 80, margin: '0 1rem' }} />)}
                            {Array(6).fill(null).map((_, i) => <CloudDeco key={`b${i}`} style={{ width: 160, height: 80, margin: '0 1rem' }} />)}
                        </div>
                    </div>
                </div>

                {/* Radial glow */}
                <div style={{ position: 'absolute', top: '20%', left: '60%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,181,253,0.25), transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '40%', right: '70%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(253,186,116,0.2), transparent 70%)', pointerEvents: 'none' }} />

                {store.hero?.imageUrl && (
                    <div style={{ position: 'absolute', inset: 0 }}>
                        <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12 }} />
                    </div>
                )}

                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '7rem 1.5rem 4rem', position: 'relative', zIndex: 1, width: '100%' }}>
                    <div className='anim-fade' style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.5rem 1.25rem', borderRadius: 50, background: 'rgba(196,181,253,0.2)', border: '1.5px solid rgba(196,181,253,0.5)', marginBottom: '1.5rem' }}>
                        <Sparkles size={14} style={{ color: 'var(--lavender-dk)' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{store?.name} — Prendre soin de votre enfant avec amour</span>
                    </div>
                    <h1 className="anim-fade font-serif" style={{ fontSize: 'clamp(2.75rem, 7vw, 5.5rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || 'Tout ce dont<br/>votre enfant a besoin') }} />
                    <div style={{ height: 3, width: 80, borderRadius: 99, background: 'linear-gradient(90deg, var(--lavender), var(--rose), var(--peach))', marginBottom: '1.5rem' }} />
                    <p className="anim-fade" style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-mid)', maxWidth: 480, lineHeight: 1.75, marginBottom: '2.5rem' }}>
                        {store.hero?.subtitle || '🌸 Produits sécurisés et doux, sélectionnés soigneusement pour le confort et la santé de votre bébé dès le premier jour.'}
                    </p>
                    <div className="hero-actions">
                        <a href="#products" className="btn-soft" style={{ ...BTN_PRI, textDecoration: 'none' }}>
                            Découvrir les produits 🌸
                        </a>
                        {store?.cart !== false && (
                            <Link href="/cart" className="btn-soft" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 1.75rem', borderRadius: 50, border: '2px solid var(--lavender)', background: '#fff', color: 'var(--lavender-dk)', fontWeight: 700, fontSize: '0.925rem' }}>
                                Panier
                            </Link>
                        )}

                    </div>
                </div>
            </section>

            {/* ── TRUST ── */}
            <div style={{ background: '#fff', borderTop: '1px solid var(--lavender-lt)', borderBottom: '1px solid var(--lavender-lt)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
                    <div className="trust-grid" style={{ padding: '1.5rem 0' }}>
                        {[
                            { e: '🛡️', t: 'Totalement sécurisé', d: 'Sans substances nocives' },
                            { e: '🚀', t: 'Livraison rapide', d: 'dans toutes les wilayas' },
                            { e: '🌸', t: 'Qualité excellente', d: 'Produits premium et certifiés' },
                            { e: '💝', t: 'Avec amour et soin', d: 'Pour nos chers enfants' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', borderLeft: i < 3 ? '1px solid var(--lavender-lt)' : 'none' }}>
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
                        Acheter par Catégorie
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.625rem' }}>
                        {cats.map((cat: any, idx: number) => {
                            const cs = ['var(--lavender-dk)', 'var(--mint-dk)', '#D97706', '#E11D48', 'var(--sky-dk)'];
                            const lts = ['var(--lavender-lt)', 'var(--mint-lt)', 'var(--peach-lt)', 'var(--rose-lt)', 'var(--sky-lt)'];
                            const c = cs[idx % cs.length]; const lt = lts[idx % lts.length];
                            return (
                                <Link key={cat.id} href={`?category=${cat.id}`} className="btn-soft" style={{ padding: '0.625rem 1.5rem', borderRadius: 50, border: `2px solid ${c}30`, color: c, background: lt, fontSize: '0.875rem', fontWeight: 700, transition: 'all 0.25s' }}
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
                    Nos produits sélectionnés
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2.5rem' }}>Tout ce dont votre enfant a besoin 💫</p>

                {products.length === 0 ? (
                    <div className="pastel-dots" style={{ padding: '5rem', textAlign: 'center', border: '2px dashed var(--lavender)', borderRadius: 24, background: 'var(--lavender-lt)' }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🧸</span>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', color: 'var(--lavender-dk)' }}>Aucun produit actuellement</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((p: any) => {
                            const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                            const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                            return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="Voir le produit" />;
                        })}
                    </div>
                )}

                {countPage > 1 && (
                    <div className="pagination" dir="ltr">
                        <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 12, border: '2px solid var(--lavender-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: 'var(--lavender-dk)', opacity: page <= 1 ? 0.3 : 1 }}>❮</Link>
                        {Array.from({ length: countPage }).map((_, i) => {
                            const pn = i + 1; const isA = Number(page) === pn;
                            return (
                                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, border: `2px solid ${isA ? 'var(--lavender-dk)' : 'var(--lavender-lt)'}`, background: isA ? 'var(--lavender-dk)' : '#fff', color: isA ? '#fff' : 'var(--text-mid)' }}>
                                    {pn}
                                </Link>
                            );
                        })}
                        <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 12, border: '2px solid var(--lavender-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: 'var(--lavender-dk)', opacity: page >= countPage ? 0.3 : 1 }}>❯</Link>
                    </div>
                )}
            </section>

            {/* ── SOFT BANNER ── */}
            <section style={{ background: 'linear-gradient(135deg, var(--lavender-lt), var(--rose-lt), var(--peach-lt))', padding: '5rem 1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.25rem', animation: 'gentle-float 4s ease-in-out infinite' }}>👶</span>
                <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '1rem' }}>
                    Parce que votre enfant mérite le meilleur
                </h2>
                <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-mid)', maxWidth: 500, margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    Produits sélectionnés soigneusement pour offrir à votre enfant un maximum de confort et de sécurité
                </p>
                <a href="#products" className="btn-soft" style={{ ...BTN_PRI, textDecoration: 'none' }}>
                    Acheter maintenant 🌸
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
        <div dir="ltr" style={{ background: 'var(--bg)', paddingBottom: '4rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                <div className="details-layout">
                    {/* Gallery */}
                    <div style={{top: 84 }}>
                        <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 24, overflow: 'hidden', background: 'var(--lavender-lt)', border: '2px solid var(--lavender-lt)' }}>
                            {allImages[sel] ? <img src={allImages[sel]} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🧸</div>}
                            {discount > 0 && <div style={{ position: 'absolute', top: 14, right: 14, background: 'var(--lavender-dk)', color: '#fff', padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700 }}>Réduction {discount}%</div>}
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
                                    <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 62, height: 62, borderRadius: 14, overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--lavender-dk)' : 'var(--border)'}`, opacity: sel === idx ? 1 : 0.55, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.2s' }}>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <div style={{ background: '#fff', borderRadius: 24, padding: '2rem', border: '2px solid var(--lavender-lt)' }}>
                            <h1 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem', lineHeight: 1.2 }}>{product.name}</h1>
                            <div style={{ display: 'flex', gap: 3, marginBottom: '1.25rem' }}>
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} style={{ fill: i < 4 ? '#FBBF24' : 'none', color: '#FBBF24' }} />)}
                            </div>
                            <div style={{ background: 'var(--lavender-lt)', borderRadius: 18, padding: '1.125rem', marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.375rem' }}>Prix</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                                    <span className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{finalPrice.toLocaleString()}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-mid)' }}>DA</span>
                                </div>
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 1rem', borderRadius: 50, fontWeight: 700, fontSize: '0.82rem', marginBottom: '1.5rem', background: autoGen ? 'var(--peach-lt)' : inStock ? 'var(--mint-lt)' : 'var(--rose-lt)', color: autoGen ? '#D97706' : inStock ? 'var(--mint-dk)' : '#E11D48' }}>
                                {autoGen ? '♾️ Stock illimité' : inStock ? '✅ Disponible' : '❌ Rupture de stock'}
                            </div>

                            {product.offers?.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    {product.offers.map((o: any) => (
                                        <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: `2px solid ${selectedOffer === o.id ? 'var(--lavender-dk)' : 'var(--border)'}`, borderRadius: 16, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? 'var(--lavender-lt)' : 'transparent', transition: 'all 0.2s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? 'var(--lavender-dk)' : 'var(--border)'}`, background: selectedOffer === o.id ? 'var(--lavender-dk)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {selectedOffer === o.id && <Check size={11} color='#fff' />}
                                                </div>
                                                <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.name}</p>
                                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600 }}>Quantité: {o.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{o.price.toLocaleString()} DA</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {allAttrs.map((attr: any) => (
                                <div key={attr.id} style={{ marginBottom: '1.25rem' }}>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.625rem' }}>
                                        {attr.name}
                                    </p>

                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {attr.variants.map((v: any) => {
                                            const isSelected = selectedVariants[attr.name] === v.value;

                                            // Cas des couleurs
                                            if (attr.displayMode === 'color') {
                                                return (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => handleVariantSelection(attr.name, v.value)}
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: '50%',
                                                            background: v.value,
                                                            border: '1px solid rgba(0,0,0,0.1)',
                                                            cursor: 'pointer',
                                                            outline: `2px solid ${isSelected ? 'var(--lavender-dk)' : 'transparent'}`,
                                                            outlineOffset: 2,
                                                            transition: '0.2s all'
                                                        }}
                                                        title={v.name}
                                                    />
                                                );
                                            }

                                            // Cas des images (ex: motifs de tissu)
                                            if (attr.displayMode === 'image') {
                                                return (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => handleVariantSelection(attr.name, v.value)}
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 10, // bords légèrement carrés, mieux pour les images
                                                            backgroundImage: `url(${v.value})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            border: isSelected ? '2px solid var(--lavender-dk)' : '2px solid var(--border)',
                                                            cursor: 'pointer',
                                                            transition: '0.2s all'
                                                        }}
                                                    />
                                                );
                                            }

                                            // Cas par défaut (textes comme les tailles S, M, L)
                                            return (
                                                <button
                                                    key={v.id}
                                                    onClick={() => handleVariantSelection(attr.name, v.value)}
                                                    style={{
                                                        padding: '0.4rem 1.125rem',
                                                        border: `2px solid ${isSelected ? 'var(--lavender-dk)' : 'var(--border)'}`,
                                                        borderRadius: 50,
                                                        fontWeight: 700,
                                                        fontSize: '0.85rem',
                                                        background: isSelected ? 'var(--lavender-lt)' : '#fff',
                                                        color: isSelected ? 'var(--lavender-dk)' : 'var(--text-mid)',
                                                        cursor: 'pointer',
                                                        fontFamily: 'inherit',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {v.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

                            {product.desc && (
                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--lavender-lt)' }}>
                                    <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.875rem' }}>Description du produit</h3>
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
        if (!fd.customerName.trim()) e.customerName = 'requis';
        if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = "Numéro invalide (ex: 0550123456)";
        if (!fd.customerWelaya) e.customerWelaya = 'requis';
        if (!fd.customerCommune) e.customerCommune = 'requis';
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
        <div style={{ paddingTop: '1.5rem', borderTop: '2px solid var(--lavender-lt)', marginTop: '1.5rem' }}>
            {product.store?.cart && (
                <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
                    <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0.875rem', borderRadius: 50, cursor: isAdded ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', border: `2px solid ${isAdded ? 'var(--mint-dk)' : 'var(--lavender)'}`, background: isAdded ? 'var(--mint-lt)' : '#fff', color: isAdded ? 'var(--mint-dk)' : 'var(--lavender-dk)', transition: 'all 0.25s' }}>
                        {isAdded ? <><CheckCircle2 size={15} className="anim-check" /> Ajouté 🌸</> : <><ShoppingCart size={15} /> Ajouter au panier</>}
                    </button>
                    <button onClick={() => setIsOrderNow(true)} className="btn-soft" style={{ flex: 1, ...BTN_PRI, width: 'auto', borderRadius: 50 }}>
                        Commander maintenant 🌸
                    </button>
                </div>
            )}

            {(isOrderNow || !product.store?.cart) && (
                <div className="anim-fade">
                    {product.store?.cart && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>Informations de livraison</p>
                            <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.375rem 0.75rem', borderRadius: 50, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--text-soft)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                <X size={11} /> Annuler
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                            <FR error={errors.customerName} label='Nom complet'>
                                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="Nom" style={INP(!!errors.customerName)} />
                            </FR>
                            <FR error={errors.customerPhone} label="Numéro de Téléphone">
                                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0XXXXXXXXX" style={INP(!!errors.customerPhone)} />
                            </FR>
                        </div>
                        <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                            <FR error={errors.customerWelaya} label='Wilaya'>
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)', pointerEvents: 'none' }} />
                                    <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.customerWelaya), paddingLeft: 32, fontFamily: 'inherit' }}>
                                        <option value="">Choisir</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                            <FR error={errors.customerCommune} label="Commune">
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)', pointerEvents: 'none' }} />
                                    <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.customerCommune), paddingLeft: 32, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}>
                                        <option value="">{loadingC ? '...' : 'Choisir'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                        </div>

                        <div style={{ marginBottom: '0.875rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.5rem' }}>Type de livraison</p>
                            <div className="delivery-grid">
                                {(['home', 'office'] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.875rem', border: `2px solid ${fd.typeLivraison === t ? 'var(--lavender-dk)' : 'var(--border)'}`, borderRadius: 16, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'var(--lavender-lt)' : '#fff', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                                        <span style={{ display: 'block', fontSize: '1.375rem', marginBottom: 4 }}>{t === 'home' ? '🏠' : '🏢'}</span>
                                        <p style={{ fontWeight: 700, fontSize: '0.82rem', color: fd.typeLivraison === t ? 'var(--lavender-dk)' : 'var(--text-soft)' }}>{t === 'home' ? 'À domicile' : 'Au bureau'}</p>
                                        {selW && <p className="font-serif" style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === t ? 'var(--lavender-dk)' : 'var(--text-soft)' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} DA</p>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '0.875rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.5rem' }}>Quantité</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '2px solid var(--lavender-lt)', borderRadius: 50, overflow: 'hidden', background: '#fff' }}>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lavender-dk)' }}><Minus size={14} /></button>
                                <span style={{ width: 44, textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 700 }}>{fd.quantity}</span>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lavender-dk)' }}><Plus size={14} /></button>
                            </div>
                        </div>

                        {/* Summary */}
                        <div style={{ background: 'var(--lavender-lt)', borderRadius: 20, padding: '1.125rem', marginBottom: '1.25rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.75rem' }}>Résumé de la commande</p>
                            {[
                                { l: 'Produit', v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
                                { l: 'Livraison', v: selW ? `${getLiv().toLocaleString()} DA` : '—' },
                            ].map(r => (
                                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(196,181,253,0.3)' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-mid)' }}>{r.l}</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>{r.v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.375rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--lavender-dk)' }}>Total</span>
                                <span className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{total().toLocaleString()} <span style={{ fontSize: '0.85rem', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>DA</span></span>
                            </div>
                        </div>

                        <button type="submit" disabled={sub} className="btn-soft" style={{ ...BTN_PRI, width: '100%', opacity: sub ? 0.7 : 1, cursor: sub ? 'not-allowed' : 'pointer' }}>
                            {sub ? <><Loader2 size={16} style={{ animation: 'spin-gentle 1s linear infinite' }} /> Traitement en cours...</> : '🌸 Confirmer la commande'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-soft)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <Lock size={11} style={{ color: 'var(--lavender)' }} /> Paiement Sécurisé et chiffré
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
        if (!fd.customerName.trim()) er.name = 'requis';
        if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = "Numéro invalide (ex: 0550123456)";
        if (!fd.customerWelaya) er.w = 'requis';
        if (!fd.customerCommune) er.c = 'requis';
        if (Object.keys(er).length) { setErrors(er); return; }
        setErrors({}); setSubmitting(true);
        try {
            await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
            setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
        } catch { } finally { setSubmitting(false); }
    };

    if (success) return (
        <div dir="ltr" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
            <div className="anim-fade" style={{ textAlign: 'center', background: '#fff', padding: '4rem 2.5rem', borderRadius: 28, border: '2px solid var(--lavender-lt)', maxWidth: 460, width: '100%', boxShadow: '0 12px 40px var(--shadow)' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.25rem', animation: 'gentle-float 3s ease-in-out infinite' }}>🌸</span>
                <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.625rem' }}>Commande reçue !</h2>
                <p style={{ color: 'var(--text-mid)', fontWeight: 600, marginBottom: '2rem', lineHeight: 1.7 }}>Merci de votre confiance. Nous vous contacterons bient't 💝</p>
                <Link href="/" className="btn-soft" style={{ ...BTN_PRI, textDecoration: 'none', display: 'inline-flex' }}>Retour à la boutique</Link>
            </div>
        </div>
    );

    if (!items.length) return (
        <div dir="ltr" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
            <div className="pastel-dots" style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--lavender)', borderRadius: 28, maxWidth: 400, width: '100%', background: 'var(--lavender-lt)' }}>
                <ShoppingBag size={52} style={{ color: 'var(--lavender)', display: 'block', margin: '0 auto 1.25rem', opacity: 0.5 }} />
                <p className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '1.75rem' }}>Panier vide 🌸</p>
                <Link href="/" className="btn-soft" style={{ ...BTN_PRI, textDecoration: 'none', display: 'inline-flex' }}>Acheter maintenant</Link>
            </div>
        </div>
    );

    return (
        <div dir="ltr" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2.5rem 1.5rem 5rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '2rem' }}>🛒 Panier</h1>
                <div className="cart-layout">
                    {/* Items */}
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px solid var(--lavender-lt)', overflow: 'hidden', alignSelf: 'start' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--lavender-lt)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--lavender-lt)' }}>
                            <Package size={17} style={{ color: 'var(--lavender-dk)' }} />
                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: 'var(--lavender-dk)', fontSize: '1rem' }}>Produits ({items.length})</span>
                        </div>
                        {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--lavender-lt)' }}>
                                <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 76, height: 76, borderRadius: 16, objectFit: 'cover', border: '2px solid var(--lavender-lt)', flexShrink: 0 }} alt="" />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{item.product?.name}</h4>
                                    <p className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{item.finalPrice?.toLocaleString()} DA</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 600, marginTop: '0.2rem' }}>Quantité: {item.quantity}</p>
                                </div>
                                <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--border)', cursor: 'pointer', alignSelf: 'center', display: 'flex', padding: '0.375rem', borderRadius: 8, transition: 'color 0.2s' }}
                                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--rose)')}
                                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--border)')}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <div style={{ padding: '1rem 1.25rem', background: 'var(--lavender-lt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--lavender-dk)' }}>Sous-total</span>
                            <span className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{cartTotal.toLocaleString()} DA</span>
                        </div>
                    </div>

                    {/* Checkout */}
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px solid var(--lavender-lt)', padding: '1.75rem', alignSelf: 'start' }}>
                        <h3 className="font-serif" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--lavender-dk)', marginBottom: '1.5rem' }}>Informations de livraison</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row-2" style={{ marginBottom: '0.75rem' }}>
                                <FR error={errors.name} label="Nom"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={INP(!!errors.name)} /></FR>
                                <FR error={errors.phone} label="Téléphone"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={INP(!!errors.phone)} /></FR>
                            </div>
                            <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                                <FR error={errors.w} label='Wilaya'>
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)', pointerEvents: 'none' }} />
                                        <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.w), paddingLeft: 32, fontFamily: 'inherit' }}>
                                            <option value="">Choisir</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                        </select>
                                    </div>
                                </FR>
                                <FR error={errors.c} label="Commune">
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)', pointerEvents: 'none' }} />
                                        <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.c), paddingLeft: 32, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}>
                                            <option value="">{loadingC ? '...' : 'Choisir'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                        </select>
                                    </div>
                                </FR>
                            </div>

                            {/* Type de livraison — Nouveau */}
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--lavender-dk)', textTransform: 'uppercase', marginBottom: '0.625rem', letterSpacing: '0.04em' }}>🚚 Type de livraison</p>
                                <div className="delivery-grid">
                                    {(['home', 'office'] as const).map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFd(p => ({ ...p, typeLivraison: t }))}
                                            style={{
                                                padding: '0.875rem',
                                                border: `2px solid ${fd.typeLivraison === t ? 'var(--lavender)' : 'var(--lavender-lt)'}`,
                                                borderRadius: 16,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                background: fd.typeLivraison === t ? 'var(--lavender-lt)' : '#fff',
                                                fontFamily: 'inherit',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: 4 }}>{t === 'home' ? '🏠' : '🏢'}</span>
                                            <p style={{ fontWeight: 700, fontSize: '0.8rem', color: fd.typeLivraison === t ? 'var(--lavender-dk)' : 'var(--text-soft)' }}>{t === 'home' ? 'À domicile' : 'Au bureau'}</p>
                                            {selW && <p className="font-serif" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--lavender-dk)', marginTop: 3 }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} DA</p>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: 'var(--lavender-lt)', borderRadius: 18, padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(196,181,253,0.35)' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-mid)' }}>Sous-total</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cartTotal.toLocaleString()} DA</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.625rem', marginBottom: '0.625rem', borderBottom: '1px solid rgba(196,181,253,0.35)' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-mid)' }}>Livraison</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{getLiv() ? `${getLiv().toLocaleString()} DA` : '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--lavender-dk)' }}>Total</span>
                                    <span className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.85rem', fontFamily: "'Cormorant Garamond', serif" }}>DA</span></span>
                                </div>
                            </div>

                            <button type="submit" disabled={submitting} className="btn-soft" style={{ ...BTN_PRI, width: '100%', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                                {submitting ? <><Loader2 size={16} style={{ animation: 'spin-gentle 1s linear infinite' }} /> En cours...</> : '🌸 Confirmer la commande'}
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
    <div dir="ltr" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="pastel-dots" style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--lavender-lt), var(--rose-lt))' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'gentle-float 4s ease-in-out infinite' }}>{emoji}</span>
            <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--lavender-dk)' }}>{title}</h1>
        </div>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>{children}</div>
    </div>
);
const IB = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div style={{ display: 'flex', gap: '1.125rem', padding: '1.25rem', marginBottom: '0.75rem', borderRadius: 20, border: '2px solid var(--lavender-lt)', background: '#fff', transition: 'all 0.3s', cursor: 'default' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lavender)'; el.style.boxShadow = '0 8px 28px var(--shadow)'; el.style.transform = 'translateY(-3px)'; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lavender-lt)'; el.style.boxShadow = ''; el.style.transform = ''; }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--lavender), var(--rose))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
        <div><h3 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.375rem' }}>{title}</h3><p style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.7, color: 'var(--text-mid)' }}>{desc}</p></div>
    </div>
);

export function Privacy() {
    return <Shell emoji="🔒" title="Politique de confidentialité"><IB icon={<Shield size={18} />} title="Les données que nous collectons" desc="Nous collectons uniquement les données essentielles pour traiter votre commande — Nom, Numéro de téléphone et adresse." /><IB icon={<Lock size={18} />} title="Protection de vos données" desc="Nous utilisons les derniers protocoles de chiffrement pour garantir la sécurité de vos informations personnelles." /><IB icon={<Shield size={18} />} title="Politique de partage" desc="Nous ne vendons ni ne partageons vos données avec des tiers. Votre confidentialité est notre priorité." /></Shell>;
}
export function Terms() {
    return <Shell emoji="📋" title="Conditions et clauses"><IB icon={<CheckCircle2 size={18} />} title="Commandes et paiements" desc="Les commandes sont confirmées par téléphone avant l'expédition. Paiement à la livraison." /><IB icon={<Truck size={18} />} title="Livraison" desc="Nous proposons la livraison dans toutes les wilayas d'Algérie aux meilleurs prix." /><IB icon={<Shield size={18} />} title="Garanties" desc="Nous nous engageons aux plus hauts standards de qualité et de sécurité pour tous nos produits." /></Shell>;
}
export function Cookies() {
    return <Shell emoji="🍪" title="Cookies"><IB icon={<Shield size={18} />} title="Fichiers essentiels" desc="Essentiels pour le fonctionnement du panier et la conservation de vos données de session." /><IB icon={<Sparkles size={18} />} title="Amélioration de l'expérience" desc="Nous aident à offrir une expérience shopping personnalisée et meilleure pour vous." /></Shell>;
}

export function Contact({ store }: { store: any }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
        catch { showError('Une Erreur est survenue'); } finally { setLoading(false); }
    };
    return (
        <div dir="ltr" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <div className="pastel-dots" style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--lavender-lt), var(--rose-lt))' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'gentle-float 4s ease-in-out infinite' }}>💌</span>
                <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--lavender-dk)' }}>Contactez-nous</h1>
                <p style={{ color: 'var(--text-mid)', fontWeight: 600, marginTop: '0.5rem' }}>Nous sommes toujours là pour vous aider 🌸</p>
            </div>
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
                <div className='contact-layout'>
                    <div>
                        {[{ e: '📞', l: 'Téléphone', v: store?.contact?.phone || 'Non disponible' }, { e: '📍', l: 'Adresse', v: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || 'Algérie' }, { e: '📧', l: 'Email', v: store?.contact?.email || 'Non disponible' }].map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem', borderRadius: 18, border: '2px solid var(--lavender-lt)', background: '#fff', marginBottom: '0.75rem', transition: 'all 0.25s' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--lavender)"; el.style.boxShadow = '0 8px 24px var(--shadow)'; }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lavender-lt)'; el.style.boxShadow = ''; }}>
                                <span style={{ fontSize: '2rem' }}>{r.e}</span>
                                <div><p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.2rem' }}>{r.l}</p><p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{r.v}</p></div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px solid var(--lavender-lt)', padding: '2rem' }}>
                        {sent ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }} className="anim-fade">
                                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'gentle-float 3s ease-in-out infinite' }}>🌸</span>
                                <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.5rem' }}>Envoyé !</h2>
                                <p style={{ color: 'var(--text-mid)', fontWeight: 600, lineHeight: 1.7 }}>Nous vous répondrons dans les plus brefs délais.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className='form-row-2'>
                                    <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>Nom</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={INP()} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>Téléphone</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={INP()} /></div>
                                </div>
                                <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={INP()} /></div>
                                <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>Votre message</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...INP(), resize: 'none' }} /></div>
                                <button type="submit" disabled={loading} className="btn-soft" style={{ ...BTN_PRI, opacity: loading ? 0.7 : 1 }}>
                                    {loading ? <><Loader2 size={16} style={{ animation: 'spin-gentle 1s linear infinite' }} /> En cours...</> : <>🌸 Envoyer le message</>}
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