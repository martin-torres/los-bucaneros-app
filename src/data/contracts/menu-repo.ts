import type { MenuCategory, MenuItem } from '../../core/types';

export interface MenuRepository {
  getAll(): Promise<MenuItem[]>;
  getByCategory(category: MenuCategory): Promise<MenuItem[]>;
  getById(id: string): Promise<MenuItem>;
  getActivePromos(): Promise<MenuItem[]>;
}
