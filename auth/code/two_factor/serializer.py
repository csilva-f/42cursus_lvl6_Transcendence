#from django.contrib.auth.models import User
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError

class UserIdSerializer(serializers.Serializer):
    userId = serializers.IntegerField()

class OTPSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)
