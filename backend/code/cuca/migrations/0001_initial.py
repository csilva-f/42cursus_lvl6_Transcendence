# Generated by Django 5.1.2 on 2024-11-20 22:01

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Games',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('user1', models.IntegerField()),
                ('user2', models.IntegerField()),
                ('winner', models.IntegerField()),
                ('istournament', models.BooleanField(default=False)),
                ('tournamentid', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Tournaments',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('init_date', models.DateField()),
                ('end_date', models.DateField()),
                ('winner', models.IntegerField()),
                ('is_active', models.BooleanField(default=False)),
            ],
        ),
    ]