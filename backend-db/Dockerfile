FROM postgres:13

# Copy the pg_hba.conf file to a temporary location
#COPY conf/pg_hba.conf /tmp/pg_hba.conf
#COPY tools/populateStatic.sh tools/populateStatic.sh

RUN chmod 777 /var/lib/postgresql/data -R
#RUN chmod 777 tools/populateStatic.sh
# Create a custom initdb script that copies the pg_hba.conf file
#COPY tools/initdb.sh /docker-entrypoint-initdb.d/initdb.sh
HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD pg_isready -U eva -d backend-db|| exit 1
#RUN chmod +x /docker-entrypoint-initdb.d/initdb.sh
#
