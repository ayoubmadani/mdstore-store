'use client';

// ==========================================
// SUCCESSFULLY
// ==========================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle, Package, Phone,
  Truck, Star, ShoppingBag, ArrowLeft,
  Sparkles, Clock3
} from 'lucide-react';

export default function SuccessPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const [domain, setDomain] = useState('');
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    params.then(({ domain }) => setDomain(domain));
    const t = setTimeout(() => setVisible(true), 50);

    let frame = 0;
    const interval = setInterval(() => {
      frame += 2;
      setCount(Math.min(frame, 100));
      if (frame >= 100) clearInterval(interval);
    }, 12);

    return () => { clearTimeout(t); clearInterval(interval); };
  }, [params]);

  const steps = [
    {
      icon: CheckCircle,
      title: 'تم استلام طلبك',
      desc: 'تم تسجيل طلبك بنجاح في نظامنا',
      done: true,
    },
    {
      icon: Phone,
      title: 'تأكيد الطلب',
      desc: 'سنتصل بك خلال 24 ساعة',
      done: false,
      next: true,
    },
    {
      icon: Package,
      title: 'تجهيز وتغليف',
      desc: 'يتم تجهيز منتجك بعناية',
      done: false,
    },
    {
      icon: Truck,
      title: 'الشحن والتوصيل',
      desc: '2-5 أيام عمل',
      done: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900" dir="rtl">

      {/* ── Hero ── */}
      <div className="relative flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden">

        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-100 rounded-full blur-3xl pointer-events-none opacity-70" />
        <div className="absolute top-10 right-1/4 w-48 h-48 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

        {/* Floating particles */}
        {visible && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce opacity-50"
                style={{
                  left: `${10 + i * 8}%`,
                  top: `${15 + (i % 4) * 18}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${1.5 + (i % 3) * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Check icon */}
        <div
          className={`relative z-10 mb-8 transition-all duration-700
            ${visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
        >
          <div className="absolute rounded-full bg-green-200/60 animate-ping" style={{ width: 120, height: 120, top: -20, left: -20 }} />
          <div className="absolute rounded-full bg-green-100" style={{ width: 100, height: 100, top: -10, left: -10 }} />

          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-200">
            <CheckCircle className="w-10 h-10 text-white fill-white/20" />
          </div>
        </div>

        {/* Title */}
        <div className={`text-center z-10 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em]">طلب ناجح</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-gray-900">
            تم تأكيد طلبك!
          </h1>
          <p className="text-gray-500 text-base max-w-sm mx-auto leading-relaxed">
            شكراً لثقتك بنا. طلبك في أيدٍ أمينة وسنتواصل معك قريباً لتأكيد التسليم
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-1.5 mt-5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5 fill-amber-400 text-amber-400"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1)' : 'scale(0)',
                  transition: `all 0.3s ease ${0.5 + i * 0.08}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div
        className={`max-w-2xl mx-auto px-6 mb-12 transition-all duration-700 delay-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-medium">تقدم الطلب</span>
          <span className="text-xs font-black text-green-600">{count}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div
            className="h-full bg-gradient-to-l from-green-400 to-emerald-500 rounded-full transition-all duration-75 shadow-sm"
            style={{ width: `${count}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">استلمنا طلبك وبدأنا بمعالجته</p>
      </div>

      {/* ── Timeline ── */}
      <div className="max-w-2xl mx-auto px-6 mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Clock3 className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">مراحل طلبك</span>
        </div>

        <div className="space-y-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="relative flex items-center gap-5 p-4 rounded-2xl transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(30px)',
                  transitionDelay: `${0.4 + i * 0.1}s`,
                  backgroundColor: step.done
                    ? 'rgba(16,185,129,0.06)'
                    : 'rgba(0,0,0,0.02)',
                  border: step.done
                    ? '1px solid rgba(16,185,129,0.25)'
                    : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${step.done
                    ? 'bg-green-100 text-green-600 shadow-sm'
                    : 'bg-gray-100 text-gray-400'}`}>
                  <Icon size={18} />
                  {step.done && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                </div>

                {step.done && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 shrink-0">
                    مكتمل ✓
                  </span>
                )}
                {(step as any).next && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shrink-0 animate-pulse">
                    قريباً
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div
        className={`max-w-2xl mx-auto px-6 mb-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '0.7s' }}
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '24h', label: 'وقت التأكيد' },
            { value: '5★', label: 'تقييم الخدمة' },
            { value: '100%', label: 'ضمان الجودة' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xl font-black text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA buttons ── */}
      <div
        className={`max-w-2xl mx-auto px-6 pb-16 space-y-3 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: '0.8s' }}
      >
        <Link
          href={domain ? `/${domain}` : '/'}
          className="flex items-center justify-center gap-3 w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all hover:shadow-xl hover:shadow-gray-900/10 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-base"
        >
          <ShoppingBag className="w-5 h-5" />
          تصفح المزيد من المنتجات
          <ArrowLeft className="w-4 h-4 opacity-40" />
        </Link>

        <Link
          href={domain ? `/${domain}` : '/'}
          className="flex items-center justify-center gap-2 w-full py-4 bg-white text-gray-500 font-semibold rounded-2xl border border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-all text-sm"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>

    </div>
  );
}