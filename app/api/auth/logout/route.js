import { NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function POST() {
  const session = await getSession();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });

  if (session?.email) {
    await logAction({ actor: session.email, action: 'auth.logout', target: session.email });
  }

  return response;
}
