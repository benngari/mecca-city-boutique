import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'mcb_admin_session';
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/signup'];

async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload;
  } catch {
    return null;
  }
}

function isStaffAllowedPage(pathname) {
  return pathname === '/admin/products';
}

function isStaffAllowedApi(pathname, method) {
  if (pathname === '/api/products' && method === 'GET') return true;
  if (/^\/api\/products\/[^/]+\/sell$/.test(pathname) && method === 'POST') return true;
  return false;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const isAdminRoute = pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname);
  const isAdminApi =
    pathname.startsWith('/api/products') &&
    !pathname.endsWith('/notify-restock') &&
    (['POST', 'PUT', 'DELETE'].includes(method) || pathname.endsWith('/trash'));
  const isUploadApi = pathname.startsWith('/api/upload');
  const isUsersApi = pathname.startsWith('/api/users');
  const isAuditApi = pathname.startsWith('/api/audit-log');
  const isSettingsApi = pathname.startsWith('/api/settings');
  const isExpensesApi = pathname.startsWith('/api/expenses');

  const needsAuth =
    isAdminRoute || isAdminApi || isUploadApi || isUsersApi || isAuditApi || isSettingsApi || isExpensesApi;

  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Staff accounts can only view/use the Products page to record sales -
  // everything else on /admin and every other protected API is owner-only.
  if (session.role === 'staff') {
    if (pathname.startsWith('/admin') && !isStaffAllowedPage(pathname)) {
      return NextResponse.redirect(new URL('/admin/products', request.url));
    }
    if (pathname.startsWith('/api') && !isStaffAllowedApi(pathname, method)) {
      return NextResponse.json({ error: 'Not authorized for this action' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/products/:path*',
    '/api/upload/:path*',
    '/api/users/:path*',
    '/api/audit-log/:path*',
    '/api/settings/:path*',
    '/api/expenses/:path*',
  ],
};