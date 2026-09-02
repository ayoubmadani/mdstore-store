'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { ShoppingBag, Search, Menu, X, ChevronLeft, ChevronRight, Trash2, Plus, Minus, Check, MapPin, Phone, Mail, Package, Truck, MessageCircle, Download } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

/* ============================================================
   PURE COTTON BASICS — Structural + Visual Theme
   Concept: raw, undyed cotton fabric. Cards are "fabric swatches"
   stitched at the edges (dashed seam border). A single thread-red
   accent (#B8693F) stands in for the stitching thread color used
   throughout. Typography: a wide-tracked display face for labels,
   a quiet humanist body face for everything else.
   ============================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ---------------- Types ---------------- */
interface Offer { id: string; name: string; subTitle?: string; quantity: number; price: number; shippingFree?: boolean; }
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
  slug?: string;
}

interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number; store?: any;
}

/* ---------------- Helpers ---------------- */
function variantMatches(d: VariantDetail, sel: Record<string, string>) {
  return Object.entries(sel).every(([n, v]) => d.name.some((e) => e.attrName === n && e.value === v));
}

let __varCounter = 0;
function getVarId() {
  __varCounter += 1;
  return `${Date.now()}-${__varCounter}`;
}

const fetchWilayas = async (uid: string): Promise<Wilaya[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/public/get-shipping/${uid}`);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
};

const fetchCommunes = async (wid: string): Promise<Commune[]> => {
  try {
    const r = await fetch(`${API_URL}/shipping/get-communes/${wid}`);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
};

/* ---------------- Shared Style ---------------- */
function ThemeStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700;900&display=swap');

      :root {
        --cotton-50:  #FBF8F3;
        --cotton-100: #F2ECE1;
        --cotton-200: #E5DBC9;
        --cotton-300: #C9BCA3;
        --thread-ink: #2E2A24;
        --thread-soft: #6E6457;
        --thread-red: #B8693F;
        --thread-red-dark: #95502C;
      }
      .pc-root * { box-sizing: border-box; }
      .pc-root {
        font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif;
        color: var(--thread-ink);
        background: var(--cotton-50);
      }
      .pc-display { font-family: 'Tajawal', sans-serif; letter-spacing: 0.5px; }

      /* stitched seam divider */
      .pc-seam {
        border: none;
        border-top: 2px dashed var(--cotton-300);
        margin: 0;
      }
      .pc-stitch-border {
        border: 1.5px dashed var(--cotton-300);
      }

      .pc-btn {
        font-family: inherit;
        cursor: pointer;
        border: none;
        border-radius: 2px;
        transition: all .2s ease;
      }
      .pc-btn-primary {
        background: var(--thread-ink);
        color: var(--cotton-50);
        padding: 13px 26px;
        font-weight: 600;
        font-size: 14px;
        letter-spacing: 0.3px;
      }
      .pc-btn-primary:hover { background: var(--thread-red-dark); }
      .pc-btn-outline {
        background: transparent;
        border: 1.5px solid var(--thread-ink);
        color: var(--thread-ink);
        padding: 11px 24px;
        font-weight: 600;
        font-size: 14px;
      }
      .pc-btn-outline:hover { background: var(--thread-ink); color: var(--cotton-50); }

      ::placeholder { color: var(--thread-soft); opacity: .8; }

      @media (max-width: 768px) {
        .pc-hide-mobile { display: none !important; }
      }
      @media (min-width: 769px) {
        .pc-hide-desktop { display: none !important; }
      }

      .pc-det-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 28px;
      }
      @media (min-width: 768px) {
        .pc-det-grid { grid-template-columns: 1.1fr 1fr; gap: 44px; }
      }

      .pc-cart-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
      }
      @media (min-width: 800px) {
        .pc-cart-grid { grid-template-columns: 1.3fr 1fr; gap: 36px; }
      }

      .pc-contact-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 28px;
      }
      @media (min-width: 768px) {
        .pc-contact-grid { grid-template-columns: 1fr 1.2fr; gap: 40px; }
      }
    `}</style>
  );
}

/* ============================================================
   MAIN
   ============================================================ */

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
  orderEmail: 'البريد الإلكتروني',
  orderEmailPh: 'example@email.com',
  errEmail: 'يرجى إدخال بريد إلكتروني صحيح',
  whatsapp: 'رقم واتساب',
  whatsappPh: '0550123456',
  errWhatsapp: 'رقم واتساب جزائري صحيح مطلوب (مثال: 0550123456)',
  contactQuestion: 'هل تملك بريداً إلكترونياً أم واتساب؟',
  contactViaEmail: 'البريد الإلكتروني',
  contactViaWhatsapp: 'واتساب',
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
  successSteps: [
    { title: 'تم استلام طلبك', desc: 'تم تسجيل طلبك بنجاح في نظامنا' },
    { title: 'تأكيد الطلب', desc: 'سنتصل بك خلال 24 ساعة' },
    { title: 'التجهيز والتغليف', desc: 'يتم تجهيز طلبك بعناية' },
    { title: 'الشحن والتوصيل', desc: '2-5 أيام عمل' },
  ],
  checkoutTitle: 'إتمام الطلب',
  // Product
  offersTitle: 'العروض المتاحة',
  descTitle: 'الوصف',
  // Footer
  quickLinks: 'روابط سريعة', legalNav: 'قانوني',
  contactSect: 'تواصل معنا',
  privacy: 'الخصوصية',
  terms: 'الشروط',
  rightsReserved: 'جميع الحقوق محفوظة',
  currency: 'دج',
  heroBadge: 'قطن ١٠٠٪ — أساسيات يومية',
  heroTitleFallback: 'بساطة تلامس الجلد',
  trust: [
    { t: 'شحن لكل الولايات', d: 'توصيل سريع وآمن' },
    { t: 'قطن طبيعي ١٠٠٪', d: 'جودة فائقة، نسيج مريح' },
    { t: 'دفع عند الاستلام', d: 'ادفع وأنت مطمئن' },
    { t: 'دعم العملاء', d: 'نجيبك في أي وقت' },
  ],
  browseCategory: 'تسوّق حسب الفئة',
  noProductsNow: 'لا توجد منتجات حالياً',
  footerDesc: 'قطع قطنية بسيطة، مريحة، وصُنعت لتدوم.',
  rightsReservedFull: 'جميع الحقوق محفوظة.',
  links: 'روابط',
  privacyLabel: 'سياسة الخصوصية',
  termsLabel: 'الشروط والأحكام',
  cookiesLabel: 'الكوكيز',
  offersLabel: 'العروض',
  freeShippingBadge: '🚚 توصيل مجاني',
  freeShippingThreshold: '🚚 توصيل مجاني للطلبات بـ {{amount}} دج أو أكثر',
  freeShippingRemaining: 'أضف {{amount}} دج أخرى للحصول على توصيل مجاني',
  freeShippingReached: '🎉 حصلت على توصيل مجاني!',
  orderFormTitle: 'إتمام الطلب',
  addToCartBtn: 'إضافة إلى السلة',
  forHome: 'للمنزل',
  forOffice: 'للمكتب',
  qtyLabel: 'الكمية',
  qtyItem: 'الكمية:',
  totalLabel: 'المجموع',
  deliveryInfoTitle: 'معلومات التوصيل',
  cartPageTitle: 'سلة التسوق',
  cartOrderDone: 'تم استلام طلبك',
  cartOrderDoneDesc: 'سنتواصل معك قريباً لتأكيد الطلب.',
  continueShopping: 'متابعة التسوق',
  cartEmptyTitle: 'سلتك فارغة',
  cartEmptyMsg: 'لم تقم بإضافة أي منتج بعد.',
  sendingAlt: 'جارٍ الإرسال...',
  completeOrder: 'إتمام الطلب',
  contactTitle: 'اتصل بنا',
  contactIntro: 'يسعدنا تواصلك معنا لأي استفسار حول منتجاتنا أو طلبك.',
  contactSentTitle: 'تم إرسال رسالتك',
  contactSentDesc: 'سنتواصل معك في أقرب وقت.',
  sendAnotherMsg: 'إرسال رسالة أخرى',
  namePh: 'الاسم',
  emailPh: 'البريد الإلكتروني',
  phonePh2: 'رقم الهاتف',
  messagePh: 'رسالتك',
  sendMsgBtn: 'إرسال الرسالة',
  privacyTitle: 'سياسة الخصوصية',
  priv1t: 'جمع المعلومات', priv1b: 'نقوم بجمع المعلومات الضرورية فقط لإتمام طلبك وتحسين تجربتك معنا، مثل الاسم ورقم الهاتف وعنوان التوصيل.',
  priv2t: 'استخدام البيانات', priv2b: 'تُستخدم بياناتك حصراً لمعالجة الطلبات والتواصل بخصوصها، ولا تتم مشاركتها مع أي طرف ثالث دون موافقتك.',
  priv3t: 'حماية المعلومات', priv3b: 'نتخذ كافة الإجراءات التقنية لحماية بياناتك من أي وصول غير مصرح به.',
  termsTitle: 'الشروط والأحكام',
  terms1t: 'استخدام المتجر', terms1b: 'باستخدامك لهذا المتجر فإنك توافق على الشروط والأحكام المذكورة هنا، والالتزام بالاستخدام السليم للمنصة.',
  terms2t: 'الطلبات والدفع', terms2b: 'يتم تأكيد الطلب بعد التواصل الهاتفي، والدفع يكون عند الاستلام ما لم يُذكر خلاف ذلك.',
  terms3t: 'الإرجاع والاستبدال', terms3b: 'يمكن إرجاع أو استبدال المنتج خلال مدة محددة في حال وجود عيب أو خطأ في الطلب.',
  cookiesTitle: 'سياسة ملفات تعريف الارتباط',
  cook1t: 'ما هي الكوكيز', cook1b: 'هي ملفات صغيرة تُخزَّن في متصفحك لتحسين تجربة تصفحك للمتجر.',
  cook2t: 'كيفية استخدامها', cook2b: 'نستخدمها لحفظ محتوى سلة التسوق وتذكر تفضيلاتك أثناء التصفح.',
  cook3t: 'التحكم بالكوكيز', cook3b: 'يمكنك تعطيل الكوكيز من إعدادات المتصفح، إلا أن ذلك قد يؤثر على بعض وظائف المتجر.',
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
  orderEmail: 'E-mail',
  orderEmailPh: 'exemple@email.com',
  errEmail: 'Veuillez saisir une adresse e-mail valide',
  whatsapp: 'Numéro WhatsApp',
  whatsappPh: '0550123456',
  errWhatsapp: 'Numéro WhatsApp algérien valide requis (ex: 0550123456)',
  contactQuestion: 'Avez-vous un e-mail ou un numéro WhatsApp ?',
  contactViaEmail: 'E-mail',
  contactViaWhatsapp: 'WhatsApp',
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
  successSteps: [
    { title: 'Commande reçue', desc: 'Votre commande a été enregistrée avec succès' },
    { title: 'Confirmation', desc: 'Nous vous appellerons sous 24h' },
    { title: 'Préparation', desc: 'Votre commande est préparée avec soin' },
    { title: 'Livraison', desc: '2-5 jours ouvrables' },
  ],
  checkoutTitle: 'Finaliser la commande',
  // Product
  offersTitle: 'Offres groupées',
  descTitle: 'Description',
  // Footer
  quickLinks: 'Navigation', legalNav: 'Légal',
  contactSect: 'Contact',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  rightsReserved: 'Tous droits réservés.',
  currency: 'DZD',
  heroBadge: 'Coton 100% — Basiques quotidiens',
  heroTitleFallback: 'La simplicité qui touche la peau',
  trust: [
    { t: 'Livraison partout', d: 'Rapide et sécurisée' },
    { t: 'Coton naturel 100%', d: 'Qualité supérieure, tissu doux' },
    { t: 'Paiement à la réception', d: 'Payez en toute confiance' },
    { t: 'Support client', d: 'Disponible à tout moment' },
  ],
  browseCategory: 'Acheter par catégorie',
  noProductsNow: 'Aucun produit disponible',
  footerDesc: "Basiques en coton, simples, confortables et durables.",
  rightsReservedFull: 'Tous droits réservés.',
  links: 'Navigation',
  privacyLabel: 'Politique de confidentialité',
  termsLabel: "Conditions générales",
  cookiesLabel: 'Cookies',
  offersLabel: 'Offres',
  freeShippingBadge: '🚚 Livraison gratuite',
  freeShippingThreshold: '🚚 Livraison gratuite dès {{amount}} DZD d\'achat',
  freeShippingRemaining: 'Ajoutez {{amount}} DZD de plus pour la livraison gratuite',
  freeShippingReached: '🎉 Livraison gratuite obtenue !',
  orderFormTitle: 'Finaliser la commande',
  addToCartBtn: 'Ajouter au panier',
  forHome: 'À domicile',
  forOffice: 'Point relais',
  qtyLabel: 'Quantité',
  qtyItem: 'Quantité :',
  totalLabel: 'Total',
  deliveryInfoTitle: 'Informations de livraison',
  cartPageTitle: 'Mon Panier',
  cartOrderDone: 'Commande reçue',
  cartOrderDoneDesc: 'Nous vous contacterons bientôt pour confirmer.',
  continueShopping: 'Continuer les achats',
  cartEmptyTitle: 'Votre panier est vide',
  cartEmptyMsg: "Vous n'avez pas encore ajouté de produit.",
  sendingAlt: 'Envoi en cours...',
  completeOrder: 'Finaliser la commande',
  contactTitle: 'Nous contacter',
  contactIntro: "Nous sommes heureux de vous aider pour toute question sur nos produits.",
  contactSentTitle: 'Message envoyé',
  contactSentDesc: 'Nous vous contacterons dans les meilleurs délais.',
  sendAnotherMsg: 'Envoyer un autre message',
  namePh: 'Nom',
  emailPh: 'Adresse e-mail',
  phonePh2: 'Téléphone',
  messagePh: 'Votre message',
  sendMsgBtn: 'Envoyer le message',
  privacyTitle: 'Politique de confidentialité',
  priv1t: 'Collecte', priv1b: 'Nous collectons uniquement les informations nécessaires pour traiter votre commande.',
  priv2t: 'Utilisation', priv2b: 'Vos données sont utilisées exclusivement pour traiter les commandes.',
  priv3t: 'Protection', priv3b: 'Nous prenons toutes les mesures techniques pour protéger vos données.',
  termsTitle: "Conditions d'utilisation",
  terms1t: 'Utilisation', terms1b: "En utilisant cette boutique, vous acceptez les conditions d'utilisation.",
  terms2t: 'Commandes et paiement', terms2b: 'La commande est confirmée après contact téléphonique. Paiement à la réception.',
  terms3t: 'Retours et échanges', terms3b: 'Retours possibles dans un délai défini en cas de défaut ou erreur.',
  cookiesTitle: 'Politique des cookies',
  cook1t: "Qu'est-ce que les cookies", cook1b: 'Ce sont de petits fichiers stockés dans votre navigateur.',
  cook2t: 'Utilisation', cook2b: 'Utilisés pour sauvegarder le panier et vos préférences.',
  cook3t: 'Contrôle', cook3b: 'Vous pouvez désactiver les cookies dans les paramètres du navigateur.',
};

type Lang = 'ar' | 'fr' | 'en';
const getLang = (store?: any): Lang => {
  if (store?.language === 'fr') return 'fr';
  if (store?.language === 'en') return 'en';
  return 'ar';
};
const T: Record<Lang, typeof jsonAr> = { ar: jsonAr, fr: jsonFr as any, en: jsonFr as any };

export default function Main({ store, children, domain }: any) {
  const t = T[getLang(store)];
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="pc-root" dir={t.dir} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ThemeStyle />
      <Navbar store={store} domain={domain} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

/* ============================================================
   NAVBAR
   ============================================================ */
export function Navbar({ store, domain }: any) {
  const t = T[getLang(store)];
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listSearch, setListSearch] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const debounceRef = useRef<any>(null);

  const count = useCartStore((s: any) => s.count);
  const initCount = useCartStore((s: any) => s.initCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      initCount(Array.isArray(arr) ? arr.length : 0);
    } catch { initCount(0); }
  }, [domain, initCount]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) { setListSearch([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/products/public/${domain}?search=${encodeURIComponent(searchQuery)}`);
        const data = await r.json();
        setListSearch(Array.isArray(data) ? data : data?.products || []);
      } catch { setListSearch([]); }
      setLoading(false);
    }, 380);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, domain]);

  const submitSearch = () => {
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
  };

  const showCart = store?.cart !== false;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--cotton-50)' }}>
      {store?.topBar?.enabled && store?.topBar?.text && (
        <div style={{ background: 'var(--thread-ink)', color: 'var(--cotton-50)', textAlign: 'center', fontSize: 12.5, padding: '7px 12px', letterSpacing: .4 }}>
          {store.topBar.text}
        </div>
      )}
      <div style={{
        borderBottom: scrolled ? '1.5px solid var(--cotton-200)' : '1.5px dashed var(--cotton-300)',
        transition: 'border-color .25s ease',
        background: 'var(--cotton-50)',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {/* mobile hamburger */}
          <button className="pc-btn pc-hide-desktop" onClick={() => setOpen(true)} style={{ background: 'none', padding: 6 }} aria-label="القائمة">
            <Menu size={24} color="var(--thread-ink)" />
          </button>

          {/* logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            {store?.design?.logoUrl && !imgError ? (
              <img src={store.design.logoUrl} alt={store?.name} onError={() => setImgError(true)} style={{ height: 38, objectFit: 'contain', maxWidth: 160 }} />
            ) : (
              <span className="pc-display" style={{ fontSize: 21, fontWeight: 900, color: 'var(--thread-ink)' }}>
                {store?.name || 'متجر'}
              </span>
            )}
          </Link>

          {/* desktop links */}
          <nav className="pc-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <Link href="/" style={{ color: 'var(--thread-ink)', textDecoration: 'none', fontSize: 14.5, fontWeight: 500 }}>{t.home}</Link>
            <Link href="/contact" style={{ color: 'var(--thread-ink)', textDecoration: 'none', fontSize: 14.5, fontWeight: 500 }}>{t.contact}</Link>
          </nav>

          {/* desktop search */}
          <div className="pc-hide-mobile" style={{ position: 'relative', flex: '0 1 320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--cotton-300)', borderRadius: 2, padding: '8px 12px', background: '#fff' }}>
              <Search size={16} color="var(--thread-soft)" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); if (e.key === 'Escape') setSearchQuery(''); }}
                placeholder={t.search}
                style={{ border: 'none', outline: 'none', flex: 1, marginInline: 8, fontSize: 13.5, background: 'transparent', fontFamily: 'inherit' }}
              />
              {searchQuery.length > 0 && (
                <button className="pc-btn" onClick={() => setSearchQuery('')} style={{ background: 'none', padding: 2, display: 'flex', alignItems: 'center' }}>
                  <X size={15} color="var(--thread-soft)" />
                </button>
              )}
            </div>
            {searchQuery.length >= 2 && (
              <div style={{ position: 'absolute', top: '110%', insetInlineStart: 0, insetInlineEnd: 0, background: '#fff', border: '1.5px solid var(--cotton-200)', borderRadius: 2, boxShadow: '0 12px 24px rgba(0,0,0,.08)', maxHeight: 360, overflowY: 'auto', zIndex: 60 }}>
                {loading && <div style={{ padding: 14, fontSize: 13, color: 'var(--thread-soft)' }}>{t.searching}</div>}
                {!loading && listSearch.length === 0 && <div style={{ padding: 14, fontSize: 13, color: 'var(--thread-soft)' }}>{t.noResults}</div>}
                {!loading && listSearch.slice(0, 6).map((p) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', textDecoration: 'none', color: 'var(--thread-ink)', borderBottom: '1px dashed var(--cotton-200)' }}>
                    <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 2 }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                  </Link>
                ))}
                {listSearch.length > 0 && (
                  <Link href={`/?search=${encodeURIComponent(searchQuery)}`} style={{ display: 'block', padding: 12, textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: 'var(--thread-red)', textDecoration: 'none' }}>
                    {t.showAll}
                  </Link>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="pc-btn pc-hide-desktop" onClick={() => setShowSearch((s) => !s)} style={{ background: 'none', padding: 6 }} aria-label="بحث">
              <Search size={21} color="var(--thread-ink)" />
            </button>
            {showCart && (
              <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: 6, textDecoration: 'none' }}>
                <ShoppingBag size={22} color="var(--thread-ink)" />
                {count > 0 && (
                  <span style={{ position: 'absolute', top: -4, insetInlineStart: -4, background: 'var(--thread-red)', color: '#fff', fontSize: 10.5, fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {count}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* mobile search bar */}
        {showSearch && (
          <div className="pc-hide-desktop" style={{ padding: '0 16px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--cotton-300)', borderRadius: 2, padding: '9px 12px', background: '#fff' }}>
              <Search size={16} color="var(--thread-soft)" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); if (e.key === 'Escape') setSearchQuery(''); }}
                placeholder={t.search}
                autoFocus
                style={{ border: 'none', outline: 'none', flex: 1, marginInline: 8, fontSize: 13.5, background: 'transparent', fontFamily: 'inherit' }}
              />
              {searchQuery.length > 0 && (
                <button className="pc-btn" onClick={() => setSearchQuery('')} style={{ background: 'none', padding: 2, display: 'flex', alignItems: 'center' }}>
                  <X size={15} color="var(--thread-soft)" />
                </button>
              )}
            </div>
            {searchQuery.length >= 2 && (
              <div style={{ marginTop: 8, background: '#fff', border: '1.5px solid var(--cotton-200)', borderRadius: 2, maxHeight: 300, overflowY: 'auto' }}>
                {loading && <div style={{ padding: 12, fontSize: 13 }}>{t.searching}</div>}
                {!loading && listSearch.slice(0, 6).map((p) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', textDecoration: 'none', color: 'var(--thread-ink)' }}>
                    <img src={p.productImage || p.imagesProduct?.[0]?.imageUrl} alt={p.name} style={{ width: 34, height: 34, objectFit: 'cover' }} />
                    <span style={{ fontSize: 13 }}>{p.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* mobile drawer */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.4)' }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, insetInlineStart: 0, width: '78%', maxWidth: 300, height: '100%', background: 'var(--cotton-50)', padding: 22, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <button className="pc-btn" onClick={() => setOpen(false)} style={{ background: 'none', alignSelf: 'flex-end' }}><X size={22} /></button>
            <Link href="/" onClick={() => setOpen(false)} style={{ color: 'var(--thread-ink)', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>{t.home}</Link>
            <Link href="/contact" onClick={() => setOpen(false)} style={{ color: 'var(--thread-ink)', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>{t.contact}</Link>
            {showCart && <Link href="/cart" onClick={() => setOpen(false)} style={{ color: 'var(--thread-ink)', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>{t.cart}</Link>}
          </div>
        </div>
      )}
    </header>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
export function Footer({ store }: any) {
  const t = T[getLang(store)];
  const showCart = store?.cart !== false;
  return (
    <footer style={{ background: 'var(--cotton-100)', borderTop: '2px dashed var(--cotton-300)', marginTop: 60 }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '48px 20px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 32 }}>
        <div>
          <span className="pc-display" style={{ fontSize: 19, fontWeight: 900 }}>{store?.name}</span>
          <p style={{ marginTop: 10, fontSize: 13.5, color: 'var(--thread-soft)', lineHeight: 1.9, maxWidth: 280 }}>
            {store?.hero?.subtitle || t.footerDesc}
          </p>
          <p style={{ marginTop: 14, fontSize: 12, color: 'var(--thread-soft)' }}>© {new Date().getFullYear()} {store?.name}. {t.rightsReservedFull}</p>
        </div>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: .4 }}>{t.links}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/" style={{ fontSize: 13.5, color: 'var(--thread-soft)', textDecoration: 'none' }}>{t.home}</Link>
            {showCart && <Link href="/cart" style={{ fontSize: 13.5, color: 'var(--thread-soft)', textDecoration: 'none' }}>{t.cart}</Link>}
            <Link href="/contact" style={{ fontSize: 13.5, color: 'var(--thread-soft)', textDecoration: 'none' }}>{t.contact}</Link>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: .4 }}>{t.legalNav}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/privacy" style={{ fontSize: 13.5, color: 'var(--thread-soft)', textDecoration: 'none' }}>{t.privacyLabel}</Link>
            <Link href="/terms" style={{ fontSize: 13.5, color: 'var(--thread-soft)', textDecoration: 'none' }}>{t.termsLabel}</Link>
            <Link href="/cookies" style={{ fontSize: 13.5, color: 'var(--thread-soft)', textDecoration: 'none' }}>{t.cookiesLabel}</Link>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: .4 }}>{t.contactSect}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5, color: 'var(--thread-soft)' }}>
            {store?.contact?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} /> {store.contact.phone}</span>}
            {store?.contact?.email && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={14} /> {store.contact.email}</span>}
            {(store?.contact?.wilaya || store?.contact?.address) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={14} /> {store?.contact?.wilaya} {store?.contact?.address}</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   CARD
   ============================================================ */
export function Card({ product, displayImage, discount, store }: any) {
  return (
    <Link href={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none', color: 'var(--thread-ink)', display: 'block' }}>
      <div className="pc-stitch-border" style={{ background: '#fff', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'relative', aspectRatio: '4/5', background: 'var(--cotton-100)' }}>
          {displayImage ? (
            <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={36} color="var(--cotton-300)" />
            </div>
          )}
          {discount > 0 && (
            <span style={{ position: 'absolute', top: 10, insetInlineStart: 10, background: 'var(--thread-red)', color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '4px 9px', borderRadius: 2 }}>
              -{discount}%
            </span>
          )}
          {product.isDigital ? (
            <span style={{ position: 'absolute', top: 10, insetInlineEnd: 10, background: 'var(--thread-red)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
              <Download size={12} />
            </span>
          ) : product.shippingFree && (
            <span style={{ position: 'absolute', top: 10, insetInlineEnd: 10, background: 'var(--thread-ink)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 2 }}>
              🚚
            </span>
          )}
        </div>
        <div style={{ padding: '14px 14px 16px' }}>
          <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 42 }}>
            {product.name}
          </p>
          <div style={{ display: 'flex', gap: 2, margin: '6px 0' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ color: 'var(--thread-red)', fontSize: 12 }}>★</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>{product.price} {store?.currency}</span>
            {product.priceOriginal && Number(product.priceOriginal) > Number(product.price) && (
              <span style={{ fontSize: 12.5, color: 'var(--thread-soft)', textDecoration: 'line-through' }}>{product.priceOriginal} {store?.currency}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   HOME
   ============================================================ */
export function Home({ store, page }: any) {
  const t = T[getLang(store)];
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const products: Product[] = store?.products || [];
  const countPage = Math.ceil((store?.count || products.length) / 48);
  const currentPage = page || 1;

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', background: 'var(--cotton-100)', overflow: 'hidden' }}>
        {store?.hero?.imageUrl && (
          <img src={store.hero.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .22 }} />
        )}
        <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto', padding: '90px 20px 70px', textAlign: 'center' }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 2, color: 'var(--thread-red)', textTransform: 'uppercase' }}>{t.heroBadge}</span>
          <h1
            className="pc-display"
            style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 900, margin: '16px 0', lineHeight: 1.25 }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store?.hero?.title || t.heroTitleFallback) }}
          />
          {store?.hero?.subtitle && (
            <p style={{ fontSize: 16, color: 'var(--thread-soft)', maxWidth: 520, margin: '0 auto 30px', lineHeight: 1.8 }}>{store.hero.subtitle}</p>
          )}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#products" className="pc-btn pc-btn-primary">{t.shopNow}</a>
            {store?.cart !== false && <Link href="/cart" className="pc-btn pc-btn-outline">{t.cart}</Link>}
          </div>
        </div>
        <hr className="pc-seam" />
      </section>

      {/* TRUST BAR */}
      <section style={{ borderBottom: '2px dashed var(--cotton-300)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 18, textAlign: 'center' }}>
          {t.trust.map((it, i) => (
            <div key={i}>
              <p style={{ fontSize: 13.5, fontWeight: 700 }}>{it.t}</p>
              <p style={{ fontSize: 12, color: 'var(--thread-soft)', marginTop: 4 }}>{it.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {store?.categories?.length > 0 && (
        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 20px 10px' }}>
          <h2 className="pc-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>{t.browseCategory}</h2>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
            <Link href="/" className="pc-btn-outline pc-btn" style={{ whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block', padding: '9px 18px', fontSize: 13, borderColor: !category ? 'var(--thread-red)' : undefined }}>
              {t.all}
            </Link>
            {store.categories.map((c: any) => (
              <Link key={c.id} href={`/?category=${c.id}`} className="pc-btn-outline pc-btn" style={{ whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block', padding: '9px 18px', fontSize: 13, borderColor: category === c.id ? 'var(--thread-red)' : undefined }}>
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCTS GRID */}
      <section id="products" style={{ maxWidth: 1240, margin: '0 auto', padding: '34px 20px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 18 }}>
          {products.map((p) => {
            const discount = p.priceOriginal && Number(p.priceOriginal) > Number(p.price)
              ? Math.round(((Number(p.priceOriginal) - Number(p.price)) / Number(p.priceOriginal)) * 100)
              : 0;
            return <Card key={p.id} product={p} displayImage={p.productImage || p.imagesProduct?.[0]?.imageUrl} discount={discount} store={store} viewDetails />;
          })}
        </div>
        {products.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--thread-soft)', padding: '60px 0' }}>{t.noProductsNow}</p>
        )}

        {/* PAGINATION */}
        {countPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            {Array.from({ length: countPage }).map((_, i) => {
              const pg = i + 1;
              return (
                <Link
                  key={pg}
                  href={{ query: { page: pg } }}
                  scroll={false}
                  className="pc-btn"
                  style={{
                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid var(--cotton-300)', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    color: pg === Number(currentPage) ? '#fff' : 'var(--thread-ink)',
                    background: pg === Number(currentPage) ? 'var(--thread-ink)' : 'transparent',
                  }}
                >
                  {pg}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   DETAILS
   ============================================================ */
export function Details({ product, discount, allImages, allAttrs, finalPrice, selectedVariants, setSelectedOffer, selectedOffer, handleVariantSelection, domain, store }: any) {
  const t = T[getLang(store || product?.store)];
  const [sel, setSel] = useState(0);
  const images: string[] = allImages?.length ? allImages : [product?.productImage].filter(Boolean);

  return (
    <div className="pc-det-grid" style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 20px 70px' }}>
      {/* GALLERY */}
      <div>
        <div className="pc-stitch-border" style={{ position: 'relative', aspectRatio: '4/5', background: 'var(--cotton-100)', borderRadius: 3, overflow: 'hidden' }}>
          {images[sel] && <img src={images[sel]} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          {discount > 0 && (
            <span style={{ position: 'absolute', top: 12, insetInlineStart: 12, background: 'var(--thread-red)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 2 }}>-{discount}%</span>
          )}
          {images.length > 1 && (
            <>
              <button className="pc-btn" onClick={() => setSel((s) => (s - 1 + images.length) % images.length)} style={{ position: 'absolute', top: '50%', insetInlineStart: 10, transform: 'translateY(-50%)', background: '#fff', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
              <button className="pc-btn" onClick={() => setSel((s) => (s + 1) % images.length)} style={{ position: 'absolute', top: '50%', insetInlineEnd: 10, transform: 'translateY(-50%)', background: '#fff', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {images.map((img, i) => (
              <button key={i} className="pc-btn" onClick={() => setSel(i)} style={{ padding: 0, width: 64, height: 64, border: i === sel ? '2px solid var(--thread-red)' : '1.5px dashed var(--cotton-300)', borderRadius: 2, overflow: 'hidden', background: 'none' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* INFO */}
      <div>
        <h1 className="pc-display" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.4 }}>{product?.name}</h1>
        <div style={{ display: 'flex', gap: 2, margin: '8px 0 16px' }}>
          {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ color: 'var(--thread-red)' }}>★</span>)}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 22 }}>{finalPrice} {product?.store ? '' : ''}</div>

        {(product?.shippingFree || ((store || product?.store)?.supportFreeShipping && (store || product?.store)?.freeShippingMinAmount != null)) && (
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--thread-red)', marginBottom: 16 }}>
            {product?.shippingFree ? t.freeShippingBadge : t.freeShippingThreshold.replace('{{amount}}', String((store || product?.store).freeShippingMinAmount))}
          </p>
        )}

        {product?.offers?.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t.offersLabel}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {product.offers.map((o: Offer) => (
                <label key={o.id} className="pc-stitch-border" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 2, cursor: 'pointer', borderColor: selectedOffer === o.id ? 'var(--thread-red)' : undefined }}>
                  <input type="radio" name="offer" checked={selectedOffer === o.id} onChange={() => setSelectedOffer(o.id)} />
                  <span style={{ fontSize: 13.5 }}>
                    {o.name} — {o.quantity} × {o.price}
                    {o.subTitle && <span style={{ display: 'block', fontSize: 11.5, opacity: 0.7 }}>{o.subTitle}</span>}
                    {o.shippingFree && <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--thread-red)' }}>{t.freeShippingBadge}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {allAttrs?.map((attr: Attribute) => (
          <div key={attr.id} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{attr.name}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {attr.variants.map((v) => {
                const active = selectedVariants?.[attr.name] === v.value;
                const available = !product.variantDetails?.length || product.variantDetails.some((vd: any) =>
                  Object.entries({ ...selectedVariants, [attr.name]: v.value }).every(
                    ([n, val]) => vd.name.some((e: any) => e.attrName === n && e.value === val)
                  )
                );
                if (attr.displayMode === 'color') {
                  return <button key={v.id} className="pc-btn" onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ width: 32, height: 32, borderRadius: '50%', background: v.value, border: active ? '2.5px solid var(--thread-red)' : '1.5px solid var(--cotton-300)', cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35 }} />;
                }
                if (attr.displayMode === 'image') {
                  return <button key={v.id} className="pc-btn" onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ width: 50, height: 50, padding: 0, border: active ? '2.5px solid var(--thread-red)' : '1.5px solid var(--cotton-300)', overflow: 'hidden', cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.35 }}><img src={v.value} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></button>;
                }
                return (
                  <button key={v.id} className="pc-btn" onClick={() => available && handleVariantSelection(attr.name, v.value)} style={{ padding: '8px 16px', fontSize: 13, border: active ? '2px solid var(--thread-red)' : '1.5px solid var(--cotton-300)', background: active ? 'var(--cotton-100)' : 'transparent', cursor: available ? 'pointer' : 'not-allowed', color: available ? 'inherit' : '#bbb', textDecoration: available ? 'none' : 'line-through' }}>
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <ProductForm
          product={product}
          userId={product?.store?.userId}
          domain={domain}
          selectedOffer={selectedOffer}
          setSelectedOffer={setSelectedOffer}
          selectedVariants={selectedVariants}
          store={store || product?.store}
        />

        {product?.desc && (
          <div style={{ marginTop: 30, paddingTop: 24, borderTop: '2px dashed var(--cotton-300)', fontSize: 13.5, lineHeight: 1.9, color: 'var(--thread-soft)' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PRODUCT FORM
   ============================================================ */
export function ProductForm({ product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, store }: ProductFormProps) {
  const t = T[getLang(store || product?.store)];
  const cur = (store || product?.store)?.currency || t.currency;
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);

  const [isOrderNow, setIsOrderNow] = useState(false);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fd, setFd] = useState({
    customerId: '', customerName: '', customerPhone: '',
    customerEmail: '', customerWhatsapp: '',
    customerWelaya: '', customerCommune: '',
    quantity: 1, priceLoss: 0,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');

  useEffect(() => {
    if (userId) fetchWilayas(userId).then(setWilayas);
    try {
      const cid = localStorage.getItem('customerId');
      if (cid) setFd((f) => ({ ...f, customerId: cid }));
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (fd.customerWelaya) fetchCommunes(fd.customerWelaya).then(setCommunes);
    else setCommunes([]);
  }, [fd.customerWelaya]);

  const getFP = (): number => {
    if (selectedOffer && product.offers) {
      const o = product.offers.find((x) => x.id === selectedOffer);
      if (o) return o.price;
    }
    if (product.variantDetails) {
      const match = product.variantDetails.find((d) => variantMatches(d, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return Number(product.price);
  };

  const supportQty = ((store || product.store)?.supportQty) !== false;
  const fp = getFP();
  const qty = supportQty ? fd.quantity : 1;
  const selOfferObj = product.offers?.find((o) => o.id === selectedOffer);
  const storeInfo = store || product.store;
  const orderFreeShipping = !!(product.shippingFree || selOfferObj?.shippingFree ||
    (storeInfo?.supportFreeShipping && storeInfo?.freeShippingMinAmount != null && (fp * qty) >= Number(storeInfo.freeShippingMinAmount)));

  const getLiv = (): number => {
    if (product.isDigital) return 0;
    if (orderFreeShipping) return 0;
    const w = wilayas.find((x) => String(x.id) === String(fd.customerWelaya));
    if (!w) return 0;
    return Number(fd.typeLivraison === 'home' ? w.livraisonHome : w.livraisonOfice);
  };

  const total = () => fp * qty + getLiv();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) e.customerPhone = t.errPhoneInvalid;
    if (product.isDigital) {
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

  const addToCart = () => {
    if (product.store?.cart === false) return;
    try {
      const raw = localStorage.getItem(domain);
      const arr = raw ? JSON.parse(raw) : [];
      const item = {
        ...fd,
        quantity: qty,
        product,
        variantDetailId: getVarId(),
        productId: product.id,
        storeId: product.store.id,
        userId,
        selectedOffer,
        selectedVariants,
        platform,
        finalPrice: fp,
        totalPrice: fp * qty,
        priceLivraison: getLiv(),
        addedAt: new Date().toISOString(),
      };
      arr.push(item);
      localStorage.setItem(domain, JSON.stringify(arr));
      initCount(arr.length);
    } catch {}
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { customerWelaya, customerCommune, typeLivraison, priceLoss, customerEmail, customerWhatsapp, ...rest } = fd;
      const shipping = product.isDigital
        ? { ...(contactMethod === 'email' ? { customerEmail } : { customerWhatsapp }) }
        : { customerWelaya, customerCommune, typeLivraison, priceLoss };
      const payload = {
        ...rest,
        ...shipping,
        quantity: qty,
        product,
        variantDetailId: getVarId(),
        productId: product.id,
        storeId: product.store.id,
        userId,
        selectedOffer,
        selectedVariants,
        platform,
        finalPrice: fp,
        totalPrice: fp * qty,
        priceLivraison: getLiv(),
      };
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (r.ok) {
        if (data?.customerId) localStorage.setItem('customerId', data.customerId);
        router.push(`/successfully?productId=${product.id}`);
      }
    } catch {}
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: 24 }}>
      {!isOrderNow && !product.isDigital ? (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {product.store?.cart !== false && (
            <button className="pc-btn pc-btn-outline" onClick={addToCart} style={{ flex: 1, minWidth: 160 }}>{t.addToCartBtn}</button>
          )}
          <button className="pc-btn pc-btn-primary" onClick={() => setIsOrderNow(true)} style={{ flex: 1, minWidth: 160 }}>{t.orderNow}</button>
        </div>
      ) : (
        <div className="pc-stitch-border" style={{ padding: 20, borderRadius: 3, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14.5 }}>{t.orderFormTitle}</p>
            {!product.isDigital && (
              <button className="pc-btn" onClick={() => setIsOrderNow(false)} style={{ background: 'none' }}><X size={18} /></button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <input placeholder={t.fullNamePh} value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })}
                style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }} />
              {errors.customerName && <p style={{ color: 'var(--thread-red)', fontSize: 12, marginTop: 4 }}>{errors.customerName}</p>}
            </div>
            <div>
              <input placeholder={t.phonePh} value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })}
                style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }} />
              {errors.customerPhone && <p style={{ color: 'var(--thread-red)', fontSize: 12, marginTop: 4 }}>{errors.customerPhone}</p>}
            </div>
            {product.isDigital ? (
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{t.contactQuestion}</p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <button type="button" className="pc-btn" onClick={() => { setContactMethod('email'); setFd(p => ({ ...p, customerWhatsapp: '' })); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', border: contactMethod === 'email' ? '2px solid var(--thread-red)' : '1.5px solid var(--cotton-300)', background: contactMethod === 'email' ? 'var(--cotton-100)' : 'transparent', fontSize: 13 }}>
                    <Mail size={14} />{t.contactViaEmail}
                  </button>
                  <button type="button" className="pc-btn" onClick={() => { setContactMethod('whatsapp'); setFd(p => ({ ...p, customerEmail: '' })); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', border: contactMethod === 'whatsapp' ? '2px solid var(--thread-red)' : '1.5px solid var(--cotton-300)', background: contactMethod === 'whatsapp' ? 'var(--cotton-100)' : 'transparent', fontSize: 13 }}>
                    <MessageCircle size={14} />{t.contactViaWhatsapp}
                  </button>
                </div>
                {contactMethod === 'email' ? (
                  <div>
                    <input type="email" dir="ltr" placeholder={t.orderEmailPh} value={fd.customerEmail} onChange={(e) => setFd({ ...fd, customerEmail: e.target.value })}
                      style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }} />
                    {errors.customerEmail && <p style={{ color: 'var(--thread-red)', fontSize: 12, marginTop: 4 }}>{errors.customerEmail}</p>}
                  </div>
                ) : (
                  <div>
                    <input type="tel" dir="ltr" placeholder={t.whatsappPh} value={fd.customerWhatsapp} onChange={(e) => setFd({ ...fd, customerWhatsapp: e.target.value })}
                      style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }} />
                    {errors.customerWhatsapp && <p style={{ color: 'var(--thread-red)', fontSize: 12, marginTop: 4 }}>{errors.customerWhatsapp}</p>}
                  </div>
                )}
              </div>
            ) : (
            <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <select value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}
                  style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }}>
                  <option value="">{t.wilayaPh}</option>
                  {wilayas.map((w) => <option key={w.id} value={w.id}>{w.ar_name || w.name}</option>)}
                </select>
                {errors.customerWelaya && <p style={{ color: 'var(--thread-red)', fontSize: 12, marginTop: 4 }}>{errors.customerWelaya}</p>}
              </div>
              <div>
                <select value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })}
                  style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }}>
                  <option value="">{t.communePh}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name || c.name}</option>)}
                </select>
                {errors.customerCommune && <p style={{ color: 'var(--thread-red)', fontSize: 12, marginTop: 4 }}>{errors.customerCommune}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="pc-btn" onClick={() => setFd({ ...fd, typeLivraison: 'home' })} style={{ flex: 1, padding: '10px', border: fd.typeLivraison === 'home' ? '2px solid var(--thread-red)' : '1.5px solid var(--cotton-300)', background: fd.typeLivraison === 'home' ? 'var(--cotton-100)' : 'transparent', fontSize: 13 }}>{t.forHome}</button>
              <button className="pc-btn" onClick={() => setFd({ ...fd, typeLivraison: 'office' })} style={{ flex: 1, padding: '10px', border: fd.typeLivraison === 'office' ? '2px solid var(--thread-red)' : '1.5px solid var(--cotton-300)', background: fd.typeLivraison === 'office' ? 'var(--cotton-100)' : 'transparent', fontSize: 13 }}>{t.forOffice}</button>
            </div>
            </>
            )}

            {supportQty && !product.isDigital && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13 }}>{t.qtyLabel}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button className="pc-btn" onClick={() => setFd({ ...fd, quantity: Math.max(1, fd.quantity - 1) })} style={{ width: 30, height: 30, border: '1.5px solid var(--cotton-300)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                  <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{fd.quantity}</span>
                  <button className="pc-btn" onClick={() => setFd({ ...fd, quantity: fd.quantity + 1 })} style={{ width: 30, height: 30, border: '1.5px solid var(--cotton-300)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                </div>
              </div>
            )}

            <div style={{ borderTop: '2px dashed var(--cotton-300)', paddingTop: 12, fontSize: 13.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{product.name}</span><span>{fp} {cur} × {qty}</span></div>
              {!product.isDigital && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t.delivery}</span><span>{!wilayas.find((x) => String(x.id) === String(fd.customerWelaya)) ? '—' : orderFreeShipping ? t.freeShippingBadge : `${getLiv()} ${cur}`}</span></div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15.5 }}><span>{t.totalLabel}</span><span>{total()} {cur}</span></div>
            </div>

            <button className="pc-btn pc-btn-primary" onClick={submitOrder} disabled={submitting} style={{ marginTop: 6 }}>
              {submitting ? t.sendingAlt : t.confirmOrder}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CART
   ============================================================ */
export function Cart({ domain, store }: any) {
  const t = T[getLang(store)];
  const cur = store?.currency || t.currency;
  const router = useRouter();
  const initCount = useCartStore((s: any) => s.initCount);
  const [items, setItems] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fd, setFd] = useState({
    customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', typeLivraison: 'home' as 'home' | 'office',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(domain);
      setItems(raw ? JSON.parse(raw) : []);
    } catch { setItems([]); }
  }, [domain]);

  useEffect(() => {
    const uid = items?.[0]?.userId || store?.userId;
    if (uid) fetchWilayas(uid).then(setWilayas);
  }, [items, store]);

  useEffect(() => {
    if (fd.customerWelaya) fetchCommunes(fd.customerWelaya).then(setCommunes);
    else setCommunes([]);
  }, [fd.customerWelaya]);

  const cartTotal = items.reduce((s, it) => s + (it.finalPrice || 0) * (it.quantity || 1), 0);
  const hasFreeShippingItem = items.some((i) => i.product?.shippingFree || i.product?.offers?.find((o: any) => o.id === i.selectedOffer)?.shippingFree);
  const freeShippingMin = store?.supportFreeShipping ? store?.freeShippingMinAmount : null;
  const freeShippingReached = hasFreeShippingItem || (freeShippingMin != null && cartTotal >= Number(freeShippingMin));
  const freeShippingRemainingAmt = freeShippingMin != null ? Number(freeShippingMin) - cartTotal : 0;

  const selW = wilayas.find((x) => String(x.id) === String(fd.customerWelaya));

  const getLiv = () => {
    if (freeShippingReached) return 0;
    if (!selW) return 0;
    return Number(fd.typeLivraison === 'home' ? selW.livraisonHome : selW.livraisonOfice);
  };

  const finalTotal = cartTotal + getLiv();

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    localStorage.setItem(domain, JSON.stringify(next));
    initCount(next.length);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fd.customerName.trim()) e.customerName = t.errName;
    if (!/^(0|\+213)[5-7]\d{8}$/.test(fd.customerPhone)) e.customerPhone = t.errPhoneInvalid;
    if (!fd.customerWelaya) e.customerWelaya = t.errWilaya;
    if (!fd.customerCommune) e.customerCommune = t.errCommune;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orders = items.map((it) => ({ ...it, ...fd, priceLivraison: getLiv() }));
      const r = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orders),
      });
      if (r.ok) {
        localStorage.removeItem(domain);
        initCount(0);
        setItems([]);
        setSuccess(true);
      }
    } catch {}
    setSubmitting(false);
  };

  if (success) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '90px 20px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--thread-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={30} color="#fff" />
        </div>
        <h2 className="pc-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{t.cartOrderDone}</h2>
        <p style={{ color: 'var(--thread-soft)', fontSize: 14 }}>{t.cartOrderDoneDesc}</p>
        <Link href="/" className="pc-btn pc-btn-primary" style={{ marginTop: 24, display: 'inline-block', textDecoration: 'none' }}>{t.continueShopping}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '90px 20px', textAlign: 'center' }}>
        <ShoppingBag size={48} color="var(--cotton-300)" style={{ margin: '0 auto 16px' }} />
        <h2 className="pc-display" style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{t.cartEmptyTitle}</h2>
        <p style={{ color: 'var(--thread-soft)', fontSize: 14, marginBottom: 24 }}>{t.cartEmptyMsg}</p>
        <Link href="/" className="pc-btn pc-btn-primary" style={{ textDecoration: 'none' }}>{t.shopNow}</Link>
      </div>
    );
  }

  return (
    <div dir={t.dir} className="pc-cart-grid" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>
      <div>
        <h1 className="pc-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>{t.cartPageTitle}</h1>
        {freeShippingMin != null && (
          <div style={{ background: freeShippingReached ? 'var(--cotton-100)' : '#fff', border: '1.5px dashed var(--cotton-300)', color: freeShippingReached ? 'var(--thread-red)' : 'var(--thread-ink)', borderRadius: 2, padding: '10px 14px', marginBottom: 16, fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
            {freeShippingReached ? t.freeShippingReached : t.freeShippingRemaining.replace('{{amount}}', String(freeShippingRemainingAmt))}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it, idx) => (
            <div key={idx} className="pc-stitch-border" style={{ display: 'flex', gap: 14, padding: 14, borderRadius: 2, background: '#fff' }}>
              <img src={it.product?.productImage || it.product?.imagesProduct?.[0]?.imageUrl} alt={it.product?.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 2 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 13.5 }}>{it.product?.name}</p>
                <p style={{ fontSize: 12.5, color: 'var(--thread-soft)', marginTop: 4 }}>{t.qtyItem} {it.quantity} × {it.finalPrice} {cur}</p>
              </div>
              <button className="pc-btn" onClick={() => removeItem(idx)} style={{ background: 'none', alignSelf: 'flex-start' }}><Trash2 size={17} color="var(--thread-red)" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="pc-stitch-border" style={{ padding: 20, borderRadius: 3, background: '#fff', height: 'fit-content' }}>
        <p style={{ fontWeight: 700, marginBottom: 16 }}>{t.deliveryInfoTitle}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <input placeholder={t.fullNamePh} value={fd.customerName} onChange={(e) => setFd({ ...fd, customerName: e.target.value })}
              style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }} />
            {errors.customerName && <p style={{ color: 'var(--thread-red)', fontSize: 12, marginTop: 4 }}>{errors.customerName}</p>}
          </div>
          <div>
            <input placeholder={t.phonePh} value={fd.customerPhone} onChange={(e) => setFd({ ...fd, customerPhone: e.target.value })}
              style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }} />
            {errors.customerPhone && <p style={{ color: 'var(--thread-red)', fontSize: 12, marginTop: 4 }}>{errors.customerPhone}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select value={fd.customerWelaya} onChange={(e) => setFd({ ...fd, customerWelaya: e.target.value, customerCommune: '' })}
              style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }}>
              <option value="">{t.wilayaPh}</option>
              {wilayas.map((w) => <option key={w.id} value={w.id}>{w.ar_name || w.name}</option>)}
            </select>
            <select value={fd.customerCommune} onChange={(e) => setFd({ ...fd, customerCommune: e.target.value })}
              style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }}>
              <option value="">{t.communePh}</option>
              {communes.map((c) => <option key={c.id} value={c.id}>{c.ar_name || c.name}</option>)}
            </select>
          </div>
          {(errors.customerWelaya || errors.customerCommune) && <p style={{ color: 'var(--thread-red)', fontSize: 12 }}>{errors.customerWelaya || errors.customerCommune}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="pc-btn" onClick={() => setFd({ ...fd, typeLivraison: 'home' })} style={{ flex: 1, padding: '10px', border: fd.typeLivraison === 'home' ? '2px solid var(--thread-red)' : '1.5px solid var(--cotton-300)', background: fd.typeLivraison === 'home' ? 'var(--cotton-100)' : 'transparent', fontSize: 13 }}>{t.forHome}</button>
            <button className="pc-btn" onClick={() => setFd({ ...fd, typeLivraison: 'office' })} style={{ flex: 1, padding: '10px', border: fd.typeLivraison === 'office' ? '2px solid var(--thread-red)' : '1.5px solid var(--cotton-300)', background: fd.typeLivraison === 'office' ? 'var(--cotton-100)' : 'transparent', fontSize: 13 }}>{t.forOffice}</button>
          </div>

          <div style={{ borderTop: '2px dashed var(--cotton-300)', paddingTop: 12, fontSize: 13.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t.subtotal}</span><span>{cartTotal} {cur}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t.delivery}</span><span>{!selW ? '—' : freeShippingReached ? t.freeShippingBadge : `${getLiv()} ${cur}`}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15.5 }}><span>{t.totalLabel}</span><span>{finalTotal} {cur}</span></div>
          </div>

          <button className="pc-btn pc-btn-primary" onClick={submitOrder} disabled={submitting}>
            {submitting ? t.sendingAlt : t.completeOrder}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Success({ store, order }: { store: any; domain: string; order: any }) {
  const t = T[getLang(store)];
  const currency = store?.currency || 'DZD';
  const steps = [
    { icon: Check, ...t.successSteps[0] },
    { icon: Phone, ...t.successSteps[1] },
    { icon: Package, ...t.successSteps[2] },
    { icon: Truck, ...t.successSteps[3] },
  ];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '70px 20px 90px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--thread-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={30} color="#fff" />
        </div>
        <h2 className="pc-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{t.successTitle}</h2>
        <p style={{ color: 'var(--thread-soft)', fontSize: 14, lineHeight: 1.7 }}>{t.successDesc}</p>
      </div>

      {order && (order.productName || order.total != null) && (
        <div style={{ border: '1.5px solid var(--thread-ink)', padding: '18px 20px', marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--thread-soft)', marginBottom: 10 }}>{t.orderInfo}</p>
          {order.productName && (
            <div style={{ paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--thread-soft)', fontSize: 14, fontWeight: 700 }}>{order.productName}</div>
          )}
          {order.total != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--thread-soft)' }}>{t.total}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--thread-red)' }}>{Number(order.total).toLocaleString()} {currency}</span>
            </div>
          )}
        </div>
      )}

      <div style={{ border: '1.5px solid var(--thread-ink)', marginBottom: 28 }}>
        {steps.map((step, i) => {
          const Icon = step.icon; const done = i === 0;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < steps.length - 1 ? '1px solid var(--thread-soft)' : 'none', background: done ? 'rgba(184,105,63,0.08)' : 'transparent' }}>
              <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--thread-red)' : 'transparent', border: done ? 'none' : '1.5px solid var(--thread-soft)', color: done ? '#fff' : 'var(--thread-soft)' }}>
                <Icon size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--thread-ink)' : 'var(--thread-soft)', marginBottom: 2 }}>{step.title}</p>
                <p style={{ fontSize: 12, color: 'var(--thread-soft)' }}>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'center' }}>
        <Link href="/" className="pc-btn pc-btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>{t.shopNow}</Link>
        <Link href="/" className="pc-btn pc-btn-outline" style={{ textDecoration: 'none', display: 'inline-block' }}>{t.continueShopping}</Link>
      </div>
    </div>
  );
}

/* ============================================================
   STATIC PAGES
   ============================================================ */
function Shell({ title, dir, children }: { title: string; dir?: string; children: React.ReactNode }) {
  return (
    <div dir={dir}>
      <div style={{ background: 'var(--thread-ink)', color: 'var(--cotton-50)', padding: '60px 20px', textAlign: 'center' }}>
        <h1 className="pc-display" style={{ fontSize: 28, fontWeight: 800 }}>{title}</h1>
      </div>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 70px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {children}
      </div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--thread-soft)' }}>{body}</p>
    </div>
  );
}

export function Privacy({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.privacyTitle} dir={t.dir}>
      <InfoBlock title={t.priv1t} body={t.priv1b} />
      <InfoBlock title={t.priv2t} body={t.priv2b} />
      <InfoBlock title={t.priv3t} body={t.priv3b} />
    </Shell>
  );
}

export function Terms({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.termsTitle} dir={t.dir}>
      <InfoBlock title={t.terms1t} body={t.terms1b} />
      <InfoBlock title={t.terms2t} body={t.terms2b} />
      <InfoBlock title={t.terms3t} body={t.terms3b} />
    </Shell>
  );
}

export function Cookies({ store }: { store?: any }) {
  const t = T[getLang(store)];
  return (
    <Shell title={t.cookiesTitle} dir={t.dir}>
      <InfoBlock title={t.cook1t} body={t.cook1b} />
      <InfoBlock title={t.cook2t} body={t.cook2b} />
      <InfoBlock title={t.cook3t} body={t.cook3b} />
    </Shell>
  );
}

export function Contact({ store }: any) {
  const t = T[getLang(store)];
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await fetch(`${API_URL}/user/contact-user/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeId: store?.id }),
      });
      if (r.ok) setSent(true);
    } catch {}
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '100px 20px', textAlign: 'center' }}>
        <Check size={40} color="var(--thread-red)" style={{ margin: '0 auto 16px' }} />
        <h2 className="pc-display" style={{ fontSize: 21, fontWeight: 800, marginBottom: 10 }}>{t.contactSentTitle}</h2>
        <p style={{ color: 'var(--thread-soft)', fontSize: 14, marginBottom: 22 }}>{t.contactSentDesc}</p>
        <button className="pc-btn pc-btn-outline" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}>{t.sendAnotherMsg}</button>
      </div>
    );
  }

  return (
    <div dir={t.dir} className="pc-contact-grid" style={{ maxWidth: 1000, margin: '0 auto', padding: '50px 20px 80px' }}>
      <div>
        <h1 className="pc-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 14 }}>{t.contactTitle}</h1>
        <p style={{ color: 'var(--thread-soft)', fontSize: 14, lineHeight: 1.9, marginBottom: 26 }}>{t.contactIntro}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
          {store?.contact?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Phone size={16} color="var(--thread-red)" /> {store.contact.phone}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><MapPin size={16} color="var(--thread-red)" /> {store?.contact?.wilaya} {store?.contact?.address}</span>
        </div>
      </div>
      <div className="pc-stitch-border" style={{ padding: 22, borderRadius: 3, background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder={t.namePh} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }} />
        <input placeholder={t.emailPh} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{ padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }} />
        <input placeholder={t.phonePh2} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={{ padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit' }} />
        <textarea placeholder={t.messagePh} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          style={{ padding: '11px 13px', border: '1.5px solid var(--cotton-300)', borderRadius: 2, fontSize: 13.5, fontFamily: 'inherit', resize: 'vertical' }} />
        <button className="pc-btn pc-btn-primary" onClick={submit} disabled={submitting}>{submitting ? t.sendingAlt : t.sendMsgBtn}</button>
      </div>
    </div>
  );
}

export function StaticPage({ staticPage, page, store }: any) {
  const p = (staticPage || page || '').toLowerCase();
  if (p === 'privacy') return <Privacy store={store} />;
  if (p === 'terms') return <Terms store={store} />;
  if (p === 'cookies') return <Cookies store={store} />;
  if (p === 'contact') return <Contact store={store} />;
  return null;
}