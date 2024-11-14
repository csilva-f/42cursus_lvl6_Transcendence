#from django.contrib.auth.models import User
from .models import CucaUser
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from datetime import datetime

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)

    class Meta:
        model = CucaUser
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if CucaUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already taken.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)  # Use Django's built-in password validation
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        validated_data['username'] = validated_data['email']
        validated_data['created_at'] = datetime.now()
        validated_data['updated_at'] = datetime.now()
        validated_data['is_active'] = True
        validated_data['is_2fa_enabled'] = False
        user = CucaUser(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user


class OTPSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)
