import { cache } from 'react'
import { notFound } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { getStoreByDomain, getBuilderPageById, resolveSplitTest } from '@/lib/api'
import { StoreProvider } from '@/Hook/store-provider'
import CustomerTracker from '@/components/CustomerTracker'
import AddShow from '@/components/addShow'
import ThemeRunner from '@/components/ThemeRunner'
import BuilderPageRenderer from '@/components/builderPages/BuilderPageRenderer'
import DedicatedPageSwitch from '@/components/builderPages/DedicatedPageSwitch'
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
  // إعدادات SEO من لوحة التاجر (Statistiques & Support ← SEO)؛ الفارغ يرجع للقيم الافتراضية
  const seo = store.seo
  const title = seo?.metaTitle || store.name
  const description = seo?.metaDescription || store.hero?.subtitle || store.name
  const shareImage = seo?.ogImageUrl || store.hero?.imageUrl || store.design?.logoUrl
  const keywords = seo?.keywords?.split(',').map((k) => k.trim()).filter(Boolean)
  return {
    title: {
      default: store.isActive ? title : `${title} (Inactive)`,
      template: `%s | ${store.name}`,
    },
    description,
    keywords: keywords?.length ? keywords : undefined,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    robots: seo?.allowIndexing === false || !store.isActive ? { index: false, follow: false } : undefined,
    verification: {
      google: seo?.googleVerification || undefined,
      other: seo?.bingVerification ? { 'msvalidate.01': seo.bingVerification } : undefined,
    },
    openGraph: {
      title,
      description,
      siteName: store.name,
      type: 'website',
      images: shareImage ? [{ url: shareImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: shareImage ? [shareImage] : undefined,
    },
  }
}

export default async function DomainLayout({ children, params }: LayoutProps) {
  const { domain } = await params
  const store = await getStoreCached(domain)
  if (!store) notFound()

  // دومين مخصص بالكامل لصفحة هبوط واحدة (أُنشئ من داخل المحرر) — يعرض تلك
  // الصفحة حصرياً عند الجذر (وأي مسار آخر تحته)، بدل واجهة المتجر العادية،
  // بلا أي chrome (نفس شكل /lp/[lpdomain] تماماً).
  const dedicatedDomain = store.domains?.find((d) => d.domain === domain && d.scope === 'landing_page')
  if (dedicatedDomain?.builderPageId || dedicatedDomain?.splitTestId) {
    // دومين مربوط باختبار A/B: الصفحة التي رآها الزائر من قبل (cookie) وإلا قرعة حسب الأوزان
    const page = dedicatedDomain.splitTestId
      ? await resolveSplitTest(
          dedicatedDomain.splitTestId,
          (await cookies()).get(`mdab_${dedicatedDomain.splitTestId}`)?.value,
          (await headers()).get('x-ab-preview') ?? undefined,
        )
      : await getBuilderPageById(dedicatedDomain.builderPageId!)
    if (!page) notFound()
    // /success يعرض صفحة "شكراً" الخاصة بالمتجر بعد الطلب
    return (
      <StoreProvider store={store} theme={store.theme?.slug || 'default'}>
        <div dir={(page.settings?.language || 'ar') === 'ar' ? 'rtl' : 'ltr'}>
          <CustomerTracker pixels={page.pixels ?? []} pageType="landing_page" landingPageId={page.id} />
          <DedicatedPageSwitch
            page={<BuilderPageRenderer page={page} lpDomain={domain} dedicated />}
            success={children}
          />
        </div>
      </StoreProvider>
    )
  }

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
