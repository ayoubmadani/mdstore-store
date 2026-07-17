import { cache } from 'react'
import { notFound } from 'next/navigation'
import { getStoreByDomain } from '@/lib/api'
import { StoreProvider } from '@/Hook/store-provider'
import CustomerTracker from '@/components/CustomerTracker'
import AddShow from '@/components/addShow'
import ThemeRunner from '@/components/ThemeRunner'
import type { Metadata } from 'next'

const getStoreCached = cache(async (domain: string) => getStoreByDomain(domain))

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ domain: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { domain } = await params
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
