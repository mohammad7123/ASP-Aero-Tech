#!/usr/bin/env bash
set -euo pipefail
cd /home/admin1/Developer/ASP-Aero-Tech
git pull
export PORT=5000 BASE_PATH=/
pnpm install --frozen-lockfile
pnpm run build
sudo cp -r artifacts/aps-aero-tech/dist/public/* /var/www/asp-aero-tech/
sudo restorecon -Rv /var/www/asp-aero-tech
pm2 restart asp-aero-api
