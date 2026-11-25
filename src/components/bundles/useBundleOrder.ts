'use client';

// منطق طلب الطقم (مشترك بين صفحة المنصة وصفحات الثيمات — @mdstore/theme-kit):
// خيارات كل منتج، الأسعار قبل/بعد الخصم، الولايات والبلديات والتوصيل، التحقق، والإرسال.
// الثيم يرسم الشكل فقط. الخادم يعيد حساب الأسعار بخصم الطقم ولا يعتمد على ما يُعرض هنا.

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getProductFormStrings } from '@/components/productForm/translations';
import {
  BundleAttribute, BundlePage, BundleProduct, bundleStrings, discounted, formatDA, matchVariant, unitPrice,
} from '@/lib/bundles';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

export interface BundleWilaya { id: string; ar_name: string; name?: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number }
export interface BundleCommune { id: string; ar_name: string; name?: string }
type BundleStoreLike = { id?: string; language?: string | null; country?: string | null; user?: { id?: string } | null };

// هذا الملف يُدمج داخل كل ثيم عند بنائه (الثيم مستقل) — لا يستورد شيئاً من المتجر وقت التشغيل.
// الهاتف: الجزائر 05/06/07 (أو +213)، وغيرها 8–15 رقماً — الثيم يمرّر مدقّقه إن كان له واحد (validPhone)
const defaultPhone = (country?: string | null) => (v: string) =>
  !country || country === 'DZ' ? /^(0|\+213)[5-7]\d{8}$/.test(v) : /^\+?\d{8,15}$/.test(v);

/** نوع عرض قيمة خاصية: صورة (رابط) / لون (كود) / نص */
export function optionKind(a: Pick<BundleAttribute, 'displayMode' | 'type'>, value: string): 'image' | 'color' | 'text' {
  if (a.displayMode === 'image') return 'image';
  if (a.displayMode === 'color' || (a.type === 'color' && /^#|^rgb|^hsl/i.test(value))) return 'color';
  return 'text';
}

/** صورة قيمة خاصية من نوع صورة (الرابط في name أو value) */
export const optionImage = (v: { name: string; value: string }) => (/^https?:\/\//.test(v.name) ? v.name : v.value);

export const firstImage = (p: BundleProduct) =>
  [...(p.imagesProduct || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.imageUrl;

// domain: يبقى في التوقيع (الثيمات تمرّره) — الطلب يُرسل برقم المتجر
export function useBundleOrder({ bundle, store, validPhone }: { bundle: BundlePage; store: BundleStoreLike; domain?: string; validPhone?: (v: string) => boolean }) {
  const phoneOk = validPhone || defaultPhone(store?.country);
  const language = store?.language || 'ar';
  const t = bundleStrings(language);
  const f = getProductFormStrings(language);
  const router = useRouter();
  const ar = language === 'ar';
  const digital = bundle.products.every((p) => p.isDigital);
  const storeId = store?.id || '';
  const userId = store?.user?.id || '';

  /* ── الخيارات: لكل منتج { اسم الخاصية: القيمة } ── */
  const [sel, setSel] = useState<Record<string, Record<string, string>>>({});
  const pick = (pid: string, attr: string, value: string) => setSel((s) => ({ ...s, [pid]: { ...s[pid], [attr]: value } }));
  const needsChoice = (p: BundleProduct) => (p.attributes ?? []).some((a) => a.variants?.length) && !!p.variantDetails?.length;
  const variantOf = (p: BundleProduct) => (needsChoice(p) ? matchVariant(p, sel[p.id] ?? {}) : undefined);
  const attrsOf = (p: BundleProduct) => (needsChoice(p) ? (p.attributes ?? []).filter((a) => a.variants?.length) : []);
  const chosen = (p: BundleProduct, attr: string) => sel[p.id]?.[attr];
  const priceOf = (p: BundleProduct) => unitPrice(p, variantOf(p)?.id);

  const original = bundle.products.reduce((s, p) => s + priceOf(p), 0);
  const price = discounted(original, bundle.discountPercent);

  /* ── التوصيل ── */
  const [wilayas, setWilayas] = useState<BundleWilaya[]>([]);
  const [communes, setCommunes] = useState<BundleCommune[]>([]);
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
  const setName = (name: string) => setForm((p) => ({ ...p, name }));
  const setPhone = (phone: string) => setForm((p) => ({ ...p, phone }));
  const setCommune = (commune: string) => setForm((p) => ({ ...p, commune }));
  const setShip = (ship: 'home' | 'office') => setForm((p) => ({ ...p, ship }));

  const wilaya = useMemo(() => wilayas.find((w) => String(w.id) === String(form.wilaya)), [wilayas, form.wilaya]);
  const ship = digital || !wilaya ? 0 : Number(form.ship === 'home' ? wilaya.livraisonHome : wilaya.livraisonOfice);
  const shipCost = (type: 'home' | 'office') => (wilaya ? Number(type === 'home' ? wilaya.livraisonHome : wilaya.livraisonOfice) : null);
  const placeName = (x: { ar_name: string; name?: string }) => (ar ? x.ar_name : x.name || x.ar_name);
  const money = (n: number) => formatDA(n, language);

  /* ── الطلب ── */
  const submit = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    const err: Record<string, string> = {};
    if (bundle.products.some((p) => needsChoice(p) && !variantOf(p))) err.options = t.pickOptions;
    if (form.name.trim().length < 3) err.name = f.errorName;
    if (!phoneOk(form.phone.replace(/\s/g, ''))) err.phone = f.errorPhone;
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
      // المتجر برقمه لا بالدومين: الدومين هنا قد يكون الاسم الكامل (x.mdstore.top أو دومين خاص) والخادم يبحث بالـ subdomain
      storeId, bundleId: bundle.id, customerId, customerName: form.name.trim(), customerPhone: form.phone,
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

  return {
    /** نصوص الطقم (t) ونصوص الاستمارة (f) بلغة المتجر */
    t, f, ar, language, digital, money,
    products: bundle.products, attrsOf, chosen, pick, variantOf, priceOf, needsChoice,
    original, price, saving: original - price, total: price + ship,
    wilayas, communes, loadingCommunes, wilaya, placeName,
    form, setName, setPhone, chooseWilaya, setCommune, setShip, ship, shipCost,
    errors, submitting, submit,
  };
}

/* ── رابط صفحة طقم: <a {...bundleLink(slug)}> — محلياً (الدومين الرئيسي) تُضاف بادئة /<domain> عند الضغط ── */
function fixLocalLink(e: { currentTarget: HTMLAnchorElement; preventDefault: () => void }) {
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mdstore.top').toLowerCase();
  if (window.location.host.toLowerCase() !== root) return;
  const seg = window.location.pathname.split('/').filter(Boolean)[0];
  if (!seg) return;
  e.preventDefault();
  window.location.href = `/${seg}${e.currentTarget.getAttribute('href')}`;
}
export const bundleLink = (slug: string) => ({ href: `/bundle/${slug}`, onClick: fixLocalLink });

/* ── تمرير سلايدر الأطقم يميناً/يساراً — المنطق فقط، والثيم يرسم أزراره بأسلوبه ── */
export function useBundleScroll() {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [state, setState] = useState({ show: false, atStart: true, atEnd: false, rtl: true });

  const update = useCallback(() => {
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // RTL: scrollLeft سالب
    setState({ show: max > 4, atStart: pos <= 4, atEnd: pos >= max - 4, rtl: getComputedStyle(el).direction === 'rtl' });
  }, [el]);

  useEffect(() => {
    if (!el) return undefined;
    const raf = requestAnimationFrame(update);
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [el, update]);

  // dir = 1 التالي (نحو نهاية السطر)، -1 السابق — بطاقة واحدة
  const go = (dir: 1 | -1) => {
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth || el.clientWidth * 0.8) + 16;
    el.scrollBy({ left: dir * step * (state.rtl ? -1 : 1), behavior: 'smooth' });
  };

  return {
    ref: setEl as (node: HTMLElement | null) => void,
    ...state,
    prev: () => go(-1),
    next: () => go(1),
    prevLeft: !state.rtl,
    labels: state.rtl ? { prev: 'السابق', next: 'التالي' } : { prev: 'Previous', next: 'Next' },
  };
}

export { bundleStrings };
export { firstImage as bundleProductImage };
