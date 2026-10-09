import { cache } from 'react'
import { notFound } from 'next/navigation'
import { getBuilderPageById, getStoreByDomain, resolveDomain } from '@/lib/api'
import BuilderPageRenderer from '@/components/builderPages/BuilderPageRenderer'
import { StoreProvider } from '@/Hook/store-provider'
import CustomerTracker from '@/components/CustomerTracker'
import AddShow from '@/components/addShow'
import ThemeRunner from '@/components/ThemeRunner'
import type { Metadata } from 'next'

const getStoreCached = cache(async (domain: string) => getStoreByDomain(domain))

// دومين مخصص لصفحة محرر واحدة (domains.scope = 'landing_page'): الصفحة نفسها تُعرض
// على الدومين بدل واجهة المتجر — null إن كان دومين متجر أو الصفحة غير منشورة
const getDomainPageCached = cache(async (domain: string) => {
  const { scope, builderPageId } = await resolveDomain(domain)
  if (scope !== 'landing_page' || !builderPageId) return null
  return getBuilderPageById(builderPageId)
})

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ domain: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { domain } = await params
  const domainPage = await getDomainPageCached(domain)
  if (domainPage) return { title: domainPage.name || domain }

  const store = await getStoreCached(domain)
  if (!store) return { title: 'Store Not Found' }

  const favicon = store.design?.faviconUrl || store.design?.logoUrl || '/default-logo.png'
  return {
    title: {
      default: store.isActive ? store.name : `${store.name} (Inactive)`,
      template: `%s | ${store.name}`,
    },
    description: store.name,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: {
      title: store.name,
      description: store.name,
      images: [{ url: store.design?.logoUrl || '' }],
    },
  }
}

export default async function DomainLayout({ children, params }: LayoutProps) {
  const { domain } = await params

  // الدومين كله لصفحة واحدة: تُعرض مباشرة بدون ثيم المتجر. بعد الطلب يذهب الزبون إلى
  // /lp/page/successfully (مسار lp خارج هذا الـ layout، فلا يُعاد عرض الصفحة)
  const domainPage = await getDomainPageCached(domain)
  if (domainPage) {
    return (
      <>
        <CustomerTracker pixels={domainPage.pixels ?? []} />
        <BuilderPageRenderer page={domainPage} lpDomain="page" />
      </>
    )
  }

  const store = await getStoreCached(domain)
  if (!store) notFound()

  const slug     = store.theme?.slug || 'default'
  const language = store.language    || 'ar'
  const dir      = language === 'ar' ? 'rtl' : 'ltr'
  const bundleUrl = `/api/themes/${slug}`

  return (
    <StoreProvider store={store} theme={slug}>
      <AddShow storeId={store.id} />
      <div dir={dir}>
        <CustomerTracker pixels={store.pixels ?? []} />
        <ThemeRunner bundleUrl={bundleUrl} exportName="default" themeProps={{ store, domain }}>
          {children}
        </ThemeRunner>
      </div>
    </StoreProvider>
  )
}
