import { cache } from 'react';
import { default as nextDynamic } from 'next/dynamic';
import { getStoreByDomain } from '@/lib/api';

// ✅ 1. إجبار الصفحة على التحقق من البيانات في كل طلب (حل مشكلة Production)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getStoreCached = cache(async (domain: string, category?: string , search? :string) => {
  return getStoreByDomain(domain, category , search);
});

// ==========================================
// SUB-COMPONENTS (نفس كودك دون تغيير)
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
  searchParams: Promise<{ category?: string ,search:string}>;
}) {
  const { domain } = await props.params;
  const searchParams = await props.searchParams;
  const category = searchParams.category;
  const search = searchParams.search;
  console.log('-----------------------------------');
  
  console.log({search});

  const store: any = await getStoreCached(domain, category,search);

  if (!store) return <StoreNotFound domain={domain} />;
  if (!store.isActive) return <StoreInactive store={store} />;

  const activeTheme = store?.themeUser?.theme?.slug || 'default';
  const language = store?.language || 'ar';

  const SelectedTheme = nextDynamic<any>(
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

  return <SelectedTheme store={store} domain={domain} />;
}