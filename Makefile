NAME	= ft_transcendence
BACKEND_DB_CONTAINER_NAME=backend-db
AUTH_DB_CONTAINER_NAME=auth-db
EMAIL_DB_CONTAINER_NAME = email-db
ROOT_TOKEN_FILE = ./secrets/VAULT_ROOT_TOKEN.txt
all: secrets build up migrate

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

up:
	@echo "" > $(ROOT_TOKEN_FILE)
	@echo "Running Docker Compose setup..."
	@docker compose up -d auth-db vault-db backend-db email-db
	@while ! ( \
		docker inspect -f '{{.State.Health.Status}}' auth-db | grep -q "healthy" && \
		docker inspect -f '{{.State.Health.Status}}' vault-db | grep -q "healthy" && \
		docker inspect -f '{{.State.Health.Status}}' backend-db | grep -q "healthy" && \
		docker inspect -f '{{.State.Health.Status}}' email-db | grep -q "healthy" \
	); do \
		echo "Waiting for all databases to be healthy..."; \
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
	@docker compose up -d auth backend email auth-api backend-api channels redis
	sleep 5
	@docker compose up -d nginx
# Stop the Docker Compose setup
down:
	@echo "Stopping Docker Compose setup..."
	@docker exec -it auth-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it backend-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it email-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it vault-db chmod 777 /var/lib/postgresql/data -R
	@docker compose down

migrate:
	@echo "Applying Migrations..."
	@docker compose exec -it auth python manage.py makemigrations
	@docker compose exec -it auth python manage.py migrate
	@docker compose exec -it backend python manage.py makemigrations
	@docker compose exec -it backend python manage.py migrate
	@docker compose exec -it email python manage.py makemigrations
	@docker compose exec -it email python manage.py migrate
	@docker compose restart auth backend email

clean:down
	@echo "Cleaning up stopped containers and networks..."
	@docker compose -p $(NAME) down

fclean: clean
	@echo "Force cleaning: removing all images..."
	@docker compose -p $(NAME) down --rmi all
	@docker system prune -af


fulldestroy: fclean
	@rm -rf "./auth-db/data" -R
	@rm -rf "./backend-db/data" -R
	@rm -rf "./vault-db/data" -R
	@rm -rf "./email-db/data" -R
	@rm -rf "./vault/data" -R
	@echo "" > $(ROOT_TOKEN_FILE)

destroy: down
	@rm -rf "./auth-db/data" -R
	@rm -rf "./backend-db/data" -R
	@rm -rf "./vault-db/data" -R
	@rm -rf "./email-db/data" -R
	@rm -rf "./vault/data" -R
	@echo "" > $(ROOT_TOKEN_FILE)

re: fclean all
