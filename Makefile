# Shortcuts for common Docker operations.
# Run any target with: make <target>

.PHONY: dev prod down logs ps migrate seed build

# Start everything in development mode
dev:
	docker-compose up --build

# Start in production mode
prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Stop all containers
down:
	docker-compose down

# Stop and remove volumes (wipes the database)
down-clean:
	docker-compose down -v

# Follow logs from all services
logs:
	docker-compose logs -f

# Follow logs from a specific service: make logs-api
logs-%:
	docker-compose logs -f $*

# Show running containers
ps:
	docker-compose ps

# Run database migrations
migrate:
	docker-compose exec api npx prisma migrate deploy

# Seed the database with test data
seed:
	docker-compose exec api npx ts-node prisma/seed.ts

# Run tests inside the API container
test:
	docker-compose exec api npm test

# Build all images without starting them
build:
	docker-compose build

# Pull latest base images before building
pull:
	docker-compose pull

# Open a shell in the API container
shell-api:
	docker-compose exec api sh

# Open a shell in the ML service container
shell-ml:
	docker-compose exec ml-service sh

# Open psql in the database container
db:
	docker-compose exec postgres psql -U cloudcost -d cloudcost_sentinel