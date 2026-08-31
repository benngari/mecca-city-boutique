'use client';

const SEGMENT_COLORS = [
  '#2D8FE0', // electric
  '#16A34A', // emerald
  '#F5B301', // gold
  '#8598C9', // navy-300
  '#4C63A0', // navy-400
  '#1D6FB8', // electric-600
  '#22C55E', // green
  '#EAB308', // amber
  '#64748B', // slate
];

// A phone-storage-style segmented bar: each category gets a share of the bar
// proportional to its stock units (or value), with a colour-coded legend below.
export default function StorageBar({ categories, metric = 'units', valueFormatter }) {
  const total = categories.reduce((sum, c) => sum + (c[metric] || 0), 0);
  const withData = categories.filter((c) => (c[metric] || 0) > 0);

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-200 p-6 text-center text-sm text-navy-400 dark:border-navy-700 dark:text-navy-300">
        No stock quantities tracked yet - set a Stock Quantity on your products to see the breakdown here.
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
        {withData.map((c, i) => (
          <div
            key={c.slug}
            style={{ width: `${((c[metric] || 0) / total) * 100}%`, backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
            title={`${c.name}: ${c[metric]}`}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {withData.map((c, i) => (
          <div key={c.slug} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
            />
            <span className="truncate text-navy-500 dark:text-navy-200">{c.name}</span>
            <span className="ml-auto shrink-0 font-semibold text-navy dark:text-cream">
              {valueFormatter ? valueFormatter(c[metric]) : c[metric]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
