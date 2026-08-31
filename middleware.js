import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'mcb_admin_session';
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/signup'];

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

  const isAdminRoute = pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname);
  const isAdminApi =
    pathname.startsWith('/api/products') &&
    (['POST', 'PUT', 'DELETE'].includes(request.method) || pathname.endsWith('/trash'));
  const isUploadApi = pathname.startsWith('/api/upload');
  const isUsersApi = pathname.startsWith('/api/users');
  const isAuditApi = pathname.startsWith('/api/audit-log');

  if (!isAdminRoute && !isAdminApi && !isUploadApi && !isUsersApi && !isAuditApi) {
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
  matcher: ['/admin/:path*', '/api/products/:path*', '/api/upload/:path*', '/api/users/:path*', '/api/audit-log/:path*'],
};
