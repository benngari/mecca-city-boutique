export const dynamic = 'force-dynamic';

import CategoryCard from '@/components/CategoryCard';
import { getCategoriesWithPreview } from '@/lib/categories';

export const metadata = {
  title: 'Categories',
  description: 'Browse Mecca City Boutique products by category.',
};

export default async function CategoriesPage() {
  const categories = await getCategoriesWithPreview();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Browse</p>
      <h1 className="font-display text-3xl font-bold text-navy dark:text-cream md:text-4xl">Shop by Category</h1>
      <p className="mt-3 max-w-xl text-navy-500 dark:text-navy-200">
        From wine dresses to cocktail perfumes - find exactly what you're looking for.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>
    </div>
  );
}
