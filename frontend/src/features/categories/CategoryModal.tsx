import React, { useState, useEffect } from 'react';
import { Category, CategoryInput } from '../../types/category';
import { CATEGORY_ICONS, CATEGORY_COLORS, CategoryIcon } from './categoryIcons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryInput) => Promise<void>;
  initialData?: Category | null;
  isLoading?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('shopping-cart');
  const [color, setColor] = useState('#10B981');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIcon(initialData.icon || 'shopping-cart');
      setColor(initialData.color || '#10B981');
    } else {
      setName('');
      setIcon('shopping-cart');
      setColor('#10B981');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        icon,
        color,
      });
      onClose();
    } catch (err: any) {
      if (err.response?.data?.name) {
        setError(
          Array.isArray(err.response.data.name)
            ? err.response.data.name[0]
            : err.response.data.name
        );
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to save category. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              {initialData ? 'Edit Category' : 'Create New Category'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Live Preview Badge */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Category Preview:</span>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all"
              style={{
                backgroundColor: `${color}18`,
                color: color,
                border: `1px solid ${color}40`,
              }}
            >
              <CategoryIcon iconName={icon} className="w-3.5 h-3.5" />
              <span>{name || 'Category Name'}</span>
            </div>
          </div>

          {/* Category Name */}
          <Input
            label="Category Name"
            placeholder="e.g. Groceries, Subscriptions, Fitness"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          {/* Color Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">Theme Color</label>
            <div className="flex flex-wrap items-center gap-2.5">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className={clsx(
                    'w-7 h-7 rounded-full transition-all duration-150 flex items-center justify-center',
                    color === c.hex
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">Category Icon</label>
            <div className="grid grid-cols-6 gap-2 max-h-44 overflow-y-auto p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
              {CATEGORY_ICONS.map((item) => {
                const isSelected = icon === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    title={item.name}
                    className={clsx(
                      'p-2.5 rounded-xl flex flex-col items-center justify-center transition-all duration-150',
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {initialData ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
