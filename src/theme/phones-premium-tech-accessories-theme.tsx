'use client';

/**
 * DESIGN BRIEF — phones-premium-tech-accessories-theme
 * Niche: إكسسوارات تقنية راقية (أغطية هواتف، شواحن، كابلات، حوامل)
 * Audience: 22-45، مستخدمو هواتف رائدة، يشترون قطعة صغيرة الحجم عالية التفاصيل، ويقارنون
 *           التوافق والمواصفات أكثر من "الإحساس". يتصفحون كتالوجاً واسعاً من قطع متشابهة الشكل.
 * Mood (3): دقيق (precise) — هندسي (engineered) — فخامة هادئة فاتحة (light quiet-luxury)
 * Navbar decision:  رَيل عمودي ثابت (fixed side rail) على الديسكتوب بعرض 84px يحمل الشعار
 *                   والتنقّل والسلة، + شريط علوي رفيع للبحث المضمّن. السبب: كتالوج الإكسسوارات
 *                   طويل ومتكرر بصرياً — التنقّل العمودي يحرّر الارتفاع كاملاً للشبكة ويعطي إحساس
 *                   "واجهة جهاز" لا "متجر". على الهاتف: شريط علوي + قائمة كاملة الشاشة.
 *                   (مختلف بنيوياً عن: مِسْتَهَد طباعي / كبسولة عائمة + شريط سفلي)
 * Hero decision:    شبكة bento من بلاطات زجاجية: بلاطة كبيرة للعنوان والـ CTA، وبلاطتان صغيرتان
 *                   للأرقام، وبلاطة توافق. الصورة (إن وُجدت) خلفية full-bleed مطلقة تحت البلاطات.
 *                   السبب: المنتج نفسه معياري/مركّب من قطع — التخطيط يعكس ذلك.
 * Card decision:    بطاقة "إطار": المنتج يطفو على لوح مطفي بـ objectFit:contain (صور الإكسسوارات
 *                   على خلفية بيضاء تُقصّ بشكل سيء مع cover)، شارة الخصم لسان عمودي على الحافة،
 *                   زر + دائري ظاهر دائماً يتداخل مع حافة اللوح، والتسلسل الهرمي **السعر أولاً**
 *                   ثم الاسم بحجم أصغر. (مختلف عن: بيانات تحت خط شعري / بيانات فوق الصورة)
 * Product decision: معرض مكدّس عمودياً على الديسكتوب (كل الصور تحت بعضها) وكاروسيل snap أفقي
 *                   بنقاط على الهاتف، + جدول مواصفات key/value، ولوحة شراء لاصقة.
 * Type: Space Grotesk + Cairo (display) · Inter + Cairo (body)
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import { useCartStore } from '@/store/useCartStore';
import {
  Search, ShoppingBag, Menu, X, ChevronLeft, ChevronRight, ChevronDown, LayoutGrid,
  Phone, Mail, MapPin, Star, Trash2, Minus, Plus, Check, AlertCircle, Home as HomeIcon,
  Truck, ShieldCheck, Headphones, Send, Smartphone, ArrowRight, BadgeCheck, CreditCard, Cable, Package,
} from 'lucide-react';

/* ============================ TOKENS ============================ */
const A = '#5B4BE0';
const AD = '#4737C2';
const AL = 'rgba(91,75,224,0.09)';
const BG = '#F2F3F6';
const CARD = '#FFFFFF';
const MATTE = '#EBEDF3';
const INK = '#0F1115';
const SUB = '#5F6672';
const BD = '#E2E5EB';
const ERR = '#D92D20';

const FD = "'Space Grotesk','Cairo',system-ui,sans-serif";
const FB = "'Inter','Cairo',system-ui,-apple-system,sans-serif";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ============================ TYPES ============================ */
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
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean; slug?: string; shippingFree?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; cart?: boolean; supportQty?: boolean; supportFreeShipping?: boolean; freeShippingMinAmount?: number | null; };
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
    home: 'الرئيسية', contact: 'تواصل معنا', cart: 'السلة', shop: 'المنتجات', menu: 'القائمة',
    search: 'ابحث عن إكسسوار...', searching: 'جاري البحث...', noResults: 'لا توجد نتائج',
    showAll: 'عرض كل النتائج',
    all: 'الكل', noProducts: 'لا توجد منتجات متاحة حالياً', shopNow: 'تصفّح المنتجات',
    ticker: 'إكسسوارات أصلية · شحن سريع لكل الولايات · الدفع عند الاستلام',
    tagline: 'إكسسوارات تقنية مختارة بعناية',
    heroEyebrow: 'مجموعة مختارة',
    heroTitle: 'تفاصيل تصنع الفرق',
    heroSub: 'أغطية، شواحن وكابلات مختارة بدقة — توافق مضمون وجودة تدوم.',
    bentoCompat: 'توافق مضمون', bentoCompatSub: 'نتحقق من موديل هاتفك قبل الإرسال',
    stats: [
      { n: '58', l: 'ولاية' },
      { n: '24h', l: 'تحضير' },
    ],
    trust: [
      { t: 'توصيل سريع', s: 'لكل الولايات' },
      { t: 'جودة مضمونة', s: 'منتجات أصلية 100%' },
      { t: 'دفع آمن', s: 'الدفع عند الاستلام' },
      { t: 'دعم 24/7', s: 'فريق متخصص للمساعدة' },
    ],
    collection: 'كل الإكسسوارات', product: 'منتج', viewProduct: 'عرض المنتج',
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
    orderInfo: 'معلومات الطلب',
    successSteps: [
      { title: 'تم استلام طلبك', desc: 'تم تسجيل طلبك بنجاح في نظامنا' },
      { title: 'تأكيد الطلب', desc: 'سنتصل بك خلال 24 ساعة' },
      { title: 'التجهيز والتغليف', desc: 'يتم تجهيز طلبك بعناية' },
      { title: 'الشحن والتوصيل', desc: '2-5 أيام عمل' },
    ],
    cartEmpty: 'السلة فارغة', cartEmptyDesc: 'لم تتم إضافة أي منتجات بعد.',
    myCart: 'سلتي', subtotal: 'المجموع الفرعي', items: 'عنصر', remove: 'حذف',
    errSubmit: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.',
    errName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errWilaya: 'اختر الولاية', errCommune: 'اختر البلدية',
    privacyTitle: 'سياسة الخصوصية', termsTitle: 'الشروط والأحكام',
    cookiesTitle: 'سياسة الكوكيز', contactTitle: 'تواصل معنا',
    offersTitle: 'العروض المتاحة', descTitle: 'الوصف', optionsTitle: 'الخيارات',
    freeShippingBadge: 'توصيل مجاني',
    freeShippingThreshold: 'توصيل مجاني عند الشراء بأكثر من {{amount}}',
    freeShippingRemaining: 'أضف {{amount}} لتحصل على توصيل مجاني',
    freeShippingReached: 'مبروك! لديك توصيل مجاني 🎉',
    specsTitle: 'المواصفات',
    specs: [
      { k: 'التوصيل', v: 'كل ولايات الوطن — من 2 إلى 5 أيام' },
      { k: 'الدفع', v: 'الدفع عند الاستلام' },
      { k: 'الضمان', v: 'استبدال فوري في حال عيب مصنعي' },
    ],
    stock: 'المتوفر', pieces: 'قطعة',
    searchResultsFor: 'نتائج البحث عن:', pageOf: 'الصفحة',
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
      { t: 'الطلب والتأكيد', b: 'يُعتبر الطلب مؤكداً بعد اتصال فريقنا بك للتحقق من موديل الهاتف وتفاصيل الطلب.' },
      { t: 'الأسعار والتوصيل', b: 'الأسعار بالدينار الجزائري، وسعر التوصيل يُحسب حسب الولاية ونوع التسليم المختار.' },
      { t: 'التوافق', b: 'يُرجى التأكد من موديل هاتفك قبل الطلب — نساعدك على ذلك عبر صفحة التواصل.' },
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
    home: 'Accueil', contact: 'Contact', cart: 'Panier', shop: 'Produits', menu: 'Menu',
    search: 'Rechercher un accessoire...', searching: 'Recherche...', noResults: 'Aucun résultat',
    showAll: 'Voir tous les résultats',
    all: 'Tout', noProducts: 'Aucun produit disponible pour le moment.', shopNow: 'Voir les produits',
    ticker: 'Accessoires authentiques · Livraison rapide · Paiement à la livraison',
    tagline: 'Accessoires tech sélectionnés avec soin',
    heroEyebrow: 'Sélection',
    heroTitle: 'Les détails font la différence',
    heroSub: 'Coques, chargeurs et câbles choisis avec précision — compatibilité garantie et qualité durable.',
    bentoCompat: 'Compatibilité garantie', bentoCompatSub: 'Nous vérifions votre modèle avant expédition',
    stats: [
      { n: '58', l: 'wilayas' },
      { n: '24h', l: 'préparation' },
    ],
    trust: [
      { t: 'Livraison Rapide', s: 'Partout en Algérie' },
      { t: 'Qualité Garantie', s: 'Produits authentiques' },
      { t: 'Paiement Sécurisé', s: 'Paiement à la livraison' },
      { t: 'Support 24/7', s: 'Toujours disponible' },
    ],
    collection: 'Tous les accessoires', product: 'produits', viewProduct: 'Voir le produit',
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
    orderInfo: 'Informations de commande',
    successSteps: [
      { title: 'Commande reçue', desc: 'Votre commande a été enregistrée avec succès' },
      { title: 'Confirmation', desc: 'Nous vous appellerons sous 24h' },
      { title: 'Préparation', desc: 'Votre commande est préparée avec soin' },
      { title: 'Livraison', desc: '2-5 jours ouvrables' },
    ],
    cartEmpty: 'Votre panier est vide', cartEmptyDesc: 'Découvrez notre sélection.',
    myCart: 'Mon Panier', subtotal: 'Sous-total', items: 'article(s)', remove: 'Retirer',
    errSubmit: 'Une erreur est survenue. Veuillez réessayer.',
    errName: 'Nom complet requis (3 caractères minimum)',
    errPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errWilaya: 'Veuillez choisir une wilaya', errCommune: 'Veuillez choisir une commune',
    privacyTitle: 'Politique de confidentialité', termsTitle: 'Conditions générales',
    cookiesTitle: 'Politique des cookies', contactTitle: 'Nous contacter',
    offersTitle: 'Offres groupées', descTitle: 'Description', optionsTitle: 'Options',
    freeShippingBadge: 'Livraison gratuite',
    freeShippingThreshold: 'Livraison gratuite à partir de {{amount}}',
    freeShippingRemaining: 'Ajoutez {{amount}} pour bénéficier de la livraison gratuite',
    freeShippingReached: 'Bravo ! Vous avez la livraison gratuite 🎉',
    specsTitle: 'Caractéristiques',
    specs: [
      { k: 'Livraison', v: 'Toutes les wilayas — 2 à 5 jours' },
      { k: 'Paiement', v: 'Paiement à la livraison' },
      { k: 'Garantie', v: 'Échange immédiat en cas de défaut' },
    ],
    stock: 'En stock', pieces: 'pièce(s)',
    searchResultsFor: 'Résultats pour :', pageOf: 'Page',
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
      { t: 'Commande', b: 'La commande est confirmée après un appel pour vérifier le modèle de votre téléphone et les détails.' },
      { t: 'Prix et livraison', b: 'Les prix sont en dinar algérien ; les frais de livraison dépendent de la wilaya et du mode choisi.' },
      { t: 'Compatibilité', b: 'Vérifiez le modèle de votre téléphone avant de commander — nous vous aidons via la page contact.' },
      { t: 'Annulation', b: 'La commande peut être annulée gratuitement avant remise au transporteur.' },
    ],
    pCookies: [
      { t: 'Définition', b: 'Petits fichiers enregistrés par votre navigateur pour mémoriser le panier et vos préférences.' },
      { t: 'Cookies essentiels', b: 'Ils conservent le contenu du panier ; les désactiver empêche l’achat.' },
      { t: 'Mesure d’audience', b: 'Ils nous aident à comprendre les pages les plus consultées pour améliorer la boutique.' },
      { t: 'Contrôle', b: 'Vous pouvez supprimer les cookies depuis les réglages de votre navigateur.' },
    ],
  },
  en: {
    dir: 'ltr' as const,
    home: 'Home', contact: 'Contact', cart: 'Cart', shop: 'Products', menu: 'Menu',
    search: 'Search accessories...', searching: 'Searching...', noResults: 'No results found',
    showAll: 'Show all results',
    all: 'All', noProducts: 'No products available at the moment.', shopNow: 'Browse products',
    ticker: 'Authentic accessories · Fast nationwide shipping · Cash on delivery',
    tagline: 'Carefully selected tech accessories',
    heroEyebrow: 'Curated selection',
    heroTitle: 'Details make the difference',
    heroSub: 'Cases, chargers and cables chosen with precision — guaranteed fit and lasting quality.',
    bentoCompat: 'Guaranteed compatibility', bentoCompatSub: 'We verify your phone model before shipping',
    stats: [
      { n: '58', l: 'wilayas' },
      { n: '24h', l: 'order prep' },
    ],
    trust: [
      { t: 'Fast Delivery', s: 'Across all wilayas' },
      { t: 'Quality Guaranteed', s: '100% authentic products' },
      { t: 'Secure Payment', s: 'Cash on delivery' },
      { t: '24/7 Support', s: 'Expert team always here' },
    ],
    collection: 'All accessories', product: 'products', viewProduct: 'View product',
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
    orderInfo: 'Order Info',
    successSteps: [
      { title: 'Order received', desc: 'Your order has been registered successfully' },
      { title: 'Confirmation', desc: "We'll call you within 24 hours" },
      { title: 'Packaging', desc: 'Your order is being prepared with care' },
      { title: 'Shipping', desc: '2-5 business days' },
    ],
    cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Start shopping now.',
    myCart: 'My Cart', subtotal: 'Subtotal', items: 'item(s)', remove: 'Remove',
    errSubmit: 'An error occurred. Please try again.',
    errName: 'Full name is required (at least 3 characters)',
    errPhone: 'Valid Algerian phone number required (e.g. 0550123456)',
    errWilaya: 'Please select a wilaya', errCommune: 'Please select a commune',
    privacyTitle: 'Privacy Policy', termsTitle: 'Terms & Conditions',
    cookiesTitle: 'Cookie Policy', contactTitle: 'Contact Us',
    offersTitle: 'Available Offers', descTitle: 'Description', optionsTitle: 'Options',
    freeShippingBadge: 'Free Delivery',
    freeShippingThreshold: 'Free delivery on orders over {{amount}}',
    freeShippingRemaining: 'Add {{amount}} more to get free delivery',
    freeShippingReached: 'Congrats! You have free delivery 🎉',
    specsTitle: 'Specifications',
    specs: [
      { k: 'Delivery', v: 'All wilayas — 2 to 5 days' },
      { k: 'Payment', v: 'Cash on delivery' },
      { k: 'Warranty', v: 'Instant replacement on manufacturing defects' },
    ],
    stock: 'In stock', pieces: 'pcs',
    searchResultsFor: 'Results for:', pageOf: 'Page',
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
      { t: 'Orders', b: 'An order is confirmed once our team calls you to verify your phone model and order details.' },
      { t: 'Prices & delivery', b: 'Prices are in Algerian dinar; delivery cost depends on the wilaya and the chosen method.' },
      { t: 'Compatibility', b: 'Please confirm your phone model before ordering — we can help via the contact page.' },
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

const fmt = (n: number): string => Number(n || 0).toLocaleString('en-US').replace(/,/g, ' ');
const cur = (store?: any): string => store?.currency || 'DA';

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
  width: '100%', padding: '0.78rem 0.95rem', fontSize: '0.9rem', minHeight: 46,
  border: `1px solid ${BD}`, borderRadius: 10, background: BG, color: INK,
  outline: 'none', appearance: 'none', transition: 'border-color .2s, box-shadow .2s',
  fontFamily: 'inherit',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
  padding: '0.9rem 1.5rem', minHeight: 48, background: A, color: '#FFFFFF',
  fontWeight: 600, fontSize: '0.88rem',
  border: `1px solid ${A}`, borderRadius: 10, cursor: 'pointer', fontFamily: FB,
  transition: 'background .2s, transform .15s, box-shadow .25s', textDecoration: 'none', width: '100%',
};
const btnGhost: React.CSSProperties = {
  ...btnPrimary, background: CARD, color: INK, border: `1px solid ${BD}`,
};
const label: React.CSSProperties = {
  display: 'block', fontSize: '0.74rem', color: SUB, marginBottom: 6, fontWeight: 500,
};
const eyebrow: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', letterSpacing: '0.12em',
  textTransform: 'uppercase', color: A, fontWeight: 700,
};

/* ============================ CSS ============================ */
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Cairo:wght@400;600;700;900&display=swap');

.tk-root, .tk-root button, .tk-root input, .tk-root select, .tk-root textarea { font-family: ${FB}; }
.tk-root { background: ${BG}; color: ${INK}; }
.tk-root *, .tk-root *::before, .tk-root *::after { box-sizing: border-box; }
.tk-disp { font-family: ${FD}; font-weight: 600; letter-spacing: -0.015em; }
[dir="rtl"] .tk-disp { letter-spacing: 0; }
.tk-wrap { max-width: 1240px; margin: 0 auto; padding: 0 1rem; }
@media (min-width: 768px) { .tk-wrap { padding: 0 1.75rem; } }
@media (min-width: 1024px) { .tk-shell { padding-inline-start: 84px; } }

@keyframes tkUp { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform:none; } }
@keyframes tkIn { from { opacity:0; } to { opacity:1; } }
@keyframes tkPop { from { opacity:0; transform: scale(.94);} to { opacity:1; transform:none; } }
@keyframes tkSlide { from { opacity:0; transform: translateX(-16px);} to { opacity:1; transform:none; } }
@keyframes tkMq { from { transform: translateX(0);} to { transform: translateX(-50%);} }
@keyframes tkShim { 0% { background-position: -420px 0; } 100% { background-position: 420px 0; } }
@keyframes tkBadge { 0%{transform:scale(1)} 40%{transform:scale(1.42)} 70%{transform:scale(.9)} 100%{transform:scale(1)} }
@keyframes tkFloat { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-7px);} }

/* ---- ticker ---- */
.tk-ticker { background: ${INK}; color: #EDEEF2; overflow: hidden; height: 30px; display:flex; align-items:center; }
.tk-mq { display:inline-flex; white-space: nowrap; animation: tkMq 28s linear infinite; will-change: transform; }
.tk-mq span { padding: 0 34px; display:inline-flex; align-items:center; gap:8px; font-size:.68rem; font-weight:500; letter-spacing:.06em; }

/* ---- side rail (desktop) ---- */
.tk-rail { position: fixed; inset-inline-start: 0; top: 0; bottom: 0; width: 84px; z-index: 220; background:${CARD}; border-inline-end: 1px solid ${BD}; flex-direction: column; align-items:center; padding: 16px 0; gap: 8px; }
.tk-railmark { width:44px; height:44px; border-radius:14px; background:${INK}; display:grid; place-items:center; text-decoration:none; margin-bottom: 12px; flex-shrink:0; }
.tk-railitem { width:56px; padding: 10px 0; border-radius:14px; display:flex; flex-direction:column; align-items:center; gap:5px; color:${SUB}; text-decoration:none; font-size:.62rem; font-weight:600; background:transparent; border:none; cursor:pointer; font-family:inherit; transition: background .2s, color .2s; position:relative; }
.tk-railitem:hover { background:${MATTE}; color:${INK}; }
.tk-railitem.is-active { color:${A}; background:${AL}; }
.tk-railword { margin-top:auto; writing-mode: vertical-rl; text-orientation: mixed; font-family:${FD}; font-size:.78rem; letter-spacing:.22em; text-transform:uppercase; color:${SUB}; padding-bottom: 6px; }

/* ---- top bar ---- */
.tk-head { position: sticky; top: 0; z-index: 200; background:${BG}; }
.tk-topbar { display:flex; align-items:center; gap:10px; height:60px; border-bottom:1px solid ${BD}; background: rgba(242,243,246,.9); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.tk-tagline { display:none; flex:1; min-width:0; font-size:.78rem; color:${SUB}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tk-word { font-family:${FD}; font-size:1.02rem; font-weight:700; letter-spacing:-.01em; color:${INK}; text-decoration:none; white-space:nowrap; flex:1; text-align:center; }
.tk-ico { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; cursor:pointer; color:${INK}; position:relative; transition: background .2s, color .2s; text-decoration:none; flex-shrink:0; }
.tk-ico:hover { background:${MATTE}; color:${A}; }

/* ---- responsive show/hide ---- */
.tk-d { display:none; }
.tk-m { display:flex; }
@media (min-width: 1024px) {
  .tk-tagline { display:block !important; }
  .tk-d { display:flex !important; }
  .tk-m { display:none !important; }
}

/* ---- search ---- */
.tk-searchwrap { position:relative; width: 100%; max-width: 320px; flex-shrink:0; }
.tk-searchin { width:100%; height:40px; background:${CARD}; border:1px solid ${BD}; border-radius:10px; padding-inline: 36px 34px; font-size:.85rem; color:${INK}; outline:none; transition: border-color .22s, box-shadow .22s; }
.tk-searchin:focus { border-color:${A}; box-shadow: 0 0 0 3px ${AL}; }
.tk-drop { position:absolute; top: calc(100% + 8px); inset-inline-end:0; width:100%; min-width: 320px; background:${CARD}; border:1px solid ${BD}; border-radius:14px; box-shadow: 0 20px 46px rgba(15,17,21,.14); z-index: 500; max-height: 400px; overflow-y:auto; overflow-x:hidden; animation: tkPop .18s ease both; }
.tk-srow { display:flex; gap:12px; align-items:center; padding: 10px 12px; border-bottom:1px solid ${BD}; text-decoration:none; color:${INK}; transition: background .18s; }
.tk-srow:hover { background:${MATTE}; }

/* ---- overlays ---- */
.tk-ovl { position:fixed; inset:0; z-index:600; background: rgba(15,17,21,.5); backdrop-filter: blur(5px); display:flex; flex-direction:column; animation: tkIn .2s ease both; }
.tk-menu { position:fixed; inset:0; z-index:400; background:${BG}; display:flex; flex-direction:column; padding: 16px 18px calc(26px + env(safe-area-inset-bottom)); animation: tkIn .22s ease both; }
.tk-menulink { display:flex; align-items:baseline; gap:14px; padding: 18px 2px; border-bottom:1px solid ${BD}; text-decoration:none; color:${INK}; animation: tkSlide .34s ease both; }

/* ---- hero bento ---- */
.tk-hero { position:relative; overflow:hidden; }
.tk-hero-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; z-index:0; }
.tk-bento { position:relative; z-index:2; display:grid; grid-template-columns:1fr; gap:12px; padding: 30px 0 42px; }
@media (min-width: 860px) { .tk-bento { grid-template-columns: 1.75fr 1fr; grid-template-rows: auto auto; gap:14px; padding: 46px 0 60px; } }
.tk-tile { background: rgba(255,255,255,.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border:1px solid ${BD}; border-radius:22px; padding: 26px 22px; animation: tkUp .6s ease both; }
@media (min-width: 860px) {
  .tk-tile-main { grid-row: 1 / span 2; display:flex; flex-direction:column; justify-content:center; padding: 44px 40px; }
  .tk-tile-stats { grid-column: 2; }
  .tk-tile-compat { grid-column: 2; }
}
.tk-hero-title { font-family:${FD}; font-weight:700; font-size: clamp(2rem, 5.4vw, 3.6rem); line-height:1.06; letter-spacing:-.025em; margin:.7rem 0 .9rem; max-width: 660px; margin-inline-end:auto; word-break: break-word; }
.tk-hero-sub { font-size: clamp(.92rem,2vw,1.04rem); line-height:1.7; color:${SUB}; max-width: 480px; margin-inline-end:auto; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

/* ---- trust strip ---- */
.tk-trust { display:grid; grid-template-columns: repeat(2,1fr); gap:1px; background:${BD}; border:1px solid ${BD}; border-radius:18px; overflow:hidden; }
@media (min-width: 900px) { .tk-trust { grid-template-columns: repeat(4,1fr); } }
.tk-trust-i { display:flex; align-items:center; gap:11px; padding: 15px 14px; background:${CARD}; }

/* ---- categories as segmented control ---- */
.tk-segwrap { overflow-x:auto; scrollbar-width:none; padding-bottom: 2px; }
.tk-segwrap::-webkit-scrollbar { display:none; }
.tk-seg { display:inline-flex; gap:4px; padding:4px; background:${MATTE}; border:1px solid ${BD}; border-radius:14px; }
.tk-segb { white-space:nowrap; font-size:.82rem; font-weight:600; color:${SUB}; text-decoration:none; padding: 10px 16px; border-radius:10px; transition: all .2s; }
.tk-segb:hover { color:${INK}; }
.tk-segb.is-active { background:${CARD}; color:${INK}; box-shadow: 0 1px 3px rgba(15,17,21,.12); }

/* ---- grid + card ---- */
.tk-grid { display:grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 640px)  { .tk-grid { grid-template-columns: repeat(2,1fr); } }
@media (min-width: 1024px) { .tk-grid { grid-template-columns: repeat(3,1fr); } }
@media (min-width: 1280px) { .tk-grid { grid-template-columns: repeat(4,1fr); } }

.tk-card { position:relative; display:block; background:${CARD}; border:1px solid ${BD}; border-radius:18px; text-decoration:none; color:${INK}; padding: 10px 10px 16px; animation: tkUp .5s ease both; transition: border-color .25s, box-shadow .25s, transform .25s; }
.tk-card:hover { border-color:${A}; box-shadow: 0 14px 30px rgba(15,17,21,.10); transform: translateY(-3px); }
.tk-matte { position:relative; background:${MATTE}; border-radius:13px; aspect-ratio: 1/1; overflow:hidden; display:block; transition: background .3s; }
.tk-card:hover .tk-matte { background:#E4E7EF; }
.tk-cimg { width:100%; height:100%; object-fit:contain; display:block; padding: 12%; transition: transform .5s cubic-bezier(.22,.68,0,1); }
.tk-card:hover .tk-cimg { transform: scale(1.07); }
.tk-savetab { position:absolute; top:14px; inset-inline-start:0; background:${A}; color:#fff; font-size:.66rem; font-weight:700; padding: 6px 9px; border-start-end-radius:8px; border-end-end-radius:8px; z-index:2; }
.tk-freetab { position:absolute; top:14px; inset-inline-end:0; background:${A}; color:#fff; font-size:.66rem; font-weight:700; padding: 6px 9px; border-start-start-radius:8px; border-end-start-radius:8px; z-index:2; }
.tk-fab { position:absolute; inset-inline-end:10px; bottom:-14px; width:40px; height:40px; border-radius:999px; background:${INK}; color:#fff; display:grid; place-items:center; z-index:3; box-shadow: 0 6px 16px rgba(15,17,21,.28); transition: background .22s, transform .22s; }
.tk-card:hover .tk-fab { background:${A}; transform: scale(1.08); }
.tk-cmeta { padding: 22px 4px 0; }
.tk-cname { font-size:.82rem; color:${SUB}; line-height:1.55; margin:5px 0 0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height: 2.5em; }

/* ---- pagination ---- */
.tk-pg { display:flex; align-items:center; justify-content:center; gap:12px; margin-top: 38px; }
.tk-pgb { min-width:46px; height:46px; padding: 0 16px; display:inline-flex; align-items:center; gap:7px; justify-content:center; border:1px solid ${BD}; border-radius:12px; background:${CARD}; color:${INK}; text-decoration:none; font-size:.85rem; font-weight:600; transition: all .2s; }
.tk-pgb:hover { border-color:${A}; color:${A}; }
.tk-pgb.is-off { opacity:.4; pointer-events:none; }

/* ---- product page ---- */
.tk-pd { display:grid; grid-template-columns:1fr; gap: 26px; }
@media (min-width: 1024px) { .tk-pd { grid-template-columns: 1.05fr .95fr; gap: 42px; align-items:start; } }
.tk-stack { display:flex; gap:14px; overflow-x:auto; scroll-snap-type: x mandatory; scrollbar-width:none; }
.tk-stack::-webkit-scrollbar { display:none; }
@media (min-width: 1024px) { .tk-stack { flex-direction:column; overflow:visible; }
  .tk-shot { flex: 0 0 auto; width:100%; } }
.tk-shot { position:relative; flex: 0 0 100%; scroll-snap-align:center; aspect-ratio: 1/1; background:${MATTE}; border:1px solid ${BD}; border-radius:20px; overflow:hidden; }
.tk-shot img { width:100%; height:100%; object-fit:contain; display:block; padding: 9%; }
.tk-dots { display:flex; gap:6px; justify-content:center; margin-top:12px; }
@media (min-width: 1024px) { .tk-dots { display:none; } }
.tk-dot { width:7px; height:7px; border-radius:999px; background:${BD}; border:none; padding:0; cursor:pointer; transition: all .2s; }
.tk-dot.is-active { background:${A}; width:20px; }
@media (min-width: 1024px) { .tk-buy { position: sticky; top: 100px; } }
.tk-spec { display:flex; justify-content:space-between; gap:16px; padding: 12px 0; border-bottom:1px solid ${BD}; font-size:.85rem; }
.tk-rte { font-size:.92rem; line-height:1.85; color:${SUB}; }
.tk-rte img { max-width:100%; height:auto; border-radius:12px; }
.tk-desc-d { display:none; }
.tk-desc-m { display:block; }
@media (min-width: 1024px) { .tk-desc-d { display:block !important; } .tk-desc-m { display:none !important; } }
.tk-offer { display:flex; align-items:center; gap:12px; width:100%; text-align:start; padding: 12px 14px; margin-bottom:8px; background:${CARD}; border:1px solid ${BD}; border-radius:12px; cursor:pointer; transition: border-color .2s, background .2s; font-family:inherit; }
.tk-offer:hover { border-color:${SUB}; }
.tk-offer.is-active { border-color:${A}; background:${AL}; }
.tk-swatch { min-width:46px; height:46px; border-radius:11px; border:1px solid ${BD}; background:${CARD}; cursor:pointer; display:grid; place-items:center; padding:0; font-size:.82rem; font-weight:500; color:${INK}; transition: all .2s; font-family:inherit; overflow:hidden; }
.tk-swatch.is-active { border-color:${A}; box-shadow: 0 0 0 3px ${AL}; }

/* ---- cart ---- */
.tk-cartlay { display:flex; flex-direction:column; gap: 1.4rem; }
@media (min-width: 1024px) {
  .tk-cartlay { flex-direction: row; align-items: flex-start; gap: 1.8rem; }
  .tk-cartlay > *:first-child { flex: 1.3; min-width: 0; }
  .tk-cartlay > *:last-child { flex: 1; min-width: 340px; position: sticky; top: 100px; }
}

/* ---- footer ---- */
.tk-foot { background:${CARD}; border-top:1px solid ${BD}; margin-top: 70px; }
.tk-footgrid { display:grid; grid-template-columns:1fr; gap: 28px; padding: 44px 0 30px; }
@media (min-width: 768px) { .tk-footgrid { grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; } }
.tk-footlink { display:block; color:${SUB}; text-decoration:none; font-size:.85rem; padding: 6px 0; transition: color .2s, padding-inline-start .2s; }
.tk-footlink:hover { color:${A}; padding-inline-start: 5px; }

/* ---- misc ---- */
.tk-skel { background: linear-gradient(90deg, ${MATTE} 25%, #F6F7FA 50%, ${MATTE} 75%); background-size: 420px 100%; animation: tkShim 1.4s infinite linear; border-radius:12px; }
.tk-badge { animation: tkBadge .42s ease; }
.tk-form-2 { display:grid; grid-template-columns:1fr; gap: .85rem; }
@media (min-width: 520px) { .tk-form-2 { grid-template-columns: 1fr 1fr; } }
.tk-ct2 { display:grid; grid-template-columns:1fr; gap: 26px; }
@media (min-width: 860px) { .tk-ct2 { grid-template-columns: .8fr 1.2fr; gap: 36px; align-items:start; } }
.tk-btnp:hover { background:${AD} !important; border-color:${AD} !important; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(91,75,224,.26); }
.tk-btnp:active { transform: translateY(0) scale(.99); }
.tk-btnp:disabled { opacity:.55; cursor:default; transform:none; box-shadow:none; }
.tk-btng:hover { border-color:${A} !important; color:${A} !important; }
.tk-fade { animation: tkIn .3s ease both; }

@media (prefers-reduced-motion: reduce) {
  .tk-root *, .tk-root *::before, .tk-root *::after {
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
        <Star key={i} size={size} fill={i < n ? A : 'none'} color={i < n ? A : BD} strokeWidth={1.6} />
      ))}
    </span>
  );
}

function Placeholder({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: MATTE }}>
      <Smartphone size={size} color={BD} strokeWidth={1.3} />
    </div>
  );
}

function Row({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: strong ? 'none' : `1px solid ${BD}` }}>
      <span style={{ flexShrink: 0, fontSize: strong ? '.88rem' : '.83rem', color: strong ? INK : SUB, fontWeight: strong ? 700 : 400 }}>{l}</span>
      <span className={strong ? 'tk-disp' : ''} dir="ltr" style={{ whiteSpace: 'nowrap', fontWeight: strong ? 700 : 600, fontSize: strong ? '1.32rem' : '.88rem', color: strong ? A : INK }}>{v}</span>
    </div>
  );
}

function ErrLine({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: '.73rem', color: ERR, marginTop: '.35rem', display: 'flex', alignItems: 'center', gap: 5 }}>
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
    <div className="tk-root" dir={t.dir} style={{ minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      <Navbar store={store} domain={domain} />
      <div className="tk-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1, opacity: visible ? 1 : 0, transition: 'opacity .32s ease' }}>{children}</main>
        <Footer store={store} />
      </div>
    </div>
  );
}

/* ============================ NAVBAR ============================ */
export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const router = useRouter();
  const pathname = usePathname();

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
    const id = setTimeout(() => setBump(false), 460);
    return () => clearTimeout(id);
  }, [count]);

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

  const pageLinks = [
    { h: '/', l: t.home },
    { h: '/contact', l: t.contact },
    { h: '/terms', l: t.terms },
    { h: '/privacy', l: t.privacy },
    { h: '/cookies', l: t.cookies },
  ];

  const logo = store?.design?.logoUrl;

  const resultRows = (onPick: () => void) => (
    <>
      {loading && (
        <div style={{ padding: 12, display: 'grid', gap: 8 }}>
          {[0, 1, 2].map((i) => <div key={i} className="tk-skel" style={{ height: 56 }} />)}
        </div>
      )}
      {!loading && listSearch.length === 0 && searchQuery.trim().length >= 2 && (
        <p style={{ padding: '1.5rem', textAlign: 'center', color: SUB, fontSize: '.85rem' }}>{t.noResults}</p>
      )}
      {!loading && listSearch.map((p: any) => {
        const im = imgOf(p);
        return (
          <Link key={p.id} href={`/product/${p.slug || p.id}`} className="tk-srow" onClick={onPick}>
            <span style={{ width: 50, height: 50, flexShrink: 0, overflow: 'hidden', borderRadius: 10, background: MATTE, display: 'block' }}>
              {im ? <img src={im} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6, display: 'block' }} /> : <Placeholder size={20} />}
            </span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'block', fontSize: '.86rem', fontWeight: 500, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span className="tk-disp" style={{ display: 'block', fontSize: '.85rem', color: A, fontWeight: 700 }}>{fmt(Number(p.price))} {cur(store)}</span>
            </span>
          </Link>
        );
      })}
      {!loading && listSearch.length > 0 && (
        <Link href={`/?search=${encodeURIComponent(searchQuery.trim())}`} onClick={onPick}
          style={{ display: 'block', padding: '13px', textAlign: 'center', fontSize: '.8rem', fontWeight: 600, color: A, textDecoration: 'none', background: MATTE }}>
          {t.showAll}
        </Link>
      )}
    </>
  );

  return (
    <>
      <aside className="tk-rail tk-d" aria-label="main">
        <Link href="/" className={`tk-railitem${pathname === '/' ? ' is-active' : ''}`}>
          <HomeIcon size={19} strokeWidth={1.8} /> {t.home}
        </Link>
        <Link href="/#grid" className="tk-railitem">
          <LayoutGrid size={19} strokeWidth={1.8} /> {t.shop}
        </Link>
        <Link href="/contact" className={`tk-railitem${pathname === '/contact' ? ' is-active' : ''}`}>
          <Headphones size={19} strokeWidth={1.8} /> {t.contact}
        </Link>
        {store?.cart !== false && (
          <Link href="/cart" className={`tk-railitem${pathname === '/cart' ? ' is-active' : ''}`}>
            <span style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
              <ShoppingBag size={19} strokeWidth={1.8} />
              {count > 0 && (
                <span className={bump ? 'tk-badge' : ''} style={{ position: 'absolute', top: -7, insetInlineEnd: -11, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 999, background: A, color: '#fff', fontSize: '.58rem', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                  {count}
                </span>
              )}
            </span>
            {t.cart}
          </Link>
        )}

        <span className="tk-railword">{store?.name || 'ACCESSORIES'}</span>
      </aside>

      <header className="tk-head tk-shell">
        <div className="tk-ticker">
          <div className="tk-mq">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i}><BadgeCheck size={12} strokeWidth={2} />{store?.topBar?.text || t.ticker}</span>
            ))}
          </div>
        </div>

        <div className="tk-topbar">
          <div className="tk-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <button className="tk-ico tk-m" onClick={() => setOpen(true)} aria-label={t.menu} type="button">
              <Menu size={21} strokeWidth={1.8} />
            </button>

            <Link href="/" className="tk-word tk-m">
              {logo && !imgError ? (
                <img src={logo} alt={store?.name || 'logo'}
                  style={{ height: 28, objectFit: 'contain', display: 'block' }} />
              ) : (store?.name || 'ACCESSORIES')}
            </Link>

            {logo && !imgError ? (
              <img src={logo} alt={store?.name || 'logo'} className="tk-d"
                style={{ height: 30, objectFit: 'contain', display: 'block' }} />
            ) : (
              <span className="tk-tagline">{store?.hero?.subtitle || t.tagline}</span>
            )}

            <form onSubmit={submitSearch} className="tk-searchwrap tk-d" style={{ marginInlineStart: 'auto' }}>
              <Search size={15} color={SUB} style={{ position: 'absolute', insetInlineStart: 13, top: 12, pointerEvents: 'none' }} />
              <input
                className="tk-searchin" value={searchQuery} placeholder={t.search} aria-label={t.search}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {searchQuery && (
                <button type="button" aria-label={t.cancel}
                  onMouseDown={(e) => { e.preventDefault(); setSearchQuery(''); setListSearch([]); setSearchFocused(false); }}
                  style={{ position: 'absolute', insetInlineEnd: 10, top: 10, width: 21, height: 21, borderRadius: 999, display: 'grid', placeItems: 'center', background: MATTE, border: 'none', cursor: 'pointer' }}>
                  <X size={12} color={INK} />
                </button>
              )}
              {searchFocused && searchQuery.trim().length >= 2 && (
                <div className="tk-drop">{resultRows(() => { setSearchQuery(''); setListSearch([]); })}</div>
              )}
            </form>

            <button className="tk-ico tk-m" onClick={() => setShowSearch(true)} aria-label={t.search} type="button">
              <Search size={20} strokeWidth={1.8} />
            </button>

            {store?.cart !== false && (
              <Link href="/cart" className="tk-ico tk-m" aria-label={t.cart}>
                <ShoppingBag size={20} strokeWidth={1.8} />
                {count > 0 && (
                  <span className={bump ? 'tk-badge' : ''} style={{ position: 'absolute', top: 4, insetInlineEnd: 3, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 999, background: A, color: '#fff', fontSize: '.6rem', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                    {count}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      {open && (
        <div className="tk-menu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span className="tk-disp" style={{ fontSize: '1.05rem' }}>{store?.name || 'ACCESSORIES'}</span>
            <button className="tk-ico" onClick={() => setOpen(false)} aria-label={t.cancel} type="button"><X size={22} /></button>
          </div>
          {pageLinks.map((l, i) => (
            <Link key={l.h} href={l.h} onClick={() => setOpen(false)} className="tk-menulink"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <span className="tk-disp" style={{ fontSize: '.78rem', color: A, minWidth: 24 }}>0{i + 1}</span>
              <span className="tk-disp" style={{ fontSize: '1.5rem' }}>{l.l}</span>
            </Link>
          ))}
        </div>
      )}

      {showSearch && (
        <div className="tk-ovl" onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}>
          <form onSubmit={submitSearch} style={{ background: CARD, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={19} color={SUB} />
            <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search} aria-label={t.search}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: INK, minHeight: 44 }} />
            <button type="button" onClick={closeSearch} aria-label={t.cancel}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: 44, height: 44, display: 'grid', placeItems: 'center', color: INK }}>
              <X size={21} />
            </button>
          </form>
          <div style={{ flex: 1, overflowY: 'auto', background: BG }}>{resultRows(closeSearch)}</div>
        </div>
      )}
    </>
  );
}

/* ============================ FOOTER ============================ */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const year = new Date().getFullYear();
  const navLinks = [
    { h: '/', l: t.home },
    { h: '/cart', l: t.cart },
    { h: '/contact', l: t.contact },
  ].filter((lnk) => lnk.h !== '/cart' || store?.cart !== false);

  const legalLinks = [
    { h: '/privacy', l: t.privacy },
    { h: '/terms', l: t.terms },
    { h: '/cookies', l: t.cookies },
  ];

  const c = store?.contact || {};

  return (
    <footer className="tk-foot">
      <div className="tk-wrap">
        <div className="tk-footgrid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, background: INK, display: 'grid', placeItems: 'center' }}>
                <Cable size={17} color="#fff" strokeWidth={2} />
              </span>
              <span className="tk-disp" style={{ fontSize: '1.12rem', fontWeight: 700 }}>{store?.name || 'ACCESSORIES'}</span>
            </div>
            <p dir="auto" style={{ fontSize: '.87rem', lineHeight: 1.8, color: SUB, maxWidth: 340, margin: 0, marginInlineEnd: 'auto' }}>
              {store?.hero?.subtitle || t.heroSub}
            </p>
          </div>

          <div>
            <p style={{ ...eyebrow, marginBottom: 10 }}>{t.quickLinks}</p>
            {navLinks.map((l) => <Link key={l.h} href={l.h} className="tk-footlink">{l.l}</Link>)}
          </div>

          <div>
            <p style={{ ...eyebrow, marginBottom: 10 }}>{t.legalNav}</p>
            {legalLinks.map((l) => <Link key={l.h} href={l.h} className="tk-footlink">{l.l}</Link>)}
          </div>

          <div>
            <p style={{ ...eyebrow, marginBottom: 10 }}>{t.contactUs}</p>
            {c.phone && (
              <a href={`tel:${c.phone}`} className="tk-footlink" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Phone size={14} strokeWidth={1.8} /> <span dir="ltr">{c.phone}</span>
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="tk-footlink" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Mail size={14} strokeWidth={1.8} /> {c.email}
              </a>
            )}
            {(c.wilaya || c.address) && (
              <span className="tk-footlink" style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <MapPin size={14} strokeWidth={1.8} style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{[c.wilaya, c.address].filter(Boolean).join(' — ')}</span>
              </span>
            )}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${BD}`, padding: '16px 0 22px', fontSize: '.76rem', color: SUB }}>
          © {year} {store?.name || 'ACCESSORIES'} — {t.rightsReserved}
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
      className="tk-card"
      style={{ animationDelay: `${Math.min(Number(index) || 0, 11) * 0.055}s` }}
      aria-label={product?.name}
    >
      <span className="tk-matte">
        {discount > 0 && <span className="tk-savetab">−{discount}%</span>}
        {product?.shippingFree && <span className="tk-freetab">🚚</span>}
        {img && !imgErr ? (
          <img src={img} alt={product?.name || ''} loading="lazy" className="tk-cimg" onError={() => setImgErr(true)} />
        ) : (
          <Placeholder size={44} />
        )}
      </span>

      <div className="tk-cmeta">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span dir="ltr" className="tk-disp" style={{ fontSize: '1.24rem', fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>
            {fmt(price)} <span style={{ fontSize: '.7rem', fontFamily: FB, fontWeight: 600, color: SUB }}>{cur(store)}</span>
          </span>
          {orig > price && (
            <span dir="ltr" style={{ fontSize: '.76rem', color: SUB, textDecoration: 'line-through', whiteSpace: 'nowrap' }}>{fmt(orig)}</span>
          )}
        </div>
        <p className="tk-cname" dir="auto">{product?.name}</p>
        <div style={{ marginTop: 9 }}><Stars n={5} /></div>
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

  const curPage = Number(page) || 1;
  const countPage = Math.max(1, Math.ceil((Number(store?.count) || products.length) / 48));

  const trustIcons = [Truck, BadgeCheck, CreditCard, Headphones];

  return (
    <div>
      <section className="tk-hero">
        {heroImg && (
          <img src={heroImg} alt="" aria-hidden="true" className="tk-hero-bg" />
        )}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: heroImg ? 'linear-gradient(180deg, rgba(242,243,246,.86) 0%, rgba(242,243,246,.92) 100%)' : `radial-gradient(90% 70% at 80% 0%, ${AL} 0%, rgba(242,243,246,0) 70%)` }} />

        <div className="tk-wrap" style={{ position: 'relative', zIndex: 2 }}>
          <div className="tk-bento">
            <div className="tk-tile tk-tile-main">
              <span style={eyebrow}>{t.heroEyebrow}</span>
              <h1 dir="auto" className="tk-hero-title"
                dangerouslySetInnerHTML={{ __html: clean(store?.hero?.title || t.heroTitle) }} />
              <p dir="auto" className="tk-hero-sub">{store?.hero?.subtitle || t.heroSub}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 26 }}>
                <a href="#grid" className="tk-btnp" style={{ ...btnPrimary, width: 'auto' }}>
                  {t.shopNow} <ArrowRight size={16} style={{ transform: t.dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />
                </a>
                {store?.cart !== false && (
                  <Link href="/cart" className="tk-btng" style={{ ...btnGhost, width: 'auto' }}>
                    <ShoppingBag size={16} /> {t.cart}
                  </Link>
                )}
              </div>
            </div>

            <div className="tk-tile tk-tile-stats" style={{ animationDelay: '.1s' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {t.stats.map((s: any, i: number) => (
                  <div key={i}>
                    <p className="tk-disp" style={{ fontSize: 'clamp(1.6rem,5vw,2.2rem)', color: A, margin: 0, lineHeight: 1, fontWeight: 700 }}>{s.n}</p>
                    <p style={{ fontSize: '.74rem', color: SUB, margin: '7px 0 0' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="tk-tile tk-tile-compat" style={{ animationDelay: '.18s', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 44, height: 44, borderRadius: 14, background: AL, display: 'grid', placeItems: 'center', flexShrink: 0, animation: 'tkFloat 5s ease-in-out infinite' }}>
                <ShieldCheck size={21} color={A} strokeWidth={1.9} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '.9rem', fontWeight: 600 }}>{t.bentoCompat}</span>
                <span style={{ display: 'block', fontSize: '.76rem', color: SUB, marginTop: 3 }}>{t.bentoCompatSub}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4px 0 8px' }}>
        <div className="tk-wrap">
          <div className="tk-trust">
            {t.trust.map((item: any, i: number) => {
              const Ico = trustIcons[i] || Truck;
              return (
                <div key={i} className="tk-trust-i">
                  <Ico size={19} color={A} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '.81rem', fontWeight: 600 }}>{item.t}</span>
                    <span style={{ display: 'block', fontSize: '.72rem', color: SUB, marginTop: 2 }}>{item.s}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="grid" style={{ padding: '38px 0 60px' }}>
        <div className="tk-wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <span style={eyebrow}>{searchTerm ? t.searchResultsFor : t.collection}</span>
              <h2 dir="auto" className="tk-disp" style={{ fontSize: 'clamp(1.5rem,4.4vw,2.3rem)', fontWeight: 700, margin: '.3rem 0 0' }}>
                {searchTerm || store?.name || t.collection}
              </h2>
            </div>
            <span style={{ fontSize: '.8rem', color: SUB, fontWeight: 500 }}>
              {(Number(store?.count) || products.length)} {t.product}
            </span>
          </div>

          {cats.length > 0 && (
            <div className="tk-segwrap" style={{ marginBottom: 24 }}>
              <div className="tk-seg">
                <Link href="/" className={`tk-segb${!activeCategory ? ' is-active' : ''}`}>{t.all}</Link>
                {cats.map((cat: any) => (
                  <Link key={cat.id} href={`?category=${cat.id}`}
                    className={`tk-segb${String(activeCategory) === String(cat.id) ? ' is-active' : ''}`}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div style={{ padding: '70px 20px', textAlign: 'center', border: `1px solid ${BD}`, borderRadius: 20, background: CARD }}>
              <Smartphone size={42} color={BD} strokeWidth={1.2} />
              <p style={{ marginTop: 14, color: SUB, fontSize: '.9rem' }}>{t.noProducts}</p>
            </div>
          ) : (
            <div className="tk-grid">
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
            <div className="tk-pg">
              <Link href={{ query: { page: Math.max(1, curPage - 1) } }} scroll={false}
                className={`tk-pgb${curPage <= 1 ? ' is-off' : ''}`} aria-label="prev">
                {t.dir === 'rtl' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </Link>
              <span style={{ fontSize: '.85rem', color: SUB, fontWeight: 500, whiteSpace: 'nowrap' }}>
                {t.pageOf} <strong style={{ color: INK }}>{curPage}</strong> / {countPage}
              </span>
              <Link href={{ query: { page: Math.min(countPage, curPage + 1) } }} scroll={false}
                className={`tk-pgb${curPage >= countPage ? ' is-off' : ''}`} aria-label="next">
                {t.dir === 'rtl' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </Link>
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
  const [errIdx, setErrIdx] = useState<Record<number, boolean>>({});
  const stackRef = useRef<HTMLDivElement | null>(null);

  const imgs: string[] = useMemo(() => Array.from(new Set([
    product?.productImage,
    ...(product?.imagesProduct?.map((i: any) => i?.imageUrl) || []),
    ...(Array.isArray(allImages) ? allImages.map((i: any) => (typeof i === 'string' ? i : i?.imageUrl)) : []),
  ].filter(Boolean) as string[])), [product, allImages]);

  const attrs: Attribute[] = (Array.isArray(allAttrs) && allAttrs.length ? allAttrs : product?.attributes) || [];
  const offers: Offer[] = product?.offers || [];
  const price = Number(finalPrice ?? product?.price) || 0;
  const orig = Number(product?.priceOriginal) || 0;

  const goDot = (i: number) => {
    setSel(i);
    const el = stackRef.current;
    if (el && el.children[i]) (el.children[i] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const descBlock = (cls: string) => (
    <div className={cls}>
      <p style={{ ...eyebrow, marginBottom: 10 }}>{t.descTitle}</p>
      <div className="tk-rte" dir={t.dir} dangerouslySetInnerHTML={{ __html: clean(product?.desc) }} />
    </div>
  );

  return (
    <div className="tk-wrap" style={{ paddingTop: '22px', paddingBottom: '70px' }}>

      <div className="tk-pd">
        <div>
          <div className="tk-stack" ref={stackRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              if (!el.clientWidth) return;
              const i = Math.round(el.scrollLeft / el.clientWidth);
              setSel(Math.abs(i));
            }}>
            {imgs.length === 0 && (
              <div className="tk-shot"><Placeholder size={56} /></div>
            )}
            {imgs.map((u, i) => (
              <div key={i} className="tk-shot">
                {i === 0 && discount > 0 && (
                  <span style={{ position: 'absolute', top: 14, insetInlineStart: 0, background: A, color: '#fff', fontSize: '.72rem', fontWeight: 700, padding: '7px 11px', borderStartEndRadius: 9, borderEndEndRadius: 9, zIndex: 3 }}>
                    −{discount}%
                  </span>
                )}
                {errIdx[i] ? (
                  <Placeholder size={50} />
                ) : (
                  <img src={u} alt={product?.name || ''} onError={() => setErrIdx((s) => ({ ...s, [i]: true }))} />
                )}
              </div>
            ))}
          </div>

          {imgs.length > 1 && (
            <div className="tk-dots">
              {imgs.map((_, i) => (
                <button key={i} type="button" className={`tk-dot${i === sel ? ' is-active' : ''}`}
                  onClick={() => goDot(i)} aria-label={`${i + 1}`} />
              ))}
            </div>
          )}

          {product?.desc && (
            <div style={{ marginTop: 32 }}>
              {descBlock('tk-desc-d')}
            </div>
          )}
        </div>

        <div className="tk-buy">
          <h1 dir={t.dir} className="tk-disp" style={{ fontSize: 'clamp(1.5rem,4.6vw,2.2rem)', fontWeight: 700, lineHeight: 1.2, margin: '0 0 12px' }}>
            {product?.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <Stars n={5} size={13} />
            {typeof product?.stock === 'number' && product.stock > 0 && (
              <span style={{ fontSize: '.74rem', color: A, background: AL, padding: '5px 10px', borderRadius: 999, fontWeight: 600 }}>
                {t.stock}: {product.stock} {t.pieces}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingBottom: 18, borderBottom: `1px solid ${BD}`, marginBottom: 20 }}>
            <span dir="ltr" className="tk-disp" style={{ fontSize: 'clamp(1.8rem,5.4vw,2.5rem)', fontWeight: 700, color: A, whiteSpace: 'nowrap' }}>
              {fmt(price)} <span style={{ fontSize: '.85rem', fontFamily: FB, fontWeight: 600, color: SUB }}>{cur(store)}</span>
            </span>
            {orig > price && (
              <span dir="ltr" style={{ fontSize: '1rem', color: SUB, textDecoration: 'line-through', whiteSpace: 'nowrap' }}>{fmt(orig)}</span>
            )}
          </div>

          {(product?.shippingFree || (store?.supportFreeShipping && store?.freeShippingMinAmount != null)) && (
            <div style={{ marginBottom: 20, padding: '10px 14px', border: `1px solid ${A}`, borderRadius: 10, background: AL, fontSize: '.85rem', fontWeight: 600, color: A }}>
              🚚 {product.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', `${fmt(Number(store.freeShippingMinAmount))} ${cur(store)}`)}
            </div>
          )}

          {offers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ ...eyebrow, marginBottom: 10 }}>{t.offersTitle}</p>
              {offers.map((o: Offer) => {
                const active = String(selectedOffer) === String(o.id);
                return (
                  <button key={o.id} type="button" className={`tk-offer${active ? ' is-active' : ''}`}
                    onClick={() => setSelectedOffer(active ? null : o.id)}>
                    <span style={{ width: 19, height: 19, borderRadius: 999, border: `2px solid ${active ? A : BD}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {active && <span style={{ width: 9, height: 9, borderRadius: 999, background: A, display: 'block' }} />}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span dir={t.dir} style={{ display: 'block', fontSize: '.88rem', fontWeight: 500, color: INK }}>{o.name}</span>
                      {o.subTitle && <span style={{ display: 'block', fontSize: '.73rem', color: SUB, marginTop: 2 }}>{o.subTitle}</span>}
                      <span style={{ display: 'block', fontSize: '.73rem', color: SUB, marginTop: 2 }}>× {o.quantity}</span>
                      {o.shippingFree && <span style={{ display: 'block', fontSize: '.73rem', color: A, fontWeight: 600, marginTop: 2 }}>🚚 {t.freeShippingBadge}</span>}
                    </span>
                    <span dir="ltr" className="tk-disp" style={{ fontSize: '1.05rem', fontWeight: 700, color: active ? A : INK, whiteSpace: 'nowrap' }}>
                      {fmt(Number(o.price))} {cur(store)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {attrs.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ ...eyebrow, marginBottom: 12 }}>{t.optionsTitle}</p>
              {attrs.map((attr: Attribute) => (
                <div key={attr.id} style={{ marginBottom: 16 }}>
                  <p style={label}>{attr.name}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(attr.variants || []).map((v: Variant) => {
                      const active = selectedVariants?.[attr.name] === v.value;
                      const mode = attr.displayMode || 'text';
                      const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                        Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                          ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                        )
                      );
                      return (
                        <button key={v.id} type="button" className={`tk-swatch${active ? ' is-active' : ''}`}
                          onClick={() => available && handleVariantSelection && handleVariantSelection(attr.name, v.value)}
                          title={v.name || v.value} aria-label={v.name || v.value}
                          style={(mode === 'color' || mode === 'image') ? { width: 46, cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35 } : { cursor: available ? 'pointer' : 'not-allowed', color: available ? undefined : '#bbb', textDecoration: available ? 'none' : 'line-through' }}>
                          {mode === 'color' && (/^https?:\/\//.test(v.value) ? <img src={v.value} alt={v.name || v.value} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <span style={{ width: '100%', height: '100%', background: v.value, display: 'block' }} />)}
                          {mode === 'image' && <img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                          {mode !== 'color' && mode !== 'image' && <span style={{ padding: '0 13px', whiteSpace: 'nowrap' }}>{v.name || v.value}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 18, padding: '20px 18px' }}>
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

          <div style={{ marginTop: 24 }}>
            <p style={{ ...eyebrow, marginBottom: 6 }}>{t.specsTitle}</p>
            {t.specs.map((s: any, i: number) => (
              <div key={i} className="tk-spec">
                <span style={{ color: SUB, flexShrink: 0 }}>{s.k}</span>
                <span style={{ textAlign: 'end', fontWeight: 500 }}>{s.v}</span>
              </div>
            ))}
          </div>

          {product?.desc && (
            <div style={{ marginTop: 24 }}>
              {descBlock('tk-desc-m')}
            </div>
          )}
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

  const getVarId = (): any => {
    const vd = product?.variantDetails?.find((d: VariantDetail) => variantMatches(d, selectedVariants || {}));
    return vd ? vd.id : null;
  };

  const fp = getFP();
  const supportQty = (store?.supportQty ?? product?.store?.supportQty) !== false;
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = selectedOffer ? product?.offers?.find((o: Offer) => String(o.id) === String(selectedOffer)) : undefined;
  const orderFreeShipping = !!(product?.shippingFree || selOfferObj?.shippingFree ||
    (store?.supportFreeShipping && store?.freeShippingMinAmount != null && (fp * qty) >= Number(store.freeShippingMinAmount)));

  const getLiv = useCallback((): number => {
    if (orderFreeShipping) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison, orderFreeShipping]);

  const total = () => fp * qty + getLiv();

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
    quantity: qty,
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
      {supportQty && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: '.84rem', fontWeight: 600 }}>{t.qty}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${BD}`, borderRadius: 10, background: BG }}>
            <button type="button" onClick={() => set('quantity', Math.max(1, fd.quantity - 1))} aria-label="-"
              style={{ width: 42, height: 42, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: INK }}>
              <Minus size={15} />
            </button>
            <span className="tk-disp" style={{ minWidth: 38, textAlign: 'center', fontSize: '1.05rem', fontWeight: 700 }}>{fd.quantity}</span>
            <button type="button" onClick={() => set('quantity', fd.quantity + 1)} aria-label="+"
              style={{ width: 42, height: 42, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: INK }}>
              <Plus size={15} />
            </button>
          </span>
        </div>
      )}

      {!isOrderNow && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" className="tk-btnp" style={btnPrimary} onClick={() => setIsOrderNow(true)}>
            {t.orderNow}
          </button>
          {store?.cart !== false && (
            <button type="button" className="tk-btng" style={btnGhost} onClick={addToCart}>
              {added ? <><Check size={16} /> {t.added}</> : <><ShoppingBag size={16} /> {t.addToCart}</>}
            </button>
          )}
        </div>
      )}

      {isOrderNow && (
        <div className="tk-fade">
          <div style={{ marginBottom: 13 }}>
            <label style={label} htmlFor="tk-name">{t.fullName}</label>
            <input id="tk-name" style={{ ...inputBase, ...(errs.customerName ? { borderColor: ERR } : {}) }}
              value={fd.customerName} placeholder={t.fullNamePlaceholder}
              onChange={(e) => set('customerName', e.target.value)} />
            <ErrLine msg={errs.customerName} />
          </div>

          <div style={{ marginBottom: 13 }}>
            <label style={label} htmlFor="tk-phone">{t.phone}</label>
            <input id="tk-phone" type="tel" dir="ltr" inputMode="tel"
              style={{ ...inputBase, ...(errs.customerPhone ? { borderColor: ERR } : {}) }}
              value={fd.customerPhone} placeholder={t.phonePlaceholder}
              onChange={(e) => set('customerPhone', e.target.value)} />
            <ErrLine msg={errs.customerPhone} />
          </div>

          <div className="tk-form-2" style={{ marginBottom: 13 }}>
            <div>
              <label style={label} htmlFor="tk-wil">{t.wilaya}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select id="tk-wil" disabled={wilayas.length === 0}
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
              <label style={label} htmlFor="tk-com">{t.commune}</label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={14} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select id="tk-com" disabled={!fd.customerWelaya || loadingC}
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

          <div style={{ marginBottom: 16 }}>
            <span style={label}>{t.delivery}</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([['home', t.deliveryHome], ['office', t.deliveryOffice]] as const).map(([k, l]) => {
                const active = fd.typeLivraison === k;
                return (
                  <button key={k} type="button" onClick={() => set('typeLivraison', k)}
                    style={{
                      minHeight: 46, padding: '0 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.8rem',
                      borderRadius: 10, background: active ? AL : CARD,
                      border: `1px solid ${active ? A : BD}`, color: active ? A : SUB,
                      fontWeight: active ? 600 : 400, transition: 'all .2s',
                    }}>
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 16, padding: '4px 14px 12px', background: BG, border: `1px solid ${BD}`, borderRadius: 14 }}>
            <Row l={t.price} v={`${fmt(fp)} ${cur(store)}`} />
            <Row l={t.qty} v={`× ${qty}`} />
            <Row l={t.delivery} v={!selW ? '—' : orderFreeShipping ? t.freeShippingBadge : `${fmt(getLiv())} ${cur(store)}`} />
            <Row l={t.total} v={`${fmt(total())} ${cur(store)}`} strong />
          </div>

          {globalErr && (
            <p style={{ fontSize: '.8rem', color: ERR, marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
              <AlertCircle size={13} /> {globalErr}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <button type="button" className="tk-btnp" style={btnPrimary} onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
            <button type="button" className="tk-btng" style={{ ...btnGhost, color: SUB }}
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
  const cartTotal = items.reduce((s, it) => s + (Number(it.finalPrice) || 0) * (Number(it.quantity) || 1), 0);

  const hasFreeShippingItem = items.some((it) => it.product?.shippingFree || it.product?.offers?.find((o: Offer) => String(o.id) === String(it.selectedOffer))?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;

  const getLiv = useCallback((): number => {
    if (freeShippingReached) return 0;
    if (!selW) return 0;
    return fd.typeLivraison === 'home' ? Number(selW.livraisonHome) : Number(selW.livraisonOfice);
  }, [selW, fd.typeLivraison, freeShippingReached]);

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
      <div className="tk-wrap" style={{ paddingTop: '80px', paddingBottom: '110px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: 22, background: AL, display: 'grid', placeItems: 'center', animation: 'tkPop .45s ease both' }}>
          <Check size={32} color={A} strokeWidth={2.2} />
        </div>
        <h1 className="tk-disp" style={{ fontSize: 'clamp(1.5rem,4.6vw,2.2rem)', fontWeight: 700, margin: '0 0 12px' }}>{t.successTitle}</h1>
        <p style={{ color: SUB, fontSize: '.92rem', marginBottom: 26 }}>{t.successDesc}</p>
        <Link href="/" className="tk-btnp" style={{ ...btnPrimary, width: 'auto' }}>{t.backToShop}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="tk-wrap" style={{ paddingTop: '80px', paddingBottom: '110px', textAlign: 'center' }}>
        <ShoppingBag size={46} color={BD} strokeWidth={1.2} />
        <h1 className="tk-disp" style={{ fontSize: 'clamp(1.4rem,4.4vw,2rem)', fontWeight: 700, margin: '18px 0 10px' }}>{t.cartEmpty}</h1>
        <p style={{ color: SUB, fontSize: '.9rem', marginBottom: 26 }}>{t.cartEmptyDesc}</p>
        <Link href="/" className="tk-btnp" style={{ ...btnPrimary, width: 'auto' }}>{t.shopNow}</Link>
      </div>
    );
  }

  return (
    <div className="tk-wrap" style={{ paddingTop: '28px', paddingBottom: '70px' }}>
      <span style={eyebrow}>{items.length} {t.items}</span>
      <h1 className="tk-disp" style={{ fontSize: 'clamp(1.6rem,4.8vw,2.4rem)', fontWeight: 700, margin: '.25rem 0 24px', letterSpacing: '-.02em' }}>{t.myCart}</h1>

      {freeShippingMin != null && (
        <div style={{
          border: `1px solid ${freeShippingReached ? A : BD}`, borderRadius: 14,
          background: freeShippingReached ? AL : CARD, padding: '12px 16px', marginBottom: 20,
          color: freeShippingReached ? A : SUB, fontSize: '.85rem', fontWeight: 600,
        }}>
          {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', `${fmt(Number(freeShippingRemainingAmt))} ${cur(store)}`)}
        </div>
      )}

      <div className="tk-cartlay">
        <div>
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((it, i) => {
              const img = it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl;
              const qty = Number(it.quantity) || 1;
              const line = (Number(it.finalPrice) || 0) * qty;
              return (
                <div key={i} style={{ display: 'flex', gap: 13, padding: 12, background: CARD, border: `1px solid ${BD}`, borderRadius: 16 }}>
                  <div style={{ width: 90, height: 90, flexShrink: 0, overflow: 'hidden', borderRadius: 12, background: MATTE }}>
                    {img ? <img src={img} alt={it.product?.name || ''} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, display: 'block' }} /> : <Placeholder size={22} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <p dir="auto" style={{ fontSize: '.89rem', fontWeight: 500, margin: '0 0 5px', lineHeight: 1.5 }}>{it.product?.name}</p>
                      <p style={{ fontSize: '.75rem', color: SUB, margin: 0 }}>{t.qty}: {qty}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <span dir="ltr" className="tk-disp" style={{ fontSize: '1.12rem', fontWeight: 700, color: A, whiteSpace: 'nowrap' }}>
                        {fmt(line)} {cur(store)}
                      </span>
                      <button type="button" onClick={() => removeItem(i)} aria-label={t.remove}
                        style={{ width: 42, height: 42, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'transparent', border: `1px solid ${BD}`, cursor: 'pointer', color: SUB }}>
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
          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 18, padding: '22px 18px' }}>
            <p style={{ ...eyebrow, marginBottom: 16 }}>{t.confirmOrder}</p>

            <div style={{ marginBottom: 13 }}>
              <label style={label} htmlFor="tkc-name">{t.fullName}</label>
              <input id="tkc-name" style={{ ...inputBase, ...(errs.customerName ? { borderColor: ERR } : {}) }}
                value={fd.customerName} placeholder={t.fullNamePlaceholder}
                onChange={(e) => set('customerName', e.target.value)} />
              <ErrLine msg={errs.customerName} />
            </div>

            <div style={{ marginBottom: 13 }}>
              <label style={label} htmlFor="tkc-phone">{t.phone}</label>
              <input id="tkc-phone" type="tel" dir="ltr" inputMode="tel"
                style={{ ...inputBase, ...(errs.customerPhone ? { borderColor: ERR } : {}) }}
                value={fd.customerPhone} placeholder={t.phonePlaceholder}
                onChange={(e) => set('customerPhone', e.target.value)} />
              <ErrLine msg={errs.customerPhone} />
            </div>

            <div className="tk-form-2" style={{ marginBottom: 13 }}>
              <div>
                <label style={label} htmlFor="tkc-wil">{t.wilaya}</label>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={14} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <select id="tkc-wil" disabled={wilayas.length === 0}
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
                <label style={label} htmlFor="tkc-com">{t.commune}</label>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={14} color={SUB} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <select id="tkc-com" disabled={!fd.customerWelaya || loadingC}
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

            <div style={{ marginBottom: 16 }}>
              <span style={label}>{t.delivery}</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {([['home', t.deliveryHome], ['office', t.deliveryOffice]] as const).map(([k, l]) => {
                  const active = fd.typeLivraison === k;
                  return (
                    <button key={k} type="button" onClick={() => set('typeLivraison', k)}
                      style={{
                        minHeight: 46, padding: '0 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.8rem',
                        borderRadius: 10, background: active ? AL : BG,
                        border: `1px solid ${active ? A : BD}`, color: active ? A : SUB,
                        fontWeight: active ? 600 : 400, transition: 'all .2s',
                      }}>
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 16, padding: '4px 14px 12px', background: BG, border: `1px solid ${BD}`, borderRadius: 14 }}>
              <Row l={t.subtotal} v={`${fmt(cartTotal)} ${cur(store)}`} />
              <Row l={t.delivery} v={!selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${fmt(getLiv())} ${cur(store)}`} />
              <Row l={t.total} v={`${fmt(finalTotal)} ${cur(store)}`} strong />
            </div>

            {globalErr && (
              <p style={{ fontSize: '.8rem', color: ERR, marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                <AlertCircle size={13} /> {globalErr}
              </p>
            )}

            <button type="button" className="tk-btnp" style={btnPrimary} onClick={submitOrder} disabled={submitting}>
              {submitting ? t.sending : t.confirmOrder}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ SUCCESS ============================ */
export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const stepIcons = [Check, Phone, Package, Truck];

  return (
    <div dir={t.dir} style={{ minHeight: '100vh', background: BG, padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', background: CARD, padding: '3rem 2rem', borderRadius: 16, border: `1px solid ${BD}`, marginBottom: '1.5rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: MATTE, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Check size={28} style={{ color: A }} />
          </div>
          <h1 className="tk-disp" style={{ fontSize: 'clamp(1.5rem,4.6vw,2.2rem)', fontWeight: 700, margin: '0 0 12px' }}>{t.successTitle}</h1>
          <p style={{ color: SUB, fontSize: '.92rem' }}>{t.successDesc}</p>
        </div>

        {order && (order.productName || order.total != null) && (
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', color: INK, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{t.orderInfo}</p>
            {order.productName && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${BD}`, fontSize: 14, fontWeight: 700, color: INK }}>{order.productName}</div>
            )}
            {order.total != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: SUB }}>{t.total}</span>
                <span className="tk-disp" style={{ fontSize: '1.2rem', fontWeight: 700, color: A }}>{Number(order.total).toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BD}`, overflow: 'hidden', marginBottom: '1.5rem' }}>
          {t.successSteps.map((step, i) => {
            const Icon = stepIcons[i] ?? Check;
            const done = i === 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < t.successSteps.length - 1 ? `1px solid ${BD}` : 'none', background: done ? MATTE : 'transparent' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? A : MATTE, color: done ? '#fff' : SUB }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: done ? INK : SUB, marginBottom: 2 }}>{step.title}</p>
                  <p style={{ fontSize: '0.76rem', color: SUB }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <Link href="/" className="tk-btnp" style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>{t.shopNow}</Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', borderRadius: 12, border: `1px solid ${BD}`, color: SUB, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            {t.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ============================ STATIC PAGES ============================ */
function Shell({ title, eyebrowTxt, children }: any) {
  return (
    <div>
      <div style={{ background: CARD, borderBottom: `1px solid ${BD}`, padding: '42px 0 36px' }}>
        <div className="tk-wrap">
          <span style={eyebrow}>{eyebrowTxt}</span>
          <h1 className="tk-disp" style={{ fontSize: 'clamp(1.6rem,4.8vw,2.6rem)', fontWeight: 700, letterSpacing: '-.02em', margin: '.35rem 0 0' }}>{title}</h1>
        </div>
      </div>
      <div className="tk-wrap" style={{ paddingTop: '34px', paddingBottom: '60px', maxWidth: 900 }}>{children}</div>
    </div>
  );
}

function InfoBlock({ title, body, i }: any) {
  return (
    <div style={{ padding: 18, marginBottom: 11, background: CARD, border: `1px solid ${BD}`, borderRadius: 16, animation: 'tkUp .5s ease both', animationDelay: `${i * 0.06}s` }}>
      <h2 style={{ fontSize: '.95rem', fontWeight: 600, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <span className="tk-disp" style={{ width: 24, height: 24, borderRadius: 8, background: AL, color: A, display: 'grid', placeItems: 'center', fontSize: '.72rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
        {title}
      </h2>
      <p style={{ fontSize: '.88rem', lineHeight: 1.85, color: SUB, margin: 0 }}>{body}</p>
    </div>
  );
}

export function Privacy({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacyTitle} eyebrowTxt={store?.name || 'ACCESSORIES'}>
      {t.pPrivacy.map((b: any, i: number) => <InfoBlock key={i} i={i} title={b.t} body={b.b} />)}
    </Shell>
  );
}

export function Terms({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.termsTitle} eyebrowTxt={store?.name || 'ACCESSORIES'}>
      {t.pTerms.map((b: any, i: number) => <InfoBlock key={i} i={i} title={b.t} body={b.b} />)}
    </Shell>
  );
}

export function Cookies({ store }: any) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookiesTitle} eyebrowTxt={store?.name || 'ACCESSORIES'}>
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

  const info = [
    c.phone ? { ico: Phone, l: t.callUs, v: c.phone, href: `tel:${c.phone}`, ltr: true } : null,
    c.email ? { ico: Mail, l: t.writeUs, v: c.email, href: `mailto:${c.email}`, ltr: false } : null,
    (c.wilaya || c.address) ? { ico: MapPin, l: t.ourAddress, v: [c.wilaya, c.address].filter(Boolean).join(' — '), href: '', ltr: false } : null,
  ].filter(Boolean) as { ico: any; l: string; v: string; href: string; ltr: boolean }[];

  return (
    <Shell title={t.contactTitle} eyebrowTxt={store?.name || 'ACCESSORIES'}>
      <div className="tk-ct2">
        <div style={{ display: 'grid', gap: 10 }}>
          {info.map((it, i) => {
            const Ico = it.ico;
            return (
              <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'center', padding: 15, background: CARD, border: `1px solid ${BD}`, borderRadius: 14 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: AL, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Ico size={18} color={A} strokeWidth={1.9} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ ...label, marginBottom: 2 }}>{it.l}</span>
                  {it.href ? (
                    <a href={it.href} style={{ color: INK, textDecoration: 'none', fontSize: '.9rem', fontWeight: 500 }}><span dir={it.ltr ? 'ltr' : undefined}>{it.v}</span></a>
                  ) : (
                    <span style={{ fontSize: '.9rem', fontWeight: 500 }}>{it.v}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 18, padding: '22px 20px' }}>
          {ok ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 60, height: 60, margin: '0 auto 16px', borderRadius: 20, background: AL, display: 'grid', placeItems: 'center' }}>
                <Check size={28} color={A} strokeWidth={2.2} />
              </div>
              <p style={{ fontSize: '.95rem', marginBottom: 20 }}>{t.contactSuccess}</p>
              <button type="button" className="tk-btng" style={{ ...btnGhost, width: 'auto' }}
                onClick={() => { setOk(false); setForm({ name: '', email: '', phone: '', message: '' }); }}>
                {t.sendAgain}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 13 }}>
                <label style={label} htmlFor="tkk-n">{t.fullName}</label>
                <input id="tkk-n" style={inputBase} value={form.name} placeholder={t.fullNamePlaceholder}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="tk-form-2" style={{ marginBottom: 13 }}>
                <div>
                  <label style={label} htmlFor="tkk-e">{t.email}</label>
                  <input id="tkk-e" type="email" dir="ltr" style={inputBase} value={form.email} placeholder={t.emailPlaceholder}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                </div>
                <div>
                  <label style={label} htmlFor="tkk-p">{t.phone}</label>
                  <input id="tkk-p" type="tel" dir="ltr" style={inputBase} value={form.phone} placeholder={t.phonePlaceholder}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={label} htmlFor="tkk-m">{t.msg}</label>
                <textarea id="tkk-m" rows={5} style={{ ...inputBase, resize: 'none' }} value={form.message} placeholder={t.msgPlaceholder}
                  onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} />
              </div>
              {err && (
                <p style={{ fontSize: '.78rem', color: ERR, marginBottom: 12, display: 'flex', gap: 5, alignItems: 'center' }}>
                  <AlertCircle size={12} /> {err}
                </p>
              )}
              <button type="button" className="tk-btnp" style={btnPrimary} onClick={send} disabled={sending}>
                {sending ? t.sending : <>{t.send} <Send size={15} /></>}
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