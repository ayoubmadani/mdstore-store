'use client';

// ==========================================
// SUCCESSFULLY (With Tracking Integration)
// ==========================================

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  CheckCircle, Package, Phone, 
  Truck, Star, ShoppingBag, ArrowLeft, 
  Sparkles, Clock3 
} from 'lucide-react';
import { usePixel } from '@/Hook/pixel-provider';

export default function SuccessPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { trackPurchase } = usePixel(); // استخراج دالة التتبع
  const [domain, setDomain] = useState('');
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  
  // ✅ مرجع لمنع إرسال الحدث أكثر من مرة عند تحديث الصفحة (Refresh)
  const hasTracked = useRef(false);

  useEffect(() => {
    // 1. جلب الدومين من الـ Params
    params.then(({ domain }) => setDomain(domain));
    
    // 2. تفعيل الأنيميشن الجمالي
    const t = setTimeout(() => setVisible(true), 50);

    // ─── 🚀 تتبع عملية الشراء (Purchase Tracking) ───
    if (!hasTracked.current) {
      const savedOrder = localStorage.getItem('last_order');
      if (savedOrder) {
        try {
          const orderData = JSON.parse(savedOrder);
          
          // إرسال الحدث لفيسبوك وتيك توك عبر الـ Hook الخاص بك
          // نمرر: (القيمة الإجمالية، العملة، معرف الطلب)
          trackPurchase(orderData.total, 'DZD', orderData.id);
          
          console.log("✅ Purchase Event Fired Successfully:", orderData);
          hasTracked.current = true; // علامة لمنع التكرار في نفس الجلسة
        } catch (error) {
          console.error("Tracking Data Error:", error);
        }
      }
    }
    // ──────────────────────────────────────────────

    // 3. محاكي تقدم معالجة الطلب (Progress Bar)
    let frame = 0;
    const interval = setInterval(() => {
      frame += 2;
      setCount(Math.min(frame, 100));
      if (frame >= 100) clearInterval(interval);
    }, 12);

    return () => { 
      clearTimeout(t); 
      clearInterval(interval); 
    };
  }, [params, trackPurchase]);

  const steps = [
    { icon: CheckCircle, title: 'تم استلام طلبك', desc: 'تم تسجيل طلبك بنجاح في نظامنا', done: true },
    { icon: Phone, title: 'تأكيد الطلب', desc: 'سنتصل بك خلال 24 ساعة', done: false, next: true },
    { icon: Package, title: 'تجهيز وتغليف', desc: 'يتم تجهيز منتجك بعناية', done: false },
    { icon: Truck, title: 'الشحن والتوصيل', desc: '2-5 أيام عمل', done: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900" dir="rtl">

      {/* ── Hero Section ── */}
      <div className="relative flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
        
        {/* تأثيرات خلفية بصرية */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-100 rounded-full blur-3xl pointer-events-none opacity-70" />
        
        {/* أيقونة النجاح المتحركة */}
        <div className={`relative z-10 mb-8 transition-all duration-700 ${visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className="absolute rounded-full bg-green-200/60 animate-ping" style={{ width: 120, height: 120, top: -20, left: -20 }} />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-200">
            <CheckCircle className="w-10 h-10 text-white fill-white/20" />
          </div>
        </div>

        {/* النصوص الرئيسية */}
        <div className={`text-center z-10 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em]">طلب ناجح</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-gray-900">تم تأكيد طلبك!</h1>
          <p className="text-gray-500 text-base max-w-sm mx-auto leading-relaxed">
            شكراً لثقتك بنا. طلبك في أيدٍ أمينة وسنتواصل معك قريباً لتأكيد التسليم.
          </p>
        </div>
      </div>

      {/* ── Progress Section ── */}
      <div className={`max-w-2xl mx-auto px-6 mb-12 transition-all duration-700 delay-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-medium">تقدم الطلب</span>
          <span className="text-xs font-black text-green-600">{count}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div className="h-full bg-gradient-to-l from-green-400 to-emerald-500 rounded-full transition-all duration-75" style={{ width: `${count}%` }} />
        </div>
      </div>

      {/* ── Timeline Steps ── */}
      <div className="max-w-2xl mx-auto px-6 mb-12">
        <div className="space-y-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="relative flex items-center gap-5 p-4 rounded-2xl transition-all duration-500 border"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(30px)',
                  transitionDelay: `${0.4 + i * 0.1}s`,
                  backgroundColor: step.done ? 'rgba(16,185,129,0.06)' : 'rgba(0,0,0,0.02)',
                  borderColor: step.done ? 'rgba(16,185,129,0.25)' : 'rgba(0,0,0,0.06)',
                }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                </div>
                {step.done && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">مكتمل ✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className={`max-w-2xl mx-auto px-6 pb-16 space-y-3 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '0.8s' }}>
        <Link
          href={domain ? `/${domain}` : '/'}
          className="flex items-center justify-center gap-3 w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all text-base shadow-lg"
        >
          <ShoppingBag className="w-5 h-5" />
          تصفح المزيد من المنتجات
          <ArrowLeft className="w-4 h-4 opacity-40" />
        </Link>
        <Link
          href={domain ? `/${domain}` : '/'}
          className="flex items-center justify-center gap-2 w-full py-4 bg-white text-gray-500 font-semibold rounded-2xl border border-gray-200 text-sm"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>

    </div>
  );
}