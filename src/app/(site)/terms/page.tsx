import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { FileText, CheckCircle2, AlertCircle, Scale, CreditCard, Ban } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('terms');
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

export default async function TermsPage() {
  const t = await getTranslations('terms');

  return (
    <div className="py-16 bg-white dark:bg-brand-dark min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-3xl mb-6 shadow-sm">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          <TermsSection
            icon={<CheckCircle2 className="text-brand-success" />}
            title={t('account_title')}
            desc={t('account_desc')}
          />
          <TermsSection
            icon={<CreditCard className="text-blue-500 dark:text-blue-400" />}
            title={t('payments_title')}
            desc={t('payments_desc')}
          />
          <TermsSection
            icon={<Ban className="text-brand-danger" />}
            title={t('content_title')}
            desc={t('content_desc')}
          />
          <TermsSection
            icon={<Scale className="text-brand-primary" />}
            title={t('legal_title')}
            desc={t('legal_desc')}
          />
        </div>

        <div className="mt-16 p-6 bg-amber-50 dark:bg-amber-500/10 rounded-3xl border border-amber-100 dark:border-amber-500/20 flex gap-4 transition-all">
          <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{t('important_note')}</p>
        </div>
      </div>
    </div>
  );
}

const TermsSection = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="p-8 bg-gray-50/50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] hover:bg-white dark:hover:bg-zinc-800/50 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 group">
    <div className="flex gap-6 items-start">
      <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-2 text-right">
        <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-base">{desc}</p>
      </div>
    </div>
  </div>
);
