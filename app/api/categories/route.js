export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { CATEGORIES } from '@/lib/constants';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/categories - returns categories with live product counts
export async function GET() {
  await connectDB();
  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  const categories = CATEGORIES.map((c) => ({ ...c, count: countMap[c.slug] || 0 }));
  return NextResponse.json({ categories });
}
