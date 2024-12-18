# myapp/urls.py
from django.urls import path, include
from rest_framework import routers
from .views import OAuthViewSetLogin, OAuthViewSetCallback

router = routers.DefaultRouter()
router.register(r'login', OAuthViewSetLogin, basename='Login')
router.register(r'callback', OAuthViewSetCallback, basename='Callback')


urlpatterns = [
    path('', include(router.urls)),
]
