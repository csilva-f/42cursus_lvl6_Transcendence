# myapp/urls.py
from django.urls import path, include
from rest_framework import routers
from .views import PostRegisterViewSet,PostAuthViewSet, PostRefreshViewSet

router = routers.DefaultRouter()
router.register(r'register', PostRegisterViewSet, basename='Register')
router.register(r'auth', PostAuthViewSet, basename='Token')
router.register(r'refresh', PostRefreshViewSet, basename='Refresh')

urlpatterns = [
    path('', include(router.urls)),
]
