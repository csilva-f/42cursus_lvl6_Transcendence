from datetime import datetime
from django.http import JsonResponse
from .models import *
import json
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q, Sum, F, ExpressionWrapper, DurationField
from django.utils.timezone import now

ALLOWED_FILTERS_TOURNAMENT = {'uid', 'tournamentID', 'statusID', 'name', 'winnerID'}

ALLOWED_FILTERS_GAMES = {'uid', 'statusID', 'gameID', 'user1ID', 'user2ID', 'winnerID', 'tournamentID'}

ALLOWED_FILTERS_UEXT = {'uid', 'userID'}

ALLOWED_FILTERS_UGAMES = {'uid', 'statusID', 'tournamentID'}

ALLOWED_FILTERS_FRIENDS = {'uid', 'userID', 'statusID', 'sentToMe'}

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
    
def validate_filters_ugames(request):
    extra_keys = set(request.GET.keys()) - ALLOWED_FILTERS_UGAMES
    if extra_keys:
        raise ValidationError(f"Invalid parameter(s): {', '.join(extra_keys)}")

def validate_filters_friends(request):
    extra_keys = set(request.GET.keys()) - ALLOWED_FILTERS_FRIENDS
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
        u_id = request.GET.get('uid')

        if any(param == "" for param in [game_id, status_id, winner_id, tournament_id]):
            return JsonResponse({"error": "Filter can't be empty."}, status=400)
        u_ext = None
        if u_id:
            try:
                u_ext = tUserExtension.objects.get(user=u_id)
            except tUserExtension.DoesNotExist:
                return JsonResponse({"error": "Invalid - user does not exist."}, status=400)
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

    games_data = []
    for game in games:
        user1_nick = None
        user2_nick = None

        if game.user1:
            try:
                user1_nick = tUserExtension.objects.get(user=game.user1).nick
            except tUserExtension.DoesNotExist:
                user1_nick = None
        if game.user2:
            try:
                user2_nick = tUserExtension.objects.get(user=game.user2).nick
            except tUserExtension.DoesNotExist:
                user2_nick = None

        games_data.append({
            'userID': u_id if u_id else None,
            'userNick': u_ext.nick if u_ext else None,
            'gameID': game.game,
            'creationTS': game.creationTS.strftime("%Y-%m-%d %H:%M:%S"),
            'startTS': game.startTS.strftime("%Y-%m-%d %H:%M:%S") if game.startTS else None,
            'endTS': game.endTS.strftime("%Y-%m-%d %H:%M:%S") if game.endTS else None,
            'duration': str(game.endTS - game.creationTS) if game.endTS else "00:00:00",
            'user1ID': game.user1,
            'user1Nick': user1_nick,
            'user2ID': game.user2,
            'user2Nick': user2_nick,
            'winnerUserID': game.winnerUser,
            'user1_points': game.user1_points,
            'user2_points': game.user2_points,
            'user1_hits': game.user1_hits,
            'user2_hits': game.user2_hits,
            'statusID': game.status.statusID,
            'status': game.status.status,
            'tournamentID': game.tournament.tournament if game.tournament else None,
            'phaseID': game.phase.phase if game.phase else None,
            'phase': game.phase.label if game.phase else None,
            'isLocal': game.isLocal,
            'isInvitation': game.isInvitation,
            'isInvitAccepted': game.isInvitAccepted
        })

    return JsonResponse({"games": games_data}, status=200)

@csrf_exempt 
def get_gameinvitations(request):
    try:
        validate_filters_uext(request)
        user_id = request.GET.get('uid')

        if not user_id or user_id == "":
            return JsonResponse({"error": "A user must be provided."}, status=400)
        if not tUserExtension.objects.filter(user=user_id).exists():
            return JsonResponse({"error": f"User ID {user_id} does not exist in tUserExtension"}, status=404)

        games = tGames.objects.filter(user2=user_id, isInvitation=True, isInvitAccepted=False)
        try:
            u_ext = tUserExtension.objects.get(user=user_id)
        except tUserExtension.DoesNotExist:
            return JsonResponse({"error": "Invalid - user does not exist."}, status=400)

    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)

    games_data = []
    for game in games:
        user1_nick = None
        user2_nick = None

        if game.user1:
            try:
                user1_nick = tUserExtension.objects.get(user=game.user1).nick
            except tUserExtension.DoesNotExist:
                user1_nick = None
        if game.user2:
            try:
                user2_nick = tUserExtension.objects.get(user=game.user2).nick
            except tUserExtension.DoesNotExist:
                user2_nick = None

        games_data.append({
            'userID': user_id if user_id else None,
            'userNick': u_ext.nick if u_ext else None,
            'gameID': game.game,
            'creationTS': game.creationTS.strftime("%Y-%m-%d %H:%M:%S"),
            'startTS': game.startTS.strftime("%Y-%m-%d %H:%M:%S") if game.startTS else None,
            'endTS': game.endTS.strftime("%Y-%m-%d %H:%M:%S") if game.endTS else None,
            'duration': str(game.endTS - game.creationTS) if game.endTS else "00:00:00",
            'user1ID': game.user1,
            'user1Nick': user1_nick,
            'user2ID': game.user2,
            'user2Nick': user2_nick,
            'winnerUserID': game.winnerUser,
            'user1_points': game.user1_points,
            'user2_points': game.user2_points,
            'user1_hits': game.user1_hits,
            'user2_hits': game.user2_hits,
            'statusID': game.status.statusID,
            'status': game.status.status,
            'tournamentID': game.tournament.tournament if game.tournament else None,
            'phaseID': game.phase.phase if game.phase else None,
            'phase': game.phase.label if game.phase else None,
            'isLocal': game.isLocal,
            'isInvitation': game.isInvitation,
            'isInvitAccepted': game.isInvitAccepted
        })
    return JsonResponse({"invitGames": games_data}, status=200)

@csrf_exempt 
def get_nbr_invitations(request):
    try:
        validate_filters_uext(request)
        user_id = request.GET.get('uid')

        if not user_id or user_id == "":
            return JsonResponse({"error": "A user must be provided."}, status=400)
        if not tUserExtension.objects.filter(user=user_id).exists():
            return JsonResponse({"error": f"User ID {user_id} does not exist in tUserExtension"}, status=404)

        total_invitations = tGames.objects.filter(user2=user_id, isInvitation=True, isInvitAccepted=False).count()
        try:
            u_nick = tUserExtension.objects.get(user=user_id).nick
        except tUserExtension.DoesNotExist:
            u_nick = None

    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({
        "userID": user_id,
        "nick": u_nick,
        "totalInvit": total_invitations
    }, status=200)

@csrf_exempt 
def get_usergames(request):
    try:
        validate_filters_ugames(request)

        status_id = request.GET.get('statusID')
        tournament_id = request.GET.get('tournamentID')
        user_id = request.GET.get('uid')
        if not user_id or user_id == "":
            return JsonResponse({"error": "A user must be provided."}, status=400)
        if not tUserExtension.objects.filter(user=user_id).exists():
            return JsonResponse({"error": f"User ID {user_id} does not exist in tUserExtension"}, status=404)
        if status_id == "" or tournament_id == "":
            return JsonResponse({"error": "Filter can't be empty."}, status=400)
        games_user1 = tGames.objects.filter(user1=user_id)
        games_user2 = tGames.objects.filter(user2=user_id)
        games = games_user1 | games_user2
        if status_id:
            status_id = validate_status(status_id)
            games = games.filter(status__statusID=status_id)
        if tournament_id:
            tournament_id = validate_id(tournament_id)
            if tournament_id == -1:
                games = games.filter(tournament__tournament__isnull=True)
            else:
                games = games.filter(tournament__tournament=tournament_id)
        games = games.filter(models.Q(isInvitation=False) | models.Q(isInvitation=True, isInvitAccepted=True))
        try:
            u_ext = tUserExtension.objects.get(user=user_id)
        except tUserExtension.DoesNotExist:
            return JsonResponse({"error": "Invalid - user does not exist."}, status=400)

    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)

    games_data = []
    for game in games:
        user1_nick = None
        user2_nick = None

        if game.user1:
            try:
                user1_nick = tUserExtension.objects.get(user=game.user1).nick
            except tUserExtension.DoesNotExist:
                user1_nick = None
        if game.user2:
            try:
                user2_nick = tUserExtension.objects.get(user=game.user2).nick
            except tUserExtension.DoesNotExist:
                user2_nick = None

        games_data.append({
            'userID': user_id if user_id else None,
            'userNick': u_ext.nick if u_ext else None,
            'gameID': game.game,
            'creationTS': game.creationTS.strftime("%Y-%m-%d %H:%M:%S"),
            'startTS': game.startTS.strftime("%Y-%m-%d %H:%M:%S") if game.startTS else None,
            'endTS': game.endTS.strftime("%Y-%m-%d %H:%M:%S") if game.endTS else None,
            'duration': str(game.endTS - game.creationTS) if game.endTS else "00:00:00",
            'user1ID': game.user1,
            'user1Nick': user1_nick,
            'user2ID': game.user2,
            'user2Nick': user2_nick,
            'winnerUserID': game.winnerUser,
            'user1_points': game.user1_points,
            'user2_points': game.user2_points,
            'user1_hits': game.user1_hits,
            'user2_hits': game.user2_hits,
            'statusID': game.status.statusID,
            'status': game.status.status,
            'tournamentID': game.tournament.tournament if game.tournament else None,
            'phaseID': game.phase.phase if game.phase else None,
            'phase': game.phase.label if game.phase else None,
            'isLocal': game.isLocal,
            'isInvitation': game.isInvitation,
            'isInvitAccepted': game.isInvitAccepted
        })
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
        u_id = request.GET.get('uid')

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
            user1_id = data.get('uid')
            print(user1_id)
            if not user1_id:
                return JsonResponse({"error": "User1 ID is required"}, status=400)
            if not tUserExtension.objects.filter(user=user1_id).exists():
                return JsonResponse({"error": f"User1 ID {user1_id} does not exist in tUserExtension"}, status=404)
            user1_nick = tUserExtension.objects.get(user=user1_id).nick

            tournament_id = data.get('tournamentid')
            glocal = str(data.get('islocal')).lower() in ['true', '1', 'yes']
            ginvit = str(data.get('isInvitation')).lower() in ['true', '1', 'yes']
            gstatus = 1
            try:
                status_instance = tauxStatus.objects.get(statusID=gstatus)
            except tauxStatus.DoesNotExist:
                return JsonResponse({"error": f"Status ID {gstatus} does not exist in tauxStatus"}, status=404)
            user2_id = None
            user2_nick = None
            if ginvit:
                user2_id = data.get('user2ID')
                if not user2_id:
                    return JsonResponse({"error": "User2 ID is required for an arranged game"}, status=400)
                if not tUserExtension.objects.filter(user=user2_id).exists():
                    return JsonResponse({"error": f"User2 ID {user2_id} does not exist in tUserExtension"}, status=404)
                if user2_id == user1_id:
                    return JsonResponse({"error": "User2 cannot be the same as User1"}, status=400)

            if glocal:
                if ginvit:
                    return JsonResponse({"error": "A guest user cannot be the invited to a game"}, status=400)
                try:
                    user2_id = tUserExtension.objects.get(user=-1).user
                    user2_nick = tUserExtension.objects.get(user=-1).nick
                except tUserExtension.DoesNotExist:
                    return JsonResponse({"error": "Default user not found in the DB"}, status=404)
                try:
                    status_instance = tauxStatus.objects.get(statusID=2)
                except tauxStatus.DoesNotExist:
                    return JsonResponse({"error": f"Status ID {gstatus} does not exist in tauxStatus"}, status=404)

            game = tGames.objects.create(
                user1=user1_id,
                user2=user2_id,
                tournament=tournament_id,
                status=status_instance,
                isLocal=glocal,
                isInvitation = ginvit
            )
            game_data = {
                "id": game.game,
                "user1": user1_id,
                "user1_nick": user1_nick,
                "user2": user2_id,
                "user2_nick": user2_nick,
                "tournament": tournament_id,
                "isLocal": glocal,
                "isInvitation": ginvit
            }
            return JsonResponse({"message": "Game created successfully", "game": game_data}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def post_accept_game_invit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            game_id = data.get('gameID')
            if not game_id:
                return JsonResponse({"error": "Game ID is required for invitation acceptance"}, status=400)
            try:
                game = tGames.objects.get(game=game_id)
            except tGames.DoesNotExist:
                return JsonResponse({"error": "Game not found"}, status=404)
            game.isInvitAccepted = True
            game.status_id = 2
            game.startTS = now()
            game.save()
            return JsonResponse({"message": "Game invitation accepted successfully", "game_id": game.game}, status=201)
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
            # if save_name is None: #validates missing key
            #     save_name = "random_stuff"
            if not save_name:  #validates empty value
                return JsonResponse({"error": "name can't be empty"}, status=400)
            existing_tournament = tTournaments.objects.filter(name=save_name, status__in=[1, 2]).exists()
            if existing_tournament:
                return JsonResponse({"error": "Tournament name must be different from an active tournament"}, status=400)
            created_by = data.get('uid')
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
            user_id = data.get('uid')
            print(user_id)
            is_join = str(data.get('isJoin')).lower() in ['true', '1', 'yes']
            status = data.get('statusID')
            if status is not None:
                status = validate_status(status)
                if status == 3:
                    game.status_id = status
                    game.save()
                    return JsonResponse({"message": "Game updated successfully, forced finished was performed", "game_id": game.game}, status=201)
                return JsonResponse({"error": "Override status only allowed for finished"}, status=400)
            if not user_id and not is_join:
                return JsonResponse({"error": "User ID is required for update"}, status=400)
            if user_id == game.user1 and is_join:
                return JsonResponse({"error": "User2 must be different from User1"}, status=400)
            if is_join and not tUserExtension.objects.filter(user=user_id).exists():
                return JsonResponse({"error": f"User ID {user_id} does not exist in tUserExtension"}, status=404)
            if not is_join and user_id not in [game.user1, game.user2]:
                return JsonResponse({"error": "Winner must be either User1 or User2"}, status=400)
            if not is_join:
                game.status_id = 3
                game.endTS = now() 

                u1_points = data.get('user1_points')
                u2_points = data.get('user2_points')
                u1_hits = data.get('user1_hits')
                u2_hits = data.get('user2_hits')
                if (not u1_points and u1_points != 0) or (not u2_points and u2_points != 0) or (not u1_hits and u1_hits != 0) or (not u2_hits and u2_hits != 0):
                    return JsonResponse({"error": "Users game statistics are required for update"}, status=400)
                if (game.user1 == user_id and u1_points < 5) or (game.user2 == user_id and u2_points < 5):
                    return JsonResponse({"error": "Winner's points are not consistent"}, status=400)
                game.user1_points = u1_points
                game.user2_points = u2_points
                game.user1_hits = u1_hits
                game.user2_hits = u2_hits
                game.winnerUser = game.user1 if int(game.user1_points) > int(game.user2_points) else game.user2
                if game.user1 == user_id and game.user1 != -1:
                    tUserExtension.objects.filter(user=game.user1).update(ulevel=models.F('ulevel') + 0.2)
                    tUserExtension.objects.filter(user=game.user2).update(ulevel=models.F('ulevel') + 0.05)
                elif game.user1 != -1:
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
                            next_game.user1 = user_id
                        elif next_game.user2 is None:
                            next_game.user2 = user_id
                            next_game.status = tauxStatus.objects.get(statusID=2)
                        next_game.save()
                    elif game.phase.phase == 3:
                        tournament = game.tournament
                        if tournament:
                            tournament.status = tauxStatus.objects.get(statusID=3)
                            tournament.winnerUser = user_id
                            tournament.save()
                        tUserExtension.objects.filter(user=user_id).update(
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
                        user_ids.discard(user_id)
                        tUserExtension.objects.filter(user__in=user_ids).update(
                            ulevel=models.F('ulevel') + 0.1
                        )
            else:
                game.user2 = user_id
                game.status_id = 2
                game.startTS = now()
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
    
            user_id = data.get('uid')
            if not user_id:
                return JsonResponse({"error": "Missing user ID"}, status=400)
            if tUserExtension.objects.filter(user=user_id).exists():
                userext = tUserExtension.objects.get(user=user_id)
                return JsonResponse({
                    "message": "User extension already exists",
                    "user": {
                        "id": userext.user,
                        "nickname": userext.nick,
                        "birthdate": str(userext.birthdate) if userext.birthdate else None,
                        "gender": userext.gender.gender if userext.gender else None,
                        "level": userext.ulevel,
                        "avatar": userext.avatar,
                        "bio": userext.bio
                    },
                    "isOpenPopup": False if userext.nick else True
                }, status=201)
            
            userext = tUserExtension.objects.create(
                user=user_id
            )
            return JsonResponse({
                "message": "User extension created successfully",
                "user": {
                    "id": userext.user,
                    "nickname": userext.nick,
                    "birthdate": str(userext.birthdate) if userext.birthdate else None,
                    "gender": userext.gender.gender if userext.gender else None,
                    "level": userext.ulevel,
                    "avatar": userext.avatar,
                    "bio": userext.bio
                },
                "isOpenPopup": True
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

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

def get_friendshipstatus(request):
    friendshipstatus_data = [
        {
            'id': status.status,
            'label': status.label
        }
        for status in tauxFriendshipStatus.objects.all()
    ]
    return JsonResponse({'friendshipstatus': friendshipstatus_data}, safe=False)

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
        else:
            u_id = request.GET.get('uid')
            uextensions = uextensions.filter(user=u_id)

    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)
    userext_data = [
        {
            'id': userext.user,
            'nick': userext.nick,
            'birthdate': userext.birthdate.strftime("%Y-%m-%d") if userext.birthdate else None,
            'gender': userext.gender.label if userext.gender else None,
            'level': userext.ulevel,
            'avatar': userext.avatar,
            'bio': userext.bio
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
            user_id = data.get('uid')
            if not user_id:
                return JsonResponse({"error": "User is required to join"}, status=400)
            if user_id is not None:
                if not tUserExtension.objects.filter(user=user_id).exists():
                    return JsonResponse({"error": f"User ID {user_id} does not exist in tUserExtension"}, status=404)
                
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

@csrf_exempt
def post_update_userextension(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            uext_id = data.get('uid')
            if not uext_id:
                return JsonResponse({"error": "User ID is required for update"}, status=400)
            try:
                uext = tUserExtension.objects.get(user=uext_id)
            except tUserExtension.DoesNotExist:
                return JsonResponse({"error": "User not found"}, status=404)
            birthdate = data.get('birthdate')
            gender_id = data.get('genderid')
            avatar = data.get('avatar')
            bio = data.get('bio')
            unick = data.get('nickname')
            if (not unick) and (not uext.nick):
                return JsonResponse({"error": "User nickname is a mandatory field in the first update"}, status=400)
            if gender_id:
                try:
                    gen = tauxGender.objects.get(gender=gender_id)
                    uext.gender = gen
                except tauxGender.DoesNotExist:
                    return JsonResponse({"error": f"Gender with id {gender_id} does not exist"}, status=404)
            if unick:
                if len(unick) > 20:
                    return JsonResponse({"error": "Nickname cannot exceed 20 characters"}, status=400)
                if tUserExtension.objects.filter(nick=unick).exists():
                    return JsonResponse({"error": f"Nickname '{unick}' is already in use"}, status=400)
            if not any([
                birthdate and birthdate != uext.birthdate,
                gender_id and gender_id != (uext.gender.gender if uext.gender else None),
                bio and bio != uext.bio,
                avatar and avatar != uext.avatar,
                unick and unick != uext.nick
            ]):
                return JsonResponse({"error": "No changes to the user information were performed"}, status=400)
            if birthdate:
                uext.birthdate = birthdate
            if avatar:
                uext.avatar = avatar
            if bio:
                uext.bio = bio
            if unick:
                uext.nick = unick
            uext.save()
            return JsonResponse({"message": "User information updated successfully", "user_id": uext.user}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

def get_userstatistics(request):
    try:
        validate_filters_uext(request)
        user_id = request.GET.get('userID')

        if user_id == "":
            return JsonResponse({"error": "Filter can't be empty."}, status=400)

        uextensions = tUserExtension.objects.all()
        
        if user_id:
            user_id = validate_id(user_id)
            uextensions = uextensions.filter(user=user_id)
        else:
            u_id = request.GET.get('uid')
            uextensions = uextensions.filter(user=u_id)

    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)

    userext_data = []

    for userext in uextensions:
        ongoing_statuses = [1, 2]

        # Game victories/losses
        total_games_played = tGames.objects.filter(
            (Q(user1=userext.user) | Q(user2=userext.user)) & ~Q(status__statusID__in=ongoing_statuses)
        ).count()

        game_victories = tGames.objects.filter(
            Q(winnerUser=userext.user) & ~Q(status__statusID__in=ongoing_statuses)
        ).count()

        # Total points
        total_points_user1 = tGames.objects.filter(
            Q(user1=userext.user) & ~Q(status__statusID__in=ongoing_statuses)
        ).aggregate(total=Sum('user1_points'))['total'] or 0

        total_points_user2 = tGames.objects.filter(
            Q(user2=userext.user) & ~Q(status__statusID__in=ongoing_statuses)
        ).aggregate(total=Sum('user2_points'))['total'] or 0

        total_points = total_points_user1 + total_points_user2

        # Total ball hits
        total_hits_user1 = tGames.objects.filter(
            Q(user1=userext.user) & ~Q(status__statusID__in=ongoing_statuses)
        ).aggregate(total=Sum('user1_hits'))['total'] or 0

        total_hits_user2 = tGames.objects.filter(
            Q(user2=userext.user) & ~Q(status__statusID__in=ongoing_statuses)
        ).aggregate(total=Sum('user2_hits'))['total'] or 0

        total_hits = total_hits_user1 + total_hits_user2

        #Tournament victries/losses
        tournament_victories = tGames.objects.filter(
            Q(winnerUser=userext.user) &
            Q(phase__phase=3) &
            Q(tournament__isnull=False) &
            ~Q(status__statusID__in=ongoing_statuses)
        ).count()

        total_tournaments_played = tTournaments.objects.filter(
            Q(tgames__tournament__isnull=False) &
            Q(tgames__phase__phase=1) &
            (Q(tgames__user1=userext.user) | Q(tgames__user2=userext.user)) &
            ~Q(status__statusID__in=ongoing_statuses)
        ).distinct().count()

        # Total game time
        total_game_time = tGames.objects.filter(
            (Q(user1=userext.user) | Q(user2=userext.user)) &
            Q(endTS__isnull=False) &
            ~Q(status__statusID__in=ongoing_statuses)
        ).aggregate(
            total_time=Sum(ExpressionWrapper(F('endTS') - F('startTS'), output_field=DurationField()))
        )['total_time']

        total_game_time_str = str(total_game_time) if total_game_time else "00:00:00"

        userext_data.append({
            'UserID': userext.user,
            'Level': userext.ulevel,
            'GameVictories': game_victories,
            'GameLosses': max(0, total_games_played - game_victories),
            'TotalGamesPlayed': total_games_played,
            'TournamentVictories': tournament_victories,
            'TournamentLosses': max(0, total_tournaments_played - tournament_victories),
            'TotalTournamentsPlayed': total_tournaments_played,
            'TotalGamePoints': total_points,
            'TotalBallHits': total_hits,
            'TotalGameTime': total_game_time_str
        })

    return JsonResponse({'users': userext_data}, safe=False, status=200)

def get_friendships(request):
    try:
        validate_filters_friends(request)
        user_id = request.GET.get('userID')
        status_id = request.GET.get('statusID')
        u_id = request.GET.get('uid')
        if user_id:
            if user_id.strip() == "":
                return JsonResponse({"error": "Filter can't be empty."}, status=400)
            user_id = validate_id(user_id)
            if not tUserExtension.objects.filter(user=user_id).exists():
                return JsonResponse({"error": f"User {user_id} does not exist"}, status=404)
            if status_id:
                if status_id.strip() == "":
                    return JsonResponse({"error": "Filter can't be empty."}, status=400)
                status_id = validate_id(status_id)
                if not tauxFriendshipStatus.objects.filter(status=status_id).exists():
                    return JsonResponse({"error": f"Friendship status {status_id} does not exist"}, status=404)
                friendships = tFriends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id), Q(requestStatus_id=status_id))
            else:
                friendships = tFriends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
            friends_data = [
                {
                    'friendID': friends.user2.user if int(friends.user1.user) == int(user_id) else friends.user1.user,
                    'friendNick': friends.user2.nick if int(friends.user1.user) == int(user_id) else friends.user1.nick,
                    'friendLevel': friends.user2.ulevel if int(friends.user1.user) == int(user_id) else friends.user1.ulevel,
                    'statusID': friends.requestStatus.status, 
                    'statusLabel': friends.requestStatus.label
                }
                for friends in friendships
            ]
            return JsonResponse({'friendships': friends_data}, safe=False, status=200)
        elif u_id:
            if not tUserExtension.objects.filter(user=u_id).exists():
                return JsonResponse({"error": f"User {u_id} does not exist"}, status=404)
            if status_id:
                if status_id.strip() == "":
                    return JsonResponse({"error": "Filter can't be empty."}, status=400)
                status_id = validate_id(status_id)
                if not tauxFriendshipStatus.objects.filter(status=status_id).exists():
                    return JsonResponse({"error": f"Friendship status {status_id} does not exist"}, status=404)
                friendships = tFriends.objects.filter(Q(user1_id=u_id) | Q(user2_id=u_id), Q(requestStatus_id=status_id))
            else:
                friendships = tFriends.objects.filter(Q(user1_id=u_id) | Q(user2_id=u_id))
                
            friends_data = [
                {
                    'friendID': friends.user2.user if int(friends.user1.user) == int(u_id) else friends.user1.user,
                    'friendNick': friends.user2.nick if int(friends.user1.user) == int(u_id) else friends.user1.nick,
                    'friendLevel': friends.user2.ulevel if int(friends.user1.user) == int(u_id) else friends.user1.ulevel,
                    'statusID': friends.requestStatus.status, 
                    'statusLabel': friends.requestStatus.label
                }
                for friends in friendships
            ]
            return JsonResponse({'friendships': friends_data}, safe=False, status=200)
        else:
            if status_id:
                if status_id.strip() == "":
                    return JsonResponse({"error": "Filter can't be empty."}, status=400)
                status_id = validate_id(status_id)
                if not tauxFriendshipStatus.objects.filter(status=status_id).exists():
                    return JsonResponse({"error": f"Friendship status {status_id} does not exist"}, status=404)
                friendships = tFriends.objects.filter(requestStatus_id=status_id)
            else:
                friendships = tFriends.objects.all()
    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    friendships_data = [
        {
            'user1ID': friends.user1.user,
            'user1Nick': friends.user1.nick,
            'user2ID': friends.user2.user,
            'user2Nick': friends.user2.nick,
            'requesterID': friends.requester.user,
            'requesterNick': friends.requester.nick,
            'statusID': friends.requestStatus.status, 
            'statusLabel': friends.requestStatus.label
        }
        for friends in friendships
    ]
    
    return JsonResponse({'friendships': friendships_data}, safe=False, status=200)

@csrf_exempt
def post_send_friend_req(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user1_id = int(data.get('uid'))
            user2_id = int(data.get('user2ID'))
            if not user1_id:
                return JsonResponse({"error": "The ID of the user sending the friendship request is required"}, status=400)
            if not user2_id:
                return JsonResponse({"error": "The ID of the user receiving the friendship request is required"}, status=400)
            if user1_id == user2_id:
                return JsonResponse({"error": "A user cannot send a friendship request to themselves"}, status=400)
            try:
                user1 = tUserExtension.objects.get(user=user1_id)
            except tUserExtension.DoesNotExist:
                return JsonResponse({"error": f"User {user1_id} does not exist"}, status=404)
            try:
                user2 = tUserExtension.objects.get(user=user2_id)
            except tUserExtension.DoesNotExist:
                return JsonResponse({"error": f"User {user2_id} does not exist"}, status=404)
            friendship = tFriends.objects.filter(
                Q(user1_id=user1_id, user2_id=user2_id) | Q(user1_id=user2_id, user2_id=user1_id)
            ).first()
            if friendship:
                if friendship.requestStatus_id == 1:
                    return JsonResponse({"error": "A friendship request is already pending between these users"}, status=400)
                elif friendship.requestStatus_id == 2:
                    return JsonResponse({"error": "Users are already friends"}, status=400)
                else:
                    try:
                        status = tauxFriendshipStatus.objects.get(status=1)
                    except tauxFriendshipStatus.DoesNotExist:
                        return JsonResponse({"error": f"Friendship status does not exist"}, status=404)
                    friendship.requestStatus = status
                    friendship.requester = user1
                    friendship.save()
            else:
                friendship = tFriends.objects.create(user1=user1, user2=user2, requester=user1)
            return JsonResponse({"message": "Friendship request sent successfully"}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def post_respond_friend_req(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user1_id = data.get('uid')
            user2_id = data.get('user2ID')
            status_id = data.get('statusID')
            if not user1_id:
                return JsonResponse({"error": "User ID 1 is required"}, status=400)
            if not user2_id:
                return JsonResponse({"error": "User ID 2 is required"}, status=400)
            if user1_id == user2_id:
                return JsonResponse({"error": "The users IDs cannot be the same"}, status=400)
            
            try:
                user1 = tUserExtension.objects.get(user=user1_id)
            except tUserExtension.DoesNotExist:
                return JsonResponse({"error": f"User {user1_id} does not exist"}, status=404)
            try:
                user2 = tUserExtension.objects.get(user=user2_id)
            except tUserExtension.DoesNotExist:
                return JsonResponse({"error": f"User {user2_id} does not exist"}, status=404)

            try:
                friendship = tFriends.objects.get(
                    Q(user1_id=user1_id, user2_id=user2_id) |
                    Q(user1_id=user2_id, user2_id=user1_id)
                )
            except tFriends.DoesNotExist:
                return JsonResponse({"error": f"There is no friendship record between {user1_id} and {user2_id}"}, status=404)
            if status_id is not None:
                status_id = validate_status(status_id)
                if friendship.requestStatus_id == status_id:
                    return JsonResponse({"error": "The status cannot be the same"}, status=400)
                elif friendship.requestStatus_id == 1 and friendship.requester_id == user1_id:
                    return JsonResponse({"error": "The user accepting the request is the same who sent it"}, status=400)
                elif (friendship.requestStatus_id == 2 and status_id == 1) or (friendship.requestStatus_id == 3 and status_id == 2):
                    return JsonResponse({"error": "Inconsistent friendship status change"}, status=400)
                try:
                    status = tauxFriendshipStatus.objects.get(status=status_id)
                except tauxFriendshipStatus.DoesNotExist:
                    return JsonResponse({"error": f"Friendship status does not exist"}, status=404)
                friendship.requestStatus = status
            friendship.save()
            return JsonResponse({"message": "Friendship record updated successfully"}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

def get_pendingrequests(request):
    try:
        validate_filters_friends(request)
        user_id = request.GET.get('uid')
        isSentToMe = str(request.GET.get('sentToMe')).lower() in ['true', '1', 'yes']
        if user_id:
            if user_id.strip() == "":
                return JsonResponse({"error": "Filter can't be empty."}, status=400)
            user_id = validate_id(user_id)
            if not tUserExtension.objects.filter(user=user_id).exists():
                return JsonResponse({"error": f"User {user_id} does not exist"}, status=404)
            if isSentToMe:
                friendships = tFriends.objects.filter(
                    (Q(user1_id=user_id) | Q(user2_id=user_id)) & ~Q(requester_id=user_id) & Q(requestStatus_id=1)
                )
            else:
                friendships = tFriends.objects.filter(
                    (Q(user1_id=user_id) | Q(user2_id=user_id)) & Q(requester_id=user_id) & Q(requestStatus_id=1)
                )
            friends_data = [
                {
                    'userID': friends.user2.user if int(friends.user1.user) == int(user_id) else friends.user1.user,
                    'userNick': friends.user2.nick if int(friends.user1.user) == int(user_id) else friends.user1.nick,
                    'userLevel': friends.user2.ulevel if int(friends.user1.user) == int(user_id) else friends.user1.ulevel,
                    'statusID': friends.requestStatus.status, 
                    'statusLabel': friends.requestStatus.label
                }
                for friends in friendships
            ]
            return JsonResponse({'requests': friends_data}, safe=False, status=200)  
        else:
            return JsonResponse({"error": f"It's mandatory to indicate a user to find they're pending friendship requests"}, status=404)
    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_nonfriendslist(request):
    try:
        validate_filters_friends(request)
        user_id = request.GET.get('uid')
        if user_id:
            if user_id.strip() == "":
                return JsonResponse({"error": "Filter can't be empty."}, status=400)
            user_id = validate_id(user_id)
            if not tUserExtension.objects.filter(user=user_id).exists():
                return JsonResponse({"error": f"User {user_id} does not exist"}, status=404)

            friends_ids = tFriends.objects.filter(
                (Q(user1_id=user_id) | Q(user2_id=user_id)) & ~Q(requestStatus_id=3)
            ).values_list('user1_id', 'user2_id')
            friends_ids = set(id for pair in friends_ids for id in pair if id != user_id)

            non_friends = tUserExtension.objects.filter(
                ~Q(user__in=friends_ids)
            ).exclude(user=user_id).exclude(user=-1)

            non_friends_data = [
                {
                    'userID': user.user,
                    'userNick': user.nick,
                    'userLevel': user.ulevel
                }
                for user in non_friends
            ]

            return JsonResponse({'nonFriendsList': non_friends_data}, safe=False, status=200) 
        else:
            return JsonResponse({"error": f"It's mandatory to indicate a user to find users to add as friends"}, status=404)
    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_topusers(request):
    try:
        uextensions = tUserExtension.objects.all().order_by('-ulevel')[:3]

    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)

    userext_data = [
        {
            "id": userext.user,
            "nickname": userext.nick,
            'level': userext.ulevel,
            "birthdate": str(userext.birthdate) if userext.birthdate else None,
            "gender": userext.gender.gender if userext.gender else None,
            "avatar": userext.avatar,
            "bio": userext.bio
        }
        for userext in uextensions
    ]
    return JsonResponse({'users': userext_data}, safe=False, status=200)