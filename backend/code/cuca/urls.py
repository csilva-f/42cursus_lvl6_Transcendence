from django.urls import path
from .views import get_current_datetime

urlpatterns = [
    path('current_datetime/', get_current_datetime, name='get_current_datetime'),
]
