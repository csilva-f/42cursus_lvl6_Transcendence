from datetime import datetime
from django.http import JsonResponse
from .models import *
import json
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers

def get_current_datetime(request):
    current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return JsonResponse({'current_datetime': current_datetime})

def get_games(request): #change logic to commented stuf; handle null statusID
    status = request.GET.get('statusID')
    #game_data = tGames.objects.select_related('tournament', 'statusID').filter(statusID=status)
    #game_data = serializers.serialize('json', game_data)
    games_data = [
        {
            'id': game.id,
            'date': game.date.strftime("%Y-%m-%d %H:%M:%S"),
            'user1': game.user1,
            'user2': game.user2,
            'winner': game.winner,
            'statusID': game.statusID.statusID,  # Accessing the status of the related tauxStatus
            'status': game.statusID.status,
            'is_tournament': game.istournament,
            'tournament_id': game.tournament.id if game.tournament else None
        }
        for game in tGames.objects.select_related('tournament', 'statusID').filter(statusID=status)  # Make sure statusID and tournament are retrieved with the game
    ]
    return JsonResponse({'games': games_data}, safe=False)

def get_tournaments(request):
    tournaments_data = [
        {
            'id': tournament.id,
            'init_date': tournament.init_date.strftime("%Y-%m-%d"),
            'end_date': tournament.end_date.strftime("%Y-%m-%d"),
            'winner': tournament.winner,
            'is_active': tournament.is_active
        }
        for tournament in Tournaments.objects.all()
    ]
    return JsonResponse({'tournaments': tournaments_data}, safe=False)

@csrf_exempt  # Remove this decorator for production to enforce CSRF protection
def post_create_game(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            game_data = data.get('game')
            user1_id = game_data.get('user1')
            if not user1_id:
                return JsonResponse({"error": "User1 ID is required"}, status=400)
            user2_id = game_data.get('user2')
            winner_id = game_data.get('winner')
            tournament_id = game_data.get('tournamentid')
            is_tournament = True if tournament_id else False

            game = tGames.objects.create(
                user1=user1_id,
                user2=user2_id,
                winner=winner_id,
                istournament=is_tournament,
                tournament=tournament_id
            )
            return JsonResponse({"message": "Game created successfully", "game_id": game.id}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def post_create_tournament(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            tourn_data = data.get('tournament')
            init = tourn_data.get('init_date')
            end = tourn_data.get('end_date')
            if not init or not end:
                return JsonResponse({"error": "init and end dates are required"}, status=400)
            if init >= end:
                return JsonResponse({"error": "init date must be prior to end date"}, status=400)
            elif init == end:
                now = datetime.now()
                end_of_day = datetime.combine(datetime.today(), datetime.max.time())
                time_left = end_of_day - now
                if time_left < timedelta(hours = 2):
                    return JsonResponse({"error": "There's not enough time to host a tournament today"}, status=400)
            winner = tourn_data.get('winner')
            isactive = tourn_data.get('is_active')

            tournament = Tournaments.objects.create(
                init_date=init,
                end_date=end,
                winner=winner,
                is_active=isactive
            )
            return JsonResponse({"message": "Tournament created successfully", "tournament_id": tournament.id}, status=201)
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
            game_id = data.get('id')
            if not game_id:
                return JsonResponse({"error": "Game ID is required for update"}, status=400)
            try:
                game = Games.objects.get(id=game_id)
            except Games.DoesNotExist:
                return JsonResponse({"error": "Game not found"}, status=404)
            
            user2_id = data.get('user')
            winner_id = data.get('winner')
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
            return JsonResponse({"message": "Game updated successfully", "game_id": game.id}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)