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
} from 'lucide-react';
import { Store } from '@/types/store';

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

  /* Hexagon BG */
  .hex-bg {
    background-color:var(--navy);
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Crect width='56' height='100' fill='%23050B1A'/%3E%3Cpath d='M28 66L0 50V17L28 1l28 16v33z' fill='none' stroke='%230D1A38' stroke-width='1'/%3E%3Cpath d='M28 100L0 83V50l28-16 28 16v33z' fill='none' stroke='%230D1A38' stroke-width='1'/%3E%3C/svg%3E");
  }

  /* Circuit lines */
  .circuit-bg {
    background-image:
      linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
    background-size:40px 40px;
  }

  /* Neon text */
  .neon-cyan {
    color:var(--cyan);
    text-shadow:0 0 10px rgba(0,212,255,0.8), 0 0 30px rgba(0,212,255,0.4);
  }
  .neon-pink {
    color:var(--pink);
    text-shadow:0 0 10px rgba(255,45,138,0.8), 0 0 30px rgba(255,45,138,0.4);
  }
  .neon-gold {
    color:var(--gold);
    text-shadow:0 0 10px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.4);
  }

  /* Orbitron font */
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

  /* CARD */
  .g-card {
    background:var(--panel);
    border:1px solid var(--line);
    border-radius:8px;
    overflow:hidden;
    transition:transform 0.3s, box-shadow 0.3s, border-color 0.3s;
    cursor:pointer;
    position:relative;
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

  /* NEON BORDER BOX */
  .neon-box {
    border:1px solid var(--line);
    box-shadow:var(--glow-c), inset 0 0 30px rgba(0,212,255,0.03);
    animation:pulse-cyan 3s ease-in-out infinite;
  }
  .neon-box-pk {
    border:1px solid var(--line-pk);
    box-shadow:var(--glow-p), inset 0 0 30px rgba(255,45,138,0.03);
    animation:pulse-pink 3s ease-in-out infinite;
  }

  /* Corner ornaments */
  .corners { position:relative; }
  .corners::before, .corners::after,
  .corners > .c1, .corners > .c2 {
    content:''; position:absolute; width:12px; height:12px;
  }
  .corners::before { top:0; right:0; border-top:2px solid var(--cyan); border-right:2px solid var(--cyan); }
  .corners::after  { bottom:0; left:0; border-bottom:2px solid var(--pink); border-left:2px solid var(--pink); }

  /* Section label */
  .slabel {
    font-family:'Orbitron',monospace; font-size:10px; font-weight:700;
    letter-spacing:0.2em; text-transform:uppercase; color:var(--cyan);
    display:flex; align-items:center; gap:8px;
  }
  .slabel::before { content:'//'; color:var(--pink); }

  /* Responsive */
  .nav-links  { display:flex; align-items:center; gap:24px; }
  .nav-toggle { display:none; }
  .prod-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .cat-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .trust-bar  { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-g   { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; }
  .details-g  { display:grid; grid-template-columns:1fr 1fr; }
  .details-L  { padding:20px 0;position:sticky; top:70px; height:calc(100vh - 70px); overflow:hidden; }
  .details-R  { padding:20px 32px; overflow-y:auto; }
  .contact-g  { display:grid; grid-template-columns:1fr 1fr; gap:48px; }
  .form-2c    { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .dlv-2c     { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

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
    .details-L  { padding: 0; position: static; width: 100%; height:auto;aspect-ratio: 1; margin-buttom: 200px ; display: flex ;flex-direction: column; gap:20px;}
    .details-R  { padding:20px 0px; }
    .contact-g  { grid-template-columns:1fr; gap:28px; }
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
export default function Main({ store, children }: any) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--navy)' }} className="hex-bg">
      <style>{CSS}</style>
      {/* Scan line effect */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right,transparent,var(--cyan),transparent)', opacity: 0.4, pointerEvents: 'none', zIndex: 9999, animation: 'scan-line 8s linear infinite' }} />
      <Navbar store={store} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ── NAVBAR ─────────────────────────────────────────────────── */
export function Navbar({ store }: { store: Store }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const links = [
    { href: `/`, label: 'Store' },
    { href: `/contact`, label: 'Contact Us' },
    { href: `/Privacy`, label: 'Privacy' },
  ];

  return (
    <nav dir="ltr" style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(5,11,26,0.97)' : 'rgba(5,11,26,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--line)',
      boxShadow: scrolled ? '0 4px 24px rgba(0,212,255,0.1)' : 'none',
      transition: 'all 0.3s',
    }}>
      {/* Ticker */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', padding: '6px 0', background: 'linear-gradient(90deg,var(--navy-2),var(--navy-3),var(--navy-2))', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'inline-block', animation: 'ticker 20s linear infinite' }}>
            {Array(10).fill(null).map((_, i) => (
              <span key={i} style={{ fontFamily: "'Tajawal',sans-serif", fontSize: '12px', fontWeight: 700, color: 'var(--cyan)', margin: '0 32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Zap style={{ width: '11px', height: '11px' }} /> {store.topBar.text} <Zap style={{ width: '11px', height: '11px' }} />
              </span>
            ))}
            {Array(10).fill(null).map((_, i) => (
              <span key={`b${i}`} style={{ fontFamily: "'Tajawal',sans-serif", fontSize: '12px', fontWeight: 700, color: 'var(--cyan)', margin: '0 32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Zap style={{ width: '11px', height: '11px' }} /> {store.topBar.text} <Zap style={{ width: '11px', height: '11px' }} />
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>

        {/* Logo */}
        <Link href={`/`} style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          {store.design?.logoUrl
            ? <img src={store.design.logoUrl} alt={store.name} style={{ height: '36px', width: 'auto' }} />
            : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', border: '1px solid var(--cyan)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-c)', position: 'relative' }}>
                  <Gamepad2 style={{ width: '18px', height: '18px', color: 'var(--cyan)' }} />
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: 'var(--pink)', borderRadius: '50%', boxShadow: 'var(--glow-p)' }} />
                </div>
                <div>
                  <span className="orb" style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--white)', letterSpacing: '0.05em', display: 'block', lineHeight: 1 }}>
                    <span className="neon-cyan">{store.name.split(' ')[0]}</span>
                    {store.name.split(' ').slice(1).length > 0 && (
                      <span className="neon-pink"> {store.name.split(' ').slice(1).join(' ')}</span>
                    )}
                  </span>
                </div>
              </div>
            )
          }
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              style={{ fontFamily: "'Tajawal',sans-serif", fontSize: '14px', fontWeight: 600, color: 'var(--mid)', textDecoration: 'none', transition: 'color 0.2s, text-shadow 0.2s', letterSpacing: '0.02em' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--cyan)'; el.style.textShadow = '0 0 8px rgba(0,212,255,0.6)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--mid)'; el.style.textShadow = 'none'; }}>
              {l.label}
            </Link>
          ))}
          <a href="#products" className="btn-cyan" style={{ padding: '9px 22px', fontSize: '13px' }}>
            <Gamepad2 style={{ width: '14px', height: '14px' }} /> Shop Now
          </a>
        </div>

        <button className="nav-toggle" onClick={() => setOpen(p => !p)} style={{ background: 'transparent', border: '1px solid var(--line)', cursor: 'pointer', color: 'var(--cyan)', padding: '8px', borderRadius: '4px', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {open ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div style={{ maxHeight: open ? '260px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease', borderTop: open ? '1px solid var(--line)' : 'none', background: 'rgba(5,11,26,0.98)' }}>
        <div style={{ padding: '10px 20px 18px' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', fontSize: '15px', fontWeight: 700, color: 'var(--mid)', textDecoration: 'none', borderBottom: '1px solid var(--line)' }}>
              {l.label} <ArrowRight style={{ width: '14px', height: '14px', color: 'var(--cyan)' }} />
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
  // unified neon color
  const cyan = 'var(--cyan)';
  const pink = 'var(--pink)';

  return (
    <footer dir="ltr" style={{
      backgroundColor: 'var(--navy-3)', // slightly darker for depth
      borderTop: `2px solid var(--line)`,
      fontFamily: "'Tajawal',sans-serif",
      marginTop: '80px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle light effect in footer corner */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '300px', height: '300px', background: `radial-gradient(circle, ${cyan}05 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 20px 30px' }}>
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          paddingBottom: '40px',
          borderBottom: '1px solid var(--line)'
        }}>

          {/* Section 1: Logo and Description */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '8px', border: `1px solid ${cyan}`, borderRadius: '4px', background: `${cyan}05` }}>
                <Gamepad2 style={{ width: '24px', height: '24px', color: cyan }} />
              </div>
              <span className="orb" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                <span style={{ color: cyan, textShadow: `0 0 10px ${cyan}40` }}>{store.name.split(' ')[0]}</span>
                {store.name.split(' ').slice(1).length > 0 && (
                  <span style={{ color: pink, textShadow: `0 0 10px ${pink}40` }}> {store.name.split(' ').slice(1).join(' ')}</span>
                )}
              </span>
            </div>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--mid)', maxWidth: '300px', fontWeight: 400 }}>
              {store.hero?.subtitle?.substring(0, 80) || 'Your first destination for gaming and professional gear in Algeria. Authentic quality with fast delivery.'}
            </p>

            {/* Social / Gaming Contact Icons */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
              {['🎮', '🕹️', '👾', '🔥'].map((e, i) => (
                <div key={i} style={{
                  width: '36px', height: '36px',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  transition: '0.3s'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = cyan}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                >{e}</div>
              ))}
            </div>
          </div>

          {/* Other Sections: Links and Contact */}
          {[
            {
              title: 'Quick Links', links: [
                [`/`, 'Store'],
                [`/contact`, 'Technical Support'],
                [`/Privacy`, 'Privacy Policy'],
                [`/Terms`, 'Terms of Use'],
              ]
            },
            {
              title: 'Contact Us', links: [
                ['tel:+213550000000', '+213 550 000 000'],
                ['#', 'Algiers, Oued Fayet'],
                ['#', 'Business Center near the Mosque'],
              ]
            },
          ].map(col => (
            <div key={col.title}>
              <p style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: cyan,
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ width: '4px', height: '4px', backgroundColor: pink, borderRadius: '50%' }} />
                {col.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {col.links.map(([href, label]) => (
                  <a key={label} href={href} style={{
                    fontSize: '14px',
                    color: 'var(--mid)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'inline-block'
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = 'white';
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(-5px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--mid)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                    }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Footer Section */}
        <div style={{
          paddingTop: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--dim)', fontWeight: 500 }}>
            © {yr} <span style={{ color: cyan }}>{store.name}</span>. Made with passion for gaming.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ fontSize: '11px', color: 'var(--dim)', letterSpacing: '1px', textTransform: 'uppercase' }}>Shamsou Gaming Engine 2.0</span>
          </div>
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

  // unified color (neon cyan)
  const brandColor = 'var(--cyan)';

  return (
    <div
      className="g-card group"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--navy-3)',
        border: `1px solid ${hov ? brandColor : 'var(--panel)'}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        borderRadius: '4px' // subtle touch to fit the tech style
      }}
    >
      {/* Image Area */}
      <div className="g-img" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--navy-2)' }}>
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="transition-transform duration-700 group-hover:scale-110"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy-3)' }}>
            <Gamepad2 style={{ width: '40px', height: '40px', color: 'var(--dim)' }} />
          </div>
        )}

        {discount > 0 && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'var(--pink)', color: 'var(--white)',
            fontSize: '11px', fontWeight: 900, padding: '3px 10px',
            borderRadius: '2px', boxShadow: '0 0 10px rgba(255, 0, 128, 0.4)',
            zIndex: 10
          }}>
            -{discount}%
          </div>
        )}
      </div>

      {/* [Arabic] */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        <h3 style={{
          fontSize: '14px', fontWeight: 700, color: 'var(--white)',
          marginBottom: '10px', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
          overflow: 'hidden', minHeight: '2.8em'
        }}>
          {product.name}
        </h3>

        <div style={{ display: 'flex', gap: '3px', marginBottom: '15px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} style={{ width: '11px', height: '11px', fill: i < 4 ? brandColor : 'none', color: brandColor }} />
          ))}
        </div>

        {/* Price[Arabic] */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>
              {price.toLocaleString()}
              <span style={{ fontSize: '12px', fontWeight: 600, color: brandColor, marginRight: '4px' }}>DZD</span>
            </span>
            {orig > price && (
              <span style={{ fontSize: '12px', color: 'var(--dim)', textDecoration: 'line-through' }}>
                {orig.toLocaleString()}
              </span>
            )}
          </div>

          {/* [Arabic]:[Arabic] */}
          <Link href={`/product/${product.slug || product.id}`}
            className="gaming-btn"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              fontSize: '13px',
              fontWeight: 800,
              padding: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',

              // normal state: clear cyan text with cyan border
              backgroundColor: hov ? brandColor : 'transparent',
              color: hov ? 'var(--navy-3)' : brandColor,
              border: `2px solid ${brandColor}`,

              boxShadow: hov ? `0 0 20px ${brandColor}80` : 'none',
              transition: 'all 0.25s ease',
              clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)'
            }}>
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
    { icon: <Truck style={{ width: '20px', height: '20px' }} />, color: 'var(--cyan)', title: 'Delivery to 58 Provinces', desc: 'Fast Delivery Across Algeria' },
    { icon: <Shield style={{ width: '20px', height: '20px' }} />, color: 'var(--pink)', title: '100% Authentic Products', desc: 'Quality & Authenticity Guarantee' },
    { icon: <Trophy style={{ width: '20px', height: '20px' }} />, color: 'var(--gold)', title: 'Best Prices', desc: 'Always Competitive Prices' },
    { icon: <Zap style={{ width: '20px', height: '20px' }} />, color: 'var(--purple)', title: 'Fast Service', desc: 'Quick Response to Your Inquiries' },
  ];

  return (
    <div dir="ltr">

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden', backgroundColor: 'var(--navy-3)' }} className="circuit-bg">

        {/* 1.[Arabic]Background[Arabic]Image[Arabic]-[Arabic]Opacity[Arabic]Z-index */}
        {store.hero?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img
              src={store.hero.imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.4, // increased clarity slightly from 0.15 to 0.4
                display: 'block'
              }}
            />
            {/* [Arabic] */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to left, rgba(5,11,26,0.95) 30%, rgba(5,11,26,0.4) 100%)'
            }} />
          </div>
        )}

        {/* 2.[Arabic]Glow[Arabic]Effects[Arabic]-[Arabic] */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,138,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

        {/* 3.[Arabic]Content[Arabic]-[Arabic] */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 20px 60px', position: 'relative', zIndex: 10, width: '100%' }}>

          {/* Brand badge */}
          <div className="fu" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1px solid var(--line)', borderRadius: '4px', padding: '6px 14px', marginBottom: '24px', background: 'rgba(5,11,26,0.8)', backdropFilter: 'blur(4px)' }}>
            <Gamepad2 style={{ width: '14px', height: '14px', color: 'var(--cyan)' }} />
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--cyan)', textTransform: "uppercase" }}>{store.name}</span>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--pink)', animation: 'pulse-pink 2s ease-in-out infinite' }} />
          </div>

          {/* Main headline */}
          <h1 className="fu fu-1" style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(2.2rem,7vw,5.5rem)', lineHeight: 1.05, marginBottom: '16px', letterSpacing: '-0.01em', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <span className="gold-shimmer">Gaming World</span><br />
            <span style={{ color: 'var(--white)' }}>at Your </span>
            <span className="neon-cyan">Fingertips</span>
          </h1>

          <NeonDivider color="cyan" />

          <p className="fu fu-2" style={{ fontSize: 'clamp(14px,2vw,18px)', lineHeight: '1.8', color: 'var(--white)', opacity: 0.9, marginBottom: '32px', maxWidth: '520px', fontWeight: 400, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {store.hero?.subtitle || 'Everything you need for pro gaming — PS5, Xbox, controllers, games and all accessories. Delivery to all Algerian provinces.'}
          </p>

          <div className="fu fu-3" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#products" className="btn-cyan" style={{ fontSize: '15px', padding: '14px 32px', textDecoration: 'none' }}>
              <Gamepad2 style={{ width: '16px', height: '16px' }} /> Shop Now
            </a>
            <a href="#categories" className="btn-ghost-c" style={{ fontSize: '14px', padding: '13px 28px', textDecoration: 'none', border: '1px solid var(--cyan)', color: 'var(--cyan)', borderRadius: '4px' }}>
              Browse Categories <ArrowRight style={{ width: '14px', height: '14px' }} />
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '32px', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
            {[
              { n: `${products.length}+`, l: 'Product Available', c: 'var(--cyan)' },
              { n: '58', l: 'Delivery Province', c: 'var(--pink)' },
              { n: '100%', l: 'Authentic Products', c: 'var(--gold)' },
            ].map((s, i) => (
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
                  <p style={{ fontSize: '11px', color: 'var(--mid)', margin: 0, fontWeight: 400 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (
        <section id="categories" style={{ padding: '80px 0', backgroundColor: 'var(--navy-3)', position: 'relative' }} className="circuit-bg">

          {/* [Arabic] */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)', opacity: 0.3 }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>

            {/* [Arabic]:[Arabic]View[Arabic]All */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: 'rgba(0,212,255,0.1)',
                  border: '1px solid var(--cyan)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 800,
                  color: 'var(--cyan)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  marginBottom: '12px'
                }}>
                  EXPLORE
                </div>
                <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'var(--white)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Shop by <span className="neon-pink" style={{ textShadow: '0 0 15px var(--pink)40' }}>Category</span>
                </h2>
              </div>

              <Link href={`/`}
                className="group"
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--cyan)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}>
                <span style={{ borderBottom: '1px solid transparent', transition: '0.3s' }} className="group-hover:border-cyan-400">View All Categories</span>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }} className="group-hover:bg-cyan-500/10">
                  <ArrowRight style={{ width: '14px', height: '14px' }} />
                </div>
              </Link>
            </div>

            {/* [Arabic]Categories */}
            <div className="cat-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px'
            }}>
              {cats.slice(0, 8).map((cat: any, i: number) => (
                <Link key={cat.id} href={`?category=${cat.id}`}
                  className="group"
                  style={{
                    position: 'relative',
                    display: 'block',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--line)',
                    aspectRatio: '16/10',
                    backgroundColor: 'var(--panel)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--cyan)';
                    el.style.boxShadow = '0 10px 30px rgba(0,212,255,0.2)';
                    el.style.transform = 'translateY(-8px) scale(1.02)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--line)';
                    el.style.boxShadow = 'none';
                    el.style.transform = 'translateY(0) scale(1)';
                  }}>

                  {/* [Arabic] */}
                  <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name}
                        className="transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.6 }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--navy-3), var(--panel))' }}>
                        <Gamepad2 style={{ width: '40px', height: '40px', color: 'var(--cyan)', opacity: 0.2 }} />
                      </div>
                    )}
                  </div>

                  {/* [Arabic] */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(5,11,26,0.9) 0%, rgba(5,11,26,0.2) 50%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '20px',
                    zIndex: 2
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 900,
                      color: 'var(--white)',
                      fontFamily: "'Tajawal', sans-serif",
                      letterSpacing: '0.02em',
                      textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                    }}>
                      {cat.name}
                    </span>
                    <div style={{
                      width: '0%',
                      height: '2px',
                      backgroundColor: 'var(--cyan)',
                      marginTop: '4px',
                      transition: '0.4s ease',
                      boxShadow: '0 0 10px var(--cyan)'
                    }} className="group-hover:w-1/3" />
                  </div>

                  {/* [Arabic] */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    background: `radial-gradient(circle at top right, ${i % 2 === 0 ? 'var(--cyan)' : 'var(--pink)'}40, transparent 70%)`,
                    zIndex: 1
                  }} />

                  {/* [Arabic]([Arabic]Hover) */}
                  <div style={{
                    position: 'absolute',
                    inset: '10px',
                    border: `1px solid ${i % 2 === 0 ? 'var(--cyan)' : 'var(--pink)'}`,
                    opacity: 0,
                    transition: '0.3s',
                    pointerEvents: 'none',
                    borderRadius: '8px'
                  }} className="group-hover:opacity-20" />

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
              <div className="slabel" style={{ marginBottom: '10px' }}>Products</div>
              <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'var(--white)', margin: 0 }}>
                All <span className="neon-cyan">Products</span>
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--dim)', fontWeight: 500 }}>{products.length} Product</p>
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--panel)' }}>
              <Gamepad2 style={{ width: '56px', height: '56px', color: 'var(--dim)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--mid)' }}>Products Coming Soon...</p>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map((p: any) => {
                // add optional chaining after store and design
                const img = p.productImage || p.imagesProduct?.[0]?.imageUrl || store?.design?.logoUrl || '/fallback-image.png'; const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="View Product" />;
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ position: 'relative', padding: '80px 20px', overflow: 'hidden', backgroundColor: 'var(--navy)', textAlign: 'center' }} className="circuit-bg">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(0,212,255,0.05) 0%,rgba(255,45,138,0.05) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px', margin: '0 auto' }}>
          <NeonDivider color="pink" />
          <div style={{ margin: '24px 0' }}>
            <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--pink)', marginBottom: '14px' }}>// Delivery Across Algeria</p>
            <h2 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,5vw,3.5rem)', color: 'var(--white)', lineHeight: 1.05, marginBottom: '16px' }}>
              Delivery <span className="neon-cyan">58 Provinces</span>
            </h2>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--mid)', marginBottom: '28px', fontWeight: 400 }}>
              Oued Fayet, Algiers, near Abu Bakr Mosque
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#products" className="btn-cyan" style={{ fontSize: '14px', padding: '13px 30px' }}>
              <Gamepad2 style={{ width: '15px', height: '15px' }} /> Shop Now
            </a>
            <Link href={`/contact`} className="btn-pink" style={{ fontSize: '14px', padding: '13px 30px', textDecoration: 'none' }}>
              <Phone style={{ width: '15px', height: '15px' }} /> Contact Us
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
    <div dir="ltr" style={{ backgroundColor: 'var(--navy)' }}>
      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid var(--line)', padding: '11px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--dim)', backgroundColor: 'var(--navy-2)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--dim)', transition: 'color 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--cyan)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--dim)'; }}>
          Home
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
            {/* Corner decorations */}
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
                <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '1.2rem', fontWeight: 900, color: 'var(--pink)' }}>Out of Stock</span>
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
            <div className="slabel" style={{ marginBottom: '10px' }}>Product Details</div>
            <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2.2rem)', color: 'var(--white)', lineHeight: 1.15, marginBottom: '14px' }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '13px', height: '13px', fill: i < 4 ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />)}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--mid)' }}>4.8 (128 Rating)</span>
              <span style={{ marginRight: 'auto', padding: '4px 12px', borderRadius: '20px', backgroundColor: inStock || autoGen ? 'rgba(0,212,255,0.1)' : 'rgba(255,45,138,0.1)', color: inStock || autoGen ? 'var(--cyan)' : 'var(--pink)', fontSize: '12px', fontWeight: 700, border: `1px solid ${inStock || autoGen ? 'var(--cyan)' : 'var(--pink)'}` }}>
                {autoGen ? '∞ Available' : inStock ? 'Available' : 'Out of Stock'}
              </span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--navy-3)', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--mid)', letterSpacing: '0.16em', margin: '0 0 6px', textTransform: 'uppercase' }}>Price</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <span className="neon-cyan orb" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '15px', color: 'var(--mid)' }}>DZD</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <>
                    <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                    <span style={{ fontSize: '11px', background: 'var(--pink)', color: 'var(--white)', padding: '2px 8px', borderRadius: '3px', fontWeight: 700 }}>
                      Save {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString()} DZD
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.16em', marginBottom: '10px', textTransform: 'uppercase' }}>Packages</p>
                {product.offers.map((offer: any) => (
                  <label key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1px solid ${selectedOffer === offer.id ? 'var(--cyan)' : 'var(--line)'}`, cursor: 'pointer', marginBottom: '8px', borderRadius: '6px', transition: 'all 0.2s', backgroundColor: selectedOffer === offer.id ? 'rgba(0,212,255,0.05)' : 'transparent', boxShadow: selectedOffer === offer.id ? 'var(--glow-c)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '16px', height: '16px', border: `2px solid ${selectedOffer === offer.id ? 'var(--cyan)' : 'var(--dim)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {selectedOffer === offer.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: 'var(--glow-c)' }} />}
                      </div>
                      <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--white)', margin: 0 }}>{offer.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--mid)', margin: 0 }}>Quantity: {offer.quantity}</p>
                      </div>
                    </div>
                    <span className="neon-cyan orb" style={{ fontSize: '1.1rem', fontWeight: 900, textShadow: 'none' }}>
                      {offer.price.toLocaleString()} <span style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 400, fontSize: '11px', color: 'var(--mid)' }}>DZD</span>
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
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.16em', marginBottom: '12px', textTransform: 'uppercase' }}>Product Description</p>
                <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--mid)', fontWeight: 400 }}
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
    if (!fd.customerName.trim()) e.customerName = 'Name is required';
    if (!fd.customerPhone.trim()) e.customerPhone = 'Phone number is required';
    if (!fd.customerWelaya) e.customerWelaya = 'Province is required';
    if (!fd.customerCommune) e.customerCommune = 'Municipality is required';
    return e;
  };
  const getVariantDetailId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;

    return product.variantDetails.find(v => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const er = validate(); if (Object.keys(er).length) { setErrors(er); return; } setErrors({}); setSub(true);
    console.log({ ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });

    try {
      await axios.post(`${API_URL}/orders`, { ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVariantDetailId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (typeof window !== 'undefined' && fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    } catch (err) { console.error(err); } finally { setSub(false); }
  };

  return (
    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
      <form onSubmit={handleSubmit}>
        <div className="form-2c">
          <FR error={errors.customerName} label="Name">
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
              <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="Full Name"
                className={`inp${errors.customerName ? ' inp-err' : ''}`} style={{ paddingLeft: '36px' }}
                onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.customerName ? 'var(--pink)' : 'var(--dim)'; }} />
            </div>
          </FR>
          <FR error={errors.customerPhone} label="Phone">
            <div style={{ position: 'relative' }}>
              <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
              <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0X XX XX XX XX"
                className={`inp${errors.customerPhone ? ' inp-err' : ''}`} style={{ paddingLeft: '36px' }}
                onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.customerPhone ? 'var(--pink)' : 'var(--dim)'; }} />
            </div>
          </FR>
        </div>
        <div className="form-2c">
          <FR error={errors.customerWelaya} label="Province">
            <div style={{ position: 'relative' }}>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
              <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}
                className={`inp${errors.customerWelaya ? ' inp-err' : ''}`} style={{ paddingRight: '34px' }}
                onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.customerWelaya ? 'var(--pink)' : 'var(--dim)'; }}>
                <option value="">Select Province</option>
                {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FR>
          <FR error={errors.customerCommune} label="Municipality">
            <div style={{ position: 'relative' }}>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
              <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })}
                className={`inp${errors.customerCommune ? ' inp-err' : ''}`} style={{ paddingRight: '34px', opacity: !fd.customerWelaya ? 0.4 : 1 }}
                onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; }} onBlur={e => { e.target.style.borderColor = errors.customerCommune ? 'var(--pink)' : 'var(--dim)'; }}>
                <option value="">{loadingC ? '...' : 'Select Municipality'}</option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FR>
        </div>

        <FR label="Delivery Method">
          <div className="dlv-2c">
            {(['home', 'office'] as const).map(type => (
              <button key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))}
                style={{ padding: '12px 10px', border: `1px solid ${fd.typeLivraison === type ? 'var(--cyan)' : 'var(--line)'}`, backgroundColor: fd.typeLivraison === type ? 'rgba(0,212,255,0.06)' : 'transparent', cursor: 'pointer', textAlign: 'right', borderRadius: '6px', transition: 'all 0.2s', boxShadow: fd.typeLivraison === type ? 'var(--glow-c)' : 'none' }}>
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: fd.typeLivraison === type ? 'var(--cyan)' : 'var(--mid)', margin: '0 0 4px', textTransform: 'uppercase' }}>
                  {type === 'home' ? 'Home' : 'Office'}
                </p>
                {selW && <p className="orb" style={{ fontSize: '1rem', fontWeight: 900, color: fd.typeLivraison === type ? 'var(--cyan)' : 'var(--dim)', margin: 0 }}>
                  {(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()}
                  <span style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 400, fontSize: '11px', marginRight: '3px', color: 'var(--mid)' }}>DZD</span>
                </p>}
              </button>
            ))}
          </div>
        </FR>

        <FR label="Quantity">
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
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--cyan)', textTransform: 'uppercase' }}>Order Summary</span>
          </div>
          {[
            { l: 'Product', v: product.name.slice(0, 22) },
            { l: 'Price', v: `${fp.toLocaleString()} DZD` },
            { l: 'Quantity', v: `× ${fd.quantity}` },
            { l: 'Delivery', v: selW ? `${getLiv().toLocaleString()} DZD` : '—' },
          ].map(row => (
            <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 14px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: '12px', color: 'var(--mid)' }}>{row.l}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)' }}>{row.v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', background: 'rgba(0,212,255,0.04)' }}>
            <span style={{ fontSize: '12px', color: 'var(--mid)' }}>Total</span>
            <span className="neon-cyan orb" style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.01em', textShadow: '0 0 12px rgba(0,212,255,0.6)' }}>
              {total().toLocaleString()} <span style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 400, fontSize: '12px', color: 'var(--mid)' }}>DZD</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={sub} className="btn-cyan"
          style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '13px', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1, clipPath: 'none', borderRadius: '6px' }}>
          {sub ? '⚡ Processing...' : '✅ Place Order'}
        </button>

        <p style={{ fontSize: '11px', color: 'var(--dim)', textAlign: 'center', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <Lock style={{ width: '10px', height: '10px', color: 'var(--cyan)' }} /> Secure & Encrypted Payment
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
  <div dir="ltr" style={{ backgroundColor: 'var(--navy)', minHeight: '100vh' }} className="hex-bg">
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
    <Shell title="Privacy Policy" sub="// Legal">
      <IB title="Data We Collect" body="Only your name, phone number, and delivery address — the minimum needed to process your order." />
      <IB title="How We Use It" body="Exclusively to fulfill and deliver your purchases." />
      <IB title="Security" body="Your data is protected with enterprise-grade encryption." />
      <IB title="Data Sharing" body="We never sell data. Shared only with trusted delivery partners." />
      <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--dim)', marginTop: '16px', letterSpacing: '0.12em' }}>// Last updated: February 2026</p>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="Terms of Use" sub="// Legal">
      <IB title="Your Account" body="You are responsible for the security of your login credentials and all activity under your account." />
      <IB title="Payments" body="No hidden fees. The displayed price is the final price." />
      <IB title="Prohibited Use" body="Authentic products only. No counterfeit goods." tag="Strict" />
      <IB title="Governing Law" body="These terms are governed by the laws of the People's Democratic Republic of Algeria." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="Cookie Policy" sub="// Legal">
      <IB title="Essential Cookies" body="Required for sessions, cart, and checkout. Cannot be disabled." tag="Required" />
      <IB title="Preference Cookies" body="Save your settings for a better experience." tag="Optional" />
      <IB title="Analytics Cookies" body="Aggregated and anonymized data to improve the platform." tag="Optional" />
      <div style={{ marginTop: '16px', padding: '14px', border: '1px solid var(--line)', borderRadius: '6px', display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(0,212,255,0.03)' }}>
        <ToggleRight style={{ width: '18px', height: '18px', color: 'var(--cyan)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.8', margin: 0 }}>
          You can manage cookie preferences in your browser settings.
        </p>
      </div>
    </Shell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  return (
    <div dir="ltr" style={{ backgroundColor: 'var(--navy)', minHeight: '100vh' }} className="hex-bg">
      <div style={{ background: 'linear-gradient(135deg,var(--navy-2),var(--navy-3))', padding: '72px 20px 48px', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }} className="circuit-bg">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%,rgba(0,212,255,0.06) 0%,transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--pink)', marginBottom: '12px' }}>// Contact</p>
          <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,6vw,4rem)', color: 'var(--white)', lineHeight: 1, margin: '0 0 14px' }}>
            Contact <span className="neon-cyan">Us</span>
          </h1>
          <NeonDivider color="cyan" />
          <p style={{ fontSize: '14px', color: 'var(--mid)', marginTop: '10px' }}>We reply in Less Than 2 Hours 🎮</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Info */}
        <div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', boxShadow: 'var(--glow-c)', marginBottom: '12px' }}>
            <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.16em', marginBottom: '16px', textTransform: 'uppercase' }}>Contact Methods</p>
            {[
              { icon: '📞', label: 'Phone', val: '+213 550 000 000', href: 'tel:+213550000000' },
              { icon: '📍', label: 'Location', val: 'Oued Fayet, Algiers, near Abu Bakr Mosque', href: undefined },
              { icon: '🎮', label: 'Store', val: 'Chamsou Game — Everything You Need for Pro Gaming', href: undefined },
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

          {/* Status widget */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--cyan)', borderRadius: '8px', padding: '16px 20px', boxShadow: 'var(--glow-c)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--cyan)', animation: 'pulse-cyan 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Connected Now</span>
            </div>
            {[{ l: 'Response Time', v: 'Less Than 2 Hours' }, { l: 'Delivery', v: '58 Provinces' }].map(s => (
              <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid var(--line)' }}>
                <span style={{ fontSize: '12px', color: 'var(--mid)' }}>{s.l}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--white)' }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px' }}>
          <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '10px', color: 'var(--cyan)', letterSpacing: '0.16em', marginBottom: '20px', textTransform: 'uppercase' }}>Send Message</p>
          {sent ? (
            <div style={{ minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--cyan)', borderRadius: '8px', textAlign: 'center', padding: '32px', boxShadow: 'var(--glow-c)', background: 'rgba(0,212,255,0.04)' }}>
              <CheckCircle2 style={{ width: '36px', height: '36px', color: 'var(--cyan)', marginBottom: '12px' }} />
              <h3 className="orb" style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--white)', margin: '0 0 8px' }}>Your Message Was Sent!</h3>
              <p style={{ fontSize: '13px', color: 'var(--mid)' }}>We'll reply in Less Than 2 Hours 🎮</p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Your Name', type: 'text', key: 'name', ph: 'Full Name' },
                { label: 'Email Address', type: 'email', key: 'email', ph: 'your@email.com' },
              ].map(f => (
                <div key={f.key}>
                  <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--cyan)', marginBottom: '6px', textTransform: 'uppercase' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph} required className="inp"
                    onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--dim)'; e.target.style.boxShadow = 'none'; }} />
                </div>
              ))}
              <div>
                <p style={{ fontFamily: "'Orbitron',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', color: 'var(--cyan)', marginBottom: '6px', textTransform: 'uppercase' }}>Your Message</p>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="How can we help you?" rows={4} required className="inp"
                  style={{ resize: 'none' as any }}
                  onFocus={e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--dim)'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <button type="submit" className="btn-cyan" style={{ justifyContent: 'center', width: '100%', clipPath: 'none', borderRadius: '6px', fontSize: '14px', padding: '13px' }}>
                Send Message <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}