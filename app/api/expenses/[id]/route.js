import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// DELETE /api/expenses/[id]  (admin only)
export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const expense = await Expense.findById(params.id);
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    await Expense.findByIdAndDelete(params.id);

    await logAction({
      actor: session.email,
      action: 'expense.delete',
      target: expense.description,
      details: `KSh ${expense.amount} removed`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete expense error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
