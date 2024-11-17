from django.urls import path
from .views import *

urlpatterns = [
    path('current_datetime/', get_current_datetime, name='get_current_datetime'),
    path('tournaments/', get_tournaments, name='get_tournaments'),
    path('games/',get_games, name='get_games'),
    path('create_game/', post_create_game, name='post_create_game'),
    path('create_tournament/', post_create_tournament, name='post_create_tournament'),
    path('update_game/', post_update_game, name='post_update_game'),
]
