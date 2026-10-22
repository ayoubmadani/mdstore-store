'use client';

import { useEffect } from 'react';

// خانات الأرقام: عجلة الفأرة لا تغيّر القيمة — نُخرج التركيز فتتحرك الصفحة بدلها
export default function NoWheelNumberInputs() {
  useEffect(() => {
    const onWheel = () => {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement && el.type === 'number') el.blur();
    };
    document.addEventListener('wheel', onWheel, { passive: true });
    return () => document.removeEventListener('wheel', onWheel);
  }, []);
  return null;
}
