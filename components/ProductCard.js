import Link from 'next/link';
import Image from 'next/image';
import { buildWhatsAppLink, productWhatsAppMessage } from '@/lib/whatsapp';

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;
  const soldOut = product.stockStatus === 'sold_out';
  const waHref = buildWhatsAppLink(productWhatsAppMessage(product.name));

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-navy-50">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-navy-300">No image</div>
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
        <p className="text-[11px] font-semibold uppercase tracking-wide text-electric-600">
          {product.category?.replace('_', ' ')}
        </p>
        <Link href={`/product/${product.slug}`} className="font-display text-lg font-semibold leading-snug text-navy hover:text-electric">
          {product.name}
        </Link>

        <div className="mt-1 flex items-baseline gap-2">
          {product.discountPrice ? (
            <>
              <span className="font-semibold text-emerald">KSh {product.discountPrice.toLocaleString()}</span>
              <span className="text-sm text-navy-300 line-through">KSh {product.price.toLocaleString()}</span>
            </>
          ) : (
            <span className="font-semibold text-navy">KSh {product.price.toLocaleString()}</span>
          )}
        </div>

        <div className="mt-auto flex gap-2 pt-3">
          <Link
            href={`/product/${product.slug}`}
            className="flex-1 rounded-full border border-navy px-3 py-2 text-center text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
          >
            View Details
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full bg-emerald px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-emerald/90"
          >
            Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
