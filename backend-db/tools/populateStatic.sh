#!/bin/bash

# Variáveis de conexão ao banco de dados
DB_NAME="backend-db"
DB_USER="eva"
DB_PASSWORD="gina"
DB_HOST="backend-db"    # Nome do container
DB_PORT="5432"

# Dados para a tabela cuca_tauxstatus
STATUS_DATA=(
  "INSERT INTO cuca_tauxstatus VALUES (1, 'Searching', 'À Procura', 'Buscando', 'Recherche', 'Ricerca') ON CONFLICT DO NOTHING;"
  "INSERT INTO cuca_tauxstatus VALUES (2, 'Happening', 'A acontecer', 'Sucediendo', 'En cours', 'In corso') ON CONFLICT DO NOTHING;"
  "INSERT INTO cuca_tauxstatus VALUES (3, 'Finished', 'Terminado', 'Terminado', 'Terminé', 'Finito') ON CONFLICT DO NOTHING;"
)

# Dados para a tabela cuca_tauxgender
GENDER_DATA=(
  "INSERT INTO cuca_tauxgender (gender, label, labelPT, labelES, labelFR, labelIT) VALUES (1, 'Male', 'Masculino', 'Masculino', 'Homme', 'Maschio') ON CONFLICT (gender) DO NOTHING;"
  "INSERT INTO cuca_tauxgender (gender, label, labelPT, labelES, labelFR, labelIT) VALUES (2, 'Female', 'Feminino', 'Femenino', 'Femme', 'Femmina') ON CONFLICT (gender) DO NOTHING;"
  "INSERT INTO cuca_tauxgender (gender, label, labelPT, labelES, labelFR, labelIT) VALUES (3, 'Other', 'Outro', 'Otro', 'Autre', 'Altro') ON CONFLICT (gender) DO NOTHING;"
)

# Dados para a tabela cuca_tauxphase
PHASE_DATA=(
  "INSERT INTO cuca_tauxphase (phase, label, labelPT, labelES, labelFR, labelIT) VALUES (1, 'Quarter final', 'Quartos de final', 'Cuartos de final', 'Quarts de finale', 'Quarti di finale') ON CONFLICT (phase) DO NOTHING;"
  "INSERT INTO cuca_tauxphase (phase, label, labelPT, labelES, labelFR, labelIT) VALUES (2, 'Semi final', 'Semi final', 'Semifinales', 'Demi-finales', 'Semifinali') ON CONFLICT (phase) DO NOTHING;"
  "INSERT INTO cuca_tauxphase (phase, label, labelPT, labelES, labelFR, labelIT) VALUES (3, 'Final', 'Final', 'Final', 'Finale', 'Finale') ON CONFLICT (phase) DO NOTHING;"
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

# Dados para a tabela cuca_tauxphase
LANGUAGE_DATA=(
  "INSERT INTO cuca_tauxLanguage (language, label) VALUES (1, 'en') ON CONFLICT (phase) DO NOTHING;"
  "INSERT INTO cuca_tauxLanguage (language, label) VALUES (2, 'pt') ON CONFLICT (phase) DO NOTHING;"
  "INSERT INTO cuca_tauxLanguage (language, label) VALUES (3, 'es') ON CONFLICT (phase) DO NOTHING;"
  "INSERT INTO cuca_tauxLanguage (language, label) VALUES (4, 'fr') ON CONFLICT (phase) DO NOTHING;"
  "INSERT INTO cuca_tauxLanguage (language, label) VALUES (5, 'it') ON CONFLICT (phase) DO NOTHING;"
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

# Inserir dados em tauxfriendshipstatus
echo "A inserir dados em cuca_tauxLanguage..."
for sql in "${LANGUAGE_DATA[@]}"; do
  execute_sql "$sql"
done

echo "Dados inseridos com sucesso!"
