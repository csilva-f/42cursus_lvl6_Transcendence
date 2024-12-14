NAME	= ft_transcendence
BACKEND_DB_CONTAINER_NAME=backend-db
AUTH_DB_CONTAINER_NAME=auth-db
EMAIL_DB_CONTAINER_NAME = email-db
all: build up migrate mail_deamon

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
	@docker exec -it email-db chmod 777 /var/lib/postgresql/data -R
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

	@$(MAKE) populate

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

	@echo "Applying migrations to the email queue database..."
	@echo "Waiting for the database to be up..."
	@while ! docker inspect -f '{{.State.Health.Status}}' $(EMAIL_DB_CONTAINER_NAME) | grep -q "healthy"; do \
		echo "Database is not ready yet..."; \
		sleep 2; \
	done
	@echo "Database is up and running! Applying Migrations..."
	@sleep 5
	@docker compose exec email python manage.py makemigrations
	@docker compose exec email python manage.py migrate

populate:
	@echo "Populating static tables..."
	@docker compose exec backend-db sh -c "/tools/populateStatic.sh"

clean:down
	@echo "Cleaning up stopped containers and networks..."
	@docker compose -p $(NAME) down

fclean: clean
	@echo "Force cleaning: removing all images..."
	@docker compose -p $(NAME) down --rmi all
	@docker system prune -af

mail_deamon:
	@echo "Starting mail deamon..."
	@docker compose run -d email python manage.py mail_deamon

destroy: fclean
	@rm -rf "./backend-db/data" -R
	@rm -rf "./auth-db/data" -R
	@rm -rf "./email-db/data" -R

re: fclean all
