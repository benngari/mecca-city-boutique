'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const isProductPage = pathname?.startsWith('/product/');

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-cream shadow-lg transition-transform hover:scale-105 dark:bg-electric dark:text-navy-900 md:left-8 ${
        isProductPage ? 'bottom-20 sm:bottom-5 md:bottom-8' : 'bottom-5 md:bottom-8'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 5 5 12l1.4 1.4L11 8.8V19h2V8.8l4.6 4.6L19 12z" />
      </svg>
    </button>
  );
}