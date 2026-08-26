'use client'

import { useEffect, useMemo, type SyntheticEvent } from 'react'
import ThemeRunner from '@/components/ThemeRunner'
import { buildPreviewStore, PREVIEW_DOMAIN, PREVIEW_WILAYAS, PREVIEW_COMMUNES, type PreviewLang } from '@/lib/mock-preview-store'
import { installPreviewMockApi, setPreviewSearchLang } from '@/lib/preview-mock-api'
import type { Store } from '@/types/store'

// 'home'|'product'|'cart'|'success' مسارات معروفة لها exports مخصصة في الثيم. أي قيمة
// أخرى (privacy/terms/cookies/contact أو أي slug من additionalPages الخاص بالثيم) تُمرَّر
// كما هي إلى StaticPage — تماماً كما يفعل src/app/[domain]/(store)/[page]/page.tsx الحقيقي.
export type PreviewPage = string

// يمنع فقط التنقّل الحقيقي عبر روابط <a href> (Navbar/Footer/بطاقات المنتج) لأنها تقود
// إلى مسارات /{domain}/... حقيقية غير موجودة (preview ليس دومين حقيقي فيُعطي 404) —
// لكنه يترك كل الأزرار والنماذج (طلب الآن، أضف للسلة، الفلاتر...) تعمل بشكل طبيعي
// لأن هذه صفحة عرض واحدة بدون توجيه حقيقي (Navbar/المنتج/السلة/تواصل كلها Tabs داخلية).
function useBlockRealNavigation() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.('a[href]')
      if (link) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])
}

// يملأ سلة المعاينة بمنتج واحد عند أول تحميل فقط (وإذا كانت فارغة) حتى تعرض صفحة "السلة"
// عنصراً مباشرة بدل شاشة "السلة فارغة" — بنفس شكل العنصر الذي تكتبه addToCart داخل الثيمات
// (product/finalPrice/quantity/...)، ولا يطغى على أي تعديل يدوي يجريه المستخدم لاحقاً.
function useSeedPreviewCart(store: any) {
  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem(PREVIEW_DOMAIN) || '[]')
      if (Array.isArray(existing) && existing.length > 0) return
      const product = store.products?.[0]
      if (!product) return
      const item = {
        customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '',
        quantity: 1, typeLivraison: 'home',
        product,
        productId: product.id,
        storeId: product.store?.id,
        userId: product.store?.userId,
        selectedOffer: null,
        selectedVariants: {},
        platform: 'store',
        finalPrice: product.price,
        totalPrice: product.price,
        priceLivraison: 0,
        addedAt: Date.now(),
      }
      localStorage.setItem(PREVIEW_DOMAIN, JSON.stringify([item]))
    } catch {}
  }, [store])
}

const noop = () => {}

// يعرض قسم "تفاصيل المنتج" لأول منتج وهمي — بنفس شكل الـ props التي يرسلها
// src/app/[domain]/(store)/product/[id]/ProductClient.tsx للثيم الحقيقي. النموذج تفاعلي
// فعلاً (يمكن فتح "اطلب الآن" وملء الحقول) — الإرسال الحقيقي مُعترَض ومُزيَّف عبر
// installPreviewMockApi، وأي إعادة توجيه بعد النجاح تبقى محدودية معروفة ومقبولة.
function PreviewProductDetails({ product, store, domain, bundleUrl }: { product: any; store: any; domain: string; bundleUrl: string }) {
  const allImages = [product.productImage, ...(product.imagesProduct?.map((i: any) => i.imageUrl) || [])].filter(Boolean)
  const discount = product.priceOriginal
    ? Math.round(((product.priceOriginal - product.price) / product.priceOriginal) * 100)
    : 0

  return (
    <ThemeRunner
      bundleUrl={bundleUrl}
      exportName="Details"
      themeProps={{
        product,
        store,
        domain,
        allImages,
        allAttrs: product.attributes || [],
        finalPrice: product.price,
        inStock: true,
        autoGen: false,
        discount,
        selectedVariants: {},
        selectedOffer: product.offers?.[0]?.id ?? null,
        isWishlisted: false,
        formData: { customerId: '', customerName: '', customerPhone: '', customerWelaya: '', customerCommune: '', quantity: 1, typeLivraison: 'home' as const },
        formErrors: {},
        submitting: false,
        wilayas: PREVIEW_WILAYAS,
        communes: PREVIEW_COMMUNES,
        loadingCommunes: false,
        setFormData: noop,
        setSelectedOffer: noop,
        handleVariantSelection: noop,
        handleSubmit: (e: SyntheticEvent) => e.preventDefault(),
        handleShare: noop,
        toggleWishlist: noop,
        getTotalPrice: () => product.price,
        getPriceLivraison: () => 0,
        getFinalPrice: () => product.price,
      }}
    />
  )
}

// المحتوى الفعلي للثيم (Main + الصفحة المختارة) — بدون أي واجهة تحكّم إضافية، حتى يمكن
// استخدامه مباشرة (وضع سطح المكتب) أو داخل iframe منفصل (وضع الموبايل، حتى تستجيب
// media queries الحقيقية لعرض الـ iframe الضيق بدل عرض المتصفح الكامل).
export default function PreviewContent({ theme, lang, page }: { theme: string; lang: PreviewLang; page: PreviewPage }) {
  useEffect(() => installPreviewMockApi(), [])
  useBlockRealNavigation()
  useEffect(() => setPreviewSearchLang(lang), [lang])

  const store: Store = useMemo(() => buildPreviewStore(theme, lang), [theme, lang])
  useSeedPreviewCart(store)
  const bundleUrl = `/api/themes/${theme}`
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <div dir={dir}>
      <ThemeRunner
        bundleUrl={bundleUrl}
        exportName="default"
        themeProps={{ store, domain: PREVIEW_DOMAIN }}
        fallback={<p style={{ padding: 40, textAlign: 'center' }}>...جاري تحميل الثيم</p>}
      >
        {page === 'home' && (
          <ThemeRunner
            bundleUrl={bundleUrl}
            exportName="Home"
            themeProps={{ store, domain: PREVIEW_DOMAIN, page: 1 }}
          />
        )}

        {page === 'product' && (
          <PreviewProductDetails product={store.products![0]} store={store} domain={PREVIEW_DOMAIN} bundleUrl={bundleUrl} />
        )}

        {page === 'cart' && (
          <ThemeRunner
            bundleUrl={bundleUrl}
            exportName="Cart"
            themeProps={{ store, domain: PREVIEW_DOMAIN }}
          />
        )}

        {page === 'success' && (
          <ThemeRunner
            bundleUrl={bundleUrl}
            exportName="Success"
            themeProps={{
              store,
              domain: PREVIEW_DOMAIN,
              order: store.products?.[0]
                ? { id: 'PREVIEW-0001', total: store.products[0].price, productName: store.products[0].name }
                : null,
            }}
          />
        )}

        {page !== 'home' && page !== 'product' && page !== 'cart' && page !== 'success' && (
          <ThemeRunner
            bundleUrl={bundleUrl}
            exportName="StaticPage"
            themeProps={{ store, domain: PREVIEW_DOMAIN, page, staticPage: page }}
          />
        )}
      </ThemeRunner>
    </div>
  )
}
