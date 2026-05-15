import type { MenuItem, Order, OrderStatus } from '../types';
import type { AppSkinSettings } from '../src/core/types';
import { menuRepository, ordersRepository, pbClient, settingsRepository } from '../src/data/pocketbase';

export const menuItemsApi = {
  getAll: async (): Promise<MenuItem[]> => menuRepository.getAll(),
  getByCategory: async (category: string): Promise<MenuItem[]> =>
    menuRepository.getByCategory(category as any),
  getPromotions: async (): Promise<MenuItem[]> => menuRepository.getActivePromos(),
  getById: async (id: string): Promise<MenuItem> => menuRepository.getById(id),
};

export const ordersApi = {
  create: async (orderData: Omit<Order, 'id'> & { id?: string }): Promise<Order> =>
    ordersRepository.create(orderData),
  getAll: async (status?: OrderStatus): Promise<Order[]> => ordersRepository.getAll(status),
  getActive: async (): Promise<Order[]> => ordersRepository.getActive(),
  getById: async (id: string): Promise<Order> => ordersRepository.getById(id),
  updateStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> =>
    ordersRepository.updateStatus(orderId, newStatus),
  delete: async (orderId: string): Promise<boolean> => {
    await ordersRepository.remove(orderId);
    return true;
  },
};

export const subscribeToOrders = (callback: (order: Order) => void) =>
  ordersRepository.subscribeToOrders(callback);

export const settingsApi = {
  get: async (): Promise<AppSkinSettings | null> => settingsRepository.get(),
  save: async (settings: Partial<AppSkinSettings>): Promise<AppSkinSettings> =>
    settingsRepository.save(settings),
};

export const authApi = {
  login: async (email: string, password: string) =>
    pbClient.collection('users').authWithPassword(email, password),
  logout: () => {
    pbClient.authStore.clear();
  },
  getCurrentUser: () => pbClient.authStore.model,
  isAuthenticated: () => pbClient.authStore.isValid,
};

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('screenshot', file);
  const record = await pbClient.collection('orders').create(formData);
  return record.id;
};

export default pbClient;

