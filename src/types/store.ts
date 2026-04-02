export interface Store {
  id: string;
  name: string;
  subdomain: string;
  currency: string;
  language: 'ar' | 'en' | string;
  isActive: boolean;
  design: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string | null;
    faviconUrl?: string | null;
  };
  topBar: {
    enabled: boolean;
    text?: string | null;
    color: string;
  };
  contact: {
    email?: string | null;
    phone?: string | null;
    wilaya?: string | null;
  };
  hero: {
    imageUrl?: string | null;
    title?: string | null;
    subtitle?: string | null;
  };
  products?: Product[];
  categories?: Category[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  priceOriginal?: number;
  desc?: string;
  productImage?: string;
  imagesProduct?: { id: string; imageUrl: string }[];
  slug?: string;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
}