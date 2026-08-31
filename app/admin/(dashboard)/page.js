export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import AuditLog from '@/models/AuditLog';
import StatsCard from '@/components/admin/StatsCard';
import StorageBar from '@/components/admin/StorageBar';
import { getInventorySummary } from '@/lib/inventory';
import { CATEGORIES } from '@/lib/constants';

async function getStats() {
  await connectDB();

  const [total, available, soldOut, trashCount, recentProducts, recentActivity, inventory] = await Promise.all([
    Product.countDocuments({ deletedAt: null }),
    Product.countDocuments({ deletedAt: null, stockStatus: { $ne: 'sold_out' } }),
    Product.countDocuments({ deletedAt: null, stockStatus: 'sold_out' }),
    Product.countDocuments({ deletedAt: { $ne: null } }),
    Product.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(5).lean(),
    AuditLog.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    getInventorySummary(),
  ]);

  return {
    total,
    available,
    soldOut,
    trashCount,
    recentProducts: JSON.parse(JSON.stringify(recentProducts)),
    recentActivity: JSON.parse(JSON.stringify(recentActivity)),
    inventory,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Dashboard</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">Overview of Mecca City Boutique's catalogue.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
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

      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
        <p className="mb-4 text-sm font-semibold text-navy dark:text-cream">Stock by Category</p>
        <StorageBar categories={stats.inventory.categories} metric="units" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
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

        <div className="rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-navy dark:text-cream">Recent Activity</p>
            <Link href="/admin/audit-log" className="text-xs font-semibold text-electric">
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {stats.recentActivity.map((entry) => (
              <li key={entry._id} className="text-sm">
                <p className="text-navy-500 dark:text-navy-200">
                  <span className="font-semibold text-navy dark:text-cream">{entry.actor}</span>{' '}
                  {entry.action.replace('.', ' ').replace('_', ' ')}
                  {entry.target ? ` - ${entry.target}` : ''}
                </p>
                <p className="text-xs text-navy-400 dark:text-navy-400">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
            {stats.recentActivity.length === 0 && (
              <p className="text-sm text-navy-300 dark:text-navy-400">No activity recorded yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
