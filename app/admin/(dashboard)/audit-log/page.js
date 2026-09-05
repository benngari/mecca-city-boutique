@'
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { formatDateTimeEAT } from '@/lib/formatDate';

const PAGE_SIZE = 15;

async function getEntries(page) {
  await connectDB();
  const [entries, total] = await Promise.all([
    AuditLog.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    AuditLog.countDocuments({}),
  ]);
  return { entries: JSON.parse(JSON.stringify(entries)), total };
}

export default async function AuditLogPage({ searchParams }) {
  const page = Math.max(parseInt(searchParams?.page || '1', 10), 1);
  const { entries, total } = await getEntries(page);
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Audit Log</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        Every admin action, most recent first. Page {page} of {totalPages} ({total} total).
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
                  {formatDateTimeEAT(entry.createdAt)}
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

      <div className="mt-4 flex items-center justify-between">
        {page > 1 ? (
          <Link
            href={`/admin/audit-log?page=${page - 1}`}
            className="rounded-full border border-navy-200 px-5 py-2 text-sm font-semibold text-navy hover:bg-navy-50 dark:border-navy-600 dark:text-cream dark:hover:bg-navy-800"
          >
            Previous
          </Link>
        ) : (
          <span />
        )}

        {page < totalPages && (
          <Link
            href={`/admin/audit-log?page=${page + 1}`}
            className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-cream hover:bg-electric dark:bg-electric dark:text-navy-900"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 "app\admin\(dashboard)\audit-log\page.js"