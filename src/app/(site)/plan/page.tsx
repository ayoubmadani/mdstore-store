import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Sparkles } from 'lucide-react';
import { getActivePlans } from '@/lib/api';
import PlanToggle from './PlanToggle';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('plans');
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      images: [{ url: '/og/mdstore-default.png' }],
    },
  };
}

export default async function PlanPage() {
  const t = await getTranslations('plans');
  const plans = await getActivePlans();

  return (
    <div className="min-h-screen py-20 px-4 bg-white dark:bg-brand-dark">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black tracking-wider">
          <Sparkles size={13} /> {t('badge')}
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">{t('title')}</h1>
        <p className="text-base text-gray-500 dark:text-zinc-400 leading-relaxed">{t('subtitle')}</p>
      </div>

      {plans === null ? (
        <p className="text-center text-red-600 dark:text-red-400 py-20 text-sm">{t('error_load')}</p>
      ) : plans.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-zinc-400 py-20 text-sm">{t('no_plans')}</p>
      ) : (
        <PlanToggle plans={plans} />
      )}
    </div>
  );
}
