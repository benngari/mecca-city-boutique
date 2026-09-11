export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import StatsCard from '@/components/admin/StatsCard';
import StorageBar from '@/components/admin/StorageBar';
import { getInventorySummary } from '@/lib/inventory';
import { getSalesTotals, getLowStockProducts } from '@/lib/salesAnalytics';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

async function getStats() {
  await connectDB();

  const [total, available, soldOut, trashCount, recentProducts, inventory, todaySales, lowStock] = await Promise.all([
    Product.countDocuments({ deletedAt: null }),
    Product.countDocuments({ deletedAt: null, stockStatus: { $ne: 'sold_out' } }),
    Product.countDocuments({ deletedAt: null, stockStatus: 'sold_out' }),
    Product.countDocuments({ deletedAt: { $ne: null } }),
    Product.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(5).lean(),
    getInventorySummary(),
    getSalesTotals(startOfToday(), endOfToday()),
    getLowStockProducts(),
  ]);

  return {
    total,
    available,
    soldOut,
    trashCount,
    recentProducts: JSON.parse(JSON.stringify(recentProducts)),
    inventory,
    todaySales,
    lowStock,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Dashboard</h1>
          <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">Overview of Mecca City Boutique's catalogue.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/sales"
            className="rounded-full border border-navy-200 px-4 py-2 text-sm font-semibold text-navy hover:bg-navy-50 dark:border-navy-600 dark:text-cream dark:hover:bg-navy-800"
          >
            Sales
          </Link>
          <Link
            href="/admin/analytics"
            className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-electric dark:bg-electric dark:text-navy-900"
          >
            Analytics
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard label="Today's Revenue" value={`KSh ${stats.todaySales.revenue.toLocaleString()}`} accent="text-navy dark:text-cream" />
        <StatsCard label="Today's Profit" value={`KSh ${stats.todaySales.profit.toLocaleString()}`} accent="text-emerald" />
        <StatsCard label="Items Sold Today" value={stats.todaySales.itemsSold} accent="text-electric-600" />
        <StatsCard label="Low Stock Items" value={stats.lowStock.length} accent={stats.lowStock.length > 0 ? 'text-gold' : 'text-navy dark:text-cream'} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard label="Total Products" value={stats.total} />
        <StatsCard label="Available" value={stats.available} accent="text-emerald" />
        <StatsCard label="Sold Out" value={stats.soldOut} accent="text-red-500" />
        <StatsCard label="In Trash" value={stats.trashCount} accent="text-navy-400" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatsCard label="Units in Stock" value={stats.inventory.totals.units} accent="text-electric-600" />
        <StatsCard
          label="Stock Value"
          value={`KSh ${stats.inventory.totals.value.toLocaleString()}`}
          accent="text-gold"
        />
      </div>

      {stats.lowStock.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy dark:text-cream">Low Stock Alerts</p>
            <Link href="/admin/analytics" className="text-xs font-semibold text-electric">
              View all
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {stats.lowStock.slice(0, 5).map((p) => (
              <li key={p._id} className="flex items-center justify-between text-sm">
                <span className="text-navy dark:text-cream">{p.name}</span>
                <span className="font-semibold text-gold">
                  {p.stockQuantity} {p.unitType === 'ml' ? 'ml' : ''} left
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
        <p className="mb-4 text-sm font-semibold text-navy dark:text-cream">Stock by Category</p>
        <StorageBar categories={stats.inventory.categories} metric="units" />
      </div>

      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-navy dark:text-cream">Recent Products</p>
          <Link href="/admin/products" className="text-xs font-semibold text-electric">
            View all
          </Link>
        </div>
        <ul className="space-y-3">
          {stats.recentProducts.map((p) => (
            <li key={p._id} className="flex items-center justify-between text-sm">
              <span className="text-navy-500 dark:text-navy-200">{p.name}</span>
              <span className="text-navy-400 dark:text-navy-300">KSh {p.price.toLocaleString()}</span>
            </li>
          ))}
          {stats.recentProducts.length === 0 && (
            <p className="text-sm text-navy-300 dark:text-navy-400">No products yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
