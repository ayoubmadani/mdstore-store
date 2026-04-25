'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ShoppingBag, Truck, Shield, Package,
  ChevronDown, ChevronLeft, ChevronRight, Building2,
  AlertCircle, Check, X, Infinity, Share2, MapPin, Phone,
  User, ShieldCheck, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Smile, Gift, Zap, Sparkles, Rainbow, Mail,
  ArrowRight, Music, Rocket,
  // ــ أيقونات كانت مفقودة ــ
  ShoppingCart, Minus, Plus, Loader2, Trash2, BadgeCheck,
  Search,
} from 'lucide-react';
import { Store } from '@/types/store';
import { useCartStore } from '@/store/useCartStore';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --sun:       #FFD93D;
    --sun-dark:  #F4B942;
    --coral:     #FF6B6B;
    --coral-dk:  #E85555;
    --sky:       #4ECDC4;
    --sky-dk:    #38B2AA;
    --grape:     #A855F7;
    --grape-lt:  #C084FC;
    --mint:      #6EE7B7;
    --mint-dk:   #34D399;
    --orange:    #FF9A3C;
    --blue:      #60A5FA;
    --pink:      #F472B6;
    --bg:        #FFFBF0;
    --card-bg:   #FFFFFF;
    --text:      #2D2D2D;
    --text-mid:  #666666;
    --text-soft: #999999;
    --border:    #FFE4B5;
    --shadow:    rgba(255,107,107,0.15);
  }

  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--coral), var(--grape)); border-radius: 99px; }

  @keyframes confetti-fall {
    0%   { transform: translateY(-20px) rotate(0deg) scale(0.8); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.8; }
    100% { transform: translateY(110vh) rotate(720deg) scale(1.2) translateX(50px); opacity: 0; }
  }
  @keyframes bounce-in {
    0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
    80%  { transform: scale(0.95) rotate(-1deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes wiggle {
    0%,100% { transform: rotate(-3deg); }
    50%     { transform: rotate(3deg); }
  }
  @keyframes float-up {
    0%,100% { transform: translateY(0px) rotate(-2deg); }
    50%     { transform: translateY(-12px) rotate(2deg); }
  }
  @keyframes spin-slow  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pop-in {
    from { opacity: 0; transform: scale(0.85) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes rainbow-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes marquee-kids {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes star-twinkle {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.4; transform: scale(0.7); }
  }
  @keyframes bounce-loop {
    0%,100% { transform: translateY(0); }
    40%     { transform: translateY(-18px); }
    60%     { transform: translateY(-10px); }
  }
  @keyframes jelly {
    0%,100% { transform: scaleX(1) scaleY(1); }
    25%     { transform: scaleX(1.06) scaleY(0.94); }
    50%     { transform: scaleX(0.94) scaleY(1.06); }
    75%     { transform: scaleX(1.03) scaleY(0.97); }
  }
  @keyframes cartBounce {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  @keyframes checkAppear {
    0%   { transform: scale(0) rotate(-45deg); opacity: 0; }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }

  .rainbow-text {
    background: linear-gradient(90deg, var(--coral), var(--orange), var(--sun), var(--mint), var(--sky), var(--grape), var(--pink));
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rainbow-shift 4s ease infinite;
  }
  .bounce-in  { animation: bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
  .pop-in     { animation: pop-in 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .pop-in-d1  { animation-delay: 0.1s; }
  .pop-in-d2  { animation-delay: 0.2s; }
  .pop-in-d3  { animation-delay: 0.3s; }
  .pop-in-d4  { animation-delay: 0.4s; }
  .pop-in-d5  { animation-delay: 0.5s; }
  .animate-cart  { animation: cartBounce 0.4s ease-in-out; }
  .animate-check { animation: checkAppear 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }

  .card-tilt {
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
  }
  .card-tilt:hover {
    transform: translateY(-10px) rotate(1.5deg) scale(1.02);
    box-shadow: 0 20px 50px var(--shadow);
  }
  .card-tilt:nth-child(even):hover { transform: translateY(-10px) rotate(-1.5deg) scale(1.02); }

  .btn-bouncy {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
  }
  .btn-bouncy:hover  { transform: translateY(-3px) scale(1.04); }
  .btn-bouncy:active { transform: translateY(1px) scale(0.97); }

  .polka-dots {
    background-image: radial-gradient(circle, rgba(255,107,107,0.12) 2px, transparent 2px),
                      radial-gradient(circle, rgba(255,217,61,0.1) 2px, transparent 2px);
    background-size: 30px 30px, 50px 50px;
    background-position: 0 0, 15px 15px;
  }
  .stars-bg {
    background-image:
      radial-gradient(circle, var(--sun) 1.5px, transparent 1.5px),
      radial-gradient(circle, var(--pink) 1.5px, transparent 1.5px),
      radial-gradient(circle, var(--sky) 1.5px, transparent 1.5px);
    background-size: 40px 40px, 70px 70px, 55px 55px;
    background-position: 10px 10px, 25px 30px, 5px 50px;
  }
  .marquee-wrap { overflow: hidden; white-space: nowrap; }
  .marquee-inner { display: inline-block; animation: marquee-kids 18s linear infinite; }
  .sticker:hover { animation: wiggle 0.4s ease-in-out; }

  .cart-badge {
    position: absolute; top: -5px; left: -5px;
    min-width: 18px; height: 18px; border-radius: 9px;
    background: var(--coral); color: white;
    font-size: 10px; font-weight: 900;
    display: flex; align-items: center; justify-content: center; padding: 0 4px;
    box-shadow: 0 0 8px rgba(255,107,107,0.6);
    font-family: 'Nunito', sans-serif;
  }
`;

// ─────────────────────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i, left: `${(i * 4.7) % 100}%`, delay: `${(i * 0.6) % 10}s`,
    duration: `${6 + (i * 0.8) % 8}s`, size: `${8 + (i * 1.3) % 12}px`,
    color: ['#FFD93D','#FF6B6B','#4ECDC4','#A855F7','#F472B6','#FF9A3C','#60A5FA','#6EE7B7'][i % 8],
    shape: i % 3,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.left, top: '-20px',
          width: p.size, height: p.size, backgroundColor: p.color,
          borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '2px' : '0',
          transform: p.shape === 2 ? 'rotate(45deg)' : 'none',
          animation: `confetti-fall ${p.duration} ${p.delay} ease-in infinite`, opacity: 0,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STAR DECO
// ─────────────────────────────────────────────────────────────
function StarDeco({ color = '#FFD93D', size = 20, delay = '0s', style = {} }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
      style={{ animation: `star-twinkle 2s ${delay} ease-in-out infinite`, ...style }}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// WAVY DIVIDER
// ─────────────────────────────────────────────────────────────
function WavyDivider({ topColor = '#fff', bottomColor = '#FFFBF0', flip = false }: any) {
  return (
    <div style={{ position: 'relative', height: '70px', overflow: 'hidden', backgroundColor: flip ? topColor : bottomColor }}>
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%', display: 'block' }}>
        <path d="M0,35 C180,70 360,0 540,35 C720,70 900,0 1080,35 C1260,70 1380,20 1440,35 L1440,70 L0,70 Z"
          fill={flip ? bottomColor : topColor} />
      </svg>
    </div>
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
function variantMatches(detail: VariantDetail, sel: Record<string,string>): boolean {
  return Object.entries(sel).every(([n,v]) => detail.name.some(e => e.attrName===n && e.value===v));
}
const fetchWilayas  = async (uid: string): Promise<Wilaya[]>  => { try { const {data} = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data||[]; } catch { return []; }};
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const {data} = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data||[]; } catch { return []; }};

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────
export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', fontFamily: "'Nunito', sans-serif", color: 'var(--text)' }}>
      <style>{FONT_CSS}</style>
      {store.topBar?.enabled && store.topBar?.text && (
        <div className="marquee-wrap py-2.5"
          style={{ background: 'linear-gradient(90deg, var(--coral), var(--orange), var(--sun), var(--mint), var(--sky), var(--grape), var(--pink), var(--coral))', backgroundSize: '200% 100%', animation: 'rainbow-shift 6s linear infinite' }}>
          <div className="marquee-inner">
            {Array(8).fill(null).map((_,i) => <span key={i} className="mx-8 text-white font-bold text-xs tracking-widest uppercase">⭐ {store.topBar.text}</span>)}
            {Array(8).fill(null).map((_,i) => <span key={`b${i}`} className="mx-8 text-white font-bold text-xs tracking-widest uppercase">⭐ {store.topBar.text}</span>)}
          </div>
        </div>
      )}
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR  ← مُصلح: أضيفت أيقونة السلة + عداد
// ─────────────────────────────────────────────────────────────

export function Navbar({ store, domain }: { store: any; domain?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  const router = useRouter();
  const isRTL = store.language === 'ar';

  const itemsCartCount = useCartStore((state) => state.count);
  const initCount = useCartStore((state) => state.initCount);

  // 1. مراقبة التمرير لتغيير خلفية الـ Nav
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  // 2. تهيئة السلة من التخزين المحلي
  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try {
        const stored = localStorage.getItem(domain);
        const items = JSON.parse(stored || '[]');
        initCount(Array.isArray(items) ? items.length : 0);
      } catch { initCount(0); }
    }
  }, [domain, initCount]);

  // 3. منطق البحث الحيوي (Live Search)
  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        // تأكد من تعريف API_URL في مشروعك
        const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { 
          params: { search: searchQuery } 
        });
        setListSearch(data.products || []);
      } catch { } finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery, domain]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setListSearch([]);
      setShowMobileSearch(false);
    }
  };

  const nav = [
    { href: '/',          label: isRTL ? 'الرئيسية' : 'Home',    emoji: '🏠' },
    { href: '/contact',   label: isRTL ? 'اتصل بنا' : 'Contact', emoji: '📞' },
    { href: '/Privacy',   label: isRTL ? 'الخصوصية' : 'Privacy', emoji: '🔒' },
  ];

  const initials = store.name.split(' ').filter(Boolean).map((w:string)=>w[0]).join('').slice(0,2).toUpperCase();

  // مكون نتائج البحث المنسدلة
  const SearchDropdown = () => (
    <div className="absolute top-full left-0 right-0 bg-white border-2 border-[var(--border)] rounded-2xl shadow-xl mt-2 overflow-hidden z-[60]">
      {loading ? (
        <div className="p-4 text-center text-sm text-[var(--coral)] font-bold">جاري البحث عن ألعاب... 🧸</div>
      ) : listSearch.length > 0 ? (
        listSearch.map((p: any) => (
          <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSearchQuery('')}
            className="flex items-center gap-3 p-3 border-b-2 border-[var(--bg)] hover:bg-[var(--bg)] transition-colors no-underline">
            <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} className="w-10 h-10 rounded-xl object-cover border border-[var(--border)]" alt="" />
            <div className="flex-1">
              <div className="text-[var(--text)] text-xs font-bold truncate">{p.name}</div>
              <div className="text-[var(--coral)] text-[10px] font-black">{p.price} دج</div>
            </div>
          </Link>
        ))
      ) : searchQuery.length >= 2 && (
        <div className="p-4 text-center text-xs text-[var(--text-mid)]">لم نجد هذه اللعبة 🧩</div>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300" dir={isRTL?'rtl':'ltr'}
      style={{
        backgroundColor: scrolled ? 'rgba(255,251,240,0.95)' : 'var(--bg)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: '3px solid transparent',
        borderImage: 'linear-gradient(90deg, var(--coral), var(--sun), var(--mint), var(--sky), var(--grape)) 1',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between h-18 py-3 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:rotate-6 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, var(--coral) 0%, var(--grape) 100%)' }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                : <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem', color: 'white' }}>{initials}</span>
              }
            </div>
            <div className="hidden sm:block">
              <span className="block font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.3rem', color: 'var(--text)' }}>{store.name}</span>
            </div>
          </Link>

          {/* Desktop Search Input */}
          <div className="hidden lg:block flex-1 max-w-sm relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input type="text" placeholder={isRTL ? "ابحث عن ألعابك..." : "Search for toys..."} 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full py-2.5 px-5 pr-10 rounded-full border-2 border-[var(--border)] outline-none text-sm font-bold focus:border-[var(--coral)] transition-all"
                style={{ backgroundColor: 'white' }}
              />
              <Search className={`absolute ${isRTL?'left-4':'right-4'} top-1/2 -translate-y-1/2 text-[var(--text-mid)]`} size={18} />
            </form>
            {searchQuery.length >= 2 && <SearchDropdown />}
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              {nav.map(item => (
                <Link key={item.href} href={item.href} className="px-3 py-2 rounded-full text-xs font-bold transition-all hover:text-[var(--coral)]" style={{ color: 'var(--text-mid)' }}>
                  {item.label}
                </Link>
              ))}
            </div>

            <Link href="/cart" className="btn-bouncy relative flex items-center justify-center w-11 h-11 rounded-xl border-2 border-[var(--border)] bg-white text-[var(--coral)]">
              <ShoppingCart className="w-5 h-5" />
              {itemsCartCount > 0 && <span className="cart-badge">{itemsCartCount}</span>}
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border-2 border-[var(--border)] text-[var(--coral)]">
              <Search size={20} />
            </button>
            <Link href="/cart" className="relative w-10 h-10 rounded-xl border-2 border-[var(--border)] bg-white flex items-center justify-center text-[var(--coral)]">
              <ShoppingCart className="w-5 h-5" />
              {itemsCartCount > 0 && <span className="cart-badge">{itemsCartCount}</span>}
            </Link>
            <button onClick={() => setMenuOpen(p=>!p)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,107,0.1)] text-[var(--coral)]">
              {menuOpen ? <X size={20} /> : <span className="text-lg">🎯</span>}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Overlay */}
        {showMobileSearch && (
          <div className="md:hidden pb-4 relative">
            <form onSubmit={handleSearchSubmit}>
              <input autoFocus type="text" placeholder={isRTL ? "ماذا تبحث اليوم؟" : "Search toys..."} 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full p-3 rounded-2xl border-2 border-[var(--coral)] outline-none font-bold"
              />
            </form>
            {searchQuery.length >= 2 && <SearchDropdown />}
          </div>
        )}

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-72 pb-5' : 'max-h-0'}`}>
          <div className="pt-4 space-y-2 border-t-2 border-dashed border-[var(--border)]">
            {nav.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-[var(--text)] hover:bg-orange-50">
                <span className="flex items-center gap-3"><span>{item.emoji}</span>{item.label}</span>
                <ArrowRight size={14} className="text-[var(--coral)]" />
              </Link>
            ))}
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
  const isRTL = store.language === 'ar';
  return (
    <footer className="relative" style={{ backgroundColor: '#1A1A2E', fontFamily: "'Nunito', sans-serif", overflow: 'hidden' }}>
      <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none" />
      <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, var(--coral), var(--orange), var(--sun), var(--mint-dk), var(--sky), var(--grape), var(--pink))' }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--coral), var(--grape))' }}>
                <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem', color: 'white' }}>{store.name.charAt(0)}</span>
              </div>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.4rem', color: 'white' }}>{store.name}</span>
            </div>
            <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {isRTL ? '🎁 ألعاب وملابس أطفال بجودة عالية وأسعار مناسبة!' : '🎁 Quality toys & kids clothing for every little adventurer!'}
            </p>
            <div className="flex gap-2 mt-5 text-2xl">
              {['🚀','⭐','🎨','🦄','🎮'].map((e,i) => (
                <span key={i} className="transition-transform hover:scale-125 cursor-default"
                  style={{ display: 'inline-block', animation: `float-up ${2+i*0.3}s ease-in-out infinite`, animationDelay: `${i*0.3}s` }}>{e}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-5 font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--sun)', fontFamily: "'Fredoka One', cursive", fontSize: '1rem' }}>
              🗺️ {isRTL ? 'روابط مهمة' : 'Quick Links'}
            </h4>
            <div className="space-y-3">
              {[
                { href: '/Privacy', label: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy',   emoji: '🔒' },
                { href: '/Terms',   label: isRTL ? 'شروط الخدمة'     : 'Terms of Service', emoji: '📋' },
                { href: '/Cookies', label: isRTL ? 'ملفات الارتباط'   : 'Cookie Policy',   emoji: '🍪' },
                { href: '/contact', label: isRTL ? 'اتصل بنا'         : 'Contact Us',      emoji: '💌' },
              ].map(l => (
                <a key={l.href} href={l.href} className="flex items-center gap-2 text-sm font-medium transition-all hover:translate-x-1"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='var(--sky)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.55)'; }}>
                  <span>{l.emoji}</span>{l.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="font-bold text-base text-white leading-snug" style={{ fontFamily: "'Fredoka One', cursive" }}>
                {isRTL ? 'لأن كل طفل يستحق الأفضل!' : "Because every kid deserves the best!"}
              </p>
              <p className="text-xs font-medium mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {isRTL ? 'منتجات آمنة وممتعة لأطفالك' : 'Safe, fun & approved for little ones'}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { e: '✅', label: isRTL ? 'آمن للأطفال' : 'Child Safe' },
                { e: '🏅', label: isRTL ? 'جودة عالية' : 'Top Quality' },
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                  <span>{b.e}</span>{b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} {store.name} · {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'} 🎉
          </p>
          <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>Kids' Kingdom Theme 👑</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────
export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const [hovered, setHovered] = useState(false);
  const brandColor = 'var(--coral)';
  const brandLight = `${brandColor}15`;

  return (
    <div className="card-tilt group flex flex-col overflow-hidden rounded-3xl bg-white h-full"
      style={{ border: `3px solid ${hovered ? brandColor : 'var(--border)'}`, position: 'relative', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="h-1.5 w-full" style={{ backgroundColor: brandColor }} />
      <div className="relative overflow-hidden" style={{ aspectRatio: '1', backgroundColor: brandLight }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700" style={{ transform: hovered ? 'scale(1.1)' : 'scale(1)' }} />
          : <div className="w-full h-full flex flex-col items-center justify-center gap-3"><span className="text-5xl opacity-50">🧸</span><span className="text-xs font-bold" style={{ color: brandColor }}>لا توجد صورة</span></div>
        }
        {discount > 0 && (
          <div className="absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center sticker"
            style={{ backgroundColor: brandColor, color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: '0.85rem', boxShadow: `0 4px 12px ${brandColor}60`, transform: 'rotate(12deg)' }}>
            -{discount}%
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : 'opacity-30'}`} style={{ color: brandColor }} />)}
          <span className="ml-1 text-[10px] font-bold opacity-60">4.8</span>
        </div>
        <h3 className="font-bold leading-snug mb-2 line-clamp-2" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: 'var(--text)' }}>{product.name}</h3>
        {product.desc && <div className="text-xs font-medium mb-4 line-clamp-2 opacity-70 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.desc }} />}
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid var(--border)` }}>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase opacity-50">السعر</span>
              <div className="flex items-baseline gap-1">
                <span className="font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.3rem', color: brandColor }}>{product.price}</span>
                <span className="text-[10px] font-bold opacity-60">{store.currency}</span>
              </div>
            </div>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="text-xs line-through opacity-40 font-medium">{product.priceOriginal}</span>
            )}
          </div>
          <Link href={`/product/${product.slug || product.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ backgroundColor: brandColor, boxShadow: hovered ? `0 8px 20px ${brandColor}40` : 'none', transform: hovered ? 'translateY(-2px)' : 'translateY(0)' }}>
            {viewDetails} <ArrowRight className={`w-4 h-4 transition-transform ${hovered ? 'translate-x-1' : ''}`} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME  ← مُصلح: أضيف الترقيم (pagination)
// ─────────────────────────────────────────────────────────────
export function Home({ store, page }: any) {
  const isRTL = store.language === 'ar';
  const dir   = isRTL ? 'rtl' : 'ltr';
  const products: any[] = store.products || [];

  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  const t = {
    heroLabel:   isRTL ? '🎪 عالم الأطفال الساحر'  : '🎪 The Magical Kids World',
    heroTitle:   isRTL ? 'كل شيء\nيحبه أطفالك!'    : 'Everything\nKids Love!',
    heroSub:     isRTL ? 'ألعاب وملابس وأدوات ترفيه آمنة وممتعة لأطفالك السعداء' : 'Safe, fun toys, clothing & accessories for your little adventurers!',
    heroBtn:     isRTL ? '🛍️ تسوق الآن'           : '🛍️ Start Shopping!',
    heroBtn2:    isRTL ? '🎁 العروض الخاصة'        : '🎁 Special Offers',
    categories:  isRTL ? 'تسوق حسب الفئة'          : 'Shop by Category',
    all:         isRTL ? 'الكل'                      : 'All',
    products:    isRTL ? 'منتجاتنا المميزة'         : 'Our Awesome Products',
    noProducts:  isRTL ? 'لا توجد منتجات بعد 🧸'    : 'No products yet 🧸',
    viewDetails: isRTL ? 'اعرف المزيد'              : 'Get It!',
  };

  const features = [
    { emoji: '🛡️', title: isRTL ? 'آمن للأطفال' : 'Child Safe',     sub: isRTL ? 'جميع المنتجات تجتاز معايير السلامة' : 'All products pass safety standards' },
    { emoji: '🚀', title: isRTL ? 'توصيل سريع'  : 'Fast Delivery',  sub: isRTL ? 'يصل لبيتك في وقت قياسي'           : 'Delivered right to your door'       },
    { emoji: '⭐', title: isRTL ? 'جودة عالية'  : 'Top Quality',    sub: isRTL ? 'منتجات مختارة بعناية'             : 'Handpicked for durability & fun'    },
    { emoji: '💝', title: isRTL ? 'ضمان الرضا'  : 'Happy Guarantee', sub: isRTL ? 'رضاك يهمنا دائماً'             : 'We ensure every child smiles'       },
  ];

  return (
    <div dir={dir} style={{ backgroundColor: 'var(--bg)', fontFamily: "'Nunito', sans-serif" }}>

      {/* HERO */}
      <section className="relative overflow-hidden polka-dots" style={{ minHeight: '95vh', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg)' }}>
        <Confetti />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle, var(--grape), transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full pointer-events-none opacity-15" style={{ background: 'radial-gradient(circle, var(--sky), transparent 70%)' }} />
        <StarDeco color="var(--sun)" size={28} delay="0s" style={{ position:'absolute', top:'12%', left:'8%', animation: 'float-up 3s ease-in-out infinite' }} />
        <StarDeco color="var(--coral)" size={20} delay="0.8s" style={{ position:'absolute', top:'20%', right:'12%', animation: 'float-up 2.5s ease-in-out infinite' }} />
        {['🚂','🦄','🎨','🏆','🎪'].map((e,i) => (
          <span key={e} className="absolute text-4xl pointer-events-none hidden lg:block"
            style={{ top: `${15+i*15}%`, left: i%2===0 ? `${2+i*2}%` : undefined, right: i%2!==0 ? `${2+i*1.5}%` : undefined, animation: `float-up ${2.5+i*0.4}s ${i*0.5}s ease-in-out infinite`, opacity: 0.7 }}>{e}</span>
        ))}
        {store.hero?.imageUrl && <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}><img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity: 0.1 }} /></div>}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl">
            <div className="pop-in inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-7 font-bold text-sm" style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.12), rgba(168,85,247,0.12))', border: '2px solid rgba(255,107,107,0.25)', color: 'var(--coral)' }}>🎠 {t.heroLabel}</div>
            <h1 className="pop-in pop-in-d1 whitespace-pre-line leading-tight mb-5" style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(3rem,8vw,6.5rem)', color: 'var(--text)', letterSpacing: '0.01em', lineHeight: 1.1 }}>{store.hero?.title || t.heroTitle}</h1>
            <div className="pop-in pop-in-d1 h-2 w-40 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, var(--coral), var(--sun), var(--mint), var(--sky), var(--grape))' }} />
            <p className="pop-in pop-in-d2 text-base font-semibold leading-relaxed mb-10" style={{ color: 'var(--text-mid)', maxWidth: '420px' }}>{store.hero?.subtitle || t.heroSub}</p>
            <div className="pop-in pop-in-d3 flex flex-wrap gap-4">
              <a href="#products" className="btn-bouncy flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-black text-white" style={{ background: 'linear-gradient(135deg, var(--coral) 0%, var(--grape) 100%)', boxShadow: '0 8px 28px rgba(255,107,107,0.4)' }}>{t.heroBtn}</a>
              <a href="#categories" className="btn-bouncy flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-black" style={{ border: '3px solid var(--sun)', color: 'var(--text)', backgroundColor: 'white', boxShadow: '0 4px 16px rgba(255,217,61,0.3)' }}>{t.heroBtn2}</a>
            </div>
          </div>
        </div>
      </section>

      <WavyDivider topColor="var(--bg)" bottomColor="white" />

      {/* FEATURES */}
      <section style={{ backgroundColor: 'white', paddingBottom: '3rem' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f,i) => (
              <div key={i} className="flex flex-col items-center text-center p-5 rounded-3xl transition-all hover:-translate-y-2 group" style={{ border: '2px solid var(--border)', backgroundColor: 'var(--bg)' }}>
                <span className="text-3xl mb-3" style={{ display: 'block', animation: `float-up ${2+i*0.3}s ${i*0.2}s ease-in-out infinite` }}>{f.emoji}</span>
                <p className="font-black text-sm mb-1" style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--text)', fontSize: '0.95rem' }}>{f.title}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--text-soft)' }}>{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WavyDivider topColor="white" bottomColor="var(--bg)" />

      {/* CATEGORIES */}
      <section id="categories" className="py-16" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-3xl" style={{ animation: 'spin-slow 6s linear infinite', display: 'inline-block' }}>🎡</span>
              <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text)' }}>{t.categories}</h2>
              <span className="text-3xl" style={{ animation: 'spin-slow 6s linear infinite reverse', display: 'inline-block' }}>🎡</span>
            </div>
          </div>
          {store.categories?.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/${store.domain}`} className="btn-bouncy flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow: '0 4px 16px rgba(255,107,107,0.35)' }}>✨ {t.all}</Link>
              {store.categories.map((cat: any, idx: number) => {
                const colors = ['var(--sky)', 'var(--mint-dk)', 'var(--orange)', 'var(--grape)', 'var(--coral)'];
                const c = colors[idx % colors.length];
                return (
                  <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`} className="btn-bouncy px-6 py-3 rounded-2xl text-sm font-bold transition-all"
                    style={{ border: `2px solid ${c}`, color: c, backgroundColor: `${c}10` }}
                    onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.backgroundColor=c; el.style.color='white'; }}
                    onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.backgroundColor=`${c}10`; el.style.color=c; }}>{cat.name}</Link>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center rounded-3xl polka-dots" style={{ border: '3px dashed var(--border)' }}>
              <span className="text-4xl block mb-3">🎪</span>
              <p className="font-bold" style={{ color: 'var(--text-soft)' }}>{isRTL ? 'لا توجد تصنيفات بعد' : 'No categories yet'}</p>
            </div>
          )}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text)' }}>🎁 {t.products}</h2>
            <p className="mt-2 font-medium text-sm" style={{ color: 'var(--text-soft)' }}>{products.length} {isRTL ? 'منتج رائع' : 'awesome items'} 🌟</p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product: any) => {
                const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
                const discount = product.priceOriginal ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} isRTL={isRTL} store={store} viewDetails={t.viewDetails} />;
              })}
            </div>
          ) : (
            <div className="py-32 text-center rounded-3xl polka-dots" style={{ border: '3px dashed var(--border)' }}>
              <span className="text-6xl block mb-4" style={{ animation: 'bounce-loop 2s ease-in-out infinite' }}>🧸</span>
              <p className="font-black text-xl" style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--text-mid)' }}>{t.noProducts}</p>
            </div>
          )}

          {/* ← الترقيم مُضاف */}
          {countPage > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12" dir={dir}>
              <Link href={{ query: { ...Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')), page: Math.max(1, page - 1) } }} scroll={false}
                className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm transition-all ${Number(page) === 1 ? 'pointer-events-none opacity-20' : ''}`}
                style={{ border: '2px solid var(--border)', backgroundColor: 'white', color: 'var(--coral)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </Link>
              {Array.from({ length: Math.ceil(countPage) }).map((_, i) => {
                const pn = i + 1; const isActive = Number(page) === pn;
                return (
                  <Link key={pn} href={{ query: { ...Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')), page: pn } }} scroll={false}
                    className="flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm transition-all"
                    style={{
                      border: `2px solid ${isActive ? 'var(--coral)' : 'var(--border)'}`,
                      backgroundColor: isActive ? 'var(--coral)' : 'white',
                      color: isActive ? 'white' : 'var(--text-mid)',
                      boxShadow: isActive ? '0 4px 16px rgba(255,107,107,0.35)' : 'none',
                    }}>
                    {pn}
                  </Link>
                );
              })}
              <Link href={{ query: { ...Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')), page: Math.min(Math.ceil(countPage), Number(page) + 1) } }} scroll={false}
                className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm transition-all ${Number(page) >= Math.ceil(countPage) ? 'pointer-events-none opacity-20' : ''}`}
                style={{ border: '2px solid var(--border)', backgroundColor: 'white', color: 'var(--coral)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FUN BANNER */}
      <section className="relative overflow-hidden py-20" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}>
        <div className="absolute inset-0 stars-bg opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-4 mb-6 text-4xl">
            {['🚀','⭐','🎉','✨'].map((e,i) => <span key={i} style={{ animation: `float-up ${2+i*0.3}s ${i*0.2}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>)}
          </div>
          <h2 className="font-black text-white leading-tight" style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(2rem,6vw,5rem)', lineHeight: 1.15 }}>
            {isRTL ? 'الفرح لا يتوقف هنا!' : 'The Fun Never Stops!'}
          </h2>
          <p className="mt-4 text-base font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {isRTL ? 'آلاف المنتجات الممتعة والآمنة في انتظار أطفالك' : 'Thousands of fun & safe products waiting for your kids'}
          </p>
          <a href="#products" className="btn-bouncy inline-flex items-center gap-3 mt-8 px-10 py-4 rounded-2xl text-base font-black text-white"
            style={{ background: 'linear-gradient(135deg, var(--coral), var(--orange), var(--sun))', boxShadow: '0 8px 30px rgba(255,107,107,0.5)' }}>
            🎪 {isRTL ? 'استكشف الآن!' : 'Explore Now!'}
          </a>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAILS
// ─────────────────────────────────────────────────────────────
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [selectedImage, setSelectedImage] = useState(0);
  const accentColor = ['var(--coral)', 'var(--sky)', 'var(--grape)', 'var(--orange)', 'var(--mint-dk)'][parseInt(product.id) % 5];

  return (
    <div className="min-h-screen" dir={isRTL?'rtl':'ltr'} style={{ backgroundColor: 'var(--bg)', fontFamily: "'Nunito', sans-serif" }}>
      

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-3xl group" style={{ aspectRatio: '1', backgroundColor: `${accentColor}15`, border: `3px solid ${accentColor}40` }}>
              {allImages.length > 0
                ? <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                : <div className="w-full h-full flex items-center justify-center polka-dots"><span className="text-8xl" style={{ animation: 'float-up 3s ease-in-out infinite' }}>🧸</span></div>
              }
              {discount > 0 && (
                <div className="absolute top-4 right-4 w-14 h-14 rounded-full flex items-center justify-center font-black text-white sticker"
                  style={{ backgroundColor: 'var(--coral)', fontFamily: "'Fredoka One', cursive", fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(255,107,107,0.5)', transform: 'rotate(12deg)' }}>-{discount}%</div>
              )}
              <button onClick={toggleWishlist} className="absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center btn-bouncy"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: isWishlisted ? 'var(--coral)' : 'var(--text-soft)' }}>
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage(p=>p===0?allImages.length-1:p-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all btn-bouncy"
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '2px solid var(--border)', color: 'var(--text)' }}><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setSelectedImage(p=>p===allImages.length-1?0:p+1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all btn-bouncy"
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '2px solid var(--border)', color: 'var(--text)' }}><ChevronRight className="w-4 h-4" /></button>
                </>
              )}
              {!inStock && !autoGen && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl" style={{ backgroundColor: 'rgba(255,251,240,0.85)', backdropFilter: 'blur(4px)' }}>
                  <div className="px-6 py-4 rounded-2xl text-base font-black" style={{ border: '3px solid var(--coral)', color: 'var(--coral)', backgroundColor: 'white' }}>😢 {isRTL?'نفد المخزون':'Out of Stock'}</div>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img:string,idx:number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className="shrink-0 w-16 h-16 overflow-hidden rounded-2xl transition-all btn-bouncy"
                    style={{ border: `3px solid ${selectedImage===idx ? accentColor : 'var(--border)'}`, opacity: selectedImage===idx ? 1 : 0.55 }}><img src={img} alt="" className="w-full h-full object-cover" /></button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {[{ e:'🛡️', l:isRTL?'دفع آمن':'Secure Pay' },{ e:'🚀', l:isRTL?'توصيل سريع':'Fast Ship' },{ e:'⭐', l:isRTL?'جودة عالية':'Quality' }].map((b,i) => (
                <div key={i} className="flex flex-col items-center gap-1 py-3 rounded-2xl" style={{ border: '2px solid var(--border)', backgroundColor: 'white' }}>
                  <span className="text-xl">{b.e}</span><span className="text-[9px] font-bold text-center" style={{ color: 'var(--text-soft)' }}>{b.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-8 rounded-full" style={{ background: accentColor }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: accentColor }}>🎁 {isRTL?'المنتج':'Product'}</span>
              </div>
              <h1 className="leading-tight mb-3" style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(1.6rem,3.5vw,2.5rem)', color: 'var(--text)', letterSpacing: '0.01em' }}>{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{[...Array(5)].map((_,i)=><Star key={i} className={`w-4 h-4 ${i<4?'fill-current':''}`} style={{ color:'var(--sun-dark)' }}/>)}</div>
                <span className="text-xs font-bold" style={{ color:'var(--text-soft)' }}>4.8 (128 {isRTL?'تقييم':'reviews'}) 🌟</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-5 rounded-3xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`, border: `3px solid ${accentColor}30` }}>
              <div className="absolute top-0 left-0 w-1.5 h-full rounded-full" style={{ background: accentColor }} />
              <p className="text-[10px] font-black uppercase tracking-wider mb-2 pl-4" style={{ color: 'var(--text-soft)' }}>{isRTL?'💰 السعر':'💰 Price'}</p>
              <div className="flex items-baseline gap-3 pl-4">
                <span className="font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '3rem', color: accentColor, lineHeight: 1 }}>{finalPrice.toLocaleString()}</span>
                <span className="text-base font-bold" style={{ color: 'var(--text-mid)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <div>
                    <span className="text-sm line-through font-bold block" style={{ color: 'var(--text-soft)' }}>{parseFloat(product.priceOriginal).toLocaleString()} دج</span>
                    <span className="text-xs font-black" style={{ color: 'var(--coral)' }}>🎉 وفّر {(parseFloat(product.priceOriginal)-finalPrice).toLocaleString()} دج!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-black"
              style={{ backgroundColor: autoGen?'rgba(255,217,61,0.15)':inStock?'rgba(110,231,183,0.15)':'rgba(255,107,107,0.1)', border: `2px solid ${autoGen?'var(--sun-dark)':inStock?'var(--mint-dk)':'var(--coral)'}`, color: autoGen?'var(--sun-dark)':inStock?'var(--mint-dk)':'var(--coral)' }}>
              {autoGen?'♾️ ':inStock?'✅ ':'❌ '}
              {autoGen?(isRTL?'مخزون غير محدود':'Unlimited'):inStock?(isRTL?'متوفر':'In Stock'):(isRTL?'نفد':'Out')}
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: accentColor }}>🎁 {isRTL?'اختر الباقة':'Select Package'}</p>
                <div className="space-y-2">
                  {product.offers.map((offer:any) => (
                    <label key={offer.id} className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all btn-bouncy"
                      style={{ border: `3px solid ${selectedOffer===offer.id?accentColor:'var(--border)'}`, backgroundColor: selectedOffer===offer.id?`${accentColor}08`:'white' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ border: `2px solid ${selectedOffer===offer.id?accentColor:'var(--border)'}`, backgroundColor: selectedOffer===offer.id?accentColor:'transparent' }}>
                          {selectedOffer===offer.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer===offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                        <div><p className="text-sm font-bold" style={{ color:'var(--text)' }}>{offer.name}</p><p className="text-[10px] font-medium" style={{ color:'var(--text-soft)' }}>Qty: {offer.quantity}</p></div>
                      </div>
                      <span className="font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.3rem', color: accentColor }}>{offer.price.toLocaleString()} <span className="text-xs">دج</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr:any) => (
              <div key={attr.id}>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: accentColor }}>🎨 {attr.name}</p>
                {attr.displayMode==='color' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any) => {
                      const s = selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name,v.value)} title={v.name} className="w-10 h-10 rounded-xl transition-all btn-bouncy"
                        style={{ backgroundColor:v.value, boxShadow:s?`0 0 0 3px white,0 0 0 5px ${accentColor}`:'0 2px 8px rgba(0,0,0,0.15)', transform:s?'scale(1.15)':'scale(1)' }} />;
                    })}
                  </div>
                ) : attr.displayMode==='image' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v:any) => {
                      const s = selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name,v.value)} className="w-14 h-14 overflow-hidden rounded-2xl transition-all btn-bouncy"
                        style={{ border:`3px solid ${s?accentColor:'var(--border)'}`, opacity:s?1:0.6 }}><img src={v.value} alt={v.name} className="w-full h-full object-cover" /></button>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v:any) => {
                      const s = selectedVariants[attr.name]===v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name,v.value)} className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all btn-bouncy"
                        style={{ border:`2px solid ${s?accentColor:'var(--border)'}`, backgroundColor:s?`${accentColor}15`:'white', color:s?accentColor:'var(--text-mid)' }}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
          </div>
        </div>

        {product.desc && (
          <section className="mt-16 pt-10" style={{ borderTop: '3px dashed var(--border)' }}>
            <h2 className="flex items-center gap-3 mb-8" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.8rem', color: 'var(--text)' }}>
              <span className="text-3xl">📖</span> {isRTL?'تفاصيل المنتج':'Product Details'}
            </h2>
            <div className="p-8 rounded-3xl polka-dots" style={{ border: '2px solid var(--border)', backgroundColor: 'white' }}>
              <div className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-mid)' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','span'], ALLOWED_ATTR:['class','style'] }) }} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCT FORM  ← مُصلح: أضيفت السلة + الطلب المباشر + API endpoint
// ─────────────────────────────────────────────────────────────
const inputSt = (err?: boolean): React.CSSProperties => ({
  width: '100%', padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600,
  backgroundColor: 'white', border: `2px solid ${err ? 'var(--coral)' : 'var(--border)'}`,
  borderRadius: '0.875rem', color: 'var(--text)', outline: 'none',
  fontFamily: "'Nunito', sans-serif", transition: 'border-color 0.2s, box-shadow 0.2s',
});

const FieldWrapper = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-mid)' }}>{label}</label>}
    {children}
    {error && <p className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--coral)' }}><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,setWilayas] = useState<Wilaya[]>([]);
  const [communes,setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes,setLoadingCommunes] = useState(false);
  const [formData,setFormData] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [formErrors,setFormErrors] = useState<Record<string,string>>({});
  const [submitting,setSubmitting] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const initCount = useCartStore((state) => state.initCount);

  useEffect(() => { if(userId) fetchWilayas(userId).then(setWilayas); },[userId]);
  useEffect(() => { if(typeof window!=='undefined'){ const id=localStorage.getItem('customerId'); if(id) setFormData(p=>({...p,customerId:id})); } },[]);
  useEffect(() => { if(!formData.customerWelaya){setCommunes([]);return;} setLoadingCommunes(true); fetchCommunes(formData.customerWelaya).then(d=>{setCommunes(d);setLoadingCommunes(false);}); },[formData.customerWelaya]);

  const selectedWilayaData = useMemo(() => wilayas.find(w=>String(w.id)===String(formData.customerWelaya)),[wilayas,formData.customerWelaya]);
  const getFinalPrice = useCallback(():number => {
    const base = typeof product.price==='string'?parseFloat(product.price):product.price as number;
    const offer = product.offers?.find(o=>o.id===selectedOffer);
    if(offer) return offer.price;
    if(product.variantDetails?.length && Object.keys(selectedVariants).length>0){ const m=product.variantDetails.find(v=>variantMatches(v,selectedVariants)); if(m&&m.price!==-1) return m.price; }
    return base;
  },[product,selectedOffer,selectedVariants]);
  const getPriceLivraison = useCallback(():number => { if(!selectedWilayaData) return 0; return formData.typeLivraison==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice; },[selectedWilayaData,formData.typeLivraison]);
  useEffect(() => { if(selectedWilayaData) setFormData(f=>({...f,priceLoss:selectedWilayaData.livraisonReturn})); },[selectedWilayaData]);

  const finalPrice = getFinalPrice();
  const getTotalPrice = () => finalPrice*formData.quantity+ +getPriceLivraison();

  const validate = () => {
    const e:Record<string,string>={};
    if(!formData.customerName.trim())  e.customerName='الاسم مطلوب';
    if(!formData.customerPhone.trim()) e.customerPhone='رقم الهاتف مطلوب';
    if(!formData.customerWelaya)       e.customerWelaya='الولاية مطلوبة';
    if(!formData.customerCommune)      e.customerCommune='البلدية مطلوبة';
    return e;
  };

  const getVariantDetailId = useCallback(() => {
    if(!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  // ← إضافة للسلة
  const addToCart = () => {
    setIsOrderNow(false); setIsAdded(true);
    const existing = localStorage.getItem(domain);
    const cart = existing ? JSON.parse(existing) : [];
    cart.push({
      ...formData, product, variantDetailId: getVariantDetailId(),
      productId: product.id, storeId: product.store.id, userId,
      selectedOffer, selectedVariants,
      platform: platform || 'store',
      finalPrice, totalPrice: getTotalPrice(), priceLivraison: getPriceLivraison(),
      addedAt: new Date().getTime(),
    });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // ← إرسال الطلب مباشرة
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); const errs=validate(); if(Object.keys(errs).length){setFormErrors(errs);return;} setFormErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, {
        ...formData, productId: product.id, storeId: product.store.id, userId,
        selectedOffer, variantDetailId: getVariantDetailId(),
        platform: platform || 'store', finalPrice, totalPrice: getTotalPrice(), priceLivraison: getPriceLivraison(),
      });
      if(typeof window!=='undefined'&&formData.customerId) localStorage.setItem('customerId',formData.customerId);
      router.push(`/lp/${domain}/successfully`);
    } catch(err){ console.error(err); } finally{ setSubmitting(false); }
  };

  const onFocus = (e:React.FocusEvent<any>) => { e.target.style.borderColor='var(--sky)'; e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)'; };
  const onBlur  = (e:React.FocusEvent<any>, err?:boolean) => { e.target.style.borderColor=err?'var(--coral)':'var(--border)'; e.target.style.boxShadow='none'; };

  const showForm = isOrderNow || !product.store?.cart;

  return (
    <div style={{ borderTop: '3px dashed var(--border)', paddingTop: '1.5rem' }}>
      <h3 className="flex items-center gap-2 mb-6 font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.25rem', color: 'var(--text)' }}>📦 Order</h3>

      {/* أزرار السلة + الطلب */}
      {product.store?.cart && (
        <div className="flex gap-3 mb-6">
          <button onClick={addToCart} disabled={isAdded}
            className={isAdded ? 'animate-cart' : ''}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', borderRadius: '1rem', cursor: isAdded ? 'default' : 'pointer',
              fontFamily: "'Nunito',sans-serif", fontSize: '14px', fontWeight: 800,
              transition: 'all 0.3s ease',
              border: isAdded ? '2px solid var(--mint-dk)' : '2px solid var(--sky)',
              backgroundColor: isAdded ? 'rgba(110,231,183,0.1)' : 'white',
              color: isAdded ? 'var(--mint-dk)' : 'var(--sky-dk)',
              boxShadow: isAdded ? '0 4px 16px rgba(110,231,183,0.3)' : 'none',
            }}>
            {isAdded ? <><CheckCircle2 size={17} className="animate-check" /><span className="animate-check">تمت الإضافة!</span></> : <><ShoppingCart size={17} /><span>أضف للسلة</span></>}
          </button>
          <button onClick={() => setIsOrderNow(true)}
            className="btn-bouncy"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', borderRadius: '1rem', border: 'none', cursor: 'pointer',
              fontFamily: "'Nunito',sans-serif", fontSize: '14px', fontWeight: 800,
              background: 'linear-gradient(135deg, var(--coral), var(--grape))',
              color: 'white', boxShadow: '0 4px 20px rgba(255,107,107,0.4)',
            }}>
            <Zap size={17} /> طلب الآن
          </button>
        </div>
      )}

      {/* نموذج الطلب */}
      {showForm && (
        <div style={{ animation: 'pop-in 0.3s ease-in-out' }}>
          {product.store?.cart && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--coral)' }}>📦 بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} className="btn-bouncy flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ border: '2px solid var(--border)', backgroundColor: 'white', color: 'var(--text-soft)' }}><X size={12} /> إلغاء</button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FieldWrapper error={formErrors.customerName} label="👤 الاسم">
                <div className="relative">
                  <User className="absolute right-3 top-3.5 w-3.5 h-3.5" style={{ color:'var(--text-soft)' }} />
                  <input type="text" value={formData.customerName} onChange={e=>setFormData({...formData,customerName:e.target.value})} placeholder="الاسم الكامل" style={{ ...inputSt(!!formErrors.customerName), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerName)} />
                </div>
              </FieldWrapper>
              <FieldWrapper error={formErrors.customerPhone} label="📞 الهاتف">
                <div className="relative">
                  <Phone className="absolute right-3 top-3.5 w-3.5 h-3.5" style={{ color:'var(--text-soft)' }} />
                  <input type="tel" value={formData.customerPhone} onChange={e=>setFormData({...formData,customerPhone:e.target.value})} placeholder="0X XX XX XX XX" style={{ ...inputSt(!!formErrors.customerPhone), paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={e=>onBlur(e,!!formErrors.customerPhone)} />
                </div>
              </FieldWrapper>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldWrapper error={formErrors.customerWelaya} label="📍 الولاية">
                <div className="relative">
                  <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-soft)' }} />
                  <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-soft)' }} />
                  <select value={formData.customerWelaya} onChange={e=>setFormData({...formData,customerWelaya:e.target.value,customerCommune:''})} style={{ ...inputSt(!!formErrors.customerWelaya), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer' }}>
                    <option value="">اختر الولاية</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FieldWrapper>
              <FieldWrapper error={formErrors.customerCommune} label="🏘️ البلدية">
                <div className="relative">
                  <MapPin className="absolute right-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-soft)' }} />
                  <ChevronDown className="absolute left-3 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color:'var(--text-soft)' }} />
                  <select value={formData.customerCommune} disabled={!formData.customerWelaya||loadingCommunes} onChange={e=>setFormData({...formData,customerCommune:e.target.value})} style={{ ...inputSt(!!formErrors.customerCommune), paddingRight:'2.5rem', appearance:'none' as any, cursor:'pointer', opacity:!formData.customerWelaya?0.5:1 }}>
                    <option value="">{loadingCommunes?'⏳...':'اختر البلدية'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FieldWrapper>
            </div>

            {/* التوصيل */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color:'var(--text-mid)' }}>🚚 طريقة التوصيل</p>
              <div className="grid grid-cols-2 gap-3">
                {(['home','office'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setFormData(p=>({...p,typeLivraison:type}))} className="btn-bouncy flex flex-col items-center gap-2 py-5 rounded-2xl transition-all"
                    style={{ border:`3px solid ${formData.typeLivraison===type?'var(--sky)':'var(--border)'}`, backgroundColor:formData.typeLivraison===type?'rgba(78,205,196,0.08)':'white' }}>
                    <span className="text-2xl">{type==='home'?'🏠':'🏢'}</span>
                    <p className="text-xs font-black uppercase" style={{ color:formData.typeLivraison===type?'var(--sky-dk)':'var(--text-soft)' }}>{type==='home'?'للبيت':'للمكتب'}</p>
                    {selectedWilayaData && <p className="text-xs font-bold" style={{ color:'var(--text-mid)' }}>{(type==='home'?selectedWilayaData.livraisonHome:selectedWilayaData.livraisonOfice).toLocaleString()} دج</p>}
                  </button>
                ))}
              </div>
            </div>

            {/* الكمية */}
            <FieldWrapper label="🔢 الكمية">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setFormData(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} className="w-10 h-10 rounded-xl flex items-center justify-center btn-bouncy" style={{ border:'2px solid var(--border)', color:'var(--coral)', backgroundColor:'white' }}><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-black text-2xl" style={{ fontFamily:"'Fredoka One',cursive", color:'var(--text)' }}>{formData.quantity}</span>
                <button type="button" onClick={() => setFormData(p=>({...p,quantity:p.quantity+1}))} className="w-10 h-10 rounded-xl flex items-center justify-center btn-bouncy" style={{ border:'2px solid var(--border)', color:'var(--coral)', backgroundColor:'white' }}><Plus className="w-4 h-4" /></button>
              </div>
            </FieldWrapper>

            {/* الملخص */}
            <div className="p-5 rounded-3xl relative overflow-hidden polka-dots" style={{ border:'2px solid var(--border)', backgroundColor:'white' }}>
              <p className="text-xs font-black uppercase tracking-wider mb-4" style={{ color:'var(--coral)' }}>🧾 ملخص الطلب</p>
              <div className="space-y-2.5">
                {[{l:'المنتج',v:product.name?.slice(0,25)},{l:'السعر',v:`${finalPrice.toLocaleString()} دج`},{l:'الكمية',v:`× ${formData.quantity}`},{l:'التوصيل',v:selectedWilayaData?`${getPriceLivraison().toLocaleString()} دج`:'---'}].map(row=>(
                  <div key={row.l} className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color:'var(--text-soft)' }}>{row.l}</span>
                    <span className="text-sm font-bold" style={{ color:'var(--text)' }}>{row.v}</span>
                  </div>
                ))}
                <div className="pt-3" style={{ borderTop:'2px dashed var(--border)' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-black uppercase" style={{ color:'var(--coral)' }}>💰 المجموع</span>
                    <span className="font-black" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'2rem', color:'var(--coral)' }}>{getTotalPrice().toLocaleString()}<span className="text-sm ml-1">دج</span></span>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-bouncy w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-black text-white transition-all"
              style={{ background:submitting?'var(--text-soft)':'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow:submitting?'none':'0 8px 28px rgba(255,107,107,0.4)', cursor:submitting?'not-allowed':'pointer' }}>
              {submitting ? <><Loader2 size={18} style={{ animation:'spin-slow 1s linear infinite' }} /> ⏳ جاري المعالجة...</> : <>🎉 تأكيد الطلب</>}
            </button>
            <p className="text-[10px] text-center font-bold flex items-center justify-center gap-1.5" style={{ color:'var(--text-soft)' }}>🔒 دفع آمن ومشفر</p>
          </form>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATIC PAGES  ← مُصلح: استقبال store وتمريره لـ Contact
// ─────────────────────────────────────────────────────────────
export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return <>{p==='privacy'&&<Privacy/>}{p==='terms'&&<Terms/>}{p==='cookies'&&<Cookies/>}{p==='contact'&&<Contact store={store}/>}</>;
}

function PageWrapper({ children, emoji, title, subtitle }: { children:React.ReactNode; emoji:string; title:string; subtitle:string }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor:'var(--bg)', fontFamily:"'Nunito',sans-serif" }}>
      <div className="relative overflow-hidden py-20 polka-dots" style={{ background:'linear-gradient(135deg, #fff9e6 0%, var(--bg) 100%)' }}>
        <Confetti/>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="text-6xl mb-5 block" style={{ animation:'bounce-loop 2s ease-in-out infinite' }}>{emoji}</div>
          <h1 className="font-black mb-3" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(2rem,5vw,4rem)', color:'var(--text)' }}>{title}</h1>
          <p className="text-sm font-semibold mx-auto" style={{ color:'var(--text-mid)', maxWidth:'400px' }}>{subtitle}</p>
        </div>
        <WavyDivider topColor="var(--bg)" bottomColor="white" />
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">{children}</div>
    </div>
  );
}

function InfoCard({ icon, title, desc, status }: { icon:React.ReactNode; title:string; desc:string; status?:string }) {
  const isActive = status==='دائماً نشطة'||status==='Always Active';
  return (
    <div className="group flex gap-5 p-6 mb-3 rounded-3xl transition-all duration-300 cursor-default"
      style={{ border:'2px solid var(--border)', backgroundColor:'white' }}
      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--sky)';el.style.transform='translateY(-4px) rotate(0.5deg)';el.style.boxShadow='0 12px 32px rgba(78,205,196,0.15)';}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border)';el.style.transform='none';el.style.boxShadow='none';}}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background:'linear-gradient(135deg,var(--sky),var(--mint-dk))', color:'white' }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="font-black" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.1rem', color:'var(--text)' }}>{title}</h3>
          {status && <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor:isActive?'rgba(110,231,183,0.15)':'rgba(255,217,61,0.2)', border:`2px solid ${isActive?'var(--mint-dk)':'var(--sun-dark)'}`, color:isActive?'var(--mint-dk)':'var(--sun-dark)' }}>{status}</span>}
        </div>
        <p className="text-sm font-semibold leading-relaxed" style={{ color:'var(--text-mid)' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper emoji="🔒" title="Privacy Policy" subtitle="We keep your info safe — promise!">
      <InfoCard icon={<Database size={18}/>} title="Data We Collect"   desc="We only collect what we need — your name, contact info, and order details." />
      <InfoCard icon={<Lock size={18}/>}     title="How We Protect It" desc="We use top-notch encryption to keep your data safe." />
      <InfoCard icon={<Globe size={18}/>}    title="Sharing Policy"    desc="We never sell your info. Only shared with delivery partners." />
      <InfoCard icon={<Bell size={18}/>}     title="Updates"           desc="We'll let you know if anything important changes." />
      <div className="mt-8 p-5 rounded-3xl flex items-center gap-3" style={{ backgroundColor:'rgba(110,231,183,0.1)', border:'2px solid rgba(110,231,183,0.4)' }}>
        <span className="text-2xl">✅</span>
        <p className="text-sm font-semibold" style={{ color:'var(--text-mid)' }}>Last updated: February 2026.</p>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper emoji="📋" title="Terms of Service" subtitle="Simple, fair rules for everyone!">
      <InfoCard icon={<CheckCircle2 size={18}/>} title="Your Account"       desc="Keep your login details safe! You're responsible for your account." />
      <InfoCard icon={<CreditCard size={18}/>}   title="Payments & Pricing" desc="No hidden fees. What you see is what you pay!" />
      <InfoCard icon={<Ban size={18}/>}           title="What's Not Allowed" desc="No dangerous items or copies. Keep it safe for kids!" />
      <InfoCard icon={<Scale size={18}/>}         title="Governing Rules"    desc="These terms follow the laws of Algeria." />
      <div className="mt-8 p-5 rounded-3xl flex items-start gap-3" style={{ backgroundColor:'rgba(255,217,61,0.1)', border:'2px solid rgba(255,217,61,0.4)' }}>
        <span className="text-2xl mt-0.5">⚠️</span>
        <p className="text-sm font-semibold" style={{ color:'var(--text-mid)' }}>We may update these terms occasionally.</p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper emoji="🍪" title="Cookie Policy" subtitle="Cookies help make our site better!">
      <InfoCard icon={<ShieldCheck size={18}/>}   title="Essential Cookies"  desc="Keep the store running — cart, login. Can't turn off." status="Always Active" />
      <InfoCard icon={<Settings size={18}/>}      title="Preference Cookies" desc="Remember your language and settings." status="Optional" />
      <InfoCard icon={<MousePointer2 size={18}/>} title="Analytics Cookies"  desc="Help us understand what kids and parents enjoy most." status="Optional" />
      <div className="mt-8 p-6 rounded-3xl flex gap-4 items-start" style={{ background:'linear-gradient(135deg,rgba(255,107,107,0.06),rgba(168,85,247,0.06))', border:'2px solid var(--border)' }}>
        <span className="text-2xl mt-0.5">⚙️</span>
        <div><h3 className="font-black mb-2" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.1rem', color:'var(--text)' }}>Control Your Cookies!</h3><p className="text-sm font-semibold leading-relaxed" style={{ color:'var(--text-mid)' }}>Change cookie settings in your browser anytime.</p></div>
      </div>
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTACT  ← مُصلح: بيانات ديناميكية + حقل الهاتف + استدعاء API
// ─────────────────────────────────────────────────────────────
export function Contact({ store }: { store: Store }) {
  const isRTL = store.language === 'ar';
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const contacts = [
    { emoji: '📞', label: isRTL ? 'الهاتف' : 'Phone',    value: store.contact?.phone || '—',    href: store.contact?.phone ? `tel:${store.contact.phone}` : undefined },
    { emoji: '📍', label: isRTL ? 'الموقع' : 'Location', value: store.contact?.wilaya || '—',   href: undefined },
    { emoji: '📧', label: isRTL ? 'البريد' : 'Email',    value: store.contact?.email || '—',    href: store.contact?.email ? `mailto:${store.contact.email}` : undefined },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...formState, storeId: store.id });
      setSent(true);
    } catch {
      alert(isRTL ? 'حدث خطأ في الإرسال، حاول بعد حين' : 'Error sending message, try again later');
    }
  };

  return (
    <div className="min-h-screen" dir={isRTL?'rtl':'ltr'} style={{ backgroundColor:'var(--bg)', fontFamily:"'Nunito',sans-serif" }}>
      <div className="relative overflow-hidden py-24 polka-dots" style={{ background:'linear-gradient(135deg, #fff9e6, var(--bg))' }}>
        <Confetti/>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="text-6xl mb-5" style={{ animation:'bounce-loop 2s ease-in-out infinite', display:'inline-block' }}>💌</div>
          <h1 className="font-black mb-4" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(2.5rem,6vw,5rem)', color:'var(--text)' }}>
            {isRTL ? 'تواصل معنا' : 'Say Hello!'}
          </h1>
          <p className="text-base font-semibold" style={{ color:'var(--text-mid)' }}>{isRTL ? 'نحب أن نسمع منك! 🌟' : 'We love hearing from you! 🌟'}</p>
        </div>
        <WavyDivider topColor="var(--bg)" bottomColor="white" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-black mb-8" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.8rem', color:'var(--text)' }}>
              📞 {isRTL ? 'تواصل معنا' : 'Get in Touch'}
            </h2>
            <div className="space-y-3">
              {contacts.map(item => (
                <a key={item.label} href={item.href||'#'} className="group flex items-center gap-4 p-5 rounded-3xl transition-all btn-bouncy"
                  style={{ border:'2px solid var(--border)', backgroundColor:'white', textDecoration:'none' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--coral)';el.style.backgroundColor='rgba(255,107,107,0.04)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border)';el.style.backgroundColor='white';}}>
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color:'var(--text-soft)' }}>{item.label}</p>
                    <p className="text-sm font-bold" style={{ color:'var(--text)' }}>{item.value}</p>
                  </div>
                  {item.href && <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:'var(--coral)' }} />}
                </a>
              ))}
            </div>
            <div className="mt-8 p-6 rounded-3xl text-white relative overflow-hidden" style={{ background:'linear-gradient(135deg, var(--coral), var(--grape))' }}>
              <div className="absolute -right-6 -bottom-6 text-8xl opacity-20">🎪</div>
              <p className="font-black text-xl leading-tight mb-2" style={{ fontFamily:"'Fredoka One',cursive" }}>{isRTL ? 'نرد بسرعة! ⚡' : 'We reply super fast! ⚡'}</p>
              <p className="text-sm font-semibold opacity-80">{isRTL ? 'عادة خلال ساعات قليلة' : 'Usually within a few hours.'}</p>
            </div>
          </div>

          <div>
            <h2 className="font-black mb-8" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.8rem', color:'var(--text)' }}>✉️ {isRTL ? 'أرسل رسالة' : 'Send a Message'}</h2>
            {sent ? (
              <div className="p-10 rounded-3xl text-center polka-dots" style={{ border:'3px dashed var(--border)', backgroundColor:'white' }}>
                <span className="text-6xl block mb-4" style={{ animation:'bounce-loop 1s ease-in-out infinite' }}>🎉</span>
                <p className="font-black text-xl mb-1" style={{ fontFamily:"'Fredoka One',cursive", color:'var(--text)' }}>{isRTL ? 'تم إرسال رسالتك!' : 'Message Sent!'}</p>
                <p className="text-sm font-semibold" style={{ color:'var(--text-mid)' }}>{isRTL ? 'سنرد عليك قريباً! 🌟' : "We'll get back to you soon! 🌟"}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <FieldWrapper label={isRTL?'👤 اسمك':'👤 Your Name'}>
                  <input type="text" value={formState.name} onChange={e=>setFormState({...formState,name:e.target.value})} placeholder={isRTL?'الاسم الكامل':'Your name'} style={inputSt()} required
                    onFocus={e=>{e.target.style.borderColor='var(--sky)';e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)';}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}} />
                </FieldWrapper>
                <FieldWrapper label={isRTL?'📧 البريد الإلكتروني':'📧 Email'}>
                  <input type="email" value={formState.email} onChange={e=>setFormState({...formState,email:e.target.value})} placeholder="your@email.com" style={inputSt()} required
                    onFocus={e=>{e.target.style.borderColor='var(--sky)';e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)';}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}} />
                </FieldWrapper>
                {/* ← حقل الهاتف كان مفقوداً */}
                <FieldWrapper label={isRTL?'📞 رقم الهاتف':'📞 Phone'}>
                  <input type="tel" value={formState.phone} onChange={e=>setFormState({...formState,phone:e.target.value})} placeholder={isRTL?'05XXXXXXXX':'05XXXXXXXX'} style={inputSt()} required
                    onFocus={e=>{e.target.style.borderColor='var(--sky)';e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)';}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}} />
                </FieldWrapper>
                <FieldWrapper label={isRTL?'💬 رسالتك':'💬 Your Message'}>
                  <textarea value={formState.message} onChange={e=>setFormState({...formState,message:e.target.value})} placeholder={isRTL?'كيف يمكننا مساعدتك؟ 😊':"What's on your mind? 😊"} rows={5} style={{ ...inputSt(), resize:'none' as any }} required
                    onFocus={e=>{e.target.style.borderColor='var(--sky)';e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)';}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}} />
                </FieldWrapper>
                <button type="submit" className="btn-bouncy w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-black text-white"
                  style={{ background:'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow:'0 8px 28px rgba(255,107,107,0.4)' }}>
                  🚀 {isRTL ? 'إرسال الرسالة' : 'Send Message!'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CART PAGE  ← كان مفقوداً بالكامل
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
  const isRTL = store?.language === 'ar';
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
    if (!fd.customerName.trim()) e.name = isRTL ? 'الاسم مطلوب' : 'Name required';
    if (!fd.customerPhone.trim()) e.phone = isRTL ? 'الهاتف مطلوب' : 'Phone required';
    if (!fd.customerWelaya) e.welaya = isRTL ? 'الولاية مطلوبة' : 'Wilaya required';
    if (!fd.customerCommune) e.commune = isRTL ? 'البلدية مطلوبة' : 'Commune required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!validate()) return; setSubmitting(true);
    try {
      const payload = cartItems.map(item => ({
        ...fd, productId: item.productId, storeId: item.storeId, userId: item.userId,
        selectedOffer: item.selectedOffer, variantDetailId: item.variantDetailId,
        selectedVariants: item.selectedVariants, platform: item.platform || 'store',
        finalPrice: item.finalPrice, totalPrice: finalTotal, priceLivraison: +getLivPrice(),
        quantity: item.quantity, customerId: item.customerId || '', priceLoss: selW?.livraisonReturn ?? 0,
      }));
      await axios.post(`${API_URL}/orders/create`, payload);
      setSuccess(true); localStorage.removeItem(domain); setCartItems([]); initCount(0);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  /* ── Success ── */
  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-10" style={{ background: 'var(--bg)' }}>
        <div className="pop-in text-center p-16 rounded-3xl max-w-lg w-full" style={{ border: '3px solid var(--mint-dk)', backgroundColor: 'white', boxShadow: '0 12px 40px rgba(110,231,183,0.2)' }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(110,231,183,0.15)', border: '2px solid var(--mint-dk)' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--mint-dk)' }} />
          </div>
          <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--coral)' }}>// ORDER CONFIRMED</p>
          <h2 className="font-black mb-3" style={{ fontFamily: "'Fredoka One',cursive", fontSize: '1.8rem', color: 'var(--text)' }}>{isRTL ? 'تم استلام طلبك!' : 'Order Received!'}</h2>
          <p className="text-sm font-semibold mb-8" style={{ color: 'var(--text-mid)' }}>{isRTL ? 'شكراً لثقتك 🎮' : 'Thank you! 🎮'}</p>
          <Link href="/" className="btn-bouncy inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-black text-white" style={{ background: 'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow: '0 8px 28px rgba(255,107,107,0.4)', textDecoration: 'none' }}>
            🛍️ {isRTL ? 'العودة للمتجر' : 'Back to Store'}
          </Link>
        </div>
      </div>
    );
  }

  /* ── Empty ── */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-10" style={{ background: 'var(--bg)' }}>
        <div className="pop-in text-center p-16 rounded-3xl max-w-md w-full" style={{ border: '3px dashed var(--border)', backgroundColor: 'white' }}>
          <ShoppingBag size={56} style={{ color: 'var(--text-soft)', margin: '0 auto 20px', display: 'block', opacity: 0.4 }} />
          <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--coral)' }}>// EMPTY CART</p>
          <h3 className="font-black mb-4" style={{ fontFamily: "'Fredoka One',cursive", fontSize: '1.2rem', color: 'var(--text)' }}>{isRTL ? 'السلة فارغة' : 'Cart is empty'}</h3>
          <p className="text-sm font-semibold mb-6" style={{ color: 'var(--text-mid)' }}>{isRTL ? 'أضف منتجات للبدء' : 'Add some products to start'}</p>
          <Link href="/" className="btn-bouncy inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-black text-white" style={{ background: 'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow: '0 8px 28px rgba(255,107,107,0.4)', textDecoration: 'none' }}>
            🛍️ {isRTL ? 'تسوق الآن' : 'Shop Now'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL?'rtl':'ltr'} className="min-h-screen p-8 pb-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="pop-in mb-10">
          <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--coral)' }}>// SHOPPING CART</p>
          <h1 className="font-black" style={{ fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(2rem,5vw,3rem)', color: 'var(--text)' }}>
            🛒 {isRTL ? 'سلة التسوق' : 'Your Cart'}
          </h1>
          <div className="h-1.5 w-24 rounded-full mt-3" style={{ background: 'linear-gradient(90deg, var(--coral), var(--grape))' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pop-in pop-in-d1">
          {/* Items */}
          <div>
            <div className="rounded-3xl overflow-hidden" style={{ border: '2px solid var(--border)', backgroundColor: 'white' }}>
              <div className="p-4 flex items-center gap-2" style={{ borderBottom: '2px dashed var(--border)', background: 'rgba(255,107,107,0.04)' }}>
                <Package size={18} style={{ color: 'var(--coral)' }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--coral)' }}>{isRTL ? 'منتجاتك' : 'Your Items'} ({cartItems.length})</span>
              </div>

              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 p-5 transition-all" style={{ borderBottom: '2px dashed var(--border)' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,107,107,0.03)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent'}}>
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0" style={{ border: '2px solid var(--border)', background: 'var(--bg)' }}>
                    <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage || '/fallback-image.png'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text)', fontFamily: "'Fredoka One', cursive" }}>{item.product?.name}</h4>
                    <span className="font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem', color: 'var(--coral)' }}>
                      {item.finalPrice?.toLocaleString()} <span className="text-xs font-medium" style={{ color: 'var(--text-soft)' }}>دج</span>
                    </span>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '2px solid var(--border)' }}>
                        <button onClick={() => changeQty(index, -1)} className="w-8 h-8 flex items-center justify-center" style={{ borderLeft: '2px solid var(--border)', background: 'white', color: 'var(--coral)', cursor: 'pointer' }}><Minus size={12} /></button>
                        <span className="w-10 text-center font-black text-sm" style={{ background: 'var(--bg)' }}>{item.quantity}</span>
                        <button onClick={() => changeQty(index, 1)} className="w-8 h-8 flex items-center justify-center" style={{ borderRight: '2px solid var(--border)', background: 'white', color: 'var(--coral)', cursor: 'pointer' }}><Plus size={12} /></button>
                      </div>
                      <button onClick={() => removeItem(index)} className="btn-bouncy flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold ml-auto"
                        style={{ border: '2px solid rgba(255,107,107,0.3)', backgroundColor: 'transparent', color: 'var(--coral)', cursor: 'pointer' }}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,107,107,0.08)'}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent'}}>
                        <Trash2 size={12} /> {isRTL ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 flex justify-between items-center" style={{ background: 'rgba(255,107,107,0.04)', borderTop: '2px dashed var(--border)' }}>
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-soft)' }}>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-black" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.4rem', color: 'var(--coral)' }}>{cartTotal.toLocaleString()} <span className="text-xs font-medium" style={{ color: 'var(--text-soft)' }}>دج</span></span>
              </div>
            </div>
          </div>

          {/* Delivery + Summary */}
          <div>
            <div className="rounded-3xl overflow-hidden" style={{ border: '2px solid var(--border)', backgroundColor: 'white' }}>
              <div className="p-4 flex items-center gap-2" style={{ borderBottom: '2px dashed var(--border)', background: 'rgba(78,205,196,0.04)' }}>
                <Truck size={18} style={{ color: 'var(--sky)' }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--sky)' }}>{isRTL ? 'معلومات التوصيل' : 'Delivery Info'}</span>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper error={errors.name} label={isRTL?'👤 الاسم':'👤 Name'}>
                    <input type="text" value={fd.customerName} onChange={e=>{setFd({...fd,customerName:e.target.value});if(errors.name)setErrors({...errors,name:''})}} placeholder={isRTL?'الاسم الكامل':'Full name'} style={inputSt(!!errors.name)}
                      onFocus={e=>{e.target.style.borderColor='var(--sky)';e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)';}}
                      onBlur={e=>{e.target.style.borderColor=errors.name?'var(--coral)':'var(--border)';e.target.style.boxShadow='none';}} />
                  </FieldWrapper>
                  <FieldWrapper error={errors.phone} label={isRTL?'📞 الهاتف':'📞 Phone'}>
                    <input type="tel" value={fd.customerPhone} onChange={e=>{setFd({...fd,customerPhone:e.target.value});if(errors.phone)setErrors({...errors,phone:''})}} placeholder="0XXXXXXXXX" style={inputSt(!!errors.phone)}
                      onFocus={e=>{e.target.style.borderColor='var(--sky)';e.target.style.boxShadow='0 0 0 4px rgba(78,205,196,0.15)';}}
                      onBlur={e=>{e.target.style.borderColor=errors.phone?'var(--coral)':'var(--border)';e.target.style.boxShadow='none';}} />
                  </FieldWrapper>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper error={errors.welaya} label={isRTL?'📍 الولاية':'📍 Wilaya'}>
                    <div className="relative">
                      <ChevronDown size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-soft)', pointerEvents:'none' }} />
                      <select value={fd.customerWelaya} onChange={e=>{setFd({...fd,customerWelaya:e.target.value,customerCommune:''});if(errors.welaya)setErrors({...errors,welaya:''})}} style={{ ...inputSt(!!errors.welaya), paddingLeft:'2.5rem', appearance:'none' as any, cursor:'pointer' }}>
                        <option value="">{isRTL?'الولاية':'Wilaya'}</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                      </select>
                    </div>
                  </FieldWrapper>
                  <FieldWrapper error={errors.commune} label={isRTL?'🏘️ البلدية':'🏘️ Commune'}>
                    <div className="relative">
                      <ChevronDown size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-soft)', pointerEvents:'none' }} />
                      <select value={fd.customerCommune} disabled={loadingC||!fd.customerWelaya} onChange={e=>{setFd({...fd,customerCommune:e.target.value});if(errors.commune)setErrors({...errors,commune:''})}} style={{ ...inputSt(!!errors.commune), paddingLeft:'2.5rem', appearance:'none' as any, cursor:'pointer', opacity:!fd.customerWelaya?0.5:1 }}>
                        <option value="">{loadingC?'⏳...':!fd.customerWelaya?(isRTL?'الولاية أولاً':'Wilaya first'):(isRTL?'البلدية':'Commune')}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                      </select>
                    </div>
                  </FieldWrapper>
                </div>

                {/* Delivery type */}
                <div>
                  <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color:'var(--text-mid)' }}>🚚 {isRTL?'نوع التوصيل':'Delivery Type'}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['home','office'] as const).map(type => (
                      <button key={type} type="button" onClick={() => setFd({...fd,typeLivraison:type})} className="btn-bouncy flex flex-col items-center gap-1 py-4 rounded-2xl"
                        style={{ border:`3px solid ${fd.typeLivraison===type?'var(--sky)':'var(--border)'}`, backgroundColor:fd.typeLivraison===type?'rgba(78,205,196,0.08)':'white' }}>
                        <span className="text-xl">{type==='home'?'🏠':'🏢'}</span>
                        <span className="text-xs font-black" style={{ color:fd.typeLivraison===type?'var(--sky-dk)':'var(--text-soft)' }}>{type==='home'?(isRTL?'للبيت':'Home'):(isRTL?'للمكتب':'Office')}</span>
                        {selW && <span className="text-xs font-bold" style={{ color:'var(--text-mid)' }}>{(type==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} دج</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="p-5 rounded-3xl polka-dots" style={{ border:'2px solid var(--border)', backgroundColor:'white' }}>
                  <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color:'var(--coral)' }}>🧾 {isRTL?'الملخص':'Summary'}</p>
                  {[{l:isRTL?'المجموع الفرعي':'Subtotal',v:`${cartTotal.toLocaleString()} دج`},{l:isRTL?'التوصيل':'Shipping',v:getLivPrice()?`${getLivPrice().toLocaleString()} دج`:'---'}].map(row=>(
                    <div key={row.l} className="flex justify-between py-2" style={{ borderBottom:'1px dashed var(--border)' }}>
                      <span className="text-xs font-bold" style={{ color:'var(--text-soft)' }}>{row.l}</span>
                      <span className="text-sm font-bold" style={{ color:'var(--text)' }}>{row.v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-baseline pt-3">
                    <span className="text-sm font-black" style={{ color:'var(--coral)' }}>💰 {isRTL?'الإجمالي':'Total'}</span>
                    <span className="font-black" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'2.2rem', color:'var(--coral)' }}>{finalTotal.toLocaleString()} <span className="text-sm font-medium" style={{ color:'var(--text-soft)' }}>دج</span></span>
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn-bouncy w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-black text-white"
                  style={{ background:submitting?'var(--text-soft)':'linear-gradient(135deg, var(--coral), var(--grape))', boxShadow:submitting?'none':'0 8px 28px rgba(255,107,107,0.4)', cursor:submitting?'not-allowed':'pointer' }}>
                  {submitting ? <><Loader2 size={18} style={{ animation:'spin-slow 1s linear infinite' }} /> ⏳...</> : <>🎉 {isRTL?'تأكيد الطلب':'Confirm Order'}</>}
                </button>

                <div className="flex justify-center gap-4 flex-wrap">
                  {[{icon:<Lock size={11}/>,l:isRTL?'دفع آمن':'Secure'},{icon:<ShieldCheck size={11}/>,l:isRTL?'مشفر':'Encrypted'},{icon:<BadgeCheck size={11}/>,l:isRTL?'موثق':'Verified'}].map((b,i)=>(
                    <div key={i} className="flex items-center gap-1 text-[11px] font-bold" style={{ color:'var(--text-soft)' }}>
                      <span style={{ color:'var(--sky)' }}>{b.icon}</span> {b.l}
                    </div>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}