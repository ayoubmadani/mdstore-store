'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import {
  Infinity, Star, Truck, Shield, RefreshCw,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import axios from 'axios';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/productForm/productForm2';
import AddShow from '@/components/addShow';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

/* ─── Types ──────────────────────────────────────────── */
interface Offer { id: string; name: string; quantity: number; price: number; }
interface Variant { id: string; name: string; value: string; }
interface Attribute {
  id: string; type: 'color' | 'size'; name: string;
  displayMode?: 'color' | 'image' | null; variants: Variant[];
}
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry {
  attrId: string; attrName: string;
  displayMode: 'color' | 'image' | 'text'; value: string;
}
interface VariantDetail {
  id: string; name: VariantAttributeEntry[];
  price: number; stock: number; autoGenerate: boolean;
}
interface Product {
  id: string; name: string; price: string | number;
  priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[];
  offers?: Offer[]; attributes?: Attribute[];
  variantDetails?: VariantDetail[]; stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; };
}
interface LandingPage {
  id: string; domain: string;
  urlImage: string; platform?: string;
  product: Product;
}

/* ─── Helpers ────────────────────────────────────────── */
function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some(e => e.attrName === attrName && e.value === val)
  );
}

async function getLandingPage(domain: string): Promise<LandingPage | null> {
  try {
    const res = await axios.get(`${API_URL}/landing-page/${domain}`);
    return res.data;
  } catch (err) {
    console.error('LP fetch error:', err);
    return null;
  }
}

/* ══════════════════════════════════════════════════════ */
export default function LandingPageView({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [lpDomain, setLpDomain] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  /* ── offer + variant – lifted so Offers/Attrs sections can control them ── */
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  /* ── Load LP ── */
  useEffect(() => {
    const load = async () => {
      try {
        const { domain } = await params;
        setLpDomain(domain);
        const data = await getLandingPage(domain);
        if (data) {
          setLp(data);
          if (data.product.offers?.length) setSelectedOffer(data.product.offers[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params]);

  /* ── Variant selection ── */
  const handleVariantSelect = useCallback((attrName: string, val: string) => {
    setSelectedVariants(prev => {
      const next = { ...prev };
      next[attrName] === val ? delete next[attrName] : (next[attrName] = val);
      return next;
    });
  }, []);

  /* ── Derived ── */
  const product = lp?.product ?? null;

  const allImages = useMemo(() => {
    if (!lp) return [];
    const imgs: string[] = [];
    if (lp.urlImage) imgs.push(lp.urlImage);
    if (product?.productImage) imgs.push(product.productImage);
    product?.imagesProduct?.forEach(i => imgs.push(i.imageUrl));
    return [...new Set(imgs)];
  }, [lp, product]);

  const getFinalPrice = useCallback((): number => {
    if (!product) return 0;
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const offer = product.offers?.find(o => o.id === selectedOffer);
    if (offer) return offer.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find(v => variantMatches(v, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);

  const getDiscountPct = useCallback((): number => {
    if (!product?.priceOriginal) return 0;
    const orig = parseFloat(product.priceOriginal.toString());
    const cur = getFinalPrice();
    return orig > cur ? Math.round(((orig - cur) / orig) * 100) : 0;
  }, [product, getFinalPrice]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-10 bg-gray-100 rounded-2xl w-1/2 mx-auto" />
          <div className="aspect-[4/3] bg-gray-100 rounded-3xl" />
          <div className="h-64 bg-gray-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!lp || !product || !product.isActive) return notFound();

  const finalPrice = getFinalPrice();
  const discount = getDiscountPct();
  const allAttrs = product.attributes || [];
  const autoGen = product.variantDetails?.every(v => v.autoGenerate) ?? false;

  return (
    <>
      <AddShow lpId={lp.id} />

      <div className="min-h-screen bg-gray-50" dir="rtl">

        {/* ── Hero image ── */}
        <div className="max-w-2xl mx-auto relative w-full bg-gray-900">
          {allImages.length > 0 && (
            <img src={allImages[selectedImage]} alt={product.name} className="w-full h-auto block" />
          )}

          {discount > 0 && (
            <div className="absolute top-5 right-5 bg-red-500 text-white text-sm font-black px-4 py-2 rounded-full shadow-xl">
              خصم {discount}%
            </div>
          )}

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
              {allImages.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0
                  ${selectedImage === idx ? 'border-white scale-110 shadow-lg' : 'border-white/40 opacity-70 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Arrows */}
          {allImages.length > 1 && (
            <>
              <button onClick={() => setSelectedImage(p => p === 0 ? allImages.length - 1 : p - 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow flex items-center justify-center hover:bg-white transition-all">
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              <button onClick={() => setSelectedImage(p => p === allImages.length - 1 ? 0 : p + 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow flex items-center justify-center hover:bg-white transition-all">
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* ── Main content ── */}
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

          {/* Name + rating */}
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-snug">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500">(4.8) · ١٢٨ تقييم</span>
              <span className="text-xs text-green-600 font-medium">٨٦ تم شراؤه اليوم</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-4xl font-black text-gray-900 tracking-tight">
              {finalPrice.toLocaleString('ar-DZ')}
              <span className="text-lg font-semibold text-gray-400 mr-1">د.ج</span>
            </span>
            {product.priceOriginal && parseFloat(product.priceOriginal.toString()) > finalPrice && (
              <div className="flex flex-col">
                <span className="text-lg text-gray-400 line-through">
                  {parseFloat(product.priceOriginal.toString()).toLocaleString('ar-DZ')} د.ج
                </span>
                <span className="text-xs text-red-500 font-bold">
                  وفّر {(parseFloat(product.priceOriginal.toString()) - finalPrice).toLocaleString('ar-DZ')} د.ج
                </span>
              </div>
            )}
          </div>

          {/* Stock badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border
          ${autoGen ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
            {autoGen
              ? <Infinity className="w-4 h-4" />
              : <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            {autoGen ? 'متوفر دائماً' : 'متوفر في المخزون'}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Truck className="w-5 h-5" />, label: 'توصيل سريع', sub: '24-48 ساعة' },
              { icon: <Shield className="w-5 h-5" />, label: 'جودة مضمونة', sub: '100% أصلي' },
              { icon: <RefreshCw className="w-5 h-5" />, label: 'استبدال سهل', sub: '7 أيام' },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-2 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-gray-700">{b.icon}</span>
                <span className="text-xs font-bold text-gray-800">{b.label}</span>
                <span className="text-[10px] text-gray-400">{b.sub}</span>
              </div>
            ))}
          </div>

          {/* Offers */}
          {product.offers && product.offers.length > 0 && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-800" />العروض المتاحة
              </p>
              <div className="space-y-2">
                {product.offers.map(offer => (
                  <label key={offer.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${selectedOffer === offer.id ? 'border-gray-900 bg-white shadow-sm' : 'border-amber-200/50 bg-white/50 hover:border-amber-300'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                      ${selectedOffer === offer.id ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                        {selectedOffer === offer.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id}
                        onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{offer.name}</p>
                        <p className="text-xs text-gray-500">{offer.quantity} قطع في العرض</p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-gray-900">
                      {offer.price.toLocaleString('ar-DZ')}
                      <span className="text-xs font-normal text-gray-500 mr-1">د.ج</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Attributes */}
          {allAttrs.map(attr => (
            <div key={attr.id}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{attr.name}</p>

              {attr.displayMode === 'color' ? (
                <div className="flex gap-3 flex-wrap">
                  {attr.variants.map(v => {
                    const isSel = selectedVariants[attr.name] === v.value;
                    return (
                      <button key={v.id} onClick={() => handleVariantSelect(attr.name, v.value)} title={v.name}
                        className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm
                        ${isSel ? 'ring-2 ring-gray-900 ring-offset-2 scale-110 border-gray-900' : 'border-gray-200 hover:scale-105'}`}
                        style={{ backgroundColor: v.value }} />
                    );
                  })}
                </div>
              ) : attr.displayMode === 'image' ? (
                <div className="flex gap-3 flex-wrap">
                  {attr.variants.map(v => {
                    const isSel = selectedVariants[attr.name] === v.value;
                    return (
                      <button key={v.id} onClick={() => handleVariantSelect(attr.name, v.value)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                        ${isSel ? 'border-gray-900 ring-2 ring-gray-200 scale-105' : 'border-gray-200 hover:border-gray-300'}`}>
                        <img src={v.value} alt={v.name} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {attr.variants.map(v => {
                    const isSel = selectedVariants[attr.name] === v.value;
                    return (
                      <button key={v.id} onClick={() => handleVariantSelect(attr.name, v.value)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all
                        ${isSel ? 'border-gray-900 bg-gray-900 text-white shadow-lg' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}>
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* ─── Order Form ─── */}
          <ProductForm
            product={product}
            lpId={lp.id}
            userId={product.store.userId}
            domain={product.store.subdomain}
            redirectPath={`/lp/${lpDomain}/successfully`}
            selectedOffer={selectedOffer}
            setSelectedOffer={setSelectedOffer}
            selectedVariants={selectedVariants}
            platform={lp.platform}
            priceLoss={0}
          />

          {/* Description */}
          {product.desc && (
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">وصف المنتج</h2>
              <div
                className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.desc, {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span'],
                    ALLOWED_ATTR: ['class', 'style'],
                  }),
                }}
              />
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 bg-white py-6">
          <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <span className="font-bold text-gray-700">{product.store.name}</span>
            <span>© 2026 جميع الحقوق محفوظة</span>
          </div>
        </footer>
      </div>
    </>
  );
}