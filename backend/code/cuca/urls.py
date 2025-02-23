from django.urls import path
from .views import *

urlpatterns = [
    path('tournaments/', get_tournaments, name='get_tournaments'),
    path('games/',get_games, name='get_games'),
    path('create_game/', post_create_game, name='post_create_game'),
    path('create_tournament/', post_create_tournament, name='post_create_tournament'),
    path('update_game/', post_update_game, name='post_update_game'),
    path('create_userextension/', post_create_userextension, name='post_create_userextension'),
    path('genders/', get_genders, name='get_genders'),
    path('get_userextensions/', get_userextensions, name='get_userextensions'),
    path('status/', get_status, name='get_status'),
    path('update_tournament/', post_update_tournament, name='post_update_tournament'),
    path('phases/', get_phases, name='get_phases'),
    path('join_tournament/', post_join_tournament, name='post_join_tournament'),
    path('update_userextension/', post_update_userextension, name='update_userextension'),
    path('get_userstatistics/', get_userstatistics, name='get_userstatistics'),
    path('accept_gameinvitation/', post_accept_game_invit, name='accept_gameinvitation'),
    path('get_userinvitations/', get_gameinvitations, name='get_userinvitations'),
    path('get_usernbrinvit/', get_nbr_invitations, name='get_usernbrinvit'),
    path('get_usergames/', get_usergames, name='get_usergames'),
    path('friendshipstatus/', get_friendshipstatus, name='get_friendshipstatus'),
    path('get_friendships/', get_friendships, name='get_friendships'),
    path('send_friendrequest/', post_send_friend_req, name='send_friendrequest'),
    path('respond_friendrequest/', post_respond_friend_req, name='respond_friendrequest'),
]
