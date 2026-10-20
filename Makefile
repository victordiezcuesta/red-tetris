.PHONY: up down build logs test clean re eval eval-logs eval-clean eval-bonus eval-bonus-logs eval-bonus-clean

#DESARROLLO TENEMOS DOS SERVIDORES (CLIENT 5173 Y SERVIDOR 3000)
up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

test:
	docker compose run --rm --no-deps server npm test
	docker compose run --rm --no-deps client npm test

clean:
	docker compose down -v --rmi local

re: clean build up

#CORRECCION PORQUE SOLO FORMA UN SERVIDOR CON EXPRESS QUE SIRVA TODO (PORT 3000)
eval:
	docker compose -f docker-compose.prod.yml up -d --build

eval-logs:
	docker compose -f docker-compose.prod.yml logs -f	

eval-clean:
	docker compose -f docker-compose.prod.yml down

#bonus
eval-bonus:
	docker compose -f bonus/docker-compose.yml up -d --build

eval-bonus-logs:
	docker compose -f bonus/docker-compose.yml logs -f

eval-bonus-clean:
	docker compose -f bonus/docker-compose.yml down