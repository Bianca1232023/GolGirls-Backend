.DEFAULT_GOAL := help

NPM ?= npm
DOCKER_COMPOSE ?= docker compose

.PHONY: help setup run build test test-watch prisma-generate migrate-dev migrate-deploy db-push seed-admin docker-up docker-down docker-logs docker-ps docker-seed-admin

help:
	@echo "GolGirls backend — comandos disponíveis:"
	@echo "  make setup            Instala dependências e gera o Prisma Client"
	@echo "  make run              Inicia a API em desenvolvimento"
	@echo "  make build            Constrói a imagem Docker da API"
	@echo "  make test             Executa os testes"
	@echo "  make test-watch       Executa os testes em modo watch"
	@echo "  make prisma-generate  Gera o Prisma Client"
	@echo "  make migrate-dev      Cria/aplica migrations em desenvolvimento"
	@echo "  make migrate-deploy   Aplica migrations existentes"
	@echo "  make db-push          Sincroniza o schema sem criar migration"
	@echo "  make seed-admin       Cria/atualiza o admin inicial usando o .env local"
	@echo "  make docker-up        Constrói e inicia banco e API"
	@echo "  make docker-down      Para containers preservando o banco"
	@echo "  make docker-logs      Acompanha os logs da API"
	@echo "  make docker-ps        Mostra o estado dos containers"
	@echo "  make docker-seed-admin Executa o seed no ambiente Docker"

setup:
	$(NPM) install
	$(NPM) run prisma:generate

run:
	$(NPM) run dev

build:
	$(DOCKER_COMPOSE) build api

test:
	$(NPM) test

test-watch:
	$(NPM) run test:watch

prisma-generate:
	$(NPM) run prisma:generate

migrate-dev:
	$(NPM) run migrate:dev

migrate-deploy:
	$(NPM) run migrate:deploy

db-push:
	$(NPM) run db:push

seed-admin:
	$(NPM) run seed:admin

docker-up:
	$(DOCKER_COMPOSE) up --build -d

docker-down:
	$(DOCKER_COMPOSE) down

docker-logs:
	$(DOCKER_COMPOSE) logs -f api

docker-ps:
	$(DOCKER_COMPOSE) ps

docker-seed-admin:
	$(DOCKER_COMPOSE) run --rm --build api $(NPM) run seed:admin
