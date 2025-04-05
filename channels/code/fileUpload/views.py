from django.shortcuts import render
from .forms import ProfileImageForm
from .models import ProfileImage
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
# Create your views here.

class imageUpload(generics.GenericAPIView):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            user = ProfileImage.objects.create(name=request.data['user'], image=request.FILES['image'])
            image = ProfileImage.objects.filter(name=request.data['user']).order_by('-created_at').first()
            filename = image.image.url.split('/')[-1]
            return Response({'message': 'Image uploaded successfully!', 'filename' : filename}, status=status.HTTP_200_OK)
        except(TypeError, ValueError, OverflowError):
            return Response({'error': 'Invalid form data!'}, status=status.HTTP_400_BAD_REQUEST)
