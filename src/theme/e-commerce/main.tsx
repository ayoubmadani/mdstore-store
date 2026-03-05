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
    <div className="min-h-screen bg-gray-50 font-sans">
      {store.topBar?.enabled && store.topBar?.text && (
        <div
          className="py-2.5 px-4 text-center text-white text-sm font-medium"
          style={{ backgroundColor: store.topBar.color }}
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
  const isRTL = store.language === 'ar';

  const navItems = [
    { href: `/${store.subdomain}`,         label: isRTL ? 'الرئيسية'       : 'Home'    },
    { href: `/${store.subdomain}/contact`, label: isRTL ? 'اتصل بنا'       : 'Contact' },
    { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'سياسة الخصوصية' : 'Privacy' },
  ];

  const initials = store.name
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href={`/${store.subdomain}`} className="flex items-center gap-2 flex-shrink-0">
            {store.design.logoUrl ? (
              <img src={store.design.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <>
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-black text-sm tracking-wider shrink-0"
                  style={{ backgroundColor: store.design.primaryColor }}
                >
                  {initials}
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">{store.name}</span>
              </>
            )}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
              >
                {item.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full"
                  style={{ backgroundColor: store.design.primaryColor }}
                />
              </Link>
            ))}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────

export function Footer({ store }: any) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {store.design.logoUrl ? (
              <img src={store.design.logoUrl} alt="" className="h-8 w-auto opacity-80" />
            ) : (
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold">
                {store.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-lg">{store.name}</span>
          </div>

          <p className="text-gray-400 text-sm">© 2026 {store.name}. All rights reserved.</p>

          <div className="flex items-center gap-6">
            {/* FIX — 'Cookise' corrigé en 'Cookies' */}
            <a href={`/${store.subdomain}/Privacy`} className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
            <a href={`/${store.subdomain}/Terms`}   className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a>
            <a href={`/${store.subdomain}/Cookies`} className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</a>
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
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="h-64 relative overflow-hidden bg-gray-100">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
            <span className="text-sm font-medium">{isRTL ? 'لا توجد صورة' : 'No Image'}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 text-center flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-1 h-7">{product.name}</h3>

        {product.desc && (
          <div
            className="text-sm text-gray-500 mb-4 line-clamp-2 h-10 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.desc }}
          />
        )}

        <div className="mt-auto">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="text-xl font-black" style={{ color: store.design.primaryColor }}>
              {product.price} <span className="text-sm font-normal">{store.currency}</span>
            </span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="text-sm text-gray-400 line-through">{product.priceOriginal}</span>
            )}
          </div>
          <Link
            href={`/${store.subdomain}/product/${product.slug || product.id}`}
            className="block w-full py-3 px-4 rounded-xl text-white font-bold transition-all hover:opacity-90 hover:shadow-lg active:scale-95 text-center"
            style={{ backgroundColor: store.design.primaryColor }}
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

  const t = {
    categories:       isRTL ? 'التصنيفات'                    : 'Categories',
    noCategories:     isRTL ? 'لا توجد تصنيفات'              : 'No Categories',
    noCategoriesDesc: isRTL ? 'لم يتم إضافة أي تصنيفات بعد'  : 'No categories have been added yet',
    products:         isRTL ? 'المنتجات'                     : 'Products',
    noProducts:       isRTL ? 'لا توجد منتجات'               : 'No Products',
    noProductsDesc:   isRTL ? 'لم يتم إضافة أي منتجات بعد'   : 'No products have been added yet',
    viewDetails:      isRTL ? 'عرض التفاصيل'                 : 'View Details',
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir={store.language || 'rtl'}>

      {/* HERO */}
      <section
        className="relative h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:    store.hero.imageUrl ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${store.hero.imageUrl})` : 'none',
          backgroundColor:    !store.hero.imageUrl ? '#e5e7eb' : 'transparent',
          backgroundSize:     'cover',
          backgroundPosition: 'center',
        }}
      >
        {(store.hero.title || store.hero.subtitle) ? (
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            {store.hero.title && (
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight drop-shadow-lg">
                {store.hero.title}
              </h1>
            )}
            {store.hero.subtitle && (
              <p className="text-lg md:text-2xl opacity-95 font-light tracking-wide drop-shadow-md">
                {store.hero.subtitle}
              </p>
            )}
          </div>
        ) : !store.hero.imageUrl && (
          <span className="text-gray-400 text-2xl font-medium">Hero Section</span>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.categories}</h2>
            <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: store.design.primaryColor }} />
          </div>

          {store.categories && store.categories.length > 0 ? (
            <div className="flex gap-8 overflow-x-auto pb-8 pt-4 justify-start md:justify-center">
              <Link href={`/${store.domain}`} className="flex flex-col items-center min-w-[140px] cursor-pointer group">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-lg border-4 border-white">
                  <span className="text-4xl">🛍️</span>
                </div>
                <span className="text-base font-bold text-gray-700 text-center group-hover:text-indigo-600 transition-colors">All Products</span>
              </Link>

              {store.categories.map((cat: any) => (
                <Link href={`/${store.domain}?category=${cat.id}`} key={cat.id} className="flex flex-col items-center min-w-[140px] cursor-pointer group">
                  <div
                    className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-lg border-4 border-white"
                    style={{
                      backgroundImage:    cat.imageUrl ? `url(${cat.imageUrl})` : 'none',
                      backgroundSize:     'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!cat.imageUrl && (
                      <span className="text-3xl font-bold text-gray-300 uppercase">{cat.name?.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-base font-bold text-gray-700 text-center group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.noCategories}</h3>
              <p className="text-gray-500">{t.noCategoriesDesc}</p>
            </div>
          )}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.products}</h2>
            <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: store.design.primaryColor }} />
          </div>

          {store.products && store.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{t.noProducts}</h3>
              <p className="text-gray-500">{t.noProductsDesc}</p>
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
    <div className="min-h-screen bg-white" dir="rtl">

      {showShareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm">
          <Link2 className="w-4 h-4" /> تم نسخ الرابط!
        </div>
      )}

      {/* Top bar */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="hover:text-gray-700 cursor-pointer transition-colors">الرئيسية</span>
            <ChevronLeft className="w-3 h-3" />
            <span className="hover:text-gray-700 cursor-pointer transition-colors">المنتجات</span>
            <ChevronLeft className="w-3 h-3" />
            <span className="text-gray-800 font-medium truncate max-w-[160px]">{product.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleWishlist}
              className={`p-2 rounded-full transition-all ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {inStock ? 'متوفر' : 'نفد المخزون'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden group">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-gray-200" />
                </div>
              )}

              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  خصم {discount}%
                </div>
              )}

              <button
                onClick={toggleWishlist}
                className={`absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {!inStock && !autoGen && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2">
                    <Package className="w-5 h-5" /> نفذت الكمية
                  </div>
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(p => p === 0 ? allImages.length - 1 : p - 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(p => p === allImages.length - 1 ? 0 : p + 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
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
                    className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${selectedImage === idx ? 'border-gray-900 opacity-100 ring-2 ring-gray-200' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: <Truck className="w-5 h-5" />,    label: 'توصيل سريع',  sub: '24-48 ساعة' },
                { icon: <Shield className="w-5 h-5" />,   label: 'جودة مضمونة', sub: '100% أصلي'  },
                { icon: <RefreshCw className="w-5 h-5" />, label: 'استبدال سهل', sub: '7 أيام'     },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-2 py-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <span className="text-gray-700">{b.icon}</span>
                  <span className="text-xs font-bold text-gray-800">{b.label}</span>
                  <span className="text-[10px] text-gray-400">{b.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info + Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">(4.8) · ١٢٨ تقييم</span>
                <span className="text-xs text-green-600 font-medium">٨٦ تم شراؤه اليوم</span>
              </div>
            </div>

            <div className="flex items-baseline gap-4 bg-gray-50 p-4 rounded-2xl">
              <span className="text-4xl font-black text-gray-900 tracking-tight">
                {finalPrice.toLocaleString('ar-DZ')}
                <span className="text-lg font-semibold text-gray-400 mr-1">د.ج</span>
              </span>
              {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                <div className="flex flex-col">
                  <span className="text-lg text-gray-400 line-through">{parseFloat(product.priceOriginal).toLocaleString('ar-DZ')} د.ج</span>
                  <span className="text-xs text-red-500 font-bold">وفّر {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString('ar-DZ')} د.ج</span>
                </div>
              )}
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${autoGen ? 'bg-blue-50 text-blue-700 border-blue-200' : inStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {autoGen ? <Infinity className="w-4 h-4" /> : inStock ? <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> : <X className="w-4 h-4" />}
              {autoGen ? 'متوفر دائماً' : inStock ? 'متوفر في المخزون' : 'غير متوفر حالياً'}
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-800" /> العروض المتاحة
                </p>
                <div className="space-y-2">
                  {product.offers.map((offer: any) => (
                    <label
                      key={offer.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedOffer === offer.id ? 'border-gray-900 bg-white shadow-sm' : 'border-amber-200/50 bg-white/50 hover:border-amber-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedOffer === offer.id ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                          {selectedOffer === offer.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{offer.name}</p>
                          <p className="text-xs text-gray-500">{offer.quantity} قطع في العرض</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-lg font-black text-gray-900">{offer.price.toLocaleString('ar-DZ')}</span>
                        <span className="text-xs text-gray-500 mr-1">د.ج</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{attr.name}</p>
                {attr.displayMode === 'color' ? (
                  <div className="flex gap-3 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          title={v.name}
                          className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${isSel ? 'ring-2 ring-gray-900 ring-offset-2 scale-110 border-gray-900' : 'border-gray-200 hover:scale-105'}`}
                          style={{ backgroundColor: v.value }}
                        />
                      );
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div className="flex gap-3 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${isSel ? 'border-gray-900 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-300'}`}
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
                          className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${isSel ? 'border-gray-900 bg-gray-900 text-white shadow-lg' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}
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
          <section className="mt-16 pt-12 border-t border-gray-100">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" /> وصف المنتج
              </h2>
              <div
                className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.desc, {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span'],
                    ALLOWED_ATTR: ['class', 'style'],
                  }),
                }}
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
    {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
    {children}
    {error && (
      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const inputCls = (err?: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400
   ${err
    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
    : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'}`;

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
    () => getFinalPrice() * formData.quantity + getPriceLivraison(),
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
      e.customerPhone = 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)';
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
    try {
      const res = await axios.post(`${API_URL}/orders`, {
        productId:         product.id,
        variantDetailId:   getVariantDetailId(),
        domain,
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
      });
      if (res.status === 200 || res.status === 201) {
        if (typeof window !== 'undefined' && res.data?.customerId)
          localStorage.setItem('customerId', res.data.customerId);
        router.push(`/successfully`);
      }
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  const finalPrice = getFinalPrice();

  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl shadow-gray-900/5">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <p className="font-bold text-gray-900">أدخل بيانات التسليم</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">سنتواصل معك خلال 24 ساعة لتأكيد طلبك</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerName} label="الاسم الكامل">
            <div className="relative">
              <User className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
              <input type="text" value={formData.customerName} placeholder="محمد أحمد"
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className={`${inputCls(!!formErrors.customerName)} pr-10`} />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerPhone} label="رقم الهاتف">
            <div className="relative">
              <Phone className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
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
              <MapPin className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
              <select value={formData.customerWelaya}
                onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })}
                className={`${inputCls(!!formErrors.customerWelaya)} pr-10 appearance-none cursor-pointer`}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerCommune} label="البلدية">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
              <select value={formData.customerCommune}
                disabled={!formData.customerWelaya || loadingCommunes}
                onChange={e => setFormData({ ...formData, customerCommune: e.target.value })}
                className={`${inputCls(!!formErrors.customerCommune)} pr-10 appearance-none cursor-pointer disabled:opacity-50`}>
                <option value="">
                  {loadingCommunes ? 'جاري التحميل...' : formData.customerWelaya ? 'اختر البلدية' : 'اختر الولاية أولاً'}
                </option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery type — FIX: HomeIcon utilisé au lieu de Home */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">نوع التوصيل</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home', 'office'] as const).map(type => (
              <button
                key={type} type="button"
                onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${formData.typeLivraison === type ? 'border-gray-900 bg-gray-900 text-white shadow-lg' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
              >
                {type === 'home'
                  ? <HomeIcon   className={`w-6 h-6 ${formData.typeLivraison === type ? 'text-white' : 'text-gray-400'}`} />
                  : <Building2  className={`w-6 h-6 ${formData.typeLivraison === type ? 'text-white' : 'text-gray-400'}`} />
                }
                <div className="text-center">
                  <p className="text-sm font-bold">{type === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}</p>
                  {selectedWilayaData && (
                    <p className={`text-xs mt-0.5 ${formData.typeLivraison === type ? 'text-gray-300' : 'text-gray-400'}`}>
                      {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} د.ج
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
          {!selectedWilayaData && (
            <p className="text-xs text-gray-400 mt-2 text-center">اختر الولاية لعرض تكلفة التوصيل</p>
          )}
        </div>

        {/* Quantity */}
        <FieldWrapper error={formErrors.quantity} label="الكمية">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
              className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all font-bold text-xl active:scale-95">−</button>
            <span className="w-16 text-center text-2xl font-black text-gray-900">{formData.quantity}</span>
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
              className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all font-bold text-xl active:scale-95">+</button>
            <span className="text-sm text-gray-400 font-medium">قطعة</span>
          </div>
        </FieldWrapper>

        {/* Summary */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-sm border border-gray-100">
          <div className="flex justify-between text-gray-600">
            <span className="flex items-center gap-1"><Package className="w-4 h-4" /> المنتج</span>
            <span className="text-gray-900 font-bold truncate max-w-[50%]">{product.name}</span>
          </div>

          {selectedOffer && (() => {
            const offer = product.offers?.find(o => o.id === selectedOffer);
            if (!offer) return null;
            return (
              <div className="flex justify-between items-center text-gray-600">
                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-amber-500" /> العرض</span>
                <span className="text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg text-xs border border-amber-100">{offer.name}</span>
              </div>
            );
          })()}

          <div className="flex justify-between text-gray-600">
            <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> التوصيل</span>
            <span className="text-gray-900 font-medium">
              {formData.typeLivraison === 'home' ? 'المنزل' : 'المكتب'}
              {selectedWilayaData && <span className="text-gray-500 mr-1">({getPriceLivraison().toLocaleString('ar-DZ')} د.ج)</span>}
            </span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>سعر القطعة</span>
            <span className="text-gray-900 font-bold">{finalPrice.toLocaleString('ar-DZ')} د.ج</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>الكمية</span>
            <span className="text-gray-900 font-bold">× {formData.quantity}</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-gray-200">
            <span className="font-bold text-gray-900 text-base">الإجمالي الكلي</span>
            <span className="text-2xl font-black text-gray-900">
              {getTotalPrice().toLocaleString('ar-DZ')}
              <span className="text-sm font-bold text-gray-500 mr-1">د.ج</span>
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={submitting}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${submitting ? 'bg-gray-900 text-white opacity-90 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'}`}
        >
          {submitting
            ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري إرسال الطلب...</>
            : <><ShoppingCart className="w-5 h-5" />تأكيد الطلب الآن</>
          }
        </button>

        <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" /> بياناتك آمنة ومشفرة 100%
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

export function PageWrapper({ children, icon, title, subtitle, accentColor = '#6366f1' }: {
  children: React.ReactNode; icon: React.ReactNode;
  title: string; subtitle: string; accentColor?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f8f8f6] transition-colors duration-300" dir="rtl">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-20">
        <div className="mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 shadow-sm" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
            {icon}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">{title}</h1>
          <div className="w-12 h-1 rounded-full mb-5" style={{ backgroundColor: accentColor }} />
          <p className="text-gray-500 text-base md:text-lg max-w-2xl leading-relaxed">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, status }: CardProps) {
  const isActive = status === 'دائماً نشطة';
  return (
    <div className="bg-white border border-gray-100 rounded-[1.75rem] p-6 md:p-8 flex flex-col sm:flex-row gap-5 items-start hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base md:text-lg font-black text-gray-900">{title}</h3>
          {status && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shrink-0 ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
              {status}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm md:text-base leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper icon={<ShieldCheck size={28} />} title="سياسة الخصوصية" subtitle="في MdStore، نضع خصوصية بياناتك وأمان متجرك على رأس أولوياتنا.">
      <div className="grid gap-5">
        <InfoCard icon={<Database size={22} className="text-blue-500" />}   title="البيانات التي نجمعها"   desc="نجمع فقط البيانات الضرورية لتشغيل متجرك، مثل الاسم، البريد الإلكتروني، ومعلومات الدفع لضمان تجربة بيع سلسة." />
        <InfoCard icon={<Eye size={22} className="text-purple-500" />}       title="كيفية استخدام البيانات" desc="تُستخدم بياناتك لتحسين خدماتنا، ومعالجة الطلبات، وتوفير تقارير ذكية تساعدك في اتخاذ قرارات تجارية أفضل." />
        <InfoCard icon={<Lock size={22} className="text-emerald-500" />}     title="حماية المعلومات"         desc="نستخدم تقنيات تشفير متطورة ومعايير أمان عالمية لحماية بياناتك من أي وصول غير مصرح به." />
        <InfoCard icon={<Globe size={22} className="text-indigo-500" />}     title="مشاركة البيانات"          desc="نحن لا نبيع بياناتك أبداً. نشاركها فقط مع مزودي الخدمات الموثوقين لإتمام عملياتك التجارية." />
      </div>
      <div className="mt-10 p-6 bg-white rounded-[1.75rem] border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
            <Bell size={18} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">نقوم بتحديث هذه السياسة دورياً لضمان مواكبة أحدث معايير الأمان.</p>
        </div>
        <span className="text-xs text-gray-400 font-medium shrink-0">آخر تحديث: 06/02/2026</span>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper icon={<FileText size={28} />} title="شروط الاستخدام" subtitle="باستخدامك لمنصة MdStore، فإنك توافق على الالتزام بالشروط والقواعد التالية." accentColor="#8b5cf6">
      <div className="grid gap-5">
        <InfoCard icon={<CheckCircle2 size={22} className="text-emerald-500" />} title="مسؤولية الحساب"     desc="أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تحدث تحته." />
        <InfoCard icon={<CreditCard size={22} className="text-blue-500" />}      title="الرسوم والاشتراكات" desc="تخضع خدماتنا لرسوم اشتراك دورية. جميع الرسوم واضحة ولا توجد تكاليف مخفية." />
        <InfoCard icon={<Ban size={22} className="text-rose-500" />}             title="المحتوى المحظور"    desc="يُمنع استخدام المنصة لبيع سلع غير قانونية أو انتهاك حقوق الملكية الفكرية." />
        <InfoCard icon={<Scale size={22} className="text-violet-500" />}         title="القانون المعمول به" desc="تخضع هذه الشروط وفقاً للقوانين المحلية المعمول بها في الجزائر." />
      </div>
      <div className="mt-10 p-5 bg-amber-50 rounded-[1.75rem] border border-amber-100 flex gap-4 items-start">
        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرار استخدامك للمنصة يعد موافقة على الشروط الجديدة.</p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={28} />} title="سياسة ملفات تعريف الارتباط" subtitle="نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتخصيص المحتوى." accentColor="#f59e0b">
      <div className="grid gap-5">
        <InfoCard icon={<ShieldCheck size={22} className="text-indigo-500" />}   title="ملفات ضرورية"    desc="مطلوبة لتشغيل الوظائف الأساسية للموقع مثل تسجيل الدخول وتأمين سلة التسوق." status="دائماً نشطة" />
        <InfoCard icon={<Settings size={22} className="text-purple-500" />}      title="ملفات التفضيلات" desc="تسمح للموقع بتذكر خياراتك مثل اللغة والمنطقة الزمنية." status="اختياري" />
        <InfoCard icon={<MousePointer2 size={22} className="text-blue-500" />}   title="ملفات التحليل"   desc="تساعدنا على فهم كيفية تفاعل التجار مع MdStore لتطوير أدوات أكثر كفاءة." status="اختياري" />
      </div>
      <div className="mt-10 p-7 bg-amber-500 rounded-[1.75rem] text-white relative overflow-hidden shadow-lg shadow-amber-500/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
            <ToggleRight size={24} />
          </div>
          <div>
            <h3 className="text-base font-black mb-1">كيف تتحكم في خياراتك؟</h3>
            <p className="text-amber-50/90 text-sm leading-relaxed">يمكنك إدارة أو مسح ملفات تعريف الارتباط من خلال إعدادات متصفحك في أي وقت.</p>
          </div>
        </div>
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </PageWrapper>
  );
}

export function Contact() {
  const store = {
    language: 'ar',
    design: { primaryColor: '#4F46E5', secondaryColor: '#10B981' },
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
    <section className="py-20 bg-gray-50 min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{isRTL ? 'اتصل بنا' : 'Contact Us'}</h2>
          <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: store.design.primaryColor }} />
        </div>

        <div className="grid gap-6">
          {[
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
              label: isRTL ? 'البريد الإلكتروني' : 'Email',
              value: store.contact.email,
              href: `mailto:${store.contact.email}`,
            },
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
              label: isRTL ? 'الهاتف' : 'Phone',
              value: store.contact.phone,
              href: `tel:${store.contact.phone}`,
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-5 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: store.design.secondaryColor }}>
                {item.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">{item.label}</p>
                <a href={item.href} className="text-lg font-bold text-gray-900 hover:underline">{item.value}</a>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { name: 'Facebook', href: store.contact.facebook, color: '#1877F2', icon: <svg className="w-6 h-6 fill-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
              { name: 'WhatsApp', href: `https://wa.me/${store.contact.whatsapp}`, color: '#25D366', icon: <svg className="w-6 h-6 fill-[#25D366]" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> },
              { name: 'TikTok',   href: store.contact.tiktok,   color: '#000000', icon: <svg className="w-6 h-6 fill-black" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.44-4.11-1.24-.03 2.15-.02 4.31-.02 6.46 0 1.19-.21 2.4-.78 3.46-.94 1.83-2.86 2.92-4.88 3.12-1.84.23-3.83-.24-5.26-1.48-1.57-1.32-2.3-3.43-1.95-5.44.25-1.58 1.15-3.05 2.51-3.9 1.14-.73 2.51-.99 3.84-.81v4.11c-.71-.12-1.47.05-2.05.5-.66.52-.96 1.4-.78 2.21.14.73.72 1.34 1.45 1.5.88.2 1.88-.16 2.37-.93.2-.34.28-.73.28-1.12V0l-.02.02z"/></svg> },
            ].map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-3 p-4 bg-white rounded-2xl border-2 border-transparent hover:shadow-md transition-all">
                {s.icon}
                <span className="font-bold text-gray-700">{s.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}