import React, { useState, useMemo } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../features/categories/useCategories';
import { Category, CategoryInput } from '../types/category';
import { CategoryCard } from '../features/categories/CategoryCard';
import { CategoryModal } from '../features/categories/CategoryModal';
import { DeleteCategoryDialog } from '../features/categories/DeleteCategoryDialog';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast, ToastType } from '../components/ui/Toast';
import { Plus, Search, Tag, Sparkles } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { data: categories = [], isLoading, isError } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    category?: Category | null;
  }>({ isOpen: false, category: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });

  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [categories, search]);

  const handleOpenCreate = () => {
    setModalState({ isOpen: true, category: null });
  };

  const handleOpenEdit = (category: Category) => {
    setModalState({ isOpen: true, category });
  };

  const handleOpenDelete = (category: Category) => {
    setDeleteDialog({ isOpen: true, category });
  };

  const handleModalSubmit = async (data: CategoryInput) => {
    if (modalState.category) {
      // Update
      await updateMutation.mutateAsync({
        id: modalState.category.id,
        data,
      });
      setToast({ type: 'success', message: `Category "${data.name}" updated successfully!` });
    } else {
      // Create
      await createMutation.mutateAsync(data);
      setToast({ type: 'success', message: `Category "${data.name}" created successfully!` });
    }
  };

  const handleDeleteConfirm = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setToast({ type: 'success', message: 'Category deleted successfully.' });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your expense categories..." />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-rose-400 space-y-2">
        <p>Failed to load categories from server.</p>
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Categories</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              {categories.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Organize transactions and customize spending classifications with icons & colors
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 max-w-md">
        <Input
          placeholder="Search categories by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800/80 space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-200">
              {search ? 'No matching categories found' : 'No categories yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search
                ? 'Try searching for a different keyword or reset the search query.'
                : 'Create your first expense category to start categorizing your spending.'}
            </p>
          </div>
          {!search && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Create First Category
            </Button>
          )}
        </div>
      )}

      {/* Category Create / Edit Modal */}
      <CategoryModal
        isOpen={modalState.isOpen}
        initialData={modalState.category}
        onClose={() => setModalState({ isOpen: false, category: null })}
        onSubmit={handleModalSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Category Deletion Dialog */}
      <DeleteCategoryDialog
        isOpen={deleteDialog.isOpen}
        category={deleteDialog.category}
        onClose={() => setDeleteDialog({ isOpen: false, category: null })}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
