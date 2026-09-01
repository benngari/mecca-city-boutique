'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildWhatsAppLink, productWhatsAppMessage } from '@/lib/whatsapp';

export default function ProductOrderPanel({ productName, sizes, soldOut, sku, imageUrl }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const waHref = buildWhatsAppLink(
    productWhatsAppMessage(productName, { size: selectedSize, sku, imageUrl })
  );

  return (
    <>
      {sizes?.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 dark:text-navy-300">
            {selectedSize ? `Size: ${selectedSize}` : 'Select a size'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  selectedSize === size
                    ? 'border-navy bg-navy text-cream dark:border-electric dark:bg-electric dark:text-navy-900'
                    : 'border-navy-200 text-navy hover:border-navy dark:border-navy-600 dark:text-cream dark:hover:border-cream'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-emerald px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-emerald/90"
        >
          {soldOut ? 'Ask About Restock on WhatsApp' : 'Order on WhatsApp'}
        </Link>
      </div>
    </>
  );
}
