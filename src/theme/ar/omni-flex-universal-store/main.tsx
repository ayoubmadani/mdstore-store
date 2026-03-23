'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
    Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
    AlertCircle, X, Share2, Phone, User, ToggleRight,
    Shield, ArrowRight, Plus, Minus, CheckCircle2, Lock,
    Menu, Zap, Package, Truck, RefreshCw, SlidersHorizontal,
    Cpu, Wifi, Battery, Layers, Grid, List,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    /* درجات الأزرق الداكن الأساسية (بقيت كما هي) */
    --navy:     #0D1B2A;
    --navy-2:   #162436;
    --navy-3:   #1E3048;

    /* تحويل درجات البرتقالي إلى درجات الأزرق الحيوي */
    --blue:     #3A86FF; /* اللون الأساسي الجديد - بديل orange */
    --blue-2:   #0056D2; /* درجة أغمق للتفاعل - بديل orange-2 */
    --blue-3:   #7EB1FF; /* درجة أفتح للإضاءة - بديل orange-3 */

    /* ألوان النصوص والخلفيات الفاتحة */
    --white:    #FFFFFF;
    --off:      #F4F6F8;
    --light:    #E8ECF0;
    --ink:      #0D1B2A;
    --mid:      #4A5A6A;
    --dim:      #8A9BAB;

    /* الخطوط الشفافة */
    --line:     rgba(13,27,42,0.12);
    --line-lt:  rgba(255,255,255,0.12);
}

  body { background: var(--whith); color: var(--ink); font-family: 'Inter', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--blue); border-radius: 2px; }

  /* Condensed display font */
  .bc { font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; }

  /* Subtle dot grid bg */
  .dot-bg {
    background-image: radial-gradient(circle, rgba(13,27,42,0.07) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  @keyframes fade-up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  .fu   { animation: fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay: 0.08s; }
  .fu-2 { animation-delay: 0.18s; }
  .fu-3 { animation-delay: 0.3s; }
  @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }

  /* Card */
  .p-card { background: var(--white); border: 1px solid var(--line); transition: transform 0.28s, box-shadow 0.28s; cursor: pointer; }
  .p-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(13,27,42,0.12); }
  .p-card:hover .c-img img { transform: scale(1.04); }
  .c-img img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); }

  /* Buttons */
  .btn-orange {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--blue); color: var(--white);
    font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 12px 26px; border: none; cursor: pointer; text-decoration: none;
    transition: background 0.2s, transform 0.2s;
  }
  .btn-orange:hover { background: var(--blue-2); transform: translateY(-1px); }

  .btn-navy {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--navy); color: var(--white);
    font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 12px 26px; border: none; cursor: pointer; text-decoration: none;
    transition: background 0.2s, transform 0.2s;
  }
  .btn-navy:hover { background: var(--navy-2); transform: translateY(-1px); }

  .btn-outline-o {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: var(--blue);
    border: 2px solid var(--blue); font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 10px 22px; cursor: pointer; text-decoration: none; transition: all 0.2s;
  }
  .btn-outline-o:hover { background: var(--blue); color: var(--white); }

  /* Inputs */
  .inp {
    width: 100%; padding: 11px 13px;
    background: var(--white); border: 1.5px solid var(--line);
    font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink);
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .inp:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(240,120,32,0.12); }
  .inp::placeholder { color: var(--dim); }
  .inp-err { border-color: #C0392B !important; }
  select.inp { appearance: none; cursor: pointer; }

  /* Cat image card */
  .cat-card { position: relative; overflow: hidden; cursor: pointer; }
  .cat-card img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.22,1,0.36,1); }
  .cat-card:hover img { transform: scale(1.06); }
  .cat-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(13,27,42,0.7) 0%, transparent 55%); display: flex; align-items: flex-end; padding: 14px 16px; }
  .cat-card-overlay span { font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: white; }
  .cat-card-overlay .arrow { margin-right: auto; color: var(--blue); }

  /* Feature icon */
  .feat-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--blue); }

  /* Responsive */
  .nav-links  { display: flex; align-items: center; gap: 20px; }
  .nav-toggle { display: none; }
  .hero-g     { display: grid; grid-template-columns: 1fr 1fr; min-height: 72vh; align-items: stretch; }
  .three-col  { display: grid; grid-template-columns: 1fr 1.5fr 1.5fr; gap: 0; }
  .cat-2x2    { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 3px; height: 100%; }
  .prod-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--line); }
  .trust-bar  { display: grid; grid-template-columns: repeat(4,1fr); }
  .footer-g   { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
  .details-g  { display: grid; grid-template-columns: 1fr 1fr; }
  .details-L  { position: sticky; top: 64px; height: calc(100vh - 64px); overflow: hidden; }
  .details-R  { padding: 40px 36px 80px; }
  .contact-g  { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; }
  .form-2c    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .dlv-2c     { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  @media (max-width: 1100px) {
    .three-col  { grid-template-columns: 1fr; }
    .prod-grid  { grid-template-columns: repeat(3,1fr); }
    .footer-g   { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width: 768px) {
    .nav-links  { display: none; }
    .nav-toggle { display: flex; }
    .hero-g     { grid-template-columns: 1fr; min-height: auto; }
    .prod-grid  { grid-template-columns: repeat(2,1fr); }
    .trust-bar  { grid-template-columns: repeat(2,1fr); }
    .footer-g   { grid-template-columns: 1fr 1fr; gap: 24px; }
    .details-g  { grid-template-columns: 1fr; }
    .details-L  { position: static; width: 100%; height:auto;aspect-ratio: 1; margin-buttom: 200px ; display: flex ;flex-direction: column; gap:20px;}
    .details-R  { padding: 24px 16px 48px; }
    .contact-g  { grid-template-columns: 1fr; gap: 28px; }
  }
  @media (max-width: 480px) {
    .prod-grid { grid-template-columns: repeat(2,1fr); }
    .footer-g  { grid-template-columns: 1fr; }
    .form-2c   { grid-template-columns: 1fr; }
    .dlv-2c    { grid-template-columns: 1fr; }
  }
`;

/* ── TYPES ──────────────────────────────────────────────────── */
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
    store: { id: string; name: string; subdomain: string; userId: string; };
}
export interface ProductFormProps {
    product: Product; userId: string; domain: string; redirectPath?: string;
    selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
    selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}
function variantMatches(d: VariantDetail, sel: Record<string, string>): boolean {
    return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

/* ── MAIN ───────────────────────────────────────────────────── */
export default function Main({ store, children }: any) {
    if (!store) return null;
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--off)' }}>
            <style>{CSS}</style>
            <Navbar store={store} />
            <main>{children}</main>
            <Footer store={store} />
        </div>
    );
}

/* ── NAVBAR ─────────────────────────────────────────────────── */
export function Navbar({ store }: { store: Store }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 4);
        window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
    }, []);
    if (!store) return null;

    const links = [
        { href: `/${store.subdomain}`, label: 'الرئيسية' },
        { href: `/${store.subdomain}/contact`, label: 'تواصل' },
        { href: `/${store.subdomain}/Privacy`, label: 'الخصوصية' },
    ];

    return (
        <nav dir="rtl" style={{
            position: 'sticky', top: 0, zIndex: 100,
            backgroundColor: 'var(--navy)',
            borderBottom: scrolled ? '2px solid var(--blue)' : '2px solid transparent',
            boxShadow: scrolled ? '0 4px 20px rgba(13,27,42,0.4)' : 'none',
            transition: 'all 0.3s',
        }}>
            {store.topBar?.enabled && store.topBar?.text && (
                <div style={{ backgroundColor: 'var(--blue)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '6px 0' }}>
                    <div style={{ display: 'inline-block', animation: 'ticker 22s linear infinite' }}>
                        {Array(12).fill(null).map((_, i) => (
                            <span key={i} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', color: 'white', margin: '0 40px', textTransform: 'uppercase' }}>
                                ⚡ {store.topBar.text}
                            </span>
                        ))}
                        {Array(12).fill(null).map((_, i) => (
                            <span key={`b${i}`} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', color: 'white', margin: '0 40px', textTransform: 'uppercase' }}>
                                ⚡ {store.topBar.text}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>

                {/* Logo */}
                <Link href={`/${store.subdomain}`} style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {store.design?.logoUrl
                        ? <img src={store.design.logoUrl} alt={store.name} style={{ height: '36px', width: 'auto' }} />
                        : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {/* أيقونة رمزية صغيرة تعطي طابع "البراند" */}
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    backgroundColor: 'var(--blue)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(58, 134, 255, 0.25)',
                                    flexShrink: 0
                                }}>
                                    <Zap style={{ width: '20px', height: '20px', color: 'white' }} />
                                </div>

                                {/* نص اسم المتجر بتنسيق احترافي */}
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <span className="bc" style={{
                                        fontSize: '1.4rem',
                                        fontWeight: 900,
                                        color: 'var(--dim)',
                                        lineHeight: 0.9,
                                        letterSpacing: '-0.02em',
                                        textTransform: 'uppercase'
                                    }}>
                                        {store.name}
                                    </span>
                                    <span style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        color: 'var(--blue)',
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        marginTop: '4px',
                                        opacity: 0.8
                                    }}>
                                        Official Store
                                    </span>
                                </div>
                            </div>
                        )
                    }
                </Link>

                {/* Nav links */}
                <div className="nav-links">
                    {links.map(l => (
                        <Link key={l.href} href={l.href}
                            style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '15px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--blue)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                            {l.label}
                        </Link>
                    ))}
                    <a href="#products" className="btn-orange" style={{ padding: '9px 20px', fontSize: '13px' }}>
                        تسوق الآن
                    </a>
                </div>

                <button className="nav-toggle" onClick={() => setOpen(p => !p)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: 'white', padding: '7px', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {open ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
                </button>
            </div>

            <div style={{ maxHeight: open ? '220px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease', backgroundColor: 'var(--navy-2)' }}>
                <div style={{ padding: '8px 24px 16px' }}>
                    {links.map(l => (
                        <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', fontFamily: "'Barlow Condensed',sans-serif", fontSize: '16px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {l.label} <ArrowRight style={{ width: '14px', height: '14px', color: 'var(--blue)' }} />
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}

/* ── FOOTER ─────────────────────────────────────────────────── */
export function Footer({ store }: any) {
    const yr = new Date().getFullYear();
    if (!store) return null;
    return (
        <footer dir="rtl" style={{
            backgroundColor: 'var(--navy)',
            fontFamily: "'Inter', sans-serif",
            marginTop: '0',
            borderTop: '1px solid var(--line-lt)'
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px 32px' }}>

                {/* Main Grid: 3 Divisions */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '48px',
                    paddingBottom: '48px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>

                    {/* ① Division: Brand Identity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Link href={`/${store.subdomain}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                            {store.design?.logoUrl
                                ? <img src={store.design.logoUrl} alt={store.name} style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                                : <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap style={{ width: '18px', height: '18px', color: 'white' }} />
                                </div>
                            }
                            <span className="bc" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '0.05em' }}>{store.name}</span>
                        </Link>
                        <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'rgba(255,255,255,0.4)', maxWidth: '280px', fontWeight: 300, margin: 0 }}>
                            {store.description || 'ثيم متعدد الاستخدامات عالي الأداء يوفر تجربة تسوق تقنية متكاملة لجميع أنواع المنتجات.'}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--blue)', letterSpacing: '0.1em', fontWeight: 600 }}>{store.subdomain.toUpperCase()}</p>
                    </div>

                    {/* ② Division: Quick Links */}
                    <div>
                        <p className="bc" style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--blue)', marginBottom: '24px', textTransform: 'uppercase' }}>روابط سريعة</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                            {[
                                { href: `/${store.subdomain}/Privacy`, label: 'سياسة الخصوصية' },
                                { href: `/${store.subdomain}/Terms`, label: 'شروط الخدمة' },
                                { href: `/${store.subdomain}/contact`, label: 'اتصل بنا' },
                                { href: `#categories`, label: 'تصفح الفئات' },
                            ].map(l => (
                                <a key={l.href} href={l.href} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.paddingRight = '5px'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.paddingRight = '0'; }}>
                                    {l.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ③ Division: Contact Details */}
                    <div>
                        <p className="bc" style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--blue)', marginBottom: '24px', textTransform: 'uppercase' }}>تواصل معنا</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { icon: '📞', val: store.phone || '+213 550 000 000' },
                                { icon: '✉️', val: store.email || 'info@store.dz' },
                                { icon: '📍', val: store.address || 'الجزائر العاصمة' },
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '14px', opacity: 0.8 }}>{item.icon}</span>
                                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright Bar */}
                <div style={{ paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
                        © {yr} {store.name}. جميع الحقوق محفوظة.
                    </p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em', margin: 0 }}>OMNI-FLEX THEME v2.0</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* ── CARD ───────────────────────────────────────────────────── */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
    if (!product || !store) return null;
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
    return (
        <div className="p-card">
            <div className="c-img" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--light)' }}>
                {displayImage
                    ? <img src={displayImage} alt={product.name} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="dot-bg">
                        <Package style={{ width: '40px', height: '40px', color: 'var(--dim)', opacity: 0.5 }} />
                    </div>
                }
                {discount > 0 && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--blue)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 9px' }}>
                        -{discount}%
                    </div>
                )}
            </div>
            <div style={{ padding: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                    {product.name}
                </h3>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '11px', height: '11px', fill: i < 4 ? 'var(--blue)' : 'none', color: 'var(--blue)' }} />)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>{price.toLocaleString()}</span>
                        <span style={{ fontSize: '11px', color: 'var(--dim)' }}>دج</span>
                        {orig > price && <span style={{ fontSize: '11px', color: 'var(--dim)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
                    </div>
                </div>
                <Link href={`/${store.subdomain}/product/${product.slug || product.id}`}
                    className="btn-orange" style={{ textDecoration: 'none', width: '100%', fontSize: '13px', padding: '9px 16px', letterSpacing: '0.08em' }}>
                    {viewDetails}
                </Link>
            </div>
        </div>
    );
}

/* ── HOME ───────────────────────────────────────────────────── */
export function Home({ store }: any) {
    if (!store) return null;
    const products: any[] = store.products || [];
    const cats: any[] = store.categories || [];
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const filtered = useMemo(() => {
        if (!activeFilter) return products;
        return products.filter((p: any) => p.categoryId === activeFilter);
    }, [products, activeFilter]);

    const features = [
        { icon: <Cpu style={{ width: '22px', height: '22px' }} />, label: 'أداء عالي' },
        { icon: <Wifi style={{ width: '22px', height: '22px' }} />, label: 'تقنية متقدمة' },
        { icon: <Battery style={{ width: '22px', height: '22px' }} />, label: 'عمر تشغيل طويل' },
        { icon: <Layers style={{ width: '22px', height: '22px' }} />, label: 'تصميم متعدد الطبقات' },
    ];

    return (
        <div dir="rtl">

            {/* ── HERO — Full Image Background ── */}
<section className="hero-g" style={{
    position: 'relative',
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'var(--navy)', 
}}>

    {/* 1. Background Image Wrapper */}
    <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1
    }}>
        {store.hero?.imageUrl ? (
            <>
                <img
                    src={store.hero.imageUrl}
                    alt={store.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Overlay مُحسّن: تدرج داكن من اليمين (جهة النص العربي) إلى الشفافية */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to left, rgba(13,27,42,0.95) 20%, rgba(13,27,42,0.6) 50%, rgba(13,27,42,0.2) 100%)'
                }} />
            </>
        ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--navy-2)' }} className="dot-bg" />
        )}
    </div>

    {/* 2. Content Container */}
    <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '1280px',
        padding: '0 6vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start' 
    }}>
        {/* اسم المتجر كـ Badge علوي */}
        <div className="fu" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ width: '30px', height: '2px', backgroundColor: 'var(--blue)' }}></span>
            <span className="bc" style={{ 
                fontSize: '14px', 
                fontWeight: 800, 
                color: 'var(--white)', 
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
            }}>
                {store.name}
            </span>
        </div>

        <p className="fu fu-1 bc" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--blue)', marginBottom: '12px', textTransform: 'uppercase' }}>
            ✦ تجربة تقنية متكاملة
        </p>

        <h1 className="fu fu-2 bc" style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.8rem)',
            fontWeight: 900,
            color: 'var(--white)',
            lineHeight: 1.05,
            marginBottom: '24px',
            maxWidth: '800px',
            textShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
            {store.hero?.title || <>مُصمَّم للتميز.<br />أداء شامل.</>}
        </h1>

        <p className="fu fu-3" style={{
            fontSize: '18px',
            lineHeight: '1.7',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '40px',
            maxWidth: '550px',
            fontWeight: 300
        }}>
            {store.hero?.subtitle || `اكتشف مجموعتنا المختارة في ${store.name} من أحدث المنتجات التقنية المصممة بعناية.`}
        </p>

        <div className="fu fu-3" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#products" className="btn-orange" style={{ padding: '18px 44px', borderRadius: '50px' }}>
                تسوق الآن
            </a>
            <a href="#about" style={{
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'var(--white)',
                padding: '18px 44px',
                borderRadius: '50px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: '0.3s',
                backdropFilter: 'blur(10px)',
                fontSize: '15px'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                تعرف علينا
            </a>
        </div>

        {/* 3. Stats Section */}
        <div className="fu fu-3" style={{
            marginTop: '64px',
            display: 'flex',
            gap: '48px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
            {[
                { n: `${products.length}+`, l: 'منتج متاح' },
                { n: 'FAST', l: 'توصيل سريع' },
                { n: '24/7', l: 'دعم فني' }
            ].map((s, i) => (
                <div key={i}>
                    <p className="bc" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--white)', margin: 0 }}>{s.n}</p>
                    <p style={{ fontSize: '10px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>{s.l}</p>
                </div>
            ))}
        </div>
    </div>
</section>

            {/* ── TRUST BAR ── */}
            <div style={{ backgroundColor: 'var(--navy)', borderBottom: '3px solid var(--blue)' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div className="trust-bar">
                        {[
                            { icon: <Truck style={{ width: '20px', height: '20px' }} />, title: 'توصيل سريع', desc: '48 ساعة لكل الجزائر' },
                            { icon: <Shield style={{ width: '20px', height: '20px' }} />, title: 'منتجات أصيلة', desc: '100% جودة مضمونة' },
                            { icon: <RefreshCw style={{ width: '20px', height: '20px' }} />, title: 'إرجاع مجاني', desc: '30 يوم إرجاع' },
                            { icon: <Zap style={{ width: '20px', height: '20px' }} />, title: 'دعم سريع', desc: 'رد خلال 24 ساعة' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                                <div style={{ color: 'var(--blue)', flexShrink: 0 }}>{item.icon}</div>
                                <div>
                                    <p className="bc" style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', color: 'white', margin: 0 }}>{item.title}</p>
                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CATEGORIES GRID SECTION ── */}
            <section className="categories-section" style={{
                borderTop: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                backgroundColor: 'var(--white)',
                padding: '60px 0'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 6vw' }}>

                    {/* Header for Categories */}
                    <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                        <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.22em', color: 'var(--blue)', marginBottom: '12px', textTransform: 'uppercase' }}>
                            ✦ تصفح حسب الفئة
                        </p>
                        <h2 className="fu bc" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                            تصنيفات <span style={{ color: 'var(--blue)' }}>مختارة</span>
                        </h2>
                    </div>

                    {/* Categories 2x2 or Flexible Grid */}
                    {cats.length > 0 ? (
                        <div id="categories" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '20px'
                        }}>
                            {cats.slice(0, 8).map((cat: any) => (
                                <Link
                                    key={cat.id}
                                    href={`/${store.subdomain}?category=${cat.id}`}
                                    className="cat-card"
                                    style={{
                                        display: 'block',
                                        textDecoration: 'none',
                                        height: '250px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--off)'
                                    }}
                                >
                                    {cat.imageUrl ? (
                                        <img
                                            src={cat.imageUrl}
                                            alt={cat.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="dot-bg">
                                            <Package style={{ width: '40px', height: '40px', color: 'var(--dim)', opacity: 0.3 }} />
                                        </div>
                                    )}

                                    {/* Overlay Styling */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: '20px',
                                        background: 'linear-gradient(transparent, rgba(13,27,42,0.8))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        color: 'var(--white)'
                                    }}>
                                        <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '0.05em' }}>{cat.name}</span>
                                        <ArrowRight style={{ width: '18px', height: '18px' }} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--dim)' }}>
                            لا توجد فئات متاحة حالياً.
                        </div>
                    )}
                </div>
            </section>



            {/* ── PRODUCTS SECTION (Clean White) ── */}
            <section id="products" style={{
                backgroundColor: '#F9FAFB', // خلفية بيضاء صافية
                paddingTop: '40px',
                paddingBottom: '80px'
            }}>

                {/* Minimalist Header */}
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 40px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '20px'
                    }}>
                        <div>
                            <h2 className="bc" style={{
                                fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
                                fontWeight: 900,
                                color: 'var(--navy)',
                                margin: 0,
                                letterSpacing: '-0.02em'
                            }}>
                                المنتجات <span style={{ color: 'var(--blue)' }}>المتاحة</span>
                            </h2>
                            <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--blue)', marginTop: '8px' }} />
                        </div>

                        <div style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--mid)',
                            padding: '8px 16px',
                            border: '1px solid var(--line)',
                            borderRadius: '50px'
                        }}>
                            إجمالي العناصر: {filtered.length}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
                    {filtered.length === 0 ? (
                        <div style={{
                            padding: '100px 0',
                            textAlign: 'center',
                            border: '2px dashed var(--line)',
                            borderRadius: '16px'
                        }}>
                            <Package style={{ width: '48px', height: '48px', color: 'var(--dim)', opacity: 0.2, margin: '0 auto 16px' }} />
                            <p className="bc" style={{ fontSize: '1.2rem', color: 'var(--dim)' }}>نحن نعمل على إضافة منتجات جديدة...</p>
                        </div>
                    ) : (
                        <div className="prod-grid" style={{
                            display: 'grid',
                            backgroundColor: '#F9FAFB',
                            // مسافات واسعة (Gap) لتعزيز المظهر النظيف
                            gap: '10px',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
                        }}>
                            {filtered.map((p: any) => {
                                const img = p.productImage || p.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
                                const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;

                                return (
                                    <div key={p.id} className="product-card-container">
                                        <Card
                                            product={p}
                                            displayImage={img}
                                            discount={disc}
                                            store={store}
                                            viewDetails="اكتشف المزيد"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>


        </div>
    );
}

/* ── DETAILS ────────────────────────────────────────────────── */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
    const [sel, setSel] = useState(0);
    if (!product) return null;
    return (
        <div dir="rtl" style={{ backgroundColor: 'var(--off)' }}>
            {/* Breadcrumb */}
            <div style={{ backgroundColor: 'var(--navy)', borderBottom: '2px solid var(--blue)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                <Link href="/" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s', fontFamily: "'Barlow Condensed',sans-serif" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--blue)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
                    الرئيسية
                </Link>
                <span style={{ color: 'var(--blue)' }}>/</span>
                <span style={{ color: 'white', fontFamily: "'Barlow Condensed',sans-serif" }}>{product.name.slice(0, 40)}</span>
                <div style={{ marginRight: 'auto', display: 'flex', gap: '8px' }}>
                    <button onClick={toggleWishlist} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isWishlisted ? 'var(--blue)' : 'rgba(255,255,255,0.2)'}`, background: isWishlisted ? 'rgba(240,120,32,0.2)' : 'transparent', cursor: 'pointer', color: isWishlisted ? 'var(--blue)' : 'rgba(255,255,255,0.4)' }}>
                        <Heart style={{ width: '13px', height: '13px', fill: isWishlisted ? 'currentColor' : 'none' }} />
                    </button>
                    <button onClick={handleShare} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                        <Share2 style={{ width: '13px', height: '13px' }} />
                    </button>
                </div>
            </div>

            <div className="details-g" style={{ maxWidth: '1280px', margin: '0 auto'}}>
                {/* Gallery */}
                <div className="details-L">
                    <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--white)', border: '1px solid var(--line)' }}>
                        {allImages.length > 0
                            ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="dot-bg">
                                <Package style={{ width: '64px', height: '64px', color: 'var(--dim)', opacity: 0.3 }} />
                            </div>
                        }
                        {/* Orange top accent */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, var(--blue), var(--blue-3))' }} />
                        {discount > 0 && <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'var(--blue)', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 12px' }}>-{discount}%</div>}
                        {allImages.length > 1 && (
                            <>
                                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', border: '1px solid var(--line)', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ChevronRight style={{ width: '15px', height: '15px', color: 'var(--navy)' }} />
                                </button>
                                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', border: '1px solid var(--line)', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ChevronLeft style={{ width: '15px', height: '15px', color: 'var(--navy)' }} />
                                </button>
                            </>
                        )}
                        {!inStock && !autoGen && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248,250,252,0.88)', backdropFilter: 'blur(4px)' }}>
                                <span className="bc" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--mid)' }}>نفد المخزون</span>
                            </div>
                        )}
                    </div>
                    {allImages.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {allImages.slice(0, 5).map((img: string, idx: number) => (
                                <button key={idx} onClick={() => setSel(idx)} style={{ width: '54px', height: '54px', overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--blue)' : 'var(--line)'}`, cursor: 'pointer', padding: 0, background: 'none', opacity: sel === idx ? 1 : 0.55 }}>
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="details-R">
                    <p className="bc" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', color: 'var(--blue)', marginBottom: '10px' }}>// تفاصيل المنتج</p>
                    <h1 className="bc" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--navy)', lineHeight: 0.95, marginBottom: '14px' }}>
                        {product.name.toUpperCase()}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '22px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '13px', height: '13px', fill: i < 4 ? 'var(--blue)' : 'none', color: 'var(--blue)' }} />)}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--dim)' }}>128 تقييم</span>
                        <span style={{ marginRight: 'auto', padding: '5px 14px', backgroundColor: inStock || autoGen ? 'rgba(240,120,32,0.1)' : 'rgba(107,90,74,0.08)', color: inStock || autoGen ? 'var(--blue)' : 'var(--mid)', fontSize: '12px', fontWeight: 700, border: `1.5px solid ${inStock || autoGen ? 'var(--blue)' : 'var(--mid)'}` }}>
                            {autoGen ? '∞ متوفر' : inStock ? 'متوفر' : 'نفد'}
                        </span>
                    </div>

                    {/* Price */}
                    <div style={{ marginBottom: '22px', padding: '16px 18px', backgroundColor: 'var(--off)', border: '1px solid var(--line)' }}>
                        <p className="bc" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--mid)', margin: '0 0 6px' }}>السعر</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1, letterSpacing: '-0.01em' }}>{finalPrice.toLocaleString()}</span>
                            <span style={{ fontSize: '15px', color: 'var(--dim)' }}>دج</span>
                            {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                                <>
                                    <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 700, padding: '2px 8px', backgroundColor: 'rgba(240,120,32,0.1)', border: '1px solid var(--blue)' }}>
                                        وفّر {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString()} دج
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Offers */}
                    {product.offers?.length > 0 && (
                        <div style={{ marginBottom: '22px', paddingBottom: '22px', borderBottom: '1px solid var(--line)' }}>
                            <p className="bc" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--mid)', marginBottom: '10px' }}>// الباقات</p>
                            {product.offers.map((offer: any) => (
                                <label key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1.5px solid ${selectedOffer === offer.id ? 'var(--blue)' : 'var(--line)'}`, cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s', backgroundColor: selectedOffer === offer.id ? 'rgba(240,120,32,0.05)' : 'var(--white)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '16px', height: '16px', border: `2px solid ${selectedOffer === offer.id ? 'var(--blue)' : 'var(--dim)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {selectedOffer === offer.id && <div style={{ width: '8px', height: '8px', background: 'var(--blue)' }} />}
                                        </div>
                                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} style={{ display: 'none' }} />
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{offer.name}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--dim)', margin: 0 }}>الكمية: {offer.quantity}</p>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue)' }}>{offer.price.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--dim)' }}>دج</span></span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Attributes */}
                    {allAttrs.map((attr: any) => (
                        <div key={attr.id} style={{ marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid var(--line)' }}>
                            <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--mid)', marginBottom: '10px' }}>// {attr.name}</p>
                            {attr.displayMode === 'color' ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: '28px', height: '28px', backgroundColor: v.value, border: 'none', cursor: 'pointer', outline: s ? '3px solid var(--blue)' : '3px solid transparent', outlineOffset: '3px' }} />; })}
                                </div>
                            ) : attr.displayMode === 'image' ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: '52px', height: '52px', overflow: 'hidden', border: `2px solid ${s ? 'var(--blue)' : 'var(--line)'}`, cursor: 'pointer', padding: 0 }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>; })}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '8px 16px', border: `1.5px solid ${s ? 'var(--blue)' : 'var(--line)'}`, backgroundColor: s ? 'var(--blue)' : 'transparent', color: s ? 'white' : 'var(--mid)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>{v.name}</button>; })}
                                </div>
                            )}
                        </div>
                    ))}

                    <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

                    {product.desc && (
                        <div style={{ marginTop: '28px', paddingTop: '22px', borderTop: '1px solid var(--line)' }}>
                            <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--mid)', marginBottom: '12px' }}>// وصف المنتج</p>
                            <div style={{ fontSize: '14px', lineHeight: '1.85', color: 'var(--mid)', fontWeight: 400 }}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── PRODUCT FORM ────────────────────────────────────────────── */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '13px' }}>
        {label && <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--mid)', marginBottom: '6px' }}>{label}</p>}
        {children}
        {error && <p style={{ fontSize: '11px', color: '#C0392B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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

    const fp = getFP(); const total = () => fp * fd.quantity + getLiv();
    const validate = () => {
        const e: Record<string, string> = {};
        if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
        if (!fd.customerPhone.trim()) e.customerPhone = 'رقم الهاتف مطلوب';
        if (!fd.customerWelaya) e.customerWelaya = 'الولاية مطلوبة';
        if (!fd.customerCommune) e.customerCommune = 'البلدية مطلوبة';
        return e;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); const er = validate(); if (Object.keys(er).length) { setErrors(er); return; } setErrors({}); setSub(true);
        try {
            await axios.post(`${API_URL}/orders/create`, { ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
            if (typeof window !== 'undefined' && fd.customerId) localStorage.setItem('customerId', fd.customerId);
            router.push(`/lp/${domain}/successfully`);
        } catch (err) { console.error(err); } finally { setSub(false); }
    };

    return (
        <div style={{ marginTop: '22px', paddingTop: '20px', borderTop: '2px solid var(--blue)' }}>
            <form onSubmit={handleSubmit}>
                <div className="form-2c">
                    <FR error={errors.customerName} label="الاسم">
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                            <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل"
                                className={`inp${errors.customerName ? ' inp-err' : ''}`} style={{ paddingLeft: '36px' }}
                                onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = errors.customerName ? '#C0392B' : 'var(--line)'; }} />
                        </div>
                    </FR>
                    <FR error={errors.customerPhone} label="الهاتف">
                        <div style={{ position: 'relative' }}>
                            <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                            <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0X XX XX XX XX"
                                className={`inp${errors.customerPhone ? ' inp-err' : ''}`} style={{ paddingLeft: '36px' }}
                                onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = errors.customerPhone ? '#C0392B' : 'var(--line)'; }} />
                        </div>
                    </FR>
                </div>
                <div className="form-2c">
                    <FR error={errors.customerWelaya} label="الولاية">
                        <div style={{ position: 'relative' }}>
                            <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                            <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}
                                className={`inp${errors.customerWelaya ? ' inp-err' : ''}`} style={{ paddingRight: '34px' }}
                                onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = errors.customerWelaya ? '#C0392B' : 'var(--line)'; }}>
                                <option value="">اختر الولاية</option>
                                {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                            </select>
                        </div>
                    </FR>
                    <FR error={errors.customerCommune} label="البلدية">
                        <div style={{ position: 'relative' }}>
                            <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                            <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })}
                                className={`inp${errors.customerCommune ? ' inp-err' : ''}`} style={{ paddingRight: '34px', opacity: !fd.customerWelaya ? 0.4 : 1 }}
                                onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = errors.customerCommune ? '#C0392B' : 'var(--line)'; }}>
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
                                style={{ padding: '12px 10px', border: `1.5px solid ${fd.typeLivraison === type ? 'var(--blue)' : 'var(--line)'}`, backgroundColor: fd.typeLivraison === type ? 'rgba(240,120,32,0.06)' : 'var(--white)', cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s' }}>
                                <p className="bc" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', color: fd.typeLivraison === type ? 'var(--blue)' : 'var(--mid)', margin: '0 0 4px' }}>
                                    {type === 'home' ? 'للبيت' : 'للمكتب'}
                                </p>
                                {selW && <p style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--blue)' : 'var(--dim)', margin: 0 }}>
                                    {(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()}
                                    <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--dim)', marginRight: '3px' }}>دج</span>
                                </p>}
                            </button>
                        ))}
                    </div>
                </FR>

                <FR label="الكمية">
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line)', backgroundColor: 'var(--white)' }}>
                        <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderLeft: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--navy)', transition: 'background 0.18s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--off)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                            <Minus style={{ width: '12px', height: '12px' }} />
                        </button>
                        <span style={{ width: '44px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>{fd.quantity}</span>
                        <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))}
                            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRight: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--navy)', transition: 'background 0.18s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--off)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                            <Plus style={{ width: '12px', height: '12px' }} />
                        </button>
                    </div>
                </FR>

                {/* Summary */}
                <div style={{ border: '1px solid var(--line)', marginBottom: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', backgroundColor: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package style={{ width: '13px', height: '13px', color: 'var(--blue)' }} />
                        <span className="bc" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.7)' }}>ملخص الطلب</span>
                    </div>
                    {[
                        { l: 'المنتج', v: product.name.slice(0, 22) },
                        { l: 'السعر', v: `${fp.toLocaleString()} دج` },
                        { l: 'الكمية', v: `× ${fd.quantity}` },
                        { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
                    ].map(row => (
                        <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--white)' }}>
                            <span style={{ fontSize: '13px', color: 'var(--dim)' }}>{row.l}</span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{row.v}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', backgroundColor: 'var(--off)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--mid)' }}>المجموع</span>
                        <span style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--blue)', letterSpacing: '-0.01em' }}>
                            {total().toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--dim)' }}>دج</span>
                        </span>
                    </div>
                </div>

                <button type="submit" disabled={sub} className="btn-orange"
                    style={{ width: '100%', fontSize: '16px', padding: '13px', letterSpacing: '0.12em', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1 }}>
                    {sub ? 'جاري المعالجة...' : 'تأكيد الطلب'}{!sub && <ArrowRight style={{ width: '15px', height: '15px' }} />}
                </button>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)', textAlign: 'center', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <Lock style={{ width: '10px', height: '10px', color: 'var(--blue)' }} /> دفع آمن ومشفر
                </p>
            </form>
        </div>
    );
}

/* ── STATIC PAGES ────────────────────────────────────────────── */
export function StaticPage({ page }: { page: string }) {
    const p = page.toLowerCase();
    return <>{p === 'privacy' && <Privacy />}{p === 'terms' && <Terms />}{p === 'cookies' && <Cookies />}{p === 'contact' && <Contact />}</>;
}

const Shell = ({ children, title, sub }: { children: React.ReactNode; title: string; sub?: string }) => (
    <div dir="rtl" style={{ backgroundColor: 'var(--off)', minHeight: '100vh' }}>
        <div style={{ backgroundColor: 'var(--navy)', padding: '64px 24px 48px', borderBottom: '3px solid var(--blue)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }} className="dot-bg" />
            <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                {sub && <p className="bc" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.24em', color: 'var(--blue)', marginBottom: '10px' }}>{sub}</p>}
                <h1 className="bc" style={{ fontSize: 'clamp(2.5rem,7vw,6rem)', fontWeight: 800, letterSpacing: '0.04em', color: 'white', lineHeight: 0.88, margin: '0 0 12px' }}>{title.toUpperCase()}</h1>
                <div style={{ width: '48px', height: '3px', background: 'var(--blue)' }} />
            </div>
        </div>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
            <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', padding: '32px' }}>{children}</div>
        </div>
    </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
    <div style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 7px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--blue)', fontSize: '12px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700 }}>//</span> {title}
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.85', color: 'var(--mid)', fontWeight: 400, margin: 0 }}>{body}</p>
        </div>
        {tag && <span className="bc" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', padding: '4px 10px', border: '1px solid var(--blue)', color: 'var(--blue)', flexShrink: 0, marginTop: '2px' }}>{tag}</span>}
    </div>
);

export function Privacy() {
    return (
        <Shell title="الخصوصية" sub="// قانوني">
            <IB title="البيانات التي نجمعها" body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك." />
            <IB title="كيف نستخدمها" body="حصرياً لتنفيذ وتوصيل مشترياتك. لا استخدام تجاري." />
            <IB title="الأمان" body="بياناتك محمية بتشفير قياسي وبنية تحتية آمنة." />
            <IB title="مشاركة البيانات" body="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين." />
        </Shell>
    );
}

export function Terms() {
    return (
        <Shell title="الشروط" sub="// قانوني">
            <IB title="حسابك" body="أنت مسؤول عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك." />
            <IB title="المدفوعات" body="لا رسوم مخفية. السعر المعروض هو السعر النهائي." />
            <IB title="الاستخدام المحظور" body="المنتجات الأصيلة فقط. لا مجال للمقلدات." tag="صارم" />
            <IB title="القانون الحاكم" body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية." />
        </Shell>
    );
}

export function Cookies() {
    return (
        <Shell title="الكوكيز" sub="// قانوني">
            <IB title="الكوكيز الأساسية" body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب" />
            <IB title="كوكيز التفضيلات" body="تحفظ لغتك ومنطقتك لتجربة أفضل." tag="اختياري" />
            <IB title="كوكيز التحليلات" body="بيانات مجمعة لتحسين المنصة." tag="اختياري" />
            <div style={{ marginTop: '16px', padding: '14px', border: '1px solid var(--line)', display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: 'var(--off)' }}>
                <ToggleRight style={{ width: '18px', height: '18px', color: 'var(--blue)', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.8', margin: 0 }}>
                    يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح.
                </p>
            </div>
        </Shell>
    );
}

export function Contact() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sent, setSent] = useState(false);
    return (
        <div dir="rtl" style={{ backgroundColor: 'var(--off)', minHeight: '100vh' }}>
            <div style={{ backgroundColor: 'var(--navy)', padding: '64px 24px 48px', borderBottom: '3px solid var(--blue)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }} className="dot-bg" />
                <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    <p className="bc" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.24em', color: 'var(--blue)', marginBottom: '10px' }}>// تواصل</p>
                    <h1 className="bc" style={{ fontSize: 'clamp(2.5rem,7vw,6rem)', fontWeight: 800, letterSpacing: '0.04em', color: 'white', lineHeight: 0.88, margin: '0 0 12px' }}>
                        تواصل معنا
                    </h1>
                    <p className="bc" style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)' }}>نرد خلال 24 ساعة</p>
                </div>
            </div>

            <div className="contact-g" style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 80px' }}>
                {/* Info */}
                <div>
                    <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', padding: '24px', marginBottom: '12px' }}>
                        <p className="bc" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--blue)', marginBottom: '18px' }}>// طرق التواصل</p>
                        {[
                            { icon: '📞', label: 'الهاتف', val: '+213 550 000 000', href: 'tel:+213550000000' },
                            { icon: '✉️', label: 'البريد', val: 'info@store.dz', href: 'mailto:info@store.dz' },
                            { icon: '📍', label: 'الموقع', val: 'الجزائر', href: undefined },
                        ].map(item => (
                            <a key={item.label} href={item.href || '#'} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 0', borderBottom: '1px solid var(--line)', textDecoration: 'none', transition: 'padding-right 0.2s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.paddingRight = '8px'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.paddingRight = '0'; }}>
                                <div style={{ width: '38px', height: '38px', backgroundColor: 'var(--off)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</div>
                                <div>
                                    <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--blue)', margin: '0 0 2px' }}>{item.label}</p>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{item.val}</p>
                                </div>
                                {item.href && <ArrowRight style={{ width: '13px', height: '13px', color: 'var(--dim)', marginRight: 'auto' }} />}
                            </a>
                        ))}
                    </div>

                    <div style={{ backgroundColor: 'var(--navy)', padding: '20px 22px' }}>
                        <p className="bc" style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.08em', color: 'white', lineHeight: 1.4, margin: '0 0 6px' }}>
                            أداء لا حدود له.<br /><span style={{ color: 'var(--blue)' }}>جهّز نفسك.</span>
                        </p>
                        <span className="bc" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)' }}>
                            Omni-Flex Universal Theme
                        </span>
                    </div>
                </div>

                {/* Form */}
                <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', padding: '28px' }}>
                    <p className="bc" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--blue)', marginBottom: '22px' }}>// أرسل رسالة</p>
                    {sent ? (
                        <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', textAlign: 'center', backgroundColor: 'var(--off)', padding: '32px' }}>
                            <CheckCircle2 style={{ width: '32px', height: '32px', color: 'var(--blue)', marginBottom: '14px' }} />
                            <h3 className="bc" style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--navy)', margin: '0 0 8px' }}>تم الإرسال!</h3>
                            <p style={{ fontSize: '13px', color: 'var(--mid)' }}>سنرد عليك خلال 24 ساعة.</p>
                        </div>
                    ) : (
                        <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[
                                { label: 'اسمك', type: 'text', key: 'name', ph: 'الاسم الكامل' },
                                { label: 'البريد', type: 'email', key: 'email', ph: 'بريدك@الإلكتروني' },
                            ].map(f => (
                                <div key={f.key}>
                                    <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--mid)', marginBottom: '6px' }}>{f.label}</p>
                                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph} required className="inp"
                                        onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = 'var(--line)'; }} />
                                </div>
                            ))}
                            <div>
                                <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--mid)', marginBottom: '6px' }}>رسالتك</p>
                                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp"
                                    style={{ resize: 'none' as any }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = 'var(--line)'; }} />
                            </div>
                            <button type="submit" className="btn-orange" style={{ justifyContent: 'center', width: '100%', fontSize: '15px', padding: '13px', letterSpacing: '0.12em' }}>
                                إرسال <ArrowRight style={{ width: '14px', height: '14px' }} />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}