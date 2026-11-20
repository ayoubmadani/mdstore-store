'use client';

// صفحة طلب الطقم: البانر ← المنتجات (اختيار الخيارات لكل منتج) ← الملخص ← الاستمارة ← الإجمالي ← الطلب.
// الطلب يُرسل منتجات الطقم مع bundleId، والخادم يحسب الأسعار بخصم الطقم (لا يعتمد على ما نعرضه هنا).

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AlertCircle, Building2, Home, ImageIcon, Loader2 } from 'lucide-react';
import { isValidDzPhone } from '@/components/theme/kit';
import { getProductFormStrings } from '@/components/productForm/translations';
import {
  BundlePage, BundleProduct, bundleStrings, discounted, formatDA, matchVariant, unitPrice,
} from '@/lib/bundles';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

interface Wilaya { id: string; ar_name: string; name?: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number }
interface Commune { id: string; ar_name: string; name?: string }

interface Props {
  bundle: BundlePage;
  domain: string;
  storeId: string;
  userId: string;
  accent: string;
  language?: string;
}

const firstImage = (p: BundleProduct) => [...(p.imagesProduct || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.imageUrl;

export default function BundleOrder({ bundle, domain, storeId, userId, accent, language = 'ar' }: Props) {
  const t = bundleStrings(language);
  const f = getProductFormStrings(language);
  const router = useRouter();
  const ar = language === 'ar';
  const digital = bundle.products.every((p) => p.isDigital);

  /* ── الخيارات: لكل منتج { اسم الخاصية: القيمة } ── */
  const [sel, setSel] = useState<Record<string, Record<string, string>>>({});
  const pick = (pid: string, attr: string, value: string) => setSel((s) => ({ ...s, [pid]: { ...s[pid], [attr]: value } }));
  const needsChoice = (p: BundleProduct) => (p.attributes ?? []).some((a) => a.variants?.length) && !!p.variantDetails?.length;
  const variantOf = (p: BundleProduct) => (needsChoice(p) ? matchVariant(p, sel[p.id] ?? {}) : undefined);

  const bases = bundle.products.map((p) => unitPrice(p, variantOf(p)?.id));
  const original = bases.reduce((a, b) => a + b, 0);
  const price = discounted(original, bundle.discountPercent);

  /* ── التوصيل ── */
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', wilaya: '', commune: '', ship: 'home' as 'home' | 'office' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (digital || !userId) return;
    axios.get(`${API_URL}/shipping/public/get-shipping/${userId}?storeId=${storeId}`).then((r) => setWilayas(r.data || [])).catch(() => setWilayas([]));
  }, [userId, storeId, digital]);
  // البلديات تُجلب عند اختيار الولاية
  const chooseWilaya = (id: string) => {
    setForm((p) => ({ ...p, wilaya: id, commune: '' }));
    setCommunes([]);
    if (!id) return;
    setLoadingCommunes(true);
    axios.get(`${API_URL}/shipping/get-communes/${id}`).then((r) => setCommunes(r.data || [])).catch(() => setCommunes([])).finally(() => setLoadingCommunes(false));
  };

  const wilaya = useMemo(() => wilayas.find((w) => String(w.id) === String(form.wilaya)), [wilayas, form.wilaya]);
  const ship = digital || !wilaya ? 0 : Number(form.ship === 'home' ? wilaya.livraisonHome : wilaya.livraisonOfice);
  const placeName = (x: { ar_name: string; name?: string }) => (ar ? x.ar_name : x.name || x.ar_name);

  /* ── الطلب ── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (bundle.products.some((p) => needsChoice(p) && !variantOf(p))) err.options = t.pickOptions;
    if (form.name.trim().length < 3) err.name = f.errorName;
    if (!isValidDzPhone(form.phone.replace(/\s/g, ''))) err.phone = f.errorPhone;
    if (!digital && !form.wilaya) err.wilaya = f.errorWilaya;
    if (!digital && !form.commune) err.commune = f.errorCommune;
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(err.options ? 'bundle-items' : 'bundle-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    let customerId = '';
    try { customerId = localStorage.getItem('customerId') || ''; } catch { /* وضع خاص */ }
    const customer = {
      domain, bundleId: bundle.id, customerId, customerName: form.name.trim(), customerPhone: form.phone,
      ...(digital ? {} : {
        typeShip: form.ship, priceShip: ship, priceLoss: wilaya?.livraisonReturn ?? 0,
        customerWilayaId: form.wilaya, customerCommuneId: form.commune,
      }),
    };
    const payload = bundle.products.map((p) => ({ ...customer, productId: p.id, variantDetailId: variantOf(p)?.id, quantity: 1 }));

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/orders`, payload);
      try { if (res.data?.customerId) localStorage.setItem('customerId', res.data.customerId); } catch { /* وضع خاص */ }
      router.push(`${window.location.pathname.replace(/\/bundle\/[^/]+\/?$/, '')}/successfully`);
    } catch (ex) {
      const msg = axios.isAxiosError(ex) ? (ex.response?.data as { message?: string | string[] } | undefined)?.message : undefined;
      alert(Array.isArray(msg) ? msg[0] : msg || f.connectionError);
      setSubmitting(false);
    }
  };

  const banner = bundle.imageUrl || bundle.mobileImageUrl;
  const field = 'w-full h-12 rounded-xl border bg-white px-3 text-base text-gray-900 outline-none focus:ring-2';

  return (
    <div className="mx-auto w-full max-w-xl pb-10 text-gray-900" dir={ar ? 'rtl' : 'ltr'}>
      {/* البانر */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 sm:mt-4 sm:rounded-3xl">
        {banner
          ? (
            <picture>
              {bundle.mobileImageUrl && <source media="(max-width: 640px)" srcSet={bundle.mobileImageUrl} />}
              <img src={banner} alt="" className="h-full w-full object-cover" />
            </picture>
          )
          : <span className="flex h-full w-full items-center justify-center text-gray-300"><ImageIcon className="h-12 w-12" aria-hidden /></span>}
        <span className="absolute top-3 start-3 rounded-full bg-red-700 px-3 py-1 text-sm font-bold text-white">-{bundle.discountPercent}%</span>
      </div>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold leading-snug">{bundle.name}</h1>
        {bundle.subtitle && <p className="mt-1 text-sm text-gray-600">{bundle.subtitle}</p>}
      </div>

      {/* المنتجات */}
      <section id="bundle-items" className="space-y-3 px-4 pt-5">
        <h2 className="text-base font-bold">{t.inBundle}</h2>
        {bundle.products.map((p) => {
          const img = firstImage(p);
          const chosen = sel[p.id] ?? {};
          return (
            <div key={p.id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3">
              {img ? <img src={img} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover bg-gray-100" /> : <span className="h-20 w-20 shrink-0 rounded-xl bg-gray-100" />}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold leading-snug">{p.name}</span>
                  <span className="shrink-0 text-sm text-gray-500">{formatDA(unitPrice(p, variantOf(p)?.id), language)}</span>
                </div>
                {needsChoice(p) && (p.attributes ?? []).filter((a) => a.variants?.length).map((a) => (
                  <div key={a.id} className="space-y-1.5">
                    <p className="text-xs font-semibold text-gray-600">{a.name}</p>
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${a.name} — ${p.name}`}>
                      {a.variants.map((v) => {
                        const on = chosen[a.name] === v.value;
                        const isColor = a.displayMode === 'color' || a.type === 'color';
                        return isColor ? (
                          <button key={v.id} type="button" onClick={() => pick(p.id, a.name, v.value)} aria-label={v.name || v.value} aria-pressed={on}
                            className="h-11 w-11 rounded-full border-2 p-0.5" style={{ borderColor: on ? accent : '#e5e7eb' }}>
                            <span className="block h-full w-full rounded-full border border-black/10" style={{ backgroundColor: v.value }} />
                          </button>
                        ) : (
                          <button key={v.id} type="button" onClick={() => pick(p.id, a.name, v.value)} aria-pressed={on}
                            className="min-h-11 min-w-12 rounded-xl border px-3 text-sm font-semibold"
                            style={on ? { backgroundColor: accent, borderColor: accent, color: '#fff' } : { borderColor: '#d1d5db', color: '#374151', backgroundColor: '#fff' }}>
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

      {/* الملخص */}
      <section className="mx-4 mt-4 space-y-1.5 rounded-2xl p-4 text-sm" style={{ backgroundColor: `color-mix(in srgb, ${accent} 8%, #ffffff)` }}>
        <div className="flex justify-between"><span>{t.original}</span><s className="text-gray-500">{formatDA(original, language)}</s></div>
        <div className="flex justify-between font-bold"><span>{t.bundlePrice}</span><span style={{ color: accent }}>{formatDA(price, language)}</span></div>
        <div className="flex justify-between font-semibold text-green-700"><span>{t.saved}</span><span>{formatDA(original - price, language)}</span></div>
      </section>

      {/* الاستمارة */}
      <form id="bundle-form" onSubmit={submit} className="space-y-3 px-4 pt-5" noValidate>
        <label className="block space-y-1 text-sm font-semibold">{f.fullName}
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={f.fullNamePlaceholder}
            className={field} style={{ borderColor: errors.name ? '#f87171' : '#d1d5db' }} autoComplete="name" />
          {errors.name && <span className="block text-xs text-red-600">{errors.name}</span>}
        </label>
        <label className="block space-y-1 text-sm font-semibold">{f.phone}
          <input type="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0550 123 456"
            className={`${field} ${ar ? 'text-right' : ''}`} style={{ borderColor: errors.phone ? '#f87171' : '#d1d5db' }} autoComplete="tel" />
          {errors.phone && <span className="block text-xs text-red-600">{errors.phone}</span>}
        </label>

        {!digital && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block space-y-1 text-sm font-semibold">{f.wilaya}
                <select value={form.wilaya} onChange={(e) => chooseWilaya(e.target.value)}
                  className={field} style={{ borderColor: errors.wilaya ? '#f87171' : '#d1d5db' }}>
                  <option value="">{f.selectWilaya}</option>
                  {wilayas.map((w) => <option key={w.id} value={w.id}>{w.id} - {placeName(w)}</option>)}
                </select>
                {errors.wilaya && <span className="block text-xs text-red-600">{errors.wilaya}</span>}
              </label>
              <label className="block space-y-1 text-sm font-semibold">{f.commune}
                <select value={form.commune} disabled={!form.wilaya || loadingCommunes} onChange={(e) => setForm({ ...form, commune: e.target.value })}
                  className={`${field} disabled:opacity-50`} style={{ borderColor: errors.commune ? '#f87171' : '#d1d5db' }}>
                  <option value="">{loadingCommunes ? f.loadingCommunes : form.wilaya ? f.selectCommune : f.selectWilayaFirst}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{placeName(c)}</option>)}
                </select>
                {errors.commune && <span className="block text-xs text-red-600">{errors.commune}</span>}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5" role="group" aria-label={f.deliveryType}>
              {(['home', 'office'] as const).map((type) => {
                const on = form.ship === type;
                const cost = wilaya ? (type === 'home' ? wilaya.livraisonHome : wilaya.livraisonOfice) : null;
                return (
                  <button key={type} type="button" onClick={() => setForm({ ...form, ship: type })} aria-pressed={on}
                    className="flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 px-2 text-sm font-semibold"
                    style={on ? { borderColor: accent, backgroundColor: `color-mix(in srgb, ${accent} 8%, #ffffff)` } : { borderColor: '#e5e7eb', backgroundColor: '#fff' }}>
                    {type === 'home' ? <Home className="h-4 w-4" aria-hidden /> : <Building2 className="h-4 w-4" aria-hidden />}
                    <span>{type === 'home' ? f.home : f.office}{cost !== null && ` · ${formatDA(Number(cost), language)}`}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* الإجمالي والطلب */}
        <div className="space-y-2.5 border-t border-gray-200 pt-4">
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
  );
}
