import django_filters
from .models import Expense, PaymentMethod


class ExpenseFilter(django_filters.FilterSet):
    """
    FilterSet for Expense queries.
    Allows filtering by date range, category, payment method, amount bounds, and specific month.
    """
    start_date = django_filters.DateFilter(
        field_name='expense_date',
        lookup_expr='gte',
        help_text="Filter expenses on or after date (YYYY-MM-DD)"
    )
    end_date = django_filters.DateFilter(
        field_name='expense_date',
        lookup_expr='lte',
        help_text="Filter expenses on or before date (YYYY-MM-DD)"
    )
    category = django_filters.NumberFilter(
        field_name='category_id',
        help_text="Filter by Category ID"
    )
    payment_method = django_filters.ChoiceFilter(
        choices=PaymentMethod.choices,
        help_text="Filter by payment method choice"
    )
    min_amount = django_filters.NumberFilter(
        field_name='amount',
        lookup_expr='gte',
        help_text="Minimum expense amount"
    )
    max_amount = django_filters.NumberFilter(
        field_name='amount',
        lookup_expr='lte',
        help_text="Maximum expense amount"
    )
    month = django_filters.CharFilter(
        method='filter_by_month',
        help_text="Filter by month in format YYYY-MM (e.g. 2026-08)"
    )

    class Meta:
        model = Expense
        fields = ['category', 'payment_method', 'expense_date']

    def filter_by_month(self, queryset, name, value):
        """
        Filter expenses for a given 'YYYY-MM' month string.
        """
        if not value:
            return queryset
        parts = value.split('-')
        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
            year = int(parts[0])
            month = int(parts[1])
            return queryset.filter(expense_date__year=year, expense_date__month=month)
        return queryset
