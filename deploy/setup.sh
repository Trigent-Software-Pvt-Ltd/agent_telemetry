#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# Agent Telemetry — EC2 Setup Script
# Run as ec2-user on a fresh Amazon Linux 2023 instance
# Usage: bash deploy/setup.sh
# ──────────────────────────────────────────────

APP_DIR="/home/ec2-user/agent_telemetry"
LOG_DIR="/var/log/agent-telemetry"
NODE_VERSION="22"

echo "==> Installing Node.js ${NODE_VERSION} LTS via nvm..."
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"
nvm alias default "$NODE_VERSION"

echo "==> Node.js version: $(node -v)"
echo "==> npm version:     $(npm -v)"

echo "==> Installing PM2 globally..."
npm install -g pm2

echo "==> Creating log directory ${LOG_DIR}..."
sudo mkdir -p "$LOG_DIR"
sudo chown ec2-user:ec2-user "$LOG_DIR"

echo "==> Installing crontab to /etc/cron.d/agent-telemetry..."
if [ -f "${APP_DIR}/deploy/crontab" ]; then
  sudo cp "${APP_DIR}/deploy/crontab" /etc/cron.d/agent-telemetry
  sudo chmod 644 /etc/cron.d/agent-telemetry
  sudo chown root:root /etc/cron.d/agent-telemetry
  echo "    Crontab installed. Remember to set CRON_SECRET in /etc/cron.d/agent-telemetry"
else
  echo "    WARNING: deploy/crontab not found, skipping cron setup"
fi

echo "==> Installing dependencies..."
cd "$APP_DIR"
npm ci --omit=dev

echo "==> Building Next.js production bundle..."
npm run build

echo "==> Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save

echo "==> Configuring PM2 to start on boot..."
pm2 startup systemd -u ec2-user --hp /home/ec2-user | tail -1 | bash || true

echo ""
echo "====================================="
echo " Setup complete!"
echo " App running on http://localhost:3000"
echo " Logs: ${LOG_DIR}/"
echo " PM2:  pm2 status | pm2 logs"
echo "====================================="
