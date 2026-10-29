// ربط اللون بصورة المنتج: اختيار اللون يعرض صورته، والضغط على الصورة يختار لونها

type Attr = { name: string; variants?: { value: string; imageUrl?: string | null }[] };

/** موضع صورة اللون المختار في معرض المنتج، أو -1 */
export function imageIndexForSelection(attributes: Attr[] | undefined, selected: Record<string, string>, images: string[]): number {
  for (const a of attributes || []) {
    const url = a.variants?.find((v) => v.value === selected[a.name])?.imageUrl;
    const i = url ? images.indexOf(url) : -1;
    if (i >= 0) return i;
  }
  return -1;
}

/** اللون المربوط بهذه الصورة (لاختياره عند الضغط عليها)، أو null */
export function variantForImage(attributes: Attr[] | undefined, url: string): { name: string; value: string } | null {
  for (const a of attributes || []) {
    const v = a.variants?.find((x) => x.imageUrl && x.imageUrl === url);
    if (v) return { name: a.name, value: v.value };
  }
  return null;
}
