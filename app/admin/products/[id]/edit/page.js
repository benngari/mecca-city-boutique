export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductForm from '@/components/admin/ProductForm';

async function getProduct(id) {
  await connectDB();
  const product = await Product.findById(id).lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

export default async function EditProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Edit Product</h1>
      <p className="mt-1 text-sm text-navy-400">{product.name}</p>
      <div className="mt-6">
        <ProductForm initialProduct={product} productId={product._id} />
      </div>
    </div>
  );
}
