from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import *

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'first_name', 'email', 'phone', 'location', 'role']

class ProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name')

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'location', 'role']
        read_only_fields = ['id', 'role']

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        if not self.context['request'].user.check_password(data['current_password']):
            raise serializers.ValidationError({'current_password': 'Current password is incorrect.'})
        return data

import re
import uuid
from datetime import datetime, timedelta
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from django.core.cache import cache

class SendOTPSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    email = serializers.CharField()
    phone = serializers.CharField()
    location = serializers.CharField(max_length=180)
    password = serializers.CharField(write_only=True)
    confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.CharField(required=False, default='USER')
    parlour_name = serializers.CharField(required=False, allow_blank=True)
    method = serializers.CharField(required=False, default='email')

    def validate(self, data):
        errors = {}
        first_name = (data.get('first_name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        phone = (data.get('phone') or '').strip()
        location = (data.get('location') or '').strip()
        role = (data.get('role') or 'USER').strip().upper()
        password = data.get('password') or ''
        method = 'email'

        if not first_name:
            errors['first_name'] = 'Full name is required.'

        # Validate Email Format and Exists
        if not email:
            errors['email'] = 'Email address is required.'
        else:
            try:
                validate_email(email)
            except DjangoValidationError:
                errors['email'] = 'Please enter a valid email address.'
            else:
                try:
                    if User.objects.filter(email__iexact=email).exists():
                        errors['email'] = 'An account with this email address already exists.'
                except Exception as db_err:
                    logger.warning(f"[DB WARN in SendOTPSerializer email check] {db_err}")

        # Validate Phone Format and Exists
        clean_phone = re.sub(r'[\s\-\(\)]', '', phone)
        if not phone:
            errors['phone'] = 'Phone number is required.'
        elif not re.match(r'^\+?[0-9]{7,15}$', clean_phone):
            errors['phone'] = 'Please enter a valid phone number (7 to 15 digits).'
        else:
            try:
                if User.objects.filter(phone=clean_phone).exists():
                    errors['phone'] = 'An account with this phone number already exists.'
            except Exception as db_err:
                logger.warning(f"[DB WARN in SendOTPSerializer phone check] {db_err}")

        if not location:
            errors['location'] = 'Location is required.'

        if not role or role not in ['USER', 'ADMIN']:
            errors['role'] = 'Invalid role selected.'

        if not password:
            errors['password'] = 'Password is required.'
        elif len(password) < 8:
            errors['password'] = 'Password must be at least 8 characters long.'

        confirm_val = data.get('confirm') or data.get('confirm_password')
        if confirm_val and password != confirm_val:
            errors['confirm'] = 'Passwords do not match.'
            errors['confirm_password'] = 'Passwords do not match.'

        if role == 'ADMIN':
            parlour = (data.get('parlour_name') or '').strip()
            if not parlour:
                errors['parlour_name'] = 'Parlour name is required for Salon Owner.'

        if errors:
            raise serializers.ValidationError(errors)

        data['first_name'] = first_name
        data['email'] = email
        data['phone'] = clean_phone
        data['location'] = location
        data['role'] = role
        data['method'] = method
        return data


class ResendOTPSerializer(serializers.Serializer):
    registration_token = serializers.CharField()
    method = serializers.ChoiceField(choices=['email', 'phone'], required=False)


class VerifyOTPSerializer(serializers.Serializer):
    registration_token = serializers.CharField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate(self, data):
        token = data.get('registration_token', '').strip()
        otp_code = data.get('otp', '').strip()

        if not token:
            raise serializers.ValidationError({'detail': 'Registration verification token is required.'})

        pending_data = cache.get(f"pending_reg_{token}")

        if not pending_data:
            raise serializers.ValidationError({'detail': 'OTP verification session expired or invalid. Please register again.'})

        # Expiry check (5 minutes)
        otp_created_at = datetime.fromisoformat(pending_data['otp_created_at'])
        if timezone.now() - otp_created_at > timedelta(minutes=5):
            cache.delete(f"pending_reg_{token}")
            raise serializers.ValidationError({'detail': 'OTP has expired (valid for 5 minutes). Please register again.'})

        # Max attempts check (5 attempts)
        if pending_data.get('otp_attempts', 0) >= 5:
            cache.delete(f"pending_reg_{token}")
            raise serializers.ValidationError({'detail': 'Maximum verification attempts exceeded. Please register again.'})

        # Verify code
        if pending_data['otp'] != otp_code:
            pending_data['otp_attempts'] = pending_data.get('otp_attempts', 0) + 1
            remaining_seconds = int((otp_created_at + timedelta(minutes=5) - timezone.now()).total_seconds())
            if remaining_seconds > 0:
                cache.set(f"pending_reg_{token}", pending_data, timeout=remaining_seconds)

            remaining = 5 - pending_data['otp_attempts']
            if remaining > 0:
                raise serializers.ValidationError({'detail': f'Invalid OTP code. {remaining} attempt(s) remaining.'})
            else:
                cache.delete(f"pending_reg_{token}")
                raise serializers.ValidationError({'detail': 'Invalid OTP. Maximum attempts reached. Please register again.'})

        data['pending_data'] = pending_data
        return data


class RegisterSerializer(SendOTPSerializer):
    pass

class ParlourSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    phone = serializers.CharField(source='owner.phone', read_only=True)
    email = serializers.CharField(source='owner.email', read_only=True)
    services = serializers.SerializerMethodField()
    opening_time = serializers.SerializerMethodField()
    closing_time = serializers.SerializerMethodField()

    class Meta:
        model = Parlour
        fields = ['id', 'name', 'location', 'description', 'image', 'average_rating', 'phone', 'email', 'services', 'opening_time', 'closing_time']

    def get_average_rating(self, obj):
        from django.db.models import Avg
        return obj.reviews.aggregate(value=Avg('rating'))['value'] or 0

    def get_services(self, obj):
        return list(obj.services.filter(active=True).values_list('name', flat=True))

    def get_opening_time(self, obj):
        first_slot = obj.slots.filter(active=True).order_by('start_time').first()
        return first_slot.start_time.strftime('%H:%M') if first_slot and first_slot.start_time else '09:00'

    def get_closing_time(self, obj):
        last_slot = obj.slots.filter(active=True).order_by('-start_time').first()
        if last_slot and last_slot.start_time:
            h = (last_slot.start_time.hour + 1) % 24
            return f"{h:02d}:{last_slot.start_time.minute:02d}"
        return '20:00'


class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['parlour']

class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = '__all__'

class BeauticianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beautician
        fields = '__all__'
        read_only_fields = ['parlour']

class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'
        read_only_fields = ['parlour']

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'
        read_only_fields = ['parlour']

class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = '__all__'
        read_only_fields = ['parlour']

class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.first_name', read_only=True)
    parlour_name = serializers.CharField(source='parlour.name', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['customer', 'parlour']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.first_name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['customer', 'parlour', 'status']
