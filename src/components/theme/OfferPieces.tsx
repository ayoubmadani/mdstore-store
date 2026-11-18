// بطاقات العرض في صفحة المنتج: بطاقة لكل وحدة من الكمية، تحمل اسم العرض وسعره والمنتج،
// وتحتها قطع العرض، ولكل قطعة خياراتها (مقاس، لون…) وإضافاتها. مشتركة بين الثيمات (لون الثيم في accent).
import { useState, type CSSProperties } from 'react';
import { ProductAddons } from './ProductAddons';
import { activeAddons } from './addonPicks';
import { valueAvailable, type Box, type Piece } from './orderPieces';

type Variant = { id?: string; name?: string; value: string };
type Attr = { id?: string; name: string; displayMode?: string; variants: Variant[] };
type StoreLike = { language?: string | null; currency?: string | null } | null | undefined;

const STRINGS = {
  ar: { piece: 'القطعة', card: 'الطلب', edit: 'تعديل', done: 'تم' },
  fr: { piece: 'Pièce', card: 'Commande', edit: 'Modifier', done: 'OK' },
  en: { piece: 'Piece', card: 'Order', edit: 'Edit', done: 'Done' },
};
const lang = (store: StoreLike) => (store?.language === 'fr' ? 'fr' : store?.language === 'en' ? 'en' : 'ar');
const isUrl = (v: string) => /^https?:\/\/|^\//.test(v);

/** هل تحتاج الصفحة بطاقات القطع (خيارات أو إضافات)؟ وإلا يكفي العرض والكمية */
export const needsPieces = (product: any) => !!(product?.attributes?.length || activeAddons(product).length);

export function OfferPieces({ product, store, accent = '#1D4ED8', offerId, boxes, onChange, onVariant, style, headless = false, dark = false }: {
  product: any;
  store?: StoreLike;
  accent?: string;
  offerId?: string | null;
  boxes: Box[];
  onChange: (boxes: Box[]) => void;
  /** آخر خيار تغيّر (لعرض صورة اللون في المعرض) */
  onVariant?: (attrName: string, value: string) => void;
  style?: CSSProperties;
  /** السلة: سطور القطع فقط، بلا رأس البطاقة ولا إطارها */
  headless?: boolean;
  /** ثيم داكن: خلفيات ونصوص فاتحة على داكن */
  dark?: boolean;
}) {
  const C = dark
    ? { card: '#1C1C1C', text: '#F0F0F0', sub: '#AAAAAA', chip: '#2A2A2A', chipText: '#E5E5E5', line: '#2E2E2E', ring: '#444', optText: '#DDDDDD' }
    : { card: '#fff', text: '#111', sub: '#777', chip: '#F3F4F6', chipText: '#333', line: '#E5E7EB', ring: '#ddd', optText: '#444' };
  // البطاقة مطوية: ملخص خيارات كل قطعة + زر «تعديل ▾» يفتح الخيارات تحتها
  // المفتوح: «بطاقة-قطعة» — كل قطعة لها زر تعديل يفتح خياراتها هي فقط
  const [open, setOpen] = useState<string[]>([]);
  if (!needsPieces(product)) return null;
  const t = STRINGS[lang(store)];
  const keyOf = (b: number, i: number) => `${b}-${i}`;
  const toggle = (k: string) => setOpen((o) => (o.includes(k) ? o.filter((x) => x !== k) : [...o, k]));
  const addons = activeAddons(product);
  // ملخص القطعة: «L · أزرق · test ×2» (اللون باسمه وبنقطة لونه)
  const summary = (piece: Piece) => (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      {attrs.map((attr) => {
        const v = attr.variants.find((x) => x.value === piece.variants[attr.name]);
        if (!v) return null;
        const dot = attr.displayMode === 'color' ? <span style={{ width: 12, height: 12, borderRadius: '50%', display: 'inline-block', border: `1px solid ${C.ring}`, background: isUrl(v.value) ? `url(${v.value}) center/cover` : v.value }} /> : null;
        return <span key={attr.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: C.chip, fontSize: '0.78rem', fontWeight: 700, color: C.chipText }}>{dot}{v.name && v.name !== v.value ? v.name : attr.displayMode === 'color' ? '' : v.value}</span>;
      })}
      {addons.filter((a) => piece.addonIds.includes(a.id)).map((a) => {
        const n = piece.addonIds.filter((x) => x === a.id).length;
        return <span key={a.id} style={{ padding: '2px 8px', borderRadius: 999, background: `${accent}14`, color: accent, fontSize: '0.78rem', fontWeight: 700 }}>+ {a.name}{n > 1 ? ` ×${n}` : ''}</span>;
      })}
    </span>
  );
  const currency = store?.currency || 'DZD';
  const offer = offerId ? product.offers?.find((o: any) => o.id === offerId) : undefined;
  const attrs: Attr[] = product.attributes ?? [];
  const thumb = product.images?.[0];

  const setPiece = (b: number, i: number, next: Piece) =>
    onChange(boxes.map((box, bi) => (bi !== b ? box : box.map((p, pi) => (pi === i ? next : p)))));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1rem', ...style }}>
      {boxes.map((box, b) => (
        <div key={b} data-offer-box style={headless ? {} : { border: `1.5px solid ${accent}`, borderRadius: 12, background: C.card, overflow: 'hidden' }}>
          {/* رأس البطاقة: صورة المنتج، اسم العرض (ورقم البطاقة)، السعر — لا يظهر في السلة */}
          {!headless && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.7rem 0.9rem', background: `${accent}0D`, borderBottom: `1px solid ${accent}33` }}>
            {thumb && <img src={thumb} alt="" loading="lazy" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: C.text }}>
                {offer?.name || t.card}{boxes.length > 1 && <span style={{ color: accent }}> ({b + 1})</span>}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
            </div>
            {offer && (
              <span dir="ltr" style={{ fontWeight: 800, color: accent, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                {Number(offer.price).toLocaleString()} {currency}
              </span>
            )}
          </div>
          )}

          {/* كل قطعة: ملخص خياراتها + زر «تعديل ▾» يفتح خياراتها هي تحتها */}
          {box.map((piece, i) => {
            const k = keyOf(b, i);
            const isOpen = open.includes(k);
            return (
              <div key={i} style={{ borderTop: i ? `1px dashed ${C.line}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 0.9rem' }}>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {box.length > 1 && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: accent }}>{t.piece} {i + 1}:</span>}
                    {summary(piece)}
                  </div>
                  <button type="button" data-offer-edit onClick={() => toggle(k)} aria-expanded={isOpen}
                    style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.75rem', borderRadius: 8, border: `1.5px solid ${accent}`, background: isOpen ? `${accent}14` : 'transparent', color: accent, fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t.edit}
                    <span aria-hidden="true" style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                  </button>
                </div>
                {isOpen && (
                  <div style={{ padding: '0.2rem 0.9rem 0.8rem', background: `${accent}06` }}>
                    {attrs.map((attr) => {
                      const chosen = attr.variants.find((v) => v.value === piece.variants[attr.name]);
                      return (
                        <div key={attr.id ?? attr.name} style={{ marginBottom: '0.6rem' }}>
                          <p style={{ margin: '0 0 0.35rem', fontSize: '0.78rem', fontWeight: 700, color: C.chipText }}>
                            {attr.name}
                            {(attr.displayMode === 'color' || attr.displayMode === 'image') && chosen?.name && chosen.name !== chosen.value
                              ? <span style={{ color: accent, fontWeight: 600 }}> : {chosen.name}</span> : null}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {attr.variants.map((v) => {
                              const on = piece.variants[attr.name] === v.value;
                              const ok = valueAvailable(product, piece.variants, attr.name, v.value);
                              const pick = () => {
                                if (!ok) return;
                                setPiece(b, i, { ...piece, variants: { ...piece.variants, [attr.name]: v.value } });
                                onVariant?.(attr.name, v.value);
                              };
                              const common: CSSProperties = { cursor: ok ? 'pointer' : 'not-allowed', opacity: ok ? 1 : 0.35, fontFamily: 'inherit' };
                              return (
                                <button key={v.id ?? v.value} type="button" onClick={pick} aria-pressed={on} disabled={!ok}
                                  aria-label={v.name || v.value} title={v.name && v.name !== v.value ? v.name : undefined}
                                  style={attr.displayMode === 'color' ? {
                                    ...common, width: 30, height: 30, borderRadius: '50%', border: `1px solid ${C.ring}`, padding: 0,
                                    background: isUrl(v.value) ? `url(${v.value}) center/cover` : v.value,
                                    outline: `2.5px solid ${on ? accent : 'transparent'}`, outlineOffset: 2,
                                  } : attr.displayMode === 'image' ? {
                                    ...common, width: 52, height: 52, borderRadius: 8, padding: 0, background: `url(${v.value}) center/cover`,
                                    border: `2.5px solid ${on ? accent : C.line}`,
                                  } : {
                                    ...common, padding: '0.4rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
                                    border: `1.5px solid ${on ? accent : C.line}`, background: on ? `${accent}12` : 'transparent',
                                    color: on ? accent : C.optText, textDecoration: ok ? 'none' : 'line-through',
                                  }}>
                                  {attr.displayMode !== 'color' && attr.displayMode !== 'image' && (v.name || v.value)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <ProductAddons product={product} store={store} accent={accent} style={{ marginBottom: 0 }}
                      selected={piece.addonIds} onChange={(ids) => setPiece(b, i, { ...piece, addonIds: ids })} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
