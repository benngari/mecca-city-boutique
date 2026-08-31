New-Item -ItemType Directory -Force -Path "app\api\auth\signup" | Out-Null
New-Item -ItemType Directory -Force -Path "app\api\users\[id]" | Out-Null
New-Item -ItemType Directory -Force -Path "app\api\products\[id]\restock" | Out-Null
New-Item -ItemType Directory -Force -Path "app\api\products\[id]\restore" | Out-Null
New-Item -ItemType Directory -Force -Path "app\api\products\[id]\permanent-delete" | Out-Null
New-Item -ItemType Directory -Force -Path "app\api\products\trash" | Out-Null
New-Item -ItemType Directory -Force -Path "app\api\audit-log" | Out-Null
New-Item -ItemType Directory -Force -Path "app\admin\signup" | Out-Null
New-Item -ItemType Directory -Force -Path "app\admin\(dashboard)\reports" | Out-Null
New-Item -ItemType Directory -Force -Path "app\admin\(dashboard)\trash" | Out-Null
New-Item -ItemType Directory -Force -Path "app\admin\(dashboard)\audit-log" | Out-Null
New-Item -ItemType Directory -Force -Path "app\admin\(dashboard)\users" | Out-Null

@'
import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
'@ | Set-Content -Encoding UTF8 models\Admin.js

@'
import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true }, // admin email, or "system"
    action: { type: String, required: true }, // e.g. "product.create", "auth.login"
    target: { type: String, default: '' }, // e.g. product name/SKU, user email
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
'@ | Set-Content -Encoding UTF8 models\AuditLog.js

@'
import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null },
    category: { type: String, required: true, index: true },
    images: { type: [ImageSchema], default: [] },
    sizes: { type: [String], default: [] },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'sold_out'],
      default: 'in_stock',
    },
    stockQuantity: { type: Number, min: 0, default: null },
    featured: { type: Boolean, default: false },
    sku: { type: String, required: true, unique: true, trim: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
'@ | Set-Content -Encoding UTF8 models\Product.js

@'
import { connectDB } from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

// Best-effort audit logging - never throws, so a logging failure never breaks
// the action it's recording (a sale, a login, a delete, etc).
export async function logAction({ actor, action, target = '', details = '' }) {
  try {
    await connectDB();
    await AuditLog.create({ actor: actor || 'system', action, target, details });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
'@ | Set-Content -Encoding UTF8 lib\audit.js

@'
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { CATEGORIES } from '@/lib/constants';

// Aggregates live (non-deleted) stock into per-category counts and KSh value,
// used by the admin dashboard, the reports page, and the storage-style bar.
export async function getInventorySummary() {
  await connectDB();

  const results = await Product.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
        units: { $sum: { $ifNull: ['$stockQuantity', 0] } },
        value: {
          $sum: {
            $multiply: [
              { $ifNull: ['$stockQuantity', 0] },
              { $ifNull: ['$discountPrice', '$price'] },
            ],
          },
        },
      },
    },
  ]);

  const byCategory = Object.fromEntries(results.map((r) => [r._id, r]));

  const categories = CATEGORIES.map((c) => ({
    ...c,
    productCount: byCategory[c.slug]?.productCount || 0,
    units: byCategory[c.slug]?.units || 0,
    value: byCategory[c.slug]?.value || 0,
  }));

  const totals = categories.reduce(
    (acc, c) => ({
      productCount: acc.productCount + c.productCount,
      units: acc.units + c.units,
      value: acc.value + c.value,
    }),
    { productCount: 0, units: 0, value: 0 }
  );

  return { categories, totals };
}
'@ | Set-Content -Encoding UTF8 lib\inventory.js

@'
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'mcb_admin_session';
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/signup'];

async function isValidSession(token) {
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname);
  const isAdminApi =
    pathname.startsWith('/api/products') &&
    (['POST', 'PUT', 'DELETE'].includes(request.method) || pathname.endsWith('/trash'));
  const isUploadApi = pathname.startsWith('/api/upload');
  const isUsersApi = pathname.startsWith('/api/users');
  const isAuditApi = pathname.startsWith('/api/audit-log');

  if (!isAdminRoute && !isAdminApi && !isUploadApi && !isUsersApi && !isAuditApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = token ? await isValidSession(token) : false;

  if (!valid) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/products/:path*', '/api/upload/:path*', '/api/users/:path*', '/api/audit-log/:path*'],
};
'@ | Set-Content -Encoding UTF8 middleware.js

@'
/**
 * Creates (or resets) the FIRST admin account, using ADMIN_NAME / ADMIN_EMAIL /
 * ADMIN_PASSWORD from .env.local. This account is created already ACTIVE, since
 * there's no other admin yet to activate it. Every admin after this one signs up
 * at /admin/signup and needs an existing admin to activate them in User Management.
 * Run with: npm run create-admin
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Missing MONGODB_URI, ADMIN_EMAIL or ADMIN_PASSWORD in .env.local');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const AdminSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      isActive: { type: Boolean, default: false },
    },
    { timestamps: true }
  );
  const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await Admin.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    { name: ADMIN_NAME || 'Admin', email: ADMIN_EMAIL.toLowerCase(), passwordHash, isActive: true },
    { upsert: true, new: true }
  );

  console.log(`Admin account ready: ${admin.email} (active)`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
'@ | Set-Content -Encoding UTF8 scripts\create-admin.js

@'
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/mecca-city-boutique?retryWrites=true&w=majority

# Cloudinary (from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Auth / session
JWT_SECRET=replace_with_a_long_random_string
ADMIN_NAME=Your Name
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=choose_a_strong_password

# Public site config
NEXT_PUBLIC_SITE_URL=https://meccacityboutique.co.ke
NEXT_PUBLIC_WHATSAPP_NUMBER=254719215341
NEXT_PUBLIC_WHATSAPP_NUMBER_SECONDARY=254708743903
'@ | Set-Content -Encoding UTF8 .env.example

@'
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Your account is pending activation by an existing admin.' },
        { status: 403 }
      );
    }

    const token = await createSessionToken({ sub: admin._id.toString(), email: admin.email, name: admin.name });

    const response = NextResponse.json({ success: true, email: admin.email, name: admin.name });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    await logAction({ actor: admin.email, action: 'auth.login', target: admin.email });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
'@ | Set-Content -Encoding UTF8 "app\api\auth\login\route.js"

@'
import { NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function POST() {
  const session = await getSession();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });

  if (session?.email) {
    await logAction({ actor: session.email, action: 'auth.logout', target: session.email });
  }

  return response;
}
'@ | Set-Content -Encoding UTF8 "app\api\auth\logout\route.js"

@'
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { logAction } from '@/lib/audit';

// POST /api/auth/signup - public. Creates an INACTIVE admin account that
// needs an existing admin to activate it in User Management before it can log in.
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    await connectDB();
    const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      isActive: false,
    });

    await logAction({ actor: admin.email, action: 'auth.signup', target: admin.email, details: 'Awaiting activation' });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
'@ | Set-Content -Encoding UTF8 "app\api\auth\signup\route.js"

@'
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { getSession } from '@/lib/auth';

// GET /api/users - list all admin accounts (admin only)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const users = await Admin.find({}, '-passwordHash').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}
'@ | Set-Content -Encoding UTF8 "app\api\users\route.js"

@'
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// PATCH /api/users/[id]  body: { isActive?: boolean, newPassword?: string }  (admin only)
export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const target = await Admin.findById(params.id);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const isSelf = target._id.toString() === session.sub;

    if (typeof body.isActive === 'boolean') {
      if (isSelf) {
        return NextResponse.json({ error: "You can't change your own activation status" }, { status: 400 });
      }
      target.isActive = body.isActive;
      await target.save();
      await logAction({
        actor: session.email,
        action: body.isActive ? 'user.activate' : 'user.deactivate',
        target: target.email,
      });
    }

    if (body.newPassword) {
      if (body.newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      target.passwordHash = await bcrypt.hash(body.newPassword, 10);
      await target.save();
      await logAction({ actor: session.email, action: 'user.reset_password', target: target.email });
    }

    const { passwordHash, ...safeUser } = target.toObject();
    return NextResponse.json({ user: safeUser });
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
'@ | Set-Content -Encoding UTF8 -LiteralPath "app\api\users\[id]\route.js"

@'
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { getSession } from '@/lib/auth';

// GET /api/audit-log?limit=  (admin only)
export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 300);

  const entries = await AuditLog.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  return NextResponse.json({ entries });
}
'@ | Set-Content -Encoding UTF8 "app\api\audit-log\route.js"

@'
import { NextResponse } from 'next/server';
import slugify from 'slugify';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// GET /api/products?search=&category=&featured=&stockStatus=&limit=&page=
// Only returns non-deleted products. Use /api/products/trash for soft-deleted ones.
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const stockStatus = searchParams.get('stockStatus');
  const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);

  const query = { deletedAt: null };
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
      stockQuantity: body.stockQuantity ?? null,
      featured: !!body.featured,
      sku: body.sku,
    });

    await logAction({
      actor: session.email,
      action: 'product.create',
      target: product.name,
      details: `SKU: ${product.sku}`,
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
'@ | Set-Content -Encoding UTF8 "app\api\products\route.js"

@'
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
'@ | Set-Content -Encoding UTF8 -LiteralPath "app\api\products\[id]\route.js"

@'
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';

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

    await logAction({
      actor: session.email,
      action: 'stock.sell',
      target: product.name,
      details: `Sold ${soldQuantity}, ${newQuantity} remaining`,
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error('Record sale error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
'@ | Set-Content -Encoding UTF8 -LiteralPath "app\api\products\[id]\sell\route.js"

@'
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
'@ | Set-Content -Encoding UTF8 -LiteralPath "app\api\products\[id]\restock\route.js"

@'
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
'@ | Set-Content -Encoding UTF8 -LiteralPath "app\api\products\[id]\restore\route.js"

@'
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
'@ | Set-Content -Encoding UTF8 -LiteralPath "app\api\products\[id]\permanent-delete\route.js"

@'
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
'@ | Set-Content -Encoding UTF8 "app\api\products\trash\route.js"

@'
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);

  useEffect(() => {
    if (searchParams.get('loggedout') === 'true') {
      setLoggedOutNotice(true);
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoggedOutNotice(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = searchParams.get('next') || '/admin';
      }, 800);
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <p className="font-display text-2xl font-bold text-navy">Admin Login</p>
        <p className="mt-1 text-sm text-navy-400">Mecca City Boutique</p>

        {loggedOutNotice && !success && (
          <p className="mt-4 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-500">
            You have been logged out.
          </p>
        )}

        {success && (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald/10 px-3 py-2 text-sm font-semibold text-emerald">
            Login successful - redirecting...
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <label className="mt-6 block text-sm font-semibold text-navy">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-navy">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={loading || success}
          className="mt-6 w-full rounded-full bg-navy py-3 text-sm font-semibold text-cream hover:bg-electric disabled:opacity-60"
        >
          {success ? 'Signed in...' : loading ? 'Signing in...' : 'Sign In'}
        </button>

        <Link href="/admin/signup" className="mt-4 block text-center text-xs font-semibold text-navy-400 hover:text-electric">
          Need an account? Request access
        </Link>
      </form>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 app\admin\login\page.js

@'
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 px-5">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
          <p className="font-display text-2xl font-bold text-navy">Account created</p>
          <p className="mt-3 text-sm text-navy-500">
            An existing admin needs to activate your account in User Management before you can
            sign in.
          </p>
          <Link href="/admin/login" className="mt-6 inline-block text-sm font-semibold text-electric">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <p className="font-display text-2xl font-bold text-navy">Request Admin Access</p>
        <p className="mt-1 text-sm text-navy-400">Mecca City Boutique</p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <label className="mt-6 block text-sm font-semibold text-navy">
          Full Name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-navy">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-navy">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
          <span className="mt-1 block text-xs font-normal text-navy-400">At least 8 characters.</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-navy py-3 text-sm font-semibold text-cream hover:bg-electric disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Request Access'}
        </button>

        <Link href="/admin/login" className="mt-4 block text-center text-xs font-semibold text-navy-400 hover:text-electric">
          Already have an account? Sign in
        </Link>
      </form>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 app\admin\signup\page.js

@'
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/products/new', label: 'Add Product' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/trash', label: 'Trash' },
  { href: '/admin/audit-log', label: 'Audit Log' },
  { href: '/admin/users', label: 'Users' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Hard navigation so the cleared session cookie is guaranteed to be picked up
    window.location.href = '/admin/login?loggedout=true';
  }

  return (
    <aside className="flex w-full flex-col justify-between border-b border-navy-700 bg-navy-900 p-4 md:h-screen md:w-60 md:gap-1 md:border-b-0 md:border-r md:p-6">
      <div>
        <p className="font-display text-lg font-bold text-cream md:mb-8">
          MCB <span className="text-electric-400">Admin</span>
        </p>
        <nav className="mt-3 flex flex-wrap gap-1 md:mt-0 md:flex-col">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active ? 'bg-electric text-navy-900' : 'text-navy-200 hover:bg-navy-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="mt-3 h-fit w-fit rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-200 hover:bg-navy-700 md:mt-0"
      >
        Log Out
      </button>
    </aside>
  );
}
'@ | Set-Content -Encoding UTF8 components\admin\AdminSidebar.js

@'
'use client';

const SEGMENT_COLORS = [
  '#2D8FE0', // electric
  '#16A34A', // emerald
  '#F5B301', // gold
  '#8598C9', // navy-300
  '#4C63A0', // navy-400
  '#1D6FB8', // electric-600
  '#22C55E', // green
  '#EAB308', // amber
  '#64748B', // slate
];

// A phone-storage-style segmented bar: each category gets a share of the bar
// proportional to its stock units (or value), with a colour-coded legend below.
export default function StorageBar({ categories, metric = 'units', valueFormatter }) {
  const total = categories.reduce((sum, c) => sum + (c[metric] || 0), 0);
  const withData = categories.filter((c) => (c[metric] || 0) > 0);

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-200 p-6 text-center text-sm text-navy-400 dark:border-navy-700 dark:text-navy-300">
        No stock quantities tracked yet - set a Stock Quantity on your products to see the breakdown here.
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
        {withData.map((c, i) => (
          <div
            key={c.slug}
            style={{ width: `${((c[metric] || 0) / total) * 100}%`, backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
            title={`${c.name}: ${c[metric]}`}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {withData.map((c, i) => (
          <div key={c.slug} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
            />
            <span className="truncate text-navy-500 dark:text-navy-200">{c.name}</span>
            <span className="ml-auto shrink-0 font-semibold text-navy dark:text-cream">
              {valueFormatter ? valueFormatter(c[metric]) : c[metric]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 components\admin\StorageBar.js

@'
export default function StatsCard({ label, value, accent = 'text-navy dark:text-cream' }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 dark:text-navy-300">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 components\admin\StatsCard.js

@'
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import AuditLog from '@/models/AuditLog';
import StatsCard from '@/components/admin/StatsCard';
import StorageBar from '@/components/admin/StorageBar';
import { getInventorySummary } from '@/lib/inventory';
import { CATEGORIES } from '@/lib/constants';

async function getStats() {
  await connectDB();

  const [total, available, soldOut, trashCount, recentProducts, recentActivity, inventory] = await Promise.all([
    Product.countDocuments({ deletedAt: null }),
    Product.countDocuments({ deletedAt: null, stockStatus: { $ne: 'sold_out' } }),
    Product.countDocuments({ deletedAt: null, stockStatus: 'sold_out' }),
    Product.countDocuments({ deletedAt: { $ne: null } }),
    Product.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(5).lean(),
    AuditLog.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    getInventorySummary(),
  ]);

  return {
    total,
    available,
    soldOut,
    trashCount,
    recentProducts: JSON.parse(JSON.stringify(recentProducts)),
    recentActivity: JSON.parse(JSON.stringify(recentActivity)),
    inventory,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Dashboard</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">Overview of Mecca City Boutique's catalogue.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard label="Total Products" value={stats.total} />
        <StatsCard label="Available" value={stats.available} accent="text-emerald" />
        <StatsCard label="Sold Out" value={stats.soldOut} accent="text-red-500" />
        <StatsCard label="In Trash" value={stats.trashCount} accent="text-navy-400" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatsCard label="Units in Stock" value={stats.inventory.totals.units} accent="text-electric-600" />
        <StatsCard
          label="Stock Value"
          value={`KSh ${stats.inventory.totals.value.toLocaleString()}`}
          accent="text-gold"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
        <p className="mb-4 text-sm font-semibold text-navy dark:text-cream">Stock by Category</p>
        <StorageBar categories={stats.inventory.categories} metric="units" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-navy dark:text-cream">Recent Products</p>
            <Link href="/admin/products" className="text-xs font-semibold text-electric">
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {stats.recentProducts.map((p) => (
              <li key={p._id} className="flex items-center justify-between text-sm">
                <span className="text-navy-500 dark:text-navy-200">{p.name}</span>
                <span className="text-navy-400 dark:text-navy-300">KSh {p.price.toLocaleString()}</span>
              </li>
            ))}
            {stats.recentProducts.length === 0 && (
              <p className="text-sm text-navy-300 dark:text-navy-400">No products yet.</p>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-navy dark:text-cream">Recent Activity</p>
            <Link href="/admin/audit-log" className="text-xs font-semibold text-electric">
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {stats.recentActivity.map((entry) => (
              <li key={entry._id} className="text-sm">
                <p className="text-navy-500 dark:text-navy-200">
                  <span className="font-semibold text-navy dark:text-cream">{entry.actor}</span>{' '}
                  {entry.action.replace('.', ' ').replace('_', ' ')}
                  {entry.target ? ` - ${entry.target}` : ''}
                </p>
                <p className="text-xs text-navy-400 dark:text-navy-400">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
            {stats.recentActivity.length === 0 && (
              <p className="text-sm text-navy-300 dark:text-navy-400">No activity recorded yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\admin\(dashboard)\page.js"

@'
export const dynamic = 'force-dynamic';

import StorageBar from '@/components/admin/StorageBar';
import StatsCard from '@/components/admin/StatsCard';
import { getInventorySummary } from '@/lib/inventory';

export default async function ReportsPage() {
  const inventory = await getInventorySummary();
  const lowStockCategories = inventory.categories
    .filter((c) => c.productCount > 0)
    .sort((a, b) => a.units - b.units);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Reports</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        Current stock levels and worth, by category.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <StatsCard label="Total Units in Stock" value={inventory.totals.units} accent="text-electric-600" />
        <StatsCard
          label="Total Stock Value"
          value={`KSh ${inventory.totals.value.toLocaleString()}`}
          accent="text-gold"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
        <p className="mb-4 text-sm font-semibold text-navy dark:text-cream">Stock Value by Category</p>
        <StorageBar
          categories={inventory.categories}
          metric="value"
          valueFormatter={(v) => `KSh ${v.toLocaleString()}`}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Units</th>
              <th className="px-4 py-3">Value</th>
            </tr>
          </thead>
          <tbody>
            {inventory.categories.map((c) => (
              <tr key={c.slug} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                <td className="px-4 py-3 text-navy dark:text-cream">{c.name}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">{c.productCount}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">{c.units}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">KSh {c.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lowStockCategories.some((c) => c.units <= 3 && c.units > 0) && (
        <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-6">
          <p className="text-sm font-semibold text-navy dark:text-cream">Running Low</p>
          <ul className="mt-2 space-y-1 text-sm text-navy-500 dark:text-navy-200">
            {lowStockCategories
              .filter((c) => c.units <= 3 && c.units > 0)
              .map((c) => (
                <li key={c.slug}>{c.name} - {c.units} left</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\admin\(dashboard)\reports\page.js"

@'
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TrashPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function loadTrash() {
    setLoading(true);
    const res = await fetch('/api/products/trash');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    loadTrash();
  }, []);

  async function handleRestore(id) {
    setBusyId(id);
    const res = await fetch(`/api/products/${id}/restore`, { method: 'POST' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      alert('Failed to restore product.');
    }
    setBusyId(null);
  }

  async function handlePermanentDelete(id) {
    if (!confirm('Permanently delete this product and its images? This cannot be undone.')) return;
    setBusyId(id);
    const res = await fetch(`/api/products/${id}/permanent-delete`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      alert('Failed to delete product.');
    }
    setBusyId(null);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Trash</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        Deleted products stay here until you restore or permanently delete them.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Deleted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Trash is empty.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p._id} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-navy-50 dark:bg-navy-700">
                      {p.images?.[0]?.url && (
                        <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-navy dark:text-cream">{p.name}</p>
                      <p className="text-xs text-navy-400 dark:text-navy-300">SKU: {p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">
                  {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleRestore(p._id)}
                      disabled={busyId === p._id}
                      className="font-semibold text-emerald disabled:opacity-50"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(p._id)}
                      disabled={busyId === p._id}
                      className="font-semibold text-red-500 disabled:opacity-50"
                    >
                      Delete Forever
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\admin\(dashboard)\trash\page.js"

@'
export const dynamic = 'force-dynamic';

import { connectDB } from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

async function getEntries() {
  await connectDB();
  const entries = await AuditLog.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return JSON.parse(JSON.stringify(entries));
}

export default async function AuditLogPage() {
  const entries = await getEntries();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Audit Log</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        Every admin action, most recent first (last 200 entries).
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Who</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  No activity recorded yet.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr key={entry._id} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                <td className="whitespace-nowrap px-4 py-3 text-navy-500 dark:text-navy-200">
                  {new Date(entry.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-navy dark:text-cream">{entry.actor}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy dark:bg-navy-700 dark:text-cream">
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">{entry.target || '-'}</td>
                <td className="px-4 py-3 text-navy-400 dark:text-navy-300">{entry.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\admin\(dashboard)\audit-log\page.js"

@'
'use client';

import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleToggleActive(id, nextValue) {
    setBusyId(id);
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: nextValue }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Could not update user.');
    } else {
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
    }
    setBusyId(null);
  }

  async function handleResetPassword(id) {
    const newPassword = prompt('Enter a new password for this user (min 8 characters):');
    if (!newPassword) return;

    setBusyId(id);
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Could not reset password.');
    } else {
      alert('Password reset successfully.');
    }
    setBusyId(null);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">User Management</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        New signups from /admin/signup arrive here inactive. Activate them below before they can
        sign in.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  No admin accounts found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u._id} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                <td className="px-4 py-3 text-navy dark:text-cream">{u.name}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      u.isActive ? 'bg-emerald/10 text-emerald' : 'bg-gold/20 text-gold'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleToggleActive(u._id, !u.isActive)}
                      disabled={busyId === u._id}
                      className={`font-semibold disabled:opacity-50 ${
                        u.isActive ? 'text-red-500' : 'text-emerald'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleResetPassword(u._id)}
                      disabled={busyId === u._id}
                      className="font-semibold text-electric disabled:opacity-50"
                    >
                      Reset Password
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\admin\(dashboard)\users\page.js"

@'
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function loadProducts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('limit', '100');
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id) {
    if (!confirm('Move this product to Trash? You can restore it later.')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      alert('Failed to delete product.');
    }
  }

  async function handleRecordSale(id) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/products/${id}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Could not record sale.');
        return;
      }

      setProducts((prev) => prev.map((p) => (p._id === id ? data.product : p)));
    } catch {
      alert('Something went wrong. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleAddStock(id) {
    const input = prompt('How many units to add to stock?');
    const quantity = Number(input);
    if (!quantity || quantity <= 0) return;

    setBusyId(id);
    try {
      const res = await fetch(`/api/products/${id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Could not add stock.');
        return;
      }

      setProducts((prev) => prev.map((p) => (p._id === id ? data.product : p)));
    } catch {
      alert('Something went wrong. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Products</h1>
          <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">{products.length} product(s)</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-electric"
        >
          + Add Product
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadProducts();
        }}
        className="mt-6 flex gap-3"
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full max-w-sm rounded-full border border-navy-200 bg-white px-4 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-cream"
        />
        <button type="submit" className="rounded-full bg-navy-100 px-5 py-2.5 text-sm font-semibold text-navy dark:bg-navy-800 dark:text-cream">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[780px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  No products yet - add your first product.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p._id} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-navy-50 dark:bg-navy-700">
                      {p.images?.[0]?.url && (
                        <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-navy dark:text-cream">{p.name}</p>
                      <p className="text-xs text-navy-400 dark:text-navy-300">SKU: {p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-navy-500 dark:text-navy-200">{p.category}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">KSh {p.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.stockStatus === 'sold_out'
                        ? 'bg-red-50 text-red-600'
                        : p.stockStatus === 'low_stock'
                        ? 'bg-gold/20 text-gold'
                        : 'bg-emerald/10 text-emerald'
                    }`}
                  >
                    {p.stockStatus.replace('_', ' ')}
                  </span>
                  {p.stockQuantity != null && (
                    <p className="mt-1 text-xs text-navy-400 dark:text-navy-300">{p.stockQuantity} left</p>
                  )}
                </td>
                <td className="px-4 py-3">{p.featured ? '★' : '-'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      onClick={() => handleAddStock(p._id)}
                      disabled={busyId === p._id}
                      className="font-semibold text-electric disabled:opacity-50"
                    >
                      Add Stock
                    </button>
                    {p.stockQuantity != null && p.stockQuantity > 0 && (
                      <button
                        onClick={() => handleRecordSale(p._id)}
                        disabled={busyId === p._id}
                        className="font-semibold text-emerald disabled:opacity-50"
                      >
                        Record Sale
                      </button>
                    )}
                    <Link href={`/admin/products/${p._id}/edit`} className="font-semibold text-electric">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(p._id)} className="font-semibold text-red-500">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\admin\(dashboard)\products\page.js"
