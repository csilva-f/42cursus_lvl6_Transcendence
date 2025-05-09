# myapp/urls.py
from django.urls import path, include
from rest_framework import routers
from .views import PostRegisterViewSet,PostAuthViewSet, PostRefreshViewSet, EnableOTPViewSet, SendOTPViewSet, VerifyOTPViewSet,VerifyEmailViewSet, \
    RecoverPasswordViewSet, ResetPasswordViewSet, GetOTPStatusViewSet,ValidateTokenViewSet, UpdateProfileViewSet, GetProfileViewSet, ChangePasswordViewSet

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
router.register(r'get-profile', GetProfileViewSet, basename='get-profile')
router.register(r'update-profile', UpdateProfileViewSet, basename='update-profile')
router.register(r'change-password', ChangePasswordViewSet, basename='change-password')

#router.register(r'validate-token', ValidateTokenViewSet, basename='validate-token')


urlpatterns = [
    path('', include(router.urls)),
     path('validate-token/', ValidateTokenViewSet.as_view({'get': 'validate_token'}), name='validate-token'),
]
