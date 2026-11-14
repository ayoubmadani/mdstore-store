import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  Store,
  Package,
  LayoutTemplate,
  ClipboardList,
  ShieldCheck,
  PhoneCall,
  Truck,
  Boxes,
  TrendingUp,
  Target,
  Users,
  Smartphone,
  Check,
  type LucideIcon,
} from 'lucide-react';

import type { FeatureGroup, FeatureGroupId, FeatureStat } from '@/lib/site-features';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

// أيقونة ولون لكل مجموعة. الأصناف مكتوبة كاملة حتى يلتقطها Tailwind.
const LOOK: Record<FeatureGroupId, { Icon: LucideIcon; tone: string }> = {
  store: { Icon: Store, tone: 'text-indigo-600 dark:text-indigo-400' },
  products: { Icon: Package, tone: 'text-purple-600 dark:text-purple-400' },
  landing: { Icon: LayoutTemplate, tone: 'text-pink-600 dark:text-pink-400' },
  orders: { Icon: ClipboardList, tone: 'text-blue-600 dark:text-blue-400' },
  protect: { Icon: ShieldCheck, tone: 'text-emerald-600 dark:text-emerald-400' },
  confirm: { Icon: PhoneCall, tone: 'text-orange-600 dark:text-orange-400' },
  delivery: { Icon: Truck, tone: 'text-sky-600 dark:text-sky-400' },
  stock: { Icon: Boxes, tone: 'text-amber-600 dark:text-amber-400' },
  profit: { Icon: TrendingUp, tone: 'text-green-600 dark:text-green-400' },
  tracking: { Icon: Target, tone: 'text-rose-600 dark:text-rose-400' },
  team: { Icon: Users, tone: 'text-violet-600 dark:text-violet-400' },
  app: { Icon: Smartphone, tone: 'text-teal-600 dark:text-teal-400' },
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('features');
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

export default async function FeaturesPage() {
  const t = await getTranslations('features');
  const locale = await getLocale();
  const stats = t.raw('stats') as FeatureStat[];
  const groups = (t.raw('groups') as FeatureGroup[]).filter((g) => g.id in LOOK);
  const startHref = `${DASHBOARD_URL}/select-lang/${locale}`;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <section className="relative overflow-hidden pt-20 pb-14 lg:pt-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block py-1 px-4 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-6">
            {t('badge')}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-[1.15] mb-6">
            {t('title')} <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t('title_accent')}
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={startHref}
              className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all"
            >
              {t('cta_start')}
            </a>
            <Link
              href="/plan"
              className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-800 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
            >
              {t('cta_plans')}
            </Link>
          </div>

          <dl className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-14">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col-reverse justify-end p-4 md:p-6 rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
              >
                <dt className="text-gray-500 dark:text-gray-400 font-bold text-xs md:text-sm">{s.label}</dt>
                <dd className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-2">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <nav aria-label={t('jump_label')} className="container mx-auto px-6 pb-10">
        <ul className="flex flex-wrap justify-center gap-2">
          {groups.map((g) => (
            <li key={g.id}>
              <a
                href={`#${g.id}`}
                className="inline-block px-4 py-2 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors"
              >
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="py-16 bg-[#f8fafc] dark:bg-zinc-900/50 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {groups.map((g) => {
              const { Icon, tone } = LOOK[g.id];
              return (
                <article
                  key={g.id}
                  id={g.id}
                  className="scroll-mt-28 bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-[2.5rem] border border-gray-50 dark:border-zinc-800 hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:shadow-2xl hover:shadow-indigo-50 dark:hover:shadow-none transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 shrink-0 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                      <Icon className={tone} aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">{g.title}</h2>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {g.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                        <Check size={18} className="shrink-0 mt-1 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] px-8 py-14 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{t('cta_title')}</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">{t('cta_desc')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={startHref}
              className="w-full sm:w-auto px-10 py-4 bg-white text-indigo-700 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all"
            >
              {t('cta_start')}
            </a>
            <Link
              href="/plan"
              className="w-full sm:w-auto px-10 py-4 border border-white/40 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              {t('cta_plans')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
