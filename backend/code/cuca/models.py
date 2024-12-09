from django.db import models
from django.core.validators import MinValueValidator
from datetime import timedelta, date, datetime
from django.contrib.auth.forms import UserCreationForm

class tauxStatus(models.Model):
    statusID = models.AutoField(primary_key=True)
    status = models.CharField(max_length=255)

    def __str__(self):
        return f"Status {self.statusID} is {self.status}"

class tauxGender(models.Model):
    gender = models.AutoField(primary_key=True)
    label = models.CharField(max_length=255)

    def __str__(self):
        return f"Gender {self.gender} is {self.label}"

class tUserExtension(models.Model):
    user = models.IntegerField(null=False)
    birthdate = models.DateField()
    ulevel = models.IntegerField(null=True, blank=True, default=0)
    gender = models.ForeignKey(tauxGender, on_delete=models.PROTECT, null=False)
    avatar = models.CharField(max_length=1000, null=True, blank=True)
    victories = models.IntegerField(null=True, blank=True, default=0)
    totalGamesPlayed = models.IntegerField(null=True, blank=True, default=0)
    tVictories = models.IntegerField(null=True, blank=True, default=0)

    def __str__(self):
        return f"UserExtension {self.user}"

class tTournaments(models.Model): #change is_active para status #create status table
    tournament = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    beginDate = models.DateField()
    endDate = models.DateField()
    creationTS = models.DateField()
    createdByUser = models.IntegerField(null=True, blank=True) #Vai ser uma ForeignKey para tUsersExtension
    winnerUser = models.IntegerField(null=True, blank=True) #Vai ser uma ForeignKey para tUsersExtension
    status = models.ForeignKey(tauxStatus, on_delete=models.PROTECT, null=False, default=1)

    def _str_(self):
        return f"Tournament {self.id} starting on {self.beginDate} until {self.endDate}"

class tGames(models.Model): #resultado do jogo

    game = models.AutoField(primary_key=True)
    creationTS = models.DateTimeField(auto_now_add=True)
    user1 = models.IntegerField() 
    user2 = models.IntegerField(null=True, blank=True)
    winnerUser = models.IntegerField(null=True, blank=True)
    tournament = models.ForeignKey(tTournaments, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.ForeignKey(tauxStatus, on_delete=models.PROTECT, null=False, default=1) 

    def __str__(self):
        return f"Game {self.id} between {self.user1} and {self.user2} on {self.date}"

class  tTournamentUsers(models.Model):
    tournament = models.ForeignKey(tTournaments, on_delete=models.PROTECT, null=False)
    user = models.ForeignKey(tUserExtension, on_delete=models.PROTECT, null=False)
    creationTS = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"User {self.user} in Tournament {self.tournament} on {self.creationTS}"
