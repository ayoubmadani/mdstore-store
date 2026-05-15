'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
    Star, ChevronDown, ChevronLeft, ChevronRight,
    AlertCircle, X, Phone, CheckCircle2, ArrowLeft, Zap,
    Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
    Trash2, Loader2, MapPin, ShieldCheck, Truck, Sparkles,
    Crown, Gem, Sun, Scissors, User,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/*
  ═══════════════════════════════════════════════════════════
  THEME: LUXE & TAILORED — Fashion / Editorial / Luxury
  COLOR: #f5f0e8 (Cream) + #2c2824 (Charcoal) + #c4a574 (Gold)
  ═══════════════════════════════════════════════════════════
*/

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Inter:wght@200;300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:      #f5f0e8;
    --cream-dk:   #ebe5da;
    --sand:       #d4c4a8;
    --sand-light: #e8dcc8;
    --tan:        #b8a080;
    --tan-dk:     #9a8568;
    --brown:      #6b5b4a;
    --brown-dk:   #4a3f35;
    --gold:       #c4a574;
    --gold-light: #d4b88a;
    --charcoal:   #2c2824;
    --warm:       #8a7e6e;
    --ivory:      #faf8f4;
    --text:       #2c2824;
    --text-mid:   #6b5b4a;
    --text-soft:  #8a7e6e;
    --border:     #e5e0d8;
    --surface:    #faf8f4;
  }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--cream);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    zoom: 1.3;
  }

  a { text-decoration: none; color: inherit; }
  .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
  .font-sans { font-family: 'Inter', system-ui, sans-serif; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--cream); }
  ::-webkit-scrollbar-thumb { background: var(--sand); border-radius: 0; }

  /* ── Keyframes ── */
  @keyframes fadeUp     { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn     { from { opacity:0; } to { opacity:1; } }
  @keyframes slideRight { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes revealLine { from { width:0%; } to { width:100%; } }
  @keyframes ticker     { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes checkPop   { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes scaleIn    { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }

  .anim-fade-up     { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-slide-right { animation: slideRight 0.5s ease both; }
  .anim-check       { animation: checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
  .anim-scale-in    { animation: scaleIn 1s cubic-bezier(0.16,1,0.3,1) both; }

  /* ── Gold line ── */
  .gold-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }

  /* ── Ticker ── */
  .ticker-wrap { overflow: hidden; background: var(--charcoal); color: var(--gold); height: 32px; display: flex; align-items: center; }
  .ticker-track { display: flex; white-space: nowrap; animation: ticker 35s linear infinite; }
  .ticker-item { font-size: 0.65rem; font-weight: 400; letter-spacing: 0.15em; padding: 0 2.5rem; text-transform: uppercase; }

  /* ── Nav link underline ── */
  .nav-link-fancy {
    position: relative;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-size: 0.65rem;
    font-weight: 500;
    color: var(--brown-dk);
    transition: color 0.3s ease;
  }
  .nav-link-fancy::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--gold);
    transition: width 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  .nav-link-fancy:hover { color: var(--gold); }
  .nav-link-fancy:hover::after { width: 100%; }

  /* ── Category tab ── */
  .cat-tab {
    position: relative;
    padding: 1.25rem 0.5rem;
    text-align: center;
    border-left: 1px solid rgba(212,196,168,0.25);
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    font-weight: 500;
    color: var(--charcoal);
    transition: all 0.4s ease;
  }
  .cat-tab:last-child { border-left: none; }
  .cat-tab::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 1px;
    background: var(--gold);
    transition: width 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  .cat-tab:hover::after,
  .cat-tab.active::after { width: 60%; }
  .cat-tab:hover { color: var(--gold); }

  /* ── Responsive Layout ── */
  .nav-desktop  { display: none; align-items: center; gap: 2rem; }
  .nav-search-d { display: none; flex: 1; max-width: 320px; margin: 0 2rem; }
  .nav-mobile   { display: flex; gap: 0.5rem; }

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
    gap: 0;
  }
  @media (min-width: 768px) {
    .cats-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media (min-width: 640px) {
    .products-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1024px) {
    .products-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
  }
  @media (min-width: 1280px) {
    .products-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .hero-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    align-items: end;
    min-height: 70vh;
    padding: 4rem 1.5rem;
  }
  @media (min-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr 1fr; min-height: 75vh; padding: 0 0 5rem 4rem; }
  }

  .details-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
  .gallery-container { position: relative; top: 0; width: 100%; }
  .info-container {
    background: var(--surface);
    border-radius: 0;
    padding: 1.5rem;
    border: 1px solid var(--border);
  }
  @media (min-width: 768px) {
    .details-inner { grid-template-columns: 1fr 1fr; gap: 3rem; padding: 2rem; }
    .gallery-container { position: sticky; top: 90px; z-index: 10; }
    .info-container { padding: 2rem; }
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
    border-bottom: 1px solid rgba(212,196,168,0.2);
  }
  @media (min-width: 768px) {
    .footer-inner { grid-template-columns: 2fr 1fr 1fr 1fr; }
  }

  .hero-actions { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .hero-actions { flex-direction: row; align-items: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

  .thumb-row { display: flex; gap: 0.625rem; margin-top: 0.875rem; overflow-x: auto; padding-bottom: 4px; }

  .pagination { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 3rem; }

  .price-mono {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
    letter-spacing: -0.02em;
  }

  .card-stripe::before {
    content: '';
    position: absolute;
    inset: 0;
    bottom: auto;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
  }
  .card-wrap:hover .card-stripe::before { transform: scaleX(1); }

  /* ── Grain overlay ── */
  .grain-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.02;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  /* ── Editorial text ── */
  .editorial { font-style: italic; font-weight: 300; }

  /* ── Divider line ── */
  .divider-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--sand), transparent);
  }

  /* ── Tag badge ── */
  .tag-badge {
    letter-spacing: 0.2em;
    font-size: 9px;
    font-weight: 500;
    text-transform: uppercase;
  }

  /* ── Scroll reveal ── */
  .scroll-reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .scroll-reveal.revealed {
    opacity: 1;
    transform: translateY(0);
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

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
    return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
    try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; }
    catch { return []; }
};
const fetchCommunes = async (wid: string): Promise<Commune[]> => {
    try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; }
    catch { return []; }
};

/* ─── SHARED STYLES ─── */
const S = {
    input: {
        width: '100%', padding: '0.85rem 1.125rem',
        background: 'transparent', border: '1px solid #e5e0d8',
        borderRadius: 0, fontSize: '0.9rem', color: '#2c2824',
        outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', appearance: 'none'
    } as React.CSSProperties,
    inputErr: { borderColor: '#c4a574', boxShadow: '0 0 0 3px rgba(196,165,116,0.1)' } as React.CSSProperties,
    btnPrimary: {
        width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: '#2c2824', color: '#faf8f4', fontWeight: 500, fontSize: '0.75rem',
        padding: '0.875rem 1.5rem', borderRadius: 0, border: 'none', cursor: 'pointer',
        transition: 'all 0.4s ease', fontFamily: "'Inter', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase'
    } as React.CSSProperties,
};

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
            <style>{THEME_CSS}</style>
            <div className="grain-overlay" />
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
    const [imgError, setImgError] = useState(false);

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
            try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); setListSearch(data.products || []); }
            catch { } finally { setLoading(false); }
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
    <div style={{ 
        paddingTop: 10, // تقليل المساحة العلوية لجعل زر الإغلاق متوازناً
        position: 'absolute', 
        top: 'calc(100% + 8px)', 
        right: 0, 
        left: 0, 
        background: '#ffffff', // خلفية صلبة بدلاً من شفافة لضمان التباين (Contrast)
        border: '1px solid var(--border)', 
        borderRadius: 0, 
        boxShadow: '0 20px 50px rgba(0,0,0,0.12)', // ظل أعمق لبروز القائمة
        zIndex: 100, 
        maxHeight: '400px', // زيادة الارتفاع قليلاً
        overflowY: 'auto' 
    }} className="anim-fade-up">
        
        {/* زر الإغلاق */}
        <button onClick={() => setSearchQuery('')} 
            style={{ 
                position: 'absolute', 
                top: 12, 
                left: 12, 
                cursor: 'pointer', 
                background: 'var(--cream)', 
                border: 'none', 
                color: 'var(--charcoal)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                zIndex: 10
            }}>
            <X size={16} strokeWidth={1.5} />
        </button>

        {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 500 }}>
                جاري البحث...
            </div>
        ) : listSearch.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {listSearch.map((p: any) => (
                    <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSearchQuery('')}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            padding: '1rem', 
                            borderBottom: '1px solid var(--border)', 
                            textDecoration: 'none',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {/* صورة المنتج مع خلفية فاتحة لضمان التباين إذا كانت الصورة شفافة */}
                        <div style={{ width: 50, height: 50, background: '#f9f9f9', flexShrink: 0 }}>
                            <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '2px' }}>
                                {p.name}
                            </div>
                            <div className="price-mono" style={{ fontSize: '0.8rem', color: 'var(--tan-dk)', fontWeight: 700 }}>
                                {p.price} دج
                            </div>
                        </div>
                        <ArrowLeft size={12} color="var(--sand)" />
                    </Link>
                ))}
                
                {/* زر عرض الكل - تباين عالي */}
                <button onClick={handleSearch} 
                    style={{ 
                        width: '100%', 
                        padding: '15px', 
                        background: 'var(--charcoal)', // لون داكن لتباين قوي مع النتائج
                        border: 'none', 
                        color: 'var(--ivory)', 
                        fontWeight: 500, 
                        fontSize: '0.75rem', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '10px',
                        letterSpacing: '0.1em'
                    }}>
                    عرض جميع النتائج <ArrowLeft size={14} />
                </button>
            </div>
        ) : searchQuery.length >= 2 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.85rem' }}>
                لا توجد نتائج لـ "{searchQuery}"
            </div>
        )}
    </div>
);

    return (
        <>
            {/* Top Bar */}
            <div style={{ background: '#ebe5da', borderBottom: '1px solid rgba(212,196,168,0.3)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8a7e6e' }}>توصيل مجاني للطلبات فوق 5000 دج</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Link href="/contact" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7e6e', transition: 'color 0.3s' }} onMouseEnter={e => (e.currentTarget.style.color = '#2c2824')} onMouseLeave={e => (e.currentTarget.style.color = '#8a7e6e')}>المتاجر</Link>
                        <Link href="/contact" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7e6e', transition: 'color 0.3s' }} onMouseEnter={e => (e.currentTarget.style.color = '#2c2824')} onMouseLeave={e => (e.currentTarget.style.color = '#8a7e6e')}>خدمة العملاء</Link>
                    </div>
                </div>
            </div>

            <nav dir="rtl" style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: scrolled ? 'rgba(245,240,232,0.96)' : '#f5f0e8',
                borderBottom: `1px solid ${scrolled ? '#e5e0d8' : 'transparent'}`,
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                transition: 'all 0.5s ease'
            }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

                    {/* Left Links */}
                    <div className="nav-desktop" style={{ flex: 1, justifyContent: 'flex-start' }}>
                        {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'المجموعة' }, { h: '/contact', l: 'تواصل' }].map(i => (
                            <Link key={i.l} href={i.h} className="nav-link-fancy">{i.l}</Link>
                        ))}
                    </div>

                    {/* Logo center */}
                    <Link href="/" style={{ flexShrink: 0, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
                            <img src={store.design.logoUrl} style={{ height: 28, objectFit: 'contain', display: 'block' }} alt={store?.name || 'Store Logo'} onError={() => setImgError(true)} />
                        ) : (
                            <>
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.35rem', fontWeight: 600, color: '#2c2824', letterSpacing: '0.25em' }}>
                                    {store?.name?.toUpperCase() || 'LUXE'}
                                </span>
                                <span style={{ fontSize: '0.55rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#8a7e6e', marginTop: -2 }}>& Tailored</span>
                            </>
                        )}
                    </Link>

                    {/* Right Links + Search + Cart */}
                    <div className="nav-desktop" style={{ flex: 1, justifyContent: 'flex-end', gap: '1.5rem' }}>

                        <div className="nav-search-d" style={{ position: 'relative' }}>
                            <form onSubmit={handleSearch}>
                                <input type="text" placeholder="ابحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '0.4rem 1rem 0.4rem 2.25rem', borderRadius: 0, border: '1px solid #e5e0d8', background: 'transparent', fontSize: '0.75rem', outline: 'none', transition: 'border-color 0.3s' }}
                                    onFocus={e => { e.target.style.borderColor = '#c4a574'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e0d8'; }} />
                                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a7e6e' }} strokeWidth={1} />
                            </form>
                            {searchQuery.length >= 2 && <DropResults />}
                        </div>
                        {store?.cart && (
                            <Link href="/cart" style={{ position: 'relative', color: '#2c2824', transition: 'color 0.3s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#c4a574'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#2c2824'; }}>
                                <ShoppingCart size={17} strokeWidth={1} />
                                {count > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#c4a574', color: '#fff', fontSize: 8, fontWeight: 700, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
                            </Link>
                        )}
                    </div>

                    {/* Mobile */}
                    <div className="nav-mobile" style={{ marginRight: 'auto' }}>
                        <button onClick={() => setShowSearch(!showSearch)} style={{ width: 36, height: 36, borderRadius: 0, border: '1px solid #e5e0d8', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Search size={15} strokeWidth={1} />
                        </button>
                        {store?.cart && (
                            <Link href="/cart" style={{ position: 'relative', width: 36, height: 36, borderRadius: 0, border: '1px solid #e5e0d8', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2c2824' }}>
                                <ShoppingCart size={15} strokeWidth={1} />
                                {count > 0 && <span style={{ position: 'absolute', top: -3, right: -3, background: '#c4a574', color: '#fff', fontSize: 8, fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
                            </Link>
                        )}
                        <button onClick={() => setOpen(!open)} style={{ width: 36, height: 36, borderRadius: 0, border: '1px solid #e5e0d8', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            {open ? <X size={15} strokeWidth={1} /> : <Menu size={15} strokeWidth={1} />}
                        </button>
                    </div>
                </div>

                {/* Mobile search */}
                {showSearch && (
                    <div style={{ padding: '0.5rem 1.25rem', background: 'transparent', borderTop: '1px solid #e5e0d8', position: 'relative' }} className="anim-fade-up">
                        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                            <input autoFocus type="text" placeholder="ابحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.25rem', border: '1px solid #c4a574', borderRadius: 0, background: '#f5f0e8', fontSize: '0.85rem', outline: 'none' }} />
                            <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#c4a574' }} strokeWidth={1} />
                        </form>
                        {searchQuery.length >= 2 && <DropResults />}
                    </div>
                )}

                {/* Mobile nav */}
                <div style={{ overflow: 'hidden', maxHeight: open ? 220 : 0, transition: 'max-height 0.35s ease', background: 'transparent', borderTop: open ? '1px solid #e5e0d8' : 'none' }}>
                    <div style={{ padding: '0.5rem 1.25rem 1rem' }}>
                        {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'المجموعة' }, { h: '/contact', l: 'الدار' }, { h: '/contact', l: 'تواصل معنا' }].map(i => (
                            <Link
                                key={i.l} // تم التغيير من i.h إلى i.l لضمان تفرد المفتاح لكل عنصر
                                href={i.h}
                                onClick={() => setOpen(false)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.625rem 0',
                                    borderBottom: '1px solid #f0ede8',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: '#2c2824'
                                }}
                            >
                                {i.l} <ArrowLeft size={13} style={{ color: '#c4a574' }} />
                            </Link>
                        ))}
                        {store?.cart && (
                            <Link href="/cart" onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #f0ede8', fontSize: '0.85rem', fontWeight: 500, color: '#2c2824' }}>
                                السلة <ArrowLeft size={13} style={{ color: '#c4a574' }} />
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
    return (
        <footer dir="rtl" style={{ background: 'var(--cream-dk)', borderTop: '1px solid rgba(212,196,168,0.3)', padding: '5rem 1.5rem 2rem' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '4rem',
                    paddingBottom: '3rem',
                    marginBottom: '2rem',
                    borderBottom: '1px solid rgba(212,196,168,0.2)'
                }}>

                    {/* العمود الأول: الهوية والوصف */}
                    <div className="anim-fade-up">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <span className="font-display" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--charcoal)', letterSpacing: '0.2em' }}>
                                {store?.name?.toUpperCase() || 'LUXE'}
                            </span>
                            <span style={{ fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--tan)', marginTop: -4, fontWeight: 500 }}>
                                & Tailored
                            </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--brown)', maxWidth: 320 }}>
                            {store?.hero?.subtitle?.substring(0, 120) || 'أزياء فاخرة وخياطة مخصصة للفرد المميز. نجسّد الأناقة في كل تفصيلة منذ 1987.'}
                        </p>
                    </div>

                    {/* العمود الثاني: الروابط السريعة */}
                    <div className="anim-fade-up" style={{ animationDelay: '0.1s' }}>
                        <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--charcoal)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem', borderBottom: '1px solid var(--sand)', display: 'inline-block', paddingBottom: '4px' }}>
                            روابط سريعة
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {[
                                { h: '/', l: 'الرئيسية' },
                                { h: '/cart', l: 'سلة التسوق' },
                                { h: '/contact', l: 'تواصل معنا' },
                                { h: '/Privacy', l: 'سياسة الخصوصية' },
                                { h: '/Terms', l: 'الشروط والأحكام' }
                            ].map((lnk, i) => (
                                <Link key={i} href={lnk.h} className="nav-link-fancy" style={{ fontSize: '0.8rem', width: 'fit-content', color: 'var(--brown)' }}>
                                    {lnk.l}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* العمود الثالث: معلومات التواصل */}
                    <div className="anim-fade-up" style={{ animationDelay: '0.2s' }}>
                        <h4 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--charcoal)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem', borderBottom: '1px solid var(--sand)', display: 'inline-block', paddingBottom: '4px' }}>
                            تواصل معنا
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            {store?.contact?.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--brown)', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--gold)', display: 'flex' }}><Phone size={14} strokeWidth={1.5} /></span>
                                    <span className="price-mono">{store.contact.phone}</span>
                                </div>
                            )}
                            {store?.contact?.wilaya && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--brown)', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--gold)', display: 'flex' }}><MapPin size={14} strokeWidth={1.5} /></span>
                                    <span>{store.contact.wilaya}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(196,165,116,0.05)', padding: '0.5rem 1rem', border: '1px solid rgba(196,165,116,0.15)' }}>
                            <span className="anim-check" style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                            <span style={{ fontSize: '0.7rem', color: 'var(--warm)', fontWeight: 500 }}>متاحون الآن</span>
                        </div>
                    </div>

                </div>

                {/* الشريط السفلي */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-soft)', letterSpacing: '0.05em' }}>
                        © {new Date().getFullYear()} {store?.name || 'LUXE'}. جميع الحقوق محفوظة.
                    </p>
                    <div className="divider-line" style={{ width: '100px', opacity: 0.3 }}></div>
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
    const [isHovered, setIsHovered] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const initCount = useCartStore((s) => s.initCount);

    const getVarId = useCallback(() => {
        if (!product.variantDetails?.length) return undefined;
        return product.variantDetails[0]?.id;
    }, [product.variantDetails]);

    const getFP = useCallback((): number => {
        const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
        if (product.variantDetails?.length) {
            const m = product.variantDetails[0];
            if (m && m.price !== -1) return m.price;
        }
        return base;
    }, [product]);

    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAdded) return;

        const domain = product.store?.subdomain || 'store';
        const fp = getFP();
        const cart = JSON.parse(localStorage.getItem(domain) || '[]');

        cart.push({
            product,
            variantDetailId: getVarId(),
            productId: product.id,
            storeId: product.store.id,
            userId: product.store.userId,
            selectedOffer: null,
            selectedVariants: {},
            platform: 'store',
            finalPrice: fp,
            totalPrice: fp,
            priceLivraison: 0,
            quantity: 1,
            customerId: '',
            customerName: '',
            customerPhone: '',
            customerWelaya: '',
            customerCommune: '',
            typeLivraison: 'home',
            addedAt: Date.now(),
        });

        localStorage.setItem(domain, JSON.stringify(cart));
        initCount(cart.length);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div
            style={{
                background: 'transparent',
                border: 'none',
                borderRadius: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
                cursor: 'pointer',
                transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>

            <div className="card-stripe" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }} />

            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '3/4', background: '#ebe5da', overflow: 'hidden' }}>
                {displayImage
                    ? <img
                        src={displayImage}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = '')}
                    />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Scissors size={36} color="#d4c4a8" strokeWidth={1} /></div>
                }

                {/* Discount / New badge */}
                {discount > 0 && (
                    <div style={{ position: 'absolute', top: 12, left: 12, background: '#faf8f4', color: '#2c2824', fontSize: 9, fontWeight: 500, padding: '4px 10px', letterSpacing: '0.15em', textTransform: 'uppercase', zIndex: 3 }}>
                        جديد
                    </div>
                )}

                {/* Hover overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(44,40,36,0)', transition: 'background 0.5s ease', pointerEvents: 'none', zIndex: 2 }}
                    className="group-hover:bg-luxe-charcoal/5" />

            </div>

            {/* Info */}
            <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
                    <p style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7e6e', marginBottom: '0.375rem' }}>أزياء فاخرة</p>
                    <div dir='ltr' style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                        <span className="price-mono" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 600, color: '#2c2824' }}>{price.toLocaleString()}</span>
                        <span style={{ fontSize: '0.7rem', color: '#8a7e6e', fontWeight: 500 }}>{store?.currency || 'دج'}</span>
                        {orig > price && <span style={{ fontSize: '0.7rem', color: '#d4c4a8', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
                    </div>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 500, color: '#2c2824', marginBottom: '0.375rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                </h3>
                <Link
                    href={`/product/${product.slug || product.id}`}
                    style={{
                        // التوسعة الكاملة
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',

                        padding: '0.75rem 1rem', // زيادة الـ padding ليعطي شعوراً بالفخامة على كامل العرض
                        background: '#2c2824',
                        color: '#faf8f4',
                        fontSize: '0.7rem', // تكبير الخط قليلاً ليتناسب مع حجم الزر الجديد
                        fontWeight: 500,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        zIndex: 10,

                        // الانتقالات والحركة
                        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                        transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
                        opacity: isHovered ? 1 : 0.95,
                        boxShadow: isHovered ? '0 8px 20px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',

                        gap: 10,
                        borderRadius: '0px', // الحفاظ على الحواف الحادة للمظهر الكلاسيكي
                    }}
                    onMouseEnter={e => {
                        e.stopPropagation();
                        (e.currentTarget as HTMLAnchorElement).style.background = '#4a3f35';
                    }}
                    onMouseLeave={e => {
                        e.stopPropagation();
                        (e.currentTarget as HTMLAnchorElement).style.background = '#2c2824';
                    }}
                >
                    <span style={{ marginTop: '-1px' }}>{viewDetails || 'عرض المزيد'}</span>
                    <ArrowLeft size={12} strokeWidth={1.5} />
                </Link>
            </div>


        </div>
    );
}/* ═══════════════════════════════════════════════════════════
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
            <section style={{ position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                {store.hero?.imageUrl && (
                    <div style={{ position: 'absolute', inset: 0 }}>
                        <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="anim-scale-in" />

                        {/* التعديل: تدرج لوني أغمق وأكثر تركيزاً في جهة النص (Right for RTL) لزيادة التباين */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to left, rgba(44, 40, 36, 0.7) 0%, rgba(44, 40, 36, 0.3) 50%, transparent 100%)',
                            zIndex: 1
                        }} />

                        {/* التدرج السفلي لدمج الصورة مع محتوى الصفحة */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #f5f0e8 0%, transparent 40%)', zIndex: 2 }} />
                    </div>
                )}

                <div className="hero-inner" style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 10, width: '100%' }}>
                    <div style={{ maxWidth: 460 }}> {/* تمت زيادة العرض قليلاً لراحة العين */}
                        <p style={{
                            fontSize: '0.65rem',
                            letterSpacing: '0.35em',
                            textTransform: 'uppercase',
                            color: 'var(--gold-light)', // استخدام لون ذهبي فاتح للتمييز
                            marginBottom: '1rem',
                            fontWeight: 600
                        }} className="anim-fade-up">
                            خريف / شتاء 2026
                        </p>

                        <h1 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                            fontWeight: 300,
                            color: '#faf8f4',
                            lineHeight: 1.1,
                            marginBottom: '1.25rem',
                            textShadow: '0 2px 10px rgba(0,0,0,0.2)' // ظل خفيف للعنوان
                        }} className="anim-fade-up">
                            فنُّ اللباس<br />
                            <span style={{ fontStyle: 'italic', fontWeight: 300 }}>الراقي</span>
                        </h1>

                        {/* التعديل: النص الفرعي مع تحسين اللون والظل */}
                        <p style={{
                            fontSize: '0.9rem',
                            color: '#ffffff', // تحويله للأبيض الصريح لزيادة التباين
                            lineHeight: 1.8,
                            marginBottom: '2rem',
                            textShadow: '0 1px 4px rgba(0,0,0,0.4)', // ظل أسود ناعم خلف الحروف يجعلها مقروءة على أي خلفية
                            fontWeight: 400,
                            opacity: 0.95
                        }} className="anim-fade-up">
                            {store.hero?.subtitle || 'توازن بين التراث والحداثة — اكتشف أزياءً خُيِّطت بصبر الخياط وروح الفنان.'}
                        </p>

                        <div className="hero-actions anim-fade-up">
                            <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ivory)', color: 'var(--charcoal)', fontWeight: 600, fontSize: '0.7rem', padding: '0.9rem 2rem', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.4s ease' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 15px 30px -10px rgba(0,0,0,0.4)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ''; (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; }}>
                                اكتشف المجموعة <ArrowLeft size={14} />
                            </a>
                            <a href="#about" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#faf8f4', fontWeight: 400, fontSize: '0.7rem', padding: '0.75rem 0', letterSpacing: '0.15em', textTransform: 'uppercase', borderBottom: '1px solid rgba(250,248,244,0.4)', transition: 'all 0.4s ease', marginRight: '2rem' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = '#faf8f4'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'rgba(250,248,244,0.4)'; }}>
                                دارنا
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CATEGORY TABS ── */}
            {cats.length > 0 && (
                <section style={{ background: '#f5f0e8', borderBottom: '1px solid rgba(212,196,168,0.3)' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                        <div className="cats-grid">
                            {cats.map((cat: any, idx: number) => (
                                <Link key={cat.id} href={`?category=${cat.id}`} className="cat-tab" style={{ borderLeft: idx < cats.length - 1 ? '1px solid rgba(212,196,168,0.25)' : 'none' }}>
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── PRODUCTS ── */}
            <section id="products" style={{ padding: '4rem 1.5rem 5rem', maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                    <div>
                        <p style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c4a574', marginBottom: '0.5rem' }}>المختارات</p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 400, color: '#2c2824' }}>
                            قطعُ <span style={{ fontStyle: 'italic', fontWeight: 300 }}>التميّز</span> الهادئ
                        </h2>
                    </div>
                    <Link href="/" style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7e6e', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.3s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#c4a574'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8a7e6e'; }}>
                        عرض الكل <ArrowLeft size={12} />
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div style={{ padding: '5rem', textAlign: 'center', border: '1px dashed #e5e0d8' }}>
                        <Scissors size={48} color="#d4c4a8" strokeWidth={1} style={{ display: 'block', margin: '0 auto 1rem' }} />
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#8a7e6e', fontSize: '1.1rem', fontWeight: 500 }}>لا توجد منتجات بعد</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((p: any) => {
                            const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                            const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                            return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="اكتشف" />;
                        })}
                    </div>
                )}

                {countPage > 1 && (
                    <div className="pagination" dir="rtl">
                        <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
                            style={{ width: 36, height: 36, borderRadius: 0, border: '1px solid #e5e0d8', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#2c2824', fontWeight: 500, transition: 'all 0.3s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#c4a574'; (e.currentTarget as HTMLAnchorElement).style.color = '#c4a574'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e0d8'; (e.currentTarget as HTMLAnchorElement).style.color = '#2c2824'; }}>❮</Link>
                        {Array.from({ length: countPage }).map((_, i) => {
                            const pn = i + 1; const isA = Number(page) === pn;
                            return (
                                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 500, border: `1px solid ${isA ? '#2c2824' : '#e5e0d8'}`, background: isA ? '#2c2824' : '#fff', color: isA ? '#faf8f4' : '#5c5c5c', transition: 'all 0.3s' }}>
                                    {pn}
                                </Link>
                            );
                        })}
                        <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
                            style={{ width: 36, height: 36, borderRadius: 0, border: '1px solid #e5e0d8', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#2c2824', fontWeight: 500, transition: 'all 0.3s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#c4a574'; (e.currentTarget as HTMLAnchorElement).style.color = '#c4a574'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e0d8'; (e.currentTarget as HTMLAnchorElement).style.color = '#2c2824'; }}>❯</Link>
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
        <div dir="rtl" style={{ background: 'var(--cream)', paddingBottom: '4rem' }}>
            <div className="details-inner" style={{ maxWidth: 1280, margin: '0 auto' }}>

                {/* Gallery */}
                <div className="gallery-container">
                    <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 0, overflow: 'hidden', background: '#ebe5da', border: '1px solid #e5e0d8' }}>
                        {allImages[sel]
                            ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Scissors size={48} color="#d4c4a8" strokeWidth={1} /></div>}

                        {discount > 0 && (
                            <div style={{ position: 'absolute', top: 14, right: 14, background: '#faf8f4', color: '#2c2824', fontSize: 10, fontWeight: 500, padding: '5px 14px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                {discount}% خصم
                            </div>
                        )}

                        {allImages.length > 1 && (
                            <>
                                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}><ChevronRight size={18} strokeWidth={1} /></button>
                                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}><ChevronLeft size={18} strokeWidth={1} /></button>
                            </>
                        )}
                    </div>

                    {allImages.length > 1 && (
                        <div className="thumb-row">
                            {allImages.map((img: string, idx: number) => (
                                <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 0, overflow: 'hidden', border: `2px solid ${sel === idx ? '#c4a574' : '#e5e0d8'}`, opacity: sel === idx ? 1 : 0.5, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.4s ease' }}>
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div>
                    <div className="info-container">
                        <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a7e6e', marginBottom: '0.5rem' }}>أزياء فاخرة</p>
                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 500, color: '#2c2824', marginBottom: '0.75rem', lineHeight: 1.1 }}>
                            {product.name}
                        </h1>

                        <div style={{ display: 'flex', gap: 3, marginBottom: '1.25rem' }}>
                            {[...Array(5)].map((_, i) => <Star key={i} size={13} style={{ fill: i < 4 ? '#c4a574' : 'none', color: '#c4a574' }} />)}
                        </div>

                        {/* Price box */}
                        <div style={{ background: '#2c2824', borderRadius: 0, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, #c4a574, #d4b88a)' }} />
                            <p style={{ fontSize: '0.65rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.375rem' }}>السعر الإجمالي</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <span className="price-mono" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 500, color: '#c4a574' }}>{finalPrice.toLocaleString()}</span>
                                <span style={{ fontWeight: 500, color: '#faf8f4', fontSize: '1rem' }}>دج</span>
                            </div>
                        </div>

                        {/* Offers */}
                        {product.offers?.length > 0 && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c2824', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>اختر الباقة</p>
                                {product.offers.map((o: any) => (
                                    <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: `1.5px solid ${selectedOffer === o.id ? '#c4a574' : '#e5e0d8'}`, borderRadius: 0, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? 'rgba(196,165,116,0.04)' : 'transparent', transition: 'all 0.3s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? '#c4a574' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {selectedOffer === o.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#c4a574' }} />}
                                            </div>
                                            <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                                            <div>
                                                <p style={{ fontWeight: 600, color: '#2c2824', fontSize: '0.875rem' }}>{o.name}</p>
                                                <p style={{ fontSize: '0.7rem', color: '#8a7e6e' }}>الكمية: {o.quantity}</p>
                                            </div>
                                        </div>
                                        <span className="price-mono" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: '#c4a574', fontSize: '1.1rem' }}>{o.price.toLocaleString()} دج</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Attributes */}
                        {allAttrs.map((attr: any) => (
                            <div key={attr.id} style={{ marginBottom: '1.125rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c2824', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{attr.name}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {attr.variants.map((v: any) => {
                                        const isSelected = selectedVariants[attr.name] === v.value;
                                        return (
                                            <button
                                                key={v.id}
                                                onClick={() => handleVariantSelection(attr.name, v.value)}
                                                style={
                                                    attr.displayMode === 'color' ? {
                                                        width: 32, height: 32, borderRadius: '50%', background: v.value, border: '1px solid #e5e0d8', cursor: 'pointer',
                                                        outline: `2.5px solid ${isSelected ? '#c4a574' : 'transparent'}`, outlineOffset: 3, transition: 'all 0.3s'
                                                    } : attr.displayMode === 'image' ? {
                                                        width: 48, height: 48, borderRadius: 0, backgroundImage: `url(${v.value})`, backgroundSize: 'cover',
                                                        backgroundPosition: 'center', border: `2px solid ${isSelected ? '#c4a574' : '#e5e0d8'}`,
                                                        cursor: 'pointer', transition: 'all 0.3s'
                                                    } : {
                                                        padding: '0.45rem 1.1rem', border: `1.5px solid ${isSelected ? '#c4a574' : '#e5e0d8'}`, borderRadius: 0,
                                                        fontSize: '0.8rem', fontWeight: 600, background: isSelected ? 'rgba(196,165,116,0.06)' : '#fff',
                                                        color: isSelected ? '#9a8568' : '#5c5c5c', cursor: 'pointer', transition: 'all 0.3s'
                                                    }
                                                }
                                            >
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
                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e0d8' }}>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 500, color: '#2c2824', marginBottom: '0.875rem' }}>تفاصيل المنتج</p>
                                <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: '#6b5b4a' }}
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
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
        {label && <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#5c5c5c', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>}
        {children}
        {error && <p style={{ fontSize: '0.7rem', color: '#c4a574', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}><AlertCircle size={10} />{error}</p>}
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

    const getLiv = useCallback((): number => {
        if (!selW) return 0;
        return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice;
    }, [selW, fd.typeLivraison]);

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
        cart.push({
            ...fd, product, variantDetailId: getVarId(), productId: product.id,
            storeId: product.store.id, userId, selectedOffer, selectedVariants,
            platform: platform || 'store', finalPrice: fp, totalPrice: total(),
            priceLivraison: getLiv(), addedAt: Date.now()
        });
        localStorage.setItem(domain, JSON.stringify(cart));
        initCount(cart.length);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const er = validate();
        if (Object.keys(er).length) { setErrors(er); return; }
        setErrors({}); setSub(true);
        try {
            await axios.post(`${API_URL}/orders/create`, {
                ...fd, productId: product.id, storeId: product.store.id, userId,
                selectedOffer, variantDetailId: getVarId(), platform: platform || 'store',
                finalPrice: fp, totalPrice: total(), priceLivraison: getLiv()
            });
            if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
            router.push(`/lp/${domain}/successfully`);
        } catch { } finally { setSub(false); }
    };

    const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

    return (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e0d8' }}>
            {product.store?.cart && (
                <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
                    <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.8rem 1rem', border: `1px solid ${isAdded ? '#059669' : '#e5e0d8'}`, borderRadius: 0, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', background: isAdded ? 'rgba(5,150,105,0.06)' : '#fff', color: isAdded ? '#059669' : '#2c2824', transition: 'all 0.3s', fontFamily: 'inherit', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {isAdded ? <><CheckCircle2 size={13} className="anim-check" />تمت الإضافة</> : <><ShoppingCart size={13} />أضف للسلة</>}
                    </button>
                    <button onClick={() => setIsOrderNow(true)} style={{ flex: 1, ...S.btnPrimary, width: 'auto' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#4a3f35')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#2c2824')}>
                        طلب الآن
                    </button>
                </div>
            )}

            {(isOrderNow || !product.store?.cart) && (
                <div className="anim-slide-right">
                    {product.store?.cart && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.8rem', color: '#2c2824', textTransform: 'uppercase', letterSpacing: '0.08em' }}>بيانات التوصيل</p>
                            <button onClick={() => setIsOrderNow(false)} style={{ fontSize: '0.7rem', color: '#8a7e6e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>إلغاء</button>
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
                                    <ChevronDown size={11} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8a7e6e', pointerEvents: 'none' }} />
                                    <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.customerWelaya), paddingRight: 36, fontFamily: 'inherit' }}>
                                        <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                            <FR error={errors.customerCommune} label="البلدية">
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={11} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8a7e6e', pointerEvents: 'none' }} />
                                    <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingRight: 36, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                                        <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                        </div>

                        <div style={{ marginBottom: '0.875rem' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#5c5c5c', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>التوصيل</p>
                            <div className="delivery-grid">
                                {(['home', 'office'] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.8rem', border: `1.5px solid ${fd.typeLivraison === t ? '#c4a574' : '#e5e0d8'}`, borderRadius: 0, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'rgba(196,165,116,0.04)' : '#fff', transition: 'all 0.3s', fontFamily: 'inherit' }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 4, color: fd.typeLivraison === t ? '#9a8568' : '#5c5c5c' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                                        {selW && <p className="price-mono" style={{ fontSize: '1.05rem', fontWeight: 600, color: fd.typeLivraison === t ? '#2c2824' : '#d1d5db' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '0.875rem' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#5c5c5c', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>الكمية</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #e5e0d8', borderRadius: 0, overflow: 'hidden', background: '#fff' }}>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#2c2824' }}><Minus size={13} strokeWidth={1} /></button>
                                <span style={{ width: 42, textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>{fd.quantity}</span>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#2c2824' }}><Plus size={13} strokeWidth={1} /></button>
                            </div>
                        </div>

                        {/* Summary */}
                        <div style={{ background: '#faf8f4', border: '1px solid #e5e0d8', borderRadius: 0, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.7rem', marginBottom: '0.75rem', color: '#2c2824', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ملخص الطلب</p>
                            {[
                                { l: 'المنتج', v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
                                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
                            ].map(r => (
                                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #e5e0d8' }}>
                                    <span style={{ fontSize: '0.78rem', color: '#8a7e6e' }}>{r.l}</span>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2c2824' }}>{r.v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.375rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#2c2824' }}>المجموع</span>
                                <span className="price-mono" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 500, color: '#c4a574' }}>{total().toLocaleString()} <span style={{ fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 500, color: '#9a8568' }}>دج</span></span>
                            </div>
                        </div>

                        <button type="submit" disabled={sub} style={{ ...S.btnPrimary, opacity: sub ? 0.7 : 1 }}
                            onMouseEnter={e => !sub && ((e.currentTarget as HTMLButtonElement).style.background = '#4a3f35')}
                            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#2c2824')}>
                            {sub ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> جاري المعالجة...</> : 'تأكيد الطلب'}
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
            await axios.post(`${API_URL}/orders/create`, items.map(i => ({
                ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId,
                selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId,
                selectedVariants: i.selectedVariants, platform: i.platform || 'store',
                finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(),
                quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0
            })));
            setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
        } catch { } finally { setSubmitting(false); }
    };

    const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

    if (success) return (
        <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#f5f0e8' }}>
            <div style={{ textAlign: 'center', background: 'transparent', padding: '3rem 2rem', borderRadius: 0, border: '1px solid #059669', maxWidth: 460, width: '100%' }}>
                <div style={{ width: 60, height: 60, background: 'rgba(5,150,105,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <CheckCircle2 size={28} style={{ color: '#059669' }} strokeWidth={1} />
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 500, color: '#2c2824', marginBottom: '0.625rem' }}>تم استلام طلبك!</h2>
                <p style={{ color: '#6b5b4a', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.875rem' }}>شكراً لثقتك. سنتواصل معك قريباً لتأكيد الطلب.</p>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2c2824', color: '#faf8f4', padding: '0.75rem 1.75rem', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'all 0.4s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#4a3f35'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#2c2824'; }}>العودة للمتجر</Link>
            </div>
        </div>
    );

    if (!items.length) return (
        <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#f5f0e8' }}>
            <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed #e5e0d8', borderRadius: 0, maxWidth: 440, width: '100%', background: '#fff' }}>
                <ShoppingBag size={48} style={{ color: '#e5e0d8', display: 'block', margin: '0 auto 1.25rem' }} strokeWidth={1} />
                <p style={{ color: '#8a7e6e', fontSize: '0.9375rem', marginBottom: '2rem' }}>السلة فارغة</p>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2c2824', color: '#faf8f4', padding: '0.75rem 1.75rem', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'all 0.4s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#4a3f35'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#2c2824'; }}>تسوق الآن</Link>
            </div>
        </div>
    );

    return (
        <div dir="rtl" style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto', minHeight: '100vh' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 500, color: '#2c2824', letterSpacing: '0.04em', marginBottom: '2rem' }}>السلة</h1>
            <div className="cart-inner">
                {/* Products */}
                <div style={{ background: 'transparent', borderRadius: 0, border: '1px solid #e5e0d8', overflow: 'hidden', alignSelf: 'start' }}>
                    {items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #f0ede8' }}>
                            <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 72, height: 72, borderRadius: 0, objectFit: 'cover', flexShrink: 0 }} alt="" />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontWeight: 500, color: '#2c2824', marginBottom: '0.25rem', fontSize: '0.85rem', lineHeight: 1.4 }}>{item.product?.name}</h4>
                                <p className="price-mono" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontWeight: 500, color: '#c4a574' }}>{item.finalPrice?.toLocaleString()} دج</p>
                                <p style={{ fontSize: '0.65rem', color: '#8a7e6e', marginTop: '0.2rem' }}>الكمية: {item.quantity}</p>
                            </div>
                            <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ color: '#e5e0d8', padding: '0.375rem', borderRadius: 0, background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center', transition: 'color 0.3s' }}
                                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#c4a574')}
                                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#e5e0d8')}>
                                <Trash2 size={16} strokeWidth={1} />
                            </button>
                        </div>
                    ))}
                    <div style={{ padding: '1rem', background: '#faf8f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#4a3f35' }}>المجموع الفرعي</span>
                        <span className="price-mono" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 500, color: '#2c2824' }}>{cartTotal.toLocaleString()} دج</span>
                    </div>
                </div>

                {/* Checkout */}
                <div style={{ background: 'transparent', borderRadius: 0, border: '1px solid #e5e0d8', padding: '1.5rem', alignSelf: 'start' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2c2824', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>معلومات التوصيل</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row-2">
                            <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={inp(!!errors.name)} /></FR>
                            <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={inp(!!errors.phone)} /></FR>
                        </div>
                        <div className="form-row-2">
                            <FR error={errors.w} label="الولاية">
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={11} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8a7e6e', pointerEvents: 'none' }} />
                                    <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.w), paddingRight: 34, fontFamily: 'inherit' }}>
                                        <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                            <FR error={errors.c} label="البلدية">
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={11} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8a7e6e', pointerEvents: 'none' }} />
                                    <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingRight: 34, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                                        <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                        </div>

                        <div style={{ margin: '1rem 0' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>نوع التوصيل</p>
                            <div className="delivery-grid">
                                {(['home', 'office'] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.7rem', border: `2px solid ${fd.typeLivraison === t ? '#c4a574' : '#e5e0d8'}`, borderRadius: 0, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'rgba(196,165,116,0.04)' : '#fff', fontFamily: 'inherit', transition: 'all 0.3s' }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.75rem', color: fd.typeLivraison === t ? '#9a8568' : '#6b6b6b' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                                        {selW && <p style={{ fontWeight: 600, fontSize: '0.8rem', color: '#2c2824', marginTop: 2 }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: '#faf8f4', border: '1px solid #e5e0d8', borderRadius: 0, padding: '1rem 1.125rem', margin: '1rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #e5e0d8' }}>
                                <span style={{ fontSize: '0.78rem', color: '#6b6b6b' }}>المجموع الفرعي</span>
                                <span style={{ fontWeight: 500, color: '#2c2824', fontSize: '0.8rem' }}>{cartTotal.toLocaleString()} دج</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.625rem', marginBottom: '0.625rem', borderBottom: '1px solid #e5e0d8' }}>
                                <span style={{ fontSize: '0.78rem', color: '#6b6b6b' }}>التوصيل</span>
                                <span style={{ fontWeight: 500, color: '#2c2824', fontSize: '0.8rem' }}>{getLiv() ? `${getLiv().toLocaleString()} دج` : '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: 600, color: '#2c2824' }}>الإجمالي</span>
                                <span className="price-mono" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 500, color: '#c4a574' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9a8568' }}>دج</span></span>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}
                            onMouseEnter={e => !submitting && ((e.currentTarget as HTMLButtonElement).style.background = '#4a3f35')}
                            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#2c2824')}>
                            {submitting ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> جاري المعالجة...</> : 'تأكيد الطلب'}
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
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f5f0e8' }}>
        <div style={{ background: '#2c2824', paddingTop: 88, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: 'rgba(196,165,116,0.1)', border: '1px solid rgba(196,165,116,0.2)', padding: '0.375rem 1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#c4a574', letterSpacing: '0.15em', textTransform: 'uppercase' }}>أزياء فاخرة</span>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: 500, color: '#faf8f4', letterSpacing: '0.04em' }}>{title}</h1>
        </div>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>{children}</div>
    </div>
);

const InfoBlock = ({ title, body }: { title: string; body: string }) => (
    <div style={{ padding: '1.25rem 0', borderBottom: '1px solid #e5e0d8', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ width: 3, height: 18, background: 'linear-gradient(180deg, #c4a574, #d4b88a)', borderRadius: 0, flexShrink: 0, marginTop: 3 }} />
        <div>
            <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#2c2824', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#6b5b4a' }}>{body}</p>
        </div>
    </div>
);

export function Privacy() {
    return (
        <Shell title="سياسة الخصوصية">
            <div style={{ background: 'transparent', padding: '2rem', borderRadius: 0, border: '1px solid #e5e0d8' }}>
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
            <div style={{ background: 'transparent', padding: '2rem', borderRadius: 0, border: '1px solid #e5e0d8' }}>
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
            <div style={{ background: 'transparent', padding: '2rem', borderRadius: 0, border: '1px solid #e5e0d8' }}>
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
        <div dir="rtl" style={{ background: '#f5f0e8', minHeight: '100vh' }}>
            <div style={{ background: '#2c2824', paddingTop: 88, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, textAlign: 'center' }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 500, color: '#faf8f4', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>تواصل معنا</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>نحن هنا للإجابة على استفساراتكم</p>
            </div>
            <div className="contact-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
                {/* Info */}
                <div>
                    <div style={{ background: 'transparent', borderRadius: 0, border: '1px solid #e5e0d8', padding: '1.5rem', marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.6rem', fontWeight: 600, color: '#c4a574', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>معلومات الاتصال</p>
                        {[
                            { icon: <Phone size={15} strokeWidth={1} />, label: 'الهاتف', val: store?.contact?.phone || 'غير متوفر' },
                            { icon: <MapPin size={15} strokeWidth={1} />, label: 'الموقع', val: store?.contact?.wilaya || 'الجزائر' },
                        ].map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 0, background: 'rgba(196,165,116,0.06)', border: '1px solid rgba(196,165,116,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4a574', flexShrink: 0 }}>{r.icon}</div>
                                <div>
                                    <p style={{ fontSize: '0.65rem', color: '#8a7e6e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.15rem' }}>{r.label}</p>
                                    <p style={{ fontWeight: 600, color: '#2c2824', fontSize: '0.85rem' }}>{r.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#2c2824', borderRadius: 0, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', display: 'inline-block', boxShadow: '0 0 8px #059669' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#faf8f4' }}>نرد في غضون ساعة</span>
                    </div>
                </div>

                {/* Form */}
                <div style={{ background: 'transparent', borderRadius: 0, border: '1px solid #e5e0d8', padding: '2rem' }}>
                    {sent ? (
                        <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                            <div style={{ width: 64, height: 64, background: 'rgba(5,150,105,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                                <CheckCircle2 size={32} style={{ color: '#059669' }} strokeWidth={1} />
                            </div>
                            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.35rem', fontWeight: 500, color: '#2c2824', marginBottom: '0.5rem' }}>تم الإرسال!</h2>
                            <p style={{ color: '#6b5b4a', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.875rem' }}>سنرد عليك في أقرب وقت ممكن.</p>
                            <button onClick={() => setSent(false)} style={{ padding: '0.625rem 1.5rem', borderRadius: 0, border: '1px solid #2c2824', background: 'transparent', color: '#4a3f35', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.4s ease' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2c2824'; (e.currentTarget as HTMLButtonElement).style.color = '#faf8f4'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#4a3f35'; }}>إرسال رسالة أخرى</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: '#5c5c5c', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>الاسم</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="اسمك الكامل" style={S.input} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: '#5c5c5c', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>الهاتف</label>
                                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="05XXXXXXXX" style={S.input} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '0.875rem' }}>
                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: '#5c5c5c', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>البريد الإلكتروني</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" style={S.input} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: '#5c5c5c', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>رسالتك</label>
                                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} placeholder="كيف يمكننا مساعدتك؟" style={{ ...S.input, resize: 'none' }} />
                            </div>
                            <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}
                                onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = '#4a3f35')}
                                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#2c2824')}>
                                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> جاري الإرسال...</> : <>إرسال الرسالة <ArrowLeft size={15} /></>}
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
