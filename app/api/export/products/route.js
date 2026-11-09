import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import { toCsv, csvResponse, eatDate } from '@/lib/csv';

// GET /api/export/products  (owner only) - the live catalogue, including buying prices.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.role === 'staff') {
    return NextResponse.json({ error: 'Not authorized for this action' }, { status: 403 });
  }

  await connectDB();
  const products = await Product.find({ deletedAt: null }).sort({ name: 1 }).lean();

  const csv = toCsv(
    [
      { label: 'SKU', value: (p) => p.sku },
      { label: 'Name', value: (p) => p.name },
      { label: 'Category', value: (p) => p.category },
      { label: 'Sold By', value: (p) => p.unitType },
      { label: 'Price (KSh)', value: (p) => p.price },
      { label: 'Discount Price (KSh)', value: (p) => p.discountPrice },
      { label: 'Cost Price (KSh)', value: (p) => p.costPrice },
      { label: 'Stock Quantity', value: (p) => p.stockQuantity },
      { label: 'Stock Status', value: (p) => p.stockStatus },
      { label: 'Low Stock Alert At', value: (p) => p.lowStockThreshold },
      { label: 'Featured', value: (p) => (p.featured ? 'Yes' : 'No') },
      { label: 'Bundle ID', value: (p) => p.bundleId },
      { label: 'Added On', value: (p) => eatDate(p.createdAt) },
    ],
    products
  );

  return csvResponse('mecca-products.csv', csv);
}
