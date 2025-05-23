from django.urls import path
from .views import *

urlpatterns = [
    path('get-games/', GetGames.as_view(), name='get-games'),
    path('get-tournaments/', GetTournaments.as_view(), name='get-tournments'),
    path('create-game/', PostAddGame.as_view(), name='create-game'),
    path('create-tournament/', PostAddTournament.as_view(), name='create-tournament'),
    path('update-game/', PostUpdateGame.as_view(), name='update-game'),
    path('update-game-channels/', PostUpdateGameChannels.as_view(), name='update-game-channels'),
    path('create-userextension/', PostAddUserExtension.as_view(), name='create-userextension'),
    path('get-genders/', GetGenders.as_view(), name='get-genders'),
    path('get-userextensions/', GetUserExtensions.as_view(), name='get-userextensions'),
    path('get-status/', GetStatus.as_view(), name='get-status'),
    path('update-tournament/', PostUpdateTournament.as_view(), name='update-tournament'),
    path('get-phases/', GetPhases.as_view(), name='get-phases'),
    path('join-tournament/', PostJoinTournament.as_view(), name='join-tournament'),
    path('update-userextension/', PostUpdateUserExtension.as_view(), name='update-userextension'),
    path('get-userstatistics/', GetUserStatistics.as_view(), name='get-userstatistics'),
    path('accept-gameinvitation/', PostAcceptGameInvit.as_view(), name='accept-gameinvitation'),
    path('get-userinvitations/', GetUserInvitations.as_view(), name='get-userinvitations'),
    path('get-usernbrinvitations/', GetUserNbrInvitations.as_view(), name='get-usernbrinvitations'),
    path('get-usergames/', GetUserGames.as_view(), name='get-usergames'),
    path('get-friendshipstatus/', GetFriendshipStatus.as_view(), name='get-friendshipstatus'),
    path('get-friendships/', GetFriendships.as_view(), name='get-friendships'),
    path('send-friendrequest/', PostSendFriendRequest.as_view(), name='send-friendrequest'),
    path('respond-friendrequest/', PostRespondFriendRequest.as_view(), name='respond-friendrequest'),
    path('get-friendrequests/', GetPendingRequests.as_view(), name='get-friendrequests'),
    path('get-nonfriendslist/', GetNonFriendsList.as_view(), name='get-nonfriendslist'),
    path('get-topusers/', GetTopUsers.as_view(), name='get-topusers'),
    path('update-gameTS/', PostUpdateGameTS.as_view(), name='update-gameTS'),
]
