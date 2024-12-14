#!/bin/bash

# Variáveis de conexão ao banco de dados
DB_NAME="backend-db"
DB_USER="eva"
DB_PASSWORD="gina"
DB_HOST="backend-db"    # Nome do container
DB_PORT="5432"

# Dados para a tabela cuca_tauxstatus
STATUS_DATA=(
  "INSERT INTO cuca_tauxstatus VALUES (1, 'Searching') ON CONFLICT DO NOTHING;"
  "INSERT INTO cuca_tauxstatus VALUES (2, 'Happening') ON CONFLICT DO NOTHING;"
  "INSERT INTO cuca_tauxstatus VALUES (3, 'Finished') ON CONFLICT DO NOTHING;"
)

# Dados para a tabela cuca_tauxgender
GENDER_DATA=(
  "INSERT INTO cuca_tauxgender (gender, label) VALUES (1, 'Male') ON CONFLICT (gender) DO NOTHING;"
  "INSERT INTO cuca_tauxgender (gender, label) VALUES (2, 'Female') ON CONFLICT (gender) DO NOTHING;"
  "INSERT INTO cuca_tauxgender (gender, label) VALUES (3, 'Other') ON CONFLICT (gender) DO NOTHING;"
)

# Função para executar os comandos no PostgreSQL
execute_sql() {
  local sql_command=$1
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT -c "$sql_command"
}

# Inserindo os dados em cuca_tauxstatus
echo "Inserindo dados em cuca_tauxstatus..."
for sql in "${STATUS_DATA[@]}"; do
  execute_sql "$sql"
done

# Inserindo os dados em cuca_tauxgender
echo "Inserindo dados em cuca_tauxgender..."
for sql in "${GENDER_DATA[@]}"; do
  execute_sql "$sql"
done

echo "Dados inseridos com sucesso!"
