# authentication.py
import requests
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from authapi.models import CustomUser

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Call the default method to get the token
        try:
            raw_token = request.headers['Authorization']
        except:
            raw_token = ''
        print(f'raw_token: {raw_token}')
        if not raw_token:
            return None
        response = requests.get('http://auth:8000/register/validate-token/', headers={
            'Authorization': f'{raw_token}',
            'content-type': 'application/json',
            'Accept': 'application/json',
        })
        if response.status_code not in (200,201):
            raise AuthenticationFailed('Invalid tokennnnnn')
        # If the token is valid, return the user and token
        user = response.json().get('data')
        user_instance = CustomUser(user_id=user.get('user_id'), username=user.get('username'))
        return (user_instance,raw_token)
