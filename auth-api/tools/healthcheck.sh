#!/bin/bash

# Try to reach a known service on each network
timeout 2 bash -c "</dev/tcp/vault/8200" 2>/dev/null
BACKEND=$?

timeout 2 bash -c "</dev/tcp/redis/6379" 2>/dev/null
FRONTEND=$?

if [ "$BACKEND" -eq 0 ] && [ "$FRONTEND" -eq 0 ]; then
  echo "Both frontend and backend networks are reachable."
  exit 0
else
  echo "Cannot reach one or both networks."
  exit 1
fi
