import React, { useState } from 'react';
import { Category } from '../../types/category';
import { Button } from '../../components/ui/Button';
import { CategoryIcon } from './categoryIcons';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export interface DeleteCategoryDialogProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  isOpen,
  category,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [errorDetail, setErrorDetail] = useState<{ code?: string; message: string } | null>(null);

  if (!isOpen || !category) return null;

  const handleConfirm = async () => {
    setErrorDetail(null);
    try {
      await onConfirm(category.id);
      onClose();
    } catch (err: any) {
      if (err.response?.data?.code === 'category_protected') {
        setErrorDetail({
          code: 'category_protected',
          message:
            'This category cannot be deleted because active expenses are assigned to it. To delete this category, please delete or reassign its expenses first.',
        });
      } else {
        setErrorDetail({
          message: err.response?.data?.detail || 'Failed to delete category. Please try again.',
        });
      }
    }
  };

  const handleClose = () => {
    setErrorDetail(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-semibold text-slate-100">Delete Category</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorDetail ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Deletion Blocked (Database Protection)</span>
              </div>
              <p className="leading-relaxed">{errorDetail.message}</p>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                Are you sure you want to delete the category{' '}
                <span className="font-semibold text-white">"{category.name}"</span>?
              </p>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${category.color || '#6366f1'}20`,
                    color: category.color || '#6366f1',
                  }}
                >
                  <CategoryIcon iconName={category.icon} className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-200">{category.name}</span>
              </div>
              <p className="text-xs text-slate-400">
                This action is irreversible if the category has no attached expenses.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
              {errorDetail ? 'Close' : 'Cancel'}
            </Button>
            {!errorDetail && (
              <Button
                type="button"
                variant="danger"
                onClick={handleConfirm}
                isLoading={isLoading}
              >
                Delete Category
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
