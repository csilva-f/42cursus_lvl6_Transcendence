#!/bin/bash
POSTGRES_USER=$(cat "$POSTGRES_USER_FILE")

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
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $POSTGRES_DB"
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f vault.sql

  echo "Database '$POSTGRES_DB' created."
  echo "Table 'vault_kv_store' and index 'parent_path_idx' created or already exist."

else
  echo "Database '$POSTGRES_DB' already exists."
fi
