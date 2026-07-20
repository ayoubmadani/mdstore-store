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

export function middleware(req: NextRequest) {
  const url = req.nextUrl; // لا حاجة لـ clone() هنا في البداية
  const path = url.pathname;

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