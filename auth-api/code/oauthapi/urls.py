# myapp/urls.py
from django.urls import path, include
from rest_framework import routers
from .views import OAuthViewSetLogin, OAuthViewSetCallback, OAuthViewSetOAuthLogin

router = routers.DefaultRouter()
router.register(r'login', OAuthViewSetLogin, basename='Login')
router.register(r'oauthlogin', OAuthViewSetOAuthLogin, basename='OAuthLogin')


urlpatterns = [
    path('callback', OAuthViewSetCallback.as_view({'get': 'retrieve'}), name='callback'),
    path('', include(router.urls)),
]
