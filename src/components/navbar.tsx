'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Store } from '@/types/store';

interface NavbarProps {
  store: Store;
}

export function Navbar({ store }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isRTL = store.language === 'ar';

  const navItems = [
    { href: `/${store.subdomain}`,            label: isRTL ? 'الرئيسية'  : 'Home'       },
    { href: `/${store.subdomain}#categories`, label: isRTL ? 'التصنيفات' : 'Categories' },
    { href: `/${store.subdomain}#products`,   label: isRTL ? 'المنتجات'  : 'Products'   },
    { href: `/${store.subdomain}#contact`,    label: isRTL ? 'اتصل بنا'  : 'Contact'    },
  ];

  // "Boutique Shopping" → "BS"
  const initials = store.name
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ── */}
          <Link
            href={`/${store.subdomain}`}
            className="flex items-center gap-2 flex-shrink-0"
          >
            {store.design.logoUrl ? (
              /* Has logo → show image */
              <img
                src={store.design.logoUrl}
                alt={store.name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              /* No logo → initials badge + full name */
              <>
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-black text-sm tracking-wider shrink-0"
                  style={{ backgroundColor: store.design.primaryColor }}
                >
                  {initials}
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">
                  {store.name}
                </span>
              </>
            )}
          </Link>

          {/* ── Desktop Navigation ── */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
              >
                {item.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full"
                  style={{ backgroundColor: store.design.primaryColor }}
                />
              </Link>
            ))}
          </div>

          {/* ── Mobile Menu Button ── */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}