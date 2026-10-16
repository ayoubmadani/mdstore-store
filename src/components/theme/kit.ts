// @mdstore/theme-kit — ما يوفّره المتجر لكل ثيم وقت التشغيل (مثل react و lucide-react).
// الثيم المكتوب بالـ kit ملف واحد مستقل: يُبنى ويُرفع من الـ API (أداة MCP للأدمن) دون الحاجة لمشروع المتجر.
// لا تحذف أو تغيّر توقيع أي export هنا — ثيمات مرفوعة تعتمد عليه.
import axios from 'axios';

export { useCartStore } from '@/store/useCartStore';
export { WhatsAppOrderButton, WhatsAppGlyph, comingSoon, storeWhatsappHref, whatsappHref } from './storeContact';
export { ProductAddons, activeAddons, addonsTotal, addonsLabel } from './ProductAddons';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

export interface Wilaya { id: string; name: string; ar_name: string; livraisonHome: number; livraisonOfice: number; livraisonReturn: number }
export interface Commune { id: string; name: string; ar_name: string; wilayaId: string }

/** ولايات وأسعار التوصيل لحساب الشحن الذي يستعمله المتجر */
export async function fetchWilayas(userId: string, storeId?: string): Promise<Wilaya[]> {
  try {
    const { data } = await axios.get(`${API_URL}/shipping/public/get-shipping/${userId}`, { params: storeId ? { storeId } : undefined });
    if (data?.[0]?.country) storeCountry = data[0].country;
    return data || [];
  } catch {
    return [];
  }
}

// دومين المتجر الحالي — يرسله fetchCommunes ليُخفي الـ API البلديات التي عطّلها التاجر
// (محلياً الدومين في المسار: localhost:3000/a.mdstore.top/...)
function currentStoreDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const { hostname, pathname } = window.location;
  if (!hostname.startsWith('localhost') && !hostname.startsWith('127.0.0.1')) return hostname;
  const seg = pathname.split('/')[1];
  if (seg?.includes('.')) return seg;
  return document.cookie.match(/(?:^|; )dev_store_domain=([^;]+)/)?.[1];
}

export async function fetchCommunes(wilayaId: string): Promise<Commune[]> {
  try {
    const domain = currentStoreDomain();
    const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`, { params: domain ? { domain } : undefined });
    return data || [];
  } catch {
    return [];
  }
}

/** طلب واحد (كائن) أو سلة كاملة (مصفوفة) — نفس جسم /orders/create */
export function createOrder(payload: Record<string, unknown> | Record<string, unknown>[]) {
  return axios.post(`${API_URL}/orders/create`, payload);
}

/** رسالة صفحة «اتصل بنا» */
export function sendContactMessage(payload: { name: string; email: string; phone: string; message: string; storeId: string }) {
  return axios.post(`${API_URL}/user/contact-user/message`, payload);
}

/** هاتف جزائري صالح: 05/06/07 + 8 أرقام (أو +213) */
// دولة المتجر وعملته — يضبطهما StoreProvider من بيانات المتجر (وأيضاً fetchWilayas)؛ الجزائر افتراضياً
let storeCountry = 'DZ';
let storeCurrency = 'DZD';
export function setStoreLocale(country?: string | null, currency?: string | null) {
  if (country) storeCountry = country.toUpperCase();
  if (currency) storeCurrency = currency;
}
/** رمز العملة: النص الذي يعرضه الثيم (دج/DA) في الجزائر، وعملة المتجر في الدول الأخرى */
export const currencyLabel = (dzLabel: string) => (storeCountry === 'DZ' ? dzLabel : storeCurrency);
const PHONE_PATTERNS: Record<string, RegExp> = {
  DZ: /^(0|\+213)[5-7]\d{8}$/,
  TN: /^(\+216)?[2459]\d{7}$/,
};
/** يفحص الهاتف حسب دولة المتجر (الاسم باقٍ للتوافق مع الثيمات المرفوعة) */
export const isValidDzPhone = (v?: string | null) => (PHONE_PATTERNS[storeCountry] ?? /^\+?\d{8,15}$/).test(String(v ?? '').trim());
