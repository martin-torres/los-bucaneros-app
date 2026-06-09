# Los Bucaneros — App Template

A multi-language restaurant ordering app (React + Vite + Tailwind + PocketBase) that serves as a reusable template. Clone this repo, swap the data, and deploy a new restaurant app.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Frontend: React 19 + Vite 6 + Tailwind 3 (Vercel)  │
│  ┌────────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │ Customer    │ │ Kitchen  │ │ Admin Dashboard    │ │
│  │ (ordering)  │ │ (orders) │ │ (menu/orders/etc)  │ │
│  └──────┬──────┘ └────┬─────┘ └─────────┬──────────┘ │
│         │             │                 │            │
│  ┌──────┴─────────────┴─────────────────┴──────────┐ │
│  │  Data Layer: lib/pocketbase.ts → src/data/      │ │
│  │  (repository pattern with PocketBase SDK)       │ │
│  └──────────────────────┬─────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────┐
│  Backend: PocketBase on Fly.io                      │
│  ┌────────────┐ ┌──────────┐ ┌───────────────────┐ │
│  │ menu_items │ │  orders  │ │ restaurant_settings│ │
│  └────────────┘ └──────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React 19, Vite 6, Tailwind 3, TypeScript 5.8 | Vercel |
| Backend | PocketBase (Go binary) | Fly.io (Docker) |
| PWA | vite-plugin-pwa, custom sw.js | Vercel |
| Payments | Conekta, Mercado Pago, CoDi, Transfer | Client-side |
| Translations | Local JSON (6 languages) | Bundled with app |
| Notifications | Telegram bot | Client-side |

### Directory Structure (Key Files)

```
.
├── App.tsx                        # Root component, state management
├── index.html                     # HTML entry, meta tags, fonts
├── lib/
│   └── pocketbase.ts              # API facade (menu, orders, settings)
├── src/
│   ├── core/
│   │   ├── types.ts               # All TypeScript types
│   │   ├── orders.ts              # Order status transitions
│   │   ├── pricing.ts             # Delivery fee calculation
│   │   └── uiSettings.ts          # Resolve restaurant config
│   ├── data/
│   │   ├── contracts/             # Repository interfaces
│   │   └── pocketbase/            # Repository implementations + mappers
│   ├── features/
│   │   ├── customer/views.tsx     # Landing, Menu, Checkout, Tracking
│   │   ├── kitchen/kitchenView.tsx # Order rail for kitchen
│   │   ├── analytics/dataView.tsx # Sales analytics
│   │   ├── locks/pins.tsx         # PIN entry (DataLock, KitchenLock)
│   │   ├── admin/                 # Full admin dashboard (menu/orders/inventory/settings)
│   │   ├── payments/              # Payment processors
│   │   └── shared/                # Branding, status views
│   ├── translations/              # JSON files per language
│   ├── hooks/                     # useTranslations, useTheme, useUrlMode, etc.
│   ├── contexts/LanguageContext.tsx
│   └── utils/languageResolver.ts  # Language detection
├── pocketbase/
│   ├── pb_migrations/             # All PocketBase migrations
│   └── pb_hooks/                  # Server-side hooks
├── scripts/                       # Seed scripts for data
├── public/                        # Static assets (logo, images, PWA icons)
├── fly.toml                       # Fly.io config (PocketBase)
└── vite.config.ts                 # Vite config (PWA manifest, aliases)
```

---

## The Bones: Code That NEVER Changes Per Clone

These files contain the app logic — you write them once and reuse across clones:

| File | Purpose |
|------|---------|
| `src/core/types.ts` | All TypeScript interfaces (Order, MenuItem, AppSkinSettings, etc.) |
| `src/core/orders.ts` | Order status transition table |
| `src/core/pricing.ts` | Haversine distance + delivery fee calculation |
| `src/core/uiSettings.ts` | Resolves `AppSkinSettings` → `ResolvedUiSettings` with defaults |
| `src/core/index.ts` | Re-exports |
| `src/data/contracts/menu-repo.ts` | Menu repository interface |
| `src/data/contracts/orders-repo.ts` | Orders repository interface |
| `src/data/contracts/settings-repo.ts` | Settings repository interface |
| `src/data/contracts/index.ts` | Re-exports |
| `src/data/pocketbase/client.ts` | PocketBase client singleton |
| `src/data/pocketbase/mappers.ts` | Raw record → typed object mappers |
| `src/data/pocketbase/menu-repo.ts` | Menu repository implementation |
| `src/data/pocketbase/orders-repo.ts` | Orders repository implementation |
| `src/data/pocketbase/settings-repo.ts` | Settings repository implementation |
| `src/data/pocketbase/index.ts` | Re-exports |
| `src/data/pocketbase/translation-resolver.ts` | (Legacy — not currently used) |
| `src/features/customer/views.tsx` | All customer-facing views (Landing, Menu, Checkout, Tracking) |
| `src/features/customer/components/TabBar.tsx` | Category tab bar |
| `src/features/customer/components/OptionSelector.tsx` | Item option selector modal |
| `src/features/customer/components/WeightOrderModal.tsx` | Weight-based item modal |
| `src/features/customer/components/LanguageSelector.tsx` | Language switcher dropdown |
| `src/features/kitchen/kitchenView.tsx` | Kitchen order rail |
| `src/features/analytics/dataView.tsx` | Analytics dashboard |
| `src/features/locks/pins.tsx` | PIN entry screens (DataLock, KitchenLock) |
| `src/features/shared/branding.tsx` | RestaurantLogo component |
| `src/features/shared/statusViews.tsx` | LoadingView, ErrorView |
| `src/features/payments/` | All payment processors |
| `src/features/promotions/` | Promo engine |
| `src/features/admin/` | Admin dashboard (menu/orders/settings/inventory CRUD) |
| `src/features/appViews.tsx` | Barrel export |
| `src/hooks/useTranslations.ts` | Translation hook |
| `src/hooks/useTheme.ts` | Theme CSS variable setter |
| `src/hooks/useUrlMode.ts` | URL-based mode switch |
| `src/hooks/useUnlockState.ts` | Animation unlock state |
| `src/hooks/useVisitorTracking.ts` | Visitor tracking |
| `src/contexts/LanguageContext.tsx` | Language provider |
| `src/utils/languageResolver.ts` | Language detection |
| `lib/pocketbase.ts` | API facade |
| `lib/telegram.ts` | Telegram notification helper |
| `lib/visitorService.ts` | Visitor tracking service |
| `src/translations/index.ts` | Translation loader |
| `src/translations/*.json` | Translation JSON files (6 languages) |
| `App.tsx` | Root component |
| `index.tsx` | React entry point |
| `types.ts` | Legacy types export |
| `vite-env.d.ts` | Vite environment types |
| `vite.config.ts` | Build config |
| `tailwind.config.js` | Tailwind config |
| `postcss.config.js` | PostCSS config |
| `eslint.config.js` | Linter config |
| `tsconfig*.json` | TypeScript config |
| `index.css` | Global styles |
| `package.json` | Dependencies & scripts |
| `Dockerfile` | PocketBase Docker image |
| `fly.toml` | Fly.io deployment config |
| `.gitignore` | Git ignore rules |
| `AGENTS.md` | Agent instructions |
| `pocketbase/pb_hooks/` | Server-side hooks |
| `pocketbase/pb_migrations/` | ALL migration files |
| `scripts/` | ALL seed scripts |

---

## The Data: What Changes Per Clone

These are the files and data you modify/regenerate for each new restaurant.

### 1. Branding & Identity

| File | What to Change |
|------|---------------|
| `public/` | Replace logo, hero image, favicon, PWA icons, menu images |
| `index.html` | Update `<title>`, `<meta name="description">`, `<meta name="apple-mobile-web-app-title">`, font link |

### 2. PWA / Config

| File | What to Change |
|------|---------------|
| `vite.config.ts` | Update PWA manifest fields: `name`, `short_name`, `description`, `theme_color`, `background_color`, icons |
| `public/manifest.json` | Update name, short_name, description, theme_color, icons |

### 3. Restaurant Settings (PocketBase `restaurant_settings` collection)

Seed via `scripts/seed-bucaneros-settings.js` (copy and adapt):

```js
{
  name: 'Los Bucaneros',
  shortName: 'Los Bucaneros',
  currency: 'MXN',
  tagline: 'Ahumamos por mas de 12 horas...',
  description: 'BBQ ahumado artesanal...',
  locationText: 'Monterrey, NL.',
  logoUrl: '/los-bucaneros.png',
  heroImageUrl: '/buncaneros_hero.jpg',
  heroTitle: 'Los Bucaneros',
  heroSubtitle: 'BBQ Ahumado Artesanal',
  pickupLocationText: 'Recoger en Sucursal',
  adminPin: '1234',                    // Analytics PIN
  kitchenPin: '5678',                  // Kitchen access PIN
  primaryColor: '#8B1A1A',            // Main brand color
  secondaryColor: '#D4A574',          // Accent color
  accentColor: '#1A1A2E',             // Dark text color
  backgroundColor: '#FFF8F0',         // Page background
  googleFontUrl: 'https://fonts.googleapis.com/css2?family=...',
  googleFontName: 'Inter',
  categories: JSON.stringify([        // Menu categories for THIS restaurant
    { code: 'paquete', displayName: 'Paquetes' },
    { code: 'complemento', displayName: 'Complementos' },
  ]),
  uiText: JSON.stringify({            // Override default UI labels
    loadingTitle: 'Cargando Los Bucaneros',
    cartButton: 'Ver Carrito',
    // ... see AppSkinSettings.UiTextSettings for full list
  }),
  deliveryRules: JSON.stringify({
    thresholds: [{ km: 3, fee: 40 }, { km: 6, fee: 50 }],
    storeLat: 25.74876,
    storeLng: -100.41914,
  }),
  paymentSettings: JSON.stringify({
    conektaPublicKey: '',
    mercadopagoPublicKey: '',
    codiEnabled: false,
    transferBankName: 'Banorte',
    transferAccountNumber: '1234',
  }),
  telegramBotToken: '',
  telegramChatId: '',
  telegramNotificationsEnabled: false,
  visitorTrackingEnabled: false,
}
```

### 4. Menu Items (PocketBase `menu_items` collection)

Seed via `scripts/seed-bucaneros-menu.js` (copy and adapt):

```js
{
  name: 'Medio Kilo de Pulled Pork',
  description: '1/2 kg de pulled pork ahumado...',
  price: 499,
  category: 'paquete',           // Must match a code in categories array above
  image: '/menu-images/item.png',
  active: true,
  trackInventory: true,
  stock: -1,                     // -1 = unlimited
  // Optional fields:
  isWeightBased: false,
  weightPricePerKg: undefined,
  options: JSON.stringify([{ id: 'opt1', label: 'Con queso', price: 20 }]),
  promoActive: false,
  promoPrice: undefined,
  promoBundle: undefined,        // JSON array: [{ id, name, quantity, price }]
}
```

### 5. Translations JSON (`src/translations/*.json`)

Each language file has these sections (keep the structure, update the values):

```json
{
  "ui": { /* Buttons, labels, titles */ },
  "categories": { /* Menu category names per language */ },
  "descriptions": { /* Item descriptions keyed by item ID */ },
  "weightModal": { /* Weight selector modal text */ },
  "optionSelector": { /* Option modal text */ },
  "misc": { /* Miscellaneous strings */ },
  "errors": { /* Error messages */ }
}
```

To add a new language:
1. Create `src/translations/xx.json`
2. Add to `SupportedLanguage` in `src/utils/languageResolver.ts`
3. Add import + mapping in `src/translations/index.ts`
4. Add flag to `LANGUAGE_DISPLAY` in `LanguageSelector.tsx`

### 6. PocketBase Migrations (`pocketbase/pb_migrations/`)

Keep ALL existing migrations. They define the schema. New restaurants get a fresh PocketBase with the same schema applied in order.

**Collection schema created by migrations:**

| Collection | Key Fields |
|-----------|-----------|
| `menu_items` | `name`, `description`, `price`, `category`, `image`, `active`, `isWeightBased`, `weightPricePerKg`, `options` (json), `strain`, `soldOut`, `stock`, `trackInventory`, `promoActive` (bool), `promoPrice` (number), `promoBundle` (json) |
| `orders` | `customerName`, `customerAddress`, `items` (json), `total`, `status`, `paymentMethod`, `payWithAmount`, `transferScreenshot`, `deliveryDistanceKm`, `deliveryFee`, `customerPhone`, `timestamp`, `statusTimestamps` (json), `sessionId` |
| `restaurant_settings` | `name`, `currency`, `shortName`, `tagline`, `description`, `locationText`, `logoUrl`, `heroImageUrl`, `heroTitle`, `heroSubtitle`, `pickupLocationText`, `adminPin`, `kitchenPin`, `primaryColor`, `secondaryColor`, `accentColor`, `backgroundColor`, `googleFontUrl`, `googleFontName`, `categories` (json), `uiText` (json), `deliveryRules` (json), `paymentSettings` (json), `telegramBotToken`, `telegramChatId`, `telegramNotificationsEnabled`, `visitorTrackingEnabled` |

> **Important:** `adminPin` and `kitchenPin` are stored in plaintext. The DataLock and KitchenLock check against these values at login.

### 7. Promotion Items

Promos are NOT a separate collection. They live on `menu_items` using these fields:

- `promoActive: true` — marks item as a promo
- `promoPrice: 399` — discounted price (show with strikethrough of `price`)
- `promoBundle` — JSON array for combo promos:
  ```json
  [{ "id": "item1", "name": "Brisket", "quantity": 1, "price": 599 }]
  ```

Promos appear on the LandingView. Translation: The description text comes from translation JSON keyed by item ID.

---

## Order Lifecycle — Configurable Per App

### Current Statuses

```
pendiente_pago → recibido → preparando → empaquetando → listo → en_camino → entregado
```

### Current Transition Table (`src/core/orders.ts`)

```typescript
recibido: ['preparando', 'entregado']
preparando: ['empaquetando', 'entregado']
empaquetando: ['listo', 'entregado']
listo: ['en_camino', 'entregado']
en_camino: ['entregado']
```

### How Service Type Affects the Flow

| Service Type | Statuses Used | Delivery Address? | Notes |
|-------------|--------------|-------------------|-------|
| Delivery | Full chain (recibido → entregado) | Yes | Includes `en_camino` + delivery fee |
| Pickup | recibido → preparando → empaquetando → listo → entregado | No (uses pickupLocationText) | Skips `en_camino` |
| Dine-in | recibido → preparando → entregado | No (table number in name) | Simplified flow |
| Takeout | Same as pickup | No | |

### Option A: Hardcode Per Clone (Recommended for Now)

Edit ~5 files when creating a new clone. This is the current approach — no refactoring needed.

**Files to edit:**

1. **`src/core/orders.ts`** — Change the transition table to match your service type
2. **`src/features/kitchen/kitchenView.tsx`** — Update action buttons to match statuses
3. **`src/features/customer/views.tsx`** — TrackingView: change status icons/steps; CheckoutView: show/hide delivery fields
4. **`src/core/types.ts`** — Add/remove statuses from `OrderStatus` union if needed
5. **`App.tsx`** — Adjust checkout logic, cart button visibility, delivery fee calculation

**Example: For a pickup-only app:**
- Remove `en_camino` from `src/core/orders.ts`
- Remove `en_camino` from `OrderStatus` type
- KitchenView: hide "Enviar Moto" button
- TrackingView: show only 4 steps instead of 6
- CheckoutView: remove delivery address field, always use pickupLocationText

### Option B: Configurable via Settings (Future Enhancement)

Not implemented yet. Would require refactoring the transition table, kitchen buttons, and tracking steps to read from `restaurant_settings`. When done, future clones would need zero code changes — just configure in the settings seed.

---

## Path A: Update an Existing App (Comida de Güeli, Arrocito, etc.)

Use this path when you already have an app built from an earlier version of this template and want to bring in new features (multi-language, promos, etc.).

### Step 1: Sync Files That Changed

```
# Files that likely changed (merge carefully):
App.tsx
src/core/types.ts           # Added promo fields, DeliveryType, etc.
src/core/uiSettings.ts      # New default categories, new fields
src/data/pocketbase/mappers.ts  # promoActive, promoPrice, promoBundle mapping
src/data/pocketbase/menu-repo.ts  # getActivePromos filter change
src/data/pocketbase/orders-repo.ts  # May have updates
lib/pocketbase.ts           # promosApi removed
src/features/customer/views.tsx  # LandingView promo rendering
src/features/kitchen/kitchenView.tsx  # May have updates
src/features/analytics/dataView.tsx  # May have updates
src/features/pins.tsx # (now in src/features/locks/pins.tsx)
src/features/appViews.tsx   # New exports
# Entire translations folder (new)
src/translations/*
src/utils/languageResolver.ts  # (new)
src/hooks/useTranslations.ts  # (new)
src/contexts/LanguageContext.tsx  # (new)
src/features/customer/components/LanguageSelector.tsx  # (new)
vite.config.ts              # PWA updates
package.json                # New dependencies
```

### Step 2: Apply New Migrations

Add the new migration files to your existing PocketBase. The key ones:

- `1776830000_updated_menu_items_add_promo.js` — adds `promoActive`, `promoPrice`, `promoBundle` fields

Run via Fly.io (migrations auto-apply from `--migrationsDir=/pb_data/pb_migrations`).

### Step 3: Re-seed or Manually Update Settings

Your existing `restaurant_settings` doc may be missing new fields (`deliveryRules.thresholds`, `paymentSettings`, etc.). Either:
- Add them manually via `/_/` admin UI
- Or run `scripts/seed-bucaneros-settings.js` with your existing values + new fields

### Step 4: Map Old Promo Data

If your existing app used a separate `promos` collection, either:
- Migrate promo items to `menu_items.promoActive = true` 
- Or keep the old approach (but then don't pull in the new menu-repo.ts changes)

---

## Path B: Fresh Start (New Restaurant)

### Step 1: Copy the Repo

```bash
git clone <this-repo> my-new-restaurant-app
cd my-new-restaurant-app
rm -rf .git
git init
npm install
```

### Step 2: Update Branding Files

```bash
# Replace in public/
public/logo.png           # Your logo
public/hero.jpg           # Your hero image
public/favicon.png        # Your favicon
public/pwa-192x192.png    # PWA icon
public/pwa-512x512.png    # PWA icon
public/manifest.json      # Update name, description, icons
public/menu-images/       # Your menu item images
```

### Step 3: Edit index.html

Update title, meta description, theme color, Google Fonts link.

### Step 4: Update vite.config.ts

Change PWA manifest: `name`, `short_name`, `description`, `theme_color`, `background_color`.

### Step 5: Seed PocketBase

```bash
# Clone the seed scripts and customize
cp scripts/seed-bucaneros-settings.js scripts/seed-myapp-settings.js
cp scripts/seed-bucaneros-menu.js scripts/seed-myapp-menu.js

# Edit both files with your restaurant data
# Then run:
npm run seed:settings  # (Point to your PocketBase URL via env vars)
npm run seed:menu      # (Point to your PocketBase URL via env vars)
```

### Step 6: Write Translations

Edit each `src/translations/*.json` file:

- `categories`: Map category codes to display names in each language
- `descriptions`: Map item IDs to descriptions in each language
- `ui`: Update default UI text

If your app only needs one language, you can skip the untranslated JSON files — `getTranslations()` falls back to `es.json`.

### Step 7: Configure Deployment

**Vercel:**
- Connect repo
- Set `VITE_POCKETBASE_URL` to your PocketBase URL
- Deploy

**Fly.io:**
```bash
# Edit fly.toml: change app name, region, etc.
fly launch --name my-app-pb
fly deploy
# Upload migration files:
fly sftp shell
# Upload pocketbase/pb_migrations/* to /pb_data/pb_migrations/
```

### Step 8: Configure Order Lifecycle

Edit `src/core/orders.ts` and related files (see Option A above) to match your service type.

### Step 9: Build & Test

```bash
npm run build
# Fix any TypeScript errors
# Verify on Vercel preview deployment
```

---

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `VITE_POCKETBASE_URL` | Yes | PocketBase server URL | `http://localhost:8090` |
| `GEMINI_API_KEY` | No | AI features (if used) | — |

Set `VITE_POCKETBASE_URL` in Vercel project settings (not `.env` — that's gitignored).

---

## Seed Scripts

All seed scripts in `scripts/` connect to PocketBase via env vars:

```bash
PB_URL=http://127.0.0.1:8090 \
PB_ADMIN_EMAIL=admin@myapp.com \
PB_ADMIN_PASSWORD=mypassword \
node scripts/seed-myapp-settings.js
```

Required scripts to create:

1. **`seed-<app>-settings.js`** — Creates the `restaurant_settings` record
2. **`seed-<app>-menu.js`** — Creates all `menu_items` records

---

## PocketBase Deployment

### Local Development

```bash
# Download PocketBase binary
# Run:
./pocketbase serve --migrationsDir=./pocketbase/pb_migrations
```

### Production (Fly.io)

`fly.toml` spins up a PocketBase Docker container with:

- Persistent volume at `/pb_data`
- Auto-applied migrations from `/pb_data/pb_migrations/`
- Public API at port 8090

To upload migrations to Fly.io:

```bash
fly sftp shell
# Then upload files to /pb_data/pb_migrations/
```

> **Note:** If the volume is already seeded, new migrations must be uploaded manually via SFTP. The `--migrationsDir` flag points to the persistent volume path.

---

## Known Issues

1. **Admin Dashboard (`viewMode='dashboard'`)** — The admin module's data loading relies on a separate PocketBase client (`adminApi.ts`'s `ordersApi.getAll()`, `menuApi.getAll()`, etc.). Data population is intermittent/unreliable. To be fixed in a future session.
2. **Delivery Address Coordinates** — `placeOrder()` in `App.tsx` uses a hardcoded fallback for customer location (`CUSTOMER_LOCATION = STORE_LOCATION`), which means delivery distance is always 0 until real geocoding is wired in.
3. **`adminPin` / `kitchenPin` in Plaintext** — Stored as-is in PocketBase. No hashing. The PIN lock is a convenience gate, not a security measure.
4. **Items/statusTimestamps field types** — Must be JSON type in PocketBase (not text), otherwise mappers return empty data. Verified working in current deployment.

---

## Quick Reference: Files to Edit Per App Type

| Change | Pickup-Only | Delivery + Pickup | Dine-In |
|--------|-------------|-------------------|---------|
| `src/core/orders.ts` | Remove `en_camino` | Keep all statuses | Remove `empaquetando`, `listo`, `en_camino` |
| `src/core/types.ts` | Narrow `OrderStatus` | Keep all | Narrow `OrderStatus` |
| `kitchenView.tsx` buttons | Remove "Enviar Moto" | Keep all | Remove "Empaquetando", "Listo", "Enviar Moto" |
| `views.tsx` CheckoutView | Show pickup only | Show both options | Remove address, show table # input |
| `views.tsx` TrackingView | 4 steps | 6 steps | 2-3 steps |
| `App.tsx` delivery logic | Remove delivery fee calc | Keep | Remove delivery fee calc |
