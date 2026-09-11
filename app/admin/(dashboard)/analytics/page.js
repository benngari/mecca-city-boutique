export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTopSellers, getSlowMovers } from '@/lib/salesAnalytics';
import { getLowStockProducts } from '@/lib/salesAnalytics';

const RANGE_OPTIONS = [
  { value: '14', label: 'Past 2 Weeks' },
  { value: '30', label: 'Past Month' },
  { value: '60', label: 'Past 2 Months' },
];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function AnalyticsPage({ searchParams }) {
  const days = parseInt(searchParams?.days || '30', 10);
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));

  const [topSellers, slowMovers, lowStock] = await Promise.all([
    getTopSellers(startDate, endDate, 10),
    getSlowMovers(startDate, endDate, 10),
    getLowStockProducts(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Analytics</h1>
          <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
            What's selling, what isn't, and what's about to run out.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/admin/analytics?days=${opt.value}`}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                String(days) === opt.value
                  ? 'bg-navy text-cream dark:bg-electric dark:text-navy-900'
                  : 'bg-navy-50 text-navy hover:bg-navy-100 dark:bg-navy-800 dark:text-navy-200'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-6">
          <p className="text-sm font-semibold text-navy dark:text-cream">Low Stock Alerts</p>
          <p className="mt-1 text-xs text-navy-500 dark:text-navy-200">
            At or below each product's alert threshold right now.
          </p>
          <ul className="mt-3 space-y-2">
            {lowStock.map((p) => (
              <li key={p._id} className="flex items-center justify-between text-sm">
                <span className="text-navy dark:text-cream">{p.name} <span className="text-navy-400 dark:text-navy-300">(SKU: {p.sku})</span></span>
                <span className="font-semibold text-gold">
                  {p.stockQuantity} {p.unitType === 'ml' ? 'ml' : ''} left (alert at {p.threshold})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
          <p className="text-sm font-semibold text-navy dark:text-cream">Top Sellers</p>
          <ul className="mt-4 space-y-3">
            {topSellers.length === 0 && (
              <p className="text-sm text-navy-300 dark:text-navy-400">No sales recorded in this period.</p>
            )}
            {topSellers.map((item, i) => (
              <li key={item._id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-navy dark:text-cream">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-xs font-bold text-emerald">
                    {i + 1}
                  </span>
                  {item.productName}
                </span>
                <span className="text-navy-400 dark:text-navy-300">
                  {item.quantitySold} {item.unitType === 'ml' ? 'ml' : 'sold'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
          <p className="text-sm font-semibold text-navy dark:text-cream">Slow Movers</p>
          <p className="mt-1 text-xs text-navy-400 dark:text-navy-300">Lowest sales in this period - worth a closer look.</p>
          <ul className="mt-4 space-y-3">
            {slowMovers.length === 0 && (
              <p className="text-sm text-navy-300 dark:text-navy-400">No products to compare yet.</p>
            )}
            {slowMovers.map((item) => (
              <li key={item.sku} className="flex items-center justify-between text-sm">
                <span className="text-navy dark:text-cream">{item.productName}</span>
                <span className="text-navy-400 dark:text-navy-300">
                  {item.quantitySold} {item.unitType === 'ml' ? 'ml' : 'sold'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
