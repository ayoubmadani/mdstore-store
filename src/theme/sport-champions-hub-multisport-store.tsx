'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, Check, X, Phone, MapPin,
  CheckCircle2, ArrowLeft, Zap, Trophy,
  Menu, Search, ShoppingCart, Minus, Plus,
  Trash2, Loader2, Package, Shield, Truck, Lock, RotateCcw,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   CHAMPIONS HUB — Multi-Sport Arabic RTL Theme
   ─────────────────────────────────────────────────────────────
   Primary: #1A1A2E (navy)  Accent: #E94560 (crimson)
   Gold:    #F4A261          White:  #FFFFFF
   Fonts:   Oswald (display) + Inter (body)
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  :root {
    --primary:   #1A1A2E;
    --primary-l: #16213E;
    --accent:    #E94560;
    --accent-h:  #C73E54;
    --gold:      #F4A261;
    --gold-h:    #E76F51;
    --white:     #FFFFFF;
    --g50:       #F8F9FA;
    --g100:      #F1F3F5;
    --g200:      #E9ECEF;
    --g300:      #DEE2E6;
    --g400:      #CED4DA;
    --g500:      #ADB5BD;
    --g600:      #868E96;
    --g700:      #495057;
    --g800:      #343A40;
    --g900:      #212529;
    --success:   #2ECC71;
    --warn:      #F39C12;
    --danger:    #E74C3C;
    --shadow-s:  0 1px 2px rgba(0,0,0,0.05);
    --shadow:    0 4px 6px -1px rgba(0,0,0,0.1);
    --shadow-m:  0 10px 15px -3px rgba(0,0,0,0.1);
    --shadow-l:  0 20px 25px -5px rgba(0,0,0,0.1);
    --radius:    12px;
    --radius-s:  8px;
    --tr:        all 0.3s cubic-bezier(0.4,0,0.2,1);
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--g50); color: var(--g800);
    line-height: 1.6; overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  a { text-decoration: none; color: inherit; }
  .oswald { font-family: 'Oswald', sans-serif; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }

  /* ── Keyframes ── */
  @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
  @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin    { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes check-in{ from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.35)} }

  .anim-fade-up { animation: fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-check   { animation: check-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
  .d1 { animation-delay: 0.1s; }
  .d2 { animation-delay: 0.2s; }
  .d3 { animation-delay: 0.35s; }

  /* ── Ticker ── */
  .ticker-wrap  { overflow: hidden; white-space: nowrap; }
  .ticker-inner { display: inline-block; animation: ticker 28s linear infinite; }

  /* ── Cards ── */
  .prod-card {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--g200); overflow: hidden;
    transition: var(--tr); position: relative;
  }
  .prod-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-m); border-color: var(--g300); }
  .prod-card:hover .card-img-inner img { transform: scale(1.08); }
  .card-img-inner img { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); display: block; }

  .cat-card {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--g200); overflow: hidden;
    transition: var(--tr); display: block; text-decoration: none;
  }
  .cat-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-m); border-color: var(--accent); }
  .cat-card:hover .cat-img img { transform: scale(1.1); }
  .cat-img img { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); display: block; }

  /* ── Quick view button ── */
  .quick-view-btn {
    position: absolute; bottom: 12px; left: 50%;
    transform: translateX(-50%) translateY(12px);
    opacity: 0; background: var(--primary); color: #fff;
    border: none; padding: 9px 22px; border-radius: 50px;
    font-size: 0.78rem; font-weight: 600; cursor: pointer;
    transition: var(--tr); white-space: nowrap;
    font-family: 'Inter', sans-serif;
  }
  .prod-card:hover .quick-view-btn { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* ── Btn ── */
  .btn-pri {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--accent); color: #fff;
    padding: 13px 30px; border-radius: 50px;
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.925rem;
    border: none; cursor: pointer;
    box-shadow: 0 4px 14px rgba(233,69,96,0.3);
    transition: var(--tr);
  }
  .btn-pri:hover { background: var(--accent-h); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(233,69,96,0.4); }
  .btn-pri:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  .btn-out {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: #fff;
    padding: 12px 28px; border-radius: 50px;
    border: 2px solid rgba(255,255,255,0.25);
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.925rem;
    cursor: pointer; transition: var(--tr);
  }
  .btn-out:hover { border-color: #fff; background: rgba(255,255,255,0.07); }

  .btn-gold {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--gold); color: var(--primary);
    padding: 13px 30px; border-radius: 50px;
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.925rem;
    border: none; cursor: pointer; transition: var(--tr);
  }
  .btn-gold:hover { background: var(--gold-h); transform: translateY(-2px); }

  /* ── Input ── */
  .inp {
    width: 100%; padding: 11px 14px; background: #fff;
    border: 1.5px solid var(--g300); border-radius: var(--radius-s);
    font-family: 'Inter', sans-serif; font-size: 0.9rem; color: var(--g800);
    outline: none; transition: border-color 0.2s; appearance: none;
  }
  .inp:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(233,69,96,0.1); }
  .inp-err { border-color: var(--danger) !important; }

  /* ── Badge ── */
  .badge-sale { background: var(--accent); color: #fff; }
  .badge-new  { background: var(--success); color: #fff; }
  .badge-hot  { background: var(--gold); color: var(--primary); }

  /* ── Cart badge ── */
  .cart-badge {
    position: absolute; top: -2px; right: -2px;
    min-width: 18px; height: 18px; border-radius: 9px;
    background: var(--accent); color: #fff;
    font-size: 9px; font-weight: 700; padding: 0 4px;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--primary);
  }

  /* ── Nav responsive ── */
  .nav-links-d  { display: none; align-items: center; gap: 32px; list-style: none; }
  .nav-search-d { display: none; }
  .nav-mob-btns { display: flex; align-items: center; gap: 8px; }
  @media (min-width: 1024px) {
    .nav-links-d  { display: flex; }
    .nav-search-d { display: block; }
    .nav-mob-btns { display: none; }
  }

  /* ── Grids ── */
  .products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; } }

  .cats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  @media (min-width: 640px)  { .cats-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1024px) { .cats-grid { grid-template-columns: repeat(6, 1fr); } }

  .trust-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) { .trust-grid { grid-template-columns: repeat(4, 1fr); } }

  .details-layout {
    display: grid; grid-template-columns: 1fr; gap: 2rem;
  }
  @media (min-width: 768px) { .details-layout { grid-template-columns: 1fr 1fr; gap: 3rem; } }

  .form-row-2 {
    display: grid; grid-template-columns: 1fr; gap: 0.875rem;
  }
  @media (min-width: 540px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

  .cart-layout {
    display: grid; grid-template-columns: 1fr; gap: 2rem;
  }
  @media (min-width: 1024px) { .cart-layout { grid-template-columns: 1.2fr 1fr; gap: 3rem; } }

  .footer-cols {
    display: grid; grid-template-columns: 1fr; gap: 2.5rem;
    padding-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  @media (min-width: 768px) { .footer-cols { grid-template-columns: 1.8fr 1fr 1fr; } }

  .hero-layout {
    display: grid; grid-template-columns: 1fr; gap: 2rem;
    align-items: center; padding: 7rem 1.5rem 4rem; min-height: 90vh;
  }
  @media (min-width: 1024px) {
    .hero-layout { grid-template-columns: 1fr 1fr; padding: 0 3rem; min-height: 100vh; }
  }

  .hero-actions { display: flex; flex-direction: column; gap: 0.875rem; }
  @media (min-width: 540px) { .hero-actions { flex-direction: row; align-items: center; } }

  .banner-inner {
    background: var(--primary); border-radius: var(--radius); overflow: hidden;
    display: grid; grid-template-columns: 1fr; min-height: 360px;
  }
  @media (min-width: 768px) { .banner-inner { grid-template-columns: 1fr 1fr; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 540px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .thumb-row { display: flex; gap: 0.625rem; overflow-x: auto; padding-bottom: 4px; margin-top: 0.875rem; }
  .pagination { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin-top: 3rem; }
  .contact-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .contact-layout { grid-template-columns: 1fr 1.5fr; } }

  /* ── Hero badges ── */
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
    padding: 7px 14px; border-radius: 50px;
    color: var(--g300); font-size: 0.82rem; font-weight: 500;
  }

  /* ── Nav link ── */
  .nav-link {
    color: var(--g400); font-size: 0.875rem; font-weight: 500;
    position: relative; transition: color 0.2s; text-decoration: none;
  }
  .nav-link:hover { color: #fff; }
  .nav-link::after {
    content: ''; position: absolute; bottom: -6px; left: 0;
    width: 0; height: 2px; background: var(--accent); transition: width 0.25s;
  }
  .nav-link:hover::after { width: 100%; }
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

const vm = (d: VariantDetail, s: Record<string, string>) =>
  Object.entries(s).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

const INP = (err?: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 14px', background: '#fff',
  border: `1.5px solid ${err ? 'var(--danger)' : 'var(--g300)'}`,
  borderRadius: 'var(--radius-s)', fontFamily: "'Inter',sans-serif",
  fontSize: '0.9rem', color: 'var(--g800)', outline: 'none',
  transition: 'border-color 0.2s', appearance: 'none'
});

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--g600)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
    {children}
    {error && <p style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}><AlertCircle size={11} />{error}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */

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
  quickLinks: 'روابط سريعة',
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
  quickLinks: 'Navigation',
  contactSect: 'Contact',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  rightsReserved: 'Tous droits réservés.',
};

export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--g50)', fontFamily: "'Inter',sans-serif" }}>
      <style>{CSS}</style>

      {/* Ticker bar */}
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="ticker-wrap" style={{ height: 36, display: 'flex', alignItems: 'center', background: 'var(--accent)' }}>
          <div className="ticker-inner">
            {Array(10).fill(null).map((_, i) => (
              <span key={i} style={{ margin: '0 2.5rem', color: '#fff', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ⚡ {store.topBar.text}
              </span>
            ))}
            {Array(10).fill(null).map((_, i) => (
              <span key={`b${i}`} style={{ margin: '0 2.5rem', color: '#fff', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ⚡ {store.topBar.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR — dark navy bg
══════════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sq, setSq] = useState('');
  const [ls, setLs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const count = useCartStore(s => s.count);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { initCount(JSON.parse(localStorage.getItem(domain) || '[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);
  useEffect(() => {
    if (sq.length < 2) { setLs([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: sq } }); setLs(data.products || []); }
      catch { } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [sq, domain]);

  const doSearch = (e?: React.FormEvent) => { if (e) e.preventDefault(); if (sq.trim()) { router.push(`/?search=${encodeURIComponent(sq)}`); setSq(''); setShowSearch(false); } };

  const Drop = () => (
  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, left: 0, background: '#fff', border: '1px solid var(--g200)', borderRadius: 'var(--radius-s)', boxShadow: 'var(--shadow-m)', zIndex: 200, overflowY: 'auto', maxHeight: 300 }}>
    
    {/* زر إغلاق انسيابي داخل القائمة */}
    <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem 0.75rem 0.25rem' }}>
      <button 
        onClick={() => setSq('')} 
        style={{ 
          background: '#F3F4F6', 
          border: 'none', 
          borderRadius: '50%', 
          width: 26, 
          height: 26, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer' 
        }}
      >
        <X size={12} style={{ color: '#374151' }} />
      </button>
    </div>

    {loading 
      ? <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600 }}>جاري البحث...</div>
      : ls.length > 0 
        ? (
          <div>
            {ls.map((p: any) => (
              <Link 
                href={`/product/${p.id}`} 
                key={p.id} 
                onClick={() => setSq('')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--g100)', textDecoration: 'none' }}
              >
                <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} style={{ width: 40, height: 40, borderRadius: 'var(--radius-s)', objectFit: 'cover', flexShrink: 0 }} alt="" />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--g800)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>{p.price} دج</div>
                </div>
              </Link>
            ))}
            <button
              onClick={() => doSearch()}
              style={{ width: '100%', padding: '12px', background: 'rgba(233,69,96,0.07)', border: 'none', borderTop: '1px solid rgba(233,69,96,0.2)', color: 'var(--accent)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              عرض جميع النتائج <ArrowLeft size={14} />
            </button>
          </div>
        )
        : sq.length >= 2 && (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--g500)', fontSize: '0.875rem' }}>
            لا توجد نتائج
          </div>
        )
    }
  </div>
);

  return (
    <nav dir="rtl" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(26,26,46,0.98)' : 'rgba(26,26,46,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      boxShadow: scrolled ? 'var(--shadow-m)' : 'none',
      transition: 'var(--tr)'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, background: 'var(--accent)', borderRadius: 'var(--radius-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {(store.design.logoUrl && store.design.logoUrl !== '/default-logo.png')
              ? <img src={store.design.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <span style={{ fontSize: '1.25rem' }}>🏆</span>}
          </div>
          <span className="oswald" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>{store?.name}</span>
        </Link>

        {/* Desktop search */}
        <div className="nav-search-d" style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
          <form onSubmit={doSearch} style={{ position: 'relative' }}>
            <input type="text" placeholder="ابحث عن المنتجات..." value={sq} onChange={e => setSq(e.target.value)}
              style={{ width: '100%', padding: '9px 40px 9px 14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 50, color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: "'Inter',sans-serif", transition: 'all 0.3s' }}
              onFocus={e => { e.target.style.width = '300px'; e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.target.style.width = '100%'; e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--g400)' }} />
          </form>
          {sq.length >= 2 && <Drop />}
        </div>

        {/* Desktop links */}
        <div className="nav-links-d">
          {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل' }].map(i => (
            <Link key={i.h} href={i.h} className="nav-link">{i.l}</Link>
          ))}
          {store?.cart !== false && (
          <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '8px', transition: 'color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}>
            <ShoppingCart size={22} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="nav-mob-btns">
          <button onClick={() => setShowSearch(!showSearch)} style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <Search size={17} />
          </button>
          {store?.cart !== false && (
            <Link href="/cart" style={{ position: 'relative', width: 40, height: 40, background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ShoppingCart size={17} />
            {count > 0 && <span className="cart-badge" style={{ border: '2px solid var(--accent)' }}>{count}</span>}
          </Link>
          )}
          <button onClick={() => setOpen(!open)} style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {showSearch && (
        <div style={{ padding: '0.625rem 1.5rem', background: 'var(--primary-l)', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
          <form onSubmit={doSearch} style={{ position: 'relative' }}>
            <input autoFocus type="text" placeholder="ابحث هنا..." value={sq} onChange={e => setSq(e.target.value)}
              style={{ ...INP(), background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.15)', padding: '0.75rem 2.5rem 0.75rem 1rem' }} />
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--g500)' }} />
          </form>
          {sq.length >= 2 && <Drop />}
        </div>
      )}

      {/* Mobile menu */}
      <div style={{ overflow: 'hidden', maxHeight: open ? 200 : 0, transition: 'max-height 0.3s ease', background: 'var(--primary-l)', borderTop: open ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <div style={{ padding: '0.5rem 1.5rem 1rem' }}>
          {[{ h: '/', l: 'الرئيسية' }, { h: '/contact', l: 'تواصل معنا' }].map(i => (
            <Link key={i.h} href={i.h} onClick={() => setOpen(false)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem', fontWeight: 500, color: 'var(--g300)', transition: 'color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--g300)'; }}>
              {i.l} <ArrowLeft size={14} style={{ color: 'var(--accent)' }} />
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — 3 أقسام
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
  return (
    <footer dir="rtl" style={{ background: 'var(--primary)', color: 'var(--g500)', padding: '5rem 1.5rem 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div className="footer-cols">

          {/* قسم 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.125rem' }}>
              <div style={{ width: 40, height: 40, background: 'var(--accent)', borderRadius: 'var(--radius-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.25rem' }}>🏆</span>
              </div>
              <span className="oswald" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--g500)', lineHeight: 1.75, maxWidth: 280 }}>
              {store?.hero?.subtitle?.substring(0, 90) || 'وجهتك الأولى للمعدات الرياضية عالية الجودة — كرة قدم، تنس، سلة، وأكثر.'}
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.5rem' }}>
              {['⚽', '🎾', '🏀', '🏋️', '🏃'].map((e, i) => (
                <span key={i} style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'var(--tr)', cursor: 'default' }}
                  onMouseEnter={el => { (el.currentTarget as HTMLSpanElement).style.background = 'var(--accent)'; (el.currentTarget as HTMLSpanElement).style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={el => { (el.currentTarget as HTMLSpanElement).style.background = 'rgba(255,255,255,0.05)'; (el.currentTarget as HTMLSpanElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                  {e}
                </span>
              ))}
            </div>
            <p style={{ marginTop: '2.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة.</p>
          </div>

          {/* قسم 2 — الروابط */}
          <div>
            <h4 className="oswald" style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>روابط سريعة</h4>
            {[{ h: '/', l: 'الرئيسية' }, { h: '/cart', l: 'سلة التسوق' }, { h: '/contact', l: 'تواصل معنا' }, { h: '/Privacy', l: 'سياسة الخصوصية' }, { h: '/Terms', l: 'شروط الخدمة' }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map((lnk, i) => (
              <a key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 400, color: 'var(--g500)', marginBottom: '0.75rem', transition: 'all 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--accent)'; el.style.paddingRight = '5px'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--g500)'; el.style.paddingRight = '0'; }}>
                {lnk.l}
              </a>
            ))}
          </div>

          {/* قسم 3 — التواصل */}
          <div>
            <h4 className="oswald" style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>تواصل معنا</h4>
            {[
              { icon: <Phone size={13} />, val: store?.contact?.phone },
              { icon: <MapPin size={13} />, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--g500)', marginBottom: '0.875rem' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>{r.icon}</span>{r.val}
              </div>
            ))}
            <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 'var(--radius-s)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.375rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                <span className="oswald" style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>متاحون الآن</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--g500)' }}>نرد خلال ساعات</p>
            </div>
          </div>

        </div>

        <div style={{ padding: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', marginTop: '0' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--g600)' }}>© {new Date().getFullYear()} {store?.name}. جميع الحقوق محفوظة. صُنع للأبطال.</p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   CARD
══════════════════════════════════════════════════════════════ */

const catEmojis: { [key: string]: string } = {
  'كرة القدم': '⚽',
  'تنس': '🎾',
  'كرة السلة': '🏀',
  'جري': '🏃',
  'سباحة': '🏊',
  'دراجات': '🚴',
  'ملاكمة': '🥊',
  'لياقة': '🏋️',
};

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const [hov, setHov] = useState(false);
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  const badge = discount > 0 ? 'sale' : null;
  // استخدم الاسم للبحث في قائمة الإيموجي
  const categoryEmoji = catEmojis[product.category?.name || product.category] || '🏆';

  return (
    <div className="prod-card" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {/* Image */}
      <div className="card-img-inner" style={{ position: 'relative', height: 240, overflow: 'hidden', background: 'var(--g100)' }}>
        {displayImage
          ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>{categoryEmoji}</div>}
        {badge && <span className={`badge-${badge}`} style={{ position: 'absolute', top: 12, right: 12, padding: '5px 12px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{discount}%-</span>}
        <button className="quick-view-btn" style={{ display: 'none' }}>عرض سريع</button>
      </div>

      {/* Info */}
      <div style={{ padding: '18px' }}>
        {/* ابحث عن هذا الجزء داخل مكون Card وقم بتعديله */}
        <p style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          {/* التحقق إذا كانت الفئة كائناً أو نصاً */}
          {product.category && typeof product.category === 'object' ? product.category.name : (product.category || 'رياضة')}        </p>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--g800)', marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={12} style={{ fill: i < 4 ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
            <span className="oswald" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--g900)' }}>{price.toLocaleString()}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--g500)', fontWeight: 600 }}>{store?.currency || 'دج'}</span>
            {orig > price && <span style={{ fontSize: '0.8rem', color: 'var(--g400)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
          </div>
          <Link href={`/product/${product.slug || product.id}`}
            style={{ width: 38, height: 38, background: hov ? 'var(--accent)' : 'var(--g100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: hov ? '#fff' : 'var(--g600)', transition: 'var(--tr)' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'var(--accent)'; el.style.color = '#fff'; el.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'var(--g100)'; el.style.color = 'var(--g600)'; el.style.transform = ''; }}>
            <ShoppingCart size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════════ */
export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir="rtl">

      {/* ── HERO ── */}
      <section style={{ position: 'relative', background: 'var(--primary)', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 72 }}>
        {/* BG image */}
        {store.hero?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />
          </div>
        )}
        {/* Radial pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, var(--accent) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--gold) 0%, transparent 40%)', opacity: 0.1, pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        <div className="hero-layout" style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1, width: '100%' }}>
          {/* Text */}
          <div>
            <div className="anim-fade-up" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {['✅ شحن سريع', '✅ منتجات أصيلة', '✅ ضمان الجودة'].map((b, i) => (
                <span key={i} className="hero-badge">{b}</span>
              ))}
            </div>

            <h1 className="oswald anim-fade-up d1" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: '1.375rem', textTransform: 'uppercase', letterSpacing: '1px' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || 'ارتقِ بـ <span style="color:var(--accent);display:block">مستواك الرياضي</span>') }}>
            </h1>

            <p className="anim-fade-up d2" style={{ fontSize: '1.0625rem', color: 'var(--g400)', maxWidth: 480, lineHeight: 1.75, marginBottom: '2.5rem' }}>
              {store.hero?.subtitle || 'أجود المعدات الرياضية للأبطال — من كرة القدم إلى التنس، كل ما تحتاجه للتميز.'}
            </p>

            {/* Stats */}
            <div className="anim-fade-up d2" style={{ display: 'flex', gap: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              {[{ v: `${products.length}+`, l: 'منتج متوفر' }, { v: '4.9', l: 'متوسط التقييم' }, { v: '48h', l: 'توصيل سريع' }].map((s, i) => (
                <div key={i}>
                  <p className="oswald" style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.v}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--g500)', marginTop: 4 }}>{s.l}</p>
                </div>
              ))}
            </div>

            <div className="hero-actions anim-fade-up d3">
              <a href="#products" className="btn-pri" style={{ textDecoration: 'none' }}>تسوق الآن <ArrowLeft size={16} /></a>
                            {store?.cart !== false && (<Link href="/cart" className="btn-out">السلة</Link>)}
            </div>
          </div>

          {/* Hero image side */}
          {store.hero?.imageUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
                
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--g200)', borderTop: '1px solid var(--g200)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div className="trust-grid">
            {[
              { icon: <Truck size={20} />, t: 'توصيل سريع', d: '48 ساعة لجميع الولايات' },
              { icon: <RotateCcw size={20} />, t: 'إرجاع سهل', d: 'سياسة 30 يوم' },
              { icon: <Shield size={20} />, t: 'منتجات أصيلة', d: 'ضمان 100%' },
              { icon: <Trophy size={20} />, t: 'جودة عالية', d: 'معدات احترافية' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.375rem 1.25rem', borderLeft: i > 0 ? '1px solid var(--g200)' : 'none', transition: 'var(--tr)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--g50)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
                <div style={{ width: 48, height: 48, background: 'var(--g100)', borderRadius: 'var(--radius-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--g800)', marginBottom: '0.2rem' }}>{item.t}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--g500)' }}>{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="cats-grid">
        
              {cats.map((cat: any) => (
          <Link key={cat.id} href={`?category=${cat.id}`} className="cat-card">
            <div className="cat-img" style={{ height: 160, overflow: 'hidden', position: 'relative', background: 'var(--g100)' }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-l) 100%)` }}>
                {/* التعديل هنا: البحث عن الإيموجي باستخدام اسم الفئة */}
                {catEmojis[cat.name] || '🏆'}
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(26,26,46,0.75),transparent)', display: 'flex', alignItems: 'flex-end', padding: 14 }}>
                <h3 className="oswald" style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>{cat.name}</h3>
              </div>
            </div>
            <div style={{ padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--g500)' }}>منتج رياضي</p>
              <span style={{ display: 'inline-block', marginTop: 6, fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>تسوق الآن ←</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding: '1rem 1.5rem 6rem', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="oswald" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 700, color: 'var(--g900)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              المنتجات <span style={{ color: 'var(--accent)' }}>المميزة</span>
            </h2>
            <p style={{ color: 'var(--g500)', fontSize: '0.95rem', marginTop: 6 }}>{products.length} منتج رياضي احترافي</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', border: '1px dashed var(--g300)', borderRadius: 'var(--radius)', background: '#fff' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🏆</span>
            <p className="oswald" style={{ fontSize: '1.25rem', color: 'var(--g500)' }}>لا توجد منتجات حالياً</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails="عرض المنتج" />;
            })}
          </div>
        )}

        {countPage > 1 && (
          <div className="pagination" dir="rtl">
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false}
              style={{ width: 44, height: 44, border: '1px solid var(--g300)', background: '#fff', borderRadius: 'var(--radius-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, opacity: page <= 1 ? 0.5 : 1 }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return (
                <Link key={pn} href={{ query: { page: pn } }} scroll={false}
                  style={{ width: 44, height: 44, borderRadius: 'var(--radius-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem', border: `1px solid ${isA ? 'var(--accent)' : 'var(--g300)'}`, background: isA ? 'var(--accent)' : '#fff', color: isA ? '#fff' : 'var(--g700)' }}>
                  {pn}
                </Link>
              );
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false}
              style={{ width: 44, height: 44, border: '1px solid var(--g300)', background: '#fff', borderRadius: 'var(--radius-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, opacity: page >= countPage ? 0.5 : 1 }}>❯</Link>
          </div>
        )}
      </section>

      {/* ── BRANDS ── */}
      <div style={{ background: '#fff', borderTop: '1px solid var(--g200)', borderBottom: '1px solid var(--g200)', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {['NIKE', 'ADIDAS', 'PUMA', 'WILSON', 'ASICS', 'UNDER ARMOUR'].map((b, i) => (
            <span key={i} className="oswald" style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--g300)', letterSpacing: '2px', transition: 'color 0.2s', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.color = 'var(--g600)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.color = 'var(--g300)'; }}>
              {b}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETAILS
══════════════════════════════════════════════════════════════ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain }: any) {
  const [sel, setSel] = useState(0);

  return (
    <div dir="rtl" style={{ background: 'var(--g50)', minHeight: '100vh', paddingBottom: '5rem' }}>
      

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div className="details-layout">

          {/* Gallery */}
          <div style={{top: 88 }}>
            <div style={{ position: 'relative', height: 420, overflow: 'hidden', background: 'var(--g100)', borderRadius: 'var(--radius)', border: '1px solid var(--g200)' }}>
              {allImages[sel]
                ? <img src={allImages[sel]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🏆</div>}
              {discount > 0 && <span className="badge-sale" style={{ position: 'absolute', top: 14, right: 14, padding: '6px 14px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>-{discount}%</span>}
              
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-s)' }}><ChevronRight size={16} /></button>
                  <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-s)' }}><ChevronLeft size={16} /></button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="thumb-row">
                {allImages.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 'var(--radius-s)', overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--accent)' : 'var(--g200)'}`, opacity: sel === idx ? 1 : 0.5, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.2s' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--g200)', padding: '2rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>رياضة</p>
            <h1 className="oswald" style={{ fontSize: 'clamp(1.5rem,3.5vw,2.25rem)', fontWeight: 700, color: 'var(--g900)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.15 }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', gap: 3, marginBottom: '1rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={14} style={{ fill: i < 4 ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />)}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem', marginBottom: '0.5rem' }}>
              <span className="oswald" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--g900)', lineHeight: 1 }}>{finalPrice.toLocaleString()}</span>
              <span style={{ fontWeight: 500, color: 'var(--g500)', fontSize: '1rem' }}>دج</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--g500)', marginBottom: '1.375rem' }}>الشحن يُحسب عند الطلب</p>

            {/* Stock */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 50, marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.82rem', background: inStock || autoGen ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.08)', color: inStock || autoGen ? 'var(--success)' : 'var(--danger)', border: `1px solid ${inStock || autoGen ? 'rgba(46,204,113,0.25)' : 'rgba(231,76,60,0.2)'}` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              
            </div>

            <div style={{ height: 1, background: 'var(--g200)', marginBottom: '1.5rem' }} />

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--g700)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>الباقات المتاحة</p>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: `1.5px solid ${selectedOffer === o.id ? 'var(--accent)' : 'var(--g200)'}`, borderRadius: 'var(--radius-s)', cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? 'rgba(233,69,96,0.04)' : 'transparent', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? 'var(--accent)' : 'var(--g400)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedOffer === o.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--g800)' }}>{o.name}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--g500)' }}>الكمية: {o.quantity}</p>
                      </div>
                    </div>
                    <span className="oswald" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>{o.price.toLocaleString()} دج</span>
                  </label>
                ))}
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--g700)', marginBottom: '0.625rem' }}>{attr.name}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {attr.variants.map((v: any) => {
                    const isSelected = selectedVariants[attr.name] === v.value;

                    // حالة الألوان
                    if (attr.displayMode === 'color') {
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          style={{
                            width: 28, height: 28, borderRadius: '50%', background: v.value, border: 'none', cursor: 'pointer',
                            outline: `3px solid ${isSelected ? 'var(--accent)' : 'transparent'}`, outlineOffset: 3, transition: 'outline 0.2s'
                          }}
                        />
                      );
                    }

                    // حالة الصور (جديد)
                    if (attr.displayMode === 'image') {
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          style={{
                            width: 40, height: 40, borderRadius: 'var(--radius-s)',
                            backgroundImage: `url(${v.value})`, backgroundSize: 'cover', backgroundPosition: 'center',
                            border: 'none', cursor: 'pointer',
                            outline: `3px solid ${isSelected ? 'var(--accent)' : 'transparent'}`, outlineOffset: 2, transition: 'all 0.2s'
                          }}
                        />
                      );
                    }

                    // الحالة الافتراضية (نصوص مثل المقاسات)
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleVariantSelection(attr.name, v.value)}
                        style={{
                          padding: '7px 16px', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--g300)'}`,
                          borderRadius: 'var(--radius-s)', fontWeight: 500, fontSize: '0.85rem',
                          background: isSelected ? 'var(--accent)' : '#fff', color: isSelected ? '#fff' : 'var(--g700)',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
                        }}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} />

            {product.desc && (
              <div style={{ marginTop: '2rem', paddingTop: '1.75rem', borderTop: '1px solid var(--g200)' }}>
                <p className="oswald" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--g900)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>وصف المنتج</p>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--g600)' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT FORM
══════════════════════════════════════════════════════════════ */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId: id })); } }, []);
  useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: any) => o.id === selectedOffer); if (off) return off.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const m = product.variantDetails.find((v: any) => vm(v, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);
  const getLiv = useCallback((): number => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
  const fp = getFP();
  const total = () => fp * fd.quantity + +getLiv();
  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = 'مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = 'رقم هاتف غير صالح (مثال: 0550123456)';
    if (!fd.customerWelaya) e.customerWelaya = 'مطلوب';
    if (!fd.customerCommune) e.customerCommune = 'مطلوب';
    return e;
  };
  const getVarId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find((v: any) => vm(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  const addToCart = () => {
    setIsAdded(true);
    const cart = JSON.parse(localStorage.getItem(domain) || '[]');
    cart.push({ ...fd, product, variantDetailId: getVarId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv(), addedAt: Date.now() });
    localStorage.setItem(domain, JSON.stringify(cart));
    initCount(cart.length);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate(); if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSub(true);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, productId: product.id, storeId: product.store.id, userId, selectedOffer, variantDetailId: getVarId(), platform: platform || 'store', finalPrice: fp, totalPrice: total(), priceLivraison: getLiv() });
      if (fd.customerId) localStorage.setItem('customerId', fd.customerId);
      router.push(`/${domain}/successfully`);
    } catch { } finally { setSub(false); }
  };

  return (
    <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--g200)', marginTop: '1.5rem' }}>
        {product.store?.cart && (
        <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
          <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.875rem', borderRadius: 50, cursor: isAdded ? 'default' : 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: '0.9rem', border: `1.5px solid ${isAdded ? 'var(--success)' : 'var(--g300)'}`, background: isAdded ? 'rgba(46,204,113,0.1)' : '#fff', color: isAdded ? 'var(--success)' : 'var(--g600)', transition: 'all 0.25s' }}>
            {isAdded ? <><CheckCircle2 size={15} className="anim-check" />أُضيف للسلة</> : <><ShoppingCart size={15} />أضف للسلة</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} className="btn-pri" style={{ flex: 1, padding: '0.875rem', borderRadius: 50 }}>
            اطلب الآن
          </button>
        </div>
      )}

      {(isOrderNow || !product.store?.cart) && (
        <div className="anim-fade-up">
          {product.store?.cart && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>بيانات التوصيل</p>
              <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--g300)', background: 'transparent', color: 'var(--g500)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 'var(--radius-s)' }}>
                <X size={11} /> إلغاء
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Qty */}
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>الكمية</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--g300)', borderRadius: 'var(--radius-s)', overflow: 'hidden' }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--g100)', border: 'none', cursor: 'pointer', color: 'var(--g700)', fontSize: '1.1rem' }}>-</button>
                <span className="oswald" style={{ width: 48, textAlign: 'center', fontSize: '1.2rem', fontWeight: 600 }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--g100)', border: 'none', cursor: 'pointer', color: 'var(--g700)', fontSize: '1.1rem' }}>+</button>
              </div>
            </div>

            <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
              <FR error={errors.customerName} label="الاسم">
                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder="الاسم الكامل" style={INP(!!errors.customerName)}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = errors.customerName ? 'var(--danger)' : 'var(--g300)'; }} />
              </FR>
              <FR error={errors.customerPhone} label="الهاتف">
                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder="0XXXXXXXXX" style={INP(!!errors.customerPhone)}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = errors.customerPhone ? 'var(--danger)' : 'var(--g300)'; }} />
              </FR>
            </div>
            <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
              <FR error={errors.customerWelaya} label="الولاية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--g400)', pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.customerWelaya), paddingRight: 34, fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = errors.customerWelaya ? 'var(--danger)' : 'var(--g300)'; }}>
                    <option value="">اختر الولاية</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label="البلدية">
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--g400)', pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.customerCommune), paddingRight: 34, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = errors.customerCommune ? 'var(--danger)' : 'var(--g300)'; }}>
                    <option value="">{loadingC ? '...' : 'اختر البلدية'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>

            {/* Delivery type */}
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>التوصيل</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: t }))} style={{ padding: '0.875rem', border: `1.5px solid ${fd.typeLivraison === t ? 'var(--accent)' : 'var(--g300)'}`, borderRadius: 'var(--radius-s)', textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === t ? 'rgba(233,69,96,0.05)' : '#fff', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', color: fd.typeLivraison === t ? 'var(--accent)' : 'var(--g600)', marginBottom: 4 }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                    {selW && <p className="oswald" style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === t ? 'var(--accent)' : 'var(--g500)' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} <span style={{ fontSize: '0.7rem', fontFamily: "'Inter',sans-serif", fontWeight: 400 }}>دج</span></p>}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ border: '1px solid var(--g200)', borderRadius: 'var(--radius-s)', marginBottom: '1.25rem', overflow: 'hidden' }}>
              <div style={{ padding: '9px 14px', background: 'var(--g50)', borderBottom: '1px solid var(--g200)' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--g600)', margin: 0 }}>ملخص الطلب</p>
              </div>
              {[{ l: 'المنتج', v: product.name.slice(0, 24) + (product.name.length > 24 ? '...' : '') }, { l: 'السعر', v: `${fp.toLocaleString()} دج` }, { l: 'الكمية', v: `× ${fd.quantity}` }, { l: 'التوصيل', v: selW ? `${getLiv().toLocaleString()} دج` : '—' }].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 14px', borderBottom: '1px solid var(--g100)', background: '#fff' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--g500)' }}>{row.l}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--g800)' }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 14px', background: 'var(--g50)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--g600)' }}>المجموع</span>
                <span className="oswald" style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--accent)' }}>{total().toLocaleString()} <span style={{ fontSize: '0.82rem', fontFamily: "'Inter',sans-serif", fontWeight: 400, color: 'var(--g500)' }}>دج</span></span>
              </div>
            </div>

            <button type="submit" disabled={sub} className="btn-pri" style={{ width: '100%', padding: '0.925rem', borderRadius: 50, opacity: sub ? 0.7 : 1, cursor: sub ? 'not-allowed' : 'pointer', marginBottom: 8 }}>
              {sub ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري...</> : '🛒 تأكيد الطلب'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--g400)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Lock size={11} style={{ color: 'var(--accent)' }} /> دفع آمن ومشفر
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CART
══════════════════════════════════════════════════════════════ */
export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore(s => s.initCount);

  useEffect(() => { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [domain, store]);
  useEffect(() => { if (!fd.customerWelaya) { setCommunes([]); return; } setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); }); }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getLiv = () => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; };
  const cartTotal = items.reduce((a, i) => a + (i.finalPrice * i.quantity), 0);
  const finalTotal = cartTotal + +getLiv();
  const update = (n: any[]) => { setItems(n); localStorage.setItem(domain, JSON.stringify(n)); initCount(n.length); };
  const changeQty = (i: number, d: number) => { const n = [...items]; n[i].quantity = Math.max(1, n[i].quantity + d); update(n); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!fd.customerName.trim()) er.name = 'مطلوب';
    if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = 'رقم هاتف غير صالح (مثال: 0550123456)';
    if (!fd.customerWelaya) er.w = 'مطلوب';
    if (!fd.customerCommune) er.c = 'مطلوب';
    if (Object.keys(er).length) { setErrors(er); return; }
    setErrors({}); setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
      setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
    } catch { } finally { setSubmitting(false); }
  };

  if (success) return (
    <div dir="rtl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--g50)' }}>
      <div className="anim-fade-up" style={{ textAlign: 'center', background: '#fff', padding: '4rem 2.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--g200)', maxWidth: 460, width: '100%', boxShadow: 'var(--shadow-m)' }}>
        <CheckCircle2 size={52} style={{ color: 'var(--success)', display: 'block', margin: '0 auto 1.5rem' }} />
        <h2 className="oswald" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--g900)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>تم استلام طلبك!</h2>
        <p style={{ color: 'var(--g600)', fontWeight: 400, marginBottom: '2rem', lineHeight: 1.7 }}>شكراً لثقتك. سنتواصل معك قريباً لتأكيد الطلب.</p>
        <Link href="/" className="btn-pri" style={{ display: 'inline-flex', padding: '12px 32px', borderRadius: 50 }}>العودة للمتجر</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir="rtl" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--g50)' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px solid var(--g200)', borderRadius: 'var(--radius)', maxWidth: 400, width: '100%', background: '#fff' }}>
        <ShoppingBag size={52} style={{ color: 'var(--g300)', display: 'block', margin: '0 auto 1.25rem' }} />
        <p className="oswald" style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--g500)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>سلة التسوق فارغة</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--g400)', marginBottom: '1.75rem' }}>أضف بعض المعدات وابدأ رحلتك!</p>
        <Link href="/" className="btn-pri" style={{ display: 'inline-flex', borderRadius: 50 }}>تسوق الآن</Link>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--g50)', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--g200)' }}>
          <h1 className="oswald" style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700, color: 'var(--g900)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>سلة التسوق</h1>
          <span style={{ fontSize: '0.875rem', color: 'var(--g500)' }}>{items.length} منتج</span>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--g200)', overflow: 'hidden', alignSelf: 'start' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1.125rem', borderBottom: '1px solid var(--g100)' }}>
                <div style={{ width: 80, height: 80, flexShrink: 0, overflow: 'hidden', borderRadius: 'var(--radius-s)', border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--g800)', fontSize: '0.875rem', lineHeight: 1.4, marginBottom: '0.25rem' }}>{item.product?.name}</h4>
                    <p className="oswald" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>{item.finalPrice?.toLocaleString()} دج</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--g300)', borderRadius: 'var(--radius-s)', overflow: 'hidden' }}>
                      <button onClick={() => changeQty(i, -1)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--g50)', border: 'none', cursor: 'pointer', fontSize: '0.9rem', transition: 'var(--tr)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--g100)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--g50)'; }}>-</button>
                      <span style={{ width: 32, textAlign: 'center', fontWeight: 600, fontSize: '0.85rem', lineHeight: '28px' }}>{item.quantity}</span>
                      <button onClick={() => changeQty(i, 1)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--g50)', border: 'none', cursor: 'pointer', fontSize: '0.9rem', transition: 'var(--tr)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--g100)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--g50)'; }}>+</button>
                    </div>
                    <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--g400)', cursor: 'pointer', fontSize: '0.875rem', transition: 'color 0.2s', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--g400)'; }}>
                      <Trash2 size={13} /> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.125rem', background: 'var(--g50)', borderTop: '1px solid var(--g200)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--g600)' }}>المجموع الفرعي</span>
              <span className="oswald" style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--g900)' }}>{cartTotal.toLocaleString()} دج</span>
            </div>
          </div>

          {/* Checkout */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--g200)', padding: '1.75rem', alignSelf: 'start' }}>
            <h3 className="oswald" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--g900)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>معلومات التوصيل</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                <FR error={errors.name} label="الاسم"><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={INP(!!errors.name)}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = errors.name ? 'var(--danger)' : 'var(--g300)'; }} /></FR>
                <FR error={errors.phone} label="الهاتف"><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={INP(!!errors.phone)}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = errors.phone ? 'var(--danger)' : 'var(--g300)'; }} /></FR>
              </div>
              <div className="form-row-2" style={{ marginBottom: '1.25rem' }}>
                <FR error={errors.w} label="الولاية">
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--g400)', pointerEvents: 'none' }} />
                    <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.w), paddingRight: 34, fontFamily: 'inherit' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = errors.w ? 'var(--danger)' : 'var(--g300)'; }}>
                      <option value="">اختر</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
                <FR error={errors.c} label="البلدية">
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--g400)', pointerEvents: 'none' }} />
                    <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.c), paddingRight: 34, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = errors.c ? 'var(--danger)' : 'var(--g300)'; }}>
                      <option value="">{loadingC ? '...' : 'اختر'}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                    </select>
                  </div>
                </FR>
              </div>

              {/* نوع التوصيل — جديد */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--g500)', textTransform: 'uppercase', marginBottom: '0.625rem', letterSpacing: '0.04em' }}>نوع التوصيل</p>
                <div className="delivery-grid">
                  {(['home', 'office'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFd(p => ({ ...p, typeLivraison: t }))}
                      style={{
                        padding: '0.875rem',
                        border: `1px solid ${fd.typeLivraison === t ? 'var(--accent)' : 'var(--g300)'}`,
                        borderRadius: 'var(--radius-s)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: fd.typeLivraison === t ? 'var(--g50)' : '#fff',
                        fontFamily: 'inherit',
                        transition: 'var(--tr)'
                      }}
                    >
                      <span style={{ display: 'block', fontSize: '1.25rem', marginBottom: '4px' }}>{t === 'home' ? '🏠' : '🏢'}</span>
                      <p style={{ fontWeight: 600, fontSize: '0.78rem', color: fd.typeLivraison === t ? 'var(--g800)' : 'var(--g500)' }}>{t === 'home' ? 'للبيت' : 'للمكتب'}</p>
                      {selW && <p className="oswald" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', marginTop: '3px' }}>{(t === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} دج</p>}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 'var(--radius-s)', padding: '1rem', marginBottom: '1.125rem' }}>
                {[{ l: 'المجموع الفرعي', v: cartTotal.toLocaleString() }, { l: 'التوصيل', v: getLiv() ? getLiv().toLocaleString() : '—' }].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--g200)', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--g600)' }}>{r.l}</span>
                    <span style={{ fontWeight: 600, color: 'var(--g800)' }}>{r.v} دج</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.375rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--g800)' }}>الإجمالي</span>
                  <span className="oswald" style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--accent)' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.82rem', fontFamily: "'Inter',sans-serif", fontWeight: 400, color: 'var(--g500)' }}>دج</span></span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-pri" style={{ width: '100%', padding: '0.925rem', borderRadius: 50, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري...</> : '🛒 تأكيد الطلب'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATIC PAGES
══════════════════════════════════════════════════════════════ */
const Shell = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
  <div dir="rtl" style={{ background: 'var(--g50)', minHeight: '100vh' }}>
    <div style={{ background: 'var(--primary)', padding: '5rem 1.5rem 3.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, var(--accent) 0%, transparent 50%)', opacity: 0.08, pointerEvents: 'none' }} />
      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {sub && <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.75rem' }}>{sub}</p>}
        <h1 className="oswald" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>{children}</div>
  </div>
);

const IB = ({ title, body, tag }: { title: string; body: string; tag?: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', padding: '1.5rem', marginBottom: '0.75rem', borderRadius: 'var(--radius-s)', border: '1px solid var(--g200)', background: '#fff', transition: 'var(--tr)' }}
    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-m)'; el.style.transform = 'translateY(-3px)'; }}
    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = ''; el.style.transform = ''; }}>
    <div style={{ flex: 1 }}>
      <h3 className="oswald" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--g900)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--g600)', fontWeight: 400 }}>{body}</p>
    </div>
    {tag && <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', background: 'rgba(233,69,96,0.08)', color: 'var(--accent)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 50, flexShrink: 0, whiteSpace: 'nowrap' }}>{tag}</span>}
  </div>
);

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية" sub="قانوني">
      <IB title="البيانات التي نجمعها" body="فقط اسمك ورقم هاتفك وعنوان التوصيل — ما هو ضروري لمعالجة طلبك. لا بيانات إضافية." />
      <IB title="الأمان والحماية" body="بياناتك محمية بتشفير قياسي وبنية تحتية آمنة. نستخدم بروتوكولات حماية متطورة." />
      <IB title="مشاركة البيانات" body="لا نبيع بياناتك. تُشارك فقط مع شركاء التوصيل الموثوقين لإتمام طلبك." tag="مضمون" />
    </Shell>
  );
}
export function Terms() {
  return (
    <Shell title="شروط الخدمة" sub="قانوني">
      <IB title="الطلبات والدفع" body="يتم تأكيد الطلبات عبر الهاتف قبل الشحن. لا رسوم مخفية. الدفع عند الاستلام." />
      <IB title="المنتجات الأصيلة" body="نضمن 100% أصالة جميع المنتجات المعروضة. لا مجال للمنتجات المقلدة." tag="صارم" />
      <IB title="القانون الحاكم" body="تخضع هذه الشروط لقوانين جمهورية الجزائر الديمقراطية الشعبية." />
    </Shell>
  );
}
export function Cookies() {
  return (
    <Shell title="ملفات الارتباط" sub="قانوني">
      <IB title="الكوكيز الأساسية" body="ضرورية للجلسات والسلة والدفع. لا يمكن تعطيلها." tag="مطلوب" />
      <IB title="كوكيز التحليلات" body="بيانات مجمعة لتحسين تجربة التسوق لديك." tag="اختياري" />
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id }); setSent(true); }
    catch { showError('حدث خطأ'); } finally { setLoading(false); }
  };
  return (
    <div dir="rtl" style={{ background: 'var(--g50)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--primary)', padding: '5rem 1.5rem 3.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, var(--accent) 0%, transparent 50%)', opacity: 0.08, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.75rem' }}>تواصل</p>
          <h1 className="oswald" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>نسعد بمساعدتك</h1>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div className="contact-layout">
          {/* Info */}
          <div>
            {[{ e: '📞', l: 'الهاتف', v: store?.contact?.phone || '—' }, { e: '📍', l: 'الموقع', v: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || '—' }, { e: '📧', l: 'البريد', v: store?.contact?.email || '—' }].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--g200)', borderRadius: 'var(--radius-s)', background: '#fff', marginBottom: '0.75rem', transition: 'var(--tr)' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.transform = 'translateX(-4px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--g200)'; el.style.transform = ''; }}>
                <div style={{ width: 44, height: 44, background: 'var(--g100)', borderRadius: 'var(--radius-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>{r.e}</div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{r.l}</p>
                  <p style={{ fontWeight: 600, color: 'var(--g800)', fontSize: '0.875rem' }}>{r.v}</p>
                </div>
              </div>
            ))}
            <div style={{ padding: '1rem', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 'var(--radius-s)', background: 'rgba(233,69,96,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span className="oswald" style={{ fontWeight: 600, color: 'var(--g900)', fontSize: '0.95rem' }}>متاحون الآن</span>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: '#fff', border: '1px solid var(--g200)', borderRadius: 'var(--radius)', padding: '2rem' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }} className="anim-fade-up">
                <CheckCircle2 size={52} style={{ color: 'var(--success)', display: 'block', margin: '0 auto 1.25rem' }} />
                <h2 className="oswald" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--g900)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>تم الإرسال!</h2>
                <p style={{ color: 'var(--g500)', lineHeight: 1.7 }}>سنرد عليك قريباً.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-row-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--g600)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>الاسم</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={INP()}
                      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = 'var(--g300)'; }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--g600)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>الهاتف</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={INP()}
                      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = 'var(--g300)'; }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--g600)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>البريد الإلكتروني</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={INP()}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = 'var(--g300)'; }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--g600)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>رسالتك</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...INP(), resize: 'none' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = 'var(--g300)'; }} />
                </div>
                <button type="submit" disabled={loading} className="btn-pri" style={{ borderRadius: 50, padding: '0.9rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري...</> : <>إرسال الرسالة <ArrowLeft size={15} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy />}
      {p === 'terms' && <Terms />}
      {p === 'cookies' && <Cookies />}
      {p === 'contact' && <Contact store={store} />}
    </>
  );
}