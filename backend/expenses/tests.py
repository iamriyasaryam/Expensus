from django.test import TestCase
from django.db.utils import IntegrityError
from django.db.models import ProtectedError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date

from categories.models import Category
from expenses.models import Expense, PaymentMethod

User = get_user_model()


class ExpenseModelTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="riya@example.com",
            password="SecurePassword123!"
        )
        self.user2 = User.objects.create_user(
            email="other@example.com",
            password="SecurePassword123!"
        )
        self.category1 = Category.objects.create(
            user=self.user1,
            name="Groceries",
            color="#10B981"
        )
        self.category2 = Category.objects.create(
            user=self.user2,
            name="Electronics",
            color="#3B82F6"
        )

    def test_create_expense_successful(self):
        """Test creating an expense with valid parameters and Decimal precision."""
        expense = Expense.objects.create(
            user=self.user1,
            category=self.category1,
            amount=Decimal('45.50'),
            description="Supermarket groceries",
            expense_date=date(2026, 8, 28),
            payment_method=PaymentMethod.CREDIT_CARD
        )
        self.assertEqual(expense.amount, Decimal('45.50'))
        self.assertEqual(expense.payment_method, PaymentMethod.CREDIT_CARD)
        self.assertEqual(str(expense), "$45.50 on Groceries (2026-08-28)")

    def test_decimal_precision_exact_arithmetic(self):
        """Test that summing decimal amounts retains exact currency precision without float drift."""
        Expense.objects.create(
            user=self.user1,
            category=self.category1,
            amount=Decimal('0.10'),
            expense_date=date(2026, 8, 28)
        )
        Expense.objects.create(
            user=self.user1,
            category=self.category1,
            amount=Decimal('0.20'),
            expense_date=date(2026, 8, 28)
        )
        total = sum(self.user1.expenses.values_list('amount', flat=True))
        self.assertEqual(total, Decimal('0.30'))
        self.assertNotEqual(total, 0.30000000000000004)

    def test_delete_category_with_expenses_raises_protected_error(self):
        """Test that on_delete=PROTECT prevents deleting a category with associated active expenses."""
        Expense.objects.create(
            user=self.user1,
            category=self.category1,
            amount=Decimal('100.00'),
            expense_date=date(2026, 8, 28)
        )
        with self.assertRaises(ProtectedError):
            self.category1.delete()

    def test_delete_user_workflow(self):
        """Test that cleaning up expenses before user deletion cleanly deletes all user data."""
        user_id = self.user1.id
        Expense.objects.create(
            user=self.user1,
            category=self.category1,
            amount=Decimal('50.00'),
            expense_date=date(2026, 8, 28)
        )
        self.assertEqual(Expense.objects.count(), 1)
        # Because Category is PROTECTed by Expense, deleting user's expenses allows clean user deletion
        self.user1.expenses.all().delete()
        self.user1.delete()
        self.assertEqual(Expense.objects.filter(user_id=user_id).count(), 0)
        self.assertEqual(Category.objects.filter(user_id=user_id).count(), 0)

    def test_cross_user_category_validation(self):
        """Test that assigning another user's category to an expense raises ValidationError in full_clean."""
        expense = Expense(
            user=self.user1,
            category=self.category2,  # Belongs to user2!
            amount=Decimal('25.00'),
            expense_date=date(2026, 8, 28)
        )
        with self.assertRaises(ValidationError):
            expense.full_clean()

    def test_expense_ordering(self):
        """Test that expenses are ordered by expense_date descending."""
        e1 = Expense.objects.create(
            user=self.user1,
            category=self.category1,
            amount=Decimal('10.00'),
            expense_date=date(2026, 8, 1)
        )
        e2 = Expense.objects.create(
            user=self.user1,
            category=self.category1,
            amount=Decimal('20.00'),
            expense_date=date(2026, 8, 28)
        )
        expenses = list(self.user1.expenses.all())
        self.assertEqual(expenses[0], e2)
        self.assertEqual(expenses[1], e1)


class ExpenseAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email="riya@example.com",
            password="SecurePassword123!"
        )
        self.user2 = User.objects.create_user(
            email="other@example.com",
            password="SecurePassword123!"
        )
        self.cat1 = Category.objects.create(
            user=self.user1,
            name="Groceries",
            color="#10B981"
        )
        self.cat2 = Category.objects.create(
            user=self.user1,
            name="Utilities",
            color="#3B82F6"
        )
        self.other_cat = Category.objects.create(
            user=self.user2,
            name="Other Cat",
            color="#F59E0B"
        )

        self.exp1 = Expense.objects.create(
            user=self.user1,
            category=self.cat1,
            amount=Decimal('45.50'),
            description="Weekly grocery haul",
            expense_date=date(2026, 8, 15),
            payment_method=PaymentMethod.CREDIT_CARD
        )
        self.exp2 = Expense.objects.create(
            user=self.user1,
            category=self.cat2,
            amount=Decimal('120.00'),
            description="Electric bill payment",
            expense_date=date(2026, 8, 20),
            payment_method=PaymentMethod.BANK_TRANSFER
        )
        self.other_exp = Expense.objects.create(
            user=self.user2,
            category=self.other_cat,
            amount=Decimal('999.00'),
            description="Other user secret expense",
            expense_date=date(2026, 8, 25),
            payment_method=PaymentMethod.CASH
        )

        self.url = "/api/expenses/"

    def test_unauthenticated_request_returns_401(self):
        """Unauthenticated requests to /api/expenses/ return 401."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_expenses_multi_tenant_isolation(self):
        """User 1 receives only their own expenses with pagination metadata."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        results = response.data['results']
        self.assertEqual(len(results), 2)
        # Results should be ordered by -expense_date (exp2 then exp1)
        self.assertEqual(results[0]['id'], self.exp2.id)
        self.assertEqual(results[1]['id'], self.exp1.id)
        # Nested category object
        self.assertEqual(results[0]['category']['name'], "Utilities")

    def test_create_expense_successful(self):
        """Creating an expense creates the record and returns enriched JSON."""
        self.client.force_authenticate(user=self.user1)
        payload = {
            "category": self.cat1.id,
            "amount": "85.75",
            "description": "Farmers market shopping",
            "expense_date": "2026-08-28",
            "payment_method": "UPI"
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['amount'], "85.75")
        self.assertEqual(response.data['category']['name'], "Groceries")
        self.assertEqual(response.data['payment_method'], "UPI")

        expense = Expense.objects.get(id=response.data['id'])
        self.assertEqual(expense.user, self.user1)
        self.assertEqual(expense.amount, Decimal('85.75'))

    def test_create_expense_with_other_user_category_rejected(self):
        """Assigning another user's category ID returns 400 Bad Request."""
        self.client.force_authenticate(user=self.user1)
        payload = {
            "category": self.other_cat.id,  # User 2's category!
            "amount": "50.00",
            "expense_date": "2026-08-28"
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('category', response.data)

    def test_create_expense_negative_amount_rejected(self):
        """Creating an expense with zero or negative amount returns 400."""
        self.client.force_authenticate(user=self.user1)
        payload = {
            "category": self.cat1.id,
            "amount": "-10.00",
            "expense_date": "2026-08-28"
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', response.data)

    def test_retrieve_expense_detail(self):
        """Retrieving an owned expense returns 200 OK."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"{self.url}{self.exp1.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], "Weekly grocery haul")

    def test_update_expense_successful(self):
        """Updating an expense via PATCH modifies fields and returns updated data."""
        self.client.force_authenticate(user=self.user1)
        payload = {"amount": "52.00", "description": "Updated grocery haul"}
        response = self.client.patch(f"{self.url}{self.exp1.id}/", payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['amount'], "52.00")
        self.exp1.refresh_from_db()
        self.assertEqual(self.exp1.amount, Decimal('52.00'))

    def test_delete_expense_successful(self):
        """Deleting an expense returns 204 No Content."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(f"{self.url}{self.exp1.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Expense.objects.filter(id=self.exp1.id).exists())

    def test_filter_by_date_range(self):
        """Filtering by start_date and end_date returns only matching items."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"{self.url}?start_date=2026-08-18&end_date=2026-08-22")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.exp2.id)

    def test_filter_by_category(self):
        """Filtering by category ID returns only expenses in that category."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"{self.url}?category={self.cat1.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.exp1.id)

    def test_filter_by_payment_method(self):
        """Filtering by payment_method returns only matching payment types."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"{self.url}?payment_method=BANK_TRANSFER")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.exp2.id)

    def test_filter_by_month(self):
        """Filtering by ?month=YYYY-MM returns matching expenses."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"{self.url}?month=2026-08")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_search_by_description(self):
        """Searching on description returns matching items."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"{self.url}?search=electric")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.exp2.id)

    def test_ordering_by_amount(self):
        """Ordering by ?ordering=amount (ascending) returns smallest amount first."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"{self.url}?ordering=amount")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(results[0]['id'], self.exp1.id)  # 45.50 < 120.00
        self.assertEqual(results[1]['id'], self.exp2.id)

    def test_user_cannot_access_or_modify_other_user_expense(self):
        """User 1 attempting to GET, PATCH, or DELETE User 2's expense receives 404."""
        self.client.force_authenticate(user=self.user1)

        get_res = self.client.get(f"{self.url}{self.other_exp.id}/")
        self.assertEqual(get_res.status_code, status.HTTP_404_NOT_FOUND)

        patch_res = self.client.patch(f"{self.url}{self.other_exp.id}/", {"amount": "1.00"}, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_404_NOT_FOUND)

        delete_res = self.client.delete(f"{self.url}{self.other_exp.id}/")
        self.assertEqual(delete_res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Expense.objects.filter(id=self.other_exp.id).exists())
