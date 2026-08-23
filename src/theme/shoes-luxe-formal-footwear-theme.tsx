'use client';

/**
 * DESIGN BRIEF — shoes-luxe-formal-footwear-theme
 * Niche: أحذية جلدية رسمية / فاخرة (Goodyear welt, full-grain leather)
 * Audience: رجال 28-55، مهنيون ومناسبات رسمية، يقدّرون الحرفة والمتانة أكثر من الصيحة.
 * Mood: حِرَفي (artisanal) — هادئ (quiet) — رسمي (ceremonial)
 * Navbar decision:  مِسْتَهَد letterpress بطبقتين: شعار مركزي بخطوط شعرية ممتدة على السطر الأول،
 *                   وروابط small-caps مُتباعدة على سطر ثانٍ مفصول بخط شعري. ينكمش لسطر واحد عند
 *                   التمرير. السبب: الحذاء الرسمي منتج تراثي/خياطة — الترويسة الطباعية تنقل الوقار،
 *                   والانكماش يحفظ كفاءة التسوّق. (مرفوض: شعار يسار + روابط وسط + سلة يمين)
 * Hero decision:    ورقة مواصفات تحريرية: عنوان serif عالي التباين في عمود غير متناظر + ثلاث
 *                   "علامات بيت" كصفوف مواصفات بخطوط شعرية. بلا صورة افتراضية — النص وحده أقوى
 *                   لمنتج تُشترى فيه الحرفة لا الصورة. الصورة (إن وُجدت) full-bleed خلفية مطلقة.
 * Card decision:    لوحة كتالوج: رقم فهرس مطبعي، شريط "عرض المنتج" ينزلق من أسفل الصورة عند hover،
 *                   بيانات في صف مزدوج تحت خط شعري. بلا ظل ولا radius — الفصل بالمسافة والخط فقط.
 * Product decision: معرض عرضي كامل العرض أعلى الصفحة (filmstrip تحته)، ثم عمودان: هوية المنتج
 *                   والعروض كـ ledger بخطوط شعرية / صندوق شراء لاصق. (مرفوض: صورة جانب + معلومات جانب)
 * Type: Cormorant Garamond + Amiri (display) · Jost + Tajawal (body)
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import { useCartStore } from '@/store/useCartStore';
import {
  Search, ShoppingBag, Menu, X, ChevronLeft, ChevronRight, ChevronDown,
  Phone, Mail, MapPin, Star, Trash2, Minus, Plus, Check, AlertCircle,
  Truck, ShieldCheck, Award, Headphones, Send, Footprints, ArrowRight,
} from 'lucide-react';

/* ============================ TOKENS ============================ */
const A = '#7C441C';
const AD = '#5B3013';
const AL = '#EFE4D8';
const BG = '#F6F2EC';
const CARD = '#FFFDFA';
const INK = '#1C1917';
const SUB = '#6A625B';
const BD = '#DED6CB';
const DARK = '#221D1A';
const ERR = '#B3261E';

const FD = "'Cormorant Garamond','Amiri',Georgia,serif";
const FB = "'Jost','Tajawal',system-ui,-apple-system,sans-serif";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ============================ TYPES ============================ */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[]; offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; slug?: string;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; };
}

/* ============================ I18N ============================ */
type Lang = 'ar' | 'fr' | 'en';

const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};

const T = {
  ar: {
    dir: 'rtl' as const,
    home: 'الرئيسية', contact: 'تواصل معنا', cart: 'السلة', shop: 'المجموعة',
    search: 'ابحث عن حذاء...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
    showAll: 'عرض كل النتائج',
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تصفّح المجموعة',
    ticker: 'جلد طبيعي 100٪ · توصيل لكل ولايات الوطن · الدفع عند الاستلام',
    heroEyebrow: 'بيت الأحذية الرسمية',
    heroTitle: 'أناقة تُصنع خطوة بخطوة',
    heroSub: 'أحذية جلدية مخيطة بعناية، مصمّمة لتدوم سنوات لا مواسم.',
    marks: [
      { t: 'جلد كامل الحبيبات', s: 'مدبوغ نباتياً' },
      { t: 'خياطة غودير', s: 'قابلة لإعادة النعل' },
      { t: 'صناعة يدوية', s: 'تشطيب بالفرشاة' },
    ],
    trust: [
      { t: 'توصيل سريع', s: 'لكل الولايات' },
      { t: 'جودة مضمونة', s: 'جلد أصلي 100%' },
      { t: 'دفع آمن', s: 'الدفع عند الاستلام' },
      { t: 'دعم 24/7', s: 'فريق متخصص للمساعدة' },
    ],
    collection: 'المجموعة', product: 'منتج', viewProduct: 'عرض المنتج',
    quickLinks: 'روابط سريعة', legalNav: 'قانوني', contactUs: 'تواصل معنا',
    privacy: 'الخصوصية', terms: 'الشروط', cookies: 'الكوكيز',
    rightsReserved: 'جميع الحقوق محفوظة',
    fullName: 'الاسم الكامل', fullNamePlaceholder: 'أدخل اسمك الكامل',
    phone: 'رقم الهاتف', phonePlaceholder: '05xxxxxxxx',
    email: 'البريد الإلكتروني', emailPlaceholder: 'name@mail.com',
    wilaya: 'الولاية', wilayaPlaceholder: 'اختر الولاية', wilayaUnavailable: 'التوصيل غير متاح حالياً',
    commune: 'البلدية', communePlaceholder: 'اختر البلدية', communeLoading: 'جاري التحميل...',
    deliveryHome: 'توصيل للمنزل', deliveryOffice: 'مكتب التوصيل',
    qty: 'الكمية', price: 'السعر', delivery: 'التوصيل', total: 'الإجمالي',
    orderNow: 'اطلب الآن', addToCart: 'أضف إلى السلة', added: 'تمت الإضافة',
    confirmOrder: 'تأكيد الطلب', sending: 'جاري الإرسال...', cancel: 'إلغاء',
    successTitle: 'تم إرسال طلبك بنجاح!', successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل.',
    backToShop: 'العودة للتسوق',
    cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تتم إضافة أي منتجات بعد.',
    myCart: 'سلتي', subtotal: 'المجموع الفرعي', items: 'عنصر', remove: 'حذف',
    errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
    errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'الوصف', optionsTitle: 'الخيارات',
    searchResultsFor: 'نتائج البحث عن:',
    msg: 'رسالتك', msgPlaceholder: 'اكتب رسالتك هنا...', send: 'إرسال الرسالة',
    sendAgain: 'إرسال رسالة أخرى', contactSuccess: 'تم استلام رسالتك، سنرد عليك قريباً.',
    callUs: 'الهاتف', writeUs: 'البريد', ourAddress: 'العنوان',
    pPrivacy: [
      { t: 'البيانات التي نجمعها', b: 'نجمع الاسم ورقم الهاتف والولاية والبلدية فقط، وهي البيانات اللازمة لتحضير الطلب وتسليمه.' },
      { t: 'كيف نستخدمها', b: 'تُستخدم بياناتك لتأكيد الطلب والتنسيق مع شركة التوصيل، ولا تُستعمل لأي غرض آخر.' },
      { t: 'المشاركة مع الغير', b: 'لا نبيع بياناتك. تُشارك فقط مع شركة التوصيل المكلّفة بطلبك.' },
      { t: 'حقوقك', b: 'يمكنك طلب تعديل أو حذف بياناتك في أي وقت عبر صفحة التواصل.' },
    ],
    pTerms: [
      { t: 'الطلب والتأكيد', b: 'يُعتبر الطلب مؤكداً بعد اتصال فريقنا بك هاتفياً للتحقق من التفاصيل.' },
      { t: 'الأسعار والتوصيل', b: 'الأسعار بالدينار الجزائري، وسعر التوصيل يُحسب حسب الولاية ونوع التسليم المختار.' },
      { t: 'الاستبدال', b: 'يمكن استبدال المقاس خلال مدة قصيرة من الاستلام شرط بقاء المنتج بحالته الأصلية.' },
      { t: 'الإلغاء', b: 'يمكن إلغاء الطلب مجاناً قبل تسليمه لشركة التوصيل.' },
    ],
    pCookies: [
      { t: 'ما هي الكوكيز', b: 'ملفات صغيرة تُحفظ في متصفحك لتذكّر سلة التسوق وتفضيلات العرض.' },
      { t: 'الكوكيز الضرورية', b: 'تُستعمل لحفظ محتوى السلة، ولا يمكن تعطيلها دون تعطّل عملية الشراء.' },
      { t: 'كوكيز القياس', b: 'تساعدنا على فهم الصفحات الأكثر زيارة لتحسين المتجر.' },
      { t: 'التحكم', b: 'يمكنك حذف الكوكيز من إعدادات متصفحك في أي وقت.' },
    ],
  },
  fr: {
    dir: 'ltr' as const,
    home: 'Accueil', contact: 'Contact', cart: 'Panier', shop: 'Collection',
    search: 'Rechercher une paire...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la collection',
    ticker: 'Cuir véritable 100% · Livraison dans toutes les wilayas · Paiement à la livraison',
    heroEyebrow: 'Maison de la chaussure formelle',
    heroTitle: "L'élégance se construit pas à pas",
    heroSub: 'Des souliers en cuir cousus avec soin, conçus pour durer des années, pas des saisons.',
    marks: [
      { t: 'Cuir pleine fleur', s: 'Tannage végétal' },
      { t: 'Cousu Goodyear', s: 'Ressemelable' },
      { t: 'Fait main', s: 'Patine à la brosse' },
    ],
    trust: [
      { t: 'Livraison Rapide', s: 'Partout en Algérie' },
      { t: 'Qualité Garantie', s: 'Cuir véritable' },
      { t: 'Paiement Sécurisé', s: 'Paiement à la livraison' },
      { t: 'Support 24/7', s: 'Toujours disponible' },
    ],
    collection: 'La collection', product: 'produits', viewProduct: 'Voir le produit',
    quickLinks: 'Navigation', legalNav: 'Légal', contactUs: 'Contact',
    privacy: 'Confidentialité', terms: 'Conditions', cookies: 'Cookies',
    rightsReserved: 'Tous droits réservés.',
    fullName: 'Nom complet', fullNamePlaceholder: 'Votre nom complet',
    phone: 'Téléphone', phonePlaceholder: '0555 12 34 56',
    email: 'Email', emailPlaceholder: 'nom@mail.com',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Choisir la wilaya', wilayaUnavailable: 'Livraison indisponible',
    commune: 'Commune', communePlaceholder: 'Choisir la commune', communeLoading: 'Chargement...',
    deliveryHome: 'À domicile', deliveryOffice: 'Point relais',
    qty: 'Quantité', price: 'Prix', delivery: 'Livraison', total: 'Total',
    orderNow: 'Commander', addToCart: 'Ajouter au panier', added: 'Ajouté',
    confirmOrder: 'Confirmer la commande', sending: 'Envoi en cours...', cancel: 'Annuler',
    successTitle: 'Commande confirmée !', successDesc: 'Notre équipe vous contactera bientôt.',
    backToShop: 'Retour à la boutique',
    cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre sélection.',
    myCart: 'Mon Panier', subtotal: 'Sous-total', items: 'article(s)', remove: 'Retirer',
    errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
    errName: 'Nom complet requis (3 caractères minimum)',
    errPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description', optionsTitle: 'Options',
    searchResultsFor: 'Résultats pour :',
    msg: 'Votre message', msgPlaceholder: 'Écrivez votre message ici...', send: 'Envoyer le message',
    sendAgain: 'Envoyer un autre message', contactSuccess: 'Message bien reçu, nous vous répondrons rapidement.',
    callUs: 'Téléphone', writeUs: 'Email', ourAddress: 'Adresse',
    pPrivacy: [
      { t: 'Données collectées', b: 'Nous collectons uniquement le nom, le téléphone, la wilaya et la commune, nécessaires à la préparation et à la livraison.' },
      { t: 'Utilisation', b: 'Vos données servent à confirmer la commande et à la coordonner avec le transporteur, rien de plus.' },
      { t: 'Partage', b: 'Nous ne vendons aucune donnée. Elle est transmise uniquement au livreur en charge de votre colis.' },
      { t: 'Vos droits', b: 'Vous pouvez demander la modification ou la suppression de vos données via la page contact.' },
    ],
    pTerms: [
      { t: 'Commande', b: 'La commande est confirmée après un appel de notre équipe pour vérifier les détails.' },
      { t: 'Prix et livraison', b: 'Les prix sont en dinar algérien ; les frais de livraison dépendent de la wilaya et du mode choisi.' },
      { t: 'Échange', b: "Le changement de pointure est possible peu après réception, produit dans son état d'origine." },
      { t: 'Annulation', b: 'La commande peut être annulée gratuitement avant remise au transporteur.' },
    ],
    pCookies: [
      { t: 'Définition', b: 'Petits fichiers enregistrés par votre navigateur pour mémoriser le panier et vos préférences.' },
      { t: 'Cookies essentiels', b: "Ils conservent le contenu du panier ; les désactiver empêche l'achat." },
      { t: "Mesure d'audience", b: 'Ils nous aident à comprendre les pages les plus consultées pour améliorer la boutique.' },
      { t: 'Contrôle', b: 'Vous pouvez supprimer les cookies depuis les réglages de votre navigateur.' },
    ],
  },
  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart', shop: 'Collection',
    search: 'Search for a pair...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Browse the collection',
    ticker: '100% genuine leather · Delivery to all wilayas · Cash on delivery',
    heroEyebrow: 'House of formal footwear',
    heroTitle: 'Elegance, built step by step',
    heroSub: 'Hand-stitched leather shoes, made to last years — not seasons.',
    marks: [
      { t: 'Full-grain leather', s: 'Vegetable tanned' },
      { t: 'Goodyear welted', s: 'Resoleable for life' },
      { t: 'Handcrafted', s: 'Brush-finished patina' },
    ],
    trust: [
      { t: 'Fast Delivery', s: 'Across all wilayas' },
      { t: 'Quality Guaranteed', s: '100% genuine leather' },
      { t: 'Secure Payment', s: 'Cash on delivery' },
      { t: '24/7 Support', s: 'Expert team always here' },
    ],
    collection: 'The collection', product: 'products', viewProduct: 'View product',
    quickLinks: 'Quick Links', legalNav: 'Legal', contactUs: 'Contact Us',
    privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies',
    rightsReserved: 'All rights reserved.',
    fullName: 'Full Name', fullNamePlaceholder: 'Enter your full name',
    phone: 'Phone Number', phonePlaceholder: '0555 12 34 56',
    email: 'Email', emailPlaceholder: 'name@mail.com',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Select wilaya', wilayaUnavailable: 'Delivery unavailable',
    commune: 'Commune', communePlaceholder: 'Select commune', communeLoading: 'Loading...',
    deliveryHome: 'Home Delivery', deliveryOffice: 'Pickup Point',
    qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total',
    orderNow: 'Order Now', addToCart: 'Add to Cart', added: 'Added',
    confirmOrder: 'Confirm Order', sending: 'Sending...', cancel: 'Cancel',
    successTitle: 'Order placed successfully!', successDesc: 'We will contact you shortly to confirm the details.',
    backToShop: 'Back to Shop',
    cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Start shopping now.',
    myCart: 'My Cart', subtotal: 'Subtotal', items: 'item(s)', remove: 'Remove',
    errSubmit: 'An error occurred. Please try again.',
    errName: 'Full name is required (at least 3 characters)',
    errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Description', optionsTitle: 'Options',
    searchResultsFor: 'Results for:',
    msg: 'Your message', msgPlaceholder: 'Write your message here...', send: 'Send message',
    sendAgain: 'Send another message', contactSuccess: 'Your message was received, we will reply shortly.',
    callUs: 'Phone', writeUs: 'Email', ourAddress: 'Address',
    pPrivacy: [
      { t: 'Data we collect', b: 'We only collect name, phone, wilaya and commune — the data required to prepare and deliver your order.' },
      { t: 'How we use it', b: 'Your data is used to confirm the order and coordinate with the courier, nothing else.' },
      { t: 'Sharing', b: 'We never sell your data. It is shared only with the courier handling your parcel.' },
      { t: 'Your rights', b: 'You may request correction or deletion of your data at any time via the contact page.' },
    ],
    pTerms: [
      { t: 'Orders', b: 'An order is confirmed once our team calls you to verify the details.' },
      { t: 'Prices & delivery', b: 'Prices are in Algerian dinar; delivery cost depends on the wilaya and the chosen method.' },
      { t: 'Exchange', b: 'Size exchange is possible shortly after delivery, provided the product is in original condition.' },
      { t: 'Cancellation', b: 'Orders can be cancelled free of charge before hand-off to the courier.' },
    ],
    pCookies: [
      { t: 'What cookies are', b: 'Small files stored by your browser to remember your cart and display preferences.' },
      { t: 'Essential cookies', b: 'They keep your cart contents; disabling them breaks the checkout flow.' },
      { t: 'Analytics cookies', b: 'They help us understand which pages are most visited so we can improve the store.' },
      { t: 'Control', b: 'You can delete cookies from your browser settings at any time.' },
    ],
  },
} as const;

/* ============================ HELPERS ============================ */
const clean = (html?: string): string => {
  const raw = String(html || '');
  try {
    if (typeof window !== 'undefined' && (DOMPurify as any)?.sanitize) return (DOMPurify as any).sanitize(raw);
  } catch (e) { /* noop */ }
  return raw.replace(/<script[\s\S]*?<\/script>/gi, '');
};

// Wrapped in LTR-isolate marks (U+2066/U+2069) so the space-separated thousands
// groups don't get bidi-reordered (e.g. "3 180" flipping to "180 3") when this
// string lands inside RTL (Arabic) text.
const fmt = (n: number): string => `\u2066${Number(n || 0).toLocaleString('en-US').replace(/,/g, ' ')}\u2069`;
const cur = (store?: any): string => store?.currency || 'DA';
const pad2 = (n: number): string => (n < 10 ? '0' + n : String(n));

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel || {}).every(([n, v]) => d.name?.some((e) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d?.data || []);
  } catch (e) { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d?.data || []);
  } catch (e) { return []; }
};

const imgOf = (p: any): string | undefined => p?.productImage || p?.imagesProduct?.[0]?.imageUrl;

/* ============================ STYLE FLOOR ============================ */
const inputBase: React.CSSProperties = {
  width: '100%', padding: '0.8rem 0.95rem', fontSize: '0.9rem', minHeight: 46,
  border: `1px solid ${BD}`, borderRadius: 0, background: CARD, color: INK,
  outline: 'none', appearance: 'none', transition: 'border-color .2s, box-shadow .2s',
  fontFamily: 'inherit',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
  padding: '0.95rem 1.6rem', minHeight: 48, background: A, color: '#FFF8F1',
  fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase',
  border: `1px solid ${A}`, borderRadius: 0, cursor: 'pointer', fontFamily: FB,
  transition: 'background .22s, transform .15s, box-shadow .22s', textDecoration: 'none',
};
const btnGhost: React.CSSProperties = {
  ...btnPrimary, background: 'transparent', color: INK, border: `1px solid ${INK}`,
};
const label: React.CSSProperties = {
  display: 'block', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase',
  color: SUB, marginBottom: 7, fontWeight: 500,
};
const eyebrow: React.CSSProperties = {
  fontSize: '0.66rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: A, fontWeight: 500,
};

/* ============================ CSS ============================ */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap');

.lx-root, .lx-root button, .lx-root input, .lx-root select, .lx-root textarea { font-family: ${FB}; }
.lx-root { background: ${BG}; color: ${INK}; }
.lx-root *, .lx-root *::before, .lx-root *::after { box-sizing: border-box; }
.lx-serif { font-family: ${FD}; }
.lx-wrap { max-width: 1280px; margin: 0 auto; padding: 0 1.25rem; }
@media (min-width: 768px) { .lx-wrap { padding: 0 2rem; } }

@keyframes lxUp { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
@keyframes lxIn { from { opacity:0; } to { opacity:1; } }
@keyframes lxScale { from { opacity:0; transform: scale(.94);} to { opacity:1; transform:none; } }
@keyframes lxRule { from { transform: scaleX(0);} to { transform: scaleX(1);} }
@keyframes lxMq { from { transform: translateX(0);} to { transform: translateX(-50%);} }
@keyframes lxShim { 0% { background-position: -420px 0; } 100% { background-position: 420px 0; } }
@keyframes lxBadge { 0%{transform:scale(1)} 40%{transform:scale(1.4)} 70%{transform:scale(.9)} 100%{transform:scale(1)} }

/* ---- ticker ---- */
.lx-ticker { background: ${DARK}; color: #E8DFD4; overflow: hidden; height: 34px; display:flex; align-items:center; }
.lx-mq { display:inline-flex; white-space: nowrap; animation: lxMq 30s linear infinite; will-change: transform; }
.lx-mq span { padding: 0 40px; display:inline-flex; align-items:center; gap:9px; font-size:.68rem; letter-spacing:.18em; text-transform:uppercase; }

/* ---- masthead ---- */
.lx-head { position: sticky; top: 0; z-index: 200; background: ${BG}; border-bottom: 1px solid ${BD}; transition: box-shadow .3s; }
.lx-head.is-scrolled { box-shadow: 0 1px 0 ${BD}, 0 10px 30px rgba(28,25,23,.06); }
.lx-mast { display:grid; grid-template-columns: 1fr auto 1fr; align-items:center; gap:14px; padding: 20px 0 16px; transition: padding .3s; }
.lx-head.is-scrolled .lx-mast { padding: 10px 0 8px; }
.lx-word { font-family: ${FD}; font-size: clamp(1.35rem, 4.4vw, 2.1rem); font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: ${INK}; text-decoration:none; text-align:center; line-height:1.1; white-space:nowrap; transition: font-size .3s; }
.lx-head.is-scrolled .lx-word { font-size: clamp(1.05rem, 3.4vw, 1.35rem); }
.lx-mast-side { display:flex; align-items:center; gap:6px; }
.lx-icobtn { width:44px; height:44px; display:grid; place-items:center; align-items:center; justify-content:center; background:transparent; border:none; cursor:pointer; color:${INK}; position:relative; transition: color .2s; }
.lx-icobtn:hover { color: ${A}; }

/* ---- nav row ---- */
.lx-navrow { display:none; border-top: 1px solid ${BD}; }
.lx-navlist { display:flex; align-items:center; justify-content:center; gap: 42px; padding: 11px 0; }
.lx-navlink { position:relative; font-size:.7rem; letter-spacing:.22em; text-transform:uppercase; color:${SUB}; text-decoration:none; padding: 4px 0; transition: color .22s; }
.lx-navlink:hover, .lx-navlink.is-active { color:${INK}; }
.lx-navlink::after { content:''; position:absolute; bottom:-2px; inset-inline-start:0; width:100%; height:1px; background:${A}; transform: scaleX(0); transform-origin: center; transition: transform .28s ease; }
.lx-navlink:hover::after, .lx-navlink.is-active::after { transform: scaleX(1); }

/* ---- responsive show/hide ---- */
.lx-d { display:none; }
.lx-m { display:flex; }
@media (min-width: 900px) {
  .lx-d { display:flex !important; }
  .lx-m { display:none !important; }
  .lx-navrow { display:block !important; }
}

/* ---- search ---- */
.lx-searchwrap { position:relative; width: 100%; max-width: 300px; }
.lx-searchin { width:100%; height:40px; background:transparent; border:none; border-bottom:1px solid ${BD}; padding: 0 30px 0 26px; font-size:.82rem; color:${INK}; outline:none; transition: border-color .25s; }
.lx-searchin:focus { border-color:${A}; }
.lx-drop { position:absolute; top: calc(100% + 8px); inset-inline-start:0; width:100%; min-width: 300px; background:${CARD}; border:1px solid ${BD}; box-shadow: 0 18px 40px rgba(28,25,23,.12); z-index: 500; max-height: 380px; overflow-y:auto; animation: lxScale .18s ease both; }
.lx-srow { display:flex; gap:12px; align-items:center; padding: 11px 13px; border-bottom:1px solid ${BD}; text-decoration:none; color:${INK}; transition: background .18s; }
.lx-srow:hover { background: ${AL}; }

/* ---- overlays ---- */
.lx-ovl { position:fixed; inset:0; z-index:600; background: rgba(28,25,23,.55); backdrop-filter: blur(4px); display:flex; flex-direction:column; animation: lxIn .2s ease both; }
.lx-drawer { position:fixed; inset:0; z-index:300; background: rgba(28,25,23,.5); animation: lxIn .2s ease both; }
.lx-drawer-in { position:absolute; top:0; inset-inline-start:0; width: min(84vw, 340px); height:100%; background:${BG}; padding: 22px 20px; display:flex; flex-direction:column; gap:4px; animation: lxUp .28s ease both; }

/* ---- hero ---- */
.lx-hero { position:relative; overflow:hidden; border-bottom:1px solid ${BD}; }
.lx-hero-in { position:relative; z-index:2; padding: clamp(40px, 6vw, 80px) 0 clamp(28px, 4vw, 56px); min-height: clamp(320px, 48vh, 540px); display:flex; flex-direction:column; justify-content:center; }
.lx-hero-title { font-family:${FD}; font-weight:500; font-size: clamp(2.4rem, 7.4vw, 5.2rem); line-height:1.03; letter-spacing:-0.01em; margin:.5rem 0 1rem; max-width: 760px; margin-inline-end:auto; word-break: break-word; animation: lxUp .8s ease .08s both; }
.lx-hero-sub { font-size: clamp(.95rem,2.2vw,1.08rem); line-height:1.75; max-width: 520px; margin-inline-end:auto; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; animation: lxUp .8s ease .2s both; }
.lx-hero-cta { display:flex; flex-wrap:wrap; gap:12px; margin-top: 2rem; animation: lxUp .8s ease .32s both; }
.lx-marks { display:grid; grid-template-columns:1fr; margin-top: clamp(38px, 6vw, 64px); border-top:1px solid ${BD}; animation: lxUp .8s ease .44s both; }
.lx-mark { padding: 16px 0; border-bottom:1px solid ${BD}; display:flex; align-items:baseline; gap:14px; }
@media (min-width: 768px) {
  .lx-marks { grid-template-columns: repeat(3,1fr); border-bottom:1px solid ${BD}; }
  .lx-mark { border-bottom:none; border-inline-end:1px solid ${BD}; padding: 18px 22px; flex-direction:column; gap:5px; }
  .lx-mark:last-child { border-inline-end:none; }
}

/* ---- trust ---- */
.lx-trust { display:grid; grid-template-columns: repeat(2,1fr); }
@media (min-width: 900px) { .lx-trust { grid-template-columns: repeat(4,1fr); } }
.lx-trust-i { display:flex; align-items:center; gap:12px; padding: 22px 16px; border-inline-end:1px solid ${BD}; border-bottom:1px solid ${BD}; }
.lx-trust-i:nth-child(2n) { border-inline-end:none; }
@media (min-width: 900px) {
  .lx-trust-i { border-bottom:none; border-inline-end:1px solid ${BD}; }
  .lx-trust-i:nth-child(2n) { border-inline-end:1px solid ${BD}; }
  .lx-trust-i:last-child { border-inline-end:none; }
}

/* ---- categories ---- */
.lx-cats { display:flex; gap: 26px; overflow-x:auto; padding: 4px 0 14px; scrollbar-width:none; }
.lx-cats::-webkit-scrollbar { display:none; }
.lx-cat { position:relative; white-space:nowrap; font-size:.72rem; letter-spacing:.2em; text-transform:uppercase; color:${SUB}; text-decoration:none; padding-bottom:8px; transition: color .22s; }
.lx-cat:hover { color:${INK}; }
.lx-cat.is-active { color:${A}; }
.lx-cat.is-active::after { content:''; position:absolute; bottom:0; inset-inline-start:0; width:100%; height:2px; background:${A}; animation: lxRule .32s ease both; }

/* ---- grid + card ---- */
.lx-grid { display:grid; grid-template-columns: 1fr; gap: 1px; background: ${BD}; border: 1px solid ${BD}; }
@media (min-width: 640px)  { .lx-grid { grid-template-columns: repeat(2,1fr); } }
@media (min-width: 1024px) { .lx-grid { grid-template-columns: repeat(3,1fr); } }
@media (min-width: 1280px) { .lx-grid { grid-template-columns: repeat(4,1fr); } }

.lx-card { position:relative; display:block; background:${CARD}; text-decoration:none; color:${INK}; animation: lxUp .55s ease both; transition: transform .3s cubic-bezier(.22,.68,0,1.2), background .3s; will-change: transform; }
.lx-card:hover { transform: translateY(-3px); background:#FFFFFF; }
.lx-plate { position:relative; overflow:hidden; aspect-ratio: 4/5; background:${AL}; display:block; }
.lx-cimg { width:100%; height:100%; object-fit:cover; display:block; transition: transform .7s cubic-bezier(.22,.68,0,1); }
.lx-card:hover .lx-cimg { transform: scale(1.06); }
.lx-cbar { position:absolute; inset-inline:0; bottom:0; background: rgba(28,25,23,.88); color:#FBF6EF; text-align:center; padding: 11px 8px; font-size:.66rem; letter-spacing:.2em; text-transform:uppercase; transform: translateY(101%); transition: transform .32s cubic-bezier(.22,.68,0,1.2); }
.lx-card:hover .lx-cbar { transform: translateY(0); }
.lx-cidx { position:absolute; top:10px; inset-inline-start:12px; font-family:${FD}; font-size:.9rem; letter-spacing:.1em; color:${INK}; opacity:.5; z-index:2; }
.lx-ctag { position:absolute; top:10px; inset-inline-end:10px; background:${A}; color:#FFF8F1; font-size:.64rem; letter-spacing:.1em; padding: 5px 8px; z-index:2; font-weight:500; }
.lx-cmeta { padding: 14px 16px 18px; border-top:1px solid ${BD}; }
.lx-cname { font-size:.9rem; font-weight:400; line-height:1.5; margin:0 0 8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height: 2.7em; }

/* ---- pagination ---- */
.lx-pg { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top: 42px; }
.lx-pgb { min-width:44px; height:44px; display:grid; place-items:center; border:1px solid ${BD}; background:transparent; color:${INK}; text-decoration:none; font-size:.8rem; transition: all .2s; }
.lx-pgb:hover { border-color:${A}; color:${A}; }
.lx-pgb.is-active { background:${INK}; border-color:${INK}; color:${BG}; }

/* ---- product page ---- */
.lx-gal { position:relative; width:100%; aspect-ratio: 1/1; background:${AL}; overflow:hidden; border:1px solid ${BD}; }
.lx-galnav { position:absolute; top:50%; transform: translateY(-50%); width:46px; height:46px; display:grid; place-items:center; background: rgba(246,242,236,.92); border:1px solid ${BD}; cursor:pointer; color:${INK}; transition: background .2s; z-index:3; }
.lx-galnav:hover { background:${CARD}; }
.lx-film { display:flex; gap:8px; overflow-x:auto; padding-top:10px; scrollbar-width:none; }
.lx-film::-webkit-scrollbar { display:none; }
.lx-thumb { width:78px; height:78px; flex:0 0 auto; border:1px solid ${BD}; background:${AL}; padding:0; cursor:pointer; overflow:hidden; transition: border-color .2s, opacity .2s; opacity:.62; }
.lx-thumb.is-active { border-color:${A}; opacity:1; }
.lx-pd-body { display:grid; grid-template-columns:1fr; gap: 40px; margin-top: 42px; }
@media (min-width: 1024px) { .lx-pd-body { grid-template-columns: 1.1fr .9fr; gap: 56px; align-items:start; } }
@media (min-width: 1024px) { .lx-buy { position: sticky; top: 130px; } }
.lx-desc-d { display:none; }
.lx-desc-m { display:block; }
@media (min-width: 1024px) { .lx-desc-d { display:block !important; } .lx-desc-m { display:none !important; } }
.lx-rte { font-size:.92rem; line-height:1.85; color:${SUB}; }
.lx-rte img { max-width:100%; height:auto; }
.lx-offer { display:flex; align-items:center; gap:14px; width:100%; text-align:start; padding: 15px 4px; background:transparent; border:none; border-bottom:1px solid ${BD}; cursor:pointer; transition: background .2s, padding-inline-start .25s; font-family:inherit; }
.lx-offer:hover { background:${AL}; padding-inline-start: 12px; }
.lx-swatch { min-width:46px; height:46px; border:1px solid ${BD}; background:${CARD}; cursor:pointer; display:grid; place-items:center; padding:0; font-size:.78rem; color:${INK}; transition: all .2s; font-family:inherit; overflow:hidden; }
.lx-swatch.is-active { border-color:${A}; box-shadow: inset 0 0 0 2px ${CARD}, 0 0 0 1px ${A}; }

/* ---- cart layout ---- */
.lx-cartlay { display:flex; flex-direction:column; gap: 2rem; }
@media (min-width: 1024px) {
  .lx-cartlay { flex-direction: row; align-items: flex-start; gap: 2.5rem; }
  .lx-cartlay > *:first-child { flex: 1.35; min-width: 0; }
  .lx-cartlay > *:last-child { flex: 1; min-width: 340px; position: sticky; top: 130px; }
}

/* ---- footer ---- */
.lx-foot { background:${DARK}; color:#CFC5B8; margin-top: 80px; }
.lx-footgrid { display:grid; grid-template-columns:1fr; gap: 34px; padding: 56px 0 40px; }
@media (min-width: 768px) { .lx-footgrid { grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 48px; } }
.lx-footlink { display:block; color:#CFC5B8; text-decoration:none; font-size:.82rem; padding: 7px 0; transition: color .2s, padding-inline-start .2s; }
.lx-footlink:hover { color:#FFF8F1; padding-inline-start: 6px; }

/* ---- misc ---- */
.lx-skel { background: linear-gradient(90deg, ${AL} 25%, #F7F1E9 50%, ${AL} 75%); background-size: 420px 100%; animation: lxShim 1.4s infinite linear; }
.lx-badge { animation: lxBadge .42s ease; }
.lx-ct2 { display:grid; grid-template-columns:1fr; gap: 40px; }
@media (min-width: 860px) { .lx-ct2 { grid-template-columns: .85fr 1.15fr; gap: 46px; align-items:start; } }
.lx-form-2 { display:grid; grid-template-columns:1fr; gap: .9rem; }
@media (min-width: 520px) { .lx-form-2 { grid-template-columns: 1fr 1fr; } }
.lx-btnp:hover { background:${AD} !important; border-color:${AD} !important; }
.lx-btnp:active { transform: translateY(1px); }
.lx-btnp:disabled { opacity:.6; cursor: default; transform:none; }
.lx-btng:hover { background:${INK} !important; color:${BG} !important; }
.lx-fade { animation: lxIn .35s ease both; }

@media (prefers-reduced-motion: reduce) {
  .lx-root *, .lx-root *::before, .lx-root *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important;
  }
}
`;

/* ============================ SHARED BITS ============================ */
function Stars({ n = 5, size = 11 }: { n?: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < n ? A : 'none'} color={i < n ? A : BD} strokeWidth={1.5} />
      ))}
    </span>
  );
}

function Placeholder({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: AL }}>
      <Footprints size={size} color={BD} strokeWidth={1.2} />
    </div>
  );
}

function Row({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: `1px solid ${BD}` }}>
      <span style={{ flexShrink: 0, fontSize: strong ? '.8rem' : '.78rem', letterSpacing: strong ? '.12em' : 0, textTransform: strong ? 'uppercase' : 'none', color: strong ? INK : SUB, fontWeight: strong ? 600 : 400 }}>{l}</span>
      <span dir="ltr" className={strong ? 'lx-serif' : ''} style={{ whiteSpace: 'nowrap', fontWeight: strong ? 600 : 500, fontSize: strong ? '1.25rem' : '.86rem', color: INK }}>{v}</span>
    </div>
  );
}

function ErrLine({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: '.72rem', color: ERR, marginTop: '.35rem', display: 'flex', alignItems: 'center', gap: 5 }}>
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

/* ============================ MAIN ============================ */
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
    <div className="lx-root" dir={t.dir} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <main style={{ flex: 1, opacity: visible ? 1 : 0, transition: 'opacity .34s ease' }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ============================ NAVBAR ============================ */
export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [bump, setBump] = useState(false);

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);
  const firstCount = useRef(true);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch (e) { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    if (firstCount.current) { firstCount.current = false; return; }
    setBump(true);
    const id = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(id);
  }, [count]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setShowSearch(false); }, [pathname]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setListSearch([]); setLoading(false); return; }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery.trim())}`);
        const d = await r.json();
        const arr = Array.isArray(d) ? d : (d?.products || d?.data || []);
        setListSearch(arr.slice(0, 6));
      } catch (e) { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(id);
  }, [searchQuery, domain]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearch(false);
    setSearchFocused(false);
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const closeSearch = () => { setShowSearch(false); setSearchQuery(''); setListSearch([]); };

  const links = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const logo = store?.design?.logoUrl;

  const resultRows = (onPick: () => void) => (
    <>
      {loading && <p style={{ padding: '1rem', textAlign: 'center', color: SUB, fontSize: '.82rem' }}>{t.searching}</p>}
      {!loading && listSearch.length === 0 && searchQuery.trim().length >= 2 && (
        <p style={{ padding: '1.4rem', textAlign: 'center', color: SUB, fontSize: '.82rem' }}>{t.noResults}</p>
      )}
      {listSearch.map((p: any) => {
        const im = imgOf(p);
        return (
          <Link key={p.id} href={`/product/${p.slug || p.id}`} className="lx-srow" onClick={onPick}>
            <span style={{ width: 52, height: 52, flexShrink: 0, overflow: 'hidden', background: AL, display: 'block' }}>
              {im ? <img src={im} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <Placeholder size={20} />}
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: '.85rem', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ display: 'block', fontSize: '.8rem', color: A, fontWeight: 600 }}>{fmt(Number(p.price))} {cur(store)}</span>
            </span>
          </Link>
        );
      })}
      {listSearch.length > 0 && (
        <Link href={`/?search=${encodeURIComponent(searchQuery.trim())}`} onClick={onPick}
          style={{ display: 'block', padding: '13px', textAlign: 'center', fontSize: '.7rem', letterSpacing: '.16em', textTransform: 'uppercase', color: A, textDecoration: 'none', background: AL }}>
          {t.showAll}
        </Link>
      )}
    </>
  );

  return (
    <header className={`lx-head${scrolled ? ' is-scrolled' : ''}`}>
      <div className="lx-ticker">
        <div className="lx-mq">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i}><Truck size={12} strokeWidth={1.6} />{store?.topBar?.text || t.ticker}</span>
          ))}
        </div>
      </div>

      <div className="lx-wrap">
        <div className="lx-mast">
          <div className="lx-mast-side">
            <button className="lx-icobtn lx-m" onClick={() => setOpen(true)} aria-label={t.home} type="button">
              <Menu size={21} strokeWidth={1.5} />
            </button>
            <form onSubmit={submitSearch} className="lx-searchwrap lx-d">
              <Search size={15} color={SUB} style={{ position: 'absolute', insetInlineStart: 2, top: 12, pointerEvents: 'none' }} />
              <input
                className="lx-searchin" value={searchQuery} placeholder={t.search}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                aria-label={t.search}
              />
              {searchQuery && (
                <button type="button" aria-label={t.cancel}
                  onMouseDown={(e) => { e.preventDefault(); setSearchQuery(''); setListSearch([]); setSearchFocused(false); }}
                  style={{ position: 'absolute', insetInlineEnd: 0, top: 8, width: 24, height: 24, display: 'grid', placeItems: 'center', background: AL, border: 'none', cursor: 'pointer' }}>
                  <X size={12} color={INK} />
                </button>
              )}
              {searchFocused && searchQuery.trim().length >= 2 && (
                <div className="lx-drop">{resultRows(() => { setSearchQuery(''); setListSearch([]); })}</div>
              )}
            </form>
          </div>

          <Link href="/" className="lx-word">
            {logo && !imgError ? (
              <img src={logo} alt={store?.name || 'logo'} onError={() => setImgError(true)}
                style={{ height: scrolled ? 32 : 46, width: 'auto', objectFit: 'contain', display: 'block', transition: 'height .3s' }} />
            ) : (store?.name || 'MAISON')}
          </Link>

          <div className="lx-mast-side" style={{ justifyContent: 'flex-end' }}>
            <button className="lx-icobtn lx-m" onClick={() => setShowSearch(true)} aria-label={t.search} type="button">
              <Search size={20} strokeWidth={1.5} />
            </button>
            {store?.cart !== false && (
              <Link href="/cart" className="lx-icobtn" aria-label={t.cart}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {count > 0 && (
                  <span className={bump ? 'lx-badge' : ''} style={{ position: 'absolute', top: 5, insetInlineEnd: 3, minWidth: 17, height: 17, padding: '0 4px', background: A, color: '#FFF8F1', fontSize: '.6rem', display: 'grid', placeItems: 'center', fontWeight: 600 }}>
                    {count}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>

      <nav className="lx-navrow">
        <div className="lx-wrap">
          <div className="lx-navlist">
            {links.map((l) => (
              <Link key={l.h} href={l.h} className={`lx-navlink${pathname === l.h ? ' is-active' : ''}`}>{l.l}</Link>
            ))}
            <Link href="/terms" className={`lx-navlink${pathname === '/terms' ? ' is-active' : ''}`}>{t.terms}</Link>
            <Link href="/privacy" className={`lx-navlink${pathname === '/privacy' ? ' is-active' : ''}`}>{t.privacy}</Link>
          </div>
        </div>
      </nav>

      {open && (
        <div className="lx-drawer" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="lx-drawer-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <span className="lx-serif" style={{ fontSize: '1.15rem', letterSpacing: '.16em', textTransform: 'uppercase' }}>{store?.name || 'MAISON'}</span>
              <button className="lx-icobtn" onClick={() => setOpen(false)} aria-label={t.cancel} type="button"><X size={21} /></button>
            </div>
            {[...links, { h: '/terms', l: t.terms }, { h: '/privacy', l: t.privacy }, { h: '/cookies', l: t.cookies }].map((l) => (
              <Link key={l.h} href={l.h} onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '15px 0', borderBottom: `1px solid ${BD}`, color: INK, textDecoration: 'none', fontSize: '.78rem', letterSpacing: '.18em', textTransform: 'uppercase' }}>
                {l.l}
              </Link>
            ))}
          </div>
        </div>
      )}

      {showSearch && (
        <div className="lx-ovl" onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}>
          <form onSubmit={submitSearch} style={{ background: BG, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={19} color={SUB} />
            <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search}
              aria-label={t.search}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: INK, minHeight: 44 }} />
            <button type="button" onClick={closeSearch} aria-label={t.cancel}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: 44, height: 44, display: 'grid', placeItems: 'center', color: INK }}>
              <X size={21} />
            </button>
          </form>
          <div style={{ flex: 1, overflowY: 'auto', background: CARD }}>{resultRows(closeSearch)}</div>
        </div>
      )}
    </header>
  );
}

/* ============================ FOOTER ============================ */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const year = new Date().getFullYear();
  const links = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contact },
  ].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);

  const c = store?.contact || {};

  return (
    <footer className="lx-foot">
      <div className="lx-wrap">
        <div className="lx-footgrid">
          <div>
            <p className="lx-serif" style={{ fontSize: '1.5rem', letterSpacing: '.16em', textTransform: 'uppercase', margin: 0, color: '#FFF8F1' }}>
              {store?.name || 'MAISON'}
            </p>
            <div style={{ width: 46, height: 1, background: A, margin: '16px 0' }} />
            <p dir="auto" style={{ fontSize: '.85rem', lineHeight: 1.8, maxWidth: 340, margin: 0, marginInlineEnd: 'auto' }}>
              {store?.hero?.subtitle || t.heroSub}
            </p>
          </div>

          <div>
            <p style={{ ...eyebrow, color: '#8C8073', marginBottom: 14 }}>{t.quickLinks}</p>
            {links.map((l) => <Link key={l.h} href={l.h} className="lx-footlink">{l.l}</Link>)}
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
            <p style={{ ...eyebrow, color: '#8C8073', marginBottom: 14 }}>{t.contactUs}</p>
            {c.phone && (
              <a href={`tel:${c.phone}`} className="lx-footlink" style={{ display: 'flex', alignItems: 'center', gap: 9 }} dir="ltr">
                <Phone size={14} strokeWidth={1.6} /> {c.phone}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="lx-footlink" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Mail size={14} strokeWidth={1.6} /> {c.email}
              </a>
            )}
            {(c.wilaya || c.address) && (
              <span className="lx-footlink" style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <MapPin size={14} strokeWidth={1.6} style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{[c.wilaya, c.address].filter(Boolean).join(' — ')}</span>
              </span>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,248,241,.14)', padding: '20px 0 26px', fontSize: '.72rem', letterSpacing: '.1em', color: '#8C8073' }}>
          © {year} {store?.name || 'MAISON'} — {t.rightsReserved}
        </div>
      </div>
    </footer>
  );
}

/* ============================ CARD ============================ */
export function Card({ product, displayImage, discount, store, viewDetails, index }: any) {
  const t = T[getLang(store)];
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || product?.productImage || product?.imagesProduct?.[0]?.imageUrl;
  const price = Number(product?.price) || 0;
  const orig = Number(product?.priceOriginal) || 0;

  return (
    <Link
      href={`/product/${product?.slug || product?.id}`}
      className="lx-card"
      style={{ animationDelay: `${Math.min(Number(index) || 0, 11) * 0.06}s` }}
      aria-label={product?.name}
    >
      <div className="lx-plate">
        {typeof index === 'number' && <span className="lx-cidx">{pad2(index + 1)}</span>}
        {discount > 0 && <span className="lx-ctag">−{discount}%</span>}
        {img && !imgErr ? (
          <img src={img} alt={product?.name || ''} loading="lazy" className="lx-cimg" onError={() => setImgErr(true)} />
        ) : (
          <Placeholder size={44} />
        )}
        <span className="lx-cbar">{t.viewProduct}</span>
      </div>

      <div className="lx-cmeta">
        <p className="lx-cname" dir="auto">{product?.name}</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
          <Stars n={5} />
          <span dir="ltr" style={{ display: 'flex', alignItems: 'baseline', gap: 8, whiteSpace: 'nowrap' }}>
            {orig > price && (
              <span style={{ fontSize: '.74rem', color: SUB, textDecoration: 'line-through' }}>{fmt(orig)}</span>
            )}
            <span className="lx-serif" style={{ fontSize: '1.18rem', fontWeight: 600, color: INK }}>
              {fmt(price)} <span style={{ fontSize: '.7rem', fontFamily: FB, color: SUB }}>{cur(store)}</span>
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ============================ HOME ============================ */
export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get('category') || '';
  const searchTerm = searchParams?.get('search') || '';

  const products: any[] = store?.products || [];
  const cats: any[] = store?.categories || [];
  const heroImg = store?.hero?.imageUrl;
  const onImg = !!heroImg;

  const curPage = Number(page) || 1;
  const countPage = Math.max(1, Math.ceil((Number(store?.count) || products.length) / 48));

  const TXT = onImg ? '#FFF8F1' : INK;
  const TXT2 = onImg ? 'rgba(255,248,241,.82)' : SUB;
  const RULE = onImg ? 'rgba(255,248,241,.28)' : BD;

  const trustIcons = [Truck, Award, ShieldCheck, Headphones];

  return (
    <div>
      <section className="lx-hero" style={{ background: onImg ? DARK : BG }}>
        {onImg && (
          <img src={heroImg} alt="" aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', zIndex: 0 }} />
        )}
        {onImg && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg, rgba(28,25,23,.62) 0%, rgba(28,25,23,.78) 100%)' }} />
        )}

        <div className="lx-wrap" style={{ position: 'relative', zIndex: 2 }}>
          <div className="lx-hero-in">
            <p style={{ ...eyebrow, color: onImg ? '#D9A97A' : A, animation: 'lxIn .6s ease both' }}>{t.heroEyebrow}</p>

            <h1 dir="auto" className="lx-hero-title" style={{ color: TXT }}
              dangerouslySetInnerHTML={{ __html: clean(store?.hero?.title || t.heroTitle) }} />

            <p dir="auto" className="lx-hero-sub" style={{ color: TXT2 }}>
              {store?.hero?.subtitle || t.heroSub}
            </p>

            <div className="lx-hero-cta">
              <a href="#collection" className="lx-btnp" style={{ ...btnPrimary }}>
                {t.shopNow} <ArrowRight size={15} style={{ transform: t.dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />
              </a>
              {store?.cart !== false && (
                <Link href="/cart" className="lx-btng" style={{ ...btnGhost, color: TXT, borderColor: RULE }}>
                  {t.cart}
                </Link>
              )}
            </div>

            <div className="lx-marks" style={{ borderColor: RULE }}>
              {t.marks.map((m: any, i: number) => (
                <div key={i} className="lx-mark" style={{ borderColor: RULE }}>
                  <span className="lx-serif" style={{ fontSize: '.85rem', color: onImg ? '#D9A97A' : A, minWidth: 26 }}>{pad2(i + 1)}</span>
                  <span>
                    <span style={{ display: 'block', fontSize: '.86rem', fontWeight: 500, color: TXT }}>{m.t}</span>
                    <span style={{ display: 'block', fontSize: '.76rem', color: TXT2, marginTop: 2 }}>{m.s}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ borderBottom: `1px solid ${BD}`, background: CARD }}>
        <div className="lx-wrap">
          <div className="lx-trust">
            {t.trust.map((item: any, i: number) => {
              const Ico = trustIcons[i] || Truck;
              return (
                <div key={i} className="lx-trust-i">
                  <Ico size={21} color={A} strokeWidth={1.4} />
                  <span>
                    <span style={{ display: 'block', fontSize: '.8rem', fontWeight: 500 }}>{item.t}</span>
                    <span style={{ display: 'block', fontSize: '.72rem', color: SUB, marginTop: 2 }}>{item.s}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="collection" style={{ padding: '60px 0 80px' }}>
        <div className="lx-wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 26 }}>
            <div>
              <p style={eyebrow}>{searchTerm ? t.searchResultsFor : t.collection}</p>
              <h2 className="lx-serif" dir="auto" style={{ fontSize: 'clamp(1.7rem,4.4vw,2.6rem)', fontWeight: 500, margin: '.35rem 0 0' }}>
                {searchTerm || store?.name || t.collection}
              </h2>
            </div>
            <span style={{ fontSize: '.75rem', color: SUB, letterSpacing: '.1em' }}>
              {(Number(store?.count) || products.length)} {t.product}
            </span>
          </div>

          {cats.length > 0 && (
            <div style={{ borderBottom: `1px solid ${BD}`, marginBottom: 34 }}>
              <div className="lx-cats">
                <Link href="/" className={`lx-cat${!activeCategory ? ' is-active' : ''}`}>{t.all}</Link>
                {cats.map((cat: any) => (
                  <Link key={cat.id} href={`?category=${cat.id}`}
                    className={`lx-cat${String(activeCategory) === String(cat.id) ? ' is-active' : ''}`}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', border: `1px solid ${BD}`, background: CARD }}>
              <Footprints size={42} color={BD} strokeWidth={1.1} />
              <p style={{ marginTop: 16, color: SUB, fontSize: '.9rem' }}>{t.noProducts}</p>
            </div>
          ) : (
            <div className="lx-grid">
              {products.map((p: any, i: number) => {
                const price = Number(p.price) || 0;
                const orig = Number(p.priceOriginal) || 0;
                const discount = orig > price && orig > 0 ? Math.round(((orig - price) / orig) * 100) : 0;
                return (
                  <Card key={p.id} product={p} index={i} displayImage={imgOf(p)} discount={discount} store={store} viewDetails={undefined} />
                );
              })}
            </div>
          )}

          {countPage > 1 && (
            <div className="lx-pg">
              {Array.from({ length: countPage }).map((_, i) => {
                const n = i + 1;
                return (
                  <Link key={n} href={{ query: { page: n } }} scroll={false}
                    className={`lx-pgb${n === curPage ? ' is-active' : ''}`}>
                    {n}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ============================ DETAILS ============================ */
export function Details({
  product, discount, allImages, allAttrs, finalPrice, selectedVariants,
  setSelectedOffer, selectedOffer, handleVariantSelection, domain, store: storeprop, userId, platform,
}: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(storeprop || product?.store)];
  const [sel, setSel] = useState(0);
  const [imgErr, setImgErr] = useState(false);

  const imgs: string[] = useMemo(() => Array.from(new Set([
    product?.productImage,
    ...(product?.imagesProduct?.map((i: any) => i?.imageUrl) || []),
    ...(Array.isArray(allImages) ? allImages.map((i: any) => (typeof i === 'string' ? i : i?.imageUrl)) : []),
  ].filter(Boolean) as string[])), [product, allImages]);

  const attrs: Attribute[] = (Array.isArray(allAttrs) && allAttrs.length ? allAttrs : product?.attributes) || [];
  const offers: Offer[] = product?.offers || [];
  const price = Number(finalPrice ?? product?.price) || 0;
  const orig = Number(product?.priceOriginal) || 0;

  const go = (dir: number) => {
    if (imgs.length < 2) return;
    setImgErr(false);
    setSel((s) => (s + dir + imgs.length) % imgs.length);
  };

  const descBlock = (cls: string) => (
    <div className={cls}>
      <p style={{ ...eyebrow, marginBottom: 12 }}>{t.descTitle}</p>
      <div className="lx-rte" dir="auto" dangerouslySetInnerHTML={{ __html: clean(product?.desc) }} />
    </div>
  );

  return (
    <div className="lx-wrap" style={{ paddingTop: '34px', paddingBottom: '70px' }}>
      <div className="lx-pd-body">
        {/* Col 1 — Gallery */}
        <div>
          <div className="lx-gal">
            {imgs.length > 0 && !imgErr ? (
              <img src={imgs[sel] || ''} alt={product?.name || ''} onError={() => setImgErr(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <Placeholder size={56} />
            )}
            {discount > 0 && (
              <span style={{ position: 'absolute', top: 14, insetInlineStart: 14, background: A, color: '#FFF8F1', fontSize: '.7rem', letterSpacing: '.1em', padding: '7px 11px', zIndex: 3 }}>
                −{discount}%
              </span>
            )}
            {imgs.length > 1 && (
              <button type="button" className="lx-galnav" style={{ insetInlineStart: 12 }} onClick={() => go(-1)} aria-label="prev">
                {t.dir === 'rtl' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            )}
            {imgs.length > 1 && (
              <button type="button" className="lx-galnav" style={{ insetInlineEnd: 12 }} onClick={() => go(1)} aria-label="next">
                {t.dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="lx-film">
              {imgs.map((u, i) => (
                <button key={i} type="button" onClick={() => { setSel(i); setImgErr(false); }}
                  className={`lx-thumb${i === sel ? ' is-active' : ''}`} aria-label={`${i + 1}`}>
                  <img src={u} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Col 2 — Product info + Form */}
        <div>
          <h1 dir="auto" className="lx-serif" style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 500, lineHeight: 1.15, margin: '0 0 14px' }}>
            {product?.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <Stars n={5} size={13} />
            <span style={{ fontSize: '.74rem', color: SUB, letterSpacing: '.08em' }}>{t.trust[1].s}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, paddingBottom: 20, borderBottom: `1px solid ${BD}` }}>
            <span className="lx-serif" dir="ltr" style={{ fontSize: 'clamp(1.9rem,5vw,2.6rem)', fontWeight: 600, color: A, whiteSpace: 'nowrap' }}>
              {fmt(price)} <span style={{ fontSize: '.9rem', fontFamily: FB, color: SUB }}>{cur(store)}</span>
            </span>
            {orig > price && (
              <span dir="ltr" style={{ fontSize: '1rem', color: SUB, textDecoration: 'line-through', whiteSpace: 'nowrap' }}>{fmt(orig)}</span>
            )}
          </div>

          {offers.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <p style={{ ...eyebrow, marginBottom: 6 }}>{t.offersTitle}</p>
              {offers.map((o: Offer) => {
                const active = String(selectedOffer) === String(o.id);
                return (
                  <button key={o.id} type="button" className="lx-offer"
                    onClick={() => setSelectedOffer(active ? null : o.id)}
                    style={{ borderBottomColor: active ? A : BD }}>
                    <span style={{ width: 18, height: 18, border: `1px solid ${active ? A : BD}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {active && <Check size={12} color={A} />}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span dir="auto" style={{ display: 'block', fontSize: '.88rem', color: INK }}>{o.name}</span>
                      <span style={{ display: 'block', fontSize: '.72rem', color: SUB, marginTop: 2 }}>× {o.quantity}</span>
                    </span>
                    <span className="lx-serif" dir="ltr" style={{ fontSize: '1.1rem', fontWeight: 600, color: active ? A : INK, whiteSpace: 'nowrap' }}>
                      {fmt(Number(o.price))} {cur(store)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {attrs.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <p style={{ ...eyebrow, marginBottom: 12 }}>{t.optionsTitle}</p>
              {attrs.map((attr: Attribute) => (
                <div key={attr.id} style={{ marginBottom: 20 }}>
                  <p style={label}>{attr.name}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                    {(attr.variants || []).map((v: Variant) => {
                      const active = selectedVariants?.[attr.name] === v.value;
                      const mode = attr.displayMode || 'text';
                      const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                        Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                          ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                        )
                      );
                      return (
                        <button key={v.id} type="button" className={`lx-swatch${active ? ' is-active' : ''}`}
                          onClick={() => available && handleVariantSelection && handleVariantSelection(attr.name, v.value)}
                          title={v.name || v.value} aria-label={v.name || v.value}
                          style={(mode === 'color' || mode === 'image') ? { width: 46, cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35 } : { cursor: available ? 'pointer' : 'not-allowed', color: available ? undefined : '#bbb', textDecoration: available ? 'none' : 'line-through' }}>
                          {mode === 'color' && (/^https?:\/\//.test(v.value) ? <img src={v.value} alt={v.name || v.value} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <span style={{ width: '100%', height: '100%', background: v.value, display: 'block' }} />)}
                          {mode === 'image' && <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                          {mode !== 'color' && mode !== 'image' && <span style={{ padding: '0 12px', whiteSpace: 'nowrap' }}>{v.name || v.value}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {product?.desc && (
            <div style={{ marginTop: 34, paddingTop: 26, borderTop: `1px solid ${BD}` }}>
              {descBlock('lx-desc-d')}
            </div>
          )}
          <div className="lx-buy" style={{ marginTop: 32 }}>
            <div style={{ background: CARD, border: `1px solid ${BD}`, padding: '24px 20px' }}>
              <ProductForm
                product={product}
                store={store}
                userId={userId || product?.store?.userId}
                domain={domain}
                selectedOffer={selectedOffer}
                setSelectedOffer={setSelectedOffer}
                selectedVariants={selectedVariants}
                platform={platform}
              />
            </div>

            {product?.desc && (
              <div style={{ marginTop: 24 }}>
                {descBlock('lx-desc-m')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ PRODUCT FORM ============================ */
export function ProductForm({
  product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store: storeprop,
}: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

  const uid = userId || product?.store?.userId;

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [added, setAdded] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [globalErr, setGlobalErr] = useState('');

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => { if (uid) fetchWilayas(uid).then(setWilayas); }, [uid]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getFP = (): number => {
    const off = selectedOffer ? product?.offers?.find((o: Offer) => String(o.id) === String(selectedOffer)) : undefined;
    if (off) return Number(off.price);
    const vd = product?.variantDetails?.find((d: VariantDetail) => variantMatches(d, selectedVariants || {}));
    if (vd && Number(vd.price) !== -1) return Number(vd.price);
    return Number(product?.price) || 0;
  };

  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const getVarId = (): any => {
    const vd = product?.variantDetails?.find((d: VariantDetail) => variantMatches(d, selectedVariants || {}));
    return vd ? vd.id : null;
  };

  const fp = getFP();
  const total = () => fp * fd.quantity + getLiv();

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test((fd.customerPhone || '').replace(/\s/g, ''))) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const payload = () => ({
    ...fd,
    product,
    productId: product?.id,
    storeId: product?.store?.id || store?.id,
    userId: uid,
    variantDetailId: getVarId(),
    selectedOffer: selectedOffer || null,
    selectedVariants: selectedVariants || {},
    platform: platform || 'web',
    finalPrice: fp,
    totalPrice: total(),
    priceLivraison: getLiv(),
  });

  const addToCart = () => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      const next = Array.isArray(arr) ? arr : [];
      next.push({ ...payload(), addedAt: new Date().toISOString() });
      localStorage.setItem(domain, JSON.stringify(next));
      initCount(next.length);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (e) { setGlobalErr(t.errSubmit); }
  };

  const submitOrder = async () => {
    setGlobalErr('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      if (!r.ok) throw new Error('failed');
      const d = await r.json().catch(() => ({}));
      const cid = d?.customerId || d?.data?.customerId;
      if (cid) { try { localStorage.setItem('customerId', String(cid)); } catch (e) { /* noop */ } }
      router.push(`/successfully?productId=${product?.id}`);
    } catch (e) {
      setGlobalErr(t.errSubmit);
      setSubmitting(false);
    }
  };

  const set = (k: string, v: any) => setFd((s) => ({ ...s, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${BD}` }}>
        <span style={eyebrow}>{t.qty}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BD}` }}>
          <button type="button" onClick={() => set('quantity', Math.max(1, fd.quantity - 1))} aria-label="-"
            style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: INK }}>
            <Minus size={14} />
          </button>
          <span className="lx-serif" style={{ minWidth: 42, textAlign: 'center', fontSize: '1.05rem', fontWeight: 600 }}>{fd.quantity}</span>
          <button type="button" onClick={() => set('quantity', fd.quantity + 1)} aria-label="+"
            style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: INK }}>
            <Plus size={14} />
          </button>
        </span>
      </div>

      {!isOrderNow && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" className="lx-btnp" style={btnPrimary} onClick={() => setIsOrderNow(true)}>
            {t.orderNow}
          </button>
          {store?.cart !== false && (
            <button type="button" className="lx-btng" style={btnGhost} onClick={addToCart}>
              {added ? <><Check size={15} /> {t.added}</> : <><ShoppingBag size={15} /> {t.addToCart}</>}
            </button>
          )}
        </div>
      )}

      {isOrderNow && (
        <div className="lx-fade">
          <div style={{ marginBottom: 14 }}>
            <label style={label} htmlFor="lx-name">{t.fullName}</label>
            <input id="lx-name" style={{ ...inputBase, ...(errs.customerName ? { borderColor: ERR } : {}) }}
              value={fd.customerName} placeholder={t.fullNamePlaceholder}
              onChange={(e) => set('customerName', e.target.value)}
              onFocus={(e) => { e.currentTarget.style.borderColor = A; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = errs.customerName ? ERR : BD; }} />
            <ErrLine msg={errs.customerName} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label} htmlFor="lx-phone">{t.phone}</label>
            <input id="lx-phone" type="tel" dir="ltr" inputMode="tel"
              style={{ ...inputBase, ...(errs.customerPhone ? { borderColor: ERR } : {}) }}
              value={fd.customerPhone} placeholder={t.phonePlaceholder}
              onChange={(e) => set('customerPhone', e.target.value)}
              onFocus={(e) => { e.currentTarget.style.borderColor = A; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = errs.customerPhone ? ERR : BD; }} />
            <ErrLine msg={errs.customerPhone} />
          </div>

          <div className="lx-form-2" style={{ marginBottom: 14 }}>
            <div>
              <label style={label} htmlFor="lx-wil">{t.wilaya}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={13} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select id="lx-wil" disabled={wilayas.length === 0}
                  style={{ ...inputBase, paddingInlineEnd: 36, ...(errs.customerWelaya ? { borderColor: ERR } : {}) }}
                  value={fd.customerWelaya}
                  onChange={(e) => setFd((s) => ({ ...s, customerWelaya: e.target.value, customerCommune: '' }))}>
                  <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                  {wilayas.map((w) => (
                    <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                  ))}
                </select>
              </div>
              <ErrLine msg={errs.customerWelaya} />
            </div>

            <div>
              <label style={label} htmlFor="lx-com">{t.commune}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={13} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select id="lx-com" disabled={!fd.customerWelaya || loadingC}
                  style={{ ...inputBase, paddingInlineEnd: 36, ...(errs.customerCommune ? { borderColor: ERR } : {}) }}
                  value={fd.customerCommune}
                  onChange={(e) => set('customerCommune', e.target.value)}>
                  <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                  ))}
                </select>
              </div>
              <ErrLine msg={errs.customerCommune} />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <span style={label}>{t.delivery}</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([['home', t.deliveryHome], ['office', t.deliveryOffice]] as const).map(([k, l]) => {
                const active = fd.typeLivraison === k;
                return (
                  <button key={k} type="button" onClick={() => set('typeLivraison', k)}
                    style={{
                      minHeight: 46, padding: '0 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.78rem',
                      background: active ? AL : 'transparent', border: `1px solid ${active ? A : BD}`,
                      color: active ? A : SUB, fontWeight: active ? 600 : 400, transition: 'all .2s',
                    }}>
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 18, paddingTop: 6, borderTop: `1px solid ${BD}` }}>
            <Row l={t.price} v={`${fmt(fp)} ${cur(store)}`} />
            <Row l={t.qty} v={`× ${fd.quantity}`} />
            <Row l={t.delivery} v={selW ? `${fmt(getLiv())} ${cur(store)}` : '—'} />
            <Row l={t.total} v={`${fmt(total())} ${cur(store)}`} strong />
          </div>

          {globalErr && (
            <p style={{ fontSize: '.78rem', color: ERR, marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
              <AlertCircle size={13} /> {globalErr}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <button type="button" className="lx-btnp" style={btnPrimary} onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            <button type="button" className="lx-btng" style={{ ...btnGhost, color: SUB, borderColor: BD }}
              onClick={() => setIsOrderNow(false)} disabled={submitting}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ CART ============================ */
export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const initCount = useCartStore((s: any) => s.initCount);

  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [globalErr, setGlobalErr] = useState('');

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      setItems(Array.isArray(arr) ? arr : []);
    } catch (e) { setItems([]); }
  }, [domain]);

  useEffect(() => { if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas); }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));
  const getLiv = useCallback((): number => {
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison]);

  const cartTotal = items.reduce((s, it) => s + (Number(it.finalPrice) || 0) * (Number(it.quantity) || 1), 0);
  const finalTotal = cartTotal + getLiv();

  const removeItem = (i: number) => {
    const next = items.filter((_, idx) => idx !== i);
    setItems(next);
    try { localStorage.setItem(domain, JSON.stringify(next)); } catch (e) { /* noop */ }
    initCount(next.length);
  };

  const set = (k: string, v: any) => setFd((s) => ({ ...s, [k]: v }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test((fd.customerPhone || '').replace(/\s/g, ''))) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = async () => {
    setGlobalErr('');
    if (!validate() || items.length === 0) return;
    setSubmitting(true);
    try {
      const body = items.map((it) => ({
        ...fd,
        product: it.product,
        productId: it.productId || it.product?.id,
        storeId: it.storeId || store?.id,
        userId: it.userId || store?.user?.id,
        variantDetailId: it.variantDetailId ?? null,
        selectedOffer: it.selectedOffer || null,
        selectedVariants: it.selectedVariants || {},
        platform: it.platform || 'web',
        quantity: Number(it.quantity) || 1,
        priceLoss: 0,
        finalPrice: Number(it.finalPrice) || 0,
        totalPrice: (Number(it.finalPrice) || 0) * (Number(it.quantity) || 1) + getLiv(),
        priceLivraison: getLiv(),
      }));
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error('failed');
      try { localStorage.setItem(domain, '[]'); } catch (e) { /* noop */ }
      initCount(0);
      setItems([]);
      setDone(true);
      setSubmitting(false);
    } catch (e) {
      setGlobalErr(t.errSubmit);
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="lx-wrap" style={{ paddingTop: '90px', paddingBottom: '110px', textAlign: 'center' }}>
        <div style={{ width: 70, height: 70, margin: '0 auto 24px', border: `1px solid ${A}`, display: 'grid', placeItems: 'center', animation: 'lxScale .45s ease both' }}>
          <Check size={30} color={A} strokeWidth={1.5} />
        </div>
        <h1 className="lx-serif" style={{ fontSize: 'clamp(1.7rem,5vw,2.5rem)', fontWeight: 500, margin: '0 0 12px' }}>{t.successTitle}</h1>
        <p style={{ color: SUB, fontSize: '.92rem', marginBottom: 30 }}>{t.successDesc}</p>
        <Link href="/" className="lx-btnp" style={btnPrimary}>{t.backToShop}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="lx-wrap" style={{ paddingTop: '90px', paddingBottom: '110px', textAlign: 'center' }}>
        <ShoppingBag size={46} color={BD} strokeWidth={1.1} />
        <h1 className="lx-serif" style={{ fontSize: 'clamp(1.6rem,5vw,2.3rem)', fontWeight: 500, margin: '18px 0 10px' }}>{t.cartEmpty}</h1>
        <p style={{ color: SUB, fontSize: '.9rem', marginBottom: 28 }}>{t.cartEmptyDesc}</p>
        <Link href="/" className="lx-btnp" style={btnPrimary}>{t.shopNow}</Link>
      </div>
    );
  }

  return (
    <div className="lx-wrap" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <p style={eyebrow}>{items.length} {t.items}</p>
      <h1 className="lx-serif" style={{ fontSize: 'clamp(1.9rem,5.4vw,3rem)', fontWeight: 500, margin: '.3rem 0 32px' }}>{t.myCart}</h1>

      <div className="lx-cartlay">
        <div>
          <div style={{ border: `1px solid ${BD}`, background: CARD }}>
            {items.map((it, i) => {
              const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
              const qty = Number(it.quantity) || 1;
              const line = (Number(it.finalPrice) || 0) * qty;
              return (
                <div key={i} style={{ display: 'flex', gap: 14, padding: 14, borderBottom: i === items.length - 1 ? 'none' : `1px solid ${BD}` }}>
                  <div style={{ width: 88, height: 100, flexShrink: 0, overflow: 'hidden', background: AL }}>
                    {img ? <img src={img} alt={it.product?.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <Placeholder size={22} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <p dir="auto" style={{ fontSize: '.9rem', margin: '0 0 5px', lineHeight: 1.5 }}>{it.product?.name}</p>
                      <p style={{ fontSize: '.74rem', color: SUB, margin: 0 }}>{t.qty}: {qty}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <span dir="ltr" className="lx-serif" style={{ fontSize: '1.1rem', fontWeight: 600, color: A, whiteSpace: 'nowrap' }}>
                        {fmt(line)} {cur(store)}
                      </span>
                      <button type="button" onClick={() => removeItem(i)} aria-label={t.remove}
                        style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', background: 'transparent', border: `1px solid ${BD}`, cursor: 'pointer', color: SUB }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ border: `1px solid ${BD}`, background: CARD, padding: '24px 20px' }}>
            <p style={{ ...eyebrow, marginBottom: 18 }}>{t.confirmOrder}</p>

            <div style={{ marginBottom: 14 }}>
              <label style={label} htmlFor="lxc-name">{t.fullName}</label>
              <input id="lxc-name" style={{ ...inputBase, ...(errs.customerName ? { borderColor: ERR } : {}) }}
                value={fd.customerName} placeholder={t.fullNamePlaceholder}
                onChange={(e) => set('customerName', e.target.value)} />
              <ErrLine msg={errs.customerName} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label} htmlFor="lxc-phone">{t.phone}</label>
              <input id="lxc-phone" type="tel" dir="ltr" inputMode="tel"
                style={{ ...inputBase, ...(errs.customerPhone ? { borderColor: ERR } : {}) }}
                value={fd.customerPhone} placeholder={t.phonePlaceholder}
                onChange={(e) => set('customerPhone', e.target.value)} />
              <ErrLine msg={errs.customerPhone} />
            </div>

            <div className="lx-form-2" style={{ marginBottom: 14 }}>
              <div>
                <label style={label} htmlFor="lxc-wil">{t.wilaya}</label>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <select id="lxc-wil" disabled={wilayas.length === 0}
                    style={{ ...inputBase, paddingInlineEnd: 36, ...(errs.customerWelaya ? { borderColor: ERR } : {}) }}
                    value={fd.customerWelaya}
                    onChange={(e) => setFd((s) => ({ ...s, customerWelaya: e.target.value, customerCommune: '' }))}>
                    <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                    {wilayas.map((w) => (
                      <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                    ))}
                  </select>
                </div>
                <ErrLine msg={errs.customerWelaya} />
              </div>

              <div>
                <label style={label} htmlFor="lxc-com">{t.commune}</label>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={13} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <select id="lxc-com" disabled={!fd.customerWelaya || loadingC}
                    style={{ ...inputBase, paddingInlineEnd: 36, ...(errs.customerCommune ? { borderColor: ERR } : {}) }}
                    value={fd.customerCommune}
                    onChange={(e) => set('customerCommune', e.target.value)}>
                    <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                    {communes.map((c) => (
                      <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                    ))}
                  </select>
                </div>
                <ErrLine msg={errs.customerCommune} />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <span style={label}>{t.delivery}</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {([['home', t.deliveryHome], ['office', t.deliveryOffice]] as const).map(([k, l]) => {
                  const active = fd.typeLivraison === k;
                  return (
                    <button key={k} type="button" onClick={() => set('typeLivraison', k)}
                      style={{
                        minHeight: 46, padding: '0 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.78rem',
                        background: active ? AL : 'transparent', border: `1px solid ${active ? A : BD}`,
                        color: active ? A : SUB, fontWeight: active ? 600 : 400, transition: 'all .2s',
                      }}>
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 18, paddingTop: 6, borderTop: `1px solid ${BD}` }}>
              <Row l={t.subtotal} v={`${fmt(cartTotal)} ${cur(store)}`} />
              <Row l={t.delivery} v={selW ? `${fmt(getLiv())} ${cur(store)}` : '—'} />
              <Row l={t.total} v={`${fmt(finalTotal)} ${cur(store)}`} strong />
            </div>

            {globalErr && (
              <p style={{ fontSize: '.78rem', color: ERR, marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                <AlertCircle size={13} /> {globalErr}
              </p>
            )}

            <button type="button" className="lx-btnp" style={btnPrimary} onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ STATIC PAGES ============================ */
function Shell({ title, eyebrowTxt, children }: any) {
  return (
    <div>
      <div style={{ background: DARK, color: '#FFF8F1', padding: '60px 0 54px', borderBottom: `1px solid ${BD}` }}>
        <div className="lx-wrap">
          <p style={{ ...eyebrow, color: '#D9A97A' }}>{eyebrowTxt}</p>
          <h1 className="lx-serif" style={{ fontSize: 'clamp(1.9rem,5.4vw,3.2rem)', fontWeight: 500, margin: '.4rem 0 0' }}>{title}</h1>
        </div>
      </div>
      <div className="lx-wrap" style={{ paddingTop: '48px', paddingBottom: '80px', maxWidth: 860 }}>{children}</div>
    </div>
  );
}

function InfoBlock({ title, body, i }: any) {
  return (
    <div style={{ padding: '22px 0', borderBottom: `1px solid ${BD}`, display: 'flex', gap: 18, animation: 'lxUp .5s ease both', animationDelay: `${i * 0.06}s` }}>
      <span className="lx-serif" style={{ color: A, fontSize: '1rem', minWidth: 26 }}>{pad2(i + 1)}</span>
      <div>
        <h2 style={{ fontSize: '.95rem', fontWeight: 600, margin: '0 0 8px' }}>{title}</h2>
        <p style={{ fontSize: '.88rem', lineHeight: 1.85, color: SUB, margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}

export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacyTitle} eyebrowTxt={store?.name || 'MAISON'}>
      {t.pPrivacy.map((b: any, i: number) => <InfoBlock key={i} i={i} title={b.t} body={b.b} />)}
    </Shell>
  );
}

export function Terms({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.termsTitle} eyebrowTxt={store?.name || 'MAISON'}>
      {t.pTerms.map((b: any, i: number) => <InfoBlock key={i} i={i} title={b.t} body={b.b} />)}
    </Shell>
  );
}

export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookiesTitle} eyebrowTxt={store?.name || 'MAISON'}>
      {t.pCookies.map((b: any, i: number) => <InfoBlock key={i} i={i} title={b.t} body={b.b} />)}
    </Shell>
  );
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const c = store?.contact || {};

  const send = async () => {
    setErr('');
    if (!form.name || !form.message) { setErr(t.errName); return; }
    setSending(true);
    try {
      const r = await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      if (!r.ok) throw new Error('failed');
      setOk(true);
    } catch (e) { setErr(t.errSubmit); }
    setSending(false);
  };

  return (
    <Shell title={t.contactTitle} eyebrowTxt={store?.name || 'MAISON'}>
      <div className="lx-ct2">
        <div>
          {c.phone && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${BD}` }}>
              <Phone size={17} color={A} strokeWidth={1.5} />
              <span>
                <span style={{ ...label, marginBottom: 2 }}>{t.callUs}</span>
                <a href={`tel:${c.phone}`} dir="ltr" style={{ color: INK, textDecoration: 'none', fontSize: '.9rem' }}>{c.phone}</a>
              </span>
            </div>
          )}
          {c.email && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${BD}` }}>
              <Mail size={17} color={A} strokeWidth={1.5} />
              <span>
                <span style={{ ...label, marginBottom: 2 }}>{t.writeUs}</span>
                <a href={`mailto:${c.email}`} style={{ color: INK, textDecoration: 'none', fontSize: '.9rem' }}>{c.email}</a>
              </span>
            </div>
          )}
          {(c.wilaya || c.address) && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${BD}` }}>
              <MapPin size={17} color={A} strokeWidth={1.5} />
              <span>
                <span style={{ ...label, marginBottom: 2 }}>{t.ourAddress}</span>
                <span style={{ fontSize: '.9rem' }}>{[c.wilaya, c.address].filter(Boolean).join(' — ')}</span>
              </span>
            </div>
          )}
        </div>

        <div style={{ border: `1px solid ${BD}`, background: CARD, padding: '26px 22px' }}>
          {ok ? (
            <div style={{ textAlign: 'center', padding: '26px 0' }}>
              <div style={{ width: 58, height: 58, margin: '0 auto 18px', border: `1px solid ${A}`, display: 'grid', placeItems: 'center' }}>
                <Check size={26} color={A} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: '.95rem', marginBottom: 22 }}>{t.contactSuccess}</p>
              <button type="button" className="lx-btng" style={btnGhost}
                onClick={() => { setOk(false); setForm({ name: '', email: '', phone: '', message: '' }); }}>
                {t.sendAgain}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label style={label} htmlFor="lxk-n">{t.fullName}</label>
                <input id="lxk-n" style={inputBase} value={form.name} placeholder={t.fullNamePlaceholder}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="lx-form-2" style={{ marginBottom: 14 }}>
                <div>
                  <label style={label} htmlFor="lxk-e">{t.email}</label>
                  <input id="lxk-e" type="email" dir="ltr" style={inputBase} value={form.email} placeholder={t.emailPlaceholder}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                </div>
                <div>
                  <label style={label} htmlFor="lxk-p">{t.phone}</label>
                  <input id="lxk-p" type="tel" dir="ltr" style={inputBase} value={form.phone} placeholder={t.phonePlaceholder}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={label} htmlFor="lxk-m">{t.msg}</label>
                <textarea id="lxk-m" rows={5} style={{ ...inputBase, resize: 'none' }} value={form.message} placeholder={t.msgPlaceholder}
                  onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} />
              </div>
              {err && (
                <p style={{ fontSize: '.76rem', color: ERR, marginBottom: 12, display: 'flex', gap: 5, alignItems: 'center' }}>
                  <AlertCircle size={12} /> {err}
                </p>
              )}
              <button type="button" className="lx-btnp" style={btnPrimary} onClick={send} disabled={sending}>
                {sending ? t.sending : <>{t.send} <Send size={14} /></>}
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