import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Cookie, Settings, ShieldCheck, MousePointer2, ToggleRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cookies');
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

export default async function CookiesPage() {
  const t = await getTranslations('cookies');

  return (
    <div className="py-16 bg-white dark:bg-brand-dark min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-3xl mb-6 shadow-sm animate-bounce">
            <Cookie size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6">
          <CookieCategory
            icon={<ShieldCheck className="text-brand-primary" />}
            title={t('essential_title')}
            desc={t('essential_desc')}
            status={t('status_active')}
            isActive
          />
          <CookieCategory
            icon={<Settings className="text-purple-600 dark:text-purple-400" />}
            title={t('pref_title')}
            desc={t('pref_desc')}
            status={t('status_optional')}
            isActive={false}
          />
          <CookieCategory
            icon={<MousePointer2 className="text-blue-600 dark:text-blue-400" />}
            title={t('analytics_title')}
            desc={t('analytics_desc')}
            status={t('status_optional')}
            isActive={false}
          />
        </div>

        <div className="mt-16 p-8 bg-brand-primary rounded-[2.5rem] text-white relative overflow-hidden group shadow-xl shadow-brand-primary/20">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
              <ToggleRight size={32} />
            </div>
            <div className="text-center md:text-start lg:text-start">
              <h3 className="text-xl font-bold mb-2">{t('manage_title')}</h3>
              <p className="text-indigo-100 opacity-90 text-sm leading-relaxed">{t('manage_desc')}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

const CookieCategory = ({
  icon,
  title,
  desc,
  status,
  isActive,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  status: string;
  isActive: boolean;
}) => (
  <div className="p-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] flex flex-col md:flex-row gap-6 items-start hover:border-brand-primary/30 dark:hover:border-brand-primary/20 transition-all group">
    <div className="w-14 h-14 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-grow space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xl font-black text-gray-900 dark:text-white">{title}</h3>
        <span
          className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isActive
              ? 'bg-brand-primary/10 text-brand-primary'
              : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
          }`}
        >
          {status}
        </span>
      </div>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-base">{desc}</p>
    </div>
  </div>
);
