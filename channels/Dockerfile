FROM python:3.13-alpine3.19

RUN apk add --no-cache --virtual .build-deps gcc musl-dev bash curl wait4x


WORKDIR /code
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN apk del .build-deps
# Expose the port
EXPOSE 8000
# Command to run the application
RUN apk add bash curl
COPY tools/wait-for-it.sh /tools/wait-for-it.sh
COPY tools/entrypoint.sh /tools/entrypoint.sh
COPY tools/healthcheck.sh /tools/healthcheck.sh

RUN chmod +x /tools/wait-for-it.sh
RUN chmod +x /tools/entrypoint.sh
RUN chmod +x /tools/healthcheck.sh
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD ["/bin/sh", "/tools/healthcheck.sh"]
ENTRYPOINT ["/bin/sh","/tools/entrypoint.sh"]
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
#CMD ["gunicorn", "--bind", "0.0.0.0:8001", "--reload", "ft_transcendence.wsgi:application"]
