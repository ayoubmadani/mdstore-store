// Order-form copy for each page language (see page.settings.language,
// dashboard/src/pages/editor/components/PageSettingsModal.jsx) — the dir/lang
// HTML attributes alone don't translate anything inside the form itself, so
// every customer-facing string here has to switch with the merchant's choice
// instead of always rendering in Arabic regardless of the selected language.
export type ProductFormLanguage = 'ar' | 'fr' | 'en';

export interface ProductFormStrings {
  formTitle: string;
  formSubtitle: string;
  fullName: string;
  fullNamePlaceholder: string;
  phone: string;
  wilaya: string;
  selectWilaya: string;
  commune: string;
  selectCommune: string;
  loadingCommunes: string;
  selectWilayaFirst: string;
  deliveryType: string;
  home: string;
  office: string;
  selectWilayaForPrice: string;
  quantity: string;
  piece: string;
  product: string;
  offer: string;
  delivery: string;
  homeShort: string;
  officeShort: string;
  unitPrice: string;
  total: string;
  submitting: string;
  submit: string;
  secure: string;
  errorName: string;
  errorPhone: string;
  errorWilaya: string;
  errorCommune: string;
  errorQuantity: string;
  connectionError: string;
  currency: string;
  loading: string;
  pieces: string;
}

const TRANSLATIONS: Record<ProductFormLanguage, ProductFormStrings> = {
  ar: {
    formTitle: 'أدخل بيانات التسليم',
    formSubtitle: 'سنتواصل معك خلال 24 ساعة لتأكيد طلبك',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'محمد أحمد',
    phone: 'رقم الهاتف',
    wilaya: 'الولاية',
    selectWilaya: 'اختر الولاية',
    commune: 'البلدية',
    selectCommune: 'اختر البلدية',
    loadingCommunes: 'جاري التحميل...',
    selectWilayaFirst: 'اختر الولاية أولاً',
    deliveryType: 'نوع التوصيل',
    home: 'توصيل للمنزل',
    office: 'استلام من المكتب',
    selectWilayaForPrice: 'اختر الولاية لعرض تكلفة التوصيل',
    quantity: 'الكمية',
    piece: 'قطعة',
    product: 'المنتج',
    offer: 'العرض',
    delivery: 'التوصيل',
    homeShort: 'المنزل',
    officeShort: 'المكتب',
    unitPrice: 'سعر القطعة',
    total: 'الإجمالي الكلي',
    submitting: 'جاري إرسال الطلب...',
    submit: 'تأكيد الطلب الآن',
    secure: 'بياناتك آمنة ومشفرة 100%',
    errorName: 'الاسم الكامل مطلوب (3 أحرف على الأقل)',
    errorPhone: 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)',
    errorWilaya: 'اختر الولاية',
    errorCommune: 'اختر البلدية',
    errorQuantity: 'الكمية يجب أن تكون 1 على الأقل',
    connectionError: 'حدث خطأ في الاتصال بالخادم',
    currency: 'د.ج',
    loading: 'جارٍ التحميل...',
    pieces: 'قطع',
  },
  fr: {
    formTitle: 'Entrez vos informations de livraison',
    formSubtitle: 'Nous vous contacterons sous 24h pour confirmer votre commande',
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Mohamed Ahmed',
    phone: 'Numéro de téléphone',
    wilaya: 'Wilaya',
    selectWilaya: 'Choisir la wilaya',
    commune: 'Commune',
    selectCommune: 'Choisir la commune',
    loadingCommunes: 'Chargement...',
    selectWilayaFirst: "Choisissez d'abord la wilaya",
    deliveryType: 'Type de livraison',
    home: 'Livraison à domicile',
    office: 'Retrait au bureau',
    selectWilayaForPrice: 'Choisissez la wilaya pour voir le coût de livraison',
    quantity: 'Quantité',
    piece: 'pièce',
    product: 'Produit',
    offer: 'Offre',
    delivery: 'Livraison',
    homeShort: 'Domicile',
    officeShort: 'Bureau',
    unitPrice: 'Prix unitaire',
    total: 'Total général',
    submitting: 'Envoi de la commande...',
    submit: 'Confirmer la commande',
    secure: 'Vos données sont sécurisées et cryptées à 100%',
    errorName: 'Le nom complet est requis (3 caractères minimum)',
    errorPhone: 'Numéro de téléphone algérien valide requis (ex: 0550123456)',
    errorWilaya: 'Choisissez la wilaya',
    errorCommune: 'Choisissez la commune',
    errorQuantity: 'La quantité doit être au moins 1',
    connectionError: 'Une erreur de connexion au serveur est survenue',
    currency: 'DA',
    loading: 'Chargement...',
    pieces: 'pièces',
  },
  en: {
    formTitle: 'Enter your delivery information',
    formSubtitle: "We'll contact you within 24 hours to confirm your order",
    fullName: 'Full name',
    fullNamePlaceholder: 'John Doe',
    phone: 'Phone number',
    wilaya: 'Province',
    selectWilaya: 'Select province',
    commune: 'District',
    selectCommune: 'Select district',
    loadingCommunes: 'Loading...',
    selectWilayaFirst: 'Select the province first',
    deliveryType: 'Delivery type',
    home: 'Home delivery',
    office: 'Office pickup',
    selectWilayaForPrice: 'Select the province to see delivery cost',
    quantity: 'Quantity',
    piece: 'piece',
    product: 'Product',
    offer: 'Offer',
    delivery: 'Delivery',
    homeShort: 'Home',
    officeShort: 'Office',
    unitPrice: 'Unit price',
    total: 'Grand total',
    submitting: 'Submitting order...',
    submit: 'Confirm order now',
    secure: 'Your data is 100% secure and encrypted',
    errorName: 'Full name is required (at least 3 characters)',
    errorPhone: 'A valid Algerian phone number is required (e.g. 0550123456)',
    errorWilaya: 'Select the province',
    errorCommune: 'Select the district',
    errorQuantity: 'Quantity must be at least 1',
    connectionError: 'A server connection error occurred',
    currency: 'DZD',
    loading: 'Loading...',
    pieces: 'pieces',
  },
};

export function getProductFormStrings(language?: string): ProductFormStrings {
  return TRANSLATIONS[(language as ProductFormLanguage) || 'ar'] || TRANSLATIONS.ar;
}
