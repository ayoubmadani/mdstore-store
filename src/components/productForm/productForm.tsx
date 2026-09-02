'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingCart, MapPin, Phone, User, Home,
  ChevronDown, Truck, Shield, Package,
  Building2, AlertCircle, Tag, Mail, MessageCircle,
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getProductFormStrings } from './translations';

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
  isDigital?: boolean;
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
  lpId?:string
  builderPageId?:   string;       // builder-pages productForm block only — same role as lpId
  title?:           string;       // builder-pages productForm block only — overrides the header text
  buttonText?:      string;       // builder-pages productForm block only — overrides the submit button text
  // builder-pages productForm block only — its own product image/name/price
  // + offers/attributes picker (ProductFormBlockRenderer.tsx), rendered
  // *inside* this component's own card instead of ProductFormBlockRenderer
  // wrapping this whole component in a second, redundant card of its own —
  // that double-nesting was exactly the "shape doesn't match the editor"
  // mismatch, since the dashboard's own block preview is a single card.
  renderBefore?:    React.ReactNode;
  // builder-pages productForm block only — mirrors dashboard/src/pages/editor/
  // blocks/ProductFormBlock.jsx's own color props exactly, so a merchant's
  // customization actually survives publishing instead of being silently
  // dropped in favor of this component's normal fixed gray/white palette.
  // All optional and default to that same fixed palette when unset, so every
  // other caller (regular product pages, old landing pages) is unaffected.
  backgroundColor?:      string;
  textColor?:            string;
  buttonBackgroundColor?: string;
  buttonTextColor?:      string;
  buttonBorderColor?:    string;
  inputBackgroundColor?: string;
  inputBorderColor?:     string;
  inputTextColor?:       string;
  borderRadius?:         number;  // builder-pages productForm block only — 0 by default (square corners)
  language?:             string;  // builder-pages productForm block only — page.settings.language, defaults to 'ar'
  // When set, a successful order calls this instead of navigating to
  // `${pathname}/successfully` — used for a domain dedicated entirely to
  // one builder-page (see BuilderPageRenderer's `dedicated` prop), where
  // that route doesn't exist and the confirmation renders inline instead.
  onOrderSuccess?:       (order: { id: string; total: number }) => void;
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
const FieldWrapper = ({ error, children, label, labelColor }: {
  error?: string; children: React.ReactNode; label?: string; labelColor?: string;
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor, opacity: 0.65 }}>
        {label}
      </label>
    )}
    {children}
    {error && (
      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const inputCls = (err?: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all placeholder-gray-400
   ${err ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'focus:ring-2 focus:ring-gray-100'}`;

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function ProductForm({
  product, userId, domain,
  selectedOffer, setSelectedOffer, selectedVariants,
  platform, priceLoss = 0, lpId, builderPageId, title, buttonText, renderBefore,
  backgroundColor, textColor, buttonBackgroundColor, buttonTextColor,
  buttonBorderColor, inputBackgroundColor, inputBorderColor, inputTextColor,
  borderRadius, language, onOrderSuccess,
}: ProductFormProps) {
  const router = useRouter();
  const t = getProductFormStrings(language);

  // Defaults match this component's existing hardcoded Tailwind palette
  // exactly (gray-900 #111827, gray-50 #f9fafb, gray-200 #e5e7eb, white),
  // so any caller that doesn't pass these (every page except a builder-pages
  // productForm block) renders pixel-identical to before.
  const cardBg     = backgroundColor      || '#ffffff';
  const cardText   = textColor            || '#111827';
  const accent     = buttonBackgroundColor || '#111827';
  const btnText    = buttonTextColor      || '#ffffff';
  const fieldBg    = inputBackgroundColor || '#f9fafb';
  const fieldBorder = inputBorderColor    || '#e5e7eb';
  const fieldText  = inputTextColor       || '#111827';
  // Error state keeps its own red border (set via className) — the inline
  // style only supplies borderColor when there's no error to override.
  const fieldStyle = (hasError?: boolean): React.CSSProperties => ({
    backgroundColor: fieldBg,
    color: fieldText,
    ...(hasError ? {} : { borderColor: fieldBorder }),
  });

  /* ── Shipping state ── */
  const [wilayas,         setWilayas]         = useState<Wilaya[]>([]);
  const [communes,        setCommunes]        = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  /* ── Form state ── */
  const [formData, setFormData] = useState({
    customerId:       '',
    customerName:     '',
    customerPhone:    '',
    customerEmail:    '',
    customerWhatsapp: '',
    customerWelaya:   '',
    customerCommune:  '',
    quantity:         1,
    priceLoss:0,
    typeLivraison:    'home' as 'home' | 'office',
  });
  // منتج رقمي فقط — أي طريقة يستخدمها الزائر للتواصل بدل الشحن
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
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
    if (product.isDigital) return 0;
    if (!selectedWilayaData) return 0;
        return formData.typeLivraison === 'home'
      ? selectedWilayaData.livraisonHome
      : selectedWilayaData.livraisonOfice;
  }, [selectedWilayaData, formData.typeLivraison, product.isDigital]);

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
      e.customerName  = t.errorName;
    if (!/^(0|\+213)[5-7][0-9]{8}$/.test(formData.customerPhone.replace(/\s/g, '')))
      e.customerPhone = t.errorPhone;
    if (product.isDigital) {
      if (contactMethod === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail.trim()))
          e.customerEmail = t.errorEmail;
      } else {
        if (!/^(0|\+213)[5-7][0-9]{8}$/.test(formData.customerWhatsapp.replace(/\s/g, '')))
          e.customerWhatsapp = t.errorWhatsapp;
      }
    } else {
      if (!formData.customerWelaya)  e.customerWelaya  = t.errorWilaya;
      if (!formData.customerCommune) e.customerCommune = t.errorCommune;
    }
    if (formData.quantity < 1)     e.quantity        = t.errorQuantity;
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }, [formData, t, product.isDigital, contactMethod]);

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
        customerId:        formData.customerId,
        customerName:      formData.customerName,
        customerPhone:     formData.customerPhone,
        ...(product.isDigital
          ? (contactMethod === 'email'
              ? { customerEmail: formData.customerEmail }
              : { customerWhatsapp: formData.customerWhatsapp })
          : {
              typeShip:          formData.typeLivraison,
              priceShip:         getPriceLivraison(),
              priceLoss:         formData.priceLoss,
              customerWilayaId:  formData.customerWelaya,
              customerCommuneId: formData.customerCommune,
            }),
        lpId,
        builderPageId,
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
        if (onOrderSuccess) {
          onOrderSuccess({ id: res.data?.id, total: getTotalPrice() });
        } else {
          router.push(`${window.location.pathname}/successfully?productId=${product.id}`);
        }
      }
    } catch {
      alert(t.connectionError);
    } finally {
      setSubmitting(false);
    }
  };

  const finalPrice = getFinalPrice();

  /* ── Render ── */
  return (
    <div className="overflow-hidden shadow-xl shadow-gray-900/5 border" style={{ backgroundColor: cardBg, borderColor: fieldBorder, color: cardText, borderRadius: borderRadius ?? 0 }}>

      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: fieldBorder }}>
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" style={{ opacity: 0.75 }} />
          <p className="font-bold">{title || t.formTitle}</p>
        </div>
        <p className="text-xs mt-1" style={{ opacity: 0.55 }}>{t.formSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {renderBefore}

        {/* Name + Phone */}
        <div className="grid grid-cols-1 gap-4">
          <FieldWrapper error={formErrors.customerName} label={t.fullName} labelColor={cardText}>
            <div className="relative">
              <User className="absolute right-3 top-3.5 w-4 h-4" style={{ opacity: 0.4 }} />
              <input type="text" value={formData.customerName} placeholder={t.fullNamePlaceholder}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className={`${inputCls(!!formErrors.customerName)} pr-10`}
                style={fieldStyle(!!formErrors.customerName)} />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerPhone} label={t.phone} labelColor={cardText}>
            <div className="relative">
              <Phone className="absolute right-3 top-3.5 w-4 h-4" style={{ opacity: 0.4 }} />
              <input type="tel" dir="ltr" value={formData.customerPhone} placeholder="0550 123 456"
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                className={`${inputCls(!!formErrors.customerPhone)} pr-10 font-mono`}
                style={fieldStyle(!!formErrors.customerPhone)} />
            </div>
          </FieldWrapper>
        </div>

        {product.isDigital ? (
          /* Email or WhatsApp — digital products need no shipping info */
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: cardText, opacity: 0.6 }}>{t.contactQuestion}</p>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: fieldBorder }}>
              <button type="button" onClick={() => setContactMethod('email')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors"
                style={contactMethod === 'email'
                  ? { backgroundColor: accent, color: btnText }
                  : { backgroundColor: 'transparent', color: cardText, opacity: 0.6 }}>
                <Mail className="w-4 h-4" />
                {t.contactViaEmail}
              </button>
              <button type="button" onClick={() => setContactMethod('whatsapp')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors"
                style={contactMethod === 'whatsapp'
                  ? { backgroundColor: accent, color: btnText }
                  : { backgroundColor: 'transparent', color: cardText, opacity: 0.6 }}>
                <MessageCircle className="w-4 h-4" />
                {t.contactViaWhatsapp}
              </button>
            </div>

            {contactMethod === 'email' ? (
              <FieldWrapper error={formErrors.customerEmail} label={t.email} labelColor={cardText}>
                <div className="relative">
                  <Mail className="absolute right-3 top-3.5 w-4 h-4" style={{ opacity: 0.4 }} />
                  <input type="email" dir="ltr" value={formData.customerEmail} placeholder={t.emailPlaceholder}
                    onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                    className={`${inputCls(!!formErrors.customerEmail)} pr-10`}
                    style={fieldStyle(!!formErrors.customerEmail)} />
                </div>
              </FieldWrapper>
            ) : (
              <FieldWrapper error={formErrors.customerWhatsapp} label={t.whatsapp} labelColor={cardText}>
                <div className="relative">
                  <MessageCircle className="absolute right-3 top-3.5 w-4 h-4" style={{ opacity: 0.4 }} />
                  <input type="tel" dir="ltr" value={formData.customerWhatsapp} placeholder={t.whatsappPlaceholder}
                    onChange={e => setFormData({ ...formData, customerWhatsapp: e.target.value })}
                    className={`${inputCls(!!formErrors.customerWhatsapp)} pr-10`}
                    style={fieldStyle(!!formErrors.customerWhatsapp)} />
                </div>
              </FieldWrapper>
            )}
          </div>
        ) : (
          <>
            {/* Wilaya + Commune */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldWrapper error={formErrors.customerWelaya} label={t.wilaya} labelColor={cardText}>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3.5 w-4 h-4" style={{ opacity: 0.4 }} />
                  <select value={formData.customerWelaya}
                    onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })}
                    className={`${inputCls(!!formErrors.customerWelaya)} pr-10 appearance-none cursor-pointer`}
                    style={fieldStyle(!!formErrors.customerWelaya)}>
                    <option value="">{t.selectWilaya}</option>
                    {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
                  </select>
                  <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 pointer-events-none" style={{ opacity: 0.4 }} />
                </div>
              </FieldWrapper>

              <FieldWrapper error={formErrors.customerCommune} label={t.commune} labelColor={cardText}>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3.5 w-4 h-4" style={{ opacity: 0.4 }} />
                  <select value={formData.customerCommune}
                    disabled={!formData.customerWelaya || loadingCommunes}
                    onChange={e => setFormData({ ...formData, customerCommune: e.target.value })}
                    className={`${inputCls(!!formErrors.customerCommune)} pr-10 appearance-none cursor-pointer disabled:opacity-50`}
                    style={fieldStyle(!!formErrors.customerCommune)}>
                    <option value="">
                      {loadingCommunes ? t.loadingCommunes
                        : formData.customerWelaya ? t.selectCommune
                        : t.selectWilayaFirst}
                    </option>
                    {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
                  </select>
                  <ChevronDown className="absolute left-3 top-3.5 w-4 h-4 pointer-events-none" style={{ opacity: 0.4 }} />
                </div>
              </FieldWrapper>
            </div>

            {/* Delivery type */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: cardText, opacity: 0.6 }}>{t.deliveryType}</p>
              <div className="grid grid-cols-2 gap-3">
                {(['home', 'office'] as const).map(type => {
                  const isSelected = formData.typeLivraison === type;
                  return (
                    <button key={type} type="button"
                      onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200"
                      style={{
                        borderColor: isSelected ? accent : fieldBorder,
                        backgroundColor: isSelected ? accent : cardBg,
                        color: isSelected ? btnText : cardText,
                        boxShadow: isSelected ? '0 10px 15px -3px rgba(0,0,0,0.1)' : undefined,
                      }}>
                      {type === 'home'
                        ? <Home      className="w-6 h-6" style={{ opacity: isSelected ? 1 : 0.4 }} />
                        : <Building2 className="w-6 h-6" style={{ opacity: isSelected ? 1 : 0.4 }} />}
                      <div className="text-center">
                        <p className="text-sm font-bold">{type === 'home' ? t.home : t.office}</p>
                        {selectedWilayaData && (
                          <p className="text-xs mt-0.5" style={{ opacity: isSelected ? 0.75 : 0.5 }}>
                            {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} {t.currency}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {!selectedWilayaData && (
                <p className="text-xs mt-2 text-center" style={{ color: cardText, opacity: 0.4 }}>{t.selectWilayaForPrice}</p>
              )}
            </div>
          </>
        )}

        {/* Quantity — a digital product is a single license/copy, not a
            stockable count, so there's nothing to increment */}
        {!product.isDigital && (
          <FieldWrapper error={formErrors.quantity} label={t.quantity} labelColor={cardText}>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                className="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all font-bold text-xl active:scale-95"
                style={{ borderColor: fieldBorder, color: cardText }}>−</button>
              <span className="w-16 text-center text-2xl font-black" style={{ color: cardText }}>{formData.quantity}</span>
              <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
                className="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all font-bold text-xl active:scale-95"
                style={{ borderColor: fieldBorder, color: cardText }}>+</button>
              <span className="text-sm font-medium" style={{ color: cardText, opacity: 0.45 }}>{t.piece}</span>
            </div>
          </FieldWrapper>
        )}

        {/* Order summary */}
        <div className="rounded-2xl p-5 space-y-3 text-sm border" style={{ backgroundColor: fieldBg, borderColor: fieldBorder, color: cardText }}>
          <div className="flex justify-between" style={{ opacity: 0.75 }}>
            <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {t.product}</span>
            <span className="font-bold truncate max-w-[50%]" style={{ opacity: 1 }}>{product.name}</span>
          </div>

          {selectedOffer && (() => {
            const offer = product.offers?.find(o => o.id === selectedOffer);
            if (!offer) return null;
            return (
              <div className="flex justify-between items-center" style={{ opacity: 0.75 }}>
                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-amber-500" /> {t.offer}</span>
                <span className="text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg text-xs border border-amber-100">{offer.name}</span>
              </div>
            );
          })()}

          {Object.entries(selectedVariants).map(([attrName, val]) => {
            const attr    = product.attributes?.find(a => a.name === attrName);
            const variant = attr?.variants?.find(v => v.value === val);
            if (!variant) return null;
            return (
              <div key={attrName} className="flex justify-between items-center" style={{ opacity: 0.75 }}>
                <span>{attrName}</span>
                <span className="font-medium flex items-center gap-2" style={{ opacity: 1 }}>
                  {attr?.displayMode === 'color' && <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: val }} />}
                  {attr?.displayMode === 'image' && <span className="w-10 h-10 rounded-md border border-gray-300 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${val})` }} />}
                  {!attr?.displayMode && <span className="truncate max-w-[120px] border px-1 rounded-md">{variant.name || val}</span>}
                </span>
              </div>
            );
          })}

          {!product.isDigital && (
            <div className="flex justify-between" style={{ opacity: 0.75 }}>
              <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> {t.delivery}</span>
              <span className="font-medium" style={{ opacity: 1 }}>
                {formData.typeLivraison === 'home' ? t.homeShort : t.officeShort}
                {selectedWilayaData && <span className="mr-1" style={{ opacity: 0.7 }}>({getPriceLivraison().toLocaleString('ar-DZ')} {t.currency})</span>}
              </span>
            </div>
          )}

          <div className="flex justify-between" style={{ opacity: 0.75 }}>
            <span>{t.unitPrice}</span>
            <span className="font-bold" style={{ opacity: 1 }}>{finalPrice.toLocaleString('ar-DZ')} {t.currency}</span>
          </div>
          {!product.isDigital && (
            <div className="flex justify-between" style={{ opacity: 0.75 }}>
              <span>{t.quantity}</span>
              <span className="font-bold" style={{ opacity: 1 }}>× {formData.quantity}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t-2 border-dashed" style={{ borderColor: fieldBorder }}>
            <span className="font-bold text-base">{t.total}</span>
            <span className="text-2xl font-black">
              {getTotalPrice().toLocaleString('ar-DZ')}
              <span className="text-sm font-bold mr-1" style={{ opacity: 0.6 }}>{t.currency}</span>
            </span>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg"
          style={{
            backgroundColor: accent,
            color: btnText,
            border: buttonBorderColor ? `2px solid ${buttonBorderColor}` : undefined,
            opacity: submitting ? 0.9 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}>
          {submitting ? (
            <><div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${btnText}55`, borderTopColor: 'transparent' }} />{t.submitting}</>
          ) : (
            <><ShoppingCart className="w-5 h-5" />{buttonText || t.submit}</>
          )}
        </button>

        <p className="text-xs text-center flex items-center justify-center gap-1" style={{ color: cardText, opacity: 0.4 }}>
          <Shield className="w-3 h-3" />{t.secure}
        </p>
      </form>
    </div>
  );
}