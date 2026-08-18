#!/bin/bash
# Deploy script — runs on the EC2 server via SSH.
# Pulls the latest images and does a rolling restart.

set -e    # exit immediately if any command fails
set -u    # treat unset variables as errors

echo "🚀 Starting deployment at $(date)"

# ── Navigate to the project directory ──
cd ~/cloudcost

# ── Write the production .env file from GitHub Secrets ──
# These environment variables were passed through from the workflow.
cat > .env.prod << EOF
DOCKERHUB_USERNAME=${DOCKERHUB_USERNAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
REDIS_PASSWORD=${REDIS_PASSWORD}
ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}
REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}
FRONTEND_URL=${FRONTEND_URL}
IMAGE_TAG=${IMAGE_TAG}
EOF

echo "📦 Pulling latest Docker images..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.prod \
  pull

echo "🔄 Restarting containers with zero-downtime strategy..."
# Start new containers before stopping old ones.
# Docker Compose handles this when you run 'up' — it replaces
# containers one at a time rather than stopping everything at once.
docker-compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.prod \
  up -d --remove-orphans

echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.prod \
  exec -T api npx prisma migrate deploy

echo "🧹 Removing unused Docker images (keep disk clean)..."
docker image prune -f

echo "✅ Deployment complete at $(date)"

# ── Health check ──
echo "🏥 Checking API health..."
sleep 10    # give containers time to start

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/v1/health)

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ API is healthy (HTTP $HTTP_STATUS)"
else
  echo "❌ API health check failed (HTTP $HTTP_STATUS)"
  echo "📋 Recent API logs:"
  docker-compose logs --tail=50 api
  exit 1
fi

# Clean up the .env.prod file — never leave secrets on disk
rm -f .env.prod
echo "🔒 Cleaned up secrets from disk"