from django.test import TestCase
from django.db.utils import IntegrityError
from django.contrib.auth import get_user_model
from categories.models import Category

User = get_user_model()


class CategoryModelTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="user1@example.com",
            password="Password123!"
        )
        self.user2 = User.objects.create_user(
            email="user2@example.com",
            password="Password123!"
        )

    def test_create_category_successful(self):
        """Test creating a category with valid parameters."""
        cat = Category.objects.create(
            user=self.user1,
            name="Groceries",
            icon="shopping-cart",
            color="#10B981"
        )
        self.assertEqual(cat.name, "Groceries")
        self.assertEqual(cat.user, self.user1)
        self.assertEqual(str(cat), f"Groceries ({self.user1.email})")

    def test_duplicate_category_name_same_user_raises_error(self):
        """Test that a user cannot create two categories with the exact same name."""
        Category.objects.create(user=self.user1, name="Groceries")
        with self.assertRaises(IntegrityError):
            Category.objects.create(user=self.user1, name="Groceries")

    def test_same_category_name_different_users_allowed(self):
        """Test that two different users can both have a category named 'Groceries'."""
        cat1 = Category.objects.create(user=self.user1, name="Groceries")
        cat2 = Category.objects.create(user=self.user2, name="Groceries")
        self.assertEqual(cat1.name, "Groceries")
        self.assertEqual(cat2.name, "Groceries")
        self.assertNotEqual(cat1.user, cat2.user)

    def test_category_ordering_alphabetical(self):
        """Test that categories are ordered alphabetically by name by default."""
        Category.objects.create(user=self.user1, name="Utilities")
        Category.objects.create(user=self.user1, name="Bills")
        Category.objects.create(user=self.user1, name="Groceries")

        names = list(self.user1.categories.values_list('name', flat=True))
        self.assertEqual(names, ["Bills", "Groceries", "Utilities"])
