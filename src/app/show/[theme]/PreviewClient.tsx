'use client'

import { useEffect, useMemo, useState, type SyntheticEvent } from 'react'
import ThemeRunner from '@/components/ThemeRunner'
import { buildPreviewStore, PREVIEW_DOMAIN, PREVIEW_WILAYAS, PREVIEW_COMMUNES, type PreviewLang } from '@/lib/mock-preview-store'
import { installPreviewMockApi, setPreviewSearchLang } from '@/lib/preview-mock-api'
import type { Store } from '@/types/store'

const LANGS: { code: PreviewLang; label: string }[] = [
  { code: 'ar', label: 'AR' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
]

type PreviewPage = 'home' | 'product' | 'cart' | 'contact'
const PAGES: Record<PreviewLang, { code: PreviewPage; label: string }[]> = {
  ar: [
    { code: 'home', label: 'الرئيسية' },
    { code: 'product', label: 'صفحة المنتج' },
    { code: 'cart', label: 'السلة' },
    { code: 'contact', label: 'اتصل بنا' },
  ],
  fr: [
    { code: 'home', label: 'Accueil' },
    { code: 'product', label: 'Page produit' },
    { code: 'cart', label: 'Panier' },
    { code: 'contact', label: 'Contact' },
  ],
  en: [
    { code: 'home', label: 'Home' },
    { code: 'product', label: 'Product page' },
    { code: 'cart', label: 'Cart' },
    { code: 'contact', label: 'Contact' },
  ],
}

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

function PreviewBar({
  lang, onLangChange, page, onPageChange,
}: {
  lang: PreviewLang
  onLangChange: (l: PreviewLang) => void
  page: PreviewPage
  onPageChange: (p: PreviewPage) => void
}) {
  return (
    <div
      dir="ltr"
      style={{
        position: 'fixed',
        top: 0,
        insetInline: 0,
        zIndex: 1000000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexWrap: 'wrap',
        padding: '8px 16px',
        background: 'rgba(17,17,17,0.92)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', gap: 4 }}>
        {PAGES[lang].map(p => (
          <button
            key={p.code}
            type="button"
            onClick={() => onPageChange(p.code)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: page === p.code ? '#fff' : 'transparent',
              color: page === p.code ? '#111' : '#fff',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {LANGS.map(l => (
          <button
            key={l.code}
            type="button"
            onClick={() => onLangChange(l.code)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: lang === l.code ? '#fff' : 'transparent',
              color: lang === l.code ? '#111' : '#fff',
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function PreviewClient({ theme }: { theme: string }) {
  const [lang, setLang] = useState<PreviewLang>('fr')
  const [page, setPage] = useState<PreviewPage>('home')
  useEffect(() => installPreviewMockApi(), [])
  useBlockRealNavigation()
  useEffect(() => setPreviewSearchLang(lang), [lang])

  const store: Store = useMemo(() => buildPreviewStore(theme, lang), [theme, lang])
  useSeedPreviewCart(store)
  const bundleUrl = `/api/themes/${theme}`
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <>
      <div dir={dir} style={{ paddingTop: 44 }}>
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

          {page === 'contact' && (
            <ThemeRunner
              bundleUrl={bundleUrl}
              exportName="StaticPage"
              themeProps={{ store, domain: PREVIEW_DOMAIN, page: 'contact', staticPage: 'contact' }}
            />
          )}
        </ThemeRunner>
      </div>

      <PreviewBar lang={lang} onLangChange={setLang} page={page} onPageChange={setPage} />
    </>
  )
}
