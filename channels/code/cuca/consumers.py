from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import json

#from channels.generic.websocket import WebsocketConsumer ??

#eu tenho uma instancia da websocket (canal), nessa instancia conectam-se varios clients
#sempre que algum manda msg, todos os clients do canal "ouvem"

#do lado do client terei de mandar msg com atualização do jogo
#receberei msg com atualizaçoes do jogo que tenho de atualizar

class GameConsumer(AsyncWebsocketConsumer):
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
        try:
            data = json.loads(text_data)
            message = data.get("message", "No message provided")
            username = data.get("username", "Incognito") 

            # Send the message to all clients in the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "send_message",
                    "message": message,
                    "username": username
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON"}))

    async def send_message(self, event):
        message = event["message"]
        username = event.get("username", "Incognito")

        # Send message with username
        await self.send(text_data=json.dumps({"username": username, "message": message}))

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

#versao com json e fila de espera do projeto do mario
# import json
# import secrets

# from channels.exceptions import StopConsumer
# from channels.generic.websocket import AsyncJsonWebsocketConsumer

# from .middleware import GameMiddleware


# class GameConsumer(AsyncJsonWebsocketConsumer):
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self.room_group_name = None
#         self.game_player_amount = None
#         self.queue = None

#     async def check_queue(self):
#         players = {}
#         if len(self.queue) % self.game_player_amount == 0:
#             game_uid = secrets.token_urlsafe()
#             selected_users = {}
#             for index in range(self.game_player_amount):
#                 user_id = int(next(iter(self.queue)))
#                 selected_users[user_id] = self.queue[user_id]
#                 players[f"player_{index + 1}"] = user_id
#                 self.queue.pop(user_id, None)

#             await self.channel_layer.group_send(
#                 self.room_group_name, {
#                     "type": "system.grouping",
#                     "data": {
#                         "game_uid": game_uid,
#                         "players": players
#                     }
#                 }
#             )

#             for user_id, channel_name in selected_users.items():
#                 await self.channel_layer.group_discard(
#                     self.room_group_name, channel_name
#                 )
#                 await self.channel_layer.group_add(
#                     f"game_{game_uid}", channel_name
#                 )

#             for user_id, channel_name in selected_users.items():
#                 await self.channel_layer.group_send(
#                     f"game_{game_uid}", {
#                         "type": "system.message",
#                         "data": {
#                             "message": "user.connected",
#                             "user_id": user_id
#                         }
#                     }
#                 )
#         else:
#             for index, user_id in enumerate(self.queue.keys()):
#                 players[f"player_{index + 1}"] = user_id
#             await self.channel_layer.group_send(
#                 self.room_group_name, {
#                     "type": "system.grouping",
#                     "data": {
#                         "players": players
#                     }
#                 }
#             )

#     async def connect(self):
#         user_id = self.scope["user"]
#         game_id = self.scope["url_route"]["kwargs"]["game_id"]
#         self.game_player_amount = int(self.scope["url_route"]["kwargs"]["player_amount"])
#         self.room_group_name = f"game_{game_id}_queue_{self.game_player_amount}"

#         self.queue = GameMiddleware.queue.setdefault(self.room_group_name, {})
#         self.queue[user_id] = self.channel_name

#         # Join room group
#         await self.channel_layer.group_add(
#             self.room_group_name, self.channel_name
#         )

#         await self.accept("Authorization")
#         await self.check_queue()

#     async def disconnect(self, close_code):
#         self.queue.pop(self.scope["user"], None)

#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 "type": "system.message",
#                 "data": {
#                     "message": "user.disconnected",
#                     "user_id": self.scope["user"]
#                 }
#             }
#         )

#         # Leave room group
#         await self.channel_layer.group_discard(
#             self.room_group_name, self.channel_name
#         )

#         raise StopConsumer()

#     async def receive(self, text_data=None, bytes_data=None, **kwargs):
#         if "queue" in self.room_group_name:
#             return

#         try:
#             data = json.loads(text_data)
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     "type": "user.message",
#                     "channel_name": self.channel_name,
#                     "data": data
#                 }
#             )
#         except json.decoder.JSONDecodeError:
#             pass

#     async def user_message(self, event):
#         if event["channel_name"] != self.channel_name:
#             await self.send(text_data=json.dumps({
#                 "type": event["type"],
#                 "data": event["data"]
#             }))

#     async def system_message(self, event):
#         await self.send(text_data=json.dumps({
#             "type": event["type"],
#             "data": event["data"]
#         }))

#     async def system_grouping(self, event):
#         if self.scope["user"] in event["data"]["players"].values():
#             if "game_uid" in event["data"]:
#                 self.room_group_name = f"game_{event['data']['game_uid']}"
#             await self.send(text_data=json.dumps({
#                 "type": event["type"],
#                 "data": {
#                     "players": event["data"]["players"]
#                 }
#             }))

# class GameMiddleware(BaseMiddleware):
#     queue = {}

#     def __init__(self, inner):
#         super().__init__(inner)
#         self.inner = inner

#     async def __call__(self, scope, receive, send):
#         user = scope["user"]
#         game_id = scope["url_route"]["kwargs"]["game_id"]
#         game_player_amount = scope["url_route"]["kwargs"]["player_amount"]
#         room_group_name = f"game_{game_id}_queue_{game_player_amount}"
#         if user in self.queue.get(room_group_name, {}).keys():
#             # Deny the connection
#             denier = WebsocketDenier()
#             return await denier(scope, receive, send)
#         return await super().__call__(scope, receive, send)