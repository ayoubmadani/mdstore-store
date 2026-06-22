'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, ToggleRight, Shield, ArrowLeft,
  Plus, Minus, CheckCircle2, Lock, Menu, Package,
  Truck, BadgeCheck, ShieldCheck, HeartPulse,
  Pill, FlaskConical, Search, ShoppingCart, ShoppingBag,
  Trash2, Loader2, Phone, MapPin, Mail, Activity, Zap, User,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   PURECARE PARA-MEDICAL — Medical Arabic RTL Theme
   ─────────────────────────────────────────────────────────────
   Blue #1A6ED4 · Teal #0D9488 · Off-white #F8FAFC
   Fonts: Inter (body) + Plus Jakarta Sans (display)
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0; }
  html { scroll-behavior:smooth; }

  :root {
    --blue:    #1A6ED4;
    --blue-2:  #1560C0;
    --blue-lt: #EBF4FF;
    --teal:    #0D9488;
    --teal-lt: #E6F7F5;
    --white:   #FFFFFF;
    --off:     #F8FAFC;
    --slate:   #F1F5F9;
    --ink:     #0F172A;
    --mid:     #475569;
    --dim:     #94A3B8;
    --line:    #E2E8F0;
    --line-dk: #CBD5E1;
    --green:   #16A34A;
    --red:     #DC2626;
    --orange:  #EA580C;
  }

  body { background:var(--off); color:var(--ink); font-family:'Inter',sans-serif; }
  a    { text-decoration:none; color:inherit; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:var(--blue); border-radius:2px; }

  .pjs { font-family:'Plus Jakarta Sans',sans-serif; }

  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fi { animation:fadeIn 0.5s ease both; }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin    { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  .anim-check { animation:check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* Cards */
  .p-card {
    background:var(--white); border:1px solid var(--line); border-radius:10px;
    overflow:hidden; transition:transform 0.25s,box-shadow 0.25s; cursor:pointer;
    display:flex; flex-direction:column;
  }
  .p-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(26,110,212,0.1); }

  .cat-card {
    position:relative; overflow:hidden; border-radius:10px;
    border:1px solid var(--line); background:var(--white);
    cursor:pointer; display:block; transition:transform 0.25s,box-shadow 0.25s;
  }
  .cat-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(26,110,212,0.12); }
  .cat-card:hover img { transform:scale(1.04); }
  .cat-card img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.35s ease; }

  .why-card {
    display:flex; flex-direction:column; align-items:center; text-align:center;
    padding:28px 16px; background:var(--white); border:1px solid var(--line);
    border-radius:10px; transition:box-shadow 0.25s;
  }
  .why-card:hover { box-shadow:0 6px 20px rgba(26,110,212,0.1); }

  /* Horizontal scroll */
  .h-scroll {
    display:flex; gap:16px; overflow-x:auto; padding-bottom:6px;
    scroll-behavior:smooth; scrollbar-width:none;
  }
  .h-scroll::-webkit-scrollbar { display:none; }
  .h-scroll-item { flex:0 0 220px; min-width:0; }

  /* Buttons */
  .btn-blue {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:var(--blue); color:var(--white);
    font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:700;
    padding:11px 24px; border:none; cursor:pointer;
    border-radius:6px; transition:background 0.2s,transform 0.2s;
  }
  .btn-blue:hover { background:var(--blue-2); transform:translateY(-1px); }
  .btn-blue:disabled { opacity:0.7; cursor:not-allowed; transform:none; }

  .btn-cart {
    display:block; width:100%; text-align:center;
    background:var(--blue); color:var(--white);
    font-family:'Inter',sans-serif; font-size:12px; font-weight:600;
    padding:9px 12px; border:none; cursor:pointer;
    border-radius:6px; transition:background 0.2s;
  }
  .btn-cart:hover { background:var(--blue-2); }

  /* Inputs */
  .inp {
    width:100%; padding:10px 13px;
    background:var(--white); border:1.5px solid var(--line-dk);
    font-family:'Inter',sans-serif; font-size:13px; color:var(--ink);
    outline:none; border-radius:6px; transition:border-color 0.2s,box-shadow 0.2s; appearance:none;
  }
  .inp:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(26,110,212,0.1); }
  .inp::placeholder { color:var(--dim); }
  .inp-err { border-color:var(--red)!important; }
  select.inp { cursor:pointer; }

  /* Badge */
  .badge-new { position:absolute; top:8px; right:8px; background:var(--teal); color:white; font-size:10px; font-weight:700; letter-spacing:0.06em; padding:2px 8px; border-radius:3px; }

  /* Grids */
  .cat-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .why-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .footer-g  { display:grid; grid-template-columns:1.4fr 1fr 1fr 1.4fr; gap:36px; }
  .details-g { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
  .details-L { position:sticky; top:108px; height:fit-content; }
  .form-2c   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c    { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cart-g    { display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; }
  .contact-g { display:grid; grid-template-columns:1fr 1fr; gap:40px; }
  .pagination{ display:flex; justify-content:center; gap:6px; margin-top:40px; flex-wrap:wrap; }
  .cart-btns { display:flex; gap:12px; }

  /* News */
  .news-wrap { display:flex; border:1.5px solid var(--line); border-radius:6px; overflow:hidden; }
  .news-inp  { flex:1; padding:10px 12px; border:none; outline:none; font-family:'Inter',sans-serif; font-size:13px; color:var(--ink); }
  .news-btn  { padding:10px 14px; background:var(--blue); border:none; cursor:pointer; color:white; display:flex; align-items:center; transition:background 0.2s; }
  .news-btn:hover { background:var(--blue-2); }

  @media (max-width:1024px) {
    .cat-grid  { grid-template-columns:repeat(2,1fr); }
    .why-grid  { grid-template-columns:repeat(2,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:28px; }
  }
  @media (max-width:768px) {
    .why-grid  { grid-template-columns:repeat(2,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:24px; }
    .details-g { grid-template-columns:1fr; }
    .details-L { position:static; }
    .contact-g { grid-template-columns:1fr; }
    .cart-g    { grid-template-columns:1fr; }
    .cart-btns { flex-direction:column; }
  }
  @media (max-width:480px) {
    .cat-grid  { grid-template-columns:repeat(2,1fr); gap:10px; }
    .footer-g  { grid-template-columns:1fr; }
    .form-2c   { grid-template-columns:1fr; }
    .dlv-2c    { grid-template-columns:1fr; }
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

const INP = (err?: boolean): React.CSSProperties => ({
  width: '100%', padding: '10px 13px', background: 'var(--white)',
  border: `1.5px solid ${err ? 'var(--red)' : 'var(--line-dk)'}`,
  fontFamily: "'Inter',sans-serif", fontSize: '13px', color: 'var(--ink)',
  outline: 'none', borderRadius: '6px', transition: 'border-color 0.2s', appearance: 'none',
});

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '12px' }}>
    {label && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '6px' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: 4 }}>
      <AlertCircle style={{ width: '11px', height: '11px' }} />{error}
    </p>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--off)' }}>
      <style>{CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR — 3-tier medical style
══════════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sq, setSq] = useState('');
  const [ls, setLs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 2);
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
  const doSearch = (e?: React.FormEvent) => { if (e) e.preventDefault(); if (sq.trim()) { router.push(`/?search=${encodeURIComponent(sq)}`); setSq(''); } };

  const Drop = () => (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        left: 0,
        /* خلفية بيضاء صلبة */
        background: '#FFFFFF',
        border: '1px solid #EEEEEE',
        borderRadius: '12px',
        /* ظل ناعم واحترافي */
        boxShadow: '0 15px 45px rgba(0,0,0,0.1)',
        zIndex: 210,
        overflow: 'hidden',
      }}
      className="anim-slide-down"
    >
      {/* رأس القائمة بخلفية رمادية فاتحة جداً */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #F0F0F0',
        background: '#FAFAFA'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>نتائج البحث</span>
        <button
          type="button"
          onClick={() => setSq('')}
          style={{
            background: '#F0F0F0',
            border: 'none',
            color: '#555',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--fire)', fontWeight: 700, fontSize: '13px' }}>جاري البحث...</div>
        ) : ls.length > 0 ? (
          <div>
            {ls.map((p: any) => (
              <Link
                href={`/product/${p.id}`}
                key={p.id}
                onClick={() => setSq('')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderBottom: '1px solid #F5F5F5',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9F9F9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                <img
                  src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                  style={{ width: 44, height: 44, borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid #EEE' }}
                  alt={p.name}
                />
                <div style={{ flex: 1 }}>
                  <div className="line-clamp-1" style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>{p.name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--fire)', fontWeight: 800 }}>{p.price} دج</div>
                </div>
                <ArrowLeft size={14} style={{ color: '#CCC' }} />
              </Link>
            ))}

            {/* زر عرض الكل بلون أحمر رياضي ثابت */}
            <button
              onClick={() => doSearch()}
              style={{
                width: '100%',
                padding: '15px',
                background: 'var(--fire)',
                border: 'none',
                color: 'var(--blue)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              عرض جميع النتائج <ArrowLeft size={14} />
            </button>
          </div>
        ) : sq.length >= 2 && (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
            لا توجد نتائج لـ "{sq}"
          </div>
        )}
      </div>
    </div>
  );

  return (
    <header dir="rtl" style={{ position: 'sticky', top: 0, zIndex: 100, fontFamily: "'Inter',sans-serif" }}>
      {/* Ticker */}
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ backgroundColor: 'var(--blue)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '7px 0' }}>
          <div style={{ display: 'inline-block', animation: 'ticker 28s linear infinite' }}>
            {Array(8).fill(null).map((_, i) => <span key={i} style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: '0 48px' }}>
              ✅ {store.topBar.text}
            </span>)}
            {Array(8).fill(null).map((_, i) => <span key={`b${i}`} style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: '0 48px' }}>
              ✅ {store.topBar.text}
            </span>)}
          </div>
        </div>
      )}

      {/* Main bar */}
      <div style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--line)', boxShadow: scrolled ? '0 2px 10px rgba(15,23,42,0.07)' : 'none', transition: 'box-shadow 0.3s' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          {/* Burger */}
          <button onClick={() => setOpen(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid)', padding: '6px', display: 'flex', flexShrink: 0 }}>
            {open ? <X style={{ width: '22px', height: '22px' }} /> : <Menu style={{ width: '22px', height: '22px' }} />}
          </button>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {store?.design?.logoUrl
              ? <img src={store.design.logoUrl} alt={store.name} style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              : <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,var(--blue),var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartPulse style={{ width: '16px', height: '16px', color: 'white' }} />
                </div>
                <div>
                  <span className="pjs" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', display: 'block', lineHeight: 1 }}>{store?.name}</span>
                  <span style={{ fontSize: '9px', color: 'var(--teal)', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Para-medical</span>
                </div>
              </div>
            }
          </Link>

          {/* Search + cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', flex: '0 1 280px' }}>
              <form onSubmit={doSearch} style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--dim)' }} />
                <input type="text" placeholder="ابحث عن منتج..." value={sq} onChange={e => setSq(e.target.value)}
                  style={{ width: '100%', padding: '9px 34px 9px 12px', border: '1.5px solid var(--line-dk)', borderRadius: '6px', fontFamily: "'Inter',sans-serif", fontSize: '13px', color: 'var(--ink)', outline: 'none', backgroundColor: 'var(--off)' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = 'var(--line-dk)'; }} />
              </form>
              {sq.length >= 2 && <Drop />}
            </div>
            <Link href="/cart" style={{ position: 'relative', color: 'var(--mid)', display: 'flex', padding: '6px', transition: 'color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--blue)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mid)'; }}>
              <ShoppingCart style={{ width: '20px', height: '20px' }} />
              {count > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: '15px', height: '15px', backgroundColor: 'var(--blue)', color: 'white', fontSize: '9px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div style={{ maxHeight: open ? '280px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease', backgroundColor: 'var(--white)', borderBottom: open ? '1px solid var(--line)' : 'none' }}>
        <div style={{ padding: '8px 20px 16px' }}>
          {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل معنا' }, { h: '/cart', l: 'السلة' }].map((lnk, i) => (
            <Link key={i} href={lnk.h} onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', fontSize: '14px', fontWeight: 500, color: 'var(--mid)', borderBottom: '1px solid var(--line)' }}>
              {lnk.l} <ArrowLeft style={{ width: '13px', height: '13px', color: 'var(--teal)' }} />
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — 3 أقسام حقيقية من store.contact
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  const yr = new Date().getFullYear();
  return (
    <footer dir="rtl" style={{ backgroundColor: 'var(--ink)', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 20px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '40px', paddingBottom: '36px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          {/* قسم 1 */}
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              {store?.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store?.name} style={{ height: '28px', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
                : <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'linear-gradient(135deg,var(--blue),var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HeartPulse style={{ width: '12px', height: '12px', color: 'white' }} />
                  </div>
                  <span className="pjs" style={{ fontSize: '1rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>{store?.name}</span>
                </div>
              }
            </Link>
            <p style={{ fontSize: '13px', lineHeight: '1.75', color: 'rgba(255,255,255,0.4)', maxWidth: '260px', marginBottom: '16px' }}>
              {store?.hero?.subtitle?.substring(0, 80) || 'متجرك الطبي الموثوق. منتجات شبه طبية وأجهزة طبية بجودة مضمونة.'}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>© {yr} {store?.name}. جميع الحقوق محفوظة.</p>
          </div>

          {/* قسم 2 — روابط */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>روابط مفيدة</p>
            {[{ h: '/', l: 'الرئيسية' }, { h: '/cart', l: 'سلة التسوق' }, { h: '/contact', l: 'تواصل معنا' }, { h: '/Privacy', l: 'سياسة الخصوصية' }, { h: '/Terms', l: 'شروط الخدمة' }].map(lnk => (
              <a key={lnk.h} href={lnk.h} style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
                {lnk.l}
              </a>
            ))}
          </div>

          {/* قسم 3 — تواصل */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>تواصل معنا</p>
            {[
              { icon: <Phone style={{ width: '13px', height: '13px' }} />, val: store?.contact?.phone },
              { icon: <Mail style={{ width: '13px', height: '13px' }} />, val: store?.contact?.email },
              { icon: <MapPin style={{ width: '13px', height: '13px' }} />, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'rgba(255,255,255,0.45)' }}>
                {item.icon}<span style={{ fontSize: '12px' }}>{item.val}</span>
              </div>
            ))}
            <div style={{ marginTop: '14px', padding: '12px 14px', backgroundColor: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />
                <span className="pjs" style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>متاحون الآن</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>فريق متخصص · رد خلال 24 ساعة</p>
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
export function Card({ product, displayImage, discount, store, viewDetails, isNew }: any) {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;

  return (
    <div className="p-card" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', // يضمن أن الكارت يملأ كامل طول الخلية في الشبكة
      backgroundColor: 'var(--white)',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid var(--line)'
    }}>
      {/* Image Container */}
      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--slate)', flexShrink: 0 }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--slate),var(--blue-lt))' }}>
            <FlaskConical style={{ width: '40px', height: '40px', color: 'var(--blue)', opacity: 0.3 }} />
          </div>
        }
        {isNew && <span className="badge-new">جديد</span>}
        {discount > 0 && <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'var(--red)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px' }}>-{discount}%</span>}
      </div>

      {/* Content Container */}
      <div style={{ 
        padding: '12px', 
        flex: 1,           // هذا يجعل قسم المحتوى يتمدد لملء المساحة المتبقية
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px' 
      }}>
        {/* Title */}
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: 600, 
          color: 'var(--ink)', 
          lineHeight: 1.4, 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden', 
          margin: 0,
          minHeight: '2.8em' // يضمن حجز مساحة لسطرين حتى لو كان العنوان قصيراً
        }}>
          {product.name}
        </h3>

        {/* Rating */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '11px', height: '11px', fill: i < 4 ? '#F59E0B' : 'none', color: '#F59E0B' }} />)}
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>
            {price.toLocaleString()}
            <span style={{ fontSize: '10px', color: 'var(--dim)', marginRight: '2px' }}> دج</span>
          </span>
          {orig > price && <span style={{ fontSize: '11px', color: 'var(--dim)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
        </div>

        {/* Button - pushed to bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <Link href={`/product/${product.slug || product.id}`} className="btn-cart" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
            {viewDetails || 'عرض المنتج'}
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => { if (!scrollRef.current) return; scrollRef.current.scrollBy({ left: dir === 'left' ? 240 : -240, behavior: 'smooth' }); };

  const defaultCats = [
    { id: '1', name: 'أجهزة طبية', icon: <HeartPulse style={{ width: '28px', height: '28px' }} /> },
    { id: '2', name: 'العناية اليومية', icon: <FlaskConical style={{ width: '28px', height: '28px' }} /> },
    { id: '3', name: 'مكملات غذائية', icon: <Pill style={{ width: '28px', height: '28px' }} /> },
    { id: '4', name: 'أدوات تشخيص', icon: <Activity style={{ width: '28px', height: '28px' }} /> },
  ];
  const displayCats = cats.length > 0 ? cats.slice(0, 4) : [];

  return (
    <div dir="rtl">

      {/* ── HERO ── */}
      <section style={{ position: 'relative', width: '100%', overflow: 'hidden', backgroundColor: 'var(--slate)' }}>
        <div style={{ position: 'relative', aspectRatio: '16/6', minHeight: '260px' }}>
          {store.hero?.imageUrl
            ? <img src={store.hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0c2f6b 0%,#1A6ED4 40%,var(--teal) 100%)' }} />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(12,47,107,0.88) 0%,rgba(12,47,107,0.5) 55%,transparent 100%)', display: 'flex', alignItems: 'center' }}>
            <div className="fi" style={{ padding: '32px 5vw', zIndex: 2, maxWidth: 460 }}>
              {store?.design?.logoUrl && <img src={store.design.logoUrl} alt="" style={{ height: '36px', filter: 'brightness(0) invert(1)', opacity: 0.9, marginBottom: '12px', display: 'block' }} />}
              <h1 className="pjs" style={{ fontSize: 'clamp(1.6rem,5vw,3.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, marginBottom: '10px', letterSpacing: '-0.01em' }}>
                {store.hero?.title || 'شريكك الطبي الموثوق'}
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.78)', marginBottom: '22px', lineHeight: '1.7' }}>
                {store.hero?.subtitle || 'أجود المنتجات الشبه طبية والأجهزة الطبية بجودة موثّقة ومعتمدة.'}
              </p>
              <a href="#products" className="btn-blue" style={{ fontSize: '14px', padding: '11px 26px' }}>تسوق الآن</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {displayCats.length >0 && (
        <section style={{ padding: '40px 0', backgroundColor: 'var(--white)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <h2 className="pjs" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', textAlign: 'center', marginBottom: '24px' }}>الفئات المميزة</h2>
          <div className="cat-grid">
            {displayCats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} className="cat-card"
                style={{ aspectRatio: '4/3', backgroundColor: 'var(--blue-lt)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px 16px', textAlign: 'center' }}>
                {cat.imageUrl
                  ? <img src={cat.imageUrl} alt={cat.name} />
                  : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '14px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,110,212,0.12)', color: 'var(--blue)' }}>
                      {cat.icon || <Pill style={{ width: '28px', height: '28px' }} />}
                    </div>
                    <span className="pjs" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{cat.name}</span>
                  </div>
                }
                {cat.imageUrl && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(15,23,42,0.65),transparent)', padding: '16px', display: 'flex', alignItems: 'flex-end' }}>
                    <span className="pjs" style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{cat.name}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── PRODUCTS GRID ── */}
      <section id="products" style={{ padding: '60px 0', backgroundColor: 'var(--off)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px', textAlign: 'right' }}>
            <h2 className="pjs" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              الأكثر مبيعاً
            </h2>
            <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--blue)', marginTop: '8px', borderRadius: '2px' }}></div>
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <FlaskConical style={{ width: '48px', height: '48px', color: 'var(--dim)', opacity: 0.3, margin: '0 auto 16px', display: 'block' }} />
              <p className="pjs" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--dim)' }}>المنتجات قادمة قريباً</p>
            </div>
          ) : (
            <>
              {/* Grid System */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '24px',
                direction: 'rtl'
              }}>
                {products.map((p, i) => {
                  const img = p.imagesProduct?.[0]?.imageUrl || p.productImage;
                  const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                  return (
                    <div key={p.id} style={{ width: '100%' }}>
                      <Card
                        product={p}
                        displayImage={img}
                        discount={disc}
                        store={store}
                        viewDetails="عرض المنتج"
                        isNew={i < 2}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Pagination Section */}
              {countPage > 1 && (
                <div style={{
                  marginTop: '48px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  direction: 'rtl'
                }}>
                  {/* Prev Button */}
                  <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
                    style={{ width: 44, height: 44, border: '1.5px solid var(--line-dk)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyItems: 'center', borderRadius: 8, justifyContent: 'center', opacity: page <= 1 ? 0.4 : 1, pointerEvents: page <= 1 ? 'none' : 'auto' }}>
                    <ChevronRight style={{ width: 18 }} />
                  </Link>

                  {/* Page Numbers */}
                  {Array.from({ length: countPage }).map((_, i) => {
                    const pn = i + 1;
                    const isA = Number(page) === pn;
                    return (
                      <Link key={pn} href={{ query: { page: pn } }} scroll={false}
                        style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', border: `1.5px solid ${isA ? 'var(--blue)' : 'var(--line-dk)'}`, background: isA ? 'var(--blue)' : 'var(--white)', color: isA ? 'white' : 'var(--ink)', borderRadius: 8, transition: '0.2s' }}>
                        {pn}
                      </Link>
                    );
                  })}

                  {/* Next Button */}
                  <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
                    style={{ width: 44, height: 44, border: '1.5px solid var(--line-dk)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, opacity: page >= countPage ? 0.4 : 1, pointerEvents: page >= countPage ? 'none' : 'auto' }}>
                    <ChevronLeft style={{ width: 18 }} />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section style={{ padding: '48px 0', backgroundColor: 'var(--white)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <h2 className="pjs" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', textAlign: 'center', marginBottom: '28px' }}>
            لماذا تختار {store?.name}؟
          </h2>
          <div className="why-grid">
            {[
              { icon: <BadgeCheck style={{ width: '36px', height: '36px' }} />, color: 'var(--teal)', title: 'منتجات موثّقة', desc: 'منتجات معتمدة ومختارة بدقة من مصادر طبية موثوقة.' },
              { icon: <ShieldCheck style={{ width: '36px', height: '36px' }} />, color: 'var(--blue)', title: 'دفع آمن', desc: 'معاملات مشفّرة بالكامل لضمان أمان بياناتك.' },
              { icon: <Activity style={{ width: '36px', height: '36px' }} />, color: '#7C3AED', title: 'دعم متخصص', desc: 'فريق متخصص يرد في أسرع وقت على استفساراتك.' },
              { icon: <Truck style={{ width: '36px', height: '36px' }} />, color: 'var(--orange)', title: 'توصيل سريع', desc: 'توصيل عالي الجودة لجميع ولايات الجزائر.' },
            ].map((item, i) => (
              <div key={i} className="why-card">
                <div style={{ width: '72px', height: '72px', borderRadius: '18px', backgroundColor: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginBottom: '16px' }}>
                  {item.icon}
                </div>
                <h3 className="pjs" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: '1.65', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
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
    <div dir="rtl" style={{ backgroundColor: 'var(--off)' }}>


      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 20px' }}>
        <div className="details-g">
          {/* Gallery */}
          <div className="details-L">
            <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--line)', backgroundColor: 'var(--slate)', marginBottom: '10px' }}>
              <div style={{ aspectRatio: '1/1' }}>
                {allImages.length > 0
                  ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FlaskConical style={{ width: '64px', height: '64px', color: 'var(--blue)', opacity: 0.2 }} /></div>
                }
              </div>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right,var(--blue),var(--teal))' }} />
              {discount > 0 && <span style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'var(--red)', color: 'white', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '4px' }}>-{discount}%</span>}
              <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: 'rgba(13,148,136,0.9)', borderRadius: '14px', padding: '4px 11px' }}>
                <BadgeCheck style={{ width: '12px', height: '12px', color: 'white' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>منتج موثّق</span>
              </div>
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--line)', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--ink)' }} />
                  </button>
                  <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--line)', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft style={{ width: '14px', height: '14px', color: 'var(--ink)' }} />
                  </button>
                </>
              )}
              {!inStock && !autoGen && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248,250,252,0.88)', backdropFilter: 'blur(4px)', borderRadius: '10px' }}>
                  <span className="pjs" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--mid)' }}>نفد المخزون</span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px' }}>
                {allImages.slice(0, 5).map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSel(idx)} style={{ aspectRatio: '1/1', overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--blue)' : 'var(--line)'}`, cursor: 'pointer', padding: 0, background: 'none', borderRadius: '6px', opacity: sel === idx ? 1 : 0.6 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--blue-lt)', border: '1px solid rgba(26,110,212,0.18)', borderRadius: '5px', padding: '3px 10px', marginBottom: '10px' }}>
              <FlaskConical style={{ width: '11px', height: '11px', color: 'var(--blue)' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>منتج شبه طبي</span>
            </div>
            <h1 className="pjs" style={{ fontSize: 'clamp(1.3rem,2.5vw,2rem)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2, marginBottom: '12px' }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '14px', height: '14px', fill: i < 4 ? '#F59E0B' : 'none', color: '#F59E0B' }} />)}
              </div>
            </div>

            {/* Price */}
            <div style={{ padding: '16px 18px', backgroundColor: 'var(--blue-lt)', border: '1px solid rgba(26,110,212,0.15)', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <span className="pjs" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '14px', color: 'var(--mid)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <>
                    <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                    <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 700, backgroundColor: 'rgba(22,163,74,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                      وفّر {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString()} دج
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '10px' }}>الباقات</p>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', border: `1.5px solid ${selectedOffer === o.id ? 'var(--blue)' : 'var(--line)'}`, cursor: 'pointer', marginBottom: '7px', borderRadius: '8px', backgroundColor: selectedOffer === o.id ? 'var(--blue-lt)' : 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? 'var(--blue)' : 'var(--dim)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {selectedOffer === o.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)' }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>{o.name}</span>
                    </div>
                    <span className="pjs" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--blue)' }}>{o.price.toLocaleString()} دج</span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '8px' }}>{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: '26px', height: '26px', backgroundColor: v.value, border: 'none', cursor: 'pointer', borderRadius: '50%', outline: `3px solid ${s ? 'var(--blue)' : 'transparent'}`, outlineOffset: '3px' }} />; })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: '50px', height: '50px', overflow: 'hidden', border: `2px solid ${s ? 'var(--blue)' : 'var(--line-dk)'}`, cursor: 'pointer', padding: 0, borderRadius: '6px' }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>; })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '7px 14px', border: `1.5px solid ${s ? 'var(--blue)' : 'var(--line-dk)'}`, backgroundColor: s ? 'var(--blue)' : 'transparent', color: s ? 'white' : 'var(--mid)', fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s' }}>{v.name}</button>; })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {product.desc && (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '10px' }}>معلومات المنتج</p>
                <div style={{ fontSize: '14px', lineHeight: '1.85', color: 'var(--mid)' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
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
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = 'رقم هاتف غير صالح (مثال: 0550123456)';
    if (!fd.customerWelaya) e.customerWelaya = 'الولاية مطلوبة';
    if (!fd.customerCommune) e.customerCommune = 'البلدية مطلوبة';
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
    setTimeout(() => setIsAdded(false), 2000);
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

  const onF = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = 'var(--blue)'; };
  const onB = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, err?: boolean) => { e.target.style.borderColor = err ? 'var(--red)' : 'var(--line-dk)'; };

  return (
    <div dir="rtl">
      {/* Cart + Order buttons */}
      {product.store?.cart && (
        <div className="cart-btns" style={{ marginBottom: '20px' }}>
          <button onClick={addToCart} disabled={isAdded}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: '8px', border: isAdded ? '2px solid var(--green)' : '2px solid var(--line-dk)', backgroundColor: isAdded ? 'rgba(22,197,94,0.05)' : 'var(--white)', color: isAdded ? 'var(--green)' : 'var(--ink)', cursor: isAdded ? 'default' : 'pointer', fontWeight: 700, transition: 'all 0.3s ease', fontFamily: 'inherit' }}>
            {isAdded
              ? <><CheckCircle2 size={18} className="anim-check" style={{ color: 'var(--green)' }} /><span>تمت الإضافة!</span></>
              : <><ShoppingCart size={18} /><span>أضف للسلة</span></>
            }
          </button>
          <button onClick={() => setIsOrderNow(true)} className="btn-blue" style={{ flex: 1, borderRadius: '8px', padding: '12px', boxShadow: '0 4px 10px rgba(26,110,212,0.2)' }}>
            <Zap size={18} /> طلب الآن
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--line)', animation: 'fadeIn 0.3s ease-in-out' }}>
          {product.store?.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', margin: 0 }}>بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--line-dk)', background: 'transparent', color: 'var(--dim)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 5 }}>
                <X style={{ width: '10px', height: '10px' }} /> إلغاء
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.customerName} label="الاسم">
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل"
                    style={{ ...INP(!!errors.customerName), paddingLeft: '32px' }}
                    onFocus={onF} onBlur={e => onB(e, !!errors.customerName)} />
                </div>
              </FR>
              <FR error={errors.customerPhone} label="الهاتف">
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0X XX XX XX XX"
                    style={{ ...INP(!!errors.customerPhone), paddingLeft: '32px' }}
                    onFocus={onF} onBlur={e => onB(e, !!errors.customerPhone)} />
                </div>
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}
                    style={{ ...INP(!!errors.customerWelaya), paddingRight: '30px' }}
                    onFocus={onF} onBlur={e => onB(e, !!errors.customerWelaya)}>
                    <option value="">اختر الولاية</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })}
                    style={{ ...INP(!!errors.customerCommune), paddingRight: '30px', opacity: !fd.customerWelaya ? 0.4 : 1 }}
                    onFocus={onF} onBlur={e => onB(e, !!errors.customerCommune)}>
                    <option value="">{loadingC ? '...' : 'اختر البلدية'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="التوصيل">
              <div className="dlv-2c">
                {(['home', 'office'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))}
                    style={{ padding: '11px 10px', border: `1.5px solid ${fd.typeLivraison === type ? 'var(--blue)' : 'var(--line-dk)'}`, backgroundColor: fd.typeLivraison === type ? 'var(--blue-lt)' : 'transparent', cursor: 'pointer', textAlign: 'right', borderRadius: '7px', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: fd.typeLivraison === type ? 'var(--blue)' : 'var(--mid)', margin: '0 0 3px' }}>{type === 'home' ? '🏠 للبيت' : '🏢 للمكتب'}</p>
                    {selW && <p className="pjs" style={{ fontSize: '0.95rem', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--blue)' : 'var(--dim)', margin: 0 }}>
                      {(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج
                    </p>}
                  </button>
                ))}
              </div>
            </FR>

            <FR label="الكمية">
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line-dk)', borderRadius: '7px', overflow: 'hidden' }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--off)', cursor: 'pointer', color: 'var(--ink)', borderLeft: '1px solid var(--line-dk)', fontSize: '16px', fontWeight: 600 }}>-</button>
                <span className="pjs" style={{ width: '44px', textAlign: 'center', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--off)', cursor: 'pointer', color: 'var(--ink)', borderRight: '1px solid var(--line-dk)', fontSize: '16px', fontWeight: 600 }}>+</button>
              </div>
            </FR>

            {/* Summary */}
            <div style={{ border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden', marginBottom: '13px' }}>
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--slate)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Activity style={{ width: '13px', height: '13px', color: 'var(--blue)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--mid)' }}>ملخص الطلب</span>
              </div>
              {[{ l: 'المنتج', v: product.name.slice(0, 22) + (product.name.length > 22 ? '...' : '') }, { l: 'السعر', v: `${fp.toLocaleString()} دج` }, { l: 'الكمية', v: `× ${fd.quantity}` }, { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' }].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 14px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--white)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--dim)' }}>{row.l}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', backgroundColor: 'var(--blue-lt)' }}>
                <span style={{ fontSize: '13px', color: 'var(--mid)' }}>المجموع</span>
                <span className="pjs" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue)' }}>
                  {total().toLocaleString()} <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: '12px', color: 'var(--dim)' }}>دج</span>
                </span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-blue" style={{ width: '100%', fontSize: '15px', padding: '13px', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1, borderRadius: '7px', marginBottom: '10px' }}>
              {sub ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> جاري المعالجة...</> : <>تأكيد الطلب <ArrowLeft style={{ width: '15px', height: '15px' }} /></>}
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {[{ icon: <Lock style={{ width: '11px', height: '11px' }} />, label: 'دفع آمن' }, { icon: <ShieldCheck style={{ width: '11px', height: '11px' }} />, label: 'بيانات مشفّرة' }, { icon: <BadgeCheck style={{ width: '11px', height: '11px' }} />, label: 'موثّق ومعتمد' }].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--dim)', fontWeight: 500 }}>
                  <span style={{ color: 'var(--blue)' }}>{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
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
    if (!fd.customerName.trim()) er.name = 'الاسم مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = 'رقم هاتف غير صالح (مثال: 0550123456)';
    if (!fd.customerWelaya) er.welaya = 'الولاية مطلوبة';
    if (!fd.customerCommune) er.commune = 'البلدية مطلوبة';
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  if (success) return (
    <div dir="rtl" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--white)', borderRadius: '10px', border: '1px solid var(--line)' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <CheckCircle2 size={40} style={{ color: 'var(--green)' }} />
      </div>
      <h2 className="pjs" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '12px' }}>تم استلام طلبك بنجاح!</h2>
      <p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '24px' }}>شكراً لثقتك. سنتصل بك خلال 24 ساعة.</p>
      <Link href="/" className="btn-blue" style={{ display: 'inline-flex', borderRadius: '8px', padding: '12px 28px' }}>العودة للمتجر</Link>
    </div>
  );

  if (!items.length) return (
    <div dir="rtl" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--white)', borderRadius: '10px', border: '1px solid var(--line)' }}>
      <ShoppingBag size={48} style={{ color: 'var(--dim)', marginBottom: '16px', opacity: 0.5, display: 'block', margin: '0 auto 16px' }} />
      <h3 className="pjs" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>السلة فارغة</h3>
      <Link href="/" className="btn-blue" style={{ display: 'inline-flex', borderRadius: '8px', padding: '12px 28px' }}>تسوق الآن</Link>
    </div>
  );

  return (
    <div dir="rtl">
      <div className="cart-g">
        {/* Items */}
        <div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '10px', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={20} style={{ color: 'var(--blue)' }} />
              <h3 className="pjs" style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>منتجاتك ({items.length})</h3>
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '15px', padding: '20px', borderBottom: '1px solid var(--line)', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(241,245,249,0.5)' }}>
                <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} alt="" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--line)', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{item.product?.name}</h4>
                  <p className="pjs" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--blue)', margin: 0 }}>{item.finalPrice?.toLocaleString()} دج</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line-dk)', borderRadius: '6px', overflow: 'hidden' }}>
                      <button onClick={() => changeQty(i, -1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--off)', cursor: 'pointer', borderLeft: '1px solid var(--line-dk)' }}>
                        <Minus size={14} style={{ color: 'var(--ink)' }} />
                      </button>
                      <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{item.quantity}</span>
                      <button onClick={() => changeQty(i, 1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--off)', cursor: 'pointer', borderRight: '1px solid var(--line-dk)' }}>
                        <Plus size={14} style={{ color: 'var(--ink)' }} />
                      </button>
                    </div>
                    <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ marginRight: 'auto', background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', fontFamily: 'inherit', transition: 'background 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.06)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      <Trash2 size={16} /> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ padding: '16px 20px', backgroundColor: 'var(--blue-lt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--mid)', fontSize: '14px', fontWeight: 600 }}>المجموع الفرعي:</span>
              <span className="pjs" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--blue)' }}>{cartTotal.toLocaleString()} دج</span>
            </div>
          </div>
        </div>

        {/* Checkout */}
        <div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '10px', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={20} style={{ color: 'var(--blue)' }} />
              <h3 className="pjs" style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>معلومات التوصيل</h3>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{ label: 'الاسم الكامل', type: 'text', key: 'customerName', icon: <User size={16} />, err: 'name', ph: 'مثال: محمد أحمد' }, { label: 'رقم الهاتف', type: 'tel', key: 'customerPhone', icon: <Phone size={16} />, err: 'phone', ph: '0XXXXXXXXX' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '6px', display: 'block' }}>{f.label} *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }}>{f.icon}</span>
                    <input type={f.type} value={(fd as any)[f.key]} onChange={e => setFd({ ...fd, [f.key]: e.target.value })} placeholder={f.ph}
                      style={{ ...INP(!!(errors as any)[f.err]), paddingLeft: '40px' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = (errors as any)[f.err] ? 'var(--red)' : 'var(--line-dk)'; }} />
                  </div>
                  {(errors as any)[f.err] && <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} />{(errors as any)[f.err]}</p>}
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[{ label: 'الولاية', key: 'customerWelaya', err: 'welaya', opts: wilayas.map(w => ({ value: w.id, label: `${w.id} - ${w.ar_name}` })) }, { label: 'البلدية', key: 'customerCommune', err: 'commune', opts: communes.map(c => ({ value: c.id, label: c.ar_name })), disabled: loadingC || !fd.customerWelaya }].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '6px', display: 'block' }}>{f.label} *</label>
                    <div style={{ position: 'relative' }}>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                      <select value={(fd as any)[f.key]} disabled={f.disabled} onChange={e => setFd({ ...fd, [f.key]: e.target.value, ...(f.key === 'customerWelaya' ? { customerCommune: '' } : {}) })}
                        style={{ ...INP(!!(errors as any)[f.err]), paddingRight: '36px', cursor: f.disabled ? 'not-allowed' : 'pointer', opacity: f.disabled ? 0.6 : 1 }}
                        onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = (errors as any)[f.err] ? 'var(--red)' : 'var(--line-dk)'; }}>
                        <option value="">{f.disabled && loadingC ? '...' : f.key === 'customerWelaya' ? 'اختر الولاية' : 'اختر البلدية'}</option>
                        {f.opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery type */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '10px', display: 'block' }}>نوع التوصيل</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {(['home', 'office'] as const).map(type => (
                    <button key={type} type="button" onClick={() => setFd({ ...fd, typeLivraison: type })} style={{ padding: '14px', borderRadius: '8px', border: fd.typeLivraison === type ? '2px solid var(--blue)' : '1.5px solid var(--line-dk)', background: fd.typeLivraison === type ? 'var(--blue-lt)' : 'transparent', cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: fd.typeLivraison === type ? 'var(--blue)' : 'var(--mid)' }}>{type === 'home' ? '🏠 للبيت' : '🏢 للمكتب'}</div>
                      <div className="pjs" style={{ fontSize: '15px', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--blue)' : 'var(--dim)' }}>{selW ? `${(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج` : '---'}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{ padding: '18px', background: 'var(--blue-lt)', borderRadius: '8px', border: '1px solid rgba(26,110,212,0.15)' }}>
                {[{ l: 'المجموع الفرعي', v: `${cartTotal.toLocaleString()} دج` }, { l: 'رسوم التوصيل', v: getLiv() ? `${getLiv().toLocaleString()} دج` : '---' }].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--mid)' }}>{r.l}</span>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '20px', borderTop: '1px solid var(--line)', paddingTop: '14px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  <span style={{ color: 'var(--ink)' }}>الإجمالي:</span>
                  <span style={{ color: 'var(--blue)' }}>{finalTotal.toLocaleString()} دج</span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-blue" style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري المعالجة...</span>
                  : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><CheckCircle2 size={18} /> تأكيد الطلب الآن</span>
                }
              </button>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {[{ icon: <Lock size={12} />, label: 'دفع آمن' }, { icon: <ShieldCheck size={12} />, label: 'بيانات مشفّرة' }, { icon: <BadgeCheck size={12} />, label: 'موثّق ومعتمد' }].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--dim)' }}>
                    <span style={{ color: 'var(--blue)' }}>{b.icon}</span>{b.label}
                  </div>
                ))}
              </div>
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

const Shell = ({ children, title, sub }: { children: React.ReactNode; title: string; sub?: string }) => (
  <div dir="rtl" style={{ backgroundColor: 'var(--off)', minHeight: '100vh' }}>
    <div style={{ backgroundColor: 'var(--white)', padding: '48px 20px 36px', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right,var(--blue),var(--teal))' }} />
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {sub && <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '8px' }}>{sub}</p>}
        <h1 className="pjs" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.6rem)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px 72px' }}>
      <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '10px', padding: '28px' }}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start' }}>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '7px' }}>
        <ShieldCheck style={{ width: '14px', height: '14px', color: 'var(--blue)', flexShrink: 0 }} /> {title}
      </h3>
      <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--mid)', margin: 0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', backgroundColor: 'var(--blue-lt)', border: '1px solid rgba(26,110,212,0.2)', color: 'var(--blue)', borderRadius: '20px', flexShrink: 0 }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="// قانوني">
      <IB title="البيانات التي نجمعها" body="فقط اسمك ورقم هاتفك وعنوان التوصيل — الحد الأدنى اللازم لمعالجة طلبك." />
      <IB title="كيف نستخدمها" body="حصرياً لتنفيذ وتوصيل مشترياتك. لا استخدام تجاري لبياناتك." />
      <IB title="الأمان" body="بياناتك محمية بتشفير على مستوى المؤسسات وبنية تحتية آمنة." />
      <IB title="مشاركة البيانات" body="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين." tag="مضمون" />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الخدمة" sub="// قانوني">
      <IB title="الطلبات والمدفوعات" body="لا رسوم مخفية. السعر المعروض هو السعر النهائي الإجمالي." />
      <IB title="المنتجات الأصيلة" body="منتجات أصيلة وموثّقة فقط. لا مجال للمقلدات أو غير المعتمدة." tag="صارم" />
      <IB title="القانون الحاكم" body="تخضع هذه الشروط لقوانين الجمهورية الجزائرية الديمقراطية الشعبية." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات الارتباط" sub="// قانوني">
      <IB title="الكوكيز الأساسية" body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب" />
      <IB title="كوكيز التفضيلات" body="تحفظ لغتك ومنطقتك لتجربة أفضل." tag="اختياري" />
      <IB title="كوكيز التحليلات" body="بيانات مجمعة لتحسين المنصة. لا بيانات شخصية." tag="اختياري" />
      <div style={{ marginTop: '14px', padding: '13px 15px', border: '1px solid rgba(26,110,212,0.18)', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start', backgroundColor: 'var(--blue-lt)' }}>
        <ToggleRight style={{ width: '17px', height: '17px', color: 'var(--blue)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.75', margin: 0 }}>يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح في أي وقت.</p>
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store?: any }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // تنسيق الحقول الافتراضي
  const INP = () => ({
    width: '100%',
    padding: '12px 14px',
    backgroundColor: 'var(--white)',
    border: '1px solid var(--line)',
    fontSize: '14px',
    color: 'var(--ink)',
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id });
      setSent(true);
    } catch {
      showError('حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  const onF = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--blue)';
  };
  const onB = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--line)';
  };

  return (
    <div dir="rtl" style={{ backgroundColor: 'var(--off)', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ backgroundColor: 'var(--navy)', padding: '64px 24px 48px', borderBottom: '3px solid var(--blue)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }} className="dot-bg" />
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <p className="bc" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.24em', color: 'var(--blue)', marginBottom: '10px' }}>// تواصل</p>
          <h1 className="bc" style={{ fontSize: 'clamp(2.5rem,7vw,6rem)', fontWeight: 800, letterSpacing: '0.04em', color: 'white', lineHeight: 0.88, margin: '0 0 12px' }}>تواصل معنا</h1>
          <p className="bc" style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)' }}>نرد خلال 24 ساعة</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Contact Info Sidebar */}
        <div>
          <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', padding: '24px', marginBottom: '12px' }}>
            <p className="bc" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--blue)', marginBottom: '18px' }}>// طرق التواصل</p>
            {[
              { icon: <Phone size={18} />, label: 'الهاتف', val: store?.contact?.phone },
              { icon: <Mail size={18} />, label: 'البريد', val: store?.contact?.email },
              { icon: <MapPin size={18} />, label: 'الموقع', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 0', borderBottom: '1px solid var(--line)', transition: 'padding-right 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.paddingRight = '8px'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.paddingRight = '0'; }}>
                <div style={{ width: '38px', height: '38px', backgroundColor: 'var(--off)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--blue)', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: 'var(--navy)', padding: '20px 22px' }}>
            <p className="bc" style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.08em', color: 'white', lineHeight: 1.4, margin: '0 0 6px' }}>
              دعم فني متميز.<br /><span style={{ color: 'var(--blue)' }}>نحن هنا للمساعدة.</span>
            </p>
            <span className="bc" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)' }}>PURECARE SUPPORT SYSTEM</span>
          </div>
        </div>

        {/* Message Form */}
        <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', padding: '28px' }}>
          <p className="bc" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--blue)', marginBottom: '22px' }}>// أرسل رسالة</p>
          {sent ? (
            <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', textAlign: 'center', backgroundColor: 'var(--off)', padding: '32px' }}>
              <CheckCircle2 style={{ width: '32px', height: '32px', color: 'var(--blue)', marginBottom: '14px' }} />
              <h3 className="bc" style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--navy)', margin: '0 0 8px' }}>تم الإرسال بنجاح!</h3>
              <p style={{ fontSize: '13px', color: 'var(--mid)' }}>شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-2c" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--mid)', marginBottom: '6px' }}>الاسم</p>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={INP()} onFocus={onF} onBlur={onB} />
                </div>
                <div>
                  <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--mid)', marginBottom: '6px' }}>الهاتف</p>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={INP()} onFocus={onF} onBlur={onB} />
                </div>
              </div>
              <div>
                <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--mid)', marginBottom: '6px' }}>البريد الإلكتروني</p>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={INP()} onFocus={onF} onBlur={onB} />
              </div>
              <div>
                <p className="bc" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--mid)', marginBottom: '6px' }}>رسالتك</p>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="كيف يمكننا مساعدتك؟" rows={4} required
                  style={{ ...INP(), resize: 'none' }} onFocus={onF} onBlur={onB} />
              </div>
              <button type="submit" disabled={loading} className="btn-blue" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%', fontSize: '15px', padding: '13px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', color: 'white', fontWeight: 600 }}>
                {loading ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> جاري الإرسال...</> : <>إرسال الرسالة <ArrowLeft style={{ width: '14px', height: '14px' }} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}