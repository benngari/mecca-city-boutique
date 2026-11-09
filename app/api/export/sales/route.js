import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import { getSession } from '@/lib/auth';
import { toCsv, csvResponse, eatDate, eatDateTime } from '@/lib/csv';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// GET /api/export/sales?days=30  (owner only) - same date range logic as the Sales page.
// Voided sales are left out so the totals match what the Sales page shows.
export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.role === 'staff') {
    return NextResponse.json({ error: 'Not authorized for this action' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const requested = parseInt(searchParams.get('days') || '30', 10);
  const days = Math.min(Math.max(Number.isNaN(requested) ? 30 : requested, 1), 366);

  const endDate = endOfDay(new Date());
  const startDate = startOfDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));

  await connectDB();
  const sales = await Sale.find({
    voidedAt: null,
    soldAt: { $gte: startDate, $lte: endDate },
  })
    .sort({ soldAt: -1 })
    .lean();

  const csv = toCsv(
    [
      { label: 'Date Sold', value: (s) => eatDate(s.soldAt) },
      { label: 'Product', value: (s) => s.productName },
      { label: 'SKU', value: (s) => s.sku },
      { label: 'Category', value: (s) => s.category },
      { label: 'Unit', value: (s) => s.unitType },
      { label: 'Quantity', value: (s) => s.quantitySold },
      { label: 'Revenue (KSh)', value: (s) => s.revenue },
      { label: 'Cost (KSh)', value: (s) => s.cost },
      { label: 'Profit (KSh)', value: (s) => s.profit },
      { label: 'Recorded By', value: (s) => s.recordedBy },
      { label: 'Recorded At', value: (s) => eatDateTime(s.createdAt) },
    ],
    sales
  );

  return csvResponse(`mecca-sales-last-${days}-days.csv`, csv);
}
