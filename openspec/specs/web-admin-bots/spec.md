# web-admin-bots

## Purpose

Admin-side bot management, stock visibility, and token rotation for the web backend.
## Requirements
### Requirement: Admin CRUD for bots

Admins SHALL manage bots via `GET /admin/bots`, `POST /admin/bots`, `PATCH /admin/bots/:id`, `DELETE /admin/bots/:id` with fields: name, server, type (SELL or EXCHANGE), map/pos hint, item mapping, rateOverride, dailyLimitTt, enabled, botToken.

#### Scenario: Create bot
- **WHEN** an admin POSTs valid bot data to `/admin/bots`
- **THEN** the API creates a bot, generates a botToken, and returns 201 with the token shown once

#### Scenario: Non-admin cannot create bot
- **WHEN** a non-admin calls `POST /admin/bots`
- **THEN** the API returns 403

#### Scenario: Toggle enabled
- **WHEN** an admin PATCHes enabled to false
- **THEN** the bot is hidden from `GET /bots` shop listing

### Requirement: View stock and logs per bot

Admins SHALL view per-bot stock via `GET /admin/bots/:id/stock` and recent orders/exchanges/logs via `GET /admin/bots/:id/logs`.

#### Scenario: Admin sees bot stock
- **WHEN** an admin calls `GET /admin/bots/:id/stock`
- **THEN** the API returns the latest snapshot even if stale

#### Scenario: Admin sees bot logs
- **WHEN** an admin calls `GET /admin/bots/:id/logs`
- **THEN** the API returns recent orders and exchanges for that bot ordered by time descending

### Requirement: Rotate bot token

Admins SHALL rotate a bot's token via `POST /admin/bots/:id/rotate-token`.

#### Scenario: Rotate token
- **WHEN** an admin rotates a bot token
- **THEN** the API generates a new token, invalidates the old one, and returns the new token once

### Requirement: Admin UI behind ADMIN-only route guard

The `/admin/*` UI (bot management, stock, logs, token rotation) SHALL only render for authenticated ADMIN users, enforced by middleware with a client-side role sanity check as defense in depth. The admin area SHALL use its own layout and nav, separate from the shop area.

#### Scenario: Guest sees no admin UI
- **WHEN** an unauthenticated visitor or non-admin user navigates to any `/admin/*` page
- **THEN** they are redirected away (to `/login` or `/shop` per `web-role-routes`) and never see the admin UI

#### Scenario: Admin manages bots in admin layout
- **WHEN** an authenticated ADMIN opens `/admin/bots`
- **THEN** the bot list, create form, and admin nav render inside the admin layout

### Requirement: Admin presentation shell and bot table

The `/admin/*` area SHALL render in the Metronic-style shell (fixed dark navy sidebar 220px collapsible to 64px icons, light topbar with breadcrumb + search + avatar, light content) with sub-nav tabs (Tong quan / Bots / Don hang / Ty gia; non-Bots tabs may be placeholders). The bots view SHALL show a 4-card stat row (bots online/total, orders today, xu volume, frozen orders), a labeled create-bot grid form, and a datatable (name+type, enable toggle switch, rate, daily used/limit bar, relative heartbeat, actions: copy ID, enable/disable, rotate token) with a sort/filter bar. Token creation/rotation SHALL show the plain token once in a modal with copy button and "saved" confirm — never `alert()`.

#### Scenario: Admin stat overview
- **WHEN** an admin opens `/admin/bots`
- **THEN** stat cards, create form, and datatable render in the admin shell with table skeleton rows while loading

