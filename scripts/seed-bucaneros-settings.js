import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@losbuncaneros.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'LosBucanerosAdmin2026!';

const pb = new PocketBase(PB_URL);

const settings = {
  name: 'Los Bucaneros',
  shortName: 'Los Bucaneros',
  currency: 'MXN',
  tagline: 'Ahumamos por mas de 12 horas para darte un sabor incomparable',
  description: 'BBQ ahumado artesanal - Brisket, Pulled Pork y complementos. Todo empacado al alto vacio.',
  locationText: 'Monterrey, NL.',
  logoUrl: '/los-bucaneros.png',
  heroImageUrl: '/buncaneros_hero.jpg',
  heroTitle: 'Los Bucaneros',
  heroSubtitle: 'BBQ Ahumado Artesanal',
  pickupLocationText: 'Recoger en Sucursal',
  adminPin: '1234',
  kitchenPin: '5678',
  primaryColor: '#8B1A1A',
  secondaryColor: '#D4A574',
  accentColor: '#1A1A2E',
  backgroundColor: '#FFF8F0',
  googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700;800&display=swap',
  googleFontName: 'Inter',
  categories: JSON.stringify([
    { code: 'paquete', displayName: 'Paquetes' },
    { code: 'complemento', displayName: 'Complementos' },
    { code: 'salsa', displayName: 'Salsas BBQ' },
    { code: 'bebida', displayName: 'Bebidas' },
  ]),
  uiText: JSON.stringify({
    loadingTitle: 'Cargando Los Bucaneros',
    errorTitle: 'Error al Cargar',
    retryButton: 'Intentar de Nuevo',
    menuButton: 'Menu',
    cartButton: 'Ver Carrito',
    promotionsTitle: 'Paquetes',
    checkoutTitle: 'Tu Pedido',
    deliveryTitle: 'Entrega a Domicilio',
    paymentTitle: 'Metodo de Pago',
    confirmOrderPrefix: 'CONFIRMAR PEDIDO',
    pickupOptionLabel: 'Recoger',
    deliveryOptionLabel: 'A Domicilio',
    newOrderButton: 'Nuevo Pedido',
    kitchenTitle: 'Cocina',
    kitchenInProgressLabel: 'Ordenes en proceso',
    kitchenEmptyLabel: 'Sin ordenes activas',
    kitchenAcceptLabel: 'Aceptar',
    kitchenCookedLabel: 'Listo',
    kitchenDeliverCustomerLabel: 'Entregar',
    kitchenSendRiderLabel: 'Enviar',
    kitchenConfirmDeliveryLabel: 'Confirmar',
    dataTitle: 'Dashboard',
    dataRefreshLabel: 'Actualizar',
    dataLockTitle: 'Acceso Administrador',
    kitchenLockTitle: 'Acceso Cocina',
  }),
  deliveryRules: JSON.stringify({
    thresholds: [
      { km: 3, fee: 49 },
      { km: 5, fee: 79 },
      { km: 8, fee: 99 },
      { km: 12, fee: 129 },
    ],
    storeLat: 25.6866,
    storeLng: -100.3161,
  }),
  paymentSettings: JSON.stringify({
    codiEnabled: false,
    transferBankName: '',
    transferAccountNumber: '',
  }),
};

async function seed() {
  try {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Authenticated as admin');
  } catch (e) {
    const authData = await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Authenticated as superuser');
  }

  // Check if settings already exist
  const existing = await pb.collection('restaurant_settings').getFullList();
  if (existing.length > 0) {
    console.log('Updating existing settings...');
    await pb.collection('restaurant_settings').update(existing[0].id, settings);
    console.log('Settings updated.');
  } else {
    console.log('Creating new settings...');
    await pb.collection('restaurant_settings').create(settings);
    console.log('Settings created.');
  }
}

seed().catch(console.error);
