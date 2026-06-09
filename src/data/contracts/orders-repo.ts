import type { Order, OrderStatus } from '../../core/types';

export interface OrdersRepository {
  create(orderData: Omit<Order, 'id'> & { id?: string }): Promise<Order>;
  getAll(status?: OrderStatus): Promise<Order[]>;
  getActive(): Promise<Order[]>;
  getById(id: string): Promise<Order>;
  updateStatus(orderId: string, status: OrderStatus): Promise<Order>;
  remove(orderId: string): Promise<void>;
}

export interface OrdersRealtimeRepository {
  subscribeToOrders(callback: (order: Order) => void): Promise<() => void>;
}
