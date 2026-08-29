'use client';

/* =============================================================================
   MdStore Theme — Everyday Auto Essentials
   slug: everyday-auto-essentials-theme
   -----------------------------------------------------------------------------
   NAVBAR ARCHETYPE : B — Double Bar
   CARD ARCHETYPE   : 5 — Framed Label
   HERO LAYOUT      : split (text block + media panel, media visible on all sizes)
   TYPOGRAPHY       : Reem Kufi (display) + IBM Plex Sans Arabic (body) + JetBrains Mono (numerals)
   PALETTE          : Ink #12171C / Safety Amber #FF7A00 / cool greys / radius 2px
   CATEGORY ACTIVE  : filled square ink chip + letter-spacing shift
   ============================================================================= */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import axios from 'axios';
import DOMPurify from 'isomorphic-dompurify';
import {
  Search, X, Menu, ShoppingCart, Trash2, Plus, Minus, Phone, Mail, MapPin,
  Truck, ShieldCheck, CreditCard, Headphones, ChevronLeft, ChevronRight,
  ChevronDown, AlertCircle, CheckCircle2, Package, Star, ArrowLeft, ArrowRight,
  Send, Home as HomeIcon, Wrench,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

/* ------------------------------------------------------------------ config */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

const INK = '#12171C';
const A = '#FF7A00';
const AD = '#E56A00';
const AL = '#FFF4E8';
const TXT = '#12171C';
const SUB = '#5E6870';
const BD = '#E3E7EA';
const BG = '#FFFFFF';
const SURF = '#F6F7F8';
const ERR = '#DC2626';

/* ------------------------------------------------------------------- types */

interface Offer { id: string; name: string; subTitle?: string; quantity: number; price: number; shippingFree?: boolean; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | 'text' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

/* ---------------------------------------------------------------- language */

type Lang = 'ar' | 'fr' | 'en';

const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};

const tAr = {
  dir: 'rtl' as const,
  brandTagline: 'أساسيات السيارة — كل يوم',
  home: 'الرئيسية', contact: 'تواصل معنا', cart: 'السلة', menu: 'القائمة', close: 'إغلاق',
  search: 'ابحث عن منتج...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
  showAll: 'عرض كل النتائج →', searchResultsFor: 'نتائج البحث عن:',
  all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تسوق الآن',
  viewDetails: 'عرض التفاصيل',
  heroBadge: 'تجهيزات يومية للطريق',
  heroTitle: 'كل ما تحتاجه سيارتك، في مكان واحد',
  heroSub: 'حاملات هواتف، شواحن، كاميرات سيارة، وحقائب طوارئ — منتقاة بعناية وبأسعار واضحة.',
  catTitle: 'تصفح الأقسام', productsTitle: 'منتجاتنا',
  trust: [
    { t: 'توصيل لكل الولايات', s: 'خلال 24 إلى 72 ساعة' },
    { t: 'منتجات مفحوصة', s: 'جودة مختبرة قبل الشحن' },
    { t: 'الدفع عند الاستلام', s: 'تدفع بعد ما تستلم' },
    { t: 'دعم فني', s: 'نساعدك في اختيار المناسب' },
  ],
  quickLinks: 'روابط سريعة', legalNav: 'قانوني', contactUs: 'معلومات التواصل',
  privacy: 'الخصوصية', terms: 'الشروط', cookies: 'الكوكيز',
  rightsReserved: 'جميع الحقوق محفوظة',
  footerDesc: 'متجر متخصص في أساسيات السيارة اليومية: حاملات، شواحن، كاميرات، وعدة طوارئ.',
  fullName: 'الاسم الكامل', fullNamePlaceholder: 'أدخل اسمك الكامل',
  phone: 'رقم الهاتف', phonePlaceholder: '05xxxxxxxx',
  wilaya: 'الولاية', wilayaPlaceholder: 'اختر الولاية', wilayaUnavailable: 'التوصيل غير متاح حالياً',
  commune: 'البلدية', communePlaceholder: 'اختر البلدية', communeLoading: 'جاري التحميل...',
  deliveryType: 'نوع التوصيل', deliveryHome: 'توصيل للمنزل', deliveryOffice: 'مكتب التوصيل',
  qty: 'الكمية', price: 'السعر', delivery: 'التوصيل', total: 'الإجمالي', subtotal: 'المجموع الفرعي',
  orderSummary: 'ملخص الطلب',
  orderNow: 'اطلب الآن', addToCart: 'أضف إلى السلة', addedMsg: 'تمت الإضافة إلى السلة',
  confirmOrder: 'تأكيد الطلب', sending: 'جاري الإرسال...', cancel: 'إلغاء', remove: 'حذف',
  successTitle: 'تم إرسال طلبك بنجاح!', successDesc: 'سنتواصل معك هاتفياً لتأكيد التفاصيل.',
  backToShop: 'العودة للتسوق',
  orderInfo: 'معلومات الطلب',
  successSteps: [
    { title: 'تم استلام طلبك', desc: 'تم تسجيل طلبك بنجاح في نظامنا' },
    { title: 'تأكيد الطلب', desc: 'سنتصل بك خلال 24 ساعة' },
    { title: 'التجهيز والتغليف', desc: 'يتم تجهيز طلبك بعناية' },
    { title: 'الشحن والتوصيل', desc: '2-5 أيام عمل' },
  ],
  cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تتم إضافة أي منتجات بعد.',
  myCart: 'سلتي', checkoutTitle: 'معلومات التوصيل',
  errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
  errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
  errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
  errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
  offersTitle: 'العروض المتاحة', descTitle: 'وصف المنتج',
  freeShippingBadge: 'توصيل مجاني',
  freeShippingRemaining: 'أضف {{amount}} أخرى للحصول على توصيل مجاني',
  freeShippingReached: 'حصلت على توصيل مجاني!',
  prevImg: 'الصورة السابقة', nextImg: 'الصورة التالية',
  contactTitle: 'تواصل معنا', contactInfoTitle: 'معلومات التواصل', contactFormTitle: 'أرسل رسالة',
  namePh: 'اسمك الكامل', emailPh: 'البريد الإلكتروني', phonePh2: 'رقم الهاتف', messagePh: 'اكتب رسالتك هنا...',
  sendBtn: 'إرسال الرسالة', sentTitle: 'تم إرسال رسالتك', sentDesc: 'سنرد عليك في أقرب وقت ممكن.',
  sendAnother: 'إرسال رسالة أخرى', contactErr: 'تعذر إرسال الرسالة، حاول مجدداً.',
  email: 'البريد الإلكتروني', address: 'العنوان',
  pages: {
    privacy: {
      title: 'سياسة الخصوصية',
      blocks: [
        { title: 'البيانات التي نجمعها', body: 'نجمع فقط المعلومات الضرورية لإتمام طلبك: الاسم الكامل، رقم الهاتف، الولاية والبلدية، ونوع التوصيل.' },
        { title: 'كيف نستعمل بياناتك', body: 'تُستعمل بياناتك حصرياً لتأكيد الطلب هاتفياً وتحضير الشحنة وتسليمها عبر شركة التوصيل.' },
        { title: 'مشاركة البيانات', body: 'لا نبيع بياناتك لأي طرف ثالث. نشارك الاسم والهاتف والعنوان مع شركة التوصيل فقط لغرض التسليم.' },
        { title: 'حقوقك', body: 'يمكنك طلب تعديل أو حذف بياناتك في أي وقت عبر صفحة التواصل.' },
      ],
    },
    terms: {
      title: 'الشروط والأحكام',
      blocks: [
        { title: 'الطلبات', body: 'كل طلب يُؤكَّد عبر مكالمة هاتفية قبل الشحن. الطلب غير المؤكَّد بعد ثلاث محاولات اتصال يُلغى تلقائياً.' },
        { title: 'الأسعار والدفع', body: 'الأسعار المعروضة بعملة المتجر ولا تشمل سعر التوصيل الذي يُحسب حسب الولاية ونوع التوصيل. الدفع يتم عند الاستلام.' },
        { title: 'التوصيل', body: 'مدة التوصيل بين 24 و72 ساعة حسب الولاية. التأخير الناتج عن شركة التوصيل خارج عن سيطرتنا.' },
        { title: 'الإرجاع', body: 'يمكن رفض الطلب عند الاستلام إذا كان المنتج تالفاً أو مخالفاً للوصف.' },
      ],
    },
    cookies: {
      title: 'سياسة الكوكيز',
      blocks: [
        { title: 'ما هي الكوكيز', body: 'ملفات صغيرة تُحفظ في متصفحك لتذكر تفضيلاتك ومحتوى سلتك.' },
        { title: 'كيف نستعملها', body: 'نستعملها للحفاظ على محتوى السلة بين الزيارات ولقياس أداء الصفحات بشكل مجمّع.' },
        { title: 'التحكم فيها', body: 'يمكنك حذف الكوكيز أو تعطيلها من إعدادات متصفحك، مع العلم أن السلة قد لا تعمل بشكل صحيح بعد ذلك.' },
      ],
    },
  },
};

const tFr: typeof tAr = {
  dir: 'ltr' as any,
  brandTagline: 'Essentiels auto — au quotidien',
  home: 'Accueil', contact: 'Contact', cart: 'Panier', menu: 'Menu', close: 'Fermer',
  search: 'Rechercher un produit...', searching: 'Recherche...', noResults: 'Aucun résultat',
  showAll: 'Voir tous les résultats →', searchResultsFor: 'Résultats pour :',
  all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la boutique',
  viewDetails: 'Voir le produit',
  heroBadge: 'Équipement quotidien pour la route',
  heroTitle: 'Tout ce dont votre voiture a besoin, au même endroit',
  heroSub: 'Supports téléphone, chargeurs, dashcams et kits d\'urgence — sélectionnés avec soin, à prix clairs.',
  catTitle: 'Nos catégories', productsTitle: 'Nos produits',
  trust: [
    { t: 'Livraison 58 wilayas', s: 'Sous 24 à 72 heures' },
    { t: 'Produits vérifiés', s: 'Contrôlés avant expédition' },
    { t: 'Paiement à la livraison', s: 'Vous payez à la réception' },
    { t: 'Support technique', s: 'On vous aide à choisir' },
  ],
  quickLinks: 'Navigation', legalNav: 'Légal', contactUs: 'Nous contacter',
  privacy: 'Confidentialité', terms: 'Conditions', cookies: 'Cookies',
  rightsReserved: 'Tous droits réservés.',
  footerDesc: 'Boutique spécialisée dans les essentiels auto du quotidien : supports, chargeurs, dashcams et kits d\'urgence.',
  fullName: 'Nom complet', fullNamePlaceholder: 'Votre nom complet',
  phone: 'Téléphone', phonePlaceholder: '0555 12 34 56',
  wilaya: 'Wilaya', wilayaPlaceholder: 'Choisir la wilaya', wilayaUnavailable: 'Livraison indisponible',
  commune: 'Commune', communePlaceholder: 'Choisir la commune', communeLoading: 'Chargement...',
  deliveryType: 'Mode de livraison', deliveryHome: 'À domicile', deliveryOffice: 'Point relais',
  qty: 'Quantité', price: 'Prix', delivery: 'Livraison', total: 'Total', subtotal: 'Sous-total',
  orderSummary: 'Récapitulatif',
  orderNow: 'Commander', addToCart: 'Ajouter au panier', addedMsg: 'Ajouté au panier',
  confirmOrder: 'Confirmer la commande', sending: 'Envoi en cours...', cancel: 'Annuler', remove: 'Supprimer',
  successTitle: 'Commande confirmée !', successDesc: 'Notre équipe vous appellera pour confirmer les détails.',
  backToShop: 'Retour à la boutique',
  orderInfo: 'Informations de commande',
  successSteps: [
    { title: 'Commande reçue', desc: 'Votre commande a été enregistrée avec succès' },
    { title: 'Confirmation', desc: 'Nous vous appellerons sous 24h' },
    { title: 'Préparation', desc: 'Votre commande est préparée avec soin' },
    { title: 'Livraison', desc: '2-5 jours ouvrables' },
  ],
  cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Aucun produit ajouté pour le moment.',
  myCart: 'Mon panier', checkoutTitle: 'Informations de livraison',
  errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
  errName: 'Nom complet requis (3 caractères minimum)',
  errPhone: 'Numéro de téléphone algérien valide requis (ex : 0550123456)',
  errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
  offersTitle: 'Offres groupées', descTitle: 'Description du produit',
  freeShippingBadge: 'Livraison gratuite',
  freeShippingRemaining: 'Ajoutez {{amount}} pour la livraison gratuite',
  freeShippingReached: 'Livraison gratuite débloquée !',
  prevImg: 'Image précédente', nextImg: 'Image suivante',
  contactTitle: 'Nous contacter', contactInfoTitle: 'Coordonnées', contactFormTitle: 'Envoyer un message',
  namePh: 'Votre nom complet', emailPh: 'Adresse e-mail', phonePh2: 'Téléphone', messagePh: 'Écrivez votre message ici...',
  sendBtn: 'Envoyer le message', sentTitle: 'Message envoyé', sentDesc: 'Nous vous répondrons dans les plus brefs délais.',
  sendAnother: 'Envoyer un autre message', contactErr: 'Envoi impossible, veuillez réessayer.',
  email: 'E-mail', address: 'Adresse',
  pages: {
    privacy: {
      title: 'Politique de confidentialité',
      blocks: [
        { title: 'Données collectées', body: 'Nous collectons uniquement les informations nécessaires à votre commande : nom complet, téléphone, wilaya, commune et mode de livraison.' },
        { title: 'Utilisation des données', body: 'Vos données servent exclusivement à confirmer la commande par téléphone, préparer le colis et le livrer.' },
        { title: 'Partage', body: 'Nous ne vendons aucune donnée. Nom, téléphone et adresse sont transmis au transporteur uniquement pour la livraison.' },
        { title: 'Vos droits', body: 'Vous pouvez demander la modification ou la suppression de vos données via la page contact.' },
      ],
    },
    terms: {
      title: 'Conditions générales',
      blocks: [
        { title: 'Commandes', body: 'Chaque commande est confirmée par téléphone avant expédition. Une commande non confirmée après trois appels est annulée.' },
        { title: 'Prix et paiement', body: 'Les prix affichés n\'incluent pas la livraison, calculée selon la wilaya et le mode choisi. Paiement à la livraison.' },
        { title: 'Livraison', body: 'Délai de 24 à 72 heures selon la wilaya. Les retards du transporteur sont hors de notre contrôle.' },
        { title: 'Retours', body: 'Vous pouvez refuser le colis à la réception si le produit est endommagé ou non conforme.' },
      ],
    },
    cookies: {
      title: 'Politique des cookies',
      blocks: [
        { title: 'Qu\'est-ce qu\'un cookie', body: 'Un petit fichier enregistré par votre navigateur pour mémoriser vos préférences et le contenu du panier.' },
        { title: 'Notre usage', body: 'Nous les utilisons pour conserver le panier entre les visites et mesurer l\'audience de façon agrégée.' },
        { title: 'Gestion', body: 'Vous pouvez les supprimer ou les désactiver dans votre navigateur ; le panier risque alors de ne plus fonctionner.' },
      ],
    },
  },
};

const tEn: typeof tAr = {
  dir: 'ltr' as any,
  brandTagline: 'Everyday auto essentials',
  home: 'Home', contact: 'Contact', cart: 'Cart', menu: 'Menu', close: 'Close',
  search: 'Search products...', searching: 'Searching...', noResults: 'No results found',
  showAll: 'Show all results →', searchResultsFor: 'Results for:',
  all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Shop Now',
  viewDetails: 'View product',
  heroBadge: 'Everyday gear for the road',
  heroTitle: 'Everything your car needs, in one place',
  heroSub: 'Phone mounts, chargers, dash cams and roadside kits — carefully picked, clearly priced.',
  catTitle: 'Browse categories', productsTitle: 'Our products',
  trust: [
    { t: 'Delivery nationwide', s: 'Within 24 to 72 hours' },
    { t: 'Checked products', s: 'Tested before shipping' },
    { t: 'Cash on delivery', s: 'Pay when you receive' },
    { t: 'Technical support', s: 'We help you pick the right fit' },
  ],
  quickLinks: 'Quick Links', legalNav: 'Legal', contactUs: 'Contact Info',
  privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies',
  rightsReserved: 'All rights reserved.',
  footerDesc: 'A shop focused on everyday car essentials: mounts, chargers, dash cams and emergency kits.',
  fullName: 'Full Name', fullNamePlaceholder: 'Enter your full name',
  phone: 'Phone Number', phonePlaceholder: '0555 12 34 56',
  wilaya: 'Wilaya', wilayaPlaceholder: 'Select wilaya', wilayaUnavailable: 'Delivery unavailable',
  commune: 'Commune', communePlaceholder: 'Select commune', communeLoading: 'Loading...',
  deliveryType: 'Delivery method', deliveryHome: 'Home Delivery', deliveryOffice: 'Pickup Point',
  qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total', subtotal: 'Subtotal',
  orderSummary: 'Order summary',
  orderNow: 'Order Now', addToCart: 'Add to Cart', addedMsg: 'Added to cart',
  confirmOrder: 'Confirm Order', sending: 'Sending...', cancel: 'Cancel', remove: 'Remove',
  successTitle: 'Order placed successfully!', successDesc: 'We will call you shortly to confirm the details.',
  backToShop: 'Back to Shop',
  orderInfo: 'Order Info',
  successSteps: [
    { title: 'Order received', desc: 'Your order has been registered successfully' },
    { title: 'Confirmation', desc: "We'll call you within 24 hours" },
    { title: 'Packaging', desc: 'Your order is being prepared with care' },
    { title: 'Shipping', desc: '2-5 business days' },
  ],
  cartEmpty: 'Your cart is empty', cartEmptyDesc: 'No products added yet.',
  myCart: 'My Cart', checkoutTitle: 'Delivery details',
  errSubmit: 'An error occurred. Please try again.',
  errName: 'Full name is required (at least 3 characters)',
  errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
  errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
  offersTitle: 'Available offers', descTitle: 'Product description',
  freeShippingBadge: 'Free Delivery',
  freeShippingRemaining: 'Add {{amount}} more for free delivery',
  freeShippingReached: 'Free delivery unlocked!',
  prevImg: 'Previous image', nextImg: 'Next image',
  contactTitle: 'Contact Us', contactInfoTitle: 'Contact details', contactFormTitle: 'Send a message',
  namePh: 'Your full name', emailPh: 'Email address', phonePh2: 'Phone number', messagePh: 'Write your message here...',
  sendBtn: 'Send message', sentTitle: 'Message sent', sentDesc: 'We will get back to you as soon as possible.',
  sendAnother: 'Send another message', contactErr: 'Could not send the message, please try again.',
  email: 'Email', address: 'Address',
  pages: {
    privacy: {
      title: 'Privacy Policy',
      blocks: [
        { title: 'Data we collect', body: 'We only collect what is needed to fulfil your order: full name, phone number, wilaya, commune and delivery method.' },
        { title: 'How we use it', body: 'Your data is used solely to confirm the order by phone, prepare the parcel and deliver it.' },
        { title: 'Sharing', body: 'We never sell your data. Name, phone and address are shared with the courier for delivery purposes only.' },
        { title: 'Your rights', body: 'You can request correction or deletion of your data at any time through the contact page.' },
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      blocks: [
        { title: 'Orders', body: 'Every order is confirmed by phone before shipping. Orders not confirmed after three call attempts are cancelled.' },
        { title: 'Pricing and payment', body: 'Displayed prices exclude delivery, which is calculated per wilaya and delivery method. Payment is on delivery.' },
        { title: 'Delivery', body: 'Delivery takes 24 to 72 hours depending on the wilaya. Courier delays are outside our control.' },
        { title: 'Returns', body: 'You may refuse the parcel on arrival if the product is damaged or does not match the description.' },
      ],
    },
    cookies: {
      title: 'Cookie Policy',
      blocks: [
        { title: 'What cookies are', body: 'Small files stored by your browser to remember your preferences and cart contents.' },
        { title: 'How we use them', body: 'We use them to keep your cart between visits and to measure page performance in aggregate.' },
        { title: 'Managing them', body: 'You can delete or disable cookies in your browser settings, though the cart may stop working correctly.' },
      ],
    },
  },
};

const T: Record<Lang, typeof tAr> = { ar: tAr, fr: tFr, en: tEn };

/* ----------------------------------------------------------------- helpers */

const fmt = (n: any, currency: string) =>
  `${Number(n || 0).toLocaleString('en-US')} ${currency}`;

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel || {}).every(([n, v]) =>
    d.name?.some((e) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const r = await axios.get(`${API_URL}/shipping/public/get-shipping/${uid}`);
    return Array.isArray(r.data) ? r.data : (r.data?.data || []);
  } catch { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const r = await axios.get(`${API_URL}/shipping/get-communes/${wid}`);
    return Array.isArray(r.data) ? r.data : (r.data?.data || []);
  } catch { return []; }
};

const productImg = (p: any): string | undefined =>
  p?.productImage || p?.imagesProduct?.[0]?.imageUrl || undefined;

const isFreeShipping = (opts: { store?: any; product?: any; offer?: any; amount: number }) => {
  const { store, product, offer, amount } = opts;
  if (offer?.shippingFree) return true;
  if (product?.shippingFree) return true;
  if (store?.supportFreeShipping && store?.freeShippingMinAmount != null) {
    return Number(amount) >= Number(store.freeShippingMinAmount);
  }
  return false;
};

/* --------------------------------------------------------------- base css */

const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

.ae-root, .ae-root button, .ae-root input, .ae-root select, .ae-root textarea {
  font-family: 'IBM Plex Sans Arabic', system-ui, -apple-system, sans-serif;
}
.ae-root { color: ${TXT}; background: ${BG}; -webkit-font-smoothing: antialiased; }
.ae-root h1, .ae-root h2, .ae-root h3, .ae-root .ae-display {
  font-family: 'Reem Kufi', 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; letter-spacing: 0;
}
.ae-num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
.ae-root a { color: inherit; text-decoration: none; }
.ae-root * { box-sizing: border-box; }

.ae-container { max-width: 1280px; margin: 0 auto; padding: 0 1.25rem; width: 100%; }
@media (min-width: 768px) { .ae-container { padding: 0 1.5rem; } }

/* ---------- navbar (archetype B — double bar) ---------- */
.ae-nb-top {
  background: ${INK}; color: #fff;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 10px 0; font-size: 0.78rem;
}
.ae-nb-tagline { opacity: 0.72; letter-spacing: 0.06em; text-transform: uppercase; }
.ae-nb-main {
  position: sticky; top: 0; z-index: 200;
  background: rgba(255,255,255,0.97); backdrop-filter: blur(8px);
  border-bottom: 1px solid ${BD};
  transition: box-shadow 0.25s ease;
}
.ae-nb-main.ae-scrolled { box-shadow: 0 2px 14px rgba(18,23,28,0.09); }
.ae-nb-row { display: flex; align-items: center; gap: 18px; height: 62px; }
.ae-nav-links { display: flex; align-items: center; gap: 22px; }
.ae-nav-link {
  position: relative; font-size: 0.88rem; font-weight: 500; padding: 6px 0; color: ${TXT};
}
.ae-nav-link::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: ${A};
  transform: scaleX(0); transform-origin: center; transition: transform 0.25s ease;
}
.ae-nav-link:hover::after, .ae-nav-link.ae-active::after { transform: scaleX(1); }
.ae-search-desktop { position: relative; flex: 1; max-width: 420px; margin-inline-start: auto; }
.ae-nav-icons { display: flex; align-items: center; gap: 6px; }
.ae-icon-btn {
  width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: none; cursor: pointer; color: ${TXT}; border-radius: 2px;
  transition: background 0.18s ease;
}
.ae-icon-btn:hover { background: ${SURF}; }
.ae-search-mobile-btn, .ae-burger { display: none; }
@media (max-width: 900px) {
  .ae-nav-links, .ae-search-desktop { display: none; }
  .ae-search-mobile-btn, .ae-burger { display: inline-flex; }
  .ae-nb-tagline { display: none; }
  .ae-nav-icons { margin-inline-start: auto; }
}
.ae-search-dropdown {
  position: absolute; top: calc(100% + 8px); inset-inline-end: 0; width: 100%;
  background: #fff; border: 1px solid ${BD}; box-shadow: 0 16px 40px rgba(18,23,28,0.14);
  border-radius: 2px; z-index: 500; max-height: 380px; overflow-y: auto;
  animation: aeFadeIn 0.18s ease both;
}
.ae-mobile-panel {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 300;
  background: #fff; border-bottom: 1px solid ${BD}; box-shadow: 0 14px 30px rgba(18,23,28,0.12);
  animation: aeFadeDown 0.2s ease both;
}
.ae-mobile-link {
  display: flex; align-items: center; gap: 10px; padding: 15px 1.25rem;
  border-bottom: 1px solid ${BD}; font-size: 0.95rem; font-weight: 500; min-height: 52px;
}
.ae-search-overlay {
  position: fixed; inset: 0; z-index: 600; background: rgba(18,23,28,0.55);
  backdrop-filter: blur(3px); display: flex; flex-direction: column;
  animation: aeFadeIn 0.16s ease both;
}
.ae-search-row {
  display: flex; gap: 12px; align-items: center; padding: 12px 16px;
  background: #fff; border-bottom: 1px solid ${BD};
}
.ae-search-res { flex: 1; overflow-y: auto; background: #fff; }
.ae-sr-item {
  display: flex; gap: 12px; align-items: center; padding: 12px 16px;
  border-bottom: 1px solid ${BD};
}
.ae-sr-item:hover { background: ${SURF}; }

/* ---------- hero (full-bleed background image) ---------- */
.ae-hero-badge {
  display: inline-flex; align-items: center; gap: 8px; background: ${AL}; color: ${AD};
  border: 1px solid ${A}; padding: 6px 12px; font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; border-radius: 2px;
  animation: aeScaleIn 0.5s ease 0.05s both;
}
.ae-hero-title { animation: aeFadeUp 0.65s ease 0.12s both; }
.ae-hero-sub   { animation: aeFadeUp 0.65s ease 0.26s both; }
.ae-hero-cta   { animation: aeFadeUp 0.65s ease 0.4s both; }
.ae-btn-ghost-dark { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.35); }
.ae-btn-ghost-dark:hover:not(:disabled) { background: rgba(255,255,255,0.18); border-color: #fff; }

/* ---------- trust ---------- */
.ae-trust-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 0;
  border: 1px solid ${BD}; background: #fff;
}
.ae-trust-cell {
  display: flex; gap: 12px; align-items: flex-start; padding: 1.1rem 1rem;
  border-inline-end: 1px solid ${BD}; border-bottom: 1px solid ${BD};
}
.ae-trust-cell:nth-child(2n) { border-inline-end: none; }
.ae-trust-cell:nth-child(n+3) { border-bottom: none; }
@media (min-width: 900px) {
  .ae-trust-grid { grid-template-columns: repeat(4, 1fr); }
  .ae-trust-cell { border-bottom: none; }
  .ae-trust-cell:nth-child(2n) { border-inline-end: 1px solid ${BD}; }
  .ae-trust-cell:last-child { border-inline-end: none; }
}

/* ---------- categories ---------- */
.ae-cats { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin; }
.ae-cat {
  flex-shrink: 0; padding: 9px 16px; min-height: 42px; display: inline-flex; align-items: center;
  border: 1px solid ${BD}; background: #fff; color: ${SUB}; font-size: 0.84rem; font-weight: 500;
  border-radius: 2px; cursor: pointer; transition: all 0.18s ease; white-space: nowrap;
}
.ae-cat:hover { border-color: ${INK}; color: ${INK}; }
.ae-cat.ae-cat-active {
  background: ${INK}; border-color: ${INK}; color: #fff; font-weight: 700; letter-spacing: 0.06em;
}

/* ---------- product grid + card (archetype 5) ---------- */
.ae-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 640px)  { .ae-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .ae-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .ae-grid { grid-template-columns: repeat(4, 1fr); } }

.ae-card {
  display: flex; flex-direction: column; background: #fff; border: 1px solid ${BD};
  border-radius: 2px; overflow: hidden; height: 100%;
  animation: aeFadeUp 0.5s ease both; will-change: transform;
  transition: transform 0.26s cubic-bezier(.22,.68,0,1.2), box-shadow 0.26s ease, border-color 0.2s ease;
}
.ae-card:hover { transform: translateY(-4px); border-color: ${INK}; box-shadow: 0 16px 32px rgba(18,23,28,0.12); }
.ae-grid > .ae-card:nth-child(1) { animation-delay: 0.04s; }
.ae-grid > .ae-card:nth-child(2) { animation-delay: 0.10s; }
.ae-grid > .ae-card:nth-child(3) { animation-delay: 0.16s; }
.ae-grid > .ae-card:nth-child(4) { animation-delay: 0.22s; }
.ae-grid > .ae-card:nth-child(5) { animation-delay: 0.28s; }
.ae-grid > .ae-card:nth-child(6) { animation-delay: 0.34s; }
.ae-grid > .ae-card:nth-child(7) { animation-delay: 0.40s; }
.ae-grid > .ae-card:nth-child(8) { animation-delay: 0.46s; }
.ae-card-eyebrow {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  background: ${SURF}; border-bottom: 1px solid ${BD}; padding: 6px 10px;
  font-size: 0.63rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${SUB};
}
.ae-card-imgwrap { position: relative; aspect-ratio: 1 / 1; overflow: hidden; background: ${SURF}; }
.ae-card-img { transition: transform 0.5s ease; }
.ae-card:hover .ae-card-img { transform: scale(1.07); }
.ae-card-body { padding: 0.85rem; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.ae-clamp2 {
  display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;
}

/* ---------- layouts ---------- */
.ae-det-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 900px) { .ae-det-grid { grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: start; } }
.ae-cart-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
@media (min-width: 1024px) { .ae-cart-grid { grid-template-columns: 1.25fr 1fr; align-items: start; } }
.ae-form-2 { display: grid; grid-template-columns: 1fr; gap: 0.85rem; }
@media (min-width: 520px) { .ae-form-2 { grid-template-columns: 1fr 1fr; } }
.ae-foot-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 640px) { .ae-foot-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 768px) { .ae-foot-grid { grid-template-columns: 1.3fr 1fr 1fr 1fr; gap: 2.5rem; } }

/* ---------- controls ---------- */
.ae-input, .ae-select, .ae-textarea {
  width: 100%; padding: 0.8rem 0.95rem; font-size: 0.9rem; min-height: 46px;
  border: 1px solid ${BD}; border-radius: 2px; background: #fff; color: ${TXT};
  outline: none; appearance: none; font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.ae-input:focus, .ae-select:focus, .ae-textarea:focus {
  border-color: ${INK}; box-shadow: 0 0 0 3px rgba(255,122,0,0.18);
}
.ae-input.ae-err, .ae-select.ae-err { border-color: ${ERR}; }
.ae-textarea { resize: none; min-height: 130px; }
.ae-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 0.85rem 1.4rem; min-height: 48px; font-size: 0.9rem; font-weight: 700;
  border: 1px solid transparent; border-radius: 2px; cursor: pointer; font-family: inherit;
  transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.15s ease, color 0.2s ease;
}
.ae-btn:active { transform: translateY(0) scale(0.985); }
.ae-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.ae-btn-primary { background: ${INK}; color: #fff; }
.ae-btn-primary:hover:not(:disabled) { background: #000; transform: translateY(-2px); box-shadow: 0 10px 22px rgba(18,23,28,0.25); }
.ae-btn-accent { background: ${A}; color: ${INK}; }
.ae-btn-accent:hover:not(:disabled) { background: ${AD}; color: #fff; transform: translateY(-2px); box-shadow: 0 10px 22px rgba(255,122,0,0.32); }
.ae-btn-ghost { background: transparent; color: ${INK}; border-color: ${BD}; }
.ae-btn-ghost:hover:not(:disabled) { border-color: ${INK}; background: ${SURF}; }
.ae-qty { display: inline-flex; align-items: stretch; border: 1px solid ${BD}; border-radius: 2px; overflow: hidden; }
.ae-qty button {
  width: 42px; min-height: 44px; background: ${SURF}; border: none; cursor: pointer; color: ${INK};
  display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s ease;
}
.ae-qty button:hover:not(:disabled) { background: ${BD}; }
.ae-qty span { min-width: 54px; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }

/* ---------- misc ---------- */
.ae-badge-sale {
  position: absolute; top: 8px; inset-inline-start: 8px; z-index: 2;
  background: ${A}; color: ${INK}; font-size: 0.68rem; font-weight: 800;
  padding: 4px 8px; border-radius: 2px; letter-spacing: 0.04em;
}
.ae-badge-free {
  display: inline-flex; align-items: center; gap: 5px; background: ${AL}; color: ${AD};
  border: 1px solid ${A}; font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 2px;
}
.ae-skeleton {
  background: linear-gradient(90deg, #eceef0 25%, #f6f7f8 50%, #eceef0 75%);
  background-size: 400px 100%; animation: aeShimmer 1.4s infinite linear; border-radius: 2px;
}
.ae-summary-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 9px 0; font-size: 0.88rem;
}
.ae-summary-row > span:first-child { flex-shrink: 0; color: ${SUB}; }
.ae-summary-row > span:last-child { white-space: nowrap; font-weight: 600; }

@keyframes aeFadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
@keyframes aeFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes aeFadeDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes aeScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
@keyframes aeShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes aeBadgePop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 70% { transform: scale(0.92); } 100% { transform: scale(1); } }
.ae-cart-badge { animation: aeBadgePop 0.4s ease; }

@media (prefers-reduced-motion: reduce) {
  .ae-root *, .ae-root *::before, .ae-root *::after {
    animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

function Styles() {
  return <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />;
}

const imgStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };

function Placeholder({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: SURF }}>
      <Package size={size} color={BD} strokeWidth={1.5} />
    </div>
  );
}

/* --------------------------------------------------------------- Main ---- */

export default function Main({ store, children, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="ae-root" dir={t.dir} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Styles />
      <Navbar store={store} domain={domain} />
      <main style={{ flex: 1, opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* -------------------------------------------------------------- Navbar --- */
// NAVBAR ARCHETYPE: B — Double Bar (utility strip + sticky main bar)

export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
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
    if (!domain) return;
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    if (firstCount.current) { firstCount.current = false; return; }
    setBump(true);
    const timer = setTimeout(() => setBump(false), 420);
    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setShowSearch(false); }, [pathname]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setListSearch([]); setLoading(false); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const r = await axios.get(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery.trim())}`);
        const data = r.data?.products || r.data?.data || r.data || [];
        setListSearch(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch { setListSearch([]); } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(timer);
  }, [searchQuery, domain]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearch(false);
    setSearchFocused(false);
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const logo = store?.design?.logoUrl;
  const mobileLinks = [
    { h: '/', l: t.home, icon: HomeIcon },
    { h: '/contact', l: t.contact, icon: Phone },
  ];

  const SearchRow = ({ p, onGo }: any) => {
    const img = productImg(p);
    return (
      <Link href={`/product/${p.slug || p.id}`} className="ae-sr-item" onClick={onGo}>
        <div style={{ width: 48, height: 48, flexShrink: 0, border: `1px solid ${BD}`, overflow: 'hidden' }}>
          {img ? <img src={img} alt={p.name} style={imgStyle} /> : <Placeholder size={20} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
          <p className="ae-num" style={{ margin: '2px 0 0', fontSize: '0.8rem', fontWeight: 700, color: AD }}>{fmt(p.price, currency)}</p>
        </div>
      </Link>
    );
  };

  return (
    <header style={{ position: 'relative' }}>
      <Styles />

      {store?.topBar?.enabled && store?.topBar?.text ? (
        <div style={{ background: A, color: INK, textAlign: 'center', padding: '7px 1rem', fontSize: '0.78rem', fontWeight: 700 }}>
          {store.topBar.text}
        </div>
      ) : null}

      <div style={{ background: INK }}>
        <div className="ae-container">
          <div className="ae-nb-top">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
              {logo && !imgError ? (
                <img src={logo} alt={store?.name || 'logo'} onError={() => setImgError(true)}
                  style={{ height: 30, width: 'auto', objectFit: 'contain', display: 'block' }} />
              ) : (
                <span className="ae-display" style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                  {store?.name || 'AUTO'}
                </span>
              )}
            </Link>
            <span className="ae-nb-tagline">{store?.hero?.subtitle || t.brandTagline}</span>
            {store?.contact?.phone ? (
              <a href={`tel:${store.contact.phone}`} className="ae-num"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 600 }}>
                <Phone size={13} /> {store.contact.phone}
              </a>
            ) : <span />}
          </div>
        </div>
      </div>

      <nav className={`ae-nb-main${scrolled ? ' ae-scrolled' : ''}`}>
        <div className="ae-container">
          <div className="ae-nb-row">
            <div className="ae-nav-links">
              <Link href="/" className={`ae-nav-link${pathname === '/' ? ' ae-active' : ''}`}>{t.home}</Link>
              <Link href="/contact" className={`ae-nav-link${pathname?.includes('/contact') ? ' ae-active' : ''}`}>{t.contact}</Link>
              <Link href="/privacy" className="ae-nav-link">{t.privacy}</Link>
              <Link href="/terms" className="ae-nav-link">{t.terms}</Link>
            </div>

            <div className="ae-search-desktop">
              <form onSubmit={submitSearch} style={{ position: 'relative' }}>
                <Search size={16} color={SUB} style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  className="ae-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder={t.search}
                  aria-label={t.search}
                  style={{ paddingInlineStart: 38, minHeight: 42, background: SURF }}
                />
              </form>
              {searchFocused && searchQuery.trim().length >= 2 ? (
                <div className="ae-search-dropdown">
                  {loading ? (
                    <div style={{ padding: '0.9rem' }}>
                      {[0, 1, 2].map((i) => <div key={i} className="ae-skeleton" style={{ height: 46, marginBottom: 8 }} />)}
                    </div>
                  ) : listSearch.length > 0 ? (
                    <>
                      {listSearch.map((p) => <SearchRow key={p.id} p={p} onGo={() => setSearchFocused(false)} />)}
                      <Link href={`/?search=${encodeURIComponent(searchQuery.trim())}`}
                        style={{ display: 'block', padding: '11px 16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: AD, background: SURF }}>
                        {t.showAll}
                      </Link>
                    </>
                  ) : (
                    <p style={{ padding: '1.4rem', textAlign: 'center', color: SUB, fontSize: '0.85rem', margin: 0 }}>{t.noResults}</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="ae-nav-icons">
              <button className="ae-icon-btn ae-search-mobile-btn" onClick={() => setShowSearch(true)} aria-label={t.search}>
                <Search size={21} />
              </button>

              {store?.cart !== false ? (
                <Link href="/cart" className="ae-icon-btn" aria-label={t.cart} style={{ position: 'relative' }}>
                  <ShoppingCart size={21} />
                  {count > 0 ? (
                    <span className={bump ? 'ae-cart-badge ae-num' : 'ae-num'}
                      style={{
                        position: 'absolute', top: 4, insetInlineEnd: 4, background: A, color: INK,
                        minWidth: 18, height: 18, borderRadius: 999, fontSize: '0.68rem', fontWeight: 800,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                      }}>
                      {count}
                    </span>
                  ) : null}
                </Link>
              ) : null}

              <button className="ae-icon-btn ae-burger" onClick={() => setOpen((v) => !v)} aria-label={t.menu} aria-expanded={open}>
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {open ? (
          <div className="ae-mobile-panel">
            {mobileLinks.map((l) => {
              const Icon = l.icon;
              return (
                <Link key={l.h} href={l.h} className="ae-mobile-link" onClick={() => setOpen(false)}>
                  <Icon size={17} color={SUB} /> {l.l}
                </Link>
              );
            })}
            <Link href="/privacy" className="ae-mobile-link" onClick={() => setOpen(false)}>
              <ShieldCheck size={17} color={SUB} /> {t.privacy}
            </Link>
            <Link href="/terms" className="ae-mobile-link" onClick={() => setOpen(false)}>
              <Wrench size={17} color={SUB} /> {t.terms}
            </Link>
          </div>
        ) : null}
      </nav>

      {showSearch ? (
        <div className="ae-search-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}>
          <form className="ae-search-row" onSubmit={submitSearch}>
            <Search size={20} color={SUB} />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              aria-label={t.search}
              dir={t.dir}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', fontFamily: 'inherit', background: 'transparent', color: TXT }}
            />
            <button type="button" className="ae-icon-btn" onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }} aria-label={t.close}>
              <X size={22} />
            </button>
          </form>
          <div className="ae-search-res">
            {loading ? (
              <div style={{ padding: '1rem' }}>
                {[0, 1, 2, 3].map((i) => <div key={i} className="ae-skeleton" style={{ height: 60, marginBottom: 10 }} />)}
              </div>
            ) : null}
            {!loading && listSearch.map((p) => <SearchRow key={p.id} p={p} onGo={() => setShowSearch(false)} />)}
            {!loading && listSearch.length > 0 ? (
              <Link href={`/?search=${encodeURIComponent(searchQuery.trim())}`} onClick={() => setShowSearch(false)}
                style={{ display: 'block', padding: '15px', textAlign: 'center', background: SURF, fontWeight: 700, color: AD }}>
                {t.showAll}
              </Link>
            ) : null}
            {!loading && searchQuery.trim().length >= 2 && listSearch.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: SUB }}>{t.noResults}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

/* -------------------------------------------------------------- Footer --- */

export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const year = new Date().getFullYear();

  const links = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contact },
  ].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);

  const legalLinks = [
    { h: '/privacy', l: t.privacy },
    { h: '/terms', l: t.terms },
    { h: '/cookies', l: t.cookies },
  ];

  return (
    <footer style={{ background: INK, color: '#fff', marginTop: '3.5rem' }}>
      <Styles />
      <div className="ae-container" style={{ padding: '2.75rem 1.25rem 1.5rem' }}>
        <div className="ae-foot-grid">
          <div>
            <p className="ae-display" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{store?.name || 'AUTO'}</p>
            <div style={{ width: 44, height: 3, background: A, margin: '12px 0 14px' }} />
            <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.66)', maxWidth: 380 }}>
              {store?.hero?.subtitle || t.footerDesc}
            </p>
          </div>

          <div>
            <p style={{ margin: '0 0 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: A }}>
              {t.quickLinks}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((l) => (
                <Link key={l.h} href={l.h} style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.72)' }}>{l.l}</Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ margin: '0 0 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: A }}>
              {t.legalNav}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {legalLinks.map((l) => (
                <Link key={l.h} href={l.h} style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.72)' }}>{l.l}</Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ margin: '0 0 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: A }}>
              {t.contactUs}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.86rem', color: 'rgba(255,255,255,0.72)' }}>
              {store?.contact?.phone ? (
                <a href={`tel:${store.contact.phone}`} className="ae-num" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Phone size={15} color={A} /> {store.contact.phone}
                </a>
              ) : null}
              {store?.contact?.email ? (
                <a href={`mailto:${store.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 9, wordBreak: 'break-all' }}>
                  <Mail size={15} color={A} /> {store.contact.email}
                </a>
              ) : null}
              {(store?.contact?.wilaya || store?.contact?.address) ? (
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: 9, margin: 0, lineHeight: 1.6 }}>
                  <MapPin size={15} color={A} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' — ')}</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: '2rem', paddingTop: '1.2rem', textAlign: 'center' }}>
          <p className="ae-num" style={{ margin: 0, fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)' }}>
            © {year} {store?.name || 'AUTO'} — {t.rightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- Card --- */
// CARD ARCHETYPE: 5 — Framed Label (technical eyebrow + bordered frame)

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || productImg(product);
  const href = `/product/${product?.slug || product?.id}`;
  const original = Number(product?.priceOriginal || 0);
  const price = Number(product?.price || 0);

  return (
    <Link href={href} className="ae-card" aria-label={product?.name}>
      <div className="ae-card-eyebrow">
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product?.category?.name || store?.name || t.viewDetails}
        </span>
        {product?.shippingFree ? <span style={{ color: AD }}>{t.freeShippingBadge}</span> : null}
      </div>

      <div className="ae-card-imgwrap">
        {discount > 0 ? <span className="ae-badge-sale ae-num">-{discount}%</span> : null}
        {img && !imgErr ? (
          <img src={img} alt={product?.name || ''} loading="lazy" className="ae-card-img"
            onError={() => setImgErr(true)} style={imgStyle} />
        ) : (
          <Placeholder size={44} />
        )}
      </div>

      <div className="ae-card-body">
        <p className="ae-clamp2" style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.5, WebkitLineClamp: 2, minHeight: '2.6em' }}>
          {product?.name}
        </p>

        <div style={{ display: 'flex', gap: 2 }} aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={12} fill={i < 4 ? A : 'none'} color={i < 4 ? A : BD} strokeWidth={1.5} />
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span className="ae-num" style={{ fontSize: '1rem', fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{fmt(price, currency)}</span>
            {original > price ? (
              <span className="ae-num" style={{ fontSize: '0.78rem', color: SUB, textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
                {fmt(original, currency)}
              </span>
            ) : null}
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: AD, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {viewDetails || t.viewDetails}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------------------------------------------------------------- Home --- */

export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get('category') || '';
  const searchTerm = searchParams?.get('search') || '';
  const products: any[] = store?.products || [];
  const cats: any[] = store?.categories || [];
  const currentPage = Number(page || searchParams?.get('page') || 1);
  const countPage = Math.ceil((store?.count || products.length || 0) / 48);
  const heroImg = store?.hero?.imageUrl;
  const trustIcons = [Truck, ShieldCheck, CreditCard, Headphones];

  return (
    <div>
      <Styles />

      {/* HERO LAYOUT: full-bleed background image behind text, dark gradient overlay for contrast */}
      <section style={{ position: 'relative', minHeight: 'clamp(480px,70vh,720px)', overflow: 'hidden', background: INK }}>
        {heroImg && (
          <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: heroImg
            ? `linear-gradient(to ${t.dir === 'rtl' ? 'left' : 'right'}, rgba(10,14,18,0.92) 0%, rgba(10,14,18,0.55) 55%, rgba(10,14,18,0.2) 100%)`
            : `linear-gradient(135deg, ${INK} 0%, #23303B 100%)`,
        }} />

        <div className="ae-container" style={{ position: 'relative', zIndex: 1, minHeight: 'clamp(480px,70vh,720px)', display: 'flex', alignItems: 'center', width: '100%', padding: '3rem 1.25rem' }}>
          <div className="ae-hero-text" style={{ maxWidth: 560 }}>
            <span className="ae-hero-badge">
              <Wrench size={13} /> {t.heroBadge}
            </span>
            <h1 className="ae-hero-title"
              dir={t.dir}
              style={{
                fontSize: 'clamp(1.75rem, 5vw, 3.1rem)', lineHeight: 1.25, margin: '1.1rem 0 0',
                color: '#fff', wordBreak: 'break-word',
                textAlign: t.dir === 'rtl' ? 'right' : 'left',
              }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || t.heroTitle) }} />
            <p className="ae-hero-sub"
              dir={t.dir}
              style={{
                fontSize: 'clamp(0.92rem, 2vw, 1.05rem)', lineHeight: 1.75, color: 'rgba(255,255,255,0.78)',
                margin: '1rem 0 0', maxWidth: 480,
                textAlign: t.dir === 'rtl' ? 'right' : 'left',
              }}>
              {store?.hero?.subtitle || t.heroSub}
            </p>
            <div className="ae-hero-cta" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: '1.75rem' }}>
              <a href="#products" className="ae-btn ae-btn-accent">
                {t.shopNow}
                {t.dir === 'rtl' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </a>
              {store?.cart !== false ? (
                <Link href="/cart" className="ae-btn ae-btn-ghost-dark">
                  <ShoppingCart size={16} /> {t.cart}
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute', insetInlineStart: 0, bottom: 0, background: A, color: INK,
          padding: '10px 16px', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {t.brandTagline}
        </div>
      </section>

      <section className="ae-container" style={{ padding: '2rem 1.25rem 0' }}>
        <div className="ae-trust-grid">
          {t.trust.map((item, i) => {
            const Icon = trustIcons[i] || Truck;
            return (
              <div key={i} className="ae-trust-cell">
                <Icon size={22} color={A} strokeWidth={1.7} style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: 700 }}>{item.t}</p>
                  <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: SUB, lineHeight: 1.5 }}>{item.s}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {cats.length > 0 ? (
        <section className="ae-container" style={{ padding: '2.25rem 1.25rem 0' }}>
          <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SUB }}>
            {t.catTitle}
          </p>
          <div className="ae-cats">
            <Link href="/" className={`ae-cat${!activeCategory ? ' ae-cat-active' : ''}`}>{t.all}</Link>
            {cats.map((cat: any) => (
              <Link key={cat.id} href={`?category=${cat.id}`}
                className={`ae-cat${activeCategory === String(cat.id) ? ' ae-cat-active' : ''}`}>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section id="products" className="ae-container" style={{ padding: '2.25rem 1.25rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.15rem, 3vw, 1.55rem)' }}>
            {searchTerm ? `${t.searchResultsFor} ${searchTerm}` : t.productsTitle}
          </h2>
          <div style={{ flex: 1, height: 1, background: BD }} />
          <span className="ae-num" style={{ fontSize: '0.8rem', color: SUB }}>{store?.count ?? products.length}</span>
        </div>

        {products.length === 0 ? (
          <div style={{ border: `1px dashed ${BD}`, padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Package size={40} color={BD} strokeWidth={1.4} />
            <p style={{ margin: '1rem 0 0', color: SUB, fontSize: '0.92rem' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="ae-grid">
            {products.map((p: any) => {
              const original = Number(p.priceOriginal || 0);
              const price = Number(p.price || 0);
              const discount = original > price && original > 0
                ? Math.round(((original - price) / original) * 100) : 0;
              return (
                <Card key={p.id} product={p} displayImage={productImg(p)} discount={discount} store={store} viewDetails={t.viewDetails} />
              );
            })}
          </div>
        )}

        {countPage > 1 ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem' }}>
            {Array.from({ length: countPage }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={{ query: { ...(activeCategory ? { category: activeCategory } : {}), ...(searchTerm ? { search: searchTerm } : {}), page: p } }} scroll={false}
                className="ae-num"
                style={{
                  minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${currentPage === p ? INK : BD}`,
                  background: currentPage === p ? INK : '#fff',
                  color: currentPage === p ? '#fff' : TXT,
                  fontWeight: 700, fontSize: '0.85rem', borderRadius: 2,
                }}>
                {p}
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------- Details --- */

export function Details({
  product, store: storeprop, discount, allImages, allAttrs, finalPrice,
  selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain,
}: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const images: any[] = (allImages && allImages.length ? allImages : product?.imagesProduct) || [];
  const gallery: string[] = images
    .map((im: any) => (typeof im === 'string' ? im : im?.imageUrl))
    .filter(Boolean);
  if (gallery.length === 0 && product?.productImage) gallery.push(product.productImage);

  const [sel, setSel] = useState(0);
  const [imgErr, setImgErr] = useState(false);
  const attrs: Attribute[] = allAttrs || product?.attributes || [];
  const original = Number(product?.priceOriginal || 0);
  const price = Number(finalPrice ?? product?.price ?? 0);

  useEffect(() => { setSel(0); setImgErr(false); }, [product?.id]);

  const go = (dir: number) => {
    if (gallery.length < 2) return;
    setImgErr(false);
    setSel((s) => (s + dir + gallery.length) % gallery.length);
  };

  const navBtn: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 40, height: 40, background: 'rgba(255,255,255,0.94)', border: `1px solid ${BD}`,
    borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: 3, color: INK,
  };

  return (
    <div className="ae-container" style={{ padding: '2rem 1.25rem 0' }}>
      <Styles />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: SUB, marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: SUB }}>{t.home}</Link>
        <span>/</span>
        <span style={{ color: TXT, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product?.name}</span>
      </div>

      <div className="ae-det-grid">
        <div>
          <div style={{ position: 'relative', border: `1px solid ${BD}`, background: SURF, aspectRatio: '1 / 1', overflow: 'hidden' }}>
            {discount > 0 ? <span className="ae-badge-sale ae-num">-{discount}%</span> : null}
            {gallery[sel] && !imgErr ? (
              <img src={gallery[sel]} alt={product?.name || ''} onError={() => setImgErr(true)} style={imgStyle} />
            ) : (
              <Placeholder size={60} />
            )}
            {gallery.length > 1 ? (
              <>
                <button onClick={() => go(-1)} aria-label={t.prevImg} style={{ ...navBtn, insetInlineStart: 10 }}>
                  {t.dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                <button onClick={() => go(1)} aria-label={t.nextImg} style={{ ...navBtn, insetInlineEnd: 10 }}>
                  {t.dir === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              </>
            ) : null}
          </div>

          {gallery.length > 1 ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {gallery.map((g, i) => (
                <button key={i} onClick={() => { setSel(i); setImgErr(false); }} aria-label={`${t.prevImg} ${i + 1}`}
                  style={{
                    width: 66, height: 66, flexShrink: 0, padding: 0, cursor: 'pointer', overflow: 'hidden',
                    border: `2px solid ${i === sel ? INK : BD}`, borderRadius: 2, background: SURF,
                  }}>
                  <img src={g} alt="" style={imgStyle} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.3rem, 3.5vw, 1.9rem)', lineHeight: 1.4 }}>{product?.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 0' }}>
            <div style={{ display: 'flex', gap: 2 }} aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={14} fill={i < 4 ? A : 'none'} color={i < 4 ? A : BD} strokeWidth={1.5} />
              ))}
            </div>
            {product?.shippingFree ? (
              <span className="ae-badge-free"><Truck size={12} /> {t.freeShippingBadge}</span>
            ) : null}
          </div>

          <div style={{ background: SURF, border: `1px solid ${BD}`, padding: '1.1rem', margin: '1.25rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span className="ae-num" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>
                {fmt(price, currency)}
              </span>
              {original > price ? (
                <span className="ae-num" style={{ fontSize: '0.95rem', color: SUB, textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
                  {fmt(original, currency)}
                </span>
              ) : null}
            </div>
          </div>

          {product?.offers?.length ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SUB }}>
                {t.offersTitle}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.offers.map((o: Offer) => {
                  const active = selectedOffer === o.id;
                  return (
                    <button key={o.id} onClick={() => setSelectedOffer(active ? null : o.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                        textAlign: t.dir === 'rtl' ? 'right' : 'left',
                        padding: '0.85rem 1rem', minHeight: 56, cursor: 'pointer', borderRadius: 2,
                        border: `2px solid ${active ? A : BD}`, background: active ? AL : '#fff',
                        fontFamily: 'inherit', transition: 'all 0.18s ease',
                      }}>
                      <span style={{
                        width: 18, height: 18, flexShrink: 0, borderRadius: 999,
                        border: `2px solid ${active ? AD : BD}`, background: active ? AD : '#fff',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {active ? <span style={{ width: 6, height: 6, borderRadius: 999, background: '#fff' }} /> : null}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>{o.name}</span>
                        {o.subTitle ? (
                          <span style={{ display: 'block', fontSize: '0.76rem', color: SUB, marginTop: 2 }}>{o.subTitle}</span>
                        ) : null}
                        {o.shippingFree ? (
                          <span className="ae-badge-free" style={{ marginTop: 6 }}><Truck size={11} /> {t.freeShippingBadge}</span>
                        ) : null}
                      </span>
                      <span className="ae-num" style={{ fontWeight: 800, whiteSpace: 'nowrap', color: INK }}>{fmt(o.price, currency)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {attrs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginBottom: '1.5rem' }}>
              {attrs.map((attr) => (
                <div key={attr.id}>
                  <p style={{ margin: '0 0 9px', fontSize: '0.8rem', fontWeight: 700 }}>{attr.name}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(attr.variants || []).map((v) => {
                      const imgSrc = (v.value || '').startsWith('http')
                        ? v.value
                        : (v.name || '').startsWith('http') ? v.name : null;
                      const isImg = attr.displayMode === 'image' || (attr.displayMode !== 'color' && !!imgSrc);
                      const selKey = isImg && imgSrc ? imgSrc : v.value;
                      const isSelected = selectedVariants?.[attr.name] === selKey;
                      const available = !product?.variantDetails?.length ||
                        product.variantDetails.some((vd: any) =>
                          Object.entries({ ...(selectedVariants || {}), [attr.name]: selKey }).every(
                            ([n, val]) => vd.name?.some((e: any) => e.attrName === n && e.value === val)));

                      if (attr.displayMode === 'color') {
                        const isUrl = /^https?:\/\//.test(v.value || '');
                        return (
                          <button key={v.id} title={v.name}
                            onClick={() => available && handleVariantSelection(attr.name, v.value)}
                            aria-label={v.name}
                            style={{
                              width: 46, height: 46, padding: 3, overflow: 'hidden', flexShrink: 0,
                              border: `2px solid ${isSelected ? INK : BD}`, borderRadius: 2, background: '#fff',
                              cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35,
                              transition: 'all 0.18s ease',
                            }}>
                            {isUrl ? (
                              <img src={v.value} alt={v.name || ''} style={imgStyle} />
                            ) : (
                              <span style={{ width: '100%', height: '100%', background: v.value, display: 'block' }} />
                            )}
                          </button>
                        );
                      }

                      if (isImg && imgSrc) {
                        return (
                          <button key={v.id} title={v.name}
                            onClick={() => available && handleVariantSelection(attr.name, imgSrc)}
                            style={{
                              width: 54, height: 54, padding: 0, overflow: 'hidden', flexShrink: 0,
                              border: `2px solid ${isSelected ? INK : BD}`, borderRadius: 2, background: SURF,
                              cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35,
                            }}>
                            <img src={imgSrc} alt={v.name || ''} style={imgStyle} />
                          </button>
                        );
                      }

                      return (
                        <button key={v.id}
                          onClick={() => available && handleVariantSelection(attr.name, v.value)}
                          style={{
                            minHeight: 44, padding: '0.6rem 1rem', fontSize: '0.83rem', fontWeight: 600,
                            borderRadius: 2, cursor: available ? 'pointer' : 'not-allowed',
                            border: `2px solid ${isSelected ? INK : BD}`,
                            background: isSelected ? INK : '#fff',
                            color: isSelected ? '#fff' : (available ? TXT : '#B9C0C6'),
                            textDecoration: available ? 'none' : 'line-through',
                            fontFamily: 'inherit', transition: 'all 0.18s ease',
                          }}>
                          {v.name || v.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <ProductForm
            product={product}
            store={store}
            userId={store?.user?.id || store?.userId || product?.store?.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
            platform="web"
          />
        </div>
      </div>

      {product?.desc ? (
        <section style={{ margin: '3rem 0 0', borderTop: `1px solid ${BD}`, paddingTop: '2rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.15rem' }}>{t.descTitle}</h2>
          <div dir={t.dir}
            style={{ fontSize: '0.92rem', lineHeight: 1.85, color: '#2B333A', textAlign: t.dir === 'rtl' ? 'right' : 'left' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
        </section>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------- ProductForm --- */

export function ProductForm({
  product, store: storeprop, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform,
}: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const supportQty = store?.supportQty ?? true;
  const uid = userId || store?.user?.id || store?.userId || product?.store?.userId;
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { if (uid) fetchWilayas(uid).then(setWilayas); }, [uid]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const set = (k: string, v: any) => setFd((s) => ({ ...s, [k]: v }));

  const selOffer: Offer | undefined = product?.offers?.find((o: Offer) => o.id === selectedOffer);
  const qty = supportQty ? fd.quantity : 1;

  const getFP = (): number => {
    if (selOffer) return Number(selOffer.price);
    const d = product?.variantDetails?.find((x: VariantDetail) => variantMatches(x, selectedVariants || {}));
    if (d && Number(d.price) !== -1) return Number(d.price);
    return Number(product?.price || 0);
  };
  const fp = getFP();

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const orderFreeShipping = isFreeShipping({ store, product, offer: selOffer, amount: fp * qty });

  const getLiv = useCallback((): number => {
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping]);

  const total = () => Number(fp) * Number(qty) + Number(getLiv());

  const getVarId = () => {
    const d = product?.variantDetails?.find((x: VariantDetail) => variantMatches(x, selectedVariants || {}));
    return d?.id ?? null;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test((fd.customerPhone || '').replace(/\s/g, ''))) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    ...fd,
    quantity: qty,
    product,
    productId: product?.id,
    storeId: store?.id || product?.store?.id,
    userId: uid,
    selectedOffer: selectedOffer || null,
    selectedVariants: selectedVariants || {},
    variantDetailId: getVarId(),
    platform: platform || 'web',
    finalPrice: fp,
    totalPrice: total(),
    priceLivraison: getLiv(),
    addedAt: new Date().toISOString(),
  });

  const addToCart = () => {
    if (!domain) return;
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      const next = Array.isArray(arr) ? arr : [];
      next.push(buildPayload());
      localStorage.setItem(domain, JSON.stringify(next));
      initCount(next.length);
      setToast(t.addedMsg);
    } catch { setToast(t.errSubmit); }
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const r = await axios.post(`${API_URL}/orders/create`, buildPayload());
      const cid = r.data?.customerId || r.data?.data?.customerId;
      if (cid) { try { localStorage.setItem('customerId', cid); } catch { /* ignore */ } }
      router.push(`/successfully?productId=${product?.id}`);
    } catch {
      setErrors((e) => ({ ...e, submit: t.errSubmit }));
    } finally { setSubmitting(false); }
  };

  const livLabel = selW ? (orderFreeShipping ? t.freeShippingBadge : fmt(getLiv(), currency)) : '—';
  const remaining = (store?.supportFreeShipping && store?.freeShippingMinAmount != null && !orderFreeShipping)
    ? Number(store.freeShippingMinAmount) - fp * qty : 0;

  const label = (txt: string) => (
    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: TXT }}>{txt}</label>
  );
  const errLine = (msg?: string) => (msg ? (
    <p style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '6px 0 0', fontSize: '0.74rem', color: ERR }}>
      <AlertCircle size={12} /> {msg}
    </p>
  ) : null);

  return (
    <div style={{ border: `1px solid ${BD}`, borderTop: `3px solid ${INK}`, padding: '1.25rem', background: '#fff' }}>
      <Styles />

      {supportQty ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: '1.1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{t.qty}</span>
          <div className="ae-qty">
            <button type="button" onClick={() => set('quantity', Math.max(1, fd.quantity - 1))} disabled={fd.quantity <= 1} aria-label="-">
              <Minus size={15} />
            </button>
            <span className="ae-num">{fd.quantity}</span>
            <button type="button" onClick={() => set('quantity', fd.quantity + 1)} aria-label="+">
              <Plus size={15} />
            </button>
          </div>
        </div>
      ) : null}

      {orderFreeShipping ? (
        <p className="ae-badge-free" style={{ marginTop: 0, marginBottom: '1rem' }}>
          <Truck size={12} /> {t.freeShippingReached}
        </p>
      ) : remaining > 0 ? (
        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: AD, background: AL, border: `1px solid ${A}`, padding: '8px 10px' }}>
          {t.freeShippingRemaining.replace('{{amount}}', fmt(remaining, currency))}
        </p>
      ) : null}

      {!isOrderNow ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" className="ae-btn ae-btn-accent" style={{ width: '100%' }} onClick={() => setIsOrderNow(true)}>
            {t.orderNow}
          </button>
          {store?.cart !== false ? (
            <button type="button" className="ae-btn ae-btn-ghost" style={{ width: '100%' }} onClick={addToCart}>
              <ShoppingCart size={16} /> {t.addToCart}
            </button>
          ) : null}
        </div>
      ) : (
        <div>
          <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SUB }}>
            {t.checkoutTitle}
          </p>

          <div className="ae-form-2" style={{ marginBottom: '0.85rem' }}>
            <div>
              {label(t.fullName)}
              <input className={`ae-input${errors.customerName ? ' ae-err' : ''}`} value={fd.customerName}
                onChange={(e) => set('customerName', e.target.value)} placeholder={t.fullNamePlaceholder}
                autoComplete="name" dir={t.dir} />
              {errLine(errors.customerName)}
            </div>
            <div>
              {label(t.phone)}
              <input className={`ae-input ae-num${errors.customerPhone ? ' ae-err' : ''}`} value={fd.customerPhone}
                onChange={(e) => set('customerPhone', e.target.value)} placeholder={t.phonePlaceholder}
                type="tel" inputMode="tel" autoComplete="tel" dir="ltr" />
              {errLine(errors.customerPhone)}
            </div>
          </div>

          <div className="ae-form-2" style={{ marginBottom: '0.85rem' }}>
            <div>
              {label(t.wilaya)}
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select className={`ae-select${errors.customerWelaya ? ' ae-err' : ''}`}
                  disabled={wilayas.length === 0}
                  value={fd.customerWelaya}
                  onChange={(e) => { set('customerWelaya', e.target.value); set('customerCommune', ''); }}
                  style={{ paddingInlineEnd: 36 }}>
                  <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                  {wilayas.map((w) => (
                    <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                  ))}
                </select>
              </div>
              {errLine(errors.customerWelaya)}
            </div>
            <div>
              {label(t.commune)}
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select className={`ae-select${errors.customerCommune ? ' ae-err' : ''}`}
                  disabled={!fd.customerWelaya || loadingC}
                  value={fd.customerCommune}
                  onChange={(e) => set('customerCommune', e.target.value)}
                  style={{ paddingInlineEnd: 36 }}>
                  <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                  ))}
                </select>
              </div>
              {errLine(errors.customerCommune)}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            {label(t.deliveryType)}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                { k: 'home', l: t.deliveryHome, p: selW?.livraisonHome },
                { k: 'office', l: t.deliveryOffice, p: selW?.livraisonOfice },
              ] as const).map((opt) => {
                const active = fd.typeLivraison === opt.k;
                return (
                  <button key={opt.k} type="button" onClick={() => set('typeLivraison', opt.k)}
                    style={{
                      minHeight: 52, padding: '0.6rem', cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit',
                      border: `2px solid ${active ? A : BD}`, background: active ? AL : '#fff',
                      color: active ? AD : SUB, fontWeight: 700, fontSize: '0.82rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                      transition: 'all 0.18s ease',
                    }}>
                    <span>{opt.l}</span>
                    {selW ? (
                      <span className="ae-num" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                        {orderFreeShipping ? t.freeShippingBadge : fmt(opt.p, currency)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ background: SURF, border: `1px solid ${BD}`, padding: '0.9rem 1rem', marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: SUB }}>
              {t.orderSummary}
            </p>
            <div className="ae-summary-row">
              <span>{t.price}</span>
              <span className="ae-num">{fmt(fp, currency)}</span>
            </div>
            <div className="ae-summary-row">
              <span>{t.qty}</span>
              <span className="ae-num">× {qty}</span>
            </div>
            <div className="ae-summary-row" style={{ borderBottom: `1px solid ${BD}` }}>
              <span>{t.delivery}</span>
              <span className="ae-num">{livLabel}</span>
            </div>
            <div className="ae-summary-row" style={{ paddingTop: 12 }}>
              <span style={{ color: TXT, fontWeight: 800, fontSize: '0.95rem' }}>{t.total}</span>
              <span className="ae-num" style={{ fontWeight: 800, fontSize: '1.1rem', color: INK }}>{fmt(total(), currency)}</span>
            </div>
          </div>

          {errors.submit ? (
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 0.85rem', fontSize: '0.8rem', color: ERR }}>
              <AlertCircle size={13} /> {errors.submit}
            </p>
          ) : null}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="ae-btn ae-btn-accent" style={{ flex: 1, minWidth: 160 }}
              onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            <button type="button" className="ae-btn ae-btn-ghost" style={{ minWidth: 110 }}
              onClick={() => setIsOrderNow(false)} disabled={submitting}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {toast ? (
        <div style={{
          position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)',
          background: INK, color: '#fff', padding: '11px 18px', borderRadius: 2, zIndex: 700,
          fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          animation: 'aeFadeUp 0.3s ease both',
        }} role="status">
          <CheckCircle2 size={16} color={A} /> {toast}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Cart --- */

export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const initCount = useCartStore((s: any) => s.initCount);

  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => {
    if (!domain) return;
    try {
      const arr = JSON.parse(localStorage.getItem(domain) || '[]');
      setItems(Array.isArray(arr) ? arr : []);
    } catch { setItems([]); }
  }, [domain]);

  useEffect(() => {
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
  }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const set = (k: string, v: any) => setFd((s) => ({ ...s, [k]: v }));

  const removeItem = (i: number) => {
    const next = items.filter((_, idx) => idx !== i);
    setItems(next);
    try { localStorage.setItem(domain, JSON.stringify(next)); } catch { /* ignore */ }
    initCount(next.length);
  };

  const cartTotal = items.reduce(
    (sum, it) => sum + Number(it.finalPrice || it.product?.price || 0) * Number(it.quantity || 1), 0);

  const hasFreeShippingItem = items.some((it) =>
    it.product?.shippingFree ||
    it.product?.offers?.find((o: Offer) => o.id === it.selectedOffer)?.shippingFree);

  const freeShippingReached = hasFreeShippingItem || isFreeShipping({ store, amount: cartTotal });

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getLiv = (): number => {
    if (freeShippingReached) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  };

  const finalTotal = Number(cartTotal) + Number(getLiv());

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test((fd.customerPhone || '').replace(/\s/g, ''))) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = async () => {
    if (!validate() || items.length === 0) return;
    setSubmitting(true);
    try {
      const orders = items.map((it) => ({
        ...it,
        ...fd,
        quantity: Number(it.quantity || 1),
        totalPrice: Number(it.finalPrice || it.product?.price || 0) * Number(it.quantity || 1) + Number(getLiv()),
        priceLivraison: getLiv(),
      }));
      await axios.post(`${API_URL}/orders/create`, orders);
      try { localStorage.setItem(domain, '[]'); } catch { /* ignore */ }
      setItems([]);
      initCount(0);
      setDone(true);
      window.scrollTo(0, 0);
    } catch {
      setErrors((e) => ({ ...e, submit: t.errSubmit }));
    } finally { setSubmitting(false); }
  };

  const label = (txt: string) => (
    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: TXT }}>{txt}</label>
  );
  const errLine = (msg?: string) => (msg ? (
    <p style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '6px 0 0', fontSize: '0.74rem', color: ERR }}>
      <AlertCircle size={12} /> {msg}
    </p>
  ) : null);

  if (done) {
    return (
      <div className="ae-container" style={{ padding: '4rem 1.25rem' }}>
        <Styles />
        <div style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center', border: `1px solid ${BD}`, borderTop: `3px solid ${A}`, padding: '2.5rem 1.5rem' }}>
          <CheckCircle2 size={54} color={A} strokeWidth={1.5} />
          <h1 style={{ margin: '1.1rem 0 0.6rem', fontSize: '1.35rem' }}>{t.successTitle}</h1>
          <p style={{ margin: 0, color: SUB, fontSize: '0.9rem', lineHeight: 1.7 }}>{t.successDesc}</p>
          <Link href="/" className="ae-btn ae-btn-primary" style={{ marginTop: '1.6rem' }}>{t.backToShop}</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="ae-container" style={{ padding: '4rem 1.25rem' }}>
        <Styles />
        <div style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center', border: `1px dashed ${BD}`, padding: '2.75rem 1.5rem' }}>
          <ShoppingCart size={50} color={BD} strokeWidth={1.4} />
          <h1 style={{ margin: '1.1rem 0 0.5rem', fontSize: '1.25rem' }}>{t.cartEmpty}</h1>
          <p style={{ margin: 0, color: SUB, fontSize: '0.9rem' }}>{t.cartEmptyDesc}</p>
          <Link href="/" className="ae-btn ae-btn-accent" style={{ marginTop: '1.6rem' }}>{t.shopNow}</Link>
        </div>
      </div>
    );
  }

  const remaining = (store?.supportFreeShipping && store?.freeShippingMinAmount != null && !freeShippingReached)
    ? Number(store.freeShippingMinAmount) - cartTotal : 0;

  return (
    <div className="ae-container" style={{ padding: '2rem 1.25rem 0' }}>
      <Styles />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.25rem, 3.5vw, 1.7rem)' }}>{t.myCart}</h1>
        <div style={{ flex: 1, height: 1, background: BD }} />
        <span className="ae-num" style={{ fontSize: '0.85rem', color: SUB }}>{items.length}</span>
      </div>

      <div className="ae-cart-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, i) => {
            const img = productImg(it.product);
            const line = Number(it.finalPrice || it.product?.price || 0) * Number(it.quantity || 1);
            return (
              <div key={i} style={{ display: 'flex', gap: 12, border: `1px solid ${BD}`, padding: '0.85rem', background: '#fff', alignItems: 'center' }}>
                <div style={{ width: 74, height: 74, flexShrink: 0, border: `1px solid ${BD}`, overflow: 'hidden' }}>
                  {img ? <img src={img} alt={it.product?.name || ''} style={imgStyle} /> : <Placeholder size={24} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="ae-clamp2" style={{ margin: 0, fontSize: '0.87rem', fontWeight: 600, lineHeight: 1.5, WebkitLineClamp: 2 }}>
                    {it.product?.name}
                  </p>
                  <p className="ae-num" style={{ margin: '6px 0 0', fontSize: '0.8rem', color: SUB }}>
                    × {it.quantity || 1}
                  </p>
                  {it.product?.shippingFree ? (
                    <span className="ae-badge-free" style={{ marginTop: 6 }}><Truck size={11} /> {t.freeShippingBadge}</span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className="ae-num" style={{ fontWeight: 800, whiteSpace: 'nowrap', fontSize: '0.92rem' }}>{fmt(line, currency)}</span>
                  <button type="button" onClick={() => removeItem(i)} aria-label={t.remove}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: ERR, padding: 6 }}>
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })}

          {freeShippingReached ? (
            <p className="ae-badge-free" style={{ alignSelf: 'flex-start' }}>
              <Truck size={12} /> {t.freeShippingReached}
            </p>
          ) : remaining > 0 ? (
            <p style={{ margin: 0, fontSize: '0.8rem', color: AD, background: AL, border: `1px solid ${A}`, padding: '9px 11px' }}>
              {t.freeShippingRemaining.replace('{{amount}}', fmt(remaining, currency))}
            </p>
          ) : null}
        </div>

        <div style={{ border: `1px solid ${BD}`, borderTop: `3px solid ${INK}`, padding: '1.25rem', background: '#fff' }}>
          <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SUB }}>
            {t.checkoutTitle}
          </p>

          <div style={{ marginBottom: '0.85rem' }}>
            {label(t.fullName)}
            <input className={`ae-input${errors.customerName ? ' ae-err' : ''}`} value={fd.customerName}
              onChange={(e) => set('customerName', e.target.value)} placeholder={t.fullNamePlaceholder}
              autoComplete="name" dir={t.dir} />
            {errLine(errors.customerName)}
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            {label(t.phone)}
            <input className={`ae-input ae-num${errors.customerPhone ? ' ae-err' : ''}`} value={fd.customerPhone}
              onChange={(e) => set('customerPhone', e.target.value)} placeholder={t.phonePlaceholder}
              type="tel" inputMode="tel" autoComplete="tel" dir="ltr" />
            {errLine(errors.customerPhone)}
          </div>

          <div className="ae-form-2" style={{ marginBottom: '0.85rem' }}>
            <div>
              {label(t.wilaya)}
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select className={`ae-select${errors.customerWelaya ? ' ae-err' : ''}`}
                  disabled={wilayas.length === 0} value={fd.customerWelaya}
                  onChange={(e) => { set('customerWelaya', e.target.value); set('customerCommune', ''); }}
                  style={{ paddingInlineEnd: 36 }}>
                  <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                  {wilayas.map((w) => (
                    <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                  ))}
                </select>
              </div>
              {errLine(errors.customerWelaya)}
            </div>
            <div>
              {label(t.commune)}
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select className={`ae-select${errors.customerCommune ? ' ae-err' : ''}`}
                  disabled={!fd.customerWelaya || loadingC} value={fd.customerCommune}
                  onChange={(e) => set('customerCommune', e.target.value)}
                  style={{ paddingInlineEnd: 36 }}>
                  <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                  ))}
                </select>
              </div>
              {errLine(errors.customerCommune)}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            {label(t.deliveryType)}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                { k: 'home', l: t.deliveryHome, p: selW?.livraisonHome },
                { k: 'office', l: t.deliveryOffice, p: selW?.livraisonOfice },
              ] as const).map((opt) => {
                const active = fd.typeLivraison === opt.k;
                return (
                  <button key={opt.k} type="button" onClick={() => set('typeLivraison', opt.k)}
                    style={{
                      minHeight: 52, padding: '0.6rem', cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit',
                      border: `2px solid ${active ? A : BD}`, background: active ? AL : '#fff',
                      color: active ? AD : SUB, fontWeight: 700, fontSize: '0.82rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                    }}>
                    <span>{opt.l}</span>
                    {selW ? (
                      <span className="ae-num" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                        {freeShippingReached ? t.freeShippingBadge : fmt(opt.p, currency)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ background: SURF, border: `1px solid ${BD}`, padding: '0.9rem 1rem', marginBottom: '1rem' }}>
            <div className="ae-summary-row">
              <span>{t.subtotal}</span>
              <span className="ae-num">{fmt(cartTotal, currency)}</span>
            </div>
            <div className="ae-summary-row" style={{ borderBottom: `1px solid ${BD}` }}>
              <span>{t.delivery}</span>
              <span className="ae-num">{selW ? (freeShippingReached ? t.freeShippingBadge : fmt(getLiv(), currency)) : '—'}</span>
            </div>
            <div className="ae-summary-row" style={{ paddingTop: 12 }}>
              <span style={{ color: TXT, fontWeight: 800, fontSize: '0.95rem' }}>{t.total}</span>
              <span className="ae-num" style={{ fontWeight: 800, fontSize: '1.1rem', color: INK }}>{fmt(finalTotal, currency)}</span>
            </div>
          </div>

          {errors.submit ? (
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 0.85rem', fontSize: '0.8rem', color: ERR }}>
              <AlertCircle size={13} /> {errors.submit}
            </p>
          ) : null}

          <button type="button" className="ae-btn ae-btn-accent" style={{ width: '100%' }}
            onClick={submitOrder} disabled={submitting}>
            {submitting ? t.sending : t.confirmOrder}
          </button>
          <Link href="/" className="ae-btn ae-btn-ghost" style={{ width: '100%', marginTop: 10 }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Success -- */

export function Success({ store, order }: { store: any; domain?: string; order?: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const stepIcons = [CheckCircle2, Phone, Package, Truck];

  return (
    <div className="ae-root" dir={t.dir} style={{ minHeight: '100vh', background: BG, padding: '3rem 1.25rem' }}>
      <Styles />
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '3rem 2rem', border: `1px solid ${BD}`, borderTop: `3px solid ${A}`, marginBottom: '1.5rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle2 size={30} color={AD} />
          </div>
          <h1 style={{ fontSize: '1.4rem', margin: '0 0 8px', color: TXT }}>{t.successTitle}</h1>
          <p style={{ margin: 0, color: SUB, fontSize: '0.9rem' }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) ? (
          <div style={{ background: '#fff', border: `1px solid ${BD}`, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SUB }}>{t.orderInfo}</p>
            {order.productName ? (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${BD}`, fontSize: '0.9rem', fontWeight: 700, color: TXT }}>{order.productName}</div>
            ) : null}
            {order.total != null ? (
              <div className="ae-summary-row" style={{ padding: 0 }}>
                <span>{t.total}</span>
                <span className="ae-num" style={{ fontSize: '1.05rem', fontWeight: 800, color: INK }}>{fmt(order.total, currency)}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ background: '#fff', border: `1px solid ${BD}`, marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? CheckCircle2;
            const done = i === 0;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem',
                borderBottom: i < t.successSteps.length - 1 ? `1px solid ${BD}` : 'none',
                background: done ? AL : 'transparent',
              }}>
                <div style={{
                  width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', background: done ? A : SURF, color: done ? INK : SUB,
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: done ? TXT : SUB }}>{step.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: SUB }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/" className="ae-btn ae-btn-accent" style={{ width: '100%' }}>{t.shopNow}</Link>
          <Link href="/" className="ae-btn ae-btn-ghost" style={{ width: '100%' }}>{t.backToShop}</Link>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- static pages --- */

function Shell({ title, dir, children }: any) {
  return (
    <div>
      <Styles />
      <div style={{ background: INK, color: '#fff' }}>
        <div className="ae-container" style={{ padding: '2.75rem 1.25rem' }}>
          <h1 dir={dir} style={{ margin: 0, fontSize: 'clamp(1.4rem, 4vw, 2.1rem)', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
            {title}
          </h1>
          <div style={{ width: 48, height: 3, background: A, marginTop: 14, marginInlineEnd: 'auto' }} />
        </div>
      </div>
      <div className="ae-container" style={{ padding: '2.25rem 1.25rem 0', maxWidth: 880 }}>
        {children}
      </div>
    </div>
  );
}

function InfoBlock({ title, body, dir }: any) {
  return (
    <div style={{ borderInlineStart: `3px solid ${A}`, paddingInlineStart: '1.1rem', marginBottom: '1.75rem' }}>
      <h2 dir={dir} style={{ margin: '0 0 8px', fontSize: '1rem', textAlign: dir === 'rtl' ? 'right' : 'left' }}>{title}</h2>
      <p dir={dir} style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.85, color: '#3A434B', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
        {body}
      </p>
    </div>
  );
}

export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  const pg = t.pages.privacy;
  return (
    <Shell title={pg.title} dir={t.dir}>
      {pg.blocks.map((b, i) => <InfoBlock key={i} title={b.title} body={b.body} dir={t.dir} />)}
    </Shell>
  );
}

export function Terms({ store }: any) {
  const t = T[getLang(store)];
  const pg = t.pages.terms;
  return (
    <Shell title={pg.title} dir={t.dir}>
      {pg.blocks.map((b, i) => <InfoBlock key={i} title={b.title} body={b.body} dir={t.dir} />)}
    </Shell>
  );
}

export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  const pg = t.pages.cookies;
  return (
    <Shell title={pg.title} dir={t.dir}>
      {pg.blocks.map((b, i) => <InfoBlock key={i} title={b.title} body={b.body} dir={t.dir} />)}
    </Shell>
  );
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const send = async () => {
    if (!form.name.trim() || !form.message.trim()) { setErr(t.contactErr); return; }
    setSending(true); setErr('');
    try {
      await axios.post(`${API_URL}/user/contact-user/message`, { ...form, storeId: store?.id });
      setSent(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch { setErr(t.contactErr); } finally { setSending(false); }
  };

  return (
    <Shell title={t.contactTitle} dir={t.dir}>
      <div className="ae-det-grid" style={{ paddingBottom: '1rem' }}>
        <div>
          <p style={{ margin: '0 0 1.1rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SUB }}>
            {t.contactInfoTitle}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {store?.contact?.phone ? (
              <a href={`tel:${store.contact.phone}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${BD}`, padding: '0.95rem 1rem', background: '#fff' }}>
                <Phone size={17} color={A} />
                <span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: SUB }}>{t.phone}</span>
                  <span className="ae-num" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{store.contact.phone}</span>
                </span>
              </a>
            ) : null}
            {store?.contact?.email ? (
              <a href={`mailto:${store.contact.email}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${BD}`, padding: '0.95rem 1rem', background: '#fff' }}>
                <Mail size={17} color={A} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: SUB }}>{t.email}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', wordBreak: 'break-all' }}>{store.contact.email}</span>
                </span>
              </a>
            ) : null}
            {(store?.contact?.wilaya || store?.contact?.address) ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, border: `1px solid ${BD}`, padding: '0.95rem 1rem', background: '#fff' }}>
                <MapPin size={17} color={A} style={{ flexShrink: 0, marginTop: 3 }} />
                <span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: SUB }}>{t.address}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' — ')}
                  </span>
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ border: `1px solid ${BD}`, borderTop: `3px solid ${INK}`, padding: '1.25rem', background: '#fff' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle2 size={46} color={A} strokeWidth={1.5} />
              <h2 style={{ margin: '1rem 0 0.5rem', fontSize: '1.1rem' }}>{t.sentTitle}</h2>
              <p style={{ margin: 0, color: SUB, fontSize: '0.88rem' }}>{t.sentDesc}</p>
              <button type="button" className="ae-btn ae-btn-ghost" style={{ marginTop: '1.4rem' }} onClick={() => setSent(false)}>
                {t.sendAnother}
              </button>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SUB }}>
                {t.contactFormTitle}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>{t.fullName}</label>
                  <input className="ae-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t.namePh} dir={t.dir} />
                </div>
                <div className="ae-form-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>{t.email}</label>
                    <input className="ae-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder={t.emailPh} dir="ltr" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>{t.phone}</label>
                    <input className="ae-input ae-num" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder={t.phonePh2} dir="ltr" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>{t.contactFormTitle}</label>
                  <textarea className="ae-textarea" rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder={t.messagePh} dir={t.dir} />
                </div>
                {err ? (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, fontSize: '0.78rem', color: ERR }}>
                    <AlertCircle size={13} /> {err}
                  </p>
                ) : null}
                <button type="button" className="ae-btn ae-btn-accent" style={{ width: '100%' }} onClick={send} disabled={sending}>
                  {sending ? t.sending : t.sendBtn} <Send size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
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