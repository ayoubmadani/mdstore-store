"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import DOMPurify from "dompurify";
import axios from "axios";
import { useCartStore } from "@/store/useCartStore";

// ─── Icons (Lucide) ─────────────────────────────────────────────
import {
  ShoppingCart, Search, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  Star, Trash2, Phone, Mail, MapPin, Send, AlertCircle, Minus, Plus,
  Gamepad2, Shield, Truck, Headphones, Zap, Trophy, Monitor, Cpu,
  Crosshair, Sword, Crown, Flame, CheckCircle
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: "color" | "image" | "text" | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: "color" | "image" | "text"; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; slug?: string;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number; store?: any;
}

// ─── Constants ────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

const C0 = "#0a0a0f";
const C1 = "#111118";
const C2 = "#1a1a24";
const C3 = "#252535";
const C4 = "#3a3a50";
const A = "#ff2a6d";
const AD = "#d61a55";
const AL = "rgba(255,42,109,0.12)";
const TXT = "#e8e8f0";
const SUB = "#8b8ba0";
const BD = "#2a2a3e";
const CARD = "#141420";
const SURFACE = "#1e1e2e";
const SUCCESS = "#00f5d4";

// ─── Helpers ──────────────────────────────────────────────────────
function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e: any) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const res = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`);
    return res.data || [];
  } catch { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const res = await axios.get(`${API_URL}/shipping/get-communes/${wid}`);
    return res.data || [];
  } catch { return []; }
};

const getVarId = (product: Product, selectedVariants: Record<string, string>, selectedOffer: string | null): string | number | null => {
  if (selectedOffer) return null;
  if (!product.variantDetails || !Object.keys(selectedVariants).length) return null;
  const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
  return match ? match.id : null;
};

// ─── Shared Styles ────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: "100%", padding: "0.75rem 1rem", fontSize: "0.9rem",
  border: `1px solid ${BD}`, borderRadius: 4, background: SURFACE,
  color: TXT, outline: "none", appearance: "none", transition: "border-color 0.2s",
  fontFamily: "inherit",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "0.875rem 1.5rem", minHeight: 44, background: A, color: "#fff",
  fontWeight: 700, fontSize: "0.9rem", border: "none", borderRadius: 4,
  cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit", width: "100%",
};

const btnSecondary: React.CSSProperties = {
  ...btnPrimary, background: "transparent", color: A, border: `1px solid ${A}`,
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem",
};

// ─── Main ─────────────────────────────────────────────────────────

// ─── Translations ─────────────────────────────────────────────────────────────
const jsonAr = {
  dir: 'rtl',
  home: 'الرئيسية', contact: 'اتصل بنا', cart: 'السلة',
  search: 'ابحث...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج', showAll: 'عرض كل النتائج →',
  all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تسوق الآن', searchResultsFor: 'نتائج البحث عن:',
  heroBadge: 'أفضل متجر للألعاب في الجزائر',
  heroTitleDefault: 'جهز معسكرك<br/>القتالي الآن',
  heroSubDefault: 'اكتشف أحدث الأجهزة، الإكسسوارات، والألعاب بأسعار تنافسية',
  catsTitle: 'التصنيفات',
  trustItems: [
    { title: 'شحن سريع', desc: 'توصيل خلال 24-48 ساعة' },
    { title: 'جودة مضمونة', desc: 'منتجات أصلية 100%' },
    { title: 'دفع آمن', desc: 'حماية كاملة للبيانات' },
    { title: 'دعم 24/7', desc: 'فريق متخصص للمساعدة' },
  ],
  fullName: 'الاسم الكامل', fullNamePh: 'أدخل اسمك', errName: 'الاسم مطلوب',
  phone: 'رقم الهاتف', phonePh: '05xxxxxxxx', errPhone: 'رقم الهاتف مطلوب', errPhoneInvalid: 'رقم هاتف غير صالح',
  wilaya: 'الولاية', errWilaya: 'الولاية مطلوبة', wilayaPh: 'اختر الولاية', wilayaNA: 'التوصيل غير متاح حالياً',
  commune: 'البلدية', errCommune: 'البلدية مطلوبة', communePh: 'اختر البلدية', communeLoading: 'جاري التحميل...',
  deliveryType: 'نوع التوصيل', deliveryHome: 'توصيل للمنزل', deliveryOffice: 'مكتب بريد',
  qty: 'الكمية', qtyLabel: 'الكمية:', price: 'السعر', delivery: 'التوصيل', total: 'الإجمالي', subtotal: 'المجموع الفرعي',
  orderInfo: 'معلومات الطلب', addToCart: 'أضف إلى السلة', orderNow: 'اطلب الآن',
  confirmOrder: 'تأكيد الطلب', sending: 'جاري الإرسال...', back: 'رجوع',
  addedMsg: 'تمت الإضافة إلى السلة بنجاح!', errSubmit: 'حدث خطأ أثناء إرسال الطلب',
  myCart: 'السلة', cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تقم بإضافة أي منتجات بعد',
  successTitle: 'تم إرسال طلبك بنجاح!', successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل',
  backToShop: 'العودة للتسوق', checkoutTitle: 'إتمام الطلب',
  offersTitle: 'العروض المتاحة', descTitle: 'الوصف',
  quickLinks: 'روابط سريعة', contactSect: 'تواصل معنا', privacy: 'الخصوصية', terms: 'الشروط', rightsReserved: 'جميع الحقوق محفوظة',
  footerDesc: 'أفضل منتجات الألعاب والرياضات الإلكترونية', footerTagline: 'صُمم بشغف لعالم الألعاب',
  contactTitle: 'اتصل بنا', contactInfoTitle: 'معلومات التواصل', contactFormTitle: 'أرسل رسالة',
  namePh: 'الاسم', emailPh: 'البريد الإلكتروني', phonePh2: 'رقم الهاتف', messagePh: 'رسالتك...',
  sendBtn: 'إرسال', contactSentTitle: 'تم إرسال رسالتك!', contactSentDesc: 'شكراً لتواصلك معنا، سنرد عليك في أقرب وقت',
  sendAnother: 'إرسال رسالة أخرى', contactErr: 'حدث خطأ',
  privacyTitle: 'سياسة الخصوصية',
  privDataTitle: 'جمع البيانات', privDataBody: 'نقوم بجمع المعلومات الضرورية فقط لمعالجة طلباتك وتحسين تجربة التسوق. لا نشارك بياناتك مع أطراف ثالثة دون إذنك.',
  privUseTitle: 'استخدام المعلومات', privUseBody: 'تُستخدم بياناتك لتوصيل الطلبات والتواصل معك بخصوص حالة الشحن فقط.',
  privSecTitle: 'حماية البيانات', privSecBody: 'نستخدم تقنيات تشفير حديثة لحماية معلوماتك الشخصية من الوصول غير المصرح به.',
  termsTitle: 'الشروط والأحكام',
  termsUseTitle: 'الاستخدام', termsUseBody: 'باستخدامك لهذا الموقع، فإنك توافق على الالتزام بجميع الشروط والأحكام الموضحة هنا.',
  termsOrdTitle: 'الطلبات', termsOrdBody: 'جميع الطلبات خاضعة للتوفر. نحتفظ بالحق في إلغاء أي طلب في حالة عدم توفر المنتج.',
  termsRetTitle: 'الإرجاع', termsRetBody: 'يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام شريطة أن تكون بحالتها الأصلية.',
  cookiesTitle: 'سياسة الكوكيز',
  cookWhatTitle: 'ما هي الكوكيز', cookWhatBody: 'الكوكيز هي ملفات نصية صغيرة تُخزن على جهازك لتحسين تجربة التصفح.',
  cookHowTitle: 'كيف نستخدمها', cookHowBody: 'نستخدم الكوكيز لتذكر تفضيلاتك وعناصر سلة التسوق وتحليل حركة المرور.',
  cookCtrlTitle: 'التحكم', cookCtrlBody: 'يمكنك تعطيل الكوكيز من إعدادات المتصفح، لكن قد يؤثر ذلك على بعض الوظائف.',
};

const jsonFr = {
  dir: 'ltr',
  home: 'Accueil', contact: 'Contact', cart: 'Panier',
  search: 'Rechercher un produit...', searching: 'Recherche...', noResults: 'Aucun résultat', showAll: 'Voir tous les résultats',
  all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la boutique', searchResultsFor: 'Résultats pour :',
  heroBadge: 'La meilleure boutique gaming en Algérie',
  heroTitleDefault: 'Équipez votre camp<br/>de combat maintenant',
  heroSubDefault: 'Découvrez les derniers équipements, accessoires et jeux à des prix compétitifs',
  catsTitle: 'Catégories',
  trustItems: [
    { title: 'Livraison rapide', desc: 'Livraison en 24-48h' },
    { title: 'Qualité garantie', desc: 'Produits authentiques 100%' },
    { title: 'Paiement sécurisé', desc: 'Protection complète des données' },
    { title: 'Support 24/7', desc: 'Équipe spécialisée disponible' },
  ],
  fullName: 'Nom complet', fullNamePh: 'Votre nom', errName: 'Le nom est requis',
  phone: 'Téléphone', phonePh: '0555 12 34 56', errPhone: 'Le numéro de téléphone est requis', errPhoneInvalid: 'Numéro de téléphone invalide',
  wilaya: 'Wilaya', errWilaya: 'Sélectionnez une wilaya', wilayaPh: 'Choisir la wilaya', wilayaNA: 'Livraison indisponible pour le moment',
  commune: 'Commune', errCommune: 'Sélectionnez une commune', communePh: 'Choisir la commune', communeLoading: 'Chargement...',
  deliveryType: 'Type de livraison', deliveryHome: 'À domicile', deliveryOffice: 'Point relais',
  qty: 'Quantité', qtyLabel: 'Qté :', price: 'Prix', delivery: 'Livraison', total: 'Total', subtotal: 'Sous-total',
  orderInfo: 'Informations de commande', addToCart: 'Ajouter au panier', orderNow: 'Commander maintenant',
  confirmOrder: 'Confirmer la commande', sending: 'Envoi en cours...', back: 'Annuler',
  addedMsg: 'Ajouté au panier ✓', errSubmit: 'Une erreur est survenue, veuillez réessayer.',
  myCart: 'Mon Panier', cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre sélection.',
  successTitle: 'Commande confirmée', successDesc: 'Merci pour votre commande, notre équipe vous contactera bientôt.',
  backToShop: 'Retour à la boutique', checkoutTitle: 'Finaliser la commande',
  offersTitle: 'Offres groupées', descTitle: 'Description',
  quickLinks: 'Navigation', contactSect: 'Contact', privacy: 'Confidentialité', terms: 'Conditions', rightsReserved: 'Tous droits réservés.',
  footerDesc: 'Les meilleurs produits gaming et e-sports', footerTagline: 'Conçu avec passion pour le gaming',
  contactTitle: 'Contactez-nous', contactInfoTitle: 'Informations de contact', contactFormTitle: 'Envoyer un message',
  namePh: 'Nom', emailPh: 'Adresse e-mail', phonePh2: 'Numéro de téléphone', messagePh: 'Votre message...',
  sendBtn: 'Envoyer', contactSentTitle: 'Message envoyé !', contactSentDesc: 'Merci de nous avoir contactés, nous vous répondrons dans les plus brefs délais.',
  sendAnother: 'Envoyer un autre message', contactErr: 'Une erreur est survenue',
  privacyTitle: 'Politique de confidentialité',
  privDataTitle: 'Collecte des données', privDataBody: "Nous collectons uniquement les informations nécessaires au traitement de vos commandes et à l'amélioration de votre expérience d'achat.",
  privUseTitle: 'Utilisation des informations', privUseBody: "Vos données sont utilisées uniquement pour la livraison des commandes et la communication sur l'état de l'expédition.",
  privSecTitle: 'Protection des données', privSecBody: 'Nous utilisons des technologies de chiffrement modernes pour protéger vos informations personnelles.',
  termsTitle: 'Conditions générales',
  termsUseTitle: 'Utilisation', termsUseBody: 'En utilisant ce site, vous acceptez de respecter toutes les conditions générales présentées ici.',
  termsOrdTitle: 'Commandes', termsOrdBody: "Toutes les commandes sont soumises à disponibilité. Nous nous réservons le droit d'annuler toute commande en cas d'indisponibilité.",
  termsRetTitle: 'Retours', termsRetBody: "Vous pouvez retourner les produits dans les 14 jours suivant la réception, à condition qu'ils soient dans leur état d'origine.",
  cookiesTitle: 'Politique des cookies',
  cookWhatTitle: 'Que sont les cookies ?', cookWhatBody: 'Les cookies sont de petits fichiers texte stockés sur votre appareil pour améliorer votre expérience de navigation.',
  cookHowTitle: 'Comment nous les utilisons', cookHowBody: 'Nous utilisons les cookies pour mémoriser vos préférences, les éléments du panier et analyser le trafic.',
  cookCtrlTitle: 'Contrôle', cookCtrlBody: 'Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, mais cela peut affecter certaines fonctionnalités.',
};

const jsonEn = {
  dir: 'ltr',
  home: 'Home', contact: 'Contact', cart: 'Cart',
  search: 'Search...', searching: 'Searching...', noResults: 'No results found', showAll: 'View all results →',
  all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Shop Now', searchResultsFor: 'Search results for:',
  heroBadge: 'Best gaming store in Algeria',
  heroTitleDefault: 'Gear up your<br/>combat camp now',
  heroSubDefault: 'Discover the latest gear, accessories, and games at competitive prices',
  catsTitle: 'Categories',
  trustItems: [
    { title: 'Fast Shipping', desc: 'Delivery within 24-48 hours' },
    { title: 'Guaranteed Quality', desc: '100% authentic products' },
    { title: 'Secure Payment', desc: 'Full data protection' },
    { title: '24/7 Support', desc: 'Specialized team available' },
  ],
  fullName: 'Full Name', fullNamePh: 'Enter your name', errName: 'Name is required',
  phone: 'Phone Number', phonePh: '05xxxxxxxx', errPhone: 'Phone number is required', errPhoneInvalid: 'Invalid phone number',
  wilaya: 'Wilaya', errWilaya: 'Please select a wilaya', wilayaPh: 'Select wilaya', wilayaNA: 'Delivery not available',
  commune: 'Commune', errCommune: 'Please select a commune', communePh: 'Select commune', communeLoading: 'Loading...',
  deliveryType: 'Delivery Type', deliveryHome: 'Home Delivery', deliveryOffice: 'Post Office',
  qty: 'Quantity', qtyLabel: 'Qty:', price: 'Price', delivery: 'Delivery', total: 'Total', subtotal: 'Subtotal',
  orderInfo: 'Order Information', addToCart: 'Add to Cart', orderNow: 'Order Now',
  confirmOrder: 'Confirm Order', sending: 'Processing...', back: 'Cancel',
  addedMsg: 'Successfully added to cart!', errSubmit: 'An error occurred while placing your order',
  myCart: 'Cart', cartEmpty: 'Your cart is empty', cartEmptyDesc: "You haven't added any products yet",
  successTitle: 'Order placed successfully!', successDesc: "We'll contact you shortly to confirm the details",
  backToShop: 'Back to Shopping', checkoutTitle: 'Complete Order',
  offersTitle: 'Available Offers', descTitle: 'Description',
  quickLinks: 'Quick Links', contactSect: 'Contact Us', privacy: 'Privacy', terms: 'Terms', rightsReserved: 'All rights reserved.',
  footerDesc: 'Best gaming and e-sports products', footerTagline: 'Designed with passion for gaming',
  contactTitle: 'Contact Us', contactInfoTitle: 'Contact Information', contactFormTitle: 'Send a Message',
  namePh: 'Name', emailPh: 'Email address', phonePh2: 'Phone number', messagePh: 'Your message...',
  sendBtn: 'Send', contactSentTitle: 'Message sent!', contactSentDesc: "Thank you for reaching out. We'll get back to you as soon as possible.",
  sendAnother: 'Send another message', contactErr: 'An error occurred',
  privacyTitle: 'Privacy Policy',
  privDataTitle: 'Data Collection', privDataBody: 'We collect only the necessary information to process your orders and improve your shopping experience. We do not share your data with third parties without your consent.',
  privUseTitle: 'Use of Information', privUseBody: 'Your data is used solely for order delivery and communication about shipping status.',
  privSecTitle: 'Data Protection', privSecBody: 'We use modern encryption technologies to protect your personal information from unauthorized access.',
  termsTitle: 'Terms & Conditions',
  termsUseTitle: 'Usage', termsUseBody: 'By using this site, you agree to comply with all terms and conditions outlined here.',
  termsOrdTitle: 'Orders', termsOrdBody: 'All orders are subject to availability. We reserve the right to cancel any order if the product is unavailable.',
  termsRetTitle: 'Returns', termsRetBody: 'You may return products within 14 days of receipt, provided they are in their original condition.',
  cookiesTitle: 'Cookie Policy',
  cookWhatTitle: 'What are Cookies?', cookWhatBody: 'Cookies are small text files stored on your device to improve your browsing experience.',
  cookHowTitle: 'How We Use Them', cookHowBody: 'We use cookies to remember your preferences, cart items, and analyze traffic.',
  cookCtrlTitle: 'Control', cookCtrlBody: 'You can disable cookies in your browser settings, but this may affect some features.',
};

type Lang = 'ar' | 'fr' | 'en';
const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr as any, en: jsonEn as any };

export default function Main({ store, children, domain }: { store: any; children: React.ReactNode; domain: string }) {
  const pathname = usePathname();
  const t = T[getLang(store)];
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div dir={t.dir} style={{ background: C0, color: TXT, minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulseGlow { 0%,100% { box-shadow:0 0 0 0 rgba(255,42,109,0.4) } 50% { box-shadow:0 0 20px 4px rgba(255,42,109,0.15) } }
        @keyframes slideIn { from { opacity:0; transform:translateX(30px) } to { opacity:1; transform:translateX(0) } }
        @keyframes neonFlicker { 0%,100% { opacity:1 } 50% { opacity:0.85 } }
        .products-grid { display:grid; grid-template-columns:1fr; gap:1rem; }
        @media(min-width:500px){ .products-grid { grid-template-columns:repeat(2,1fr); } }
        @media(min-width:1024px){ .products-grid { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:1280px){ .products-grid { grid-template-columns:repeat(4,1fr); } }
        .form-row-2 { display:grid; grid-template-columns:1fr; gap:0.875rem; margin-bottom:0.875rem; }
        @media(min-width:500px){ .form-row-2 { grid-template-columns:1fr 1fr; } }
        .cart-inner { display:grid; grid-template-columns:1fr; gap:2rem; }
        @media(min-width:1024px){ .cart-inner { grid-template-columns:1.2fr 1fr; } }
        .details-inner { display:grid; grid-template-columns:1fr; gap:2rem; }
        @media(min-width:768px){ .details-inner { grid-template-columns:1fr 1fr; } }
        .nav-links { display:flex; align-items:center; gap:24px; }
        .nav-burger { display:none; }
        @media(max-width:700px){ .nav-links { display:none; } .nav-burger { display:flex; } }
        .search-dropdown { position:absolute; top:calc(100% + 8px); right:0; width:360px; }
        @media(max-width:480px){ .search-dropdown { position:fixed; left:12px; right:12px; width:auto; top:64px; } }
        ::-webkit-scrollbar { width:8px; }
        ::-webkit-scrollbar-track { background:C0; }
        ::-webkit-scrollbar-thumb { background:C4; border-radius:4px; }
        ::-webkit-scrollbar-thumb:hover { background:A; }
      `}</style>
      <Navbar store={store} domain={domain} />
      <main style={{ minHeight: "calc(100vh - 300px)" }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    const saved = localStorage.getItem(domain);
    if (saved) { try { const items = JSON.parse(saved); initCount(Array.isArray(items) ? items.length : 0); } catch {} }
  }, [domain, initCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setListSearch([]); setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) { setListSearch([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      axios.get(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`)
        .then((res) => { setListSearch(res.data?.products || []); })
        .catch(() => setListSearch([]))
        .finally(() => setLoading(false));
    }, 380);
  }, [searchQuery, domain]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`); setListSearch([]); setShowSearch(false); }
  };

  const navLinks = [
    { h: "/", l: t.home, icon: Gamepad2 },
    { h: "/contact", l: t.contact, icon: Headphones },
  ];
  const mobileLinks = [
    ...navLinks,
    ...(store?.cart !== false ? [{ h: "/cart", l: t.cart, icon: ShoppingCart }] : []),
  ];

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(10,10,15,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${BD}` : "1px solid transparent",
      transition: "all 0.3s",
    }}>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: A, color: "#fff", textAlign: "center", padding: "6px 1rem", fontSize: "0.8rem", fontWeight: 600 }}>
          <Zap size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: 6 }} />
          {store.topBar.text}
        </div>
      )}
      <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          {!imgError && store?.design?.logoUrl ? (
            <img src={store.design.logoUrl} alt="" onError={() => setImgError(true)} style={{ height: 40, width: 40, objectFit: "contain", borderRadius: 8 }} />
          ) : (
            <div style={{ width: 40, height: 40, background: A, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Crosshair size={20} color="#fff" />
            </div>
          )}
          <span style={{ fontWeight: 800, fontSize: "1.2rem", color: TXT, letterSpacing: 1 }}>{store?.name || "EPIC STORE"}</span>
        </Link>

        <nav className="nav-links" style={{ gap: 28 }}>
          {navLinks.map((lnk) => (
            <Link key={lnk.h} href={lnk.h} style={{ color: SUB, textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, transition: "color 0.2s", display: "flex", alignItems: "center", gap: 6 }} onMouseEnter={(e) => (e.currentTarget.style.color = A)} onMouseLeave={(e) => (e.currentTarget.style.color = SUB)}>
              <lnk.icon size={16} />{lnk.l}
            </Link>
          ))}
          <div ref={searchRef} style={{ position: "relative" }}>
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", background: C2, borderRadius: 6, padding: "6px 12px", border: `1px solid ${BD}` }}>
              <Search size={16} color={SUB} />
              <input
                type="text" placeholder={t.search} value={searchQuery} dir={t.dir}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
                style={{ background: "transparent", border: "none", outline: "none", color: TXT, width: 160, marginInlineStart: 8, fontSize: "0.85rem", fontFamily: "inherit" }}
              />
            </form>
            {showSearch && (searchQuery.length >= 2 || listSearch.length > 0) && (
              <div className="search-dropdown" style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 8, padding: "0.5rem 0", maxHeight: 360, overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 200 }}>
                {loading ? (
                  <div style={{ padding: "1rem", textAlign: "center", color: SUB, fontSize: "0.85rem" }}>{t.searching}</div>
                ) : listSearch.length === 0 ? (
                  <div style={{ padding: "1rem", textAlign: "center", color: SUB, fontSize: "0.85rem" }}>{t.noResults}</div>
                ) : (
                  <>
                    {listSearch.slice(0, 5).map((p) => (
                      <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={() => { setShowSearch(false); setSearchQuery(""); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", textDecoration: "none", color: TXT, transition: "background 0.15s", borderBottom: `1px solid ${BD}` }} onMouseEnter={(e) => (e.currentTarget.style.background = C2)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        {(p.productImage || (p as any).imagesProduct?.[0]?.imageUrl) && (
                          <img src={p.productImage || (p as any).imagesProduct?.[0]?.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, background: C2, flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: "0.85rem", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                      </Link>
                    ))}
                    <Link href={`/?search=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearch(false)} style={{ display: "block", padding: "10px 12px", textAlign: "center", color: A, fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", borderTop: `1px solid ${BD}` }}>
                      {t.showAll}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          {store?.cart !== false && (
            <Link href="/cart" style={{ position: "relative", color: TXT, textDecoration: "none" }}>
              <ShoppingCart size={22} />
              {count > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, background: A, color: "#fff", fontSize: "0.65rem", fontWeight: 800, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${scrolled ? "rgba(10,10,15,0.95)" : C0}` }}>{count}</span>
              )}
            </Link>
          )}
        </nav>

        <div className="nav-burger" style={{ alignItems: "center", gap: 16 }}>
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: TXT, cursor: "pointer", padding: 4 }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
          {store?.cart !== false && (
            <Link href="/cart" style={{ position: "relative", color: TXT, textDecoration: "none" }}>
              <ShoppingCart size={22} />
              {count > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, background: A, color: "#fff", fontSize: "0.65rem", fontWeight: 800, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C0}` }}>{count}</span>
              )}
            </Link>
          )}
        </div>
      </div>

      {open && (
        <div style={{ background: C1, borderTop: `1px solid ${BD}`, padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: 12, animation: "fadeInUp 0.2s ease" }}>
          {mobileLinks.map((lnk) => (
            <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)} style={{ color: TXT, textDecoration: "none", fontSize: "1rem", fontWeight: 600, padding: "8px 0", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${BD}` }}>
              <lnk.icon size={18} color={A} />{lnk.l}
            </Link>
          ))}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", background: C2, borderRadius: 6, padding: "8px 12px", border: `1px solid ${BD}`, marginTop: 4 }}>
            <Search size={16} color={SUB} />
            <input type="text" placeholder={t.search} value={searchQuery} dir={t.dir} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: TXT, flex: 1, marginInlineStart: 8, fontSize: "0.9rem", fontFamily: "inherit" }} />
          </form>
        </div>
      )}
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────
export function Footer({ store }: { store: any }) {
  const t = T[getLang(store)];
  const year = new Date().getFullYear();
  const links = [
    { h: "/", l: t.home },
    { h: "/contact", l: t.contact },
    { h: "/privacy", l: t.privacy },
    { h: "/terms", l: t.terms },
  ].filter((lnk) => lnk.h !== "/cart" || store?.cart !== false);
  if (store?.cart !== false) links.splice(1, 0, { h: "/cart", l: t.cart });

  return (
    <footer dir={t.dir} style={{ background: C1, borderTop: `1px solid ${BD}`, padding: "3rem 0 1.5rem", marginTop: "auto" }}>
      <div style={{ ...containerStyle, display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, background: A, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Crosshair size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", color: TXT }}>{store?.name || "EPIC STORE"}</span>
            </div>
            <p style={{ color: SUB, fontSize: "0.85rem", lineHeight: 1.7, marginBottom: 16 }}>{store?.hero?.subtitle || t.footerDesc}</p>
            <p style={{ color: C4, fontSize: "0.75rem" }}>© {year} {store?.name || "EPIC STORE"}. {t.rightsReserved}</p>
          </div>
          <div>
            <h4 style={{ color: TXT, fontSize: "0.9rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Sword size={16} color={A} />{t.quickLinks}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map((lnk) => (
                <Link key={lnk.h} href={lnk.h} style={{ color: SUB, textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = A)} onMouseLeave={(e) => (e.currentTarget.style.color = SUB)}>{lnk.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: TXT, fontSize: "0.9rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Headphones size={16} color={A} />{t.contactSect}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {store?.contact?.phone && (
                <a href={`tel:${store.contact.phone}`} style={{ color: SUB, textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <Phone size={14} color={A} />{store.contact.phone}
                </a>
              )}
              {store?.contact?.email && (
                <a href={`mailto:${store.contact.email}`} style={{ color: SUB, textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={14} color={A} />{store.contact.email}
                </a>
              )}
              {store?.contact?.wilaya && (
                <span style={{ color: SUB, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={14} color={A} />{store.contact.wilaya}{store?.contact?.address ? ` - ${store.contact.address}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 16, textAlign: "center", color: C4, fontSize: "0.75rem" }}>
          <Flame size={14} style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 6, color: A }} />
          {t.footerTagline}
        </div>
      </div>
    </footer>
  );
}

// ─── Card ─────────────────────────────────────────────────────────
export function Card({ product, displayImage, discount, store, viewDetails }: { product: Product; displayImage?: string; discount: number; store: any; viewDetails: () => void }) {
  const price = Number(product.price) || 0;
  const original = Number(product.priceOriginal) || 0;
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;

  return (
    <div onClick={viewDetails} style={{
      background: CARD, border: `1px solid ${BD}`, borderRadius: 8, overflow: "hidden",
      cursor: "pointer", transition: "transform 0.25s, box-shadow 0.25s", position: "relative",
    }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 12px 40px rgba(255,42,109,0.12)`; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      {discount > 0 && (
        <div style={{ position: "absolute", top: 12, left: 12, background: A, color: "#fff", fontSize: "0.75rem", fontWeight: 800, padding: "4px 10px", borderRadius: 4, zIndex: 2, animation: "pulseGlow 2s infinite" }}>
          -{discount}%
        </div>
      )}
      <div style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", background: C2 }}>
        {img && !imgErr ? (
          <img src={img} alt={product.name} onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Gamepad2 size={40} color={BD} />
          </div>
        )}
      </div>
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={12} fill={s <= 4 ? "#fbbf24" : "none"} color={s <= 4 ? "#fbbf24" : C4} />
          ))}
        </div>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: TXT, marginBottom: 10, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: A, fontWeight: 800, fontSize: "1rem" }}>{price.toLocaleString()} {store?.currency || 'DZD'}</span>
          {original > price && (
            <span style={{ color: C4, textDecoration: "line-through", fontSize: "0.8rem" }}>{original.toLocaleString()} {store?.currency || 'DZD'}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────
export function Home({ store, page }: { store: any; page: number }) {
  const searchParams = useSearchParams();
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const currency = store?.currency || 'DZD';
  const activeCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search");
  const products: Product[] = store?.products || [];
  const count = store?.count || products.length;
  const countPage = Math.ceil(count / 48);
  const cats = store?.categories || [];

  const trustIcons = [Truck, Shield, Zap, Headphones];
  const trustItems = t.trustItems.map((item, i) => ({ ...item, icon: trustIcons[i] }));

  return (
    <div dir={t.dir}>
      {/* Hero */}
      <section style={{ position: "relative", minHeight: "clamp(480px, 68vh, 760px)", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${C0} 0%, ${C1} 50%, ${C2} 100%)`, zIndex: 0 }} />
        {store?.hero?.imageUrl && (
          <div style={{ position: "absolute", inset: 0, opacity: 0.15, zIndex: 1 }}>
            <img src={store.hero.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,15,0.95) 0%, transparent 60%)", zIndex: 2 }} />
        <div style={{ ...containerStyle, position: "relative", zIndex: 3, padding: "4rem 1.5rem" }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: AL, border: `1px solid ${A}`, color: A, padding: "6px 14px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, marginBottom: 20, animation: "neonFlicker 2s infinite" }}>
              <Trophy size={14} />{t.heroBadge}
            </div>
            <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)", fontWeight: 900, color: TXT, lineHeight: 1.15, marginBottom: 20, textShadow: "0 2px 20px rgba(255,42,109,0.3)" }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || t.heroTitleDefault) }} />
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: SUB, lineHeight: 1.7, marginBottom: 32, maxWidth: 520 }}>{store?.hero?.subtitle || t.heroSubDefault}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/?page=1" style={{ ...btnPrimary, width: "auto", padding: "0.875rem 2rem" }}>
                <Crosshair size={18} />{t.shopNow}
              </Link>
              {store?.cart !== false && (
                <Link href="/cart" style={{ ...btnSecondary, width: "auto", padding: "0.875rem 2rem" }}>
                  <ShoppingCart size={18} />{t.cart}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section style={{ background: C1, borderBottom: `1px solid ${BD}`, padding: "2rem 0" }}>
        <div style={{ ...containerStyle, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
          {trustItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, background: C2, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BD}` }}>
                <item.icon size={20} color={A} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: TXT }}>{item.title}</div>
                <div style={{ fontSize: "0.75rem", color: SUB }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: "3rem 0" }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 800, color: TXT, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <Monitor size={24} color={A} />{t.catsTitle}
          </h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
            <Link href="/" style={{ padding: "8px 18px", borderRadius: 20, fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", border: `1px solid ${!activeCategory ? A : BD}`, background: !activeCategory ? AL : "transparent", color: !activeCategory ? A : SUB, transition: "all 0.2s" }}>
              {t.all}
            </Link>
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} style={{ padding: "8px 18px", borderRadius: 20, fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", border: `1px solid ${activeCategory === String(cat.id) ? A : BD}`, background: activeCategory === String(cat.id) ? AL : "transparent", color: activeCategory === String(cat.id) ? A : SUB, transition: "all 0.2s" }}>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Products */}
          {searchQuery && (
            <p style={{ color: SUB, fontSize: "0.9rem", marginBottom: 16 }}>{t.searchResultsFor} <span style={{ color: A, fontWeight: 700 }}>{searchQuery}</span></p>
          )}
          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: SUB }}>
              <Gamepad2 size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <p>{t.noProducts}</p>
            </div>
          ) : (
            <div className="products-grid" style={{ marginBottom: 40 }}>
              {products.map((p: Product) => {
                const price = Number(p.price) || 0;
                const original = Number(p.priceOriginal) || 0;
                const discount = original > price ? Math.round(((original - price) / original) * 100) : 0;
                return (
                  <Card key={p.id} product={p} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={discount} store={store} viewDetails={() => {}} />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {countPage > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {Array.from({ length: countPage }, (_, i) => i + 1).map((pg) => (
                <Link key={pg} href={{ query: { ...Object.fromEntries(searchParams.entries()), page: pg } }} scroll={false} style={{
                  width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "0.85rem", textDecoration: "none",
                  background: page === pg ? A : C2, color: page === pg ? "#fff" : SUB, border: `1px solid ${page === pg ? A : BD}`,
                  transition: "all 0.2s",
                }}>{pg}</Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Details ──────────────────────────────────────────────────────
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const [sel, setSel] = useState(0);
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const currency = store?.currency || 'DZD';
  const router = useRouter();

  return (
    <div dir={t.dir} style={{ padding: "2rem 0" }}>
      <div style={{ ...containerStyle }}>
        <div className="details-inner">
          {/* Gallery */}
          <div>
            <div style={{ position: "relative", aspectRatio: "1/1", background: C2, borderRadius: 12, overflow: "hidden", border: `1px solid ${BD}`, marginBottom: 12 }}>
              {(allImages[sel]?.imageUrl || product.productImage || product.imagesProduct?.[0]?.imageUrl) ? (
                <img src={allImages[sel]?.imageUrl || product.productImage || product.imagesProduct?.[0]?.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Gamepad2 size={56} color={BD} /></div>
              )}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setSel((s) => (s - 1 + allImages.length) % allImages.length)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(10,10,15,0.7)", border: `1px solid ${BD}`, color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setSel((s) => (s + 1) % allImages.length)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(10,10,15,0.7)", border: `1px solid ${BD}`, color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {discount > 0 && (
                <div style={{ position: "absolute", top: 12, left: 12, background: A, color: "#fff", fontSize: "0.8rem", fontWeight: 800, padding: "6px 12px", borderRadius: 6 }}>-{discount}%</div>
              )}
            </div>
            {allImages.length > 1 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {allImages.map((img: ProductImage, i: number) => (
                  <button key={img.id} onClick={() => setSel(i)} style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: `2px solid ${sel === i ? A : BD}`, padding: 0, cursor: "pointer", flexShrink: 0, background: C2 }}>
                    <img src={img.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill={s <= 4 ? "#fbbf24" : "none"} color={s <= 4 ? "#fbbf24" : C4} />
                ))}
              </div>
              <h1 style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 800, color: TXT, lineHeight: 1.3, marginBottom: 16 }}>{product.name}</h1>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
                <span style={{ fontSize: "1.75rem", fontWeight: 900, color: A }}>{Number(finalPrice).toLocaleString()} {currency}</span>
                {discount > 0 && (
                  <span style={{ fontSize: "1.1rem", color: C4, textDecoration: "line-through" }}>{Number(product.priceOriginal).toLocaleString()} {currency}</span>
                )}
              </div>
            </div>

            {/* Offers */}
            {product.offers && product.offers.length > 0 && (
              <div style={{ background: C1, border: `1px solid ${BD}`, borderRadius: 8, padding: "1rem" }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: TXT, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Crown size={16} color={A} />{t.offersTitle}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {product.offers.map((offer: Offer) => (
                    <label key={offer.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 6, border: `1px solid ${selectedOffer === offer.id ? A : BD}`, background: selectedOffer === offer.id ? AL : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
                      <input type="radio" name="offer" checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} style={{ accentColor: A }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: TXT }}>{offer.name}</div>
                        <div style={{ fontSize: "0.75rem", color: SUB }}>{offer.quantity} × {offer.price.toLocaleString()} {currency}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs && allAttrs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {allAttrs.map((attr: Attribute) => (
                  <div key={attr.id}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: SUB, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{attr.name}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {attr.variants.map((v: Variant) => {
                        const isSelected = selectedVariants[attr.name] === v.value;
                        if (attr.displayMode === "color") {
                          return (
                            <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} title={v.value} style={{ width: 32, height: 32, borderRadius: "50%", background: v.value, border: `2px solid ${isSelected ? A : "transparent"}`, boxShadow: isSelected ? `0 0 0 2px ${C0}, 0 0 0 4px ${A}` : "none", cursor: "pointer", padding: 0 }} />
                          );
                        }
                        if (attr.displayMode === "image") {
                          return (
                            <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", border: `2px solid ${isSelected ? A : BD}`, padding: 0, cursor: "pointer" }}>
                              <img src={v.value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </button>
                          );
                        }
                        return (
                          <button key={v.id} onClick={() => handleVariantSelection(attr.name, v.value)} style={{ padding: "6px 16px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700, border: `1px solid ${isSelected ? A : BD}`, background: isSelected ? AL : "transparent", color: isSelected ? A : TXT, cursor: "pointer", transition: "all 0.2s" }}>
                            {v.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <ProductForm product={product} userId={product.store?.userId} domain={domain} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} selectedVariants={selectedVariants} store={store} />

            {product.desc && (
              <div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: TXT, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Cpu size={16} color={A} />{t.descTitle}
                </h3>
                <div style={{ color: SUB, fontSize: "0.85rem", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ProductForm ──────────────────────────────────────────────────
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss: propPriceLoss, store }: ProductFormProps) {
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const currency = store?.currency || 'DZD';
  const [fd, setFd] = useState({
    customerId: "", customerName: "", customerPhone: "",
    customerWelaya: "", customerCommune: "",
    quantity: 1, priceLoss: propPriceLoss || 0,
    typeLivraison: "home" as "home" | "office",
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    if (userId) fetchWilayas(userId).then(setWilayas);
  }, [userId]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => w.id === fd.customerWelaya), [wilayas, fd.customerWelaya]);

  const getFP = useCallback((): number => {
    if (selectedOffer) {
      const offer = product.offers?.find((o) => o.id === selectedOffer);
      if (offer) return offer.price;
    }
    if (product.variantDetails && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return Number(product.price) || 0;
  }, [product, selectedOffer, selectedVariants]);

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === "home" ? selW.livraisonHome : selW.livraisonOfice;
  }, [selW, fd.typeLivraison]);

  const total = () => getFP() * fd.quantity + getLiv();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.customerName = t.errName;
    if (!fd.customerPhone.trim()) errs.customerPhone = t.errPhone;
    else if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) errs.customerPhone = t.errPhoneInvalid;
    if (!fd.customerWelaya) errs.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) errs.customerCommune = t.errCommune;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getVarId = (): string | number | null => {
    if (selectedOffer) return null;
    if (!product.variantDetails || !Object.keys(selectedVariants).length) return null;
    const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
    return match ? match.id : null;
  };

  const addToCart = () => {
    if (!validate()) return;
    const existing = localStorage.getItem(domain);
    const items = existing ? JSON.parse(existing) : [];
    const payload = {
      ...fd, product, variantDetailId: getVarId(), productId: product.id,
      storeId: product.store.id, userId, selectedOffer, selectedVariants, platform,
      finalPrice: getFP(), totalPrice: total(), priceLivraison: getLiv(), addedAt: new Date().toISOString(),
    };
    items.push(payload);
    localStorage.setItem(domain, JSON.stringify(items));
    initCount(items.length);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...fd, product, variantDetailId: getVarId(), productId: product.id,
        storeId: product.store.id, userId, selectedOffer, selectedVariants, platform,
        finalPrice: getFP(), totalPrice: total(), priceLivraison: getLiv(),
      };
      await axios.post(`${API_URL}/orders/create`, payload);
      localStorage.setItem("customerId", fd.customerId || "guest");
      router.push(`/successfully?productId=${product.id}`);
    } catch (err: any) {
      setErrors({ submit: err?.response?.data?.message || t.errSubmit });
    } finally { setSubmitting(false); }
  };

  const fp = getFP();

  return (
    <div style={{ background: C1, border: `1px solid ${BD}`, borderRadius: 12, padding: "1.5rem" }}>
      {success && (
        <div style={{ background: "rgba(0,245,212,0.1)", border: `1px solid ${SUCCESS}`, color: SUCCESS, padding: "12px 16px", borderRadius: 8, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 700 }}>
          <CheckCircle size={16} />{t.addedMsg}
        </div>
      )}

      {!isOrderNow ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C2, borderRadius: 8, padding: "10px 14px", border: `1px solid ${BD}` }}>
            <span style={{ color: SUB, fontSize: "0.85rem" }}>{t.qty}</span>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${BD}`, borderRadius: 6, overflow: "hidden" }}>
              <button onClick={() => setFd((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} style={{ width: 36, height: 36, background: C3, border: "none", color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
              <span style={{ width: 44, textAlign: "center", fontWeight: 700, fontSize: "0.9rem", color: TXT }}>{fd.quantity}</span>
              <button onClick={() => setFd((f) => ({ ...f, quantity: f.quantity + 1 }))} style={{ width: 36, height: 36, background: C3, border: "none", color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
            </div>
          </div>

          <div style={{ background: C2, borderRadius: 8, padding: "14px", border: `1px solid ${BD}` }}>
            {[
              { l: t.price, v: `${fp.toLocaleString()} ${currency}` },
              { l: t.qty, v: `× ${fd.quantity}` },
              { l: t.delivery, v: selW ? `${getLiv().toLocaleString()} ${currency}` : "—" },
            ].map((row) => (
              <div key={row.l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BD}`, fontSize: "0.85rem" }}>
                <span style={{ color: SUB }}>{row.l}</span>
                <span style={{ color: TXT, fontWeight: 700 }}>{row.v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 4 }}>
              <span style={{ color: TXT, fontWeight: 800 }}>{t.total}</span>
              <span style={{ color: A, fontWeight: 900, fontSize: "1.1rem" }}>{total().toLocaleString()} {currency}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
            {product.store?.cart === true && (
              <button onClick={addToCart} style={{ ...btnPrimary, background: C3, color: TXT, border: `1px solid ${BD}` }}>
                <ShoppingCart size={18} />{t.addToCart}
              </button>
            )}
            <button onClick={() => setIsOrderNow(true)} style={btnPrimary}>
              <Zap size={18} />{t.orderNow}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: TXT, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            <Send size={18} color={A} />{t.orderInfo}
          </h3>

          <div className="form-row-2">
            <div>
              <label style={{ fontSize: "0.8rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>{t.fullName} *</label>
              <input type="text" value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} style={{ ...inputBase, direction: isRTL ? 'rtl' : 'ltr', borderColor: errors.customerName ? "#EF4444" : BD }} placeholder={t.fullNamePh} />
              {errors.customerName && <p style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{errors.customerName}</p>}
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>{t.phone} *</label>
              <input type="tel" value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} style={{ ...inputBase, direction: isRTL ? 'rtl' : 'ltr', borderColor: errors.customerPhone ? "#EF4444" : BD }} placeholder={t.phonePh} />
              {errors.customerPhone && <p style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{errors.customerPhone}</p>}
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label style={{ fontSize: "0.8rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>{t.wilaya} *</label>
              <div style={{ position: "relative" }}>
                <ChevronDown size={12} style={{ position: "absolute", insetInlineStart: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
                <select value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: "" })} disabled={wilayas.length === 0} style={{ ...inputBase, direction: isRTL ? 'rtl' : 'ltr', paddingInlineStart: 36, borderColor: errors.customerWelaya ? "#EF4444" : BD }}>
                  <option value="">{wilayas.length === 0 ? t.wilayaNA : t.wilayaPh}</option>
                  {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                </select>
              </div>
              {errors.customerWelaya && <p style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{errors.customerWelaya}</p>}
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>{t.commune} *</label>
              <div style={{ position: "relative" }}>
                <ChevronDown size={12} style={{ position: "absolute", insetInlineStart: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
                <select value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })} disabled={!fd.customerWelaya || loadingC} style={{ ...inputBase, direction: isRTL ? 'rtl' : 'ltr', paddingInlineStart: 36, borderColor: errors.customerCommune ? "#EF4444" : BD }}>
                  <option value="">{loadingC ? t.communeLoading : t.communePh}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {errors.customerCommune && <p style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{errors.customerCommune}</p>}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>{t.deliveryType}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button type="button" onClick={() => setFd({ ...fd, typeLivraison: "home" })} style={{ padding: "10px", borderRadius: 6, border: `1px solid ${fd.typeLivraison === "home" ? A : BD}`, background: fd.typeLivraison === "home" ? AL : "transparent", color: fd.typeLivraison === "home" ? A : SUB, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>
                <Truck size={16} style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 6 }} />{t.deliveryHome}
              </button>
              <button type="button" onClick={() => setFd({ ...fd, typeLivraison: "office" })} style={{ padding: "10px", borderRadius: 6, border: `1px solid ${fd.typeLivraison === "office" ? A : BD}`, background: fd.typeLivraison === "office" ? AL : "transparent", color: fd.typeLivraison === "office" ? A : SUB, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>
                <MapPin size={16} style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 6 }} />{t.deliveryOffice}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C2, borderRadius: 8, padding: "10px 14px", border: `1px solid ${BD}` }}>
            <span style={{ color: SUB, fontSize: "0.85rem" }}>{t.qty}</span>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${BD}`, borderRadius: 6, overflow: "hidden" }}>
              <button type="button" onClick={() => setFd((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} style={{ width: 36, height: 36, background: C3, border: "none", color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
              <span style={{ width: 44, textAlign: "center", fontWeight: 700, fontSize: "0.9rem", color: TXT }}>{fd.quantity}</span>
              <button type="button" onClick={() => setFd((f) => ({ ...f, quantity: f.quantity + 1 }))} style={{ width: 36, height: 36, background: C3, border: "none", color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
            </div>
          </div>

          <div style={{ background: C2, borderRadius: 8, padding: "14px", border: `1px solid ${BD}` }}>
            {[
              { l: t.price, v: `${fp.toLocaleString()} ${currency}` },
              { l: t.qty, v: `× ${fd.quantity}` },
              { l: t.delivery, v: selW ? `${getLiv().toLocaleString()} ${currency}` : "—" },
            ].map((row) => (
              <div key={row.l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BD}`, fontSize: "0.85rem" }}>
                <span style={{ color: SUB }}>{row.l}</span>
                <span style={{ color: TXT, fontWeight: 700 }}>{row.v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 4 }}>
              <span style={{ color: TXT, fontWeight: 800 }}>{t.total}</span>
              <span style={{ color: A, fontWeight: 900, fontSize: "1.1rem" }}>{total().toLocaleString()} {currency}</span>
            </div>
          </div>

          {errors.submit && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #EF4444", color: "#EF4444", padding: "10px 14px", borderRadius: 8, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={16} />{errors.submit}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setIsOrderNow(false)} style={{ ...btnSecondary, flex: 1 }}>{t.back}</button>
            <button type="submit" disabled={submitting} style={{ ...btnPrimary, flex: 2, opacity: submitting ? 0.65 : 1 }}>
              {submitting ? t.sending : <><Send size={16} />{t.confirmOrder}</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Cart ─────────────────────────────────────────────────────────
export function Cart({ domain, store }: { domain: string; store: any }) {
  const t = T[getLang(store)];
  const isRTL = t.dir === 'rtl';
  const currency = store?.currency || 'DZD';
  const [items, setItems] = useState<any[]>([]);
  const [fd, setFd] = useState({
    customerId: "", customerName: "", customerPhone: "",
    customerWelaya: "", customerCommune: "",
    typeLivraison: "home" as "home" | "office",
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    const saved = localStorage.getItem(domain);
    if (saved) { try { setItems(JSON.parse(saved)); } catch {} }
  }, [domain]);

  useEffect(() => {
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => w.id === fd.customerWelaya), [wilayas, fd.customerWelaya]);

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === "home" ? selW.livraisonHome : selW.livraisonOfice;
  }, [selW, fd.typeLivraison]);

  const cartTotal = items.reduce((sum, it) => sum + (Number(it.finalPrice) || 0) * (it.quantity || 1), 0);
  const finalTotal = cartTotal + getLiv();

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    localStorage.setItem(domain, JSON.stringify(next));
    initCount(next.length);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.customerName = t.errName;
    if (!fd.customerPhone.trim()) errs.customerPhone = t.errPhone;
    else if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) errs.customerPhone = t.errPhoneInvalid;
    if (!fd.customerWelaya) errs.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) errs.customerCommune = t.errCommune;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orders = items.map((item) => ({
        ...fd, ...item, totalPrice: (Number(item.finalPrice) || 0) * (item.quantity || 1) + getLiv(), priceLivraison: getLiv(),
      }));
      for (const order of orders) {
        await axios.post(`${API_URL}/orders/create`, order);
      }
      localStorage.removeItem(domain);
      initCount(0);
      setSuccess(true);
    } catch (err: any) {
      setErrors({ submit: err?.response?.data?.message || t.errSubmit });
    } finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <div dir={t.dir} style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <div style={{ ...containerStyle, maxWidth: 480 }}>
          <CheckCircle size={64} color={SUCCESS} style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: TXT, marginBottom: 12 }}>{t.successTitle}</h2>
          <p style={{ color: SUB, marginBottom: 24 }}>{t.successDesc}</p>
          <Link href="/" style={{ ...btnPrimary, width: "auto", padding: "0.875rem 2rem" }}>{t.backToShop}</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div dir={t.dir} style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <div style={{ ...containerStyle, maxWidth: 480 }}>
          <ShoppingCart size={64} color={C4} style={{ marginBottom: 20, opacity: 0.5 }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: TXT, marginBottom: 12 }}>{t.cartEmpty}</h2>
          <p style={{ color: SUB, marginBottom: 24 }}>{t.cartEmptyDesc}</p>
          <Link href="/" style={{ ...btnPrimary, width: "auto", padding: "0.875rem 2rem" }}>{t.shopNow}</Link>
        </div>
      </div>
    );
  }

  return (
    <div dir={t.dir} style={{ padding: "2rem 0" }}>
      <div style={containerStyle}>
        <h1 style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 800, color: TXT, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <ShoppingCart size={24} color={A} />{t.myCart} ({items.length})
        </h1>
        <div className="cart-inner">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 10, padding: "1rem", display: "flex", gap: 16, alignItems: "center" }}>
                {(item.product?.productImage || item.product?.imagesProduct?.[0]?.imageUrl) ? (
                  <img src={item.product.productImage || item.product.imagesProduct[0].imageUrl} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, background: C2, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 80, height: 80, background: C2, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Gamepad2 size={28} color={BD} /></div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: TXT, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product?.name}</h3>
                  <div style={{ color: SUB, fontSize: "0.8rem", marginBottom: 4 }}>الكمية: {item.quantity || 1}</div>
                  <div style={{ color: A, fontWeight: 800, fontSize: "0.95rem" }}>{(Number(item.finalPrice) * (item.quantity || 1)).toLocaleString()} {store?.currency || 'DZD'}</div>
                </div>
                <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 8, borderRadius: 6, transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ background: C1, border: `1px solid ${BD}`, borderRadius: 12, padding: "1.5rem", height: "fit-content" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: TXT, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <Send size={18} color={A} />إتمام الطلب
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>الاسم الكامل *</label>
                <input type="text" value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} style={{ ...inputBase, borderColor: errors.customerName ? "#EF4444" : BD }} placeholder="أدخل اسمك" />
                {errors.customerName && <p style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{errors.customerName}</p>}
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>رقم الهاتف *</label>
                <input type="tel" value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} style={{ ...inputBase, borderColor: errors.customerPhone ? "#EF4444" : BD }} placeholder="05xxxxxxxx" />
                {errors.customerPhone && <p style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{errors.customerPhone}</p>}
              </div>
              <div className="form-row-2">
                <div>
                  <label style={{ fontSize: "0.8rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>الولاية *</label>
                  <div style={{ position: "relative" }}>
                    <ChevronDown size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
                    <select value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: "" })} disabled={wilayas.length === 0} style={{ ...inputBase, paddingLeft: 36, borderColor: errors.customerWelaya ? "#EF4444" : BD }}>
                      <option value="">{wilayas.length === 0 ? "التوصيل غير متاح" : "اختر الولاية"}</option>
                      {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                  {errors.customerWelaya && <p style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{errors.customerWelaya}</p>}
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>البلدية *</label>
                  <div style={{ position: "relative" }}>
                    <ChevronDown size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
                    <select value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })} disabled={!fd.customerWelaya || loadingC} style={{ ...inputBase, paddingLeft: 36, borderColor: errors.customerCommune ? "#EF4444" : BD }}>
                      <option value="">{loadingC ? "جاري التحميل..." : "اختر البلدية"}</option>
                      {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {errors.customerCommune && <p style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{errors.customerCommune}</p>}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>نوع التوصيل</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button type="button" onClick={() => setFd({ ...fd, typeLivraison: "home" })} style={{ padding: "10px", borderRadius: 6, border: `1px solid ${fd.typeLivraison === "home" ? A : BD}`, background: fd.typeLivraison === "home" ? AL : "transparent", color: fd.typeLivraison === "home" ? A : SUB, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                    <Truck size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: 6 }} />توصيل للمنزل
                  </button>
                  <button type="button" onClick={() => setFd({ ...fd, typeLivraison: "office" })} style={{ padding: "10px", borderRadius: 6, border: `1px solid ${fd.typeLivraison === "office" ? A : BD}`, background: fd.typeLivraison === "office" ? AL : "transparent", color: fd.typeLivraison === "office" ? A : SUB, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                    <MapPin size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: 6 }} />مكتب بريد
                  </button>
                </div>
              </div>

              <div style={{ background: C2, borderRadius: 8, padding: "14px", border: `1px solid ${BD}` }}>
                {[
                  { l: "المجموع الفرعي", v: `${cartTotal.toLocaleString()} دج` },
                  { l: "التوصيل", v: selW ? `${getLiv().toLocaleString()} دج` : "—" },
                ].map((row) => (
                  <div key={row.l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BD}`, fontSize: "0.85rem" }}>
                    <span style={{ color: SUB }}>{row.l}</span>
                    <span style={{ color: TXT, fontWeight: 700 }}>{row.v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 4 }}>
                  <span style={{ color: TXT, fontWeight: 800 }}>الإجمالي</span>
                  <span style={{ color: A, fontWeight: 900, fontSize: "1.1rem" }}>{finalTotal.toLocaleString()} دج</span>
                </div>
              </div>

              {errors.submit && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #EF4444", color: "#EF4444", padding: "10px 14px", borderRadius: 8, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertCircle size={16} />{errors.submit}
                </div>
              )}

              <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.65 : 1 }}>
                {submitting ? "جاري الإرسال..." : <><Send size={16} />تأكيد الطلب</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Static Pages ─────────────────────────────────────────────────
function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div dir="rtl" style={{ padding: "3rem 0" }}>
      <div style={{ ...containerStyle, maxWidth: 800 }}>
        <div style={{ background: `linear-gradient(135deg, ${C1} 0%, ${C2} 100%)`, border: `1px solid ${BD}`, borderRadius: 16, padding: "2.5rem", marginBottom: 32, textAlign: "center" }}>
          <Shield size={40} color={A} style={{ marginBottom: 12 }} />
          <h1 style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 900, color: TXT }}>{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: "1.5rem", marginBottom: 16 }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 800, color: A, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <Crosshair size={16} />{title}
      </h3>
      <p style={{ color: SUB, fontSize: "0.9rem", lineHeight: 1.8 }}>{body}</p>
    </div>
  );
}

export function Privacy() {
  return (
    <Shell title="سياسة الخصوصية">
      <InfoBlock title="جمع البيانات" body="نقوم بجمع المعلومات الضرورية فقط لمعالجة طلباتك وتحسين تجربة التسوق. لا نشارك بياناتك مع أطراف ثالثة دون إذنك." />
      <InfoBlock title="استخدام المعلومات" body="تُستخدم بياناتك لتوصيل الطلبات والتواصل معك بخصوص حالة الشحن فقط." />
      <InfoBlock title="حماية البيانات" body="نستخدم تقنيات تشفير حديثة لحماية معلوماتك الشخصية من الوصول غير المصرح به." />
    </Shell>
  );
}

export function Terms() {
  return (
    <Shell title="الشروط والأحكام">
      <InfoBlock title="الاستخدام" body="باستخدامك لهذا الموقع، فإنك توافق على الالتزام بجميع الشروط والأحكام الموضحة هنا." />
      <InfoBlock title="الطلبات" body="جميع الطلبات خاضعة للتوفر. نحتفظ بالحق في إلغاء أي طلب في حالة عدم توفر المنتج." />
      <InfoBlock title="الإرجاع" body="يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام شريطة أن تكون بحالتها الأصلية." />
    </Shell>
  );
}

export function Cookies() {
  return (
    <Shell title="سياسة الكوكيز">
      <InfoBlock title="ما هي الكوكيز" body="الكوكيز هي ملفات نصية صغيرة تُخزن على جهازك لتحسين تجربة التصفح." />
      <InfoBlock title="كيف نستخدمها" body="نستخدم الكوكيز لتذكر تفضيلاتك وعناصر سلة التسوق وتحليل حركة المرور." />
      <InfoBlock title="التحكم" body="يمكنك تعطيل الكوكيز من إعدادات المتصفح، لكن قد يؤثر ذلك على بعض الوظائف." />
    </Shell>
  );
}

export function Contact({ store }: { store: any }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setErr("");
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id });
      setSent(true);
    } catch (err: any) {
      setErr(err?.response?.data?.message || "حدث خطأ");
    } finally { setSending(false); }
  };

  if (sent) {
    return (
      <div dir="rtl" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <div style={{ ...containerStyle, maxWidth: 480 }}>
          <CheckCircle size={64} color={SUCCESS} style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: TXT, marginBottom: 12 }}>تم إرسال رسالتك!</h2>
          <p style={{ color: SUB, marginBottom: 24 }}>شكراً لتواصلك معنا، سنرد عليك في أقرب وقت</p>
          <button onClick={() => setSent(false)} style={{ ...btnPrimary, width: "auto", padding: "0.875rem 2rem" }}>إرسال رسالة أخرى</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ padding: "2rem 0" }}>
      <div style={{ ...containerStyle, maxWidth: 900 }}>
        <h1 style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 800, color: TXT, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <Headphones size={24} color={A} />اتصل بنا
        </h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: TXT, marginBottom: 16 }}>معلومات التواصل</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {store?.contact?.phone && (
                  <a href={`tel:${store.contact.phone}`} style={{ color: SUB, textDecoration: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: C2, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Phone size={16} color={A} /></div>
                    {store.contact.phone}
                  </a>
                )}
                {store?.contact?.email && (
                  <a href={`mailto:${store.contact.email}`} style={{ color: SUB, textDecoration: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: C2, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Mail size={16} color={A} /></div>
                    {store.contact.email}
                  </a>
                )}
                {store?.contact?.wilaya && (
                  <span style={{ color: SUB, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: C2, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={16} color={A} /></div>
                    {store.contact.wilaya}{store?.contact?.address ? ` - ${store.contact.address}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: TXT, marginBottom: 4 }}>أرسل رسالة</h3>
            <div className="form-row-2">
              <input type="text" placeholder="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputBase} />
              <input type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputBase} />
            </div>
            <input type="tel" placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputBase} />
            <textarea placeholder="رسالتك..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...inputBase, resize: "none" }} />
            {err && <p style={{ color: "#EF4444", fontSize: "0.85rem" }}>{err}</p>}
            <button type="submit" disabled={sending} style={{ ...btnPrimary, opacity: sending ? 0.65 : 1 }}>
              {sending ? "جاري الإرسال..." : <><Send size={16} />إرسال</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: { staticPage?: string; page?: string; store: any }) {
  const p = (staticPage || page || "").toLowerCase();
  if (p === "privacy") return <Privacy />;
  if (p === "terms") return <Terms />;
  if (p === "cookies") return <Cookies />;
  if (p === "contact") return <Contact store={store} />;
  return <Privacy />;
}
