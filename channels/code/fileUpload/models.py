from django.db import models
from django.core.exceptions import ValidationError
from django.utils.crypto import get_random_string
import os
from ft_transcendence.settings import MEDIA_ROOT


def validate_filename(filename):
    if '..' in filename or filename.startswith('/'):
        raise ValidationError("Invalid filename: path traversal attempt detected.")

def user_directory_path(instance, filename):
    validate_filename(filename)
    extension = filename.split('.')[-1]
    filename = instance.name+ '.' + extension
    path = os.path.join('', '')
    os.makedirs(os.path.join(MEDIA_ROOT, path), exist_ok=True)
    if os.path.isfile(os.path.join(MEDIA_ROOT, path, filename)):
        os.remove(os.path.join(MEDIA_ROOT, path, filename))
    # Ensure the directory exists

    return os.path.join(path, filename)

# Create your models here.
class ProfileImage(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to=user_directory_path)
    created_at = models.DateTimeField(auto_now_add=True) # Specify a directory for uploaded images
    def __str__(self):
        return self.name
