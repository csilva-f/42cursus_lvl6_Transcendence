import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny

class GetDateTime(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
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

class PostMyName(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def post(self, request):
        name = request.data.get('name')
        if (name == "rita"):
            return Response("True", status=status.HTTP_200_OK)
        else:
            return Response("False", status=status.HTTP_200_OK)
        
class GetGames(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
        backend_url = 'http://backend:8002/backend/games/'
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

class GetTournaments(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
        backend_url = 'http://backend:8002/backend/tournaments/'
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
        
class PostAddGame(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        backend_url = 'http://backend:8002/backend/create_game/'
        game_data = request.data.get('game')
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            game_data = backend_response.json()
            return Response(game_data, status=backend_response.status_code)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class PostAddTournament(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        backend_url = 'http://backend:8002/backend/create_tournament/'
        tourn_data = request.data.get('tournament')
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            tourn_data = backend_response.json()
            return Response(tourn_data, status=backend_response.status_code)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PostUpdateGame(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        backend_url = 'http://backend:8002/backend/update_game/'
        game_data = request.data.get('game')
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            game_data = backend_response.json()
            return Response(game_data, status=backend_response.status_code)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)  