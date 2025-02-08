from django.urls import path
from .consumers import GameConsumer
#from . import consumers

websocket_urlpatterns = [
    path("ws/game/", GameConsumer.as_asgi()),  # Define a rota para o WebSocket do jogo
]

#rita
#websocket_urlpatterns = [
#    path("ws/game/$", consumers.GameConsumer.as_asgi()),  # Define a rota para o WebSocket do jogo
#]
