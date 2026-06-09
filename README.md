# Los Bucaneros App

React + Vite PWA with PocketBase-backed data and database-driven theming for Los Bucaneros restaurant.

## Current Runtime

- Frontend: `React 19` + `Vite`
- Backend/data: `PocketBase` local instance
- Active PocketBase data dir: `pocketbase/pb_data`
- Active migrations:
  - `pocketbase/pb_migrations/1771380497_collections_snapshot.js`
  - `pocketbase/pb_migrations/1771381121_stage4_schema_alignment.js`
  - `pocketbase/pb_migrations/1771381479_stage4_ui_text.js`

## Run Locally

1. Install deps:
   - `npm install`
2. Start PocketBase (separate terminal):
   - `./pocketbase/pocketbase serve --dir pocketbase/pb_data --migrationsDir pocketbase/pb_migrations`
3. Run frontend:
   - `npm run dev`

## Seed Local Restaurant Settings

Use this after creating a superuser in local PocketBase:

- `PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... npm run seed:settings`

Optional:

- `PB_URL=http://127.0.0.1:8090`

## Seed Local Menu Items

Use this after seeding restaurant settings:

- `PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... npm run seed:menu`

Optional:

- `PB_URL=http://127.0.0.1:8090`

## Current Documentation Snapshot

See:

- `PROJECT_SNAPSHOT.md`
