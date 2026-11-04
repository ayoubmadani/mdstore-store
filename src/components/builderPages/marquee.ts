// نص متحرك (عنصر النص العائم في المحرر): نسخ من النص تدخل من طرف الشريط وتخرج من الآخر بلا انقطاع.
// نفس المنطق في المحرر: dashboard-order/src/pages/editor/blocks/marquee.jsx — عدّلهما معاً.
//
// «عدد النسخ» N = كم نسخة على عرض الشريط، والمسافة بين بدايات النسخ = max(عرض الشريط ÷ N، طول النص + مسافة):
//   N=1 ← حين تبدأ نسخة بالخروج تبدأ التالية بالدخول؛ N=2 ← واحدة تخرج، واحدة في المنتصف، وواحدة تدخل.
//   النص الطويل يأخذ مسافته كاملة فلا تتداخل النسخ ولا يُقص.
// الشريط يتحرك مسافة نسخة واحدة ثم يعيد (النسخ متطابقة فلا يظهر الرجوع). عرض الشريط وطول النص يُقاسان في المتصفح.
// لا حركة لمن فعّل «تقليل الحركة» في جهازه.

export const MARQUEE_DIRECTIONS = ['none', 'rtl', 'ltr'] as const;

export const MARQUEE_CSS = `
@keyframes md-marquee-rtl { from { transform: translateX(0); } to { transform: translateX(calc(-1 * var(--md-mq-shift))); } }
@keyframes md-marquee-ltr { from { transform: translateX(calc(-1 * var(--md-mq-shift))); } to { transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) { .md-marquee-track { animation: none !important; } }
`;

type MarqueeProps = { marquee?: string; marqueeSpeed?: number };

/** null = نص عادي؛ وإلا الاتجاه (rtl: يدخل من اليمين ويخرج من اليسار، ltr: العكس) والثواني لعبور الشريط مرة */
export function marqueeOf(el: MarqueeProps): { dir: 'rtl' | 'ltr'; seconds: number } | null {
  const dir = el.marquee;
  if (dir !== 'rtl' && dir !== 'ltr') return null;
  return { dir, seconds: Math.min(60, Math.max(3, Number(el.marqueeSpeed) || 12)) };
}

/** عدد النسخ على عرض الشريط (1..10، الافتراضي 1) */
export function marqueeRepeat(el: { marqueeRepeat?: number }): number {
  return Math.min(10, Math.max(1, Math.round(Number(el.marqueeRepeat) || 1)));
}

/**
 * band: عرض الشريط، text: طول النص، gap: أقل مسافة بعد النص — كلها px.
 * spacing: المسافة بين بدايات النسخ، count: عدد النسخ اللازم ليمتلئ الشريط أثناء الحركة،
 * duration: ثوانٍ لتحرك نسخة واحدة (نفس سرعة «عبور الشريط في seconds»).
 */
export function marqueeLayout({ band, text, gap, repeat, seconds }: { band: number; text: number; gap: number; repeat: number; seconds: number }) {
  if (!(band > 0)) return null;
  const spacing = Math.max(band / repeat, text + gap);
  return {
    spacing: Math.round(spacing * 100) / 100,
    count: Math.ceil(band / spacing) + 1,
    duration: Math.round(((seconds * spacing) / band) * 100) / 100,
  };
}
