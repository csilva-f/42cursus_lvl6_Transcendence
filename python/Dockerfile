FROM python:3.13-alpine3.19

RUN apk add --no-cache --virtual .build-deps gcc musl-dev


WORKDIR /code
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN apk del .build-deps
# Expose the port
EXPOSE 8000
# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "ft_transcendence.wsgi:application"]
