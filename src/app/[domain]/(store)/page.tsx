import { headers } from 'next/headers'
import { heroForDevice } from '@/lib/hero-device'
import { getStoreForRequest as getStoreCached } from '@/lib/store-request'
import ThemeRunner from '@/components/ThemeRunner'
import BundleSlider from '@/components/bundles/BundleSlider'

export const dynamic = 'force-dynamic'


function StoreNotFound({ domain }: { domain: string }) {
  return (
    <div className="absolute top-0 left-0 w-full z-[100] h-screen flex items-center justify-center bg-gray-50" >
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-5xl font-black mb-2 text-red-500">404</h1>
        <h2 className="text-xl text-gray-800 font-bold mb-4">المتجر غير موجود</h2>
        <p className="text-gray-400 font-mono text-sm">Domain: {domain}</p>
      </div>
    </div>
  )
}

function StoreInactive({ store }: { store: any }) {
  const isRTL = store.language === 'ar'
  return (
    <div className="absolute top-0 left-0 w-full z-[100] h-screen flex items-center justify-center bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center p-10 bg-white rounded-2xl shadow-2xl border-t-4" style={{ borderColor: store.design?.primaryColor , padding:100 }}>
        <h1 className="text-2xl font-bold mb-3">{isRTL ? 'المتجر غير نشط' : 'Store Inactive'}</h1>
        <p className="text-gray-600 italic">{store.name}</p>
      </div>
    </div>
  )
}

export default async function StorePage(props: {
  params: Promise<{ domain: string }>
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}) {
  const { domain } = await props.params
  const { category, search, page } = await props.searchParams

  const store = await getStoreCached(domain, category, search, page)

  if (!store) return <StoreNotFound domain={domain} />
  if (!store.isActive) return <StoreInactive store={store} />

  const slug     = store.theme?.slug || 'default'
  const bundleUrl = `/api/themes/${slug}`

  const h = await headers()
  // روابط المتجر محلياً تحمل /<domain> (الـ middleware لا يعيد الكتابة على الدومين الرئيسي)
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mdstore.top').toLowerCase()
  const base = (h.get('host') || '').toLowerCase() === rootDomain ? `/${domain}` : ''
  const bundles = store.bundles ?? []

  return (
    <>
      {/* سلايدر «عروض الأطقم» — مشترك لكل الثيمات؛ فوق محتوى الثيم حتى تضعه الثيمات تحت غلافها */}
      {bundles.length > 0 && (
        <BundleSlider
          bundles={bundles}
          accent={store.design?.primaryColor || '#111827'}
          language={store.language || 'ar'}
          title={store.design?.bundlesTitle}
          base={base}
        />
      )}
      <ThemeRunner
        bundleUrl={bundleUrl}
        exportName="Home"
        themeProps={{ store: heroForDevice(store, h.get('user-agent')), page: +(page || 1), domain }}
      />
    </>
  )
}
