'use client';

import { useCallback, useRef, useState } from 'react';

// Promise-based replacement for the native confirm(). Call:
//   const ok = await confirm('Delete this?');
// and render {ConfirmDialog} somewhere in the page's JSX.
export function useConfirmDialog() {
  const [state, setState] = useState({ open: false, message: '', tone: 'default' });
  const resolver = useRef(null);

  const confirm = useCallback((message, tone = 'default') => {
    setState({ open: true, message, tone });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  function handle(result) {
    setState((s) => ({ ...s, open: false }));
    resolver.current?.(result);
  }

  const ConfirmDialog = state.open ? (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={() => handle(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-navy dark:text-cream">{state.message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => handle(false)}
            className="rounded-full border border-navy-200 px-4 py-2 text-sm font-semibold text-navy dark:border-navy-600 dark:text-cream"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handle(true)}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${
              state.tone === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald hover:bg-emerald/90'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmDialog };
}
