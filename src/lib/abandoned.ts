// «الطلبات المتروكة»: يلتقط ما يكتبه الزبون في أي نموذج طلب (أي ثيم) بمجرد أن يكون الهاتف صحيحاً،
// ويرسله للخادم بهدوء. الطلب المكتمل يحمل نفس مفتاح الجلسة فيُلغى «المتروك».
import axios from 'axios';

type Ctx = { storeId?: string; productId?: string; builderPageId?: string; lpId?: string };
const ctx: Ctx = {};

/** كل صفحة تضيف ما تعرفه (المتجر، المنتج، صفحة الهبوط) */
export function setAbandonedContext(c: Ctx) {
  for (const [k, v] of Object.entries(c)) if (v) (ctx as any)[k] = v;
}

const KEY = 'md_ab_key';
const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^\w-]/g, '');
function sessionKey() {
  try {
    let k = sessionStorage.getItem(KEY);
    if (!k) { k = newKey(); sessionStorage.setItem(KEY, k); }
    return k;
  } catch {
    return '';
  }
}

import { isDzMobile, selectText } from './abandoned-rules';
export { isDzMobile };

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const hint = (el: Field) => [el.name, el.id, (el as HTMLInputElement).placeholder, el.getAttribute('autocomplete'), el.getAttribute('aria-label'),
  el.closest('label')?.textContent, el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent : ''].filter(Boolean).join(' ').toLowerCase();
const valueOf = (el: Field) => (el instanceof HTMLSelectElement ? selectText(el.value, el.selectedOptions[0]?.textContent ?? '') : el.value.trim());

/** يقرأ نموذج الطلب: الهاتف (أي خانة رقمها هاتف جزائري صحيح)، الاسم، الولاية، البلدية، العنوان */
export function readForm(root: ParentNode) {
  const fields = [...root.querySelectorAll<Field>('input, select, textarea')].filter((el) => {
    const t = (el as HTMLInputElement).type;
    return !['hidden', 'password', 'checkbox', 'radio', 'submit', 'button', 'file'].includes(t);
  });
  let phone: string | null = null;
  const out: Record<string, string> = {};
  for (const el of fields) {
    const v = valueOf(el);
    if (!v) continue;
    const h = hint(el);
    const p = isDzMobile(v);
    if (p && !phone && (/(phone|tel|mobile|هاتف|جوال|رقم)/.test(h) || (el as HTMLInputElement).type === 'tel' || /^\+?[\d\s-]{9,}$/.test(v))) { phone = p; continue; }
    if (!out.wilaya && /(wilaya|ولاية|state|province)/.test(h)) out.wilaya = v;
    else if (!out.commune && /(commune|بلدية|city|ville|baladia)/.test(h)) out.commune = v;
    else if (!out.address && /(address|adresse|عنوان)/.test(h)) out.address = v;
    else if (!out.name && /(name|nom|اسم)/.test(h) && !/^\d+$/.test(v)) out.name = v;
  }
  return phone ? { phone, ...out } : null;
}

const cookie = (n: string) => document.cookie.split('; ').find((c) => c.startsWith(`${n}=`))?.split('=')[1];
const productFromUrl = () => window.location.pathname.match(/\/product\/([0-9a-f-]{36})/i)?.[1];

let timer: ReturnType<typeof setTimeout> | undefined;
let pendingEl: Element | null = null; // آخر خانة كُتب فيها ولم يُرسل بعد
let lastSent = '';

function send(el: Element, keepalive = false) {
  const form = readForm(el.closest('form') ?? document);
  if (!form) return;
  const body = {
    sessionKey: sessionKey(), storeId: ctx.storeId, ...form,
    productId: ctx.productId || productFromUrl(), builderPageId: ctx.builderPageId, lpId: ctx.lpId,
    url: window.location.href, fbp: cookie('_fbp') && decodeURIComponent(cookie('_fbp')!), fbc: cookie('_fbc') && decodeURIComponent(cookie('_fbc')!),
  };
  const sig = JSON.stringify(body);
  if (sig === lastSent || !body.sessionKey) return; // لا شيء جديد
  lastSent = sig;
  const url = `${process.env.NEXT_PUBLIC_API_URL}/abandoned`;
  // عند مغادرة الصفحة/تحديثها: keepalive يكمل الطلب حتى بعد إغلاقها
  if (keepalive) fetch(url, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: sig }).catch(() => { lastSent = ''; });
  else axios.post(url, body).catch(() => { lastSent = ''; });
}

function scheduleSend(target: EventTarget | null) {
  const el = target instanceof Element ? target : null;
  if (!el || !el.matches('input, select, textarea') || !ctx.storeId) return;
  pendingEl = el;
  clearTimeout(timer);
  timer = setTimeout(() => { pendingEl = null; send(el); }, 1500);
}

// إرسال فوري بلا انتظار: عند مغادرة الخانة، أو إخفاء/تحديث/إغلاق الصفحة
function flush(keepalive = false) {
  if (!pendingEl) return;
  const el = pendingEl;
  pendingEl = null;
  clearTimeout(timer);
  send(el, keepalive);
}

const isOrderCreate = (url?: string, method?: string) => (method ?? 'get').toLowerCase() === 'post' && /\/orders(\/create)?\/?(\?|$)/.test(url ?? '');
const withKey = (b: unknown) => {
  const k = sessionKey();
  if (!k) return b;
  if (Array.isArray(b)) return b.map((x) => (x && typeof x === 'object' ? { abandonedKey: k, ...x } : x));
  return b && typeof b === 'object' ? { abandonedKey: k, ...(b as object) } : b;
};
// بعد إرسال الطلب: جلسة جديدة (طلب ثانٍ من نفس الزبون يكون «متروكاً» مستقلاً)
const rotate = () => { try { sessionStorage.removeItem(KEY); } catch { /* */ } lastSent = ''; pendingEl = null; clearTimeout(timer); };

let installed = false;
export function installAbandonedCapture() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  document.addEventListener('input', (e) => scheduleSend(e.target), true);
  document.addEventListener('change', (e) => scheduleSend(e.target), true);
  document.addEventListener('focusout', () => flush(), true);
  window.addEventListener('pagehide', () => flush(true));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true); });
  axios.interceptors.request.use((config) => {
    if (isOrderCreate(config.url, config.method)) { config.data = withKey(config.data); setTimeout(rotate, 0); }
    return config;
  });
  const orig = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (isOrderCreate(url, init?.method) && typeof init?.body === 'string') {
        init = { ...init, body: JSON.stringify(withKey(JSON.parse(init.body))) };
        setTimeout(rotate, 0);
      }
    } catch { /* */ }
    return orig(input as any, init);
  };
}
