import axios from 'axios';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Plan {
  id: string;
  name: string;
  currency: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features?: {
    storeNumber?: number;
    productNumber?: number;
    landingPageNumber?: number;
    commission?: number;
    isNtfy?: boolean;
    pixelFacebookNumber?: number;
    pixelTiktokNumber?: number;
  };
}

export async function getActivePlans(): Promise<Plan[] | null> {
  if (!API_URL) return null;
  try {
    const { data } = await axios.get(`${API_URL}/plans?active=true`, { timeout: 10000 });
    return data || [];
  } catch {
    return null;
  }
}

export interface ContactFormInput {
  username: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContact(input: ContactFormInput): Promise<boolean> {
  if (!API_URL) return false;
  try {
    const response = await axios.post(`${API_URL}/admin/contact`, input, { timeout: 10000 });
    return response.status === 200 || response.status === 201;
  } catch {
    return false;
  }
}

export async function getProduct(domain: string, productId: string): Promise<any | null> {
  if (!API_URL || !domain || !productId) return null
  try {
    const { data } = await axios.get(
      `${API_URL}/products/public/${encodeURIComponent(domain)}/${productId}`,
      { timeout: 10000 },
    )
    return data || null
  } catch {
    return null
  }
}

export async function getStoreByDomain(
  domain: string,
  categoryId?: string,
  search?: string,
  page?: string,
): Promise<Store | null> {
  
  if (!API_URL) {
    console.error('❌ API_URL is not defined');
    return null;
  }

  // التحقق من وجود القيمة فقط، ونترك للـ API قرار التحقق من صحة الدومين
  if (!domain) return null;

  try {
    // نصيحة: إذا كنت تستدعي هذا من Server Component، يفضل استخدام fetch 
    // للحصول على ميزات التخزين المؤقت (Caching) الخاصة بـ Next.js.
    // أما إذا كنت تفضل Axios:
    const response = await axios.get(`${API_URL}/stores/domain/${domain}`, {
      params: {
        categoryId,
        search,
        page,
      },
      // في Next.js 15/16، الـ Fetching الافتراضي هو dynamic
      timeout: 10000, // إضافة مهلة زمنية للطلب
    });

    const result = response.data;
    const store = result.data || result;

    if (!store) return null;

    // دمج الإعدادات مع معالجة الصور الافتراضية
    return {
      ...store,
      design: {
        // تأكد من أن الـ Default values لا تظهر إلا إذا كانت القيمة الأصلية null أو undefined
        ...store.design,
        logoUrl: store.design?.logoUrl || '/default-logo.png',
        faviconUrl: store.design?.faviconUrl || '/default-favicon.png',
      }
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      // تجنب إظهار 404 كخطأ فادح لأنه طبيعي عند بحث المتصفحات عن ملفات غير موجودة
      if (error.response?.status === 404) {
        console.warn(`🏪 Store not found for domain: ${domain}`);
      } else {
        console.error(`⚠️ API Error: ${error.response?.status} - ${error.message}`);
      }
    } else {
      console.error('🚨 Unexpected Error:', error);
    }
    return null;
  }
}
/**
 * هل الدومين للمتجر كله أم لصفحة محرر واحدة (domains.scope = 'landing_page')؟
 * أي فشل → نتعامل معه كدومين متجر عادي.
 */
export async function resolveDomain(domain: string): Promise<{ scope: 'store' | 'landing_page'; builderPageId: string | null }> {
  try {
    const { data } = await axios.get(`${API_URL}/domain/resolve/${encodeURIComponent(domain)}`, { timeout: 8000 });
    return data?.scope === 'landing_page' && data.builderPageId
      ? { scope: 'landing_page', builderPageId: data.builderPageId }
      : { scope: 'store', builderPageId: null };
  } catch {
    return { scope: 'store', builderPageId: null };
  }
}

/** صفحة محرر منشورة بمعرّفها (مع بيكسلاتها) — null إن لم تُنشر */
export async function getBuilderPageById(id: string) {
  try {
    const { data } = await axios.get(`${API_URL}/builder-pages/public/${id}`, { timeout: 10000 });
    return data ?? null;
  } catch {
    return null;
  }
}
