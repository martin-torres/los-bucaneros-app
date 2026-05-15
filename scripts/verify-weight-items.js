import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090');

// Set admin auth
await pb.admins.authWithPassword(
  process.env.PB_ADMIN_EMAIL || 'trulum@proton.me',
  process.env.PB_ADMIN_PASSWORD || 'z9BtVngz7MpN@Vpu*v6k'
);

console.log('✅ Connected to PocketBase as admin\n');

async function verifyWeightItems() {
  try {
    console.log('🔍 Verifying weight-based menu items...\n');

    // Get all items
    const allItems = await pb.collection('menu_items').getFullList({
      filter: 'active = true',
      sort: 'category,name',
    });

    console.log(`📊 Total active items: ${allItems.length}\n`);

    // Check ALL items for weight-related flags
    const weightItems = allItems.filter(item => item.isWeightBased === true);
    const itemsWithPriceIssue = allItems.filter(item => item.isWeightBased && item.price > 0);
    const itemsWithoutPriceButWeight = allItems.filter(item => !item.isWeightBased && item.weightPricePerKg > 0);

    console.log('📋 ALL ITEMS CHECK:\n');
    console.log('┌──────────────────────────────────┬──────────────┬──────────────┬──────────────────┬──────────┐');
    console.log('│ Name                             │ Category     │ isWeightBased │ weightPricePerKg │ Price    │');
    console.log('├──────────────────────────────────┼──────────────┼──────────────┼──────────────────┼──────────┤');

    allItems.forEach(item => {
      const name = item.name.padEnd(32).substring(0, 32);
      const category = (item.category || '').padEnd(12).substring(0, 12);
      const isWeight = item.isWeightBased === true ? '✅ YES' : '❌ NO';
      const weightPrice = item.weightPricePerKg && item.weightPricePerKg > 0 ? `${item.weightPricePerKg} MXN` : 'N/A';
      const price = item.price > 0 ? `${item.price} MXN` : '0 MXN';

      console.log(`│ ${name} │ ${category} │ ${isWeight.padEnd(12)} │ ${weightPrice.padEnd(16)} │ ${price.padEnd(8)} │`);
    });

    console.log('└──────────────────────────────────┴──────────────┴──────────────┴──────────────────┴──────────┘\n');

    // Report weight-based items
    console.log('📦 Items MARKED as weight-based:');
    if (weightItems.length === 0) {
      console.log('   (none)');
    } else {
      weightItems.forEach(item => console.log(`   - ${item.name} (${item.category})`));
    }

    // Check for problematic items
    if (itemsWithPriceIssue.length > 0) {
      console.log('\n⚠️  WARNING: Items weight-based but have non-zero price:');
      itemsWithPriceIssue.forEach(item => console.log(`   - ${item.name} (price: ${item.price} MXN, should be 0)`));
    }

    if (itemsWithoutPriceButWeight.length > 0) {
      console.log('\n⚠️  WARNING: Items NOT weight-based but have weightPricePerKg > 0:');
      itemsWithoutPriceButWeight.forEach(item => console.log(`   - ${item.name} (weightPricePerKg: ${item.weightPricePerKg})`));
    }

    // Check for items with promoActive
    const promoItems = allItems.filter(item => item.promoActive);
    if (promoItems.length > 0) {
      console.log(`\n🔥 Items with active promos: ${promoItems.length}`);
      promoItems.forEach(item => console.log(`   - ${item.name}: ${item.price} → ${item.promoPrice} MXN`));
    }

    console.log('\n✨ Verification complete!\n');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await pb.authStore.clear();
    console.log('🔒 Logged out\n');
  }
}

verifyWeightItems();
