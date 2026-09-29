import React from 'react';
import { Expense, PaymentMethod } from '../../types/expense';
import { CategoryIcon } from '../categories/categoryIcons';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Edit2, Trash2, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { clsx } from 'clsx';

export interface ExpenseTableProps {
  expenses: Expense[];
  count: number;
  currentPage: number;
  pageSize?: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (newPage: number) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  isLoading?: boolean;
}

const formatPaymentMethod = (method: PaymentMethod): { label: string; variant: 'default' | 'info' | 'warning' | 'success' } => {
  switch (method) {
    case 'CREDIT_CARD':
      return { label: 'Credit Card', variant: 'info' };
    case 'DEBIT_CARD':
      return { label: 'Debit Card', variant: 'default' };
    case 'UPI':
      return { label: 'UPI / Instant', variant: 'success' };
    case 'BANK_TRANSFER':
      return { label: 'Bank Transfer', variant: 'info' };
    case 'CASH':
      return { label: 'Cash', variant: 'warning' };
    default:
      return { label: 'Other', variant: 'default' };
  }
};

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  count,
  currentPage,
  pageSize = 10,
  hasNext,
  hasPrevious,
  onPageChange,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const totalPages = Math.ceil(count / pageSize) || 1;

  if (expenses.length === 0 && !isLoading) {
    return (
      <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <Receipt className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-200">No transactions found</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No expenses matched your filter criteria. Try adjusting the search query or date range.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden space-y-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              <th className="py-3.5 px-4 sm:px-6">Date</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Method</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={clsx('divide-y divide-slate-800/60 text-xs', isLoading && 'opacity-60')}>
            {expenses.map((exp) => {
              const methodBadge = formatPaymentMethod(exp.payment_method);
              const color = exp.category.color || '#6366f1';

              return (
                <tr
                  key={exp.id}
                  className="hover:bg-slate-900/50 transition-colors duration-150 group"
                >
                  {/* Date */}
                  <td className="py-3.5 px-4 sm:px-6 text-slate-300 font-mono whitespace-nowrap">
                    {exp.expense_date}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${color}18`,
                        color: color,
                        border: `1px solid ${color}35`,
                      }}
                    >
                      <CategoryIcon iconName={exp.category.icon} className="w-3.5 h-3.5" />
                      <span>{exp.category.name}</span>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 text-slate-200 font-medium max-w-xs truncate">
                    {exp.description || (
                      <span className="text-slate-500 italic">No memo</span>
                    )}
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={methodBadge.variant} size="sm">
                      {methodBadge.label}
                    </Badge>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-slate-100 whitespace-nowrap">
                    -${exp.amount}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Showing page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
          <span className="font-semibold text-slate-200">{totalPages}</span> ({count} total transactions)
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious || isLoading}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext || isLoading}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
