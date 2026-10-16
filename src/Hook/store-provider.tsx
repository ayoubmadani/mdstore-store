'use client';

import React, { createContext, useContext } from 'react';
import { Store } from '@/types/store';
import { setStoreLocale } from '@/components/theme/kit';

// 1. تحديث نوع الـ Context ليشمل الثيم
interface StoreContextType {
  store: any;
  theme: string;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ 
  children, 
  store,
  theme
}: { 
  children: React.ReactNode; 
  store: Store; 
  theme: string; // القيمة القادمة من السيرفر (Layout)
}) {
  // دولة المتجر وعملته لدوال الـ kit (فحص الهاتف، رمز العملة) في كل الثيمات
  setStoreLocale((store as any)?.country, (store as any)?.currency, (store as any)?.locationLevels);

  // 2. تمرير كائن يحتوي على الاثنين معاَ
  return (
    <StoreContext.Provider value={{ store, theme }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}