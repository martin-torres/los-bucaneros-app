import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@losbuncaneros.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'LosBucanerosAdmin2026!';

const pb = new PocketBase(PB_URL);

const menuItems = [
  // PAQUETES
  {
    name: 'Medio Kilo de Pulled Pork',
    description: '1/2 kg de pulled pork ahumado. Incluye bollos, salsas BBQ, aderezo de ajo y chucrut.',
    price: 499,
    category: 'paquete',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Medio Kilo de Brisket',
    description: '1/2 kg de brisket ahumado. Incluye bollos, salsas BBQ, aderezo de ajo y chucrut.',
    price: 599,
    category: 'paquete',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Un Kilo de Pulled Pork',
    description: '1 kg de pulled pork ahumado. Incluye bollos, salsas BBQ, aderezo de ajo y chucrut.',
    price: 889,
    category: 'paquete',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Un Kilo de Brisket',
    description: '1 kg de brisket ahumado. Incluye bollos, salsas BBQ, aderezo de ajo y chucrut.',
    price: 1189,
    category: 'paquete',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Medio Kilo Pulled Pork + Medio Kilo Brisket',
    description: 'Combinado: 1/2 kg de pulled pork + 1/2 kg de brisket. Incluye bollos, salsas BBQ, aderezo de ajo y chucrut.',
    price: 1039,
    category: 'paquete',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Un Kilo Pulled Pork + Un Kilo Brisket',
    description: 'Combinado: 1 kg de pulled pork + 1 kg de brisket. Incluye bollos, salsas BBQ, aderezo de ajo y chucrut.',
    price: 2059,
    category: 'paquete',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  // COMPLEMENTOS
  {
    name: 'Dos Bollos Brioche',
    description: 'Dos bollos brioche suaves y esponjados.',
    price: 62,
    category: 'complemento',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Aderezo de Ajo (100ml)',
    description: 'Aderezo cremoso de ajo, perfecto para acompanar tus carnes.',
    price: 89,
    category: 'complemento',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Creamed Corn (250gr)',
    description: 'Elote cremoso con sazon BBQ.',
    price: 119,
    category: 'complemento',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Chucrut (200gr)',
    description: 'Chucrut casero, el complemento perfecto para tus carnes ahumadas.',
    price: 119,
    category: 'complemento',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Dos Pepinillos Enteros',
    description: 'Dos pepinillos enteros en vinagre.',
    price: 59,
    category: 'complemento',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Postre: Carlota de Limon (180gr)',
    description: 'Postre refrescante de carlota de limon.',
    price: 119,
    category: 'complemento',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  // SALSAS BBQ (125ml c/u)
  {
    name: 'Salsa BBQ Original (125ml)',
    description: 'Salsa BBQ clasica hecha en casa, receta secreta.',
    price: 129,
    category: 'salsa',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Salsa BBQ Vinagre (125ml)',
    description: 'Salsa BBQ con base de vinagre, hecha en casa, receta secreta.',
    price: 129,
    category: 'salsa',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Salsa BBQ Chipotle (125ml)',
    description: 'Salsa BBQ con chipotle ahumado, hecha en casa, receta secreta.',
    price: 129,
    category: 'salsa',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Salsa BBQ Habanero (125ml)',
    description: 'Salsa BBQ con habanero para los mas atrevidos, hecha en casa.',
    price: 129,
    category: 'salsa',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  // BEBIDAS
  {
    name: 'Coca Cola (600ml)',
    description: 'Coca Cola clasica de 600ml bien fria.',
    price: 45,
    category: 'bebida',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
  {
    name: 'Agua',
    description: 'Agua purificada 600ml.',
    price: 30,
    category: 'bebida',
    image: '',
    active: true,
    trackInventory: true,
    stock: -1,
  },
];

async function seed() {
  try {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Authenticated as admin');
  } catch (e) {
    const authData = await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Authenticated as superuser');
  }

  // Clear existing menu items
  const existing = await pb.collection('menu_items').getFullList();
  for (const item of existing) {
    await pb.collection('menu_items').delete(item.id);
    console.log('Deleted:', item.name);
  }

  // Insert new menu items
  for (const item of menuItems) {
    const created = await pb.collection('menu_items').create(item);
    console.log('Created:', item.name, '-', item.price);
  }

  console.log(`\nTotal: ${menuItems.length} menu items created`);
}

seed().catch(console.error);
