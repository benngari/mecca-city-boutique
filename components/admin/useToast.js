'use client';

import { useCallback, useRef, useState } from 'react';

// Lightweight, self-contained toast: call showToast(message, 'success'|'error')
// from a page, and render {ToastDisplay} somewhere in that page's JSX.
export function useToast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type });
    timeoutRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const ToastDisplay = toast ? (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-[200] max-w-xs rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-opacity ${
        toast.type === 'error' ? 'bg-red-500' : 'bg-emerald'
      }`}
    >
      {toast.message}
    </div>
  ) : null;

  return { showToast, ToastDisplay };
}
