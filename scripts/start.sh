#!/bin/sh
set -e

# Load secrets from /run/secrets/
if [ -f /run/secrets/stdout_admin_email ]; then
  export ADMIN_EMAIL=$(cat /run/secrets/stdout_admin_email)
fi
if [ -f /run/secrets/stdout_admin_password ]; then
  export ADMIN_PASSWORD=$(cat /run/secrets/stdout_admin_password)
fi
if [ -f /run/secrets/stdout_session_secret ]; then
  export SESSION_SECRET=$(cat /run/secrets/stdout_session_secret)
fi

export SEED_DIR="${SEED_DIR:-/app/community-seed}"
exec node dist/server/entry.mjs
