import Link from 'next/link';
import ProductGrid from './ProductGrid';

export default function FeaturedProducts({ products }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Handpicked</p>
          <h2 className="font-display text-3xl font-bold text-navy">Featured Pieces</h2>
        </div>
        <Link href="/shop" className="hidden text-sm font-semibold text-electric hover:text-navy sm:block">
          View all &rarr;
        </Link>
      </div>

      <ProductGrid products={products} emptyMessage="Featured products coming soon — check back shortly." />
    </section>
  );
}
