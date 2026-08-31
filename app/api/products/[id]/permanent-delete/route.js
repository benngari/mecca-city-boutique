import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import { deleteImage } from '@/lib/cloudinary';
import { logAction } from '@/lib/audit';

// DELETE /api/products/[id]/permanent-delete - permanently removes a product
// and its Cloudinary images. Only meant to be called from the Trash view.
export async function DELETE(request, { params }) {
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

    await Promise.all((product.images || []).map((img) => deleteImage(img.publicId)));
    await Product.findByIdAndDelete(params.id);

    await logAction({
      actor: session.email,
      action: 'product.permanent_delete',
      target: product.name,
      details: `SKU: ${product.sku} - permanently deleted`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Permanent delete error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
