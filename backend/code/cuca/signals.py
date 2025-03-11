# yourapp/signals.py

from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import tauxStatus, tauxGender, tauxPhase, tauxFriendshipStatus, tUserExtension

@receiver(post_migrate)
def load_initial_data(sender, **kwargs):
    if sender.name == 'cuca':  # Ensure this runs only for your app
        if not tauxStatus.objects.exists():
            tauxStatus.objects.create(status="Searching")
            tauxStatus.objects.create(status="Happening")
            tauxStatus.objects.create(status="Finished") # Ensure this runs only for your app

        if not tauxGender.objects.exists():
            tauxGender.objects.create(label="Male")
            tauxGender.objects.create(label="Female")
            tauxGender.objects.create(label="Other")

        if not tauxPhase.objects.exists():
            tauxPhase.objects.create(label="Quarter final")
            tauxPhase.objects.create(label="Semi final")
            tauxPhase.objects.create(label="Final")

        if not tauxFriendshipStatus.objects.exists():
            tauxFriendshipStatus.objects.create(label="RequestSent")
            tauxFriendshipStatus.objects.create(label="Friends")
            tauxFriendshipStatus.objects.create(label="NotFriends")

        if not tUserExtension.objects.exists():
            tUserExtension.objects.create(user=-1, nick="Guest")
