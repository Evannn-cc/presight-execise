#!/bin/sh
set -e

if [ ! -f "$DB_PATH" ]; then
  echo "No database found at $DB_PATH — seeding..."
  node server/dist/seed/seed.js
fi

exec node server/dist/index.js
