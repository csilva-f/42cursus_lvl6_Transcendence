from django.urls import path
from .views import VerifyOTPView, SendOTPView, Enable2FAView, GetOtpStatus

urlpatterns = [
    path('enable/', Enable2FAView.as_view(), name='enable'),
    path('send/', SendOTPView.as_view(), name='send_otp'),
    path('verify/', VerifyOTPView.as_view(), name='verify_otp'),
    path('get-otp', GetOtpStatus.as_view(), name='get_otp'),
]
