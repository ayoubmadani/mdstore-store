'use client';

import { useStore } from "./store-provider";


export const usePixel = () => {
  const { store } = useStore();
  const pixels = store?.pixels || [];

  const trackPurchase = (total: number, currency: string = 'DZD', orderId: string) => {
    pixels.forEach((pixel: any) => {
      if (!pixel.isActive) return;

      // 1. Facebook Purchase
      if (pixel.type === 'facebook' && typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Purchase', {
          value: total,
          currency: currency,
          content_type: 'product',
          order_id: orderId
        });
      }

      // 2. TikTok Purchase
      if (pixel.type === 'tiktok' && typeof window !== 'undefined' && (window as any).ttq) {
        (window as any).ttq.track('CompletePayment', {
          content_type: 'product',
          value: total,
          currency: currency,
          order_id: orderId
        });
      }
    });
  };

  return { trackPurchase };
};