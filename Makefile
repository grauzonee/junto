up:
	docker-compose up -d
build:
	docker-compose up -d --build
down:
	docker-compose down
o_redis:
	docker exec -it junto_redis sh
o_app:
	docker exec -it junto_app sh
o_mongo:
	docker exec -it junto_mongo sh
log_redis:
	docker logs junto_redis
log_app:
	docker logs junto_app
log_mongo:
	docker logs junto_mongo
rebuild_app:
	docker compose up --build app
seed-%:
	docker exec -it junto_app sh -c "npm run seed $*"
