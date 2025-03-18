storage "postgresql" {
  connection_string = "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_DB}:5432/${POSTGRES_DB}?sslmode=disable"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1  # Set to 0 for production with TLS
}

ui = true
api_addr = "http://127.0.0.1:8200"
cluster_addr = "http://127.0.0.1:8201"
