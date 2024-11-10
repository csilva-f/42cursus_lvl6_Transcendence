from django.db import models
from django.core.validators import MinValueValidator
from datetime import timedelta, date
from django import forms
from django.contrib.auth.forms import UserCreationForm
# Create your models here.
class Tournaments(models.Model):
    id = models.AutoField(primary_key=True)
    init_date = models.DateField()
    end_date = models.DateField()
    winner = models.IntegerField()
    is_active = models.BooleanField(default=False)
    def save(self, *args, **kwargs):
        current_date = date.today()
        self.is_active = self.init_date = current_date
        super().save(*args, **kwargs)
    def __str__(self):
        return f"Tournament {self.id} starting on {self.init_date} until {self.end_date}"
class Games(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    user1 = models.IntegerField()
    user2 = models.IntegerField()
    winner = models.IntegerField()
    istournament = models.BooleanField(default=False)
    tournamentid = models.IntegerField()
    def __str__(self):
        return f"Game {self.id} between {self.user1} and {self.user2} on {self.date}"
