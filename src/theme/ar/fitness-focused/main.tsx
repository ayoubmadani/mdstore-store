'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ShoppingCart, ShoppingBag, Truck, Shield, Package,
  ChevronDown, ChevronLeft, ChevronRight, Building2,
  AlertCircle, Check, X, Infinity, Share2, MapPin, Phone,
  User, ShieldCheck, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Smile, Gift, Zap, Sparkles, Rainbow, Mail,
  ArrowRight, Music, Rocket, Minus, Plus, Loader2, Trash2,
  BadgeCheck, Search, Menu, Dumbbell, Flame, Target, Trophy,
  Timer, TrendingUp, Award, Activity, Crosshair,
} from 'lucide-react';
import { Store } from '@/types/store';
import { useCartStore } from '@/store/useCartStore';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&family=Rajdhani:wght@500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --bg:       #08080D;
    --bg-2:     #0E0E16;
    --bg-3:     #151520;
    --panel:    #12121C;
    --lime:     #C6F135;
    --lime-dk:  #9BC41A;
    --red:      #FF3D00;
    --red-dk:   #CC3100;
    --orange:   #FF8C00;
    --white:    #EEEEF0;
    --mid:      #7A7A8E;
    --dim:      #3D3D50;
    --border:   rgba(198,241,53,0.1);
    --border-r: rgba(255,61,0,0.12);
    --glow-l:   0 0 20px rgba(198,241,53,0.35);
    --glow-r:   0 0 20px rgba(255,61,0,0.35);
  }

  body { background: var(--bg); color: var(--white); font-family: 'Inter', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--lime), var(--red)); border-radius: 2px; }

  .osw  { font-family: 'Oswald', sans-serif; }
  .raj  { font-family: 'Rajdhani', sans-serif; }

  /* ── Patterns ── */
  .grid-floor {
    background-image:
      linear-gradient(rgba(198,241,53,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(198,241,53,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .speed-lines {
    background-image: repeating-linear-gradient(
      -45deg, transparent, transparent 40px,
      rgba(198,241,53,0.02) 40px, rgba(198,241,53,0.02) 41px
    );
  }
  .diagonal-stripe {
    background: repeating-linear-gradient(
      -45deg, transparent, transparent 8px,
      rgba(198,241,53,0.06) 8px, rgba(198,241,53,0.06) 9px
    );
  }

  /* ── Neon Classes ── */
  .neon-lime { color: var(--lime); text-shadow: 0 0 12px rgba(198,241,53,0.6), 0 0 40px rgba(198,241,53,0.2); }
  .neon-red  { color: var(--red);  text-shadow: 0 0 12px rgba(255,61,0,0.6), 0 0 40px rgba(255,61,0,0.2); }

  /* ── Animations ── */
  @keyframes pulse-lime {
    0%,100% { box-shadow: 0 0 8px rgba(198,241,53,0.3), inset 0 0 8px rgba(198,241,53,0.05); }
    50%     { box-shadow: 0 0 28px rgba(198,241,53,0.7), inset 0 0 16px rgba(198,241,53,0.1); }
  }
  @keyframes pulse-red {
    0%,100% { box-shadow: 0 0 8px rgba(255,61,0,0.3); }
    50%     { box-shadow: 0 0 28px rgba(255,61,0,0.7); }
  }
  @keyframes fade-up { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scan-line { 0% { transform:translateY(-100%); } 100% { transform:translateY(200vh); } }
  @keyframes spin-slow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes energy-pulse {
    0%,100% { opacity: 0.4; transform: scale(1); }
    50%     { opacity: 0.8; transform: scale(1.05); }
  }
  @keyframes count-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slide-in-right { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
  @keyframes cartBounce { 0% { transform:scale(1); } 50% { transform:scale(1.06); } 100% { transform:scale(1); } }
  @keyframes checkAppear { 0% { transform:scale(0) rotate(-45deg); opacity:0; } 100% { transform:scale(1) rotate(0); opacity:1; } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes bar-fill { from { width: 0%; } to { width: 100%; } }

  .fu     { animation: fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1   { animation-delay: 0.1s; }
  .fu-2   { animation-delay: 0.2s; }
  .fu-3   { animation-delay: 0.35s; }
  .fu-4   { animation-delay: 0.5s; }
  .animate-cart  { animation: cartBounce 0.4s ease-in-out; }
  .animate-check { animation: checkAppear 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }

  /* ── Card ── */
  .f-card {
    background: var(--bg-3); border: 1px solid var(--border); overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-color 0.3s;
    cursor: pointer; position: relative;
  }
  .f-card::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(198,241,53,0.04) 0%, transparent 50%, rgba(255,61,0,0.04) 100%);
    opacity: 0; transition: opacity 0.3s; pointer-events: none;
  }
  .f-card:hover { transform: translateY(-8px); border-color: var(--lime); box-shadow: var(--glow-l); }
  .f-card:hover::after { opacity: 1; }
  .f-card:hover .f-card-img img { transform: scale(1.08); }
  .f-card-img img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.22,1,0.36,1); }

  /* ── Buttons ── */
  .btn-lime {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--lime); color: var(--bg);
    font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 14px;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 14px 32px; border: none; cursor: pointer; text-decoration: none;
    transition: all 0.25s; box-shadow: 0 4px 20px rgba(198,241,53,0.3);
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
  }
  .btn-lime:hover { box-shadow: 0 6px 32px rgba(198,241,53,0.6); transform: translateY(-2px); }

  .btn-red {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, var(--red-dk), var(--red));
    color: white; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 14px;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 14px 32px; border: none; cursor: pointer; text-decoration: none;
    transition: all 0.25s; box-shadow: 0 4px 20px rgba(255,61,0,0.3);
    clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
  }
  .btn-red:hover { box-shadow: 0 6px 32px rgba(255,61,0,0.6); transform: translateY(-2px); }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: var(--lime); border: 1px solid var(--lime);
    font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 13px;
    letter-spacing: 0.06em; text-transform: uppercase;
    padding: 13px 28px; cursor: pointer; text-decoration: none; transition: all 0.25s;
  }
  .btn-ghost:hover { background: rgba(198,241,53,0.08); box-shadow: var(--glow-l); }

  /* ── Inputs ── */
  .inp {
    width: 100%; padding: 13px 16px; background: var(--bg-2);
    border: 1px solid var(--dim); font-family: 'Inter', sans-serif;
    font-size: 14px; color: var(--white); outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .inp:focus { border-color: var(--lime); box-shadow: 0 0 0 3px rgba(198,241,53,0.12); }
  .inp::placeholder { color: var(--dim); }
  .inp-err { border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(255,61,0,0.1) !important; }
  select.inp { appearance: none; cursor: pointer; }
  select.inp option { background: var(--bg-2); color: var(--white); }

  /* ── Section Label ── */
  .slabel {
    font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.25em; text-transform: uppercase; color: var(--lime);
    display: flex; align-items: center; gap: 10px;
  }
  .slabel::before { content: '//'; color: var(--red); font-family: 'Rajdhani', sans-serif; }

  /* ── Barcode Divider ── */
  .barcode-divider {
    display: flex; align-items: center; gap: 4px; height: 24px; overflow: hidden;
  }
  .barcode-divider .bar {
    height: 100%; background: var(--dim); opacity: 0.3;
  }

  /* ── Cart Badge ── */
  .cart-badge {
    position: absolute; top: -6px; left: -6px;
    min-width: 18px; height: 18px; border-radius: 2px;
    background: var(--red); color: white;
    font-size: 10px; font-weight: 800; font-family: 'Rajdhani', sans-serif;
    display: flex; align-items: center; justify-content: center; padding: 0 4px;
    box-shadow: 0 0 10px rgba(255,61,0,0.6);
  }

  /* ── Responsive ── */
  .nav-links  { display: flex; align-items: center; gap: 28px; }
  .nav-toggle { display: none; }
  .prod-grid  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .cat-grid   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .trust-bar  { display: grid; grid-template-columns: repeat(4, 1fr); }
  .footer-g   { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
  .details-g  { display: grid; grid-template-columns: 1fr 1fr; }
  .details-L  { padding: 20px 0; position: sticky; top: 70px; height: calc(100vh - 70px); overflow: hidden; }
  .details-R  { padding: 20px 32px; overflow-y: auto; }
  .contact-g  { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
  .form-2c    { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .dlv-2c     { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .cart-g     { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }

  @media (max-width: 1100px) {
    .prod-grid { grid-template-columns: repeat(3, 1fr); }
    .footer-g  { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width: 768px) {
    .nav-links  { display: none; }
    .nav-toggle { display: flex; }
    .prod-grid  { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .cat-grid   { grid-template-columns: repeat(2, 1fr); }
    .trust-bar  { grid-template-columns: repeat(2, 1fr); }
    .footer-g   { grid-template-columns: 1fr 1fr; gap: 24px; }
    .details-g  { grid-template-columns: 1fr; }
    .details-L  { padding: 0; position: static; width: 100%; height: auto; aspect-ratio: 1; margin-bottom: 20px; display: flex; flex-direction: column; gap: 16px; }
    .details-R  { padding: 20px 0; }
    .contact-g  { grid-template-columns: 1fr; gap: 28px; }
    .cart-g     { grid-template-columns: 1fr; }
    .form-2c    { grid-template-columns: 1fr; }
    .dlv-2c     { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .prod-grid { grid-template-columns: 1fr; gap: 10px; }
    .footer-g  { grid-template-columns: 1fr; }
  }
`;

// ─────────────────────────────────────────────────────────────
// DECORATIVE COMPONENTS
// ─────────────────────────────────────────────────────────────
function BarcodeDivider() {
  const bars = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      w: Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1,
      h: 60 + Math.random() * 40,
      o: 0.15 + Math.random() * 0.2,
    })), []);
  return (
    <div className="barcode-divider" style={{ margin: '16px 0', justifyContent: 'center' }}>
      {bars.map((b, i) => (
        <div key={i} className="bar" style={{ width: b.w, height: `${b.h}%`, opacity: b.o, background: i % 5 === 0 ? 'var(--lime)' : 'var(--dim)' }} />
      ))}
    </div>
  );
}

function NeonDivider({ color = 'lime' }: { color?: 'lime' | 'red' }) {
  const c = color === 'lime' ? 'var(--lime)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '10px 0' }}>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left,${c},transparent)` }} />
      <div style={{ width: '8px', height: '2px', background: c, boxShadow: `0 0 10px ${c}` }} />
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right,${c},transparent)` }} />
    </div>
  );
}

function EnergyOrb({ color = 'var(--lime)', size = 300, x = '50%', y = '50%' }: any) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`, pointerEvents: 'none', animation: 'energy-pulse 4s ease-in-out infinite' }} />
  );
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Offer     { id: string; name: string; quantity: number; price: number; }
interface Variant   { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color'|'image'|'text'|null; variants: Variant[]; }
interface ProductImage          { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color'|'image'|'text'; value: string; }
interface VariantDetail         { id: string|number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya  { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
export interface Product {
  id: string; name: string; price: string|number; priceOriginal?: string|number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string|null; setSelectedOffer: (id: string|null) => void;
  selectedVariants: Record<string,string>; platform?: string; priceLoss?: number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function variantMatches(d: VariantDetail, sel: Record<string,string>): boolean {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas  = async (uid: string): Promise<Wilaya[]>  => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }} className="speed-lines">
      <style>{CSS}</style>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, var(--lime), transparent)', opacity: 0.3, pointerEvents: 'none', zIndex: 9999, animation: 'scan-line 8s linear infinite' }} />
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const itemsCartCount = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { const stored = localStorage.getItem(domain); const items = JSON.parse(stored || '[]'); initCount(Array.isArray(items) ? items.length : 0); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); setListSearch(data.products || []); } catch {} finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { router.push(`https://${domain}/?search=${encodeURIComponent(searchQuery)}`); setListSearch([]); setShowSearch(false); }
  };

  useEffect(() => { const h = () => setScrolled(window.scrollY > 8); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const DropResults = () => (
    <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, background: 'rgba(14,14,22,0.98)', border: '1px solid var(--border)', zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', marginTop: '4px', overflow: 'hidden' }}>
      {loading ? <div style={{ padding: '16px', color: 'var(--lime)', textAlign: 'center', fontSize: '12px', fontFamily: "'Rajdhani',sans-serif", letterSpacing: '0.1em' }}>جاري البحث...</div>
        : listSearch.length > 0 ? listSearch.map((p: any) => (
          <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSearchQuery('')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none' }}>
            <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border)' }} alt="" />
            <div style={{ flex: 1 }}><div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{p.name}</div><div style={{ color: 'var(--lime)', fontSize: '11px', fontFamily: "'Rajdhani',sans-serif" }}>{p.price} دج</div></div>
          </Link>
        )) : searchQuery.length >= 2 && <div style={{ padding: '16px', color: 'var(--mid)', textAlign: 'center', fontSize: '12px' }}>لا توجد نتائج</div>}
    </div>
  );

  return (
    <nav dir="rtl" style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(8,8,13,0.97)' : 'rgba(8,8,13,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', transition: 'all 0.3s' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          {store?.design?.logoUrl
            ? <img src={store.design.logoUrl} style={{ height: '30px' }} alt={store.name} />
            : <><Dumbbell size={20} style={{ color: 'var(--lime)' }} /><span className="osw neon-lime" style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.06em' }}>{store?.name}</span></>}
        </Link>
        <div className="nav-links" style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
          <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
            <input type="text" placeholder="ابحث عن منتج..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '9px 38px 9px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: '#fff', outline: 'none', fontFamily: "'Inter',sans-serif", fontSize: '13px', borderRadius: '2px' }} />
            <Search size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--lime)' }} />
          </form>
          {searchQuery.length >= 2 && <DropResults />}
        </div>
        <div className="nav-links">
          <Link href="/" style={{ color: 'var(--mid)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em' }}>المتجر</Link>
          <Link href="/contact" style={{ color: 'var(--mid)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em' }}>تواصل</Link>
          <Link href="/cart" style={{ position: 'relative', color: 'var(--mid)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', border: '1px solid var(--border)', borderRadius: '2px', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--lime)'; (e.currentTarget as HTMLElement).style.color = 'var(--lime)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--mid)'; }}>
            <ShoppingCart size={17} />{itemsCartCount > 0 && <span className="cart-badge">{itemsCartCount}</span>}
          </Link>
          <a href="#products" className="btn-lime" style={{ padding: '9px 20px', fontSize: '12px' }}>تسوق الآن</a>
        </div>
        <div style={{ display: 'none', gap: '10px' }} className="nav-toggle">
          <Link href="/cart" style={{ position: 'relative', background: 'none', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--lime)', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <ShoppingCart size={19} />{itemsCartCount > 0 && <span className="cart-badge">{itemsCartCount}</span>}
          </Link>
          <button onClick={() => setShowSearch(!showSearch)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--lime)', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={18} /></button>
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--lime)', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {showSearch && (
        <div style={{ padding: '12px 20px', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', position: 'relative' }}>
          <form onSubmit={handleSearchSubmit}><input autoFocus type="text" placeholder="ابحث هنا..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '13px 40px', background: 'var(--bg)', border: '1px solid var(--lime)', color: '#fff', fontFamily: "'Inter',sans-serif", borderRadius: '2px', outline: 'none' }} /><Search size={16} style={{ position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)', color: 'var(--lime)' }} /></form>
          {searchQuery.length >= 2 && <DropResults />}
        </div>
      )}
      <div style={{ maxHeight: open ? '200px' : '0', overflow: 'hidden', transition: 'all 0.3s', background: 'var(--bg-2)' }}>
        <div style={{ padding: '12px 20px' }}>
          {[{ h: '/', l: 'المتجر' }, { h: '/contact', l: 'تواصل معنا' }].map(item => (
            <Link key={item.h} href={item.h} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', color: '#fff', textDecoration: 'none', borderBottom: '1px solid var(--border)', fontSize: '14px', fontWeight: 600 }}>{item.l}<ArrowRight size={14} style={{ color: 'var(--lime)' }} /></Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
export function Footer({ store }: any) {
  const yr = new Date().getFullYear();
  return (
    <footer dir="rtl" style={{ backgroundColor: 'var(--bg-2)', borderTop: '1px solid var(--border)', marginTop: '80px', position: 'relative', overflow: 'hidden' }} className="grid-floor">
      <EnergyOrb color="var(--lime)" size={400} x="-10%" y="20%" />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 20px 30px', position: 'relative', zIndex: 2 }}>
        <div className="footer-g" style={{ paddingBottom: '40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '8px', border: '1px solid var(--lime)', borderRadius: '2px', background: 'rgba(198,241,53,0.06)' }}><Dumbbell style={{ width: '22px', height: '22px', color: 'var(--lime)' }} /></div>
              <span className="osw" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--white)' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--mid)', maxWidth: '320px' }}>{store?.hero?.subtitle?.substring(0, 90) || 'معدات رياضية ومكملات غذائية بأعلى جودة. ابدأ رحلتك نحو اللياقة معنا.'}</p>
            <BarcodeDivider />
          </div>
          {[
            { title: 'روابط سريعة', links: [['/', 'المتجر'], ['/cart', 'السلة'], ['/contact', 'الدعم'], ['/Privacy', 'الخصوصية'], ['/Terms', 'الشروط']] },
            { title: 'تواصل معنا', links: [[`tel:${store.contact?.phone}`, store.contact?.phone || '—'], ['#', store.contact?.wilaya || '—']] },
          ].map(col => (
            <div key={col.title}>
              <p className="slabel" style={{ marginBottom: '24px' }}>{col.title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {col.links.map(([href, label]) => (
                  <a key={label} href={href as string} style={{ fontSize: '13px', color: 'var(--mid)', textDecoration: 'none', transition: 'all 0.25s', display: 'inline-block', fontWeight: 500 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lime)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(-5px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mid)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; }}>{label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--dim)' }}>© {yr} <span style={{ color: 'var(--lime)' }}>{store?.name}</span>. جميع الحقوق محفوظة.</p>
          <span className="raj" style={{ fontSize: '11px', color: 'var(--dim)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Fitness Engine v1.0</span>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [hov, setHov] = useState(false);
  if (!product || !store) return null;
  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number) || 0;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="f-card" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '4px' }}>
      <div className="f-card-img" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--bg-2)' }}>
        {displayImage ? <img src={displayImage} alt={product.name} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Dumbbell style={{ width: '36px', height: '36px', color: 'var(--dim)' }} /></div>}
        {discount > 0 && <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--red)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '2px', boxShadow: 'var(--glow-r)', zIndex: 10, fontFamily: "'Rajdhani',sans-serif", letterSpacing: '0.1em' }}>-{discount}%</div>}
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 1 }}>
        <h3 className="osw" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--white)', marginBottom: '12px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden', letterSpacing: '0.02em' }}>{product.name}</h3>
        <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>{[...Array(5)].map((_, i) => <Star key={i} style={{ width: '11px', height: '11px', fill: i < 4 ? 'var(--lime)' : 'none', color: 'var(--lime)' }} />)}</div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="raj neon-lime" style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1 }}>{price.toLocaleString()}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mid)' }}>دج</span>
            {orig > price && <span style={{ fontSize: '11px', color: 'var(--dim)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
          <Link href={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', fontSize: '12px', fontWeight: 700, padding: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: hov ? 'var(--lime)' : 'transparent', color: hov ? 'var(--bg)' : 'var(--lime)', border: '1px solid var(--lime)', boxShadow: hov ? 'var(--glow-l)' : 'none', transition: 'all 0.25s', borderRadius: '2px', fontFamily: "'Oswald',sans-serif" }}>{viewDetails}<ArrowRight style={{ width: '14px', height: '14px' }} /></Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────
export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  const trust = [
    { icon: <Truck style={{ width: '20px', height: '20px' }} />, color: 'var(--lime)', title: 'توصيل 58 ولاية', desc: 'نوصل لكل مكان' },
    { icon: <Shield style={{ width: '20px', height: '20px' }} />, color: 'var(--red)', title: 'منتجات أصلية', desc: 'ضمان الجودة' },
    { icon: <Trophy style={{ width: '20px', height: '20px' }} />, color: 'var(--orange)', title: 'أسعار منافسة', desc: 'أفضل العروض' },
    { icon: <Zap style={{ width: '20px', height: '20px' }} />, color: 'var(--lime)', title: 'شحن سريع', desc: 'توصيل سريع' },
  ];

  return (
    <div dir="rtl">
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden', backgroundColor: 'var(--bg)' }} className="grid-floor">
        {store.hero?.imageUrl && <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}><img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2, display: 'block' }} /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(8,8,13,0.95) 30%, rgba(8,8,13,0.3) 100%)' }} /></div>}
        <EnergyOrb color="var(--lime)" size="60vw" x="-15%" y="-10%" />
        <EnergyOrb color="var(--red)" size="40vw" x="60%" y="50%" />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 20px 60px', position: 'relative', zIndex: 10, width: '100%' }}>
          <div className="fu" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1px solid var(--border)', borderRadius: '2px', padding: '6px 16px', marginBottom: '24px', background: 'rgba(8,8,13,0.8)', backdropFilter: 'blur(4px)' }}>
            <Flame style={{ width: '14px', height: '14px', color: 'var(--red)' }} />
            <span className="raj" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--lime)', textTransform: 'uppercase' }}>{store.name}</span>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', animation: 'pulse-red 2s ease-in-out infinite' }} />
          </div>
          <h1 className="fu fu-1 osw" style={{ fontWeight: 700, fontSize: 'clamp(2.8rem,8vw,6rem)', lineHeight: 1, marginBottom: '8px', letterSpacing: '0.02em' }}>
            <span className="neon-lime">ارتقِ</span> بمستواك
          </h1>
          <h1 className="fu fu-2 osw" style={{ fontWeight: 700, fontSize: 'clamp(2rem,5vw,4rem)', lineHeight: 1.1, marginBottom: '16px', color: 'var(--mid)', letterSpacing: '0.02em' }}>
            بالقوة <span className="neon-red">والإرادة</span>
          </h1>
          <BarcodeDivider />
          <p className="fu fu-3" style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--mid)', marginBottom: '36px', maxWidth: '480px', fontWeight: 400 }}>
            {store.hero?.subtitle || 'معدات رياضية احترافية ومكملات غذائية أصلية. كل ما تحتاجه لتحقيق أهدافك اللياقية.'}
          </p>
          <div className="fu fu-4" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <a href="#products" className="btn-lime" style={{ fontSize: '15px', padding: '15px 36px', textDecoration: 'none' }}><Dumbbell style={{ width: '16px', height: '16px' }} /> تسوق الآن</a>
            <Link href="/cart" className="btn-ghost" style={{ fontSize: '14px', padding: '14px 30px', textDecoration: 'none' }}><ShoppingCart style={{ width: '15px', height: '15px' }} /> السلة</Link>
          </div>
          <div style={{ display: 'flex', gap: '40px', marginTop: '52px', paddingTop: '32px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {[{ n: `${products.length}+`, l: 'منتج متاح', c: 'var(--lime)' }, { n: '58', l: 'ولاية توصيل', c: 'var(--red)' }, { n: '100%', l: 'منتجات أصلية', c: 'var(--orange)' }].map((s, i) => (
              <div key={i}><p className="raj" style={{ fontSize: '2.4rem', fontWeight: 700, color: s.c, lineHeight: 1, margin: 0, textShadow: `0 0 20px ${s.c}60` }}>{s.n}</p><p style={{ fontSize: '12px', color: 'var(--mid)', margin: '4px 0 0', fontWeight: 500 }}>{s.l}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }} className="trust-bar">
          {trust.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ color: item.color, flexShrink: 0 }}>{item.icon}</div>
              <div><p className="osw" style={{ fontSize: '14px', fontWeight: 600, color: item.color, margin: 0, letterSpacing: '0.04em' }}>{item.title}</p><p style={{ fontSize: '11px', color: 'var(--mid)', margin: 0 }}>{item.desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <section id="categories" style={{ padding: '80px 0', backgroundColor: 'var(--bg)', position: 'relative' }} className="diagonal-stripe">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
              <div>
                <div className="slabel" style={{ marginBottom: '12px' }}>الفئات</div>
                <h2 className="osw" style={{ fontWeight: 700, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'var(--white)', margin: 0 }}>تصفح حسب <span className="neon-red">القسم</span></h2>
              </div>
            </div>
            <div className="cat-grid">
              {cats.slice(0, 8).map((cat: any, i: number) => (
                <Link key={cat.id} href={`?category=${cat.id}`} style={{ position: 'relative', display: 'block', textDecoration: 'none', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '16/10', backgroundColor: 'var(--bg-3)', transition: 'all 0.3s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lime)'; el.style.boxShadow = 'var(--glow-l)'; el.style.transform = 'translateY(-6px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.boxShadow = 'none'; el.style.transform = 'translateY(0)'; }}>
                  {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.5 }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)' }}><Dumbbell style={{ width: '32px', height: '32px', color: 'var(--dim)' }} /></div>}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,13,0.9) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '16px' }}>
                    <span className="osw" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--white)', letterSpacing: '0.04em' }}>{cat.name}</span>
                  </div>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '2px', background: i % 2 === 0 ? 'var(--lime)' : 'var(--red)' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" style={{ padding: '64px 0', backgroundColor: 'var(--bg-2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div><div className="slabel" style={{ marginBottom: '10px' }}>المنتجات</div><h2 className="osw" style={{ fontWeight: 700, fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'var(--white)', margin: 0 }}>كل <span className="neon-lime">المنتجات</span></h2></div>
            <p className="raj" style={{ fontSize: '13px', color: 'var(--dim)' }}>{page} / {countPage}</p>
          </div>
          {products.length === 0
            ? <div style={{ padding: '80px 0', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--panel)' }}><Dumbbell style={{ width: '48px', height: '48px', color: 'var(--dim)', margin: '0 auto 16px' }} /><p className="osw" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--mid)' }}>المنتجات قادمة قريباً</p></div>
            : <div className="prod-grid">{products.map((p: any) => { const img = p.productImage || p.imagesProduct?.[0]?.imageUrl || store?.design?.logoUrl; const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0; return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض المنتج" />; })}</div>}
          {countPage > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12" dir="rtl">
              <Link href={{ query: { ...Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')), page: Math.max(1, page - 1) } }} scroll={false} className={`flex items-center justify-center w-10 h-10 transition-colors rounded-sm ${Number(page) === 1 ? 'pointer-events-none opacity-20' : ''}`} style={{ border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--lime)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </Link>
              {Array.from({ length: Math.ceil(countPage) }).map((_, i) => { const pn = i + 1; const isActive = Number(page) === pn; return (<Link key={pn} href={{ query: { ...Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')), page: pn } }} scroll={false} className="raj flex items-center justify-center w-10 h-10 rounded-sm font-bold text-sm transition-all" style={{ border: `1px solid ${isActive ? 'var(--lime)' : 'var(--border)'}`, background: isActive ? 'var(--lime)' : 'var(--bg-3)', color: isActive ? 'var(--bg)' : 'var(--mid)', boxShadow: isActive ? 'var(--glow-l)' : 'none' }}>{pn}</Link>); })}
              <Link href={{ query: { ...Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')), page: Math.min(Math.ceil(countPage), Number(page) + 1) } }} scroll={false} className={`flex items-center justify-center w-10 h-10 transition-colors rounded-sm ${Number(page) >= Math.ceil(countPage) ? 'pointer-events-none opacity-20' : ''}`} style={{ border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--lime)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', padding: '80px 20px', overflow: 'hidden', backgroundColor: 'var(--bg)' }} className="grid-floor">
        <EnergyOrb color="var(--red)" size="50vw" x="30%" y="-20%" />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <NeonDivider color="red" />
          <p className="raj" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', color: 'var(--red)', marginBottom: '16px', textTransform: 'uppercase' }}>// لا تستسلم</p>
          <h2 className="osw" style={{ fontWeight: 700, fontSize: 'clamp(2rem,6vw,4rem)', color: 'var(--white)', lineHeight: 1.05, marginBottom: '16px' }}>النتيجة تبدأ <span className="neon-lime">بالخطوة الأولى</span></h2>
          <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--mid)', marginBottom: '32px' }}>اطلب الآن وابدأ تحويل حياتك</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#products" className="btn-lime" style={{ fontSize: '14px', padding: '14px 32px', textDecoration: 'none' }}><Dumbbell style={{ width: '15px', height: '15px' }} /> تسوق الآن</a>
            <Link href="/contact" className="btn-red" style={{ fontSize: '14px', padding: '14px 32px', textDecoration: 'none' }}><Phone style={{ width: '15px', height: '15px' }} /> تواصل معنا</Link>
          </div>
          <NeonDivider color="lime" />
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAILS
// ─────────────────────────────────────────────────────────────
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [sel, setSel] = useState(0);
  return (
    <div dir="rtl" style={{ backgroundColor: 'var(--bg)' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '11px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--dim)', backgroundColor: 'var(--bg-2)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--dim)', transition: 'color 0.2s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lime)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--dim)'; }}>الرئيسية</Link>
        <ChevronLeft style={{ width: '12px', height: '12px', transform: 'rotate(180deg)' }} />
        <span style={{ color: 'var(--lime)', fontWeight: 600 }}>{product.name.slice(0, 40)}</span>
        <div style={{ marginRight: 'auto', display: 'flex', gap: '8px' }}>
          <button onClick={toggleWishlist} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isWishlisted ? 'var(--red)' : 'var(--border)'}`, background: isWishlisted ? 'rgba(255,61,0,0.1)' : 'transparent', cursor: 'pointer', color: isWishlisted ? 'var(--red)' : 'var(--mid)', borderRadius: '2px' }}><Heart style={{ width: '13px', height: '13px', fill: isWishlisted ? 'currentColor' : 'none' }} /></button>
          <button onClick={handleShare} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--mid)', borderRadius: '2px' }}><Share2 style={{ width: '13px', height: '13px' }} /></button>
        </div>
      </div>
      <div className="details-g" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div className="details-L">
          <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '4px' }}>
            {allImages.length > 0 ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Dumbbell style={{ width: '56px', height: '56px', color: 'var(--dim)' }} /></div>}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,13,0.6) 0%, transparent 50%)', pointerEvents: 'none' }} />
            {discount > 0 && <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--red)', color: '#fff', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '2px', boxShadow: 'var(--glow-r)', fontFamily: "'Rajdhani',sans-serif", letterSpacing: '0.1em' }}>-{discount}%</div>}
            {allImages.length > 1 && <><button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '34px', height: '34px', border: '1px solid var(--lime)', borderRadius: '2px', background: 'rgba(8,8,13,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime)' }}><ChevronRight style={{ width: '14px', height: '14px' }} /></button><button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '34px', height: '34px', border: '1px solid var(--lime)', borderRadius: '2px', background: 'rgba(8,8,13,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime)' }}><ChevronLeft style={{ width: '14px', height: '14px' }} /></button></>}
            {!inStock && !autoGen && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,8,13,0.85)', backdropFilter: 'blur(4px)' }}><span className="osw neon-red" style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.1em' }}>نفد المخزون</span></div>}
          </div>
          {allImages.length > 1 && <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>{allImages.slice(0, 5).map((img: string, idx: number) => (<button key={idx} onClick={() => setSel(idx)} style={{ width: '52px', height: '52px', overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--lime)' : 'var(--border)'}`, cursor: 'pointer', padding: 0, background: 'none', borderRadius: '2px', opacity: sel === idx ? 1 : 0.5, boxShadow: sel === idx ? 'var(--glow-l)' : 'none' }}><img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>))}</div>}
        </div>
        <div className="details-R">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '4px', padding: '24px', marginTop: '24px' }}>
            <div className="slabel" style={{ marginBottom: '10px' }}>المنتج</div>
            <h1 className="osw" style={{ fontWeight: 700, fontSize: 'clamp(1.4rem,3vw,2.2rem)', color: 'var(--white)', lineHeight: 1.15, marginBottom: '14px', letterSpacing: '0.02em' }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '2px' }}>{[...Array(5)].map((_, i) => <Star key={i} style={{ width: '13px', height: '13px', fill: i < 4 ? 'var(--lime)' : 'none', color: 'var(--lime)' }} />)}</div>
              <span style={{ fontSize: '12px', color: 'var(--mid)' }}>4.8 (128 تقييم)</span>
              <span style={{ marginRight: 'auto', padding: '4px 12px', borderRadius: '2px', backgroundColor: inStock || autoGen ? 'rgba(198,241,53,0.1)' : 'rgba(255,61,0,0.1)', color: inStock || autoGen ? 'var(--lime)' : 'var(--red)', fontSize: '11px', fontWeight: 700, border: `1px solid ${inStock || autoGen ? 'var(--lime)' : 'var(--red)'}`, fontFamily: "'Rajdhani',sans-serif", letterSpacing: '0.08em' }}>{autoGen ? '∞ متوفر' : inStock ? 'متوفر' : 'نفد'}</span>
            </div>
            <div style={{ marginBottom: '20px', padding: '18px', background: 'var(--bg-3)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <p className="raj" style={{ fontSize: '11px', color: 'var(--dim)', letterSpacing: '0.16em', margin: '0 0 8px', textTransform: 'uppercase' }}>السعر</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <span className="raj neon-lime" style={{ fontSize: '2.8rem', fontWeight: 700, lineHeight: 1 }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '15px', color: 'var(--mid)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (<><span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span><span style={{ fontSize: '11px', background: 'var(--red)', color: '#fff', padding: '2px 8px', borderRadius: '2px', fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", letterSpacing: '0.08em' }}>وفّر {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString()} دج</span></>)}
              </div>
            </div>
            {product.offers?.length > 0 && (<div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}><p className="raj" style={{ fontSize: '11px', color: 'var(--lime)', letterSpacing: '0.16em', marginBottom: '10px', textTransform: 'uppercase' }}>الباقات</p>{product.offers.map((offer: any) => (<label key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1px solid ${selectedOffer === offer.id ? 'var(--lime)' : 'var(--border)'}`, cursor: 'pointer', marginBottom: '8px', borderRadius: '4px', transition: 'all 0.2s', backgroundColor: selectedOffer === offer.id ? 'rgba(198,241,53,0.04)' : 'transparent', boxShadow: selectedOffer === offer.id ? 'var(--glow-l)' : 'none' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '16px', height: '16px', border: `2px solid ${selectedOffer === offer.id ? 'var(--lime)' : 'var(--dim)'}`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{selectedOffer === offer.id && <div style={{ width: '8px', height: '8px', borderRadius: '1px', background: 'var(--lime)' }} />}</div><input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} style={{ display: 'none' }} /><div><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', margin: 0 }}>{offer.name}</p><p style={{ fontSize: '11px', color: 'var(--mid)', margin: 0 }}>الكمية: {offer.quantity}</p></div></div><span className="raj neon-lime" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{offer.price.toLocaleString()} <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: '11px', color: 'var(--mid)' }}>دج</span></span></label>))}</div>)}
            {allAttrs.map((attr: any) => (<div key={attr.id} style={{ marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid var(--border)' }}><p className="raj" style={{ fontSize: '11px', color: 'var(--lime)', letterSpacing: '0.16em', marginBottom: '10px', textTransform: 'uppercase' }}>{attr.name}</p>{attr.displayMode === 'color' ? (<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: '30px', height: '30px', backgroundColor: v.value, border: 'none', cursor: 'pointer', borderRadius: '2px', outline: s ? '2px solid var(--lime)' : '2px solid transparent', outlineOffset: '3px', boxShadow: s ? 'var(--glow-l)' : 'none' }} />; })}</div>) : attr.displayMode === 'image' ? (<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: '52px', height: '52px', overflow: 'hidden', border: `2px solid ${s ? 'var(--lime)' : 'var(--border)'}`, cursor: 'pointer', padding: 0, borderRadius: '2px', boxShadow: s ? 'var(--glow-l)' : 'none' }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>; })}</div>) : (<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '9px 18px', border: `1px solid ${s ? 'var(--lime)' : 'var(--border)'}`, backgroundColor: s ? 'rgba(198,241,53,0.08)' : 'transparent', color: s ? 'var(--lime)' : 'var(--mid)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '2px', transition: 'all 0.2s', boxShadow: s ? 'var(--glow-l)' : 'none' }}>{v.name}</button>; })}</div>)}</div>))}
            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
            {product.desc && (<div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}><p className="raj" style={{ fontSize: '11px', color: 'var(--lime)', letterSpacing: '0.16em', marginBottom: '12px', textTransform: 'uppercase' }}>الوصف</p><div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--mid)' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} /></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCT FORM
// ─────────────────────────────────────────────────────────────
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '12px' }}>
    {label && <p className="raj" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--lime)', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle style={{ width: '11px', height: '11px' }} />{error}</p>}
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
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId: id })); } }, []);
  useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => { const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number; const off = product.offers?.find((o: any) => o.id === selectedOffer); if (off) return off.price; if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) { const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants)); if (m && m.price !== -1) return m.price; } return base; }, [product, selectedOffer, selectedVariants]);
  const getLiv = useCallback((): number => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
  useEffect(() => { if (selW) setFd(f => ({ ...f, priceLoss: selW.livraisonReturn })); }, [selW]);

  const fp = getFP();
  const total = () => fp * fd.quantity + +getLiv();
  const validate = () => { const e: Record<string, string> = {}; if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب'; if (!fd.customerPhone.trim()) e.customerPhone = 'الهاتف مطلوب'; if (!fd.customerWelaya) e.customerWelaya = 'الولاية مطلوبة'; if (!fd.customerCommune) e.customerCommune = 'البلدية مطلوبة'; return e; };
  const getVariantDetailId = useCallback(() => { if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined; return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id; }, [product.variantDetails, selectedVariants]);

  const addToCart = () => { setIsOrderNow(false); setIsAdded(true); const existing = localStorage.getItem(domain); const cart = existing ? JSON.parse(existing) : []; cart.push({ ...fd, product, variantDetailId: getVariantDetailId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: new Date().getTime() }); localStorage.setItem(domain, JSON.stringify(cart)); initCount(cart.length); setTimeout(() => setIsAdded(false), 2000); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); const er = validate(); if (Object.keys(er).length) { setErrors(er); return; } setErrors({}); setSub(true); try { await axios.post(`${API_URL}/orders/create`, { ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVariantDetailId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() }); if (typeof window !== 'undefined' && fd.customerId) localStorage.setItem('customerId', fd.customerId); router.push(`/lp/${domain}/successfully`); } catch (err) { console.error(err); } finally { setSub(false); } };

  return (
    <div style={{ direction: 'rtl', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
      {product.store.cart && (<div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={addToCart} disabled={isAdded} className={isAdded ? 'animate-cart' : ''} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '2px', cursor: isAdded ? 'default' : 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 700, transition: 'all 0.3s', border: isAdded ? '1px solid var(--lime)' : '1px solid var(--lime)', backgroundColor: isAdded ? 'rgba(198,241,53,0.08)' : 'transparent', color: isAdded ? 'var(--lime)' : 'var(--lime)', boxShadow: isAdded ? 'var(--glow-l)' : 'none' }}>{isAdded ? <><CheckCircle2 size={17} className="animate-check" /><span className="animate-check">تمت الإضافة!</span></> : <><ShoppingCart size={17} /><span>أضف للسلة</span></>}</button>
        <button onClick={() => setIsOrderNow(true)} className="btn-red" style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '14px', cursor: 'pointer' }}><Zap size={17} /> طلب الآن</button>
      </div>)}
      {(isOrderNow || !product.store.cart) && (<div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
        {product.store.cart && (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}><p className="raj" style={{ fontSize: '10px', color: 'var(--lime)', letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0 }}>// بيانات التوصيل</p><button onClick={() => setIsOrderNow(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--mid)', cursor: 'pointer', padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><X size={12} /> إلغاء</button></div>)}
        <form onSubmit={handleSubmit}>
          <div className="form-2c">
            <FR error={errors.customerName} label="الاسم"><div style={{ position: 'relative' }}><User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} /><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" className={`inp${errors.customerName ? ' inp-err' : ''}`} style={{ paddingLeft: '36px' }} /></div></FR>
            <FR error={errors.customerPhone} label="الهاتف"><div style={{ position: 'relative' }}><Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} /><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0X XX XX XX XX" className={`inp${errors.customerPhone ? ' inp-err' : ''}`} style={{ paddingLeft: '36px' }} /></div></FR>
          </div>
          <div className="form-2c">
            <FR error={errors.customerWelaya} label="الولاية"><div style={{ position: 'relative' }}><ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} /><select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} className={`inp${errors.customerWelaya ? ' inp-err' : ''}`} style={{ paddingRight: '34px' }}><option value="">اختر الولاية</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}</select></div></FR>
            <FR error={errors.customerCommune} label="البلدية"><div style={{ position: 'relative' }}><ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} /><select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} className={`inp${errors.customerCommune ? ' inp-err' : ''}`} style={{ paddingRight: '34px', opacity: !fd.customerWelaya ? 0.4 : 1 }}><option value="">{loadingC ? '...' : 'اختر البلدية'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}</select></div></FR>
          </div>
          <FR label="التوصيل"><div className="dlv-2c">{(['home', 'office'] as const).map(type => (<button key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))} style={{ padding: '14px', border: `1px solid ${fd.typeLivraison === type ? 'var(--lime)' : 'var(--border)'}`, borderRadius: '2px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', backgroundColor: fd.typeLivraison === type ? 'rgba(198,241,53,0.04)' : 'transparent', boxShadow: fd.typeLivraison === type ? 'var(--glow-l)' : 'none' }}><p className="raj" style={{ fontSize: '10px', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--lime)' : 'var(--mid)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{type === 'home' ? 'للبيت' : 'للمكتب'}</p>{selW && <p className="raj" style={{ fontSize: '1.1rem', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--lime)' : 'var(--dim)', margin: 0 }}>{(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()}<span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: '11px', marginRight: '3px', color: 'var(--mid)' }}>دج</span></p>}</button>))}</div></FR>
          <FR label="الكمية"><div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden', backgroundColor: 'var(--bg-3)' }}><button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderLeft: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--lime)', transition: 'background 0.18s' }}><Minus style={{ width: '12px', height: '12px' }} /></button><span className="raj" style={{ width: '44px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--white)' }}>{fd.quantity}</span><button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRight: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--lime)', transition: 'background 0.18s' }}><Plus style={{ width: '12px', height: '12px' }} /></button></div></FR>
          <div style={{ border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '14px', overflow: 'hidden', backgroundColor: 'var(--bg-3)' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(198,241,53,0.03)' }}><Package style={{ width: '13px', height: '13px', color: 'var(--lime)' }} /><span className="raj" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--lime)', textTransform: 'uppercase' }}>ملخص الطلب</span></div>
            {[{ l: 'المنتج', v: product.name.slice(0, 22) }, { l: 'السعر', v: `${fp.toLocaleString()} دج` }, { l: 'الكمية', v: `× ${fd.quantity}` }, { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' }].map(row => (<div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--border)' }}><span style={{ fontSize: '12px', color: 'var(--mid)' }}>{row.l}</span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)' }}>{row.v}</span></div>))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px', background: 'rgba(198,241,53,0.03)' }}><span className="raj" style={{ fontSize: '12px', color: 'var(--mid)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>المجموع</span><span className="raj neon-lime" style={{ fontSize: '2.2rem', fontWeight: 700 }}>{total().toLocaleString()} <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: '12px', color: 'var(--mid)' }}>دج</span></span></div>
          </div>
          <button type="submit" disabled={sub} className="btn-lime" style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1, clipPath: 'none', borderRadius: '2px' }}>{sub ? '⚡ جاري المعالجة...' : '✅ تأكيد الطلب'}</button>
          <p style={{ fontSize: '11px', color: 'var(--dim)', textAlign: 'center', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><Lock style={{ width: '10px', height: '10px', color: 'var(--lime)' }} /> دفع آمن ومشفر</p>
        </form>
      </div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────
export function Cart({ domain, store }: { domain: string; store: any }) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => { const saved = localStorage.getItem(domain); if (saved) setCartItems(JSON.parse(saved)); if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [domain, store]);
  useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLivPrice = useCallback(() => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
  const finalTotal = cartTotal + +getLivPrice();
  const updateCart = (n: any[]) => { setCartItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };
  const removeItem = (i: number) => updateCart(cartItems.filter((_, idx) => idx !== i));
  const changeQty = (i: number, d: number) => { const n = [...cartItems]; n[i].quantity = Math.max(1, n[i].quantity + d); updateCart(n); };
  const validate = () => { const e: Record<string, string> = {}; if (!fd.customerName.trim()) e.name = 'الاسم مطلوب'; if (!fd.customerPhone.trim()) e.phone = 'الهاتف مطلوب'; if (!fd.customerWelaya) e.welaya = 'الولاية مطلوبة'; if (!fd.customerCommune) e.commune = 'البلدية مطلوبة'; setErrors(e); return Object.keys(e).length === 0; };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!validate()) return; setSubmitting(true); try { await axios.post(`${API_URL}/orders/create`, cartItems.map(item => ({ ...fd, productId: item.productId, storeId: item.storeId, userId: item.userId, selectedOffer: item.selectedOffer, variantDetailId: item.variantDetailId, selectedVariants: item.selectedVariants, platform: item.platform || 'store', finalPrice: item.finalPrice, totalPrice: finalTotal, priceLivraison: +getLivPrice(), quantity: item.quantity, customerId: item.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 }))); setSuccess(true); localStorage.removeItem(domain); setCartItems([]); initCount(0); } catch (err) { console.error(err); } finally { setSubmitting(false); } };

  if (success) return (<div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}><div className="fu fu-1" style={{ textAlign: 'center', background: 'var(--panel)', border: '1px solid var(--lime)', borderRadius: '4px', padding: '60px 40px', boxShadow: 'var(--glow-l)', maxWidth: '480px', width: '100%' }}><div style={{ width: '80px', height: '80px', borderRadius: '2px', border: '2px solid var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--glow-l)', background: 'rgba(198,241,53,0.06)' }}><CheckCircle2 size={40} style={{ color: 'var(--lime)' }} /></div><p className="raj" style={{ fontSize: '11px', color: 'var(--red)', letterSpacing: '0.2em', marginBottom: '12px', textTransform: 'uppercase' }}>// ORDER CONFIRMED</p><h2 className="osw" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--white)', margin: '0 0 10px', letterSpacing: '0.04em' }}>تم استلام طلبك!</h2><p style={{ color: 'var(--mid)', fontSize: '14px', lineHeight: '1.7', marginBottom: '28px' }}>شكراً لثقتك. سنتصل بك قريباً 🏋️</p><Link href="/" className="btn-lime" style={{ textDecoration: 'none', justifyContent: 'center' }}><Dumbbell size={16} /> العودة للمتجر</Link></div></div>);
  if (cartItems.length === 0) return (<div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}><div className="fu fu-1" style={{ textAlign: 'center', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '4px', padding: '60px 40px', maxWidth: '420px', width: '100%' }}><ShoppingBag size={48} style={{ color: 'var(--dim)', margin: '0 auto 20px', display: 'block', opacity: 0.5 }} /><p className="raj" style={{ fontSize: '11px', color: 'var(--lime)', letterSpacing: '0.2em', marginBottom: '10px' }}>// EMPTY CART</p><h3 className="osw" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--white)', marginBottom: '16px', letterSpacing: '0.04em' }}>السلة فارغة</h3><p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '24px' }}>أضف منتجات للبدء</p><Link href="/" className="btn-lime" style={{ textDecoration: 'none', justifyContent: 'center' }}><Dumbbell size={16} /> تسوق الآن</Link></div></div>);

  return (<div dir="rtl" style={{ minHeight: '100vh', padding: '32px 20px 80px', background: 'var(--bg)' }}><div style={{ maxWidth: '1280px', margin: '0 auto' }}>
    <div className="fu" style={{ marginBottom: '32px' }}><p className="raj" style={{ fontSize: '11px', color: 'var(--red)', letterSpacing: '0.2em', marginBottom: '8px', textTransform: 'uppercase' }}>// SHOPPING CART</p><h1 className="osw" style={{ fontWeight: 700, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'var(--white)', margin: 0, letterSpacing: '0.04em' }}>سلة <span className="neon-lime">التسوق</span></h1><NeonDivider color="lime" /></div>
    <div className="cart-g fu fu-1">
      <div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(198,241,53,0.03)', display: 'flex', alignItems: 'center', gap: '10px' }}><Package size={16} style={{ color: 'var(--lime)' }} /><span className="raj" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--lime)', textTransform: 'uppercase' }}>منتجاتك ({cartItems.length})</span></div>
          {cartItems.map((item, index) => (<div key={index} style={{ display: 'flex', gap: '16px', padding: '18px 20px', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(198,241,53,0.02)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-2)' }}><img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 className="osw" style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--white)', lineHeight: 1.4, letterSpacing: '0.02em' }}>{item.product?.name}</h4>
              <p className="raj neon-lime" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{item.finalPrice?.toLocaleString()} <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: '12px', color: 'var(--mid)' }}>دج</span></p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden', background: 'var(--bg-3)' }}><button onClick={() => changeQty(index, -1)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderLeft: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--lime)' }}><Minus size={11} /></button><span className="raj" style={{ width: '36px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--white)', background: 'var(--bg-2)' }}>{item.quantity}</span><button onClick={() => changeQty(index, 1)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRight: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--lime)' }}><Plus size={11} /></button></div>
                <button onClick={() => removeItem(index)} style={{ marginRight: 'auto', background: 'transparent', border: '1px solid ' + 'rgba(255,61,0,0.3)', borderRadius: '2px', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, padding: '5px 10px', transition: 'all 0.2s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,61,0,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,61,0,0.3)'; }}><Trash2 size={12} /> حذف</button>
              </div>
            </div>
          </div>))}
          <div style={{ padding: '16px 20px', background: 'rgba(198,241,53,0.03)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className="raj" style={{ fontSize: '10px', color: 'var(--mid)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>المجموع الفرعي</span><span className="raj neon-lime" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{cartTotal.toLocaleString()} <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 400, color: 'var(--mid)' }}>دج</span></span></div>
        </div>
      </div>
      <div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(198,241,53,0.03)', display: 'flex', alignItems: 'center', gap: '10px' }}><Truck size={16} style={{ color: 'var(--lime)' }} /><span className="raj" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--lime)', textTransform: 'uppercase' }}>معلومات التوصيل</span></div>
          <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-2c"><FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e => { setFd({ ...fd, customerName: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }} placeholder="الاسم الكامل" className={`inp${errors.name ? ' inp-err' : ''}`} /></FR><FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => { setFd({ ...fd, customerPhone: e.target.value }); if (errors.phone) setErrors({ ...errors, phone: '' }); }} placeholder="0XXXXXXXXX" className={`inp${errors.phone ? ' inp-err' : ''}`} /></FR></div>
            <div className="form-2c"><FR error={errors.welaya} label="الولاية"><div style={{ position: 'relative' }}><ChevronDown size={13} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} /><select value={fd.customerWelaya} onChange={e => { setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' }); if (errors.welaya) setErrors({ ...errors, welaya: '' }); }} className={`inp${errors.welaya ? ' inp-err' : ''}`} style={{ paddingRight: '34px' }}><option value="">الولاية</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}</select></div></FR><FR error={errors.commune} label="البلدية"><div style={{ position: 'relative' }}><ChevronDown size={13} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} /><select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => { setFd({ ...fd, customerCommune: e.target.value }); if (errors.commune) setErrors({ ...errors, commune: '' }); }} className={`inp${errors.commune ? ' inp-err' : ''}`} style={{ paddingRight: '34px', opacity: !fd.customerWelaya ? 0.4 : 1 }}><option value="">{loadingC ? '...' : 'البلدية'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}</select></div></FR></div>
            <div><p className="raj" style={{ fontSize: '10px', color: 'var(--mid)', letterSpacing: '0.16em', marginBottom: '8px', textTransform: 'uppercase' }}>التوصيل</p><div className="dlv-2c">{(['home', 'office'] as const).map(type => (<button key={type} type="button" onClick={() => setFd({ ...fd, typeLivraison: type })} style={{ padding: '14px', borderRadius: '2px', border: `1px solid ${fd.typeLivraison === type ? 'var(--lime)' : 'var(--border)'}`, background: fd.typeLivraison === type ? 'rgba(198,241,53,0.04)' : 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', boxShadow: fd.typeLivraison === type ? 'var(--glow-l)' : 'none' }}><p className="raj" style={{ fontSize: '10px', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--lime)' : 'var(--mid)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{type === 'home' ? 'للبيت' : 'للمكتب'}</p>{selW && <p className="raj" style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--lime)' : 'var(--dim)', margin: 0 }}>{(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}</button>))}</div></div>
            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-3)' }}><div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(198,241,53,0.03)' }}><span className="raj" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--lime)', textTransform: 'uppercase' }}>// الملخص المالي</span></div>{[{ l: 'المجموع الفرعي', v: `${cartTotal.toLocaleString()} دج` }, { l: 'رسوم التوصيل', v: getLivPrice() ? `${getLivPrice().toLocaleString()} دج` : '---' }].map(row => (<div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--border)' }}><span style={{ fontSize: '12px', color: 'var(--mid)' }}>{row.l}</span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)' }}>{row.v}</span></div>))}<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px', background: 'rgba(198,241,53,0.03)' }}><span className="raj" style={{ fontSize: '12px', color: 'var(--lime)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>الإجمالي</span><span className="raj neon-lime" style={{ fontSize: '2.4rem', fontWeight: 700 }}>{finalTotal.toLocaleString()} <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: '13px', color: 'var(--mid)' }}>دج</span></span></div></div>
            <button type="submit" disabled={submitting} className="btn-lime" style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, clipPath: 'none', borderRadius: '2px' }}>{submitting ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }} /> جاري المعالجة...</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} /> تأكيد الطلب</span>}</button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>{[{ icon: <Lock size={11} />, l: 'دفع آمن' }, { icon: <ShieldCheck size={11} />, l: 'مشفر' }, { icon: <BadgeCheck size={11} />, l: 'موثق' }].map((b, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--dim)' }}><span style={{ color: 'var(--lime)' }}>{b.icon}</span> {b.l}</div>))}</div>
          </form>
        </div>
      </div>
    </div>
  </div></div>);
}

// ─────────────────────────────────────────────────────────────
// STATIC PAGES
// ─────────────────────────────────────────────────────────────
export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return <>{p === 'privacy' && <Privacy />}{p === 'terms' && <Terms />}{p === 'cookies' && <Cookies />}{p === 'contact' && <Contact store={store} />}</>;
}

const Shell = ({ children, title, sub }: { children: React.ReactNode; title: string; sub?: string }) => (
  <div dir="rtl" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }} className="grid-floor">
    <div style={{ background: 'linear-gradient(135deg, var(--bg-2), var(--bg-3))', padding: '72px 20px 48px', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      <EnergyOrb color="var(--lime)" size="40vw" x="70%" y="-30%" />
      <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {sub && <p className="raj" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', color: 'var(--red)', marginBottom: '12px', textTransform: 'uppercase' }}>{sub}</p>}
        <h1 className="osw" style={{ fontWeight: 700, fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'var(--white)', lineHeight: 1, margin: '0 0 14px', letterSpacing: '0.04em' }}><span className="neon-lime">{title}</span></h1>
        <NeonDivider color="red" />
      </div>
    </div>
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px 80px' }}><div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '4px', padding: '32px' }}>{children}</div></div>
  </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom: '18px', marginBottom: '18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
    <div style={{ flex: 1 }}><h3 className="osw" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--white)', margin: '0 0 8px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--lime)', fontSize: '14px' }}>//</span> {title}</h3><p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--mid)', margin: 0 }}>{body}</p></div>
    {tag && <span className="raj" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', padding: '4px 10px', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '2px', flexShrink: 0, textTransform: 'uppercase' }}>{tag}</span>}
  </div>
);

export function Privacy() { return (<Shell title="سياسة الخصوصية" sub="// قانوني"><IB title="البيانات التي نجمعها" body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك." /><IB title="كيف نستخدمها" body="حصرياً لتنفيذ وتوصيل مشترياتك." /><IB title="الأمان" body="بياناتك محمية بتشفير على مستوى المؤسسات." /><IB title="مشاركة البيانات" body="لا نبيع البيانات أبداً. تُشارك فقط مع شركاء التوصيل الموثوقين." /><p className="raj" style={{ fontSize: '10px', color: 'var(--dim)', marginTop: '16px', letterSpacing: '0.12em' }}>// آخر تحديث: فبراير 2026</p></Shell>); }
export function Terms() { return (<Shell title="شروط الاستخدام" sub="// قانوني"><IB title="حسابك" body="أنت مسؤول عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك." /><IB title="المدفوعات" body="لا رسوم مخفية. السعر المعروض هو السعر النهائي." /><IB title="الاستخدام المحظور" body="المنتجات الأصيلة فقط. لا مجال للمنتجات المقلدة." tag="صارم" /><IB title="القانون الحاكم" body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية." /></Shell>); }
export function Cookies() { return (<Shell title="سياسة الكوكيز" sub="// قانوني"><IB title="الكوكيز الأساسية" body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب" /><IB title="كوكيز التفضيلات" body="تحفظ إعداداتك لتجربة أفضل." tag="اختياري" /><IB title="كوكيز التحليلات" body="بيانات مجمعة ومجهولة لتحسين المنصة." tag="اختياري" /><div style={{ marginTop: '16px', padding: '14px', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(198,241,53,0.03)' }}><Lock style={{ width: '16px', height: '16px', color: 'var(--lime)', flexShrink: 0, marginTop: '2px' }} /><p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.8', margin: 0 }}>يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح.</p></div></Shell>); }

export function Contact({ store }: { store: Store }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e: any) => { e.preventDefault(); try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); } catch { alert('حدث خطأ في الإرسال'); } };
  return (
    <div dir="rtl" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }} className="grid-floor">
      <div style={{ background: 'linear-gradient(135deg, var(--bg-2), var(--bg-3))', padding: '72px 20px 48px', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}><EnergyOrb color="var(--red)" size="50vw" x="80%" y="-20%" /><div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}><p className="raj" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', color: 'var(--red)', marginBottom: '12px', textTransform: 'uppercase' }}>// تواصل</p><h1 className="osw" style={{ fontWeight: 700, fontSize: 'clamp(2rem,6vw,4rem)', color: 'var(--white)', lineHeight: 1, margin: '0 0 14px', letterSpacing: '0.04em' }}>تواصل <span className="neon-lime">معنا</span></h1><p style={{ fontSize: '14px', color: 'var(--mid)', marginTop: '10px' }}>نرد خلال أقل من ساعتين 🏋️</p></div></div>
      <div className="contact-g" style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '4px', padding: '24px', marginBottom: '12px' }}><p className="slabel" style={{ marginBottom: '16px' }}>طرق التواصل</p>
            {[{ icon: <Phone style={{ width: '18px', height: '18px' }} />, label: 'الهاتف', val: store.contact?.phone || '—', href: `tel:${store.contact?.phone}` }, { icon: <MapPin style={{ width: '18px', height: '18px' }} />, label: 'الموقع', val: store.contact?.wilaya || '—', href: undefined }].map(item => (<a key={item.label} href={item.href || '#'} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', transition: 'padding-right 0.25s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.paddingRight = '8px'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.paddingRight = '0'; }}><div style={{ width: '36px', height: '36px', border: '1px solid var(--border)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--bg-3)', color: 'var(--lime)' }}>{item.icon}</div><div><p className="raj" style={{ fontSize: '9px', color: 'var(--lime)', letterSpacing: '0.14em', margin: '0 0 3px', textTransform: 'uppercase' }}>{item.label}</p><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', margin: 0, lineHeight: 1.5 }}>{item.val}</p></div></a>))}
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--lime)', borderRadius: '4px', padding: '16px 20px', boxShadow: 'var(--glow-l)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lime)', animation: 'pulse-lime 2s ease-in-out infinite' }} /><span className="raj" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--lime)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>متصل الآن</span></div>{[{ l: 'وقت الرد', v: 'أقل من ساعتين' }, { l: 'التوصيل', v: '58 ولاية' }].map(s => (<div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid var(--border)' }}><span style={{ fontSize: '12px', color: 'var(--mid)' }}>{s.l}</span><span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--white)' }}>{s.v}</span></div>))}</div>
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '4px', padding: '24px' }}><p className="slabel" style={{ marginBottom: '20px' }}>أرسل رسالة</p>
          {sent ? (<div style={{ minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--lime)', borderRadius: '4px', textAlign: 'center', padding: '32px', boxShadow: 'var(--glow-l)', background: 'rgba(198,241,53,0.03)' }}><CheckCircle2 style={{ width: '36px', height: '36px', color: 'var(--lime)', marginBottom: '12px' }} /><h3 className="osw" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--white)', margin: '0 0 8px', letterSpacing: '0.04em' }}>تم إرسال رسالتك!</h3><p style={{ fontSize: '13px', color: 'var(--mid)' }}>سنرد عليك في أقل من ساعتين 🏋️</p></div>) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-2c">{[{ l: 'اسمك', t: 'text', k: 'name', p: 'الاسم الكامل' }, { l: 'الهاتف', t: 'tel', k: 'phone', p: '0550000000' }].map(f => (<FR key={f.k} label={f.l}><input type={f.t} value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.p} required className="inp" /></FR>))}</div>
            <FR label="البريد الإلكتروني"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="بريدك@الإلكتروني" required className="inp" /></FR>
            <FR label="رسالتك"><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp" style={{ resize: 'none' as any }} /></FR>
            <button type="submit" className="btn-lime" style={{ justifyContent: 'center', width: '100%', clipPath: 'none', borderRadius: '2px', fontSize: '14px', padding: '14px' }}>إرسال الرسالة <ArrowRight style={{ width: '14px', height: '14px' }} /></button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}