// أبعاد الصورة من أول بايتاتها (WebP/PNG/JPEG/GIF) — على الخادم قبل الرندر،
// حتى يحجز المتصفح مكان الصورة من البداية فلا «تقفز» الصفحة عند وصولها (CLS).

export type Size = { width: number; height: number };

const ascii = (b: Uint8Array, at: number, s: string) => [...s].every((c, i) => b[at + i] === c.charCodeAt(0));
const le16 = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8);
const le24 = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
const be16 = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1];
const be32 = (b: Uint8Array, i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const ok = (width: number, height: number): Size | null => (width > 0 && height > 0 ? { width, height } : null);

export function imageSize(b: Uint8Array): Size | null {
  if (b.length < 30) return null;
  if (b[0] === 0x89 && ascii(b, 1, 'PNG')) return ok(be32(b, 16), be32(b, 20));
  if (ascii(b, 0, 'GIF8')) return ok(le16(b, 6), le16(b, 8));
  if (ascii(b, 0, 'RIFF') && ascii(b, 8, 'WEBP')) {
    if (ascii(b, 12, 'VP8 ')) return ok(le16(b, 26) & 0x3fff, le16(b, 28) & 0x3fff);
    if (ascii(b, 12, 'VP8L')) return ok(1 + (b[21] | ((b[22] & 0x3f) << 8)), 1 + ((b[22] >> 6) | (b[23] << 2) | ((b[24] & 0x0f) << 10)));
    if (ascii(b, 12, 'VP8X')) return ok(1 + le24(b, 24), 1 + le24(b, 27));
    return null;
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return ok(be16(b, i + 7), be16(b, i + 5));
      if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01 || m === 0xff) { i += m === 0xff ? 1 : 2; continue; }
      i += 2 + be16(b, i + 2);
    }
  }
  return null;
}

// أول 64KB تكفي لكل الصيغ (JPEG قد يسبق أبعادَه EXIF)
const HEAD_BYTES = 65536;

export async function fetchHead(url: string): Promise<Uint8Array> {
  const res = await fetch(url, { headers: { Range: `bytes=0-${HEAD_BYTES - 1}` }, signal: AbortSignal.timeout(1500), cache: 'force-cache' });
  if (!res.ok) throw new Error(`image ${res.status}`);
  return new Uint8Array(await res.arrayBuffer()).slice(0, HEAD_BYTES);
}

// أسماء الصور فريدة (UUID) ولا تتغير: نحفظ الأبعاد في الذاكرة طول حياة الخادم
const cache = new Map<string, Size | null>();

async function sizeOf(url: string, head: (u: string) => Promise<Uint8Array>) {
  if (cache.has(url)) return cache.get(url)!;
  try {
    const s = imageSize(await head(url));
    if (cache.size > 5000) cache.clear();
    cache.set(url, s);
    return s;
  } catch {
    return null; // فشل مؤقت: لا نحفظه، والصورة تُعرض كما كانت
  }
}

type Block = { type: string; props?: Record<string, any> };

/** صور صفحة المنشئ بلا ارتفاع محدد ← تأخذ أبعادها الحقيقية (naturalWidth/naturalHeight) */
export async function withImageSizes<P extends { tree: Block[] }>(page: P, head = fetchHead): Promise<P> {
  const need = page.tree.filter((b) => b.type === 'image' && b.props?.src && !b.props.height);
  const urls = [...new Set(need.map((b) => String(b.props!.src)))];
  const sizes = new Map(await Promise.all(urls.map(async (u) => [u, await sizeOf(u, head)] as const)));
  return {
    ...page,
    tree: page.tree.map((b) => {
      const s = b.type === 'image' && !b.props?.height ? sizes.get(String(b.props?.src)) : null;
      return s ? { ...b, props: { ...b.props, naturalWidth: s.width, naturalHeight: s.height } } : b;
    }),
  };
}
