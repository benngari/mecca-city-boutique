'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/constants';

export default function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const activeCategory = searchParams.get('category') || 'all';

  function updateParams(next) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
      else params.delete(key);
    });
    router.push(`/shop?${params.toString()}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    updateParams({ search });
  }

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dresses, jerseys, perfumes..."
          className="w-full rounded-full border border-navy-200 bg-white px-5 py-3 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-cream dark:placeholder:text-navy-400"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-electric"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParams({ category: 'all' })}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            activeCategory === 'all'
              ? 'bg-navy text-cream dark:bg-electric dark:text-navy-900'
              : 'bg-navy-50 text-navy hover:bg-navy-100 dark:bg-navy-800 dark:text-navy-200 dark:hover:bg-navy-700'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => updateParams({ category: cat.slug })}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              activeCategory === cat.slug
                ? 'bg-navy text-cream dark:bg-electric dark:text-navy-900'
                : 'bg-navy-50 text-navy hover:bg-navy-100 dark:bg-navy-800 dark:text-navy-200 dark:hover:bg-navy-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
