import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { CATEGORIES } from '@/lib/constants';

export async function getCategoriesWithPreview() {
  await connectDB();

  const results = await Product.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        image: { $first: { $arrayElemAt: ['$images.url', 0] } },
      },
    },
  ]);

  const byCategory = Object.fromEntries(results.map((r) => [r._id, r]));

  return CATEGORIES.map((c) => ({
    ...c,
    count: byCategory[c.slug]?.count || 0,
    image: byCategory[c.slug]?.image || null,
  }));
}
