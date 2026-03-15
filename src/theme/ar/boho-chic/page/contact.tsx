'use client';

import React from 'react';

export default function ContactStaticTest() {
  const store = {
    language: 'ar',
    design:   {},
    contact: {
      email:    'support@teststore.com',
      phone:    '+213550123456',
      wilaya:   'الجزائر العاصمة',
      facebook: 'https://facebook.com',
      whatsapp: '213550123456',
      tiktok:   'https://tiktok.com',
    },
  };

  const isRTL = store.language === 'ar';

  const t = {
    title:    isRTL ? 'تواصل معنا'          : 'Get in Touch',
    subtitle: isRTL ? 'يسعدنا سماع أفكارك' : "We'd love to hear from you",
    email:    isRTL ? 'البريد الإلكتروني'   : 'Email',
    phone:    isRTL ? 'الهاتف'              : 'Phone',
    location: isRTL ? 'الموقع'              : 'Location',
    follow:   isRTL ? 'تابعنا على'          : 'Follow Along',
  };

  const contactItems = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: t.email,
      value: store.contact.email,
      href:  `mailto:${store.contact.email}`,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.81 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.02-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      label: t.phone,
      value: store.contact.phone,
      href:  `tel:${store.contact.phone}`,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A9068" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: t.location,
      value: store.contact.wilaya,
      href:  undefined,
    },
  ];

  const socials = [
    {
      name: 'Facebook',
      href: store.contact.facebook,
      color: '#3b5998',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/${store.contact.whatsapp}`,
      color: '#25D366',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
    },
    {
      name: 'TikTok',
      href: store.contact.tiktok,
      color: '#1C1C1C',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.44-4.11-1.24-.03 2.15-.02 4.31-.02 6.46 0 1.19-.21 2.4-.78 3.46-.94 1.83-2.86 2.92-4.88 3.12-1.84.23-3.83-.24-5.26-1.48-1.57-1.32-2.3-3.43-1.95-5.44.25-1.58 1.15-3.05 2.51-3.9 1.14-.73 2.51-.99 3.84-.81v4.11c-.71-.12-1.47.05-2.05.5-.66.52-.96 1.4-.78 2.21.14.73.72 1.34 1.45 1.5.88.2 1.88-.16 2.37-.93.2-.34.28-.73.28-1.12V0l-.02.02z"/></svg>,
    },
  ];

  return (
    <section
      className="min-h-screen py-24"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: '#F7F0E6', fontFamily: "'Karla', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300;1,9..144,400&family=Karla:wght@300;400;500&display=swap');`}</style>

      <div className="max-w-2xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          {/* Decorative top */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-16" style={{ backgroundColor: '#E0CEBC' }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4714A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
              <circle cx="12" cy="12" r="4"/>
              <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
              <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
            </svg>
            <div className="h-px w-16" style={{ backgroundColor: '#E0CEBC' }} />
          </div>

          <h1
            style={{
              fontFamily:    "'Fraunces', serif",
              fontStyle:     'italic',
              fontWeight:    300,
              fontSize:      'clamp(2rem, 5vw, 3.2rem)',
              color:         '#3D2314',
              letterSpacing: '-0.02em',
            }}
          >
            {t.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#9E8060' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Contact cards */}
        <div className="space-y-4 mb-14">
          {contactItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-5 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                backgroundColor: '#FDF8F2',
                borderRadius:    '16px',
                border:          '1px solid #EDE0CE',
              }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#F7F0E6', borderRadius: '50%' }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs tracking-widest uppercase mb-0.5 font-medium" style={{ color: '#B89A7A', letterSpacing: '0.12em' }}>
                  {item.label}
                </p>
                {item.href ? (
                  <a href={item.href} className="text-sm font-medium hover:text-[#C4714A] transition-colors" style={{ color: '#3D2314' }}>
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium" style={{ color: '#3D2314' }}>{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px" style={{ backgroundColor: '#E8D9C5' }} />
          <p className="text-xs tracking-widest uppercase" style={{ color: '#C4714A', letterSpacing: '0.2em' }}>
            ✦ {t.follow} ✦
          </p>
          <div className="flex-1 h-px" style={{ backgroundColor: '#E8D9C5' }} />
        </div>

        {/* Socials */}
        <div className="grid grid-cols-3 gap-4">
          {socials.map(s => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-3 py-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{
                backgroundColor: '#FDF8F2',
                borderRadius:    '16px',
                border:          '1px solid #EDE0CE',
                color:           '#8E7860',
              }}
            >
              <span>{s.icon}</span>
              <span className="text-xs font-medium tracking-wider" style={{ letterSpacing: '0.08em' }}>{s.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}