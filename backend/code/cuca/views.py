from datetime import datetime
from django.http import JsonResponse
from .models import *
import json
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.db import transaction

ALLOWED_FILTERS_TOURNAMENT = {'tournamentID', 'statusID', 'name', 'winnerID'}

ALLOWED_FILTERS_GAMES = {'statusID', 'gameID', 'user1ID', 'user2ID', 'winnerID', 'tournamentID'}

ALLOWED_FILTERS_UEXT = {'userID'}

def validate_filters_tournament(request):
    extra_keys = set(request.GET.keys()) - ALLOWED_FILTERS_TOURNAMENT
    if extra_keys:
        raise ValidationError(f"Invalid parameter(s): {', '.join(extra_keys)}")
    
    
def validate_filters_games(request):
    extra_keys = set(request.GET.keys()) - ALLOWED_FILTERS_GAMES
    if extra_keys:
        raise ValidationError(f"Invalid parameter(s): {', '.join(extra_keys)}")

def validate_filters_uext(request):
    extra_keys = set(request.GET.keys()) - ALLOWED_FILTERS_UEXT
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
        raise ValidationError("ID must be a number.")
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
            'statusID': game.status.statusID,
            'status': game.status.status,
            'tournamentID': game.tournament.tournament if game.tournament else None,
            'phaseID': game.phase.phase if game.phase else None,
            'phase': game.phase.label if game.phase else None
        }
        for game in games
    ]
    return JsonResponse({"games": games_data}, status=200)

#validar os filtros (se tiver filtro com key que nao existe - dar erro)
@csrf_exempt 
def get_tournaments(request):
    try:
        today = date.today()
        past_tournaments = tTournaments.objects.filter(endDate__lt=today)
        for tournament in past_tournaments:
            tournament.status_id = 3
            tournament.save()
            tGames.objects.filter(tournament=tournament).update(status_id=3)

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
            print(user1_id)
            if not user1_id:
                return JsonResponse({"error": "User1 ID is required"}, status=400)
            if not tUserExtension.objects.filter(user=user1_id).exists():
                return JsonResponse({"error": f"User1 ID {user1_id} does not exist in tUserExtension"}, status=404)

            tournament_id = data.get('tournamentid')
            glocal = glocal = str(data.get('islocal')).lower() in ['true', '1', 'yes']
            gstatus = 1 if not glocal else 2
            try:
                status_instance = tauxStatus.objects.get(statusID=gstatus)  # Busca a instância de tauxStatus
            except tauxStatus.DoesNotExist:
                return JsonResponse({"error": f"Status ID {gstatus} does not exist in tauxStatus"}, status=404)
            user2_id = None
            if glocal:
                user2_id = data.get('user2ID')
                if not user2_id:
                    return JsonResponse({"error": "User2 ID is required for local game"}, status=400)
                if not tUserExtension.objects.filter(user=user2_id).exists():
                    return JsonResponse({"error": f"User2 ID {user2_id} does not exist in tUserExtension"}, status=404)
                if user2_id == user1_id:
                    return JsonResponse({"error": "User2 cannot be the same as User1"}, status=400)

            game = tGames.objects.create(
                user1=user1_id,
                user2=user2_id,
                tournament=tournament_id,
                status=status_instance,
                isLocal=glocal
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
            if not created_by:
                return JsonResponse({"error": "Created by user ID is required"}, status=400)
            if not tUserExtension.objects.filter(user=created_by).exists():
                return JsonResponse({"error": f"User ID {created_by} does not exist in tUserExtension"}, status=404)
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
            with transaction.atomic():
                tournament = tTournaments.objects.create(
                    name = save_name,
                    beginDate=init,
                    endDate=end,
                    creationTS = creation_ts,
                    createdByUser = created_by
                )
                phase1 = tauxPhase.objects.get(phase=1)
                phase2 = tauxPhase.objects.get(phase=2)
                phase3 = tauxPhase.objects.get(phase=3)
                games = []
                for i in range(7):
                    if i < 4:
                        gphase = phase1
                    elif i < 6:
                        gphase = phase2
                    else:
                        gphase = phase3
                    games.append(tGames(
                        tournament=tournament,
                        status_id=1,
                        isLocal=False,
                        phase=gphase
                    ))
                tGames.objects.bulk_create(games)
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
            if user2_id is not None and not tUserExtension.objects.filter(user=user2_id).exists():
                return JsonResponse({"error": f"User2 ID {user2_id} does not exist in tUserExtension"}, status=404)
            if winner_id is not None and winner_id not in [game.user1, game.user2]:
                return JsonResponse({"error": "Winner must be either User1 or User2"}, status=400)
            if winner_id is not None:
                game.winnerUser = winner_id
                game.status_id = 3

                tUserExtension.objects.filter(user=winner_id).update(victories=models.F('victories') + 1)
                tUserExtension.objects.filter(user=game.user1).update(totalGamesPlayed=models.F('totalGamesPlayed') + 1)
                tUserExtension.objects.filter(user=game.user2).update(totalGamesPlayed=models.F('totalGamesPlayed') + 1)
                if game.user1 == winner_id:
                    tUserExtension.objects.filter(user=game.user1).update(ulevel=models.F('ulevel') + 0.2)
                    tUserExtension.objects.filter(user=game.user2).update(ulevel=models.F('ulevel') + 0.05)
                else:
                    tUserExtension.objects.filter(user=game.user1).update(ulevel=models.F('ulevel') + 0.05)
                    tUserExtension.objects.filter(user=game.user2).update(ulevel=models.F('ulevel') + 0.2)
                
                if game.tournament and game.phase:
                    if game.phase.phase in [1, 2]:
                        next_phase_id = game.phase.phase + 1
                        next_game = tGames.objects.filter(tournament_id=game.tournament.tournament, phase_id=next_phase_id).filter(
                            models.Q(user1__isnull=True) | models.Q(user2__isnull=True)
                            ).first()
                        if not next_game:
                            return JsonResponse({"error": "No game found with available spot in the next phase."}, status=400)
                        if next_game.user1 is None:
                            next_game.user1 = winner_id
                        elif next_game.user2 is None:
                            next_game.user2 = winner_id
                            next_game.status = tauxStatus.objects.get(statusID=2)
                        next_game.save()
                    elif game.phase.phase == 3:
                        tournament = game.tournament
                        if tournament:
                            tournament.status = tauxStatus.objects.get(statusID=3)
                            tournament.winnerUser = winner_id
                            tournament.save()
                        tUserExtension.objects.filter(user=winner_id).update(
                            tVictories=models.F('tVictories') + 1,
                            ulevel=models.F('ulevel') + 0.5
                        )
                        participating_users = tGames.objects.filter(
                            tournament=game.tournament
                        ).values_list('user1', 'user2', flat=False)

                        user_ids = set()
                        for user1, user2 in participating_users:
                            if user1 and user1 not in user_ids:
                                user_ids.add(user1)
                            if user2 and user2 not in user_ids:
                                user_ids.add(user2)
                        user_ids.discard(winner_id)
                        tUserExtension.objects.filter(user__in=user_ids).update(
                            ulevel=models.F('ulevel') + 0.1
                        )
            else:
                game.user2 = user2_id
                game.status_id = 2
            game.save()
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
            if tUserExtension.objects.filter(user=user_id).exists():
                return JsonResponse({"error": f"User ID {user_id} already exists"}, status=400)
            try:
                gender = tauxGender.objects.get(gender=gender_id)
            except tauxGender.DoesNotExist:
                return JsonResponse({"error": f"Gender with id {gender_id} does not exist"}, status=404)

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

def get_phases(request):
    phases_data = [
        {
            'id': phase.phase,
            'label': phase.label
        }
        for phase in tauxPhase.objects.all()
    ]
    return JsonResponse({'phases': phases_data}, safe=False)

def get_userextensions(request):
    try:
        validate_filters_uext(request)
        user_id = request.GET.get('userID')
        if user_id == "":
            return JsonResponse({"error": "Filter can't be empty."}, status=400)
        uextensions = tUserExtension.objects.all()

        if user_id:
            user_id = validate_id(user_id)
            uextensions = uextensions.filter(user=user_id)

    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)
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
        for userext in uextensions
    ]
    
    return JsonResponse({'users': userext_data}, safe=False, status=200)

@csrf_exempt
def post_update_tournament(request): #update statusID acording to user2 and winner vars
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            tourn_id = data.get('tournamentID')
            if not tourn_id:
                return JsonResponse({"error": "Tournament ID is required for update"}, status=400)
            try:
                tourn = tTournaments.objects.get(tournament=tourn_id)
            except tTournaments.DoesNotExist:
                return JsonResponse({"error": "Tournament not found"}, status=404)
            winner_id = data.get('winnerUserID')
            status = data.get('statusID')
            if status is not None:
                status = validate_status(status)
                if status == 3:
                    tourn.status_id = status
                    tourn.save()

                    tGames.objects.filter(tournament=tourn).update(status_id=3)
                    return JsonResponse({"message": "Tournament forced finished was performed successfully", "tournament_id": tourn.tournament}, status=201)
                return JsonResponse({"error": "Override status only allowed for finished"}, status=400)
            if not winner_id:
                return JsonResponse({"error": "Winner is required for update"}, status=400)
            if winner_id is not None:
                if winner_id is not tUserExtension.objects.filter(user=winner_id).exists():
                    return JsonResponse({"error": f"Winner ID {winner_id} does not exist in tUserExtension"}, status=404)
                phase1_users = tGames.objects.filter(tournament=tourn, phase__id=1).values_list('user1', 'user2', flat=True)
                if winner_id not in phase1_users:
                    return JsonResponse({"error": f"Winner ID {winner_id} does not belong to the tournament."}, status=400)
            
            tourn.winnerUser = winner_id
            tourn.status = 3
            tUserExtension.objects.filter(user=winner_id).update(
                tvictories=models.F('tvictories') + 1,
                ulevel=models.F('ulevel') + 0.5
            )
            participating_users = tGames.objects.filter(
                tournament=tourn
            ).values_list('user1', 'user2', flat=False)
            user_ids = set()
            for user1, user2 in participating_users:
                if user1 and user1 not in user_ids:  
                    user_ids.add(user1)
                if user2 and user2 not in user_ids:
                    user_ids.add(user2)
            user_ids.discard(winner_id)
            tUserExtension.objects.filter(user__in=user_ids).update(ulevel=models.F('ulevel') + 0.1)
            tourn.save()
            return JsonResponse({"message": "Tournament updated successfully", "tournament_id": tourn.tournament}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def post_join_tournament(request):  # user joins an active tournament
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            tourn_id = data.get('tournamentID')
            if not tourn_id:
                return JsonResponse({"error": "Tournament ID is required for join"}, status=400)
            try:
                tourn = tTournaments.objects.get(tournament=tourn_id)
            except tTournaments.DoesNotExist:
                return JsonResponse({"error": "Tournament not found"}, status=404)
            if tourn.status.statusID == 3:
                return JsonResponse({"error": "The tournament is finished and cannot accept new players."}, status=400)
            user_id = data.get('userID')
            if not user_id:
                return JsonResponse({"error": "User is required to join"}, status=400)
            if user_id is not None:
                print(user_id)
                if not tUserExtension.objects.filter(user=user_id).exists():
                    print("aqui")
                    return JsonResponse({"error": f"User ID {user_id} does not exist in tUserExtension"}, status=404)
                
                # Corrigir `values_list` para buscar user1 e user2
                phase1_users = tGames.objects.filter(tournament_id=tourn.tournament, phase_id=1).values_list('user1', 'user2')
                all_users = set()
                for user1, user2 in phase1_users:
                    if user1:
                        all_users.add(user1)
                    if user2:
                        all_users.add(user2)
                if user_id in all_users:
                    return JsonResponse({"error": f"User ID {user_id} already belongs to the tournament."}, status=400)
            
            open_game = tGames.objects.filter(tournament_id=tourn.tournament, phase_id=1).filter(
                models.Q(user1__isnull=True) | models.Q(user2__isnull=True)
            ).first()
            if not open_game:
                return JsonResponse({"error": "The tournament is full and cannot accept new players."}, status=400)
            if open_game.user1 is None:
                open_game.user1 = user_id
            elif open_game.user2 is None:
                open_game.user2 = user_id
                open_game.status = tauxStatus.objects.get(statusID=2)
            open_game.save()

            full_games = tGames.objects.filter(
                tournament_id=tourn.tournament,
                phase_id=1,
                user1__isnull=False,
                user2__isnull=False
            )
            if full_games.exists():
                tourn.status = tauxStatus.objects.get(statusID=2)
                tourn.save()
            return JsonResponse({"message": f"User ID {user_id} joined to tournament ID {tourn_id} successfully"}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)