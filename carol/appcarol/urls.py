from django.urls import path

from . import views
from appcarol.views import create_user_view, get_users_view

urlpatterns = [
    path("", views.index, name="index"),
    path('create-user/', create_user_view, name='create_user'),
    path('users/', get_users_view, name='get_users'),
]
