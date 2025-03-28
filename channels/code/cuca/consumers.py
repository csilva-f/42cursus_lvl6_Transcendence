from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import json
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import CustomUser

from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.generic.websocket import WebsocketConsumer

#eu tenho uma instancia da websocket (canal), nessa instancia conectam-se varios clients
#sempre que algum manda msg, todos os clients do canal "ouvem"

#do lado do client terei de mandar msg com atualização do jogo
#receberei msg com atualizaçoes do jogo que tenho de atualizar

class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"game_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Avisar o grupo que um novo cliente entrou
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_joined",
                "message": "A player joined the game!"
            }
        )
    async def receive(self, text_data):
        # Directly forward the received message without parsing
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "send_raw_message",
                "raw_data": text_data  # Forward as-is
            }
        )

    async def send_raw_message(self, event):
        # Send the raw JSON data directly to WebSocket clients
        await self.send(text_data=event["raw_data"])

    #Versao que protege contra jsons mal formataos
    # async def receive(self, text_data):
    #     try:
    #         data = json.loads(text_data)  # Tentar converter para JSON
    #         await self.channel_layer.group_send(
    #             self.room_group_name,
    #             {
    #                 "type": "send_raw_message",
    #                 "raw_data": json.dumps(data)  # Reenviar como JSON válido
    #             }
    #         )
    #     except json.JSONDecodeError:
    #         print("Mensagem inválida recebida:", text_data) 

    async def disconnect(self, close_code):
        # Avisar o grupo que um jogador saiu
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_left",
                "message": "A player left the game."
            }
        )
        # Remover o cliente do grupo
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Notificar clientes quando alguém entra
    async def player_joined(self, event):
        await self.send(text_data=json.dumps({"message": event["message"]}))

    # Notificar clientes quando alguém sai
    async def player_left(self, event):
        await self.send(text_data=json.dumps({"message": event["message"]}))

online_users = set()  # Armazena os IDs dos utilizadores online

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Aceita a conexão WebSocket."""
        self.room_name="home"
        self.room_group_name = "online_home"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        """Recebe mensagens do cliente (com o ID do user) e atualiza a lista de online."""
        try:
            data = json.loads(text_data)  # Converte JSON para dicionário
            user_id = data.get("user_id")
            if user_id:
                user_id = int(user_id)
                online_users.add(user_id)  # Adiciona o user à lista de online
                self.user_id = user_id  # Guarda o user_id na instância
                await self.update_online_users()
            elif "action" in data and data["action"] == "queryOnline":
                await self.send(text_data=json.dumps({"online_users": list(map(int, online_users))}))
            else:
                await self.send(text_data=json.dumps({"error": "User ID missing"}))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON"}))

    async def disconnect(self, close_code):
        """Remove o utilizador da lista ao desconectar-se."""
        if hasattr(self, "user_id") and self.user_id in online_users:
            online_users.discard(self.user_id)
            await self.update_online_users()

    async def update_online_users(self):
        """Envia a lista atualizada de utilizadores online para todos os clientes."""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "broadcast_online_users",
                "users": list(online_users),
            },
        )

    async def broadcast_online_users(self, event):
        """Envia a lista de utilizadores online para o cliente."""
        await self.send(text_data=json.dumps({"online_users": event["users"]}))