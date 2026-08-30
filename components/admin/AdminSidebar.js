'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/products/new', label: 'Add Product' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <aside className="flex w-full flex-col justify-between border-b border-navy-700 bg-navy-900 p-4 md:h-screen md:w-60 md:gap-1 md:border-b-0 md:border-r md:p-6">
      <div>
        <p className="font-display text-lg font-bold text-cream md:mb-8">
          MCB <span className="text-electric-400">Admin</span>
        </p>
        <nav className="mt-3 flex flex-wrap gap-1 md:mt-0 md:flex-col">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active ? 'bg-electric text-navy-900' : 'text-navy-200 hover:bg-navy-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="mt-3 h-fit w-fit rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-200 hover:bg-navy-700 md:mt-0"
      >
        Log Out
      </button>
    </aside>
  );
}
