#!/usr/bin/env bash
set -e

# Each step has a time limit and a label, so a stuck step fails the deploy fast
# and the Render log shows exactly which one it was.
step() {
    local name="$1"; shift
    echo "==> [start] $name"
    timeout -k 5 120 "$@" || { echo "==> [start] FAILED or timed out: $name"; exit 1; }
}

step "config:cache" php artisan config:cache
step "route:cache" php artisan route:cache
step "view:cache" php artisan view:cache
step "migrate" php artisan migrate --force
step "db:seed" php artisan db:seed --force

echo "==> [start] starting web server on port ${PORT:-8080}"
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
