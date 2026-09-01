import Link from 'next/link';
import Image from 'next/image';
import { buildWhatsAppLink, productWhatsAppMessage } from '@/lib/whatsapp';

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;
  const soldOut = product.stockStatus === 'sold_out';
  const waHref = buildWhatsAppLink(
    productWhatsAppMessage(product.name, { sku: product.sku, imageUrl: product.images?.[0]?.url })
  );

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-navy-700 dark:bg-navy-800">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-navy-50 dark:bg-navy-700">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-navy-300 dark:text-navy-400">No image</div>
        )}

        {product.discountPrice && !soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy-900">
            Sale
          </span>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-navy-900/90 px-3 py-1 text-xs font-bold text-white">
            Sold Out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-electric-600 dark:text-electric-400">
          {product.category?.replace('_', ' ')}
        </p>
        <Link href={`/product/${product.slug}`} className="font-display text-lg font-semibold leading-snug text-navy hover:text-electric dark:text-cream">
          {product.name}
        </Link>

        <div className="mt-1 flex items-baseline gap-2">
          {product.discountPrice ? (
            <>
              <span className="font-semibold text-emerald">KSh {product.discountPrice.toLocaleString()}</span>
              <span className="text-sm text-navy-300 line-through dark:text-navy-400">KSh {product.price.toLocaleString()}</span>
            </>
          ) : (
            <span className="font-semibold text-navy dark:text-cream">KSh {product.price.toLocaleString()}</span>
          )}
        </div>

        <div className="mt-auto flex gap-2 pt-3">
          <Link
            href={`/product/${product.slug}`}
            className="flex-1 rounded-full border border-navy px-3 py-2 text-center text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-cream dark:border-cream dark:text-cream dark:hover:bg-cream dark:hover:text-navy"
          >
            View Details
          </Link>
          <Link
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full bg-emerald px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-emerald/90"
          >
            Order on WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
}
