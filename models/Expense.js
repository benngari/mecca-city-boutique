import mongoose from 'mongoose';

const EXPENSE_CATEGORIES = ['rent', 'transport', 'electricity', 'wages', 'supplies', 'other'];

const ExpenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, enum: EXPENSE_CATEGORIES, default: 'other' },
    date: { type: Date, required: true, index: true }, // when the expense was actually incurred/paid
    recordedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export { EXPENSE_CATEGORIES };
export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
