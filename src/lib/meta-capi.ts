// Meta Pixel + Conversions API على المتجر:
// - حدث الطلب في المتصفح بمعرّف مطابق لحدث الخادم (lead-/purchase-<الطلب>) فتعدّه Meta مرة واحدة
// - بكسل له CAPI: المتصفح يرسل Lead، والخادم يرسل Purchase عند تأكيد الطلب
// - كل طلب يُنشأ من المتجر يحمل fbp/fbc ورابط الصفحة (لمطابقة الزبون في Meta)
import axios from 'axios';

type FbPixel = { pixelId: string; type: string; isActive?: boolean; capi?: boolean };

export function fbOrderEvent(px: FbPixel, orderId: string, value: number) {
  const fbq = typeof window !== 'undefined' ? (window as any).fbq : undefined;
  if (!fbq || px.type !== 'facebook' || px.isActive === false) return;
  const name = px.capi ? 'Lead' : 'Purchase';
  fbq('trackSingle', px.pixelId, name, { value, currency: 'DZD', content_type: 'product', order_id: orderId }, { eventID: `${name.toLowerCase()}-${orderId}` });
}

const cookie = (n: string) => (typeof document === 'undefined' ? undefined : document.cookie.split('; ').find((c) => c.startsWith(`${n}=`))?.split('=')[1]);

// fbclid في رابط الإعلان ← fbc (إن لم يكن البكسل قد وضعه بعد)؛ يُحفظ للجلسة لأن الزبون يتنقل بين الصفحات
function currentFbc() {
  const fromCookie = cookie('_fbc');
  if (fromCookie) return decodeURIComponent(fromCookie);
  try {
    const id = new URLSearchParams(window.location.search).get('fbclid');
    if (id) sessionStorage.setItem('md_fbc', `fb.1.${Date.now()}.${id}`);
    return sessionStorage.getItem('md_fbc') || undefined;
  } catch {
    return undefined;
  }
}

const metaFields = () => {
  const fbp = cookie('_fbp');
  const fbc = currentFbc();
  return { ...(fbp && { fbp: decodeURIComponent(fbp) }), ...(fbc && { fbc }), eventSourceUrl: window.location.href.slice(0, 1000) };
};

const isOrderCreate = (url?: string, method?: string) => (method ?? 'get').toLowerCase() === 'post' && /\/orders(\/create)?\/?(\?|$)/.test(url ?? '');
const withMeta = (body: unknown) => {
  const m = metaFields();
  if (Array.isArray(body)) return body.map((b) => (b && typeof b === 'object' ? { ...m, ...b } : b));
  return body && typeof body === 'object' ? { ...m, ...(body as object) } : body;
};

let installed = false;
/** مرة واحدة لكل صفحة: يضيف fbp/fbc/الصفحة لكل طلب يُنشأ (axios أو fetch، من أي ثيم) */
export function installCapiCapture() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  currentFbc(); // يلتقط fbclid من رابط الإعلان فور الوصول
  axios.interceptors.request.use((config) => {
    if (isOrderCreate(config.url, config.method)) config.data = withMeta(config.data);
    return config;
  });
  const orig = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (isOrderCreate(url, init?.method) && typeof init?.body === 'string') {
        init = { ...init, body: JSON.stringify(withMeta(JSON.parse(init.body))) };
      }
    } catch { /* جسم غير JSON — يبقى كما هو */ }
    return orig(input as any, init);
  };
}
