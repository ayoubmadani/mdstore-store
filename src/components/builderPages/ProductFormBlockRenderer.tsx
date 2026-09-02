'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Check } from 'lucide-react';
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
  supportQty?: boolean;
}

function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, value]) =>
    detail.name?.some((entry) => entry.attrName === attrName && entry.value === value)
  );
}

// Picks black or white for a checkmark drawn on top of an arbitrary color
// swatch, so it stays visible on both light (e.g. white, yellow) and dark
// (e.g. black, navy) attribute colors instead of assuming one fixed color.
function contrastText(hex: string): string {
  if (!hex || !/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(hex)) return '#ffffff';
  const full = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const num = parseInt(full.slice(1), 16);
  const r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#ffffff';
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
  buttonText?: string;
  containerBackgroundColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBackgroundColorDisabled?: string;
  buttonTextColorDisabled?: string;
  buttonBorderColorDisabled?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputTextColor?: string;
  paddingX?: number;
  paddingY?: number;
  borderRadius?: number;
  sectionGap?: number;
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
    buttonText,
    containerBackgroundColor,
    backgroundColor,
    textColor,
    buttonBackgroundColor,
    buttonTextColor,
    buttonBorderColor,
    buttonBackgroundColorDisabled,
    buttonTextColorDisabled,
    buttonBorderColorDisabled,
    inputBackgroundColor,
    inputBorderColor,
    inputTextColor,
    paddingX,
    paddingY,
    borderRadius,
    sectionGap,
  } = (props || {}) as ProductFormBlockProps;

  // Matches ProductForm.tsx's own default fallback exactly (both are only
  // ever unset on pages saved before componentsMap.js started persisting
  // '#10b981' as this block's defaultProp) — keeps the offers/attributes
  // picker and the actual submit button in visual agreement.
  const accentColor = buttonBackgroundColor || '#111827';
  // "Couleurs du bouton actif/désactivé" apply to every selectable-choice
  // button here (offers, attribute/variant options) — active = the
  // currently-picked choice, désactivé = every other choice in that group.
  const activeBtnText = buttonTextColor || '#ffffff';
  const activeBtnBorder = buttonBorderColor || accentColor;
  const inactiveBtnBg = buttonBackgroundColorDisabled || '#f9fafb';
  const inactiveBtnText = buttonTextColorDisabled || '#18181b';
  const inactiveBtnBorder = buttonBorderColorDisabled || '#e4e4e7';
  // Same merchant-configurable radius as the outer <ProductForm> card,
  // applied to every inner section box too (product info, offers, options)
  // so "Rayon des angles" controls all of them uniformly.
  const sectionRadius = borderRadius ?? 10;
  const gapPx = sectionGap ?? 14;

  const matchedVariantDetail =
    product?.variantDetails?.length && Object.keys(selectedVariants).length
      ? product.variantDetails.find((v) => variantMatches(v, selectedVariants))
      : null;

  if (!productId) return null;

  const productSummary = product && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: gapPx }}>
      {showProductName !== false && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: sectionRadius, backgroundColor: backgroundColor || '#ffffff', border: '1px solid #e4e4e7' }}>
          {product.productImage && (
            <img src={product.productImage} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
          )}
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{productNameOverride || product.name}</p>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
              {formatPrice(matchedVariantDetail && matchedVariantDetail.price !== -1 ? matchedVariantDetail.price : product.price)}
            </p>
          </div>
        </div>
      )}

      {product.offers && product.offers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: sectionRadius, backgroundColor: backgroundColor || '#ffffff', border: '1px solid #e4e4e7' }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{t.offersTitle}</p>
          {product.offers.map((offer) => (
            <label
              key={offer.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '14px 10px',
                borderRadius: 8,
                border: `1px solid ${selectedOffer === offer.id ? activeBtnBorder : inactiveBtnBorder}`,
                cursor: 'pointer',
                fontSize: 20,
                fontWeight: 700,
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
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  {offer.name}
                  <span style={{ fontSize: 16, fontWeight: 400, opacity: 0.6 }}>({offer.quantity} {t.pieces})</span>
                </span>
              </span>
              <span style={{ fontWeight: 700 }}>{formatPrice(offer.price)}</span>
            </label>
          ))}
        </div>
      )}

      {product.attributes && product.attributes.length > 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderRadius: sectionRadius, backgroundColor: backgroundColor || '#ffffff', border: '1px solid #e4e4e7' }}>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{t.optionsTitle}</p>
      {product.attributes.map((attr) => (
        <div key={attr.id}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>{attr.name}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {attr.variants?.map((v) => {
              const isSelected = selectedVariants[attr.name] === v.value;
              if (attr.displayMode === 'color') {
                // A colored ring around a colored swatch can blend into the
                // swatch's own fill and become invisible — a white gap
                // between them plus a checkmark makes the selected one
                // unmistakable no matter what color it is.
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVariantSelect(attr.name, v.value)}
                    title={v.name}
                    style={{
                      position: 'relative',
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: v.value,
                      border: '2px solid #ffffff',
                      boxShadow: isSelected
                        ? `0 0 0 2.5px ${activeBtnBorder}`
                        : `0 0 0 1px ${inactiveBtnBorder}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && <Check size={16} color={contrastText(v.value)} />}
                  </button>
                );
              }
              if (attr.displayMode === 'image') {
                // Same reasoning as the color swatch — the image's own
                // colors could match the ring, so a corner checkmark badge
                // stays visible regardless of what's in the picture.
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVariantSelect(attr.name, v.value)}
                    title={v.name}
                    style={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      padding: 0,
                      backgroundImage: `url(${v.value})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '2px solid #ffffff',
                      boxShadow: isSelected
                        ? `0 0 0 2.5px ${activeBtnBorder}`
                        : `0 0 0 1px ${inactiveBtnBorder}`,
                      cursor: 'pointer',
                    }}
                  >
                    {isSelected && (
                      <span style={{
                        position: 'absolute', top: -8, right: -8,
                        width: 22, height: 22, borderRadius: '50%',
                        backgroundColor: activeBtnBorder,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid #ffffff',
                      }}>
                        <Check size={13} color={contrastText(activeBtnBorder)} />
                      </span>
                    )}
                  </button>
                );
              }
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleVariantSelect(attr.name, v.value)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 6,
                    fontSize: 16,
                    backgroundColor: isSelected ? accentColor : inactiveBtnBg,
                    color: isSelected ? activeBtnText : inactiveBtnText,
                    border: `1px solid ${isSelected ? activeBtnBorder : inactiveBtnBorder}`,
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
      )}
    </div>
  );

  return (
    <div
      style={{
        paddingBlock: paddingY ?? 0,
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
            store: { id: product.storeId, name: '', subdomain: product.domain, userId: product.userId, supportQty: product.supportQty },
          }}
          userId={product.userId}
          domain={product.domain}
          redirectPath={`/lp/${lpDomain}/successfully`}
          selectedOffer={selectedOffer}
          setSelectedOffer={setSelectedOffer}
          selectedVariants={selectedVariants}
          renderBefore={productSummary}
          buttonText={buttonText}
          builderPageId={builderPageId}
          backgroundColor={backgroundColor}
          textColor={textColor}
          buttonBackgroundColor={buttonBackgroundColor}
          buttonTextColor={buttonTextColor}
          buttonBorderColor={buttonBorderColor}
          buttonBackgroundColorDisabled={buttonBackgroundColorDisabled}
          buttonTextColorDisabled={buttonTextColorDisabled}
          buttonBorderColorDisabled={buttonBorderColorDisabled}
          inputBackgroundColor={inputBackgroundColor}
          inputBorderColor={inputBorderColor}
          inputTextColor={inputTextColor}
          borderRadius={borderRadius}
          sectionGap={sectionGap}
          language={language}
          onOrderSuccess={dedicated ? setOrderResult : undefined}
        />
      )}
    </div>
  );
}
