NAME	= ft_transcendence
BACKEND_DB_CONTAINER_NAME=backend-db
AUTH_DB_CONTAINER_NAME=auth-db
EMAIL_DB_CONTAINER_NAME = email-db
all: secrets build up
DATA_DIR = $(HOME)/ft_transcendence_data
ROOT_TOKEN_FILE = ./secrets/VAULT_ROOT_TOKEN.txt
DOCKER_COMPOSE_BINARY=./docker-compose-linux-x86_64

secrets:
	@echo "Creating secrets folder..."
	@mkdir -p ./secrets
	@echo "Creating secrets files..."
	@touch ./secrets/VAULT_ROOT_TOKEN.txt
	@echo eva > ./secrets/POSTGRES_USER.txt
	@echo gina > ./secrets/POSTGRES_PASSWORD.txt
	@echo noreply@cucabeludo.pt > ./secrets/EMAIL_USER.txt
	@echo Cuc@3elud0 > ./secrets/EMAIL_PASSWORD.txt
	@echo webdomain04.dnscpanel.com > ./secrets/EMAIL_HOST.txt
	@echo u-s4t2ud-9ec7e1b569c511d464a5fde0f161abb7de05399c1ba6b45dcc7619f42c1bfff0 > ./secrets/OAUTH_CLIENTID.txt
	@echo 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 > ./secrets/OAUTH_SECRET.txt


build:
	@echo "Building Docker Compose setup..."
	@$(DOCKER_COMPOSE_BINARY) -p $(NAME) build

directories:
	@echo "Creating directories..."
	@mkdir -p $(DATA_DIR)
	@mkdir -p ./secrets
	@mkdir -p $(DATA_DIR)/auth-db/data
	@mkdir -p $(DATA_DIR)/backend-db/data
	@mkdir -p $(DATA_DIR)/vault-db/data
	@mkdir -p $(DATA_DIR)/email-db/data
	@mkdir -p ./vault/data

up: directories
	@$(DOCKER_COMPOSE_BINARY) down
	@echo "" > $(ROOT_TOKEN_FILE)
	@echo "Running Docker Compose setup..."
	@$(DOCKER_COMPOSE_BINARY) up -d
# Stop the Docker Compose setup
down:
	@echo "Stopping Docker Compose setup..."
	@docker exec -it auth-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it backend-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it email-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it vault-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it vault chmod 777 /vault -R
	@$(DOCKER_COMPOSE_BINARY) down



clean:down
	@echo "Cleaning up stopped containers and networks..."
	@$(DOCKER_COMPOSE_BINARY) -p $(NAME) down

fclean: clean
	@echo "Force cleaning: removing all images..."
	@$(DOCKER_COMPOSE_BINARY) -p $(NAME) down --rmi all
	@docker system prune -af


fulldestroy: fclean
	@rm -rf "$(DATA_DIR)/auth-db/data" -R
	@rm -rf "$(DATA_DIR)/backend-db/data" -R
	@rm -rf "$(DATA_DIR)/vault-db/data" -R
	@rm -rf "$(DATA_DIR)/email-db/data" -R
	@rm -rf "./vault/data" -R
	@rm -rf "./channels/db.sqlite3" -R
	@echo "" > $(ROOT_TOKEN_FILE)

db-clear:
	@rm -rf "$(DATA_DIR)/auth-db/data" -R
	@rm -rf "$(DATA_DIR)/backend-db/data" -R
	@rm -rf "$(DATA_DIR)/vault-db/data" -R
	@rm -rf "$(DATA_DIR)/email-db/data" -R
	@rm -rf "./vault/data" -R
	@echo "" > $(ROOT_TOKEN_FILE)


re: fclean all
