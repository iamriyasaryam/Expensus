from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal


class PaymentMethod(models.TextChoices):
    """
    Standardized payment method options for expenses.
    """
    CASH = 'CASH', 'Cash'
    CREDIT_CARD = 'CREDIT_CARD', 'Credit Card'
    DEBIT_CARD = 'DEBIT_CARD', 'Debit Card'
    UPI = 'UPI', 'UPI / Instant Payment'
    BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
    OTHER = 'OTHER', 'Other'


class Expense(models.Model):
    """
    Financial expense transaction recorded by a user.
    Monetary value is stored as fixed Decimal/Numeric(10,2) to eliminate float rounding errors.
    Deletion of a Category is blocked (PROTECT) if active expenses reference it.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expenses',
        db_index=True
    )
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.PROTECT,
        related_name='expenses',
        db_index=True,
        help_text="Category classifying this expense. Deletion protected if expenses exist."
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Monetary amount in standard currency unit (must be > 0.00)"
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        help_text="Optional memo or note for this expense"
    )
    expense_date = models.DateField(
        default=timezone.now,
        db_index=True,
        help_text="The date on which the expense occurred"
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH,
        help_text="Method used for payment"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'
        ordering = ['-expense_date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'expense_date'], name='exp_user_date_idx'),
            models.Index(fields=['expense_date'], name='exp_date_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(amount__gt=0),
                name='positive_expense_amount'
            )
        ]

    def __str__(self):
        return f"${self.amount} on {self.category.name} ({self.expense_date})"

    def clean(self):
        super().clean()
        if self.description:
            self.description = self.description.strip()
        # Verify that category belongs to the same user
        if self.category_id and self.user_id and self.category.user_id != self.user_id:
            from django.core.exceptions import ValidationError
            raise ValidationError({'category': "The selected category does not belong to this user."})
