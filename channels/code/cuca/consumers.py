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
        self.room_group_name = "game_room"
        # await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Avisar o grupo que um novo cliente entrou
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_joined",
                "message": "Um novo jogador entrou na sala!"
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
                "message": "Um jogador saiu da sala."
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



#Codigo antigo com as primeiras explicações:

#Conssumer Assync
# class GameConsumer(AsyncWebsocketConsumer):
#     #This method is called when a WebSocket connection is initiated by a client.
#     async def connect(self):
#         print(f"New connection: {self}")
#         #Accepts the WebSocket connection. If this is not called, the connection will be refused.
#         await self.accept()
#         #Sends a JSON message to the client.
#         #Converts a Python dictionary into a JSON string.
#         await self.send(text_data=json.dumps({
#             'message': 'Connection is successfull'
#         }))
#     #This method is called when the WebSocket connection is closed.
#     #Currently, this method does nothing. You might want to log disconnections or clean up resources.
#     async def disconnect(self, close_code):
#         print(f"Client disconnected with code {close_code}")

#     #This method is triggered whenever the WebSocket receives a message from the client.
#     #Example of client message:
#         #{"mensagem": "Hello Server!"}
#     async def receive(self, text_data):
#     try:
#         data = json.loads(text_data)
#         mensagem = data.get("mensagem", "No message provided")
#         await self.send(text_data=json.dumps({"mensagem": f"You said: {mensagem}"}))
#     except json.JSONDecodeError:
#         await self.send(text_data=json.dumps({"error": "Invalid JSON"}))