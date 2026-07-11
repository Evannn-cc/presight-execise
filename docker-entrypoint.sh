#!/bin/sh
set -e

# The seed script is idempotent (it skips when users already exist), so run it
# unconditionally: gating on the DB file's existence would permanently skip
# seeding if a first seed was interrupted after the file was created.
node server/dist/seed/seed.js

exec node server/dist/index.js
