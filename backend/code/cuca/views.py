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

class backendView(APIView):
    permission_classes = [AllowAny]
    def get(self, request): #change logic to commented stuf; handle null statusID
        status_id = request.query_params.get('statusID', None)
        if not status_id:
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
                for game in tGames.objects.select_related('tournament', 'statusID')  # Make sure statusID and tournament are retrieved with the game
            ]
            return Response({'games': games_data}, status=status.HTTP_200_OK)
        try:
            status_id = int(status_id)
        except ValueError:
            return Response({'error': 'Invalid status value.'}, status=status.HTTP_400_BAD_REQUEST)
        if status_id > 3 or status_id < 1:
            return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        #game_data = tGames.objects.select_related('tournament', 'statusID').filter(statusID=status)
        #game_data = serializers.serialize('json', game_data)

        games_data = [
            {
                'id': game.id,
                'date': game.date.strftime("%Y-%m-%d %H:%M:%S"),
                'user1': game.user1,
                'user2': game.user2,
                'winner': game.winner,
                'statusID': game.statusID.statusID,
                'status': game.statusID.status,
                'is_tournament': game.istournament,
                'tournament_id': game.tournament.id if game.tournament else None
            }
            for game in tGames.objects.select_related('tournament', 'statusID').filter(statusID=status_id)  # Make sure statusID and tournament are retrieved with the game
        ]
        return Response({'games': games_data}, status=status.HTTP_200_OK)

def get_tournaments(request):
    tournament_id = request.GET.get('id')
    status = request.GET.get('status')
    name = request.GET.get('name')

    tournaments = tTournaments.objects.all()

    if tournament_id:
        tournaments = tournaments.filter(tournament=tournament_id)
    if status:
        tournaments = tournaments.filter(status=status)
    if name:
        tournaments = tournaments.filter(name__icontains=name)

    tournaments_data = [
        {
            'tournament': tournament.tournament,
            'name': tournament.name,
            'beginDate': tournament.beginDate.strftime("%Y-%m-%d"),
            'endDate': tournament.endDate.strftime("%Y-%m-%d"),
            'winnerUser': tournament.winnerUser,
            'statusID': tournament.status.statusID, 
            'status': tournament.status.status  # assuming status has an id
        }
        for tournament in tournaments
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
            init = tourn_data.get('beginDate')
            end = tourn_data.get('endDate')
            save_name = data.get('name')
            if not save_name:
                save_name = "random_stuff"
            created = data.get('createdByUser')
            creation = date.today()
            if not init or not end:
                return JsonResponse({"error": "init and end dates are required"}, status=400)
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
                creationTS = creation,
                createdByUser = created
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
            game_id = data.get('id')
            if not game_id:
                return JsonResponse({"error": "Game ID is required for update"}, status=400)
            try:
                game = tGames.objects.get(id=game_id)
            except tGames.DoesNotExist:
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
                status_label = "Finished"
            else:
                game.user2 = user2_id
                status_label = "Happening"
            if status_label:
                try:
                    status = tauxStatus.objects.get(status=status_label)
                    game.statusID = status
                except tauxStatus.DoesNotExist:
                    return JsonResponse({"error": f"Status '{status_label}' not found"}, status=404)
            game.save()
            return JsonResponse({"message": "Game updated successfully", "game_id": game.id}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def post_create_userextension(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            user_id = data.get('id')
            user_birthdate = data.get('birthdate')
            gender_id = data.get('genderid')
            user_avatar = data.get('avatar')

            if not user_id or not user_birthdate or not gender_id:
                return JsonResponse({"error": "Missing required fields: id, birthdate, genderid"}, status=400)

            try:
                gender = tauxGender.objects.get(gender=gender_id)
            except tauxGender.DoesNotExist:
                return JsonResponse({"error": f"Gender with id {gender_id} does not exist"}, status=404)

            # Create the UserExtension object
            userext = tUserExtension.objects.create(
                user=user_id,
                birthdate=user_birthdate,
                gender=gender,
                avatar=user_avatar
            )

            return JsonResponse({"message": "User extension created successfully", "user_id": userext.user}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    # If method is not POST, return 405 Method Not Allowed
    return JsonResponse({"error": "Invalid request method"}, status=405)


def get_genders(request):
    gender_data = [
        {
            'id': gender.gender,
            'label': gender.label
        }
        for gender in tauxGender.objects.all()
    ]
    return JsonResponse({'genders': gender_data}, safe=False)

def get_userextensions(request):
    userext_data = [
        {
            'id': userext.user,
            'birthdate': userext.birthdate.strftime("%Y-%m-%d"),
            'gender': userext.gender.label,
            'level': userext.ulevel,
            'avatar': userext.avatar,
            'victories': userext.victories,
            'totalGamesPlayed': userext.totalGamesPlayed,
            'tVictories': userext.tVictories
        }
        for userext in tUserExtension.objects.all()
    ]
    
    return JsonResponse({'users': userext_data}, safe=False)