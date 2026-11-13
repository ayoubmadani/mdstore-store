// مفاتيح طلب المتجر بشكل موحّد: «بلا فلاتر» و«الصفحة 1» طلب واحد،
// فيتشارك الـ layout والصفحة الرئيسية استدعاءً واحداً للـ API (انظر store-request.ts)
export function storeArgs(category?: string, search?: string, page?: string): [string, string, string] {
  return [category || '', search || '', !page || page === '1' ? '' : page];
}
