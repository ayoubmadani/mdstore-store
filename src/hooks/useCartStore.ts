import { create } from 'zustand'

interface CartState {
  count: number
  inc: () => void
  initCount: (n: number) => void
}

export const useCartStore = create<CartState>((set) => ({
  count: 0,
  inc:       () => set(s => ({ count: s.count + 1 })),
  initCount: (n) => set(() => ({ count: n })),
}))
