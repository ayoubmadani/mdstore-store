'use client';

import { Check, ChevronLeft, ChevronRight, FileText, Heart, Infinity, Link2, Package, Share2, X } from 'lucide-react';
import { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import ProductForm from '../components/productForm';

export default function Details({
  product, toggleWishlist, isWishlisted, handleShare, discount,
  allImages, allAttrs, finalPrice, inStock, autoGen,
  selectedVariants, setSelectedOffer, selectedOffer,
  handleVariantSelection, domain,
}: any) {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{ backgroundColor: '#F7F0E6', fontFamily: "'Karla', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Karla:wght@300;400;500;600&display=swap');`}</style>

      {/* ── Success toast ── */}
      {submitSuccess && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-7 py-4 shadow-xl"
          style={{ backgroundColor: '#FDF8F2', border: '1px solid #EDE0CE', borderRadius: '16px', borderRight: '4px solid #7A9068' }}
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ backgroundColor: '#7A9068' }}>
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#3D2314' }}>تم تأكيد طلبك! ✨</p>
            <p className="text-xs mt-0.5" style={{ color: '#9E8060' }}>سنتصل بك خلال 24 ساعة</p>
          </div>
        </div>
      )}

      {/* ── Share toast ── */}
      {showShareToast && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 text-sm shadow-lg"
          style={{ backgroundColor: '#3D2314', color: '#F7F0E6', borderRadius: '30px' }}
        >
          <Link2 className="w-3.5 h-3.5" /> تم نسخ الرابط
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <header
        className="sticky top-0 z-40 transition-all"
        style={{ backgroundColor: 'rgba(247,240,230,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E8D9C5' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs" style={{ color: '#B89A7A' }}>
            <span className="hover:text-[#3D2314] cursor-pointer transition-colors">الرئيسية</span>
            <ChevronLeft className="w-3 h-3" />
            <span className="hover:text-[#3D2314] cursor-pointer transition-colors">المنتجات</span>
            <ChevronLeft className="w-3 h-3" />
            <span style={{ color: '#3D2314' }}>{product.name}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleWishlist}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
              style={{
                backgroundColor: isWishlisted ? 'rgba(196,113,74,0.1)' : '#F0E4D4',
                border:          isWishlisted ? '1px solid rgba(196,113,74,0.3)' : '1px solid transparent',
                color:           isWishlisted ? '#C4714A' : '#8E7860',
              }}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
              style={{ backgroundColor: '#F0E4D4', color: '#8E7860' }}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Stock badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold tracking-wider rounded-full"
              style={{
                backgroundColor: inStock ? 'rgba(122,144,104,0.12)' : 'rgba(196,113,74,0.1)',
                color:           inStock ? '#7A9068' : '#C4714A',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: inStock ? '#7A9068' : '#C4714A' }}
              />
              {inStock ? 'متوفر' : 'غير متوفر'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* ══ Images ══ */}
          <div className="space-y-3">
            {/* Main image */}
            <div
              className="relative overflow-hidden group"
              style={{ aspectRatio: '4/5', backgroundColor: '#EDE0CE', borderRadius: '24px' }}
            >
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16" style={{ color: '#D4A28C' }} />
                </div>
              )}

              {/* Discount badge */}
              {discount > 0 && (
                <div
                  className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5"
                  style={{ backgroundColor: '#C4714A', color: '#FDF8F2', borderRadius: '20px' }}
                >
                  -{discount}%
                </div>
              )}

              {/* Wishlist */}
              <button
                onClick={toggleWishlist}
                className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 shadow-sm"
                style={{
                  backgroundColor: isWishlisted ? '#C4714A' : 'rgba(253,248,242,0.9)',
                  color:           isWishlisted ? '#FDF8F2' : '#8E7860',
                }}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {/* Out of stock overlay */}
              {!inStock && !autoGen && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(247,240,230,0.8)', backdropFilter: 'blur(4px)', borderRadius: '24px' }}
                >
                  <div
                    className="px-6 py-3 text-sm font-semibold"
                    style={{ backgroundColor: '#FDF8F2', color: '#C4714A', borderRadius: '30px', border: '1px solid #EDE0CE' }}
                  >
                    نفذت الكمية
                  </div>
                </div>
              )}

              {/* Nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(p => (p === 0 ? allImages.length - 1 : p - 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(253,248,242,0.9)', color: '#3D2314' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(p => (p === allImages.length - 1 ? 0 : p + 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(253,248,242,0.9)', color: '#3D2314' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className="shrink-0 w-16 h-20 overflow-hidden transition-all duration-200"
                    style={{
                      borderRadius: '12px',
                      border:       `2px solid ${selectedImage === idx ? '#C4714A' : 'transparent'}`,
                      opacity:      selectedImage === idx ? 1 : 0.55,
                      boxShadow:    selectedImage === idx ? '0 0 0 2px rgba(196,113,74,0.2)' : 'none',
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ══ Info + Form ══ */}
          <div className="space-y-7">

            {/* Name */}
            <div>
              <h1
                style={{
                  fontFamily:    "'Fraunces', serif",
                  fontStyle:     'italic',
                  fontWeight:    300,
                  fontSize:      'clamp(1.8rem, 4vw, 2.5rem)',
                  color:         '#3D2314',
                  letterSpacing: '-0.02em',
                  lineHeight:    1.2,
                }}
              >
                {product.name}
              </h1>

              {/* Stars */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < 4 ? '#C4714A' : 'none'} stroke="#C4714A" strokeWidth="1.5">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                </div>
                <span className="text-xs" style={{ color: '#B89A7A' }}>٤.٨ · ١٢٨ تقييم</span>
              </div>
            </div>

            {/* Price */}
            <div
              className="p-5"
              style={{ backgroundColor: '#F0E6D8', borderRadius: '16px' }}
            >
              <div className="flex items-baseline gap-4">
                <span
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize:   '2.2rem',
                    fontWeight: 400,
                    color:      '#C4714A',
                  }}
                >
                  {finalPrice.toLocaleString('ar-DZ')}
                </span>
                <span className="text-sm" style={{ color: '#B89A7A' }}>دج</span>
                {product.priceOriginal && parseFloat(product.priceOriginal) > finalPrice && (
                  <div>
                    <span className="text-sm line-through" style={{ color: '#C8B09A' }}>
                      {parseFloat(product.priceOriginal).toLocaleString('ar-DZ')} دج
                    </span>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: '#7A9068' }}>
                      وفّر {(parseFloat(product.priceOriginal) - finalPrice).toLocaleString('ar-DZ')} دج
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: autoGen ? 'rgba(122,144,104,0.1)' : inStock ? 'rgba(122,144,104,0.1)' : 'rgba(196,113,74,0.1)',
                color:           autoGen ? '#7A9068' : inStock ? '#7A9068' : '#C4714A',
                borderRadius:    '30px',
              }}
            >
              {autoGen ? <Infinity className="w-3.5 h-3.5" /> : inStock ? <span className="w-2 h-2 rounded-full bg-current" /> : <X className="w-3.5 h-3.5" />}
              {autoGen ? 'متوفر دائماً' : inStock ? 'متوفر في المخزون' : 'غير متوفر حالياً'}
            </div>

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#B89A7A', letterSpacing: '0.12em' }}>العروض المتاحة</p>
                <div className="space-y-2">
                  {product.offers.map((offer: any) => (
                    <label
                      key={offer.id}
                      className="flex items-center justify-between p-4 cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: selectedOffer === offer.id ? '#FDF8F2' : '#F7F0E6',
                        borderRadius:    '14px',
                        border:          `1.5px solid ${selectedOffer === offer.id ? '#C4714A' : '#E0CEBC'}`,
                        boxShadow:       selectedOffer === offer.id ? '0 4px 12px rgba(196,113,74,0.12)' : 'none',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{
                            border:          `1.5px solid ${selectedOffer === offer.id ? '#C4714A' : '#D4A28C'}`,
                            backgroundColor: selectedOffer === offer.id ? '#C4714A' : 'transparent',
                          }}
                        >
                          {selectedOffer === offer.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input type="radio" name="offer" value={offer.id} checked={selectedOffer === offer.id} onChange={() => setSelectedOffer(offer.id)} className="sr-only" />
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#3D2314' }}>{offer.name}</p>
                          <p className="text-xs" style={{ color: '#9E8060' }}>{offer.quantity} قطع</p>
                        </div>
                      </div>
                      <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.2rem', color: '#C4714A' }}>
                        {offer.price.toLocaleString('ar-DZ')} <span className="text-xs">دج</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {allAttrs.map((attr: any) => (
              <div key={attr.id}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#B89A7A', letterSpacing: '0.12em' }}>
                  {attr.name}
                </p>
                {attr.displayMode === 'color' ? (
                  <div className="flex gap-2.5 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          title={v.name}
                          className="w-9 h-9 rounded-full transition-all duration-200"
                          style={{
                            backgroundColor: v.value,
                            border:          `2px solid ${isSel ? '#C4714A' : 'transparent'}`,
                            boxShadow:       isSel ? '0 0 0 3px rgba(196,113,74,0.2)' : '0 0 0 1px rgba(0,0,0,0.1)',
                            transform:       isSel ? 'scale(1.15)' : 'scale(1)',
                          }}
                        />
                      );
                    })}
                  </div>
                ) : attr.displayMode === 'image' ? (
                  <div className="flex gap-2 flex-wrap">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          className="w-16 h-16 overflow-hidden transition-all"
                          style={{
                            borderRadius: '10px',
                            border:       `2px solid ${isSel ? '#C4714A' : '#E0CEBC'}`,
                            opacity:      isSel ? 1 : 0.7,
                          }}
                        >
                          <img src={v.value} alt={v.name} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attr.variants.map((v: any) => {
                      const isSel = selectedVariants[attr.name] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelection(attr.name, v.value)}
                          className="px-5 py-2 text-sm font-medium transition-all duration-200"
                          style={{
                            backgroundColor: isSel ? '#C4714A' : '#FDF8F2',
                            color:           isSel ? '#FDF8F2' : '#8E7860',
                            borderRadius:    '30px',
                            border:          `1px solid ${isSel ? '#C4714A' : '#E0CEBC'}`,
                            boxShadow:       isSel ? '0 4px 12px rgba(196,113,74,0.25)' : 'none',
                          }}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Order form */}
            <ProductForm
              product={product}
              userId={product.store.userId}
              domain={domain}
              selectedOffer={selectedOffer}
              setSelectedOffer={setSelectedOffer}
              selectedVariants={selectedVariants}
            />
          </div>
        </div>

        {/* Description */}
        {product.desc && (
          <section className="mt-20 pt-14" style={{ borderTop: '1px solid #E8D9C5' }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-8" style={{ backgroundColor: '#E0CEBC' }} />
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle:  'italic',
                  fontSize:   '1.4rem',
                  color:      '#3D2314',
                  fontWeight: 300,
                }}
              >
                {' '}وصف المنتج
              </h2>
            </div>
            <div
              className="text-sm leading-relaxed max-w-2xl"
              style={{ color: '#8E7860' }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(product.desc, {
                  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'],
                  ALLOWED_ATTR: ['class', 'style'],
                }),
              }}
            />
          </section>
        )}
      </main>
    </div>
  );
}