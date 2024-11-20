NAME	= ft_transcendence
BACKEND_DB_CONTAINER_NAME=backend-db
AUTH_DB_CONTAINER_NAME=backend-db
all: build up migrate

build:
	@echo "Building Docker Compose setup..."
	@docker compose -p $(NAME) build

up:
	@mkdir -p ./postgres/data
	@echo "Running Docker Compose setup..."
	@docker compose up -d

# Stop the Docker Compose setup
down:
	@echo "Stopping Docker Compose setup..."
	@docker exec -it backend-db chmod 777 /var/lib/postgresql/data -R
	@docker exec -it auth-db chmod 777 /var/lib/postgresql/data -R
	@docker compose down

migrate:
	@echo "Applying migrations to the backend database..."
	@echo "Waiting for the database to be up..."
	@while ! docker inspect -f '{{.State.Health.Status}}' $(BACKEND_DB_CONTAINER_NAME) | grep -q "healthy"; do \
		echo "Database is not ready yet..."; \
		sleep 2; \
	done
	@echo "Database is up and running! Applying Migrations..."
	@sleep 5
	@docker compose exec backend python manage.py makemigrations
	@docker compose exec backend python manage.py migrate

	@echo "Applying migrations to the authentication database..."
	@echo "Waiting for the database to be up..."
	@while ! docker inspect -f '{{.State.Health.Status}}' $(AUTH_DB_CONTAINER_NAME) | grep -q "healthy"; do \
		echo "Database is not ready yet..."; \
		sleep 2; \
	done
	@echo "Database is up and running! Applying Migrations..."
	@sleep 5
	@docker compose exec backend python manage.py makemigrations
	@docker compose exec backend python manage.py migrate

clean:down
	@echo "Cleaning up stopped containers and networks..."
	@docker compose -p $(NAME) down

fclean: clean
	@echo "Force cleaning: removing all images..."
	@docker compose -p $(NAME) down --rmi all
	@docker system prune -af


re: fclean all
