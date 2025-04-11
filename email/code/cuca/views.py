from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import send_mail

@api_view(['POST'])
def send_email(request):
    subject = request.data.get('subject')
    message = request.data.get('message')
    from_email = request.data.get('from_email')
    recipient_list = request.data.get('recipient_list')

    # Send the email using django-mailer
    response = send_mail(subject, message, from_email, recipient_list)
    return Response({'status': 'Email sent'}, status=status.HTTP_200_OK)
