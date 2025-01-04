#!/bin/sh

# Start Vault in the background
vault server -dev -dev-root-token-id=myroot &

# Wait for Vault to start
sleep 5

# Set the VAULT_ADDR environment variable to use HTTP
export VAULT_ADDR="http://127.0.0.1:8200"

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
fi

# Keep the container running
tail -f /dev/null
