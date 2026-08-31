'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TrashPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function loadTrash() {
    setLoading(true);
    const res = await fetch('/api/products/trash');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    loadTrash();
  }, []);

  async function handleRestore(id) {
    setBusyId(id);
    const res = await fetch(`/api/products/${id}/restore`, { method: 'POST' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      alert('Failed to restore product.');
    }
    setBusyId(null);
  }

  async function handlePermanentDelete(id) {
    if (!confirm('Permanently delete this product and its images? This cannot be undone.')) return;
    setBusyId(id);
    const res = await fetch(`/api/products/${id}/permanent-delete`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      alert('Failed to delete product.');
    }
    setBusyId(null);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Trash</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        Deleted products stay here until you restore or permanently delete them.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Deleted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Trash is empty.
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
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">
                  {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleRestore(p._id)}
                      disabled={busyId === p._id}
                      className="font-semibold text-emerald disabled:opacity-50"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(p._id)}
                      disabled={busyId === p._id}
                      className="font-semibold text-red-500 disabled:opacity-50"
                    >
                      Delete Forever
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
