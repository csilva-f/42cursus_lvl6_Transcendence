from rest_framework import viewsets, status
from rest_framework.response import Response
from django.conf import settings
import requests
from django.shortcuts import redirect
from django.http import HttpResponse, HttpResponseRedirect

class OAuthViewSet(viewsets.ViewSet):

    def login(self, request):
        redirect_uri = request.headers['Origin'] + '/callback'
        print(redirect_uri)
        #authorization_url = f"{settings.OAUTH2_PROVIDER['AUTHORIZATION_URL']}?client_id={settings.OAUTH2_PROVIDER['CLIENT_ID']}&redirect_uri={redirect_uri}&response_type=code"
        authorization_url = (
            f"{settings.OAUTH2_PROVIDER['AUTHORIZATION_URL']}?"
            f"client_id={settings.OAUTH2_PROVIDER['CLIENT_ID']}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
        )
        return Response({'url': authorization_url}, status=status.HTTP_200_OK)

    def callback(self, request):
        code = request.GET.get('code')
        token_url = settings.OAUTH2_PROVIDER['TOKEN_URL']
        data = {
            'grant_type': 'authorization_code',
            'client_id': settings.OAUTH2_PROVIDER['CLIENT_ID'],
            'client_secret': settings.OAUTH2_PROVIDER['CLIENT_SECRET'],
            'redirect_uri': 'https://localhost:8000/callback',
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