from django.urls import path
from .views import *

urlpatterns = [
    path('get-games/', GetGames.as_view(), name='get-games'),
    path('get-tournaments/', GetTournaments.as_view(), name='get-tournments'),
    path('create-game/', PostAddGame.as_view(), name='create-game'),
    path('create-tournament/', PostAddTournament.as_view(), name='create-tournament'),
    path('update-game/', PostUpdateGame.as_view(), name='update-game'),
    path('create-userextension/', PostAddUserExtension.as_view(), name='create-userextension'),
    path('get-genders/', GetGenders.as_view(), name='get-genders'),
    path('get-userextensions/', GetUserExtensions.as_view(), name='get-userextensions'),
    path('get-status/', GetStatus.as_view(), name='get-status'),
    path('update-tournament/', PostUpdateTournament.as_view(), name='update-tournament'),
    path('get-phases/', GetPhases.as_view(), name='get-phases'),
    path('join-tournament/', PostJoinTournament.as_view(), name='join-tournament'),
    path('update-userextension/', PostUpdateUserExtension.as_view(), name='update-userextension'),
    path('get-userstatistics/', GetUserStatistics.as_view(), name='get-userstatistics'),
]
