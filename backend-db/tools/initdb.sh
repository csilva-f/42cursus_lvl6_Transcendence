#!/bin/bash

# Wait for the database to be initialized
while [ ! -f /var/lib/postgresql/data/PG_VERSION ]; do
  sleep 1
done


# Copy the custom pg_hba.conf file to the correct location
cp /tmp/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf
chown postgres:postgres /var/lib/postgresql/data/pg_hba.conf

