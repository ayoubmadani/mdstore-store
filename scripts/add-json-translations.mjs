import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const THEMES_AR = path.join(__dirname, '../src/theme/ar');

const JSON_BLOCK = `
// ─── i18n ─────────────────────────────────────────────────────────────────────
type Lang = 'ar' | 'fr';
const getLang = (store?: any): Lang => (store?.language === 'fr' ? 'fr' : 'ar');

const T = {
  ar: {
    dir: 'rtl' as const,
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
    // Order form
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
    // Cart & success
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
  },
  fr: {
    dir: 'ltr' as const,
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
    // Order form
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
    // Cart & success
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
  },
} as const;

`;

let added = 0;
let skipped = 0;

const themes = fs.readdirSync(THEMES_AR).filter(f =>
  fs.existsSync(path.join(THEMES_AR, f, 'main.tsx'))
);

for (const theme of themes) {
  const filePath = path.join(THEMES_AR, theme, 'main.tsx');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has the proper T pattern
  if (content.includes('const T =') && content.includes('getLang')) {
    console.log(`⏭  skip  ${theme} (already has T + getLang)`);
    skipped++;
    continue;
  }

  // Remove old jsonAr/jsonFr block if added by previous run
  const oldBlockRe = /\n\/\/ ─── Translations[^]+?const jsonFr = \{[^}]+(?:\n[^}][^\n]*)*\n\};\n\n/s;
  if (oldBlockRe.test(content)) {
    content = content.replace(oldBlockRe, '\n');
    console.log(`  🔄 removed old jsonAr/jsonFr in ${theme}`);
  }

  // Insert T block before "export default function Main"
  const marker = /^export default function Main/m;
  if (!marker.test(content)) {
    console.log(`⚠  skip  ${theme} (no export default function Main found)`);
    skipped++;
    continue;
  }

  const updated = content.replace(marker, JSON_BLOCK + 'export default function Main');
  fs.writeFileSync(filePath, updated, 'utf-8');
  console.log(`✓  added  ${theme}`);
  added++;
}

console.log(`\n✅ Done: ${added} updated, ${skipped} skipped`);
