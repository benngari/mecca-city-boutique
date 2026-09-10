export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <div className="mb-8">
        <div className="h-3 w-20 animate-pulse rounded bg-navy-100 dark:bg-navy-700" />
        <div className="mt-2 h-8 w-56 animate-pulse rounded bg-navy-100 dark:bg-navy-700" />
      </div>

      <div className="mb-8 flex gap-3">
        <div className="h-12 flex-1 animate-pulse rounded-full bg-navy-100 dark:bg-navy-700" />
        <div className="h-12 w-40 animate-pulse rounded-full bg-navy-100 dark:bg-navy-700" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-navy-100 dark:border-navy-700">
            <div className="aspect-[4/5] animate-pulse bg-navy-100 dark:bg-navy-700" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-16 animate-pulse rounded bg-navy-100 dark:bg-navy-700" />
              <div className="h-4 w-full animate-pulse rounded bg-navy-100 dark:bg-navy-700" />
              <div className="h-4 w-20 animate-pulse rounded bg-navy-100 dark:bg-navy-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
