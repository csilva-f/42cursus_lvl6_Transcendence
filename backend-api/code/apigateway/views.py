import requests
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
        
class GetGames(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
        backend_url = settings.BACKEND_GAMES_URL
        query_params = request.GET.urlencode()
        url_with_params = f"{backend_url}?{query_params}" if query_params else backend_url
        try:
            backend_response = requests.get(url_with_params)
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
        backend_url = settings.BACKEND_TOURNAMENTS_URL
        query_params = request.GET.urlencode()
        url_with_params = f"{backend_url}?{query_params}" if query_params else backend_url
        try:
            backend_response = requests.get(url_with_params)
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
        backend_url = settings.BACKEND_CREATE_TOURNAMENT_URL
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=backend_response.status_code)
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

class PostAddUserExtension(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        backend_url = 'http://backend:8002/backend/create_userextension/'
        user_data = request.data.get('user')
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            user_data = backend_response.json()
            return Response(user_data, status=backend_response.status_code)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetGenders(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
        backend_url = 'http://backend:8002/backend/genders/'
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

class GetStatus(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
        backend_url = 'http://backend:8002/backend/status/'
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
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_400_BAD_REQUEST)

class GetUserExtensions(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
        backend_url = settings.BACKEND_UEXT_URL
        query_params = request.GET.urlencode()
        url_with_params = f"{backend_url}?{query_params}" if query_params else backend_url
        try:
            backend_response = requests.get(url_with_params)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class PostUpdateTournament(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        backend_url = 'http://backend:8002/backend/update_tournament/'
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
        
class GetPhases(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        backend_url = 'http://backend:8002/backend/phases/'
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

class PostJoinTournament(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        backend_url = 'http://backend:8002/backend/join_tournament/'
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

class PostUpdateUserExtension(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        backend_url = 'http://backend:8002/backend/update_userextension/'
        uext_data = request.data.get('userextension')
        try:
            backend_response = requests.post(backend_url, json=request.data)
            backend_response.raise_for_status()
            uext_data = backend_response.json()
            return Response(uext_data, status=backend_response.status_code)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetUserStatistics(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
        backend_url = settings.BACKEND_USTAT_URL
        query_params = request.GET.urlencode()
        url_with_params = f"{backend_url}?{query_params}" if query_params else backend_url
        try:
            backend_response = requests.get(url_with_params)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PostAcceptGameInvit(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        backend_url = 'http://backend:8002/backend/accept_gameinvitation/'
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
        
class GetUserInvitations(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
        backend_url = settings.BACKEND_USINVIT_URL
        query_params = request.GET.urlencode()
        url_with_params = f"{backend_url}?{query_params}" if query_params else backend_url
        try:
            backend_response = requests.get(url_with_params)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetUserNbrInvitations(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
        backend_url = settings.BACKEND_USNBRINVIT_URL
        query_params = request.GET.urlencode()
        url_with_params = f"{backend_url}?{query_params}" if query_params else backend_url
        try:
            backend_response = requests.get(url_with_params)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetUserGames(APIView):
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request):
        backend_url = settings.BACKEND_UGAMES_URL
        query_params = request.GET.urlencode()
        url_with_params = f"{backend_url}?{query_params}" if query_params else backend_url
        try:
            backend_response = requests.get(url_with_params)
            backend_response.raise_for_status()
            data = backend_response.json()
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.HTTPError as http_err:
            return Response({"error": f"HTTP error occurred: {str(http_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as req_err:
            return Response({"error": f"Request error occurred: {str(req_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as json_err:
            return Response({"error": f"JSON decoding error: {str(json_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)