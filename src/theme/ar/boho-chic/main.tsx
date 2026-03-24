"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Ban, Bell, Building2, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CookieIcon, CreditCard, Database, Eye, FileText, Globe, Heart, Home as HomeIcon, Infinity, Link2, Lock, MapPin, MousePointer2, Package, Phone, Scale, Settings, Share2, Shield, ShieldCheck, ShoppingCart, Tag, ToggleRight, Truck, User, X } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import DOMPurify from 'isomorphic-dompurify';
import { useRouter } from 'next/navigation';


export default function Main({ store, children }: any) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#F7F0E6', fontFamily: "'Karla', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400;1,9..144,600&family=Karla:wght@300;400;500;600&display=swap');

        * { -webkit-font-smoothing: antialiased; }

        body::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #EDE4D4; }
        ::-webkit-scrollbar-thumb { background: #C4714A; border-radius: 10px; }

        @keyframes sway { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        @keyframes drift { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes boho-in { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        .boho-in { animation: boho-in 0.7s ease forwards; }
        .boho-in-1 { animation: boho-in 0.7s 0.1s ease both; }
        .boho-in-2 { animation: boho-in 0.7s 0.2s ease both; }
        .boho-in-3 { animation: boho-in 0.7s 0.35s ease both; }

        .leaf-sway { animation: sway 4s ease-in-out infinite; transform-origin: bottom center; }
        .feather-drift { animation: drift 5s ease-in-out infinite; }

        .boho-card:hover { transform: translateY(-4px); }
        .boho-card { transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease; }
        .boho-card:hover { box-shadow: 0 20px 50px rgba(61,35,20,0.12); }

        .wavy-divider { line-height: 0; overflow: hidden; }
      `}</style>

      {store.topBar?.enabled && store.topBar?.text && (
        <div
          className="py-2.5 px-4 text-center text-xs font-medium tracking-widest"
          style={{
            backgroundColor: '#3D2314',
            color: '#F7F0E6',
            fontFamily: "'Karla', sans-serif",
            letterSpacing: '0.12em',
          }}
        >
          ✦ {store.topBar.text} ✦
        </div>
      )}

      <Navbar store={store} />
      <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}

// pages
export function StaticPage({ page }: any) {
  const p = page.toLowerCase();
  return (
    <>
      {p === 'privacy' && <Privacy />}
      {p === 'terms'   && <Terms />}
      {/* FIX #2 — typo 'cookise' corrigé en 'cookies' */}
      {p === 'cookies' && <Cookies />}
      {p === 'contact' && <ContactStaticTest />}
    </>
  );
}

function PageWrapper({
  children, icon, title, subtitle, tag,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag: string;
}) {
  return (
    <div
      className="min-h-screen py-24"
      dir="rtl"
      style={{ backgroundColor: '#F7F0E6', fontFamily: "'Karla', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300;1,9..144,400&family=Karla:wght@300;400;500&display=swap');`}</style>

      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="mb-14">
          <p className="text-xs tracking-widest mb-6 uppercase" style={{ color: '#C4714A', letterSpacing: '0.18em' }}>
            ✦ {tag}
          </p>

          <div className="flex items-start gap-5 mb-5">
            <div
              className="w-14 h-14 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#F0E4D4', borderRadius: '50%', color: '#C4714A' }}
            >
              {icon}
            </div>
            <div>
              <h1
                style={{
                  fontFamily:    "'Fraunces', serif",
                  fontStyle:     'italic',
                  fontWeight:    300,
                  fontSize:      'clamp(1.8rem, 4vw, 2.8rem)',
                  color:         '#3D2314',
                  letterSpacing: '-0.02em',
                  lineHeight:    1.2,
                }}
              >
                {title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: '#9E8060' }}>
                {subtitle}
              </p>
            </div>
          </div>

          <svg viewBox="0 0 600 20" preserveAspectRatio="none" style={{ width: '100%', height: '20px', display: 'block', marginTop: '1.5rem' }}>
            <path d="M0,10 C150,0 300,20 450,10 C525,5 570,12 600,10" stroke="#E0CEBC" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>

        {children}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, status }: {
  icon: React.ReactNode; title: string; desc: string; status?: string;
}) {
  const isActive = status === 'دائماً نشطة';

  return (
    <div
      className="flex gap-5 p-6 mb-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        backgroundColor: '#FDF8F2',
        borderRadius:    '20px',
        border:          '1px solid #EDE0CE',
      }}
    >
      <div
        className="w-1 self-stretch flex-shrink-0 rounded-full"
        style={{ backgroundColor: isActive ? '#7A9068' : '#D4A28C' }}
      />

      <div
        className="w-11 h-11 flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: '#F0E4D4', borderRadius: '50%', color: '#C4714A' }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle:  'italic',
              fontWeight: 400,
              fontSize:   '1.05rem',
              color:      '#3D2314',
            }}
          >
            {title}
          </h3>
          {status && (
            <span
              className="text-[10px] font-semibold tracking-widest px-3 py-1"
              style={{
                backgroundColor: isActive ? 'rgba(122,144,104,0.12)' : 'rgba(196,113,74,0.1)',
                color:           isActive ? '#7A9068' : '#C4714A',
                borderRadius:    '20px',
                letterSpacing:   '0.1em',
              }}
            >
              {status}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#9E8060' }}>{desc}</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <PageWrapper icon={<ShieldCheck size={22}/>} title="سياسة الخصوصية" subtitle="في MdStore، نضع خصوصية بياناتك وأمان متجرك على رأس أولوياتنا." tag="Privacy">
      <InfoCard icon={<Database size={18}/>}  title="البيانات التي نجمعها"   desc="نجمع فقط البيانات الضرورية لتشغيل متجرك، مثل الاسم والبريد الإلكتروني ومعلومات الدفع لضمان تجربة بيع سلسة." />
      <InfoCard icon={<Eye size={18}/>}       title="كيفية استخدام البيانات" desc="تُستخدم بياناتك لتحسين خدماتنا ومعالجة الطلبات وتوفير تقارير ذكية تساعدك في اتخاذ قرارات تجارية أفضل." />
      <InfoCard icon={<Lock size={18}/>}      title="حماية المعلومات"         desc="نستخدم تقنيات تشفير متطورة ومعايير أمان عالمية لحماية بياناتك من أي وصول غير مصرح به." />
      <InfoCard icon={<Globe size={18}/>}     title="مشاركة البيانات"          desc="نحن لا نبيع بياناتك أبداً. نشاركها فقط مع مزودي الخدمات الموثوقين لإتمام عملياتك التجارية." />

      <div
        className="mt-8 p-5 flex items-center justify-between"
        style={{ backgroundColor: '#FDF8F2', borderRadius: '16px', border: '1px solid #EDE0CE' }}
      >
        <div className="flex items-center gap-3">
          <Bell size={15} style={{ color: '#C4714A' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#9E8060' }}>
            نقوم بتحديث هذه السياسة دورياً لضمان مواكبة أحدث معايير الأمان.
          </p>
        </div>
        <span className="text-xs flex-shrink-0 mr-4 font-medium" style={{ color: '#C4714A' }}>
          06/02/2026
        </span>
      </div>
    </PageWrapper>
  );
}

export function Terms() {
  return (
    <PageWrapper icon={<FileText size={22}/>} title="شروط الاستخدام" subtitle="باستخدامك لمنصة MdStore، فإنك توافق على الالتزام بالشروط والقواعد التالية." tag="Terms">
      <InfoCard icon={<CheckCircle2 size={18}/>} title="مسؤولية الحساب"     desc="أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تحدث تحته. يجب أن تكون المعلومات المقدمة دقيقة ومحدثة." />
      <InfoCard icon={<CreditCard size={18}/>}   title="الرسوم والاشتراكات" desc="تخضع خدماتنا لرسوم اشتراك دورية. جميع الرسوم واضحة ولا توجد تكاليف مخفية، ويتم تحصيلها وفقاً للخطة التي تختارها." />
      <InfoCard icon={<Ban size={18}/>}           title="المحتوى المحظور"    desc="يُمنع استخدام المنصة لبيع سلع غير قانونية أو انتهاك حقوق الملكية الفكرية. نحتفظ بالحق في إغلاق أي متجر يخالف هذه القوانين." />
      <InfoCard icon={<Scale size={18}/>}         title="القانون المعمول به" desc="تخضع هذه الشروط وتفسر وفقاً للقوانين المحلية المعمول بها في الجزائر، وأي نزاع ينشأ يخضع للاختصاص القضائي." />

      <div
        className="mt-8 p-5 flex items-start gap-3"
        style={{ backgroundColor: 'rgba(212,162,140,0.12)', borderRadius: '16px', border: '1px solid rgba(212,162,140,0.3)' }}
      >
        <AlertCircle size={16} style={{ color: '#C4714A', flexShrink: 0, marginTop: '2px' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#9E8060' }}>
          نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرار استخدامك للمنصة بعد التعديلات يعد موافقة منك على الشروط الجديدة.
        </p>
      </div>
    </PageWrapper>
  );
}

export function Cookies() {
  return (
    <PageWrapper icon={<CookieIcon size={22}/>} title="سياسة ملفات تعريف الارتباط" subtitle="نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتخصيص المحتوى وتحليل حركة المرور على منصتنا." tag="Cookies">
      <InfoCard icon={<ShieldCheck size={18}/>}   title="ملفات ضرورية"      desc="هذه الملفات مطلوبة لتشغيل الوظائف الأساسية للموقع مثل تسجيل الدخول وتأمين سلة التسوق. لا يمكن إيقافها." status="دائماً نشطة" />
      <InfoCard icon={<Settings size={18}/>}      title="ملفات التفضيلات"   desc="تسمح للموقع بتذكر خياراتك مثل اللغة التي تستخدمها حالياً ومنطقتك الزمنية." status="اختياري" />
      <InfoCard icon={<MousePointer2 size={18}/>} title="ملفات التحليل"     desc="تساعدنا على فهم كيفية تفاعل التجار مع MdStore مما يسمح لنا بتطوير أدوات بيع أكثر كفاءة." status="اختياري" />

      <div
        className="mt-8 p-7 relative overflow-hidden"
        style={{ backgroundColor: '#3D2314', borderRadius: '20px' }}
      >
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ backgroundColor: 'rgba(196,113,74,0.15)' }}
        />
        <div className="relative flex gap-4 items-start">
          <ToggleRight size={20} style={{ color: '#D4A28C', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3
              className="mb-2"
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle:  'italic',
                fontSize:   '1.1rem',
                color:      '#F7F0E6',
                fontWeight: 400,
              }}
            >
              كيف تتحكم في خياراتك؟
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(247,240,230,0.6)' }}>
              يمكنك إدارة أو مسح ملفات تعريف الارتباط من خلال إعدادات متصفحك في أي وقت. يرجى العلم أن تعطيل بعضها قد يؤثر على تجربة استخدام المنصة.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export function ContactStaticTest() {
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
        <div className="text-center mb-16">
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

        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px" style={{ backgroundColor: '#E8D9C5' }} />
          <p className="text-xs tracking-widest uppercase" style={{ color: '#C4714A', letterSpacing: '0.2em' }}>
            ✦ {t.follow} ✦
          </p>
          <div className="flex-1 h-px" style={{ backgroundColor: '#E8D9C5' }} />
        </div>

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

        <div className="absolute top-12 right-12 pointer-events-none hidden lg:block">
          <FeatherSvg style={{ transform: 'rotate(10deg)' }} />
        </div>
        <div className="absolute bottom-16 left-8 pointer-events-none hidden lg:block">
          <FeatherSvg style={{ transform: 'rotate(-15deg) scaleX(-1)' }} />
        </div>
        <div className="absolute top-8 left-1/2 pointer-events-none">
          <MoonSvg />
        </div>

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

      <div className="wavy-divider w-full" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 50" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '50px' }}>
          <path d="M0,40 C480,0 960,50 1440,10 L1440,50 L0,50 Z" fill="#F7F0E6"/>
        </svg>
      </div>
    </div>
  );
};

export function Details({
  product, toggleWishlist, isWishlisted, handleShare, discount,
  allImages, allAttrs, finalPrice, inStock, autoGen,
  selectedVariants, setSelectedOffer, selectedOffer,
  handleVariantSelection, domain,
}: any) {
  // FIX #3 — suppression du state mort submitSuccess (jamais déclenché, redirection gérée par ProductForm)
  const [showShareToast, setShowShareToast] = useState(false);
  const [selectedImage, setSelectedImage]   = useState(0);

  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{ backgroundColor: '#F7F0E6', fontFamily: "'Karla', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Karla:wght@300;400;500;600&display=swap');`}</style>

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

              {discount > 0 && (
                <div
                  className="absolute top-4 right-4 text-[11px] font-semibold px-3 py-1.5"
                  style={{ backgroundColor: '#C4714A', color: '#FDF8F2', borderRadius: '20px' }}
                >
                  -{discount}%
                </div>
              )}

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
                وصف المنتج
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

export function Card({ product, displayImage, discount, isRTL, store, viewDetails }: any) {
  const brandColor = '#C4714A'; // اللون الموحد (الترابي الدافئ)
  const textColor = '#3D2314';  // لون النص الأساسي

  return (
    <div
      className="boho-card group flex flex-col overflow-hidden h-full"
      style={{
        backgroundColor: '#FDF8F2',
        borderRadius:    '24px',
        border:          '1px solid #EDE0CE',
        fontFamily:      "'Karla', sans-serif",
        transition:      'all 0.4s ease',
      }}
    >
      {/* منطقة الصورة */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '1/1', backgroundColor: '#EDE0CE', borderRadius: '24px 24px 0 0' }}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke={brandColor} strokeWidth="1" strokeDasharray="4 3" opacity="0.3"/>
              <path d="M16 24L24 16L32 24" stroke={brandColor} strokeWidth="1.5" opacity="0.5"/>
            </svg>
            <span className="text-[10px] tracking-widest uppercase" style={{ color: '#B89A7A' }}>
              {isRTL ? 'لا توجد صورة' : 'No Image'}
            </span>
          </div>
        )}

        {/* ملصق الخصم بتصميم Boho */}
        {discount > 0 && (
          <div
            className="absolute top-4 right-4 text-[10px] font-bold px-3 py-1.5 z-10"
            style={{
              backgroundColor: brandColor,
              color:           '#FDF8F2',
              borderRadius:    '12px',
              boxShadow:       '0 4px 12px rgba(196,113,74,0.2)',
            }}
          >
            -{discount}%
          </div>
        )}
      </div>

      {/* محتوى البطاقة */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className="mb-2 line-clamp-2 transition-colors duration-300"
          style={{
            fontFamily:    "'Fraunces', serif",
            fontStyle:     'italic',
            fontSize:      '1.1rem',
            fontWeight:    400,
            color:         textColor,
            lineHeight:    '1.3',
          }}
        >
          {product.name}
        </h3>

        {product.desc && (
          <div
            className="text-xs mb-4 line-clamp-2 opacity-70 leading-relaxed"
            style={{ color: textColor }}
            dangerouslySetInnerHTML={{ __html: product.desc }}
          />
        )}

        {/* الفاصل الزخرفي */}
        <div className="mb-4 flex items-center gap-3 opacity-30">
          <div className="flex-1 h-[1px]" style={{ backgroundColor: brandColor }} />
          <span style={{ color: brandColor, fontSize: '10px' }}>✦</span>
          <div className="flex-1 h-[1px]" style={{ backgroundColor: brandColor }} />
        </div>

        {/* السعر والزر في الأسفل */}
        <div className="mt-auto space-y-4">
          <div className="flex items-baseline justify-center gap-2">
            <span
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize:   '1.5rem',
                fontWeight: 500,
                color:      brandColor,
              }}
            >
              {product.price}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#B89A7A' }}>
              {store.currency}
            </span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="text-xs line-through opacity-40" style={{ color: textColor }}>
                {product.priceOriginal}
              </span>
            )}
          </div>

          {/* الزر الأساسي الموحد والظاهر دوماً */}
          <Link
            href={`/${store.subdomain}/product/${product.slug || product.id}`}
            className="flex items-center justify-center w-full py-3.5 text-[11px] tracking-[0.15em] font-bold uppercase transition-all duration-300 group-hover:shadow-lg"
            style={{
              backgroundColor: brandColor,
              color:           '#FDF8F2',
              borderRadius:    '15px',
              border:          `1px solid ${brandColor}`,
            }}
          >
            {viewDetails}
          </Link>
        </div>
      </div>
    </div>
  );
}
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

export function Footer({ store }: any) {
  const isRTL = store.language === 'ar';

  return (
    <footer
      style={{ backgroundColor: '#3D2314', fontFamily: "'Karla', sans-serif", position: 'relative', overflow: 'hidden' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="wavy-divider w-full" style={{ marginTop: '-1px' }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
          <path d="M0,60 C240,20 480,60 720,30 C960,0 1200,50 1440,20 L1440,60 Z" fill="#F7F0E6" />
        </svg>
      </div>

      <div className="absolute top-8 left-6 pointer-events-none select-none hidden lg:block">
        <BotanicalLeft />
      </div>
      <div className="absolute top-8 right-6 pointer-events-none select-none hidden lg:block" style={{ transform: 'scaleX(-1)' }}>
        <BotanicalLeft />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 pb-12 pt-6 relative z-10">
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

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {[
            { href: `/${store.subdomain}/Privacy`, label: isRTL ? 'سياسة الخصوصية' : 'Privacy' },
            { href: `/${store.subdomain}/Terms`,   label: isRTL ? 'الشروط'           : 'Terms'   },
            { href: `/${store.subdomain}/Cookies`, label: isRTL ? 'ملفات الارتباط'  : 'Cookies' },
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

        <p className="text-center text-xs" style={{ color: '#5A3322', letterSpacing: '0.08em' }}>
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

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

export function Navbar({ store }: any) {
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
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #C4714A, #D4A28C, #7A9068, #D4A28C, #C4714A)' }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center h-16">
            <Link href={`/${store.subdomain}`} className="flex items-center gap-2.5 group">
              <div className="feather-drift opacity-80 group-hover:opacity-100 transition-opacity">
                <SunIcon />
              </div>
              {store.design.logoUrl ? (
                <img src={store.design.logoUrl} alt={store.name} className="h-8 w-auto object-contain" />
              ) : (
                <span
                  className="group-hover:text-[#C4714A] transition-colors duration-300"
                  style={{
                    fontFamily:    "'Fraunces', serif",
                    fontStyle:     'italic',
                    fontWeight:    400,
                    fontSize:      '1.35rem',
                    color:         '#3D2314',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {store.name}
                </span>
              )}
            </Link>

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
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C4714A', opacity: 0.5 }} />
            </div>

            <button
              onClick={() => setIsMenuOpen(p => !p)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
            >
              <span className="block h-px transition-all duration-300" style={{ width: '22px', backgroundColor: '#3D2314', transform: isMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
              <span className="block h-px transition-all duration-300" style={{ width: '14px', backgroundColor: '#3D2314', opacity: isMenuOpen ? 0 : 1 }} />
              <span className="block h-px transition-all duration-300" style={{ width: '22px', backgroundColor: '#3D2314', transform: isMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
            </button>
          </div>

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

interface Offer        { id: string; name: string; quantity: number; price: number; }
interface Variant      { id: string; name: string; value: string; }
interface Attribute    { id: string; type: string; name: string; displayMode?: 'color' | 'image' | null; variants: Variant[]; }
interface ProductImage { id: string; imageUrl: string; }
interface VariantAttributeEntry { attrId: string; attrName: string; displayMode: 'color' | 'image' | 'text'; value: string; }
interface VariantDetail { id: string | number; name: VariantAttributeEntry[]; price: number; stock: number; autoGenerate: boolean; }

export interface Product {
  id: string; name: string; price: string | number; priceOriginal?: string | number; desc?: string;
  productImage?: string; imagesProduct?: ProductImage[];
  offers?: Offer[]; attributes?: Attribute[]; variantDetails?: VariantDetail[];
  stock?: number; isActive?: boolean;
  store: { id: string; name: string; subdomain: string; userId: string; };
}
interface Wilaya  { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number; }
interface Commune { id: string; name: string; ar_name: string; wilayaId: string; }
export interface ProductFormProps {
  product: Product; userId: string; domain: string; redirectPath?: string;
  selectedOffer: string | null; setSelectedOffer: (id: string | null) => void;
  selectedVariants: Record<string, string>; platform?: string; priceLoss?: number;
}
function variantMatches(detail: VariantDetail, sel: Record<string, string>): boolean {
  return Object.entries(sel).every(([attrName, val]) =>
    detail.name.some(e => e.attrName === attrName && e.value === val)
  );
}
const fetchWilayas  = async (userId: string): Promise<Wilaya[]>  => { try { const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`); return data || []; } catch { return []; } };
const fetchCommunes = async (wilayaId: string): Promise<Commune[]> => { try { const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`); return data || []; } catch { return []; } };

const FieldWrapper = ({ error, children, label }: { error?: string; children: React.ReactNode; label?: string }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#B89A7A', letterSpacing: '0.1em' }}>
        {label}
      </label>
    )}
    {children}
    {error && (
      <p className="text-xs flex items-center gap-1" style={{ color: '#C4714A' }}>
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const inputCls = (err?: boolean) =>
  `w-full px-4 py-3 text-sm outline-none transition-all font-light`
  + ` placeholder-[#C8B09A]`
  + ` border rounded-xl`
  + ` ${err
    ? 'border-[#C4714A] bg-[rgba(196,113,74,0.04)] focus:ring-2 focus:ring-[rgba(196,113,74,0.15)]'
    : 'border-[#E0CEBC] bg-[#FDF8F2] focus:border-[#C4714A] focus:ring-2 focus:ring-[rgba(196,113,74,0.12)]'
  }`;

export function ProductForm({
  product, userId, domain, selectedOffer, setSelectedOffer, selectedVariants, platform, priceLoss = 0,
}: ProductFormProps) {
  const router = useRouter();

  const [wilayas,         setWilayas]         = useState<Wilaya[]>([]);
  const [communes,        setCommunes]        = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [formData,        setFormData]        = useState({
    customerId: '', customerName: '', customerPhone: '', customerWelaya: '',
    customerCommune: '', quantity: 1, priceLoss: 0, typeLivraison: 'home' as 'home' | 'office',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (userId) fetchWilayas(userId).then(setWilayas); }, [userId]);

  // FIX #5 — SSR guard pour localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('customerId');
      if (id) setFormData(p => ({ ...p, customerId: id }));
    }
  }, []);

  useEffect(() => {
    if (!formData.customerWelaya) { setCommunes([]); return; }
    setLoadingCommunes(true);
    fetchCommunes(formData.customerWelaya).then(data => { setCommunes(data); setLoadingCommunes(false); });
  }, [formData.customerWelaya]);

  const selectedWilayaData = useMemo(() =>
    wilayas.find(w => String(w.id) === String(formData.customerWelaya)),
    [wilayas, formData.customerWelaya]
  );

  const getFinalPrice = useCallback((): number => {
    const base = typeof product.price === 'string' ? parseFloat(product.price) : product.price as number;
    const offer = product.offers?.find(o => o.id === selectedOffer);
    if (offer) return offer.price;
    if (product.variantDetails?.length && Object.keys(selectedVariants).length > 0) {
      const match = product.variantDetails.find(v => variantMatches(v, selectedVariants));
      if (match && match.price !== -1) return match.price;
    }
    return base;
  }, [product, selectedOffer, selectedVariants]);

  const getPriceLivraison = useCallback((): number => {
    if (!selectedWilayaData) return 0;
    return formData.typeLivraison === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice;
  }, [selectedWilayaData, formData.typeLivraison]);

  useEffect(() => {
    if (selectedWilayaData) setFormData(f => ({ ...f, priceLoss: selectedWilayaData.livraisonReturn }));
  }, [selectedWilayaData, formData.typeLivraison]);

  const finalPrice    = getFinalPrice();
  const getTotalPrice = () => finalPrice * formData.quantity + +getPriceLivraison();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.customerName.trim())  e.customerName    = 'الاسم مطلوب';
    if (!formData.customerPhone.trim()) e.customerPhone   = 'رقم الهاتف مطلوب';
    if (!formData.customerWelaya)       e.customerWelaya  = 'الولاية مطلوبة';
    if (!formData.customerCommune)      e.customerCommune = 'البلدية مطلوبة';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/orders`, { ...formData, customerWilayaId: +formData.customerWelaya,customerCommuneId: +formData.customerCommune, productId: product.id, storeId: product.store.id, userId, selectedOffer, selectedVariants, platform: platform || 'store', finalPrice, totalPrice: getTotalPrice(), priceShip : getPriceLivraison(), });
      if (typeof window !== 'undefined') {
        localStorage.setItem('customerId', formData.customerId || '');
      }
      router.push(`/lp/${domain}/successfully`);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  return (
    <div style={{ borderTop: '1px solid #E8D9C5', paddingTop: '1.75rem', fontFamily: "'Karla', sans-serif" }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: '#B89A7A', letterSpacing: '0.15em' }}>
        ✦ تأكيد الطلب
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerName} label="الاسم الكامل">
            <div className="relative">
              <User className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
              <input type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="أدخل اسمك" className={`${inputCls(!!formErrors.customerName)} pr-10`} style={{ color: '#3D2314' }} />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerPhone} label="رقم الهاتف">
            <div className="relative">
              <Phone className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
              <input type="tel" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="0X XX XX XX XX" className={`${inputCls(!!formErrors.customerPhone)} pr-10`} style={{ color: '#3D2314' }} />
            </div>
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper error={formErrors.customerWelaya} label="الولاية">
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
              <select value={formData.customerWelaya} onChange={e => setFormData({ ...formData, customerWelaya: e.target.value, customerCommune: '' })}
                className={`${inputCls(!!formErrors.customerWelaya)} pr-10 appearance-none cursor-pointer`} style={{ color: '#3D2314', backgroundColor: '#FDF8F2' }}>
                <option value="">اختر الولاية</option>
                {wilayas.map(w => <option key={w.id} value={w.id}>{w.id} - {w.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: '#C8B09A' }} />
            </div>
          </FieldWrapper>

          <FieldWrapper error={formErrors.customerCommune} label="البلدية">
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 w-3.5 h-3.5" style={{ color: '#C8B09A' }} />
              <select value={formData.customerCommune} disabled={!formData.customerWelaya || loadingCommunes}
                onChange={e => setFormData({ ...formData, customerCommune: e.target.value })}
                className={`${inputCls(!!formErrors.customerCommune)} pr-10 appearance-none cursor-pointer disabled:opacity-40`} style={{ color: '#3D2314', backgroundColor: '#FDF8F2' }}>
                <option value="">{loadingCommunes ? 'جاري التحميل...' : formData.customerWelaya ? 'اختر البلدية' : 'اختر الولاية أولاً'}</option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.ar_name}</option>)}
              </select>
              <ChevronDown className="absolute left-3.5 top-3.5 w-3.5 h-3.5 pointer-events-none" style={{ color: '#C8B09A' }} />
            </div>
          </FieldWrapper>
        </div>

        {/* Delivery type */}
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: '#B89A7A', letterSpacing: '0.1em' }}>نوع التوصيل</p>
          <div className="grid grid-cols-2 gap-3">
            {(['home', 'office'] as const).map(type => (
              <button
                key={type} type="button"
                onClick={() => setFormData(p => ({ ...p, typeLivraison: type }))}
                className="flex flex-col items-center gap-2 py-5 transition-all duration-300"
                style={{
                  backgroundColor: formData.typeLivraison === type ? '#FDF8F2' : '#F7F0E6',
                  borderRadius:    '16px',
                  border:          `1.5px solid ${formData.typeLivraison === type ? '#C4714A' : '#E0CEBC'}`,
                  boxShadow:       formData.typeLivraison === type ? '0 4px 16px rgba(196,113,74,0.15)' : 'none',
                }}
              >
                {/* FIX #1 — HomeIcon utilisé à la place de Home (conflit avec le composant Home) */}
                {type === 'home'
                  ? <HomeIcon className="w-5 h-5" style={{ color: formData.typeLivraison === type ? '#C4714A' : '#C8B09A' }} />
                  : <Building2 className="w-5 h-5" style={{ color: formData.typeLivraison === type ? '#C4714A' : '#C8B09A' }} />
                }
                <p className="text-xs font-medium" style={{ color: formData.typeLivraison === type ? '#3D2314' : '#9E8060' }}>
                  {type === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}
                </p>
                {selectedWilayaData && (
                  <p className="text-xs font-semibold" style={{ color: formData.typeLivraison === type ? '#C4714A' : '#B89A7A' }}>
                    {(type === 'home' ? selectedWilayaData.livraisonHome : selectedWilayaData.livraisonOfice).toLocaleString('ar-DZ')} دج
                  </p>
                )}
              </button>
            ))}
          </div>
          {!selectedWilayaData && (
            <p className="text-xs text-center mt-2" style={{ color: '#C8B09A' }}>اختر الولاية لعرض تكلفة التوصيل</p>
          )}
        </div>

        <FieldWrapper error={formErrors.quantity} label="الكمية">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
              className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-light transition-all hover:scale-110"
              style={{ border: '1px solid #E0CEBC', backgroundColor: '#FDF8F2', color: '#8E7860' }}>
              −
            </button>
            <span className="w-14 text-center text-2xl" style={{ fontFamily: "'Fraunces', serif", color: '#3D2314', fontWeight: 400 }}>
              {formData.quantity}
            </span>
            <button type="button" onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
              className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-light transition-all hover:scale-110"
              style={{ border: '1px solid #E0CEBC', backgroundColor: '#FDF8F2', color: '#8E7860' }}>
              +
            </button>
            <span className="text-sm" style={{ color: '#C8B09A' }}>قطعة</span>
          </div>
        </FieldWrapper>

        <div className="p-5 space-y-3" style={{ backgroundColor: '#F0E6D8', borderRadius: '16px' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5" style={{ color: '#9E8060' }}>
              <Package className="w-3.5 h-3.5" /> المنتج
            </span>
            <span className="font-medium truncate max-w-[50%]" style={{ color: '#3D2314' }}>{product.name}</span>
          </div>

          {selectedOffer && (() => {
            const offer = product.offers?.find(o => o.id === selectedOffer);
            if (!offer) return null;
            return (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5" style={{ color: '#9E8060' }}><Tag className="w-3.5 h-3.5" /> العرض</span>
                <span className="font-medium px-2.5 py-0.5" style={{ color: '#C4714A', backgroundColor: 'rgba(196,113,74,0.1)', borderRadius: '20px' }}>{offer.name}</span>
              </div>
            );
          })()}

          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5" style={{ color: '#9E8060' }}><Truck className="w-3.5 h-3.5" /> التوصيل</span>
            <span style={{ color: '#3D2314' }}>
              {formData.typeLivraison === 'home' ? 'المنزل' : 'المكتب'}
              {selectedWilayaData && <span style={{ color: '#9E8060' }}> ({getPriceLivraison().toLocaleString('ar-DZ')} دج)</span>}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span style={{ color: '#9E8060' }}>سعر القطعة</span>
            <span style={{ color: '#3D2314' }}>{finalPrice.toLocaleString('ar-DZ')} دج</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: '#9E8060' }}>الكمية</span>
            <span style={{ color: '#3D2314' }}>× {formData.quantity}</span>
          </div>

          <div className="flex justify-between items-baseline pt-3" style={{ borderTop: '1px dashed #D4A28C' }}>
            <span className="text-sm font-semibold" style={{ color: '#3D2314' }}>الإجمالي</span>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', color: '#C4714A', fontWeight: 400 }}>
              {getTotalPrice().toLocaleString('ar-DZ')}
              <span className="text-sm mr-1" style={{ color: '#B89A7A' }}>دج</span>
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 flex items-center justify-center gap-3 text-sm font-semibold tracking-wide transition-all duration-300"
          style={{
            backgroundColor: submitting ? '#D4A28C' : '#C4714A',
            color:           '#FDF8F2',
            borderRadius:    '30px',
            letterSpacing:   '0.06em',
            boxShadow:       submitting ? 'none' : '0 6px 20px rgba(196,113,74,0.3)',
            cursor:          submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />جاري إرسال الطلب...</>
          ) : (
            <><ShoppingCart className="w-4 h-4" />تأكيد الطلب ✦</>
          )}
        </button>

        <p className="text-xs text-center flex items-center justify-center gap-1.5" style={{ color: '#C8B09A' }}>
          <Shield className="w-3.5 h-3.5" style={{ color: '#7A9068' }} />
          بياناتك آمنة ومحمية بالكامل
        </p>
      </form>
    </div>
  );
}