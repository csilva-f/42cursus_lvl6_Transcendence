#!/bin/bash
set -e

# Wait for the database and vault to be ready
/tools/wait-for-it.sh auth:8000 --timeout=30 --strict -- echo "auth-db is up"
/tools/wait-for-it.sh vault:8200 --timeout=30 --strict -- echo "vault is up"
/tools/wait-for-it.sh redis:6379 --timeout=30 --strict -- echo "redis is up"
# Run Django migrations and start the server
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
