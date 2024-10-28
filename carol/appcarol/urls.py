from django.urls import path, include
from appcarol.views import register_view, get_users_view, index, game

urlpatterns = [
    #path('', index, name='home'),
    path('', index, name='index'),
    path('register/', register_view, name='create_user'),
    path('users/', get_users_view, name='get_users'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('pong/', game, name='game'),
]
