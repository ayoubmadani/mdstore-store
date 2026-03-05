import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreByDomain } from '@/lib/api';
import { StoreProvider } from '@/Hook/store-provider';
import dynamic from 'next/dynamic';
import CustomerTracker from '@/components/CustomerTracker';
import Landing from '@/components/landing';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { domain } = await params;
  const store = await getStoreByDomain(domain);

  if (!store) {
    return { title: 'Store Not Found' };
  }

  return {
    title: { default: store.name, template: `%s | ${store.name}` },
    description: store.hero?.subtitle || `Welcome to ${store.name}`,
    icons: store.design?.logoUrl ? { icon: store.design.logoUrl } : undefined,
  };
}

export default async function StoreLayout({ children, params }: LayoutProps) {
  const { domain } = await params;
  const store: any = await getStoreByDomain(domain);

  console.log(store.pixels);
  

  if (!store) {
    notFound();
  }

  // ✅ 1. استخراج الـ slug بأمان تام باستخدام Optional Chaining
  // إذا كان themeUser أو theme غير موجود، سيستخدم 'default'
  const currentThemeSlug = store?.themeUser?.theme?.slug || 'default';

  // ✅ 2. تحميل الثيم بناءً على المتغير الآمن
  const Main = dynamic<any>(
    () => import(`@/theme/${currentThemeSlug}/main`),
    {
      loading: () => <Landing />,
      ssr: true
    }
  );

  const isRTL = store.language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';

  return (
  <StoreProvider store={store} theme={currentThemeSlug}>
    <div dir={direction}>
      {/* ✅ تمرير الـ pixels المستلمة من الـ API */}
      <CustomerTracker pixels={store.pixels} />
      
      <Main store={store}>
        {children}
      </Main>
    </div>
  </StoreProvider>
);
}