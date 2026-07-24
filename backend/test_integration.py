import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'glamora.settings')
django.setup()

from rest_framework.test import APIClient
from salon.models import User, Parlour, ServiceCategory, Service, Beautician, TimeSlot, Appointment, Offer, Review

def run_tests():
    print("--- Starting Glamora API & Database Verification Tests ---")
    client = APIClient()

    # Clean up test users
    User.objects.filter(email__in=['testuser@example.com', 'testadmin@example.com', 'unique@example.com']).delete()

    # Test 1: User Registration
    user_payload = {
        'role': 'USER',
        'first_name': 'Test User',
        'email': 'testuser@example.com',
        'phone': '9876543210',
        'location': 'New York',
        'password': 'Password123!',
        'confirm': 'Password123!'
    }
    res = client.post('/api/auth/register/', user_payload, format='json')
    assert res.status_code == 201, f"User registration failed: {res.status_code} {res.data}"
    print("[PASS] User Registration (POST /api/auth/register/) -> 201 Created")

    # Verify User created in DB
    user_obj = User.objects.get(email='testuser@example.com')
    assert user_obj.role == 'USER'
    assert user_obj.check_password('Password123!')
    print("[PASS] User DB record verified, password hashed correctly.")

    # Test 2: Admin Registration & Parlour Creation
    admin_payload = {
        'role': 'ADMIN',
        'first_name': 'Test Admin',
        'email': 'testadmin@example.com',
        'phone': '9876543211',
        'location': 'Los Angeles',
        'parlour_name': 'Glamour Luxe Parlour',
        'password': 'Password123!',
        'confirm': 'Password123!'
    }
    res = client.post('/api/auth/register/', admin_payload, format='json')
    assert res.status_code == 201, f"Admin registration failed: {res.status_code} {res.data}"
    print("[PASS] Admin Registration (POST /api/auth/register/) -> 201 Created")

    admin_obj = User.objects.get(email='testadmin@example.com')
    assert admin_obj.role == 'ADMIN'
    parlour = Parlour.objects.get(owner=admin_obj)
    assert parlour.name == 'Glamour Luxe Parlour'
    print("[PASS] Admin DB record and Parlour creation verified.")

    # Test 3: Duplicate Email Validation (different phone)
    dup_email_payload = {**user_payload, 'phone': '9999999999'}
    res = client.post('/api/auth/register/', dup_email_payload, format='json')
    print("Duplicate Email Test Response:", res.status_code, res.data)
    assert res.status_code == 400
    assert 'Email already exists.' in str(res.data)
    print("[PASS] Duplicate Email Validation -> 400 Bad Request with exact error message.")

    # Test 4: Duplicate Phone Validation (different email)
    dup_phone_payload = {**user_payload, 'email': 'unique@example.com'}
    res = client.post('/api/auth/register/', dup_phone_payload, format='json')
    print("Duplicate Phone Test Response:", res.status_code, res.data)
    assert res.status_code == 400
    assert 'Phone number already exists.' in str(res.data)
    print("[PASS] Duplicate Phone Validation -> 400 Bad Request with exact error message.")

    # Test 5: User Login
    login_res = client.post('/api/auth/login/', {'identifier': 'testuser@example.com', 'password': 'Password123!', 'role': 'USER'}, format='json')
    assert login_res.status_code == 200
    assert 'access' in login_res.data and 'refresh' in login_res.data
    user_token = login_res.data['access']
    print("[PASS] User Login (POST /api/auth/login/) -> JWT access and refresh tokens returned.")

    # Test 6: Admin Login
    admin_login_res = client.post('/api/auth/login/', {'identifier': 'testadmin@example.com', 'password': 'Password123!', 'role': 'ADMIN'}, format='json')
    assert admin_login_res.status_code == 200
    admin_token = admin_login_res.data['access']
    print("[PASS] Admin Login (POST /api/auth/login/) -> JWT access and refresh tokens returned.")

    # Test 7: Auth Profile
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {user_token}')
    profile_res = client.get('/api/auth/profile/')
    assert profile_res.status_code == 200
    assert profile_res.data['email'] == 'testuser@example.com'
    print("[PASS] User Profile (GET /api/auth/profile/) -> 200 OK")

    # Test 8: Admin Dashboard
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    dash_res = client.get('/api/dashboard/')
    assert dash_res.status_code == 200
    assert 'today_bookings' in dash_res.data
    print("[PASS] Admin Dashboard (GET /api/dashboard/) -> 200 OK")

    # Test 9: Public Parlours List
    client.credentials()
    parlour_res = client.get('/api/parlours/')
    assert parlour_res.status_code == 200
    print("[PASS] Parlours Endpoint (GET /api/parlours/) -> 200 OK")

    # Test 10: Catalogue
    cat_res = client.get(f'/api/catalogue/{parlour.id}/')
    assert cat_res.status_code == 200
    assert 'services' in cat_res.data
    print("[PASS] Catalogue Endpoint (GET /api/catalogue/<id>/) -> 200 OK")

    # Test 11: Offers
    offer_res = client.get('/api/offers/')
    assert offer_res.status_code == 200
    print("[PASS] Offers Endpoint (GET /api/offers/) -> 200 OK")

    # Test 12: Reviews
    rev_res = client.get(f'/api/reviews/{parlour.id}/')
    assert rev_res.status_code == 200
    print("[PASS] Reviews Endpoint (GET /api/reviews/<id>/) -> 200 OK")

    print("\n>>> ALL BACKEND API & DB INTEGRATION TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == '__main__':
    run_tests()
