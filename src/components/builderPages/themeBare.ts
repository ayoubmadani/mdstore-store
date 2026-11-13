// صفحة المنتج بثيم المتجر خارج المتجر (دومين المنتج، أو قسم «المنتج بثيم المتجر» في صفحة المحرر):
// غلاف الثيم (خلفيته وتنسيقه) بلا رأس المتجر وتذييله — كل ما بجانب <main> — ولا مسافة الرأس فوق <main>،
// وطلب مباشر فقط: السلة تُعامل كأنها معطّلة، و[data-add-to-cart] مخفي احتياطاً

export const BARE_CSS =
  '.mds-bare :has(> main) > :not(main):not(style){display:none!important}' +
  '.mds-bare main{padding-top:0!important}' +
  '.mds-bare [data-add-to-cart]{display:none!important}' +
  // داخل صفحة المحرر: لا يأخذ الغلاف ارتفاع الشاشة كاملة
  '.mds-embed :has(> main){min-height:0!important}.mds-embed main{min-height:0!important}' +
  // داخل صفحة المحرر: خلفية الصفحة (أو لون القسم) بدل خلفية الثيم
  '.mds-embed :has(> main),.mds-embed main{background:transparent!important}'

/** المنتج والمتجر بسلة معطّلة ← نموذج الطلب يظهر مباشرة في كل الثيمات */
export function cartOff<P extends { store?: any }, S>(product: P, store: S): { product: P; store: S } {
  return {
    product: { ...product, store: { ...(product.store ?? {}), cart: false } },
    store: { ...(store as any), cart: false },
  }
}

/** طلبات الثيم من داخل صفحة المحرر تُنسب لها (إحصائيات الصفحة واختبار A/B) */
export function withPageAttribution(url: string | undefined, method: string | undefined, data: unknown, builderPageId: string, splitTestId?: string | null) {
  if (String(method).toLowerCase() !== 'post' || !/\/orders(\/create)?\/?$/.test(url ?? '')) return data
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data
  return { ...(data as object), builderPageId, ...(splitTestId ? { splitTestId } : {}) }
}

/**
 * CSS الثيم داخل صفحة هبوط بعرض maxWidth: قواعد الشاشة تُحسب كأن الشاشة لا تتجاوز maxWidth
 * (عمود واحد كما على الهاتف/الصفحة الضيقة) — min-width أكبر منه لا يتحقق أبداً، وmax-width ≥ منه يتحقق دائماً
 */
export function capMediaQueries(css: string, maxWidth: number): string {
  return css.replace(/\((min|max)-width:(\s*)(\d+(?:\.\d+)?)px\)/g, (all, kind: string, sp: string, n: string) => {
    const px = Number(n)
    if (kind === 'min' && px > maxWidth) return `(min-width:${sp}99999px)`
    if (kind === 'max' && px >= maxWidth) return `(min-width:${sp}0px)`
    return all
  })
}

/** سياق صفحة الهبوط لطلب أرسله الثيم من قسم «المنتج بثيم المتجر» ← صفحة «شكراً» الموحدة لصفحات الهبوط */
export const LANDING_CTX_KEY = 'mds_landing_ctx'

type LandingCtxInput = {
  builderPageId: string
  productId?: string
  backUrl?: string
  language?: string
  pixels?: unknown[]
  accent?: string
  section?: string
}

export function landingContextFromOrder(page: LandingCtxInput, order: { quantity?: number; customerName?: string; customerPhone?: string; productImage?: string }) {
  const clean = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')) as T
  return clean({
    builderPageId: page.builderPageId,
    productId: page.productId,
    backUrl: page.backUrl,
    language: page.language,
    pixels: page.pixels,
    productImage: order.productImage,
    quantity: order.quantity,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    colors: clean({ accent: page.accent, section: page.section }),
  })
}

/**
 * طلب بلا سياق صفحة هبوط + سياق محفوظ حديث (30 دقيقة) ← الطلب مع السياق.
 * بعض الثيمات لا تحفظ last_order أصلاً ← الطلب من السياق نفسه (رقمه ومبلغه)
 */
export function withLandingContext<O extends { landing?: unknown }>(
  order: O | null,
  saved: { at: number; landing: unknown; order?: { id?: string; total?: number } } | null,
  now = Date.now(),
): O | (Record<string, unknown> & { landing: unknown }) | null {
  const fresh = !!saved?.landing && now - saved.at <= 30 * 60_000
  if (!order) return fresh ? { ...(saved!.order ?? {}), landing: saved!.landing } : null
  if (order.landing || !fresh) return order
  // last_order قديم من طلب سابق ممكن: رقم الطلب ومبلغه من السياق الأحدث
  return { ...order, ...(saved!.order ?? {}), landing: saved!.landing }
}
