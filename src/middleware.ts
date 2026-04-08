import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // 1. استثناء الملفات التقنية، الـ API، والملفات ذات الامتدادات (صور، favicon، إلخ)
  if (
    path.startsWith('/_next') || 
    path.startsWith('/api') || 
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. جلب الـ Hostname وتنظيفه بالكامل
  let hostname = req.headers.get('host')?.toLowerCase() || '';
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mdstore.top').toLowerCase();

  // تنظيف الـ hostname من الـ www لتوحيد المعالجة
  // هذا يضمن أن www.shamsougame.site تعامل مثل shamsougame.site
  const searchHostname = hostname.replace('www.', '');

  // 3. تحديد المسار الداخلي (Target)
  
  // الحالة أ: الموقع الرئيسي (mdstore.top أو www.mdstore.top)
  if (searchHostname === rootDomain) {
    // جلب الرابط من متغيرات البيئة أو استخدامه مباشرة
    const appUrl = process.env.MDSTORE_APP_URL!;
    
    // إعادة توجيه المستخدم إلى الموقع الرئيسي (Landing Page / App)
    return NextResponse.redirect(new URL(appUrl, req.url));
  }

  let storeIdentifier: string;

  // الحالة ب: الدومين الفرعي (user.mdstore.top)
  if (searchHostname.endsWith(`.${rootDomain}`)) {
    storeIdentifier = searchHostname;
  } else {
    // الحالة ج: الدومين المخصص (custom-domain.com)
    storeIdentifier = searchHostname;
  }

  // 4. حماية من الحلقات التكرارية (Loop Protection)
  if (path.startsWith(`/${storeIdentifier}`)) {
    return NextResponse.next();
  }

  // 5. التوجيه الداخلي (Rewrite)
  // إضافة url.search لضمان انتقال الـ Query Params مثل ?category=...
  
  const targetUrl = new URL(`/${storeIdentifier}${path}${url.search}`, req.url);

  if (process.env.NODE_ENV === "development") {
    return NextResponse.rewrite(new URL(`http://localhost:3000/${storeIdentifier}${path}${url.search}`, req.url));
  }

  return NextResponse.rewrite(targetUrl);
}