# yourapp/signals.py

from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import tauxStatus

@receiver(post_migrate)
def load_initial_data(sender, **kwargs):
    if sender.name == 'yourapp':  # Ensure this runs only for your app
        if not tauxStatus.objects.exists():
            tauxStatus.objects.create(status="Searching")
            tauxStatus.objects.create(status="Happening")
            tauxStatus.objects.create(status="Finished")
