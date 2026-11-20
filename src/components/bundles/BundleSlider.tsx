'use client';

// سلايدر «عروض الأطقم» في الرئيسية — مكوّن مشترك لكل الثيمات، يأخذ اللون الرئيسي للمتجر.
// يُسحب أفقياً (scroll-snap)، وطرف الطقم التالي ظاهر؛ طقم واحد = بطاقة بعرض الشاشة بلا سحب.

import { useRef, useState } from 'react';
import { Gift, ImageIcon } from 'lucide-react';
import { BundleCard, bundleStrings, formatDA } from '@/lib/bundles';

interface Props {
  bundles: BundleCard[];
  accent: string;
  language?: string;
  /** عنوان التاجر: undefined/null = الافتراضي بلغة المتجر، '' = بلا عنوان */
  title?: string | null;
  /** بادئة الروابط محلياً (/<domain>) — فارغة في الإنتاج؛ غير معروفة داخل الثيم فتُصحَّح عند الضغط */
  base?: string;
  /** يرسمه الثيم نفسه تحت غلافه (StoreBundles) — فيختفي سلايدر المنصة الاحتياطي فوق الغلاف */
  inTheme?: boolean;
}

/** داخل الثيم لا نعرف البادئة وقت الرسم: محلياً (الدومين الرئيسي) نضيف /<domain> من المسار الحالي */
function fixLocalLink(e: React.MouseEvent<HTMLAnchorElement>) {
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mdstore.top').toLowerCase();
  if (window.location.host.toLowerCase() !== root) return;
  const seg = window.location.pathname.split('/').filter(Boolean)[0];
  if (!seg) return;
  e.preventDefault();
  window.location.href = `/${seg}${e.currentTarget.getAttribute('href')}`;
}

export default function BundleSlider({ bundles, accent, language = 'ar', title, base, inTheme }: Props) {
  const t = bundleStrings(language);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (!bundles?.length) return null;
  const single = bundles.length === 1;
  const heading = title === undefined || title === null ? t.title : title.trim();

  const onScroll = () => {
    const el = track.current;
    if (!el || !el.firstElementChild) return;
    const w = (el.firstElementChild as HTMLElement).offsetWidth + 12;
    setActive(Math.min(bundles.length - 1, Math.round(Math.abs(el.scrollLeft) / w)));
  };

  return (
    <section className="w-full py-5" dir={language === 'ar' ? 'rtl' : 'ltr'} aria-label={heading || t.title} data-mds-bundles={inTheme ? '' : undefined}>
      <div className="mx-auto max-w-6xl">
        {(heading || !single) && (
          <div className="flex items-center justify-between gap-3 px-4 pb-3">
            {heading ? (
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Gift className="h-5 w-5 shrink-0" style={{ color: accent }} aria-hidden />{heading}
              </h2>
            ) : <span />}
            {!single && <span className="text-xs opacity-60">{t.swipe}</span>}
          </div>
        )}

        <div ref={track} onScroll={onScroll}
          className="flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {bundles.map((b) => {
            const img = b.imageUrl || b.mobileImageUrl;
            return (
              <article key={b.id}
                className={`snap-start shrink-0 flex flex-col overflow-hidden rounded-[22px] border-2 bg-white text-gray-900 ${single ? 'w-full sm:max-w-xl' : 'w-[82%] sm:w-[360px]'}`}
                style={{ borderColor: accent, backgroundColor: `color-mix(in srgb, ${accent} 8%, #ffffff)` }}>
                <a href={`${base ?? ''}/bundle/${b.slug}`} onClick={base === undefined ? fixLocalLink : undefined} className="relative block aspect-[16/8] bg-gray-100" aria-label={b.name}>
                  {img
                    ? (
                      <picture>
                        {b.mobileImageUrl && <source media="(max-width: 640px)" srcSet={b.mobileImageUrl} />}
                        <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </picture>
                    )
                    : <span className="flex h-full w-full items-center justify-center text-gray-300"><ImageIcon className="h-10 w-10" aria-hidden /></span>}
                  <span className="absolute top-2.5 start-2.5 rounded-full bg-red-700 px-3 py-1 text-sm font-bold text-white">-{b.discountPercent}%</span>
                </a>

                <div className="px-3.5 pt-3">
                  <h3 className="text-[17px] font-bold leading-snug">{b.name}</h3>
                  <p className="text-xs text-gray-500">{b.subtitle || t.pieces(b.items.length)}</p>
                </div>

                <ul className="mx-3 mt-2.5 flex items-start justify-between gap-1 rounded-2xl bg-white px-1.5 py-2.5">
                  {b.items.map((it, i) => (
                    <li key={it.productId} className="contents">
                      {i > 0 && <span aria-hidden className="pt-4 text-lg font-bold" style={{ color: accent }}>+</span>}
                      <span className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
                        {it.imageUrl
                          ? <img src={it.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover bg-gray-100" loading="lazy" />
                          : <span className="h-14 w-14 rounded-xl bg-gray-100" />}
                        <span className="line-clamp-2 text-[11px] font-semibold leading-tight">{it.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mx-3.5 flex items-baseline justify-between gap-2 py-2.5">
                  <span className="text-xs font-semibold text-green-700">{t.save} {formatDA(b.saving, language)}</span>
                  <span className="flex items-baseline gap-2">
                    <s className="text-sm text-gray-500">{formatDA(b.original, language)}</s>
                    <b className="text-xl" style={{ color: accent }}>{formatDA(b.price, language)}</b>
                  </span>
                </div>

                <div className="mt-auto px-3.5 pb-3.5">
                  <a href={`${base ?? ''}/bundle/${b.slug}`} onClick={base === undefined ? fixLocalLink : undefined}
                    className="flex h-12 items-center justify-center rounded-2xl text-[15px] font-bold text-white"
                    style={{ backgroundColor: accent }}>{t.order}</a>
                </div>
              </article>
            );
          })}
        </div>

        {!single && (
          <div className="flex justify-center gap-1.5 pt-2.5" aria-hidden>
            {bundles.map((b, i) => (
              <span key={b.id} className="h-1.5 rounded-full transition-all"
                style={{ width: i === active ? 20 : 6, backgroundColor: i === active ? accent : '#d1d5db' }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
