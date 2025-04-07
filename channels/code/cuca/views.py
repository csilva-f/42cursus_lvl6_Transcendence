from django.shortcuts import render
import requests

def testWebsocket(request):
    return render(request, 'testWebsocket.html')


def gameForceFinish(gameInfo):
    url = f"http://backend-api:8000/api/update-game-channels/"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "gameID": gameInfo["gameID"],
        "uid": gameInfo["P1_uid"],
        "statusID": 3,
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()
