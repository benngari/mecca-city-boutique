import Link from 'next/link';
import Image from 'next/image';

export default function CategoryCard({ category }) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-2xl bg-navy p-5 transition-transform hover:-translate-y-1"
    >
      {category.image ? (
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}

      <div
        className={`absolute inset-0 transition-opacity group-hover:opacity-100 ${
          category.image
            ? 'bg-gradient-to-t from-navy-900 via-navy-900/50 to-transparent opacity-95'
            : 'bg-gradient-to-br from-electric/40 via-navy to-navy-900 opacity-90'
        }`}
      />

      <div className="relative">
        <p className="font-display text-lg font-semibold text-cream">{category.name}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-emerald">
          {category.count} {category.count === 1 ? 'item' : 'items'}
        </p>
      </div>
    </Link>
  );
}
