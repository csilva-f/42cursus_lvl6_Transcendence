from django.urls import path
from .views import OAuthViewSet


oauth_viewset = OAuthViewSet.as_view({
    'get': 'login',
})

oauth_callback_viewset = OAuthViewSet.as_view({
    'get': 'callback',
})

urlpatterns = [
    path('login/', oauth_viewset, name='login'),
    path('callback/', oauth_callback_viewset, name='callback'),

]
