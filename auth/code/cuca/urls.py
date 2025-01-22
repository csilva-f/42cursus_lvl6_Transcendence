from django.urls import path
from .views import UserCreate, ValidateEmailView, RecoverPasswordAPIView, ResetPasswordAPIView, ChangePasswordAPIView

urlpatterns = [
    path('', UserCreate.as_view(), name='UserCreate'),
    path('validate-email/', ValidateEmailView.as_view(), name='validate_email'),
    path('recover-password/', RecoverPasswordAPIView.as_view(), name='recover-password'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordAPIView.as_view(), name='reset-password'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),

]
