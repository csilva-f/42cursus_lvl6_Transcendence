from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render, redirect
from appcarol.models import User
from django.utils import timezone
from django.contrib import messages
from django.contrib.auth import login
from .forms import CustomUserCreationForm

def index(request):
    # Render home section
    return render(request, 'main.html', {'section': 'home'})

def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # Log the user in after registration
            return redirect('index')  # Redirect to the home page
    else:
        form = CustomUserCreationForm()
    return render(request, 'registration/register.html', {'form': form})

def get_users_view(request):
    users = User.objects.all()
    return render(request, 'main.html', {'section': 'user_list', 'users': users})

def game(request):
    return render(request, 'game.html')