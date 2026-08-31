import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// POST /api/products/[id]/restock  body: { quantity: number }  (admin only)
// Adds to stockQuantity and auto-updates stockStatus. If the product had no
// quantity tracked yet, this starts tracking it from `quantity`.
export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const addedQuantity = Number(body.quantity) > 0 ? Number(body.quantity) : 0;

    if (!addedQuantity) {
      return NextResponse.json({ error: 'Enter a quantity greater than 0' }, { status: 400 });
    }

    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newQuantity = (product.stockQuantity || 0) + addedQuantity;
    let stockStatus = 'in_stock';
    if (newQuantity === 0) stockStatus = 'sold_out';
    else if (newQuantity <= 3) stockStatus = 'low_stock';

    product.stockQuantity = newQuantity;
    product.stockStatus = stockStatus;
    await product.save();

    await logAction({
      actor: session.email,
      action: 'stock.restock',
      target: product.name,
      details: `Added ${addedQuantity}, ${newQuantity} now in stock`,
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error('Restock error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
