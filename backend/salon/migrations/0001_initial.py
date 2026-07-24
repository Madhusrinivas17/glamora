# Generated initial schema for Glamora.
import django.contrib.auth.models
import django.contrib.auth.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [('auth', '0012_alter_user_first_name_max_length')]

    operations = [
        migrations.CreateModel(name='User', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('password', models.CharField(max_length=128, verbose_name='password')),
            ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
            ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
            ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
            ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
            ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
            ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
            ('date_joined', models.DateTimeField(auto_now_add=True, verbose_name='date joined')),
            ('email', models.EmailField(max_length=254, unique=True)),
            ('phone', models.CharField(max_length=20, unique=True)), ('location', models.CharField(max_length=180)),
            ('role', models.CharField(choices=[('USER','User'),('ADMIN','Salon Owner')], default='USER', max_length=10)),
            ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
            ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
        ], managers=[('objects', django.contrib.auth.models.UserManager())]),
        migrations.CreateModel(name='ServiceCategory', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('name', models.CharField(max_length=50, unique=True))]),
        migrations.CreateModel(name='Parlour', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('name', models.CharField(max_length=140)), ('location', models.CharField(max_length=180)), ('description', models.TextField(blank=True)), ('image', models.URLField(blank=True)), ('owner', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='parlour', to='salon.user'))]),
        migrations.CreateModel(name='Beautician', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('name', models.CharField(max_length=100)), ('image', models.URLField(blank=True)), ('specialization', models.CharField(max_length=150)), ('experience_years', models.PositiveIntegerField(default=0)), ('is_available', models.BooleanField(default=True)), ('on_leave', models.BooleanField(default=False)), ('parlour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='beauticians', to='salon.parlour'))]),
        migrations.CreateModel(name='Holiday', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('date', models.DateField()), ('reason', models.CharField(max_length=150)), ('parlour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='holidays', to='salon.parlour'))]),
        migrations.CreateModel(name='TimeSlot', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('start_time', models.TimeField()), ('active', models.BooleanField(default=True)), ('parlour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='slots', to='salon.parlour'))]),
        migrations.CreateModel(name='Service', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('name', models.CharField(max_length=100)), ('description', models.TextField(blank=True)), ('image', models.URLField(blank=True)), ('price', models.DecimalField(decimal_places=2, max_digits=10)), ('duration_minutes', models.PositiveIntegerField(default=30)), ('active', models.BooleanField(default=True)), ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='services', to='salon.servicecategory')), ('parlour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='services', to='salon.parlour'))]),
        migrations.CreateModel(name='Offer', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('title', models.CharField(max_length=100)), ('description', models.TextField()), ('image', models.URLField(blank=True)), ('discount_percentage', models.PositiveIntegerField()), ('valid_from', models.DateField()), ('valid_to', models.DateField()), ('active', models.BooleanField(default=True)), ('parlour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='offers', to='salon.parlour'))]),
        migrations.CreateModel(name='Review', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('rating', models.PositiveIntegerField()), ('comment', models.TextField()), ('created_at', models.DateTimeField(auto_now_add=True)), ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='salon.user')), ('parlour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='salon.parlour'))]),
        migrations.CreateModel(name='Notification', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('title', models.CharField(max_length=120)), ('message', models.TextField()), ('read', models.BooleanField(default=False)), ('created_at', models.DateTimeField(auto_now_add=True)), ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='salon.user'))]),
        migrations.CreateModel(name='Appointment', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('date', models.DateField()), ('status', models.CharField(choices=[('PENDING','Pending'),('CONFIRMED','Confirmed'),('COMPLETED','Completed'),('CANCELLED','Cancelled'),('RESCHEDULED','Rescheduled')], default='PENDING', max_length=12)), ('notes', models.TextField(blank=True)), ('created_at', models.DateTimeField(auto_now_add=True)), ('beautician', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='salon.beautician')), ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='salon.user')), ('parlour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='salon.parlour')), ('service', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='salon.service')), ('slot', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='salon.timeslot'))]),
        migrations.AddConstraint(model_name='holiday', constraint=models.UniqueConstraint(fields=('parlour','date'), name='unique_holiday_date')),
        migrations.AddConstraint(model_name='timeslot', constraint=models.UniqueConstraint(fields=('parlour','start_time'), name='unique_parlour_time_slot')),
        migrations.AddConstraint(model_name='review', constraint=models.UniqueConstraint(fields=('customer','parlour'), name='unique_customer_review')),
        migrations.AddConstraint(model_name='appointment', constraint=models.UniqueConstraint(fields=('parlour','date','slot','beautician'), name='unique_staff_slot')),
    ]
