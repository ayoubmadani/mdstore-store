'use client';

// تمرير سلايدر الأطقم يميناً/يساراً — المنطق فقط (useBundleScroll)، والثيم يرسم أزراره بأسلوبه:
//   const sc = useBundleScroll();
//   <div ref={sc.ref} data-bundle-track …>…</div>
//   {sc.show && <button disabled={sc.atStart} onClick={sc.prev}>…</button>}
// prevLeft: سهم «السابق» يشير لليسار (LTR) أو لليمين (RTL).
// BundleArrows: أزرار بسيطة للصفحة المشتركة فقط (ليست تصميماً للثيمات).

import { useCallback, useEffect, useState } from 'react';

export function useBundleScroll() {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [state, setState] = useState({ show: false, atStart: true, atEnd: false, rtl: true });

  const update = useCallback(() => {
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // RTL: scrollLeft سالب
    setState({ show: max > 4, atStart: pos <= 4, atEnd: pos >= max - 4, rtl: getComputedStyle(el).direction === 'rtl' });
  }, [el]);

  useEffect(() => {
    if (!el) return undefined;
    const raf = requestAnimationFrame(update);
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [el, update]);

  // dir = 1 التالي (نحو نهاية السطر)، -1 السابق — بطاقة واحدة
  const go = (dir: 1 | -1) => {
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth || el.clientWidth * 0.8) + 16;
    el.scrollBy({ left: dir * step * (state.rtl ? -1 : 1), behavior: 'smooth' });
  };

  return {
    ref: setEl as (node: HTMLElement | null) => void,
    ...state,
    prev: () => go(-1),
    next: () => go(1),
    prevLeft: !state.rtl,
    labels: state.rtl ? { prev: 'السابق', next: 'التالي' } : { prev: 'Previous', next: 'Next' },
  };
}

/** للصفحة المشتركة: يعطي الـ ref للمسار عبر track */
export function BundleArrows({ sc, size = 40 }: { sc: ReturnType<typeof useBundleScroll>; size?: number }) {
  if (!sc.show) return null;
  const btn = (disabled: boolean): React.CSSProperties => ({
    width: size, height: size, borderRadius: '50%', border: '1.5px solid currentColor', background: 'transparent', color: 'inherit',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.3 : 0.85, padding: 0,
  });
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 16px 12px' }}>
      <button type="button" aria-label={sc.labels.prev} disabled={sc.atStart} onClick={sc.prev} style={btn(sc.atStart)}><Chevron size={size} left={sc.prevLeft} /></button>
      <button type="button" aria-label={sc.labels.next} disabled={sc.atEnd} onClick={sc.next} style={btn(sc.atEnd)}><Chevron size={size} left={!sc.prevLeft} /></button>
    </div>
  );
}

function Chevron({ left, size }: { left: boolean; size: number }) {
  return (
    <svg aria-hidden="true" width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={left ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
    </svg>
  );
}
