import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getSession } from '@/lib/auth';
import { toCsv, csvResponse, eatDate } from '@/lib/csv';

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function safeName(value) {
  return (value || '').replace(/[^0-9-]/g, '');
}

// GET /api/export/expenses?from=YYYY-MM-DD&to=YYYY-MM-DD  (owner only)
export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.role === 'staff') {
    return NextResponse.json({ error: 'Not authorized for this action' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  const query = {};
  if (fromDate || toDate) {
    query.date = {};
    if (fromDate) query.date.$gte = fromDate;
    if (toDate) query.date.$lte = toDate;
  }

  await connectDB();
  const expenses = await Expense.find(query).sort({ date: -1 }).lean();

  const csv = toCsv(
    [
      { label: 'Date', value: (e) => eatDate(e.date) },
      { label: 'Description', value: (e) => e.description },
      { label: 'Category', value: (e) => e.category },
      { label: 'Amount (KSh)', value: (e) => e.amount },
      { label: 'Recorded By', value: (e) => e.recordedBy },
    ],
    expenses
  );

  const fileName = `mecca-expenses-${safeName(from) || 'start'}-to-${safeName(to) || 'today'}.csv`;
  return csvResponse(fileName, csv);
}
