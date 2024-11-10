# myapp/urls.py
from django.urls import path, include
from rest_framework import routers
from .views import GetDateTimeViewSet,HelloWorldViewSet

router = routers.DefaultRouter()
router.register(r'current_datetime', GetDateTimeViewSet, basename='current_datetime')
router.register(r'hello_world', HelloWorldViewSet, basename='hello_world')

urlpatterns = [
    path('', include(router.urls)),
]
