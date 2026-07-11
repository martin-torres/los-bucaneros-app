#!/bin/sh
# Delete promos collection
# Usage: PB_ADMIN_EMAIL=admin@x.com PB_ADMIN_PASSWORD=xxx ./scripts/delete-promos-collection.sh

PB_URL="${PB_URL:-http://localhost:8090}"
ADMIN_EMAIL="${PB_ADMIN_EMAIL:?Error: PB_ADMIN_EMAIL is required}"
ADMIN_PASS="${PB_ADMIN_PASSWORD:?Error: PB_ADMIN_PASSWORD is required}"

TOKEN=$(curl -s -X POST "$PB_URL/api/collections/_superusers/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" \
  | sed 's/.*"token":"\([^"]*\)".*/\1/')
echo "Token: ${TOKEN:0:20}..."
curl -s -X DELETE "$PB_URL/api/collections/promos" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo "Done"
