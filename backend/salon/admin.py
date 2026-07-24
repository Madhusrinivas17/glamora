from django.contrib import admin
from .models import *
admin.site.register([User,Parlour,ServiceCategory,Service,Beautician,Holiday,TimeSlot,Appointment,Offer,Review,Notification])
