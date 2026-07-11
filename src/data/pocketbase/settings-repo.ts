import type { SettingsRepository } from '../contracts';
import type { AppSkinSettings } from '../../core/types';
import { pbClient } from './client';

export class PocketBaseSettingsRepository implements SettingsRepository {
  async get(): Promise<AppSkinSettings | null> {
    // Try the Vercel API endpoint first (it strips secrets)
    try {
      const resp = await fetch('/api/settings');
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.name) {
          return data as AppSkinSettings;
        }
      }
    } catch {
      // Fall through to direct PocketBase read
    }

    // Fallback: read directly from PocketBase (for local dev)
    try {
      const settings = await pbClient.collection('restaurant_settings').getFullList();
      if (settings.length === 0) {
        return null;
      }
      return settings[0] as any as AppSkinSettings;
    } catch (error: any) {
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async save(settings: Partial<AppSkinSettings>): Promise<AppSkinSettings> {
    const existing = await pbClient.collection('restaurant_settings').getFullList();
    if (existing.length > 0) {
      const updated = await pbClient
        .collection('restaurant_settings')
        .update(existing[0].id, settings);
      return updated as any as AppSkinSettings;
    }

    const created = await pbClient.collection('restaurant_settings').create(settings);
    return created as any as AppSkinSettings;
  }
}

