import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SettingsResponse {
  [key: string]: unknown;
}

const PUBLIC_FIELDS = [
  'name', 'currency', 'shortName', 'tagline', 'description',
  'locationText', 'logoUrl', 'heroImageUrl', 'heroTitle', 'heroSubtitle',
  'pickupLocationText', 'primaryColor', 'secondaryColor', 'accentColor',
  'backgroundColor', 'googleFontUrl', 'googleFontName',
  'categories', 'deliveryRules', 'paymentSettings', 'uiText',
  'visitorTrackingEnabled', 'telegramNotificationsEnabled',
];

const SECRET_FIELDS = ['telegramBotToken', 'telegramChatId', 'adminPin', 'kitchenPin'];

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || 'https://los-bucaneros-pb.fly.dev';

    const resp = await fetch(`${pbUrl}/api/collections/restaurant_settings/records?perPage=1`);
    if (!resp.ok) {
      return res.status(200).json({});
    }

    const data: unknown = await resp.json();

    if (typeof data !== 'object' || data === null) {
      return res.status(200).json({});
    }

    const body = data as Record<string, unknown>;
    const items = body['items'];

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(200).json({});
    }

    const settings = items[0] as Record<string, unknown>;
    const filtered: SettingsResponse = {};

    for (const field of PUBLIC_FIELDS) {
      const val = settings[field];
      if (val !== undefined && val !== null) {
        filtered[field] = val;
      }
    }

    // Explicitly strip secrets
    for (const field of SECRET_FIELDS) {
      delete settings[field];
    }

    return res.status(200).json(filtered);
  } catch (error) {
    console.error('[settings] Error:', error);
    return res.status(200).json({});
  }
}
