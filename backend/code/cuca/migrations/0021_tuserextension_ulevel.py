# Generated by Django 5.1.6 on 2025-02-18 22:58

from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cuca', '0020_remove_tuserextension_tvictories_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='tuserextension',
            name='ulevel',
            field=models.DecimalField(blank=True, decimal_places=2, default=Decimal('0.00'), max_digits=5, null=True),
        ),
    ]
