from django.urls import path
from .views import UserCreate, ValidateEmailView

urlpatterns = [
    path('', UserCreate.as_view(), name='UserCreate'),
    path('validate-email/<uidb64>/<token>/', ValidateEmailView.as_view(), name='validate_email'),
]
