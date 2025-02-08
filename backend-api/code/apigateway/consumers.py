from channels.generic.websocket import AsyncWebsocketConsumer
import json

#Conssumer Assync
class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        mensagem = text_data_json['mensagem']

        await self.send(text_data=json.dumps({
            'mensagem': mensagem
        }))

