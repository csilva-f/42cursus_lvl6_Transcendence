# Makefile for managing a Django project

# Variables
PROJECT_NAME = ft_transcendence
VENV = venv
PYTHON = /bin/python3
MANAGE = $(PYTHON) manage.py

# Targets
.PHONY: help install run migrate makemigrations shell test clean

help:  ## Show this help message
	@echo "Makefile commands:"
	@echo "  install         Install dependencies"
	@echo "  run             Run the Django development server"
	@echo "  migrate         Apply database migrations"
	@echo "  makemigrations  Create new migrations based on changes"
	@echo "  shell           Open a Django shell"
	@echo "  test            Run tests"
	@echo "  clean           Remove pyc files and __pycache__ directories"

install:  ## Install dependencies
	@echo "Installing dependencies..."
	#python -m venv $(VENV)
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r requirements.txt

run:  ## Run the Django development server
	@echo "Starting the Django development server..."
	$(MANAGE) runserver

migrate:  ## Apply database migrations
	@echo "Applying migrations..."
	$(MANAGE) migrate

makemigrations:  ## Create new migrations based on changes
	@echo "Creating migrations..."
	$(MANAGE) makemigrations

shell:  ## Open a Django shell
	@echo "Opening Django shell..."
	$(MANAGE) shell

test:  ## Run tests
	@echo "Running tests..."
	$(MANAGE) test

clean:  ## Remove pyc files and __pycache__ directories
	@echo "Cleaning up..."
	find . -name "*.pyc" -exec rm -f {} \;
	find . -name "__pycache__" -exec rm -rf {} \;
