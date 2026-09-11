'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/admin/useToast';

export default function SettingsPage() {
  const [piece, setPiece] = useState('3');
  const [ml, setMl] = useState('100');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast, ToastDisplay } = useToast();

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setPiece(String(data.settings.defaultLowStockThresholdPiece));
          setMl(String(data.settings.defaultLowStockThresholdMl));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultLowStockThresholdPiece: Number(piece),
          defaultLowStockThresholdMl: Number(ml),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Could not save settings.', 'error');
        return;
      }
      showToast('Settings saved.');
    } catch {
      showToast('Something went wrong. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Settings</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        Site-wide defaults. Any product can override these with its own Low Stock Alert value.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-navy-300 dark:text-navy-400">Loading...</p>
      ) : (
        <form onSubmit={handleSave} className="mt-6 max-w-md space-y-6 rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
          <label className="block text-sm font-semibold text-navy dark:text-cream">
            Default low stock alert - piece items
            <input
              type="number"
              min="0"
              value={piece}
              onChange={(e) => setPiece(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
            />
            <span className="mt-1 block text-xs font-normal text-navy-400">
              Applies to any product sold by the piece (clothing, etc.) with no custom threshold set.
            </span>
          </label>

          <label className="block text-sm font-semibold text-navy dark:text-cream">
            Default low stock alert - ml items
            <input
              type="number"
              min="0"
              value={ml}
              onChange={(e) => setMl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
            />
            <span className="mt-1 block text-xs font-normal text-navy-400">
              Applies to any product sold by millilitres (perfume refills, etc.) with no custom threshold set.
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-electric disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}

      {ToastDisplay}
    </div>
  );
}
