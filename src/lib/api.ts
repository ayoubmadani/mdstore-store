import { Store } from '@/types/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

export async function getStoreByDomain(domain: string): Promise<Store | null> {
  try {
    const response = await fetch(`${API_URL}/stores/domain/${domain}`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}