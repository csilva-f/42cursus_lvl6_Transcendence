# Generated by Django 5.1.3 on 2024-11-17 15:01

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cuca', '0003_alter_tgames_statusid'),
    ]

    operations = [
        migrations.CreateModel(
            name='tTournaments',
            fields=[
                ('tournament', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('beginDate', models.DateField()),
                ('endDate', models.DateField()),
                ('creationTS', models.DateField()),
                ('createdByUser', models.IntegerField(blank=True, null=True)),
                ('winnerUser', models.IntegerField(blank=True, null=True)),
                ('status', models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, to='cuca.tauxstatus')),
            ],
        ),
        migrations.AlterField(
            model_name='tgames',
            name='tournament',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='cuca.ttournaments'),
        ),
        migrations.DeleteModel(
            name='Tournaments',
        ),
    ]