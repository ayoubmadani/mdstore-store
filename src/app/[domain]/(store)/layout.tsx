import { cache } from 'react'
import { notFound } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { getStoreByDomain, getBuilderPageById, resolveSplitTest, getProduct } from '@/lib/api'
import ProductClient from './product/[id]/ProductClient'
import { StoreProvider } from '@/Hook/store-provider'
import CustomerTracker from '@/components/CustomerTracker'
import AddShow from '@/components/addShow'
import ThemeRunner from '@/components/ThemeRunner'
import BuilderPageRenderer from '@/components/builderPages/BuilderPageRenderer'
import { withImageSizes } from '@/lib/image-size'
import DedicatedPageSwitch from '@/components/builderPages/DedicatedPageSwitch'
import { BARE_CSS, cartOff } from '@/components/builderPages/themeBare'
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
    const picked = dedicatedDomain.splitTestId
      ? await resolveSplitTest(
          dedicatedDomain.splitTestId,
          (await cookies()).get(`mdab_${dedicatedDomain.splitTestId}`)?.value,
          (await headers()).get('x-ab-preview') ?? undefined,
        )
      : await getBuilderPageById(dedicatedDomain.builderPageId!)
    if (!picked) notFound()
    // أبعاد الصور من الخادم: يُحجز مكانها قبل وصولها فلا تقفز الصفحة
    const page: any = await withImageSizes(picked)
    // قسم «المنتج بثيم المتجر»: المنتج يُحمَّل هنا فتظهر الصفحة كاملة من الخادم
    const themeBlock = page.tree?.find((b: any) => b.type === 'themeProduct')
    const themeProductId = themeBlock && (page.productId || themeBlock.props?.productId)
    if (themeProductId) page.themeProduct = await getProduct(domain, themeProductId)
    // /success يعرض صفحة "شكراً" الخاصة بالمتجر بعد الطلب
    return (
      <StoreProvider store={store} theme={store.theme?.slug || 'default'}>
        <div dir={(page.settings?.language || 'ar') === 'ar' ? 'rtl' : 'ltr'}>
          <CustomerTracker pixels={page.pixels ?? []} pageType="landing_page" landingPageId={page.id} />
          <DedicatedPageSwitch
            page={<BuilderPageRenderer page={page} lpDomain={domain} dedicated store={store} />}
            success={children}
          />
        </div>
      </StoreProvider>
    )
  }

  // دومين مخصص لمنتج واحد (حملة): صفحة المنتج وحدها بثيم المتجر، بلا رأس المتجر وتذييله —
  // بكسلات المنتج إن وُجدت وإلا بكسلات المتجر. /success و/successfully بعد الطلب كما هي
  const productDomain = store.domains?.find((d) => d.domain === domain && d.scope === 'product' && d.productId)
  if (productDomain?.productId) {
    const product = await getProduct(domain, productDomain.productId)
    if (product?.isActive) {
      const productPixels = (store.pixels ?? []).filter((p) => p.scope === 'product' && p.productId === product.id)
      return (
        <StoreProvider store={store} theme={store.theme?.slug || 'default'}>
          <div dir={(store.language || 'ar') === 'ar' ? 'rtl' : 'ltr'}>
            {productPixels.length
              ? <CustomerTracker pixels={productPixels} pageType="product" productId={product.id} />
              : <CustomerTracker pixels={store.pixels ?? []} />}
            {/* مثل صفحة الهبوط: غلاف الثيم (خلفيته وتنسيقه) بلا رأس المتجر وتذييله (كل ما بجانب <main>)،
                وطلب مباشر فقط: السلة تُعامل كأنها معطّلة فيظهر نموذج الطلب مباشرة (بلا «أضف إلى السلة» ولا «اطلب الآن») */}
            <style>{BARE_CSS}</style>
            <div className="mds-bare">
              <ThemeRunner bundleUrl={`/api/themes/${store.theme?.slug || 'default'}`} exportName="default" themeProps={{ store, domain }}>
                <DedicatedPageSwitch page={<ProductClient product={cartOff(product, store).product} store={cartOff(product, store).store} domain={domain} noTracker />} success={children} />
              </ThemeRunner>
            </div>
          </div>
        </StoreProvider>
      )
    }
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
