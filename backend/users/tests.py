from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserRegistrationTests(APITestCase):
    """
    Integration tests for user registration endpoint (/api/auth/register/).
    """
    def setUp(self):
        self.register_url = reverse('users:register')
        self.valid_payload = {
            'email': 'newuser@example.com',
            'password': 'StrongPassword123!',
            'password2': 'StrongPassword123!',
            'first_name': 'New',
            'last_name': 'User',
        }

    def test_register_success(self):
        response = self.client.post(self.register_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')
        self.assertEqual(response.data['user']['first_name'], 'New')
        self.assertEqual(response.data['user']['last_name'], 'User')
        self.assertEqual(response.data['user']['full_name'], 'New User')
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_register_duplicate_email(self):
        User.objects.create_user(email='newuser@example.com', password='Password123!')
        response = self.client.post(self.register_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_duplicate_email_case_insensitive(self):
        User.objects.create_user(email='newuser@example.com', password='Password123!')
        payload = self.valid_payload.copy()
        payload['email'] = 'NEWUSER@example.com'
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_password_mismatch(self):
        payload = self.valid_payload.copy()
        payload['password2'] = 'DifferentPassword123!'
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_register_short_password(self):
        payload = self.valid_payload.copy()
        payload['password'] = 'short'
        payload['password2'] = 'short'
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_fields(self):
        response = self.client.post(self.register_url, {'email': 'test@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginTests(APITestCase):
    """
    Integration tests for user login endpoint (/api/auth/login/).
    """
    def setUp(self):
        self.login_url = reverse('users:login')
        self.user = User.objects.create_user(
            email='alice@example.com',
            password='AlicePassword123!',
            first_name='Alice',
            last_name='Smith'
        )

    def test_login_success(self):
        response = self.client.post(
            self.login_url,
            {'email': 'alice@example.com', 'password': 'AlicePassword123!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'alice@example.com')
        self.assertEqual(response.data['user']['first_name'], 'Alice')

    def test_login_invalid_password(self):
        response = self.client.post(
            self.login_url,
            {'email': 'alice@example.com', 'password': 'WrongPassword!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_email(self):
        response = self.client.post(
            self.login_url,
            {'email': 'nobody@example.com', 'password': 'AlicePassword123!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenRefreshAndBlacklistTests(APITestCase):
    """
    Integration tests for token refresh (/api/auth/refresh/) and logout (/api/auth/logout/).
    """
    def setUp(self):
        self.refresh_url = reverse('users:token-refresh')
        self.logout_url = reverse('users:logout')
        self.user = User.objects.create_user(
            email='bob@example.com',
            password='BobPassword123!'
        )
        self.refresh_token = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh_token.access_token)

    def test_token_refresh_success(self):
        response = self.client.post(
            self.refresh_url,
            {'refresh': str(self.refresh_token)},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_logout_blacklists_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        # Perform logout with refresh token
        response = self.client.post(
            self.logout_url,
            {'refresh': str(self.refresh_token)},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'Successfully logged out.')

        # Attempting to refresh with the blacklisted token must fail
        refresh_response = self.client.post(
            self.refresh_url,
            {'refresh': str(self.refresh_token)},
            format='json'
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_unauthenticated(self):
        response = self.client.post(
            self.logout_url,
            {'refresh': str(self.refresh_token)},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_missing_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.post(self.logout_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserProfileTests(APITestCase):
    """
    Integration tests for user profile retrieval and updates (/api/auth/me/).
    """
    def setUp(self):
        self.profile_url = reverse('users:profile')
        self.user = User.objects.create_user(
            email='carol@example.com',
            password='CarolPassword123!',
            first_name='Carol',
            last_name='Danvers'
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)

    def test_get_profile_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'carol@example.com')
        self.assertEqual(response.data['first_name'], 'Carol')
        self.assertEqual(response.data['last_name'], 'Danvers')
        self.assertEqual(response.data['full_name'], 'Carol Danvers')

    def test_update_profile(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.patch(
            self.profile_url,
            {'first_name': 'Captain', 'last_name': 'Marvel'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Captain')
        self.assertEqual(response.data['last_name'], 'Marvel')
        self.assertEqual(response.data['full_name'], 'Captain Marvel')

        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Captain')
        self.assertEqual(self.user.last_name, 'Marvel')

    def test_email_is_read_only(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.patch(
            self.profile_url,
            {'email': 'hacked@example.com'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'carol@example.com')


class ChangePasswordTests(APITestCase):
    """
    Integration tests for password change endpoint (/api/auth/change-password/).
    """
    def setUp(self):
        self.change_password_url = reverse('users:change-password')
        self.login_url = reverse('users:login')
        self.user = User.objects.create_user(
            email='dave@example.com',
            password='OldPassword123!'
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)

    def test_change_password_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.post(
            self.change_password_url,
            {
                'old_password': 'OldPassword123!',
                'new_password': 'BrandNewPassword123!',
                'new_password2': 'BrandNewPassword123!'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'Password updated successfully.')

        # Verify old password cannot log in
        self.client.credentials()  # Clear auth
        old_login = self.client.post(
            self.login_url,
            {'email': 'dave@example.com', 'password': 'OldPassword123!'},
            format='json'
        )
        self.assertEqual(old_login.status_code, status.HTTP_401_UNAUTHORIZED)

        # Verify new password logs in successfully
        new_login = self.client.post(
            self.login_url,
            {'email': 'dave@example.com', 'password': 'BrandNewPassword123!'},
            format='json'
        )
        self.assertEqual(new_login.status_code, status.HTTP_200_OK)

    def test_change_password_wrong_old_password(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.post(
            self.change_password_url,
            {
                'old_password': 'WrongOldPassword!',
                'new_password': 'BrandNewPassword123!',
                'new_password2': 'BrandNewPassword123!'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('old_password', response.data)

    def test_change_password_mismatch_new_passwords(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.post(
            self.change_password_url,
            {
                'old_password': 'OldPassword123!',
                'new_password': 'BrandNewPassword123!',
                'new_password2': 'MismatchPassword123!'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', response.data)

    def test_change_password_unauthenticated(self):
        response = self.client.post(
            self.change_password_url,
            {
                'old_password': 'OldPassword123!',
                'new_password': 'BrandNewPassword123!',
                'new_password2': 'BrandNewPassword123!'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
