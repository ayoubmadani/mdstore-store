import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');
  const path = url.pathname;

  // استثناء الملفات الثابتة والـ API من التوجيه
  if (path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')) {
    return NextResponse.next();
  }

  // إذا كنت تستخدم localhost:3000/aystore
  // سنقوم بعمل rewrite للمسار ليكون /[domain]/path
  if (hostname?.includes('localhost:3000')) {
    const parts = path.split('/');
    const domain = parts[1]; // هنا ستكون "aystore"
    const remainingPath = parts.slice(2).join('/') || '';

    if (domain && domain !== 'favicon.ico') {
      return NextResponse.rewrite(new URL(`/${domain}/${remainingPath}`, request.url));
    }
  }

  return NextResponse.next();
}