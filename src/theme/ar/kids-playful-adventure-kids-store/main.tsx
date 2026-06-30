'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
    Star, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight,
    AlertCircle, Check, X, Phone, MapPin,
    CheckCircle2, Zap, Rocket, Trophy,
    Menu, Search, ShoppingCart, Minus, Plus,
    Trash2, Loader2, Package, Shield, Truck, Lock, Sparkles,
    ArrowLeft,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   PLAYFUL ADVENTURE — Toys · Fashion · Education
   Palette: Electric Yellow #FFE000 · Adventure Blue #0066FF
            Grass Green #00C851 · Hot Orange #FF6B00 · Dark #1A1A2E
   Font: Boogaloo (display) + Nunito (body)
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Boogaloo&family=Nunito:wght@400;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --yellow:   #FFE000;
    --yellow-dk:#CC9500;
    --yellow-lt:#FFFDE7;
    --blue:     #0066FF;
    --blue-lt:  #E3F2FD;
    --blue-dk:  #0047CC;
    --green:    #00C851;
    --green-lt: #E8F5E9;
    --green-dk: #009A3D;
    --orange:   #FF6B00;
    --orange-lt:#FFF3E0;
    --orange-dk:#CC5500;
    --red:      #FF1744;
    --purple:   #7B2FBE;
    --dark:     #1A1A2E;
    --dark-mid: #16213E;
    --bg:       #F5F7FF;
    --white:    #FFFFFF;
    --text:     #1A1A2E;
    --mid:      #4A5568;
    --soft:     #8896A5;
    --border:   #E2E8F0;
  }

  body { font-family: 'Nunito', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
  a { text-decoration: none; color: inherit; }
  .font-boogaloo { font-family: 'Boogaloo', cursive; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--dark); }
  ::-webkit-scrollbar-thumb { background: var(--yellow); border-radius: 2px; }

  /* ══ Keyframes ══ */
  @keyframes slide-up    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes zoom-in     { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
  @keyframes wiggle      { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
  @keyframes bounce-up   { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-14px)} 60%{transform:translateY(-7px)} }
  @keyframes ticker      { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin        { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes cart-pop    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
  @keyframes check-snap  { from{transform:scale(0) rotate(-20deg);opacity:0} to{transform:scale(1) rotate(0);opacity:1} }
  @keyframes stripe-move { from{background-position:0 0} to{background-position:40px 0} }
  @keyframes pulse-glow  { 0%,100%{box-shadow:0 0 0 0 rgba(255,224,0,0.4)} 50%{box-shadow:0 0 0 12px rgba(255,224,0,0)} }
  @keyframes float       { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-12px) rotate(3deg)} }

  .anim-slide-up { animation: slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-zoom-in  { animation: zoom-in  0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-cart-pop { animation: cart-pop 0.4s ease; }
  .anim-check    { animation: check-snap 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* ══ Adventure stripe ══ */
  .stripe-bar {
    background: repeating-linear-gradient(
      -45deg,
      var(--yellow) 0px, var(--yellow) 10px,
      var(--dark) 10px, var(--dark) 20px
    );
    background-size: 40px 40px;
    animation: stripe-move 1.2s linear infinite;
  }

  /* ══ Ticker ══ */
  .ticker-wrap  { overflow: hidden; white-space: nowrap; background: var(--blue); }
  .ticker-inner { display: inline-block; animation: ticker 22s linear infinite; }

  /* ══ Card hover ══ */
  .adv-card {
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.25s;
  }
  .adv-card:hover { transform: translateY(-8px) scale(1.02); }

  /* ══ Btn ══ */
  .btn-adv {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
    cursor: pointer;
  }
  .btn-adv:hover  { transform: translateY(-3px) scale(1.03); }
  .btn-adv:active { transform: translateY(1px) scale(0.98); }

  /* ══ Zigzag divider ══ */
  .zz-top, .zz-bot {
    width: 100%; overflow: hidden; line-height: 0;
  }
  .zz-top { transform: rotate(180deg); }

  /* ══ Nav responsive ══ */
  .nav-d-links  { display: none; align-items: center; gap: 1.5rem; }
  .nav-d-search { display: none; }
  .nav-m-btns   { display: flex; align-items: center; gap: 0.5rem; }
  @media (min-width: 1024px) {
    .nav-d-links  { display: flex; }
    .nav-d-search { display: block; }
    .nav-m-btns   { display: none; }
  }

  /* ══ Grids ══ */
  .products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); gap: 1.25rem; } }

  .feat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  @media (min-width: 1024px) { .feat-grid { grid-template-columns: repeat(4, 1fr); } }

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
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  @media (min-width: 768px) { .footer-cols { grid-template-columns: 1.8fr 1fr 1fr; } }

  .hero-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: center;
    min-height: 88vh;
    padding: 7rem 1.5rem 4rem;
  }
  @media (min-width: 1024px) {
    .hero-layout { grid-template-columns: 1.1fr 1fr; padding: 0 3rem; min-height: 100vh; }
  }

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
    position: absolute; top: -5px; right: -5px;
    min-width: 18px; height: 18px; border-radius: 9px;
    background: var(--yellow); color: var(--dark);
    font-size: 10px; font-weight: 900;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px;
    border: 2px solid var(--dark);
    font-family: 'Nunito', sans-serif;
  }

  /* ══ Dotted bg ══ */
  .dot-bg {
    background-image: radial-gradient(circle, rgba(0,102,255,0.08) 1.5px, transparent 1.5px);
    background-size: 24px 24px;
  }

  /* ══ Highlight band ══ */
  .highlight-band {
    background: linear-gradient(135deg, var(--yellow) 0%, var(--orange) 100%);
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

const vm = (d: VariantDetail, s: Record<string, string>) =>
    Object.entries(s).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

/* ─── SHARED STYLES ─── */
const INP = (err?: boolean): React.CSSProperties => ({
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 700,
    background: '#fff', border: `2.5px solid ${err ? 'var(--red)' : 'var(--border)'}`,
    borderRadius: 10, color: 'var(--text)', outline: 'none',
    fontFamily: "'Nunito',sans-serif", transition: 'border-color 0.18s', appearance: 'none'
});

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
    <div>
        {label && <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 900, color: 'var(--mid)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>}
        {children}
        {error && <p style={{ fontSize: '0.72rem', color: 'var(--red)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}><AlertCircle size={11} />{error}</p>}
    </div>
);

/* ── Zigzag SVG ── */
const Zigzag = ({ color = '#F5F7FF', flip = false }) => (
    <div style={{ lineHeight: 0, transform: flip ? 'rotate(180deg)' : 'none', marginBottom: -1 }}>
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: '100%', height: 40, display: 'block' }}>
            <path d="M0,40 L0,20 L60,0 L120,20 L180,0 L240,20 L300,0 L360,20 L420,0 L480,20 L540,0 L600,20 L660,0 L720,20 L780,0 L840,20 L900,0 L960,20 L1020,0 L1080,20 L1140,0 L1200,20 L1200,40 Z" fill={color} />
        </svg>
    </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Nunito',sans-serif" }}>
            <style>{CSS}</style>

            {/* Animated stripe ticker */}
            {store?.topBar?.enabled && store?.topBar?.text && (
              <div className="ticker-wrap" style={{ height: 36, display: 'flex', alignItems: 'center' }}>
                <div className="ticker-inner">
                  {Array(10).fill(null).map((_, i) => (
                    <span key={i} style={{ margin: '0 2.5rem', color: '#fff', fontWeight: 900, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Boogaloo',cursive" }}>
                      ⭐ {store.topBar.text}
                    </span>
                  ))}
                  {Array(10).fill(null).map((_, i) => (
                    <span key={`b${i}`} style={{ margin: '0 2.5rem', color: '#fff', fontWeight: 900, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Boogaloo',cursive" }}>
                      ⭐ {store.topBar.text}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
    const [sq, setSq] = useState('');
    const [ls, setLs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const router = useRouter();
    const count = useCartStore(s => s.count);
    const initCount = useCartStore(s => s.initCount);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
    }, []);
    useEffect(() => {
        if (typeof window !== 'undefined' && domain) {
            try { initCount(JSON.parse(localStorage.getItem(domain) || '[]').length); } catch { initCount(0); }
        }
    }, [domain, initCount]);
    useEffect(() => {
        if (sq.length < 2) { setLs([]); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: sq } }); setLs(data.products || []); }
            catch { } finally { setLoading(false); }
        }, 380);
        return () => clearTimeout(t);
    }, [sq, domain]);

    const doSearch = (e?: React.FormEvent) => { if (e) e.preventDefault(); if (sq.trim()) { router.push(`/?search=${encodeURIComponent(sq)}`); setSq(''); setShowSearch(false); } };

    const Drop = () => (
        <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            left: 0,
            background: '#fff',
            border: '3px solid var(--yellow)',
            borderRadius: 16,
            boxShadow: '0 16px 48px rgba(0,102,255,0.12)',
            zIndex: 200
        }}>
            {/* زر الإغلاق الثابت في الأعلى */}
            <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, padding: '10px 15px' }}>
                <button
                    className='cursor-pointer hover:text-red-400'
                    onClick={() => setSq('')}
                    style={{ background: 'none', border: 'none', padding: 0 }}
                >
                    <X size={18} />
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--blue)', fontWeight: 800, fontSize: '0.875rem' }}>🔍 جاري البحث...</div>
            ) : ls.length > 0 ? (
                <>
                    {/* قائمة النتائج */}
                    {ls.map((p: any) => (
                        <Link
                            href={`/product/${p.id}`}
                            key={p.id}
                            onClick={() => setSq('')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '2px solid var(--bg)' }}
                        >
                            <img
                                src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                                style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }}
                                alt=""
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {p.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--blue)', fontWeight: 900 }}>{p.price} دج</div>
                            </div>
                        </Link>
                    ))}

                    <button
                        onClick={doSearch}
                        style={{ width: '100%', padding: '12px', background: 'var(--blue-lt)', border: 'none', borderTop: '2px solid var(--blue)', color: 'var(--blue)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        عرض جميع النتائج <ArrowLeft size={14} />
                    </button>
                </>
            ) : sq.length >= 2 && (
                <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--soft)', fontSize: '0.875rem', fontWeight: 700 }}>لا توجد نتائج 🎯</div>
            )}
        </div>
    );

    const initials = (store?.name || 'A').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <nav dir="rtl" style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: scrolled ? 'rgba(245,247,255,0.96)' : 'var(--bg)',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? '3px solid var(--yellow)' : '3px solid transparent',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', border: '3px solid var(--yellow)' }}>
                        {(store.design.logoUrl && store.design.logoUrl !== '/default-logo.png')
                            ? <img src={store.design.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            : <span className="font-boogaloo" style={{ fontSize: '1.2rem', color: '#fff' }}>{initials}</span>}
                    </div>
                    <span className="font-boogaloo" style={{ fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '0.01em' }}>{store?.name}</span>
                </Link>

                {/* Desktop search */}
                <div className="nav-d-search" style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
                    <form onSubmit={doSearch}>
                        <input type="text" placeholder="ابحث عن المنتجات... 🔍" value={sq} onChange={e => setSq(e.target.value)}
                            style={{ ...INP(), padding: '0.6rem 1rem 0.6rem 2.75rem', borderRadius: 10, border: '3px solid var(--border)', fontWeight: 700, transition: 'border-color 0.2s' }}
                            onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--blue)' }} />
                    </form>
                    {sq.length >= 2 && <Drop />}
                </div>

                {/* Desktop links */}
                <div className="nav-d-links">
                    {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل' }].map(i => (
                        <Link key={i.h} href={i.h} style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--mid)', transition: 'color 0.15s', padding: '0.375rem 0.875rem', borderRadius: 8 }}
                            onMouseEnter={e => { const el = e.currentTarget; el.style.color = 'var(--blue)'; el.style.background = 'var(--blue-lt)'; }}
                            onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--mid)'; el.style.background = 'transparent'; }}>
                            {i.l}
                        </Link>
                    ))}
                    {store?.cart !== false && (
                        <Link href="/cart" className="btn-adv" style={{ position: 'relative', width: 46, height: 46, borderRadius: 12, border: '3px solid var(--yellow)', background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dark)' }}>
                            <ShoppingCart size={19} />
                            {count > 0 && <span className="cart-badge">{count}</span>}
                        </Link>
                    )}
                </div>

                {/* Mobile */}
                <div className="nav-m-btns">
                    <button onClick={() => setShowSearch(!showSearch)} style={{ width: 40, height: 40, borderRadius: 10, border: '2.5px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--blue)' }}><Search size={18} /></button>

                    <button onClick={() => setOpen(!open)} style={{ width: 40, height: 40, borderRadius: 10, border: '2.5px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--dark)' }}>
                        {open ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile search */}
            {showSearch && (
                <div style={{ padding: '0.625rem 1.25rem', background: '#fff', borderTop: '2.5px solid var(--yellow)', position: 'relative' }}>
                    <form onSubmit={doSearch} style={{ position: 'relative' }}>
                        <input autoFocus type="text" placeholder="ابحث هنا..." value={sq} onChange={e => setSq(e.target.value)}
                            style={{ ...INP(), padding: '0.75rem 1rem 0.75rem 2.75rem' }} />
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--blue)' }} />
                    </form>
                    {sq.length >= 2 && <Drop />}
                </div>
            )}

            {/* Mobile menu */}
            <div style={{ overflow: 'hidden', maxHeight: open ? 200 : 0, transition: 'max-height 0.3s ease', background: '#fff', borderTop: open ? '2.5px solid var(--yellow)' : 'none' }}>
                <div style={{ padding: '0.5rem 1.25rem 1rem' }}>
                    {[{ h: '/', l: '🏠 الرئيسية' }, { h: '/contact', l: '📞 تواصل معنا' }].map(i => (
                        <Link key={i.h} href={i.h} onClick={() => setOpen(false)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '2px solid var(--border)', fontSize: '0.925rem', fontWeight: 800, color: 'var(--text)' }}>
                            {i.l} <ArrowLeft size={15} style={{ color: 'var(--blue)' }} />
                        </Link>
                    ))}
                    {store?.cart !== false && (
                        <Link href={'/cart'} onClick={() => setOpen(false)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '2px solid var(--border)', fontSize: '0.925rem', fontWeight: 800, color: 'var(--text)' }}>
                            {'🛒 السلة'} <ArrowLeft size={15} style={{ color: 'var(--blue)' }} />
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — 3 أقسام
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
    return (
        <footer dir="rtl" style={{ background: 'var(--dark)', color: '#aaa', position: 'relative', overflow: 'hidden' }}>
            {/* Stripe accent */}
            <div className="stripe-bar" style={{ height: 6 }} />

            <div style={{ padding: '3.5rem 1.5rem 2rem', maxWidth: 1280, margin: '0 auto' }}>
                <div className="footer-cols">

                    {/* قسم 1 */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--blue)', border: '3px solid var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="font-boogaloo" style={{ fontSize: '1.1rem', color: '#fff' }}>{(store?.name || 'A')[0]}</span>
                            </div>
                            <span className="font-boogaloo" style={{ fontSize: '1.5rem', color: '#fff' }}>{store?.name}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 300 }}>
                            {store?.hero?.subtitle?.substring(0, 90) || '🎯 ألعاب وأزياء وأدوات تعليمية مبتكرة لتنمية مهارات طفلك.'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', fontSize: '1.5rem' }}>
                            {['🚀', '⭐', '🎮', '🏆', '🎯'].map((e, i) => (
                                <span key={i} style={{ animation: `float ${2.5 + i * 0.4}s ${i * 0.25}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>
                            ))}
                        </div>
                        <p style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.</p>
                    </div>

                    {/* قسم 2 */}
                    <div>
                        <h4 style={{ fontFamily: "'Boogaloo',cursive", fontSize: '1.1rem', color: 'var(--yellow)', marginBottom: '1.25rem' }}>🗺️ روابط سريعة</h4>
                        {[{ h: '/', l: 'الرئيسية', e: '🏠' }, { h: '/cart', l: 'سلة التسوق', e: '🛒' }, { h: '/contact', l: 'تواصل معنا', e: '📞' }, { h: '/Privacy', l: 'الخصوصية', e: '🔒' }, { h: '/Terms', l: 'الشروط', e: '📋' }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map((lnk, i) => (
                            <a key={i} href={lnk.h} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.625rem', transition: 'all 0.2s' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--yellow)'; el.style.transform = 'translateX(-4px)'; }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(255,255,255,0.5)'; el.style.transform = ''; }}>
                                <span>{lnk.e}</span>{lnk.l}
                            </a>
                        ))}
                    </div>

                    {/* قسم 3 */}
                    <div>
                        <h4 style={{ fontFamily: "'Boogaloo',cursive", fontSize: '1.1rem', color: 'var(--yellow)', marginBottom: '1.25rem' }}>📡 تواصل معنا</h4>
                        {[{ e: '📞', v: store?.contact?.phone }, { e: '📍', v: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') }, { e: '📧', v: store?.contact?.email }].filter(r => r.v).map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.625rem' }}>
                                <span>{r.e}</span>{r.v}
                            </div>
                        ))}
                        <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 14, border: '2px solid var(--yellow)', background: 'rgba(255,224,0,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', display: 'inline-block' }} />
                                <span className="font-boogaloo" style={{ fontSize: '1rem', color: '#fff' }}>جاهزون الآن! ⚡</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>نرد خلال ساعات</p>
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
const PALETTES = [
    { border: '#0066FF', bg: '#E3F2FD', accent: '#0066FF', tag: 'var(--blue)' },
    { border: '#00C851', bg: '#E8F5E9', accent: '#009A3D', tag: 'var(--green)' },
    { border: '#FF6B00', bg: '#FFF3E0', accent: '#CC5500', tag: 'var(--orange)' },
    { border: '#7B2FBE', bg: '#F3E8FD', accent: '#7B2FBE', tag: '#7B2FBE' },
    { border: '#FF1744', bg: '#FEE2E2', accent: '#CC0033', tag: 'var(--red)' },
];

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
    const [hov, setHov] = useState(false);

    // 1. تحويل الأسعار مع التأكد من القيم
    const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0);
    const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;

    // 2. تعريف الألوان محلياً إذا لم تكن مستوردة (PALETTES)
    // ملاحظة: تأكد من وجود هذه المصفوفة في ملفك أو استيرادها
    const palettesList = [
        { bg: '#FFF5F5', border: '#FEB2B2', accent: '#F56565' },
        { bg: '#F0FFF4', border: '#9AE6B4', accent: '#48BB78' },
        { bg: '#EBF8FF', border: '#90CDF4', accent: '#4299E1' },
        { bg: '#FAF5FF', border: '#D6BCFA', accent: '#9F7AEA' },
    ];

    // 3. حساب الاختيار مع حماية كاملة ضد القيم الفارغة أو النصوص
    const idValue = product.id ? String(product.id).length : 0; // استخدام الطول أضمن إذا كان الـ ID نصياً
    const pal = palettesList[idValue % palettesList.length];
    return (
        <div className="adv-card" style={{ background: '#fff', border: `3px solid ${hov ? pal.border : 'var(--border)'}`, borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: hov ? `0 16px 48px ${pal.border}22` : '0 2px 10px rgba(0,0,0,0.05)' }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

            {/* Color accent top bar */}
            <div style={{ height: 5, background: pal.border, width: '100%' }} />

            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '1/1', background: pal.bg, overflow: 'hidden' }}>
                {displayImage
                    ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', transform: hov ? 'scale(1.07)' : 'scale(1)' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>🎮</div>}
                {discount > 0 && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: pal.accent, color: '#fff', fontWeight: 900, padding: '3px 10px', borderRadius: 6, fontFamily: "'Boogaloo',cursive", fontSize: '0.85rem' }}>
                        -{discount}%
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: '0.5rem' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} style={{ fill: i < 4 ? '#FFB800' : 'none', color: '#FFB800' }} />)}
                </div>
                <h3 style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.35, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                </h3>
                <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.75rem' }}>
                        <span className="font-boogaloo" style={{ fontSize: '1.5rem', color: pal.accent }}>{price.toLocaleString()}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--soft)' }}>{store?.currency || 'دج'}</span>
                        {orig > price && <span style={{ fontSize: '0.72rem', color: 'var(--soft)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
                    </div>
                    <Link href={`/product/${product.slug || product.id}`} className="btn-adv" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        width: '100%', padding: '0.65rem', borderRadius: 10,
                        background: hov ? pal.border : pal.bg,
                        color: hov ? '#fff' : pal.accent,
                        border: `2.5px solid ${pal.border}`,
                        fontSize: '0.85rem', fontWeight: 800,
                        transition: 'all 0.22s',
                        boxShadow: hov ? `0 6px 18px ${pal.border}44` : 'none'
                    }}>
                        {viewDetails} <ArrowLeft size={13} />
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
            {/* ── HERO SECTION ── */}
            <section
                className="dot-bg"
                style={{
                    position: 'relative',
                    // دمج طبقة تعتيم متدرجة مع صورة الخلفية لضمان بروز النصوص
                    background: `linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.7) 100%), url(${store.hero?.imageUrl || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed', // تأثير بارالاكس عند التمرير
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {/* الدوائر الضوئية الجمالية (Geometric Accents) */}
                <div style={{ position: 'absolute', top: -150, left: -150, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 102, 255, 0.2), transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
                <div style={{ position: 'absolute', bottom: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 224, 0, 0.15), transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

                <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '4rem 1.5rem', position: 'relative', zIndex: 10 }}>
                    <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>

                        {/* الجانب الأيسر: النصوص والأزرار */}
                        <div className="hero-text-content">
                            {/* ملصق الترحيب (Badge) */}
                            <div className="anim-slide-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.25rem', borderRadius: 50, background: 'var(--yellow)', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(255, 224, 0, 0.3)' }}>
                                <Rocket size={16} style={{ color: 'var(--dark)' }} />
                                <span className="font-boogaloo" style={{ fontSize: '1rem', color: 'var(--dark)', fontWeight: 700, letterSpacing: '0.03em' }}>
                                    {store?.name} — مغامرة بلا حدود!
                                </span>
                            </div>

                            {/* العنوان الرئيسي */}
                            <h1 className="anim-slide-up font-boogaloo" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', color: '#fff', lineHeight: 1.1, marginBottom: '1.5rem', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || 'ألعاب · أزياء<br/><span style="color:#FFE000">تعليم · مغامرة!</span>🚀') }} />

                            {/* الخط الملون الفاصل */}
                            <div style={{ height: 6, width: 120, borderRadius: 3, background: 'linear-gradient(90deg, var(--yellow), var(--orange))', marginBottom: '2rem' }} />

                            {/* الوصف */}
                            <p className="anim-slide-up" style={{ fontSize: '1.15rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', maxWidth: 520, lineHeight: 1.8, marginBottom: '3rem' }}>
                                {store.hero?.subtitle || '🎯 كل ما يحتاجه طفلك من ألعاب ذكية، أزياء مريحة، وأدوات تعليمية ممتعة في مكان واحد!'}
                            </p>

                            {/* أزرار العمليات (CTAs) */}
                            <div className="hero-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <a href="#products" className="btn-adv" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '1rem 2.5rem', borderRadius: 16, background: 'var(--yellow)', color: 'var(--dark)', fontWeight: 900, fontSize: '1.1rem', textShadow: 'none', boxShadow: '0 10px 25px rgba(255,224,0,0.4)', transition: '0.3s', textDecoration: 'none' }}>
                                    🛍️ تسوق الآن
                                </a>
                                {store?.cart !== false && (
                                    <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '1rem 2rem', borderRadius: 16, border: '2.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 800, fontSize: '1.05rem', backdropFilter: 'blur(5px)', transition: '0.3s', textDecoration: 'none' }}>
                                        السلة
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section style={{ padding: '4rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
                <div className="feat-grid">
                    {[
                        { icon: <Shield size={22} />, color: 'var(--blue)', bg: 'var(--blue-lt)', t: 'آمن 100%', d: 'معتمد ومضمون' },
                        { icon: <Truck size={22} />, color: 'var(--green)', bg: 'var(--green-lt)', t: 'توصيل سريع', d: '58 ولاية جزائرية' },
                        { icon: <Zap size={22} />, color: 'var(--orange)', bg: 'var(--orange-lt)', t: 'جودة فائقة', d: 'ألعاب ذكية ومبتكرة' },
                        { icon: <Trophy size={22} />, color: 'var(--purple)', bg: '#F3E8FD', t: 'الأكثر مبيعاً', d: 'آلاف عميل سعيد' },
                    ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1.25rem', borderRadius: 16, border: '2.5px solid var(--border)', background: '#fff', transition: 'all 0.28s' }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = f.color; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 8px 28px ${f.color}22`; }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = ''; el.style.boxShadow = ''; }}>
                            <div style={{ width: 46, height: 46, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: f.color }}>
                                {f.icon}
                            </div>
                            <div>
                                <p className="font-boogaloo" style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{f.t}</p>
                                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--soft)' }}>{f.d}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CATEGORIES ── */}
            {cats.length > 0 && (
                <section style={{ padding: '0 1.5rem 4rem', maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.75rem' }}>
                        <div style={{ width: 5, height: 32, borderRadius: 3, background: 'var(--yellow)' }} />
                        <h2 className="font-boogaloo" style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', color: 'var(--text)' }}>الفئات</h2>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                        {cats.map((cat: any, idx: number) => {
                            const cs = ['var(--blue)', 'var(--green)', 'var(--orange)', 'var(--purple)', 'var(--red)'];
                            const lts = ['var(--blue-lt)', 'var(--green-lt)', 'var(--orange-lt)', '#F3E8FD', '#FEE2E2'];
                            const c = cs[idx % cs.length]; const lt = lts[idx % lts.length];
                            return (
                                <Link key={cat.id} href={`?category=${cat.id}`} className="btn-adv" style={{ padding: '0.625rem 1.5rem', borderRadius: 10, border: `2.5px solid ${c}`, color: c, background: lt, fontSize: '0.9rem', fontWeight: 800, transition: 'all 0.2s' }}
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
            <section id="products" style={{ padding: '0 1.5rem 6rem', maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
                    <div style={{ width: 5, height: 32, borderRadius: 3, background: 'var(--blue)' }} />
                    <h2 className="font-boogaloo" style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', color: 'var(--text)' }}>المنتجات</h2>
                    <div style={{ marginRight: 'auto', padding: '0.375rem 0.875rem', borderRadius: 8, background: 'var(--blue-lt)', color: 'var(--blue)', fontSize: '0.82rem', fontWeight: 800 }}>
                        {products.length} منتج 🎯
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="dot-bg" style={{ padding: '5rem', textAlign: 'center', border: '3px dashed var(--border)', borderRadius: 20, background: '#fff' }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'bounce-up 2s ease-in-out infinite' }}>🎮</span>
                        <p className="font-boogaloo" style={{ fontSize: '1.5rem', color: 'var(--soft)' }}>لا توجد منتجات بعد</p>
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
                        <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 10, border: '2.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: 'var(--blue)', opacity: page <= 1 ? 0.3 : 1 }}>❮</Link>
                        {Array.from({ length: countPage }).map((_, i) => {
                            const pn = i + 1; const isA = Number(page) === pn;
                            return (
                                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', border: `2.5px solid ${isA ? 'var(--blue)' : 'var(--border)'}`, background: isA ? 'var(--blue)' : '#fff', color: isA ? '#fff' : 'var(--mid)', boxShadow: isA ? '0 4px 14px rgba(0,102,255,0.3)' : 'none' }}>
                                    {pn}
                                </Link>
                            );
                        })}
                        <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 10, border: '2.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: 'var(--blue)', opacity: page >= countPage ? 0.3 : 1 }}>❯</Link>
                    </div>
                )}
            </section>

            {/* ── ADVENTURE BANNER ── */}
            <section style={{ position: 'relative', overflow: 'hidden' }}>
                <Zigzag color="var(--bg)" flip={false} />
                <div className="dot-bg" style={{ background: 'var(--dark-mid)', padding: '5rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ maxWidth: 700, margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '2.5rem' }}>
                            {['🚀', '⭐', '🎮', '🏆', '🎯'].map((e, i) => (
                                <span key={i} style={{ animation: `bounce-up ${1.8 + i * 0.3}s ${i * 0.2}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>
                            ))}
                        </div>
                        <h2 className="font-boogaloo" style={{ fontSize: 'clamp(2.25rem,6vw,4.5rem)', color: '#fff', marginBottom: '1rem' }}>المغامرة تبدأ هنا!</h2>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '2.5rem', lineHeight: 1.7 }}>آلاف المنتجات الممتعة والتعليمية تنتظر طفلك</p>
                        <a href="#products" className="btn-adv" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.9rem 2.5rem', borderRadius: 12, background: 'var(--yellow)', color: 'var(--dark)', fontWeight: 900, fontSize: '1rem', boxShadow: '0 8px 30px rgba(255,224,0,0.4)', textDecoration: 'none' }}>
                            🎯 استكشف الآن!
                        </a>
                    </div>
                </div>
                <Zigzag color="var(--bg)" flip={true} />
            </section>

        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   DETAILS
══════════════════════════════════════════════════════════════ */

export function Details({ product, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
    const [sel, setSel] = useState(0);
    // توليد رقم عشوائي بين 0 و 10000
    const id = Math.floor(Math.random() * 10001);

    // اختيار لوحة الألوان باستخدام "باقي القسمة" لضمان عدم تخطي طول المصفوفة
    const pal = PALETTES[id % PALETTES.length];

    return (
        <div dir="rtl" style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                <div className="details-layout">

                    {/* Gallery */}
                    <div style={{ top: 84 }}>
                        <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 20, overflow: 'hidden', background: pal.bg, border: `3px solid ${pal.border}` }}>
                            {allImages[sel]
                                ? <img src={allImages[sel]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🎮</div>}
                            {discount > 0 && <div style={{ position: 'absolute', top: 14, right: 14, background: pal.accent, color: '#fff', padding: '4px 14px', borderRadius: 8, fontFamily: "'Boogaloo',cursive", fontSize: '1rem' }}>{discount}% خصم</div>}
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.9)', border: `2px solid ${pal.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
                                    <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.9)', border: `2px solid ${pal.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
                                </>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="thumb-row">
                                {allImages.map((img: string, idx: number) => (
                                    <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 62, height: 62, borderRadius: 12, overflow: 'hidden', border: `3px solid ${sel === idx ? pal.border : 'var(--border)'}`, opacity: sel === idx ? 1 : 0.55, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.2s' }}>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', border: `3px solid ${pal.border}` }}>
                            <div style={{ height: 4, background: pal.border, borderRadius: 2, marginBottom: '1.25rem' }} />
                            <h1 className="font-boogaloo" style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', color: 'var(--text)', marginBottom: '0.625rem', lineHeight: 1.15 }}>{product.name}</h1>
                            <div style={{ display: 'flex', gap: 3, marginBottom: '1.25rem' }}>
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} style={{ fill: i < 4 ? '#FFB800' : 'none', color: '#FFB800' }} />)}
                            </div>

                            {/* Price */}
                            <div style={{ background: pal.bg, border: `3px solid ${pal.border}`, borderRadius: 16, padding: '1.125rem', marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.72rem', fontWeight: 900, color: pal.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>السعر</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                                    <span className="font-boogaloo" style={{ fontSize: '3rem', color: pal.accent, lineHeight: 1 }}>{finalPrice.toLocaleString()}</span>
                                    <span style={{ fontWeight: 800, color: 'var(--mid)', fontSize: '1rem' }}>دج</span>
                                </div>
                            </div>

                            {/* Stock */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 1rem', borderRadius: 8, fontWeight: 800, fontSize: '0.82rem', marginBottom: '1.5rem', background: autoGen ? 'var(--yellow-lt)' : inStock ? 'var(--green-lt)' : '#FEE2E2', color: autoGen ? 'var(--yellow-dk)' : inStock ? 'var(--green-dk)' : 'var(--red)' }}>
                                
                            </div>

                            {/* Offers */}
                            {product.offers?.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 900, color: pal.accent, textTransform: 'uppercase', marginBottom: '0.625rem' }}>🎁 اختر الباقة</p>
                                    {product.offers.map((o: any) => (
                                        <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: `3px solid ${selectedOffer === o.id ? pal.border : 'var(--border)'}`, borderRadius: 14, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? pal.bg : 'transparent', transition: 'all 0.2s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2.5px solid ${selectedOffer === o.id ? pal.border : 'var(--border)'}`, background: selectedOffer === o.id ? pal.border : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {selectedOffer === o.id && <Check size={11} color="#fff" />}
                                                </div>
                                                <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                                                <div>
                                                    <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{o.name}</p>
                                                    <p style={{ fontSize: '0.72rem', color: 'var(--soft)', fontWeight: 700 }}>الكمية: {o.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-boogaloo" style={{ fontSize: '1.3rem', color: pal.accent }}>{o.price.toLocaleString()} دج</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Attributes */}
                            {allAttrs.map((attr: any) => (
                                <div key={attr.id} style={{ marginBottom: '1.25rem' }}>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 900, color: pal.accent, textTransform: 'uppercase', marginBottom: '0.625rem' }}>
                                        {attr.displayMode === 'color' ? '🎨' : attr.displayMode === 'image' ? '🖼️' : '📏'} {attr.name}
                                    </p>

                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {attr.variants.map((v: any) => {
                                            const isSelected = selectedVariants[attr.name] === v.value;

                                            // حالة الألوان
                                            if (attr.displayMode === 'color') {
                                                return (
                                                    <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                                                        style={{ width: 30, height: 30, borderRadius: 8, background: v.value, border: 'none', cursor: 'pointer', outline: `3px solid ${isSelected ? pal.border : 'transparent'}`, outlineOffset: 3, transition: 'outline 0.2s' }}
                                                    />
                                                );
                                            }

                                            // حالة الصور (جديد)
                                            if (attr.displayMode === 'image') {
                                                return (
                                                    <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                                                        style={{
                                                            width: 45, height: 45, borderRadius: 8,
                                                            backgroundImage: `url(${v.value})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                                            border: 'none', cursor: 'pointer',
                                                            outline: `3px solid ${isSelected ? pal.border : 'transparent'}`, outlineOffset: 3, transition: 'all 0.2s'
                                                        }}
                                                    />
                                                );
                                            }

                                            // الحالة الافتراضية (نصوص)
                                            return (
                                                <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                                                    style={{ padding: '0.4rem 1rem', border: `2.5px solid ${isSelected ? pal.border : 'var(--border)'}`, borderRadius: 8, fontWeight: 800, fontSize: '0.85rem', background: isSelected ? pal.bg : '#fff', color: isSelected ? pal.accent : 'var(--mid)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                                                    {v.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

                            {product.desc && (
                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `3px dashed ${pal.border}` }}>
                                    <p className="font-boogaloo" style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.875rem' }}>📖 تفاصيل المنتج</p>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.8, color: 'var(--mid)' }}
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
    useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

    const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
    const getFP = useCallback((): number => {
        const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
        const off = product.offers?.find((o: any) => o.id === selectedOffer);
        if (off) return off.price;
        if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
            const m = product.variantDetails.find((v: any) => vm(v, selectedVariants));
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
        return product.variantDetails.find((v: any) => vm(v, selectedVariants))?.id;
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

    const BTN_MAIN: React.CSSProperties = {
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '0.9rem', borderRadius: 12, border: 'none', cursor: sub ? 'not-allowed' : 'pointer',
        fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1rem', color: 'var(--dark)',
        background: 'var(--yellow)', boxShadow: '0 6px 24px rgba(255,224,0,0.4)',
        opacity: sub ? 0.7 : 1, transition: 'all 0.22s'
    };

    return (
        <div style={{ paddingTop: '1.5rem', borderTop: '3px dashed var(--border)', marginTop: '1.5rem' }}>
        {product.store?.cart && (
                <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
                    <button onClick={addToCart} disabled={isAdded} className={isAdded ? 'anim-cart-pop' : ''} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0.875rem', borderRadius: 12, cursor: isAdded ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.9rem', border: `2.5px solid ${isAdded ? 'var(--green)' : 'var(--border)'}`, background: isAdded ? 'var(--green-lt)' : '#fff', color: isAdded ? 'var(--green-dk)' : 'var(--mid)', transition: 'all 0.25s' }}>
                        {isAdded ? <><CheckCircle2 size={15} className="anim-check" /> تمت الإضافة!</> : <><ShoppingCart size={15} /> أضف للسلة</>}
                    </button>
                    <button onClick={() => setIsOrderNow(true)} className="btn-adv" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0.875rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 900, fontSize: '0.9rem', background: 'var(--blue)', color: '#fff', boxShadow: '0 4px 16px rgba(0,102,255,0.3)' }}>
                        <Zap size={15} /> طلب الآن
                    </button>
                </div>
            )}

            {(isOrderNow || !product.store?.cart) && (
                <div className="anim-slide-up">
                    {product.store?.cart && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📦 بيانات التوصيل</p>
                            <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.375rem 0.75rem', borderRadius: 8, border: '2px solid var(--border)', background: '#fff', color: 'var(--soft)', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                                <X size={11} /> إلغاء
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                            <FR error={errors.customerName} label="الاسم">
                                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" style={INP(!!errors.customerName)} />
                            </FR>
                            <FR error={errors.customerPhone} label="الهاتف">
                                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0XXXXXXXXX" style={INP(!!errors.customerPhone)} />
                            </FR>
                        </div>
                        <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                            <FR error={errors.customerWelaya} label="الولاية">
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--blue)', pointerEvents: 'none' }} />
                                    <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.customerWelaya), paddingLeft: 32, fontFamily: 'inherit' }}>
                                        <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                            <FR error={errors.customerCommune} label="البلدية">
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--blue)', pointerEvents: 'none' }} />
                                    <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.customerCommune), paddingLeft: 32, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}>
                                        <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                        </div>

                        {/* Delivery */}
                        <div style={{ marginBottom: '0.875rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>🚚 نوع التوصيل</p>
                            <div className="delivery-grid">
                                {(['home', 'office'] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.875rem', border: `3px solid ${fd.typeLivraison === t ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'var(--blue-lt)' : '#fff', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                                        <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: 4 }}>{t === 'home' ? '🏠' : '🏢'}</span>
                                        <p style={{ fontWeight: 900, fontSize: '0.8rem', color: fd.typeLivraison === t ? 'var(--blue)' : 'var(--soft)' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                                        {selW && <p className="font-boogaloo" style={{ fontSize: '1rem', color: fd.typeLivraison === t ? 'var(--blue)' : 'var(--soft)' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Qty */}
                        <div style={{ marginBottom: '0.875rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>🔢 الكمية</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '3px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)' }}><Minus size={16} /></button>
                                <span className="font-boogaloo" style={{ width: 46, textAlign: 'center', fontSize: '1.375rem', color: 'var(--text)' }}>{fd.quantity}</span>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)' }}><Plus size={16} /></button>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="dot-bg" style={{ background: '#fff', border: '3px solid var(--border)', borderRadius: 16, padding: '1.125rem', marginBottom: '1.25rem' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>🧾 ملخص الطلب</p>
                            {[
                                { l: 'المنتج', v: product.name.slice(0, 26) + (product.name.length > 26 ? '..' : '') },
                                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
                            ].map(r => (
                                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '2px dashed var(--border)' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--soft)' }}>{r.l}</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text)' }}>{r.v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.375rem' }}>
                                <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--blue)' }}>المجموع</span>
                                <span className="font-boogaloo" style={{ fontSize: '2.25rem', color: 'var(--blue)' }}>{total().toLocaleString()} <span style={{ fontSize: '0.9rem', fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>دج</span></span>
                            </div>
                        </div>

                        <button type="submit" disabled={sub} className="btn-adv" style={BTN_MAIN}>
                            {sub ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> جاري المعالجة...</> : '🎯 تأكيد الطلب'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--soft)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <Lock size={11} style={{ color: 'var(--blue)' }} /> دفع آمن ومشفر
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
    const [fd, setFd] = useState({
        customerName: '',
        customerPhone: '',
        customerWelaya: '',
        customerCommune: '',
        typeLivraison: 'home' as 'home' | 'office'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const initCount = useCartStore(s => s.initCount);

    useEffect(() => {
        setItems(JSON.parse(localStorage.getItem(domain) || '[]'));
        if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
    }, [domain, store]);

    useEffect(() => {
        if (!fd.customerWelaya) { setCommunes([]); return; }
        setLC(true);
        fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
    }, [fd.customerWelaya]);

    const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

    const getLiv = () => {
        if (!selW) return 0;
        return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice;
    };

    const cartTotal = items.reduce((a, i) => a + (i.finalPrice * i.quantity), 0);
    const finalTotal = cartTotal + +getLiv();
    const update = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };
    const changeQty = (i: number, d: number) => { const n = [...items]; n[i].quantity = Math.max(1, n[i].quantity + d); update(n); };

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
            await axios.post(`${API_URL}/orders/create`, items.map(i => ({
                ...fd,
                productId: i.productId,
                storeId: i.storeId,
                userId: i.userId,
                selectedOffer: i.selectedOffer,
                variantDetailId: i.variantDetailId,
                selectedVariants: i.selectedVariants,
                platform: i.platform || 'store',
                finalPrice: i.finalPrice,
                totalPrice: finalTotal,
                priceLivraison: +getLiv(),
                quantity: i.quantity,
                customerId: i.customerId || '',
                priceLoss: selW?.livraisonReturn ?? 0
            })));
            setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
        } catch { } finally { setSubmitting(false); }
    };

    if (success) return (
        <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
            <div className="anim-zoom-in" style={{ textAlign: 'center', background: '#fff', padding: '4rem 2.5rem', borderRadius: 24, border: '3px solid var(--yellow)', maxWidth: 460, width: '100%', boxShadow: '0 12px 40px rgba(255,224,0,0.2)' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.25rem', animation: 'bounce-up 2s ease-in-out infinite' }}>🎉</span>
                <h2 className="font-boogaloo" style={{ fontSize: '2rem', color: 'var(--blue)', marginBottom: '0.625rem' }}>تم استلام طلبك!</h2>
                <p style={{ color: 'var(--mid)', fontWeight: 700, marginBottom: '2rem', lineHeight: 1.7 }}>شكراً لثقتك! سنتواصل معك قريباً لتأكيد الطلب.</p>
                <Link href="/" className="btn-adv" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 2rem', borderRadius: 12, background: 'var(--yellow)', color: 'var(--dark)', fontWeight: 900, fontSize: '0.95rem', boxShadow: '0 6px 24px rgba(255,224,0,0.4)' }}>
                    🛍️ العودة للمتجر
                </Link>
            </div>
        </div>
    );

    if (!items.length) return (
        <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
            <div className="dot-bg" style={{ textAlign: 'center', padding: '4rem 2rem', border: '3px dashed var(--blue)', borderRadius: 24, maxWidth: 400, width: '100%', background: '#fff' }}>
                <ShoppingBag size={52} style={{ color: 'var(--border)', display: 'block', margin: '0 auto 1.25rem', opacity: 0.5 }} />
                <p className="font-boogaloo" style={{ fontSize: '1.5rem', color: 'var(--soft)', marginBottom: '1.75rem' }}>السلة فارغة 🎮</p>
                <Link href="/" className="btn-adv" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 2rem', borderRadius: 12, background: 'var(--yellow)', color: 'var(--dark)', fontWeight: 900, fontSize: '0.95rem', boxShadow: '0 6px 24px rgba(255,224,0,0.4)' }}>
                    🛒 تسوق الآن
                </Link>
            </div>
        </div>
    );

    return (
        <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2.5rem 1.5rem 5rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
                    <div style={{ width: 5, height: 36, borderRadius: 3, background: 'var(--yellow)' }} />
                    <h1 className="font-boogaloo" style={{ fontSize: 'clamp(2rem,5vw,3rem)', color: 'var(--text)' }}>🛒 سلة التسوق</h1>
                </div>
                <div className="cart-layout">
                    {/* Items */}
                    <div style={{ background: '#fff', borderRadius: 20, border: '3px solid var(--border)', overflow: 'hidden', alignSelf: 'start' }}>
                        <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '3px solid var(--border)', background: 'var(--blue-lt)' }}>
                            <Package size={18} style={{ color: 'var(--blue)' }} />
                            <span className="font-boogaloo" style={{ color: 'var(--blue)', fontSize: '1rem' }}>منتجاتك ({items.length})</span>
                        </div>
                        {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '2px solid var(--border)' }}>
                                <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 76, height: 76, borderRadius: 14, objectFit: 'cover', border: '3px solid var(--border)', flexShrink: 0 }} alt="" />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{item.product?.name}</h4>
                                    <p className="font-boogaloo" style={{ fontSize: '1.25rem', color: 'var(--blue)' }}>{item.finalPrice?.toLocaleString()} دج</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.375rem' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '2px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                                            <button onClick={() => changeQty(i, -1)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)' }}><Minus size={12} /></button>
                                            <span style={{ width: 32, textAlign: 'center', fontWeight: 900, background: 'var(--bg)', lineHeight: '30px', fontSize: '0.9rem' }}>{item.quantity}</span>
                                            <button onClick={() => changeQty(i, 1)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)' }}><Plus size={12} /></button>
                                        </div>
                                        <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.625rem', borderRadius: 8, border: '2px solid #FEE2E2', background: 'transparent', color: 'var(--red)', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#FEE2E2')}
                                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                                            <Trash2 size={12} /> حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div style={{ padding: '1rem 1.25rem', background: 'var(--blue-lt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--blue)' }}>المجموع الفرعي</span>
                            <span className="font-boogaloo" style={{ fontSize: '1.625rem', color: 'var(--blue)' }}>{cartTotal.toLocaleString()} دج</span>
                        </div>
                    </div>

                    {/* Checkout */}
                    <div style={{ background: '#fff', borderRadius: 20, border: '3px solid var(--border)', padding: '1.75rem', alignSelf: 'start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
                            <Truck size={18} style={{ color: 'var(--blue)' }} />
                            <span className="font-boogaloo" style={{ color: 'var(--blue)', fontSize: '1.1rem' }}>معلومات التوصيل</span>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row-2" style={{ marginBottom: '0.75rem' }}>
                                <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={INP(!!errors.name)} /></FR>
                                <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={INP(!!errors.phone)} /></FR>
                            </div>
                            <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                                <FR error={errors.w} label="الولاية">
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--blue)', pointerEvents: 'none' }} />
                                        <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.w), paddingLeft: 32, fontFamily: 'inherit' }}>
                                            <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                        </select>
                                    </div>
                                </FR>
                                <FR error={errors.c} label="البلدية">
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--blue)', pointerEvents: 'none' }} />
                                        <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.c), paddingLeft: 32, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}>
                                            <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                        </select>
                                    </div>
                                </FR>
                            </div>

                            {/* نوع التوصيل — جديد */}
                            <div style={{ margin: '1.25rem 0' }}>
                                <p className="font-boogaloo" style={{ fontSize: '0.9rem', color: 'var(--blue)', marginBottom: '0.75rem' }}>🚚 نوع التوصيل</p>
                                <div className="delivery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {(['home', 'office'] as const).map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFd(p => ({ ...p, typeLivraison: t }))}
                                            style={{
                                                padding: '0.875rem 0.5rem',
                                                border: `3px solid ${fd.typeLivraison === t ? 'var(--yellow)' : 'var(--border)'}`,
                                                borderRadius: 14,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                background: fd.typeLivraison === t ? 'var(--yellow)' : '#fff',
                                                fontFamily: 'inherit',
                                                transition: 'all 0.2s',
                                                boxShadow: fd.typeLivraison === t ? '0 4px 16px rgba(255,224,0,0.3)' : 'none'
                                            }}
                                        >
                                            <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: 4 }}>{t === 'home' ? '🏠' : '🏢'}</span>
                                            <p style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 2 }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                                            {selW && <p className="font-boogaloo" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--blue)' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="dot-bg" style={{ background: '#fff', border: '3px solid var(--border)', borderRadius: 14, padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '2px dashed var(--border)' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--soft)' }}>المجموع الفرعي</span>
                                    <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>{cartTotal.toLocaleString()} دج</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.625rem', marginBottom: '0.625rem', borderBottom: '2px dashed var(--border)' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--soft)' }}>التوصيل</span>
                                    <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>{getLiv() ? `${getLiv().toLocaleString()} دج` : '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontWeight: 900, color: 'var(--blue)' }}>الإجمالي</span>
                                    <span className="font-boogaloo" style={{ fontSize: '2rem', color: 'var(--blue)' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.85rem', fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>دج</span></span>
                                </div>
                            </div>

                            <button type="submit" disabled={submitting} className="btn-adv" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.9rem', borderRadius: 12, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1rem', color: 'var(--dark)', background: 'var(--yellow)', boxShadow: '0 6px 24px rgba(255,224,0,0.4)', opacity: submitting ? 0.7 : 1 }}>
                                {submitting ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> جاري...</> : '🎯 تأكيد الطلب'}
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
        <div className="dot-bg" style={{ background: 'var(--dark)', padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.25rem', animation: 'bounce-up 2s ease-in-out infinite' }}>{emoji}</span>
            <h1 className="font-boogaloo" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#fff' }}>{title}</h1>
            <Zigzag color="var(--bg)" flip={true} />
        </div>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>{children}</div>
    </div>
);

const IB = ({ icon, title, desc, color = 'var(--blue)', bg = 'var(--blue-lt)' }: { icon: React.ReactNode; title: string; desc: string; color?: string; bg?: string }) => (
    <div style={{ display: 'flex', gap: '1.125rem', padding: '1.25rem', marginBottom: '0.75rem', borderRadius: 16, border: '2.5px solid var(--border)', background: '#fff', transition: 'all 0.3s', cursor: 'default' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = color; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = `0 8px 28px ${color}22`; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = ''; el.style.boxShadow = ''; }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>{icon}</div>
        <div>
            <h3 className="font-boogaloo" style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.375rem' }}>{title}</h3>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.7, color: 'var(--mid)' }}>{desc}</p>
        </div>
    </div>
);

export function Privacy() {
    return <Shell emoji="🔒" title="سياسة الخصوصية"><IB color="var(--blue)" bg="var(--blue-lt)" icon={<Shield size={18} />} title="البيانات التي نجمعها" desc="نجمع فقط البيانات الضرورية لإتمام طلبك — الاسم، رقم الهاتف، والعنوان." /><IB color="var(--green)" bg="var(--green-lt)" icon={<Lock size={18} />} title="حماية بياناتك" desc="نستخدم تشفيراً متطوراً لضمان أمان معلوماتك الشخصية." /><IB color="var(--orange)" bg="var(--orange-lt)" icon={<Shield size={18} />} title="سياسة المشاركة" desc="لا نبيع أو نشارك بياناتك مع أطراف ثالثة. خصوصيتك أولويتنا." /></Shell>;
}
export function Terms() {
    return <Shell emoji="📋" title="الشروط والأحكام"><IB color="var(--blue)" bg="var(--blue-lt)" icon={<CheckCircle2 size={18} />} title="الطلبات" desc="يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الدفع عند الاستلام." /><IB color="var(--green)" bg="var(--green-lt)" icon={<Truck size={18} />} title="التوصيل" desc="نوفر خدمة التوصيل لجميع ولايات الجزائر." /><IB color="var(--orange)" bg="var(--orange-lt)" icon={<Shield size={18} />} title="الضمانات" desc="نلتزم بأعلى معايير الجودة والسلامة في جميع منتجاتنا." /></Shell>;
}
export function Cookies() {
    return <Shell emoji="🍪" title="ملفات الارتباط"><IB color="var(--blue)" bg="var(--blue-lt)" icon={<Shield size={18} />} title="الملفات الأساسية" desc="ضرورية لعمل سلة التسوق وحفظ بيانات جلستك." /><IB color="var(--green)" bg="var(--green-lt)" icon={<Sparkles size={18} />} title="تحسين التجربة" desc="تساعدنا على تقديم تجربة مخصصة وأفضل لك." /></Shell>;
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
            <div className="dot-bg" style={{ background: 'var(--dark)', padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.25rem', animation: 'bounce-up 2s ease-in-out infinite' }}>📞</span>
                <h1 className="font-boogaloo" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#fff', marginBottom: '0.5rem' }}>تواصل معنا</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>نحن هنا لمساعدتك دائماً! 🚀</p>
                <Zigzag color="var(--bg)" flip={true} />
            </div>
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
                <div className="contact-layout">
                    <div>
                        {[{ e: '📞', l: 'الهاتف', v: store?.contact?.phone, c: 'var(--blue)' }, { e: '📍', l: 'الموقع', v: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / '), c: 'var(--green)' }, { e: '📧', l: 'البريد', v: store?.contact?.email, c: 'var(--orange)' }].filter(r => r.v).map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1.125rem', borderRadius: 16, border: `2.5px solid var(--border)`, background: '#fff', marginBottom: '0.75rem', transition: 'all 0.25s' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = r.c; el.style.transform = 'translateX(-4px)'; }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = ''; }}>
                                <span style={{ fontSize: '2rem' }}>{r.e}</span>
                                <div><p style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--soft)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{r.l}</p><p style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.9rem' }}>{r.v}</p></div>
                            </div>
                        ))}
                        <div style={{ padding: '1.25rem', borderRadius: 16, border: '3px solid var(--yellow)', background: 'var(--yellow-lt)', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', display: 'inline-block' }} />
                                <span className="font-boogaloo" style={{ fontSize: '1rem', color: 'var(--dark)' }}>جاهزون الآن! ⚡</span>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--mid)', fontWeight: 700 }}>نرد خلال ساعات قليلة</p>
                        </div>
                    </div>

                    <div style={{ background: '#fff', borderRadius: 20, border: '3px solid var(--border)', padding: '2rem' }}>
                        {sent ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }} className="anim-zoom-in">
                                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'bounce-up 2s ease-in-out infinite' }}>🎉</span>
                                <h2 className="font-boogaloo" style={{ fontSize: '1.75rem', color: 'var(--blue)', marginBottom: '0.5rem' }}>تم الإرسال!</h2>
                                <p style={{ color: 'var(--mid)', fontWeight: 700, lineHeight: 1.7 }}>سنرد عليك في أقرب وقت ممكن! 🚀</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-row-2">
                                    <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 900, color: 'var(--mid)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>الاسم</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={INP()} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 900, color: 'var(--mid)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>الهاتف</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={INP()} /></div>
                                </div>
                                <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 900, color: 'var(--mid)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>البريد الإلكتروني</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={INP()} /></div>
                                <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 900, color: 'var(--mid)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>رسالتك</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...INP(), resize: 'none' }} /></div>
                                <button type="submit" disabled={loading} className="btn-adv" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.9rem', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1rem', color: 'var(--dark)', background: 'var(--yellow)', boxShadow: '0 6px 24px rgba(255,224,0,0.4)', opacity: loading ? 0.7 : 1 }}>
                                    {loading ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> جاري...</> : <>🚀 إرسال الرسالة</>}
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