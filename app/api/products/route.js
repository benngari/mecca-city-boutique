import { NextResponse } from 'next/server';
import slugify from 'slugify';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';

// GET /api/products?search=&category=&featured=&stockStatus=&limit=&page=
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const stockStatus = searchParams.get('stockStatus');
  const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);

  const query = {};
  if (search) query.$text = { $search: search };
  if (category && category !== 'all') query.category = category;
  if (featured === 'true') query.featured = true;
  if (stockStatus) query.stockStatus = stockStatus;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
}

// POST /api/products  (admin only)
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    const required = ['name', 'description', 'price', 'category', 'sku'];
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    let baseSlug = slugify(body.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const product = await Product.create({
      name: body.name,
      slug,
      description: body.description,
      price: body.price,
      discountPrice: body.discountPrice || null,
      category: body.category,
      images: body.images || [],
      sizes: body.sizes || [],
      stockStatus: body.stockStatus || 'in_stock',
      featured: !!body.featured,
      sku: body.sku,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('Create product error:', err);
    if (err.code === 11000) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
