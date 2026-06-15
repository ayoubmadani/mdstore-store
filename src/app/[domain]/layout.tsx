import React from 'react';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getStoreByDomain } from '@/lib/api';
import { StoreProvider } from '@/Hook/store-provider';
import dynamic from 'next/dynamic';
import CustomerTracker from '@/components/CustomerTracker';
import Landing from '@/components/landing';
import AddShow from '@/components/addShow';
import { Metadata } from 'next';
import { headers } from 'next/headers';

// ✅ كاش يعتمد على الـ domain فقط لضمان استقرار الـ Layout
const getStoreCached = cache(async (domain: string) => {
  return getStoreByDomain(domain);
});

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

// ==========================================
// METADATA
// ==========================================
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { domain } = await params;
  const store = await getStoreCached(domain);

  if (!store) return { title: 'Store Not Found' };

  // ✅ حل مشكلة الـ TypeScript: تحويل الـ null إلى undefined أو string
  const description = store.name;
  const favicon = store.design?.faviconUrl || store.design?.logoUrl || '/default-logo.png';

  return {
    title: {
      default: store.isActive ? store.name : `${store.name} (Inactive)`,
      template: `%s | ${store.name}`
    },
    description: description,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: store.name,
      description: description,
      images: [{ url: store.design?.logoUrl || '' }],
    },
  };
}

// ==========================================
// LAYOUT COMPONENT
// ==========================================
export default async function StoreLayout({ children, params }: LayoutProps) {
  const { domain } = await params;

  const store: any = await getStoreCached(domain);

  if (!store) notFound();

  const currentThemeSlug = store?.theme?.slug || 'default';
  const language = store?.language || 'ar';

  const Main = dynamic<any>(
    () =>
      import(`@/theme/${language}/${currentThemeSlug}/main`).catch(() =>
        import(`@/theme/${language}/default/main`)
      ),
    {
      loading: () => <Landing />,
      ssr: true,
    }
  );

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  // ✅ 1. جلب الهيدرز الحالية للطلب لمعرفة الـ Host والـ Protocol
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'https';

  // ✅ 2. جلب الرابط الفعلي المباشر من المتصفح عبر هيدر الـ referer
  const refererUrl = headersList.get('referer') || '';
  
  // كبديل احتياطي في حال عدم وجود referer نستخدم الهيدر الداخلي لـ Next.js
  const invokePath = headersList.get('x-invoke-path') || '';
  const reconstructedUrl = refererUrl || `${protocol}://${host}${invokePath}`;

  // ✅ 3. فحص ما إذا كان الرابط يحتوي على صفحة هبوط
  const isLanding = reconstructedUrl.includes('/lp/');

  console.log("=== DEBUG URL FINAL ===");
  console.log("Referer URL from Browser:", refererUrl);
  console.log("Final Target URL:", reconstructedUrl);
  console.log("Contains /lp/:", isLanding);
  console.log("=======================");

  return (
    <StoreProvider store={store} theme={currentThemeSlug}>
      <AddShow storeId={store.id} />
      <div dir={direction}>
        <CustomerTracker pixels={store.pixels} />
        
        {/* ✅ إذا كان الرابط لصفحة هبوط، نمرر الـ children مباشرة بدون ثيم المتجر المحيط بها */}
        {isLanding ? (
          <main>
            {children}
          </main>
        ) : (
          <Main store={store} domain={domain}>
            {children}
          </Main>
        )}
      </div>
    </StoreProvider>
  );
}