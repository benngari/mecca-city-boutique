export const dynamic = 'force-dynamic';

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meccacityboutique.co.ke';

  await connectDB();
  const products = await Product.find({}, 'slug updatedAt').lean();

  const staticRoutes = ['', '/shop', '/categories', '/about', '/contact'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));

  const productRoutes = products.map((p) => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
