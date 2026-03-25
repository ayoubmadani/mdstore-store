import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const path = req.nextUrl.pathname;

  // 1. استثناءات الملفات
  if (path.startsWith('/_next') || path.includes('.') || path.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. استخراج الـ Subdomain بشكل ديناميكي
  // سيقوم بحذف الدومين الأساسي أياً كان (localhost:3000 أو myplatform.com)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  const subdomain = hostname.replace(`.${rootDomain}`, '');

  // 3. التحقق والتوجيه
  // إذا كان الـ hostname هو نفسه الـ rootDomain (يعني المستخدم على الموقع الرئيسي)
  if (hostname === rootDomain || subdomain === 'www') {
    return NextResponse.next();
  }

  // منع التكرار (Loop protection)
  if (path.startsWith(`/${subdomain}`)) {
    return NextResponse.next();
  }

  // إعادة التوجيه للمجلد الديناميكي [domain]
  return NextResponse.rewrite(new URL(`/${subdomain}${path}`, req.url));
}