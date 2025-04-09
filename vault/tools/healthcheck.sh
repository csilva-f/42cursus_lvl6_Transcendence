#!/bin/bash

if [ -s "/vault/secrets/VAULT_ROOT_TOKEN.txt" ]; then
    exit 0  # Healthy
else
    exit 1  # Unhealthy
fi
