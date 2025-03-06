NAME	= ft_transcendence
BACKEND_DB_CONTAINER_NAME=backend-db
AUTH_DB_CONTAINER_NAME=auth-db
EMAIL_DB_CONTAINER_NAME = email-db
ROOT_TOKEN_FILE = ./secrets/VAULT_ROOT_TOKEN.txt
all: build up migrate

build:
	@echo "Building Docker Compose setup..."
	@docker compose -p $(NAME) build

up:
	@echo "Running Docker Compose setup..."
	@docker compose up -d auth-db vault-db
	@echo "Waiting for the database to be up..."
	@while ! docker inspect -f '{{.State.Health.Status}}' $(AUTH_DB_CONTAINER_NAME) | grep -q "healthy"; do \
		sleep 2; \
	done
	@echo "Database is up and running! Applying Migrations..."
	@echo "Setting up Vault..."
	sleep 2
	@docker compose up -d vault
	@echo "Waiting for $(ROOT_TOKEN_FILE) to contain any value..."
	@while [ ! -s $(ROOT_TOKEN_FILE) ]; do \
		sleep 1; \
	done
	@echo "$(ROOT_TOKEN_FILE) contains a value!"
	@docker compose up -d auth
# Stop the Docker Compose setup
down:
	@echo "Stopping Docker Compose setup..."
	@docker exec -it auth-db chmod 777 /var/lib/postgresql/data -R
	@docker compose down

migrate:
	@echo "Applying migrations to the authentication database..."
	@echo "Waiting for the database to be up..."
	@while ! docker inspect -f '{{.State.Health.Status}}' $(AUTH_DB_CONTAINER_NAME) | grep -q "healthy"; do \
		echo "Database is not ready yet..."; \
		sleep 2; \
	done
	@echo "Database is up and running! Applying Migrations..."
	@sleep 5
	@docker compose exec auth python manage.py makemigrations
	@docker compose exec auth python manage.py migrate

clean:down
	@echo "Cleaning up stopped containers and networks..."
	@docker compose -p $(NAME) down

fclean: clean
	@echo "Force cleaning: removing all images..."
	@docker compose -p $(NAME) down --rmi all
	#doc@docker system prune -af


destroy: fclean
	@rm -rf "./auth-db/data" -R


re: fclean all
