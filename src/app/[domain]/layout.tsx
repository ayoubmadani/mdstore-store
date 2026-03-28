import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreByDomain } from '@/lib/api';
import { StoreProvider } from '@/Hook/store-provider';
import dynamic from 'next/dynamic';
import CustomerTracker from '@/components/CustomerTracker';
import Landing from '@/components/landing';
import AddShow from '@/components/addShow';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

// 1. تأمين الـ Metadata من الانهيار
export async function generateMetadata(props: LayoutProps): Promise<Metadata> {
  const { domain } = await props.params;
  const store = await getStoreByDomain(domain);

  // إذا لم يجد المتجر، نضع قيم افتراضية بدل الانهيار
  if (!store) {
    return { title: 'Store Not Found' };
  }

  return {
    title: { default: store.name, template: `%s | ${store.name}` },
    description: store.hero?.subtitle || `Welcome to ${store.name}`,
    // استخدام الـ Optional Chaining هنا ضروري جداً
    icons: store.design?.logoUrl ? { icon: store.design.logoUrl } : undefined,
  };
}

export default async function StoreLayout(props: LayoutProps,{children}:any) {
  const { domain } = await props.params;
  
  // جلب المتجر
  const store:any = await getStoreByDomain(domain);

  // 2. التحقق الصارم: إذا كان المتجر null، اخرج فوراً بصفحة 404
  // هذا يمنع تنفيذ أي كود بالأسفل يحاول القراءة من store
  if (!store) {
    notFound();
    return null; // ضمان عدم إكمال التنفيذ
  }

  // الآن نحن متأكدون أن store موجود
  const currentThemeSlug = store?.themeUser?.theme?.slug || 'default';
  const language = store?.language || 'ar';

  // 3. تأمين الـ Dynamic Import
  const Main = dynamic<any>(
    () => import(`@/theme/${language}/${currentThemeSlug}/main`).catch(() => {
        // في حال فشل تحميل الثيم المحدد، حمل الثيم الافتراضي لضمان عدم توقف الموقع
        return import(`@/theme/ar/default/main`);
    }),
    {
      loading: () => <Landing />,
      ssr: true
    }
  );

  const direction = store.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <StoreProvider store={store} theme={currentThemeSlug}>
      <AddShow storeId={store.id} />
      <div dir={direction}>
        {/* حماية للـ pixels في حال كانت undefined */}
        <CustomerTracker pixels={store.pixels || []} />
        
        <Main store={store}>
          {children}
        </Main>
      </div>
    </StoreProvider>
  );
}