'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { LOGO_URL, SHOP_NAME } from '@/lib/constants';
import ThemeToggle from './ThemeToggle';

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
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-cream/90 backdrop-blur dark:border-navy-700 dark:bg-navy-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src={LOGO_URL} alt={`${SHOP_NAME} logo`} width={36} height={36} className="rounded-md" />
          <span className="font-display text-xl font-bold tracking-tight text-navy dark:text-cream md:text-2xl">
            Mecca <span className="text-electric">City</span> <span className="text-emerald">Boutique</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-wide text-navy/80 transition-colors hover:text-electric dark:text-navy-200"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            href="/shop"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-electric dark:bg-electric dark:text-navy-900 dark:hover:bg-electric-400"
          >
            Shop Now
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            className="flex flex-col gap-1.5"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`h-0.5 w-6 bg-navy transition-transform dark:bg-cream ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-6 bg-navy transition-opacity dark:bg-cream ${open ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-6 bg-navy transition-transform dark:bg-cream ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-navy-100 bg-cream px-5 py-4 dark:border-navy-700 dark:bg-navy-900 md:hidden">
          <ul className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-base font-semibold text-navy dark:text-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-navy px-5 py-3 text-center text-sm font-semibold text-cream dark:bg-electric dark:text-navy-900"
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
