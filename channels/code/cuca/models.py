from django.db import models

# Create your models here.
class CustomUser:
    def __init__(self, user_id, username, **kwargs):
        self.user_id = user_id
        self.is_authenticated = True

