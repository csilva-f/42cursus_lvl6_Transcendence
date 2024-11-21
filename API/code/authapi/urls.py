# myapp/urls.py
from django.urls import path, include
from rest_framework import routers
from .views import PostRegisterViewSet,PostAuthViewSet, PostRefreshViewSet, EnableOTPViewSet, SendOTPViewSet, VerifyOTPViewSet,VerifyEmailViewSet, \
    RecoverPasswordViewSet, ResetPasswordViewSet, GetOTPStatusViewSet

router = routers.DefaultRouter()
router.register(r'register', PostRegisterViewSet, basename='Register')
router.register(r'auth', PostAuthViewSet, basename='Token')
router.register(r'refresh', PostRefreshViewSet, basename='Refresh')
router.register(r'otp-enable', EnableOTPViewSet, basename='Enable')
router.register(r'otp-send', SendOTPViewSet, basename='send_otp')
router.register(r'otp-verify', VerifyOTPViewSet, basename='verify_otp')
router.register(r'otp-status', GetOTPStatusViewSet, basename='otp-status')
router.register(r'validate-email', VerifyEmailViewSet, basename='verify_email')
router.register(r'recover-password', RecoverPasswordViewSet, basename='recover-password')
router.register(r'reset-password', ResetPasswordViewSet, basename='reset-password')


urlpatterns = [
    path('', include(router.urls)),
]
