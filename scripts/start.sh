#!/bin/sh
set -e
export SEED_DIR="${SEED_DIR:-/app/community-seed}"
exec node dist/server/entry.mjs
