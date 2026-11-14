// بطاقات العرض في صفحة المنتج: بطاقة لكل وحدة من الكمية، تحمل اسم العرض وسعره والمنتج،
// وتحتها قطع العرض، ولكل قطعة خياراتها (مقاس، لون…) وإضافاتها. مشتركة بين الثيمات (لون الثيم في accent).
import type { CSSProperties } from 'react';
import { ProductAddons } from './ProductAddons';
import { activeAddons } from './addonPicks';
import { valueAvailable, type Box, type Piece } from './orderPieces';

type Variant = { id?: string; name?: string; value: string };
type Attr = { id?: string; name: string; displayMode?: string; variants: Variant[] };
type StoreLike = { language?: string | null; currency?: string | null } | null | undefined;

const STRINGS = {
  ar: { piece: 'القطعة', card: 'الطلب' },
  fr: { piece: 'Pièce', card: 'Commande' },
  en: { piece: 'Piece', card: 'Order' },
};
const lang = (store: StoreLike) => (store?.language === 'fr' ? 'fr' : store?.language === 'en' ? 'en' : 'ar');
const isUrl = (v: string) => /^https?:\/\/|^\//.test(v);

/** هل تحتاج الصفحة بطاقات القطع (خيارات أو إضافات)؟ وإلا يكفي العرض والكمية */
export const needsPieces = (product: any) => !!(product?.attributes?.length || activeAddons(product).length);

export function OfferPieces({ product, store, accent = '#1D4ED8', offerId, boxes, onChange, onVariant, style }: {
  product: any;
  store?: StoreLike;
  accent?: string;
  offerId?: string | null;
  boxes: Box[];
  onChange: (boxes: Box[]) => void;
  /** آخر خيار تغيّر (لعرض صورة اللون في المعرض) */
  onVariant?: (attrName: string, value: string) => void;
  style?: CSSProperties;
}) {
  if (!needsPieces(product)) return null;
  const t = STRINGS[lang(store)];
  const currency = store?.currency || 'DZD';
  const offer = offerId ? product.offers?.find((o: any) => o.id === offerId) : undefined;
  const attrs: Attr[] = product.attributes ?? [];
  const thumb = product.images?.[0];

  const setPiece = (b: number, i: number, next: Piece) =>
    onChange(boxes.map((box, bi) => (bi !== b ? box : box.map((p, pi) => (pi === i ? next : p)))));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1rem', ...style }}>
      {boxes.map((box, b) => (
        <div key={b} data-offer-box style={{ border: `1.5px solid ${accent}`, borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
          {/* رأس البطاقة: صورة المنتج، اسم العرض (ورقم البطاقة)، السعر */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.7rem 0.9rem', background: `${accent}0D`, borderBottom: `1px solid ${accent}33` }}>
            {thumb && <img src={thumb} alt="" loading="lazy" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#111' }}>
                {offer?.name || t.card}{boxes.length > 1 && <span style={{ color: accent }}> ({b + 1})</span>}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#777', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
            </div>
            {offer && (
              <span dir="ltr" style={{ fontWeight: 800, color: accent, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                {Number(offer.price).toLocaleString()} {currency}
              </span>
            )}
          </div>

          {/* القطع: خيارات كل قطعة ثم إضافاتها */}
          {box.map((piece, i) => (
            <div key={i} style={{ padding: '0.75rem 0.9rem', borderTop: i ? '1px dashed #E5E7EB' : 'none' }}>
              {box.length > 1 && <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 800, color: accent }}>{t.piece} {i + 1}</p>}
              {attrs.map((attr) => {
                const chosen = attr.variants.find((v) => v.value === piece.variants[attr.name]);
                return (
                  <div key={attr.id ?? attr.name} style={{ marginBottom: '0.6rem' }}>
                    <p style={{ margin: '0 0 0.35rem', fontSize: '0.78rem', fontWeight: 700, color: '#333' }}>
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
                              ...common, width: 30, height: 30, borderRadius: '50%', border: '1px solid #ddd', padding: 0,
                              background: isUrl(v.value) ? `url(${v.value}) center/cover` : v.value,
                              outline: `2.5px solid ${on ? accent : 'transparent'}`, outlineOffset: 2,
                            } : attr.displayMode === 'image' ? {
                              ...common, width: 52, height: 52, borderRadius: 8, padding: 0, background: `url(${v.value}) center/cover`,
                              border: `2.5px solid ${on ? accent : '#E5E7EB'}`,
                            } : {
                              ...common, padding: '0.4rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
                              border: `1.5px solid ${on ? accent : '#E5E7EB'}`, background: on ? `${accent}12` : '#fff',
                              color: on ? accent : '#444', textDecoration: ok ? 'none' : 'line-through',
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
          ))}
        </div>
      ))}
    </div>
  );
}
