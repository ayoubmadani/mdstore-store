'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store } from '@/types/store';

interface NavbarProps { store: Store; }

/* ── Small boho sun SVG ── */
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2"  x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="5" y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
  </svg>
);

export function Navbar({ store }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const isRTL = store.language === 'ar';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { href: `/${store.subdomain}`,         label: isRTL ? 'الرئيسية'       : 'Home'    },
    { href: `/${store.subdomain}/contact`, label: isRTL ? 'اتصل بنا'       : 'Contact' },
    { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'سياسة الخصوصية' : 'Privacy' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Karla:wght@300;400;500&display=swap');

        .boho-nav-link { position: relative; padding-bottom: 2px; }
        .boho-nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          height: 1px; width: 0;
          background: #C4714A;
          transition: width 0.3s ease;
        }
        .boho-nav-link:hover::after { width: 100%; }
        .boho-nav-link:hover { color: #3D2314 !important; }
      `}</style>

      <nav
        dir={isRTL ? 'rtl' : 'ltr'}
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? 'rgba(247,240,230,0.96)' : '#F7F0E6',
          backdropFilter:  scrolled ? 'blur(10px)' : 'none',
          borderBottom:    scrolled ? '1px solid #E8D9C5' : '1px solid transparent',
          boxShadow:       scrolled ? '0 4px 20px rgba(61,35,20,0.06)' : 'none',
          fontFamily:      "'Karla', sans-serif",
        }}
      >
        {/* Decorative top ribbon */}
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, #C4714A, #D4A28C, #7A9068, #D4A28C, #C4714A)' }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center h-16">

            {/* ── Logo / Brand ── */}
            <Link href={`/${store.subdomain}`} className="flex items-center gap-2.5 group">
              <div className="feather-drift opacity-80 group-hover:opacity-100 transition-opacity">
                <SunIcon />
              </div>

              {store.design.logoUrl ? (
                <img
                  src={store.design.logoUrl}
                  alt={store.name}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span
                  className="group-hover:text-[#C4714A] transition-colors duration-300"
                  style={{
                    fontFamily:  "'Fraunces', serif",
                    fontStyle:   'italic',
                    fontWeight:  400,
                    fontSize:    '1.35rem',
                    color:       '#3D2314',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {store.name}
                </span>
              )}
            </Link>

            {/* ── Desktop links ── */}
            <div className="hidden md:flex items-center gap-9">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="boho-nav-link text-sm font-medium transition-colors duration-200"
                  style={{ color: '#8E7860', letterSpacing: '0.04em' }}
                >
                  {item.label}
                </Link>
              ))}

              {/* Decorative dot */}
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C4714A', opacity: 0.5 }} />
            </div>

            {/* ── Mobile burger ── */}
            <button
              onClick={() => setIsMenuOpen(p => !p)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
            >
              <span
                className="block h-px transition-all duration-300"
                style={{
                  width: '22px',
                  backgroundColor: '#3D2314',
                  transform: isMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
                }}
              />
              <span
                className="block h-px transition-all duration-300"
                style={{
                  width: '14px',
                  backgroundColor: '#3D2314',
                  opacity: isMenuOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-px transition-all duration-300"
                style={{
                  width: '22px',
                  backgroundColor: '#3D2314',
                  transform: isMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
                }}
              />
            </button>
          </div>

          {/* ── Mobile menu ── */}
          <div
            className="md:hidden overflow-hidden transition-all duration-400"
            style={{ maxHeight: isMenuOpen ? '240px' : '0', paddingBottom: isMenuOpen ? '1.25rem' : '0' }}
          >
            <div className="flex flex-col gap-5 pt-4" style={{ borderTop: '1px solid #E8D9C5' }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: '#8E7860' }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#C4714A' }} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}