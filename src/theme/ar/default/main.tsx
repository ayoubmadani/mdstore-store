'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  ShoppingCart, MapPin, Phone, User,
  Home as HomeIcon, ChevronDown, Truck, Shield, Package,
  Building2, AlertCircle, Tag,
  Check, ChevronLeft, ChevronRight, FileText, Heart,
  Infinity, Link2, RefreshCw, Share2, Star, X,
  ShieldCheck, Eye, Lock, Database, Globe, Bell,
  CheckCircle2, Scale, CreditCard, Ban,
  Cookie as CookieIcon, Settings, MousePointer2, ToggleRight,
} from 'lucide-react';
import { Store } from '@/types/store';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap'); * { -webkit-font-smoothing: antialiased; }`;

function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some(e => e.attrName === attrName && e.value === val)
  );
}

const fetchWilayas = async (userId: string): Promise<Wilaya[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`); return data || []; }
  catch { return []; }
};

const fetchCommunes = async (wilayaId: string): Promise<Commune[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`); return data || []; }
  catch { return []; }
};

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────

export default function Main({ store, children }: any) {
  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      {store.topBar?.enabled && store.topBar?.text && (
        <div
          className="py-2 px-4 text-center text-xs tracking-[0.15em] uppercase font-medium"
          style={{ backgroundColor: store.topBar.color || '#1C1C1C', color: '#FAFAF8' }}
        >
          {store.topBar.text}
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
  const isRTL = store.language === 'ar';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { href: `/${store.subdomain}`,         label: isRTL ? 'الرئيسية'       : 'Home'    },
    { href: `/${store.subdomain}/contact`, label: isRTL ? 'اتصل بنا'       : 'Contact' },
    { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'سياسة الخصوصية' : 'Privacy' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 border-b border-[#E4E0DB] ${scrolled ? 'bg-[#FAFAF8]/95 backdrop-blur-md' : 'bg-[#FAFAF8]'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href={`/${store.subdomain}`} className="flex items-center gap-3 group">
            {store.design.logoUrl ? (
              <img src={store.design.logoUrl} alt={store.name} className="h-8 w-auto object-contain opacity-90" />
            ) : (
              <span
                className="text-xl tracking-widest uppercase text-[#1C1C1C] group-hover:opacity-70 transition-opacity duration-300"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, letterSpacing: '0.15em' }}
              >
                {store.name}
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[#5A5753] hover:text-[#1C1C1C] text-xs tracking-[0.12em] uppercase font-medium transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300 bg-[#1C1C1C]" />
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-6 bg-[#1C1C1C] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
            <span className={`block h-px w-6 bg-[#1C1C1C] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-[#1C1C1C] transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-400 ${isMenuOpen ? 'max-h-64 pb-6' : 'max-h-0'}`}>
          <div className="pt-4 border-t border-[#E4E0DB] flex flex-col gap-5">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-[#5A5753] hover:text-[#1C1C1C] text-xs tracking-[0.12em] uppercase font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
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
    <footer className="bg-[#1C1C1C] text-[#FAFAF8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/10">
          <div className="flex items-center gap-3">
            {store.design.logoUrl ? (
              <img src={store.design.logoUrl} alt={store.name} className="h-7 w-auto opacity-60 invert" />
            ) : (
              <span
                className="text-lg tracking-widest uppercase text-white/80"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, letterSpacing: '0.2em' }}
              >
                {store.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-8">
            {/* FIX — 'Cookise' corrigé en 'Cookies' */}
            {[
              { href: `/${store.subdomain}/Privacy`, label: 'Privacy' },
              { href: `/${store.subdomain}/Terms`,   label: 'Terms'   },
              { href: `/${store.subdomain}/Cookies`, label: 'Cookies' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/40 hover:text-white/80 text-xs tracking-[0.1em] uppercase transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs tracking-[0.08em]">
            © {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-white/20 text-xs tracking-wider">Minimalist Shop</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────

export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  return (
    <div
      className="group flex flex-col bg-[#FAFAF8] border border-[#E4E0DB] hover:border-[#1C1C1C] transition-all duration-500 overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#F0EDE8]">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs tracking-[0.15em] uppercase text-[#B0ABA5]">
              {isRTL ? 'لا توجد صورة' : 'No Image'}
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-[#1C1C1C] text-[#FAFAF8] text-[10px] tracking-[0.1em] uppercase px-2.5 py-1">
            −{discount}%
          </div>
        )}

        <div className="absolute inset-0 bg-[#1C1C1C]/0 group-hover:bg-[#1C1C1C]/10 transition-all duration-500" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className="text-[#1C1C1C] mb-1 line-clamp-1 tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 400 }}
        >
          {product.name}
        </h3>

        {product.desc && (
          <div
            className="text-xs text-[#8A8580] mb-4 line-clamp-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.desc }}
          />
        )}

        <div className="mt-auto space-y-4">
          <div className="flex items-baseline gap-2">
            <span
              className="text-[#1C1C1C] font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 300 }}
            >
              {product.price}
            </span>
            <span className="text-xs text-[#8A8580] tracking-wider">{store.currency}</span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="text-xs text-[#B0ABA5] line-through ml-1">{product.priceOriginal}</span>
            )}
          </div>

          <Link
            href={`/${store.subdomain}/product/${product.slug || product.id}`}
            className="block w-full py-3 text-center text-xs tracking-[0.18em] uppercase font-medium border border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-[#FAFAF8] transition-all duration-300"
          >
            {viewDetails}
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
  const isRTL = store.language === 'ar';
  const dir   = isRTL ? 'rtl' : 'ltr';

  const t = {
    categories:       isRTL ? 'التصنيفات'                    : 'Collections',
    noCategories:     isRTL ? 'لا توجد تصنيفات'              : 'No Collections',
    noCategoriesDesc: isRTL ? 'لم يتم إضافة أي تصنيفات بعد'  : 'No collections have been added yet',
    products:         isRTL ? 'المنتجات'                     : 'Products',
    noProducts:       isRTL ? 'لا توجد منتجات'               : 'No Products',
    noProductsDesc:   isRTL ? 'لم يتم إضافة أي منتجات بعد'   : 'No products have been added yet',
    viewDetails:      isRTL ? 'عرض التفاصيل'                 : 'View Details',
    all:              isRTL ? 'الكل'                          : 'All',
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]" dir={dir} style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <section
        className="relative flex items-end justify-start overflow-hidden"
        style={{
          minHeight:          '85vh',
          backgroundImage:    store.hero.imageUrl ? `url(${store.hero.imageUrl})` : 'none',
          backgroundColor:    !store.hero.imageUrl ? '#E8E4DF' : undefined,
          backgroundSize:     'cover',
          backgroundPosition: 'center',
        }}
      >
        {store.hero.imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/60 via-transparent to-transparent" />
        )}

        {(store.hero.title || store.hero.subtitle) ? (
          <div className="relative z-10 px-10 lg:px-16 pb-16 max-w-3xl">
            {store.hero.title && (
              <h1
                className="text-white mb-4 leading-tight"
                style={{
                  fontFamily:    "'Cormorant Garamond', serif",
                  fontSize:      'clamp(2.5rem, 6vw, 5rem)',
                  fontWeight:    300,
                  letterSpacing: '-0.01em',
                  textShadow:    '0 2px 20px rgba(0,0,0,0.2)',
                }}
              >
                {store.hero.title}
              </h1>
            )}
            {store.hero.subtitle && (
              <p className="text-white/75 text-sm tracking-[0.12em] uppercase font-light max-w-md">
                {store.hero.subtitle}
              </p>
            )}
          </div>
        ) : !store.hero.imageUrl && (
          <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '85vh' }}>
            <span
              className="text-[#B0ABA5] tracking-[0.3em] uppercase text-sm"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              {store.name}
            </span>
          </div>
        )}

        <div className="absolute bottom-8 right-10 flex flex-col items-center gap-2 opacity-50">
          <span className="text-white text-[9px] tracking-[0.2em] uppercase rotate-90 origin-center">scroll</span>
          <span className="block w-px h-8 bg-white/50" />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-6 mb-14">
            <span className="block h-px flex-1 max-w-[3rem] bg-[#E4E0DB]" />
            <h2 className="text-xs tracking-[0.25em] uppercase text-[#8A8580]">{t.categories}</h2>
            <span className="block h-px flex-1 bg-[#E4E0DB]" />
          </div>

          {store.categories && store.categories.length > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href={`/${store.subdomain}`}
                className="px-7 py-2.5 border border-[#1C1C1C] text-[#1C1C1C] text-xs tracking-[0.15em] uppercase hover:bg-[#1C1C1C] hover:text-[#FAFAF8] transition-all duration-300 font-medium"
              >
                {t.all}
              </Link>
              {store.categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/${store.subdomain}?category=${cat.id}`}
                  className="px-7 py-2.5 border border-[#E4E0DB] text-[#5A5753] text-xs tracking-[0.15em] uppercase hover:border-[#1C1C1C] hover:text-[#1C1C1C] transition-all duration-300 font-medium"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xs tracking-[0.2em] uppercase text-[#B0ABA5]">{t.noCategoriesDesc}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="pb-24 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-6 mb-14">
            <span className="block h-px flex-1 max-w-[3rem] bg-[#E4E0DB]" />
            <h2 className="text-xs tracking-[0.25em] uppercase text-[#8A8580]">{t.products}</h2>
            <span className="block h-px flex-1 bg-[#E4E0DB]" />
          </div>

          {store.products && store.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E4E0DB]">
              {store.products.map((product: any) => {
                const displayImage = product.productImage || product.imagesProduct?.[0]?.imageUrl || store.design?.logoUrl;
                const discount = product.priceOriginal
                  ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100)
                  : 0;
                return (
                  <Card
                    key={product.id}
                    product={product}
                    displayImage={displayImage}
                    discount={discount}
                    isRTL={isRTL}
                    store={store}
                    viewDetails={t.viewDetails}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-[#E4E0DB]">
              <p
                className="text-[#B0ABA5] mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 300 }}
              >
                {t.noProducts}
              </p>
              <p className="text-xs tracking-[0.15em] uppercase text-[#C8C3BC]">{t.noProductsDesc}</p>
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
  handleVariantSelection, domain,
}: any) {
  const [showShareToast, setShowShareToast] = useState(false);
  const [selectedImage,  setSelectedImage]  = useState(0);

  return (
    <div className="min-h-screen bg-[#FAFAF8]" dir="rtl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      {showShareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1C] text-[#FAFAF8] px-5 py-2.5 text-xs tracking-[0.1em] flex items-center gap-2 shadow-lg">
          <Link2 className="w-3.5 h-3.5" /> تم نسخ الرابط
        </div>
      )}

      {/* Breadcrumb */}
      <header className="border-b border-[#E4E0DB] bg-[#FAFAF8]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-[#B0ABA5] tracking-[0.1em]">
            <span className="hover:text-[#1C1C1C] cursor-pointer transition-colors uppercase">الرئيسية</span>
            <ChevronLeft className="w-3 h-3" />
            <span className="hover:text-[#1C1C1C] cursor-pointer transition-colors uppercase">المنتجات</span>
            <ChevronLeft className="w-3 h-3" />
            <span className="text-[#1C1C1C] truncate max-w-[160px]">{product.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleWishlist}
              className={`p-2 transition-all ${isWishlisted ? 'text-[#1C1C1C]' : 'text-[#B0ABA5] hover:text-[#1C1C1C]'}`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-2 text-[#B0ABA5] hover:text-[#1C1C1C] transition-all">
              <Share2 className="w-4 h-4" />
            </button>
            <div className={`text-[10px] tracking-[0.15em] uppercase px-3 py-1 ${inStock ? 'bg-[#1C1C1C] text-[#FAFAF8]' : 'border border-[#E4E0DB] text-[#8A8580]'}`}>
              {inStock ? 'متوفر' : 'نفد المخزون'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* ── Images ── */}
          <div className="space-y-3">
            <div className="relative overflow-hidden bg-[#F0EDE8] group" style={{ aspectRatio: '4/5' }}>
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-[#D8D3CD]" />
                </div>
              )}

              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-[#1C1C1C] text-[#FAFAF8] text-[10px] tracking-[0.1em] uppercase px-3 py-1.5">
                  −{discount}%
                </div>
              )}

              <button
                onClick={toggleWishlist}
                className={`absolute top-4 left-4 p-2.5 transition-all ${isWishlisted ? 'bg-[#1C1C1C] text-[#FAFAF8]' : 'bg-[#FAFAF8]/80 text-[#8A8580] hover:bg-[#FAFAF8]'}`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {!inStock && !autoGen && (
                <div className="absolute inset-0 bg-[#FAFAF8]/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-[#1C1C1C] text-[#FAFAF8] px-6 py-3 text-xs tracking-[0.15em] uppercase">
                    نفذت الكمية
                  </div>
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(p => p === 0 ? allImages.length - 1 : p - 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#FAFAF8]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#FAFAF8]"
                  >
                    <ChevronRight className="w-4 h-4 text-[#1C1C1C]" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(p => p === allImages.length - 1 ? 0 : p + 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#FAFAF8]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#FAFAF8]"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#1C1C1C]" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-16 h-20 overflow-hidden transition-all duration-200 border-2 ${selectedImage === idx ? 'border-[#1C1C1C]' : 'border-transparent opacity-50 hover:opacity-80'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info + Form ── */}
          <div className="space-y-8">

            <div>
              <h1
                className="text-[#1C1C1C] leading-tight mb-4"
                style={{
                  fontFamily:    "'Cormorant Garamond', serif",
                  fontSize:      'clamp(1.8rem, 4vw, 2.8rem)',
                  fontWeight:    300,
                  letterSpacing: '-0.01em',
                }}
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-[#1C1C1C] text-[#1C1C1C]' : 'fill-[#E4E0DB] text-[#E4E0DB]'}`} />
                  ))}
                </div>
                <span className="text-xs text-[#B0ABA5] tracking-wider">١٢٨ تقييم</span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-[#E4E0DB] py-6">
              <div className="flex items-baseline gap-4">
                <span
                  className="text-[#1C1C1C]"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 300 }}
                >
                  {finalPrice.toLocaleString('ar-DZ')}
                </span>
                <span className="text-sm text-[#8A8580] tracking-wider">دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <div>
                    <span className="text-sm text-[#B0ABA5] line-through">{parseFloat(product.priceOriginal).toLocaleString('ar-DZ')} دج</span>
                    <p className="text-xs text-[#8A8580] mt-0.5 tracking-wide">
                      وفّر {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString('ar-DZ')} دج
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className={`inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase px-3 py-1.5 ${autoGen ? 'bg-[#1C1C1C] text-[#FAFAF8]' : inStock ? 'bg-[#1C1C1C] text-[#FAFAF8]' : 'border border-[#E4E0DB] text-[#8A8580]'}`}>
              {autoGen ? <Infinity className="w-3.5 h-3.5" /> : inStock ? <span className="w-1.5 h-1.5 bg-current rounded-full" /> : <X className="w-3.5 h-3.5" />}
              {autoGen ? 'متوفر دائماً' : inStock ? 'متوفر' : 'غير متوفر'}
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8A8580] mb-4">العروض المتاحة</p>
                <div className="space-y-2">
                  {product.offers.map((offer: any) => (
                    <label
                      key={offer.id}
                      className={`flex items-center justify-between p-4 cursor-pointer transition-all border ${selectedOffer === offer.id ? 'border-[#1C1C1C] bg-[#1C1C1C] text-[#FAFAF8]' : 'border-[#E4E0DB] hover:border-[#1C1C1C]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ${selectedOffer === offer.id ? 'border-[#FAFAF8] bg-[#FAFAF8]' : 'border-[#1C1C1C]'}`}>
                          {selectedOffer === offer.id && <div className="w-2 h-2 bg-[#1C1C1C]" />}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                        <div>
                          <p className="text-sm font-medium">{offer.name}</p>
                          <p className={`text-xs ${selectedOffer === offer.id ? 'text-white/60' : 'text-[#8A8580]'}`}>{offer.quantity} قطع</p>
                        </div>
                      </div>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 300 }}>
                        {offer.price.toLocaleString('ar-DZ')} <span className="text-xs">دج</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id}>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8A8580] mb-4">{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div className="flex gap-3 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          title={v.name}
                          className={`w-8 h-8 transition-all ${isSel ? 'ring-2 ring-[#1C1C1C] ring-offset-2' : 'ring-1 ring-[#E4E0DB] hover:ring-[#1C1C1C]'}`}
                          style={{ backgroundColor: v.value }}
                        />
                      );
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          className={`w-16 h-16 overflow-hidden transition-all border-2 ${isSel ? 'border-[#1C1C1C]' : 'border-[#E4E0DB] opacity-70 hover:opacity-100 hover:border-[#1C1C1C]'}`}
                        >
                          <img src={v.value} alt={v.name} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          className={`px-5 py-2 text-xs tracking-[0.12em] uppercase font-medium border transition-all ${isSel ? 'border-[#1C1C1C] bg-[#1C1C1C] text-[#FAFAF8]' : 'border-[#E4E0DB] text-[#5A5753] hover:border-[#1C1C1C] hover:text-[#1C1C1C]'}`}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <ProductForm
              product={product}
              userId={product.store.userId}
              domain={domain}
              selectedOffer={selectedOffer}
              setSelectedOffer={setSelectedOffer}
              selectedVariants={selectedVariants}
            />
          </div>
        </div>

        {/* Description */}
        {product.desc && (
          <section className="mt-20 pt-14 border-t border-[#E4E0DB]">
            <div className="flex items-center gap-5 mb-8">
              <h2
                className="text-xs tracking-[0.2em] uppercase text-[#8A8580]"
              >
                وصف المنتج
              </h2>
            </div>
            <div
              className="text-sm leading-relaxed text-[#5A5753] font-light"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(product.desc, {
                  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span'],
                  ALLOWED_ATTR: ['class', 'style'],
                }),
              }}
            />
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
    {label && <label className="text-[10px] tracking-[0.2em] uppercase text-[#8A8580] font-medium">{label}</label>}
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const inputCls = (err?: boolean) =>
  `w-full px-4 py-3 text-sm outline-none transition-all bg-[#F5F2EE] text-[#1C1C1C] placeholder-[#B0ABA5] font-light
   border ${err ? 'border-red-400 focus:border-red-500' : 'border-[#E4E0DB] focus:border-[#1C1C1C]'}`;

export function ProductForm({
  product, userId, domain,
  selectedOffer, setSelectedOffer, selectedVariants,
  platform, priceLoss = 0,
}: ProductFormProps) {
  const router = useRouter();

  const [wilayas,         setWilayas]         = useState<Wilaya[]>([]);
  const [communes,        setCommunes]        = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [formData,        setFormData]        = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

  // FIX — SSR guard pour localStorage
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

  const getTotalPrice = useCallback(
    () => getFinalPrice() * formData.quantity + +getPriceLivraison(),
    [getFinalPrice, formData.quantity, getPriceLivraison],
  );

  const getVariantDetailId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;

    return product.variantDetails.find(v => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!formData.customerName.trim() || formData.customerName.length < 3)
      e.customerName  = 'الاسم الكامل مطلوب (3 أحرف على الأقل)';
    if (!/^(0|\+213)[5-7][0-9]{8}$/.test(formData.customerPhone.replace(/\s/g, '')))
      e.customerPhone = 'رقم هاتف جزائري صحيح مطلوب';
    if (!formData.customerWelaya)  e.customerWelaya  = 'اختر الولاية';
    if (!formData.customerCommune) e.customerCommune = 'اختر البلدية';
    if (formData.quantity < 1)     e.quantity        = 'الكمية يجب أن تكون 1 على الأقل';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
        productId:         product.id,
        variantDetailId:   getVariantDetailId(),
        domain,
        storeId: product.store.id,
        offerId:           selectedOffer ?? undefined,
        platform,
        quantity:          formData.quantity,
        totalPrice:        getTotalPrice(),
        typeShip:          formData.typeLivraison,
        priceShip:         getPriceLivraison(),
        priceLoss:         formData.priceLoss,
        customerId:        formData.customerId,
        customerName:      formData.customerName,
        customerPhone:     formData.customerPhone,
        customerWilayaId:  formData.customerWelaya,
        customerCommuneId: formData.customerCommune,
      }

      console.log({payload});
      
    try {
      const res = await axios.post(`${API_URL}/orders`, payload);
      if (res.status === 200 || res.status === 201) {
        if (typeof window !== 'undefined' && res.data?.customerId)
          localStorage.setItem('customerId', res.data.customerId);
        router.push(`/${domain}/successfully`);
      }
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  const finalPrice = getFinalPrice();

  return (
    <div className="border border-[#E4E0DB]">
      <div className="px-6 py-5 border-b border-[#E4E0DB] bg-[#F5F2EE]">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#5A5753]" />
          <p className="text-xs tracking-[0.15em] uppercase text-[#1C1C1C] font-medium">تأكيد الطلب</p>
        </div>
        <p className="text-xs text-[#8A8580] mt-1 font-light">سنتواصل معك خلال 24 ساعة لتأكيد طلبك</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerName} label="الاسم الكامل">
            <div className="relative">
              <User className="absolute right-3 top-3.5 w-4 h-4 text-[#B0ABA5]" />
              <input type="text" value={formData.customerName} placeholder="محمد أحمد"
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className={`${inputCls(!!formErrors.customerName)} pr-10`} />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerPhone} label="رقم الهاتف">
            <div className="relative">
              <Phone className="absolute right-3 top-3.5 w-4 h-4 text-[#B0ABA5]" />
              <input type="tel" dir="ltr" value={formData.customerPhone} placeholder="0550 123 456"
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                className={`${inputCls(!!formErrors.customerPhone)} pr-10 font-mono`} />
            </div>
          </FieldWrapper>
        </div>

        {/* Wilaya + Commune */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerWelaya} label="الولاية">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-4 h-4 text-[#B0ABA5]" />
              <select value={formData.customerWelaya}
                onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })}
                className={`${inputCls(!!formErrors.customerWelaya)} pr-10 appearance-none cursor-pointer`}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-[#B0ABA5] pointer-events-none" />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerCommune} label="البلدية">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-4 h-4 text-[#B0ABA5]" />
              <select value={formData.customerCommune}
                disabled={!formData.customerWelaya || loadingCommunes}
                onChange={e => setFormData({ ...formData, customerCommune: e.target.value })}
                className={`${inputCls(!!formErrors.customerCommune)} pr-10 appearance-none cursor-pointer disabled:opacity-40`}>
                <option value="">
                  {loadingCommunes ? 'جاري التحميل...' : formData.customerWelaya ? 'اختر البلدية' : 'اختر الولاية أولاً'}
                </option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-[#B0ABA5] pointer-events-none" />
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery type — FIX: HomeIcon au lieu de Home */}
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8A8580] mb-3">نوع التوصيل</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home', 'office'] as const).map(type => (
              <button
                key={type} type="button"
                onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))}
                className={`flex flex-col items-center gap-2 py-5 border transition-all duration-200 ${formData.typeLivraison === type ? 'border-[#1C1C1C] bg-[#1C1C1C] text-[#FAFAF8]' : 'border-[#E4E0DB] text-[#8A8580] hover:border-[#1C1C1C]'}`}
              >
                {type === 'home'
                  ? <HomeIcon   className="w-5 h-5" />
                  : <Building2  className="w-5 h-5" />
                }
                <p className="text-[10px] tracking-[0.12em] uppercase font-medium">
                  {type === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}
                </p>
                {selectedWilayaData && (
                  <p className={`text-xs ${formData.typeLivraison === type ? 'text-white/60' : 'text-[#B0ABA5]'}`}>
                    {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} دج
                  </p>
                )}
              </button>
            ))}
          </div>
          {!selectedWilayaData && (
            <p className="text-[10px] text-[#B0ABA5] mt-2 text-center tracking-wider">اختر الولاية لعرض تكلفة التوصيل</p>
          )}
        </div>

        {/* Quantity */}
        <FieldWrapper error={formErrors.quantity} label="الكمية">
          <div className="flex items-center gap-4">
            <button type="button"
              onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
              className="w-10 h-10 border border-[#E4E0DB] flex items-center justify-center text-[#5A5753] hover:border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-[#FAFAF8] transition-all font-light text-xl">
              −
            </button>
            <span
              className="w-12 text-center text-2xl text-[#1C1C1C]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              {formData.quantity}
            </span>
            <button type="button"
              onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
              className="w-10 h-10 border border-[#E4E0DB] flex items-center justify-center text-[#5A5753] hover:border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-[#FAFAF8] transition-all font-light text-xl">
              +
            </button>
            <span className="text-xs text-[#B0ABA5] tracking-wider uppercase">قطعة</span>
          </div>
        </FieldWrapper>

        {/* Summary */}
        <div className="bg-[#F5F2EE] p-5 space-y-3 text-xs border border-[#E4E0DB]">
          <div className="flex justify-between text-[#8A8580]">
            <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> المنتج</span>
            <span className="text-[#1C1C1C] font-medium truncate max-w-[50%]">{product.name}</span>
          </div>

          {selectedOffer && (() => {
            const offer = product.offers?.find(o => o.id === selectedOffer);
            if (!offer) return null;
            return (
              <div className="flex justify-between items-center text-[#8A8580]">
                <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> العرض</span>
                <span className="text-[#1C1C1C] font-medium tracking-wide">{offer.name}</span>
              </div>
            );
          })()}

          <div className="flex justify-between text-[#8A8580]">
            <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> التوصيل</span>
            <span className="text-[#1C1C1C]">
              {formData.typeLivraison === 'home' ? 'المنزل' : 'المكتب'}
              {selectedWilayaData && <span className="text-[#8A8580] mr-1">({getPriceLivraison().toLocaleString('ar-DZ')} دج)</span>}
            </span>
          </div>

          <div className="flex justify-between text-[#8A8580]">
            <span>سعر القطعة</span>
            <span className="text-[#1C1C1C] font-medium">{finalPrice.toLocaleString('ar-DZ')} دج</span>
          </div>
          <div className="flex justify-between text-[#8A8580]">
            <span>الكمية</span>
            <span className="text-[#1C1C1C] font-medium">× {formData.quantity}</span>
          </div>

          <div className="flex justify-between items-baseline pt-4 border-t border-[#E4E0DB]">
            <span className="text-xs tracking-[0.15em] uppercase text-[#1C1C1C] font-medium">الإجمالي</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: '#1C1C1C' }}>
              {getTotalPrice().toLocaleString('ar-DZ')}
              <span className="text-sm mr-1 text-[#8A8580]">دج</span>
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={submitting}
          className={`w-full py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all flex items-center justify-center gap-2 ${submitting ? 'bg-[#5A5753] text-[#FAFAF8] cursor-not-allowed' : 'bg-[#1C1C1C] text-[#FAFAF8] hover:bg-[#3A3A3A]'}`}
        >
          {submitting
            ? <><div className="w-4 h-4 border border-white/40 border-t-white rounded-full animate-spin" /> جاري الإرسال...</>
            : <><ShoppingCart className="w-4 h-4" /> تأكيد الطلب</>
          }
        </button>

        <p className="text-[10px] text-center text-[#B0ABA5] flex items-center justify-center gap-1.5 tracking-wider uppercase">
          <Shield className="w-3 h-3" /> بياناتك آمنة ومشفرة
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
      {/* FIX — 'cookise' corrigé en 'cookies' */}
      {p === 'cookies' && <Cookies />}
      {p === 'contact' && <Contact />}
    </>
  );
}

function PageWrapper({ children, icon, title, subtitle, tag }: {
  children: React.ReactNode; icon: React.ReactNode;
  title: string; subtitle: string; tag?: string;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] py-24" dir="rtl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="mb-16">
          <div className="flex items-center gap-5 mb-8">
            <span className="block h-px w-8 bg-[#E4E0DB]" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#B0ABA5]">{tag || 'Legal'}</span>
          </div>
          <h1
            className="text-[#1C1C1C] mb-5 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: '-0.01em' }}
          >
            {title}
          </h1>
          <p className="text-[#8A8580] text-sm leading-relaxed font-light max-w-xl">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, status }: CardProps) {
  const isActive = status === 'دائماً نشطة';
  return (
    <div className="border-t border-[#E4E0DB] py-7 flex gap-6 group hover:bg-[#F5F2EE] transition-colors duration-200 px-1">
      <div className="text-[#8A8580] mt-0.5 shrink-0 group-hover:text-[#1C1C1C] transition-colors">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h3
            className="text-[#1C1C1C] font-medium"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 400 }}
          >
            {title}
          </h3>
          {status && (
            <span className={`text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 shrink-0 ${isActive ? 'bg-[#1C1C1C] text-[#FAFAF8]' : 'border border-[#E4E0DB] text-[#8A8580]'}`}>
              {status}
            </span>
          )}
        </div>
        <p className="text-[#8A8580] text-sm leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper icon={<ShieldCheck size={18} />} title="سياسة الخصوصية" subtitle="في MdStore، نضع خصوصية بياناتك وأمان متجرك على رأس أولوياتنا." tag="Privacy">
      <div className="mb-2">
        <InfoCard icon={<Database size={16} />} title="البيانات التي نجمعها"   desc="نجمع فقط البيانات الضرورية لتشغيل متجرك، مثل الاسم، البريد الإلكتروني، ومعلومات الدفع." />
        <InfoCard icon={<Eye size={16} />}      title="كيفية استخدام البيانات" desc="تُستخدم بياناتك لتحسين خدماتنا، ومعالجة الطلبات، وتوفير تقارير ذكية." />
        <InfoCard icon={<Lock size={16} />}     title="حماية المعلومات"         desc="نستخدم تقنيات تشفير متطورة ومعايير أمان عالمية لحماية بياناتك من أي وصول غير مصرح به." />
        <InfoCard icon={<Globe size={16} />}    title="مشاركة البيانات"          desc="نحن لا نبيع بياناتك أبداً. نشاركها فقط مع مزودي الخدمات الموثوقين لإتمام عملياتك." />
      </div>
      <div className="mt-10 flex items-center justify-between py-5 border-t border-b border-[#E4E0DB]">
        <div className="flex items-center gap-3">
          <Bell size={14} className="text-[#B0ABA5]" />
          <span className="text-xs text-[#8A8580] tracking-wide">يتم تحديث هذه السياسة دورياً لمواكبة أحدث معايير الأمان.</span>
        </div>
        <span className="text-[10px] text-[#B0ABA5] tracking-[0.1em] shrink-0 mr-4">06/02/2026</span>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper icon={<FileText size={18} />} title="شروط الاستخدام" subtitle="باستخدامك لمنصة MdStore، فإنك توافق على الالتزام بالشروط والقواعد التالية." tag="Terms">
      <div className="mb-2">
        <InfoCard icon={<CheckCircle2 size={16} />} title="مسؤولية الحساب"     desc="أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تحدث تحته." />
        <InfoCard icon={<CreditCard size={16} />}   title="الرسوم والاشتراكات" desc="تخضع خدماتنا لرسوم اشتراك دورية. جميع الرسوم واضحة ولا توجد تكاليف مخفية." />
        <InfoCard icon={<Ban size={16} />}           title="المحتوى المحظور"    desc="يُمنع استخدام المنصة لبيع سلع غير قانونية أو انتهاك حقوق الملكية الفكرية." />
        <InfoCard icon={<Scale size={16} />}         title="القانون المعمول به" desc="تخضع هذه الشروط وفقاً للقوانين المحلية المعمول بها في الجزائر." />
      </div>
      <div className="mt-10 py-5 border-t border-b border-[#E4E0DB] flex items-start gap-3">
        <AlertCircle size={14} className="text-[#B0ABA5] shrink-0 mt-0.5" />
        <p className="text-xs text-[#8A8580] leading-relaxed font-light">
          نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرار استخدامك للمنصة يعد موافقة على الشروط الجديدة.
        </p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={18} />} title="سياسة ملفات تعريف الارتباط" subtitle="نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتخصيص المحتوى." tag="Cookies">
      <div className="mb-2">
        <InfoCard icon={<ShieldCheck size={16} />}   title="ملفات ضرورية"    desc="مطلوبة لتشغيل الوظائف الأساسية للموقع مثل تسجيل الدخول وتأمين سلة التسوق." status="دائماً نشطة" />
        <InfoCard icon={<Settings size={16} />}      title="ملفات التفضيلات" desc="تسمح للموقع بتذكر خياراتك مثل اللغة والمنطقة الزمنية." status="اختياري" />
        <InfoCard icon={<MousePointer2 size={16} />} title="ملفات التحليل"   desc="تساعدنا على فهم كيفية تفاعل التجار مع MdStore لتطوير أدوات أكثر كفاءة." status="اختياري" />
      </div>
      <div className="mt-10 bg-[#1C1C1C] p-8 flex gap-5 items-start">
        <ToggleRight size={18} className="text-white/50 shrink-0 mt-0.5" />
        <div>
          <h3
            className="text-white mb-2 font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 400 }}
          >
            كيف تتحكم في خياراتك؟
          </h3>
          <p className="text-white/50 text-sm leading-relaxed font-light">
            يمكنك إدارة أو مسح ملفات تعريف الارتباط من خلال إعدادات متصفحك في أي وقت.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

export function Contact() {
  const store = {
    language: 'ar',
    design: { primaryColor: '#1C1C1C', secondaryColor: '#5A5753' },
    contact: {
      email:    'support@teststore.com',
      phone:    '+213550123456',
      wilaya:   'الجزائر العاصمة',
      facebook: 'https://facebook.com',
      whatsapp: '213550123456',
      tiktok:   'https://tiktok.com',
    },
  };

  const isRTL = store.language === 'ar';

  return (
    <section className="min-h-screen bg-[#FAFAF8] py-24" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <div className="max-w-2xl mx-auto px-6">

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-5 mb-6">
            <span className="block h-px w-8 bg-[#E4E0DB]" />
            <span className="text-xs tracking-[0.25em] uppercase text-[#8A8580]">Contact</span>
          </div>
          <h1
            className="text-[#1C1C1C] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, letterSpacing: '-0.01em', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            {isRTL ? 'تواصل معنا' : 'Get in Touch'}
          </h1>
        </div>

        {/* Contact lines */}
        <div className="border-t border-[#E4E0DB]">
          {[
            { label: isRTL ? 'البريد الإلكتروني' : 'Email', value: store.contact.email, href: `mailto:${store.contact.email}` },
            { label: isRTL ? 'الهاتف' : 'Phone',             value: store.contact.phone,  href: `tel:${store.contact.phone}`,  dir: 'ltr' as const },
            { label: isRTL ? 'الموقع' : 'Location',          value: store.contact.wilaya, href: undefined },
          ].map((item, i) => (
            item.href ? (
              <a key={i} href={item.href} dir={item.dir}
                className="flex items-center justify-between py-6 border-b border-[#E4E0DB] group hover:bg-[#F5F2EE] transition-colors duration-200 px-1">
                <span className="text-xs tracking-[0.15em] uppercase text-[#8A8580] group-hover:text-[#1C1C1C] transition-colors">{item.label}</span>
                <span className="text-[#1C1C1C] text-sm font-light group-hover:opacity-70 transition-opacity">{item.value}</span>
              </a>
            ) : (
              <div key={i} className="flex items-center justify-between py-6 border-b border-[#E4E0DB] px-1">
                <span className="text-xs tracking-[0.15em] uppercase text-[#8A8580]">{item.label}</span>
                <span className="text-[#1C1C1C] text-sm font-light">{item.value}</span>
              </div>
            )
          ))}
        </div>

        {/* Socials */}
        <div className="mt-16">
          <p className="text-xs tracking-[0.2em] uppercase text-[#8A8580] mb-8">{isRTL ? 'تواصل معنا' : 'Follow Us'}</p>
          <div className="flex gap-4 flex-wrap">
            {[
              { name: 'Facebook', href: store.contact.facebook,              icon: <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
              { name: 'WhatsApp', href: `https://wa.me/${store.contact.whatsapp}`, icon: <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> },
              { name: 'TikTok',   href: store.contact.tiktok,               icon: <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.44-4.11-1.24-.03 2.15-.02 4.31-.02 6.46 0 1.19-.21 2.4-.78 3.46-.94 1.83-2.86 2.92-4.88 3.12-1.84.23-3.83-.24-5.26-1.48-1.57-1.32-2.3-3.43-1.95-5.44.25-1.58 1.15-3.05 2.51-3.9 1.14-.73 2.51-.99 3.84-.81v4.11c-.71-.12-1.47.05-2.05.5-.66.52-.96 1.4-.78 2.21.14.73.72 1.34 1.45 1.5.88.2 1.88-.16 2.37-.93.2-.34.28-.73.28-1.12V0l-.02.02z"/></svg> },
            ].map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 border border-[#E4E0DB] px-5 py-3 text-xs tracking-[0.12em] uppercase text-[#5A5753] hover:border-[#1C1C1C] hover:text-[#1C1C1C] transition-all duration-300">
                {s.icon}{s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}