from django.urls import path
from .views import GetDateTime

urlpatterns = [
    path('get-datetime/', GetDateTime.as_view(), name='get-datetime'),
]
