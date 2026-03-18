"use client"

import { useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default function AddShow({ productId, storeId, lpId }: any) {
  // Ref لمنع التنفيذ المزدوج
  const hasRecorded = useRef(false);

  useEffect(() => {
    // منع التنفيذ إذا كان قد تم بالفعل
    if (hasRecorded.current) return;
    
    const recordShow = async () => {
      const trackKey = `shown_${storeId || ''}_${productId || 'main'}`;
      
      // التحقق من sessionStorage
      if (sessionStorage.getItem(trackKey)) {
        return;
      }

      try {
        // تحديد أن التسجيل بدأ (قبل الـ await)
        hasRecorded.current = true;

        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
          visitorId = uuidv4();
          localStorage.setItem('visitorId', visitorId);
        }

        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const cleanLpId = (lpId && isValidUuid.test(lpId)) ? lpId : undefined;

        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/shows`, {
          productId: productId || undefined,
          storeId: storeId || undefined,
          lpId: cleanLpId,
          visitorId: visitorId
        });

        // تعليم المشاهدة في الجلسة
        sessionStorage.setItem(trackKey, 'true');

      } catch (error: any) {
        // في حال الفشل، نسمح بإعادة المحاولة
        hasRecorded.current = false;
        console.error('Tracking Error:', error.response?.data || error.message);
      }
    };

    recordShow();
  }, [productId, storeId, lpId]);

  return null;
}