'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const OWNER_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/products/new', label: 'Add Product' },
  { href: '/admin/sales', label: 'Sales' },
  { href: '/admin/expenses', label: 'Expenses' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/trash', label: 'Trash' },
  { href: '/admin/audit-log', label: 'Audit Log' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/settings', label: 'Settings' },
];

const STAFF_LINKS = [{ href: '/admin/products', label: 'Products' }];

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminSidebar({ role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const links = role === 'staff' ? STAFF_LINKS : OWNER_LINKS;

  // The new page has arrived - clear the "loading" state.
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  // Safety net: never leave the spinner stuck if a navigation never completes.
  useEffect(() => {
    if (!pendingHref) return undefined;
    const timer = setTimeout(() => setPendingHref(null), 10000);
    return () => clearTimeout(timer);
  }, [pendingHref]);

  function handleNavClick(e, href) {
    setOpen(false);
    // Already on this page, or already navigating there: ignore the extra click.
    if (href === pathname || href === pendingHref) {
      e.preventDefault();
      return;
    }
    setPendingHref(href);
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/admin/login?loggedout=true';
    }
  }

  const currentHref = pendingHref ?? pathname;

  return (
    <>
      {pendingHref && (
        <div
          className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-electric/20"
          role="progressbar"
          aria-label="Loading page"
        >
          <div
            className="h-full w-1/3 bg-electric"
            style={{ animation: 'mcb-progress 1.1s ease-in-out infinite' }}
          />
          <style>{'@keyframes mcb-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }'}</style>
        </div>
      )}

      {/* Mobile top bar with hamburger trigger */}
      <div className="flex items-center justify-between border-b border-navy-700 bg-navy-900 p-4 md:hidden">
        <p className="font-display text-lg font-bold text-cream">
          MCB <span className="text-electric-400">Admin</span>
        </p>
        <div className="flex items-center gap-2">
          <ThemeToggle className="!border-cream/30 !text-cream hover:!border-electric-400" />
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
                {links.map((link) => {
                  const active = currentHref === link.href;
                  const pending = pendingHref === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      aria-busy={pending}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-electric text-navy-900'
                          : 'text-navy hover:bg-navy-50 dark:text-cream dark:hover:bg-navy-800'
                      } ${pending ? 'opacity-80' : ''}`}
                    >
                      {link.label}
                      {pending && <Spinner />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-60 dark:hover:bg-navy-800"
            >
              {loggingOut ? 'Logging out...' : 'Log Out'}
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar - sticky so it stays visible while page content scrolls */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:justify-between md:overflow-y-auto md:border-r md:border-navy-700 md:bg-navy-900 md:p-6">
        <div>
          <p className="mb-8 font-display text-lg font-bold text-cream">
            MCB <span className="text-electric-400">Admin</span>
          </p>
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const active = currentHref === link.href;
              const pending = pendingHref === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  aria-busy={pending}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? 'bg-electric text-navy-900' : 'text-navy-200 hover:bg-navy-700'
                  } ${pending ? 'opacity-80' : ''}`}
                >
                  {link.label}
                  {pending && <Spinner />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="h-fit rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-navy-200 hover:bg-navy-700 disabled:opacity-60"
          >
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>
          <ThemeToggle className="!border-cream/30 !text-cream hover:!border-electric-400" />
        </div>
      </aside>
    </>
  );
}