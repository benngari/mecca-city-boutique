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
  costPrice: '',
  unitType: 'piece',
  lowStockThreshold: '',
  category: CATEGORIES[0].slug,
  images: [],
  sizes: [],
  stockStatus: 'in_stock',
  stockQuantity: '',
  featured: false,
  sku: '',
  bundleId: '',
};

export default function ProductForm({ initialProduct, productId }) {
  const router = useRouter();
  const [form, setForm] = useState(
    initialProduct
      ? {
          ...EMPTY,
          ...initialProduct,
          stockQuantity: initialProduct.stockQuantity ?? '',
          bundleId: initialProduct.bundleId ?? '',
          costPrice: initialProduct.costPrice ?? '',
          lowStockThreshold: initialProduct.lowStockThreshold ?? '',
        }
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
      costPrice: form.costPrice !== '' ? Number(form.costPrice) : null,
      lowStockThreshold: form.lowStockThreshold !== '' ? Number(form.lowStockThreshold) : null,
      stockQuantity,
      stockStatus,
      bundleId: form.bundleId.trim() ? form.bundleId.trim() : null,
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
        <label className="block text-sm font-semibold text-navy dark:text-cream">Product Images</label>
        <div className="mt-2">
          <ImageUploader images={form.images} onChange={(images) => update('images', images)} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy dark:text-cream">
          Product Name
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          />
        </label>

        <label className="block text-sm font-semibold text-navy dark:text-cream">
          SKU
          <input
            required
            value={form.sku}
            onChange={(e) => update('sku', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          />
        </label>
      </div>

      <label className="block text-sm font-semibold text-navy dark:text-cream">
        Description
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-sm font-semibold text-navy dark:text-cream">
          Price (KSh)
          <input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          />
        </label>

        <label className="block text-sm font-semibold text-navy dark:text-cream">
          Discount Price (optional)
          <input
            type="number"
            min="0"
            value={form.discountPrice || ''}
            onChange={(e) => update('discountPrice', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          />
        </label>

        <label className="block text-sm font-semibold text-navy dark:text-cream">
          Category
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-sm font-semibold text-navy dark:text-cream">
          Cost Price (optional)
          <input
            type="number"
            min="0"
            value={form.costPrice}
            onChange={(e) => update('costPrice', e.target.value)}
            placeholder="What you paid, per unit"
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          />
          <span className="mt-1 block text-xs font-normal text-navy-400 dark:text-navy-300">
            Used to calculate profit automatically when a sale is recorded.
          </span>
        </label>

        <label className="block text-sm font-semibold text-navy dark:text-cream">
          Sold By
          <select
            value={form.unitType}
            onChange={(e) => update('unitType', e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          >
            <option value="piece">Piece (e.g. clothing)</option>
            <option value="ml">Millilitres - ml (e.g. perfume refills)</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-navy dark:text-cream">
          Low Stock Alert At (optional)
          <input
            type="number"
            min="0"
            value={form.lowStockThreshold}
            onChange={(e) => update('lowStockThreshold', e.target.value)}
            placeholder={form.unitType === 'ml' ? 'e.g. 100' : 'e.g. 3'}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          />
          <span className="mt-1 block text-xs font-normal text-navy-400 dark:text-navy-300">
            Leave blank to use the site-wide default for this unit (set in Settings).
          </span>
        </label>
      </div>

      <div>
        <p className="text-sm font-semibold text-navy dark:text-cream">Available Sizes</p>
        <p className="mt-0.5 text-xs text-navy-400 dark:text-navy-300">
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
                  ? 'border-navy bg-navy text-cream dark:border-electric dark:bg-electric dark:text-navy-900'
                  : 'border-navy-200 text-navy-500 hover:border-navy dark:border-navy-600 dark:text-navy-300 dark:hover:border-cream'
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
            className="w-full max-w-xs rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
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
        <label className="block text-sm font-semibold text-navy dark:text-cream">
          Stock Quantity (optional) - {form.unitType === 'ml' ? 'ml' : 'pieces'}
          <input
            type="number"
            min="0"
            value={form.stockQuantity}
            onChange={(e) => update('stockQuantity', e.target.value)}
            placeholder={form.unitType === 'ml' ? 'e.g. 1000' : 'e.g. 12'}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          />
          <span className="mt-1 block text-xs font-normal text-navy-400 dark:text-navy-300">
            Set this to track exact stock. Status below updates automatically from it. Leave
            blank to set status manually instead.
          </span>
        </label>

        <label className="block text-sm font-semibold text-navy dark:text-cream">
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

      <label className="block text-sm font-semibold text-navy dark:text-cream">
        Bundle ID (optional)
        <input
          type="text"
          value={form.bundleId}
          onChange={(e) => update('bundleId', e.target.value)}
          placeholder="e.g. wedding-look-1"
          className="mt-1 w-full max-w-xs rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
        />
        <span className="mt-1 block text-xs font-normal text-navy-400 dark:text-navy-300">
          Give 2-3 products the exact same Bundle ID to group them as a "Complete the Look" set
          on the product page. Leave blank if this product isn't part of a set.
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-navy dark:text-cream">
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
          className="rounded-full border border-navy-200 px-6 py-3 text-sm font-semibold text-navy dark:text-cream"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
