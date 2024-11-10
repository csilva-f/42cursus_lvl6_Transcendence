import requests
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny


class PostRegisterViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def create(self, request):
        backend_url = 'http://auth:8000/register/'
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)  # Return 201 for successful creation
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PostAuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def create(self, request):
        backend_url = 'http://auth:8000/auth/'
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)  # Return 201 for successful creation
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PostRefreshViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def create(self, request):
        backend_url = 'http://auth:8000/refresh/'
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_201_CREATED)  # Return 201 for successful creation
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
