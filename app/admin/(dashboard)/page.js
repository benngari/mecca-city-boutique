export const dynamic = 'force-dynamic';

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import StatsCard from '@/components/admin/StatsCard';
import { CATEGORIES } from '@/lib/constants';
import Link from 'next/link';

async function getStats() {
  await connectDB();

  const [total, available, soldOut, byCategory, recent] = await Promise.all([
    Product.countDocuments({}),
    Product.countDocuments({ stockStatus: { $ne: 'sold_out' } }),
    Product.countDocuments({ stockStatus: 'sold_out' }),
    Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Product.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const categoryMap = Object.fromEntries(byCategory.map((c) => [c._id, c.count]));

  return {
    total,
    available,
    soldOut,
    categoryMap,
    recent: JSON.parse(JSON.stringify(recent)),
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-navy-400">Overview of Mecca City Boutique's catalogue.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard label="Total Products" value={stats.total} />
        <StatsCard label="Available" value={stats.available} accent="text-emerald" />
        <StatsCard label="Sold Out" value={stats.soldOut} accent="text-red-500" />
        <StatsCard label="Categories" value={CATEGORIES.length} accent="text-electric-600" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-100 bg-white p-6">
          <p className="mb-4 text-sm font-semibold text-navy">Products by Category</p>
          <ul className="space-y-2">
            {CATEGORIES.map((c) => (
              <li key={c.slug} className="flex items-center justify-between text-sm">
                <span className="text-navy-500">{c.name}</span>
                <span className="font-semibold text-navy">{stats.categoryMap[c.slug] || 0}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-navy">Recent Products</p>
            <Link href="/admin/products" className="text-xs font-semibold text-electric">
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {stats.recent.map((p) => (
              <li key={p._id} className="flex items-center justify-between text-sm">
                <span className="text-navy-500">{p.name}</span>
                <span className="text-navy-400">KSh {p.price.toLocaleString()}</span>
              </li>
            ))}
            {stats.recent.length === 0 && <p className="text-sm text-navy-300">No products yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
