from django.db import models
from django.core.validators import MinValueValidator
from datetime import timedelta, date
from django.contrib.auth.models import User
from django import forms
from django.contrib.auth.forms import UserCreationForm

# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.PROTECT)
    victories = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    losses = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])

    def __str__(self):
        return f"{self.user.username}'s Profile"

class CustomUserCreationForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=True, help_text='Required')
    last_name = forms.CharField(max_length=30, required=True, help_text='Required')
    email = forms.EmailField(max_length=254, required=True, help_text='Required')

    class Meta:
        model = User
        fields = (
            'username', 
            'first_name', 
            'last_name', 
            'email', 
            'password1', 
            'password2'
            )

class Tournments(models.Model):
    id = models.AutoField(primary_key=True)
    init_date = models.DateField()
    duration = models.PositiveIntegerField()
    end_date = models.DateField(editable=False)
    winner = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, related_name='tournaments_won')
    is_active = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.init_date and self.duration:
            self.end_date = self.init_date + timedelta(days=self.duration)

        current_date = date.today()
        self.is_active = self.init_date <= current_date <= self.end_date

        super().save(*args, **kwargs)

    class Meta:
        db_table = 'TOURNMENTS'

    def __str__(self):
        return f"Tournament {self.id} starting on {self.init_date} for {self.duration} days"

class Games(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    user1 = models.ForeignKey(User, on_delete=models.PROTECT, related_name='games_as_user1')
    user2 = models.ForeignKey(User, on_delete=models.PROTECT, related_name='games_as_user2')
    winner = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, related_name='games_won')
    is_tournment = models.BooleanField(default=False)
    tournment = models.ForeignKey(Tournments, on_delete=models.PROTECT, null=True, blank=True, related_name='tournments')

    class Meta:
        db_table = 'GAMES'

    def __str__(self):
        return f"Game {self.id} between {self.user1} and {self.user2} on {self.date}"