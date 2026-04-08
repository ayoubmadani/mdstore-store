import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getStoreByDomain(domain: string, categoryId?: string): Promise<Store | null> {
  if (!API_URL) {
    console.error('❌ API_URL is not defined in environment variables');
    return null;
  }

  // منع محاولات جلب بيانات لملفات تقنية أو صور (سبب خطأ الـ Digest السابق)
  if (!domain || domain.includes('.') && !domain.includes('mdstore.top')) {
     return null;
  }

  console.log('🔍 Fetching store for:', domain, categoryId ? `| Category: ${categoryId}` : '');

  try {
    // بناء الرابط باستخدام URLSearchParams لضمان سلامة الـ Query Strings
    const url = new URL(`${API_URL}/stores/domain/${domain}`);
    if (categoryId) {
      url.searchParams.append('categoryId', categoryId);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      console.warn(`⚠️ Store not found for domain: ${domain} (Status: ${response.status})`);
      return null;
    }

    const result = await response.json();
    const store = result.data || result;

    if (!store) return null;

    // تأمين كائن التصميم (Design Object) لمنع انهيار الـ Layout
    return {
      ...store,
      design: {
        logoUrl: '/default-logo.png',
        faviconUrl: '/default-logo.png',
        ...store.design
      }
    };

  } catch (error) {
    console.error('🚨 Fetch Error in getStoreByDomain:', error);
    return null;
  }
}