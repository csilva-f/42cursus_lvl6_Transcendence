#!/bin/sh
POSTGRES_USER=$(cat "$POSTGRES_USER_FILE")
POSTGRES_PASSWORD=$(cat "$POSTGRES_PASSWORD_FILE")

chmod 777 /vault -R
cat <<EOF > /vault/vault.hcl
storage "postgresql" {
    connection_url = "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_DB}:5432/${POSTGRES_DB}?sslmode=disable"
}

listener "tcp" {
    address     = "0.0.0.0:8200"
    tls_disable = 1  # Set to 0 for production with TLS
}

api_addr = "http://127.0.0.1:8200"
cluster_addr = "http://127.0.0.1:8201"
EOF

# Start Vault in the background
#vault server -dev -dev-root-token-id=myroot -dev-listen-address=0.0.0.0:8200 &
vault server -config=/vault/vault.hcl &
# Wait for Vault to start
sleep 5

# Set the VAULT_ADDR environment variable to use HTTP
export VAULT_ADDR="http://vault:8200"
if ! vault status | grep -q 'Initialized        true'; then
  echo "Initializing Vault..."
  vault operator init -key-shares=1 -key-threshold=1 > /vault/file/init_output.txt
  # Extract the unseal key and root token
  UNSEAL_KEY=$(grep 'Unseal Key 1:' /vault/file/init_output.txt | awk '{print $NF}')
  ROOT_TOKEN=$(grep 'Initial Root Token:' /vault/file/init_output.txt | awk '{print $NF}')

  # Unseal Vault using the unseal key
  echo "Unsealing Vault..."
  vault operator unseal "$UNSEAL_KEY"

  # Store the root token in an environment variable or a file
  echo "Root Token: $ROOT_TOKEN" > /vault/file/root_token.txt
  echo $ROOT_TOKEN > /vault/secrets/VAULT_ROOT_TOKEN.txt
  vault login $ROOT_TOKEN
else
  echo "Vault is already initialized"
  UNSEAL_KEY=$(grep 'Unseal Key 1:' /vault/file/init_output.txt | awk '{print $NF}')
  echo "Unsealing Vault..."
  vault operator unseal "$UNSEAL_KEY"
  ROOT_TOKEN=$(grep 'Root Token:' /vault/file/root_token.txt | awk '{print $NF}')
  vault login $ROOT_TOKEN
fi

echo $ROOT_TOKEN > /vault/secrets/VAULT_ROOT_TOKEN.txt

echo "Enabling the database secrets engine..."
vault secrets enable database
vault secrets enable -path=secret kv

if ! vault secrets list | grep -q "database/config/config-auth-db"; then
    # Configure the PostgreSQL database connection
    vault write database/config/config-auth-db \
        plugin_name=postgresql-database-plugin \
        allowed_roles="role-auth-db" \
        connection_url="postgresql://{{username}}:{{password}}@${AUTH_DB}:${AUTH_PORT}/${AUTH_DB}?sslmode=disable" \
        username="${POSTGRES_USER}" \
        password="${POSTGRES_PASSWORD}"
fi

if ! vault secrets list | grep -q "database/config/config-backend-db"; then
    vault write database/config/config-backend-db \
        plugin_name=postgresql-database-plugin \
        allowed_roles="role-backend-db" \
        connection_url="postgresql://{{username}}:{{password}}@${BACKEND_DB}:${BACKEND_PORT}/${BACKEND_DB}?sslmode=disable" \
        username="${POSTGRES_USER}" \
        password="${POSTGRES_PASSWORD}"
fi

if ! vault secrets list | grep -q "database/config/config-email-db"; then
    vault write database/config/config-email-db \
        plugin_name=postgresql-database-plugin \
        allowed_roles="role-email-db" \
        connection_url="postgresql://{{username}}:{{password}}@${EMAIL_DB}:${EMAIL_PORT}/${EMAIL_DB}?sslmode=disable" \
        username="${POSTGRES_USER}" \
        password="${POSTGRES_PASSWORD}"
fi

if ! vault secrets list | grep -q "database/roles/role-auth-db"; then
    # Create the role for Django
    vault write database/roles/role-auth-db \
        db_name=config-auth-db \
        creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}'; \
                            GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
        default_ttl="24h" \
        max_ttl="30d"
fi

if ! vault secrets list | grep -q "database/roles/role-backend-db"; then
    vault write database/roles/role-backend-db \
        db_name=config-backend-db \
        creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}'; \
							GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
        default_ttl="24h" \
        max_ttl="30d"
fi

if ! vault secrets list | grep -q "database/roles/role-email-db"; then
    vault write database/roles/role-email-db \
        db_name=config-email-db \
        creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}'; \
							 GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
        default_ttl="24h" \
        max_ttl="30d"
fi

vault write -f database/rotate-root/config-auth-db
vault write -f database/rotate-root/config-backend-db
vault write -f database/rotate-root/config-email-db


echo $ROOT_TOKEN > /vault/secrets/VAULT_ROOT_TOKEN.txt
# Initialize Vault if it is not already initialized
tail -f /dev/null
