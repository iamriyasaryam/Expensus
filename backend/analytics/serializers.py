from rest_framework import serializers


class SummarySerializer(serializers.Serializer):
    total_spending_all_time = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_spending_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_spending_today = serializers.DecimalField(max_digits=12, decimal_places=2)
    expense_count_month = serializers.IntegerField()


class CategoryBreakdownItemSerializer(serializers.Serializer):
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    icon = serializers.CharField(allow_blank=True)
    color = serializers.CharField(allow_blank=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    percentage = serializers.FloatField()


class MonthlyTrendItemSerializer(serializers.Serializer):
    month = serializers.CharField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)


class DashboardCategoryNestedSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    icon = serializers.CharField(allow_blank=True)
    color = serializers.CharField(allow_blank=True)


class DashboardRecentExpenseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    category = DashboardCategoryNestedSerializer()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    description = serializers.CharField(allow_blank=True)
    expense_date = serializers.DateField()
    payment_method = serializers.CharField()


class DashboardResponseSerializer(serializers.Serializer):
    selected_month = serializers.CharField()
    summary = SummarySerializer()
    category_breakdown = serializers.ListSerializer(child=CategoryBreakdownItemSerializer())
    monthly_trend = serializers.ListSerializer(child=MonthlyTrendItemSerializer())
    recent_expenses = serializers.ListSerializer(child=DashboardRecentExpenseSerializer())
