import React from 'react';
import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreByDomain } from '@/lib/api';
import { StoreProvider } from '@/Hook/store-provider';
import dynamic from 'next/dynamic';
import CustomerTracker from '@/components/CustomerTracker';
import Landing from '@/components/landing';
import AddShow from '@/components/addShow';

// ✅ كاش لبيانات المتجر الأساسية (بدون تصنيفات)
const getStoreCached = cache(async (domain: string) => {
  return getStoreByDomain(domain);
});

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

// ==========================================
// METADATA (تعمل على مستوى المتجر بالكامل)
// ==========================================
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { domain } = await params;
  const store = await getStoreCached(domain);

  if (!store) return { title: 'Store Not Found' };

  // تأكد من مسار الأيقونة (استخدم رابط كامل إذا كانت الصورة خارجية)
  const iconUrl = store.design?.faviconUrl || store.design?.logoUrl || '/default-logo.png';

  return {
    title: {
      default: store.name,
      template: `%s | ${store.name}`, // يسمح للصفحات الفرعية بإضافة عنوانها قبل اسم المتجر
    },
    description: store.hero?.subtitle || `Welcome to ${store.name}`,
    icons: {
      icon: [
        { url: iconUrl, href: iconUrl },
      ],
      shortcut: iconUrl,
      apple: iconUrl,
    },
    // لدعم ظهور الشعار عند مشاركة الرابط في واتساب وفيسبوك
    openGraph: {
      title: store.name,
      description: store.hero?.subtitle,
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

  const currentThemeSlug = store?.themeUser?.theme?.slug || 'default';
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