from django.db import models
from django.core.validators import MinValueValidator
from datetime import timedelta, date, datetime
from django.contrib.auth.forms import UserCreationForm

class tauxStatus(models.Model):

    statusID = models.AutoField(primary_key=True)
    status = models.CharField(max_length=255)

    def __str__(self):
        return f"Status {self.statusID} is {self.status}"
    
# Create your models here.
class tTournaments(models.Model): #change is_active para status #create status table
    tournament = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    beginDate = models.DateField()
    endDate = models.DateField()
    creationTS = models.DateField()
    createdByUser = models.IntegerField(null=True, blank=True) #Vai ser uma ForeignKey para tUsersExtension
    winnerUser = models.IntegerField(null=True, blank=True) #Vai ser uma ForeignKey para tUsersExtension
    status = models.ForeignKey(tauxStatus, on_delete=models.PROTECT, null=False, default=1)

    def __str__(self):
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
