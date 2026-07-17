'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
    Star, Heart, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight,
    AlertCircle, Check, X, Phone, MapPin, CheckCircle2, ArrowLeft,
    Menu, Search, ShoppingCart, Minus, Plus, Trash2, Loader2, Package,
    Shield, Truck, Sparkles, Lock, Mail,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ══════════════════════════════════════════════════════════════
   PASTEL DREAM — Baby & Newborn Theme
   Palette: Lavender · Peach · Mint · Sky blue · Cream
   Font: Quicksand + Cormorant Garamond
══════════════════════════════════════════════════════════════ */
const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --lavender:   #C4B5FD;
    --lavender-lt:#EDE9FE;
    --lavender-dk:#7C3AED;
    --peach:      #FDBA74;
    --peach-lt:   #FEF3C7;
    --peach-dk:   #EA580C;
    --mint:       #6EE7B7;
    --mint-lt:    #D1FAE5;
    --mint-dk:    #059669;
    --sky:        #BAE6FD;
    --sky-lt:     #E0F2FE;
    --sky-dk:     #0284C7;
    --rose:       #FDA4AF;
    --rose-lt:    #FFE4E6;
    --cream:      #FFFBF0;
    --bg:         #FAF9F7;
    --white:      #FFFFFF;
    --text:       #374151;
    --text-mid:   #6B7280;
    --text-soft:  #9CA3AF;
    --border:     #E5E7EB;
    --shadow:     rgba(196,181,253,0.25);
  }

  body {
    font-family: 'Quicksand', sans-serif;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }
  a { text-decoration: none; color: inherit; }
  .font-serif { font-family: 'Cormorant Garamond', serif; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--lavender); border-radius: 99px; }

  /* ── Animations ── */
  @keyframes gentle-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes soft-fade    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cloud-drift  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes pulse-soft   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes spin-gentle  { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes check-in     { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

  .anim-float  { animation: gentle-float 4s ease-in-out infinite; }
  .anim-fade   { animation: soft-fade 0.6s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-pulse  { animation: pulse-soft 3s ease-in-out infinite; }
  .anim-check  { animation: check-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* ── Clouds ticker ── */
  .cloud-wrap  { overflow: hidden; white-space: nowrap; }
  .cloud-inner { display: inline-block; animation: cloud-drift 30s linear infinite; }

  /* ── Soft card hover ── */
  .soft-card {
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease, border-color 0.3s;
  }
  .soft-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 48px var(--shadow);
  }

  .btn-soft {
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease;
  }
  .btn-soft:hover  { transform: translateY(-2px); }
  .btn-soft:active { transform: translateY(1px); }

  /* ── Pastel pattern ── */
  .pastel-dots {
    background-image:
      radial-gradient(circle, rgba(196,181,253,0.2) 2px, transparent 2px),
      radial-gradient(circle, rgba(253,186,116,0.15) 2px, transparent 2px),
      radial-gradient(circle, rgba(110,231,183,0.12) 2px, transparent 2px);
    background-size: 32px 32px, 56px 56px, 44px 44px;
    background-position: 0 0, 14px 14px, 28px 28px;
  }

  /* ── Nav responsive ── */
  .nav-desktop-links  { display: none; align-items: center; gap: 1.5rem; }
  .nav-desktop-search { display: none; }
  .nav-mobile-btns    { display: flex; align-items: center; gap: 0.5rem; }
  @media (min-width: 1024px) {
    .nav-desktop-links  { display: flex; }
    .nav-desktop-search { display: block; }
    .nav-mobile-btns    { display: none; }
  }

  /* ── Grids ── */
  .products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); gap: 1.5rem; } }

  .trust-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  @media (min-width: 1024px) { .trust-grid { grid-template-columns: repeat(4, 1fr); } }

  .details-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 768px) { .details-layout { grid-template-columns: 1fr 1fr; gap: 3rem; } }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }
  @media (min-width: 540px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

  .cart-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 1024px) { .cart-layout { grid-template-columns: 1.1fr 1fr; gap: 3rem; } }

  .footer-cols {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.15);
  }
  @media (min-width: 768px) { .footer-cols { grid-template-columns: 1.8fr 1fr 1fr; } }

  .hero-actions { display: flex; flex-direction: column; gap: 0.875rem; }
  @media (min-width: 540px) { .hero-actions { flex-direction: row; align-items: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 540px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .thumb-row { display: flex; gap: 0.625rem; overflow-x: auto; padding-bottom: 4px; margin-top: 0.75rem; }
  .pagination { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 3rem; }
  .contact-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .contact-layout { grid-template-columns: 1fr 1.5fr; } }

  .cart-badge {
    position: absolute; top: -4px; right: -4px;
    width: 17px; height: 17px; border-radius: 50%;
    background: var(--lavender-dk); color: #fff;
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--bg);
  }
`;

/* ─── Floating cloud deco ─── */
const CloudDeco = ({ style = {} as any }) => (
    <svg viewBox="0 0 120 60" fill="currentColor" style={{ display: 'inline-block', ...style }}>
        <ellipse cx="60" cy="50" rx="55" ry="18" />
        <ellipse cx="35" cy="38" rx="28" ry="20" />
        <ellipse cx="70" cy="32" rx="32" ry="22" />
        <ellipse cx="95" cy="42" rx="22" ry="16" />
    </svg>
);

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

const variantMatches = (d: VariantDetail, sel: Record<string, string>) =>
    Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

/* ─── INPUT STYLE ─── */
const INP = (err?: boolean): React.CSSProperties => ({
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600,
    background: '#fff', border: `2px solid ${err ? '#FDA4AF' : 'var(--border)'}`,
    borderRadius: 14, color: 'var(--text)', outline: 'none',
    fontFamily: "'Quicksand', sans-serif", transition: 'border-color 0.2s', appearance: 'none'
});
const BTN_PRI: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '0.875rem 1.75rem', borderRadius: 50, border: 'none', cursor: 'pointer',
    fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.925rem',
    background: 'linear-gradient(135deg, var(--lavender-dk), #6D28D9)',
    color: '#fff', boxShadow: '0 6px 24px rgba(124,58,237,0.3)', transition: 'all 0.25s'
};

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
    <div>
        {label && <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>{label}</label>}
        {children}
        {error && <p style={{ fontSize: '0.72rem', color: '#F43F5E', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
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
  // Hero & Home sections
  heroBadge: 'العناية بطفلك بكل محبة',
  heroDefaultTitle: 'كل ما يحتاجه<br/>طفلك الصغير',
  heroDefaultSubtitle: '🌸 منتجات آمنة وناعمة مختارة بعناية لراحة طفلك وصحته منذ اليوم الأول.',
  footerDefaultSubtitle: '🌸 كل ما يحتاجه طفلك بأمان ومحبة. منتجات ناعمة لبداية حياة هانئة.',
  categoriesTitle: 'تسوقي بحسب الفئة',
  productsTitle: 'منتجاتنا المختارة',
  productsSubtitle: 'كل شيء يحتاجه طفلك 💫',
  bannerTitle: 'لأن طفلك يستحق الأفضل',
  bannerSubtitle: 'منتجات مختارة بعناية فائقة لتمنح طفلك أكبر قدر من الراحة والأمان',
  trustSafe: 'آمن تماماً', trustSafeDesc: 'خالٍ من المواد الضارة',
  trustFast: 'توصيل سريع', trustFastDesc: 'لجميع الولايات',
  trustQuality: 'جودة ممتازة', trustQualityDesc: 'منتجات فاخرة ومعتمدة',
  trustCare: 'بمحبة وعناية', trustCareDesc: 'لأطفالنا الأحبة',
  footerReplyMsg: 'نرد بكل محبة 🌸', footerReplyTime: 'خلال 24 ساعة',
  // Contact page
  contactPageTitle: 'تواصلي معنا',
  contactPageSubtitle: 'نحن هنا دائماً لمساعدتك 🌸',
  contactPhone: 'الهاتف', contactPhoneNA: 'غير متوفر',
  contactLocation: 'الموقع', contactLocationNA: 'الجزائر',
  contactEmail: 'البريد', contactEmailNA: 'غير متوفر',
  contactSentTitle: 'تم الإرسال!', contactSentDesc: 'سنرد عليك في أقرب وقت.',
  contactNameLabel: 'الاسم', contactPhoneLabel: 'الهاتف',
  contactEmailLabel: 'البريد الإلكتروني', contactMessageLabel: 'رسالتك',
  contactSendBtn: 'إرسال الرسالة', contactSending: 'جاري...',
  contactError: 'حدث خطأ',
  // Static pages
  privacyTitle: 'سياسة الخصوصية',
  termsTitle: 'الشروط والأحكام',
  cookiesTitle: 'ملفات الارتباط',
  privacy1T: 'البيانات التي نجمعها', privacy1D: 'نجمع فقط البيانات الضرورية لإتمام طلبك — الاسم، رقم الهاتف، والعنوان.',
  privacy2T: 'حماية بياناتك', privacy2D: 'نستخدم أحدث بروتوكولات التشفير لضمان أمان معلوماتك الشخصية.',
  privacy3T: 'سياسة المشاركة', privacy3D: 'لا نبيع أو نشارك بياناتك مع أطراف ثالثة. خصوصيتك أولويتنا.',
  terms1T: 'الطلبات والمدفوعات', terms1D: 'يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الدفع عند الاستلام.',
  terms2T: 'التوصيل', terms2D: 'نوفر خدمة التوصيل لجميع ولايات الجزائر بأفضل الأسعار.',
  terms3T: 'الضمانات', terms3D: 'نلتزم بأعلى معايير الجودة والسلامة في جميع منتجاتنا.',
  cookies1T: 'الملفات الأساسية', cookies1D: 'ضرورية لعمل سلة التسوق وحفظ بيانات جلستك.',
  cookies2T: 'تحسين التجربة', cookies2D: 'تساعدنا على تقديم تجربة تسوق مخصصة وأفضل لك.',
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
  // Hero & Home sections
  heroBadge: 'Prendre soin de votre bébé avec amour',
  heroDefaultTitle: 'Tout ce dont<br/>votre bébé a besoin',
  heroDefaultSubtitle: '🌸 Des produits sûrs et doux, soigneusement sélectionnés pour le confort et la santé de votre bébé.',
  footerDefaultSubtitle: '🌸 Tout ce dont votre bébé a besoin, avec sécurité et amour.',
  categoriesTitle: 'Parcourir par catégorie',
  productsTitle: 'Nos produits sélectionnés',
  productsSubtitle: 'Tout ce dont votre bébé a besoin 💫',
  bannerTitle: 'Parce que votre bébé mérite le meilleur',
  bannerSubtitle: 'Des produits choisis avec le plus grand soin pour offrir à votre bébé confort et sécurité',
  trustSafe: 'Totalement sûr', trustSafeDesc: 'Sans substances nocives',
  trustFast: 'Livraison rapide', trustFastDesc: 'Vers toutes les wilayas',
  trustQuality: 'Qualité premium', trustQualityDesc: 'Produits certifiés de luxe',
  trustCare: 'Avec amour', trustCareDesc: 'Pour nos chers enfants',
  footerReplyMsg: 'Nous répondons avec amour 🌸', footerReplyTime: 'Dans les 24h',
  // Contact page
  contactPageTitle: 'Contactez-nous',
  contactPageSubtitle: 'Nous sommes toujours là pour vous aider 🌸',
  contactPhone: 'Téléphone', contactPhoneNA: 'Non disponible',
  contactLocation: 'Adresse', contactLocationNA: 'Algérie',
  contactEmail: 'E-mail', contactEmailNA: 'Non disponible',
  contactSentTitle: 'Message envoyé !', contactSentDesc: 'Nous vous répondrons dans les plus brefs délais.',
  contactNameLabel: 'Nom', contactPhoneLabel: 'Téléphone',
  contactEmailLabel: 'Adresse e-mail', contactMessageLabel: 'Votre message',
  contactSendBtn: 'Envoyer le message', contactSending: 'Envoi...',
  contactError: 'Une erreur est survenue',
  // Static pages
  privacyTitle: 'Politique de confidentialité',
  termsTitle: "Conditions d'utilisation",
  cookiesTitle: 'Cookies',
  privacy1T: 'Données collectées', privacy1D: 'Nous collectons uniquement les données nécessaires à votre commande — nom, téléphone et adresse.',
  privacy2T: 'Protection de vos données', privacy2D: 'Nous utilisons les derniers protocoles de chiffrement pour sécuriser vos informations.',
  privacy3T: 'Politique de partage', privacy3D: 'Nous ne vendons ni ne partageons vos données avec des tiers. Votre vie privée est notre priorité.',
  terms1T: 'Commandes et paiements', terms1D: 'Les commandes sont confirmées par téléphone avant expédition. Paiement à la livraison.',
  terms2T: 'Livraison', terms2D: 'Nous livrons dans toutes les wilayas d\'Algérie aux meilleurs prix.',
  terms3T: 'Garanties', terms3D: 'Nous respectons les plus hauts standards de qualité et de sécurité pour tous nos produits.',
  cookies1T: 'Cookies essentiels', cookies1D: 'Nécessaires au fonctionnement du panier et à la sauvegarde de votre session.',
  cookies2T: 'Amélioration de l\'expérience', cookies2D: 'Nous aident à offrir une expérience d\'achat personnalisée et améliorée.',
};

const jsonEn = {
  dir: 'ltr',
  home: 'Home', contact: 'Contact', cart: 'Cart',
  search: 'Search...', searching: 'Searching...', noResults: 'No results', showAll: 'View all results →',
  all: 'All', noProducts: 'No products available', shopNow: 'Shop Now', searchResultsFor: 'Search results for:',
  fullName: 'Full Name', fullNamePh: 'Enter your name', errName: 'Name is required',
  phone: 'Phone Number', phonePh: '05xxxxxxxx', errPhone: 'Phone number is required', errPhoneInvalid: 'Invalid phone number',
  wilaya: 'Wilaya', errWilaya: 'Wilaya is required', wilayaPh: 'Choose Wilaya', wilayaNA: 'Delivery not available',
  commune: 'Commune', errCommune: 'Commune is required', communePh: 'Choose Commune', communeLoading: 'Loading...',
  deliveryType: 'Delivery Type', deliveryHome: 'Home Delivery', deliveryOffice: 'Post Office',
  qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total',
  subtotal: 'Subtotal', orderInfo: 'Order Info',
  addToCart: 'Add to Cart', orderNow: 'Order Now', confirmOrder: 'Confirm Order',
  sending: 'Sending...', back: 'Back', addedMsg: 'Added to cart successfully!', errSubmit: 'An error occurred while submitting',
  myCart: 'My Cart', cartEmpty: 'Cart is empty', cartEmptyDesc: 'You have not added any products yet',
  successTitle: 'Order sent successfully!', successDesc: 'We will contact you soon to confirm the details',
  backToShop: 'Back to Shopping', checkoutTitle: 'Complete Order',
  offersTitle: 'Available Offers', descTitle: 'Description',
  quickLinks: 'Quick Links', contactSect: 'Contact Us', privacy: 'Privacy', terms: 'Terms', rightsReserved: 'All rights reserved',
  // Hero & Home sections
  heroBadge: 'Caring for your baby with love',
  heroDefaultTitle: 'Everything your<br/>little one needs',
  heroDefaultSubtitle: '🌸 Safe and gentle products carefully selected for your baby\'s comfort and health.',
  footerDefaultSubtitle: '🌸 Everything your baby needs, safely and lovingly.',
  categoriesTitle: 'Browse by Category',
  productsTitle: 'Our Selected Products',
  productsSubtitle: 'Everything your baby needs 💫',
  bannerTitle: 'Because your baby deserves the best',
  bannerSubtitle: 'Products chosen with the utmost care to give your baby maximum comfort and safety',
  trustSafe: 'Totally Safe', trustSafeDesc: 'Free from harmful substances',
  trustFast: 'Fast Delivery', trustFastDesc: 'To all wilayas',
  trustQuality: 'Premium Quality', trustQualityDesc: 'Luxury certified products',
  trustCare: 'With Love', trustCareDesc: 'For our beloved children',
  footerReplyMsg: 'We reply with love 🌸', footerReplyTime: 'Within 24 hours',
  // Contact page
  contactPageTitle: 'Contact Us',
  contactPageSubtitle: 'We are always here to help you 🌸',
  contactPhone: 'Phone', contactPhoneNA: 'Not available',
  contactLocation: 'Location', contactLocationNA: 'Algeria',
  contactEmail: 'Email', contactEmailNA: 'Not available',
  contactSentTitle: 'Message sent!', contactSentDesc: 'We will get back to you as soon as possible.',
  contactNameLabel: 'Name', contactPhoneLabel: 'Phone',
  contactEmailLabel: 'Email Address', contactMessageLabel: 'Your message',
  contactSendBtn: 'Send Message', contactSending: 'Sending...',
  contactError: 'An error occurred',
  // Static pages
  privacyTitle: 'Privacy Policy',
  termsTitle: 'Terms & Conditions',
  cookiesTitle: 'Cookies',
  privacy1T: 'Data We Collect', privacy1D: 'We only collect data necessary to complete your order — name, phone number, and address.',
  privacy2T: 'Protecting Your Data', privacy2D: 'We use the latest encryption protocols to keep your personal information secure.',
  privacy3T: 'Sharing Policy', privacy3D: 'We never sell or share your data with third parties. Your privacy is our priority.',
  terms1T: 'Orders & Payments', terms1D: 'Orders are confirmed by phone before shipping. Cash on delivery.',
  terms2T: 'Delivery', terms2D: 'We deliver to all Algerian wilayas at the best prices.',
  terms3T: 'Guarantees', terms3D: 'We uphold the highest quality and safety standards across all our products.',
  cookies1T: 'Essential Cookies', cookies1D: 'Required for the shopping cart and session data to work.',
  cookies2T: 'Experience Improvement', cookies2D: 'Help us provide a personalized and better shopping experience.',
};

type Lang = 'ar' | 'fr' | 'en';
const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr, en: jsonEn };

export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Quicksand', sans-serif" }}>
            <style>{THEME_CSS}</style>
            <Navbar store={store} domain={domain} />
            <main>{children}</main>
            <Footer store={store} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════ */
export function Navbar({ store, domain }: { store: any; domain: string }) {
    const lang = getLang(store);
    const t = T[lang];
    const isRTL = lang === 'ar';
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [listSearch, setListSearch] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const router = useRouter();
    const count = useCartStore(s => s.count);
    const initCount = useCartStore(s => s.initCount);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 15);
        window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
    }, []);
    useEffect(() => {
        if (typeof window !== 'undefined' && domain) {
            try { initCount(JSON.parse(localStorage.getItem(domain) || '[]').length); } catch { initCount(0); }
        }
    }, [domain, initCount]);
    useEffect(() => {
        if (searchQuery.length < 2) { setListSearch([]); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); setListSearch(data.products || []); }
            catch { } finally { setLoading(false); }
        }, 380);
        return () => clearTimeout(t);
    }, [searchQuery, domain]);

    const doSearch = (e?: React.FormEvent) => { if (e) e.preventDefault(); if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setSearchQuery(''); setShowSearch(false); } };

    const Drop = () => (
        <div style={{
            paddingTop: 25,
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            left: 0,
            background: '#fff',
            border: '2px solid var(--lavender-lt)',
            borderRadius: 18,
            boxShadow: '0 16px 48px rgba(196,181,253,0.25)',
            zIndex: 200
        }}>
            <button
                className='absolute cursor-pointer hover:text-red-400 top-3 left-3'
                onClick={() => setSearchQuery('')}
            >
                <X size={14} />
            </button>

            <div style={{ maxHeight: 300, overflowY: 'auto', }}>
                {loading ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--lavender-dk)', fontSize: '0.875rem', fontWeight: 700 }}>🌸 {t.searching}</div>
                ) : listSearch.length > 0 ? (
                    <>
                        {listSearch.map((p: any) => (
                            <Link
                                href={`/product/${p.id}`}
                                key={p.id}
                                onClick={() => setSearchQuery('')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--lavender-lt)' }}
                            >
                                <img
                                    src={p.productImage || p.imagesProduct?.[0]?.imageUrl}
                                    style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--lavender-lt)', flexShrink: 0 }}
                                    alt=""
                                />
                                <div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 700,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {p.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--lavender-dk)', fontWeight: 700 }}>{p.price} {store?.currency || 'DZD'}</div>
                                </div>
                            </Link>
                        ))}

                        <button onClick={doSearch} style={{ width: '100%', padding: '12px', background: 'var(--lavender-lt)', border: 'none', borderTop: '1px solid var(--lavender)', color: 'var(--lavender-dk)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {t.showAll} <ArrowLeft size={14} />
                        </button>
                    </>
                ) : searchQuery.length >= 2 && (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.875rem' }}>{t.noResults} 🌷</div>
                )}
            </div>
        </div>
    );

    return (
        <>
        {store?.topBar?.enabled && store?.topBar?.text && (
          <div style={{ background: 'linear-gradient(90deg, #7C3AED 0%, #C4B5FD 50%, #FDBA74 100%)', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
            {store.topBar.text}
          </div>
        )}
        <nav dir={isRTL ? 'rtl' : 'ltr'} style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: scrolled ? 'rgba(250,249,247,0.95)' : 'var(--bg)',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: `1px solid ${scrolled ? 'var(--lavender-lt)' : 'transparent'}`,
            boxShadow: scrolled ? '0 4px 24px rgba(196,181,253,0.15)' : 'none',
            transition: 'all 0.35s ease'
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--lavender) 0%, var(--rose) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {(store.design.logoUrl && store.design.logoUrl !== '/default-logo.png') ? <img src={store.design.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{(store?.name || 'P')[0]}</span>}
                    </div>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{store?.name}</span>
                </Link>

                {/* Desktop search */}
                <div className="nav-desktop-search" style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
                    <form onSubmit={doSearch}>
                        <input type="text" placeholder={`${t.search} 🌸`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.75rem', borderRadius: 50, border: '2px solid var(--lavender-lt)', background: '#fff', fontSize: '0.875rem', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s', fontFamily: "'Quicksand', sans-serif" }}
                            onFocus={e => (e.target.style.borderColor = 'var(--lavender)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--lavender-lt)')} />
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)' }} />
                    </form>
                    {searchQuery.length >= 2 && <Drop />}
                </div>

                {/* Desktop links */}
                <div className="nav-desktop-links">
                    {[{ h: '/', l: t.home }, { h: '/contact', l: t.contact }].map(i => (
                        <Link key={i.h} href={i.h} style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-mid)', transition: 'color 0.2s', padding: '0.375rem 0.875rem', borderRadius: 50 }}
                            onMouseEnter={e => { const el = e.currentTarget; el.style.color = 'var(--lavender-dk)'; el.style.background = 'var(--lavender-lt)'; }}
                            onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--text-mid)'; el.style.background = 'transparent'; }}>
                            {i.l}
                        </Link>
                    ))}
                    {store?.cart !== false && (
                        <Link href="/cart" className="btn-soft" style={{ position: 'relative', width: 44, height: 44, borderRadius: 14, border: '2px solid var(--lavender-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lavender-dk)' }}>
                            <ShoppingCart size={18} />
                            {count > 0 && <span className="cart-badge">{count}</span>}
                        </Link>
                    )}
                </div>

                {/* Mobile */}
                <div className="nav-mobile-btns">
                    <button onClick={() => setShowSearch(!showSearch)} style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--lavender-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--lavender-dk)' }}><Search size={17} /></button>

                    {store?.cart !== false && (
                        <Link href="/cart" style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, border: '2px solid var(--lavender-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lavender-dk)' }}>
                            <ShoppingCart size={17} />
                            {count > 0 && <span className="cart-badge">{count}</span>}
                        </Link>
                    )}

                    <button onClick={() => setOpen(!open)} style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--lavender-lt)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--lavender-dk)' }}>
                        {open ? <X size={17} /> : <Menu size={17} />}
                    </button>
                </div>
            </div>

            {/* Mobile search */}
            {showSearch && (
                <div style={{ padding: '0.625rem 1.25rem', background: '#fff', borderTop: '1px solid var(--lavender-lt)', position: 'relative' }}>
                    <form onSubmit={doSearch} style={{ position: 'relative' }}>
                        <input autoFocus type="text" placeholder={t.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ ...INP(), padding: '0.75rem 1rem 0.75rem 2.75rem' }} />
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)' }} />
                    </form>
                    {searchQuery.length >= 2 && <Drop />}
                </div>
            )}

            {/* Mobile nav */}
            <div style={{ overflow: 'hidden', maxHeight: open ? 180 : 0, transition: 'max-height 0.3s ease', background: '#fff', borderTop: open ? '1px solid var(--lavender-lt)' : 'none' }}>
                <div style={{ padding: '0.5rem 1.25rem 1rem' }}>
                    {[{ h: '/', l: `🏠 ${t.home}` }, { h: '/contact', l: `💌 ${t.contact}` }].map(i => (
                        <Link key={i.h} href={i.h} onClick={() => setOpen(false)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--lavender-lt)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                            {i.l} <ArrowLeft size={14} style={{ color: 'var(--lavender-dk)' }} />
                        </Link>
                    ))}

                </div>
            </div>
        </nav>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — 3 أقسام
══════════════════════════════════════════════════════════════ */
export function Footer({ store }: any) {
    const lang = getLang(store);
    const t = T[lang];
    const isRTL = lang === 'ar';
    return (
        <footer dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #5B21B6 100%)', color: '#fff', padding: '4rem 1.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Cloud deco */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.08, pointerEvents: 'none' }}>
                <div className="cloud-wrap">
                    <div className="cloud-inner" style={{ color: '#fff' }}>
                        {Array(6).fill(null).map((_, i) => <CloudDeco key={i} style={{ width: 120, height: 60, margin: '0 2rem' }} />)}
                        {Array(6).fill(null).map((_, i) => <CloudDeco key={`b${i}`} style={{ width: 120, height: 60, margin: '0 2rem' }} />)}
                    </div>
                </div>
            </div>
            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div className="footer-cols">
                    {/* قسم 1 */}
                    <div>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '0.875rem' }}>{store?.name}</h3>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 300 }}>
                            {store?.hero?.subtitle?.substring(0, 90) || t.footerDefaultSubtitle}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', fontSize: '1.5rem' }}>
                            {['👶', '🌸', '🧸', '🌙', '⭐'].map((e, i) => (
                                <span key={i} style={{ animation: `gentle-float ${3 + i * 0.5}s ${i * 0.3}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>
                            ))}
                        </div>
                        <p style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} {store?.name}. {t.rightsReserved}</p>
                    </div>
                    {/* قسم 2 */}
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--peach)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>{t.quickLinks}</h4>
                        {[{ h: '/', l: t.home }, { h: '/cart', l: t.cart }, { h: '/contact', l: t.contact }, { h: '/Privacy', l: t.privacy }, { h: '/Terms', l: t.terms }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map((lnk, i) => (
                            <a key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.625rem', transition: 'all 0.2s' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#fff'; el.style.paddingRight = '8px'; }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(255,255,255,0.6)'; el.style.paddingRight = '0'; }}>
                                {lnk.l}
                            </a>
                        ))}
                    </div>
                    {/* قسم 3 */}
                    <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--peach)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>{t.contactSect}</h4>
                        {[
                            { e: '📞', v: store?.contact?.phone },
                            { e: '📍', v: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
                            { e: '📧', v: store?.contact?.email },
                        ].filter(r => r.v).map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.625rem' }}>
                                <span>{r.e}</span>{r.v}
                            </div>
                        ))}
                        <div style={{ marginTop: '1.5rem', padding: '1.125rem', borderRadius: 18, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mint)', boxShadow: '0 0 8px var(--mint)', display: 'inline-block' }} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{t.footerReplyMsg}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{t.footerReplyTime}</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* ══════════════════════════════════════════════════════════════
   CARD
══════════════════════════════════════════════════════════════ */
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
    const [hov, setHov] = useState(false);
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
    const palettes = [
        { bg: 'var(--lavender-lt)', accent: 'var(--lavender-dk)', tag: 'var(--lavender)' },
        { bg: 'var(--peach-lt)', accent: '#D97706', tag: 'var(--peach)' },
        { bg: 'var(--mint-lt)', accent: 'var(--mint-dk)', tag: 'var(--mint)' },
        { bg: 'var(--rose-lt)', accent: '#E11D48', tag: 'var(--rose)' },
        { bg: 'var(--sky-lt)', accent: 'var(--sky-dk)', tag: 'var(--sky)' },
    ];
    const idValue = typeof product.id === 'string' ? product.id.length : (product.id || 0);
    const pal = palettes[idValue % palettes.length] || palettes[0];

    return (
        <div className="soft-card" style={{ background: '#fff', border: `2px solid ${hov ? pal.accent : 'var(--border)'}`, borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '1/1', background: pal.bg, overflow: 'hidden' }}>
                {displayImage
                    ? <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🧸</div>}
                {discount > 0 && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: pal.accent, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>
                        -{discount}%
                    </div>
                )}
                <button style={{ position: 'absolute', top: 10, left: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)' }}>
                    <Heart size={14} />
                </button>
            </div>
            {/* Info */}
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: '0.5rem' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} style={{ fill: i < 4 ? '#FBBF24' : 'none', color: '#FBBF24' }} />)}
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                </h3>
                <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: pal.accent }}>{price.toLocaleString()}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)' }}>{store?.currency || 'DZD'}</span>
                        {orig > price && <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', textDecoration: 'line-through' }}>{orig.toLocaleString()}</span>}
                    </div>
                    <Link href={`/product/${product.slug || product.id}`} className="btn-soft" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        width: '100%', padding: '0.65rem', borderRadius: 50, fontSize: '0.83rem', fontWeight: 700,
                        background: hov ? pal.accent : pal.bg,
                        color: hov ? '#fff' : pal.accent,
                        border: `2px solid ${pal.accent}30`,
                        transition: 'all 0.25s'
                    }}>
                        {viewDetails}
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
    const lang = getLang(store);
    const t = T[lang];
    const isRTL = lang === 'ar';
    const products: any[] = store.products || [];
    const cats: any[] = store.categories || [];
    if (!page) page = 1;
    const countPage = Math.ceil((store.count || products.length) / 48);

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ── HERO ── */}
            <section className="pastel-dots" style={{ position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                {/* Cloud decoration */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.35, pointerEvents: 'none' }}>
                    <div className="cloud-wrap">
                        <div className="cloud-inner" style={{ color: 'var(--lavender)' }}>
                            {Array(6).fill(null).map((_, i) => <CloudDeco key={i} style={{ width: 160, height: 80, margin: '0 1rem' }} />)}
                            {Array(6).fill(null).map((_, i) => <CloudDeco key={`b${i}`} style={{ width: 160, height: 80, margin: '0 1rem' }} />)}
                        </div>
                    </div>
                </div>

                {/* Radial glow */}
                <div style={{ position: 'absolute', top: '20%', left: '60%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,181,253,0.25), transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '40%', right: '70%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(253,186,116,0.2), transparent 70%)', pointerEvents: 'none' }} />

                {store.hero?.imageUrl && (
                    <div style={{ position: 'absolute', inset: 0 }}>
                        <img src={store.hero.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12 }} />
                    </div>
                )}

                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '7rem 1.5rem 4rem', position: 'relative', zIndex: 1, width: '100%' }}>
                    <div className="anim-fade" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.5rem 1.25rem', borderRadius: 50, background: 'rgba(196,181,253,0.2)', border: '1.5px solid rgba(196,181,253,0.5)', marginBottom: '1.5rem' }}>
                        <Sparkles size={14} style={{ color: 'var(--lavender-dk)' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{store?.name} — {t.heroBadge}</span>
                    </div>
                    <h1 className="anim-fade font-serif" style={{ fontSize: 'clamp(2.75rem, 7vw, 5.5rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || t.heroDefaultTitle) }} />
                    <div style={{ height: 3, width: 80, borderRadius: 99, background: 'linear-gradient(90deg, var(--lavender), var(--rose), var(--peach))', marginBottom: '1.5rem' }} />
                    <p className="anim-fade" style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-mid)', maxWidth: 480, lineHeight: 1.75, marginBottom: '2.5rem' }}>
                        {store.hero?.subtitle || t.heroDefaultSubtitle}
                    </p>
                    <div className="hero-actions">
                        <a href="#products" className="btn-soft" style={{ ...BTN_PRI, textDecoration: 'none' }}>
                            {t.shopNow} 🌸
                        </a>
                        {store?.cart !== false && (
                            <Link href="/cart" className="btn-soft" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 1.75rem', borderRadius: 50, border: '2px solid var(--lavender)', background: '#fff', color: 'var(--lavender-dk)', fontWeight: 700, fontSize: '0.925rem' }}>
                                {t.cart}
                            </Link>
                        )}

                    </div>
                </div>
            </section>

            {/* ── TRUST ── */}
            <div style={{ background: '#fff', borderTop: '1px solid var(--lavender-lt)', borderBottom: '1px solid var(--lavender-lt)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
                    <div className="trust-grid" style={{ padding: '1.5rem 0' }}>
                        {[
                            { e: '🛡️', tl: t.trustSafe, d: t.trustSafeDesc },
                            { e: '🚀', tl: t.trustFast, d: t.trustFastDesc },
                            { e: '🌸', tl: t.trustQuality, d: t.trustQualityDesc },
                            { e: '💝', tl: t.trustCare, d: t.trustCareDesc },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', borderLeft: i < 3 ? '1px solid var(--lavender-lt)' : 'none' }}>
                                <span style={{ fontSize: '1.75rem' }}>{item.e}</span>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{item.tl}</p>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-soft)' }}>{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CATEGORIES ── */}
            {cats.length > 0 && (
                <section style={{ padding: '4rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
                    <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, textAlign: 'center', color: 'var(--text)', marginBottom: '2rem' }}>
                        {t.categoriesTitle}
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.625rem' }}>
                        {cats.map((cat: any, idx: number) => {
                            const cs = ['var(--lavender-dk)', 'var(--mint-dk)', '#D97706', '#E11D48', 'var(--sky-dk)'];
                            const lts = ['var(--lavender-lt)', 'var(--mint-lt)', 'var(--peach-lt)', 'var(--rose-lt)', 'var(--sky-lt)'];
                            const c = cs[idx % cs.length]; const lt = lts[idx % lts.length];
                            return (
                                <Link key={cat.id} href={`?category=${cat.id}`} className="btn-soft" style={{ padding: '0.625rem 1.5rem', borderRadius: 50, border: `2px solid ${c}30`, color: c, background: lt, fontSize: '0.875rem', fontWeight: 700, transition: 'all 0.25s' }}
                                    onMouseEnter={e => { const el = e.currentTarget; el.style.background = c; el.style.color = '#fff'; }}
                                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = lt; el.style.color = c; }}>
                                    {cat.name}
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── PRODUCTS ── */}
            <section id="products" style={{ padding: '1rem 1.5rem 6rem', maxWidth: 1280, margin: '0 auto' }}>
                <h2 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, textAlign: 'center', color: 'var(--text)', marginBottom: '0.5rem' }}>
                    {t.productsTitle}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2.5rem' }}>{t.productsSubtitle}</p>

                {products.length === 0 ? (
                    <div className="pastel-dots" style={{ padding: '5rem', textAlign: 'center', border: '2px dashed var(--lavender)', borderRadius: 24, background: 'var(--lavender-lt)' }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🧸</span>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', color: 'var(--lavender-dk)' }}>{t.noProducts}</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((p: any) => {
                            const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
                            const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
                            return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails={t.shopNow} />;
                        })}
                    </div>
                )}

                {countPage > 1 && (
                    <div className="pagination" dir="rtl">
                        <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 12, border: '2px solid var(--lavender-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: 'var(--lavender-dk)', opacity: page <= 1 ? 0.3 : 1 }}>❮</Link>
                        {Array.from({ length: countPage }).map((_, i) => {
                            const pn = i + 1; const isA = Number(page) === pn;
                            return (
                                <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, border: `2px solid ${isA ? 'var(--lavender-dk)' : 'var(--lavender-lt)'}`, background: isA ? 'var(--lavender-dk)' : '#fff', color: isA ? '#fff' : 'var(--text-mid)' }}>
                                    {pn}
                                </Link>
                            );
                        })}
                        <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false} style={{ width: 38, height: 38, borderRadius: 12, border: '2px solid var(--lavender-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: 'var(--lavender-dk)', opacity: page >= countPage ? 0.3 : 1 }}>❯</Link>
                    </div>
                )}
            </section>

            {/* ── SOFT BANNER ── */}
            <section style={{ background: 'linear-gradient(135deg, var(--lavender-lt), var(--rose-lt), var(--peach-lt))', padding: '5rem 1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.25rem', animation: 'gentle-float 4s ease-in-out infinite' }}>👶</span>
                <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '1rem' }}>
                    {t.bannerTitle}
                </h2>
                <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-mid)', maxWidth: 500, margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    {t.bannerSubtitle}
                </p>
                <a href="#products" className="btn-soft" style={{ ...BTN_PRI, textDecoration: 'none' }}>
                    {t.shopNow} 🌸
                </a>
            </section>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   DETAILS
══════════════════════════════════════════════════════════════ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, inStock, autoGen, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
    const lang = getLang(store || product?.store);
    const t = T[lang];
    const isRTL = lang === 'ar';
    const [sel, setSel] = useState(0);

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--bg)', paddingBottom: '4rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                <div className="details-layout">
                    {/* Gallery */}
                    <div style={{top: 84 }}>
                        <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 24, overflow: 'hidden', background: 'var(--lavender-lt)', border: '2px solid var(--lavender-lt)' }}>
                            {allImages[sel] ? <img src={allImages[sel]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🧸</div>}
                            {discount > 0 && <div style={{ position: 'absolute', top: 14, right: 14, background: 'var(--lavender-dk)', color: '#fff', padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700 }}>-{discount}%</div>}
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
                                    <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
                                </>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="thumb-row">
                                {allImages.map((img: string, idx: number) => (
                                    <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 62, height: 62, borderRadius: 14, overflow: 'hidden', border: `2px solid ${sel === idx ? 'var(--lavender-dk)' : 'var(--border)'}`, opacity: sel === idx ? 1 : 0.55, cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.2s' }}>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <div style={{ background: '#fff', borderRadius: 24, padding: '2rem', border: '2px solid var(--lavender-lt)' }}>
                            <h1 className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem', lineHeight: 1.2 }}>{product.name}</h1>
                            <div style={{ display: 'flex', gap: 3, marginBottom: '1.25rem' }}>
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} style={{ fill: i < 4 ? '#FBBF24' : 'none', color: '#FBBF24' }} />)}
                            </div>
                            <div style={{ background: 'var(--lavender-lt)', borderRadius: 18, padding: '1.125rem', marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.375rem' }}>{t.price}</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                                    <span className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{finalPrice.toLocaleString()}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-mid)' }}>{store?.currency || 'DZD'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 1rem', borderRadius: 50, fontWeight: 700, fontSize: '0.82rem', marginBottom: '1.5rem', background: autoGen ? 'var(--peach-lt)' : inStock ? 'var(--mint-lt)' : 'var(--rose-lt)', color: autoGen ? '#D97706' : inStock ? 'var(--mint-dk)' : '#E11D48' }}>
                                
                            </div>

                            {product.offers?.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    {product.offers.map((o: any) => (
                                        <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: `2px solid ${selectedOffer === o.id ? 'var(--lavender-dk)' : 'var(--border)'}`, borderRadius: 16, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? 'var(--lavender-lt)' : 'transparent', transition: 'all 0.2s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? 'var(--lavender-dk)' : 'var(--border)'}`, background: selectedOffer === o.id ? 'var(--lavender-dk)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {selectedOffer === o.id && <Check size={11} color="#fff" />}
                                                </div>
                                                <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.name}</p>
                                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600 }}>{t.qty}: {o.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{o.price.toLocaleString()} {store?.currency || 'DZD'}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {allAttrs.map((attr: any) => (
                                <div key={attr.id} style={{ marginBottom: '1.25rem' }}>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.625rem' }}>
                                        {attr.name}
                                    </p>

                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {attr.variants.map((v: any) => {
                                            const isSelected = selectedVariants[attr.name] === v.value;

                                            // حالة الألوان
                                            if (attr.displayMode === 'color') {
                                                return (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => handleVariantSelection(attr.name, v.value)}
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: '50%',
                                                            background: v.value,
                                                            border: '1px solid rgba(0,0,0,0.1)',
                                                            cursor: 'pointer',
                                                            outline: `2px solid ${isSelected ? 'var(--lavender-dk)' : 'transparent'}`,
                                                            outlineOffset: 2,
                                                            transition: '0.2s all'
                                                        }}
                                                        title={v.name}
                                                    />
                                                );
                                            }

                                            // حالة الصور (مثل صور القماش أو نقشات معينة)
                                            if (attr.displayMode === 'image') {
                                                return (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => handleVariantSelection(attr.name, v.value)}
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 10, // حواف مربعة قليلاً تبدو أفضل للصور
                                                            backgroundImage: `url(${v.value})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            border: isSelected ? '2px solid var(--lavender-dk)' : '2px solid var(--border)',
                                                            cursor: 'pointer',
                                                            transition: '0.2s all'
                                                        }}
                                                    />
                                                );
                                            }

                                            // الحالة الافتراضية (نصوص مثل المقاسات S, M, L)
                                            return (
                                                <button
                                                    key={v.id}
                                                    onClick={() => handleVariantSelection(attr.name, v.value)}
                                                    style={{
                                                        padding: '0.4rem 1.125rem',
                                                        border: `2px solid ${isSelected ? 'var(--lavender-dk)' : 'var(--border)'}`,
                                                        borderRadius: 50,
                                                        fontWeight: 700,
                                                        fontSize: '0.85rem',
                                                        background: isSelected ? 'var(--lavender-lt)' : '#fff',
                                                        color: isSelected ? 'var(--lavender-dk)' : 'var(--text-mid)',
                                                        cursor: 'pointer',
                                                        fontFamily: 'inherit',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {v.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} store={store} />

                            {product.desc && (
                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--lavender-lt)' }}>
                                    <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.875rem' }}>{t.descTitle}</h3>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.8, color: 'var(--text-mid)' }}
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT FORM
══════════════════════════════════════════════════════════════ */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store }: ProductFormProps & { store?: any }) {
    const lang = getLang(store || product?.store);
    const t = T[lang];
    const isRTL = lang === 'ar';
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
    useEffect(() => {
        if (!fd.customerWelaya) { setCommunes([]); return; }
        setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
    }, [fd.customerWelaya]);

    const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
    const getFP = useCallback((): number => {
        const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
        const off = product.offers?.find((o: any) => o.id === selectedOffer);
        if (off) return off.price;
        if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
            const m = product.variantDetails.find((v: any) => variantMatches(v, selectedVariants));
            if (m && m.price !== -1) return m.price;
        }
        return base;
    }, [product, selectedOffer, selectedVariants]);
    const getLiv = useCallback((): number => { if (!selW) return 0; return fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice; }, [selW, fd.typeLivraison]);
    const fp = getFP();
    const total = () => fp * fd.quantity + +getLiv();
    const validate = () => {
        const e: Record<string, string> = {};
        if (!fd.customerName.trim()) e.customerName = t.errName;
        if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhoneInvalid;
        if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
        if (!fd.customerCommune) e.customerCommune = t.errCommune;
        return e;
    };
    const getVarId = useCallback(() => {
        if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
        return product.variantDetails.find((v: any) => variantMatches(v, selectedVariants))?.id;
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
        <div style={{ paddingTop: '1.5rem', borderTop: '2px solid var(--lavender-lt)', marginTop: '1.5rem' }}>
        {product.store?.cart && (
                <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
                    <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0.875rem', borderRadius: 50, cursor: isAdded ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', border: `2px solid ${isAdded ? 'var(--mint-dk)' : 'var(--lavender)'}`, background: isAdded ? 'var(--mint-lt)' : '#fff', color: isAdded ? 'var(--mint-dk)' : 'var(--lavender-dk)', transition: 'all 0.25s' }}>
                        {isAdded ? <><CheckCircle2 size={15} className="anim-check" /> {t.addedMsg}</> : <><ShoppingCart size={15} /> {t.addToCart}</>}
                    </button>
                    <button onClick={() => setIsOrderNow(true)} className="btn-soft" style={{ flex: 1, ...BTN_PRI, width: 'auto', borderRadius: 50 }}>
                        {t.orderNow} 🌸
                    </button>
                </div>
            )}

            {(isOrderNow || !product.store?.cart) && (
                <div className="anim-fade">
                    {product.store?.cart && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{t.orderInfo}</p>
                            <button onClick={() => setIsOrderNow(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.375rem 0.75rem', borderRadius: 50, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--text-soft)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                <X size={11} /> {t.back}
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                            <FR error={errors.customerName} label={t.fullName}>
                                <input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} style={INP(!!errors.customerName)} />
                            </FR>
                            <FR error={errors.customerPhone} label={t.phone}>
                                <input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} style={INP(!!errors.customerPhone)} />
                            </FR>
                        </div>
                        <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                            <FR error={errors.customerWelaya} label={t.wilaya}>
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)', pointerEvents: 'none' }} />
                                    <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.customerWelaya), paddingLeft: 32, fontFamily: 'inherit' }}>
                                        <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                            <FR error={errors.customerCommune} label={t.commune}>
                                <div style={{ position: 'relative' }}>
                                    <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)', pointerEvents: 'none' }} />
                                    <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.customerCommune), paddingLeft: 32, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}>
                                        <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                    </select>
                                </div>
                            </FR>
                        </div>

                        <div style={{ marginBottom: '0.875rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.5rem' }}>{t.deliveryType}</p>
                            <div className="delivery-grid">
                                {(['home', 'office'] as const).map(dlvType => (
                                    <button key={dlvType} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: dlvType }))} style={{ padding: '0.875rem', border: `2px solid ${fd.typeLivraison === dlvType ? 'var(--lavender-dk)' : 'var(--border)'}`, borderRadius: 16, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === dlvType ? 'var(--lavender-lt)' : '#fff', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                                        <span style={{ display: 'block', fontSize: '1.375rem', marginBottom: 4 }}>{dlvType === 'home' ? '🏠' : '🏢'}</span>
                                        <p style={{ fontWeight: 700, fontSize: '0.82rem', color: fd.typeLivraison === dlvType ? 'var(--lavender-dk)' : 'var(--text-soft)' }}>{dlvType === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                                        {selW && <p className="font-serif" style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === dlvType ? 'var(--lavender-dk)' : 'var(--text-soft)' }}>{(dlvType === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} {store?.currency || 'DZD'}</p>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '0.875rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.5rem' }}>{t.qty}</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '2px solid var(--lavender-lt)', borderRadius: 50, overflow: 'hidden', background: '#fff' }}>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lavender-dk)' }}><Minus size={14} /></button>
                                <span style={{ width: 44, textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 700 }}>{fd.quantity}</span>
                                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lavender-dk)' }}><Plus size={14} /></button>
                            </div>
                        </div>

                        {/* Summary */}
                        <div style={{ background: 'var(--lavender-lt)', borderRadius: 20, padding: '1.125rem', marginBottom: '1.25rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.75rem' }}>{t.orderInfo}</p>
                            {[
                                { l: t.price, v: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : '') },
                                { l: t.delivery, v: selW ? `${getLiv().toLocaleString()} ${store?.currency || 'DZD'}` : '—' },
                            ].map(r => (
                                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(196,181,253,0.3)' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-mid)' }}>{r.l}</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>{r.v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.375rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--lavender-dk)' }}>{t.total}</span>
                                <span className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{total().toLocaleString()} <span style={{ fontSize: '0.85rem', fontFamily: "'Quicksand', sans-serif", fontWeight: 600 }}>{store?.currency || 'DZD'}</span></span>
                            </div>
                        </div>

                        <button type="submit" disabled={sub} className="btn-soft" style={{ ...BTN_PRI, width: '100%', opacity: sub ? 0.7 : 1, cursor: sub ? 'not-allowed' : 'pointer' }}>
                            {sub ? <><Loader2 size={16} style={{ animation: 'spin-gentle 1s linear infinite' }} /> {t.sending}</> : `🌸 ${t.confirmOrder}`}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-soft)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <Lock size={11} style={{ color: 'var(--lavender)' }} />
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
    const lang = getLang(store);
    const t = T[lang];
    const isRTL = lang === 'ar';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const er: Record<string, string> = {};
        if (!fd.customerName.trim()) er.name = t.errName;
        if (!fd.customerPhone.trim() || !/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) er.phone = t.errPhoneInvalid;
        if (!fd.customerWelaya) er.w = t.errWilaya;
        if (!fd.customerCommune) er.c = t.errCommune;
        if (Object.keys(er).length) { setErrors(er); return; }
        setErrors({}); setSubmitting(true);
        try {
            await axios.post(`${API_URL}/orders/create`, items.map(i => ({ ...fd, productId: i.productId, storeId: i.storeId, userId: i.userId, selectedOffer: i.selectedOffer, variantDetailId: i.variantDetailId, selectedVariants: i.selectedVariants, platform: i.platform || 'store', finalPrice: i.finalPrice, totalPrice: finalTotal, priceLivraison: +getLiv(), quantity: i.quantity, customerId: i.customerId || '', priceLoss: selW?.livraisonReturn ?? 0 })));
            setSuccess(true); localStorage.removeItem(domain); setItems([]); initCount(0);
        } catch { } finally { setSubmitting(false); }
    };

    if (success) return (
        <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
            <div className="anim-fade" style={{ textAlign: 'center', background: '#fff', padding: '4rem 2.5rem', borderRadius: 28, border: '2px solid var(--lavender-lt)', maxWidth: 460, width: '100%', boxShadow: '0 12px 40px var(--shadow)' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.25rem', animation: 'gentle-float 3s ease-in-out infinite' }}>🌸</span>
                <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.625rem' }}>{t.successTitle}</h2>
                <p style={{ color: 'var(--text-mid)', fontWeight: 600, marginBottom: '2rem', lineHeight: 1.7 }}>{t.successDesc} 💝</p>
                <Link href="/" className="btn-soft" style={{ ...BTN_PRI, textDecoration: 'none', display: 'inline-flex' }}>{t.backToShop}</Link>
            </div>
        </div>
    );

    if (!items.length) return (
        <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
            <div className="pastel-dots" style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--lavender)', borderRadius: 28, maxWidth: 400, width: '100%', background: 'var(--lavender-lt)' }}>
                <ShoppingBag size={52} style={{ color: 'var(--lavender)', display: 'block', margin: '0 auto 1.25rem', opacity: 0.5 }} />
                <p className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '1.75rem' }}>{t.cartEmpty} 🌸</p>
                <Link href="/" className="btn-soft" style={{ ...BTN_PRI, textDecoration: 'none', display: 'inline-flex' }}>{t.shopNow}</Link>
            </div>
        </div>
    );

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2.5rem 1.5rem 5rem' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '2rem' }}>🛒 {t.myCart}</h1>
                <div className="cart-layout">
                    {/* Items */}
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px solid var(--lavender-lt)', overflow: 'hidden', alignSelf: 'start' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--lavender-lt)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--lavender-lt)' }}>
                            <Package size={17} style={{ color: 'var(--lavender-dk)' }} />
                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: 'var(--lavender-dk)', fontSize: '1rem' }}>{t.myCart} ({items.length})</span>
                        </div>
                        {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--lavender-lt)' }}>
                                <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 76, height: 76, borderRadius: 16, objectFit: 'cover', border: '2px solid var(--lavender-lt)', flexShrink: 0 }} alt="" />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{item.product?.name}</h4>
                                    <p className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{item.finalPrice?.toLocaleString()} {store?.currency || 'DZD'}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 600, marginTop: '0.2rem' }}>{t.qty}: {item.quantity}</p>
                                </div>
                                <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--border)', cursor: 'pointer', alignSelf: 'center', display: 'flex', padding: '0.375rem', borderRadius: 8, transition: 'color 0.2s' }}
                                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--rose)')}
                                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--border)')}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <div style={{ padding: '1rem 1.25rem', background: 'var(--lavender-lt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--lavender-dk)' }}>{t.subtotal}</span>
                            <span className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{cartTotal.toLocaleString()} {store?.currency || 'DZD'}</span>
                        </div>
                    </div>

                    {/* Checkout */}
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px solid var(--lavender-lt)', padding: '1.75rem', alignSelf: 'start' }}>
                        <h3 className="font-serif" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--lavender-dk)', marginBottom: '1.5rem' }}>{t.checkoutTitle}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row-2" style={{ marginBottom: '0.75rem' }}>
                                <FR error={errors.name} label={t.fullName}><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} style={INP(!!errors.name)} /></FR>
                                <FR error={errors.phone} label={t.phone}><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} style={INP(!!errors.phone)} /></FR>
                            </div>
                            <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                                <FR error={errors.w} label={t.wilaya}>
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)', pointerEvents: 'none' }} />
                                        <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...INP(!!errors.w), paddingLeft: 32, fontFamily: 'inherit' }}>
                                            <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                                        </select>
                                    </div>
                                </FR>
                                <FR error={errors.c} label={t.commune}>
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lavender)', pointerEvents: 'none' }} />
                                        <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...INP(!!errors.c), paddingLeft: 32, opacity: !fd.customerWelaya ? 0.5 : 1, fontFamily: 'inherit' }}>
                                            <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                                        </select>
                                    </div>
                                </FR>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--lavender-dk)', textTransform: 'uppercase', marginBottom: '0.625rem', letterSpacing: '0.04em' }}>🚚 {t.deliveryType}</p>
                                <div className="delivery-grid">
                                    {(['home', 'office'] as const).map(dlvType => (
                                        <button
                                            key={dlvType}
                                            type="button"
                                            onClick={() => setFd(p => ({ ...p, typeLivraison: dlvType }))}
                                            style={{
                                                padding: '0.875rem',
                                                border: `2px solid ${fd.typeLivraison === dlvType ? 'var(--lavender)' : 'var(--lavender-lt)'}`,
                                                borderRadius: 16,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                background: fd.typeLivraison === dlvType ? 'var(--lavender-lt)' : '#fff',
                                                fontFamily: 'inherit',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: 4 }}>{dlvType === 'home' ? '🏠' : '🏢'}</span>
                                            <p style={{ fontWeight: 700, fontSize: '0.8rem', color: fd.typeLivraison === dlvType ? 'var(--lavender-dk)' : 'var(--text-soft)' }}>{dlvType === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                                            {selW && <p className="font-serif" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--lavender-dk)', marginTop: 3 }}>{(dlvType === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} {store?.currency || 'DZD'}</p>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: 'var(--lavender-lt)', borderRadius: 18, padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(196,181,253,0.35)' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-mid)' }}>{t.subtotal}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cartTotal.toLocaleString()} {store?.currency || 'DZD'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.625rem', marginBottom: '0.625rem', borderBottom: '1px solid rgba(196,181,253,0.35)' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-mid)' }}>{t.delivery}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{getLiv() ? `${getLiv().toLocaleString()} ${store?.currency || 'DZD'}` : '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--lavender-dk)' }}>{t.total}</span>
                                    <span className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--lavender-dk)' }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.85rem', fontFamily: "'Quicksand', sans-serif" }}>{store?.currency || 'DZD'}</span></span>
                                </div>
                            </div>

                            <button type="submit" disabled={submitting} className="btn-soft" style={{ ...BTN_PRI, width: '100%', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                                {submitting ? <><Loader2 size={16} style={{ animation: 'spin-gentle 1s linear infinite' }} /> {t.sending}</> : `🌸 ${t.confirmOrder}`}
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
const Shell = ({ title, emoji, dir, children }: { title: string; emoji: string; dir?: string; children: React.ReactNode }) => (
    <div dir={dir || 'rtl'} style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="pastel-dots" style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--lavender-lt), var(--rose-lt))' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'gentle-float 4s ease-in-out infinite' }}>{emoji}</span>
            <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--lavender-dk)' }}>{title}</h1>
        </div>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>{children}</div>
    </div>
);
const IB = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div style={{ display: 'flex', gap: '1.125rem', padding: '1.25rem', marginBottom: '0.75rem', borderRadius: 20, border: '2px solid var(--lavender-lt)', background: '#fff', transition: 'all 0.3s', cursor: 'default' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lavender)'; el.style.boxShadow = '0 8px 28px var(--shadow)'; el.style.transform = 'translateY(-3px)'; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lavender-lt)'; el.style.boxShadow = ''; el.style.transform = ''; }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--lavender), var(--rose))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
        <div><h3 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.375rem' }}>{title}</h3><p style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.7, color: 'var(--text-mid)' }}>{desc}</p></div>
    </div>
);

export function Privacy({ store }: { store?: any }) {
    const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
    return <Shell emoji="🔒" title={t.privacyTitle} dir={isRTL ? 'rtl' : 'ltr'}><IB icon={<Shield size={18} />} title={t.privacy1T} desc={t.privacy1D} /><IB icon={<Lock size={18} />} title={t.privacy2T} desc={t.privacy2D} /><IB icon={<Shield size={18} />} title={t.privacy3T} desc={t.privacy3D} /></Shell>;
}
export function Terms({ store }: { store?: any }) {
    const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
    return <Shell emoji="📋" title={t.termsTitle} dir={isRTL ? 'rtl' : 'ltr'}><IB icon={<CheckCircle2 size={18} />} title={t.terms1T} desc={t.terms1D} /><IB icon={<Truck size={18} />} title={t.terms2T} desc={t.terms2D} /><IB icon={<Shield size={18} />} title={t.terms3T} desc={t.terms3D} /></Shell>;
}
export function Cookies({ store }: { store?: any }) {
    const lang = getLang(store); const t = T[lang]; const isRTL = lang === 'ar';
    return <Shell emoji="🍪" title={t.cookiesTitle} dir={isRTL ? 'rtl' : 'ltr'}><IB icon={<Shield size={18} />} title={t.cookies1T} desc={t.cookies1D} /><IB icon={<Sparkles size={18} />} title={t.cookies2T} desc={t.cookies2D} /></Shell>;
}

export function Contact({ store }: { store: any }) {
    const lang = getLang(store);
    const t = T[lang];
    const isRTL = lang === 'ar';
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
        catch { showError(t.contactError); } finally { setLoading(false); }
    };
    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <div className="pastel-dots" style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--lavender-lt), var(--rose-lt))' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'gentle-float 4s ease-in-out infinite' }}>💌</span>
                <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--lavender-dk)' }}>{t.contactPageTitle}</h1>
                <p style={{ color: 'var(--text-mid)', fontWeight: 600, marginTop: '0.5rem' }}>{t.contactPageSubtitle}</p>
            </div>
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
                <div className="contact-layout">
                    <div>
                        {[{ e: '📞', l: t.contactPhone, v: store?.contact?.phone || t.contactPhoneNA }, { e: '📍', l: t.contactLocation, v: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || t.contactLocationNA }, { e: '📧', l: t.contactEmail, v: store?.contact?.email || t.contactEmailNA }].map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem', borderRadius: 18, border: '2px solid var(--lavender-lt)', background: '#fff', marginBottom: '0.75rem', transition: 'all 0.25s' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lavender)'; el.style.boxShadow = '0 8px 24px var(--shadow)'; }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lavender-lt)'; el.style.boxShadow = ''; }}>
                                <span style={{ fontSize: '2rem' }}>{r.e}</span>
                                <div><p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.2rem' }}>{r.l}</p><p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{r.v}</p></div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px solid var(--lavender-lt)', padding: '2rem' }}>
                        {sent ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }} className="anim-fade">
                                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'gentle-float 3s ease-in-out infinite' }}>🌸</span>
                                <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--lavender-dk)', marginBottom: '0.5rem' }}>{t.contactSentTitle}</h2>
                                <p style={{ color: 'var(--text-mid)', fontWeight: 600, lineHeight: 1.7 }}>{t.contactSentDesc}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-row-2">
                                    <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>{t.contactNameLabel}</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={INP()} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>{t.contactPhoneLabel}</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={INP()} /></div>
                                </div>
                                <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>{t.contactEmailLabel}</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={INP()} /></div>
                                <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>{t.contactMessageLabel}</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...INP(), resize: 'none' }} /></div>
                                <button type="submit" disabled={loading} className="btn-soft" style={{ ...BTN_PRI, opacity: loading ? 0.7 : 1 }}>
                                    {loading ? <><Loader2 size={16} style={{ animation: 'spin-gentle 1s linear infinite' }} /> {t.contactSending}</> : <>🌸 {t.contactSendBtn}</>}
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
            {p === 'privacy' && <Privacy store={store} />}
            {p === 'terms' && <Terms store={store} />}
            {p === 'cookies' && <Cookies store={store} />}
            {p === 'contact' && <Contact store={store} />}
        </>
    );
}