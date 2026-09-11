'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/admin/useToast';
import { useConfirmDialog } from '@/components/admin/useConfirmDialog';

const CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'transport', label: 'Transport' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'wages', label: 'Wages' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'other', label: 'Other' },
];

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonthInputValue() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [from, setFrom] = useState(firstOfMonthInputValue());
  const [to, setTo] = useState(todayInputValue());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [date, setDate] = useState(todayInputValue());
  const { showToast, ToastDisplay } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  async function loadExpenses() {
    setLoading(true);
    const params = new URLSearchParams({ from, to });
    const res = await fetch(`/api/expenses?${params.toString()}`);
    const data = await res.json();
    setExpenses(data.expenses || []);
    setLoading(false);
  }

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!description.trim() || !(Number(amount) >= 0) || !date) {
      showToast('Fill in description, amount and date.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount: Number(amount), category, date }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Could not add expense.', 'error');
        return;
      }

      showToast('Expense added.');
      setDescription('');
      setAmount('');
      setCategory('other');
      setDate(todayInputValue());
      loadExpenses();
    } catch {
      showToast('Something went wrong. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const ok = await confirm('Delete this expense entry?', 'danger');
    if (!ok) return;

    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      showToast('Expense deleted.');
    } else {
      showToast('Failed to delete expense.', 'error');
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">Expenses</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        Rent, transport, electricity and other costs - subtracted from gross profit to get your
        real net profit on the Sales page.
      </p>

      <form
        onSubmit={handleAdd}
        className="mt-6 grid gap-4 rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-xs font-semibold text-navy dark:text-cream lg:col-span-2">
          Description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Shop rent - September"
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          />
        </label>

        <label className="text-xs font-semibold text-navy dark:text-cream">
          Amount (KSh)
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          />
        </label>

        <label className="text-xs font-semibold text-navy dark:text-cream">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-navy dark:text-cream">
          Date
          <input
            type="date"
            value={date}
            max={todayInputValue()}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream hover:bg-electric disabled:opacity-60 lg:col-span-5"
        >
          {saving ? 'Adding...' : '+ Add Expense'}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <label className="text-xs font-semibold text-navy dark:text-cream">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-cream"
          />
        </label>
        <label className="text-xs font-semibold text-navy dark:text-cream">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-800 dark:text-cream"
          />
        </label>
        <button
          onClick={loadExpenses}
          className="rounded-full bg-navy-100 px-5 py-2.5 text-sm font-semibold text-navy dark:bg-navy-800 dark:text-cream"
        >
          Filter
        </button>
        <p className="ml-auto text-sm font-semibold text-navy dark:text-cream">
          Total: <span className="text-red-500">KSh {total.toLocaleString()}</span>
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  No expenses recorded in this range.
                </td>
              </tr>
            )}
            {expenses.map((e) => (
              <tr key={e._id} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">
                  {new Date(e.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-navy dark:text-cream">{e.description}</td>
                <td className="px-4 py-3 capitalize text-navy-500 dark:text-navy-200">{e.category}</td>
                <td className="px-4 py-3 font-semibold text-red-500">KSh {e.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(e._id)} className="font-semibold text-red-500">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ConfirmDialog}
      {ToastDisplay}
    </div>
  );
}
