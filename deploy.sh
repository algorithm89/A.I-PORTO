#!/bin/bash
# ── deploy.sh — Run this on the Linux server ──
set -e

COMPOSE="docker compose -f docker-compose.prod.yml"
REPO="https://github.com/algorithm89/A.I-PORTO.git"
APP_DIR="/home/bublik/A.I-PORTO"

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

echo "✅ .env file found"

# ── Step 1: Ensure infra is running (won't recreate if already up) ──
echo ""
echo "🔧 Ensuring infrastructure is running (ollama, portainer)..."
$COMPOSE up -d --no-recreate ollama portainer

# ── Step 2: Rebuild & restart CODE only ──
echo ""
echo "🔨 Building & deploying code (backend + frontend)..."
$COMPOSE up --build -d --no-deps backend frontend

echo ""
echo "🔄 Restarting nginx (picks up new frontend)..."
$COMPOSE up -d --no-deps nginx

echo ""
echo "⏳ Waiting for containers to start..."
sleep 10

# Show status
echo ""
echo "📦 Container status:"
$COMPOSE ps

echo ""
echo "📋 Backend logs (last 20 lines):"
docker logs ai-backend --tail 20

echo ""
echo "================================================"
echo "✅ Deploy complete!"
echo "   Site: https://bublikstudios.net"
echo "================================================"
