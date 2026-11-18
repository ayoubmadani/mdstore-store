// سطر منتج في السلة، مشترك بين الثيمات (لون الثيم في accent، و dark للثيمات الداكنة):
// - بطاقة عرض: صورة + شارة تغيير العرض + اسم المنتج + السعر + نسخ + حذف، وتحتها خيارات كل قطعة (قابلة للتعديل)
// - منتج عادي: صورة + الاسم + شارة العرض + السعر + الكمية + خياراته، مع نسخ وحذف
import type { ReactNode } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { addonsTotal } from './ProductAddons';
import { OfferPieces, needsPieces } from './OfferPieces';
import { applyCartPieces, cartPieces, changeCartOffer, cartOrderItems } from './orderPieces';

export { cartOrderItems };

type StoreLike = { language?: string | null; currency?: string | null } | null | undefined;

const STRINGS = {
  ar: { noOffer: 'بدون عرض', copy: 'نسخ', remove: 'حذف', qty: 'الكمية', offer: 'العرض' },
  fr: { noOffer: 'Sans offre', copy: 'Dupliquer', remove: 'Supprimer', qty: 'Quantité', offer: 'Offre' },
  en: { noOffer: 'No offer', copy: 'Duplicate', remove: 'Remove', qty: 'Quantity', offer: 'Offer' },
};
const lang = (store: StoreLike) => (store?.language === 'fr' ? 'fr' : store?.language === 'en' ? 'en' : 'ar');
const imageOf = (item: any) => item.product?.imagesProduct?.[0]?.imageUrl || item.product?.productImage;

export function CartItemCard({ item, index, items, update, store, accent, dark = false }: {
  item: any;
  index: number;
  items: any[];
  update: (next: any[]) => void;
  store: StoreLike;
  accent: string;
  dark?: boolean;
}) {
  const t = STRINGS[lang(store)];
  const C = dark
    ? { text: '#F0F0F0', sub: '#999', line: '#2E2E2E', icon: '#777', head: `${accent}14` }
    : { text: '#111', sub: '#888', line: '#F0F0F0', icon: '#9ca3af', head: `${accent}0D` };
  const currency = store?.currency || 'DZD';
  const price = (v: number) => `${Number(v || 0).toLocaleString()} ${currency}`;
  const addons = (ids: string[]) => addonsTotal(item.product, ids);
  const set = (next: any) => update(items.map((x, idx) => (idx === index ? next : x)));
  const duplicate = () => update([...items.slice(0, index + 1), JSON.parse(JSON.stringify({ ...item, addedAt: Date.now() })), ...items.slice(index + 1)]);
  const remove = () => update(items.filter((_, idx) => idx !== index));
  const isBox = !!item.offerBox?.lines?.length;

  const iconBtn = (label: string, onClick: () => void, icon: ReactNode) => (
    <button type="button" aria-label={label} title={label} onClick={onClick}
      style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.icon, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
      {icon}
    </button>
  );

  // شارة العرض: تغيّر عرض هذا السطر (one ↔ tow، أو بدون عرض)
  const offerPill = item.product?.offers?.length > 0 && (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select aria-label={t.offer} value={item.selectedOffer || ''}
        onChange={(e) => set(changeCartOffer(item, item.product, e.target.value || null, addons))}
        style={{ appearance: 'none', WebkitAppearance: 'none', borderRadius: 999, border: '1px solid #f59e0b', background: dark ? '#3a2a06' : '#fffbeb', color: dark ? '#fbbf24' : '#b45309', padding: '2px 22px 2px 10px', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
        <option value="">{t.noOffer}</option>
        {item.product.offers.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <span aria-hidden="true" style={{ position: 'absolute', insetInlineEnd: 8, fontSize: 9, color: dark ? '#fbbf24' : '#b45309', pointerEvents: 'none' }}>▾</span>
    </span>
  );

  if (isBox) {
    const offer = item.product?.offers?.find((o: any) => o.id === item.selectedOffer);
    return (
      <div data-cart-item style={{ padding: '0.75rem', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ border: `1.5px solid ${accent}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 0.75rem', background: C.head }}>
            <img src={imageOf(item)} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {offerPill || <p style={{ margin: 0, fontWeight: 800, color: C.text, fontSize: '0.85rem' }}>{offer?.name || item.product?.name}</p>}
              <p style={{ margin: 0, fontSize: '0.72rem', color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name}</p>
            </div>
            <span dir="ltr" style={{ fontWeight: 800, color: accent, whiteSpace: 'nowrap' }}>{price(item.finalPrice)}</span>
            {iconBtn(t.copy, duplicate, <Copy size={16} />)}
            {iconBtn(t.remove, remove, <Trash2 size={16} />)}
          </div>
          <div style={{ padding: '0 0.75rem' }}>
            <OfferPieces headless dark={dark} product={item.product} store={store} accent={accent} offerId={item.selectedOffer}
              boxes={[cartPieces(item)]} style={{ marginBottom: 0 }}
              onChange={(b) => set(applyCartPieces(item, item.product, b[0], addons))} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-cart-item style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: `1px solid ${C.line}` }}>
      <img src={imageOf(item)} alt="" style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ margin: '0 0 0.25rem', fontWeight: 600, color: C.text, fontSize: '0.875rem', lineHeight: 1.4 }}>{item.product?.name}</h4>
        {offerPill && <div style={{ marginBottom: '0.25rem' }}>{offerPill}</div>}
        <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: accent }}><span dir="ltr">{price(item.finalPrice)}</span></p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: C.sub }}>{t.qty}: {item.quantity}</p>
        {needsPieces(item.product) && (
          <OfferPieces headless dark={dark} product={item.product} store={store} accent={accent} offerId={null}
            boxes={[cartPieces(item)]} style={{ marginBottom: 0, marginTop: '0.5rem' }}
            onChange={(b) => set(applyCartPieces(item, item.product, b[0], addons))} />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {iconBtn(t.copy, duplicate, <Copy size={16} />)}
        {iconBtn(t.remove, remove, <Trash2 size={17} />)}
      </div>
    </div>
  );
}
