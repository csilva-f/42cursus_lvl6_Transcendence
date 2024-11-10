from django.urls import path
from .views import *

urlpatterns = [
    path('get-datetime/', GetDateTime.as_view(), name='get-datetime'),
    path('name/', PostMyName.as_view(), name='name'),
    path('get-games/', GetGames.as_view(), name='get-games'),
    path('get-tournaments/', GetTournaments.as_view(), name='get-tournments'),
    path('create-game/', PostAddGame.as_view(), name='create-game'),
    path('create-tournament/', PostAddTournament.as_view(), name='create-tournament'),
    path('update-game/', PostUpdateGame.as_view(), name='update-game'),
]
