'use client';

import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';

export default function WhatsAppButton() {
  const href = buildWhatsAppLink(generalWhatsAppMessage());

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Mecca City Boutique on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-emerald px-4 py-3 text-white shadow-lg shadow-emerald/30 transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white" aria-hidden="true">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.362.688 4.564 1.874 6.417L4 29l7.775-1.84A11.93 11.93 0 0 0 16 27c6.628 0 12-5.373 12-12S22.629 3 16.001 3zm6.982 17.032c-.29.818-1.437 1.5-2.355 1.694-.629.13-1.451.234-4.219-.907-3.544-1.464-5.826-5.038-6.003-5.27-.176-.232-1.443-1.918-1.443-3.657 0-1.74.907-2.593 1.229-2.95.32-.357.7-.446.933-.446.233 0 .467.002.67.012.215.01.503-.082.787.6.29.696.985 2.4 1.07 2.575.085.176.142.38.028.612-.113.232-.17.376-.336.578-.166.2-.35.448-.5.6-.166.17-.34.353-.146.694.194.34.86 1.42 1.848 2.3 1.27 1.13 2.34 1.48 2.68 1.646.34.166.539.14.738-.084.2-.226.842-.982 1.068-1.32.226-.34.452-.283.762-.17.31.113 1.972.93 2.31 1.098.34.17.566.254.65.396.084.14.084.816-.206 1.634z" />
      </svg>
      <span className="hidden text-sm font-semibold sm:inline">Order on WhatsApp</span>
    </a>
  );
}
