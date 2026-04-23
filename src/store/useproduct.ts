// store/useProductsStore.ts
import { create } from 'zustand';

interface Filter {
  categoryId: string;
  search: string;
  page: number;
}

interface ProductState {
  filter: Filter;
  editCategoryId: (id: string) => void;
  editSearch: (search: string) => void;
  editPage: (page: number) => void;
  resetFilters: () => void;
}

export const useProducts = create<ProductState>((set) => ({
  filter: {
    categoryId: '',
    search: '',
    page: 1,
  },

  // تحديث القسم وإعادة الصفحة للبداية
  editCategoryId: (categoryId) => 
    set((state) => ({
      filter: { ...state.filter, categoryId, page: 1 }
    })),

  // تحديث البحث وإعادة الصفحة للبداية
  editSearch: (search) => 
    set((state) => ({
      filter: { ...state.filter, search, page: 1 }
    })),

  // تحديث الصفحة فقط
  editPage: (page) => 
    set((state) => ({
      filter: { ...state.filter, page }
    })),

  // إعادة ضبط كل الفلاتر
  resetFilters: () => 
    set({
      filter: { categoryId: '', search: '', page: 1 }
    }),
}));