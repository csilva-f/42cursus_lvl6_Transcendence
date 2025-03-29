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
            ProfileImage.objects.get_or_create(name=request.data['user'], image=request.FILES['image'])
            return Response({'message': 'Image uploaded successfully!'}, status=status.HTTP_200_OK)
        except(TypeError, ValueError, OverflowError):
            return Response({'error': 'Invalid form data!'}, status=status.HTTP_400_BAD_REQUEST)
            #except (TypeError, ValueError, OverflowError):
        #return Response({'error': 'Upload Failed!'}, status=status.HTTP_400_BAD_REQUEST)
