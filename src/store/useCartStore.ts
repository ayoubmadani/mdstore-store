// store/useCartStore.ts
import { create } from 'zustand';

interface CartState {
  count: number;
  // دالة لزيادة العدد وتحديث localStorage في نفس الوقت (اختياري)
  inc: () => void;
  // دالة لضبط القيمة الأولية عند تحميل الصفحة
  initCount: (countItemsCart: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  count: 0,

  inc: () => set((state) => ({ 
    count: state.count + 1 
  })),

  initCount: (countItemsCart) => set(() => ({ 
    count: countItemsCart 
  })),
}));