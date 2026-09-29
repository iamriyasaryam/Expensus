import React from 'react';
import { ExpenseFilters, PaymentMethod } from '../../types/expense';
import { useCategories } from '../categories/useCategories';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, X, Calendar } from 'lucide-react';

export interface ExpenseFilterBarProps {
  filters: ExpenseFilters;
  onFilterChange: (filters: Partial<ExpenseFilters>) => void;
  onReset: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'CASH', label: 'Cash' },
  { id: 'CREDIT_CARD', label: 'Credit Card' },
  { id: 'DEBIT_CARD', label: 'Debit Card' },
  { id: 'UPI', label: 'UPI / Instant' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { id: 'OTHER', label: 'Other' },
];

export const ExpenseFilterBar: React.FC<ExpenseFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const { data: categories = [] } = useCategories();

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.category ||
      filters.payment_method ||
      filters.start_date ||
      filters.end_date
  );

  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
        {/* Search Memos */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search memo or description..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Category Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Category</label>
          <select
            value={filters.category || ''}
            onChange={(e) =>
              onFilterChange({
                category: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              })
            }
            className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Payment Method</label>
          <select
            value={filters.payment_method || ''}
            onChange={(e) =>
              onFilterChange({
                payment_method: (e.target.value as PaymentMethod) || undefined,
                page: 1,
              })
            }
            className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          >
            <option value="">All Methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset / Actions */}
        <div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="md"
              onClick={onReset}
              leftIcon={<X className="w-4 h-4" />}
              className="w-full text-slate-400 hover:text-rose-400 hover:border-rose-500/30"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Date Range Row */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>From:</span>
          <input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => onFilterChange({ start_date: e.target.value || undefined, page: 1 })}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span>To:</span>
          <input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => onFilterChange({ end_date: e.target.value || undefined, page: 1 })}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
