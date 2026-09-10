'use client';

import Image from 'next/image';
import Link from 'next/link';
import { buildWhatsAppLink, bundleWhatsAppMessage } from '@/lib/whatsapp';
import { shimmerDataUrl } from '@/lib/shimmer';

export default function CompleteTheLook({ mainProduct, items }) {
  if (!items?.length) return null;

  const allItems = [mainProduct, ...items];
  const total = allItems.reduce((sum, item) => sum + (item.discountPrice || item.price), 0);
  const waHref = buildWhatsAppLink(bundleWhatsAppMessage(allItems));

  return (
    <div className="mt-10 rounded-2xl border border-navy-100 bg-navy-50 p-6 dark:border-navy-700 dark:bg-navy-900/60">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Complete the Look</p>
      <p className="mt-1 text-sm text-navy-500 dark:text-navy-200">
        Pairs well with these - order the whole set in one message.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <Link key={item._id} href={`/product/${item.slug}`} className="group">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-navy-100 dark:bg-navy-800">
              {item.images?.[0]?.url && (
                <Image
                  src={item.images[0].url}
                  alt={item.name}
                  fill
                  sizes="150px"
                  placeholder="blur"
                  blurDataURL={shimmerDataUrl(150, 150)}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <p className="mt-2 truncate text-sm font-semibold text-navy dark:text-cream">{item.name}</p>
            <p className="text-xs text-navy-400 dark:text-navy-300">
              KSh {(item.discountPrice || item.price).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy dark:text-cream">
          Set total: KSh {total.toLocaleString()}
        </p>
        <Link
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald/90"
        >
          Order This Look on WhatsApp
        </Link>
      </div>
    </div>
  );
}
