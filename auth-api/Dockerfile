FROM python:3.13-alpine3.19

RUN apk add --no-cache --virtual .build-deps gcc musl-dev


WORKDIR /code
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8000
RUN apk del .build-deps
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
