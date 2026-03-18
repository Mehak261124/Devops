#!/bin/bash
set -e

echo "========================================="
echo "  ShopSmart EC2 Deployment"
echo "========================================="

APP_DIR="/home/ubuntu/shopsmart"

# --------------------
# Ensure app directory exists (idempotent)
# --------------------
mkdir -p "$APP_DIR"

# --------------------
# Clone or pull repository (idempotent)
# --------------------
if [ -d "$APP_DIR/.git" ]; then
    echo "📥 Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/Mehak261124/Devops.git "$APP_DIR"
    cd "$APP_DIR"
fi

# --------------------
# Install PM2 globally if not present (idempotent)
# --------------------
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    sudo npm install -g pm2
else
    echo "✅ PM2 already installed."
fi

# --------------------
# Server setup (idempotent)
# --------------------
echo ""
echo "🔧 Setting up server..."
cd "$APP_DIR/server"
npm install

# Generate Prisma client (idempotent)
npx prisma generate

# Push database schema (idempotent)
npx prisma db push

# Seed if needed (idempotent — seed script clears and re-inserts)
npx prisma db seed 2>/dev/null || echo "   Seed completed or skipped."

# Start or restart server with PM2 (idempotent)
if pm2 describe shopsmart-server > /dev/null 2>&1; then
    echo "🔄 Restarting server..."
    pm2 restart shopsmart-server
else
    echo "🚀 Starting server..."
    pm2 start src/index.js --name shopsmart-server
fi

# Save PM2 process list (idempotent)
pm2 save

# --------------------
# Client build (idempotent)
# --------------------
echo ""
echo "🔧 Building client..."
cd "$APP_DIR/client"
npm install
npm run build

# Deploy to web server root (idempotent with cp, not destructive)
echo "📁 Deploying client to /var/www/html/..."
sudo mkdir -p /var/www/html
sudo cp -r dist/* /var/www/html/

echo ""
echo "========================================="
echo "  ✅ Deployment completed successfully!"
echo "========================================="
exit 0
