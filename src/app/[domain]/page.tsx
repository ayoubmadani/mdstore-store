import { cache } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getStoreByDomain } from '@/lib/api';

// ✅ نفس الـ cache من layout.tsx — لو Next.js يشاركهم في نفس الـ request
// لو لا، هذا يضمن على الأقل عدم التكرار بين generateMetadata و StorePage
const getStoreCached = cache(async (domain: string) => {
  return getStoreByDomain(domain);
});

// ==========================================
// SUB-COMPONENTS
// ==========================================
function StoreNotFound({ domain }: { domain: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-5xl font-black mb-2">404</h1>
        <h2 className="text-xl text-gray-600 mb-4">المتجر غير موجود</h2>
        <p className="text-gray-400 font-mono text-sm">Domain: {domain}</p>
      </div>
    </div>
  );
}

function StoreInactive({ store }: { store: any }) {
  const isRTL = store.language === 'ar';
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        className="text-center p-10 bg-white rounded-2xl shadow-2xl border-t-4"
        style={{ borderColor: store.design?.primaryColor }}
      >
        <h1 className="text-2xl font-bold mb-3">
          {isRTL ? 'المتجر غير نشط' : 'Store Inactive'}
        </h1>
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
  const [{ domain }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const store: any = await getStoreCached(domain); // ✅ لا query جديدة

  if (!store) return <StoreNotFound domain={domain} />;
  if (!store.isActive) return <StoreInactive store={store} />;

  const activeTheme = store?.themeUser?.theme?.slug || 'default';
  const language = store?.language || 'ar';

  // ✅ dynamic مع fallback داخلي
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

  return <SelectedTheme store={store} searchParams={searchParams} />;
}

// ==========================================
// METADATA
// ==========================================
export async function generateMetadata(props: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await props.params;
  const store = await getStoreCached(domain); // ✅ من الـ cache

  if (!store) return { title: 'Store Not Found' };

  return {
    title: store.isActive ? store.name : `${store.name} (Inactive)`,
    description: store.hero?.subtitle || `Welcome to ${store.name}`,
    icons: store.design?.logoUrl ? { icon: store.design.logoUrl } : undefined,
  };
}