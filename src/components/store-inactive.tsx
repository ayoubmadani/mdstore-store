import { Store } from '@/types/store';

export function StoreInactive({ store }: { store: Store }) {
  const isRTL = store.language === 'ar';

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isRTL ? 'المتجر غير نشط' : 'Store Inactive'}
        </h1>
        <p className="text-gray-600 mb-4">
          {isRTL
            ? `المتجر "${store.name}" موجود لكن غير نشط حالياً`
            : `The store "${store.name}" exists but is currently inactive`
          }
        </p>
        <div
          className="w-16 h-1 mx-auto rounded-full"
          style={{ backgroundColor: store.design.primaryColor }}
        />
      </div>
    </div>
  );
}