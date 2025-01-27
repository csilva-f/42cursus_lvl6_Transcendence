"""
ASGI config for ft_transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apigateway.routing import websocket_urlpatterns  # Importa as rotas WebSocket

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ft_transcendence.settings')

# Configuração ASGI para suportar HTTP e WebSocket
application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Suporte para pedidos HTTP normais
    "websocket": AuthMiddlewareStack(  # Middleware para autenticar WebSockets
        URLRouter(websocket_urlpatterns)  # Rotas de WebSocket definidas em routing.py
    ),
})
