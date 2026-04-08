'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  ShoppingCart, MapPin, Phone, User,
  Home as HomeIcon, ChevronDown, Truck, Shield, Package,
  Building2, AlertCircle, Tag, Zap,
  Check, ChevronLeft, ChevronRight, FileText, Heart,
  Infinity, Link2, Share2, X,
  ShieldCheck, Eye, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Cpu, Globe2, Mail,
} from 'lucide-react';
import { Store } from '@/types/store';

// ─────────────────────────────────────────────────────────────
// CONSTANTS & TYPES
// ─────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;500&display=swap');
  * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #020810; }
  ::-webkit-scrollbar-thumb { background: #00E5FF; }
  @keyframes pulse-glow { 0%,100%{box-shadow:0 0 10px rgba(0,229,255,0.2)} 50%{box-shadow:0 0 25px rgba(0,229,255,0.5)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes glow-pulse { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
  @keyframes data-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes data-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .hex-grid { background-image: linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px); background-size: 50px 50px; }
  .neon-text { text-shadow: 0 0 20px rgba(0,229,255,0.5), 0 0 60px rgba(0,229,255,0.2); }
  .stat-card { border: 1px solid #0D2030; transition: all 0.3s; }
  .stat-card:hover { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 20px rgba(0,229,255,0.06); }
  .tech-nav-link { position: relative; }
  .tech-nav-link::before { content:'['; opacity:0; transition:opacity 0.2s; margin-left:4px; color:#00E5FF; }
  .tech-nav-link::after  { content:']'; opacity:0; transition:opacity 0.2s; margin-right:4px; color:#00E5FF; }
  .tech-nav-link:hover::before, .tech-nav-link:hover::after { opacity:1; }
  .corner-tl { border-top:1.5px solid #00E5FF; border-right:1.5px solid #00E5FF; width:8px; height:8px; position:absolute; top:-1px; right:-1px; }
  .corner-br { border-bottom:1.5px solid #00E5FF; border-left:1.5px solid #00E5FF; width:8px; height:8px; position:absolute; bottom:-1px; left:-1px; }
`;

interface Offer               { id: string; name: string; quantity: number; price: number; }
interface Variant             { id: string; name: string; value: string; }
interface Attribute           { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage        { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail       { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya              { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune             { id: string; name: string; ar_name: string; wilayaId: string; }

export interface Product {
  id: string; name: string; price: string | number;
  priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[];
  offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; };
}

export interface ProductFormProps {
  product:          Product;
  userId:           string;
  domain:           string;
  redirectPath?:    string;
  selectedOffer:    string | null;
  setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>;
  platform?:        string;
  priceLoss?:       number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some(e => e.attrName === attrName && e.value === val)
  );
}

const fetchWilayas  = async (userId: string): Promise<Wilaya[]>   => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wilayaId: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`); return data || []; } catch { return []; } };

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────

export default function Main({ store, children }: any) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050B14', fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{FONT_CSS}</style>

      {store.topBar?.enabled && store.topBar?.text && (
        <div className="relative overflow-hidden py-2 px-4 text-center text-xs tracking-widest uppercase"
          style={{ backgroundColor: '#000D1A', color: '#00E5FF', borderBottom: '1px solid rgba(0,229,255,0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="mr-2" style={{ color: '#39FF14' }}>⚡</span>
          {store.topBar.text}
          <span className="ml-2" style={{ color: '#39FF14' }}>⚡</span>
        </div>
      )}

      <Navbar store={store} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────

export function Navbar({ store }: { store: Store }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [tick,       setTick]       = useState(true);
  const [clock,      setClock]      = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => !t), 800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString('ar', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const navItems = [
    { href: `/`,         label: 'Home',        code: '01' },
    { href: `/contact`, label: 'Contact Us',        code: '02' },
    { href: `/Privacy`, label: 'Privacy Policy', code: '03' },
  ];

  const initials = store.name.split(' ').filter(Boolean).map((w: string) => w[0].toUpperCase()).join('');

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'shadow-[0_4px_30px_rgba(0,229,255,0.08)]' : ''}`}
      style={{ backgroundColor: scrolled ? 'rgba(5,11,20,0.97)' : '#050B14', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: '1px solid #0D1F2D', fontFamily: "'JetBrains Mono', monospace" }}
      dir="ltr"
    >
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #00E5FF 40%, #39FF14 60%, transparent)' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href={`/`} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 flex items-center justify-center" style={{ border: '1px solid #00E5FF', boxShadow: '0 0 12px rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.05)' }}>
                {store.design.logoUrl
                  ? <img src={store.design.logoUrl} alt={store.name} className="h-6 w-auto object-contain" />
                  : <span className="text-sm font-bold" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif" }}>{initials}</span>
                }
                <span className="corner-tl" /><span className="corner-br" />
              </div>
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest group-hover:text-[#00E5FF] transition-colors duration-200" style={{ color: '#C8D8E8', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.15em' }}>
                {store.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#39FF14' }} />
                <span className="text-[9px] tracking-widest" style={{ color: '#39FF14' }}>Connected</span>
                <span className="text-[9px]" style={{ color: '#1A3A4A' }}>| System_Active</span>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="tech-nav-link flex items-center gap-2 text-[11px] tracking-widest transition-colors duration-200 group" style={{ color: '#6A8A9A' }}>
                <span style={{ color: '#00E5FF', opacity: 0.45 }}>{item.code}/</span>
                <span className="group-hover:text-[#00E5FF] transition-colors duration-200">{item.label}</span>
              </Link>
            ))}
            <div className="text-[10px] tracking-wider px-3 py-1.5 text-center" style={{ border: '1px solid #0D2030', color: '#2A5A6A', minWidth: '88px' }}>
              {clock || '──:──:──'}
              <span style={{ color: tick ? '#00E5FF' : 'transparent', marginLeft: '3px' }}>▮</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(p => !p)} className="md:hidden p-2 flex flex-col gap-1.5 items-end" aria-label="Toggle Menu">
            {isMenuOpen
              ? <Zap className="w-5 h-5" style={{ color: '#00E5FF' }} />
              : (<><span className="block h-px w-5" style={{ backgroundColor: '#00E5FF' }} /><span className="block h-px w-3" style={{ backgroundColor: '#00E5FF' }} /><span className="block h-px w-5" style={{ backgroundColor: '#00E5FF' }} /></>)
            }
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-56 pb-5' : 'max-h-0'}`}>
          <div className="pt-4 flex flex-col gap-4" style={{ borderTop: '1px solid #0D1F2D' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-[11px] tracking-widest hover:text-[#00E5FF] transition-colors" style={{ color: '#6A8A9A' }}>
                <span style={{ color: '#00E5FF' }}>{item.code}_</span>{item.label}
              </Link>
            ))}
            <div className="text-[10px] tracking-wider mt-2 py-2 text-center" style={{ borderTop: '1px solid #0D1F2D', color: '#2A5A6A' }}>
              {clock || '──:──:──'}<span style={{ color: tick ? '#00E5FF' : 'transparent', marginLeft: '3px' }}>▮</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────

export function Footer({ store }: any) {
  return (
    <footer dir="ltr" style={{ backgroundColor: '#020810', borderTop: '1px solid #0D1F2D', fontFamily: "'JetBrains Mono', monospace", position: 'relative', overflow: 'hidden' }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-10 pb-10" style={{ borderBottom: '1px solid #0D1F2D' }}>

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center" style={{ border: '1px solid rgba(0,229,255,0.4)', boxShadow: '0 0 10px rgba(0,229,255,0.15)' }}>
                {store.design.logoUrl
                  ? <img src={store.design.logoUrl} alt={store.name} className="h-5 w-auto object-contain opacity-80" />
                  : <span className="text-xs font-bold" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif" }}>{store.name.charAt(0)}</span>
                }
              </div>
              <span className="text-sm tracking-widest font-bold" style={{ color: '#C8D8E8', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.12em' }}>{store.name}</span>
            </div>
            <p className="text-[11px] leading-relaxed max-w-xs" style={{ color: '#2A5A6A' }}>
              // next-generation commerce platform<br />
              // powered by innovation engine v4.2
            </p>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="animate-pulse" style={{ color: '#39FF14' }}>●</span>
              <span style={{ color: '#39FF14' }}>All Systems Operational</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: '#00E5FF' }}>// Navigation</p>
            {[
              { href: `/Privacy`, label: 'privacy_policy'     },
              { href: `/Terms`,   label: 'terms_of_use'     },
              { href: `/Cookies`, label: 'cookie_protocol'  },
            ].map(link => (
              <a key={link.href} href={link.href} className="flex items-center gap-2 text-[11px] tracking-wider hover:text-[#00E5FF] transition-colors group" style={{ color: '#3A6070' }}>
                <span className="group-hover:text-[#39FF14] transition-colors" style={{ color: '#1A3040' }}>›</span>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-widest" style={{ color: '#1A3A4A' }}>© {new Date().getFullYear()} {store.name.toUpperCase()} — All Rights Reserved</p>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: '#1A3040' }}>
            <span style={{ color: '#00E5FF', opacity: 0.4 }}>◈</span>
            <span>Tech Innovation Theme</span>
            <span style={{ color: '#00E5FF', opacity: 0.4 }}>◈</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  return (
    <div
      className="group relative flex flex-col overflow-hidden transition-all duration-300"
      style={{ backgroundColor: '#080F1A', border: '1px solid #0D2030', fontFamily: "'JetBrains Mono', monospace" }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,229,255,0.5)'; el.style.boxShadow = '0 0 25px rgba(0,229,255,0.08), inset 0 0 40px rgba(0,229,255,0.02)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0D2030'; el.style.boxShadow = 'none'; }}
    >
      <span className="absolute top-0 left-0 w-4 h-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderTop: '1.5px solid #00E5FF', borderLeft: '1.5px solid #00E5FF' }} />
      <span className="absolute bottom-0 right-0 w-4 h-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderBottom: '1.5px solid #00E5FF', borderRight: '1.5px solid #00E5FF' }} />

      <div className="absolute top-3 left-3 z-10 text-[9px] tracking-widest px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF' }}>
        unit_{String(product.id).slice(-3).toUpperCase()}
      </div>

      <div className="relative h-56 overflow-hidden" style={{ backgroundColor: '#040C16' }}>
        {displayImage ? (
          <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center" style={{ border: '1px solid #0D2030' }}>
              <Zap className="w-6 h-6" style={{ color: '#1A4A5A' }} />
            </div>
            <span className="text-[10px] tracking-widest" style={{ color: '#1A3A4A' }}>no_image</span>
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.015) 2px, rgba(0,229,255,0.015) 4px)' }} />
        {discount > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 text-[10px] tracking-widest font-bold" style={{ backgroundColor: '#39FF14', color: '#020810' }}>
            -{discount}%
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 py-1 px-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ backgroundColor: 'rgba(0,229,255,0.08)', borderTop: '1px solid rgba(0,229,255,0.15)' }}>
          <p className="text-[9px] tracking-widest" style={{ color: '#00E5FF' }}>◉ unit_scan_complete</p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-medium mb-1 line-clamp-1 group-hover:text-[#00E5FF] transition-colors" style={{ color: '#C8D8E8', fontFamily: "'Orbitron', sans-serif", fontSize: '0.75rem', letterSpacing: '0.08em' }}>
          {product.name}
        </h3>
        {product.desc && (
          <div className="text-[11px] mb-4 line-clamp-2 leading-relaxed opacity-50" style={{ color: '#6A8A9A' }} dangerouslySetInnerHTML={{ __html: product.desc }} />
        )}
        <div className="my-3 h-px" style={{ background: 'linear-gradient(90deg, #00E5FF22, transparent)' }} />
        <div className="mt-auto space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="font-bold" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", fontSize: '1.3rem' }}>{product.price}</span>
            <span className="text-[10px] tracking-widest" style={{ color: '#2A6A7A' }}>{store.currency}</span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="text-xs line-through" style={{ color: '#2A4A5A' }}>{product.priceOriginal}</span>
            )}
          </div>
          <Link
            href={`/product/${product.slug || product.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 text-[10px] tracking-widest uppercase font-bold transition-all duration-300"
            style={{ border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF', backgroundColor: 'transparent' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#00E5FF'; el.style.color = '#020810'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'transparent'; el.style.color = '#00E5FF'; }}
          >
            <Zap className="w-3 h-3" /> {viewDetails}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────

export const Home = ({ store }: any) => {
  const stats = [
    { icon: <Cpu className="w-4 h-4" />,    label: 'active_units',    val: store.products?.length  || 0 },
    { icon: <Globe2 className="w-4 h-4" />, label: 'Categories',      val: store.categories?.length || 0 },
    { icon: <Shield className="w-4 h-4" />, label: 'full_security',      val: '100%' },
    { icon: <Zap className="w-4 h-4" />,    label: 'fast_delivery',     val: '24 Hours' },
  ];

  return (
    <div className="min-h-screen" dir="ltr" style={{ backgroundColor: '#050B14', fontFamily: "'JetBrains Mono', monospace" }}>

      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '90vh' }}>
        <div className="absolute inset-0 hex-grid" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,229,255,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: '40%', height: '1px', background: 'linear-gradient(90deg, transparent, #00E5FF)', transform: 'rotate(-15deg)' }} />
          <div style={{ position: 'absolute', top: '30%', right: '5%', width: '30%', height: '1px', background: 'linear-gradient(90deg, #00E5FF, transparent)', transform: 'rotate(10deg)' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, #39FF14)' }} />
        </div>

        <div className="absolute top-12 right-12 text-[10px] tracking-widest hidden lg:block" style={{ color: '#1A4A5A' }}>
          <div>system_version: 4.2.1</div>
          <div>node_status: <span style={{ color: '#39FF14' }}>active</span></div>
          <div>uptime: 99.98%</div>
        </div>
        <div className="absolute bottom-16 left-12 text-[10px] tracking-widest hidden lg:block" style={{ color: '#1A4A5A' }}>
          <div>lat_Offer: 36.73°N</div><div>long: 3.09°E</div>
          <div>signal: <span style={{ color: '#00E5FF' }}>████████░░</span></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {store.hero.imageUrl && (
            <div className="absolute inset-0 -z-10 overflow-hidden" style={{ opacity: 0.15 }}>
              <img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5" style={{ border: '1px solid rgba(0,229,255,0.3)', backgroundColor: 'rgba(0,229,255,0.04)' }}>
            <span className="animate-pulse w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#39FF14' }} />
            <span className="text-[10px] tracking-widest uppercase" style={{ color: '#00E5FF' }}>
              system_Connected — ready_for_deploy
            </span>
          </div>
          {store.hero.title && (
            <h1 className="neon-text mb-5 leading-none" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(2.2rem, 7vw, 6rem)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {store.hero.title}
            </h1>
          )}
          {store.hero.subtitle && (
            <p className="mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: '#4A7A8A', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              // {store.hero.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#products" className="flex items-center gap-2 px-8 py-3.5 text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]" style={{ backgroundColor: '#00E5FF', color: '#020810' }}>
              <Zap className="w-3.5 h-3.5" /> explore_Products
            </a>
            <a href="#categories" className="flex items-center gap-2 px-8 py-3.5 text-xs tracking-widest uppercase transition-all duration-300"
              style={{ border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF', backgroundColor: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,229,255,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              view_Categories
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #00E5FF, #39FF14, transparent)' }} />
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: '1px solid #0D1F2D', borderBottom: '1px solid #0D1F2D', backgroundColor: '#030810' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card flex items-center gap-4 px-5 py-4" style={{ backgroundColor: '#050B14' }}>
                <div className="flex-shrink-0" style={{ color: '#00E5FF' }}>{stat.icon}</div>
                <div>
                  <p className="text-[9px] tracking-widest mb-0.5" style={{ color: '#2A5A6A' }}>{stat.label}</p>
                  <p className="font-bold text-sm" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif" }}>{stat.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-5 mb-12">
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#00E5FF' }}>◈ Categories</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
            <span className="text-[10px]" style={{ color: '#1A3A4A' }}>unit_database_02</span>
          </div>
          {store.categories && store.categories.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              <Link href={`/${store.domain}`}
                className="flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-widest uppercase transition-all duration-200"
                style={{ border: '1px solid rgba(0,229,255,0.4)', color: '#00E5FF', backgroundColor: 'rgba(0,229,255,0.04)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,229,255,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,229,255,0.04)'; }}
              >
                <span style={{ color: '#39FF14' }}>◉</span> All
              </Link>
              {store.categories.map((cat: any, i: number) => (
                <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-widest uppercase transition-all duration-200"
                  style={{ border: '1px solid #0D2030', color: '#4A7A8A', backgroundColor: '#080F1A' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,229,255,0.4)'; el.style.color = '#00E5FF'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0D2030'; el.style.color = '#4A7A8A'; }}
                >
                  <span style={{ color: '#1A3A4A' }}>{String(i + 1).padStart(2, '0')}/</span>{cat.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center" style={{ border: '1px dashed #0D2030' }}>
              <p className="text-[11px] tracking-widest" style={{ color: '#1A4A5A' }}>// no data streams available</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-5 mb-12">
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#00E5FF' }}>◈ product_database_datas</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
            <span className="text-[10px]" style={{ color: '#1A3A4A' }}>Records: {store.products?.length || 0}</span>
          </div>
          {store.products && store.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {store.products.map((product: any) => {
                const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
                const discount = product.priceOriginal
                  ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} store={store} viewDetails="view_details" />;
              })}
            </div>
          ) : (
            <div className="py-24 text-center" style={{ border: '1px dashed #0D2030' }}>
              <Zap className="w-10 h-10 mx-auto mb-4 opacity-20" style={{ color: '#00E5FF' }} />
              <p className="text-xs tracking-widest mb-2" style={{ color: '#1A4A5A', fontFamily: "'Orbitron', sans-serif" }}>database_empty</p>
              <p className="text-[10px] tracking-widest" style={{ color: '#0D2A3A' }}>// no records found in the database</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DETAILS PAGE
// ─────────────────────────────────────────────────────────────

export function Details({
  product, toggleWishlist, isWishlisted, handleShare, discount,
  allImages, allAttrs, finalPrice, inStock, autoGen,
  selectedVariants, setSelectedOffer, selectedOffer,
  resolvedParams, handleVariantSelection, domain,
}: any) {
  const [submitSuccess,  setSubmitSuccess]  = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [selectedImage,  setSelectedImage]  = useState(0);

  return (
    <div className="min-h-screen" dir="ltr" style={{ backgroundColor: '#050B14', fontFamily: "'JetBrains Mono', monospace" }}>

      {submitSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4" style={{ backgroundColor: '#050B14', border: '1px solid rgba(57,255,20,0.4)', boxShadow: '0 0 30px rgba(57,255,20,0.15)', fontFamily: "'JetBrains Mono', monospace" }}>
          <div className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: '#39FF14' }}>
            <Check className="w-3.5 h-3.5 text-black" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest" style={{ color: '#39FF14' }}>confirm_order.success</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#2A5A6A' }}>// we'll contact you within 24h to confirm</p>
          </div>
        </div>
      )}
      {showShareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest" style={{ backgroundColor: '#050B14', border: '1px solid rgba(0,229,255,0.4)', color: '#00E5FF' }}>
          <Link2 className="w-3.5 h-3.5" />link_copied
        </div>
      )}

      {/* [Arabic]navigation */}
      <header style={{ borderBottom: '1px solid #0D1F2D', backgroundColor: 'rgba(5,11,20,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-[10px] tracking-widest" style={{ color: '#2A5A6A' }}>
            <span className="hover:text-[#00E5FF] cursor-pointer transition-colors">Home</span>
            <span style={{ color: '#00E5FF' }}>/</span>
            <span className="hover:text-[#00E5FF] cursor-pointer transition-colors">catalog</span>
            <span style={{ color: '#00E5FF' }}>/</span>
            <span style={{ color: '#C8D8E8' }}>{product.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleWishlist} className="w-8 h-8 flex items-center justify-center transition-all" style={{ border: '1px solid #0D2030', color: isWishlisted ? '#FF3B30' : '#3A6A7A', backgroundColor: isWishlisted ? 'rgba(255,59,48,0.08)' : 'transparent' }}>
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center" style={{ border: '1px solid #0D2030', color: '#3A6A7A' }}>
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 text-[9px] tracking-widest font-bold" style={{ border: `1px solid ${inStock ? 'rgba(57,255,20,0.3)' : 'rgba(255,59,48,0.3)'}`, backgroundColor: inStock ? 'rgba(57,255,20,0.06)' : 'rgba(255,59,48,0.06)', color: inStock ? '#39FF14' : '#FF3B30' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'animate-pulse' : ''}`} style={{ backgroundColor: inStock ? '#39FF14' : '#FF3B30' }} />
              {inStock ? 'in_stock' : 'out_of_stock'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* ──[Arabic]── */}
          <div className="space-y-3">
            <div className="relative overflow-hidden group" style={{ aspectRatio: '1', backgroundColor: '#040C16', border: '1px solid #0D2030' }}>
              {allImages.length > 0 ? (
                <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" loading="eager" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Package className="w-16 h-16" style={{ color: '#0D2030' }} />
                  <span className="text-[10px] tracking-widest" style={{ color: '#1A3A4A' }}>no_image</span>
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.012) 3px, rgba(0,229,255,0.012) 4px)' }} />
              <span className="absolute top-3 right-3 w-5 h-5" style={{ borderTop: '1.5px solid #00E5FF', borderRight: '1.5px solid #00E5FF' }} />
              <span className="absolute bottom-3 left-3 w-5 h-5" style={{ borderBottom: '1.5px solid #00E5FF', borderLeft: '1.5px solid #00E5FF' }} />
              {discount > 0 && (
                <div className="absolute top-4 left-4 px-2.5 py-1 text-[10px] tracking-widest font-bold" style={{ backgroundColor: '#39FF14', color: '#020810' }}>
                  -{discount}%
                </div>
              )}
              <button onClick={toggleWishlist} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center transition-all" style={{ backgroundColor: isWishlisted ? '#FF3B30' : 'rgba(5,11,20,0.8)', border: '1px solid rgba(0,229,255,0.2)', color: isWishlisted ? 'white' : '#00E5FF' }}>
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              {!inStock && !autoGen && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(5,11,20,0.85)', backdropFilter: 'blur(4px)' }}>
                  <div className="px-6 py-3 text-xs tracking-widest font-bold" style={{ border: '1px solid rgba(255,59,48,0.4)', color: '#FF3B30', fontFamily: "'Orbitron', sans-serif" }}>unit_unavailable</div>
                </div>
              )}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage((p: number) => p === 0 ? allImages.length - 1 : p - 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ backgroundColor: 'rgba(5,11,20,0.8)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF' }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedImage((p: number) => p === allImages.length - 1 ? 0 : p + 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ backgroundColor: 'rgba(5,11,20,0.8)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF' }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className="shrink-0 w-16 h-16 overflow-hidden transition-all duration-200" style={{ border: `1px solid ${selectedImage === idx ? '#00E5FF' : '#0D2030'}`, boxShadow: selectedImage === idx ? '0 0 12px rgba(0,229,255,0.25)' : 'none', opacity: selectedImage === idx ? 1 : 0.5 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* [Arabic] */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'secure_payment'     },
                { icon: <Truck className="w-3.5 h-3.5" />,       label: 'fast_shipping'    },
                { icon: <Zap className="w-3.5 h-3.5" />,         label: 'quality_guarantee' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 py-3" style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}>
                  <span style={{ color: '#00E5FF' }}>{b.icon}</span>
                  <span className="text-[9px] tracking-widest" style={{ color: '#2A5A6A' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ──[Arabic]+[Arabic]── */}
          <div className="space-y-7">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: '#00E5FF' }}>◈ product_data</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
              </div>
              <h1 className="leading-tight mb-3" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#FFFFFF', letterSpacing: '0.04em' }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm" style={{ color: i < 4 ? '#00E5FF' : '#1A3A4A' }}>◆</span>
                  ))}
                </div>
                <span className="text-[10px] tracking-widest" style={{ color: '#2A5A6A' }}>Rating: 4.8 | 128 Reviews</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-5 relative" style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #00E5FF, transparent)' }} />
              <p className="text-[9px] tracking-widest mb-2" style={{ color: '#2A5A6A' }}>unit_price</p>
              <div className="flex items-baseline gap-4">
                <span className="font-black" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '2.5rem', color: '#00E5FF', textShadow: '0 0 20px rgba(0,229,255,0.3)' }}>
                  {finalPrice.toLocaleString('ar-DZ')}
                </span>
                <span className="text-xs tracking-widest" style={{ color: '#2A6A7A' }}>DZD</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <div>
                    <span className="text-sm line-through" style={{ color: '#1A4A5A' }}>{parseFloat(product.priceOriginal).toLocaleString('ar-DZ')} DZD</span>
                    <p className="text-[9px] tracking-widest mt-0.5" style={{ color: '#39FF14' }}>Save: {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString('ar-DZ')} DZD</p>
                  </div>
                )}
              </div>
            </div>

            {/* [Arabic] */}
            <div className="inline-flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest font-bold" style={{ border: `1px solid ${autoGen ? 'rgba(0,229,255,0.3)' : inStock ? 'rgba(57,255,20,0.3)' : 'rgba(255,59,48,0.3)'}`, backgroundColor: autoGen ? 'rgba(0,229,255,0.04)' : inStock ? 'rgba(57,255,20,0.04)' : 'rgba(255,59,48,0.04)', color: autoGen ? '#00E5FF' : inStock ? '#39FF14' : '#FF3B30' }}>
              {autoGen ? <Infinity className="w-3.5 h-3.5" /> : inStock ? <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> : <X className="w-3.5 h-3.5" />}
              {autoGen ? 'unlimited_stock' : inStock ? 'stock_available' : 'out_of_stock'}
            </div>

            {/* Packages */}
            {product.offers?.length > 0 && (
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: '#00E5FF' }}>◈ available_Packages</p>
                <div className="space-y-2">
                  {product.offers.map((offer: any) => (
                    <label key={offer.id} className="flex items-center justify-between p-4 cursor-pointer transition-all duration-200" style={{ border: `1px solid ${selectedOffer === offer.id ? 'rgba(0,229,255,0.5)' : '#0D2030'}`, backgroundColor: selectedOffer === offer.id ? 'rgba(0,229,255,0.05)' : '#080F1A', boxShadow: selectedOffer === offer.id ? '0 0 15px rgba(0,229,255,0.1)' : 'none' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center" style={{ border: `1px solid ${selectedOffer === offer.id ? '#00E5FF' : '#1A3A4A'}` }}>
                          {selectedOffer === offer.id && <div className="w-2 h-2" style={{ backgroundColor: '#00E5FF' }} />}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                        <div>
                          <p className="text-xs font-medium" style={{ color: '#C8D8E8' }}>{offer.name}</p>
                          <p className="text-[9px] tracking-wider mt-0.5" style={{ color: '#2A5A6A' }}>Quantity: {offer.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", fontSize: '1rem' }}>
                        {offer.price.toLocaleString('ar-DZ')} <span className="text-xs">DZD</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* [Arabic] */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id}>
                <p className="text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: '#00E5FF' }}>◈ {attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} className="w-9 h-9 transition-all duration-200" style={{ backgroundColor: v.value, border: `2px solid ${isSel ? '#00E5FF' : 'transparent'}`, boxShadow: isSel ? '0 0 12px rgba(0,229,255,0.4)' : 'none' }} />;
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className="w-14 h-14 overflow-hidden transition-all" style={{ border: `1px solid ${isSel ? '#00E5FF' : '#0D2030'}`, boxShadow: isSel ? '0 0 12px rgba(0,229,255,0.25)' : 'none' }}>
                          <img src={v.value} alt={v.name} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className="px-5 py-2 text-[10px] tracking-widest uppercase transition-all duration-200" style={{ border: `1px solid ${isSel ? '#00E5FF' : '#0D2030'}`, backgroundColor: isSel ? 'rgba(0,229,255,0.08)' : '#080F1A', color: isSel ? '#00E5FF' : '#3A6A7A', boxShadow: isSel ? '0 0 12px rgba(0,229,255,0.15)' : 'none' }}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
          </div>
        </div>

        {/* [Arabic] */}
        {product.desc && (
          <section className="mt-20 pt-12" style={{ borderTop: '1px solid #0D1F2D' }}>
            <div className="flex items-center gap-5 mb-8">
              <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#00E5FF' }}>◈ product_desc</span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
            </div>
            <div className="p-6" style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}>
              <div className="text-sm leading-relaxed" style={{ color: '#4A7A8A' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCT FORM
// ─────────────────────────────────────────────────────────────

const FieldWrapper = ({ error, children, label }: { error?: string; children: React.ReactNode; label?: string }) => (
  <div className="space-y-1.5">
    {label && <label className="text-[9px] tracking-[0.2em] uppercase font-medium" style={{ color: '#2A6A7A', fontFamily: "'JetBrains Mono', monospace" }}>{label}</label>}
    {children}
    {error && (
      <p className="text-[10px] flex items-center gap-1 tracking-wider" style={{ color: '#FF3B30' }}>
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const inputCls = (err?: boolean) =>
  `w-full px-4 py-3 text-sm outline-none transition-all font-light bg-transparent text-[#C8D8E8] placeholder-[#1A4A5A] border`
  + ` ${err ? 'border-[#FF3B30]' : 'border-[#0D2030]'} focus:border-[#00E5FF] focus:shadow-[0_0_12px_rgba(0,229,255,0.15)]`;

export function ProductForm({
  product, userId, domain,
  selectedOffer, setSelectedOffer, selectedVariants,
  platform, priceLoss = 0,
}: ProductFormProps) {
  const router = useRouter();

  const [wilayas,         setWilayas]         = useState<Wilaya[]>([]);
  const [communes,        setCommunes]        = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('customerId');
      if (id) setFormData(p => ({ ...p, customerId: id }));
    }
  }, []);

  useEffect(() => {
    if (!formData.customerWelaya) { setCommunes([]); return; }
    setLoadingCommunes(true);
    fetchCommunes(formData.customerWelaya).then(data => { setCommunes(data); setLoadingCommunes(false); });
  }, [formData.customerWelaya]);

  const selectedWilayaData = useMemo(
    () => wilayas.find(w => String(w.id) === String(formData.customerWelaya)),
    [wilayas, formData.customerWelaya],
  );

  const getFinalPrice = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number);
    const offer = product.offers?.find(o => o.id === selectedOffer);
    if (offer) return offer.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find(v => variantMatches(v, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);

  const getPriceLivraison = useCallback((): number => {
    if (!selectedWilayaData) return 0;
    return formData.typeLivraison === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice;
  }, [selectedWilayaData, formData.typeLivraison]);

  useEffect(() => {
    if (selectedWilayaData) setFormData(f => ({ ...f, priceLoss: selectedWilayaData.livraisonReturn }));
  }, [selectedWilayaData, formData.typeLivraison]);

  const finalPrice    = getFinalPrice();
  const getTotalPrice = () => finalPrice * formData.quantity + +getPriceLivraison();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.customerName.trim())  e.customerName    = 'Name is required';
    if (!formData.customerPhone.trim()) e.customerPhone   = 'Phone number is required';
    if (!formData.customerWelaya)       e.customerWelaya  = 'Province is required';
    if (!formData.customerCommune)      e.customerCommune = 'Municipality is required';
    return e;
  };

  
  const getVariantDetailId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSubmitting(true);
    try {
      const payload = { ...formData, productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice, totalPrice: getTotalPrice(), priceLivraison: getPriceLivraison() ,variantDetailId:   getVariantDetailId()};
      await axios.post(`${API_URL}/orders/create`, payload);
      if (typeof window !== 'undefined' && formData.customerId)
        localStorage.setItem('customerId', formData.customerId);
      router.push(`/lp/${domain}/successfully`);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  return (
    <div style={{ borderTop: '1px solid #0D1F2D', paddingTop: '1.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[9px] tracking-[0.25em] uppercase" style={{ color: '#00E5FF' }}>◈ order_form</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerName} label="customer_name">
            <div className="relative">
              <User className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#1A4A5A' }} />
              <input type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} placeholder="Enter Your Name" className={`${inputCls(!!formErrors.customerName)} pr-10`} />
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerPhone} label="phone_number">
            <div className="relative">
              <Phone className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#1A4A5A' }} />
              <input type="tel" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} placeholder="0X XX XX XX XX" className={`${inputCls(!!formErrors.customerPhone)} pr-10`} />
            </div>
          </FieldWrapper>
        </div>

        {/* Province + Municipality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerWelaya} label="select_province">
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#1A4A5A' }} />
              <select value={formData.customerWelaya} onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })} className={`${inputCls(!!formErrors.customerWelaya)} pr-10 appearance-none cursor-pointer`} style={{ backgroundColor: '#050B14' }}>
                <option value="">Select Province</option>
                {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: '#1A4A5A' }} />
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerCommune} label="select_municipality">
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#1A4A5A' }} />
              <select value={formData.customerCommune} disabled={!formData.customerWelaya || loadingCommunes} onChange={e => setFormData({ ...formData, customerCommune: e.target.value })} className={`${inputCls(!!formErrors.customerCommune)} pr-10 appearance-none cursor-pointer disabled:opacity-30`} style={{ backgroundColor: '#050B14' }}>
                <option value="">{loadingCommunes ? 'Loading...' : formData.customerWelaya ? 'Select Municipality' : 'select_province_first'}</option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: '#1A4A5A' }} />
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery Method */}
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: '#2A6A7A' }}>delivery_method</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home', 'office'] as const).map(type => (
              <button key={type} type="button" onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))}
                className="flex flex-col items-center gap-2 py-5 transition-all duration-200"
                style={{ border: `1px solid ${formData.typeLivraison === type ? 'rgba(0,229,255,0.5)' : '#0D2030'}`, backgroundColor: formData.typeLivraison === type ? 'rgba(0,229,255,0.06)' : '#080F1A', boxShadow: formData.typeLivraison === type ? '0 0 15px rgba(0,229,255,0.08)' : 'none' }}
              >
                {type === 'home'
                  ? <HomeIcon  className="w-5 h-5" style={{ color: formData.typeLivraison === type ? '#00E5FF' : '#1A4A5A' }} />
                  : <Building2 className="w-5 h-5" style={{ color: formData.typeLivraison === type ? '#00E5FF' : '#1A4A5A' }} />
                }
                <p className="text-[10px] tracking-widest" style={{ color: formData.typeLivraison === type ? '#00E5FF' : '#2A5A6A' }}>
                  {type === 'home' ? 'home_delivery' : 'office_pickup'}
                </p>
                {selectedWilayaData && (
                  <p className="text-[9px] font-mono" style={{ color: formData.typeLivraison === type ? 'rgba(0,229,255,0.6)' : '#1A3A4A' }}>
                    {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} DZD
                  </p>
                )}
              </button>
            ))}
          </div>
          {!selectedWilayaData && <p className="text-[10px] mt-2 text-center tracking-widest" style={{ color: '#1A3A4A' }}>// select_province_to_see_shipping_cost</p>}
        </div>

        {/* Quantity */}
        <FieldWrapper label="unit_count">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} className="w-10 h-10 flex items-center justify-center text-xl transition-all" style={{ border: '1px solid #0D2030', color: '#00E5FF', backgroundColor: '#080F1A' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,229,255,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#080F1A'; }}
            >−</button>
            <span className="w-14 text-center font-bold" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", fontSize: '1.5rem' }}>{formData.quantity}</span>
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))} className="w-10 h-10 flex items-center justify-center text-xl transition-all" style={{ border: '1px solid #0D2030', color: '#00E5FF', backgroundColor: '#080F1A' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,229,255,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#080F1A'; }}
            >+</button>
            <span className="text-[10px] tracking-widest" style={{ color: '#1A4A5A' }}>unit</span>
          </div>
        </FieldWrapper>

        {/* [Arabic] */}
        <div className="p-5 relative" style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #00E5FF44, transparent)' }} />
          <p className="text-[9px] tracking-[0.2em] uppercase mb-4" style={{ color: '#2A5A6A' }}>order_summary</p>
          <div className="space-y-2.5">
            {[
              { label: 'Product',      value: product.name },
              { label: 'unit_price', value: `${finalPrice.toLocaleString('ar-DZ')} DZD` },
              { label: 'Quantity',      value: `× ${formData.quantity}` },
              { label: 'Shipping',       value: selectedWilayaData ? `${getPriceLivraison().toLocaleString('ar-DZ')} DZD` : 'To be determined' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-[10px] tracking-widest" style={{ color: '#2A5A6A' }}>{row.label}</span>
                <span className="text-[11px]" style={{ color: '#6A8A9A' }}>{row.value}</span>
              </div>
            ))}
            <div className="pt-3 mt-1" style={{ borderTop: '1px solid #0D2030' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] tracking-widest font-bold" style={{ color: '#00E5FF' }}>total_amount</span>
                <span className="font-black" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", fontSize: '1.6rem', textShadow: '0 0 15px rgba(0,229,255,0.3)' }}>
                  {getTotalPrice().toLocaleString('ar-DZ')}<span className="text-xs mr-1">DZD</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* [Arabic] */}
        <button type="submit" disabled={submitting}
          className="w-full py-4 flex items-center justify-center gap-3 text-xs tracking-widest uppercase font-bold transition-all duration-300"
          style={{ backgroundColor: submitting ? '#1A4A5A' : '#00E5FF', color: '#020810', cursor: submitting ? 'not-allowed' : 'pointer' }}
          onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,229,255,0.4)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
        >
          {submitting
            ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Processing_order...</>
            : <><Zap className="w-4 h-4" />confirm_order</>
          }
        </button>

        <p className="text-[10px] text-center tracking-widest flex items-center justify-center gap-1.5" style={{ color: '#1A3A4A' }}>
          <Shield className="w-3 h-3" style={{ color: '#39FF14' }} />
          <span style={{ color: '#39FF14' }}>encrypted</span> | secure_transaction_protocol
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATIC PAGES
// ─────────────────────────────────────────────────────────────

interface StaticPageProps { page: string; }
interface CardProps       { icon: React.ReactNode; title: string; desc: string; status?: string; }

export function StaticPage({ page }: StaticPageProps) {
  const p = page.toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy />}
      {p === 'terms'   && <Terms />}
      {p === 'cookies' && <Cookies />}
      {p === 'contact' && <Contact />}
    </>
  );
}

function PageWrapper({ children, icon, title, subtitle, tag }: {
  children: React.ReactNode; icon: React.ReactNode; title: string; subtitle: string; tag: string;
}) {
  return (
    <div className="min-h-screen py-20" dir="ltr" style={{ backgroundColor: '#050B14', fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-8 text-[10px] tracking-widest" style={{ color: '#2A5A6A' }}>
            <span>system</span><span style={{ color: '#00E5FF' }}>/</span>
            <span>Legal</span><span style={{ color: '#00E5FF' }}>/</span>
            <span style={{ color: '#00E5FF' }}>{tag}</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 mt-1" style={{ border: '1px solid rgba(0,229,255,0.3)', backgroundColor: 'rgba(0,229,255,0.04)', color: '#00E5FF' }}>{icon}</div>
            <div>
              <h1 className="mb-3 leading-tight" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 'clamp(1.4rem, 4vw, 2.5rem)', color: '#FFFFFF' }}>{title}</h1>
              <p className="text-sm leading-relaxed" style={{ color: '#3A6A7A' }}>// {subtitle}</p>
            </div>
          </div>
          <div className="mt-8 h-px" style={{ background: 'linear-gradient(90deg, #00E5FF44, transparent)' }} />
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, status }: CardProps) {
  const isActive = status === 'Always Active';
  return (
    <div className="group flex gap-5 p-6 mb-3 transition-all duration-300" style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,229,255,0.3)'; el.style.boxShadow = '0 0 20px rgba(0,229,255,0.05)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0D2030'; el.style.boxShadow = 'none'; }}
    >
      <div className="w-0.5 self-stretch flex-shrink-0" style={{ background: 'linear-gradient(180deg, #00E5FF, transparent)' }} />
      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ border: '1px solid #0D2030', color: '#00E5FF', backgroundColor: '#040C16' }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="text-sm font-medium" style={{ color: '#C8D8E8', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.05em' }}>{title}</h3>
          {status && (
            <span className="text-[9px] tracking-widest px-2.5 py-1 uppercase font-bold" style={{ backgroundColor: isActive ? 'rgba(57,255,20,0.08)' : 'rgba(0,229,255,0.04)', border: `1px solid ${isActive ? 'rgba(57,255,20,0.3)' : 'rgba(0,229,255,0.15)'}`, color: isActive ? '#39FF14' : '#00E5FF' }}>
              {status}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#3A6A7A' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper icon={<ShieldCheck size={20} />} title="Privacy Policy" subtitle="At our store, your data privacy and information security are our top priorities. Here's how we protect your information." tag="Privacy">
      <InfoCard icon={<Database size={16} />} title="Data We Collect"   desc="We collect only the data necessary to run your store, such as name, email, and order information, to ensure a smooth selling experience." />
      <InfoCard icon={<Eye size={16} />}      title="How We Use Your Data" desc="Your data is used to improve our services, process orders, and provide smart reports to help you make better business decisions." />
      <InfoCard icon={<Lock size={16} />}     title="Information Protection"         desc="We use advanced encryption technologies and international security standards to protect your data from unauthorized access." />
      <InfoCard icon={<Globe size={16} />}    title="Data Sharing"          desc="We never sell your data. We share it only with trusted service providers to complete your transactions." />
      <div className="mt-8 p-5 flex items-center justify-between" style={{ border: '1px solid rgba(57,255,20,0.15)', backgroundColor: 'rgba(57,255,20,0.03)' }}>
        <div className="flex items-center gap-3">
          <Bell size={14} style={{ color: '#39FF14' }} />
          <p className="text-xs" style={{ color: '#3A6A7A' }}>This policy is periodically updated to keep up withith the latest security standards.</p>
        </div>
        <span className="text-[10px] tracking-widest flex-shrink-0 ml-6" style={{ color: '#1A4A5A' }}>Updated: 06.02.2026</span>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper icon={<FileText size={20} />} title="Terms of Use" subtitle="By using our platform, you agree to comply with the following terms and rules to ensure a fair and safe commercial environment." tag="Terms">
      <InfoCard icon={<CheckCircle2 size={16} />} title="Account Responsibility"     desc="You are responsible for maintaining the confidentiality of your account and all activities under it. Information provided must be accurate and up to date." />
      <InfoCard icon={<CreditCard size={16} />}   title="Fees & Subscriptions" desc="Our services are subject to periodic subscription fees. All fees are clear with no hidden costs and are charged according to your chosen plan." />
      <InfoCard icon={<Ban size={16} />}           title="Prohibited Content"    desc="Using the platform to sell illegal goods or infringe intellectual property rights is prohibited. We reserve the right to close any store that violates these rules." />
      <InfoCard icon={<Scale size={16} />}         title="Applicable Law" desc="These Terms are governed and interpreted in accordance with the applicable local laws of Algeria, and any disputes are subject to the jurisdiction of local courts." />
      <div className="mt-8 p-5 flex items-start gap-3" style={{ border: '1px solid rgba(255,150,0,0.2)', backgroundColor: 'rgba(255,150,0,0.03)' }}>
        <AlertCircle size={16} style={{ color: '#FF9500', flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: '#3A6A7A' }}>
          // We reserve the right to modify these Terms at any time. Continued use of the platform after amendments يعد موافقة منك على Terms الNewة.
        </p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={20} />} title="Cookie Policy" subtitle="We use cookies to improve your experience, personalize content, and analyze traffic on our platform." tag="Cookies">
      <InfoCard icon={<ShieldCheck size={16} />}   title="Essential Cookies"    desc="These cookies are required for basic site functions such as login and cart security. They cannot be disabled." status="Always Active" />
      <InfoCard icon={<Settings size={16} />}      title="Preference Cookies" desc="Allow the site to remember your preferences such as current language and timezone." status="Optional" />
      <InfoCard icon={<MousePointer2 size={16} />} title="Analytics Cookies"   desc="Help us understand how visitors interact with the store, enabling us to develop more efficient selling tools." status="Optional" />
      <div className="mt-8 p-6 relative overflow-hidden" style={{ backgroundColor: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.2)' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)' }} />
        <div className="flex gap-4 items-start">
          <ToggleRight size={18} style={{ color: '#00E5FF', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 className="text-sm mb-2" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}>How Do You Control Your Preferences?</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#3A6A7A' }}>
              // You can manage or delete Cookies through your browser settings at any time. Please note that disabling بعضها قد يؤثر على تجربة استخدام المنصة.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export function Contact() {
  const store = {
    language: 'ar',
    design: { primaryColor: '#00E5FF', secondaryColor: '#39FF14' },
    contact: {
      email:    'support@teststore.com',
      phone:    '+213550123456',
      wilaya:   'Algiers',
      facebook: 'https://facebook.com',
      whatsapp: '213550123456',
      tiktok:   'https://tiktok.com',
    },
  };

  const [typedText, setTypedText] = useState('');
  const fullText = '> Contact_us --init';

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, []);

  const contacts = [
    { icon: <Mail className="w-4 h-4" />,  label: 'email_address', value: store.contact.email,  href: `mailto:${store.contact.email}`, code: 'P01' },
    { icon: <Phone className="w-4 h-4" />, label: 'phone_line',          value: store.contact.phone,  href: `tel:${store.contact.phone}`,    code: 'P01' },
    { icon: <MapPin className="w-4 h-4" />,label: 'location',    value: store.contact.wilaya, href: undefined,                       code: 'P01' },
  ];

  const socials = [
    { name: 'Facebook',  href: store.contact.facebook,                   icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    { name: 'WhatsApp', href: `https://wa.me/${store.contact.whatsapp}`, icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> },
    { name: 'TikTok', href: store.contact.tiktok,                     icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.44-4.11-1.24-.03 2.15-.02 4.31-.02 6.46 0 1.19-.21 2.4-.78 3.46-.94 1.83-2.86 2.92-4.88 3.12-1.84.23-3.83-.24-5.26-1.48-1.57-1.32-2.3-3.43-1.95-5.44.25-1.58 1.15-3.05 2.51-3.9 1.14-.73 2.51-.99 3.84-.81v4.11c-.71-.12-1.47.05-2.05.5-.66.52-.96 1.4-.78 2.21.14.73.72 1.34 1.45 1.5.88.2 1.88-.16 2.37-.93.2-.34.28-.73.28-1.12V0l-.02.02z"/></svg> },
  ];

  return (
    <section className="min-h-screen py-20" dir="ltr" style={{ backgroundColor: '#050B14', fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-3xl mx-auto px-6">

        {/* [Arabic] */}
        <div className="mb-12 p-5" style={{ border: '1px solid #0D2030', backgroundColor: '#040C16' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF3B30' }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF9500' }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#39FF14' }} />
            <span className="ml-4 text-[10px] tracking-widest" style={{ color: '#2A5A6A' }}>contact_terminal_v2.1</span>
          </div>
          <p className="text-sm" style={{ color: '#00E5FF' }}>{typedText}<span className="animate-pulse">▮</span></p>
          <p className="text-[11px] mt-2" style={{ color: '#1A4A5A' }}>// initializing Contact channels...</p>
        </div>

        <div className="flex items-center gap-5 mb-10">
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#00E5FF' }}>◈ contact_us</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
        </div>

        {/* Contact Info */}
        <div className="space-y-3 mb-12">
          {contacts.map(item => (
            <div key={item.code} className="group flex items-center justify-between p-5 transition-all duration-300 cursor-pointer"
              style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,229,255,0.4)'; el.style.backgroundColor = '#0A141F'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0D2030'; el.style.backgroundColor = '#080F1A'; }}
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 flex items-center justify-center" style={{ border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF' }}>{item.icon}</div>
                <div>
                  <p className="text-[9px] tracking-widest mb-0.5" style={{ color: '#2A5A6A' }}>{item.code}/ {item.label}</p>
                  <p className="text-sm font-medium group-hover:text-[#00E5FF] transition-colors" style={{ color: '#C8D8E8' }}>{item.value}</p>
                </div>
              </div>
              <span className="text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#00E5FF' }}>contact →</span>
            </div>
          ))}
        </div>

        {/* [Arabic]Contact[Arabic] */}
        <div>
          <p className="text-[10px] tracking-widest mb-5" style={{ color: '#2A5A6A' }}>// social_media_protocols</p>
          <div className="grid grid-cols-3 gap-3">
            {socials.map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer"
                className="flex flex-col items-center gap-3 py-6 transition-all duration-300"
                style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A', color: '#4A7A8A' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,229,255,0.4)'; el.style.color = '#00E5FF'; el.style.boxShadow = '0 0 20px rgba(0,229,255,0.06)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0D2030'; el.style.color = '#4A7A8A'; el.style.boxShadow = 'none'; }}
              >
                {s.icon}
                <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: '#2A5A6A' }}>{s.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}