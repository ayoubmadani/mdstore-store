// مصدر الزبون (فيسبوك، تيك توك، غوغل…): يُلتقط عند أول دخول ويُرسل مع الطلب (trafficSource).
// الأولوية: رمز نقرة الإعلان ← وسوم UTM ← الصفحة السابقة ← مباشر. الإعلان الجديد يستبدل القديم (آخر نقرة)،
// والدخول بلا علامة لا يمحو مصدراً محفوظاً (يبقى 30 يوماً).
import axios from 'axios';

export type TrafficSource = {
  channel: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  ref?: string;
};

const CLICK_IDS: [string, string][] = [
  ['fbclid', 'facebook'], ['ttclid', 'tiktok'], ['gclid', 'google'], ['gbraid', 'google'], ['wbraid', 'google'],
  ['msclkid', 'bing'], ['ScCid', 'snapchat'], ['twclid', 'twitter'],
];

const BY_NAME: [RegExp, string][] = [
  [/^(fb|facebook|meta)/i, 'facebook'], [/^(ig|insta)/i, 'instagram'], [/^(tt|tiktok)/i, 'tiktok'],
  [/^(google|gads|adwords)/i, 'google'], [/^(yt|youtube)/i, 'youtube'], [/^(snap)/i, 'snapchat'],
  [/^(wa|whatsapp)/i, 'whatsapp'], [/^(bing|microsoft)/i, 'bing'], [/^(twitter|x)$/i, 'twitter'],
];

const BY_HOST: [RegExp, string][] = [
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/i, 'facebook'], [/(^|\.)instagram\.com$/i, 'instagram'],
  [/(^|\.)tiktok\.com$/i, 'tiktok'], [/(^|\.)google\.[a-z.]+$/i, 'google'], [/(^|\.)(youtube\.com|youtu\.be)$/i, 'youtube'],
  [/(^|\.)snapchat\.com$/i, 'snapchat'], [/(^|\.)(wa\.me|whatsapp\.com)$/i, 'whatsapp'], [/(^|\.)bing\.com$/i, 'bing'],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/i, 'twitter'],
];

const cut = (v: string | null) => (v ? v.slice(0, 100) : undefined);
const clean = (o: TrafficSource): TrafficSource =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')) as TrafficSource;

/** مصدر هذه الزيارة من رابطها والصفحة السابقة؛ hasSignal = فيها علامة إعلان/UTM/موقع خارجي */
export function detectSource(search: string, referrer: string, host: string): TrafficSource {
  const q = new URLSearchParams(search);
  const utm = { source: cut(q.get('utm_source')), medium: cut(q.get('utm_medium')), campaign: cut(q.get('utm_campaign')), content: cut(q.get('utm_content')) };
  const click = CLICK_IDS.find(([k]) => q.get(k));
  if (click) return clean({ channel: click[1], ...utm });
  if (utm.source) return clean({ channel: BY_NAME.find(([re]) => re.test(utm.source!))?.[1] ?? 'other', ...utm });
  let refHost = '';
  try { refHost = referrer ? new URL(referrer).hostname.replace(/^www\./, '') : ''; } catch { refHost = ''; }
  if (!refHost || refHost === host.replace(/^www\./, '')) return { channel: 'direct' };
  const byHost = BY_HOST.find(([re]) => re.test(refHost))?.[1];
  return byHost ? { channel: byHost } : { channel: 'other', ref: refHost.slice(0, 100) };
}

/** يضيف المصدر لجسم طلب (كائن أو مصفوفة: العنصر الأول) */
export function withSource<T>(body: T, src: TrafficSource | null): T {
  if (!src) return body;
  if (Array.isArray(body)) return body.map((x, i) => (i === 0 && x && typeof x === 'object' ? { ...x, trafficSource: src } : x)) as T;
  if (body && typeof body === 'object') return { ...(body as object), trafficSource: src } as T;
  return body;
}

const KEY = 'mds_src';
const TTL = 30 * 86_400_000;

export function currentSource(): TrafficSource | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { at, src } = JSON.parse(raw);
    return Date.now() - at < TTL ? src : null;
  } catch { return null; }
}

let installed = false;
/** يُستدعى في كل صفحة (AddShow): يحفظ المصدر، ويضيفه لكل طلب يُرسل من الصفحة (الثيمات والنماذج) */
export function installSourceCapture() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  try {
    const now = detectSource(window.location.search, document.referrer, window.location.hostname);
    const saved = currentSource();
    // علامة جديدة (إعلان/UTM/موقع خارجي) تستبدل القديم؛ الدخول المباشر لا يمحو مصدراً محفوظاً
    if (now.channel !== 'direct' || !saved) localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), src: now }));
  } catch { /* وضع خاص */ }
  axios.interceptors.request.use((config) => {
    const isOrder = (config.method ?? 'get').toLowerCase() === 'post' && /\/orders(\/create)?\/?(\?|$)/.test(config.url ?? '');
    if (isOrder) config.data = withSource(config.data, currentSource());
    return config;
  });
}
