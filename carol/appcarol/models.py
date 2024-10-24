from django.db import models

# Create your models here.

class User(models.Model):
    id = models.AutoField(primary_key=True)  # Auto-incrementing ID
    name = models.CharField(max_length=255)  # Name of the user
    username = models.CharField(max_length=150, unique=True)  # Username, must be unique
    password = models.CharField(max_length=255)  # Password
    created_at = models.DateTimeField(auto_now_add=True)  # Automatically set the date when created
    updated_at = models.DateTimeField(auto_now=True)  # Automatically update the date when changed
    last_login = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'USERS'  # Specify custom table name

    def __str__(self):
        return self.username
