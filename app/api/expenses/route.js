import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// GET /api/expenses?from=&to=  (admin only)
export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const query = {};
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const expenses = await Expense.find(query).sort({ date: -1 }).lean();
  return NextResponse.json({ expenses });
}

// POST /api/expenses  body: { description, amount, category, date }  (admin only)
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    if (!body.description || !(Number(body.amount) >= 0) || !body.date) {
      return NextResponse.json({ error: 'Description, amount and date are required' }, { status: 400 });
    }

    const expense = await Expense.create({
      description: body.description,
      amount: Number(body.amount),
      category: body.category || 'other',
      date: new Date(body.date),
      recordedBy: session.email,
    });

    await logAction({
      actor: session.email,
      action: 'expense.create',
      target: expense.description,
      details: `KSh ${expense.amount} - ${expense.category} - dated ${expense.date.toLocaleDateString()}`,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (err) {
    console.error('Create expense error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
