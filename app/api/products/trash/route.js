import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';

// GET /api/products/trash - list soft-deleted products (admin only)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const products = await Product.find({ deletedAt: { $ne: null } }).sort({ deletedAt: -1 }).lean();
  return NextResponse.json({ products });
}
