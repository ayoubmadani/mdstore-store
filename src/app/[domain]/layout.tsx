import React from 'react';
import { cache } from 'react'; // ✅ deduplication — نفس الـ request لن تستدعي الـ API مرتين
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreByDomain } from '@/lib/api';
import { StoreProvider } from '@/Hook/store-provider';
import dynamic from 'next/dynamic';
import CustomerTracker from '@/components/CustomerTracker';
import Landing from '@/components/landing';
import AddShow from '@/components/addShow';

// ✅ cache() يضمن أن getStoreByDomain تُنفَّذ مرة واحدة فقط لنفس الـ domain
// حتى لو استدعاها generateMetadata و StoreLayout في نفس الـ request
const getStoreCached = cache(async (domain: string) => {
  return getStoreByDomain(domain);
});

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { domain } = await params;
  const store = await getStoreCached(domain); // ✅ من الـ cache إذا سبق جلبه

  if (!store) return { title: 'Store Not Found' };

  return {
    title: { default: store.name, template: `%s | ${store.name}` },
    description: store.hero?.subtitle || `Welcome to ${store.name}`,
    icons: store.design?.logoUrl ? { icon: store.design.logoUrl } : undefined,
  };
}

export default async function StoreLayout({ children, params }: LayoutProps) {
  const { domain } = await params;
  const store: any = await getStoreCached(domain); // ✅ لا query جديدة — من الـ cache

  if (!store) notFound();

  const currentThemeSlug = store?.themeUser?.theme?.slug || 'default';
  const language = store?.language || 'ar';

  // ✅ dynamic خارج الـ conditional لتجنب re-creation في كل render
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

  const direction = store.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <StoreProvider store={store} theme={currentThemeSlug}>
      <AddShow storeId={store.id} />
      <div dir={direction}>
        <CustomerTracker pixels={store.pixels} />
        <Main store={store}>
          {children}
        </Main>
      </div>
    </StoreProvider>
  );
}