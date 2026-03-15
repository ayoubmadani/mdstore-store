import React from 'react';

/* ── Boho botanical SVG ornament ── */
const BotanicalLeft = () => (
  <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.18 }}>
    <path d="M40 90 Q20 70 25 45 Q30 20 40 10" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M40 65 Q18 55 15 38" stroke="#7A9068" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <path d="M40 50 Q55 40 58 25" stroke="#7A9068" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <path d="M40 78 Q28 72 22 60" stroke="#C4714A" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <ellipse cx="15" cy="36" rx="7" ry="11" fill="#7A9068" opacity="0.4" transform="rotate(-30 15 36)"/>
    <ellipse cx="58" cy="23" rx="7" ry="10" fill="#7A9068" opacity="0.4" transform="rotate(20 58 23)"/>
    <ellipse cx="22" cy="58" rx="5" ry="8" fill="#C4714A" opacity="0.3" transform="rotate(-15 22 58)"/>
    <circle cx="40" cy="10" r="3" fill="#C4714A" opacity="0.5"/>
  </svg>
);

export default function Footer({ store }: any) {
  const isRTL = store.language === 'ar';

  return (
    <footer
      style={{ backgroundColor: '#3D2314', fontFamily: "'Karla', sans-serif", position: 'relative', overflow: 'hidden' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Wavy top edge */}
      <div className="wavy-divider w-full" style={{ marginTop: '-1px' }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
          <path
            d="M0,60 C240,20 480,60 720,30 C960,0 1200,50 1440,20 L1440,60 Z"
            fill="#F7F0E6"
          />
        </svg>
      </div>

      {/* Decorative botanical bg */}
      <div className="absolute top-8 left-6 pointer-events-none select-none hidden lg:block">
        <BotanicalLeft />
      </div>
      <div className="absolute top-8 right-6 pointer-events-none select-none hidden lg:block" style={{ transform: 'scaleX(-1)' }}>
        <BotanicalLeft />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 pb-12 pt-6 relative z-10">

        {/* Center brand block */}
        <div className="text-center mb-10">
          {store.design.logoUrl ? (
            <img
              src={store.design.logoUrl}
              alt={store.name}
              className="h-9 w-auto object-contain mx-auto mb-4 opacity-70"
              style={{ filter: 'brightness(0) invert(0.9) sepia(0.1)' }}
            />
          ) : (
            <p
              className="mb-3"
              style={{
                fontFamily:    "'Fraunces', serif",
                fontStyle:     'italic',
                fontSize:      '1.8rem',
                color:         '#E8D9C5',
                letterSpacing: '-0.01em',
                fontWeight:    300,
              }}
            >
              {store.name}
            </p>
          )}
          <p className="text-xs tracking-widest" style={{ color: '#7A5840', letterSpacing: '0.18em' }}>
            ✦ &nbsp; MADE WITH LOVE &nbsp; ✦
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px" style={{ backgroundColor: '#5A3322' }} />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
            <circle cx="12" cy="12" r="4"/>
            <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
            <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
          </svg>
          <div className="flex-1 h-px" style={{ backgroundColor: '#5A3322' }} />
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {[
            { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'سياسة الخصوصية' : 'Privacy' },
            { href: `/${store.subdomain}/Terms`,   label: isRTL ? 'الشروط'           : 'Terms'   },
            { href: `/${store.subdomain}/Cookise`, label: isRTL ? 'ملفات الارتباط'  : 'Cookies' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs tracking-wider transition-colors duration-200 hover:text-[#D4A28C]"
              style={{ color: '#7A5840', letterSpacing: '0.1em' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-center text-xs" style={{ color: '#5A3322', letterSpacing: '0.08em' }}>
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}