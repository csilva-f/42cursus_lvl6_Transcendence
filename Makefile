NAME	= ft_transcendence
BACKEND_DB_CONTAINER_NAME=backend-db
AUTH_DB_CONTAINER_NAME=auth-db
EMAIL_DB_CONTAINER_NAME = email-db
all: secrets build up
DATA_DIR = $(HOME)/ft_transcendence_data
ROOT_TOKEN_FILE = ./secrets/VAULT_ROOT_TOKEN.txt

secrets:
	@echo "Creating secrets folder..."
	@mkdir -p ./secrets
	@echo "Creating secrets files..."
	@touch ./secrets/VAULT_ROOT_TOKEN.txt
	@echo eva > ./secrets/POSTGRES_USER.txt
	@echo gina > ./secrets/POSTGRES_PASSWORD.txt


build:
	@echo "Building Docker Compose setup..."
	@docker compose -p $(NAME) build

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
	@docker compose down
	@echo "" > $(ROOT_TOKEN_FILE)
	@echo "Running Docker Compose setup..."
	@docker compose --verbose up -d
# Stop the Docker Compose setup
down:
	@echo "Stopping Docker Compose setup..."
	@docker exec -it auth-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it backend-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it email-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it vault-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it vault chmod 777 /vault -R
	@docker compose down



clean:down
	@echo "Cleaning up stopped containers and networks..."
	@docker compose -p $(NAME) down

fclean: clean
	@echo "Force cleaning: removing all images..."
	@docker compose -p $(NAME) down --rmi all
	@docker system prune -af


fulldestroy: fclean
	@rm -rf "$(DATA_DIR)/auth-db/data" -R
	@rm -rf "$(DATA_DIR)/backend-db/data" -R
	@rm -rf "$(DATA_DIR)/vault-db/data" -R
	@rm -rf "$(DATA_DIR)/email-db/data" -R
	@rm -rf "./vault/data" -R
	@echo "" > $(ROOT_TOKEN_FILE)

db-clear:
	@rm -rf "$(DATA_DIR)/auth-db/data" -R
	@rm -rf "$(DATA_DIR)/backend-db/data" -R
	@rm -rf "$(DATA_DIR)/vault-db/data" -R
	@rm -rf "$(DATA_DIR)/email-db/data" -R
	@rm -rf "./vault/data" -R
	@echo "" > $(ROOT_TOKEN_FILE)


re: fclean all
