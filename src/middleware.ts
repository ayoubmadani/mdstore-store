import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['ar', 'en', 'fr'];
const DEFAULT_LOCALE = 'ar';

// أنماط شائعة لبوتات فحص الثغرات (.env, .git, wp-login.php, phpinfo.php...)
const SCANNER_PATH_PATTERN =
  /(^|\/)\.(?!well-known(\/|$))[^/]+|\.(php|aspx?|jsp|cgi|axd|key|pem|tfstate)$|\b(wp-admin|wp-login|wp-json|phpinfo|_profiler|_debugbar|_ignition|telescope|actuator|nginx_status|server-status|server-info|elmah|id_rsa|id_dsa|id_ecdsa|id_ed25519|credentials\.json|secrets\.(json|yml)|serviceaccountkey|service-account|firebase-adminsdk|firebase-service-account|firebase-config|privatekey|terraform\.tfstate|docker-compose|dockerfile|rclone\.conf|swagger\.json|openapi\.json)\b/i;

function negotiateLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const preferred = acceptLanguage
    .split(',')
    .map((p) => p.split(';')[0].trim().slice(0, 2).toLowerCase());
  return preferred.find((l) => SUPPORTED_LOCALES.includes(l)) ?? DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  const hostname = req.headers.get('host')?.toLowerCase() || '';

  // 0. حظر الوصول المباشر عبر رابط النشر الخام لـ Vercel (*.vercel.app) — لا يصل
  // أي عميل حقيقي للمتجر من هذا الرابط أبداً (فقط عبر *.mdstore.top أو دومين
  // مخصص)، وبوتات الفحص تستهدفه بكثرة (favicon.ico/png، /...) وهذه المسارات
  // تحتوي نقطة فتمر من فحص السكانر كملف ثابت وتصل لرندر [domain] كامل (حتى
  // 3.5 ثانية) بدل رفضها فوراً بلا أي تكلفة
  if (hostname.endsWith('.vercel.app')) {
    return new NextResponse(null, { status: 404 });
  }

  // 1. حظر فوري لمسارات فحص الثغرات المعروفة
  if (!path.startsWith('/api') && SCANNER_PATH_PATTERN.test(path)) {
    return new NextResponse(null, { status: 404 });
  }

  // 2. استثناء الملفات التقنية، الأيقونات، والملفات الثابتة
  // التعديل: استثناء صريح لملفات favicon والصور الشائعة
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') ||
    path === '/favicon.ico' ||
    path === '/favicon.png'
  ) {
    // معالجة CORS لطلبات /api
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

    return NextResponse.next();
  }

  // 3. تجهيز rootDomain (الـ hostname محسوب مسبقاً في الأعلى)
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mdstore.top').toLowerCase();
  const searchHostname = hostname.replace('www.', '');

  // 4. معالجة الموقع الرئيسي — تحديد اللغة عبر الكوكي
  if (searchHostname === rootDomain) {
    // إذا كانت الكوكي موجودة مسبقاً، نرجع NextResponse.next() مباشرة دون تعديل
    if (req.cookies.has('NEXT_LOCALE')) {
      return NextResponse.next();
    }
    const res = NextResponse.next();
    res.cookies.set('NEXT_LOCALE', negotiateLocale(req.headers.get('accept-language')), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  }

  // 5. تحديد هوية المتجر (المعرف)
  const storeIdentifier = searchHostname;

  // 6. حماية من الحلقات التكرارية (Loop Protection)
  if (path.startsWith(`/${storeIdentifier}`)) {
    return NextResponse.next();
  }

  // 7. التوجيه الداخلي (Rewrite)
  url.pathname = `/${storeIdentifier}${path}`;
  return NextResponse.rewrite(url);
}

// 8. إضافة matcher استباقي لتصفية الطلبات قبل دخول الميدلوير اصلاً
export const config = {
  matcher: [
    /*
     * استثناء كافة مسارات الملفات الثابتة والأيقونات والأصول التقنية من تشغيل الـ Middleware:
     * - _next/static (Static files)
     * - _next/image (Image optimization)
     * - favicon.ico, favicon.png, robot.txt, sitemap.xml
     * - جميع الصور والملفات (.png, .jpg, .svg, .css, .js)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
