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

  // التحقق من صحة النطاق
  if (!domain || (domain.includes('.') && !domain.includes('mdstore.top'))) {
    return null;
  }

  try {
    const response = await axios.get(`${API_URL}/stores/domain/${domain}`, {
      params: {
        categoryId,
        search,
        page,
      },
      // Axios لا يدعم revalidate الخاص بـ Next.js بشكل افتراضي 
      // لذا نستخدم headers إذا كنت تعتمد على ISR/SSR من جهة الخادم
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    console.log({response});
    

    // Axios يضع البيانات تلقائياً داخل كائن data
    const result = response.data;
    
    // التعامل مع هيكلية الرد (Data Wrapper) حسب الـ JSON الأخير
    const store = result.data || result;

    if (!store) return null;

    // طباعة البيانات للتأكد من وصول كائن الـ theme

    // دمج الإعدادات الافتراضية للتصميم مع الحفاظ على كائن المتجر كاملاً
    return {
      ...store,
      design: {
        logoUrl: '/default-logo.png',
        faviconUrl: '/default-logo.png',
        ...store.design
      }
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn(`⚠️ Fetch failed: ${error.response?.status} ${error.message}`);
    } else {
      console.error('🚨 Unexpected Error:', error);
    }
    return null;
  }
}