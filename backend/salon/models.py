from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    ROLE_CHOICES=[('USER','User'),('ADMIN','Salon Owner')]
    username=None
    email=models.EmailField(unique=True)
    phone=models.CharField(max_length=20, unique=True)
    location=models.CharField(max_length=180)
    role=models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    USERNAME_FIELD='email'; REQUIRED_FIELDS=['phone','first_name','location']

class Parlour(models.Model):
    owner=models.OneToOneField(User,on_delete=models.CASCADE,related_name='parlour')
    name=models.CharField(max_length=140); location=models.CharField(max_length=180)
    description=models.TextField(blank=True); image=models.URLField(blank=True)

class ServiceCategory(models.Model):
    name=models.CharField(max_length=50, unique=True)
    def __str__(self): return self.name

class Service(models.Model):
    parlour=models.ForeignKey(Parlour,on_delete=models.CASCADE,related_name='services')
    category=models.ForeignKey(ServiceCategory,on_delete=models.PROTECT,related_name='services')
    name=models.CharField(max_length=100); description=models.TextField(blank=True)
    image=models.URLField(blank=True); price=models.DecimalField(max_digits=10,decimal_places=2)
    duration_minutes=models.PositiveIntegerField(default=30); active=models.BooleanField(default=True)

class Beautician(models.Model):
    parlour=models.ForeignKey(Parlour,on_delete=models.CASCADE,related_name='beauticians')
    name=models.CharField(max_length=100); image=models.URLField(blank=True); specialization=models.CharField(max_length=150)
    experience_years=models.PositiveIntegerField(default=0); is_available=models.BooleanField(default=True); on_leave=models.BooleanField(default=False)

class Holiday(models.Model):
    parlour=models.ForeignKey(Parlour,on_delete=models.CASCADE,related_name='holidays')
    date=models.DateField(); reason=models.CharField(max_length=150)
    class Meta: unique_together=('parlour','date')

class TimeSlot(models.Model):
    parlour=models.ForeignKey(Parlour,on_delete=models.CASCADE,related_name='slots')
    start_time=models.TimeField(); active=models.BooleanField(default=True)
    class Meta: unique_together=('parlour','start_time')

class Appointment(models.Model):
    STATUS=[('PENDING','Pending'),('CONFIRMED','Confirmed'),('COMPLETED','Completed'),('CANCELLED','Cancelled'),('RESCHEDULED','Rescheduled')]
    customer=models.ForeignKey(User,on_delete=models.CASCADE,related_name='appointments')
    parlour=models.ForeignKey(Parlour,on_delete=models.CASCADE,related_name='appointments')
    service=models.ForeignKey(Service,on_delete=models.PROTECT)
    beautician=models.ForeignKey(Beautician,on_delete=models.SET_NULL,null=True,blank=True)
    date=models.DateField(); slot=models.ForeignKey(TimeSlot,on_delete=models.PROTECT)
    status=models.CharField(max_length=12,choices=STATUS,default='PENDING'); notes=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta: constraints=[models.UniqueConstraint(fields=['parlour','date','slot','beautician'],name='unique_staff_slot')]

class Offer(models.Model):
    parlour=models.ForeignKey(Parlour,on_delete=models.CASCADE,related_name='offers'); title=models.CharField(max_length=100)
    description=models.TextField(); image=models.URLField(blank=True); discount_percentage=models.PositiveIntegerField(validators=[MaxValueValidator(100)])
    valid_from=models.DateField(); valid_to=models.DateField(); active=models.BooleanField(default=True)

class Review(models.Model):
    customer=models.ForeignKey(User,on_delete=models.CASCADE); parlour=models.ForeignKey(Parlour,on_delete=models.CASCADE,related_name='reviews')
    rating=models.PositiveIntegerField(validators=[MinValueValidator(1),MaxValueValidator(5)]); comment=models.TextField(); created_at=models.DateTimeField(auto_now_add=True)
    class Meta: unique_together=('customer','parlour')

class Notification(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='notifications'); title=models.CharField(max_length=120); message=models.TextField(); read=models.BooleanField(default=False); created_at=models.DateTimeField(auto_now_add=True)
