'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Phone,
  CheckCircle2, ArrowRight, Cpu,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, MapPin, Shield, Truck, Layers,
  Headphones, ScanLine, Mail,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const A   = '#6E5BFF';
const AD  = '#5645E0';
const AL  = 'rgba(110,91,255,0.12)';
const A2  = '#22D3EE';
const BG  = '#0A0E1A';
const CARD = '#121929';
const TXT = '#F1F4FA';
const SUB = '#8D96AC';
const BD  = 'rgba(148,163,184,0.16)';

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Cairo', sans-serif;
    background: ${BG};
    color: ${TXT};
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${BG}; }
  ::-webkit-scrollbar-thumb { background: ${BD}; border-radius: 2px; }

  @keyframes slideDown  { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideFade  { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes checkPop   { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes glb-ov-in  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes glb-ov-panel { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin        { to { transform: rotate(360deg); } }
  @keyframes pulseDot    { 0%,100% { opacity:1; } 50% { opacity:0.35; } }

  .anim-slide-down { animation: slideDown 0.2s ease both; }
  .anim-slide-fade { animation: slideFade 0.3s ease both; }
  .anim-check      { animation: checkPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }

  .nav-desktop { display: none; align-items: center; gap: 1.75rem; }
  .nav-mobile  { display: flex; gap: 0.5rem; }
  @media (min-width: 1024px) { .nav-desktop { display: flex; } .nav-mobile { display: none; } }

  .hero-dotgrid { position: absolute; inset: 0; opacity: 0.5; background-image: radial-gradient(${BD} 1px, transparent 1px); background-size: 22px 22px; pointer-events: none; }

  .trust-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: ${BD}; }
  @media (min-width: 1024px) { .trust-grid { grid-template-columns: repeat(4, 1fr); } }

  .cats-grid { display: flex; gap: 0.625rem; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
  .cats-grid::-webkit-scrollbar { height: 0; }

  .products-grid { display: grid; grid-template-columns: 1fr; gap: 1.125rem; }
  @media (min-width: 500px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; } }
  @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

  .details-inner { display: grid; grid-template-columns: 1fr; gap: 1rem; padding: 0.5rem; }
  .gallery-container { position: relative; top: 0; width: 100%; }
  .info-container { background: ${CARD}; border-radius: 0; padding: 1.25rem; border: 1px solid ${BD}; }
  @media (min-width: 768px) {
    .details-inner { grid-template-columns: 1fr 1fr; gap: 3rem; padding: 2rem; }
    .gallery-container { position: sticky; top: 100px; z-index: 10; }
    .info-container { padding: 1.75rem; }
  }

  .form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
  @media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

  .cart-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .cart-inner { grid-template-columns: 1.2fr 1fr; gap: 3rem; } }

  .contact-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .contact-inner { grid-template-columns: 1fr 2fr; } }

  .footer-inner { display: grid; grid-template-columns: 1fr; gap: 3rem; padding-bottom: 3rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
  @media (min-width: 768px) { .footer-inner { grid-template-columns: 2fr 1fr 1fr; } }

  .hero-actions { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .hero-actions { flex-direction: row; align-items: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .thumb-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; overflow-x: auto; padding-bottom: 4px; }
  .pagination { display: flex; justify-content: center; gap: 0.375rem; flex-wrap: wrap; margin-top: 3rem; }

  a { text-decoration: none; color: inherit; }
  .price-mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
  .eyebrow { font-family: 'JetBrains Mono', monospace; }

  .tech-card { position: relative; transition: border-color 0.16s ease, transform 0.16s ease; }
  .tech-card:hover { transform: translateY(-3px); border-color: ${A} !important; }
  .tech-corner { position: absolute; width: 14px; height: 14px; border-color: ${A}; opacity: 0; transition: opacity 0.16s ease; pointer-events: none; }
  .tech-card:hover .tech-corner { opacity: 1; }
  .tc-tl { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
  .tc-bl { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }

  .glb-search-ov {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(10,14,26,0.97); backdrop-filter: blur(16px);
    overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
    animation: glb-ov-in 0.2s ease;
  }
  .glb-search-panel { max-width: 680px; margin: 0 auto; padding: 5rem 1.5rem 4rem; animation: glb-ov-panel 0.3s ease; direction: rtl; }
  .glb-search-form { border-bottom: 2px solid ${A}; display: flex; align-items: center; margin-bottom: 2rem; }
  .glb-search-input { flex: 1; font-size: 1.5rem; border: none; background: transparent; color: ${TXT}; outline: none; padding: 0.5rem 0.5rem 0.75rem; font-family: 'Cairo', sans-serif; direction: rtl; }
  .glb-search-input::placeholder { color: #4B5468; }
  .glb-search-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; direction: rtl; }
  .glb-search-card { display: block; border: 1px solid ${BD}; background: ${CARD}; overflow: hidden; transition: all 0.2s; text-decoration: none; color: inherit; }
  .glb-search-card:hover { border-color: ${A}; }
  .glb-search-card-info { padding: 0.75rem; direction: rtl; }
`;

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
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

const S = {
  input: {
    width: '100%', padding: '0.75rem 1rem',
    background: '#0E1424', border: `1px solid ${BD}`,
    borderRadius: 0, fontSize: '0.9rem', color: TXT,
    outline: 'none', transition: 'border-color 0.18s', appearance: 'none'
  } as React.CSSProperties,
  inputErr: { borderColor: '#EF4444' } as React.CSSProperties,
  btnPrimary: {
    width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: A, color: '#fff', fontWeight: 700, fontSize: '0.9rem',
    padding: '0.875rem 1.5rem', borderRadius: 0, border: 'none', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: "'Cairo', sans-serif",
  } as React.CSSProperties,
};

export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { const s = localStorage.getItem(domain); initCount(JSON.parse(s || '[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (showSearch) { setTimeout(() => searchInputRef.current?.focus(), 80); }
    else { setSearchQuery(''); setListSearch([]); }
  }, [showSearch]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); setListSearch(data.products || []); }
      catch { } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setListSearch([]); setShowSearch(false); }
  };

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: A, color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
          {store.topBar.text}
        </div>
      )}
      <nav dir="ltr" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(10,14,26,0.92)' : BG,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${scrolled ? BD : 'rgba(148,163,184,0.08)'}`,
        transition: 'all 0.25s',
      }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${A}, ${A2})`, position: 'absolute', bottom: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Link href="/" style={{ flexShrink: 0, textDecoration: 'none' }}>
            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
              <img src={store.design.logoUrl} style={{ height: 36, objectFit: 'contain', display: 'block' }} alt={store?.name || ''} onError={() => setImgError(true)} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Cpu size={17} color="#fff" />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: TXT, lineHeight: 1.1 }}>{store?.name || 'Tech Innovation'}</span>
                  <span className="eyebrow" style={{ display: 'block', fontSize: '0.6rem', color: SUB, fontWeight: 500, letterSpacing: '0.06em' }}>ELECTRONICS</span>
                </div>
              </div>
            )}
          </Link>

          <div className="nav-desktop">
            {[{ h: '/', l: 'Accueil' }, { h: '/contact', l: 'Contactez-nous' }].map(i => (
              <Link key={i.h} href={i.h} style={{ fontSize: '0.875rem', fontWeight: 500, color: SUB, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = A2)}
                onMouseLeave={e => (e.currentTarget.style.color = SUB)}>{i.l}</Link>
            ))}
            <button onClick={() => setShowSearch(true)} style={{ height: 36, padding: '0 0.875rem', borderRadius: 0, border: `1px solid ${BD}`, background: 'transparent', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: SUB, fontSize: '0.82rem', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = A; (e.currentTarget as HTMLButtonElement).style.color = A2; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BD; (e.currentTarget as HTMLButtonElement).style.color = SUB; }}>
              <Search size={14} /> Recherche rapide...
            </button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: A, color: '#fff', height: 38, padding: '0 1rem', borderRadius: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, transition: 'background 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = AD)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = A)}>
                <ShoppingCart size={15} /> Panier
                {count > 0 && <span style={{ background: A2, color: '#08111F', fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
          </div>

          <div className="nav-mobile">
            <button onClick={() => setShowSearch(true)} style={{ width: 38, height: 38, borderRadius: 0, border: `1px solid ${BD}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB }}>
              <Search size={15} />
            </button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: A, color: '#fff', width: 38, height: 38, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={16} />
                {count > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: A2, color: '#08111F', fontSize: 10, fontWeight: 800, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
            <button onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: 0, border: `1px solid ${BD}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        <div style={{ overflow: 'hidden', maxHeight: open ? 220 : 0, transition: 'max-height 0.28s ease', background: BG, borderTop: open ? `1px solid ${BD}` : 'none' }}>
          <div style={{ padding: '0.375rem 1.5rem 1rem' }}>
            {[{ h: '/', l: 'Accueil' }, { h: '/contact', l: 'Contactez-nous' }].map(i => (
              <Link key={i.h} href={i.h} onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: `1px solid ${BD}`, fontSize: '0.875rem', fontWeight: 500, color: TXT }}>
                {i.l} <ArrowRight size={14} style={{ color: A }} />
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {showSearch && (
        <div className="glb-search-ov" onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div className="glb-search-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: AL, border: `1px solid rgba(110,91,255,0.35)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={13} color={A2} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: SUB }}>Recherche de produits</span>
              </div>
              <button onClick={() => setShowSearch(false)} style={{ width: 34, height: 34, borderRadius: 0, border: `1px solid ${BD}`, background: CARD, color: SUB, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>
            <form className="glb-search-form" onSubmit={handleSearch}>
              <Search size={20} style={{ color: A, flexShrink: 0, marginLeft: 12 }} />
              <input ref={searchInputRef} className="glb-search-input" type="text" placeholder="Rechercher un appareil ou produit tech..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: SUB, padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}><X size={14} /></button>}
            </form>
            {loading && <p style={{ textAlign: 'center', color: A2, fontSize: '0.85rem', fontWeight: 600, padding: '2rem' }}>Recherche en cours...</p>}
            {!loading && listSearch.length > 0 && (
              <>
              <div className="glb-search-grid">
                {listSearch.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} className="glb-search-card" onClick={() => setShowSearch(false)}>
                    {(p.productImage || p.imagesProduct?.[0]?.imageUrl) && (
                      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                    )}
                    <div className="glb-search-card-info">
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: TXT, marginBottom: 4, lineHeight: 1.35 }}>{p.name}</p>
                      <p className="price-mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: A2 }}>{Number(p.price).toLocaleString()} DA</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button onClick={handleSearch} style={{ width: '100%', padding: '12px', background: AL, border: 'none', borderTop: `1px solid rgba(110,91,255,0.25)`, color: A2, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Voir tous les résultats <ArrowRight size={14} />
              </button>
              </>
            )}
            {!loading && searchQuery.length >= 2 && listSearch.length === 0 && (
              <p style={{ textAlign: 'center', color: '#3D4458', fontSize: '0.9rem', padding: '3rem' }}>Aucun résultat</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Footer({ store }: any) {
  return (
    <footer dir="ltr" style={{ background: '#070A12', color: 'rgba(241,244,250,0.5)', marginTop: 80, padding: '4rem 1.5rem 1.5rem', borderTop: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ width: 30, height: 30, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={15} color="#fff" />
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.8, maxWidth: 300 }}>
              {store?.hero?.subtitle?.substring(0, 100) || 'Les derniers appareils électroniques et technologies intelligentes, selon des normes de qualité et de test rigoureuses.'}
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'rgba(241,244,250,0.22)' }}>
              © {new Date().getFullYear()} {store?.name}. Tous droits réservés.
            </p>
          </div>
          <div>
            <h4 className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 700, color: A2, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Pages</h4>
            {[{ h: '/', l: 'Accueil' }, { h: '/cart', l: 'Panier' }, { h: '/contact', l: 'Contactez-nous' }, { h: '/Privacy', l: 'Confidentialité' }, { h: '/Terms', l: 'Conditions' }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(241,244,250,0.45)', marginBottom: '0.625rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = A2)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(241,244,250,0.45)')}>
                {lnk.l}
              </Link>
            ))}
          </div>
          <div>
            <h4 className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 700, color: A2, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Contact</h4>
            {[
              { icon: <Phone size={14} />, val: store?.contact?.phone },
              { icon: <Mail size={14} />, val: store?.contact?.email },
              { icon: <MapPin size={14} />, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: A2, flexShrink: 0 }}>{r.icon}</span>
                <span style={{ color: 'rgba(241,244,250,0.55)' }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="tech-card" style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <span className="tech-corner tc-tl" /><span className="tech-corner tc-bl" />
      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#0E1424', overflow: 'hidden' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cpu size={40} color={BD} /></div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: A, color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 9px' }}>
            -{discount}%
          </div>
        )}
      </div>
      <div style={{ padding: '0.875rem 1rem 1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p className="eyebrow" style={{ fontSize: '0.62rem', color: SUB, letterSpacing: '0.08em', marginBottom: '0.375rem' }}>#{String(product.id).slice(0, 6).toUpperCase()}</p>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: TXT, marginBottom: '0.375rem', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', gap: 2, marginBottom: '0.75rem' }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={10} style={{ fill: i < 4 ? A2 : 'none', color: A2 }} />)}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: TXT }}>{price.toLocaleString()}</span>
            <span style={{ fontSize: '0.72rem', color: SUB }}>{store.currency || 'DA'}</span>
            {orig > price && <span className="price-mono" style={{ fontSize: '0.72rem', color: '#4B5468', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
          <Link href={`/product/${product.slug || product.id}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '0.6rem', borderRadius: 0, background: AL, color: A2, fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s', border: `1px solid rgba(110,91,255,0.25)` }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = A; el.style.color = '#fff'; el.style.borderColor = A; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = AL; el.style.color = A2; el.style.borderColor = 'rgba(110,91,255,0.25)'; }}>
            {viewDetails} <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir="ltr">
      {/* HERO — full background image */}
      <section style={{ position: 'relative', overflow: 'hidden', background: BG, minHeight: 'clamp(480px,68vh,720px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {store.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,26,0.2) 0%, rgba(10,14,26,0.55) 55%, rgba(10,14,26,0.97) 100%)' }} />
        <div className="hero-dotgrid" />
        <span style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderTop: `2px solid ${A2}`, borderRight: `2px solid ${A2}`, opacity: 0.6 }} />
        <span style={{ position: 'absolute', bottom: 16, left: 16, width: 28, height: 28, borderBottom: `2px solid ${A2}`, borderLeft: `2px solid ${A2}`, opacity: 0.6 }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', width: '100%', padding: 'clamp(5rem,10vw,8rem) 1.5rem clamp(3rem,6vw,5rem)' }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: AL, border: `1px solid rgba(110,91,255,0.4)`, padding: '0.35rem 0.875rem', marginBottom: '1.25rem' }}>
              <Cpu size={11} color={A2} />
              <span className="eyebrow" style={{ fontSize: '0.7rem', fontWeight: 600, color: A2 }}>Innovation Tech</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem,5.5vw,3.75rem)', fontWeight: 800, color: TXT, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1rem' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || 'La technologie du futur<br/>entre vos <span style="color:#6E5BFF">mains</span>') }} />
            <p style={{ fontSize: '1rem', color: SUB, lineHeight: 1.75, marginBottom: '2.25rem', maxWidth: 480 }}>
              {store.hero?.subtitle || "Les derniers appareils électroniques et technologies intelligentes, sélectionnés avec soin pour suivre l'ère de l'innovation."}
            </p>
            <div className="hero-actions">
              <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: A, color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '0.875rem 1.875rem', borderRadius: 0, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = AD; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = A; }}>
                Découvrir les produits <ArrowRight size={16} />
              </a>
              {store?.cart !== false && (
                <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(241,244,250,0.8)', fontWeight: 500, fontSize: '0.9rem', padding: '0.875rem 1.25rem', borderRadius: 0, border: `1px solid rgba(241,244,250,0.25)`, background: 'rgba(241,244,250,0.06)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = A2; (e.currentTarget as HTMLAnchorElement).style.color = A2; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(241,244,250,0.25)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(241,244,250,0.8)'; }}>
                  Panier
                </Link>
              )}
            </div>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              {[
                { icon: <Cpu size={14} />, val: '+300', lbl: 'produits tech' },
                { icon: <Truck size={14} />, val: '58', lbl: 'wilayas' },
                { icon: <Shield size={14} />, val: '2', lbl: 'an de garantie' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: A2 }}>{s.icon}</span>
                  <span className="price-mono" style={{ fontSize: '1rem', fontWeight: 800, color: TXT }}>{s.val}</span>
                  <span style={{ fontSize: '0.8rem', color: SUB }}>{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BD}`, borderTop: `1px solid ${BD}` }}>
        <div className="trust-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
          {[
            { icon: <ScanLine size={18} />, t: 'Contrôle qualité rigoureux', d: 'Test de chaque appareil' },
            { icon: <Truck size={18} />, t: 'Livraison rapide', d: '58 wilayas algériennes' },
            { icon: <Shield size={18} />, t: 'Garantie revendeur', d: 'Protection fiable' },
            { icon: <Headphones size={18} />, t: 'Support technique', d: 'Équipe spécialisée' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1.125rem 1rem', textAlign: 'center', background: CARD }}>
              <div style={{ width: 40, height: 40, background: AL, border: `1px solid rgba(110,91,255,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.625rem', color: A2 }}>{item.icon}</div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: TXT, marginBottom: '0.15rem' }}>{item.t}</p>
              <p style={{ fontSize: '0.7rem', color: SUB }}>{item.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <section style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Layers size={14} color={A2} />
            <p className="eyebrow" style={{ fontSize: '0.75rem', fontWeight: 600, color: SUB, letterSpacing: '0.04em' }}>Catégories</p>
          </div>
          <div className="cats-grid">
            <Link href="?" style={{ flexShrink: 0, padding: '0.5rem 1.125rem', border: `1px solid ${!activeCategory ? A : BD}`, borderRadius: 0, fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: !activeCategory ? '#fff' : SUB, background: !activeCategory ? A : 'transparent', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              Tous
            </Link>
            {cats.map((cat: any) => {
              const isActive = activeCategory === String(cat.id);
              return (
                <Link key={cat.id} href={`?category=${cat.id}`} style={{ flexShrink: 0, padding: '0.5rem 1.125rem', border: `1px solid ${isActive ? A : BD}`, borderRadius: 0, fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: isActive ? '#fff' : SUB, background: isActive ? A : 'transparent', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!isActive) { const el = e.currentTarget; el.style.borderColor = A; el.style.color = A2; } }}
                  onMouseLeave={e => { if (!isActive) { const el = e.currentTarget; el.style.borderColor = BD; el.style.color = SUB; } }}>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" style={{ padding: '0.5rem 1.5rem 5rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 4, height: 22, background: A }} />
          <h2 style={{ fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 700, color: TXT }}>Produits</h2>
        </div>
        {products.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', border: `1px dashed ${BD}`, background: CARD }}>
            <Cpu size={40} color={BD} style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: SUB, fontSize: '0.9rem' }}>Aucun produit pour le moment</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="Voir le produit" />;
            })}
          </div>
        )}
        {countPage > 1 && (
          <div className="pagination" dir="ltr">
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 0, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: CARD, color: SUB }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, border: `1px solid ${isA ? A : BD}`, background: isA ? A : CARD, color: isA ? '#fff' : SUB }}>
                  {pn}
                </Link>
              );
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false} style={{ width: 36, height: 36, borderRadius: 0, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: CARD, color: SUB }}>❯</Link>
          </div>
        )}
      </section>
    </div>
  );
}

export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  return (
    <div dir="ltr" style={{ background: BG, paddingBottom: '4rem' }}>
      <div className="details-inner" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="gallery-container">
          <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#0E1424', border: `1px solid ${BD}` }}>
            {allImages[sel]
              ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cpu size={56} color={BD} /></div>}
            {discount > 0 && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: A, color: '#fff', padding: '3px 10px', fontSize: 12, fontWeight: 800 }}>{discount}% de réduction</div>
            )}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 0, background: 'rgba(18,25,41,0.9)', border: `1px solid ${BD}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TXT }}><ChevronRight size={16} /></button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 0, background: 'rgba(18,25,41,0.9)', border: `1px solid ${BD}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TXT }}><ChevronLeft size={16} /></button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="thumb-row">
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 58, height: 58, overflow: 'hidden', border: `1.5px solid ${sel === idx ? A : BD}`, opacity: sel === idx ? 1 : 0.55, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.18s' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="info-container">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: AL, border: `1px solid rgba(110,91,255,0.3)`, padding: '0.25rem 0.625rem', marginBottom: '0.875rem' }}>
              <Cpu size={10} color={A2} />
              <span className="eyebrow" style={{ fontSize: '0.65rem', fontWeight: 700, color: A2 }}>Appareil tech certifié</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.375rem,4vw,2rem)', fontWeight: 700, color: TXT, marginBottom: '0.625rem', lineHeight: 1.25 }}>{product.name}</h1>
            <div style={{ display: 'flex', gap: 2, marginBottom: '1.25rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={13} style={{ fill: i < 4 ? A2 : 'none', color: A2 }} />)}
            </div>
            <div style={{ background: AL, border: `1px solid rgba(110,91,255,0.25)`, padding: '0.875rem 1.125rem', marginBottom: '1.5rem' }}>
              <p className="eyebrow" style={{ fontSize: '0.65rem', color: A2, fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Prix</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span className="price-mono" style={{ fontSize: '2.5rem', fontWeight: 800, color: TXT }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: SUB }}>DA</span>
              </div>
            </div>
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: `1px solid ${selectedOffer === o.id ? A : BD}`, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? AL : 'transparent', transition: 'all 0.18s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? A : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedOffer === o.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: A }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontWeight: 600, color: TXT, fontSize: '0.875rem' }}>{o.name}</p>
                        <p style={{ fontSize: '0.72rem', color: SUB }}>Quantité : {o.quantity}</p>
                      </div>
                    </div>
                    <span className="price-mono" style={{ fontWeight: 800, color: A2, fontSize: '1.05rem' }}>{o.price.toLocaleString()} DA</span>
                  </label>
                ))}
              </div>
            )}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '1rem' }}>
                <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{attr.name}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {attr.variants.map((v: any) => {
                    const isSelected = selectedVariants[attr.name] === v.value;
                    return (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={
                        attr.displayMode === 'color' ? { width: 28, height: 28, borderRadius: '50%', background: v.value, border: `1px solid ${BD}`, cursor: 'pointer', outline: `2.5px solid ${isSelected ? A : 'transparent'}`, outlineOffset: 3 }
                        : attr.displayMode === 'image' ? { width: 42, height: 42, backgroundImage: `url(${v.value})`, backgroundSize: 'cover', backgroundPosition: 'center', border: `2px solid ${isSelected ? A : BD}`, cursor: 'pointer', transition: 'all 0.18s' }
                        : { padding: '0.375rem 0.875rem', border: `1px solid ${isSelected ? A : BD}`, borderRadius: 0, fontSize: '0.8rem', fontWeight: 600, background: isSelected ? AL : 'transparent', color: isSelected ? A2 : SUB, cursor: 'pointer', transition: 'all 0.18s' }
                      }>
                        {attr.displayMode !== 'color' && attr.displayMode !== 'image' && v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <ProductForm product={product} userId={product.store.userId} domain={domain}
              selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
            {product.desc && (
              <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: `1px solid ${BD}` }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: SUB }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div>
    {label && <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: ProductFormProps) {
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
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: any) => o.id === selectedOffer);
    if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  const getLiv = useCallback((): number => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
  const fp = getFP();
  const total = () => fp * fd.quantity + +getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'Requis';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = 'Numéro de téléphone invalide';
    if (!fd.customerWelaya) e.customerWelaya = 'Requis';
    if (!fd.customerCommune) e.customerCommune = 'Requis';
    return e;
  };
  const getVarId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const addToCart = () => {
    setIsAdded(true);
    const cart = JSON.parse(localStorage.getItem(domain) || '[]');
    cart.push({ ...fd, product, variantDetailId: getVarId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now() });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate(); if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSub(true);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`${window.location.origin}/successfully?productId=${product.id}`);
    } catch { } finally { setSub(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${BD}` }}>
        {product.store.cart && (
        <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
          <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.8rem 1rem', border: `1px solid ${isAdded ? '#22C55E' : BD}`, borderRadius: 0, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: isAdded ? 'rgba(34,197,94,0.08)' : 'transparent', color: isAdded ? '#22C55E' : SUB, transition: 'all 0.2s', fontFamily: 'inherit' }}>
            {isAdded ? <><CheckCircle2 size={14} className="anim-check" />Ajouté</> : <><ShoppingCart size={14} />Ajouter au panier</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} style={{ flex: 1, ...S.btnPrimary, width: 'auto' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; }}>
            Commander maintenant
          </button>
        </div>
      )}
      {(isOrderNow || !product.store.cart) && (
        <div className="anim-slide-fade">
          {product.store.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p className="eyebrow" style={{ fontWeight: 600, fontSize: '0.72rem', color: SUB, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Informations de livraison</p>
              <button onClick={() => setIsOrderNow(false)} style={{ fontSize: '0.8rem', color: SUB, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.customerName} label="Nom"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="Nom complet" style={inp(!!errors.customerName)} /></FR>
              <FR error={errors.customerPhone} label="Téléphone"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0XXXXXXXXX" style={inp(!!errors.customerPhone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.customerWelaya} label="Wilaya">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.customerWelaya), paddingRight: 36, fontFamily: 'inherit' }}>
                    <option value="">Choisir</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="Commune">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingRight: 36, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'Choisir'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Livraison</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.75rem', border: `1px solid ${fd.typeLivraison === t ? A : BD}`, borderRadius: 0, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? AL : 'transparent', transition: 'all 0.18s', fontFamily: 'inherit' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 4, color: fd.typeLivraison === t ? A2 : SUB }}>{t === 'home' ? 'À domicile' : 'Au bureau'}</p>
                    {selW && <p className="price-mono" style={{ fontSize: '1rem', fontWeight: 800, color: fd.typeLivraison === t ? A2 : SUB }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} DA</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Quantité</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BD}`, overflow: 'hidden' }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: SUB }}><Minus size={13} /></button>
                <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: TXT }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: A2 }}><Plus size={13} /></button>
              </div>
            </div>
            <div style={{ background: AL, border: `1px solid rgba(110,91,255,0.25)`, padding: '0.875rem 1rem', marginBottom: '1rem' }}>
              {[
                { l: 'Produit', v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
                { l: 'Livraison', v: selW ? `${getLiv().toLocaleString()} DA` : '—' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid rgba(110,91,255,0.2)` }}>
                  <span style={{ fontSize: '0.82rem', color: SUB }}>{r.l}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: TXT }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: TXT }}>Total</span>
                <span className="price-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: A2 }}>{total().toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>DA</span></span>
              </div>
            </div>
            <button type="submit" disabled={sub} style={{ ...S.btnPrimary, opacity: sub ? 0.7 : 1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; }}>
              {sub ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Traitement en cours...</> : 'Confirmer la commande'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(domain) || '[]'));
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [domain, store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLiv = () => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; };
  const cartTotal = items.reduce((a, i) => a + (i.finalPrice * i.quantity), 0);
  const finalTotal = cartTotal + +getLiv();
  const update = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!fd.customerName.trim()) er.name = 'Requis';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = 'Numéro de téléphone invalide';
    if (!fd.customerWelaya) er.w = 'Requis';
    if (!fd.customerCommune) er.c = 'Requis';
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({
        ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId,
        selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId,
        selectedVariants: i.selectedVariants, platform: i.platform || 'store',
        finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(),
        quantity: i.quantity, customerId: i.customerId || '',
        priceLoss: selW?.livraisonReturn ?? 0
      })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  if (success) return (
    <div dir="ltr" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', background: CARD, padding: '3.5rem 2rem', border: `1px solid ${BD}`, borderTop: `3px solid ${A}`, maxWidth: 460, width: '100%' }}>
        <CheckCircle2 size={40} style={{ color: '#22C55E', display: 'block', margin: '0 auto 1.25rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: TXT, marginBottom: '0.625rem' }}>Commande reçue !</h2>
        <p style={{ color: SUB, lineHeight: 1.7, marginBottom: '2rem' }}>Nous vous contacterons bientôt pour confirmer la commande.</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: A, color: '#fff', padding: '0.8rem 2rem', fontWeight: 700, fontSize: '0.9rem' }}>Retour à la boutique</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir="ltr" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: `1px dashed ${BD}`, maxWidth: 440, width: '100%', background: CARD }}>
        <ShoppingBag size={48} style={{ color: BD, display: 'block', margin: '0 auto 1.25rem' }} />
        <p style={{ color: SUB, fontSize: '0.95rem', marginBottom: '2rem' }}>Panier vide</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: A, color: '#fff', padding: '0.75rem 1.75rem', fontWeight: 700, fontSize: '0.875rem' }}>Acheter maintenant</Link>
      </div>
    </div>
  );

  return (
    <div dir="ltr" style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto', minHeight: '100vh', background: BG }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ width: 4, height: 26, background: A }} />
        <h1 style={{ fontSize: 'clamp(1.5rem,5vw,2.25rem)', fontWeight: 700, color: TXT }}>Panier</h1>
      </div>
      <div className="cart-inner">
        <div style={{ background: CARD, border: `1px solid ${BD}`, overflow: 'hidden', alignSelf: 'start' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem', borderBottom: `1px solid ${BD}` }}>
              <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 72, height: 72, objectFit: 'cover', flexShrink: 0, border: `1px solid ${BD}` }} alt="" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, color: TXT, marginBottom: '0.25rem', fontSize: '0.875rem', lineHeight: 1.4 }}>{item.product?.name}</h4>
                <p className="price-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: A2 }}>{item.finalPrice?.toLocaleString()} DA</p>
                <p style={{ fontSize: '0.72rem', color: SUB, marginTop: '0.2rem' }}>Quantité : {item.quantity}</p>
              </div>
              <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ color: '#4B5468', padding: '0.375rem', borderRadius: 0, background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center', transition: 'color 0.18s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#EF4444')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#4B5468')}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <div style={{ padding: '0.875rem', background: AL, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: SUB, fontSize: '0.875rem' }}>Sous-total</span>
            <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: A2 }}>{cartTotal.toLocaleString()} DA</span>
          </div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BD}`, overflow: 'hidden', padding: '1.5rem', alignSelf: 'start' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: TXT, marginBottom: '1.25rem' }}>Informations de livraison</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.name} label="Nom"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={inp(!!errors.name)} /></FR>
              <FR error={errors.phone} label="Téléphone"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={inp(!!errors.phone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.w} label="Wilaya">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.w), paddingRight: 34, fontFamily: 'inherit' }}>
                    <option value="">Choisir</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label="Commune">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingRight: 34, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? '...' : 'Choisir'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ margin: '1rem 0' }}>
              <p className="eyebrow" style={{ fontSize: '0.72rem', fontWeight: 600, color: SUB, textTransform: 'uppercase' as const, marginBottom: '0.5rem', letterSpacing: '0.06em' }}>Type de livraison</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.75rem', border: `1px solid ${fd.typeLivraison === t ? A : BD}`, borderRadius: 0, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? AL : 'transparent', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.78rem', color: fd.typeLivraison === t ? A2 : SUB }}>{t === 'home' ? 'À domicile' : 'Au bureau'}</p>
                    {selW && <p className="price-mono" style={{ fontWeight: 800, fontSize: '0.9rem', color: fd.typeLivraison === t ? A2 : SUB, marginTop: 2 }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} DA</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: AL, border: `1px solid rgba(110,91,255,0.25)`, padding: '0.875rem 1rem', margin: '1rem 0' }}>
              {[
                { l: 'Sous-total', v: `${cartTotal.toLocaleString()} DA` },
                { l: 'Livraison', v: getLiv() ? `${getLiv().toLocaleString()} DA` : '—' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid rgba(110,91,255,0.15)` }}>
                  <span style={{ fontSize: '0.78rem', color: SUB }}>{r.l}</span>
                  <span style={{ fontWeight: 600, color: TXT, fontSize: '0.875rem' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, color: TXT }}>Total</span>
                <span className="price-mono" style={{ fontSize: '2rem', fontWeight: 800, color: A2 }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>DA</span></span>
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; }}>
              {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Traitement en cours...</> : 'Confirmer la commande'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const Shell = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div dir="ltr" style={{ minHeight: '100vh', background: BG }}>
    <div style={{ background: CARD, paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, borderBottom: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: AL, border: `1px solid rgba(110,91,255,0.3)`, padding: '0.3rem 0.875rem', marginBottom: '1rem' }}>
          <Cpu size={11} color={A2} />
          <span className="eyebrow" style={{ fontSize: '0.65rem', fontWeight: 600, color: A2 }}>Tech Innovation</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: TXT, letterSpacing: '-0.02em' }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>{children}</div>
  </div>
);

const InfoBlock = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding: '1.25rem 0', borderBottom: `1px solid ${BD}`, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
    <div style={{ width: 3, height: 16, background: A, flexShrink: 0, marginTop: 4 }} />
    <div>
      <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: TXT, marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: SUB }}>{body}</p>
    </div>
  </div>
);

export function Privacy() {
  return (
    <Shell title="Politique de confidentialité">
      <div style={{ background: CARD, padding: '1.75rem', border: `1px solid ${BD}` }}>
        <InfoBlock title="Les données que nous collectons" body="Nous collectons uniquement les informations nécessaires au traitement de vos commandes : nom, téléphone et adresse de livraison." />
        <InfoBlock title="Protection des données" body="Toutes les données sont stockées de manière chiffrée et sécurisée. Nous utilisons des protocoles de protection avancés." />
        <InfoBlock title="Partage des informations" body="Nous ne vendons ni ne partageons vos données avec des tiers, à l'exception de nos partenaires de livraison." />
      </div>
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="Conditions d'utilisation">
      <div style={{ background: CARD, padding: '1.75rem', border: `1px solid ${BD}` }}>
        <InfoBlock title="Compte et responsabilité" body="L'utilisateur est responsable de l'exactitude des données saisies et de la confidentialité des informations de son compte." />
        <InfoBlock title="Commandes et paiements" body="Les commandes sont confirmées par téléphone avant l'expédition. Les prix affichés sont les prix définitifs." />
        <InfoBlock title="Loi applicable" body="Toutes les transactions sont soumises aux lois en vigueur en République Algérienne Démocratique et Populaire." />
      </div>
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="Cookies">
      <div style={{ background: CARD, padding: '1.75rem', border: `1px solid ${BD}` }}>
        <InfoBlock title="Fichiers essentiels" body="Nous utilisons les cookies essentiels au bon fonctionnement du panier et à la sécurité de la session." />
        <InfoBlock title="Amélioration de l'expérience" body="Nous utilisons certains fichiers pour analyser l'interaction des utilisateurs avec la boutique afin d'améliorer nos services." />
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
    catch { showError("Une erreur s'est produite lors de l'envoi"); } finally { setLoading(false); }
  };

  return (
    <div dir="ltr" style={{ background: BG, minHeight: '100vh' }}>
      <div style={{ background: CARD, paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, borderBottom: `1px solid ${BD}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: TXT, marginBottom: '0.5rem' }}>Contactez-nous</h1>
          <p style={{ color: SUB, fontSize: '0.9375rem' }}>Notre équipe technique est disponible pour répondre à vos questions</p>
        </div>
      </div>
      <div className="contact-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div>
          <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '1.5rem', marginBottom: '1rem' }}>
            {[
              { icon: <Phone size={15} />, label: 'Téléphone', val: store?.contact?.phone || 'Non disponible' },
              { icon: <MapPin size={15} />, label: 'Emplacement', val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || 'Algérie' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                <div style={{ width: 38, height: 38, background: AL, border: `1px solid rgba(110,91,255,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A2, flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <p className="eyebrow" style={{ fontSize: '0.65rem', color: SUB, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '0.15rem' }}>{r.label}</p>
                  <p style={{ fontWeight: 600, color: TXT, fontSize: '0.875rem' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: AL, border: `1px solid rgba(110,91,255,0.25)`, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: A2 }}>Réponse sous une heure</span>
          </div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '2rem', overflow: 'hidden', position: 'relative' as const }}>
          <div style={{ height: 2, background: `linear-gradient(90deg, ${A}, ${A2})`, position: 'absolute', top: 0, left: 0, right: 0 }} />
          {sent ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <CheckCircle2 size={40} style={{ color: '#22C55E', display: 'block', margin: '0 auto 1.25rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: TXT, marginBottom: '0.5rem' }}>Envoyé !</h2>
              <p style={{ color: SUB, lineHeight: 1.7, marginBottom: '2rem' }}>Nous vous répondrons dans les plus brefs délais.</p>
              <button onClick={() => setSent(false)} style={{ padding: '0.75rem 1.75rem', borderRadius: 0, border: `1px solid ${A}`, background: AL, color: A2, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}>Envoyer un autre message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                <div>
                  <label className="eyebrow" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Nom</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={S.input} />
                </div>
                <div>
                  <label className="eyebrow" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Téléphone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={S.input} />
                </div>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <label className="eyebrow" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>E-mail</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={S.input} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="eyebrow" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: SUB, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Message</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...S.input, resize: 'none' }} />
              </div>
              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = AD; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = A; }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Envoi en cours...</> : <>Envoyer le message <ArrowRight size={16} /></>}
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
      {p === 'privacy' && <Privacy />}
      {p === 'terms' && <Terms />}
      {p === 'cookies' && <Cookies />}
      {p === 'contact' && <Contact store={store} />}
    </>
  );
}

