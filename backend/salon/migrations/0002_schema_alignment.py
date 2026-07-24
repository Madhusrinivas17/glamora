import django.contrib.auth.validators
import django.utils.timezone
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('salon', '0001_initial')]

    operations = [
        migrations.AlterModelOptions(name='user', options={'verbose_name': 'user', 'verbose_name_plural': 'users'}),
        migrations.RemoveConstraint(model_name='holiday', name='unique_holiday_date'),
        migrations.RemoveConstraint(model_name='review', name='unique_customer_review'),
        migrations.RemoveConstraint(model_name='timeslot', name='unique_parlour_time_slot'),
        migrations.AlterField(model_name='offer', name='discount_percentage', field=models.PositiveIntegerField(validators=[MaxValueValidator(100)])),
        migrations.AlterField(model_name='review', name='rating', field=models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])),
        migrations.AlterField(model_name='user', name='date_joined', field=models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
        migrations.AlterField(model_name='user', name='groups', field=models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
        migrations.AlterUniqueTogether(name='holiday', unique_together={('parlour', 'date')}),
        migrations.AlterUniqueTogether(name='review', unique_together={('customer', 'parlour')}),
        migrations.AlterUniqueTogether(name='timeslot', unique_together={('parlour', 'start_time')}),
    ]
