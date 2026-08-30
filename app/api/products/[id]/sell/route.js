import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';

// POST /api/products/[id]/sell  body: { quantity?: number }  (admin only)
// Decrements stockQuantity by `quantity` (default 1) and auto-updates stockStatus.
export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const soldQuantity = Number(body.quantity) > 0 ? Number(body.quantity) : 1;

    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stockQuantity == null) {
      return NextResponse.json(
        { error: 'This product has no stock quantity set. Add one in Edit Product first.' },
        { status: 400 }
      );
    }

    const newQuantity = Math.max(0, product.stockQuantity - soldQuantity);
    let stockStatus = 'in_stock';
    if (newQuantity === 0) stockStatus = 'sold_out';
    else if (newQuantity <= 3) stockStatus = 'low_stock';

    product.stockQuantity = newQuantity;
    product.stockStatus = stockStatus;
    await product.save();

    return NextResponse.json({ product });
  } catch (err) {
    console.error('Record sale error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}