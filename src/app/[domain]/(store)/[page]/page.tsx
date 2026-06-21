'use client';

import { useStore } from '@/Hook/store-provider';
import dynamic from 'next/dynamic';
import { useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { ComponentType } from 'react';

interface StaticPageProps {
  store: any;
  page: string;
  staticPage: string;
}

function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  );
}

export default function DynamicPage() {
  const params = useParams();
  const { store, theme: currentThemeSlug } = useStore();

  const pageSlug = (params?.page as string) || '';
  const language = store?.language || 'ar';

  const DynamicStaticPage = useMemo(() => {
    return dynamic<StaticPageProps>(
      async () => {
        try {
          const mod = await import(`@/theme/${language}/${currentThemeSlug}/main`);
          return (mod.StaticPage || mod.default) as ComponentType<StaticPageProps>;
        } catch {
          const fallback = await import(`@/theme/${language}/default/main`);
          return (fallback.StaticPage || fallback.default) as ComponentType<StaticPageProps>;
        }
      },
      { loading: () => <PageLoading />, ssr: false }
    );
  }, [currentThemeSlug, language]);

  return (
    <Suspense fallback={<PageLoading />}>
      <DynamicStaticPage store={store} page={pageSlug} staticPage={pageSlug} />
    </Suspense>
  );
}
