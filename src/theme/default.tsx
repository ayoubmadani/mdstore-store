'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  ShoppingCart, MapPin, Phone, Mail, User,
  ChevronDown, Truck, Package, AlertCircle,
  Check, ChevronLeft, Home as HomeIcon, Building2,
  Shield, X, Menu, Minus, Plus, Trash2, Loader2,
} from 'lucide-react';
import { Store } from '@/types/store';
import { useCartStore } from '@/store/useCartStore';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface Offer               { id: string; name: string; quantity: number; price: number; subTitle?: string; shippingFree?: boolean; }
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
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; shippingFree?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
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
  store?:           any;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const S: Record<string, React.CSSProperties> = {
  body:      { fontFamily: 'system-ui, -apple-system, Arial, sans-serif', color: '#111', background: '#fff' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '0 1rem' },
  hr:        { border: 'none', borderTop: '1px solid #e5e5e5', margin: '0' },
  inputBase: {
    width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ccc',
    borderRadius: 4, fontSize: '0.9rem', fontFamily: 'inherit',
    outline: 'none', background: '#fff', color: '#111', boxSizing: 'border-box' as const,
  },
  btnBlack: {
    background: '#111', color: '#fff', border: 'none', borderRadius: 4,
    padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: 'inherit',
  },
  btnOutline: {
    background: '#fff', color: '#111', border: '1px solid #ccc', borderRadius: 4,
    padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: 'inherit',
  },
  label: { display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4, color: '#444' },
  error: { fontSize: '0.75rem', color: '#c00', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 },
};

function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some(e => e.attrName === attrName && e.value === val)
  );
}

const fetchWilayas  = async (uid: string): Promise<Wilaya[]>  => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

const FR = ({ label, error, children }: { label?: string; error?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '0.85rem' }}>
    {label && <label style={S.label}>{label}</label>}
    {children}
    {error && <p style={S.error}><AlertCircle size={12} />{error}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────


// ─── Translations ─────────────────────────────────────────────────────────────
const jsonAr = {
  dir: 'rtl',
  // Navbar
  home: 'الرئيسية',
  contact: 'اتصل بنا',
  cart: 'السلة',
  search: 'ابحث...',
  searching: 'جاري البحث...',
  noResults: 'لا توجد نتائج',
  showAll: 'عرض كل النتائج →',
  // Home
  all: 'الكل',
  noProducts: 'لا توجد منتجات متاحة حالياً',
  shopNow: 'تسوق الآن',
  searchResultsFor: 'نتائج البحث عن:',
  // Form
  fullName: 'الاسم الكامل',
  fullNamePh: 'أدخل اسمك',
  errName: 'الاسم مطلوب',
  phone: 'رقم الهاتف',
  phonePh: '05xxxxxxxx',
  errPhone: 'رقم الهاتف مطلوب',
  errPhoneInvalid: 'رقم هاتف غير صالح',
  wilaya: 'الولاية',
  errWilaya: 'الولاية مطلوبة',
  wilayaPh: 'اختر الولاية',
  wilayaNA: 'التوصيل غير متاح حالياً',
  commune: 'البلدية',
  errCommune: 'البلدية مطلوبة',
  communePh: 'اختر البلدية',
  communeLoading: 'جاري التحميل...',
  deliveryType: 'نوع التوصيل',
  deliveryHome: 'توصيل للمنزل',
  deliveryOffice: 'مكتب بريد',
  qty: 'الكمية',
  price: 'السعر',
  delivery: 'التوصيل',
  total: 'الإجمالي',
  subtotal: 'المجموع الفرعي',
  orderInfo: 'معلومات الطلب',
  addToCart: 'أضف إلى السلة',
  orderNow: 'اطلب الآن',
  confirmOrder: 'تأكيد الطلب',
  sending: 'جاري الإرسال...',
  back: 'رجوع',
  addedMsg: 'تمت الإضافة إلى السلة بنجاح!',
  errSubmit: 'حدث خطأ أثناء إرسال الطلب',
  // Cart & Success
  myCart: 'السلة',
  cartEmpty: 'السلة فارغة',
  cartEmptyDesc: 'لم تقم بإضافة أي منتجات بعد',
  successTitle: 'تم إرسال طلبك بنجاح!',
  successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل',
  backToShop: 'العودة للتسوق',
  checkoutTitle: 'إتمام الطلب',
  // Product
  offersTitle: 'العروض المتاحة',
  descTitle: 'الوصف',
  // Footer
  quickLinks: 'روابط سريعة', legalNav: 'قانوني',
  contactSect: 'تواصل معنا',
  privacy: 'الخصوصية',
  terms: 'الشروط',
  rightsReserved: 'جميع الحقوق محفوظة',
};

const jsonFr = {
  dir: 'ltr',
  // Navbar
  home: 'Accueil',
  contact: 'Contact',
  cart: 'Panier',
  search: 'Rechercher un produit...',
  searching: 'Recherche...',
  noResults: 'Aucun résultat',
  showAll: 'Voir tous les résultats',
  // Home
  all: 'Tout',
  noProducts: 'Aucun produit disponible pour le moment.',
  shopNow: 'Voir la boutique',
  searchResultsFor: 'Résultats pour :',
  // Form
  fullName: 'Nom complet',
  fullNamePh: 'Votre nom',
  errName: 'Le nom est requis',
  phone: 'Téléphone',
  phonePh: '0555 12 34 56',
  errPhone: 'Le numéro de téléphone est requis',
  errPhoneInvalid: 'Numéro de téléphone invalide',
  wilaya: 'Wilaya',
  errWilaya: 'Sélectionnez une wilaya',
  wilayaPh: 'Choisir la wilaya',
  wilayaNA: 'Livraison indisponible pour le moment',
  commune: 'Commune',
  errCommune: 'Sélectionnez une commune',
  communePh: 'Choisir la commune',
  communeLoading: 'Chargement...',
  deliveryType: 'Type de livraison',
  deliveryHome: 'À domicile',
  deliveryOffice: 'Point relais',
  qty: 'Quantité',
  price: 'Prix',
  delivery: 'Livraison',
  total: 'Total',
  subtotal: 'Sous-total',
  orderInfo: 'Informations de commande',
  addToCart: 'Ajouter au panier',
  orderNow: 'Commander maintenant',
  confirmOrder: 'Confirmer la commande',
  sending: 'Envoi en cours...',
  back: 'Annuler',
  addedMsg: 'Ajouté au panier ✓',
  errSubmit: 'Une erreur est survenue, veuillez réessayer.',
  // Cart & Success
  myCart: 'Mon Panier',
  cartEmpty: 'Votre panier est vide',
  cartEmptyDesc: 'Découvrez notre sélection.',
  successTitle: 'Commande confirmée',
  successDesc: 'Merci pour votre commande, notre équipe vous contactera bientôt.',
  backToShop: 'Retour à la boutique',
  checkoutTitle: 'Finaliser la commande',
  // Product
  offersTitle: 'Offres groupées',
  descTitle: 'Description',
  // Footer
  quickLinks: 'Navigation', legalNav: 'Légal',
  contactSect: 'Contact',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  rightsReserved: 'Tous droits réservés.',
};

export default function Main({ store, children }: any) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const isRTL = (store?.language || 'ar') === 'ar';
  return (
    <div style={{ ...S.body, minHeight: '100vh', display: 'flex', flexDirection: 'column' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {store.topBar?.enabled && store.topBar?.text && (
        <div style={{ background: store.topBar.color || '#111', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: '0.8rem' }}>
          {store.topBar.text}
        </div>
      )}
      <Navbar store={store} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────

export function Navbar({ store }: { store: Store }) {
  const [open, setOpen] = useState(false);
  const isRTL = (store?.language || 'ar') === 'ar';
  const itemsCartCount = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { initCount(JSON.parse(localStorage.getItem(store.subdomain) || '[]').length || 0); } catch { initCount(0); }
    }
  }, [store.subdomain, initCount]);

  const links = [
    { href: '/',        label: isRTL ? 'الرئيسية'       : 'Home'    },
    { href: '/contact', label: isRTL ? 'تواصل معنا'      : 'Contact' },
  ];

  return (
    <nav style={{ borderBottom: '1px solid #e5e5e5', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ ...S.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: '1rem', color: '#111', textDecoration: 'none' }}>
          {store.design?.logoUrl && store.design.logoUrl !== '/default-logo.png'
            ? <img src={store.design.logoUrl} alt={store.name} style={{ height: 32, display: 'block' }} />
            : store.name}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'none' }} className="desk-nav">
            {links.map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: '0.85rem', color: '#444', textDecoration: 'none', fontWeight: 500 }}>{l.label}</Link>
            ))}
          </div>

          {store?.cart !== false && (
            <Link href="/cart" style={{ position: 'relative', color: '#111', textDecoration: 'none' }}>
              <ShoppingCart size={20} />
              {itemsCartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -8, background: '#111', color: '#fff', fontSize: 9, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {itemsCartCount}
                </span>
              )}
            </Link>
          )}

          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#111' }} className="mob-btn">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #e5e5e5', padding: '1rem', background: '#fff' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '0.6rem 0', fontSize: '0.9rem', color: '#111', textDecoration: 'none', borderBottom: '1px solid #f0f0f0', fontWeight: 500 }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .desk-nav { display: none; gap: 1.5rem; }
        @media (min-width: 768px) { .desk-nav { display: flex !important; } .mob-btn { display: none !important; } }
      `}</style>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────

export function Footer({ store }: any) {
  const isRTL = (store?.language || 'ar') === 'ar';
  return (
    <footer style={{ borderTop: '1px solid #e5e5e5', background: '#f8f8f8', padding: '2.5rem 0 1.5rem' }}>
      <div style={{ ...S.container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
        <div>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{store?.name}</p>
          <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.6 }}>{isRTL ? 'متجر إلكتروني' : 'Online Store'}</p>
        </div>
        <div>
          <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', color: '#444' }}>{isRTL ? 'روابط' : 'Links'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { href: '/',        label: isRTL ? 'الرئيسية'   : 'Home'    },
              { href: '/contact', label: isRTL ? 'تواصل معنا' : 'Contact' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: '0.82rem', color: '#555', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', color: '#444' }}>{isRTL ? 'قانوني' : 'Legal'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { href: '/privacy', label: isRTL ? 'سياسة الخصوصية'  : 'Privacy' },
              { href: '/terms',   label: isRTL ? 'الشروط والأحكام' : 'Terms'   },
              { href: '/cookies', label: isRTL ? 'الكوكيز'          : 'Cookies' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: '0.82rem', color: '#555', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
        {(store?.contact?.phone || store?.contact?.email || store?.contact?.wilaya || store?.contact?.address) && (
          <div>
            <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', color: '#444' }}>{isRTL ? 'تواصل معنا' : 'Contact'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {store?.contact?.phone && (
                <a href={`tel:${store.contact.phone}`} style={{ fontSize: '0.82rem', color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={12} />{store.contact.phone}
                </a>
              )}
              {store?.contact?.email && (
                <a href={`mailto:${store.contact.email}`} style={{ fontSize: '0.82rem', color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={12} />{store.contact.email}
                </a>
              )}
              {(store?.contact?.wilaya || store?.contact?.address) && (
                <span style={{ fontSize: '0.82rem', color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={12} />{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <div style={{ ...S.container, marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <p style={{ fontSize: '0.75rem', color: '#999' }}>© {new Date().getFullYear()} {store?.name}</p>
        <a href="https://mdstore.app" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#bbb', textDecoration: 'none' }}>
          Powered by MdStore
        </a>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────

export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig  = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <Link href={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', border: '1px solid #e5e5e5', borderRadius: 4, overflow: 'hidden', background: '#fff', transition: 'border-color 0.15s' }}>
      <div style={{ aspectRatio: '1/1', background: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}><Package size={32} /></div>
        }
        {discount > 0 && (
          <span style={{ position: 'absolute', top: 8, right: 8, background: '#111', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
            -{discount}%
          </span>
        )}
        {product.shippingFree && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: '#111', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
            🚚
          </span>
        )}
      </div>
      <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 500, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </p>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{price.toLocaleString()} <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#666' }}>{store?.currency || 'دج'}</span></span>
          {orig > price && <span style={{ fontSize: '0.78rem', color: '#aaa', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
        </div>
        <div style={{ ...S.btnBlack, justifyContent: 'center', padding: '0.5rem', fontSize: '0.78rem', borderRadius: 3 }}>
          {viewDetails || 'عرض'}
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────

export const Home = ({ store }: any) => {
  const isRTL = (store?.language || 'ar') === 'ar';
  const t = {
    viewDetails: isRTL ? 'عرض التفاصيل' : 'View Details',
    products:    isRTL ? 'المنتجات'      : 'Products',
    categories:  isRTL ? 'الأقسام'       : 'Categories',
    all:         isRTL ? 'الكل'           : 'All',
    noProducts:  isRTL ? 'لا توجد منتجات بعد' : 'No products yet',
  };

  return (
    <div style={S.body}>
      {/* Hero */}
      <section style={{
        background: store.hero?.imageUrl ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)) url(${store.hero.imageUrl})` : '#111',
        backgroundSize: 'cover', backgroundPosition: 'center',
        padding: '4rem 1rem', textAlign: 'center', color: '#fff',
        minHeight: store.hero?.imageUrl ? 320 : 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 700, margin: '0 0 0.75rem' }}>
            {store.hero?.title?.replace(/<[^>]+>/g, '') || store.name}
          </h1>
          {store.hero?.subtitle && (
            <p style={{ fontSize: '0.95rem', opacity: 0.85, maxWidth: 520, margin: '0 auto 1.5rem' }}>
              {store.hero.subtitle}
            </p>
          )}
          <a href="#products" style={{ ...S.btnBlack, background: '#fff', color: '#111', textDecoration: 'none', display: 'inline-flex' }}>
            {isRTL ? 'تسوق الآن' : 'Shop Now'}
          </a>
        </div>
      </section>

      {/* Categories */}
      {store.categories?.length > 0 && (
        <section style={{ borderBottom: '1px solid #e5e5e5', padding: '1rem' }}>
          <div style={{ ...S.container, display: 'flex', gap: '0.5rem', overflowX: 'auto', flexWrap: 'wrap' }}>
            <Link href="/" style={{ ...S.btnOutline, textDecoration: 'none', padding: '0.4rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{t.all}</Link>
            {store.categories.map((cat: any) => (
              <Link key={cat.id} href={`/?category=${cat.id}`} style={{ ...S.btnOutline, textDecoration: 'none', padding: '0.4rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section id="products" style={{ ...S.container, padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#333' }}>{t.products}</h2>
        {store.products?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {store.products.map((p: any) => {
              const img  = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} isRTL={isRTL} store={store} viewDetails={t.viewDetails} />;
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f8f8f8', borderRadius: 4 }}>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{t.noProducts}</p>
          </div>
        )}
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DETAILS
// ─────────────────────────────────────────────────────────────

export function Details({ product, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, toggleWishlist, isWishlisted, handleShare, store }: any) {
  const [selImg, setSelImg] = useState(0);
  const isRTL = true;

  return (
    <div style={S.body} dir={isRTL ? 'rtl' : 'ltr'}>

      <div style={{ ...S.container, padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>

          {/* Images */}
          <div>
            <div style={{ aspectRatio: '1/1', background: '#f5f5f5', position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
              {allImages[selImg]
                ? <img src={allImages[selImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}><Package size={48} /></div>
              }
              {discount > 0 && (
                <span style={{ position: 'absolute', top: 10, right: 10, background: '#111', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 3, fontWeight: 700 }}>
                  -{discount}%
                </span>
              )}
              {!inStock && !autoGen && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto' }}>
                {allImages.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelImg(i)} style={{ width: 56, height: 56, flexShrink: 0, border: `2px solid ${selImg === i ? '#111' : '#e5e5e5'}`, borderRadius: 3, padding: 0, cursor: 'pointer', overflow: 'hidden', background: 'none' }}>
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info + Form */}
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>{product.name}</h1>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1rem' }}>
              {finalPrice.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#666' }}>دج</span>
            </div>
            <div style={{ display: 'inline-block', background: (inStock || autoGen) ? '#111' : '#e5e5e5', color: (inStock || autoGen) ? '#fff' : '#666', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 3, marginBottom: '1.5rem', fontWeight: 600 }}>
              {(inStock || autoGen) ? 'متوفر' : 'غير متوفر'}
            </div>

            {(product.shippingFree || ((store || product?.store)?.supportFreeShipping && (store || product?.store)?.freeShippingMinAmount != null)) && (
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111', marginBottom: '1.25rem' }}>
                {product.shippingFree ? '🚚 توصيل مجاني' : `🚚 توصيل مجاني للطلبات بـ ${(store || product?.store).freeShippingMinAmount} دج أو أكثر`}
              </p>
            )}

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#444', marginBottom: '0.5rem' }}>العروض</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {product.offers.map((o: any) => (
                    <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', border: `1px solid ${selectedOffer === o.id ? '#111' : '#ddd'}`, borderRadius: 4, cursor: 'pointer', background: selectedOffer === o.id ? '#f8f8f8' : '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="radio" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ accentColor: '#111' }} />
                        <span style={{ fontSize: '0.85rem' }}>
                          {o.name} <span style={{ color: '#888', fontSize: '0.8rem' }}>({o.quantity} قطع)</span>
                          {o.subTitle && <><br /><span style={{ color: '#888', fontSize: '0.78rem' }}>{o.subTitle}</span></>}
                          {o.shippingFree && <><br /><span style={{ color: '#111', fontSize: '0.75rem', fontWeight: 700 }}>🚚 توصيل مجاني</span></>}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.price.toLocaleString()} دج</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#444', marginBottom: '0.5rem' }}>{attr.name}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {attr.variants.map((v: any) => {
                    const imgSrc = (v.value || '').startsWith('http') ? v.value : (v.name || '').startsWith('http') ? v.name : null;
                    const isImg = attr.displayMode === 'image' || (attr.displayMode !== 'color' && !!imgSrc);
                    const selKey = isImg ? imgSrc! : v.value;
                    const sel = selectedVariants[attr.name] === selKey;
                    const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                      Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                        ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                      )
                    );
                    return attr.displayMode === 'color' ? (
                      <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.name}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: v.value, border: sel ? '2px solid #111' : '2px solid #ddd', cursor: available ? 'pointer' : 'not-allowed', outline: sel ? '2px solid #111' : 'none', outlineOffset: 2, opacity: available ? 1 : 0.35 }} />
                    ) : isImg ? (
                      <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, imgSrc!)} title={v.name}
                        style={{ width: 52, height: 52, padding: 0, overflow: 'hidden', border: `2px solid ${sel ? '#111' : '#ddd'}`, borderRadius: 4, cursor: available ? 'pointer' : 'not-allowed', flexShrink: 0, opacity: available ? 1 : 0.35 }}>
                        <img src={imgSrc!} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </button>
                    ) : (
                      <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)}
                        style={{ padding: '0.35rem 0.8rem', border: `1px solid ${sel ? '#111' : '#ddd'}`, borderRadius: 3, background: sel ? '#111' : '#fff', color: sel ? '#fff' : (available ? '#333' : '#bbb'), fontSize: '0.82rem', cursor: available ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontWeight: sel ? 600 : 400, textDecoration: available ? 'none' : 'line-through' }}>
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} store={store} />

            {product.desc && (
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e5e5' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#444', marginBottom: '0.75rem' }}>وصف المنتج</p>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#555' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class'] }) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCT FORM
// ─────────────────────────────────────────────────────────────

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0, store }: ProductFormProps) {
  const router = useRouter();
  const [wilayas,         setWilayas]         = useState<Wilaya[]>([]);
  const [communes,        setCommunes]        = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { const id = typeof window !== 'undefined' && localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId: id as string })); }, []);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingCommunes(true);
    fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLoadingCommunes(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

  const getFP = useCallback((): number => {
    const base  = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const offer = product.offers?.find(o => o.id === selectedOffer);
    if (offer) return offer.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find(v => variantMatches(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);

  const supportQty = (store?.supportQty ?? product.store?.supportQty) !== false;
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = product.offers?.find(o => o.id === selectedOffer);
  const storeInfo = store || product.store;
  const orderFreeShipping = !!(product.shippingFree || selOfferObj?.shippingFree ||
    (storeInfo?.supportFreeShipping && storeInfo?.freeShippingMinAmount != null && (getFP() * qty) >= Number(storeInfo.freeShippingMinAmount)));
  const getLiv = useCallback((): number => {
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return Number(fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping]);
  const getTotal = useCallback(() => getFP() * qty + getLiv(), [getFP, qty, getLiv]);

  const getVariantId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find(v => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim() || fd.customerName.length < 3) e.customerName = 'الاسم مطلوب (3 أحرف على الأقل)';
    if (!/^(0|\+213)[5-7][0-9]{8}$/.test(fd.customerPhone.replace(/\s/g, ''))) e.customerPhone = 'رقم هاتف غير صالح (مثال: 0550123456)';
    if (!fd.customerWelaya)  e.customerWelaya  = 'اختر الولاية';
    if (!fd.customerCommune) e.customerCommune = 'اختر البلدية';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem(domain) || '[]');
    cart.push({ ...fd, product, productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, finalPrice: getFP(), quantity: qty });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/orders`, {
        productId: product.id, variantDetailId: getVariantId(), domain,
        storeId: product.store.id, offerId: selectedOffer ?? undefined, platform,
        quantity: qty, totalPrice: getTotal(), typeShip: fd.typeLivraison,
        priceShip: getLiv(), priceLoss: fd.priceLoss, customerId: fd.customerId,
        customerName: fd.customerName, customerPhone: fd.customerPhone,
        customerWilayaId: fd.customerWelaya, customerCommuneId: fd.customerCommune,
      });
      if (res.status === 200 || res.status === 201) {
        if (typeof window !== 'undefined' && res.data?.customerId) localStorage.setItem('customerId', res.data.customerId);
        router.push(`/successfully?productId=${product?.id}`);
      }
    } catch { showError('حدث خطأ في الاتصال بالخادم'); } finally { setSubmitting(false); }
  };

  const fp = getFP();

  return (
    <div style={{ border: '1px solid #e5e5e5', borderRadius: 4, overflow: 'hidden', marginTop: '1.5rem' }}>
      <div style={{ padding: '0.75rem 1rem', background: '#f8f8f8', borderBottom: '1px solid #e5e5e5' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>تأكيد الطلب</p>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: 0 }}>
          <FR label="الاسم الكامل" error={errors.customerName}>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input type="text" value={fd.customerName} placeholder="محمد أحمد"
                onChange={e => setFd({ ...fd, customerName: e.target.value })}
                style={{ ...S.inputBase, paddingRight: 30 }} />
            </div>
          </FR>
          <FR label="رقم الهاتف" error={errors.customerPhone}>
            <div style={{ position: 'relative' }}>
              <Phone size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input type="tel" dir="ltr" value={fd.customerPhone} placeholder="0550 123 456"
                onChange={e => setFd({ ...fd, customerPhone: e.target.value })}
                style={{ ...S.inputBase, paddingRight: 30 }} />
            </div>
          </FR>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: 0 }}>
          <FR label="الولاية" error={errors.customerWelaya}>
            <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...S.inputBase, appearance: 'none' as any }}>
              <option value="">اختر الولاية</option>
              {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
            </select>
          </FR>
          <FR label="البلدية" error={errors.customerCommune}>
            <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingCommunes} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...S.inputBase, appearance: 'none' as any, opacity: (!fd.customerWelaya || loadingCommunes) ? 0.5 : 1 }}>
              <option value="">{loadingCommunes ? 'جاري...' : 'اختر البلدية'}</option>
              {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
            </select>
          </FR>
        </div>

        <FR label="طريقة التوصيل">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {(['home', 'office'] as const).map(t => (
              <button key={t} type="button" onClick={() => setFd({ ...fd, typeLivraison: t })}
                style={{ ...S.btnOutline, justifyContent: 'center', flexDirection: 'column', gap: 2, padding: '0.6rem', borderColor: fd.typeLivraison === t ? '#111' : '#ddd', background: fd.typeLivraison === t ? '#111' : '#fff', color: fd.typeLivraison === t ? '#fff' : '#333' }}>
                {t === 'home' ? <HomeIcon size={14} /> : <Building2 size={14} />}
                <span style={{ fontSize: '0.75rem' }}>{t === 'home' ? 'المنزل' : 'المكتب'}</span>
                {selW && <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{orderFreeShipping ? '🚚 توصيل مجاني' : `${(t === 'home' ? selW.livraisonHome : selW.livraisonOfice)} دج`}</span>}
              </button>
            ))}
          </div>
        </FR>

        {supportQty && (
          <FR label="الكمية">
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 4, width: 'fit-content', background: '#fff', overflow: 'hidden' }}>
              <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
              <span style={{ width: 36, textAlign: 'center', fontWeight: 700 }}>{fd.quantity}</span>
              <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
            </div>
          </FR>
        )}

        {/* Summary */}
        <div style={{ background: '#f8f8f8', padding: '0.75rem', borderRadius: 4, marginBottom: '1rem', fontSize: '0.82rem', color: '#555' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>سعر القطعة</span><span style={{ fontWeight: 600, color: '#111' }}>{fp.toLocaleString()} دج</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>الكمية</span><span>× {qty}</span>
          </div>
          {selW && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>التوصيل</span><span>{orderFreeShipping ? '🚚 توصيل مجاني' : `${getLiv()} دج`}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #e5e5e5', fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>
            <span>الإجمالي</span><span>{getTotal().toLocaleString()} دج</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={submitting} style={{ ...S.btnBlack, flex: 1, justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? <><Loader2 size={14} /> جاري الإرسال...</> : <><ShoppingCart size={14} /> تأكيد الطلب</>}
          </button>
        {product.store.cart && (
            <button type="button" onClick={addToCart} disabled={isAdded} style={{ ...S.btnOutline, padding: '0.65rem 0.9rem' }}>
              {isAdded ? <Check size={16} color="green" /> : <ShoppingCart size={16} />}
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.72rem', color: '#aaa', textAlign: 'center', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Shield size={11} /> بياناتك آمنة ومشفرة
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────

export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems] = useState<any[]>([]);
  const initCount = useCartStore((s) => s.initCount);
  const isRTL = (store?.language || 'ar') === 'ar';

  useEffect(() => { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); }, [domain]);

  const remove = (i: number) => {
    const n = items.filter((_, idx) => idx !== i);
    setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length);
  };

  const total = items.reduce((acc, it) => acc + (it.finalPrice * it.quantity), 0);
  const hasFreeShippingItem = items.some(it => it.product?.shippingFree || it.product?.offers?.find((o: any) => o.id === it.selectedOffer)?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && total >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - total : 0;

  if (!items.length) return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ ...S.body, textAlign: 'center', padding: '5rem 1rem', minHeight: '50vh' }}>
      <ShoppingCart size={40} color="#ccc" style={{ margin: '0 auto 1rem' }} />
      <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>{isRTL ? 'السلة فارغة' : 'Cart is empty'}</p>
      <Link href="/" style={{ ...S.btnBlack, textDecoration: 'none', display: 'inline-flex' }}>{isRTL ? 'مواصلة التسوق' : 'Continue Shopping'}</Link>
    </div>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ ...S.body, padding: '2rem 0', minHeight: '60vh' }}>
      <div style={{ ...S.container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>{isRTL ? 'سلة المشتريات' : 'Cart'}</h1>
          {freeShippingMin != null && (
            <div style={{ background: freeShippingReached ? '#f0fdf4' : '#f8f8f8', border: `1px solid ${freeShippingReached ? '#111' : '#e5e5e5'}`, color: '#111', borderRadius: 4, padding: '0.65rem 1rem', marginBottom: '1.25rem', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center' }}>
              {freeShippingReached
                ? (isRTL ? '🎉 حصلت على توصيل مجاني!' : '🎉 You got free delivery!')
                : (isRTL ? `أضف ${freeShippingRemainingAmt.toLocaleString()} دج أخرى للحصول على توصيل مجاني` : `Add ${freeShippingRemainingAmt.toLocaleString()} DZD more for free delivery`)}
            </div>
          )}
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: 4, marginBottom: '0.75rem', background: '#fff' }}>
              <img src={item.product?.productImage} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 3, background: '#f5f5f5' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>{item.product?.name}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.finalPrice} دج <span style={{ fontWeight: 400, color: '#888', fontSize: '0.8rem' }}>× {item.quantity}</span></p>
              </div>
              <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 4, padding: '1.25rem', background: '#f8f8f8' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>{isRTL ? 'ملخص السلة' : 'Summary'}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            <span>{isRTL ? 'الإجمالي' : 'Total'}:</span>
            <span>{total.toLocaleString()} دج</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '1rem' }}>* تكاليف التوصيل تُحتسب عند الطلب</p>
          <button style={{ ...S.btnBlack, width: '100%', justifyContent: 'center' }}>{isRTL ? 'إتمام الطلب' : 'Checkout'}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUCCESS
// ─────────────────────────────────────────────────────────────

export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const isRTL = (store?.language || 'ar') === 'ar';
  const currency = store?.currency || (isRTL ? 'دج' : 'DZD');

  const steps = [
    { icon: Check,   title: isRTL ? 'تم استلام طلبك'    : 'Order received', desc: isRTL ? 'تم تسجيل طلبك بنجاح في نظامنا' : 'Your order has been registered successfully', done: true },
    { icon: Phone,   title: isRTL ? 'تأكيد الطلب'        : 'Confirmation',   desc: isRTL ? 'سنتصل بك خلال 24 ساعة'         : "We'll call you within 24 hours",             done: false },
    { icon: Package, title: isRTL ? 'التجهيز والتغليف'   : 'Packaging',      desc: isRTL ? 'يتم تجهيز طلبك بعناية'          : 'Your order is being prepared with care',     done: false },
    { icon: Truck,   title: isRTL ? 'الشحن والتوصيل'     : 'Shipping',       desc: isRTL ? '2-5 أيام عمل'                   : '2-5 business days',                          done: false },
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ ...S.body, padding: '3rem 1rem', minHeight: '70vh' }}>
      <div style={{ ...S.container, maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 1.25rem', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{isRTL ? 'تم تأكيد طلبك!' : 'Order confirmed!'}</h1>
          <p style={{ fontSize: '0.88rem', color: '#666', lineHeight: 1.7 }}>
            {isRTL ? 'شكراً لثقتك بنا، سنتواصل معك قريباً لتأكيد التفاصيل.' : "Thank you for your order, we'll contact you soon to confirm the details."}
          </p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ border: '1px solid #e5e5e5', borderRadius: 4, padding: '1rem 1.25rem', marginBottom: '1.5rem', background: '#f8f8f8' }}>
            {order.productName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid #e5e5e5', fontSize: '0.85rem' }}>
                <span style={{ color: '#666', flexShrink: 0 }}>{isRTL ? 'المنتج' : 'Product'}</span>
                <span style={{ fontWeight: 600, textAlign: isRTL ? 'left' : 'right' }}>{order.productName}</span>
              </div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700 }}>
                <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                <span>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ border: '1px solid #e5e5e5', borderRadius: 4, overflow: 'hidden', marginBottom: '2rem' }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem', borderBottom: i < steps.length - 1 ? '1px solid #e5e5e5' : 'none', background: step.done ? '#f8f8f8' : '#fff' }}>
                <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step.done ? '#111' : '#f0f0f0', color: step.done ? '#fff' : '#bbb' }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: step.done ? '#111' : '#999', marginBottom: 2 }}>{step.title}</p>
                  <p style={{ fontSize: '0.78rem', color: '#999' }}>{step.desc}</p>
                </div>
                {step.done && <Check size={16} color="#111" />}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <Link href="/" style={{ ...S.btnBlack, justifyContent: 'center', textDecoration: 'none' }}>
            <ShoppingCart size={16} /> {isRTL ? 'تصفح المزيد من المنتجات' : 'Browse more products'}
          </Link>
          <Link href="/" style={{ ...S.btnOutline, justifyContent: 'center', textDecoration: 'none' }}>
            {isRTL ? 'العودة إلى الصفحة الرئيسية' : 'Back to home'}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATIC PAGES
// ─────────────────────────────────────────────────────────────

function SimplePage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...S.body, padding: '3rem 0', minHeight: '60vh' }} dir="rtl">
      <div style={{ ...S.container, maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h1>
        <hr style={{ ...S.hr, marginBottom: '1.5rem' }} />
        <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: '#444' }}>{children}</div>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <SimplePage title="سياسة الخصوصية">
      <p>نجمع فقط البيانات الضرورية لإتمام طلبك وتوصيله (الاسم، العنوان، رقم الهاتف).</p>
      <br />
      <p>تُستخدم بياناتك حصراً لمعالجة شحناتك والتواصل معك. لا نشارك بياناتك مع أطراف خارجية لأغراض تسويقية.</p>
    </SimplePage>
  );
}

export function Terms() {
  return (
    <SimplePage title="الشروط والأحكام">
      <p>باستخدامك لموقعنا، فإنك توافق على الالتزام بالشروط الموضحة.</p>
      <br />
      <p>نحتفظ بالحق في تعديل الأسعار وتوافر المنتجات دون إشعار مسبق.</p>
    </SimplePage>
  );
}

export function Cookies() {
  return (
    <SimplePage title="سياسة ملفات الارتباط">
      <p>نستخدم ملفات تعريف الارتباط الضرورية فقط لتشغيل الوظائف الأساسية للموقع كتسجيل الدخول وسلة التسوق.</p>
    </SimplePage>
  );
}

export function Contact({ store }: { store: any }) {
  const isRTL = (store?.language || 'ar') === 'ar';
  return (
    <SimplePage title={isRTL ? 'تواصل معنا' : 'Contact Us'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {store?.contact?.phone && (
          <a href={`tel:${store.contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111', textDecoration: 'none' }}>
            <Phone size={15} />{store.contact.phone}
          </a>
        )}
        {store?.contact?.email && (
          <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111', textDecoration: 'none' }}>
            <Mail size={15} />{store.contact.email}
          </a>
        )}
        {(store?.contact?.wilaya || store?.contact?.address) && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555' }}>
            <MapPin size={15} />{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ')}
          </span>
        )}
        {!store?.contact?.phone && !store?.contact?.email && (
          <p style={{ color: '#aaa' }}>{isRTL ? 'لا توجد معلومات تواصل' : 'No contact info available'}</p>
        )}
      </div>
    </SimplePage>
  );
}

export function StaticPage({ page, store }: { page: string; store: any }) {
  const p = (page || '').toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy />}
      {p === 'terms'   && <Terms />}
      {p === 'cookies' && <Cookies />}
      {p === 'contact' && <Contact store={store} />}
    </>
  );
}
