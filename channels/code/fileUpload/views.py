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
            user = ProfileImage.objects.update_or_create(name=request.data['user'], image=request.FILES['image'])
            count = ProfileImage.objects.filter(name=request.data['user']).count()
            print(count)
            image = ProfileImage.objects.filter(name=request.data['user']).order_by('-created_at').first()
            extension = image.image.url.split('.')[-1]
            filename = request.data['user'] + '.' + extension
            return Response({'message': 'Image uploaded successfully!', 'filename' : filename}, status=status.HTTP_200_OK)
        except(TypeError, ValueError, OverflowError):
            return Response({'error': 'Invalid form data!'}, status=status.HTTP_400_BAD_REQUEST)
            #except (TypeError, ValueError, OverflowError):
        #return Response({'error': 'Upload Failed!'}, status=status.HTTP_400_BAD_REQUEST)
