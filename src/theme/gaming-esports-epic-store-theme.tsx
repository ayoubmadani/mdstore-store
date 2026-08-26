"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import DOMPurify from "dompurify";
import axios from "axios";
import { useCartStore } from "@/store/useCartStore";
import {
  ShoppingCart, Search, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  Star, Trash2, Phone, Mail, MapPin, Send, AlertCircle, Minus, Plus,
  Gamepad2, Shield, Truck, Headphones, Zap, Trophy, Monitor, Cpu,
  Crosshair, Sword, Crown, Flame, CheckCircle, Package,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface Offer { id: string; name: string; quantity: number; price: number; subTitle?: string; shippingFree?: boolean; }
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
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; slug?: string; shippingFree?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
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
const A  = "#ff2a6d";
const AL = "rgba(255,42,109,0.12)";
const TXT  = "#e8e8f0";
const SUB  = "#8b8ba0";
const BD   = "#2a2a3e";
const CARD = "#141420";
const SURFACE = "#1e1e2e";
const SUCCESS = "#00f5d4";

// ─── Shared styles ────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: "100%", padding: "0.75rem 1rem", fontSize: "0.9rem",
  border: `1px solid ${BD}`, borderRadius: 6, background: SURFACE,
  color: TXT, outline: "none", appearance: "none", transition: "border-color 0.2s",
  fontFamily: "inherit",
};
const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "0.875rem 1.5rem", minHeight: 44, background: A, color: "#fff",
  fontWeight: 700, fontSize: "0.9rem", border: "none", borderRadius: 6,
  cursor: "pointer", transition: "opacity 0.2s", fontFamily: "inherit", width: "100%",
};
const btnSecondary: React.CSSProperties = {
  ...btnPrimary, background: "transparent", color: A, border: `1px solid ${A}`,
};
const container: React.CSSProperties = { maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" };

// ─── Helpers ──────────────────────────────────────────────────────
const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try { const r = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`); return r.data || []; } catch { return []; }
};
const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try { const r = await axios.get(`${API_URL}/shipping/get-communes/${wid}`); return r.data || []; } catch { return []; }
};
function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e: any) => e.attrName === n && e.value === v));
}

// ─── Translations ─────────────────────────────────────────────────
const jsonAr = {
  dir: "rtl" as const,
  home: "الرئيسية", contact: "اتصل بنا", cart: "السلة",
  search: "ابحث عن منتج...", searching: "جاري البحث...", noResults: "لا توجد نتائج", showAll: "عرض كل النتائج ←",
  all: "الكل", noProducts: "لا توجد منتجات متاحة حالياً", shopNow: "تسوق الآن", searchFor: "نتائج البحث عن:",
  heroBadge: "أفضل متجر للألعاب في الجزائر",
  heroTitle: "جهّز معسكرك القتالي الآن",
  heroSub: "أحدث الأجهزة، الإكسسوارات، والألعاب بأسعار تنافسية",
  catsTitle: "التصنيفات",
  trust: [
    { title: "شحن سريع",     desc: "توصيل خلال 24-48 ساعة" },
    { title: "جودة مضمونة",  desc: "منتجات أصلية 100%" },
    { title: "دفع آمن",      desc: "حماية كاملة للبيانات" },
    { title: "دعم 24/7",     desc: "فريق متخصص للمساعدة" },
  ],
  fullName: "الاسم الكامل", fullNamePh: "أدخل اسمك", errName: "الاسم مطلوب",
  phone: "رقم الهاتف", phonePh: "05xxxxxxxx", errPhone: "رقم الهاتف مطلوب", errPhoneInvalid: "رقم هاتف غير صالح",
  wilaya: "الولاية", errWilaya: "الولاية مطلوبة", wilayaPh: "اختر الولاية", wilayaNA: "التوصيل غير متاح حالياً",
  commune: "البلدية", errCommune: "البلدية مطلوبة", communePh: "اختر البلدية", communeLoading: "جاري التحميل...",
  deliveryType: "نوع التوصيل", deliveryHome: "توصيل للمنزل", deliveryOffice: "مكتب بريد",
  qty: "الكمية", price: "السعر", delivery: "التوصيل", total: "الإجمالي", subtotal: "المجموع الفرعي",
  orderInfo: "معلومات الطلب", addToCart: "أضف إلى السلة", orderNow: "اطلب الآن",
  confirmOrder: "تأكيد الطلب", sending: "جاري الإرسال...", back: "رجوع",
  addedMsg: "تمت الإضافة إلى السلة!", errSubmit: "حدث خطأ أثناء إرسال الطلب",
  myCart: "السلة", cartEmpty: "السلة فارغة", cartEmptyDesc: "لم تضف أي منتجات بعد",
  successTitle: "تم إرسال طلبك!", successDesc: "سنتواصل معك قريباً لتأكيد التفاصيل",
  backToShop: "العودة للتسوق", checkoutTitle: "إتمام الطلب",
  successSteps: [
    { title: "تم استلام طلبك", desc: "تم تسجيل طلبك بنجاح في نظامنا" },
    { title: "تأكيد الطلب", desc: "سنتصل بك خلال 24 ساعة" },
    { title: "التجهيز والتغليف", desc: "يتم تجهيز طلبك بعناية" },
    { title: "الشحن والتوصيل", desc: "2-5 أيام عمل" },
  ],
  offersTitle: "العروض المتاحة", descTitle: "الوصف",
  freeShippingBadge: "توصيل مجاني",
  freeShippingThreshold: "توصيل مجاني عند الشراء بأكثر من {{amount}}",
  freeShippingRemaining: "أضف {{amount}} لتحصل على توصيل مجاني",
  freeShippingReached: "مبروك! لديك توصيل مجاني 🎉",
  quickLinks: "روابط سريعة", legalNav: "قانوني", contactSect: "تواصل معنا",
  privacy: "الخصوصية", terms: "الشروط", cookies: "الكوكيز", rightsReserved: "جميع الحقوق محفوظة",
  footerDesc: "أفضل منتجات الألعاب والرياضات الإلكترونية",
  footerTag: "صُمم بشغف لعالم الألعاب",
  contactTitle: "اتصل بنا", contactInfoTitle: "معلومات التواصل", contactFormTitle: "أرسل رسالة",
  namePh: "الاسم", emailPh: "البريد الإلكتروني", phonePh2: "رقم الهاتف", messagePh: "رسالتك...",
  sendBtn: "إرسال", sentTitle: "تم إرسال رسالتك!", sentDesc: "شكراً لتواصلك معنا، سنرد عليك قريباً",
  sendAnother: "إرسال رسالة أخرى", contactErr: "حدث خطأ",
  privacyTitle: "سياسة الخصوصية",
  privDataTitle: "جمع البيانات", privDataBody: "نجمع المعلومات الضرورية فقط لمعالجة طلباتك وتحسين تجربة التسوق. لا نشارك بياناتك مع أطراف ثالثة.",
  privUseTitle: "استخدام المعلومات", privUseBody: "تُستخدم بياناتك لتوصيل الطلبات والتواصل معك بخصوص حالة الشحن فقط.",
  privSecTitle: "حماية البيانات", privSecBody: "نستخدم تقنيات تشفير حديثة لحماية معلوماتك الشخصية.",
  termsTitle: "الشروط والأحكام",
  termsUseTitle: "الاستخدام", termsUseBody: "باستخدامك لهذا الموقع، فإنك توافق على جميع الشروط والأحكام الموضحة هنا.",
  termsOrdTitle: "الطلبات", termsOrdBody: "جميع الطلبات خاضعة للتوفر. نحتفظ بالحق في إلغاء أي طلب عند عدم توفر المنتج.",
  termsRetTitle: "الإرجاع", termsRetBody: "يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام بحالتها الأصلية.",
  cookiesTitle: "سياسة الكوكيز",
  cookWhatTitle: "ما هي الكوكيز", cookWhatBody: "ملفات نصية صغيرة تُخزن على جهازك لتحسين تجربة التصفح.",
  cookHowTitle: "كيف نستخدمها", cookHowBody: "نستخدمها لحفظ تفضيلاتك وعناصر السلة وتحليل حركة الزيارات.",
  cookCtrlTitle: "التحكم", cookCtrlBody: "يمكنك تعطيل الكوكيز من إعدادات المتصفح مع احتمال التأثير على بعض الوظائف.",
};

const jsonFr = {
  dir: "ltr" as const,
  home: "Accueil", contact: "Contact", cart: "Panier",
  search: "Rechercher un produit...", searching: "Recherche...", noResults: "Aucun résultat", showAll: "Voir tous les résultats →",
  all: "Tout", noProducts: "Aucun produit disponible pour le moment.", shopNow: "Voir la boutique", searchFor: "Résultats pour :",
  heroBadge: "La meilleure boutique gaming en Algérie",
  heroTitle: "Équipez votre camp de combat maintenant",
  heroSub: "Découvrez les derniers équipements, accessoires et jeux à prix compétitifs",
  catsTitle: "Catégories",
  trust: [
    { title: "Livraison rapide",    desc: "Livraison en 24-48h" },
    { title: "Qualité garantie",    desc: "Produits authentiques 100%" },
    { title: "Paiement sécurisé",  desc: "Protection complète des données" },
    { title: "Support 24/7",        desc: "Équipe spécialisée disponible" },
  ],
  fullName: "Nom complet", fullNamePh: "Votre nom", errName: "Le nom est requis",
  phone: "Téléphone", phonePh: "0555 12 34 56", errPhone: "Le numéro est requis", errPhoneInvalid: "Numéro invalide",
  wilaya: "Wilaya", errWilaya: "Sélectionnez une wilaya", wilayaPh: "Choisir la wilaya", wilayaNA: "Livraison indisponible",
  commune: "Commune", errCommune: "Sélectionnez une commune", communePh: "Choisir la commune", communeLoading: "Chargement...",
  deliveryType: "Type de livraison", deliveryHome: "À domicile", deliveryOffice: "Point relais",
  qty: "Quantité", price: "Prix", delivery: "Livraison", total: "Total", subtotal: "Sous-total",
  orderInfo: "Informations commande", addToCart: "Ajouter au panier", orderNow: "Commander",
  confirmOrder: "Confirmer la commande", sending: "Envoi...", back: "Annuler",
  addedMsg: "Ajouté au panier ✓", errSubmit: "Une erreur est survenue",
  myCart: "Mon Panier", cartEmpty: "Votre panier est vide", cartEmptyDesc: "Découvrez notre sélection.",
  successTitle: "Commande confirmée !", successDesc: "Notre équipe vous contactera bientôt.",
  backToShop: "Retour à la boutique", checkoutTitle: "Finaliser la commande",
  successSteps: [
    { title: "Commande reçue", desc: "Votre commande a été enregistrée avec succès" },
    { title: "Confirmation", desc: "Nous vous appellerons sous 24h" },
    { title: "Préparation", desc: "Votre commande est préparée avec soin" },
    { title: "Livraison", desc: "2-5 jours ouvrables" },
  ],
  offersTitle: "Offres groupées", descTitle: "Description",
  freeShippingBadge: "Livraison gratuite",
  freeShippingThreshold: "Livraison gratuite à partir de {{amount}}",
  freeShippingRemaining: "Ajoutez {{amount}} pour bénéficier de la livraison gratuite",
  freeShippingReached: "Bravo ! Vous avez la livraison gratuite 🎉",
  quickLinks: "Navigation", legalNav: "Légal", contactSect: "Contact",
  privacy: "Confidentialité", terms: "Conditions", cookies: "Cookies", rightsReserved: "Tous droits réservés.",
  footerDesc: "Les meilleurs produits gaming et e-sports",
  footerTag: "Conçu avec passion pour le gaming",
  contactTitle: "Contactez-nous", contactInfoTitle: "Informations de contact", contactFormTitle: "Envoyer un message",
  namePh: "Nom", emailPh: "Adresse e-mail", phonePh2: "Numéro de téléphone", messagePh: "Votre message...",
  sendBtn: "Envoyer", sentTitle: "Message envoyé !", sentDesc: "Merci, nous vous répondrons dans les plus brefs délais.",
  sendAnother: "Envoyer un autre message", contactErr: "Une erreur est survenue",
  privacyTitle: "Politique de confidentialité",
  privDataTitle: "Collecte des données", privDataBody: "Nous collectons uniquement les informations nécessaires au traitement de vos commandes.",
  privUseTitle: "Utilisation", privUseBody: "Vos données servent uniquement à la livraison et au suivi de commandes.",
  privSecTitle: "Protection", privSecBody: "Nous utilisons des technologies de chiffrement modernes pour protéger vos données.",
  termsTitle: "Conditions générales",
  termsUseTitle: "Utilisation", termsUseBody: "En utilisant ce site vous acceptez les présentes conditions générales.",
  termsOrdTitle: "Commandes", termsOrdBody: "Toutes les commandes sont soumises à disponibilité.",
  termsRetTitle: "Retours", termsRetBody: "Retours acceptés dans les 14 jours suivant la réception.",
  cookiesTitle: "Politique des cookies",
  cookWhatTitle: "Que sont les cookies ?", cookWhatBody: "Petits fichiers stockés sur votre appareil pour améliorer votre navigation.",
  cookHowTitle: "Comment nous les utilisons", cookHowBody: "Pour mémoriser vos préférences, le panier et analyser le trafic.",
  cookCtrlTitle: "Contrôle", cookCtrlBody: "Vous pouvez les désactiver dans les paramètres de votre navigateur.",
};

const jsonEn = {
  dir: "ltr" as const,
  home: "Home", contact: "Contact", cart: "Cart",
  search: "Search products...", searching: "Searching...", noResults: "No results found", showAll: "View all results →",
  all: "All", noProducts: "No products available.", shopNow: "Shop Now", searchFor: "Results for:",
  heroBadge: "Algeria's best gaming store",
  heroTitle: "Gear up your combat camp now",
  heroSub: "Discover the latest gear, accessories and games at competitive prices",
  catsTitle: "Categories",
  trust: [
    { title: "Fast Shipping",      desc: "Delivery in 24-48h" },
    { title: "Quality Guaranteed", desc: "100% authentic products" },
    { title: "Secure Payment",     desc: "Full data protection" },
    { title: "24/7 Support",       desc: "Specialist team available" },
  ],
  fullName: "Full Name", fullNamePh: "Your name", errName: "Name is required",
  phone: "Phone", phonePh: "05xxxxxxxx", errPhone: "Phone is required", errPhoneInvalid: "Invalid phone number",
  wilaya: "Wilaya", errWilaya: "Select a wilaya", wilayaPh: "Choose wilaya", wilayaNA: "Delivery unavailable",
  commune: "Commune", errCommune: "Select a commune", communePh: "Choose commune", communeLoading: "Loading...",
  deliveryType: "Delivery type", deliveryHome: "Home delivery", deliveryOffice: "Post office",
  qty: "Quantity", price: "Price", delivery: "Delivery", total: "Total", subtotal: "Subtotal",
  orderInfo: "Order information", addToCart: "Add to cart", orderNow: "Order now",
  confirmOrder: "Confirm order", sending: "Processing...", back: "Cancel",
  addedMsg: "Added to cart!", errSubmit: "An error occurred",
  myCart: "Cart", cartEmpty: "Your cart is empty", cartEmptyDesc: "You haven't added any products yet.",
  successTitle: "Order placed!", successDesc: "We'll contact you shortly to confirm details.",
  backToShop: "Back to shopping", checkoutTitle: "Complete order",
  successSteps: [
    { title: "Order received", desc: "Your order has been registered successfully" },
    { title: "Confirmation", desc: "We'll call you within 24 hours" },
    { title: "Packaging", desc: "Your order is being prepared with care" },
    { title: "Shipping", desc: "2-5 business days" },
  ],
  offersTitle: "Bundle offers", descTitle: "Description",
  freeShippingBadge: "Free Delivery",
  freeShippingThreshold: "Free delivery on orders over {{amount}}",
  freeShippingRemaining: "Add {{amount}} more to get free delivery",
  freeShippingReached: "Congrats! You have free delivery 🎉",
  quickLinks: "Quick links", legalNav: "Legal", contactSect: "Contact us",
  privacy: "Privacy", terms: "Terms", cookies: "Cookies", rightsReserved: "All rights reserved.",
  footerDesc: "Best gaming and e-sports products",
  footerTag: "Designed with passion for gaming",
  contactTitle: "Contact Us", contactInfoTitle: "Contact information", contactFormTitle: "Send a message",
  namePh: "Name", emailPh: "Email address", phonePh2: "Phone number", messagePh: "Your message...",
  sendBtn: "Send", sentTitle: "Message sent!", sentDesc: "Thank you for reaching out. We'll get back to you soon.",
  sendAnother: "Send another message", contactErr: "An error occurred",
  privacyTitle: "Privacy Policy",
  privDataTitle: "Data Collection", privDataBody: "We collect only the information needed to process your orders and improve your shopping experience.",
  privUseTitle: "Use of Information", privUseBody: "Your data is used solely for order delivery and shipping communication.",
  privSecTitle: "Data Protection", privSecBody: "We use modern encryption to protect your personal information.",
  termsTitle: "Terms & Conditions",
  termsUseTitle: "Usage", termsUseBody: "By using this site you agree to all terms and conditions stated here.",
  termsOrdTitle: "Orders", termsOrdBody: "All orders are subject to availability.",
  termsRetTitle: "Returns", termsRetBody: "Returns accepted within 14 days of receipt in original condition.",
  cookiesTitle: "Cookie Policy",
  cookWhatTitle: "What are cookies?", cookWhatBody: "Small text files stored on your device to improve your browsing experience.",
  cookHowTitle: "How we use them", cookHowBody: "To remember preferences, cart items and analyse traffic.",
  cookCtrlTitle: "Control", cookCtrlBody: "You can disable cookies in your browser settings.",
};

type Lang = "ar" | "fr" | "en";
const getLang = (store?: any): Lang => {
  if (store?.language === "fr") return "fr";
  if (store?.language === "en") return "en";
  return "ar";
};
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr as any, en: jsonEn as any };

// ─── Main ─────────────────────────────────────────────────────────
export default function Main({ store, children, domain }: { store: any; children: React.ReactNode; domain: string }) {
  const pathname = usePathname();
  const t = T[getLang(store)];
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div dir={t.dir} style={{ background: C0, color: TXT, minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes flicker{0%,100%{opacity:1}50%{opacity:.85}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,42,109,.35)}50%{box-shadow:0 0 16px 4px rgba(255,42,109,.12)}}
        .pgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}
        @media(min-width:768px){.pgrid{grid-template-columns:repeat(3,1fr)}}
        @media(min-width:1200px){.pgrid{grid-template-columns:repeat(4,1fr)}}
        .form2{display:grid;grid-template-columns:1fr 1fr;gap:.875rem}
        @media(max-width:500px){.form2{grid-template-columns:1fr}}
        .cart-layout{display:grid;grid-template-columns:1fr;gap:2rem}
        @media(min-width:900px){.cart-layout{grid-template-columns:1.3fr 1fr}}
        .det-layout{display:grid;grid-template-columns:1fr;gap:2rem}
        @media(min-width:768px){.det-layout{grid-template-columns:1fr 1fr}}
        .nav-desktop{display:flex;align-items:center;gap:24px}
        .nav-mobile-btn{display:none}
        @media(max-width:720px){.nav-desktop{display:none}.nav-mobile-btn{display:flex}}
        .trust-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.25rem}
        @media(min-width:640px){.trust-grid{grid-template-columns:repeat(4,1fr)}}
        @keyframes gMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .g-marquee-track{display:inline-flex;white-space:nowrap;animation:gMarquee 26s linear infinite}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:${C0}}
        ::-webkit-scrollbar-thumb{background:${C4};border-radius:3px}
      `}</style>
      <Navbar store={store} domain={domain} />
      <main style={{ minHeight: "60vh" }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────
export function Navbar({ store, domain }: { store: any; domain: string }) {
  const t = T[getLang(store)];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const count = useCartStore((s) => s.count);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => {
    const saved = localStorage.getItem(domain);
    if (saved) try { initCount(JSON.parse(saved).length); } catch {}
  }, [domain, initCount]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      setLoading(true);
      axios.get(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(query)}`)
        .then((r) => setResults(r.data?.products || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 380);
  }, [query, domain]);

  const navLinks = [
    { h: "/", l: t.home },
    { h: "/contact", l: t.contact },
  ];

  const cartLink = store?.cart !== false ? { h: "/cart", l: t.cart } : null;

  const lnkStyle: React.CSSProperties = {
    color: SUB, textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, transition: "color .2s",
  };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(10,10,15,.96)" : C0,
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: `1px solid ${scrolled ? BD : "transparent"}`,
      transition: "all .3s",
    }}>
      {/* ticker — always visible */}
      <div style={{ background: A, color: "#fff", overflow: "hidden", height: 34, display: "flex", alignItems: "center" }}>
        <div className="g-marquee-track" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} style={{ padding: "0 48px", display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Truck size={13} style={{ flexShrink: 0 }} />
              {store?.topBar?.text || "توصيل لجميع ولايات الجزائر"}
            </span>
          ))}
        </div>
      </div>
      <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          {!imgErr && store?.design?.logoUrl ? (
            <img src={store.design.logoUrl} alt={store?.name || ''} onError={() => setImgErr(true)} style={{ height: 36, width: 'auto', maxWidth: 160, objectFit: "contain" }} />
          ) : (
            <>
              <div style={{ width: 36, height: 36, background: A, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Crosshair size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", color: TXT, whiteSpace: "nowrap" }}>{store?.name || "EPIC STORE"}</span>
            </>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="nav-desktop">
          {navLinks.map((lnk) => (
            <Link key={lnk.h} href={lnk.h} style={lnkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = A)}
              onMouseLeave={(e) => (e.currentTarget.style.color = SUB)}>
              {lnk.l}
            </Link>
          ))}

          {/* Search */}
          <div ref={searchRef} style={{ position: "relative" }}>
            <form onSubmit={(e) => { e.preventDefault(); if (query.trim()) { router.push(`/?search=${encodeURIComponent(query)}`); setShowDrop(false); } }}
              style={{ display: "flex", alignItems: "center", background: C2, border: `1px solid ${BD}`, borderRadius: 6, padding: "6px 10px", gap: 8 }}>
              <Search size={15} color={SUB} />
              <input type="text" value={query} placeholder={t.search} dir={t.dir}
                onChange={(e) => { setQuery(e.target.value); setShowDrop(true); }}
                onFocus={() => query.length >= 2 && setShowDrop(true)}
                style={{ background: "transparent", border: "none", outline: "none", color: TXT, width: 170, fontSize: "0.85rem", fontFamily: "inherit" }} />
              {query && <button type="button" onClick={() => { setQuery(""); setResults([]); setShowDrop(false); }}
                style={{ background: "none", border: "none", color: SUB, cursor: "pointer", padding: 0, display: "flex" }}>
                <X size={14} />
              </button>}
            </form>

            {showDrop && query.length >= 2 && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", [t.dir === "rtl" ? "right" : "left"]: 0, width: 340, background: CARD, border: `1px solid ${BD}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,.5)", zIndex: 200 }}>
                {loading ? (
                  <div style={{ padding: "1rem", textAlign: "center", color: SUB, fontSize: "0.85rem" }}>{t.searching}</div>
                ) : results.length === 0 ? (
                  <div style={{ padding: "1rem", textAlign: "center", color: SUB, fontSize: "0.85rem" }}>{t.noResults}</div>
                ) : (
                  <>
                    {results.slice(0, 5).map((p) => (
                      <Link key={p.id} href={`/product/${p.slug || p.id}`}
                        onClick={() => { setShowDrop(false); setQuery(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", textDecoration: "none", color: TXT, borderBottom: `1px solid ${BD}` }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C2)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        {(p.productImage || (p as any).imagesProduct?.[0]?.imageUrl) && (
                          <img src={p.productImage || (p as any).imagesProduct[0].imageUrl} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: "0.85rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                      </Link>
                    ))}
                    <Link href={`/?search=${encodeURIComponent(query)}`} onClick={() => setShowDrop(false)}
                      style={{ display: "block", padding: "10px 12px", textAlign: "center", color: A, fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>
                      {t.showAll}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {cartLink && (
            <Link href={cartLink.h} style={{ position: "relative", color: TXT, textDecoration: "none" }}>
              <ShoppingCart size={22} />
              {count > 0 && (
                <span style={{ position: "absolute", top: -6, insetInlineEnd: -6, background: A, color: "#fff", fontSize: "0.65rem", fontWeight: 800, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>
              )}
            </Link>
          )}
        </nav>

        {/* Mobile buttons */}
        <div className="nav-mobile-btn" style={{ alignItems: "center", gap: 14 }}>
          {cartLink && (
            <Link href={cartLink.h} style={{ position: "relative", color: TXT, textDecoration: "none" }}>
              <ShoppingCart size={22} />
              {count > 0 && (
                <span style={{ position: "absolute", top: -6, insetInlineEnd: -6, background: A, color: "#fff", fontSize: "0.65rem", fontWeight: 800, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>
              )}
            </Link>
          )}
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: TXT, cursor: "pointer", padding: 4, display: "flex" }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: C1, borderTop: `1px solid ${BD}`, padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: 4 }}>
          {[...navLinks, ...(cartLink ? [cartLink] : [])].map((lnk) => (
            <Link key={lnk.h} href={lnk.h} onClick={() => setOpen(false)}
              style={{ color: TXT, textDecoration: "none", fontWeight: 600, padding: "10px 0", borderBottom: `1px solid ${BD}`, fontSize: "0.95rem" }}>
              {lnk.l}
            </Link>
          ))}
          <div style={{ marginTop: 8 }}>
            <form style={{ display: "flex", alignItems: "center", background: C2, border: `1px solid ${BD}`, borderRadius: 6, padding: "8px 12px", gap: 8 }}
              onSubmit={(e) => { e.preventDefault(); if (query.trim()) { router.push(`/?search=${encodeURIComponent(query)}`); setOpen(false); setQuery(""); setResults([]); } }}>
              <Search size={15} color={SUB} />
              <input type="text" value={query} placeholder={t.search} dir={t.dir} autoComplete="off"
                onChange={(e) => { setQuery(e.target.value); setShowDrop(true); }}
                style={{ background: "transparent", border: "none", outline: "none", color: TXT, flex: 1, fontSize: "0.9rem", fontFamily: "inherit" }} />
              {query && (
                <button type="button" onClick={() => { setQuery(""); setResults([]); }}
                  style={{ background: "none", border: "none", color: SUB, cursor: "pointer", padding: 0, display: "flex" }}>
                  <X size={14} />
                </button>
              )}
            </form>
            {query.length >= 2 && (
              <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 8, overflow: "hidden", marginTop: 6 }}>
                {loading ? (
                  <div style={{ padding: "0.75rem", textAlign: "center", color: SUB, fontSize: "0.85rem" }}>{t.searching}</div>
                ) : results.length === 0 ? (
                  <div style={{ padding: "0.75rem", textAlign: "center", color: SUB, fontSize: "0.85rem" }}>{t.noResults}</div>
                ) : (
                  <>
                    {results.slice(0, 5).map((p) => (
                      <Link key={p.id} href={`/product/${p.slug || p.id}`}
                        onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", textDecoration: "none", color: TXT, borderBottom: `1px solid ${BD}` }}>
                        {(p.productImage || (p as any).imagesProduct?.[0]?.imageUrl) && (
                          <img src={p.productImage || (p as any).imagesProduct[0].imageUrl} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: "0.85rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                      </Link>
                    ))}
                    <Link href={`/?search=${encodeURIComponent(query)}`}
                      onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
                      style={{ display: "block", padding: "10px 12px", textAlign: "center", color: A, fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>
                      {t.showAll}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
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
    ...(store?.cart !== false ? [{ h: "/cart", l: t.cart }] : []),
    { h: "/contact", l: t.contact },
  ];
  const legalLinks = [
    { h: "/privacy", l: t.privacy },
    { h: "/terms", l: t.terms },
    { h: "/cookies", l: t.cookies },
  ];

  return (
    <footer dir={t.dir} style={{ background: C1, borderTop: `1px solid ${BD}`, padding: "2.5rem 0 1rem" }}>
      <div style={{ ...container, display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "2rem" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, background: A, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Crosshair size={16} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, color: TXT }}>{store?.name || "EPIC STORE"}</span>
            </div>
            <p style={{ color: SUB, fontSize: "0.85rem", lineHeight: 1.7 }}>{t.footerDesc}</p>
            <p style={{ color: C4, fontSize: "0.75rem", marginTop: 10 }}>© {year} {store?.name || "EPIC STORE"}. {t.rightsReserved}</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: TXT, fontWeight: 700, marginBottom: 14, fontSize: "0.9rem" }}>{t.quickLinks}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {links.map((lnk) => (
                <Link key={lnk.h} href={lnk.h} style={{ color: SUB, textDecoration: "none", fontSize: "0.85rem" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = A)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = SUB)}>
                  {lnk.l}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: TXT, fontWeight: 700, marginBottom: 14, fontSize: "0.9rem" }}>{t.legalNav}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {legalLinks.map((lnk) => (
                <Link key={lnk.h} href={lnk.h} style={{ color: SUB, textDecoration: "none", fontSize: "0.85rem" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = A)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = SUB)}>
                  {lnk.l}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: TXT, fontWeight: 700, marginBottom: 14, fontSize: "0.9rem" }}>{t.contactSect}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {store?.contact?.phone && (
                <a href={`tel:${store.contact.phone}`} style={{ color: SUB, textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <Phone size={13} color={A} />{store.contact.phone}
                </a>
              )}
              {store?.contact?.email && (
                <a href={`mailto:${store.contact.email}`} style={{ color: SUB, textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={13} color={A} />{store.contact.email}
                </a>
              )}
              {store?.contact?.wilaya && (
                <span style={{ color: SUB, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={13} color={A} />{store.contact.wilaya}{store.contact.address ? ` — ${store.contact.address}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 12, textAlign: "center", color: C4, fontSize: "0.75rem" }}>
          <Flame size={13} style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 5, color: A }} />
          {t.footerTag}
        </div>
      </div>
    </footer>
  );
}

// ─── Card ─────────────────────────────────────────────────────────
export function Card({ product, displayImage, discount, store, viewDetails }: { product: Product; displayImage?: string; discount: number; store: any; viewDetails: () => void }) {
  const price    = Number(product.price) || 0;
  const original = Number(product.priceOriginal) || 0;
  const currency = store?.currency || "DZD";
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product.productImage || product.imagesProduct?.[0]?.imageUrl;

  return (
    <Link href={`/product/${product.slug || product.id}`} style={{ textDecoration: "none", display: "block", background: CARD, border: `1px solid ${BD}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", transition: "transform .25s,box-shadow .25s", position: "relative" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 30px rgba(255,42,109,.12)`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
      {discount > 0 && (
        <div style={{ position: "absolute", top: 10, insetInlineStart: 10, background: A, color: "#fff", fontSize: "0.7rem", fontWeight: 800, padding: "3px 8px", borderRadius: 4, zIndex: 2 }}>
          -{discount}%
        </div>
      )}
      {product.shippingFree && (
        <div style={{ position: "absolute", top: 10, insetInlineEnd: 10, background: SUCCESS, color: C0, fontSize: "0.7rem", fontWeight: 800, padding: "3px 8px", borderRadius: 4, zIndex: 2 }}>
          🚚
        </div>
      )}
      <div style={{ aspectRatio: "1/1", overflow: "hidden", background: C2 }}>
        {img && !imgErr ? (
          <img src={img} alt={product.name} onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Gamepad2 size={36} color={BD} />
          </div>
        )}
      </div>
      <div style={{ padding: "0.875rem" }}>
        <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
          {[1,2,3,4,5].map((s) => <Star key={s} size={11} fill={s <= 4 ? "#fbbf24" : "none"} color={s <= 4 ? "#fbbf24" : C4} />)}
        </div>
        <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: TXT, marginBottom: 8, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: A, fontWeight: 800, fontSize: "0.95rem" }}>{price.toLocaleString()} {currency}</span>
          {original > price && <span style={{ color: C4, textDecoration: "line-through", fontSize: "0.78rem" }}>{original.toLocaleString()} {currency}</span>}
        </div>
      </div>
    </Link>
  );
}

// ─── Home ─────────────────────────────────────────────────────────
export function Home({ store, page }: { store: any; page: number }) {
  const searchParams = useSearchParams();
  const t = T[getLang(store)];
  const currency = store?.currency || "DZD";
  const activeCategory = searchParams.get("category");
  const searchQuery    = searchParams.get("search");
  const products: Product[] = store?.products || [];
  const count    = store?.count || products.length;
  const pageCount = Math.ceil(count / 48);
  const cats = store?.categories || [];
  const trustIcons = [Truck, Shield, Zap, Headphones];

  return (
    <div dir={t.dir}>
      {/* Hero */}
      <section style={{ position: "relative", minHeight: "clamp(440px,65vh,720px)", display: "flex", alignItems: "center", overflow: "hidden", background: C0 }}>
        {store?.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18, display: "block" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to ${t.dir === "rtl" ? "left" : "right"}, ${C0} 45%, rgba(10,10,15,.4) 100%)` }} />
        <div style={{ ...container, position: "relative", zIndex: 1, padding: "3rem 1.5rem", width: "100%" }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: AL, border: `1px solid ${A}`, color: A, padding: "5px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, marginBottom: 18 }}>
              <Trophy size={13} />
              {t.heroBadge}
            </div>
            <h1 dir="auto" style={{ fontSize: "clamp(1.6rem,4.5vw,3rem)", fontWeight: 900, color: TXT, lineHeight: 1.2, marginBottom: 16, wordBreak: "break-word" }}>
              {store?.hero?.title || t.heroTitle}
            </h1>
            <p dir="auto" style={{ fontSize: "clamp(0.9rem,1.8vw,1.1rem)", color: SUB, lineHeight: 1.7, marginBottom: 28, maxWidth: 480,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {store?.hero?.subtitle || t.heroSub}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/?page=1" style={{ ...btnPrimary, width: "auto", padding: "0.75rem 1.75rem" }}>
                <Crosshair size={16} />{t.shopNow}
              </Link>
              {store?.cart !== false && (
                <Link href="/cart" style={{ ...btnSecondary, width: "auto", padding: "0.75rem 1.75rem" }}>
                  <ShoppingCart size={16} />{t.cart}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ background: C1, borderBottom: `1px solid ${BD}`, padding: "1.5rem 0" }}>
        <div style={{ ...container }}>
          <div className="trust-grid">
            {t.trust.map((item, i) => {
              const Icon = trustIcons[i];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, background: C2, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${BD}` }}>
                    <Icon size={18} color={A} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: TXT }}>{item.title}</div>
                    <div style={{ fontSize: "0.73rem", color: SUB }}>{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories + Products */}
      <section style={{ padding: "2.5rem 0" }}>
        <div style={container}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: TXT, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
            <Monitor size={20} color={A} />{t.catsTitle}
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            <Link href="/" style={{ padding: "6px 16px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 700, textDecoration: "none", border: `1px solid ${!activeCategory ? A : BD}`, background: !activeCategory ? AL : "transparent", color: !activeCategory ? A : SUB }}>
              {t.all}
            </Link>
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`} style={{ padding: "6px 16px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 700, textDecoration: "none", border: `1px solid ${activeCategory === String(cat.id) ? A : BD}`, background: activeCategory === String(cat.id) ? AL : "transparent", color: activeCategory === String(cat.id) ? A : SUB }}>
                {cat.name}
              </Link>
            ))}
          </div>

          {searchQuery && (
            <p style={{ color: SUB, fontSize: "0.875rem", marginBottom: 14 }}>
              {t.searchFor} <span style={{ color: A, fontWeight: 700 }}>{searchQuery}</span>
            </p>
          )}

          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: SUB }}>
              <Gamepad2 size={44} style={{ marginBottom: 14, opacity: 0.3, display: "block", margin: "0 auto 14px" }} />
              <p>{t.noProducts}</p>
            </div>
          ) : (
            <div className="pgrid" style={{ marginBottom: 36 }}>
              {products.map((p: Product) => {
                const pr = Number(p.price) || 0;
                const or = Number(p.priceOriginal) || 0;
                const disc = or > pr ? Math.round(((or - pr) / or) * 100) : 0;
                return <Card key={p.id} product={p} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={disc} store={store} viewDetails={() => {}} />;
              })}
            </div>
          )}

          {pageCount > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((pg) => (
                <Link key={pg} href={{ query: { ...Object.fromEntries(searchParams.entries()), page: pg } }} scroll={false}
                  style={{ width: 38, height: 38, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", background: page === pg ? A : C2, color: page === pg ? "#fff" : SUB, border: `1px solid ${page === pg ? A : BD}` }}>
                  {pg}
                </Link>
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
  const [imgErr, setImgErr] = useState(false);
  const t = T[getLang(store)];
  const currency = store?.currency || "DZD";

  const imgs: string[] = useMemo(() => Array.from(new Set([
    product?.productImage,
    ...(product?.imagesProduct?.map((i: any) => i?.imageUrl) || []),
    ...(Array.isArray(allImages) ? allImages.map((i: any) => typeof i === "string" ? i : i?.imageUrl) : []),
  ].filter(Boolean) as string[])), [product, allImages]);

  const mainSrc = imgs[sel] || "";

  return (
    <div dir={t.dir} style={{ padding: "2rem 0" }}>
      <div style={container}>
        <div className="det-layout">
          {/* Gallery */}
          <div>
            <div style={{ position: "relative", aspectRatio: "1/1", background: C2, borderRadius: 10, overflow: "hidden", border: `1px solid ${BD}`, marginBottom: 10 }}>
              {mainSrc && !imgErr ? (
                <img src={mainSrc} alt={product.name} onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Gamepad2 size={52} color={BD} /></div>
              )}
              {imgs.length > 1 && (
                <>
                  <button onClick={() => { setSel((s) => (s - 1 + imgs.length) % imgs.length); setImgErr(false); }} style={{ position: "absolute", insetInlineStart: 10, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: "50%", background: "rgba(10,10,15,.7)", border: `1px solid ${BD}`, color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {t.dir === "rtl" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                  <button onClick={() => { setSel((s) => (s + 1) % imgs.length); setImgErr(false); }} style={{ position: "absolute", insetInlineEnd: 10, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: "50%", background: "rgba(10,10,15,.7)", border: `1px solid ${BD}`, color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {t.dir === "rtl" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </>
              )}
              {discount > 0 && (
                <div style={{ position: "absolute", top: 10, insetInlineStart: 10, background: A, color: "#fff", fontSize: "0.78rem", fontWeight: 800, padding: "4px 10px", borderRadius: 4 }}>-{discount}%</div>
              )}
            </div>
            {imgs.length > 1 && (
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {imgs.map((url: string, i: number) => (
                  <button key={i} onClick={() => { setSel(i); setImgErr(false); }} style={{ width: 64, height: 64, borderRadius: 6, overflow: "hidden", border: `2px solid ${sel === i ? A : BD}`, padding: 0, cursor: "pointer", flexShrink: 0, background: C2 }}>
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
              {[1,2,3,4,5].map((s) => <Star key={s} size={15} fill={s <= 4 ? "#fbbf24" : "none"} color={s <= 4 ? "#fbbf24" : C4} />)}
            </div>
            <h1 style={{ fontSize: "clamp(1.15rem,2.5vw,1.6rem)", fontWeight: 800, color: TXT, lineHeight: 1.3 }}>{product.name}</h1>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: "1.6rem", fontWeight: 900, color: A }}>{Number(finalPrice).toLocaleString()} {currency}</span>
              {discount > 0 && <span style={{ fontSize: "1rem", color: C4, textDecoration: "line-through" }}>{Number(product.priceOriginal).toLocaleString()} {currency}</span>}
            </div>

            {(product.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
              <div style={{ padding: "10px 14px", border: `1px solid ${SUCCESS}`, borderRadius: 6, background: "rgba(0,245,212,0.06)", fontSize: "0.8rem", fontWeight: 700, color: SUCCESS }}>
                🚚 {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace("{{amount}}", `${Number(store.freeShippingMinAmount).toLocaleString()} ${currency}`)}
              </div>
            )}

            {product.offers && product.offers.length > 0 && (
              <div style={{ background: C1, border: `1px solid ${BD}`, borderRadius: 8, padding: "1rem" }}>
                <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: TXT, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Crown size={14} color={A} />{t.offersTitle}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {product.offers.map((offer: Offer) => (
                    <label key={offer.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, border: `1px solid ${selectedOffer === offer.id ? A : BD}`, background: selectedOffer === offer.id ? AL : "transparent", cursor: "pointer" }}>
                      <input type="radio" name="offer" checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} style={{ accentColor: A }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: TXT }}>{offer.name}</div>
                        {offer.subTitle && <div style={{ fontSize: "0.73rem", color: SUB }}>{offer.subTitle}</div>}
                        <div style={{ fontSize: "0.73rem", color: SUB }}>{offer.quantity} × {offer.price.toLocaleString()} {currency}</div>
                        {offer.shippingFree && <div style={{ fontSize: "0.73rem", color: SUCCESS, fontWeight: 700 }}>🚚 {t.freeShippingBadge}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {allAttrs && allAttrs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {allAttrs.map((attr: Attribute) => (
                  <div key={attr.id}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: SUB, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{attr.name}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {attr.variants.map((v: Variant) => {
                        const isSel = selectedVariants[attr.name] === v.value;
                        const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                          Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                            ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                          )
                        );
                        if (attr.displayMode === "color") return (
                          <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.value} style={{ width: 30, height: 30, borderRadius: "50%", background: v.value, border: `2px solid ${isSel ? A : "transparent"}`, outline: isSel ? `2px solid ${A}` : "none", outlineOffset: 2, cursor: available ? "pointer" : "not-allowed", padding: 0, opacity: available ? 1 : 0.35 }} />
                        );
                        if (attr.displayMode === "image") return (
                          <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ width: 42, height: 42, borderRadius: 6, overflow: "hidden", border: `2px solid ${isSel ? A : BD}`, padding: 0, cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.35 }}>
                            <img src={v.value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </button>
                        );
                        return (
                          <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ padding: "5px 14px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700, border: `1px solid ${isSel ? A : BD}`, background: isSel ? AL : "transparent", color: isSel ? A : (available ? TXT : "#555"), cursor: available ? "pointer" : "not-allowed", textDecoration: available ? "none" : "line-through" }}>
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
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: TXT, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Cpu size={15} color={A} />{t.descTitle}
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
  const isRTL = t.dir === "rtl";
  const currency = store?.currency || "DZD";
  const [fd, setFd] = useState({ customerId: "", customerName: "", customerPhone: "", customerWelaya: "", customerCommune: "", quantity: 1, priceLoss: propPriceLoss || 0, typeLivraison: "home" as "home" | "office" });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);

  const getFP = useCallback(() => {
    if (selectedOffer) { const o = product.offers?.find((x) => x.id === selectedOffer); if (o) return o.price; }
    if (product.variantDetails && Object.keys(selectedVariants).length) {
      const m = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
      if (m && m.price !== -1) return m.price;
    }
    return Number(product.price) || 0;
  }, [product, selectedOffer, selectedVariants]);

  const fp = getFP();
  const supportQty = (store?.supportQty ?? product?.store?.supportQty) !== false;
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = product.offers?.find((o) => o.id === selectedOffer);
  const orderFreeShipping = !!(product.shippingFree || selOfferObj?.shippingFree ||
    (store?.supportFreeShipping && store?.freeShippingMinAmount != null && (fp * qty) >= Number(store.freeShippingMinAmount)));
  const getLiv = useCallback(() => {
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return Number(fd.typeLivraison === "home" ? selW.livraisonHome : selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping]);

  const total = () => fp * qty + getLiv();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.customerName = t.errName;
    if (!fd.customerPhone.trim()) errs.customerPhone = t.errPhone;
    else if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) errs.customerPhone = t.errPhoneInvalid;
    if (!fd.customerWelaya) errs.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) errs.customerCommune = t.errCommune;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getVId = () => {
    if (selectedOffer || !product.variantDetails || !Object.keys(selectedVariants).length) return null;
    return product.variantDetails.find((d) => variantMatches(d, selectedVariants))?.id ?? null;
  };

  const addToCart = () => {
    if (!validate()) return;
    const items = (() => { try { return JSON.parse(localStorage.getItem(domain) || "[]"); } catch { return []; } })();
    items.push({ ...fd, quantity: qty, product, variantDetailId: getVId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform, finalPrice: getFP(), totalPrice: total(), priceLivraison: getLiv(), addedAt: new Date().toISOString() });
    localStorage.setItem(domain, JSON.stringify(items));
    initCount(items.length);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, { ...fd, quantity: qty, product, variantDetailId: getVId(), productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform, finalPrice: getFP(), totalPrice: total(), priceLivraison: getLiv() });
      router.push(`/successfully?productId=${product.id}`);
    } catch (err: any) {
      setErrors({ submit: err?.response?.data?.message || t.errSubmit });
    } finally { setSubmitting(false); }
  };

  const FormField = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label style={{ fontSize: "0.78rem", color: SUB, marginBottom: 5, display: "block", fontWeight: 600 }}>{label} *</label>
      {children}
      {error && <p style={{ fontSize: "0.73rem", color: "#EF4444", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={10} />{error}</p>}
    </div>
  );

  return (
    <div style={{ background: C1, border: `1px solid ${BD}`, borderRadius: 10, padding: "1.25rem" }}>
      {added && (
        <div style={{ background: "rgba(0,245,212,.1)", border: `1px solid ${SUCCESS}`, color: SUCCESS, padding: "10px 14px", borderRadius: 8, marginBottom: 14, display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 700 }}>
          <CheckCircle size={15} />{t.addedMsg}
        </div>
      )}

      {!isOrderNow ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Qty */}
          {supportQty && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C2, borderRadius: 8, padding: "9px 12px", border: `1px solid ${BD}` }}>
              <span style={{ color: SUB, fontSize: "0.82rem" }}>{t.qty}</span>
              <div style={{ display: "flex", alignItems: "center", border: `1px solid ${BD}`, borderRadius: 6, overflow: "hidden" }}>
                <button onClick={() => setFd((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} style={{ width: 34, height: 34, background: C3, border: "none", color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={13} /></button>
                <span style={{ width: 40, textAlign: "center", fontWeight: 700, color: TXT }}>{fd.quantity}</span>
                <button onClick={() => setFd((f) => ({ ...f, quantity: f.quantity + 1 }))} style={{ width: 34, height: 34, background: C3, border: "none", color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={13} /></button>
              </div>
            </div>
          )}

          {/* Summary */}
          <div style={{ background: C2, borderRadius: 8, padding: "12px", border: `1px solid ${BD}` }}>
            {[{ l: t.price, v: `${fp.toLocaleString()} ${currency}` }, { l: t.qty, v: `× ${qty}` }, { l: t.delivery, v: !selW ? "—" : orderFreeShipping ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${currency}` }].map((r) => (
              <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BD}`, fontSize: "0.82rem" }}>
                <span style={{ color: SUB }}>{r.l}</span><span style={{ color: TXT, fontWeight: 700 }}>{r.v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, marginTop: 2 }}>
              <span style={{ color: TXT, fontWeight: 800 }}>{t.total}</span>
              <span style={{ color: A, fontWeight: 900, fontSize: "1.05rem" }}>{total().toLocaleString()} {currency}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {product.store?.cart === true && (
              <button onClick={addToCart} style={{ ...btnPrimary, background: C3, color: TXT, border: `1px solid ${BD}` }}>
                <ShoppingCart size={16} />{t.addToCart}
              </button>
            )}
            <button onClick={() => setIsOrderNow(true)} style={btnPrimary}>
              <Zap size={16} />{t.orderNow}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: TXT, marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
            <Send size={16} color={A} />{t.orderInfo}
          </h3>

          <div className="form2">
            <FormField label={t.fullName} error={errors.customerName}>
              <input type="text" value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} style={{ ...inputBase, direction: isRTL ? "rtl" : "ltr", borderColor: errors.customerName ? "#EF4444" : BD }} />
            </FormField>
            <FormField label={t.phone} error={errors.customerPhone}>
              <input type="tel" value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} style={{ ...inputBase, direction: "ltr", borderColor: errors.customerPhone ? "#EF4444" : BD }} />
            </FormField>
          </div>

          <div className="form2">
            <FormField label={t.wilaya} error={errors.customerWelaya}>
              <div style={{ position: "relative" }}>
                <ChevronDown size={12} style={{ position: "absolute", insetInlineStart: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
                <select value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: "" })} disabled={wilayas.length === 0} style={{ ...inputBase, paddingInlineStart: 30, direction: isRTL ? "rtl" : "ltr", borderColor: errors.customerWelaya ? "#EF4444" : BD }}>
                  <option value="">{wilayas.length === 0 ? t.wilayaNA : t.wilayaPh}</option>
                  {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                </select>
              </div>
            </FormField>
            <FormField label={t.commune} error={errors.customerCommune}>
              <div style={{ position: "relative" }}>
                <ChevronDown size={12} style={{ position: "absolute", insetInlineStart: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
                <select value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })} disabled={!fd.customerWelaya || loadingC} style={{ ...inputBase, paddingInlineStart: 30, direction: isRTL ? "rtl" : "ltr", borderColor: errors.customerCommune ? "#EF4444" : BD }}>
                  <option value="">{loadingC ? t.communeLoading : t.communePh}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </FormField>
          </div>

          {/* Delivery type */}
          <div>
            <label style={{ fontSize: "0.78rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>{t.deliveryType}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["home", "office"] as const).map((type) => (
                <button key={type} type="button" onClick={() => setFd({ ...fd, typeLivraison: type })} style={{ padding: "9px 8px", borderRadius: 6, border: `1px solid ${fd.typeLivraison === type ? A : BD}`, background: fd.typeLivraison === type ? AL : "transparent", color: fd.typeLivraison === type ? A : SUB, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {type === "home" ? <Truck size={14} /> : <MapPin size={14} />}
                  {type === "home" ? t.deliveryHome : t.deliveryOffice}
                </button>
              ))}
            </div>
          </div>

          {/* Qty in order mode */}
          {supportQty && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C2, borderRadius: 8, padding: "9px 12px", border: `1px solid ${BD}` }}>
              <span style={{ color: SUB, fontSize: "0.82rem" }}>{t.qty}</span>
              <div style={{ display: "flex", alignItems: "center", border: `1px solid ${BD}`, borderRadius: 6, overflow: "hidden" }}>
                <button type="button" onClick={() => setFd((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} style={{ width: 34, height: 34, background: C3, border: "none", color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={13} /></button>
                <span style={{ width: 40, textAlign: "center", fontWeight: 700, color: TXT }}>{fd.quantity}</span>
                <button type="button" onClick={() => setFd((f) => ({ ...f, quantity: f.quantity + 1 }))} style={{ width: 34, height: 34, background: C3, border: "none", color: TXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={13} /></button>
              </div>
            </div>
          )}

          {/* Summary */}
          <div style={{ background: C2, borderRadius: 8, padding: "12px", border: `1px solid ${BD}` }}>
            {[{ l: t.price, v: `${fp.toLocaleString()} ${currency}` }, { l: t.qty, v: `× ${qty}` }, { l: t.delivery, v: !selW ? "—" : orderFreeShipping ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${currency}` }].map((r) => (
              <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BD}`, fontSize: "0.82rem" }}>
                <span style={{ color: SUB }}>{r.l}</span><span style={{ color: TXT, fontWeight: 700 }}>{r.v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, marginTop: 2 }}>
              <span style={{ color: TXT, fontWeight: 800 }}>{t.total}</span>
              <span style={{ color: A, fontWeight: 900, fontSize: "1.05rem" }}>{total().toLocaleString()} {currency}</span>
            </div>
          </div>

          {errors.submit && (
            <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid #EF4444", color: "#EF4444", padding: "9px 12px", borderRadius: 8, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={14} />{errors.submit}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setIsOrderNow(false)} style={{ ...btnSecondary, flex: 1 }}>{t.back}</button>
            <button type="submit" disabled={submitting} style={{ ...btnPrimary, flex: 2, opacity: submitting ? 0.65 : 1 }}>
              {submitting ? t.sending : <><Send size={15} />{t.confirmOrder}</>}
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
  const isRTL = t.dir === "rtl";
  const currency = store?.currency || "DZD";
  const [items, setItems] = useState<any[]>([]);
  const [fd, setFd] = useState({ customerId: "", customerName: "", customerPhone: "", customerWelaya: "", customerCommune: "", typeLivraison: "home" as "home" | "office" });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const initCount = useCartStore((s) => s.initCount);

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(domain) || "[]")); } catch {} }, [domain]);
  useEffect(() => { if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [store]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = useMemo(() => wilayas.find((w) => String(w.id) === String(fd.customerWelaya)), [wilayas, fd.customerWelaya]);
  const cartTotal = items.reduce((s, it) => s + (Number(it.finalPrice) || 0) * (it.quantity || 1), 0);

  const hasFreeShippingItem = items.some((it) => it.product?.shippingFree || it.product?.offers?.find((o: Offer) => o.id === it.selectedOffer)?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;

  const getLiv = useCallback(() => {
    if (freeShippingReached) return 0;
    if (!selW) return 0;
    return Number(fd.typeLivraison === "home" ? selW.livraisonHome : selW.livraisonOfice);
  }, [selW, fd.typeLivraison, freeShippingReached]);
  const finalTotal = cartTotal + getLiv();

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next); localStorage.setItem(domain, JSON.stringify(next)); initCount(next.length);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fd.customerName.trim()) errs.customerName = t.errName;
    if (!fd.customerPhone.trim()) errs.customerPhone = t.errPhone;
    else if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) errs.customerPhone = t.errPhoneInvalid;
    if (!fd.customerWelaya) errs.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) errs.customerCommune = t.errCommune;
    setErrors(errs); return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      for (const item of items) {
        await axios.post(`${API_URL}/orders/create`, { ...fd, ...item, totalPrice: (Number(item.finalPrice) || 0) * (item.quantity || 1) + getLiv(), priceLivraison: getLiv() });
      }
      localStorage.removeItem(domain); initCount(0); setSuccess(true);
    } catch (err: any) {
      setErrors({ submit: err?.response?.data?.message || t.errSubmit });
    } finally { setSubmitting(false); }
  };

  if (success) return (
    <div dir={t.dir} style={{ padding: "4rem 1rem", textAlign: "center" }}>
      <div style={{ ...container, maxWidth: 440 }}>
        <CheckCircle size={60} color={SUCCESS} style={{ marginBottom: 18, display: "block", margin: "0 auto 18px" }} />
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: TXT, marginBottom: 10 }}>{t.successTitle}</h2>
        <p style={{ color: SUB, marginBottom: 22 }}>{t.successDesc}</p>
        <Link href="/" style={{ ...btnPrimary, width: "auto", padding: "0.75rem 1.75rem", display: "inline-flex" }}>{t.backToShop}</Link>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div dir={t.dir} style={{ padding: "4rem 1rem", textAlign: "center" }}>
      <div style={{ ...container, maxWidth: 440 }}>
        <ShoppingCart size={56} color={C4} style={{ marginBottom: 16, display: "block", margin: "0 auto 16px", opacity: 0.4 }} />
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: TXT, marginBottom: 10 }}>{t.cartEmpty}</h2>
        <p style={{ color: SUB, marginBottom: 22 }}>{t.cartEmptyDesc}</p>
        <Link href="/" style={{ ...btnPrimary, width: "auto", padding: "0.75rem 1.75rem", display: "inline-flex" }}>{t.shopNow}</Link>
      </div>
    </div>
  );

  return (
    <div dir={t.dir} style={{ padding: "2rem 0" }}>
      <div style={container}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: TXT, marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
          <ShoppingCart size={22} color={A} />{t.myCart} ({items.length})
        </h1>
        {freeShippingMin != null && (
          <div style={{
            border: `1px solid ${freeShippingReached ? SUCCESS : BD}`, borderRadius: 8,
            background: freeShippingReached ? "rgba(0,245,212,0.06)" : C1, padding: "12px 16px", marginBottom: 20,
            color: freeShippingReached ? SUCCESS : SUB, fontSize: "0.85rem", fontWeight: 700,
          }}>
            {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace("{{amount}}", `${Number(freeShippingRemainingAmt).toLocaleString()} ${currency}`)}
          </div>
        )}
        <div className="cart-layout">
          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 8, padding: "0.875rem", display: "flex", gap: 14, alignItems: "center" }}>
                {(item.product?.productImage || item.product?.imagesProduct?.[0]?.imageUrl) ? (
                  <img src={item.product.productImage || item.product.imagesProduct[0].imageUrl} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 72, height: 72, background: C2, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Gamepad2 size={24} color={BD} /></div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: TXT, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product?.name}</h3>
                  <div style={{ color: SUB, fontSize: "0.78rem", marginBottom: 3 }}>{t.qty}: {item.quantity || 1}</div>
                  <div style={{ color: A, fontWeight: 800 }}>{(Number(item.finalPrice) * (item.quantity || 1)).toLocaleString()} {currency}</div>
                </div>
                <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout form */}
          <div style={{ background: C1, border: `1px solid ${BD}`, borderRadius: 10, padding: "1.25rem", height: "fit-content" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: TXT, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Send size={16} color={A} />{t.checkoutTitle}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: SUB, marginBottom: 5, display: "block", fontWeight: 600 }}>{t.fullName} *</label>
                <input type="text" value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })} placeholder={t.fullNamePh} style={{ ...inputBase, direction: isRTL ? "rtl" : "ltr", borderColor: errors.customerName ? "#EF4444" : BD }} />
                {errors.customerName && <p style={{ fontSize: "0.73rem", color: "#EF4444", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}><AlertCircle size={10} />{errors.customerName}</p>}
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: SUB, marginBottom: 5, display: "block", fontWeight: 600 }}>{t.phone} *</label>
                <input type="tel" value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })} placeholder={t.phonePh} style={{ ...inputBase, direction: "ltr", borderColor: errors.customerPhone ? "#EF4444" : BD }} />
                {errors.customerPhone && <p style={{ fontSize: "0.73rem", color: "#EF4444", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}><AlertCircle size={10} />{errors.customerPhone}</p>}
              </div>
              <div className="form2" style={{ marginBottom: 0 }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: SUB, marginBottom: 5, display: "block", fontWeight: 600 }}>{t.wilaya} *</label>
                  <div style={{ position: "relative" }}>
                    <ChevronDown size={12} style={{ position: "absolute", insetInlineStart: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
                    <select value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: "" })} disabled={wilayas.length === 0} style={{ ...inputBase, paddingInlineStart: 30, direction: isRTL ? "rtl" : "ltr", borderColor: errors.customerWelaya ? "#EF4444" : BD }}>
                      <option value="">{wilayas.length === 0 ? t.wilayaNA : t.wilayaPh}</option>
                      {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                    </select>
                  </div>
                  {errors.customerWelaya && <p style={{ fontSize: "0.73rem", color: "#EF4444", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}><AlertCircle size={10} />{errors.customerWelaya}</p>}
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: SUB, marginBottom: 5, display: "block", fontWeight: 600 }}>{t.commune} *</label>
                  <div style={{ position: "relative" }}>
                    <ChevronDown size={12} style={{ position: "absolute", insetInlineStart: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: SUB }} />
                    <select value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })} disabled={!fd.customerWelaya || loadingC} style={{ ...inputBase, paddingInlineStart: 30, direction: isRTL ? "rtl" : "ltr", borderColor: errors.customerCommune ? "#EF4444" : BD }}>
                      <option value="">{loadingC ? t.communeLoading : t.communePh}</option>
                      {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {errors.customerCommune && <p style={{ fontSize: "0.73rem", color: "#EF4444", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}><AlertCircle size={10} />{errors.customerCommune}</p>}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: SUB, marginBottom: 6, display: "block", fontWeight: 600 }}>{t.deliveryType}</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["home", "office"] as const).map((type) => (
                    <button key={type} type="button" onClick={() => setFd({ ...fd, typeLivraison: type })} style={{ padding: "9px 6px", borderRadius: 6, border: `1px solid ${fd.typeLivraison === type ? A : BD}`, background: fd.typeLivraison === type ? AL : "transparent", color: fd.typeLivraison === type ? A : SUB, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      {type === "home" ? <Truck size={13} /> : <MapPin size={13} />}
                      {type === "home" ? t.deliveryHome : t.deliveryOffice}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: C2, borderRadius: 8, padding: "12px", border: `1px solid ${BD}` }}>
                {[{ l: t.subtotal, v: `${cartTotal.toLocaleString()} ${currency}` }, { l: t.delivery, v: !selW ? "—" : freeShippingReached ? t.freeShippingBadge : `${getLiv().toLocaleString()} ${currency}` }].map((r) => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BD}`, fontSize: "0.82rem" }}>
                    <span style={{ color: SUB }}>{r.l}</span><span style={{ color: TXT, fontWeight: 700 }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, marginTop: 2 }}>
                  <span style={{ color: TXT, fontWeight: 800 }}>{t.total}</span>
                  <span style={{ color: A, fontWeight: 900, fontSize: "1.05rem" }}>{finalTotal.toLocaleString()} {currency}</span>
                </div>
              </div>

              {errors.submit && (
                <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid #EF4444", color: "#EF4444", padding: "9px 12px", borderRadius: 8, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertCircle size={14} />{errors.submit}
                </div>
              )}

              <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.65 : 1 }}>
                {submitting ? t.sending : <><Send size={15} />{t.confirmOrder}</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const stepIcons = [CheckCircle, Phone, Package, Truck];

  return (
    <div dir={t.dir} style={{ padding: "3rem 1rem", minHeight: '100vh' }}>
      <div style={{ ...container, maxWidth: 480 }}>
        <div style={{ textAlign: "center", background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: "2.5rem 2rem", marginBottom: 24 }}>
          <CheckCircle size={56} color={SUCCESS} style={{ display: "block", margin: "0 auto 18px" }} />
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: TXT, marginBottom: 10 }}>{t.successTitle}</h2>
          <p style={{ color: SUB, margin: 0 }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: 24 }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.75rem', color: TXT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${BD}`, fontSize: 14, fontWeight: 700, color: TXT }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: SUB }}>{t.total}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: A }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? CheckCircle;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? `1px solid ${BD}` : 'none', background: done ? 'rgba(255,42,109,0.06)' : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? A : C0, color: done ? '#fff' : SUB }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: done ? TXT : SUB, marginBottom: 2 }}>{step.title}</p>
                  <p style={{ fontSize: '0.76rem', color: SUB }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/" style={{ ...btnPrimary, textDecoration: "none", justifyContent: 'center' }}>{t.shopNow}</Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', borderRadius: 8, border: `1px solid ${BD}`, color: SUB, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Static page shell ────────────────────────────────────────────
function Shell({ title, children, store }: { title: string; children: React.ReactNode; store?: any }) {
  const t = T[getLang(store)];
  return (
    <div dir={t.dir} style={{ padding: "3rem 0" }}>
      <div style={{ ...container, maxWidth: 800 }}>
        <div style={{ background: C1, border: `1px solid ${BD}`, borderRadius: 12, padding: "2rem", marginBottom: 24, textAlign: "center" }}>
          <Shield size={36} color={A} style={{ marginBottom: 10, display: "block", margin: "0 auto 10px" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: TXT }}>{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

function IB({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 10, padding: "1.25rem", marginBottom: 12 }}>
      <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: A, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <Crosshair size={14} />{title}
      </h3>
      <p style={{ color: SUB, fontSize: "0.875rem", lineHeight: 1.8 }}>{body}</p>
    </div>
  );
}

export function Privacy({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return <Shell title={t.privacyTitle} store={store}><IB title={t.privDataTitle} body={t.privDataBody} /><IB title={t.privUseTitle} body={t.privUseBody} /><IB title={t.privSecTitle} body={t.privSecBody} /></Shell>;
}

export function Terms({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return <Shell title={t.termsTitle} store={store}><IB title={t.termsUseTitle} body={t.termsUseBody} /><IB title={t.termsOrdTitle} body={t.termsOrdBody} /><IB title={t.termsRetTitle} body={t.termsRetBody} /></Shell>;
}

export function Cookies({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return <Shell title={t.cookiesTitle} store={store}><IB title={t.cookWhatTitle} body={t.cookWhatBody} /><IB title={t.cookHowTitle} body={t.cookHowBody} /><IB title={t.cookCtrlTitle} body={t.cookCtrlBody} /></Shell>;
}

// ─── Contact ──────────────────────────────────────────────────────
export function Contact({ store }: { store: any }) {
  const t = T[getLang(store)];
  const isRTL = t.dir === "rtl";
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
    } catch (ex: any) {
      setErr(ex?.response?.data?.message || t.contactErr);
    } finally { setSending(false); }
  };

  if (sent) return (
    <div dir={t.dir} style={{ padding: "4rem 1rem", textAlign: "center" }}>
      <div style={{ ...container, maxWidth: 440 }}>
        <CheckCircle size={60} color={SUCCESS} style={{ display: "block", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: TXT, marginBottom: 10 }}>{t.sentTitle}</h2>
        <p style={{ color: SUB, marginBottom: 22 }}>{t.sentDesc}</p>
        <button onClick={() => setSent(false)} style={{ ...btnPrimary, width: "auto", padding: "0.75rem 1.75rem", display: "inline-flex" }}>{t.sendAnother}</button>
      </div>
    </div>
  );

  return (
    <div dir={t.dir} style={{ padding: "2rem 0" }}>
      <div style={{ ...container, maxWidth: 860 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: TXT, marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
          <Headphones size={22} color={A} />{t.contactTitle}
        </h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          {/* Contact info */}
          {(store?.contact?.phone || store?.contact?.email || store?.contact?.wilaya) && (
            <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 10, padding: "1.25rem" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: TXT, marginBottom: 14 }}>{t.contactInfoTitle}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {store?.contact?.phone && (
                  <a href={`tel:${store.contact.phone}`} style={{ color: SUB, textDecoration: "none", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, background: C2, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Phone size={15} color={A} /></div>
                    {store.contact.phone}
                  </a>
                )}
                {store?.contact?.email && (
                  <a href={`mailto:${store.contact.email}`} style={{ color: SUB, textDecoration: "none", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, background: C2, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Mail size={15} color={A} /></div>
                    {store.contact.email}
                  </a>
                )}
                {store?.contact?.wilaya && (
                  <span style={{ color: SUB, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, background: C2, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MapPin size={15} color={A} /></div>
                    {store.contact.wilaya}{store.contact.address ? ` — ${store.contact.address}` : ""}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 10, padding: "1.25rem", display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: TXT, marginBottom: 4 }}>{t.contactFormTitle}</h3>
            <div className="form2">
              <input type="text" placeholder={t.namePh} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ ...inputBase, direction: isRTL ? "rtl" : "ltr" }} />
              <input type="email" placeholder={t.emailPh} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ ...inputBase, direction: "ltr" }} />
            </div>
            <input type="tel" placeholder={t.phonePh2} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ ...inputBase, direction: "ltr" }} />
            <textarea placeholder={t.messagePh} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...inputBase, direction: isRTL ? "rtl" : "ltr", resize: "none" }} />
            {err && <p style={{ color: "#EF4444", fontSize: "0.82rem" }}>{err}</p>}
            <button type="submit" disabled={sending} style={{ ...btnPrimary, opacity: sending ? 0.65 : 1 }}>
              {sending ? t.sending : <><Send size={15} />{t.sendBtn}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: { staticPage?: string; page?: string; store: any }) {
  const p = (staticPage || page || "").toLowerCase();
  if (p === "privacy") return <Privacy store={store} />;
  if (p === "terms")   return <Terms store={store} />;
  if (p === "cookies") return <Cookies store={store} />;
  if (p === "contact") return <Contact store={store} />;
  return <Privacy store={store} />;
}
