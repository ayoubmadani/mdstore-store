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
  Menu, Gamepad2, Zap, Trophy, Package, Truck,
  Search, ShoppingCart, ShoppingBag, Trash2, Loader2,
  BadgeCheck, ShieldCheck,
} from 'lucide-react';
import { Store } from '@/types/store';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Orbitron:wght@400;700;900&display=swap');
  *, *::before, *::after { box-sizing:border-box; -webkit-font-smoothing:antialiased; }

  :root {
    --navy:    #050B1A;
    --navy-2:  #08112A;
    --navy-3:  #0D1A38;
    --panel:   #0A1628;
    --cyan:    #00D4FF;
    --cyan-dk: #0099CC;
    --pink:    #FF2D8A;
    --pink-dk: #CC1A6A;
    --gold:    #FFD700;
    --gold-dk: #E6B800;
    --purple:  #9B59FF;
    --green:   #00FF88;
    --red:     #FF4444;
    --white:   #F0F8FF;
    --mid:     #7A9BB5;
    --dim:     #3D5A78;
    --line:    rgba(0,212,255,0.15);
    --line-pk: rgba(255,45,138,0.2);
    --glow-c:  0 0 20px rgba(0,212,255,0.4);
    --glow-p:  0 0 20px rgba(255,45,138,0.4);
    --glow-g:  0 0 20px rgba(255,215,0,0.5);
  }

  body { background:var(--navy); color:var(--white); font-family:'Tajawal',sans-serif; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:linear-gradient(var(--cyan),var(--pink)); border-radius:2px; }

  .hex-bg {
    background-color:var(--navy);
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Crect width='56' height='100' fill='%23050B1A'/%3E%3Cpath d='M28 66L0 50V17L28 1l28 16v33z' fill='none' stroke='%230D1A38' stroke-width='1'/%3E%3Cpath d='M28 100L0 83V50l28-16 28 16v33z' fill='none' stroke='%230D1A38' stroke-width='1'/%3E%3C/svg%3E");
  }

  .circuit-bg {
    background-image:
      linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
    background-size:40px 40px;
  }

  .neon-cyan { color:var(--cyan); text-shadow:0 0 10px rgba(0,212,255,0.8), 0 0 30px rgba(0,212,255,0.4); }
  .neon-pink { color:var(--pink); text-shadow:0 0 10px rgba(255,45,138,0.8), 0 0 30px rgba(255,45,138,0.4); }
  .neon-gold { color:var(--gold); text-shadow:0 0 10px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.4); }

  .orb { font-family:'Orbitron',monospace; }

  @keyframes shimmer-gold {
    0%   { background-position:-200% center; }
    100% { background-position: 200% center; }
  }
  .gold-shimmer {
    background:linear-gradient(90deg,var(--gold-dk),var(--gold),#FFF3A0,var(--gold),var(--gold-dk));
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    animation:shimmer-gold 3s linear infinite;
  }

  @keyframes pulse-cyan {
    0%,100% { box-shadow:0 0 8px rgba(0,212,255,0.4), inset 0 0 8px rgba(0,212,255,0.1); }
    50%      { box-shadow:0 0 24px rgba(0,212,255,0.8), inset 0 0 16px rgba(0,212,255,0.2); }
  }
  @keyframes pulse-pink {
    0%,100% { box-shadow:0 0 8px rgba(255,45,138,0.4); }
    50%      { box-shadow:0 0 24px rgba(255,45,138,0.8); }
  }
  @keyframes scan-line {
    0%   { transform:translateY(-100%); }
    100% { transform:translateY(200vh); }
  }
  @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .fu   { animation:fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both; }
  .fu-1 { animation-delay:0.1s; }
  .fu-2 { animation-delay:0.22s; }
  .fu-3 { animation-delay:0.36s; }

  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  @keyframes cartBounce {
    0%   { transform:scale(1); }
    50%  { transform:scale(1.06); }
    100% { transform:scale(1); }
  }
  @keyframes checkAppear {
    0%   { transform:scale(0) rotate(-45deg); opacity:0; }
    100% { transform:scale(1) rotate(0); opacity:1; }
  }
  .animate-cart  { animation:cartBounce 0.4s ease-in-out; }
  .animate-check { animation:checkAppear 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }

  /* CARD */
  .g-card {
    background:var(--panel); border:1px solid var(--line); border-radius:8px;
    overflow:hidden; transition:transform 0.3s, box-shadow 0.3s, border-color 0.3s;
    cursor:pointer; position:relative;
  }
  .g-card::before {
    content:''; position:absolute; inset:0; border-radius:8px;
    background:linear-gradient(135deg,rgba(0,212,255,0.05) 0%,transparent 50%,rgba(255,45,138,0.05) 100%);
    opacity:0; transition:opacity 0.3s; pointer-events:none;
  }
  .g-card:hover { transform:translateY(-6px) scale(1.01); border-color:var(--cyan); box-shadow:var(--glow-c); }
  .g-card:hover::before { opacity:1; }
  .g-card:hover .g-img img { transform:scale(1.06); }
  .g-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.4s cubic-bezier(0.22,1,0.36,1); }

  /* BUTTONS */
  .btn-cyan {
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg,var(--cyan-dk),var(--cyan));
    color:var(--navy); font-family:'Tajawal',sans-serif; font-weight:800;
    font-size:14px; letter-spacing:0.04em; padding:12px 28px;
    border:none; cursor:pointer; text-decoration:none; border-radius:4px;
    transition:all 0.25s; box-shadow:0 4px 16px rgba(0,212,255,0.3);
    clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
  }
  .btn-cyan:hover { box-shadow:0 6px 28px rgba(0,212,255,0.6); transform:translateY(-2px); }

  .btn-pink {
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg,var(--pink-dk),var(--pink));
    color:var(--white); font-family:'Tajawal',sans-serif; font-weight:800;
    font-size:14px; letter-spacing:0.04em; padding:12px 28px;
    border:none; cursor:pointer; text-decoration:none; border-radius:4px;
    transition:all 0.25s; box-shadow:0 4px 16px rgba(255,45,138,0.3);
    clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);
  }
  .btn-pink:hover { box-shadow:0 6px 28px rgba(255,45,138,0.6); transform:translateY(-2px); }

  .btn-ghost-c {
    display:inline-flex; align-items:center; gap:8px;
    background:transparent; color:var(--cyan);
    border:1px solid var(--cyan); font-family:'Tajawal',sans-serif;
    font-weight:700; font-size:13px; padding:11px 26px;
    cursor:pointer; text-decoration:none; border-radius:4px;
    transition:all 0.25s;
  }
  .btn-ghost-c:hover { background:rgba(0,212,255,0.1); box-shadow:var(--glow-c); }

  /* INPUTS */
  .inp {
    width:100%; padding:12px 14px;
    background:var(--navy-3); border:1px solid var(--dim);
    font-family:'Tajawal',sans-serif; font-size:14px; color:var(--white);
    outline:none; border-radius:4px; transition:border-color 0.25s, box-shadow 0.25s;
    letter-spacing:0.02em;
  }
  .inp:focus { border-color:var(--cyan); box-shadow:0 0 0 3px rgba(0,212,255,0.15); }
  .inp::placeholder { color:var(--dim); }
  .inp-err { border-color:var(--pink) !important; box-shadow:0 0 0 3px rgba(255,45,138,0.1) !important; }
  select.inp { appearance:none; cursor:pointer; }
  select.inp option { background:var(--navy-2); color:var(--white); }

  /* NEON BORDER */
  .neon-box { border:1px solid var(--line); box-shadow:var(--glow-c), inset 0 0 30px rgba(0,212,255,0.03); animation:pulse-cyan 3s ease-in-out infinite; }
  .neon-box-pk { border:1px solid var(--line-pk); box-shadow:var(--glow-p), inset 0 0 30px rgba(255,45,138,0.03); animation:pulse-pink 3s ease-in-out infinite; }

  /* Section label */
  .slabel {
    font-family:'Orbitron',monospace; font-size:10px; font-weight:700;
    letter-spacing:0.2em; text-transform:uppercase; color:var(--cyan);
    display:flex; align-items:center; gap:8px;
  }
  .slabel::before { content:'//'; color:var(--pink); }

  /* Cart badge */
  .cart-badge {
    position:absolute; top:-6px; left:-6px;
    min-width:18px; height:18px; border-radius:9px;
    background:var(--pink); color:white;
    font-size:10px; font-weight:900; font-family:'Orbitron',monospace;
    display:flex; align-items:center; justify-content:center; padding:0 4px;
    box-shadow:0 0 8px rgba(255,45,138,0.7);
  }

  /* Responsive */
  .nav-links  { display:flex; align-items:center; gap:24px; }
  .nav-toggle { display:none; }
  .prod-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .cat-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .trust-bar  { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g   { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; }
  .details-g  { display:grid; grid-template-columns:1fr 1fr; }
  .details-L  { padding:20px 0; position:sticky; top:70px; height:calc(100vh - 70px); overflow:hidden; }
  .details-R  { padding:20px 32px; overflow-y:auto; }
  .contact-g  { display:grid; grid-template-columns:1fr 1fr; gap:48px; }
  .form-2c    { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c     { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cart-g     { display:grid; grid-template-columns:1fr 1fr; gap:24px; }

  @media (max-width:1100px) {
    .prod-grid { grid-template-columns:repeat(3,1fr); }
    .footer-g  { grid-template-columns:1fr 1fr; gap:32px; }
  }
  @media (max-width:768px) {
    .nav-links  { display:none; }
    .nav-toggle { display:flex; }
    .prod-grid  { grid-template-columns:repeat(1,1fr); gap:10px; }
    .cat-grid   { grid-template-columns:repeat(2,1fr); }
    .trust-bar  { grid-template-columns:repeat(2,1fr); }
    .footer-g   { grid-template-columns:1fr 1fr; gap:24px; }
    .details-g  { grid-template-columns:1fr; }
    .details-L  { padding:0; position:static; width:100%; height:auto; aspect-ratio:1; margin-bottom:20px; display:flex; flex-direction:column; gap:20px; }
    .details-R  { padding:20px 0; }
    .contact-g  { grid-template-columns:1fr; gap:28px; }
    .cart-g     { grid-template-columns:1fr; }
  }
  @media (max-width:480px) {
    .prod-grid  { grid-template-columns:repeat(2,1fr); gap:8px; }
    .footer-g   { grid-template-columns:1fr; }
    .form-2c    { grid-template-columns:1fr; }
    .dlv-2c     { grid-template-columns:1fr; }
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
  store: { id: string; name: string; subdomain: string; userId: string; cart: boolean; };
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

/* ── DECORATIVE ─────────────────────────────────────────────── */
function NeonDivider({ color = 'cyan' }: { color?: 'cyan' | 'pink' }) {
  const c = color === 'cyan' ? 'var(--cyan)' : 'var(--pink)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left,${c},transparent)` }} />
      <div style={{ width: '6px', height: '6px', border: `1px solid ${c}`, transform: 'rotate(45deg)', boxShadow: `0 0 8px ${c}` }} />
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right,${c},transparent)` }} />
    </div>
  );
}

/* ── MAIN ───────────────────────────────────────────────────── */
export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--navy)' }} className="hex-bg">
      <style>{CSS}</style>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right,transparent,var(--cyan),transparent)', opacity: 0.4, pointerEvents: 'none', zIndex: 9999, animation: 'scan-line 8s linear infinite' }} />
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ── NAVBAR ─────────────────────────────────────────────────── */
export function Navbar({ store, domain }: { store: any, domain: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const itemsCartCount = useCartStore((state) => state.count);
  const initCount = useCartStore((state) => state.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try {
        const stored = localStorage.getItem(domain);
        const items = JSON.parse(stored || '[]');
        initCount(Array.isArray(items) ? items.length : 0);
      } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } });
        setListSearch(data.products || []);
      } catch { } finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`https://${domain}/?search=${encodeURIComponent(searchQuery)}`);
      setListSearch([]); setShowSearch(false);
    }
  };

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const DropdownResults = () => (
    <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, background: 'rgba(10,22,40,0.98)', border: '1px solid var(--line)', borderRadius: '0 0 8px 8px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginTop: '4px', overflow: 'hidden' }}>
      {loading
        ? <div style={{ padding: '15px', color: 'var(--cyan)', textAlign: 'center', fontSize: '12px' }}>جاري البحث...</div>
        : listSearch.length > 0 ? listSearch.map((p: any) => (
          <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSearchQuery('')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
            <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--line)' }} alt="" />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{p.name}</div>
              <div style={{ color: 'var(--cyan)', fontSize: '11px' }}>{p.price} دج</div>
            </div>
          </Link>
        )) : searchQuery.length >= 2 && (
          <div style={{ padding: '15px', color: 'var(--mid)', textAlign: 'center', fontSize: '12px' }}>لا توجد نتائج</div>
        )
      }
    </div>
  );

  return (
    <nav dir="rtl" style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(5,11,26,0.97)' : 'rgba(5,11,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--line)', transition: 'all 0.3s' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          {store?.design?.logoUrl
            ? <img src={store.design.logoUrl} style={{ height: '32px' }} alt={store.name} />
            : <span className="neon-cyan orb" style={{ fontWeight: 900, fontSize: '1.1rem' }}>{store?.name}</span>
          }
        </Link>

        {/* Desktop Search */}
        <div className="nav-links" style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
          <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
            <input type="text" placeholder="ابحث عن منتج..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 35px 8px 15px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: '#fff', outline: 'none', fontFamily: "'Tajawal',sans-serif" }} />
            <Search size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cyan)' }} />
          </form>
          {searchQuery.length >= 2 && <DropdownResults />}
        </div>

        {/* Desktop Links */}
        <div className="nav-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--mid)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>المتجر</Link>
          <Link href="/contact" style={{ color: 'var(--mid)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>تواصل معنا</Link>
          {/* Cart Icon */}
          <Link href="/cart" style={{ position: 'relative', color: 'var(--mid)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', border: '1px solid var(--line)', borderRadius: '6px', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--cyan)'; (e.currentTarget as HTMLElement).style.color = 'var(--cyan)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLElement).style.color = 'var(--mid)'; }}>
            <ShoppingCart size={18} />
            {itemsCartCount > 0 && <span className="cart-badge">{itemsCartCount}</span>}
          </Link>
          <a href="#products" className="btn-cyan" style={{ padding: '8px 18px', fontSize: '12px' }}>تسوق الآن</a>
        </div>

        {/* Mobile Toggle */}
        <div style={{ display: 'none', gap: '10px' }} className="mobile-only-flex">
          {/* Mobile Cart */}
          <Link href="/cart" style={{ position: 'relative', background: 'none', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--cyan)', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <ShoppingCart size={20} />
            {itemsCartCount > 0 && <span className="cart-badge">{itemsCartCount}</span>}
          </Link>
          <button onClick={() => setShowSearch(!showSearch)} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer' }}><Search size={22} /></button>
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer' }}>{open ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </div>

      {/* Mobile Search */}
      {showSearch && (
        <div style={{ padding: '10px 20px', background: 'var(--navy-2)', borderTop: '1px solid var(--line)', position: 'relative' }}>
          <form onSubmit={handleSearchSubmit}>
            <input autoFocus type="text" placeholder="ابحث هنا..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 40px', borderRadius: '8px', background: '#000', border: '1px solid var(--cyan)', color: '#fff', fontFamily: "'Tajawal',sans-serif" }} />
            <Search size={18} style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cyan)' }} />
          </form>
          {searchQuery.length >= 2 && <DropdownResults />}
        </div>
      )}

      {/* Mobile Menu */}
      <div style={{ maxHeight: open ? '240px' : '0', overflow: 'hidden', transition: 'all 0.3s', background: 'var(--navy-2)' }}>
        <div style={{ padding: '10px 20px' }}>
          <Link href="/" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', color: '#fff', textDecoration: 'none', borderBottom: '1px solid var(--line)', fontSize: '15px' }}>
            المتجر <ArrowRight size={14} style={{ color: 'var(--cyan)' }} />
          </Link>
          <Link href="/cart" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', color: '#fff', textDecoration: 'none', borderBottom: '1px solid var(--line)', fontSize: '15px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={16} style={{ color: 'var(--cyan)' }} /> السلة
              {itemsCartCount > 0 && <span style={{ background: 'var(--pink)', color: 'white', fontSize: '10px', fontWeight: 900, padding: '1px 7px', borderRadius: '10px' }}>{itemsCartCount}</span>}
            </span>
            <ArrowRight size={14} style={{ color: 'var(--cyan)' }} />
          </Link>
          <Link href="/contact" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', color: '#fff', textDecoration: 'none', fontSize: '15px' }}>
            تواصل معنا <ArrowRight size={14} style={{ color: 'var(--cyan)' }} />
          </Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 991px) {
          .nav-links { display: none !important; }
          .mobile-only-flex { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

/* ── FOOTER ─────────────────────────────────────────────────── */
export function Footer({ store }: any) {
  const yr = new Date().getFullYear();
  const cyan = 'var(--cyan)';
  const pink = 'var(--pink)';
  return (
    <footer dir="rtl" style={{ backgroundColor: 'var(--navy-3)', borderTop: '2px solid var(--line)', fontFamily: "'Tajawal',sans-serif", marginTop: '80px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '300px', height: '300px', background: `radial-gradient(circle, ${cyan}05 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 20px 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', paddingBottom: '40px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '8px', border: `1px solid ${cyan}`, borderRadius: '4px', background: `${cyan}05` }}>
                <Gamepad2 style={{ width: '24px', height: '24px', color: cyan }} />
              </div>
              <span className="orb" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                <span style={{ color: cyan, textShadow: `0 0 10px ${cyan}40` }}>{store?.name?.split(' ')[0]}</span>
                {store?.name?.split(' ').slice(1).length > 0 && (
                  <span style={{ color: pink, textShadow: `0 0 10px ${pink}40` }}> {store?.name?.split(' ').slice(1).join(' ')}</span>
                )}
              </span>
            </div>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--mid)', maxWidth: '300px' }}>
              {store?.hero?.subtitle?.substring(0, 80) || 'وجهتك الأولى لعالم الألعاب والاحتراف في الجزائر. جودة أصلية وتوصيل سريع.'}
            </p>
            <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
              {['🎮', '🕹️', '👾', '🔥'].map((e, i) => (
                <div key={i} style={{ width: '36px', height: '36px', border: '1px solid var(--line)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', background: 'rgba(255,255,255,0.02)', transition: '0.3s', cursor: 'default' }}
                  onMouseEnter={el => (el.currentTarget as HTMLElement).style.borderColor = cyan}
                  onMouseLeave={el => (el.currentTarget as HTMLElement).style.borderColor = 'var(--line)'}>
                  {e}
                </div>
              ))}
            </div>
          </div>
          {[
            { title: 'روابط سريعة', links: [['/', 'المتجر'], ['/cart', 'السلة'], ['/contact', 'الدعم الفني'], ['/Privacy', 'سياسة الخصوصية'], ['/Terms', 'شروط الاستخدام']] },
            { title: 'تواصل معنا', links: [['tel:+213550000000', '+213 550 000 000'], ['#', 'الجزائر، أولاد فايت'], ['#', 'مركز الأعمال قرب المسجد']] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: cyan, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '4px', backgroundColor: pink, borderRadius: '50%', display: 'inline-block' }} />
                {col.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {col.links.map(([href, label]) => (
                  <a key={label} href={href} style={{ fontSize: '14px', color: 'var(--mid)', textDecoration: 'none', transition: 'all 0.3s', display: 'inline-block' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.transform = 'translateX(-5px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mid)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <p style={{ fontSize: '13px', color: 'var(--dim)' }}>© {yr} <span style={{ color: cyan }}>{store?.name}</span>. صُنع بكل شغف للألعاب.</p>
          <span style={{ fontSize: '11px', color: 'var(--dim)', letterSpacing: '1px', textTransform: 'uppercase' }}>Gaming Engine 2.0</span>
        </div>
      </div>
    </footer>
  );
}

/* ── CARD ───────────────────────────────────────────────────── */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [hov, setHov] = useState(false);
  if (!product || !store) return null;
  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number) || 0;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  const brandColor = 'var(--cyan)';
  return (
    <div className="g-card group" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--navy-3)', border: `1px solid ${hov ? brandColor : 'var(--panel)'}`, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', position: 'relative', borderRadius: '4px' }}>
      <div className="g-img" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--navy-2)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy-3)' }}>
            <Gamepad2 style={{ width: '40px', height: '40px', color: 'var(--dim)' }} />
          </div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--pink)', color: 'var(--white)', fontSize: '11px', fontWeight: 900, padding: '3px 10px', borderRadius: '2px', boxShadow: '0 0 10px rgba(255,0,128,0.4)', zIndex: 10 }}>
            -{discount}%
          </div>
        )}
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--white)', marginBottom: '10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden', minHeight: '2.8em' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', gap: '3px', marginBottom: '15px' }}>
          {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '11px', height: '11px', fill: i < 4 ? brandColor : 'none', color: brandColor }} />)}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>
              {price.toLocaleString()}
              <span style={{ fontSize: '12px', fontWeight: 600, color: brandColor, marginRight: '4px' }}>دج</span>
            </span>
            {orig > price && <span style={{ fontSize: '12px', color: 'var(--dim)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
          <Link href={`/product/${product.slug || product.id}`}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', fontSize: '13px', fontWeight: 800, padding: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: hov ? brandColor : 'transparent', color: hov ? 'var(--navy-3)' : brandColor, border: `2px solid ${brandColor}`, boxShadow: hov ? `0 0 20px ${brandColor}80` : 'none', transition: 'all 0.25s ease', clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}>
            <span style={{ position: 'relative', top: '1px' }}>{viewDetails}</span>
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── HOME ───────────────────────────────────────────────────── */
export function Home({ store }: any) {
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];

  const trust = [
    { icon: <Truck style={{ width: '20px', height: '20px' }} />, color: 'var(--cyan)', title: 'توصيل 58 ولاية', desc: 'توصيل سريع لكل الجزائر' },
    { icon: <Shield style={{ width: '20px', height: '20px' }} />, color: 'var(--pink)', title: 'منتجات أصيلة 100%', desc: 'ضمان الجودة والأصالة' },
    { icon: <Trophy style={{ width: '20px', height: '20px' }} />, color: 'var(--gold)', title: 'أفضل الأسعار', desc: 'أسعار تنافسية دائماً' },
    { icon: <Zap style={{ width: '20px', height: '20px' }} />, color: 'var(--purple)', title: 'خدمة سريعة', desc: 'رد سريع على استفساراتك' },
  ];

  return (
    <div dir="rtl">
      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden', backgroundColor: 'var(--navy-3)' }} className="circuit-bg">
        {store.hero?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(5,11,26,0.95) 30%, rgba(5,11,26,0.4) 100%)' }} />
          </div>
        )}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,138,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 20px 60px', position: 'relative', zIndex: 10, width: '100%' }}>
          <div className="fu" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1px solid var(--line)', borderRadius: '4px', padding: '6px 14px', marginBottom: '24px', background: 'rgba(5,11,26,0.8)', backdropFilter: 'blur(4px)' }}>
            <Gamepad2 style={{ width: '14px', height: '14px', color: 'var(--cyan)' }} />
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--cyan)', textTransform: 'uppercase' }}>{store.name}</span>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--pink)', animation: 'pulse-pink 2s ease-in-out infinite' }} />
          </div>
          <h1 className="fu fu-1" style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(2.2rem,7vw,5.5rem)', lineHeight: 1.05, marginBottom: '16px', letterSpacing: '-0.01em', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <span className="gold-shimmer">عالم الألعاب</span><br />
            <span style={{ color: 'var(--white)' }}>بين </span>
            <span className="neon-cyan">يديك</span>
          </h1>
          <NeonDivider color="cyan" />
          <p className="fu fu-2" style={{ fontSize: 'clamp(14px,2vw,18px)', lineHeight: '1.8', color: 'var(--white)', opacity: 0.9, marginBottom: '32px', maxWidth: '520px', fontWeight: 400, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {store.hero?.subtitle || 'كل ما تحتاجه للعب الاحترافي — PS5، Xbox، يدات التحكم، الألعاب وكل الإكسسوارات. توصيل لجميع ولايات الجزائر.'}
          </p>
          <div className="fu fu-3" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#products" className="btn-cyan" style={{ fontSize: '15px', padding: '14px 32px', textDecoration: 'none' }}>
              <Gamepad2 style={{ width: '16px', height: '16px' }} /> تسوق الآن
            </a>
            <Link href="/cart" className="btn-ghost-c" style={{ fontSize: '14px', padding: '13px 28px', textDecoration: 'none' }}>
              <ShoppingCart style={{ width: '15px', height: '15px' }} /> السلة
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '32px', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
            {[{ n: `${products.length}+`, l: 'منتج متاح', c: 'var(--cyan)' }, { n: '58', l: 'ولاية توصيل', c: 'var(--pink)' }, { n: '100%', l: 'منتجات أصيلة', c: 'var(--gold)' }].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p className="orb" style={{ fontSize: '2rem', fontWeight: 900, color: s.c, lineHeight: 1, margin: 0, textShadow: `0 0 16px ${s.c}80` }}>{s.n}</p>
                <p style={{ fontSize: '12px', color: 'var(--white)', opacity: 0.7, margin: '4px 0 0', fontWeight: 500 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--navy-2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="trust-bar">
            {trust.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px', borderLeft: i > 0 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ color: item.color, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: item.color, margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--mid)', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (
        <section id="categories" style={{ padding: '80px 0', backgroundColor: 'var(--navy-3)', position: 'relative' }} className="circuit-bg">
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)', opacity: 0.3 }} />
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
              <div>
                <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(0,212,255,0.1)', border: '1px solid var(--cyan)', borderRadius: '4px', fontSize: '10px', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>EXPLORE</div>
                <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'var(--white)', margin: 0 }}>
                  تسوق حسب <span className="neon-pink">الفئة</span>
                </h2>
              </div>
              <Link href="/" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                عرض كل الفئات
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight style={{ width: '14px', height: '14px' }} />
                </div>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {cats.slice(0, 8).map((cat: any, i: number) => (
                <Link key={cat.id} href={`?category=${cat.id}`}
                  style={{ position: 'relative', display: 'block', textDecoration: 'none', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)', aspectRatio: '16/10', backgroundColor: 'var(--panel)', transition: 'all 0.4s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--cyan)'; el.style.boxShadow = '0 10px 30px rgba(0,212,255,0.2)'; el.style.transform = 'translateY(-8px) scale(1.02)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--line)'; el.style.boxShadow = 'none'; el.style.transform = 'translateY(0) scale(1)'; }}>
                  <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                    {cat.imageUrl
                      ? <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.6 }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--navy-3), var(--panel))' }}>
                        <Gamepad2 style={{ width: '40px', height: '40px', color: 'var(--cyan)', opacity: 0.2 }} />
                      </div>
                    }
                  </div>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: `radial-gradient(circle at top right, ${i % 2 === 0 ? 'var(--cyan)' : 'var(--pink)'}40, transparent 70%)`, zIndex: 1 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,11,26,0.9) 0%, rgba(5,11,26,0.2) 50%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', zIndex: 2 }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--white)', fontFamily: "'Tajawal',sans-serif" }}>{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding: '64px 0', backgroundColor: 'var(--navy-2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <div className="slabel" style={{ marginBottom: '10px' }}>المنتجات</div>
              <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'var(--white)', margin: 0 }}>
                كل <span className="neon-cyan">المنتجات</span>
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--dim)' }}>{products.length} منتج</p>
          </div>
          {products.length === 0
            ? <div style={{ padding: '80px 0', textAlign: 'center', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--panel)' }}>
              <Gamepad2 style={{ width: '56px', height: '56px', color: 'var(--dim)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--mid)' }}>المنتجات قادمة قريباً...</p>
            </div>
            : <div className="prod-grid">
              {products.map((p: any) => {
                const img = p.productImage || p.imagesProduct?.[0]?.imageUrl || store?.design?.logoUrl || '/fallback-image.png';
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض المنتج" />;
              })}
            </div>
          }
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ position: 'relative', padding: '80px 20px', overflow: 'hidden', backgroundColor: 'var(--navy)', textAlign: 'center' }} className="circuit-bg">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(0,212,255,0.05) 0%,rgba(255,45,138,0.05) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px', margin: '0 auto' }}>
          <NeonDivider color="pink" />
          <div style={{ margin: '24px 0' }}>
            <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--pink)', marginBottom: '14px' }}>// توصيل لكل الجزائر</p>
            <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,5vw,3.5rem)', color: 'var(--white)', lineHeight: 1.05, marginBottom: '16px' }}>
              توصيل <span className="neon-cyan">58 ولاية</span>
            </h2>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--mid)', marginBottom: '28px' }}>
              الجزائر بلدية اولاد فايت بلاطو قرب مسجد ابوبكر الصديق
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#products" className="btn-cyan" style={{ fontSize: '14px', padding: '13px 30px' }}>
              <Gamepad2 style={{ width: '15px', height: '15px' }} /> تسوق الآن
            </a>
            <Link href="/contact" className="btn-pink" style={{ fontSize: '14px', padding: '13px 30px', textDecoration: 'none' }}>
              <Phone style={{ width: '15px', height: '15px' }} /> تواصل معنا
            </Link>
          </div>
          <NeonDivider color="cyan" />
        </div>
      </section>
    </div>
  );
}

/* ── DETAILS ────────────────────────────────────────────────── */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [sel, setSel] = useState(0);
  return (
    <div dir="rtl" style={{ backgroundColor: 'var(--navy)' }}>
      <div style={{ borderBottom: '1px solid var(--line)', padding: '11px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--dim)', backgroundColor: 'var(--navy-2)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--dim)', transition: 'color 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--cyan)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--dim)'; }}>
          الرئيسية
        </Link>
        <ChevronLeft style={{ width: '12px', height: '12px', transform: 'rotate(180deg)' }} />
        <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>{product.name.slice(0, 40)}</span>
        <div style={{ marginRight: 'auto', display: 'flex', gap: '8px' }}>
          <button onClick={toggleWishlist} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isWishlisted ? 'var(--pink)' : 'var(--line)'}`, background: isWishlisted ? 'rgba(255,45,138,0.1)' : 'transparent', cursor: 'pointer', color: isWishlisted ? 'var(--pink)' : 'var(--mid)', borderRadius: '4px' }}>
            <Heart style={{ width: '13px', height: '13px', fill: isWishlisted ? 'currentColor' : 'none' }} />
          </button>
          <button onClick={handleShare} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--mid)', borderRadius: '4px' }}>
            <Share2 style={{ width: '13px', height: '13px' }} />
          </button>
        </div>
      </div>

      <div className="details-g" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Gallery */}
        <div className="details-L">
          <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px' }}>
            {allImages.length > 0
              ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gamepad2 style={{ width: '64px', height: '64px', color: 'var(--dim)' }} /></div>
            }
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,11,26,0.7) 0%, transparent 50%)', pointerEvents: 'none' }} />
            {discount > 0 && <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--pink)', color: 'var(--white)', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '4px', boxShadow: 'var(--glow-p)' }}>-{discount}%</div>}
            <span style={{ position: 'absolute', top: '8px', left: '8px', width: '14px', height: '14px', borderTop: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)' }} />
            <span style={{ position: 'absolute', bottom: '8px', right: '8px', width: '14px', height: '14px', borderBottom: '2px solid var(--pink)', borderRight: '2px solid var(--pink)' }} />
            {allImages.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '34px', height: '34px', border: '1px solid var(--cyan)', borderRadius: '4px', backgroundColor: 'rgba(5,11,26,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
                  <ChevronRight style={{ width: '14px', height: '14px' }} />
                </button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '34px', height: '34px', border: '1px solid var(--cyan)', borderRadius: '4px', backgroundColor: 'rgba(5,11,26,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
                  <ChevronLeft style={{ width: '14px', height: '14px' }} />
                </button>
              </>
            )}
            {!inStock && !autoGen && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,11,26,0.85)', backdropFilter: 'blur(4px)' }}>
                <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '1.2rem', fontWeight: 900, color: 'var(--pink)' }}>نفد المخزون</span>
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              {allImages.slice(0, 5).map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ width: '52px', height: '52px', overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--cyan)' : 'var(--line)'}`, cursor: 'pointer', padding: 0, background: 'none', borderRadius: '4px', opacity: sel === idx ? 1 : 0.55, boxShadow: sel === idx ? 'var(--glow-c)' : 'none' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="details-R">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', marginTop: '24px' }}>
            <div className="slabel" style={{ marginBottom: '10px' }}>تفاصيل المنتج</div>
            <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2.2rem)', color: 'var(--white)', lineHeight: 1.15, marginBottom: '14px' }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '13px', height: '13px', fill: i < 4 ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />)}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--mid)' }}>4.8 (128 تقييم)</span>
              <span style={{ marginRight: 'auto', padding: '4px 12px', borderRadius: '20px', backgroundColor: inStock || autoGen ? 'rgba(0,212,255,0.1)' : 'rgba(255,45,138,0.1)', color: inStock || autoGen ? 'var(--cyan)' : 'var(--pink)', fontSize: '12px', fontWeight: 700, border: `1px solid ${inStock || autoGen ? 'var(--cyan)' : 'var(--pink)'}` }}>
                {autoGen ? '∞ متوفر' : inStock ? 'متوفر' : 'نفد'}
              </span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--navy-3)', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--mid)', letterSpacing: '0.16em', margin: '0 0 6px', textTransform: 'uppercase' }}>السعر</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <span className="neon-cyan orb" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '15px', color: 'var(--mid)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <>
                    <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                    <span style={{ fontSize: '11px', background: 'var(--pink)', color: 'var(--white)', padding: '2px 8px', borderRadius: '3px', fontWeight: 700 }}>
                      وفّر {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString()} دج
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.16em', marginBottom: '10px', textTransform: 'uppercase' }}>الباقات</p>
                {product.offers.map((offer: any) => (
                  <label key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1px solid ${selectedOffer === offer.id ? 'var(--cyan)' : 'var(--line)'}`, cursor: 'pointer', marginBottom: '8px', borderRadius: '6px', transition: 'all 0.2s', backgroundColor: selectedOffer === offer.id ? 'rgba(0,212,255,0.05)' : 'transparent', boxShadow: selectedOffer === offer.id ? 'var(--glow-c)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '16px', height: '16px', border: `2px solid ${selectedOffer === offer.id ? 'var(--cyan)' : 'var(--dim)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {selectedOffer === offer.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: 'var(--glow-c)' }} />}
                      </div>
                      <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--white)', margin: 0 }}>{offer.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--mid)', margin: 0 }}>الكمية: {offer.quantity}</p>
                      </div>
                    </div>
                    <span className="neon-cyan orb" style={{ fontSize: '1.1rem', fontWeight: 900, textShadow: 'none' }}>
                      {offer.price.toLocaleString()} <span style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 400, fontSize: '11px', color: 'var(--mid)' }}>دج</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.16em', marginBottom: '10px', textTransform: 'uppercase' }}>{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: '28px', height: '28px', backgroundColor: v.value, border: 'none', cursor: 'pointer', borderRadius: '4px', outline: s ? '2px solid var(--cyan)' : '2px solid transparent', outlineOffset: '3px', boxShadow: s ? 'var(--glow-c)' : 'none' }} />; })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: '52px', height: '52px', overflow: 'hidden', border: `2px solid ${s ? 'var(--cyan)' : 'var(--line)'}`, cursor: 'pointer', padding: 0, borderRadius: '4px', boxShadow: s ? 'var(--glow-c)' : 'none' }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>; })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '8px 16px', border: `1px solid ${s ? 'var(--cyan)' : 'var(--line)'}`, backgroundColor: s ? 'rgba(0,212,255,0.1)' : 'transparent', color: s ? 'var(--cyan)' : 'var(--mid)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '4px', transition: 'all 0.2s', boxShadow: s ? 'var(--glow-c)' : 'none' }}>{v.name}</button>; })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {product.desc && (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.16em', marginBottom: '12px', textTransform: 'uppercase' }}>وصف المنتج</p>
                <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--mid)' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PRODUCT FORM ────────────────────────────────────────────── */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '12px' }}>
    {label && <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--cyan)', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '11px', color: 'var(--pink)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const initCount = useCartStore((state) => state.initCount);

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

  const fp = getFP();
  const total = () => fp * fd.quantity + +getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!fd.customerPhone.trim()) e.customerPhone = 'رقم الهاتف مطلوب';
    if (!fd.customerWelaya) e.customerWelaya = 'الولاية مطلوبة';
    if (!fd.customerCommune) e.customerCommune = 'البلدية مطلوبة';
    return e;
  };
  const getVariantDetailId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find(v => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const addToCart = () => {
    setIsOrderNow(false);
    setIsAdded(true);
    const existing = localStorage.getItem(domain);
    const cart = existing ? JSON.parse(existing) : [];
    cart.push({
      ...fd, product, variantDetailId: getVariantDetailId(),
      productId: product.id, storeId: product.store.id, userId,
      selectedOffer, selectedVariants,
      platform: platform || 'store',
      finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(),
      addedAt: new Date().getTime(),
    });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const er = validate(); if (Object.keys(er).length) { setErrors(er); return; } setErrors({}); setSub(true);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVariantDetailId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (typeof window !== 'undefined' && fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    } catch (err) { console.error(err); } finally { setSub(false); }
  };

  return (
    <div style={{ direction: 'rtl', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>

      {/* ── أزرار السلة / الطلب المباشر ── */}
      {product.store.cart && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {/* زر إضافة للسلة */}
          <button onClick={addToCart} disabled={isAdded}
            className={isAdded ? 'animate-cart' : ''}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '13px', borderRadius: '4px', cursor: isAdded ? 'default' : 'pointer',
              fontFamily: "'Tajawal',sans-serif", fontSize: '14px', fontWeight: 800,
              transition: 'all 0.3s ease',
              border: isAdded ? '1px solid var(--green)' : '1px solid var(--cyan)',
              backgroundColor: isAdded ? 'rgba(0,255,136,0.08)' : 'transparent',
              color: isAdded ? 'var(--green)' : 'var(--cyan)',
              boxShadow: isAdded ? '0 0 16px rgba(0,255,136,0.3)' : 'none',
            }}>
            {isAdded ? (
              <>
                <CheckCircle2 size={17} className="animate-check" />
                <span className="animate-check">تمت الإضافة!</span>
              </>
            ) : (
              <>
                <ShoppingCart size={17} />
                <span>أضف للسلة</span>
              </>
            )}
          </button>

          {/* زر طلب الآن */}
          <button onClick={() => setIsOrderNow(true)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer',
              fontFamily: "'Tajawal',sans-serif", fontSize: '14px', fontWeight: 800,
              background: 'linear-gradient(135deg, var(--pink-dk), var(--pink))',
              color: 'var(--white)', boxShadow: '0 4px 16px rgba(255,45,138,0.3)',
              transition: 'all 0.25s',
              clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(255,45,138,0.6)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(255,45,138,0.3)'; }}>
            <Zap size={17} />
            طلب الآن
          </button>
        </div>
      )}

      {/* ── نموذج الطلب ── */}
      {(isOrderNow || !product.store.cart) && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          {product.store.cart && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0 }}>// بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: '4px', color: 'var(--mid)', cursor: 'pointer', padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <X size={12} /> إلغاء
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.customerName} label="الاسم">
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل"
                    className={`inp${errors.customerName ? ' inp-err' : ''}`} style={{ paddingLeft: '36px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.customerName ? 'var(--pink)' : 'var(--dim)'; }} />
                </div>
              </FR>
              <FR error={errors.customerPhone} label="الهاتف">
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0X XX XX XX XX"
                    className={`inp${errors.customerPhone ? ' inp-err' : ''}`} style={{ paddingLeft: '36px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.customerPhone ? 'var(--pink)' : 'var(--dim)'; }} />
                </div>
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}
                    className={`inp${errors.customerWelaya ? ' inp-err' : ''}`} style={{ paddingRight: '34px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.customerWelaya ? 'var(--pink)' : 'var(--dim)'; }}>
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
                    onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.customerCommune ? 'var(--pink)' : 'var(--dim)'; }}>
                    <option value="">{loadingC ? '...' : 'اختر البلدية'}</option>
                    {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="طريقة التوصيل">
              <div className="dlv-2c">
                {(['home', 'office'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))}
                    style={{ padding: '12px 10px', border: `1px solid ${fd.typeLivraison === type ? 'var(--cyan)' : 'var(--line)'}`, backgroundColor: fd.typeLivraison === type ? 'rgba(0,212,255,0.06)' : 'transparent', cursor: 'pointer', textAlign: 'right', borderRadius: '6px', transition: 'all 0.2s', boxShadow: fd.typeLivraison === type ? 'var(--glow-c)' : 'none' }}>
                    <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: fd.typeLivraison === type ? 'var(--cyan)' : 'var(--mid)', margin: '0 0 4px', textTransform: 'uppercase' }}>
                      {type === 'home' ? 'للبيت' : 'للمكتب'}
                    </p>
                    {selW && <p className="orb" style={{ fontSize: '1rem', fontWeight: 900, color: fd.typeLivraison === type ? 'var(--cyan)' : 'var(--dim)', margin: 0 }}>
                      {(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()}
                      <span style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 400, fontSize: '11px', marginRight: '3px', color: 'var(--mid)' }}>دج</span>
                    </p>}
                  </button>
                ))}
              </div>
            </FR>

            <FR label="الكمية">
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--navy-3)' }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                  style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderLeft: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--cyan)', transition: 'background 0.18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <Minus style={{ width: '12px', height: '12px' }} />
                </button>
                <span className="orb" style={{ width: '44px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 900, color: 'var(--white)' }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))}
                  style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRight: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--cyan)', transition: 'background 0.18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <Plus style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            </FR>

            {/* Summary */}
            <div style={{ border: '1px solid var(--line)', borderRadius: '6px', marginBottom: '14px', overflow: 'hidden', backgroundColor: 'var(--navy-3)' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,212,255,0.05)' }}>
                <Package style={{ width: '13px', height: '13px', color: 'var(--cyan)' }} />
                <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--cyan)', textTransform: 'uppercase' }}>ملخص الطلب</span>
              </div>
              {[
                { l: 'المنتج', v: product.name.slice(0, 22) },
                { l: 'السعر', v: `${fp.toLocaleString()} دج` },
                { l: 'الكمية', v: `× ${fd.quantity}` },
                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
              ].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 14px', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--mid)' }}>{row.l}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', background: 'rgba(0,212,255,0.04)' }}>
                <span style={{ fontSize: '12px', color: 'var(--mid)' }}>المجموع</span>
                <span className="neon-cyan orb" style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
                  {total().toLocaleString()} <span style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 400, fontSize: '12px', color: 'var(--mid)' }}>دج</span>
                </span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-cyan"
              style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '13px', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1, clipPath: 'none', borderRadius: '6px' }}>
              {sub ? '⚡ جاري المعالجة...' : '✅ تأكيد الطلب'}
            </button>
            <p style={{ fontSize: '11px', color: 'var(--dim)', textAlign: 'center', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <Lock style={{ width: '10px', height: '10px', color: 'var(--cyan)' }} /> دفع آمن ومشفر
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

/* ── CART PAGE ───────────────────────────────────────────────── */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore((state) => state.initCount);

  useEffect(() => {
    const saved = localStorage.getItem(domain);
    if (saved) setCartItems(JSON.parse(saved));
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [domain, store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true);
    fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLivPrice = useCallback(() => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
  const finalTotal = cartTotal + +getLivPrice();

  const updateCart = (newItems: any[]) => { setCartItems(newItems); localStorage.setItem(domain, JSON.stringify(newItems)); initCount(newItems.length); };
  const removeItem = (i: number) => updateCart(cartItems.filter((_, idx) => idx !== i));
  const changeQty = (i: number, delta: number) => { const n = [...cartItems]; n[i].quantity = Math.max(1, n[i].quantity + delta); updateCart(n); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.name = 'الاسم مطلوب';
    if (!fd.customerPhone.trim()) e.phone = 'الهاتف مطلوب';
    if (!fd.customerWelaya) e.welaya = 'الولاية مطلوبة';
    if (!fd.customerCommune) e.commune = 'البلدية مطلوبة';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!validate()) return; setSubmitting(true);
    try {
      const payload = cartItems.map(item => ({
        customerName: fd.customerName, customerPhone: fd.customerPhone,
        customerWelaya: fd.customerWelaya, customerCommune: fd.customerCommune,
        typeLivraison: fd.typeLivraison, quantity: item.quantity,
        priceLoss: selW?.livraisonReturn ?? 0, customerId: item.customerId || '',
        variantDetailId: item.variantDetailId, productId: item.productId,
        storeId: item.storeId, userId: item.userId,
        selectedOffer: item.selectedOffer, selectedVariants: item.selectedVariants,
        platform: item.platform || 'store', finalPrice: item.finalPrice,
        totalPrice: finalTotal, priceLivraison: +getLivPrice(),
      }));
      await axios.post(`${API_URL}/orders/create`, payload);
      setSuccess(true); localStorage.removeItem(domain); setCartItems([]); initCount(0);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  /* ── Success ── */
  if (success) {
    return (
      <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', background: 'var(--panel)', border: '1px solid var(--cyan)', borderRadius: '12px', padding: '60px 40px', boxShadow: 'var(--glow-c)', maxWidth: '480px', width: '100%' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--glow-c)', background: 'rgba(0,212,255,0.06)' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--cyan)' }} />
          </div>
          <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--pink)', letterSpacing: '0.2em', marginBottom: '12px', textTransform: 'uppercase' }}>// ORDER CONFIRMED</p>
          <h2 className="orb" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--white)', marginBottom: '10px' }}>تم استلام طلبك!</h2>
          <p style={{ color: 'var(--mid)', fontSize: '14px', lineHeight: '1.7', marginBottom: '28px' }}>شكراً لثقتك. سنتصل بك قريباً لتأكيد الطلب وترتيب التوصيل 🎮</p>
          <Link href="/" className="btn-cyan" style={{ textDecoration: 'none', justifyContent: 'center' }}>
            <Gamepad2 size={16} /> العودة للمتجر
          </Link>
        </div>
      </div>
    );
  }

  /* ── Empty ── */
  if (cartItems.length === 0) {
    return (
      <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px', padding: '60px 40px', maxWidth: '420px', width: '100%' }}>
          <ShoppingBag size={56} style={{ color: 'var(--dim)', margin: '0 auto 20px', display: 'block', opacity: 0.5 }} />
          <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.2em', marginBottom: '10px' }}>// EMPTY CART</p>
          <h3 className="orb" style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--white)', marginBottom: '16px' }}>السلة فارغة</h3>
          <p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '24px' }}>أضف بعض المنتجات للبدء بالتسوق</p>
          <Link href="/" className="btn-cyan" style={{ textDecoration: 'none', justifyContent: 'center' }}>
            <Gamepad2 size={16} /> تسوق الآن
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ padding: '32px 20px 80px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--pink)', letterSpacing: '0.2em', marginBottom: '8px', textTransform: 'uppercase' }}>// SHOPPING CART</p>
        <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'var(--white)', margin: 0 }}>
          سلة <span className="neon-cyan">التسوق</span>
        </h1>
        <NeonDivider color="cyan" />
      </div>

      <div className="cart-g">
        {/* ── عمود المنتجات ── */}
        <div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'rgba(0,212,255,0.04)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={18} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--cyan)', textTransform: 'uppercase' }}>منتجاتك ({cartItems.length})</span>
            </div>

            {/* Items */}
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '16px', padding: '18px 20px', borderBottom: '1px solid var(--line)', transition: 'background 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.02)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                {/* صورة المنتج */}
                <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--navy-2)' }}>
                  <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage || '/fallback-image.png'} alt={item.product?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                {/* تفاصيل */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--white)', lineHeight: 1.4 }}>{item.product?.name}</h4>
                  {item.selectedOffer && <p style={{ margin: 0, fontSize: '11px', color: 'var(--mid)' }}>الباقة: {item.selectedOffer}</p>}
                  <p className="neon-cyan orb" style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>
                    {item.finalPrice?.toLocaleString()} <span style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 400, fontSize: '12px', color: 'var(--mid)' }}>دج</span>
                  </p>
                  {/* Qty + Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '4px', overflow: 'hidden', background: 'var(--navy-3)' }}>
                      <button onClick={() => changeQty(index, -1)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderLeft: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--cyan)', transition: 'background 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        <Minus size={12} />
                      </button>
                      <span className="orb" style={{ width: '38px', textAlign: 'center', fontSize: '14px', fontWeight: 900, color: 'var(--white)' }}>{item.quantity}</span>
                      <button onClick={() => changeQty(index, 1)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRight: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--cyan)', transition: 'background 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(index)} style={{ marginRight: 'auto', background: 'transparent', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '4px', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, padding: '5px 10px', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,68,68,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,68,68,0.3)'; }}>
                      <Trash2 size={13} /> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Subtotal */}
            <div style={{ padding: '16px 20px', background: 'rgba(0,212,255,0.04)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--mid)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>المجموع الفرعي</span>
              <span className="neon-cyan orb" style={{ fontSize: '1.3rem', fontWeight: 900 }}>{cartTotal.toLocaleString()} <span style={{ fontFamily: "'Tajawal',sans-serif", fontSize: '12px', fontWeight: 400, color: 'var(--mid)' }}>دج</span></span>
            </div>
          </div>
        </div>

        {/* ── عمود التوصيل ── */}
        <div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'rgba(0,212,255,0.04)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={18} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--cyan)', textTransform: 'uppercase' }}>معلومات التوصيل</span>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* الاسم */}
              <div>
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '6px' }}>الاسم الكامل *</p>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="text" value={fd.customerName} onChange={e => { setFd({ ...fd, customerName: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }}
                    placeholder="الاسم الكامل" className={`inp${errors.name ? ' inp-err' : ''}`} style={{ paddingLeft: '36px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.name ? 'var(--pink)' : 'var(--dim)'; }} />
                </div>
                {errors.name && <p style={{ fontSize: '11px', color: 'var(--pink)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={11} /> {errors.name}</p>}
              </div>

              {/* الهاتف */}
              <div>
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '6px' }}>رقم الهاتف *</p>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="tel" value={fd.customerPhone} onChange={e => { setFd({ ...fd, customerPhone: e.target.value }); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
                    placeholder="0XXXXXXXXX" className={`inp${errors.phone ? ' inp-err' : ''}`} style={{ paddingLeft: '36px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.phone ? 'var(--pink)' : 'var(--dim)'; }} />
                </div>
                {errors.phone && <p style={{ fontSize: '11px', color: 'var(--pink)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={11} /> {errors.phone}</p>}
              </div>

              {/* الولاية + البلدية */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '6px' }}>الولاية *</p>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={13} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                    <select value={fd.customerWelaya} onChange={e => { setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' }); if (errors.welaya) setErrors({ ...errors, welaya: '' }); }}
                      className={`inp${errors.welaya ? ' inp-err' : ''}`} style={{ paddingRight: '34px' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.welaya ? 'var(--pink)' : 'var(--dim)'; }}>
                      <option value="">الولاية</option>
                      {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                  {errors.welaya && <p style={{ fontSize: '11px', color: 'var(--pink)', marginTop: '4px' }}>{errors.welaya}</p>}
                </div>
                <div>
                  <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '6px' }}>البلدية *</p>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={13} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                    <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => { setFd({ ...fd, customerCommune: e.target.value }); if (errors.commune) setErrors({ ...errors, commune: '' }); }}
                      className={`inp${errors.commune ? ' inp-err' : ''}`} style={{ paddingRight: '34px', opacity: !fd.customerWelaya ? 0.4 : 1 }}
                      onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.commune ? 'var(--pink)' : 'var(--dim)'; }}>
                      <option value="">{loadingC ? '...' : !fd.customerWelaya ? 'الولاية أولاً' : 'البلدية'}</option>
                      {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                  {errors.commune && <p style={{ fontSize: '11px', color: 'var(--pink)', marginTop: '4px' }}>{errors.commune}</p>}
                </div>
              </div>

              {/* نوع التوصيل */}
              <div>
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8px' }}>نوع التوصيل</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(['home', 'office'] as const).map(type => (
                    <button key={type} type="button" onClick={() => setFd({ ...fd, typeLivraison: type })}
                      style={{ padding: '13px', borderRadius: '4px', border: `1px solid ${fd.typeLivraison === type ? 'var(--cyan)' : 'var(--line)'}`, background: fd.typeLivraison === type ? 'rgba(0,212,255,0.07)' : 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', boxShadow: fd.typeLivraison === type ? 'var(--glow-c)' : 'none' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--cyan)' : 'var(--mid)', marginBottom: '4px' }}>
                        {type === 'home' ? '🏠 للبيت' : '🏢 للمكتب'}
                      </div>
                      <div className="orb" style={{ fontSize: '1rem', fontWeight: 900, color: fd.typeLivraison === type ? 'var(--cyan)' : 'var(--dim)' }}>
                        {selW ? `${(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج` : '---'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ملخص الحساب */}
              <div style={{ border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden', background: 'var(--navy-3)' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', background: 'rgba(0,212,255,0.04)' }}>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>// الملخص المالي</span>
                </div>
                {[
                  { l: 'المجموع الفرعي', v: `${cartTotal.toLocaleString()} دج` },
                  { l: 'رسوم التوصيل', v: getLivPrice() ? `${getLivPrice().toLocaleString()} دج` : '---' },
                ].map(row => (
                  <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--mid)' }}>{row.l}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)' }}>{row.v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px', background: 'rgba(0,212,255,0.05)' }}>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--mid)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>الإجمالي</span>
                  <span className="neon-cyan orb" style={{ fontSize: '2rem', fontWeight: 900 }}>
                    {finalTotal.toLocaleString()} <span style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 400, fontSize: '13px', color: 'var(--mid)' }}>دج</span>
                  </span>
                </div>
              </div>

              {/* زر التأكيد */}
              <button type="submit" disabled={submitting} className="btn-cyan"
                style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, clipPath: 'none', borderRadius: '6px' }}>
                {submitting
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }} /> جاري المعالجة...</span>
                  : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} /> تأكيد الطلب</span>
                }
              </button>

              {/* ضمانات */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {[
                  { icon: <Lock size={11} />, label: 'دفع آمن' },
                  { icon: <ShieldCheck size={11} />, label: 'بيانات مشفّرة' },
                  { icon: <BadgeCheck size={11} />, label: 'موثّق ومعتمد' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--dim)' }}>
                    <span style={{ color: 'var(--cyan)' }}>{b.icon}</span> {b.label}
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

/* ── STATIC PAGES ────────────────────────────────────────────── */
export function StaticPage({ page }: { page: string }) {
  const p = page.toLowerCase();
  return <>{p === 'privacy' && <Privacy />}{p === 'terms' && <Terms />}{p === 'cookies' && <Cookies />}{p === 'contact' && <Contact />}</>;
}

const Shell = ({ children, title, sub }: { children: React.ReactNode; title: string; sub?: string }) => (
  <div dir="rtl" style={{ backgroundColor: 'var(--navy)', minHeight: '100vh' }} className="hex-bg">
    <div style={{ background: 'linear-gradient(135deg,var(--navy-2),var(--navy-3))', padding: '72px 20px 48px', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }} className="circuit-bg">
      <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {sub && <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--pink)', marginBottom: '10px', textTransform: 'uppercase' }}>{sub}</p>}
        <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'var(--white)', lineHeight: 1, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          <span className="neon-cyan">{title}</span>
        </h1>
        <NeonDivider color="pink" />
      </div>
    </div>
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '32px', boxShadow: 'var(--glow-c)' }}>
        {children}
      </div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom: '18px', marginBottom: '18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--white)', margin: '0 0 7px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--cyan)', fontSize: '14px' }}>//</span> {title}
      </h3>
      <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--mid)', margin: 0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', padding: '4px 10px', border: '1px solid var(--pink)', color: 'var(--pink)', borderRadius: '3px', flexShrink: 0, textTransform: 'uppercase' }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="// قانوني">
      <IB title="البيانات التي نجمعها" body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك." />
      <IB title="كيف نستخدمها" body="حصرياً لتنفيذ وتوصيل مشترياتك." />
      <IB title="الأمان" body="بياناتك محمية بتشفير على مستوى المؤسسات." />
      <IB title="مشاركة البيانات" body="لا نبيع البيانات أبداً. تُشارك فقط مع شركاء التوصيل الموثوقين." />
      <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--dim)', marginTop: '16px', letterSpacing: '0.12em' }}>// آخر تحديث: فبراير 2026</p>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الاستخدام" sub="// قانوني">
      <IB title="حسابك" body="أنت مسؤول عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك." />
      <IB title="المدفوعات" body="لا رسوم مخفية. السعر المعروض هو السعر النهائي." />
      <IB title="الاستخدام المحظور" body="المنتجات الأصيلة فقط. لا مجال للمنتجات المقلدة." tag="صارم" />
      <IB title="القانون الحاكم" body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="سياسة الكوكيز" sub="// قانوني">
      <IB title="الكوكيز الأساسية" body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب" />
      <IB title="كوكيز التفضيلات" body="تحفظ إعداداتك لتجربة أفضل." tag="اختياري" />
      <IB title="كوكيز التحليلات" body="بيانات مجمعة ومجهولة لتحسين المنصة." tag="اختياري" />
      <div style={{ marginTop: '16px', padding: '14px', border: '1px solid var(--line)', borderRadius: '6px', display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(0,212,255,0.03)' }}>
        <ToggleRight style={{ width: '18px', height: '18px', color: 'var(--cyan)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.8', margin: 0 }}>يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح.</p>
      </div>
    </Shell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  return (
    <div dir="rtl" style={{ backgroundColor: 'var(--navy)', minHeight: '100vh' }} className="hex-bg">
      <div style={{ background: 'linear-gradient(135deg,var(--navy-2),var(--navy-3))', padding: '72px 20px 48px', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }} className="circuit-bg">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%,rgba(0,212,255,0.06) 0%,transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--pink)', marginBottom: '12px' }}>// تواصل</p>
          <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,6vw,4rem)', color: 'var(--white)', lineHeight: 1, margin: '0 0 14px' }}>
            تواصل <span className="neon-cyan">معنا</span>
          </h1>
          <NeonDivider color="cyan" />
          <p style={{ fontSize: '14px', color: 'var(--mid)', marginTop: '10px' }}>نرد خلال أقل من ساعتين 🎮</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--glow-c)', marginBottom: '12px' }}>
            <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.16em', marginBottom: '16px', textTransform: 'uppercase' }}>طرق التواصل</p>
            {[
              { icon: '📞', label: 'الهاتف', val: '+213 550 000 000', href: 'tel:+213550000000' },
              { icon: '📍', label: 'الموقع', val: 'الجزائر بلدية اولاد فايت بلاطو قرب مسجد ابوبكر الصديق', href: undefined },
              { icon: '🎮', label: 'المتجر', val: 'كل ما تحتاجه للعب الاحترافي', href: undefined },
            ].map(item => (
              <a key={item.label} href={item.href || '#'} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '13px 0', borderBottom: '1px solid var(--line)', textDecoration: 'none', transition: 'padding-right 0.25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.paddingRight = '8px'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.paddingRight = '0'; }}>
                <div style={{ width: '36px', height: '36px', border: '1px solid var(--line)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, background: 'var(--navy-3)' }}>{item.icon}</div>
                <div>
                  <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', color: 'var(--cyan)', letterSpacing: '0.14em', margin: '0 0 3px', textTransform: 'uppercase' }}>{item.label}</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', margin: 0, lineHeight: 1.5 }}>{item.val}</p>
                </div>
                {item.href && <ArrowRight style={{ width: '13px', height: '13px', color: 'var(--pink)', marginRight: 'auto', marginTop: '4px' }} />}
              </a>
            ))}
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--cyan)', borderRadius: '8px', padding: '16px 20px', boxShadow: 'var(--glow-c)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--cyan)', animation: 'pulse-cyan 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>متصل الآن</span>
            </div>
            {[{ l: 'وقت الرد', v: 'أقل من ساعتين' }, { l: 'التوصيل', v: '58 ولاية' }].map(s => (
              <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid var(--line)' }}>
                <span style={{ fontSize: '12px', color: 'var(--mid)' }}>{s.l}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--white)' }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px' }}>
          <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.16em', marginBottom: '20px', textTransform: 'uppercase' }}>أرسل رسالة</p>
          {sent ? (
            <div style={{ minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--cyan)', borderRadius: '8px', textAlign: 'center', padding: '32px', boxShadow: 'var(--glow-c)', background: 'rgba(0,212,255,0.04)' }}>
              <CheckCircle2 style={{ width: '36px', height: '36px', color: 'var(--cyan)', marginBottom: '12px' }} />
              <h3 className="orb" style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--white)', margin: '0 0 8px' }}>تم إرسال رسالتك!</h3>
              <p style={{ fontSize: '13px', color: 'var(--mid)' }}>سنرد عليك في أقل من ساعتين 🎮</p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[{ label: 'اسمك', type: 'text', key: 'name', ph: 'الاسم الكامل' }, { label: 'البريد الإلكتروني', type: 'email', key: 'email', ph: 'بريدك@الإلكتروني' }].map(f => (
                <div key={f.key}>
                  <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--cyan)', marginBottom: '6px', textTransform: 'uppercase' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph} required className="inp"
                    onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--dim)'; e.target.style.boxShadow = 'none'; }} />
                </div>
              ))}
              <div>
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--cyan)', marginBottom: '6px', textTransform: 'uppercase' }}>رسالتك</p>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp"
                  style={{ resize: 'none' as any }}
                  onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--dim)'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <button type="submit" className="btn-cyan" style={{ justifyContent: 'center', width: '100%', clipPath: 'none', borderRadius: '6px', fontSize: '14px', padding: '13px' }}>
                إرسال الرسالة <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}