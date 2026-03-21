'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingCart, MapPin, Phone, User, Home,
  ChevronDown, Truck, Shield, Package, Check,
  Building2, AlertCircle, Tag, Star
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ─── Types ──────────────────────────────────────────── */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }

export interface Product {
  id: string; name: string; price: string | number;
  priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[];
  offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; };
}

interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

export interface ProductFormProps {
  product: Product;
  userId: string;
  domain: string;
  redirectPath: string;
  selectedOffer: string | null;
  setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>;
  platform?: string;
  priceLoss?: number;
  lpId?:string
}

/* ─── Helper Functions ───────────────────────────────── */
function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some(e => e.attrName === attrName && e.value === val)
  );
}

const fetchWilayas = async (userId: string): Promise<Wilaya[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`);
    return data || [];
  } catch {
    return [];
  }
};

const fetchCommunes = async (wilayaId: string): Promise<Commune[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`);
    return data || [];
  } catch {
    return [];
  }
};

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function ProductForm({
  product, userId, domain, redirectPath,
  selectedOffer, setSelectedOffer, selectedVariants,
  platform, priceLoss = 0,lpId
}: ProductFormProps) {
  const router = useRouter();

  /* ── State ── */
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
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

  /* ── Effects ── */
  useEffect(() => {
    if (userId) {
      fetchWilayas(userId).then(setWilayas);
    }
  }, [userId]);

  useEffect(() => {
    const id = localStorage.getItem('customerId');
    if (id) setFormData(p => ({ ...p, customerId: id }));
  }, []);

  useEffect(() => {
    if (!formData.customerWelaya) {
      setCommunes([]);
      return;
    }
    setLoadingCommunes(true);
    fetchCommunes(formData.customerWelaya).then(data => {
      setCommunes(data);
      setLoadingCommunes(false);
    });
  }, [formData.customerWelaya]);

  /* ── Derived ── */
  const selectedWilayaData = useMemo(
    () => wilayas.find(w => String(w.id) === String(formData.customerWelaya)),
    [wilayas, formData.customerWelaya],
  );

  const getFinalPrice = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as number);
    const offer = product.offers?.find(o => o.id === selectedOffer);
    if (offer) return offer.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find(v => variantMatches(v, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);

  const getPriceLivraison = useCallback((): number => {
    if (!selectedWilayaData) return 0;
    return formData.typeLivraison === 'home'
      ? selectedWilayaData.livraisonHome
      : selectedWilayaData.livraisonOfice;
  }, [selectedWilayaData, formData.typeLivraison]);

  const getTotalPrice = useCallback((): number =>
    getFinalPrice() * formData.quantity + getPriceLivraison(),
    [getFinalPrice, formData.quantity, getPriceLivraison],
  );

  const getVariantDetailId = useCallback(() => {
    if (!product.variantDetails?.length || !Object.keys(selectedVariants).length) return undefined;
    return product.variantDetails.find(v => variantMatches(v, selectedVariants))?.id;
  }, [product.variantDetails, selectedVariants]);

  /* ── Validation ── */
  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!formData.customerName.trim() || formData.customerName.length < 3)
      e.customerName = 'الاسم الكامل مطلوب (3 أحرف على الأقل)';
    if (!/^(0|\+213)[5-7][0-9]{8}$/.test(formData.customerPhone.replace(/\s/g, '')))
      e.customerPhone = 'رقم هاتف جزائري صحيح مطلوب';
    if (!formData.customerWelaya) e.customerWelaya = 'اختر الولاية';
    if (!formData.customerCommune) e.customerCommune = 'اختر البلدية';
    if (formData.quantity < 1) e.quantity = 'الكمية يجب أن تكون 1 على الأقل';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/orders`, {
        productId: product.id,
        variantDetailId: getVariantDetailId(),
        storeId: product.store.id,
        offerId: selectedOffer ?? undefined,
        platform,
        quantity: formData.quantity,
        totalPrice: getTotalPrice(),
        typeShip: formData.typeLivraison,
        priceShip: getPriceLivraison(),
        priceLoss,
        customerId: formData.customerId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerWilayaId: formData.customerWelaya,
        customerCommuneId: formData.customerCommune,
        lpId
      });

      if (res.status === 200 || res.status === 201) {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'purchase', {
            transaction_id: product.id,
            value: getTotalPrice(), currency: 'DZD',
            items: [{ item_name: product.name, item_id: product.id, price: getFinalPrice(), quantity: formData.quantity }],
          });
        }
        if (res.data?.customerId) localStorage.setItem('customerId', res.data.customerId);
        router.push(redirectPath);
      }
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  const finalPrice = getFinalPrice();
  const totalPrice = getTotalPrice();

  return (
    <div className="mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-1">إتمام الطلب</h1>
        <p className="text-indigo-100 text-sm">أدخل بياناتك وسنتواصل معك خلال 24 ساعة</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">

        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700 text-sm">المعلومات الشخصية</span>
          </div>
          <div className="p-4 space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="محمد أحمد"
                  className={`w-full pr-10 pl-3 py-2.5 bg-white border rounded-lg text-sm outline-none transition-colors
                    ${formErrors.customerName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`}
                />
              </div>
              {formErrors.customerName && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{formErrors.customerName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.customerPhone}
                  onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="0550 123 456"
                  className={`w-full pr-10 pl-3 py-2.5 bg-white border rounded-lg text-sm outline-none transition-colors font-mono
                    ${formErrors.customerPhone ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`}
                />
              </div>
              {formErrors.customerPhone && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{formErrors.customerPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700 text-sm">عنوان التسليم</span>
          </div>
          <div className="p-4 space-y-3">
            {/* Wilaya */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">الولاية</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={formData.customerWelaya}
                  onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })}
                  className={`w-full pr-10 pl-8 py-2.5 bg-white border rounded-lg text-sm outline-none appearance-none cursor-pointer
                    ${formErrors.customerWelaya ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`}
                >
                  <option value="">اختر الولاية</option>
                  {wilayas.map(w => (
                    <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {formErrors.customerWelaya && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{formErrors.customerWelaya}
                </p>
              )}
            </div>

            {/* Commune */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">البلدية</label>
              <div className="relative">
                <Building2 className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={formData.customerCommune}
                  disabled={!formData.customerWelaya || loadingCommunes}
                  onChange={e => setFormData({ ...formData, customerCommune: e.target.value })}
                  className={`w-full pr-10 pl-8 py-2.5 bg-white border rounded-lg text-sm outline-none appearance-none cursor-pointer disabled:bg-slate-50
                    ${formErrors.customerCommune ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`}
                >
                  <option value="">
                    {loadingCommunes ? 'جاري التحميل...' : formData.customerWelaya ? 'اختر البلدية' : 'اختر الولاية أولاً'}
                  </option>
                  {communes.map(c => (
                    <option key={c.id} value={c.id}>{c.ar_name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {formErrors.customerCommune && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{formErrors.customerCommune}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Type */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700 text-sm">طريقة التوصيل</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {(['home', 'office'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, typeLivraison: type })}
                  className={`relative p-3 rounded-lg border-2 text-center transition-all
                    ${formData.typeLivraison === type
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center
                    ${formData.typeLivraison === type ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {type === 'home' ? <Home className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>
                  <p className="text-xs font-bold text-slate-700">{type === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}</p>
                  {selectedWilayaData && (
                    <p className="text-xs text-indigo-600 font-bold mt-1">
                      {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} د.ج
                    </p>
                  )}
                  {formData.typeLivraison === type && (
                    <div className="absolute top-1 left-1">
                      <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-700 text-sm">الكمية</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 active:bg-slate-50"
              >
                <span className="text-lg leading-none">−</span>
              </button>
              <span className="w-8 text-center font-bold text-slate-900">{formData.quantity}</span>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 active:bg-slate-50"
              >
                <span className="text-lg leading-none">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <h4 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            ملخص الطلب
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>سعر المنتج</span>
              <span className="font-bold text-slate-900">{finalPrice.toLocaleString('ar-DZ')} د.ج × {formData.quantity}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>التوصيل ({formData.typeLivraison === 'home' ? 'منزل' : 'مكتب'})</span>
              <span className="font-bold text-slate-900">
                {selectedWilayaData ? `${getPriceLivraison().toLocaleString('ar-DZ')} د.ج` : '--'}
              </span>
            </div>
            <div className="h-px bg-slate-200 my-2" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">الإجمالي</span>
              <span className="text-xl font-black text-indigo-600">
                {totalPrice.toLocaleString('ar-DZ')}
                <span className="text-sm font-bold text-slate-500 mr-1">د.ج</span>
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all
            ${submitting 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
            }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري إرسال الطلب...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              تأكيد الطلب الآن
            </span>
          )}
        </button>

        {/* Security Note */}
        <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          بياناتك مشفرة ومحمية 100%
        </p>
      </form>
    </div>
  );
}