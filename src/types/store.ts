export interface Store {
  id: string;
  name: string;
  subdomain: string;
  currency: string;
  language: 'ar' | 'en' | string;
  isActive: boolean;
  cart: boolean;
  theme?: { slug: string };
  pixels?: Pixel[];
  domains?: { id: string; domain: string; scope?: 'store' | 'landing_page'; builderPageId?: string }[];
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
    address?: string | null;
  };
  hero: {
    imageUrl?: string | null;
    title?: string | null;
    subtitle?: string | null;
  };
  products?: Product[];
  categories?: Category[];
}

export interface Pixel {
  id: string;
  name?: string;
  type: 'facebook' | 'tiktok' | 'google' | 'snapchat';
  pixelId: string;
  isActive: boolean;
  events?: string[];
  scope?: 'store' | 'landing_page';
  landingPageId?: string;
  builderPageId?: string;
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