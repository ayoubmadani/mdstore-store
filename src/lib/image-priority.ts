// أولوية تحميل صور صفحة الهبوط: صورة أول قسم (أكبر عنصر يراه الزائر — LCP) تُجلب أولاً،
// وكل صورة بعدها تُؤجَّل حتى تقترب من الشاشة، فلا تزاحمها على شبكة الجوال.
type Block = { type: string; props?: Record<string, any> | null };

/** موضع أول قسم يعرض صورة؛ ‎-1 إن لم يوجد، أو إن سبقه قسم «المنتج بثيم المتجر» (صوره هو تأتي أولاً) */
export function firstImageBlock(tree: Block[] | undefined | null): number {
  for (const [i, b] of (tree ?? []).entries()) {
    if (b.type === 'themeProduct') return -1;
    if (b.type === 'image' && b.props?.src) return i;
    if (b.type === 'productImages' && Array.isArray(b.props?.images) && b.props.images.length) return i;
  }
  return -1;
}

export function imgLoading(first: boolean): { fetchPriority?: 'high'; loading?: 'lazy'; decoding: 'async' } {
  return first ? { fetchPriority: 'high', decoding: 'async' } : { loading: 'lazy', decoding: 'async' };
}
