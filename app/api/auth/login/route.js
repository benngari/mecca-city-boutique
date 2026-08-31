import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Your account is pending activation by an existing admin.' },
        { status: 403 }
      );
    }

    const token = await createSessionToken({ sub: admin._id.toString(), email: admin.email, name: admin.name });

    const response = NextResponse.json({ success: true, email: admin.email, name: admin.name });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    await logAction({ actor: admin.email, action: 'auth.login', target: admin.email });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
