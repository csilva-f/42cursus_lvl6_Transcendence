from django.urls import path
from .views import *

urlpatterns = [
    path('', testWebsocket, name='testWebsocket'),
]
