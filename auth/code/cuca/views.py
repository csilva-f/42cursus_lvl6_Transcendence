from rest_framework import generics, status, serializers
from rest_framework.response import Response
from .serializer import UserSerializer
from django.contrib.auth.models import User
from .models import CucaUser

class UserCreate(generics.CreateAPIView):
    queryset = CucaUser.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
