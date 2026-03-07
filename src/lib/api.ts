import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getStoreByDomain(domain: string): Promise<Store | null> {
  if (!API_URL) {
    console.error('API_URL is not defined in .env');
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/stores/domain/${domain}`, {
      cache: 'no-store',
    });

    // تأكد من نجاح الطلب أولاً
    if (!response.ok) {
      console.warn(`Store not found for domain: ${domain} (Status: ${response.status})`);
      return null;
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    // هنا سيظهر خطأ ECONNREFUSED إذا كان السيرفر مغلقاً
    console.error('Error fetching store:', error);
    return null;
  }
} 