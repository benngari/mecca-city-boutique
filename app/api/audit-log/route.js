import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { getSession } from '@/lib/auth';

// GET /api/audit-log?limit=  (admin only)
export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 300);

  const entries = await AuditLog.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  return NextResponse.json({ entries });
}
