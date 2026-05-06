import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';

const PB_URL = 'https://los-bucaneros-pb.fly.dev';
const ADMIN_EMAIL = 'admin@losbuncaneros.com';
const ADMIN_PASSWORD = 'LosBucanerosAdmin2026!';

const IMAGE_DIR = '/Users/lomalinda007yahoo.com/Downloads/Bucanero images';

const imageToItem = {
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
};

const pb = new PocketBase(PB_URL);

// Copy of fetch-based file upload since pocketbase client has Content-Type issues
async function uploadFile(collection, recordId, fileField, filePath) {
  const token = pb.authStore.token;
  const url = `${PB_URL}/api/collections/${collection}/records/${recordId}`;
  
  const FormData = (await import('form-data')).default;
  const formData = new FormData();
  formData.append(fileField, fs.createReadStream(filePath));
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text.slice(0,200)}`);
  }
  return response.json();
}

async function main() {
  await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Authenticated');

  // ===== STEP 1: Update colors via simple JSON =====
  console.log('\n--- Updating Colors ---');
  const settingsList = await pb.collection('restaurant_settings').getFullList();
  const settingsId = settingsList[0].id;
  
  await pb.collection('restaurant_settings').update(settingsId, {
    primaryColor: '#C53030',
    secondaryColor: '#D4A574',
    backgroundColor: '#FDF8F3',
    accentColor: '#0F766E',
  });
  console.log('Colors updated to warmer palette');

  // ===== STEP 2: Upload menu item images =====
  console.log('\n--- Uploading Item Images ---');
  
  const menuItems = await pb.collection('menu_items').getFullList();
  console.log(`Found ${menuItems.length} menu items`);

  let uploaded = 0;
  let errors = [];

  for (const [filename, itemName] of Object.entries(imageToItem)) {
    const filePath = path.join(IMAGE_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      errors.push(`File not found: ${filename}`);
      continue;
    }

    const item = menuItems.find(i => i.name === itemName);
    if (!item) {
      errors.push(`No menu item match for: ${itemName}`);
      continue;
    }

    try {
      const result = await uploadFile('menu_items', item.id, 'image', filePath);
      console.log(`  OK: ${filename} -> ${itemName}`);
      uploaded++;
    } catch (err) {
      errors.push(`${filename}: ${err.message}`);
      console.log(`  FAIL: ${filename}`);
    }
  }

  console.log(`\nUploaded: ${uploaded}/${Object.keys(imageToItem).length}`);
  if (errors.length > 0) {
    console.log('\nErrors/Issues:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  // ===== STEP 3: Verify =====
  console.log('\n--- Final Verification ---');
  const updatedItems = await pb.collection('menu_items').getFullList();
  const byCat = {};
  let withImages = 0;
  let withoutImages = 0;
  
  for (const item of updatedItems) {
    const cat = item.category || 'unknown';
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(item);
    if (item.image) withImages++;
    else withoutImages++;
  }
  
  for (const [cat, items] of Object.entries(byCat)) {
    console.log(`\n${cat.toUpperCase()} (${items.length}):`);
    for (const item of items) {
      const img = item.image ? '✓' : '✗';
      console.log(`  ${img} $${item.price} ${item.name}`);
    }
  }
  
  console.log(`\nTotal: ${updatedItems.length} items (${withImages} with images, ${withoutImages} without)`);
  
  // Also check settings
  const updatedSettings = await pb.collection('restaurant_settings').getFullList();
  const s = updatedSettings[0];
  console.log(`\nSettings colors:`);
  console.log(`  primary: ${s.primaryColor}`);
  console.log(`  secondary: ${s.secondaryColor}`);
  console.log(`  bg: ${s.backgroundColor}`);
  console.log(`  accent: ${s.accentColor}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
