import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// POST /api/products/[id]/restore - undo a soft delete (admin only)
export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    product.deletedAt = null;
    await product.save();

    await logAction({
      actor: session.email,
      action: 'product.restore',
      target: product.name,
      details: `SKU: ${product.sku} - restored from Trash`,
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error('Restore product error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
