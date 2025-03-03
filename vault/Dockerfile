FROM hashicorp/vault:1.18
WORKDIR /vault
EXPOSE 8200
COPY ./tools/init.sh ./init.sh
#COPY ./conf/vault.hcl ./vault.hcl
RUN chmod +x ./init.sh

CMD ["./init.sh"]
#CMD ["server", "-dev", "-dev-root-token-id=myroot"]
#CMD ["tail -f /dev/null"]
