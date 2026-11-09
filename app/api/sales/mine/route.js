import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import { getSession } from '@/lib/auth';
import { getEatDayRange } from '@/lib/dateRanges';

// GET /api/sales/mine - the sales the logged-in person recorded today (Kenyan time).
// Deliberately leaves out cost and profit so staff never see buying prices.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { start, end } = getEatDayRange();

  const sales = await Sale.find({
    recordedBy: session.email,
    voidedAt: null,
    createdAt: { $gte: start, $lt: end },
  })
    .sort({ createdAt: -1 })
    .select('productName quantitySold unitType revenue soldAt createdAt')
    .lean();

  const totals = sales.reduce(
    (acc, s) => ({ count: acc.count + 1, revenue: acc.revenue + s.revenue }),
    { count: 0, revenue: 0 }
  );

  return NextResponse.json({ sales, totals });
}
