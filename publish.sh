#!/usr/bin/env bash
# Rebuild the site and (re)start the production server on port 3000.
set -euo pipefail
cd "$(dirname "$0")"

umask 002
mkdir -p .run

bun install
bun run build

# Free port 3000 before starting
sudo sh -c 'lsof -t -iTCP:3000 -sTCP:LISTEN | xargs -r kill' 2>/dev/null || true
sleep 0.5

setsid nohup bun run start > .run/server.log 2>&1 < /dev/null &

for _ in $(seq 1 50); do
  if curl -sf -o /dev/null http://localhost:3000; then
    echo "site published; serving on port 3000"
    exit 0
  fi
  sleep 0.2
done
echo "warning: published, but the server isn't responding — check .run/server.log" >&2
exit 1
