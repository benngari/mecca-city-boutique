import Link from 'next/link';

export default function CategoryCard({ category }) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-2xl bg-navy p-5 transition-transform hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-electric/40 via-navy to-navy-900 opacity-90 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <p className="font-display text-lg font-semibold text-cream">{category.name}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-emerald">
          {category.count} {category.count === 1 ? 'item' : 'items'}
        </p>
      </div>
    </Link>
  );
}
