'use client';

// شريط النص المتحرك — يقيس عرض الشريط وطول النص ثم يوزّع النسخ (انظر marquee.ts).
// نفس المكوّن في المحرر: dashboard-order/src/pages/editor/blocks/marquee.jsx — عدّلهما معاً.
import { useEffect, useRef, useState } from 'react';
import { MARQUEE_CSS, marqueeLayout } from './marquee';

type Props = { text?: string; dir: 'rtl' | 'ltr'; seconds: number; repeat?: number };

export default function MarqueeTrack({ text, dir, seconds, repeat = 1 }: Props) {
  const bandRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const gapRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ band: 0, text: 0, gap: 0 });

  useEffect(() => {
    const measure = () => setSize({
      band: bandRef.current?.clientWidth || 0,
      text: textRef.current?.offsetWidth || 0,
      gap: gapRef.current?.offsetWidth || 0,
    });
    measure();
    const ro = new ResizeObserver(measure);
    if (bandRef.current) ro.observe(bandRef.current);
    if (textRef.current) ro.observe(textRef.current);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [text]);

  const layout = marqueeLayout({ ...size, repeat, seconds });
  const gapEl = <span style={{ paddingInline: '0.9em' }} />; // أقل مسافة بين نسختين

  return (
    <div ref={bandRef} style={{ width: '100%', overflow: 'hidden', position: 'relative', direction: 'ltr' }}>
      {/* direction ltr: في صفحة عربية يلتصق الشريط الأعرض من الإطار باليمين فتختفي النسخ — النص العربي داخله يبقى سليماً (dir=auto) */}
      <style>{MARQUEE_CSS}</style>
      {/* قياس طول النص والمسافة (غير مرئي) */}
      <span aria-hidden="true" style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        <span ref={textRef} dir="auto" style={{ unicodeBidi: 'isolate' }}>{text}</span>
        <span ref={gapRef}>{gapEl}</span>
      </span>
      {layout ? (
        <div
          className="md-marquee-track"
          style={{
            display: 'flex', width: 'max-content', direction: 'ltr', willChange: 'transform',
            ['--md-mq-shift' as string]: `${layout.spacing}px`,
            animation: `md-marquee-${dir} ${layout.duration}s linear infinite`,
          }}
        >
          {Array.from({ length: layout.count }, (_, i) => (
            // النص في الطرف الذي يدخل منه: بداية الخانة عند الحركة لليسار، نهايتها عند الحركة لليمين
            <span key={i} style={{ width: layout.spacing, flexShrink: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', flexDirection: dir === 'ltr' ? 'row-reverse' : 'row' }}>
              <span dir="auto" style={{ unicodeBidi: 'isolate' }}>{text}</span>
            </span>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{text}</div>
      )}
    </div>
  );
}
