from django.urls import path
from .views import *

urlpatterns = [
    path('', imageUpload.as_view(), name='imageUpload'),
]
