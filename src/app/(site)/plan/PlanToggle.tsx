'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle2, Zap, Store, Package, FileText, Bell, TrendingUp, Gift } from 'lucide-react';
import type { Plan } from '@/lib/api';

type Interval = 'month' | 'year';

// التجربة المجانية لأي خطة مدفوعة عند التسجيل (نفس TRIAL_DAYS في الـ API)
const TRIAL_DAYS = 7;

type TFunc = ReturnType<typeof useTranslations<'plans'>>;

const buildFeatureRows = (features: Plan['features'], t: TFunc) => {
  if (!features) return [];
  const rows: { icon: typeof Store | null; label: string; value: string | number | null }[] = [
    { icon: Store, label: t('feat_stores'), value: features.storeNumber ?? null },
    { icon: Package, label: t('feat_products'), value: features.productNumber ?? null },
    { icon: FileText, label: t('feat_pages'), value: features.landingPageNumber ?? null },
    { icon: TrendingUp, label: t('feat_commission'), value: `${Number(features.commission ?? 0).toFixed(1)}%` },
  ];
  if (features.isNtfy) rows.push({ icon: Bell, label: t('feat_notifications'), value: '✓' });
  if ((features.pixelFacebookNumber ?? 0) > 0 || (features.pixelTiktokNumber ?? 0) > 0) {
    rows.push({
      icon: null,
      label: `FB ×${features.pixelFacebookNumber ?? 0} · TT ×${features.pixelTiktokNumber ?? 0}`,
      value: null,
    });
  }
  return rows;
};

export default function PlanToggle({ plans }: { plans: Plan[] }) {
  const t = useTranslations('plans');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [interval, setInterval] = useState<Interval>('month');

  // الأسعار تصل نصاً من الـ API ("0.00") — المقارنة بالأرقام
  const paidPlans = plans.filter((p) => Number(p.monthlyPrice) > 0 && Number(p.yearlyPrice) > 0);
  // «موصى بها» = الخطة المدفوعة الوسطى (الخطة المجانية لا تُبرَز)
  const featuredId = paidPlans[Math.floor((paidPlans.length - 1) / 2)]?.id;
  const avgSavings = paidPlans.length
    ? Math.round(
        (paidPlans.reduce((acc, p) => acc + (1 - Number(p.yearlyPrice) / (Number(p.monthlyPrice) * 12)), 0) /
          paidPlans.length) *
          100,
      )
    : 0;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {paidPlans.length > 0 && (
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-bold">
            <Gift size={16} className="shrink-0" /> {t('trial_banner', { days: TRIAL_DAYS })}
          </span>
        </div>
      )}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl p-1">
          <button
            onClick={() => setInterval('month')}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-colors ${
              interval === 'month'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-zinc-500'
            }`}
          >
            {t('monthly')}
          </button>
          <button
            onClick={() => setInterval('year')}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 ${
              interval === 'year'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-zinc-500'
            }`}
          >
            {t('annual')}
            {avgSavings > 0 && (
              <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                {t('save_up_to', { pct: avgSavings })}
              </span>
            )}
          </button>
        </div>
      </div>

      <div
        className={`max-w-5xl mx-auto grid gap-6 ${
          plans.length === 1
            ? 'grid-cols-1 max-w-sm'
            : plans.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
              : plans.length === 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {plans.map((plan) => {
          const isFeatured = plan.id === featuredId;
          // السنوي يُعرض بما يعادله شهرياً (12000/سنة ← 1000/شهر) مع سطر «تُدفع 12000 سنوياً»
          const price = interval === 'year' ? Math.round(Number(plan.yearlyPrice) / 12) : Number(plan.monthlyPrice);
          const savings =
            Number(plan.monthlyPrice) > 0 && Number(plan.yearlyPrice) > 0
              ? Math.round((1 - Number(plan.yearlyPrice) / (Number(plan.monthlyPrice) * 12)) * 100)
              : 0;
          const featureRows = buildFeatureRows(plan.features, t);
          const isFree = Number(plan.monthlyPrice) === 0 && Number(plan.yearlyPrice) === 0;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[2rem] p-7 transition-all duration-300 ${
                isFeatured
                  ? 'bg-zinc-900 dark:bg-white shadow-2xl scale-[1.03]'
                  : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-500 text-white text-[11px] font-black rounded-full shadow-lg tracking-wider">
                    <Zap size={11} /> {t('recommended')}
                  </span>
                </div>
              )}

              <div className="mb-5 mt-1">
                <p className={`text-xl font-black mb-2 ${isFeatured ? 'text-white dark:text-zinc-900' : 'text-gray-900 dark:text-white'}`}>
                  {plan.name}
                </p>
                {!isFree && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-black">
                    <Gift size={11} /> {t('trial_badge', { days: TRIAL_DAYS })}
                  </span>
                )}
              </div>

              <div className="mb-2">
                <div className="flex items-baseline gap-1">
                  {isFree ? (
                    <span className={`text-4xl font-black leading-none ${isFeatured ? 'text-white dark:text-zinc-900' : 'text-gray-900 dark:text-white'}`}>
                      {t('free')}
                    </span>
                  ) : (
                    <>
                      <span className={`text-4xl font-black leading-none ${isFeatured ? 'text-white dark:text-zinc-900' : 'text-gray-900 dark:text-white'}`}>
                        {price.toLocaleString()}
                      </span>
                      <span className={`text-sm font-medium ms-1 ${isFeatured ? 'text-white/60 dark:text-zinc-500' : 'text-gray-400 dark:text-zinc-500'}`}>
                        {plan.currency} / {t('mo')}
                      </span>
                    </>
                  )}
                </div>

                {interval === 'year' && !isFree && (
                  <p className={`mt-1.5 text-xs font-medium ${isFeatured ? 'text-white/60 dark:text-zinc-500' : 'text-gray-400 dark:text-zinc-500'}`}>
                    {t('billed_yearly', { price: Number(plan.yearlyPrice).toLocaleString(), currency: plan.currency })}
                  </p>
                )}
                {interval === 'year' && savings > 0 && (
                  <p className="mt-2 text-[11px] font-bold text-emerald-500">{t('save_pct', { pct: savings })}</p>
                )}
              </div>

              <div className={`border-t my-5 ${isFeatured ? 'border-white/10 dark:border-zinc-200' : 'border-gray-100 dark:border-zinc-800'}`} />

              <ul className="space-y-3 flex-1">
                {featureRows.length > 0 ? (
                  featureRows.map((row, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      {row.icon ? (
                        <row.icon size={14} className={`shrink-0 ${isFeatured ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      ) : (
                        <CheckCircle2 size={14} className={`shrink-0 ${isFeatured ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      )}
                      <span className={`text-sm leading-snug ${isFeatured ? 'text-white/80 dark:text-zinc-700' : 'text-gray-600 dark:text-zinc-400'}`}>
                        {row.value !== null && row.value !== '✓' ? (
                          <>
                            <strong>{row.value}</strong> {row.label}
                          </>
                        ) : (
                          row.label
                        )}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className={`text-sm ${isFeatured ? 'text-white/30' : 'text-gray-300 dark:text-zinc-700'}`}>—</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
