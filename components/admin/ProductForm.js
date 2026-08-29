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
  featured: false,
  sku: '',
};

export default function ProductForm({ initialProduct, productId }) {
  const router = useRouter();
  const [form, setForm] = useState(initialProduct ? { ...EMPTY, ...initialProduct } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSize(size) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          Stock Status
          <select
            value={form.stockStatus}
            onChange={(e) => update('stockStatus', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          >
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="sold_out">Sold Out</option>
          </select>
        </label>

        <label className="mt-7 flex items-center gap-2 text-sm font-semibold text-navy">
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
