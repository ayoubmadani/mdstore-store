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
    ShoppingCart, Cpu, Wifi, Battery, Zap, Monitor,
    Headphones, Watch, Smartphone, Laptop, Home as HomeIcon,
    Building2, MapPin, Menu,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { div, image, img } from 'framer-motion/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   SMART TECH & PHONES — Tech Store RTL Theme
   ─────────────────────────────────────────────────────────────
   Teal #0ABDE3 · Dark Navy #1A2332 · White #FFFFFF
   Fonts: Cairo (Arabic native)
   
   SIGNATURE ELEMENTS:
   ✦ Circuit/tech pattern hero background (SVG)
   ✦ Circular category icons (Phone, Watch, Audio, Laptop)
   ✦ Product cards with "أضف إلى السلة" teal button
   ✦ صنع في الجزائر 🇩🇿 footer badge
   ✦ Teal gradient CTAs
   ✦ White cards with cyan border accent
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0; }
  html { scroll-behavior:smooth; }

  :root {
    --teal:    #0ABDE3;
    --teal-2:  #0099BB;
    --teal-3:  #07A7CC;
    --teal-lt: rgba(10,189,227,0.08);
    --teal-md: rgba(10,189,227,0.15);
    --navy:    #1A2332;
    --navy-2:  #243040;
    --navy-3:  #0F1923;
    --white:   #FFFFFF;
    --bg:      #F5FAFE;
    --bg-2:    #EDF7FC;
    --mid:     #4A6070;
    --mist:    #8EA8B8;
    --line:    rgba(10,189,227,0.18);
    --line-2:  rgba(26,35,50,0.1);
    --red:     #E53935;
  }

  body { background:var(--bg); color:var(--navy); font-family:'Cairo',sans-serif; overflow-x:hidden; }
  a    { text-decoration:none; color:inherit; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:var(--bg); }
  ::-webkit-scrollbar-thumb { background:var(--teal); border-radius:2px; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin     { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(10,189,227,0.4)} 100%{box-shadow:0 0 0 12px rgba(10,189,227,0)} }

  .fu  { animation:fadeUp 0.6s ease both; }
  .fu1 { animation-delay:0.1s; }
  .fu2 { animation-delay:0.22s; }
  .fu3 { animation-delay:0.34s; }
  .anim-check { animation:check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* SCROLL REVEAL */
  .sr { opacity:0; transform:translateY(20px); transition:opacity 0.6s ease,transform 0.6s ease; }
  .sr.vis { opacity:1; transform:translateY(0); }

  /* BUTTONS */
  .btn-teal {
    display:inline-flex; align-items:center; justify-content:center; gap:6px;
    background:linear-gradient(135deg,var(--teal) 0%,var(--teal-2) 100%);
    color:var(--white); font-family:'Cairo',sans-serif;
    font-size:13px; font-weight:700; border-radius:8px;
    padding:10px 20px; border:none; cursor:pointer;
    box-shadow:0 4px 14px rgba(10,189,227,0.3);
    transition:all 0.25s;
  }
  .btn-teal:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(10,189,227,0.4); }
  .btn-teal:disabled { opacity:0.55; cursor:not-allowed; transform:none; box-shadow:none; }
  .btn-teal:active { transform:translateY(0); }

  .btn-navy {
    display:inline-flex; align-items:center; justify-content:center; gap:6px;
    background:var(--navy); color:var(--white);
    font-family:'Cairo',sans-serif; font-size:13px; font-weight:700;
    border-radius:8px; padding:10px 22px; border:none; cursor:pointer;
    transition:all 0.25s;
  }
  .btn-navy:hover { background:var(--navy-2); transform:translateY(-1px); }
  .btn-navy:disabled { opacity:0.55; cursor:not-allowed; transform:none; }

  .btn-outline-teal {
    display:inline-flex; align-items:center; justify-content:center; gap:6px;
    background:transparent; color:var(--teal); border:1.5px solid var(--teal);
    font-family:'Cairo',sans-serif; font-size:13px; font-weight:700;
    border-radius:8px; padding:9px 20px; cursor:pointer; transition:all 0.25s;
  }
  .btn-outline-teal:hover { background:var(--teal); color:var(--white); }

  /* INPUTS */
  .inp {
    width:100%; padding:11px 14px;
    background:var(--white); border:1.5px solid var(--line);
    border-radius:10px; font-family:'Cairo',sans-serif;
    font-size:13px; color:var(--navy);
    outline:none; transition:border-color 0.2s, box-shadow 0.2s;
  }
  .inp:focus { border-color:var(--teal); box-shadow:0 0 0 3px rgba(10,189,227,0.12); }
  .inp::placeholder { color:var(--mist); }
  select.inp { appearance:none; cursor:pointer; }

  /* PRODUCT CARD */
  .p-card {
    background:var(--white); border-radius:14px;
    border:1px solid var(--line-2);
    box-shadow:0 2px 12px rgba(26,35,50,0.06);
    overflow:hidden; cursor:pointer; position:relative;
    transition:transform 0.3s ease, box-shadow 0.3s ease;
  }
  .p-card:hover { transform:translateY(-6px); box-shadow:0 12px 32px rgba(10,189,227,0.18); border-color:var(--line); }
  .p-card:hover .c-img img { transform:scale(1.05); }
  .c-img img { display:block; width:100%; height:100%; object-fit:contain; transition:transform 0.5s ease; padding:8px; }

  /* CATEGORY CIRCLES */
  .cat-circle {
    display:flex; flex-direction:column; align-items:center; gap:12px;
    cursor:pointer; transition:transform 0.25s;
  }
  .cat-circle:hover { transform:translateY(-4px); }
  .cat-icon {
    width:80px; height:80px; border-radius:50%;
    background:var(--white); border:2px solid var(--line-2);
    box-shadow:0 4px 16px rgba(26,35,50,0.08);
    display:flex; align-items:center; justify-content:center;
    transition:all 0.3s;
  }
  .cat-circle:hover .cat-icon { border-color:var(--teal); box-shadow:0 6px 20px rgba(10,189,227,0.25); }
  .cat-circle:hover .cat-icon svg { color:var(--teal)!important; }
  .cat-icon.active { border-color:var(--teal); background:var(--teal-lt); animation:pulse-ring 1.5s ease-out; }
  .cat-icon.active svg { color:var(--teal)!important; }

  /* GRIDS */
  .prod-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .cat-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  .footer-g  { display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:32px; }
  .details-g { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
  .form-2c   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c    { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cart-g    { display:grid; grid-template-columns:1.3fr 1fr; gap:20px; align-items:start; }
  .pagination{ display:flex; justify-content:center; gap:6px; margin-top:40px; flex-wrap:wrap; }
  .cart-btns { display:flex; gap:8px; }

  @media (max-width:900px) {
    .prod-grid { grid-template-columns:repeat(3,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:24px; }
  }
  @media (max-width:680px) {
    .prod-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
    .cat-grid  { grid-template-columns:repeat(4,1fr); gap:8px; }
    .cat-icon  { width:60px; height:60px; }
    .footer-g  { grid-template-columns:1fr 1fr; gap:20px; }
    .cart-g    { grid-template-columns:1fr; }
    .details-g { grid-template-columns:1fr; }
    .cart-btns { flex-direction:column; }
    .form-2c   { grid-template-columns:1fr; }
    .dlv-2c    { grid-template-columns:1fr; }
  }
  @media (max-width:400px) {
    .footer-g  { grid-template-columns:1fr; }
  }

  /* Circuit pattern */
  .circuit-bg {
    background-image:
      linear-gradient(rgba(10,189,227,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(10,189,227,0.04) 1px, transparent 1px);
    background-size:40px 40px;
  }
`;

/* ─── TECH CATEGORY ICONS ─── */
const IconPhone = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--navy)' }}><rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="17" r="1" /></svg>;
const IconWatch = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--navy)' }}><circle cx="12" cy="12" r="6" /><path d="M12 10v2l1 1" /><path d="M10 6.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2.5M14 17.5V20a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2.5" /></svg>;
const IconAudio = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--navy)' }}><path d="M3 14h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4c0-4.97 4.03-9 9-9s9 4.03 9 9v4a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3" /></svg>;
const IconLaptop = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--navy)' }}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>;
const IconTablet = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--navy)' }}><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="17" r="1" /></svg>;

const TECH_ICONS = [<IconPhone />, <IconWatch />, <IconAudio />, <IconLaptop />, <IconTablet />];

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
    width: '100%', padding: '11px 14px', background: 'var(--white)',
    border: `1.5px solid ${err ? 'var(--red)' : 'var(--line)'}`,
    borderRadius: '10px', fontFamily: "'Cairo',sans-serif",
    fontSize: '13px', color: 'var(--navy)',
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
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.sr').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);
}

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Cairo',sans-serif" }}>
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
    const [sq, setSq] = useState('');
    const [ls, setLs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showS, setShowS] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();
    const count = useCartStore(s => s.count);
    const initCount = useCartStore(s => s.initCount);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h);
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
    const doSearch = (e?: React.FormEvent) => { if (e) e.preventDefault(); if (sq.trim()) { router.push(`/?search=${encodeURIComponent(sq)}`); setSq(''); setShowS(false); } };

    return (
        <nav dir="rtl" style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: scrolled ? 'rgba(255,255,255,0.97)' : 'var(--white)',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            borderBottom: `1px solid ${scrolled ? 'var(--line-2)' : 'var(--line)'}`,
            boxShadow: scrolled ? '0 2px 16px rgba(26,35,50,0.06)' : 'none',
            transition: 'all 0.3s',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        {store?.design?.logoUrl
                            ? <img src={store.design.logoUrl} alt={store?.name} style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                            : <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Smartphone style={{ width: '18px', height: '18px', color: 'white' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1, margin: 0 }}>{store?.name || 'Smart Tech & Phones'}</p>
                                    <p style={{ fontSize: '9px', fontWeight: 500, color: 'var(--teal)', letterSpacing: '0.05em', margin: 0 }}>سمارت تيك أند فونز</p>
                                </div>
                            </div>
                        }
                    </Link>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <button onClick={() => setShowS(!showS)} style={{ width: 36, height: 36, borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mid)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-lt)'; (e.currentTarget as HTMLElement).style.color = 'var(--teal)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--mid)'; }}>
                            <Search style={{ width: '17px', height: '17px' }} />
                        </button>
                        <Link href="/cart" style={{ position: 'relative', width: 36, height: 36, borderRadius: '8px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mid)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-lt)'; (e.currentTarget as HTMLElement).style.color = 'var(--teal)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--mid)'; }}>
                            <ShoppingCart style={{ width: '17px', height: '17px' }} />
                            {count > 0 && <span style={{ position: 'absolute', top: -2, right: -2, width: '16px', height: '16px', background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', color: 'white', fontSize: '9px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
                        </Link>
                        {/* Mobile menu */}
                        <button onClick={() => setOpen(p => !p)} style={{ width: 36, height: 36, borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--navy)', padding: '6px' }}>
                            <span style={{ display: 'block', width: '16px', height: '1.5px', background: 'currentColor', transition: 'all 0.3s', transform: open ? 'rotate(45deg) translate(4px,4px)' : 'none' }} />
                            <span style={{ display: 'block', width: '16px', height: '1.5px', background: 'currentColor', transition: 'all 0.3s', opacity: open ? 0 : 1 }} />
                            <span style={{ display: 'block', width: '16px', height: '1.5px', background: 'currentColor', transition: 'all 0.3s', transform: open ? 'rotate(-45deg) translate(4px,-4px)' : 'none' }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Search drop */}
            {showS && (
                <div style={{ borderTop: '1px solid var(--line)', background: 'var(--white)', padding: '12px 20px', position: 'relative' }}>
                    <div style={{ maxWidth: '540px', margin: '0 auto', position: 'relative' }}>
                        <form onSubmit={doSearch}>
                            <Search style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--mist)', pointerEvents: 'none' }} />
                            <input autoFocus type="text" placeholder="ابحث عن جهاز..." value={sq} onChange={e => setSq(e.target.value)}
                                style={{ ...INP(), paddingRight: '38px', background: 'var(--bg)' }} />
                        </form>
                        {sq.length >= 2 && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, left: 0, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(10,189,227,0.12)', zIndex: 200, overflow: 'hidden' }}>
                                {loading ? <div style={{ padding: '1rem', textAlign: 'center', fontSize: '13px', color: 'var(--teal)' }}>جاري البحث...</div>
                                    : ls.length > 0 ? ls.map((p: any) => (
                                        <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSq('')}
                                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderBottom: '1px solid var(--line)', transition: 'background 0.2s' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-lt)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                                            <div style={{ width: 44, height: 44, flexShrink: 0, overflow: 'hidden', borderRadius: '8px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '4px' }} alt="" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>{p.name}</div>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--teal)' }}>{p.price} دج</div>
                                            </div>
                                        </Link>
                                    )) : <div style={{ padding: '1rem', textAlign: 'center', fontSize: '13px', color: 'var(--mist)' }}>لا توجد نتائج</div>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile nav */}
            <div style={{ maxHeight: open ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.35s ease', borderTop: open ? '1px solid var(--line)' : 'none', background: 'var(--white)' }}>
                <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل معنا' }, { h: '/Privacy', l: 'الخصوصية' }, { h: '/cart', l: 'السلة' }].map(lnk => (
                        <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)}
                            style={{ fontSize: '14px', fontWeight: 600, padding: '10px 14px', borderRadius: '8px', color: 'var(--mid)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--teal-lt)'; el.style.color = 'var(--teal)'; }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--mid)'; }}>
                            {lnk.l}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — dark navy, 4 columns, صنع في الجزائر badge, socials
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
    const yr = new Date().getFullYear();
    const socials = [
        { icon: 'f', label: 'FB', href: store?.contact?.facebook || '#' },
        { icon: '📷', label: 'IG', href: '#' },
        { icon: 't', label: 'TW', href: '#' },
        { icon: '◉', label: 'TK', href: '#' },
    ];
    return (
        <footer dir="rtl" style={{ background: 'var(--navy)', fontFamily: "'Cairo',sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 20px 28px' }}>
                <div className="footer-g">
                    {/* قسم 1 — Brand + socials */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Smartphone style={{ width: '18px', height: '18px', color: 'white' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.1 }}>{store?.name || 'Smart Tech'}</p>
                                <p style={{ fontSize: '9px', fontWeight: 500, color: 'var(--teal)', margin: 0 }}>سمارت تيك أند فونز</p>
                            </div>
                        </div>
                    </div>

                    {/* قسم 2 — من نحن */}
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                            روابط سريعة
                        </p>

                        {[
                            { h: '/', l: 'الرئيسية', e: '🏠' },
                            { h: '/cart', l: 'سلة التسوق', e: '🛒' },
                            { h: '/contact', l: 'تواصل معنا', e: '📞' },
                            { h: '/Privacy', l: 'الخصوصية', e: '🔒' },
                            { h: '/Terms', l: 'الشروط', e: '📋' }
                        ].map(({ h, l, e }) => (
                            <p
                                key={h} // استخدام المسار كـ key فريد
                                style={{
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.5)',
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px' // مسافة صغيرة بين الإيموجي والنص
                                }}
                                onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.color = 'var(--teal)'; }}
                                onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
                            >
                                <span>{e}</span> {/* طباعة الإيموجي */}
                                <span>{l}</span> {/* طباعة اسم الرابط */}
                            </p>
                        ))}
                    </div>

                    {/* قسم 3 — تواصل معنا */}
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>تواصل معنا</p>
                        {[{ icon: '✉️', val: store?.contact?.email || 'Email@algeria.com' }, { icon: '📞', val: store?.contact?.phone || '+92 123457800' }, { icon: '❓', val: 'الأسئلة الشائعة' }].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '12px' }}>{item.icon}</span>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>{item.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '16px' }}>
                    © Privacy Policy عمور الطوابر الحقوق المحفوظة {yr}
                </p>
            </div>
        </footer>
    );
}

/* ══════════════════════════════════════════════════════════════
   CARD — with add-to-cart button
══════════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, domain, userId }: any) {
    const [added, setAdded] = useState(false);
    const [adding, setAdding] = useState(false);
    const initCount = useCartStore(s => s.initCount);
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;

    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setAdding(true);
        setTimeout(() => {
            const cart = JSON.parse(localStorage.getItem(domain) || '[]');
            const idx = cart.findIndex((i: any) => i.productId === product.id);
            if (idx >= 0) cart[idx].quantity++;
            else cart.push({ productId: product.id, storeId: product.store.id, userId, product, finalPrice: price, quantity: 1, addedAt: Date.now() });
            localStorage.setItem(domain, JSON.stringify(cart));
            initCount(cart.length);
            setAdding(false); setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        }, 250);
    };

    return (
        <Link href={`/product/${product.slug || product.id}`} className="p-card" style={{ display: 'block' }}>
            <div className="c-img" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: 'linear-gradient(135deg,#f0f9fc,#e8f6fb)' }}>
                {displayImage
                    ? <img src={displayImage} alt={product.name} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Smartphone style={{ width: '40px', height: '40px', color: 'var(--teal)', opacity: 0.3 }} />
                    </div>
                }
                {discount > 0 && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '6px' }}>
                        -{discount}%
                    </div>
                )}
            </div>
            <div style={{ padding: '12px 12px 14px', textAlign: 'right' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden', minHeight: '36px' }}>
                    {product.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--navy)' }}>{price.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--mid)' }}>دج</span></span>
                    {orig > price && <span style={{ fontSize: '11px', color: 'var(--mist)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
                </div>
                <button onClick={addToCart} disabled={adding}
                    style={{
                        width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: "'Cairo',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.3s',
                        background: added ? 'rgba(10,189,227,0.1)' : 'linear-gradient(135deg,var(--teal),var(--teal-2))',
                        color: added ? 'var(--teal)' : 'white',
                        boxShadow: added ? 'none' : '0 3px 10px rgba(10,189,227,0.25)'
                    }}>
                    {adding ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 0.7s linear infinite' }} /> :
                        added ? <><CheckCircle2 size={13} className="anim-check" />أضيف للسلة</> :
                            <><ShoppingCart size={13} />أضف إلى السلة</>}
                </button>
            </div>
        </Link>
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

    const filtered = useMemo(() => {
        if (!activeCat) return products;
        return products.filter((p: any) => p.categoryId === activeCat);
    }, [products, activeCat]);

    const defaultCats = [
        { id: 'phones', name: 'الهواتف', icon: <IconPhone /> },
        { id: 'watches', name: 'الساعات الذكية', icon: <IconWatch /> },
        { id: 'audio', name: 'الصوتيات', icon: <IconAudio /> },
        { id: 'laptops', name: 'اللابتوبات', icon: <IconLaptop /> },
    ];
    const displayCats = cats.length > 0
        ? cats.slice(0, 8).map((c: any, i: number) => ({ ...c, icon: defaultCats[i % 4].icon }))
        : defaultCats;

    return (
        <div dir="rtl">
            {/* ── HERO ── */}
                <section className="circuit-bg" style={{
    position: 'relative', 
    overflow: 'hidden',
    minHeight: '340px', 
    display: 'flex', 
    alignItems: 'center',
    // هنا الفكرة: إذا كانت الصورة موجودة، نضعها كخلفية كاملة مدمجة مع تدرج داكن لتتضح القراءة، وإذا لم تكن موجودة نرجع للتدرج الأزرق الأصلي والدوائر التزيينية
    background: store.hero?.imageUrl 
        ? 'linear-gradient(135deg, rgba(15, 32, 67, 0.85) 0%, rgba(27, 54, 93, 0.7) 100%)' 
        : 'linear-gradient(135deg, #f0f9fe 0%, #e0f5fc 40%, #f5f9fc 100%)',
    backgroundImage: store.hero?.imageUrl 
        ? `linear-gradient(135deg, rgba(15, 32, 67, 0.85) 0%, rgba(27, 54, 93, 0.7) 100%), url(${store.hero.imageUrl})` 
        : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'all 0.3s ease'
}}>
    
    {/* الدوائر التزيينية تظهر فقط في الحالة الافتراضية (عند عدم وجود صورة خلفية) حتى لا تخرب مظهر صورتك المرفوعة */}
    {!store.hero?.imageUrl && (
        <>
            <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(10,189,227,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, right: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(10,189,227,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
        </>
    )}

    <div className="sr-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%', display: 'grid', gridTemplateColumns: store.hero?.imageUrl ? '1fr' : '1fr 1fr', alignItems: 'center', gap: '32px' }}>
        
        {/* نصوصك الأولى وكتابتك كاملة مع قلب الألوان للأبيض تلقائياً لو كانت الخلفية صورة كاملة لضمان وضوح القراءة */}
        <div style={{ zIndex: 2, textAlign: store.hero?.imageUrl ? 'center' : 'right', maxWidth: store.hero?.imageUrl ? '600px' : '100%', margin: store.hero?.imageUrl ? '0 auto' : '0' }}>
            <h1 className="fu" style={{ 
                fontSize: 'clamp(1.8rem,4vw,3rem)', 
                fontWeight: 800, 
                color: store.hero?.imageUrl ? '#ffffff' : 'var(--navy)', 
                lineHeight: 1.2, 
                marginBottom: '14px' 
            }}>
                {store.hero?.title || 'المستقبل بين يديك'}
            </h1>
            <p className="fu fu1" style={{ 
                fontSize: '14px', 
                color: store.hero?.imageUrl ? 'rgba(255,255,255,0.85)' : 'var(--mid)', 
                lineHeight: '1.7', 
                marginBottom: '28px', 
                maxWidth: '380px',
                marginRight: store.hero?.imageUrl ? 'auto' : '0',
                marginLeft: store.hero?.imageUrl ? 'auto' : '0'
            }}>
                {store.hero?.subtitle || 'استكشف أحدث الهواتف الذكية والأدوات الذكية لتجربة رقمية استثنائية'}
            </p>
            <a href="#products" className="fu fu2 btn-teal" style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '10px', display: 'inline-flex' }}>
                تسوق الآن
            </a>
        </div>

        {/* الجزء الأيسر: يختفي تماماً إذا كانت الصورة في الخلفية، ويظهر بشكل مجسمات الهواتف الزرقاء لو كانت الخلفية الافتراضية */}
        {!store.hero?.imageUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ width: '100px', height: '180px', borderRadius: '20px', background: 'linear-gradient(160deg,#e8f6fb,#c8ecf8)', border: '2px solid rgba(10,189,227,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(10,189,227,0.2)', animation: 'float 4s ease-in-out infinite' }}>
                        <Smartphone style={{ width: '40px', height: '40px', color: 'var(--teal)', opacity: 0.6 }} />
                    </div>
                    <div style={{ width: '84px', height: '152px', borderRadius: '18px', background: 'linear-gradient(160deg,#ddf3fb,#b8e8f5)', border: '2px solid rgba(10,189,227,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 28px rgba(10,189,227,0.15)', animation: 'float 4s 0.5s ease-in-out infinite' }}>
                        <Smartphone style={{ width: '32px', height: '32px', color: 'var(--teal)', opacity: 0.5 }} />
                    </div>
                </div>
            </div>
        )}
    </div>

    <style>{`
        @media(max-width:768px){
            .sr-grid {
                grid-template-columns: 1fr !important;
                text-align: center !important;
                gap: 40px !important;
            }
            .sr-grid div {
                text-align: center !important;
                margin: 0 auto !important;
            }
            .sr-grid p {
                margin: 0 auto 28px auto !important;
            }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
    `}</style>
</section>

            {/* ── CATEGORY CIRCLES ── */}
            <section style={{ padding: '40px 20px', background: 'var(--white)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="cat-grid">
                        {displayCats.map((cat: any, i: number) => (
                            <button key={cat.id || i} onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
                                className="cat-circle sr" style={{ background: 'none', border: 'none', fontFamily: "'Cairo',sans-serif", transitionDelay: `${i * 0.06}s` }}>
                                <div className={`cat-icon ${activeCat === cat.id ? 'active' : ''}`}>
                                    {cat.imageUrl ? (
                                        <img
                                            src={cat.imageUrl}
                                            alt={cat.name || 'category'}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover', // تضمن عدم تمدد الصورة وتشوهها
                                                borderRadius: 'inherit' // تأخذ نفس انحناء حواف العنصر الأب
                                            }}
                                            loading="lazy" // تحسين أداء الموقع أثناء التمرير
                                        />
                                    ) : (
                                        cat.icon
                                    )}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: activeCat === cat.id ? 'var(--teal)' : 'var(--navy)', textAlign: 'center', lineHeight: 1.3 }}>
                                    {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div style={{ height: '1px', background: 'linear-gradient(to right,transparent,var(--line),transparent)', maxWidth: '1200px', margin: '0 auto' }} />

            {/* ── PRODUCTS ── */}
            <section id="products" style={{ padding: '32px 20px 56px', background: 'var(--bg)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {filtered.length === 0 ? (
                        <div style={{ padding: '80px 0', textAlign: 'center' }}>
                            <Smartphone style={{ width: '56px', height: '56px', color: 'var(--teal)', opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
                            <p style={{ color: 'var(--mist)', fontSize: '15px', fontWeight: 600 }}>لا توجد منتجات بعد</p>
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
                                style={{ width: 38, height: 38, borderRadius: '10px', border: '1.5px solid var(--line)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', opacity: page <= 1 ? 0.35 : 1, fontSize: '16px' }}>‹</Link>
                            {Array.from({ length: countPage }).map((_, i) => {
                                const pn = i + 1; const isA = Number(page) === pn;
                                return (
                                    <Link key={pn} href={{ query: { page: pn } }} scroll={false}
                                        style={{ width: 38, height: 38, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: isA ? 700 : 500, border: `1.5px solid ${isA ? 'var(--teal)' : 'var(--line)'}`, background: isA ? 'linear-gradient(135deg,var(--teal),var(--teal-2))' : 'var(--white)', color: isA ? 'white' : 'var(--mid)' }}>
                                        {pn}
                                    </Link>
                                );
                            })}
                            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
                                style={{ width: 38, height: 38, borderRadius: '10px', border: '1.5px solid var(--line)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', opacity: page >= countPage ? 0.35 : 1, fontSize: '16px' }}>›</Link>
                        </div>
                    )}
                </div>
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
        <div dir="rtl" style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Cairo',sans-serif" }}>
            {/* Breadcrumb */}
            <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--line)', padding: '12px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--mist)' }}>
                    <Link href="/" style={{ color: 'var(--teal)', fontWeight: 600 }}>الرئيسية</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--navy)', fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
                    <span style={{ marginRight: 'auto', padding: '4px 12px', borderRadius: '20px', background: inStock || autoGen ? 'var(--teal-lt)' : 'rgba(26,35,50,0.06)', color: inStock || autoGen ? 'var(--teal)' : 'var(--mist)', fontSize: '11px', fontWeight: 700 }}>
                        {autoGen ? '∞ متوفر' : inStock ? '✓ متوفر' : '✗ نفد'}
                    </span>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px 80px' }}>
                <div className="details-g">
                    {/* Gallery */}
                    <div>
                        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(135deg,#f0f9fe,#e0f5fc)', aspectRatio: '1/1', marginBottom: '12px' }}>
                            {allImages.length > 0
                                ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '20px', transition: 'transform 0.5s ease' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Smartphone style={{ width: '80px', height: '80px', color: 'var(--teal)', opacity: 0.2 }} />
                                </div>
                            }
                            {discount > 0 && <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', color: 'white', fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '8px' }}>-{discount}%</div>}
                            <button onClick={toggleWishlist} style={{ position: 'absolute', top: 14, left: 14, width: 36, height: 36, borderRadius: '50%', background: isWishlisted ? 'var(--teal)' : 'white', border: `1.5px solid ${isWishlisted ? 'var(--teal)' : 'var(--line)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isWishlisted ? 'white' : 'var(--mist)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.3s' }}>
                                <Heart style={{ width: '15px', height: '15px', fill: isWishlisted ? 'currentColor' : 'none' }} />
                            </button>
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', background: 'white', border: '1px solid var(--line)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                        <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--navy)' }} />
                                    </button>
                                    <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', background: 'white', border: '1px solid var(--line)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                        <ChevronLeft style={{ width: '14px', height: '14px', color: 'var(--navy)' }} />
                                    </button>
                                </>
                            )}
                            {!inStock && !autoGen && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', borderRadius: '16px' }}>
                                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--mist)' }}>نفذت الكمية</span>
                                </div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {allImages.slice(0, 5).map((img: string, idx: number) => (
                                    <button key={idx} onClick={() => setSel(idx)} style={{ width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--teal)' : 'var(--line)'}`, cursor: 'pointer', padding: 0, background: 'linear-gradient(135deg,#f0f9fe,#e8f6fb)', transition: 'all 0.25s', opacity: sel === idx ? 1 : 0.55 }}>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '4px' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.2rem,2.5vw,1.8rem)', fontWeight: 800, color: 'var(--navy)', marginBottom: '10px', lineHeight: 1.35 }}>
                            {product.name}
                        </h1>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
                            {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '14px', height: '14px', fill: i < 4 ? 'var(--teal)' : 'none', color: 'var(--teal)' }} />)}
                            <span style={{ fontSize: '12px', color: 'var(--mist)', marginRight: '6px' }}>4.8 (128 تقييم)</span>
                        </div>

                        {/* Price box */}
                        <div style={{ background: 'linear-gradient(135deg,var(--teal-lt),rgba(10,189,227,0.04))', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', border: '1px solid var(--line)' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>{finalPrice.toLocaleString()}</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal)' }}>دج</span>
                                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                                    <>
                                        <span style={{ fontSize: '13px', color: 'var(--mist)', textDecoration: 'line-through' }}>{parseFloat(product.priceOriginal).toLocaleString()} دج</span>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', background: 'var(--teal)', padding: '2px 8px', borderRadius: '6px' }}>
                                            وفّر {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString()} دج
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Offers */}
                        {product.offers?.length > 0 && (
                            <div style={{ marginBottom: '18px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: '10px' }}>الباقات المتاحة</p>
                                {product.offers.map((o: any) => (
                                    <label key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', border: `1.5px solid ${selectedOffer === o.id ? 'var(--teal)' : 'var(--line)'}`, borderRadius: '10px', cursor: 'pointer', marginBottom: 7, background: selectedOffer === o.id ? 'var(--teal-lt)' : 'var(--white)', transition: 'all 0.25s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? 'var(--teal)' : 'var(--mist)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {selectedOffer === o.id && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)' }} />}
                                            </div>
                                            <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>{o.name}</span>
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--teal)' }}>{o.price.toLocaleString()} دج</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Attributes */}
                        {allAttrs.map((attr: any) => (
                            <div key={attr.id} style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>{attr.name}</p>
                                {attr.displayMode === 'color' ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: v.value, border: 'none', cursor: 'pointer', outline: `3px solid ${s ? 'var(--teal)' : 'transparent'}`, outlineOffset: 2, transition: 'outline 0.2s' }} />; })}
                                    </div>
                                ) : attr.displayMode === 'image' ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: 52, height: 64, overflow: 'hidden', border: `2px solid ${s ? 'var(--teal)' : 'var(--line)'}`, borderRadius: '10px', cursor: 'pointer', padding: 0, opacity: s ? 1 : 0.55, transition: 'all 0.25s' }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '4px' }} /></button>; })}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '8px 16px', borderRadius: '8px', border: `1.5px solid ${s ? 'var(--teal)' : 'var(--line)'}`, background: s ? 'linear-gradient(135deg,var(--teal),var(--teal-2))' : 'var(--white)', color: s ? 'white' : 'var(--mid)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s', fontFamily: "'Cairo',sans-serif" }}>{v.name}</button>; })}
                                    </div>
                                )}
                            </div>
                        ))}

                        <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

                        {product.desc && (
                            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: '12px' }}>وصف المنتج</p>
                                <div style={{ fontSize: '13px', lineHeight: '1.9', color: 'var(--mid)' }}
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

    const onF = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = 'var(--teal)'; };
    const onB = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, err?: boolean) => { e.target.style.borderColor = err ? 'var(--red)' : 'var(--line)'; };

    return (
        <div dir="rtl" style={{ marginTop: '20px' }}>
            {product.store?.cart && (
                <div className="cart-btns" style={{ marginBottom: '12px' }}>
                    <button onClick={addToCart} disabled={isAdded}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', cursor: isAdded ? 'default' : 'pointer', fontSize: '13px', fontWeight: 700, border: `1.5px solid ${isAdded ? 'var(--teal)' : 'var(--line)'}`, borderRadius: '10px', background: isAdded ? 'var(--teal-lt)' : 'var(--white)', color: isAdded ? 'var(--teal)' : 'var(--mid)', transition: 'all 0.3s', fontFamily: "'Cairo',sans-serif" }}>
                        {isAdded ? <><CheckCircle2 size={14} className="anim-check" />أُضيف</> : <><ShoppingBag size={14} />السلة</>}
                    </button>
                    <button onClick={() => setIsOrderNow(true)} className="btn-teal" style={{ flex: 2, padding: '12px', fontSize: '13px', borderRadius: '10px' }}>
                        اطلب الآن
                    </button>
                </div>
            )}

            {(isOrderNow || !product.store?.cart) && (
                <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(10,189,227,0.08)' }}>
                    <div style={{ padding: '13px 18px', background: 'linear-gradient(135deg,var(--teal-lt),rgba(10,189,227,0.05))', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--teal)', margin: 0 }}>بيانات الطلب</p>
                        {product.store?.cart && (
                            <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 11px', border: '1px solid var(--line)', borderRadius: '7px', background: 'var(--white)', color: 'var(--mist)', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
                                <X style={{ width: '9px', height: '9px' }} /> إلغاء
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
                        <div className="form-2c">
                            <FR error={errors.customerName} label="الاسم">
                                <div style={{ position: 'relative' }}>
                                    <User style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--mist)', pointerEvents: 'none' }} />
                                    <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل"
                                        style={{ ...INP(!!errors.customerName), paddingLeft: '32px' }} onFocus={onF} onBlur={e => onB(e, !!errors.customerName)} />
                                </div>
                            </FR>
                            <FR error={errors.customerPhone} label="الهاتف">
                                <div style={{ position: 'relative' }}>
                                    <Phone style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--mist)', pointerEvents: 'none' }} />
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
                                        style={{ padding: '12px 10px', borderRadius: '10px', border: `1.5px solid ${fd.typeLivraison === type ? 'var(--teal)' : 'var(--line)'}`, background: fd.typeLivraison === type ? 'var(--teal-lt)' : 'var(--white)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s', fontFamily: "'Cairo',sans-serif" }}>
                                        <p style={{ fontSize: '13px', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--teal)' : 'var(--mid)', margin: '0 0 3px' }}>{type === 'home' ? '🏠 منزل' : '🏢 مكتب'}</p>
                                        {selW && <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                                            {(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج
                                        </p>}
                                    </button>
                                ))}
                            </div>
                        </FR>

                        <FR label="الكمية">
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line)', borderRadius: '10px', overflow: 'hidden' }}>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--mid)', fontSize: '18px', transition: 'background 0.2s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-lt)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>−</button>
                                <span style={{ width: 48, textAlign: 'center', fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>{fd.quantity}</span>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--mid)', fontSize: '18px', transition: 'background 0.2s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-lt)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>+</button>
                            </div>
                        </FR>

                        {/* Summary */}
                        <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px', border: '1px solid var(--line)' }}>
                            {[{ l: 'المنتج', v: product.name.slice(0, 22) + (product.name.length > 22 ? '...' : '') }, { l: 'السعر', v: `${fp.toLocaleString()} دج` }, { l: 'الكمية', v: `× ${fd.quantity}` }, { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' }].map(row => (
                                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px', borderBottom: '1px solid var(--line)' }}>
                                    <span style={{ color: 'var(--mist)' }}>{row.l}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{row.v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mid)' }}>الإجمالي</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>{total().toLocaleString()} <span style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: 700 }}>دج</span></span>
                            </div>
                        </div>

                        <button type="submit" disabled={sub} className="btn-teal" style={{ width: '100%', padding: '13px', fontSize: '14px', borderRadius: '10px', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.55 : 1 }}>
                            {sub ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} />جاري...</> : <><ShoppingCart style={{ width: '15px', height: '15px' }} />تأكيد الطلب</>}
                        </button>
                        <p style={{ fontSize: '11px', textAlign: 'center', color: 'var(--mist)', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <Shield style={{ width: '11px', height: '11px', color: 'var(--teal)' }} /> معاملة آمنة ومشفرة
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
        if (!fd.customerName.trim() || fd.customerName.length < 3) er.n = 'مطلوب';
        if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.p = 'رقم هاتف غير صالح (مثال: 0550123456)';
        if (!fd.customerWelaya) er.w = 'مطلوب';
        if (!fd.customerCommune) er.c = 'مطلوب';
        if (Object.keys(er).length) { setErrors(er); return; }
        setErrors({}); setSubmitting(true);
        try {
            await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
            setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
        } catch { } finally { setSubmitting(false); }
    };

    const onF = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = 'var(--teal)'; };
    const onB = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, err?: boolean) => { e.target.style.borderColor = err ? 'var(--red)' : 'var(--line)'; };

    if (success) return (
        <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)', fontFamily: "'Cairo',sans-serif" }}>
            <div style={{ textAlign: 'center', padding: '3rem 2rem', borderRadius: '20px', background: 'var(--white)', border: '1px solid var(--line)', boxShadow: '0 8px 40px rgba(10,189,227,0.12)', maxWidth: 420, width: '100%' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 6px 20px rgba(10,189,227,0.3)' }}>
                    <CheckCircle2 size={28} style={{ color: 'white' }} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>تم استلام طلبك! 🎉</h2>
                <p style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: 24, lineHeight: 1.7 }}>شكراً لتسوقك معنا. سنتواصل معك قريباً للتأكيد.</p>
                <Link href="/" className="btn-teal" style={{ display: 'inline-flex', padding: '12px 32px', fontSize: '14px', borderRadius: '10px' }}>العودة للمتجر</Link>
            </div>
        </div>
    );

    if (!items.length) return (
        <div dir="rtl" style={{ minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)', fontFamily: "'Cairo',sans-serif" }}>
            <div style={{ textAlign: 'center', padding: '3rem 2rem', borderRadius: '20px', background: 'var(--white)', border: '1px solid var(--line)', maxWidth: 360, width: '100%' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal-lt),var(--bg-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ShoppingCart size={28} style={{ color: 'var(--teal)', opacity: 0.6 }} />
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>السلة فارغة</p>
                <p style={{ fontSize: '12px', color: 'var(--mist)', marginBottom: 20 }}>أضف منتجاتك المفضلة</p>
                <Link href="/" className="btn-teal" style={{ display: 'inline-flex', padding: '11px 28px', fontSize: '13px', borderRadius: '10px' }}>تسوق الآن</Link>
            </div>
        </div>
    );

    return (
        <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '20px 16px 60px', fontFamily: "'Cairo',sans-serif" }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingCart size={18} style={{ color: 'white' }} />
                    </div>
                    سلة التسوق
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--mist)', marginRight: 'auto', background: 'var(--teal-lt)', padding: '4px 12px', borderRadius: '20px' }}>{items.length} منتجات</span>
                </h1>

                <div className="cart-g">
                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '14px', padding: '14px', borderRadius: '14px', background: 'var(--white)', border: '1px solid var(--line)', boxShadow: '0 2px 8px rgba(10,189,227,0.05)', transition: 'box-shadow 0.25s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(10,189,227,0.1)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(10,189,227,0.05)'; }}>
                                <div style={{ width: 76, height: 76, flexShrink: 0, overflow: 'hidden', borderRadius: '12px', background: 'linear-gradient(135deg,#f0f9fe,#e0f5fc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '6px' }} alt="" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '13px', lineHeight: 1.35, marginBottom: 3 }}>{item.product?.name}</h4>
                                        <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--teal)', margin: 0 }}>{item.finalPrice?.toLocaleString()} دج</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line)', borderRadius: '10px', overflow: 'hidden' }}>
                                            <button onClick={() => changeQty(i, -1)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--mid)', fontSize: '16px', transition: 'background 0.15s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-lt)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>-</button>
                                            <span style={{ width: 32, textAlign: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>{item.quantity}</span>
                                            <button onClick={() => changeQty(i, 1)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--mid)', fontSize: '16px', transition: 'background 0.15s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-lt)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>+</button>
                                        </div>
                                        <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: 'none', background: 'transparent', color: 'var(--mist)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", borderRadius: '6px', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(229,57,53,0.08)'; el.style.color = 'var(--red)'; }}
                                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--mist)'; }}>
                                            <Trash2 size={12} /> حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', background: 'var(--teal-lt)', border: '1px solid var(--line)' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mid)' }}>المجموع الفرعي</span>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy)' }}>{cartTotal.toLocaleString()} دج</span>
                        </div>
                    </div>

                    {/* Checkout */}
                    <div style={{ background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--line)', boxShadow: '0 4px 20px rgba(10,189,227,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '13px 18px', background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ShoppingCart size={16} style={{ color: 'white' }} />
                            <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', margin: 0 }}>إتمام الطلب</p>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '18px' }}>
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
                            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '13px 15px', marginBottom: '14px', border: '1px solid var(--line)' }}>
                                {[{ l: 'المجموع الفرعي', v: `${cartTotal.toLocaleString()} دج` }, { l: 'التوصيل', v: getLiv() ? `${getLiv().toLocaleString()} دج` : '—' }].map(r => (
                                    <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', borderBottom: '1px solid var(--line)' }}>
                                        <span style={{ color: 'var(--mist)' }}>{r.l}</span>
                                        <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{r.v}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mid)' }}>الإجمالي</span>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 700 }}>دج</span></span>
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} className="btn-teal" style={{ width: '100%', padding: '13px', fontSize: '14px', borderRadius: '10px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.55 : 1 }}>
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

const Shell = ({ children, title, icon }: { children: React.ReactNode; title: string; icon?: React.ReactNode }) => (
    <div dir="rtl" style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Cairo',sans-serif" }}>
        <div style={{ background: 'linear-gradient(135deg,var(--navy),var(--navy-2))', padding: '28px 20px 24px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                {icon && <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>}
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', margin: 0 }}>{title}</h1>
            </div>
        </div>
        <div style={{ maxWidth: '840px', margin: '0 auto', padding: '24px 20px 60px' }}>
            {children}
        </div>
    </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
    <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--white)', border: '1px solid var(--line)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', gap: 12, boxShadow: '0 2px 8px rgba(10,189,227,0.05)' }}>
        <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: '5px' }}>{title}</h3>
            <p style={{ fontSize: '12px', lineHeight: '1.75', color: 'var(--mid)', margin: 0 }}>{body}</p>
        </div>
        {tag && <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'var(--teal-lt)', color: 'var(--teal)', flexShrink: 0, marginTop: 2, alignSelf: 'flex-start', border: '1px solid var(--line)' }}>{tag}</span>}
    </div>
);

export function Privacy() {
    return (
        <Shell title="سياسة الخصوصية" icon={<Shield size={16} style={{ color: 'white' }} />}>
            <IB title="البيانات التي نجمعها" body="اسمك ورقم هاتفك وعنوان التوصيل فقط لمعالجة طلبك." />
            <IB title="كيف نستخدم بياناتك" body="حصرياً لتنفيذ وتوصيل طلبك. لا استخدام تجاري أو مشاركة." />
            <IB title="الأمان" body="بياناتك محمية بتشفير SSL على خوادمنا الآمنة." />
            <IB title="مشاركة البيانات" body="لا نبيع بياناتك أبداً. تُشارك فقط مع شريك التوصيل." tag="مضمون" />
        </Shell>
    );
}

export function Terms() {
    return (
        <Shell title="شروط الخدمة" icon={<Package size={16} style={{ color: 'white' }} />}>
            <IB title="الطلبات" body="لا رسوم مخفية. السعر المعروض هو السعر النهائي الكامل." />
            <IB title="الجودة" body="جميع منتجاتنا أصلية 100% ومضمونة." tag="مضمون" />
            <IB title="الإرجاع" body="قبول الإرجاع خلال 7 أيام من تاريخ الاستلام في حالة العيوب." />
            <IB title="القانون" body="تخضع هذه الشروط لقوانين الجمهورية الجزائرية الديمقراطية الشعبية." />
        </Shell>
    );
}

export function Cookies() {
    return (
        <Shell title="ملفات الارتباط" icon={<Zap size={16} style={{ color: 'white' }} />}>
            <IB title="كوكيز أساسية" body="ضرورية لتشغيل المتجر والسلة وتجربة المستخدم." tag="مطلوب" />
            <IB title="كوكيز التفضيلات" body="تحفظ إعداداتك لتجربة مخصصة." tag="اختياري" />
            <IB title="كوكيز التحليلات" body="بيانات مجهولة لتحسين المتجر." tag="اختياري" />
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--teal-lt)', border: '1px solid var(--line)', display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '8px' }}>
                <ToggleRight style={{ width: '18px', height: '18px', color: 'var(--teal)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.8', margin: 0 }}>يمكنك إدارة الكوكيز من إعدادات متصفحك في أي وقت.</p>
            </div>
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
    const onF = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'var(--teal)'; };
    const onB = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'var(--line)'; };

    return (
        <div dir="rtl" style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Cairo',sans-serif" }}>
            <div style={{ background: 'linear-gradient(135deg,var(--navy),var(--navy-2))', padding: '28px 20px 24px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={16} style={{ color: 'white' }} />
                    </div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', margin: 0 }}>تواصل معنا</h1>
                </div>
            </div>

            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Contact info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { icon: '📞', label: 'الهاتف', val: store?.contact?.phone, teal: true },
                        { icon: '✉️', label: 'البريد الإلكتروني', val: store?.contact?.email, teal: false },
                        { icon: '📍', label: 'الموقع', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / '), teal: false },
                    ].filter(r => r.val).map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '14px', background: 'var(--white)', border: '1px solid var(--line)', boxShadow: '0 2px 10px rgba(10,189,227,0.06)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '12px', background: item.teal ? 'linear-gradient(135deg,var(--teal),var(--teal-2))' : 'var(--teal-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                                {item.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{item.label}</p>
                                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)', margin: 0 }}>{item.val}</p>
                            </div>
                        </div>
                    ))}

                    {/* الجزائر badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 18px', borderRadius: '14px', background: 'linear-gradient(135deg,var(--navy),var(--navy-2))', border: 'none' }}>
                        <span style={{ fontSize: '2rem' }}>🇩🇿</span>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: '0 0 2px' }}>نفخر بأننا</p>
                            <p style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: 0 }}>صنع في الجزائر 🇩🇿</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div style={{ background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(10,189,227,0.06)' }}>
                    <div style={{ padding: '13px 18px', background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Search size={14} style={{ color: 'white' }} />
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', margin: 0 }}>أرسل رسالة</p>
                    </div>
                    {sent ? (
                        <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),var(--teal-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 6px 18px rgba(10,189,227,0.3)' }}>
                                <CheckCircle2 size={24} style={{ color: 'white' }} />
                            </div>
                            <p style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '4px', fontSize: '15px' }}>تم الإرسال بنجاح!</p>
                            <p style={{ fontSize: '12px', color: 'var(--mist)' }}>سنرد عليك قريباً</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mid)', marginBottom: 5 }}>رسالتك</p>
                                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="كيف يمكننا مساعدتك؟" rows={5} required
                                    style={{ ...INP(), resize: 'none' }} onFocus={onF} onBlur={onB} />
                            </div>
                            <button type="submit" disabled={loading} className="btn-teal" style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.55 : 1 }}>
                                {loading ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />جاري...</> : 'إرسال الرسالة ⚡'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style>{`@media(max-width:640px){div[style*="grid-template-columns:'1fr 1fr'"]{ grid-template-columns:1fr!important; }}`}</style>
        </div>
    );
}