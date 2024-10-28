FROM postgres:13

# Copy the pg_hba.conf file to a temporary location
COPY conf/pg_hba.conf /tmp/pg_hba.conf

RUN chmod 777 /var/lib/postgresql/data
# Create a custom initdb script that copies the pg_hba.conf file
COPY tools/initdb.sh /docker-entrypoint-initdb.d/initdb.sh
RUN chmod +x /docker-entrypoint-initdb.d/initdb.sh
