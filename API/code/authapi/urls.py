# myapp/urls.py
from django.urls import path, include
from rest_framework import routers
from .views import PostRegisterViewSet,PostAuthViewSet, PostRefreshViewSet, EnableOTPViewSet, SendOTPViewSet, VerifyOTPViewSet

router = routers.DefaultRouter()
router.register(r'register', PostRegisterViewSet, basename='Register')
router.register(r'auth', PostAuthViewSet, basename='Token')
router.register(r'refresh', PostRefreshViewSet, basename='Refresh')
router.register(r'otp-enable', EnableOTPViewSet, basename='Enable')
router.register(r'otp-send', SendOTPViewSet, basename='send_otp')
router.register(r'otp-verify', VerifyOTPViewSet, basename='verify_otp')


urlpatterns = [
    path('', include(router.urls)),
]
