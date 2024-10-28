from django.shortcuts import render

def default_view(request):

    return render(request, 'index.html')
