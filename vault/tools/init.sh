#!/bin/sh

# Start Vault in the background
vault server -dev -dev-root-token-id=myroot -dev-listen-address=0.0.0.0:8200 &
# Wait for Vault to start
sleep 5

# Set the VAULT_ADDR environment variable to use HTTP
export VAULT_ADDR="http://0.0.0.0:8200"

# Initialize Vault if it is not already initialized
if ! vault status | grep -q 'Initialized'; then
  echo "Initializing Vault..."
  vault operator init -key-shares=1 -key-threshold=1 > /tmp/init_output.txt
  # Extract the unseal key and root token
  UNSEAL_KEY=$(grep 'Unseal Key 1:' /tmp/init_output.txt | awk '{print $NF}')
  ROOT_TOKEN=$(grep 'Initial Root Token:' /tmp/init_output.txt | awk '{print $NF}')

  # Unseal Vault using the unseal key
  echo "Unsealing Vault..."
  vault operator unseal "$UNSEAL_KEY"

  # Store the root token in an environment variable or a file
  echo "Root Token: $ROOT_TOKEN"

else
  echo "Vault is already initialized."
    ROOT_TOKEN=myroot
  vault login $ROOT_TOKEN

  # Enable the database secrets engine
  #
    if ! vault secrets list | grep -q "database/"; then
        echo "Enabling the database secrets engine..."
        vault secrets enable database

        # Configure the PostgreSQL database connection
        vault write database/config/config-auth-db \
            plugin_name=postgresql-database-plugin \
            allowed_roles="role-auth-db" \
            connection_url="postgresql://{{username}}:{{password}}@auth-db:5432/auth-db?sslmode=disable" \
            username="eva" \
            password="gina"  # Replace with actual credentials

        # Create the role for Django
        vault write database/roles/role-auth-db \
            db_name=config-auth-db \
            creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}'; GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO {{name}};" \
            default_ttl="1h" \
            max_ttl="24h"

        vault write -f database/rotate-root/config-auth-db
    else
        echo "Database secrets engine is already enabled."
    fi
fi

# Keep the container running
tail -f /dev/null
