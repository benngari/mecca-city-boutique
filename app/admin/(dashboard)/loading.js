export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="h-7 w-48 animate-pulse rounded bg-navy-100 dark:bg-navy-700" />
      <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-navy-100 dark:bg-navy-700" />

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800"
          />
        ))}
      </div>

      <div className="mt-6 h-64 animate-pulse rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}