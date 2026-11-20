import type { Metadata } from 'next'
import { headers } from 'next/headers'
import BundleOrder from '@/components/bundles/BundleOrder'
import ThemeRunner from '@/components/ThemeRunner'
import { bundleStrings, getBundlePage } from '@/lib/bundles'
import { getStoreForRequest } from '@/lib/store-request'

type Props = { params: Promise<{ domain: string; slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { domain, slug } = await props.params
  const bundle = await getBundlePage(domain, slug)
  if (!bundle) return {}
  return {
    title: bundle.name,
    description: bundle.subtitle || undefined,
    openGraph: { title: bundle.name, images: bundle.imageUrl ? [bundle.imageUrl] : undefined },
  }
}

// صفحة طلب الطقم — داخل إطار الثيم (الشريط العلوي والفوتر من layout المتجر)
export default async function BundlePageRoute(props: Props) {
  const { domain, slug } = await props.params
  const [store, bundle] = await Promise.all([getStoreForRequest(domain), getBundlePage(domain, slug)])
  const language = store?.language || 'ar'

  if (!store || !bundle) {
    const t = bundleStrings(language)
    const h = await headers()
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mdstore.top').toLowerCase()
    const base = (h.get('host') || '').toLowerCase() === rootDomain ? `/${domain}` : ''
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h1 className="text-xl font-bold">{t.ended}</h1>
        <a href={base || '/'} className="mt-6 inline-block rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white">{t.backToStore}</a>
      </div>
    )
  }

  // صفحة الثيم (export Bundle) بأسلوبه — وإلا الصفحة المشتركة
  const shared = (
    <BundleOrder
      bundle={bundle}
      domain={domain}
      storeId={store.id}
      userId={store.user?.id ?? ''}
      accent={store.design?.primaryColor || '#111827'}
      language={language}
    />
  )
  return (
    <ThemeRunner
      bundleUrl={`/api/themes/${store.theme?.slug || 'default'}`}
      exportName="Bundle"
      strict
      missing={shared}
      themeProps={{ store, bundle, domain }}
    />
  )
}
