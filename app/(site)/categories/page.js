export const dynamic = 'force-dynamic';

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import CategoryCard from '@/components/CategoryCard';
import { CATEGORIES } from '@/lib/constants';

export const metadata = {
  title: 'Categories',
  description: 'Browse Mecca City Boutique products by category.',
};

async function getCategoryCounts() {
  await connectDB();
  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  return CATEGORIES.map((c) => ({ ...c, count: countMap[c.slug] || 0 }));
}

export default async function CategoriesPage() {
  const categories = await getCategoryCounts();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Browse</p>
      <h1 className="font-display text-3xl font-bold text-navy md:text-4xl">Shop by Category</h1>
      <p className="mt-3 max-w-xl text-navy-500">
        From wine dresses to cocktail perfumes — find exactly what you're looking for.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>
    </div>
  );
}
