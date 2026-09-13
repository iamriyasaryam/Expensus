import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Tag } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Categories</h1>
          <p className="text-sm text-slate-400">Manage custom spending categories, icons, and colors</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-400" />
            <span>Category Manager (Phase 10 Target)</span>
          </CardTitle>
          <CardDescription>
            Custom category cards, creation modals, and cascade deletion guards will be assembled in Phase 10.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-200">Category Domain Ready</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Backend REST APIs at <code className="text-indigo-400 bg-slate-900 px-1.5 py-0.5 rounded">/api/categories/</code> are verified with 21 passing test suites.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
