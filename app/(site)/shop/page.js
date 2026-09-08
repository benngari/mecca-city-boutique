export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductGrid from '@/components/ProductGrid';
import SearchFilterBar from '@/components/SearchFilterBar';

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse dresses, skirts, tops, jerseys, cocktail perfumes and fresheners at Mecca City Boutique.',
};

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

async function getProducts({ category, search, sort }) {
  await connectDB();
  const query = {};
  if (category && category !== 'all') query.category = category;
  if (search) query.$text = { $search: search };

  const sortOrder = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  const products = await Product.find(query).sort(sortOrder).limit(60).lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function ShopPage({ searchParams }) {
  const products = await getProducts(searchParams);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Full Catalogue</p>
        <h1 className="font-display text-3xl font-bold text-navy dark:text-cream md:text-4xl">Shop All Products</h1>
      </div>

      <Suspense fallback={<div className="h-24" />}>
        <SearchFilterBar />
      </Suspense>

      <ProductGrid products={products} emptyMessage="No products match your search - try another category." />
    </div>
  );
}
