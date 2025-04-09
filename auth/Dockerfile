FROM python:3.13-alpine3.19

RUN apk add --no-cache --virtual .build-deps gcc musl-dev


WORKDIR /code
COPY requirements.txt .
RUN apk add bash curl
COPY tools/wait-for-it.sh /tools/wait-for-it.sh
COPY tools/entrypoint.sh /tools/entrypoint.sh
RUN chmod +x /tools/wait-for-it.sh
RUN chmod +x /tools/entrypoint.sh

RUN pip install --no-cache-dir -r requirements.txt

RUN apk del .build-deps
# Expose the port
EXPOSE 8000
# Command
RUN apk add bash curl
COPY tools/wait-for-it.sh /tools/wait-for-it.sh
COPY tools/entrypoint.sh /tools/entrypoint.sh
RUN chmod +x /tools/wait-for-it.sh
RUN chmod +x /tools/entrypoint.sh
ENTRYPOINT ["/bin/sh","/tools/entrypoint.sh"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/healthcheck/ || exit 1
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
#CMD ["gunicorn", "--bind", "0.0.0.0:8001", "--reload", "ft_transcendence.wsgi:application"]
