'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
    Star, ChevronDown, AlertCircle, X, ToggleRight,
    ArrowLeft, Plus, Minus, CheckCircle2, Lock, Shield,
    Package, ShieldCheck, Phone, User, Search, ShoppingBag,
    Trash2, Loader2, ChevronLeft, ChevronRight, Heart,
    ShoppingCart, Leaf, Sparkles, Droplets, Home as HomeIcon, Building2,
    
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   عبير الطبيعة — Natural Perfume Boutique
   ─────────────────────────────────────────────────────────────
   Sage Green #6B8F6B · White #FFFFFF · Cream #F5F2EB
   Fonts: Cairo (Arabic native) + Inter
   
   SIGNATURE ELEMENTS:
   ✦ Sage green outer background framing white content card
   ✦ Category circles with custom SVG fragrance icons
   ✦ "أضف إلى السلة" button directly on product cards  
   ✦ Rounded soft cards with shadow
   ✦ صنع في الجزائر footer badge
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0; }
  html { scroll-behavior:smooth; }

  :root {
    --sage:      #6B8F6B;
    --sage-2:    #5A7D5A;
    --sage-3:    #7EA07E;
    --sage-lt:   #E8F0E8;
    --sage-xlt:  rgba(107,143,107,0.12);
    --white:     #FFFFFF;
    --ivory:     #FAF9F6;
    --cream:     #F5F2EB;
    --cream-2:   #EDE8DF;
    --char:      #2D3A2D;
    --char-2:    #3D4E3D;
    --mid:       #5A6E5A;
    --mist:      #8FA08F;
    --line:      rgba(107,143,107,0.2);
    --line-2:    rgba(107,143,107,0.35);
    --red:       #9B2335;
  }

  body {
    background:var(--sage);
    color:var(--char);
    font-family:'Cairo',sans-serif;
    min-height:100vh;
    zoom: 1.2;
  }
  a { text-decoration:none; color:inherit; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:var(--sage); }
  ::-webkit-scrollbar-thumb { background:var(--white); border-radius:2px; opacity:0.5; }

  /* Main content card — white on green */
  .main-card {
    background:var(--white);
    margin:0 auto;
    box-shadow:0 8px 48px rgba(45,58,45,0.18);
    min-height:100vh;
    position:relative;
  }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin     { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes pulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }

  .fu  { animation:fadeUp 0.6s ease both; }
  .fu1 { animation-delay:0.1s; }
  .fu2 { animation-delay:0.2s; }
  .fu3 { animation-delay:0.3s; }
  .anim-check { animation:check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* SCROLL REVEAL */
  .sr { opacity:0; transform:translateY(18px); transition:opacity 0.6s ease,transform 0.6s ease; }
  .sr.vis { opacity:1; transform:translateY(0); }

  /* BUTTONS */
  .btn-sage {
    display:inline-flex; align-items:center; justify-content:center; gap:6px;
    background:var(--sage); color:var(--white);
    font-family:'Cairo',sans-serif; font-size:13px; font-weight:600;
    border-radius:6px; padding:10px 20px; border:none; cursor:pointer;
    transition:background 0.25s, transform 0.25s;
  }
  .btn-sage:hover { background:var(--sage-2); transform:translateY(-1px); }
  .btn-sage:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

  .btn-sage-outline {
    display:inline-flex; align-items:center; justify-content:center; gap:6px;
    background:transparent; color:var(--sage); border:1.5px solid var(--sage);
    font-family:'Cairo',sans-serif; font-size:13px; font-weight:600;
    border-radius:6px; padding:9px 18px; cursor:pointer;
    transition:all 0.25s;
  }
  .btn-sage-outline:hover { background:var(--sage); color:var(--white); }

  /* INPUTS */
  .inp {
    width:100%; padding:11px 14px;
    background:var(--ivory); border:1.5px solid var(--line-2);
    border-radius:8px;
    font-family:'Cairo',sans-serif; font-size:13px; color:var(--char);
    outline:none; transition:border-color 0.2s;
  }
  .inp:focus { border-color:var(--sage); }
  .inp::placeholder { color:var(--mist); }
  select.inp { appearance:none; cursor:pointer; }

  /* PRODUCT CARD */
  .p-card {
    background:var(--white); border-radius:12px;
    border:1px solid var(--line);
    overflow:hidden; cursor:pointer;
    transition:transform 0.3s ease, box-shadow 0.3s ease;
  }
  .p-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(107,143,107,0.15); }
  .p-card:hover .c-img img { transform:scale(1.04); }
  .c-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease; }

  /* CATEGORY CIRCLE */
  .cat-circle {
    display:flex; flex-direction:column; align-items:center; gap:10px;
    cursor:pointer; transition:transform 0.25s;
  }
  .cat-circle:hover { transform:translateY(-3px); }
  .cat-circle:hover .cat-icon { background:var(--sage); border-color:var(--sage); }
  .cat-circle:hover .cat-icon svg { color:var(--white); }
  .cat-icon {
    width:72px; height:72px; border-radius:50%;
    background:var(--sage-lt); border:1.5px solid var(--line-2);
    display:flex; align-items:center; justify-content:center;
    transition:all 0.3s;
  }
  .cat-icon.active { background:var(--sage); border-color:var(--sage); }
  .cat-icon.active svg { color:var(--white)!important; }

  /* GRIDS */
  .prod-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .cat-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .footer-g   { display:grid; grid-template-columns:1fr 1fr 1fr; gap:32px; }
  .details-g  { display:grid; grid-template-columns:1fr 1fr; gap:0; }
  .form-2c    { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c     { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cart-g     { display:grid; grid-template-columns:1.2fr 1fr; gap:20px; align-items:start; }
  .pagination { display:flex; justify-content:center; gap:6px; margin-top:40px; flex-wrap:wrap; }
  .cart-btns  { display:flex; gap:8px; }

  @media (max-width:700px) {
    .main-card { margin:0; box-shadow:none; }
    .prod-grid { grid-template-columns:1fr; gap:10px; }
    .cat-grid  { grid-template-columns:repeat(4,1fr); gap:8px; }
    .footer-g  { grid-template-columns:1fr; gap:20px; }
    .cart-g    { grid-template-columns:1fr; }
    .details-g { grid-template-columns:1fr; }
    .cart-btns { flex-direction:column; }
    .form-2c   { grid-template-columns:1fr; }
    .dlv-2c    { grid-template-columns:1fr; }
  }
  @media (max-width:480px) {
    .cat-grid  { grid-template-columns:repeat(4,1fr); }
    .cat-icon  { width:56px; height:56px; }
  }
`;

/* ─── FRAGRANCE CATEGORY ICONS ─── */
const IconFloral = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--sage)' }}><circle cx="12" cy="12" r="3" /><path d="M12 2a4 4 0 0 1 0 8" /><path d="M12 2a4 4 0 0 0 0 8" /><path d="M12 14a4 4 0 0 1 0 8" /><path d="M12 14a4 4 0 0 0 0 8" /><path d="M2 12a4 4 0 0 1 8 0" /><path d="M2 12a4 4 0 0 0 8 0" /><path d="M14 12a4 4 0 0 1 8 0" /><path d="M14 12a4 4 0 0 0 8 0" /></svg>;
const IconWood = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--sage)' }}><path d="M17 8C8 10 5.9 16.17 3.82 22" /><path d="M9.5 9.5c.5 3.5 5 5.5 6.5 8.5" /><path d="M3 9c4-2 7-2.5 10-1.5" /></svg>;
const IconCitrus = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--sage)' }}><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /></svg>;
const IconSpray = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--sage)' }}><path d="M3 9h14v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" /><path d="M17 9V6h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-2z" /><path d="M10 9V5" /><path d="M10 5a2 2 0 0 0-2-2" /><path d="M21 4l-2 2" /><path d="M19 4l2 2" /></svg>;
const IconOud = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--sage)' }}><path d="M12 22V8" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" /><path d="M8 5.3C8 4 9.8 3 12 3s4 1 4 2.3c0 2.1-2 3.7-4 5.7-2-2-4-3.6-4-5.7Z" /></svg>;

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

const INP = (err?: boolean): React.CSSProperties => ({
    width: '100%', padding: '11px 14px', background: 'var(--ivory)',
    border: `1.5px solid ${err ? 'var(--red)' : 'var(--line-2)'}`,
    borderRadius: '8px',
    fontFamily: "'Cairo',sans-serif", fontSize: '13px', color: 'var(--char)',
    outline: 'none', transition: 'border-color 0.2s', appearance: 'none',
});

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '12px' }}>
        {label && <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mid)', marginBottom: '6px' }}>{label}</p>}
        {children}
        {error && <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle style={{ width: '11px', height: '11px' }} />{error}
        </p>}
    </div>
);

function useScrollReveal() {
    useEffect(() => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.sr').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);
}

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
    return (
        <div style={{ minHeight: '100vh', padding: '0', fontFamily: "'Cairo',sans-serif" }}>
            <style>{CSS}</style>
            <div className="main-card">
                <Navbar store={store} domain={domain} />
                <main>{children}</main>
                <Footer store={store} />
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════ */

export function Navbar({ store, domain }: { store: any; domain: string }) {
    const [open, setOpen] = useState(false);
    const [sq, setSq] = useState('');
    const [ls, setLs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showS, setShowS] = useState(false);
    const router = useRouter();

    const count = useCartStore(s => s.count);
    const initCount = useCartStore(s => s.initCount);

    useEffect(() => {
        if (typeof window !== 'undefined' && domain) {
            try { initCount(JSON.parse(localStorage.getItem(domain) || '[]').length); } catch { initCount(0); }
        }
    }, [domain, initCount]);

    useEffect(() => {
        if (sq.length < 2) { setLs([]); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: sq } });
                setLs(data.products || []);
            }
            catch { } finally { setLoading(false); }
        }, 380);
        return () => clearTimeout(t);
    }, [sq, domain]);

    const doSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (sq.trim()) {
            router.push(`/?search=${encodeURIComponent(sq)}`);
            setSq('');
            setShowS(false);
        }
    };

    return (
        <>
        {store?.topBar?.enabled && store?.topBar?.text && (
          <div style={{ background: '#6B8F6B', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
            {store.topBar.text}
          </div>
        )}
        <nav dir="rtl" style={{ background: 'var(--white)', borderBottom: '1px solid var(--line)', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{maxWidth: 1080 , margin: 'auto'}}>
                {/* الشريط العلوي الرئيسي */}
                <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

                    {/* أيقونة البحث وتفعيل الشريط */}
                    <button onClick={() => setShowS(!showS)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--char)', display: 'flex', padding: '8px' }}>
                        {showS ? <X style={{ width: '20px', height: '20px' }} /> : <Search style={{ width: '20px', height: '20px' }} />}
                    </button>

                    {/* روابط التنقل - Desktop */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, justifyContent: 'center' }}>
                        <Link href="/" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sage)', borderBottom: '2px solid var(--sage)', paddingBottom: '4px' }}>الرئيسية</Link>
                        <Link href="/contact" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--char)' }}>تواصل معنا</Link>
                    </div>

                    {/* اللوغو وسلة المشتريات */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png'
                                ? <img src={store.design.logoUrl} alt={store?.name} style={{ height: '35px', width: 'auto' }} />
                                : <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--char)' }}>{store?.name || 'عبير الطبيعة'}</span>
                            }
                        </Link>

                        <Link href="/cart" style={{ position: 'relative', color: 'var(--char)', display: 'flex', padding: '6px' }}>
                            <ShoppingBag style={{ width: '20px', height: '20px' }} />
                            {count > 0 && (
                                <span style={{ position: 'absolute', top: 0, right: 0, width: '17px', height: '17px', background: 'var(--sage)', color: 'var(--white)', fontSize: '10px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    {count}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* شريط البحث المنسدل عند الضغط على الأيقونة */}
                {showS && (
                    <div style={{ padding: '12px 0', borderTop: '1px solid var(--line)', position: 'relative' }}>
                        <form onSubmit={doSearch}>
                            <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                                <Search style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--mist)' }} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="ابحث عن عطر أو منتج..."
                                    value={sq}
                                    onChange={e => setSq(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 40px 10px 15px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--line)',
                                        background: 'var(--sage-lt)',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </form>

                        {/* قائمة النتائج (Drop) - خلفية بيضاء صلبة */}
                        {sq.length >= 2 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                left: 0,
                                background: '#FFFFFF',
                                border: '1px solid var(--line)',
                                borderRadius: '0 0 12px 12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                zIndex: 200,
                                overflow: 'hidden',
                                maxWidth: '600px',
                                margin: '0 auto',
                                paddingTop: 25
                            }}>
                                <button onClick={() => setSq('')} className='fixed top-3 left-3 cursor-pointer hover:text-red-400'>
                                    <X style={{ width: '14px', height: '14px' }} />
                                </button>
                                {loading ? (
                                    <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '13px', color: 'var(--sage)', fontWeight: 600 }}>جاري البحث...</div>
                                ) : ls.length > 0 ? (
                                    <>
                                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                            {ls.map((p: any) => (
                                                <Link href={`/product/${p.id}`} key={p.id} onClick={() => { setSq(''); setShowS(false); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--line)', transition: 'background 0.2s' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9f9f9'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>

                                                    <div style={{ width: 48, height: 48, flexShrink: 0, overflow: 'hidden', borderRadius: '6px', background: 'var(--cream)', border: '1px solid var(--line)' }}>
                                                        <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                    </div>

                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--char)' }}>{p.name}</div>
                                                        <div style={{ fontSize: '14px', color: 'var(--sage)', fontWeight: 700, marginTop: '2px' }}>{p.price} دج</div>
                                                    </div>
                                                    <ArrowLeft size={14} style={{ color: 'var(--mist)' }} />
                                                </Link>
                                            ))}
                                        </div>

                                        {/* زر عرض كل النتائج */}
                                        <button
                                            onClick={doSearch}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: 'var(--sage)',
                                                color: 'white',
                                                border: 'none',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            عرض جميع النتائج لـ "{sq}"
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '13px', color: 'var(--mist)' }}>لا توجد نتائج مطابقة</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — sage green, 3 sections + صنع في الجزائر
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
    const yr = new Date().getFullYear();
    return (
        <footer dir="rtl" style={{ background: 'var(--sage)', fontFamily: "'Cairo',sans-serif", marginTop: '0' }}>
            <div style={{ padding: '40px 24px 24px' , maxWidth:1080, margin: 'auto' }}>
                <div className="footer-g">
                    {/* قسم 1 — صنع في الجزائر */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png'
                                ? <img src={store.design.logoUrl} alt={store?.name} style={{ height: '28px', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
                                : <span style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{store?.name}</span>
                            }
                        </div>
                        {/* صنع في الجزائر badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 14px' }}>
                            <span style={{ fontSize: '1.6rem' }}>🇩🇿</span>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.2 }}>صنع في</p>
                                <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.2 }}>الجزائر</p>
                            </div>
                        </div>
                        {/* Social icons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['📷', '👥', '🐦', '💼', '🎵'].map((icon, i) => (
                                <a key={i} href="#" style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transition: 'background 0.2s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.35)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}>
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* قسم 2 — روابط */}
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', textTransform: 'uppercase' }}>المنتجات</p>
                        {[{ h: '/', l: 'المنجدية الطبيعة' }, { h: '/Privacy', l: 'Privacy Policy' }, { h: '/contact', l: 'صفحة الجزائرية' }, { h: '/Terms', l: 'تسبة الشباك رباية الهواية' }].map(lnk => (
                            <a key={lnk.h} href={lnk.h} style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px', transition: 'color 0.2s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}>
                                {lnk.l}
                            </a>
                        ))}
                    </div>

                    {/* قسم 3 — تواصل */}
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', textTransform: 'uppercase' }}>تواصل</p>
                        {[
                            { val: store?.contact?.phone },
                            { val: store?.contact?.email },
                            { val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
                        ].filter(r => r.val).map((item, i) => (
                            <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>{item.val}</p>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
                        © Privacy Policy عمور الطوابر الحقوق المحفوظة {yr}
                    </p>
                </div>
            </div>
        </footer>
    );
}

/* ══════════════════════════════════════════════════════════════
   CARD — with "أضف إلى السلة" button
══════════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, domain, userId }: any) {
    const [added, setAdded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const initCount = useCartStore(s => s.initCount);
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;

    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsAdding(true);
        setTimeout(() => {
            const cart = JSON.parse(localStorage.getItem(domain) || '[]');
            const exists = cart.findIndex((i: any) => i.productId === product.id);
            if (exists >= 0) cart[exists].quantity++;
            else cart.push({ productId: product.id, storeId: product.store.id, userId, product, finalPrice: price, quantity: 1, addedAt: Date.now() });
            localStorage.setItem(domain, JSON.stringify(cart));
            initCount(cart.length);
            setIsAdding(false);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        }, 300);
    };

    return (
        <div className="p-card" style={{ display: 'block' }}>
            <div className="c-img" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: 'var(--cream)' }}>
                {displayImage
                    ? <img src={displayImage} alt={product.name} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--sage-lt),var(--cream)' }}>
                        <Droplets style={{ width: '36px', height: '36px', color: 'var(--sage)', opacity: 0.5 }} />
                    </div>
                }
                {discount > 0 && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--sage)', color: 'var(--white)', fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>
                        −{discount}%
                    </div>
                )}
            </div>
            <div style={{ padding: '10px 10px 12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--char)', marginBottom: '3px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                    {product.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--char)' }}>{price.toLocaleString()} د.ج</span>
                    {orig > price && <span style={{ fontSize: '11px', color: 'var(--mist)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
                </div>
                < Link href={`/product/${product.slug || product.id}`}
                    style={{
                        width: '100%', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: "'Cairo',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.3s',
                        background: added ? 'rgba(107,143,107,0.12)' : 'var(--sage)', color: added ? 'var(--sage)' : 'var(--white)',
                        boxShadow: added ? 'none' : '0 2px 8px rgba(107,143,107,0.3)'
                    }}>
                    شاهد
                </Link>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
    useScrollReveal();
    const products: any[] = store.products || [];
    const cats: any[] = store.categories || [];
    if (!page) page = 1;
    const countPage = Math.ceil((store.count || products.length) / 48);
    const [activeCat, setActiveCat] = useState<string | null>(null);

    const [hoveredId, setHoveredId] = useState(null);
    const filtered = useMemo(() => {
        if (!activeCat) return products;
        return products.filter((p: any) => p.categoryId === activeCat);
    }, [products, activeCat]);

    /* Default fragrance categories if none from store */
    const fragranceCats = [
        { id: 'floral', name: 'زهري', icon: <IconFloral /> },
        { id: 'wood', name: 'خشبي', icon: <IconWood /> },
        { id: 'citrus', name: 'حمضي', icon: <IconCitrus /> },
        { id: 'spray', name: 'رذاذ عضوي', icon: <IconSpray /> },
    ];
    const displayCats = cats.length > 0
        ? cats.slice(0, 8).map((c: any, i: number) => ({ ...c, icon: fragranceCats[i % 4].icon }))
        : fragranceCats;

    return (
        <div dir="rtl" style={{ maxWidth: 1080, margin: 'auto' }}>
            {/* ── HERO ── */}
            <section style={{ position: 'relative', background: 'var(--cream)', overflow: 'hidden', minHeight: '260px' }}>
                {store.hero?.imageUrl && (
                    <img src={store.hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
                {!store.hero?.imageUrl && (
                    /* Decorative background if no image */
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,var(--sage-lt) 0%,var(--cream) 50%,#E8F4E8 100%)' }} />
                )}
                {/* Overlay for text readability */}
                {store.hero?.imageUrl && (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left,rgba(45,58,45,0.5) 30%,rgba(45,58,45,0.1) 70%,transparent 100%)' }} />
                )}

                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: '260px', padding: '32px 24px' }}>
                    <div style={{ textAlign: 'right', maxWidth: '280px' }}>
                        <h1 className="fu" style={{ fontSize: 'clamp(1.6rem,5vw,2.4rem)', fontWeight: 700, color: store.hero?.imageUrl ? 'white' : 'var(--char)', lineHeight: 1.2, marginBottom: '10px' }}>
                            {store.hero?.title || 'سحر الطبيعة في\nكل قطرة'}
                        </h1>
                        <p className="fu fu1" style={{ fontSize: '13px', color: store.hero?.imageUrl ? 'rgba(255,255,255,0.85)' : 'var(--mid)', marginBottom: '20px', lineHeight: 1.6 }}>
                            {store.hero?.subtitle || 'عطور عضوية مستوحاة من جمال الزهور'}
                        </p>
                        <a href="#products" className="fu fu2 btn-sage" style={{ padding: '11px 24px', fontSize: '13px', borderRadius: '8px', display: 'inline-flex', boxShadow: '0 4px 12px rgba(107,143,107,0.3)' }}>
                            تسوق الآن
                        </a>
                    </div>
                </div>
            </section>

            {/* ── CATEGORY CIRCLES — "الفئات" ── */}
            <section style={{ padding: '32px 20px', background: 'var(--white)' }}>
                <h2 className="sr" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--char)', textAlign: 'center', marginBottom: '24px' }}>الفئات</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, justifyItems: 'center' }}>
                    {displayCats.map((cat, i) => (
                        <button
                            key={cat.id || i}
                            onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
                            onMouseEnter={() => setHoveredId(cat.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{ background: 'none', border: 'none' }}
                        >
                            <span style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                // تغيير لون النص والخلفية بناءً على حالة التحديد
                                color: hoveredId === cat.id ? 'var(--white)' : 'var(--char)',
                                backgroundColor: hoveredId === cat.id ? 'var(--sage)' : 'transparent',
                                textAlign: 'center',
                                lineHeight: 1.3,
                                border: "1px solid var(--sage)",
                                padding: '8px 20px',
                                borderRadius: '20px', // لجعلها دائرية الحواف (Pill shape)
                                transition: 'all 0.3s ease', // حركة ناعمة عند الضغط
                                display: 'inline-block'
                            }}>
                                {cat.name}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── PRODUCTS — "أمستجات" ── */}
            <section id="products" style={{ padding: '8px 16px 32px', background: 'var(--white)' }}>
                <h2 className="sr" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--char)', textAlign: 'center', marginBottom: '20px' }}>أمستجات</h2>

                {filtered.length === 0 ? (
                    <div style={{ padding: '60px 0', textAlign: 'center' }}>
                        <Droplets style={{ width: '48px', height: '48px', color: 'var(--sage)', opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                        <p style={{ color: 'var(--mist)', fontSize: '14px' }}>لا توجد منتجات بعد</p>
                    </div>
                ) : (
                    <div className="prod-grid">
                        {filtered.map((p: any, i: number) => {
                            const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                            const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                            return (
                                <div key={p.id} className="sr" style={{ transitionDelay: `${(i % 4) * 0.06}s` }}>
                                    <Card product={p} displayImage={img} discount={disc} domain={store?.subdomain || ''} userId={p.store?.userId} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {countPage > 1 && (
                    <div className="pagination" dir="rtl">
                        <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
                            style={{ width: 36, height: 36, borderRadius: '8px', border: '1.5px solid var(--line-2)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sage)', opacity: page <= 1 ? 0.3 : 1 }}>‹</Link>
                        {Array.from({ length: countPage }).map((_, i) => {
                            const pn = i + 1; const isA = Number(page) === pn;
                            return (
                                <Link key={pn} href={{ query: { page: pn } }} scroll={false}
                                    style={{ width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: isA ? 700 : 400, border: `1.5px solid ${isA ? 'var(--sage)' : 'var(--line-2)'}`, background: isA ? 'var(--sage)' : 'var(--white)', color: isA ? 'var(--white)' : 'var(--mid)' }}>
                                    {pn}
                                </Link>
                            );
                        })}
                        <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
                            style={{ width: 36, height: 36, borderRadius: '8px', border: '1.5px solid var(--line-2)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sage)', opacity: page >= countPage ? 0.3 : 1 }}>›</Link>
                    </div>
                )}
            </section>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   DETAILS
══════════════════════════════════════════════════════════════ */
export function Details({ product, toggleWishlist, isWishlisted, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
    const [sel, setSel] = useState(0);
    if (!product) return null;
    return (
        <div dir="rtl" style={{ maxWidth: 1080, margin: "auto", background: 'var(--white)', fontFamily: "'Cairo',sans-serif" }}>

            <div style={{ padding: '20px' }}>
                <div className="details-g" style={{ gap: '24px' }}>
                    {/* Gallery */}
                    <div>
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: 'var(--cream)', aspectRatio: '1/1' }}>
                            {allImages.length > 0
                                ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--sage-lt),var(--cream)' }}>
                                    <Droplets style={{ width: '56px', height: '56px', color: 'var(--sage)', opacity: 0.4 }} />
                                </div>
                            }
                            {discount > 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--sage)', color: 'var(--white)', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}>−{discount}%</div>}
                            <button onClick={toggleWishlist} style={{ position: 'absolute', top: 12, left: 12, width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isWishlisted ? 'var(--sage)' : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', color: isWishlisted ? 'var(--white)' : 'var(--sage)', transition: 'all 0.3s' }}>
                                <Heart style={{ width: '15px', height: '15px', fill: isWishlisted ? 'currentColor' : 'none' }} />
                            </button>
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--char)' }} />
                                    </button>
                                    <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ChevronLeft style={{ width: '14px', height: '14px', color: 'var(--char)' }} />
                                    </button>
                                </>
                            )}
                            {!inStock && !autoGen && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', borderRadius: '12px' }}>

                                </div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                {allImages.slice(0, 4).map((img: string, idx: number) => (
                                    <button key={idx} onClick={() => setSel(idx)} style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--sage)' : 'transparent'}`, cursor: 'pointer', padding: 0, background: 'none', opacity: sel === idx ? 1 : 0.55, transition: 'all 0.25s' }}>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 700, color: 'var(--char)', marginBottom: '8px', lineHeight: 1.3 }}>
                            {product.name}
                        </h1>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
                            {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '14px', height: '14px', fill: i < 4 ? 'var(--sage)' : 'none', color: 'var(--sage)' }} />)}
                        </div>

                        {/* Price */}
                        <div style={{ background: 'var(--sage-lt)', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px', display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--char)' }}>{finalPrice.toLocaleString()}</span>
                            <span style={{ fontSize: '13px', color: 'var(--mid)', fontWeight: 500 }}>د.ج</span>
                            {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                                <span style={{ fontSize: '12px', color: 'var(--mist)', textDecoration: 'line-through' }}>{parseFloat(product.priceOriginal).toLocaleString()} د.ج</span>
                            )}
                        </div>

                        {/* Offers */}
                        {product.offers?.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mid)', marginBottom: '8px' }}>الباقات المتاحة</p>
                                {product.offers.map((o: any) => (
                                    <label key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', border: `1.5px solid ${selectedOffer === o.id ? 'var(--sage)' : 'var(--line-2)'}`, borderRadius: '8px', cursor: 'pointer', marginBottom: 6, background: selectedOffer === o.id ? 'var(--sage-lt)' : 'transparent', transition: 'all 0.25s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${selectedOffer === o.id ? 'var(--sage)' : 'var(--mist)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {selectedOffer === o.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)' }} />}
                                            </div>
                                            <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--char)' }}>{o.name}</span>
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sage)' }}>{o.price.toLocaleString()} د.ج</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Attributes */}
                        {allAttrs.map((attr: any) => (
                            <div key={attr.id} style={{ marginBottom: '14px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mid)', marginBottom: '8px' }}>{attr.name}</p>
                                {attr.displayMode === 'color' ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: v.value, border: 'none', cursor: 'pointer', outline: `2.5px solid ${s ? 'var(--sage)' : 'transparent'}`, outlineOffset: 2, transition: 'outline 0.2s' }} />; })}
                                    </div>
                                ) : attr.displayMode === 'image' ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: 52, height: 64, overflow: 'hidden', border: `2px solid ${s ? 'var(--sage)' : 'var(--line-2)'}`, borderRadius: '8px', cursor: 'pointer', padding: 0, opacity: s ? 1 : 0.55, transition: 'all 0.25s' }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>; })}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '7px 14px', borderRadius: '6px', border: `1.5px solid ${s ? 'var(--sage)' : 'var(--line-2)'}`, background: s ? 'var(--sage)' : 'transparent', color: s ? 'var(--white)' : 'var(--mid)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Cairo',sans-serif" }}>{v.name}</button>; })}
                                    </div>
                                )}
                            </div>
                        ))}

                        <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

                        {product.desc && (
                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mid)', marginBottom: '10px' }}>وصف المنتج</p>
                                <div style={{ fontSize: '13px', lineHeight: '1.9', color: 'var(--mid)', fontWeight: 400 }}
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
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
            const m = product.variantDetails.find((v: any) => vm(v, selectedVariants)); if (m && m.price !== -1) return m.price;
        }
        return base;
    }, [product, selectedOffer, selectedVariants]);
    const getLiv = useCallback((): number => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
    const fp = getFP();
    const total = () => fp * fd.quantity + +getLiv();
    const validate = () => {
        const e: Record<string, string> = {};
        if (!fd.customerName.trim() || fd.customerName.length < 3) e.customerName = 'الاسم مطلوب';
        if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = 'رقم هاتف غير صالح (مثال: 0550123456)';
        if (!fd.customerWelaya) e.customerWelaya = 'اختر الولاية';
        if (!fd.customerCommune) e.customerCommune = 'اختر البلدية';
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
        localStorage.setItem(domain, JSON.stringify(cart)); initCount(cart.length);
        setTimeout(() => setIsAdded(false), 2200);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); const er = validate(); if (Object.keys(er).length) { setErrors(er); return; }
        setErrors({}); setSub(true);
        try {
            await axios.post(`${API_URL}/orders/create`, { ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
            if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
            router.push(`/${domain}/successfully`);
        } catch { } finally { setSub(false); }
    };

    const onF = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = 'var(--sage)'; };
    const onB = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, err?: boolean) => { e.target.style.borderColor = err ? 'var(--red)' : 'var(--line-2)'; };

    return (
        <div dir="rtl" style={{ marginTop: '16px' }}>
            {/* Cart/Order toggle */}
        {product.store?.cart && (
                <div className="cart-btns" style={{ marginBottom: '12px' }}>
                    <button onClick={addToCart} disabled={isAdded}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', cursor: isAdded ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600, border: `1.5px solid ${isAdded ? 'var(--sage)' : 'var(--line-2)'}`, borderRadius: '8px', background: isAdded ? 'var(--sage-lt)' : 'var(--white)', color: isAdded ? 'var(--sage)' : 'var(--mid)', transition: 'all 0.3s', fontFamily: "'Cairo',sans-serif" }}>
                        {isAdded ? <><CheckCircle2 size={14} className="anim-check" />أُضيف</> : <><ShoppingBag size={14} />السلة</>}
                    </button>
                    <button onClick={() => setIsOrderNow(true)} className="btn-sage" style={{ flex: 2, padding: '11px', fontSize: '13px', borderRadius: '8px' }}>
                        اطلب الآن
                    </button>
                </div>
            )}

            {(isOrderNow || !product.store?.cart) && (
                <div style={{ background: 'var(--ivory)', border: '1.5px solid var(--line-2)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', background: 'var(--sage-lt)', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sage)', margin: 0 }}>بيانات الطلب</p>
                        {product.store?.cart && (
                            <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--line-2)', borderRadius: '6px', background: 'var(--white)', color: 'var(--mist)', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
                                <X style={{ width: '9px', height: '9px' }} /> إلغاء
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
                        <div className="form-2c">
                            <FR error={errors.customerName} label="الاسم">
                                <div style={{ position: 'relative' }}>
                                    <User style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--mist)', pointerEvents: 'none' }} />
                                    <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="اسمك الكامل"
                                        style={{ ...INP(!!errors.customerName), paddingLeft: '32px' }} onFocus={onF} onBlur={e => onB(e, !!errors.customerName)} />
                                </div>
                            </FR>
                            <FR error={errors.customerPhone} label="الهاتف">
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--mist)', pointerEvents: 'none' }}>📞</span>
                                    <input type="tel" dir="ltr" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0550 123 456"
                                        style={{ ...INP(!!errors.customerPhone), paddingLeft: '32px' }} onFocus={onF} onBlur={e => onB(e, !!errors.customerPhone)} />
                                </div>
                            </FR>
                        </div>
                        <div className="form-2c">
                            <FR error={errors.customerWelaya} label="الولاية">
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--mist)', pointerEvents: 'none' }} />
                                    <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}
                                        style={{ ...INP(!!errors.customerWelaya), paddingLeft: '28px' }} onFocus={onF} onBlur={e => onB(e, !!errors.customerWelaya)}>
                                        <option value="">اختر الولاية</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                            <FR error={errors.customerCommune} label="البلدية">
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--mist)', pointerEvents: 'none' }} />
                                    <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })}
                                        style={{ ...INP(!!errors.customerCommune), paddingLeft: '28px', opacity: !fd.customerWelaya ? 0.4 : 1 }} onFocus={onF} onBlur={e => onB(e, !!errors.customerCommune)}>
                                        <option value="">{loadingC ? '...' : fd.customerWelaya ? 'اختر البلدية' : 'اختر الولاية أولاً'}</option>
                                        {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                        </div>

                        <FR label="نوع التوصيل">
                            <div className="dlv-2c">
                                {(['home', 'office'] as const).map(type => (
                                    <button key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))}
                                        style={{ padding: '11px 8px', borderRadius: '8px', border: `1.5px solid ${fd.typeLivraison === type ? 'var(--sage)' : 'var(--line-2)'}`, background: fd.typeLivraison === type ? 'var(--sage-lt)' : 'var(--white)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s', fontFamily: "'Cairo',sans-serif" }}>
                                        <p style={{ fontSize: '12px', fontWeight: 600, color: fd.typeLivraison === type ? 'var(--sage)' : 'var(--mid)', margin: '0 0 3px' }}>{type === 'home' ? '🏠 منزل' : '🏢 مكتب'}</p>
                                        {selW && <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--char)', margin: 0 }}>
                                            {(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج
                                        </p>}
                                    </button>
                                ))}
                            </div>
                        </FR>

                        <FR label="الكمية">
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line-2)', borderRadius: '8px', overflow: 'hidden' }}>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--mid)', fontSize: '18px', fontWeight: 300, transition: 'background 0.2s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sage-lt)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>−</button>
                                <span style={{ width: 44, textAlign: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--char)' }}>{fd.quantity}</span>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--mid)', fontSize: '18px', fontWeight: 300, transition: 'background 0.2s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sage-lt)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>+</button>
                            </div>
                        </FR>

                        {/* Summary */}
                        <div style={{ background: 'var(--sage-lt)', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                            {[{ l: 'المنتج', v: product.name.slice(0, 20) + (product.name.length > 20 ? '...' : '') }, { l: 'السعر', v: `${fp.toLocaleString()} دج` }, { l: 'الكمية', v: `× ${fd.quantity}` }, { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' }].map(row => (
                                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px', borderBottom: '1px solid var(--line)' }}>
                                    <span style={{ color: 'var(--mid)' }}>{row.l}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--char)' }}>{row.v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mid)' }}>الإجمالي</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--char)' }}>{total().toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500 }}>دج</span></span>
                            </div>
                        </div>

                        <button type="submit" disabled={sub} className="btn-sage" style={{ width: '100%', padding: '13px', fontSize: '14px', borderRadius: '8px', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.55 : 1, boxShadow: '0 4px 14px rgba(107,143,107,0.3)' }}>
                            {sub ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> جاري...</> : <><ShoppingCart style={{ width: '15px', height: '15px' }} />تأكيد الطلب</>}
                        </button>
                        <p style={{ fontSize: '11px', textAlign: 'center', color: 'var(--mist)', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <Shield style={{ width: '11px', height: '11px', color: 'var(--sage)' }} /> معاملة آمنة ومشفرة
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
    const changeQty = (i: number, d: number) => { const n = [...items]; n[i].quantity = Math.max(1, n[i].quantity + d); update(n); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const er: Record<string, string> = {};
        if (!fd.customerName.trim() || fd.customerName.length < 3) er.n = 'الاسم مطلوب';
        if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.p = 'رقم هاتف غير صالح (مثال: 0550123456)';
        if (!fd.customerWelaya) er.w = 'الولاية مطلوبة';
        if (!fd.customerCommune) er.c = 'البلدية مطلوبة';
        if (Object.keys(er).length) { setErrors(er); return; }
        setErrors({}); setSubmitting(true);
        try {
            await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
            setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
        } catch { } finally { setSubmitting(false); }
    };

    const onF = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = 'var(--sage)'; };
    const onB = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, err?: boolean) => { e.target.style.borderColor = err ? 'var(--red)' : 'var(--line-2)'; };

    if (success) return (
        <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--white)', fontFamily: "'Cairo',sans-serif" }}>
            <div style={{ textAlign: 'center', padding: '3rem 2rem', border: '1px solid var(--line)', borderRadius: '16px', maxWidth: 400, width: '100%', background: 'var(--ivory)' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--sage-lt)', border: '2px solid var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle2 size={28} style={{ color: 'var(--sage)' }} />
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--char)', marginBottom: 8 }}>تم استلام طلبك 🌿</h2>
                <p style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: 24, lineHeight: 1.7 }}>شكراً لاختيارك عبير الطبيعة. سنتواصل معك قريباً.</p>
                <Link href="/" className="btn-sage" style={{ display: 'inline-flex', padding: '12px 32px', fontSize: '13px', borderRadius: '8px' }}>العودة للمتجر</Link>
            </div>
        </div>
    );

    if (!items.length) return (
        <div dir="rtl" style={{ minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--white)', fontFamily: "'Cairo',sans-serif" }}>
            <div style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: 320, width: '100%' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--sage-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ShoppingBag size={32} style={{ color: 'var(--sage)', opacity: 0.6 }} />
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mid)', marginBottom: 8 }}>السلة فارغة</p>
                <p style={{ fontSize: '12px', color: 'var(--mist)', marginBottom: 20 }}>أضف عطورك المفضلة</p>
                <Link href="/" className="btn-sage" style={{ display: 'inline-flex', padding: '11px 28px', fontSize: '13px', borderRadius: '8px' }}>تسوق الآن</Link>
            </div>
        </div>
    );

    return (
        <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--ivory)', padding: '20px 16px 60px', fontFamily: "'Cairo',sans-serif" }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--char)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingBag size={20} style={{ color: 'var(--sage)' }} /> سلة التسوق
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--mist)', marginRight: 'auto' }}>{items.length} منتجات</span>
                </h1>

                <div className="cart-g">
                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px', borderRadius: '12px', background: 'var(--white)', border: '1px solid var(--line)', transition: 'box-shadow 0.25s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(107,143,107,0.1)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                                <div style={{ width: 72, height: 90, flexShrink: 0, overflow: 'hidden', borderRadius: '8px', background: 'var(--cream)' }}>
                                    <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 600, color: 'var(--char)', fontSize: '13px', lineHeight: 1.3, marginBottom: 3 }}>{item.product?.name}</h4>
                                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sage)' }}>{item.finalPrice?.toLocaleString()} دج</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line-2)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <button onClick={() => changeQty(i, -1)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--mid)', fontSize: '16px' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sage-lt)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>-</button>
                                            <span style={{ width: 30, textAlign: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--char)' }}>{item.quantity}</span>
                                            <button onClick={() => changeQty(i, 1)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--mid)', fontSize: '16px' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sage-lt)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>+</button>
                                        </div>
                                        <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: 'none', background: 'transparent', color: 'var(--mist)', fontSize: '11px', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", transition: 'color 0.2s' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mist)'; }}>
                                            <Trash2 size={12} /> حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: 'var(--sage-lt)' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mid)' }}>المجموع الفرعي</span>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--char)' }}>{cartTotal.toLocaleString()} دج</span>
                        </div>
                    </div>

                    {/* Checkout */}
                    <div style={{ background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', background: 'var(--sage-lt)', borderBottom: '1px solid var(--line)' }}>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sage)', margin: 0 }}>إتمام الطلب</p>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
                            <div className="form-2c">
                                <FR error={errors.n} label="الاسم">
                                    <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={INP(!!errors.n)} onFocus={onF} onBlur={e => onB(e, !!errors.n)} />
                                </FR>
                                <FR error={errors.p} label="الهاتف">
                                    <input type="tel" dir="ltr" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={INP(!!errors.p)} onFocus={onF} onBlur={e => onB(e, !!errors.p)} />
                                </FR>
                            </div>
                            <div className="form-2c">
                                <FR error={errors.w} label="الولاية">
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--mist)', pointerEvents: 'none' }} />
                                        <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.w), paddingLeft: '28px' }} onFocus={onF} onBlur={e => onB(e, !!errors.w)}>
                                            <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                        </select>
                                    </div>
                                </FR>
                                <FR error={errors.c} label="البلدية">
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--mist)', pointerEvents: 'none' }} />
                                        <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.c), paddingLeft: '28px', opacity: !fd.customerWelaya ? 0.4 : 1 }} onFocus={onF} onBlur={e => onB(e, !!errors.c)}>
                                            <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                        </select>
                                    </div>
                                </FR>
                            </div>
                            {/* Summary */}
                            <div style={{ background: 'var(--sage-lt)', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
                                {[{ l: 'المجموع الفرعي', v: `${cartTotal.toLocaleString()} دج` }, { l: 'التوصيل', v: getLiv() ? `${getLiv().toLocaleString()} دج` : '—' }].map(r => (
                                    <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', borderBottom: '1px solid rgba(107,143,107,0.1)' }}>
                                        <span style={{ color: 'var(--mid)' }}>{r.l}</span>
                                        <span style={{ fontWeight: 600, color: 'var(--char)' }}>{r.v}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mid)' }}>الإجمالي</span>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--char)' }}>{finalTotal.toLocaleString()} دج</span>
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} className="btn-sage" style={{ width: '100%', padding: '13px', fontSize: '14px', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.55 : 1, boxShadow: '0 4px 14px rgba(107,143,107,0.3)' }}>
                                {submitting ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} />جاري...</> : <><ShoppingCart style={{ width: '15px', height: '15px' }} />تأكيد الطلب</>}
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

const Shell = ({ children, title, emoji }: { children: React.ReactNode; title: string; emoji?: string }) => (
    <div dir="rtl" style={{ background: 'var(--white)', minHeight: '100vh', fontFamily: "'Cairo',sans-serif" }}>
        <div style={{ background: 'var(--sage-lt)', borderBottom: '1px solid var(--line)', padding: '28px 20px' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--char)', display: 'flex', alignItems: 'center', gap: 10 }}>
                {emoji && <span style={{ fontSize: '1.5rem' }}>{emoji}</span>}
                {title}
            </h1>
        </div>
        <div style={{ padding: '24px 20px 60px' }}>{children}</div>
    </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
    <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--ivory)', border: '1px solid var(--line)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--char)', marginBottom: '5px' }}>{title}</h3>
            <p style={{ fontSize: '12px', lineHeight: '1.75', color: 'var(--mid)', margin: 0 }}>{body}</p>
        </div>
        {tag && <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: 'var(--sage-lt)', color: 'var(--sage)', flexShrink: 0, marginTop: 2, alignSelf: 'flex-start' }}>{tag}</span>}
    </div>
);

export function Privacy() {
    return (
        <Shell title="سياسة الخصوصية" emoji="🔒">
            <IB title="البيانات التي نجمعها" body="اسمك ورقم هاتفك وعنوان التوصيل فقط — لا نجمع أكثر مما نحتاج." />
            <IB title="كيف نستخدم بياناتك" body="حصرياً لتنفيذ وتوصيل طلبك. لا استخدام تجاري." />
            <IB title="الأمان والتشفير" body="جميع بياناتك محمية بتشفير SSL." />
            <IB title="مشاركة البيانات" body="لا نبيع بياناتك. تُشارك فقط مع شريك التوصيل." tag="مضمون" />
        </Shell>
    );
}

export function Terms() {
    return (
        <Shell title="شروط الخدمة" emoji="📋">
            <IB title="الطلبات" body="لا رسوم خفية. السعر المعروض هو السعر النهائي." />
            <IB title="جودة المنتجات" body="جميع عطورنا طبيعية 100% ومضمونة الجودة." tag="مضمون" />
            <IB title="الإرجاع" body="الإرجاع مقبول خلال 7 أيام في حالة العيب." />
            <IB title="القانون" body="تخضع الشروط لقوانين الجمهورية الجزائرية." />
        </Shell>
    );
}

export function Cookies() {
    return (
        <Shell title="ملفات الارتباط" emoji="🍪">
            <IB title="كوكيز أساسية" body="ضرورية لتشغيل المتجر والسلة." tag="مطلوب" />
            <IB title="كوكيز التفضيلات" body="تحفظ إعداداتك لتجربة أفضل." tag="اختياري" />
            <IB title="التحكم" body="يمكنك إدارة الكوكيز من إعدادات متصفحك." />
        </Shell>
    );
}

export function Contact({ store }: { store?: any }) {
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id }); setSent(true); }
        catch { showError('حدث خطأ'); } finally { setLoading(false); }
    };
    const onF = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'var(--sage)'; };
    const onB = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'var(--line-2)'; };

    return (
        <div dir="rtl" style={{ background: 'var(--white)', minHeight: '100vh', fontFamily: "'Cairo',sans-serif", padding: '24px 20px 60px' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--char)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>💬</span> تواصل معنا
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--mist)', marginBottom: '24px' }}>نرد خلال 24 ساعة</p>

            {/* Contact info */}
            {[
                { icon: '📞', label: 'الهاتف', val: store?.contact?.phone },
                { icon: '✉️', label: 'البريد', val: store?.contact?.email },
                { icon: '📍', label: 'الموقع', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderRadius: '10px', background: 'var(--sage-lt)', border: '1px solid var(--line)', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                    <div>
                        <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--char)', margin: 0 }}>{item.val}</p>
                    </div>
                </div>
            ))}

            <div style={{ marginTop: '24px', background: 'var(--ivory)', borderRadius: '12px', border: '1px solid var(--line)', padding: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--char)', marginBottom: '16px' }}>أرسل رسالة</p>
                {sent ? (
                    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>✅</span>
                        <p style={{ fontWeight: 700, color: 'var(--char)', marginBottom: '4px' }}>تم الإرسال</p>
                        <p style={{ fontSize: '12px', color: 'var(--mist)' }}>سنرد عليك قريباً</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="form-2c">
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mid)', marginBottom: 5 }}>الاسم</p>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={INP()} onFocus={onF} onBlur={onB} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mid)', marginBottom: 5 }}>الهاتف</p>
                                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={INP()} onFocus={onF} onBlur={onB} />
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mid)', marginBottom: 5 }}>البريد الإلكتروني</p>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" style={INP()} onFocus={onF} onBlur={onB} />
                        </div>
                                                <div>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mid)', marginBottom: 5 }}>رسالتك</p>
                            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="كيف يمكننا مساعدتك؟" rows={4} required
                                style={{ ...INP(), resize: 'none' }} onFocus={onF} onBlur={onB} />
                        </div>
                        <button type="submit" disabled={loading} className="btn-sage" style={{ width: '100%', padding: '12px', fontSize: '13px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.55 : 1 }}>
                            {loading ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />جاري...</> : 'إرسال الرسالة 🌿'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}