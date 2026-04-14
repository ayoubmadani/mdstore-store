'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, Heart, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Share2, Phone, User, ToggleRight,
  Shield, ArrowRight, Plus, Minus, CheckCircle2, Lock,
  Menu, Package, Truck, BadgeCheck, ShieldCheck,
  Pill, Stethoscope, FlaskConical, HeartPulse,
  Search, ShoppingCart, Mail, MapPin, Globe,
  Activity, Microscope, CreditCard, Headphones,
  Zap,
  ShoppingBag,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Store } from '@/types/store';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  :root {
    --blue:     #1A6ED4;
    --blue-2:   #1560C0;
    --blue-lt:  #EBF4FF;
    --teal:     #0D9488;
    --teal-lt:  #E6F7F5;
    --white:    #FFFFFF;
    --off:      #F8FAFC;
    --slate:    #F1F5F9;
    --ink:      #0F172A;
    --mid:      #475569;
    --dim:      #94A3B8;
    --line:     #E2E8F0;
    --line-dk:  #CBD5E1;
    --green:    #16A34A;
    --red:      #DC2626;
    --orange:   #EA580C;
  }

  body { background: var(--off); color: var(--ink); font-family: 'Inter', sans-serif; margin:0; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--blue); border-radius: 2px; }

  .pjs { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* Fade-in */
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
  .fi { animation: fadeIn 0.5s ease both; }
  @keyframes ticker { from { transform:translateX(0) } to { transform:translateX(-50%) } }

  /* Category card (big image card like screenshot) */
  .cat-card {
    position: relative; overflow: hidden; border-radius: 10px;
    border: 1px solid var(--line); background: var(--white);
    cursor: pointer; text-decoration: none; display: block;
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .cat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(26,110,212,0.12); }
  .cat-card img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
  .cat-card:hover img { transform: scale(1.04); }

  /* Product card - screenshot style (white card, clean) */
  .p-card {
    background: var(--white); border: 1px solid var(--line);
    border-radius: 10px; overflow: hidden;
    transition: transform 0.25s, box-shadow 0.25s; cursor: pointer;
    display: flex; flex-direction: column;
  }
  .p-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(26,110,212,0.1); }

  /* Horizontal scroll container */
  .h-scroll {
    display: flex; gap: 16px; overflow-x: auto; padding-bottom: 6px;
    scroll-behavior: smooth; scrollbar-width: none;
  }
  .h-scroll::-webkit-scrollbar { display: none; }
  .h-scroll-item { flex: 0 0 220px; min-width: 0; }

  /* Buttons */
  .btn-blue {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--blue); color: var(--white);
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700;
    padding: 11px 24px; border: none; cursor: pointer; text-decoration: none;
    border-radius: 6px; transition: background 0.2s, transform 0.2s;
  }
  .btn-blue:hover { background: var(--blue-2); transform: translateY(-1px); }

  .btn-outline-blue {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: var(--blue); border: 1.5px solid var(--blue);
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700;
    padding: 8px 18px; cursor: pointer; text-decoration: none;
    border-radius: 6px; transition: all 0.2s;
  }
  .btn-outline-blue:hover { background: var(--blue); color: var(--white); }

  /* Add to cart btn (screenshot style) */
  .btn-cart {
    display: block; width: 100%; text-align: center;
    background: var(--blue); color: var(--white);
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
    padding: 9px 12px; border: none; cursor: pointer; text-decoration: none;
    border-radius: 6px; transition: background 0.2s;
  }
  .btn-cart:hover { background: var(--blue-2); }

  /* Inputs */
  .inp {
    width: 100%; padding: 10px 13px;
    background: var(--white); border: 1.5px solid var(--line-dk);
    font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink);
    outline: none; border-radius: 6px; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .inp:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(26,110,212,0.1); }
  .inp::placeholder { color: var(--dim); }
  .inp-err { border-color: var(--red) !important; }
  select.inp { appearance: none; cursor: pointer; }

  /* "New" badge like screenshot */
  .badge-new {
    position: absolute; top: 8px; right: 8px;
    background: var(--teal); color: white;
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
    padding: 2px 8px; border-radius: 3px;
  }

  /* Why choose icons (screenshot) */
  .why-card {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 28px 16px;
    background: var(--white); border: 1px solid var(--line); border-radius: 10px;
    transition: box-shadow 0.25s;
  }
  .why-card:hover { box-shadow: 0 6px 20px rgba(26,110,212,0.1); }

  /* Footer newsletter input */
  .news-wrap { display: flex; border: 1.5px solid var(--line); border-radius: 6px; overflow: hidden; }
  .news-inp { flex: 1; padding: 10px 12px; border: none; outline: none; font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink); }
  .news-btn { padding: 10px 14px; background: var(--blue); border: none; cursor: pointer; color: white; display: flex; align-items: center; transition: background 0.2s; }
  .news-btn:hover { background: var(--blue-2); }

  /* Responsive */
  .nav-center { display: flex; align-items: center; }
  .nav-toggle { display: none; }
  .cat-nav    { display: flex; }
  .hero-text  { max-width: 420px; }
  .cat-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .why-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .footer-g   { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.4fr; gap: 36px; }
  .details-g  { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .contact-g  { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .form-2c    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .dlv-2c     { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .details-L  { position: sticky; top: 108px; height: fit-content; }
  .contact-g  { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .cart-g     { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

  @media (max-width: 1024px) {
    .cat-grid-4 { grid-template-columns: repeat(2,1fr); }
    .why-grid-4 { grid-template-columns: repeat(2,1fr); }
    .footer-g   { grid-template-columns: 1fr 1fr; gap: 28px; }
  }
  @media (max-width: 768px) {
    .nav-center  { display: none; }
    .cat-nav     { display: none; }
    .nav-toggle  { display: flex; }
    .why-grid-4  { grid-template-columns: repeat(2,1fr); }
    .footer-g    { grid-template-columns: 1fr 1fr; gap: 24px; }
    .details-g   { grid-template-columns: 1fr; }
    .details-L   { position: static; }
    .contact-g   { grid-template-columns: 1fr; }
    .cart-g      { grid-template-columns: 1fr; }   /* ← add this */
    .hero-text   { max-width: 100%; }
  }
  @media (max-width: 480px) {
    .cat-grid-4 { grid-template-columns: repeat(2,1fr); gap: 10px; }
    .footer-g   { grid-template-columns: 1fr; }
    .form-2c    { grid-template-columns: 1fr; }
    .dlv-2c     { grid-template-columns: 1fr; }
  }

  @keyframes cartBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes checkAppear {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.animate-cart { animation: cartBounce 0.4s ease-in-out; }
.animate-check { animation: checkAppear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
`;

/* ── TYPES ──────────────────────────────────────────────────── */
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
  store: { id: string; name: string; subdomain: string; userId: string; cart: boolean };
}
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}
function variantMatches(d: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

/* ── MAIN ───────────────────────────────────────────────────── */
export default function Main({ store, children, domain }: any) {
  if (!store) return null;
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--off)' }}>
      <style>{CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ── NAVBAR — 3 tiers like screenshot ───────────────────────── */
export function Navbar({ store, domain }: { store: Store, domain: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    console.log({store});
    const h = () => setScrolled(window.scrollY > 2);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);
  if (!store) return null;

  const catLinks = [
    { href: `/${store.subdomain}`, label: 'الرئيسية' },
    { href: `/${store.subdomain}`, label: 'أجهزة طبية' },
    { href: `/${store.subdomain}`, label: 'مكملات صحية' },
    { href: `/${store.subdomain}`, label: 'منتجات شبه طبية' },
    { href: `/${store.subdomain}/contact`, label: 'تواصل' },
  ];

  
  

  const itemsCartCount = useCartStore((state) => state.count);
  const initCount = useCartStore((state) => state.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try {
        const storedData = localStorage.getItem(domain);
        const cartItems = JSON.parse(storedData || "[]");
        initCount(Array.isArray(cartItems) ? cartItems.length : 0);
      } catch (error) {
        initCount(0);
      }
    }
  }, [domain, initCount]);

  return (
    <header dir="rtl" style={{ position: 'sticky', top: 0, zIndex: 100, fontFamily: "'Inter',sans-serif" }}>

      {/* Tier 1 — Announcement bar */}
      <div style={{ backgroundColor: 'var(--blue)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '7px 0' }}>
        <div style={{ display: 'inline-block', animation: 'ticker 28s linear infinite' }}>
          {Array(8).fill(null).map((_, i) => (
            <span key={i} style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: '0 48px' }}>
              متجر طبي محترف وموثوق عالي الجودة — شحن سريع لجميع ولايات الجزائر
            </span>
          ))}
          {Array(8).fill(null).map((_, i) => (
            <span key={`b${i}`} style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: '0 48px' }}>
              متجر طبي محترف وموثوق عالي الجودة — شحن سريع لجميع ولايات الجزائر
            </span>
          ))}
        </div>
      </div>

      {/* Tier 2 — Main navbar: hamburger | logo | search + user + cart */}
      <div style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--line)', boxShadow: scrolled ? '0 2px 10px rgba(15,23,42,0.07)' : 'none', transition: 'box-shadow 0.3s' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

          {/* Left: hamburger (mobile) */}
          <button className="nav-toggle" onClick={() => setOpen(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid)', padding: '6px', display: 'flex', flexShrink: 0 }}>
            {open ? <X style={{ width: '22px', height: '22px' }} /> : <Menu style={{ width: '22px', height: '22px' }} />}
          </button>

          {/* Center: logo */}
          <Link href={`/${store.subdomain}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {store.design?.logoUrl
              ? <img src={store.design.logoUrl} alt={store.name} style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--blue), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HeartPulse style={{ width: '16px', height: '16px', color: 'white' }} />
                  </div>
                  <div>
                    <span className="pjs" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', display: 'block', lineHeight: 1 }}>{store.name}</span>
                    <span style={{ fontSize: '9px', color: 'var(--teal)', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Para-medical</span>
                  </div>
                </div>
              )
            }
          </Link>

          {/* Right: search + user + cart */}
          <div className="nav-center" style={{ gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', flex: '0 1 280px' }}>
              <Search style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--dim)' }} />
              <input type="text" placeholder="ابحث عن منتج..." style={{ width: '100%', padding: '9px 34px 9px 12px', border: '1.5px solid var(--line-dk)', borderRadius: '6px', fontFamily: "'Inter',sans-serif", fontSize: '13px', color: 'var(--ink)', outline: 'none', backgroundColor: 'var(--off)' }} />
            </div>
            

            {/* في الـ Navbar - عرض أيقونة السلة فقط إذا كان المتجر يدعمها */}
            {store.cart && (
              <Link href="/cart" style={{ position: 'relative', color: 'var(--mid)', display: 'flex', padding: '6px' }}>
              <ShoppingCart style={{ width: '20px', height: '20px', color: 'var(--mid)' }} />
              {itemsCartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  width: '15px', height: '15px',
                  backgroundColor: 'var(--blue)', color: 'white',
                  fontSize: '9px', fontWeight: 700,
                  borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  {itemsCartCount}
                </span>
              )}
            </Link>
            )}
          </div>

          {/* Mobile: only cart */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <a href="#products" style={{ display: 'none' }}>
              <ShoppingCart style={{ width: '20px', height: '20px', color: 'var(--mid)' }} />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div style={{ maxHeight: open ? '280px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease', backgroundColor: 'var(--white)', borderBottom: open ? '1px solid var(--line)' : 'none' }}>
        <div style={{ padding: '8px 20px 16px' }}>
          {catLinks.map((l, i) => (
            <Link key={`m${i}`} href={l.href} onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', fontSize: '14px', fontWeight: 500, color: 'var(--mid)', textDecoration: 'none', borderBottom: '1px solid var(--line)' }}>
              {l.label} <ArrowRight style={{ width: '13px', height: '13px', color: 'var(--teal)' }} />
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ── FOOTER — 4 columns like screenshot ─────────────────────── */
export function Footer({ store }: any) {
  const yr = new Date().getFullYear();
  if (!store) return null;
  return (
    <footer dir="rtl" style={{ backgroundColor: 'var(--ink)', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 20px 32px' }}>
        <div className="footer-g" style={{ paddingBottom: '36px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          {/* ① Contact Us */}
          <div>
            <Link href={`/${store.subdomain}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              {store.design?.logoUrl
                ? <img src={store.design.logoUrl} alt={store.name} style={{ height: '28px', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
                : <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'linear-gradient(135deg,var(--blue),var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HeartPulse style={{ width: '12px', height: '12px', color: 'white' }} />
                  </div>
                  <span className="pjs" style={{ fontSize: '1rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>{store.name}</span>
                </div>
              }
            </Link>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.07em', marginBottom: '14px', textTransform: 'uppercase', fontWeight: 600 }}>اتصل بنا</p>
            {[
              { icon: <Phone style={{ width: '13px', height: '13px' }} />, val: '+213 550 000 000' },
              { icon: <Globe style={{ width: '13px', height: '13px' }} />, val: store.subdomain },
              { icon: <Mail style={{ width: '13px', height: '13px' }} />, val: 'info@store.dz' },
              { icon: <MapPin style={{ width: '13px', height: '13px' }} />, val: 'الجزائر' },
            ].map(item => (
              <div key={item.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'rgba(255,255,255,0.45)' }}>
                {item.icon}
                <span style={{ fontSize: '12px' }}>{item.val}</span>
              </div>
            ))}
          </div>

          {/* ② About Us */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>عن المتجر</p>
            {['الرئيسية', 'تواصل', 'منتجاتنا', 'المدونة', 'الشركاء'].map(label => (
              <a key={label} href="#" style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '8px', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
                {label}
              </a>
            ))}
          </div>

          {/* ③ Helpful Links */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>روابط مفيدة</p>
            {[
              { href: `/${store.subdomain}`, label: 'الرئيسية' },
              { href: `/${store.subdomain}/contact`, label: 'تواصل' },
              { href: `/${store.subdomain}/contact`, label: 'اتصل بنا' },
              { href: `/${store.subdomain}/Privacy`, label: 'سياسة الخصوصية' },
              { href: `/${store.subdomain}/Terms`, label: 'شروط الخدمة' },
              { href: `/${store.subdomain}/Cookies`, label: 'ملفات الارتباط' },
            ].map(l => (
              <a key={l.label} href={l.href} style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '8px', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* ④ Newsletter Subscribe */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>اشتراك في النشرة</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', lineHeight: '1.6' }}>
              اشترك للحصول على آخر العروض والمنتجات الجديدة.
            </p>
            <div className="news-wrap" style={{ marginBottom: '16px', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}>
              <input className="news-inp" type="email" placeholder="بريدك الإلكتروني" style={{ backgroundColor: 'transparent', color: 'rgba(255,255,255,0.8)' }} />
              <button className="news-btn"><ArrowRight style={{ width: '15px', height: '15px' }} /></button>
            </div>
            {/* Payment icons like screenshot */}
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>طرق الدفع</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {['Visa', 'Master', 'PayPal'].map(p => (
                <div key={p} style={{ padding: '4px 10px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '4px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>
                  {p}
                </div>
              ))}
              <div style={{ padding: '4px 10px', backgroundColor: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck style={{ width: '10px', height: '10px' }} /> آمن
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>© {yr} {store.name}. جميع الحقوق محفوظة.</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>PureCare Para-medical Theme</p>
        </div>
      </div>
    </footer>
  );
}

/* ── CARD (screenshot style) ─────────────────────────────────── */
export function Card({ product, displayImage, discount, store, viewDetails, isNew }: any) {
  if (!product || !store) return null;
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="p-card">
      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--slate)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--slate), var(--blue-lt))' }}>
            <FlaskConical style={{ width: '40px', height: '40px', color: 'var(--blue)', opacity: 0.3 }} />
          </div>
        }
        {isNew && <span className="badge-new">New</span>}
        {discount > 0 && (
          <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'var(--red)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px' }}>-{discount}%</span>
        )}
      </div>
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden', margin: 0 }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '11px', height: '11px', fill: i < 4 ? '#F59E0B' : 'none', color: '#F59E0B' }} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>{price.toLocaleString()}<span style={{ fontSize: '10px', color: 'var(--dim)', marginRight: '2px' }}> دج</span></span>
          {orig > price && <span style={{ fontSize: '11px', color: 'var(--dim)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
        </div>
        <Link href={`/${store.subdomain}/product/${product.slug || product.id}`}
          className="btn-cart" style={{ textDecoration: 'none', marginTop: 'auto' }}>
          {viewDetails}
        </Link>
      </div>
    </div>
  );
}



/* ── HOME ───────────────────────────────────────────────────── */
export function Home({ store }: any) {
  if (!store) return null;
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  const [slide, setSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto hero slideshow
  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % 3), 4500);
    return () => clearInterval(t);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? 240 : -240, behavior: 'smooth' });
  };

  const defaultCats = [
    { id: '1', name: 'أجهزة طبية', icon: <Stethoscope style={{ width: '36px', height: '36px' }} /> },
    { id: '2', name: 'العناية اليومية', icon: <HeartPulse style={{ width: '36px', height: '36px' }} /> },
    { id: '3', name: 'مكملات غذائية', icon: <Pill style={{ width: '36px', height: '36px' }} /> },
    { id: '4', name: 'أدوات تشخيص', icon: <Microscope style={{ width: '36px', height: '36px' }} /> },
  ];

  const displayCats = cats.length > 0 ? cats.slice(0, 4) : defaultCats;

  return (
    <div dir="rtl">

      {/* ── HERO — full width image slider ── */}
      <section style={{ position: 'relative', width: '100%', overflow: 'hidden', backgroundColor: 'var(--slate)' }}>
        <div style={{ position: 'relative', aspectRatio: '16/6', minHeight: '260px' }}>
          {/* Image */}
          {store.hero?.imageUrl
            ? <img src={store.hero.imageUrl} alt={store.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0c2f6b 0%, #1A6ED4 40%, var(--teal) 100%)' }} />
          }

          {/* Overlay + text — left side like screenshot */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(12,47,107,0.88) 0%, rgba(12,47,107,0.5) 55%, transparent 100%)', display: 'flex', alignItems: 'center' }}>
            <div className="hero-text fi" style={{ padding: '32px 5vw', zIndex: 2 }}>
              {store.design?.logoUrl && (
                <img src={store.design.logoUrl} alt={store.name} style={{ height: '36px', filter: 'brightness(0) invert(1)', opacity: 0.9, marginBottom: '12px', display: 'block' }} />
              )}
              <h1 className="pjs" style={{ fontSize: 'clamp(1.6rem,5vw,3.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, marginBottom: '10px', letterSpacing: '-0.01em' }}>
                {store.hero?.title || 'شريكك الطبي الموثوق'}
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.78)', marginBottom: '22px', maxWidth: '360px', lineHeight: '1.7' }}>
                {store.hero?.subtitle || 'أجود المنتجات الشبه طبية والأجهزة الطبية بجودة موثّقة ومعتمدة.'}
              </p>
              <a href="#products" className="btn-blue" style={{ fontSize: '14px', padding: '11px 26px' }}>
                تسوق الآن
              </a>
            </div>
          </div>

          {/* Slide dots */}
          <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '7px' }}>
            {[0, 1, 2].map(i => (
              <button key={i} onClick={() => setSlide(i)}
                style={{ width: slide === i ? 20 : 8, height: '8px', borderRadius: '4px', border: 'none', backgroundColor: slide === i ? 'white' : 'rgba(255,255,255,0.45)', padding: 0, cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CATEGORIES — big image cards ── */}
      <section style={{ padding: '40px 0', backgroundColor: 'var(--white)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', textAlign: 'center', marginBottom: '24px' }}>
            الفئات المميزة
          </h2>
          <div className="cat-grid-4">
            {displayCats.map((cat: any, i: number) => (
              <Link key={cat.id} href={`/${store.subdomain}?category=${cat.id}`} className="cat-card"
                style={{ aspectRatio: '4/3', backgroundColor: 'var(--blue-lt)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px 16px', textAlign: 'center' }}>
                {cat.imageUrl
                  ? <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '14px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,110,212,0.12)', color: 'var(--blue)' }}>
                        {cat.icon || <Pill style={{ width: '28px', height: '28px' }} />}
                      </div>
                      <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{cat.name}</span>
                    </div>
                  )
                }
                {cat.imageUrl && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.65), transparent)', padding: '16px', display: 'flex', alignItems: 'flex-end' }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '14px', fontWeight: 700, color: 'white' }}>{cat.name}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS — horizontal scroll with arrows ── */}
      <section id="products" style={{ padding: '40px 0', backgroundColor: 'var(--off)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
              الأكثر مبيعاً
            </h2>
            {products.length > 4 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => scroll('right')}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid var(--line-dk)', backgroundColor: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mid)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--blue)'; el.style.color = 'var(--blue)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--line-dk)'; el.style.color = 'var(--mid)'; }}>
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
                <button onClick={() => scroll('left')}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid var(--line-dk)', backgroundColor: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mid)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--blue)'; el.style.color = 'var(--blue)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--line-dk)'; el.style.color = 'var(--mid)'; }}>
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            )}
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '56px 0', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: '10px', border: '1px solid var(--line)' }}>
              <FlaskConical style={{ width: '44px', height: '44px', color: 'var(--dim)', opacity: 0.35, margin: '0 auto 12px' }} />
              <p className="pjs" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dim)' }}>المنتجات قادمة قريباً</p>
            </div>
          ) : (
            <div ref={scrollRef} className="h-scroll">
              {products.map((p: any, i: number) => {
                const img = p.imagesProduct?.[0]?.imageUrl;
                const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                return (
                  <div key={p.id} className="h-scroll-item">
                    <Card product={p} displayImage={img} discount={disc} store={store} viewDetails="معرفة المزيد" isNew={i < 2} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE — 4 icon cards like screenshot ── */}
      <section style={{ padding: '48px 0', backgroundColor: 'var(--white)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', textAlign: 'center', marginBottom: '28px' }}>
            لماذا تختار {store.name}؟
          </h2>
          <div className="why-grid-4">
            {[
              { icon: <BadgeCheck style={{ width: '36px', height: '36px' }} />, color: 'var(--teal)', title: 'منتجات موثّقة', desc: 'منتجات معتمدة ومختارة بدقة من مصادر طبية موثوقة.' },
              { icon: <CreditCard style={{ width: '36px', height: '36px' }} />, color: 'var(--blue)', title: 'دفع آمن', desc: 'معاملات مشفّرة بالكامل لضمان أمان بياناتك.' },
              { icon: <Headphones style={{ width: '36px', height: '36px' }} />, color: '#7C3AED', title: 'دعم متخصص', desc: 'فريق متخصص يرد في أسرع وقت على استفساراتك.' },
              { icon: <Truck style={{ width: '36px', height: '36px' }} />, color: 'var(--orange)', title: 'توصيل سريع', desc: 'توصيل عالي الجودة لجميع ولايات الجزائر بسرعة.' },
            ].map((item, i) => (
              <div key={i} className="why-card">
                <div style={{ width: '72px', height: '72px', borderRadius: '18px', backgroundColor: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginBottom: '16px' }}>
                  {item.icon}
                </div>
                <h3 className="pjs" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: '1.65', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── DETAILS ────────────────────────────────────────────────── */
export function Details({ product, toggleWishlist, isWishlisted, handleShare, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, isRTL }: any) {
  const [sel, setSel] = useState(0);
  if (!product) return null;
  return (
    <div dir="rtl" style={{ backgroundColor: 'var(--off)' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--line)', padding: '10px 20px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--dim)' }}>
          <Link href="/" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>الرئيسية</Link>
          <ChevronLeft style={{ width: '12px', height: '12px' }} />
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{product.name.slice(0, 50)}</span>
          <div style={{ marginRight: 'auto', display: 'flex', gap: '8px' }}>
            <button onClick={toggleWishlist} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${isWishlisted ? 'var(--red)' : 'var(--line-dk)'}`, background: isWishlisted ? 'rgba(220,38,38,0.06)' : 'transparent', cursor: 'pointer', color: isWishlisted ? 'var(--red)' : 'var(--dim)', borderRadius: '6px' }}>
              <Heart style={{ width: '13px', height: '13px', fill: isWishlisted ? 'currentColor' : 'none' }} />
            </button>
            <button onClick={handleShare} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--line-dk)', background: 'transparent', cursor: 'pointer', color: 'var(--dim)', borderRadius: '6px' }}>
              <Share2 style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 20px' }}>
        <div className="details-g">
          {/* Gallery */}
          <div className="details-L">
            <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--line)', backgroundColor: 'var(--slate)', marginBottom: '10px' }}>
              <div style={{ aspectRatio: '1/1' }}>
                {allImages.length > 0
                  ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FlaskConical style={{ width: '64px', height: '64px', color: 'var(--blue)', opacity: 0.2 }} />
                  </div>
                }
              </div>
              {/* Top gradient line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, var(--blue), var(--teal))' }} />
              {discount > 0 && <span style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'var(--red)', color: 'white', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '4px' }}>-{discount}%</span>}
              {/* Certified badge */}
              <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(13,148,136,0.9)', borderRadius: '14px', padding: '4px 11px' }}>
                <BadgeCheck style={{ width: '12px', height: '12px', color: 'white' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>منتج موثّق</span>
              </div>
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--line)', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--ink)' }} />
                  </button>
                  <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--line)', backgroundColor: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft style={{ width: '14px', height: '14px', color: 'var(--ink)' }} />
                  </button>
                </>
              )}
              {!inStock && !autoGen && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248,250,252,0.88)', backdropFilter: 'blur(4px)', borderRadius: '10px' }}>
                  <span className="pjs" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--mid)' }}>نفد المخزون</span>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px' }}>
                {allImages.slice(0, 5).map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSel(idx)}
                    style={{ aspectRatio: '1/1', overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--blue)' : 'var(--line)'}`, cursor: 'pointer', padding: 0, background: 'none', borderRadius: '6px', opacity: sel === idx ? 1 : 0.6 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category label */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--blue-lt)', border: '1px solid rgba(26,110,212,0.18)', borderRadius: '5px', padding: '3px 10px', marginBottom: '10px' }}>
              <FlaskConical style={{ width: '11px', height: '11px', color: 'var(--blue)' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>منتج شبه طبي</span>
            </div>

            <h1 className="pjs" style={{ fontSize: 'clamp(1.3rem,2.5vw,2rem)', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2, marginBottom: '12px' }}>
              {product.name}
            </h1>

            {/* Stars + stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '14px', height: '14px', fill: i < 4 ? '#F59E0B' : 'none', color: '#F59E0B' }} />)}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--dim)' }}>128 تقييم</span>
              <span style={{ marginRight: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', backgroundColor: inStock || autoGen ? 'rgba(22,163,74,0.08)' : 'rgba(148,163,184,0.08)', color: inStock || autoGen ? 'var(--green)' : 'var(--dim)', fontSize: '12px', fontWeight: 600, border: `1px solid ${inStock || autoGen ? 'rgba(22,163,74,0.25)' : 'var(--line)'}` }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                {autoGen ? '∞ متوفر' : inStock ? 'متوفر' : 'نفد'}
              </span>
            </div>

            {/* Price */}
            <div style={{ padding: '16px 18px', backgroundColor: 'var(--blue-lt)', border: '1px solid rgba(26,110,212,0.15)', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <span className="pjs" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '14px', color: 'var(--mid)' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <>
                    <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'var(--dim)' }}>{parseFloat(product.priceOriginal).toLocaleString()}</span>
                    <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 700, backgroundColor: 'rgba(22,163,74,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                      وفّر {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString()} دج
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '10px' }}>الباقات</p>
                {product.offers.map((offer: any) => (
                  <label key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', border: `1.5px solid ${selectedOffer === offer.id ? 'var(--blue)' : 'var(--line)'}`, cursor: 'pointer', marginBottom: '7px', borderRadius: '8px', backgroundColor: selectedOffer === offer.id ? 'var(--blue-lt)' : 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${selectedOffer === offer.id ? 'var(--blue)' : 'var(--dim)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {selectedOffer === offer.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)' }} />}
                      </div>
                      <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} style={{ display: 'none' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>{offer.name}</span>
                    </div>
                    <span className="pjs" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--blue)' }}>{offer.price.toLocaleString()} دج</span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '8px' }}>{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} style={{ width: '26px', height: '26px', backgroundColor: v.value, border: 'none', cursor: 'pointer', borderRadius: '50%', outline: s ? '3px solid var(--blue)' : '3px solid transparent', outlineOffset: '3px' }} />; })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: '50px', height: '50px', overflow: 'hidden', border: `2px solid ${s ? 'var(--blue)' : 'var(--line-dk)'}`, cursor: 'pointer', padding: 0, borderRadius: '6px' }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>; })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.variants.map((v: any) => { const s = selectedVariants[attr.name] === v.value; return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: '7px 14px', border: `1.5px solid ${s ? 'var(--blue)' : 'var(--line-dk)'}`, backgroundColor: s ? 'var(--blue)' : 'transparent', color: s ? 'white' : 'var(--mid)', fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s' }}>{v.name}</button>; })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {product.desc && (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '10px' }}>معلومات المنتج</p>
                <div style={{ fontSize: '14px', lineHeight: '1.85', color: 'var(--mid)' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PRODUCT FORM ────────────────────────────────────────────── */
const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '12px' }}>
    {label && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '6px' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle style={{ width: '11px', height: '11px' }} />{error}
    </p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0 }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false)
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId: id })); } }, []);
  useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => {
        console.log({product});

    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: any) => o.id === selectedOffer); if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  const getLiv = useCallback((): number => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
  useEffect(() => { if (selW) setFd(f => ({ ...f, priceLoss: selW.livraisonReturn })); }, [selW]);

  const fp = getFP(); const total = () => fp * fd.quantity + +getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!fd.customerPhone.trim()) e.customerPhone = 'رقم الهاتف مطلوب';
    if (!fd.customerWelaya) e.customerWelaya = 'الولاية مطلوبة';
    if (!fd.customerCommune) e.customerCommune = 'البلدية مطلوبة';
    return e;
  };
  const getVariantDetailId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;

    return product.variantDetails.find(v => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const er = validate(); if (Object.keys(er).length) { setErrors(er); return; } setErrors({}); setSub(true);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, variantDetailId: getVariantDetailId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (typeof window !== 'undefined' && fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`/lp/${domain}/successfully`);
    } catch (err) { console.error(err); } finally { setSub(false); }
  };

  const initCount = useCartStore((state) => state.initCount);

  const addToCart = () => {
    setIsOrderNow(false);

    // تفعيل حالة الأنميشن
    setIsAdded(true);

    const existingCart = localStorage.getItem(domain);
    const cart = existingCart ? JSON.parse(existingCart) : [];

    const productItem = {
      ...fd,
      product: product,
      variantDetailId: getVariantDetailId(),
      productId: product.id,
      storeId: product.store.id,
      userId,
      selectedOffer,
      selectedVariants,
      platform: platform || 'store',
      finalPrice: fp,
      totalPrice: total(),
      priceLivraison: getLiv(),
      addedAt: new Date().getTime()
    };

    cart.push(productItem);
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);

    // إعادة الزر لحالته الطبيعية بعد ثانيتين
    setTimeout(() => setIsAdded(false), 2000);

    // ملاحظة: قمنا بحذف الـ alert لكي لا يفسد الأنميشن
  };

  // ... داخل مكون ProductForm

  return (
    <div style={{ direction: 'rtl' }}>
      {/* قسم الأزرار العلوية */}
      {product.store.cart &&
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button
            onClick={addToCart}
            disabled={isAdded} // منع الضغط المتكرر أثناء الأنميشن
            className={isAdded ? "animate-cart" : ""}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '8px',
              border: isAdded ? '2px solid var(--green)' : '2px solid var(--line-dk)',
              backgroundColor: isAdded ? 'rgba(34, 197, 94, 0.05)' : '#f8f9fa',
              color: isAdded ? 'var(--green)' : 'var(--ink)',
              cursor: isAdded ? 'default' : 'pointer',
              fontWeight: 700,
              transition: 'all 0.3s ease'
            }}
          >
            {isAdded ? (
              <>
                <CheckCircle2 size={18} className="animate-check" style={{ color: 'var(--green)' }} />
                <span className="animate-check">تمت الإضافة!</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>أضف للسلة</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsOrderNow(true)} // تم إصلاح الخطأ هنا
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--blue)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(0, 123, 255, 0.2)'
            }}
          >
            <Zap size={18} />
            طلب الان
          </button>
        </div>
      }


      {/* قسم الفورم - يظهر فقط عند الضغط على طلب الآن */}
      {(isOrderNow || !product.store.cart) && (
        <div style={{
          marginTop: '20px',
          paddingTop: '18px',
          borderTop: '1px solid var(--line)',
          animation: 'fadeIn 0.3s ease-in-out' // إضافة حركة بسيطة للظهور
        }}>
          <form onSubmit={handleSubmit}>
            <div className="form-2c">
              <FR error={errors.customerName} label="الاسم">
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل"
                    className={`inp${errors.customerName ? ' inp-err' : ''}`} style={{ paddingLeft: '32px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = errors.customerName ? 'var(--red)' : 'var(--line-dk)'; }} />
                </div>
              </FR>
              <FR error={errors.customerPhone} label="الهاتف">
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0X XX XX XX XX"
                    className={`inp${errors.customerPhone ? ' inp-err' : ''}`} style={{ paddingLeft: '32px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = errors.customerPhone ? 'var(--red)' : 'var(--line-dk)'; }} />
                </div>
              </FR>
            </div>
            <div className="form-2c">
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}
                    className={`inp${errors.customerWelaya ? ' inp-err' : ''}`} style={{ paddingRight: '30px' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = errors.customerWelaya ? 'var(--red)' : 'var(--line-dk)'; }}>
                    <option value="">اختر الولاية</option>
                    {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--dim)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })}
                    className={`inp${errors.customerCommune ? ' inp-err' : ''}`} style={{ paddingRight: '30px', opacity: !fd.customerWelaya ? 0.4 : 1 }}
                    onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = errors.customerCommune ? 'var(--red)' : 'var(--line-dk)'; }}>
                    <option value="">{loadingC ? '...' : 'اختر البلدية'}</option>
                    {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            <FR label="التوصيل">
              <div className="dlv-2c">
                {(['home', 'office'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: type }))}
                    style={{ padding: '11px 10px', border: `1.5px solid ${fd.typeLivraison === type ? 'var(--blue)' : 'var(--line-dk)'}`, backgroundColor: fd.typeLivraison === type ? 'var(--blue-lt)' : 'transparent', cursor: 'pointer', textAlign: 'right', borderRadius: '7px', transition: 'all 0.2s' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: fd.typeLivraison === type ? 'var(--blue)' : 'var(--mid)', margin: '0 0 3px' }}>
                      {type === 'home' ? 'للبيت' : 'للمكتب'}
                    </p>
                    {selW && <p className="pjs" style={{ fontSize: '0.95rem', fontWeight: 700, color: fd.typeLivraison === type ? 'var(--blue)' : 'var(--dim)', margin: 0 }}>
                      {(type === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج
                    </p>}
                  </button>
                ))}
              </div>
            </FR>

            <FR label="الكمية">
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line-dk)', borderRadius: '7px', overflow: 'hidden' }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                  style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--off)', cursor: 'pointer', color: 'var(--ink)', borderLeft: '1px solid var(--line-dk)', fontSize: '16px', fontWeight: 600 }}>
                  -
                </button>
                <span className="pjs" style={{ width: '44px', textAlign: 'center', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))}
                  style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--off)', cursor: 'pointer', color: 'var(--ink)', borderRight: '1px solid var(--line-dk)', fontSize: '16px', fontWeight: 600 }}>
                  +
                </button>
              </div>
            </FR>

            {/* Order summary */}
            <div style={{ border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden', marginBottom: '13px' }}>
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--slate)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Activity style={{ width: '13px', height: '13px', color: 'var(--blue)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--mid)' }}>ملخص الطلب</span>
              </div>
              {[
                { l: 'المنتج', v: product.name.slice(0, 22) },
                { l: 'السعر', v: `${fp.toLocaleString()} دج` },
                { l: 'الكمية', v: `× ${fd.quantity}` },
                { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' },
              ].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 14px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--white)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--dim)' }}>{row.l}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', backgroundColor: 'var(--blue-lt)' }}>
                <span style={{ fontSize: '13px', color: 'var(--mid)' }}>المجموع</span>
                <span className="pjs" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue)' }}>
                  {total().toLocaleString()} <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: '12px', color: 'var(--dim)' }}>دج</span>
                </span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-blue"
              style={{ width: '100%', fontSize: '15px', padding: '13px', cursor: sub ? 'not-allowed' : 'pointer', opacity: sub ? 0.7 : 1, borderRadius: '7px' }}>
              {sub ? 'جاري المعالجة...' : 'تأكيد الطلب'}{!sub && <ArrowRight style={{ width: '15px', height: '15px' }} />}
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
              {[
                { icon: <Lock style={{ width: '11px', height: '11px' }} />, label: 'دفع آمن' },
                { icon: <ShieldCheck style={{ width: '11px', height: '11px' }} />, label: 'بيانات مشفّرة' },
                { icon: <BadgeCheck style={{ width: '11px', height: '11px' }} />, label: 'موثّق ومعتمد' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--dim)', fontWeight: 500 }}>
                  <span style={{ color: 'var(--blue)' }}>{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


export function Cart({ domain, store }: { domain: string, store: any }) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [fd, setFd] = useState({
    customerName: '',
    customerPhone: '',
    customerWelaya: '',
    customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // جلب بيانات السلة والولايات
  useEffect(() => {
    const savedCart = localStorage.getItem(domain);
    if (savedCart) setCartItems(JSON.parse(savedCart));
    
    if (store.user.id) {
      fetchWilayas(store.user.id).then(setWilayas);
    }
  }, [domain, store]);

  // جلب البلديات
  useEffect(() => {
    if (!fd.customerWelaya) {
      setCommunes([]);
      return;
    }
    setLC(true);
    fetchCommunes(fd.customerWelaya).then(data => {
      setCommunes(data);
      setLC(false);
    });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

  const getLivPrice = useCallback(() => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice;
  }, [selW, fd.typeLivraison]);

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
  const finalTotal = cartTotal + +getLivPrice();

  const initCount = useCartStore((state) => state.initCount);

  const updateCart = (newItems: any[]) => {
    setCartItems(newItems);
    localStorage.setItem(domain, JSON.stringify(newItems));
    // تحديث الـ Store فوراً لكي يراه الـ Navbar
    initCount(newItems.length);
  };

  const removeItem = (index: number) => updateCart(cartItems.filter((_, i) => i !== index));

  const changeQty = (index: number, delta: number) => {
    const newItems = [...cartItems];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    updateCart(newItems);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.name = 'الاسم مطلوب';
    if (!fd.customerPhone.trim()) errs.phone = 'الهاتف مطلوب';
    if (!fd.customerWelaya) errs.welaya = 'الولاية مطلوبة';
    if (!fd.customerCommune) errs.commune = 'البلدية مطلوبة';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = cartItems.map(item => ({
        customerName: fd.customerName,
        customerPhone: fd.customerPhone,
        customerWelaya: fd.customerWelaya,
        customerCommune: fd.customerCommune,
        typeLivraison: fd.typeLivraison,
        quantity: item.quantity,
        priceLoss: selW?.livraisonReturn ?? 0,
        customerId: item.customerId || '',
        variantDetailId: item.variantDetailId,
        productId: item.productId,
        storeId: item.storeId,
        userId: item.userId,
        selectedOffer: item.selectedOffer,
        selectedVariants: item.selectedVariants,
        platform: item.platform || 'store',
        finalPrice: item.finalPrice,
        totalPrice: finalTotal,
        priceLivraison: +getLivPrice(),
      }));

      await axios.post(`${API_URL}/orders/create`, payload);

      setSuccess(true);
      localStorage.removeItem(domain);
      setCartItems([]);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--white)', borderRadius: '10px', border: '1px solid var(--line)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle2 size={40} style={{ color: 'var(--green)' }} />
        </div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '12px' }}>تم استلام طلبك بنجاح!</h2>
        <p style={{ color: 'var(--mid)', fontSize: '14px' }}>شكراً لك على ثقتك. سنتصل بك خلال 24 ساعة.</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--white)', borderRadius: '10px', border: '1px solid var(--line)' }}>
        <ShoppingBag size={48} style={{ color: 'var(--dim)', marginBottom: '16px', opacity: 0.5 }} />
        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>السلة فارغة</h3>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl' }}>
      {/* GRID: منتجات + نموذج */}
      <div className="cart-g">

        {/* العمود الأيسر: المنتجات */}
        <div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '10px', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--slate)' }}>
              <h3 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={20} style={{ color: 'var(--blue)' }} />
                منتجاتك ({cartItems.length})
              </h3>
            </div>

            <div>
              {cartItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '15px', padding: '20px', borderBottom: '1px solid var(--line)', backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(241, 245, 249, 0.5)' }}>
                  <img src={item.product?.imagesProduct?.[0]?.imageUrl || '/placeholder.png'} alt={item.product?.name} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--line)' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{item.product?.name}</h4>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--blue)', margin: 0 }}>{item.finalPrice.toLocaleString()} دج</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--line-dk)', borderRadius: '6px', overflow: 'hidden' }}>
                        <button onClick={() => changeQty(index, -1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--off)', cursor: 'pointer', borderLeft: '1px solid var(--line-dk)' }}>
                          <Minus size={14} style={{ color: 'var(--ink)' }} />
                        </button>
                        <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{item.quantity}</span>
                        <button onClick={() => changeQty(index, 1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--off)', cursor: 'pointer', borderRight: '1px solid var(--line-dk)' }}>
                          <Plus size={14} style={{ color: 'var(--ink)' }} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(index)} style={{ marginRight: 'auto', background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px' }}>
                        <Trash2 size={16} /> حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 20px', backgroundColor: 'var(--blue-lt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--mid)', fontSize: '14px', fontWeight: 600 }}>المجموع الفرعي:</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 800, color: 'var(--blue)' }}>{cartTotal.toLocaleString()} دج</span>
            </div>
          </div>
        </div>

        {/* العمود الأيمن: النموذج */}
        <div>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '10px', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--slate)' }}>
              <h3 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={20} style={{ color: 'var(--blue)' }} />
                معلومات التوصيل
              </h3>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* الاسم */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '6px', display: 'block' }}>الاسم الكامل *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
                  <input type="text" value={fd.customerName} onChange={e => { setFd({ ...fd, customerName: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }} placeholder="مثال: محمد أحمد" className={`inp${errors.name ? ' inp-err' : ''}`} style={{ paddingLeft: '40px', width: '100%' }} />
                </div>
                {errors.name && <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> {errors.name}</p>}
              </div>

              {/* الهاتف */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '6px', display: 'block' }}>رقم الهاتف *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
                  <input type="tel" value={fd.customerPhone} onChange={e => { setFd({ ...fd, customerPhone: e.target.value }); if (errors.phone) setErrors({ ...errors, phone: '' }); }} placeholder="0XXXXXXXXX" className={`inp${errors.phone ? ' inp-err' : ''}`} style={{ paddingLeft: '40px', width: '100%' }} />
                </div>
                {errors.phone && <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> {errors.phone}</p>}
              </div>

              {/* الولاية والبلدية */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '6px', display: 'block' }}>الولاية *</label>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                    <select value={fd.customerWelaya} onChange={e => { setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' }); if (errors.welaya) setErrors({ ...errors, welaya: '' }); }} className={`inp${errors.welaya ? ' inp-err' : ''}`} style={{ paddingRight: '36px', cursor: 'pointer', width: '100%' }}>
                      <option value="">اختر الولاية</option>
                      {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                  {errors.welaya && <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errors.welaya}</p>}
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '6px', display: 'block' }}>البلدية *</label>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                    <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => { setFd({ ...fd, customerCommune: e.target.value }); if (errors.commune) setErrors({ ...errors, commune: '' }); }} className={`inp${errors.commune ? ' inp-err' : ''}`} style={{ paddingRight: '36px', cursor: loadingC || !fd.customerWelaya ? 'not-allowed' : 'pointer', opacity: loadingC || !fd.customerWelaya ? 0.6 : 1, width: '100%' }}>
                      <option value="">{loadingC ? '...' : !fd.customerWelaya ? 'اختر الولاية أولاً' : 'اختر البلدية'}</option>
                      {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                  {errors.commune && <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errors.commune}</p>}
                </div>
              </div>

              {/* نوع التوصيل */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '10px', display: 'block' }}>نوع التوصيل</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button type="button" onClick={() => setFd({ ...fd, typeLivraison: 'home' })} style={{ padding: '14px', borderRadius: '8px', border: fd.typeLivraison === 'home' ? '2px solid var(--blue)' : '1.5px solid var(--line-dk)', background: fd.typeLivraison === 'home' ? 'var(--blue-lt)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: fd.typeLivraison === 'home' ? 'var(--blue)' : 'var(--mid)' }}>🏠 للبيت</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '15px', fontWeight: 700, color: fd.typeLivraison === 'home' ? 'var(--blue)' : 'var(--dim)' }}>{selW ? `${selW.livraisonHome.toLocaleString()} دج` : '---'}</div>
                  </button>
                  <button type="button" onClick={() => setFd({ ...fd, typeLivraison: 'office' })} style={{ padding: '14px', borderRadius: '8px', border: fd.typeLivraison === 'office' ? '2px solid var(--blue)' : '1.5px solid var(--line-dk)', background: fd.typeLivraison === 'office' ? 'var(--blue-lt)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: fd.typeLivraison === 'office' ? 'var(--blue)' : 'var(--mid)' }}>🏢 للمكتب</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '15px', fontWeight: 700, color: fd.typeLivraison === 'office' ? 'var(--blue)' : 'var(--dim)' }}>{selW ? `${selW.livraisonOfice.toLocaleString()} دج` : '---'}</div>
                  </button>
                </div>
              </div>

              {/* ملخص الحساب */}
              <div style={{ marginTop: '8px', padding: '18px', background: 'var(--blue-lt)', borderRadius: '8px', border: '1px solid rgba(26, 110, 212, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--mid)' }}>المجموع الفرعي:</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{cartTotal.toLocaleString()} دج</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--mid)' }}>رسوم التوصيل:</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{getLivPrice() ? `${getLivPrice().toLocaleString()} دج` : '---'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '20px', borderTop: '1px solid var(--line)', paddingTop: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <span style={{ color: 'var(--ink)' }}>الإجمالي:</span>
                  <span style={{ color: 'var(--blue)' }}>{finalTotal.toLocaleString()} دج</span>
                </div>
              </div>

              {/* زر التأكيد */}
              <button type="submit" disabled={submitting} className="btn-blue" style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري المعالجة...</span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><CheckCircle2 size={18} /> تأكيد الطلب الآن</span>}
              </button>

              {/* شعارات الأمان */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px', flexWrap: 'wrap' }}>
                {[{ icon: <Lock size={12} />, label: 'دفع آمن' }, { icon: <ShieldCheck size={12} />, label: 'بيانات مشفّرة' }, { icon: <BadgeCheck size={12} />, label: 'موثّق ومعتمد' }].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--dim)' }}>
                    <span style={{ color: 'var(--blue)' }}>{item.icon}</span>{item.label}
                  </div>
                ))}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
/* ── STATIC PAGES ────────────────────────────────────────────── */
export function StaticPage({ page }: { page: string }) {
  const p = page.toLowerCase();
  return <>{p === 'privacy' && <Privacy />}{p === 'terms' && <Terms />}{p === 'cookies' && <Cookies />}{p === 'contact' && <Contact />}</>;
}

const Shell = ({ children, title, sub }: { children: React.ReactNode; title: string; sub?: string }) => (
  <div dir="rtl" style={{ backgroundColor: 'var(--off)', minHeight: '100vh' }}>
    <div style={{ backgroundColor: 'var(--white)', padding: '48px 20px 36px', borderBottom: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, var(--blue), var(--teal))' }} />
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {sub && <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '8px' }}>{sub}</p>}
        <h1 className="pjs" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.6rem)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px 72px' }}>
      <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '10px', padding: '28px' }}>{children}</div>
    </div>
  </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start' }}>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '7px' }}>
        <ShieldCheck style={{ width: '14px', height: '14px', color: 'var(--blue)', flexShrink: 0 }} /> {title}
      </h3>
      <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--mid)', margin: 0 }}>{body}</p>
    </div>
    {tag && <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', backgroundColor: 'var(--blue-lt)', border: '1px solid rgba(26,110,212,0.2)', color: 'var(--blue)', borderRadius: '20px', flexShrink: 0 }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="// قانوني">
      <IB title="البيانات التي نجمعها" body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك." />
      <IB title="كيف نستخدمها" body="حصرياً لتنفيذ وتوصيل مشترياتك. لا استخدام تجاري لبياناتك." />
      <IB title="الأمان" body="بياناتك محمية بتشفير على مستوى المؤسسات وبنية تحتية آمنة." />
      <IB title="مشاركة البيانات" body="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين." />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="شروط الخدمة" sub="// قانوني">
      <IB title="حسابك" body="أنت مسؤول عن أمان بيانات تسجيل الدخول وكل النشاط تحت حسابك." />
      <IB title="المدفوعات" body="لا رسوم مخفية. السعر المعروض هو السعر النهائي الإجمالي." />
      <IB title="الاستخدام المحظور" body="المنتجات الأصيلة فقط. لا مجال للمقلدات أو غير المعتمدة." tag="صارم" />
      <IB title="القانون الحاكم" body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="ملفات الارتباط" sub="// قانوني">
      <IB title="الكوكيز الأساسية" body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب" />
      <IB title="كوكيز التفضيلات" body="تحفظ لغتك ومنطقتك لتجربة أفضل." tag="اختياري" />
      <IB title="كوكيز التحليلات" body="بيانات مجمعة لتحسين المنصة. لا بيانات شخصية." tag="اختياري" />
      <div style={{ marginTop: '14px', padding: '13px 15px', border: '1px solid rgba(26,110,212,0.18)', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start', backgroundColor: 'var(--blue-lt)' }}>
        <ToggleRight style={{ width: '17px', height: '17px', color: 'var(--blue)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13px', color: 'var(--mid)', lineHeight: '1.75', margin: 0 }}>
          يمكنك إدارة تفضيلات الكوكيز من إعدادات المتصفح في أي وقت.
        </p>
      </div>
    </Shell>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  return (
    <div dir="rtl" style={{ backgroundColor: 'var(--off)', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'var(--white)', padding: '48px 20px 36px', borderBottom: '1px solid var(--line)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, var(--blue), var(--teal))' }} />
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '7px' }}>تواصل</p>
          <h1 className="pjs" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.6rem)', fontWeight: 800, color: 'var(--ink)', margin: '0 0 7px' }}>نسعد بمساعدتك</h1>
          <p style={{ fontSize: '13px', color: 'var(--dim)' }}>فريقنا المتخصص يرد خلال 24 ساعة 🩺</p>
        </div>
      </div>

      <div className="contact-g" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px 72px' }}>
        <div>
          <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '10px', padding: '22px', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '16px' }}>طرق التواصل</p>
            {[
              { icon: <Phone style={{ width: '14px', height: '14px' }} />, label: 'الهاتف', val: '+213 550 000 000', href: 'tel:+213550000000' },
              { icon: <Mail style={{ width: '14px', height: '14px' }} />, label: 'البريد', val: 'info@store.dz', href: 'mailto:info@store.dz' },
              { icon: <MapPin style={{ width: '14px', height: '14px' }} />, label: 'الموقع', val: 'الجزائر', href: undefined },
            ].map(item => (
              <a key={item.label} href={item.href || '#'} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: '1px solid var(--line)', textDecoration: 'none' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: 'var(--blue-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', margin: '0 0 1px' }}>{item.label}</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{item.val}</p>
                </div>
                {item.href && <ArrowRight style={{ width: '12px', height: '12px', color: 'var(--dim)', marginRight: 'auto' }} />}
              </a>
            ))}
          </div>
          <div style={{ backgroundColor: 'var(--teal-lt)', border: '1px solid rgba(13,148,136,0.18)', borderRadius: '10px', padding: '18px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '12px' }}>اعتماداتنا</p>
            {[
              { icon: <BadgeCheck style={{ width: '14px', height: '14px' }} />, label: 'منتجات شبه طبية موثّقة' },
              { icon: <ShieldCheck style={{ width: '14px', height: '14px' }} />, label: 'جودة مضمونة ومعتمدة' },
              { icon: <FlaskConical style={{ width: '14px', height: '14px' }} />, label: 'مكونات آمنة وفعّالة' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 0', borderBottom: i < 2 ? '1px solid rgba(13,148,136,0.12)' : 'none', color: 'var(--teal)' }}>
                {b.icon}
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--line)', borderRadius: '10px', padding: '24px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '18px' }}>أرسل رسالة</p>
          {sent ? (
            <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '8px', textAlign: 'center', backgroundColor: 'rgba(22,163,74,0.04)', padding: '28px' }}>
              <CheckCircle2 style={{ width: '32px', height: '32px', color: 'var(--green)', marginBottom: '12px' }} />
              <h3 className="pjs" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', margin: '0 0 5px' }}>تم الإرسال!</h3>
              <p style={{ fontSize: '13px', color: 'var(--dim)' }}>سنرد عليك خلال 24 ساعة.</p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              {[
                { label: 'اسمك', type: 'text', key: 'name', ph: 'الاسم الكامل' },
                { label: 'البريد', type: 'email', key: 'email', ph: 'بريدك@الإلكتروني' },
              ].map(f => (
                <div key={f.key}>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '5px' }}>{f.label}</p>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph} required className="inp"
                    onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = 'var(--line-dk)'; }} />
                </div>
              ))}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '5px' }}>رسالتك</p>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="كيف يمكننا مساعدتك؟" rows={4} required className="inp"
                  style={{ resize: 'none' as any }}
                  onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }} onBlur={e => { e.target.style.borderColor = 'var(--line-dk)'; }} />
              </div>
              <button type="submit" className="btn-blue" style={{ justifyContent: 'center', width: '100%', fontSize: '14px', padding: '12px', borderRadius: '7px' }}>
                إرسال الرسالة <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}