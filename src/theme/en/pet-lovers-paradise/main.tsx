'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  Building2, AlertCircle, X, Infinity, Share2, MapPin, Phone,
  User, ShieldCheck, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Truck, Shield, Package, Mail, ArrowRight,
} from 'lucide-react';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
  :root {
    --terra:      #E07A5F; --terra-dk:   #C4614A; --terra-lt:   #F0A090;
    --honey:      #F2B705; --honey-dk:   #D9A004; --honey-lt:   #FFD97D;
    --sage:       #81B29A; --sage-dk:    #5E9480; --sage-lt:    #B2D4C4;
    --caramel:    #C97D4E; --caramel-lt: #E8A87C;
    --cream:      #FDF6EE; --cream-dk:   #F5EAD8; --warm-white: #FFFCF8;
    --cocoa:      #3D2314; --cocoa-lt:   #6B3D22;
    --text:       #3D2314; --text-mid:   #7A5540; --text-soft:  #B08870; --text-ghost: #D4B8A0;
    --border:     #EDD8C4; --border-dk:  #D4B898;
    --shadow-warm: rgba(224,122,95,0.18); --shadow-soft: rgba(61,35,20,0.08);
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--cream); }
  ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--terra), var(--honey)); border-radius: 99px; }

  @keyframes paw-fall {
    0%   { opacity:0; transform: translateY(-20px) rotate(0deg) scale(0.7); }
    15%  { opacity:0.65; }
    85%  { opacity:0.4; }
    100% { opacity:0; transform: translateY(105vh) rotate(360deg) scale(1.1) translateX(30px); }
  }
  @keyframes tail-wag {
    0%,100% { transform: rotate(-12deg); transform-origin: bottom left; }
    25%     { transform: rotate(18deg);  }
    50%     { transform: rotate(-8deg);  }
    75%     { transform: rotate(14deg);  }
  }
  @keyframes nose-sniff  { 0%,100%{transform:scale(1);} 50%{transform:scale(1.12) translateY(-2px);} }
  @keyframes bounce-happy { 0%,100%{transform:translateY(0);} 40%{transform:translateY(-14px);} 60%{transform:translateY(-7px);} }
  @keyframes slide-up { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }
  @keyframes marquee-pets { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
  @keyframes heart-beat { 0%,100%{transform:scale(1);} 25%{transform:scale(1.18);} 40%{transform:scale(0.95);} 60%{transform:scale(1.1);} }
  @keyframes wobble-in {
    0%  {opacity:0;transform:scale(0.88) rotate(-2deg);}
    60% {transform:scale(1.04) rotate(1deg);opacity:1;}
    100%{transform:scale(1) rotate(0deg);opacity:1;}
  }

  .slide-up    { animation: slide-up 0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .slide-up-d1 { animation-delay: 0.1s; }
  .slide-up-d2 { animation-delay: 0.22s; }
  .slide-up-d3 { animation-delay: 0.36s; }
  .slide-up-d4 { animation-delay: 0.5s; }
  .wobble-in   { animation: wobble-in 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }

  .paw-pattern {
    background-image:
      radial-gradient(ellipse 8px 7px at 0 0, rgba(224,122,95,0.13) 100%, transparent 100%),
      radial-gradient(circle 3px at -4px -5px, rgba(224,122,95,0.09) 100%, transparent 100%),
      radial-gradient(circle 3px at  4px -5px, rgba(224,122,95,0.09) 100%, transparent 100%),
      radial-gradient(circle 3px at -7px  1px, rgba(224,122,95,0.09) 100%, transparent 100%),
      radial-gradient(circle 3px at  7px  1px, rgba(224,122,95,0.09) 100%, transparent 100%);
    background-size: 48px 48px;
    background-position: 12px 12px, 12px 12px, 12px 12px, 12px 12px, 12px 12px;
  }

  .card-pet {
    border-radius: 24px 8px 24px 8px;
    transition: border-radius 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease;
  }
  .card-pet:hover {
    border-radius: 8px 24px 8px 24px;
    transform: translateY(-8px) rotate(0.5deg);
    box-shadow: 0 20px 56px var(--shadow-warm);
  }

  .btn-paw {
    position:relative; overflow:hidden;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .btn-paw::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
    opacity:0; transition:opacity 0.3s;
  }
  .btn-paw:hover { transform: translateY(-2px) scale(1.03); }
  .btn-paw:hover::after { opacity:1; }
  .btn-paw:active { transform: scale(0.97); }

  .marquee-wrap  { overflow:hidden; white-space:nowrap; }
  .marquee-inner { display:inline-block; animation: marquee-pets 20s linear infinite; }
  .heart-beat    { animation: heart-beat 1.4s ease-in-out infinite; }
`;

// ─── SVG COMPONENTS ───────────────────────────────────────────
function PawPrint({ size = 24, color = 'var(--terra)', style = {}, className = '' }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={style} className={className}>
      <ellipse cx="20" cy="25" rx="9" ry="10" fill={color} />
      <ellipse cx="9" cy="16" rx="5" ry="6" fill={color} />
      <ellipse cx="31" cy="16" rx="5" ry="6" fill={color} />
      <ellipse cx="14" cy="9" rx="4" ry="5" fill={color} />
      <ellipse cx="26" cy="9" rx="4" ry="5" fill={color} />
    </svg>
  );
}

function BoneDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,var(--border-dk))' }} />
      <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
        <circle cx="4" cy="8" r="4" fill="var(--terra-lt)" />
        <circle cx="32" cy="8" r="4" fill="var(--terra-lt)" />
        <circle cx="4" cy="3" r="3" fill="var(--terra-lt)" />
        <circle cx="32" cy="3" r="3" fill="var(--terra-lt)" />
        <circle cx="4" cy="13" r="3" fill="var(--terra-lt)" />
        <circle cx="32" cy="13" r="3" fill="var(--terra-lt)" />
        <rect x="7" y="6" width="22" height="4" rx="2" fill="var(--terra-lt)" />
      </svg>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,var(--border-dk),transparent)' }} />
    </div>
  );
}

function DogSilhouette({ size = 80, color = 'var(--terra-lt)', style = {} }: any) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 120 90" fill="none" style={style}>
      <ellipse cx="55" cy="55" rx="32" ry="22" fill={color} />
      <circle cx="90" cy="38" r="18" fill={color} />
      <ellipse cx="82" cy="24" rx="8" ry="12" fill={color} transform="rotate(-15 82 24)" />
      <rect x="32" y="70" width="10" height="18" rx="5" fill={color} />
      <rect x="52" y="70" width="10" height="18" rx="5" fill={color} />
      <rect x="68" y="70" width="10" height="18" rx="5" fill={color} />
      <rect x="84" y="70" width="10" height="18" rx="5" fill={color} />
      <path d="M23 48 Q8 38 12 25 Q16 16 24 22" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none"
        style={{ animation: 'tail-wag 0.8s ease-in-out infinite', transformOrigin: '23px 48px' }} />
      <circle cx="96" cy="34" r="3.5" fill="var(--cocoa)" />
      <circle cx="97" cy="33" r="1.2" fill="white" />
      <ellipse cx="104" cy="42" rx="4" ry="3" fill="var(--cocoa-lt)" style={{ animation: 'nose-sniff 2.5s ease-in-out infinite' }} />
    </svg>
  );
}

function CatSilhouette({ size = 80, color = 'var(--honey-lt)', style = {} }: any) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 110 94" fill="none" style={style}>
      <ellipse cx="55" cy="62" rx="30" ry="24" fill={color} />
      <circle cx="78" cy="35" r="20" fill={color} />
      <polygon points="64,20 70,4 78,18" fill={color} />
      <polygon points="84,18 92,4 96,20" fill={color} />
      <rect x="35" y="78" width="9" height="16" rx="4.5" fill={color} />
      <rect x="54" y="78" width="9" height="16" rx="4.5" fill={color} />
      <path d="M25 70 Q10 60 14 44 Q18 34 26 38" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
      <ellipse cx="72" cy="33" rx="4.5" ry="5.5" fill="var(--cocoa)" />
      <ellipse cx="86" cy="33" rx="4.5" ry="5.5" fill="var(--cocoa)" />
      <circle cx="73" cy="31" r="1.5" fill="white" />
      <circle cx="87" cy="31" r="1.5" fill="white" />
      <polygon points="79,39 77,42 81,42" fill="var(--terra)" />
      <line x1="62" y1="41" x2="75" y2="42" stroke="var(--cocoa)" strokeWidth="1.2" opacity="0.5" />
      <line x1="62" y1="44" x2="75" y2="44" stroke="var(--cocoa)" strokeWidth="1.2" opacity="0.4" />
      <line x1="83" y1="42" x2="97" y2="41" stroke="var(--cocoa)" strokeWidth="1.2" opacity="0.5" />
      <line x1="83" y1="44" x2="97" y2="44" stroke="var(--cocoa)" strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}

function FallingPaws() {
  const paws = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.7) % 100}%`,
    delay: `${(i * 0.7) % 11}s`,
    duration: `${9 + (i * 0.9) % 9}s`,
    size: 14 + (i * 1.8) % 16,
    color: ['rgba(224,122,95,0.5)', 'rgba(242,183,5,0.4)', 'rgba(129,178,154,0.45)', 'rgba(201,125,78,0.4)', 'rgba(240,160,144,0.5)'][i % 5],
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {paws.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.left, top: '-20px', opacity: 0,
          animation: `paw-fall ${p.duration} ${p.delay} ease-in infinite`
        }}>
          <PawPrint size={p.size} color={p.color} />
        </div>
      ))}
    </div>
  );
}

// ─── TYPES ────────────────────────────────────────────────────
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

// ─── HELPERS ──────────────────────────────────────────────────
function variantMatches(d: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };


// ─── MAIN LAYOUT ──────────────────────────────────────────────
export default function Main({ store, children }: any) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--cream)', fontFamily: "'Nunito',sans-serif", color: 'var(--text)' }}>
      <style>{FONT_CSS}</style>
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="marquee-wrap py-2.5"
          style={{ background: 'linear-gradient(90deg, var(--terra), var(--caramel), var(--honey-dk), var(--terra))', backgroundSize: '200% 100%' }}>
          <div className="marquee-inner">
            {Array(8).fill(null).map((_, i) => (
              <span key={i} className="mx-8 text-white font-bold text-xs tracking-widest uppercase inline-flex items-center gap-2">
                <PawPrint size={12} color="rgba(255,255,255,0.7)" /> {store.topBar.text}
              </span>
            ))}
            {Array(8).fill(null).map((_, i) => (
              <span key={`b${i}`} className="mx-8 text-white font-bold text-xs tracking-widest uppercase inline-flex items-center gap-2">
                <PawPrint size={12} color="rgba(255,255,255,0.7)" /> {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}
      <Navbar store={store} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────
export function Navbar({ store }: { store: Store }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRTL = store.language === 'ar';
  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  const nav = [
    { href: `/`, label: isRTL ? 'Home' : 'Home', icon: '🏠' },
    { href: `/contact`, label: isRTL ? 'Contact Us' : 'Contact', icon: '📞' },
    { href: `/Privacy`, label: isRTL ? 'Privacy' : 'Privacy', icon: '🔒' },
  ];
  const initials = store.name.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <nav className="sticky top-0 z-50 transition-all duration-400" dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: scrolled ? 'rgba(253,246,238,0.96)' : 'var(--cream)', backdropFilter: scrolled ? 'blur(18px)' : 'none', borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`, boxShadow: scrolled ? '0 2px 28px var(--shadow-soft)' : 'none' }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between py-3.5">
          <Link href={`/`} className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
              style={{ background: 'linear-gradient(135deg, var(--terra) 0%, var(--honey) 100%)', boxShadow: '0 4px 16px var(--shadow-warm)' }}>
              {store.design.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                : <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>{initials}</span>
              }
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--honey)', animation: 'nose-sniff 2s ease-in-out infinite' }}>
                <span style={{ fontSize: '8px' }}>🐾</span>
              </div>
            </div>
            <div>
              <span className="block transition-colors" style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.4rem', color: 'var(--text)', letterSpacing: '0.02em' }}>
                {store.name}
              </span>
              <span className="block text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: 'var(--terra)', marginTop: '-2px' }}>
                {isRTL ? '🐾 Pet Store' : "🐾 Pet Lover's Paradise"}
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {nav.map(item => (
              <Link key={item.href} href={item.href}
                className="relative text-sm font-semibold transition-colors group flex items-center gap-1.5"
                style={{ color: 'var(--text-mid)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--terra)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-mid)'; }}>
                <span>{item.icon}</span>{item.label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded-full" style={{ background: 'var(--terra)' }} />
              </Link>
            ))}
            <Link href={`/`}
              className="btn-paw flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--terra), var(--caramel))', boxShadow: '0 4px 18px var(--shadow-warm)' }}>
              <PawPrint size={14} color="rgba(255,255,255,0.85)" />
              {isRTL ? 'Shop Now' : 'Shop Now'}
            </Link>
          </div>
          <button onClick={() => setMenuOpen(p => !p)} className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(224,122,95,0.1)', color: 'var(--terra)' }}>
            {menuOpen ? <X className="w-5 h-5" /> : <span style={{ fontSize: '1.2rem' }}>🐾</span>}
          </button>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-60 pb-5' : 'max-h-0'}`}>
          <div className="pt-4 space-y-3" style={{ borderTop: '2px dashed var(--border)' }}>
            {nav.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ color: 'var(--text-mid)' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'rgba(224,122,95,0.07)'; el.style.color = 'var(--terra)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'transparent'; el.style.color = 'var(--text-mid)'; }}>
                <span className="text-base">{item.icon}</span>{item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--terra-lt) 30%, var(--honey-lt) 50%, var(--terra-lt) 70%, transparent)' }} />
    </nav>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────
export function Footer({ store }: any) {
  const isRTL = store.language === 'ar';
  return (
    <footer className="relative paw-pattern" style={{ backgroundColor: 'var(--cocoa)', overflow: 'hidden', fontFamily: "'Nunito',sans-serif" }}>
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--terra), transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--honey), transparent 70%)' }} />
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg, var(--terra), var(--honey), var(--caramel), var(--sage), var(--terra))' }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--terra), var(--honey))', boxShadow: '0 4px 16px rgba(224,122,95,0.3)' }}>
                <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>{store.name.charAt(0)}</span>
              </div>
              <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.3rem', color: 'var(--cream)' }}>{store.name}</span>
            </div>
            <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(253,246,238,0.55)' }}>
              {isRTL ? 'Everything your pet needs at your fingertips. Products chosen with love 🐾' : 'Because every pet deserves the best. Curated with love for your furry family.'}
            </p>
            <div className="flex items-end gap-4">
              <DogSilhouette size={55} color="rgba(253,246,238,0.18)" />
              <CatSilhouette size={48} color="rgba(253,246,238,0.14)" />
            </div>
          </div>
          <div>
            <h4 className="mb-5 font-bold" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', color: 'var(--honey-lt)', letterSpacing: '0.04em' }}>
              🗺️ {isRTL ? 'Links' : 'Navigate'}
            </h4>
            <div className="space-y-3">
              {[
                { href: `/Privacy`, label: isRTL ? 'Privacy Policy' : 'Privacy Policy' },
                { href: `/Terms`, label: isRTL ? 'Terms of Service' : 'Terms of Service' },
                { href: `/Cookies`, label: isRTL ? 'Cookies' : 'Cookie Policy' },
                { href: `/contact`, label: isRTL ? 'Contact Us' : 'Contact Us' },
              ].map(l => (
                <a key={l.href} href={l.href} className="flex items-center gap-2 text-sm font-semibold transition-all"
                  style={{ color: 'rgba(253,246,238,0.5)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--honey-lt)'; el.style.paddingLeft = '6px'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(253,246,238,0.5)'; el.style.paddingLeft = '0'; }}>
                  <PawPrint size={10} color="var(--terra-lt)" />{l.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="p-6 rounded-2xl relative overflow-hidden" style={{ background: 'rgba(224,122,95,0.12)', border: '1px solid rgba(224,122,95,0.2)' }}>
              <Heart className="w-8 h-8 mb-3 heart-beat" style={{ color: 'var(--terra-lt)' }} />
              <p className="font-bold leading-snug mb-2" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', color: 'var(--cream)' }}>
                {isRTL ? '"When you love your pet, the whole world loves you."' : '"A dog is the only thing on earth that loves you more than it loves itself."'}
              </p>
              <p className="text-xs font-semibold" style={{ color: 'rgba(253,246,238,0.4)' }}>— Josh Billings</p>
              <div className="absolute -bottom-2 -right-2 opacity-10"><PawPrint size={56} color="var(--terra)" /></div>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold" style={{ color: 'rgba(253,246,238,0.3)' }}>© {new Date().getFullYear()} {store.name} · {isRTL ? 'All Rights Reserved' : 'All rights reserved'} 🐾</p>
          <p className="text-xs font-bold flex items-center gap-2" style={{ color: 'rgba(253,246,238,0.3)' }}>
            <PawPrint size={12} color="var(--terra-lt)" /> Pet Lover's Paradise Theme <PawPrint size={12} color="var(--terra-lt)" />
          </p>
        </div>
      </div>
    </footer>
  );
}


// ─── CARD ─────────────────────────────────────────────────────
export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const [hovered, setHovered] = useState(false);
  const accents = ['var(--terra)', 'var(--honey-dk)', 'var(--sage-dk)', 'var(--caramel)', 'var(--terra-dk)'];
  const accent = accents[parseInt(product.id) % accents.length];
  return (
    <div className="card-pet group flex flex-col overflow-hidden bg-white"
      style={{ border: `2px solid ${hovered ? accent : 'var(--border)'}`, position: 'relative', transition: 'border-color 0.3s, border-radius 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="h-1.5 transition-all duration-300" style={{ background: hovered ? `linear-gradient(90deg, ${accent}, var(--honey-lt))` : 'var(--border)' }} />
      <div className="relative overflow-hidden" style={{ aspectRatio: '1', backgroundColor: `${accent}12` }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-600" style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }} />
          : <div className="w-full h-full flex flex-col items-center justify-center paw-pattern gap-2">
            <span className="text-5xl" style={{ animation: 'bounce-happy 2s ease-in-out infinite' }}>🐾</span>
          </div>
        }
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{ background: `linear-gradient(to bottom, transparent 50%, ${accent}20 100%)`, opacity: hovered ? 1 : 0 }} />
        {discount > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full text-[10px] font-black text-white"
            style={{ backgroundColor: accent, boxShadow: `0 3px 12px ${accent}60`, transform: 'rotate(6deg)' }}>
            -{discount}%
          </div>
        )}
        <button className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center btn-paw"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--terra)', opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1)' : 'scale(0.7)', transition: 'all 0.3s' }}>
          <Heart className="w-3.5 h-3.5" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-3 transition-all duration-400"
          style={{ transform: hovered ? 'translateY(0)' : 'translateY(100%)', opacity: hovered ? 1 : 0 }}>
          <Link href={`/product/${product.slug || product.id}`}
            className="btn-paw flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold tracking-wider text-white"
            style={{ background: `linear-gradient(135deg, ${accent}, var(--honey-dk))`, boxShadow: `0 4px 16px ${accent}50` }}>
            <PawPrint size={12} color="rgba(255,255,255,0.8)" /> {viewDetails}
          </Link>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => <Star key={i} className={`w-2.5 h-2.5 ${i < 4 ? 'fill-current' : ''}`} style={{ color: 'var(--honey-dk)' }} />)}
          <span className="ml-1.5 text-[10px] font-bold" style={{ color: 'var(--text-ghost)' }}>4.8</span>
        </div>
        <h3 className="font-bold leading-snug mb-1 line-clamp-2 transition-colors"
          style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1rem', color: 'var(--text)' }}>
          {product.name}
        </h3>
        {product.desc && (
          <div className="text-xs font-medium mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-soft)' }}
            dangerouslySetInnerHTML={{ __html: product.desc }} />
        )}
        <div className="mt-auto flex items-end justify-between pt-3" style={{ borderTop: `2px dashed ${accent}30` }}>
          <div>
            <span className="font-extrabold" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.4rem', color: accent }}>{product.price}</span>
            <span className="ml-1 text-xs font-semibold" style={{ color: 'var(--text-ghost)' }}>{store.currency}</span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="ml-2 text-xs line-through font-medium" style={{ color: 'var(--text-ghost)' }}>{product.priceOriginal}</span>
            )}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-125"
            style={{ backgroundColor: `${accent}15`, color: accent }}>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────
export function Home({ store }: any) {
  const isRTL = store.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const t = {
    badge: isRTL ? '🐾 The Pet World' : '🐾 Trusted by Pet Parents',
    heroTitle: 'Everything\nYour Pet Loves!',
    heroSub: isRTL ? 'Food, supplies, grooming and more — products chosen with love for your happy pet.' : 'Premium food, grooming, toys & accessories — handpicked with love for your happy companions.',
    heroBtn: isRTL ? '🛒 Shop Products' : '🛒 Shop Products',
    heroBtn2: isRTL ? '🎁 Special Offers' : '🎁 Special Deals',
    categories: isRTL ? 'Shop by Category' : 'Shop by Category',
    all: isRTL ? 'All' : 'All Pets',
    products: isRTL ? 'Our Favorites' : 'Our Favourite Picks',
    noProducts: isRTL ? 'No products yet 🐾' : 'No products yet 🐾',
    viewDetails: isRTL ? 'Learn More' : 'View Details',
  };
  const pillars = [
    { emoji: '🥩', title: isRTL ? 'Natural Food' : 'Natural Food', sub: isRTL ? 'High-Quality Components' : 'High-quality ingredients' },
    { emoji: '🏥', title: isRTL ? 'Healthcare' : 'Health Care', sub: isRTL ? 'Recommended Products' : 'Vet-recommended products' },
    { emoji: '🎾', title: isRTL ? 'Games & Entertainment' : 'Fun & Play', sub: isRTL ? 'Their Favorite Game' : 'Keep them entertained' },
    { emoji: '✂️', title: isRTL ? 'Grooming & Hygiene' : 'Grooming', sub: isRTL ? 'Make It Shine' : 'Make them shine' },
  ];
  return (
    <div dir={dir} style={{ backgroundColor: 'var(--cream)', fontFamily: "'Nunito',sans-serif" }}>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ minHeight: '95vh', background: 'linear-gradient(150deg, var(--cream) 0%, var(--cream-dk) 50%, #F0E8D8 100%)', display: 'flex', alignItems: 'center' }}>
        <FallingPaws />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 65% 75% at 65% 40%, rgba(242,183,5,0.12) 0%, transparent 65%)' }} />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none opacity-15 hidden lg:block" style={{ background: 'radial-gradient(circle, var(--terra), transparent 70%)' }} />
        <div className="absolute bottom-8 right-8 hidden lg:block pointer-events-none" style={{ animation: 'bounce-happy 4s ease-in-out infinite' }}>
          <DogSilhouette size={180} color="rgba(224,122,95,0.18)" />
        </div>
        <div className="absolute top-12 right-1/4 hidden xl:block pointer-events-none" style={{ animation: 'bounce-happy 5s ease-in-out infinite', animationDelay: '1s' }}>
          <CatSilhouette size={90} color="rgba(242,183,5,0.2)" />
        </div>
        {store.hero?.imageUrl && (
          <div className="absolute inset-0 pointer-events-none"><img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity: 0.12 }} /></div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl">
            <div className="slide-up inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-7 font-bold text-sm"
              style={{ background: 'rgba(224,122,95,0.12)', border: '2px solid rgba(224,122,95,0.25)', color: 'var(--terra)' }}>
              {t.badge}
            </div>
            <h1 className="slide-up slide-up-d1 whitespace-pre-line leading-tight mb-4"
              style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 'clamp(3rem,8vw,6.5rem)', color: 'var(--text)', lineHeight: 1.1 }}>
              {store.hero?.title || t.heroTitle}
            </h1>
            <div className="slide-up slide-up-d1 flex items-center gap-2 mb-7">
              {[...Array(5)].map((_, i) => <PawPrint key={i} size={i === 2 ? 22 : 16} color={i === 2 ? 'var(--terra)' : 'var(--terra-lt)'} style={{ opacity: 1 - Math.abs(i - 2) * 0.2 }} />)}
              <div className="flex-1 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, var(--terra-lt), transparent)' }} />
            </div>
            <p className="slide-up slide-up-d2 text-base font-semibold leading-relaxed mb-10" style={{ color: 'var(--text-mid)', maxWidth: '440px' }}>
              {store.hero?.subtitle || t.heroSub}
            </p>
            <div className="slide-up slide-up-d3 flex flex-wrap gap-4">
              <a href="#products" className="btn-paw flex items-center gap-2.5 px-8 py-4 rounded-full text-base font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--terra) 0%, var(--caramel) 100%)', boxShadow: '0 8px 28px var(--shadow-warm)' }}>
                <PawPrint size={16} color="rgba(255,255,255,0.85)" /> {t.heroBtn}
              </a>
              <a href="#categories" className="btn-paw flex items-center gap-2.5 px-8 py-4 rounded-full text-base font-bold"
                style={{ border: '2px solid var(--border-dk)', color: 'var(--text-mid)', backgroundColor: 'white', boxShadow: '0 4px 14px var(--shadow-soft)' }}>
                {t.heroBtn2} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="slide-up slide-up-d4 flex flex-wrap gap-6 mt-12 pt-8" style={{ borderTop: '2px dashed var(--border)' }}>
              {[{ e: '🛡️', t: isRTL ? 'Secure' : 'Vet Approved' }, { e: '🚀', t: isRTL ? 'Fast' : 'Fast Delivery' }, { e: '❤️', t: isRTL ? 'Trusted' : 'Made with Love' }].map((b, i) => (
                <div key={i} className="flex items-center gap-2"><span className="text-lg">{b.e}</span><span className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>{b.t}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 1 }}>
          <svg viewBox="0 0 1440 70" fill="none" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '70px' }}>
            <path d="M0,70 L0,35 C180,65 360,10 540,40 C720,70 900,15 1080,42 C1260,68 1380,22 1440,40 L1440,70 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* PILLARS */}
      <section style={{ backgroundColor: 'white', paddingBottom: '3rem' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pillars.map((p, i) => (
              <div key={i} className="flex flex-col items-center text-center py-6 px-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg cursor-default"
                style={{ border: '2px solid var(--border)', backgroundColor: 'var(--cream)' }}>
                <span className="text-3xl mb-3 block" style={{ animation: `bounce-happy ${2.2 + i * 0.3}s ${i * 0.2}s ease-in-out infinite` }}>{p.emoji}</span>
                <p className="font-bold mb-0.5" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '0.95rem', color: 'var(--text)' }}>{p.title}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--text-soft)' }}>{p.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ backgroundColor: 'white' }}>
        <svg viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '50px' }}>
          <path d="M0,50 L0,25 C200,48 400,5 600,28 C800,50 1000,8 1200,30 C1340,46 1400,20 1440,32 L1440,50 Z" fill="var(--cream)" />
        </svg>
      </div>

      {/* CATEGORIES */}
      <section id="categories" className="py-16" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <PawPrint size={18} color="var(--terra-lt)" />
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: 'var(--terra)' }}>{isRTL ? 'Shop by' : 'Browse by'}</span>
              <PawPrint size={18} color="var(--terra-lt)" />
            </div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text)' }}>{t.categories}</h2>
          </div>
          {store.categories?.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/${store.domain}`}
                className="btn-paw flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--terra), var(--caramel))', boxShadow: '0 4px 16px var(--shadow-warm)' }}>
                <PawPrint size={14} color="rgba(255,255,255,0.8)" /> {t.all}
              </Link>
              {store.categories.map((cat: any, idx: number) => {
                const bgs = ['var(--honey-dk)', 'var(--sage-dk)', 'var(--terra-dk)', 'var(--caramel)', 'var(--terra)'];
                const bg = bgs[idx % bgs.length];
                return (
                  <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                    className="btn-paw px-6 py-3 rounded-full text-sm font-bold transition-all"
                    style={{ border: `2px solid ${bg}`, color: bg, backgroundColor: `${bg}0F` }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = bg; el.style.color = 'white'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = `${bg}0F`; el.style.color = bg; }}>
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center rounded-3xl paw-pattern" style={{ border: '2px dashed var(--border-dk)' }}>
              <span className="text-4xl block mb-3" style={{ animation: 'bounce-happy 2s ease-in-out infinite' }}>🐾</span>
              <p className="font-semibold" style={{ color: 'var(--text-soft)' }}>{isRTL ? 'No categories yet' : 'No categories yet'}</p>
            </div>
          )}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="py-16" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <BoneDivider />
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text)' }}>🐾 {t.products}</h2>
            <p className="mt-2 font-semibold text-sm" style={{ color: 'var(--text-soft)' }}>{store.products?.length || 0} {isRTL ? 'Featured Product' : 'handpicked items'} ✨</p>
          </div>
          {store.products?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {store.products.map((product: any) => {
                const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
                const discount = product.priceOriginal ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails} />;
              })}
            </div>
          ) : (
            <div className="py-32 text-center rounded-3xl paw-pattern" style={{ border: '2px dashed var(--border-dk)' }}>
              <span className="text-6xl block mb-4" style={{ animation: 'bounce-happy 2s ease-in-out infinite' }}>🐾</span>
              <p className="font-bold text-xl" style={{ fontFamily: "'Baloo 2',cursive", color: 'var(--text-mid)' }}>{t.noProducts}</p>
            </div>
          )}
        </div>
      </section>

      {/* LOVE BANNER */}
      <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, var(--cocoa) 0%, var(--cocoa-lt) 60%, #5C3820 100%)' }}>
        <div className="absolute inset-0 paw-pattern opacity-20 pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--terra), transparent)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-3 mb-6">
            <DogSilhouette size={70} color="rgba(253,246,238,0.2)" />
            <CatSilhouette size={60} color="rgba(253,246,238,0.18)" style={{ marginTop: '8px' }} />
          </div>
          <h2 className="font-extrabold leading-tight text-white"
            style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,6vw,4.5rem)' }}>
            {'Because Your Pet\nDeserves the Best!'}
          </h2>
          <div className="flex items-center justify-center gap-3 my-6">
            <div className="h-px w-12" style={{ background: 'var(--terra-lt)' }} />
            <Heart className="w-5 h-5 heart-beat" style={{ color: 'var(--terra-lt)' }} />
            <div className="h-px w-12" style={{ background: 'var(--terra-lt)' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'rgba(253,246,238,0.6)' }}>
            {isRTL
              ? "Carefully selected for your companion's health and happiness" // تم تغيير ' إلى "
              : "Carefully chosen for your companion's health & happiness"
            }
          </p>
          <a href="#products" className="btn-paw inline-flex items-center gap-3 mt-8 px-10 py-4 rounded-full text-base font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--terra), var(--honey-dk))', boxShadow: '0 8px 28px rgba(224,122,95,0.4)' }}>
            <PawPrint size={16} color="rgba(255,255,255,0.85)" /> {isRTL ? 'Shop Now!' : 'Shop Now!'}
          </a>
        </div>
      </section>
    </div>
  );
}


// ─── DETAILS ──────────────────────────────────────────────────
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [selectedImage, setSelectedImage] = useState(0);
  const accents = ['var(--terra)', 'var(--honey-dk)', 'var(--sage-dk)', 'var(--caramel)', 'var(--terra-dk)'];
  const accent = accents[parseInt(product.id) % accents.length];
  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: 'var(--cream)', fontFamily: "'Nunito',sans-serif" }}>
      <header className="py-4 sticky top-0 z-40"
        style={{ backgroundColor: 'rgba(253,246,238,0.95)', backdropFilter: 'blur(16px)', borderBottom: '2px dashed var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text-soft)' }}>
            <span className="cursor-pointer hover:text-orange-600 transition-colors">🏠 {isRTL ? 'Home' : 'Home'}</span>
            <span style={{ color: 'var(--terra)' }}>›</span>
            <span style={{ color: 'var(--text)' }}>{product.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className="btn-paw w-9 h-9 rounded-full flex items-center justify-center"
              style={{ border: '2px solid var(--border-dk)', backgroundColor: isWishlisted ? 'var(--terra)' : 'white', color: isWishlisted ? 'white' : 'var(--terra)' }}>
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ border: '2px solid var(--border-dk)', backgroundColor: 'white', color: 'var(--text-soft)' }}>
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: inStock ? 'rgba(129,178,154,0.15)' : 'rgba(224,122,95,0.12)', border: `2px solid ${inStock ? 'var(--sage-dk)' : 'var(--terra)'}`, color: inStock ? 'var(--sage-dk)' : 'var(--terra)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
              {inStock ? (isRTL ? 'Available' : 'In Stock') : (isRTL ? 'Out of Stock' : 'Out of Stock')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-3xl group"
              style={{ aspectRatio: '1', backgroundColor: `${accent}10`, border: `3px solid ${accent}30` }}>
              {allImages.length > 0
                ? <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105" />
                : <div className="w-full h-full flex items-center justify-center paw-pattern"><span className="text-7xl" style={{ animation: 'bounce-happy 2s ease-in-out infinite' }}>🐾</span></div>
              }
              {discount > 0 && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-black text-white"
                  style={{ backgroundColor: accent, transform: 'rotate(6deg)', boxShadow: `0 4px 12px ${accent}50` }}>-{discount}%</div>
              )}
              <button onClick={toggleWishlist} className="btn-paw absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: isWishlisted ? 'var(--terra)' : 'var(--text-soft)', border: '2px solid var(--border)' }}>
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage(p => p === 0 ? allImages.length - 1 : p - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all btn-paw"
                    style={{ backgroundColor: 'rgba(255,255,255,0.92)', border: '2px solid var(--border)', color: 'var(--text-mid)' }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedImage(p => p === allImages.length - 1 ? 0 : p + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all btn-paw"
                    style={{ backgroundColor: 'rgba(255,255,255,0.92)', border: '2px solid var(--border)', color: 'var(--text-mid)' }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {!inStock && !autoGen && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl" style={{ backgroundColor: 'rgba(253,246,238,0.8)', backdropFilter: 'blur(4px)' }}>
                  <div className="px-6 py-3 rounded-full font-bold text-sm" style={{ border: `2px solid var(--terra)`, color: 'var(--terra)', backgroundColor: 'white' }}>
                    {isRTL ? 'Out of Stock' : 'Out of Stock'}
                  </div>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className="shrink-0 w-16 h-16 overflow-hidden rounded-2xl transition-all btn-paw"
                    style={{ border: `3px solid ${selectedImage === idx ? accent : 'var(--border)'}`, opacity: selectedImage === idx ? 1 : 0.55 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {[{ e: '🛡️', l: isRTL ? 'Secure' : 'Vet Safe' }, { e: '🚀', l: isRTL ? 'Fast Delivery' : 'Fast Ship' }, { e: '❤️', l: isRTL ? 'Trusted' : 'Trusted' }].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 py-4 rounded-2xl" style={{ border: '2px solid var(--border)', backgroundColor: 'white' }}>
                  <span className="text-xl">{b.e}</span>
                  <span className="text-[9px] font-bold text-center tracking-wider" style={{ color: 'var(--text-soft)' }}>{b.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PawPrint size={16} color={accent} />
                <span className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: accent }}>{isRTL ? 'Product' : 'Product'}</span>
              </div>
              <h1 className="leading-tight mb-3" style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: 'var(--text)' }}>{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-current' : ''}`} style={{ color: 'var(--honey-dk)' }} />)}</div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-soft)' }}>4.8 (128 {isRTL ? 'Rating' : 'reviews'}) 🌟</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-5 rounded-2xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}08, ${accent}04)`, border: `2px solid ${accent}25` }}>
              <div className="absolute top-0 left-0 w-1.5 h-full rounded-full" style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }} />
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2 pl-4" style={{ color: 'var(--text-soft)' }}>{isRTL ? '💰 Price' : '💰 Price'}</p>
              <div className="flex items-baseline gap-3 pl-4">
                <span className="font-extrabold" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '3rem', color: accent, lineHeight: 1 }}>{finalPrice.toLocaleString()}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>DZD</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <div>
                    <span className="text-sm line-through font-semibold block" style={{ color: 'var(--text-ghost)' }}>{parseFloat(product.priceOriginal).toLocaleString()} DZD</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--terra)' }}>🎉 Save {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString()} DZD</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
              style={{ backgroundColor: autoGen ? 'rgba(242,183,5,0.1)' : inStock ? 'rgba(129,178,154,0.15)' : 'rgba(224,122,95,0.1)', border: `2px solid ${autoGen ? 'var(--honey-dk)' : inStock ? 'var(--sage-dk)' : 'var(--terra)'}`, color: autoGen ? 'var(--honey-dk)' : inStock ? 'var(--sage-dk)' : 'var(--terra)' }}>
              {autoGen ? <Infinity className="w-3.5 h-3.5" /> : inStock ? <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> : <X className="w-3.5 h-3.5" />}
              {autoGen ? (isRTL ? 'Unlimited Stock' : 'Unlimited Stock') : inStock ? (isRTL ? 'Available' : 'In Stock') : (isRTL ? 'Out of Stock' : 'Out of Stock')}
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div>
                <BoneDivider />
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: accent }}>🎁 {isRTL ? 'Select Package' : 'Select Package'}</p>
                <div className="space-y-2">
                  {product.offers.map((offer: any) => (
                    <label key={offer.id} className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all btn-paw"
                      style={{ border: `2px solid ${selectedOffer === offer.id ? accent : 'var(--border)'}`, backgroundColor: selectedOffer === offer.id ? `${accent}07` : 'white' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ border: `2px solid ${selectedOffer === offer.id ? accent : 'var(--border)'}` }}>
                          {selectedOffer === offer.id && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{offer.name}</p>
                          <p className="text-[10px] font-medium" style={{ color: 'var(--text-soft)' }}>Qty: {offer.quantity}</p>
                        </div>
                      </div>
                      <span className="font-extrabold" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.3rem', color: accent }}>{offer.price.toLocaleString()} <span className="text-xs">DZD</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id}>
                <BoneDivider />
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: accent }}>🎨 {attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} className="w-9 h-9 rounded-full transition-all btn-paw"
                        style={{ backgroundColor: v.value, boxShadow: s ? `0 0 0 3px white,0 0 0 5px ${accent}` : '0 2px 8px rgba(0,0,0,0.15)', transform: s ? 'scale(1.15)' : 'scale(1)' }} />;
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className="w-14 h-14 overflow-hidden rounded-2xl transition-all btn-paw"
                        style={{ border: `3px solid ${s ? accent : 'var(--border)'}`, opacity: s ? 1 : 0.6 }}><img src={v.value} alt={v.name} className="w-full h-full object-cover" /></button>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v: any) => {
                      const s = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className="px-5 py-2.5 rounded-full text-xs font-bold transition-all btn-paw"
                        style={{ border: `2px solid ${s ? accent : 'var(--border)'}`, backgroundColor: s ? `${accent}12` : 'white', color: s ? accent : 'var(--text-mid)' }}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
          </div>
        </div>

        {product.desc && (
          <section className="mt-20 pt-12" style={{ borderTop: '2px dashed var(--border)' }}>
            <BoneDivider />
            <h2 className="flex items-center gap-3 mb-8" style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.8rem', color: 'var(--text)' }}>
              <span className="text-3xl">📋</span> {isRTL ? 'Product Details' : 'Product Details'}
            </h2>
            <div className="p-8 rounded-3xl paw-pattern" style={{ border: '2px solid var(--border)', backgroundColor: 'white' }}>
              <div className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-mid)' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}


// ─── PRODUCT FORM ─────────────────────────────────────────────
const inputSt = (err?: boolean): React.CSSProperties => ({
  width: '100%', padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600,
  backgroundColor: 'white', border: `2px solid ${err ? 'var(--terra)' : 'var(--border)'}`,
  borderRadius: '0.875rem', color: 'var(--text)', outline: 'none',
  fontFamily: "'Nunito',sans-serif", transition: 'border-color 0.25s, box-shadow 0.25s',
});
const FieldWrapper = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--text-soft)' }}>{label}</label>}
    {children}
    {error && <p className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--terra)' }}><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [formData, setFormData] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFormData(p => ({ ...p, customerId: id })); } }, []);
  useEffect(() => { if (!formData.customerWelaya) { setCommunes([]); return; } setLoadingCommunes(true); fetchCommunes(formData.customerWelaya).then(d => { setCommunes(d); setLoadingCommunes(false); }); }, [formData.customerWelaya]);

  const selectedWilayaData = useMemo(() => wilayas.find(w => String(w.id) === String(formData.customerWelaya)), [wilayas, formData.customerWelaya]);
  const getFinalPrice = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const offer = product.offers?.find(o => o.id === selectedOffer); if (offer) return offer.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) { const m = product.variantDetails.find(v => variantMatches(v, selectedVariants)); if (m && m.price !== -1) return m.price; }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  const getPriceLivraison = useCallback((): number => { if (!selectedWilayaData) return 0; return formData.typeLivraison === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice; }, [selectedWilayaData, formData.typeLivraison]);
  useEffect(() => { if (selectedWilayaData) setFormData(f => ({ ...f, priceLoss: selectedWilayaData.livraisonReturn })); }, [selectedWilayaData]);

  const finalPrice = getFinalPrice();
  const getTotalPrice = () => finalPrice * formData.quantity + +getPriceLivraison();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.customerName.trim()) e.customerName = 'Name is required';
    if (!formData.customerPhone.trim()) e.customerPhone = 'Phone number is required';
    if (!formData.customerWelaya) e.customerWelaya = 'Province is required';
    if (!formData.customerCommune) e.customerCommune = 'Municipality is required';
    return e;
  };

  const getVariantDetailId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const errs = validate(); if (Object.keys(errs).length) { setFormErrors(errs); return; } setFormErrors({}); setSubmitting(true);
    try { await axios.post(`${API_URL}/orders/create`, { ...formData, variantDetailId: getVariantDetailId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice, totalPrice: getTotalPrice(), priceLivraison: getPriceLivraison() }); if (typeof window !== 'undefined' && formData.customerId) localStorage.setItem('customerId', formData.customerId); router.push(`/lp/${domain}/successfully`); } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };
  const onFocus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = 'var(--terra)'; e.target.style.boxShadow = '0 0 0 4px rgba(224,122,95,0.12)'; };
  const onBlur = (e: React.FocusEvent<any>, err?: boolean) => { e.target.style.borderColor = err ? 'var(--terra)' : 'var(--border)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '1.5rem' }}>
      <BoneDivider />
      <h3 className="flex items-center gap-2 mb-6 font-extrabold" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.2rem', color: 'var(--text)' }}>
        📦 Order Details
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerName} label="👤 Your Name">
            <div className="relative">
              <User className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-ghost)' }} />
              <input type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} placeholder="Full Name" style={{ ...inputSt(!!formErrors.customerName), paddingRight: '2.5rem' }} onFocus={onFocus} onBlur={e => onBlur(e, !!formErrors.customerName)} />
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerPhone} label="📞 Phone">
            <div className="relative">
              <Phone className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-ghost)' }} />
              <input type="tel" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} placeholder="0X XX XX XX XX" style={{ ...inputSt(!!formErrors.customerPhone), paddingRight: '2.5rem' }} onFocus={onFocus} onBlur={e => onBlur(e, !!formErrors.customerPhone)} />
            </div>
          </FieldWrapper>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper error={formErrors.customerWelaya} label="📍 Wilaya">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-ghost)' }} />
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-ghost)' }} />
              <select value={formData.customerWelaya} onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inputSt(!!formErrors.customerWelaya), paddingRight: '2.5rem', appearance: 'none' as any, cursor: 'pointer' }}>
                <option value="">Select Province</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerCommune} label="🏘️ Commune">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-ghost)' }} />
              <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-ghost)' }} />
              <select value={formData.customerCommune} disabled={!formData.customerWelaya || loadingCommunes} onChange={e => setFormData({ ...formData, customerCommune: e.target.value })} style={{ ...inputSt(!!formErrors.customerCommune), paddingRight: '2.5rem', appearance: 'none' as any, cursor: 'pointer', opacity: !formData.customerWelaya ? 0.5 : 1 }}>
                <option value="">{loadingCommunes ? '⏳ Loading…' : 'Select Municipality'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </FieldWrapper>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text-soft)' }}>🚚 Delivery Mode</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home', 'office'] as const).map(type => (
              <button key={type} type="button" onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))} className="btn-paw flex flex-col items-center gap-2 py-5 rounded-2xl transition-all"
                style={{ border: `2px solid ${formData.typeLivraison === type ? 'var(--terra)' : 'var(--border)'}`, backgroundColor: formData.typeLivraison === type ? 'rgba(224,122,95,0.07)' : 'white' }}>
                <span className="text-2xl">{type === 'home' ? '🏠' : '🏢'}</span>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: formData.typeLivraison === type ? 'var(--terra)' : 'var(--text-soft)' }}>
                  {type === 'home' ? 'Home' : 'Office'}
                </p>
                {selectedWilayaData && <p className="text-xs font-semibold" style={{ color: 'var(--text-mid)' }}>{(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString()} DZD</p>}
              </button>
            ))}
          </div>
        </div>

        <FieldWrapper label="🔢 Quantity">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold btn-paw"
              style={{ border: '2px solid var(--border)', color: 'var(--terra)', backgroundColor: 'white' }}>−</button>
            <span className="w-12 text-center font-extrabold text-2xl" style={{ fontFamily: "'Baloo 2',cursive", color: 'var(--text)' }}>{formData.quantity}</span>
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))} className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold btn-paw"
              style={{ border: '2px solid var(--border)', color: 'var(--terra)', backgroundColor: 'white' }}>+</button>
          </div>
        </FieldWrapper>

        <div className="p-5 rounded-2xl relative overflow-hidden paw-pattern" style={{ border: '2px solid var(--border)', backgroundColor: 'white' }}>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--terra)' }}>🐾 Order Summary</p>
          <div className="space-y-2.5">
            {[{ l: 'Product', v: product.name }, { l: 'Unit Price', v: `${finalPrice.toLocaleString()} DZD` }, { l: 'Quantity', v: `× ${formData.quantity}` }, { l: 'Shipping', v: selectedWilayaData ? `${getPriceLivraison().toLocaleString()} DZD` : 'TBD' }].map(row => (
              <div key={row.l} className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-soft)' }}>{row.l}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{row.v}</span>
              </div>
            ))}
            <div className="pt-3" style={{ borderTop: '2px dashed var(--border)' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--terra)' }}>TOTAL</span>
                <span className="font-extrabold" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '2rem', color: 'var(--terra)' }}>
                  {getTotalPrice().toLocaleString()}<span className="text-sm ml-1">DZD</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-paw w-full py-4 rounded-full flex items-center justify-center gap-3 text-sm font-bold text-white transition-all"
          style={{ background: submitting ? 'var(--text-ghost)' : 'linear-gradient(135deg, var(--terra), var(--caramel))', boxShadow: submitting ? 'none' : '0 8px 24px var(--shadow-warm)', cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
            : <><PawPrint size={16} color="rgba(255,255,255,0.85)" /> Confirm Order 🐾</>
          }
        </button>
        <p className="text-[10px] text-center font-semibold flex items-center justify-center gap-1.5" style={{ color: 'var(--text-ghost)' }}>
          🔒 Secure & encrypted checkout
        </p>
      </form>
    </div>
  );
}


// ─── STATIC PAGES ─────────────────────────────────────────────
export function StaticPage({ page }: { page: string }) {
  const p = page.toLowerCase();
  return <>{p === 'privacy' && <Privacy />}{p === 'terms' && <Terms />}{p === 'cookies' && <Cookies />}{p === 'contact' && <Contact />}</>;
}

function PageWrapper({ children, emoji, title, subtitle }: { children: React.ReactNode; emoji: string; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)', fontFamily: "'Nunito',sans-serif" }}>
      <div className="relative overflow-hidden py-20" style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--cream-dk) 60%, #F0E8D8 100%)' }}>
        <FallingPaws />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 text-4xl transition-all hover:scale-110"
            style={{ background: 'linear-gradient(135deg, var(--terra), var(--honey))', boxShadow: '0 8px 24px var(--shadow-warm)' }}>
            {emoji}
          </div>
          <h1 className="font-extrabold mb-3" style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2rem,5vw,4rem)', color: 'var(--text)' }}>{title}</h1>
          <p className="text-sm font-semibold mx-auto" style={{ color: 'var(--text-mid)', maxWidth: '420px' }}>{subtitle}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '50px' }}>
            <path d="M0,50 L0,25 C200,48 400,5 600,28 C800,50 1000,8 1200,30 C1340,46 1400,20 1440,32 L1440,50 Z" fill="white" />
          </svg>
        </div>
      </div>
      <div style={{ backgroundColor: 'white' }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-8 pb-20">{children}</div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, status }: { icon: React.ReactNode; title: string; desc: string; status?: string }) {
  const isActive = status === 'Always Active' || status === 'Always Active';
  return (
    <div className="group flex gap-5 p-5 mb-3 rounded-2xl transition-all duration-300 cursor-default"
      style={{ border: '2px solid var(--border)', backgroundColor: 'var(--cream)' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--terra)'; el.style.backgroundColor = 'rgba(224,122,95,0.04)'; el.style.transform = 'translateY(-3px) rotate(0.3deg)'; el.style.boxShadow = '0 10px 28px var(--shadow-warm)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.backgroundColor = 'var(--cream)'; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--terra), var(--honey))', color: 'white' }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1.5">
          <h3 className="font-bold" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.05rem', color: 'var(--text)' }}>{title}</h3>
          {status && <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ backgroundColor: isActive ? 'rgba(129,178,154,0.15)' : 'rgba(242,183,5,0.12)', border: `2px solid ${isActive ? 'var(--sage-dk)' : 'var(--honey-dk)'}`, color: isActive ? 'var(--sage-dk)' : 'var(--honey-dk)' }}>{status}</span>}
        </div>
        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-mid)' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper emoji="🔒" title="Privacy Policy" subtitle="We protect your data like we protect our pets — with care and love.">
      <BoneDivider />
      <InfoCard icon={<Database size={18} />} title="What We Collect" desc="Only the essentials — your name, contact info, and order details needed to deliver your pet supplies safely." />
      <InfoCard icon={<Lock size={18} />} title="How We Protect It" desc="Industry-standard encryption safeguards all your personal information from unauthorized access." />
      <InfoCard icon={<Globe size={18} />} title="Data Sharing" desc="We never sell your data. We only share with trusted delivery partners to get your orders to you on time." />
      <InfoCard icon={<Bell size={18} />} title="Policy Updates" desc="We'll notify you of any changes. We believe in full transparency with our pet-loving community." />
      <div className="mt-8 p-5 rounded-2xl flex items-center gap-3" style={{ backgroundColor: 'rgba(129,178,154,0.1)', border: '2px solid rgba(129,178,154,0.4)' }}>
        <CheckCircle2 size={16} style={{ color: 'var(--sage-dk)', flexShrink: 0 }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>Last updated: February 2026. Our privacy practices are reviewed regularly. 🐾</p>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper emoji="📋" title="Terms of Service" subtitle="Simple, fair rules so every pet parent has a great experience.">
      <BoneDivider />
      <InfoCard icon={<CheckCircle2 size={18} />} title="Your Account" desc="Keep your credentials safe. You're responsible for all activity on your account — choose a strong password!" />
      <InfoCard icon={<CreditCard size={18} />} title="Payments & Pricing" desc="All prices are shown clearly with no hidden fees. What you see is exactly what your furry friend gets." />
      <InfoCard icon={<Ban size={18} />} title="Prohibited Use" desc="Please don't list counterfeit pet products. We want a safe, trustworthy marketplace for all pet parents." />
      <InfoCard icon={<Scale size={18} />} title="Governing Law" desc="These terms follow the laws of Algeria. Any disputes will be settled fairly through local courts." />
      <div className="mt-8 p-5 rounded-2xl flex items-start gap-3" style={{ backgroundColor: 'rgba(242,183,5,0.1)', border: '2px solid rgba(242,183,5,0.4)' }}>
        <AlertCircle size={16} style={{ color: 'var(--honey-dk)', flexShrink: 0, marginTop: 2 }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>We may update these terms occasionally. Continued use of our store means you accept the latest version. 🐾</p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper emoji="🍪" title="Cookie Policy" subtitle="Cookies help us keep your pet shopping experience smooth and personalized!">
      <BoneDivider />
      <InfoCard icon={<ShieldCheck size={18} />} title="Essential Cookies" desc="These keep the store running — your cart, login session, and core features. These cannot be turned off." status="Always Active" />
      <InfoCard icon={<Settings size={18} />} title="Preference Cookies" desc="Remember your language, region, and display settings so you don't have to re-configure every visit." status="Optional" />
      <InfoCard icon={<MousePointer2 size={18} />} title="Analytics Cookies" desc="Help us understand how pet parents browse so we can make the shopping experience even better." status="Optional" />
      <div className="mt-8 p-6 rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(224,122,95,0.07), rgba(242,183,5,0.07))', border: '2px solid var(--border-dk)' }}>
        <div className="flex gap-4 items-start">
          <ToggleRight size={20} style={{ color: 'var(--terra)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 className="font-bold mb-2" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.05rem', color: 'var(--text)' }}>Your Cookie Choices 🐾</h3>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-mid)' }}>You can adjust cookie preferences in your browser settings at any time. Disabling optional cookies won't break the site, just makes it a little less personalized.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const contacts = [
    { emoji: '📧', label: 'Email', value: 'hello@petparadise.dz', href: 'mailto:hello@petparadise.dz' },
    { emoji: '📞', label: 'Phone', value: '+213 550 123 456', href: 'tel:+213550123456' },
    { emoji: '📍', label: 'Location', value: 'Alger, Algérie', href: undefined },
  ];
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)', fontFamily: "'Nunito',sans-serif" }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--cream-dk) 60%, #F0E8D8 100%)' }}>
        <FallingPaws />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-3 mb-5">
            <DogSilhouette size={80} color="rgba(224,122,95,0.25)" />
            <CatSilhouette size={65} color="rgba(242,183,5,0.22)" style={{ marginTop: '10px' }} />
          </div>
          <h1 className="font-extrabold mb-3" style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2.5rem,6vw,5rem)', color: 'var(--text)' }}>Say Hello! 🐾</h1>
          <p className="text-base font-semibold" style={{ color: 'var(--text-mid)' }}>We love hearing from pet parents! Reach out anytime.</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '50px' }}>
            <path d="M0,50 L0,25 C200,48 400,5 600,28 C800,50 1000,8 1200,30 C1340,46 1400,20 1440,32 L1440,50 Z" fill="white" />
          </svg>
        </div>
      </div>

      <div style={{ backgroundColor: 'white' }}>
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact channels */}
            <div>
              <h2 className="font-extrabold mb-7" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.8rem', color: 'var(--text)' }}>🌟 Get in Touch</h2>
              <div className="space-y-3">
                {contacts.map(item => (
                  <a key={item.label} href={item.href || '#'} className="group flex items-center gap-4 p-5 rounded-2xl transition-all btn-paw"
                    style={{ border: '2px solid var(--border)', backgroundColor: 'var(--cream)', textDecoration: 'none' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--terra)'; el.style.backgroundColor = 'rgba(224,122,95,0.05)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.backgroundColor = 'var(--cream)'; }}>
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>{item.label}</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{item.value}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--terra)' }} />
                  </a>
                ))}
              </div>
              <div className="mt-8 p-6 rounded-2xl relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, var(--terra), var(--caramel))', boxShadow: '0 8px 28px var(--shadow-warm)' }}>
                <div className="absolute -right-6 -bottom-6 text-8xl opacity-15">🐾</div>
                <Heart className="w-6 h-6 mb-2 heart-beat" style={{ color: 'rgba(255,255,255,0.8)' }} />
                <p className="font-bold text-white text-lg leading-tight mb-1" style={{ fontFamily: "'Baloo 2',cursive" }}>We reply within 24 hours! ⚡</p>
                <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Every pet parent deserves fast support.</p>
              </div>
            </div>

            {/* Message form */}
            <div>
              <h2 className="font-extrabold mb-7" style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.8rem', color: 'var(--text)' }}>✉️ Send a Message</h2>
              {sent ? (
                <div className="p-10 rounded-3xl text-center paw-pattern" style={{ border: '2px dashed var(--border-dk)', backgroundColor: 'var(--cream)' }}>
                  <span className="text-6xl block mb-4" style={{ animation: 'bounce-happy 1.5s ease-in-out infinite' }}>🎉</span>
                  <p className="font-extrabold text-xl mb-1" style={{ fontFamily: "'Baloo 2',cursive", color: 'var(--text)' }}>Message Sent! 🐾</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>We'll wag our tails your way soon!</p>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4">
                  {[{ label: '👤 Your Name', type: 'text', val: formState.name, ph: 'Your name', key: 'name' }, { label: '📧 Email', type: 'email', val: formState.email, ph: 'your@email.com', key: 'email' }].map(f => (
                    <FieldWrapper key={f.key} label={f.label}>
                      <input type={f.type} value={f.val} onChange={e => setFormState({ ...formState, [f.key]: e.target.value })} placeholder={f.ph} style={inputSt()} required
                        onFocus={e => { e.target.style.borderColor = 'var(--terra)'; e.target.style.boxShadow = '0 0 0 4px rgba(224,122,95,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                    </FieldWrapper>
                  ))}
                  <FieldWrapper label="💬 Message">
                    <textarea value={formState.message} onChange={e => setFormState({ ...formState, message: e.target.value })} placeholder="Tell us about your pet! 🐾" rows={5}
                      style={{ ...inputSt(), resize: 'none' as any }} required
                      onFocus={e => { e.target.style.borderColor = 'var(--terra)'; e.target.style.boxShadow = '0 0 0 4px rgba(224,122,95,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                  </FieldWrapper>
                  <button type="submit" className="btn-paw w-full py-4 rounded-full flex items-center justify-center gap-2 text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--terra), var(--caramel))', boxShadow: '0 8px 24px var(--shadow-warm)' }}>
                    <PawPrint size={16} color="rgba(255,255,255,0.85)" /> Send Message 🐾
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}