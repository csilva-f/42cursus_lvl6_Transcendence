from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail
import pyotp
from cuca.models import CucaUser  # Adjust the import based on your project structure
from .serializer import UserIdSerializer, OTPSerializer
import requests

class Enable2FAView(generics.GenericAPIView):
    serializer_class = UserIdSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data['userId']
        try:
            user = CucaUser.objects.get(id=user_id)
        except CucaUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        secret = pyotp.random_base32()
        user.otp_secret = secret
        user.is_2fa_enabled = True
        user.save()
        return Response({'otp_secret': secret}, status=status.HTTP_201_CREATED)

class SendOTPView(generics.GenericAPIView):
    serializer_class = UserIdSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data['userId']
        try:
            user = CucaUser.objects.get(id=user_id)
        except CucaUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        totp = pyotp.TOTP(user.otp_secret)
        otp = totp.now()
        print(f'Generated OTP for user {user.email}: {otp}')

        response = requests.post('http://email:8000/send_email/', json={
            'subject': 'Your OTP Code',
            'message': f'Your OTP code is {otp}',
            'from_email': 'noreply@cucabeludo.pt',
            'recipient_list': ['bcamarinha92@gmail.com'],
        })
        if response.status_code == 200:
            print('Email sent successfully!')
        else:
            print('Failed to send email:', response.content)
        return Response({'message': 'OTP sent to your email.'}, status=status.HTTP_200_OK)

class VerifyOTPView(generics.GenericAPIView):
    serializer_class = OTPSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        user_id_serializer = UserIdSerializer(data=request.data)
        user_id_serializer.is_valid(raise_exception=True)
        user_id = user_id_serializer.validated_data['userId']
        try:
            user = CucaUser.objects.get(id=user_id)
        except CucaUser.DoesNotExist:
            print(f'User not found with id {user_id}')
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = serializer.validated_data['otp']
        totp = pyotp.TOTP(user.otp_secret)
        if totp.verify(otp, valid_window=3):
            return Response({'message': 'OTP verified successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response('Invalid OTP.', status=status.HTTP_401_UNAUTHORIZED)

class GetOtpStatus(APIView):
    serializer_class = UserIdSerializer
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data['userId']
        try:
            user = CucaUser.objects.get(id=user_id)
        except CucaUser.DoesNotExist:
            print(f'User not found with id {user_id}')
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'is_2fa_enabled': user.is_2fa_enabled}, status=status.HTTP_200_OK)
