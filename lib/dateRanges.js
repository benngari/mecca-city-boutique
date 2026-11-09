// East Africa Time (Kenya) is UTC+3 all year - there is no daylight saving.
// Vercel's servers run in UTC, so "today" and "this month" have to be worked
// out explicitly in EAT, or they roll over at 3am Kenyan time instead of midnight.
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Start (inclusive) and end (exclusive) of the current day in EAT.
export function getEatDayRange(now = new Date()) {
  const eat = new Date(now.getTime() + EAT_OFFSET_MS);
  const startMs =
    Date.UTC(eat.getUTCFullYear(), eat.getUTCMonth(), eat.getUTCDate()) - EAT_OFFSET_MS;
  return { start: new Date(startMs), end: new Date(startMs + DAY_MS) };
}

// Start (inclusive) and end (exclusive) of a calendar month in EAT.
// monthOffset 0 = this month, -1 = last month.
export function getEatMonthRange(monthOffset = 0, now = new Date()) {
  const eat = new Date(now.getTime() + EAT_OFFSET_MS);
  const year = eat.getUTCFullYear();
  const month = eat.getUTCMonth() + monthOffset;
  return {
    start: new Date(Date.UTC(year, month, 1) - EAT_OFFSET_MS),
    end: new Date(Date.UTC(year, month + 1, 1) - EAT_OFFSET_MS),
  };
}
