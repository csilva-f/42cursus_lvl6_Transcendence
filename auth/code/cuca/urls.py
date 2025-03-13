from django.urls import path
from .views import UserCreate, ValidateEmailView, RecoverPasswordAPIView, ResetPasswordAPIView, ChangePasswordAPIView,ValidateTokenView, GetProfileAPIView, UpdateProfileAPIView

urlpatterns = [
    path('', UserCreate.as_view(), name='UserCreate'),
    path('validate-email/', ValidateEmailView.as_view(), name='validate_email'),
    path('recover-password/', RecoverPasswordAPIView.as_view(), name='recover-password'),
    path('reset-password/', ResetPasswordAPIView.as_view(), name='reset-password'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('validate-token/', ValidateTokenView.as_view(), name='validate-token'),
    path('get-profile/', GetProfileAPIView.as_view(), name='get-profile'),
    path('update-profile/', UpdateProfileAPIView.as_view(), name='update-profile'),
]
