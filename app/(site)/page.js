export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import CategoryCard from '@/components/CategoryCard';
import { SHOP_LOCATION, SHOP_PHONES } from '@/lib/constants';
import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';
import { getCategoriesWithPreview } from '@/lib/categories';

async function getFeatured() {
  await connectDB();
  const products = await Product.find({ featured: true }).sort({ createdAt: -1 }).limit(8).lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeatured(), getCategoriesWithPreview()]);
  const waHref = buildWhatsAppLink(generalWhatsAppMessage());

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-electric-600 dark:text-electric-400">Browse</p>
          <h2 className="font-display text-3xl font-bold text-navy dark:text-cream">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </section>

      <FeaturedProducts products={featured} />

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-10 rounded-3xl border border-navy-100 bg-white p-8 dark:border-navy-700 dark:bg-navy-800 md:grid-cols-2 md:p-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Our story</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-navy dark:text-cream">About Mecca City Boutique</h2>
            <p className="mt-4 text-navy-500 dark:text-navy-200">
              Based in Ndagani, Chuka, Mecca City Boutique has been dressing the town in dresses,
              skirts, tops, jerseys and cocktail scents that don't feel mass-produced. We stock
              what we'd actually wear - and we're one WhatsApp message away when you need it fast.
            </p>
            <Link href="/about" className="mt-4 inline-block text-sm font-semibold text-electric hover:text-navy dark:hover:text-cream">
              Read our full story &rarr;
            </Link>
          </div>

          <div className="rounded-2xl bg-navy-50 p-6 dark:bg-navy-900/60">
            <p className="text-xs font-semibold uppercase tracking-widest text-electric-600 dark:text-electric-400">Visit / Order</p>
            <p className="mt-3 font-display text-lg font-semibold text-navy dark:text-cream">{SHOP_LOCATION}</p>
            <ul className="mt-3 space-y-1 text-sm text-navy-500 dark:text-navy-200">
              {SHOP_PHONES.map((phone) => (
                <li key={phone}>{phone}</li>
              ))}
            </ul>
            <Link
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald/90"
            >
              Chat on WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
