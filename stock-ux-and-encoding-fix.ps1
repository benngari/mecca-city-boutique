@'
import Link from 'next/link';
import Image from 'next/image';
import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';
import { HERO_IMAGE } from '@/lib/constants';

export default function Hero() {
  const waHref = buildWhatsAppLink(generalWhatsAppMessage());

  return (
    <section className="relative overflow-hidden bg-navy">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-electric/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-emerald/20 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:px-8 md:py-24">
        <div className="animate-fadeUp">
          <h1 className="font-display text-4xl font-bold leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
            Dress the city.
            <br />
            <span className="text-electric-400">Wear</span> the <span className="text-emerald">boutique</span>.
          </h1>
          <p className="mt-6 max-w-md text-base text-navy-100">
            Curated dresses, skirts, jerseys, cocktail perfumes and more - hand-picked in Chuka,
            delivered with a message away on WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-electric px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-lg shadow-electric/30 transition-transform hover:-translate-y-0.5"
            >
              Shop Now
            </Link>
            <Link
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-cream/30 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-emerald hover:text-emerald"
            >
              Order on WhatsApp
            </Link>
          </div>
        </div>

        <div className="relative animate-fadeUp [animation-delay:150ms]">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-cream/10 bg-navy-800">
            {HERO_IMAGE && (
              <Image src={HERO_IMAGE} alt="Mecca City Boutique shop" fill sizes="500px" className="object-cover" />
            )}
          </div>
          <div className="mt-4 rounded-2xl border border-cream/10 bg-white/5 p-4 text-center backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest text-navy-200">Also stocking</p>
            <p className="mt-1 font-display text-lg text-cream">Cocktail Perfumes &amp; Fresheners</p>
          </div>
        </div>
      </div>

      <div className="tag-divider text-electric/40" />
    </section>
  );
}
'@ | Set-Content -Encoding UTF8 components\Hero.js

@'
import Link from 'next/link';
import ProductGrid from './ProductGrid';

export default function FeaturedProducts({ products }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Handpicked</p>
          <h2 className="font-display text-3xl font-bold text-navy dark:text-cream">Featured Pieces</h2>
        </div>
        <Link href="/shop" className="hidden text-sm font-semibold text-electric hover:text-navy dark:hover:text-cream sm:block">
          View all &rarr;
        </Link>
      </div>

      <ProductGrid products={products} emptyMessage="Featured products coming soon - check back shortly." />
    </section>
  );
}
'@ | Set-Content -Encoding UTF8 components\FeaturedProducts.js

@'
import Link from 'next/link';
import { SHOP_NAME, SHOP_LOCATION, SHOP_PHONES } from '@/lib/constants';
import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';

export default function Footer() {
  const waHref = buildWhatsAppLink(generalWhatsAppMessage());

  return (
    <footer className="mt-24 bg-navy text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div>
          <p className="font-display text-2xl font-bold">
            Mecca <span className="text-electric-400">City</span> <span className="text-emerald">Boutique</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-navy-200">
            Dresses, skirts, tops, jerseys, cocktail perfumes and fresheners - dressed with a Chuka attitude.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-electric-400">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-navy-200">
            <li><Link href="/shop" className="hover:text-cream">Shop</Link></li>
            <li><Link href="/categories" className="hover:text-cream">Categories</Link></li>
            <li><Link href="/about" className="hover:text-cream">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-cream">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-electric-400">Visit Us</p>
          <ul className="mt-4 space-y-2 text-sm text-navy-200">
            <li>{SHOP_LOCATION}</li>
            {SHOP_PHONES.map((phone) => (
              <li key={phone}>{phone}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-electric-400">Order Fast</p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald/90"
          >
            Message us on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-navy-600 px-5 py-5 text-center text-xs text-navy-300 md:px-8">
        &copy; {new Date().getFullYear()} {SHOP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
'@ | Set-Content -Encoding UTF8 components\Footer.js

@'
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import { CATEGORIES, SIZES } from '@/lib/constants';

const EMPTY = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  category: CATEGORIES[0].slug,
  images: [],
  sizes: [],
  stockStatus: 'in_stock',
  stockQuantity: '',
  featured: false,
  sku: '',
};

export default function ProductForm({ initialProduct, productId }) {
  const router = useRouter();
  const [form, setForm] = useState(
    initialProduct
      ? { ...EMPTY, ...initialProduct, stockQuantity: initialProduct.stockQuantity ?? '' }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSize(size) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  }

  function addCustomSize(e) {
    e.preventDefault();
    const value = customSizeInput.trim();
    if (!value) return;
    // supports comma-separated entry, e.g. "30, 31, 32"
    const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, ...parts.filter((p) => !prev.sizes.includes(p))],
    }));
    setCustomSizeInput('');
  }

  function removeSize(size) {
    setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== size) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const hasQuantity = form.stockQuantity !== '' && form.stockQuantity !== null;
    const stockQuantity = hasQuantity ? Number(form.stockQuantity) : null;
    let stockStatus = form.stockStatus;
    if (hasQuantity) {
      stockStatus = stockQuantity === 0 ? 'sold_out' : stockQuantity <= 3 ? 'low_stock' : 'in_stock';
    }

    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stockQuantity,
      stockStatus,
    };

    try {
      const res = await fetch(productId ? `/api/products/${productId}` : '/api/products', {
        method: productId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save product');
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-semibold text-navy">Product Images</label>
        <div className="mt-2">
          <ImageUploader images={form.images} onChange={(images) => update('images', images)} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          Product Name
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          SKU
          <input
            required
            value={form.sku}
            onChange={(e) => update('sku', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
        </label>
      </div>

      <label className="block text-sm font-semibold text-navy">
        Description
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-sm font-semibold text-navy">
          Price (KSh)
          <input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          Discount Price (optional)
          <input
            type="number"
            min="0"
            value={form.discountPrice || ''}
            onChange={(e) => update('discountPrice', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          Category
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <p className="text-sm font-semibold text-navy">Available Sizes</p>
        <p className="mt-0.5 text-xs text-navy-400">
          Tap standard sizes below, or type custom sizes (e.g. jeans 30, 31, 32 or bra 34B) and press Add.
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => toggleSize(size)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                form.sizes.includes(size)
                  ? 'border-navy bg-navy text-cream'
                  : 'border-navy-200 text-navy-500 hover:border-navy'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customSizeInput}
            onChange={(e) => setCustomSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCustomSize(e);
            }}
            placeholder="Custom size, e.g. 30, 31, 32"
            className="w-full max-w-xs rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-electric focus:outline-none"
          />
          <button
            type="button"
            onClick={addCustomSize}
            className="rounded-lg bg-navy-100 px-4 py-2 text-xs font-semibold text-navy hover:bg-navy-200"
          >
            Add
          </button>
        </div>

        {form.sizes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.sizes.map((size) => (
              <span
                key={size}
                className="flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1.5 text-xs font-semibold text-emerald"
              >
                {size}
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  aria-label={`Remove size ${size}`}
                  className="text-emerald/70 hover:text-emerald"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          Stock Quantity (optional)
          <input
            type="number"
            min="0"
            value={form.stockQuantity}
            onChange={(e) => update('stockQuantity', e.target.value)}
            placeholder="e.g. 12"
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
          <span className="mt-1 block text-xs font-normal text-navy-400">
            Set this to track exact stock. Status below updates automatically from it. Leave
            blank to set status manually instead.
          </span>
        </label>

        <label className="block text-sm font-semibold text-navy">
          Stock Status {form.stockQuantity !== '' && <span className="text-navy-300">(auto)</span>}
          <select
            value={form.stockStatus}
            disabled={form.stockQuantity !== ''}
            onChange={(e) => update('stockStatus', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none disabled:bg-navy-50 disabled:text-navy-400"
          >
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="sold_out">Sold Out</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-navy">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update('featured', e.target.checked)}
            className="h-4 w-4 rounded border-navy-300"
          />
          Feature this product on the homepage
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-electric disabled:opacity-60"
        >
          {saving ? 'Saving...' : productId ? 'Save Changes' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="rounded-full border border-navy-200 px-6 py-3 text-sm font-semibold text-navy"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
'@ | Set-Content -Encoding UTF8 components\admin\ProductForm.js

@'
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

      <section className="bg-navy-900">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Fresh drop</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-cream">
              New wine dresses just landed
            </h2>
            <p className="mt-4 max-w-md text-navy-200">
              Every piece is picked for how it actually moves and photographs - not just how it
              hangs on the rack. Limited stock, no restocks on some styles.
            </p>
            <Link
              href="/shop?category=dresses"
              className="mt-6 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy-900 hover:bg-gold/90"
            >
              Shop Wine Dresses
            </Link>
          </div>
          <div className="tag-divider self-center text-cream/10 md:hidden" />
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 h-40 rounded-2xl bg-electric/20" />
            <div className="h-40 rounded-2xl bg-emerald/20" />
            <div className="h-28 rounded-2xl bg-gold/20" />
            <div className="col-span-2 h-28 rounded-2xl bg-cream/10" />
          </div>
        </div>
      </section>

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
'@ | Set-Content -Encoding UTF8 "app\(site)\page.js"

@'
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductGrid from '@/components/ProductGrid';
import SearchFilterBar from '@/components/SearchFilterBar';

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse dresses, skirts, tops, jerseys, cocktail perfumes and fresheners at Mecca City Boutique.',
};

async function getProducts({ category, search }) {
  await connectDB();
  const query = {};
  if (category && category !== 'all') query.category = category;
  if (search) query.$text = { $search: search };

  const products = await Product.find(query).sort({ createdAt: -1 }).limit(60).lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function ShopPage({ searchParams }) {
  const products = await getProducts(searchParams);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Full Catalogue</p>
        <h1 className="font-display text-3xl font-bold text-navy dark:text-cream md:text-4xl">Shop All Products</h1>
      </div>

      <Suspense fallback={<div className="h-24" />}>
        <SearchFilterBar />
      </Suspense>

      <ProductGrid products={products} emptyMessage="No products match your search - try another category." />
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\(site)\shop\page.js"

@'
import { Playfair_Display, Manrope } from 'next/font/google';
import './globals.css';
import { SHOP_NAME, LOGO_URL } from '@/lib/constants';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meccacityboutique.co.ke';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SHOP_NAME} - Fashion & Lifestyle, Chuka`,
    template: `%s | ${SHOP_NAME}`,
  },
  description:
    'Mecca City Boutique in Ndagani, Chuka - dresses, skirts, ladies tops, jerseys, cocktail perfumes and fresheners. Order easily on WhatsApp.',
  keywords: [
    'Mecca City Boutique',
    'Chuka boutique',
    'Kenyan fashion',
    'ladies dresses Chuka',
    'jerseys Kenya',
    'cocktail perfumes Kenya',
  ],
  openGraph: {
    title: `${SHOP_NAME} - Fashion & Lifestyle, Chuka`,
    description:
      'Dresses, skirts, tops, jerseys, cocktail perfumes and fresheners - order on WhatsApp for fast delivery around Chuka.',
    url: siteUrl,
    siteName: SHOP_NAME,
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SHOP_NAME} - Fashion & Lifestyle, Chuka`,
    description: 'Dresses, skirts, tops, jerseys, cocktail perfumes and fresheners in Chuka, Kenya.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: LOGO_URL,
    shortcut: LOGO_URL,
    apple: LOGO_URL,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('mcb-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'dark' || (!saved && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
'@ | Set-Content -Encoding UTF8 app\layout.js

@'
export const CATEGORIES = [
  { slug: 'dresses', name: 'Dresses & Wine Dresses' },
  { slug: 'skirts', name: 'Skirts' },
  { slug: 'tops', name: 'Ladies Tops' },
  { slug: 'trousers', name: 'Trousers & Jeans' },
  { slug: 'jerseys', name: 'Jerseys' },
  { slug: 'lingerie', name: 'Panties & Bras' },
  { slug: 'perfumes', name: 'Cocktail Perfumes' },
  { slug: 'fresheners', name: 'Foam Cleaners & Fresheners' },
  { slug: 'other', name: 'Other' },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

export const SHOP_NAME = 'Mecca City Boutique';
export const SHOP_LOCATION = 'Ndagani, Chuka, Kenya';
export const SHOP_PHONES = ['0719 215 341', '0708 743 903'];

// Paste your Cloudinary logo URL here after uploading (Media Library → your logo → Copy URL)
export const LOGO_URL = 'https://res.cloudinary.com/PASTE_YOUR_CLOUD_NAME/image/upload/PASTE_YOUR_LOGO_PATH.png';

// Paste 1 Cloudinary shop photo URL here for the homepage hero
export const HERO_IMAGE = 'https://res.cloudinary.com/PASTE_YOUR_CLOUD_NAME/image/upload/PASTE_YOUR_PHOTO.jpg';
'@ | Set-Content -Encoding UTF8 lib\constants.js

@'
'use client';

import { useEffect, useState, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formQuantity, setFormQuantity] = useState('1');
  const [formType, setFormType] = useState('sell');

  async function loadProducts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('limit', '100');
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id) {
    if (!confirm('Move this product to Trash? You can restore it later.')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      alert('Failed to delete product.');
    }
  }

  function openStockForm(id) {
    setEditingId(id);
    setFormQuantity('1');
    setFormType('sell');
  }

  function closeStockForm() {
    setEditingId(null);
  }

  async function handleSaveStock(id) {
    const quantity = Number(formQuantity);
    if (!quantity || quantity <= 0) {
      alert('Enter a quantity greater than 0.');
      return;
    }

    const endpoint = formType === 'sell' ? 'sell' : 'restock';
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Could not update stock.');
        return;
      }

      setProducts((prev) => prev.map((p) => (p._id === id ? data.product : p)));
      closeStockForm();
    } catch {
      alert('Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Products</h1>
          <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">{products.length} product(s)</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-electric"
        >
          + Add Product
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadProducts();
        }}
        className="mt-6 flex gap-3"
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full max-w-sm rounded-full border border-navy-200 bg-white px-4 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-cream"
        />
        <button type="submit" className="rounded-full bg-navy-100 px-5 py-2.5 text-sm font-semibold text-navy dark:bg-navy-800 dark:text-cream">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  No products yet - add your first product.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <Fragment key={p._id}>
                <tr className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-navy-50 dark:bg-navy-700">
                        {p.images?.[0]?.url && (
                          <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-navy dark:text-cream">{p.name}</p>
                        <p className="text-xs text-navy-400 dark:text-navy-300">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-navy-500 dark:text-navy-200">{p.category}</td>
                  <td className="px-4 py-3 text-navy-500 dark:text-navy-200">KSh {p.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.stockStatus === 'sold_out'
                          ? 'bg-red-50 text-red-600'
                          : p.stockStatus === 'low_stock'
                          ? 'bg-gold/20 text-gold'
                          : 'bg-emerald/10 text-emerald'
                      }`}
                    >
                      {p.stockStatus.replace('_', ' ')}
                    </span>
                    {p.stockQuantity != null && (
                      <p className="mt-1 text-xs text-navy-400 dark:text-navy-300">{p.stockQuantity} left</p>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.featured ? '\u2605' : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        onClick={() => (editingId === p._id ? closeStockForm() : openStockForm(p._id))}
                        className="font-semibold text-electric"
                      >
                        {editingId === p._id ? 'Close' : 'Update Stock'}
                      </button>
                      <Link href={`/admin/products/${p._id}/edit`} className="font-semibold text-electric">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="font-semibold text-red-500">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {editingId === p._id && (
                  <tr className="border-b border-navy-50 bg-navy-50/60 dark:border-navy-700 dark:bg-navy-900/60">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="flex flex-wrap items-end gap-4">
                        <label className="text-xs font-semibold text-navy dark:text-cream">
                          What happened?
                          <select
                            value={formType}
                            onChange={(e) => setFormType(e.target.value)}
                            className="mt-1 block rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-cream"
                          >
                            <option value="sell">Sold</option>
                            <option value="restock">Restocked</option>
                          </select>
                        </label>

                        <label className="text-xs font-semibold text-navy dark:text-cream">
                          How many?
                          <input
                            type="number"
                            min="1"
                            value={formQuantity}
                            onChange={(e) => setFormQuantity(e.target.value)}
                            className="mt-1 block w-24 rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-cream"
                          />
                        </label>

                        <button
                          onClick={() => handleSaveStock(p._id)}
                          disabled={saving}
                          className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-emerald/90 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={closeStockForm}
                          className="rounded-full border border-navy-200 px-5 py-2 text-sm font-semibold text-navy dark:border-navy-600 dark:text-cream"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 -LiteralPath "app\admin\(dashboard)\products\page.js"
