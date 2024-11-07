from django.urls import path
from .views import GetDateTime, PostMyName

urlpatterns = [
    path('get-datetime/', GetDateTime.as_view(), name='get-datetime'),
    path('name/', PostMyName.as_view(), name='name'),
]
