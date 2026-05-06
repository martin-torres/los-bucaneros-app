#!/bin/bash
# Upload all item images to PocketBase using curl with multipart form data

PB_URL="https://los-bucaneros-pb.fly.dev"
ADMIN_EMAIL="admin@losbuncaneros.com"
ADMIN_PASS="LosBucanerosAdmin2026!"
IMAGE_DIR="/Users/lomalinda007yahoo.com/Downloads/Bucanero images"

# Get auth token
echo "Authenticating..."
TOKEN=$(curl -s -X POST "$PB_URL/api/collections/_superusers/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")

echo "Token: ${TOKEN:0:20}..."

# Get all menu items
echo "Getting menu items..."
curl -s "$PB_URL/api/collections/menu_items/records?perPage=50" \
  -H "Authorization: Bearer $TOKEN" > /tmp/menu_items.json

# Python to process uploads
python3 << PYEOF
import json, subprocess, os, sys

PB_URL = "$PB_URL"
TOKEN = "$TOKEN"
IMAGE_DIR = "$IMAGE_DIR"

with open('/tmp/menu_items.json') as f:
    data = json.load(f)

items = data.get('items', [])
print(f"Found {len(items)} menu items")

image_to_item = {
    'mediopork.png': 'Medio Kilo de Pulled Pork',
    'medioklbrisket.png': 'Medio Kilo de Brisket',
    '1klpork.png': 'Un Kilo de Pulled Pork',
    '1klbrisket.png': 'Un Kilo de Brisket',
    'mediobrisketmediopork.png': 'Medio Kilo Pulled Pork + Medio Kilo Brisket',
    '1klbrisket1klpork.png': 'Un Kilo Pulled Pork + Un Kilo Brisket',
    'bollosbrioch.png': 'Dos Bollos Brioche',
    'cremadeajo.png': 'Aderezo de Ajo (100ml)',
    'cremedcorn.png': 'Creamed Corn (250gr)',
    'yakurt.png': 'Chucrut (200gr)',
    'pickles.png': 'Dos Pepinillos Enteros',
    'carlotadelimon.png': 'Postre: Carlota de Limon (180gr)',
    'salsaoriginal.png': 'Salsa BBQ Original (125ml)',
    'salsavinagre.png': 'Salsa BBQ Vinagre (125ml)',
    'salsachipotle.png': 'Salsa BBQ Chipotle (125ml)',
    'salsa habanero.png': 'Salsa BBQ Habanero (125ml)',
    'cocacola.png': 'Coca Cola (600ml)',
    'agua.png': 'Agua',
}

success = 0
fail = 0

for filename, item_name in image_to_item.items():
    filepath = os.path.join(IMAGE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"  NOT FOUND: {filename}")
        fail += 1
        continue
    
    # Find matching item
    item = None
    for i in items:
        if i['name'] == item_name:
            item = i
            break
    
    if not item:
        print(f"  NO MATCH: {item_name}")
        fail += 1
        continue
    
    item_id = item['id']
    
    # Upload with curl using proper multipart
    cmd = [
        'curl', '-s', '-X', 'PATCH',
        f'{PB_URL}/api/collections/menu_items/records/{item_id}',
        '-H', f'Authorization: Bearer {TOKEN}',
        '-F', f'image=@{filepath}'
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        resp = json.loads(result.stdout)
        if 'id' in resp:
            print(f"  OK: {filename} -> {item_name}")
            success += 1
        else:
            print(f"  FAIL: {filename} - {result.stdout[:100]}")
            fail += 1
    except:
        print(f"  FAIL: {filename} - {result.stdout[:100]}")
        fail += 1

print(f"\nResults: {success} uploaded, {fail} failed")
PYEOF

# Update colors again via simple API
echo "Colors already updated to: #C53030 primary, #D4A574 secondary, #FDF8F3 bg, #0F766E accent"
