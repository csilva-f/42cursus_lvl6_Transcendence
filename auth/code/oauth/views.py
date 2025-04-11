from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import requests
from django.shortcuts import redirect
from django.http import HttpResponse, HttpResponseRedirect
from rest_framework_simplejwt.tokens import RefreshToken
from cuca.models import CucaUser

class OAuthViewSet(viewsets.ViewSet):

    redirect_uri = 'https://' + settings.HOST_IP + ':8000/callback'
    def login(self, request):
        #authorization_url = f"{settings.OAUTH2_PROVIDER['AUTHORIZATION_URL']}?client_id={settings.OAUTH2_PROVIDER['CLIENT_ID']}&redirect_uri={redirect_uri}&response_type=code"
        authorization_url = (
            f"{settings.OAUTH2_PROVIDER['AUTHORIZATION_URL']}?"
            f"client_id={settings.OAUTH2_PROVIDER['CLIENT_ID']}&"
            f"redirect_uri={self.redirect_uri}&"
            f"response_type=code&"
        )
        return Response({'url': authorization_url}, status=status.HTTP_200_OK)

    def callback(self, request):
        print("tou aqui")
        code = request.GET.get('code')
        print(code)
        token_url = settings.OAUTH2_PROVIDER['TOKEN_URL']
        data = {
            'grant_type': 'authorization_code',
            'client_id': settings.OAUTH2_PROVIDER['CLIENT_ID'],
            'client_secret': settings.OAUTH2_PROVIDER['CLIENT_SECRET'],
            'redirect_uri': self.redirect_uri,
            'code': code,
        }
        response = requests.post(token_url, data=data)
        token_data = response.json()

        if 'access_token' in token_data:
            # Use the access token to get user info
            user_info_response = requests.get(settings.OAUTH2_PROVIDER['USER_INFO_URL'], headers={
                'Authorization': f"Bearer {token_data['access_token']}"
            })
            user_info = user_info_response.json()

            # Handle user info (e.g., create or update user in your database)
            # You can also return the user info or a token for your app
            #return HttpResponseRedirect('https://localhost:8000')
            return Response(user_info, status=status.HTTP_200_OK)
        else:
            return Response(token_data, status=status.HTTP_400_BAD_REQUEST)


class OAuthLoginView(APIView):
    def get(self, request):
        user_data = request.data
        print(user_data)
        email = user_data.get('email')
        first_name = user_data.get('first_name')
        last_name = user_data.get('last_name')
        phone = user_data.get('phone')

        # Check if the user exists, if not create a new user
        user, created = CucaUser.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'phone_number': phone,
                'is_active': True,  # Set to True or based on your logic
                'is_2fa_enabled': False,  # Default value
                'username': email,  # Set username to email
            }
        )
        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        return Response({
            #'redirect':  request.headers['Origin'] + '/login',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
