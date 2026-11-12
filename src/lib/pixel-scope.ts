// أي بيكسل يعمل في أي صفحة:
//  - المتجر: بيكسلات المتجر
//  - صفحة منتج (أو دومين منتج): بيكسلات هذا المنتج
//  - صفحة هبوط: بيكسلاتها، وبيكسلات منتجها (بيكسل المنتج يعمل في كل صفحات هبوط المنتج)
export type PixelScopeCtx = { pageType: 'store' | 'landing_page' | 'product'; landingPageId?: string; productId?: string | null }
type ScopedPixel = { scope?: string | null; productId?: string | null; builderPageId?: string | null; landingPageId?: string | null }

export function pixelInScope(pixel: ScopedPixel, { pageType, landingPageId, productId }: PixelScopeCtx): boolean {
  const scope = pixel.scope ?? 'store'
  if (pageType === 'store') return scope === 'store'
  if (scope === 'product') return !!productId && pixel.productId === productId
  if (pageType === 'product') return false
  // landing_page-scoped pixels carry exactly one of these two FKs (old LandingPage module or the page-builder editor)
  return scope === 'landing_page' && (pixel.builderPageId ?? pixel.landingPageId) === landingPageId
}
