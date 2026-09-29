import React, { useState, useEffect } from 'react';
import { Expense, ExpenseInput, PaymentMethod } from '../../types/expense';
import { useCategories } from '../categories/useCategories';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { X, Receipt, DollarSign, AlertCircle } from 'lucide-react';

export interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseInput) => Promise<void>;
  initialData?: Expense | null;
  isLoading?: boolean;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'CASH', label: 'Cash' },
  { id: 'CREDIT_CARD', label: 'Credit Card' },
  { id: 'DEBIT_CARD', label: 'Debit Card' },
  { id: 'UPI', label: 'UPI / Instant Payment' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { id: 'OTHER', label: 'Other' },
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { data: categories = [] } = useCategories();

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [expenseDate, setExpenseDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount);
      setCategoryId(initialData.category.id);
      setExpenseDate(initialData.expense_date);
      setPaymentMethod(initialData.payment_method);
      setDescription(initialData.description || '');
    } else {
      setAmount('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('CASH');
      setDescription('');
    }
    setError(null);
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    if (!expenseDate) {
      setError('Please select an expense date.');
      return;
    }

    setError(null);

    try {
      await onSubmit({
        amount: Number(amount).toFixed(2),
        category_id: Number(categoryId),
        expense_date: expenseDate,
        payment_method: paymentMethod,
        description: description.trim(),
      });
      onClose();
    } catch (err: any) {
      if (err.response?.data?.amount) {
        setError(Array.isArray(err.response.data.amount) ? err.response.data.amount[0] : err.response.data.amount);
      } else if (err.response?.data?.category) {
        setError(Array.isArray(err.response.data.category) ? err.response.data.category[0] : err.response.data.category);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to record expense. Please verify the input values.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              {initialData ? 'Edit Expense Transaction' : 'Record New Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Input */}
          <Input
            label="Monetary Amount ($)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
            required
            autoFocus
          />

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Expense Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Expense Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                required
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <Input
            label="Memo / Description (Optional)"
            placeholder="e.g. Weekly grocery run at Whole Foods"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {initialData ? 'Save Changes' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
