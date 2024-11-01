FROM python:3.13-alpine3.19

RUN apk add --no-cache --virtual .build-deps gcc musl-dev


WORKDIR /code
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN apk del .build-deps
# Expose the port
# Command to run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8002"]
#CMD ["gunicorn", "--bind", "0.0.0.0:8001", "--reload", "ft_transcendence.wsgi:application"]
