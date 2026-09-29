import React from 'react';
import { Expense } from '../../types/expense';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, X } from 'lucide-react';

export interface DeleteExpenseDialogProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const DeleteExpenseDialog: React.FC<DeleteExpenseDialogProps> = ({
  isOpen,
  expense,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen || !expense) return null;

  const handleConfirm = async () => {
    await onConfirm(expense.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-scaleUp">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-semibold text-slate-100">Delete Transaction</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              Are you sure you want to delete the expense of{' '}
              <span className="font-semibold text-white font-mono">-${expense.amount}</span> on{' '}
              <span className="font-semibold text-white">{expense.category.name}</span>?
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <p className="text-slate-400">
                <span className="text-slate-500">Date:</span> {expense.expense_date}
              </p>
              {expense.description && (
                <p className="text-slate-400">
                  <span className="text-slate-500">Memo:</span> {expense.description}
                </p>
              )}
            </div>
            <p className="text-xs text-rose-400">This action cannot be undone.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirm}
              isLoading={isLoading}
            >
              Delete Transaction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
