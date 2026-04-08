import { cache } from 'react';
import dynamic from 'next/dynamic';
import { getStoreByDomain } from '@/lib/api';

// ✅ التعديل: جعل الكاتيجوري اختيارية (category?: string) لتجنب الانهيار
const getStoreCached = cache(async (domain: string, category?: string) => {
  return getStoreByDomain(domain, category);
});

// ==========================================
// SUB-COMPONENTS
// ==========================================
function StoreNotFound({ domain }: { domain: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-5xl font-black mb-2 text-red-500">404</h1>
        <h2 className="text-xl text-gray-800 font-bold mb-4">المتجر غير موجود</h2>
        <p className="text-gray-400 font-mono text-sm">Domain: {domain}</p>
      </div>
    </div>
  );
}

function StoreInactive({ store }: { store: any }) {
  const isRTL = store.language === 'ar';
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center p-10 bg-white rounded-2xl shadow-2xl border-t-4" style={{ borderColor: store.design?.primaryColor }}>
        <h1 className="text-2xl font-bold mb-3">{isRTL ? 'المتجر غير نشط' : 'Store Inactive'}</h1>
        <p className="text-gray-600 italic">"{store.name}"</p>
      </div>
    </div>
  );
}

// ==========================================
// PAGE
// ==========================================
export default async function StorePage(props: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  // انتظر فك تشفير الـ params والـ searchParams
  const { domain } = await props.params;
  const { category } = await props.searchParams;

  // ✅ نمرر الـ category المستخرجة من الرابط
  const store: any = await getStoreCached(domain, category); 

  if (!store) return <StoreNotFound domain={domain} />;
  if (!store.isActive) return <StoreInactive store={store} />;

  const activeTheme = store?.themeUser?.theme?.slug || 'default';
  const language = store?.language || 'ar';

  const SelectedTheme = dynamic<any>(
    () =>
      import(`@/theme/${language}/${activeTheme}/main`)
        .then((mod) => mod.Home || mod.default)
        .catch(async (err) => {
          console.error('Failed to load theme:', activeTheme, err);
          const fallback = await import(`@/theme/${language}/default/main`);
          return fallback.Home || fallback.default;
        }),
    {
      loading: () => <p className="text-center py-20 text-gray-500">جاري التحميل...</p>,
      ssr: true,
    }
  );

  return <SelectedTheme store={store} searchParams={{ category }} />;
}

