export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDailySales, getSalesList, getSalesTotals, getExpensesTotal } from '@/lib/salesAnalytics';
import StatsCard from '@/components/admin/StatsCard';

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
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

export default async function SalesPage({ searchParams }) {
  const days = parseInt(searchParams?.days || '30', 10);
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));

  const [daily, totals, recentSales, expensesTotal] = await Promise.all([
    getDailySales(startDate, endDate),
    getSalesTotals(startDate, endDate),
    getSalesList(startDate, endDate, 50),
    getExpensesTotal(startDate, endDate),
  ]);
  const netProfit = totals.profit - expensesTotal;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Sales</h1>
          <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
            Every recorded sale, including ones entered late for a past day.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/expenses"
            className="rounded-full border border-navy-200 px-4 py-2 text-xs font-semibold text-navy hover:bg-navy-50 dark:border-navy-600 dark:text-cream dark:hover:bg-navy-800"
          >
            Expenses
          </Link>
          {RANGE_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/admin/sales?days=${opt.value}`}
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

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard label="Revenue" value={`KSh ${totals.revenue.toLocaleString()}`} accent="text-navy dark:text-cream" />
        <StatsCard label="Items Sold" value={totals.itemsSold} accent="text-electric-600" />
        <StatsCard label="Sales Recorded" value={totals.saleCount} accent="text-gold" />
        <StatsCard label="Expenses" value={`KSh ${expensesTotal.toLocaleString()}`} accent="text-red-500" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatsCard label="Gross Profit" value={`KSh ${totals.profit.toLocaleString()}`} accent="text-emerald" />
        <StatsCard
          label="Net Profit (after expenses)"
          value={`KSh ${netProfit.toLocaleString()}`}
          accent={netProfit >= 0 ? 'text-emerald' : 'text-red-500'}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items Sold</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Profit</th>
            </tr>
          </thead>
          <tbody>
            {daily.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  No sales recorded in this range yet.
                </td>
              </tr>
            )}
            {daily.map((row) => (
              <tr key={row.date} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                <td className="px-4 py-3 text-navy dark:text-cream">{row.date}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">{row.itemsSold}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">KSh {row.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold text-emerald">KSh {row.profit.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <p className="mb-4 text-sm font-semibold text-navy dark:text-cream">Recent Sale Entries</p>
        <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
                <th className="px-4 py-3">Date Sold</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Profit</th>
                <th className="px-4 py-3">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                    Nothing yet.
                  </td>
                </tr>
              )}
              {recentSales.map((sale) => (
                <tr key={sale._id} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                  <td className="whitespace-nowrap px-4 py-3 text-navy-500 dark:text-navy-200">
                    {new Date(sale.soldAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-navy dark:text-cream">{sale.productName}</td>
                  <td className="px-4 py-3 text-navy-500 dark:text-navy-200">
                    {sale.quantitySold} {sale.unitType === 'ml' ? 'ml' : ''}
                  </td>
                  <td className="px-4 py-3 text-navy-500 dark:text-navy-200">KSh {sale.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-emerald">KSh {sale.profit.toLocaleString()}</td>
                  <td className="px-4 py-3 text-navy-400 dark:text-navy-300">{sale.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
