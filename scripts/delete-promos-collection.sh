#!/bin/sh
TOKEN=$(curl -s -X POST http://localhost:8090/api/admins/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"dr.mtorres@icloud.com","password":"Bucaneros2025!"}' \
  | sed 's/.*"token":"\([^"]*\)".*/\1/')
echo "Token: ${TOKEN:0:20}..."
curl -s -X DELETE http://localhost:8090/api/collections/promos \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo "Done"
