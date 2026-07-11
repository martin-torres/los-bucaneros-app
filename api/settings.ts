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

    // Authenticate as admin to read locked settings collection
    const adminEmail = process.env.PB_ADMIN_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD;
    let authToken = '';

    if (adminEmail && adminPassword) {
      const authResp = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: adminEmail, password: adminPassword }),
      });
      if (authResp.ok) {
        const authData: Record<string, unknown> = await authResp.json();
        authToken = String(authData['token'] || '');
      }
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const resp = await fetch(`${pbUrl}/api/collections/restaurant_settings/records?perPage=1`, { headers });
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

    return res.status(200).json(filtered);
  } catch (error) {
    console.error('[settings] Error:', error);
    return res.status(200).json({});
  }
}
