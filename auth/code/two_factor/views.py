from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail
import pyotp
from cuca.models import CucaUser  # Adjust the import based on your project structure
from .serializer import UserIdSerializer, OTPSerializer
import requests
import jwt

class Enable2FAView(generics.GenericAPIView):
    serializer_class = UserIdSerializer
    #permission_classes = [AllowAny]
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data['userId']
        try:
            user = CucaUser.objects.get(id=user_id)
        except CucaUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        if request.data['status'] in [0,1,2]:
            secret = pyotp.random_base32()
            user.otp_secret = secret
            user.is_2fa_enabled = request.data['status']
            user.save()
            if request.data['status'] == 0:
                return Response({'message': '2FA disabled successfully.'}, status=status.HTTP_200_OK)
            return Response({'otpauth_uri': f"otpauth://totp/CucaBeludo:{user.email}?secret={secret}&issuer=CucaBeludo"}, status=status.HTTP_201_CREATED)
            #return Response({'otp_secret': secret}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'Invalid request.'}, status=status.HTTP_400_BAD_REQUEST)

class SendOTPView(generics.GenericAPIView):
    serializer_class = UserIdSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        token = request.data["jwtToken"]
        payload = jwt.decode(token,'django-insecure-@www2r)nc-li_empd8(e()gc592l7wau$zn%y#2*ej)u^xb*(0',algorithms=['HS256'])
        user_id = payload['user_id']
        serializer = self.get_serializer(data=user_id)
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
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        print(request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        print(request.data)
        otp = serializer.validated_data['code']
        totp = pyotp.TOTP(request.user.otp_secret)
        if totp.verify(otp, valid_window=3):
            return Response({'message': 'OTP verified successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid OTP code'}, status=status.HTTP_401_UNAUTHORIZED)

class GetOtpStatus(APIView):
    serializer_class = UserIdSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        token = request.data["jwtToken"]
        print(token)
        payload = jwt.decode(token,'django-insecure-@www2r)nc-li_empd8(e()gc592l7wau$zn%y#2*ej)u^xb*(0',algorithms=['HS256'])
        print(payload)
        user_id = payload['user_id']
        try:
            user = CucaUser.objects.get(id=user_id)
        except CucaUser.DoesNotExist:
            print(f'User not found with id {user_id}')
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'is_2fa_enabled': user.is_2fa_enabled}, status=status.HTTP_200_OK)
