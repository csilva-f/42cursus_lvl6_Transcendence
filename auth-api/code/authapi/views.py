import requests
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.decorators import action
from wsgiref import headers


#PostRegisterViewSet - Register a new user
# Input Parameters:
    # email: string
    # first_name: string
    # last_name: string
    # password: string
    # phone_number: string
#return in case of success:
    # email: string
    # first_name: string
    # last_name: string
    # phone_number: string

class PostRegisterViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    def create(self, request):
        backend_url = 'http://auth:8000/register/'
        try:
            backend_response = requests.post(backend_url, json=request.data, headers=request.headers)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#PostAuthViewSet - Authenticate a user
# Input Parameters:
    # email: string
    # password: string
#return in case of success:
    # Refresh Token: string
    # Access Token: string

class PostAuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        backend_url = 'http://auth:8000/auth/'
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#PostRefreshViewSet - Refresh the access token
# Input Parameters:
    # refresh: string
    # access: string
#return in case of success:
    # Refresh Token: string
    # Access Token: string
class PostRefreshViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        backend_url = 'http://auth:8000/refresh/'
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#EnableOTPViewSet - Enable OTP for a user
# Input Parameters:
    # userId: integer
#return in case of success:
    # otp_secret: string  <-- to be changed for boolean, or implement QR code authenticator APP
class EnableOTPViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        backend_url = 'http://auth:8000/otp/enable/'
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#SendOTPViewSet - Send OTP to a user
# Input Parameters:
    # userId: integer
#return in case of success:
    # message: string
class SendOTPViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        backend_url = 'http://auth:8000/otp/send/'
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#GetOTPStatusViewSet - Get OTP status for a user
# Input Parameters:
    # userId: integer
#return in case of success:
    # otp_enabled: boolean
class GetOTPStatusViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        backend_url = 'http://auth:8000/otp/get-otp/'
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#VerifyOTPViewSet - Verify OTP for a user
# Input Parameters:
    # userId: integer
    # otp: string
#return in case of success:
    # message: string
class VerifyOTPViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        backend_url = 'http://auth:8000/otp/verify/'
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            print(http_err.response.status_code)
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#VerifyEmailViewSet - Verify Email for a user
# No Input Parameters
class VerifyEmailViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    def create(self, request):
        backend_url = 'http://auth:8000/register/validate-email/'
        try:
            backend_response = requests.get(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetPasswordViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    def create(self, request):
        backend_url = 'http://auth:8000/register/reset-password/'
        try:
            backend_response = requests.get(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RecoverPasswordViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        backend_url = 'http://auth:8000/register/recover-password/'
        try:
            print (request.data)
            headers = {
                'Content-Type': 'application/json',
                'Origin': request.headers['Origin'],
            }
            backend_response = requests.post(backend_url, json=request.data, headers=headers)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ValidateTokenViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    @action(detail=False, methods=['get'], url_path='validate-token')
    def validate_token(self, request):
        backend_url = 'http://auth:8000/register/validate-token/'
        try:
            headers1 = {
                'Content-Type': 'application/json',
                'Authorization': request.headers['Authorization'],
                'Accept': 'application/json',
            }
            backend_response = requests.get(backend_url, json=request.data, headers=headers1)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err.response.text)}"}, status=http_err.response.status_code)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
