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

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    parlour_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.CharField(required=False, default='USER')

    class Meta:
        model = User
        fields = ['first_name', 'email', 'phone', 'location', 'password', 'confirm', 'confirm_password', 'role', 'parlour_name']
        extra_kwargs = {
            'email': {'validators': []},
            'phone': {'validators': []},
        }

    def validate(self, data):
        errors = {}
        first_name = (data.get('first_name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        phone = (data.get('phone') or '').strip()
        location = (data.get('location') or '').strip()
        role = (data.get('role') or 'USER').strip().upper()
        password = data.get('password') or ''

        if not first_name:
            errors['first_name'] = 'Full name is required.'

        if not email:
            errors['email'] = 'Email is required.'
        elif User.objects.filter(email__iexact=email).exists():
            errors['email'] = 'Email already exists.'

        if not phone:
            errors['phone'] = 'Phone number is required.'
        elif User.objects.filter(phone=phone).exists():
            errors['phone'] = 'Phone number already exists.'

        if not location:
            errors['location'] = 'Location is required.'

        if not role:
            errors['role'] = 'Role is required.'

        if not password:
            errors['password'] = 'Password is required.'
        elif len(password) < 8:
            errors['password'] = 'Password is too short.'

        confirm_val = data.get('confirm') or data.get('confirm_password')
        if confirm_val and password != confirm_val:
            errors['confirm'] = 'Passwords do not match.'
            errors['confirm_password'] = 'Passwords do not match.'

        if role == 'ADMIN':
            parlour = (data.get('parlour_name') or '').strip()
            if not parlour:
                errors['parlour_name'] = 'Parlour name is required.'

        if errors:
            raise serializers.ValidationError(errors)

        data['first_name'] = first_name
        data['email'] = email
        data['phone'] = phone
        data['location'] = location
        data['role'] = role
        return data

    def create(self, data):
        salon = data.pop('parlour_name', None)
        data.pop('confirm', None)
        data.pop('confirm_password', None)
        password = data.pop('password')
        with transaction.atomic():
            user = User(**data)
            user.set_password(password)
            user.save()
            if user.role == 'ADMIN':
                Parlour.objects.create(owner=user, name=salon or f"{user.first_name}'s Salon", location=user.location)
        return user

class ParlourSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Parlour
        fields = ['id', 'name', 'location', 'description', 'image', 'average_rating']

    def get_average_rating(self, obj):
        from django.db.models import Avg
        return obj.reviews.aggregate(value=Avg('rating'))['value'] or 0

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

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['customer']

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
