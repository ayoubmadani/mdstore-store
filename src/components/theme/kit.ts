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
    return data || [];
  } catch {
    return [];
  }
}

export async function fetchCommunes(wilayaId: string): Promise<Commune[]> {
  try {
    const { data } = await axios.get(`${API_URL}/shipping/get-communes/${wilayaId}`);
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
export const isValidDzPhone = (v: string) => /^(0|\+213)[5-7]\d{8}$/.test(v.trim());
