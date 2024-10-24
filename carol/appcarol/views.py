from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

from django.shortcuts import render, redirect
from appcarol.models import User
from django.utils import timezone
from django.contrib import messages  # Import for displaying messages

def create_user_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Validate required fields
        if not all([name, username, password]):
            return HttpResponse("All fields are required.", status=400)

        # Save the new user
        User.objects.create(name=name, username=username, password=password)
        return redirect('get_users')  # Redirect to the user list after creation

    return render(request, 'create_user.html')

def get_users_view(request):
    users = User.objects.all()
    return render(request, 'user_list.html', {'users': users})

def login_user_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Check if the user exists and the password matches
        try:
            user = User.objects.get(username=username, password=password)
            # Update the last_login timestamp
            user.last_login = timezone.now()
            user.save()

            return redirect('get_users')
        except User.DoesNotExist:
            messages.error(request, "Invalid username or password.")
            return redirect('login_user')

    return render(request, 'login.html')
