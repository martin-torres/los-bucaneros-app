import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error('Error: PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables are required');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

async function setupCollections() {
  try {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Authenticated with PocketBase\n');

    const collections = [
      {
        name: 'restaurant_settings',
        type: 'base',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'shortName', type: 'text' },
          { name: 'currency', type: 'text', options: { max: 10 } },
          { name: 'tagline', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'locationText', type: 'text' },
          { name: 'logoUrl', type: 'text' },
          { name: 'heroImageUrl', type: 'text' },
          { name: 'heroTitle', type: 'text' },
          { name: 'heroSubtitle', type: 'text' },
          { name: 'pickupLocationText', type: 'text' },
          { name: 'adminPin', type: 'text', options: { max: 10 } },
          { name: 'kitchenPin', type: 'text', options: { max: 10 } },
          { name: 'primaryColor', type: 'text', options: { max: 20 } },
          { name: 'secondaryColor', type: 'text', options: { max: 20 } },
          { name: 'accentColor', type: 'text', options: { max: 20 } },
          { name: 'backgroundColor', type: 'text', options: { max: 20 } },
          { name: 'googleFontUrl', type: 'text' },
          { name: 'googleFontName', type: 'text' },
          { name: 'categories', type: 'json' },
          { name: 'uiText', type: 'json' },
          { name: 'deliveryRules', type: 'json' },
          { name: 'paymentSettings', type: 'json' },
        ],
      },
      {
        name: 'menu_items',
        type: 'base',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'price', type: 'number', required: true },
          { name: 'category', type: 'text', required: true },
          { name: 'image', type: 'text' },
          { name: 'active', type: 'bool', options: { default: true } },
          { name: 'isWeightBased', type: 'bool', options: { default: false } },
          { name: 'weightPricePerKg', type: 'number' },
          { name: 'stock', type: 'number' },
        ],
      },
      {
        name: 'orders',
        type: 'base',
        schema: [
          { name: 'customerName', type: 'text', required: true },
          { name: 'customerAddress', type: 'text' },
          { name: 'items', type: 'json', required: true },
          { name: 'total', type: 'number', required: true },
          { name: 'status', type: 'select', options: { values: ['recibido', 'preparando', 'empaquetando', 'listo', 'en_camino', 'entregado', 'pendiente_pago'], default: 'recibido' } },
          { name: 'paymentMethod', type: 'select', options: { values: ['efectivo', 'tarjeta', 'transferencia', 'conekta', 'mercadopago', 'codi'] } },
          { name: 'payWithAmount', type: 'number' },
          { name: 'transferScreenshot', type: 'file' },
          { name: 'deliveryDistanceKm', type: 'number' },
          { name: 'deliveryFee', type: 'number' },
          { name: 'timestamp', type: 'number' },
          { name: 'statusTimestamps', type: 'json' },
          { name: 'customerPhone', type: 'text' },
        ],
      },
      {
        name: 'leads',
        type: 'base',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'phone', type: 'text', required: true },
          { name: 'restaurantName', type: 'text' },
          { name: 'email', type: 'text' },
          { name: 'selectedPackage', type: 'text' },
          { name: 'packagePrice', type: 'number' },
          { name: 'visitorId', type: 'text' },
          { name: 'status', type: 'select', options: { values: ['new', 'contacted', 'converted', 'closed'], default: 'new' } },
          { name: 'notes', type: 'text' },
          { name: 'visitCount', type: 'number' },
          { name: 'created', type: 'autodate', options: { when: 'create' } },
        ],
      },
      {
        name: 'visitors',
        type: 'base',
        schema: [
          { name: 'ip', type: 'text' },
          { name: 'userAgent', type: 'text' },
          { name: 'deviceType', type: 'text' },
          { name: 'isPwaInstalled', type: 'bool' },
          { name: 'sessionId', type: 'text', required: true },
          { name: 'firstVisit', type: 'text' },
          { name: 'lastVisit', type: 'text' },
          { name: 'visitCount', type: 'number' },
          { name: 'associatedOrders', type: 'json' },
          { name: 'name', type: 'text' },
          { name: 'phone', type: 'text' },
          { name: 'leadCaptured', type: 'bool' },
          { name: 'selectedPackage', type: 'text' },
        ],
      },
    ];

    for (const collection of collections) {
      try {
        await pb.collections.create(collection);
        console.log(`✅ Created collection: ${collection.name}`);
      } catch (err) {
        if (err.data?.data?.name?.code === 'validation_not_unique') {
          console.log(`⏭️  Collection already exists: ${collection.name}`);
        } else {
          console.error(`❌ Error creating ${collection.name}:`, err.message);
        }
      }
    }

    console.log('\n✅ Collections setup complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupCollections();
