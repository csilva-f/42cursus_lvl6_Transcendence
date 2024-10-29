from django.shortcuts import render, redirect
from django.http import HttpResponse
from appcarol.models import User
from django.utils import timezone
from django.contrib import messages
from django.contrib.auth import login, update_session_auth_hash, authenticate
from .forms import CustomUserCreationForm, CustomUserEditForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm, AuthenticationForm #UserChangeForm

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

@login_required
def get_users_view(request):
    users = User.objects.all()
    return render(request, 'main.html', {'section': 'user_list', 'users': users})

def game(request):
    return render(request, 'game.html')

@login_required
def edit_profile_view(request):
    if request.method == 'POST':
        form = CustomUserEditForm(request.POST, instance=request.user)
        if form.is_valid():
            # Check if any fields have changed
            if not form.has_changed():
                messages.error(request, "No changes were made to the user's information")
                return redirect('edit_user')  # Redirect back to edit profile with an error message
            
            # If changes were made, temporarily store form data and redirect to password confirmation
            request.session['profile_data'] = form.cleaned_data
            return redirect('confirm_password')
    else:
        form = CustomUserEditForm(instance=request.user)

    return render(request, 'main.html', {'form': form, 'section': 'edit_user'})

@login_required
def confirm_password_view(request):
    if request.method == 'POST':
        password = request.POST.get('password')
        user = authenticate(username=request.user.username, password=password)
        
        if user is not None:
            profile_data = request.session.pop('profile_data', None)
            if profile_data:
                request.user.first_name = profile_data['first_name']
                request.user.last_name = profile_data['last_name']
                request.user.email = profile_data['email']
                request.user.save()

            messages.success(request, "Your profile was successfully updated.")
            return redirect('index')  # Redirect to the home page with the message
        else:
            messages.error(request, "Incorrect password. Please try again.")
            return redirect('edit_user')
    
    form = AuthenticationForm()
    return render(request, 'main.html', {'form': form, 'section': 'confirm_password'})

@login_required
def change_password_view(request):
    if request.method == 'POST':
        password_form = PasswordChangeForm(request.user, request.POST)
        if password_form.is_valid():
            password_form.save()
            update_session_auth_hash(request, password_form.user)  # Keeps user logged in after password change
            messages.success(request, "Your password was successfully updated")
            return redirect('index')
    else:
        password_form = PasswordChangeForm(request.user)

    return render(request, 'main.html', {'password_form': password_form, 'section': 'change_password'})