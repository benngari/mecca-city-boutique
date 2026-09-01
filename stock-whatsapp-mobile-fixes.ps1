@'
// Converts a Kenyan local number (07XXXXXXXX / 01XXXXXXXX) to international format (254XXXXXXXXX)
export function toKenyanInternational(localNumber) {
  const digits = String(localNumber).replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return digits;
}

const PRIMARY_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || toKenyanInternational('0719215341');

export function buildWhatsAppLink(message, number = PRIMARY_NUMBER) {
  const phone = toKenyanInternational(number);
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

// options: { size, sku, imageUrl }
// wa.me links can only pre-fill text, not attach an image file directly - including
// the image URL lets WhatsApp auto-generate a link preview thumbnail once sent.
export function productWhatsAppMessage(productName, options = {}) {
  const { size, sku, imageUrl } = options;

  let message = `Hello Mecca City Boutique, I am interested in ${productName}`;
  if (sku) message += ` (SKU: ${sku})`;
  if (size) message += ` (size ${size})`;
  message += '. Is it available?';
  if (imageUrl) message += `\n\nPhoto: ${imageUrl}`;

  return message;
}

export function generalWhatsAppMessage() {
  return 'Hello Mecca City Boutique, I would like to know more about your products.';
}
'@ | Set-Content -Encoding UTF8 lib\whatsapp.js

@'
import Link from 'next/link';
import Image from 'next/image';
import { buildWhatsAppLink, productWhatsAppMessage } from '@/lib/whatsapp';

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;
  const soldOut = product.stockStatus === 'sold_out';
  const waHref = buildWhatsAppLink(
    productWhatsAppMessage(product.name, { sku: product.sku, imageUrl: product.images?.[0]?.url })
  );

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
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildWhatsAppLink, productWhatsAppMessage } from '@/lib/whatsapp';

export default function ProductOrderPanel({ productName, sizes, soldOut, sku, imageUrl }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const waHref = buildWhatsAppLink(
    productWhatsAppMessage(productName, { size: selectedSize, sku, imageUrl })
  );

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

          <ProductOrderPanel
            productName={product.name}
            sizes={product.sizes || []}
            soldOut={soldOut}
            sku={product.sku}
            imageUrl={product.images?.[0]?.url}
          />

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
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [quantities, setQuantities] = useState({});

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

  function getQuantity(id) {
    const value = Number(quantities[id]);
    return value > 0 ? value : 1;
  }

  async function handleDelete(id) {
    if (!confirm('Move this product to Trash? You can restore it later.')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      alert('Failed to delete product.');
    }
  }

  async function handleRecordSale(id) {
    const quantity = getQuantity(id);
    setBusyId(id);
    try {
      const res = await fetch(`/api/products/${id}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Could not record sale.');
        return;
      }

      setProducts((prev) => prev.map((p) => (p._id === id ? data.product : p)));
      setQuantities((prev) => ({ ...prev, [id]: '1' }));
    } catch {
      alert('Something went wrong. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleAddStock(id) {
    const quantity = getQuantity(id);
    setBusyId(id);
    try {
      const res = await fetch(`/api/products/${id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Could not add stock.');
        return;
      }

      setProducts((prev) => prev.map((p) => (p._id === id ? data.product : p)));
      setQuantities((prev) => ({ ...prev, [id]: '1' }));
    } catch {
      alert('Something went wrong. Try again.');
    } finally {
      setBusyId(null);
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
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  No products yet - add your first product.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p._id} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
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
                <td className="px-4 py-3">{p.featured ? '★' : '-'}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    value={quantities[p._id] ?? '1'}
                    onChange={(e) => setQuantities((prev) => ({ ...prev, [p._id]: e.target.value }))}
                    className="w-16 rounded-lg border border-navy-200 px-2 py-1.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      onClick={() => handleAddStock(p._id)}
                      disabled={busyId === p._id}
                      className="font-semibold text-electric disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => handleRecordSale(p._id)}
                      disabled={busyId === p._id}
                      className="font-semibold text-emerald disabled:opacity-50"
                    >
                      Sell
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\admin\(dashboard)\products\page.js"

@'
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/products/new', label: 'Add Product' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/trash', label: 'Trash' },
  { href: '/admin/audit-log', label: 'Audit Log' },
  { href: '/admin/users', label: 'Users' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Hard navigation so the cleared session cookie is guaranteed to be picked up
    window.location.href = '/admin/login?loggedout=true';
  }

  return (
    <>
      {/* Mobile top bar with hamburger trigger */}
      <div className="flex items-center justify-between border-b border-navy-700 bg-navy-900 p-4 md:hidden">
        <p className="font-display text-lg font-bold text-cream">
          MCB <span className="text-electric-400">Admin</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-cream hover:bg-navy-700"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
          </svg>
        </button>
      </div>

      {/* Mobile off-canvas drawer, slides in from the left */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col justify-between bg-white p-6 shadow-xl dark:bg-navy-900">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-lg font-bold text-navy dark:text-cream">
                  MCB <span className="text-electric">Admin</span>
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-1.5 text-navy hover:bg-navy-50 dark:text-cream dark:hover:bg-navy-800"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5Z" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-electric text-navy-900'
                          : 'text-navy hover:bg-navy-50 dark:text-cream dark:hover:bg-navy-800'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-navy-800"
            >
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar, always visible */}
      <aside className="hidden md:flex md:h-screen md:w-60 md:flex-col md:justify-between md:border-r md:border-navy-700 md:bg-navy-900 md:p-6">
        <div>
          <p className="mb-8 font-display text-lg font-bold text-cream">
            MCB <span className="text-electric-400">Admin</span>
          </p>
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? 'bg-electric text-navy-900' : 'text-navy-200 hover:bg-navy-700'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="h-fit rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-navy-200 hover:bg-navy-700"
        >
          Log Out
        </button>
      </aside>
    </>
  );
}
'@ | Set-Content -Encoding UTF8 components\admin\AdminSidebar.js
