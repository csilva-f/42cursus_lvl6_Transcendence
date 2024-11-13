from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
import pyotp
from cuca.models import CucaUser  # Adjust the import based on your project structure
from .serializer import UserIdSerializer, OTPSerializer

class Enable2FAView(generics.GenericAPIView):
    serializer_class = UserIdSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_id = serializer.validated_data['userId']
        user = CucaUser.objects.get(id=user_id)
        secret = pyotp.random_base32()

        # Store the secret in the user's profile
        user.profile.otp_secret = secret
        user.profile.is_2fa_enabled = True
        user.profile.save()

        return Response({'otp_secret': secret}, status=status.HTTP_201_CREATED)

class SendOTPView(generics.GenericAPIView):
    serializer_class = UserIdSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_id = serializer.validated_data['userId']
        user = CucaUser.objects.get(id=user_id)
        totp = pyotp.TOTP(user.profile.otp_secret)
        otp = totp.now()

        # Send OTP via email
        send_mail(
            'Your OTP Code',
            f'Your OTP code is {otp}',
            'from@example.com',
            [user.email],
            fail_silently=False,
        )

        return Response({'message': 'OTP sent to your email.'}, status=status.HTTP_200_OK)

class VerifyOTPView(generics.GenericAPIView):
    serializer_class = OTPSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_id_serializer = UserIdSerializer(data=request.data)
        user_id_serializer.is_valid(raise_exception=True)
        user_id = user_id_serializer.validated_data['userId']
        user = CucaUser.objects.get(id=user_id)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        otp = serializer.validated_data['otp']
        totp = pyotp.TOTP(user.profile.otp_secret)

        if totp.verify(otp):
            return Response({'message': 'OTP verified successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
