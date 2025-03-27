from django.db import models
from django.core.validators import MinValueValidator
from datetime import timedelta, date, datetime
from django.utils.timezone import now 
from django.contrib.auth.forms import UserCreationForm
from decimal import Decimal

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

class tauxPhase(models.Model):
    phase = models.AutoField(primary_key=True)
    label = models.CharField(max_length=255)

    def __str__(self):
        return f"Phase {self.phase} is {self.label}"

class tauxFriendshipStatus(models.Model):
    status = models.AutoField(primary_key=True)
    label = models.CharField(max_length=255)

    def __str__(self):
        return f"Friendship status {self.status} is {self.label}"
    
class tUserExtension(models.Model):
    user = models.IntegerField(primary_key=True, null=False, unique=True)
    nick = models.CharField(max_length=20, null=True, blank=True)
    birthdate = models.DateField(null=True, blank=True)
    ulevel = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, default=Decimal("0.00"))
    gender = models.ForeignKey(tauxGender, on_delete=models.PROTECT, null=True)
    avatar = models.CharField(max_length=1000, null=True, blank=True)
    bio = models.CharField(max_length=2000, null=True, blank=True)

    def __str__(self):
        return f"UserExtension {self.user}"

class tTournaments(models.Model):
    tournament = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    beginDate = models.DateField(null=True, blank=True)
    endDate = models.DateField(null=True, blank=True)
    creationTS = models.DateField()
    createdByUser = models.IntegerField(null=True, blank=True)
    winnerUser = models.IntegerField(null=True, blank=True)
    status = models.ForeignKey(tauxStatus, on_delete=models.PROTECT, null=False, default=1)
    nick1 = models.CharField(null=True, blank=True, max_length=255)
    nick2 = models.CharField(null=True, blank=True, max_length=255)
    nick3 = models.CharField(null=True, blank=True, max_length=255)
    nick4 = models.CharField(null=True, blank=True, max_length=255)

    def _str_(self):
        return f"Tournament {self.id} starting on {self.beginDate} until {self.endDate}"

class tGames(models.Model):
    game = models.AutoField(primary_key=True)
    creationTS = models.DateTimeField(auto_now_add=True)
    startTS = models.DateTimeField(null=True, blank=True)
    endTS = models.DateTimeField(null=True, blank=True)
    user1 = models.IntegerField(null=True, blank=True)
    user2 = models.IntegerField(null=True, blank=True)
    user1_points = models.IntegerField(null=True, blank=True)
    user2_points = models.IntegerField(null=True, blank=True)
    user1_hits = models.IntegerField(null=True, blank=True)
    user2_hits = models.IntegerField(null=True, blank=True)
    user1_nick = models.CharField(null=True, blank=True, max_length=255)
    user2_nick = models.CharField(null=True, blank=True, max_length=255)
    isLocal = models.BooleanField(default=True)
    isInvitation = models.BooleanField(default=False)
    isInvitAccepted = models.BooleanField(default=False)
    winnerUser = models.IntegerField(null=True, blank=True)
    tournament = models.ForeignKey(tTournaments, on_delete=models.SET_NULL, null=True, blank=True)
    phase = models.ForeignKey(tauxPhase, on_delete=models.PROTECT, null=True, blank=True) 
    status = models.ForeignKey(tauxStatus, on_delete=models.PROTECT, null=False, default=1)

    def __str__(self):
        return f"Game {self.id} between {self.user1} and {self.user2} on {self.date}"

class  tTournamentUsers(models.Model):
    tournament = models.ForeignKey(tTournaments, on_delete=models.PROTECT, null=False)
    user = models.ForeignKey(tUserExtension, on_delete=models.PROTECT, null=False)
    creationTS = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"User {self.user} in Tournament {self.tournament} on {self.creationTS}"

class tFriends(models.Model):
    user1 = models.ForeignKey(tUserExtension, on_delete=models.PROTECT, null=True, blank=True, related_name="friend1")
    user2 = models.ForeignKey(tUserExtension, on_delete=models.PROTECT, null=True, blank=True, related_name="friend2")
    requester = models.ForeignKey(tUserExtension, on_delete=models.PROTECT, null=True, blank=True, related_name="requester")
    requestStatus = models.ForeignKey(tauxFriendshipStatus, on_delete=models.PROTECT, null=False, default=1)

    def _str_(self):
        return f"Friendship record between {self.user1} and {self.user2} created"