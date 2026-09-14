#!/usr/bin/env bash
set -e

echo "=================================================="
echo "  Deploying Lumina Read to AWS (book.mehaxan.com)"
echo "=================================================="

# Check for .env or generate sensible AWS defaults
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
  else
    echo "Creating default .env configuration..."
    cat <<EOT >> .env
# Auto-generated environment config
PORT=5000
NODE_ENV=production
MONGO_PASSWORD=LuminaSecurePass2026!
EOT
  fi
fi

# Ensure Docker is running
if ! command -v docker &> /dev/null; then
  echo "⚠️ Docker is not installed. Installing Docker now..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER || true
fi

# Build and start all 3 containers (Frontend + Backend + MongoDB)
echo "📦 Building and starting all containers on AWS..."
docker compose down || true
docker compose up -d --build

echo ""
echo "=================================================="
echo "✅ All 3 services deployed successfully on AWS:"
echo "   1. 🖥️ Frontend (Nginx)   -> Port 80"
echo "   2. ⚙️ Backend (Express)  -> Port 5000 (Internal)"
echo "   3. 🗄️ Database (MongoDB) -> Port 27017 (Persistent Volume)"
echo ""
echo "📡 Check container status: docker compose ps"
echo "📋 View live server logs:  docker compose logs -f"
echo "🌐 Access your app at:     http://book.mehaxan.com"
echo "=================================================="
