'use client';

import Link from 'next/link';
import React from 'react';

export default function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  return (
    <div
      className="boho-card group flex flex-col overflow-hidden"
      style={{
        backgroundColor:  '#FDF8F2',
        borderRadius:     '20px',
        border:           '1px solid #EDE0CE',
        fontFamily:       "'Karla', sans-serif",
      }}
    >
      {/* Image area */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '3/4', backgroundColor: '#EDE0CE', borderRadius: '20px 20px 0 0' }}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {/* Placeholder boho circle */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#C4714A" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"/>
              <circle cx="24" cy="24" r="10" stroke="#7A9068" strokeWidth="1" opacity="0.3"/>
              <circle cx="24" cy="24" r="3" fill="#C4714A" opacity="0.3"/>
            </svg>
            <span className="text-xs tracking-wider" style={{ color: '#B89A7A' }}>
              {isRTL ? 'لا توجد صورة' : 'No Image'}
            </span>
          </div>
        )}

        {/* Warm gradient overlay at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(61,35,20,0.35), transparent)' }}
        />

        {/* Discount ribbon */}
        {discount > 0 && (
          <div
            className="absolute top-3 right-3 text-[10px] font-semibold tracking-wider px-2.5 py-1"
            style={{
              backgroundColor: '#C4714A',
              color:           '#FDF8F2',
              borderRadius:    '20px',
              letterSpacing:   '0.08em',
            }}
          >
            -{discount}%
          </div>
        )}

        {/* Quick view on hover */}
        <div
          className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0"
        >
          <Link
            href={`/${store.subdomain}/product/${product.slug || product.id}`}
            className="text-[11px] tracking-widest font-semibold px-5 py-2 transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: '#FDF8F2',
              color:           '#3D2314',
              borderRadius:    '30px',
              letterSpacing:   '0.1em',
            }}
          >
            {viewDetails}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className="mb-1 line-clamp-1 group-hover:text-[#C4714A] transition-colors duration-300"
          style={{
            fontFamily:    "'Fraunces', serif",
            fontStyle:     'italic',
            fontSize:      '1rem',
            fontWeight:    400,
            color:         '#3D2314',
            letterSpacing: '-0.01em',
          }}
        >
          {product.name}
        </h3>

        {product.desc && (
          <div
            className="text-xs mb-3 line-clamp-2 leading-relaxed"
            style={{ color: '#9E8060' }}
            dangerouslySetInnerHTML={{ __html: product.desc }}
          />
        )}

        {/* Decorative divider */}
        <div className="my-3 flex items-center gap-2">
          <div className="flex-1 h-px" style={{ backgroundColor: '#EDE0CE' }} />
          <span style={{ color: '#D4A28C', fontSize: '8px' }}>✦</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#EDE0CE' }} />
        </div>

        <div className="mt-auto flex items-center justify-between">
          {/* Price */}
          <div>
            <span
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize:   '1.25rem',
                fontWeight: 400,
                color:      '#C4714A',
              }}
            >
              {product.price}
            </span>
            <span className="text-xs ml-1" style={{ color: '#B89A7A' }}>{store.currency}</span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <p className="text-xs line-through mt-0.5" style={{ color: '#C8B09A' }}>
                {product.priceOriginal}
              </p>
            )}
          </div>

          {/* Arrow CTA */}
          <Link
            href={`/${store.subdomain}/product/${product.slug || product.id}`}
            className="flex items-center justify-center w-9 h-9 transition-all duration-300 hover:scale-110 group/btn"
            style={{
              backgroundColor: '#F0E6D8',
              borderRadius:    '50%',
              border:          '1px solid #E0CEBC',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#C4714A')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F0E6D8')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors group-hover/btn:stroke-white" style={{ color: '#8E7860' }}>
              {isRTL
                ? <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>
                : <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>
              }
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}