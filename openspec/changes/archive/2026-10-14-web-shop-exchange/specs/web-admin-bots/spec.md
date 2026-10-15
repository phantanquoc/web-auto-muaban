## ADDED Requirements

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
