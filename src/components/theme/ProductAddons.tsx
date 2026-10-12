// إضافات المنتج (مثلاً: جبن إضافي +100) — مشتركة بين الثيمات وتُدمج في bundle كل ثيم.
// الزبون يختار ما يشاء منها، وسعرها يُضاف لسعر الوحدة؛ الطلب يرسل addonIds والسيرفر يحفظ نسخة الاسم والسعر.
import type { CSSProperties } from 'react';

export type ProductAddon = { id: string; name: string; price: number | string; isActive?: boolean };
type ProductLike = { id?: string | number; addons?: ProductAddon[] | null };
type StoreLike = { language?: string | null; currency?: string | null } | null | undefined;

const STRINGS = {
  ar: { title: 'إضافات', free: 'مجاناً' },
  fr: { title: 'Suppléments', free: 'Gratuit' },
  en: { title: 'Add-ons', free: 'Free' },
};
const lang = (store: StoreLike) => (store?.language === 'fr' ? 'fr' : store?.language === 'en' ? 'en' : 'ar');

/** الإضافات المفعّلة فقط */
export const activeAddons = (product?: ProductLike | null): ProductAddon[] =>
  (product?.addons ?? []).filter((a) => a && a.isActive !== false && a.name);

/** مجموع أسعار الإضافات المختارة */
export const addonsTotal = (product: ProductLike | null | undefined, ids: string[]) => {
  const wanted = new Set(ids);
  return activeAddons(product).reduce((sum, a) => sum + (wanted.has(a.id) ? Number(a.price) || 0 : 0), 0);
};

/** أسماء الإضافات المختارة (للعرض في السلة) */
export const addonsLabel = (product: ProductLike | null | undefined, ids: string[] = []) => {
  const wanted = new Set(ids);
  return activeAddons(product).filter((a) => wanted.has(a.id)).map((a) => a.name).join('، ');
};

export function ProductAddons({ product, store, selected, onChange, accent = '#E63228', style }: {
  product: ProductLike;
  store?: StoreLike;
  selected: string[];
  onChange: (ids: string[]) => void;
  accent?: string;
  style?: CSSProperties;
}) {
  const list = activeAddons(product);
  if (!list.length) return null;
  const t = STRINGS[lang(store)];
  const currency = store?.currency || 'DZD';
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div style={{ marginBottom: '1rem', ...style }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>{t.title}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {list.map((a) => {
          const on = selected.includes(a.id);
          const price = Number(a.price) || 0;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a.id)}
              aria-pressed={on}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.55rem 0.9rem', borderRadius: 999,
                border: `2px solid ${on ? accent : '#E5DCCB'}`, background: on ? accent : '#fff', color: on ? '#fff' : 'inherit',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: 6, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${on ? '#fff' : '#CDBFA8'}`, background: on ? '#fff' : 'transparent', color: accent, fontSize: 12, lineHeight: 1,
              }}>{on ? '✓' : ''}</span>
              <span>{a.name}</span>
              <span dir="ltr" style={{ fontSize: '0.78rem', opacity: on ? 0.9 : 0.65 }}>
                {price ? `+${price.toLocaleString()} ${currency}` : t.free}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
