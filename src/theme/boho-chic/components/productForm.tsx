'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingCart, MapPin, Phone, User, Home, ChevronDown,
  Truck, Shield, Package, Building2, AlertCircle, Tag,
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

interface Offer        { id: string; name: string; quantity: number; price: number; }
interface Variant      { id: string; name: string; value: string; }
interface Attribute    { id: string; type: string; name: string; displayMode?: 'color' | 'image' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }

export interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[];
  offers?: Offer[]; attributes?: Attribute[]; variantDetails?: VariantDetail[];
  stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; };
}

interface Wilaya  { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }

export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}

function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some(e => e.attrName === attrName && e.value === val)
  );
}

const fetchWilayas  = async (userId: string): Promise<Wilaya[]>  => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wilayaId: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`); return data || []; } catch { return []; } };

/* ── Field wrapper ── */
const FieldWrapper = ({ error, children, label }: { error?: string; children: React.ReactNode; label?: string }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#B89A7A', letterSpacing: '0.1em' }}>
        {label}
      </label>
    )}
    {children}
    {error && (
      <p className="text-xs flex items-center gap-1" style={{ color: '#C4714A' }}>
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const inputCls = (err?: boolean) =>
  `w-full px-4 py-3 text-sm outline-none transition-all font-light`
  + ` placeholder-[#C8B09A]`
  + ` border rounded-xl`
  + ` ${err
    ? 'border-[#C4714A] bg-[rgba(196,113,74,0.04)] focus:ring-2 focus:ring-[rgba(196,113,74,0.15)]'
    : 'border-[#E0CEBC] bg-[#FDF8F2] focus:border-[#C4714A] focus:ring-2 focus:ring-[rgba(196,113,74,0.12)]'
  }`;

export default function ProductForm({
  product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0,
}: ProductFormProps) {
  const router = useRouter();

  const [wilayas,         setWilayas]         = useState<Wilaya[]>([]);
  const [communes,        setCommunes]        = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [formData,        setFormData]        = useState({
    customerId: '', customerName: '', customerPhone: '', customerWelaya: '',
    customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);
  useEffect(() => { const id = localStorage.getItem('customerId'); if (id) setFormData(p => ({ ...p, customerId: id })); }, []);
  useEffect(() => {
    if (!formData.customerWelaya) { setCommunes([]); return; }
    setLoadingCommunes(true);
    fetchCommunes(formData.customerWelaya).then(data => { setCommunes(data); setLoadingCommunes(false); });
  }, [formData.customerWelaya]);

  const selectedWilayaData = useMemo(() =>
    wilayas.find(w => String(w.id) === String(formData.customerWelaya)),
    [wilayas, formData.customerWelaya]
  );

  const getFinalPrice = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
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
    return formData.typeLivraison === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice;
  }, [selectedWilayaData, formData.typeLivraison]);

  useEffect(() => {
    if (selectedWilayaData) setFormData(f => ({ ...f, priceLoss: selectedWilayaData.livraisonReturn }));
  }, [selectedWilayaData, formData.typeLivraison]);

  const finalPrice    = getFinalPrice();
  const getTotalPrice = () => finalPrice * formData.quantity + getPriceLivraison();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.customerName.trim())  e.customerName    = 'الاسم مطلوب';
    if (!formData.customerPhone.trim()) e.customerPhone   = 'رقم الهاتف مطلوب';
    if (!formData.customerWelaya)       e.customerWelaya  = 'الولاية مطلوبة';
    if (!formData.customerCommune)      e.customerCommune = 'البلدية مطلوبة';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders/create`, {
        ...formData, productId: product.id, storeId: product.store.id,
        userId, selectedOffer, selectedVariants, platform: platform || 'store',
        finalPrice, totalPrice: getTotalPrice(), priceLivraison: getPriceLivraison(),
      });
      localStorage.setItem('customerId', formData.customerId || '');
      router.push(`/lp/${domain}/successfully`);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  return (
    <div style={{ borderTop: '1px solid #E8D9C5', paddingTop: '1.75rem', fontFamily: "'Karla', sans-serif" }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: '#B89A7A', letterSpacing: '0.15em' }}>
        ✦ تأكيد الطلب
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerName} label="الاسم الكامل">
            <div className="relative">
              <User className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
              <input type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="أدخل اسمك" className={`${inputCls(!!formErrors.customerName)} pr-10`} style={{ color: '#3D2314' }} />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerPhone} label="رقم الهاتف">
            <div className="relative">
              <Phone className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
              <input type="tel" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="0X XX XX XX XX" className={`${inputCls(!!formErrors.customerPhone)} pr-10`} style={{ color: '#3D2314' }} />
            </div>
          </FieldWrapper>
        </div>

        {/* Wilaya + Commune */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerWelaya} label="الولاية">
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
              <select value={formData.customerWelaya} onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })}
                className={`${inputCls(!!formErrors.customerWelaya)} pr-10 appearance-none cursor-pointer`} style={{ color: '#3D2314', backgroundColor: '#FDF8F2' }}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: '#C8B09A' }} />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerCommune} label="البلدية">
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
              <select value={formData.customerCommune} disabled={!formData.customerWelaya || loadingCommunes}
                onChange={e => setFormData({ ...formData, customerCommune: e.target.value })}
                className={`${inputCls(!!formErrors.customerCommune)} pr-10 appearance-none cursor-pointer disabled:opacity-40`} style={{ color: '#3D2314', backgroundColor: '#FDF8F2' }}>
                <option value="">{loadingCommunes ? 'جاري التحميل...' : formData.customerWelaya ? 'اختر البلدية' : 'اختر الولاية أولاً'}</option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: '#C8B09A' }} />
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery type */}
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: '#B89A7A', letterSpacing: '0.1em' }}>نوع التوصيل</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home', 'office'] as const).map(type => (
              <button
                key={type} type="button"
                onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))}
                className="flex flex-col items-center gap-2 py-5 transition-all duration-300"
                style={{
                  backgroundColor: formData.typeLivraison === type ? '#FDF8F2' : '#F7F0E6',
                  borderRadius:    '16px',
                  border:          `1.5px solid ${formData.typeLivraison === type ? '#C4714A' : '#E0CEBC'}`,
                  boxShadow:       formData.typeLivraison === type ? '0 4px 16px rgba(196,113,74,0.15)' : 'none',
                }}
              >
                {type === 'home'
                  ? <Home className="w-5 h-5" style={{ color: formData.typeLivraison === type ? '#C4714A' : '#C8B09A' }} />
                  : <Building2 className="w-5 h-5" style={{ color: formData.typeLivraison === type ? '#C4714A' : '#C8B09A' }} />
                }
                <p className="text-xs font-medium" style={{ color: formData.typeLivraison === type ? '#3D2314' : '#9E8060' }}>
                  {type === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}
                </p>
                {selectedWilayaData && (
                  <p className="text-xs font-semibold" style={{ color: formData.typeLivraison === type ? '#C4714A' : '#B89A7A' }}>
                    {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} دج
                  </p>
                )}
              </button>
            ))}
          </div>
          {!selectedWilayaData && (
            <p className="text-xs text-center mt-2" style={{ color: '#C8B09A' }}>اختر الولاية لعرض تكلفة التوصيل</p>
          )}
        </div>

        {/* Quantity */}
        <FieldWrapper error={formErrors.quantity} label="الكمية">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
              className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-light transition-all hover:scale-110"
              style={{ border: '1px solid #E0CEBC', backgroundColor: '#FDF8F2', color: '#8E7860' }}>
              −
            </button>
            <span
              className="w-14 text-center text-2xl"
              style={{ fontFamily: "'Fraunces', serif", color: '#3D2314', fontWeight: 400 }}
            >
              {formData.quantity}
            </span>
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
              className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-light transition-all hover:scale-110"
              style={{ border: '1px solid #E0CEBC', backgroundColor: '#FDF8F2', color: '#8E7860' }}>
              +
            </button>
            <span className="text-sm" style={{ color: '#C8B09A' }}>قطعة</span>
          </div>
        </FieldWrapper>

        {/* Order summary */}
        <div className="p-5 space-y-3" style={{ backgroundColor: '#F0E6D8', borderRadius: '16px' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5" style={{ color: '#9E8060' }}>
              <Package className="w-3.5 h-3.5" /> المنتج
            </span>
            <span className="font-medium truncate max-w-[50%]" style={{ color: '#3D2314' }}>{product.name}</span>
          </div>

          {selectedOffer && (() => {
            const offer = product.offers?.find(o => o.id === selectedOffer);
            if (!offer) return null;
            return (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5" style={{ color: '#9E8060' }}><Tag className="w-3.5 h-3.5" /> العرض</span>
                <span className="font-medium px-2.5 py-0.5" style={{ color: '#C4714A', backgroundColor: 'rgba(196,113,74,0.1)', borderRadius: '20px' }}>{offer.name}</span>
              </div>
            );
          })()}

          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5" style={{ color: '#9E8060' }}><Truck className="w-3.5 h-3.5" /> التوصيل</span>
            <span style={{ color: '#3D2314' }}>
              {formData.typeLivraison === 'home' ? 'المنزل' : 'المكتب'}
              {selectedWilayaData && <span style={{ color: '#9E8060' }}> ({getPriceLivraison().toLocaleString('ar-DZ')} دج)</span>}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span style={{ color: '#9E8060' }}>سعر القطعة</span>
            <span style={{ color: '#3D2314' }}>{finalPrice.toLocaleString('ar-DZ')} دج</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: '#9E8060' }}>الكمية</span>
            <span style={{ color: '#3D2314' }}>× {formData.quantity}</span>
          </div>

          <div
            className="flex justify-between items-baseline pt-3"
            style={{ borderTop: '1px dashed #D4A28C' }}
          >
            <span className="text-sm font-semibold" style={{ color: '#3D2314' }}>الإجمالي</span>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', color: '#C4714A', fontWeight: 400 }}>
              {getTotalPrice().toLocaleString('ar-DZ')}
              <span className="text-sm mr-1" style={{ color: '#B89A7A' }}>دج</span>
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 flex items-center justify-center gap-3 text-sm font-semibold tracking-wide transition-all duration-300"
          style={{
            backgroundColor: submitting ? '#D4A28C' : '#C4714A',
            color:           '#FDF8F2',
            borderRadius:    '30px',
            letterSpacing:   '0.06em',
            boxShadow:       submitting ? 'none' : '0 6px 20px rgba(196,113,74,0.3)',
            cursor:          submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />جاري إرسال الطلب...</>
          ) : (
            <><ShoppingCart className="w-4 h-4" />تأكيد الطلب ✦</>
          )}
        </button>

        <p className="text-xs text-center flex items-center justify-center gap-1.5" style={{ color: '#C8B09A' }}>
          <Shield className="w-3.5 h-3.5" style={{ color: '#7A9068' }} />
          بياناتك آمنة ومحمية بالكامل
        </p>
      </form>
    </div>
  );
}