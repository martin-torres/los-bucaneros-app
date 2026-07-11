import type { VercelRequest, VercelResponse } from '@vercel/node';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  weightInGrams?: number;
}

interface OrderData {
  id: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  customerDetails?: string;
  items: string | OrderItem[];
  total: number;
  paymentMethod: string;
  payWithAmount?: number;
  changeAmount?: number;
  deliveryFee?: number;
  status?: string;
}

function parseItems(raw: unknown): OrderItem[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is OrderItem =>
      typeof item === 'object' && item !== null && 'name' in item && 'quantity' in item
    );
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseItems(parsed);
    } catch {
      return [];
    }
  }
  return [];
}

function formatOrderMessage(order: OrderData): string {
  const statusEmojis: Record<string, string> = {
    recibido: '🆕', preparando: '🔥', empaquetando: '📦',
    listo: '✅', en_camino: '🚗', entregado: '🎉', pendiente_pago: '💳',
  };
  const statusNames: Record<string, string> = {
    recibido: 'Recibido', preparando: 'Preparando', empaquetando: 'Empaquetando',
    listo: 'Listo para recoger', en_camino: 'En camino', entregado: 'Entregado', pendiente_pago: 'Pendiente de pago',
  };
  const paymentIcons: Record<string, string> = {
    efectivo: '💵 Efectivo', transferencia: '🏦 Transferencia', tarjeta: '💳 Tarjeta',
  };

  const status = order.status || 'recibido';
  const emoji = statusEmojis[status] || '🛒';
  const statusName = statusNames[status] || status;
  const payText = paymentIcons[order.paymentMethod] || order.paymentMethod;
  const items = parseItems(order.items);
  const fee = order.deliveryFee || 0;
  const grandTotal = order.total + fee;
  const addr = order.customerAddress || '';
  const isPickup = addr.includes('Paso por él') || addr.includes('Recoger');

  const itemsList = items
    .map(i => `• ${i.name} x${i.quantity}${i.weightInGrams ? ` (${i.weightInGrams}g)` : ''} - $${i.price * i.quantity}`)
    .join('\n');

  let msg = `${emoji} *NUEVO PEDIDO*\n━━━━━━━━━━━━━━━━\n*Cliente:* ${order.customerName}\n`;
  if (order.customerPhone) msg += `*Tel:* ${order.customerPhone}\n`;

  if (addr && !isPickup) {
    msg += `*Dirección:* ${addr}\n🔗 [Ver en Maps](https://www.google.com/maps?q=${encodeURIComponent(addr)})\n`;
    if (order.customerDetails) msg += `*Detalles:* ${order.customerDetails}\n`;
  }

  msg += `*Tipo:* ${isPickup ? '🚀 Pickup' : '🏠 Delivery'}\n*Pago:* ${payText}\n`;

  if (order.paymentMethod === 'efectivo') {
    if (order.payWithAmount) msg += `*Paga con:* $${order.payWithAmount}\n`;
    if (order.changeAmount !== undefined && order.changeAmount !== null) msg += `*Cambio:* $${order.changeAmount}\n`;
  }

  if (fee > 0) {
    msg += `*Subtotal:* $${order.total} MXN\n*Envío:* $${fee} MXN\n*Total:* $${grandTotal} MXN\n`;
  } else {
    msg += `*Total:* $${order.total} MXN\n`;
  }

  msg += `*Status:* ${emoji} ${statusName}\n━━━━━━━━━━━━━━━━\n*Items:*\n${itemsList}`;
  return msg;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('[notify] Telegram not configured');
      return res.status(200).json({ ok: true, note: 'Telegram not configured' });
    }

    let order: OrderData;

    // If only orderId was sent, fetch full record from PocketBase
    if ('orderId' in body && typeof body.orderId === 'string' && !('customerName' in body)) {
      const pbUrl = process.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
      const fetchResp = await fetch(`${pbUrl}/api/collections/orders/records/${body.orderId}`);
      if (!fetchResp.ok) {
        console.error('[notify] Failed to fetch order:', body.orderId);
        return res.status(200).json({ ok: true, warning: 'Order not found' });
      }
      const raw: Record<string, unknown> = await fetchResp.json();
      const rawItems = raw['items'];
      order = {
        id: String(raw['id'] || ''),
        customerName: String(raw['customerName'] || 'Invitado'),
        customerAddress: raw['customerAddress'] ? String(raw['customerAddress']) : undefined,
        customerPhone: raw['customerPhone'] ? String(raw['customerPhone']) : undefined,
        customerDetails: raw['customerDetails'] ? String(raw['customerDetails']) : undefined,
        items: typeof rawItems === 'string' ? JSON.parse(rawItems) : (Array.isArray(rawItems) ? rawItems : []),
        total: Number(raw['total'] || 0),
        paymentMethod: String(raw['paymentMethod'] || ''),
        payWithAmount: raw['payWithAmount'] ? Number(raw['payWithAmount']) : undefined,
        changeAmount: raw['changeAmount'] !== undefined && raw['changeAmount'] !== null ? Number(raw['changeAmount']) : undefined,
        deliveryFee: raw['deliveryFee'] ? Number(raw['deliveryFee']) : undefined,
        status: raw['status'] ? String(raw['status']) : undefined,
      };
    } else {
      order = body as unknown as OrderData;
    }

    const message = formatOrderMessage(order);

    const telegramResp = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!telegramResp.ok) {
      const errorData: unknown = await telegramResp.json();
      console.error('[notify] Telegram API error:', errorData);
      return res.status(200).json({ ok: true, warning: 'Telegram send failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[notify] Error:', error);
    return res.status(200).json({ ok: true, warning: 'Internal error' });
  }
}
