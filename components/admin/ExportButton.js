'use client';

// Starts a CSV download. A plain navigation to the export URL is enough because
// the server answers with a file attachment, so the page itself does not change.
export default function ExportButton({ href, label = 'Export CSV' }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = href;
      }}
      className="rounded-full border border-navy-200 px-4 py-2 text-xs font-semibold text-navy hover:bg-navy-50 dark:border-navy-600 dark:text-cream dark:hover:bg-navy-800"
    >
      {label}
    </button>
  );
}
