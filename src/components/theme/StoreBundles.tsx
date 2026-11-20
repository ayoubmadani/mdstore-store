'use client';

// للثيمات: سلايدر «عروض الأطقم» تحت الغلاف — سطر واحد في Home بعد <section> الغلاف:
//   import { StoreBundles } from '@mdstore/theme-kit';
//   <StoreBundles store={store} />
// يقرأ store.bundles ولون المتجر ولغته وعنوان التاجر؛ لا يرسم شيئاً إن لم توجد أطقم.
// وجوده في الصفحة يخفي سلايدر المنصة الاحتياطي (فوق الغلاف) للثيمات التي لم تُحدَّث بعد.

import BundleSlider from '@/components/bundles/BundleSlider';
import type { BundleCard } from '@/lib/bundles';

type BundleStore = {
  bundles?: BundleCard[] | null;
  language?: string | null;
  design?: { primaryColor?: string | null; bundlesTitle?: string | null } | null;
};

export function StoreBundles({ store, accent }: { store?: BundleStore | null; accent?: string }) {
  const bundles = store?.bundles ?? [];
  if (!bundles.length) return null;
  return (
    <BundleSlider
      bundles={bundles}
      accent={accent || store?.design?.primaryColor || '#111827'}
      language={store?.language || 'ar'}
      title={store?.design?.bundlesTitle}
      inTheme
    />
  );
}
