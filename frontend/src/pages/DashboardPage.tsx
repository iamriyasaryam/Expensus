import React, { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { api } from '../services/api';
import { DashboardData } from '../types/analytics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Receipt,
  ArrowUpRight,
  Plus,
  PieChart,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<DashboardData>('/api/analytics/dashboard/');
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Calculating real-time financial metrics..." />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 glass-panel-glow border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Phase 8 Foundation Active</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Hello, <span className="gradient-text">{user?.first_name || 'Finance Leader'}</span> 👋
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Here is your financial overview for <span className="text-slate-200 font-semibold">{data?.selected_month || 'this month'}</span>. All numbers are backed by PostgreSQL Decimal precision.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/expenses">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Record Expense
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* All-time spending */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Spent (All-Time)</CardDescription>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white tracking-tight">
              ${data?.summary.total_spending_all_time || '0.00'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Lifetime cumulative sum</span>
            </p>
          </CardContent>
        </Card>

        {/* Monthly spending */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>This Month Spending</CardDescription>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white tracking-tight">
              ${data?.summary.total_spending_month || '0.00'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              For period {data?.selected_month}
            </p>
          </CardContent>
        </Card>

        {/* Today spending */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Today's Outflow</CardDescription>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white tracking-tight">
              ${data?.summary.total_spending_today || '0.00'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Recorded today
            </p>
          </CardContent>
        </Card>

        {/* Monthly count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Transactions (Month)</CardDescription>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white tracking-tight">
              {data?.summary.expense_count_month || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Total items tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Category Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                <span>Monthly Category Distribution</span>
              </CardTitle>
              <CardDescription>Proportional spending per category</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.category_breakdown && data.category_breakdown.length > 0 ? (
                <div className="space-y-4">
                  {data.category_breakdown.map((item) => (
                    <div key={item.category_id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color || '#6366f1' }}
                          />
                          {item.category_name}
                        </span>
                        <span className="text-slate-400 font-mono">
                          ${item.total_amount}{' '}
                          <span className="text-slate-500">({item.percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color || '#6366f1',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <Tag className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>No transactions recorded for this month.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions (1 Col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-400" />
                <span>Recent Expenses</span>
              </CardTitle>
              <CardDescription>Latest 5 recorded transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.recent_expenses && data.recent_expenses.length > 0 ? (
                <div className="divide-y divide-slate-800/80">
                  {data.recent_expenses.map((exp) => (
                    <div key={exp.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-200">
                          {exp.description || exp.category.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge size="sm" variant="default">
                            {exp.category.name}
                          </Badge>
                          <span className="text-[10px] text-slate-400">{exp.expense_date}</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-100 font-mono">
                        -${exp.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No recent expenses recorded.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
