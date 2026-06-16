'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Phone, Mail, MapPin,
  CheckCircle2, Truck, ArrowLeft,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, ShieldCheck, Heart, Send, Package,
} from 'lucide-react';
import { Store } from '@/types/store';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ─── THEME CSS ─── */
const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-main:     #FFFAF7;
    --bg-alt:      #FFF3EC;
    --bg-card:     #FFFFFF;
    --text-main:   #2D2D2D;
    --text-muted:  #7A7A7A;
    --border:      #F0E8E0;
    --primary:     #FF6B35;
    --primary-dk:  #E55A26;
    --accent:      #4ECDC4;
    --paw:         #FFB347;
  }

  body {
    font-family: 'Tajawal', sans-serif;
    background-color: var(--bg-main);
    color: var(--text-main);
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg-main); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pawBounce { 0%,100% { transform: rotate(-8deg) scale(1); } 50% { transform: rotate(8deg) scale(1.1); } }
  .anim-fade-in { animation: fadeIn 0.45s ease forwards; }

  .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

  .grid-2 { display: grid; grid-template-columns: 1fr; gap: 1rem; }
  @media (min-width: 640px) { .grid-2 { grid-template-columns: 1fr 1fr; } }

  .grid-3 { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  @media (min-width: 640px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }

  .grid-4 { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  @media (min-width: 640px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .grid-4 { grid-template-columns: repeat(4, 1fr); } }

  .btn-primary {
    background: var(--primary); color: #fff; padding: 0.8rem 1.6rem; border-radius: 50px;
    border: none; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.15s;
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
    font-family: 'Tajawal', sans-serif; font-size: 0.9rem;
  }
  .btn-primary:hover { background: var(--primary-dk); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .btn-outline {
    background: transparent; color: var(--text-main); padding: 0.7rem 1.4rem; border-radius: 50px;
    border: 1.5px solid var(--border); font-weight: 600; cursor: pointer; transition: all 0.2s;
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
    font-family: 'Tajawal', sans-serif; font-size: 0.85rem;
  }
  .btn-outline:hover { border-color: var(--primary); color: var(--primary); }

  .input-base {
    width: 100%; padding: 0.8rem 1rem; border-radius: 12px; border: 1.5px solid var(--border);
    background: var(--bg-card); font-family: 'Tajawal', sans-serif; color: var(--text-main);
    outline: none; transition: border-color 0.2s; font-size: 0.9rem;
  }
  .input-base:focus { border-color: var(--primary); }

  a { text-decoration: none; color: inherit; transition: color 0.2s; }
  a:hover { color: var(--primary); }

  .pet-card {
    border-radius: 16px; overflow: hidden; background: var(--bg-card);
    border: 1.5px solid var(--border); transition: all 0.3s; display: flex; flex-direction: column;
  }
  .pet-card:hover { border-color: var(--primary); box-shadow: 0 8px 24px rgba(255,107,53,0.12); transform: translateY(-3px); }

  .badge {
    display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 50px;
    font-size: 11px; font-weight: 700;
  }
`;

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
   MAIN LAYOUT
═══════════════════════════════════════════════════════════ */
export default function Main({ store, children, domain }: any) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const itemsCartCount = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { initCount(JSON.parse(localStorage.getItem(domain) || '[]').length || 0); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } });
        setListSearch(data.products || []);
      } catch { } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setListSearch([]);
      setOpen(false);
      setSearchQuery('');
    }
  };

  const SearchResults = () => (
    <div style={{
      position: 'absolute', top: '100%', right: 0, left: 0,
      background: '#fff', border: '1.5px solid var(--border)', zIndex: 999,
      maxHeight: '320px', overflowY: 'auto',
      boxShadow: '0 12px 30px rgba(255,107,53,0.1)',
      marginTop: '6px', borderRadius: '14px', overflow: 'hidden',
    }}>
      {loading ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>جاري البحث...</div>
      ) : listSearch.length > 0 ? (
        listSearch.map((p: any) => (
          <Link href={`/product/${p.slug || p.id}`} key={p.id}
            onClick={() => { setSearchQuery(''); setOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
            <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '8px' }} alt="" />
            <div>
              <div className="line-clamp-1" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>{p.price} دج</div>
            </div>
          </Link>
        ))
      ) : searchQuery.length >= 2 && (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد نتائج</div>
      )}
    </div>
  );

  return (
    <header dir="rtl" style={{ borderBottom: '1.5px solid var(--border)', background: 'rgba(255,250,247,0.95)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>

        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          {store?.design?.logoUrl ? (
            <img src={store.design.logoUrl} style={{ height: 36 }} alt={store?.name} />
          ) : (
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>
              🐾 {store?.name}
            </span>
          )}
        </Link>

        <nav className="lg-flex" style={{ gap: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <Link href="/" style={{ color: 'var(--text-main)' }}>الرئيسية</Link>
          <Link href="/contact" style={{ color: 'var(--text-main)' }}>تواصل معنا</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '240px' }} className="lg-block">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="ابحث عن منتجات..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.5rem', border: '1.5px solid var(--border)', background: 'var(--bg-alt)', borderRadius: '50px', outline: 'none', fontSize: '0.8rem', fontFamily: 'Tajawal, sans-serif', transition: 'border-color 0.2s' }}
              />
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </form>
            {searchQuery.length >= 2 && <SearchResults />}
          </div>

          <Link href="/cart" style={{ position: 'relative', color: 'var(--text-main)' }}>
            <ShoppingBag size={22} />
            {itemsCartCount > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -8, background: 'var(--primary)', color: '#fff', fontSize: 9, width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 700 }}>
                {itemsCartCount}
              </span>
            )}
          </Link>

          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }} className="lg-hidden">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="anim-fade-in" style={{ position: 'absolute', top: '72px', left: 0, right: 0, background: '#fff', borderBottom: '1.5px solid var(--border)', padding: '1.2rem', zIndex: 110 }}>
          <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="ابحث عن منتجات..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1.5px solid var(--border)', borderRadius: '12px', background: 'var(--bg-alt)', outline: 'none', fontFamily: 'Tajawal, sans-serif' }}
              />
            </form>
            {searchQuery.length >= 2 && <SearchResults />}
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontWeight: 600, fontSize: '0.95rem' }}>
            <Link href="/" onClick={() => setOpen(false)}>🏠 الرئيسية</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>📞 تواصل معنا</Link>
            <Link href="/Privacy" onClick={() => setOpen(false)}>🔒 سياسة الخصوصية</Link>
          </nav>
        </div>
      )}

      <style>{`
        .lg-flex { display: none; } .lg-block { display: none; }
        @media (min-width: 1024px) {
          .lg-flex { display: flex; }
          .lg-block { display: block; }
          .lg-hidden { display: none !important; }
        }
      `}</style>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  return (
    <footer dir="rtl" style={{ borderTop: '1.5px solid var(--border)', padding: '4rem 0 2rem', background: 'var(--bg-alt)' }}>
      <div className="container grid-3">
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--primary)' }}>🐾 {store?.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>كل ما يحتاجه حيوانك الأليف في مكان واحد. جودة عالية وتوصيل سريع.</p>
        </div>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>روابط سريعة</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <Link href="/">الرئيسية</Link>
            <Link href="/contact">تواصل معنا</Link>
            <Link href="/Privacy">سياسة الخصوصية</Link>
            <Link href="/Terms">الشروط والأحكام</Link>
          </div>
        </div>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>تواصل معنا</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {store?.contact?.phone && (
              <a href={`tel:${store.contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} color="var(--primary)" /> {store.contact.phone}
              </a>
            )}
            {store?.contact?.email && (
              <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} color="var(--primary)" /> {store.contact.email}
              </a>
            )}
            {(store?.contact?.wilaya || store?.contact?.address) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} color="var(--primary)" />
                {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ')}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="container" style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة. 🐾
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD
═══════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;

  return (
    <Link href={`/product/${product.slug || product.id}`} style={{ display: 'block' }} className="anim-fade-in">
      <div className="pet-card">
        <div style={{ aspectRatio: '1/1', background: 'var(--bg-alt)', position: 'relative', overflow: 'hidden' }}>
          {displayImage
            ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🐾</div>
          }
          {discount > 0 && (
            <span className="badge" style={{ position: 'absolute', top: 10, right: 10, background: 'var(--primary)', color: '#fff' }}>
              -{discount}%
            </span>
          )}
        </div>
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.6rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </h3>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.05rem' }}>
              {price.toLocaleString()} {store?.currency || 'دج'}
            </span>
            {orig > price && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                {orig.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir="rtl">
      {/* HERO */}
      <section style={{
        background: store.hero?.imageUrl
          ? `linear-gradient(135deg, rgba(255,107,53,0.75) 0%, rgba(255,179,71,0.6) 100%), url(${store.hero.imageUrl})`
          : 'linear-gradient(135deg, #FF6B35 0%, #FFB347 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '7rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container anim-fade-in" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐾</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', fontWeight: 900, marginBottom: '1rem', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            {store.hero?.title?.replace(/<[^>]+>/g, '') || 'كل شيء لحيوانك الأليف'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.92)', maxWidth: '540px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            {store.hero?.subtitle || 'منتجات مختارة بعناية لصحة وسعادة رفيقك الوفي'}
          </p>
          <a href="#products" className="btn-primary" style={{ background: '#fff', color: 'var(--primary)', padding: '0.9rem 2.4rem', fontSize: '1rem' }}>
            تسوق الآن ✨
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: 'var(--bg-alt)', borderBottom: '1.5px solid var(--border)' }}>
        <div className="container grid-3" style={{ padding: '2.5rem 1.5rem' }}>
          {[
            { icon: '🚚', t: 'توصيل سريع', d: 'لجميع ولايات الجزائر' },
            { icon: '✅', t: 'منتجات أصلية', d: 'جودة مضمونة لحيوانك' },
            { icon: '💳', t: 'دفع عند الاستلام', d: 'آمن وبسيط' },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.2rem', fontSize: '0.95rem' }}>{f.t}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <section className="container" style={{ padding: '3rem 1.5rem 0' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '1.5rem' }}>تصفح الأقسام</h2>
          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} className="btn-outline" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '1.5rem' }}>منتجاتنا</h2>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-alt)', borderRadius: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐾</div>
            <p style={{ color: 'var(--text-muted)' }}>لا توجد منتجات حالياً</p>
          </div>
        ) : (
          <div className="grid-4">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض" />;
            })}
          </div>
        )}

        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1;
              const isActive = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{
                  width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem',
                }}>{pn}</Link>
              );
            })}
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
    <div dir="rtl" className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
        <div>
          <div style={{ aspectRatio: '1/1', background: 'var(--bg-alt)', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            {allImages[sel]
              ? <img src={allImages[sel]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🐾</div>
            }
            {discount > 0 && (
              <span className="badge" style={{ position: 'absolute', top: 12, right: 12, background: 'var(--primary)', color: '#fff' }}>
                خصم {discount}%
              </span>
            )}
          </div>
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto' }}>
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{
                  width: 64, height: 64, flexShrink: 0,
                  border: `2px solid ${sel === idx ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '10px', padding: 0, cursor: 'pointer', overflow: 'hidden', background: 'none',
                }}>
                  <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: sel === idx ? 1 : 0.6 }} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 900, marginBottom: '0.75rem' }}>{product.name}</h1>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem' }}>
            {finalPrice.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>دج</span>
          </div>

          {product.offers?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>العروض:</p>
              {product.offers.map((o: any) => (
                <label key={o.id} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '0.9rem 1rem',
                  border: `1.5px solid ${selectedOffer === o.id ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '12px', marginBottom: '0.5rem', cursor: 'pointer',
                  background: selectedOffer === o.id ? 'rgba(255,107,53,0.06)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="radio" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                    <span style={{ fontSize: '0.9rem' }}>{o.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>(الكمية: {o.quantity})</span></span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{o.price.toLocaleString()} دج</span>
                </label>
              ))}
            </div>
          )}

          {allAttrs.map((attr: any) => (
            <div key={attr.id} style={{ marginBottom: '1.2rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.9rem' }}>{attr.name}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {attr.variants.map((v: any) => (
                  <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className="btn-outline" style={{
                    borderColor: selectedVariants[attr.name] === v.value ? 'var(--primary)' : 'var(--border)',
                    background: selectedVariants[attr.name] === v.value ? 'var(--primary)' : 'transparent',
                    color: selectedVariants[attr.name] === v.value ? '#fff' : 'var(--text-main)',
                    padding: '0.45rem 1rem',
                  }}>
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <hr style={{ border: 'none', borderTop: '1.5px solid var(--border)', margin: '1.5rem 0' }} />

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

          {product.desc && (
            <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--bg-alt)', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.8rem' }}>وصف المنتج</h3>
              <div style={{ lineHeight: 1.8, color: 'var(--text-muted)', fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT FORM
═══════════════════════════════════════════════════════════ */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '1rem' }}>
    {label && <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>{label}</label>}
    {children}
    {error && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, selectedVariants, platform }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (fd.customerWelaya) fetchCommunes(fd.customerWelaya).then(setCommunes); }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback(() => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: Offer) => o.id === selectedOffer);
    if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: VariantDetail) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);

  const fp = getFP();
  const getLiv = () => selW ? (fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice) : 0;
  const total = () => (fp * fd.quantity) + getLiv();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'مطلوب';
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = 'رقم هاتف غير صالح (مثال: 0550123456)';
    if (!fd.customerWelaya) e.customerWelaya = 'مطلوب';
    if (!fd.customerCommune) e.customerCommune = 'مطلوب';
    return e;
  };

  const addToCart = () => {
    setIsAdded(true);
    const cart = JSON.parse(localStorage.getItem(domain) || '[]');
    cart.push({ ...fd, product, productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, finalPrice: fp, quantity: fd.quantity });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate();
    if (Object.keys(er).length) { setErrors(er); return; }
    setSub(true);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      router.push(`/${domain}/successfully`);
    } catch { showError('حدث خطأ في الاتصال. يرجى المحاولة مجدداً.'); } finally { setSub(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ background: 'var(--bg-alt)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>اطلب الآن 🐾</h3>
        <div className="grid-2">
          <FR error={errors.customerName} label="الاسم الكامل">
            <input className="input-base" type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="اسمك" />
          </FR>
          <FR error={errors.customerPhone} label="رقم الهاتف">
            <input className="input-base" type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="05XXXXXXXX" />
          </FR>
        </div>
        <div className="grid-2">
          <FR error={errors.customerWelaya} label="الولاية">
            <select className="input-base" value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}>
              <option value="">اختر الولاية</option>
              {wilayas.map(w => <option key={w.id} value={w.id}>{w.ar_name}</option>)}
            </select>
          </FR>
          <FR error={errors.customerCommune} label="البلدية">
            <select className="input-base" value={fd.customerCommune} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} disabled={!fd.customerWelaya}>
              <option value="">اختر البلدية</option>
              {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
            </select>
          </FR>
        </div>

        <FR label="طريقة التوصيل">
          <div className="grid-2">
            {(['home', 'office'] as const).map(t => (
              <button key={t} type="button" onClick={() => setFd({ ...fd, typeLivraison: t })} className="btn-outline" style={{
                borderColor: fd.typeLivraison === t ? 'var(--primary)' : 'var(--border)',
                background: fd.typeLivraison === t ? 'rgba(255,107,53,0.08)' : 'transparent',
                color: fd.typeLivraison === t ? 'var(--primary)' : 'var(--text-main)',
              }}>
                {t === 'home' ? '🏠 المنزل' : '🏢 المكتب'}
                {selW && <span style={{ fontSize: '0.78rem', marginRight: 4 }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice)} دج</span>}
              </button>
            ))}
          </div>
        </FR>

        <FR label="الكمية">
          <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: '50px', width: 'fit-content', background: '#fff', overflow: 'hidden' }}>
            <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 40, height: 40, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}><Minus size={14} /></button>
            <span style={{ width: 40, textAlign: 'center', fontSize: '0.95rem', fontWeight: 700 }}>{fd.quantity}</span>
            <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 40, height: 40, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}><Plus size={14} /></button>
          </div>
        </FR>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', fontSize: '1.2rem', fontWeight: 900 }}>
        <span>المجموع:</span>
        <span style={{ color: 'var(--primary)' }}>{total().toLocaleString()} دج</span>
      </div>

      <div className="grid-2" style={{ gap: '0.75rem' }}>
        <button type="submit" className="btn-primary" disabled={sub} style={{ width: '100%' }}>
          {sub ? <Loader2 size={18} className="anim-pulse" /> : 'تأكيد الطلب 🐾'}
        </button>
        {product.store.cart && (
          <button type="button" className="btn-outline" onClick={addToCart} disabled={isAdded} style={{ width: '100%' }}>
            {isAdded ? <CheckCircle2 size={18} color="green" /> : <ShoppingCart size={18} />}
            {isAdded ? 'تمت الإضافة' : 'أضف للسلة'}
          </button>
        )}
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════
   CART
═══════════════════════════════════════════════════════════ */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems] = useState<any[]>([]);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(domain) || '[]'));
  }, [domain]);

  const remove = (index: number) => {
    const n = items.filter((_, i) => i !== index);
    setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length);
  };

  const total = items.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);

  if (!items.length) return (
    <div dir="rtl" className="container" style={{ textAlign: 'center', padding: '6rem 1.5rem', minHeight: '60vh' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
      <h2 style={{ fontWeight: 900, marginBottom: '1rem' }}>السلة فارغة</h2>
      <Link href="/" className="btn-primary">مواصلة التسوق 🐾</Link>
    </div>
  );

  return (
    <div dir="rtl" className="container" style={{ padding: '4rem 1.5rem', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '2rem' }}>🛒 سلة المشتريات</h1>
      <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1.5px solid var(--border)', borderRadius: '14px', marginBottom: '1rem', background: 'var(--bg-card)' }}>
              <img src={item.product?.productImage} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '10px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>{item.product?.name}</h4>
                <div style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.finalPrice} دج <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>x {item.quantity}</span></div>
              </div>
              <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--bg-alt)', padding: '2rem', borderRadius: '16px', border: '1.5px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>ملخص الطلب</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <span>الإجمالي:</span>
            <span>{total.toLocaleString()} دج</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>* تكاليف التوصيل تُحتسب عند الطلب.</p>
          <button className="btn-primary" style={{ width: '100%' }}>إتمام الطلب 🐾</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATIC PAGES
═══════════════════════════════════════════════════════════ */
export function Privacy() {
  return (
    <div dir="rtl" className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>🔒 سياسة الخصوصية</h1>
      <hr style={{ border: 'none', borderTop: '1.5px solid var(--border)', margin: '1.5rem 0' }} />
      <div style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>
        <h3 style={{ color: 'var(--text-main)', marginTop: '2rem', marginBottom: '0.5rem' }}>1. جمع المعلومات</h3>
        <p>نقوم بجمع المعلومات الشخصية الضرورية فقط لإتمام طلبك وتوصيله (الاسم، العنوان، رقم الهاتف).</p>
        <h3 style={{ color: 'var(--text-main)', marginTop: '2rem', marginBottom: '0.5rem' }}>2. الاستخدام</h3>
        <p>تُستخدم بياناتك حصراً لمعالجة شحناتك والتواصل معك. لا نشارك بياناتك مع أطراف خارجية.</p>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <div dir="rtl" className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>📋 الشروط والأحكام</h1>
      <hr style={{ border: 'none', borderTop: '1.5px solid var(--border)', margin: '1.5rem 0' }} />
      <div style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>
        <p>باستخدامك لموقعنا، فإنك توافق على الالتزام بالشروط الموضحة. نحتفظ بالحق في تعديل الأسعار وتوافر المنتجات دون إشعار مسبق.</p>
      </div>
    </div>
  );
}

export function Contact({ store }: any) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id });
      setSent(true);
    } catch {
      showError('حدث خطأ في الإرسال، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="container" style={{ padding: '5rem 1.5rem', maxWidth: '520px', margin: '0 auto' }}>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }} className="anim-fade-in">
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🐾</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.5rem' }}>تم الإرسال!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>شكراً لتواصلك معنا. سنرد عليك في أقرب وقت.</p>
          <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }} className="btn-outline">
            إرسال رسالة أخرى
          </button>
        </div>
      ) : (
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>📞 تواصل معنا</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>نحن هنا لمساعدتك وحيوانك الأليف!</p>

          {(store?.contact?.phone || store?.contact?.email || store?.contact?.wilaya || store?.contact?.address) && (
            <div style={{ background: 'var(--bg-alt)', borderRadius: '14px', padding: '1.2rem', marginBottom: '2rem', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {store?.contact?.phone && <a href={`tel:${store.contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}><Phone size={14} color="var(--primary)" />{store.contact.phone}</a>}
              {store?.contact?.email && <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}><Mail size={14} color="var(--primary)" />{store.contact.email}</a>}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <MapPin size={14} color="var(--primary)" />
                  {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ')}
                </span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-base" type="text" placeholder="الاسم الكامل" required />
            <div className="grid-2">
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-base" type="tel" placeholder="رقم الهاتف" required />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-base" type="email" placeholder="البريد الإلكتروني" required />
            </div>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="input-base" style={{ resize: 'none' }} rows={5} placeholder="رسالتك..." required />
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
              {loading ? <Loader2 size={16} /> : <><Send size={14} style={{ transform: 'rotate(180deg)' }} /> إرسال</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy />}
      {p === 'terms' && <Terms />}
      {p === 'contact' && <Contact store={store} />}
    </>
  );
}
