from django.urls import path
from .views import default_view

urlpatterns = [
    path('', default_view, name='default_view'),
]
