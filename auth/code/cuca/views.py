from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes,force_str
from django.core.mail import send_mail
from django.urls import reverse
from rest_framework import generics, status, serializers
from rest_framework.response import Response
from .serializer import UserSerializer
from django.contrib.auth.models import User
from .models import CucaUser

class UserCreate(generics.CreateAPIView):
    queryset = CucaUser.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # self.perform_create(serializer)
        user = serializer.save()
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Create the validation link
        validation_link = request.build_absolute_uri(
            reverse('validate_email', kwargs={'uidb64': uid, 'token': token})
        )
        print(validation_link)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ValidateEmailView(generics.GenericAPIView):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CucaUser.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.is_active = True  # Activate the user
                user.save()
                return Response({'message': 'Email validated successfully!'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid token!'}, status=status.HTTP_400_BAD_REQUEST)

        except (TypeError, ValueError, OverflowError, CucaUser.DoesNotExist):
            user = None
            return Response({'error': 'Invalid link!'}, status=status.HTTP_400_BAD_REQUEST)
