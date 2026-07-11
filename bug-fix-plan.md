# Los Bucaneros — Bug Fix Plan

**Generated:** 2026-07-11
**Bugs found by:** SilentFailureHunter + E2E agents
**Base path:** `/Users/lomalinda007yahoo.com/Documents/Apps/los-buncaneros-app`

---

## Overview

9 bugs across 4 severity tiers covering the full stack: PocketBase migrations missing permissive rules, a Vercel serverless endpoint receiving incomplete payloads, silent async error swallowing in React components, a stock-accounting code path bypass, an orphaned order status with no UI progression path, and a bundled-admin-credentials exposure vector.

---

## Phase 1 — Get the App Working (Bugs 1, 2, 5)

---

### Bug 1 + Bug 2: Kitchen can't read / update orders

**Severity:** CRITICAL — blocking. Kitchen is inoperable.

**Root cause:** Migration `pocketbase/pb_migrations/1776830003_lockdown_collections.js` sets `orders.listRule = null` and `orders.updateRule = null`. Kitchen staff have no authenticated PocketBase session, so PB rejects every read/update with 403.

**Why NOT to edit the existing migration:** PocketBase tracks migrations by filename. `1776830003` has already been applied to the production PB instance (`los-bucaneros-pb.fly.dev`). Editing its contents does NOT cause PB to re-apply it. The fix must be a **new** migration file with a greater timestamp.

**Change:**

| Item | Value |
|------|-------|
| **Action** | Create new migration file |
| **File** | `pocketbase/pb_migrations/1776830004_fix_orders_collection_rules.js` |
| **Content** | See below |
| **Deployment** | Must be committed & PB server restarted / migrations re-run |

```javascript
/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const orders = app.findCollectionByNameOrId("pbc_3527180448")
  orders.listRule = ""
  orders.updateRule = ""
  app.save(orders)
}, (app) => {
  const orders = app.findCollectionByNameOrId("pbc_3527180448")
  orders.listRule = null
  orders.updateRule = null
  app.save(orders)
})
```

**Risk:** Makes `listRule` and `updateRule` public (anyone can read/update orders). For a restaurant ordering app where order IDs are short but unguessable, this is acceptable per the bug report — the app has no kitchen auth yet. The rules can be tightened later when a proper kitchen auth endpoint exists.

**Verification:**
1. Deploy migration to PB server
2. Visit kitchen view as unauthenticated user
3. Verify orders are visible (200, not 403)
4. Click any status button (e.g. "Aceptar Comanda") → verify status changes
5. Run `curl https://los-bucaneros-pb.fly.dev/api/collections/orders/records` — should return records, not 403

---

### Bug 5: `/api/notify` sends garbage when only `orderId` is sent

**Severity:** CRITICAL — Telegram notifications show "undefined" for name, items, total.

**Root cause:** In `App.tsx:331-335` the frontend sends `{ orderId: newOrder.id }` to `/api/notify`. The handler at `api/notify.ts:60-68` treats the entire body as a full `OrderData` object (`body as unknown as OrderData`). All required fields (`customerName`, `items`, `total`) are `undefined`, so the Telegram message reads like:

```
🆕 *NUEVO PEDIDO*
*Cliente:* undefined
*Total:* $NaN MXN
*Items:*
```

**Fix:**

**File:** `api/notify.ts` — modify the handler body (after line 68, before `formatMessage(order)`)

**Change:** When the body contains only `orderId` (no `customerName`), fetch the full order from PocketBase before formatting.

```typescript
// Replace:
const order = body as unknown as OrderData;
const message = formatOrderMessage(order);

// With:
let order: OrderData;

// If only orderId was sent, fetch the full record from PocketBase
if ('orderId' in body && typeof body.orderId === 'string' && !('customerName' in body)) {
  const pbUrl = process.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
  const fetchResp = await fetch(`${pbUrl}/api/collections/orders/records/${body.orderId}`);
  if (!fetchResp.ok) {
    console.error('[notify] Failed to fetch order:', body.orderId);
    return res.status(200).json({ ok: true, warning: 'Order not found' });
  }
  const raw = await fetchResp.json();
  // Convert PB record shape to OrderData
  order = {
    id: raw.id,
    customerName: raw.customerName || 'Invitado',
    customerAddress: raw.customerAddress,
    customerPhone: raw.customerPhone,
    customerDetails: raw.customerDetails,
    items: typeof raw.items === 'string' ? JSON.parse(raw.items) : (raw.items || []),
    total: raw.total || 0,
    paymentMethod: raw.paymentMethod || '',
    payWithAmount: raw.payWithAmount,
    changeAmount: raw.changeAmount,
    deliveryFee: raw.deliveryFee,
    status: raw.status,
  };
} else {
  order = body as unknown as OrderData;
}

const message = formatOrderMessage(order);
```

**Risk:** Adds a server-to-server fetch dependency. If PB is unreachable from Vercel function runtime, the notify falls through to a 200 "not found" warning. The `VITE_POCKETBASE_URL` env var must be set on the Vercel project (it likely already is, since the frontend uses it). The `/api/notify` and `/api/settings` handlers already run on Vercel, so the networking path exists. Note: this endpoint already reads `VITE_POCKETBASE_URL` implicitly — it's just not used in this code path yet.

**Verification:**
1. Place an order (real or via curl hitting `/api/notify` with `{ "orderId": "TEST123" }`)
2. Check Telegram for a properly formatted message with customer name, items, and total
3. Also test with full order data to ensure backward compatibility

---

## Phase 2 — Fix Silent Failures (Bugs 4, 8, 7)

---

### Bug 4: Kitchen status button failures are silent

**Severity:** HIGH — staff clicks button, nothing happens, no error feedback.

**Root cause:** In `src/features/kitchen/kitchenView.tsx`, each status button's `onClick` calls `updateOrderStatus(order.id, nextStatus)` as a bare function reference. The parent `updateOrderStatus` (defined in `App.tsx:295-301`) is `async` and **re-throws** errors. Since no one catches the promise rejection, the UI simply does nothing on failure.

Relevant code (lines 160-165):
```tsx
{order.status === 'recibido' && <button onClick={() => updateOrderStatus(order.id, 'preparando')} ... />}
{order.status === 'preparando' && <button onClick={() => updateOrderStatus(order.id, 'listo')} ... />}
{order.status === 'listo' && <button onClick={() => updateOrderStatus(order.id, order.customerAddress === pickupLocationText ? 'entregado' : 'en_camino')} ... />}
{order.status === 'en_camino' && <button onClick={() => updateOrderStatus(order.id, 'entregado')} ... />}
```

**Fix:**

**File:** `src/features/kitchen/kitchenView.tsx`

**Change:** Define a local `handleStatusUpdate` wrapper inside the `KitchenView` component (before the `return` statement):

```tsx
const handleStatusUpdate = async (orderId: string, newStatus: string) => {
  try {
    await updateOrderStatus(orderId, newStatus);
  } catch (error) {
    console.error('Kitchen: Failed to update status:', error);
    alert('Error al actualizar el estado. Por favor intenta de nuevo.');
  }
};
```

Then change each button's onClick:
```tsx
{order.status === 'recibido' && <button onClick={() => handleStatusUpdate(order.id, 'preparando')} ... />}
{order.status === 'preparando' && <button onClick={() => handleStatusUpdate(order.id, 'listo')} ... />}
{order.status === 'listo' && <button onClick={() => handleStatusUpdate(order.id, order.customerAddress === pickupLocationText ? 'entregado' : 'en_camino')} ... />}
{order.status === 'en_camino' && <button onClick={() => handleStatusUpdate(order.id, 'entregado')} ... />}
```

(Also update when pendiente_pago button is added in Bug 6.)

**Risk:** Low. The `alert()` might be intrusive for intermittent network failures, but it's acceptable for a kitchen tool where silent failures cause orders to stall. A toast would be more polished but `alert` is the minimum viable feedback.

**Verification:**
1. Open kitchen view
2. Click a status button while offline (disconnect network in devtools)
3. Verify an error alert appears
4. Reconnect, click again → verify status changes normally

---

### Bug 8: `subscribeToOrders()` missing `.catch()`

**Severity:** HIGH — if subscription fails, kitchen + tracking stop updating silently.

**Root cause:** Two `useEffect` blocks in `App.tsx` call `subscribeToOrders()` and chain `.then()` without `.catch()`. If the PocketBase WebSocket subscription fails (network issue, auth expiry), the error is an unhandled promise rejection.

**Location 1** — `App.tsx:323-339` (kitchen subscribe):
```typescript
subscribeToOrders((order: Order) => {
  setOrders(prevOrders => { ... });
}).then((fn: any) => {
  unsubscribe = fn;
});
// NO .catch()
```

**Location 2** — `App.tsx:347-362` (customer tracking subscribe):
```typescript
subscribeToOrders((order: Order) => {
  if (order.id !== currentOrder.id) return;
  setCurrentOrder(order);
  if (order.status === 'entregado') { ... }
}).then((fn: any) => {
  unsubscribe = fn;
});
// NO .catch()
```

**Fix:**

**File:** `App.tsx`

**Change 1 (kitchen subscribe, after `.then()`, around line 333):**
```typescript
subscribeToOrders((order: Order) => {
  setOrders(prevOrders => {
    if (order.status === 'entregado') {
      return prevOrders.filter(o => o.id !== order.id);
    }
    const idx = prevOrders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      return prevOrders.map((o, i) => (i === idx ? order : o));
    }
    return [...prevOrders, order];
  });
}).then((fn: any) => {
  unsubscribe = fn;
}).catch((err) => {
  console.error('Kitchen subscription failed:', err);
});
```

**Change 2 (tracking subscribe, after `.then()`, around line 358):**
```typescript
subscribeToOrders((order: Order) => {
  if (order.id !== currentOrder.id) return;
  setCurrentOrder(order);
  if (order.status === 'entregado') {
    setTimeout(() => {
      setCurrentOrder(null);
      setActiveScreen('landing');
    }, 2000);
  }
}).then((fn: any) => {
  unsubscribe = fn;
}).catch((err) => {
  console.error('Tracking subscription failed:', err);
});
```

**Risk:** Minimal. The `.catch()` only logs — it doesn't retry. Adding auto-reconnect would be a nice enhancement but is out of scope for this fix.

**Verification:**
1. Open browser console
2. Load the app (kitchen view or customer tracking)
3. Temporarily interrupt network, then restore
4. Verify no "Uncaught (in promise)" error appears in console
5. Verify subscriptions still work after network restore

---

### Bug 7: `settingsApi.get()` failure is silent

**Severity:** MEDIUM — app degrades silently to defaults; owner may not notice misconfiguration.

**Root cause:** In `App.tsx:61-67`, the settings fetch catch handler logs to console but does not set any user-visible error state or explicitly fall back:

```typescript
useEffect(() => {
  settingsApi
    .get()
    .then((data) => setSettings(data))
    .catch((err) => {
      console.error('Error loading restaurant settings:', err);
    })
    .finally(() => setSettingsLoading(false));
}, []);
```

When this fails:
- `settings` remains `null` (initial state)
- `resolveUiSettings(null)` returns hardcoded defaults
- The app renders with amber (`#f59e0b`) primary, white background, "Restaurant" name
- User never knows configuration is missing

**Fix (recommended approach):**

**File:** `App.tsx`

**Change 1 — Explicit fallback in the catch:** The app already degrades gracefully but the intent should be explicit:

```typescript
.catch((err) => {
  console.error('Error loading restaurant settings:', err);
  // settings stays null → resolveUiSettings(null) returns defaults
  // This is graceful degradation — app still works with sensible defaults
})
```

No code change needed for this — the current behavior is actually acceptable. The app does not crash, it shows defaults. Just document this as intentional.

**Change 2 (optional enhancement — only if admin visibility is desired):**
Add a `settingsError` state that admin dashboard can display while keeping the customer-facing app functional:

```typescript
// Near line 32:
const [settingsError, setSettingsError] = useState<string | null>(null);

// In catch (line 65):
.catch((err) => {
  console.error('Error loading restaurant settings:', err);
  setSettingsError('No se pudo cargar la configuración del restaurante');
  setSettings(null);  // ensure explicit fallback
})
```

Then expose `settingsError` to admin panel only (not to customers). This is recommended but optional for this phase.

**Risk:** Low. The app currently handles `settings === null` correctly. No crash path exists.

**Verification:**
1. Block the `/api/settings` endpoint in devtools
2. Reload the app
3. Verify error is logged to console
4. Verify app still renders with defaults (no crash, no blank screen)

---

## Phase 3 — Fix Stock & Payment Flow (Bugs 3, 6)

---

### Bug 3: Stock deduction never runs

**Severity:** HIGH — inventory-tracked items are never deducted; items sell after stock reaches 0.

**Root cause:** `App.tsx:327` calls `pb.collection('orders').create(formData)` directly instead of using `ordersApi.create()` (defined in `lib/pocketbase.ts:13-15`). The repository layer's `PocketBaseOrdersRepository.create()` (at `src/data/pocketbase/orders-repo.ts:11-21`) wraps the PB call and then calls `this._deductStock(orderData.items)` (lines 27-43). By bypassing the repository, the stock deduction is never triggered.

**Fix:**

**File:** `App.tsx` (inside `placeOrder()`, lines 233-327)

**Change:** Replace the entire FormData construction block and raw PB call with a call to `ordersApi.create()`. The `newOrderData` object (lines 223-232) already contains all the data in the correct shape.

**Remove** lines 233-268 (all `formData.append(...)` calls).

**Replace** line 327:

```typescript
// Before (line 327):
const newOrder = await pb.collection('orders').create(formData);

// After:
const newOrder = await ordersApi.create(newOrderData as any);
```

**Complete diff of the affected area:**

```
  const newOrderData: Omit<Order, 'id'> = { ... };  // unchanged

  // REMOVED: const formData = new FormData();
  // REMOVED: formData.append('customerName', ...);
  // REMOVED: formData.append(...) x ~25 lines

  // CHANGED:
- const newOrder = await pb.collection('orders').create(formData);
+ const newOrder = await ordersApi.create(newOrderData as any);

  // Everything below stays the same:
  await associateVisitorWithOrder(newOrder.id);
  if (settings?.telegramNotificationsEnabled) { ... }
  ...
```

**Why this works:**
- `ordersRepository.create()` spreads `orderData` into a PB SDK create call, which auto-converts objects with `File` values to multipart FormData.
- `newOrderData` already includes `transferScreenshot: File | undefined` and all other fields.
- `ordersRepository.create()` overrides `timestamp` and `statusTimestamps` with the same values `newOrderData` carries — no data loss.
- After creating the PB record, `_deductStock()` runs automatically for each inventory-tracked item.

**Potential issue — `id` generation:** The repository generates a short random `id` (6 uppercase alphanumeric chars). This replaces PB's auto-generated ID. This is the intended behavior — shorter IDs are more usable in a kitchen context.

**Potential issue — `items` serialization:** `newOrderData.items` is `OrderItem[]`. When passed to the repository's `pbClient.collection('orders').create(...)`, PocketBase SDK will serialize it as JSON (since the field type in PB is JSON). This is the same behavior as the manual `formData.append('items', JSON.stringify(newOrderData.items))` — no behavioral difference.

**Risk:** MEDIUM. Main risks:
1. PB SDK object-to-FormData conversion might not handle File objects identically to manual appends — **test with a `transferencia` order including a screenshot file**
2. The `id` override by the repository means new order IDs follow the pattern `X7K2P9` instead of PB's default UUID — this is intentional and currently expected by the rest of the app

**Verification:**
1. Place an order with an inventory-tracked item (e.g., `trackInventory: true` and `stock: 5`)
2. Check PB `menu_items` collection — stock should be 4 after the order
3. Verify the order appears correctly in PB `orders` collection with all fields populated
4. Place a `transferencia` order with a screenshot file — verify the file is attached correctly on the PB record
5. Verify `transferScreenshot` URL resolves correctly in the kitchen view
6. Try to order more than stock allows (stock reaches 0) → verify the item is hidden on next menu load (filter at App.tsx:50)

---

### Bug 6: `pendiente_pago` orders are dead on arrival

**Severity:** HIGH — transfer-payment orders have no UI path to process them.

**Root cause:** When `paymentMethod === 'transferencia'`, `placeOrder()` in `App.tsx:225` sets `status: 'pendiente_pago'`. This is a valid `OrderStatus` in the type system, but three places don't handle it:

1. **Kitchen** (`src/features/kitchen/kitchenView.tsx` lines 160-165): No button for `pendiente_pago` status.
2. **Tracking** (`src/features/customer/views.tsx` TrackingView): `statusSteps` array omits `pendiente_pago`; `getStatusText()` returns `''` for it.
3. **Admin** (`src/features/admin/pages/OrdersPage.tsx` line 32): `statusFlow` array omits `pendiente_pago`.

**Fixes:**

#### Fix 6a: Kitchen button for pendiente_pago

**File:** `src/features/kitchen/kitchenView.tsx`, button block (line 160 area)

**Change:** Add a button for `pendiente_pago` status before all existing buttons:

```tsx
{order.status === 'pendiente_pago' && (
  <button
    onClick={() => handleStatusUpdate(order.id, 'recibido')}
    className="w-full bg-red-500 text-white py-4 rounded-xl font-black uppercase text-xs italic"
  >
    {uiText?.kitchenConfirmPaymentLabel || 'Confirmar Pago'}
  </button>
)}
```

Insert this as the first conditional in the button block (before the `recibido` check).

> **Note:** This relies on `handleStatusUpdate` from Bug 4. If Bug 4 hasn't been applied yet, use `async () => { try { await updateOrderStatus(order.id, 'recibido'); } catch(e) { alert('...'); } }` instead.

#### Fix 6b: Tracking view for pendiente_pago

**File:** `src/features/customer/views.tsx`

**Change 1 — Add to statusSteps (around line 820):**
```typescript
const statusSteps: OrderStatus[] = ['pendiente_pago', 'recibido', 'preparando', 'listo', 'en_camino', 'entregado'];
```

**Change 2 — Add case in getStatusText (around line 826):**
```typescript
case 'pendiente_pago':
  return 'Pago Pendiente de Confirmar';
```

**Change 3 — Add icon rendering (around line 845):**
```typescript
{(currentOrder.status === 'pendiente_pago') && (
  <CreditCard className="w-10 h-10" style={{ color: primaryColor }} />
)}
```

Import `CreditCard` from `lucide-react` at the top of the file if not already present. Check the existing import statement.

#### Fix 6c: Admin statusFlow

**File:** `src/features/admin/pages/OrdersPage.tsx`, line 32

**Change:** Prepend `pendiente_pago` to the statusFlow array:

```typescript
const statusFlow: OrderStatus[] = ['pendiente_pago', 'recibido', 'preparando', 'empaquetando', 'listo', 'en_camino', 'entregado'];
```

**Distributed impact of this change:**
- `handleAdvanceStatus` will now properly advance `pendiente_pago` → `recibido` (index 0 → index 1)
- The `filteredOrders` status filter already handles all statuses dynamically
- The `statusConfig` object already has a `pendiente_pago` entry (line 29)

**Risk:** Low. All three changes are additive — they don't touch existing button logic or status handling paths for other statuses.

**Verification:**
1. Place an order with `transferencia` payment method
2. Open kitchen view → verify a red "Confirmar Pago" button appears for that order
3. Click "Confirmar Pago" → order should advance to `recibido`
4. Check customer tracking view immediately after placing → verify "Pago Pendiente de Confirmar" text and credit card icon
5. After kitchen confirms payment → tracking should show "Pedido Recibido"
6. Check admin orders page → advance button works for `pendiente_pago` orders

---

## Phase 4 — Security Polish (Bug 9)

---

### Bug 9: Admin credentials in VITE_ env vars

**Severity:** MEDIUM — code path exists for bundling admin creds into public JS.

**Root cause:** In `src/features/admin/AdminModule.tsx:76-77`:
```typescript
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || prompt('Admin email:') || '';
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || prompt('Admin password:') || '';
```

Vite's `import.meta.env` with the `VITE_` prefix is **always bundled into the client JS**. If these env vars are ever set at build time (Vercel dashboard, `.env` file, CI), the credentials become visible to anyone who inspects the JS bundle with browser DevTools.

The security audit confirmed these vars are NOT currently set on Vercel. But the code path exists and could be activated accidentally by a future deploy.

**Fix:**

**File:** `src/features/admin/AdminModule.tsx`, lines 76-77

**Change:** Remove `import.meta.env.VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD` references. Always prompt the user:

```typescript
// Before:
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || prompt('Admin email:') || '';
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || prompt('Admin password:') || '';

// After:
const adminEmail = prompt('Admin email:') || '';
const adminPassword = prompt('Admin password:') || '';
```

**Risk:** Low. Removes a convenience feature (pre-filled credentials from env vars) but eliminates the exposure vector. Admin users will need to type credentials every time; for a restaurant-admin tool used from a trusted device, the extra friction is acceptable.

**Verification:**
1. Search codebase for `VITE_ADMIN_EMAIL` or `VITE_ADMIN_PASSWORD` — verify zero results in `src/`
2. Open admin panel on the live site → PIN prompt still works
3. After PIN entry, the browser prompts for email/password → enter valid credentials → verify admin panel loads
4. Check browser DevTools → Sources → search JS bundle for admin credentials → should not find them

---

## Success Criteria Checklist

### Phase 1 — Get the App Working
- [ ] Kitchen view shows all active orders (no 403 error)
- [ ] Kitchen status buttons change order status successfully (no 403 error)
- [ ] Telegram notification for new order shows customer name, items, and total correctly
- [ ] Telegram notification works with both `{ orderId }` and full order payload formats
- [ ] No "undefined" in Telegram message fields

### Phase 2 — Fix Silent Failures
- [ ] Kitchen button click during network failure shows error alert to user
- [ ] Kitchen button click during normal operation still works correctly
- [ ] Kitchen `subscribeToOrders()` has `.catch()` — no unhandled promise rejection in console
- [ ] Tracking `subscribeToOrders()` has `.catch()` — no unhandled promise rejection in console
- [ ] Settings fetch failure is logged to console and app renders with defaults (no crash)

### Phase 3 — Fix Stock & Payment Flow
- [ ] Inventory-tracked items have stock deducted on order creation
- [ ] Non-inventory items are unaffected (stock remains unchanged)
- [ ] File upload for transfer screenshots works via `ordersApi.create()`
- [ ] `pendiente_pago` orders show "Confirmar Pago" button in kitchen view
- [ ] Kitchen can advance `pendiente_pago` → `recibido` successfully
- [ ] Customer tracking view shows "Pago Pendiente de Confirmar" for transfer orders
- [ ] Customer tracking view shows credit card icon for `pendiente_pago` status
- [ ] Admin orders page can advance `pendiente_pago` orders to next status
- [ ] `pendiente_pago` is included in admin status flow

### Phase 4 — Security Polish
- [ ] `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD` removed from `AdminModule.tsx`
- [ ] No other `VITE_ADMIN_*` references remain in `src/`
- [ ] Admin auth flow works via prompt-entered credentials only
- [ ] JS bundle does not contain admin credentials

---

## File Change Summary

| File | Bug(s) | Action |
|------|--------|--------|
| `pocketbase/pb_migrations/1776830004_fix_orders_collection_rules.js` | 1, 2 | **Create** |
| `api/notify.ts` (handler body, ~lines 66-72) | 5 | **Modify** |
| `src/features/kitchen/kitchenView.tsx` (lines 160-165, add wrapper) | 4, 6a | **Modify** |
| `App.tsx` (lines 323-339, 347-362 — add `.catch()`) | 8 | **Modify** |
| `App.tsx` (lines 233-268, 327 — formData → ordersApi.create) | 3 | **Modify** |
| `App.tsx` (lines 61-67 — added settingsError state, optional) | 7 | **Modify** |
| `src/features/customer/views.tsx` (TrackingView — add pendiente_pago) | 6b | **Modify** |
| `src/features/admin/pages/OrdersPage.tsx` (line 32 — statusFlow) | 6c | **Modify** |
| `src/features/admin/AdminModule.tsx` (lines 76-77 — remove VITE_) | 9 | **Modify** |

---

## Risk Summary

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Public orders read/update** (Bug 1, 2) | Anyone can list/modify orders | Acceptable short-term; kitchen auth planned for future |
| **PB unreachable from Vercel** (Bug 5) | Notify falls back with 200+warning | Already handled by 200-with-warning pattern in handler |
| **File upload broken** (Bug 3) | Transfer screenshots lost | Manual E2E test with real file upload before merge |
| **Defaults shown instead of settings** (Bug 7) | Wrong branding/colors | App still functional; owner will notice and investigate |
| **Kitchen silent failure fixed with alert()** (Bug 4) | UX not polished | Acceptable for kitchen tool; toast is future enhancement |
