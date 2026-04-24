import axios from 'axios';
import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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