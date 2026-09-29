import React, { useState } from 'react';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '../features/expenses/useExpenses';
import { Expense, ExpenseInput, ExpenseFilters } from '../types/expense';
import { ExpenseFilterBar } from '../features/expenses/ExpenseFilterBar';
import { ExpenseTable } from '../features/expenses/ExpenseTable';
import { ExpenseModal } from '../features/expenses/ExpenseModal';
import { DeleteExpenseDialog } from '../features/expenses/DeleteExpenseDialog';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast, ToastType } from '../components/ui/Toast';
import { Plus } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    page_size: 10,
    search: '',
    category: undefined,
    payment_method: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  const { data, isLoading, isError, isFetching } = useExpenses(filters);
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    expense?: Expense | null;
  }>({ isOpen: false, expense: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    expense: Expense | null;
  }>({ isOpen: false, expense: null });

  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const handleFilterChange = (newFilters: Partial<ExpenseFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      page_size: 10,
      search: '',
      category: undefined,
      payment_method: undefined,
      start_date: undefined,
      end_date: undefined,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleOpenCreate = () => {
    setModalState({ isOpen: true, expense: null });
  };

  const handleOpenEdit = (expense: Expense) => {
    setModalState({ isOpen: true, expense });
  };

  const handleOpenDelete = (expense: Expense) => {
    setDeleteDialog({ isOpen: true, expense });
  };

  const handleModalSubmit = async (inputData: ExpenseInput) => {
    if (modalState.expense) {
      await updateMutation.mutateAsync({
        id: modalState.expense.id,
        data: inputData,
      });
      setToast({ type: 'success', message: 'Expense updated successfully!' });
    } else {
      await createMutation.mutateAsync(inputData);
      setToast({ type: 'success', message: 'Expense recorded successfully!' });
    }
  };

  const handleDeleteConfirm = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setToast({ type: 'success', message: 'Expense deleted successfully.' });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your transaction ledger..." />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-rose-400 space-y-2">
        <p>Failed to load expenses from server.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Toast Alert Notification */}
      {toast && (
        <div className="fixed top-20 right-8 z-50 max-w-sm">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Expenses</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              {data?.count || 0} Total Records
            </span>
          </div>
          <p className="text-sm text-slate-400">
            View, filter, search, and manage all your transactional cash outflows
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Record Expense
        </Button>
      </div>

      {/* Filter Bar */}
      <ExpenseFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Expense Table Ledger */}
      <ExpenseTable
        expenses={data?.results || []}
        count={data?.count || 0}
        currentPage={filters.page || 1}
        pageSize={filters.page_size || 10}
        hasNext={Boolean(data?.next)}
        hasPrevious={Boolean(data?.previous)}
        onPageChange={handlePageChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isFetching}
      />

      {/* Create / Edit Expense Modal */}
      <ExpenseModal
        isOpen={modalState.isOpen}
        initialData={modalState.expense}
        onClose={() => setModalState({ isOpen: false, expense: null })}
        onSubmit={handleModalSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Expense Dialog */}
      <DeleteExpenseDialog
        isOpen={deleteDialog.isOpen}
        expense={deleteDialog.expense}
        onClose={() => setDeleteDialog({ isOpen: false, expense: null })}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
