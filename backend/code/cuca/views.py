from datetime import datetime
from django.http import JsonResponse
from .models import *
import json
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.views import APIView


def get_current_datetime(request):
    current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return JsonResponse({'current_datetime': current_datetime})

@csrf_exempt 
def get_games(request):
    status = request.GET.get('statusID')

    games = tGames.objects.all()

    if status:
        try:
            status_id = int(status)
        except ValueError:
            return JsonResponse({"error": "Invalid status value."}, status=400)
        if status_id > 3 or status_id < 1:
            return JsonResponse({"error": "Invalid status."}, status=400)
        games = games.filter(status=status)

    games_data = [
        {
            'gameID': game.game,
            'creationTS': game.creationTS.strftime("%Y-%m-%d %H:%M:%S"),
            'user1ID': game.user1,
            'user2ID': game.user2,
            'winnerUserID': game.winnerUser,
            'statusID': game.status.statusID,  # Accessing the status of the related tauxStatus
            'status': game.status.status,
            'tournamentID': game.tournament.id if game.tournament else None
        }
        for game in games
    ]
    return JsonResponse({"games": games_data}, status=200)

#validar os filtros (se tiver filtro com key que nao existe - dar erro)
@csrf_exempt 
def get_tournaments(request):
    tournament_id = request.GET.get('tournamentID')
    status = request.GET.get('statusID')
    name = request.GET.get('name')

    tournaments = tTournaments.objects.all()

    if tournament_id:
        tournaments = tournaments.filter(tournament=tournament_id)
    if status:
        try:
            status_id = int(status)
        except ValueError:
            return JsonResponse({"error": "Invalid status value."}, status=400)
        if status_id > 3 or status_id < 1:
            return JsonResponse({"error": "Invalid status."}, status=400)
        tournaments = tournaments.filter(status=status)
    if name:
        tournaments = tournaments.filter(name__icontains=name)

    tournaments_data = [
        {
            'tournamentID': tournament.tournament,
            'name': tournament.name,
            'beginDate': tournament.beginDate.strftime("%Y-%m-%d"),
            'endDate': tournament.endDate.strftime("%Y-%m-%d"),
            'winnerUserID': tournament.winnerUser,
            'statusID': tournament.status.statusID, 
            'status': tournament.status.status,
        }
        for tournament in tournaments
    ]
    
    return JsonResponse({'tournaments': tournaments_data}, safe=False)

@csrf_exempt  # Remove this decorator for production to enforce CSRF protection
def post_create_game(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user1_id = data.get('user1')
            if not user1_id:
                return JsonResponse({"error": "User1 ID is required"}, status=400)
            tournament_id = data.get('tournamentid')
            creation_ts = date.today()

            game = tGames.objects.create(
                user1=user1_id,
                tournament=tournament_id
            )
            return JsonResponse({"message": "Game created successfully", "game_id": game.game}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

#validar torneios com status 1 ou 2 com nomes iguais
#substituir random_stuff pelo randomizer (que tem que validar os nomes against torneios com status 1 ou 2)
@csrf_exempt
def post_create_tournament(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            init_str = data.get('beginDate')
            end_str = data.get('endDate')
            save_name = data.get('name')
            if save_name is None: #validates missing key
                save_name = "random_stuff"
            if not save_name:  #validates empty value
                return JsonResponse({"error": "name can't be empty"}, status=400)
            created_by = data.get('createdByUser')
            creation_ts = date.today()
            if not init_str or init_str is None or not end_str or end_str is None: #validates missing key and empty value
                return JsonResponse({"error": "init and end dates are required"}, status=400)
            try:
                init = datetime.strptime(init_str, "%Y-%m-%d").date()
                end = datetime.strptime(end_str, "%Y-%m-%d").date()
            except ValueError: 
                return JsonResponse({"error": "Date is wrongly formatted. Use YYYY-MM-DD."}, status=400)
            if init < date.today() or end < date.today():
                return JsonResponse({"error": "begin and end dates must be present or future"}, status=400)
            if init > end:
                return JsonResponse({"error": "init date must be prior to end date"}, status=400)
            elif init == end:
                now = datetime.now()
                end_of_day = datetime.combine(datetime.today(), datetime.max.time())
                time_left = end_of_day - now
                if time_left < timedelta(hours = 2):
                    return JsonResponse({"error": "There's not enough time to host a tournament today"}, status=400)
            tournament = tTournaments.objects.create(
                name = save_name,
                beginDate=init,
                endDate=end,
                creationTS = creation_ts,
                createdByUser = created_by
            )
            return JsonResponse({"message": "Tournament created successfully", "tournament_id": tournament.tournament}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def post_update_game(request): #update statusID acording to user2 and winner vars
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            game_id = data.get('gameID')
            if not game_id:
                return JsonResponse({"error": "Game ID is required for update"}, status=400)
            try:
                game = tGames.objects.get(game=game_id)
            except tGames.DoesNotExist:
                return JsonResponse({"error": "Game not found"}, status=404)
            user2_id = data.get('user2ID')
            winner_id = data.get('winnerUserID')
            status = data.get('statusID')
            if status is not None:
                try:
                    status_id = int(status)
                except ValueError:
                    return JsonResponse({"error": "Invalid status value."}, status=400)
                if status_id > 3 or status_id < 1:
                    return JsonResponse({"error": "Invalid status."}, status=400)
                if status_id < 1 or status_id > 3:
                    return JsonResponse({"error": "status ID value must be a valid number between 1 and 3"}, status=400)
            if not user2_id and not winner_id:
                return JsonResponse({"error": "User2 ID or Winner are required for update"}, status=400)
            if user2_id is not None and user2_id == game.user1:
                return JsonResponse({"error": "User2 must be different from User1"}, status=400)
            if winner_id is not None and winner_id not in [game.user1, game.user2]:
                return JsonResponse({"error": "Winner must be either User1 or User2"}, status=400)

            if winner_id is not None:
                game.winner = winner_id
            else:
                game.user2 = user2_id
            game.save()
            return JsonResponse({"message": "Game updated successfully", "game_id": game.game}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)









