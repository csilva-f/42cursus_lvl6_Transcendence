from datetime import datetime
from django.http import JsonResponse
from .models import *
import json
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError

ALLOWED_FILTERS_TOURNAMENT = {'tournamentID', 'statusID', 'name', 'winnerID'}

ALLOWED_FILTERS_GAMES = {'statusID', 'gameID', 'user1ID', 'user2ID', 'winnerID', 'tournamentID'}

def validate_filters_tournament(request):
    extra_keys = set(request.GET.keys()) - ALLOWED_FILTERS_TOURNAMENT
    if extra_keys:
        raise ValidationError(f"Invalid parameter(s): {', '.join(extra_keys)}")
    
    
def validate_filters_games(request):
    extra_keys = set(request.GET.keys()) - ALLOWED_FILTERS_GAMES
    if extra_keys:
        raise ValidationError(f"Invalid parameter(s): {', '.join(extra_keys)}")

def validate_status(status):
    try:
        status_id = int(status)
    except ValueError:
        raise ValidationError("Status must be an integer.")
    if not 1 <= status_id <= 3:
        raise ValidationError("Status must be between 1 and 3.")
    return status_id

def validate_id(id):
    if id == "null":
        return(-1)
    if not id.isdigit():
        raise ValidationError("Tournament ID must be a number.")
    return int(id)

def validate_name(name):
    if len(name) > 255: 
        raise ValidationError("Name must not exceed 255 characters.")
    return name

@csrf_exempt 
def get_games(request):
    try:
        validate_filters_games(request)

        game_id = request.GET.get('gameID')
        status_id = request.GET.get('statusID')
        user1_id = request.GET.get('user1ID')
        user2_id = request.GET.get('user2ID')
        winner_id = request.GET.get('winnerID')
        tournament_id = request.GET.get('tournamentID')

        if game_id == "" or status_id == "" or winner_id == "" or tournament_id == "":
            return JsonResponse({"error": "Filter can't be empty."}, status=400)
        
        games = tGames.objects.all()
        if game_id:
            game_id = validate_id(game_id)
            games = games.filter(game=game_id)
        if status_id:
            status_id = validate_status(status_id)
            games = games.filter(status__statusID=status_id)
        if winner_id:
            winner_id = validate_id(winner_id)
            games = games.filter(winnerUser=winner_id)
        if user1_id:
            user1_id = validate_id(user1_id)
            games = games.filter(user1=user1_id)
        if user2_id:
            user2_id = validate_id(user2_id)
            games = games.filter(user2=user2_id)
        if tournament_id:
            tournament_id = validate_id(tournament_id)
            if tournament_id == -1:
                games = games.filter(tournament__tournament__isnull=True)
            else:
                games = games.filter(tournament__tournament=tournament_id)

    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)
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
    try:
        validate_filters_tournament(request)

        tournament_id = request.GET.get('tournamentID')
        status_id = request.GET.get('statusID')
        name = request.GET.get('name')
        winner_id = request.GET.get('winnerID')

        if name == "" or status_id == "" or winner_id == "" or tournament_id == "":
            return JsonResponse({"error": "Filter can't be empty."}, status=400)
        tournaments = tTournaments.objects.all()

        if tournament_id:
            tournament_id = validate_id(tournament_id)
            tournaments = tournaments.filter(tournament=tournament_id)
        if status_id:
            status_id = validate_status(status_id)
            tournaments = tournaments.filter(status__statusID=status_id)
        if name:
            name = validate_name(name)
            tournaments = tournaments.filter(name=name)
        if winner_id:
            winner_id = validate_id(winner_id)
            tournaments = tournaments.filter(winnerUser=winner_id)

    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)

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
            user1_id = data.get('user1ID')
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
                status = validate_status(status)
                if status == 3:
                    game.status_id = status
                    game.save()
                    return JsonResponse({"message": "Game updated successfully, forced finished was performed", "game_id": game.game}, status=201)
                return JsonResponse({"error": "Override status only allowed for finished"}, status=400)
            if not user2_id and not winner_id:
                return JsonResponse({"error": "User2 ID or Winner are required for update"}, status=400)
            if user2_id is not None and user2_id == game.user1:
                return JsonResponse({"error": "User2 must be different from User1"}, status=400)
            if winner_id is not None and winner_id not in [game.user1, game.user2]:
                return JsonResponse({"error": "Winner must be either User1 or User2"}, status=400)
            if winner_id is not None:
                game.winnerUser = winner_id
                game.status_id = 3
            else:
                game.user2 = user2_id
                game.status_id = 2
            game.save()
            # if status_label:
            #     try:
            #         status = tauxStatus.objects.get(status=status_label)
            #         game.statusID = status
            #     except tauxStatus.DoesNotExist:
            #         return JsonResponse({"error": f"Status '{status_label}' not found"}, status=404)
            return JsonResponse({"message": "Game updated successfully", "game_id": game.game}, status=201)
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

def get_status(request):
    status_data = [
        {
            'id': status.statusID,
            'label': status.status
        }
        for status in tauxStatus.objects.all()
    ]
    return JsonResponse({'status': status_data}, safe=False)

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
