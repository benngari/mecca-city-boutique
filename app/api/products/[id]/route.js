import { NextResponse } from 'next/server';
import slugify from 'slugify';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function GET(request, { params }) {
  await connectDB();
  const { id } = params;

  const product = await Product.findOne({
    $or: [{ _id: isValidId(id) ? id : null }, { slug: id }],
    deletedAt: null,
  }).lean();

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const existing = await Product.findById(params.id);

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (body.name && body.name !== existing.name) {
      let baseSlug = slugify(body.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug, _id: { $ne: params.id } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      body.slug = slug;
    }

    const updated = await Product.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    await logAction({
      actor: session.email,
      action: 'product.update',
      target: updated.name,
      details: `SKU: ${updated.sku}`,
    });

    return NextResponse.json({ product: updated });
  } catch (err) {
    console.error('Update product error:', err);
    if (err.code === 11000) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// DELETE = soft delete (moves to Trash). Use /permanent-delete to actually remove it.
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

    product.deletedAt = new Date();
    await product.save();

    await logAction({
      actor: session.email,
      action: 'product.soft_delete',
      target: product.name,
      details: `SKU: ${product.sku} - moved to Trash`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete product error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

function isValidId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
