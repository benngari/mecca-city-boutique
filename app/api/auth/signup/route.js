import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { logAction } from '@/lib/audit';

// POST /api/auth/signup - public. Creates an INACTIVE admin account that
// needs an existing admin to activate it in User Management before it can log in.
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    await connectDB();
    const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      isActive: false,
    });

    await logAction({ actor: admin.email, action: 'auth.signup', target: admin.email, details: 'Awaiting activation' });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
