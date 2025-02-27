#!/bin/bash

# Wait for the database to be initialized
while [ ! -f /var/lib/postgresql/data/PG_VERSION ]; do
  sleep 1
done

# Copy the custom pg_hba.conf file to the correct location
cp /tmp/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf
chown postgres:postgres /var/lib/postgresql/data/pg_hba.conf


# Check if the database already exists
DB_EXISTS=$(psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$POSTGRES_DB'")

if [ "$DB_EXISTS" != "1" ]; then
    echo "Database '$POSTGRES_DB' does not exist."
  # Create the database if it does not exist
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $POSTGRES_DB;"
  echo "Database '$POSTGRES_DB' created."

  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c
  "CREATE TABLE IF NOT EXISTS vault_kv_store (
    parent_path TEXT COLLATE "C" NOT NULL,
    path        TEXT COLLATE "C",
    key         TEXT COLLATE "C",
    value       BYTEA,
    CONSTRAINT pkey PRIMARY KEY (path, key)
  );

  CREATE INDEX IF NOT EXISTS parent_path_idx ON vault_kv_store (parent_path);"


  echo "Table 'vault_kv_store' and index 'parent_path_idx' created or already exist."

else
  echo "Database '$POSTGRES_DB' already exists."
fi
