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
