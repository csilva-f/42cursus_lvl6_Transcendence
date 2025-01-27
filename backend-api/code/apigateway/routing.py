from django.urls import path
from .consumers import GameConsumer

websocket_urlpatterns = [
    path("ws/game/", GameConsumer.as_asgi()),  # Define a rota para o WebSocket do jogo
]
