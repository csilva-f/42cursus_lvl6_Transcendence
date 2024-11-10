import requests
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny


class GetDateTimeViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def list(self, request):
        backend_url = 'http://backend:8002/backend/current_datetime/'
        try:
            backend_response = requests.get(backend_url)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HelloWorldViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    def list(self, request):
        return Response({"message": "Hello, World!"})
