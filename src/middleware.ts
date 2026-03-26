import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // 1. استثناء الملفات والـ API والصور (مهم جداً للأداء)
  if (
    path.startsWith('/_next') || 
    path.startsWith('/api') || 
    path.startsWith('/static') ||
    path.includes('.') // استثناء ملفات مثل favicon.ico أو صور المنتجات
  ) {
    return NextResponse.next();
  }

  // جلب الـ Hostname الحقيقي (مع دعم Cloudflare Headers)
  // Cloudflare يرسل الـ Hostname الأصلي في x-forwarded-host أحياناً
  const hostname = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mdstore.top';

  let currentHost: string;

  // 2. منطق تحديد "صاحب المتجر"
  if (hostname.endsWith(`.${rootDomain}`)) {
    // حالة: store1.mdstore.top
    currentHost = hostname.replace(`.${rootDomain}`, '');
  } else if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    // حالة: الموقع الرئيسي mdstore.top
    return NextResponse.next();
  } else {
    // حالة: الدومين المخصص shamsougame.site
    // هنا نفترض أنك قمت بربط الدومين في قاعدة البيانات مع اسم مستخدم أو ID معين
    currentHost = hostname; 
  }

  console.log(currentHost);
  

  // 3. حماية من الحلقات التكرارية (Loop Protection)
  // نتحقق من المسار الفعلي (pathname) والمسار الموجه (destination)
  if (path.startsWith(`/${currentHost}/`) || path === `/${currentHost}`) {
    return NextResponse.next();
  }

  // 4. الـ Rewrite النهائي
  // نقوم ببناء المسار الداخلي مع ضمان عدم وجود "Double Slashes"
  const cleanPath = path === '/' ? '' : path;
  const targetPath = `/${currentHost}${cleanPath}`;

  // Rewrite داخلي دون تغيير الرابط في المتصفح
  return NextResponse.rewrite(new URL(targetPath, req.url));
}