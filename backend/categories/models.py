from django.db import models
from django.conf import settings


class Category(models.Model):
    """
    Expense category belonging to a specific user.
    Enforces uniqueness per user (e.g. User A can only have one 'Food' category,
    but User B can also have their own 'Food' category).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categories',
        db_index=True
    )
    name = models.CharField(
        max_length=100,
        help_text="Name of the category (e.g. 'Groceries', 'Rent', 'Utilities')"
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Lucide icon identifier (e.g. 'shopping-cart', 'utensils', 'car')"
    )
    color = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Hex color code for UI badges and charts (e.g. '#10B981')"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'name'],
                name='unique_user_category_name'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.user.email})"

    def clean(self):
        super().clean()
        if self.name:
            self.name = self.name.strip()
