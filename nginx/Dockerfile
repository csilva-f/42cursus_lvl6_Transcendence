FROM alpine:3.19
RUN apk update && \
    apk add --no-cache nginx openssl openrc && \
    rm -rf /var/cache/apk/* && \
    mkdir -p /nginx && mkdir -p /var/html/www


RUN openrc
RUN touch /run/openrc/softlevel

COPY ./tools/* /nginx 
RUN chmod +x /nginx/*.sh
#COPY ./init.sql /mariadb




COPY ./tools/index.html /var/html/www/

COPY ./conf/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com"


EXPOSE 443

ENTRYPOINT ["/bin/sh", "/nginx/init.sh"]
