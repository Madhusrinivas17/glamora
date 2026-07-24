from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register('parlours', views.ParlourViewSet, basename='parlour')
router.register('categories', views.CategoryViewSet, basename='category')
router.register('services', views.ServiceViewSet, basename='service')
router.register('beauticians', views.BeauticianViewSet, basename='beautician')
router.register('slots', views.SlotViewSet, basename='slot')
router.register('holidays', views.HolidayViewSet, basename='holiday')
router.register('offers', views.OfferViewSet, basename='offer')
router.register('appointments', views.AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.profile, name='profile'),
    path('auth/change-password/', views.change_password, name='change_password'),
    path('catalogue/<int:parlour_id>/', views.catalogue, name='catalogue'),
    path('public-services/', views.public_services, name='public_services'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('reports/', views.reports, name='reports'),
    path('notifications/', views.notifications, name='notifications'),
    path('my-reviews/', views.my_reviews, name='my_reviews'),
    path('reviews/', views.reviews, name='all_reviews'),
    path('reviews/<int:parlour_id>/', views.reviews, name='reviews'),
    path('', include(router.urls)),
]
