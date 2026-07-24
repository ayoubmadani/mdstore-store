import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowRightLeft, ShieldCheckIcon, BarChart3, Truck, Code2, Headphones } from 'lucide-react';

import dashboardMockupLight from '@/assets/site/light/dashboard-mockup.jpeg';
import dashboardMockupDark from '@/assets/site/dark/dashboard-mockup.jpeg';
import homeBgPattern from '@/assets/site/home-bg-pattern.png';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  // The (site) route group's own index page doesn't inherit the group
  // layout's title.template (unlike nested pages), so the "| MdStore"
  // suffix is applied explicitly here instead of relying on the template.
  const title = `${t('meta_title')} | MdStore`;
  return {
    title,
    description: t('meta_description'),
    openGraph: {
      title,
      description: t('meta_description'),
      images: [{ url: '/og/mdstore-default.png' }],
    },
  };
}

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/5 blur-[120px] rounded-full"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-start">
              <span className="inline-block py-1 px-4 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-6 animate-bounce">
                🚀 {t('new_feature')}
              </span>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] mb-8">
                {t('hero_title')} <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t('hero_sub')}
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                {t('hero_desc')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href={`${DASHBOARD_URL}/select-lang/locale`}
                  className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-1"
                >
                  {t('get_started')}
                </Link>
                <Link
                  href="/about"
                  className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-800 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                >
                  {t('learn_more')}
                </Link>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[3rem] rotate-3 opacity-20 blur-2xl animate-pulse"></div>

              <div className="relative transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src={dashboardMockupDark}
                  alt="MdStore Dark Dashboard"
                  className="hidden dark:block w-full rounded-[2rem] shadow-2xl shadow-indigo-500/20 border border-white/10"
                />
                <Image
                  src={dashboardMockupLight}
                  alt="MdStore Light Dashboard"
                  className="block dark:hidden w-full rounded-[2rem] shadow-2xl shadow-indigo-500/20 border border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-[#f8fafc] dark:bg-zinc-900/50 transition-colors duration-300 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={homeBgPattern}
            alt=""
            fill
            className="object-cover opacity-[0.04] dark:opacity-[0.07]"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('features_title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ArrowRightLeft className="text-indigo-600 dark:text-indigo-400" />}
              title={t('feat1_title')}
              desc={t('feat1_desc')}
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="text-emerald-600 dark:text-emerald-400" />}
              title={t('feat2_title')}
              desc={t('feat2_desc')}
            />
            <FeatureCard
              icon={<BarChart3 className="text-purple-600 dark:text-purple-400" />}
              title={t('feat3_title')}
              desc={t('feat3_desc')}
            />
            <FeatureCard
              icon={<Truck className="text-blue-600 dark:text-blue-400" />}
              title={t('feat4_title')}
              desc={t('feat4_desc')}
            />
            <FeatureCard
              icon={<Code2 className="text-pink-600 dark:text-pink-400" />}
              title={t('feat5_title')}
              desc={t('feat5_desc')}
            />
            <FeatureCard
              icon={<Headphones className="text-orange-600 dark:text-orange-400" />}
              title={t('feat6_title')}
              desc={t('feat6_desc')}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-gray-50 dark:border-zinc-800 hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:shadow-2xl hover:shadow-indigo-50 dark:hover:shadow-none transition-all group">
    <div className="w-14 h-14 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
  </div>
);
