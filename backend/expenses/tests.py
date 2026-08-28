from django.test import TestCase
from django.db.utils import IntegrityError
from django.db.models import ProtectedError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from categories.models import Category
from expenses.models import Expense, PaymentMethod
from decimal import Decimal
from datetime import date

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
        self.assertEqual(str(expense), f"$45.50 on Groceries (2026-08-28)")

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
