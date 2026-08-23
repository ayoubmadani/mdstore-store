'use client';
import { showError } from '@/lib/showError';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight,
  AlertCircle, X, Phone,
  CheckCircle2, ArrowLeft, Package,
  Menu, Search, ShoppingCart, ShoppingBag, Minus, Plus,
  Trash2, Loader2, MapPin, Shield, Truck, Home as HomeIcon, Sofa,
  Mail,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const W  = '#C49A6C';
const WD = '#A07850';
const WL = 'rgba(196,154,108,0.1)';
const WB = '#F0E6D8';
const BG = '#FAF7F4';
const CARD = '#FFFFFF';
const INK = '#2C1810';
const SUB = '#7D6E5F';
const BD = '#E8E0D8';

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', sans-serif; background: ${BG}; color: ${INK}; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${BG}; }
  ::-webkit-scrollbar-thumb { background: ${WB}; border-radius: 10px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes checkPop { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes glb-ov-in { from { opacity:0; } to { opacity:1; } }
  @keyframes glb-ov-panel { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .anim-fade-up { animation: fadeUp 0.35s ease both; }
  .anim-check   { animation: checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  .nav-desktop { display: none; align-items: center; gap: 1.5rem; }
  .nav-mobile  { display: flex; gap: 0.5rem; }
  @media (min-width: 1024px) { .nav-desktop { display: flex; } .nav-mobile { display: none; } }

  .cats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
  @media (min-width: 500px) { .cats-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 768px) { .cats-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (min-width: 1100px) { .cats-grid { grid-template-columns: repeat(5, 1fr); } }

  .products-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
  @media (min-width: 768px)  { .products-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

  .hc-annbar { background: ${W}; color: #fff; overflow: hidden; height: 32px; display: flex; align-items: center; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.07em; }
  @keyframes hcMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .hc-marquee-track { display: inline-flex; white-space: nowrap; animation: hcMarquee 26s linear infinite; }

  .hc-card { background: ${CARD}; border-radius: 16px; overflow: hidden; border: 1px solid ${BD}; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column; }
  .hc-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(196,154,108,0.18); }
  .hc-card:hover .hc-img { transform: scale(1.06); }
  .hc-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.55s ease; }
  .hc-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: ${INK}; color: #fff; font-size: 0.82rem; font-weight: 600; padding: 0.75rem 1rem; border: none; cursor: pointer; transition: background 0.2s; font-family: 'Cairo', sans-serif; text-decoration: none; }
  .hc-btn:hover { background: ${W}; }
  .hc-card:hover .hc-btn { background: ${W}; }

  .trust-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; border: 1px solid ${BD}; border-radius: 12px; overflow: hidden; }
  @media (min-width: 768px) { .trust-row { grid-template-columns: repeat(4, 1fr); } }

  .details-inner { display: grid; grid-template-columns: 1fr; gap: 1.5rem; padding: 1rem; }
  .gallery-container { position: relative; top: 0; width: 100%; }
  .info-container { background: ${CARD}; border-radius: 16px; border: 1px solid ${BD}; padding: 1.5rem; }
  @media (min-width: 768px) {
    .details-inner { grid-template-columns: 1fr 1fr; gap: 3rem; padding: 2.5rem; }
    .gallery-container { position: sticky; top: 100px; z-index: 10; }
    .info-container { padding: 2rem; }
  }

  .form-row-2 { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
  @media (min-width: 500px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }

  .cart-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .cart-inner { grid-template-columns: 1.2fr 1fr; gap: 3rem; } }

  .contact-inner { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .contact-inner { grid-template-columns: 1fr 2fr; } }

  .footer-inner { display: grid; grid-template-columns: 1fr; gap: 2.5rem; padding-bottom: 2.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(232,224,216,0.15); }
  @media (min-width: 768px) { .footer-inner { grid-template-columns: 2fr 1fr 1fr 1fr; } }

  .hero-inner { display: grid; grid-template-columns: 1fr; align-items: center; gap: 2rem; }
  @media (min-width: 900px) { .hero-inner { grid-template-columns: 1fr 1fr; gap: 3rem; } }

  .hero-actions { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .hero-actions { flex-direction: row; align-items: center; } }

  .cart-add-btns { display: flex; flex-direction: column; gap: 0.75rem; }
  @media (min-width: 500px) { .cart-add-btns { flex-direction: row; } }

  .delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .thumb-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; overflow-x: auto; padding-bottom: 4px; }
  .pagination { display: flex; justify-content: center; gap: 0.375rem; flex-wrap: wrap; margin-top: 3rem; }

  a { text-decoration: none; color: inherit; }
  .price-mono { font-variant-numeric: tabular-nums; }

  .glb-search-ov {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(250,247,244,0.97); backdrop-filter: blur(20px);
    overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
    animation: glb-ov-in 0.2s ease;
  }
  .glb-search-panel { max-width: 640px; margin: 0 auto; padding: 5rem 1.5rem 4rem; animation: glb-ov-panel 0.28s ease; direction: rtl; }
  .glb-search-form { border-bottom: 1.5px solid ${W}; display: flex; align-items: center; margin-bottom: 2rem; }
  .glb-search-input { flex: 1; font-size: 1.375rem; border: none; background: transparent; color: ${INK}; outline: none; padding: 0.5rem 0.5rem 0.75rem; font-family: 'Cairo', sans-serif; direction: rtl; }
  .glb-search-input::placeholder { color: ${WB}; }
  .glb-search-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; direction: rtl; }
  .glb-search-card { display: block; background: ${CARD}; border-radius: 12px; border: 1px solid ${BD}; overflow: hidden; transition: all 0.2s; text-decoration: none; color: inherit; }
  .glb-search-card:hover { border-color: ${W}; box-shadow: 0 4px 16px rgba(196,154,108,0.12); }
  .glb-search-card-info { padding: 0.625rem 0.75rem; direction: rtl; }
`;

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
  store?: any;
}

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some(e => e.attrName === n && e.value === v));
}
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wid: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return data || []; } catch { return []; } };

const S = {
  input: { width: '100%', padding: '0.7rem 0.875rem', background: '#fff', border: `1px solid ${BD}`, borderRadius: 10, fontSize: '0.9rem', color: INK, outline: 'none', transition: 'border-color 0.15s', appearance: 'none' } as React.CSSProperties,
  inputErr: { borderColor: '#DC2626' } as React.CSSProperties,
  btnPrimary: { width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: W, color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '0.875rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Cairo', sans-serif" } as React.CSSProperties,
};


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
  cookies: 'الكوكيز',
  rightsReserved: 'جميع الحقوق محفوظة',
  // Topbar / Logo
  topBarFallback: 'توصيل لجميع ولايات الجزائر',
  logoSubtitle: 'أثاث وديكور',
  footerSubtitle: 'أثاث وديكور منزلي بأجواء دافئة ومريحة.',
  // Hero
  heroBadge: 'أثاث وديكور منزلي',
  heroTitleFallback: 'منزلك يستحق<br/><em style="color:#C49A6C;font-style:normal">الأجمل</em>',
  heroSubtitleFallback: 'أثاث وقطع ديكور بأجواء دافئة ومريحة تحوّل بيتك إلى مكان تحبّ العودة إليه.',
  heroCTA: 'تصفح المنتجات',
  stat1: 'قطعة أثاث', stat2: 'ولاية', stat3: 'جودة مضمونة',
  // Trust bar
  trust1t: 'توصيل لـ 58 ولاية', trust1s: 'سريع وآمن',
  trust2t: 'دفع عند الاستلام', trust2s: 'بدون مخاطر',
  trust3t: 'أثاث عالي الجودة', trust3s: 'متين ومريح',
  trust4t: 'تصاميم حصرية', trust4s: 'لكل بيت',
  // Products
  browseCategories: 'تصفح الفئات',
  allProducts: 'جميع المنتجات',
  productsAvailable: 'منتج متوفر',
  viewDetails: 'عرض',
  discount: 'خصم',
  productBadge: 'أثاث وديكور',
  // Contact page
  contactTitle: 'تواصل معنا',
  responseTime: 'نرد في غضون ساعة',
  messageSent: 'تم الإرسال!',
  messageSentDesc: 'سنرد عليك في أقرب وقت.',
  sendAnother: 'إرسال رسالة أخرى',
  email: 'البريد الإلكتروني',
  message: 'الرسالة',
  sendMessage: 'إرسال الرسالة',
  currency: 'دج',
  // Privacy
  privacyTitle: 'سياسة الخصوصية',
  privacyD1t: 'البيانات التي نجمعها',
  privacyD1b: 'نجمع فقط المعلومات الضرورية لمعالجة طلباتكم، مثل الاسم، رقم الهاتف، وعنوان التوصيل.',
  privacyD2t: 'حماية البيانات',
  privacyD2b: 'تُخزن جميع البيانات بشكل مشفر. نستخدم بروتوكولات حماية معتمدة لضمان أمان معلوماتكم.',
  privacyD3t: 'مشاركة المعلومات',
  privacyD3b: 'لا نقوم ببيع أو مشاركة بياناتكم مع أي جهات خارجية باستثناء شركاء التوصيل.',
  // Terms
  termsTitle: 'شروط الاستخدام',
  termsD1t: 'الحساب والمسؤولية',
  termsD1b: 'المستخدم مسؤول عن دقة البيانات المدخلة وعن الحفاظ على سرية حسابه.',
  termsD2t: 'الطلبات والمدفوعات',
  termsD2b: 'يتم تأكيد الطلبات عبر الهاتف قبل الشحن. الأسعار المعلنة هي الأسعار النهائية.',
  termsD3t: 'القانون الحاكم',
  termsD3b: 'تخضع كافة التعاملات للقوانين المعمول بها في جمهورية الجزائر الديمقراطية الشعبية.',
  // Cookies
  cookiesTitle: 'ملفات الارتباط',
  cookiesD1t: 'الملفات الأساسية',
  cookiesD1b: 'نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل سلة المشتريات وأمان جلسة الدخول.',
  cookiesD2t: 'تحسين التجربة',
  cookiesD2b: 'نستخدم بعض الملفات لفهم كيفية استخدام الموقع وتطوير تجربة التصفح.',
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
  cookies: 'Cookies',
  rightsReserved: 'Tous droits réservés.',
  // Topbar / Logo
  topBarFallback: 'Livraison dans toutes les wilayas',
  logoSubtitle: 'Mobilier & Déco',
  footerSubtitle: 'Mobilier et décoration intérieure dans une ambiance chaleureuse.',
  // Hero
  heroBadge: 'Mobilier & Décoration',
  heroTitleFallback: 'Votre maison mérite<br/><em style="color:#C49A6C;font-style:normal">le meilleur</em>',
  heroSubtitleFallback: 'Des meubles et accessoires déco qui transforment votre maison en un endroit où vous aimez revenir.',
  heroCTA: 'Voir les produits',
  stat1: 'pièces', stat2: 'wilayas', stat3: 'qualité garantie',
  // Trust bar
  trust1t: 'Livraison dans 58 wilayas', trust1s: 'Rapide et sécurisé',
  trust2t: 'Paiement à la livraison', trust2s: 'Sans risque',
  trust3t: 'Mobilier haut de gamme', trust3s: 'Durable et confortable',
  trust4t: 'Designs exclusifs', trust4s: 'Pour chaque maison',
  // Products
  browseCategories: 'Parcourir les catégories',
  allProducts: 'Tous les produits',
  productsAvailable: 'produits disponibles',
  viewDetails: 'Voir',
  discount: 'Réduction',
  productBadge: 'Mobilier & Déco',
  // Contact page
  contactTitle: 'Contactez-nous',
  responseTime: 'Réponse dans l\'heure',
  messageSent: 'Message envoyé !',
  messageSentDesc: 'Nous vous répondrons dès que possible.',
  sendAnother: 'Envoyer un autre message',
  email: 'E-mail',
  message: 'Message',
  sendMessage: 'Envoyer le message',
  currency: 'DZD',
  // Privacy
  privacyTitle: 'Politique de confidentialité',
  privacyD1t: 'Données collectées',
  privacyD1b: 'Nous collectons uniquement les informations nécessaires au traitement de vos commandes : nom, numéro de téléphone et adresse de livraison.',
  privacyD2t: 'Protection des données',
  privacyD2b: 'Toutes les données sont stockées de manière chiffrée. Nous utilisons des protocoles de sécurité certifiés pour protéger vos informations.',
  privacyD3t: 'Partage des informations',
  privacyD3b: 'Nous ne vendons ni ne partageons vos données avec des tiers, à l\'exception de nos partenaires de livraison.',
  // Terms
  termsTitle: 'Conditions d\'utilisation',
  termsD1t: 'Compte et responsabilité',
  termsD1b: 'L\'utilisateur est responsable de l\'exactitude des données saisies et de la confidentialité de son compte.',
  termsD2t: 'Commandes et paiements',
  termsD2b: 'Les commandes sont confirmées par téléphone avant expédition. Les prix affichés sont les prix définitifs.',
  termsD3t: 'Droit applicable',
  termsD3b: 'Toutes les transactions sont régies par les lois en vigueur en République Algérienne Démocratique et Populaire.',
  // Cookies
  cookiesTitle: 'Politique des cookies',
  cookiesD1t: 'Cookies essentiels',
  cookiesD1b: 'Nous utilisons des cookies essentiels pour assurer le bon fonctionnement du panier et la sécurité de la session.',
  cookiesD2t: 'Amélioration de l\'expérience',
  cookiesD2b: 'Nous utilisons certains cookies pour comprendre comment le site est utilisé et améliorer votre expérience de navigation.',
};

type Lang = 'ar' | 'fr' | 'en';
const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr as any, en: jsonFr as any };

export default function Main({ store, children, domain }: any) {
  const pathname = usePathname();
  const t = T[getLang(store)];
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div dir={t.dir} style={{ minHeight: '100vh', background: BG }}>
      <style>{THEME_CSS}</style>
      <Navbar store={store} domain={domain} />
      <main>{children}</main>
      <Footer store={store} />
    </div>
  );
}

export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);
  const t = T[getLang(store)];

  useEffect(() => {
    if (typeof window !== 'undefined' && domain) {
      try { const s = localStorage.getItem(domain); initCount(JSON.parse(s || '[]').length); } catch { initCount(0); }
    }
  }, [domain, initCount]);

  useEffect(() => {
    if (showSearch) { setTimeout(() => searchInputRef.current?.focus(), 80); }
    else { setSearchQuery(''); setListSearch([]); }
  }, [showSearch]);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await axios.get(`${API_URL}/products/public/${domain}`, { params: { search: searchQuery } }); setListSearch(data.products || []); }
      catch { } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, domain]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setListSearch([]); setShowSearch(false); }
  };

  return (
    <>
      <div className="hc-annbar">
        <div className="hc-marquee-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} style={{ padding: '0 48px' }}>✦ {store?.topBar?.text || t.topBarFallback} ✦</span>
          ))}
        </div>
      </div>
      <nav dir={t.dir} style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(250,247,244,0.97)' : CARD, backdropFilter: 'blur(14px)', borderBottom: `1px solid ${BD}`, boxShadow: scrolled ? '0 4px 24px rgba(44,24,16,0.08)' : 'none', transition: 'all 0.25s' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <Link href="/" style={{ flexShrink: 0 }}>
            {store?.design?.logoUrl && store.design.logoUrl !== '/default-logo.png' && !imgError ? (
              <img src={store.design.logoUrl} style={{ height: 36, objectFit: 'contain', maxWidth: 160, display: 'block' }} alt={store?.name || ''} onError={() => setImgError(true)} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 34, height: 34, background: WL, border: `1px solid ${WB}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HomeIcon size={16} color={W} />
                </div>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: INK, display: 'block', lineHeight: 1.15 }}>{store?.name || 'Home Comforts'}</span>
                  <span style={{ fontSize: '0.58rem', color: SUB }}>{t.logoSubtitle}</span>
                </div>
              </div>
            )}
          </Link>

          <div className="nav-desktop" style={{ flex: 1, justifyContent: 'center' }}>
            {[{ h: '/', l: t.home }, { h: '/contact', l: t.contact }].map(i => (
              <Link key={i.h} href={i.h} style={{ fontSize: '0.875rem', fontWeight: 500, color: SUB, padding: '0.3rem 0.875rem', borderRadius: 8, transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = WD; (e.currentTarget as HTMLAnchorElement).style.background = WL; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = SUB; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
                {i.l}
              </Link>
            ))}
          </div>

          <div className="nav-desktop" style={{ flexShrink: 0, gap: '0.75rem' }}>
            <button onClick={() => setShowSearch(true)} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB, transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = W; (e.currentTarget as HTMLButtonElement).style.color = W; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BD; (e.currentTarget as HTMLButtonElement).style.color = SUB; }}>
              <Search size={15} />
            </button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: W, color: '#fff', height: 38, padding: '0 1.125rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, transition: 'background 0.18s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = WD)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = W)}>
                <ShoppingCart size={14} /> {t.cart}
                {count > 0 && <span style={{ background: '#fff', color: W, fontSize: 10, fontWeight: 800, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
          </div>

          <div className="nav-mobile">
            <button onClick={() => setShowSearch(true)} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB }}><Search size={15} /></button>
            {store?.cart !== false && (
              <Link href="/cart" style={{ position: 'relative', background: W, color: '#fff', width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={15} />
                {count > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#fff', color: W, fontSize: 9, fontWeight: 800, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
              </Link>
            )}
            <button onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${BD}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: SUB }}>
              {open ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>
        <div style={{ overflow: 'hidden', maxHeight: open ? 200 : 0, transition: 'max-height 0.25s ease', background: CARD, borderTop: open ? `1px solid ${BD}` : 'none' }}>
          <div style={{ padding: '0.5rem 1.5rem 1rem' }}>
            {[{ h: '/', l: t.home }, { h: '/contact', l: t.contact }].map(i => (
              <Link key={i.h} href={i.h} onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: `1px solid ${BD}`, fontSize: '0.9rem', fontWeight: 500, color: INK }}>
                {i.l} <ArrowLeft size={14} style={{ color: W }} />
              </Link>
            ))}

          </div>
        </div>
      </nav>

      {showSearch && (
        <div className="glb-search-ov" onClick={e => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div className="glb-search-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: SUB }}>{t.search}</span>
              <button onClick={() => setShowSearch(false)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BD}`, background: CARD, color: SUB, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
            </div>
            <form className="glb-search-form" onSubmit={handleSearch}>
              <Search size={18} style={{ color: W, flexShrink: 0, marginLeft: 10 }} />
              <input ref={searchInputRef} className="glb-search-input" type="text" placeholder={t.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </form>
            {loading && <p style={{ textAlign: 'center', color: W, fontSize: '0.82rem', padding: '2rem' }}>{t.searching}</p>}
            {!loading && listSearch.length > 0 && (
              <>
              <div className="glb-search-grid">
                {listSearch.map((p: any) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} className="glb-search-card" onClick={() => setShowSearch(false)}>
                    {(p.productImage || p.imagesProduct?.[0]?.imageUrl) && (
                      <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                    )}
                    <div className="glb-search-card-info">
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: INK, marginBottom: 3, lineHeight: 1.35 }}>{p.name}</p>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: W }}>{Number(p.price).toLocaleString()} {t.currency}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button onClick={handleSearch} style={{ width: '100%', padding: '12px', background: WL, border: 'none', borderTop: `1px solid rgba(196,154,108,0.2)`, color: W, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {t.showAll} <ArrowLeft size={14} />
              </button>
              </>
            )}
            {!loading && searchQuery.length >= 2 && listSearch.length === 0 && (
              <p style={{ textAlign: 'center', color: WB, fontSize: '0.875rem', padding: '3rem' }}>{t.noResults}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Footer({ store }: any) {
  const t = T[getLang(store)];
  return (
    <footer dir={t.dir} style={{ background: '#2C1810', color: 'rgba(255,255,255,0.4)', marginTop: 80, padding: '3.5rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ width: 30, height: 30, background: 'rgba(196,154,108,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HomeIcon size={14} color={W} />
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{store?.name}</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.85, maxWidth: 280, color: 'rgba(255,255,255,0.45)' }}>
              {store?.hero?.subtitle?.substring(0, 90) || t.footerSubtitle}
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)' }}>© {new Date().getFullYear()} {store?.name}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: W, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1.125rem' }}>{t.quickLinks}</h4>
            {[{ h: '/', l: t.home }, { h: '/cart', l: t.cart }, { h: '/contact', l: t.contact }].filter(lnk => lnk.h !== '/cart' || store?.cart !== false).map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.6rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = W)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                {lnk.l}
              </Link>
            ))}
          </div>
          
          {/* قانوني */}
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>{t.legalNav}</p>
            {[{ h: '/Privacy', l: t.privacy }, { h: '/Terms', l: t.terms }, { h: '/cookies', l: t.cookies }].map((lnk, i) => (
              <Link key={i} href={lnk.h} style={{ display: 'block', fontSize: '0.875rem', color: 'inherit', marginBottom: '0.5rem', opacity: 0.6, transition: 'opacity 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.6')}>
              {lnk.l}
            </Link>
            ))}
          </div>
<div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: W, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1.125rem' }}>{t.contactSect}</h4>
            {[
              { icon: <Phone size={13} />, val: store?.contact?.phone },
              { icon: <Mail size={13} />, val: store?.contact?.email },
              { icon: <MapPin size={13} />, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: W, flexShrink: 0 }}>{r.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const t = T[getLang(store)];
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const orig = product.priceOriginal ? parseFloat(String(product.priceOriginal)) : 0;
  return (
    <div className="hc-card">
      <div style={{ position: 'relative', aspectRatio: '3/4', background: WL, overflow: 'hidden' }}>
        {displayImage
          ? <img className="hc-img" src={displayImage} alt={product.name} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sofa size={40} color={WB} /></div>
        }
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: '#C4664A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>-{discount}% {t.discount}</div>
        )}
        <div style={{ position: 'absolute', bottom: 0, inset: 'auto 0 0 0', height: 80, background: 'linear-gradient(to top, rgba(44,24,16,0.55) 0%, transparent 100%)' }} />
      </div>
      <div style={{ padding: '0.875rem 1rem 0', flex: 1 }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, color: W, marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>{store?.name}</p>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: INK, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>{product.name}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: '0.875rem' }}>
          <span className="price-mono" style={{ fontSize: '1.375rem', fontWeight: 700, color: WD }}>{price.toLocaleString()}</span>
          <span style={{ fontSize: '0.68rem', color: SUB }}>{store.currency || t.currency}</span>
          {orig > price && <span className="price-mono" style={{ fontSize: '0.72rem', color: WB, textDecoration: 'line-through', marginRight: 2 }}>{orig.toLocaleString()}</span>}
        </div>
      </div>
      <Link href={`/product/${product.slug || product.id}`} className="hc-btn">
        {viewDetails} <ArrowLeft size={13} />
      </Link>
    </div>
  );
}

export function Home({ store, page }: any) {
  const products: any[] = store.products || [];
  const cats: any[] = store.categories || [];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const t = T[getLang(store)];
  if (!page) page = 1;
  const countPage = Math.ceil((store.count || products.length) / 48);

  return (
    <div dir={t.dir}>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#2C1810' }}>
        {store.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22, display: 'block' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(44,24,16,0.92) 0%, rgba(44,24,16,0.7) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: 'clamp(4rem,10vw,7rem) 1.5rem clamp(3.5rem,8vw,6rem)' }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(196,154,108,0.18)', border: '1px solid rgba(196,154,108,0.35)', borderRadius: 6, padding: '0.35rem 1rem', marginBottom: '1.75rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: W, display: 'inline-block' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: WB, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>{t.heroBadge}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', fontWeight: 700, color: '#FBF8F5', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: '1.25rem' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.hero?.title || t.heroTitleFallback) }} />
            <p style={{ fontSize: '1.05rem', color: 'rgba(251,248,245,0.65)', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 500 }}>
              {store.hero?.subtitle || t.heroSubtitleFallback}
            </p>
            <div className="hero-actions">
              <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: W, color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '0.9rem 2rem', borderRadius: 8, transition: 'background 0.18s', textDecoration: 'none' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = WD)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = W)}>
                {t.heroCTA} <ArrowLeft size={15} />
              </a>
              {store?.cart !== false && (
                <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(251,248,245,0.7)', fontWeight: 500, fontSize: '0.9rem', padding: '0.9rem 1.75rem', borderRadius: 8, border: '1px solid rgba(251,248,245,0.2)', transition: 'all 0.18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = W; (e.currentTarget as HTMLAnchorElement).style.color = W; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(251,248,245,0.2)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(251,248,245,0.7)'; }}>
                  <ShoppingCart size={15} /> {t.cart}
                </Link>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(1.5rem,4vw,4rem)', marginTop: 'clamp(2.5rem,5vw,4rem)', paddingTop: 'clamp(1.5rem,3vw,2.5rem)', borderTop: '1px solid rgba(196,154,108,0.2)' }}>
            {[{ n: '+200', l: t.stat1 }, { n: '58', l: t.stat2 }, { n: '100%', l: t.stat3 }].map((s, i) => (
              <div key={i}>
                <p style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700, color: W, lineHeight: 1 }}>{s.n}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(251,248,245,0.5)', marginTop: 5, letterSpacing: '0.05em' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ background: CARD, borderBottom: `1px solid ${BD}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }} className="trust-row">
          {[
            { icon: <Truck size={16} />, t: t.trust1t, s: t.trust1s },
            { icon: <Shield size={16} />, t: t.trust2t, s: t.trust2s },
            { icon: <Sofa size={16} />, t: t.trust3t, s: t.trust3s },
            { icon: <HomeIcon size={16} />, t: t.trust4t, s: t.trust4s },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: i % 2 !== 0 ? `1px solid ${BD}` : 'none', borderTop: i >= 2 ? `1px solid ${BD}` : 'none' }}>
              <div style={{ width: 36, height: 36, background: WL, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: W, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: INK }}>{item.t}</p>
                <p style={{ fontSize: '0.65rem', color: SUB }}>{item.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <section style={{ padding: '2rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: INK }}>{t.browseCategories}</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <Link href="?" style={{ display:'inline-flex', alignItems:'center', padding:'0.5rem 1.25rem', borderRadius:999, border:`1.5px solid ${!activeCategory ? W : '#ccc'}`, background: !activeCategory ? W : 'transparent', color: !activeCategory ? '#fff' : 'inherit', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }}>
                {t.all}
              </Link>
              {cats.map((cat: any) => {
              const isActive = activeCategory === String(cat.id);
              return (
              <Link key={cat.id} href={`?category=${cat.id}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.125rem', border: `1.5px solid ${isActive ? W : BD}`, borderRadius: 999, background: isActive ? W : CARD, fontSize: '0.82rem', fontWeight: 600, color: isActive ? '#fff' : SUB, transition: 'all 0.18s', textDecoration: 'none' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = W; el.style.borderColor = W; el.style.color = '#fff'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = isActive ? W : CARD; el.style.borderColor = isActive ? W : BD; el.style.color = isActive ? '#fff' : SUB; }}>
                <Sofa size={13} /> {cat.name}
              </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="products" style={{ padding: '0 1.5rem 5rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: cats.length > 0 ? 0 : '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: INK }}>{t.allProducts}</h2>
            {store.count > 0 && <p style={{ fontSize: '0.72rem', color: SUB, marginTop: 3 }}>{store.count} {t.productsAvailable}</p>}
          </div>
        </div>
        {products.length === 0 ? (
          <div style={{ padding: '5rem 1.5rem', textAlign: 'center', border: `1px dashed ${BD}`, borderRadius: 16, background: CARD }}>
            <Sofa size={36} color={WB} style={{ display: 'block', margin: '0 auto 1rem' }} />
            <p style={{ color: SUB, fontSize: '0.875rem' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p: any) => {
              const img = p.productImage || p.imagesProduct?.[0]?.imageUrl;
              const disc = p.priceOriginal ? Math.round(((p.priceOriginal - p.price) / p.priceOriginal) * 100) : 0;
              return <Card key={p.id} product={p} displayImage={img} discount={disc} store={store} viewDetails={t.viewDetails} />;
            })}
          </div>
        )}
        {countPage > 1 && (
          <div className="pagination" dir={t.dir}>
            <Link href={{ query: { page: Math.max(1, page - 1) } }} scroll={false} style={{ height: 36, padding: '0 0.875rem', borderRadius: 20, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', background: CARD, color: SUB, fontSize: '0.8rem' }}>❮</Link>
            {Array.from({ length: countPage }).map((_, i) => {
              const pn = i + 1; const isA = Number(page) === pn;
              return <Link key={pn} href={{ query: { page: pn } }} scroll={false} style={{ height: 36, padding: '0 0.875rem', borderRadius: 20, display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${isA ? W : BD}`, background: isA ? W : CARD, color: isA ? '#fff' : SUB }}>{pn}</Link>;
            })}
            <Link href={{ query: { page: Math.min(countPage, Number(page) + 1) } }} scroll={false} style={{ height: 36, padding: '0 0.875rem', borderRadius: 20, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', background: CARD, color: SUB, fontSize: '0.8rem' }}>❯</Link>
          </div>
        )}
      </section>
    </div>
  );
}

export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const [sel, setSel] = useState(0);
  const t = T[getLang(store || product?.store)];
  return (
    <div dir={t.dir} style={{ background: BG, paddingBottom: '4rem' }}>
      <div className="details-inner" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="gallery-container">
          <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: WL, borderRadius: 20, border: `1px solid ${BD}` }}>
            {allImages[sel] ? <img src={allImages[sel]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sofa size={48} color={WB} /></div>}
            {discount > 0 && <div style={{ position: 'absolute', top: 12, right: 12, background: W, color: '#fff', padding: '3px 10px', fontSize: 11, fontWeight: 700, borderRadius: 20 }}>{discount}% {t.discount}</div>}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setSel(p => p === 0 ? allImages.length - 1 : p - 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BD}`, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK }}><ChevronRight size={15} /></button>
                <button onClick={() => setSel(p => p === allImages.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, background: 'rgba(255,255,255,0.9)', border: `1px solid ${BD}`, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK }}><ChevronLeft size={15} /></button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="thumb-row">
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSel(idx)} style={{ flexShrink: 0, width: 60, height: 60, border: `2px solid ${sel === idx ? W : BD}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'none', opacity: sel === idx ? 1 : 0.55, transition: 'all 0.15s' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="info-container">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: WL, border: `1px solid ${WB}`, borderRadius: 20, padding: '0.3rem 0.875rem', marginBottom: '0.75rem' }}>
              <HomeIcon size={11} color={W} /><span style={{ fontSize: '0.65rem', fontWeight: 600, color: WD }}>{t.productBadge}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 700, color: INK, marginBottom: '0.5rem', lineHeight: 1.2 }}>{product.name}</h1>
            <div style={{ display: 'flex', gap: 2, marginBottom: '1.25rem' }}>{[...Array(5)].map((_, i) => <Star key={i} size={13} style={{ fill: i < 4 ? W : 'none', color: W }} />)}</div>
            <div style={{ padding: '1.25rem', background: WL, borderRadius: 14, border: `1px solid ${WB}`, marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, color: SUB, marginBottom: '0.25rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{t.price}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                <span className="price-mono" style={{ fontSize: '2.5rem', fontWeight: 700, color: WD }}>{finalPrice.toLocaleString()}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: SUB }}>{t.currency}</span>
              </div>
            </div>
            {product.offers?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: SUB, marginBottom: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{t.offersTitle}</p>
                {product.offers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', border: `1.5px solid ${selectedOffer === o.id ? W : BD}`, borderRadius: 12, cursor: 'pointer', marginBottom: '0.5rem', background: selectedOffer === o.id ? WL : CARD, transition: 'all 0.18s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedOffer === o.id ? W : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedOffer === o.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: W }} />}
                      </div>
                      <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} style={{ display: 'none' }} />
                      <div>
                        <p style={{ fontWeight: 600, color: INK, fontSize: '0.875rem' }}>{o.name}</p>
                        <p style={{ fontSize: '0.7rem', color: SUB }}>{t.qty}: {o.quantity}</p>
                      </div>
                    </div>
                    <span className="price-mono" style={{ fontWeight: 700, color: WD }}>{o.price.toLocaleString()} {t.currency}</span>
                  </label>
                ))}
              </div>
            )}
            {allAttrs.map((attr: any) => (
              <div key={attr.id} style={{ marginBottom: '1.125rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{attr.name}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {attr.variants.map((v: any) => {
                    const isSel = selectedVariants[attr.name] === v.value;
                    const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                      Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                        ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                      )
                    );
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={
                        attr.displayMode === 'color' ? { width: 28, height: 28, borderRadius: '50%', background: v.value, border: `2px solid ${BD}`, cursor: available ? 'pointer' : 'not-allowed', outline: `2.5px solid ${isSel ? W : 'transparent'}`, outlineOffset: 2, opacity: available ? 1 : 0.35 }
                        : attr.displayMode === 'image' ? { width: 44, height: 44, backgroundImage: `url(${v.value})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 8, border: `2px solid ${isSel ? W : BD}`, cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35 }
                        : { padding: '0.4rem 0.875rem', border: `1.5px solid ${isSel ? W : BD}`, borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, background: isSel ? WL : CARD, color: isSel ? WD : (available ? SUB : '#bbb'), cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.15s', fontFamily: 'inherit', textDecoration: available ? 'none' : 'line-through' }
                      }>{attr.displayMode !== 'color' && attr.displayMode !== 'image' && v.name}</button>
                    );
                  })}
                </div>
              </div>
            ))}
            <ProductForm product={product} userId={product.store.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} store={store || product?.store} />
            {product.desc && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${BD}` }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: SUB, marginBottom: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{t.descTitle}</p>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.85, color: SUB }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const FR = ({ error, label, children }: { error?: string; label?: string; children: React.ReactNode }) => (
  <div>
    {label && <p style={{ fontSize: '0.7rem', fontWeight: 600, color: SUB, marginBottom: '0.35rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{label}</p>}
    {children}
    {error && <p style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
  </div>
);

export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store }: ProductFormProps) {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [fd, setFd] = useState({ customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sub, setSub] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const initCount = useCartStore((s) => s.initCount);
  const t = T[getLang(store || product?.store)];

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { if (typeof window !== 'undefined') { const id = localStorage.getItem('customerId'); if (id) setFd(p => ({ ...p, customerId: id })); } }, []);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find(w => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const getFP = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const off = product.offers?.find((o: any) => String(o.id) === String(selectedOffer));
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
      router.push(`${window.location.origin}/successfully?productId=${product.id}`);
    } catch { } finally { setSub(false); }
  };

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${BD}` }}>
        {product.store?.cart !== false && (
        <div className="cart-add-btns" style={{ marginBottom: '1.25rem' }}>
          <button onClick={addToCart} disabled={isAdded} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.8rem 1rem', border: `1.5px solid ${isAdded ? '#22C55E' : BD}`, borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: isAdded ? 'rgba(34,197,94,0.05)' : CARD, color: isAdded ? '#22C55E' : SUB, transition: 'all 0.18s', fontFamily: 'inherit' }}>
            {isAdded ? <><CheckCircle2 size={14} className="anim-check" />{t.addedMsg}</> : <><ShoppingCart size={14} />{t.addToCart}</>}
          </button>
          <button onClick={() => setIsOrderNow(true)} style={{ flex: 1, ...S.btnPrimary, width: 'auto', borderRadius: 10 }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = WD)}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = W)}>
            {t.orderNow}
          </button>
        </div>
      )}
      {(isOrderNow || !product.store?.cart !== false) && (
        <div className="anim-fade-up">
          {product.store?.cart !== false && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.7rem', color: SUB, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{t.orderInfo}</p>
              <button onClick={() => setIsOrderNow(false)} style={{ fontSize: '0.78rem', color: SUB, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t.back}</button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.customerName} label={t.fullName}><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} style={inp(!!errors.customerName)} /></FR>
              <FR error={errors.customerPhone} label={t.phone}><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} style={inp(!!errors.customerPhone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.customerWelaya} label={t.wilaya}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.customerWelaya), paddingRight: 32, fontFamily: 'inherit' }}>
                    <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.customerCommune} label={t.commune}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={!fd.customerWelaya || loadingC} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.customerCommune), paddingRight: 32, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{t.deliveryType}</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(tp => (
                  <button key={tp} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: tp }))} style={{ padding: '0.75rem', border: `1.5px solid ${fd.typeLivraison === tp ? W : BD}`, borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === tp ? WL : CARD, transition: 'all 0.18s', fontFamily: 'inherit' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 3, color: fd.typeLivraison === tp ? WD : SUB }}>{tp === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                    {selW && <p className="price-mono" style={{ fontSize: '1rem', fontWeight: 700, color: fd.typeLivraison === tp ? WD : SUB }}>{(tp === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} {t.currency}</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: SUB, marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{t.qty}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: `1.5px solid ${BD}`, borderRadius: 12, overflow: 'hidden', background: CARD }}>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: SUB, borderLeft: `1px solid ${BD}` }}><Minus size={12} /></button>
                <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: INK }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: W, borderRight: `1px solid ${BD}` }}><Plus size={12} /></button>
              </div>
            </div>
            <div style={{ background: WL, borderRadius: 14, border: `1px solid ${WB}`, padding: '1rem 1.125rem', marginBottom: '1rem' }}>
              {[
                { l: product.name.slice(0, 26) + (product.name.length > 26 ? '...' : ''), v: `${fp.toLocaleString()} ${t.currency}` },
                { l: t.delivery, v: selW ? `${getLiv().toLocaleString()} ${t.currency}` : '—' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid ${WB}` }}>
                  <span style={{ fontSize: '0.78rem', color: SUB }}>{r.l}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: INK }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: INK }}>{t.total}</span>
                <span className="price-mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: WD }}>{total().toLocaleString()} <span style={{ fontSize: '0.75rem' }}>{t.currency}</span></span>
              </div>
            </div>
            <button type="submit" disabled={sub} style={{ ...S.btnPrimary, opacity: sub ? 0.7 : 1 }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = WD)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = W)}>
              {sub ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />{t.sending}</> : t.confirmOrder}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function Cart({ domain, store }: { domain: string; store: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fd, setFd] = useState({ customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initCount = useCartStore((s) => s.initCount);
  const t = T[getLang(store)];

  useEffect(() => { setItems(JSON.parse(localStorage.getItem(domain) || '[]')); if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [domain, store]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLC(true); fetchCommunes(fd.customerWelaya).then(d => { setCommunes(d); setLC(false); });
  }, [fd.customerWelaya]);

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

  const inp = (err?: boolean) => ({ ...S.input, ...(err ? S.inputErr : {}) });

  if (success) return (
    <div dir={t.dir} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', background: CARD, padding: '3rem 2rem', borderRadius: 20, border: `1px solid ${BD}`, maxWidth: 440, width: '100%' }}>
        <CheckCircle2 size={48} style={{ color: W, display: 'block', margin: '0 auto 1.25rem' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: INK, marginBottom: '0.5rem' }}>{t.successTitle}</h2>
        <p style={{ color: SUB, lineHeight: 1.75, marginBottom: '2rem', fontSize: '0.9rem' }}>{t.successDesc}</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: W, color: '#fff', padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.875rem', borderRadius: 10 }}>{t.backToShop}</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div dir={t.dir} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: BG }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', border: `1px solid ${BD}`, borderRadius: 20, maxWidth: 400, width: '100%', background: CARD }}>
        <ShoppingBag size={44} style={{ color: WB, display: 'block', margin: '0 auto 1.25rem' }} />
        <p style={{ color: SUB, fontSize: '0.9rem', marginBottom: '2rem' }}>{t.cartEmpty}</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: W, color: '#fff', padding: '0.75rem 1.875rem', fontWeight: 700, fontSize: '0.875rem', borderRadius: 10 }}>{t.shopNow}</Link>
      </div>
    </div>
  );

  return (
    <div dir={t.dir} style={{ padding: '2.5rem 1.5rem', maxWidth: 1280, margin: '0 auto', minHeight: '100vh', background: BG }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ width: 32, height: 32, background: WL, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingCart size={15} color={W} />
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem,5vw,2.25rem)', fontWeight: 700, color: INK }}>{t.myCart}</h1>
      </div>
      <div className="cart-inner">
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, alignSelf: 'start', overflow: 'hidden' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem 1rem', borderBottom: `1px solid ${BD}` }}>
              <img src={item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage} style={{ width: 72, height: 72, objectFit: 'cover', flexShrink: 0, borderRadius: 10, border: `1px solid ${BD}` }} alt="" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, color: INK, marginBottom: '0.3rem', fontSize: '0.875rem', lineHeight: 1.4 }}>{item.product?.name}</h4>
                <p className="price-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: WD }}>{item.finalPrice?.toLocaleString()} {t.currency}</p>
                <p style={{ fontSize: '0.68rem', color: SUB, marginTop: '0.15rem' }}>{t.qty}: {item.quantity}</p>
              </div>
              <button onClick={() => update(items.filter((_, idx) => idx !== i))} style={{ color: WB, padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', transition: 'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#DC2626')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = WB)}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <div style={{ padding: '1rem', background: WL, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: SUB, fontSize: '0.875rem' }}>{t.subtotal}</span>
            <span className="price-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: WD }}>{cartTotal.toLocaleString()} {t.currency}</span>
          </div>
        </div>
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: '1.75rem', alignSelf: 'start' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: INK, marginBottom: '1.5rem' }}>{t.checkoutTitle}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <FR error={errors.name} label={t.fullName}><input type="text" value={fd.customerName} onChange={e => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} style={inp(!!errors.name)} /></FR>
              <FR error={errors.phone} label={t.phone}><input type="tel" value={fd.customerPhone} onChange={e => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} style={inp(!!errors.phone)} /></FR>
            </div>
            <div className="form-row-2">
              <FR error={errors.w} label={t.wilaya}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerWelaya} onChange={e => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })} style={{ ...inp(!!errors.w), paddingRight: 30, fontFamily: 'inherit' }}>
                    <option value="">{t.wilayaPh}</option>{wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                </div>
              </FR>
              <FR error={errors.c} label={t.commune}>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: SUB, pointerEvents: 'none' }} />
                  <select value={fd.customerCommune} disabled={loadingC || !fd.customerWelaya} onChange={e => setFd({ ...fd, customerCommune: e.target.value })} style={{ ...inp(!!errors.c), paddingRight: 30, opacity: (!fd.customerWelaya || loadingC) ? 0.5 : 1, fontFamily: 'inherit' }}>
                    <option value="">{loadingC ? t.communeLoading : t.communePh}</option>{communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                </div>
              </FR>
            </div>
            <div style={{ margin: '1rem 0' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: SUB, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{t.deliveryType}</p>
              <div className="delivery-grid">
                {(['home', 'office'] as const).map(tp => (
                  <button key={tp} type="button" onClick={() => setFd(p => ({ ...p, typeLivraison: tp }))} style={{ padding: '0.75rem', border: `1.5px solid ${fd.typeLivraison === tp ? W : BD}`, borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: fd.typeLivraison === tp ? WL : CARD, fontFamily: 'inherit', transition: 'all 0.18s' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.8rem', color: fd.typeLivraison === tp ? WD : SUB, marginBottom: 3 }}>{tp === 'home' ? t.deliveryHome : t.deliveryOffice}</p>
                    {selW && <p style={{ fontWeight: 700, fontSize: '0.95rem', color: fd.typeLivraison === tp ? WD : SUB }}>{(tp === 'home' ? selW.livraisonHome : selW.livraisonOfice).toLocaleString()} {t.currency}</p>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: WL, borderRadius: 14, border: `1px solid ${WB}`, padding: '1rem', margin: '1rem 0' }}>
              {[{ l: t.subtotal, v: `${cartTotal.toLocaleString()} ${t.currency}` }, { l: t.delivery, v: getLiv() ? `${getLiv().toLocaleString()} ${t.currency}` : '—' }].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid ${WB}` }}>
                  <span style={{ fontSize: '0.78rem', color: SUB }}>{r.l}</span>
                  <span style={{ fontWeight: 600, color: INK }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, color: INK }}>{t.total}</span>
                <span className="price-mono" style={{ fontSize: '1.875rem', fontWeight: 700, color: WD }}>{finalTotal.toLocaleString()} <span style={{ fontSize: '0.75rem' }}>{t.currency}</span></span>
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = WD)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = W)}>
              {submitting ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />{t.sending}</> : t.confirmOrder}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const Shell = ({ children, title, store }: { children: React.ReactNode; title: string; store?: any }) => {
  const t = T[getLang(store)];
  return (
  <div dir={t.dir} style={{ minHeight: '100vh', background: BG }}>
    <div style={{ background: '#2C1810', paddingTop: 88, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(196,154,108,0.15)', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 20, padding: '0.3rem 0.875rem', marginBottom: '1rem' }}>
          <HomeIcon size={12} style={{ color: W }} /><span style={{ fontSize: '0.68rem', fontWeight: 600, color: W }}>Home Comforts</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 700, color: '#fff' }}>{title}</h1>
      </div>
    </div>
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>{children}</div>
  </div>
  );
};

const InfoBlock = ({ title, body }: { title: string; body: string }) => (
  <div style={{ padding: '1.125rem 0', borderBottom: `1px solid ${BD}`, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
    <div style={{ width: 28, height: 28, background: WL, border: `1px solid ${WB}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
      <HomeIcon size={13} color={W} />
    </div>
    <div>
      <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: INK, marginBottom: '0.35rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: SUB }}>{body}</p>
    </div>
  </div>
);

export function Privacy({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacyTitle} store={store}>
      <div style={{ background: CARD, padding: '1.5rem', borderRadius: 16, border: `1px solid ${BD}` }}>
        <InfoBlock title={t.privacyD1t} body={t.privacyD1b} />
        <InfoBlock title={t.privacyD2t} body={t.privacyD2b} />
        <InfoBlock title={t.privacyD3t} body={t.privacyD3b} />
      </div>
    </Shell>
  );
}

export function Terms({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.termsTitle} store={store}>
      <div style={{ background: CARD, padding: '1.5rem', borderRadius: 16, border: `1px solid ${BD}` }}>
        <InfoBlock title={t.termsD1t} body={t.termsD1b} />
        <InfoBlock title={t.termsD2t} body={t.termsD2b} />
        <InfoBlock title={t.termsD3t} body={t.termsD3b} />
      </div>
    </Shell>
  );
}

export function Cookies({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookiesTitle} store={store}>
      <div style={{ background: CARD, padding: '1.5rem', borderRadius: 16, border: `1px solid ${BD}` }}>
        <InfoBlock title={t.cookiesD1t} body={t.cookiesD1b} />
        <InfoBlock title={t.cookiesD2t} body={t.cookiesD2b} />
      </div>
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = T[getLang(store)];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store.id }); setSent(true); }
    catch { showError(t.errSubmit); } finally { setLoading(false); }
  };

  return (
    <div dir={t.dir} style={{ background: BG, minHeight: '100vh' }}>
      <div style={{ background: '#2C1810', paddingTop: 88, paddingBottom: 48, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(196,154,108,0.15)', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 20, padding: '0.3rem 0.875rem', marginBottom: '1rem' }}>
            <HomeIcon size={12} style={{ color: W }} /><span style={{ fontSize: '0.68rem', fontWeight: 600, color: W }}>Home Comforts</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 700, color: '#fff' }}>{t.contactTitle}</h1>
        </div>
      </div>
      <div className="contact-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        <div>
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: '1.25rem', marginBottom: '1rem' }}>
            {[
              { icon: <Phone size={14} />, label: t.phone, val: store?.contact?.phone || t.wilayaNA },
              { icon: <MapPin size={14} />, label: t.contactSect, val: [store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' / ') || '' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: i === 0 ? '1rem' : 0 }}>
                <div style={{ width: 36, height: 36, background: WL, border: `1px solid ${WB}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: W, flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <p style={{ fontSize: '0.62rem', color: SUB, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.1rem' }}>{r.label}</p>
                  <p style={{ fontWeight: 600, color: INK, fontSize: '0.875rem' }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: WL, borderRadius: 12, border: `1px solid ${WB}`, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: W, display: 'inline-block' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: WD }}>{t.responseTime}</span>
          </div>
        </div>
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <CheckCircle2 size={48} style={{ color: W, display: 'block', margin: '0 auto 1.25rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: INK, marginBottom: '0.5rem' }}>{t.messageSent}</h2>
              <p style={{ color: SUB, lineHeight: 1.75, marginBottom: '2rem', fontSize: '0.9rem' }}>{t.messageSentDesc}</p>
              <button onClick={() => setSent(false)} style={{ padding: '0.7rem 1.875rem', border: `1px solid ${W}`, borderRadius: 10, background: WL, color: WD, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}>{t.sendAnother}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row-2" style={{ marginBottom: '0.875rem' }}>
                <FR label={t.fullName}><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={S.input} /></FR>
                <FR label={t.phone}><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={S.input} /></FR>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <FR label={t.email}><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={S.input} /></FR>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <FR label={t.message}><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...S.input, resize: 'none' }} /></FR>
              </div>
              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = WD)}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = W)}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />{t.sending}</> : <>{t.sendMessage} <ArrowLeft size={15} /></>}
              </button>
            </form>
          )}
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
