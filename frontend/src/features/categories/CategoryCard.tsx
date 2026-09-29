import React from 'react';
import { Category } from '../../types/category';
import { CategoryIcon } from './categoryIcons';
import { Card } from '../../components/ui/Card';
import { Edit2, Trash2, Calendar } from 'lucide-react';

export interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  const color = category.color || '#6366F1';

  return (
    <Card className="p-5 flex flex-col justify-between hover:border-slate-700/90 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-4">
        {/* Category Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: `${color}18`,
              color: color,
              border: `1px solid ${color}35`,
            }}
          >
            <CategoryIcon iconName={category.icon} className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
              {category.name}
            </h4>
            {category.created_at && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Added {new Date(category.created_at).toLocaleDateString()}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors"
            title="Edit Category"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};
