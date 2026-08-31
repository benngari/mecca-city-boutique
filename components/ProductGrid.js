import ProductCard from './ProductCard';

export default function ProductGrid({ products, emptyMessage = 'No products found.' }) {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-200 py-16 text-center text-navy-400 dark:border-navy-700 dark:text-navy-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
