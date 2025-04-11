from django.core.management.base import BaseCommand
from django.core.management import call_command
import time

class Command(BaseCommand):
    help = 'Run the send_mail command every 5 seconds'

    def handle(self, *args, **kwargs):
        while True:
            call_command('send_mail')
            time.sleep(5)  # Wait for 5 seconds
