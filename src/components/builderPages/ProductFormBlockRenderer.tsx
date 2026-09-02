'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import ProductForm from '@/components/productForm/productForm';
import { getProductFormStrings } from '@/components/productForm/translations';
import type { Pixel } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
const SAFE_PIXEL_ID = /^[\w-]{1,64}$/;

// Structurally matches productForm.tsx's own (unexported) Attribute/
// VariantDetail/VariantAttributeEntry shapes exactly — TS treats two
// same-named-but-differently-shaped interfaces as unrelated types, so this
// has to line up field-for-field with what <ProductForm>'s Product.
interface Variant { id: string; name: string; value: string; }
interface Attribute { id: string; type: string; name: string; displayMode?: 'color' | 'image' | null; variants: Variant[]; }
interface Offer { id: string; name: string; quantity: number; price: number; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }
interface ProductInfo {
  id: string; name: string; price: number; productImage?: string;
  storeId: string; userId: string; domain: string;
  attributes?: Attribute[]; variantDetails?: VariantDetail[]; offers?: Offer[];
  isDigital?: boolean;
}

function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, value]) =>
    detail.name?.some((entry) => entry.attrName === attrName && entry.value === value)
  );
}

// Mirrors dashboard/src/pages/editor/blocks/ProductFormBlock.jsx's own
// product/offers/attributes picker UI + colors, then hands off the actual
// shipping/name/phone form to the same <ProductForm> every other storefront
// page already uses — so a builder-page order goes through the exact same,
// already-working /orders submission path as any other product. The picker
// is passed into <ProductForm> as `renderBefore` so everything ends up
// inside ONE card, matching the dashboard block's own single-card shape —
// wrapping <ProductForm> in a second outer card here used to double up the
// border/shadow/rounding and visibly not match the editor's preview.
interface ProductFormBlockProps {
  showProductName?: boolean;
  productName?: string;
  title?: string;
  buttonText?: string;
  containerBackgroundColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputTextColor?: string;
  paddingX?: number;
  borderRadius?: number;
}

export default function ProductFormBlockRenderer({
  productId,
  props,
  lpDomain,
  builderPageId,
  language,
  dedicated,
  pixels,
}: {
  productId?: string;
  props: Record<string, unknown>;
  lpDomain: string;
  builderPageId: string;
  language?: string;
  // Rendered via a domain dedicated entirely to this page (see
  // BuilderPageRenderer) — there's no "/successfully" route to redirect to
  // there, so a successful order shows an inline confirmation instead, and
  // fires the Purchase pixel event directly here rather than on that
  // separate page's own load effect.
  dedicated?: boolean;
  pixels?: Pixel[];
}) {
  const t = getProductFormStrings(language);
  const formatPrice = (n: number) => `${Number(n || 0).toLocaleString('en-US')} ${t.currency}`;
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [orderResult, setOrderResult] = useState<{ id: string; total: number } | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!orderResult || hasTrackedRef.current || !pixels?.length) return;
    const fire = () => {
      pixels.forEach((px) => {
        if (!px.isActive || !SAFE_PIXEL_ID.test(px.pixelId)) return;
        if (px.type === 'facebook' && (window as any).fbq) {
          (window as any).fbq('track', 'Purchase', { value: orderResult.total, currency: 'DZD', order_id: orderResult.id });
        }
        if (px.type === 'tiktok' && (window as any).ttq) {
          (window as any).ttq.track('CompletePayment', { value: orderResult.total, currency: 'DZD', order_id: orderResult.id });
        }
        if (px.type === 'google' && (window as any).gtag) {
          (window as any).gtag('event', 'purchase', { transaction_id: orderResult.id, value: orderResult.total, currency: 'DZD' });
        }
      });
      hasTrackedRef.current = true;
    };
    const timer = setTimeout(fire, 1500);
    return () => clearTimeout(timer);
  }, [orderResult, pixels]);

  useEffect(() => {
    if (!productId) return;
    axios
      .get(`${API_URL}/builder-pages/product-info/${productId}`)
      .then((res) => {
        setProduct(res.data);
        if (res.data?.offers?.length) setSelectedOffer(res.data.offers[0].id);
      })
      .catch(() => setProduct(null));
  }, [productId]);

  const handleVariantSelect = (attrName: string, value: string) => {
    setSelectedVariants((prev) => {
      const next = { ...prev };
      if (next[attrName] === value) delete next[attrName];
      else next[attrName] = value;
      return next;
    });
  };

  const {
    showProductName = true,
    productName: productNameOverride,
    title,
    buttonText,
    containerBackgroundColor,
    backgroundColor,
    textColor,
    buttonBackgroundColor,
    buttonTextColor,
    buttonBorderColor,
    inputBackgroundColor,
    inputBorderColor,
    inputTextColor,
    paddingX,
    borderRadius,
  } = (props || {}) as ProductFormBlockProps;

  // Matches ProductForm.tsx's own default fallback exactly (both are only
  // ever unset on pages saved before componentsMap.js started persisting
  // '#10b981' as this block's defaultProp) — keeps the offers/attributes
  // picker and the actual submit button in visual agreement.
  const accentColor = buttonBackgroundColor || '#111827';

  const matchedVariantDetail =
    product?.variantDetails?.length && Object.keys(selectedVariants).length
      ? product.variantDetails.find((v) => variantMatches(v, selectedVariants))
      : null;

  if (!productId) return null;

  const productSummary = product && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {product.productImage && (
          <img src={product.productImage} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
        )}
        <div>
          {showProductName !== false && (
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{productNameOverride || product.name}</p>
          )}
          <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
            {formatPrice(matchedVariantDetail && matchedVariantDetail.price !== -1 ? matchedVariantDetail.price : product.price)}
          </p>
        </div>
      </div>

      {product.offers && product.offers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {product.offers.map((offer) => (
            <label
              key={offer.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 8,
                border: `1px solid ${selectedOffer === offer.id ? accentColor : '#e4e4e7'}`,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="radio"
                  name="offer"
                  checked={selectedOffer === offer.id}
                  onChange={() => setSelectedOffer(selectedOffer === offer.id ? null : offer.id)}
                  style={{ accentColor }}
                />
                {offer.name} <span style={{ opacity: 0.6 }}>({offer.quantity} {t.pieces})</span>
              </span>
              <span style={{ fontWeight: 700 }}>{formatPrice(offer.price)}</span>
            </label>
          ))}
        </div>
      )}

      {product.attributes?.map((attr) => (
        <div key={attr.id}>
          <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>{attr.name}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {attr.variants?.map((v) => {
              const isSelected = selectedVariants[attr.name] === v.value;
              if (attr.displayMode === 'color') {
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVariantSelect(attr.name, v.value)}
                    title={v.name}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: v.value,
                      border: `2px solid ${isSelected ? accentColor : '#e4e4e7'}`,
                      cursor: 'pointer',
                    }}
                  />
                );
              }
              if (attr.displayMode === 'image') {
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVariantSelect(attr.name, v.value)}
                    title={v.name}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      padding: 0,
                      backgroundImage: `url(${v.value})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: `2px solid ${isSelected ? accentColor : '#e4e4e7'}`,
                      cursor: 'pointer',
                    }}
                  />
                );
              }
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleVariantSelect(attr.name, v.value)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    backgroundColor: isSelected ? accentColor : '#f9fafb',
                    color: isSelected ? '#ffffff' : '#18181b',
                    border: `1px solid ${isSelected ? accentColor : '#e4e4e7'}`,
                    cursor: 'pointer',
                  }}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        paddingBlock: 20,
        paddingInline: `${paddingX ?? 3}%`,
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: containerBackgroundColor || 'transparent',
      }}
    >
      {dedicated && orderResult ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: backgroundColor || '#ffffff',
            color: textColor || '#111827',
            borderRadius: borderRadius ?? 0,
            border: `1px solid ${inputBorderColor || '#e4e4e7'}`,
          }}
        >
          <CheckCircle size={48} style={{ color: '#10b981', marginInline: 'auto', marginBottom: 16 }} />
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{t.orderSuccessTitle}</p>
          <p style={{ fontSize: 13, opacity: 0.7 }}>{t.orderSuccessSubtitle}</p>
        </div>
      ) : !product ? (
        <p style={{ textAlign: 'center', fontSize: 14, opacity: 0.6 }}>{t.loading}</p>
      ) : (
        <ProductForm
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            productImage: product.productImage,
            offers: product.offers,
            attributes: product.attributes,
            variantDetails: product.variantDetails,
            isDigital: product.isDigital,
            store: { id: product.storeId, name: '', subdomain: product.domain, userId: product.userId },
          }}
          userId={product.userId}
          domain={product.domain}
          redirectPath={`/lp/${lpDomain}/successfully`}
          selectedOffer={selectedOffer}
          setSelectedOffer={setSelectedOffer}
          selectedVariants={selectedVariants}
          renderBefore={productSummary}
          title={title}
          buttonText={buttonText}
          builderPageId={builderPageId}
          backgroundColor={backgroundColor}
          textColor={textColor}
          buttonBackgroundColor={buttonBackgroundColor}
          buttonTextColor={buttonTextColor}
          buttonBorderColor={buttonBorderColor}
          inputBackgroundColor={inputBackgroundColor}
          inputBorderColor={inputBorderColor}
          inputTextColor={inputTextColor}
          borderRadius={borderRadius}
          language={language}
          onOrderSuccess={dedicated ? setOrderResult : undefined}
        />
      )}
    </div>
  );
}
