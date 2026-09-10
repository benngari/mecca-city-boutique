'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildWhatsAppLink, productWhatsAppMessage, restockWhatsAppMessage } from '@/lib/whatsapp';

export default function ProductOrderPanel({ productId, productName, sizes, soldOut, sku, imageUrl, price }) {
  const [selectedSize, setSelectedSize] = useState(null);

  const waHref = soldOut
    ? buildWhatsAppLink(restockWhatsAppMessage(productName, { sku }))
    : buildWhatsAppLink(productWhatsAppMessage(productName, { size: selectedSize, sku, imageUrl }));

  const orderLabel = soldOut ? 'Notify Me When Back in Stock' : 'Order on WhatsApp';

  // Best-effort tally so the admin can see restock demand - never blocks the
  // WhatsApp navigation even if this fails.
  function handleNotifyClick() {
    if (soldOut && productId) {
      fetch(`/api/products/${productId}/notify-restock`, { method: 'POST' }).catch(() => {});
    }
  }

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

      <div className="mt-8 hidden gap-3 sm:flex">
        <Link
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleNotifyClick}
          className="flex-1 rounded-full bg-emerald px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-emerald/90"
        >
          {orderLabel}
        </Link>
      </div>

      {/* Sticky bar - mobile only, stays visible while scrolling the rest of the page */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-navy-100 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-navy-700 dark:bg-navy-900/95 sm:hidden">
        {price != null && (
          <span className="font-display text-base font-bold text-navy dark:text-cream">
            KSh {price.toLocaleString()}
          </span>
        )}
        <Link
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleNotifyClick}
          className="flex-1 rounded-full bg-emerald px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald/90"
        >
          {orderLabel}
        </Link>
      </div>
    </>
  );
}
