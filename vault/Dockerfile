FROM hashicorp/vault:1.18
WORKDIR /vault
EXPOSE 8200
COPY ./tools/init.sh ./init.sh
COPY ./tools/healthcheck.sh ./healthcheck.sh

#COPY ./conf/vault.hcl ./vault.hcl
RUN chmod +x ./init.sh ./healthcheck.sh

HEALTHCHECK --interval=30s --timeout=30s --retries=3 CMD ["/bin/sh","/vault/healthcheck.sh"]
ENTRYPOINT ["./init.sh"]
#CMD ["server", "-dev", "-dev-root-token-id=myroot"]
#CMD ["tail -f /dev/null"]
