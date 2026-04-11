#!/bin/bash
# ── deploy.sh — Run this on the Linux server ──
set -e

REPO="https://github.com/algorithm89/A.I-PORTO.git"
APP_DIR="/opt/A.I-PORTO"

echo "🚀 BublikStudios AI-Backend — Production Deploy"
echo "================================================"

# Clone or pull
if [ -d "$APP_DIR" ]; then
  echo "📥 Pulling latest code..."
  cd "$APP_DIR"
  git pull origin master
else
  echo "📥 Cloning repo..."
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Creating one..."
  echo "VAULT_TOKEN=hvs.REPLACE_ME" > .env
  echo "❌ Edit .env with your real Vault token, then re-run."
  exit 1
fi

echo "✅ .env file found — Docker Compose will read VAULT_TOKEN from it"

# Build & start with production compose
echo "🔨 Building Docker images..."
docker compose -f docker-compose.prod.yml up --build -d

echo ""
echo "⏳ Waiting for containers to start..."
sleep 10

# Show status
echo ""
echo "📦 Container status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "📋 Backend logs (last 20 lines):"
docker logs ai-backend --tail 20

echo ""
echo "================================================"
echo "✅ Deploy complete!"
echo "   Backend:  http://152.53.210.206:8080"
echo "   Frontend: http://152.53.210.206:3000"
echo "================================================"
