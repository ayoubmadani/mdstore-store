'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DOMPurify from 'dompurify';
import {
  Search, ShoppingCart, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  Star, Truck, ShieldCheck, Headphones, Cpu, Trash2, Plus, Minus,
  AlertCircle, Phone, Mail, MapPin, Zap, Gamepad2, ImageOff, CheckCircle2, Loader2,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

/* ============================================================================
   eSports Epic Store — MdStore Theme (FR)
   Gaming / eSports — dark, angular, neon-accent theme.
   Structural direction: asymmetric hero with an oversized headline overlapping
   a clipped image tile, bordered eyebrow-label product cards, condensed
   uppercase display type paired with monospace price/labels, snappy motion,
   chip-style category nav with a letter-spacing shift on active state.
   ============================================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ---------- Design tokens ---------- */
const BG = '#0A0C10';
const CARD = '#12151B';
const SURF = '#1A1E26';
const BD = '#262B34';
const BD2 = '#333A46';
const TXT = '#F4F6F8';
const SUB = '#8891A0';
const A = '#39FF6A';
const AL = 'rgba(57,255,106,0.12)';
const AD = '#28D157';
const DANGER = '#FF3B5C';
const FONT_DISPLAY = "'Oswald', 'Arial Narrow', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";
const FONT_BODY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const cut = (px: number): React.CSSProperties => ({
  clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${px}px), calc(100% - ${px}px) 100%, 0 100%)`,
});

function fmtPrice(n: number, currency?: string) {
  return `${Math.round(n).toLocaleString('fr-FR')} ${currency || 'DA'}`;
}

/* ============================================================================
   2. Types (preserved as-is)
   ============================================================================ */

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

interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}

/* ============================================================================
   3. Helpers / Fixed API
   ============================================================================ */

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const res = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const res = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/* ============================================================================
   Shared inline-style tokens (form elements, buttons — §19)
   ============================================================================ */

const inputBase: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem',
  border: `1px solid ${BD2}`, borderRadius: 0, background: SURF, color: TXT,
  outline: 'none', appearance: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit',
};
const inputErr: React.CSSProperties = { borderColor: DANGER };
const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: SUB, marginBottom: 8,
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '0.875rem 1.5rem', minHeight: 44, background: A, color: '#06110A', fontWeight: 800,
  fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', borderRadius: 0,
  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', width: '100%',
};
const btnSecondary: React.CSSProperties = { ...btnPrimary, background: 'transparent', color: TXT, border: `1px solid ${BD2}` };

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: '0.75rem', color: DANGER, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

/* ============================================================================
   Global styles (breakpoints — §18)
   ============================================================================ */

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

      .esf-root { background:${BG}; color:${TXT}; font-family:${FONT_BODY}; }
      .esf-root * { box-sizing:border-box; }
      .esf-root a { color:inherit; text-decoration:none; }
      .esf-root button { font-family:inherit; }
      .esf-root select option { background:${SURF}; color:${TXT}; }

      .esf-container { max-width:1280px; margin:0 auto; padding:0 1.5rem; }

      .esf-nav-links { display:flex; align-items:center; gap:28px; }
      .esf-nav-burger { display:none; }
      @media (max-width:700px) {
        .esf-nav-links { display:none; }
        .esf-nav-burger { display:flex; }
      }

      .esf-search-drop { position:absolute; top:calc(100% + 8px); right:0; width:340px; }
      @media (max-width:480px) {
        .esf-search-drop { position:fixed; left:12px; right:12px; width:auto; top:64px; }
      }

.esf-trust-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1px; background:${BD}; }
      @media (min-width:768px) { .esf-trust-grid { grid-template-columns:repeat(4,1fr); } }

      .esf-cat-row { display:flex; flex-wrap:wrap; gap:10px; }

      .esf-products-grid { display:grid; grid-template-columns:1fr; gap:1.1rem; }
      @media (min-width:640px)  { .esf-products-grid { grid-template-columns:repeat(2,1fr); } }
      @media (min-width:1024px) { .esf-products-grid { grid-template-columns:repeat(3,1fr); } }
      @media (min-width:1280px) { .esf-products-grid { grid-template-columns:repeat(4,1fr); } }

      .esf-details-inner { display:grid; grid-template-columns:1fr; gap:2.5rem; }
      @media (min-width:768px) { .esf-details-inner { grid-template-columns:1fr 1fr; } }

      .esf-cart-inner { display:grid; grid-template-columns:1fr; gap:2rem; }
      @media (min-width:1024px) { .esf-cart-inner { grid-template-columns:1fr 1fr; } }

      .esf-form-row-2 { display:grid; grid-template-columns:1fr; gap:0.875rem; margin-bottom:0.875rem; }
      @media (min-width:500px) { .esf-form-row-2 { grid-template-columns:1fr 1fr; } }

      .esf-footer-grid { display:grid; grid-template-columns:1fr; gap:2.5rem; }
      @media (min-width:768px) { .esf-footer-grid { grid-template-columns:1.3fr 1fr 1fr; } }

      .esf-attr-row { display:flex; flex-wrap:wrap; gap:10px; }
      .esf-thumbs { display:flex; gap:10px; overflow-x:auto; }

      .esf-btn { transition:background .12s linear, border-color .12s linear, transform .08s linear; }
      .esf-btn:active { transform:scale(0.97); }
      .esf-chip { transition:border-color .12s linear, color .12s linear, letter-spacing .12s linear; }

      .esf-mobile-overlay { position:fixed; inset:0; z-index:100; background:${BG}; overflow-y:auto; }

      @keyframes esf-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      .esf-spin { animation:esf-spin 0.8s linear infinite; }
    `}</style>
  );
}

/* ============================================================================
   4. Main
   ============================================================================ */

export default function Main({ store, children, domain }: { store: any; children: React.ReactNode; domain: string }) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="esf-root" dir="ltr" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalStyle />
      <Navbar store={store} domain={domain} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ============================================================================
   5. Navbar
   ============================================================================ */

export function Navbar({ store, domain }: { store: any; domain: string }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setListSearch([]);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setListSearch(Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : []);
      } catch {
        setListSearch([]);
      } finally {
        setLoading(false);
      }
    }, 380);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, domain]);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
  };

  const showCart = store?.cart !== false;
  const mobileLinks = [
    { h: '/', l: 'Accueil' },
    { h: '/contact', l: 'Contact' },
  ];

  return (
    <>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: A, color: '#06110A', textAlign: 'center', padding: '7px 12px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', fontFamily: FONT_MONO }}>
          {store.topBar.text}
        </div>
      )}

      <header
        style={{
          position: 'sticky', top: 0, zIndex: 60,
          background: scrolled ? 'rgba(10,12,16,0.92)' : BG,
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          borderBottom: `1px solid ${scrolled ? BD : 'transparent'}`,
          transition: 'background .2s, border-color .2s',
        }}
      >
        <div className="esf-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {store?.design?.logoUrl && !imgError ? (
              <img
                src={store.design.logoUrl}
                alt={store?.name || 'Boutique'}
                onError={() => setImgError(true)}
                style={{ height: 36, width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <>
                <div style={{ width: 34, height: 34, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...cut(8) }}>
                  <Gamepad2 size={19} color="#06110A" />
                </div>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '1.15rem', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {store?.name || 'Boutique'}
                </span>
              </>
            )}
          </Link>

          <nav className="esf-nav-links">
            <Link href="/" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: SUB }}>Accueil</Link>
            <Link href="/contact" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: SUB }}>Contact</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <button
                aria-label="Rechercher"
                onClick={() => setShowSearch((v) => !v)}
                style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${BD}`, color: TXT, cursor: 'pointer', ...cut(6) }}
                className="esf-btn"
              >
                <Search size={17} />
              </button>
              {showSearch && (
                <div className="esf-search-drop" style={{ background: CARD, border: `1px solid ${BD2}`, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 70 }}>
                  <form onSubmit={submitSearch} style={{ display: 'flex', borderBottom: `1px solid ${BD}` }}>
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un produit..."
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: TXT, padding: '12px 14px', fontSize: '0.9rem', fontFamily: 'inherit' }}
                    />
                    <button type="submit" style={{ width: 44, background: A, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Search size={16} color="#06110A" />
                    </button>
                  </form>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {loading && (
                      <div style={{ padding: 16, color: SUB, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Loader2 size={14} className="esf-spin" /> Recherche...
                      </div>
                    )}
                    {!loading && searchQuery.trim().length >= 2 && listSearch.length === 0 && (
                      <div style={{ padding: 16, color: SUB, fontSize: '0.85rem' }}>Aucun résultat pour « {searchQuery} »</div>
                    )}
                    {!loading && listSearch.slice(0, 6).map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${(p as any).slug || p.id}`}
                        onClick={() => setShowSearch(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${BD}` }}
                      >
                        <div style={{ width: 40, height: 40, background: SURF, flexShrink: 0, overflow: 'hidden' }}>
                          {p.productImage ? (
                            <img src={p.productImage} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={14} color={SUB} /></div>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ fontSize: '0.78rem', color: A, fontFamily: FONT_MONO }}>{fmtPrice(Number(p.price))}</div>
                        </div>
                      </Link>
                    ))}
                    {!loading && listSearch.length > 0 && (
                      <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearch(false)} style={{ display: 'block', textAlign: 'center', padding: 12, fontSize: '0.8rem', fontWeight: 700, color: A, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Voir tous les résultats
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {showCart && (
              <Link href="/cart" aria-label="Panier" style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${BD}`, ...cut(6) }} className="esf-btn">
                <ShoppingCart size={17} />
                {count > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -6, background: A, color: '#06110A', fontSize: '0.65rem', fontWeight: 800, minWidth: 18, height: 18, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', fontFamily: FONT_MONO }}>
                    {count}
                  </span>
                )}
              </Link>
            )}

            <button
              className="esf-nav-burger esf-btn"
              aria-label="Menu"
              onClick={() => setOpen(true)}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${BD}`, color: TXT, cursor: 'pointer', ...cut(6) }}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="esf-mobile-overlay">
          <div className="esf-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{store?.name || 'Menu'}</span>
            <button onClick={() => setOpen(false)} aria-label="Fermer" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${BD}`, color: TXT, cursor: 'pointer', ...cut(6) }}>
              <X size={18} />
            </button>
          </div>
          <nav className="esf-container" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 20 }}>
            {mobileLinks.map((lnk) => (
              <Link
                key={lnk.h}
                href={lnk.h}
                onClick={() => setOpen(false)}
                style={{ padding: '18px 4px', borderBottom: `1px solid ${BD}`, fontFamily: FONT_DISPLAY, fontSize: '1.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}
              >
                {lnk.l}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

/* ============================================================================
   6. Footer
   ============================================================================ */

export function Footer({ store }: { store: any }) {
  const showCart = store?.cart !== false;
  const year = new Date().getFullYear();
  const links = [
    { h: '/', l: 'Accueil' },
    { h: '/cart', l: 'Panier' },
    { h: '/contact', l: 'Contact' },
    { h: '/privacy', l: 'Confidentialité' },
    { h: '/terms', l: 'Conditions' },
  ].filter((lnk) => lnk.h !== '/cart' || showCart);

  return (
    <footer style={{ background: '#07080B', borderTop: `1px solid ${BD}`, marginTop: 60 }}>
      <div className="esf-container" style={{ padding: '3.5rem 1.5rem 2rem' }}>
        <div className="esf-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...cut(7) }}>
                <Gamepad2 size={16} color="#06110A" />
              </div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase' }}>{store?.name || 'Boutique'}</span>
            </div>
            <p style={{ color: SUB, fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 340 }}>
              {store?.hero?.subtitle || "Équipement gaming et eSports pour joueurs exigeants."}
            </p>
            <p style={{ color: SUB, fontSize: '0.78rem', marginTop: 18, fontFamily: FONT_MONO }}>
              © {year} {store?.name || 'Boutique'}. Tous droits réservés.
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: FONT_DISPLAY, fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: TXT, marginBottom: 18 }}>Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {links.map((lnk) => (
                <Link key={lnk.h} href={lnk.h} style={{ color: SUB, fontSize: '0.88rem' }}>{lnk.l}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: FONT_DISPLAY, fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: TXT, marginBottom: 18 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {store?.contact?.phone && (
                <a href={`tel:${store.contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: SUB, fontSize: '0.88rem' }}>
                  <Phone size={14} color={A} /> {store.contact.phone}
                </a>
              )}
              {store?.contact?.email && (
                <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: SUB, fontSize: '0.88rem' }}>
                  <Mail size={14} color={A} /> {store.contact.email}
                </a>
              )}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: SUB, fontSize: '0.88rem' }}>
                  <MapPin size={14} color={A} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{[store?.contact?.address, store?.contact?.wilaya].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================================
   7. Card
   ============================================================================ */

export function Card({ product, displayImage, discount, store, viewDetails }: {
  product: Product; displayImage?: string; discount?: number; store?: any; viewDetails?: (p: Product) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;
  const price = Number(product.price);
  const priceOriginal = product.priceOriginal ? Number(product.priceOriginal) : undefined;
  const category = (product as any).category?.name || (product as any).categoryName;

  return (
    <Link
      href={`/product/${(product as any).slug || product.id}`}
      onClick={() => viewDetails?.(product)}
      style={{ display: 'block', background: CARD, border: `1px solid ${BD}`, overflow: 'hidden', ...cut(16) }}
      className="esf-btn"
    >
      <div style={{ position: 'relative', aspectRatio: '1 / 1', background: SURF }}>
        {img && !imgErr ? (
          <img src={img} alt={product.name} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageOff size={28} color={SUB} />
          </div>
        )}
        {!!discount && discount > 0 && (
          <span style={{ position: 'absolute', top: 10, left: 10, background: A, color: '#06110A', fontSize: '0.72rem', fontWeight: 800, padding: '4px 8px', fontFamily: FONT_MONO, ...cut(5) }}>
            -{discount}%
          </span>
        )}
      </div>
      <div style={{ padding: '14px 14px 16px' }}>
        {category && (
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: A, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6, fontFamily: FONT_MONO }}>
            {category}
          </div>
        )}
        <h3 style={{
          fontSize: '0.92rem', fontWeight: 600, color: TXT, margin: 0, marginBottom: 8, lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.5em',
        }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} fill={A} color={A} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: FONT_MONO }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: TXT }}>{fmtPrice(price, store?.currency)}</span>
          {priceOriginal !== undefined && priceOriginal > price && (
            <span style={{ fontSize: '0.8rem', color: SUB, textDecoration: 'line-through' }}>{fmtPrice(priceOriginal, store?.currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ============================================================================
   8. Home
   ============================================================================ */

export function Home({ store, page }: { store: any; page?: number | string }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const products: Product[] = store?.products || [];
  const cats = store?.categories || [];
  const currentPage = Number(page) || Number(searchParams.get('page')) || 1;
  const countPage = Math.max(1, Math.ceil((store?.count || products.length) / 48));
  const showCart = store?.cart !== false;

  const heroTitle = store?.hero?.title || 'PASSEZ AU<br/>NIVEAU SUPÉRIEUR';
  const heroSubtitle = store?.hero?.subtitle || "L'équipement gaming choisi par les pros. Périphériques, consoles et accessoires eSports livrés partout en Algérie.";

  return (
    <div>
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${BD}`, background: BG, minHeight: 'clamp(480px, 68vh, 760px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {store?.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,12,16,0.15) 0%, rgba(10,12,16,0.6) 50%, rgba(10,12,16,0.97) 100%)' }} />
        <div className="esf-container" style={{ padding: '3rem 1.5rem clamp(3rem,6vw,5rem)', position: 'relative', width: '100%' }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: AL, border: `1px solid ${A}`, padding: '6px 12px', marginBottom: 20, ...cut(4) }}>
              <Zap size={12} color={A} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: A, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT_MONO }}>
                Édition eSports
              </span>
            </div>
            <h1
              style={{
                fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase',
                fontSize: 'clamp(2.25rem, 6vw, 4.25rem)', lineHeight: 1.02, letterSpacing: '0.01em',
                color: TXT, margin: 0, marginBottom: 20,
              }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(heroTitle) }}
            />
            <p style={{ color: SUB, fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.7, maxWidth: 460, marginBottom: 30 }}>
              {heroSubtitle}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <a href="#produits" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: A, color: '#06110A', padding: '0.9rem 1.8rem', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', ...cut(8) }} className="esf-btn">
                Voir la boutique <ChevronRight size={16} />
              </a>
              {showCart && (
                <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(10,12,16,0.5)', color: TXT, border: `1px solid ${BD2}`, padding: '0.9rem 1.8rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', ...cut(8) }} className="esf-btn">
                  <ShoppingCart size={16} /> Panier
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="esf-trust-grid">
        {[
          { icon: Truck, t: 'Livraison Rapide', s: 'Partout en Algérie' },
          { icon: ShieldCheck, t: 'Paiement Sécurisé', s: 'Vos données protégées' },
          { icon: Cpu, t: 'Qualité Gamer', s: 'Matériel certifié' },
          { icon: Headphones, t: 'Support 24/7', s: 'Toujours disponible' },
        ].map((item, i) => (
          <div key={i} style={{ background: CARD, padding: '1.4rem 1.2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <item.icon size={20} color={A} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: TXT }}>{item.t}</div>
              <div style={{ fontSize: '0.74rem', color: SUB }}>{item.s}</div>
            </div>
          </div>
        ))}
      </section>

      <div className="esf-container" id="produits" style={{ padding: '3rem 1.5rem' }}>
        {cats.length > 0 && (
          <div className="esf-cat-row" style={{ marginBottom: '2.2rem' }}>
            <Link
              href="/"
              className="esf-chip"
              style={{
                padding: '9px 18px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: !activeCategory ? '0.1em' : '0.04em',
                border: `1px solid ${!activeCategory ? A : BD2}`, color: !activeCategory ? A : SUB,
                background: !activeCategory ? AL : 'transparent',
              }}
            >
              Tout
            </Link>
            {cats.map((cat: any) => {
              const isActive = activeCategory === String(cat.id);
              return (
                <Link
                  key={cat.id}
                  href={`?category=${cat.id}`}
                  className="esf-chip"
                  style={{
                    padding: '9px 18px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: isActive ? '0.1em' : '0.04em',
                    border: `1px solid ${isActive ? A : BD2}`, color: isActive ? A : SUB,
                    background: isActive ? AL : 'transparent',
                  }}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        )}

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: SUB }}>
            <Gamepad2 size={40} color={BD2} style={{ marginBottom: 16 }} />
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div className="esf-products-grid">
            {products.map((p) => {
              const price = Number(p.price);
              const priceOriginal = p.priceOriginal ? Number(p.priceOriginal) : undefined;
              const discount = priceOriginal && priceOriginal > price ? Math.round(((priceOriginal - price) / priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} discount={discount} store={store} />;
            })}
          </div>
        )}

        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: '3rem', flexWrap: 'wrap' }}>
            {Array.from({ length: countPage }).map((_, i) => {
              const p = i + 1;
              const isActive = p === currentPage;
              return (
                <Link
                  key={p}
                  href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), page: p } }}
                  scroll={false}
                  style={{
                    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: FONT_MONO, fontSize: '0.85rem', fontWeight: 700,
                    background: isActive ? A : 'transparent', color: isActive ? '#06110A' : SUB,
                    border: `1px solid ${isActive ? A : BD}`,
                  }}
                >
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   9. Details
   ============================================================================ */

export function Details({
  product, discount, allImages, allAttrs, finalPrice, selectedVariants,
  setSelectedOffer, selectedOffer, handleVariantSelection, domain,
}: {
  product: Product; discount?: number; allImages: string[]; allAttrs: Attribute[]; finalPrice: number;
  selectedVariants: Record<string, string>; setSelectedOffer: (id: string | null) => void; selectedOffer: string | null;
  handleVariantSelection: (name: string, value: string) => void; domain: string;
}) {
  const [sel, setSel] = useState(0);
  const images = allImages && allImages.length > 0 ? allImages : (product.productImage ? [product.productImage] : []);

  return (
    <div className="esf-container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      <div className="esf-details-inner">
        <div>
          <div style={{ position: 'relative', aspectRatio: '1 / 1', background: CARD, border: `1px solid ${BD}`, overflow: 'hidden', marginBottom: 14, ...cut(24) }}>
            {images.length > 0 ? (
              <img src={images[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageOff size={40} color={SUB} />
              </div>
            )}
            {!!discount && discount > 0 && (
              <span style={{ position: 'absolute', top: 14, left: 14, background: A, color: '#06110A', fontSize: '0.75rem', fontWeight: 800, padding: '5px 10px', fontFamily: FONT_MONO, ...cut(5) }}>
                -{discount}%
              </span>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSel((s) => (s - 1 + images.length) % images.length)}
                  aria-label="Image précédente"
                  style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', width: 44, height: 44, background: 'rgba(10,12,16,0.7)', border: `1px solid ${BD2}`, color: TXT, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setSel((s) => (s + 1) % images.length)}
                  aria-label="Image suivante"
                  style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', width: 44, height: 44, background: 'rgba(10,12,16,0.7)', border: `1px solid ${BD2}`, color: TXT, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="esf-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSel(i)}
                  style={{ width: 68, height: 68, flexShrink: 0, background: CARD, border: `2px solid ${i === sel ? A : BD}`, padding: 0, cursor: 'pointer', overflow: 'hidden' }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)', lineHeight: 1.15, margin: 0, marginBottom: 10, color: TXT }}>
            {product.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 18 }}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill={A} color={A} />)}
          </div>

          <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '1.2rem 1.4rem', marginBottom: 22, ...cut(10) }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: '1.9rem', fontWeight: 700, color: A }}>
              {fmtPrice(finalPrice)}
            </span>
          </div>

          {product.offers && product.offers.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: SUB, marginBottom: 10 }}>Offres groupées</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o) => (
                  <label
                    key={o.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
                      border: `1px solid ${selectedOffer === o.id ? A : BD}`, background: selectedOffer === o.id ? AL : 'transparent', cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ accentColor: A }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{o.name}</span>
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: A }}>{fmtPrice(o.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {allAttrs && allAttrs.length > 0 && allAttrs.map((attr) => (
            <div key={attr.id} style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: SUB, marginBottom: 10 }}>{attr.name}</h4>
              <div className="esf-attr-row">
                {attr.variants.map((v) => {
                  const isSel = selectedVariants[attr.name] === v.value;
                  if (attr.displayMode === 'color') {
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleVariantSelection(attr.name, v.value)}
                        title={v.value}
                        style={{ width: 34, height: 34, borderRadius: '50%', background: v.value, border: `2px solid ${isSel ? A : BD2}`, cursor: 'pointer', boxShadow: isSel ? `0 0 0 2px ${BG}, 0 0 0 4px ${A}` : 'none' }}
                      />
                    );
                  }
                  if (attr.displayMode === 'image') {
                    return (
                      <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: 48, height: 48, border: `2px solid ${isSel ? A : BD}`, padding: 0, cursor: 'pointer', overflow: 'hidden' }}>
                        <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </button>
                    );
                  }
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleVariantSelection(attr.name, v.value)}
                      style={{ padding: '9px 16px', border: `1px solid ${isSel ? A : BD2}`, background: isSel ? AL : 'transparent', color: isSel ? A : TXT, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: FONT_MONO }}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <ProductForm
            product={product}
            userId={product.store?.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
          />
        </div>
      </div>

      {product.desc && (
        <div style={{ marginTop: '3.5rem', borderTop: `1px solid ${BD}`, paddingTop: '2.5rem' }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase', fontSize: '1.2rem', marginBottom: 16 }}>Description</h3>
          <div style={{ color: SUB, fontSize: '0.92rem', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   10. ProductForm
   ============================================================================ */

export function ProductForm({
  product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss,
}: ProductFormProps) {
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: priceLoss || 0,
    typeLivraison: 'home' as 'home' | 'office',
  });

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (userId) fetchWilayas(userId).then(setWilayas);
  }, [userId]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getFP = useCallback((): number => {
    if (selectedOffer && product.offers) {
      const o = product.offers.find((x) => x.id === selectedOffer);
      if (o) return o.price;
    }
    if (product.variantDetails && product.variantDetails.length > 0) {
      const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return Number(product.price);
  }, [selectedOffer, product, selectedVariants]);

  const fp = getFP();

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const total = () => fp * fd.quantity + getLiv();

  const getVarId = (): string | number | null => {
    if (!product.variantDetails || product.variantDetails.length === 0) return null;
    const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
    return match ? match.id : null;
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.customerName = 'Le nom est requis';
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) errs.customerPhone = 'Numéro de téléphone invalide';
    if (!fd.customerWelaya) errs.customerWelaya = 'Sélectionnez une wilaya';
    if (!fd.customerCommune) errs.customerCommune = 'Sélectionnez une commune';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = () => ({
    ...fd,
    product,
    productId: product.id,
    storeId: product.store?.id,
    userId,
    variantDetailId: getVarId(),
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
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      const items = Array.isArray(arr) ? arr : [];
      items.push(buildPayload());
      localStorage.setItem(domain, JSON.stringify(items));
      initCount(items.length);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2200);
    } catch {
      // localStorage unavailable — ignore silently
    }
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json().catch(() => ({}));
      localStorage.setItem('customerId', data?.customerId || '');
      router.push(`/successfully?productId=${product.id}`);
    } catch {
      setErrors({ submit: 'Une erreur est survenue, veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  };

  const showCartBtn = product.store?.cart === true;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '1.2rem 1.4rem', marginBottom: 18 }}>
        {[
          { l: 'Prix', v: fmtPrice(fp) },
          { l: 'Quantité', v: `× ${fd.quantity}` },
          { l: 'Livraison', v: selW ? fmtPrice(getLiv()) : '—' },
        ].map((row) => (
          <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '0.86rem', color: SUB }}>
            <span>{row.l}</span>
            <span style={{ fontFamily: FONT_MONO, color: TXT, fontWeight: 600 }}>{row.v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTop: `1px solid ${BD}`, fontWeight: 700 }}>
          <span>Total</span>
          <span style={{ fontFamily: FONT_MONO, color: A, fontSize: '1.05rem' }}>{fmtPrice(total())}</span>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={fieldLabel}>Quantité</label>
        <div style={{ display: 'inline-flex', border: `1px solid ${BD2}` }}>
          <button type="button" onClick={() => setFd((s) => ({ ...s, quantity: Math.max(1, s.quantity - 1) }))} style={{ width: 40, height: 40, background: 'transparent', border: 'none', color: TXT, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Minus size={15} />
          </button>
          <span style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontWeight: 700, borderLeft: `1px solid ${BD2}`, borderRight: `1px solid ${BD2}` }}>{fd.quantity}</span>
          <button type="button" onClick={() => setFd((s) => ({ ...s, quantity: s.quantity + 1 }))} style={{ width: 40, height: 40, background: 'transparent', border: 'none', color: TXT, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={15} />
          </button>
        </div>
      </div>

      {!isOrderNow ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" onClick={() => setIsOrderNow(true)} style={btnPrimary} className="esf-btn">
            Commander maintenant
          </button>
          {showCartBtn && (
            <button type="button" onClick={addToCart} style={btnSecondary} className="esf-btn">
              <ShoppingCart size={16} /> {addedToCart ? 'Ajouté au panier ✓' : 'Ajouter au panier'}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={submitOrder} style={{ borderTop: `1px solid ${BD}`, paddingTop: 20 }}>
          <div className="esf-form-row-2">
            <div>
              <label style={fieldLabel}>Nom complet</label>
              <input
                value={fd.customerName}
                onChange={(e) => setFd((s) => ({ ...s, customerName: e.target.value }))}
                style={{ ...inputBase, ...(errors.customerName ? inputErr : {}) }}
                placeholder="Votre nom"
              />
              <ErrorText msg={errors.customerName} />
            </div>
            <div>
              <label style={fieldLabel}>Téléphone</label>
              <input
                value={fd.customerPhone}
                onChange={(e) => setFd((s) => ({ ...s, customerPhone: e.target.value }))}
                style={{ ...inputBase, ...(errors.customerPhone ? inputErr : {}) }}
                placeholder="0555 12 34 56"
              />
              <ErrorText msg={errors.customerPhone} />
            </div>
          </div>

          <div className="esf-form-row-2">
            <div>
              <label style={fieldLabel}>Wilaya</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                <select
                  disabled={wilayas.length === 0}
                  value={fd.customerWelaya}
                  onChange={(e) => setFd((s) => ({ ...s, customerWelaya: e.target.value, customerCommune: '' }))}
                  style={{ ...inputBase, paddingRight: 36, ...(errors.customerWelaya ? inputErr : {}) }}
                >
                  <option value="">{wilayas.length === 0 ? 'Livraison indisponible pour le moment' : 'Choisir la wilaya'}</option>
                  {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.name}</option>)}
                </select>
              </div>
              <ErrorText msg={errors.customerWelaya} />
            </div>
            <div>
              <label style={fieldLabel}>Commune</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                <select
                  disabled={!fd.customerWelaya || loadingC}
                  value={fd.customerCommune}
                  onChange={(e) => setFd((s) => ({ ...s, customerCommune: e.target.value }))}
                  style={{ ...inputBase, paddingRight: 36, ...(errors.customerCommune ? inputErr : {}) }}
                >
                  <option value="">{loadingC ? 'Chargement...' : 'Choisir la commune'}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <ErrorText msg={errors.customerCommune} />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={fieldLabel}>Type de livraison</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ k: 'home', l: 'À domicile' }, { k: 'office', l: 'Point relais' }].map((opt) => {
                const active = fd.typeLivraison === opt.k;
                return (
                  <button
                    key={opt.k}
                    type="button"
                    onClick={() => setFd((s) => ({ ...s, typeLivraison: opt.k as 'home' | 'office' }))}
                    style={{
                      padding: '0.85rem 1rem', minHeight: 44, fontSize: '0.85rem', fontWeight: 700,
                      background: active ? AL : 'transparent', border: `1px solid ${active ? A : BD2}`, color: active ? A : SUB, cursor: 'pointer',
                    }}
                  >
                    {opt.l}
                  </button>
                );
              })}
            </div>
          </div>

          {errors.submit && (
            <p style={{ fontSize: '0.8rem', color: DANGER, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={13} /> {errors.submit}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.65 : 1, cursor: submitting ? 'default' : 'pointer' }} className="esf-btn">
              {submitting ? 'Envoi en cours...' : 'Confirmer la commande'}
            </button>
            <button type="button" onClick={() => setIsOrderNow(false)} style={btnSecondary} className="esf-btn">
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ============================================================================
   11. Cart
   ============================================================================ */

export function Cart({ domain, store }: { domain: string; store: any }) {
  const initCount = useCartStore((s: any) => s.initCount);

  const [items, setItems] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [fd, setFd] = useState({
    customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(arr) ? arr : []);
    } catch {
      setItems([]);
    } finally {
      setLoaded(true);
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

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.customerName = 'Le nom est requis';
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) errs.customerPhone = 'Numéro de téléphone invalide';
    if (!fd.customerWelaya) errs.customerWelaya = 'Sélectionnez une wilaya';
    if (!fd.customerCommune) errs.customerCommune = 'Sélectionnez une commune';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = items.map((it) => ({
        ...it, ...fd,
        priceLivraison: getLiv(),
        totalPrice: Number(it.finalPrice || 0) * Number(it.quantity || 1) + getLiv(),
      }));
      await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      localStorage.removeItem(domain);
      initCount(0);
      setItems([]);
      setSuccess(true);
    } catch {
      setErrors({ submit: 'Une erreur est survenue, veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!loaded) return null;

  if (success) {
    return (
      <div className="esf-container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <CheckCircle2 size={56} color={A} style={{ marginBottom: 20 }} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase', fontSize: '1.8rem', marginBottom: 12 }}>Commande confirmée</h1>
        <p style={{ color: SUB, marginBottom: 26 }}>Merci pour votre commande, notre équipe vous contactera bientôt.</p>
        <Link href="/" style={{ ...btnPrimary, display: 'inline-flex', width: 'auto', padding: '0.875rem 2rem' }}>Retour à la boutique</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="esf-container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <ShoppingCart size={48} color={BD2} style={{ marginBottom: 18 }} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase', fontSize: '1.6rem', marginBottom: 10 }}>Votre panier est vide</h1>
        <p style={{ color: SUB, marginBottom: 26 }}>Découvrez notre sélection de matériel gaming et eSports.</p>
        <Link href="/" style={{ ...btnPrimary, display: 'inline-flex', width: 'auto', padding: '0.875rem 2rem' }}>Voir la boutique</Link>
      </div>
    );
  }

  return (
    <div className="esf-container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', marginBottom: 28 }}>Mon Panier</h1>
      <div className="esf-cart-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, background: CARD, border: `1px solid ${BD}`, padding: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 88, height: 88, background: SURF, flexShrink: 0, overflow: 'hidden' }}>
                {(it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl) ? (
                  <img src={it.product.productImage || it.product?.imagesProduct?.[0]?.imageUrl} alt={it.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={22} color={SUB} /></div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{it.product?.name}</h3>
                  <button onClick={() => removeItem(i)} aria-label="Supprimer" style={{ background: 'transparent', border: 'none', color: SUB, cursor: 'pointer', flexShrink: 0, padding: 4 }}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <p style={{ color: SUB, fontSize: '0.78rem', margin: '6px 0 8px' }}>Qté : {it.quantity}</p>
                <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: A, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{fmtPrice(Number(it.finalPrice || 0) * Number(it.quantity || 1))}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '1.4rem', marginBottom: 18 }}>
            {[
              { l: 'Sous-total', v: fmtPrice(cartTotal), c: TXT },
              { l: 'Livraison', v: selW ? fmtPrice(getLiv()) : '—', c: TXT },
            ].map(row => (
              <div key={row.l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: '0.86rem', color: SUB, gap: 12 }}>
                <span style={{ flexShrink: 0 }}>{row.l}</span>
                <span style={{ fontFamily: FONT_MONO, color: row.c, fontWeight: 600, whiteSpace: 'nowrap' }}>{row.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTop: `1px solid ${BD}`, fontWeight: 700, gap: 12 }}>
              <span style={{ flexShrink: 0 }}>Total</span>
              <span style={{ fontFamily: FONT_MONO, color: A, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>{fmtPrice(finalTotal)}</span>
            </div>
          </div>

          <form onSubmit={submitOrder}>
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={fieldLabel}>Nom complet</label>
              <input value={fd.customerName} onChange={(e) => setFd((s) => ({ ...s, customerName: e.target.value }))} style={{ ...inputBase, ...(errors.customerName ? inputErr : {}) }} placeholder="Votre nom" />
              <ErrorText msg={errors.customerName} />
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={fieldLabel}>Téléphone</label>
              <input value={fd.customerPhone} onChange={(e) => setFd((s) => ({ ...s, customerPhone: e.target.value }))} style={{ ...inputBase, ...(errors.customerPhone ? inputErr : {}) }} placeholder="0555 12 34 56" />
              <ErrorText msg={errors.customerPhone} />
            </div>
            <div className="esf-form-row-2">
              <div>
                <label style={fieldLabel}>Wilaya</label>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                  <select disabled={wilayas.length === 0} value={fd.customerWelaya} onChange={(e) => setFd((s) => ({ ...s, customerWelaya: e.target.value, customerCommune: '' }))} style={{ ...inputBase, paddingRight: 36, ...(errors.customerWelaya ? inputErr : {}) }}>
                    <option value="">{wilayas.length === 0 ? 'Livraison indisponible pour le moment' : 'Choisir la wilaya'}</option>
                    {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.name}</option>)}
                  </select>
                </div>
                <ErrorText msg={errors.customerWelaya} />
              </div>
              <div>
                <label style={fieldLabel}>Commune</label>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: SUB }} />
                  <select disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune} onChange={(e) => setFd((s) => ({ ...s, customerCommune: e.target.value }))} style={{ ...inputBase, paddingRight: 36, ...(errors.customerCommune ? inputErr : {}) }}>
                    <option value="">{loadingC ? 'Chargement...' : 'Choisir la commune'}</option>
                    {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <ErrorText msg={errors.customerCommune} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={fieldLabel}>Type de livraison</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ k: 'home', l: 'À domicile' }, { k: 'office', l: 'Point relais' }].map((opt) => {
                  const active = fd.typeLivraison === opt.k;
                  return (
                    <button
                      key={opt.k}
                      type="button"
                      onClick={() => setFd((s) => ({ ...s, typeLivraison: opt.k as 'home' | 'office' }))}
                      style={{ padding: '0.85rem 1rem', minHeight: 44, fontSize: '0.85rem', fontWeight: 700, background: active ? AL : 'transparent', border: `1px solid ${active ? A : BD2}`, color: active ? A : SUB, cursor: 'pointer' }}
                    >
                      {opt.l}
                    </button>
                  );
                })}
              </div>
            </div>
            {errors.submit && (
              <p style={{ fontSize: '0.8rem', color: DANGER, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={13} /> {errors.submit}
              </p>
            )}
            <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.65 : 1, cursor: submitting ? 'default' : 'pointer' }} className="esf-btn">
              {submitting ? 'Envoi en cours...' : 'Valider la commande'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   12. Static Pages
   ============================================================================ */

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ position: 'relative', background: CARD, borderBottom: `1px solid ${BD}`, padding: '4rem 1.5rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 20%, ${AL}, transparent 60%)` }} />
        <div className="esf-container" style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', margin: 0 }}>{title}</h1>
        </div>
      </div>
      <div className="esf-container" style={{ padding: '3rem 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 860 }}>
        {children}
      </div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: 10, color: A }}>{title}</h3>
      <p style={{ color: SUB, fontSize: '0.92rem', lineHeight: 1.85 }}>{body}</p>
    </div>
  );
}

export function Privacy() {
  return (
    <Shell title="Politique de Confidentialité">
      <InfoBlock
        title="Collecte des données"
        body="Nous collectons uniquement les informations nécessaires au traitement de votre commande : nom, numéro de téléphone, wilaya et commune de livraison. Aucune donnée bancaire n'est stockée sur nos serveurs."
      />
      <InfoBlock
        title="Utilisation des données"
        body="Vos informations servent exclusivement à la préparation, l'expédition et le suivi de votre commande, ainsi qu'à vous contacter en cas de besoin. Elles ne sont jamais revendues à des tiers."
      />
      <InfoBlock
        title="Vos droits"
        body="Vous pouvez à tout moment demander l'accès, la modification ou la suppression de vos données personnelles en nous contactant via la page Contact."
      />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="Conditions Générales">
      <InfoBlock
        title="Commandes"
        body="Toute commande passée sur la boutique est soumise à confirmation par notre équipe. Les prix affichés incluent les frais de livraison calculés selon la wilaya sélectionnée."
      />
      <InfoBlock
        title="Livraison"
        body="Les délais de livraison varient selon la wilaya et le mode choisi (à domicile ou point relais). Un retard éventuel ne peut engager la responsabilité de la boutique au-delà d'un effort raisonnable de suivi."
      />
      <InfoBlock
        title="Retours et échanges"
        body="Tout produit reçu endommagé ou non conforme peut faire l'objet d'un retour ou d'un échange dans un délai raisonnable après réception, sous réserve de contact préalable via la page Contact."
      />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="Politique de Cookies">
      <InfoBlock
        title="Qu'est-ce qu'un cookie"
        body="Un cookie est un petit fichier stocké sur votre appareil qui permet à la boutique de mémoriser certaines de vos préférences, comme le contenu de votre panier, entre deux visites."
      />
      <InfoBlock
        title="Cookies utilisés"
        body="Nous utilisons uniquement des cookies fonctionnels nécessaires au bon fonctionnement du panier et de la navigation. Aucun cookie publicitaire tiers n'est utilisé sur cette boutique."
      />
      <InfoBlock
        title="Gestion des cookies"
        body="Vous pouvez désactiver les cookies à tout moment depuis les paramètres de votre navigateur, en gardant à l'esprit que cela peut affecter le fonctionnement du panier."
      />
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      setSent(true);
    } catch {
      setError('Une erreur est survenue, veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ position: 'relative', background: CARD, borderBottom: `1px solid ${BD}`, padding: '4rem 1.5rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 20%, ${AL}, transparent 60%)` }} />
        <div className="esf-container" style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', margin: 0 }}>Contactez-nous</h1>
        </div>
      </div>

      <div className="esf-container" style={{ padding: '3rem 1.5rem 4rem' }}>
        <div className="esf-details-inner">
          <div>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: 20 }}>Informations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {store?.contact?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, background: AL, border: `1px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Phone size={16} color={A} /></div>
                  <span style={{ color: SUB, fontSize: '0.9rem' }}>{store.contact.phone}</span>
                </div>
              )}
              {store?.contact?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, background: AL, border: `1px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mail size={16} color={A} /></div>
                  <span style={{ color: SUB, fontSize: '0.9rem' }}>{store.contact.email}</span>
                </div>
              )}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 38, height: 38, background: AL, border: `1px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MapPin size={16} color={A} /></div>
                  <span style={{ color: SUB, fontSize: '0.9rem' }}>{[store?.contact?.address, store?.contact?.wilaya].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            {sent ? (
              <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <CheckCircle2 size={40} color={A} style={{ marginBottom: 14 }} />
                <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Message envoyé</h3>
                <p style={{ color: SUB, fontSize: '0.88rem', marginBottom: 20 }}>Merci de nous avoir contactés, nous répondrons rapidement.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
                  style={{ background: 'transparent', border: `1px solid ${BD2}`, color: TXT, padding: '0.7rem 1.4rem', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="esf-form-row-2">
                  <div>
                    <label style={fieldLabel}>Nom</label>
                    <input required value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} style={inputBase} placeholder="Votre nom" />
                  </div>
                  <div>
                    <label style={fieldLabel}>Téléphone</label>
                    <input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} style={inputBase} placeholder="Votre téléphone" />
                  </div>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <label style={fieldLabel}>Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} style={inputBase} placeholder="votre@email.com" />
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <label style={fieldLabel}>Message</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} style={{ ...inputBase, resize: 'none' }} placeholder="Votre message..." />
                </div>
                {error && (
                  <p style={{ fontSize: '0.8rem', color: DANGER, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={13} /> {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '0.875rem 1.8rem', minHeight: 44, background: A, color: '#06110A', fontWeight: 800,
                    fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none',
                    cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.65 : 1,
                  }}
                  className="esf-btn"
                >
                  {submitting ? 'Envoi...' : 'Envoyer le message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: { staticPage?: string; page?: string; store?: any }) {
  const p = (staticPage || page || '').toLowerCase();
  if (p === 'privacy') return <Privacy />;
  if (p === 'terms') return <Terms />;
  if (p === 'cookies') return <Cookies />;
  if (p === 'contact') return <Contact store={store} />;
  return null;
}