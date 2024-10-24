from django.urls import path

from . import views
from appcarol.views import create_user_view, get_users_view, login_user_view, index

urlpatterns = [
    path("", views.index, name="index"),
    path('', index, name='home'),  # Home page route
    path('create-user/', create_user_view, name='create_user'),
    path('users/', get_users_view, name='get_users'),
    path('login/', login_user_view, name='login_user'),
]
