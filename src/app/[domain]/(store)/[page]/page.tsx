'use client';

import { useStore } from '@/Hook/store-provider';
import ThemeRunner from '@/components/ThemeRunner';
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

  const bundleUrl = `/api/themes-controller?lang=${language}&slug=${currentThemeSlug}`;

  return (
    <Suspense fallback={<PageLoading />}>
      <ThemeRunner bundleUrl={bundleUrl} exportName="StaticPage" themeProps={{ store, page: pageSlug, staticPage: pageSlug }} />
    </Suspense>
  );
}
