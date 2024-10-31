from django.urls import path
from .views import default_view, get_current_datetime

urlpatterns = [
    path('', default_view, name='default_view'),
    path('current_datetime/', get_current_datetime, name='get_current_datetime'),
]
