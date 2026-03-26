import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const path = req.nextUrl.pathname;

  // 1. استثناء الملفات والـ API
  if (path.startsWith('/_next') || path.includes('.') || path.startsWith('/api')) {
    return NextResponse.next();
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'mdstore.top';

  // 2. تحديد الهوية (Subdomain أو Custom Domain)
  let currentHost: string;
  if (hostname.endsWith(`.${rootDomain}`)) {
    currentHost = hostname.replace(`.${rootDomain}`, '');
  } else if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    return NextResponse.next();
  } else {
    // هنا يتم التعامل مع الدومينات المخصصة مثل (client-shop.com)
    currentHost = hostname;
  }

  // 3. منع التكرار (Loop Protection)
  if (path.startsWith(`/${currentHost}`)) {
    return NextResponse.next();
  }

  // 4. البناء الديناميكي للرابط مع الحفاظ على البروتوكول (HTTP أو HTTPS)
  // نحن نستخدم req.nextUrl لضمان أن البروتوكول يبقى كما هو
  const url = req.nextUrl.clone();
  url.pathname = `/${currentHost}${path}`;

  return NextResponse.rewrite(url);
}