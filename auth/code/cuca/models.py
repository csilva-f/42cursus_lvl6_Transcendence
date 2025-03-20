from django.contrib.auth.models import AbstractUser
from django.db import models

class CucaUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_2fa_enabled = models.IntegerField(default=0)
    otp_secret = models.CharField(max_length=32, blank=True, null=True)

    # Explicitly define user_permissions with a unique related_name
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='cuca_user_permissions',  # Change this line to a unique name
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='cuca_user_groups',  # Change this line to a unique name
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email


class PasswordResetToken(models.Model):
    user = models.ForeignKey(CucaUser, on_delete=models.CASCADE)
    token = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
