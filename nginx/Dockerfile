FROM owasp/modsecurity-crs:4-nginx-alpine-202503230103

# Switch to root to install packages and copy configs
USER root

RUN apk update && apk add --no-cache openrc openssl && \
    mkdir -p /var/html/www

RUN openrc && touch /run/openrc/softlevel

COPY ./tools/* /nginx/
RUN chmod +x /nginx/*.sh
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./conf/modsecurity.conf /etc/nginx/modsecurity.conf
COPY ./conf/crs-setup.conf /etc/nginx/crs-setup.conf

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=PT/ST=Porto/L=42Porto/O=42/CN=nginx"

# Optional: switch back to original non-root user
# USER <original-user>  # Uncomment and set appropriately if needed

EXPOSE 443

ENTRYPOINT ["/bin/sh", "/nginx/init.sh"]
