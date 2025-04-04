#!/bin/bash

# Start the email daemon in the background
python manage.py send_mail_daemon &

# Start the Django development server
python manage.py runserver 0.0.0.0:8000
