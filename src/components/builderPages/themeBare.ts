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
