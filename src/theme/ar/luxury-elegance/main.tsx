'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Phone,
  CheckCircle2, Truck, ArrowRight,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, Sparkles, MapPin,
} from 'lucide-react';
import { Store } from '@/types/store';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ─── GLOBAL STYLES & RESPONSIVE LAYOUT (Pure CSS — NO Tailwind responsive prefixes) ─── */
const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Tajawal', sans-serif;
    background-color: #F6F3EE;
    color: #1C1612;
    -webkit-font-smoothing: antialiased;
  }

  .font-display { font-family: 'Cormorant Garamond', serif; }
  .font-body    { font-family: 'Tajawal', sans-serif; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #F6F3EE; }
  ::-webkit-scrollbar-thumb { background: #B8860B; border-radius: 99px; }

  /* ── Animations ── */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer  { from { background-position: -200% 0; } to { background-position: 200% 0; } }
  @keyframes cartPop  { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
  @keyframes checkIn  { from { transform:scale(0) rotate(-15deg); } to { transform:scale(1) rotate(0deg); } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.5; } }

  .anim-fade-up        { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-fade-up-1      { animation-delay: 0.10s; }
  .anim-fade-up-2      { animation-delay: 0.20s; }
  .anim-fade-up-3      { animation-delay: 0.32s; }
  .anim-cart-pop       { animation: cartPop 0.4s ease; }
  .anim-check-in       { animation: checkIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275) both; }
  .anim-pulse          { animation: pulse 2s infinite; }

  /* ── Navbar ── */
  .nav-desktop-links { display: none; align-items: center; gap: 2rem; }
  .nav-desktop-search { display: none; flex: 1; max-width: 26rem; margin: 0 2.5rem; position: relative; }
  .nav-mobile-controls { display: flex; gap: 0.75rem; }

  @media (min-width: 1024px) {
    .nav-desktop-links   { display: flex; }
    .nav-desktop-search  { display: block; }
    .nav-mobile-controls { display: none; }
  }

  /* ── Trust bar ── */
  .trust-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    .trust-grid { grid-template-columns: repeat(4, 1fr); }
  }

  /* ── Categories ── */
  .cats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  @media (min-width: 768px) {
    .cats-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1024px) {
    .cats-grid { grid-template-columns: repeat(5, 1fr); }
  }

  /* ── Products grid ── */
  .products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  @media (min-width: 540px) {
    .products-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1024px) {
    .products-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
  }
  @media (min-width: 1280px) {
    .products-grid { grid-template-columns: repeat(4, 1fr); }
  }

  /* ── Hero actions ── */
  .hero-actions {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    align-items: flex-start;
  }
  @media (min-width: 540px) {
    .hero-actions { flex-direction: row; align-items: center; }
  }

  /* ── Details layout ── */
  .details-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media (min-width: 768px) {
    .details-inner { grid-template-columns: 1fr 1fr; gap: 2.5rem; }
  }

  /* ── Form rows ── */
  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 540px) {
    .form-row-2 { grid-template-columns: 1fr 1fr; }
  }

  /* ── Cart add buttons ── */
  .cart-add-btns {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  @media (min-width: 540px) {
    .cart-add-btns { flex-direction: row; }
  }

  /* ── Cart layout ── */
  .cart-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) {
    .cart-inner { grid-template-columns: 1fr 1fr; gap: 3rem; }
  }

  /* ── Footer ── */
  .footer-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  @media (min-width: 768px) {
    .footer-inner { grid-template-columns: 1.8fr 1fr 1fr; }
  }

  /* ── Contact layout ── */
  .contact-inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) {
    .contact-inner { grid-template-columns: 1fr 2fr; }
  }

  /* ── Pagination ── */
  .pagination { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 3rem; }

  /* ── Image thumbnails scroll ── */
  .thumb-row { display: flex; gap: 0.75rem; margin-top: 1rem; overflow-x: auto; padding-bottom: 0.25rem; }

  /* ── Delivery options ── */
  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

  /* ── Gold gradient text ── */
  .gold-text {
    background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #B8860B 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Grain texture overlay ── */
  .grain-overlay::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    border-radius: inherit;
    z-index: 1;
  }

  /* ── Link reset ── */
  a { text-decoration: none; color: inherit; }
`;

/* ─── DIVIDER ─── */
function GoldDivider() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'1rem', margin:'1.5rem 0' }}>
      <div style={{ flex:1, height:'1px', background:'#E6E1D8' }} />
      <Sparkles size={13} style={{ color:'#B8860B' }} />
      <div style={{ flex:1, height:'1px', background:'#E6E1D8' }} />
    </div>
  );
}

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

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; }
};
const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; }
};

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight:'100vh', background:'#F6F3EE' }}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]       = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch]   = useState<any[]>([]);
  const [loading, setLoading]         = useState(false);
  const router = useRouter();

  const itemsCartCount = useCartStore((s) => s.count);
  const initCount      = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try {
        const stored = localStorage.getItem(domain);
        const items  = JSON.parse(stored || '[]');
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
      } catch { /* ignore */ } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setListSearch([]); setShowSearch(false);
    }
  };

  const DropResults = () => (
    <div style={{
      position:'absolute', top:'calc(100% + 8px)', right:0, left:0,
      background:'#fff', border:'1px solid #E6E1D8', borderRadius:'14px',
      boxShadow:'0 16px 48px rgba(0,0,0,0.1)', zIndex:60, overflow:'hidden'
    }}>
      {loading ? (
        <div style={{ padding:'1rem', textAlign:'center', color:'#B8860B', fontSize:'0.85rem' }}>جاري البحث...</div>
      ) : listSearch.length > 0 ? (
        listSearch.map((p: any) => (
          <Link href={`/product/${p.id}`} key={p.id} onClick={() => setSearchQuery('')}
            style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', borderBottom:'1px solid #F0EDE8' }}>
            <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width:40, height:40, borderRadius:8, objectFit:'cover' }} alt="" />
            <div>
              <div style={{ fontSize:'0.875rem', fontWeight:500, color:'#1C1612' }}>{p.name}</div>
              <div style={{ fontSize:'0.75rem', color:'#B8860B', fontWeight:700 }}>{p.price} دج</div>
            </div>
          </Link>
        ))
      ) : searchQuery.length >= 2 && (
        <div style={{ padding:'1rem', textAlign:'center', color:'#999', fontSize:'0.85rem' }}>لا توجد نتائج</div>
      )}
    </div>
  );

  const navBg = scrolled
    ? 'rgba(246,243,238,0.97)'
    : '#F6F3EE';
  const navBorder = scrolled ? '#E6E1D8' : 'transparent';

  return (
    <nav dir="rtl" style={{
      position:'sticky', top:0, zIndex:50,
      backdropFilter:'blur(20px)',
      background:navBg,
      borderBottom:`1px solid ${navBorder}`,
      transition:'all 0.3s ease'
    }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 1.5rem', height:68, display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ flexShrink:0 }}>
          {store?.design?.logoUrl
            ? <img src={store.design.logoUrl} style={{ height:34 }} alt="" />
            : <span className="font-display" style={{ fontSize:'1.5rem', fontWeight:700, color:'#1C1612', letterSpacing:'-0.02em' }}>{store?.name}</span>
          }
        </Link>

        {/* Desktop search */}
        <div className="nav-desktop-search">
          <form onSubmit={handleSearchSubmit} style={{ position:'relative' }}>
            <input
              type="text" placeholder="ابحث عن منتج..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width:'100%', padding:'0.6rem 1rem 0.6rem 2.75rem',
                borderRadius:99, border:'1.5px solid #E6E1D8',
                background:'#fff', fontSize:'0.875rem', outline:'none',
                transition:'border-color 0.2s'
              }}
            />
            <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#aaa' }} />
          </form>
          {searchQuery.length >= 2 && <DropResults />}
        </div>

        {/* Desktop links */}
        <div className="nav-desktop-links">
          {[{ h:'/', l:'الرئيسية' }, { h:'/contact', l:'تواصل' }].map(i => (
            <Link key={i.h} href={i.h}
              style={{ fontSize:'0.875rem', fontWeight:500, color:'#555', transition:'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color='#B8860B')}
              onMouseLeave={e => (e.currentTarget.style.color='#555')}
            >{i.l}</Link>
          ))}
          <Link href="/cart" style={{
            position:'relative', width:42, height:42, borderRadius:'50%',
            border:'1.5px solid #E6E1D8', display:'flex', alignItems:'center',
            justifyContent:'center', background:'#fff', color:'#1C1612',
            transition:'border-color 0.2s'
          }}>
            <ShoppingCart size={17} />
            {itemsCartCount > 0 && (
              <span style={{
                position:'absolute', top:-4, right:-4,
                background:'#B8860B', color:'#fff', fontSize:10, fontWeight:700,
                width:18, height:18, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                border:'2px solid #F6F3EE'
              }}>{itemsCartCount}</span>
            )}
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="nav-mobile-controls">
          <button onClick={() => setShowSearch(!showSearch)} style={{ width:42, height:42, borderRadius:'50%', border:'1.5px solid #E6E1D8', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Search size={17} />
          </button>
          <button onClick={() => setOpen(!open)} style={{ width:42, height:42, borderRadius:'50%', border:'1.5px solid #E6E1D8', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {showSearch && (
        <div style={{ padding:'0.75rem 1.5rem', background:'#fff', borderTop:'1px solid #E6E1D8', position:'relative' }}>
          <form onSubmit={handleSearchSubmit} style={{ position:'relative' }}>
            <input autoFocus type="text" placeholder="ابحث هنا..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width:'100%', padding:'0.75rem 1rem 0.75rem 2.75rem', borderRadius:12, border:'1.5px solid #B8860B', background:'#F6F3EE', fontSize:'0.9rem', outline:'none' }} />
            <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#B8860B' }} />
          </form>
          {searchQuery.length >= 2 && <DropResults />}
        </div>
      )}

      {/* Mobile dropdown */}
      <div style={{
        overflow:'hidden', maxHeight: open ? 220 : 0,
        transition:'max-height 0.3s ease', background:'#fff',
        borderTop: open ? '1px solid #E6E1D8' : 'none'
      }}>
        <div style={{ padding:'0.5rem 1.5rem 1rem' }}>
          {[{ h:'/', l:'الرئيسية' }, { h:'/contact', l:'تواصل معنا' }, { h:'/cart', l:'السلة' }].map(i => (
            <Link key={i.h} href={i.h} onClick={() => setOpen(false)}
              style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.875rem 0', borderBottom:'1px solid #F0EDE8', fontSize:'0.9rem', color:'#1C1612' }}>
              {i.l} <ArrowRight size={14} style={{ color:'#B8860B' }} />
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER — 3 أقسام فقط
═══════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  return (
    <footer dir="rtl" style={{ background:'#111009', color:'#ccc', marginTop:80, padding:'4rem 1.5rem 2rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div className="footer-inner">

          {/* قسم 1 — العلامة */}
          <div>
            <h3 className="font-display" style={{ fontSize:'1.75rem', color:'#D4AF37', marginBottom:'0.875rem' }}>{store?.name}</h3>
            <p style={{ fontSize:'0.875rem', lineHeight:1.8, color:'#888', maxWidth:340 }}>
              {store?.hero?.subtitle?.substring(0, 100) || 'تجربة تسوق راقية مصممة لك. جودة لا تُقارن، توصيل لجميع الولايات.'}
            </p>
            <p style={{ marginTop:'2rem', fontSize:'0.75rem', color:'#444' }}>
              © {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.
            </p>
          </div>

          {/* قسم 2 — الروابط */}
          <div>
            <h4 style={{ fontSize:'0.75rem', fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'1.25rem' }}>روابط سريعة</h4>
            {[{ h:'/', l:'الرئيسية' }, { h:'/cart', l:'سلة التسوق' }, { h:'/contact', l:'تواصل معنا' }, { h:'/Privacy', l:'سياسة الخصوصية' }, { h:'/Terms', l:'الشروط والأحكام' }].map((lnk, i) => (
              <Link key={i} href={lnk.h}
                style={{ display:'block', fontSize:'0.875rem', color:'#888', marginBottom:'0.75rem', transition:'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color='#D4AF37')}
                onMouseLeave={e => (e.currentTarget.style.color='#888')}
              >{lnk.l}</Link>
            ))}
          </div>

          {/* قسم 3 — التواصل */}
          <div>
            <h4 style={{ fontSize:'0.75rem', fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'1.25rem' }}>تواصل معنا</h4>
            {[
              { icon:<Phone size={14}/>, val: store?.contact?.phone },
              { icon:<MapPin size={14}/>, val: store?.contact?.wilaya },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.875rem', color:'#888', fontSize:'0.875rem' }}>
                <span style={{ color:'#D4AF37' }}>{r.icon}</span>{r.val}
              </div>
            ))}
            <div style={{ marginTop:'1.5rem', display:'flex', alignItems:'center', gap:'0.625rem' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#B8860B', boxShadow:'0 0 8px #B8860B', display:'inline-block' }} className="anim-pulse" />
              <span style={{ fontSize:'0.8rem', color:'#666' }}>متاحون للرد الآن</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD
═══════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig  = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;

  return (
    <div style={{
      background:'#fff', border:'1px solid #EAE6E0', borderRadius:16,
      overflow:'hidden', display:'flex', flexDirection:'column', height:'100%',
      transition:'all 0.35s cubic-bezier(0.22,1,0.36,1)',
      boxShadow:'0 2px 12px rgba(0,0,0,0.04)'
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform='translateY(-6px)';
      el.style.boxShadow='0 16px 48px rgba(0,0,0,0.09)';
      el.style.borderColor='#C4A052';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform='';
      el.style.boxShadow='0 2px 12px rgba(0,0,0,0.04)';
      el.style.borderColor='#EAE6E0';
    }}>

      {/* Image */}
      <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', background:'#F9F7F4' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.6s ease' }}
              onMouseEnter={e => (e.currentTarget.style.transform='scale(1.06)')}
              onMouseLeave={e => (e.currentTarget.style.transform='')} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><ShoppingBag size={40} color="#ddd" /></div>
        }
        {discount > 0 && (
          <div style={{ position:'absolute', top:12, right:12, background:'#1C1612', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99 }}>
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'1.125rem', display:'flex', flexDirection:'column', flex:1 }}>
        <h3 className="font-display" style={{ fontSize:'1rem', fontWeight:600, color:'#1C1612', marginBottom:'0.5rem', lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display:'flex', gap:2, marginBottom:'0.875rem' }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={12} style={{ fill: i < 4 ? '#B8860B' : 'none', color:'#B8860B' }} />)}
        </div>
        <div style={{ marginTop:'auto' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:'0.375rem', marginBottom:'0.875rem' }}>
            <span className="font-display" style={{ fontSize:'1.5rem', fontWeight:700, color:'#1C1612' }}>{price.toLocaleString()}</span>
            <span style={{ fontSize:'0.75rem', color:'#999' }}>{store.currency || 'دج'}</span>
            {orig > price && <span style={{ fontSize:'0.75rem', color:'#bbb', textDecoration:'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
          <Link href={`/product/${product.slug || product.id}`} style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:'0.375rem',
            width:'100%', padding:'0.7rem 0', border:'1.5px solid #E6E1D8', borderRadius:99,
            fontSize:'0.85rem', fontWeight:600, color:'#1C1612',
            transition:'all 0.25s'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor='#B8860B';
            (e.currentTarget as HTMLAnchorElement).style.background='#B8860B';
            (e.currentTarget as HTMLAnchorElement).style.color='#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor='#E6E1D8';
            (e.currentTarget as HTMLAnchorElement).style.background='';
            (e.currentTarget as HTMLAnchorElement).style.color='#1C1612';
          }}>
            {viewDetails} <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[]     = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir="rtl">

      {/* ── HERO ── */}
      <section style={{ position:'relative', minHeight:'88vh', display:'flex', alignItems:'center', overflow:'hidden' }}>
        {store.hero?.imageUrl && (
          <div style={{ position:'absolute', inset:0 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(115deg, rgba(28,22,18,0.75) 0%, rgba(28,22,18,0.35) 100%)' }} />
          </div>
        )}
        <div style={{ position:'relative', zIndex:1, maxWidth:1280, margin:'0 auto', padding:'6rem 1.5rem 4rem', width:'100%' }}>
          <p className="anim-fade-up" style={{ fontSize:'0.8rem', fontWeight:700, color:'#D4AF37', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'1rem' }}>
            {store.name}
          </p>
          <h1 className="font-display anim-fade-up anim-fade-up-1"
            style={{ fontSize:'clamp(2.5rem,7vw,5rem)', fontWeight:700, lineHeight:1.08, color:'#fff', marginBottom:'1.5rem' }}
            dangerouslySetInnerHTML={{ __html: store.hero?.title || 'تسوق بأناقة<br/>واستمتع بالتميز' }}
          />
          <p className="anim-fade-up anim-fade-up-2"
            style={{ fontSize:'1.1rem', color:'rgba(255,255,255,0.82)', lineHeight:1.7, marginBottom:'2.5rem', maxWidth:520 }}>
            {store.hero?.subtitle || 'اكتشف مجموعتنا المميزة من المنتجات الراقية.'}
          </p>
          <div className="hero-actions anim-fade-up anim-fade-up-3">
            <a href="#products" style={{
              display:'inline-flex', alignItems:'center', gap:'0.5rem',
              background:'#fff', color:'#1C1612', fontWeight:700, fontSize:'0.9rem',
              padding:'0.875rem 2rem', borderRadius:99,
              transition:'all 0.25s', boxShadow:'0 4px 20px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={e => { const el=e.currentTarget as HTMLAnchorElement; el.style.background='#D4AF37'; el.style.color='#fff'; }}
            onMouseLeave={e => { const el=e.currentTarget as HTMLAnchorElement; el.style.background='#fff'; el.style.color='#1C1612'; }}>
              تسوق الآن
            </a>
            <Link href="/cart" style={{
              display:'inline-flex', alignItems:'center', gap:'0.5rem',
              background:'transparent', color:'#fff', fontWeight:500, fontSize:'0.9rem',
              padding:'0.875rem 2rem', borderRadius:99,
              border:'1.5px solid rgba(255,255,255,0.35)',
              transition:'all 0.25s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
              السلة
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background:'#fff', borderTop:'1px solid #EAE6E0', borderBottom:'1px solid #EAE6E0' }}>
        <div className="trust-grid" style={{ maxWidth:1280, margin:'0 auto' }}>
          {[
            { icon:<Truck size={18}/>, t:'توصيل لجميع الولايات', d:'58 ولاية جزائرية' },
            { icon:<Star size={18}/>, t:'منتجات أصلية', d:'جودة مضمونة 100%' },
            { icon:<CheckCircle2 size={18}/>, t:'دفع آمن', d:'حماية كاملة لبياناتك' },
            { icon:<Phone size={18}/>, t:'دعم متواصل', d:'نحن هنا لمساعدتك' },
          ].map((item, idx) => (
            <div key={idx} style={{
              padding:'1.25rem 1rem', textAlign:'center',
              borderLeft: idx < 3 ? '1px solid #EAE6E0' : 'none'
            }}>
              <div style={{ color:'#B8860B', marginBottom:'0.375rem', display:'flex', justifyContent:'center' }}>{item.icon}</div>
              <p style={{ fontSize:'0.8rem', fontWeight:700, color:'#1C1612', marginBottom:'0.2rem' }}>{item.t}</p>
              <p style={{ fontSize:'0.72rem', color:'#999' }}>{item.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (
        <section style={{ padding:'5rem 1.5rem', maxWidth:1280, margin:'0 auto' }}>
          <h2 className="font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.75rem)', fontWeight:700, textAlign:'center', marginBottom:'2.5rem', color:'#1C1612' }}>
            الفئات
          </h2>
          <div className="cats-grid">
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} style={{
                padding:'0.875rem 1rem', border:'1.5px solid #EAE6E0', borderRadius:99,
                textAlign:'center', fontSize:'0.875rem', fontWeight:500, color:'#555',
                background:'#fff', transition:'all 0.25s'
              }}
              onMouseEnter={e => { const el=e.currentTarget; el.style.borderColor='#B8860B'; el.style.color='#B8860B'; el.style.background='rgba(184,134,11,0.05)'; }}
              onMouseLeave={e => { const el=e.currentTarget; el.style.borderColor='#EAE6E0'; el.style.color='#555'; el.style.background='#fff'; }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding:'2rem 1.5rem 6rem', maxWidth:1280, margin:'0 auto' }}>
        <h2 className="font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.75rem)', fontWeight:700, textAlign:'center', marginBottom:'3rem', color:'#1C1612' }}>
          المنتجات
        </h2>

        {products.length === 0 ? (
          <div style={{ padding:'5rem', textAlign:'center', border:'2px dashed #EAE6E0', borderRadius:20 }}>
            <p style={{ color:'#aaa' }}>لا توجد منتجات بعد</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p: any) => {
              const img  = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض المنتج" />;
            })}
          </div>
        )}

        {/* Pagination */}
        {countPage > 1 && (
          <div className="pagination" dir="rtl">
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
              style={{ width:40, height:40, borderRadius:'50%', border:'1.5px solid #EAE6E0', display:'flex', alignItems:'center', justifyContent:'center', color:'#1C1612', background:'#fff' }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1;
              const isActive = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{
                  width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.875rem', fontWeight:600,
                  border: isActive ? '1.5px solid #1C1612' : '1.5px solid #EAE6E0',
                  background: isActive ? '#1C1612' : '#fff',
                  color: isActive ? '#fff' : '#1C1612'
                }}>{pn}</Link>
              );
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
              style={{ width:40, height:40, borderRadius:'50%', border:'1.5px solid #EAE6E0', display:'flex', alignItems:'center', justifyContent:'center', color:'#1C1612', background:'#fff' }}>❯</Link>
          </div>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DETAILS
═══════════════════════════════════════════════════════════ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  return (
    <div dir="rtl" style={{ background:'#F6F3EE', paddingBottom:'4rem' }}>
      <div className="details-inner" style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 1.5rem' }}>

        {/* Gallery */}
        <div style={{ position:'sticky', top:84 }}>
          <div style={{ position:'relative', aspectRatio:'1/1', borderRadius:20, overflow:'hidden', background:'#EDE9E3', border:'1px solid #E0DAD0' }}>
            {allImages[sel]
              ? <img src={allImages[sel]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><ShoppingBag size={48} color="#ccc" /></div>
            }
            {discount > 0 && (
              <div style={{ position:'absolute', top:16, right:16, background:'#1C1612', color:'#fff', padding:'4px 14px', borderRadius:99, fontSize:13, fontWeight:700 }}>
                {discount}% خصم
              </div>
            )}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.12)' }}>
                  <ChevronRight size={20} />
                </button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)}
                  style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.12)' }}>
                  <ChevronLeft size={20} />
                </button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="thumb-row">
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{
                  flexShrink:0, width:64, height:64, borderRadius:10, overflow:'hidden',
                  border: `2px solid ${sel === idx ? '#B8860B' : '#E0DAD0'}`,
                  opacity: sel === idx ? 1 : 0.55, cursor:'pointer', padding:0, background:'none',
                  transition:'all 0.2s'
                }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ background:'#fff', borderRadius:20, padding:'2rem', border:'1px solid #EAE6E0' }}>
            <h1 className="font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:700, color:'#1C1612', marginBottom:'0.75rem', lineHeight:1.15 }}>
              {product.name}
            </h1>
            <div style={{ display:'flex', gap:3, marginBottom:'1.5rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} style={{ fill: i < 4 ? '#B8860B' : 'none', color:'#B8860B' }} />)}
            </div>

            {/* Price */}
            <div style={{ background:'#F6F3EE', border:'1px solid #EAE6E0', borderRadius:14, padding:'1.125rem 1.25rem', marginBottom:'1.5rem' }}>
              <p style={{ fontSize:'0.75rem', color:'#999', marginBottom:'0.375rem' }}>السعر</p>
              <div style={{ display:'flex', alignItems:'baseline', gap:'0.375rem' }}>
                <span className="font-display" style={{ fontSize:'2.5rem', fontWeight:700, color:'#1C1612' }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize:'0.9rem', color:'#666' }}>دج</span>
              </div>
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom:'1.5rem' }}>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'1rem 1.25rem', border:`1.5px solid ${selectedOffer === o.id ? '#B8860B' : '#EAE6E0'}`,
                    borderRadius:14, cursor:'pointer', marginBottom:'0.625rem',
                    background: selectedOffer === o.id ? 'rgba(184,134,11,0.05)' : 'transparent',
                    transition:'all 0.2s'
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${selectedOffer === o.id ? '#B8860B' : '#ccc'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {selectedOffer === o.id && <div style={{ width:10, height:10, borderRadius:'50%', background:'#B8860B' }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display:'none' }} />
                      <div>
                        <p style={{ fontWeight:500, color:'#1C1612', fontSize:'0.9rem' }}>{o.name}</p>
                        <p style={{ fontSize:'0.75rem', color:'#999' }}>الكمية: {o.quantity}</p>
                      </div>
                    </div>
                    <span className="font-display" style={{ fontSize:'1.2rem', fontWeight:700, color:'#1C1612' }}>{o.price.toLocaleString()} دج</span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom:'1.25rem' }}>
                <p style={{ fontSize:'0.875rem', fontWeight:600, color:'#1C1612', marginBottom:'0.75rem' }}>{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div style={{ display:'flex', gap:10 }}>
                    {attr.variants.map((v: any) => (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                        style={{ width:32, height:32, borderRadius:'50%', background:v.value, border:'none', cursor:'pointer',
                          outline: `2.5px solid ${selectedVariants[attr.name] === v.value ? '#B8860B' : 'transparent'}`,
                          outlineOffset:3, transition:'outline 0.2s' }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {attr.variants.map((v: any) => (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{
                        padding:'0.5rem 1.25rem', border:`1.5px solid ${selectedVariants[attr.name] === v.value ? '#B8860B' : '#EAE6E0'}`,
                        borderRadius:99, fontSize:'0.875rem',
                        color: selectedVariants[attr.name] === v.value ? '#B8860B' : '#555',
                        background: selectedVariants[attr.name] === v.value ? 'rgba(184,134,11,0.06)' : 'transparent',
                        cursor:'pointer', transition:'all 0.2s'
                      }}>{v.name}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain}
              selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {product.desc && (
              <div style={{ marginTop:'2rem' }}>
                <GoldDivider />
                <div className="font-body" style={{ fontSize:'0.9rem', lineHeight:1.8, color:'#555' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, {
                    ALLOWED_TAGS:['p','br','strong','em','ul','ol','li','h1','h2','h3','span'],
                    ALLOWED_ATTR:['class','style']
                  }) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT FORM
═══════════════════════════════════════════════════════════ */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom:'1rem' }}>
    {label && <p style={{ fontSize:'0.8rem', fontWeight:600, color:'#555', marginBottom:'0.4rem' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize:'0.75rem', color:'#E53E3E', marginTop:'0.375rem', display:'flex', alignItems:'center', gap:4 }}>
      <AlertCircle size={12}/>{error}
    </p>}
  </div>
);

const INPUT_STYLE: React.CSSProperties = {
  width:'100%', padding:'0.75rem 1rem', background:'#F6F3EE',
  border:'1.5px solid #E6E1D8', borderRadius:12, fontSize:'0.875rem',
  color:'#1C1612', outline:'none', transition:'border-color 0.2s', appearance:'none'
};
const INPUT_ERROR: React.CSSProperties = { borderColor:'#E53E3E' };

const BTN_PRIMARY: React.CSSProperties = {
  width:'100%', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
  background:'#1C1612', color:'#fff', fontWeight:700, fontSize:'0.95rem',
  padding:'0.9rem 1rem', borderRadius:14, border:'none', cursor:'pointer',
  transition:'all 0.3s', boxShadow:'0 2px 12px rgba(0,0,0,0.12)'
};

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC]       = useState(false);
  const [fd, setFd] = useState({ customerId:'', customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', quantity:1, priceLoss:0, typeLivraison:'home' as 'home'|'office' });
  const [errors, setErrors]   = useState<Record<string,string>>({});
  const [sub, setSub]         = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded]       = useState(false);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId:id })); } }, []);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW   = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP  = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off  = product.offers?.find((o: any) => o.id === selectedOffer);
    if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice;
  }, [selW, fd.typeLivraison]);
  const fp    = getFP();
  const total = () => fp * fd.quantity + +getLiv();
  const validate = () => {
    const e: Record<string,string> = {};
    if (!fd.customerName.trim())  e.customerName  = 'مطلوب';
    if (!fd.customerPhone.trim()) e.customerPhone = 'مطلوب';
    if (!fd.customerWelaya)       e.customerWelaya = 'مطلوب';
    if (!fd.customerCommune)      e.customerCommune = 'مطلوب';
    return e;
  };
  const getVarId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const addToCart = () => {
    setIsAdded(true);
    const cart = JSON.parse(localStorage.getItem(domain) || '[]');
    cart.push({ ...fd, product, variantDetailId:getVarId(), productId:product.id, storeId:product.store.id, userId, selectedOffer, selectedVariants, platform:platform||'store', finalPrice:fp, totalPrice:total(), priceLivraison:getLiv(), addedAt:Date.now() });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate();
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSub(true);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, productId:product.id, storeId:product.store.id, userId, selectedOffer, variantDetailId:getVarId(), platform:platform||'store', finalPrice:fp, totalPrice:total(), priceLivraison:getLiv() });
      if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    } catch { /* handle error */ } finally { setSub(false); }
  };

  return (
    <div style={{ marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid #EAE6E0' }}>
      {product.store.cart && (
        <div className="cart-add-btns" style={{ marginBottom:'1.5rem' }}>
          <button onClick={addToCart} disabled={isAdded}
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              padding:'0.875rem 1.25rem', border:`1.5px solid ${isAdded ? '#B8860B' : '#EAE6E0'}`,
              borderRadius:99, fontSize:'0.875rem', fontWeight:600, cursor:'pointer',
              background: isAdded ? 'rgba(184,134,11,0.08)' : '#fff',
              color: isAdded ? '#B8860B' : '#1C1612',
              transition:'all 0.25s' }}>
            {isAdded ? <><CheckCircle2 size={15} className="anim-check-in"/>تمت الإضافة</> : <><ShoppingCart size={15}/>أضف للسلة</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            padding:'0.875rem 1.25rem', borderRadius:99, border:'none', cursor:'pointer',
            background:'#1C1612', color:'#fff', fontWeight:700, fontSize:'0.875rem',
            transition:'all 0.25s'
          }}
          onMouseEnter={e => (e.currentTarget.style.background='#B8860B')}
          onMouseLeave={e => (e.currentTarget.style.background='#1C1612')}>
            طلب الآن
          </button>
        </div>
      )}

      {(isOrderNow || !product.store.cart) && (
        <div className="anim-fade-up">
          {product.store.cart && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <p style={{ fontWeight:600, fontSize:'0.9rem', color:'#1C1612' }}>بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} style={{ fontSize:'0.8rem', color:'#999', background:'none', border:'none', cursor:'pointer' }}>إلغاء</button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.customerName} label="الاسم الكامل">
                <input type="text" value={fd.customerName} onChange={e => setFd({...fd,customerName:e.target.value})} placeholder="الاسم" style={{...INPUT_STYLE,...(errors.customerName?INPUT_ERROR:{})}} />
              </FR>
              <FR error={errors.customerPhone} label="رقم الهاتف">
                <input type="tel" value={fd.customerPhone} onChange={e => setFd({...fd,customerPhone:e.target.value})} placeholder="0XXXXXXXXX" style={{...INPUT_STYLE,...(errors.customerPhone?INPUT_ERROR:{})}} />
              </FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{ position:'relative' }}>
                  <ChevronDown size={13} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'#aaa', pointerEvents:'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} style={{...INPUT_STYLE,...(errors.customerWelaya?INPUT_ERROR:{}),paddingRight:40}}>
                    <option value="">اختر</option>
                    {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{ position:'relative' }}>
                  <ChevronDown size={13} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'#aaa', pointerEvents:'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya||loadingC} onChange={e => setFd({...fd,customerCommune:e.target.value})} style={{...INPUT_STYLE,...(errors.customerCommune?INPUT_ERROR:{}),paddingRight:40,opacity:(!fd.customerWelaya||loadingC)?0.5:1}}>
                    <option value="">{loadingC?'...':'اختر'}</option>
                    {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="نوع التوصيل">
              <div className="delivery-grid">
                {(['home','office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({...p,typeLivraison:t}))} style={{
                    padding:'0.875rem', border:`1.5px solid ${fd.typeLivraison===t?'#B8860B':'#EAE6E0'}`,
                    borderRadius:14, textAlign:'center', cursor:'pointer',
                    background: fd.typeLivraison===t?'rgba(184,134,11,0.06)':'transparent',
                    transition:'all 0.2s'
                  }}>
                    <p style={{ fontWeight:600, fontSize:'0.85rem', marginBottom:4, color:fd.typeLivraison===t?'#B8860B':'#555' }}>
                      {t==='home'?'للبيت':'للمكتب'}
                    </p>
                    {selW && <p className="font-display" style={{ fontSize:'1.125rem', fontWeight:700, color:fd.typeLivraison===t?'#1C1612':'#aaa' }}>
                      {(t==='home'?selW.livraisonHome:selW.livraisonOfice).toLocaleString()} دج
                    </p>}
                  </button>
                ))}
              </div>
            </FR>

            <FR label="الكمية">
              <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid #EAE6E0', borderRadius:99, overflow:'hidden', background:'#fff' }}>
                <button type="button" onClick={() => setFd(p=>({...p,quantity:Math.max(1,p.quantity-1)}))} style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', color:'#1C1612' }}><Minus size={15}/></button>
                <span style={{ width:44, textAlign:'center', fontWeight:700, fontSize:'0.9rem' }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p=>({...p,quantity:p.quantity+1}))} style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', color:'#1C1612' }}><Plus size={15}/></button>
              </div>
            </FR>

            {/* Summary */}
            <div style={{ background:'#F6F3EE', border:'1px solid #EAE6E0', borderRadius:14, padding:'1.125rem 1.25rem', marginBottom:'1.25rem' }}>
              <p style={{ fontWeight:700, fontSize:'0.875rem', marginBottom:'0.875rem', color:'#1C1612' }}>ملخص الطلب</p>
              {[
                { l:'المنتج', v: product.name.slice(0,28)+(product.name.length>28?'...':'') },
                { l:'التوصيل', v: selW?`${getLiv().toLocaleString()} دج`:'—' }
              ].map(r => (
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', paddingBottom:'0.625rem', marginBottom:'0.625rem', borderBottom:'1px solid #E6E1D8' }}>
                  <span style={{ fontSize:'0.875rem', color:'#777' }}>{r.l}</span>
                  <span style={{ fontSize:'0.875rem', fontWeight:500, color:'#1C1612' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', paddingTop:'0.5rem' }}>
                <span style={{ fontWeight:700, color:'#1C1612' }}>المجموع</span>
                <span className="font-display" style={{ fontSize:'1.75rem', fontWeight:700, color:'#1C1612' }}>
                  {total().toLocaleString()} <span style={{ fontSize:'0.8rem', fontWeight:400, color:'#999', fontFamily:'Tajawal,sans-serif' }}>دج</span>
                </span>
              </div>
            </div>

            <button type="submit" disabled={sub} style={{...BTN_PRIMARY, opacity:sub?0.7:1}}
              onMouseEnter={e => !sub && ((e.currentTarget as HTMLButtonElement).style.background='#B8860B')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background='#1C1612')}>
              {sub ? <><Loader2 size={17} style={{ animation:'spin 1s linear infinite' }}/> جاري المعالجة...</> : 'تأكيد الطلب'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CART
═══════════════════════════════════════════════════════════ */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems]     = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName:'', customerPhone:'', customerWelaya:'', customerCommune:'', typeLivraison:'home' as 'home'|'office' });
  const [errors, setErrors]   = useState<Record<string,string>>({});
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(domain) || '[]'));
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [domain, store]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW      = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLiv    = () => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; };
  const cartTotal = items.reduce((a, i) => a + (i.finalPrice * i.quantity), 0);
  const finalTotal = cartTotal + +getLiv();
  const update    = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string,string> = {};
    if (!fd.customerName.trim())  er.name = 'مطلوب';
    if (!fd.customerPhone.trim()) er.phone = 'مطلوب';
    if (!fd.customerWelaya)       er.w = 'مطلوب';
    if (!fd.customerCommune)      er.c = 'مطلوب';
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId:i.productId, storeId:i.storeId, userId:i.userId, selectedOffer:i.selectedOffer, variantDetailId:i.variantDetailId, selectedVariants:i.selectedVariants, platform:i.platform||'store', finalPrice:i.finalPrice, totalPrice:finalTotal, priceLivraison:+getLiv(), quantity:i.quantity, customerId:i.customerId||'', priceLoss:selW?.livraisonReturn??0 })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { /* handle */ } finally { setSubmitting(false); }
  };

  if (success) return (
    <div dir="rtl" style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', background:'#F6F3EE' }}>
      <div style={{ textAlign:'center', background:'#fff', padding:'4rem 3rem', borderRadius:24, border:'1px solid #EAE6E0', maxWidth:480, width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,0.06)' }}>
        <CheckCircle2 size={56} style={{ color:'#B8860B', marginBottom:'1.5rem', display:'block', margin:'0 auto 1.5rem' }} />
        <h2 className="font-display" style={{ fontSize:'2rem', fontWeight:700, color:'#1C1612', marginBottom:'0.75rem' }}>تم استلام طلبك!</h2>
        <p style={{ color:'#777', fontSize:'1rem', marginBottom:'2rem', lineHeight:1.7 }}>شكراً لثقتك بنا. سنتصل بك قريباً لتأكيد الطلب.</p>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#1C1612', color:'#fff', padding:'0.875rem 2rem', borderRadius:99, fontWeight:700, fontSize:'0.9rem' }}>العودة للمتجر</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir="rtl" style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', background:'#F6F3EE' }}>
      <div style={{ textAlign:'center', padding:'4rem 2rem', border:'2px dashed #EAE6E0', borderRadius:24, maxWidth:480, width:'100%', background:'#fff' }}>
        <ShoppingBag size={56} style={{ color:'#ddd', margin:'0 auto 1.5rem', display:'block' }} />
        <p style={{ color:'#aaa', fontSize:'1rem', marginBottom:'2rem' }}>سلة التسوق فارغة</p>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#1C1612', color:'#fff', padding:'0.875rem 2rem', borderRadius:99, fontWeight:700, fontSize:'0.9rem' }}>تسوق الآن</Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ padding:'3rem 1.5rem', maxWidth:1280, margin:'0 auto', minHeight:'100vh' }}>
      <h1 className="font-display" style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:700, color:'#1C1612', marginBottom:'2.5rem' }}>السلة</h1>
      <div className="cart-inner">
        {/* Products */}
        <div style={{ background:'#fff', borderRadius:20, border:'1px solid #EAE6E0', overflow:'hidden', alignSelf:'start' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display:'flex', gap:'1rem', padding:'1.125rem', borderBottom:'1px solid #EAE6E0' }}>
              <img src={item.product?.imagesProduct?.[0]?.imageUrl||item.product?.productImage} style={{ width:80, height:80, borderRadius:12, objectFit:'cover', flexShrink:0 }} alt="" />
              <div style={{ flex:1 }}>
                <h4 style={{ fontWeight:600, color:'#1C1612', marginBottom:'0.375rem', fontSize:'0.9rem' }}>{item.product?.name}</h4>
                <p className="font-display" style={{ fontSize:'1.25rem', fontWeight:700, color:'#1C1612' }}>{item.finalPrice?.toLocaleString()} دج</p>
                <p style={{ fontSize:'0.75rem', color:'#999', marginTop:'0.25rem' }}>الكمية: {item.quantity}</p>
              </div>
              <button onClick={() => update(items.filter((_,idx) => idx!==i))} style={{ color:'#E53E3E', padding:'0.5rem', borderRadius:8, background:'none', border:'none', cursor:'pointer', alignSelf:'center' }}>
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
          <div style={{ padding:'1.125rem', background:'#F6F3EE', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:700, color:'#1C1612', fontSize:'0.9rem' }}>المجموع الفرعي:</span>
            <span className="font-display" style={{ fontSize:'1.375rem', fontWeight:700, color:'#1C1612' }}>{cartTotal.toLocaleString()} دج</span>
          </div>
        </div>

        {/* Checkout */}
        <div style={{ background:'#fff', borderRadius:20, border:'1px solid #EAE6E0', padding:'1.75rem', alignSelf:'start' }}>
          <h3 style={{ fontWeight:700, fontSize:'1.1rem', color:'#1C1612', marginBottom:'1.5rem' }}>معلومات التوصيل</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e=>setFd({...fd,customerName:e.target.value})} style={{...INPUT_STYLE,...(errors.name?INPUT_ERROR:{})}} /></FR>
              <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e=>setFd({...fd,customerPhone:e.target.value})} style={{...INPUT_STYLE,...(errors.phone?INPUT_ERROR:{})}} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.w} label="الولاية">
                <div style={{ position:'relative' }}>
                  <ChevronDown size={13} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'#aaa', pointerEvents:'none' }} />
                  <select value={fd.customerWelaya} onChange={e=>setFd({...fd,customerWelaya:e.target.value,customerCommune:''})} style={{...INPUT_STYLE,...(errors.w?INPUT_ERROR:{}),paddingRight:40}}>
                    <option value="">اختر</option>{wilayas.map(w=><option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label="البلدية">
                <div style={{ position:'relative' }}>
                  <ChevronDown size={13} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'#aaa', pointerEvents:'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC||!fd.customerWelaya} onChange={e=>setFd({...fd,customerCommune:e.target.value})} style={{...INPUT_STYLE,...(errors.c?INPUT_ERROR:{}),paddingRight:40,opacity:(!fd.customerWelaya||loadingC)?0.5:1}}>
                    <option value="">{loadingC?'...':'اختر'}</option>{communes.map(c=><option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <div style={{ background:'#F6F3EE', border:'1px solid #EAE6E0', borderRadius:14, padding:'1.125rem', marginBottom:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:'0.5rem', marginBottom:'0.5rem', borderBottom:'1px solid #E6E1D8' }}>
                <span style={{ fontSize:'0.875rem', color:'#777' }}>المجموع الفرعي</span>
                <span style={{ fontWeight:600, color:'#1C1612', fontSize:'0.875rem' }}>{cartTotal.toLocaleString()} دج</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:'0.75rem', marginBottom:'0.75rem', borderBottom:'1px solid #E6E1D8' }}>
                <span style={{ fontSize:'0.875rem', color:'#777' }}>التوصيل</span>
                <span style={{ fontWeight:600, color:'#1C1612', fontSize:'0.875rem' }}>{getLiv()?`${getLiv().toLocaleString()} دج`:'—'}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontWeight:700, color:'#1C1612' }}>الإجمالي</span>
                <span className="font-display" style={{ fontSize:'1.75rem', fontWeight:700, color:'#B8860B' }}>{finalTotal.toLocaleString()} <span style={{ fontSize:'0.8rem', color:'#999', fontFamily:'Tajawal,sans-serif', fontWeight:400 }}>دج</span></span>
              </div>
            </div>

            <button type="submit" disabled={submitting} style={{...BTN_PRIMARY,opacity:submitting?0.7:1}}
              onMouseEnter={e=>!submitting&&((e.currentTarget as HTMLButtonElement).style.background='#B8860B')}
              onMouseLeave={e=>((e.currentTarget as HTMLButtonElement).style.background='#1C1612')}>
              {submitting?<><Loader2 size={17} style={{ animation:'spin 1s linear infinite' }}/> جاري المعالجة...</>:'تأكيد الطلب'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATIC PAGES
═══════════════════════════════════════════════════════════ */
const Shell = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div dir="rtl" style={{ minHeight:'100vh', background:'#F6F3EE' }}>
    <div style={{ background:'#fff', paddingTop:96, paddingBottom:48, paddingLeft:24, paddingRight:24, borderBottom:'1px solid #EAE6E0', textAlign:'center' }}>
      <h1 className="font-display" style={{ fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:700, color:'#1C1612' }}>{title}</h1>
      <div style={{ maxWidth:300, margin:'0.5rem auto 0' }}><GoldDivider /></div>
    </div>
    <div style={{ maxWidth:900, margin:'0 auto', padding:'3rem 1.5rem 6rem' }}>{children}</div>
  </div>
);

const InfoBlock = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding:'1.5rem 0', borderBottom:'1px solid #EAE6E0' }}>
    <h3 style={{ fontWeight:700, fontSize:'1.0625rem', color:'#1C1612', marginBottom:'0.625rem' }}>{title}</h3>
    <p style={{ fontSize:'0.9375rem', lineHeight:1.8, color:'#666' }}>{body}</p>
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية">
      <div style={{ background:'#fff', padding:'2rem', borderRadius:20, border:'1px solid #EAE6E0' }}>
        <InfoBlock title="البيانات التي نجمعها" body="نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم، رقم الهاتف، وعنوان السكن لضمان وصول شحنتكم بدقة." />
        <InfoBlock title="حماية البيانات" body="تُخزن جميع البيانات بشكل مشفر وآمن. نستخدم بروتوكولات حماية متطورة لمنع أي وصول غير مصرح به لمعلوماتكم." />
        <InfoBlock title="مشاركة المعلومات" body="نلتزم بخصوصيتكم؛ لا نقوم ببيع أو مشاركة بياناتكم مع أي جهات خارجية باستثناء شركات التوصيل المعتمدة." />
      </div>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الاستخدام">
      <div style={{ background:'#fff', padding:'2rem', borderRadius:20, border:'1px solid #EAE6E0' }}>
        <InfoBlock title="الحساب والمسؤولية" body="المستخدم مسؤول عن دقة البيانات المدخلة وعن الحفاظ على سرية معلومات حسابه والأنشطة التي تتم من خلاله." />
        <InfoBlock title="الطلبات والمدفوعات" body="يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الأسعار المعلنة هي الأسعار النهائية المعتمدة للمنتجات." />
        <InfoBlock title="القانون الحاكم" body="تخضع كافة التعاملات والنزاعات للقوانين والتشريعات المعمول بها في جمهورية الجزائر الديمقراطية الشعبية." />
      </div>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات تعريف الارتباط">
      <div style={{ background:'#fff', padding:'2rem', borderRadius:20, border:'1px solid #EAE6E0' }}>
        <InfoBlock title="الملفات الأساسية" body="نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل سلة المشتريات بشكل صحيح وتأمين جلسة تسجيل الدخول الخاصة بك." />
        <InfoBlock title="تحسين التجربة" body="نستخدم بعض الملفات لتحليل كيفية تفاعل المستخدمين مع المتجر، مما يساعدنا على تطوير خدماتنا وتقديم محتوى مخصص." />
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const [form, setForm]   = useState({ name:'', email:'', phone:'', message:'' });
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id });
      setSent(true);
    } catch { alert('حدث خطأ في الإرسال'); } finally { setLoading(false); }
  };

  return (
    <div dir="rtl" style={{ background:'#F6F3EE', minHeight:'100vh' }}>
      <div style={{ background:'#fff', paddingTop:96, paddingBottom:48, paddingLeft:24, paddingRight:24, textAlign:'center', borderBottom:'1px solid #EAE6E0' }}>
        <h1 className="font-display" style={{ fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:700, color:'#1C1612', marginBottom:'0.5rem' }}>تواصل معنا</h1>
        <div style={{ maxWidth:300, margin:'0 auto' }}><GoldDivider /></div>
        <p style={{ color:'#777', fontSize:'0.9375rem' }}>نحن هنا للإجابة على استفساراتكم في أسرع وقت</p>
      </div>
      <div className="contact-inner" style={{ maxWidth:1100, margin:'0 auto', padding:'4rem 1.5rem 6rem' }}>

        {/* Info */}
        <div>
          <div style={{ background:'#fff', borderRadius:20, border:'1px solid #EAE6E0', padding:'2rem', marginBottom:'1rem' }}>
            <h3 className="font-display" style={{ fontSize:'1.375rem', color:'#B8860B', marginBottom:'1.5rem' }}>معلومات الاتصال</h3>
            {[
              { icon:<Phone size={18}/>, label:'الهاتف', val:store?.contact?.phone||'غير متوفر' },
              { icon:<MapPin size={18}/>, label:'الموقع', val:store?.contact?.wilaya||'الجزائر' },
            ].map((r,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'#F6F3EE', border:'1px solid #EAE6E0', display:'flex', alignItems:'center', justifyContent:'center', color:'#B8860B', flexShrink:0 }}>{r.icon}</div>
                <div>
                  <p style={{ fontSize:'0.75rem', color:'#aaa', marginBottom:'0.25rem' }}>{r.label}</p>
                  <p style={{ fontWeight:600, color:'#1C1612', fontSize:'0.9rem' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #B8860B', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <span style={{ width:10, height:10, borderRadius:'50%', background:'#B8860B', boxShadow:'0 0 10px #B8860B', display:'inline-block' }} className="anim-pulse" />
            <span style={{ fontSize:'0.875rem', fontWeight:600, color:'#1C1612' }}>جاهزون للرد الآن</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ background:'#fff', borderRadius:20, border:'1px solid #EAE6E0', padding:'2rem' }}>
          {sent ? (
            <div style={{ textAlign:'center', padding:'4rem 1rem' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(184,134,11,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
                <CheckCircle2 size={40} style={{ color:'#B8860B' }} />
              </div>
              <h2 className="font-display" style={{ fontSize:'1.75rem', fontWeight:700, color:'#1C1612', marginBottom:'0.5rem' }}>تم الإرسال!</h2>
              <p style={{ color:'#777', marginBottom:'2rem' }}>سنرد عليك في أقرب وقت ممكن.</p>
              <button onClick={() => setSent(false)} style={{ padding:'0.75rem 2rem', borderRadius:99, border:'1.5px solid #B8860B', background:'transparent', color:'#B8860B', fontWeight:600, cursor:'pointer', fontSize:'0.875rem' }}>إرسال رسالة أخرى</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom:'1rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#555', marginBottom:'0.4rem' }}>الاسم</label>
                  <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="اسمك الكامل" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#555', marginBottom:'0.4rem' }}>الهاتف</label>
                  <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required placeholder="05XXXXXXXX" style={INPUT_STYLE} />
                </div>
              </div>
              <div style={{ marginBottom:'1rem' }}>
                <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#555', marginBottom:'0.4rem' }}>البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required placeholder="email@example.com" style={INPUT_STYLE} />
              </div>
              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#555', marginBottom:'0.4rem' }}>رسالتك</label>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required rows={5} placeholder="كيف يمكننا مساعدتك؟" style={{...INPUT_STYLE,resize:'none'}} />
              </div>
              <button type="submit" disabled={loading} style={{...BTN_PRIMARY,opacity:loading?0.7:1}}
                onMouseEnter={e=>!loading&&((e.currentTarget as HTMLButtonElement).style.background='#B8860B')}
                onMouseLeave={e=>((e.currentTarget as HTMLButtonElement).style.background='#1C1612')}>
                {loading?<><Loader2 size={17} style={{ animation:'spin 1s linear infinite' }}/> جاري الإرسال...</>:<>إرسال الرسالة <ArrowRight size={17}/></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return (
    <>
      {p === 'privacy'  && <Privacy />}
      {p === 'terms'    && <Terms />}
      {p === 'cookies'  && <Cookies />}
      {p === 'contact'  && <Contact store={store} />}
    </>
  );
}