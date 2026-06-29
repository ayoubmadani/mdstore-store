"use client"

import { useStore } from '@/Hook/store-provider';
import ThemeRunner from '@/components/ThemeRunner';
import { useMemo, Suspense, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingCart, Loader2, Package, MapPin, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';
import type { ComponentType } from 'react';
import Link from 'next/link';

// ==================== Types ====================
interface CartProps {
  domain: string;
  store: any;
}

// ==================== Loading Component ====================
function CartLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="w-6 h-6 text-[var(--green)] absolute -bottom-1 -right-1 animate-spin" />
      </div>
      <p className="text-[var(--mid)] font-medium">جاري تحميل السلة...</p>
    </div>
  );
}

// ==================== Main Page Component ====================
export default function CheckoutPage() {
  const params = useParams();
  const { store, theme: currentThemeSlug } = useStore();
  const [btnHover, setBtnHover] = useState(false)

  const cleanDomain = useMemo(() => {
    const rawDomain = params?.domain as string;
    if (!rawDomain) return "";
    return rawDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
  }, [params?.domain]);

  const language = store?.language || "ar";
  const isRTL = language === "ar";

  const bundleUrl = `/api/themes-controller?lang=${language}&slug=${currentThemeSlug}`;

  if (!cleanDomain || !store) {
    return (
      <main className="min-h-screen bg-[var(--navy)]" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container mx-auto px-4 py-10">
          <CartLoading />
        </div>
      </main>
    );
  }

  if (store?.cart === false) {
    return (
      <div dir="rtl" style={{
        minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#F8F8F6'
      }}><div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed #E8E8E8', borderRadius: 24, maxWidth: 440, width: '100%', background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>  {/* أيقونة بحجم وتأثير بصري هادئ */}  <div style={{
        width: 80, height: 80, background: '#F9FAFB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
      }}>
        <ShoppingBag size={40} style={{ color: '#D1D5DB' }} />
      </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>السلة غير مفعلة</h2>
          <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            نعتذر، هذا المتجر لا يدعم نظام سلة المشتريات حالياً. يمكنك الطلب مباشرة عبر تصفح المنتجات.
          </p>

          <Link
            href="/"
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, color: btnHover ? '#111' : '#555', padding: '0.9rem 2.5rem', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s ease', textDecoration: 'none'
            }}
          >
            <span>العودة إلى الرئيسية</span>
            <ArrowLeft size={16} style={{ transform: btnHover ? 'translateX(-4px)' : 'none', transition: 'transform 0.3s' }} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--navy)]" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">

        {/* ==================== MAIN CONTENT ==================== */}
        <Suspense fallback={<div className="py-8"><CartLoading /></div>}>
          <ThemeRunner bundleUrl={bundleUrl} exportName="Cart" themeProps={{ domain: cleanDomain, store }} />
        </Suspense>
      </div>
    </main>
  );
}