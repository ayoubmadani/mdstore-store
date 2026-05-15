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
  Trash2, Loader2, MapPin, ShieldCheck,
  Send
} from 'lucide-react';
import { Store } from '@/types/store';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ─── MINIMALIST THEME CSS ─── */
const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-main: #FFFFFF;
    --bg-alt: #F9FAFB;
    --text-main: #111827;
    --text-muted: #6B7280;
    --border-color: #E5E7EB;
    --primary: #000000;
    --primary-hover: #374151;
  }

  body {
    font-family: 'Tajawal', sans-serif;
    background-color: var(--bg-main);
    color: var(--text-main);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg-main); }
  ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

  /* ── Animations ── */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .anim-fade-in { animation: fadeIn 0.5s ease forwards; }

  /* ── Common Layouts ── */
  .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
  
  .grid-2 { display: grid; grid-template-columns: 1fr; gap: 1rem; }
  @media (min-width: 640px) { .grid-2 { grid-template-columns: 1fr 1fr; } }

  .grid-3 { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  @media (min-width: 640px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }

  .grid-4 { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  @media (min-width: 640px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .grid-4 { grid-template-columns: repeat(4, 1fr); } }

  /* ── Buttons & Inputs ── */
  .btn-primary {
    background: var(--primary); color: #fff; padding: 0.8rem 1.5rem; border-radius: 6px;
    border: none; font-weight: 500; cursor: pointer; transition: background 0.2s;
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  }
  .btn-primary:hover { background: var(--primary-hover); }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .btn-outline {
    background: transparent; color: var(--text-main); padding: 0.8rem 1.5rem; border-radius: 6px;
    border: 1px solid var(--border-color); font-weight: 500; cursor: pointer; transition: all 0.2s;
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  }
  .btn-outline:hover { border-color: var(--text-main); }

  .input-base {
    width: 100%; padding: 0.8rem 1rem; border-radius: 6px; border: 1px solid var(--border-color);
    background: var(--bg-main); font-family: inherit; color: var(--text-main); outline: none;
    transition: border-color 0.2s;
  }
  .input-base:focus { border-color: var(--primary); }

  a { text-decoration: none; color: inherit; transition: color 0.2s; }
  a:hover { color: var(--text-muted); }
`;

const SimpleDivider = () => <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />;

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
      setOpen(false); // إغلاق القائمة في الجوال عند البحث
      setSearchQuery('');
    }
  };

  // مكون نتائج البحث المطور
  const SearchResults = () => (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      left: 0,
      background: '#fff',
      border: '1px solid #eee',
      zIndex: 999, // قيمة عالية جداً لضمان الظهور فوق الصور والمحتوى
      maxHeight: '350px',
      overflowY: 'auto',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      marginTop: '5px',
      borderRadius: '8px'
    }}>
      {loading ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#888' }}>جاري البحث...</div>
      ) : listSearch.length > 0 ? (
        listSearch.map((p: any) => (
          <Link
            href={`/product/${p.id}`}
            key={p.id}

            onClick={() => { setSearchQuery(''); setOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderBottom: '1px solid #f5f5f5', transition: 'background 0.2s' }}
          >
            <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '4px' }} alt="" />
            <div>
              <div className='line-clamp-1' style={{ fontSize: '0.85rem', fontWeight: 600, color: '#000' }}>{p.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.price} دج</div>
            </div>
          </Link>
        ))
      ) : searchQuery.length >= 2 && (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#888' }}>لا توجد نتائج</div>
      )}
    </div>
  );

  return (
    <header dir="rtl" style={{ borderBottom: '1px solid var(--border-color)', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '75px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#000' }}>
            {store?.design?.logoUrl ? <img src={store.design.logoUrl} style={{ height: 30 }} /> : store?.name}
          </Link>

          <nav className="lg-flex" style={{ gap: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <Link href="/" style={{ color: '#000' }}>الرئيسية</Link>
            <Link href="/contact" style={{ color: '#000' }}>تواصل معنا</Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {/* حقل البحث لسطح المكتب */}
          <div style={{ position: 'relative', width: '250px' }} className="lg-block">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="ابحث هنا..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid #eee', background: '#f8f8f8', borderRadius: '50px', outline: 'none', fontSize: '0.8rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            </form>
            {searchQuery.length >= 2 && <SearchResults />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Link href="/cart" style={{ position: 'relative', color: '#000' }}>
              <ShoppingBag size={22} />
              {itemsCartCount > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -8, background: '#000', color: '#fff', fontSize: 9, width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {itemsCartCount}
                </span>
              )}
            </Link>

            <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} className="lg-hidden">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الجوال */}
      {open && (
        <div className="anim-fade-in" style={{ position: 'absolute', top: '75px', left: 0, right: 0, background: '#fff', borderBottom: '1px solid #eee', padding: '1.2rem', zIndex: 110 }}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="ابحث عن منتجات..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #eee', borderRadius: '8px', background: '#f8f8f8', outline: 'none' }}
              />
            </form>
            {/* عرض نتائج البحث في الجوال مباشرة تحت الحقل */}
            {searchQuery.length >= 2 && <SearchResults />}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontWeight: 600, fontSize: '0.9rem' }}>
            <Link href="/" onClick={() => setOpen(false)}>الرئيسية</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>تواصل معنا</Link>
            <Link href="/Privacy" onClick={() => setOpen(false)}>سياسة الخصوصية</Link>
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
    <footer dir="rtl" style={{ borderTop: '1px solid var(--border-color)', padding: '4rem 0 2rem', background: 'var(--bg-alt)' }}>
      <div className="container grid-3">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{store?.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>تسوق بثقة وبساطة. تجربة سلسة وتوصيل سريع.</p>
        </div>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>روابط</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Link href="/">الرئيسية</Link>
            <Link href="/contact">تواصل معنا</Link>
            <Link href="/Privacy">سياسة الخصوصية</Link>
            <Link href="/Terms">الشروط والأحكام</Link>
          </div>
        </div>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>تواصل</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {store?.contact?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} /> {store.contact.phone}</span>}
            {store?.contact?.wilaya && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={14} /> {store.contact.wilaya}</span>}
          </div>
        </div>
      </div>
      <div className="container" style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.
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
      <div style={{ border: `1px solid ${store.design.secondaryColor}`, borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-main)', transition: 'border-color 0.2s', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ aspectRatio: '1/1', background: 'var(--bg-alt)', position: 'relative' }}>
          {displayImage ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag color="var(--border-color)" /></div>}
          {discount > 0 && <span style={{ position: 'absolute', top: 10, right: 10, background: 'var(--primary)', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '4px' }}>-{discount}%</span>}
        </div>
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: store.design.primaryColor, fontWeight: 700, fontSize: '1.1rem' }}>{price.toLocaleString()} {store.currency || 'دج'}</span>
            {orig > price && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
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
      {/* ── HERO ── */}

      <section style={{
        // إضافة طبقة تظليل (Overlay) مع الصورة لتحسين التباين
        background: store.hero.imageUrl
          ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${store.hero.imageUrl})`
          : 'var(--bg-alt)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '6rem 1.5rem', // زيادة الهوامش لإعطاء مساحة أكبر
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        minHeight: '400px' // لضمان ظهور الصورة بشكل جيد
      }}>
        <div className="container anim-fade-in" style={{ width: '100%' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            // إذا كانت هناك صورة، نستخدم الأبيض للتباين، وإلا نستخدم لون المتجر الأساسي
            color: store.hero.imageUrl ? '#ffffff' : store.design.primaryColor,
            fontWeight: 700,
            marginBottom: '1rem',
            letterSpacing: '-1px',
            textShadow: store.hero.imageUrl ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
          }}>
            {store.hero?.title?.replace(/<[^>]+>/g, '') || 'مرحباً بك في متجرنا'}
          </h1>

          <p style={{
            fontSize: '1.2rem',
            // استخدام لون فاتح جداً فوق الصور لضمان المقروئية
            color: store.hero.imageUrl ? '#f8f9fa' : store.design.secondaryColor,
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: '1.6'
          }}>
            {store.hero?.subtitle || 'نقدم لك أفضل المنتجات بأعلى جودة وتجربة تسوق بسيطة.'}
          </p>

          <a href="#products"
            className="btn-primary"
            style={{
              backgroundColor: store.design.primaryColor,
              padding: '0.8rem 2rem',
              borderRadius: '50px',
              color: '#fff',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: '600'
            }}>
            استكشف المنتجات
          </a>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {cats.length > 0 && (

        <section className="container" style={{ padding: '4rem 1.5rem 0' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>الفئات</h2>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} className="btn-outline" style={{ whiteSpace: 'nowrap', borderRadius: '50px' }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section id="products" className="container" style={{ padding: '4rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>أحدث المنتجات</h2>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-alt)', borderRadius: '8px' }}>
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

        {/* Pagination */}
        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1;
              const isActive = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '4px', border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: isActive ? 'var(--primary)' : 'var(--bg-main)', color: isActive ? '#fff' : 'var(--text-main)'
                }}>{pn}</Link>
              );
            })}
          </div>
        )}
      </section>
      {/* ── FEATURES ── */}
      <section style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="container grid-3" style={{ padding: '3rem 1.5rem' }}>
          {[
            { icon: <Truck size={20} />, t: 'توصيل سريع', d: 'لجميع الولايات' },
            { icon: <ShieldCheck size={20} />, t: 'جودة مضمونة', d: 'منتجات أصلية' },
            { icon: <CheckCircle2 size={20} />, t: 'تسوق آمن', d: 'دفع عند الاستلام' },
          ].map((item, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--bg-alt)', borderRadius: '50%', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{item.t}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.d}</p>
            </div>
          ))}
        </div>
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

        {/* Gallery */}
        <div>
          <div style={{ aspectRatio: '1/1', background: 'var(--bg-alt)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
            {allImages[sel] ? <img src={allImages[sel]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : null}
            {discount > 0 && <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--primary)', color: '#fff', fontSize: '12px', padding: '4px 10px', borderRadius: '4px' }}>خصم {discount}%</span>}
          </div>
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto' }}>
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ width: 60, height: 60, flexShrink: 0, border: `1px solid ${sel === idx ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '4px', padding: 0, cursor: 'pointer', overflow: 'hidden' }}>
                  <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: sel === idx ? 1 : 0.6 }} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Form */}
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>{product.name}</h1>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>{finalPrice.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>دج</span></div>

          {/* Offers */}
          {product.offers?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>العروض:</p>
              {product.offers.map((o: any) => (
                <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: `1px solid ${selectedOffer === o.id ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '6px', marginBottom: '0.5rem', cursor: 'pointer', background: selectedOffer === o.id ? 'var(--bg-alt)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="radio" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                    <span>{o.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>(الكمية: {o.quantity})</span></span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{o.price.toLocaleString()} دج</span>
                </label>
              ))}
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map((attr: any) => (
            <div key={attr.id} style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{attr.name}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {attr.variants.map((v: any) => (
                  <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className="btn-outline" style={{
                    borderColor: selectedVariants[attr.name] === v.value ? 'var(--primary)' : 'var(--border-color)',
                    background: selectedVariants[attr.name] === v.value ? 'var(--primary)' : 'transparent',
                    color: selectedVariants[attr.name] === v.value ? '#fff' : 'var(--text-main)',
                    borderRadius: '4px', padding: '0.5rem 1rem'
                  }}>
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <SimpleDivider />

          <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

          {product.desc && (
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>وصف المنتج</h3>
              <div style={{ lineHeight: 1.8, color: 'var(--text-muted)', fontSize: '0.95rem' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT FORM (Fast Checkout)
═══════════════════════════════════════════════════════════ */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '1rem' }}>
    {label && <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>{label}</label>}
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
    const off = product.offers?.find(o => o.id === selectedOffer);
    if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find(v => variantMatches(v, selectedVariants));
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
    if (!fd.customerPhone.trim()) e.customerPhone = 'مطلوب';
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
      router.push(`/lp/${domain}/successfully`);
    } catch { } finally { setSub(false); }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ background: 'var(--bg-alt)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>الطلب السريع</h3>
          <div className="grid-2">
            <FR error={errors.customerName} label="الاسم"><input className="input-base" type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} /></FR>
            <FR error={errors.customerPhone} label="الهاتف"><input className="input-base" type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} /></FR>
          </div>
          <div className="grid-2">
            <FR error={errors.customerWelaya} label="الولاية">
              <select className="input-base" value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}>
                <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.ar_name}</option>)}
              </select>
            </FR>
            <FR error={errors.customerCommune} label="البلدية">
              <select className="input-base" value={fd.customerCommune} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} disabled={!fd.customerWelaya}>
                <option value="">اختر</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
            </FR>
          </div>

          <FR label="طريقة التوصيل">
            <div className="grid-2">
              {(['home', 'office'] as const).map(t => (
                <button key={t} type="button" onClick={() => setFd({ ...fd, typeLivraison: t })} className="btn-outline" style={{ borderColor: fd.typeLivraison === t ? 'var(--primary)' : 'var(--border-color)', background: fd.typeLivraison === t ? 'var(--bg-main)' : 'transparent' }}>
                  {t === 'home' ? 'المنزل' : 'المكتب'} {selW && `- ${(t === 'home' ? selW.livraisonHome : selW.livraisonOfice)} دج`}
                </button>
              ))}
            </div>
          </FR>

          <FR label="الكمية">
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', width: 'fit-content', background: 'var(--bg-main)' }}>
              <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 40, height: 40, background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={14} /></button>
              <span style={{ width: 40, textAlign: 'center', fontSize: '0.9rem' }}>{fd.quantity}</span>
              <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 40, height: 40, background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={14} /></button>
            </div>
          </FR>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
          <span>المجموع:</span>
          <span>{total().toLocaleString()} دج</span>
        </div>

        <div className="grid-2" style={{ gap: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={sub}>{sub ? <Loader2 className="anim-pulse" size={18} /> : 'تأكيد الطلب'}</button>
          {product.store.cart && (
            <button type="button" className="btn-outline" onClick={addToCart} disabled={isAdded}>
              {isAdded ? <CheckCircle2 size={18} color="green" /> : <ShoppingCart size={18} />}
              {isAdded ? 'تمت الإضافة' : 'أضف للسلة'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CART PAGE
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
    <div className="container" style={{ textAlign: 'center', padding: '6rem 1.5rem', minHeight: '60vh' }}>
      <ShoppingCart size={48} color="var(--border-color)" style={{ margin: '0 auto 1rem' }} />
      <h2 style={{ marginBottom: '1rem' }}>السلة فارغة</h2>
      <Link href="/" className="btn-primary">مواصلة التسوق</Link>
    </div>
  );

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>سلة المشتريات</h1>
      <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem' }}>
              <img src={item.product?.productImage} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{item.product?.name}</h4>
                <div style={{ fontWeight: 700 }}>{item.finalPrice} دج <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>x {item.quantity}</span></div>
              </div>
              <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--bg-alt)', padding: '2rem', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>ملخص السلة</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            <span>الإجمالي:</span>
            <span>{total.toLocaleString()} دج</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>* تكاليف التوصيل سيتم احتسابها لاحقاً.</p>
          <button className="btn-primary" style={{ width: '100%' }}>إتمام الطلب</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATIC PAGES (Contact, Privacy, etc)
═══════════════════════════════════════════════════════════ */
export function Privacy() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>سياسة الخصوصية</h1>
      <SimpleDivider />
      <div style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>
        <h3 style={{ color: 'var(--text-main)', marginTop: '2rem', marginBottom: '0.5rem' }}>1. جمع المعلومات</h3>
        <p>نقوم بجمع المعلومات الشخصية الضرورية فقط لإتمام طلبك وتوصيله (الاسم، العنوان، رقم الهاتف).</p>

        <h3 style={{ color: 'var(--text-main)', marginTop: '2rem', marginBottom: '0.5rem' }}>2. الاستخدام</h3>
        <p>تُستخدم بياناتك حصراً لمعالجة شحناتك والتواصل معك بخصوصها. لا نقوم ببيع أو مشاركة بياناتك لأي أطراف خارجية لتغراض تسويقية.</p>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>الشروط والأحكام</h1>
      <SimpleDivider />
      <div style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>
        <p>باستخدامك لموقعنا، فإنك توافق على الالتزام بالشروط الموضحة. نحتفظ بالحق في تعديل الأسعار وتوافر المنتجات دون إشعار مسبق.</p>
      </div>
    </div>
  );
}

export function Contact({ store }: any) {
  // الحالات البرمجية: sent يجب أن تكون false في البداية
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, {
        ...form,
        storeId: store.id,
        userId: store.userId // إضافة معرف المستخدم لضمان وصول الرسالة
      });
      setSent(true);
    } catch (err) {
      alert('حدث خطأ في الإرسال، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '5rem 1.5rem', maxWidth: '450px', margin: '0 auto' }} dir="rtl">
      {sent ? (
        /* واجهة النجاح - عملي وأسود */
        <div style={{ textAlign: 'center', padding: '2rem 0' }} className="anim-fade-in">
          <div style={{ display: 'inline-flex', padding: '1rem', background: '#f8f8f8', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={32} color="#000" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase' }}>تم الإرسال</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت.</p>
          <button
            onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
            style={{ background: 'none', border: 'none', borderBottom: '1px solid #000', padding: '0 0 4px 0', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >
            إرسال رسالة أخرى
          </button>
        </div>
      ) : (
        /* نموذج الاتصال - تصميم Minimalist */
        <div>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>تواصل معنا</h1>
            <p style={{ color: '#666', fontSize: '0.85rem' }}>املأ النموذج وسنرد عليك قريباً.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={minimalInputStyle}
              type="text"
              placeholder="الاسم"
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={minimalInputStyle}
                type="text"
                placeholder="الهاتف"
                required
              />
              <input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={minimalInputStyle}
                type="email"
                placeholder="البريد الإلكتروني"
                required
              />
            </div>
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              style={{ ...minimalInputStyle, resize: 'none' }}
              rows={5}
              placeholder="رسالتك..."
              required
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#000',
                color: '#fff',
                padding: '1rem',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>إرسال <Send size={14} style={{ transform: 'rotate(180deg)' }} /></>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// تنسيق الحقول البسيط
const minimalInputStyle = {
  width: '100%',
  padding: '0.9rem 1rem',
  background: '#f9f9f9',
  border: '1px solid #eee',
  borderRadius: '4px',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s'
};

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