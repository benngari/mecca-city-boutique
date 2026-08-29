import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'mcb_admin_session';

async function isValidSession(token) {
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi =
    pathname.startsWith('/api/products') && ['POST', 'PUT', 'DELETE'].includes(request.method);
  const isUploadApi = pathname.startsWith('/api/upload');

  if (!isAdminRoute && !isAdminApi && !isUploadApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = token ? await isValidSession(token) : false;

  if (!valid) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/products/:path*', '/api/upload/:path*'],
};
