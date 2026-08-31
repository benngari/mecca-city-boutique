export const dynamic = 'force-dynamic';

import { connectDB } from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

async function getEntries() {
  await connectDB();
  const entries = await AuditLog.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return JSON.parse(JSON.stringify(entries));
}

export default async function AuditLogPage() {
  const entries = await getEntries();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Audit Log</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        Every admin action, most recent first (last 200 entries).
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Who</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  No activity recorded yet.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr key={entry._id} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                <td className="whitespace-nowrap px-4 py-3 text-navy-500 dark:text-navy-200">
                  {new Date(entry.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-navy dark:text-cream">{entry.actor}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy dark:bg-navy-700 dark:text-cream">
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">{entry.target || '-'}</td>
                <td className="px-4 py-3 text-navy-400 dark:text-navy-300">{entry.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
