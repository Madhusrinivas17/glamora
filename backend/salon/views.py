from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count
from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import *
from .serializers import *

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

def owner_parlour(user):
    return getattr(user, 'parlour', None)

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        identifier = (request.data.get('email') or request.data.get('phone') or request.data.get('identifier') or '').strip()
        password = request.data.get('password')
        if not identifier or not password:
            return Response({'detail': 'Email or phone number and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(email__iexact=identifier).first() or User.objects.filter(phone=identifier).first()
        if not user or not user.is_active or not authenticate(request, email=user.email, password=password):
            return Response({'detail': 'Invalid login credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        role = (request.data.get('role') or '').upper()
        if role and role != user.role:
            return Response({'detail': 'Selected role does not match this account.'}, status=status.HTTP_403_FORBIDDEN)
        refresh = RefreshToken.for_user(user)
        return Response({'refresh': str(refresh), 'access': str(refresh.access_token), 'user': UserSerializer(user).data})

class ParlourViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Parlour.objects.all().order_by('name')
    serializer_class = ParlourSerializer
    permission_classes = [permissions.AllowAny]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all().order_by('name')
    serializer_class = ServiceCategorySerializer

    def get_permissions(self):
        permission = permissions.AllowAny if self.action in ('list', 'retrieve') else IsOwner
        return [permission()]

class OwnerScopedViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOwner]

    def perform_create(self, serializer):
        serializer.save(parlour=owner_parlour(self.request.user))

    def get_queryset(self):
        parlour = owner_parlour(self.request.user)
        if not parlour:
            return self.queryset.none()
        return self.queryset.filter(parlour=parlour)

class ServiceViewSet(OwnerScopedViewSet):
    queryset = Service.objects.select_related('category', 'parlour')
    serializer_class = ServiceSerializer

class BeauticianViewSet(OwnerScopedViewSet):
    queryset = Beautician.objects.all()
    serializer_class = BeauticianSerializer

class SlotViewSet(OwnerScopedViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = SlotSerializer

class HolidayViewSet(OwnerScopedViewSet):
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer

class OfferViewSet(OwnerScopedViewSet):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [IsOwner()]

    def get_queryset(self):
        if self.action in ('list', 'retrieve'):
            return Offer.objects.filter(active=True)
        return super().get_queryset()

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_services(request):
    queryset = Service.objects.filter(active=True).select_related('parlour', 'category')
    query = request.query_params.get('search', '').strip()
    category = request.query_params.get('category', '').strip()
    location = request.query_params.get('location', '').strip()
    if query:
        from django.db.models import Q
        queryset = queryset.filter(Q(name__icontains=query) | Q(description__icontains=query) | Q(parlour__name__icontains=query) | Q(parlour__location__icontains=query))
    if category:
        queryset = queryset.filter(category__name__iexact=category)
    if location:
        queryset = queryset.filter(parlour__location__icontains=location)
    return Response([{
        **ServiceSerializer(service).data,
        'parlour_name': service.parlour.name,
        'parlour_location': service.parlour.location,
    } for service in queryset.order_by('name')])

@api_view(['GET', 'PATCH'])
def profile(request):
    if request.method == 'GET':
        return Response(ProfileSerializer(request.user).data)
    serializer = ProfileSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)

@api_view(['POST'])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save(update_fields=['password'])
    return Response({'detail': 'Password updated successfully.'})

@api_view(['GET'])
def my_reviews(request):
    return Response(ReviewSerializer(Review.objects.filter(customer=request.user).select_related('parlour'), many=True).data)

@api_view(['GET'])
@permission_classes([IsOwner])
def reports(request):
    parlour = owner_parlour(request.user)
    if not parlour:
        return Response({'total_bookings': 0, 'completed_bookings': 0, 'cancelled_bookings': 0, 'revenue': '0', 'services': [], 'customers': []})
    appointments = Appointment.objects.filter(parlour=parlour)
    return Response({
        'total_bookings': appointments.count(),
        'completed_bookings': appointments.filter(status='COMPLETED').count(),
        'cancelled_bookings': appointments.filter(status='CANCELLED').count(),
        'revenue': str(appointments.filter(status='COMPLETED').aggregate(total=Sum('service__price'))['total'] or 0),
        'services': list(appointments.values('service__name').annotate(bookings=Count('id')).order_by('-bookings')),
        'customers': list(appointments.values('customer__first_name', 'customer__email').annotate(visits=Count('id')).order_by('-visits')),
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def catalogue(request, parlour_id):
    return Response({
        'services': ServiceSerializer(Service.objects.filter(parlour_id=parlour_id, active=True), many=True).data,
        'beauticians': BeauticianSerializer(Beautician.objects.filter(parlour_id=parlour_id, is_available=True, on_leave=False), many=True).data,
        'slots': SlotSerializer(TimeSlot.objects.filter(parlour_id=parlour_id, active=True).order_by('start_time'), many=True).data
    })

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            parlour = owner_parlour(self.request.user)
            if not parlour:
                return Appointment.objects.none()
            return Appointment.objects.filter(parlour=parlour).select_related('customer', 'service')
        return Appointment.objects.filter(customer=self.request.user).select_related('service', 'parlour')

    def perform_create(self, serializer):
        service = serializer.validated_data['service']
        parlour = service.parlour
        slot = serializer.validated_data['slot']
        if slot.parlour_id != parlour.id or not slot.active:
            raise serializers.ValidationError('Selected time slot is invalid.')
        if Holiday.objects.filter(parlour=parlour, date=serializer.validated_data['date']).exists():
            raise serializers.ValidationError('Salon is closed on this date.')
        beautician = serializer.validated_data.get('beautician')
        if beautician and beautician.parlour_id != parlour.id:
            raise serializers.ValidationError('Beautician does not belong to this salon.')
        if not beautician:
            busy = Appointment.objects.filter(parlour=parlour, date=serializer.validated_data['date'], slot=serializer.validated_data['slot']).exclude(beautician=None).values_list('beautician_id', flat=True)
            beautician = Beautician.objects.filter(parlour=parlour, is_available=True, on_leave=False).exclude(id__in=busy).first()
            if not beautician:
                raise serializers.ValidationError('No beautician is available for this time slot.')
        if Appointment.objects.filter(parlour=parlour, date=serializer.validated_data['date'], slot=serializer.validated_data['slot'], beautician=beautician).exists():
            raise serializers.ValidationError('This time slot is no longer available.')
        serializer.save(customer=self.request.user, parlour=parlour, beautician=beautician)

    @action(detail=True, methods=['post'], permission_classes=[IsOwner])
    def status(self, request, pk=None):
        appointment = self.get_object()
        value = request.data.get('status')
        if value not in dict(Appointment.STATUS):
            return Response({'detail': 'Invalid status'}, status=400)
        appointment.status = value
        appointment.save()
        Notification.objects.create(user=appointment.customer, title='Appointment update', message=f'Your {appointment.service.name} appointment is {value.lower()}.')
        return Response(AppointmentSerializer(appointment).data)

    def destroy(self, request, *args, **kwargs):
        appointment = self.get_object()
        if request.user.role == 'USER' and appointment.date <= timezone.localdate() + timedelta(days=1):
            return Response({'detail': 'Customer cancellations require 24 hours notice.'}, status=400)
        appointment.status = 'CANCELLED'
        appointment.save()
        return Response(status=204)

@api_view(['GET'])
def dashboard(request):
    if request.user.role != 'ADMIN':
        return Response({'detail': 'Access forbidden.'}, status=403)
    parlour = owner_parlour(request.user)
    if not parlour:
        return Response({'today_bookings': 0, 'recent_bookings': [], 'completed_revenue': '0', 'new_customers': 0, 'repeat_customers': 0, 'most_booked_service': None})
    qs = Appointment.objects.filter(parlour=parlour)
    today = timezone.localdate()
    return Response({
        'today_bookings': qs.filter(date=today).count(),
        'recent_bookings': AppointmentSerializer(qs.order_by('-created_at')[:6], many=True).data,
        'completed_revenue': str(qs.filter(status='COMPLETED').aggregate(total=Sum('service__price'))['total'] or 0),
        'new_customers': qs.values('customer').annotate(n=Count('id')).filter(n=1).count(),
        'repeat_customers': qs.values('customer').annotate(n=Count('id')).filter(n__gt=1).count(),
        'most_booked_service': qs.values('service__name').annotate(n=Count('id')).order_by('-n').first()
    })

@api_view(['GET'])
def notifications(request):
    return Response(NotificationSerializer(request.user.notifications.order_by('-created_at'), many=True).data)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def reviews(request, parlour_id=None):
    if request.method == 'GET':
        qs = Review.objects.filter(parlour_id=parlour_id) if parlour_id else Review.objects.all()
        return Response(ReviewSerializer(qs, many=True).data)
    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    if not parlour_id:
        return Response({'detail': 'Parlour ID is required for submitting a review.'}, status=status.HTTP_400_BAD_REQUEST)
    if not Appointment.objects.filter(customer=request.user, parlour_id=parlour_id, status='COMPLETED').exists():
        return Response({'detail': 'Reviews can be added after a completed appointment.'}, status=status.HTTP_403_FORBIDDEN)
    s = ReviewSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    s.save(customer=request.user, parlour_id=parlour_id)
    return Response(s.data, status=201)
