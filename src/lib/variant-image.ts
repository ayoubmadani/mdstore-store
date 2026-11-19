// ربط الخيار بصورة المنتج: اختيار الخيار يعرض صورته، والضغط على الصورة يختار خيارها.
// خيار «صورة» (قيمته رابط الصورة) لا يحتاج ربطاً: صورته نفسها تُعرض — والربط اليدوي يبقى أولى.

type Attr = { name: string; variants?: { value: string; imageUrl?: string | null }[] };

const isPicture = (v: string) => /^https?:\/\//i.test(String(v || ''));

/** الصورة التي يعرضها هذا الخيار: صورته المربوطة، وإلا صورته هو إن كان خيار «صورة» */
const pictureOf = (v: { value: string; imageUrl?: string | null } | undefined): string | null =>
  !v ? null : v.imageUrl || (isPicture(v.value) ? v.value : null);

/** موضع صورة الخيار المختار في معرض المنتج، أو -1 */
export function imageIndexForSelection(attributes: Attr[] | undefined, selected: Record<string, string>, images: string[]): number {
  for (const a of attributes || []) {
    const url = pictureOf(a.variants?.find((v) => v.value === selected[a.name]));
    const i = url ? images.indexOf(url) : -1;
    if (i >= 0) return i;
  }
  return -1;
}

/** الخيار الذي يعرض هذه الصورة (لاختياره عند الضغط عليها)، أو null */
export function variantForImage(attributes: Attr[] | undefined, url: string): { name: string; value: string } | null {
  for (const a of attributes || []) {
    const v = a.variants?.find((x) => pictureOf(x) === url);
    if (v) return { name: a.name, value: v.value };
  }
  return null;
}

/** معرض المنتج + صور خيارات «صورة» غير المربوطة التي ليست فيه (بعد صور المنتج) — ليعرضها اختيار الخيار */
export function withOptionImages(images: string[], attributes: Attr[] | undefined): string[] {
  const out = [...images];
  for (const a of attributes || []) {
    for (const v of a.variants || []) {
      if (!v.imageUrl && isPicture(v.value) && !out.includes(v.value)) out.push(v.value);
    }
  }
  return out;
}
