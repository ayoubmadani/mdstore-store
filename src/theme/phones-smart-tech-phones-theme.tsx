'use client';

/* =====================================================================
   MdStore Storefront Theme — phones-smart-tech-phones-theme
   NAVBAR ARCHETYPE : B  — Double Bar
   CARD ARCHETYPE   : 2  — Overlay Reveal
   HERO LAYOUT      : full-bleed (image + graphite scrim + scan line)
   TYPOGRAPHY       : Cairo (display/body) + JetBrains Mono (numeric/spec)
   Signature        : monospace spec chips + cobalt scan line
   ===================================================================== */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { useCartStore } from '@/store/useCartStore';
import {
  Search, X, ShoppingCart, Menu, Phone, Mail, MapPin, ChevronDown,
  ChevronLeft, ChevronRight, Star, Trash2, Plus, Minus, Check, AlertCircle,
  Truck, ShieldCheck, CreditCard, Headphones, Smartphone, Send, Cpu,
} from 'lucide-react';

/* ------------------------------ Tokens ------------------------------ */
const A   = '#2F5BFF'; // electric cobalt accent
const AD  = '#1E3FCC'; // accent hover / dark
const AL  = '#EAF0FF'; // accent tint
const BG  = '#F6F7F9'; // canvas
const CARD= '#FFFFFF'; // surface
const TXT = '#0B0F1A'; // ink primary
const SUB = '#4A5160'; // secondary text
const MUT = '#8A909E'; // muted
const BD  = '#E6E8EE'; // border
const BDS = '#D3D7E0'; // border strong
const INK = '#070A12'; // deepest obsidian (top bar / footer)
const ERR = '#EF4444';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ------------------------------ Types ------------------------------- */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

/* --------------------------- i18n (T) ------------------------------- */
type Lang = 'ar' | 'fr' | 'en';
const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};

const T = {
  ar: {
    dir: 'rtl' as const, currency: 'دج', locale: 'fr-DZ',
    home: 'الرئيسية', contact: 'تواصل معنا', cart: 'السلة',
    search: 'ابحث عن هاتف أو إكسسوار...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
    showAll: 'عرض كل النتائج →',
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تسوّق الآن',
    heroEyebrow: 'تقنية ذكية — أحدث الإصدارات', featuredTitle: 'أحدث المنتجات', view: 'عرض المنتج',
    trust: [
      { t: 'توصيل سريع', s: 'لكل 58 ولاية' },
      { t: 'ضمان أصلي', s: 'منتجات 100% أصلية' },
      { t: 'دفع عند الاستلام', s: 'ادفع عند وصول طلبك' },
      { t: 'دعم تقني 24/7', s: 'فريق متخصص للمساعدة' },
    ],
    quickLinks: 'روابط سريعة', legalNav: 'قانوني', contactUs: 'تواصل معنا',
    privacy: 'الخصوصية', terms: 'الشروط', cookies: 'الكوكيز',
    rightsReserved: 'جميع الحقوق محفوظة',
    fullName: 'الاسم الكامل', fullNamePlaceholder: 'أدخل اسمك الكامل',
    phone: 'رقم الهاتف', phonePlaceholder: '05xxxxxxxx',
    wilaya: 'الولاية', wilayaPlaceholder: 'اختر الولاية', wilayaUnavailable: 'التوصيل غير متاح حالياً',
    commune: 'البلدية', communePlaceholder: 'اختر البلدية', communeLoading: 'جاري التحميل...',
    deliveryHome: 'توصيل للمنزل', deliveryOffice: 'مكتب التوصيل',
    qty: 'الكمية', price: 'السعر', delivery: 'التوصيل', total: 'الإجمالي',
    orderNow: 'اطلب الآن', addToCart: 'أضف إلى السلة',
    confirmOrder: 'تأكيد الطلب', sending: 'جاري الإرسال...', cancel: 'إلغاء',
    successTitle: 'تم إرسال طلبك بنجاح!', successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل.',
    backToShop: 'العودة للتسوق',
    cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تتم إضافة أي منتجات بعد.',
    myCart: 'سلتي', subtotal: 'المجموع الفرعي', removeItem: 'حذف',
    errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
    errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'الوصف', specsTitle: 'المواصفات',
    searchResultsFor: 'نتائج البحث عن:',
    contactSubtitle: 'نحن هنا لمساعدتك — راسلنا في أي وقت.',
    email: 'البريد الإلكتروني', emailPlaceholder: 'you@email.com',
    message: 'رسالتك', messagePlaceholder: 'اكتب رسالتك هنا...',
    sendMessage: 'إرسال الرسالة', sending2: 'جاري الإرسال...',
    contactSuccess: 'تم إرسال رسالتك بنجاح!', sendAnother: 'إرسال رسالة أخرى',
    getInTouch: 'معلومات التواصل',
    privacyBlocks: [
      { t: 'جمع المعلومات', b: 'نجمع فقط البيانات الضرورية لمعالجة طلبك: الاسم، رقم الهاتف، والعنوان (الولاية والبلدية).' },
      { t: 'استخدام البيانات', b: 'تُستخدم بياناتك حصرياً لتوصيل طلبك والتواصل معك بخصوصه، ولا تُشارك مع أطراف ثالثة لأغراض تسويقية.' },
      { t: 'أمان البيانات', b: 'نتخذ إجراءات معقولة لحماية معلوماتك الشخصية من الوصول أو الاستخدام غير المصرح به.' },
    ],
    termsBlocks: [
      { t: 'الطلبات', b: 'بإتمام الطلب فإنك توافق على تقديم معلومات دقيقة. نحتفظ بحق رفض أو إلغاء أي طلب غير مكتمل أو مشبوه.' },
      { t: 'الأسعار والتوصيل', b: 'الأسعار بالدينار الجزائري وتُضاف رسوم التوصيل حسب الولاية ونوع التوصيل المختار عند إتمام الطلب.' },
      { t: 'الإرجاع', b: 'يمكن معاينة المنتج عند الاستلام. للاستفسار حول الإرجاع أو الاستبدال يرجى التواصل مع فريق الدعم.' },
    ],
    cookiesBlocks: [
      { t: 'ما هي الكوكيز', b: 'ملفات صغيرة تُخزّن في متصفحك لتحسين تجربتك وتذكّر سلة مشترياتك.' },
      { t: 'كيف نستخدمها', b: 'نستخدمها للحفاظ على محتوى سلتك وتفضيلاتك أثناء التصفح، دون تتبّع خارج الموقع.' },
      { t: 'التحكم', b: 'يمكنك حذف أو تعطيل الكوكيز من إعدادات متصفحك في أي وقت.' },
    ],
  },
  fr: {
    dir: 'ltr' as const, currency: 'DA', locale: 'fr-DZ',
    home: 'Accueil', contact: 'Contact', cart: 'Panier',
    search: 'Rechercher un téléphone, un accessoire...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats →',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la boutique',
    heroEyebrow: 'Tech intelligente — dernières nouveautés', featuredTitle: 'Nouveautés', view: 'Voir le produit',
    trust: [
      { t: 'Livraison rapide', s: 'Vers les 58 wilayas' },
      { t: 'Garantie authentique', s: 'Produits 100% originaux' },
      { t: 'Paiement à la livraison', s: 'Payez à la réception' },
      { t: 'Support 24/7', s: 'Une équipe dédiée' },
    ],
    quickLinks: 'Navigation', legalNav: 'Légal', contactUs: 'Contact',
    privacy: 'Confidentialité', terms: 'Conditions', cookies: 'Cookies',
    rightsReserved: 'Tous droits réservés.',
    fullName: 'Nom complet', fullNamePlaceholder: 'Votre nom complet',
    phone: 'Téléphone', phonePlaceholder: '0555 12 34 56',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Choisir la wilaya', wilayaUnavailable: 'Livraison indisponible',
    commune: 'Commune', communePlaceholder: 'Choisir la commune', communeLoading: 'Chargement...',
    deliveryHome: 'À domicile', deliveryOffice: 'Point relais',
    qty: 'Quantité', price: 'Prix', delivery: 'Livraison', total: 'Total',
    orderNow: 'Commander', addToCart: 'Ajouter au panier',
    confirmOrder: 'Confirmer la commande', sending: 'Envoi en cours...', cancel: 'Annuler',
    successTitle: 'Commande confirmée !', successDesc: 'Notre équipe vous contactera bientôt.',
    backToShop: 'Retour à la boutique',
    cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre sélection.',
    myCart: 'Mon Panier', subtotal: 'Sous-total', removeItem: 'Supprimer',
    errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
    errName: 'Nom complet requis (3 caractères minimum)',
    errPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description', specsTitle: 'Caractéristiques',
    searchResultsFor: 'Résultats pour :',
    contactSubtitle: 'Nous sommes là pour vous aider — écrivez-nous à tout moment.',
    email: 'E-mail', emailPlaceholder: 'vous@email.com',
    message: 'Votre message', messagePlaceholder: 'Écrivez votre message ici...',
    sendMessage: 'Envoyer le message', sending2: 'Envoi...',
    contactSuccess: 'Votre message a été envoyé !', sendAnother: 'Envoyer un autre message',
    getInTouch: 'Coordonnées',
    privacyBlocks: [
      { t: 'Collecte des données', b: 'Nous ne collectons que les données nécessaires au traitement de votre commande : nom, téléphone et adresse (wilaya et commune).' },
      { t: 'Utilisation', b: 'Vos données servent exclusivement à livrer votre commande et à vous contacter à son sujet ; elles ne sont pas partagées à des fins marketing.' },
      { t: 'Sécurité', b: 'Nous prenons des mesures raisonnables pour protéger vos informations contre tout accès non autorisé.' },
    ],
    termsBlocks: [
      { t: 'Commandes', b: 'En validant votre commande, vous acceptez de fournir des informations exactes. Nous pouvons refuser toute commande incomplète ou suspecte.' },
      { t: 'Prix et livraison', b: 'Les prix sont en dinars algériens ; les frais de livraison sont ajoutés selon la wilaya et le mode de livraison choisis.' },
      { t: 'Retours', b: 'Le produit peut être inspecté à la réception. Pour tout retour ou échange, contactez notre support.' },
    ],
    cookiesBlocks: [
      { t: 'Les cookies', b: 'De petits fichiers stockés dans votre navigateur pour améliorer votre expérience et mémoriser votre panier.' },
      { t: 'Utilisation', b: 'Ils conservent le contenu de votre panier et vos préférences pendant la navigation, sans suivi hors du site.' },
      { t: 'Contrôle', b: 'Vous pouvez supprimer ou désactiver les cookies depuis les paramètres de votre navigateur.' },
    ],
  },
  en: {
    dir: 'ltr' as const, currency: 'DA', locale: 'en-US',
    home: 'Home', contact: 'Contact', cart: 'Cart',
    search: 'Search phones, accessories...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results →',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Shop Now',
    heroEyebrow: 'Smart tech — latest drops', featuredTitle: 'New Arrivals', view: 'View product',
    trust: [
      { t: 'Fast Delivery', s: 'To all 58 wilayas' },
      { t: 'Authentic Warranty', s: '100% original products' },
      { t: 'Pay on Delivery', s: 'Pay when it arrives' },
      { t: '24/7 Support', s: 'A dedicated team' },
    ],
    quickLinks: 'Quick Links', legalNav: 'Legal', contactUs: 'Contact',
    privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies',
    rightsReserved: 'All rights reserved.',
    fullName: 'Full Name', fullNamePlaceholder: 'Enter your full name',
    phone: 'Phone Number', phonePlaceholder: '0555 12 34 56',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Select wilaya', wilayaUnavailable: 'Delivery unavailable',
    commune: 'Commune', communePlaceholder: 'Select commune', communeLoading: 'Loading...',
    deliveryHome: 'Home Delivery', deliveryOffice: 'Pickup Point',
    qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total',
    orderNow: 'Order Now', addToCart: 'Add to Cart',
    confirmOrder: 'Confirm Order', sending: 'Sending...', cancel: 'Cancel',
    successTitle: 'Order placed successfully!', successDesc: 'We will contact you shortly to confirm the details.',
    backToShop: 'Back to Shop',
    cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Start shopping now.',
    myCart: 'My Cart', subtotal: 'Subtotal', removeItem: 'Remove',
    errSubmit: 'An error occurred. Please try again.',
    errName: 'Full name is required (at least 3 characters)',
    errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Description', specsTitle: 'Specifications',
    searchResultsFor: 'Results for:',
    contactSubtitle: 'We are here to help — reach out any time.',
    email: 'Email', emailPlaceholder: 'you@email.com',
    message: 'Your message', messagePlaceholder: 'Write your message here...',
    sendMessage: 'Send Message', sending2: 'Sending...',
    contactSuccess: 'Your message has been sent!', sendAnother: 'Send another message',
    getInTouch: 'Get in touch',
    privacyBlocks: [
      { t: 'Data We Collect', b: 'We only collect the data needed to process your order: name, phone number, and address (wilaya and commune).' },
      { t: 'How We Use It', b: 'Your data is used solely to deliver your order and contact you about it; it is never shared for marketing purposes.' },
      { t: 'Data Security', b: 'We take reasonable measures to protect your personal information from unauthorized access or use.' },
    ],
    termsBlocks: [
      { t: 'Orders', b: 'By placing an order you agree to provide accurate information. We reserve the right to refuse or cancel incomplete or suspicious orders.' },
      { t: 'Pricing & Delivery', b: 'Prices are in Algerian dinars; delivery fees are added based on your wilaya and chosen delivery type at checkout.' },
      { t: 'Returns', b: 'You may inspect the product on delivery. For returns or exchanges, please contact our support team.' },
    ],
    cookiesBlocks: [
      { t: 'What Cookies Are', b: 'Small files stored in your browser to improve your experience and remember your cart.' },
      { t: 'How We Use Them', b: 'They keep your cart contents and preferences during your session, with no off-site tracking.' },
      { t: 'Your Control', b: 'You can delete or disable cookies from your browser settings at any time.' },
    ],
  },
} as const;

/* ------------------------------ Helpers ----------------------------- */
function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

const asArray = (d: any): any[] =>
  Array.isArray(d) ? d : (d?.products || d?.data || d?.wilayas || d?.communes || d?.result || []);

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!r.ok) return [];
    return asArray(await r.json());
  } catch { return []; }
};
const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!r.ok) return [];
    return asArray(await r.json());
  } catch { return []; }
};

const productImg = (p: any): string | undefined =>
  p?.productImage || p?.imagesProduct?.[0]?.imageUrl;

const useFmt = (store?: any) => {
  const t = T[getLang(store)];
  const cur = store?.currency || t.currency;
  return (n: number | string) => `${Number(n || 0).toLocaleString('fr-FR')} ${cur}`;
};

/* ------------------------------ Theme CSS --------------------------- */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

.pt-root, .pt-root * { box-sizing: border-box; }
.pt-root {
  font-family: 'Cairo', system-ui, -apple-system, sans-serif;
  color: ${TXT}; background: ${BG}; line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
.pt-root a { color: inherit; text-decoration: none; }
.pt-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
.pt-container { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }

/* ---- Keyframes ---- */
@keyframes ptFadeUp { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform: translateY(0);} }
@keyframes ptFadeIn { from { opacity:0;} to { opacity:1;} }
@keyframes ptScaleIn { from { opacity:0; transform: scale(0.94);} to { opacity:1; transform: scale(1);} }
@keyframes ptFloat { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-8px);} }
@keyframes ptShimmer { 0% { background-position:-400px 0;} 100% { background-position:400px 0;} }
@keyframes ptScan { 0% { transform: translateX(-120%);} 100% { transform: translateX(120%);} }
@keyframes ptBadge { 0%{transform:scale(1);} 40%{transform:scale(1.4);} 70%{transform:scale(0.9);} 100%{transform:scale(1);} }

/* ---- Navbar (Double Bar) ---- */
.pt-topbar {
  background: ${INK}; color: #C9CEDA; font-size: 0.78rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.pt-topbar-inner { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:38px; }
.pt-topbar a:hover { color: #fff; }
.pt-mainbar { position: sticky; top: 0; z-index: 200; background: ${CARD}; border-bottom: 1px solid ${BD}; }
.pt-mainbar.pt-scrolled { box-shadow: 0 6px 24px rgba(11,15,26,0.07); }
.pt-mainbar-inner { display:flex; align-items:center; gap:20px; min-height:66px; }
.pt-logoscan { position:relative; overflow:hidden; }
.pt-logoscan::after {
  content:''; position:absolute; top:0; bottom:0; width:34%;
  background: linear-gradient(90deg, transparent, ${A}55, transparent);
  animation: ptScan 3.4s ease-in-out infinite;
}
.pt-navlinks { display:flex; align-items:center; gap:28px; }
.pt-navlink { position:relative; font-weight:700; font-size:0.92rem; color:${SUB}; padding:6px 0; transition: color .2s; }
.pt-navlink:hover, .pt-navlink.active { color:${TXT}; }
.pt-navlink::after {
  content:''; position:absolute; bottom:-2px; inset-inline-start:0; inset-inline-end:0; height:2px;
  background:${A}; transform:scaleX(0); transform-origin:center; transition: transform .25s ease;
}
.pt-navlink:hover::after, .pt-navlink.active::after { transform:scaleX(1); }
.pt-burger { display:none; align-items:center; justify-content:center; width:42px; height:42px;
  border:1px solid ${BD}; border-radius:10px; background:${CARD}; color:${TXT}; cursor:pointer; }
.pt-mobile-searchbtn { display:none; }

.pt-search-dd {
  position:absolute; inset-inline-end:0; top:calc(100% + 8px); width:min(360px, 78vw);
  background:${CARD}; border:1px solid ${BD}; border-radius:14px; overflow:hidden;
  box-shadow: 0 18px 44px rgba(11,15,26,0.14); z-index:500; max-height:400px; overflow-y:auto;
  animation: ptFadeIn .18s ease;
}
@media (max-width:480px){
  .pt-search-dd { position:fixed; inset-inline-start:12px; inset-inline-end:12px; width:auto; top:64px; }
}

@media (max-width:860px){
  .pt-navlinks { display:none; }
  .pt-burger { display:flex; }
  .pt-desktop-search { display:none; }
  .pt-mobile-searchbtn { display:flex; }
}
@media (min-width:861px){ .pt-mobile-searchbtn { display:none; } }

/* ---- Trust bar ---- */
.pt-trust { display:grid; grid-template-columns:repeat(2,1fr); gap:1px; background:${BD}; border:1px solid ${BD}; border-radius:16px; overflow:hidden; }
@media (min-width:768px){ .pt-trust { grid-template-columns:repeat(4,1fr); } }
.pt-hero { display:flex; align-items:flex-end; }
@media (max-width:767px){ .pt-hero { align-items:center; min-height:420px; } }
.pt-trust-item { background:${CARD}; padding:1.1rem 1rem; display:flex; align-items:center; gap:12px; }

/* ---- Categories ---- */
.pt-cats { display:flex; gap:10px; overflow-x:auto; padding-bottom:6px; scrollbar-width:none; }
.pt-cats::-webkit-scrollbar { display:none; }
.pt-cat {
  flex-shrink:0; padding:9px 18px; border-radius:999px; border:1.5px solid ${BD};
  font-weight:700; font-size:0.85rem; color:${SUB}; background:${CARD}; white-space:nowrap;
  transition: all .2s ease; min-height:40px; display:inline-flex; align-items:center;
}
.pt-cat:hover { border-color:${BDS}; color:${TXT}; }
.pt-cat.active { border-color:${A}; color:${A}; background:${AL}; }

/* ---- Product grid ---- */
.pt-grid { display:grid; grid-template-columns:1fr; gap:1rem; }
@media (min-width:640px){ .pt-grid { grid-template-columns:repeat(2,1fr); } }
@media (min-width:1024px){ .pt-grid { grid-template-columns:repeat(3,1fr); } }
@media (min-width:1280px){ .pt-grid { grid-template-columns:repeat(4,1fr); } }

/* ---- Card (Overlay Reveal) ---- */
.pt-card {
  position:relative; overflow:hidden; aspect-ratio:3/4; border-radius:16px;
  background:${INK}; border:1px solid ${BD}; display:block;
  box-shadow: 0 1px 2px rgba(11,15,26,0.05); transition: box-shadow .3s ease, transform .3s ease;
  animation: ptFadeUp .5s ease both; will-change: transform;
}
.pt-card:hover { box-shadow: 0 22px 46px rgba(11,15,26,0.20); transform: translateY(-4px); }
.pt-card-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition: transform .55s ease; }
.pt-card:hover .pt-card-img { transform: scale(1.07); }
.pt-card-ph { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#101524; }
.pt-card-disc {
  position:absolute; top:12px; inset-inline-start:12px; z-index:3;
  background:${A}; color:#fff; font-weight:800; font-size:0.72rem; padding:4px 9px; border-radius:8px;
  font-family:'JetBrains Mono', monospace;
}
.pt-card-body {
  position:absolute; inset-inline:0; bottom:0; z-index:2; padding:1.5rem 1rem 1rem;
  background: linear-gradient(to top, rgba(7,10,18,0.92) 12%, rgba(7,10,18,0.55) 55%, transparent 100%);
  transform: translateY(34%); transition: transform .35s ease;
}
.pt-card:hover .pt-card-body { transform: translateY(0); }
@media (max-width:768px){ .pt-card-body { transform: translateY(0); } }
.pt-card-name { color:#fff; font-weight:700; font-size:0.95rem; margin:0 0 6px;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.pt-card-price { color:#fff; font-family:'JetBrains Mono', monospace; font-weight:700; font-size:1.02rem; }
.pt-card-old { color:#9aa2b4; text-decoration:line-through; font-size:0.8rem; margin-inline-start:8px; }
.pt-card-cta {
  display:inline-flex; align-items:center; gap:6px; margin-top:10px; font-size:0.78rem; font-weight:700;
  color:${A === '#2F5BFF' ? '#8FB0FF' : A};
}

/* ---- Buttons / inputs ---- */
.pt-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:0.9rem 1.4rem; min-height:48px; border:none; border-radius:12px;
  font-family:'Cairo', sans-serif; font-weight:800; font-size:0.92rem; cursor:pointer;
  background:${A}; color:#fff; transition: transform .15s ease, box-shadow .15s ease, background .2s ease; width:100%;
}
.pt-btn:hover { background:${AD}; transform: translateY(-2px); box-shadow:0 10px 24px rgba(47,91,255,0.28); }
.pt-btn:active { transform: translateY(0) scale(0.98); }
.pt-btn:disabled { opacity:0.6; cursor:default; transform:none; box-shadow:none; }
.pt-btn-ghost { background:transparent; color:${A}; border:1.5px solid ${A}; }
.pt-btn-ghost:hover { background:${A}; color:#fff; box-shadow:none; }
.pt-btn-dark { background:${INK}; }
.pt-btn-dark:hover { background:#151b2b; }

.pt-input {
  width:100%; padding:0.8rem 1rem; font-size:0.92rem; font-family:'Cairo', sans-serif;
  border:1.5px solid ${BD}; border-radius:12px; background:${CARD}; color:${TXT};
  outline:none; appearance:none; transition: border-color .2s, box-shadow .2s;
}
.pt-input:focus { border-color:${A}; box-shadow:0 0 0 3px rgba(47,91,255,0.14); }
.pt-input::placeholder { color:${MUT}; }

/* ---- Layouts ---- */
.pt-details { display:grid; grid-template-columns:1fr; gap:2rem; }
@media (min-width:768px){ .pt-details { grid-template-columns:1fr 1fr; gap:2.5rem; } }
.pt-cart-grid { display:grid; grid-template-columns:1fr; gap:1.5rem; }
@media (min-width:1024px){ .pt-cart-grid { grid-template-columns:1.3fr 1fr; } }
.pt-footer-grid { display:grid; grid-template-columns:1fr; gap:2rem; }
@media (min-width:768px){ .pt-footer-grid { grid-template-columns:2fr 1fr 1fr 1.2fr; } }
.pt-form-row2 { display:grid; grid-template-columns:1fr; gap:0.85rem; }
@media (min-width:520px){ .pt-form-row2 { grid-template-columns:1fr 1fr; } }

/* ---- Skeleton ---- */
.pt-skel { background: linear-gradient(90deg,#e8eaef 25%,#f2f3f6 50%,#e8eaef 75%);
  background-size:400px 100%; animation: ptShimmer 1.4s infinite linear; border-radius:12px; }

/* ---- Mobile overlays ---- */
.pt-overlay { position:fixed; inset:0; z-index:300; background:rgba(7,10,18,0.55); backdrop-filter: blur(4px); }

@media (prefers-reduced-motion: reduce){
  .pt-root *, .pt-logoscan::after { animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; }
}
`;

/* ============================= Main ================================= */
export default function Main({ store, children, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    setVisible(false);
    const id = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div className="pt-root" dir={t.dir}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <main style={{ minHeight: '60vh', opacity: visible ? 1 : 0, transition: 'opacity 0.32s ease' }}>
        {children}
      </main>
      <Footer store={store} />
    </div>
  );
}

/* ============================= Navbar =============================== */
// NAVBAR ARCHETYPE: B — Double Bar (utility strip + sticky main bar)
export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const router = useRouter();
  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const debRef = useRef<any>(null);

  const cartOn = store?.cart !== false;
  const logo = store?.design?.logoUrl;
  const fmt = useFmt(store);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch { /* ignore */ }
  }, [domain, initCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    if (searchQuery.trim().length < 2) { setListSearch([]); setLoading(false); return; }
    setLoading(true);
    debRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery.trim())}`);
        setListSearch(r.ok ? asArray(await r.json()).slice(0, 6) : []);
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [searchQuery, domain]);

  const goSearch = () => {
    if (!searchQuery.trim()) return;
    setShowSearch(false); setSearchFocused(false);
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const mobileLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const ResultRow = ({ p, onGo }: any) => {
    const img = productImg(p);
    return (
      <Link href={`/product/${p.slug || p.id}`} onClick={onGo}
        style={{ display: 'flex', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${BD}`, alignItems: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {img ? <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Smartphone size={20} color={MUT} />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
          <p className="pt-mono" style={{ margin: 0, fontSize: '0.8rem', color: A, fontWeight: 700 }}>{fmt(p.price)}</p>
        </div>
      </Link>
    );
  };

  const Logo = () => (
    <Link href="/" className="pt-logoscan" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {logo && !imgError ? (
        <img src={logo} alt={store?.name} onError={() => setImgError(true)}
          style={{ height: 38, width: 'auto', objectFit: 'contain', display: 'block' }} />
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: '1.2rem', color: TXT, letterSpacing: '-0.02em' }}>
          <Cpu size={22} color={A} /> {store?.name}
        </span>
      )}
    </Link>
  );

  return (
    <header>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: A, color: '#fff', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, padding: '7px 12px' }}>
          {store.topBar.text}
        </div>
      )}

      {/* Utility strip */}
      <div className="pt-topbar">
        <div className="pt-container pt-topbar-inner">
          <span className="pt-mono" style={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {store?.hero?.subtitle || t.heroEyebrow}
          </span>
          {store?.contact?.phone && (
            <a href={`tel:${store.contact.phone}`} className="pt-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Phone size={13} /> {store.contact.phone}
            </a>
          )}
        </div>
      </div>

      {/* Main bar */}
      <div className={`pt-mainbar${scrolled ? ' pt-scrolled' : ''}`}>
        <div className="pt-container pt-mainbar-inner">
          <Logo />

          <nav className="pt-navlinks" style={{ marginInlineStart: 'auto' }}>
            <Link href="/" className="pt-navlink">{t.home}</Link>
            <Link href="/contact" className="pt-navlink">{t.contact}</Link>
          </nav>

          {/* Desktop search */}
          <div className="pt-desktop-search" style={{ position: 'relative', marginInlineStart: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG, border: `1.5px solid ${BD}`, borderRadius: 12, padding: '0 12px', height: 44, width: searchFocused ? 280 : 200, transition: 'width .3s ease' }}>
              <Search size={17} color={MUT} />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') goSearch(); }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder={t.search}
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem', color: TXT, fontFamily: 'inherit' }} />
            </div>
            {searchFocused && searchQuery.trim().length >= 2 && (
              <div className="pt-search-dd">
                {loading && <p style={{ padding: '1rem', textAlign: 'center', color: MUT, fontSize: '0.85rem' }}>{t.searching}</p>}
                {!loading && listSearch.map((p) => <ResultRow key={p.id} p={p} onGo={() => setSearchFocused(false)} />)}
                {!loading && listSearch.length > 0 && (
                  <Link href={`/?search=${encodeURIComponent(searchQuery.trim())}`} onClick={() => setSearchFocused(false)}
                    style={{ display: 'block', padding: '11px 14px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: A }}>
                    {t.showAll}
                  </Link>
                )}
                {!loading && listSearch.length === 0 && (
                  <p style={{ padding: '1.4rem', textAlign: 'center', color: MUT, fontSize: '0.85rem' }}>{t.noResults}</p>
                )}
              </div>
            )}
          </div>

          {/* Mobile search trigger */}
          <button className="pt-mobile-searchbtn pt-burger" style={{ marginInlineStart: 'auto' }}
            onClick={() => setShowSearch(true)} aria-label={t.search}>
            <Search size={20} />
          </button>

          {cartOn && (
            <Link href="/cart" aria-label={t.cart}
              style={{ position: 'relative', width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${BD}`, borderRadius: 12, background: CARD, flexShrink: 0 }}>
              <ShoppingCart size={20} color={TXT} />
              {count > 0 && (
                <span className="pt-mono" style={{ position: 'absolute', top: -7, insetInlineEnd: -7, minWidth: 20, height: 20, borderRadius: 999, background: A, color: '#fff', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  {count}
                </span>
              )}
            </Link>
          )}

          <button className="pt-burger" onClick={() => setOpen(true)} aria-label="menu">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div className="pt-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{ position: 'absolute', top: 0, insetInlineEnd: 0, height: '100%', width: 'min(320px, 82vw)', background: CARD, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{store?.name}</span>
              <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: TXT }}><X size={24} /></button>
            </div>
            {mobileLinks.map((l) => (
              <Link key={l.h} href={l.h} onClick={() => setOpen(false)}
                style={{ padding: '14px 6px', fontWeight: 700, fontSize: '1rem', borderBottom: `1px solid ${BD}` }}>
                {l.l}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile full-screen search */}
      {showSearch && (
        <div className="pt-overlay" style={{ display: 'flex', flexDirection: 'column' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <div style={{ background: CARD, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={20} color={MUT} />
            <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') goSearch(); }}
              placeholder={t.search}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', color: TXT, fontFamily: 'inherit' }} />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: TXT }}><X size={22} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: CARD, marginTop: 1 }}>
            {loading && <p style={{ padding: '1rem', textAlign: 'center', color: MUT }}>{t.searching}</p>}
            {!loading && listSearch.map((p) => <ResultRow key={p.id} p={p} onGo={() => setShowSearch(false)} />)}
            {!loading && listSearch.length > 0 && (
              <Link href={`/?search=${encodeURIComponent(searchQuery.trim())}`} onClick={() => setShowSearch(false)}
                style={{ display: 'block', padding: '14px', textAlign: 'center', background: BG, fontWeight: 700, color: A }}>
                {t.showAll}
              </Link>
            )}
            {!loading && searchQuery.trim().length >= 2 && listSearch.length === 0 && (
              <p style={{ padding: '2rem', textAlign: 'center', color: MUT }}>{t.noResults}</p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ============================= Footer =============================== */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const cartOn = store?.cart !== false;
  const year = new Date().getFullYear();

  const links = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contact },
  ].filter((lnk) => lnk.h !== '/cart' || cartOn);

  const c = store?.contact || {};

  return (
    <footer style={{ background: INK, color: '#AEB4C2', marginTop: '4rem' }}>
      <div className="pt-container" style={{ padding: '3rem 1.5rem 1.5rem' }}>
        <div className="pt-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Cpu size={24} color={A} />
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem' }}>{store?.name}</span>
            </div>
            <p style={{ maxWidth: 340, fontSize: '0.9rem', lineHeight: 1.7 }}>{store?.hero?.subtitle || t.heroEyebrow}</p>
            <span className="pt-mono" style={{ display: 'block', marginTop: 18, fontSize: '0.75rem', color: MUT }}>
              © {year} {store?.name} — {t.rightsReserved}
            </span>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginBottom: 14 }}>{t.quickLinks}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((l) => (
                <li key={l.h}><Link href={l.h} style={{ fontSize: '0.9rem' }}>{l.l}</Link></li>
              ))}
            </ul>
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
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginBottom: 14 }}>{t.contactUs}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {c.phone && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                  <Phone size={16} color={A} /> <span className="pt-mono">{c.phone}</span>
                </li>
              )}
              {c.email && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                  <Mail size={16} color={A} /> {c.email}
                </li>
              )}
              {(c.wilaya || c.address) && (
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9rem' }}>
                  <MapPin size={16} color={A} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{[c.wilaya, c.address].filter(Boolean).join(' — ')}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================== Card =============================== */
// CARD ARCHETYPE: 2 — Overlay Reveal
export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const t = T[getLang(store)];
  const fmt = useFmt(store);
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || productImg(product);
  const orig = Number(product?.priceOriginal || 0);
  const price = Number(product?.price || 0);

  return (
    <Link href={`/product/${product.slug || product.id}`} className="pt-card"
      onClick={typeof viewDetails === 'function' ? () => viewDetails(product) : undefined}>
      {discount > 0 && <span className="pt-card-disc">-{discount}%</span>}
      {img && !imgErr ? (
        <img className="pt-card-img" src={img} alt={product.name} onError={() => setImgErr(true)} />
      ) : (
        <div className="pt-card-ph"><Smartphone size={44} color="#39405480" /></div>
      )}
      <div className="pt-card-body">
        <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={12} color="#FFC53D" fill={i < 4 ? '#FFC53D' : 'transparent'} />
          ))}
        </div>
        <p className="pt-card-name">{product.name}</p>
        <div>
          <span className="pt-card-price">{fmt(price)}</span>
          {orig > price && <span className="pt-card-old pt-mono">{fmt(orig)}</span>}
        </div>
        <span className="pt-card-cta">{t.view} <ChevronLeft size={14} style={{ transform: t.dir === 'rtl' ? 'none' : 'rotate(180deg)' }} /></span>
      </div>
    </Link>
  );
}

/* ============================== Home =============================== */
export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const searchTerm = searchParams.get('search');

  const products: any[] = store?.products || [];
  const cats: any[] = store?.categories || [];
  const cartOn = store?.cart !== false;
  const hero = store?.hero || {};

  const trustIcons = [Truck, ShieldCheck, CreditCard, Headphones];
  const perPage = 48;
  const countPage = Math.ceil((store?.count || products.length) / perPage) || 1;
  const curPage = Number(page || searchParams.get('page') || 1);

  const heroTitleHtml = DOMPurify.sanitize(hero.title || store?.name || '');

  return (
    <div>
      {/* HERO — full-bleed */}
      <section className="pt-hero" style={{ position: 'relative', minHeight: 'clamp(460px, 66vh, 720px)', overflow: 'hidden' }}>
        {hero.imageUrl ? (
          <img src={hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 120% at 80% 0%, #1a2440 0%, ${INK} 60%)` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,10,18,0.92) 0%, rgba(7,10,18,0.45) 45%, rgba(7,10,18,0.15) 100%)' }} />
        {/* scan-line signature */}
        <div style={{ position: 'absolute', top: 0, insetInlineStart: 0, right: 0, height: 3, overflow: 'hidden', zIndex: 2 }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: '30%', background: `linear-gradient(90deg, transparent, ${A}, transparent)`, animation: 'ptScan 4s ease-in-out infinite' }} />
        </div>

        <div className="pt-container" style={{ position: 'relative', zIndex: 3, paddingBottom: 'clamp(2.2rem, 6vw, 5rem)', paddingTop: '3rem', width: '100%' }}>
          <span className="pt-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#9FBBFF', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', border: `1px solid ${A}66`, background: 'rgba(47,91,255,0.12)', padding: '5px 12px', borderRadius: 999, marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: A }} /> {t.heroEyebrow}
          </span>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(2rem, 5.5vw, 3.6rem)', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 760, marginInlineEnd: 'auto', marginBottom: '1rem', marginTop: 0 }}
            dangerouslySetInnerHTML={{ __html: heroTitleHtml }} />
          {hero.subtitle && (
            <p style={{ color: '#C7CEDC', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', maxWidth: 560, marginInlineEnd: 'auto', marginBottom: '1.8rem', marginTop: 0 }}>{hero.subtitle}</p>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="#products" style={{ maxWidth: 220 }}>
              <span className="pt-btn" style={{ width: 'auto', padding: '0.9rem 1.8rem' }}>{t.shopNow}</span>
            </Link>
            {cartOn && (
              <Link href="/cart" style={{ maxWidth: 220 }}>
                <span className="pt-btn pt-btn-ghost" style={{ width: 'auto', padding: '0.9rem 1.6rem', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
                  <ShoppingCart size={18} /> {t.cart}
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="pt-container" style={{ marginTop: '-2.5rem', position: 'relative', zIndex: 4 }}>
        <div className="pt-trust">
          {t.trust.map((item: any, i: number) => {
            const Icon = trustIcons[i] || Truck;
            return (
              <div className="pt-trust-item" key={i}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={A} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: TXT }}>{item.t}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: MUT }}>{item.s}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CATEGORIES */}
      {cats.length > 0 && (
        <div className="pt-container" style={{ marginTop: '2.5rem' }}>
          <div className="pt-cats">
            <Link href="/" className={`pt-cat${!activeCategory ? ' active' : ''}`}>{t.all}</Link>
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`}
                className={`pt-cat${activeCategory === String(cat.id) ? ' active' : ''}`}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <section id="products" className="pt-container" style={{ marginTop: '2.5rem', paddingBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 1.4 + 'rem' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
            {searchTerm ? `${t.searchResultsFor} ${searchTerm}` : t.featuredTitle}
          </h2>
          <span style={{ flex: 1, height: 1, background: BD }} />
        </div>

        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: MUT, padding: '4rem 1rem', fontSize: '1rem' }}>{t.noProducts}</p>
        ) : (
          <div className="pt-grid">
            {products.map((p: any, i: number) => {
              const orig = Number(p.priceOriginal || 0);
              const price = Number(p.price || 0);
              const disc = orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
              return (
                <div key={p.id} style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }} className="pt-card-wrap">
                  <Card product={p} displayImage={productImg(p)} discount={disc} store={store} />
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {Array.from({ length: countPage }, (_, i) => i + 1).map((pg) => (
              <Link key={pg} href={{ query: { page: pg } }} scroll={false}
                className="pt-mono"
                style={{
                  minWidth: 42, height: 42, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
                  border: `1.5px solid ${curPage === pg ? A : BD}`,
                  background: curPage === pg ? A : CARD, color: curPage === pg ? '#fff' : TXT,
                }}>
                {pg}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================= Details ============================= */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store: storeprop }: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const fmt = useFmt(store);
  const [sel, setSel] = useState(0);

  const images: any[] = (allImages && allImages.length ? allImages : (product?.imagesProduct || []).map((x: any) => x.imageUrl || x))
    .map((x: any) => (typeof x === 'string' ? x : x?.imageUrl)).filter(Boolean);
  const attrs: any[] = allAttrs || product?.attributes || [];
  const orig = Number(product?.priceOriginal || 0);
  const userId = store?.user?.id || product?.store?.userId;

  const mainImg = images[sel];
  const move = (d: number) => setSel((p) => (images.length ? (p + d + images.length) % images.length : 0));

  return (
    <div className="pt-container" style={{ padding: '2rem 1.5rem' }}>
      <div className="pt-details">
        {/* Gallery */}
        <div>
          <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 18, overflow: 'hidden', background: INK, border: `1px solid ${BD}` }}>
            {mainImg ? (
              <img src={mainImg} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Smartphone size={64} color="#39405480" /></div>
            )}
            {discount > 0 && <span className="pt-card-disc" style={{ top: 16, insetInlineStart: 16, fontSize: '0.82rem' }}>-{discount}%</span>}
            {images.length > 1 && (
              <>
                <button onClick={() => move(-1)} aria-label="prev"
                  style={{ position: 'absolute', top: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.dir === 'rtl' ? <ChevronRight size={22} color={TXT} /> : <ChevronLeft size={22} color={TXT} />}
                </button>
                <button onClick={() => move(1)} aria-label="next"
                  style={{ position: 'absolute', top: '50%', insetInlineEnd: 12, transform: 'translateY(-50%)', width: 42, height: 42, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.dir === 'rtl' ? <ChevronLeft size={22} color={TXT} /> : <ChevronRight size={22} color={TXT} />}
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {images.map((im, i) => (
                <button key={i} onClick={() => setSel(i)}
                  style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0, padding: 0, cursor: 'pointer', border: `2px solid ${i === sel ? A : BD}`, background: BG }}>
                  <img src={im} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em' }}>{product?.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
            {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={16} color="#FFC53D" fill={i < 4 ? '#FFC53D' : 'transparent'} />)}
            <span className="pt-mono" style={{ color: MUT, fontSize: '0.8rem', marginInlineStart: 6 }}>4.0</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, background: BG, border: `1px solid ${BD}`, borderRadius: 14, padding: '1rem 1.25rem', marginBottom: 20 }}>
            <span className="pt-mono" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: A }}>{fmt(finalPrice)}</span>
            {orig > Number(finalPrice) && <span className="pt-mono pt-card-old" style={{ fontSize: '1rem' }}>{fmt(orig)}</span>}
          </div>

          {/* Offers */}
          {Array.isArray(product?.offers) && product.offers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 10 }}>{t.offersTitle}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((off: any) => {
                  const on = selectedOffer === off.id;
                  return (
                    <button key={off.id} onClick={() => setSelectedOffer(on ? null : off.id)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', borderRadius: 12, cursor: 'pointer', textAlign: 'start', border: `1.5px solid ${on ? A : BD}`, background: on ? AL : CARD }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '0.9rem' }}>
                        <span style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${on ? A : BDS}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {on && <span style={{ width: 8, height: 8, borderRadius: 999, background: A }} />}
                        </span>
                        {off.name}
                      </span>
                      <span className="pt-mono" style={{ fontWeight: 800, color: A }}>{fmt(off.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attributes */}
          {attrs.map((attr: any) => (
            <div key={attr.id} style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 10 }}>{attr.name}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(attr.variants || []).map((v: any) => {
                  const on = selectedVariants?.[attr.name] === v.value;
                  const mode = attr.displayMode;
                  const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                    Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                      ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                    )
                  );
                  if (mode === 'color') {
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.name}
                        style={{ width: 36, height: 36, borderRadius: 999, cursor: available ? 'pointer' : 'not-allowed', background: v.value, border: `3px solid ${on ? A : '#fff'}`, boxShadow: `0 0 0 1.5px ${on ? A : BD}`, opacity: available ? 1 : 0.35 }} />
                    );
                  }
                  if (mode === 'image') {
                    return (
                      <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)} title={v.name}
                        style={{ width: 54, height: 54, borderRadius: 10, overflow: 'hidden', cursor: available ? 'pointer' : 'not-allowed', padding: 0, border: `2px solid ${on ? A : BD}`, background: BG, opacity: available ? 1 : 0.35 }}>
                        <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    );
                  }
                  return (
                    <button key={v.id} onClick={() => available && handleVariantSelection(attr.name, v.value)}
                      style={{ padding: '8px 16px', borderRadius: 10, cursor: available ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.85rem', minHeight: 42, border: `1.5px solid ${on ? A : BD}`, background: on ? AL : CARD, color: on ? A : (available ? TXT : '#bbb'), textDecoration: available ? 'none' : 'line-through' }}>
                      {v.name || v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Order form */}
          <ProductForm product={product} userId={userId} domain={domain} store={store}
            selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants} platform="web" />
        </div>
      </div>

      {/* Description */}
      {product?.desc && (
        <div style={{ marginTop: '3rem', maxWidth: 860 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 14, letterSpacing: '-0.02em' }}>{t.descTitle}</h2>
          <div style={{ color: SUB, lineHeight: 1.8, fontSize: '0.95rem' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
        </div>
      )}
    </div>
  );
}

/* ============================ ProductForm ========================== */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store: storeprop }: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const fmt = useFmt(store);
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);
  const cartOn = store?.cart !== false;

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getFP = (): number => {
    if (selectedOffer) {
      const off = (product?.offers || []).find((o: Offer) => o.id === selectedOffer);
      if (off) return Number(off.price);
    }
    const d = (product?.variantDetails || []).find((vd: VariantDetail) => variantMatches(vd, selectedVariants || {}));
    if (d && Number(d.price) !== -1) return Number(d.price);
    return Number(product?.price || 0);
  };
  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);
  const getVarId = () => {
    const d = (product?.variantDetails || []).find((vd: VariantDetail) => variantMatches(vd, selectedVariants || {}));
    return d ? d.id : null;
  };

  const fp = getFP();
  const total = () => fp * fd.quantity + getLiv();

  const set = (k: string, v: any) => setFd((p) => ({ ...p, [k]: v }));

  const buildPayload = () => ({
    ...fd,
    product,
    productId: product?.id,
    storeId: store?.id,
    userId,
    variantDetailId: getVarId(),
    selectedOffer: selectedOffer || null,
    selectedVariants: selectedVariants || {},
    platform: platform || 'web',
    finalPrice: fp,
    totalPrice: total(),
    priceLivraison: getLiv(),
    addedAt: new Date().toISOString(),
  });

  const addToCart = () => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      arr.push(buildPayload());
      localStorage.setItem(domain, JSON.stringify(arr));
      initCount(arr.length);
    } catch { /* ignore */ }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!r.ok) throw new Error('order failed');
      try { localStorage.setItem('customerId', fd.customerName); } catch { /* ignore */ }
      router.push(`/successfully?productId=${product?.id}`);
    } catch {
      setErrors({ submit: t.errSubmit });
      setSubmitting(false);
    }
  };

  const label: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6, color: SUB };
  const errStyle: React.CSSProperties = { fontSize: '0.75rem', color: ERR, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 };

  const SummaryRow = ({ l, v, strong }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: strong ? '10px 0 0' : '5px 0' }}>
      <span style={{ flexShrink: 0, color: strong ? TXT : SUB, fontWeight: strong ? 800 : 500, fontSize: strong ? '1rem' : '0.88rem' }}>{l}</span>
      <span className="pt-mono" style={{ whiteSpace: 'nowrap', fontWeight: strong ? 800 : 700, fontSize: strong ? '1.05rem' : '0.9rem', color: strong ? A : TXT }}>{v}</span>
    </div>
  );

  return (
    <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 18, padding: '1.5rem', marginTop: 8 }}>
      {/* Quantity */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t.qty}</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', border: `1.5px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
          <button onClick={() => set('quantity', Math.max(1, fd.quantity - 1))}
            style={{ width: 40, height: 40, border: 'none', background: BG, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TXT }}><Minus size={16} /></button>
          <span className="pt-mono" style={{ width: 48, textAlign: 'center', fontWeight: 800 }}>{fd.quantity}</span>
          <button onClick={() => set('quantity', fd.quantity + 1)}
            style={{ width: 40, height: 40, border: 'none', background: BG, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TXT }}><Plus size={16} /></button>
        </div>
      </div>

      {/* Action buttons */}
      {!isOrderNow && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="pt-btn" onClick={() => setIsOrderNow(true)}>{t.orderNow}</button>
          {cartOn && (
            <button className="pt-btn pt-btn-ghost" onClick={addToCart}>
              <ShoppingCart size={18} /> {t.addToCart}
            </button>
          )}
        </div>
      )}

      {/* Order form */}
      {isOrderNow && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={label}>{t.fullName}</label>
            <input className="pt-input" style={errors.customerName ? { borderColor: ERR } : undefined}
              value={fd.customerName} onChange={(e) => set('customerName', e.target.value)} placeholder={t.fullNamePlaceholder} />
            {errors.customerName && <p style={errStyle}><AlertCircle size={12} /> {errors.customerName}</p>}
          </div>

          <div>
            <label style={label}>{t.phone}</label>
            <input className="pt-input pt-mono" style={errors.customerPhone ? { borderColor: ERR } : undefined}
              value={fd.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} placeholder={t.phonePlaceholder} inputMode="tel" />
            {errors.customerPhone && <p style={errStyle}><AlertCircle size={12} /> {errors.customerPhone}</p>}
          </div>

          <div className="pt-form-row2">
            <div>
              <label style={label}>{t.wilaya}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: MUT }} />
                <select className="pt-input" style={{ paddingInlineEnd: 36, ...(errors.customerWelaya ? { borderColor: ERR } : {}) }}
                  disabled={wilayas.length === 0}
                  value={fd.customerWelaya}
                  onChange={(e) => { set('customerWelaya', e.target.value); set('customerCommune', ''); }}>
                  <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                  {wilayas.map((w) => (
                    <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                  ))}
                </select>
              </div>
              {errors.customerWelaya && <p style={errStyle}><AlertCircle size={12} /> {errors.customerWelaya}</p>}
            </div>

            <div>
              <label style={label}>{t.commune}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: MUT }} />
                <select className="pt-input" style={{ paddingInlineEnd: 36, ...(errors.customerCommune ? { borderColor: ERR } : {}) }}
                  disabled={!fd.customerWelaya || loadingC}
                  value={fd.customerCommune}
                  onChange={(e) => set('customerCommune', e.target.value)}>
                  <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                  ))}
                </select>
              </div>
              {errors.customerCommune && <p style={errStyle}><AlertCircle size={12} /> {errors.customerCommune}</p>}
            </div>
          </div>

          {/* Delivery toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(['home', 'office'] as const).map((typ) => {
              const on = fd.typeLivraison === typ;
              return (
                <button key={typ} onClick={() => set('typeLivraison', typ)}
                  style={{ padding: '0.75rem', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', minHeight: 46, border: `1.5px solid ${on ? A : BD}`, background: on ? AL : CARD, color: on ? A : SUB, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {typ === 'home' ? <Truck size={16} /> : <MapPin size={16} />}
                  {typ === 'home' ? t.deliveryHome : t.deliveryOffice}
                </button>
              );
            })}
          </div>

          {/* Summary — above buttons */}
          <div style={{ background: BG, border: `1px solid ${BD}`, borderRadius: 14, padding: '1rem 1.25rem' }}>
            <SummaryRow l={t.price} v={fmt(fp)} />
            <SummaryRow l={t.qty} v={`× ${fd.quantity}`} />
            <SummaryRow l={t.delivery} v={selW ? fmt(getLiv()) : '—'} />
            <div style={{ height: 1, background: BD, margin: '8px 0 0' }} />
            <SummaryRow l={t.total} v={fmt(total())} strong />
          </div>

          {errors.submit && <p style={{ ...errStyle, fontSize: '0.85rem' }}><AlertCircle size={14} /> {errors.submit}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="pt-btn" onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            <button className="pt-btn pt-btn-ghost" style={{ width: 'auto', padding: '0.9rem 1.4rem' }}
              onClick={() => setIsOrderNow(false)} disabled={submitting}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== Cart =============================== */
export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const fmt = useFmt(store);
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

  const [items, setItems] = useState<any[]>([]);
  const [fd, setFd] = useState({
    customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      setItems(Array.isArray(arr) ? arr : []);
    } catch { setItems([]); }
  }, [domain]);

  useEffect(() => { if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [store]);
  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));
  const getLiv = (): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  };

  const cartTotal = items.reduce((s, it) => s + Number(it.finalPrice || it.product?.price || 0) * Number(it.quantity || 1), 0);
  const finalTotal = cartTotal + getLiv();
  const set = (k: string, v: any) => setFd((p) => ({ ...p, [k]: v }));

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    try { localStorage.setItem(domain, JSON.stringify(next)); } catch { /* ignore */ }
    initCount(next.length);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.trim())) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orders = items.map((it) => ({
        ...it, ...fd,
        totalPrice: Number(it.finalPrice || 0) * Number(it.quantity || 1) + getLiv(),
        priceLivraison: getLiv(),
      }));
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orders),
      });
      if (!r.ok) throw new Error('failed');
      try { localStorage.removeItem(domain); } catch { /* ignore */ }
      initCount(0);
      setItems([]);
      setDone(true);
    } catch {
      setErrors({ submit: t.errSubmit });
      setSubmitting(false);
    }
  };

  const label: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6, color: SUB };
  const errStyle: React.CSSProperties = { fontSize: '0.75rem', color: ERR, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 };

  if (done) {
    return (
      <div className="pt-container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, borderRadius: 999, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={38} color={A} />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 10 }}>{t.successTitle}</h1>
        <p style={{ color: SUB, marginBottom: 26 }}>{t.successDesc}</p>
        <Link href="/"><span className="pt-btn" style={{ width: 'auto', padding: '0.9rem 2rem' }}>{t.backToShop}</span></Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, borderRadius: 999, background: BG, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShoppingCart size={34} color={MUT} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>{t.cartEmpty}</h1>
        <p style={{ color: SUB, marginBottom: 26 }}>{t.cartEmptyDesc}</p>
        <Link href="/"><span className="pt-btn" style={{ width: 'auto', padding: '0.9rem 2rem' }}>{t.shopNow}</span></Link>
      </div>
    );
  }

  return (
    <div className="pt-container" style={{ padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 20, letterSpacing: '-0.02em' }}>{t.myCart}</h1>
      <div className="pt-cart-grid">
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((it, idx) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            return (
              <div key={idx} style={{ display: 'flex', gap: 14, background: CARD, border: `1px solid ${BD}`, borderRadius: 14, padding: '0.9rem' }}>
                <div style={{ width: 84, height: 84, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {img ? <img src={img} alt={it.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Smartphone size={30} color="#39405480" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.92rem' }}>{it.product?.name}</p>
                  <p className="pt-mono" style={{ margin: 0, color: MUT, fontSize: '0.8rem' }}>× {it.quantity}</p>
                  <p className="pt-mono" style={{ margin: '6px 0 0', color: A, fontWeight: 800 }}>{fmt(Number(it.finalPrice || 0) * Number(it.quantity || 1))}</p>
                </div>
                <button onClick={() => removeItem(idx)} aria-label={t.removeItem}
                  style={{ alignSelf: 'flex-start', border: 'none', background: 'transparent', cursor: 'pointer', color: MUT, padding: 4 }}>
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Checkout form */}
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 18, padding: '1.5rem', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={label}>{t.fullName}</label>
            <input className="pt-input" style={errors.customerName ? { borderColor: ERR } : undefined}
              value={fd.customerName} onChange={(e) => set('customerName', e.target.value)} placeholder={t.fullNamePlaceholder} />
            {errors.customerName && <p style={errStyle}><AlertCircle size={12} /> {errors.customerName}</p>}
          </div>
          <div>
            <label style={label}>{t.phone}</label>
            <input className="pt-input pt-mono" style={errors.customerPhone ? { borderColor: ERR } : undefined}
              value={fd.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} placeholder={t.phonePlaceholder} inputMode="tel" />
            {errors.customerPhone && <p style={errStyle}><AlertCircle size={12} /> {errors.customerPhone}</p>}
          </div>
          <div className="pt-form-row2">
            <div>
              <label style={label}>{t.wilaya}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: MUT }} />
                <select className="pt-input" style={{ paddingInlineEnd: 36, ...(errors.customerWelaya ? { borderColor: ERR } : {}) }}
                  disabled={wilayas.length === 0} value={fd.customerWelaya}
                  onChange={(e) => { set('customerWelaya', e.target.value); set('customerCommune', ''); }}>
                  <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                  {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>)}
                </select>
              </div>
              {errors.customerWelaya && <p style={errStyle}><AlertCircle size={12} /> {errors.customerWelaya}</p>}
            </div>
            <div>
              <label style={label}>{t.commune}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: MUT }} />
                <select className="pt-input" style={{ paddingInlineEnd: 36, ...(errors.customerCommune ? { borderColor: ERR } : {}) }}
                  disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune}
                  onChange={(e) => set('customerCommune', e.target.value)}>
                  <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>)}
                </select>
              </div>
              {errors.customerCommune && <p style={errStyle}><AlertCircle size={12} /> {errors.customerCommune}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(['home', 'office'] as const).map((typ) => {
              const on = fd.typeLivraison === typ;
              return (
                <button key={typ} onClick={() => set('typeLivraison', typ)}
                  style={{ padding: '0.75rem', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', minHeight: 46, border: `1.5px solid ${on ? A : BD}`, background: on ? AL : CARD, color: on ? A : SUB, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {typ === 'home' ? <Truck size={16} /> : <MapPin size={16} />}
                  {typ === 'home' ? t.deliveryHome : t.deliveryOffice}
                </button>
              );
            })}
          </div>

          <div style={{ background: BG, border: `1px solid ${BD}`, borderRadius: 14, padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '5px 0' }}>
              <span style={{ flexShrink: 0, color: SUB, fontSize: '0.88rem' }}>{t.subtotal}</span>
              <span className="pt-mono" style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{fmt(cartTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '5px 0' }}>
              <span style={{ flexShrink: 0, color: SUB, fontSize: '0.88rem' }}>{t.delivery}</span>
              <span className="pt-mono" style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{selW ? fmt(getLiv()) : '—'}</span>
            </div>
            <div style={{ height: 1, background: BD, margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ flexShrink: 0, fontWeight: 800 }}>{t.total}</span>
              <span className="pt-mono" style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: '1.1rem', color: A }}>{fmt(finalTotal)}</span>
            </div>
          </div>

          {errors.submit && <p style={{ ...errStyle, fontSize: '0.85rem' }}><AlertCircle size={14} /> {errors.submit}</p>}

          <button className="pt-btn" onClick={submit} disabled={submitting}>
            {submitting ? t.sending : t.confirmOrder}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================= Static Pages =========================== */
function Shell({ title, children }: any) {
  return (
    <div>
      <div style={{ background: INK, color: '#fff', padding: '3rem 1.5rem' }}>
        <div className="pt-container">
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
        </div>
      </div>
      <div className="pt-container" style={{ padding: '2.5rem 1.5rem', maxWidth: 860 }}>{children}</div>
    </div>
  );
}
function InfoBlock({ title, body }: any) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 8, color: TXT }}>{title}</h2>
      <p style={{ color: SUB, lineHeight: 1.8, fontSize: '0.95rem', margin: 0 }}>{body}</p>
    </div>
  );
}

export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  return <Shell title={t.privacyTitle}>{t.privacyBlocks.map((b: any, i: number) => <InfoBlock key={i} title={b.t} body={b.b} />)}</Shell>;
}
export function Terms({ store }: any) {
  const t = T[getLang(store)];
  return <Shell title={t.termsTitle}>{t.termsBlocks.map((b: any, i: number) => <InfoBlock key={i} title={b.t} body={b.b} />)}</Shell>;
}
export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  return <Shell title={t.cookiesTitle}>{t.cookiesBlocks.map((b: any, i: number) => <InfoBlock key={i} title={b.t} body={b.b} />)}</Shell>;
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const c = store?.contact || {};
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.message.trim()) { setErr(t.errSubmit); return; }
    setSending(true); setErr('');
    try {
      const r = await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      if (!r.ok) throw new Error('failed');
      setOk(true);
    } catch { setErr(t.errSubmit); }
    setSending(false);
  };

  const label: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6, color: SUB };

  return (
    <Shell title={t.contactTitle}>
      <p style={{ color: SUB, marginTop: '-1rem', marginBottom: 28 }}>{t.contactSubtitle}</p>
      <div className="pt-details" style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{t.getInTouch}</h3>
            {c.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} color={A} /></span>
                <span className="pt-mono">{c.phone}</span>
              </div>
            )}
            {c.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} color={A} /></span>
                <span>{c.email}</span>
              </div>
            )}
            {(c.wilaya || c.address) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={18} color={A} /></span>
                <span>{[c.wilaya, c.address].filter(Boolean).join(' — ')}</span>
              </div>
            )}
          </div>

          {ok ? (
            <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 16, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Check size={32} color={A} /></div>
              <p style={{ fontWeight: 800, marginBottom: 18 }}>{t.contactSuccess}</p>
              <button className="pt-btn pt-btn-ghost" style={{ width: 'auto', padding: '0.7rem 1.4rem' }}
                onClick={() => { setOk(false); setForm({ name: '', email: '', phone: '', message: '' }); }}>
                {t.sendAnother}
              </button>
            </div>
          ) : (
            <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={label}>{t.fullName}</label><input className="pt-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t.fullNamePlaceholder} /></div>
              <div className="pt-form-row2">
                <div><label style={label}>{t.email}</label><input className="pt-input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder={t.emailPlaceholder} inputMode="email" /></div>
                <div><label style={label}>{t.phone}</label><input className="pt-input pt-mono" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder={t.phonePlaceholder} inputMode="tel" /></div>
              </div>
              <div>
                <label style={label}>{t.message}</label>
                <textarea className="pt-input" rows={5} style={{ resize: 'none' }} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder={t.messagePlaceholder} />
              </div>
              {err && <p style={{ fontSize: '0.8rem', color: ERR, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}><AlertCircle size={13} /> {err}</p>}
              <button className="pt-btn" onClick={submit} disabled={sending}>
                <Send size={17} /> {sending ? t.sending2 : t.sendMessage}
              </button>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  if (p === 'privacy') return <Privacy store={store} />;
  if (p === 'terms') return <Terms store={store} />;
  if (p === 'cookies') return <Cookies store={store} />;
  if (p === 'contact') return <Contact store={store} />;
  return <Privacy store={store} />;
}