'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle({ className = '' }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('mcb-theme', next ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-navy-200 text-navy transition-colors hover:border-electric dark:border-navy-600 dark:text-cream dark:hover:border-electric-400 ${className}`}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0 2a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V18.5a1 1 0 0 1 1-1ZM4.5 11a1 1 0 0 1 1 1H7a1 1 0 1 1 0 2H5.5a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1Zm12.5 1a1 1 0 0 1 1-1h1.5a1 1 0 1 1 0 2H18a1 1 0 0 1-1-1ZM6.34 6.34a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 1 1-1.41 1.41L6.34 7.75a1 1 0 0 1 0-1.41Zm8.85 8.85a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 0 1-1.41 1.41l-1.06-1.06a1 1 0 0 1 0-1.41ZM17.66 6.34a1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 1 1-1.41-1.41l1.06-1.06a1 1 0 0 1 1.41 0ZM8.81 15.19a1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 1 1-1.41-1.41l1.06-1.06a1 1 0 0 1 1.41 0Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M20.35 14.5A8.5 8.5 0 0 1 9.5 3.65a.75.75 0 0 0-.9-1 10 10 0 1 0 12.75 12.75.75.75 0 0 0-1-.9Z" />
        </svg>
      )}
    </button>
  );
}
