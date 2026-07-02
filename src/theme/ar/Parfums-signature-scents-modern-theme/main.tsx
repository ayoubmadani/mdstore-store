'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import {
  ShoppingBag, Search, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  Star, Trash2, Plus, Minus, Phone, Mail, MapPin, AlertCircle, Sparkles,
  Gift, Truck, ShieldCheck, Headphones, Check,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

/* ============================================================
   Signature Scents — Modern Perfume Theme (AR / RTL)
   Design: bright coral + gold, asymmetric hero, floating rounded
   cards, filled-pill category chips, El Messiri + IBM Plex Sans Arabic.
   ============================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const BG = '#FFF8F3';
const CARD = '#FFFFFF';
const TXT = '#241220';
const SUB = '#8A7A85';
const BD = '#F3E1E6';
const A = '#FF4D6D';
const AD = '#E63958';
const AL = '#FFE6EC';
const GOLD = '#D4A542';
const GOLD_L = '#FBF0DC';

const FONT_HEAD = "'El Messiri', 'Tahoma', sans-serif";
const FONT_BODY = "'IBM Plex Sans Arabic', 'Tahoma', sans-serif";

/* ---------------- Types ---------------- */
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
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

/* ---------------- Helpers ---------------- */
const fmt = (n: number) => Math.round(n).toLocaleString('ar-DZ');

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

function getVarId(product: Product, selectedVariants: Record<string, string>): string | number | null {
  if (!product.variantDetails?.length) return null;
  const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
  return match ? match.id : null;
}

async function fetchWilayas(uid: string): Promise<Wilaya[]> {
  if (!uid) return [];
  try {
    const r = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

async function fetchCommunes(wid: string): Promise<Commune[]> {
  if (!wid) return [];
  try {
    const r = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

const PHONE_RE = /^(0|\+213)[5-7]\d{8}$/;

/* ---------------- Shared CSS ---------------- */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
body { font-family: ${FONT_BODY}; background: ${BG}; color: ${TXT}; margin: 0; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(50%); } }
@keyframes badgeBounce { 0% { transform: scale(1); } 40% { transform: scale(1.4); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }

.container { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }

.card { transition: transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease; animation: fadeUp 0.5s ease both; }
.card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 40px rgba(255,77,109,0.18); }
.card-img { transition: transform 0.5s ease; overflow: hidden; }
.card:hover .card-img { transform: scale(1.08); }

.btn-primary { transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,77,109,0.28); background: ${AD}; }
.btn-primary:active { transform: translateY(0) scale(0.97); }

.nav-link { position: relative; }
.nav-link::after { content: ''; position: absolute; bottom: -4px; right: 0; left: 0; height: 2px; background: ${A}; transform: scaleX(0); transition: transform 0.25s ease; }
.nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); }

.cat-chip { transition: all 0.2s ease; }
.cat-chip.active { background: ${A}; color: #fff; border-color: ${A}; }
.cat-chip:not(.active):hover { border-color: ${A}; color: ${A}; }

.hero-float { animation: float 4s ease-in-out infinite; }
.hero-title { animation: fadeUp 0.7s ease 0.1s both; }
.hero-sub { animation: fadeUp 0.7s ease 0.25s both; }
.hero-cta { animation: fadeUp 0.7s ease 0.4s both; }
.hero-badge { animation: scaleIn 0.5s ease 0.55s both; }

.skeleton { background: linear-gradient(90deg, #f3e1e6 25%, #fbeef1 50%, #f3e1e6 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; border-radius: 16px; }

.cart-badge-animate { animation: badgeBounce 0.4s ease; }

.input-field { transition: border-color 0.2s, box-shadow 0.2s; }
.input-field:focus { border-color: ${A}; box-shadow: 0 0 0 3px ${AL}; outline: none; }

.nav-links { display: flex; align-items: center; gap: 28px; }
.nav-burger { display: none; }
@media (max-width: 860px) { .nav-links { display: none; } .nav-burger { display: flex; } }

.products-grid { display: grid; grid-template-columns: 1fr; gap: 1.1rem; }
@media (min-width: 640px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

.form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
@media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

.cart-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 1024px) { .cart-inner { grid-template-columns: 1.2fr 1fr; } }
.details-inner { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
@media (min-width: 768px) { .details-inner { grid-template-columns: 1fr 1fr; } }

.hero-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: center; }
@media (min-width: 900px) { .hero-grid { grid-template-columns: 1.2fr 0.8fr; } }

.footer-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .footer-grid { grid-template-columns: repeat(3, 1fr); } }

.search-dropdown { position: absolute; top: calc(100% + 10px); left: 0; width: 340px; }
@media (max-width: 480px) { .search-dropdown { position: fixed; left: 12px; right: 12px; width: auto; top: 70px; } }

@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
`;

function GlobalStyle() {
  return <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />;
}

/* ---------------- Logo ---------------- */
function StoreLogo({ store, size = 40 }: any) {
  const [err, setErr] = useState(false);
  const url = store?.design?.logoUrl;
  if (url && !err) {
    return <img src={url} alt={store?.name} onError={() => setErr(true)} style={{ height: size, width: size, objectFit: 'contain', borderRadius: 10 }} />;
  }
  const initials = (store?.name || 'S').trim().slice(0, 2);
  return (
    <div style={{ height: size, width: size, borderRadius: 10, background: `linear-gradient(135deg, ${A}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontFamily: FONT_HEAD, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
}

/* ============================================================
   Main
   ============================================================ */
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
    <div dir="rtl" style={{ fontFamily: FONT_BODY, background: BG, color: TXT, minHeight: '100vh' }}>
      <GlobalStyle />
      <Navbar store={store} domain={domain} />
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        <main>{children}</main>
      </div>
      <Footer store={store} />
    </div>
  );
}

/* ============================================================
   Navbar
   ============================================================ */
export function Navbar({ store, domain }: any) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      initCount(arr.length);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setListSearch([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const d = await r.json();
        setListSearch(Array.isArray(d) ? d : d?.products || []);
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  const showCart = store?.cart !== false;

  const mobileLinks = [
    { h: '/', l: 'الرئيسية' },
    { h: '/contact', l: 'تواصل معنا' },
  ];

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200, background: scrolled ? 'rgba(255,248,243,0.92)' : BG,
      backdropFilter: scrolled ? 'blur(10px)' : 'none', borderBottom: `1px solid ${BD}`,
      transition: 'background 0.3s ease',
    }}>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: `linear-gradient(90deg, ${A}, ${AD})`, color: '#fff', textAlign: 'center', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>
          {store.topBar.text}
        </div>
      )}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 74 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <StoreLogo store={store} />
          <span style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 20, color: TXT }}>{store?.name}</span>
        </Link>

        <nav className="nav-links">
          <Link href="/" className="nav-link" style={{ textDecoration: 'none', color: TXT, fontWeight: 600, fontSize: 15 }}>الرئيسية</Link>
          <Link href="/contact" className="nav-link" style={{ textDecoration: 'none', color: TXT, fontWeight: 600, fontSize: 15 }}>تواصل معنا</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <button onClick={() => setShowSearch((s) => !s)} aria-label="بحث" style={{ background: 'none', border: 'none', cursor: 'pointer', color: TXT, display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Search size={20} />
          </button>

          {showSearch && (
            <div className="search-dropdown" style={{ background: CARD, borderRadius: 16, boxShadow: '0 20px 50px rgba(36,18,32,0.18)', border: `1px solid ${BD}`, padding: 14, zIndex: 250 }}>
              <form onSubmit={submitSearch} style={{ display: 'flex', gap: 8 }}>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن عطرك..."
                  className="input-field"
                  style={{ flex: 1, padding: '10px 14px', border: `1px solid ${BD}`, borderRadius: 10, fontFamily: 'inherit', fontSize: 14, background: BG, color: TXT }}
                />
                <button type="submit" className="btn-primary" style={{ background: A, color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', cursor: 'pointer' }}>
                  <Search size={16} />
                </button>
              </form>
              {loading && <div style={{ padding: 10, fontSize: 13, color: SUB }}>جاري البحث...</div>}
              {!loading && listSearch.length > 0 && (
                <div style={{ marginTop: 10, maxHeight: 320, overflowY: 'auto' }}>
                  {listSearch.slice(0, 5).map((p) => (
                    <Link key={p.id} href={`/product/${p.id}`} onClick={() => setShowSearch(false)} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 6px', textDecoration: 'none', color: TXT, borderRadius: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: AL, flexShrink: 0 }}>
                        {(p.productImage || p.imagesProduct?.[0]?.imageUrl) && (
                          <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                    </Link>
                  ))}
                  <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearch(false)} style={{ display: 'block', textAlign: 'center', padding: 10, color: A, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    عرض كل النتائج
                  </Link>
                </div>
              )}
            </div>
          )}

          {showCart && (
            <Link href="/cart" aria-label="السلة" style={{ position: 'relative', color: TXT, display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="cart-badge-animate" style={{ position: 'absolute', top: 2, right: 2, background: A, color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {count}
                </span>
              )}
            </Link>
          )}

          <button className="nav-burger" onClick={() => setOpen(true)} aria-label="القائمة" style={{ background: 'none', border: 'none', cursor: 'pointer', color: TXT, minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(36,18,32,0.4)' }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: 280, background: CARD, padding: 24, boxShadow: '-10px 0 40px rgba(0,0,0,0.2)', animation: 'fadeIn 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <StoreLogo store={store} size={36} />
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TXT }}><X size={22} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mobileLinks.map((l) => (
                <Link key={l.h} href={l.h} onClick={() => setOpen(false)} style={{ padding: '14px 10px', textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: 16, borderBottom: `1px solid ${BD}` }}>
                  {l.l}
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
   Footer
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
    <footer style={{ background: TXT, color: '#fff', marginTop: 60 }}>
      <div className="container" style={{ padding: '3.5rem 1.5rem 2rem' }}>
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <StoreLogo store={store} size={38} />
              <span style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 19 }}>{store?.name}</span>
            </div>
            <p style={{ color: '#C9B8C4', fontSize: 14, lineHeight: 1.8, maxWidth: 280 }}>{store?.hero?.subtitle}</p>
            <p style={{ color: '#8A7A85', fontSize: 12, marginTop: 18 }}>© {year} {store?.name}. جميع الحقوق محفوظة.</p>
          </div>
          <div>
            <h4 style={{ fontFamily: FONT_HEAD, fontSize: 16, marginBottom: 16, color: GOLD }}>روابط سريعة</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {links.map((l) => (
                <Link key={l.h} href={l.h} style={{ color: '#C9B8C4', textDecoration: 'none', fontSize: 14 }}>{l.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: FONT_HEAD, fontSize: 16, marginBottom: 16, color: GOLD }}>تواصل معنا</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {store?.contact?.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C9B8C4', fontSize: 14 }}><Phone size={15} /> {store.contact.phone}</span>
              )}
              {store?.contact?.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C9B8C4', fontSize: 14 }}><Mail size={15} /> {store.contact.email}</span>
              )}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C9B8C4', fontSize: 14 }}>
                  <MapPin size={15} /> {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   Card
   ============================================================ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;
  const price = Number(product.price);
  const priceOriginal = product.priceOriginal ? Number(product.priceOriginal) : null;

  return (
    <Link href={`/product/${(product as any).slug || product.id}`} className="card" style={{ textDecoration: 'none', color: TXT, display: 'block' }}>
      <div style={{ background: CARD, borderRadius: 22, overflow: 'hidden', boxShadow: '0 6px 20px rgba(36,18,32,0.06)', border: `1px solid ${BD}` }}>
        <div className="card-img" style={{ position: 'relative', aspectRatio: '1/1', background: AL }}>
          {discount > 0 && (
            <span style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, background: A, color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 999 }}>
              {`خصم %${discount}`}
            </span>
          )}
          {img && !imgErr ? (
            <img src={img} alt={product.name} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={40} color={GOLD} />
            </div>
          )}
        </div>
        <div style={{ padding: '14px 16px 18px' }}>
          <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={GOLD} color={GOLD} />)}
          </div>
          <h3 style={{
            fontFamily: FONT_HEAD, fontSize: 15.5, fontWeight: 700, margin: '0 0 8px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40,
          }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 17, color: A }}>{fmt(price)} {store?.currency || 'دج'}</span>
            {priceOriginal && priceOriginal > price && (
              <span style={{ fontSize: 13, color: SUB, textDecoration: 'line-through' }}>{fmt(priceOriginal)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   Home
   ============================================================ */
export function Home({ store, page }: any) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const products: Product[] = store?.products || [];
  const cats = store?.categories || [];
  const currentPage = Number(page) || 1;
  const countPage = Math.max(1, Math.ceil((store?.count || products.length) / 48));

  return (
    <div>
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${AL} 0%, ${GOLD_L} 100%)`, minHeight: 'clamp(480px, 68vh, 760px)', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ width: '100%', padding: '3rem 1.5rem' }}>
          {/* Marquee ticker */}
          <div className="hero-badge" style={{ overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: 24, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, padding: '8px 0' }}>
            <div style={{ display: 'inline-flex', gap: 40, animation: 'marquee 18s linear infinite', width: 'max-content' }}>
              {[...Array(2)].map((_, i) => (
                <React.Fragment key={i}>
                  {['الأكثر مبيعاً', 'مجموعات هدايا', 'عطور يومية', 'إصدار جديد', 'عروض محدودة'].map((t) => (
                    <span key={t} style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 13, letterSpacing: 1, color: AD, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={13} color={GOLD} /> {t}
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="hero-grid">
            <div>
              <h1
                className="hero-title"
                style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 'clamp(2rem, 6vw, 3.6rem)', lineHeight: 1.15, margin: '0 0 18px', color: TXT }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || 'عطورك المُوقّعة، كل يوم') }}
              />
              <p className="hero-sub" style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: SUB, lineHeight: 1.8, margin: '0 0 30px', maxWidth: 460 }}>
                {store?.hero?.subtitle || 'مجموعة مختارة من العطور اليومية ومجموعات الهدايا المميزة، بجودة عالية وأسعار مناسبة.'}
              </p>
              <div className="hero-cta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href="#products" className="btn-primary" style={{ background: A, color: '#fff', fontWeight: 700, padding: '15px 30px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
                  تسوّق الآن <ChevronLeft size={16} />
                </a>
                {store?.cart !== false && (
                  <Link href="/cart" style={{ border: `1.5px solid ${TXT}`, color: TXT, fontWeight: 700, padding: '15px 30px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
                    <ShoppingBag size={16} /> السلة
                  </Link>
                )}
              </div>
            </div>
            <div className="hero-float" style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(255,77,109,0.25)' }}>
              {store?.hero?.imageUrl ? (
                <img src={store.hero.imageUrl} alt={store?.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${A}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={70} color="#fff" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ borderBottom: `1px solid ${BD}`, background: CARD }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, padding: '2rem 1.5rem' }}>
          {[
            { icon: <Truck size={20} color={A} />, t: 'توصيل سريع لكل الولايات' },
            { icon: <ShieldCheck size={20} color={A} />, t: 'جودة أصلية مضمونة' },
            { icon: <Gift size={20} color={A} />, t: 'تغليف هدايا فاخر' },
            { icon: <Headphones size={20} color={A} />, t: 'دعم متواصل' },
          ].map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{it.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{it.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {cats.length > 0 && (
        <section className="container" style={{ padding: '2.5rem 1.5rem 0' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/" className={`cat-chip ${!activeCategory ? 'active' : ''}`} style={{ padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${BD}`, textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: 13.5 }}>
              الكل
            </Link>
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} className={`cat-chip ${activeCategory === String(cat.id) ? 'active' : ''}`} style={{ padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${BD}`, textDecoration: 'none', color: TXT, fontWeight: 700, fontSize: 13.5 }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section id="products" className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
        <div className="products-grid">
          {products.map((p, i) => {
            const price = Number(p.price);
            const priceOriginal = p.priceOriginal ? Number(p.priceOriginal) : null;
            const discount = priceOriginal && priceOriginal > price ? Math.round(((priceOriginal - price) / priceOriginal) * 100) : 0;
            return (
              <div key={p.id} style={{ animationDelay: `${i * 0.06}s` }}>
                <Card product={p} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={discount} store={store} viewDetails />
              </div>
            );
          })}
        </div>
        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: SUB }}>لا توجد منتجات متاحة حالياً.</div>
        )}

        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40, flexWrap: 'wrap' }}>
            {[...Array(countPage)].map((_, i) => (
              <Link key={i} href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), page: i + 1 } }} scroll={false}
                style={{
                  minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12,
                  background: currentPage === i + 1 ? A : CARD, color: currentPage === i + 1 ? '#fff' : TXT,
                  border: `1.5px solid ${currentPage === i + 1 ? A : BD}`, textDecoration: 'none', fontWeight: 700, fontSize: 14,
                }}>
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   Details
   ============================================================ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);
  const images: string[] = allImages?.length ? allImages : (product.imagesProduct?.map((i: ProductImage) => i.imageUrl) || (product.productImage ? [product.productImage] : []));

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      <div className="details-inner">
        {/* Gallery */}
        <div>
          <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 24, overflow: 'hidden', background: AL, marginBottom: 14 }}>
            {images.length > 0 ? (
              <img src={images[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={60} color={GOLD} /></div>
            )}
            {discount > 0 && (
              <span style={{ position: 'absolute', top: 14, right: 14, background: A, color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 12px', borderRadius: 999 }}>{`خصم %${discount}`}</span>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setSel((s) => (s === 0 ? images.length - 1 : s - 1))} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}><ChevronRight size={18} /></button>
                <button onClick={() => setSel((s) => (s === images.length - 1 ? 0 : s + 1))} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}><ChevronLeft size={18} /></button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
              {images.map((im, i) => (
                <button key={i} onClick={() => setSel(i)} style={{ width: 66, height: 66, borderRadius: 12, overflow: 'hidden', border: `2px solid ${sel === i ? A : BD}`, padding: 0, cursor: 'pointer', flexShrink: 0 }}>
                  <img src={im} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>{[...Array(5)].map((_, i) => <Star key={i} size={15} fill={GOLD} color={GOLD} />)}</div>
          <h1 style={{ fontFamily: FONT_HEAD, fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 700, margin: '0 0 14px' }}>{product.name}</h1>
          <div style={{ fontSize: 26, fontWeight: 800, color: A, marginBottom: 20 }}>{fmt(finalPrice)} {product.store && (product as any).currency || 'دج'}</div>

          {product.offers && product.offers.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>اختر العرض</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o: Offer) => (
                  <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1.5px solid ${selectedOffer === o.id ? A : BD}`, borderRadius: 14, padding: '12px 16px', cursor: 'pointer', background: selectedOffer === o.id ? AL : CARD }}>
                    <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                    <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{o.name} ({o.quantity})</span>
                    <span style={{ fontWeight: 800, color: A }}>{fmt(o.price)} دج</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {allAttrs?.map((attr: Attribute) => (
            <div key={attr.id} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>{attr.name}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {attr.variants.map((v) => {
                  const active = selectedVariants[attr.name] === v.value;
                  if (attr.displayMode === 'color') {
                    return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: 34, height: 34, borderRadius: '50%', background: v.value, border: `2px solid ${active ? A : BD}`, cursor: 'pointer', boxShadow: active ? `0 0 0 3px ${AL}` : 'none' }} />;
                  }
                  if (attr.displayMode === 'image') {
                    return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: 54, height: 54, borderRadius: 10, overflow: 'hidden', border: `2px solid ${active ? A : BD}`, padding: 0, cursor: 'pointer' }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></button>;
                  }
                  return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '9px 18px', borderRadius: 999, border: `1.5px solid ${active ? A : BD}`, background: active ? AL : CARD, color: active ? A : TXT, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{v.name}</button>;
                })}
              </div>
            </div>
          ))}

          <ProductForm product={product} userId={product.store?.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

          {product.desc && (
            <div style={{ marginTop: 30, paddingTop: 26, borderTop: `1px solid ${BD}` }}>
              <h3 style={{ fontFamily: FONT_HEAD, fontSize: 17, marginBottom: 12 }}>الوصف</h3>
              <div style={{ fontSize: 14, lineHeight: 1.9, color: SUB }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ProductForm
   ============================================================ */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: any) {
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

  const getFP = useCallback((): number => {
    if (selectedOffer && product.offers) {
      const o = product.offers.find((x: Offer) => x.id === selectedOffer);
      if (o) return o.price;
    }
    if (product.variantDetails?.length) {
      const match = product.variantDetails.find((d: VariantDetail) => variantMatches(d, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
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
    if (!fd.customerWelaya) e.customerWelaya = 'اختر الولاية';
    if (!fd.customerCommune) e.customerCommune = 'اختر البلدية';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    ...fd, product, productId: product.id, storeId: product.store?.id, userId,
    variantDetailId: getVarId(product, selectedVariants), selectedOffer, selectedVariants, platform,
    finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now(),
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
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()),
      });
      const d = await r.json();
      if (fd.customerId || d?.customerId) localStorage.setItem('customerId', d?.customerId || fd.customerId);
      router.push(`/successfully?productId=${product.id}`);
    } catch { setSubmitting(false); }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.8rem 1rem', fontSize: '0.9rem', border: `1px solid ${BD}`,
    borderRadius: 12, background: BG, color: TXT, outline: 'none', appearance: 'none',
    transition: 'border-color 0.2s', fontFamily: 'inherit', minHeight: 44,
  };
  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '0.9rem 1.5rem', minHeight: 44, background: A, color: '#fff', fontWeight: 700,
    fontSize: '0.92rem', border: 'none', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: 'inherit', width: '100%',
  };

  const canCart = product.store?.cart === true;

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', border: `1.5px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
          <button onClick={() => setFd((s) => ({ ...s, quantity: Math.max(1, s.quantity - 1) }))} style={{ width: 40, height: 40, border: 'none', background: CARD, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={15} /></button>
          <span style={{ width: 44, textAlign: 'center', fontWeight: 700 }}>{fd.quantity}</span>
          <button onClick={() => setFd((s) => ({ ...s, quantity: s.quantity + 1 }))} style={{ width: 40, height: 40, border: 'none', background: CARD, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={15} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {canCart && (
          <button onClick={addToCart} className="btn-primary" style={{ ...btnPrimary, background: 'transparent', color: A, border: `1.5px solid ${A}`, flex: 1 }}>
            {added ? <><Check size={17} /> أُضيف للسلة</> : <><ShoppingBag size={17} /> أضف للسلة</>}
          </button>
        )}
        <button onClick={() => setIsOrderNow(true)} className="btn-primary" style={{ ...btnPrimary, flex: 1 }}>اطلب الآن</button>
      </div>

      {isOrderNow && (
        <div style={{ marginTop: 24, padding: 22, borderRadius: 18, background: CARD, border: `1px solid ${BD}` }}>
          <div className="form-row-2">
            <div>
              <input placeholder="الاسم الكامل" value={fd.customerName} onChange={(e) => setFd((s) => ({ ...s, customerName: e.target.value }))} className="input-field" style={{ ...inputBase, ...(errors.customerName ? { borderColor: '#EF4444' } : {}) }} />
              {errors.customerName && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {errors.customerName}</p>}
            </div>
            <div>
              <input placeholder="رقم الهاتف" value={fd.customerPhone} onChange={(e) => setFd((s) => ({ ...s, customerPhone: e.target.value }))} className="input-field" style={{ ...inputBase, ...(errors.customerPhone ? { borderColor: '#EF4444' } : {}) }} />
              {errors.customerPhone && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> {errors.customerPhone}</p>}
            </div>
          </div>

          <div className="form-row-2">
            <div style={{ position: 'relative' }}>
              <ChevronDown size={12} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
              <select disabled={wilayas.length === 0} value={fd.customerWelaya} onChange={(e) => setFd((s) => ({ ...s, customerWelaya: e.target.value, customerCommune: '' }))} className="input-field" style={{ ...inputBase, paddingLeft: 36, ...(errors.customerWelaya ? { borderColor: '#EF4444' } : {}) }}>
                <option value="">{wilayas.length === 0 ? 'التوصيل غير متاح حالياً' : 'اختر الولاية'}</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <ChevronDown size={12} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
              <select disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune} onChange={(e) => setFd((s) => ({ ...s, customerCommune: e.target.value }))} className="input-field" style={{ ...inputBase, paddingLeft: 36, ...(errors.customerCommune ? { borderColor: '#EF4444' } : {}) }}>
                <option value="">{loadingC ? 'جاري التحميل...' : 'اختر البلدية'}</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {(['home', 'office'] as const).map((t) => (
              <button key={t} onClick={() => setFd((s) => ({ ...s, typeLivraison: t }))} style={{
                padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', minHeight: 44,
                background: fd.typeLivraison === t ? AL : 'transparent', border: `1.5px solid ${fd.typeLivraison === t ? A : BD}`, color: fd.typeLivraison === t ? A : TXT,
              }}>
                {t === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب'}
              </button>
            ))}
          </div>

          <div style={{ background: BG, borderRadius: 14, padding: 16, marginBottom: 18 }}>
            {[
              { l: 'السعر', v: `${fmt(fp)} دج` },
              { l: 'الكمية', v: `× ${fd.quantity}` },
              { l: 'التوصيل', v: selW ? `${fmt(getLiv())} دج` : '—' },
              { l: 'الإجمالي', v: `${fmt(total())} دج`, bold: true },
            ].map((row) => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ flexShrink: 0, fontSize: row.bold ? 15 : 13.5, fontWeight: row.bold ? 800 : 500, color: row.bold ? TXT : SUB }}>{row.l}</span>
                <span style={{ whiteSpace: 'nowrap', fontWeight: row.bold ? 800 : 600, fontSize: row.bold ? 16 : 13.5, color: row.bold ? A : TXT }}>{row.v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submitOrder} disabled={submitting} className="btn-primary" style={{ ...btnPrimary, flex: 1, opacity: submitting ? 0.65 : 1, cursor: submitting ? 'default' : 'pointer' }}>
              {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
            </button>
            <button onClick={() => setIsOrderNow(false)} disabled={submitting} style={{ padding: '0.9rem 1.5rem', minHeight: 44, background: 'transparent', color: TXT, border: `1.5px solid ${BD}`, borderRadius: 14, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.65 : 1, fontFamily: 'inherit' }}>
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Cart
   ============================================================ */
export function Cart({ domain, store }: any) {
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);
  const [items, setItems] = useState<any[]>([]);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
    const arr = [...items];
    arr.splice(idx, 1);
    setItems(arr);
    localStorage.setItem(domain, JSON.stringify(arr));
    initCount(arr.length);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!PHONE_RE.test(fd.customerPhone)) e.customerPhone = 'رقم هاتف غير صحيح';
    if (!fd.customerWelaya) e.customerWelaya = 'اختر الولاية';
    if (!fd.customerCommune) e.customerCommune = 'اختر البلدية';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || items.length === 0) return;
    setSubmitting(true);
    try {
      const payload = items.map((it) => ({
        ...fd, product: it.product, productId: it.productId, storeId: it.storeId, userId: it.userId,
        variantDetailId: it.variantDetailId, selectedOffer: it.selectedOffer, selectedVariants: it.selectedVariants,
        quantity: it.quantity, finalPrice: it.finalPrice, totalPrice: it.finalPrice * it.quantity + getLiv(), priceLivraison: getLiv(),
      }));
      await fetch(`${API_URL}/orders/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      localStorage.removeItem(domain);
      initCount(0);
      setItems([]);
      setSuccess(true);
    } catch { /* noop */ } finally { setSubmitting(false); }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.8rem 1rem', fontSize: '0.9rem', border: `1px solid ${BD}`,
    borderRadius: 12, background: BG, color: TXT, outline: 'none', appearance: 'none',
    transition: 'border-color 0.2s', fontFamily: 'inherit', minHeight: 44,
  };

  if (success) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={36} color={A} />
        </div>
        <h2 style={{ fontFamily: FONT_HEAD, fontSize: 24, marginBottom: 10 }}>تم إرسال طلبك بنجاح</h2>
        <p style={{ color: SUB, marginBottom: 26 }}>سيتم التواصل معك قريباً لتأكيد الطلب.</p>
        <Link href="/" style={{ background: A, color: '#fff', padding: '14px 30px', borderRadius: 999, textDecoration: 'none', fontWeight: 700 }}>متابعة التسوق</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <ShoppingBag size={48} color={BD} style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, marginBottom: 10 }}>سلتك فارغة</h2>
        <p style={{ color: SUB, marginBottom: 26 }}>لم تقم بإضافة أي عطر بعد.</p>
        <Link href="/" style={{ background: A, color: '#fff', padding: '14px 30px', borderRadius: 999, textDecoration: 'none', fontWeight: 700 }}>تسوّق الآن</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      <h1 style={{ fontFamily: FONT_HEAD, fontSize: 26, marginBottom: 26 }}>سلة المشتريات</h1>
      <div className="cart-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it, idx) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            return (
              <div key={idx} style={{ display: 'flex', gap: 14, background: CARD, borderRadius: 16, padding: 14, border: `1px solid ${BD}` }}>
                <div style={{ width: 74, height: 74, borderRadius: 12, overflow: 'hidden', background: AL, flexShrink: 0 }}>
                  {img ? <img src={img} alt={it.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={22} color={GOLD} /></div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{it.product?.name}</div>
                  <div style={{ fontSize: 13, color: SUB }}>الكمية: {it.quantity}</div>
                  <div style={{ fontWeight: 800, color: A, marginTop: 4 }}>{fmt(Number(it.finalPrice) * Number(it.quantity))} دج</div>
                </div>
                <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', alignSelf: 'flex-start', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={18} /></button>
              </div>
            );
          })}
        </div>

        <div>
          <div style={{ background: CARD, borderRadius: 18, padding: 22, border: `1px solid ${BD}` }}>
            <h3 style={{ fontFamily: FONT_HEAD, fontSize: 17, marginBottom: 16 }}>معلومات التوصيل</h3>
            <div className="form-row-2">
              <div>
                <input placeholder="الاسم الكامل" value={fd.customerName} onChange={(e) => setFd((s) => ({ ...s, customerName: e.target.value }))} className="input-field" style={{ ...inputBase, ...(errors.customerName ? { borderColor: '#EF4444' } : {}) }} />
                {errors.customerName && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>{errors.customerName}</p>}
              </div>
              <div>
                <input placeholder="رقم الهاتف" value={fd.customerPhone} onChange={(e) => setFd((s) => ({ ...s, customerPhone: e.target.value }))} className="input-field" style={{ ...inputBase, ...(errors.customerPhone ? { borderColor: '#EF4444' } : {}) }} />
                {errors.customerPhone && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>{errors.customerPhone}</p>}
              </div>
            </div>
            <div className="form-row-2">
              <select disabled={wilayas.length === 0} value={fd.customerWelaya} onChange={(e) => setFd((s) => ({ ...s, customerWelaya: e.target.value, customerCommune: '' }))} className="input-field" style={inputBase}>
                <option value="">{wilayas.length === 0 ? 'التوصيل غير متاح حالياً' : 'اختر الولاية'}</option>
                {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
              <select disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune} onChange={(e) => setFd((s) => ({ ...s, customerCommune: e.target.value }))} className="input-field" style={inputBase}>
                <option value="">{loadingC ? 'جاري التحميل...' : 'اختر البلدية'}</option>
                {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {(['home', 'office'] as const).map((t) => (
                <button key={t} onClick={() => setFd((s) => ({ ...s, typeLivraison: t }))} style={{ padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', minHeight: 44, background: fd.typeLivraison === t ? AL : 'transparent', border: `1.5px solid ${fd.typeLivraison === t ? A : BD}`, color: fd.typeLivraison === t ? A : TXT }}>
                  {t === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب'}
                </button>
              ))}
            </div>

            <div style={{ background: BG, borderRadius: 14, padding: 16, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ flexShrink: 0, fontSize: 13.5, color: SUB }}>المجموع</span>
                <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{fmt(cartTotal)} دج</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ flexShrink: 0, fontSize: 13.5, color: SUB }}>التوصيل</span>
                <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{selW ? `${fmt(getLiv())} دج` : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0 0', borderTop: `1px solid ${BD}`, marginTop: 6 }}>
                <span style={{ flexShrink: 0, fontSize: 15, fontWeight: 800 }}>الإجمالي</span>
                <span style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: 16, color: A }}>{fmt(finalTotal)} دج</span>
              </div>
            </div>

            <button onClick={submit} disabled={submitting} style={{ width: '100%', minHeight: 44, background: A, color: '#fff', fontWeight: 700, border: 'none', borderRadius: 14, padding: '14px', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.65 : 1, fontFamily: 'inherit' }}>
              {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Static Pages
   ============================================================ */
function Shell({ title, children }: any) {
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${TXT}, #3a1f33)`, color: '#fff', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: FONT_HEAD, fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>{title}</h1>
      </div>
      <div className="container" style={{ padding: '3rem 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: 26 }}>{children}</div>
    </div>
  );
}
function InfoBlock({ title, body }: any) {
  return (
    <div>
      <h3 style={{ fontFamily: FONT_HEAD, fontSize: 18, marginBottom: 10, color: A }}>{title}</h3>
      <p style={{ color: SUB, lineHeight: 1.9, fontSize: 14.5 }}>{body}</p>
    </div>
  );
}

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية">
      <InfoBlock title="جمع المعلومات" body="نقوم بجمع المعلومات الضرورية فقط لإتمام عملية الشراء وتوصيل طلبك، مثل الاسم ورقم الهاتف والعنوان." />
      <InfoBlock title="استخدام المعلومات" body="تُستخدم بياناتك حصرياً لمعالجة الطلبات والتواصل معك بخصوصها، ولا تتم مشاركتها مع أي طرف ثالث." />
      <InfoBlock title="حماية البيانات" body="نتخذ إجراءات أمنية معقولة لحماية معلوماتك الشخصية من أي وصول غير مصرح به." />
    </Shell>
  );
}
export function Terms() {
  return (
    <Shell title="الشروط والأحكام">
      <InfoBlock title="الطلبات" body="يتم تأكيد الطلب بعد التواصل الهاتفي مع العميل، ويحق للمتجر إلغاء أي طلب مشبوه." />
      <InfoBlock title="الأسعار" body="جميع الأسعار المعروضة تشمل المنتج فقط، ويُضاف سعر التوصيل حسب الولاية المختارة." />
      <InfoBlock title="الإرجاع والاستبدال" body="يمكن إرجاع المنتج في حال وجود عيب مصنعي خلال مدة محددة من الاستلام." />
    </Shell>
  );
}
export function Cookies() {
  return (
    <Shell title="سياسة ملفات تعريف الارتباط">
      <InfoBlock title="ما هي الكوكيز" body="هي ملفات صغيرة تُخزَّن في متصفحك لتحسين تجربة تصفحك للموقع." />
      <InfoBlock title="كيف نستخدمها" body="نستخدمها لحفظ محتوى سلتك ولتحليل استخدام الموقع لتحسين خدماتنا." />
      <InfoBlock title="التحكم بالكوكيز" body="يمكنك تعطيل الكوكيز من إعدادات متصفحك، مع العلم أن ذلك قد يؤثر على بعض الوظائف." />
    </Shell>
  );
}

export function Contact({ store }: any) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch(`${API_URL}/user/contact-user/message`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, storeId: store?.id }) });
      setSent(true);
    } catch { /* noop */ } finally { setSending(false); }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.8rem 1rem', fontSize: '0.9rem', border: `1px solid ${BD}`,
    borderRadius: 12, background: BG, color: TXT, outline: 'none', fontFamily: 'inherit', minHeight: 44,
  };

  return (
    <Shell title="تواصل معنا">
      <div className="details-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {store?.contact?.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} color={A} /></div><span>{store.contact.phone}</span></div>}
          {store?.contact?.email && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} color={A} /></div><span>{store.contact.email}</span></div>}
          {(store?.contact?.wilaya || store?.contact?.address) && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={18} color={A} /></div><span>{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(', ')}</span></div>}
        </div>

        {sent ? (
          <div style={{ background: CARD, borderRadius: 18, padding: 30, border: `1px solid ${BD}`, textAlign: 'center' }}>
            <Check size={36} color={A} style={{ marginBottom: 12 }} />
            <p style={{ marginBottom: 18 }}>تم إرسال رسالتك بنجاح، سنتواصل معك قريباً.</p>
            <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }} style={{ background: A, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 22px', fontWeight: 700, cursor: 'pointer' }}>إرسال رسالة أخرى</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: CARD, borderRadius: 18, padding: 24, border: `1px solid ${BD}` }}>
            <input required placeholder="الاسم" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="input-field" style={inputBase} />
            <input required type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} className="input-field" style={inputBase} />
            <input placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} className="input-field" style={inputBase} />
            <textarea required rows={5} placeholder="رسالتك" value={form.message} onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} className="input-field" style={{ ...inputBase, resize: 'none' }} />
            <button type="submit" disabled={sending} style={{ background: A, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontWeight: 700, cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.65 : 1, minHeight: 44 }}>
              {sending ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          </form>
        )}
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
  return null;
}