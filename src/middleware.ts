import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['ar', 'en', 'fr'];
const DEFAULT_LOCALE = 'ar';

function negotiateLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const preferred = acceptLanguage
    .split(',')
    .map((p) => p.split(';')[0].trim().slice(0, 2).toLowerCase());
  return preferred.find((l) => SUPPORTED_LOCALES.includes(l)) ?? DEFAULT_LOCALE;
}

// ── تطوير محلي فقط (localhost) ──────────────────────────────────────────────
// محلياً يكون الدومين في المسار (localhost:3000/a.mdstore.top)، بينما روابط الثيم
// مثل /product/... تفترض أن الدومين هو الـ host (كما في الإنتاج) فيضيع الدومين.
// نحفظ آخر دومين فُتح في كوكي، ونوجّه المسارات بدون دومين إليه داخلياً.
const DEV_DOMAIN_COOKIE = 'dev_store_domain';
const STATIC_EXT = /\.(ico|png|jpe?g|gif|svg|webp|avif|js|mjs|css|map|json|txt|xml|woff2?|ttf|otf|mp4|webm)$/i;

function isLocalHost(hostname: string) {
  return hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1');
}

/** أول جزء من المسار إن كان يشبه دوميناً (a.mdstore.top) لا ملفاً ثابتاً */
function domainSegment(path: string): string | null {
  const first = path.split('/')[1] ?? '';
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(first) && !STATIC_EXT.test(first) ? first.toLowerCase() : null;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl; // لا حاجة لـ clone() هنا في البداية
  const path = url.pathname;
  const host = req.headers.get('host')?.toLowerCase() || '';

  // محلياً: مسار يبدأ بدومين → نتذكّره للروابط التالية
  if (isLocalHost(host) && !path.startsWith('/_next') && !path.startsWith('/api')) {
    const devDomain = domainSegment(path);
    if (devDomain) {
      const res = NextResponse.next();
      res.cookies.set(DEV_DOMAIN_COOKIE, devDomain, { path: '/', sameSite: 'lax' });
      return res;
    }
    // مسار بدون دومين (/product/..., /cart) بعد فتح متجر → نفس المتجر
    const remembered = req.cookies.get(DEV_DOMAIN_COOKIE)?.value;
    if (remembered && path !== '/' && !path.includes('.')) {
      url.pathname = `/${remembered}${path}`;
      return NextResponse.rewrite(url);
    }
  }

  // 1. استثناء الملفات التقنية والملفات الثابتة
  if (path.startsWith('/_next') || path.includes('.')) {
    return NextResponse.next();
  }

  // CORS للـ API routes
  if (path.startsWith('/api')) {
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    const res = NextResponse.next();
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return res;
  }

  // 2. جلب وتجهيز الـ Hostname
  const hostname = req.headers.get('host')?.toLowerCase() || '';
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mdstore.top').toLowerCase();
  const searchHostname = hostname.replace('www.', '');

  // 3. معالجة الموقع الرئيسي — يُعرض هنا مباشرة عبر (site)، مع تحديد اللغة عبر كوكي
  if (searchHostname === rootDomain) {
    const res = NextResponse.next();
    if (!req.cookies.get('NEXT_LOCALE')) {
      res.cookies.set('NEXT_LOCALE', negotiateLocale(req.headers.get('accept-language')), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  }

  // 4. تحديد هوية المتجر (المعرف)
  // نستخدم الـ hostname بالكامل (بدون www) كمعرف للمتجر سواء كان فرعياً أو مخصصاً
  const storeIdentifier = searchHostname;

  // 5. حماية من الحلقات التكرارية (Loop Protection)
  if (path.startsWith(`/${storeIdentifier}`)) {
    return NextResponse.next();
  }

  // 6. التوجيه الداخلي (Rewrite)
  // ملاحظة: Next.js يتعامل مع الـ Rewrite داخلياً بشكل أفضل عند تمرير المسار النسبي
  url.pathname = `/${storeIdentifier}${path}`;
  
  // الـ search params ستنتقل تلقائياً لأننا عدلنا على كائن url نفسه
  return NextResponse.rewrite(url);
}