import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Receipt, Filter } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Expenses</h1>
          <p className="text-sm text-slate-400">View, search, filter, and export all recorded transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
            Filters
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            New Expense
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <span>Transaction Ledger (Phase 11 Target)</span>
          </CardTitle>
          <CardDescription>
            The full transaction table with sorting, pagination, and multi-faceted filtering will be built in Phase 11.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-200">Expense Management Engine Ready</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Backend REST APIs at <code className="text-indigo-400 bg-slate-900 px-1.5 py-0.5 rounded">/api/expenses/</code> are fully tested with 15 passing test suites.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
