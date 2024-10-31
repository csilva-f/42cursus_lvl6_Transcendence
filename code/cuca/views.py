from django.shortcuts import render
from datetime import datetime
from django.http import JsonResponse

def default_view(request):

    return render(request, 'index.html')


def get_current_datetime(request):
    current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return JsonResponse({'current_datetime': current_datetime})
