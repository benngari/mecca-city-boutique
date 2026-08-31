export default function StatsCard({ label, value, accent = 'text-navy dark:text-cream' }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 dark:text-navy-300">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
