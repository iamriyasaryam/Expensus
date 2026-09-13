import calendar
from datetime import date
from decimal import Decimal
from django.db.models import Sum, Count, DecimalField
from django.db.models.functions import Coalesce, TruncMonth
from django.utils import timezone

from expenses.models import Expense


def parse_selected_month(month_str=None):
    """
    Parses a 'YYYY-MM' string into (year, month, month_start, month_end).
    Falls back to current date/month if omitted or invalid.
    """
    today = timezone.now().date()
    if month_str:
        try:
            parts = month_str.strip().split('-')
            if len(parts) == 2:
                year = int(parts[0])
                month = int(parts[1])
                if 1 <= month <= 12 and 1900 <= year <= 2200:
                    last_day = calendar.monthrange(year, month)[1]
                    return year, month, date(year, month, 1), date(year, month, last_day), f"{year:04d}-{month:02d}"
        except (ValueError, TypeError):
            pass

    # Fallback to current month
    year = today.year
    month = today.month
    last_day = calendar.monthrange(year, month)[1]
    return year, month, date(year, month, 1), date(year, month, last_day), f"{year:04d}-{month:02d}"


def get_trailing_six_months(year, month):
    """
    Returns a list of 6 month strings ['YYYY-MM', ...] up to and including (year, month),
    along with the start date of the first month in the range.
    """
    months = []
    curr_y, curr_m = year, month
    for _ in range(6):
        months.append(f"{curr_y:04d}-{curr_m:02d}")
        curr_m -= 1
        if curr_m == 0:
            curr_m = 12
            curr_y -= 1

    months.reverse()  # Chronological order
    first_y, first_m = int(months[0].split('-')[0]), int(months[0].split('-')[1])
    range_start = date(first_y, first_m, 1)
    return months, range_start


class AnalyticsService:
    """
    Encapsulates all financial dashboard aggregation and statistical metrics.
    """
    @staticmethod
    def get_dashboard_data(user, month_str=None):
        today = timezone.now().date()
        year, month, month_start, month_end, selected_month_key = parse_selected_month(month_str)

        # 1. Summary Metrics
        all_time_agg = Expense.objects.filter(user=user).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField())
        )
        total_spending_all_time = all_time_agg['total']

        month_agg = Expense.objects.filter(
            user=user,
            expense_date__range=(month_start, month_end)
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField()),
            count=Count('id')
        )
        total_spending_month = month_agg['total']
        expense_count_month = month_agg['count']

        today_agg = Expense.objects.filter(
            user=user,
            expense_date=today
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField())
        )
        total_spending_today = today_agg['total']

        # 2. Category Breakdown for Selected Month
        category_qs = Expense.objects.filter(
            user=user,
            expense_date__range=(month_start, month_end)
        ).values(
            'category__id',
            'category__name',
            'category__icon',
            'category__color'
        ).annotate(
            total_amount=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField())
        ).order_by('-total_amount')

        category_breakdown = []
        for item in category_qs:
            cat_total = item['total_amount']
            if total_spending_month > Decimal('0.00'):
                percentage = round((cat_total / total_spending_month) * Decimal('100.00'), 2)
            else:
                percentage = Decimal('0.00')

            category_breakdown.append({
                'category_id': item['category__id'],
                'category_name': item['category__name'],
                'icon': item['category__icon'] or '',
                'color': item['category__color'] or '#6B7280',
                'total_amount': str(cat_total),
                'percentage': float(percentage),
            })

        # 3. Monthly Trend (Trailing 6 Months)
        six_months_list, trend_start = get_trailing_six_months(year, month)
        trend_qs = Expense.objects.filter(
            user=user,
            expense_date__range=(trend_start, month_end)
        ).annotate(
            month_bucket=TruncMonth('expense_date')
        ).values('month_bucket').annotate(
            total=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField())
        ).order_by('month_bucket')

        month_map = {}
        for entry in trend_qs:
            bucket = entry['month_bucket']
            if bucket:
                # In SQLite TruncMonth may return string 'YYYY-MM-DD' or date object
                key = bucket.strftime('%Y-%m') if hasattr(bucket, 'strftime') else str(bucket)[:7]
                month_map[key] = entry['total']

        monthly_trend = [
            {
                'month': m_str,
                'total': str(month_map.get(m_str, Decimal('0.00')))
            }
            for m_str in six_months_list
        ]

        # 4. Recent Expenses (Latest 5 Transactions)
        recent_expenses_qs = Expense.objects.filter(
            user=user
        ).select_related('category').order_by('-expense_date', '-created_at')[:5]

        recent_expenses = [
            {
                'id': exp.id,
                'category': {
                    'id': exp.category.id,
                    'name': exp.category.name,
                    'icon': exp.category.icon or '',
                    'color': exp.category.color or '#6B7280',
                },
                'amount': str(exp.amount),
                'description': exp.description,
                'expense_date': exp.expense_date.isoformat(),
                'payment_method': exp.payment_method,
            }
            for exp in recent_expenses_qs
        ]

        return {
            'selected_month': selected_month_key,
            'summary': {
                'total_spending_all_time': str(total_spending_all_time),
                'total_spending_month': str(total_spending_month),
                'total_spending_today': str(total_spending_today),
                'expense_count_month': expense_count_month,
            },
            'category_breakdown': category_breakdown,
            'monthly_trend': monthly_trend,
            'recent_expenses': recent_expenses,
        }
