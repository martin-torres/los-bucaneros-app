import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090');

pb.autoCancellation(false);

let isAuth = false;

export const adminAuth = async (email: string, password: string): Promise<boolean> => {
  try {
    await pb.collection('_superusers').authWithPassword(email, password);
    isAuth = true;
    return true;
  } catch (error) {
    console.error('Admin auth failed:', error);
    return false;
  }
};

export const isAdminAuth = (): boolean => isAuth && pb.authStore.isValid;

export const menuApi = {
  getAll: async () => {
    console.log('[adminApi] Fetching menu_items...');
    const records = await pb.collection('menu_items').getFullList();
    console.log('[adminApi] menu_items count:', records.length);
    return records;
  },
  
  create: async (data: any) => {
    const record = await pb.collection('menu_items').create(data);
    return record;
  },
  
  update: async (id: string, data: any) => {
    const record = await pb.collection('menu_items').update(id, data);
    return record;
  },
  
  delete: async (id: string) => {
    await pb.collection('menu_items').delete(id);
  },
};

// Orders
export const ordersApi = {
  getAll: async () => {
    const records = await pb.collection('orders').getFullList();
    return records;
  },
  
  updateStatus: async (id: string, status: string) => {
    const record = await pb.collection('orders').update(id, { status });
    return record;
  },
};

// Settings
export const settingsApi = {
  get: async () => {
    const records = await pb.collection('restaurant_settings').getFullList();
    return records[0] || null;
  },
  
  update: async (id: string, data: any) => {
    const record = await pb.collection('restaurant_settings').update(id, data);
    return record;
  },
};

// Promos (stored in promos collection)
export const promosApi = {
  getAll: async () => {
    const records = await pb.collection('promos').getFullList();
    return records;
  },
  
  create: async (data: any) => {
    const record = await pb.collection('promos').create(data);
    return record;
  },
  
  update: async (id: string, data: any) => {
    const record = await pb.collection('promos').update(id, data);
    return record;
  },
  
  delete: async (id: string) => {
    await pb.collection('promos').delete(id);
  },
};

// Leads
export const leadsApi = {
  getAll: async () => {
    const records = await pb.collection('leads').getFullList({ sort: '-created' });
    return records;
  },
  
  create: async (data: any) => {
    const record = await pb.collection('leads').create(data);
    return record;
  },
  
  update: async (id: string, data: any) => {
    const record = await pb.collection('leads').update(id, data);
    return record;
  },
  
  delete: async (id: string) => {
    await pb.collection('leads').delete(id);
  },
};

export default pb;
