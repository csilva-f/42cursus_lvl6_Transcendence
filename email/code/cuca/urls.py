from django.urls import path
from .views import send_email
urlpatterns = [
    path('', send_email, name='send_email'),
]
