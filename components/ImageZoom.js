'use client';

import { useState } from 'react';
import Image from 'next/image';

// Tap a photo to view it full-screen for close-up detail (print pattern,
// fabric texture, stitching). Same interaction pattern as the admin lightbox.
export default function ImageZoom({ src, alt, children }) {
  const [open, setOpen] = useState(false);

  if (!src) return children;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Zoom in on ${alt}`}
        className="block h-full w-full cursor-zoom-in"
      >
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5Z" />
            </svg>
          </button>

          <div
            className="relative h-full max-h-[90vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={src} alt={alt} fill sizes="900px" className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
