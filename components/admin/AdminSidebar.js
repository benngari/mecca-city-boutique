'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/products/new', label: 'Add Product' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/trash', label: 'Trash' },
  { href: '/admin/audit-log', label: 'Audit Log' },
  { href: '/admin/users', label: 'Users' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Hard navigation so the cleared session cookie is guaranteed to be picked up
    window.location.href = '/admin/login?loggedout=true';
  }

  return (
    <>
      {/* Mobile top bar with hamburger trigger */}
      <div className="flex items-center justify-between border-b border-navy-700 bg-navy-900 p-4 md:hidden">
        <p className="font-display text-lg font-bold text-cream">
          MCB <span className="text-electric-400">Admin</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-cream hover:bg-navy-700"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
          </svg>
        </button>
      </div>

      {/* Mobile off-canvas drawer, slides in from the left */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col justify-between bg-white p-6 shadow-xl dark:bg-navy-900">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-lg font-bold text-navy dark:text-cream">
                  MCB <span className="text-electric">Admin</span>
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-1.5 text-navy hover:bg-navy-50 dark:text-cream dark:hover:bg-navy-800"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5Z" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-electric text-navy-900'
                          : 'text-navy hover:bg-navy-50 dark:text-cream dark:hover:bg-navy-800'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-navy-800"
            >
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar, always visible */}
      <aside className="hidden md:flex md:h-screen md:w-60 md:flex-col md:justify-between md:border-r md:border-navy-700 md:bg-navy-900 md:p-6">
        <div>
          <p className="mb-8 font-display text-lg font-bold text-cream">
            MCB <span className="text-electric-400">Admin</span>
          </p>
          <nav className="flex flex-col gap-1">
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
          type="button"
          onClick={handleLogout}
          className="h-fit rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-navy-200 hover:bg-navy-700"
        >
          Log Out
        </button>
      </aside>
    </>
  );
}
