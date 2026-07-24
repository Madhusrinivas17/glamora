from django.contrib.auth.hashers import check_password
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Parlour, User


class AuthenticationFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def register(self, **overrides):
        payload = {
            'first_name': 'Test User', 'email': 'user@example.com',
            'phone': '9999999999', 'location': 'Mumbai',
            'password': 'StrongPassword123!', 'confirm_password': 'StrongPassword123!',
            'role': 'USER',
        }
        payload.update(overrides)
        return self.client.post('/api/auth/register/', payload, format='json')

    def test_user_can_register_and_login_with_email_or_phone(self):
        response = self.register()
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email='user@example.com')
        self.assertTrue(check_password('StrongPassword123!', user.password))
        self.assertNotEqual(user.password, 'StrongPassword123!')

        for identifier in ('user@example.com', '9999999999'):
            response = self.client.post('/api/auth/login/', {
                'identifier': identifier, 'password': 'StrongPassword123!', 'role': 'USER',
            }, format='json')
            self.assertEqual(response.status_code, 200)
            self.assertIn('access', response.data)
            self.assertIn('refresh', response.data)
            self.assertEqual(response.data['user']['role'], 'USER')

    def test_owner_registration_creates_parlour_and_role_mismatch_is_rejected(self):
        response = self.register(
            email='owner@example.com', phone='8888888888', role='ADMIN', parlour_name='Glamora Salon',
        )
        self.assertEqual(response.status_code, 201)
        owner = User.objects.get(email='owner@example.com')
        self.assertTrue(Parlour.objects.filter(owner=owner, name='Glamora Salon').exists())

        response = self.client.post('/api/auth/login/', {
            'identifier': 'owner@example.com', 'password': 'StrongPassword123!', 'role': 'USER',
        }, format='json')
        self.assertEqual(response.status_code, 403)
