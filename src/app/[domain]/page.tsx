// ==========================================
// ALL PRODUCTS
// ==========================================

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getStoreByDomain } from '@/lib/api';
import AddShow from '@/components/addShow';

// ==========================================
// TYPES
// ==========================================
interface Store {
  id: string;
  name: string;
  isActive: boolean;
  language: string;
  design: { primaryColor: string; logoUrl?: string | null };
  hero: { subtitle?: string | null };
  themeUser?: { theme?: { slug?: string } }; // إضافة التايب هنا للأمان
}

// ... (مكونات StoreNotFound و StoreInactive تبقى كما هي)
// ==========================================
// SUB-COMPONENTS (Server Components)
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

function StoreInactive({ store }: { store: Store }) {
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

export default async function StorePage(props: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const domain = params.domain;
  const store: any = await getStoreByDomain(domain);

  // 1. التحقق من وجود المتجر أولاً (قبل أي عملية أخرى)
  if (!store) return <StoreNotFound domain={domain} />;

  // 2. التحقق من حالة النشاط
  if (!store.isActive) return <StoreInactive store={store} />;

  // 3. استخراج الـ slug بأمان بعد التأكد من وجود الـ store
  const activeTheme = store?.themeUser?.theme?.slug || 'default';
  const language = store?.language || 'ar';

  // 4. تعريف المكون الديناميكي بناءً على الثيم الفعلي
  const SelectedTheme = dynamic<any>(
    async () => {
      try {
        const mod = await import(`@/theme/${language}/${activeTheme}/main`);
        return mod.Home || mod.default;
      } catch (err) {
        console.error("Failed to load theme:", activeTheme, err);
        // Fallback للثيم الافتراضي
        const fallback = await import(`@/theme/${language}/default/main`);
        return fallback.Home || fallback.default;
      }
    },
    {
      loading: () => <p className="text-center py-20 text-gray-500">جاري التحميل...</p>,
      ssr: true,
    }
  );

  // الـ Return النهائي للمكون الأساسي
  return (
    <>
      {/* إضافة المكون هنا يضمن عمل التتبع فور تحميل الصفحة */}
      
      <SelectedTheme store={store} searchParams={searchParams} />
    </>
  );
}

// ==========================================
// METADATA
// ==========================================
export async function generateMetadata(props: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const store = await getStoreByDomain(params.domain);

  if (!store) return { title: 'Store Not Found' };

  return {
    title: store.isActive ? store.name : `${store.name} (Inactive)`,
    description: store.hero?.subtitle || `Welcome to ${store.name}`,
    icons: store.design?.logoUrl ? { icon: store.design.logoUrl } : undefined,
  };
}