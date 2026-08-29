'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SHOP_NAME } from '@/lib/constants';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-navy md:text-2xl">
          Mecca <span className="text-electric">City</span> <span className="text-emerald">Boutique</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-wide text-navy/80 transition-colors hover:text-electric"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/shop"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-electric"
          >
            Shop Now
          </Link>
        </nav>

        <button
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`h-0.5 w-6 bg-navy transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-navy transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-navy transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {open && (
        <nav className="border-t border-navy-100 bg-cream px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-base font-semibold text-navy"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-navy px-5 py-3 text-center text-sm font-semibold text-cream"
              >
                Shop Now
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
