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

const getStoreCached = cache(async (domain: string) => {
  return getStoreByDomain(domain);
});

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { domain } = await params;
  const store = await getStoreCached(domain);
  if (!store) return { title: 'Store Not Found' };

  const description = store.name;
  const favicon = store.design?.faviconUrl || store.design?.logoUrl || '/default-logo.png';

  return {
    title: {
      default: store.isActive ? store.name : `${store.name} (Inactive)`,
      template: `%s | ${store.name}`
    },
    description: description,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: { title: store.name, description: description, images: [{ url: store.design?.logoUrl || '' }] },
  };
}

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

  // ✅ جلب الهيدرز بطريقة آمنة وموحدة للسيرفر والـ Production
  const headersList = await headers();
  
  // في السيرفر أونلاين (Production)، أفضل هيدر لمعرفة المسار الحقيقي الداخلي للطلب هو x-matched-path أو x-invoke-path
  const matchedPath = headersList.get('x-matched-path') || '';
  const invokePath = headersList.get('x-invoke-path') || '';
  const referer = headersList.get('referer') || '';

  // ✅ فحص دقيق وموحد: لو أي هيدر داخلي يحتوي على مسار الـ Landing Page
  const isLanding = 
    matchedPath.includes('/lp/') || 
    invokePath.includes('/lp/') || 
    referer.includes('/lp/');

  return (
    <StoreProvider store={store} theme={currentThemeSlug}>
      <AddShow storeId={store.id} />
      <div dir={direction}>
        <CustomerTracker pixels={store.pixels} />
        
        {/* ✅ الفحص أصبح مستقراً الآن وموحد بين السيرفر والعميل */}
        {isLanding ? (
          <main key="landing-layout-root">
            {children}
          </main>
        ) : (
          <Main store={store} domain={domain} key="store-layout-root">
            {children}
          </Main>
        )}
      </div>
    </StoreProvider>
  );
}