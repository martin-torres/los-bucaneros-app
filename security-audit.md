# Security Audit — Los Bucaneros

## [CRITICAL] Orders collection API rules set to empty string (public access)
**Location:** pocketbase/pb_migrations/1776459013_updated_orders.js:7-11

Any visitor to the site can LIST, VIEW, CREATE, UPDATE, and DELETE any order in the database. This includes viewing other customers' full PII (name, phone, address, delivery location), modifying order statuses, and deleting orders.

**Fix:** Set specific API rules. At minimum: listRule and viewRule should restrict to the order owner (e.g. `@request.auth.id != ''` for authenticated users, or create a per-order token). updateRule/deleteRule should be admin-only (null for superuser only).

---

## [CRITICAL] Orders collection deleteRule publicly open
**Location:** pocketbase/pb_migrations/1776459013_updated_orders.js:7

Any visitor can delete any order record, destroying order history and live kitchen data.

**Fix:** Set deleteRule to null (superuser only).

---

## [CRITICAL] Restaurant settings collection fully public (listRule, createRule, updateRule, deleteRule all empty)
**Location:** pocketbase/pb_migrations/1776459013_updated_restaurant_settings.js:7-11

The restaurant_settings collection contains telegramBotToken, adminPin, kitchenPin, paymentSettings (bank account numbers). Any visitor can read all of these and modify them.

**Fix:** Set listRule and viewRule to null (superuser only). The only public operation should be specifically scoped read access for non-sensitive fields, or serve settings via a server-side endpoint that strips secrets.

---

## [CRITICAL] Menu items collection createRule, updateRule, deleteRule all publicly open
**Location:** pocketbase/pb_migrations/1776459013_updated_menu_items.js:7-11

Any visitor can create, modify, or delete menu items and their prices. An attacker could change prices to $0, inject malicious item names, or delete the entire menu.

**Fix:** Set createRule, updateRule, deleteRule to null (superuser only). listRule = "" is correct for public menu viewing but write operations must be protected.

---

## [CRITICAL] Hardcoded admin password 'LosBucanerosAdmin2026!' for admin@losbuncaneros.com in multiple production scripts (pointing at los-bucaneros-pb.fly.dev)
**Location:** scripts/seed-bucaneros-menu.js:5; seed-bucaneros-settings.js:5; upload-images-and-fix.js:7; upload-images.sh:6

Full database superuser compromise. Any actor with access to these files (in the git repo) can authenticate as a superuser and take full control of the production PocketBase instance.

**Fix:** Remove hardcoded credentials. Use environment variables (already in setup-collections.js). Rotate the compromised password immediately on the live server.

---

## [CRITICAL] Hardcoded admin credentials 'trulum@proton.me / z9BtVngz7MpN@Vpu*v6k' in multiple scripts
**Location:** scripts/migrate-weight-fields.js:13; scripts/seed-all-weight-items.js:13; scripts/verify-schema.js:9-10; scripts/seed-especialidades-category.js:12; scripts/seed-weight-items.js:12; scripts/verify-weight-items.js:12

Full database superuser compromise if these credentials are still active on any server.

**Fix:** Remove hardcoded credentials. Use environment variables. Rotate these passwords if still active.

---

## [CRITICAL] Hardcoded admin password 'Bucaneros2025!' for dr.mtorres@icloud.com
**Location:** scripts/delete-promos-collection.sh:4

Exposes admin credentials for the old/development PocketBase instance.

**Fix:** Remove hardcoded credentials immediately.

---

## [CRITICAL] Previous admin password 'ueFMYCEpwf1fBE22Rd1B' and PINs (Kitchen=6744, Admin/Data=2222) documented in plaintext in deployment file
**Location:** DEPLOYMENT.md:75

Passwords and PINs exposed in the repo history. If these are still active, they provide direct access.

**Fix:** Rotate all documented passwords and PINs. Remove from documentation or use placeholders.

---

## [CRITICAL] Telegram bot token fetched from publicly-readable restaurant_settings collection and used directly in browser-side fetch call
**Location:** App.tsx:278-282; src/core/types.ts:221; lib/telegram.ts:103

The Telegram bot token is accessible to EVERY website visitor via the settings API (which has listRule=""). Once obtained, an attacker can: send messages as the bot, read group messages if the bot is in groups, potentially perform account takeover if the bot is tied to Telegram Premium.

**Fix:** Move Telegram notification calls to a server-side endpoint (PocketBase hook or serverless function). Never expose the bot token to the client at all. Set restaurant_settings listRule to null and serve public settings through a filtered endpoint.

---

## [HIGH] Promos collection has all rules publicly open
**Location:** pocketbase/pb_migrations/1776459013_created_promos.js:4,5,24,28,29

Anyone can create, read, update, delete promotions. Attackers could add fake promotions or delete active ones.

**Fix:** Set createRule, updateRule, deleteRule to null (superuser only). listRule = "" is acceptable for public display.

---

## [HIGH] Admin credentials loaded via VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD environment variables — VITE_ vars are bundled into client-side JavaScript
**Location:** src/features/admin/AdminModule.tsx:76-77

Any visitor can view the production JS bundle and extract superuser credentials if these env vars are set. Vite bundles all VITE_ env vars into the client.

**Fix:** Never pass admin credentials into VITE_ variables. Remove VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD from Vercel env vars. Admin auth should only use runtime prompts or server-side authentication.

---

## [HIGH] uploadFile function creates orders via FormData to the publicly-accessible orders collection
**Location:** lib/pocketbase.ts:46-51

The uploadFile function is a backdoor to create arbitrary orders. Combined with open createRule, anyone can craft a minimal VITE_ env script to create orders with any data.

**Fix:** This function should either be removed (if unused) or secured. If it's supposed to upload screenshots to orders, it must be behind authentication. The orders create API should validate minimum required fields server-side.

---

## [MEDIUM] Order IDs generated with Math.random().toString(36).slice(2,8).toUpperCase() — weak and predictable
**Location:** src/data/pocketbase/orders-repo.ts:10

Order IDs are 6-char alphanumeric with ~2 billion combinations, generated with non-cryptographic PRNG. An attacker can enumerate order IDs to access other customers' order data.

**Fix:** Use crypto.randomUUID() or let PocketBase auto-generate the default 15-char alphanumeric ID.

---

## [MEDIUM] Card number, expiry, and CVV stored in React component state (cardNumber, expiry, cvv)
**Location:** App.tsx:126

While these fields don't appear to be sent to the server, storing card security code (CVV) in application state violates PCI DSS requirements. If a developer later adds transmission, the data is already being collected.

**Fix:** Remove CVV/expiry/card fields if not used for real payment processing. If needed, use a proper payment SDK (Conekta/MercadoPago) that tokenizes without exposing raw card data.

---

## [MEDIUM] PocketBase filter with string interpolation — filter: `sessionId="${visitorData.sessionId}"`
**Location:** lib/visitorService.ts:7

If sessionId contains a double quote, the filter breaks or could be manipulated. However, sessionId is generated client-side, so this is self-injection only. Low risk in current form.

**Fix:** Use pb.filter() with positional arguments or sanitize sessionId input.

---

## [MEDIUM] PB_ENCRYPTION_KEY set to empty string
**Location:** fly.toml:8

PocketBase's app encryption is effectively disabled. Encryption protects sensitive settings fields and tokens at rest.

**Fix:** Generate a strong random encryption key and set it in fly.toml secrets, not in version control.

---

## [LOW] Production server admin credentials hardcoded (admin@losbuncaneros.com / LosBucanerosAdmin2026!) with fly.dev production URL
**Location:** scripts/upload-images-and-fix.js:6-7; scripts/upload-images.sh:5-6

These credentials point at the production PocketBase server. Anyone who has read access to this repo can authenticate as superuser.

**Fix:** Immediately rotate the production admin password. Remove hardcoded credentials from all files. Use environment variables or secret injection for CI/CD.

---

## [LOW] 8 vulnerabilities (1 low, 3 moderate, 4 high) in dependencies. High severity: @babel/plugin-transform-modules-systemjs (RCE), fast-uri (path traversal), serialize-javascript (RCE), vite (fs bypass on Windows)
**Location:** npm audit

Build-time dependencies with vulnerabilities. Most are not exploitable at runtime since they're dev dependencies. Vite vulnerability only affects dev server, not production.

**Fix:** Run `npm audit fix` to patch most vulnerabilities. The vite issue is only relevant for dev server; production uses pre-built static files.

---

## [LOW] Telegram sendMessage API used with parse_mode=Markdown but user-controlled data (customerName, customerAddress) included in message
**Location:** lib/telegram.ts:111

An attacker could inject Markdown formatting characters (_, *, `) into their name to break the notification message. However, this only affects the notification text and doesn't lead to code execution.

**Fix:** Use parse_mode='HTML' with proper escaping, or strip/escape Markdown special characters from user input before sending.

---

## [INFO] No rate limiting or CAPTCHA on order creation
**Location:** Entire app

An attacker could programmatically create thousands of orders, filling the kitchen view with spam and potentially filling the database.

**Fix:** Implement rate limiting on order creation. Add a simple CAPTCHA on the checkout form.

---

## [INFO] Stock deduction happens client-side on order creation
**Location:** src/data/pocketbase/orders-repo.ts:31-39

Since the orders create endpoint is wide open, an attacker can call it directly bypassing the stock validation/deduction logic. The stock deduction only runs through the client code path.

**Fix:** Move inventory deduction to server-side (PocketBase hook) so it runs on every order creation regardless of API access method.

---

