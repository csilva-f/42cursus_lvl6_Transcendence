# authentication.py

import requests
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Call the default method to get the token
        raw_token = request.headers['Authorization']
        #auth = super().authenticate(request)
        #print ("a")
        #if auth is None:
        #    return None  # No token provided or invalid

        # Extract the token
        #raw_token = auth[1]
        print(raw_token)
        if not raw_token:
            return None
        # Make a request to the authentication service to validate the token
        response = requests.get('http://auth-api:8000/authapi/validate-token/', headers={
            'Authorization': f'Bearer {raw_token}'
        })

        if response.status_code != 200:
            raise AuthenticationFailed('Invalid token')

        # If the token is valid, return the user and token
        user = response.json().get('user')
        print(user)
        return (user, raw_token)
