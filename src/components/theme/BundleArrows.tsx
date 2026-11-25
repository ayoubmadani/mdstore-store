'use client';

// أسهم «السابق / التالي» لسلايدر الأطقم (على الكمبيوتر لا يوجد سحب بالإصبع).
// للثيمات: ضع <BundleArrows /> قبل مسار البطاقات، وعلى المسار data-bundle-track.
// يظهر فقط إن كانت البطاقات أعرض من الشاشة، ويأخذ لون نص الثيم (currentColor).

import { useCallback, useEffect, useRef, useState } from 'react';

export function BundleArrows({ size = 40 }: { size?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ show: false, atStart: true, atEnd: false, rtl: true });

  const trackOf = () => box.current?.parentElement?.querySelector<HTMLElement>('[data-bundle-track]') ?? null;

  const update = useCallback(() => {
    const el = trackOf();
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // RTL: scrollLeft سالب
    setState({ show: max > 4, atStart: pos <= 4, atEnd: pos >= max - 4, rtl: getComputedStyle(el).direction === 'rtl' });
  }, []);

  useEffect(() => {
    const el = trackOf();
    if (!el) return undefined;
    const raf = requestAnimationFrame(update);
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [update]);

  // dir = 1 التالي (نحو نهاية السطر)، -1 السابق
  const go = (dir: 1 | -1) => {
    const el = trackOf();
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth || el.clientWidth * 0.8) + 16;
    const rtl = getComputedStyle(el).direction === 'rtl';
    el.scrollBy({ left: dir * step * (rtl ? -1 : 1), behavior: 'smooth' });
  };

  const rtl = state.rtl;
  const btn = (disabled: boolean): React.CSSProperties => ({
    width: size, height: size, borderRadius: '50%', border: '1.5px solid currentColor', background: 'transparent', color: 'inherit',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.3 : 0.85, padding: 0, transition: 'opacity .2s',
  });
  return (
    <div ref={box} style={{ display: state.show ? 'flex' : 'none', justifyContent: 'flex-end', gap: 8, padding: '0 20px 12px' }}>
      <button type="button" aria-label={rtl ? 'السابق' : 'Previous'} disabled={state.atStart} onClick={() => go(-1)} style={btn(state.atStart)}><Chevron size={size} pointLeft={!rtl} /></button>
      <button type="button" aria-label={rtl ? 'التالي' : 'Next'} disabled={state.atEnd} onClick={() => go(1)} style={btn(state.atEnd)}><Chevron size={size} pointLeft={rtl} /></button>
    </div>
  );
}

// السهم يشير لاتجاه الحركة على الشاشة: في العربية «التالي» ← يسار
function Chevron({ pointLeft, size }: { pointLeft: boolean; size: number }) {
  return (
    <svg aria-hidden="true" width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={pointLeft ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
    </svg>
  );
}
