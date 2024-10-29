NAME	= ft_transcendence
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
	@docker compose down

migrate:
	@echo "Applying migrations to the database..."
	@docker compose exec python python manage.py migrate
	@docker compose exec python python manage.py makemigrations

clean:
	@echo "Cleaning up stopped containers and networks..."
	@docker compose -p $(NAME) down

fclean: clean
	@echo "Force cleaning: removing all images..."
	@docker compose -p $(NAME) down --rmi all
	@docker system prune -af


re: fclean all
