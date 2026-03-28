import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getStoreByDomain(domain: string): Promise<Store | null> {
  if (!API_URL) {
    console.error('API_URL is not defined');
    return null;
  }

  // طباعة المعرف للتأكد في السيرفر (Terminal) ما الذي يتم إرساله للـ API
  console.log('🔍 Fetching store for identifier:', domain);

  try {
    const response = await fetch(`${API_URL}/stores/domain/${domain}`, {
      next: { revalidate: 60 } // استخدام التخزين المؤقت لمدة دقيقة للأداء
    });

    if (!response.ok) return null;

    const result = await response.json();
    const store = result.data || result;

    // حماية إضافية: إذا نجح الطلب ولكن بيانات التصميم مفقودة
    if (store && !store.design) {
      store.design = { logoUrl: '/default-logo.png' }; // قيمة افتراضية تمنع الانهيار
    }

    return store;
  } catch (error) {
    console.error('Fetch Error:', error);
    return null;
  }
}