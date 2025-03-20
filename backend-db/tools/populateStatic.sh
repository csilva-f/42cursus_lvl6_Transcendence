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

# Dados para a tabela cuca_tauxphase
PHASE_DATA=(
  "INSERT INTO cuca_tauxphase (phase, label) VALUES (1, 'Quarter final') ON CONFLICT (phase) DO NOTHING;"
  "INSERT INTO cuca_tauxphase (phase, label) VALUES (2, 'Semi final') ON CONFLICT (phase) DO NOTHING;"
  "INSERT INTO cuca_tauxphase (phase, label) VALUES (3, 'Final') ON CONFLICT (phase) DO NOTHING;"
)

# Dados para a tabela cuca_tuserextension
GUEST_USER=(
  "INSERT INTO cuca_tuserextension (\"user\", nick) VALUES (-1, 'Guest') ON CONFLICT (\"user\") DO NOTHING;"
)

# Dados para a tabela cuca_tauxfriendshipstatus
FRIENDS_STATUS_DATA=(
  "INSERT INTO cuca_tauxfriendshipstatus VALUES (1, 'RequestSent') ON CONFLICT (status) DO NOTHING;"
  "INSERT INTO cuca_tauxfriendshipstatus VALUES (2, 'Friends') ON CONFLICT (status) DO NOTHING;"
  "INSERT INTO cuca_tauxfriendshipstatus VALUES (3, 'NotFriends') ON CONFLICT (status) DO NOTHING;"
)

# Função para executar os comandos no PostgreSQL
execute_sql() {
  local sql_command=$1
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT -c "$sql_command"
}

# Inserir dados em cuca_tauxstatus
echo "A inserir dados em cuca_tauxstatus..."
for sql in "${STATUS_DATA[@]}"; do
  execute_sql "$sql"
done

# Inserir dados em cuca_tauxgender
echo "A inserir dados em cuca_tauxgender..."
for sql in "${GENDER_DATA[@]}"; do
  execute_sql "$sql"
done

# Inserir dados em cuca_tauxphase
echo "A inserir dados em cuca_tauxphase..."
for sql in "${PHASE_DATA[@]}"; do
  execute_sql "$sql"
done

# Inserir dados em cuca_tuserextension
echo "A inserir dados em cuca_tuserextension..."
for sql in "${GUEST_USER[@]}"; do
  execute_sql "$sql"
done

# Inserir dados em tauxfriendshipstatus
echo "A inserir dados em cuca_tauxfriendshipstatus..."
for sql in "${FRIENDS_STATUS_DATA[@]}"; do
  execute_sql "$sql"
done

echo "Dados inseridos com sucesso!"
