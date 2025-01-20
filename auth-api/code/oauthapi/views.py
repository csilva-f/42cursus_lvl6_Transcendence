from rest_framework import viewsets, status
from rest_framework.response import Response
from django.conf import settings
import requests
from django.shortcuts import redirect
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.permissions import AllowAny


class OAuthViewSetLogin(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        print ("OAuthViewSetLogin")
        backend_url = 'http://auth:8000/oauth/login/'
        try:
            print (request.data)
            headers = {
                'Content-Type': 'application/json',
                'Origin': request.headers['Origin'],
            }
            backend_response = requests.get(backend_url, json=request.data, headers=headers)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OAuthViewSetCallback(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def retrieve(self, request):
        backend_url = 'http://auth:8000/oauth/callback/'
        try:
            headers = {
                'Content-Type': 'application/json',
                'Origin': request.headers.get('Origin', ''),
            }
            # Use requests.get with params to send query parameters
            backend_response = requests.get(backend_url, headers=headers, params=request.query_params)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OAuthViewSetOAuthLogin(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        print ("OAuthViewSetLogin")
        backend_url = 'http://auth:8000/oauth/oauthlogin/'
        try:
            print (request.data)
            headers = {
                'Content-Type': 'application/json',
                'Origin': request.headers['Origin'],
            }
            backend_response = requests.get(backend_url, json=request.data, headers=headers)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
