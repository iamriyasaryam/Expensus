from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from categories.models import Category
from expenses.models import Expense, PaymentMethod

User = get_user_model()


class DashboardAnalyticsTests(APITestCase):
    """
    Comprehensive test suite for GET /api/analytics/dashboard/
    """
    def setUp(self):
        self.dashboard_url = reverse('analytics:dashboard')
        self.user1 = User.objects.create_user(
            email='alice@example.com',
            password='Password123!',
            first_name='Alice'
        )
        self.user2 = User.objects.create_user(
            email='bob@example.com',
            password='Password123!',
            first_name='Bob'
        )
        self.token1 = str(RefreshToken.for_user(self.user1).access_token)
        self.token2 = str(RefreshToken.for_user(self.user2).access_token)

    def test_dashboard_unauthenticated(self):
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dashboard_empty_state(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertIn('summary', data)
        self.assertEqual(Decimal(data['summary']['total_spending_all_time']), Decimal('0.00'))
        self.assertEqual(Decimal(data['summary']['total_spending_month']), Decimal('0.00'))
        self.assertEqual(Decimal(data['summary']['total_spending_today']), Decimal('0.00'))
        self.assertEqual(data['summary']['expense_count_month'], 0)
        self.assertEqual(len(data['category_breakdown']), 0)
        self.assertEqual(len(data['monthly_trend']), 6)
        for item in data['monthly_trend']:
            self.assertEqual(Decimal(item['total']), Decimal('0.00'))
        self.assertEqual(len(data['recent_expenses']), 0)

    def test_dashboard_calculations_and_breakdown(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        today = timezone.now().date()

        # Create categories for user 1
        food = Category.objects.create(user=self.user1, name='Food', icon='utensils', color='#EF4444')
        rent = Category.objects.create(user=self.user1, name='Rent', icon='home', color='#3B82F6')

        # Current month expenses
        # Today expense
        Expense.objects.create(
            user=self.user1,
            category=food,
            amount=Decimal('40.00'),
            description='Lunch today',
            expense_date=today,
            payment_method=PaymentMethod.CASH
        )
        # Another expense this month (day 1 of this month)
        start_of_month = date(today.year, today.month, 1)
        Expense.objects.create(
            user=self.user1,
            category=food,
            amount=Decimal('60.00'),
            description='Groceries beginning of month',
            expense_date=start_of_month,
            payment_method=PaymentMethod.CREDIT_CARD
        )
        # Rent expense this month
        Expense.objects.create(
            user=self.user1,
            category=rent,
            amount=Decimal('100.00'),
            description='Monthly apartment rent',
            expense_date=start_of_month,
            payment_method=PaymentMethod.BANK_TRANSFER
        )

        # Expense from 4 months ago (should appear in all-time and 6-month trend, but not in current month summary)
        past_month_val = today.month - 4
        past_year_val = today.year
        if past_month_val <= 0:
            past_month_val += 12
            past_year_val -= 1
        past_date = date(past_year_val, past_month_val, 15)

        Expense.objects.create(
            user=self.user1,
            category=food,
            amount=Decimal('300.00'),
            description='Historical food spend',
            expense_date=past_date,
            payment_method=PaymentMethod.UPI
        )

        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        # Summary check
        # All time: 40 + 60 + 100 + 300 = 500.00
        self.assertEqual(Decimal(data['summary']['total_spending_all_time']), Decimal('500.00'))
        # Month: 40 + 60 + 100 = 200.00
        self.assertEqual(Decimal(data['summary']['total_spending_month']), Decimal('200.00'))
        # Today: 40.00
        self.assertEqual(Decimal(data['summary']['total_spending_today']), Decimal('40.00'))
        # Count this month: 3
        self.assertEqual(data['summary']['expense_count_month'], 3)

        # Category Breakdown check (for current month: Total = 200)
        # Food = 100.00 (50.0%), Rent = 100.00 (50.0%)
        breakdown = data['category_breakdown']
        self.assertEqual(len(breakdown), 2)
        food_entry = next(b for b in breakdown if b['category_id'] == food.id)
        rent_entry = next(b for b in breakdown if b['category_id'] == rent.id)
        self.assertEqual(Decimal(food_entry['total_amount']), Decimal('100.00'))
        self.assertAlmostEqual(food_entry['percentage'], 50.0)
        self.assertEqual(Decimal(rent_entry['total_amount']), Decimal('100.00'))
        self.assertAlmostEqual(rent_entry['percentage'], 50.0)

        # 6-Month Trend check
        trend = data['monthly_trend']
        self.assertEqual(len(trend), 6)
        current_month_key = f"{today.year:04d}-{today.month:02d}"
        past_month_key = f"{past_year_val:04d}-{past_month_val:02d}"

        curr_trend = next(t for t in trend if t['month'] == current_month_key)
        self.assertEqual(Decimal(curr_trend['total']), Decimal('200.00'))

        past_trend = next(t for t in trend if t['month'] == past_month_key)
        self.assertEqual(Decimal(past_trend['total']), Decimal('300.00'))

        # Recent expenses check (max 5)
        self.assertEqual(len(data['recent_expenses']), 4)
        self.assertEqual(data['recent_expenses'][0]['description'], 'Lunch today')

    def test_dashboard_multi_tenant_isolation(self):
        # Create data for User 1
        cat1 = Category.objects.create(user=self.user1, name='User1 Cat')
        Expense.objects.create(
            user=self.user1,
            category=cat1,
            amount=Decimal('75.00'),
            expense_date=timezone.now().date()
        )

        # Create data for User 2
        cat2 = Category.objects.create(user=self.user2, name='User2 Cat')
        Expense.objects.create(
            user=self.user2,
            category=cat2,
            amount=Decimal('999.00'),
            expense_date=timezone.now().date()
        )

        # User 1 fetches dashboard
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        res1 = self.client.get(self.dashboard_url)
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(res1.data['summary']['total_spending_all_time']), Decimal('75.00'))
        self.assertEqual(len(res1.data['category_breakdown']), 1)
        self.assertEqual(res1.data['category_breakdown'][0]['category_name'], 'User1 Cat')

        # User 2 fetches dashboard
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        res2 = self.client.get(self.dashboard_url)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(res2.data['summary']['total_spending_all_time']), Decimal('999.00'))
        self.assertEqual(len(res2.data['category_breakdown']), 1)
        self.assertEqual(res2.data['category_breakdown'][0]['category_name'], 'User2 Cat')

    def test_dashboard_custom_month_query(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        cat = Category.objects.create(user=self.user1, name='Travel')

        # Create expense in specific month: 2026-03
        Expense.objects.create(
            user=self.user1,
            category=cat,
            amount=Decimal('450.00'),
            expense_date=date(2026, 3, 15)
        )

        # Query specifically for 2026-03
        response = self.client.get(f"{self.dashboard_url}?month=2026-03")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['selected_month'], '2026-03')
        self.assertEqual(Decimal(response.data['summary']['total_spending_month']), Decimal('450.00'))
        self.assertEqual(response.data['summary']['expense_count_month'], 1)

    def test_dashboard_invalid_month_fallback(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        # Passing invalid format should not crash but fall back to current month
        response = self.client.get(f"{self.dashboard_url}?month=invalid-date")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        today = timezone.now().date()
        expected_key = f"{today.year:04d}-{today.month:02d}"
        self.assertEqual(response.data['selected_month'], expected_key)
