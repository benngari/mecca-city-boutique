'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/admin/useToast';
import { useConfirmDialog } from '@/components/admin/useConfirmDialog';

// Owner-only "Void" action for one sale row. The component stays mounted after
// a successful void (it just switches to the "Voided" label) so its toast is
// still visible once the page data refreshes.
export default function VoidSaleButton({ saleId, voided, summary }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { showToast, ToastDisplay } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  async function handleVoid() {
    if (busy) return;
    const ok = await confirm(
      `Void ${summary}? The stock is put back and the sale is removed from revenue and profit. This cannot be undone.`,
      'danger'
    );
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/sales/${saleId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Could not void this sale.', 'error');
      } else {
        showToast('Sale voided and stock restored.');
        router.refresh();
      }
    } catch {
      showToast('Something went wrong. Try again.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {voided ? (
        <span className="text-xs font-semibold text-navy-400 dark:text-navy-300">Voided</span>
      ) : (
        <button
          type="button"
          onClick={handleVoid}
          disabled={busy}
          className="font-semibold text-red-500 disabled:opacity-50"
        >
          {busy ? 'Voiding...' : 'Void'}
        </button>
      )}
      {ConfirmDialog}
      {ToastDisplay}
    </>
  );
}
