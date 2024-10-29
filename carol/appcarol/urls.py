from django.urls import path, include
from appcarol.views import register_view, get_users_view, index, game, edit_profile_view, confirm_password_view, change_password_view

urlpatterns = [
    #path('', index, name='home'),
    path('', index, name='index'),
    path('register/', register_view, name='create_user'),
    path('users/', get_users_view, name='get_users'),
    path('edit_profile/', edit_profile_view, name='edit_user'),
    path('confirm_password/', confirm_password_view, name='confirm_password'),
    path('change_password/', change_password_view, name='change_password'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('pong/', game, name='game'),
]
