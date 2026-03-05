'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingCart, MapPin, Phone, User, Home,
  ChevronDown, Truck, Shield, Package,
  Building2, AlertCircle, Tag,
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ─── Types ──────────────────────────────────────────── */
interface Offer        { id: string; name: string; quantity: number; price: number; }
interface Variant      { id: string; name: string; value: string; }
interface Attribute    { id: string; type: string; name: string; displayMode?: 'color' | 'image' | null; variants: Variant[]; }
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

interface Wilaya  { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn:number;}
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

export interface ProductFormProps {
  product:          Product;
  userId:           string;
  domain:           string;       // subdomain – used in payload & redirect
  redirectPath:     string;       // e.g. "/lp/domain/successfully" or "/domain/successfully"
  selectedOffer:    string | null;
  setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>;
  platform?:        string;       // LP only
  priceLoss?:       number;       // LP only
}

/* ─── Helpers ────────────────────────────────────────── */
function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some(e => e.attrName === attrName && e.value === val)
  );
}

const fetchWilayas  = async (userId: string): Promise<Wilaya[]>  => {
  try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`); return data || [];}
  
  
  catch { return []; }
};
const fetchCommunes = async (wilayaId: string): Promise<Commune[]> => {
  try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`); return data || []; }
  catch { return []; }
};

/* ─── Small UI ───────────────────────────────────────── */
const FieldWrapper = ({ error, children, label }: {
  error?: string; children: React.ReactNode; label?: string;
}) => (
  <div className="space-y-1.5">
    {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
    {children}
    {error && (
      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const inputCls = (err?: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400
   ${err
     ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
     : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'}`;

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function ProductForm({
  product, userId, domain,
  selectedOffer, setSelectedOffer, selectedVariants,
  platform, priceLoss = 0,
}: ProductFormProps) {
  const router = useRouter();

  /* ── Shipping state ── */
  const [wilayas,         setWilayas]         = useState<Wilaya[]>([]);
  const [communes,        setCommunes]        = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  /* ── Form state ── */
  const [formData, setFormData] = useState({
    customerId:      '',
    customerName:    '',
    customerPhone:   '',
    customerWelaya:  '',
    customerCommune: '',
    quantity:        1,
    priceLoss:0,
    typeLivraison:   'home' as 'home' | 'office',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  /* ── Effects ── */
  useEffect(() => {
    if (userId) fetchWilayas(userId).then(setWilayas);
  }, [userId]);

  useEffect(() => {
    const id = localStorage.getItem('customerId');
    if (id) setFormData(p => ({ ...p, customerId: id }));
  }, []);

  useEffect(() => {
    if (!formData.customerWelaya) { setCommunes([]); return; }
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

  useEffect(()=>{
    if (selectedWilayaData) {
          setFormData({...formData , priceLoss: selectedWilayaData.livraisonReturn})
    }
  },[selectedWilayaData, formData.typeLivraison])

  

  const getTotalPrice = useCallback((): number =>
    getFinalPrice() * formData.quantity + +getPriceLivraison(),
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
      e.customerName  = 'الاسم الكامل مطلوب (3 أحرف على الأقل)';
    if (!/^(0|\+213)[5-7][0-9]{8}$/.test(formData.customerPhone.replace(/\s/g, '')))
      e.customerPhone = 'رقم هاتف جزائري صحيح مطلوب (مثال: 0550123456)';
    if (!formData.customerWelaya)  e.customerWelaya  = 'اختر الولاية';
    if (!formData.customerCommune) e.customerCommune = 'اختر البلدية';
    if (formData.quantity < 1)     e.quantity        = 'الكمية يجب أن تكون 1 على الأقل';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }, [formData]);

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const payload = {
        productId:         product.id,
        variantDetailId:   getVariantDetailId(),
        domain,
        offerId:           selectedOffer ?? undefined,
        platform,
        quantity:          formData.quantity,
        totalPrice:        getTotalPrice(),
        typeShip:          formData.typeLivraison,
        priceShip:         getPriceLivraison(),
        priceLoss:         formData.priceLoss,
        customerId:        formData.customerId,
        customerName:      formData.customerName,
        customerPhone:     formData.customerPhone,
        customerWilayaId:  formData.customerWelaya,
        customerCommuneId: formData.customerCommune,
      }
      
      setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/orders`, payload);

      if (res.status === 200 || res.status === 201) {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'purchase', {
            transaction_id: product.id,
            value: getTotalPrice(), currency: 'DZD',
            items: [{ item_name: product.name, item_id: product.id, price: getFinalPrice(), quantity: formData.quantity }],
          });
        }
        if (res.data?.customerId) localStorage.setItem('customerId', res.data.customerId);
        router.push(`/successfully`);
      }
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  const finalPrice = getFinalPrice();

  /* ── Render ── */
  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl shadow-gray-900/5">

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <p className="font-bold text-gray-900">أدخل بيانات التسليم</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">سنتواصل معك خلال 24 ساعة لتأكيد طلبك</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerName} label="الاسم الكامل">
            <div className="relative">
              <User className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
              <input type="text" value={formData.customerName} placeholder="محمد أحمد"
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className={`${inputCls(!!formErrors.customerName)} pr-10`} />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerPhone} label="رقم الهاتف">
            <div className="relative">
              <Phone className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
              <input type="tel" dir="ltr" value={formData.customerPhone} placeholder="0550 123 456"
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                className={`${inputCls(!!formErrors.customerPhone)} pr-10 font-mono`} />
            </div>
          </FieldWrapper>
        </div>

        {/* Wilaya + Commune */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerWelaya} label="الولاية">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
              <select value={formData.customerWelaya}
                onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })}
                className={`${inputCls(!!formErrors.customerWelaya)} pr-10 appearance-none cursor-pointer`}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerCommune} label="البلدية">
            <div className="relative">
              <MapPin className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
              <select value={formData.customerCommune}
                disabled={!formData.customerWelaya || loadingCommunes}
                onChange={e => setFormData({ ...formData, customerCommune: e.target.value })}
                className={`${inputCls(!!formErrors.customerCommune)} pr-10 appearance-none cursor-pointer disabled:opacity-50`}>
                <option value="">
                  {loadingCommunes ? 'جاري التحميل...'
                    : formData.customerWelaya ? 'اختر البلدية'
                    : 'اختر الولاية أولاً'}
                </option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery type */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">نوع التوصيل</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home', 'office'] as const).map(type => (
              <button key={type} type="button"
                onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200
                  ${formData.typeLivraison === type
                    ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                {type === 'home'
                  ? <Home      className={`w-6 h-6 ${formData.typeLivraison === type ? 'text-white' : 'text-gray-400'}`} />
                  : <Building2 className={`w-6 h-6 ${formData.typeLivraison === type ? 'text-white' : 'text-gray-400'}`} />}
                <div className="text-center">
                  <p className="text-sm font-bold">{type === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}</p>
                  {selectedWilayaData && (
                    <p className={`text-xs mt-0.5 ${formData.typeLivraison === type ? 'text-gray-300' : 'text-gray-400'}`}>
                      {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} د.ج
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
          {!selectedWilayaData && (
            <p className="text-xs text-gray-400 mt-2 text-center">اختر الولاية لعرض تكلفة التوصيل</p>
          )}
        </div>

        {/* Quantity */}
        <FieldWrapper error={formErrors.quantity} label="الكمية">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
              className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all font-bold text-xl active:scale-95">−</button>
            <span className="w-16 text-center text-2xl font-black text-gray-900">{formData.quantity}</span>
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
              className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all font-bold text-xl active:scale-95">+</button>
            <span className="text-sm text-gray-400 font-medium">قطعة</span>
          </div>
        </FieldWrapper>

        {/* Order summary */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-sm border border-gray-100">
          <div className="flex justify-between text-gray-600">
            <span className="flex items-center gap-1"><Package className="w-4 h-4" /> المنتج</span>
            <span className="text-gray-900 font-bold truncate max-w-[50%]">{product.name}</span>
          </div>

          {selectedOffer && (() => {
            const offer = product.offers?.find(o => o.id === selectedOffer);
            if (!offer) return null;
            return (
              <div className="flex justify-between items-center text-gray-600">
                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-amber-500" /> العرض</span>
                <span className="text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg text-xs border border-amber-100">{offer.name}</span>
              </div>
            );
          })()}

          {Object.entries(selectedVariants).map(([attrName, val]) => {
            const attr    = product.attributes?.find(a => a.name === attrName);
            const variant = attr?.variants?.find(v => v.value === val);
            if (!variant) return null;
            return (
              <div key={attrName} className="flex justify-between items-center text-gray-600">
                <span>{attrName}</span>
                <span className="text-gray-900 font-medium flex items-center gap-2">
                  {attr?.displayMode === 'color' && <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: val }} />}
                  {attr?.displayMode === 'image' && <span className="w-10 h-10 rounded-md border border-gray-300 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${val})` }} />}
                  {!attr?.displayMode && <span className="truncate max-w-[120px] border px-1 rounded-md">{variant.name || val}</span>}
                </span>
              </div>
            );
          })}

          <div className="flex justify-between text-gray-600">
            <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> التوصيل</span>
            <span className="text-gray-900 font-medium">
              {formData.typeLivraison === 'home' ? 'المنزل' : 'المكتب'}
              {selectedWilayaData && <span className="text-gray-500 mr-1">({getPriceLivraison().toLocaleString('ar-DZ')} د.ج)</span>}
            </span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>سعر القطعة</span>
            <span className="text-gray-900 font-bold">{finalPrice.toLocaleString('ar-DZ')} د.ج</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>الكمية</span>
            <span className="text-gray-900 font-bold">× {formData.quantity}</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-gray-200">
            <span className="font-bold text-gray-900 text-base">الإجمالي الكلي</span>
            <span className="text-2xl font-black text-gray-900">
              {getTotalPrice().toLocaleString('ar-DZ')}
              <span className="text-sm font-bold text-gray-500 mr-1">د.ج</span>
            </span>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg
            ${submitting
              ? 'bg-gray-900 text-white opacity-90 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'}`}>
          {submitting ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري إرسال الطلب...</>
          ) : (
            <><ShoppingCart className="w-5 h-5" />تأكيد الطلب الآن</>
          )}
        </button>

        <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />بياناتك آمنة ومشفرة 100%
        </p>
      </form>
    </div>
  );
}