'use client';

// تمرير سلايدر الأطقم يميناً/يساراً — المنطق فقط (useBundleScroll)، والثيم يرسم أزراره بأسلوبه:
//   const sc = useBundleScroll();
//   <div ref={sc.ref} data-bundle-track …>…</div>
//   {sc.show && <button disabled={sc.atStart} onClick={sc.prev}>…</button>}
// prevLeft: سهم «السابق» يشير لليسار (LTR) أو لليمين (RTL).
// BundleArrows: أزرار بسيطة للصفحة المشتركة فقط (ليست تصميماً للثيمات).

import { useBundleScroll } from '@/components/bundles/useBundleOrder';

export { useBundleScroll };

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
