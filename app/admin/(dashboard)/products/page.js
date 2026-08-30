'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sellingId, setSellingId] = useState(null);

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
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      alert('Failed to delete product.');
    }
  }

  async function handleRecordSale(id) {
    setSellingId(id);
    try {
      const res = await fetch(`/api/products/${id}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Could not record sale.');
        return;
      }

      setProducts((prev) => prev.map((p) => (p._id === id ? data.product : p)));
    } catch {
      alert('Something went wrong. Try again.');
    } finally {
      setSellingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Products</h1>
          <p className="mt-1 text-sm text-navy-400">{products.length} product(s)</p>
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
          className="w-full max-w-sm rounded-full border border-navy-200 bg-white px-4 py-2.5 text-sm focus:border-electric focus:outline-none"
        />
        <button type="submit" className="rounded-full bg-navy-100 px-5 py-2.5 text-sm font-semibold text-navy">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400">
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
                <td colSpan={6} className="px-4 py-8 text-center text-navy-300">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-300">
                  No products yet - add your first product.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p._id} className="border-b border-navy-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-navy-50">
                      {p.images?.[0]?.url && (
                        <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-navy">{p.name}</p>
                      <p className="text-xs text-navy-400">SKU: {p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-navy-500">{p.category}</td>
                <td className="px-4 py-3 text-navy-500">KSh {p.price.toLocaleString()}</td>
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
                    <p className="mt-1 text-xs text-navy-400">{p.stockQuantity} left</p>
                  )}
                </td>
                <td className="px-4 py-3">{p.featured ? '★' : '-'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-3">
                    {p.stockQuantity != null && p.stockQuantity > 0 && (
                      <button
                        onClick={() => handleRecordSale(p._id)}
                        disabled={sellingId === p._id}
                        className="font-semibold text-emerald disabled:opacity-50"
                      >
                        {sellingId === p._id ? 'Recording...' : 'Record Sale'}
                      </button>
                    )}
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