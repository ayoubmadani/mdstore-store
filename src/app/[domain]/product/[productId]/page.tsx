'use client';

// ==========================================
// VIEW PRODUCT
// ==========================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { notFound } from 'next/navigation';
import {
  ShoppingCart, Check, X, Infinity, MapPin, Phone,
  User, Home, FileText, ChevronDown, Star, Truck,
  Shield, RefreshCw, ChevronLeft, ChevronRight, Package, Building2,
  Share2, Link2, Heart, AlertCircle,
  Tag
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
//import Details from '@/theme/tech-innovation/page/details';
import dynamic from 'next/dynamic';
import AddShow from '@/components/addShow';

const listTheme = ['default', 'boho-chic', 'minimalist-shop', 'tech-innovation', 'e-commerce'];
const selectTheme = listTheme[4];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ─── Types ─────────────────────────────────────────── */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute {
  id: string; type: 'color' | 'size'; name: string;
  displayMode?: 'color' | 'image' | null; variants: Variant[];
}
interface ProductImage { id: string; imageUrl: string; }

/**
 * One attribute slot inside a variant combination.
 * Matches the backend VariantAttributeEntry interface.
 */
interface VariantAttributeEntry {
  attrId: string;
  attrName: string;
  displayMode: 'color' | 'image' | 'text';
  value: string;
}

interface VariantDetail {
  id: number;
  /** Array of attribute entries – replaces the old Record<string,string> shape */
  name: VariantAttributeEntry[];
  price: number;
  stock: number;
  autoGenerate: boolean;
}

interface Product {
  id: string; name: string; price: string | number;
  priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[];
  offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: any
}
interface Wilaya {
  id: string; name: string; ar_name: string;
  livraisonHome: number; livraisonOfice: number;
}
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

/* ─── Helper: match a VariantDetail against the current selection ─── */
/**
 * selectedVariants: { [attrName]: selectedValue }
 * Returns true if every selected attribute matches an entry in detail.name
 */
function variantMatches(
  detail: VariantDetail,
  selectedVariants: Record<string, string>,
): boolean {
  return Object.entries(selectedVariants).every(([attrName, val]) =>
    detail.name.some(entry => entry.attrName === attrName && entry.value === val)
  );
}

/* ─── API functions ─────────────────────────────────── */
async function getProductData(domain: string, productId: string): Promise<Product | null> {
  try {
    const response = await axios.get(
      `${API_URL}/products/public/${encodeURIComponent(domain)}/${productId}`
    );
    console.log(response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('خطأ من السيرفر:', error.response?.data || error.message);
    } else {
      console.error('خطأ غير متوقع:', error);
    }
    return null;
  }
}

const getWilayas = async (userId: string): Promise<Wilaya[]> => {
  try {
    const response = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error from server:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
};

const getCommunes = async (wilayaId: string): Promise<Commune[]> => {
  try {
    const response = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data || [];
  } catch (error) {
    console.error('خطأ في جلب البلديات:', error);
    return [];
  }
};

/* ─── Small components ───────────────────────────────── */
const FieldWrapper = ({ error, children, label }: { error?: string; children: React.ReactNode; label?: string }) => (
  <div className="space-y-1.5">
    {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
    {children}
    {error && (
      <p className="text-xs text-red-500 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

const inputBase = (hasError?: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400
   ${hasError ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'}`;

/* ══════════════════════════════════════════════════════ */
export default function ProductPage({ params }: { params: Promise<{ domain: string; productId: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ domain: string; productId: string } | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  // key = attrName, value = selected variant value (hex / url / text)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const [communes, setCommunes] = useState<Commune[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerWelaya: '',
    customerCommune: '',
    quantity: 1,
    typeLivraison: 'home' as 'home' | 'office',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const selectedWilayaData = useMemo(() =>
    wilayas.find(w => String(w.id) === String(formData.customerWelaya)),
    [wilayas, formData.customerWelaya]
  );

  // ── Load product ──
  useEffect(() => {
    const loadData = async () => {
      try {
        const { domain, productId } = await params;
        setResolvedParams({ domain, productId });
        const data = await getProductData(domain, productId);

        console.log(data);

        if (data) {
          setProduct(data);
          if (data.offers?.length) setSelectedOffer(data.offers[0].id);
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
          setIsWishlisted(wishlist.includes(data.id));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params]);

  useEffect(() => {
    const id = localStorage.getItem('customerId');
    if (id) setFormData(prev => ({ ...prev, customerId: id }));
  }, []);

  useEffect(() => {
    const fetchWilayas = async () => {
      if (product?.store?.userId) {
        const data = await getWilayas(product.store.userId);
        setWilayas(data);
      }
    };
    fetchWilayas();
  }, [product]);

  useEffect(() => {
    const fetchCommunes = async () => {
      if (!formData.customerWelaya) { setCommunes([]); return; }
      setLoadingCommunes(true);
      const data = await getCommunes(formData.customerWelaya);
      setCommunes(data);
      setLoadingCommunes(false);
    };
    fetchCommunes();
  }, [formData.customerWelaya]);

  /* ── Business logic ── */

  const hasOnlyAutoGeneratedVariants = useCallback(() => {
    if (!product?.variantDetails?.length) return false;
    return product.variantDetails.every(v => v.autoGenerate);
  }, [product?.variantDetails]);

  const isInStock = useCallback(() => {
    // if (hasOnlyAutoGeneratedVariants()) return true;
    // if (!product?.variantDetails?.length) return (product?.stock || 0) > 0;
    // if (Object.keys(selectedVariants).length > 0) {
    //   const match = product.variantDetails.find(v => variantMatches(v, selectedVariants));
    //   if (match) return match.autoGenerate || match.stock > 0;
    // }
    // return product.variantDetails.some(v => v.autoGenerate || v.stock > 0);

    return true
  }, [product, selectedVariants, hasOnlyAutoGeneratedVariants]);

  const handleVariantSelection = useCallback((attrName: string, value: string) => {
    setSelectedVariants(prev => {
      const next = { ...prev };
      if (next[attrName] === value) {
        delete next[attrName];
      } else {
        next[attrName] = value;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    console.log(selectedVariants);
  }, [selectedVariants])

  const getFinalPrice = useCallback(() => {
    if (!product) return 0;

    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

    // 1️⃣ أعلى أولوية: سعر العرض المختار
    const offer = product.offers?.find(o => o.id === selectedOffer);
    if (offer) return offer.price;

    // 2️⃣ أولوية ثانية: سعر المتغير – فقط إذا لم يكن -1
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find(v => variantMatches(v, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }

    // 3️⃣ السعر الافتراضي للمنتج
    return base;
  }, [product, selectedVariants, selectedOffer]);

  const getDiscountPercentage = useCallback(() => {
    if (!product?.priceOriginal) return 0;
    const original = parseFloat(product.priceOriginal.toString());
    const current = getFinalPrice();
    return original > current ? Math.round(((original - current) / original) * 100) : 0;
  }, [product?.priceOriginal, getFinalPrice]);

  const getPriceLivraison = useCallback(() => {
    if (!selectedWilayaData) return 0;
    return formData.typeLivraison === 'home'
      ? selectedWilayaData.livraisonHome
      : selectedWilayaData.livraisonOfice;
  }, [selectedWilayaData, formData.typeLivraison]);

  const getVariantDetailId = useCallback(() => {
    if (!product?.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find(v => variantMatches(v, selectedVariants))?.id;
  }, [product?.variantDetails, selectedVariants]);

  const getTotalPrice = useCallback(() =>
    getFinalPrice() * formData.quantity + +getPriceLivraison(),
    [getFinalPrice, formData.quantity, getPriceLivraison]
  );

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.customerName.trim() || formData.customerName.length < 3)
      errors.customerName = 'الاسم الكامل مطلوب (3 أحرف على الأقل)';
    if (!formData.customerPhone.trim() || !/^(0|\+213)[5-7][0-9]{8}$/.test(formData.customerPhone.replace(/\s/g, '')))
      errors.customerPhone = 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)';
    if (!formData.customerWelaya) errors.customerWelaya = 'اختر الولاية';
    if (!formData.customerCommune) errors.customerCommune = 'اختر البلدية';
    if (formData.quantity < 1) errors.quantity = 'الكمية يجب أن تكون 1 على الأقل';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name || 'منتج رائع', text: `شاهد هذا المنتج: ${product?.name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const newWishlist = isWishlisted
      ? wishlist.filter((id: string) => id !== product.id)
      : [...wishlist, product.id];
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setIsWishlisted(!isWishlisted);
  };

  // 1. Add at the top of your file (with other imports)

  // 2. Add inside your component (with other hooks)
  const router = useRouter();
  const currentThemeSlug = product?.store?.theme?.slug || 'default';
  const language = product?.store?.language || 'ar';

  // أضف هذا الجزء داخل ProductPage
  useEffect(() => {
    if (product && typeof window !== 'undefined') {
      const currency = 'DZD'; // أو product.store.currency

      // 1. Facebook ViewContent
      if ((window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', {
          content_name: product.name,
          content_ids: [product.id],
          content_type: 'product',
          value: getFinalPrice(),
          currency: currency,
        });
      }

      // 2. TikTok ViewContent
      if ((window as any).ttq) {
        (window as any).ttq.track('ViewContent', {
          contents: [{
            content_id: product.id,
            content_name: product.name,
            price: getFinalPrice(),
          }],
          value: getFinalPrice(),
          currency: currency,
        });
      }
    }
  }, [product, getFinalPrice]);

  // 1. استخراج الـ slug بأمان (خارج الـ useMemo أو بداخلها)

  // 2. استخدام useMemo لتغليف الاستيراد الديناميكي
  const Details = useMemo(() => {
    return dynamic<any>(
      async () => {
        try {
          // التحميل بناءً على السلوج المستخرج
          const mod = await import(`@/theme/${language}/${currentThemeSlug}/main`);

          // التأكد من استخراج المكون الصحيح (Details أو default)
          return mod.Details || mod.default;
        } catch (error) {
          console.error("خطأ في تحميل الثيم:", currentThemeSlug, error);
          // Fallback للثيم الافتراضي إذا فشل التحميل
          const defaultMod = await import(`@/theme/${language}/default/main`);
          return defaultMod.Details || defaultMod.default;
        }
      },
      {
        loading: () => <p className="p-5 text-center">Loading Theme...</p>,
        ssr: true,
      }
    );
  }, [currentThemeSlug]);

  // 3. Replace your entire handleSubmit with this:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !product) return;
    setSubmitting(true);
    try {
      const variantDetailId = getVariantDetailId();
      const payload = {
        productId: product.id,
        variantDetailId,
        domain: resolvedParams?.domain,
        offerId: selectedOffer ?? undefined,
        quantity: formData.quantity,
        totalPrice: getTotalPrice(),
        typeShip: formData.typeLivraison,
        priceShip: getPriceLivraison(),
        customerId: formData.customerId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerWilayaId: formData.customerWelaya,
        customerCommuneId: formData.customerCommune,
      };

      const res = await axios.post(`${API_URL}/orders`, payload);

      if (res.status === 200 || res.status === 201) {
        localStorage.setItem('last_order', JSON.stringify({
          id: res.data?.order?.id || 'NEW_ORDER',
          total: getTotalPrice(),
          productName: product.name
        }));

        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'purchase', {
            transaction_id: product.id,
            value: getTotalPrice(),
            currency: 'DZD',
            items: [{ item_name: product.name, item_id: product.id, price: getFinalPrice(), quantity: formData.quantity }],
          });
        }

        // Store customer ID for future orders
        if (res.data?.customerId) {
          localStorage.setItem('customerId', res.data.customerId);
        }

        router.push(`/${resolvedParams?.domain}/successfully`);
      }
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-100 rounded-3xl" />
            <div className="space-y-6 pt-4">
              <div className="h-10 bg-gray-100 rounded-xl w-3/4" />
              <div className="h-6 bg-gray-100 rounded-lg w-1/3" />
              <div className="h-40 bg-gray-100 rounded-2xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !product.isActive) return notFound();

  const allImages = [product.productImage, ...(product.imagesProduct?.map(i => i.imageUrl) || [])].filter(Boolean) as string[];
  const allAttrs = product.attributes || [];
  const discount = getDiscountPercentage();
  const finalPrice = getFinalPrice();
  const inStock = isInStock();
  const autoGen = hasOnlyAutoGeneratedVariants();

  // لن يتم إعادة إنشاء المكون إلا إذا تغير الثيم فعلياً

  return (
    <>
      <AddShow productId={product.id} />
      <Details
        product={product}
        toggleWishlist={toggleWishlist}
        isWishlisted={isWishlisted}
        handleShare={handleShare}
        discount={discount}
        allImages={allImages}
        domain={resolvedParams?.domain}
        allAttrs={allAttrs}
        finalPrice={finalPrice}
        inStock={inStock}
        autoGen={autoGen}
        selectedVariants={selectedVariants}
        setSelectedOffer={(id: any) => setSelectedOffer(id)}
        selectedOffer={selectedOffer}
        resolvedParams={resolvedParams}
        handleVariantSelection={(name: any, value: any) => handleVariantSelection(name, value)}
      />
    </>
  );
}



