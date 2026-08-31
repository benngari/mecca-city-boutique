import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { CATEGORIES } from '@/lib/constants';

// Aggregates live (non-deleted) stock into per-category counts and KSh value,
// used by the admin dashboard, the reports page, and the storage-style bar.
export async function getInventorySummary() {
  await connectDB();

  const results = await Product.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
        units: { $sum: { $ifNull: ['$stockQuantity', 0] } },
        value: {
          $sum: {
            $multiply: [
              { $ifNull: ['$stockQuantity', 0] },
              { $ifNull: ['$discountPrice', '$price'] },
            ],
          },
        },
      },
    },
  ]);

  const byCategory = Object.fromEntries(results.map((r) => [r._id, r]));

  const categories = CATEGORIES.map((c) => ({
    ...c,
    productCount: byCategory[c.slug]?.productCount || 0,
    units: byCategory[c.slug]?.units || 0,
    value: byCategory[c.slug]?.value || 0,
  }));

  const totals = categories.reduce(
    (acc, c) => ({
      productCount: acc.productCount + c.productCount,
      units: acc.units + c.units,
      value: acc.value + c.value,
    }),
    { productCount: 0, units: 0, value: 0 }
  );

  return { categories, totals };
}
