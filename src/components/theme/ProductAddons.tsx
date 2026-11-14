// إضافات المنتج (مثلاً: جبن إضافي +100) — مشتركة بين الثيمات وتُدمج في bundle كل ثيم.
// الزبون يختار ما يشاء منها، وسعرها يُضاف لسعر الوحدة؛ الطلب يرسل addonIds والسيرفر يحفظ نسخة الاسم والسعر.
// كمية لكل قطعة (حتى «أقصى كمية» عند التاجر) = تكرار المعرّف في addonIds.
import type { CSSProperties } from 'react';
import { activeAddons, addonCount, addonMax, setAddonCount, type ProductLike } from './addonPicks';

export { activeAddons, addonsTotal, addonsLabel, addonCount, addonMax, setAddonCount } from './addonPicks';
export type { ProductAddon } from './addonPicks';
type StoreLike = { language?: string | null; currency?: string | null } | null | undefined;

const STRINGS = {
  ar: { title: 'إضافات', free: 'مجاناً', less: 'إنقاص', more: 'زيادة' },
  fr: { title: 'Suppléments', free: 'Gratuit', less: 'Moins', more: 'Plus' },
  en: { title: 'Add-ons', free: 'Free', less: 'Less', more: 'More' },
};
const lang = (store: StoreLike) => (store?.language === 'fr' ? 'fr' : store?.language === 'en' ? 'en' : 'ar');

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

  return (
    <div style={{ marginBottom: '1rem', ...style }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>{t.title}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {list.map((a) => {
          // الكمية لكل قطعة = تكرار المعرّف في selected (الخادم يقرأ نفس الشكل)
          const n = Math.min(addonCount(selected, a.id), addonMax(a));
          const on = n > 0;
          const max = addonMax(a);
          const price = Number(a.price) || 0;
          const set = (k: number) => onChange(setAddonCount(selected, a, k));
          return (
            <span key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={() => set(on ? 0 : 1)}
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
            {/* «أقصى كمية لكل قطعة» > 1: − الكمية + */}
            {on && max > 1 && (
              <span dir="ltr" style={{ display: 'inline-flex', alignItems: 'center', border: `2px solid ${accent}`, borderRadius: 999, overflow: 'hidden', fontWeight: 800 }}>
                <button type="button" aria-label={t.less} onClick={() => set(n - 1)} style={qtyBtn(accent)}>−</button>
                <span aria-live="polite" style={{ minWidth: 26, textAlign: 'center', fontSize: '0.9rem' }}>{n}</span>
                <button type="button" aria-label={t.more} disabled={n >= max} onClick={() => set(n + 1)} style={{ ...qtyBtn(accent), opacity: n >= max ? 0.35 : 1 }}>+</button>
              </span>
            )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const qtyBtn = (accent: string): CSSProperties => ({
  width: 34, height: 34, border: 'none', background: 'transparent', color: accent, fontSize: '1.1rem', fontWeight: 800,
  cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1,
});
