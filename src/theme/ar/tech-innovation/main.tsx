'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  ShoppingCart, MapPin, Phone, User,
  Home as HomeIcon, ChevronDown, Truck, Shield, Package,
  Building2, AlertCircle, Tag, Zap,
  Check, ChevronLeft, ChevronRight, FileText, Heart,
  Infinity, Link2, Share2, X,
  ShieldCheck, Eye, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
  Cpu, Globe2, Mail,
} from 'lucide-react';
import { Store } from '@/types/store';

// ─────────────────────────────────────────────────────────────
// CONSTANTS & TYPES
// ─────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;500&display=swap');
  * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #020810; }
  ::-webkit-scrollbar-thumb { background: #00E5FF; }
  @keyframes pulse-glow { 0%,100%{box-shadow:0 0 10px rgba(0,229,255,0.2)} 50%{box-shadow:0 0 25px rgba(0,229,255,0.5)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes glow-pulse { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
  @keyframes data-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes data-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .hex-grid { background-image: linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px); background-size: 50px 50px; }
  .neon-text { text-shadow: 0 0 20px rgba(0,229,255,0.5), 0 0 60px rgba(0,229,255,0.2); }
  .stat-card { border: 1px solid #0D2030; transition: all 0.3s; }
  .stat-card:hover { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 20px rgba(0,229,255,0.06); }
  .tech-nav-link { position: relative; }
  .tech-nav-link::before { content:'['; opacity:0; transition:opacity 0.2s; margin-left:4px; color:#00E5FF; }
  .tech-nav-link::after  { content:']'; opacity:0; transition:opacity 0.2s; margin-right:4px; color:#00E5FF; }
  .tech-nav-link:hover::before, .tech-nav-link:hover::after { opacity:1; }
  .corner-tl { border-top:1.5px solid #00E5FF; border-right:1.5px solid #00E5FF; width:8px; height:8px; position:absolute; top:-1px; right:-1px; }
  .corner-br { border-bottom:1.5px solid #00E5FF; border-left:1.5px solid #00E5FF; width:8px; height:8px; position:absolute; bottom:-1px; left:-1px; }
`;

interface Offer               { id: string; name: string; quantity: number; price: number; }
interface Variant             { id: string; name: string; value: string; }
interface Attribute           { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage        { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail       { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya              { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune             { id: string; name: string; ar_name: string; wilayaId: string; }

export interface Product {
  id: string; name: string; price: string | number;
  priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[];
  offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; };
}

export interface ProductFormProps {
  product:          Product;
  userId:           string;
  domain:           string;
  redirectPath?:    string;
  selectedOffer:    string | null;
  setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>;
  platform?:        string;
  priceLoss?:       number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some(e => e.attrName === attrName && e.value === val)
  );
}

const fetchWilayas  = async (userId: string): Promise<Wilaya[]>   => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wilayaId: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`); return data || []; } catch { return []; } };

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────

export default function Main({ store, children }: any) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050B14', fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{FONT_CSS}</style>

      {store.topBar?.enabled && store.topBar?.text && (
        <div className="relative overflow-hidden py-2 px-4 text-center text-xs tracking-widest uppercase"
          style={{ backgroundColor: '#000D1A', color: '#00E5FF', borderBottom: '1px solid rgba(0,229,255,0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="mr-2" style={{ color: '#39FF14' }}>⚡</span>
          {store.topBar.text}
          <span className="ml-2" style={{ color: '#39FF14' }}>⚡</span>
        </div>
      )}

      <Navbar store={store} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────

export function Navbar({ store }: { store: Store }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [tick,       setTick]       = useState(true);
  const [clock,      setClock]      = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => !t), 800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString('ar', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const navItems = [
    { href: `/${store.subdomain}`,         label: 'الرئيسية',        code: '٠١' },
    { href: `/${store.subdomain}/contact`, label: 'اتصل بنا',        code: '٠٢' },
    { href: `/${store.subdomain}/Privacy`, label: 'سياسة الخصوصية', code: '٠٣' },
  ];

  const initials = store.name.split(' ').filter(Boolean).map((w: string) => w[0].toUpperCase()).join('');

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'shadow-[0_4px_30px_rgba(0,229,255,0.08)]' : ''}`}
      style={{ backgroundColor: scrolled ? 'rgba(5,11,20,0.97)' : '#050B14', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: '1px solid #0D1F2D', fontFamily: "'JetBrains Mono', monospace" }}
      dir="rtl"
    >
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #00E5FF 40%, #39FF14 60%, transparent)' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">

          {/* الشعار */}
          <Link href={`/${store.subdomain}`} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 flex items-center justify-center" style={{ border: '1px solid #00E5FF', boxShadow: '0 0 12px rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.05)' }}>
                {store.design.logoUrl
                  ? <img src={store.design.logoUrl} alt={store.name} className="h-6 w-auto object-contain" />
                  : <span className="text-sm font-bold" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif" }}>{initials}</span>
                }
                <span className="corner-tl" /><span className="corner-br" />
              </div>
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest group-hover:text-[#00E5FF] transition-colors duration-200" style={{ color: '#C8D8E8', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.15em' }}>
                {store.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#39FF14' }} />
                <span className="text-[9px] tracking-widest" style={{ color: '#39FF14' }}>متصل</span>
                <span className="text-[9px]" style={{ color: '#1A3A4A' }}>| النظام_نشط</span>
              </div>
            </div>
          </Link>

          {/* قائمة سطح المكتب */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="tech-nav-link flex items-center gap-2 text-[11px] tracking-widest transition-colors duration-200 group" style={{ color: '#6A8A9A' }}>
                <span style={{ color: '#00E5FF', opacity: 0.45 }}>{item.code}/</span>
                <span className="group-hover:text-[#00E5FF] transition-colors duration-200">{item.label}</span>
              </Link>
            ))}
            <div className="text-[10px] tracking-wider px-3 py-1.5 text-center" style={{ border: '1px solid #0D2030', color: '#2A5A6A', minWidth: '88px' }}>
              {clock || '──:──:──'}
              <span style={{ color: tick ? '#00E5FF' : 'transparent', marginLeft: '3px' }}>▮</span>
            </div>
          </div>

          {/* زر القائمة للجوال */}
          <button onClick={() => setIsMenuOpen(p => !p)} className="md:hidden p-2 flex flex-col gap-1.5 items-end" aria-label="تبديل القائمة">
            {isMenuOpen
              ? <Zap className="w-5 h-5" style={{ color: '#00E5FF' }} />
              : (<><span className="block h-px w-5" style={{ backgroundColor: '#00E5FF' }} /><span className="block h-px w-3" style={{ backgroundColor: '#00E5FF' }} /><span className="block h-px w-5" style={{ backgroundColor: '#00E5FF' }} /></>)
            }
          </button>
        </div>

        {/* قائمة الجوال */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-56 pb-5' : 'max-h-0'}`}>
          <div className="pt-4 flex flex-col gap-4" style={{ borderTop: '1px solid #0D1F2D' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-[11px] tracking-widest hover:text-[#00E5FF] transition-colors" style={{ color: '#6A8A9A' }}>
                <span style={{ color: '#00E5FF' }}>{item.code}_</span>{item.label}
              </Link>
            ))}
            <div className="text-[10px] tracking-wider mt-2 py-2 text-center" style={{ borderTop: '1px solid #0D1F2D', color: '#2A5A6A' }}>
              {clock || '──:──:──'}<span style={{ color: tick ? '#00E5FF' : 'transparent', marginLeft: '3px' }}>▮</span>
            </div>
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
  return (
    <footer dir="rtl" style={{ backgroundColor: '#020810', borderTop: '1px solid #0D1F2D', fontFamily: "'JetBrains Mono', monospace", position: 'relative', overflow: 'hidden' }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-10 pb-10" style={{ borderBottom: '1px solid #0D1F2D' }}>

          {/* العلامة التجارية */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center" style={{ border: '1px solid rgba(0,229,255,0.4)', boxShadow: '0 0 10px rgba(0,229,255,0.15)' }}>
                {store.design.logoUrl
                  ? <img src={store.design.logoUrl} alt={store.name} className="h-5 w-auto object-contain opacity-80" />
                  : <span className="text-xs font-bold" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif" }}>{store.name.charAt(0)}</span>
                }
              </div>
              <span className="text-sm tracking-widest font-bold" style={{ color: '#C8D8E8', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.12em' }}>{store.name}</span>
            </div>
            <p className="text-[11px] leading-relaxed max-w-xs" style={{ color: '#2A5A6A' }}>
              // منصة تجارة الجيل القادم<br />
              // مدعومة بمحرك الابتكار v4.2
            </p>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="animate-pulse" style={{ color: '#39FF14' }}>●</span>
              <span style={{ color: '#39FF14' }}>جميع الأنظمة تعمل بكفاءة</span>
            </div>
          </div>

          {/* الروابط */}
          <div className="flex flex-col gap-3">
            <p className="text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: '#00E5FF' }}>// التنقل</p>
            {[
              { href: `/${store.subdomain}/Privacy`, label: 'سياسة_الخصوصية'     },
              { href: `/${store.subdomain}/Terms`,   label: 'شروط_الاستخدام'     },
              { href: `/${store.subdomain}/Cookies`, label: 'بروتوكول_الكوكيز'  },
            ].map(link => (
              <a key={link.href} href={link.href} className="flex items-center gap-2 text-[11px] tracking-wider hover:text-[#00E5FF] transition-colors group" style={{ color: '#3A6070' }}>
                <span className="group-hover:text-[#39FF14] transition-colors" style={{ color: '#1A3040' }}>›</span>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-widest" style={{ color: '#1A3A4A' }}>© {new Date().getFullYear()} {store.name.toUpperCase()} — جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: '#1A3040' }}>
            <span style={{ color: '#00E5FF', opacity: 0.4 }}>◈</span>
            <span>ثيم الابتكار التقني</span>
            <span style={{ color: '#00E5FF', opacity: 0.4 }}>◈</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  return (
    <div
      className="group relative flex flex-col overflow-hidden transition-all duration-300"
      style={{ backgroundColor: '#080F1A', border: '1px solid #0D2030', fontFamily: "'JetBrains Mono', monospace" }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,229,255,0.5)'; el.style.boxShadow = '0 0 25px rgba(0,229,255,0.08), inset 0 0 40px rgba(0,229,255,0.02)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0D2030'; el.style.boxShadow = 'none'; }}
    >
      <span className="absolute top-0 left-0 w-4 h-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderTop: '1.5px solid #00E5FF', borderLeft: '1.5px solid #00E5FF' }} />
      <span className="absolute bottom-0 right-0 w-4 h-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderBottom: '1.5px solid #00E5FF', borderRight: '1.5px solid #00E5FF' }} />

      <div className="absolute top-3 left-3 z-10 text-[9px] tracking-widest px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF' }}>
        وحدة_{String(product.id).slice(-3).toUpperCase()}
      </div>

      <div className="relative h-56 overflow-hidden" style={{ backgroundColor: '#040C16' }}>
        {displayImage ? (
          <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center" style={{ border: '1px solid #0D2030' }}>
              <Zap className="w-6 h-6" style={{ color: '#1A4A5A' }} />
            </div>
            <span className="text-[10px] tracking-widest" style={{ color: '#1A3A4A' }}>لا_توجد_صورة</span>
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.015) 2px, rgba(0,229,255,0.015) 4px)' }} />
        {discount > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 text-[10px] tracking-widest font-bold" style={{ backgroundColor: '#39FF14', color: '#020810' }}>
            -{discount}%
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 py-1 px-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ backgroundColor: 'rgba(0,229,255,0.08)', borderTop: '1px solid rgba(0,229,255,0.15)' }}>
          <p className="text-[9px] tracking-widest" style={{ color: '#00E5FF' }}>◉ اكتمل_فحص_الوحدة</p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-medium mb-1 line-clamp-1 group-hover:text-[#00E5FF] transition-colors" style={{ color: '#C8D8E8', fontFamily: "'Orbitron', sans-serif", fontSize: '0.75rem', letterSpacing: '0.08em' }}>
          {product.name}
        </h3>
        {product.desc && (
          <div className="text-[11px] mb-4 line-clamp-2 leading-relaxed opacity-50" style={{ color: '#6A8A9A' }} dangerouslySetInnerHTML={{ __html: product.desc }} />
        )}
        <div className="my-3 h-px" style={{ background: 'linear-gradient(90deg, #00E5FF22, transparent)' }} />
        <div className="mt-auto space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="font-bold" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", fontSize: '1.3rem' }}>{product.price}</span>
            <span className="text-[10px] tracking-widest" style={{ color: '#2A6A7A' }}>{store.currency}</span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="text-xs line-through" style={{ color: '#2A4A5A' }}>{product.priceOriginal}</span>
            )}
          </div>
          <Link
            href={`/product/${product.slug || product.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 text-[10px] tracking-widest uppercase font-bold transition-all duration-300"
            style={{ border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF', backgroundColor: 'transparent' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#00E5FF'; el.style.color = '#020810'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'transparent'; el.style.color = '#00E5FF'; }}
          >
            <Zap className="w-3 h-3" /> {viewDetails}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────

export const Home = ({ store }: any) => {
  const stats = [
    { icon: <Cpu className="w-4 h-4" />,    label: 'وحدات_نشطة',    val: store.products?.length  || 0 },
    { icon: <Globe2 className="w-4 h-4" />, label: 'التصنيفات',      val: store.categories?.length || 0 },
    { icon: <Shield className="w-4 h-4" />, label: 'أمان_كامل',      val: '١٠٠٪' },
    { icon: <Zap className="w-4 h-4" />,    label: 'توصيل_سريع',     val: '٢٤ ساعة' },
  ];

  return (
    <div className="min-h-screen" dir="rtl" style={{ backgroundColor: '#050B14', fontFamily: "'JetBrains Mono', monospace" }}>

      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '90vh' }}>
        <div className="absolute inset-0 hex-grid" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,229,255,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: '40%', height: '1px', background: 'linear-gradient(90deg, transparent, #00E5FF)', transform: 'rotate(-15deg)' }} />
          <div style={{ position: 'absolute', top: '30%', right: '5%', width: '30%', height: '1px', background: 'linear-gradient(90deg, #00E5FF, transparent)', transform: 'rotate(10deg)' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, #39FF14)' }} />
        </div>

        <div className="absolute top-12 right-12 text-[10px] tracking-widest hidden lg:block" style={{ color: '#1A4A5A' }}>
          <div>إصدار_النظام: ٤.٢.١</div>
          <div>حالة_العقدة: <span style={{ color: '#39FF14' }}>نشطة</span></div>
          <div>وقت_التشغيل: ٩٩.٩٨٪</div>
        </div>
        <div className="absolute bottom-16 left-12 text-[10px] tracking-widest hidden lg:block" style={{ color: '#1A4A5A' }}>
          <div>خط_العرض: 36.73°N</div><div>خط_الطول: 3.09°E</div>
          <div>الإشارة: <span style={{ color: '#00E5FF' }}>████████░░</span></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {store.hero.imageUrl && (
            <div className="absolute inset-0 -z-10 overflow-hidden" style={{ opacity: 0.15 }}>
              <img src={store.hero.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5" style={{ border: '1px solid rgba(0,229,255,0.3)', backgroundColor: 'rgba(0,229,255,0.04)' }}>
            <span className="animate-pulse w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#39FF14' }} />
            <span className="text-[10px] tracking-widest uppercase" style={{ color: '#00E5FF' }}>
              النظام_متصل — جاهز_للنشر
            </span>
          </div>
          {store.hero.title && (
            <h1 className="neon-text mb-5 leading-none" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(2.2rem, 7vw, 6rem)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {store.hero.title}
            </h1>
          )}
          {store.hero.subtitle && (
            <p className="mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: '#4A7A8A', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              // {store.hero.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#products" className="flex items-center gap-2 px-8 py-3.5 text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]" style={{ backgroundColor: '#00E5FF', color: '#020810' }}>
              <Zap className="w-3.5 h-3.5" /> استكشف_المنتجات
            </a>
            <a href="#categories" className="flex items-center gap-2 px-8 py-3.5 text-xs tracking-widest uppercase transition-all duration-300"
              style={{ border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF', backgroundColor: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,229,255,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              عرض_التصنيفات
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #00E5FF, #39FF14, transparent)' }} />
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: '1px solid #0D1F2D', borderBottom: '1px solid #0D1F2D', backgroundColor: '#030810' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card flex items-center gap-4 px-5 py-4" style={{ backgroundColor: '#050B14' }}>
                <div className="flex-shrink-0" style={{ color: '#00E5FF' }}>{stat.icon}</div>
                <div>
                  <p className="text-[9px] tracking-widest mb-0.5" style={{ color: '#2A5A6A' }}>{stat.label}</p>
                  <p className="font-bold text-sm" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif" }}>{stat.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-5 mb-12">
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#00E5FF' }}>◈ التصنيفات</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
            <span className="text-[10px]" style={{ color: '#1A3A4A' }}>وحدة_قاعدة_البيانات_٠٢</span>
          </div>
          {store.categories && store.categories.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              <Link href={`/${store.domain}`}
                className="flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-widest uppercase transition-all duration-200"
                style={{ border: '1px solid rgba(0,229,255,0.4)', color: '#00E5FF', backgroundColor: 'rgba(0,229,255,0.04)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,229,255,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,229,255,0.04)'; }}
              >
                <span style={{ color: '#39FF14' }}>◉</span> الكل
              </Link>
              {store.categories.map((cat: any, i: number) => (
                <Link key={cat.id} href={`/${store.domain}?category=${cat.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-widest uppercase transition-all duration-200"
                  style={{ border: '1px solid #0D2030', color: '#4A7A8A', backgroundColor: '#080F1A' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,229,255,0.4)'; el.style.color = '#00E5FF'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0D2030'; el.style.color = '#4A7A8A'; }}
                >
                  <span style={{ color: '#1A3A4A' }}>{String(i + 1).padStart(2, '0')}/</span>{cat.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center" style={{ border: '1px dashed #0D2030' }}>
              <p className="text-[11px] tracking-widest" style={{ color: '#1A4A5A' }}>// لا تتوفر تيارات بيانات</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-5 mb-12">
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#00E5FF' }}>◈ قاعدة_بيانات_المنتجات</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
            <span className="text-[10px]" style={{ color: '#1A3A4A' }}>السجلات: {store.products?.length || 0}</span>
          </div>
          {store.products && store.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {store.products.map((product: any) => {
                const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
                const discount = product.priceOriginal
                  ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100) : 0;
                return <Card key={product.id} product={product} displayImage={displayImage} discount={discount} store={store} viewDetails="عرض_التفاصيل" />;
              })}
            </div>
          ) : (
            <div className="py-24 text-center" style={{ border: '1px dashed #0D2030' }}>
              <Zap className="w-10 h-10 mx-auto mb-4 opacity-20" style={{ color: '#00E5FF' }} />
              <p className="text-xs tracking-widest mb-2" style={{ color: '#1A4A5A', fontFamily: "'Orbitron', sans-serif" }}>قاعدة_البيانات_فارغة</p>
              <p className="text-[10px] tracking-widest" style={{ color: '#0D2A3A' }}>// لم يتم العثور على سجلات في السجل</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DETAILS PAGE
// ─────────────────────────────────────────────────────────────

export function Details({
  product, toggleWishlist, isWishlisted, handleShare, discount,
  allImages, allAttrs, finalPrice, inStock, autoGen,
  selectedVariants, setSelectedOffer, selectedOffer,
  resolvedParams, handleVariantSelection, domain,
}: any) {
  const [submitSuccess,  setSubmitSuccess]  = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [selectedImage,  setSelectedImage]  = useState(0);

  return (
    <div className="min-h-screen" dir="rtl" style={{ backgroundColor: '#050B14', fontFamily: "'JetBrains Mono', monospace" }}>

      {submitSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4" style={{ backgroundColor: '#050B14', border: '1px solid rgba(57,255,20,0.4)', boxShadow: '0 0 30px rgba(57,255,20,0.15)', fontFamily: "'JetBrains Mono', monospace" }}>
          <div className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: '#39FF14' }}>
            <Check className="w-3.5 h-3.5 text-black" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest" style={{ color: '#39FF14' }}>تم_تأكيد_الطلب.نجاح</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#2A5A6A' }}>// سنتصل بك خلال 24 ساعة لتأكيد الطلب</p>
          </div>
        </div>
      )}
      {showShareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest" style={{ backgroundColor: '#050B14', border: '1px solid rgba(0,229,255,0.4)', color: '#00E5FF' }}>
          <Link2 className="w-3.5 h-3.5" />تم_نسخ_الرابط
        </div>
      )}

      {/* شريط التنقل */}
      <header style={{ borderBottom: '1px solid #0D1F2D', backgroundColor: 'rgba(5,11,20,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-[10px] tracking-widest" style={{ color: '#2A5A6A' }}>
            <span className="hover:text-[#00E5FF] cursor-pointer transition-colors">الرئيسية</span>
            <span style={{ color: '#00E5FF' }}>/</span>
            <span className="hover:text-[#00E5FF] cursor-pointer transition-colors">الكتالوج</span>
            <span style={{ color: '#00E5FF' }}>/</span>
            <span style={{ color: '#C8D8E8' }}>{product.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleWishlist} className="w-8 h-8 flex items-center justify-center transition-all" style={{ border: '1px solid #0D2030', color: isWishlisted ? '#FF3B30' : '#3A6A7A', backgroundColor: isWishlisted ? 'rgba(255,59,48,0.08)' : 'transparent' }}>
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center" style={{ border: '1px solid #0D2030', color: '#3A6A7A' }}>
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 text-[9px] tracking-widest font-bold" style={{ border: `1px solid ${inStock ? 'rgba(57,255,20,0.3)' : 'rgba(255,59,48,0.3)'}`, backgroundColor: inStock ? 'rgba(57,255,20,0.06)' : 'rgba(255,59,48,0.06)', color: inStock ? '#39FF14' : '#FF3B30' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'animate-pulse' : ''}`} style={{ backgroundColor: inStock ? '#39FF14' : '#FF3B30' }} />
              {inStock ? 'متوفر_في_المخزون' : 'نفد_المخزون'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* ── الصور ── */}
          <div className="space-y-3">
            <div className="relative overflow-hidden group" style={{ aspectRatio: '1', backgroundColor: '#040C16', border: '1px solid #0D2030' }}>
              {allImages.length > 0 ? (
                <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" loading="eager" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Package className="w-16 h-16" style={{ color: '#0D2030' }} />
                  <span className="text-[10px] tracking-widest" style={{ color: '#1A3A4A' }}>لا_توجد_صورة</span>
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.012) 3px, rgba(0,229,255,0.012) 4px)' }} />
              <span className="absolute top-3 right-3 w-5 h-5" style={{ borderTop: '1.5px solid #00E5FF', borderRight: '1.5px solid #00E5FF' }} />
              <span className="absolute bottom-3 left-3 w-5 h-5" style={{ borderBottom: '1.5px solid #00E5FF', borderLeft: '1.5px solid #00E5FF' }} />
              {discount > 0 && (
                <div className="absolute top-4 left-4 px-2.5 py-1 text-[10px] tracking-widest font-bold" style={{ backgroundColor: '#39FF14', color: '#020810' }}>
                  -{discount}%
                </div>
              )}
              <button onClick={toggleWishlist} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center transition-all" style={{ backgroundColor: isWishlisted ? '#FF3B30' : 'rgba(5,11,20,0.8)', border: '1px solid rgba(0,229,255,0.2)', color: isWishlisted ? 'white' : '#00E5FF' }}>
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              {!inStock && !autoGen && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(5,11,20,0.85)', backdropFilter: 'blur(4px)' }}>
                  <div className="px-6 py-3 text-xs tracking-widest font-bold" style={{ border: '1px solid rgba(255,59,48,0.4)', color: '#FF3B30', fontFamily: "'Orbitron', sans-serif" }}>الوحدة_غير_متاحة</div>
                </div>
              )}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage((p: number) => p === 0 ? allImages.length - 1 : p - 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ backgroundColor: 'rgba(5,11,20,0.8)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF' }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedImage((p: number) => p === allImages.length - 1 ? 0 : p + 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ backgroundColor: 'rgba(5,11,20,0.8)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF' }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className="shrink-0 w-16 h-16 overflow-hidden transition-all duration-200" style={{ border: `1px solid ${selectedImage === idx ? '#00E5FF' : '#0D2030'}`, boxShadow: selectedImage === idx ? '0 0 12px rgba(0,229,255,0.25)' : 'none', opacity: selectedImage === idx ? 1 : 0.5 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* شارات الثقة */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'دفع_آمن'     },
                { icon: <Truck className="w-3.5 h-3.5" />,       label: 'شحن_سريع'    },
                { icon: <Zap className="w-3.5 h-3.5" />,         label: 'ضمان_الجودة' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 py-3" style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}>
                  <span style={{ color: '#00E5FF' }}>{b.icon}</span>
                  <span className="text-[9px] tracking-widest" style={{ color: '#2A5A6A' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── المعلومات + النموذج ── */}
          <div className="space-y-7">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: '#00E5FF' }}>◈ بيانات_المنتج</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
              </div>
              <h1 className="leading-tight mb-3" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#FFFFFF', letterSpacing: '0.04em' }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm" style={{ color: i < 4 ? '#00E5FF' : '#1A3A4A' }}>◆</span>
                  ))}
                </div>
                <span className="text-[10px] tracking-widest" style={{ color: '#2A5A6A' }}>التقييم: ٤.٨ | ١٢٨ تقييم</span>
              </div>
            </div>

            {/* السعر */}
            <div className="p-5 relative" style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #00E5FF, transparent)' }} />
              <p className="text-[9px] tracking-widest mb-2" style={{ color: '#2A5A6A' }}>سعر_الوحدة</p>
              <div className="flex items-baseline gap-4">
                <span className="font-black" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '2.5rem', color: '#00E5FF', textShadow: '0 0 20px rgba(0,229,255,0.3)' }}>
                  {finalPrice.toLocaleString('ar-DZ')}
                </span>
                <span className="text-xs tracking-widest" style={{ color: '#2A6A7A' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <div>
                    <span className="text-sm line-through" style={{ color: '#1A4A5A' }}>{parseFloat(product.priceOriginal).toLocaleString('ar-DZ')} دج</span>
                    <p className="text-[9px] tracking-widest mt-0.5" style={{ color: '#39FF14' }}>وفري: {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString('ar-DZ')} دج</p>
                  </div>
                )}
              </div>
            </div>

            {/* المخزون */}
            <div className="inline-flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest font-bold" style={{ border: `1px solid ${autoGen ? 'rgba(0,229,255,0.3)' : inStock ? 'rgba(57,255,20,0.3)' : 'rgba(255,59,48,0.3)'}`, backgroundColor: autoGen ? 'rgba(0,229,255,0.04)' : inStock ? 'rgba(57,255,20,0.04)' : 'rgba(255,59,48,0.04)', color: autoGen ? '#00E5FF' : inStock ? '#39FF14' : '#FF3B30' }}>
              {autoGen ? <Infinity className="w-3.5 h-3.5" /> : inStock ? <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> : <X className="w-3.5 h-3.5" />}
              {autoGen ? 'مخزون_غير_محدود' : inStock ? 'المخزون_متاح' : 'نفد_المخزون'}
            </div>

            {/* الباقات */}
            {product.offers?.length > 0 && (
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: '#00E5FF' }}>◈ الباقات_المتاحة</p>
                <div className="space-y-2">
                  {product.offers.map((offer: any) => (
                    <label key={offer.id} className="flex items-center justify-between p-4 cursor-pointer transition-all duration-200" style={{ border: `1px solid ${selectedOffer === offer.id ? 'rgba(0,229,255,0.5)' : '#0D2030'}`, backgroundColor: selectedOffer === offer.id ? 'rgba(0,229,255,0.05)' : '#080F1A', boxShadow: selectedOffer === offer.id ? '0 0 15px rgba(0,229,255,0.1)' : 'none' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center" style={{ border: `1px solid ${selectedOffer === offer.id ? '#00E5FF' : '#1A3A4A'}` }}>
                          {selectedOffer === offer.id && <div className="w-2 h-2" style={{ backgroundColor: '#00E5FF' }} />}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                        <div>
                          <p className="text-xs font-medium" style={{ color: '#C8D8E8' }}>{offer.name}</p>
                          <p className="text-[9px] tracking-wider mt-0.5" style={{ color: '#2A5A6A' }}>الكمية: {offer.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", fontSize: '1rem' }}>
                        {offer.price.toLocaleString('ar-DZ')} <span className="text-xs">دج</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* المتغيرات */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id}>
                <p className="text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: '#00E5FF' }}>◈ {attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.name} className="w-9 h-9 transition-all duration-200" style={{ backgroundColor: v.value, border: `2px solid ${isSel ? '#00E5FF' : 'transparent'}`, boxShadow: isSel ? '0 0 12px rgba(0,229,255,0.4)' : 'none' }} />;
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className="w-14 h-14 overflow-hidden transition-all" style={{ border: `1px solid ${isSel ? '#00E5FF' : '#0D2030'}`, boxShadow: isSel ? '0 0 12px rgba(0,229,255,0.25)' : 'none' }}>
                          <img src={v.value} alt={v.name} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} className="px-5 py-2 text-[10px] tracking-widest uppercase transition-all duration-200" style={{ border: `1px solid ${isSel ? '#00E5FF' : '#0D2030'}`, backgroundColor: isSel ? 'rgba(0,229,255,0.08)' : '#080F1A', color: isSel ? '#00E5FF' : '#3A6A7A', boxShadow: isSel ? '0 0 12px rgba(0,229,255,0.15)' : 'none' }}>{v.name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />
          </div>
        </div>

        {/* الوصف */}
        {product.desc && (
          <section className="mt-20 pt-12" style={{ borderTop: '1px solid #0D1F2D' }}>
            <div className="flex items-center gap-5 mb-8">
              <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#00E5FF' }}>◈ وصف_المنتج</span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
            </div>
            <div className="p-6" style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}>
              <div className="text-sm leading-relaxed" style={{ color: '#4A7A8A' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCT FORM
// ─────────────────────────────────────────────────────────────

const FieldWrapper = ({ error, children, label }: { error?: string; children: React.ReactNode; label?: string }) => (
  <div className="space-y-1.5">
    {label && <label className="text-[9px] tracking-[0.2em] uppercase font-medium" style={{ color: '#2A6A7A', fontFamily: "'JetBrains Mono', monospace" }}>{label}</label>}
    {children}
    {error && (
      <p className="text-[10px] flex items-center gap-1 tracking-wider" style={{ color: '#FF3B30' }}>
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const inputCls = (err?: boolean) =>
  `w-full px-4 py-3 text-sm outline-none transition-all font-light bg-transparent text-[#C8D8E8] placeholder-[#1A4A5A] border`
  + ` ${err ? 'border-[#FF3B30]' : 'border-[#0D2030]'} focus:border-[#00E5FF] focus:shadow-[0_0_12px_rgba(0,229,255,0.15)]`;

export function ProductForm({
  product, userId, domain,
  selectedOffer, setSelectedOffer, selectedVariants,
  platform, priceLoss = 0,
}: ProductFormProps) {
  const router = useRouter();

  const [wilayas,         setWilayas]         = useState<Wilaya[]>([]);
  const [communes,        setCommunes]        = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('customerId');
      if (id) setFormData(p => ({ ...p, customerId: id }));
    }
  }, []);

  useEffect(() => {
    if (!formData.customerWelaya) { setCommunes([]); return; }
    setLoadingCommunes(true);
    fetchCommunes(formData.customerWelaya).then(data => { setCommunes(data); setLoadingCommunes(false); });
  }, [formData.customerWelaya]);

  const selectedWilayaData = useMemo(
    () => wilayas.find(w => String(w.id) === String(formData.customerWelaya)),
    [wilayas, formData.customerWelaya],
  );

  const getFinalPrice = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number);
    const offer = product.offers?.find(o => o.id === selectedOffer);
    if (offer) return offer.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find(v => variantMatches(v, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);

  const getPriceLivraison = useCallback((): number => {
    if (!selectedWilayaData) return 0;
    return formData.typeLivraison === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice;
  }, [selectedWilayaData, formData.typeLivraison]);

  useEffect(() => {
    if (selectedWilayaData) setFormData(f => ({ ...f, priceLoss: selectedWilayaData.livraisonReturn }));
  }, [selectedWilayaData, formData.typeLivraison]);

  const finalPrice    = getFinalPrice();
  const getTotalPrice = () => finalPrice * formData.quantity + getPriceLivraison();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.customerName.trim())  e.customerName    = 'الاسم مطلوب';
    if (!formData.customerPhone.trim()) e.customerPhone   = 'رقم الهاتف مطلوب';
    if (!formData.customerWelaya)       e.customerWelaya  = 'الولاية مطلوبة';
    if (!formData.customerCommune)      e.customerCommune = 'البلدية مطلوبة';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSubmitting(true);
    try {
      const payload = { ...formData, productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice, totalPrice: getTotalPrice(), priceLivraison: getPriceLivraison() };
      await axios.post(`${API_URL}/orders/create`, payload);
      if (typeof window !== 'undefined' && formData.customerId)
        localStorage.setItem('customerId', formData.customerId);
      router.push(`/lp/${domain}/successfully`);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  return (
    <div style={{ borderTop: '1px solid #0D1F2D', paddingTop: '1.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[9px] tracking-[0.25em] uppercase" style={{ color: '#00E5FF' }}>◈ نموذج_الطلب</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* الاسم + الهاتف */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerName} label="اسم_العميل">
            <div className="relative">
              <User className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#1A4A5A' }} />
              <input type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} placeholder="أدخل اسمك" className={`${inputCls(!!formErrors.customerName)} pr-10`} />
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerPhone} label="رقم_الهاتف">
            <div className="relative">
              <Phone className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#1A4A5A' }} />
              <input type="tel" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} placeholder="0X XX XX XX XX" className={`${inputCls(!!formErrors.customerPhone)} pr-10`} />
            </div>
          </FieldWrapper>
        </div>

        {/* الولاية + البلدية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerWelaya} label="اختيار_الولاية">
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#1A4A5A' }} />
              <select value={formData.customerWelaya} onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })} className={`${inputCls(!!formErrors.customerWelaya)} pr-10 appearance-none cursor-pointer`} style={{ backgroundColor: '#050B14' }}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: '#1A4A5A' }} />
            </div>
          </FieldWrapper>
          <FieldWrapper error={formErrors.customerCommune} label="اختيار_البلدية">
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#1A4A5A' }} />
              <select value={formData.customerCommune} disabled={!formData.customerWelaya || loadingCommunes} onChange={e => setFormData({ ...formData, customerCommune: e.target.value })} className={`${inputCls(!!formErrors.customerCommune)} pr-10 appearance-none cursor-pointer disabled:opacity-30`} style={{ backgroundColor: '#050B14' }}>
                <option value="">{loadingCommunes ? 'جاري_التحميل...' : formData.customerWelaya ? 'اختر البلدية' : 'اختر_الولاية_أولاً'}</option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: '#1A4A5A' }} />
            </div>
          </FieldWrapper>
        </div>

        {/* طريقة التوصيل */}
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: '#2A6A7A' }}>طريقة_التوصيل</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home', 'office'] as const).map(type => (
              <button key={type} type="button" onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))}
                className="flex flex-col items-center gap-2 py-5 transition-all duration-200"
                style={{ border: `1px solid ${formData.typeLivraison === type ? 'rgba(0,229,255,0.5)' : '#0D2030'}`, backgroundColor: formData.typeLivraison === type ? 'rgba(0,229,255,0.06)' : '#080F1A', boxShadow: formData.typeLivraison === type ? '0 0 15px rgba(0,229,255,0.08)' : 'none' }}
              >
                {type === 'home'
                  ? <HomeIcon  className="w-5 h-5" style={{ color: formData.typeLivraison === type ? '#00E5FF' : '#1A4A5A' }} />
                  : <Building2 className="w-5 h-5" style={{ color: formData.typeLivraison === type ? '#00E5FF' : '#1A4A5A' }} />
                }
                <p className="text-[10px] tracking-widest" style={{ color: formData.typeLivraison === type ? '#00E5FF' : '#2A5A6A' }}>
                  {type === 'home' ? 'توصيل_منزلي' : 'استلام_مكتبي'}
                </p>
                {selectedWilayaData && (
                  <p className="text-[9px] font-mono" style={{ color: formData.typeLivraison === type ? 'rgba(0,229,255,0.6)' : '#1A3A4A' }}>
                    {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} دج
                  </p>
                )}
              </button>
            ))}
          </div>
          {!selectedWilayaData && <p className="text-[10px] mt-2 text-center tracking-widest" style={{ color: '#1A3A4A' }}>// اختر_الولاية_لمعرفة_تكلفة_الشحن</p>}
        </div>

        {/* الكمية */}
        <FieldWrapper label="عدد_الوحدات">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} className="w-10 h-10 flex items-center justify-center text-xl transition-all" style={{ border: '1px solid #0D2030', color: '#00E5FF', backgroundColor: '#080F1A' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,229,255,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#080F1A'; }}
            >−</button>
            <span className="w-14 text-center font-bold" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", fontSize: '1.5rem' }}>{formData.quantity}</span>
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))} className="w-10 h-10 flex items-center justify-center text-xl transition-all" style={{ border: '1px solid #0D2030', color: '#00E5FF', backgroundColor: '#080F1A' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,229,255,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#080F1A'; }}
            >+</button>
            <span className="text-[10px] tracking-widest" style={{ color: '#1A4A5A' }}>وحدة</span>
          </div>
        </FieldWrapper>

        {/* ملخص الطلب */}
        <div className="p-5 relative" style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #00E5FF44, transparent)' }} />
          <p className="text-[9px] tracking-[0.2em] uppercase mb-4" style={{ color: '#2A5A6A' }}>ملخص_الطلب</p>
          <div className="space-y-2.5">
            {[
              { label: 'المنتج',      value: product.name },
              { label: 'سعر_الوحدة', value: `${finalPrice.toLocaleString('ar-DZ')} دج` },
              { label: 'الكمية',      value: `× ${formData.quantity}` },
              { label: 'الشحن',       value: selectedWilayaData ? `${getPriceLivraison().toLocaleString('ar-DZ')} دج` : 'سيتحدد' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-[10px] tracking-widest" style={{ color: '#2A5A6A' }}>{row.label}</span>
                <span className="text-[11px]" style={{ color: '#6A8A9A' }}>{row.value}</span>
              </div>
            ))}
            <div className="pt-3 mt-1" style={{ borderTop: '1px solid #0D2030' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] tracking-widest font-bold" style={{ color: '#00E5FF' }}>المبلغ_الإجمالي</span>
                <span className="font-black" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", fontSize: '1.6rem', textShadow: '0 0 15px rgba(0,229,255,0.3)' }}>
                  {getTotalPrice().toLocaleString('ar-DZ')}<span className="text-xs mr-1">دج</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* إرسال */}
        <button type="submit" disabled={submitting}
          className="w-full py-4 flex items-center justify-center gap-3 text-xs tracking-widest uppercase font-bold transition-all duration-300"
          style={{ backgroundColor: submitting ? '#1A4A5A' : '#00E5FF', color: '#020810', cursor: submitting ? 'not-allowed' : 'pointer' }}
          onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,229,255,0.4)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
        >
          {submitting
            ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />جاري_معالجة_الطلب...</>
            : <><Zap className="w-4 h-4" />تأكيد_الطلب</>
          }
        </button>

        <p className="text-[10px] text-center tracking-widest flex items-center justify-center gap-1.5" style={{ color: '#1A3A4A' }}>
          <Shield className="w-3 h-3" style={{ color: '#39FF14' }} />
          <span style={{ color: '#39FF14' }}>مشفر</span> | بروتوكول_معاملة_آمنة
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATIC PAGES
// ─────────────────────────────────────────────────────────────

interface StaticPageProps { page: string; }
interface CardProps       { icon: React.ReactNode; title: string; desc: string; status?: string; }

export function StaticPage({ page }: StaticPageProps) {
  const p = page.toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy />}
      {p === 'terms'   && <Terms />}
      {p === 'cookies' && <Cookies />}
      {p === 'contact' && <Contact />}
    </>
  );
}

function PageWrapper({ children, icon, title, subtitle, tag }: {
  children: React.ReactNode; icon: React.ReactNode; title: string; subtitle: string; tag: string;
}) {
  return (
    <div className="min-h-screen py-20" dir="rtl" style={{ backgroundColor: '#050B14', fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-8 text-[10px] tracking-widest" style={{ color: '#2A5A6A' }}>
            <span>النظام</span><span style={{ color: '#00E5FF' }}>/</span>
            <span>قانوني</span><span style={{ color: '#00E5FF' }}>/</span>
            <span style={{ color: '#00E5FF' }}>{tag}</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 mt-1" style={{ border: '1px solid rgba(0,229,255,0.3)', backgroundColor: 'rgba(0,229,255,0.04)', color: '#00E5FF' }}>{icon}</div>
            <div>
              <h1 className="mb-3 leading-tight" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 'clamp(1.4rem, 4vw, 2.5rem)', color: '#FFFFFF' }}>{title}</h1>
              <p className="text-sm leading-relaxed" style={{ color: '#3A6A7A' }}>// {subtitle}</p>
            </div>
          </div>
          <div className="mt-8 h-px" style={{ background: 'linear-gradient(90deg, #00E5FF44, transparent)' }} />
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, status }: CardProps) {
  const isActive = status === 'دائماً نشطة';
  return (
    <div className="group flex gap-5 p-6 mb-3 transition-all duration-300" style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,229,255,0.3)'; el.style.boxShadow = '0 0 20px rgba(0,229,255,0.05)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0D2030'; el.style.boxShadow = 'none'; }}
    >
      <div className="w-0.5 self-stretch flex-shrink-0" style={{ background: 'linear-gradient(180deg, #00E5FF, transparent)' }} />
      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ border: '1px solid #0D2030', color: '#00E5FF', backgroundColor: '#040C16' }}>{icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="text-sm font-medium" style={{ color: '#C8D8E8', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.05em' }}>{title}</h3>
          {status && (
            <span className="text-[9px] tracking-widest px-2.5 py-1 uppercase font-bold" style={{ backgroundColor: isActive ? 'rgba(57,255,20,0.08)' : 'rgba(0,229,255,0.04)', border: `1px solid ${isActive ? 'rgba(57,255,20,0.3)' : 'rgba(0,229,255,0.15)'}`, color: isActive ? '#39FF14' : '#00E5FF' }}>
              {status}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#3A6A7A' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper icon={<ShieldCheck size={20} />} title="سياسة الخصوصية" subtitle="في متجرنا، نضع خصوصية بياناتك وأمان معلوماتك على رأس أولوياتنا. إليك كيف نحمي معلوماتك." tag="الخصوصية">
      <InfoCard icon={<Database size={16} />} title="البيانات التي نجمعها"   desc="نجمع فقط البيانات الضرورية لتشغيل متجرك، مثل الاسم، البريد الإلكتروني، ومعلومات الطلبات لضمان تجربة بيع سلسة." />
      <InfoCard icon={<Eye size={16} />}      title="كيفية استخدام البيانات" desc="تُستخدم بياناتك لتحسين خدماتنا، ومعالجة الطلبات، وتوفير تقارير ذكية تساعدك في اتخاذ قرارات تجارية أفضل." />
      <InfoCard icon={<Lock size={16} />}     title="حماية المعلومات"         desc="نستخدم تقنيات تشفير متطورة ومعايير أمان عالمية لحماية بياناتك من أي وصول غير مصرح به." />
      <InfoCard icon={<Globe size={16} />}    title="مشاركة البيانات"          desc="نحن لا نبيع بياناتك أبداً. نشاركها فقط مع مزودي الخدمات الموثوقين لإتمام عملياتك التجارية." />
      <div className="mt-8 p-5 flex items-center justify-between" style={{ border: '1px solid rgba(57,255,20,0.15)', backgroundColor: 'rgba(57,255,20,0.03)' }}>
        <div className="flex items-center gap-3">
          <Bell size={14} style={{ color: '#39FF14' }} />
          <p className="text-xs" style={{ color: '#3A6A7A' }}>يتم تحديث هذه السياسة دورياً لضمان مواكبة أحدث معايير الأمان.</p>
        </div>
        <span className="text-[10px] tracking-widest flex-shrink-0 ml-6" style={{ color: '#1A4A5A' }}>تحديث: 06.02.2026</span>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper icon={<FileText size={20} />} title="شروط الاستخدام" subtitle="باستخدامك لمنصتنا، فإنك توافق على الالتزام بالشروط والقواعد التالية لضمان بيئة تجارية عادلة وآمنة." tag="الشروط">
      <InfoCard icon={<CheckCircle2 size={16} />} title="مسؤولية الحساب"     desc="أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تحدث تحته. يجب أن تكون المعلومات المقدمة دقيقة ومحدثة." />
      <InfoCard icon={<CreditCard size={16} />}   title="الرسوم والاشتراكات" desc="تخضع خدماتنا لرسوم اشتراك دورية. جميع الرسوم واضحة ولا توجد تكاليف مخفية، ويتم تحصيلها وفقاً للخطة التي تختارها." />
      <InfoCard icon={<Ban size={16} />}           title="المحتوى المحظور"    desc="يُمنع استخدام المنصة لبيع سلع غير قانونية أو انتهاك حقوق الملكية الفكرية. نحتفظ بالحق في إغلاق أي متجر يخالف هذه القوانين." />
      <InfoCard icon={<Scale size={16} />}         title="القانون المعمول به" desc="تخضع هذه الشروط وتفسر وفقاً للقوانين المحلية المعمول بها في الجزائر، وأي نزاع ينشأ يخضع للاختصاص القضائي للمحاكم المحلية." />
      <div className="mt-8 p-5 flex items-start gap-3" style={{ border: '1px solid rgba(255,150,0,0.2)', backgroundColor: 'rgba(255,150,0,0.03)' }}>
        <AlertCircle size={16} style={{ color: '#FF9500', flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: '#3A6A7A' }}>
          // نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرار استخدامك للمنصة بعد التعديلات يعد موافقة منك على الشروط الجديدة.
        </p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={20} />} title="سياسة ملفات تعريف الارتباط" subtitle="نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك، وتخصيص المحتوى، وتحليل حركة المرور على منصتنا." tag="الكوكيز">
      <InfoCard icon={<ShieldCheck size={16} />}   title="ملفات ضرورية"    desc="هذه الملفات مطلوبة لتشغيل الوظائف الأساسية للموقع مثل تسجيل الدخول وتأمين سلة التسوق. لا يمكن إيقافها." status="دائماً نشطة" />
      <InfoCard icon={<Settings size={16} />}      title="ملفات التفضيلات" desc="تسمح للموقع بتذكر خياراتك مثل اللغة التي تستخدمها حالياً ومنطقتك الزمنية." status="اختياري" />
      <InfoCard icon={<MousePointer2 size={16} />} title="ملفات التحليل"   desc="تساعدنا على فهم كيفية تفاعل الزوار مع المتجر، مما يسمح لنا بتطوير أدوات بيع أكثر كفاءة." status="اختياري" />
      <div className="mt-8 p-6 relative overflow-hidden" style={{ backgroundColor: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.2)' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)' }} />
        <div className="flex gap-4 items-start">
          <ToggleRight size={18} style={{ color: '#00E5FF', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 className="text-sm mb-2" style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}>كيف تتحكم في خياراتك؟</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#3A6A7A' }}>
              // يمكنك إدارة أو مسح ملفات تعريف الارتباط من خلال إعدادات متصفحك في أي وقت. يرجى العلم أن تعطيل بعضها قد يؤثر على تجربة استخدام المنصة.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export function Contact() {
  const store = {
    language: 'ar',
    design: { primaryColor: '#00E5FF', secondaryColor: '#39FF14' },
    contact: {
      email:    'support@teststore.com',
      phone:    '+213550123456',
      wilaya:   'الجزائر العاصمة',
      facebook: 'https://facebook.com',
      whatsapp: '213550123456',
      tiktok:   'https://tiktok.com',
    },
  };

  const [typedText, setTypedText] = useState('');
  const fullText = '> تواصل_معنا --init';

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, []);

  const contacts = [
    { icon: <Mail className="w-4 h-4" />,  label: 'البريد_الإلكتروني', value: store.contact.email,  href: `mailto:${store.contact.email}`, code: 'ب٠١' },
    { icon: <Phone className="w-4 h-4" />, label: 'خط_الهاتف',          value: store.contact.phone,  href: `tel:${store.contact.phone}`,    code: 'ه٠١' },
    { icon: <MapPin className="w-4 h-4" />,label: 'الموقع_الجغرافي',    value: store.contact.wilaya, href: undefined,                       code: 'م٠١' },
  ];

  const socials = [
    { name: 'فيسبوك',  href: store.contact.facebook,                   icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    { name: 'واتساب', href: `https://wa.me/${store.contact.whatsapp}`, icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> },
    { name: 'تيك_توك', href: store.contact.tiktok,                     icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.44-4.11-1.24-.03 2.15-.02 4.31-.02 6.46 0 1.19-.21 2.4-.78 3.46-.94 1.83-2.86 2.92-4.88 3.12-1.84.23-3.83-.24-5.26-1.48-1.57-1.32-2.3-3.43-1.95-5.44.25-1.58 1.15-3.05 2.51-3.9 1.14-.73 2.51-.99 3.84-.81v4.11c-.71-.12-1.47.05-2.05.5-.66.52-.96 1.4-.78 2.21.14.73.72 1.34 1.45 1.5.88.2 1.88-.16 2.37-.93.2-.34.28-.73.28-1.12V0l-.02.02z"/></svg> },
  ];

  return (
    <section className="min-h-screen py-20" dir="rtl" style={{ backgroundColor: '#050B14', fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-3xl mx-auto px-6">

        {/* رأس الطرفية */}
        <div className="mb-12 p-5" style={{ border: '1px solid #0D2030', backgroundColor: '#040C16' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF3B30' }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF9500' }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#39FF14' }} />
            <span className="ml-4 text-[10px] tracking-widest" style={{ color: '#2A5A6A' }}>طرفية_التواصل_v2.1</span>
          </div>
          <p className="text-sm" style={{ color: '#00E5FF' }}>{typedText}<span className="animate-pulse">▮</span></p>
          <p className="text-[11px] mt-2" style={{ color: '#1A4A5A' }}>// تهيئة قنوات التواصل...</p>
        </div>

        <div className="flex items-center gap-5 mb-10">
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#00E5FF' }}>◈ اتصل_بنا</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
        </div>

        {/* معلومات التواصل */}
        <div className="space-y-3 mb-12">
          {contacts.map(item => (
            <div key={item.code} className="group flex items-center justify-between p-5 transition-all duration-300 cursor-pointer"
              style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,229,255,0.4)'; el.style.backgroundColor = '#0A141F'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0D2030'; el.style.backgroundColor = '#080F1A'; }}
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 flex items-center justify-center" style={{ border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF' }}>{item.icon}</div>
                <div>
                  <p className="text-[9px] tracking-widest mb-0.5" style={{ color: '#2A5A6A' }}>{item.code}/ {item.label}</p>
                  <p className="text-sm font-medium group-hover:text-[#00E5FF] transition-colors" style={{ color: '#C8D8E8' }}>{item.value}</p>
                </div>
              </div>
              <span className="text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#00E5FF' }}>اتصل ←</span>
            </div>
          ))}
        </div>

        {/* منصات التواصل الاجتماعي */}
        <div>
          <p className="text-[10px] tracking-widest mb-5" style={{ color: '#2A5A6A' }}>// بروتوكولات_شبكة_التواصل_الاجتماعي</p>
          <div className="grid grid-cols-3 gap-3">
            {socials.map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer"
                className="flex flex-col items-center gap-3 py-6 transition-all duration-300"
                style={{ border: '1px solid #0D2030', backgroundColor: '#080F1A', color: '#4A7A8A' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(0,229,255,0.4)'; el.style.color = '#00E5FF'; el.style.boxShadow = '0 0 20px rgba(0,229,255,0.06)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0D2030'; el.style.color = '#4A7A8A'; el.style.boxShadow = 'none'; }}
              >
                {s.icon}
                <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: '#2A5A6A' }}>{s.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}