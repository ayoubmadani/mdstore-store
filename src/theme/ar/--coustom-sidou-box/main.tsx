'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';
import {
  Search, ShoppingCart, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  Star, Phone, Mail, MapPin, Trash2, AlertCircle, Zap, Shield, Truck,
  Headset, Minus, Plus, Cpu, CircuitBoard,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

/* ============================================================================
   SIDOU-BOX — Custom Electronics Theme (Arabic / RTL)
   Aesthetic: Dark neon-blue tech. Circuit-board motifs, monospace price tags,
   condensed uppercase headlines, sharp bordered cards with SKU eyebrow labels.
============================================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ---------------------------------- Tokens --------------------------------- */
const BG = '#060a14';
const CARD = '#0d1424';
const SURF = '#111a2e';
const BD = '#1e2c47';
const BD2 = '#2a3d63';
const TXT = '#eaf2ff';
const SUB = '#7b8bab';
const A = '#00d9ff';
const AD = '#00b8dd';
const AL = 'rgba(0,217,255,0.12)';
const DANGER = '#ff4d6d';

const FONT_HEAD = `'Tajawal', 'Segoe UI', sans-serif`;
const FONT_BODY = `'Cairo', 'Segoe UI', sans-serif`;
const FONT_MONO = `'JetBrains Mono', 'Courier New', monospace`;

/* ---------------------------------- Types ----------------------------------- */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; slug?: string;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

/* --------------------------------- Helpers ---------------------------------- */
function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

function getVarId(product: Product | undefined, sel: Record<string, string>): string | number | null {
  if (!product?.variantDetails || product.variantDetails.length === 0) return null;
  const m = product.variantDetails.find((d) => variantMatches(d, sel));
  return m ? m.id : null;
}

async function fetchWilayas(uid: string): Promise<Wilaya[]> {
  try {
    const r = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

async function fetchCommunes(wid: string): Promise<Commune[]> {
  try {
    const r = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

function fmtPrice(n: number) {
  return `${Math.round(n).toLocaleString('fr-FR')} دج`;
}

/* ----------------------------------- CSS ------------------------------------ */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500;700;900&family=Cairo:wght@400;600;700&display=swap');

* { box-sizing: border-box; }
body { background: ${BG}; color: ${TXT}; font-family: ${FONT_BODY}; }

@keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes scaleIn { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
@keyframes float { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-8px);} }
@keyframes pulseGlow { 0%,100% { box-shadow:0 0 0 0 rgba(0,217,255,.45);} 50% { box-shadow:0 0 0 10px rgba(0,217,255,0);} }
@keyframes shimmer { 0% { background-position:-400px 0;} 100% { background-position:400px 0;} }
@keyframes gradientShift { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
@keyframes badgeBounce { 0%{transform:scale(1);} 40%{transform:scale(1.4);} 70%{transform:scale(.9);} 100%{transform:scale(1);} }
@keyframes scan { 0%{transform:translateY(-100%);} 100%{transform:translateY(100%);} }

.sb-container { max-width:1280px; margin:0 auto; padding:0 1.5rem; }

.sb-card { animation: fadeUp .5s ease both; transition: transform .28s cubic-bezier(.22,.68,0,1.2), box-shadow .28s ease, border-color .2s ease; }
.sb-card:hover { transform: translateY(-6px); box-shadow: 0 16px 34px rgba(0,217,255,.12); border-color: ${A}; }
.sb-card-img { transition: transform .5s ease; overflow:hidden; }
.sb-card:hover .sb-card-img { transform: scale(1.08); }

.sb-btn-primary { transition: transform .15s ease, box-shadow .15s ease, background .2s ease; }
.sb-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,217,255,.28); }
.sb-btn-primary:active:not(:disabled) { transform: translateY(0) scale(.97); }
.sb-btn-primary:disabled { opacity:.55; cursor:default; }

.sb-nav-link { position:relative; }
.sb-nav-link::after { content:''; position:absolute; bottom:-4px; right:0; left:0; height:2px; background:${A}; transform:scaleX(0); transition:transform .25s ease; }
.sb-nav-link:hover::after, .sb-nav-link.active::after { transform:scaleX(1); }

.sb-badge-animate { animation: badgeBounce .4s ease; }

.sb-skeleton { background: linear-gradient(90deg, #101a30 25%, #182548 50%, #101a30 75%); background-size:400px 100%; animation: shimmer 1.4s infinite linear; border-radius:2px; }

.sb-hero-title { animation: fadeUp .7s ease .1s both; }
.sb-hero-sub { animation: fadeUp .7s ease .25s both; }
.sb-hero-cta { animation: fadeUp .7s ease .4s both; }
.sb-hero-badge { animation: scaleIn .5s ease .55s both; }
.sb-hero-float { animation: float 4s ease-in-out infinite; }

.sb-input { width:100%; padding:.75rem 1rem; font-size:.9rem; border:1px solid ${BD}; border-radius:2px; background:${SURF}; color:${TXT}; outline:none; appearance:none; transition:border-color .2s, box-shadow .2s; font-family:inherit; min-height:44px; }
.sb-input:focus { border-color:${A}; box-shadow:0 0 0 3px rgba(0,217,255,.15); }
.sb-input::placeholder { color:${SUB}; }

.sb-marquee-track { display:flex; width:max-content; animation: marquee 22s linear infinite; }
@keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }

.sb-products-grid { display:grid; grid-template-columns:1fr; gap:1rem; }
@media (min-width:640px) { .sb-products-grid { grid-template-columns:repeat(2,1fr); } }
@media (min-width:1024px) { .sb-products-grid { grid-template-columns:repeat(3,1fr); } }
@media (min-width:1280px) { .sb-products-grid { grid-template-columns:repeat(4,1fr); } }

.sb-nav-links { display:flex; align-items:center; gap:28px; }
.sb-nav-burger { display:none; }
@media (max-width:900px) { .sb-nav-links { display:none; } .sb-nav-burger { display:flex; } }

.sb-cart-inner { display:grid; grid-template-columns:1fr; gap:2rem; }
.sb-details-inner { display:grid; grid-template-columns:1fr; gap:2rem; }
@media (min-width:1024px) { .sb-cart-inner { grid-template-columns:1.2fr 1fr; } }
@media (min-width:768px) { .sb-details-inner { grid-template-columns:1fr 1fr; } }

.sb-footer-grid { display:grid; grid-template-columns:1fr; gap:2rem; }
@media (min-width:768px) { .sb-footer-grid { grid-template-columns:repeat(3,1fr); } }

.sb-form-row-2 { display:grid; grid-template-columns:1fr; gap:.875rem; margin-bottom:.875rem; }
@media (min-width:500px) { .sb-form-row-2 { grid-template-columns:1fr 1fr; } }

.sb-search-dropdown { position:absolute; top:calc(100% + 8px); left:0; width:340px; background:${CARD}; border:1px solid ${BD}; z-index:60; }
@media (max-width:480px) { .sb-search-dropdown { position:fixed; left:12px; right:12px; width:auto; top:64px; } }

@media (prefers-reduced-motion: reduce) { * { animation-duration:.01ms !important; animation-iteration-count:1 !important; } }
`;

/* --------------------------------- Icon --------------------------------- */
function PlaceholderIcon({ size = 40, color = BD2 }: { size?: number; color?: string }) {
  return <Cpu size={size} color={color} strokeWidth={1.2} />;
}

/* =============================== MAIN =================================== */
export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div dir="rtl" style={{ background: BG, minHeight: '100vh', fontFamily: FONT_BODY }}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <main style={{ opacity: visible ? 1 : 0, transition: 'opacity .3s ease' }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* =============================== NAVBAR ================================== */
export function Navbar({ store, domain }: any) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<any>(null);

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    setBadgeBump(true);
    const t = setTimeout(() => setBadgeBump(false), 400);
    return () => clearTimeout(t);
  }, [count]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) { setListSearch([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const d = await r.json();
        setListSearch(Array.isArray(d?.products) ? d.products : Array.isArray(d) ? d : []);
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, domain]);

  const submitSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
  };

  const showCart = store?.cart !== false;
  const logo = store?.design?.logoUrl;

  const mobileLinks = [
    { h: '/', l: 'الرئيسية' },
    { h: '/contact', l: 'تواصل معنا' },
  ];

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: scrolled ? 'rgba(6,10,20,0.92)' : BG,
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: `1px solid ${scrolled ? BD : 'transparent'}`,
        transition: 'background .25s ease, border-color .25s ease',
      }}>
        {store?.topBar?.enabled && store?.topBar?.text && (
          <div style={{ background: A, color: '#04141c', fontSize: 12, fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div className="sb-marquee-track" style={{ padding: '6px 0' }}>
              <span style={{ padding: '0 2rem' }}>{store.topBar.text}</span>
              <span style={{ padding: '0 2rem' }}>{store.topBar.text}</span>
              <span style={{ padding: '0 2rem' }}>{store.topBar.text}</span>
            </div>
          </div>
        )}
        <div className="sb-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            {logo && !imgError ? (
              <img src={logo} alt={store?.name} onError={() => setImgError(true)} style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
            ) : (
              <div style={{
                width: 38, height: 38, borderRadius: 4, background: AL, border: `1px solid ${A}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: A, fontWeight: 900, fontFamily: FONT_MONO,
              }}>{(store?.name || 'SB').slice(0, 2).toUpperCase()}</div>
            )}
            <span style={{ fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 18, letterSpacing: 1, textTransform: 'uppercase', color: TXT }}>
              {store?.name || 'sidou-box'}
            </span>
          </Link>

          <nav className="sb-nav-links">
            <Link href="/" className="sb-nav-link" style={{ color: TXT, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>الرئيسية</Link>
            <Link href="/contact" className="sb-nav-link" style={{ color: TXT, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>تواصل معنا</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <button aria-label="بحث" onClick={() => setShowSearch((s) => !s)} style={{
                background: 'transparent', border: `1px solid ${BD}`, borderRadius: 2, width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: TXT, cursor: 'pointer',
              }}><Search size={18} /></button>

              {showSearch && (
                <div className="sb-search-dropdown" style={{ boxShadow: '0 20px 44px rgba(0,0,0,.5)' }}>
                  <div style={{ display: 'flex', borderBottom: `1px solid ${BD}` }}>
                    <input
                      autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                      placeholder="ابحث عن منتج..." style={{ ...({} as any), flex: 1, background: 'transparent', border: 'none', outline: 'none', color: TXT, padding: '12px 14px', fontFamily: 'inherit' }}
                    />
                    <button onClick={submitSearch} style={{ background: A, border: 'none', color: '#04141c', width: 44, cursor: 'pointer' }}><Search size={16} /></button>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {loading && <div className="sb-skeleton" style={{ height: 60, margin: 10 }} />}
                    {!loading && listSearch.slice(0, 5).map((p: any) => (
                      <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={() => setShowSearch(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', textDecoration: 'none', color: TXT, borderBottom: `1px solid ${BD}`,
                      }}>
                        <div style={{ width: 40, height: 40, background: SURF, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {(p.productImage || p.imagesProduct?.[0]?.imageUrl) ? (
                            <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : <PlaceholderIcon size={18} />}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                      </Link>
                    ))}
                    {!loading && searchQuery.length >= 2 && (
                      <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearch(false)} style={{ display: 'block', textAlign: 'center', padding: 12, color: A, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                        عرض كل النتائج
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {showCart && (
              <Link href="/cart" aria-label="السلة" style={{
                position: 'relative', width: 40, height: 40, border: `1px solid ${BD}`, borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: TXT, textDecoration: 'none',
              }}>
                <ShoppingCart size={18} />
                {count > 0 && (
                  <span className={badgeBump ? 'sb-badge-animate' : ''} style={{
                    position: 'absolute', top: -6, left: -6, background: A, color: '#04141c', fontFamily: FONT_MONO,
                    fontWeight: 900, fontSize: 11, minWidth: 18, height: 18, borderRadius: 9, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                  }}>{count}</span>
                )}
              </Link>
            )}

            <button className="sb-nav-burger" aria-label="القائمة" onClick={() => setOpen(true)} style={{
              background: 'transparent', border: `1px solid ${BD}`, borderRadius: 2, width: 40, height: 40,
              alignItems: 'center', justifyContent: 'center', color: TXT, cursor: 'pointer',
            }}><Menu size={18} /></button>
          </div>
        </div>
      </header>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)' }} />
          <div style={{
            position: 'absolute', top: 0, right: 0, height: '100%', width: '82%', maxWidth: 340, background: CARD,
            borderLeft: `1px solid ${BD}`, padding: 24, display: 'flex', flexDirection: 'column', gap: 6,
            animation: 'fadeUp .3s ease both',
          }}>
            <button onClick={() => setOpen(false)} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: TXT, marginBottom: 20, cursor: 'pointer' }}><X size={22} /></button>
            {mobileLinks.map((l) => (
              <Link key={l.h} href={l.h} onClick={() => setOpen(false)} style={{
                color: TXT, textDecoration: 'none', fontWeight: 700, fontSize: 18, padding: '14px 4px', borderBottom: `1px solid ${BD}`,
              }}>{l.l}</Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* =============================== FOOTER =================================== */
export function Footer({ store }: any) {
  const showCart = store?.cart !== false;
  const pageLinks = [
    { h: '/', l: 'الرئيسية' },
    { h: '/cart', l: 'السلة' },
    { h: '/contact', l: 'تواصل معنا' },
    { h: '/privacy', l: 'سياسة الخصوصية' },
    { h: '/terms', l: 'الشروط والأحكام' },
  ].filter((lnk) => lnk.h !== '/cart' || showCart);

  return (
    <footer style={{ background: CARD, borderTop: `1px solid ${BD}`, marginTop: 60 }}>
      <div className="sb-container" style={{ padding: '48px 1.5rem 24px', }}>
        <div className="sb-footer-grid">
          <div>
            <div style={{ fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, color: A, marginBottom: 10 }}>
              {store?.name || 'sidou-box'}
            </div>
            {store?.hero?.subtitle && <p style={{ color: SUB, fontSize: 13.5, lineHeight: 1.8, maxWidth: 320 }}>{store.hero.subtitle}</p>}
            <p style={{ color: SUB, fontSize: 12, marginTop: 16 }}>© {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: TXT, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>روابط</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pageLinks.map((l) => (
                <Link key={l.h} href={l.h} style={{ color: SUB, textDecoration: 'none', fontSize: 13.5 }}>{l.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: TXT, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>تواصل معنا</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {store?.contact?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: SUB, fontSize: 13.5 }}><Phone size={14} color={A} /> {store.contact.phone}</span>}
              {store?.contact?.email && <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: SUB, fontSize: 13.5 }}><Mail size={14} color={A} /> {store.contact.email}</span>}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: SUB, fontSize: 13.5 }}>
                  <MapPin size={14} color={A} /> {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' — ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ================================ CARD ==================================== */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product?.productImage || product?.imagesProduct?.[0]?.imageUrl;
  const sku = String(product?.id || '').slice(0, 8).toUpperCase();

  return (
    <Link href={`/product/${product?.slug || product?.id}`} className="sb-card" style={{
      display: 'block', textDecoration: 'none', color: TXT, background: CARD, border: `1px solid ${BD}`, borderRadius: 2, overflow: 'hidden',
    }}>
      <div className="sb-card-img" style={{ position: 'relative', aspectRatio: '1/1', background: SURF, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {img && !imgErr ? (
          <img src={img} alt={product?.name} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <PlaceholderIcon size={40} />
        )}
        {discount > 0 && (
          <span style={{
            position: 'absolute', top: 8, insetInlineStart: 8, background: A, color: '#04141c', fontFamily: FONT_MONO,
            fontWeight: 900, fontSize: 11, padding: '3px 8px', borderRadius: 2,
          }}>-{discount}%</span>
        )}
        <span style={{
          position: 'absolute', bottom: 8, insetInlineEnd: 8, background: 'rgba(6,10,20,.75)', border: `1px solid ${BD2}`,
          color: SUB, fontFamily: FONT_MONO, fontSize: 10, padding: '2px 6px', borderRadius: 2,
        }}>#{sku}</span>
      </div>
      <div style={{ padding: 14 }}>
        <p style={{
          fontSize: 13.5, fontWeight: 700, margin: '0 0 8px', color: TXT, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 38,
        }}>{product?.name}</p>
        <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={11} fill={A} color={A} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: FONT_MONO }}>
          <span style={{ fontWeight: 900, fontSize: 16, color: A }}>{Number(product?.price).toLocaleString('fr-FR')} <span style={{ fontSize: 11 }}>{store?.currency || 'دج'}</span></span>
          {product?.priceOriginal && Number(product.priceOriginal) > Number(product.price) && (
            <span style={{ color: SUB, textDecoration: 'line-through', fontSize: 12 }}>{Number(product.priceOriginal).toLocaleString('fr-FR')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ================================ HOME ===================================== */
export function Home({ store, page }: any) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const products: any[] = store?.products || [];
  const cats: any[] = store?.categories || [];
  const countPage = Math.max(1, Math.ceil((store?.count || products.length) / 48));
  const currentPage = page || 1;

  return (
    <div>
      {/* HERO */}
      <section style={{
        position: 'relative', minHeight: 'clamp(480px, 68vh, 760px)', overflow: 'hidden',
        background: `radial-gradient(circle at 30% 20%, rgba(0,217,255,.12), transparent 55%), linear-gradient(135deg, #060a14 0%, #0a1224 100%)`,
        display: 'flex', alignItems: 'flex-end',
      }}>
        {store?.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,10,20,0) 0%, rgba(6,10,20,.55) 55%, rgba(6,10,20,.96) 100%)' }} />
        <div className="sb-hero-float" style={{ position: 'absolute', top: 60, insetInlineEnd: '8%', opacity: 0.5 }}>
          <CircuitBoard size={110} color={A} strokeWidth={0.6} />
        </div>
        <div className="sb-container" style={{ position: 'relative', paddingBottom: 56, paddingTop: 100 }}>
          <span className="sb-hero-badge" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${A}`, color: A, background: AL,
            fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '4px 10px', borderRadius: 2, marginBottom: 18,
          }}><Zap size={12} /> متجر إلكترونيات رقمي</span>
          <h1 className="sb-hero-title" style={{
            fontFamily: FONT_HEAD, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1,
            fontSize: 'clamp(1.9rem, 5.2vw, 3.6rem)', margin: '0 0 14px', lineHeight: 1.08, color: TXT, maxWidth: 720,
          }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || 'تكنولوجيا تضيء طريقك') }} />
          {store?.hero?.subtitle && (
            <p className="sb-hero-sub" style={{ color: SUB, fontSize: 'clamp(.95rem,2vw,1.15rem)', maxWidth: 520, marginBottom: 30, lineHeight: 1.7 }}>{store.hero.subtitle}</p>
          )}
          <div className="sb-hero-cta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="#products" style={{
              background: A, color: '#04141c', fontWeight: 900, fontFamily: FONT_MONO, textTransform: 'uppercase',
              letterSpacing: 1, padding: '14px 28px', textDecoration: 'none', borderRadius: 2, fontSize: 13.5, minHeight: 44,
              display: 'inline-flex', alignItems: 'center',
            }}>تسوق الآن</a>
            {store?.cart !== false && (
              <Link href="/cart" style={{
                background: 'transparent', color: TXT, border: `1px solid ${BD2}`, fontWeight: 700, padding: '14px 28px',
                textDecoration: 'none', borderRadius: 2, fontSize: 13.5, minHeight: 44, display: 'inline-flex', alignItems: 'center',
              }}>سلة المشتريات</Link>
            )}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ borderBottom: `1px solid ${BD}`, background: CARD }}>
        <div className="sb-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, padding: '28px 1.5rem' }}>
          {[
            { icon: Truck, t: 'توصيل سريع', s: 'لكل الولايات' },
            { icon: Shield, t: 'دفع آمن', s: 'عند الاستلام' },
            { icon: Zap, t: 'منتجات أصلية', s: 'ضمان الجودة' },
            { icon: Headset, t: 'دعم فني', s: 'على مدار اليوم' },
          ].map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <it.icon size={22} color={A} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{it.t}</div>
                <div style={{ color: SUB, fontSize: 11.5 }}>{it.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <section className="sb-container" style={{ padding: '36px 1.5rem 0' }}>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            <Link href="/" style={{
              flexShrink: 0, padding: '9px 18px', borderRadius: 2, textDecoration: 'none', fontSize: 13, fontWeight: 700,
              fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: .5,
              background: !activeCategory ? A : 'transparent', color: !activeCategory ? '#04141c' : TXT,
              border: `1px solid ${!activeCategory ? A : BD2}`,
            }}>الكل</Link>
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} style={{
                flexShrink: 0, padding: '9px 18px', borderRadius: 2, textDecoration: 'none', fontSize: 13, fontWeight: 700,
                fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: .5,
                background: activeCategory === String(cat.id) ? A : 'transparent',
                color: activeCategory === String(cat.id) ? '#04141c' : TXT,
                border: `1px solid ${activeCategory === String(cat.id) ? A : BD2}`,
              }}>{cat.name}</Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" className="sb-container" style={{ padding: '32px 1.5rem 60px' }}>
        <div className="sb-products-grid">
          {products.map((p: any, i: number) => {
            const discount = p.priceOriginal && Number(p.priceOriginal) > Number(p.price)
              ? Math.round(((Number(p.priceOriginal) - Number(p.price)) / Number(p.priceOriginal)) * 100) : 0;
            return (
              <div key={p.id} style={{ animationDelay: `${(i % 12) * 0.06}s` }}>
                <Card
                  product={p}
                  displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                  discount={discount}
                  store={store}
                  viewDetails
                />
              </div>
            );
          })}
        </div>
        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: SUB }}>لا توجد منتجات حالياً.</div>
        )}

        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 44, flexWrap: 'wrap' }}>
            {[...Array(countPage)].map((_, i) => {
              const pg = i + 1;
              return (
                <Link key={pg} href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), page: pg } }} scroll={false} style={{
                  width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                  fontFamily: FONT_MONO, fontWeight: 700, fontSize: 13, borderRadius: 2,
                  background: currentPage === pg ? A : 'transparent', color: currentPage === pg ? '#04141c' : TXT,
                  border: `1px solid ${currentPage === pg ? A : BD}`,
                }}>{pg}</Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* =============================== DETAILS =================================== */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  const images: string[] = allImages && allImages.length ? allImages : (product?.productImage ? [product.productImage] : []);

  return (
    <div className="sb-container" style={{ padding: '40px 1.5rem 70px' }}>
      <div className="sb-details-inner">
        <div>
          <div style={{ position: 'relative', aspectRatio: '1/1', background: SURF, border: `1px solid ${BD}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {images.length > 0 ? (
              <img src={images[sel]} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : <PlaceholderIcon size={64} />}
            {images.length > 1 && (
              <>
                <button onClick={() => setSel((s) => (s - 1 + images.length) % images.length)} style={navArrowStyle('right')}><ChevronRight size={18} /></button>
                <button onClick={() => setSel((s) => (s + 1) % images.length)} style={navArrowStyle('left')}><ChevronLeft size={18} /></button>
              </>
            )}
            {discount > 0 && <span style={{ position: 'absolute', top: 10, insetInlineStart: 10, background: A, color: '#04141c', fontFamily: FONT_MONO, fontWeight: 900, fontSize: 12, padding: '4px 10px', borderRadius: 2 }}>-{discount}%</span>}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setSel(i)} style={{
                  width: 64, height: 64, flexShrink: 0, border: `1px solid ${sel === i ? A : BD}`, padding: 0, background: SURF, cursor: 'pointer',
                }}><img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2rem)', margin: '0 0 8px', color: TXT }}>{product?.name}</h1>
          <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={A} color={A} />)}</div>

          <div style={{ fontFamily: FONT_MONO, fontWeight: 900, fontSize: 28, color: A, marginBottom: 20 }}>
            {Number(finalPrice ?? product?.price).toLocaleString('fr-FR')} <span style={{ fontSize: 14 }}>دج</span>
          </div>

          {product?.offers?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, textTransform: 'uppercase', letterSpacing: .5 }}>العروض</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o: Offer) => (
                  <label key={o.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${selectedOffer === o.id ? A : BD}`,
                    padding: '10px 14px', cursor: 'pointer', background: selectedOffer === o.id ? AL : 'transparent',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                      {o.name}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: A }}>{o.price.toLocaleString('fr-FR')} دج</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {allAttrs?.map((attr: Attribute) => (
            <div key={attr.id} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, textTransform: 'uppercase', letterSpacing: .5 }}>{attr.name}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {attr.variants.map((v) => {
                  const active = selectedVariants?.[attr.name] === v.value;
                  if (attr.displayMode === 'color') {
                    return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} style={{
                      width: 32, height: 32, borderRadius: '50%', background: v.value, cursor: 'pointer',
                      border: `2px solid ${active ? A : BD2}`, boxShadow: active ? `0 0 0 2px ${BG}, 0 0 0 4px ${A}` : 'none',
                    }} />;
                  }
                  if (attr.displayMode === 'image') {
                    return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{
                      width: 48, height: 48, border: `1px solid ${active ? A : BD}`, padding: 0, cursor: 'pointer', overflow: 'hidden',
                    }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></button>;
                  }
                  return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{
                    padding: '8px 16px', border: `1px solid ${active ? A : BD2}`, background: active ? AL : 'transparent',
                    color: active ? A : TXT, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}>{v.name}</button>;
                })}
              </div>
            </div>
          ))}

          <ProductForm
            product={product} userId={product?.store?.userId} domain={domain}
            selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants} platform="web"
          />

          {product?.desc && (
            <div style={{ marginTop: 34, borderTop: `1px solid ${BD}`, paddingTop: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, textTransform: 'uppercase', letterSpacing: .5 }}>الوصف</div>
              <div style={{ color: SUB, fontSize: 14, lineHeight: 1.9 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function navArrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side === 'left' ? 'left' : 'right']: 10,
    width: 36, height: 36, borderRadius: '50%', background: 'rgba(6,10,20,.75)', border: `1px solid ${BD2}`,
    color: TXT, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  } as React.CSSProperties;
}

/* ============================= PRODUCT FORM ================================ */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: any) {
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

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

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

  const getFP = useCallback((): number => {
    if (selectedOffer && product?.offers) {
      const o = product.offers.find((x: Offer) => x.id === selectedOffer);
      if (o) return o.price;
    }
    if (product?.variantDetails?.length) {
      const m = product.variantDetails.find((d: VariantDetail) => variantMatches(d, selectedVariants || {}));
      if (m && m.price !== -1) return m.price;
    }
    return Number(product?.price) || 0;
  }, [selectedOffer, product, selectedVariants]);

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const fp = getFP();
  const total = () => fp * fd.quantity + getLiv();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.customerName = 'الاسم مطلوب';
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) errs.customerPhone = 'رقم هاتف غير صحيح';
    if (!fd.customerWelaya) errs.customerWelaya = 'اختر الولاية';
    if (!fd.customerCommune) errs.customerCommune = 'اختر البلدية';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = () => ({
    ...fd,
    product, productId: product?.id, storeId: product?.store?.id, userId,
    variantDetailId: getVarId(product, selectedVariants || {}),
    selectedOffer, selectedVariants, platform,
    finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(),
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
    } catch { /* noop */ }
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = buildPayload();
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const d = await r.json().catch(() => ({}));
      if (d?.customerId) localStorage.setItem('customerId', d.customerId);
      router.push(`/successfully?productId=${product?.id}`);
    } catch { /* noop */ }
    setSubmitting(false);
  };

  return (
    <div style={{ border: `1px solid ${BD}`, background: CARD, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BD2}` }}>
          <button onClick={() => setFd((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} style={qtyBtnStyle}><Minus size={14} /></button>
          <span style={{ width: 40, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700 }}>{fd.quantity}</span>
          <button onClick={() => setFd((f) => ({ ...f, quantity: f.quantity + 1 }))} style={qtyBtnStyle}><Plus size={14} /></button>
        </div>
        <span style={{ color: SUB, fontSize: 12.5 }}>{product?.stock != null ? `متوفر: ${product.stock}` : ''}</span>
      </div>

      {product?.store?.cart === true && (
        <button className="sb-btn-primary" onClick={addToCart} style={{ ...btnSecondaryStyle, width: '100%', marginBottom: 10 }}>
          {added ? 'تمت الإضافة ✓' : 'أضف إلى السلة'}
        </button>
      )}
      {!isOrderNow && (
        <button className="sb-btn-primary" onClick={() => setIsOrderNow(true)} style={{ ...btnPrimaryStyle, width: '100%' }}>اطلب الآن</button>
      )}

      {isOrderNow && (
        <div style={{ marginTop: 18, borderTop: `1px solid ${BD}`, paddingTop: 18 }}>
          <FormField label="الاسم الكامل" error={errors.customerName}>
            <input className="sb-input" value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" />
          </FormField>
          <FormField label="رقم الهاتف" error={errors.customerPhone}>
            <input className="sb-input" value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0555 xx xx xx" />
          </FormField>

          <div className="sb-form-row-2">
            <FormField label="الولاية" error={errors.customerWelaya}>
              <SelectWithArrow disabled={wilayas.length === 0} value={fd.customerWelaya} onChange={(v : any) => setFd({ ...fd, customerWelaya: v, customerCommune: '' })}>
                <option value="">{wilayas.length === 0 ? 'التوصيل غير متاح حالياً' : 'اختر الولاية'}</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </SelectWithArrow>
            </FormField>
            <FormField label="البلدية" error={errors.customerCommune}>
              <SelectWithArrow disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune} onChange={(v : any) => setFd({ ...fd, customerCommune: v })}>
                <option value="">{loadingC ? 'جاري التحميل...' : 'اختر البلدية'}</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </SelectWithArrow>
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {(['home', 'office'] as const).map((t) => (
              <button key={t} onClick={() => setFd({ ...fd, typeLivraison: t })} style={{
                minHeight: 44, border: `1px solid ${fd.typeLivraison === t ? A : BD}`, background: fd.typeLivraison === t ? AL : 'transparent',
                color: fd.typeLivraison === t ? A : TXT, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>{t === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب'}</button>
            ))}
          </div>

          <div style={{ background: SURF, border: `1px solid ${BD}`, padding: 14, marginBottom: 16 }}>
            {[
              { l: 'السعر', v: `${fp.toLocaleString('fr-FR')} دج` },
              { l: 'الكمية', v: `× ${fd.quantity}` },
              { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString('fr-FR')} دج` : '—' },
            ].map((row) => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0', fontSize: 13.5, color: SUB }}>
                <span style={{ flexShrink: 0 }}>{row.l}</span>
                <span style={{ whiteSpace: 'nowrap', fontFamily: FONT_MONO, color: TXT, fontWeight: 600 }}>{row.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 10, marginTop: 6, borderTop: `1px solid ${BD}`, fontWeight: 900 }}>
              <span>الإجمالي</span>
              <span style={{ whiteSpace: 'nowrap', fontFamily: FONT_MONO, color: A, fontSize: 16 }}>{total().toLocaleString('fr-FR')} دج</span>
            </div>
          </div>

          <button className="sb-btn-primary" onClick={submitOrder} disabled={submitting} style={{ ...btnPrimaryStyle, width: '100%', marginBottom: 10 }}>
            {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
          </button>
          <button onClick={() => setIsOrderNow(false)} disabled={submitting} style={{ ...btnSecondaryStyle, width: '100%' }}>إلغاء</button>
        </div>
      )}
    </div>
  );
}

function FormField({ label, error, children }: any) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: SUB, marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 12, color: DANGER, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {error}</p>}
    </div>
  );
}

function SelectWithArrow({ children, value, onChange, disabled }: any) {
  return (
    <div style={{ position: 'relative' }}>
      <ChevronDown size={13} style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
      <select disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className="sb-input" style={{ paddingInlineStart: 36 }}>
        {children}
      </select>
    </div>
  );
}

const qtyBtnStyle: React.CSSProperties = { width: 36, height: 36, minHeight: 36, background: 'transparent', border: 'none', color: TXT, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const btnPrimaryStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.875rem 1.5rem', minHeight: 44, background: A, color: '#04141c', fontWeight: 900, fontSize: '0.9rem', border: 'none', borderRadius: 2, cursor: 'pointer', fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: 1 };
const btnSecondaryStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.875rem 1.5rem', minHeight: 44, background: 'transparent', color: TXT, fontWeight: 700, fontSize: '0.9rem', border: `1px solid ${BD2}`, borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit' };

/* ================================= CART ==================================== */
export function Cart({ domain, store }: any) {
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fd, setFd] = useState({
    customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); } catch { setItems([]); }
  }, [domain]);

  useEffect(() => { if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [store]);

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

  const cartTotal = items.reduce((s, it) => s + Number(it.finalPrice || 0) * Number(it.quantity || 1), 0);
  const finalTotal = cartTotal + getLiv();

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    localStorage.setItem(domain, JSON.stringify(next));
    initCount(next.length);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.customerName = 'الاسم مطلوب';
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) errs.customerPhone = 'رقم هاتف غير صحيح';
    if (!fd.customerWelaya) errs.customerWelaya = 'اختر الولاية';
    if (!fd.customerCommune) errs.customerCommune = 'اختر البلدية';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orders = items.map((it) => ({
        ...fd, product: it.product, productId: it.productId, storeId: it.storeId, userId: it.userId,
        variantDetailId: it.variantDetailId, selectedOffer: it.selectedOffer, selectedVariants: it.selectedVariants,
        platform: it.platform, quantity: it.quantity, finalPrice: it.finalPrice,
        totalPrice: Number(it.finalPrice) * Number(it.quantity) + getLiv(), priceLivraison: getLiv(),
      }));
      await fetch(`${API_URL}/orders/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orders) });
      localStorage.removeItem(domain);
      initCount(0);
      setSuccess(true);
    } catch { /* noop */ }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="sb-container" style={{ padding: '90px 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 28, marginBottom: 12, color: A }}>تم إرسال طلبك ✓</h1>
        <p style={{ color: SUB, marginBottom: 26 }}>سيتم التواصل معك قريباً لتأكيد الطلب.</p>
        <Link href="/" style={{ ...btnPrimaryStyle, textDecoration: 'none', display: 'inline-flex' }}>العودة للمتجر</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="sb-container" style={{ padding: '90px 1.5rem', textAlign: 'center' }}>
        <ShoppingCart size={48} color={BD2} style={{ marginBottom: 16 }} />
        <h1 style={{ fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 24, marginBottom: 10 }}>سلتك فارغة</h1>
        <Link href="/" style={{ ...btnPrimaryStyle, textDecoration: 'none', display: 'inline-flex' }}>تسوق الآن</Link>
      </div>
    );
  }

  return (
    <div className="sb-container" style={{ padding: '40px 1.5rem 70px' }}>
      <h1 style={{ fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 26, marginBottom: 26 }}>سلة المشتريات</h1>
      <div className="sb-cart-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it, i) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            return (
              <div key={i} style={{ display: 'flex', gap: 14, border: `1px solid ${BD}`, background: CARD, padding: 12 }}>
                <div style={{ width: 76, height: 76, flexShrink: 0, background: SURF, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <PlaceholderIcon size={26} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 6px' }}>{it.product?.name}</p>
                  <p style={{ color: SUB, fontSize: 12.5, margin: 0 }}>الكمية: {it.quantity}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <button onClick={() => removeItem(i)} style={{ background: 'transparent', border: 'none', color: DANGER, cursor: 'pointer' }}><Trash2 size={17} /></button>
                  <span style={{ whiteSpace: 'nowrap', fontFamily: FONT_MONO, fontWeight: 700, color: A }}>{(Number(it.finalPrice) * Number(it.quantity)).toLocaleString('fr-FR')} دج</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ border: `1px solid ${BD}`, background: CARD, padding: 20, alignSelf: 'flex-start' }}>
          <h2 style={{ fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 17, marginBottom: 16 }}>معلومات التوصيل</h2>
          <FormField label="الاسم الكامل" error={errors.customerName}>
            <input className="sb-input" value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" />
          </FormField>
          <FormField label="رقم الهاتف" error={errors.customerPhone}>
            <input className="sb-input" value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0555 xx xx xx" />
          </FormField>
          <div className="sb-form-row-2">
            <FormField label="الولاية" error={errors.customerWelaya}>
              <SelectWithArrow disabled={wilayas.length === 0} value={fd.customerWelaya} onChange={(v: string) => setFd({ ...fd, customerWelaya: v, customerCommune: '' })}>
                <option value="">{wilayas.length === 0 ? 'التوصيل غير متاح حالياً' : 'اختر الولاية'}</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </SelectWithArrow>
            </FormField>
            <FormField label="البلدية" error={errors.customerCommune}>
              <SelectWithArrow disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune} onChange={(v: string) => setFd({ ...fd, customerCommune: v })}>
                <option value="">{loadingC ? 'جاري التحميل...' : 'اختر البلدية'}</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </SelectWithArrow>
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {(['home', 'office'] as const).map((t) => (
              <button key={t} onClick={() => setFd({ ...fd, typeLivraison: t })} style={{
                minHeight: 44, border: `1px solid ${fd.typeLivraison === t ? A : BD}`, background: fd.typeLivraison === t ? AL : 'transparent',
                color: fd.typeLivraison === t ? A : TXT, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>{t === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب'}</button>
            ))}
          </div>

          <div style={{ background: SURF, border: `1px solid ${BD}`, padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0', fontSize: 13.5, color: SUB }}>
              <span style={{ flexShrink: 0 }}>المجموع</span>
              <span style={{ whiteSpace: 'nowrap', fontFamily: FONT_MONO, color: TXT, fontWeight: 600 }}>{cartTotal.toLocaleString('fr-FR')} دج</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0', fontSize: 13.5, color: SUB }}>
              <span style={{ flexShrink: 0 }}>التوصيل</span>
              <span style={{ whiteSpace: 'nowrap', fontFamily: FONT_MONO, color: TXT, fontWeight: 600 }}>{selW ? `${getLiv().toLocaleString('fr-FR')} دج` : '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 10, marginTop: 6, borderTop: `1px solid ${BD}`, fontWeight: 900 }}>
              <span>الإجمالي</span>
              <span style={{ whiteSpace: 'nowrap', fontFamily: FONT_MONO, color: A, fontSize: 16 }}>{finalTotal.toLocaleString('fr-FR')} دج</span>
            </div>
          </div>

          <button className="sb-btn-primary" onClick={submitOrder} disabled={submitting} style={{ ...btnPrimaryStyle, width: '100%' }}>
            {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ STATIC PAGES ================================= */
function Shell({ title, children }: any) {
  return (
    <div>
      <div style={{
        background: `linear-gradient(135deg, #060a14 0%, #0a1224 100%)`, borderBottom: `1px solid ${BD}`,
        padding: '60px 1.5rem', textAlign: 'center',
      }}>
        <h1 style={{ fontFamily: FONT_HEAD, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, fontSize: 'clamp(1.6rem,4vw,2.4rem)', color: A, margin: 0 }}>{title}</h1>
      </div>
      <div className="sb-container" style={{ padding: '40px 1.5rem 70px', display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 820 }}>
        {children}
      </div>
    </div>
  );
}
function InfoBlock({ title, body }: any) {
  return (
    <div>
      <h2 style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 18, marginBottom: 10, color: TXT }}>{title}</h2>
      <p style={{ color: SUB, fontSize: 14.5, lineHeight: 1.9 }}>{body}</p>
    </div>
  );
}

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية">
      <InfoBlock title="جمع المعلومات" body="نقوم بجمع المعلومات الضرورية فقط لإتمام عملية الطلب والتوصيل، مثل الاسم ورقم الهاتف والعنوان." />
      <InfoBlock title="استخدام المعلومات" body="تُستخدم بياناتك حصراً لمعالجة طلباتك والتواصل معك بخصوصها، ولا تتم مشاركتها مع أي جهة خارجية دون موافقتك." />
      <InfoBlock title="حماية البيانات" body="نتخذ الإجراءات التقنية اللازمة لحماية بياناتك من أي وصول أو استخدام غير مصرح به." />
    </Shell>
  );
}
export function Terms() {
  return (
    <Shell title="الشروط والأحكام">
      <InfoBlock title="الطلبات" body="يتم تأكيد الطلب بعد التواصل مع العميل، ويحتفظ المتجر بحق إلغاء أي طلب غير مكتمل البيانات." />
      <InfoBlock title="الأسعار" body="جميع الأسعار المعروضة تشمل العملة المحلية وقد تتغير دون إشعار مسبق." />
      <InfoBlock title="التوصيل" body="مدة التوصيل تختلف حسب الولاية، وتُحتسب رسوم التوصيل بشكل منفصل عن سعر المنتج." />
    </Shell>
  );
}
export function Cookies() {
  return (
    <Shell title="سياسة الكوكيز">
      <InfoBlock title="ما هي الكوكيز" body="ملفات صغيرة تُخزَّن في متصفحك لتحسين تجربة التصفح وتذكر محتوى سلة مشترياتك." />
      <InfoBlock title="استخدامنا للكوكيز" body="نستخدم الكوكيز فقط لأغراض تشغيلية أساسية مثل حفظ محتوى السلة، دون تتبع إعلاني." />
      <InfoBlock title="التحكم" body="يمكنك تعطيل الكوكيز من إعدادات متصفحك، مع العلم أن ذلك قد يؤثر على بعض وظائف المتجر." />
    </Shell>
  );
}

export function Contact({ store }: any) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      setSent(true);
    } catch { /* noop */ }
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div className="sb-container" style={{ padding: '90px 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 26, marginBottom: 12, color: A }}>تم إرسال رسالتك ✓</h1>
        <p style={{ color: SUB, marginBottom: 22 }}>سنتواصل معك في أقرب وقت.</p>
        <button className="sb-btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }} style={btnSecondaryStyle}>إرسال رسالة أخرى</button>
      </div>
    );
  }

  return (
    <div className="sb-container" style={{ padding: '50px 1.5rem 70px' }}>
      <h1 style={{ fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 28, marginBottom: 30 }}>تواصل معنا</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }} className="sb-details-inner">
        <div>
          {store?.contact?.phone && <p style={{ display: 'flex', alignItems: 'center', gap: 10, color: SUB, marginBottom: 14 }}><Phone size={16} color={A} /> {store.contact.phone}</p>}
          {store?.contact?.email && <p style={{ display: 'flex', alignItems: 'center', gap: 10, color: SUB, marginBottom: 14 }}><Mail size={16} color={A} /> {store.contact.email}</p>}
          {(store?.contact?.wilaya || store?.contact?.address) && <p style={{ display: 'flex', alignItems: 'center', gap: 10, color: SUB }}><MapPin size={16} color={A} /> {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' — ')}</p>}
        </div>
        <div>
          <FormField label="الاسم"><input className="sb-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="البريد الإلكتروني"><input className="sb-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
          <FormField label="الهاتف"><input className="sb-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></FormField>
          <FormField label="الرسالة"><textarea className="sb-input" rows={5} style={{ resize: 'none' }} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></FormField>
          <button className="sb-btn-primary" onClick={submit} disabled={submitting} style={{ ...btnPrimaryStyle, width: '100%' }}>{submitting ? 'جاري الإرسال...' : 'إرسال'}</button>
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  if (p === 'privacy') return <Privacy />;
  if (p === 'terms') return <Terms />;
  if (p === 'cookies') return <Cookies />;
  if (p === 'contact') return <Contact store={store} />;
  return null;
}