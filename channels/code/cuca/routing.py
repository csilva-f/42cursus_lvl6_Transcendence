# from django.urls import path
# from .consumers import GameConsumer
# #from . import consumers

# websocket_urlpatterns = [
#     path("ws/game/", GameConsumer.as_asgi()),  # Define a rota para o WebSocket do jogo
# ]

from django.urls import re_path
from .consumers import GameConsumer, OnlineStatusConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_name>\w+)/$', GameConsumer.as_asgi()),
    re_path(r'ws/home/$', OnlineStatusConsumer.as_asgi()),
]

