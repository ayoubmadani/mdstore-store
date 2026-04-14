"use client"

import { useStore } from '@/Hook/store-provider';
import dynamic from 'next/dynamic';
import { useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingCart, Loader2, Package, MapPin, CreditCard } from 'lucide-react';
import type { ComponentType } from 'react';

// ==================== Types ====================
interface CartProps {
  domain: string;
  store: any;
}

// ==================== Loading Component ====================
function CartLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <ShoppingCart className="w-12 h-12 text-[var(--cyan)] animate-pulse" />
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

  const cleanDomain = useMemo(() => {
    const rawDomain = params?.domain as string;
    if (!rawDomain) return "";
    return rawDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
  }, [params?.domain]);

  const language = store?.language || "ar";
  const isRTL = language === "ar";

  const DynamicCart = useMemo(() => {
    return dynamic<CartProps>(
      async () => {
        try {
          const mod = await import(`@/theme/${language}/${currentThemeSlug}/main`);
          return (mod.Cart || mod.default) as ComponentType<CartProps>;
        } catch (error) {
          const defaultMod = await import(`@/theme/${language}/default/main`);
          return (defaultMod.Cart || defaultMod.default) as ComponentType<CartProps>;
        }
      },
      { loading: () => <CartLoading />, ssr: false }
    );
  }, [currentThemeSlug, language]);

  if (!cleanDomain || !store) {
    return (
      <main className="min-h-screen bg-[var(--navy)]" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container mx-auto px-4 py-10">
          <CartLoading />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--navy)]" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
        
        {/* ==================== HEADER ==================== */}
        <header className="mb-8 md:mb-10 pb-6 border-b border-[var(--line)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[12px] bg-[var(--cyan)] flex items-center justify-center shadow-lg shadow-[var(--cyan)]/20">
              <ShoppingCart className="w-7 h-7 text-[var(--navy)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--white)]">
                {isRTL ? "إتمام الطلب" : "Checkout"}
              </h1>
              <p className="text-[var(--mid)] text-sm md:text-base mt-1">
                {isRTL 
                  ? "أكمل بياناتك لإنهاء عملية الشراء بأمان"
                  : "Complete your details to finalize your purchase securely"
                }
              </p>
            </div>
          </div>
        </header>

        {/* ==================== MAIN CONTENT ==================== */}
        <Suspense fallback={<div className="py-8"><CartLoading /></div>}>
          <DynamicCart domain={cleanDomain} store={store} />
        </Suspense>

        {/* ==================== TRUST BADGES ==================== */}
        <footer className="mt-12 pt-8 border-t border-[var(--line)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: "🔒", title: isRTL ? "دفع آمن" : "Secure Payment", desc: "256-bit SSL" },
              { icon: "🚚", title: isRTL ? "توصيل سريع" : "Fast Delivery", desc: isRTL ? "2-5 أيام عمل" : "2-5 business days" },
              { icon: "🎧", title: isRTL ? "دعم 24/7" : "24/7 Support", desc: isRTL ? "مساعدة فورية" : "Instant help" },
            ].map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{badge.icon}</span>
                <span className="font-bold text-[var(--white)]">{badge.title}</span>
                <span className="text-xs text-[var(--mid)]">{badge.desc}</span>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}