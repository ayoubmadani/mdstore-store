import React from 'react';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getStoreByDomain } from '@/lib/api';
import { StoreProvider } from '@/Hook/store-provider';
import CustomerTracker from '@/components/CustomerTracker';
import Landing from '@/components/landing';
import AddShow from '@/components/addShow';
import { Metadata } from 'next';
import { loadTheme } from '@/lib/theme-loader';

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

  const store = await getStoreCached(domain);

  if (!store) notFound();

  const currentThemeSlug = store?.theme?.slug || 'default';
  const language = store?.language || 'ar';

  const themeModule = await loadTheme(language, currentThemeSlug);
  const Main = themeModule.default ?? themeModule.Main;

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <StoreProvider store={store} theme={currentThemeSlug}>
      <AddShow storeId={store.id} />
      <div dir={direction}>
        <CustomerTracker pixels={store.pixels ?? []} />
        <Main store={store} domain={domain}>
          {children}
        </Main>
      </div>
    </StoreProvider>
  );
}