import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { getSession } from '@/lib/auth';

// GET /api/users - list all admin accounts (admin only)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const users = await Admin.find({}, '-passwordHash').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}
