'use client';

import Link from 'next/link';
import React from 'react';
import Card from '../components/card';

/* ── Boho SVG decorations ── */
const FeatherSvg = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="60" height="120" viewBox="0 0 60 120" fill="none" style={{ ...style, opacity: 0.15 }}>
    <path d="M30 110 Q28 85 30 10" stroke="#7A9068" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M30 90 Q10 75 8 55"  stroke="#7A9068" strokeWidth="1" strokeLinecap="round"/>
    <path d="M30 70 Q50 55 52 38" stroke="#C4714A" strokeWidth="1" strokeLinecap="round"/>
    <path d="M30 50 Q12 38 14 22" stroke="#7A9068" strokeWidth="1" strokeLinecap="round"/>
    <path d="M30 30 Q46 20 45 8"  stroke="#C4714A" strokeWidth="1" strokeLinecap="round"/>
    <ellipse cx="8"  cy="53" rx="6" ry="10" fill="#7A9068" opacity="0.4" transform="rotate(-30 8 53)"/>
    <ellipse cx="52" cy="36" rx="6" ry="10" fill="#C4714A" opacity="0.3" transform="rotate(25 52 36)"/>
    <ellipse cx="14" cy="20" rx="5" ry="9"  fill="#7A9068" opacity="0.35" transform="rotate(-20 14 20)"/>
    <ellipse cx="45" cy="7"  rx="5" ry="8"  fill="#D4A28C" opacity="0.4" transform="rotate(15 45 7)"/>
  </svg>
);

const MoonSvg = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.3 }}>
    <path d="M22 16a10 10 0 1 1-10-10 7 7 0 0 0 10 10z" fill="#C4714A"/>
  </svg>
);

export const Home = ({ store }: any) => {
  const isRTL = store.language === 'ar';
  const dir   = isRTL ? 'rtl' : 'ltr';

  const t = {
    categories:       isRTL ? 'تصفّح التصنيفات'              : 'Collections',
    noCategories:     isRTL ? 'لا توجد تصنيفات'              : 'No Collections Yet',
    noCategoriesDesc: isRTL ? 'لم يتم إضافة أي تصنيفات بعد'  : 'Check back soon for new arrivals',
    products:         isRTL ? 'أحدث المنتجات'                 : 'Latest Arrivals',
    noProducts:       isRTL ? 'لا توجد منتجات'                : 'No Products Yet',
    noProductsDesc:   isRTL ? 'لم يتم إضافة أي منتجات بعد'   : 'New pieces arriving soon…',
    viewDetails:      isRTL ? 'اكتشف المنتج'                  : 'Discover',
    all:              isRTL ? 'الكل'                           : 'All',
    scrollDown:       isRTL ? 'تمرير للأسفل'                  : 'Scroll',
  };

  return (
    <div
      className="min-h-screen"
      dir={dir}
      style={{ backgroundColor: '#F7F0E6', fontFamily: "'Karla', sans-serif" }}
    >

      {/* ══ HERO ══ */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: '88vh' }}
      >
        {/* Background image or warm gradient */}
        {store.hero.imageUrl ? (
          <>
            <img
              src={store.hero.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(105deg, rgba(61,35,20,0.6) 0%, rgba(61,35,20,0.1) 60%, transparent 100%)' }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #EDE0CE 0%, #F7F0E6 50%, #EAE2D4 100%)' }}
          />
        )}

        {/* Decorative feathers */}
        <div className="absolute top-12 right-12 pointer-events-none hidden lg:block">
          <FeatherSvg style={{ transform: 'rotate(10deg)' }} />
        </div>
        <div className="absolute bottom-16 left-8 pointer-events-none hidden lg:block">
          <FeatherSvg style={{ transform: 'rotate(-15deg) scaleX(-1)' }} />
        </div>
        <div className="absolute top-8 left-1/2 pointer-events-none">
          <MoonSvg />
        </div>

        {/* Hero text */}
        <div className="relative z-10 px-10 lg:px-20 max-w-2xl boho-in">
          {(store.hero.title || store.hero.subtitle) ? (
            <>
              {store.hero.title && (
                <h1
                  className="leading-tight mb-5"
                  style={{
                    fontFamily:    "'Fraunces', serif",
                    fontStyle:     'italic',
                    fontWeight:    300,
                    fontSize:      'clamp(2.8rem, 7vw, 5.5rem)',
                    color:         store.hero.imageUrl ? '#FDF8F2' : '#3D2314',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {store.hero.title}
                </h1>
              )}
              {store.hero.subtitle && (
                <p
                  className="mb-9 max-w-md leading-relaxed boho-in-1"
                  style={{
                    color:         store.hero.imageUrl ? 'rgba(253,248,242,0.8)' : '#8E7860',
                    fontSize:      '1rem',
                    letterSpacing: '0.03em',
                  }}
                >
                  {store.hero.subtitle}
                </p>
              )}
              <div className="flex flex-wrap gap-4 boho-in-2">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    backgroundColor: '#C4714A',
                    color:           '#FDF8F2',
                    borderRadius:    '30px',
                    letterSpacing:   '0.06em',
                  }}
                >
                  {isRTL ? 'اكتشف المجموعة' : 'Explore Collection'}
                </a>
                <a
                  href="#categories"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 hover:bg-[#EDE0CE]"
                  style={{
                    backgroundColor: store.hero.imageUrl ? 'rgba(253,248,242,0.15)' : '#EDE0CE',
                    color:           store.hero.imageUrl ? '#FDF8F2' : '#3D2314',
                    borderRadius:    '30px',
                    border:          '1px solid',
                    borderColor:     store.hero.imageUrl ? 'rgba(253,248,242,0.3)' : '#D8C8B0',
                  }}
                >
                  {t.categories}
                </a>
              </div>
            </>
          ) : !store.hero.imageUrl && (
            <div className="text-center w-full px-4">
              <div className="mb-6">
                <FeatherSvg style={{ margin: '0 auto', width: '50px' }} />
              </div>
              <p
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle:  'italic',
                  fontSize:   '2rem',
                  color:      '#B89A7A',
                  fontWeight: 300,
                }}
              >
                {store.name}
              </p>
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span
            className="text-[10px] tracking-widest"
            style={{ color: store.hero.imageUrl ? 'rgba(253,248,242,0.5)' : '#C8B09A', letterSpacing: '0.2em' }}
          >
            {t.scrollDown}
          </span>
          <div
            className="w-px h-10 animate-pulse"
            style={{ backgroundColor: store.hero.imageUrl ? 'rgba(253,248,242,0.3)' : '#D4A28C' }}
          />
        </div>
      </section>

      {/* ══ CATEGORIES ══ */}
      <section id="categories" className="py-20" style={{ backgroundColor: '#F7F0E6' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          {/* Section label */}
          <div className="text-center mb-12 boho-in">
            <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: '#C4714A', letterSpacing: '0.22em' }}>
              ✦ &nbsp; {isRTL ? 'تصفّح' : 'Browse'} &nbsp; ✦
            </p>
            <h2
              style={{
                fontFamily:    "'Fraunces', serif",
                fontStyle:     'italic',
                fontWeight:    300,
                fontSize:      'clamp(1.8rem, 4vw, 2.8rem)',
                color:         '#3D2314',
                letterSpacing: '-0.01em',
              }}
            >
              {t.categories}
            </h2>
          </div>

          {store.categories && store.categories.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              {/* All pill */}
              <Link
                href={`/${store.domain}`}
                className="px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: '#C4714A',
                  color:           '#FDF8F2',
                  borderRadius:    '30px',
                  letterSpacing:   '0.05em',
                }}
              >
                ✦ {t.all}
              </Link>

              {store.categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/${store.domain}?category=${cat.id}`}
                  className="px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[#C4714A] hover:text-[#3D2314]"
                  style={{
                    backgroundColor: '#FDF8F2',
                    color:           '#8E7860',
                    borderRadius:    '30px',
                    border:          '1px solid #E0CEBC',
                  }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: '#C8B09A', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '1.1rem' }}>
                {t.noCategoriesDesc}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Wavy section divider */}
      <div className="wavy-divider w-full" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 50" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '50px' }}>
          <path d="M0,0 C360,50 1080,0 1440,40 L1440,50 L0,50 Z" fill="#F0E6D8"/>
        </svg>
      </div>

      {/* ══ PRODUCTS ══ */}
      <section id="products" className="py-20" style={{ backgroundColor: '#F0E6D8' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="text-center mb-14">
            <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: '#C4714A', letterSpacing: '0.22em' }}>
              ✦ &nbsp; {isRTL ? 'جديد' : 'New In'} &nbsp; ✦
            </p>
            <h2
              style={{
                fontFamily:    "'Fraunces', serif",
                fontStyle:     'italic',
                fontWeight:    300,
                fontSize:      'clamp(1.8rem, 4vw, 2.8rem)',
                color:         '#3D2314',
                letterSpacing: '-0.01em',
              }}
            >
              {t.products}
            </h2>
          </div>

          {store.products && store.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {store.products.map((product: any) => {
                const displayImage =
                  product.productImage ||
                  product.imagesProduct?.[0]?.imageUrl ||
                  store.design?.logoUrl;
                const discount = product.priceOriginal
                  ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100)
                  : 0;
                return (
                  <Card
                    key={product.id}
                    product={product}
                    displayImage={displayImage}
                    discount={discount}
                    isRTL={isRTL}
                    store={store}
                    viewDetails={t.viewDetails}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-6">
                <FeatherSvg style={{ margin: '0 auto' }} />
              </div>
              <p
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle:  'italic',
                  fontSize:   '1.5rem',
                  color:      '#C8B09A',
                  fontWeight: 300,
                }}
              >
                {t.noProductsDesc}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Wavy section divider bottom */}
      <div className="wavy-divider w-full" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 50" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '50px' }}>
          <path d="M0,40 C480,0 960,50 1440,10 L1440,50 L0,50 Z" fill="#F7F0E6"/>
        </svg>
      </div>

    </div>
  );
};