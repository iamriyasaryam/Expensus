from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'category', 'amount', 'expense_date', 'payment_method', 'created_at')
    list_filter = ('payment_method', 'expense_date', 'created_at', 'category')
    search_fields = ('description', 'user__email', 'category__name')
    date_hierarchy = 'expense_date'
    ordering = ('-expense_date', '-created_at')
