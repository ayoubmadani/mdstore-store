'use client';

/* ============================================================================
 *  MdStore Storefront Theme — Urban Vision & Time
 *  slug: urban-vision-time-theme
 *  niche: optical frames · smartwatches · everyday accessories
 *
 *  NAVBAR ARCHETYPE : D — Full-width Logo Strip (wordmark strip + instrument bar)
 *  CARD ARCHETYPE   : 5 — Framed Label (eyebrow + framed border + spec footer)
 *  HERO LAYOUT      : split (text column + focus panel, stacked on mobile)
 *  TYPOGRAPHY       : Reem Kufi (display) + Tajawal (body) + JetBrains Mono (numerals)
 *  SIGNATURE        : bezel tick rail (dividers + active category) & focus reveal
 *                     (images desaturated -> sharpen on hover)
 * ==========================================================================*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { useCartStore } from '@/store/useCartStore';
import {
  Search, X, Menu, ShoppingBag, Phone, Mail, MessageCircle, MapPin, ChevronDown,
  ChevronLeft, ChevronRight, Trash2, AlertCircle, CheckCircle2,
  Glasses, Watch, Truck, ShieldCheck, CreditCard, Headphones,
  Star, Plus, Minus, ArrowRight, Send, Download,
} from 'lucide-react';

/* ---------------------------------------------------------------- tokens */

const A    = '#B06A2C';                     /* tortoiseshell acetate amber   */
const AD   = '#8C5220';                     /* amber, pressed                */
const AL   = 'rgba(176,106,44,0.10)';       /* amber wash                    */
const INK  = '#14161A';                     /* obsidian frame                */
const DIAL = '#1B2A3A';                     /* midnight dial navy            */
const SUB  = '#6B6F76';                     /* brushed titanium              */
const BG   = '#F7F7F5';                     /* showroom chalk                */
const CARD = '#FFFFFF';
const BD   = '#E3E1DC';                     /* warm hairline                 */
const ERR  = '#C0392B';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ----------------------------------------------------------------- types */

interface Offer { id: string; name: string; quantity: number; price: number; subTitle?: string; shippingFree?: boolean; }
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
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; shippingFree?: boolean; isDigital?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
}

/* ------------------------------------------------------------- languages */

type Lang = 'ar' | 'fr' | 'en';

const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};

const T = {
  ar: {
    dir: 'rtl' as const,
    home: 'الرئيسية', contact: 'تواصل معنا', cart: 'السلة', menu: 'القائمة', close: 'إغلاق',
    search: 'ابحث عن إطار أو ساعة...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
    showAll: 'عرض كل النتائج',
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تصفّح المجموعة',
    collectionLabel: 'المجموعة', viewProduct: 'عرض',
    heroEyebrow: 'رؤية أوضح · وقت أدق',
    heroTitleFallback: 'إطارات وساعات<br/>مصنوعة للتفاصيل',
    heroSubFallback: 'نظارات بصرية وساعات ذكية وإكسسوارات يومية — مختارة بعناية، مضبوطة على ذوقك.',
    trust: [
      { t: 'توصيل سريع',   s: 'إلى 58 ولاية' },
      { t: 'أصلي 100%',    s: 'مصدر موثوق ومضمون' },
      { t: 'دفع عند الاستلام', s: 'ادفع بعد المعاينة' },
      { t: 'دعم 24/7',     s: 'فريق متخصص للمساعدة' },
    ],
    quickLinks: 'روابط سريعة', legalNav: 'قانوني', contactUs: 'تواصل معنا',
    privacy: 'الخصوصية', terms: 'الشروط', cookies: 'الكوكيز',
    rightsReserved: 'جميع الحقوق محفوظة',
    prev: 'السابق', next: 'التالي',
    fullName: 'الاسم الكامل', fullNamePlaceholder: 'أدخل اسمك الكامل',
    phone: 'رقم الهاتف', phonePlaceholder: '05xxxxxxxx',
    wilaya: 'الولاية', wilayaPlaceholder: 'اختر الولاية', wilayaUnavailable: 'التوصيل غير متاح حالياً',
    commune: 'البلدية', communePlaceholder: 'اختر البلدية', communeLoading: 'جاري التحميل...',
    deliveryType: 'طريقة التوصيل', deliveryHome: 'توصيل للمنزل', deliveryOffice: 'مكتب التوصيل',
    qty: 'الكمية', price: 'السعر', delivery: 'التوصيل', total: 'الإجمالي',
    orderSummary: 'ملخص الطلب',
    orderNow: 'اطلب الآن', addToCart: 'أضف إلى السلة',
    confirmOrder: 'تأكيد الطلب', sending: 'جاري الإرسال...', cancel: 'إلغاء',
    successTitle: 'تم إرسال طلبك بنجاح!', successDesc: 'سنتواصل معك قريباً لتأكيد التفاصيل.',
    backToShop: 'العودة للتسوق',
    successSteps: [
      { title: 'تم استلام طلبك', desc: 'تم تسجيل طلبك بنجاح في نظامنا' },
      { title: 'تأكيد الطلب', desc: 'سنتصل بك خلال 24 ساعة' },
      { title: 'التحضير والتغليف', desc: 'يُحضَّر طلبك بعناية فائقة' },
      { title: 'الشحن والتوصيل', desc: '2 إلى 5 أيام عمل' },
    ],
    cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تتم إضافة أي منتجات بعد.',
    myCart: 'سلتي', subtotal: 'المجموع الفرعي', remove: 'حذف', items: 'عنصر',
    errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
    errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
    orderEmail: 'البريد الإلكتروني', emailPh: 'example@email.com', errEmail: 'يرجى إدخال بريد إلكتروني صحيح',
    whatsapp: 'رقم واتساب', whatsappPh: '0550123456', errWhatsapp: 'رقم واتساب جزائري صحيح مطلوب (مثال: 0550123456)',
    contactQuestion: 'هل تملك بريداً إلكترونياً أم واتساب؟', contactViaEmail: 'البريد الإلكتروني', contactViaWhatsapp: 'واتساب',
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'الوصف',
    freeShippingBadge: 'توصيل مجاني',
    freeShippingThreshold: 'توصيل مجاني عند الشراء بأكثر من {{amount}}',
    freeShippingRemaining: 'أضف {{amount}} لتحصل على توصيل مجاني',
    freeShippingReached: 'مبروك! لديك توصيل مجاني 🎉',
    searchResultsFor: 'نتائج البحث عن:',
    contactInfo: 'معلومات التواصل', yourName: 'الاسم', yourEmail: 'البريد الإلكتروني',
    yourMessage: 'رسالتك', messagePlaceholder: 'كيف يمكننا مساعدتك؟',
    sendMessage: 'إرسال الرسالة', sentTitle: 'تم استلام رسالتك', sentDesc: 'سنرد عليك في أقرب وقت ممكن.',
    sendAnother: 'إرسال رسالة أخرى',
    privacyBlocks: [
      { title: 'البيانات التي نجمعها', body: 'نجمع الاسم، رقم الهاتف، الولاية والبلدية فقط — وهي البيانات اللازمة لتحضير طلبك وتسليمه.' },
      { title: 'كيف نستخدمها', body: 'تُستخدم بياناتك لتأكيد الطلب، تنسيق التوصيل، والتواصل معك عند الحاجة. لا نبيعها ولا نشاركها مع أي طرف ثالث خارج شركة التوصيل.' },
      { title: 'الحماية', body: 'تُحفظ الطلبات على خوادم محمية ولا يطّلع عليها إلا الفريق المسؤول عن معالجة الطلبات.' },
      { title: 'حقوقك', body: 'يمكنك طلب تعديل أو حذف بياناتك في أي وقت عبر صفحة التواصل.' },
    ],
    termsBlocks: [
      { title: 'الطلبات', body: 'يُعتبر الطلب مؤكداً بعد اتصال فريقنا بك هاتفياً. الأسعار المعروضة تشمل سعر المنتج ولا تشمل التوصيل إلا إذا ذُكر خلاف ذلك.' },
      { title: 'التوصيل', body: 'يُحتسب سعر التوصيل حسب الولاية وطريقة التسليم (منزل أو مكتب). مدة التوصيل تتراوح عادة بين 2 و 5 أيام عمل.' },
      { title: 'الاستبدال والإرجاع', body: 'يحق لك معاينة المنتج عند الاستلام. في حال وجود عيب مصنعي، يمكن الاستبدال خلال 7 أيام مع الاحتفاظ بالتغليف الأصلي.' },
      { title: 'المسؤولية', body: 'لا نتحمل مسؤولية الاستعمال غير الصحيح للمنتج أو الضرر الناتج عن الإهمال.' },
    ],
    cookiesBlocks: [
      { title: 'ما هي الكوكيز', body: 'ملفات صغيرة تُحفظ في متصفحك لتذكّر سلة مشترياتك وتفضيلاتك أثناء التصفح.' },
      { title: 'الاستعمال', body: 'نستعملها لحفظ محتوى السلة، تذكّر معلوماتك في نموذج الطلب، وقياس أداء الموقع.' },
      { title: 'التحكم', body: 'يمكنك حذف الكوكيز من إعدادات المتصفح، لكن قد تفقد محتوى سلتك عند القيام بذلك.' },
    ],
  },

  fr: {
    dir: 'ltr' as const,
    home: 'Accueil', contact: 'Contact', cart: 'Panier', menu: 'Menu', close: 'Fermer',
    search: 'Rechercher une monture, une montre...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir la collection',
    collectionLabel: 'Collection', viewProduct: 'Voir',
    heroEyebrow: 'Vision nette · Temps précis',
    heroTitleFallback: 'Montures & montres<br/>faites pour le détail',
    heroSubFallback: 'Lunettes optiques, montres connectées et accessoires du quotidien — sélectionnés avec soin.',
    trust: [
      { t: 'Livraison rapide',  s: 'Vers les 58 wilayas' },
      { t: '100% authentique',  s: 'Sourcing garanti' },
      { t: 'Paiement à la livraison', s: 'Payez après vérification' },
      { t: 'Support 24/7',      s: 'Une équipe dédiée' },
    ],
    quickLinks: 'Navigation', legalNav: 'Légal', contactUs: 'Contact',
    privacy: 'Confidentialité', terms: 'Conditions', cookies: 'Cookies',
    rightsReserved: 'Tous droits réservés.',
    prev: 'Précédent', next: 'Suivant',
    fullName: 'Nom complet', fullNamePlaceholder: 'Votre nom complet',
    phone: 'Téléphone', phonePlaceholder: '0555 12 34 56',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Choisir la wilaya', wilayaUnavailable: 'Livraison indisponible',
    commune: 'Commune', communePlaceholder: 'Choisir la commune', communeLoading: 'Chargement...',
    deliveryType: 'Mode de livraison', deliveryHome: 'À domicile', deliveryOffice: 'Point relais',
    qty: 'Quantité', price: 'Prix', delivery: 'Livraison', total: 'Total',
    orderSummary: 'Récapitulatif',
    orderNow: 'Commander', addToCart: 'Ajouter au panier',
    confirmOrder: 'Confirmer la commande', sending: 'Envoi en cours...', cancel: 'Annuler',
    successTitle: 'Commande confirmée !', successDesc: 'Notre équipe vous contactera bientôt.',
    backToShop: 'Retour à la boutique',
    successSteps: [
      { title: 'Commande reçue', desc: 'Votre commande a été enregistrée avec succès' },
      { title: 'Confirmation', desc: 'Nous vous appellerons sous 24h' },
      { title: 'Préparation', desc: 'Votre commande est préparée avec le plus grand soin' },
      { title: 'Livraison', desc: '2 à 5 jours ouvrables' },
    ],
    cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre sélection.',
    myCart: 'Mon panier', subtotal: 'Sous-total', remove: 'Retirer', items: 'article(s)',
    errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
    errName: 'Nom complet requis (3 caractères minimum)',
    errPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
    orderEmail: 'E-mail', emailPh: 'exemple@email.com', errEmail: 'Veuillez saisir une adresse e-mail valide',
    whatsapp: 'Numéro WhatsApp', whatsappPh: '0550123456', errWhatsapp: 'Numéro WhatsApp algérien valide requis (ex: 0550123456)',
    contactQuestion: 'Avez-vous un e-mail ou un numéro WhatsApp ?', contactViaEmail: 'E-mail', contactViaWhatsapp: 'WhatsApp',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description',
    freeShippingBadge: 'Livraison gratuite',
    freeShippingThreshold: 'Livraison gratuite à partir de {{amount}}',
    freeShippingRemaining: 'Ajoutez {{amount}} pour bénéficier de la livraison gratuite',
    freeShippingReached: 'Bravo ! Vous avez la livraison gratuite 🎉',
    searchResultsFor: 'Résultats pour :',
    contactInfo: 'Nos coordonnées', yourName: 'Nom', yourEmail: 'E-mail',
    yourMessage: 'Votre message', messagePlaceholder: 'Comment pouvons-nous vous aider ?',
    sendMessage: 'Envoyer le message', sentTitle: 'Message bien reçu', sentDesc: 'Nous vous répondrons dans les plus brefs délais.',
    sendAnother: 'Envoyer un autre message',
    privacyBlocks: [
      { title: 'Données collectées', body: 'Nous collectons uniquement le nom, le téléphone, la wilaya et la commune — les informations nécessaires à la préparation et à la livraison de votre commande.' },
      { title: 'Utilisation', body: 'Vos données servent à confirmer la commande, organiser la livraison et vous contacter si besoin. Elles ne sont ni vendues ni partagées en dehors du transporteur.' },
      { title: 'Sécurité', body: 'Les commandes sont stockées sur des serveurs protégés et seules les personnes en charge du traitement y ont accès.' },
      { title: 'Vos droits', body: 'Vous pouvez demander la modification ou la suppression de vos données à tout moment via la page contact.' },
    ],
    termsBlocks: [
      { title: 'Commandes', body: 'Une commande est confirmée après appel téléphonique de notre équipe. Les prix affichés couvrent le produit et n\u2019incluent pas la livraison sauf mention contraire.' },
      { title: 'Livraison', body: 'Le tarif de livraison dépend de la wilaya et du mode choisi (domicile ou point relais). Le délai est généralement de 2 à 5 jours ouvrables.' },
      { title: 'Échange & retour', body: 'Vous pouvez vérifier le produit à la réception. En cas de défaut de fabrication, l\u2019échange est possible sous 7 jours avec l\u2019emballage d\u2019origine.' },
      { title: 'Responsabilité', body: 'Nous ne sommes pas responsables d\u2019une mauvaise utilisation du produit ni des dommages liés à la négligence.' },
    ],
    cookiesBlocks: [
      { title: 'Qu\u2019est-ce qu\u2019un cookie', body: 'Un petit fichier enregistré dans votre navigateur qui mémorise votre panier et vos préférences de navigation.' },
      { title: 'Utilisation', body: 'Ils conservent le contenu du panier, pré-remplissent le formulaire de commande et mesurent la performance du site.' },
      { title: 'Contrôle', body: 'Vous pouvez les supprimer depuis les réglages du navigateur, mais le contenu de votre panier sera alors perdu.' },
    ],
  },

  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart', menu: 'Menu', close: 'Close',
    search: 'Search frames, watches...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Browse the collection',
    collectionLabel: 'Collection', viewProduct: 'View',
    heroEyebrow: 'Sharper vision · Precise time',
    heroTitleFallback: 'Frames & watches<br/>built for detail',
    heroSubFallback: 'Optical eyewear, smartwatches and everyday accessories — carefully curated, tuned to your taste.',
    trust: [
      { t: 'Fast delivery',    s: 'To all 58 wilayas' },
      { t: '100% authentic',   s: 'Guaranteed sourcing' },
      { t: 'Cash on delivery', s: 'Pay after you inspect' },
      { t: '24/7 support',     s: 'A dedicated team' },
    ],
    quickLinks: 'Quick Links', legalNav: 'Legal', contactUs: 'Contact Us',
    privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies',
    rightsReserved: 'All rights reserved.',
    prev: 'Previous', next: 'Next',
    fullName: 'Full Name', fullNamePlaceholder: 'Enter your full name',
    phone: 'Phone Number', phonePlaceholder: '0555 12 34 56',
    wilaya: 'Wilaya', wilayaPlaceholder: 'Select wilaya', wilayaUnavailable: 'Delivery unavailable',
    commune: 'Commune', communePlaceholder: 'Select commune', communeLoading: 'Loading...',
    deliveryType: 'Delivery method', deliveryHome: 'Home delivery', deliveryOffice: 'Pickup point',
    qty: 'Quantity', price: 'Price', delivery: 'Delivery', total: 'Total',
    orderSummary: 'Order summary',
    orderNow: 'Order Now', addToCart: 'Add to Cart',
    confirmOrder: 'Confirm Order', sending: 'Sending...', cancel: 'Cancel',
    successTitle: 'Order placed successfully!', successDesc: 'We will contact you shortly to confirm the details.',
    backToShop: 'Back to Shop',
    successSteps: [
      { title: 'Order received', desc: 'Your order has been registered successfully' },
      { title: 'Confirmation', desc: "We'll call you within 24 hours" },
      { title: 'Preparation', desc: 'Your order is being prepared with great care' },
      { title: 'Shipping', desc: '2 to 5 business days' },
    ],
    cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Start shopping now.',
    myCart: 'My Cart', subtotal: 'Subtotal', remove: 'Remove', items: 'item(s)',
    errSubmit: 'An error occurred. Please try again.',
    errName: 'Full name is required (at least 3 characters)',
    errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    orderEmail: 'Email', emailPh: 'example@email.com', errEmail: 'Please enter a valid email address',
    whatsapp: 'WhatsApp number', whatsappPh: '0550123456', errWhatsapp: 'A valid Algerian WhatsApp number is required (e.g. 0550123456)',
    contactQuestion: 'Do you have an email or a WhatsApp number?', contactViaEmail: 'Email', contactViaWhatsapp: 'WhatsApp',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Description',
    freeShippingBadge: 'Free Delivery',
    freeShippingThreshold: 'Free delivery on orders over {{amount}}',
    freeShippingRemaining: 'Add {{amount}} more to get free delivery',
    freeShippingReached: 'Congrats! You have free delivery 🎉',
    searchResultsFor: 'Results for:',
    contactInfo: 'Contact details', yourName: 'Name', yourEmail: 'Email',
    yourMessage: 'Your message', messagePlaceholder: 'How can we help you?',
    sendMessage: 'Send message', sentTitle: 'Message received', sentDesc: 'We will get back to you as soon as possible.',
    sendAnother: 'Send another message',
    privacyBlocks: [
      { title: 'Data we collect', body: 'We only collect your name, phone number, wilaya and commune — the details required to prepare and deliver your order.' },
      { title: 'How we use it', body: 'Your data is used to confirm the order, arrange delivery and contact you if needed. We never sell it or share it beyond the courier.' },
      { title: 'Security', body: 'Orders are stored on protected servers and only the team handling fulfilment has access.' },
      { title: 'Your rights', body: 'You can request a change or deletion of your data at any time through the contact page.' },
    ],
    termsBlocks: [
      { title: 'Orders', body: 'An order is confirmed once our team reaches you by phone. Listed prices cover the product and exclude delivery unless stated otherwise.' },
      { title: 'Delivery', body: 'Delivery pricing depends on the wilaya and the chosen method (home or pickup point). Delivery usually takes 2 to 5 working days.' },
      { title: 'Exchange & return', body: 'You may inspect the product on arrival. In case of a manufacturing defect, an exchange is possible within 7 days with the original packaging.' },
      { title: 'Liability', body: 'We are not liable for improper use of the product or damage caused by negligence.' },
    ],
    cookiesBlocks: [
      { title: 'What cookies are', body: 'Small files stored in your browser that remember your cart and browsing preferences.' },
      { title: 'How we use them', body: 'They keep your cart contents, pre-fill the order form and measure site performance.' },
      { title: 'Your control', body: 'You can clear cookies from your browser settings, but your cart contents will be lost when you do.' },
    ],
  },
} as const;

/* --------------------------------------------------------------- helpers */

const fmt = (n: any): string => Number(n || 0).toLocaleString('fr-FR').replace(/\u202F|\u00A0/g, ' ');

function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d?.data ?? []);
  } catch { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d?.data ?? []);
  } catch { return []; }
};

const pickImg = (p: any): string | undefined =>
  p?.productImage || p?.imagesProduct?.[0]?.imageUrl || undefined;

/* ------------------------------------------------------ shared UI pieces */

/** SIGNATURE — bezel tick rail, used as a divider between sections. */
function TickRail({ count = 40, tone = BD }: { count?: number; tone?: string }) {
  return (
    <div className="uvt-rail" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ background: i % 5 === 0 ? A : tone, height: i % 5 === 0 ? 12 : 6 }} />
      ))}
    </div>
  );
}

function Loupe({ size = 44, color = BD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="15" stroke={color} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="1" opacity="0.6" />
      <circle cx="24" cy="24" r="1.6" fill={color} />
      <path d="M24 4v5M24 39v5M4 24h5M39 24h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const inputBase: React.CSSProperties = {
  width: '100%', padding: '0.8rem 0.95rem', fontSize: '0.9rem',
  border: `1px solid ${BD}`, borderRadius: 2, background: '#FBFBF9',
  color: INK, outline: 'none', appearance: 'none',
  transition: 'border-color .2s, box-shadow .2s', fontFamily: 'inherit', minHeight: 46,
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '0.9rem 1.5rem', minHeight: 48, background: INK, color: '#fff',
  fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.04em',
  border: `1px solid ${INK}`, borderRadius: 2, cursor: 'pointer',
  fontFamily: 'inherit', width: '100%',
};

const btnGhost: React.CSSProperties = {
  ...btnPrimary, background: 'transparent', color: INK, border: `1px solid ${BD}`,
};

const btnAmber: React.CSSProperties = {
  ...btnPrimary, background: A, color: '#fff', border: `1px solid ${A}`,
};

function Field({ label, error, children }: any) {
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <label className="uvt-label">{label}</label>
      {children}
      {error && (
        <p className="uvt-err">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function SelectWrap({ children }: any) {
  return (
    <div style={{ position: 'relative' }}>
      <ChevronDown size={13} className="uvt-sel-icon" />
      {children}
    </div>
  );
}

function SummaryRow({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div className="uvt-sumrow">
      <span style={{ flexShrink: 0, color: strong ? INK : SUB, fontWeight: strong ? 700 : 500 }}>{l}</span>
      <span
        className="uvt-num"
        style={{
          whiteSpace: 'nowrap', flexShrink: 0,
          fontWeight: strong ? 800 : 600,
          fontSize: strong ? '1.05rem' : '0.86rem',
          color: strong ? A : INK,
        }}
      >
        {v}
      </span>
    </div>
  );
}

function QtyCounter({ value, onDec, onInc }: any) {
  return (
    <div className="uvt-qty">
      <button type="button" onClick={onDec} aria-label="-"><Minus size={14} /></button>
      <span className="uvt-num">{value}</span>
      <button type="button" onClick={onInc} aria-label="+"><Plus size={14} /></button>
    </div>
  );
}

/* ===========================================================================
 *  THEME CSS — a <style> tag is required so media queries actually apply.
 *  Inline styles cannot express breakpoints, hover, or keyframes.
 * =========================================================================*/

const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700;800&family=JetBrains+Mono:wght@400;600;800&display=swap');

.uvt-root{
  --a:${A}; --ad:${AD}; --ink:${INK}; --dial:${DIAL}; --sub:${SUB};
  --bg:${BG}; --card:${CARD}; --bd:${BD};
  background:${BG}; color:${INK};
  font-family:'Tajawal',system-ui,-apple-system,sans-serif;
  min-height:100vh; display:flex; flex-direction:column;
  -webkit-font-smoothing:antialiased;
}
.uvt-root *{box-sizing:border-box;}
.uvt-root h1,.uvt-root h2,.uvt-root h3,.uvt-root .uvt-display{
  font-family:'Reem Kufi','Tajawal',sans-serif; font-weight:700; letter-spacing:-0.01em; margin:0;
}
.uvt-num{font-family:'JetBrains Mono','Tajawal',monospace; font-variant-numeric:tabular-nums;}
.uvt-root a{color:inherit; text-decoration:none;}
.uvt-root button{font-family:inherit;}
.uvt-wrap{max-width:1280px; margin:0 auto; padding:0 1.25rem; width:100%;}
@media (min-width:768px){ .uvt-wrap{padding:0 2rem;} }

/* ---------- keyframes ---------- */
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes sweep{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes badgeBounce{0%{transform:scale(1)}40%{transform:scale(1.4)}70%{transform:scale(.9)}100%{transform:scale(1)}}
@keyframes railIn{from{opacity:0;transform:scaleX(.6)}to{opacity:1;transform:scaleX(1)}}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ---------- SIGNATURE: bezel tick rail ---------- */
.uvt-rail{
  display:flex; align-items:flex-end; justify-content:space-between; gap:2px;
  height:12px; width:100%; overflow:hidden;
  animation:railIn .7s ease both; transform-origin:center;
}
.uvt-rail span{flex:1; max-width:2px; border-radius:1px;}

/* ---------- top ticker ---------- */
.uvt-ticker{background:${DIAL}; color:#EDEDE8; font-size:.72rem; letter-spacing:.08em; padding:7px 0; overflow:hidden;}
.uvt-ticker-in{display:inline-flex; gap:3rem; white-space:nowrap; animation:marquee 26s linear infinite;}

/* ---------- NAVBAR ARCHETYPE D — full-width logo strip ---------- */
.uvt-logostrip{
  background:${CARD}; border-bottom:1px solid ${BD};
  display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:1rem;
  padding:1.1rem 0; transition:padding .3s ease;
}
.uvt-logostrip.is-tight{padding:.55rem 0;}
.uvt-logostrip .uvt-side{display:none; font-size:.72rem; letter-spacing:.14em; text-transform:uppercase; color:${SUB};}
.uvt-logostrip .uvt-side.right{justify-self:end; display:none;}
@media (min-width:900px){ .uvt-logostrip .uvt-side,.uvt-logostrip .uvt-side.right{display:flex; align-items:center; gap:8px;} }
.uvt-wordmark{
  justify-self:center; display:flex; flex-direction:column; align-items:center; gap:4px;
  font-family:'Reem Kufi',sans-serif; font-weight:700; color:${INK};
  font-size:clamp(1.25rem,3.4vw,1.85rem); letter-spacing:.12em; text-transform:uppercase; line-height:1;
}
.uvt-wordmark img{max-height:52px; width:auto; object-fit:contain; display:block;}
.uvt-wordmark small{font-size:.55rem; letter-spacing:.34em; color:${A}; font-family:'JetBrains Mono',monospace;}

/* ---------- instrument bar (second row, sticky) ---------- */
.uvt-instr{
  position:sticky; top:0; z-index:200; background:rgba(247,247,245,.92);
  backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
  border-bottom:1px solid ${BD}; transition:box-shadow .25s ease, background .25s ease;
}
.uvt-instr.is-scrolled{box-shadow:0 6px 24px rgba(20,22,26,.07); background:rgba(247,247,245,.98);}
.uvt-instr-in{display:flex; align-items:center; justify-content:space-between; gap:1rem; height:56px;}
.uvt-links{display:none; align-items:center; gap:28px;}
@media (min-width:1024px){ .uvt-links{display:flex;} }
.uvt-link{
  position:relative; font-size:.82rem; font-weight:600; letter-spacing:.1em;
  text-transform:uppercase; color:${INK}; padding:6px 0;
}
.uvt-link::after{
  content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:${A};
  transform:scaleX(0); transform-origin:center; transition:transform .25s ease;
}
.uvt-link:hover::after,.uvt-link.is-active::after{transform:scaleX(1);}
.uvt-actions{display:flex; align-items:center; gap:6px;}
.uvt-iconbtn{
  width:42px; height:42px; display:inline-flex; align-items:center; justify-content:center;
  background:transparent; border:1px solid transparent; border-radius:2px; color:${INK};
  cursor:pointer; transition:background .2s, border-color .2s;
}
.uvt-iconbtn:hover{background:${AL}; border-color:${BD};}
.uvt-burger{display:inline-flex;}
@media (min-width:1024px){ .uvt-burger{display:none;} }
.uvt-cartbtn{position:relative;}
.uvt-badge{
  position:absolute; top:2px; inset-inline-end:2px; min-width:17px; height:17px; padding:0 4px;
  background:${A}; color:#fff; border-radius:999px; font-size:.62rem; font-weight:800;
  display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono',monospace;
}
.uvt-badge.is-bump{animation:badgeBounce .4s ease;}

/* ---------- desktop search ---------- */
.uvt-dsearch{display:none; position:relative;}
@media (min-width:1024px){ .uvt-dsearch{display:block;} }
.uvt-dsearch input{
  width:210px; padding:9px 34px 9px 12px; font-size:.82rem; font-family:inherit;
  border:1px solid ${BD}; border-radius:2px; background:${CARD}; color:${INK};
  outline:none; transition:width .3s ease, border-color .2s;
}
.uvt-dsearch input:focus{width:300px; border-color:${A};}
.uvt-dsearch .uvt-sicon{position:absolute; inset-inline-end:10px; top:50%; transform:translateY(-50%); color:${SUB}; pointer-events:none;}
.uvt-drop{
  position:absolute; top:calc(100% + 8px); inset-inline-end:0; width:360px;
  background:${CARD}; border:1px solid ${BD}; border-radius:2px;
  box-shadow:0 18px 44px rgba(20,22,26,.14); z-index:500; max-height:400px; overflow-y:auto;
  animation:fadeIn .18s ease both;
}
.uvt-sres{display:flex; gap:12px; padding:11px 14px; border-bottom:1px solid ${BD}; align-items:center;}
.uvt-sres:hover{background:${BG};}
.uvt-sres img{width:52px; height:52px; object-fit:cover; flex-shrink:0; border:1px solid ${BD};}
.uvt-sres-name{font-size:.86rem; font-weight:600; margin:0; color:${INK};}
.uvt-sres-price{font-size:.8rem; font-weight:700; color:${A}; margin:2px 0 0;}
.uvt-sall{display:block; padding:12px; text-align:center; font-size:.78rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:${A}; background:${BG};}

/* ---------- mobile search overlay ---------- */
.uvt-overlay{position:fixed; inset:0; z-index:600; background:rgba(20,22,26,.55); backdrop-filter:blur(5px); display:flex; flex-direction:column; animation:fadeIn .2s ease both;}
.uvt-ohead{background:${CARD}; padding:12px 16px; display:flex; align-items:center; gap:10px;}
.uvt-ohead input{flex:1; border:none; outline:none; font-size:1rem; font-family:inherit; background:transparent; color:${INK};}
.uvt-obody{flex:1; overflow-y:auto; background:${CARD}; margin-top:1px;}

/* ---------- mobile drawer ---------- */
.uvt-drawer{position:fixed; inset:0; z-index:300; background:rgba(20,22,26,.5); animation:fadeIn .2s ease both;}
.uvt-drawer-in{
  position:absolute; inset-block:0; inset-inline-start:0; width:min(82%,320px);
  background:${CARD}; padding:1.5rem 1.25rem; display:flex; flex-direction:column; gap:.25rem;
  animation:fadeIn .25s ease both; box-shadow:0 0 60px rgba(0,0,0,.2);
}
.uvt-drawer-link{
  display:flex; align-items:center; justify-content:space-between; padding:15px 4px;
  border-bottom:1px solid ${BD}; font-size:.95rem; font-weight:600; color:${INK};
}

/* ---------- HERO — split, image panel always visible on mobile ---------- */
.uvt-hero{border-bottom:1px solid ${BD}; background:${CARD}; overflow:hidden;}
.uvt-hero-in{display:grid; grid-template-columns:1fr; gap:0; align-items:stretch;}
@media (min-width:900px){ .uvt-hero-in{grid-template-columns:1.05fr .95fr; min-height:clamp(480px,64vh,700px);} }
.uvt-hero-copy{padding:3rem 1.25rem 3.25rem; display:flex; flex-direction:column; justify-content:center; gap:1.1rem;}
@media (min-width:768px){ .uvt-hero-copy{padding:4rem 2rem;} }
@media (min-width:900px){ .uvt-hero-copy{padding:4.5rem 3rem 4.5rem 2rem;} }
.uvt-eyebrow{
  display:inline-flex; align-items:center; gap:9px; font-family:'JetBrains Mono',monospace;
  font-size:.68rem; letter-spacing:.24em; text-transform:uppercase; color:${A};
  animation:fadeUp .6s ease .05s both;
}
.uvt-eyebrow::before{content:''; width:34px; height:1px; background:${A};}
.uvt-hero h1{
  font-size:clamp(2rem,5.4vw,3.6rem); line-height:1.12; color:${INK};
  max-width:600px; margin-inline-end:auto; animation:fadeUp .7s ease .12s both;
}
.uvt-hero-sub{
  font-size:clamp(.95rem,1.6vw,1.08rem); line-height:1.85; color:${SUB};
  max-width:520px; margin-inline-end:auto; animation:fadeUp .7s ease .26s both;
}
.uvt-hero-cta{display:flex; flex-wrap:wrap; gap:.75rem; animation:fadeUp .7s ease .4s both;}
.uvt-hero-cta a{width:auto; min-width:190px;}
.uvt-hero-panel{
  position:relative; min-height:320px; background:${DIAL}; overflow:hidden;
  display:flex; align-items:center; justify-content:center;
}
@media (min-width:900px){ .uvt-hero-panel{min-height:100%;} }
.uvt-hero-panel img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;}
.uvt-hero-scrim{position:absolute; inset:0; background:linear-gradient(180deg,rgba(27,42,58,.15) 0%,rgba(27,42,58,.55) 100%);}
.uvt-hero-ring{
  position:absolute; width:min(64%,340px); aspect-ratio:1/1; border:1px solid rgba(255,255,255,.28);
  border-radius:50%; animation:float 6s ease-in-out infinite; pointer-events:none;
}
.uvt-hero-ring::after{
  content:''; position:absolute; inset:16%; border:1px solid rgba(176,106,44,.6); border-radius:50%;
}
.uvt-hero-sweep{
  position:absolute; width:min(64%,340px); aspect-ratio:1/1; pointer-events:none;
  border-top:2px solid rgba(176,106,44,.85); border-radius:50%;
  animation:sweep 9s linear infinite;
}
.uvt-hero-stat{
  position:absolute; inset-inline-start:0; bottom:0; padding:1rem 1.25rem;
  color:#fff; font-family:'JetBrains Mono',monospace; font-size:.68rem; letter-spacing:.16em;
  text-transform:uppercase; opacity:.9;
}

/* ---------- trust bar ---------- */
.uvt-trust{background:${INK}; color:#EDEDE8;}
.uvt-trust-in{display:grid; grid-template-columns:repeat(2,1fr); gap:0;}
@media (min-width:900px){ .uvt-trust-in{grid-template-columns:repeat(4,1fr);} }
.uvt-trust-cell{
  display:flex; align-items:center; gap:12px; padding:1.15rem 1rem;
  border-inline-end:1px solid rgba(255,255,255,.08); border-bottom:1px solid rgba(255,255,255,.08);
}
.uvt-trust-cell:last-child{border-inline-end:none;}
@media (min-width:900px){ .uvt-trust-cell{border-bottom:none;} }
.uvt-trust-cell b{display:block; font-size:.85rem; font-weight:700;}
.uvt-trust-cell span{display:block; font-size:.72rem; color:rgba(237,237,232,.6); margin-top:2px;}
.uvt-trust-ico{color:${A}; flex-shrink:0;}

/* ---------- section head ---------- */
.uvt-sec{padding:3rem 0;}
@media (min-width:768px){ .uvt-sec{padding:4rem 0;} }
.uvt-sechead{display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; margin-bottom:1.25rem;}
.uvt-sechead h2{font-size:clamp(1.3rem,3vw,1.85rem); color:${INK};}
.uvt-seccount{font-family:'JetBrains Mono',monospace; font-size:.72rem; color:${SUB}; letter-spacing:.14em;}

/* ---------- categories — bezel-notch indicator (§16-E, unique) ---------- */
.uvt-cats{display:flex; gap:6px; overflow-x:auto; padding:.5rem 0 1.5rem; scrollbar-width:none;}
.uvt-cats::-webkit-scrollbar{display:none;}
.uvt-cat{
  position:relative; flex-shrink:0; padding:12px 18px 10px; font-size:.8rem; font-weight:600;
  color:${SUB}; background:transparent; border:1px solid transparent; border-radius:2px;
  letter-spacing:.02em; transition:color .2s, letter-spacing .25s, background .2s; min-height:44px;
  display:inline-flex; align-items:center;
}
.uvt-cat::before{
  content:''; position:absolute; top:0; left:50%; transform:translateX(-50%) scaleY(0);
  width:16px; height:3px; background:${A}; transform-origin:top; transition:transform .25s ease;
}
.uvt-cat:hover{color:${INK}; background:${AL};}
.uvt-cat.is-active{color:${INK}; font-weight:800; letter-spacing:.13em; background:${AL};}
.uvt-cat.is-active::before{transform:translateX(-50%) scaleY(1);}

/* ---------- product grid ---------- */
.uvt-grid{display:grid; grid-template-columns:1fr; gap:1.1rem;}
@media (min-width:640px){ .uvt-grid{grid-template-columns:repeat(2,1fr);} }
@media (min-width:1024px){ .uvt-grid{grid-template-columns:repeat(3,1fr);} }
@media (min-width:1280px){ .uvt-grid{grid-template-columns:repeat(4,1fr);} }

/* ---------- CARD ARCHETYPE 5 — framed label ---------- */
.uvt-card{
  display:flex; flex-direction:column; background:${CARD}; border:2px solid ${BD};
  border-radius:2px; overflow:hidden; animation:fadeUp .5s ease both;
  transition:border-color .28s ease, transform .28s cubic-bezier(.22,.68,0,1.2), box-shadow .28s ease;
  will-change:transform;
}
.uvt-card:hover{border-color:${INK}; transform:translateY(-5px); box-shadow:0 18px 36px rgba(20,22,26,.1);}
.uvt-card-eyebrow{
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  background:${BG}; border-bottom:1px solid ${BD}; padding:6px 12px;
  font-size:.63rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:${SUB};
}
.uvt-card-eyebrow .uvt-off{color:${A}; font-family:'JetBrains Mono',monospace;}
.uvt-card-media{position:relative; aspect-ratio:1/1; overflow:hidden; background:${BG};
  display:flex; align-items:center; justify-content:center;}
/* SIGNATURE: focus reveal — desaturated until hover, then sharpens */
.uvt-card-media img{
  width:100%; height:100%; object-fit:cover; display:block;
  filter:saturate(.78) contrast(1.02); transition:transform .55s ease, filter .45s ease;
}
.uvt-card:hover .uvt-card-media img{transform:scale(1.06); filter:saturate(1) contrast(1);}
.uvt-card-body{padding:.9rem .95rem 1rem; display:flex; flex-direction:column; gap:.55rem; flex:1;}
.uvt-card-name{
  font-size:.9rem; font-weight:600; line-height:1.5; color:${INK}; margin:0;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.uvt-stars{display:flex; gap:2px; color:${A};}
.uvt-card-foot{display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:auto;}
.uvt-price{font-size:1.02rem; font-weight:800; color:${INK}; white-space:nowrap;}
.uvt-price-old{font-size:.76rem; color:${SUB}; text-decoration:line-through; margin-inline-start:6px; font-weight:500;}
.uvt-card-cta{
  display:inline-flex; align-items:center; gap:5px; font-size:.7rem; font-weight:800;
  letter-spacing:.12em; text-transform:uppercase; color:${A}; white-space:nowrap;
}
.uvt-card:hover .uvt-card-cta{color:${AD};}

/* ---------- pagination ---------- */
.uvt-pager{display:flex; flex-wrap:wrap; justify-content:center; gap:6px; margin-top:2.5rem;}
.uvt-pager a{
  min-width:44px; min-height:44px; display:inline-flex; align-items:center; justify-content:center;
  border:1px solid ${BD}; border-radius:2px; font-family:'JetBrains Mono',monospace;
  font-size:.82rem; font-weight:600; color:${INK}; background:${CARD}; transition:all .2s;
}
.uvt-pager a:hover{border-color:${INK};}
.uvt-pager a.is-active{background:${INK}; color:#fff; border-color:${INK};}

/* ---------- skeleton ---------- */
.uvt-skel{
  background:linear-gradient(90deg,#EDEBE7 25%,#F6F5F2 50%,#EDEBE7 75%);
  background-size:400px 100%; animation:shimmer 1.4s infinite linear; border-radius:2px;
}

/* ---------- details ---------- */
.uvt-details{display:grid; grid-template-columns:1fr; gap:2rem; padding:2.25rem 0 3.5rem;}
@media (min-width:768px){ .uvt-details{grid-template-columns:1fr 1fr; gap:2.5rem;} }
@media (min-width:1024px){ .uvt-details{grid-template-columns:1.08fr .92fr; gap:3.25rem;} }
.uvt-gal-main{
  position:relative; aspect-ratio:1/1; background:${CARD}; border:2px solid ${BD};
  overflow:hidden; display:flex; align-items:center; justify-content:center;
}
.uvt-gal-main img{width:100%; height:100%; object-fit:cover; display:block; animation:fadeIn .3s ease both;}
.uvt-gal-nav{
  position:absolute; top:50%; transform:translateY(-50%); width:40px; height:40px;
  background:rgba(255,255,255,.94); border:1px solid ${BD}; border-radius:2px; cursor:pointer;
  display:flex; align-items:center; justify-content:center; color:${INK}; transition:background .2s;
}
.uvt-gal-nav:hover{background:${A}; color:#fff; border-color:${A};}
.uvt-thumbs{display:flex; gap:8px; margin-top:10px; overflow-x:auto; padding-bottom:4px; scrollbar-width:none;}
.uvt-thumbs::-webkit-scrollbar{display:none;}
.uvt-thumb{
  width:70px; height:70px; flex-shrink:0; border:2px solid ${BD}; background:${CARD};
  overflow:hidden; cursor:pointer; padding:0; transition:border-color .2s;
}
.uvt-thumb.is-active{border-color:${A};}
.uvt-thumb img{width:100%; height:100%; object-fit:cover; display:block;}
.uvt-dtitle{font-size:clamp(1.4rem,3.4vw,2.05rem); line-height:1.28; color:${INK}; margin:.5rem 0 .65rem;}
.uvt-pricebox{
  display:flex; align-items:baseline; gap:12px; flex-wrap:wrap;
  padding:1rem 1.1rem; background:${CARD}; border:2px solid ${BD}; border-inline-start:4px solid ${A};
  margin:1.1rem 0;
}
.uvt-pricebox b{font-size:clamp(1.35rem,3.6vw,1.9rem); font-weight:800; color:${INK}; white-space:nowrap;}
.uvt-offers{display:flex; flex-direction:column; gap:8px;}
.uvt-offer{
  display:flex; align-items:center; justify-content:space-between; gap:10px; width:100%;
  padding:.8rem 1rem; background:${CARD}; border:1px solid ${BD}; border-radius:2px;
  cursor:pointer; text-align:start; transition:border-color .2s, background .2s; min-height:48px;
}
.uvt-offer:hover{border-color:${A};}
.uvt-offer.is-active{border-color:${A}; background:${AL}; border-width:2px;}
.uvt-attrs{display:flex; flex-wrap:wrap; gap:8px;}
.uvt-swatch{
  min-width:44px; min-height:44px; border:2px solid ${BD}; border-radius:2px; background:${CARD};
  cursor:pointer; padding:4px 12px; font-size:.82rem; font-weight:600; color:${INK};
  display:inline-flex; align-items:center; justify-content:center; transition:all .2s;
}
.uvt-swatch.is-active{border-color:${A}; box-shadow:0 0 0 3px ${AL};}
.uvt-swatch img{width:100%; height:100%; object-fit:cover; display:block;}
.uvt-desc{line-height:2; color:${SUB}; font-size:.93rem;}
.uvt-desc img{max-width:100%; height:auto;}

/* ---------- form ---------- */
.uvt-formcard{background:${CARD}; border:2px solid ${BD}; border-radius:2px; padding:1.25rem;}
@media (min-width:768px){ .uvt-formcard{padding:1.6rem;} }
.uvt-label{display:block; font-size:.72rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:${SUB}; margin-bottom:.4rem;}
.uvt-root input:focus,.uvt-root select:focus,.uvt-root textarea:focus{border-color:${A}!important; box-shadow:0 0 0 3px ${AL};}
.uvt-err{font-size:.74rem; color:${ERR}; margin:.35rem 0 0; display:flex; align-items:center; gap:4px;}
.uvt-sel-icon{position:absolute; inset-inline-end:12px; top:50%; transform:translateY(-50%); pointer-events:none; color:${SUB};}
.uvt-row2{display:grid; grid-template-columns:1fr; gap:.9rem;}
@media (min-width:500px){ .uvt-row2{grid-template-columns:1fr 1fr;} }
.uvt-toggle{display:grid; grid-template-columns:1fr 1fr; gap:8px;}
.uvt-toggle button{
  padding:.75rem .5rem; min-height:48px; border:1px solid ${BD}; border-radius:2px;
  background:transparent; color:${SUB}; font-size:.82rem; font-weight:600; cursor:pointer;
  transition:all .2s; display:flex; align-items:center; justify-content:center; gap:6px;
}
.uvt-toggle button.is-active{border-color:${A}; border-width:2px; background:${AL}; color:${INK}; font-weight:800;}
.uvt-qty{display:inline-flex; align-items:center; border:1px solid ${BD}; border-radius:2px; overflow:hidden; background:${CARD};}
.uvt-qty button{
  width:44px; height:44px; border:none; background:transparent; cursor:pointer; color:${INK};
  display:flex; align-items:center; justify-content:center; transition:background .2s;
}
.uvt-qty button:hover{background:${AL};}
.uvt-qty span{min-width:48px; text-align:center; font-weight:800; font-size:.95rem;}
.uvt-summary{
  border:1px dashed ${BD}; border-radius:2px; padding:.9rem 1rem; background:${BG}; margin:1.1rem 0;
  display:flex; flex-direction:column; gap:.55rem;
}
.uvt-sumrow{display:flex; align-items:center; justify-content:space-between; gap:12px;}
.uvt-sumtotal{border-top:1px solid ${BD}; padding-top:.7rem; margin-top:.15rem;}
.uvt-btnrow{display:grid; grid-template-columns:1fr; gap:.6rem;}
@media (min-width:500px){ .uvt-btnrow.is-two{grid-template-columns:1fr 1fr;} }
.uvt-root button[style]:hover:not(:disabled){filter:brightness(.92);}
.uvt-root button:disabled{opacity:.6; cursor:default;}

/* ---------- cart ---------- */
.uvt-cartgrid{display:grid; grid-template-columns:1fr; gap:1.75rem; padding:2rem 0 3.5rem;}
@media (min-width:1024px){ .uvt-cartgrid{grid-template-columns:1.2fr 1fr; gap:2.5rem; align-items:start;} }
.uvt-citem{display:flex; gap:14px; padding:1rem; background:${CARD}; border:1px solid ${BD}; border-radius:2px; margin-bottom:.75rem;}
.uvt-citem-img{width:84px; height:84px; flex-shrink:0; border:1px solid ${BD}; background:${BG}; overflow:hidden;
  display:flex; align-items:center; justify-content:center;}
.uvt-citem-img img{width:100%; height:100%; object-fit:cover; display:block;}
.uvt-trash{background:transparent; border:none; cursor:pointer; color:${SUB}; padding:6px; transition:color .2s;}
.uvt-trash:hover{color:${ERR};}
.uvt-sticky{position:static;}
@media (min-width:1024px){ .uvt-sticky{position:sticky; top:80px;} }

/* ---------- empty / success ---------- */
.uvt-state{text-align:center; padding:4rem 1.25rem; max-width:520px; margin:0 auto;}
.uvt-state h2{font-size:clamp(1.3rem,3.4vw,1.8rem); margin-bottom:.6rem; color:${INK};}
.uvt-state p{color:${SUB}; line-height:1.85; margin:0 0 1.5rem;}

/* ---------- static pages ---------- */
.uvt-phead{background:${DIAL}; color:#fff; padding:3rem 0 2.5rem; position:relative; overflow:hidden;}
.uvt-phead h1{font-size:clamp(1.6rem,4.4vw,2.6rem); position:relative;}
.uvt-phead .uvt-eyebrow{color:${A};}
.uvt-block{border-top:1px solid ${BD}; padding:1.6rem 0;}
.uvt-block h3{font-size:1.02rem; margin-bottom:.5rem; color:${INK};}
.uvt-block p{color:${SUB}; line-height:2; font-size:.92rem; margin:0;}
.uvt-contact{display:grid; grid-template-columns:1fr; gap:2rem; padding:2.5rem 0 3.5rem;}
@media (min-width:900px){ .uvt-contact{grid-template-columns:.85fr 1.15fr; gap:3rem;} }
.uvt-cinfo{display:flex; align-items:flex-start; gap:12px; padding:1rem 0; border-bottom:1px solid ${BD};}
.uvt-cinfo b{display:block; font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:${SUB}; margin-bottom:3px;}

/* ---------- footer ---------- */
.uvt-footer{background:${INK}; color:#EDEDE8; margin-top:auto;}
.uvt-fgrid{display:grid; grid-template-columns:1fr; gap:2rem; padding:3rem 0 2rem;}
@media (min-width:768px){ .uvt-fgrid{grid-template-columns:1.4fr .8fr .8fr 1fr; gap:2.5rem;} }
.uvt-fhead{font-size:.72rem; font-weight:800; letter-spacing:.18em; text-transform:uppercase; color:${A}; margin-bottom:1rem;}
.uvt-flink{display:block; padding:7px 0; font-size:.87rem; color:rgba(237,237,232,.72); transition:color .2s, padding-inline-start .2s;}
.uvt-flink:hover{color:#fff; padding-inline-start:6px;}
.uvt-fcontact{display:flex; align-items:flex-start; gap:10px; padding:7px 0; font-size:.87rem; color:rgba(237,237,232,.72);}
.uvt-fbottom{border-top:1px solid rgba(255,255,255,.1); padding:1.1rem 0; font-size:.76rem; color:rgba(237,237,232,.5); text-align:center;}

/* ---------- motion preference ---------- */
@media (prefers-reduced-motion: reduce){
  .uvt-root *,.uvt-root *::before,.uvt-root *::after{
    animation-duration:.01ms!important; animation-iteration-count:1!important;
    transition-duration:.01ms!important; scroll-behavior:auto!important;
  }
}
`;

function ThemeStyle() {
  return <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />;
}

/* ===========================================================================
 *  MAIN — wrapper. Resets scroll on every route change (§0 / §15.7)
 * =========================================================================*/

export default function Main({ store, children, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setVisible(false);
    const id = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div className="uvt-root" dir={t.dir}>
      <ThemeStyle />
      <Navbar store={store} domain={domain} />
      <main
        style={{
          flex: 1,
          opacity: visible ? 1 : 0,
          transition: 'opacity .3s ease',
        }}
      >
        {children}
      </main>
      <Footer store={store} />
    </div>
  );
}

/* ===========================================================================
 *  NAVBAR — ARCHETYPE D: full-width logo strip + sticky instrument bar
 * =========================================================================*/

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
  const showCart = store?.cart !== false;
  const firstRun = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setBump(true);
    const id = setTimeout(() => setBump(false), 420);
    return () => clearTimeout(id);
  }, [count]);

  useEffect(() => { setOpen(false); }, [pathname]);

  /* live search — 380ms debounce */
  useEffect(() => {
    if (searchQuery.trim().length < 2) { setListSearch([]); setLoading(false); return; }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const d = await r.json();
        setListSearch(Array.isArray(d) ? d.slice(0, 6) : (d?.products ?? d?.data ?? []).slice(0, 6));
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(id);
  }, [searchQuery, domain]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearch(false);
    setSearchFocused(false);
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  /* mobile drawer — page links ONLY, never the cart (§5, §15.9) */
  const mobileLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
  ];

  const logo = store?.design?.logoUrl;
  const currency = store?.currency || 'DA';

  const ResultRow = ({ p, onDone }: any) => {
    const img = pickImg(p);
    return (
      <Link href={`/product/${p.slug || p.id}`} className="uvt-sres" onClick={onDone}>
        {img
          ? <img src={img} alt={p.name} />
          : <span className="uvt-citem-img" style={{ width: 52, height: 52 }}><Glasses size={20} color={BD} /></span>}
        <span style={{ minWidth: 0 }}>
          <p className="uvt-sres-name">{p.name}</p>
          <p className="uvt-sres-price uvt-num">{fmt(p.price)} {currency}</p>
        </span>
      </Link>
    );
  };

  return (
    <header>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div className="uvt-ticker">
          <div className="uvt-ticker-in">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i}>{store.topBar.text}</span>
            ))}
          </div>
        </div>
      )}

      {/* ---- strip 1: full-width wordmark ---- */}
      <div className={`uvt-logostrip${scrolled ? ' is-tight' : ''}`}>
        <div className="uvt-side" style={{ paddingInlineStart: '2rem' }}>
          <Glasses size={14} color={A} /> {t.heroEyebrow}
        </div>

        <Link href="/" className="uvt-wordmark" aria-label={store?.name}>
          {logo && !imgError
            ? <img src={logo} alt={store?.name} onError={() => setImgError(true)} />
            : <>{store?.name || 'URBAN VISION'}<small>&middot; VISION &amp; TIME &middot;</small></>}
        </Link>

        <div className="uvt-side right" style={{ paddingInlineEnd: '2rem' }}>
          {store?.contact?.phone && (
            <a href={`tel:${store.contact.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Phone size={13} color={A} /> <span className="uvt-num">{store.contact.phone}</span>
            </a>
          )}
        </div>
      </div>

      {/* ---- strip 2: sticky instrument bar ---- */}
      <div className={`uvt-instr${scrolled ? ' is-scrolled' : ''}`}>
        <div className="uvt-wrap uvt-instr-in">
          <nav className="uvt-links">
            <Link href="/" className={`uvt-link${pathname === '/' ? ' is-active' : ''}`}>{t.home}</Link>
            <Link href="/contact" className={`uvt-link${pathname === '/contact' ? ' is-active' : ''}`}>{t.contact}</Link>
          </nav>

          <button className="uvt-iconbtn uvt-burger" onClick={() => setOpen(true)} aria-label={t.menu}>
            <Menu size={21} />
          </button>

          <div className="uvt-actions">
            {/* desktop inline search + dropdown */}
            <form className="uvt-dsearch" onSubmit={submitSearch} role="search">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder={t.search}
                aria-label={t.search}
              />
              <Search size={15} className="uvt-sicon" />
              {searchFocused && searchQuery.trim().length >= 2 && (
                <div className="uvt-drop">
                  {loading && <p style={{ padding: '1rem', textAlign: 'center', color: SUB, fontSize: '.82rem' }}>{t.searching}</p>}
                  {!loading && listSearch.length === 0 && (
                    <p style={{ padding: '1.5rem', textAlign: 'center', color: SUB, fontSize: '.82rem' }}>{t.noResults}</p>
                  )}
                  {listSearch.map((p) => <ResultRow key={p.id} p={p} />)}
                  {listSearch.length > 0 && (
                    <Link href={`/?search=${encodeURIComponent(searchQuery)}`} className="uvt-sall">
                      {t.showAll}
                    </Link>
                  )}
                </div>
              )}
            </form>

            {/* mobile search trigger */}
            <button
              className="uvt-iconbtn"
              onClick={() => setShowSearch(true)}
              aria-label={t.search}
              style={{ display: 'inline-flex' }}
            >
              <Search size={20} />
            </button>

            {showCart && (
              <Link href="/cart" className="uvt-iconbtn uvt-cartbtn" aria-label={t.cart}>
                <ShoppingBag size={20} />
                {count > 0 && <span className={`uvt-badge${bump ? ' is-bump' : ''}`}>{count}</span>}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ---- mobile drawer ---- */}
      {open && (
        <div
          className="uvt-drawer"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="uvt-drawer-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="uvt-display" style={{ letterSpacing: '.12em', textTransform: 'uppercase', fontSize: '.95rem' }}>
                {store?.name}
              </span>
              <button className="uvt-iconbtn" onClick={() => setOpen(false)} aria-label={t.close}><X size={20} /></button>
            </div>
            <TickRail count={26} />
            {mobileLinks.map((l) => (
              <Link key={l.h} href={l.h} className="uvt-drawer-link" onClick={() => setOpen(false)}>
                {l.l}
                <ArrowRight size={15} color={A} style={{ transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
              </Link>
            ))}
            {store?.contact?.phone && (
              <a href={`tel:${store.contact.phone}`} className="uvt-drawer-link" style={{ borderBottom: 'none' }}>
                <span className="uvt-num">{store.contact.phone}</span>
                <Phone size={15} color={A} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* ---- mobile full-screen search overlay ---- */}
      {showSearch && (
        <div
          className="uvt-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}
        >
          <form className="uvt-ohead" onSubmit={submitSearch} role="search">
            <Search size={19} color={SUB} />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              aria-label={t.search}
            />
            <button
              type="button"
              className="uvt-iconbtn"
              onClick={() => { setShowSearch(false); setSearchQuery(''); setListSearch([]); }}
              aria-label={t.close}
            >
              <X size={21} />
            </button>
          </form>
          <div className="uvt-obody">
            {loading && <p style={{ padding: '1.25rem', textAlign: 'center', color: SUB }}>{t.searching}</p>}
            {listSearch.map((p) => <ResultRow key={p.id} p={p} onDone={() => setShowSearch(false)} />)}
            {listSearch.length > 0 && (
              <Link
                href={`/?search=${encodeURIComponent(searchQuery)}`}
                className="uvt-sall"
                onClick={() => setShowSearch(false)}
              >
                {t.showAll}
              </Link>
            )}
            {searchQuery.trim().length >= 2 && !loading && listSearch.length === 0 && (
              <p style={{ padding: '2.5rem', textAlign: 'center', color: SUB }}>{t.noResults}</p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ===========================================================================
 *  FOOTER
 * =========================================================================*/

export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const year = new Date().getFullYear();

  const links = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contact },
  ].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);

  return (
    <footer className="uvt-footer">
      <div className="uvt-wrap">
        <div style={{ paddingTop: 24 }}><TickRail count={44} tone="rgba(255,255,255,.16)" /></div>

        <div className="uvt-fgrid">
          <div>
            <p className="uvt-display" style={{ fontSize: '1.15rem', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              {store?.name}
            </p>
            <p style={{ color: 'rgba(237,237,232,.62)', lineHeight: 1.95, fontSize: '.88rem', maxWidth: 380, marginInlineEnd: 'auto' }}>
              {store?.hero?.subtitle || t.heroSubFallback}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, color: A }}>
              <Glasses size={18} /><Watch size={18} />
            </div>
          </div>

          <div>
            <p className="uvt-fhead">{t.quickLinks}</p>
            {links.map((l) => (
              <Link key={l.h} href={l.h} className="uvt-flink">{l.l}</Link>
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
            <p className="uvt-fhead">{t.contactUs}</p>
            {store?.contact?.phone && (
              <a href={`tel:${store.contact.phone}`} className="uvt-fcontact">
                <Phone size={15} color={A} style={{ flexShrink: 0, marginTop: 2 }} />
                <span className="uvt-num">{store.contact.phone}</span>
              </a>
            )}
            {store?.contact?.email && (
              <a href={`mailto:${store.contact.email}`} className="uvt-fcontact">
                <Mail size={15} color={A} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ wordBreak: 'break-all' }}>{store.contact.email}</span>
              </a>
            )}
            {(store?.contact?.wilaya || store?.contact?.address) && (
              <p className="uvt-fcontact">
                <MapPin size={15} color={A} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' — ')}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="uvt-fbottom">
        <div className="uvt-wrap">
          &copy; {year} {store?.name} — {t.rightsReserved}
        </div>
      </div>
    </footer>
  );
}

/* ===========================================================================
 *  CARD — ARCHETYPE 5: Framed Label
 * =========================================================================*/

export function Card({ product, displayImage, discount, store, viewDetails }: any) {
  const t = T[getLang(store)];
  const [imgErr, setImgErr] = useState(false);
  const img = displayImage || pickImg(product);
  const currency = store?.currency || 'DA';
  const eyebrow = product?.category?.name || product?.niche?.name || t.collectionLabel;
  const old = Number(product?.priceOriginal || 0);
  const now = Number(product?.price || 0);

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      className="uvt-card"
      onClick={viewDetails}
      aria-label={product.name}
    >
      <div className="uvt-card-eyebrow">
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eyebrow}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {product?.isDigital ? (
            <span className="uvt-off" style={{ display: 'inline-flex', alignItems: 'center' }}><Download size={11} /></span>
          ) : product?.shippingFree && <span className="uvt-off">🚚</span>}
          {discount > 0 && <span className="uvt-off">&minus;{discount}%</span>}
        </span>
      </div>

      <div className="uvt-card-media">
        {img && !imgErr ? (
          <img src={img} alt={product.name} onError={() => setImgErr(true)} />
        ) : (
          <Loupe size={46} color={BD} />
        )}
      </div>

      <div className="uvt-card-body">
        <div className="uvt-stars" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} fill={A} strokeWidth={0} />
          ))}
        </div>

        <p className="uvt-card-name">{product.name}</p>

        <div className="uvt-card-foot">
          <span>
            <span className="uvt-price uvt-num">{fmt(now)} {currency}</span>
            {old > now && <span className="uvt-price-old uvt-num">{fmt(old)}</span>}
          </span>
          <span className="uvt-card-cta">
            {t.viewProduct}
            <ArrowRight size={12} style={{ transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ===========================================================================
 *  HOME — hero (split) · trust · categories (URL only) · grid · pagination
 * =========================================================================*/

export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const activeSearch = searchParams.get('search');

  const products: any[] = store?.products || [];
  const cats: any[] = store?.categories || [];
  const currency = store?.currency || 'DA';
  const showCart = store?.cart !== false;

  const current = Number(page || searchParams.get('page') || 1);
  const countPage = Math.ceil((store?.count || products.length) / 48);

  const heroImg = store?.hero?.imageUrl;
  const heroTitle = store?.hero?.title || t.heroTitleFallback;
  const heroSub = store?.hero?.subtitle || t.heroSubFallback;

  const trustIcons = [Truck, ShieldCheck, CreditCard, Headphones];
  const trust = t.trust as readonly { t: string; s: string }[];

  const buildQuery = (n: number) => {
    const q: Record<string, string> = { page: String(n) };
    if (activeCategory) q.category = activeCategory;
    if (activeSearch) q.search = activeSearch;
    return q;
  };

  return (
    <>
      {/* ---------------- HERO — split ---------------- */}
      {!activeSearch && (
        <section className="uvt-hero">
          <div className="uvt-hero-in">
            <div className="uvt-hero-copy">
              <span className="uvt-eyebrow">{t.heroEyebrow}</span>
              <h1 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(heroTitle) }} />
              <p className="uvt-hero-sub">{heroSub}</p>
              <div className="uvt-hero-cta">
                <a href="#collection" style={{ ...btnPrimary, width: 'auto' }}>
                  {t.shopNow}
                  <ArrowRight size={15} style={{ transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
                </a>
                {showCart && (
                  <Link href="/cart" style={{ ...btnGhost, width: 'auto' }}>
                    <ShoppingBag size={15} /> {t.cart}
                  </Link>
                )}
              </div>
            </div>

            <div className="uvt-hero-panel">
              {heroImg && <img src={heroImg} alt={store?.name || ''} />}
              <div className="uvt-hero-scrim" />
              <div className="uvt-hero-ring" />
              <div className="uvt-hero-sweep" />
              <div className="uvt-hero-stat">
                <span className="uvt-num">58 wilayas</span> &nbsp;/&nbsp; <span className="uvt-num">24-72h</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- TRUST BAR ---------------- */}
      <section className="uvt-trust">
        <div className="uvt-wrap">
          <div className="uvt-trust-in">
            {trust.map((item, i) => {
              const Ico = trustIcons[i];
              return (
                <div className="uvt-trust-cell" key={item.t}>
                  <Ico size={21} className="uvt-trust-ico" />
                  <span>
                    <b>{item.t}</b>
                    <span>{item.s}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- COLLECTION ---------------- */}
      <section className="uvt-sec" id="collection">
        <div className="uvt-wrap">
          <TickRail count={40} />

          <div className="uvt-sechead" style={{ marginTop: '1.5rem' }}>
            <h2>
              {activeSearch ? `${t.searchResultsFor} ${activeSearch}` : t.collectionLabel}
            </h2>
            <span className="uvt-seccount uvt-num">
              {String(store?.count ?? products.length).padStart(2, '0')} {t.items}
            </span>
          </div>

          {/* Categories — URL navigation ONLY (§8) */}
          {cats.length > 0 && !activeSearch && (
            <nav className="uvt-cats" aria-label={t.collectionLabel}>
              <Link href="/" className={`uvt-cat${!activeCategory ? ' is-active' : ''}`}>{t.all}</Link>
              {cats.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`?category=${cat.id}`}
                  className={`uvt-cat${activeCategory === String(cat.id) ? ' is-active' : ''}`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          )}

          {products.length === 0 ? (
            <div className="uvt-state">
              <Loupe size={54} color={BD} />
              <h2 style={{ marginTop: '1rem' }}>{t.noProducts}</h2>
              <p>{t.heroSubFallback}</p>
            </div>
          ) : (
            <div className="uvt-grid">
              {products.map((p: any, i: number) => {
                const old = Number(p.priceOriginal || 0);
                const now = Number(p.price || 0);
                const discount = old > now && old > 0 ? Math.round(((old - now) / old) * 100) : 0;
                return (
                  <div key={p.id} style={{ animation: 'fadeUp .5s ease both', animationDelay: `${Math.min(i, 8) * 0.06}s` }}>
                    <Card
                      product={p}
                      displayImage={pickImg(p)}
                      discount={discount}
                      store={store}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {countPage > 1 && (
            <nav className="uvt-pager" aria-label="pagination">
              {current > 1 && (
                <Link href={{ query: buildQuery(current - 1) }} scroll={false}>
                  <ChevronLeft size={16} style={{ transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
                </Link>
              )}
              {Array.from({ length: countPage }).map((_, i) => (
                <Link
                  key={i}
                  href={{ query: buildQuery(i + 1) }}
                  scroll={false}
                  className={current === i + 1 ? 'is-active' : ''}
                >
                  {i + 1}
                </Link>
              ))}
              {current < countPage && (
                <Link href={{ query: buildQuery(current + 1) }} scroll={false}>
                  <ChevronRight size={16} style={{ transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}

/* ===========================================================================
 *  PRODUCT FORM — order / add-to-cart
 *  §10 contract: getLiv() with String()+Number() coercion, visible delivery
 *  row, priceLivraison as its own payload field, no validate() in addToCart,
 *  cancel button, summary rendered AFTER fields and BEFORE buttons (§15.24).
 * =========================================================================*/

export function ProductForm({
  product, store: storeprop, userId, domain,
  selectedOffer, setSelectedOffer, selectedVariants, platform,
}: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

  const currency = store?.currency || 'DA';
  const showCart = store?.cart !== false;
  const uid = userId || store?.userId || store?.user?.id || product?.store?.userId;

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    customerEmail: '', customerWhatsapp: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOrderNow, setIsOrderNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiErr, setApiErr] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => { if (uid) fetchWilayas(uid).then(setWilayas); }, [uid]);

  useEffect(() => {
    try {
      const c = localStorage.getItem('customerId');
      if (c) setFd((p) => ({ ...p, customerId: c }));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  /* ---- pricing ---- */
  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const getVarId = () => {
    const d = product?.variantDetails?.find((v: VariantDetail) => variantMatches(v, selectedVariants || {}));
    return d ? d.id : null;
  };

  const getFP = (): number => {
    if (selectedOffer) {
      const off = product?.offers?.find((x: Offer) => x.id === selectedOffer);
      if (off) return Number(off.price);
    }
    const d = product?.variantDetails?.find((v: VariantDetail) => variantMatches(v, selectedVariants || {}));
    if (d && Number(d.price) !== -1) return Number(d.price);
    return Number(product?.price || 0);
  };

  const fp = getFP();
  const supportQty = (store?.supportQty ?? product?.store?.supportQty) !== false;
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = product?.offers?.find((x: Offer) => x.id === selectedOffer);
  const orderFreeShipping = !!(product?.shippingFree || selOfferObj?.shippingFree ||
    (store?.supportFreeShipping && store?.freeShippingMinAmount != null && (fp * qty) >= Number(store.freeShippingMinAmount)));

  const getLiv = useCallback((): number => {
    if (product?.isDigital) return 0;
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping, product?.isDigital]);

  const total = (): number => fp * qty + getLiv();

  const set = (k: string, v: any) => {
    setFd((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.replace(/\s/g, ''))) e.customerPhone = t.errPhone;
    if (product?.isDigital) {
      if (contactMethod === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.customerEmail.trim())) e.customerEmail = t.errEmail;
      } else {
        if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerWhatsapp.trim())) e.customerWhatsapp = t.errWhatsapp;
      }
    } else {
      if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
      if (!fd.customerCommune) e.customerCommune = t.errCommune;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const basePayload = () => {
    const { customerWelaya, customerCommune, typeLivraison, priceLoss, customerEmail, customerWhatsapp, ...rest } = fd;
    const shippingOrContact = product?.isDigital
      ? (contactMethod === 'email' ? { customerEmail } : { customerWhatsapp })
      : { customerWelaya, customerCommune, typeLivraison, priceLoss };
    return {
      ...rest,
      ...shippingOrContact,
      quantity: qty,
      product,
      productId: product?.id,
      storeId: store?.id || product?.store?.id,
      userId: uid,
      variantDetailId: getVarId(),
      selectedOffer: selectedOffer || null,
      selectedVariants: selectedVariants || {},
      platform: platform || 'web',
      finalPrice: fp,
      totalPrice: total(),
      priceLivraison: getLiv(),
    };
  };

  /* ---- add to cart — NEVER validates (§15.14) ---- */
  const addToCart = () => {
    if (!domain) return;
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(arr) ? arr : [];
      list.push({ ...basePayload(), addedAt: Date.now() });
      localStorage.setItem(domain, JSON.stringify(list));
      initCount(list.length);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch { /* noop */ }
  };

  const submitOrder = async () => {
    setApiErr('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload()),
      });
      if (!r.ok) throw new Error('failed');
      const d = await r.json().catch(() => ({}));
      const cid = d?.customerId || d?.data?.customerId;
      if (cid) { try { localStorage.setItem('customerId', String(cid)); } catch { /* noop */ } }
      router.push(`/successfully?productId=${product?.id}`);
    } catch {
      setApiErr(t.errSubmit);
      setSubmitting(false);
    }
  };

  return (
    <div className="uvt-formcard">
      {/* quantity + unit price — always visible */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        {supportQty && !product?.isDigital && (
          <div>
            <span className="uvt-label" style={{ marginBottom: 6 }}>{t.qty}</span>
            <QtyCounter
              value={fd.quantity}
              onDec={() => set('quantity', Math.max(1, fd.quantity - 1))}
              onInc={() => set('quantity', fd.quantity + 1)}
            />
          </div>
        )}
        <div style={{ textAlign: 'end' }}>
          <span className="uvt-label" style={{ marginBottom: 6 }}>{t.price}</span>
          <p className="uvt-num" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>
            {fmt(fp * qty)} {currency}
          </p>
        </div>
      </div>

      <div style={{ margin: '1.1rem 0' }}><TickRail count={22} /></div>

      {(isOrderNow || product?.isDigital) && (
        <div style={{ animation: 'fadeUp .35s ease both' }}>
          <Field label={t.fullName} error={errors.customerName}>
            <input
              style={{ ...inputBase, ...(errors.customerName ? { borderColor: ERR } : {}) }}
              value={fd.customerName}
              onChange={(e) => set('customerName', e.target.value)}
              placeholder={t.fullNamePlaceholder}
            />
          </Field>

          <Field label={t.phone} error={errors.customerPhone}>
            <input
              type="tel"
              dir="ltr"
              className="uvt-num"
              style={{ ...inputBase, ...(errors.customerPhone ? { borderColor: ERR } : {}) }}
              value={fd.customerPhone}
              onChange={(e) => set('customerPhone', e.target.value)}
              placeholder={t.phonePlaceholder}
            />
          </Field>

          {product?.isDigital ? (
            <div style={{ marginBottom: '0.9rem' }}>
              <span className="uvt-label" style={{ marginBottom: 6, display: 'block' }}>{t.contactQuestion}</span>
              <div className="uvt-toggle" style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  className={contactMethod === 'email' ? 'is-active' : ''}
                  onClick={() => { setContactMethod('email'); setFd(p => ({ ...p, customerWhatsapp: '' })); }}
                >
                  <Mail size={15} /> {t.contactViaEmail}
                </button>
                <button
                  type="button"
                  className={contactMethod === 'whatsapp' ? 'is-active' : ''}
                  onClick={() => { setContactMethod('whatsapp'); setFd(p => ({ ...p, customerEmail: '' })); }}
                >
                  <MessageCircle size={15} /> {t.contactViaWhatsapp}
                </button>
              </div>
              {contactMethod === 'email' ? (
                <Field label={t.orderEmail} error={errors.customerEmail}>
                  <input
                    type="email"
                    dir="ltr"
                    className="uvt-num"
                    style={{ ...inputBase, ...(errors.customerEmail ? { borderColor: ERR } : {}) }}
                    value={fd.customerEmail}
                    onChange={(e) => set('customerEmail', e.target.value)}
                    placeholder={t.emailPh}
                  />
                </Field>
              ) : (
                <Field label={t.whatsapp} error={errors.customerWhatsapp}>
                  <input
                    type="tel"
                    dir="ltr"
                    className="uvt-num"
                    style={{ ...inputBase, ...(errors.customerWhatsapp ? { borderColor: ERR } : {}) }}
                    value={fd.customerWhatsapp}
                    onChange={(e) => set('customerWhatsapp', e.target.value)}
                    placeholder={t.whatsappPh}
                  />
                </Field>
              )}
            </div>
          ) : (
            <>
              <div className="uvt-row2">
                <Field label={t.wilaya} error={errors.customerWelaya}>
                  <SelectWrap>
                    <select
                      disabled={wilayas.length === 0}
                      style={{ ...inputBase, paddingInlineEnd: 36, ...(errors.customerWelaya ? { borderColor: ERR } : {}) }}
                      value={fd.customerWelaya}
                      onChange={(e) => { set('customerWelaya', e.target.value); set('customerCommune', ''); }}
                    >
                      <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                      {wilayas.map((w) => (
                        <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                      ))}
                    </select>
                  </SelectWrap>
                </Field>

                <Field label={t.commune} error={errors.customerCommune}>
                  <SelectWrap>
                    <select
                      disabled={!fd.customerWelaya || loadingC}
                      style={{ ...inputBase, paddingInlineEnd: 36, ...(errors.customerCommune ? { borderColor: ERR } : {}) }}
                      value={fd.customerCommune}
                      onChange={(e) => set('customerCommune', e.target.value)}
                    >
                      <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                      {communes.map((c) => (
                        <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                      ))}
                    </select>
                  </SelectWrap>
                </Field>
              </div>

              <Field label={t.deliveryType}>
                <div className="uvt-toggle">
                  <button
                    type="button"
                    className={fd.typeLivraison === 'home' ? 'is-active' : ''}
                    onClick={() => set('typeLivraison', 'home')}
                  >
                    <Truck size={15} /> {t.deliveryHome}
                  </button>
                  <button
                    type="button"
                    className={fd.typeLivraison === 'office' ? 'is-active' : ''}
                    onClick={() => set('typeLivraison', 'office')}
                  >
                    <MapPin size={15} /> {t.deliveryOffice}
                  </button>
                </div>
              </Field>
            </>
          )}

          {/* summary AFTER fields, BEFORE buttons (§15.24) */}
          <div className="uvt-summary">
            <p className="uvt-label" style={{ margin: 0 }}>{t.orderSummary}</p>
            <SummaryRow l={t.price} v={`${fmt(fp)} ${currency}`} />
            <SummaryRow l={t.qty} v={`× ${qty}`} />
            {!product?.isDigital && (
              <SummaryRow l={t.delivery} v={!selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${fmt(getLiv())} ${currency}`} />
            )}
            <div className="uvt-sumtotal">
              <SummaryRow l={t.total} v={`${fmt(total())} ${currency}`} strong />
            </div>
          </div>

          {apiErr && (
            <p className="uvt-err" style={{ marginBottom: '.75rem' }}>
              <AlertCircle size={12} /> {apiErr}
            </p>
          )}

          <div className="uvt-btnrow is-two">
            <button type="button" style={btnAmber} onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            {!product?.isDigital && (
              <button type="button" style={btnGhost} onClick={() => setIsOrderNow(false)} disabled={submitting}>
                {t.cancel}
              </button>
            )}
          </div>
        </div>
      )}

      {!isOrderNow && !product?.isDigital && (
        <div className="uvt-btnrow">
          <button type="button" style={btnPrimary} onClick={() => setIsOrderNow(true)}>
            {t.orderNow}
            <ArrowRight size={15} style={{ transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
          </button>
          {showCart && (
            <button type="button" style={btnGhost} onClick={addToCart}>
              {added ? <CheckCircle2 size={15} color={A} /> : <ShoppingBag size={15} />}
              {added ? t.cart : t.addToCart}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ===========================================================================
 *  DETAILS — gallery + offers + attributes + form
 * =========================================================================*/

export function Details({
  product, store: storeprop, discount, allImages, allAttrs, finalPrice,
  selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain,
}: any) {
  const store = storeprop || product?.store;
  const t = T[getLang(store)];
  const currency = store?.currency || 'DA';

  const images: any[] = (allImages && allImages.length ? allImages : (product?.imagesProduct || []));
  const flat: string[] = images
    .map((im: any) => (typeof im === 'string' ? im : im?.imageUrl))
    .filter(Boolean);
  if (product?.productImage && !flat.includes(product.productImage)) flat.unshift(product.productImage);

  const [sel, setSel] = useState(0);
  const [imgErr, setImgErr] = useState<Record<number, boolean>>({});
  const attrs: Attribute[] = allAttrs && allAttrs.length ? allAttrs : (product?.attributes || []);
  const old = Number(product?.priceOriginal || 0);
  const price = Number(finalPrice ?? product?.price ?? 0);

  const step = (d: number) => {
    if (!flat.length) return;
    setSel((p) => (p + d + flat.length) % flat.length);
  };

  return (
    <div className="uvt-wrap">
      <div className="uvt-details">
        {/* ---- gallery ---- */}
        <div>
          <div className="uvt-gal-main">
            {flat.length > 0 && !imgErr[sel] ? (
              <img
                key={sel}
                src={flat[sel]}
                alt={product?.name}
                onError={() => setImgErr((p) => ({ ...p, [sel]: true }))}
              />
            ) : (
              <Loupe size={64} color={BD} />
            )}

            {discount > 0 && (
              <span
                className="uvt-num"
                style={{
                  position: 'absolute', top: 12, insetInlineStart: 12, background: A, color: '#fff',
                  fontSize: '.72rem', fontWeight: 800, padding: '5px 10px', letterSpacing: '.06em',
                }}
              >
                &minus;{discount}%
              </span>
            )}

            {flat.length > 1 && (
              <>
                <button className="uvt-gal-nav" style={{ insetInlineStart: 10 }} onClick={() => step(-1)} aria-label={t.prev}>
                  <ChevronLeft size={17} style={{ transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
                </button>
                <button className="uvt-gal-nav" style={{ insetInlineEnd: 10 }} onClick={() => step(1)} aria-label={t.next}>
                  <ChevronRight size={17} style={{ transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
                </button>
              </>
            )}
          </div>

          {flat.length > 1 && (
            <div className="uvt-thumbs">
              {flat.map((im, i) => (
                <button
                  key={i}
                  className={`uvt-thumb${sel === i ? ' is-active' : ''}`}
                  onClick={() => setSel(i)}
                  aria-label={`${i + 1}`}
                >
                  <img src={im} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- info ---- */}
        <div>
          <span className="uvt-eyebrow">{product?.category?.name || t.collectionLabel}</span>
          <h1 className="uvt-dtitle">{product?.name}</h1>

          <div className="uvt-stars" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill={A} strokeWidth={0} />)}
          </div>

          <div className="uvt-pricebox">
            <b className="uvt-num">{fmt(price)} {currency}</b>
            {old > price && <span className="uvt-price-old uvt-num" style={{ fontSize: '.95rem' }}>{fmt(old)} {currency}</span>}
          </div>

          {(product?.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
            <div style={{ marginBottom: '1.4rem', padding: '10px 14px', border: `1px solid ${A}`, background: AL, fontSize: '.85rem', fontWeight: 700, color: A }}>
              🚚 {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', `${fmt(Number(store.freeShippingMinAmount))} ${currency}`)}
            </div>
          )}

          {product?.offers?.length > 0 && (
            <div style={{ marginBottom: '1.4rem' }}>
              <p className="uvt-label">{t.offersTitle}</p>
              <div className="uvt-offers">
                {product.offers.map((o: Offer) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`uvt-offer${selectedOffer === o.id ? ' is-active' : ''}`}
                    onClick={() => setSelectedOffer(selectedOffer === o.id ? null : o.id)}
                  >
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 600, fontSize: '.88rem' }}>
                        {o.name} <span className="uvt-num" style={{ color: SUB }}>× {o.quantity}</span>
                      </span>
                      {o.subTitle && <span style={{ fontSize: '.76rem', color: SUB }}>{o.subTitle}</span>}
                      {o.shippingFree && <span style={{ fontSize: '.76rem', color: A, fontWeight: 700 }}>🚚 {t.freeShippingBadge}</span>}
                    </span>
                    <span className="uvt-num" style={{ fontWeight: 800, color: A, whiteSpace: 'nowrap' }}>
                      {fmt(o.price)} {currency}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {attrs.map((attr) => (
            <div key={attr.id} style={{ marginBottom: '1.2rem' }}>
              <p className="uvt-label">{attr.name}</p>
              <div className="uvt-attrs">
                {attr.variants?.map((v) => {
                  const active = selectedVariants?.[attr.name] === v.value;
                  const mode = attr.displayMode || 'text';
                  const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                    Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                      ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                    )
                  );
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`uvt-swatch${active ? ' is-active' : ''}`}
                      onClick={() => available && handleVariantSelection(attr.name, v.value)}
                      aria-label={v.value}
                      style={
                        mode === 'color'
                          ? { background: v.value, width: 44, height: 44, padding: 0, cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35 }
                          : mode === 'image'
                            ? { padding: 0, width: 52, height: 52, overflow: 'hidden', cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35 }
                            : { cursor: available ? 'pointer' : 'not-allowed', color: available ? undefined : '#bbb', textDecoration: available ? 'none' : 'line-through' }
                      }
                    >
                      {mode === 'image' ? <img src={v.value} alt="" /> : mode === 'color' ? null : v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <ProductForm
            product={product}
            store={store}
            userId={store?.userId || store?.user?.id || product?.store?.userId}
            domain={domain}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
            platform="web"
          />
        </div>
      </div>

      {product?.desc && (
        <section style={{ paddingBottom: '3.5rem' }}>
          <TickRail count={40} />
          <h2 style={{ fontSize: '1.15rem', margin: '1.75rem 0 1rem' }}>{t.descTitle}</h2>
          <div className="uvt-desc" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }} />
        </section>
      )}
    </div>
  );
}

/* ===========================================================================
 *  CART — full cart page (single shared shipment)
 * =========================================================================*/

export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DA';
  const initCount = useCartStore((s: any) => s.initCount);

  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiErr, setApiErr] = useState('');
  const [done, setDone] = useState(false);

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(arr) ? arr : []);
      const c = localStorage.getItem('customerId');
      if (c) setFd((p) => ({ ...p, customerId: c }));
    } catch { setItems([]); }
  }, [domain]);

  useEffect(() => {
    if (store?.user?.id) fetchWilayas(store.user.id).then(setWilayas);
    else if (store?.userId) fetchWilayas(store.userId).then(setWilayas);
  }, [store]);

  useEffect(() => {
    if (!fd.customerWelaya) { setCommunes([]); return; }
    setLoadingC(true);
    fetchCommunes(fd.customerWelaya).then((d) => { setCommunes(d); setLoadingC(false); });
  }, [fd.customerWelaya]);

  const selW = wilayas.find((w) => String(w.id) === String(fd.customerWelaya));

  const cartTotal = items.reduce(
    (s, it) => s + Number(it.finalPrice || it.product?.price || 0) * Number(it.quantity || 1),
    0,
  );

  const hasFreeShippingItem = items.some((it) => it.product?.shippingFree || it.product?.offers?.find((o: Offer) => o.id === it.selectedOffer)?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;

  const getLiv = useCallback((): number => {
    if (freeShippingReached) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison, freeShippingReached]);

  const finalTotal = cartTotal + getLiv();

  const set = (k: string, v: any) => {
    setFd((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const removeItem = (i: number) => {
    const next = items.filter((_, idx) => idx !== i);
    setItems(next);
    try { localStorage.setItem(domain, JSON.stringify(next)); } catch { /* noop */ }
    initCount(next.length);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fd.customerName || fd.customerName.trim().length < 3) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone.replace(/\s/g, ''))) e.customerPhone = t.errPhone;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = async () => {
    setApiErr('');
    if (!validate() || items.length === 0) return;
    setSubmitting(true);
    try {
      const payload = items.map((it) => ({
        ...fd,
        quantity: Number(it.quantity || 1),
        product: it.product,
        productId: it.productId || it.product?.id,
        storeId: it.storeId || store?.id,
        userId: it.userId || store?.user?.id || store?.userId,
        variantDetailId: it.variantDetailId ?? null,
        selectedOffer: it.selectedOffer ?? null,
        selectedVariants: it.selectedVariants ?? {},
        platform: it.platform || 'web',
        finalPrice: Number(it.finalPrice || it.product?.price || 0),
        totalPrice: Number(it.finalPrice || it.product?.price || 0) * Number(it.quantity || 1) + getLiv(),
        priceLivraison: getLiv(),
      }));

      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('failed');

      try { localStorage.removeItem(domain); } catch { /* noop */ }
      initCount(0);
      setItems([]);
      setDone(true);
      window.scrollTo(0, 0);
    } catch {
      setApiErr(t.errSubmit);
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="uvt-wrap">
        <div className="uvt-state">
          <CheckCircle2 size={56} color={A} strokeWidth={1.4} />
          <h2 style={{ marginTop: '1rem' }}>{t.successTitle}</h2>
          <p>{t.successDesc}</p>
          <Link href="/" style={{ ...btnPrimary, width: 'auto' }}>{t.backToShop}</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="uvt-wrap">
        <div className="uvt-state">
          <ShoppingBag size={52} color={BD} strokeWidth={1.3} />
          <h2 style={{ marginTop: '1rem' }}>{t.cartEmpty}</h2>
          <p>{t.cartEmptyDesc}</p>
          <Link href="/" style={{ ...btnPrimary, width: 'auto' }}>{t.shopNow}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="uvt-wrap">
      <div style={{ paddingTop: '2rem' }}>
        <span className="uvt-eyebrow">{items.length} {t.items}</span>
        <h1 style={{ fontSize: 'clamp(1.5rem,3.6vw,2.2rem)', margin: '.5rem 0 1rem' }}>{t.myCart}</h1>
        <TickRail count={40} />
        {freeShippingMin != null && (
          <div style={{
            border: `1px solid ${freeShippingReached ? A : BD}`, background: freeShippingReached ? AL : 'transparent',
            padding: '12px 16px', margin: '1rem 0', color: freeShippingReached ? A : SUB, fontSize: '.85rem', fontWeight: 700,
          }}>
            {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', `${fmt(Number(freeShippingRemainingAmt))} ${currency}`)}
          </div>
        )}
      </div>

      <div className="uvt-cartgrid">
        {/* ---- items ---- */}
        <div>
          {items.map((it, i) => {
            const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
            const unit = Number(it.finalPrice || it.product?.price || 0);
            return (
              <div className="uvt-citem" key={`${it.productId || i}-${i}`}>
                <span className="uvt-citem-img">
                  {img ? <img src={img} alt={it.product?.name || ''} /> : <Glasses size={22} color={BD} />}
                </span>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '.9rem', lineHeight: 1.5 }}>
                      {it.product?.name}
                    </p>
                    <button className="uvt-trash" onClick={() => removeItem(i)} aria-label={t.remove}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span className="uvt-num" style={{ fontSize: '.78rem', color: SUB }}>
                      {fmt(unit)} {currency} × {it.quantity || 1}
                    </span>
                    <span className="uvt-num" style={{ fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {fmt(unit * Number(it.quantity || 1))} {currency}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---- checkout ---- */}
        <div className="uvt-sticky">
          <div className="uvt-formcard">
            <Field label={t.fullName} error={errors.customerName}>
              <input
                style={{ ...inputBase, ...(errors.customerName ? { borderColor: ERR } : {}) }}
                value={fd.customerName}
                onChange={(e) => set('customerName', e.target.value)}
                placeholder={t.fullNamePlaceholder}
              />
            </Field>

            <Field label={t.phone} error={errors.customerPhone}>
              <input
                type="tel"
                dir="ltr"
                className="uvt-num"
                style={{ ...inputBase, ...(errors.customerPhone ? { borderColor: ERR } : {}) }}
                value={fd.customerPhone}
                onChange={(e) => set('customerPhone', e.target.value)}
                placeholder={t.phonePlaceholder}
              />
            </Field>

            <div className="uvt-row2">
              <Field label={t.wilaya} error={errors.customerWelaya}>
                <SelectWrap>
                  <select
                    disabled={wilayas.length === 0}
                    style={{ ...inputBase, paddingInlineEnd: 36, ...(errors.customerWelaya ? { borderColor: ERR } : {}) }}
                    value={fd.customerWelaya}
                    onChange={(e) => { set('customerWelaya', e.target.value); set('customerCommune', ''); }}
                  >
                    <option value="">{wilayas.length === 0 ? t.wilayaUnavailable : t.wilayaPlaceholder}</option>
                    {wilayas.map((w) => (
                      <option key={w.id} value={w.id}>{w.id} - {t.dir === 'rtl' ? w.ar_name : w.name}</option>
                    ))}
                  </select>
                </SelectWrap>
              </Field>

              <Field label={t.commune} error={errors.customerCommune}>
                <SelectWrap>
                  <select
                    disabled={!fd.customerWelaya || loadingC}
                    style={{ ...inputBase, paddingInlineEnd: 36, ...(errors.customerCommune ? { borderColor: ERR } : {}) }}
                    value={fd.customerCommune}
                    onChange={(e) => set('customerCommune', e.target.value)}
                  >
                    <option value="">{loadingC ? t.communeLoading : t.communePlaceholder}</option>
                    {communes.map((c) => (
                      <option key={c.id} value={c.id}>{t.dir === 'rtl' ? c.ar_name : c.name}</option>
                    ))}
                  </select>
                </SelectWrap>
              </Field>
            </div>

            <Field label={t.deliveryType}>
              <div className="uvt-toggle">
                <button
                  type="button"
                  className={fd.typeLivraison === 'home' ? 'is-active' : ''}
                  onClick={() => set('typeLivraison', 'home')}
                >
                  <Truck size={15} /> {t.deliveryHome}
                </button>
                <button
                  type="button"
                  className={fd.typeLivraison === 'office' ? 'is-active' : ''}
                  onClick={() => set('typeLivraison', 'office')}
                >
                  <MapPin size={15} /> {t.deliveryOffice}
                </button>
              </div>
            </Field>

            <div className="uvt-summary">
              <p className="uvt-label" style={{ margin: 0 }}>{t.orderSummary}</p>
              <SummaryRow l={t.subtotal} v={`${fmt(cartTotal)} ${currency}`} />
              <SummaryRow l={t.delivery} v={!selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${fmt(getLiv())} ${currency}`} />
              <div className="uvt-sumtotal">
                <SummaryRow l={t.total} v={`${fmt(finalTotal)} ${currency}`} strong />
              </div>
            </div>

            {apiErr && (
              <p className="uvt-err" style={{ marginBottom: '.75rem' }}>
                <AlertCircle size={12} /> {apiErr}
              </p>
            )}

            <button type="button" style={btnAmber} onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
 *  SUCCESS
 * =========================================================================*/

export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const stepIcons = [CheckCircle2, Phone, ShieldCheck, Truck];

  return (
    <div className="uvt-wrap" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <div className="uvt-state" style={{ maxWidth: 560 }}>
        <CheckCircle2 size={56} color={A} strokeWidth={1.4} />
        <h2 style={{ marginTop: '1rem' }}>{t.successTitle}</h2>
        <p>{t.successDesc}</p>
      </div>

      <TickRail count={40} />

      {order && (order.productName || order.total != null) && (
        <div style={{ maxWidth: 420, margin: '2rem auto 0', border: `1px solid ${BD}`, background: CARD, padding: '1.25rem 1.5rem' }}>
          {order.productName && (
            <p style={{ fontSize: '0.9rem', color: INK, fontWeight: 600, marginBottom: order.total != null ? 12 : 0 }}>
              {order.productName}
            </p>
          )}
          {order.total != null && <SummaryRow l={t.total} v={`${fmt(order.total)} ${currency}`} strong />}
        </div>
      )}

      <div style={{ maxWidth: 420, margin: '2rem auto 0' }}>
        {t.successSteps.map((step, i) => {
          const Icon = stepIcons[i] ?? CheckCircle2;
          const done = i === 0;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '1rem 0',
                borderBottom: i < t.successSteps.length - 1 ? `1px solid ${BD}` : 'none',
              }}
            >
              <div style={{
                width: 34, height: 34, flexShrink: 0, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? INK : 'transparent', border: `1px solid ${done ? INK : BD}`,
                color: done ? '#fff' : SUB,
              }}>
                <Icon size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: done ? INK : SUB, marginBottom: 2 }}>{step.title}</p>
                <p style={{ fontSize: '0.8rem', color: SUB, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth: 420, margin: '2.5rem auto 0', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        <Link href="/" style={btnPrimary}>{t.shopNow}</Link>
        <Link href="/" style={btnGhost}>{t.backToShop}</Link>
      </div>
    </div>
  );
}

/* ===========================================================================
 *  STATIC PAGES
 * =========================================================================*/

function Shell({ title, eyebrow, children }: any) {
  return (
    <>
      <div className="uvt-phead">
        <div className="uvt-wrap">
          <span className="uvt-eyebrow">{eyebrow}</span>
          <h1 style={{ marginTop: '.6rem' }}>{title}</h1>
        </div>
        <div className="uvt-wrap" style={{ marginTop: '1.75rem' }}>
          <TickRail count={40} tone="rgba(255,255,255,.2)" />
        </div>
      </div>
      <div className="uvt-wrap" style={{ paddingBottom: '3.5rem' }}>{children}</div>
    </>
  );
}

type Block = { title: string; body: string };

function InfoBlock({ title, body }: Block) {
  return (
    <div className="uvt-block">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacyTitle} eyebrow={t.heroEyebrow}>
      {(t.privacyBlocks as readonly Block[]).map((b) => <InfoBlock key={b.title} title={b.title} body={b.body} />)}
    </Shell>
  );
}

export function Terms({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.termsTitle} eyebrow={t.heroEyebrow}>
      {(t.termsBlocks as readonly Block[]).map((b) => <InfoBlock key={b.title} title={b.title} body={b.body} />)}
    </Shell>
  );
}

export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookiesTitle} eyebrow={t.heroEyebrow}>
      {(t.cookiesBlocks as readonly Block[]).map((b) => <InfoBlock key={b.title} title={b.title} body={b.body} />)}
    </Shell>
  );
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const send = async () => {
    setErr('');
    if (form.name.trim().length < 3 || !form.message.trim()) { setErr(t.errName); return; }
    setSending(true);
    try {
      const r = await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      if (!r.ok) throw new Error('failed');
      setSent(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch { setErr(t.errSubmit); }
    setSending(false);
  };

  return (
    <Shell title={t.contactTitle} eyebrow={t.heroEyebrow}>
      <div className="uvt-contact">
        <div>
          <p className="uvt-fhead" style={{ color: A }}>{t.contactInfo}</p>
          {store?.contact?.phone && (
            <a href={`tel:${store.contact.phone}`} className="uvt-cinfo">
              <Phone size={17} color={A} style={{ marginTop: 3, flexShrink: 0 }} />
              <span><b>{t.phone}</b><span className="uvt-num">{store.contact.phone}</span></span>
            </a>
          )}
          {store?.contact?.email && (
            <a href={`mailto:${store.contact.email}`} className="uvt-cinfo">
              <Mail size={17} color={A} style={{ marginTop: 3, flexShrink: 0 }} />
              <span><b>{t.yourEmail}</b><span style={{ wordBreak: 'break-all' }}>{store.contact.email}</span></span>
            </a>
          )}
          {(store?.contact?.wilaya || store?.contact?.address) && (
            <p className="uvt-cinfo">
              <MapPin size={17} color={A} style={{ marginTop: 3, flexShrink: 0 }} />
              <span>
                <b>{t.wilaya}</b>
                <span>{[store?.contact?.wilaya, store?.contact?.address].filter(Boolean).join(' — ')}</span>
              </span>
            </p>
          )}
          <div style={{ marginTop: '2rem', display: 'flex', gap: 12, color: BD }}>
            <Glasses size={22} /><Watch size={22} />
          </div>
        </div>

        <div className="uvt-formcard">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={48} color={A} strokeWidth={1.4} />
              <h3 style={{ margin: '1rem 0 .5rem' }}>{t.sentTitle}</h3>
              <p style={{ color: SUB, marginBottom: '1.5rem' }}>{t.sentDesc}</p>
              <button type="button" style={btnGhost} onClick={() => setSent(false)}>{t.sendAnother}</button>
            </div>
          ) : (
            <>
              <div className="uvt-row2">
                <Field label={t.yourName}>
                  <input style={inputBase} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t.fullNamePlaceholder} />
                </Field>
                <Field label={t.phone}>
                  <input type="tel" dir="ltr" className="uvt-num" style={inputBase} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder={t.phonePlaceholder} />
                </Field>
              </div>

              <Field label={t.yourEmail}>
                <input type="email" dir="ltr" style={inputBase} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@mail.com" />
              </Field>

              <Field label={t.yourMessage} error={err}>
                <textarea
                  rows={5}
                  style={{ ...inputBase, resize: 'none', minHeight: 130 }}
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder={t.messagePlaceholder}
                />
              </Field>

              <button type="button" style={btnPrimary} onClick={send} disabled={sending}>
                {sending ? t.sending : t.sendMessage} <Send size={15} />
              </button>
            </>
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