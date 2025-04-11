from django.shortcuts import render
import requests

def testWebsocket(request):
    return render(request, 'testWebsocket.html')


def gameForceFinish(gameID):
    url = f"http://backend-api:8000/api/update-game-channels/"
    headers = {
        "Content-Type": "application/json"
    }
    print(gameID)
    payload = {
        "gameID": gameID,
        "statusID": 3,
    }
    response = requests.post(url, json=payload, headers=headers)
    print("Entra aqui: ", response)
    return response.json()
