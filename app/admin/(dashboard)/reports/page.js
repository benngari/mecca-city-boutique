export const dynamic = 'force-dynamic';

import StorageBar from '@/components/admin/StorageBar';
import StatsCard from '@/components/admin/StatsCard';
import { getInventorySummary } from '@/lib/inventory';

export default async function ReportsPage() {
  const inventory = await getInventorySummary();
  const lowStockCategories = inventory.categories
    .filter((c) => c.productCount > 0)
    .sort((a, b) => a.units - b.units);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Reports</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        Current stock levels and worth, by category.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <StatsCard label="Total Units in Stock" value={inventory.totals.units} accent="text-electric-600" />
        <StatsCard
          label="Total Stock Value"
          value={`KSh ${inventory.totals.value.toLocaleString()}`}
          accent="text-gold"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
        <p className="mb-4 text-sm font-semibold text-navy dark:text-cream">Stock Value by Category</p>
        <StorageBar
          categories={inventory.categories}
          metric="value"
          valueFormatter={(v) => `KSh ${v.toLocaleString()}`}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Units</th>
              <th className="px-4 py-3">Value</th>
            </tr>
          </thead>
          <tbody>
            {inventory.categories.map((c) => (
              <tr key={c.slug} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                <td className="px-4 py-3 text-navy dark:text-cream">{c.name}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">{c.productCount}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">{c.units}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">KSh {c.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lowStockCategories.some((c) => c.units <= 3 && c.units > 0) && (
        <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-6">
          <p className="text-sm font-semibold text-navy dark:text-cream">Running Low</p>
          <ul className="mt-2 space-y-1 text-sm text-navy-500 dark:text-navy-200">
            {lowStockCategories
              .filter((c) => c.units <= 3 && c.units > 0)
              .map((c) => (
                <li key={c.slug}>{c.name} - {c.units} left</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
