@'
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1B3D',
          50: '#EEF1F8',
          100: '#DBE1F0',
          200: '#B0BEDE',
          300: '#8598C9',
          400: '#4C63A0',
          500: '#233062',
          600: '#1A2450',
          700: '#141B3E',
          800: '#0F1B3D',
          900: '#0A1129',
        },
        electric: {
          DEFAULT: '#2D8FE0',
          50: '#EAF5FE',
          100: '#CFE9FC',
          400: '#4FA5EA',
          500: '#2D8FE0',
          600: '#1D6FB8',
        },
        emerald: {
          DEFAULT: '#16A34A',
        },
        gold: {
          DEFAULT: '#F5B301',
        },
        cream: '#FBF9F5',
        charcoal: '#171717',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
      },
      backgroundImage: {
        'stitch': "repeating-linear-gradient(90deg, currentColor 0, currentColor 6px, transparent 6px, transparent 12px)",
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
'@ | Set-Content -Encoding UTF8 tailwind.config.js

@'
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  @apply bg-cream text-charcoal font-body antialiased transition-colors dark:bg-navy-900 dark:text-cream;
}

::selection {
  @apply bg-electric-500/30;
}

/* Visible keyboard focus everywhere */
a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid #2D8FE0;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Signature "tag string" divider evoking a clothing tag's cord */
.tag-divider {
  position: relative;
  height: 2px;
  background-image: radial-gradient(circle, currentColor 1.5px, transparent 1.6px);
  background-size: 10px 2px;
  background-repeat: repeat-x;
}

.hole-punch::before {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: theme('colors.cream');
  border: 2px solid currentColor;
}
'@ | Set-Content -Encoding UTF8 app\globals.css

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
    default: `${SHOP_NAME} — Fashion & Lifestyle, Chuka`,
    template: `%s | ${SHOP_NAME}`,
  },
  description:
    'Mecca City Boutique in Ndagani, Chuka — dresses, skirts, ladies tops, jerseys, cocktail perfumes and fresheners. Order easily on WhatsApp.',
  keywords: [
    'Mecca City Boutique',
    'Chuka boutique',
    'Kenyan fashion',
    'ladies dresses Chuka',
    'jerseys Kenya',
    'cocktail perfumes Kenya',
  ],
  openGraph: {
    title: `${SHOP_NAME} — Fashion & Lifestyle, Chuka`,
    description:
      'Dresses, skirts, tops, jerseys, cocktail perfumes and fresheners — order on WhatsApp for fast delivery around Chuka.',
    url: siteUrl,
    siteName: SHOP_NAME,
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SHOP_NAME} — Fashion & Lifestyle, Chuka`,
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
              Every piece is picked for how it actually moves and photographs — not just how it
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
              what we'd actually wear — and we're one WhatsApp message away when you need it fast.
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

      <ProductGrid products={products} emptyMessage="No products match your search — try another category." />
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\(site)\shop\page.js"

@'
export const dynamic = 'force-dynamic';

import CategoryCard from '@/components/CategoryCard';
import { getCategoriesWithPreview } from '@/lib/categories';

export const metadata = {
  title: 'Categories',
  description: 'Browse Mecca City Boutique products by category.',
};

export default async function CategoriesPage() {
  const categories = await getCategoriesWithPreview();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Browse</p>
      <h1 className="font-display text-3xl font-bold text-navy dark:text-cream md:text-4xl">Shop by Category</h1>
      <p className="mt-3 max-w-xl text-navy-500 dark:text-navy-200">
        From wine dresses to cocktail perfumes - find exactly what you're looking for.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\(site)\categories\page.js"

@'
import Link from 'next/link';
import { SHOP_LOCATION, SHOP_PHONES } from '@/lib/constants';
import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';

export const metadata = {
  title: 'About Us',
  description: 'The story behind Mecca City Boutique in Ndagani, Chuka.',
};

export default function AboutPage() {
  const waHref = buildWhatsAppLink(generalWhatsAppMessage());

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Our story</p>
      <h1 className="font-display text-4xl font-bold text-navy dark:text-cream">About Mecca City Boutique</h1>

      <div className="mt-8 space-y-5 text-navy-600 dark:text-navy-200">
        <p>
          Mecca City Boutique started in Ndagani, Chuka, with a simple idea: dress the town well
          without the wait or the guesswork. What began as a small clothing rack has grown into a
          go-to stop for dresses, skirts, ladies tops, jerseys, cocktail perfumes and fresheners -
          picked piece by piece rather than ordered in bulk and hoped for.
        </p>
        <p>
          We know fashion in Chuka moves fast, from wedding season wine dresses to matchday jerseys,
          so we keep the catalogue changing and the WhatsApp line open. If you see it, you can have
          it - usually the same day.
        </p>
        <p>
          Every product on this site is something we'd genuinely wear or gift. That's the only
          filter we use when deciding what makes it onto the shelf.
        </p>
      </div>

      <div className="tag-divider my-10 text-navy-100 dark:text-navy-700" />

      <div className="grid gap-6 rounded-2xl border border-navy-100 bg-white p-8 dark:border-navy-700 dark:bg-navy-800 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-electric-600 dark:text-electric-400">Find us</p>
          <p className="mt-2 font-display text-lg font-semibold text-navy dark:text-cream">{SHOP_LOCATION}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-electric-600 dark:text-electric-400">Call or WhatsApp</p>
          {SHOP_PHONES.map((phone) => (
            <p key={phone} className="mt-1 text-navy-600 dark:text-navy-200">{phone}</p>
          ))}
          <Link
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald/90"
          >
            Chat on WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\(site)\about\page.js"

@'
import Link from 'next/link';
import { SHOP_LOCATION, SHOP_PHONES } from '@/lib/constants';
import { buildWhatsAppLink, generalWhatsAppMessage } from '@/lib/whatsapp';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Mecca City Boutique in Ndagani, Chuka - call, WhatsApp, or visit us.',
};

export default function ContactPage() {
  const waHref = buildWhatsAppLink(generalWhatsAppMessage());

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Get in touch</p>
      <h1 className="font-display text-4xl font-bold text-navy dark:text-cream">Contact Us</h1>
      <p className="mt-3 max-w-lg text-navy-500 dark:text-navy-200">
        The fastest way to reach us is WhatsApp - most orders get a reply within minutes.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-navy-100 bg-white p-8 dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-electric-600 dark:text-electric-400">Location</p>
          <p className="mt-2 font-display text-xl font-semibold text-navy dark:text-cream">{SHOP_LOCATION}</p>
          <p className="mt-2 text-sm text-navy-500 dark:text-navy-300">Open daily, closes 9pm.</p>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-8 dark:border-navy-700 dark:bg-navy-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-electric-600 dark:text-electric-400">Phone / WhatsApp</p>
          {SHOP_PHONES.map((phone) => (
            <p key={phone} className="mt-2 font-display text-xl font-semibold text-navy dark:text-cream">{phone}</p>
          ))}
          <Link
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald/90"
          >
            Message us on WhatsApp
          </Link>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-navy-100 dark:border-navy-700">
        <iframe
          title="Mecca City Boutique location"
          src="https://www.google.com/maps?q=Mecca+City+Boutique+Ndagani+Chuka&output=embed"
          className="h-80 w-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\(site)\contact\page.js"

@'
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductGrid from '@/components/ProductGrid';
import ProductOrderPanel from '@/components/ProductOrderPanel';
import { CATEGORIES } from '@/lib/constants';

async function getProduct(slug) {
  await connectDB();
  const product = await Product.findOne({ slug }).lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

async function getRelated(category, excludeId) {
  await connectDB();
  const related = await Product.find({ category, _id: { $ne: excludeId } }).limit(4).lean();
  return JSON.parse(JSON.stringify(related));
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product not found' };

  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const related = await getRelated(product.category, product._id);
  const categoryName = CATEGORIES.find((c) => c.slug === product.category)?.name || product.category;
  const soldOut = product.stockStatus === 'sold_out';

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy-50 dark:bg-navy-800">
            {product.images?.[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-navy-300 dark:text-navy-400">No image</div>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img) => (
                <div key={img.publicId} className="relative aspect-square overflow-hidden rounded-xl bg-navy-50 dark:bg-navy-800">
                  <Image src={img.url} alt={product.name} fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-electric-600 dark:text-electric-400">{categoryName}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-navy dark:text-cream md:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            {product.discountPrice ? (
              <>
                <span className="text-2xl font-bold text-emerald">KSh {product.discountPrice.toLocaleString()}</span>
                <span className="text-lg text-navy-300 line-through dark:text-navy-400">KSh {product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-navy dark:text-cream">KSh {product.price.toLocaleString()}</span>
            )}
          </div>

          <p className="mt-2 text-sm font-semibold">
            {soldOut ? (
              <span className="text-red-600 dark:text-red-400">Sold Out</span>
            ) : product.stockStatus === 'low_stock' ? (
              <span className="text-gold">Low Stock - order soon</span>
            ) : (
              <span className="text-emerald">In Stock</span>
            )}
          </p>

          <div className="tag-divider my-6 text-navy-100 dark:text-navy-700" />

          <p className="whitespace-pre-line text-navy-500 dark:text-navy-200">{product.description}</p>

          <ProductOrderPanel productName={product.name} sizes={product.sizes || []} soldOut={soldOut} />

          <p className="mt-3 text-xs text-navy-400 dark:text-navy-400">SKU: {product.sku}</p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-bold text-navy dark:text-cream">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\(site)\product\[slug]\page.js"

@'
'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle({ className = '' }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('mcb-theme', next ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-navy-200 text-navy transition-colors hover:border-electric dark:border-navy-600 dark:text-cream dark:hover:border-electric-400 ${className}`}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0 2a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V18.5a1 1 0 0 1 1-1ZM4.5 11a1 1 0 0 1 1 1H7a1 1 0 1 1 0 2H5.5a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1Zm12.5 1a1 1 0 0 1 1-1h1.5a1 1 0 1 1 0 2H18a1 1 0 0 1-1-1ZM6.34 6.34a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 1 1-1.41 1.41L6.34 7.75a1 1 0 0 1 0-1.41Zm8.85 8.85a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 0 1-1.41 1.41l-1.06-1.06a1 1 0 0 1 0-1.41ZM17.66 6.34a1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 1 1-1.41-1.41l1.06-1.06a1 1 0 0 1 1.41 0ZM8.81 15.19a1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 1 1-1.41-1.41l1.06-1.06a1 1 0 0 1 1.41 0Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M20.35 14.5A8.5 8.5 0 0 1 9.5 3.65a.75.75 0 0 0-.9-1 10 10 0 1 0 12.75 12.75.75.75 0 0 0-1-.9Z" />
        </svg>
      )}
    </button>
  );
}
'@ | Set-Content -Encoding UTF8 components\ThemeToggle.js

@'
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { LOGO_URL, SHOP_NAME } from '@/lib/constants';
import ThemeToggle from './ThemeToggle';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-cream/90 backdrop-blur dark:border-navy-700 dark:bg-navy-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src={LOGO_URL} alt={`${SHOP_NAME} logo`} width={36} height={36} className="rounded-md" />
          <span className="font-display text-xl font-bold tracking-tight text-navy dark:text-cream md:text-2xl">
            Mecca <span className="text-electric">City</span> <span className="text-emerald">Boutique</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-wide text-navy/80 transition-colors hover:text-electric dark:text-navy-200"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            href="/shop"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-electric dark:bg-electric dark:text-navy-900 dark:hover:bg-electric-400"
          >
            Shop Now
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            className="flex flex-col gap-1.5"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`h-0.5 w-6 bg-navy transition-transform dark:bg-cream ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-6 bg-navy transition-opacity dark:bg-cream ${open ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-6 bg-navy transition-transform dark:bg-cream ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-navy-100 bg-cream px-5 py-4 dark:border-navy-700 dark:bg-navy-900 md:hidden">
          <ul className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-base font-semibold text-navy dark:text-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-navy px-5 py-3 text-center text-sm font-semibold text-cream dark:bg-electric dark:text-navy-900"
              >
                Shop Now
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
'@ | Set-Content -Encoding UTF8 components\Navbar.js

@'
import Link from 'next/link';
import Image from 'next/image';
import { buildWhatsAppLink, productWhatsAppMessage } from '@/lib/whatsapp';

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;
  const soldOut = product.stockStatus === 'sold_out';
  const waHref = buildWhatsAppLink(productWhatsAppMessage(product.name));

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-navy-700 dark:bg-navy-800">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-navy-50 dark:bg-navy-700">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-navy-300 dark:text-navy-400">No image</div>
        )}

        {product.discountPrice && !soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy-900">
            Sale
          </span>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-navy-900/90 px-3 py-1 text-xs font-bold text-white">
            Sold Out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-electric-600 dark:text-electric-400">
          {product.category?.replace('_', ' ')}
        </p>
        <Link href={`/product/${product.slug}`} className="font-display text-lg font-semibold leading-snug text-navy hover:text-electric dark:text-cream">
          {product.name}
        </Link>

        <div className="mt-1 flex items-baseline gap-2">
          {product.discountPrice ? (
            <>
              <span className="font-semibold text-emerald">KSh {product.discountPrice.toLocaleString()}</span>
              <span className="text-sm text-navy-300 line-through dark:text-navy-400">KSh {product.price.toLocaleString()}</span>
            </>
          ) : (
            <span className="font-semibold text-navy dark:text-cream">KSh {product.price.toLocaleString()}</span>
          )}
        </div>

        <div className="mt-auto flex gap-2 pt-3">
          <Link
            href={`/product/${product.slug}`}
            className="flex-1 rounded-full border border-navy px-3 py-2 text-center text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-cream dark:border-cream dark:text-cream dark:hover:bg-cream dark:hover:text-navy"
          >
            View Details
          </Link>
          <Link
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full bg-emerald px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-emerald/90"
          >
            Order on WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 components\ProductCard.js

@'
import ProductCard from './ProductCard';

export default function ProductGrid({ products, emptyMessage = 'No products found.' }) {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-200 py-16 text-center text-navy-400 dark:border-navy-700 dark:text-navy-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 components\ProductGrid.js

@'
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/constants';

export default function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const activeCategory = searchParams.get('category') || 'all';

  function updateParams(next) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
      else params.delete(key);
    });
    router.push(`/shop?${params.toString()}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    updateParams({ search });
  }

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dresses, jerseys, perfumes..."
          className="w-full rounded-full border border-navy-200 bg-white px-5 py-3 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-cream dark:placeholder:text-navy-400"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-electric"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParams({ category: 'all' })}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            activeCategory === 'all'
              ? 'bg-navy text-cream dark:bg-electric dark:text-navy-900'
              : 'bg-navy-50 text-navy hover:bg-navy-100 dark:bg-navy-800 dark:text-navy-200 dark:hover:bg-navy-700'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => updateParams({ category: cat.slug })}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              activeCategory === cat.slug
                ? 'bg-navy text-cream dark:bg-electric dark:text-navy-900'
                : 'bg-navy-50 text-navy hover:bg-navy-100 dark:bg-navy-800 dark:text-navy-200 dark:hover:bg-navy-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 components\SearchFilterBar.js

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

      <ProductGrid products={products} emptyMessage="Featured products coming soon — check back shortly." />
    </section>
  );
}
'@ | Set-Content -Encoding UTF8 components\FeaturedProducts.js

@'
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildWhatsAppLink, productWhatsAppMessage } from '@/lib/whatsapp';

export default function ProductOrderPanel({ productName, sizes, soldOut }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const waHref = buildWhatsAppLink(productWhatsAppMessage(productName, selectedSize));

  return (
    <>
      {sizes?.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 dark:text-navy-300">
            {selectedSize ? `Size: ${selectedSize}` : 'Select a size'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  selectedSize === size
                    ? 'border-navy bg-navy text-cream dark:border-electric dark:bg-electric dark:text-navy-900'
                    : 'border-navy-200 text-navy hover:border-navy dark:border-navy-600 dark:text-cream dark:hover:border-cream'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-emerald px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-emerald/90"
        >
          {soldOut ? 'Ask About Restock on WhatsApp' : 'Order on WhatsApp'}
        </Link>
      </div>
    </>
  );
}
'@ | Set-Content -Encoding UTF8 components\ProductOrderPanel.js
