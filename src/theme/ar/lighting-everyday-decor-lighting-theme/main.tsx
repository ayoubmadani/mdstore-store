'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { useCartStore } from '@/store/useCartStore';
import {
  Search, ShoppingCart, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  Star, MapPin, Phone, Mail, Trash2, AlertCircle, Lightbulb, Sun, Sparkles,
  Truck, ShieldCheck, Headphones, BadgeCheck, Plus, Minus, Home as HomeIcon,
} from 'lucide-react';

/* ============================================================
   THEME: "Everyday Decor & Lighting" — Arabic RTL
   Personality: warm, cozy, glowing. Every hover feels like a
   light switching on. Rounded silhouettes, soft amber halo.
   ============================================================ */

/* ---------------- 1. Types ---------------- */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string; slug?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}

/* ---------------- 2. Design Tokens ---------------- */
const BG = '#FFFCF7';
const CARD = '#FFFFFF';
const SURFACE = '#FFF6EA';
const TXT = '#2B2118';
const SUB = '#8C7A67';
const BD = '#F0E2CC';
const A = '#E8A33D';
const AD = '#C7842A';
const AL = '#FDF1DD';
const ERR = '#EF4444';
const HEAD_FONT = "'Tajawal', 'Segoe UI', sans-serif";
const BODY_FONT = "'Almarai', 'Segoe UI', sans-serif";

/* ---------------- 3. Helpers / Fixed API ---------------- */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
const PHONE_RE = /^(0|\+213)[5-7]\d{8}$/;

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

function getVarId(product: Product, selectedVariants: Record<string, string>): string | number | null {
  if (!product.variantDetails || product.variantDetails.length === 0) return null;
  const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
  return match ? match.id : null;
}

async function fetchWilayas(uid: string): Promise<Wilaya[]> {
  if (!uid) return [];
  try {
    const res = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchCommunes(wid: string): Promise<Commune[]> {
  if (!wid) return [];
  try {
    const res = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function fmtPrice(n: number, currency?: string) {
  return `${Math.round(n).toLocaleString('fr-FR')} ${currency || 'دج'}`;
}

/* ---------------- 4. Shared bits ---------------- */
const PlaceholderIcon = ({ size = 40, color = BD }: { size?: number; color?: string }) => (
  <Lightbulb size={size} color={color} strokeWidth={1.5} />
);

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  fontSize: '0.9rem',
  border: `1px solid ${BD}`,
  borderRadius: 12,
  background: SURFACE,
  color: TXT,
  outline: 'none',
  appearance: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: BODY_FONT,
  minHeight: 44,
  boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '0.875rem 1.5rem', minHeight: 44, background: A, color: '#FFFFFF',
  fontWeight: 700, fontSize: '0.9rem', border: 'none', borderRadius: 999,
  cursor: 'pointer', transition: 'all 0.2s', fontFamily: HEAD_FONT, width: '100%',
};

const btnSecondary: React.CSSProperties = {
  ...btnPrimary, background: 'transparent', color: AD, border: `1.5px solid ${A}`,
};

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: TXT, marginBottom: 6, fontFamily: HEAD_FONT }}>{label}</label>
      {children}
      {error && (
        <p style={{ fontSize: '0.75rem', color: ERR, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4, fontFamily: BODY_FONT }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function SummaryRow({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '0.5rem 0' }}>
      <span style={{ flexShrink: 0, color: SUB, fontSize: '0.88rem', fontFamily: BODY_FONT }}>{l}</span>
      <span style={{ whiteSpace: 'nowrap', fontWeight: strong ? 800 : 600, color: TXT, fontFamily: HEAD_FONT, fontSize: strong ? '1.05rem' : '0.9rem' }}>{v}</span>
    </div>
  );
}

/* ---------------- 5. Global Theme CSS ---------------- */
const THEME_CSS = `
@keyframes fadeUp { from { opacity:0; transform:translateY(24px);} to { opacity:1; transform:translateY(0);} }
@keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
@keyframes scaleIn { from { opacity:0; transform:scale(0.92);} to { opacity:1; transform:scale(1);} }
@keyframes float { 0%,100% { transform:translateY(0px);} 50% { transform:translateY(-10px);} }
@keyframes glowPulse { 0%,100% { box-shadow:0 0 0 0 rgba(232,163,61,0.35);} 50% { box-shadow:0 0 0 14px rgba(232,163,61,0);} }
@keyframes shimmer { 0% { background-position:-400px 0;} 100% { background-position:400px 0;} }
@keyframes badgeBounce { 0% { transform:scale(1);} 40% { transform:scale(1.4);} 70% { transform:scale(0.9);} 100% { transform:scale(1);} }
@keyframes haloSpin { from { transform:rotate(0deg);} to { transform:rotate(360deg);} }

.mds-wrap * { box-sizing:border-box; }
.mds-wrap { background:${BG}; color:${TXT}; font-family:${BODY_FONT}; min-height:100vh; }
.mds-container { max-width:1280px; margin:0 auto; padding:0 1.25rem; }

.mds-navlinks { display:flex; align-items:center; gap:28px; }
.mds-burger { display:none; }
@media (max-width:1024px) {
  .mds-navlinks { display:none; }
  .mds-burger { display:flex; }
}

.mds-navlink { position:relative; font-family:${HEAD_FONT}; font-weight:700; font-size:0.92rem; color:${TXT}; text-decoration:none; }
.mds-navlink::after { content:''; position:absolute; bottom:-6px; right:0; left:0; height:2px; background:${A}; transform:scaleX(0); transition:transform .25s ease; }
.mds-navlink:hover::after, .mds-navlink.active::after { transform:scaleX(1); }

.mds-search-drop { position:absolute; top:calc(100% + 8px); left:0; width:340px; background:${CARD}; border:1px solid ${BD}; border-radius:16px; box-shadow:0 20px 40px rgba(43,33,24,0.14); max-height:380px; overflow-y:auto; z-index:60; animation: fadeUp .25s ease both; }
@media (max-width:480px) {
  .mds-search-drop { position:fixed; left:12px; right:12px; top:64px; width:auto; }
}

.mds-cat-pill { font-family:${HEAD_FONT}; font-weight:700; font-size:0.85rem; padding:0.55rem 1.1rem; border-radius:999px; border:1.5px solid ${BD}; color:${SUB}; text-decoration:none; white-space:nowrap; transition:all .2s ease; }
.mds-cat-pill.active, .mds-cat-pill:hover { background:${A}; border-color:${A}; color:#fff; }

.mds-products-grid { display:grid; grid-template-columns:1fr; gap:1.1rem; }
@media (min-width:640px)  { .mds-products-grid { grid-template-columns:repeat(2,1fr); } }
@media (min-width:1024px) { .mds-products-grid { grid-template-columns:repeat(3,1fr); } }
@media (min-width:1280px) { .mds-products-grid { grid-template-columns:repeat(4,1fr); } }

.mds-card { background:${CARD}; border-radius:22px; overflow:hidden; border:1px solid ${BD}; animation:fadeUp .5s ease both; transition:transform .28s cubic-bezier(.22,.68,0,1.2), box-shadow .28s ease; text-decoration:none; color:inherit; display:block; }
.mds-card:hover { transform:translateY(-6px); box-shadow:0 22px 44px rgba(232,163,61,0.22); }
.mds-card-imgwrap { position:relative; aspect-ratio:1/1; overflow:hidden; background:${SURFACE}; display:flex; align-items:center; justify-content:center; }
.mds-card-imgwrap img { transition:transform .5s ease, filter .5s ease; }
.mds-card:hover .mds-card-imgwrap img { transform:scale(1.08); filter:brightness(1.04); }
.mds-card:hover .mds-card-imgwrap { box-shadow:inset 0 0 60px rgba(232,163,61,0.18); }

.mds-btn-primary:hover { background:${AD}; transform:translateY(-2px); box-shadow:0 10px 22px rgba(199,132,42,0.3); }
.mds-btn-primary:active { transform:translateY(0) scale(0.97); }
.mds-btn-primary:disabled { opacity:0.55; cursor:not-allowed; transform:none; box-shadow:none; }
.mds-btn-secondary:hover { background:${AL}; }

.mds-input:focus { border-color:${A} !important; box-shadow:0 0 0 3px rgba(232,163,61,0.16); }

.mds-hero-badge { animation: scaleIn .5s ease .5s both; }
.mds-hero-title { animation: fadeUp .7s ease .1s both; }
.mds-hero-sub { animation: fadeUp .7s ease .25s both; }
.mds-hero-cta { animation: fadeUp .7s ease .4s both; }
.mds-hero-glow { animation: float 5s ease-in-out infinite; }
.mds-hero-halo { animation: glowPulse 2.6s ease-in-out infinite; }

.mds-skeleton { background:linear-gradient(90deg,#F2E7D4 25%,#FBF3E4 50%,#F2E7D4 75%); background-size:400px 100%; animation:shimmer 1.4s infinite linear; border-radius:16px; }

.mds-badge-bounce { animation: badgeBounce .4s ease; }

.mds-attr-swatch { width:34px; height:34px; border-radius:50%; border:2px solid ${BD}; cursor:pointer; transition:transform .15s ease, border-color .15s ease; }
.mds-attr-swatch.active { border-color:${A}; transform:scale(1.12); box-shadow:0 0 0 3px ${AL}; }

.mds-gallery-thumb { border-radius:12px; overflow:hidden; border:2px solid transparent; cursor:pointer; transition:border-color .2s ease; }
.mds-gallery-thumb.active { border-color:${A}; }

.mds-page-fade { animation: fadeIn .35s ease both; }

@media (prefers-reduced-motion: reduce) {
  .mds-wrap * { animation-duration:0.01ms !important; animation-iteration-count:1 !important; }
}
`;

/* ============================================================
   MAIN
   ============================================================ */
export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div className="mds-wrap" dir="rtl">
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main style={{ opacity: visible ? 1 : 0, transition: 'opacity .3s ease', minHeight: '60vh' }}>
        {children}
      </main>
      <Footer store={store} />
    </div>
  );
}

/* ============================================================
   NAVBAR
   ============================================================ */
export function Navbar({ store, domain }: any) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [bounce, setBounce] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch {
      initCount(0);
    }
  }, [domain, initCount]);

  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 400);
    return () => clearTimeout(t);
  }, [count]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) {
      setListSearch([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setListSearch(Array.isArray(data) ? data : data?.products || []);
      } catch {
        setListSearch([]);
      } finally {
        setLoading(false);
      }
    }, 380);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, domain]);

  const submitSearch = () => {
    if (searchQuery.trim()) router.push(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  const mobileLinks = [
    { h: '/', l: 'الرئيسية' },
    { h: '/contact', l: 'تواصل معنا' },
  ];

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: scrolled ? 'rgba(255,252,247,0.92)' : BG,
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: `1px solid ${scrolled ? BD : 'transparent'}`,
        transition: 'all .25s ease',
      }}
    >
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: A, color: '#fff', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, padding: '0.4rem', fontFamily: HEAD_FONT }}>
          {store.topBar.text}
        </div>
      )}

      <div className="mds-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.25rem', gap: 16 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {store?.design?.logoUrl && !imgError ? (
            <img src={store.design.logoUrl} alt={store?.name} onError={() => setImgError(true)}
              style={{ height: 42, width: 42, borderRadius: 12, objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{
              height: 42, width: 42, borderRadius: 12, background: AL, color: AD,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: HEAD_FONT, fontSize: '1.1rem',
            }}>
              {(store?.name || 'M').charAt(0)}
            </div>
          )}
          <span style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.15rem', color: TXT }}>{store?.name}</span>
        </Link>

        <nav className="mds-navlinks">
          <Link href="/" className="mds-navlink">الرئيسية</Link>
          <Link href="/contact" className="mds-navlink">تواصل معنا</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSearch((v) => !v)}
              aria-label="بحث"
              style={{ background: SURFACE, border: `1px solid ${BD}`, borderRadius: 999, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Search size={18} color={TXT} />
            </button>
            {showSearch && (
              <div style={{ position: 'absolute', top: 'calc(100% + 10px)', left: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', background: CARD, border: `1px solid ${BD}`, borderRadius: 999, padding: '4px 6px 4px 14px', boxShadow: '0 12px 30px rgba(43,33,24,0.12)' }}>
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                    placeholder="ابحث عن منتج..."
                    style={{ border: 'none', outline: 'none', background: 'transparent', width: 200, fontSize: '0.88rem', fontFamily: BODY_FONT, color: TXT }}
                  />
                  <button onClick={submitSearch} style={{ background: A, border: 'none', borderRadius: 999, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Search size={14} color="#fff" />
                  </button>
                </div>
                {(searchQuery.trim().length >= 2) && (
                  <div className="mds-search-drop">
                    {loading ? (
                      <div style={{ padding: 16 }}>
                        {[...Array(3)].map((_, i) => <div key={i} className="mds-skeleton" style={{ height: 46, marginBottom: 8 }} />)}
                      </div>
                    ) : listSearch.length === 0 ? (
                      <p style={{ padding: 18, color: SUB, fontSize: '0.85rem', textAlign: 'center' }}>لا توجد نتائج</p>
                    ) : (
                      <>
                        {listSearch.slice(0, 6).map((p) => (
                          <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={() => setShowSearch(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', textDecoration: 'none', color: TXT, borderBottom: `1px solid ${BD}` }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: SURFACE, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {(p.productImage || p.imagesProduct?.[0]?.imageUrl) ? (
                                <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : <PlaceholderIcon size={18} />}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</span>
                          </Link>
                        ))}
                        <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearch(false)}
                          style={{ display: 'block', textAlign: 'center', padding: '12px', color: AD, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', fontFamily: HEAD_FONT }}>
                          عرض كل النتائج
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {store?.cart !== false && (
            <Link href="/cart" aria-label="السلة" style={{ position: 'relative', background: SURFACE, border: `1px solid ${BD}`, borderRadius: 999, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} color={TXT} />
              {count > 0 && (
                <span className={bounce ? 'mds-badge-bounce' : ''} style={{
                  position: 'absolute', top: -4, left: -4, background: A, color: '#fff',
                  fontSize: '0.65rem', fontWeight: 800, borderRadius: 999, minWidth: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                }}>{count}</span>
              )}
            </Link>
          )}

          <button className="mds-burger" onClick={() => setOpen(true)} aria-label="القائمة"
            style={{ background: SURFACE, border: `1px solid ${BD}`, borderRadius: 999, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Menu size={18} color={TXT} />
          </button>
        </div>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(43,33,24,0.4)', animation: 'fadeIn .2s ease both' }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            position: 'absolute', top: 0, right: 0, height: '100%', width: 280, background: CARD,
            padding: '1.5rem', animation: 'fadeUp .3s ease both', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontFamily: HEAD_FONT, fontWeight: 800 }}>القائمة</span>
              <button onClick={() => setOpen(false)} style={{ background: SURFACE, border: 'none', borderRadius: 999, width: 36, height: 36, cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mobileLinks.map((l) => (
                <Link key={l.h} href={l.h} onClick={() => setOpen(false)} style={{
                  padding: '0.9rem 1rem', borderRadius: 12, textDecoration: 'none', color: TXT,
                  fontFamily: HEAD_FONT, fontWeight: 700, background: SURFACE, display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <HomeIcon size={16} color={A} /> {l.l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
export function Footer({ store }: any) {
  const year = new Date().getFullYear();
  const links = [
    { h: '/', l: 'الرئيسية' },
    { h: '/cart', l: 'السلة' },
    { h: '/contact', l: 'تواصل معنا' },
    { h: '/privacy', l: 'سياسة الخصوصية' },
    { h: '/terms', l: 'الشروط والأحكام' },
  ].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);

  return (
    <footer style={{ background: SURFACE, borderTop: `1px solid ${BD}`, marginTop: 60 }}>
      <div className="mds-container" style={{ padding: '3rem 1.25rem 2rem', display: 'grid', gap: '2rem', gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr' }} className="mds-footer-grid">
          <style>{`@media (min-width:768px){.mds-footer-grid{grid-template-columns:1.3fr 1fr 1fr !important;}}`}</style>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Lightbulb size={20} color={A} />
              <span style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.1rem' }}>{store?.name}</span>
            </div>
            <p style={{ color: SUB, fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 320 }}>
              {store?.hero?.subtitle || 'إضاءة وديكور يومي يضيء زوايا منزلك بدفء وأناقة.'}
            </p>
            <p style={{ color: SUB, fontSize: '0.8rem', marginTop: 14 }}>© {year} {store?.name}. جميع الحقوق محفوظة.</p>
          </div>
          <div>
            <h4 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '0.95rem', marginBottom: 14 }}>روابط سريعة</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((l) => (
                <Link key={l.h} href={l.h} style={{ color: SUB, textDecoration: 'none', fontSize: '0.88rem' }}>{l.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '0.95rem', marginBottom: 14 }}>تواصل معنا</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {store?.contact?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: SUB, fontSize: '0.85rem' }}>
                  <Phone size={15} color={A} /> {store.contact.phone}
                </div>
              )}
              {store?.contact?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: SUB, fontSize: '0.85rem' }}>
                  <Mail size={15} color={A} /> {store.contact.email}
                </div>
              )}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: SUB, fontSize: '0.85rem' }}>
                  <MapPin size={15} color={A} /> {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' - ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   CARD
   ============================================================ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;
  const price = Number(product.price);
  const original = Number(product.priceOriginal);

  return (
    <Link href={`/product/${product.slug || product.id}`} className="mds-card">
      <div className="mds-card-imgwrap">
        {img && !imgErr ? (
          <img src={img} alt={product.name} onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlaceholderIcon size={44} color={BD} />
          </div>
        )}
        {discount > 0 && (
          <span style={{
            position: 'absolute', top: 12, insetInlineStart: 12, background: A, color: '#fff',
            fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 999, fontFamily: HEAD_FONT,
          }}>
            -{discount}%
          </span>
        )}
      </div>
      <div style={{ padding: '1rem 1.1rem 1.15rem' }}>
        <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={A} color={A} />)}
        </div>
        <h3 style={{
          fontFamily: HEAD_FONT, fontWeight: 700, fontSize: '0.95rem', color: TXT, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 44,
        }}>{product.name}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
          <span style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.05rem', color: AD }}>{fmtPrice(price, store?.currency)}</span>
          {original > price && (
            <span style={{ fontSize: '0.8rem', color: SUB, textDecoration: 'line-through' }}>{fmtPrice(original, store?.currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   HOME
   ============================================================ */
export function Home({ store, page }: any) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const currentPage = page || Number(searchParams.get('page')) || 1;
  const cats = store?.categories || [];
  const products: Product[] = store?.products || [];
  const countPage = Math.max(1, Math.ceil((store?.count || products.length || 0) / 48));

  const buildHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    return `?${params.toString()}`;
  };

  return (
    <div className="mds-page-fade">
      {/* HERO — full-section background image with overlay */}
      <section style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, ${SURFACE} 0%, ${BG} 60%)`, paddingTop: '3rem' }}>
        {store?.hero?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,252,247,0.82) 0%, rgba(43,33,24,0.55) 100%)' }} />
          </div>
        )}
        <div className="mds-container" style={{
          display: 'flex', alignItems: 'center',
          minHeight: 'clamp(420px, 60vh, 640px)', padding: '1rem 1.25rem 3rem', position: 'relative', zIndex: 1,
        }}>
          <div style={{ maxWidth: 600 }}>
            <span className="mds-hero-badge" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, background: AL, color: AD,
              padding: '0.4rem 0.9rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 800, fontFamily: HEAD_FONT, marginBottom: 18,
            }}>
              <Sparkles size={13} /> ديكور وإضاءة يومية
            </span>
            <h1 className="mds-hero-title" style={{
              fontFamily: HEAD_FONT, fontWeight: 800, color: TXT, margin: 0,
              fontSize: 'clamp(1.9rem, 5.5vw, 3.6rem)', lineHeight: 1.15,
            }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || 'أضِف دفئاً لبيتك مع كل مصباح') }}
            />
            <p className="mds-hero-sub" style={{ color: SUB, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', marginTop: 16, maxWidth: 460, lineHeight: 1.8 }}>
              {store?.hero?.subtitle || 'مصابيح طاولة، إضاءة ليلية، وتحف زخرفية مختارة لتضيء تفاصيل يومك.'}
            </p>
            <div className="mds-hero-cta" style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <a href="#products" className="mds-btn-primary" style={{ ...btnPrimary, width: 'auto', padding: '0.9rem 2rem' }}>تسوق الآن</a>
              {store?.cart !== false && (
                <Link href="/cart" className="mds-btn-secondary" style={{ ...btnSecondary, width: 'auto', padding: '0.9rem 2rem' }}>السلة</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, background: CARD }}>
        <div className="mds-container" style={{
          display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.5rem', padding: '1.75rem 1.25rem',
        }}>
          <style>{`@media (min-width:768px){.mds-trust{grid-template-columns:repeat(4,1fr) !important;}}`}</style>
          <div className="mds-trust" style={{ display: 'contents' }}>
            {[
              { icon: Truck, t: 'توصيل سريع', s: 'لكل الولايات' },
              { icon: ShieldCheck, t: 'جودة موثوقة', s: 'منتجات مختارة' },
              { icon: BadgeCheck, t: 'دفع عند الاستلام', s: 'أمان تام' },
              { icon: Headphones, t: 'دعم متواصل', s: 'نحن هنا لأجلك' },
            ].map((it) => (
              <div key={it.t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <it.icon size={19} color={AD} />
                </div>
                <div>
                  <p style={{ fontFamily: HEAD_FONT, fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{it.t}</p>
                  <p style={{ color: SUB, fontSize: '0.75rem', margin: 0 }}>{it.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <section className="mds-container" style={{ padding: '2rem 1.25rem 0.5rem', display: 'flex', gap: 10, overflowX: 'auto' }}>
          <Link href="/" className={`mds-cat-pill ${!activeCategory ? 'active' : ''}`}>الكل</Link>
          {cats.map((cat: any) => (
            <Link key={cat.id} href={`?category=${cat.id}`} className={`mds-cat-pill ${activeCategory === String(cat.id) ? 'active' : ''}`}>
              {cat.name}
            </Link>
          ))}
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" className="mds-container" style={{ padding: '2rem 1.25rem 3rem' }}>
        <h2 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.5rem', marginBottom: 20 }}>منتجاتنا المضيئة</h2>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: SUB }}>
            <Lightbulb size={48} color={BD} style={{ marginBottom: 12 }} />
            <p>لا توجد منتجات حالياً</p>
          </div>
        ) : (
          <div className="mds-products-grid">
            {products.map((p) => {
              const price = Number(p.price);
              const original = Number(p.priceOriginal);
              const discount = original > 0 && original > price ? Math.round(((original - price) / original) * 100) : 0;
              return (
                <Card key={p.id} product={p} discount={discount} store={store}
                  displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} />
              );
            })}
          </div>
        )}

        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40, flexWrap: 'wrap' }}>
            {[...Array(countPage)].map((_, i) => {
              const p = i + 1;
              const active = p === currentPage;
              return (
                <Link key={p} href={buildHref(p)} scroll={false} style={{
                  width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: HEAD_FONT, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
                  background: active ? A : CARD, color: active ? '#fff' : TXT, border: `1px solid ${active ? A : BD}`,
                }}>{p}</Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   DETAILS
   ============================================================ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  const images: string[] = allImages && allImages.length > 0 ? allImages : (product.productImage ? [product.productImage] : []);

  return (
    <div className="mds-container mds-page-fade" style={{ padding: '2rem 1.25rem 4rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }} className="mds-details-inner">
        <style>{`@media (min-width:768px){.mds-details-inner{grid-template-columns:1fr 1fr !important;}}`}</style>

        <div>
          <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', background: SURFACE, aspectRatio: '1/1', boxShadow: '0 20px 50px rgba(232,163,61,0.15)' }}>
            {images.length > 0 ? (
              <img src={images[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlaceholderIcon size={70} />
              </div>
            )}
            {discount > 0 && (
              <span style={{ position: 'absolute', top: 16, insetInlineStart: 16, background: A, color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '5px 12px', borderRadius: 999, fontFamily: HEAD_FONT }}>
                -{discount}%
              </span>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setSel((s) => (s - 1 + images.length) % images.length)}
                  style={{ position: 'absolute', top: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: 999, width: 38, height: 38, cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}>
                  <ChevronRight size={18} />
                </button>
                <button onClick={() => setSel((s) => (s + 1) % images.length)}
                  style={{ position: 'absolute', top: '50%', insetInlineEnd: 12, transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: 999, width: 38, height: 38, cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}>
                  <ChevronLeft size={18} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 14, overflowX: 'auto' }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setSel(i)} className={`mds-gallery-thumb ${i === sel ? 'active' : ''}`} style={{ width: 68, height: 68, flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', margin: 0 }}>{product.name}</h1>
          <div style={{ display: 'flex', gap: 3, margin: '10px 0' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={15} fill={A} color={A} />)}
          </div>
          <div style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.8rem', color: AD, marginBottom: 20 }}>
            {fmtPrice(finalPrice, "DZ")}
          </div>

          {product.offers && product.offers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: HEAD_FONT, fontWeight: 700, fontSize: '0.88rem', marginBottom: 10 }}>العروض المتاحة</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o: Offer) => (
                  <label key={o.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0.75rem 1rem',
                    borderRadius: 14, border: `1.5px solid ${selectedOffer === o.id ? A : BD}`,
                    background: selectedOffer === o.id ? AL : CARD, cursor: 'pointer',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600 }}>
                      <input type="radio" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                      {o.name} ({o.quantity})
                    </span>
                    <span style={{ fontFamily: HEAD_FONT, fontWeight: 800, color: AD }}>{fmtPrice(o.price, "DZ")}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {allAttrs && allAttrs.length > 0 && allAttrs.map((attr: Attribute) => (
            <div key={attr.id} style={{ marginBottom: 18 }}>
              <p style={{ fontFamily: HEAD_FONT, fontWeight: 700, fontSize: '0.88rem', marginBottom: 10 }}>{attr.name}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {attr.variants.map((v) => {
                  const active = selectedVariants[attr.name] === v.value;
                  if (attr.displayMode === 'color') {
                    return (
                      <div key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                        className={`mds-attr-swatch ${active ? 'active' : ''}`} style={{ background: v.value }} title={v.name} />
                    );
                  }
                  if (attr.displayMode === 'image') {
                    return (
                      <div key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)}
                        className={`mds-gallery-thumb ${active ? 'active' : ''}`} style={{ width: 52, height: 52 }}>
                        <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    );
                  }
                  return (
                    <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{
                      padding: '0.5rem 1rem', borderRadius: 10, border: `1.5px solid ${active ? A : BD}`,
                      background: active ? AL : CARD, color: active ? AD : TXT, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: HEAD_FONT,
                    }}>{v.name}</button>
                  );
                })}
              </div>
            </div>
          ))}

          <ProductForm
            product={product}
            userId={product?.store?.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
          />

          {product.desc && (
            <div style={{ marginTop: 30, paddingTop: 24, borderTop: `1px solid ${BD}` }}>
              <h3 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1rem', marginBottom: 10 }}>الوصف</h3>
              <div style={{ color: SUB, fontSize: '0.9rem', lineHeight: 1.9 }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PRODUCT FORM
   ============================================================ */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });

  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    if (userId) fetchWilayas(userId).then(setWilayas);
  }, [userId]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

  const getFP = useCallback((): number => {
    if (selectedOffer) {
      const o = product.offers?.find((of) => of.id === selectedOffer);
      if (o) return o.price;
    }
    const match = product.variantDetails?.find((d) => variantMatches(d, selectedVariants));
    if (match && match.price !== -1) return match.price;
    return Number(product.price);
  }, [selectedOffer, product, selectedVariants]);

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const fp = getFP();
  const total = () => fp * fd.quantity + getLiv();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!PHONE_RE.test(fd.customerPhone)) e.customerPhone = 'رقم هاتف غير صحيح';
    if (!fd.customerWelaya) e.customerWelaya = 'الولاية مطلوبة';
    if (!fd.customerCommune) e.customerCommune = 'البلدية مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    ...fd,
    product,
    productId: product.id,
    storeId: product.store.id,
    userId,
    variantDetailId: getVarId(product, selectedVariants),
    selectedOffer,
    selectedVariants,
    platform: platform || 'web',
    finalPrice: fp,
    totalPrice: total(),
    priceLivraison: getLiv(),
    addedAt: new Date().toISOString(),
  });

  const addToCart = () => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      arr.push(buildPayload());
      localStorage.setItem(domain, JSON.stringify(arr));
      initCount(arr.length);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch {
      // ignore
    }
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = buildPayload();
      const res = await fetch(`${API_URL}/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.customerId) localStorage.setItem('customerId', data.customerId);
      router.push(`/successfully?productId=${product.id}`);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <span style={{ fontFamily: HEAD_FONT, fontWeight: 700, fontSize: '0.85rem' }}>الكمية</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', border: `1.5px solid ${BD}`, borderRadius: 999, overflow: 'hidden' }}>
          <button onClick={() => setFd((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
            style={{ width: 36, height: 36, border: 'none', background: SURFACE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Minus size={14} />
          </button>
          <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontFamily: HEAD_FONT }}>{fd.quantity}</span>
          <button onClick={() => setFd((f) => ({ ...f, quantity: f.quantity + 1 }))}
            style={{ width: 36, height: 36, border: 'none', background: SURFACE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {product?.store?.cart === true && !isOrderNow && (
          <button onClick={addToCart} className="mds-btn-secondary" style={{ ...btnSecondary, width: 'auto', flex: 1 }}>
            {added ? 'تمت الإضافة ✓' : 'أضف إلى السلة'}
          </button>
        )}
        {!isOrderNow && (
          <button onClick={() => setIsOrderNow(true)} className="mds-btn-primary" style={{ ...btnPrimary, width: 'auto', flex: 1 }}>
            اطلب الآن
          </button>
        )}
      </div>

      {isOrderNow && (
        <div style={{ marginTop: 22, borderTop: `1px solid ${BD}`, paddingTop: 22 }}>

          <FormField label="الاسم الكامل" error={errors.customerName}>
            <input className="mds-input" style={inputBase} value={fd.customerName}
              onChange={(e) => setFd((f) => ({ ...f, customerName: e.target.value }))} placeholder="مثال: أحمد بن علي" />
          </FormField>
          <FormField label="رقم الهاتف" error={errors.customerPhone}>
            <input className="mds-input" style={inputBase} value={fd.customerPhone}
              onChange={(e) => setFd((f) => ({ ...f, customerPhone: e.target.value }))} placeholder="0555xxxxxx" />
          </FormField>

          <div className="mds-form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem' }}>
            <style>{`@media (min-width:500px){.mds-form-row-2{grid-template-columns:1fr 1fr !important;}}`}</style>
            <FormField label="الولاية" error={errors.customerWelaya}>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={12} style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                <select className="mds-input" style={{ ...inputBase, paddingInlineStart: 36 }} disabled={wilayas.length === 0}
                  value={fd.customerWelaya} onChange={(e) => setFd((f) => ({ ...f, customerWelaya: e.target.value, customerCommune: '' }))}>
                  <option value="">{wilayas.length === 0 ? 'التوصيل غير متاح حالياً' : 'اختر الولاية'}</option>
                  {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                </select>
              </div>
            </FormField>
            <FormField label="البلدية" error={errors.customerCommune}>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={12} style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                <select className="mds-input" style={{ ...inputBase, paddingInlineStart: 36 }} disabled={!fd.customerWelaya || loadingC}
                  value={fd.customerCommune} onChange={(e) => setFd((f) => ({ ...f, customerCommune: e.target.value }))}>
                  <option value="">{loadingC ? 'جارٍ التحميل...' : 'اختر البلدية'}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                </select>
              </div>
            </FormField>
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 8, fontFamily: HEAD_FONT }}>نوع التوصيل</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['home', 'office'] as const).map((type) => (
                <button key={type} onClick={() => setFd((f) => ({ ...f, typeLivraison: type }))} style={{
                  padding: '0.75rem', borderRadius: 12, border: `1.5px solid ${fd.typeLivraison === type ? A : BD}`,
                  background: fd.typeLivraison === type ? AL : 'transparent', color: fd.typeLivraison === type ? AD : SUB,
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: HEAD_FONT,
                }}>{type === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب'}</button>
              ))}
            </div>
          </div>

          <div style={{ background: SURFACE, borderRadius: 16, padding: '1rem 1.25rem', marginBottom: 18 }}>
            <SummaryRow l="السعر" v={fmtPrice(fp, "DZ")} />
            <SummaryRow l="الكمية" v={`× ${fd.quantity}`} />
            <SummaryRow l="التوصيل" v={selW ? fmtPrice(getLiv(), "DZ") : '—'} />
            <div style={{ borderTop: `1px solid ${BD}`, marginTop: 6 }}>
              <SummaryRow l="الإجمالي" v={fmtPrice(total(), "DZ")} strong />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submitOrder} disabled={submitting} className="mds-btn-primary" style={{ ...btnPrimary, width: 'auto', flex: 1 }}>
              {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
            </button>
            <button onClick={() => setIsOrderNow(false)} disabled={submitting} className="mds-btn-secondary" style={{ ...btnSecondary, width: 'auto', flex: 1 }}>
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CART
   ============================================================ */
export function Cart({ domain, store }: any) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore((s: any) => s.initCount);

  const [fd, setFd] = useState({
    customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, [domain]);

  useEffect(() => {
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const cartTotal = items.reduce((sum, it) => sum + Number(it.finalPrice || 0) * Number(it.quantity || 1), 0);
  const finalTotal = cartTotal + getLiv();

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    localStorage.setItem(domain, JSON.stringify(next));
    initCount(next.length);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!PHONE_RE.test(fd.customerPhone)) e.customerPhone = 'رقم هاتف غير صحيح';
    if (!fd.customerWelaya) e.customerWelaya = 'الولاية مطلوبة';
    if (!fd.customerCommune) e.customerCommune = 'البلدية مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrders = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orders = items.map((it) => ({
        ...fd, ...it, priceLivraison: getLiv(), totalPrice: Number(it.finalPrice || 0) * Number(it.quantity || 1) + getLiv(),
      }));
      await fetch(`${API_URL}/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orders),
      });
      localStorage.removeItem(domain);
      initCount(0);
      setItems([]);
      setSuccess(true);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mds-container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <BadgeCheck size={40} color={AD} />
        </div>
        <h2 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.4rem', marginBottom: 10 }}>تم إرسال طلبك بنجاح!</h2>
        <p style={{ color: SUB, marginBottom: 24 }}>سنتواصل معك قريباً لتأكيد الطلب.</p>
        <Link href="/" className="mds-btn-primary" style={{ ...btnPrimary, width: 'auto', display: 'inline-flex', padding: '0.9rem 2rem' }}>العودة للمتجر</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mds-container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <Lightbulb size={56} color={BD} style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.3rem', marginBottom: 10 }}>سلتك فارغة</h2>
        <p style={{ color: SUB, marginBottom: 24 }}>أضف بعض المنتجات المضيئة إلى سلتك.</p>
        <Link href="/" className="mds-btn-primary" style={{ ...btnPrimary, width: 'auto', display: 'inline-flex', padding: '0.9rem 2rem' }}>تسوق الآن</Link>
      </div>
    );
  }

  return (
    <div className="mds-container mds-page-fade" style={{ padding: '2rem 1.25rem 4rem' }}>
      <h1 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.6rem', marginBottom: 24 }}>سلة التسوق</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="mds-cart-inner">
        <style>{`@media (min-width:1024px){.mds-cart-inner{grid-template-columns:1.2fr 1fr !important;}}`}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it, idx) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            return (
              <div key={idx} style={{ display: 'flex', gap: 14, background: CARD, border: `1px solid ${BD}`, borderRadius: 18, padding: '1rem' }}>
                <div style={{ width: 76, height: 76, borderRadius: 14, background: SURFACE, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {img ? <img src={img} alt={it.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <PlaceholderIcon size={30} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: HEAD_FONT, fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{it.product?.name}</p>
                  <p style={{ color: SUB, fontSize: '0.8rem', margin: '4px 0' }}>الكمية: {it.quantity}</p>
                  <p style={{ fontFamily: HEAD_FONT, fontWeight: 800, color: AD, margin: 0, whiteSpace: 'nowrap' }}>
                    {fmtPrice(Number(it.finalPrice || 0) * Number(it.quantity || 1), store?.currency)}
                  </p>
                </div>
                <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ERR, alignSelf: 'flex-start' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        <div>
          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 20, padding: '1.5rem' }}>
            <h3 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.05rem', marginBottom: 16 }}>معلومات التوصيل</h3>
            <FormField label="الاسم الكامل" error={errors.customerName}>
              <input className="mds-input" style={inputBase} value={fd.customerName} onChange={(e) => setFd((f) => ({ ...f, customerName: e.target.value }))} placeholder="مثال: أحمد بن علي" />
            </FormField>
            <FormField label="رقم الهاتف" error={errors.customerPhone}>
              <input className="mds-input" style={inputBase} value={fd.customerPhone} onChange={(e) => setFd((f) => ({ ...f, customerPhone: e.target.value }))} placeholder="0555xxxxxx" />
            </FormField>
            <FormField label="الولاية" error={errors.customerWelaya}>
              <select className="mds-input" style={inputBase} disabled={wilayas.length === 0}
                value={fd.customerWelaya} onChange={(e) => setFd((f) => ({ ...f, customerWelaya: e.target.value, customerCommune: '' }))}>
                <option value="">{wilayas.length === 0 ? 'التوصيل غير متاح حالياً' : 'اختر الولاية'}</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </FormField>
            <FormField label="البلدية" error={errors.customerCommune}>
              <select className="mds-input" style={inputBase} disabled={!fd.customerWelaya || loadingC}
                value={fd.customerCommune} onChange={(e) => setFd((f) => ({ ...f, customerCommune: e.target.value }))}>
                <option value="">{loadingC ? 'جارٍ التحميل...' : 'اختر البلدية'}</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </FormField>
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 8, fontFamily: HEAD_FONT }}>نوع التوصيل</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['home', 'office'] as const).map((type) => (
                  <button key={type} onClick={() => setFd((f) => ({ ...f, typeLivraison: type }))} style={{
                    padding: '0.75rem', borderRadius: 12, border: `1.5px solid ${fd.typeLivraison === type ? A : BD}`,
                    background: fd.typeLivraison === type ? AL : 'transparent', color: fd.typeLivraison === type ? AD : SUB,
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: HEAD_FONT,
                  }}>{type === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب'}</button>
                ))}
              </div>
            </div>

            <div style={{ background: SURFACE, borderRadius: 16, padding: '1rem 1.25rem', marginBottom: 18 }}>
              <SummaryRow l="مجموع المنتجات" v={fmtPrice(cartTotal, store?.currency)} />
              <SummaryRow l="التوصيل" v={selW ? fmtPrice(getLiv(), store?.currency) : '—'} />
              <div style={{ borderTop: `1px solid ${BD}`, marginTop: 6 }}>
                <SummaryRow l="الإجمالي" v={fmtPrice(finalTotal, store?.currency)} strong />
              </div>
            </div>

            <button onClick={submitOrders} disabled={submitting} className="mds-btn-primary" style={btnPrimary}>
              {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STATIC PAGES
   ============================================================ */
function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mds-page-fade">
      <div style={{ background: `linear-gradient(160deg, ${SURFACE}, ${BG})`, padding: '3.5rem 1.25rem', textAlign: 'center', borderBottom: `1px solid ${BD}` }}>
        <h1 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', margin: 0 }}>{title}</h1>
      </div>
      <div className="mds-container" style={{ padding: '2.5rem 1.25rem 4rem', display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 820 }}>
        {children}
      </div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.1rem', marginBottom: 10 }}>{title}</h3>
      <p style={{ color: SUB, fontSize: '0.92rem', lineHeight: 1.9 }}>{body}</p>
    </div>
  );
}

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية">
      <InfoBlock title="جمع المعلومات" body="نقوم بجمع المعلومات الضرورية فقط لإتمام عملية الطلب والتوصيل، مثل الاسم ورقم الهاتف والعنوان، ولا نستخدمها لأي غرض آخر دون موافقتك." />
      <InfoBlock title="حماية البيانات" body="نلتزم بحماية بياناتك الشخصية باستخدام إجراءات أمنية مناسبة، ولا نشارك معلوماتك مع أطراف خارجية إلا في حدود ما يخدم إتمام طلبك." />
      <InfoBlock title="حقوقك" body="يحق لك في أي وقت طلب الاطلاع على بياناتك أو تعديلها أو حذفها من خلال التواصل معنا عبر صفحة اتصل بنا." />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="الشروط والأحكام">
      <InfoBlock title="الطلبات" body="جميع الطلبات تخضع للتأكيد عبر الهاتف قبل الشحن. نحتفظ بالحق في إلغاء أي طلب يحتوي على معلومات غير صحيحة." />
      <InfoBlock title="التوصيل" body="يتم احتساب تكلفة التوصيل حسب الولاية ونوع التوصيل المختار (منزل أو مكتب)، وتظهر بشكل واضح قبل تأكيد الطلب." />
      <InfoBlock title="الإرجاع والاستبدال" body="يمكن إرجاع المنتج في حال وجود عيب مصنعي خلال مدة محددة من الاستلام، بعد التواصل معنا لتأكيد حالة المنتج." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="سياسة ملفات تعريف الارتباط">
      <InfoBlock title="ما هي ملفات الارتباط" body="هي ملفات صغيرة تُخزَّن في متصفحك لتحسين تجربتك أثناء التصفح، مثل حفظ محتويات سلة التسوق." />
      <InfoBlock title="كيفية استخدامها" body="نستخدمها لتذكر تفضيلاتك وتسهيل عملية الشراء، ولا نستخدمها لتتبعك خارج نطاق متجرنا." />
      <InfoBlock title="التحكم بها" body="يمكنك ضبط إعدادات متصفحك لرفض ملفات الارتباط، مع العلم أن ذلك قد يؤثر على بعض وظائف المتجر مثل سلة التسوق." />
    </Shell>
  );
}

export function Contact({ store }: any) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      setSent(true);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="mds-container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Mail size={36} color={AD} />
        </div>
        <h2 style={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.3rem', marginBottom: 10 }}>تم إرسال رسالتك!</h2>
        <p style={{ color: SUB, marginBottom: 20 }}>سنرد عليك في أقرب وقت ممكن.</p>
        <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }} className="mds-btn-secondary" style={{ ...btnSecondary, width: 'auto', display: 'inline-flex', padding: '0.8rem 1.8rem' }}>
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <Shell title="تواصل معنا">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="mds-contact-grid">
        <style>{`@media (min-width:768px){.mds-contact-grid{grid-template-columns:1fr 1.3fr !important;}}`}</style>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {store?.contact?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} color={AD} /></div>
              <span style={{ fontSize: '0.9rem' }}>{store.contact.phone}</span>
            </div>
          )}
          {store?.contact?.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} color={AD} /></div>
              <span style={{ fontSize: '0.9rem' }}>{store.contact.email}</span>
            </div>
          )}
          {(store?.contact?.wilaya || store?.contact?.address) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={18} color={AD} /></div>
              <span style={{ fontSize: '0.9rem' }}>{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' - ')}</span>
            </div>
          )}
        </div>
        <div>
          <FormField label="الاسم"><input className="mds-input" style={inputBase} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></FormField>
          <FormField label="البريد الإلكتروني"><input className="mds-input" style={inputBase} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></FormField>
          <FormField label="رقم الهاتف"><input className="mds-input" style={inputBase} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></FormField>
          <FormField label="الرسالة">
            <textarea className="mds-input" style={{ ...inputBase, resize: 'none' }} rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          </FormField>
          <button onClick={submit} disabled={submitting} className="mds-btn-primary" style={btnPrimary}>
            {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </button>
        </div>
      </div>
    </Shell>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  if (p === 'privacy') return <Privacy />;
  if (p === 'terms') return <Terms />;
  if (p === 'cookies') return <Cookies />;
  if (p === 'contact') return <Contact store={store} />;
  return (
    <div className="mds-container" style={{ padding: '5rem 1.25rem', textAlign: 'center', color: SUB }}>
      الصفحة غير موجودة
    </div>
  );
}