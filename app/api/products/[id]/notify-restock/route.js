import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { logAction } from '@/lib/audit';

// POST /api/products/[id]/notify-restock - public, no auth. A customer taps
// "Notify Me" on a sold-out product; this just tallies demand so the admin
// knows what to restock first (visible in the products list + audit log).
export async function POST(request, { params }) {
  try {
    await connectDB();
    const product = await Product.findByIdAndUpdate(
      params.id,
      { $inc: { restockRequestCount: 1 } },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await logAction({
      actor: 'customer',
      action: 'restock.requested',
      target: product.name,
      details: `SKU: ${product.sku} - ${product.restockRequestCount} total requests`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Restock request error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
