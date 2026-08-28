from django.test import TestCase
from django.db.utils import IntegrityError
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date

from categories.models import Category
from expenses.models import Expense

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


class CategoryAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email="riya@example.com",
            password="Password123!"
        )
        self.user2 = User.objects.create_user(
            email="other@example.com",
            password="Password123!"
        )
        self.cat1 = Category.objects.create(
            user=self.user1,
            name="Groceries",
            icon="shopping-cart",
            color="#10B981"
        )
        self.cat2 = Category.objects.create(
            user=self.user2,
            name="Books",
            icon="book",
            color="#3B82F6"
        )
        self.url = "/api/categories/"

    def test_unauthenticated_request_returns_401(self):
        """Unauthenticated requests to /api/categories/ must be rejected with 401."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_categories_multi_tenant_isolation(self):
        """Authenticated user receives only their own categories, never another user's."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check paginated / list results
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.cat1.id)
        self.assertEqual(results[0]['name'], "Groceries")

    def test_create_category_successful(self):
        """Creating a category via POST automatically associates the authenticated user."""
        self.client.force_authenticate(user=self.user1)
        payload = {
            "name": "Entertainment",
            "icon": "film",
            "color": "#8B5CF6"
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], "Entertainment")
        self.assertEqual(response.data['icon'], "film")
        
        # Verify in database
        cat = Category.objects.get(id=response.data['id'])
        self.assertEqual(cat.user, self.user1)

    def test_create_category_blank_name_fails(self):
        """Creating a category with a blank name returns 400 Bad Request."""
        self.client.force_authenticate(user=self.user1)
        payload = {"name": "   "}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)

    def test_create_duplicate_category_same_user_fails(self):
        """Creating duplicate category name for the same user returns 400."""
        self.client.force_authenticate(user=self.user1)
        payload = {"name": "groceries"}  # case-insensitive check
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)

    def test_create_same_category_name_different_user_succeeds(self):
        """User 2 creating 'Groceries' succeeds even if User 1 already has 'Groceries'."""
        self.client.force_authenticate(user=self.user2)
        payload = {"name": "Groceries"}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_category_detail(self):
        """Retrieving an owned category by ID returns 200 OK."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"{self.url}{self.cat1.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Groceries")

    def test_update_category_successful(self):
        """Updating an existing category via PATCH returns 200 OK with updated data."""
        self.client.force_authenticate(user=self.user1)
        payload = {"name": "Food & Groceries", "color": "#059669"}
        response = self.client.patch(f"{self.url}{self.cat1.id}/", payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Food & Groceries")
        self.cat1.refresh_from_db()
        self.assertEqual(self.cat1.name, "Food & Groceries")

    def test_delete_category_without_expenses_returns_204(self):
        """Deleting an unused category returns 204 No Content and deletes the record."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(f"{self.url}{self.cat1.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(id=self.cat1.id).exists())

    def test_delete_category_with_active_expenses_returns_400_protected(self):
        """Deleting a category that has active expenses returns 400 Bad Request with helpful error."""
        # Create active expense on category
        Expense.objects.create(
            user=self.user1,
            category=self.cat1,
            amount=Decimal('25.50'),
            expense_date=date(2026, 8, 28)
        )
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(f"{self.url}{self.cat1.id}/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['code'], 'category_protected')
        self.assertTrue(Category.objects.filter(id=self.cat1.id).exists())

    def test_user_cannot_access_or_modify_other_user_category(self):
        """User 1 attempting to GET, PATCH, or DELETE User 2's category receives 404 Not Found."""
        self.client.force_authenticate(user=self.user1)
        
        # GET User 2's category
        get_res = self.client.get(f"{self.url}{self.cat2.id}/")
        self.assertEqual(get_res.status_code, status.HTTP_404_NOT_FOUND)

        # PATCH User 2's category
        patch_res = self.client.patch(f"{self.url}{self.cat2.id}/", {"name": "Hacked"}, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_404_NOT_FOUND)

        # DELETE User 2's category
        delete_res = self.client.delete(f"{self.url}{self.cat2.id}/")
        self.assertEqual(delete_res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Category.objects.filter(id=self.cat2.id).exists())
