from django.db import models
from django.core.validators import MinValueValidator
from datetime import timedelta, date, datetime
from django.contrib.auth.forms import UserCreationForm

# Create your models here.
class Tournaments(models.Model):
    id = models.AutoField(primary_key=True)
    init_date = models.DateField()
    end_date = models.DateField()
    winner = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if isinstance(self.init_date, str):
            self.init_date = datetime.strptime(self.init_date, '%Y-%m-%d').date()
        if isinstance(self.end_date, str):
            self.end_date = datetime.strptime(self.end_date, '%Y-%m-%d').date()

        current_date = date.today()
        if self.init_date <= current_date and self.end_date >= current_date:
            self.is_active = True
        else:
            self.is_active = False

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Tournament {self.id} starting on {self.init_date} until {self.end_date}"

class Games(models.Model):

    id = models.AutoField(primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    user1 = models.IntegerField() 
    user2 = models.IntegerField(null=True, blank=True)
    winner = models.IntegerField(null=True, blank=True)
    istournament = models.BooleanField(default=False)
    tournament = models.ForeignKey(Tournaments, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Game {self.id} between {self.user1} and {self.user2} on {self.date}"
    