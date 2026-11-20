'use client';

// صفحة طلب الطقم الاحتياطية (للثيمات التي لا تصدّر Bundle): البانر ← المنتجات ← الملخص ← الاستمارة ← الطلب.
// المنطق كله في useBundleOrder (نفسه الذي تستعمله الثيمات من @mdstore/theme-kit).

import { AlertCircle, Building2, Home, ImageIcon, Loader2 } from 'lucide-react';
import { BundlePage, formatDA, unitPrice } from '@/lib/bundles';
import { firstImage, useBundleOrder } from './useBundleOrder';

interface Props {
  bundle: BundlePage;
  domain: string;
  storeId: string;
  userId: string;
  accent: string;
  language?: string;
}

export default function BundleOrder({ bundle, domain, storeId, userId, accent, language = 'ar' }: Props) {
  const o = useBundleOrder({ bundle, domain, store: { id: storeId, language, user: { id: userId } } });
  const { t, f, ar, digital, needsChoice, variantOf, pick, errors, original, price, form, chooseWilaya,
    wilayas, communes, loadingCommunes, wilaya, ship, placeName, submit, submitting } = o;
  const sel: Record<string, Record<string, string>> = Object.fromEntries(
    bundle.products.map((p) => [p.id, Object.fromEntries(o.attrsOf(p).map((a) => [a.name, o.chosen(p, a.name) ?? '']))]),
  );
  const setForm = (next: typeof form) => {
    if (next.name !== form.name) o.setName(next.name);
    if (next.phone !== form.phone) o.setPhone(next.phone);
    if (next.commune !== form.commune) o.setCommune(next.commune);
    if (next.ship !== form.ship) o.setShip(next.ship);
  };

  const banner = bundle.imageUrl || bundle.mobileImageUrl;
  // المسافات (margin/padding) في style لا في classes: بعض الثيمات تصفّرها لكل عناصرها (.cs-root * {margin:0;padding:0})
  // وهذه القاعدة تغلب utilities الـ Tailwind v4 (طبقات CSS) — فتختفي المسافات والتوسيط
  const field = 'w-full min-w-0 h-12 rounded-xl border bg-white text-base text-gray-900 outline-none focus:ring-2';
  const fieldPad = { paddingInline: 12 } as const;
  const col = (gap: number) => ({ display: 'flex', flexDirection: 'column', gap }) as const;
  const tint = `color-mix(in srgb, ${accent} 8%, #ffffff)`;

  return (
    <div className="w-full min-w-0 overflow-x-clip" dir={ar ? 'rtl' : 'ltr'} style={{ maxWidth: 1120, marginInline: 'auto', paddingBottom: 40 }}>
      {/* البانر */}
      <div className="relative w-full overflow-hidden bg-gray-100 aspect-[16/9] lg:aspect-[21/8] sm:rounded-3xl" style={{ marginTop: 16 }}>
        {banner
          ? (
            <picture className="block h-full w-full">
              {bundle.mobileImageUrl && <source media="(max-width: 640px)" srcSet={bundle.mobileImageUrl} />}
              <img src={banner} alt="" className="block h-full w-full object-cover" />
            </picture>
          )
          : <span className="flex h-full w-full items-center justify-center text-gray-300"><ImageIcon className="h-12 w-12" aria-hidden /></span>}
        <span className="absolute top-3 start-3 rounded-full bg-red-700 text-sm font-bold text-white" style={{ padding: '4px 12px' }}>-{bundle.discountPercent}%</span>
      </div>
      {/* الهاتف: عمود واحد — الكمبيوتر: المنتجات | الملخص والاستمارة */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start" style={{ columnGap: 24 }}>
      <div className="min-w-0">
      <div style={{ padding: '16px 16px 0', ...col(4) }}>
        <h1 className="text-2xl font-bold leading-snug">{bundle.name}</h1>
        {bundle.subtitle && <p className="text-sm text-gray-600">{bundle.subtitle}</p>}
      </div>

      {/* المنتجات */}
      <section id="bundle-items" style={{ padding: '20px 16px 0', ...col(12) }}>
        <h2 className="text-base font-bold">{t.inBundle}</h2>
        {bundle.products.map((p) => {
          const img = firstImage(p);
          const chosen = sel[p.id] ?? {};
          return (
            <div key={p.id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white text-gray-900" style={{ padding: 12 }}>
              {img ? <img src={img} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover bg-gray-100" /> : <span className="h-20 w-20 shrink-0 rounded-xl bg-gray-100" />}
              <div className="min-w-0 flex-1" style={col(8)}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold leading-snug">{p.name}</span>
                  <span className="shrink-0 text-sm text-gray-500">{formatDA(unitPrice(p, variantOf(p)?.id), language)}</span>
                </div>
                {needsChoice(p) && (p.attributes ?? []).filter((a) => a.variants?.length).map((a) => (
                  <div key={a.id} style={col(6)}>
                    <p className="text-xs font-semibold text-gray-600">{a.name}</p>
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${a.name} — ${p.name}`}>
                      {a.variants.map((v) => {
                        const on = chosen[a.name] === v.value;
                        const ring = { borderColor: on ? accent : '#e5e7eb', padding: 2 };
                        // نوع العرض: صورة (رابط) ← صورة مصغّرة؛ لون (كود) ← دائرة؛ وإلا نص
                        if (a.displayMode === 'image') {
                          return (
                            <button key={v.id} type="button" onClick={() => pick(p.id, a.name, v.value)} aria-label={`${a.name} ${a.variants.indexOf(v) + 1}`} aria-pressed={on}
                              className="h-12 w-12 overflow-hidden rounded-xl border-2" style={ring}>
                              <img src={/^https?:\/\//.test(v.name) ? v.name : v.value} alt="" className="h-full w-full rounded-lg object-cover" />
                            </button>
                          );
                        }
                        if (a.displayMode === 'color' || (a.type === 'color' && /^#|^rgb|^hsl/i.test(v.value))) {
                          return (
                            <button key={v.id} type="button" onClick={() => pick(p.id, a.name, v.value)} aria-label={v.name || v.value} aria-pressed={on}
                              className="h-11 w-11 rounded-full border-2" style={ring}>
                              <span className="block h-full w-full rounded-full border border-black/10" style={{ backgroundColor: v.value }} />
                            </button>
                          );
                        }
                        return (
                          <button key={v.id} type="button" onClick={() => pick(p.id, a.name, v.value)} aria-pressed={on}
                            className="min-h-11 min-w-12 rounded-xl border text-sm font-semibold"
                            style={{ paddingInline: 12, ...(on ? { backgroundColor: accent, borderColor: accent, color: '#fff' } : { borderColor: '#d1d5db', color: '#374151', backgroundColor: '#fff' }) }}>
                            {v.name || v.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {errors.options && <p className="flex items-center gap-1 text-sm font-medium text-red-600"><AlertCircle className="h-4 w-4" />{errors.options}</p>}
      </section>

      </div>

      <div className="min-w-0 lg:sticky lg:top-4" style={{ paddingTop: 4 }}>
      {/* الملخص */}
      <section className="rounded-2xl text-sm text-gray-900" style={{ margin: '16px 16px 0', padding: 16, backgroundColor: tint, ...col(6) }}>
        <div className="flex justify-between"><span>{t.original}</span><s className="text-gray-500">{formatDA(original, language)}</s></div>
        <div className="flex justify-between font-bold"><span>{t.bundlePrice}</span><span style={{ color: accent }}>{formatDA(price, language)}</span></div>
        <div className="flex justify-between font-semibold text-green-700"><span>{t.saved}</span><span>{formatDA(original - price, language)}</span></div>
      </section>

      {/* الاستمارة */}
      <form id="bundle-form" onSubmit={submit} style={{ padding: '20px 16px 0', ...col(12) }} noValidate>
        <label className="text-sm font-semibold" style={col(4)}>{f.fullName}
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={f.fullNamePlaceholder}
            className={field} style={{ ...fieldPad, borderColor: errors.name ? '#f87171' : '#d1d5db' }} autoComplete="name" />
          {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
        </label>
        <label className="text-sm font-semibold" style={col(4)}>{f.phone}
          <input type="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0550 123 456"
            className={`${field} ${ar ? 'text-right' : ''}`} style={{ ...fieldPad, borderColor: errors.phone ? '#f87171' : '#d1d5db' }} autoComplete="tel" />
          {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
        </label>

        {!digital && (
          <>
            <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <label className="min-w-0 text-sm font-semibold" style={col(4)}>{f.wilaya}
                <select value={form.wilaya} onChange={(e) => chooseWilaya(e.target.value)}
                  className={field} style={{ ...fieldPad, borderColor: errors.wilaya ? '#f87171' : '#d1d5db' }}>
                  <option value="">{f.selectWilaya}</option>
                  {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {placeName(w)}</option>)}
                </select>
                {errors.wilaya && <span className="text-xs text-red-600">{errors.wilaya}</span>}
              </label>
              <label className="min-w-0 text-sm font-semibold" style={col(4)}>{f.commune}
                <select value={form.commune} disabled={!form.wilaya || loadingCommunes} onChange={(e) => setForm({ ...form, commune: e.target.value })}
                  className={`${field} disabled:opacity-50`} style={{ ...fieldPad, borderColor: errors.commune ? '#f87171' : '#d1d5db' }}>
                  <option value="">{loadingCommunes ? f.loadingCommunes : form.wilaya ? f.selectCommune : f.selectWilayaFirst}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{placeName(c)}</option>)}
                </select>
                {errors.commune && <span className="text-xs text-red-600">{errors.commune}</span>}
              </label>
            </div>

            <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }} role="group" aria-label={f.deliveryType}>
              {(['home', 'office'] as const).map((type) => {
                const on = form.ship === type;
                const cost = wilaya ? (type === 'home' ? wilaya.livraisonHome : wilaya.livraisonOfice) : null;
                return (
                  <button key={type} type="button" onClick={() => setForm({ ...form, ship: type })} aria-pressed={on}
                    className="flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold text-gray-900"
                    style={{ paddingInline: 8, ...(on ? { borderColor: accent, backgroundColor: tint } : { borderColor: '#e5e7eb', backgroundColor: '#fff' }) }}>
                    {type === 'home' ? <Home className="h-4 w-4" aria-hidden /> : <Building2 className="h-4 w-4" aria-hidden />}
                    <span>{type === 'home' ? f.home : f.office}{cost !== null && ` · ${formatDA(Number(cost), language)}`}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* الإجمالي والطلب */}
        <div className="border-t border-gray-200" style={{ paddingTop: 16, ...col(10) }}>
          {!digital && (
            <p className="text-sm text-gray-600">{t.bundleWord} {formatDA(price, language)} + {t.delivery} {wilaya ? formatDA(ship, language) : '—'}</p>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold">{t.total}</span>
            <b className="text-2xl" style={{ color: accent }}>{formatDA(price + ship, language)}</b>
          </div>
          <button type="submit" disabled={submitting}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: accent }}>
            {submitting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}{submitting ? f.submitting : t.order}
          </button>
          <p className="text-center text-xs text-gray-500">{t.cod}</p>
        </div>
      </form>
      </div>
      </div>
    </div>
  );
}
