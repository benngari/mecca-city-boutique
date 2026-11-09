import Link from 'next/link';

function changeInfo(current, previous) {
  if (!previous) {
    return { text: 'No sales in the same days last month', tone: 'text-navy-400 dark:text-navy-300' };
  }
  const pct = Math.round(((current - previous) / Math.abs(previous)) * 100);
  const sign = pct > 0 ? '+' : '';
  return {
    text: `${sign}${pct}% vs same days last month (KSh ${previous.toLocaleString()})`,
    tone: pct >= 0 ? 'text-emerald' : 'text-red-500',
  };
}

// This month so far, compared with the same number of days last month, plus
// progress toward the monthly revenue target set in Settings.
export default function MonthProgress({
  monthLabel,
  dayOfMonth,
  daysInMonth,
  revenue,
  profit,
  prevRevenue,
  prevProfit,
  target,
}) {
  const revenueChange = changeInfo(revenue, prevRevenue);
  const profitChange = changeInfo(profit, prevProfit);

  const pct = target > 0 ? Math.min(100, Math.round((revenue / target) * 100)) : 0;
  const expectedPct = Math.round((dayOfMonth / daysInMonth) * 100);
  const onPace = pct >= expectedPct;
  const daysLeft = daysInMonth - dayOfMonth + 1;
  const remaining = Math.max(0, target - revenue);

  return (
    <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-navy dark:text-cream">This Month - {monthLabel}</p>
        <p className="text-xs text-navy-400 dark:text-navy-300">
          Day {dayOfMonth} of {daysInMonth}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 dark:text-navy-300">Revenue</p>
          <p className="mt-1 font-display text-2xl font-bold text-navy dark:text-cream">
            KSh {revenue.toLocaleString()}
          </p>
          <p className={`mt-1 text-xs font-semibold ${revenueChange.tone}`}>{revenueChange.text}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 dark:text-navy-300">Gross Profit</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald">KSh {profit.toLocaleString()}</p>
          <p className={`mt-1 text-xs font-semibold ${profitChange.tone}`}>{profitChange.text}</p>
        </div>
      </div>

      {target > 0 ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-semibold text-navy dark:text-cream">Monthly revenue target</span>
            <span className="text-navy-500 dark:text-navy-200">
              KSh {revenue.toLocaleString()} of KSh {target.toLocaleString()} ({pct}%)
            </span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700">
            <div
              className={`h-full rounded-full ${onPace ? 'bg-emerald' : 'bg-gold'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-navy-500 dark:text-navy-200">
            {revenue >= target
              ? 'Target reached - well done.'
              : `${onPace ? 'On pace.' : 'Behind pace.'} About KSh ${Math.ceil(
                  remaining / daysLeft
                ).toLocaleString()} a day is needed for the rest of the month.`}
          </p>
        </div>
      ) : (
        <p className="mt-5 text-xs text-navy-400 dark:text-navy-300">
          No monthly target set yet.{' '}
          <Link href="/admin/settings" className="font-semibold text-electric">
            Set one in Settings
          </Link>{' '}
          to track progress here.
        </p>
      )}
    </div>
  );
}
