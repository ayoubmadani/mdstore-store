import { cache } from 'react';
import { getStoreByDomain } from '@/lib/api';
import ThemeRunner from '@/components/ThemeRunner';

// ✅ 1. إجبار الصفحة على التحقق من البيانات في كل طلب (حل مشكلة Production)
export const dynamic = 'force-dynamic';

const getStoreCached = cache(async (domain: string, category?: string , search? :string , page?:string ) => {
  return getStoreByDomain(domain, category , search , page);
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

function StoreInactive({ store }: { store: NonNullable<Awaited<ReturnType<typeof getStoreCached>>> }) {
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
  searchParams: Promise<{ category?: string ,search:string , page:string}>;
}) {
  const { domain } = await props.params;
  const searchParams = await props.searchParams;
  const category = searchParams.category;
  const search = searchParams.search;
  const page = searchParams.page;

  const store = await getStoreCached(domain, category, search, page);

  if (!store) return <StoreNotFound domain={domain} />;
  if (!store.isActive) return <StoreInactive store={store} />;

  const activeTheme = store.theme?.slug || 'default';
  const language = store.language || 'ar';

  const bundleUrl = `/api/themes-controller?lang=${language}&slug=${activeTheme}`;

  return (
    <ThemeRunner
      bundleUrl={bundleUrl}
      exportName="Home"
      themeProps={{ store, page: +page, domain }}
    />
  );
}