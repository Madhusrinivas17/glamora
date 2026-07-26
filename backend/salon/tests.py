from datetime import timedelta
from django.utils import timezone
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Parlour, User


from django.test import TestCase, override_settings

class AuthenticationFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        cache.clear()

    @override_settings(
        EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
        EMAIL_HOST_USER='test@example.com',
        EMAIL_HOST_PASSWORD='password'
    )
    def send_otp(self, **overrides):
        payload = {
            'first_name': 'Test User',
            'email': 'user@example.com',
            'phone': '9999999999',
            'location': 'Mumbai',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
            'role': 'USER',
            'method': 'email',
        }
        payload.update(overrides)
        return self.client.post('/api/auth/send-otp/', payload, format='json')

    def test_otp_registration_and_verification_flow(self):
        # Step 1: Submit registration details & send OTP
        response = self.send_otp()
        self.assertEqual(response.status_code, 200)
        self.assertIn('registration_token', response.data)
        reg_token = response.data['registration_token']

        # Account MUST NOT exist in DB yet
        self.assertFalse(User.objects.filter(email='user@example.com').exists())

        # Retrieve pending OTP from cache
        pending_data = cache.get(f"pending_reg_{reg_token}")
        self.assertIsNotNone(pending_data)
        otp_code = pending_data['otp']

        # Step 2: Verify with wrong OTP
        wrong_verify = self.client.post('/api/auth/verify-otp/', {
            'registration_token': reg_token, 'otp': '000000'
        }, format='json')
        self.assertEqual(wrong_verify.status_code, 400)

        # Step 3: Verify with correct OTP
        verify_resp = self.client.post('/api/auth/verify-otp/', {
            'registration_token': reg_token, 'otp': otp_code
        }, format='json')
        self.assertEqual(verify_resp.status_code, 201)

        # User is created ONLY NOW in DB
        user = User.objects.get(email='user@example.com')
        self.assertTrue(user.is_verified)
        self.assertTrue(user.is_active)
        self.assertIsNone(cache.get(f"pending_reg_{reg_token}"))

        # Step 4: Successful login after verification
        for identifier in ('user@example.com', '9999999999'):
            login_success = self.client.post('/api/auth/login/', {
                'identifier': identifier, 'password': 'StrongPassword123!', 'role': 'USER'
            }, format='json')
            self.assertEqual(login_success.status_code, 200)
            self.assertIn('access', login_success.data)
            self.assertIn('refresh', login_success.data)

    def test_owner_otp_registration_creates_parlour(self):
        send_resp = self.send_otp(
            email='owner@example.com',
            phone='8888888888',
            role='ADMIN',
            parlour_name='Glamora Luxury Spa',
            method='email'
        )
        self.assertEqual(send_resp.status_code, 200)
        reg_token = send_resp.data['registration_token']

        # Verify OTP
        pending_data = cache.get(f"pending_reg_{reg_token}")
        otp_code = pending_data['otp']

        verify_resp = self.client.post('/api/auth/verify-otp/', {
            'registration_token': reg_token, 'otp': otp_code
        }, format='json')
        self.assertEqual(verify_resp.status_code, 201)

        owner = User.objects.get(email='owner@example.com')
        self.assertTrue(owner.is_verified)
        self.assertTrue(Parlour.objects.filter(owner=owner, name='Glamora Luxury Spa').exists())

    def test_unconfigured_sms_provider_returns_400_error(self):
        send_resp = self.send_otp(
            email='smsuser@example.com',
            phone='7777777777',
            method='phone'
        )
        self.assertEqual(send_resp.status_code, 400)
        self.assertIn('currently unavailable', str(send_resp.data).lower())

    @override_settings(
        EMAIL_HOST_USER='',
        EMAIL_HOST_PASSWORD=''
    )
    def test_unconfigured_email_service_returns_400_error(self):
        payload = {
            'first_name': 'Test User',
            'email': 'noemailconfig@example.com',
            'phone': '9999999999',
            'location': 'Mumbai',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
            'role': 'USER',
            'method': 'email',
        }
        send_resp = self.client.post('/api/auth/send-otp/', payload, format='json')
        self.assertEqual(send_resp.status_code, 400)
        self.assertIn('email service is not configured', str(send_resp.data).lower())

    def test_expired_otp_token_is_rejected(self):
        send_resp = self.send_otp()
        reg_token = send_resp.data['registration_token']

        pending_data = cache.get(f"pending_reg_{reg_token}")
        # Expire timestamp
        pending_data['otp_created_at'] = (timezone.now() - timedelta(minutes=6)).isoformat()
        cache.set(f"pending_reg_{reg_token}", pending_data, timeout=300)

        verify_resp = self.client.post('/api/auth/verify-otp/', {
            'registration_token': reg_token, 'otp': pending_data['otp']
        }, format='json')
        self.assertEqual(verify_resp.status_code, 400)
        self.assertIn('expired', str(verify_resp.data).lower())
