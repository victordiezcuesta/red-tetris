.PHONY: up down build logs test clean re

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

test:
	docker compose run --rm server npm test
	docker compose run --rm client npm test

clean:
	docker compose down -v --rmi local

re: clean build up
