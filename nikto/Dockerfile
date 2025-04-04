# Use a lightweight base image with Perl
FROM alpine:latest

# Install dependencies
RUN apk add --no-cache perl git openssl perl-net-ssleay perl-lwp-protocol-https

# Clone the latest Nikto repo
RUN git clone https://github.com/sullo/nikto.git /opt/nikto

# Set working directory
WORKDIR /opt/nikto

# Set the entrypoint to run Nikto
ENTRYPOINT ["perl", "/opt/nikto/program/nikto.pl"]
