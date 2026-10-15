# web-shop-catalog

## Purpose

Public shop catalog and live bot stock consumed by the web frontend.
## Requirements
### Requirement: Bot listing for shop

The system SHALL expose `GET /bots` returning enabled bots with id, name, type (SELL or EXCHANGE), server/Map hint, and online status derived from last heartbeat.

#### Scenario: List enabled bots
- **WHEN** a client calls `GET /bots` (public or authenticated)
- **THEN** the API returns only bots where enabled=true with their type and online flag

#### Scenario: Online flag based on heartbeat
- **WHEN** a bot has pushed heartbeat within the last 90 seconds
- **THEN** the bot is considered online; otherwise offline

### Requirement: Live stock per bot

The system SHALL expose `GET /bots/:id/stock` returning live bag (`cd.q.v`) and chest (`cd.q.x`) counts per product, plus updatedAt and stale flag (true if updatedAt older than 90s).

#### Scenario: Return live stock
- **WHEN** a client calls `GET /bots/:id/stock` for a bot that has reported stock
- **THEN** the API returns per-product bag and chest counts with updatedAt

#### Scenario: Stale flag
- **WHEN** updatedAt is more than 90 seconds ago
- **THEN** the response includes stale=true

#### Scenario: Bot not reporting yet
- **WHEN** a bot has never reported stock
- **THEN** the API returns 200 with empty stock and updatedAt null

### Requirement: Product catalog from ban/items

The system SHALL sync the shop catalog from `ban/items/*.txt` (format `id:donGia:maxQty:maVp`) plus live stock; `GET /shop/products` returns products with price, maVp, and aggregated stock hint.

#### Scenario: List products
- **WHEN** a client calls `GET /shop/products`
- **THEN** the API returns products seeded from `ban/items` with id, donGia, maxQty, maVp

#### Scenario: Product references unknown item
- **WHEN** a product id has no live stock entry
- **THEN** it still appears in catalog with bag=0 and chest=0

### Requirement: Bot stock push every 30s

Bots SHALL push heartbeat and stock every ~30s via `POST /bot/heartbeat` and `POST /bot/stock {bag: [{id, qty}], chest: [{id, qty}]}` authenticated by bot token.

#### Scenario: Heartbeat updates online status
- **WHEN** a bot POSTs to `/bot/heartbeat` with valid token
- **THEN** the API updates lastHeartbeatAt to now

#### Scenario: Stock push persists snapshot
- **WHEN** a bot POSTs stock snapshot
- **THEN** the API persists per-bot bag/chest counts with now as updatedAt

### Requirement: Public catalog browsing with login-gated actions

The shop catalog pages SHALL remain viewable without authentication, but any mutating or user-scoped action SHALL require login and redirect unauthenticated users to `/login`.

#### Scenario: Guest browses catalog
- **WHEN** an unauthenticated visitor opens `/shop`
- **THEN** products with price and stock hints render normally

#### Scenario: Guest attempts to buy
- **WHEN** an unauthenticated visitor triggers a buy/order action
- **THEN** they are redirected to `/login` instead of calling the order API

#### Scenario: Guest opens wallet
- **WHEN** an unauthenticated visitor opens `/wallet`
- **THEN** they are redirected to `/login`

### Requirement: Catalog visual presentation

Catalog browsing SHALL use the dark storefront product cards, filters, skeletons, and empty states defined in `web-storefront-ui`. Prices SHALL be gold tabular `vi-VN` formatted; stock states SHALL use emerald (`Con N`) / rose (`Het hang`) with text labels.

#### Scenario: Card states
- **WHEN** products load, fail, or filter to zero
- **THEN** skeleton cards, an error block with Retry, or the empty state render respectively

