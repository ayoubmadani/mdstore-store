import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck, Eye, Lock, Database, Globe, Bell } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('privacy');
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

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');

  return (
    <div className="py-16 bg-white dark:bg-brand-dark min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-3xl mb-6 shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-8">
          <PrivacyCard
            icon={<Database className="text-blue-600 dark:text-blue-400" />}
            title={t('collection_title')}
            desc={t('collection_desc')}
          />
          <PrivacyCard
            icon={<Eye className="text-purple-600 dark:text-purple-400" />}
            title={t('usage_title')}
            desc={t('usage_desc')}
          />
          <PrivacyCard
            icon={<Lock className="text-brand-success" />}
            title={t('protection_title')}
            desc={t('protection_desc')}
          />
          <PrivacyCard
            icon={<Globe className="text-brand-primary" />}
            title={t('sharing_title')}
            desc={t('sharing_desc')}
          />
        </div>

        <div className="mt-16 p-8 bg-gray-50 dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm text-gray-400 dark:text-zinc-500">
              <Bell size={20} />
            </div>
            <div className="text-center md:text-right lg:text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{t('updates_title')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('updates_desc')}</p>
            </div>
          </div>
          <div className="text-sm text-gray-400 dark:text-zinc-500 font-medium">{t('last_updated')}: 06/02/2026</div>
        </div>
      </div>
    </div>
  );
}

const PrivacyCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="p-8 md:p-10 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] hover:shadow-xl hover:shadow-brand-primary/5 dark:hover:shadow-none transition-all group">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-14 h-14 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-base">{desc}</p>
      </div>
    </div>
  </div>
);
